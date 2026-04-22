/**
 * useErrorBoundary.js
 * Composable for error handling and recovery in async operations
 * Provides consistent error handling across the application
 */

import { ref, reactive } from 'vue';
import { useStore } from 'vuex';

export function useErrorBoundary() {
  const store = useStore();
  
  // Error tracking state
  const errors = ref([]);
  const isHandlingError = ref(false);
  const lastError = ref(null);
  
  // Error statistics
  const errorStats = reactive({
    totalErrors: 0,
    criticalErrors: 0,
    warningErrors: 0,
    recoveredErrors: 0,
    lastErrorTime: null,
    errorTypes: new Map()
  });

  /**
   * Execute an async operation with error boundary protection
   * @param {Function} operation - The async operation to execute
   * @param {string} operationName - Name of the operation for logging
   * @param {Object} options - Configuration options
   * @returns {Promise} - Result of the operation or fallback value
   */
  const execute = async (operation, operationName, options = {}) => {
    const {
      retryCount = 3,
      retryDelay = 1000,
      fallbackValue = null,
      showNotification = true,
      logError = true,
      critical = false,
      customErrorHandler = null
    } = options;

    let attempt = 0;
    let lastError = null;

    while (attempt <= retryCount) {
      try {
        isHandlingError.value = false;
        
        // Execute the operation
        const result = await operation();
        
        // Log successful recovery if this was a retry
        if (attempt > 0) {
          console.log(`\u2705 Operation '${operationName}' recovered after ${attempt} attempts`);
          errorStats.recoveredErrors++;
        }
        
        return result;
        
      } catch (error) {
        lastError = error;
        attempt++;
        
        // Update error statistics
        updateErrorStats(error, operationName, critical);
        
        // Handle the error
        const handled = await handleError(error, operationName, {
          attempt,
          maxAttempts: retryCount + 1,
          showNotification,
          logError,
          critical,
          customErrorHandler
        });
        
        // If custom handler says to stop retrying, break
        if (handled === false) {
          break;
        }
        
        // If we've reached max attempts, don't retry anymore
        if (attempt > retryCount) {
          break;
        }
        
        // Wait before retrying (with exponential backoff)
        const delay = retryDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.warn(`\u26a0\ufe0f Retrying operation '${operationName}' (attempt ${attempt}/${retryCount + 1}) after ${delay}ms delay`);
      }
    }
    
    // All attempts failed, return fallback or throw
    console.error(`\u274c Operation '${operationName}' failed after ${retryCount + 1} attempts:`, lastError);
    
    if (fallbackValue !== null) {
      return fallbackValue;
    }
    
    // If no fallback, throw the last error
    throw lastError;
  };

  /**
   * Handle individual errors
   * @param {Error} error - The error to handle
   * @param {string} operationName - Name of the operation
   * @param {Object} options - Error handling options
   * @returns {boolean} - Whether to continue retrying
   */
  const handleError = async (error, operationName, options) => {
    const {
      attempt,
      maxAttempts,
      showNotification,
      logError,
      critical,
      customErrorHandler
    } = options;

    isHandlingError.value = true;
    lastError.value = error;

    // Add to errors list
    const errorInfo = {
      id: Date.now() + Math.random(),
      operation: operationName,
      error: error,
      timestamp: new Date(),
      attempt,
      critical,
      message: error.message || 'Unknown error',
      stack: error.stack
    };
    
    errors.value.push(errorInfo);
    
    // Keep only last 100 errors
    if (errors.value.length > 100) {
      errors.value = errors.value.slice(-100);
    }

    // Log error if enabled
    if (logError) {
      const logLevel = critical ? 'error' : 'warn';
      console[logLevel](`\ud83d\udccb Error in '${operationName}' (attempt ${attempt}/${maxAttempts}):`, error);
    }

    // Show user notification if enabled
    if (showNotification) {
      showUserNotification(error, operationName, critical, attempt, maxAttempts);
    }

    // Execute custom error handler if provided
    if (customErrorHandler && typeof customErrorHandler === 'function') {
      try {
        const shouldContinue = await customErrorHandler(error, operationName, {
          attempt,
          maxAttempts,
          critical
        });
        
        // If custom handler returns false, stop retrying
        if (shouldContinue === false) {
          return false;
        }
      } catch (handlerError) {
        console.error('Custom error handler failed:', handlerError);
      }
    }

    // For critical errors, don't retry
    if (critical) {
      return false;
    }

    // For network errors, continue retrying
    if (isNetworkError(error)) {
      return true;
    }

    // For GraphQL errors, check if they're retryable
    if (isGraphQLError(error)) {
      return isRetryableGraphQLError(error);
    }

    // For other errors, continue retrying unless it's the last attempt
    return attempt < maxAttempts;
  };

  /**
   * Update error statistics
   * @param {Error} error - The error
   * @param {string} operationName - Operation name
   * @param {boolean} critical - Whether it's critical
   */
  const updateErrorStats = (error, operationName, critical) => {
    errorStats.totalErrors++;
    errorStats.lastErrorTime = new Date();
    
    if (critical) {
      errorStats.criticalErrors++;
    } else {
      errorStats.warningErrors++;
    }
    
    // Track error types
    const errorType = error.constructor.name || 'Unknown';
    errorStats.errorTypes.set(errorType, (errorStats.errorTypes.get(errorType) || 0) + 1);
  };

  /**
   * Show user notification for errors
   * @param {Error} error - The error
   * @param {string} operationName - Operation name
   * @param {boolean} critical - Whether it's critical
   * @param {number} attempt - Current attempt
   * @param {number} maxAttempts - Maximum attempts
   */
  const showUserNotification = (error, operationName, critical, attempt, maxAttempts) => {
    const type = critical ? 'error' : 'warning';
    const title = critical ? 'Error Critical' : 'Warning';
    
    let message = getLocalizedErrorMessage(error, operationName);
    
    // Add retry information if not the last attempt
    if (attempt < maxAttempts) {
      message += ` (Retrying... ${attempt}/${maxAttempts})`;
    }
    
    store.dispatch('notifications/showNotification', {
      type,
      title,
      message,
      timeout: critical ? 10000 : 5000,
      action: critical ? null : {
        label: 'Retry',
        handler: () => {
          // User can manually retry if needed
          console.log(`User requested retry for '${operationName}'`);
        }
      }
    });
  };

  /**
   * Get localized error message
   * @param {Error} error - The error
   * @param {string} operationName - Operation name
   * @returns {string} - Localized error message
   */
  const getLocalizedErrorMessage = (error, operationName) => {
    // Common error patterns
    if (isNetworkError(error)) {
      return 'Connection error. Please check your internet connection.';
    }
    
    if (isGraphQLError(error)) {
      return 'Server error. Please try again in a moment.';
    }
    
    if (error.message?.includes('Authentication')) {
      return 'Authentication error. Please log in again.';
    }
    
    if (error.message?.includes('Permission')) {
      return 'Permission denied. You may not have access to this resource.';
    }
    
    // Default message
    return `Error in ${operationName}: ${error.message || 'Unknown error occurred'}`;
  };

  /**
   * Check if error is a network error
   * @param {Error} error - The error
   * @returns {boolean} - Whether it's a network error
   */
  const isNetworkError = (error) => {
    return (
      error instanceof TypeError ||
      error.message?.includes('Network Error') ||
      error.message?.includes('fetch') ||
      error.message?.includes('ECONNREFUSED') ||
      error.message?.includes('timeout') ||
      error.code === 'NETWORK_ERROR'
    );
  };

  /**
   * Check if error is a GraphQL error
   * @param {Error} error - The error
   * @returns {boolean} - Whether it's a GraphQL error
   */
  const isGraphQLError = (error) => {
    return (
      error.message?.includes('GraphQL') ||
      error.message?.includes('Cannot query field') ||
      error.message?.includes('Variable') ||
      error.graphQLErrors ||
      error.networkError
    );
  };

  /**
   * Check if GraphQL error is retryable
   * @param {Error} error - The GraphQL error
   * @returns {boolean} - Whether it's retryable
   */
  const isRetryableGraphQLError = (error) => {
    // Don't retry validation errors
    if (error.message?.includes('validation') || error.message?.includes('Invalid')) {
      return false;
    }
    
    // Don't retry permission errors
    if (error.message?.includes('Permission') || error.message?.includes('Unauthorized')) {
      return false;
    }
    
    // Retry other GraphQL errors
    return true;
  };

  /**
   * Clear all errors
   */
  const clearErrors = () => {
    errors.value = [];
    lastError.value = null;
    isHandlingError.value = false;
  };

  /**
   * Get error summary
   * @returns {Object} - Error summary
   */
  const getErrorSummary = () => {
    return {
      totalErrors: errorStats.totalErrors,
      criticalErrors: errorStats.criticalErrors,
      warningErrors: errorStats.warningErrors,
      recoveredErrors: errorStats.recoveredErrors,
      lastErrorTime: errorStats.lastErrorTime,
      errorTypes: Object.fromEntries(errorStats.errorTypes),
      recentErrors: errors.value.slice(-10),
      isCurrentlyHandling: isHandlingError.value
    };
  };

  /**
   * Handle specific error types
   */
  const handleNetworkError = (error, operationName) => {
    console.warn(`\ud83d\udce1 Network error in '${operationName}':`, error);
    // Could implement specific network error handling here
  };

  const handleGraphQLError = (error, operationName) => {
    console.warn(`\ud83d\udcca GraphQL error in '${operationName}':`, error);
    // Could implement specific GraphQL error handling here
  };

  const handleCriticalError = (error, operationName) => {
    console.error(`\ud83d\udea8 Critical error in '${operationName}':`, error);
    // Could implement critical error handling here (e.g., emergency shutdown)
  };

  return {
    // Core methods
    execute,
    handleError,
    
    // State
    errors: readonly(errors),
    isHandlingError: readonly(isHandlingError),
    lastError: readonly(lastError),
    errorStats: readonly(errorStats),
    
    // Utility methods
    clearErrors,
    getErrorSummary,
    isNetworkError,
    isGraphQLError,
    
    // Specific error handlers
    handleNetworkError,
    handleGraphQLError,
    handleCriticalError
  };
}
