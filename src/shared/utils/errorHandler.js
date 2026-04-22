// Global Error Handler to prevent app crashes
import { useMutation } from '@apollo/client'
import { REFRESH_TOKEN_MUTATION } from '@/integration/graphql/me.graphql'

class GlobalErrorHandler {
  constructor() {
    this.setupErrorHandlers();
  }

  setupErrorHandlers() {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('🚨 Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise,
        timestamp: new Date().toISOString()
      });
      
      // Prevent the default unhandled rejection behavior
      event.preventDefault();
      
      // Log specific error types
      if (event.reason?.message?.includes('Failed to fetch')) {
        console.warn('⚠️ Network error detected, app will continue in fallback mode');
      }
      
      if (event.reason?.message?.includes('getInstance is not a function')) {
        console.warn('⚠️ Singleton pattern error, service will use fallback');
      }
    });

    // Handle general JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('🚨 JavaScript Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        timestamp: new Date().toISOString()
      });
      
      // Prevent error from crashing the app
      event.preventDefault();
    });

    // Handle Vue errors if Vue is available
    if (window.Vue && window.Vue.config) {
      window.Vue.config.errorHandler = (err, vm, info) => {
        console.error('🚨 Vue Error:', {
          error: err,
          component: vm?.$options?.name || 'Unknown',
          info: info,
          timestamp: new Date().toISOString()
        });
      };
    }
  }

  // Method to safely execute functions with error handling
  safeExecute(fn, fallback = null, context = 'Unknown') {
    try {
      return fn();
    } catch (error) {
      console.error(`🚨 Error in ${context}:`, error);
      return fallback;
    }
  }

  // Method to safely execute async functions with error handling
  async safeExecuteAsync(fn, fallback = null, context = 'Unknown') {
    try {
      return await fn();
    } catch (error) {
      console.error(`🚨 Async Error in ${context}:`, error);
      return fallback;
    }
  }
}

// Enhanced GraphQL Error Handler
export class GraphQLErrorHandler {
  static handleGraphQLError(error, context = {}) {
    const { graphQLErrors, networkError } = error
    
    if (graphQLErrors) {
      graphQLErrors.forEach((gqlError) => {
        this.handleSpecificGraphQLError(gqlError, context)
      })
    }
    
    if (networkError) {
      this.handleNetworkError(networkError, context)
    }
  }
  
  static handleSpecificGraphQLError(gqlError, context) {
    const { message, extensions, path } = gqlError
    const errorCode = extensions?.code
    
    console.error(`[GraphQL Error] ${errorCode}: ${message}`, { path, context })
    
    switch (errorCode) {
      case 'GRAPHQL_VALIDATION_FAILED':
        this.handleValidationError(message, extensions?.validationErrors)
        break
        
      case 'BAD_USER_INPUT':
        this.handleUserInputError(message, extensions?.fields)
        break
        
      case 'UNAUTHENTICATED':
        this.handleAuthenticationError(message)
        break
        
      case 'FORBIDDEN':
        this.handleAuthorizationError(message)
        break
        
      case 'INTERNAL_SERVER_ERROR':
        this.handleInternalError(message)
        break
        
      default:
        this.handleGenericError(message, extensions)
    }
  }
  
  static handleValidationError(message, validationErrors = []) {
    console.warn('Validation Error:', message, validationErrors)
    
    // Store validation errors for UI components (with size limit)
    if (validationErrors.length > 0) {
      const limitedErrors = validationErrors.slice(0, 10) // Limit to 10 errors
      localStorage.setItem('lastValidationErrors', JSON.stringify({
        errors: limitedErrors,
        timestamp: Date.now(),
        message
      }))
    }
    
    // Emit custom event for validation errors
    window.dispatchEvent(new CustomEvent('graphql-validation-error', {
      detail: { message, validationErrors: limitedErrors }
    }))
  }
  
  static handleUserInputError(message, fields = []) {
    console.warn('User Input Error:', message, fields)
    
    window.dispatchEvent(new CustomEvent('graphql-user-input-error', {
      detail: { message, fields }
    }))
  }
  
  static handleAuthenticationError(message) {
    console.warn('Authentication Error:', message)
    
    // Clear tokens and redirect to login
    TokenManager.clearAuthTokens()
    
    window.dispatchEvent(new CustomEvent('auth-expired', {
      detail: { message }
    }))
  }
  
  static handleAuthorizationError(message) {
    console.warn('Authorization Error:', message)
    
    window.dispatchEvent(new CustomEvent('auth-forbidden', {
      detail: { message }
    }))
  }
  
  static handleInternalError(message) {
    console.error('Internal Server Error:', message)
    
    window.dispatchEvent(new CustomEvent('server-error', {
      detail: { message }
    }))
  }
  
  static handleGenericError(message, extensions) {
    console.error('Generic GraphQL Error:', message, extensions)
    
    window.dispatchEvent(new CustomEvent('graphql-error', {
      detail: { message, extensions }
    }))
  }
  
  static handleNetworkError(networkError, context) {
    console.error('Network Error:', networkError)
    
    if (networkError.statusCode === 401) {
      this.handleAuthenticationError('Session expired')
    } else if (networkError.statusCode === 403) {
      this.handleAuthorizationError('Access forbidden')
    } else if (networkError.statusCode >= 500) {
      this.handleInternalError('Server error occurred')
    } else {
      window.dispatchEvent(new CustomEvent('network-error', {
        detail: { 
          message: networkError.message,
          statusCode: networkError.statusCode,
          context
        }
      }))
    }
  }
  
  static getValidationErrors() {
    try {
      const stored = localStorage.getItem('lastValidationErrors')
      if (!stored) return []
      
      const data = JSON.parse(stored)
      
      // Check if data is expired (5 minutes)
      const now = Date.now()
      const maxAge = 5 * 60 * 1000 // 5 minutes
      
      if (data.timestamp && (now - data.timestamp) > maxAge) {
        console.log('🧹 Cleaning expired validation errors')
        localStorage.removeItem('lastValidationErrors')
        return []
      }
      
      return data.errors || []
    } catch (error) {
      console.error('Error parsing validation errors:', error)
      localStorage.removeItem('lastValidationErrors')
      return []
    }
  }
  
  static clearValidationErrors() {
    localStorage.removeItem('lastValidationErrors')
    console.log('🧹 Validation errors cleared')
  }
  
  // Auto-cleanup validation errors on page load
  static cleanupExpiredValidationErrors() {
    const stored = localStorage.getItem('lastValidationErrors')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        const now = Date.now()
        const maxAge = 5 * 60 * 1000 // 5 minutes
        
        if (data.timestamp && (now - data.timestamp) > maxAge) {
          localStorage.removeItem('lastValidationErrors')
          console.log('🧹 Auto-cleaned expired validation errors')
        }
      } catch (error) {
        localStorage.removeItem('lastValidationErrors')
      }
    }
  }
}

// Enhanced Token Management with RefreshQueue
export class RefreshQueue {
  static instance = null
  static isRefreshing = false
  static refreshPromise = null
  static pendingRequests = []
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new RefreshQueue()
    }
    return this.instance
  }
  
  async enqueueRefresh() {
    if (this.isRefreshing) {
      console.log('🔄 Token refresh already in progress, queuing request...')
      return this.refreshPromise
    }
    
    this.isRefreshing = true
    this.refreshPromise = this.performRefresh()
    
    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }
  
  async performRefresh() {
    const refreshToken = TokenManager.getRefreshToken()
    if (!refreshToken) {
      throw new Error('No refresh token available')
    }
    
    try {
      console.log('🔄 Starting token refresh...')
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin')
      
      const result = await apolloClient.mutate({
        mutation: REFRESH_TOKEN_MUTATION,
        variables: {}
      })
      
      if (result.data?.refreshToken?.success) {
        const { token, refreshToken: newRefreshToken, user } = result.data.refreshToken
        TokenManager.setTokens(token, newRefreshToken, user)
        console.log('✅ Token refresh successful')
        return token
      } else {
        throw new Error(result.data?.refreshToken?.message || 'Token refresh failed')
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error)
      TokenManager.clearAuthTokens()
      throw error
    }
  }
}

// Token Management Utilities
export class TokenManager {
  static setTokens(accessToken, refreshToken = null, userData = {}) {
    localStorage.setItem('token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken)
    }
    if (userData && Object.keys(userData).length > 0) {
      localStorage.setItem('userData', JSON.stringify(userData))
      localStorage.setItem('userRole', userData.role || 'user')
    }
  }
  
  static getAccessToken() {
    return localStorage.getItem('token')
  }
  
  static getRefreshToken() {
    return localStorage.getItem('refreshToken')
  }
  
  static getUserData() {
    const userData = localStorage.getItem('userData')
    return userData ? JSON.parse(userData) : {}
  }
  
  static getUserRole() {
    return localStorage.getItem('userRole') || 'guest'
  }
  
  static isTokenExpired(token) {
    if (!token) return true
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp < currentTime
    } catch (error) {
      console.error('Error checking token expiration:', error)
      return true
    }
  }
  
  static async refreshAccessToken() {
    const refreshQueue = RefreshQueue.getInstance()
    return refreshQueue.enqueueRefresh()
  }
  
  static clearAuthTokens() {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('userData')
    localStorage.removeItem('userRole')
    localStorage.removeItem('lastValidationErrors')
  }
}

// Create and export singleton instance
const globalErrorHandler = new GlobalErrorHandler();

// Initialize auto-cleanup on page load
if (typeof window !== 'undefined') {
  // Clean up expired validation errors on page load
  GraphQLErrorHandler.cleanupExpiredValidationErrors()
  
  // Set up periodic cleanup every 5 minutes
  setInterval(() => {
    GraphQLErrorHandler.cleanupExpiredValidationErrors()
  }, 5 * 60 * 1000)
}

export default globalErrorHandler;
