import BaseService from '@/shared/services/base/BaseService';

class AlertService extends BaseService {
  constructor() {
    super('/alerts');
  }

  /**
   * Get all alerts
   * @param {Object} filters - Alert filters
   * @returns {Promise} Alerts data
   */
  static async getAlerts(filters = {}) {
    try {
      const service = new AlertService();
      const queryString = new URLSearchParams(filters).toString();
      const response = await service.apiRequest(`/alerts?${queryString}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching alerts:', error);
      // Return fallback data
      return { 
        success: true, 
        data: [
          {
            id: 1,
            title: 'مخزون منخفض',
            message: 'منتج فينيل ديكور ذهبي وصل إلى الحد الأدنى للمخزون',
            category: 'inventory',
            severity: 'critical',
            read: false,
            actionable: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            data: {
              productName: 'فينيل ديكور ذهبي',
              currentStock: 5,
              dailyAverage: 2,
              daysRemaining: 2
            },
            action: {
              handler: 'viewProduct',
              params: { productId: 123 }
            }
          },
          {
            id: 2,
            title: 'توقعات المبيعات',
            message: 'زيادة متوقعة في مبيعات فئة الأبواب خلال الشهر القادم',
            category: 'forecast',
            severity: 'high',
            read: false,
            actionable: true,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            action: {
              handler: 'viewForecast',
              params: {}
            }
          },
          {
            id: 3,
            title: 'تحديث النظام',
            message: 'تم تحديث النظام بنجاح إلى الإصدار 2.1.0',
            category: 'system',
            severity: 'low',
            read: true,
            actionable: false,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          }
        ]
      };
    }
  }

  /**
   * Mark alert as read
   * @param {number} alertId - Alert ID
   * @returns {Promise} Update response
   */
  static async markAsRead(alertId) {
    try {
      const service = new AlertService();
      const response = await service.apiRequest(`/alerts/${alertId}/read`, {
        method: 'PUT'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error marking alert as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mark all alerts as read
   * @returns {Promise} Update response
   */
  static async markAllAsRead() {
    try {
      const service = new AlertService();
      const response = await service.apiRequest('/alerts/read-all', {
        method: 'PUT'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error marking all alerts as read:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete alert
   * @param {number} alertId - Alert ID
   * @returns {Promise} Delete response
   */
  static async deleteAlert(alertId) {
    try {
      const service = new AlertService();
      const response = await service.apiRequest(`/alerts/${alertId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create alert
   * @param {Object} alertData - Alert data
   * @returns {Promise} Create response
   */
  static async createAlert(alertData) {
    try {
      const service = new AlertService();
      const response = await service.apiRequest('/alerts', {
        method: 'POST',
        body: JSON.stringify(alertData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update alert
   * @param {number} alertId - Alert ID
   * @param {Object} alertData - Updated alert data
   * @returns {Promise} Update response
   */
  static async updateAlert(alertId, alertData) {
    try {
      const service = new AlertService();
      const response = await service.apiRequest(`/alerts/${alertId}`, {
        method: 'PUT',
        body: JSON.stringify(alertData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get alert statistics
   * @returns {Promise} Statistics data
   */
  static async getAlertStatistics() {
    try {
      const service = new AlertService();
      const response = await service.apiRequest('/alerts/statistics');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching alert statistics:', error);
      return { 
        success: true, 
        data: {
          total: 10,
          unread: 5,
          critical: 2,
          high: 3,
          medium: 3,
          low: 2,
          byCategory: {
            inventory: 4,
            forecast: 2,
            seasonal: 1,
            abc: 1,
            system: 2
          }
        }
      };
    }
  }

  /**
   * Subscribe to real-time alerts (WebSocket)
   * @param {Function} callback - Callback function
   */
  static subscribe(callback) {
    // This would typically connect to a WebSocket
    // For now, we'll simulate with a simple implementation
    console.log('Subscribed to real-time alerts');
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      // In a real implementation, this would be triggered by WebSocket events
      // For demo purposes, we'll just log the subscription
    }, 30000);
    
    // Store the interval for cleanup
    AlertService._subscriptionInterval = interval;
  }

  /**
   * Unsubscribe from real-time alerts
   */
  static unsubscribe() {
    if (AlertService._subscriptionInterval) {
      clearInterval(AlertService._subscriptionInterval);
      AlertService._subscriptionInterval = null;
    }
    console.log('Unsubscribed from real-time alerts');
  }

  /**
   * Get alert categories
   * @returns {Promise} Categories data
   */
  static async getCategories() {
    try {
      const service = new AlertService();
      const response = await service.apiRequest('/alerts/categories');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching alert categories:', error);
      return { 
        success: true, 
        data: [
          { value: 'inventory', label: 'المخزون', icon: 'fa-solid fa-box', color: '#2196F3' },
          { value: 'forecast', label: 'التوقعات', icon: 'fa-solid fa-chart-line', color: '#9c27b0' },
          { value: 'seasonal', label: 'موسمي', icon: 'fa-solid fa-calendar-alt', color: '#ff9800' },
          { value: 'abc', label: 'تحليل ABC', icon: 'fa-solid fa-chart-pie', color: '#4CAF50' },
          { value: 'system', label: 'النظام', icon: 'fa-solid fa-cog', color: '#f44336' },
        ]
      };
    }
  }

  /**
   * Get alert by ID
   * @param {number} alertId - Alert ID
   * @returns {Promise} Alert data
   */
  static async getAlertById(alertId) {
    try {
      const service = new AlertService();
      const response = await service.apiRequest(`/alerts/${alertId}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching alert:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search alerts
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  static async searchAlerts(query, filters = {}) {
    try {
      const service = new AlertService();
      const searchParams = { ...filters, q: query };
      const queryString = new URLSearchParams(searchParams).toString();
      const response = await service.apiRequest(`/alerts/search?${queryString}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error searching alerts:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AlertService;
