<template>
  <v-container fluid class="pricing-analytics">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div>
                <h1 class="text-h4 font-weight-bold gold-text mb-2">
                  <v-icon class="me-3" color="#d4af37">mdi-chart-bar</v-icon>
                  {{ $t('pricing.analytics.title', 'تحليلات التسعير') }}
                </h1>
                <p class="text-dim">{{ $t('pricing.analytics.subtitle', 'تحليلات متقدمة لأسعار المنتجات والسوق') }}</p>
              </div>
              <div class="d-flex gap-2 mt-4 mt-sm-0">
                <v-btn
                  :color="loading ? 'grey' : 'primary'"
                  :loading="loading"
                  @click="refreshAnalytics"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-refresh</v-icon>
                  {{ $t('common.refresh', 'تحديث') }}
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="exportAnalytics"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-download</v-icon>
                  {{ $t('common.export', 'تصدير') }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- KPI Cards -->
    <v-row class="mb-6">
      <v-col
        v-for="kpi in kpiData"
        :key="kpi.title"
        cols="12"
        sm="6"
        md="3"
      >
        <v-card class="kpi-card glass-card" elevation="0">
          <v-card-text class="pa-4">
            <div class="d-flex align-center">
              <v-avatar
                :color="kpi.color"
                size="48"
                class="me-3"
              >
                <v-icon :icon="kpi.icon" size="24"></v-icon>
              </v-avatar>
              <div class="flex-grow-1">
                <h3 class="text-h5 font-weight-bold mb-1">{{ kpi.value }}</h3>
                <p class="text-body-2 text-dim mb-2">{{ kpi.title }}</p>
                <v-chip
                  :color="kpi.trendType === 'positive' ? 'success' : 'error'"
                  size="small"
                  variant="elevated"
                >
                  <v-icon
                    :icon="kpi.trendIcon"
                    size="16"
                    class="me-1"
                  ></v-icon>
                  {{ kpi.trend }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analytics Charts -->
    <v-row class="mb-6">
      <!-- Price Performance Chart -->
      <v-col cols="12" lg="6">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-chart-line</v-icon>
            {{ $t('pricing.analytics.performance', 'أداء التسعير') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="pricePerformanceChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Price Distribution Chart -->
      <v-col cols="12" lg="6">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-chart-pie</v-icon>
            {{ $t('pricing.analytics.distribution', 'توزيع الأسعار') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="priceDistributionChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Advanced Analytics -->
    <v-row class="mb-6">
      <!-- Competitor Analysis -->
      <v-col cols="12" lg="8">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-chart-multiline</v-icon>
            {{ $t('pricing.analytics.competitor', 'تحليل المنافسين') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="competitorAnalysisChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- ROI Analysis -->
      <v-col cols="12" lg="4">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-trending-up</v-icon>
            {{ $t('pricing.analytics.roi', 'تحليل العائد على الاستثمار') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="chart-container">
              <canvas ref="roiAnalysisChart"></canvas>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Analytics Table -->
    <v-row>
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="#d4af37">mdi-table-chart</v-icon>
                {{ $t('pricing.analytics.detailed', 'تحليلات مفصلة') }}
              </div>
              <v-select
                v-model="selectedPeriod"
                :items="periodOptions"
                :label="$t('pricing.analytics.period', 'الفترة الزمنية')"
                variant="outlined"
                density="compact"
                style="max-width: 200px"
                @update:model-value="loadAnalytics"
              ></v-select>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-data-table
              :headers="analyticsHeaders"
              :items="analyticsData"
              :loading="loading"
              :items-per-page="10"
              class="elevation-0"
            >
              <template v-slot:item.price="{ item }">
                {{ formatCurrency(item.price) }}
              </template>
              <template v-slot:item.change="{ item }">
                <v-chip
                  :color="item.change >= 0 ? 'success' : 'error'"
                  size="small"
                  variant="elevated"
                >
                  {{ item.change >= 0 ? '+' : '' }}{{ item.change }}%
                </v-chip>
              </template>
              <template v-slot:item.status="{ item }">
                <v-chip
                  :color="getStatusColor(item.status)"
                  size="small"
                  variant="elevated"
                >
                  {{ $t(`pricing.status.${item.status}`, item.status) }}
                </v-chip>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Chart from 'chart.js/auto';
import PricingRulesService from '@/services/PricingRulesService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const selectedPeriod = ref('30days');
const analyticsData = ref([]);

// Charts refs
const pricePerformanceChart = ref(null);
const priceDistributionChart = ref(null);
const competitorAnalysisChart = ref(null);
const roiAnalysisChart = ref(null);

// Period options
const periodOptions = computed(() => [
  { title: t('pricing.period.7days', 'آخر 7 أيام'), value: '7days' },
  { title: t('pricing.period.30days', 'آخر 30 يوم'), value: '30days' },
  { title: t('pricing.period.90days', 'آخر 90 يوم'), value: '90days' },
  { title: t('pricing.period.1year', 'آخر سنة'), value: '1year' }
]);

// KPI Data
const kpiData = computed(() => [
  {
    title: t('pricing.kpi.avgMargin', 'متوسط هامش الربح'),
    value: '28.5%',
    icon: 'mdi-percent',
    color: '#d4af37',
    trend: '+2.3%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: t('pricing.kpi.accuracy', 'دقة التسعير'),
    value: '94.2%',
    icon: 'mdi-bullseye',
    color: '#4caf50',
    trend: '+1.8%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: t('pricing.kpi.revenue', 'تحسين الإيرادات'),
    value: '+15.7%',
    icon: 'mdi-chart-line',
    color: '#2196f3',
    trend: '+5.2%',
    trendType: 'positive',
    trendIcon: 'mdi-trending-up'
  },
  {
    title: t('pricing.kpi.adjustments', 'عدد التعديلات'),
    value: '1,247',
    icon: 'mdi-sync',
    color: '#ff9800',
    trend: '-3.1%',
    trendType: 'negative',
    trendIcon: 'mdi-trending-down'
  }
]);

// Table headers
const analyticsHeaders = computed(() => [
  { title: t('pricing.table.product', 'المنتج'), key: 'product', sortable: true },
  { title: t('pricing.table.category', 'الفئة'), key: 'category', sortable: true },
  { title: t('pricing.table.price', 'السعر'), key: 'price', sortable: true },
  { title: t('pricing.table.change', 'التغيير'), key: 'change', sortable: true },
  { title: t('pricing.table.status', 'الحالة'), key: 'status', sortable: true },
  { title: t('pricing.table.lastUpdate', 'آخر تحديث'), key: 'lastUpdate', sortable: true }
]);

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'error',
    pending: 'warning',
    testing: 'info'
  };
  return colors[status] || 'grey';
};

const loadAnalytics = async () => {
  try {
    loading.value = true;
    
    const response = await PricingRulesService.getPricingAnalytics({
      period: selectedPeriod.value
    });
    
    if (response.success) {
      analyticsData.value = response.data.analytics || [];
      await nextTick();
      updateCharts(response.data);
    } else {
      // Use mock data if API fails
      analyticsData.value = getMockAnalyticsData();
      await nextTick();
      updateCharts(getMockChartData());
    }
  } catch (error) {
    console.error('Error loading analytics:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.analytics.loadError', 'فشل في تحميل تحليلات التسعير')
    });
  } finally {
    loading.value = false;
  }
};

const refreshAnalytics = () => {
  loadAnalytics();
};

const exportAnalytics = async () => {
  try {
    const response = await PricingRulesService.exportPricingRules({
      period: selectedPeriod.value,
      format: 'excel'
    });
    
    if (response.success) {
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-analytics-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.analytics.exportSuccess', 'تم تصدير التحليلات بنجاح')
      });
    }
  } catch (error) {
    console.error('Error exporting analytics:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.analytics.exportError', 'فشل في تصدير التحليلات')
    });
  }
};

const updateCharts = (data) => {
  // Destroy existing charts
  Chart.getChart(pricePerformanceChart.value)?.destroy();
  Chart.getChart(priceDistributionChart.value)?.destroy();
  Chart.getChart(competitorAnalysisChart.value)?.destroy();
  Chart.getChart(roiAnalysisChart.value)?.destroy();

  // Price Performance Chart
  if (pricePerformanceChart.value && data.performance) {
    new Chart(pricePerformanceChart.value, {
      type: 'line',
      data: {
        labels: data.performance.labels || [],
        datasets: [{
          label: t('pricing.charts.revenue', 'الإيرادات'),
          data: data.performance.revenue || [],
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
          tension: 0.4
        }, {
          label: t('pricing.charts.orders', 'الطلبات'),
          data: data.performance.orders || [],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }

  // Price Distribution Chart
  if (priceDistributionChart.value && data.distribution) {
    new Chart(priceDistributionChart.value, {
      type: 'doughnut',
      data: {
        labels: data.distribution.labels || [],
        datasets: [{
          data: data.distribution.data || [],
          backgroundColor: [
            '#d4af37',
            '#4caf50',
            '#ff9800',
            '#f44336',
            '#2196f3',
            '#9c27b0'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' },
            position: 'bottom'
          }
        }
      }
    });
  }

  // Competitor Analysis Chart
  if (competitorAnalysisChart.value && data.competitor) {
    new Chart(competitorAnalysisChart.value, {
      type: 'bar',
      data: {
        labels: data.competitor.labels || [],
        datasets: [{
          label: t('pricing.charts.ourPrices', 'أسعارنا'),
          data: data.competitor.ourPrices || [],
          backgroundColor: '#d4af37'
        }, {
          label: t('pricing.charts.competitorAvg', 'متوسط المنافسين'),
          data: data.competitor.competitorPrices || [],
          backgroundColor: '#4caf50'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }

  // ROI Analysis Chart
  if (roiAnalysisChart.value && data.roi) {
    new Chart(roiAnalysisChart.value, {
      type: 'line',
      data: {
        labels: data.roi.labels || [],
        datasets: [{
          label: t('pricing.charts.roi', 'العائد على الاستثمار'),
          data: data.roi.data || [],
          borderColor: '#4caf50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' }
          }
        }
      }
    });
  }
};

// Mock data functions
const getMockAnalyticsData = () => [
  {
    id: 1,
    product: 'فينيل ديكوري فاخر',
    category: 'ديكور',
    price: 2500,
    change: 5.2,
    status: 'active',
    lastUpdate: '2024-01-20'
  },
  {
    id: 2,
    product: 'فينيل جدران عصري',
    category: 'جدران',
    price: 1800,
    change: -2.1,
    status: 'active',
    lastUpdate: '2024-01-19'
  },
  {
    id: 3,
    product: 'فينيل أرضيات مقاوم',
    category: 'أرضيات',
    price: 1200,
    change: 8.7,
    status: 'testing',
    lastUpdate: '2024-01-18'
  }
];

const getMockChartData = () => ({
  performance: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    revenue: [120000, 135000, 142000, 138000, 155000, 168000],
    orders: [450, 520, 580, 560, 620, 680]
  },
  distribution: {
    labels: ['ديكور', 'جدران', 'أرضيات', 'سقف', 'أثاث'],
    data: [35, 25, 20, 12, 8]
  },
  competitor: {
    labels: ['فينيل ديكوري', 'فينيل جدران', 'فينيل أرضيات'],
    ourPrices: [2500, 1800, 1200],
    competitorPrices: [2400, 1900, 1150]
  },
  roi: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    data: [12, 15, 18, 16, 22, 25]
  }
});

// Lifecycle
onMounted(() => {
  loadAnalytics();
});
</script>

<style scoped>
.pricing-analytics {
  min-height: 100vh;
  padding: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.gold-text {
  color: #d4af37 !important;
}

.text-dim {
  color: rgba(255, 255, 255, 0.7) !important;
}

.kpi-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.2);
}

.chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pricing-analytics {
    padding: 10px;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style>
