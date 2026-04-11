<template>
  <v-container fluid class="notification-center">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon class="me-3" size="32">mdi-bell-ring</v-icon>
              مركز الإشعارات
            </h1>
            <p class="text-medium-emphasis">
              إدارة وتصفح جميع إشعاراتك من مكان واحد
            </p>
          </div>
          <div class="d-flex gap-2">
            <v-btn
              variant="outlined"
              prepend-icon="mdi-check-all"
              @click="markAllAsRead"
              :disabled="unreadCount === 0"
              :loading="isMarkingAllRead"
            >
              تحديد الكل كمقروء
            </v-btn>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-delete-sweep"
              @click="clearAllDialog = true"
              color="error"
            >
              مسح الكل
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="primary" size="48" class="me-3">
                <v-icon>mdi-bell</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ totalNotifications }}</div>
                <div class="text-caption text-medium-emphasis">إجمالي الإشعارات</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="error" size="48" class="me-3">
                <v-icon>mdi-email</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ unreadCount }}</div>
                <div class="text-caption text-medium-emphasis">غير مقروء</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="warning" size="48" class="me-3">
                <v-icon>mdi-alert</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ highPriorityCount }}</div>
                <div class="text-caption text-medium-emphasis">أولوية عالية</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card class="stat-card">
          <v-card-text>
            <div class="d-flex align-center">
              <v-avatar color="success" size="48" class="me-3">
                <v-icon>mdi-check-circle</v-icon>
              </v-avatar>
              <div>
                <div class="text-h4 font-weight-bold">{{ readCount }}</div>
                <div class="text-caption text-medium-emphasis">مقروء</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters Section -->
    <v-card class="mb-6">
      <v-card-title class="d-flex align-center">
        <v-icon class="me-2">mdi-filter-variant</v-icon>
        الفلاتر
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          size="small"
          @click="clearFilters"
          :disabled="!hasActiveFilters"
        >
          مسح الفلاتر
        </v-btn>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text>
        <v-row>
          <!-- Search -->
          <v-col cols="12" md="4">
            <v-text-field
              v-model="searchQuery"
              label="البحث في الإشعارات"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
            ></v-text-field>
          </v-col>

          <!-- Category Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.category"
              :items="categoryOptions"
              label="الفئة"
              clearable
              hide-details
              item-title="label"
              item-value="value"
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props">
                  <template v-slot:prepend>
                    <v-icon>{{ item.raw.icon }}</v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>

          <!-- Priority Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.priority"
              :items="priorityOptions"
              label="الأولوية"
              clearable
              hide-details
            ></v-select>
          </v-col>

          <!-- Status Filter -->
          <v-col cols="12" md="2">
            <v-select
              v-model="filters.isRead"
              :items="statusOptions"
              label="الحالة"
              clearable
              hide-details
            ></v-select>
          </v-col>

          <!-- Date Range -->
          <v-col cols="12" md="2">
            <v-menu
              v-model="dateMenu"
              :close-on-content-click="false"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-bind="props"
                  :model-value="dateRangeText"
                  label="الفترة الزمنية"
                  readonly
                  clearable
                  @click:clear="clearDateRange"
                  hide-details
                ></v-text-field>
              </template>
              <v-card min-width="300">
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <v-text-field
                        v-model="filters.dateFrom"
                        type="date"
                        label="من"
                        hide-details
                      ></v-text-field>
                    </v-col>
                    <v-col cols="6">
                      <v-text-field
                        v-model="filters.dateTo"
                        type="date"
                        label="إلى"
                        hide-details
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="mt-2">
                    <v-col cols="12">
                      <v-btn
                        block
                        variant="outlined"
                        @click="setQuickDateRange('today')"
                        size="small"
                        class="mb-1"
                      >
                        اليوم
                      </v-btn>
                      <v-btn
                        block
                        variant="outlined"
                        @click="setQuickDateRange('week')"
                        size="small"
                        class="mb-1"
                      >
                        هذا الأسبوع
                      </v-btn>
                      <v-btn
                        block
                        variant="outlined"
                        @click="setQuickDateRange('month')"
                        size="small"
                      >
                        هذا الشهر
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-menu>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Notifications List -->
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <span v-if="filteredNotifications.length > 0">
            عرض {{ filteredNotifications.length }} من {{ totalNotifications }} إشعار
          </span>
          <span v-else>لا توجد إشعارات</span>
        </div>
        <div class="d-flex gap-2">
          <v-btn-toggle
            v-model="sortBy"
            mandatory
            variant="outlined"
            density="compact"
          >
            <v-btn value="created_at" size="small">
              <v-icon>mdi-clock</v-icon>
            </v-btn>
            <v-btn value="priority" size="small">
              <v-icon>mdi-alert</v-icon>
            </v-btn>
          </v-btn-toggle>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <div v-if="filteredNotifications.length > 0" class="notification-list">
        <v-list>
          <template v-for="(notification, index) in paginatedNotifications" :key="notification.id">
            <v-list-item
              :class="{
                'unread': !notification.is_read,
                'priority-high': notification.priority === 'high',
                'priority-critical': notification.priority === 'critical'
              }"
              class="notification-item"
              @click="handleNotificationClick(notification)"
            >
              <template v-slot:prepend>
                <v-avatar
                  :color="getNotificationColor(notification.category)"
                  size="40"
                  class="me-3"
                >
                  <v-icon size="20" color="white">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>

              <v-list-item-content>
                <v-list-item-title class="text-h6 font-weight-medium mb-1">
                  {{ notification.title }}
                </v-list-item-title>
                <v-list-item-subtitle class="text-body-1 mb-2">
                  {{ notification.message }}
                </v-list-item-subtitle>
                
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    :color="getPriorityColor(notification.priority)"
                    size="small"
                    variant="flat"
                  >
                    <v-icon size="small" start>mdi-alert</v-icon>
                    {{ getPriorityLabel(notification.priority) }}
                  </v-chip>
                  
                  <v-chip
                    :color="getCategoryColor(notification.category)"
                    size="small"
                    variant="outlined"
                  >
                    <v-icon size="small" start>{{ getCategoryIcon(notification.category) }}</v-icon>
                    {{ getCategoryLabel(notification.category) }}
                  </v-chip>
                  
                  <span class="text-caption text-medium-emphasis">
                    <v-icon size="small" start>mdi-clock</v-icon>
                    {{ formatTime(notification.created_at) }}
                  </span>
                </div>

                <div v-if="notification.action_url" class="mt-2">
                  <v-btn
                    size="small"
                    :href="notification.action_url"
                    variant="outlined"
                    @click.stop
                  >
                    <v-icon size="small" start>mdi-open-in-new</v-icon>
                    {{ notification.action_text || 'فتح الرابط' }}
                  </v-btn>
                </div>
              </v-list-item-content>

              <template v-slot:append>
                <div class="d-flex flex-column align-end gap-1">
                  <v-btn
                    v-if="!notification.is_read"
                    icon="mdi-circle"
                    size="small"
                    color="primary"
                    variant="text"
                    class="unread-indicator"
                  ></v-btn>
                  
                  <div class="d-flex gap-1">
                    <v-btn
                      icon="mdi-check"
                      size="small"
                      variant="text"
                      @click.stop="markAsRead(notification.id)"
                      :disabled="notification.is_read"
                    >
                    </v-btn>
                    
                    <v-btn
                      icon="mdi-delete"
                      size="small"
                      variant="text"
                      color="error"
                      @click.stop="deleteNotification(notification.id)"
                    >
                    </v-btn>
                  </div>
                </div>
              </template>
            </v-list-item>
            
            <v-divider v-if="index < paginatedNotifications.length - 1"></v-divider>
          </template>
        </v-list>
      </div>

      <v-card-text v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-bell-off-outline
        </v-icon>
        <div class="text-h6 mb-2">لا توجد إشعارات</div>
        <div class="text-body-2 text-medium-emphasis mb-4">
          {{ hasActiveFilters ? 'لم يتم العثور على إشعارات تطابق الفلاتر المحددة' : 'لم تتلق أي إشعارات بعد' }}
        </div>
        <v-btn
          v-if="hasActiveFilters"
          variant="outlined"
          @click="clearFilters"
        >
          مسح الفلاتر
        </v-btn>
      </v-card-text>

      <!-- Pagination -->
      <v-divider v-if="totalPages > 1"></v-divider>
      <v-card-actions v-if="totalPages > 1" class="pa-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
        ></v-pagination>
      </v-card-actions>
    </v-card>

    <!-- Clear All Dialog -->
    <v-dialog v-model="clearAllDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h5">
          تأكيد مسح الكل
        </v-card-title>
        <v-card-text>
          هل أنت متأكد من أنك تريد مسح جميع الإشعارات؟ هذا الإجراء لا يمكن التراجع عنه.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="clearAllDialog = false">إلغاء</v-btn>
          <v-btn color="error" @click="confirmClearAll" :loading="isClearingAll">
            مسح الكل
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useNotificationsStore, NOTIFICATION_CATEGORIES, NOTIFICATION_PRIORITIES } from '@/stores/notifications'

const notificationsStore = useNotificationsStore()

// Reactive state
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref('created_at')
const dateMenu = ref(false)
const clearAllDialog = ref(false)
const isMarkingAllRead = ref(false)
const isClearingAll = ref(false)
const itemsPerPage = 20

// Computed properties
const notifications = computed(() => notificationsStore.notifications)
const unreadCount = computed(() => notificationsStore.unreadCount)
const filters = computed(() => notificationsStore.filters)
const filteredNotifications = computed(() => {
  let filtered = notifications.value

  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    )
  }

  // Apply store filters
  if (filters.value.category) {
    filtered = filtered.filter(n => n.category === filters.value.category)
  }

  if (filters.value.priority) {
    filtered = filtered.filter(n => n.priority === filters.value.priority)
  }

  if (filters.value.isRead !== null) {
    filtered = filtered.filter(n => n.is_read === filters.value.isRead)
  }

  if (filters.value.dateFrom) {
    filtered = filtered.filter(n => new Date(n.created_at) >= new Date(filters.value.dateFrom))
  }

  if (filters.value.dateTo) {
    filtered = filtered.filter(n => new Date(n.created_at) <= new Date(filters.value.dateTo))
  }

  // Apply sorting
  if (sortBy.value === 'priority') {
    const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 }
    filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
  } else {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return filtered
})

const totalNotifications = computed(() => notifications.value.length)
const readCount = computed(() => notifications.value.filter(n => n.is_read).length)
const highPriorityCount = computed(() => 
  notifications.value.filter(n => n.priority === 'high' || n.priority === 'critical').length
)

const totalPages = computed(() => Math.ceil(filteredNotifications.value.length / itemsPerPage))
const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredNotifications.value.slice(start, end)
})

const hasActiveFilters = computed(() => {
  return searchQuery.value ||
         filters.value.category ||
         filters.value.priority ||
         filters.value.isRead !== null ||
         filters.value.dateFrom ||
         filters.value.dateTo
})

const dateRangeText = computed(() => {
  if (filters.value.dateFrom && filters.value.dateTo) {
    return `من ${filters.value.dateFrom} إلى ${filters.value.dateTo}`
  }
  if (filters.value.dateFrom) {
    return `من ${filters.value.dateFrom}`
  }
  if (filters.value.dateTo) {
    return `حتى ${filters.value.dateTo}`
  }
  return ''
})

// Filter options
const categoryOptions = [
  { value: null, label: 'الكل', icon: 'mdi-dots-horizontal' },
  { value: NOTIFICATION_CATEGORIES.ORDER, label: 'الطلبات', icon: 'mdi-shopping' },
  { value: NOTIFICATION_CATEGORIES.FINANCE, label: 'المالية', icon: 'mdi-cash' },
  { value: NOTIFICATION_CATEGORIES.SECURITY, label: 'الأمان', icon: 'mdi-shield-account' },
  { value: NOTIFICATION_CATEGORIES.MARKETING, label: 'التسويق', icon: 'mdi-bullhorn' },
  { value: NOTIFICATION_CATEGORIES.INVENTORY, label: 'المخزون', icon: 'mdi-package' },
  { value: NOTIFICATION_CATEGORIES.LOGISTICS, label: 'اللوجستيات', icon: 'mdi-truck' },
  { value: NOTIFICATION_CATEGORIES.SYSTEM, label: 'النظام', icon: 'mdi-cog' },
  { value: NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE, label: 'خدمة العملاء', icon: 'mdi-headset' },
]

const priorityOptions = [
  { value: null, title: 'الكل' },
  { value: NOTIFICATION_PRIORITIES.CRITICAL, title: 'حرج' },
  { value: NOTIFICATION_PRIORITIES.HIGH, title: 'عالي' },
  { value: NOTIFICATION_PRIORITIES.MEDIUM, title: 'متوسط' },
  { value: NOTIFICATION_PRIORITIES.LOW, title: 'منخفض' },
]

const statusOptions = [
  { value: null, title: 'الكل' },
  { value: false, title: 'غير مقروء' },
  { value: true, title: 'مقروء' },
]

// Methods
const getNotificationIcon = (type) => {
  const icons = {
    'payment_success': 'mdi-credit-card-check',
    'payment_failed': 'mdi-credit-card-remove',
    'order_created': 'mdi-shopping-plus',
    'order_confirmed': 'mdi-check-circle',
    'order_cancelled': 'mdi-cancel',
    'order_shipped': 'mdi-truck',
    'order_delivered': 'mdi-home',
    'stock_low': 'mdi-alert',
    'login_new_device': 'mdi-devices',
    'password_changed': 'mdi-lock-reset',
    'shipping_confirmed': 'mdi-truck-check',
    'system_maintenance': 'mdi-wrench',
    'promotion_launched': 'mdi-megaphone',
  }
  return icons[type] || 'mdi-bell'
}

const getNotificationColor = (category) => {
  const colors = {
    [NOTIFICATION_CATEGORIES.FINANCE]: 'success',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'warning',
    [NOTIFICATION_CATEGORIES.ORDER]: 'info',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'error',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'purple',
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'grey',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'teal',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'indigo',
  }
  return colors[category] || 'primary'
}

const getPriorityColor = (priority) => {
  const colors = {
    [NOTIFICATION_PRIORITIES.LOW]: 'grey',
    [NOTIFICATION_PRIORITIES.MEDIUM]: 'blue',
    [NOTIFICATION_PRIORITIES.HIGH]: 'orange',
    [NOTIFICATION_PRIORITIES.CRITICAL]: 'red',
  }
  return colors[priority] || 'grey'
}

const getPriorityLabel = (priority) => {
  const labels = {
    [NOTIFICATION_PRIORITIES.LOW]: 'منخفض',
    [NOTIFICATION_PRIORITIES.MEDIUM]: 'متوسط',
    [NOTIFICATION_PRIORITIES.HIGH]: 'عالي',
    [NOTIFICATION_PRIORITIES.CRITICAL]: 'حرج',
  }
  return labels[priority] || 'متوسط'
}

const getCategoryColor = (category) => {
  const colors = {
    [NOTIFICATION_CATEGORIES.FINANCE]: 'success',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'warning',
    [NOTIFICATION_CATEGORIES.ORDER]: 'info',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'error',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'purple',
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'grey',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'teal',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'indigo',
  }
  return colors[category] || 'primary'
}

const getCategoryIcon = (category) => {
  const icons = {
    [NOTIFICATION_CATEGORIES.FINANCE]: 'mdi-cash',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'mdi-package',
    [NOTIFICATION_CATEGORIES.ORDER]: 'mdi-shopping',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'mdi-shield-account',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'mdi-bullhorn',
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'mdi-cog',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'mdi-truck',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'mdi-headset',
  }
  return icons[category] || 'mdi-bell'
}

const getCategoryLabel = (category) => {
  const labels = {
    [NOTIFICATION_CATEGORIES.FINANCE]: 'المالية',
    [NOTIFICATION_CATEGORIES.INVENTORY]: 'المخزون',
    [NOTIFICATION_CATEGORIES.ORDER]: 'الطلبات',
    [NOTIFICATION_CATEGORIES.SECURITY]: 'الأمان',
    [NOTIFICATION_CATEGORIES.MARKETING]: 'التسويق',
    [NOTIFICATION_CATEGORIES.SYSTEM]: 'النظام',
    [NOTIFICATION_CATEGORIES.LOGISTICS]: 'اللوجستيات',
    [NOTIFICATION_CATEGORIES.CUSTOMER_SERVICE]: 'خدمة العملاء',
  }
  return labels[category] || 'أخرى'
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'الآن'
  if (diffMins < 60) return `منذ ${diffMins} دقيقة`
  if (diffHours < 24) return `منذ ${diffHours} ساعة`
  if (diffDays < 7) return `منذ ${diffDays} يوم`
  
  return date.toLocaleDateString('ar-DZ')
}

const handleNotificationClick = async (notification) => {
  if (!notification.is_read) {
    await notificationsStore.markAsRead(notification.id)
  }

  if (notification.action_url) {
    window.location.href = notification.action_url
  }
}

const markAsRead = async (notificationId) => {
  await notificationsStore.markAsRead(notificationId)
}

const markAllAsRead = async () => {
  isMarkingAllRead.value = true
  try {
    await notificationsStore.markAllAsRead()
  } finally {
    isMarkingAllRead.value = false
  }
}

const deleteNotification = async (notificationId) => {
  await notificationsStore.deleteNotification(notificationId)
}

const confirmClearAll = async () => {
  isClearingAll.value = true
  try {
    await notificationsStore.clearAll()
    clearAllDialog.value = false
  } finally {
    isClearingAll.value = false
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  notificationsStore.clearFilters()
  currentPage.value = 1
}

const clearDateRange = () => {
  notificationsStore.setFilters({ dateFrom: null, dateTo: null })
}

const setQuickDateRange = (range) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  let dateFrom, dateTo
  
  switch (range) {
    case 'today':
      dateFrom = today.toISOString().split('T')[0]
      dateTo = today.toISOString().split('T')[0]
      break
    case 'week':
      const weekAgo = new Date(today)
      weekAgo.setDate(weekAgo.getDate() - 7)
      dateFrom = weekAgo.toISOString().split('T')[0]
      dateTo = today.toISOString().split('T')[0]
      break
    case 'month':
      const monthAgo = new Date(today)
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      dateFrom = monthAgo.toISOString().split('T')[0]
      dateTo = today.toISOString().split('T')[0]
      break
  }
  
  notificationsStore.setFilters({ dateFrom, dateTo })
  dateMenu.value = false
}

// Watch for changes to reset pagination
watch([searchQuery, filters, sortBy], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  notificationsStore.fetchNotifications()
})
</script>

<style scoped>
.notification-center {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-list {
  max-height: 600px;
  overflow-y: auto;
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
  border-left: 4px solid var(--v-theme-primary);
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

.v-list-item {
  min-height: 80px;
}

@media (max-width: 768px) {
  .notification-center {
    padding: 8px;
  }
  
  .stat-card .v-card-text {
    padding: 16px;
  }
  
  .notification-item {
    min-height: auto;
  }
}
</style>
