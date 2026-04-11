// Enhanced AnalyticsService with API Integration
import BaseService from './BaseService';

class AnalyticsService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/analytics';
  }

  // API Methods
  async getAnalyticsData(dateRange = '30days') {
    try {
      const response = await this.get(`/data?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockAnalyticsData(),
        error: response.error || 'Failed to load analytics data'
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        success: false,
        data: this.getMockAnalyticsData(),
        error: error.message
      };
    }
  }

  async getKPIs(dateRange = '30days') {
    try {
      const response = await this.get(`/kpis?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockKPIs(),
        error: response.error || 'Failed to load KPIs'
      };
    } catch (error) {
      console.error('Error getting KPIs:', error);
      return {
        success: false,
        data: this.getMockKPIs(),
        error: error.message
      };
    }
  }

  async getSalesAnalytics(dateRange = '30days') {
    try {
      const response = await this.get(`/sales?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockSalesAnalytics(),
        error: response.error || 'Failed to load sales analytics'
      };
    } catch (error) {
      console.error('Error getting sales analytics:', error);
      return {
        success: false,
        data: this.getMockSalesAnalytics(),
        error: error.message
      };
    }
  }

  async getCategoryAnalytics(dateRange = '30days') {
    try {
      const response = await this.get(`/categories?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCategoryAnalytics(),
        error: response.error || 'Failed to load category analytics'
      };
    } catch (error) {
      console.error('Error getting category analytics:', error);
      return {
        success: false,
        data: this.getMockCategoryAnalytics(),
        error: error.message
      };
    }
  }

  async getTopProducts(dateRange = '30days') {
    try {
      const response = await this.get(`/top-products?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockTopProducts(),
        error: response.error || 'Failed to load top products'
      };
    } catch (error) {
      console.error('Error getting top products:', error);
      return {
        success: false,
        data: this.getMockTopProducts(),
        error: error.message
      };
    }
  }

  async getCustomerAnalytics(dateRange = '30days') {
    try {
      const response = await this.get(`/customers?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCustomerAnalytics(),
        error: response.error || 'Failed to load customer analytics'
      };
    } catch (error) {
      console.error('Error getting customer analytics:', error);
      return {
        success: false,
        data: this.getMockCustomerAnalytics(),
        error: error.message
      };
    }
  }

  async getPredictions() {
    try {
      const response = await this.get('/predictions');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockPredictions(),
        error: response.error || 'Failed to load predictions'
      };
    } catch (error) {
      console.error('Error getting predictions:', error);
      return {
        success: false,
        data: this.getMockPredictions(),
        error: error.message
      };
    }
  }

  async getBasketAnalysis(dateRange = '30days') {
    try {
      const response = await this.get(`/basket-analysis?range=${dateRange}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockBasketAnalysis(),
        error: response.error || 'Failed to load basket analysis'
      };
    } catch (error) {
      console.error('Error getting basket analysis:', error);
      return {
        success: false,
        data: this.getMockBasketAnalysis(),
        error: error.message
      };
    }
  }

  // Recommendations API Methods
  async getCurrentUser() {
    try {
      const response = await this.get('/user/current');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCurrentUser(),
        error: response.error || 'Failed to load user data'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return {
        success: false,
        data: this.getMockCurrentUser(),
        error: error.message
      };
    }
  }

  async getGeneralRecommendations() {
    try {
      const response = await this.get('/recommendations/general');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockGeneralRecommendations(),
        error: response.error || 'Failed to load general recommendations'
      };
    } catch (error) {
      console.error('Error getting general recommendations:', error);
      return {
        success: false,
        data: this.getMockGeneralRecommendations(),
        error: error.message
      };
    }
  }

  async getTrendingProducts() {
    try {
      const response = await this.get('/recommendations/trending');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockTrendingProducts(),
        error: response.error || 'Failed to load trending products'
      };
    } catch (error) {
      console.error('Error getting trending products:', error);
      return {
        success: false,
        data: this.getMockTrendingProducts(),
        error: error.message
      };
    }
  }

  async getPersonalizedRecommendations(userId) {
    try {
      const response = await this.get(`/recommendations/personalized?userId=${userId}`);
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockPersonalizedRecommendations(),
        error: response.error || 'Failed to load personalized recommendations'
      };
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return {
        success: false,
        data: this.getMockPersonalizedRecommendations(),
        error: error.message
      };
    }
  }

  async getCategoryPerformance() {
    try {
      const response = await this.get('/recommendations/categories/performance');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockCategoryPerformance(),
        error: response.error || 'Failed to load category performance'
      };
    } catch (error) {
      console.error('Error getting category performance:', error);
      return {
        success: false,
        data: this.getMockCategoryPerformance(),
        error: error.message
      };
    }
  }

  async getRecommendationsAnalytics() {
    try {
      const response = await this.get('/recommendations/analytics');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockRecommendationsAnalytics(),
        error: response.error || 'Failed to load recommendations analytics'
      };
    } catch (error) {
      console.error('Error getting recommendations analytics:', error);
      return {
        success: false,
        data: this.getMockRecommendationsAnalytics(),
        error: error.message
      };
    }
  }

  async getRecommendationStats() {
    try {
      const response = await this.get('/recommendations/stats');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockRecommendationStats(),
        error: response.error || 'Failed to load recommendation stats'
      };
    } catch (error) {
      console.error('Error getting recommendation stats:', error);
      return {
        success: false,
        data: this.getMockRecommendationStats(),
        error: error.message
      };
    }
  }

  async getTopPerformingRecommendations() {
    try {
      const response = await this.get('/recommendations/top-performing');
      if (response.success) {
        return response;
      }
      return {
        success: false,
        data: this.getMockTopPerformingRecommendations(),
        error: response.error || 'Failed to load top performing recommendations'
      };
    } catch (error) {
      console.error('Error getting top performing recommendations:', error);
      return {
        success: false,
        data: this.getMockTopPerformingRecommendations(),
        error: error.message
      };
    }
  }

  // Mock Data Methods
  getMockAnalyticsData() {
    return {
      kpis: this.getMockKPIs(),
      categorySales: this.getMockCategoryAnalytics(),
      topProducts: this.getMockTopProducts(),
      customerStats: this.getMockCustomerAnalytics(),
      predictions: this.getMockPredictions(),
      basketAnalysis: this.getMockBasketAnalysis()
    };
  }

  getMockKPIs() {
    return [
      {
        title: 'إجمالي الإيرادات',
        value: '284,500 ر.س',
        icon: 'mdi-currency-usd',
        color: 'primary',
        trend: 8.3,
      },
      {
        title: 'إجمالي الطلبات',
        value: '1,234',
        icon: 'mdi-shopping',
        color: 'success',
        trend: 15.7,
      },
      {
        title: 'عدد العملاء',
        value: '892',
        icon: 'mdi-account-group',
        color: 'warning',
        trend: 12.4,
      },
      {
        title: 'متوسط قيمة الطلب',
        value: '450 ر.س',
        icon: 'mdi-calculator',
        color: 'info',
        trend: -2.1,
      },
    ];
  }

  getMockSalesAnalytics() {
    return {
      dailySales: [
        { day: 'الأحد', sales: 12000 },
        { day: 'الإثنين', sales: 19000 },
        { day: 'الثلاثاء', sales: 15000 },
        { day: 'الأربعاء', sales: 25000 },
        { day: 'الخميس', sales: 22000 },
        { day: 'الجمعة', sales: 30000 },
        { day: 'السبت', sales: 28000 }
      ],
      totalRevenue: 141000,
      totalOrders: 1234,
      averageOrderValue: 450
    };
  }

  getMockCategoryAnalytics() {
    return [
      { category: 'جدران', percentage: 35, color: '#d4af37' },
      { category: 'أبواب', percentage: 25, color: '#2196F3' },
      { category: 'سيارات', percentage: 20, color: '#4CAF50' },
      { category: 'أثاث', percentage: 12, color: '#FF9800' },
      { category: 'مطابخ', percentage: 8, color: '#9C27B0' },
    ];
  }

  getMockTopProducts() {
    return [
      { id: 1, name: 'ملصق حائط زهور', category: 'جدران', sales: 234, revenue: 10530 },
      { id: 2, name: 'ملصق باب خشبي', category: 'أبواب', sales: 187, revenue: 16643 },
      { id: 3, name: 'إطار سيارة رياضي', category: 'سيارات', sales: 156, revenue: 18720 },
      { id: 4, name: 'ملصق مطبخ فواكه', category: 'مطابخ', sales: 98, revenue: 6370 },
      { id: 5, name: 'ملصق جدار ثلاثي أبعاد', category: 'جدران', sales: 87, revenue: 17400 },
    ];
  }

  getMockCustomerAnalytics() {
    return {
      new: 156,
      returning: 234,
      avgOrder: 450,
      ltv: 1850,
      retention: 68,
      totalCustomers: 892
    };
  }

  getMockPredictions() {
    return {
      nextMonth: 95000,
      nextQuarter: 320000,
      nextYear: 1250000,
      confidence: 85,
      insight: 'من المتوقع زيادة المبيعات في فصل الصيف بسبب الطلب على ديكورات المنازل'
    };
  }

  getMockBasketAnalysis() {
    return {
      avgItems: 2.4,
      avgValue: 450,
      commonPairs: [
        { id: 1, product1: 'ملصق حائط', product2: 'ملصق باب', frequency: 35, orders: 156 },
        { id: 2, product1: 'إطار سيارة', product2: 'ملصق جدار', frequency: 28, orders: 124 },
        { id: 3, product1: 'ملصق مطبخ', product2: 'ملصق أرضيات', frequency: 22, orders: 98 },
      ]
    };
  }

  // Recommendations Mock Data Methods
  getMockCurrentUser() {
    return {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      preferences: ['فن عربي', 'فن إسلامي', 'خط عربي']
    };
  }

  getMockGeneralRecommendations() {
    return [
      { id: 1, title: 'فن عربي كلاسيكي', confidence: 0.95, reason: 'بناءً على تفضيلاتك السابقة' },
      { id: 2, title: 'لوحة تجريدية حديثة', confidence: 0.87, reason: 'شائع بين المستخدمين المماثلين' },
      { id: 3, title: 'منحوتة نحاسية', confidence: 0.82, reason: 'جديد في مجموعتنا' },
      { id: 4, title: 'خط عربي أصيل', confidence: 0.78, reason: 'مطابق لاهتماماتك' },
      { id: 5, title: 'فن إسلامي معاصر', confidence: 0.75, reason: 'ترند هذا الموسم' }
    ];
  }

  getMockTrendingProducts() {
    return [
      { id: 1, name: 'لوحة زيتية', views: 1250, sales: 45, trend: 'up', growth: 0.23 },
      { id: 2, name: 'تمثال برونزي', views: 980, sales: 32, trend: 'up', growth: 0.18 },
      { id: 3, name: 'سجادة فنية', views: 750, sales: 28, trend: 'stable', growth: 0.05 },
      { id: 4, name: 'إطار خشب محفور', views: 620, sales: 19, trend: 'up', growth: 0.12 },
      { id: 5, name: 'مصباح إسلامي', views: 540, sales: 15, trend: 'down', growth: -0.08 }
    ];
  }

  getMockPersonalizedRecommendations() {
    return [
      { id: 1, name: 'فن إسلامي', score: 0.92, category: 'تاريخي', reason: 'بناءً على مشاهداتك' },
      { id: 2, name: 'خط عربي', score: 0.88, category: 'كلاسيكي', reason: 'مطابق لذوقك' },
      { id: 3, name: 'منمنمات', score: 0.85, category: 'تراثي', reason: 'شائع في فئتك' },
      { id: 4, name: 'زخارف إسلامية', score: 0.81, category: 'ديكور', reason: 'جديد في المجموعة' },
      { id: 5, name: 'فنون خطية', score: 0.79, category: 'حديث', reason: 'موصى به للمستخدمين المماثلين' }
    ];
  }

  getMockCategoryPerformance() {
    return [
      { name: 'جدران', count: 145, percentage: 35, revenue: '285,000 ر.س' },
      { name: 'أبواب', count: 98, percentage: 24, revenue: '195,000 ر.س' },
      { name: 'سيارات', count: 87, percentage: 21, revenue: '174,000 ر.س' },
      { name: 'مطابخ', count: 42, percentage: 10, revenue: '84,000 ر.س' },
      { name: 'أثاث', count: 38, percentage: 9, revenue: '76,000 ر.س' },
      { name: 'ديكور', count: 32, percentage: 8, revenue: '64,000 ر.س' }
    ];
  }

  getMockRecommendationsAnalytics() {
    return {
      totalRecommendations: 1247,
      conversionRate: 0.23,
      avgRating: 4.6,
      userSatisfaction: 0.89,
      clickThroughRate: 0.34,
      avgResponseTime: 1.2,
      popularCategories: ['فن عربي', 'فن إسلامي', 'خط عربي'],
      peakHours: ['10:00-12:00', '14:00-16:00', '20:00-22:00']
    };
  }

  getMockRecommendationStats() {
    return {
      dailyViews: 342,
      weeklyClicks: 1890,
      monthlyConversions: 67,
      avgEngagement: 0.45,
      bounceRate: 0.32,
      avgSessionDuration: 4.5,
      returningUsers: 0.68,
      newUsers: 0.32
    };
  }

  getMockTopPerformingRecommendations() {
    return [
      { id: 1, name: 'فن عربي', performance: 0.94, revenue: '45,000 ر.س', conversions: 89 },
      { id: 2, name: 'فن حديث', performance: 0.87, revenue: '38,000 ر.س', conversions: 76 },
      { id: 3, name: 'فن تراثي', performance: 0.82, revenue: '29,000 ر.س', conversions: 58 },
      { id: 4, name: 'فن إسلامي', performance: 0.79, revenue: '24,000 ر.س', conversions: 47 },
      { id: 5, name: 'خط عربي', performance: 0.75, revenue: '18,000 ر.س', conversions: 35 }
    ];
  }

  // Export singleton instance
  static getInstance() {
    if (!window.analyticsServiceInstance) {
      window.analyticsServiceInstance = new AnalyticsService();
    }
    return window.analyticsServiceInstance;
  }
}

// Export class as default
export default AnalyticsService;
