<template>
  <div class="notifications-container">
    <!-- Notifications Button -->
    <v-btn
      @click="toggleDropdown"
      icon
      variant="outlined"
      class="notifications-btn"
      ref="btn"
    >
      <v-icon>mdi-bell</v-icon>
      <v-badge
        v-if="unreadCount > 0"
        :content="unreadCount > 99 ? '99+' : unreadCount"
        color="error"
        offset-x="-4"
        offset-y="-4"
        :dot="unreadCount <= 1"
      />
    </v-btn>

    <!-- Notifications Dropdown -->
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      location="bottom end"
      offset="10"
      transition="slide-y-transition"
    >
      <v-card min-width="380" max-width="420" elevation="8" class="notifications-dropdown">
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6 font-weight-bold">
            <v-icon color="primary" class="me-2">mdi-bell</v-icon>
            {{ $t('notifications') || 'الإشعارات' }}
            <v-chip v-if="unreadCount > 0" size="small" color="error" variant="elevated" class="ms-2">
              {{ unreadCount }} {{ $t('new') || 'جديد' }}
            </v-chip>
          </span>
          <div class="d-flex ga-1">
            <v-btn
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              icon="mdi-check-all"
              variant="text"
              size="small"
              color="primary"
              :title="$t('markAllAsRead') || 'تحديد الكل كمقروء'"
            />
            <v-btn
              @click="isOpen = false"
              icon="mdi-close"
              variant="text"
              size="small"
              color="default"
            />
          </div>
        </v-card-title>
        
        <v-divider />
        
        <!-- Search -->
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            :placeholder="$t('searchNotifications') || 'البحث في الإشعارات...'"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-card-text>
        
        <!-- Notifications List -->
        <v-card-text class="pa-0">
          <!-- Loading State -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="32" class="mb-4" />
            <p class="text-body-2 text-medium-emphasis">
              {{ $t('loadingNotifications') || 'جاري تحميل الإشعارات...' }}
            </p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredNotifications.length === 0" class="text-center pa-8">
            <v-icon size="64" color="info" class="mb-4 opacity-50">
              mdi-bell-off
            </v-icon>
            <h3 class="text-h5 font-weight-medium mb-2">
              {{ $t('noNotifications') || 'لا توجد إشعارات' }}
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ $t('noNotificationsMessage') || 'لم يتم العثور على إشعارات حالياً' }}
            </p>
            <v-btn
              :to="'/notifications'"
              variant="outlined"
              color="primary"
              prepend-icon="mdi-view-list"
              @click="isOpen = false"
            >
              {{ $t('viewAll') || 'عرض الكل' }}
            </v-btn>
          </div>
          
          <!-- Notifications List -->
          <v-list v-else density="compact" class="notifications-list" max-height="400">
            <v-list-item
              v-for="notification in paginatedNotifications"
              :key="notification.id"
              :class="[
                'notification-item transition-all',
                { 'bg-surface-lighten-1': !notification.read }
              ]"
              @click="markAsRead(notification.id)"
              class="cursor-pointer"
            >
              <template v-slot:prepend>
                <v-avatar
                  size="40"
                  :color="getNotificationColor(notification.type)"
                  class="me-3"
                >
                  <v-icon size="20" color="white">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="text-body-1 font-weight-medium mb-1">
                <div class="d-flex align-center ga-2">
                  <span>{{ notification.title }}</span>
                  <v-chip
                    v-if="!notification.read"
                    size="x-small"
                    color="primary"
                    variant="elevated"
                  >
                    {{ $t('new') || 'جديد' }}
                  </v-chip>
                </div>
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-body-2 mb-1 text-medium-emphasis">
                {{ notification.message }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="text-caption text-medium-emphasis">
                <div class="d-flex align-center ga-4">
                  <span class="d-flex align-center ga-1">
                    <v-icon size="12">mdi-clock</v-icon>
                    {{ formatTime(notification.time) }}
                  </span>
                  <v-chip
                    :color="getNotificationColor(notification.type)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ getNotificationLabel(notification.type) }}
                  </v-chip>
                </div>
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="d-flex ga-1">
                  <v-btn
                    v-if="notification.action && notification.action.url"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    color="primary"
                    @click.stop="handleNotificationAction(notification)"
                    :title="$t('viewDetails') || 'عرض التفاصيل'"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="deleteNotification(notification.id)"
                    :title="$t('delete') || 'حذف'"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          
          <!-- Pagination -->
          <div v-if="filteredNotifications.length > itemsPerPage" class="d-flex justify-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(filteredNotifications.length / itemsPerPage)"
              :total-visible="3"
              size="small"
            />
          </div>
        </v-card-text>
        
        <!-- Footer -->
        <v-card-actions v-if="notifications.length > 0" class="pa-4">
          <v-btn
            :to="'/notifications'"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-view-list"
            block
            @click="isOpen = false"
          >
            {{ $t('viewAllNotifications') || 'عرض جميع الإشعارات' }} ({{ notifications.length }})
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import NotificationService from '@/integration/services/NotificationService';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

// State
const isOpen = ref(false);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Computed
const notifications = computed(() => store.getters['user/notifications'] || []);
const unreadCount = computed(() => store.getters['user/unreadCount'] || 0);

const filteredNotifications = computed(() => {
  if (!searchQuery.value.trim()) return notifications.value;
  
  const query = searchQuery.value.toLowerCase();
  return notifications.value.filter(notification => 
    notification.title.toLowerCase().includes(query) || 
    notification.message.toLowerCase().includes(query)
  );
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredNotifications.value.slice(start, end);
});

// Methods
const getNotificationIcon = (type) => {
  const icons = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
    order: 'mdi-cart',
    payment: 'mdi-credit-card',
    shipping: 'mdi-truck',
    system: 'mdi-cog',
    message: 'mdi-message'
  };
  return icons[type] || 'mdi-bell';
};

const getNotificationColor = (type) => {
  const colors = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    order: 'primary',
    payment: 'success',
    shipping: 'info',
    system: 'grey',
    message: 'primary'
  };
  return colors[type] || 'primary';
};

const getNotificationLabel = (type) => {
  const labels = {
    success: t('success') || 'نجاح',
    error: t('error') || 'خطأ',
    warning: t('warning') || 'تحذير',
    info: t('info') || 'معلومات',
    order: t('order') || 'طلب',
    payment: t('payment') || 'دفع',
    shipping: t('shipping') || 'شحن',
    system: t('system') || 'نظام',
    message: t('message') || 'رسالة'
  };
  return labels[type] || t('notification') || 'إشعار';
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return t('justNow') || 'الآن';
  if (diffMins < 60) return `${diffMins} ${t('minutesAgo') || 'دقائق'}`;
  if (diffHours < 24) return `${diffHours} ${t('hoursAgo') || 'ساعات'}`;
  if (diffDays < 7) return `${diffDays} ${t('daysAgo') || 'أيام'}`;
  
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadNotifications = async () => {
  loading.value = true;
  try {
    const response = await NotificationService.getNotifications();
    if (response.success) {
      store.dispatch('user/setNotifications', response.data);
    }
  } catch (error) {
    console.error('❌ Error loading notifications:', error);
  } finally {
    loading.value = false;
  }
};

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) {
    loadNotifications();
    currentPage.value = 1;
    searchQuery.value = '';
  }
};

const markAsRead = async (id) => {
  try {
    await store.dispatch('user/markNotificationRead', id);
    await NotificationService.markAsRead(id);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await store.dispatch('user/markAllRead');
    await NotificationService.markAllAsRead();
    
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('allMarkedAsRead') || 'تم تحديد الكل كمقروء',
      message: t('allNotificationsMarkedAsRead') || 'تم تحديد جميع الإشعارات كمقروء',
      icon: 'mdi-check-all',
      timeout: 3000
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
  }
};

const deleteNotification = async (id) => {
  if (confirm(t('confirmDeleteNotification') || 'هل أنت متأكد من حذف هذا الإشعار؟')) {
    try {
      await store.dispatch('user/deleteNotification', id);
      await NotificationService.deleteNotification(id);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  }
};

const handleNotificationAction = (notification) => {
  if (notification.action && notification.action.url) {
    router.push(notification.action.url);
    isOpen.value = false;
  }
};

const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.notifications-container')) {
    isOpen.value = false;
  }
};

// Watchers
watch(() => searchQuery.value, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadNotifications();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.notifications-container {
  position: relative;
}

.notifications-btn {
  position: relative;
  transition: all 0.3s ease;
}

.notifications-btn:hover {
  transform: scale(1.05);
}

.notifications-dropdown {
  border-radius: 12px;
  overflow: hidden;
}

.notification-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notification-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(2px);
}

.notification-item.bg-surface-lighten-1 {
  background: rgba(var(--v-theme-primary), 0.1);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notifications-list::-webkit-scrollbar {
  width: 6px;
}

.notifications-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.5);
  border-radius: 3px;
}

.notifications-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.7);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .notifications-dropdown {
    min-width: 320px;
    max-width: calc(100vw - 32px);
  }
  
  .notification-item {
    padding: 8px 12px;
  }
  
  .v-card-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .v-card-title .d-flex {
    width: 100%;
    justify-content: space-between;
  }
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>
