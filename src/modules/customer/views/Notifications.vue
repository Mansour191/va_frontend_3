<template>
  <v-main class="notifications-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <v-row align="center" justify="space-between">
            <v-col>
              <div class="header-content">
                <h1 class="text-h4 font-weight-bold mb-2">
                  <v-icon class="me-2">mdi-bell</v-icon>
                  الإشعارات
                </h1>
                <p class="text-body-1 text-medium-emphasis">آخر الإشعارات والتحديثات</p>
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="d-flex align-center gap-3">
                <div class="notification-stats">
                  <v-chip color="primary" variant="tonal">
                    <v-icon start>mdi-email</v-icon>
                    {{ unreadCount }} غير مقروء
                  </v-chip>
                </div>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-check-all"
                  @click="markAllAsRead"
                  :disabled="unreadCount === 0"
                >
                  قراءة الكل
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-title>

        <!-- Filter Tabs -->
        <v-divider />
        <v-card-text class="pa-0">
          <v-tabs
            v-model="activeFilter"
            color="primary"
            align-tabs="center"
            class="filter-tabs"
          >
            <v-tab
              v-for="filter in filters"
              :key="filter.value"
              :value="filter.value"
            >
              <v-icon :icon="filter.icon" class="me-2" />
              {{ filter.label }}
              <v-chip
                v-if="filter.count > 0"
                size="small"
                color="primary"
                variant="tonal"
                class="ms-2"
              >
                {{ filter.count }}
              </v-chip>
            </v-tab>
          </v-tabs>
        </v-card-text>

        <v-divider />

        <!-- Notifications List -->
        <v-card-text class="pa-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            />
            <p class="text-body-1 text-medium-emphasis">جاري تحميل الإشعارات...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredNotifications.length === 0" class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-bell-off</v-icon>
            <h3 class="text-h5 mb-2">لا توجد إشعارات</h3>
            <p class="text-body-1 text-medium-emphasis">لا توجد إشعارات في هذه الفئة</p>
          </div>

          <!-- Notifications Grid -->
          <v-row v-else>
            <v-col 
              v-for="notification in filteredNotifications" 
              :key="notification.id" 
              cols="12"
            >
              <v-card 
                class="notification-item"
                :class="{ 'unread-notification': !notification.read }"
                elevation="2"
                hover
                @click="markAsRead(notification.id)"
              >
                <v-card-text class="pa-4">
                  <v-row align="center">
                    <v-col cols="auto">
                      <v-avatar 
                        :color="getNotificationColor(notification.type)"
                        class="notification-avatar"
                      >
                        <v-icon :icon="getNotificationIcon(notification.type)" />
                      </v-avatar>
                    </v-col>
                    
                    <v-col class="flex-grow-1">
                      <div class="notification-header">
                        <h3 class="text-h6 mb-1">{{ notification.title }}</h3>
                        <p class="text-caption text-medium-emphasis">
                          {{ formatTime(notification.createdAt) }}
                        </p>
                      </div>
                      
                      <p class="text-body-2 mb-2">{{ notification.message }}</p>
                      
                      <div v-if="notification.action" class="notification-action">
                        <v-btn
                          size="small"
                          color="primary"
                          variant="outlined"
                          @click.stop="handleAction(notification.action)"
                        >
                          {{ notification.action.label }}
                        </v-btn>
                      </div>
                    </v-col>
                    
                    <v-col cols="auto">
                      <div class="d-flex flex-column align-center">
                        <v-btn
                          v-if="!notification.read"
                          icon
                          size="small"
                          variant="text"
                          color="primary"
                          @click.stop="markAsRead(notification.id)"
                        >
                          <v-icon>mdi-email-open</v-icon>
                        </v-btn>
                        <v-btn
                          icon
                          size="small"
                          variant="text"
                          color="error"
                          @click.stop="deleteNotification(notification.id)"
                        >
                          <v-icon>mdi-close</v-icon>
                        </v-btn>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
                
                <div v-if="!notification.read" class="unread-indicator"></div>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import NotificationService from '@/integration/services/NotificationService';

// Reactive data
const overlayActive = ref(true);
const loading = ref(false);
const activeFilter = ref('all');
const notifications = ref([]);

const notificationTypes = ref([
  {
    value: 'all',
    label: 'الكل',
    icon: 'mdi-inbox-all',
    count: computed(() => notifications.value.length)
  },
  {
    value: 'unread',
    label: 'غير مقروء',
    icon: 'mdi-email',
    count: computed(() => notifications.value.filter(n => !n.read).length)
  },
  {
    value: 'orders',
    label: 'الطلبات',
    icon: 'mdi-shopping-bag',
    count: computed(() => notifications.value.filter(n => n.type === 'order' || n.type === 'delivery').length)
  },
  {
    value: 'promotions',
    label: 'العروض',
    icon: 'mdi-tag',
    count: computed(() => notifications.value.filter(n => n.type === 'promotion').length)
  }
]);

// Computed
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value;
  }
  if (activeFilter.value === 'unread') {
    return notifications.value.filter(n => !n.read);
  }
  if (activeFilter.value === 'orders') {
    return notifications.value.filter(n => n.type === 'order' || n.type === 'delivery');
  }
  if (activeFilter.value === 'promotions') {
    return notifications.value.filter(n => n.type === 'promotion');
  }
  return notifications.value;
});

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length;
});

// Methods
const loadNotifications = async () => {
  loading.value = true;
  try {
    // Fetch from API
    const fetchedNotifications = await NotificationService.getNotifications();
    notifications.value = fetchedNotifications;
    console.log('✅ Notifications loaded from API:', fetchedNotifications);
  } catch (error) {
    console.error('❌ Error loading notifications:', error);
    // Use fallback data if API fails
    notifications.value = NotificationService.getFallbackNotifications();
  } finally {
    loading.value = false;
  }
};

const markAsRead = async (notificationId) => {
  try {
    await NotificationService.markAsRead(notificationId);
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
    }
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    // Fallback to local update
    const notification = notifications.value.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
    }
  }
};

const markAllAsRead = async () => {
  try {
    await NotificationService.markAllAsRead();
    notifications.value.forEach(notification => {
      notification.read = true;
    });
    console.log('✅ All notifications marked as read');
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    // Fallback to local update
    notifications.value.forEach(notification => {
      notification.read = true;
    });
  }
};

const deleteNotification = async (notificationId) => {
  try {
    await NotificationService.deleteNotification(notificationId);
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
    console.log('✅ Notification deleted:', notificationId);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    // Fallback to local update
    const index = notifications.value.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }
};

const handleAction = async (action) => {
  try {
    console.log('Handle action:', action);
    
    // Mark as read when action is clicked
    if (action.notificationId) {
      await markAsRead(action.notificationId);
    }
    
    // Navigate to action.url if provided
    if (action.url) {
      // router.push(action.url);
      console.log('Navigate to:', action.url);
    }
  } catch (error) {
    console.error('❌ Error handling action:', error);
  }
};

const formatTime = (date) => {
  const now = new Date();
  const notificationDate = new Date(date);
  const diff = now - notificationDate;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'الآن';
  if (minutes < 60) return `منذ ${minutes} دقيقة`;
  if (hours < 24) return `منذ ${hours} ساعة`;
  if (days < 7) return `منذ ${days} يوم`;
  
  return notificationDate.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const getNotificationIcon = (type) => {
  const iconMap = {
    order: 'mdi-shopping-bag',
    delivery: 'mdi-truck',
    delivery: 'mdi-truck-delivery',
    promotion: 'mdi-tag',
    system: 'mdi-cog',
    review: 'mdi-star'
  };
  return iconMap[type] || 'mdi-bell';
};

const getNotificationColor = (type) => {
  const colorMap = {
    order: 'primary',
    delivery: 'success',
    promotion: 'warning',
    system: 'info',
    review: 'secondary'
  };
  return colorMap[type] || 'primary';
};

onMounted(() => {
  loadNotifications();
});
</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.notification-item {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.unread-notification {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
}

.unread-indicator {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  background: var(--v-theme-primary);
  border-radius: 50%;
}

.notification-avatar {
  transition: all 0.3s ease;
}

.notification-item:hover .notification-avatar {
  transform: scale(1.1);
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.notification-action {
  margin-top: 8px;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
  
  .notification-item {
    padding: 12px;
  }
}
</style>
