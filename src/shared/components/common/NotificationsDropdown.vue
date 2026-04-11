<template>
  <div class="notifications-container">
    <!-- Notifications Button -->
    <v-menu
      v-model="isOpen"
      :close-on-content-click="false"
      location="bottom end"
      offset="10"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          icon
          variant="outlined"
          class="action-btn notifications-btn"
          :title="$t('notifications')"
        >
          <v-badge
            v-if="unreadCount > 0"
            :content="unreadCount"
            color="error"
            offset-x="-4"
            offset-y="-4"
          >
            <v-icon icon="mdi-bell" size="18" />
          </v-badge>
          <v-icon v-else icon="mdi-bell" size="18" />
        </v-btn>
      </template>
      
      <!-- Dropdown Content -->
      <v-card min-width="350" max-width="400" elevation="8">
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6">{{ $t('notifications') }}</span>
          <div class="d-flex ga-2">
            <v-btn
              v-if="unreadCount > 0"
              icon="mdi-check-all"
              variant="text"
              size="small"
              color="primary"
              @click="markAllAsRead"
              :title="$t('markAllAsRead')"
            />
            <v-btn
              icon="mdi-close"
              variant="text"
              size="small"
              color="default"
              @click="isOpen = false"
            />
          </div>
        </v-card-title>
        
        <v-divider />
        
        <!-- Notifications List -->
        <v-card-text class="pa-0" style="max-height: 400px; overflow-y: auto;">
          <div v-if="notifications.length === 0" class="text-center pa-8">
            <v-icon size="48" color="primary" class="mb-4">mdi-bell-off</v-icon>
            <p class="text-body-2 text-medium-emphasis">{{ $t('noNotifications') }}</p>
          </div>
          
          <v-list v-else density="compact">
            <v-list-item
              v-for="notification in notifications"
              :key="notification.id"
              :class="{ 'bg-surface-lighten-1': !notification.read }"
              @click="markAsRead(notification.id)"
              class="notification-item"
            >
              <template v-slot:prepend>
                <v-avatar size="32" :color="getNotificationColor(notification.type)">
                  <v-icon size="16" color="white">
                    {{ getNotificationIcon(notification.type) }}
                  </v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="d-flex align-center justify-space-between">
                <span class="text-body-1 font-weight-medium">{{ notification.title }}</span>
                <span class="text-caption text-medium-emphasis">{{ formatTime(notification.time) }}</span>
              </v-list-item-title>
              <v-list-item-subtitle class="text-body-2">{{ notification.message }}</v-list-item-subtitle>
              
              <template v-slot:append>
                <v-btn
                  icon="mdi-delete"
                  variant="text"
                  size="small"
                  color="default"
                  @click.stop="deleteNotification(notification.id)"
                  :title="$t('delete')"
                />
              </template>
            </v-list-item>
          </v-list>
        </v-card-text>
        
        <!-- Footer -->
        <v-card-actions v-if="notifications.length > 0">
          <v-btn
            variant="outlined"
            color="primary"
            block
            @click="viewAll"
          >
            {{ $t('viewAllNotifications') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

export default {
  name: 'NotificationsDropdown',
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const isOpen = ref(false);
    
    const notifications = computed(() => store.state.user.notifications || []);
    const unreadCount = computed(() => notifications.value.filter(n => !n.read).length);
    
    const getNotificationColor = (type) => {
      const colors = {
        success: 'success',
        info: 'info',
        warning: 'warning',
        error: 'error'
      };
      return colors[type] || 'primary';
    };
    
    const markAsRead = (id) => {
      store.dispatch('user/markNotificationRead', id);
    };
    
    const markAllAsRead = () => {
      store.dispatch('user/markAllRead');
    };
    
    const deleteNotification = (id) => {
      if (confirm(t('confirmDeleteNotification'))) {
        store.dispatch('user/deleteNotification', id);
      }
    };
    
    const viewAll = () => {
      // Use router if available
      if (typeof window !== 'undefined' && window.$router) {
        window.$router.push('/notifications');
      }
      isOpen.value = false;
    };
    
    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.floor((now - date) / 1000); // الفرق بالثواني

      if (diff < 60) return t('justNow');
      if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return t('minutesAgo', { count: minutes });
      }
      if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return t('hoursAgo', { count: hours });
      }
      return date.toLocaleDateString(t.locale.value || 'en');
    };
    
    return {
      isOpen,
      notifications,
      unreadCount,
      getNotificationColor,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      viewAll,
      formatTime
    };
  }
}
</script>

<style scoped>
/* Match action button styles from Header.vue */
.action-btn {
  width: 42px !important;
  height: 42px !important;
  border-radius: 50% !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #d4af37 !important;
  transition: all 0.3s ease !important;
}

.action-btn:hover {
  border-color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3) !important;
}

.notifications-btn {
  /* Inherits all styles from action-btn */
}
</style>
