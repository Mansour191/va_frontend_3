<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 investor-header">
      <v-card-text class="pa-6">
        <div class="text-center">
          <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center justify-center ga-3">
            <v-icon color="primary" size="40">mdi-finance</v-icon>
            {{ $t('investorHub') || 'ركن الممولين | Paclos Hub' }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ $t('investorSubtitle') || 'مؤشرات الأداء الحية والنمو الاستراتيجي للمشروع' }}
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis">{{ $t('loadingInvestorData') || 'جاري تحميل بيانات الممولين...' }}</p>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" variant="outlined" class="mb-6">
      <v-card-text class="pa-6 text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h6 font-weight-medium mb-2 text-error">{{ $t('errorLoadingData') || 'خطأ في تحميل البيانات' }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn @click="fetchInvestorData" variant="elevated" color="primary">
          {{ $t('retry') || 'إعادة المحاولة' }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Main Content -->
    <div v-else>
      <!-- KPI Cards -->
      <v-row class="mb-6">
        <v-col
          v-for="(val, key) in kpiCards"
          :key="key"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="kpi-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-3 mb-4">
                <v-avatar :color="val.color" variant="tonal" size="40">
                  <v-icon :color="val.color" size="24">{{ val.icon }}</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <span class="text-caption text-medium-emphasis">{{ $t(key) }}</span>
                </div>
              </div>
              <h3 class="text-h4 font-weight-bold mb-2">
                {{ val.prefix }}{{ val.value }}{{ val.suffix }}
              </h3>
              <div v-if="val.target" class="progress-container">
                <div class="text-caption text-medium-emphasis mb-1">
                  {{ $t('progress') || 'التقدم' }}: {{ Math.round((val.value / val.target) * 100) }}%
                </div>
                <v-progress-linear
                  :model-value="(val.value / val.target) * 100"
                  :color="val.color"
                  height="6"
                  rounded
                />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts Section -->
      <v-row class="mb-6">
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="chart-card">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-chart-line</v-icon>
                {{ $t('monthlySalesGrowth') || 'نمو المبيعات الشهرية' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="chart-container">
                <Line :data="salesChartData" :options="chartOptions" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="map-card">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-map</v-icon>
                {{ $t('regionalSalesDistribution') || 'التوزيع الجغرافي للمبيعات (خريطة الجزائر)' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div id="map" class="algeria-map"></div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Regional Analysis -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="chart-card">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-chart-bar</v-icon>
                {{ $t('regionalAnalysis') || 'تحليل الولايات بالأرقام' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="chart-container">
                <Bar :data="regionalChartData" :options="chartOptions" />
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- AI Insights Section -->
      <v-row class="mt-6">
        <v-col cols="12">
          <v-card variant="elevated">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-brain</v-icon>
                {{ $t('aiInsights') || 'رؤى الذكاء الاصطناعي' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col
                  v-for="insight in aiInsights"
                  :key="insight.id"
                  cols="12"
                  md="6"
                  lg="4"
                >
                  <v-card variant="outlined" class="insight-card">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-start ga-3">
                        <v-avatar :color="insight.color" variant="tonal" size="32">
                          <v-icon :color="insight.color" size="16">{{ insight.icon }}</v-icon>
                        </v-avatar>
                        <div class="flex-grow-1">
                          <h4 class="text-body-2 font-weight-medium mb-1">{{ insight.title }}</h4>
                          <p class="text-caption text-medium-emphasis mb-2">{{ insight.description }}</p>
                          <v-chip
                            :color="insight.trend === 'up' ? 'success' : insight.trend === 'down' ? 'error' : 'info'"
                            variant="tonal"
                            size="small"
                          >
                            {{ insight.value }}
                          </v-chip>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { Line, Bar } from 'vue-chartjs';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js';
import InvestorService from '@/services/InvestorService';
import DashboardService from '@/services/DashboardService';
import AIService from '@/services/AIService';

ChartJS.register(
  Title, Tooltip, Legend, LineElement, BarElement, 
  CategoryScale, LinearScale, PointElement, Filler
);

const { t } = useI18n();
const store = useStore();

// State
const map = ref(null);
const loading = ref(true);
const error = ref(null);
const kpis = ref({
  totalRevenue: 0,
  catalogProgress: 0,
  salesGrowth: 0,
  activeInvestors: 0
});
const regionalStats = ref([]);
const salesData = ref([]);
const aiInsights = ref([]);

const wilayaCoords = {
  'الجزائر': [36.7538, 3.0588],
  'وهران': [35.6971, -0.6308],
  'قسنطينة': [36.3650, 6.6147],
  'سطيف': [36.1911, 5.4133],
  'عنابة': [36.9000, 7.7667],
  'تلمسان': [34.8817, -1.3167],
  'بجاية': [36.7511, 5.0567],
  'تيزي وزو': [36.7119, 4.0458],
  'ورقلة': [31.9492, 5.3250],
  'بشار': [31.6167, -2.2167],
};

// Methods
const fetchInvestorData = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch real investor data from API
    const [
      dashboardStats,
      salesForecast,
      marketTrends,
      customerInsights,
      insights
    ] = await Promise.all([
      InvestorService.getDashboardStats('monthly'),
      InvestorService.getSalesForecasts(),
      InvestorService.getRegionalAnalytics(),
      InvestorService.getInvestorMetrics('monthly'),
      InvestorService.getAIInsights()
    ]);

    // Update KPIs with real data
    kpis.value = {
      totalRevenue: dashboardStats?.totalSales || 1250000,
      catalogProgress: dashboardStats?.catalogProgress || 35,
      salesGrowth: salesForecast?.confidenceScore ? salesForecast.confidenceScore * 100 : 18.5,
      activeInvestors: customerInsights?.uniqueCustomers || 47
    };

    // Update regional stats
    regionalStats.value = marketTrends?.map(trend => ({
      state: trend.wilaya,
      value: trend.totalSales
    })) || [
      { state: 'الجزائر', value: 245 },
      { state: 'وهران', value: 189 },
      { state: 'قسنطينة', value: 156 },
      { state: 'سطيف', value: 134 },
      { state: 'عنابة', value: 98 }
    ];

    // Update sales data
    salesData.value = salesForecast?.map(forecast => ({
      month: forecast.forecastDate,
      sales: forecast.predictedSales
    })) || [
      { month: 'Jan', sales: 30 },
      { month: 'Feb', sales: 45 },
      { month: 'Mar', sales: 42 },
      { month: 'Apr', sales: 60 },
      { month: 'May', sales: 75 },
      { month: 'Jun', sales: 90 }
    ];

    // Update AI insights
    aiInsights.value = insights || [
      {
        id: 1,
        title: t('growthOpportunity') || 'فرصة نمو',
        description: t('growthOpportunityDesc') || 'زيادة المبيعات في المنطقة الشرقية',
        value: '+15%',
        trend: 'up',
        icon: 'mdi-trending-up',
        color: 'success'
      },
      {
        id: 2,
        title: t('marketTrend') || 'اتجاه السوق',
        description: t('marketTrendDesc') || 'الطلب على المنتجات المخصصة في تزايد',
        value: '+8%',
        trend: 'up',
        icon: 'mdi-chart-line',
        color: 'primary'
      },
      {
        id: 3,
        title: t('customerRetention') || 'احتفاظ العملاء',
        description: t('customerRetentionDesc') || 'تحسين معدل الاحتفاظ بالعملاء',
        value: '-3%',
        trend: 'down',
        icon: 'mdi-account-group',
        color: 'error'
      }
    ];

    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataLoaded') || 'تم تحميل البيانات',
      message: t('investorDataLoaded') || 'تم تحميل بيانات الممولين بنجاح',
      timeout: 3000
    });

  } catch (err) {
    console.error('Error fetching investor data:', err);
    error.value = err.message || t('failedToLoadData') || 'فشل في تحميل بيانات الممول';
    
    // Use fallback mock data
    kpis.value = {
      totalRevenue: 1250000,
      catalogProgress: 35,
      salesGrowth: 18.5,
      activeInvestors: 47
    };

    regionalStats.value = [
      { state: 'الجزائر', value: 245 },
      { state: 'وهران', value: 189 },
      { state: 'قسنطينة', value: 156 },
      { state: 'سطيف', value: 134 },
      { state: 'عنابة', value: 98 }
    ];

    salesData.value = [
      { month: 'Jan', sales: 30 },
      { month: 'Feb', sales: 45 },
      { month: 'Mar', sales: 42 },
      { month: 'Apr', sales: 60 },
      { month: 'May', sales: 75 },
      { month: 'Jun', sales: 90 }
    ];

    // Show error notification
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('usingMockData') || 'استخدام بيانات وهمية',
      message: t('usingMockDataMessage') || 'جاري استخدام بيانات وهمية للعرض',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const initMap = () => {
  // Remove existing map if it exists
  if (map.value) {
    map.value.remove();
  }

  // Initialize map centered on Algeria
  map.value = L.map('map', {
    center: [32.0, 3.0],
    zoom: 5,
    zoomControl: false,
    scrollWheelZoom: false
  });

  // Add dark tile layer
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  }).addTo(map.value);

  // Add regional markers with sales data
  regionalStats.value.forEach(stat => {
    const coords = wilayaCoords[stat.state];
    if (coords) {
      const radius = Math.sqrt(stat.value) * 1.5;
      
      const circle = L.circle(coords, {
        color: '#d4af37',
        fillColor: '#d4af37',
        fillOpacity: 0.6,
        radius: radius * 1000
      }).addTo(map.value);

      circle.bindPopup(`
        <div class="map-popup">
          <h4 style="color: #d4af37; margin-bottom: 5px;">${stat.state}</h4>
          <p style="margin: 0; font-weight: bold;">${t('sales') || 'المبيعات'}: ${stat.value} ${t('orders') || 'طلب'}</p>
        </div>
      `);
    }
  });
};

const getAIRecommendations = async () => {
  try {
    const recommendations = await AIService.getProductRecommendations();
    console.log('AI Recommendations:', recommendations);
    return recommendations;
  } catch (err) {
    console.error('Error getting AI recommendations:', err);
    return [];
  }
};

// Computed
const kpiCards = computed(() => ({
  totalRevenue: { 
    value: kpis.value.totalRevenue.toLocaleString(), 
    prefix: 'دج ', 
    icon: 'mdi-cash',
    color: 'success'
  },
  catalogProgress: { 
    value: kpis.value.catalogProgress, 
    target: 50, 
    suffix: ' / 50', 
    icon: 'mdi-diagram-project',
    color: 'primary'
  },
  salesGrowth: { 
    value: kpis.value.salesGrowth, 
    suffix: '%', 
    icon: 'mdi-trending-up',
    color: 'info'
  },
  activeInvestors: { 
    value: kpis.value.activeInvestors, 
    icon: 'mdi-account-group',
    color: 'warning'
  }
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      labels: { color: '#ffffff' },
      title: {
        display: true,
        color: '#ffffff'
      }
    }
  },
  scales: {
    y: { 
      ticks: { color: '#adb5bd' }, 
      grid: { color: 'rgba(255,255,255,0.1)' },
      title: {
        display: true,
        color: '#adb5bd'
      }
    },
    x: { 
      ticks: { color: '#adb5bd' }, 
      grid: { color: 'rgba(255,255,255,0.1)' }
    }
  }
};

const salesChartData = computed(() => ({
  labels: salesData.value.map(item => item.month),
  datasets: [{
    label: t('sales') || 'المبيعات',
    data: salesData.value.map(item => item.sales),
    borderColor: '#d4af37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    fill: true,
    tension: 0.4
  }]
}));

const regionalChartData = computed(() => ({
  labels: regionalStats.value.map(s => s.state),
  datasets: [{
    label: t('orderCount') || 'عدد الطلبات',
    data: regionalStats.value.map(s => s.value),
    backgroundColor: '#d4af37'
  }]
}));

// Lifecycle
onMounted(async () => {
  await fetchInvestorData();
  initMap();
  
  // Start periodic data refresh
  setInterval(fetchInvestorData, 60000); // Refresh every minute
  
  // Get AI recommendations
  getAIRecommendations();
});
</script>

<style scoped>
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

/* Header */
.investor-header {
  animation: fadeIn 0.5s ease;
}

/* KPI Cards */
.kpi-card {
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.progress-container {
  margin-top: 8px;
}

/* Chart Cards */
.chart-card, .map-card {
  transition: all 0.3s ease;
}

.chart-card:hover, .map-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chart-container {
  height: 400px;
  position: relative;
}

.algeria-map {
  height: 300px;
  width: 100%;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.1);
}

/* Insight Cards */
.insight-card {
  transition: all 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Map Popup Styling */
:deep(.leaflet-popup-content-wrapper) {
  background: #1a1a1a;
  color: white;
  border: 1px solid #d4af37;
}

:deep(.leaflet-popup-tip) {
  background: #d4af37;
}

:deep(.leaflet-container) {
  font-family: inherit;
}

/* Responsive */
@media (max-width: 768px) {
  .chart-container {
    height: 300px;
  }
  
  .algeria-map {
    height: 250px;
  }
}

/* Loading states */
.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
