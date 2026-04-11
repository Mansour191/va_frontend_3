/**
 * Footer Service - Handles footer data management
 * Provides API integration for dynamic footer content
 */

class FooterService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
  }

  /**
   * Make API request helper
   */
  async apiRequest(endpoint, options = {}) {
    const url = `${this.apiBaseUrl}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`❌ API request failed: ${endpoint}`, error);
      throw error;
    }
  }
  /**
   * Get footer data from API
   * @returns {Promise<Object>} Footer data including about text, stats, contact info, and links
   */
  static async getFooterData() {
    try {
      const service = new FooterService();
      const response = await service.apiRequest('/footer');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching footer data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get product items for footer
   * @returns {Promise<Array>} Array of product items
   */
  static async getProductItems() {
    try {
      const service = new FooterService();
      const response = await service.apiRequest('/footer/products/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching footer product items:', error);
      // Return default items
      return {
        success: true,
        data: [
          { route: '/furniture', key: 'furniture' },
          { route: '/doors', key: 'doors' },
          { route: '/walls', key: 'walls' },
          { route: '/ceilings', key: 'ceilings' },
          { route: '/tiles', key: 'tiles' },
          { route: '/kitchens', key: 'kitchens' },
          { route: '/cars', key: 'cars' },
        ]
      };
    }
  }

  /**
   * Get social media links
   * @returns {Promise<Array>} Array of social media links
   */
  static async getSocialLinks() {
    try {
      const service = new FooterService();
      const response = await service.apiRequest('/footer/social-links/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching social links:', error);
      // Return default social links
      return {
        success: true,
        data: [
          {
            name: 'facebook',
            icon: 'mdi-facebook',
            link: 'https://www.facebook.com/profile.php?id=61588391030740',
          },
          { name: 'youtube', icon: 'mdi-youtube', link: 'https://www.youtube.com/@store_paclos' },
          { name: 'whatsapp', icon: 'mdi-whatsapp', link: 'https://wa.me/213663140341' },
          { name: 'instagram', icon: 'mdi-instagram', link: '#' },
          { name: 'tiktok', icon: 'mdi-tiktok', link: 'https://www.tiktok.com/@mansour.2026' },
          { name: 'email', icon: 'mdi-email', link: 'mailto:remadnamansour7@gmail.com' },
        ]
      };
    }
  }

  /**
   * Update footer data
   * @param {Object} footerData - Footer data to update
   * @returns {Promise<Object>} Updated footer data
   */
  static async updateFooterData(footerData) {
    try {
      const service = new FooterService();
      const response = await service.apiRequest('/footer/', {
        method: 'PUT',
        body: JSON.stringify(footerData)
      });
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error updating footer data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get footer statistics
   * @returns {Promise<Object>} Footer statistics
   */
  static async getFooterStats() {
    try {
      const service = new FooterService();
      const response = await service.apiRequest('/footer/stats/');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('❌ Error fetching footer stats:', error);
      // Return default stats
      return {
        success: true,
        data: {
          projectsCount: '500+',
          clientsCount: '300+',
          yearsCount: '5+'
        }
      };
    }
  }
}

export default FooterService;
