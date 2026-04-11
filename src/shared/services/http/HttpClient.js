// HTTP Client with Error Logging - Enhanced fetch wrapper
import apiErrorLogger from './ApiErrorLogger.js';

class HttpClient {
  constructor(baseURL = null) {
    // Use proxy base URL, not direct API URL
    this.baseURL = baseURL || '/api'; // Use proxy path, not full URL
  }

  // Build full URL - Use proxy for development
  buildURL(endpoint) {
    // For development with Vite proxy, use relative paths
    if (import.meta.env.DEV) {
      if (endpoint.startsWith('/')) {
        return endpoint; // Use proxy
      }
    }
    
    // For production or direct API calls
    const apiBase = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    if (endpoint.startsWith('http')) {
      return endpoint; // Full URL already provided
    }
    
    return `${apiBase}${endpoint}`;
  }

  // Get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Make request with error logging
  async request(endpoint, options = {}) {
    const url = this.buildURL(endpoint);
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);

    try {
      const response = await fetch(url, config);
      
      // Log response status
      if (response.ok) {
        console.log(`✅ API Success: ${config.method || 'GET'} ${url} (${response.status})`);
      } else {
        const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.statusText = response.statusText;
        error.url = url;
        error.config = config;
        
        // Try to get error details from response
        try {
          const errorData = await response.clone().json();
          error.details = errorData;
          apiErrorLogger.logError(error, { 
            type: 'HTTP_ERROR', 
            responseData: errorData,
            endpoint,
            method: config.method || 'GET'
          });
        } catch (e) {
          apiErrorLogger.logError(error, { 
            type: 'HTTP_ERROR', 
            endpoint,
            method: config.method || 'GET'
          });
        }
      }

      return response;
    } catch (error) {
      // Log network errors
      apiErrorLogger.logError(error, { 
        type: 'NETWORK_ERROR', 
        endpoint,
        method: config.method || 'GET',
        baseURL: this.baseURL
      });
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const url = new URL(this.buildURL(endpoint));
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, params[key])
    );
    
    return this.request(url.toString(), { method: 'GET' });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // Upload file
  async upload(endpoint, formData) {
    const headers = {};
    const token = localStorage.getItem('token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  }
}

// Create default instance
export const httpClient = new HttpClient();

// Export class for custom instances
export default HttpClient;
