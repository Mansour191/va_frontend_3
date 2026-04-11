// DEPRECATED - MIGRATED TO GRAPHQL
// This service has been replaced by GraphQLDashboardService.js
// All dashboard operations should now use GraphQL queries
//
// MIGRATION GUIDE:
// OLD: DashboardService.getDashboardStats()
// NEW: GraphQLDashboardService.getDashboardStats()
//
// OLD: DashboardService.getRecentOrders()
// NEW: GraphQLDashboardService.getRecentOrders()
//
// OLD: DashboardService.getSalesData()
// NEW: GraphQLDashboardService.getSalesData()

import { useGraphQLQuery } from '@/shared/composables/useGraphQL';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

class DashboardService {
  constructor() {
    console.warn('⚠️ DashboardService is deprecated. Please use GraphQLDashboardService.js instead.');
  }

  // ALL METHODS BELOW ARE DEPRECATED - USE GraphQLDashboardService INSTEAD

  async getDashboardStats() {
    console.error('❌ getDashboardStats() is deprecated. Use GraphQLDashboardService.getDashboardStats() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getRecentOrders(limit = 10) {
    console.error('❌ getRecentOrders() is deprecated. Use GraphQLDashboardService.getRecentOrders() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getSalesData(period = '30d') {
    console.error('❌ getSalesData() is deprecated. Use GraphQLDashboardService.getSalesData() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getTopProducts(limit = 10) {
    console.error('❌ getTopProducts() is deprecated. Use GraphQLDashboardService.getTopProducts() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getCustomerMetrics() {
    console.error('❌ getCustomerMetrics() is deprecated. Use GraphQLDashboardService.getCustomerMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getOrderMetrics() {
    console.error('❌ getOrderMetrics() is deprecated. Use GraphQLDashboardService.getOrderMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getRevenueMetrics(period = '30d') {
    console.error('❌ getRevenueMetrics() is deprecated. Use GraphQLDashboardService.getRevenueMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getProductMetrics() {
    console.error('❌ getProductMetrics() is deprecated. Use GraphQLDashboardService.getProductMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getInventoryMetrics() {
    console.error('❌ getInventoryMetrics() is deprecated. Use GraphQLDashboardService.getInventoryMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getMarketingMetrics() {
    console.error('❌ getMarketingMetrics() is deprecated. Use GraphQLDashboardService.getMarketingMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getPerformanceMetrics() {
    console.error('❌ getPerformanceMetrics() is deprecated. Use GraphQLDashboardService.getPerformanceMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getSystemMetrics() {
    console.error('❌ getSystemMetrics() is deprecated. Use GraphQLDashboardService.getSystemMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getAlerts() {
    console.error('❌ getAlerts() is deprecated. Use GraphQLDashboardService.getAlerts() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getNotifications() {
    console.error('❌ getNotifications() is deprecated. Use GraphQLDashboardService.getNotifications() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getActivityLog(limit = 50) {
    console.error('❌ getActivityLog() is deprecated. Use GraphQLDashboardService.getActivityLog() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getQuickStats() {
    console.error('❌ getQuickStats() is deprecated. Use GraphQLDashboardService.getQuickStats() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getChartData(chartType, filters = {}) {
    console.error('❌ getChartData() is deprecated. Use GraphQLDashboardService.getChartData() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async exportReport(reportType, filters = {}) {
    console.error('❌ exportReport() is deprecated. Use GraphQLDashboardService.exportReport() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async getCustomMetrics(metricIds) {
    console.error('❌ getCustomMetrics() is deprecated. Use GraphQLDashboardService.getCustomMetrics() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async createCustomMetric(metricData) {
    console.error('❌ createCustomMetric() is deprecated. Use GraphQLDashboardService.createCustomMetric() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async updateCustomMetric(metricId, metricData) {
    console.error('❌ updateCustomMetric() is deprecated. Use GraphQLDashboardService.updateCustomMetric() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }

  async deleteCustomMetric(metricId) {
    console.error('❌ deleteCustomMetric() is deprecated. Use GraphQLDashboardService.deleteCustomMetric() instead.');
    throw new Error('This method has been migrated to GraphQL. Please use GraphQLDashboardService.');
  }
}

// Create singleton instance
export const dashboardService = new DashboardService();

// Export class for custom instances
export default DashboardService;

console.log('📦 DashboardService - FULLY DEPRECATED - Use GraphQLDashboardService.js instead');
