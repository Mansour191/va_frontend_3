import BaseService from './BaseService';

class AdminService extends BaseService {
  constructor() {
    super('/admin');
  }

  /**
   * Get dashboard statistics
   * @returns {Promise} Dashboard stats data
   */
  static async getDashboardStats() {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/dashboard/stats');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return fallback data
      return { 
        success: true, 
        data: {
          posts: 128,
          categories: 8,
          products: 256,
          comments: 342,
          users: 89,
          views: '45.2K'
        }
      };
    }
  }

  /**
   * Get recent posts
   * @param {number} limit - Number of posts to return
   * @returns {Promise} Recent posts data
   */
  static async getRecentPosts(limit = 10) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest(`/posts/recent?limit=${limit}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      // Return fallback data
      return { 
        success: true, 
        data: [
          {
            id: 1,
            title: 'كيف تختار الفينيل المناسب لمشروعك؟',
            image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
            date: '15 مارس 2026',
            views: 1234,
            comments: 23,
          },
          {
            id: 2,
            title: '10 أفكار لتجديد غرفة نوم أطفالك بالفينيل',
            image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
            date: '12 مارس 2026',
            views: 856,
            comments: 15,
          },
          {
            id: 3,
            title: '5 أخطاء شائعة عند تركيب الفينيل',
            image: 'https://i.postimg.cc/htCcH3cZ/table1.png',
            date: '10 مارس 2026',
            views: 2100,
            comments: 42,
          },
        ]
      };
    }
  }

  /**
   * Delete a post
   * @param {number} postId - Post ID to delete
   * @returns {Promise} Delete response
   */
  static async deletePost(postId) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest(`/posts/${postId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting post:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get admin users
   * @returns {Promise} Admin users data
   */
  static async getAdminUsers() {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/users');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching admin users:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create admin user
   * @param {Object} userData - User data
   * @returns {Promise} Create response
   */
  static async createAdminUser(userData) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating admin user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update admin user
   * @param {number} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise} Update response
   */
  static async updateAdminUser(userId, userData) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating admin user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete admin user
   * @param {number} userId - User ID to delete
   * @returns {Promise} Delete response
   */
  static async deleteAdminUser(userId) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest(`/users/${userId}`, {
        method: 'DELETE'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system logs
   * @param {Object} filters - Log filters
   * @returns {Promise} System logs data
   */
  static async getSystemLogs(filters = {}) {
    try {
      const service = new AdminService();
      const queryString = new URLSearchParams(filters).toString();
      const response = await service.apiRequest(`/logs?${queryString}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get system settings
   * @returns {Promise} System settings data
   */
  static async getSystemSettings() {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/settings');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching system settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update system settings
   * @param {Object} settings - Settings data
   * @returns {Promise} Update response
   */
  static async updateSystemSettings(settings) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error updating system settings:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get backup data
   * @returns {Promise} Backup data
   */
  static async getBackupData() {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/backup');
      return { success: true, data: response };
    } catch (error) {
      console.error('Error fetching backup data:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Create backup
   * @param {Object} backupOptions - Backup options
   * @returns {Promise} Backup response
   */
  static async createBackup(backupOptions = {}) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest('/backup', {
        method: 'POST',
        body: JSON.stringify(backupOptions)
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Restore backup
   * @param {string} backupId - Backup ID
   * @returns {Promise} Restore response
   */
  static async restoreBackup(backupId) {
    try {
      const service = new AdminService();
      const response = await service.apiRequest(`/backup/restore/${backupId}`, {
        method: 'POST'
      });
      return { success: true, data: response };
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: false, error: error.message };
    }
  }
}

export default AdminService;
