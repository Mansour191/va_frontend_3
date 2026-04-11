// ERPNext Service - Unified Service for ERPNext Integration
import { apolloClient } from '@/shared/services/graphql/apolloClient';

class ERPNextService {
  constructor() {
    this.baseURL = import.meta.env.VITE_ERPNEXT_API_URL || '/api';
    this.apiKey = import.meta.env.VITE_ERPNEXT_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_ERPNEXT_API_SECRET || '';
    this.client = apolloClient;
  }

  static getInstance() {
    if (!window.erpNextServiceInstance) {
      window.erpNextServiceInstance = new ERPNextService();
    }
    return window.erpNextServiceInstance;
  }

  async testConnection() {
    try {
      // Use GraphQL only - no REST fallback since we're GraphQL-only
      const { HELLO_QUERY } = await import('@/shared/services/graphql/queries');
      const result = await this.client.query({
        query: HELLO_QUERY
      });

      if (result.errors) {
        throw new Error(result.errors[0].message);
      }

      return {
        success: true,
        message: 'ERPNext connection successful via GraphQL',
        version: result.data?.hello || 'Connected',
        status: 'healthy'
      };
    } catch (error) {
      return {
        success: false,
        message: 'ERPNext GraphQL connection failed',
        error: error.message,
        status: 'unhealthy'
      };
    }
  }

  async checkIntegrationHealth() {
    const connectionTest = await this.testConnection();
    return {
      status: connectionTest.success ? 'healthy' : 'unhealthy',
      message: connectionTest.message,
      lastCheck: new Date().toISOString()
    };
  }

  // Add more ERPNext methods as needed
}

export default ERPNextService;
