import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { useStorage } from '@vueuse/core';

const getAuthToken = () => {
  const authToken = useStorage('authToken', '');
  const accessToken = useStorage('accessToken', '');
  return authToken.value || accessToken.value || null;
}

const httpLink = createHttpLink({
  uri: '/graphql/', // Use proxy in development
  credentials: 'same-origin'
});

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken();
  if (token) {
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      }
    }
  }
  return { headers };
});

const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (networkError) {
    console.error('[Network error]:', networkError);
    // Don't crash the app on network errors
    if (networkError.message.includes('Failed to fetch')) {
      console.warn('⚠️ GraphQL endpoint unavailable, using fallback mode');
    }
  }
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: Message: ${message}`);
    });
  }
});

// Create Apollo Client instance for services
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    possibleTypes: {
      // Add possible types to prevent FIELD errors
      ProductType: ['ProductType'],
      Query: ['Query'],
      Mutation: ['Mutation'],
      AIHealthType: ['AIHealthType']
    }
  }),
  devtools: {
    enabled: true
  },
  defaultOptions: {
    query: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-first'
    },
    watchQuery: {
      errorPolicy: 'all',
      fetchPolicy: 'cache-and-network'
    }
  }
});

export default apolloClient;
