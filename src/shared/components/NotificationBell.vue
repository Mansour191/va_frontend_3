<template>
  <v-menu v-model="menu" :close-on-content-click="false" max-width="400">
    <template v-slot:activator="{ props }">
      <v-btn
        icon="mdi-bell"
        variant="text"
        v-bind="props"
        class="notification-bell"
        :class="{ 'has-notifications': unreadCount > 0 }"
      >
        <v-badge
          v-if="unreadCount > 0"
          :content="unreadCount > 99 ? '99+' : unreadCount.toString()"
          :color="getBadgeColor()"
          overlap
          :dot="unreadCount <= 3"
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
        <v-icon v-else>mdi-bell-outline</v-icon>
      </v-btn>
    </template>

    <v-card class="notification-dropdown" elevation="8">
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <div class="d-flex align-center">
          <v-icon class="me-2">mdi-bell-ring</v-icon>
          <span class="text-h6">{{ $t('notifications') || 'الإشعارات' }}</span>
          <v-chip
            v-if="unreadCount > 0"
            size="small"
            :color="getBadgeColor()"
            class="ms-2"
          >
            {{ unreadCount }} جديد
          </v-chip>
        </div>
        <div class="d-flex ga-1">
          <v-btn
            v-if="unreadCount > 0"
            size="small"
            variant="text"
            @click="markAllAsRead"
            :loading="isMarkingAllRead"
          >
            <v-icon size="small">mdi-check-all</v-icon>
          </v-btn>
          <v-btn
            size="small"
            variant="text"
            @click="refreshNotifications"
            :loading="isLoading"
          >
            <v-icon size="small">mdi-refresh</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Filters -->
      <v-card-text class="pa-2 pb-0">
        <div class="d-flex gap-1 mb-2">
          <v-chip
            v-for="category in categoryFilters"
            :key="category.value"
            :value="category.value"
            :color="filters.category === category.value ? 'primary' : 'default'"
            size="small"
            variant="outlined"
            clickable
            @click="toggleCategoryFilter(category.value)"
          >
            <v-icon size="small" start>{{ category.icon }}</v-icon>
            {{ category.label }}
          </v-chip>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Notification List -->
      <div class="notification-list" style="max-height: 350px; overflow-y: auto;">
        <v-list density="compact">
          <template v-if="filteredNotifications.length > 0">
            <v-list-item
              v-for="notification in paginatedNotifications"
              :key="notification.id"
              :class="{ 
                'unread': !notification.isRead,
                'priority-high': getPriority(notification.dataJson) === 'high',
                'priority-critical': getPriority(notification.dataJson) === 'critical'
              }"
              @click="handleNotificationClick(notification)"
              class="notification-item"
            >
              <template v-slot:prepend>
                <v-avatar
                  :color="getNotificationColor(notification.type)"
                  size="32"
                  class="me-3"
                >
                  <v-icon size="16" color="white">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-content>
                <v-list-item-title class="text-body-2 font-weight-medium">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-caption mt-1">
                  {{ notification.message }}
                </v-list-item-subtitle>
                <div class="d-flex align-center mt-1">
                  <v-chip
                    :color="getPriorityColor(getPriority(notification.dataJson))"
                    size="x-small"
                    variant="flat"
                    class="me-1"
                  >
                    {{ getPriorityLabel(getPriority(notification.dataJson)) }}
                  </v-chip>
                  <span class="text-caption text-medium-emphasis">
                    {{ formatTime(notification.createdAt) }}
                  </span>
                </div>
              </v-list-item-content>

              <template v-slot:append>
                <div class="d-flex flex-column align-end">
                  <v-btn
                    v-if="!notification.isRead"
                    icon="mdi-circle"
                    size="x-small"
                    color="primary"
                    variant="text"
                    class="unread-indicator"
                  ></v-btn>
                  <v-btn
                    icon="mdi-close"
                    size="x-small"
                    variant="text"
                    @click.stop="deleteNotification(notification.id)"
                    class="delete-btn"
                  ></v-btn>
                </div>
              </template>
            </v-list-item>
          </template>

          <v-list-item v-else class="text-center pa-6">
            <v-icon size="48" color="grey-lighten-1" class="mb-2">
              mdi-bell-off-outline
            </v-icon>
            <div class="text-body-2 text-medium-emphasis mb-2">
              {{ $t('noNotifications') || 'لا توجد إشعارات' }}
            </div>
            <v-btn
              size="small"
              variant="outlined"
              @click="refreshNotifications"
              :loading="isLoading"
            >
              <v-icon size="small" start>mdi-refresh</v-icon>
              تحديث
            </v-btn>
          </v-list-item>
        </v-list>
      </div>

      <v-divider></v-divider>

      <v-card-actions v-if="filteredNotifications.length > 0" class="pa-2">
        <v-btn
          block
          variant="text"
          @click="viewAllNotifications"
          prepend-icon="mdi-view-list"
        >
          {{ $t('viewAllNotifications') || 'عرض جميع الإشعارات' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

const router = useRouter()

// GraphQL Queries
const GET_UNREAD_NOTIFICATIONS = gql`
  query GetUnreadNotifications {
    unreadNotifications {
      id
      title
      message
      type
      isRead
      dataJson
      createdAt
    }
  }
`

const GET_UNREAD_COUNT = gql`
  query GetUnreadCount {
    unreadCount
  }
`

const MARK_NOTIFICATION_AS_READ = gql`
  mutation MarkNotificationAsRead($id: ID, $markAll: Boolean) {
    markNotificationAsRead(id: $id, markAll: $markAll) {
      success
      unreadCount
    }
  }
`

const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id) {
      success
      unreadCount
    }
  }
`

// Reactive state
const menu = ref(false)
const isMarkingAllRead = ref(false)
const filters = ref({ category: null })
const page = ref(1)
const itemsPerPage = 10

// GraphQL queries
const {
  result: notificationsResult,
  loading: notificationsLoading,
  error: notificationsError,
  refetch: refetchNotifications
} = useQuery(GET_UNREAD_NOTIFICATIONS, null, {
  pollInterval: 30000, // Refresh every 30 seconds
  errorPolicy: 'all'
})

const {
  result: countResult,
  loading: countLoading,
  refetch: refetchCount
} = useQuery(GET_UNREAD_COUNT, null, {
  pollInterval: 30000, // Refresh every 30 seconds
  errorPolicy: 'all'
})

// Mutations
const { mutate: markAsRead } = useMutation(MARK_NOTIFICATION_AS_READ, {
  update: (cache, { data: { markNotificationAsRead } }) => {
    if (markNotificationAsRead.success) {
      refetchCount()
    }
  }
})

const { mutate: deleteNotificationMutate } = useMutation(DELETE_NOTIFICATION, {
  update: (cache, { data: { deleteNotification } }) => {
    if (deleteNotification.success) {
      refetchCount()
      refetchNotifications()
    }
  }
})

// Computed properties
const notifications = computed(() => notificationsResult.value?.unreadNotifications || [])
const unreadCount = computed(() => countResult.value?.unreadCount || 0)
const loading = computed(() => notificationsLoading.value || countLoading.value)

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  if (filters.value.category) {
    filtered = filtered.filter(n => n.type === filters.value.category)
  }
  
  return filtered
})

const paginatedNotifications = computed(() => {
  const start = (page.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNotifications.value.slice(start, end)
})

// Category filters
const categoryFilters = ref([
  { value: null, label: 'All', icon: 'mdi-dots-horizontal' },
  { value: 'info', label: 'Info', icon: 'mdi-information' },
  { value: 'success', label: 'Success', icon: 'mdi-check-circle' },
  { value: 'warning', label: 'Warning', icon: 'mdi-alert' },
  { value: 'error', label: 'Error', icon: 'mdi-error' },
])

// Methods
const getNotificationIcon = (type) => {
  const icons = {
    'payment_success': 'mdi-credit-card-check',
    'payment_failed': 'mdi-credit-card-remove',
    'refund_processed': 'mdi-cash-refund',
    'ccp_received': 'mdi-bank-transfer-in',
    'coupon_applied': 'mdi-ticket-percent',
    'coupon_expired': 'mdi-clock-alert',
    
    'order_created': 'mdi-shopping-plus',
    'order_confirmed': 'mdi-check-circle',
    'order_cancelled': 'mdi-cancel',
    'order_shipped': 'mdi-truck',
    'order_delivered': 'mdi-home',
    'order_returned': 'mdi-package-variant-closed',
    'order_modified': 'mdi-pencil',
    
    'stock_low': 'mdi-alert',
    'stock_out': 'mdi-alert-octagon',
    'product_added': 'mdi-package-variant-plus',
    'product_updated': 'mdi-package-variant-closed',
    
    'login_new_device': 'mdi-devices',
    'password_changed': 'mdi-lock-reset',
    'login_failed': 'mdi-lock-alert',
    'account_locked': 'mdi-account-lock',
    
    'shipping_confirmed': 'mdi-truck-check',
    'shipping_delayed': 'mdi-truck-alert',
    'delivery_failed': 'mdi-truck-remove',
    'package_received': 'mdi-warehouse',
    
    'system_maintenance': 'mdi-wrench',
    'system_update': 'mdi-update',
    'database_backup': 'mdi-database',
    
    'promotion_launched': 'mdi-megaphone',
    'newsletter_sent': 'mdi-email-newsletter',
    'campaign_completed': 'mdi-chart-line',
    
    'support_ticket_created': 'mdi-headset',
    'support_ticket_resolved': 'mdi-check-all',
    'feedback_received': 'mdi-comment-quote',
    
    'info': 'mdi-information',
    'success': 'mdi-check-circle',
    'warning': 'mdi-alert',
    'error': 'mdi-error'
  }
  return icons[type] || 'mdi-bell'
}

const getNotificationColor = (type) => {
  const colors = {
    'payment_success': 'success',
    'order_confirmed': 'success',
    'order_delivered': 'success',
    'coupon_applied': 'success',
    'support_ticket_resolved': 'success',
    'success': 'success',
    
    'payment_failed': 'error',
    'order_cancelled': 'error',
    'login_failed': 'error',
    'account_locked': 'error',
    'stock_out': 'error',
    'error': 'error',
    
    'stock_low': 'warning',
    'coupon_expired': 'warning',
    'login_new_device': 'warning',
    'warning': 'warning',
    
    'order_created': 'info',
    'order_shipped': 'info',
    'product_added': 'info',
    'system_maintenance': 'info',
    'system_update': 'info',
    'promotion_launched': 'info',
    'newsletter_sent': 'info',
    'support_ticket_created': 'info',
    'feedback_received': 'info',
    'info': 'info'
  }
  return colors[type] || 'primary'
}

const getPriority = (data) => {
  if (!data || typeof data !== 'object') return 'medium'
  return data.priority || 'medium'
}

const getPriorityColor = (priority) => {
  const colors = {
    'low': 'grey',
    'medium': 'blue',
    'high': 'orange',
    'critical': 'red',
  }
  return colors[priority] || 'grey'
}

const getPriorityLabel = (priority) => {
  const labels = {
    'low': 'Low',
    'medium': 'Medium',
    'high': 'High',
    'critical': 'Critical',
  }
  return labels[priority] || 'Medium'
}

const getBadgeColor = () => {
  if (unreadCount.value > 10) return 'error'
  if (unreadCount.value > 5) return 'warning'
  if (unreadCount.value > 0) return 'primary'
  return 'default'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}

const handleNotificationClick = async (notification) => {
  try {
    // Mark as read
    if (!notification.isRead) {
      await markAsRead({ id: notification.id, markAll: false })
    }

    // Extract link from data JSON field and navigate
    if (notification.dataJson && typeof notification.dataJson === 'object') {
      const link = notification.dataJson.link || notification.dataJson.url || notification.dataJson.route
      
      if (link) {
        // Close dropdown first
        menu.value = false
        
        // Navigate using vue-router
        if (typeof link === 'string') {
          // Check if it's a relative path (internal route) or absolute URL
          if (link.startsWith('/')) {
            await router.push(link)
          } else if (link.startsWith('http')) {
            // External link - open in new tab
            window.open(link, '_blank')
          } else {
            // Treat as relative path
            await router.push('/' + link)
          }
        }
        
        return
      }
      
      // Handle special navigation cases from data
      if (notification.dataJson.orderId) {
        await router.push(`/orders/${notification.dataJson.orderId}`)
        return
      }
      
      if (notification.dataJson.productId) {
        await router.push(`/products/${notification.dataJson.productId}`)
        return
      }
      
      if (notification.dataJson.userId) {
        await router.push(`/users/${notification.dataJson.userId}`)
        return
      }
    }

    // Default action - close dropdown
    menu.value = false
  } catch (error) {
    console.error('Error handling notification click:', error)
    // Still close the dropdown even if there's an error
    menu.value = false
  }
}

const markAllAsRead = async () => {
  isMarkingAllRead.value = true
  try {
    await markAsRead({ markAll: true })
    refetchNotifications()
  } catch (error) {
    console.error('Error marking all as read:', error)
  } finally {
    isMarkingAllRead.value = false
  }
}

const deleteNotification = async (notificationId) => {
  try {
    await deleteNotificationMutate({ id: notificationId })
  } catch (error) {
    console.error('Error deleting notification:', error)
  }
}

const refreshNotifications = async () => {
  try {
    await refetchNotifications()
    await refetchCount()
  } catch (error) {
    console.error('Error refreshing notifications:', error)
  }
}

const viewAllNotifications = () => {
  router.push('/notifications')
  menu.value = false
}

const toggleCategoryFilter = (category) => {
  filters.value.category = filters.value.category === category ? null : category
  page.value = 1 // Reset to first page when filter changes
}

// Lifecycle
onMounted(() => {
  // Listen for custom notification events
  window.addEventListener('notification', handleNewNotification)
})

onUnmounted(() => {
  window.removeEventListener('notification', handleNewNotification)
})

const handleNewNotification = (event) => {
  const notification = event.detail
  
  // Show browser notification if page is not visible
  if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: getPriority(notification.data) === 'critical'
    })
  }
  
  // Refresh notifications
  refreshNotifications()
}
</script>

<style scoped>
.notification-bell {
  position: relative;
  transition: all 0.3s ease;
}

.notification-bell.has-notifications {
  animation: bell-ring 2s ease-in-out infinite;
}

@keyframes bell-ring {
  0%, 100% { transform: rotate(0deg); }
  10%, 30%, 50%, 70%, 90% { transform: rotate(-10deg); }
  20%, 40%, 60%, 80% { transform: rotate(10deg); }
}

.notification-dropdown {
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.notification-item.unread {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-left: 3px solid var(--v-theme-primary);
}

.notification-item.priority-high {
  border-left-color: #ff9800;
}

.notification-item.priority-critical {
  border-left-color: #f44336;
  background-color: rgba(244, 67, 54, 0.08);
}

.unread-indicator {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .delete-btn {
  opacity: 1;
}

.v-list-item {
  min-height: 72px;
}
</style>
