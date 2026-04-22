import { provideApolloClient } from '@vue/apollo-composable'
import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloLink } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { GraphQLErrorHandler, TokenManager } from '@/shared/utils/errorHandler'

// Smart retry logic for TokenManager initialization
let initializationRetries = 0;
const MAX_RETRIES = 3;
const RETRY_DELAY = 100;

const waitForTokenManager = async () => {
  // Check if TokenManager is properly initialized
  if (typeof TokenManager.getAccessToken === 'function') {
    return true;
  }
  
  if (initializationRetries >= MAX_RETRIES) {
    console.error('TokenManager initialization failed after maximum retries');
    return false;
  }
  
  initializationRetries++;
  console.log(`TokenManager not ready, retrying... (${initializationRetries}/${MAX_RETRIES})`);
  
  await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * initializationRetries));
  return waitForTokenManager();
};

const getAuthToken = async () => {
  // Wait for TokenManager to be ready
  const isReady = await waitForTokenManager();
  if (!isReady) {
    console.warn('TokenManager not available, proceeding without authentication');
    return null;
  }
  
  try {
    const token = TokenManager.getAccessToken();
    
    // Check if token is expired and try to refresh
    if (token && TokenManager.isTokenExpired(token)) {
      console.warn('Token expired, attempting refresh...');
      try {
        const newToken = await TokenManager.refreshAccessToken();
        return newToken;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      }
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || '/graphql/',
})

const authLink = setContext(async (_, { headers }) => {
  const token = await getAuthToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

const errorLink = onError((error) => {
  // Use enhanced GraphQL error handler
  GraphQLErrorHandler.handleGraphQLError(error, {
    context: 'apollo-client',
    timestamp: new Date().toISOString()
  })
  
  // Clear Apollo store on authentication errors
  const { graphQLErrors, networkError, operation, forward } = error
  const hasAuthError = graphQLErrors?.some(err => 
    err.extensions?.code === 'UNAUTHENTICATED'
  ) || networkError?.statusCode === 401
  
  if (hasAuthError) {
    console.log('401 Unauthorized detected, attempting token refresh and retry...')
    
    // Attempt to refresh token and retry the operation
    return TokenManager.refreshAccessToken()
      .then(newToken => {
        console.log('Token refreshed successfully, retrying operation...')
        
        // Create new operation with fresh token
        const oldHeaders = operation.getContext().headers || {}
        const newHeaders = {
          ...oldHeaders,
          authorization: `Bearer ${newToken}`
        }
        
        operation.setContext({ headers: newHeaders })
        
        // Retry the operation
        return forward(operation)
      })
      .catch(refreshError => {
        console.error('Token refresh failed, logging out:', refreshError)
        
        // Clear tokens and store
        TokenManager.clearAuthTokens()
        client.clearStore()
        
        // Don't retry - let the user login again
        return
      })
  }
})

// GraphQL Response Size Watcher
const RESPONSE_SIZE_THRESHOLD = parseInt(import.meta.env.VITE_GRAPHQL_RESPONSE_THRESHOLD) || 300 * 1024; // 300KB default

const responseSizeWatcher = new ApolloLink((operation, forward) => {
  const controller = new AbortController();
  
  // Set timeout to check response size during streaming
  const timeoutId = setTimeout(() => {
    if (controller.signal.aborted) return;
    
    // Check if operation is still pending (potential large response)
    console.warn(`\ud83d\ude80 Monitoring large operation: ${operation.operationName || 'Anonymous'}`);
  }, 5000); // 5 second timeout for large operations
  
  return forward(operation).map(result => {
    clearTimeout(timeoutId);
    
    const responseSize = JSON.stringify(result).length;
    
    if (responseSize > RESPONSE_SIZE_THRESHOLD) {
      // IMMEDIATELY ABORT the request
      controller.abort();
      
      // Show user-friendly error message
      const errorMessage = 'البيانات ضخمة جداً على جهازك، يرجى تصفية البحث';
      
      // Log to console for debugging
      console.error(`\n\n=== 🚨 REQUEST ABORTED ===`);
      console.error(`\ud83d\udcca Response Size: ${(responseSize / 1024).toFixed(2)}KB (Threshold: ${(RESPONSE_SIZE_THRESHOLD / 1024).toFixed(2)}KB)`);
      console.error(`\ud83d\udd0d Operation: ${operation.operationName || 'Anonymous'}`);
      console.error(`\ud83d\udce6 Variables:`, operation.variables);
      console.error(`\u274c User Message: ${errorMessage}`);
      console.error(`========================\n\n`);
      
      // Return error result instead of data
      return {
        errors: [{
          message: errorMessage,
          extensions: {
            code: 'RESPONSE_TOO_LARGE',
            size: responseSize,
            threshold: RESPONSE_SIZE_THRESHOLD,
            operation: operation.operationName
          }
        }],
        data: null
      };
    }
    
    return result;
  }).catch(error => {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      return {
        errors: [{
          message: 'البيانات ضخمة جداً على جهازك، يرجى تصفية البحث',
          extensions: {
            code: 'REQUEST_ABORTED',
            reason: 'Response size exceeded threshold'
          }
        }],
        data: null
      };
    }
    
    throw error;
  });
});

export const client = new ApolloClient({
  link: from([errorLink, responseSizeWatcher, authLink, httpLink]),
  cache: new InMemoryCache({
    possibleTypes: {
      // Add possible types to prevent FIELD errors
      ProductType: ['ProductType'],
      Query: ['Query'],
      Mutation: ['Mutation']
    },
    // Enhanced cache configuration for 4GB RAM systems
    typePolicies: {
      Query: {
        fields: {
          // Configure cache merging for products
          products: {
            keyArgs: ['filter', 'first', 'after', 'orderBy'],
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo || existing.pageInfo
              }
            }
          },
          // Configure cache for user orders
          userOrders: {
            keyArgs: ['filter', 'first', 'after', 'orderBy'],
            merge(existing = { edges: [], pageInfo: {} }, incoming) {
              return {
                ...incoming,
                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                pageInfo: incoming.pageInfo || existing.pageInfo
              }
            }
          }
        }
      },
      // Configure individual entity caching
      Product: {
        keyFields: ['id'],
        fields: {
          // Optimize product field caching
          images: {
            merge(existing = [], incoming) {
              return [...existing, ...incoming]
            }
          }
        }
      },
      Order: {
        keyFields: ['id']
      },
      User: {
        keyFields: ['id']
      }
    },
    // Enable garbage collection
    garbageCollection: true,
    // Set maximum cache size (prevents memory bloat)
    maxSize: 100, // Maximum 100 cached objects
    // Eviction policy: least recently used
    evictionPolicy: 'lru'
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      // Enable cache-and-network strategy for better UX
      fetchPolicy: 'cache-and-network'
    },
    query: {
      errorPolicy: 'all',
      // Use cache-first for better performance
      fetchPolicy: 'cache-first'
    }
  }
})

// Memory watcher for 4GB RAM protection
let memoryWatcher = null

const startMemoryWatcher = () => {
  if (memoryWatcher || !performance?.memory) {
    return
  }
  
  const MEMORY_THRESHOLD = parseInt(import.meta.env.VITE_MEMORY_THRESHOLD) || 45 * 1024 * 1024 // 45MB default for 4GB RAM systems
  
  memoryWatcher = setInterval(() => {
    const usedMemory = performance.memory.usedJSHeapSize
    const totalMemory = performance.memory.totalJSHeapSize
    
    console.log(`📊 Memory Monitor: ${(usedMemory / 1024 / 1024).toFixed(2)}MB used / ${(totalMemory / 1024 / 1024).toFixed(2)}MB total`)
    
    if (usedMemory > MEMORY_THRESHOLD) {
      console.warn(`🚨 Memory threshold exceeded (${(MEMORY_THRESHOLD / 1024 / 1024).toFixed(2)}MB), performing cache cleanup`)
      
      // Perform aggressive cache cleanup
      try {
        // Clear oldest cache entries
        const cache = client.extract()
        const cacheKeys = Object.keys(cache)
        
        // Sort by timestamp and remove oldest 30%
        const sortedKeys = cacheKeys.sort((a, b) => {
          const aTime = cache[a]?.__typename || 0
          const bTime = cache[b]?.__typename || 0
          return aTime - bTime
        })
        
        const keysToRemove = Math.floor(sortedKeys.length * 0.3)
        const oldestKeys = sortedKeys.slice(0, keysToRemove)
        
        oldestKeys.forEach(key => {
          client.cache.evict({ id: key })
        })
        
        // Force garbage collection
        client.cache.gc()
        
        // Trigger browser garbage collection if available
        if (window.gc) {
          window.gc()
        }
        
        console.log(`🗑️ Cleaned ${oldestKeys.length} oldest cache entries`)
      } catch (error) {
        console.error('Cache cleanup failed:', error)
      }
    }
  }, 20000) // Check every 20 seconds
  
  console.log('🔍 Memory watcher started for 4GB RAM protection')
}

const stopMemoryWatcher = () => {
  if (memoryWatcher) {
    clearInterval(memoryWatcher)
    memoryWatcher = null
    console.log('⏹️ Memory watcher stopped')
  }
}

// Auto-start memory watcher
startMemoryWatcher()

// Export memory management functions
export const memoryManager = {
  start: startMemoryWatcher,
  stop: stopMemoryWatcher,
  forceCleanup: () => {
    client.cache.gc()
    if (window.gc) window.gc()
  },
  getStats: () => {
    if (!performance?.memory) {
      return { error: 'Memory API not available' }
    }
    
    return {
      used: `${(performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    }
  }
}

export const isAuthenticated = () => {
  try {
    if (typeof TokenManager.getAccessToken !== 'function') {
      console.warn('TokenManager.getAccessToken not available');
      return false;
    }
    const token = TokenManager.getAccessToken();
    return !!token && !TokenManager.isTokenExpired(token);
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

export const getCurrentUserRole = () => {
  try {
    if (typeof TokenManager.getUserRole !== 'function') {
      console.warn('TokenManager.getUserRole not available');
      return 'guest';
    }
    return TokenManager.getUserRole();
  } catch (error) {
    console.error('Error getting user role:', error);
    return 'guest';
  }
}

export const hasRole = (requiredRole) => {
  const currentRole = getCurrentUserRole();
  return currentRole === requiredRole;
}

export const isAdmin = () => hasRole('admin');

export const isInvestor = () => hasRole('investor');

export const isCustomer = () => hasRole('customer');

export const logout = () => {
  try {
    if (typeof TokenManager.clearAuthTokens === 'function') {
      TokenManager.clearAuthTokens();
    } else {
      console.warn('TokenManager.clearAuthTokens not available, clearing localStorage manually');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userRole');
    }
    
    client.clearStore();
    
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  } catch (error) {
    console.error('Error during logout:', error);
    // Fallback logout
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

export const ApolloPlugin = {
  install(app) {
    provideApolloClient(client)
    app.config.globalProperties.$apollo = client
  }
}
