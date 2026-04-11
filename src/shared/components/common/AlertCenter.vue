<template>
  <div class="alert-center" ref="el">
    <!-- Alert Trigger with Counter -->
    <v-btn
      @click="toggleDropdown"
      icon="mdi-bell"
      variant="elevated"
      :color="unreadCount > 0 ? 'error' : 'primary'"
      class="alert-trigger transition-all"
      :class="{ 'pulse-animation': unreadCount > 0 }"
    >
      <v-badge
        v-if="unreadCount > 0"
        :content="unreadCount > 99 ? '99+' : unreadCount"
        color="error"
        offset-x="-4"
        offset-y="-4"
        :dot="unreadCount <= 1"
      />
    </v-btn>

    <!-- Alert Dropdown -->
    <v-menu
      v-model="showDropdown"
      location="bottom end"
      offset="10"
      :close-on-content-click="false"
      transition="slide-y-transition"
    >
      <v-card min-width="380" max-width="420" elevation="8" class="alert-dropdown">
        <!-- Header -->
        <v-card-title class="d-flex align-center justify-space-between pa-4">
          <span class="text-h6 font-weight-bold">
            <v-icon color="primary" class="me-2">mdi-bell</v-icon>
            {{ $t('alerts') || 'التنبيهات' }}
            <v-chip v-if="unreadCount > 0" size="small" color="error" variant="elevated" class="ms-2">
              {{ unreadCount }} {{ $t('new') || 'جديد' }}
            </v-chip>
          </span>
          <div class="d-flex ga-1">
            <v-btn
              @click="markAllAsRead"
              icon="mdi-check-all"
              variant="text"
              size="small"
              color="primary"
              :title="$t('markAllAsRead') || 'تحديد الكل كمقروء'"
              :disabled="unreadCount === 0"
            />
            <v-btn
              @click="clearAll"
              icon="mdi-delete-sweep"
              variant="text"
              size="small"
              color="error"
              :title="$t('clearAll') || 'مسح الكل'"
              :disabled="alerts.length === 0"
            />
            <v-btn
              @click="showDropdown = false"
              icon="mdi-close"
              variant="text"
              size="small"
              color="default"
            />
          </div>
        </v-card-title>
        
        <v-divider />
        
        <!-- Filters -->
        <v-card-text class="pa-4">
          <v-btn-toggle
            v-model="currentFilter"
            :items="filters"
            variant="outlined"
            density="compact"
            class="mb-4 w-100"
            mandatory
          />
          
          <!-- Search -->
          <v-text-field
            v-model="searchQuery"
            :placeholder="$t('searchAlerts') || 'البحث في التنبيهات...'"
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            class="mb-4"
            clearable
          />
          
          <!-- Loading State -->
          <div v-if="loading" class="text-center pa-8">
            <v-progress-circular indeterminate color="primary" size="32" class="mb-4" />
            <p class="text-body-2 text-medium-emphasis">
              {{ $t('loadingAlerts') || 'جاري تحميل التنبيهات...' }}
            </p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="filteredAlerts.length === 0" class="text-center pa-8">
            <v-icon size="64" :color="currentFilter === 'all' ? 'success' : 'primary'" class="mb-4 opacity-50">
              {{ currentFilter === 'all' ? 'mdi-check-circle' : 'mdi-filter' }}
            </v-icon>
            <p class="text-body-1 text-medium-emphasis mb-2">
              {{ currentFilter === 'all' ? ($t('noAlerts') || 'لا توجد تنبيهات') : ($t('noFilteredAlerts') || 'لا توجد تنبيهات مطابقة') }}
            </p>
            <p v-if="currentFilter !== 'all'" class="text-body-2 text-medium-emphasis">
              {{ $t('tryDifferentFilter') || 'جرب فلترة مختلفة' }}
            </p>
          </div>
          
          <!-- Alert List -->
          <v-list v-else density="compact" class="alert-list" max-height="400">
            <v-list-item
              v-for="alert in paginatedAlerts"
              :key="alert.id"
              :class="[
                'alert-item transition-all',
                { 'bg-surface-lighten-1': !alert.read },
                `border-l-4 border-${getAlertColor(alert.severity)}`
              ]"
              @click="markAsRead(alert.id)"
              class="cursor-pointer"
            >
              <template v-slot:prepend>
                <v-avatar size="36" :color="getAlertColor(alert.severity)" class="me-3">
                  <v-icon size="18" color="white">
                    {{ getAlertIcon(alert.type) }}
                  </v-icon>
                </v-avatar>
              </template>
              
              <v-list-item-title class="text-body-1 font-weight-medium mb-1">
                <div class="d-flex align-center ga-2">
                  <span>{{ alert.title }}</span>
                  <v-chip
                    v-if="!alert.read"
                    size="x-small"
                    color="primary"
                    variant="elevated"
                  >
                    {{ $t('new') || 'جديد' }}
                  </v-chip>
                </div>
              </v-list-item-title>
              
              <v-list-item-subtitle class="text-body-2 mb-1 text-medium-emphasis">
                {{ alert.message }}
              </v-list-item-subtitle>
              
              <v-list-item-subtitle class="text-caption text-medium-emphasis">
                <div class="d-flex align-center ga-4">
                  <span class="d-flex align-center ga-1">
                    <v-icon size="12">mdi-clock</v-icon>
                    {{ formatTime(alert.timestamp) }}
                  </span>
                  <v-chip
                    :color="getAlertColor(alert.severity)"
                    size="x-small"
                    variant="tonal"
                  >
                    {{ getSeverityLabel(alert.severity) }}
                  </v-chip>
                </div>
              </v-list-item-subtitle>
              
              <template v-slot:append>
                <div class="d-flex ga-1">
                  <v-btn
                    v-if="alert.action"
                    icon="mdi-open-in-new"
                    variant="text"
                    size="small"
                    color="primary"
                    @click.stop="handleAlertAction(alert)"
                    :title="$t('viewDetails') || 'عرض التفاصيل'"
                  />
                  <v-btn
                    icon="mdi-delete"
                    variant="text"
                    size="small"
                    color="error"
                    @click.stop="deleteAlert(alert.id)"
                    :title="$t('delete') || 'حذف'"
                  />
                </div>
              </template>
            </v-list-item>
          </v-list>
          
          <!-- Pagination -->
          <div v-if="filteredAlerts.length > itemsPerPage" class="d-flex justify-center mt-4">
            <v-pagination
              v-model="currentPage"
              :length="Math.ceil(filteredAlerts.length / itemsPerPage)"
              :total-visible="3"
              size="small"
            />
          </div>
        </v-card-text>
        
        <!-- Footer -->
        <v-card-actions v-if="alerts.length > 0" class="pa-4">
          <v-btn
            @click="viewAll"
            variant="outlined"
            color="primary"
            prepend-icon="mdi-view-list"
            block
          >
            {{ $t('viewAll') || 'عرض الكل' }} ({{ alerts.length }})
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
import AlertService from '@/integration/services/AlertService';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

// State
const showDropdown = ref(false);
const currentFilter = ref('all');
const alerts = ref([]);
const loading = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

const el = ref(null);

// Filters with internationalization
const filters = computed(() => [
  { label: t('all') || 'الكل', value: 'all' },
  { label: t('unread') || 'غير مقروء', value: 'unread' },
  { label: t('high') || 'عالي', value: 'high' },
  { label: t('medium') || 'متوسط', value: 'medium' },
  { label: t('low') || 'منخفض', value: 'low' }
]);

// Computed
const unreadCount = computed(() => alerts.value.filter((a) => !a.read).length);

const filteredAlerts = computed(() => {
  let filtered = alerts.value;
  
  // Apply filter
  if (currentFilter.value !== 'all') {
    if (currentFilter.value === 'unread') {
      filtered = filtered.filter((a) => !a.read);
    } else {
      filtered = filtered.filter((a) => a.severity === currentFilter.value);
    }
  }
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((a) => 
      a.title.toLowerCase().includes(query) || 
      a.message.toLowerCase().includes(query)
    );
  }
  
  return filtered;
});

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredAlerts.value.slice(start, end);
});

// Methods
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

const loadAlerts = async () => {
  loading.value = true;
  try {
    const response = await AlertService.getAlerts({ limit: 50 });
    alerts.value = response.data || [];
  } catch (error) {
    console.error('❌ Error loading alerts:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('loadAlertsError') || 'فشل في تحميل التنبيهات',
      icon: 'mdi-alert-circle',
      timeout: 3000
    });
  } finally {
    loading.value = false;
  }
};

const handleNewAlert = (alert) => {
  alerts.value = [alert, ...alerts.value].slice(0, 50);
  
  // Show notification for high priority alerts
  if (alert.severity === 'high' && !alert.read) {
    store.dispatch('notifications/add', {
      type: 'warning',
      title: alert.title,
      message: alert.message,
      icon: 'mdi-bell',
      timeout: 5000,
      persistent: true
    });
  }
};

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value;
  if (showDropdown.value) {
    loadAlerts();
    currentPage.value = 1;
    searchQuery.value = '';
  }
};

const handleClickOutside = (event) => {
  if (el.value && !el.value.contains(event.target)) {
    showDropdown.value = false;
  }
};

const getAlertIcon = (type) => {
  const icons = {
    inventory_difference: 'mdi-package-variant',
    price_difference: 'mdi-tag',
    customer_balance: 'mdi-account-clock',
    pending_orders: 'mdi-clock',
    low_stock: 'mdi-alert',
    sync_errors: 'mdi-alert-circle',
    system_update: 'mdi-update',
    security: 'mdi-shield-alert',
    message: 'mdi-message',
    order_status: 'mdi-cart'
  };
  return icons[type] || 'mdi-bell';
};

const getAlertColor = (severity) => {
  const colors = {
    high: 'error',
    medium: 'warning',
    low: 'success',
    info: 'info'
  };
  return colors[severity] || 'primary';
};

const getSeverityLabel = (severity) => {
  const labels = {
    high: t('high') || 'عالي',
    medium: t('medium') || 'متوسط',
    low: t('low') || 'منخفض',
    info: t('info') || 'معلومات'
  };
  return labels[severity] || t('normal') || 'عادي';
};

const markAsRead = async (id) => {
  try {
    await AlertService.markAsRead(id);
    const alertIndex = alerts.value.findIndex(a => a.id === id);
    if (alertIndex !== -1) {
      alerts.value[alertIndex].read = true;
    }
  } catch (error) {
    console.error('❌ Error marking alert as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    await AlertService.markAllAsRead();
    alerts.value.forEach((a) => (a.read = true));
    
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('allMarkedAsRead') || 'تم تحديد الكل كمقروء',
      message: t('allAlertsMarkedAsRead') || 'تم تحديد جميع التنبيهات كمقروء',
      icon: 'mdi-check-all',
      timeout: 3000
    });
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
  }
};

const clearAll = async () => {
  if (confirm(t('confirmClearAll') || 'هل أنت متأكد من مسح جميع التنبيهات؟')) {
    try {
      await AlertService.clearAllAlerts();
      alerts.value = [];
      
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('allCleared') || 'تم المسح',
        message: t('allAlertsCleared') || 'تم مسح جميع التنبيهات',
        icon: 'mdi-delete-sweep',
        timeout: 3000
      });
    } catch (error) {
      console.error('❌ Error clearing alerts:', error);
    }
  }
};

const deleteAlert = async (id) => {
  if (confirm(t('confirmDelete') || 'هل أنت متأكد من حذف هذا التنبيه؟')) {
    try {
      await AlertService.deleteAlert(id);
      alerts.value = alerts.value.filter(a => a.id !== id);
    } catch (error) {
      console.error('❌ Error deleting alert:', error);
    }
  }
};

const handleAlertAction = (alert) => {
  if (alert.action && alert.action.url) {
    router.push(alert.action.url);
    showDropdown.value = false;
  }
};

const viewAll = () => {
  showDropdown.value = false;
  router.push('/dashboard/alerts');
};

// Watchers
watch(() => searchQuery.value, () => {
  currentPage.value = 1;
});

watch(() => currentFilter.value, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  loadAlerts();
  AlertService.subscribe(handleNewAlert);
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  AlertService.unsubscribe(handleNewAlert);
});
</script>

<style scoped>
.alert-center {
  position: relative;
}

.alert-trigger {
  transition: all 0.3s ease;
}

.alert-trigger:hover {
  transform: scale(1.05);
}

.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--v-theme-error), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-error), 0);
  }
}

.alert-dropdown {
  border-radius: 12px;
  overflow: hidden;
}

.alert-item {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.alert-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(2px);
}

.alert-item.bg-surface-lighten-1 {
  background: rgba(var(--v-theme-primary), 0.1);
}

.alert-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-list::-webkit-scrollbar {
  width: 6px;
}

.alert-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 3px;
}

.alert-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.5);
  border-radius: 3px;
}

.alert-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.7);
}

/* Border color classes */
.border-error {
  border-left-color: rgb(var(--v-theme-error)) !important;
}

.border-warning {
  border-left-color: rgb(var(--v-theme-warning)) !important;
}

.border-success {
  border-left-color: rgb(var(--v-theme-success)) !important;
}

.border-info {
  border-left-color: rgb(var(--v-theme-info)) !important;
}

.border-primary {
  border-left-color: rgb(var(--v-theme-primary)) !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .alert-dropdown {
    min-width: 320px;
    max-width: calc(100vw - 32px);
  }
  
  .alert-item {
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
</style>

