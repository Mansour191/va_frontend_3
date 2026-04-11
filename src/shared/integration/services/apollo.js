import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import apiErrorLogger from '@/shared/services/http/ApiErrorLogger.js';

const resolveGraphqlUrl = () => {
  const envUrl =
    import.meta.env.VITE_GRAPHQL_URL ||
    import.meta.env.VITE_API_URL ||
    '';
  const normalized = String(envUrl).trim().replace(/\/+$/, '');
  // Use proxy path for development, direct URL for production
  if (import.meta.env.DEV) {
    return '/graphql/';  // Will be proxied to backend
  }
  return normalized ? `${normalized}/graphql/` : 'http://127.0.0.1:8000/graphql/';
};

const httpLink = createHttpLink({
  uri: resolveGraphqlUrl(),
  // Enhanced error handling for network issues
  fetch: (uri, options) => {
    console.log(`🚀 GraphQL Request: ${options?.method || 'POST'} ${uri}`);
    
    return fetch(uri, options).then(response => {
      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.error('❌ Server returned HTML instead of JSON - likely a 404 or server error');
        const error = new Error('ServerParseError: Unexpected HTML response instead of JSON');
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = uri;
        error.config = { method: options?.method || 'POST', uri };
        error.isServerParseError = true;
        
        apiErrorLogger.logError(error, {
          type: 'SERVER_PARSE_ERROR',
          uri,
          method: options?.method || 'POST',
          responseStatus: response.status,
          contentType
        });
        
        throw error;
      }
      
      if (!response.ok) {
        const error = new Error(`GraphQL HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = uri;
        error.config = { method: options?.method || 'POST', uri };
        
        apiErrorLogger.logError(error, {
          type: 'GRAPHQL_HTTP_ERROR',
          uri,
          method: options?.method || 'POST',
          responseStatus: response.status
        });
      } else {
        console.log(`✅ GraphQL Success: ${options?.method || 'POST'} ${uri}`);
      }
      
      return response;
    }).catch(error => {
      // Don't log the same error twice if we already logged it above
      if (!error.isServerParseError) {
        apiErrorLogger.logError(error, {
          type: 'GRAPHQL_NETWORK_ERROR',
          uri,
          method: options?.method || 'POST',
          networkError: true
        });
      }
      throw error;
    });
  }
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(error => {
      apiErrorLogger.logError(new Error(error.message), {
        type: 'GRAPHQL_ERROR',
        operationName: operation.operationName,
        variables: operation.variables,
        extensions: error.extensions,
        path: error.path
      });
    });
  }
  
  if (networkError) {
    apiErrorLogger.logError(networkError, {
      type: 'GRAPHQL_NETWORK_ERROR',
      operationName: operation.operationName,
      variables: operation.variables
    });
  }
  
  // Forward the operation to continue
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: authLink.concat(errorLink).concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge(_, incoming) {
              return incoming;
            },
          },
          categories: {
            merge(_, incoming) {
              return incoming;
            },
          },
          checkAIHealth: {
            merge(_, incoming) {
              return incoming;
            },
          },
          aiHealth: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  // Enhanced error handling
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network',
    },
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first',
    },
  },
  // Add devtools for debugging
  devtools: {
    enabled: import.meta.env.DEV
  },
});

export default apolloClient;
