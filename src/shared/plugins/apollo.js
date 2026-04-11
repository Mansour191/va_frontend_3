// src/plugins/apollo.js

import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useStorage } from '@vueuse/core'
import { useRouter } from 'vue-router'

// Get auth token from useStorage
const getAuthToken = () => {
  const authToken = useStorage('authToken', '')
  const accessToken = useStorage('accessToken', '')
  return authToken.value || accessToken.value || null
}

// HTTP Link for GraphQL endpoint
const httpLink = createHttpLink({
  uri: '/graphql/',
})

// Auth Link - Inject JWT token into headers
const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

// Error Link - Handle 401 Unauthorized
const errorLink = onError(({ graphQLErrors, networkError, response, operation }) => {
  if (networkError) {
    console.error('[Network error]:', networkError)
    
    // Handle 401 Unauthorized
    if (networkError.statusCode === 401) {
      console.warn('Authentication failed - clearing tokens and redirecting to login')
      
      // Clear all auth tokens
      const authToken = useStorage('authToken', '')
      const accessToken = useStorage('accessToken', '')
      const refreshToken = useStorage('refreshToken', '')
      const userData = useStorage('userData', null)
      const userRole = useStorage('userRole', '')
      
      authToken.value = ''
      accessToken.value = ''
      refreshToken.value = ''
      userData.value = null
      userRole.value = ''
      
      // Clear Apollo cache
      client.clearStore()
      
      // Redirect to login
      const router = useRouter()
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
    
    // Handle other network errors
    if (networkError.statusCode >= 500) {
      console.error('Server error - please try again later')
    }
  }
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
      
      // Handle authentication errors from GraphQL
      if (extensions?.code === 'UNAUTHENTICATED' || extensions?.exception?.code === 401) {
        console.warn('GraphQL authentication failed - clearing tokens')
        
        // Clear tokens
        const authToken = useStorage('authToken', '')
        const accessToken = useStorage('accessToken', '')
        const refreshToken = useStorage('refreshToken', '')
        const userData = useStorage('userData', null)
        const userRole = useStorage('userRole', '')
        
        authToken.value = ''
        accessToken.value = ''
        refreshToken.value = ''
        userData.value = null
        userRole.value = ''
        
        // Clear Apollo cache
        client.clearStore()
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    })
  }
})

// Create Apollo Client
export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          // Cache user data with proper keying
          me: {
            merge(existing, incoming) {
              return incoming
            }
          },
          // Cache products with proper keying
          products: {
            merge(existing = [], incoming) {
              return incoming
            }
          },
          // Cache orders with proper keying
          orders: {
            merge(existing = [], incoming) {
              return incoming
            }
          }
        }
      }
    }
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true
    },
    query: {
      errorPolicy: 'all'
    }
  }
})

// Export for use in components
export default client

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

// Helper function to get current user role
export const getCurrentUserRole = () => {
  const userRole = useStorage('userRole', '')
  return userRole.value || 'guest'
}

// Helper function to check if user has specific role
export const hasRole = (requiredRole) => {
  const currentRole = getCurrentUserRole()
  return currentRole === requiredRole
}

// Helper function to check if user is admin
export const isAdmin = () => hasRole('admin')

// Helper function to check if user is investor
export const isInvestor = () => hasRole('investor')

// Helper function to check if user is customer
export const isCustomer = () => hasRole('customer')

// Helper function to logout
export const logout = () => {
  const authToken = useStorage('authToken', '')
  const accessToken = useStorage('accessToken', '')
  const refreshToken = useStorage('refreshToken', '')
  const userData = useStorage('userData', null)
  const userRole = useStorage('userRole', '')
  
  authToken.value = ''
  accessToken.value = ''
  refreshToken.value = ''
  userData.value = null
  userRole.value = ''
  
  // Clear Apollo cache
  client.clearStore()
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
