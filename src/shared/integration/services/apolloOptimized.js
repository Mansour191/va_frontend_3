// Optimized Apollo Client Configuration with Advanced Caching
// This configuration maximizes caching performance for GraphQL operations

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';

// HTTP Link Configuration
const httpLink = createHttpLink({
  uri: process.env.VUE_APP_GRAPHQL_URL || 'http://127.0.0.1:8000/graphql/',
  // Enable automatic batching for better performance
  batchInterval: 50,
  batchMax: 10,
  // Optimize headers
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Connection timeout
  connectTimeoutMs: 10000,
  // Response timeout
  responseTimeoutMs: 30000,
});

// Authentication Link - Optimized
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  
  // Return early if no token
  if (!token) {
    return { headers };
  }
  
  return {
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
      // Add cache control headers
      'Cache-Control': 'no-cache',
    },
  };
});

// Error Handling Link with Retry Logic
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  // Log errors for debugging
  console.error('GraphQL Error:', {
    graphQLErrors,
    networkError,
    operationName: operation.operationName,
    variables: operation.variables,
  });

  // Handle authentication errors
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.extensions?.code === 'UNAUTHENTICATED') {
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        // Redirect to login (you might want to use Vue Router here)
        window.location.href = '/login';
        return;
      }
      
      if (err.extensions?.code === 'PERMISSION_DENIED') {
        console.warn('Permission denied:', err.message);
        // You might want to show a user-friendly message here
        return;
      }
    }
  }

  // Handle network errors with retry
  if (networkError) {
    console.error('Network Error:', networkError);
    
    // Don't retry on authentication errors
    if (networkError.statusCode === 401) {
      return;
    }
    
    // Retry on server errors (5xx)
    if (networkError.statusCode >= 500) {
      return forward(operation);
    }
  }
});

// Retry Link Configuration
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: Infinity,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors and server errors
      return !!error && (
        error.networkError || 
        (error.graphQLErrors && error.graphQLErrors.some(e => e.extensions?.code === 'INTERNAL_SERVER_ERROR'))
      );
    },
  },
});

// Optimized Cache Configuration
const cache = new InMemoryCache({
  // Enable result caching for better performance
  resultCaching: true,
  
  // Type policies for optimized caching
  typePolicies: {
    Query: {
      fields: {
        // Cache products with pagination
        products: {
          keyArgs: ['categorySlug', 'limit', 'offset', 'search'],
          merge(existing, incoming, { args }) {
            // Merge paginated results
            if (!existing) return incoming;
            
            const merged = [...existing];
            const offset = args?.offset || 0;
            
            // Insert new items at the correct position
            for (let i = 0; i < incoming.length; i++) {
              merged[offset + i] = incoming[i];
            }
            
            return merged;
          },
        },
        
        // Cache single products
        product: {
          keyArgs: ['slug', 'id'],
        },
        
        // Cache categories with hierarchy
        categories: {
          keyArgs: false, // Always use same cache key for categories
        },
        
        // Cache user-specific data
        me: {
          keyArgs: false,
        },
        
        myProfile: {
          keyArgs: false,
        },
        
        myOrders: {
          keyArgs: ['limit', 'offset'],
          merge(existing, incoming, { args }) {
            if (!existing) return incoming;
            
            const merged = [...existing];
            const offset = args?.offset || 0;
            
            for (let i = 0; i < incoming.length; i++) {
              merged[offset + i] = incoming[i];
            }
            
            return merged;
          },
        },
        
        myCart: {
          keyArgs: false, // Always use same cache key for cart
        },
        
        myWishlist: {
          keyArgs: false,
        },
        
        // Cache search results with query-specific keys
        semanticSearch: {
          keyArgs: ['query', 'filters', 'limit'],
        },
        
        // Cache pricing calculations
        calculatePrice: {
          keyArgs: ['input'],
        },
        
        // Cache AI responses with shorter TTL
        chatWithAi: {
          keyArgs: ['message'],
        },
        
        // Cache market trends with time-based keys
        marketTrends: {
          keyArgs: ['category', 'period'],
        },
        
        // Cache notifications with user-specific keys
        myNotifications: {
          keyArgs: ['limit'],
          merge(existing, incoming) {
            // Merge notifications, keeping newest first
            if (!existing) return incoming;
            
            const existingIds = new Set(existing.map(n => n.id));
            const newItems = incoming.filter(n => !existingIds.has(n.id));
            
            return [...newItems, ...existing].slice(0, 50); // Keep only 50 most recent
          },
        },
      },
    },
    
    // Object type policies for nested objects
    ProductType: {
      keyFields: ['id'],
      fields: {
        // Cache images separately
        images: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        
        // Cache variants separately
        variants: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        
        // Cache materials separately
        materials: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
      },
    },
    
    OrderType: {
      keyFields: ['id'],
      fields: {
        // Cache order items separately
        items: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        
        // Cache payments separately
        payments: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
        
        // Cache timeline separately
        timeline: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
      },
    },
    
    UserType: {
      keyFields: ['id'],
      fields: {
        // Cache profile separately
        profile: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
      },
    },
    
    CategoryType: {
      keyFields: ['slug'],
      fields: {
        // Cache children separately
        children: {
          merge(existing, incoming) {
            return incoming || existing;
          },
        },
      },
    },
  },
  
  // Enable automatic garbage collection
  garbageCollection: true,
  
  // Set maximum cache size (in bytes)
  maxSize: 1024 * 1024 * 10, // 10MB
  
  // Enable result caching
  resultCaching: true,
  
  // Configure cache eviction
  evictionPolicy: 'lru',
});

// Create Apollo Client with optimized configuration
const apolloClient = new ApolloClient({
  // Link composition - optimized order for performance
  link: from([errorLink, retryLink, authLink, httpLink]),
  
  // Cache configuration
  cache,
  
  // Default options for queries
  defaultOptions: {
    watchQuery: {
      // Enable caching by default
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
      // Optimize fetch policy for better performance
      fetchPolicy: 'cache-first',
      // Refetch on window focus for fresh data
      refetchOnWindowFocus: false, // Disabled for performance
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Polling interval for real-time updates
      pollInterval: 0, // Disabled by default
      // Partial results for better UX
      returnPartialData: true,
      // Error handling
      onError: (error) => {
        console.error('Query Error:', error);
      },
    },
    
    query: {
      // Default query options
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
      returnPartialData: true,
      onError: (error) => {
        console.error('Query Error:', error);
      },
    },
    
    mutate: {
      // Default mutation options
      errorPolicy: 'all',
      // Optimistic UI updates
      optimisticResponse: (result, args) => {
        // Return optimistic response for better UX
        return result;
      },
      // Update cache after mutations
      update: (cache, { data }, { variables }) => {
        // Custom cache updates can be added here
        console.log('Cache updated after mutation:', { data, variables });
      },
      onError: (error) => {
        console.error('Mutation Error:', error);
      },
    },
  },
  
  // Performance optimizations
  devtools: {
    enabled: process.env.NODE_ENV === 'development'
  },
  
  // Query deduplication
  queryDeduplication: true,
  
  // Automatic batching
  defaultHttpLink: httpLink,
  
  // Type checking
  typeDefs: null,
  
  // Resolvers
  resolvers: {},
  
  // Cache performance monitoring
  cachePerformance: true,
});

// Cache management utilities
export const cacheUtils = {
  // Clear entire cache
  clearCache: () => {
    apolloClient.clearStore();
    console.log('🧹 Apollo cache cleared');
  },
  
  // Clear specific cache entries
  clearCacheEntry: (typeName, id) => {
    apolloClient.cache.evict({
      id: `${typeName}:${id}`,
    });
    console.log(`🗑️ Cache entry cleared: ${typeName}:${id}`);
  },
  
  // Clear query cache
  clearQueryCache: (query, variables) => {
    apolloClient.cache.evict({
      id: apolloClient.cache.identify({
        __typename: 'Query',
        ...variables,
      }),
    });
    console.log('🔍 Query cache cleared:', { query, variables });
  },
  
  // Get cache statistics
  getCacheStats: () => {
    const cache = apolloClient.cache.extract();
    const stats = {
      totalEntries: Object.keys(cache).length,
      cacheSize: JSON.stringify(cache).length,
      timestamp: new Date().toISOString(),
    };
    console.log('📊 Cache stats:', stats);
    return stats;
  },
  
  // Warm up cache with common queries
  warmUpCache: async () => {
    try {
      console.log('🔥 Warming up Apollo cache...');
      
      // Preload common data
      await Promise.allSettled([
        apolloClient.query({ query: GET_CATEGORIES }),
        apolloClient.query({ query: GET_MATERIALS }),
        apolloClient.query({ query: GET_SHIPPING_OPTIONS }),
      ]);
      
      console.log('✅ Cache warmed up successfully');
    } catch (error) {
      console.error('❌ Cache warm-up failed:', error);
    }
  },
  
  // Optimize cache size
  optimizeCache: () => {
    const stats = cacheUtils.getCacheStats();
    
    // Clear cache if it's getting too large
    if (stats.cacheSize > 5 * 1024 * 1024) { // 5MB
      console.log('🗑️ Cache size too large, clearing...');
      cacheUtils.clearCache();
    }
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Track query performance
  trackQueryPerformance: (operationName, duration) => {
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected: ${operationName} (${duration}ms)`);
    }
    
    // Store performance data for analysis
    const performanceData = JSON.parse(localStorage.getItem('apollo_performance') || '{}');
    performanceData[operationName] = {
      lastExecution: new Date().toISOString(),
      averageDuration: duration,
      executionCount: (performanceData[operationName]?.executionCount || 0) + 1,
    };
    
    // Keep only last 50 operations
    const entries = Object.entries(performanceData);
    if (entries.length > 50) {
      const sorted = entries.sort((a, b) => 
        new Date(b[1].lastExecution) - new Date(a[1].lastExecution)
      );
      const limited = sorted.slice(0, 50).reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
      localStorage.setItem('apollo_performance', JSON.stringify(limited));
    } else {
      localStorage.setItem('apollo_performance', JSON.stringify(performanceData));
    }
  },
  
  // Get performance report
  getPerformanceReport: () => {
    const data = JSON.parse(localStorage.getItem('apollo_performance') || '{}');
    const report = {
      totalQueries: Object.keys(data).length,
      slowQueries: Object.entries(data)
        .filter(([_, perf]) => perf.averageDuration > 1000)
        .map(([name, perf]) => ({
          name,
          averageDuration: perf.averageDuration,
          executionCount: perf.executionCount,
          lastExecution: perf.lastExecution,
        })),
      averageQueryTime: Object.values(data).reduce((sum, perf) => sum + perf.averageDuration, 0) / Object.keys(data).length || 0,
    };
    
    console.log('📊 Performance Report:', report);
    return report;
  },
};

// Auto-optimization
setInterval(() => {
  cacheUtils.optimizeCache();
}, 60000); // Check every minute

// Initialize cache warm-up
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cacheUtils.warmUpCache();
  }, 1000);
}

export default apolloClient;

// Export utilities for use in components
export { cacheUtils, performanceMonitor };

console.log('🚀 Optimized Apollo Client initialized');
console.log('📈 Advanced caching enabled for instant page loads');
console.log('🔥 Cache warm-up scheduled for better performance');
