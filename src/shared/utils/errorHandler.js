// Global Error Handler to prevent app crashes
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

// Create and export singleton instance
const globalErrorHandler = new GlobalErrorHandler();
export default globalErrorHandler;
