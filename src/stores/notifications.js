/**
 * Centralized Notification Store (Pinia)
 * This store manages all notification state and real-time updates
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vuetify'

// Enhanced notification types matching backend
export const NOTIFICATION_TYPES = {
  // Finance
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  REFUND_PROCESSED: 'refund_processed',
  CCP_RECEIVED: 'ccp_received',
  COUPON_APPLIED: 'coupon_applied',
  COUPON_EXPIRED: 'coupon_expired',
  
  // Orders
  ORDER_CREATED: 'order_created',
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_SHIPPED: 'order_shipped',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_RETURNED: 'order_returned',
  ORDER_MODIFIED: 'order_modified',
  
  // Inventory
  STOCK_LOW: 'stock_low',
  STOCK_OUT: 'stock_out',
  PRODUCT_ADDED: 'product_added',
  PRODUCT_UPDATED: 'product_updated',
  
  // Security
  LOGIN_NEW_DEVICE: 'login_new_device',
  PASSWORD_CHANGED: 'password_changed',
  LOGIN_FAILED: 'login_failed',
  ACCOUNT_LOCKED: 'account_locked',
  
  // Logistics
  SHIPPING_CONFIRMED: 'shipping_confirmed',
  SHIPPING_DELAYED: 'shipping_delayed',
  DELIVERY_FAILED: 'delivery_failed',
  PACKAGE_RECEIVED: 'package_received',
  
  // System
  SYSTEM_MAINTENANCE: 'system_maintenance',
  SYSTEM_UPDATE: 'system_update',
  DATABASE_BACKUP: 'database_backup',
  
  // Marketing
  PROMOTION_LAUNCHED: 'promotion_launched',
  NEWSLETTER_SENT: 'newsletter_sent',
  CAMPAIGN_COMPLETED: 'campaign_completed',
  
  // Customer Service
  SUPPORT_TICKET_CREATED: 'support_ticket_created',
  SUPPORT_TICKET_RESOLVED: 'support_ticket_resolved',
  FEEDBACK_RECEIVED: 'feedback_received',
}

export const NOTIFICATION_CATEGORIES = {
  FINANCE: 'finance',
  INVENTORY: 'inventory',
  ORDER: 'order',
  SECURITY: 'security',
  MARKETING: 'marketing',
  SYSTEM: 'system',
  LOGISTICS: 'logistics',
  CUSTOMER_SERVICE: 'customer_service',
}

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

export const useNotificationsStore = defineStore('notifications', () => {
  // State
  const notifications = ref([])
  const unreadCount = ref(0)
  const isLoading = ref(false)
  const lastFetched = ref(null)
  const filters = ref({
    category: null,
    priority: null,
    isRead: null,
    dateFrom: null,
    dateTo: null,
  })
  const wsConnection = ref(null)
  const pollingInterval = ref(null)

  // Toast system
  const toast = useToast()

  // Computed
  const recentNotifications = computed(() => {
    return notifications.value.slice(0, 10)
  })

  const unreadNotifications = computed(() => {
    return notifications.value.filter(n => !n.isRead)
  })

  const notificationsByCategory = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      const category = notification.category || 'system'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(notification)
    })
    return grouped
  })

  const notificationsByPriority = computed(() => {
    const grouped = {}
    notifications.value.forEach(notification => {
      const priority = notification.priority || 'medium'
      if (!grouped[priority]) {
        grouped[priority] = []
      }
      grouped[priority].push(notification)
    })
    return grouped
  })

  const filteredNotifications = computed(() => {
    let filtered = [...notifications.value]

    if (filters.value.category) {
      filtered = filtered.filter(n => n.category === filters.value.category)
    }

    if (filters.value.priority) {
      filtered = filtered.filter(n => n.priority === filters.value.priority)
    }

    if (filters.value.isRead !== null) {
      filtered = filtered.filter(n => n.isRead === filters.value.isRead)
    }

    if (filters.value.dateFrom) {
      filtered = filtered.filter(n => new Date(n.createdAt) >= new Date(filters.value.dateFrom))
    }

    if (filters.value.dateTo) {
      filtered = filtered.filter(n => new Date(n.createdAt) <= new Date(filters.value.dateTo))
    }

    return filtered
  })

  // Actions
  async function fetchNotifications(forceRefresh = false) {
    if (isLoading.value) return

    const now = Date.now()
    if (!forceRefresh && lastFetched.value && (now - lastFetched.value) < 30000) {
      return // Don't fetch if less than 30 seconds ago
    }

    isLoading.value = true

    try {
      const query = `
        query {
          myNotifications {
            id
            title
            message
            type
            category
            priority
            isRead
            readAt
            actionUrl
            actionText
            createdAt
            updatedAt
          }
        }
      `

      const response = await makeGraphQLRequest(query)
      
      notifications.value = response.myNotifications || []
      updateUnreadCount()
      lastFetched.value = now
      saveToStorage()
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      isLoading.value = false
    }
  }

  async function markAsRead(notificationId) {
    try {
      const notification = notifications.value.find(n => n.id === notificationId)
      if (notification && !notification.isRead) {
        const mutation = `
          mutation MarkNotificationAsRead($notificationId: ID!) {
            markNotificationAsRead(notificationId: $notificationId) {
              success
              message
              notification {
                id
                isRead
                readAt
              }
            }
          }
        `

        const variables = { notificationId }
        const response = await makeGraphQLRequest(mutation, variables)
        
        if (response.markNotificationAsRead.success) {
          notification.isRead = true
          notification.readAt = new Date().toISOString()
          
          updateUnreadCount()
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  async function markAllAsRead() {
    try {
      const unreadIds = notifications.value
        .filter(n => !n.isRead)
        .map(n => n.id)

      if (unreadIds.length === 0) return

      const mutation = `
        mutation MarkAllNotificationsAsRead($notificationIds: [ID!]!) {
          markAllNotificationsAsRead(notificationIds: $notificationIds) {
            success
            message
            updatedCount
          }
        }
      `

      const variables = { notificationIds: unreadIds }
      const response = await makeGraphQLRequest(mutation, variables)
      
      if (response.markAllNotificationsAsRead.success) {
        notifications.value.forEach(n => {
          if (!n.isRead) {
            n.isRead = true
            n.readAt = new Date().toISOString()
          }
        })

        updateUnreadCount()
        saveToStorage()
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const index = notifications.value.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        const notification = notifications.value[index]
        
        const mutation = `
          mutation DeleteNotification($notificationId: ID!) {
            deleteNotification(notificationId: $notificationId) {
              success
              message
            }
          }
        `

        const variables = { notificationId }
        const response = await makeGraphQLRequest(mutation, variables)
        
        if (response.deleteNotification.success) {
          notifications.value.splice(index, 1)
          if (!notification.isRead) {
            updateUnreadCount()
          }
          saveToStorage()
        }
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  async function clearAll() {
    try {
      const mutation = `
        mutation ClearAllNotifications {
          clearAllNotifications {
            success
            message
            clearedCount
          }
        }
      `

      const response = await makeGraphQLRequest(mutation)
      
      if (response.clearAllNotifications.success) {
        notifications.value = []
        unreadCount.value = 0
        saveToStorage()
      }
    } catch (error) {
      console.error('Error clearing all notifications:', error)
    }
  }

  function addNotification(notification) {
    // Add to beginning of array
    notifications.value.unshift(notification)
    
    // Update unread count
    if (!notification.is_read) {
      unreadCount.value++
    }

    // Show toast notification
    showToast(notification)

    // Save to storage
    saveToStorage()

    // Emit custom event
    window.dispatchEvent(new CustomEvent('notification', {
      detail: notification
    }))
  }

  function showToast(notification) {
    const priorityColors = {
      low: 'info',
      medium: 'success',
      high: 'warning',
      critical: 'error',
    }

    const color = priorityColors[notification.priority] || 'info'
    
    toast({
      title: notification.title,
      text: notification.message,
      color: color,
      timeout: notification.priority === 'critical' ? 0 : 5000,
      actions: notification.action_url ? [
        {
          title: notification.action_text || 'عرض',
          color: 'white',
          handler: () => {
            window.location.href = notification.action_url
          }
        }
      ] : undefined
    })
  }

  function updateUnreadCount() {
    unreadCount.value = notifications.value.filter(n => !n.isRead).length
  }

  function setFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters }
  }

  function clearFilters() {
    filters.value = {
      category: null,
      priority: null,
      isRead: null,
      dateFrom: null,
      dateTo: null,
    }
  }

  async function makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await fetch('/graphql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.errors) {
        throw new Error(result.errors[0].message)
      }
      
      return result.data
    } catch (error) {
      console.error('❌ GraphQL request error:', error)
      throw error
    }
  }

  function getAuthToken() {
    return localStorage.getItem('auth_token') || ''
  }

  function saveToStorage() {
    try {
      const data = {
        notifications: notifications.value,
        unreadCount: unreadCount.value,
        lastFetched: lastFetched.value,
      }
      localStorage.setItem('notifications_store', JSON.stringify(data))
    } catch (error) {
      console.error('Error saving notifications to storage:', error)
    }
  }

  function loadFromStorage() {
    try {
      const stored = localStorage.getItem('notifications_store')
      if (stored) {
        const data = JSON.parse(stored)
        notifications.value = data.notifications || []
        unreadCount.value = data.unreadCount || 0
        lastFetched.value = data.lastFetched || null
      }
    } catch (error) {
      console.error('Error loading notifications from storage:', error)
    }
  }

  // WebSocket connection
  function setupWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}/ws/notifications/`
      
      wsConnection.value = new WebSocket(wsUrl)

      wsConnection.value.onopen = () => {
        console.log('WebSocket connected for notifications')
      }

      wsConnection.value.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data)
          addNotification(notification)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      wsConnection.value.onclose = () => {
        console.log('WebSocket disconnected, attempting to reconnect...')
        setTimeout(setupWebSocket, 5000)
      }

      wsConnection.value.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

    } catch (error) {
      console.warn('WebSocket not available, falling back to polling')
      setupPolling()
    }
  }

  // Polling fallback
  function setupPolling() {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }

    pollingInterval.value = setInterval(async () => {
      try {
        const query = `
          query {
            unreadNotifications {
              id
              title
              message
              type
              category
              priority
              isRead
              readAt
              actionUrl
              actionText
              createdAt
              updatedAt
            }
          }
        `

        const response = await makeGraphQLRequest(query)

        if (response.ok) {
          const newNotifications = await response.json()
          newNotifications.forEach(notification => {
            if (!notifications.value.find(n => n.id === notification.id)) {
              addNotification(notification)
            }
          })
        }
      } catch (error) {
        console.warn('Error polling notifications:', error)
      }
    }, 30000) // Poll every 30 seconds
  }

  function cleanup() {
    if (wsConnection.value) {
      wsConnection.value.close()
      wsConnection.value = null
    }
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
    }
  }

  // Initialize
  function initialize() {
    loadFromStorage()
    fetchNotifications()
    setupWebSocket()
  }

  return {
    // State
    notifications,
    unreadCount,
    isLoading,
    filters,
    
    // Computed
    recentNotifications,
    unreadNotifications,
    notificationsByCategory,
    notificationsByPriority,
    filteredNotifications,
    
    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    addNotification,
    setFilters,
    clearFilters,
    initialize,
    cleanup,
    
    // Constants
    NOTIFICATION_TYPES,
    NOTIFICATION_CATEGORIES,
    NOTIFICATION_PRIORITIES,
  }
})
