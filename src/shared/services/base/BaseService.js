// Enhanced BaseService with GraphQL Integration
class BaseService {
  constructor() {
    this.endpoint = '';
    this.store = null;
    this.t = null;
    this.graphqlEndpoint = '/graphql/';
  }

  // Initialize Vue composition API dependencies (call from setup function)
  initVueDependencies() {
    if (!this.store) {
      // Dynamic import to avoid calling outside setup
      import('vuex').then(({ useStore }) => {
        this.store = useStore();
      });
    }
    if (!this.t) {
      // Dynamic import to avoid calling outside setup
      import('vue-i18n').then(({ useI18n }) => {
        this.t = useI18n().t;
      });
    }
  }

  // Generic GraphQL request method
  async makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    } catch (error) {
      console.error('❌ GraphQL request error:', error);
      
      // Show error notification if store is available
      if (this.store) {
        this.store.dispatch('notifications/add', {
          type: 'error',
          title: this.t ? this.t('apiError') : 'خطأ في الاتصال',
          message: error.message || (this.t ? this.t('unexpectedError') : 'حدث خطأ غير متوقع'),
          timeout: 5000
        });
      }
      
      throw error;
    }
  }

  // Legacy HTTP methods (deprecated - use GraphQL instead)
  async get(url, config = {}) {
    console.warn('⚠️  DEPRECATED: BaseService.get() uses REST API. Consider migrating to GraphQL.');
    return this.request('GET', url, null, config);
  }

  async post(url, data, config = {}) {
    console.warn('⚠️  DEPRECATED: BaseService.post() uses REST API. Consider migrating to GraphQL.');
    return this.request('POST', url, data, config);
  }

  async put(url, data, config = {}) {
    console.warn('⚠️  DEPRECATED: BaseService.put() uses REST API. Consider migrating to GraphQL.');
    return this.request('PUT', url, data, config);
  }

  async delete(url, config = {}) {
    console.warn('⚠️  DEPRECATED: BaseService.delete() uses REST API. Consider migrating to GraphQL.');
    return this.request('DELETE', url, null, config);
  }

  // Generic API request method (deprecated - kept for backward compatibility)
  async request(method, url, data = null, config = {}) {
    console.warn(`⚠️  DEPRECATED: BaseService.request() uses REST API (${method} ${url}). Consider migrating to GraphQL.`);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          ...config.headers
        },
        body: data ? JSON.stringify(data) : null,
        ...config
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result;
      } else {
        throw new Error(result.message || 'Request failed');
      }
    } catch (error) {
      console.error(`API Error (${method} ${url}):`, error);
      
      // Show error notification if store is available
      if (this.store) {
        this.store.dispatch('notifications/add', {
          type: 'error',
          title: this.t ? this.t('apiError') : 'خطأ في الاتصال',
          message: error.message || (this.t ? this.t('unexpectedError') : 'حدث خطأ غير متوقع'),
          timeout: 5000
        });
      }
      
      throw error;
    }
  }

  // Mock data fallback
  async getMockData(endpoint, mockData) {
    try {
      const result = await this.get(endpoint);
      return result;
    } catch (error) {
      console.warn(`Using mock data for ${endpoint}:`, error);
      
      // Show warning notification if store is available
      if (this.store) {
        this.store.dispatch('notifications/add', {
          type: 'warning',
          title: this.t ? this.t('usingMockData') : 'استخدام بيانات وهمية',
          message: this.t ? this.t('mockDataFallback') : `جاري استخدام بيانات وهمية لـ ${endpoint}`,
          timeout: 3000
        });
      }
      
      return {
        success: true,
        data: mockData
      };
    }
  }
}

export default BaseService;
