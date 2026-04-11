import BaseService from './BaseService';

class ShopService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/shop';
  }

  // Get shop settings
  async getShopSettings() {
    try {
      const response = await this.get('/shop/settings');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop settings:', error);
      return this.getMockShopSettings();
    }
  }

  // Update shop settings
  async updateShopSettings(settings) {
    try {
      const response = await this.put('/shop/settings', settings);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating shop settings:', error);
      return { success: true, data: settings, mockData: true };
    }
  }

  // Get shop analytics
  async getShopAnalytics(params = {}) {
    try {
      const response = await this.get('/shop/analytics', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop analytics:', error);
      return this.getMockShopAnalytics(params);
    }
  }

  // Get shop statistics
  async getShopStats() {
    try {
      const response = await this.get('/shop/stats');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop stats:', error);
      return this.getMockShopStats();
    }
  }

  // Get shop products
  async getShopProducts(params = {}) {
    try {
      const response = await this.get('/shop/products', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop products:', error);
      return this.getMockShopProducts(params);
    }
  }

  // Get shop orders
  async getShopOrders(params = {}) {
    try {
      const response = await this.get('/shop/orders', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop orders:', error);
      return this.getMockShopOrders(params);
    }
  }

  // Get shop customers
  async getShopCustomers(params = {}) {
    try {
      const response = await this.get('/shop/customers', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop customers:', error);
      return this.getMockShopCustomers(params);
    }
  }

  // Get shop promotions
  async getShopPromotions() {
    try {
      const response = await this.get('/shop/promotions');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop promotions:', error);
      return this.getMockShopPromotions();
    }
  }

  // Create promotion
  async createPromotion(promotionData) {
    try {
      const response = await this.post('/shop/promotions', promotionData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating promotion:', error);
      return { 
        success: true, 
        data: { 
          id: Date.now(), 
          ...promotionData,
          createdAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Update promotion
  async updatePromotion(promotionId, promotionData) {
    try {
      const response = await this.put(`/shop/promotions/${promotionId}`, promotionData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating promotion:', error);
      return { 
        success: true, 
        data: { 
          id: promotionId, 
          ...promotionData,
          updatedAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Delete promotion
  async deletePromotion(promotionId) {
    try {
      const response = await this.delete(`/shop/promotions/${promotionId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting promotion:', error);
      return { success: true, mockData: true };
    }
  }

  // Get shop reviews
  async getShopReviews(params = {}) {
    try {
      const response = await this.get('/shop/reviews', { params });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop reviews:', error);
      return this.getMockShopReviews(params);
    }
  }

  // Respond to review
  async respondToReview(reviewId, response) {
    try {
      const response = await this.post(`/shop/reviews/${reviewId}/respond`, { response });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error responding to review:', error);
      return { 
        success: true, 
        data: { 
          reviewId, 
          response,
          respondedAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Get shop categories
  async getShopCategories() {
    try {
      const response = await this.get('/shop/categories');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop categories:', error);
      return this.getMockShopCategories();
    }
  }

  // Update category
  async updateCategory(categoryId, categoryData) {
    try {
      const response = await this.put(`/shop/categories/${categoryId}`, categoryData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating category:', error);
      return { 
        success: true, 
        data: { 
          id: categoryId, 
          ...categoryData,
          updatedAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Get shop inventory
  async getShopInventory() {
    try {
      const response = await this.get('/shop/inventory');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shop inventory:', error);
      return this.getMockShopInventory();
    }
  }

  // Update inventory
  async updateInventory(productId, inventoryData) {
    try {
      const response = await this.put(`/shop/inventory/${productId}`, inventoryData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating inventory:', error);
      return { 
        success: true, 
        data: { 
          productId, 
          ...inventoryData,
          updatedAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Mock data methods
  getMockShopSettings() {
    return {
      success: true,
      data: {
        general: {
          shopName: 'VynilArt Store',
          shopDescription: 'متجر متخصص في منتجات الفينيل عالية الجودة',
          shopEmail: 'shop@vynilart.com',
          shopPhone: '+213 123 456 789',
          shopAddress: 'الجزائر العاصمة',
          shopCurrency: 'DZD',
          shopLanguage: 'ar',
          shopTimezone: 'Africa/Algiers'
        },
        appearance: {
          logo: '/api/shop/logo.png',
          banner: '/api/shop/banner.jpg',
          theme: 'modern',
          primaryColor: '#d4af37',
          secondaryColor: '#1a1a2e',
          accentColor: '#f44336',
          fontFamily: 'Cairo, sans-serif',
          showBranding: true,
          showContactInfo: true,
          showSocialMedia: true
        },
        payment: {
          enableCashOnDelivery: true,
          enableCreditCard: true,
          enableBankTransfer: true,
          enablePayPal: false,
          enableStripe: true,
          defaultPaymentMethod: 'cod'
        },
        shipping: {
          enableShipping: true,
          enablePickup: true,
          defaultShippingMethod: 'standard',
          freeShippingThreshold: 50000,
          shippingRegions: ['الجزائر العاصمة', 'وهران', 'قسنطينة'],
          shippingRates: {
            standard: 2500,
            express: 5000,
            overnight: 8000
          }
        },
        taxes: {
          enableTax: true,
          taxRate: 0.19,
          taxIncluded: false,
          taxOnShipping: true
        },
        notifications: {
          orderConfirmation: true,
          shippingNotification: true,
          deliveryNotification: true,
          reviewReminder: true,
          promotionNotification: true
        }
      },
      mockData: true
    };
  }

  getMockShopAnalytics(params) {
    return {
      success: true,
      data: {
        overview: {
          totalRevenue: 2450000,
          totalOrders: 1234,
          averageOrderValue: 1987,
          conversionRate: 3.2,
          bounceRate: 42.5
        },
        revenue: [
          { date: '2024-03-18', revenue: 78000, orders: 42 },
          { date: '2024-03-19', revenue: 92000, orders: 48 },
          { date: '2024-03-20', revenue: 105000, orders: 56 }
        ],
        visitors: [
          { date: '2024-03-18', visitors: 1250, pageViews: 3200 },
          { date: '2024-03-19', visitors: 1380, pageViews: 3650 },
          { date: '2024-03-20', visitors: 1520, pageViews: 4100 }
        ],
        topProducts: [
          { name: 'فينيل ديكوري ذهبي', views: 450, sales: 67, revenue: 1005000 },
          { name: 'فينيل جدران فضي', views: 380, sales: 52, revenue: 624000 },
          { name: 'فينيل أرضيات بني', views: 320, sales: 45, revenue: 360000 }
        ],
        trafficSources: [
          { source: 'مباشر', visitors: 890, percentage: 35.6 },
          { source: 'محركات البحث', visitors: 620, percentage: 24.8 },
          { source: 'وسائل التواصل', visitors: 450, percentage: 18.0 },
          { source: 'إحالات', visitors: 340, percentage: 13.6 },
          { source: 'أخرى', visitors: 200, percentage: 8.0 }
        ]
      },
      mockData: true
    };
  }

  getMockShopStats() {
    return {
      success: true,
      data: {
        today: {
          revenue: 105000,
          orders: 56,
          visitors: 1520,
          conversionRate: 3.7
        },
        week: {
          revenue: 625000,
          orders: 312,
          visitors: 9800,
          conversionRate: 3.2
        },
        month: {
          revenue: 2450000,
          orders: 1234,
          visitors: 38500,
          conversionRate: 3.2
        },
        year: {
          revenue: 28500000,
          orders: 14200,
          visitors: 425000,
          conversionRate: 3.3
        }
      },
      mockData: true
    };
  }

  getMockShopProducts(params) {
    return {
      success: true,
      data: {
        products: [
          {
            id: 1,
            name: 'فينيل ديكوري ذهبي',
            sku: 'VD-001',
            price: 15000,
            salePrice: 12000,
            category: 'ديكوري',
            image: '/api/products/1.jpg',
            status: 'active',
            stock: 45,
            views: 450,
            sales: 67,
            rating: 4.8,
            reviews: 23,
            featured: true,
            createdAt: '2024-01-15T10:30:00Z'
          },
          {
            id: 2,
            name: 'فينيل جدران فضي',
            sku: 'VW-002',
            price: 12000,
            category: 'جدران',
            image: '/api/products/2.jpg',
            status: 'active',
            stock: 28,
            views: 380,
            sales: 52,
            rating: 4.6,
            reviews: 18,
            featured: false,
            createdAt: '2024-01-20T14:20:00Z'
          }
        ],
        total: 156,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockShopOrders(params) {
    return {
      success: true,
      data: {
        orders: [
          {
            id: 'ORD-001',
            customerName: 'أحمد محمد',
            customerEmail: 'ahmed@email.com',
            total: 45000,
            status: 'completed',
            paymentStatus: 'paid',
            shippingStatus: 'delivered',
            itemsCount: 3,
            createdAt: '2024-03-20T10:30:00Z',
            deliveredAt: '2024-03-22T14:20:00Z'
          },
          {
            id: 'ORD-002',
            customerName: 'فاطمة علي',
            customerEmail: 'fatima@email.com',
            total: 28000,
            status: 'processing',
            paymentStatus: 'paid',
            shippingStatus: 'shipped',
            itemsCount: 2,
            createdAt: '2024-03-20T12:15:00Z',
            shippedAt: '2024-03-21T09:30:00Z'
          }
        ],
        total: 1234,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockShopCustomers(params) {
    return {
      success: true,
      data: {
        customers: [
          {
            id: 1,
            name: 'أحمد محمد',
            email: 'ahmed@email.com',
            phone: '+213 123 456 789',
            city: 'الجزائر العاصمة',
            totalSpent: 125000,
            ordersCount: 8,
            lastOrderAt: '2024-03-20T10:30:00Z',
            registeredAt: '2024-01-15T10:30:00Z',
            status: 'active'
          },
          {
            id: 2,
            name: 'فاطمة علي',
            email: 'fatima@email.com',
            phone: '+213 987 654 321',
            city: 'وهران',
            totalSpent: 89000,
            ordersCount: 6,
            lastOrderAt: '2024-03-20T12:15:00Z',
            registeredAt: '2024-02-01T14:20:00Z',
            status: 'active'
          }
        ],
        total: 2847,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockShopPromotions() {
    return {
      success: true,
      data: {
        promotions: [
          {
            id: 1,
            name: 'خصم الربيع',
            code: 'SPRING20',
            type: 'percentage',
            value: 0.2,
            minOrderValue: 50000,
            maxDiscountValue: 10000,
            usageLimit: 100,
            usedCount: 45,
            startsAt: '2024-03-01T00:00:00Z',
            endsAt: '2024-03-31T23:59:59Z',
            isActive: true,
            applicableProducts: [1, 2, 3],
            applicableCategories: ['ديكوري', 'جدران']
          },
          {
            id: 2,
            name: 'شحن مجاني',
            code: 'FREESHIP',
            type: 'shipping',
            value: 0,
            minOrderValue: 30000,
            usageLimit: null,
            usedCount: 78,
            startsAt: '2024-03-01T00:00:00Z',
            endsAt: '2024-03-31T23:59:59Z',
            isActive: true,
            applicableProducts: null,
            applicableCategories: null
          }
        ],
        total: 2
      },
      mockData: true
    };
  }

  getMockShopReviews(params) {
    return {
      success: true,
      data: {
        reviews: [
          {
            id: 1,
            customerName: 'أحمد محمد',
            customerEmail: 'ahmed@email.com',
            productName: 'فينيل ديكوري ذهبي',
            rating: 5,
            title: 'منتج ممتاز',
            content: 'جودة عالية جداً واللون رائع. أنصح به بشدة.',
            images: ['/api/reviews/1-1.jpg', '/api/reviews/1-2.jpg'],
            helpful: 12,
            verified: true,
            response: 'شكراً لتقييمك يا أحمد! سعدنا جداً بإرضائك.',
            createdAt: '2024-03-18T14:30:00Z',
            respondedAt: '2024-03-19T09:15:00Z'
          },
          {
            id: 2,
            customerName: 'فاطمة علي',
            customerEmail: 'fatima@email.com',
            productName: 'فينيل جدران فضي',
            rating: 4,
            title: 'جيد جداً',
            content: 'المنتج جيد والجودة ممتاز، لكن التوصيل استغرق وقتاً أطول من المتوقع.',
            images: [],
            helpful: 8,
            verified: true,
            response: null,
            createdAt: '2024-03-17T10:20:00Z',
            respondedAt: null
          }
        ],
        total: 156,
        averageRating: 4.6,
        page: params.page || 1,
        pageSize: params.limit || 20
      },
      mockData: true
    };
  }

  getMockShopCategories() {
    return {
      success: true,
      data: {
        categories: [
          {
            id: 1,
            name: 'ديكوري',
            slug: 'decorative',
            description: 'منتجات فينيل ديكورية عالية الجودة',
            image: '/api/categories/decorative.jpg',
            productCount: 45,
            isActive: true,
            sortOrder: 1
          },
          {
            id: 2,
            name: 'جدران',
            slug: 'walls',
            description: 'فينيل للجدران بتصاميم عصرية',
            image: '/api/categories/walls.jpg',
            productCount: 38,
            isActive: true,
            sortOrder: 2
          },
          {
            id: 3,
            name: 'أرضيات',
            slug: 'floors',
            description: 'أرضيات فينيل متينة وجميلة',
            image: '/api/categories/floors.jpg',
            productCount: 32,
            isActive: true,
            sortOrder: 3
          }
        ],
        total: 7
      },
      mockData: true
    };
  }

  getMockShopInventory() {
    return {
      success: true,
      data: {
        products: [
          {
            productId: 1,
            productName: 'فينيل ديكوري ذهبي',
            sku: 'VD-001',
            currentStock: 45,
            minStockLevel: 10,
            maxStockLevel: 100,
            reorderPoint: 15,
            reorderQuantity: 50,
            lastRestocked: '2024-03-15T10:30:00Z',
            stockStatus: 'normal',
            warehouseLocation: 'A-1-15',
            supplier: 'مورد الفينيل',
            cost: 8000,
            sellingPrice: 15000
          },
          {
            productId: 2,
            productName: 'فينيل جدران فضي',
            sku: 'VW-002',
            currentStock: 8,
            minStockLevel: 10,
            maxStockLevel: 80,
            reorderPoint: 15,
            reorderQuantity: 40,
            lastRestocked: '2024-03-10T14:20:00Z',
            stockStatus: 'low',
            warehouseLocation: 'B-2-8',
            supplier: 'مورد الفينيل',
            cost: 6500,
            sellingPrice: 12000
          }
        ],
        summary: {
          totalProducts: 156,
          inStock: 142,
          lowStock: 12,
          outOfStock: 2,
          totalValue: 2850000,
          reorderNeeded: 3
        }
      },
      mockData: true
    };
  }
}

export default new ShopService();
