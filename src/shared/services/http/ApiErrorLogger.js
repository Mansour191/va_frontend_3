// Global API Error Logger - Logs all API errors to terminal
class ApiErrorLogger {
  constructor() {
    this.isEnabled = true;
    this.setupFetchInterceptor();
    this.setupApolloInterceptor();
  }

  // Enhanced error logging with Arabic support
  logError(error, context = {}) {
    if (!this.isEnabled) return;

    // Classify error first
    const errorType = this.classifyError(error);
    
    // Ignore Apollo initialization errors to reduce console noise
    if (errorType === 'APOLLO_INITIALIZATION_ERROR') {
      return;
    }

    const timestamp = new Date().toISOString();
    
    // Enhanced error information extraction with fallbacks
    const errorInfo = {
      timestamp,
      type: 'API_ERROR',
      context,
      error: {
        message: error.message || error.name || 'Unknown error',
        status: error.status || error.response?.status || error.statusCode || error.code || 'UNKNOWN',
        statusText: error.statusText || error.response?.statusText || 'No status text',
        url: error.config?.url || error.url || error.request?.responseURL || context.url || 'UNKNOWN',
        method: error.config?.method || error.method || context.method || 'UNKNOWN',
        stack: error.stack,
        // Additional context
        requestId: context.requestId || this.generateRequestId(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server',
        timestamp: timestamp,
        // Error type classification
        errorType: errorType,
        // Response data if available
        data: error.response?.data || error.data || null
      }
    };

    // Terminal logging with emojis for visibility
    console.group(`🔴 API ERROR [${timestamp}]`);
    console.error('❌ Error:', errorInfo.error.message);
    console.error('📍 URL:', errorInfo.error.url);
    console.error('🔧 Method:', errorInfo.error.method);
    console.error('📊 Status:', errorInfo.error.status, errorInfo.error.statusText);
    console.error('🆔 Request ID:', errorInfo.error.requestId);
    console.error('🏷️ Error Type:', errorInfo.error.errorType);
    console.error('📝 Context:', context);
    console.error('🔍 Full Error:', error);
    console.groupEnd();

    // Arabic error logging
    console.group(`🔴 خطأ API [${timestamp}]`);
    console.error('❌ الخطأ:', errorInfo.error.message);
    console.error('📍 الرابط:', errorInfo.error.url);
    console.error('🔧 الطريقة:', errorInfo.error.method);
    console.error('📊 الحالة:', errorInfo.error.status, errorInfo.error.statusText);
    console.error('🏷️ نوع الخطأ:', errorInfo.error.errorType);
    console.groupEnd();

    // Store error for debugging
    this.storeError(errorInfo);
  }

  // Classify error types for better debugging
  classifyError(error) {
    // Ignore Apollo-related unknown errors during initialization
    if (error.message?.includes('Apollo') || error.message?.includes('GraphQL') || error.message?.includes('context')) {
      return 'APOLLO_INITIALIZATION_ERROR';
    }
    
    if (error.name === 'AbortError' || error.message.includes('aborted')) {
      return 'ABORT_ERROR';
    }
    if (error.message.includes('timeout')) {
      return 'TIMEOUT_ERROR';
    }
    if (error.status === 404 || error.response?.status === 404) {
      return 'NOT_FOUND_ERROR';
    }
    if (error.status === 401 || error.response?.status === 401) {
      return 'AUTH_ERROR';
    }
    if (error.status === 500 || error.response?.status === 500) {
      return 'SERVER_ERROR';
    }
    if (error.status === 0 || error.response?.status === 0) {
      return 'NETWORK_ERROR';
    }
    return 'UNKNOWN_ERROR';
  }

  // Generate unique request ID for tracking
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Store errors in localStorage for debugging
  storeError(errorInfo) {
    try {
      const errors = JSON.parse(localStorage.getItem('api_errors') || '[]');
      errors.unshift(errorInfo);
      // Keep only last 50 errors
      if (errors.length > 50) errors.pop();
      localStorage.setItem('api_errors', JSON.stringify(errors));
    } catch (e) {
      console.warn('Failed to store error:', e);
    }
  }

  // Setup fetch interceptor
  setupFetchInterceptor() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Log non-2xx responses
        if (!response.ok) {
          const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
          error.status = response.status;
          error.statusText = response.statusText;
          error.url = args[0];
          this.logError(error, { type: 'FETCH_ERROR', response });
        }
        
        return response;
      } catch (error) {
        this.logError(error, { type: 'FETCH_NETWORK_ERROR', url: args[0] });
        throw error;
      }
    };
  }

  // Setup Apollo GraphQL interceptor
  setupApolloInterceptor() {
    // Override Apollo link error handling
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Check if this is an Apollo error
      const firstArg = args[0];
      if (typeof firstArg === 'string' && 
          (firstArg.includes('GraphQL') || 
           firstArg.includes('Apollo') || 
           firstArg.includes('Network'))) {
        this.logError(new Error(firstArg), { 
          type: 'GRAPHQL_ERROR', 
          details: args.slice(1) 
        });
      }
      
      // طباعة كائن الخطأ كاملاً مع graphQLErrors
      if (args[0] && args[0].message && (args[0].message.includes('18') || args[0].message.includes('Missing field'))) {
        console.error('🔍 Apollo Error 18 Details:', {
          message: args[0].message,
          graphQLErrors: args[0].graphQLErrors,
          networkError: args[0].networkError,
          locations: args[0].locations,
          path: args[0].path,
          extensions: args[0].extensions
        });
        return;
      }
      
      // Call original console.error for other errors
      originalConsoleError.apply(console, args);
    };
  }

  // Get stored errors
  getStoredErrors() {
    try {
      return JSON.parse(localStorage.getItem('api_errors') || '[]');
    } catch (e) {
      return [];
    }
  }

  // Clear stored errors
  clearStoredErrors() {
    localStorage.removeItem('api_errors');
  }

  // Enable/disable logging
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }
}

// Create global instance
const apiErrorLogger = new ApiErrorLogger();

// Export for use in other services
export default apiErrorLogger;

// Auto-initialize
console.log('🔍 API Error Logger Initialized - Monitoring all API calls...');
