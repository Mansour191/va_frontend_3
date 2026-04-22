// ERPNext GraphQL Wrapper Service
// This service wraps ERPNext REST API calls to provide a unified GraphQL interface
import { useMutation, useQuery } from '@apollo/client'
import { 
  TRIGGER_MANUAL_SYNC,
  GET_SYNC_STATUS,
  GET_SYNC_HISTORY,
  TEST_ERPNEXT_CONNECTION,
  UPDATE_SYNC_CONFIGURATION
} from '@/integration/graphql/erpnext.graphql'

class ERPNextGraphQLWrapper {
  constructor() {
    this.baseURL = import.meta.env.VITE_ERPNEXT_URL || 'https://your-erpnext.com'
    this.apiKey = import.meta.env.VITE_ERPNEXT_API_KEY || ''
    this.apiSecret = import.meta.env.VITE_ERPNEXT_API_SECRET || ''
  }

  static getInstance() {
    if (!window.erpNextGraphQLWrapperInstance) {
      window.erpNextGraphQLWrapperInstance = new ERPNextGraphQLWrapper()
    }
    return window.erpNextGraphQLWrapperInstance
  }

  // GraphQL-based methods (preferred)
  async triggerSyncViaGraphQL(syncType, dryRun = false) {
    try {
      const { mutate } = await import('@apollo/client')
      const apolloClient = (await import('@/shared/plugins/apolloPlugin')).default
      
      const result = await apolloClient.mutate({
        mutation: TRIGGER_MANUAL_SYNC,
        variables: { syncType, dryRun }
      })
      
      return result.data?.erpNextTriggerManualSync || { success: false, message: 'GraphQL sync failed' }
    } catch (error) {
      console.error('ERPNext GraphQL sync error:', error)
      return { success: false, message: error.message }
    }
  }

  async getSyncStatusViaGraphQL() {
    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin')
      
      const result = await apolloClient.query({
        query: GET_SYNC_STATUS
      })
      
      return result.data?.erpNextSyncStatus || { status: 'unknown' }
    } catch (error) {
      console.error('ERPNext GraphQL status error:', error)
      return { status: 'error', message: error.message }
    }
  }

  async testConnectionViaGraphQL() {
    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin')
      
      const result = await apolloClient.query({
        query: TEST_ERPNEXT_CONNECTION
      })
      
      return result.data?.erpNextConnectionTest || { success: false, message: 'Connection test failed' }
    } catch (error) {
      console.error('ERPNext GraphQL connection test error:', error)
      return { success: false, message: error.message }
    }
  }

  // Fallback REST API methods (only used when GraphQL is not available)
  async makeRESTRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `token ${this.apiKey}:${this.apiSecret}`,
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('ERPNext REST API error:', error)
      throw error
    }
  }

  // GraphQL methods replacing REST API
  async getProducts(params = {}) {
    const { GetERPNextProducts } = await import('@/integration/graphql/erpnext.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(GetERPNextProducts, {
      variables: { filters: params }
    });
    
    if (data.value && !error.value) {
      return { success: true, data: data.value.erpnextProducts };
    }
    return { success: false, error: error.value?.message };
  }

  async getCustomers(params = {}) {
    const { GetERPNextCustomers } = await import('@/integration/graphql/erpnext.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(GetERPNextCustomers, {
      variables: { filters: params }
    });
    
    if (data.value && !error.value) {
      return { success: true, data: data.value.erpnextCustomers };
    }
    return { success: false, error: error.value?.message };
  }

  async getSalesOrders(params = {}) {
    const { GetERPNextSalesOrders } = await import('@/integration/graphql/erpnext.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(GetERPNextSalesOrders, {
      variables: { filters: params }
    });
    
    if (data.value && !error.value) {
      return { success: true, data: data.value.erpnextSalesOrders };
    }
    return { success: false, error: error.value?.message };
  }

  async createSalesOrder(orderData) {
    // Use existing GraphQL mutation for order creation
    const { CREATE_ORDER_MUTATION } = await import('@/integration/graphql/orders.graphql');
    const { useMutation } = await import('@apollo/client');
    
    const { mutate } = useMutation(CREATE_ORDER_MUTATION);
    
    return mutate({ variables: orderData });
  }

  async getStockBalance(params = {}) {
    // Create GraphQL query for stock balance
    const stockQuery = `
      query GetStockBalance($filters: ERPNextFilters) {
        erpnextStockBalance(filters: $filters) {
          itemCode
          warehouse
          actualQty
          projectedQty
          reservedQty
          availableQty
        }
      }
    `;
    
    const { useQuery } = await import('@apollo/client');
    const { data, error } = await useQuery(stockQuery, {
      variables: { filters: params }
    });
    
    if (data.value && !error.value) {
      return { success: true, data: data.value.erpnextStockBalance };
    }
    return { success: false, error: error.value?.message };
  }

  // Unified interface methods that use GraphQL only
  async syncData(syncType, options = {}) {
    const { SyncERPNextData } = await import('@/integration/graphql/erpnext.graphql');
    const { useMutation } = await import('@apollo/client');
    
    const { mutate } = useMutation(SyncERPNextData);
    
    return mutate({
      variables: {
        syncType,
        options: options
      }
    });
  }

  async getConnectionStatus() {
    const { GetERPNextVersions } = await import('@/integration/graphql/erpnext.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(GetERPNextVersions);
    
    if (data.value && !error.value) {
      return {
        success: true,
        method: 'graphql',
        status: 'healthy'
      }
    }

    // Fallback to REST API health check
    console.warn('GraphQL connection test failed, falling back to REST API')
    try {
      await this.makeRESTRequest('/api/method/erpnext.versions.get_versions')
      return {
        success: true,
        message: 'ERPNext connection successful via REST API',
        method: 'rest',
        status: 'healthy'
      }
    } catch (error) {
      return {
        success: false,
        message: 'Both GraphQL and REST API connections failed',
        method: 'none',
        status: 'unhealthy',
        error: error.message
      }
    }
  }

  // Configuration management
  async updateConfiguration(config) {
    try {
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin')
      
      const result = await apolloClient.mutate({
        mutation: UPDATE_SYNC_CONFIGURATION,
        variables: { config }
      })
      
      return result.data?.erpNextUpdateSyncConfig || { success: false, message: 'Configuration update failed' }
    } catch (error) {
      console.error('ERPNext configuration update error:', error)
      return { success: false, message: error.message }
    }
  }
}

export default ERPNextGraphQLWrapper
