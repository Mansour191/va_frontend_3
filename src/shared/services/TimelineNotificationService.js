/**
 * Timeline Notification Service
 * Integrates timeline updates with real-time toast notifications
 */

import { ref, reactive } from 'vue';
import { useStore } from 'vuex';
import { useQuery } from '@vue/apollo-composable';
import { ORDER_TIMELINE_QUERY } from '@/integration/graphql/orders.graphql';
import { subscriptionManager } from '@/composables/useSubscriptionManager';
import { websocketManager } from '@/shared/utils/websocketManager';

class TimelineNotificationService {
  constructor() {
    this.subscribers = new Map();
    this.lastTimelineEntry = new Map();
    this.notificationQueue = ref([]);
    this.isProcessing = ref(false);
    this.serviceName = 'TimelineNotificationService';
    
    // WebSocket connection for real-time updates
    this.wsConnectionName = 'timeline_notifications';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.pollIntervals = new Map();
  }

  /**
   * Subscribe to timeline updates for a specific order
   * @param {string} orderId - Order ID to subscribe to
   * @param {Function} callback - Callback function for updates
   */
  subscribe(orderId, callback) {
    if (!this.subscribers.has(orderId)) {
      this.subscribers.set(orderId, new Set());
    }
    this.subscribers.get(orderId).add(callback);
    
    // Start WebSocket connection if not already connected
    this.connectWebSocket();
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(orderId);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscribers.delete(orderId);
        }
      }
    };
  }

  /**
   * Connect to WebSocket for real-time timeline updates
   */
  async connectWebSocket() {
    try {
      const wsUrl = `${process.env.VUE_APP_WS_URL || 'ws://127.0.0.1:8000'}/timeline/`;
      
      this.wsConnection = await websocketManager.getConnection(
        this.wsConnectionName,
        wsUrl,
        {
          purpose: 'timeline_notifications',
          reconnect: true,
          maxReconnectAttempts: this.maxReconnectAttempts,
          onOpen: () => {
            console.log('Timeline WebSocket connected');
            this.reconnectAttempts = 0;
            
            // Subscribe to all active orders
            this.subscribers.forEach((callbacks, orderId) => {
              websocketManager.sendMessage(this.wsConnectionName, JSON.stringify({
                type: 'subscribe',
                orderId: orderId
              }));
            });
          },
          onMessage: (event) => {
            const data = JSON.parse(event.data);
            this.handleTimelineUpdate(data);
          },
          onClose: () => {
            console.log('Timeline WebSocket disconnected');
          },
          onError: (error) => {
            console.error('Timeline WebSocket error:', error);
          }
        }
      );
      
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }

  /**
   * Attempt to reconnect WebSocket
   */
  attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connectWebSocket();
      }, 1000 * Math.pow(2, this.reconnectAttempts)); // Exponential backoff
    }
  }

  /**
   * Handle incoming timeline updates
   * @param {Object} data - Timeline update data
   */
  handleTimelineUpdate(data) {
    const { orderId, timelineEntry, type } = data;
    
    if (type === 'timeline_update') {
      // Update last known entry
      this.lastTimelineEntry.set(orderId, timelineEntry);
      
      // Notify subscribers
      const callbacks = this.subscribers.get(orderId);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback(timelineEntry);
          } catch (error) {
            console.error('Error in timeline callback:', error);
          }
        });
      }
      
      // Show notification if it's a significant status change
      this.showTimelineNotification(timelineEntry);
    }
  }

  /**
   * Show toast notification for timeline updates
   * @param {Object} timelineEntry - Timeline entry data
   */
  showTimelineNotification(timelineEntry) {
    const store = useStore();
    
    // Only show notifications for significant status changes
    const significantStatuses = ['confirmed', 'processing', 'shipped', 'delivered'];
    
    if (significantStatuses.includes(timelineEntry.status)) {
      const statusLabels = {
        'confirmed': 'تم تأكيد طلبك',
        'processing': 'طلبك قيد المعالجة',
        'shipped': 'طلبك في الطريق إليك',
        'delivered': 'تم تسليم طلبك بنجاح'
      };
      
      const notification = {
        id: `timeline_${timelineEntry.id}`,
        type: 'success',
        title: 'تحديث حالة الطلب',
        message: statusLabels[timelineEntry.status] || `تحديث: ${timelineEntry.status}`,
        orderId: timelineEntry.orderId,
        orderNumber: timelineEntry.orderNumber,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      // Add to notification queue
      this.notificationQueue.value.push(notification);
      
      // Show toast notification
      store.dispatch('notifications/showNotification', {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        timeout: 5000,
        action: {
          text: 'عرض التفاصيل',
          callback: () => {
            // Navigate to order detail page
            window.location.href = `/orders/${timelineEntry.orderId}`;
          }
        }
      });
      
      // Play notification sound if enabled
      this.playNotificationSound();
    }
  }

  /**
   * Play notification sound
   */
  playNotificationSound() {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(error => {
        // Ignore errors (user might have disabled autoplay)
      });
    } catch (error) {
      // Ignore if sound file doesn't exist
    }
  }

  /**
   * Poll for timeline updates (fallback method)
   * @param {string} orderId - Order ID to poll for
   */
  async pollTimelineUpdates(orderId) {
    try {
      const { client } = await import('@/shared/plugins/apolloPlugin');
      const { result } = await client.default.query({
        query: ORDER_TIMELINE_QUERY,
        variables: { orderId },
        fetchPolicy: 'network-only'
      });
      
      if (result.data?.orderTimeline) {
        const latestEntry = result.data.orderTimeline[0]; // Most recent first
        
        // Check if we have a new entry
        const lastKnownEntry = this.lastTimelineEntry.get(orderId);
        if (!lastKnownEntry || latestEntry.id !== lastKnownEntry.id) {
          this.handleTimelineUpdate({
            orderId,
            timelineEntry: latestEntry,
            type: 'timeline_update'
          });
        }
      }
    } catch (error) {
      console.error('Error polling timeline updates:', error);
    }
  }

  /**
   * Start polling for timeline updates
   * @param {string} orderId - Order ID to poll for
   * @param {number} interval - Polling interval in milliseconds
   */
  startPolling(orderId, interval = 30000) {
    // Clear existing interval for this order
    this.stopPolling(orderId);
    
    const intervalId = setInterval(() => {
      this.pollTimelineUpdates(orderId);
    }, interval);
    
    // Track in subscription manager
    const trackedInterval = subscriptionManager.registerInterval(
      `timeline_poll_${orderId}`,
      intervalId,
      {
        componentName: this.serviceName,
        type: 'timeline_polling'
      }
    );
    
    this.pollIntervals.set(orderId, trackedInterval);
    console.log(`📊 Started polling for order ${orderId} every ${interval}ms`);
  }

  /**
   * Stop polling for timeline updates
   * @param {string} orderId - Order ID to stop polling for
   */
  stopPolling(orderId) {
    const trackedInterval = this.pollIntervals.get(orderId);
    if (trackedInterval) {
      trackedInterval.clear();
      this.pollIntervals.delete(orderId);
      console.log(`⏹️ Stopped polling for order ${orderId}`);
    }
  }

  /**
   * Get unread notifications
   * @returns {Array} Array of unread notifications
   */
  getUnreadNotifications() {
    return this.notificationQueue.value.filter(n => !n.read);
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID to mark as read
   */
  markAsRead(notificationId) {
    const notification = this.notificationQueue.value.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  }

  /**
   * Clear all notifications
   */
  clearNotifications() {
    this.notificationQueue.value = [];
  }

  /**
   * Composable for Vue components
   */
  useTimelineNotifications(orderId) {
    const store = useStore();
    const notifications = ref([]);
    
    // Subscribe to timeline updates
    const unsubscribe = this.subscribe(orderId, (timelineEntry) => {
      // Add to local notifications
      notifications.value.unshift({
        ...timelineEntry,
        timestamp: new Date().toISOString(),
        read: false
      });
    });
    
    // Start polling as fallback
    this.startPolling(orderId, 30000); // Poll every 30 seconds
    
    // Cleanup on unmount
    const cleanup = () => {
      unsubscribe();
      this.stopPolling(orderId);
    };
    
    return {
      notifications,
      unreadCount: computed(() => notifications.value.filter(n => !n.read).length),
      markAsRead: (id) => {
        const notification = notifications.value.find(n => n.id === id);
        if (notification) {
          notification.read = true;
        }
      },
      clearAll: () => {
        notifications.value = [];
      },
      cleanup
    };
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    console.log('🧹 TimelineNotificationService: Cleaning up all resources...');
    
    // Stop all polling intervals
    this.pollIntervals.forEach((trackedInterval, orderId) => {
      this.stopPolling(orderId);
    });
    
    // Close WebSocket connection
    if (this.wsConnectionName) {
      websocketManager.closeConnection(this.wsConnectionName);
    }
    
    // Clear all subscribers
    this.subscribers.clear();
    
    // Clear notifications
    this.notificationQueue.value = [];
    
    // Use subscription manager for cleanup
    subscriptionManager.cleanupComponent(this.serviceName);
    
    console.log('✅ TimelineNotificationService cleanup completed');
  }

  /**
   * Get service statistics
   */
  getStats() {
    return {
      activeSubscribers: this.subscribers.size,
      activePollingIntervals: this.pollIntervals.size,
      queuedNotifications: this.notificationQueue.value.length,
      websocketConnected: this.wsConnection ? 
        websocketManager.getConnectionStatus(this.wsConnectionName)?.readyState === WebSocket.OPEN : false
    };
  }
}

// Create singleton instance
const timelineNotificationService = new TimelineNotificationService();

export default timelineNotificationService;

// Export composable for easy use in Vue components
export const useTimelineNotifications = (orderId) => {
  return timelineNotificationService.useTimelineNotifications(orderId);
};
