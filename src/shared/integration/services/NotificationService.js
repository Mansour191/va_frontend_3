/**
 * NotificationService.js
 * خدمة إدارة الإشعارات والربط مع قاعدة البيانات
 */

import store from '@/store';

class NotificationService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
    this.hasPermission = false;
    this.init();
  }

  async init() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        this.hasPermission = true;
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        this.hasPermission = permission === 'granted';
      }
    }
  }

  // ========== API Methods ==========

  /**
   * جلب إشعارات المستخدم
   * @returns {Promise<Array>} - قائمة الإشعارات
   */
  async getNotifications() {
    const cacheKey = 'user_notifications';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/notifications/`;
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
      const notifications = this._transformNotifications(data.results || data);
      
      this._setCache(cacheKey, notifications);
      return notifications;
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      return this.getFallbackNotifications();
    }
  }

  /**
   * وضع علامة مقروء على إشعار
   * @param {number} notificationId - معرف الإشعار
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async markAsRead(notificationId) {
    try {
      const url = `${this.apiBaseUrl}/notifications/${notificationId}/read/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('user_notifications');
      
      return true;
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * وضع علامة مقروء على جميع الإشعارات
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async markAllAsRead() {
    try {
      const url = `${this.apiBaseUrl}/notifications/mark-all-read/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('user_notifications');
      
      return true;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * حذف إشعار
   * @param {number} notificationId - معرف الإشعار
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async deleteNotification(notificationId) {
    try {
      const url = `${this.apiBaseUrl}/notifications/${notificationId}/`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('user_notifications');
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * الحصول على عدد الإشعارات غير المقروءة
   * @returns {Promise<number>} - العدد
   */
  async getUnreadCount() {
    try {
      const url = `${this.apiBaseUrl}/notifications/unread-count/`;
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
      return data.count || 0;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  }

  // ========== Notification Sending Methods ==========

  /**
   * إرسال إشعار (داخل التطبيق + سطح المكتب + توست)
   */
  notify({ title, message, type = 'info', icon = 'fa-solid fa-info-circle', link = null }) {
    // 1. إضافة الإشعار للمتجر (Vuex)
    store.dispatch('user/addNotification', {
      title,
      message,
      type,
      icon,
      link,
      read: false,
      createdAt: new Date().toISOString()
    });

    // 2. إظهار إشعار سطح المكتب إذا كان مسموحاً
    if (this.hasPermission && document.visibilityState !== 'visible') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }

    // 3. إرسال حدث للتوست (Toast)
    window.dispatchEvent(new CustomEvent('app-toast', {
      detail: { title, message, type, icon }
    }));
  }

  // اختصارات لأنواع الإشعارات
  success(title, message, link = null) {
    this.notify({ title, message, type: 'success', icon: 'fa-solid fa-check-circle', link });
  }

  error(title, message, link = null) {
    this.notify({ title, message, type: 'error', icon: 'fa-solid fa-exclamation-circle', link });
  }

  warning(title, message, link = null) {
    this.notify({ title, message, type: 'warning', icon: 'fa-solid fa-exclamation-triangle', link });
  }

  info(title, message, link = null) {
    this.notify({ title, message, type: 'info', icon: 'fa-solid fa-info-circle', link });
  }

  order(title, message, link = null) {
    this.notify({ title, message, type: 'order', icon: 'fa-solid fa-shopping-bag', link });
  }

  delivery(title, message, link = null) {
    this.notify({ title, message, type: 'delivery', icon: 'fa-solid fa-truck', link });
  }

  promotion(title, message, link = null) {
    this.notify({ title, message, type: 'promotion', icon: 'fa-solid fa-tag', link });
  }

  // ========== Helper Methods ==========

  /**
   * تحويل بيانات الإشعارات من الـ API
   */
  _transformNotifications(data) {
    return data.map(notification => this._transformNotification(notification));
  }

  /**
   * تحصر إشعار واحد
   */
  _transformNotification(notification) {
    return {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      read: notification.read,
      createdAt: notification.created_at,
      updatedAt: notification.updated_at,
      action: notification.action ? {
        text: notification.action.text,
        url: notification.action.url,
        notificationId: notification.id
      } : null
    };
  }

  /**
   * بيانات احتياطية للإشعارات
   */
  getFallbackNotifications() {
    return [
      {
        id: 1,
        title: 'طلب جديد #1234',
        message: 'تم استلام طلبك بنجاح وجاري تجهيزه',
        type: 'order',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        action: {
          text: 'عرض الطلب',
          url: '/customer/orders/1234',
          notificationId: 1
        }
      },
      {
        id: 2,
        title: 'تم شحن طلبك',
        message: 'طلبك #1234 في الطريق إلى عنوانك',
        type: 'delivery',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        action: {
          text: 'تتبع الشحنة',
          url: '/customer/orders/1234',
          notificationId: 2
        }
      },
      {
        id: 3,
        title: 'عرض خاص',
        message: 'خصم 20% على جميع منتجات الفينيل',
        type: 'promotion',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        action: {
          text: 'عرض العروض',
          url: '/shop',
          notificationId: 3
        }
      },
      {
        id: 4,
        title: 'تأكيد الدفع',
        message: 'تم تأكيد دفع طلبك #1233 بنجاح',
        type: 'success',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        action: {
          text: 'عرض التفاصيل',
          url: '/customer/orders/1233',
          notificationId: 4
        }
      },
      {
        id: 5,
        title: 'تحديث النظام',
        message: 'تم تحديث نظام التسوق بإمكانيات جديدة',
        type: 'system',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
        action: null
      }
    ];
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

export default new NotificationService();
