<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 forecast-details-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-chart-line-variant</v-icon>
              {{ $t('forecastDetails') || 'تفاصيل التوقعات' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('forecastDetailsSubtitle') || 'مقارنة بين التوقعات والطلب الفعلي للمنتجات' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-select
              v-model="selectedProductId"
              :items="productOptions"
              :label="$t('selectProduct') || 'اختر المنتج'"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              style="min-width: 250px;"
              @update:model-value="loadProductForecasts"
            />
            <v-btn
              @click="refreshData"
              :disabled="loading"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ loading ? ($t('refreshing') || 'جاري التحديث...') : ($t('refresh') || 'تحديث') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="48"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis">{{ $t('loadingForecastData') || 'جاري تحميل بيانات التوقعات...' }}</p>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" variant="outlined" class="text-center pa-6">
      <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">{{ $t('error') || 'خطأ' }}</h3>
      <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
      <v-btn color="primary" variant="elevated" @click="loadProductForecasts">
        {{ $t('retry') || 'إعادة المحاولة' }}
      </v-btn>
    </v-card>

    <!-- No Data State -->
    <v-card v-else-if="!forecasts.length && selectedProductId" variant="outlined" class="text-center pa-6">
      <v-icon size="64" color="warning" class="mb-4">mdi-chart-line</v-icon>
      <h3 class="text-h6 font-weight-medium mb-2">{{ $t('noForecastData') || 'لا توجد بيانات توقعات' }}</h3>
      <p class="text-body-2 text-medium-emphasis">{{ $t('noForecastDataMessage') || 'لم يتم العثور على بيانات توقعات لهذا المنتج' }}</p>
    </v-card>

    <!-- Forecast Data -->
    <div v-else-if="forecasts.length">
      <!-- Summary Cards -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in summaryStats"
          :key="stat.key"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="stat-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between">
                <div class="stat-content">
                  <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
                  <p class="text-caption text-medium-emphasis mb-0">{{ stat.label }}</p>
                </div>
                <v-avatar
                  :color="stat.color"
                  variant="tonal"
                  size="50"
                  class="stat-icon"
                >
                  <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
                </v-avatar>
              </div>
              <div class="stat-trend mt-2" :class="{ 'text-success': stat.trend > 0, 'text-error': stat.trend < 0 }">
                <v-icon :color="stat.trend > 0 ? 'success' : 'error'" size="16">
                  {{ stat.trend > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down' }}
                </v-icon>
                <span class="text-caption font-weight-medium">{{ Math.abs(stat.trend) }}%</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Comparison Chart -->
      <v-card variant="elevated" class="mb-6">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-chart-line</v-icon>
            {{ $t('predictedVsActual') || 'التوقعات مقابل الفعلي' }}
          </h3>
          <v-spacer />
          <div class="d-flex ga-2">
            <div class="d-flex align-center ga-1">
              <div class="color-dot predicted"></div>
              <span class="text-caption">{{ $t('predictedDemand') || 'الطلب المتوقع' }}</span>
            </div>
            <div class="d-flex align-center ga-1">
              <div class="color-dot actual"></div>
              <span class="text-caption">{{ $t('actualDemand') || 'الطلب الفعلي' }}</span>
            </div>
          </div>
        </v-card-title>
        <v-card-text class="pa-4">
          <div class="chart-container">
            <canvas ref="comparisonChart"></canvas>
          </div>
        </v-card-text>
      </v-card>

      <!-- Accuracy Analysis -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <v-card variant="elevated">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="info">mdi-bullseye</v-icon>
                {{ $t('accuracyAnalysis') || 'تحليل الدقة' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="accuracy-metrics">
                <div class="metric-item mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-body-2">{{ $t('overallAccuracy') || 'الدقة الإجمالية' }}</span>
                    <span class="text-h6 font-weight-bold text-primary">{{ overallAccuracy }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="overallAccuracy"
                    color="primary"
                    height="8"
                    rounded
                  />
                </div>
                
                <div class="metric-item mb-4">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-body-2">{{ $t('averageErrorMargin') || 'متوسط هامش الخطأ' }}</span>
                    <span class="text-h6 font-weight-bold" :class="errorMarginColor">{{ averageErrorMargin }}%</span>
                  </div>
                  <v-progress-linear
                    :model-value="averageErrorMargin"
                    :color="errorMarginColor === 'text-success' ? 'success' : errorMarginColor === 'text-warning' ? 'warning' : 'error'"
                    height="8"
                    rounded
                  />
                </div>

                <div class="metric-item">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-body-2">{{ $t('forecastCount') || 'عدد التوقعات' }}</span>
                    <span class="text-h6 font-weight-bold text-info">{{ forecasts.length }}</span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card variant="elevated">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="warning">mdi-cog</v-icon>
                {{ $t('algorithmPerformance') || 'أداء الخوارزميات' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div v-if="algorithmPerformance.length">
                <div
                  v-for="algo in algorithmPerformance"
                  :key="algo.algorithm"
                  class="algo-item mb-3 pa-3 rounded-lg"
                  style="background: rgba(255, 255, 255, 0.05);"
                >
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-body-2 font-weight-medium">{{ algo.algorithm }}</span>
                    <v-chip
                      :color="algo.accuracy >= 90 ? 'success' : algo.accuracy >= 75 ? 'warning' : 'error'"
                      variant="tonal"
                      size="small"
                    >
                      {{ algo.accuracy }}%
                    </v-chip>
                  </div>
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-medium-emphasis">{{ $t('forecasts') || 'توقعات' }}: {{ algo.count }}</span>
                    <span class="text-caption text-medium-emphasis">{{ $t('avgError') || 'متوسط الخطأ' }}: {{ algo.avgError }}%</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center pa-4">
                <v-icon size="48" color="grey" class="mb-2">mdi-information</v-icon>
                <p class="text-body-2 text-medium-emphasis">{{ $t('noAlgorithmData') || 'لا توجد بيانات أداء للخوارزميات' }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Forecasts Table -->
      <v-card variant="elevated">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-table</v-icon>
            {{ $t('forecastHistory') || 'سجل التوقعات' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-data-table
            :headers="tableHeaders"
            :items="forecasts"
            :loading="loading"
            items-per-page="10"
            class="forecast-table"
          >
            <template #[`item.predicted_demand`]="{ item }">
              <span class="text-body-2 font-weight-medium">{{ item.predicted_demand || '-' }}</span>
            </template>
            
            <template #[`item.actual_demand`]="{ item }">
              <span class="text-body-2 font-weight-medium">{{ item.actual_demand || '-' }}</span>
            </template>
            
            <template #[`item.error_margin`]="{ item }">
              <v-chip
                v-if="item.error_margin !== null"
                :color="item.error_margin <= 10 ? 'success' : item.error_margin <= 20 ? 'warning' : 'error'"
                variant="tonal"
                size="small"
              >
                {{ item.error_margin }}%
              </v-chip>
              <span v-else class="text-caption text-medium-emphasis">-</span>
            </template>
            
            <template #[`item.algorithm_used`]="{ item }">
              <v-chip
                v-if="item.algorithm_used"
                color="info"
                variant="tonal"
                size="small"
              >
                {{ item.algorithm_used }}
              </v-chip>
              <span v-else class="text-caption text-medium-emphasis">-</span>
            </template>
            
            <template #[`item.accuracy`]="{ item }">
              <v-chip
                v-if="item.accuracy !== null"
                :color="item.accuracy >= 90 ? 'success' : item.accuracy >= 75 ? 'warning' : 'error'"
                variant="tonal"
                size="small"
              >
                {{ item.accuracy }}%
              </v-chip>
              <span v-else class="text-caption text-medium-emphasis">-</span>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import { GET_PRODUCT_FORECASTS } from '@/shared/services/graphql/queries';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const error = ref(null);
const forecasts = ref([]);
const selectedProductId = ref(null);
const products = ref([]);
const chart = ref(null);
const comparisonChart = ref(null);

// Computed
const productOptions = computed(() => {
  return products.value.map(product => ({
    id: product.id,
    name: product.name_ar || product.name_en || product.name
  }));
});

const summaryStats = computed(() => {
  if (!forecasts.value.length) return [];
  
  const totalPredicted = forecasts.value.reduce((sum, f) => sum + (f.predicted_demand || 0), 0);
  const totalActual = forecasts.value.reduce((sum, f) => sum + (f.actual_demand || 0), 0);
  const avgAccuracy = overallAccuracy.value;
  
  return [
    {
      key: 'predicted',
      label: t('totalPredicted') || 'إجمالي المتوقع',
      value: totalPredicted.toLocaleString(),
      icon: 'mdi-chart-line',
      color: 'primary',
      trend: 0
    },
    {
      key: 'actual',
      label: t('totalActual') || 'إجمالي الفعلي',
      value: totalActual.toLocaleString(),
      icon: 'mdi-check-circle',
      color: 'success',
      trend: 0
    },
    {
      key: 'accuracy',
      label: t('averageAccuracy') || 'متوسط الدقة',
      value: `${avgAccuracy}%`,
      icon: 'mdi-bullseye',
      color: avgAccuracy >= 90 ? 'success' : avgAccuracy >= 75 ? 'warning' : 'error',
      trend: 0
    },
    {
      key: 'forecasts',
      label: t('totalForecasts') || 'إجمالي التوقعات',
      value: forecasts.value.length,
      icon: 'mdi-chart-box',
      color: 'info',
      trend: 0
    }
  ];
});

const overallAccuracy = computed(() => {
  const validForecasts = forecasts.value.filter(f => 
    f.predicted_demand !== null && 
    f.actual_demand !== null && 
    f.predicted_demand > 0
  );
  
  if (!validForecasts.length) return 0;
  
  const totalAccuracy = validForecasts.reduce((sum, f) => {
    const accuracy = 100 - Math.abs((f.actual_demand - f.predicted_demand) / f.predicted_demand * 100);
    return sum + Math.max(0, accuracy);
  }, 0);
  
  return Math.round(totalAccuracy / validForecasts.length);
});

const averageErrorMargin = computed(() => {
  const validForecasts = forecasts.value.filter(f => f.error_margin !== null);
  if (!validForecasts.length) return 0;
  
  const totalError = validForecasts.reduce((sum, f) => sum + f.error_margin, 0);
  return Math.round(totalError / validForecasts.length);
});

const errorMarginColor = computed(() => {
  const margin = averageErrorMargin.value;
  if (margin <= 10) return 'text-success';
  if (margin <= 20) return 'text-warning';
  return 'text-error';
});

const algorithmPerformance = computed(() => {
  const algoMap = {};
  
  forecasts.value.forEach(forecast => {
    if (forecast.algorithm_used && forecast.predicted_demand !== null && forecast.actual_demand !== null) {
      if (!algoMap[forecast.algorithm_used]) {
        algoMap[forecast.algorithm_used] = {
          algorithm: forecast.algorithm_used,
          count: 0,
          totalAccuracy: 0,
          totalError: 0
        };
      }
      
      const algo = algoMap[forecast.algorithm_used];
      algo.count++;
      
      const accuracy = 100 - Math.abs((forecast.actual_demand - forecast.predicted_demand) / forecast.predicted_demand * 100);
      algo.totalAccuracy += Math.max(0, accuracy);
      algo.totalError += forecast.error_margin || 0;
    }
  });
  
  return Object.values(algoMap).map(algo => ({
    algorithm: algo.algorithm,
    count: algo.count,
    accuracy: Math.round(algo.totalAccuracy / algo.count),
    avgError: Math.round(algo.totalError / algo.count)
  })).sort((a, b) => b.accuracy - a.accuracy);
});

const tableHeaders = computed(() => [
  { title: t('period') || 'الفترة', key: 'period', sortable: true },
  { title: t('forecastType') || 'نوع التوقع', key: 'forecast_type', sortable: true },
  { title: t('predictedDemand') || 'الطلب المتوقع', key: 'predicted_demand', sortable: true },
  { title: t('actualDemand') || 'الطلب الفعلي', key: 'actual_demand', sortable: true },
  { title: t('errorMargin') || 'هامش الخطأ', key: 'error_margin', sortable: true },
  { title: t('algorithmUsed') || 'الخوارزمية المستخدمة', key: 'algorithm_used', sortable: true },
  { title: t('accuracy') || 'الدقة', key: 'accuracy', sortable: true },
  { title: t('createdAt') || 'تاريخ الإنشاء', key: 'created_at', sortable: true },
]);

// Methods
const initComparisonChart = () => {
  if (!comparisonChart.value) return;

  if (chart.value) {
    chart.value.destroy();
  }

  const ctx = comparisonChart.value.getContext('2d');
  
  const labels = forecasts.value.map(f => {
    const date = new Date(f.created_at);
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  });
  
  const predictedData = forecasts.value.map(f => f.predicted_demand || 0);
  const actualData = forecasts.value.map(f => f.actual_demand || 0);

  chart.value = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: t('predictedDemand') || 'الطلب المتوقع',
          data: predictedData,
          borderColor: '#2196F3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#2196F3',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
        {
          label: t('actualDemand') || 'الطلب الفعلي',
          data: actualData,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          pointBackgroundColor: '#4CAF50',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#d4af37',
          borderWidth: 1,
          padding: 12,
          callbacks: {
            label: (context) => {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              label += context.raw.toLocaleString();
              return label;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
          },
        },
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: 'rgba(255, 255, 255, 0.7)',
            maxRotation: 45,
            minRotation: 45,
          },
        },
      },
    },
  });
};

const loadProducts = async () => {
  try {
    // Mock products for now - replace with actual GraphQL query
    products.value = [
      { id: 1, name_ar: 'ملصقات جدران ديناميكية', name_en: 'Dynamic Wall Stickers' },
      { id: 2, name_ar: 'ملصقات أبواب عصرية', name_en: 'Modern Door Stickers' },
      { id: 3, name_ar: 'ملصقات أثاث كلاسيكي', name_en: 'Classic Furniture Stickers' },
    ];
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

const loadProductForecasts = async () => {
  if (!selectedProductId.value) return;
  
  loading.value = true;
  error.value = null;
  
  try {
    const result = await store.dispatch('apollo/query', {
      query: GET_PRODUCT_FORECASTS,
      variables: { productId: selectedProductId.value }
    });
    
    if (result?.data?.productForecasts) {
      forecasts.value = result.data.productForecasts.map(forecast => ({
        ...forecast,
        accuracy: forecast.predicted_demand && forecast.actual_demand 
          ? Math.round(Math.max(0, 100 - Math.abs((forecast.actual_demand - forecast.predicted_demand) / forecast.predicted_demand * 100)))
          : null
      }));
      
      await nextTick();
      initComparisonChart();
    } else {
      // Mock data for demonstration
      forecasts.value = [
        {
          id: 1,
          period: '2024-01',
          forecast_type: 'monthly',
          predicted_demand: 150,
          actual_demand: 145,
          error_margin: 3.3,
          algorithm_used: 'Prophet',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          period: '2024-02',
          forecast_type: 'monthly',
          predicted_demand: 180,
          actual_demand: 175,
          error_margin: 2.8,
          algorithm_used: 'ARIMA',
          created_at: '2024-02-01T00:00:00Z'
        },
        {
          id: 3,
          period: '2024-03',
          forecast_type: 'monthly',
          predicted_demand: 200,
          actual_demand: 195,
          error_margin: 2.5,
          algorithm_used: 'Prophet',
          created_at: '2024-03-01T00:00:00Z'
        }
      ];
      
      await nextTick();
      initComparisonChart();
    }
  } catch (error) {
    console.error('Error loading product forecasts:', error);
    error.value = error.message || (t('errorLoadingData') || 'حدث خطأ أثناء تحميل البيانات');
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  loadProductForecasts();
};

// Lifecycle
onMounted(async () => {
  await loadProducts();
  if (products.value.length > 0) {
    selectedProductId.value = products.value[0].id;
    await loadProductForecasts();
  }
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
.forecast-details-header {
  animation: fadeIn 0.5s ease;
}

/* Stats Cards */
.stat-card {
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #1a1a2e, #2d2d44);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  border-color: #d4af37;
}

.stat-icon {
  background: rgba(212, 175, 55, 0.1);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Chart Container */
.chart-container {
  position: relative;
  height: 400px;
  width: 100%;
}

/* Color dots */
.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.color-dot.predicted {
  background: #2196F3;
}

.color-dot.actual {
  background: #4CAF50;
}

/* Accuracy Metrics */
.accuracy-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  padding: 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* Algorithm Items */
.algo-item {
  transition: all 0.3s ease;
}

.algo-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

/* Table */
.forecast-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
  
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
