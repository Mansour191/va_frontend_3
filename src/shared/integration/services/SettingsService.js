/**
 * SettingsService.js
 * GraphQL-based service for managing user profile, privacy, and security settings
 * This service handles all user settings through GraphQL queries and mutations
 */

import { useQuery, useMutation } from '@vue/apollo-composable';
import { useSubscriptionManager } from '@/composables/useSubscriptionManager';
import {
  GET_PROFILE_SETTINGS_QUERY,
  GET_PRIVACY_SETTINGS_QUERY,
  GET_SECURITY_SETTINGS_QUERY,
  GET_PREFERENCES_QUERY,
  GET_ALL_SETTINGS_QUERY,
  UPDATE_PROFILE_SETTINGS_MUTATION,
  UPDATE_PRIVACY_SETTINGS_MUTATION,
  UPDATE_SECURITY_SETTINGS_MUTATION,
  UPDATE_PREFERENCES_MUTATION,
  CHANGE_PASSWORD_MUTATION,
  UPDATE_ALL_SETTINGS_MUTATION,
  SETTINGS_UPDATE_SUBSCRIPTION,
  PROFILE_UPDATE_SUBSCRIPTION
} from '@/integration/graphql/settings.graphql';

class SettingsService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes
    this.serviceName = 'SettingsService';
    this.subscriptionManager = useSubscriptionManager(this.serviceName);
  }

  /**
   * Get user profile settings
   * @returns {Promise<Object>} - Profile settings
   */
  async getProfileSettings() {
    const cacheKey = 'profile_settings';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { result } = await new Promise((resolve, reject) => {
        const { result, error, loading } = useQuery(GET_PROFILE_SETTINGS_QUERY);
        
        const unwatch = this.subscriptionManager.trackWatcher(
          'profile_settings_query',
          () => {
            if (!loading.value) {
              if (error.value) {
                reject(error.value);
              } else if (result.value) {
                resolve({ result: result.value });
              }
              unwatch();
            }
          }
        );
      });

      if (result?.me) {
        const settings = this._transformProfileSettings(result.me);
        this._setCache(cacheKey, settings);
        return settings;
      } else {
        throw new Error('No profile settings data received');
      }
    } catch (error) {
      console.error('Error fetching profile settings:', error);
      return this.getFallbackProfileSettings();
    }
  }

  /**
   * Update profile settings
   * @param {Object} settingsData - Settings data
   * @returns {Promise<Object>} - Updated settings
   */
  async updateProfileSettings(settingsData) {
    try {
      const { result } = await new Promise((resolve, reject) => {
        const { mutate, onDone, onError } = useMutation(UPDATE_PROFILE_SETTINGS_MUTATION);
        
        mutate({
          input: this._prepareProfileSettingsData(settingsData)
        });

        onDone((response) => {
          resolve({ result: response.data });
        });

        onError((error) => {
          reject(error);
        });
      });

      if (result?.updateProfileSettings?.user) {
        const settings = this._transformProfileSettings(result.updateProfileSettings.user);
        
        // Clear cache to force refresh
        this.cache.delete('profile_settings');
        
        return settings;
      } else {
        throw new Error('Failed to update profile settings');
      }
    } catch (error) {
      console.error('Error updating profile settings:', error);
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
      const { result } = await new Promise((resolve, reject) => {
        const { result, error, loading } = useQuery(GET_PRIVACY_SETTINGS_QUERY);
        
        const unwatch = this.subscriptionManager.trackWatcher(
          'privacy_settings_query',
          () => {
            if (!loading.value) {
              if (error.value) {
                reject(error.value);
              } else if (result.value) {
                resolve({ result: result.value });
              }
              unwatch();
            }
          }
        );
      });

      if (result?.me) {
        const settings = this._transformPrivacySettings(result.me);
        this._setCache(cacheKey, settings);
        return settings;
      } else {
        throw new Error('No privacy settings data received');
      }
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
      const { result } = await new Promise((resolve, reject) => {
        const { mutate, onDone, onError } = useMutation(UPDATE_PRIVACY_SETTINGS_MUTATION);
        
        mutate({
          input: this._preparePrivacySettingsData(settingsData)
        });

        onDone((response) => {
          resolve({ result: response.data });
        });

        onError((error) => {
          reject(error);
        });
      });

      if (result?.updatePrivacySettings?.user) {
        const settings = this._transformPrivacySettings(result.updatePrivacySettings.user);
        
        // Clear cache to force refresh
        this.cache.delete('privacy_settings');
        
        return settings;
      } else {
        throw new Error('Failed to update privacy settings');
      }
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
      const { result } = await new Promise((resolve, reject) => {
        const { result, error, loading } = useQuery(GET_SECURITY_SETTINGS_QUERY);
        
        const unwatch = this.subscriptionManager.trackWatcher(
          'security_settings_query',
          () => {
            if (!loading.value) {
              if (error.value) {
                reject(error.value);
              } else if (result.value) {
                resolve({ result: result.value });
              }
              unwatch();
            }
          }
        );
      });

      if (result?.me) {
        const settings = this._transformSecuritySettings(result.me);
        this._setCache(cacheKey, settings);
        return settings;
      } else {
        throw new Error('No security settings data received');
      }
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
      const { result } = await new Promise((resolve, reject) => {
        const { mutate, onDone, onError } = useMutation(UPDATE_SECURITY_SETTINGS_MUTATION);
        
        mutate({
          input: this._prepareSecuritySettingsData(settingsData)
        });

        onDone((response) => {
          resolve({ result: response.data });
        });

        onError((error) => {
          reject(error);
        });
      });

      if (result?.updateSecuritySettings?.user) {
        const settings = this._transformSecuritySettings(result.updateSecuritySettings.user);
        
        // Clear cache to force refresh
        this.cache.delete('security_settings');
        
        return settings;
      } else {
        throw new Error('Failed to update security settings');
      }
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
      const { result } = await new Promise((resolve, reject) => {
        const { result, error, loading } = useQuery(GET_PREFERENCES_QUERY);
        
        const unwatch = this.subscriptionManager.trackWatcher(
          'preferences_query',
          () => {
            if (!loading.value) {
              if (error.value) {
                reject(error.value);
              } else if (result.value) {
                resolve({ result: result.value });
              }
              unwatch();
            }
          }
        );
      });

      if (result?.me) {
        const preferences = this._transformPreferences(result.me);
        this._setCache(cacheKey, preferences);
        return preferences;
      } else {
        throw new Error('No preferences data received');
      }
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
      const { result } = await new Promise((resolve, reject) => {
        const { mutate, onDone, onError } = useMutation(UPDATE_PREFERENCES_MUTATION);
        
        mutate({
          input: this._preparePreferencesData(preferencesData)
        });

        onDone((response) => {
          resolve({ result: response.data });
        });

        onError((error) => {
          reject(error);
        });
      });

      if (result?.updatePreferences?.user) {
        const preferences = this._transformPreferences(result.updatePreferences.user);
        
        // Clear cache to force refresh
        this.cache.delete('preferences');
        
        return preferences;
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('❌ Error updating preferences:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {Object} passwordData - Password data
   * @returns {Promise<boolean>} - Success status
   */
  async changePassword(passwordData) {
    try {
      const { result } = await new Promise((resolve, reject) => {
        const { mutate, onDone, onError } = useMutation(CHANGE_PASSWORD_MUTATION);
        
        mutate({
          input: {
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
            confirmPassword: passwordData.confirmPassword
          }
        });

        onDone((response) => {
          resolve({ result: response.data });
        });

        onError((error) => {
          reject(error);
        });
      });

      if (result?.changePassword?.success) {
        return true;
      } else {
        throw new Error('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
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
   * Get authentication token using TokenManager
   */
  _getAuthToken() {
    return localStorage.getItem('token') || 'mock-token';
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
