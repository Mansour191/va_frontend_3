<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 sales-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-chart-line</v-icon>
              {{ $t('salesAnalytics') || 'تحليلات المبيعات' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('salesAnalyticsSubtitle') || 'تحليلات مفصلة للمبيعات والإيرادات' }}
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
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingSalesAnalytics') || 'جاري تحميل تحليلات المبيعات...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Sales Overview Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in salesStats"
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

      <!-- Sales Charts -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="sales-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-line</v-icon>
                {{ $t('salesTrends') || 'اتجاهات المبيعات' }}
              </h3>
              <div class="chart-container" style="height: 400px;">
                <canvas ref="trendsChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="sales-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-pie</v-icon>
                {{ $t('salesByCategory') || 'المبيعات حسب الفئة' }}
              </h3>
              <div class="chart-container" style="height: 400px;">
                <canvas ref="categoryChart"></canvas>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Top Products -->
      <v-row class="mb-6">
        <v-col cols="12">
          <v-card variant="elevated" class="sales-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-star</v-icon>
                {{ $t('topSellingProducts') || 'أفضل المنتجات مبيعًا' }}
              </h3>
              <v-row>
                <v-col
                  v-for="product in topProducts"
                  :key="product.id"
                  cols="12"
                  sm="6"
                  md="4"
                  lg="3"
                >
                  <v-card variant="outlined" class="product-item">
                    <v-card-text class="pa-3">
                      <div class="d-flex align-center ga-2 mb-2">
                        <v-avatar :color="product.categoryColor" variant="tonal" size="32">
                          <v-icon size="16">{{ product.categoryIcon }}</v-icon>
                        </v-avatar>
                        <span class="text-caption text-medium-emphasis">{{ product.category }}</span>
                      </div>
                      <h4 class="text-body-2 font-weight-medium text-white mb-2">{{ product.name }}</h4>
                      <div class="d-flex align-center justify-space-between mb-2">
                        <span class="text-body-2 font-weight-medium text-success">{{ formatCurrency(product.revenue) }}</span>
                        <span class="text-caption text-medium-emphasis">{{ product.sales }} {{ $t('sales') || 'مبيعات' }}</span>
                      </div>
                      <v-progress-linear
                        :model-value="(product.sales / maxSales) * 100"
                        :color="product.categoryColor"
                        height="4"
                        rounded
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Revenue Analysis -->
      <v-row>
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="sales-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-currency-usd</v-icon>
                {{ $t('revenueAnalysis') || 'تحليل الإيرادات' }}
              </h3>
              <div class="revenue-metrics">
                <div class="metric-item d-flex justify-space-between align-center mb-3">
                  <span class="text-caption text-medium-emphasis">{{ $t('totalRevenue') || 'إجمالي الإيرادات' }}</span>
                  <span class="text-body-2 font-weight-medium text-white">{{ formatCurrency(revenueMetrics.total) }}</span>
                </div>
                <div class="metric-item d-flex justify-space-between align-center mb-3">
                  <span class="text-caption text-medium-emphasis">{{ $t('averageRevenue') || 'متوسط الإيرادات' }}</span>
                  <span class="text-body-2 font-weight-medium text-white">{{ formatCurrency(revenueMetrics.average) }}</span>
                </div>
                <div class="metric-item d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('growthRate') || 'معدل النمو' }}</span>
                  <span class="text-body-2 font-weight-medium text-success">+{{ revenueMetrics.growth }}%</span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="sales-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-trending-up</v-icon>
                {{ $t('salesForecast') || 'توقعات المبيعات' }}
              </h3>
              <div class="chart-container" style="height: 200px;">
                <canvas ref="forecastChart"></canvas>
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
const trendsChart = ref(null);
const categoryChart = ref(null);
const forecastChart = ref(null);

// Data
const salesStats = ref([
  {
    title: t('totalRevenue') || 'إجمالي الإيرادات',
    value: '284,500 ر.س',
    icon: 'mdi-currency-usd',
    color: 'primary'
  },
  {
    title: t('totalOrders') || 'إجمالي الطلبات',
    value: '1,234',
    icon: 'mdi-shopping',
    color: 'success'
  },
  {
    title: t('averageOrderValue') || 'متوسط قيمة الطلب',
    value: '450 ر.س',
    icon: 'mdi-calculator',
    color: 'warning'
  },
  {
    title: t('growthRate') || 'معدل النمو',
    value: '+12.5%',
    icon: 'mdi-trending-up',
    color: 'info'
  }
]);

const topProducts = ref([
  {
    id: 1,
    name: 'ملصق حائط زهور',
    category: 'جدران',
    sales: 234,
    revenue: 10530,
    categoryColor: 'primary',
    categoryIcon: 'mdi-wall'
  },
  {
    id: 2,
    name: 'ملصق باب خشبي',
    category: 'أبواب',
    sales: 187,
    revenue: 16643,
    categoryColor: 'success',
    categoryIcon: 'mdi-door'
  },
  {
    id: 3,
    name: 'إطار سيارة رياضي',
    category: 'سيارات',
    sales: 156,
    revenue: 18720,
    categoryColor: 'warning',
    categoryIcon: 'mdi-car'
  },
  {
    id: 4,
    name: 'ملصق مطبخ فواكه',
    category: 'مطابخ',
    sales: 98,
    revenue: 6370,
    categoryColor: 'info',
    categoryIcon: 'mdi-kitchen'
  },
  {
    id: 5,
    name: 'ملصق أرضيات',
    category: 'أرضيات',
    sales: 87,
    revenue: 7830,
    categoryColor: 'error',
    categoryIcon: 'mdi-floor'
  },
  {
    id: 6,
    name: 'ملصق جدار ثلاثي أبعاد',
    category: 'جدران',
    sales: 76,
    revenue: 11400,
    categoryColor: 'primary',
    categoryIcon: 'mdi-wall'
  },
  {
    id: 7,
    name: 'ملصق أثاث كلاسيكي',
    category: 'أثاث',
    sales: 65,
    revenue: 9750,
    categoryColor: 'purple',
    categoryIcon: 'mdi-sofa'
  },
  {
    id: 8,
    name: 'ملصق عصري',
    category: 'جدران',
    sales: 54,
    revenue: 7020,
    categoryColor: 'primary',
    categoryIcon: 'mdi-wall'
  }
]);

const revenueMetrics = ref({
  total: 284500,
  average: 450,
  growth: 12.5
});

// Computed
const maxSales = computed(() => {
  return Math.max(...topProducts.value.map(p => p.sales));
});

// API Integration Methods
const loadSalesData = async () => {
  try {
    const response = await AnalyticsService.getSalesAnalytics();
    if (response.success) {
      // Update data with API response
      salesStats.value = response.data.salesStats || salesStats.value;
      topProducts.value = response.data.topProducts || topProducts.value;
      revenueMetrics.value = response.data.revenueMetrics || revenueMetrics.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for sales analytics');
    }
  } catch (error) {
    console.error('Error loading sales data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('salesAnalyticsError') || 'خطأ في تحميل تحليلات المبيعات',
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
    await loadSalesData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('salesAnalyticsRefreshed') || 'تم تحديث تحليلات المبيعات بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

const exportData = () => {
  const salesData = {
    salesStats: salesStats.value,
    topProducts: topProducts.value,
    revenueMetrics: revenueMetrics.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(salesData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sales-analytics-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('dataExported') || 'تم تصدير البيانات',
    message: t('salesAnalyticsExported') || 'تم تصدير تحليلات المبيعات بنجاح',
    timeout: 3000
  });
};

const initializeCharts = () => {
  nextTick(() => {
    // Initialize trends chart
    if (trendsChart.value) {
      const ctx = trendsChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
          datasets: [{
            label: t('revenue') || 'الإيرادات',
            data: [45000, 52000, 48000, 61000, 58000, 70500],
            borderColor: 'rgb(var(--v-theme-primary))',
            backgroundColor: 'rgba(var(--v-theme-primary), 0.1)',
            tension: 0.4
          }, {
            label: t('orders') || 'الطلبات',
            data: [180, 210, 195, 245, 230, 274],
            borderColor: 'rgb(var(--v-theme-success))',
            backgroundColor: 'rgba(var(--v-theme-success), 0.1)',
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
    
    // Initialize category chart
    if (categoryChart.value) {
      const ctx = categoryChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['جدران', 'أبواب', 'سيارات', 'مطابخ', 'أثاث', 'أرضيات'],
          datasets: [{
            data: [35, 25, 20, 8, 7, 5],
            backgroundColor: [
              'rgb(var(--v-theme-primary))',
              'rgb(var(--v-theme-success))',
              'rgb(var(--v-theme-warning))',
              'rgb(var(--v-theme-info))',
              'rgb(var(--v-theme-purple))',
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
    
    // Initialize forecast chart
    if (forecastChart.value) {
      const ctx = forecastChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
          datasets: [{
            label: t('forecastedRevenue') || 'الإيرادات المتوقعة',
            data: [75000, 78000, 82000, 85000, 88000, 92000],
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
    await loadSalesData();
    initializeCharts();
  } catch (error) {
    console.error('Error initializing Sales Analytics:', error);
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // Cleanup charts
  if (trendsChart.value) {
    const chart = Chart.getChart(trendsChart.value);
    if (chart) chart.destroy();
  }
  
  if (categoryChart.value) {
    const chart = Chart.getChart(categoryChart.value);
    if (chart) chart.destroy();
  }
  
  if (forecastChart.value) {
    const chart = Chart.getChart(forecastChart.value);
    if (chart) chart.destroy();
  }
});
</script>

<style scoped>
/* Sales Header */
.sales-header {
  position: relative;
  overflow: hidden;
}

.sales-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.sales-header:hover::before {
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

/* Sales Cards */
.sales-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.sales-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.sales-card:hover::before {
  left: 100%;
}

.sales-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Product Items */
.product-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.product-item:hover::before {
  left: 100%;
}

.product-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Chart Containers */
.chart-container {
  position: relative;
}

/* Revenue Metrics */
.revenue-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.metric-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.metric-item:hover::before {
  left: 100%;
}

.metric-item:hover {
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

.sales-card {
  animation: fadeIn 0.6s ease forwards;
}

.sales-card:nth-child(1) { animation-delay: 0.1s; }
.sales-card:nth-child(2) { animation-delay: 0.2s; }

.product-item,
.metric-item {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .sales-header .d-flex {
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
  .sales-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .sales-card {
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

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
}
</style>
