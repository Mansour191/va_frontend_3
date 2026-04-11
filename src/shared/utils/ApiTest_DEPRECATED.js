// API Testing Tool - DEPRECATED - MIGRATED TO GRAPHQL
// This tool has been replaced by GraphQL testing utilities
// All API tests should now use GraphQL queries/mutations

import { httpClient } from '@/shared/services/http/HttpClient.js';
import AIService from '@/shared/services/ai/AIService.js';

class ApiTest {
  static async testAllEndpoints() {
    console.warn('⚠️ ApiTest is deprecated. All endpoints have been migrated to GraphQL.');
    console.group('🧪 Testing Legacy API Endpoints (DEPRECATED)');
    
    const endpoints = [
      { name: 'AI Health Check', url: '/ai/health/', method: 'GET' },
      { name: 'AI Market Trends', url: '/ai/analytics/market-trends', method: 'GET' },
      { name: 'AI Demand Prediction', url: '/ai/inventory/demand-prediction/test', method: 'GET' },
      { name: 'AI Pricing Analysis', url: '/ai/analyze/pricing-factors', method: 'POST', data: { product: 'test', factors: { price: 100 } } }
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      try {
        console.log(`Testing: ${endpoint.name}`);
        const result = await this.testEndpoint(endpoint);
        results.push(result);
      } catch (error) {
        console.error(`❌ ${endpoint.name} failed:`, error);
        results.push({
          name: endpoint.name,
          success: false,
          error: error.message,
          status: 'ERROR'
        });
      }
    }
    
    console.groupEnd();
    return results;
  }

  static async testEndpoint(endpoint) {
    console.error('❌ testEndpoint() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testGraphQLHealth() {
    console.error('❌ testGraphQLHealth() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testAIHealth() {
    console.error('❌ testAIHealth() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testProductEndpoints() {
    console.error('❌ testProductEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testOrderEndpoints() {
    console.error('❌ testOrderEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testUserEndpoints() {
    console.error('❌ testUserEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testPricingEndpoints() {
    console.error('❌ testPricingEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testSearchEndpoints() {
    console.error('❌ testSearchEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testNotificationEndpoints() {
    console.error('❌ testNotificationEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testCartEndpoints() {
    console.error('❌ testCartEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testWishlistEndpoints() {
    console.error('❌ testWishlistEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testReviewEndpoints() {
    console.error('❌ testReviewEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testCategoryEndpoints() {
    console.error('❌ testCategoryEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testMaterialEndpoints() {
    console.error('❌ testMaterialEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testShippingEndpoints() {
    console.error('❌ testShippingEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testPaymentEndpoints() {
    console.error('❌ testPaymentEndpoints() is deprecated. Use GraphQL queries instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL queries.');
  }

  static async testERPNextEndpoints() {
    console.error('❌ testERPNextEndpoints() is deprecated. Use GraphQLERPNextService instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  static async testDashboardEndpoints() {
    console.error('❌ testDashboardEndpoints() is deprecated. Use GraphQLDashboardService instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  static async runFullTestSuite() {
    console.error('❌ runFullTestSuite() is deprecated. Use GraphQL testing utilities instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL testing utilities.');
  }

  static async generateTestReport() {
    console.error('❌ generateTestReport() is deprecated. Use GraphQL testing utilities instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL testing utilities.');
  }

  static async validateAPIResponse(response, expectedSchema) {
    console.error('❌ validateAPIResponse() is deprecated. Use GraphQL validation instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL validation.');
  }

  static async benchmarkEndpoint(endpoint, iterations = 10) {
    console.error('❌ benchmarkEndpoint() is deprecated. Use GraphQL benchmarking instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL benchmarking.');
  }

  static async testErrorHandling() {
    console.error('❌ testErrorHandling() is deprecated. Use GraphQL error handling instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL error handling.');
  }

  static async testAuthentication() {
    console.error('❌ testAuthentication() is deprecated. Use GraphQL authentication instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL authentication.');
  }

  static async testRateLimiting() {
    console.error('❌ testRateLimiting() is deprecated. Use GraphQL rate limiting instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL rate limiting.');
  }

  static async testCORS() {
    console.error('❌ testCORS() is deprecated. Use GraphQL CORS instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL CORS.');
  }

  static async testSecurity() {
    console.error('❌ testSecurity() is deprecated. Use GraphQL security instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQL security.');
  }
}

export default ApiTest;

console.log('📦 ApiTest - FULLY DEPRECATED - Use GraphQL testing utilities instead');
