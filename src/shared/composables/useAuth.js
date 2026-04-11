// src/composables/useAuth.js
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useStorage } from '@vueuse/core'
import { useIdle } from '@vueuse/core'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { logout, isAuthenticated, getCurrentUserRole } from '@/shared/plugins/apolloPlugin'

// GraphQL Mutations
const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        role
        isStaff
        isActive
      }
    }
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      success
      message
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        role
        isStaff
        isActive
      }
    }
  }
`

const SOCIAL_LOGIN_MUTATION = gql`
  mutation SocialLogin($provider: String!, $accessToken: String!) {
    socialLogin(provider: $provider, accessToken: $accessToken) {
      success
      message
      token
      refreshToken
      user {
        id
        username
        email
        firstName
        lastName
        role
        isStaff
        isActive
      }
    }
  }
`

const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
      role
      isStaff
      isActive
      lastLogin
    }
  }
`

const REFRESH_TOKEN_MUTATION = gql`
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      success
      token
      refreshToken
    }
  }
`

// Auth composable
export function useAuth() {
  const router = useRouter()
  
  // Reactive state
  const loading = ref(false)
  const error = ref(null)
  const user = ref(null)
  
  // Persistent storage
  const authToken = useStorage('authToken', '')
  const accessToken = useStorage('accessToken', '')
  const refreshToken = useStorage('refreshToken', '')
  const userData = useStorage('userData', null)
  const userRole = useStorage('userRole', '')
  
  // Computed properties
  const isAuthenticatedUser = computed(() => !!authToken.value && !!userData.value)
  const currentUser = computed(() => userData.value)
  const currentUserRole = computed(() => userRole.value || 'guest')
  const isAdmin = computed(() => currentUserRole.value === 'admin')
  const isInvestor = computed(() => currentUserRole.value === 'investor')
  const isCustomer = computed(() => currentUserRole.value === 'customer')
  
  // Idle detection (10 minutes)
  const { idle } = useIdle(10 * 60 * 1000) // 10 minutes in milliseconds
  
  // Auto-logout on idle
  if (idle.value && isAuthenticatedUser.value) {
    console.warn('User idle for 10 minutes - logging out for security')
    performLogout()
  }
  
  // Login function
  const login = async (credentials) => {
    loading.value = true
    error.value = null
    
    try {
      const { mutate: loginMutation } = useMutation(LOGIN_MUTATION)
      
      const { data } = await loginMutation({
        input: {
          username: credentials.username || credentials.email,
          password: credentials.password
        }
      })
      
      if (data.value?.login?.success) {
        const { token, refreshToken: refresh, user: userData } = data.value.login
        
        // Store auth data
        authToken.value = token
        refreshToken.value = refresh
        userData.value = userData
        userRole.value = userData.role || 'customer'
        
        // Update reactive user
        user.value = userData
        
        // Store in Apollo client cache
        client.cache.writeQuery({
          query: ME_QUERY,
          data: { me: userData }
        })
        
        return {
          success: true,
          user: userData,
          role: userData.role || 'customer'
        }
      } else {
        throw new Error(data.value?.login?.message || 'Invalid credentials')
      }
    } catch (err) {
      // Generic error message to prevent account enumeration
      const errorMessage = err.message || 'Invalid credentials'
      error.value = errorMessage
      console.error('Login error:', err)
      
      return {
        success: false,
        message: errorMessage
      }
    } finally {
      loading.value = false
    }
  }
  
  // Register function
  const register = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const { mutate: registerMutation } = useMutation(REGISTER_MUTATION)
      
      const { data } = await registerMutation({
        input: {
          username: userData.username || userData.email,
          email: userData.email,
          firstName: userData.name?.split(' ')[0] || '',
          lastName: userData.name?.split(' ').slice(1).join(' ') || '',
          password: userData.password,
          agreeTerms: userData.agreeTerms
        }
      })
      
      if (data.value?.register?.success) {
        const { token, refreshToken: refresh, user: newUser } = data.value.register
        
        // Store auth data
        authToken.value = token
        refreshToken.value = refresh
        userData.value = newUser
        userRole.value = newUser.role || 'customer'
        
        // Update reactive user
        user.value = newUser
        
        // Store in Apollo client cache
        client.cache.writeQuery({
          query: ME_QUERY,
          data: { me: newUser }
        })
        
        return {
          success: true,
          user: newUser,
          role: newUser.role || 'customer'
        }
      } else {
        throw new Error(data.value?.register?.message || 'Registration failed')
      }
    } catch (err) {
      error.value = err.message || 'Registration failed'
      console.error('Registration error:', err)
      
      return {
        success: false,
        message: err.message || 'Registration failed'
      }
    } finally {
      loading.value = false
    }
  }
  
  // Social login function
  const socialLogin = async (provider, socialToken) => {
    loading.value = true
    error.value = null
    
    try {
      const { mutate: socialLoginMutation } = useMutation(SOCIAL_LOGIN_MUTATION)
      
      const { data } = await socialLoginMutation({
        provider,
        accessToken: socialToken
      })
      
      if (data.value?.socialLogin?.success) {
        const { token, refreshToken: refresh, user: newUser } = data.value.socialLogin
        
        // Store auth data
        authToken.value = token
        refreshToken.value = refresh
        userData.value = newUser
        userRole.value = newUser.role || 'customer'
        
        // Update reactive user
        user.value = newUser
        
        // Store in Apollo client cache
        client.cache.writeQuery({
          query: ME_QUERY,
          data: { me: newUser }
        })
        
        return {
          success: true,
          user: newUser,
          role: newUser.role || 'customer'
        }
      } else {
        throw new Error(data.value?.socialLogin?.message || 'Social login failed')
      }
    } catch (err) {
      error.value = err.message || 'Social login failed'
      console.error('Social login error:', err)
      
      return {
        success: false,
        message: err.message || 'Social login failed'
      }
    } finally {
      loading.value = false
    }
  }
  
  // Logout function
  const performLogout = () => {
    logout()
    user.value = null
    error.value = null
  }
  
  // Refresh token function
  const refreshAuthToken = async () => {
    if (!refreshToken.value) {
      throw new Error('No refresh token available')
    }
    
    try {
      const { mutate: refreshMutation } = useMutation(REFRESH_TOKEN_MUTATION)
      
      const { data } = await refreshMutation({
        refreshToken: refreshToken.value
      })
      
      if (data.value?.refreshToken?.success) {
        const { token, refreshToken: newRefresh } = data.value.refreshToken
        
        authToken.value = token
        refreshToken.value = newRefresh
        
        return true
      } else {
        throw new Error('Token refresh failed')
      }
    } catch (err) {
      console.error('Token refresh error:', err)
      performLogout()
      return false
    }
  }
  
  // Get current user
  const getCurrentUser = async () => {
    if (!authToken.value) {
      return null
    }
    
    try {
      const { result } = useQuery(ME_QUERY)
      
      if (result.value?.me) {
        user.value = result.value.me
        userData.value = result.value.me
        userRole.value = result.value.me.role || 'customer'
        
        return result.value.me
      }
    } catch (err) {
      console.error('Get current user error:', err)
      performLogout()
      return null
    }
  }
  
  // Initialize auth state
  const initializeAuth = async () => {
    if (authToken.value && !userData.value) {
      await getCurrentUser()
    }
  }
  
  return {
    // State
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    user: computed(() => user.value),
    isAuthenticated: isAuthenticatedUser,
    currentUser,
    currentUserRole,
    isAdmin,
    isInvestor,
    isCustomer,
    idle,
    
    // Methods
    login,
    register,
    socialLogin,
    logout: performLogout,
    refreshAuthToken,
    getCurrentUser,
    initializeAuth
  }
}

// Export singleton instance
export default useAuth
