<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 analytics-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-account-group</v-icon>
              {{ $t('customerAnalytics') || 'تحليلات العملاء' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('customerAnalyticsSubtitle') || 'تحليلات سلوك وبيانات العملاء' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="exportData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-download"
            >
              {{ $t('exportData') || 'تصدير البيانات' }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingCustomerAnalytics') || 'جاري تحميل تحليلات العملاء...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Customer Overview Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in customerStats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="stat-card">
            <v-card-text class="pa-4 text-center">
              <v-avatar
                :color="stat.color"
                variant="tonal"
                size="50"
                class="mb-3"
              >
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.title }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Customer Segments -->
      <v-row class="mb-6">
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analytics-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-account-group-outline</v-icon>
                {{ $t('customerSegments') || 'شرائح العملاء' }}
              </h3>
              <div class="segments-container" style="height: 300px;">
                <canvas ref="segmentsChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Customer Retention -->
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analytics-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-trending-up</v-icon>
                {{ $t('customerRetention') || 'الاحتفاظ بالعملاء' }}
              </h3>
              <div class="retention-container" style="height: 300px;">
                <canvas ref="retentionChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Customer Behavior -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card variant="elevated" class="analytics-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-line</v-icon>
                {{ $t('customerBehavior') || 'سلوك العملاء' }}
              </h3>
              <div class="behavior-container" style="height: 400px;">
                <canvas ref="behaviorChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Top Customers -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="analytics-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-star</v-icon>
                {{ $t('topCustomers') || 'أفضل العملاء' }}
              </h3>
              <div class="top-customers">
                <div v-for="(customer, index) in topCustomers" :key="customer.id" class="top-customer d-flex align-center ga-3 mb-3">
                  <v-avatar variant="tonal" color="primary" size="40">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <div class="flex-grow-1">
                    <h4 class="text-body-2 font-weight-medium text-white mb-1">{{ customer.name }}</h4>
                    <p class="text-caption text-medium-emphasis mb-0">{{ customer.email }}</p>
                  </div>
                  <div class="text-end">
                    <div class="text-body-2 font-weight-medium text-white">{{ formatCurrency(customer.totalSpent) }}</div>
                    <div class="text-caption text-medium-emphasis">{{ customer.orders }} {{ $t('orders') || 'طلبات' }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import AnalyticsService from '@/services/AnalyticsService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);

// Chart refs
const segmentsChart = ref(null);
const retentionChart = ref(null);
const behaviorChart = ref(null);

// Data
const customerStats = ref([
  {
    title: t('totalCustomers') || 'إجمالي العملاء',
    value: '1,234',
    icon: 'mdi-account-group',
    color: 'primary'
  },
  {
    title: t('newCustomers') || 'عملاء جدد',
    value: '156',
    icon: 'mdi-account-plus',
    color: 'success'
  },
  {
    title: t('returningCustomers') || 'عملاء عائدون',
    value: '234',
    icon: 'mdi-account-refresh',
    color: 'warning'
  },
  {
    title: t('avgLifetimeValue') || 'متوسط القيمة الدائمة',
    value: '1,850 ر.س',
    icon: 'mdi-currency-usd',
    color: 'info'
  }
]);

const topCustomers = ref([
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    totalSpent: 12500,
    orders: 23
  },
  {
    id: 2,
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    totalSpent: 9800,
    orders: 18
  },
  {
    id: 3,
    name: 'محمد عبدالله',
    email: 'mohammed@example.com',
    totalSpent: 8600,
    orders: 15
  },
  {
    id: 4,
    name: 'نورة سالم',
    email: 'noura@example.com',
    totalSpent: 7200,
    orders: 12
  },
  {
    id: 5,
    name: 'خالد أحمد',
    email: 'khalid@example.com',
    totalSpent: 6500,
    orders: 11
  }
]);

// API Integration Methods
const loadCustomerAnalytics = async () => {
  try {
    const response = await AnalyticsService.getCustomerAnalytics();
    if (response.success) {
      // Update data with API response
      customerStats.value = response.data.customerStats || customerStats.value;
      topCustomers.value = response.data.topCustomers || topCustomers.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for customer analytics');
    }
  } catch (error) {
    console.error('Error loading customer analytics:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('analyticsError') || 'خطأ في تحميل التحليلات',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const formatCurrency = (value) => {
  return `${value.toLocaleString()} ر.س`;
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadCustomerAnalytics();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('customerAnalyticsRefreshed') || 'تم تحديث تحليلات العملاء بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

const exportData = () => {
  const analyticsData = {
    customerStats: customerStats.value,
    topCustomers: topCustomers.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customer-analytics-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('dataExported') || 'تم تصدير البيانات',
    message: t('customerAnalyticsExported') || 'تم تصدير تحليلات العملاء بنجاح',
    timeout: 3000
  });
};

const initializeCharts = () => {
  nextTick(() => {
    // Initialize segments chart
    if (segmentsChart.value) {
      const ctx = segmentsChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: [t('newCustomers') || 'عملاء جدد', t('returningCustomers') || 'عملاء عائدون', t('inactiveCustomers') || 'عملاء غير نشطين'],
          datasets: [{
            data: [156, 234, 892],
            backgroundColor: [
              'rgb(var(--v-theme-success))',
              'rgb(var(--v-theme-warning))',
              'rgb(var(--v-theme-error))'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: 'rgb(var(--v-theme-on-surface))'
              }
            }
          }
        }
      });
    }
    
    // Initialize retention chart
    if (retentionChart.value) {
      const ctx = retentionChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          datasets: [{
            label: t('retentionRate') || 'معدل الاحتفاظ',
            data: [65, 68, 72, 70, 75, 78],
            borderColor: 'rgb(var(--v-theme-primary))',
            backgroundColor: 'rgba(var(--v-theme-primary), 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(var(--v-theme-on-surface))'
              }
            }
          },
          scales: {
            y: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            },
            x: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            }
          }
        }
      });
    }
    
    // Initialize behavior chart
    if (behaviorChart.value) {
      const ctx = behaviorChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
          datasets: [{
            label: t('newVisitors') || 'زوار جدد',
            data: [45, 52, 38, 65, 48, 72, 58],
            backgroundColor: 'rgba(var(--v-theme-success), 0.8)'
          }, {
            label: t('returningVisitors') || 'زوار عائدون',
            data: [120, 135, 125, 140, 130, 145, 138],
            backgroundColor: 'rgba(var(--v-theme-primary), 0.8)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(var(--v-theme-on-surface))'
              }
            }
          },
          scales: {
            y: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            },
            x: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            }
          }
        }
      });
    }
  });
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    await loadCustomerAnalytics();
    initializeCharts();
  } catch (error) {
    console.error('Error initializing Customer Analytics:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // Cleanup charts
  if (segmentsChart.value) {
    const chart = Chart.getChart(segmentsChart.value);
    if (chart) chart.destroy();
  }
  
  if (retentionChart.value) {
    const chart = Chart.getChart(retentionChart.value);
    if (chart) chart.destroy();
  }
  
  if (behaviorChart.value) {
    const chart = Chart.getChart(behaviorChart.value);
    if (chart) chart.destroy();
  }
});
</script>

<style scoped>
/* Analytics Header */
.analytics-header {
  position: relative;
  overflow: hidden;
}

.analytics-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.analytics-header:hover::before {
  left: 100%;
}

/* Stat Cards */
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
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Analytics Cards */
.analytics-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.analytics-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.analytics-card:hover::before {
  left: 100%;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Top Customers */
.top-customers {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-customer {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.top-customer::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.top-customer:hover::before {
  left: 100%;
}

.top-customer:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
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

.stat-card {
  animation: fadeIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.analytics-card {
  animation: fadeIn 0.6s ease forwards;
}

.analytics-card:nth-child(1) { animation-delay: 0.1s; }
.analytics-card:nth-child(2) { animation-delay: 0.2s; }

.top-customer {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .analytics-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .analytics-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .analytics-card {
    margin-bottom: 1rem;
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

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-icon) {
  transition: all 0.3s ease;
}

:deep(.v-icon:hover) {
  transform: scale(1.1);
}
</style>
