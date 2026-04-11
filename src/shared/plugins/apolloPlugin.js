import { provideApolloClient } from '@vue/apollo-composable'
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client/core'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'
import { useStorage } from '@vueuse/core'

const getAuthToken = () => {
  const authToken = useStorage('authToken', '')
  const accessToken = useStorage('accessToken', '')
  return authToken.value || accessToken.value || null
}

const httpLink = createHttpLink({
  uri: '/graphql/',
})

const authLink = setContext((_, { headers }) => {
  const token = getAuthToken()
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    }
  }
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (networkError) {
    console.error('[Network error]:', networkError)
    
    if (networkError.statusCode === 401) {
      console.warn('Authentication failed - clearing tokens and redirecting to login')
      
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
      
      client.clearStore()
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, extensions }) => {
      console.error(`[GraphQL error]: Message: ${message}`)
      
      if (extensions?.code === 'UNAUTHENTICATED') {
        console.warn('GraphQL authentication failed - clearing tokens')
        
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
        
        client.clearStore()
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    })
  }
})

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    possibleTypes: {
      // Add possible types to prevent FIELD errors
      ProductType: ['ProductType'],
      Query: ['Query'],
      Mutation: ['Mutation']
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

export const isAuthenticated = () => {
  const token = getAuthToken()
  return !!token
}

export const getCurrentUserRole = () => {
  const userRole = useStorage('userRole', '')
  return userRole.value || 'guest'
}

export const hasRole = (requiredRole) => {
  const currentRole = getCurrentUserRole()
  return currentRole === requiredRole
}

export const isAdmin = () => hasRole('admin')

export const isInvestor = () => hasRole('investor')

export const isCustomer = () => hasRole('customer')

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
  
  client.clearStore()
  
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

export const ApolloPlugin = {
  install(app) {
    provideApolloClient(client)
    app.config.globalProperties.$apollo = client
  }
}
