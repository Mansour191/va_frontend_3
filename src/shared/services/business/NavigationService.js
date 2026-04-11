import BaseService from './BaseService';

class NavigationService extends BaseService {
  constructor() {
    super('/navigation');
  }

  /**
   * Get site statistics
   * @returns {Promise} Site statistics data
   */
  static async getSiteStatistics() {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest('/statistics');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching site statistics:', error);
      // Return fallback data
      return { 
        success: true, 
        data: {
          totalProducts: 156,
          totalCategories: 8,
          totalPages: 24,
          totalUsers: 1234
        }
      };
    }
  }

  /**
   * Get navigation menu structure
   * @returns {Promise} Navigation menu data
   */
  static async getNavigationMenu() {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest('/menu');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching navigation menu:', error);
      // Return fallback menu structure
      return { 
        success: true, 
        data: {
          mainPages: [
            { path: '/', title: 'الرئيسية', icon: 'mdi-home' },
            { path: '/about', title: 'من نحن', icon: 'mdi-information' },
            { path: '/contact', title: 'اتصل بنا', icon: 'mdi-phone' },
            { path: '/gallery', title: 'معرض الأعمال', icon: 'mdi-image-multiple' }
          ],
          products: [
            { path: '/shop', title: 'المتجر', icon: 'mdi-store' },
            { path: '/furniture', title: 'الأثاث', icon: 'mdi-sofa' },
            { path: '/doors', title: 'الأبواب', icon: 'mdi-door-open' },
            { path: '/walls', title: 'الجدران', icon: 'mdi-roller-shade' },
            { path: '/ceilings', title: 'الأسقف', icon: 'mdi-arrow-up-bold-box' },
            { path: '/tiles', title: 'البلاط', icon: 'mdi-grid' },
            { path: '/kitchens', title: 'المطابخ', icon: 'mdi-silverware-fork-knife' },
            { path: '/cars', title: 'السيارات', icon: 'mdi-car' }
          ],
          dashboards: [
            { path: '/dashboard', title: 'لوحة التحكم الرئيسية', icon: 'mdi-gauge' },
            { path: '/dashboard/products', title: 'إدارة المنتجات', icon: 'mdi-package-variant-closed' },
            { path: '/dashboard/analytics', title: 'التحليلات', icon: 'mdi-chart-line' },
            { path: '/dashboard/ai', title: 'الذكاء الاصطناعي', icon: 'mdi-brain' },
            { path: '/investor', title: 'منصة المستثمرين', icon: 'mdi-trending-up' }
          ],
          services: [
            { path: '/cart', title: 'سلة التسوق', icon: 'mdi-cart' },
            { path: '/wishlist', title: 'قائمة الرغبات', icon: 'mdi-heart' },
            { path: '/search', title: 'البحث المتقدم', icon: 'mdi-magnify' }
          ]
        }
      };
    }
  }

  /**
   * Track page visit
   * @param {string} page - Page path
   * @param {string} title - Page title
   * @returns {Promise} Tracking response
   */
  static async trackPageVisit(page, title) {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest('/track', {
        method: 'POST',
        body: JSON.stringify({ page, title })
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error tracking page visit:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get popular pages
   * @param {number} limit - Number of pages to return
   * @returns {Promise} Popular pages data
   */
  static async getPopularPages(limit = 10) {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest(`/popular?limit=${limit}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching popular pages:', error);
      // Return fallback data
      return { 
        success: true, 
        data: [
          { path: '/', title: 'الرئيسية', visits: 1234 },
          { path: '/shop', title: 'المتجر', visits: 856 },
          { path: '/dashboard', title: 'لوحة التحكم', visits: 623 },
          { path: '/furniture', title: 'الأثاث', visits: 445 },
          { path: '/about', title: 'من نحن', visits: 332 }
        ]
      };
    }
  }

  /**
   * Search navigation items
   * @param {string} query - Search query
   * @returns {Promise} Search results
   */
  static async searchNavigation(query) {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest(`/search?q=${encodeURIComponent(query)}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error searching navigation:', error);
      // Return empty results
      return { success: true, data: [] };
    }
  }

  /**
   * Get breadcrumbs for current page
   * @param {string} path - Current page path
   * @returns {Promise} Breadcrumb data
   */
  static async getBreadcrumbs(path) {
    try {
      const service = new NavigationService();
      const response = await service.apiRequest(`/breadcrumbs?path=${encodeURIComponent(path)}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching breadcrumbs:', error);
      // Return fallback breadcrumbs
      return { 
        success: true, 
        data: [
          { title: 'الرئيسية', path: '/dashboard', disabled: false },
          { title: 'خريطة الموقع', path: '/dashboard/navigation', disabled: true }
        ]
      };
    }
  }
}

export default NavigationService;
