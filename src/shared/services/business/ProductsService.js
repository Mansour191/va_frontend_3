// Products Service - API Integration for Products Management
import BaseService from './BaseService';

class ProductsService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/products';
  }

  // Get all products with pagination and filters
  async getProducts(params = {}) {
    try {
      const response = await this.apiRequest(this.endpoint, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Products fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch products',
        mockData: this.getMockProducts()
      };
    }
  }

  // Get product by ID
  async getProductById(productId) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${productId}`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch product',
        mockData: this.getMockProduct(productId)
      };
    }
  }

  // Create new product
  async createProduct(productData) {
    try {
      const response = await this.apiRequest(this.endpoint, {
        method: 'POST',
        body: JSON.stringify(productData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product created successfully'
      };
    } catch (error) {
      console.error('Error creating product:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to create product'
      };
    }
  }

  // Update product
  async updateProduct(productId, productData) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product updated successfully'
      };
    } catch (error) {
      console.error('Error updating product:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update product'
      };
    }
  }

  // Delete product
  async deleteProduct(productId) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${productId}`, {
        method: 'DELETE'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting product:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to delete product'
      };
    }
  }

  // Bulk operations
  async bulkUpdateProducts(productUpdates) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/bulk-update`, {
        method: 'PATCH',
        body: JSON.stringify({ products: productUpdates })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk update successful'
      };
    } catch (error) {
      console.error('Error bulk updating products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk update products'
      };
    }
  }

  async bulkDeleteProducts(productIds) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/bulk-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ productIds })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Bulk delete successful'
      };
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to bulk delete products'
      };
    }
  }

  // Get product categories
  async getCategories() {
    try {
      const response = await this.apiRequest(`${this.endpoint}/categories`, {
        method: 'GET'
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Categories fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch categories',
        mockData: this.getMockCategories()
      };
    }
  }

  // Get product statistics
  async getProductStats(params = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/stats`, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product statistics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product stats:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch product stats',
        mockData: this.getMockProductStats()
      };
    }
  }

  // Search products
  async searchProducts(query, filters = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/search`, {
        method: 'POST',
        body: JSON.stringify({ query, filters })
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Products searched successfully'
      };
    } catch (error) {
      console.error('Error searching products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to search products',
        mockData: this.getMockSearchResults(query, filters)
      };
    }
  }

  // Get product analytics
  async getProductAnalytics(productId, params = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${productId}/analytics`, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product analytics fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch product analytics',
        mockData: this.getMockProductAnalytics(productId)
      };
    }
  }

  // Update product stock
  async updateProductStock(productId, stockData) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/${productId}/stock`, {
        method: 'PATCH',
        body: JSON.stringify(stockData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Product stock updated successfully'
      };
    } catch (error) {
      console.error('Error updating product stock:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to update product stock'
      };
    }
  }

  // Get low stock products
  async getLowStockProducts(threshold = 10) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/low-stock`, {
        method: 'GET',
        params: { threshold }
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Low stock products fetched successfully'
      };
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to fetch low stock products',
        mockData: this.getMockLowStockProducts(threshold)
      };
    }
  }

  // Import/Export products
  async importProducts(fileData) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/import`, {
        method: 'POST',
        body: JSON.stringify(fileData)
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Products imported successfully'
      };
    } catch (error) {
      console.error('Error importing products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to import products'
      };
    }
  }

  async exportProducts(params = {}) {
    try {
      const response = await this.apiRequest(`${this.endpoint}/export`, {
        method: 'GET',
        params
      });
      return {
        success: true,
        data: response.data || response,
        message: 'Products exported successfully'
      };
    } catch (error) {
      console.error('Error exporting products:', error);
      return {
        success: false,
        error: error.message,
        message: 'Failed to export products'
      };
    }
  }

  // Mock data methods
  getMockProducts() {
    return {
      products: [
        {
          id: 1,
          name: 'فينيل ديكوري فاخر',
          sku: 'VIN-DEC-001',
          category: 'ديكوري',
          price: 2500,
          cost: 1800,
          stock: 45,
          minStock: 10,
          sales: 128,
          revenue: 320000,
          image: '/api/placeholder/200/150',
          description: 'فينيل ديكوري عالي الجودة للزينة الداخلية',
          status: 'active',
          featured: true,
          tags: ['فاخر', 'ديكوري', 'داخلي'],
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-20T14:45:00Z'
        },
        {
          id: 2,
          name: 'فينيل جدران عصري',
          sku: 'VIN-WAL-002',
          category: 'جدران',
          price: 1800,
          cost: 1200,
          stock: 32,
          minStock: 15,
          sales: 95,
          revenue: 171000,
          image: '/api/placeholder/200/150',
          description: 'فينيل جدران بتصاميم عصرية',
          status: 'active',
          featured: false,
          tags: ['عصري', 'جدران', 'تصميم'],
          createdAt: '2024-01-10T09:15:00Z',
          updatedAt: '2024-01-18T11:30:00Z'
        },
        {
          id: 3,
          name: 'فينيل أرضيات مقاوم',
          sku: 'VIN-FLR-003',
          category: 'أرضيات',
          price: 1200,
          cost: 800,
          stock: 8,
          minStock: 20,
          sales: 67,
          revenue: 80400,
          image: '/api/placeholder/200/150',
          description: 'فينيل أرضيات مقاوم للخدش والاحتكاك',
          status: 'low_stock',
          featured: false,
          tags: ['مقاوم', 'أرضيات', 'متين'],
          createdAt: '2024-01-05T16:20:00Z',
          updatedAt: '2024-01-12T13:10:00Z'
        },
        {
          id: 4,
          name: 'فينيل سقف حديث',
          sku: 'VIN-CEL-004',
          category: 'سقوف',
          price: 2200,
          cost: 1600,
          stock: 28,
          minStock: 12,
          sales: 43,
          revenue: 94600,
          image: '/api/placeholder/200/150',
          description: 'فينيل سقوف بتصاميم حديثة وعصرية',
          status: 'active',
          featured: true,
          tags: ['حديث', 'سقوف', 'عصري'],
          createdAt: '2024-01-08T12:45:00Z',
          updatedAt: '2024-01-16T10:20:00Z'
        },
        {
          id: 5,
          name: 'فينيل أثاث كلاسيكي',
          sku: 'VIN-FUR-005',
          category: 'أثاث',
          price: 3500,
          cost: 2500,
          stock: 15,
          minStock: 8,
          sales: 28,
          revenue: 98000,
          image: '/api/placeholder/200/150',
          description: 'فينيل لأثاث بتصاميم كلاسيكية فاخرة',
          status: 'active',
          featured: true,
          tags: ['كلاسيكي', 'أثاث', 'فاخر'],
          createdAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-19T09:15:00Z'
        }
      ],
      total: 5,
      page: 1,
      totalPages: 1
    };
  }

  getMockProduct(productId) {
    const products = this.getMockProducts().products;
    return products.find(p => p.id === parseInt(productId)) || null;
  }

  getMockCategories() {
    return [
      { id: 1, name: 'ديكوري', count: 45, description: 'منتجات ديكور داخلية' },
      { id: 2, name: 'جدران', count: 32, description: 'فينيل للجدران' },
      { id: 3, name: 'أرضيات', count: 28, description: 'فينيل للأرضيات' },
      { id: 4, name: 'سقوف', count: 18, description: 'فينيل للسقوف' },
      { id: 5, name: 'أثاث', count: 22, description: 'فينيل للأثاث' },
      { id: 6, name: 'مطابخ', count: 15, description: 'فينيل للمطابخ' },
      { id: 7, name: 'حمامات', count: 12, description: 'فينيل للحمامات' }
    ];
  }

  getMockProductStats() {
    return {
      overview: {
        totalProducts: 125,
        activeProducts: 118,
        inactiveProducts: 7,
        lowStockProducts: 8,
        outOfStockProducts: 3,
        featuredProducts: 15
      },
      inventory: {
        totalStock: 2847,
        totalValue: 4250000,
        avgStockPerProduct: 22.8,
        stockTurnover: 4.2
      },
      performance: {
        totalRevenue: 2850000,
        avgPrice: 22800,
        topSellingCategory: 'ديكوري',
        avgSalesPerProduct: 45.6
      },
      trends: {
        monthly: [
          { month: 'يناير', sales: 156, revenue: 342000, newProducts: 5 },
          { month: 'فبراير', sales: 178, revenue: 389000, newProducts: 8 },
          { month: 'مارس', sales: 195, revenue: 425000, newProducts: 6 },
          { month: 'أبريل', sales: 182, revenue: 398000, newProducts: 4 },
          { month: 'مايو', sales: 203, revenue: 445000, newProducts: 7 },
          { month: 'يونيو', sales: 215, revenue: 471000, newProducts: 9 }
        ]
      }
    };
  }

  getMockSearchResults(query, filters) {
    const allProducts = this.getMockProducts().products;
    let filtered = allProducts;

    // Apply search query
    if (query) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.sku.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    // Apply filters
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    if (filters.status) {
      filtered = filtered.filter(product => product.status === filters.status);
    }
    if (filters.minPrice) {
      filtered = filtered.filter(product => product.price >= filters.minPrice);
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(product => product.price <= filters.maxPrice);
    }

    return {
      products: filtered,
      total: filtered.length,
      query,
      filters
    };
  }

  getMockProductAnalytics(productId) {
    return {
      productId,
      overview: {
        totalSales: 128,
        totalRevenue: 320000,
        avgOrderValue: 2500,
        conversionRate: 4.2,
        returnRate: 2.1
      },
      trends: {
        daily: [
          { date: '2024-01-15', sales: 8, revenue: 20000 },
          { date: '2024-01-16', sales: 12, revenue: 30000 },
          { date: '2024-01-17', sales: 10, revenue: 25000 },
          { date: '2024-01-18', sales: 15, revenue: 37500 },
          { date: '2024-01-19', sales: 7, revenue: 17500 }
        ],
        monthly: [
          { month: 'يناير', sales: 45, revenue: 112500 },
          { month: 'فبراير', sales: 52, revenue: 130000 },
          { month: 'مارس', sales: 48, revenue: 120000 }
        ]
      },
      performance: {
        rating: 4.5,
        reviews: 89,
        views: 1250,
        addToCart: 156,
        wishlist: 78
      },
      inventory: {
        currentStock: 45,
        minStock: 10,
        reorderPoint: 15,
        daysOfSupply: 28,
        stockTurnover: 8.5
      }
    };
  }

  getMockLowStockProducts(threshold) {
    const allProducts = this.getMockProducts().products;
    return allProducts.filter(product => product.stock <= threshold);
  }
}

// Export singleton instance
const productsServiceInstance = new ProductsService();
export default productsServiceInstance;
export { ProductsService };
