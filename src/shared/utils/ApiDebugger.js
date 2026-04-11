// API Debugger Tool - Enhanced Error Analysis
import apiErrorLogger from '@/shared/services/http/ApiErrorLogger.js';

class ApiDebugger {
  static analyzeStoredErrors() {
    const errors = apiErrorLogger.getStoredErrors();
    
    console.group('🔍 API Error Analysis Report');
    console.log(`📊 Total Errors Stored: ${errors.length}`);
    
    if (errors.length === 0) {
      console.log('✅ No errors found in storage');
      console.groupEnd();
      return;
    }
    
    // Analyze error patterns
    const errorTypes = {};
    const statusCodes = {};
    const endpoints = {};
    
    errors.forEach(error => {
      // Count error types
      const type = error.context?.type || 'UNKNOWN';
      errorTypes[type] = (errorTypes[type] || 0) + 1;
      
      // Count status codes
      const status = error.error?.status || 'NO_STATUS';
      statusCodes[status] = (statusCodes[status] || 0) + 1;
      
      // Count endpoints
      const url = error.error?.url || 'NO_URL';
      endpoints[url] = (endpoints[url] || 0) + 1;
    });
    
    console.table('Error Types:', errorTypes);
    console.table('Status Codes:', statusCodes);
    console.table('Endpoints:', endpoints);
    
    // Show recent errors
    console.log('🕐 Recent Errors (Last 5):');
    errors.slice(0, 5).forEach((error, index) => {
      console.group(`Error ${index + 1}: ${error.timestamp}`);
      console.error('Message:', error.error?.message);
      console.error('Status:', error.error?.status);
      console.error('URL:', error.error?.url);
      console.error('Context:', error.context);
      console.groupEnd();
    });
    
    console.groupEnd();
    
    return {
      total: errors.length,
      errorTypes,
      statusCodes,
      endpoints,
      recentErrors: errors.slice(0, 5)
    };
  }
  
  static testEndpoint(endpoint, data = {}) {
    console.group(`🧪 Testing Endpoint: ${endpoint}`);
    
    return fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    })
    .then(response => {
      console.log('✅ Response Status:', response.status);
      console.log('✅ Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.error('❌ Error Response:', response.statusText);
        return response.text().then(text => {
          console.error('❌ Error Body:', text);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        });
      }
      
      return response.json();
    })
    .then(data => {
      console.log('✅ Response Data:', data);
      console.groupEnd();
      return data;
    })
    .catch(error => {
      console.error('❌ Test Failed:', error);
      console.groupEnd();
      throw error;
    });
  }
  
  static clearErrors() {
    apiErrorLogger.clearStoredErrors();
    console.log('🗑️ Cleared all stored errors');
  }
  
  static exportErrorReport() {
    const errors = apiErrorLogger.getStoredErrors();
    const report = {
      timestamp: new Date().toISOString(),
      totalErrors: errors.length,
      errors: errors.map(error => ({
        timestamp: error.timestamp,
        type: error.context?.type,
        message: error.error?.message,
        status: error.error?.status,
        url: error.error?.url,
        method: error.error?.method,
        context: error.context
      }))
    };
    
    // Create downloadable report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-error-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📄 Error report exported');
  }
}

// Make available globally for debugging
window.ApiDebugger = ApiDebugger;

console.log('🔧 API Debugger Loaded - Use ApiDebugger.analyzeStoredErrors() in console');

export default ApiDebugger;
