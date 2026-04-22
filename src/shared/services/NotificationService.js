/**
 * Enhanced Notification Service
 * 
 * This service handles all notification types including:
 * - Coupon notifications
 * - Order status updates
 * - Payment confirmations
 * - System alerts
 */

import { ref } from 'vue';

// Notification store
const notifications = ref([]);
const unreadCount = ref(0);

// Notification types
export const NOTIFICATION_TYPES = {
  COUPON_APPLIED: 'coupon_applied',
  COUPON_EXPIRED: 'coupon_expired',
  COUPON_NEW: 'coupon_new',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  SYSTEM_ALERT: 'system_alert'
};

class NotificationService {
  constructor() {
    this.loadFromStorage();
    this.setupRealtimeConnection();
  }

  /**
   * Create a new notification
   */
  async create(notificationData) {
    try {
      const notification = {
        id: Date.now() + Math.random(),
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        user: notificationData.user,
        createdAt: new Date().toISOString(),
        read: false
      };

      // Add to local store
      notifications.value.unshift(notification);
      unreadCount.value++;
      
      // Save to storage
      this.saveToStorage();
      
      // Send to backend for persistence
      await this.sendToBackend(notification);
      
      // Show browser notification if permitted
      this.showBrowserNotification(notification);
      
      // Emit event for real-time updates
      this.emitNotificationEvent(notification);
      
      console.log('✅ Notification created:', notification);
      return notification;
      
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      return null;
    }
  }

  /**
   * Create coupon-specific notification
   */
  async createCouponNotification(type, couponData, user = null) {
    const messages = {
      [NOTIFICATION_TYPES.COUPON_APPLIED]: {
        title: '🎉 كوبون مطبق!',
        message: `تم تطبيق كوبون ${couponData.code} بنجاح! خصم ${couponData.discount_amount} د.ج`
      },
      [NOTIFICATION_TYPES.COUPON_EXPIRED]: {
        title: '⏰ كوبون منتهي',
        message: `كوبون ${couponData.code} انتهت صلاحيته`
      },
      [NOTIFICATION_TYPES.COUPON_NEW]: {
        title: '🎁 كوبون جديد!',
        message: `كوبون جديد: ${couponData.code} - خصم ${couponData.discount_value}%`
      }
    };

    const messageData = messages[type];
    if (!messageData) return;

    return await this.create({
      type,
      title: messageData.title,
      message: messageData.message,
      user,
      data: couponData
    });
  }

  /**
   * Create order notification
   */
  async createOrderNotification(type, orderData, user = null) {
    const messages = {
      [NOTIFICATION_TYPES.ORDER_CONFIRMED]: {
        title: '✅ تأكيد الطلب',
        message: `طلب رقم ${orderData.orderNumber} قيد المعالجة`
      },
      [NOTIFICATION_TYPES.ORDER_SHIPPED]: {
        title: '🚚 الشحن',
        message: `طلب رقم ${orderData.orderNumber} تم شحنه`
      },
      [NOTIFICATION_TYPES.ORDER_DELIVERED]: {
        title: '🏠 التسليم',
        message: `طلب رقم ${orderData.orderNumber} تم تسليمه بنجاح`
      }
    };

    const messageData = messages[type];
    if (!messageData) return;

    return await this.create({
      type,
      title: messageData.title,
      message: messageData.message,
      user,
      data: orderData
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
      this.saveToStorage();
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    unreadCount.value = 0;
    this.saveToStorage();
  }

  /**
   * Delete notification
   */
  deleteNotification(notificationId) {
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      if (!notification.read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      notifications.value.splice(index, 1);
      this.saveToStorage();
    }
  }

  /**
   * Get notifications for specific user
   */
  getUserNotifications(userId, limit = 50) {
    return notifications.value
      .filter(n => !n.user || n.user.id === userId)
      .slice(0, limit);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(userId = null) {
    if (userId) {
      return notifications.value.filter(n => 
        !n.read && (!n.user || n.user.id === userId)
      ).length;
    }
    return unreadCount.value;
  }

  /**
   * Load notifications from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('user_notifications');
      if (stored) {
        const data = JSON.parse(stored);
        notifications.value = data.notifications || [];
        unreadCount.value = data.unreadCount || 0;
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error);
    }
  }

  /**
   * Save notifications to localStorage
   */
  saveToStorage() {
    try {
      const data = {
        notifications: notifications.value,
        unreadCount: unreadCount.value
      };
      localStorage.setItem('user_notifications', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving notifications to storage:', error);
    }
  }

  /**
   * Send notification to backend for persistence
   */
  async sendToBackend(notification) {
    try {
      const { SEND_NOTIFICATION_MUTATION } = await import('@/integration/graphql/notifications.graphql');
      const { useMutation } = await import('@apollo/client');
      
      const { mutate } = useMutation(SEND_NOTIFICATION_MUTATION);
      
      await mutate({
        variables: {
          input: {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            userId: notification.userId
          }
        }
      });
    } catch (error) {
      console.warn('Error sending notification to backend:', error);
    }
  }

  /**
   * Get auth token
   */
  getAuthToken() {
    return localStorage.getItem('auth_token') || '';
  }

  /**
   * Show browser notification
   */
  showBrowserNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      });
    }
  }

  /**
   * Request browser notification permission
   */
  async requestBrowserPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }

  /**
   * Setup real-time connection (WebSocket)
   */
  setupRealtimeConnection() {
    try {
      // This would connect to your WebSocket server
      const ws = new WebSocket('ws://localhost:8000/ws/notifications/');
      
      ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        this.create(notification);
      };
      
      ws.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(() => this.setupRealtimeConnection(), 5000);
      };
      
    } catch (error) {
      console.warn('WebSocket not available, falling back to polling');
      this.setupPolling();
    }
  }

  /**
   * Setup polling fallback
   */
  setupPolling() {
    // Poll for new notifications every 30 seconds
    setInterval(async () => {
      try {
        const { GET_UNREAD_NOTIFICATIONS_QUERY } = await import('@/integration/graphql/notifications.graphql');
        const { useQuery } = await import('@apollo/client');
        
        const { data, error } = await useQuery(GET_UNREAD_NOTIFICATIONS_QUERY, {
          variables: { userId: this.getCurrentUserId() }
        });
        
        if (data.value && !error.value) {
          data.value.unreadNotifications.forEach(notification => {
            this.create(notification);
          });
        }
      } catch (error) {
        console.warn('Error polling notifications:', error);
      }
    }, 30000);
  }

  /**
   * Emit custom event for notification
   */
  emitNotificationEvent(notification) {
    const event = new CustomEvent('notification', {
      detail: notification
    });
    window.dispatchEvent(event);
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    notifications.value = [];
    unreadCount.value = 0;
    this.saveToStorage();
  }

  /**
   * Get notification statistics
   */
  getStatistics() {
    const stats = {
      total: notifications.value.length,
      unread: unreadCount.value,
      byType: {}
    };

    notifications.value.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });

    return stats;
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Export service and reactive state
export default notificationService;
export { 
  notifications, 
  unreadCount, 
};

// Auto-request browser permission
if (typeof window !== 'undefined') {
  notificationService.requestBrowserPermission();
}
