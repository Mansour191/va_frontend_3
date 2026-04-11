<template>
  <v-container class="pa-4">
    <!-- Page Header -->
    <v-card variant="elevated" class="mb-6 page-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-title">
            <h1 class="text-h3 font-weight-bold text-white mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40" class="header-icon">mdi-bell</v-icon>
              {{ $t('alertsCenter') || 'مركز التنبيهات' }}
            </h1>
            <p class="text-body-2 text-medium-emphasis mb-0">
              {{ $t('alertsSubtitle') || 'إدارة ومتابعة جميع التنبيهات والإشعارات الذكية' }}
            </p>
          </div>

          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="loadAlerts"
              :disabled="loading"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="loading"
            >
              {{ loading ? ($t('refreshing') || 'جاري التحديث...') : ($t('refresh') || 'تحديث') }}
            </v-btn>
            <v-btn
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-check-all"
            >
              {{ $t('markAllAsRead') || 'تحديد الكل كمقروء' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row v-if="alerts.length" class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card critical">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="error" variant="tonal" size="50">
                <v-icon size="28" color="error">mdi-alert-triangle</v-icon>
              </v-avatar>
              <div class="stat-content">
                <div class="text-h4 font-weight-bold text-white">{{ priorityCounts.critical }}</div>
                <div class="text-caption text-medium-emphasis">{{ $t('critical') || 'حرج' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card high">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="warning" variant="tonal" size="50">
                <v-icon size="28" color="warning">mdi-alert-circle</v-icon>
              </v-avatar>
              <div class="stat-content">
                <div class="text-h4 font-weight-bold text-white">{{ priorityCounts.high }}</div>
                <div class="text-caption text-medium-emphasis">{{ $t('high') || 'عالي' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card medium">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="info" variant="tonal" size="50">
                <v-icon size="28" color="info">mdi-alert</v-icon>
              </v-avatar>
              <div class="stat-content">
                <div class="text-h4 font-weight-bold text-white">{{ priorityCounts.medium }}</div>
                <div class="text-caption text-medium-emphasis">{{ $t('medium') || 'متوسط' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card low">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="success" variant="tonal" size="50">
                <v-icon size="28" color="success">mdi-information</v-icon>
              </v-avatar>
              <div class="stat-content">
                <div class="text-h4 font-weight-bold text-white">{{ priorityCounts.low }}</div>
                <div class="text-caption text-medium-emphasis">{{ $t('low') || 'منخفض' }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filter Tabs -->
    <div class="filters-tabs mb-4">
      <v-btn-toggle
        v-model="currentFilterIndex"
        variant="tonal"
        color="primary"
        class="filter-toggle"
      >
        <v-btn
          value="all"
          class="filter-tab"
        >
          {{ $t('all') || 'الكل' }}
          <v-chip size="small" color="primary" variant="elevated" class="ms-2">
            {{ alerts.length }}
          </v-chip>
        </v-btn>
        <v-btn
          value="unread"
          class="filter-tab"
        >
          {{ $t('unread') || 'غير مقروء' }}
          <v-chip size="small" color="primary" variant="elevated" class="ms-2">
            {{ unreadCount }}
          </v-chip>
        </v-btn>
        <v-btn
          value="critical"
          class="filter-tab"
        >
          {{ $t('critical') || 'حرج' }}
          <v-chip size="small" color="error" variant="elevated" class="ms-2">
            {{ priorityCounts.critical }}
          </v-chip>
        </v-btn>
      </v-btn-toggle>
    </div>

    <!-- Category Tabs -->
    <div class="category-tabs mb-6">
      <v-chip
        v-for="cat in categories"
        :key="cat.value"
        :color="currentCategory === cat.value ? 'primary' : 'default'"
        :variant="currentCategory === cat.value ? 'elevated' : 'tonal'"
        clickable
        class="category-chip"
        @click="currentCategory = cat.value"
      >
        <v-icon start>{{ getMdiIcon(cat.icon) }}</v-icon>
        {{ cat.label }}
        <v-chip size="x-small" :color="cat.color" variant="elevated" class="ms-2">
          {{ categoryCounts[cat.value] || 0 }}
        </v-chip>
      </v-chip>
    </div>

    <!-- Alerts List -->
    <div v-if="filteredAlerts.length > 0" class="alerts-list">
      <transition-group name="alert-transition" tag="div">
        <v-card
          v-for="alert in filteredAlerts"
          :key="alert.id"
          variant="elevated"
          class="alert-item mb-4"
          :class="[`severity-${alert.severity || 'low'}`, { 'alert-read': alert.read }]"
        >
          <v-card-text class="pa-4">
            <div class="d-flex ga-4">
              <!-- Alert Icon -->
              <v-avatar
                :color="getCategoryColor(alert.category) + '20'"
                size="50"
                class="alert-avatar"
              >
                <v-icon :color="getCategoryColor(alert.category)" size="24">
                  {{ getMdiIcon(alert.icon || getDefaultIcon(alert)) }}
                </v-icon>
              </v-avatar>

              <!-- Alert Content -->
              <div class="flex-grow-1">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-h6 font-weight-medium text-white">{{ alert.title }}</h3>
                  <span class="text-caption text-medium-emphasis">{{ formatTime(alert.timestamp) }}</span>
                </div>

                <p class="text-body-2 text-medium-emphasis mb-3">{{ alert.message }}</p>

                <!-- Alert Meta -->
                <div class="d-flex flex-wrap ga-2 mb-3">
                  <v-chip
                    size="small"
                    :color="getCategoryColor(alert.category)"
                    variant="tonal"
                  >
                    <v-icon start size="16">{{ getMdiIcon(getCategoryIcon(alert.category)) }}</v-icon>
                    {{ getCategoryLabel(alert.category) }}
                  </v-chip>

                  <v-chip
                    size="small"
                    :color="getSeverityColor(alert.severity)"
                    variant="tonal"
                  >
                    <v-icon start size="16">{{ getMdiIcon(getSeverityIcon(alert.severity)) }}</v-icon>
                    {{ getSeverityLabel(alert.severity) }}
                  </v-chip>

                  <v-chip
                    v-if="alert.data?.daysRemaining"
                    size="small"
                    :color="alert.data.daysRemaining < 7 ? 'error' : 'warning'"
                    variant="tonal"
                  >
                    <v-icon start size="16">mdi-clock</v-icon>
                    {{ alert.data.daysRemaining }} {{ $t('daysRemaining') || 'يوم متبقي' }}
                  </v-chip>
                </div>

                <!-- Additional Data -->
                <div v-if="alert.data" class="alert-data">
                  <div v-if="alert.data.productName" class="data-item d-flex align-center ga-2 mb-2">
                    <v-icon size="16" color="primary">mdi-package</v-icon>
                    <span class="text-body-2 text-medium-emphasis">{{ alert.data.productName }}</span>
                  </div>
                  <div v-if="alert.data.currentStock" class="data-item d-flex align-center ga-2 mb-2">
                    <v-icon size="16" color="primary">mdi-warehouse</v-icon>
                    <span class="text-body-2 text-medium-emphasis">{{ $t('stock') || 'المخزون' }}: {{ alert.data.currentStock }}</span>
                  </div>
                  <div v-if="alert.data.dailyAverage" class="data-item d-flex align-center ga-2 mb-2">
                    <v-icon size="16" color="primary">mdi-chart-line</v-icon>
                    <span class="text-body-2 text-medium-emphasis">{{ $t('average') || 'المتوسط' }}: {{ alert.data.dailyAverage }}/{{ $t('day') || 'يوم' }}</span>
                  </div>
                </div>
              </div>

              <!-- Alert Actions -->
              <div class="alert-actions d-flex flex-column ga-2">
                <v-btn
                  v-if="!alert.read"
                  @click="markAsRead(alert.id)"
                  variant="tonal"
                  color="success"
                  size="small"
                  icon="mdi-check"
                  :title="$t('markAsRead') || 'تحديد كمقروء'"
                />
                <v-btn
                  v-if="alert.actionable"
                  @click="handleAction(alert)"
                  variant="tonal"
                  color="primary"
                  size="small"
                  icon="mdi-eye"
                  :title="$t('viewDetails') || 'عرض التفاصيل'"
                />
                <v-btn
                  @click="deleteAlert(alert.id)"
                  variant="tonal"
                  color="error"
                  size="small"
                  icon="mdi-delete"
                  :title="$t('delete') || 'حذف'"
                />
              </div>
            </div>
          </v-card-text>
        </v-card>
      </transition-group>

      <!-- Load More -->
      <div v-if="hasMore" class="load-more text-center mt-4">
        <v-btn
          @click="loadMore"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-chevron-down"
        >
          {{ $t('loadMore') || 'تحميل المزيد' }}
        </v-btn>
      </div>
    </div>

    <!-- Empty State -->
    <v-card v-else variant="elevated" class="empty-state text-center py-8">
      <v-card-text class="pa-6">
        <v-avatar size="80" color="primary" variant="tonal" class="mb-4">
          <v-icon size="48" color="primary">mdi-bell-off</v-icon>
        </v-avatar>
        <h3 class="text-h5 font-weight-medium text-white mb-2">{{ $t('noAlerts') || 'لا توجد تنبيهات' }}</h3>
        <p class="text-body-1 text-medium-emphasis">{{ $t('noAlertsMessage') || 'كل شيء هادئ، لا توجد تنبيهات جديدة' }}</p>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loading') || 'جاري التحميل...' }}</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AlertService from '@/services/AlertService';

const router = useRouter();
const { t } = useI18n();
const store = useStore();

// State
const alerts = ref([]);
const loading = ref(false);
const currentFilter = ref('all');
const currentCategory = ref('all');
const pageSize = ref(20);
const currentPage = ref(1);

const categories = ref([
  { value: 'all', label: 'الكل', icon: 'fa-solid fa-bell', color: '#d4af37' },
  { value: 'inventory', label: 'المخزون', icon: 'fa-solid fa-box', color: '#2196F3' },
  { value: 'forecast', label: 'التوقعات', icon: 'fa-solid fa-chart-line', color: '#9c27b0' },
  { value: 'seasonal', label: 'موسمي', icon: 'fa-solid fa-calendar-alt', color: '#ff9800' },
  { value: 'abc', label: 'تحليل ABC', icon: 'fa-solid fa-chart-pie', color: '#4CAF50' },
  { value: 'system', label: 'النظام', icon: 'fa-solid fa-cog', color: '#f44336' },
]);

// Computed
const currentFilterIndex = computed({
  get: () => ['all', 'unread', 'critical'].indexOf(currentFilter.value),
  set: (value) => {
    currentFilter.value = ['all', 'unread', 'critical'][value];
  }
});

const unreadCount = computed(() => {
  return alerts.value.filter((a) => !a.read).length;
});

const priorityCounts = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  alerts.value.forEach((alert) => {
    if (counts[alert.severity] !== undefined) {
      counts[alert.severity]++;
    }
  });
  return counts;
});

const categoryCounts = computed(() => {
  const counts = {};
  alerts.value.forEach((alert) => {
    counts[alert.category] = (counts[alert.category] || 0) + 1;
  });
  return counts;
});

const filteredAlerts = computed(() => {
  let filtered = [...alerts.value];

  // Filter by status
  if (currentFilter.value === 'unread') {
    filtered = filtered.filter((a) => !a.read);
  } else if (currentFilter.value === 'critical') {
    filtered = filtered.filter((a) => a.severity === 'critical' || a.severity === 'high');
  }

  // Filter by category
  if (currentCategory.value !== 'all') {
    filtered = filtered.filter((a) => a.category === currentCategory.value);
  }

  // Sort by newest
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Pagination
  return filtered.slice(0, currentPage.value * pageSize.value);
});

const hasMore = computed(() => {
  let total = alerts.value.length;
  if (currentFilter.value === 'unread') total = unreadCount.value;
  if (currentFilter.value === 'critical')
    total = priorityCounts.value.critical + priorityCounts.value.high;
  if (currentCategory.value !== 'all') total = categoryCounts.value[currentCategory.value] || 0;

  return filteredAlerts.value.length < total;
});

// Methods
const loadAlerts = async () => {
  try {
    loading.value = true;
    
    const response = await AlertService.getAlerts();
    if (response.success) {
      alerts.value = response.data;
    } else {
      // Fallback to mock data
      alerts.value = getMockAlerts();
    }
    
    currentPage.value = 1;
  } catch (error) {
    console.error('Error loading alerts:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('errorLoadingAlerts') || 'خطأ في تحميل التنبيهات',
      timeout: 5000
    });
    
    // Set fallback data
    alerts.value = getMockAlerts();
  } finally {
    loading.value = false;
  }
};

const getMockAlerts = () => {
  return [
    {
      id: 1,
      title: 'مخزون منخفض',
      message: 'منتج فينيل ديكور ذهبي وصل إلى الحد الأدنى للمخزون',
      category: 'inventory',
      severity: 'critical',
      read: false,
      actionable: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      data: {
        productName: 'فينيل ديكور ذهبي',
        currentStock: 5,
        dailyAverage: 2,
        daysRemaining: 2
      },
      action: {
        handler: 'viewProduct',
        params: { productId: 123 }
      }
    },
    {
      id: 2,
      title: 'توقعات المبيعات',
      message: 'زيادة متوقعة في مبيعات فئة الأبواب خلال الشهر القادم',
      category: 'forecast',
      severity: 'high',
      read: false,
      actionable: true,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      action: {
        handler: 'viewForecast',
        params: {}
      }
    },
    {
      id: 3,
      title: 'تحديث النظام',
      message: 'تم تحديث النظام بنجاح إلى الإصدار 2.1.0',
      category: 'system',
      severity: 'low',
      read: true,
      actionable: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ];
};

const handleAlertUpdate = (newAlerts) => {
  alerts.value = newAlerts;
};

const markAsRead = async (alertId) => {
  try {
    const response = await AlertService.markAsRead(alertId);
    
    if (response.success) {
      // Update local state
      const alert = alerts.value.find(a => a.id === alertId);
      if (alert) {
        alert.read = true;
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('success') || 'نجاح',
        message: t('alertMarkedAsRead') || 'تم تحديد التنبيه كمقروء',
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Error marking alert as read:', error);
  }
};

const markAllAsRead = async () => {
  try {
    const response = await AlertService.markAllAsRead();
    
    if (response.success) {
      // Update local state
      alerts.value.forEach(alert => {
        alert.read = true;
      });
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('success') || 'نجاح',
        message: t('allAlertsMarkedAsRead') || 'تم تحديد جميع التنبيهات كمقروءة',
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Error marking all alerts as read:', error);
  }
};

const deleteAlert = async (alertId) => {
  const confirmed = confirm(t('confirmDeleteAlert') || 'هل أنت متأكد من حذف هذا التنبيه؟');
  
  if (confirmed) {
    try {
      const response = await AlertService.deleteAlert(alertId);
      
      if (response.success) {
        // Remove from local state
        alerts.value = alerts.value.filter(alert => alert.id !== alertId);
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('success') || 'نجاح',
          message: t('alertDeleted') || 'تم حذف التنبيه بنجاح',
          timeout: 3000
        });
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }
};

const handleAction = (alert) => {
  if (alert.action?.handler) {
    const handler = alert.action.handler;
    const params = alert.action.params || {};

    if (handler === 'viewProduct' && params.productId) {
      router.push(`/dashboard/products?view=${params.productId}`);
    } else if (handler === 'viewForecast') {
      router.push('/dashboard/forecast');
    } else if (handler === 'viewSeasonality') {
      router.push('/dashboard/forecast?tab=seasonality');
    }
  }
};

const loadMore = () => {
  currentPage.value++;
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';

  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('now') || 'الآن';
  if (diffMins < 60) return `${t('minutesAgo') || 'منذ'} ${diffMins} ${t('minutes') || 'دقيقة'}`;
  if (diffHours < 24) return `${t('hoursAgo') || 'منذ'} ${diffHours} ${t('hours') || 'ساعة'}`;
  if (diffDays === 1) return t('yesterday') || 'أمس';
  if (diffDays < 7) return `${t('daysAgo') || 'منذ'} ${diffDays} ${t('days') || 'أيام'}`;

  return date.toLocaleDateString('ar-SA');
};

const getCategoryLabel = (category) => {
  const cat = categories.value.find((c) => c.value === category);
  return cat ? cat.label : category;
};

const getCategoryIcon = (category) => {
  const cat = categories.value.find((c) => c.value === category);
  return cat ? cat.icon : 'fa-solid fa-bell';
};

const getCategoryColor = (category) => {
  const cat = categories.value.find((c) => c.value === category);
  return cat ? cat.color : '#d4af37';
};

const getDefaultIcon = (alert) => {
  const icons = {
    inventory: 'fa-solid fa-box',
    forecast: 'fa-solid fa-chart-line',
    seasonal: 'fa-solid fa-calendar-alt',
    abc: 'fa-solid fa-chart-pie',
    system: 'fa-solid fa-cog',
  };
  return icons[alert.category] || 'fa-solid fa-bell';
};

const getSeverityIcon = (severity) => {
  const icons = {
    critical: 'fa-solid fa-exclamation-triangle',
    high: 'fa-solid fa-exclamation-circle',
    medium: 'fa-solid fa-exclamation',
    low: 'fa-solid fa-info-circle',
  };
  return icons[severity] || 'fa-solid fa-bell';
};

const getSeverityLabel = (severity) => {
  const labels = {
    critical: t('critical') || 'حرج',
    high: t('high') || 'عالي',
    medium: t('medium') || 'متوسط',
    low: t('low') || 'منخفض',
  };
  return labels[severity] || severity;
};

const getSeverityColor = (severity) => {
  const colors = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
  };
  return colors[severity] || 'primary';
};

const getMdiIcon = (faIcon) => {
  const iconMap = {
    'fa-solid fa-bell': 'mdi-bell',
    'fa-solid fa-box': 'mdi-package',
    'fa-solid fa-chart-line': 'mdi-chart-line',
    'fa-solid fa-calendar-alt': 'mdi-calendar',
    'fa-solid fa-chart-pie': 'mdi-chart-pie',
    'fa-solid fa-cog': 'mdi-cog',
    'fa-solid fa-exclamation-triangle': 'mdi-alert-triangle',
    'fa-solid fa-exclamation-circle': 'mdi-alert-circle',
    'fa-solid fa-exclamation': 'mdi-alert',
    'fa-solid fa-info-circle': 'mdi-information',
    'fa-solid fa-check': 'mdi-check',
    'fa-solid fa-eye': 'mdi-eye',
    'fa-solid fa-trash': 'mdi-delete',
    'fa-solid fa-clock': 'mdi-clock',
    'fa-solid fa-warehouse': 'mdi-warehouse',
    'fa-solid fa-bell-slash': 'mdi-bell-off',
  };
  return iconMap[faIcon] || 'mdi-bell';
};

// Watchers
watch(() => currentFilter.value, () => {
  currentPage.value = 1;
});

watch(() => currentCategory.value, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  loadAlerts();
  
  // Subscribe to real-time updates
  AlertService.subscribe(handleAlertUpdate);
});

onBeforeUnmount(() => {
  // Unsubscribe from real-time updates
  AlertService.unsubscribe(handleAlertUpdate);
});
</script>

<style scoped>
/* Page Header */
.page-header {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.1), rgba(var(--v-theme-secondary), 0.1));
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
}

.page-header:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.header-icon {
  animation: iconPulse 2s ease infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* Statistics Cards */
.stat-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.stat-card.critical {
  background: linear-gradient(135deg, rgb(var(--v-theme-error)), rgb(var(--v-theme-error-darken-1)));
}

.stat-card.high {
  background: linear-gradient(135deg, rgb(var(--v-theme-warning)), rgb(var(--v-theme-warning-darken-1)));
}

.stat-card.medium {
  background: linear-gradient(135deg, rgb(var(--v-theme-info)), rgb(var(--v-theme-info-darken-1)));
}

.stat-card.low {
  background: linear-gradient(135deg, rgb(var(--v-theme-success)), rgb(var(--v-theme-success-darken-1)));
}

/* Filter Tabs */
.filter-toggle {
  background: transparent;
}

.filter-tab {
  transition: all 0.3s ease;
}

.filter-tab:hover {
  transform: translateY(-2px);
}

/* Category Chips */
.category-chip {
  transition: all 0.3s ease;
}

.category-chip:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

/* Alert Items */
.alert-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.alert-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.alert-item:hover::before {
  left: 100%;
}

.alert-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.alert-item.alert-read {
  opacity: 0.7;
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.alert-item.severity-critical {
  border-left: 4px solid rgb(var(--v-theme-error));
}

.alert-item.severity-high {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.alert-item.severity-medium {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.alert-item.severity-low {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.alert-avatar {
  transition: all 0.3s ease;
}

.alert-item:hover .alert-avatar {
  transform: scale(1.05);
}

/* Alert Actions */
.alert-actions .v-btn {
  transition: all 0.3s ease;
}

.alert-actions .v-btn:hover {
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.05));
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.empty-state:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Transitions */
.alert-transition-enter-active,
.alert-transition-leave-active {
  transition: all 0.3s ease;
}

.alert-transition-enter {
  opacity: 0;
  transform: translateX(20px);
}

.alert-transition-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.alert-transition-move {
  transition: transform 0.3s ease;
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alerts-center {
  animation: fadeIn 0.5s ease;
}

/* Responsive Design */
@media (max-width: 960px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .category-tabs {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .header-title h1 {
    font-size: 1.5rem;
  }
  
  .filter-toggle {
    flex-direction: column;
  }
  
  .alert-item .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .alert-actions {
    flex-direction: row;
    justify-content: center;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-chip) {
  transition: all 0.3s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
}

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-btn-toggle) {
  background: transparent;
}

:deep(.v-btn-toggle .v-btn) {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
}

:deep(.v-btn-toggle .v-btn.v-btn--active) {
  background: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-on-primary));
}
</style>
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.alert-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-gold);
}

.alert-item.severity-critical {
  border-right: 4px solid #f44336;
}

.alert-item.severity-high {
  border-right: 4px solid #ff9800;
}

.alert-item.severity-medium {
  border-right: 4px solid #2196f3;
}

.alert-item.severity-low {
  border-right: 4px solid #4caf50;
}

.alert-item.alert-read {
  opacity: 0.7;
  background: var(--bg-primary);
}

.alert-icon {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.alert-title {
  color: white;
  font-size: 1.1rem;
  font-weight: 600;
}

.alert-time {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.alert-message {
  color: var(--text-secondary);
  font-size: 0.95rem;
  margin-bottom: 12px;
  line-height: 1.5;
}

.alert-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.alert-category,
.alert-severity,
.alert-days {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.alert-category {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-1);
}

.alert-severity.critical {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.alert-severity.high {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.alert-severity.medium {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.alert-severity.low {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.alert-days {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.alert-days.urgent {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.alert-data {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  background: var(--bg-primary);
  padding: 10px 15px;
  border-radius: 12px;
  margin-top: 10px;
}

.data-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.data-item i {
  color: var(--gold-1);
}

.alert-actions {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-shrink: 0;
}

.action-btn {
  width: 35px;
  height: 35px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  background: var(--bg-primary);
  color: var(--text-dim);
}

.action-btn.mark-read:hover {
  background: #4caf50;
  color: white;
}

.action-btn.view:hover {
  background: var(--gold-1);
  color: var(--bg-deep);
}

.action-btn.delete:hover {
  background: #f44336;
  color: white;
}

/* زر تحميل المزيد */
.load-more {
  text-align: center;
  margin-top: 30px;
}

.load-more button {
  padding: 12px 30px;
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 30px;
  color: var(--gold-1);
  cursor: pointer;
  transition: all 0.3s;
}

.load-more button:hover {
  background: var(--gold-gradient);
  color: var(--bg-deep);
  transform: translateY(-3px);
}

/* حالة فارغة */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--bg-card);
  border-radius: 24px;
  border: 1px solid var(--border-light);
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-dim);
  margin-bottom: 20px;
  animation: float 3s ease infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-state h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-state p {
  color: var(--text-dim);
  font-size: 1rem;
}

/* تأثيرات الحركة */
.alert-enter-active,
.alert-leave-active {
  transition: all 0.3s;
}

.alert-enter {
  opacity: 0;
  transform: translateX(20px);
}

.alert-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* استجابة للشاشات الصغيرة */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
  }

  .alert-item {
    flex-direction: column;
  }

  .alert-actions {
    justify-content: flex-end;
  }

  .category-tabs {
    justify-content: center;
  }
}
</style>
