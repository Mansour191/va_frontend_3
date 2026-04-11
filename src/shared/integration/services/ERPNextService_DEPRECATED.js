// DEPRECATED - MIGRATED TO GRAPHQL
// This service has been completely replaced by GraphQLERPNextService.js
// All ERPNext operations should now use GraphQL mutations
// 
// MIGRATION GUIDE:
// OLD: ERPNextService.syncCustomer(id)
// NEW: GraphQLERPNextService.syncWithERPNext('customers')
//
// OLD: ERPNextService.syncProduct(id)  
// NEW: GraphQLERPNextService.syncWithERPNext('products')
//
// OLD: ERPNextService.syncOrder(id)
// NEW: GraphQLERPNextService.syncWithERPNext('orders')

import { useGraphQLMutation } from '@/shared/composables/useGraphQL';

class ERPNextService {
  constructor() {
    console.warn('⚠️ ERPNextService is deprecated. Please use GraphQLERPNextService.js instead.');
  }

  // ALL METHODS BELOW ARE DEPRECATED - USE GraphQLERPNextService INSTEAD
  
  async migrateCustomers() {
    console.error('❌ migrateCustomers() is deprecated. Use GraphQLERPNextService.syncWithERPNext("customers") instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async syncCustomer(customerId) {
    console.error('❌ syncCustomer() is deprecated. Use GraphQLERPNextService.syncWithERPNext() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getCustomerSyncStatus() {
    console.error('❌ getCustomerSyncStatus() is deprecated. Use GraphQLERPNextService.getSyncStatus() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async migrateProducts() {
    console.error('❌ migrateProducts() is deprecated. Use GraphQLERPNextService.syncWithERPNext("products") instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async syncProduct(productId) {
    console.error('❌ syncProduct() is deprecated. Use GraphQLERPNextService.syncWithERPNext() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getProductSyncStatus() {
    console.error('❌ getProductSyncStatus() is deprecated. Use GraphQLERPNextService.getSyncStatus() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async migrateOrders(startDate = null, endDate = null) {
    console.error('❌ migrateOrders() is deprecated. Use GraphQLERPNextService.syncWithERPNext("orders") instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async syncOrder(orderId) {
    console.error('❌ syncOrder() is deprecated. Use GraphQLERPNextService.syncWithERPNext() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getOrderSyncStatus() {
    console.error('❌ getOrderSyncStatus() is deprecated. Use GraphQLERPNextService.getSyncStatus() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async migrateInventory() {
    console.error('❌ migrateInventory() is deprecated. Use GraphQLERPNextService.syncWithERPNext("inventory") instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async syncInventory(itemId) {
    console.error('❌ syncInventory() is deprecated. Use GraphQLERPNextService.syncWithERPNext() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getInventorySyncStatus() {
    console.error('❌ getInventorySyncStatus() is deprecated. Use GraphQLERPNextService.getSyncStatus() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getOverallSyncStatus() {
    console.error('❌ getOverallSyncStatus() is deprecated. Use GraphQLERPNextService.getSyncStatus() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async testConnection() {
    console.error('❌ testConnection() is deprecated. Use GraphQLERPNextService.testConnection() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getSyncHistory() {
    console.error('❌ getSyncHistory() is deprecated. Use GraphQLERPNextService.getSyncHistory() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async scheduleSync(syncType, schedule) {
    console.error('❌ scheduleSync() is deprecated. Use GraphQLERPNextService.scheduleAutoSync() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async cancelScheduledSync(syncId) {
    console.error('❌ cancelScheduledSync() is deprecated. Use GraphQLERPNextService.cancelScheduledSync() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getSyncLogs(limit = 50) {
    console.error('❌ getSyncLogs() is deprecated. Use GraphQLERPNextService.getSyncLogs() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async retryFailedSync(syncId) {
    console.error('❌ retryFailedSync() is deprecated. Use GraphQLERPNextService.retryFailedSync() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getSyncMetrics() {
    console.error('❌ getSyncMetrics() is deprecated. Use GraphQLERPNextService.getSyncMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async validateERPNextConfig() {
    console.error('❌ validateERPNextConfig() is deprecated. Use GraphQLERPNextService.validateConfig() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async updateERPNextConfig(config) {
    console.error('❌ updateERPNextConfig() is deprecated. Use GraphQLERPNextService.updateConfig() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }

  async getERPNextConfig() {
    console.error('❌ getERPNextConfig() is deprecated. Use GraphQLERPNextService.getConfig() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLERPNextService.');
  }
}

// Create singleton instance
export const erpNextService = new ERPNextService();

// Export class for custom instances
export default ERPNextService;

console.log('📦 ERPNextService - FULLY DEPRECATED - Use GraphQLERPNextService.js instead');
