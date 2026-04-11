/**
 * SettingsService.js
 * خدمة إدارة إعدادات المستخدم الشخصية والخصوصية والأمان
 * تتولى هذه الخدمة الربط مع API لإدارة جميع إعدادات المستخدم
 */

class SettingsService {
  constructor() {
    this.apiEndpoint = import.meta.env.VITE_API_URL || 'https://api.vinylart.dz';
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 دقائق
  }

  /**
   * جلب إعدادات الملف الشخصي للمستخدم
   * @returns {Promise<Object>} - إعدادات الملف الشخصي
   */
  async getProfileSettings() {
    const cacheKey = 'profile_settings';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/user/profile/settings/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformProfileSettings(data);
      
      this._setCache(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('❌ Error fetching profile settings:', error);
      return this.getFallbackProfileSettings();
    }
  }

  /**
   * تحديث إعدادات الملف الشخصي
   * @param {Object} settingsData - بيانات الإعدادات
   * @returns {Promise<Object>} - الإعدادات المحدثة
   */
  async updateProfileSettings(settingsData) {
    try {
      const url = `${this.apiEndpoint}/user/profile/settings/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareProfileSettingsData(settingsData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformProfileSettings(data);
      
      // Clear cache to force refresh
      this.cache.delete('profile_settings');
      
      return settings;
    } catch (error) {
      console.error('❌ Error updating profile settings:', error);
      throw error;
    }
  }

  /**
   * جلب إعدادات الخصوصية
   * @returns {Promise<Object>} - إعدادات الخصوصية
   */
  async getPrivacySettings() {
    const cacheKey = 'privacy_settings';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/user/privacy/settings/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformPrivacySettings(data);
      
      this._setCache(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('❌ Error fetching privacy settings:', error);
      return this.getFallbackPrivacySettings();
    }
  }

  /**
   * تحديث إعدادات الخصوصية
   * @param {Object} settingsData - بيانات الخصوصية
   * @returns {Promise<Object>} - الإعدادات المحدثة
   */
  async updatePrivacySettings(settingsData) {
    try {
      const url = `${this.apiEndpoint}/user/privacy/settings/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._preparePrivacySettingsData(settingsData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformPrivacySettings(data);
      
      // Clear cache to force refresh
      this.cache.delete('privacy_settings');
      
      return settings;
    } catch (error) {
      console.error('❌ Error updating privacy settings:', error);
      throw error;
    }
  }

  /**
   * جلب إعدادات الأمان
   * @returns {Promise<Object>} - إعدادات الأمان
   */
  async getSecuritySettings() {
    const cacheKey = 'security_settings';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/user/security/settings/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformSecuritySettings(data);
      
      this._setCache(cacheKey, settings);
      return settings;
    } catch (error) {
      console.error('❌ Error fetching security settings:', error);
      return this.getFallbackSecuritySettings();
    }
  }

  /**
   * تحديث إعدادات الأمان
   * @param {Object} settingsData - بيانات الأمان
   * @returns {Promise<Object>} - الإعدادات المحدثة
   */
  async updateSecuritySettings(settingsData) {
    try {
      const url = `${this.apiEndpoint}/user/security/settings/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareSecuritySettingsData(settingsData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const settings = this._transformSecuritySettings(data);
      
      // Clear cache to force refresh
      this.cache.delete('security_settings');
      
      return settings;
    } catch (error) {
      console.error('❌ Error updating security settings:', error);
      throw error;
    }
  }

  /**
   * جلب التفضيلات العامة
   * @returns {Promise<Object>} - التفضيلات العامة
   */
  async getPreferences() {
    const cacheKey = 'preferences';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiEndpoint}/user/preferences/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const preferences = this._transformPreferences(data);
      
      this._setCache(cacheKey, preferences);
      return preferences;
    } catch (error) {
      console.error('❌ Error fetching preferences:', error);
      return this.getFallbackPreferences();
    }
  }

  /**
   * تحديث التفضيلات العامة
   * @param {Object} preferencesData - بيانات التفضيلات
   * @returns {Promise<Object>} - التفضيلات المحدثة
   */
  async updatePreferences(preferencesData) {
    try {
      const url = `${this.apiEndpoint}/user/preferences/`;
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._preparePreferencesData(preferencesData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const preferences = this._transformPreferences(data);
      
      // Clear cache to force refresh
      this.cache.delete('preferences');
      
      return preferences;
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * تغيير كلمة المرور
   * @param {Object} passwordData - بيانات كلمة المرور
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async changePassword(passwordData) {
    try {
      const url = `${this.apiEndpoint}/user/change-password/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل إعدادات الملف الشخصي من الـ API
   */
  _transformProfileSettings(data) {
    return {
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      bio: data.bio,
      avatar: data.avatar,
      dateOfBirth: data.date_of_birth,
      gender: data.gender
    };
  }

  /**
   * تحويل إعدادات الخصوصية من الـ API
   */
  _transformPrivacySettings(data) {
    return {
      privateProfile: data.private_profile,
      allowSearch: data.allow_search,
      showFriends: data.show_friends,
      showEmail: data.show_email,
      showPhone: data.show_phone,
      allowMessages: data.allow_messages,
      showOnlineStatus: data.show_online_status
    };
  }

  /**
   * تحويل إعدادات الأمان من الـ API
   */
  _transformSecuritySettings(data) {
    return {
      twoFactorEnabled: data.two_factor_enabled,
      emailNotifications: data.email_notifications,
      smsNotifications: data.sms_notifications,
      loginAlerts: data.login_alerts,
      sessionTimeout: data.session_timeout
    };
  }

  /**
   * تحويل التفضيلات من الـ API
   */
  _transformPreferences(data) {
    return {
      language: data.language,
      theme: data.theme,
      currency: data.currency,
      timezone: data.timezone,
      dateFormat: data.date_format,
      timeFormat: data.time_format,
      notifications: data.notifications,
      marketingEmails: data.marketing_emails
    };
  }

  /**
   * تجهيز بيانات الملف الشخصي للإرسال إلى الـ API
   */
  _prepareProfileSettingsData(settingsData) {
    return {
      first_name: settingsData.firstName,
      last_name: settingsData.lastName,
      email: settingsData.email,
      phone: settingsData.phone,
      bio: settingsData.bio,
      avatar: settingsData.avatar,
      date_of_birth: settingsData.dateOfBirth,
      gender: settingsData.gender
    };
  }

  /**
   * تجهيز بيانات الخصوصية للإرسال إلى الـ API
   */
  _preparePrivacySettingsData(settingsData) {
    return {
      private_profile: settingsData.privateProfile,
      allow_search: settingsData.allowSearch,
      show_friends: settingsData.showFriends,
      show_email: settingsData.showEmail,
      show_phone: settingsData.showPhone,
      allow_messages: settingsData.allowMessages,
      show_online_status: settingsData.showOnlineStatus
    };
  }

  /**
   * تجهيز بيانات الأمان للإرسال إلى الـ API
   */
  _prepareSecuritySettingsData(settingsData) {
    return {
      two_factor_enabled: settingsData.twoFactorEnabled,
      email_notifications: settingsData.emailNotifications,
      sms_notifications: settingsData.smsNotifications,
      login_alerts: settingsData.loginAlerts,
      session_timeout: settingsData.sessionTimeout
    };
  }

  /**
   * تجهيز بيانات التفضيلات للإرسال إلى الـ API
   */
  _preparePreferencesData(preferencesData) {
    return {
      language: preferencesData.language,
      theme: preferencesData.theme,
      currency: preferencesData.currency,
      timezone: preferencesData.timezone,
      date_format: preferencesData.dateFormat,
      time_format: preferencesData.timeFormat,
      notifications: preferencesData.notifications,
      marketing_emails: preferencesData.marketingEmails
    };
  }

  // ========== بيانات احتياطية ==========

  /**
   * بيانات احتياطية لإعدادات الملف الشخصي
   */
  getFallbackProfileSettings() {
    return {
      firstName: 'أحمد',
      lastName: 'محمد',
      email: 'ahmed@example.com',
      phone: '+213 66 123 4567',
      bio: '',
      avatar: null,
      dateOfBirth: null,
      gender: 'male'
    };
  }

  /**
   * بيانات احتياطية لإعدادات الخصوصية
   */
  getFallbackPrivacySettings() {
    return {
      privateProfile: false,
      allowSearch: true,
      showFriends: true,
      showEmail: false,
      showPhone: false,
      allowMessages: true,
      showOnlineStatus: true
    };
  }

  /**
   * بيانات احتياطية لإعدادات الأمان
   */
  getFallbackSecuritySettings() {
    return {
      twoFactorEnabled: false,
      emailNotifications: true,
      smsNotifications: false,
      loginAlerts: true,
      sessionTimeout: 30
    };
  }

  /**
   * بيانات احتياطية للتفضيلات
   */
  getFallbackPreferences() {
    return {
      language: 'ar',
      theme: 'auto',
      currency: 'DZD',
      timezone: 'Africa/Algiers',
      dateFormat: 'DD/MM/YYYY',
      timeFormat: '24h',
      notifications: true,
      marketingEmails: false
    };
  }

  /**
   * الحصول على توكن المصادقة
   */
  _getAuthToken() {
    return localStorage.getItem('authToken') || 'mock-token';
  }

  /**
   * التحقق من صلاحية الكاش
   */
  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < this.cacheTTL);
  }

  /**
   * حفظ البيانات في الكاش
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * مسح الكاش
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new SettingsService();
