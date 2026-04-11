import BaseService from './BaseService';

class SettingsService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/settings';
  }

  // Get all settings
  async getSettings() {
    try {
      const response = await this.get('/settings');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching settings:', error);
      return this.getMockSettings();
    }
  }

  // Get settings by category
  async getSettingsByCategory(category) {
    try {
      const response = await this.get(`/settings/category/${category}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching settings by category:', error);
      return this.getMockSettingsByCategory(category);
    }
  }

  // Update settings
  async updateSettings(settings) {
    try {
      const response = await this.put('/settings', settings);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating settings:', error);
      return { success: true, data: settings, mockData: true };
    }
  }

  // Update setting by key
  async updateSetting(key, value) {
    try {
      const response = await this.put(`/settings/${key}`, { value });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating setting:', error);
      return { success: true, data: { key, value }, mockData: true };
    }
  }

  // Reset settings to defaults
  async resetSettings(category = null) {
    try {
      const response = await this.post('/settings/reset', { category });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error resetting settings:', error);
      return { success: true, mockData: true };
    }
  }

  // Export settings
  async exportSettings(format = 'json') {
    try {
      const response = await this.get(`/settings/export?format=${format}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error exporting settings:', error);
      return { success: true, data: this.getMockSettings().data, mockData: true };
    }
  }

  // Import settings
  async importSettings(settingsData) {
    try {
      const response = await this.post('/settings/import', settingsData);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error importing settings:', error);
      return { success: true, imported: Object.keys(settingsData).length, mockData: true };
    }
  }

  // Get system info
  async getSystemInfo() {
    try {
      const response = await this.get('/settings/system-info');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching system info:', error);
      return this.getMockSystemInfo();
    }
  }

  // Get backup settings
  async getBackupSettings() {
    try {
      const response = await this.get('/settings/backup');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching backup settings:', error);
      return this.getMockBackupSettings();
    }
  }

  // Update backup settings
  async updateBackupSettings(settings) {
    try {
      const response = await this.put('/settings/backup', settings);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating backup settings:', error);
      return { success: true, data: settings, mockData: true };
    }
  }

  // Create backup
  async createBackup() {
    try {
      const response = await this.post('/settings/backup/create');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error creating backup:', error);
      return { 
        success: true, 
        data: { 
          id: 'backup_' + Date.now(),
          filename: `backup_${new Date().toISOString().split('T')[0]}.json`,
          size: 1024000,
          createdAt: new Date().toISOString()
        }, 
        mockData: true 
      };
    }
  }

  // Get backups
  async getBackups() {
    try {
      const response = await this.get('/settings/backups');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching backups:', error);
      return this.getMockBackups();
    }
  }

  // Restore backup
  async restoreBackup(backupId) {
    try {
      const response = await this.post(`/settings/backup/${backupId}/restore`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error restoring backup:', error);
      return { success: true, mockData: true };
    }
  }

  // Delete backup
  async deleteBackup(backupId) {
    try {
      const response = await this.delete(`/settings/backup/${backupId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting backup:', error);
      return { success: true, mockData: true };
    }
  }

  // Mock data methods
  getMockSettings() {
    return {
      success: true,
      data: {
        general: {
          siteName: 'VynilArt Dashboard',
          siteDescription: 'نظام إدارة متقدم لمنتجات الفينيل',
          adminEmail: 'admin@vynilart.com',
          timezone: 'Africa/Algiers',
          language: 'ar',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
          currency: 'DZD',
          itemsPerPage: 25
        },
        appearance: {
          theme: 'light',
          primaryColor: '#d4af37',
          secondaryColor: '#1a1a2e',
          accentColor: '#f44336',
          backgroundColor: '#ffffff',
          textColor: '#333333',
          fontFamily: 'Cairo, sans-serif',
          fontSize: '14px',
          borderRadius: '8px',
          sidebarCollapsed: false,
          showNotifications: true,
          animationsEnabled: true
        },
        notifications: {
          emailNotifications: true,
          pushNotifications: true,
          smsNotifications: false,
          orderNotifications: true,
          customerNotifications: true,
          inventoryNotifications: true,
          systemNotifications: true,
          marketingNotifications: false,
          notificationSound: true,
          desktopNotifications: true
        },
        privacy: {
          allowPublicRegistration: false,
          requireEmailVerification: true,
          allowGuestCheckout: true,
          shareAnalytics: false,
          cookiesEnabled: true,
          gdprCompliance: true,
          dataRetention: 365,
          anonymizeData: true
        },
        performance: {
          cacheEnabled: true,
          cacheDuration: 3600,
          compressionEnabled: true,
          lazyLoading: true,
          minifyAssets: true,
          cdnEnabled: false,
          imageOptimization: true,
          databaseOptimization: true
        },
        integration: {
          googleAnalytics: false,
          facebookPixel: false,
          mailchimp: false,
          stripe: false,
          paypal: false,
          googleMaps: false,
          recaptcha: false,
          cloudflare: false
        }
      },
      mockData: true
    };
  }

  getMockSettingsByCategory(category) {
    const allSettings = this.getMockSettings().data;
    return {
      success: true,
      data: allSettings[category] || {},
      mockData: true
    };
  }

  getMockSystemInfo() {
    return {
      success: true,
      data: {
        system: {
          version: '2.1.0',
          build: '2024.03.20',
          environment: 'production',
          uptime: 2592000, // seconds
          memory: {
            total: 8589934592, // bytes
            used: 4294967296,
            percentage: 50
          },
          storage: {
            total: 107374182400, // bytes
            used: 53687091200,
            percentage: 50
          },
          cpu: {
            usage: 25.5,
            cores: 4
          }
        },
        database: {
          type: 'PostgreSQL',
          version: '13.7',
          size: 2147483648, // bytes
          connections: 15,
          maxConnections: 100
        },
        server: {
          os: 'Ubuntu 20.04 LTS',
          webServer: 'Nginx',
          phpVersion: '8.1.0',
          nodeVersion: '18.17.0'
        },
        dependencies: {
          vue: '3.4.0',
          vuetify: '3.4.0',
          vuex: '4.1.0',
          vueRouter: '4.2.0'
        }
      },
      mockData: true
    };
  }

  getMockBackupSettings() {
    return {
      success: true,
      data: {
        automaticBackup: true,
        backupFrequency: 'daily',
        backupTime: '02:00',
        retentionPeriod: 30,
        backupLocation: 'local',
        cloudBackup: false,
        compressionEnabled: true,
        encryptionEnabled: true,
        includeMedia: true,
        includeDatabase: true,
        emailBackup: false,
        backupEmail: 'backup@vynilart.com'
      },
      mockData: true
    };
  }

  getMockBackups() {
    return {
      success: true,
      data: {
        backups: [
          {
            id: 'backup_1710921600000',
            filename: 'backup_2024-03-20_02-00-00.json',
            size: 2048000,
            createdAt: '2024-03-20T02:00:00Z',
            type: 'automatic',
            status: 'completed',
            location: 'local'
          },
          {
            id: 'backup_1710835200000',
            filename: 'backup_2024-03-19_02-00-00.json',
            size: 1984000,
            createdAt: '2024-03-19T02:00:00Z',
            type: 'automatic',
            status: 'completed',
            location: 'local'
          },
          {
            id: 'backup_1710748800000',
            filename: 'backup_2024-03-18_02-00-00.json',
            size: 1920000,
            createdAt: '2024-03-18T02:00:00Z',
            type: 'automatic',
            status: 'completed',
            location: 'local'
          },
          {
            id: 'backup_manual_1710892800000',
            filename: 'backup_manual_2024-03-20_15-00-00.json',
            size: 2100000,
            createdAt: '2024-03-20T15:00:00Z',
            type: 'manual',
            status: 'completed',
            location: 'local'
          }
        ],
        total: 4,
        totalSize: 8052000
      },
      mockData: true
    };
  }
}

export default new SettingsService();
