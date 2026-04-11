// Unified GraphQL Services Index - Complete replacement for REST API services
// This file exports all GraphQL services as a unified interface

// Import all GraphQL services
import GraphQLDashboardService from './GraphQLDashboardService';
import GraphQLCartService from './GraphQLCartService';
import GraphQLProductService from './GraphQLProductService';
import GraphQLOrderService from './GraphQLOrderService';
import GraphQLAIService from './GraphQLAIService';
import GraphQLUserService from './GraphQLUserService';

// Import composables
import { useGraphQLDashboard } from './GraphQLDashboardService';
import { useGraphQLCart } from './GraphQLCartService';
import { useGraphQLProduct } from './GraphQLProductService';
import { useGraphQLOrder } from './GraphQLOrderService';
import { useGraphQLAI } from './GraphQLAIService';
import { useGraphQLUser } from './GraphQLUserService';

// Create singleton instances
const dashboardService = new GraphQLDashboardService();
const cartService = new GraphQLCartService();
const productService = new GraphQLProductService();
const orderService = new GraphQLOrderService();
const aiService = new GraphQLAIService();
const userService = new GraphQLUserService();

// Unified service interface
class GraphQLServiceManager {
  constructor() {
    this.dashboard = dashboardService;
    this.cart = cartService;
    this.product = productService;
    this.order = orderService;
    this.ai = aiService;
    this.user = userService;
  }

  // Health check for all services
  async healthCheck() {
    const checks = await Promise.allSettled([
      this.ai.getAIHealth(),
      this.user.getMe()
    ]);

    return {
      ai: checks[0].status === 'fulfilled' ? checks[0].value : null,
      user: checks[1].status === 'fulfilled' ? checks[1].value : null,
      overall: checks.every(check => check.status === 'fulfilled')
    };
  }

  // Clear all caches
  clearAllCaches() {
    this.dashboard.clearCache();
    this.cart.clearCache();
    this.product.clearCache();
    this.order.clearCache();
    this.ai.clearCache();
    this.user.clearCache();
  }

  // Get service status
  getServiceStatus() {
    return {
      dashboard: !!this.dashboard,
      cart: !!this.cart,
      product: !!this.product,
      order: !!this.order,
      ai: !!this.ai,
      user: !!this.user
    };
  }

  // Initialize all services
  async initialize() {
    try {
      // Preload essential data
      await Promise.allSettled([
        this.product.getCategories(),
        this.product.getMaterials(),
        this.order.getShippingOptions()
      ]);

      return {
        success: true,
        message: 'All GraphQL services initialized successfully'
      };
    } catch (error) {
      console.error('Error initializing GraphQL services:', error);
      return {
        success: false,
        message: 'Failed to initialize GraphQL services',
        error
      };
    }
  }

  // Migration helpers
  async migrateFromREST() {
    try {
      console.log('🔄 Starting migration from REST to GraphQL...');
      
      // Clear all existing caches
      this.clearAllCaches();
      
      // Initialize services
      await this.initialize();
      
      console.log('✅ Migration to GraphQL completed successfully');
      
      return {
        success: true,
        message: 'Successfully migrated from REST to GraphQL'
      };
    } catch (error) {
      console.error('❌ Migration failed:', error);
      return {
        success: false,
        message: 'Migration to GraphQL failed',
        error
      };
    }
  }

  // Analytics and monitoring
  async getAnalytics() {
    try {
      const [
        dashboardStats,
        orderAnalytics,
        userStats
      ] = await Promise.all([
        this.dashboard.getDashboardStats(),
        this.order.getOrderAnalytics(),
        this.user.getUserStatistics()
      ]);

      return {
        dashboard: dashboardStats,
        orders: orderAnalytics,
        users: userStats,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  // Search across all services
  async globalSearch(query, options = {}) {
    try {
      const {
        products = true,
        categories = true,
        designs = true,
        users = false,
        orders = false
      } = options;

      const searches = [];

      if (products) {
        searches.push(
          this.product.searchProducts(query)
            .then(results => ({ type: 'products', results }))
        );
      }

      if (categories) {
        searches.push(
          this.product.getCategories()
            .then(categories => ({
              type: 'categories',
              results: categories.filter(cat => 
                cat.nameAr.includes(query) || cat.nameEn.includes(query)
              )
            }))
        );
      }

      if (designs) {
        searches.push(
          this.ai.getDesigns()
            .then(designs => ({
              type: 'designs',
              results: designs.filter(design => 
                design.name.includes(query) || design.description.includes(query)
              )
            }))
        );
      }

      if (users) {
        searches.push(
          this.user.searchUsers(query)
            .then(results => ({ type: 'users', results }))
        );
      }

      if (orders) {
        searches.push(
          this.order.getMyOrders()
            .then(orders => ({
              type: 'orders',
              results: orders.filter(order => 
                order.id.includes(query) || order.status.includes(query)
              )
            }))
        );
      }

      const results = await Promise.allSettled(searches);
      
      return results
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
    } catch (error) {
      console.error('Error performing global search:', error);
      throw error;
    }
  }

  // Export/Import functionality
  async exportData() {
    try {
      const [
        products,
        categories,
        orders,
        users
      ] = await Promise.all([
        this.product.getProducts(),
        this.product.getCategories(),
        this.order.getOrders(),
        this.user.getUsers()
      ]);

      return {
        products,
        categories,
        orders,
        users,
        exportedAt: new Date(),
        version: '1.0'
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  }

  async importData(data) {
    try {
      const results = {
        products: [],
        categories: [],
        orders: [],
        users: [],
        errors: []
      };

      // Import categories first
      if (data.categories) {
        for (const categoryData of data.categories) {
          try {
            const result = await this.product.createCategory(categoryData);
            results.categories.push(result);
          } catch (error) {
            results.errors.push({ type: 'category', data: categoryData, error });
          }
        }
      }

      // Import products
      if (data.products) {
        for (const productData of data.products) {
          try {
            const result = await this.product.createProduct(productData);
            results.products.push(result);
          } catch (error) {
            results.errors.push({ type: 'product', data: productData, error });
          }
        }
      }

      // Import users (if admin)
      if (data.users) {
        for (const userData of data.users) {
          try {
            const result = await this.user.register(userData);
            results.users.push(result);
          } catch (error) {
            results.errors.push({ type: 'user', data: userData, error });
          }
        }
      }

      return {
        ...results,
        importedAt: new Date(),
        totalImported: results.products.length + results.categories.length + results.users.length,
        totalErrors: results.errors.length
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }
}

// Create service manager instance
const serviceManager = new GraphQLServiceManager();

// Export services and manager
export {
  GraphQLDashboardService,
  GraphQLCartService,
  GraphQLProductService,
  GraphQLOrderService,
  GraphQLAIService,
  GraphQLUserService,
  serviceManager
};

// Export composables
export {
  useGraphQLDashboard,
  useGraphQLCart,
  useGraphQLProduct,
  useGraphQLOrder,
  useGraphQLAI,
  useGraphQLUser
};

// Export unified interface
export default serviceManager;

// Legacy compatibility exports
export const httpClient = {
  get: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  post: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  put: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  delete: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead'))
};

export const api = {
  get: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  post: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  put: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead')),
  delete: () => Promise.reject(new Error('REST API deprecated - use GraphQL services instead'))
};

// Auto-initialize on import
serviceManager.initialize().catch(console.error);

console.log('🚀 GraphQL Services initialized - REST API deprecated');
