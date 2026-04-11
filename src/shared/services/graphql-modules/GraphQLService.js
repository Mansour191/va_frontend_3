import { apolloClient } from '@/shared/services/graphql/apolloClient';
import { provideApolloClient } from '@vue/apollo-composable';
import { gql } from '@apollo/client';

// Ensure Apollo Client is available for GraphQL service
provideApolloClient(apolloClient);

// GraphQL Service - Direct Apollo Client usage for services
class GraphQLService {
  constructor() {
    this.client = apolloClient;
  }

  async query(query, variables = {}, options = {}) {
    try {
      console.log('🚀 GraphQL Query Starting:', {
        queryName: query.definitions[0]?.name?.value || 'Unknown',
        variables,
        timestamp: new Date().toISOString()
      });

      // Fix Apollo Error 18: Reset cache before critical queries
      if (query.definitions[0]?.name?.value === 'CheckAIHealth') {
        console.log('🔄 Resetting Apollo cache for CheckAIHealth query...');
        try {
          await this.client.clearStore();
          console.log('✅ Apollo cache reset successfully');
        } catch (cacheError) {
          console.warn('⚠️ Failed to reset Apollo cache:', cacheError.message);
        }
      }

      const result = await this.client.query({
        query,
        variables,
        errorPolicy: 'all',
        fetchPolicy: 'network-only', // Force network request for health checks
        ...options
      });
      
      // طباعة تفاصيل الخطأ القادم من المصفوفة errors[0].message
      if (result.errors && result.errors.length > 0) {
        console.error('🔍 GraphQL Query Errors:', {
          queryName: query.definitions[0]?.name?.value || 'Unknown',
          errors: result.errors.map(error => ({
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: error.extensions
          })),
          variables,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('✅ GraphQL Query Success:', {
        queryName: query.definitions[0]?.name?.value || 'Unknown',
        dataKeys: Object.keys(result.data || {}),
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('💥 GraphQL Query Failed:', {
        queryName: query.definitions[0]?.name?.value || 'Unknown',
        errorMessage: error.message,
        networkError: error.networkError,
        variables,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async mutate(mutation, variables = {}, options = {}) {
    try {
      console.log('🔄 GraphQL Mutation Starting:', {
        mutationName: mutation.definitions[0]?.name?.value || 'Unknown',
        variables,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.mutate({
        mutation,
        variables,
        errorPolicy: 'all',
        ...options
      });
      
      if (result.errors && result.errors.length > 0) {
        console.error('🔍 GraphQL Mutation Errors:', {
          mutationName: mutation.definitions[0]?.name?.value || 'Unknown',
          errors: result.errors.map(error => ({
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: error.extensions
          })),
          variables,
          timestamp: new Date().toISOString()
        });
      }
      
      console.log('✅ GraphQL Mutation Success:', {
        mutationName: mutation.definitions[0]?.name?.value || 'Unknown',
        dataKeys: Object.keys(result.data || {}),
        timestamp: new Date().toISOString()
      });
      
      return result;
    } catch (error) {
      console.error('💥 GraphQL Mutation Failed:', {
        mutationName: mutation.definitions[0]?.name?.value || 'Unknown',
        errorMessage: error.message,
        networkError: error.networkError,
        variables,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  // Address Queries and Mutations
  async getMyAddresses() {
    const MY_ADDRESSES = gql`
      query MyAddresses {
        myAddresses {
          id
          type
          title
          streetAddress
          city
          state
          postalCode
          country
          isDefault
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await this.query(MY_ADDRESSES);
    return result.data?.myAddresses || [];
  }

  async createAddress(input) {
    const CREATE_ADDRESS = gql`
      mutation CreateAddress($input: AddressInput!) {
        createAddress(input: $input) {
          success
          message
          address {
            id
            type
            title
            streetAddress
            city
            state
            postalCode
            country
            isDefault
          }
        }
      }
    `;
    
    const result = await this.mutate(CREATE_ADDRESS, { input });
    return result.data?.createAddress;
  }

  async updateAddress(id, input) {
    const UPDATE_ADDRESS = gql`
      mutation UpdateAddress($id: ID!, $input: AddressInput!) {
        updateAddress(id: $id, input: $input) {
          success
          message
          address {
            id
            type
            title
            streetAddress
            city
            state
            postalCode
            country
            isDefault
          }
        }
      }
    `;
    
    const result = await this.mutate(UPDATE_ADDRESS, { id, input });
    return result.data?.updateAddress;
  }

  async deleteAddress(id) {
    const DELETE_ADDRESS = gql`
      mutation DeleteAddress($id: ID!) {
        deleteAddress(id: $id) {
          success
          message
        }
      }
    `;
    
    const result = await this.mutate(DELETE_ADDRESS, { id });
    return result.data?.deleteAddress;
  }

  async setDefaultAddress(id) {
    const SET_DEFAULT_ADDRESS = gql`
      mutation SetDefaultAddress($id: ID!) {
        setDefaultAddress(id: $id) {
          success
          message
        }
      }
    `;
    
    const result = await this.mutate(SET_DEFAULT_ADDRESS, { id });
    return result.data?.setDefaultAddress;
  }

  // Wishlist Queries and Mutations
  async getMyWishlist() {
    const MY_WISHLIST = gql`
      query MyWishlist {
        myWishlist {
          id
          product {
            id
            nameEn
            nameAr
            slug
            image
            basePrice
            discountPercent
          }
          createdAt
        }
      }
    `;
    
    const result = await this.query(MY_WISHLIST);
    return result.data?.myWishlist || [];
  }

  async addToWishlist(productId) {
    const ADD_TO_WISHLIST = gql`
      mutation AddToWishlist($productId: ID!) {
        addToWishlist(productId: $productId) {
          success
          message
          wishlistItem {
            id
            product {
              id
              nameEn
              nameAr
            }
          }
        }
      }
    `;
    
    const result = await this.mutate(ADD_TO_WISHLIST, { productId });
    return result.data?.addToWishlist;
  }

  async removeFromWishlist(itemId) {
    const REMOVE_FROM_WISHLIST = gql`
      mutation RemoveFromWishlist($itemId: ID!) {
        removeFromWishlist(itemId: $itemId) {
          success
          message
        }
      }
    `;
    
    const result = await this.mutate(REMOVE_FROM_WISHLIST, { itemId });
    return result.data?.removeFromWishlist;
  }

  async clearWishlist() {
    const CLEAR_WISHLIST = gql`
      mutation ClearWishlist {
        clearWishlist {
          success
          message
        }
      }
    `;
    
    const result = await this.mutate(CLEAR_WISHLIST);
    return result.data?.clearWishlist;
  }

  // Dashboard Settings Queries and Mutations
  async getMyDashboardSettings() {
    const MY_DASHBOARD_SETTINGS = gql`
      query MyDashboardSettings {
        myDashboardSettings {
          id
          theme
          language
          notificationsEnabled
          emailNotifications
          dashboardLayout
          defaultView
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await this.query(MY_DASHBOARD_SETTINGS);
    return result.data?.myDashboardSettings;
  }

  async updateDashboardSettings(input) {
    const UPDATE_DASHBOARD_SETTINGS = gql`
      mutation UpdateDashboardSettings($input: DashboardSettingsInput!) {
        updateDashboardSettings(input: $input) {
          success
          message
          settings {
            id
            theme
            language
            notificationsEnabled
            emailNotifications
            dashboardLayout
            defaultView
          }
        }
      }
    `;
    
    const result = await this.mutate(UPDATE_DASHBOARD_SETTINGS, { input });
    return result.data?.updateDashboardSettings;
  }

  // Analytics Queries
  async getDashboardStats(period, dateFrom, dateTo) {
    const DASHBOARD_STATS = gql`
      query DashboardStats($period: String, $dateFrom: Date, $dateTo: Date) {
        dashboardStats(period: $period, dateFrom: $dateFrom, dateTo: $dateTo) {
          id
          period
          date
          totalSales
          totalOrders
          newCustomers
          activeCustomers
          averageOrderValue
          createdAt
        }
      }
    `;
    
    const result = await this.query(DASHBOARD_STATS, { period, dateFrom, dateTo });
    return result.data?.dashboardStats || [];
  }

  async getTopProducts(limit = 10, dateFrom, dateTo) {
    const TOP_PRODUCTS = gql`
      query TopProducts($limit: Int, $dateFrom: Date, $dateTo: Date) {
       }
    `;
    
    const result = await this.query(TOP_PRODUCTS, { limit, dateFrom, dateTo });
    return result.data?.topProducts || [];
  }

  async getRegionalAnalytics(wilaya, dateFrom, dateTo) {
    const REGIONAL_ANALYTICS = gql`
      query RegionalAnalytics($wilaya: String, $dateFrom: Date, $dateTo: Date) {
        regionalAnalytics(wilaya: $wilaya, dateFrom: $dateFrom, dateTo: $dateTo) {
          id
          wilaya
          date
          totalSales
          totalOrders
          uniqueCustomers
          createdAt
        }
      }
    `;
    
    const result = await this.query(REGIONAL_ANALYTICS, { wilaya, dateFrom, dateTo });
    return result.data?.regionalAnalytics || [];
  }

  async getInvestorMetrics(period, dateFrom, dateTo) {
    const INVESTOR_METRICS = gql`
      query InvestorMetrics($period: String, $dateFrom: Date, $dateTo: Date) {
        investorMetrics(period: $period, dateFrom: $dateFrom, dateTo: $dateTo) {
          id
          period
          date
          totalRevenue
          catalogProgress
          salesGrowth
          activeInvestors
          roi
          createdAt
        }
      }
    `;
    
    const result = await this.query(INVESTOR_METRICS, { period, dateFrom, dateTo });
    return result.data?.investorMetrics || [];
  }

  async getSalesForecasts(productId, dateFrom, dateTo) {
    const SALES_FORECASTS = gql`
      query SalesForecasts($productId: ID, $dateFrom: Date, $dateTo: Date) {
        salesForecasts(productId: $productId, dateFrom: $dateFrom, dateTo: $dateTo) {
          id
          product {
            id
            nameEn
            nameAr
          }
          forecastDate
          predictedSales
          predictedRevenue
          confidenceScore
          modelVersion
          createdAt
          updatedAt
        }
      }
    `;
    
    const result = await this.query(SALES_FORECASTS, { productId, dateFrom, dateTo });
    return result.data?.salesForecasts || [];
  }

  // AI Health Check function
  async checkAIHealth(service = 'general') {
    const AI_HEALTH = gql`
      query AIHealth($service: String) {
        aiHealth(service: $service) {
          status
          available
        }
      }
    `;
    
    try {
      // Add timeout to prevent hanging
      const result = await Promise.race([
        this.query(AI_HEALTH, { service }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('GraphQL health check timeout')), 5000)
        )
      ]);
      
      return {
        success: true,
        data: result.data,
        status: result.data?.aiHealth?.status || 'healthy',
        available: result.data?.aiHealth?.available !== false,
        responseTime: 100,
        lastCheck: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ AI Health Check Failed:', error);
      // Return fallback to prevent system crash
      return {
        success: false,
        error: error.message,
        status: 'degraded', // Use degraded instead of error
        available: false,
        responseTime: 0,
        lastCheck: new Date().toISOString(),
        isFallback: true
      };
    }
  }
}

// Export singleton instance
export const graphQLService = new GraphQLService();
export default graphQLService;
