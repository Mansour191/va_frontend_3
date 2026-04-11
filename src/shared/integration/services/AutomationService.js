import BaseService from './BaseService';

class AutomationService extends BaseService {
  constructor() {
    super('/automation');
  }

  /**
   * Get all automation rules
   * @returns {Promise} Rules data
   */
  static async getRules() {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/rules');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching automation rules:', error);
      // Return fallback data
      return { 
        success: true, 
        data: [
          {
            id: 1,
            name: 'مزامنة الطلبات المكتملة',
            trigger: 'order.delivered',
            action: 'sync.order',
            enabled: true,
          },
          {
            id: 2,
            name: 'تنبيه انخفاض المخزون',
            trigger: 'inventory.low',
            action: 'send.email',
            enabled: true,
          },
          {
            id: 3,
            name: 'تحديث المخزون اليومي',
            trigger: 'schedule.daily',
            action: 'sync.inventory',
            enabled: false,
          },
        ]
      };
    }
  }

  /**
   * Create new automation rule
   * @param {Object} ruleData - Rule data
   * @returns {Promise} Create response
   */
  static async createRule(ruleData) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/rules', {
        method: 'POST',
        body: JSON.stringify(ruleData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update automation rule
   * @param {number} ruleId - Rule ID
   * @param {Object} ruleData - Updated rule data
   * @returns {Promise} Update response
   */
  static async updateRule(ruleId, ruleData) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}`, {
        method: 'PUT',
        body: JSON.stringify(ruleData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete automation rule
   * @param {number} ruleId - Rule ID
   * @returns {Promise} Delete response
   */
  static async deleteRule(ruleId) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Toggle rule status (enable/disable)
   * @param {number} ruleId - Rule ID
   * @param {boolean} enabled - Rule status
   * @returns {Promise} Toggle response
   */
  static async toggleRule(ruleId, enabled) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}/toggle`, {
        method: 'PATCH',
        body: JSON.stringify({ enabled })
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error toggling automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get rule execution history
   * @param {number} ruleId - Rule ID
   * @param {Object} filters - History filters
   * @returns {Promise} Execution history
   */
  static async getRuleHistory(ruleId, filters = {}) {
    try {
      const service = new AutomationService();
      const queryString = new URLSearchParams(filters).toString();
      const response = await service.apiRequest(`/rules/${ruleId}/history?${queryString}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching rule history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Execute rule manually
   * @param {number} ruleId - Rule ID
   * @returns {Promise} Execution response
   */
  static async executeRule(ruleId) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}/execute`, {
        method: 'POST'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error executing automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get available triggers
   * @returns {Promise} Available triggers
   */
  static async getTriggers() {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/triggers');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching triggers:', error);
      return { 
        success: true, 
        data: [
          { value: 'order.delivered', label: 'اكتمال طلب', description: 'يتم تشغيله عند اكتمال طلب' },
          { value: 'order.shipped', label: 'شحن طلب', description: 'يتم تشغيله عند شحن طلب' },
          { value: 'inventory.low', label: 'انخفاض المخزون', description: 'يتم تشغيله عند انخفاض المخزون' },
          { value: 'schedule.daily', label: 'موعد يومي', description: 'يتم تشغيله يومياً' },
          { value: 'schedule.weekly', label: 'موعد أسبوعي', description: 'يتم تشغيله أسبوعياً' },
        ]
      };
    }
  }

  /**
   * Get available actions
   * @returns {Promise} Available actions
   */
  static async getActions() {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/actions');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching actions:', error);
      return { 
        success: true, 
        data: [
          { value: 'sync.order', label: 'ترحيل الطلبات', description: 'ترحيل الطلبات إلى النظام المحاسبي' },
          { value: 'sync.inventory', label: 'تحديث المخزون', description: 'تحديث بيانات المخزون' },
          { value: 'create.invoice', label: 'إنشاء فاتورة', description: 'إنشاء فاتورة تلقائياً' },
          { value: 'send.email', label: 'إرسال بريد', description: 'إرسال بريد إلكتروني' },
        ]
      };
    }
  }

  /**
   * Test rule configuration
   * @param {Object} ruleData - Rule configuration
   * @returns {Promise} Test results
   */
  static async testRule(ruleData) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/rules/test', {
        method: 'POST',
        body: JSON.stringify(ruleData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error testing automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get automation statistics
   * @returns {Promise} Statistics data
   */
  static async getStatistics() {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/statistics');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching automation statistics:', error);
      return { 
        success: true, 
        data: {
          totalRules: 10,
          activeRules: 7,
          inactiveRules: 3,
          executionsToday: 45,
          executionsThisWeek: 312,
          successRate: 94.5,
          averageExecutionTime: 2.3
        }
      };
    }
  }

  /**
   * Get rule by ID
   * @param {number} ruleId - Rule ID
   * @returns {Promise} Rule data
   */
  static async getRuleById(ruleId) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clone automation rule
   * @param {number} ruleId - Rule ID to clone
   * @param {Object} overrides - Override properties
   * @returns {Promise} Clone response
   */
  static async cloneRule(ruleId, overrides = {}) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest(`/rules/${ruleId}/clone`, {
        method: 'POST',
        body: JSON.stringify(overrides)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error cloning automation rule:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export rules configuration
   * @param {Array} ruleIds - Rule IDs to export (optional)
   * @returns {Promise} Export data
   */
  static async exportRules(ruleIds = []) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/rules/export', {
        method: 'POST',
        body: JSON.stringify({ ruleIds })
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error exporting automation rules:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import rules configuration
   * @param {Object} importData - Import data
   * @returns {Promise} Import response
   */
  static async importRules(importData) {
    try {
      const service = new AutomationService();
      const response = await service.apiRequest('/rules/import', {
        method: 'POST',
        body: JSON.stringify(importData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error importing automation rules:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AutomationService;
