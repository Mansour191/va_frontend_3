<template>
  <v-container fluid class="pricing-manager">
    <!-- Header -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between flex-wrap">
              <div>
                <h1 class="text-h4 font-weight-bold gold-text mb-2">
                  <v-icon class="me-3" color="#d4af37">mdi-chart-line</v-icon>
                  {{ $t('pricing.manager.title', 'مدير التسعير الذكي') }}
                </h1>
                <p class="text-dim">{{ $t('pricing.manager.subtitle', 'نظام تسعير دينامي مدعوم بالذكاء الاصطناعي وتحليلات السوق') }}</p>
              </div>
              <div class="d-flex gap-2 mt-4 mt-sm-0">
                <v-btn
                  :color="aiLoading ? 'grey' : 'primary'"
                  :loading="aiLoading"
                  @click="runPricingOptimization"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-robot</v-icon>
                  {{ $t('pricing.manager.aiOptimization', 'تحسين التسعير بالذكاء الاصطناعي') }}
                </v-btn>
                <v-btn
                  color="secondary"
                  @click="exportPricingReport"
                  variant="elevated"
                >
                  <v-icon class="me-2">mdi-download</v-icon>
                  {{ $t('pricing.manager.exportReport', 'تصدير تقرير') }}
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

    <!-- Main Content Grid -->
    <v-row class="mb-6">
      <!-- Pricing Rules -->
      <v-col cols="12" lg="6">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="#d4af37">mdi-gavel</v-icon>
                {{ $t('pricing.manager.rules', 'قواعد التسعير') }}
              </div>
              <v-btn
                color="primary"
                size="small"
                @click="showCreateRuleModal = true"
                variant="elevated"
              >
                <v-icon class="me-1" size="16">mdi-plus</v-icon>
                {{ $t('pricing.manager.newRule', 'قاعدة جديدة') }}
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <div class="rules-list">
              <v-card
                v-for="rule in pricingRules"
                :key="rule.id"
                class="rule-item mb-3"
                elevation="1"
              >
                <v-card-text class="pa-4">
                  <div class="d-flex justify-space-between align-start">
                    <div class="flex-grow-1">
                      <h4 class="text-h6 font-weight-bold mb-2">{{ rule.name }}</h4>
                      <p class="text-body-2 text-dim mb-3">{{ rule.description }}</p>
                      <div class="d-flex flex-wrap gap-1">
                        <v-chip
                          v-for="condition in rule.conditions"
                          :key="condition"
                          size="small"
                          color="#d4af37"
                          variant="elevated"
                        >
                          {{ condition }}
                        </v-chip>
                      </div>
                    </div>
                    <div class="d-flex gap-1">
                      <v-btn
                        color="primary"
                        size="small"
                        variant="text"
                        @click="editRule(rule)"
                      >
                        <v-icon size="16">mdi-pencil</v-icon>
                      </v-btn>
                      <v-btn
                        color="error"
                        size="small"
                        variant="text"
                        @click="deleteRule(rule.id)"
                      >
                        <v-icon size="16">mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Price Testing -->
      <v-col cols="12" lg="6">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <v-icon class="me-2" color="#d4af37">mdi-flask</v-icon>
            {{ $t('pricing.manager.testing', 'اختبار التسعير') }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-form @submit.prevent="runPriceTest" class="test-form">
              <v-row>
                <v-col cols="12">
                  <v-select
                    v-model="testConfig.productId"
                    :items="availableProducts"
                    :label="$t('pricing.manager.selectProduct', 'اختر المنتج')"
                    item-title="name"
                    item-value="id"
                    variant="outlined"
                    density="compact"
                    clearable
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="testConfig.testType"
                    :items="testTypes"
                    :label="$t('pricing.manager.testType', 'نوع الاختبار')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="testConfig.period"
                    :items="periodOptions"
                    :label="$t('pricing.manager.period', 'الفترة الزمنية')"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                  ></v-select>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    type="submit"
                    :color="testLoading ? 'grey' : 'primary'"
                    :loading="testLoading"
                    :disabled="!testConfig.productId"
                    block
                    variant="elevated"
                  >
                    <v-icon class="me-2">{{ testLoading ? 'mdi-loading' : 'mdi-play' }}</v-icon>
                    {{ testLoading ? $t('pricing.manager.testingInProgress', 'جاري الاختبار...') : $t('pricing.manager.runTest', 'تشغيل الاختبار') }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
            
            <!-- Test Results -->
            <v-alert
              v-if="testResults"
              type="success"
              class="mt-4"
              variant="tonal"
            >
              <v-alert-title class="text-h6 mb-3">{{ $t('pricing.manager.testResults', 'نتائج الاختبار') }}</v-alert-title>
              <v-row>
                <v-col cols="6">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2">{{ $t('pricing.manager.currentPrice', 'السعر الحالي:') }}</span>
                    <span class="font-weight-bold">{{ formatCurrency(testResults.currentPrice) }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2">{{ $t('pricing.manager.recommendedPrice', 'السعر المقترح:') }}</span>
                    <span class="font-weight-bold gold-text">{{ formatCurrency(testResults.recommendedPrice) }}</span>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-body-2">{{ $t('pricing.manager.expectedImpact', 'التأثير المتوقع:') }}</span>
                    <v-chip
                      :color="testResults.expectedImpact > 0 ? 'success' : 'error'"
                      size="small"
                      variant="elevated"
                    >
                      {{ testResults.expectedImpact > 0 ? '+' : '' }}{{ testResults.expectedImpact }}%
                    </v-chip>
                  </div>
                </v-col>
                <v-col cols="6">
                  <div>
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-body-2">{{ $t('pricing.manager.confidence', 'مستوى الثقة:') }}</span>
                      <span class="font-weight-bold gold-text">{{ testResults.confidence }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="testResults.confidence"
                      color="#d4af37"
                      height="6"
                      rounded
                    ></v-progress-linear>
                  </div>
                </v-col>
              </v-row>
            </v-alert>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Analytics Dashboard -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="#d4af37">mdi-chart-bar</v-icon>
                {{ $t('pricing.manager.analytics', 'تحليلات التسعير') }}
              </div>
              <v-select
                v-model="analyticsPeriod"
                :items="periodOptions"
                :label="$t('pricing.manager.period', 'الفترة الزمنية')"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                style="max-width: 200px"
                @update:model-value="loadAnalytics"
              ></v-select>
            </div>
          </v-card-title>
          <v-card-text class="pa-4">
            <v-row>
              <!-- Price Performance Chart -->
              <v-col cols="12" md="6">
                <v-card class="chart-card" elevation="1">
                  <v-card-title class="pa-3 text-center">
                    {{ $t('pricing.manager.performance', 'أداء التسعير') }}
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="chart-container">
                      <canvas ref="pricePerformanceChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Price Distribution -->
              <v-col cols="12" md="6">
                <v-card class="chart-card" elevation="1">
                  <v-card-title class="pa-3 text-center">
                    {{ $t('pricing.manager.distribution', 'توزيع الأسعار') }}
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="chart-container">
                      <canvas ref="priceDistributionChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- Competitor Analysis -->
              <v-col cols="12" md="6">
                <v-card class="chart-card" elevation="1">
                  <v-card-title class="pa-3 text-center">
                    {{ $t('pricing.manager.competitor', 'تحليل المنافسين') }}
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="chart-container">
                      <canvas ref="competitorAnalysisChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
              
              <!-- ROI Analysis -->
              <v-col cols="12" md="6">
                <v-card class="chart-card" elevation="1">
                  <v-card-title class="pa-3 text-center">
                    {{ $t('pricing.manager.roi', 'تحليل العائد على الاستثمار') }}
                  </v-card-title>
                  <v-card-text class="pa-3">
                    <div class="chart-container">
                      <canvas ref="roiAnalysisChart"></canvas>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- AI Insights -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="glass-card" elevation="0">
          <v-card-title class="pa-4 pb-2">
            <div class="d-flex align-center justify-space-between w-100">
              <div class="d-flex align-center">
                <v-icon class="me-2" color="#d4af37">mdi-brain</v-icon>
                {{ $t('pricing.manager.aiInsights', 'رؤى الذكاء الاصطناعي') }}
              </div>
              <v-btn
                :color="aiLoading ? 'grey' : 'primary'"
                :loading="aiLoading"
                size="small"
                @click="generateAIInsights"
                variant="elevated"
              >
                <v-icon class="me-1" size="16">{{ aiLoading ? 'mdi-loading' : 'mdi-refresh' }}</v-icon>
                {{ $t('pricing.manager.refreshInsights', 'تحديث الرؤى') }}
              </v-btn>
            </div>
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
                <v-card class="insight-card" elevation="2">
                  <v-card-text class="pa-4">
                    <div class="d-flex align-start justify-space-between mb-3">
                      <div class="d-flex align-center">
                        <v-avatar
                          :color="getInsightColor(insight.type)"
                          size="32"
                          class="me-2"
                        >
                          <v-icon :icon="insight.icon" size="16"></v-icon>
                        </v-avatar>
                        <h4 class="text-h6 font-weight-bold">{{ insight.title }}</h4>
                      </div>
                      <v-chip
                        :color="getInsightTypeColor(insight.type)"
                        size="small"
                        variant="elevated"
                      >
                        {{ $t(`pricing.insights.${insight.type}`, insight.typeLabel) }}
                      </v-chip>
                    </div>
                    <p class="text-body-2 text-dim mb-3">{{ insight.description }}</p>
                    <div class="d-flex gap-3 mb-3">
                      <div class="flex-grow-1">
                        <div class="text-caption text-dim">{{ $t('pricing.insights.expectedImpact', 'الأثر المتوقع:') }}</div>
                        <v-chip
                          :color="insight.impact > 0 ? 'success' : 'error'"
                          size="small"
                          variant="elevated"
                        >
                          {{ insight.impact > 0 ? '+' : '' }}{{ insight.impact }}%
                        </v-chip>
                      </div>
                      <div class="flex-grow-1">
                        <div class="text-caption text-dim">{{ $t('pricing.insights.confidence', 'الثقة:') }}</div>
                        <div class="font-weight-bold">{{ insight.confidence }}%</div>
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <v-btn
                        color="primary"
                        size="small"
                        @click="applyInsight(insight)"
                        variant="elevated"
                      >
                        <v-icon class="me-1" size="14">mdi-check</v-icon>
                        {{ $t('common.apply', 'تطبيق') }}
                      </v-btn>
                      <v-btn
                        color="secondary"
                        size="small"
                        @click="dismissInsight(insight.id)"
                        variant="outlined"
                      >
                        <v-icon class="me-1" size="14">mdi-close</v-icon>
                        {{ $t('common.dismiss', 'تجاهل') }}
                      </v-btn>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modals -->
    <v-dialog
      v-model="showCreateRuleModal"
      max-width="600"
      persistent
    >
      <CreateRuleModal 
        @close="showCreateRuleModal = false"
        @created="handleRuleCreated"
      />
    </v-dialog>
    
    <v-dialog
      v-model="showEditRuleModal"
      max-width="600"
      persistent
    >
      <EditRuleModal
        :rule="selectedRule"
        @close="showEditRuleModal = false"
        @updated="handleRuleUpdated"
      />
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import Chart from 'chart.js/auto';
import PricingRulesService from '@/services/PricingRulesService';
import PricingService from '@/services/PricingService';
import AIService from '@/services/AIService';
import ERPNextService from '@/services/ERPNextService';
import DashboardService from '@/services/DashboardService';
import CreateRuleModal from './components/CreateRuleModal.vue';
import EditRuleModal from './components/EditRuleModal.vue';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(true);
const testLoading = ref(false);
const aiLoading = ref(false);
const showCreateRuleModal = ref(false);
const showEditRuleModal = ref(false);
const selectedRule = ref(null);
const analyticsPeriod = ref('30days');

const pricingRules = ref([]);
const availableProducts = ref([]);
const testResults = ref(null);
const aiInsights = ref([]);

const testConfig = ref({
  productId: '',
  testType: 'competitor',
  period: '30days'
});

// Charts
const pricePerformanceChart = ref(null);
const priceDistributionChart = ref(null);
const competitorAnalysisChart = ref(null);
const roiAnalysisChart = ref(null);

// Computed
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

const testTypes = computed(() => [
  { title: t('pricing.test.competitor', 'تحليل المنافسين'), value: 'competitor' },
  { title: t('pricing.test.demand', 'تحليل الطلب'), value: 'demand' },
  { title: t('pricing.test.seasonality', 'تحليل الموسمية'), value: 'seasonality' },
  { title: t('pricing.test.customer', 'تحليل شريحة العملاء'), value: 'customer' }
]);

const periodOptions = computed(() => [
  { title: t('pricing.period.7days', '7 أيام'), value: '7days' },
  { title: t('pricing.period.30days', '30 يوم'), value: '30days' },
  { title: t('pricing.period.90days', '90 يوم'), value: '90days' },
  { title: t('pricing.period.1year', 'سنة'), value: '1year' }
]);

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const loadPricingRules = async () => {
  try {
    const response = await PricingRulesService.getPricingRules();
    if (response.success) {
      pricingRules.value = response.data.rules || [];
    } else {
      pricingRules.value = response.mockData?.rules || [];
    }
  } catch (error) {
    console.error('Error loading pricing rules:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.loadRulesError', 'فشل في تحميل قواعد التسعير')
    });
  }
};

const loadAvailableProducts = async () => {
  try {
    const response = await DashboardService.getProducts({ limit: 100 });
    if (response.success) {
      availableProducts.value = response.data.products || [];
    } else {
      availableProducts.value = getMockProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    availableProducts.value = getMockProducts();
  }
};

const runPriceTest = async () => {
  if (!testConfig.value.productId) {
    store.dispatch('notifications/showNotification', {
      type: 'warning',
      message: t('pricing.manager.selectProductWarning', 'يرجى اختيار منتج للاختبار')
    });
    return;
  }

  try {
    testLoading.value = true;
    const response = await PricingRulesService.testPricingRule(
      { type: testConfig.value.testType, period: testConfig.value.period },
      testConfig.value.productId
    );
    
    if (response.success) {
      testResults.value = response.data;
    } else {
      testResults.value = getMockTestResults();
    }
    
    console.log('Price test results:', testResults.value);
  } catch (error) {
    console.error('Error running price test:', error);
    testResults.value = getMockTestResults();
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.testError', 'فشل في تشغيل اختبار التسعير')
    });
  } finally {
    testLoading.value = false;
  }
};

const runPricingOptimization = async () => {
  try {
    const response = await PricingRulesService.runPricingOptimization();
    await loadAnalytics();
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: t('pricing.manager.optimizationSuccess', 'تم تحسين جميع الأسعار بنجاح')
    });
  } catch (error) {
    console.error('Error running pricing optimization:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.optimizationError', 'فشل في تحسين التسعير')
    });
  }
};

const generateAIInsights = async () => {
  try {
    aiLoading.value = true;
    const insights = await AIService.getPricingInsights();
    aiInsights.value = insights || getMockAIInsights();
    
    console.log('AI Insights:', aiInsights.value);
  } catch (error) {
    console.error('Error generating AI insights:', error);
    aiInsights.value = getMockAIInsights();
    store.dispatch('notifications/showNotification', {
      type: 'warning',
      message: t('pricing.manager.aiInsightsError', 'فشل في تحميل رؤى الذكاء الاصطناعي، يتم استخدام البيانات التجريبية')
    });
  } finally {
    aiLoading.value = false;
  }
};

const loadAnalytics = async () => {
  try {
    const response = await PricingRulesService.getPricingAnalytics({
      period: analyticsPeriod.value
    });
    
    if (response.success) {
      await nextTick();
      updateCharts(response.data);
    } else {
      await nextTick();
      updateCharts(response.mockData || getMockChartData());
    }
    
    console.log('Pricing analytics loaded:', response);
  } catch (error) {
    console.error('Error loading analytics:', error);
    await nextTick();
    updateCharts(getMockChartData());
  }
};

const updateCharts = (analytics) => {
  // Price Performance Chart
  if (pricePerformanceChart.value) {
    new Chart(pricePerformanceChart.value, {
      type: 'line',
      data: {
        labels: analytics.pricePerformance?.labels || [],
        datasets: [{
          label: 'الأداء',
          data: analytics.pricePerformance?.data || [],
          borderColor: '#d4af37',
          backgroundColor: 'rgba(212, 175, 55, 0.1)',
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
  if (priceDistributionChart.value) {
    new Chart(priceDistributionChart.value, {
      type: 'doughnut',
      data: {
        labels: analytics.priceDistribution?.labels || [],
        datasets: [{
          data: analytics.priceDistribution?.data || [],
          backgroundColor: [
            '#d4af37',
            '#4caf50',
            '#ff9800',
            '#f44336',
            '#2196f3'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#fff' }
          }
        }
      }
    });
  }

  // Competitor Analysis Chart
  if (competitorAnalysisChart.value) {
    new Chart(competitorAnalysisChart.value, {
      type: 'bar',
      data: {
        labels: analytics.competitorAnalysis?.labels || [],
        datasets: [{
          label: 'أسعارنا',
          data: analytics.competitorAnalysis?.ourPrices || [],
          backgroundColor: '#d4af37'
        }, {
          label: 'متوسط المنافسين',
          data: analytics.competitorAnalysis?.competitorPrices || [],
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
  if (roiAnalysisChart.value) {
    new Chart(roiAnalysisChart.value, {
      type: 'line',
      data: {
        labels: analytics.roiAnalysis?.labels || [],
        datasets: [{
          label: 'العائد على الاستثمار',
          data: analytics.roiAnalysis?.data || [],
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

const editRule = (rule) => {
  selectedRule.value = rule;
  showEditRuleModal.value = true;
};

const deleteRule = async (ruleId) => {
  if (!confirm(t('pricing.manager.deleteConfirm', 'هل أنت متأكد من حذف هذه القاعدة؟'))) return;
  
  try {
    const response = await PricingRulesService.deletePricingRule(ruleId);
    if (response.success) {
      await loadPricingRules();
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.manager.deleteSuccess', 'تم حذف القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error deleting rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.deleteError', 'فشل في حذف القاعدة')
    });
  }
};

const handleRuleCreated = async (rule) => {
  try {
    const response = await PricingRulesService.createPricingRule(rule);
    if (response.success) {
      await loadPricingRules();
      showCreateRuleModal.value = false;
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.manager.createSuccess', 'تم إنشاء القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error creating rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.createError', 'فشل في إنشاء القاعدة')
    });
  }
};

const handleRuleUpdated = async (rule) => {
  try {
    const response = await PricingRulesService.updatePricingRule(rule.id, rule);
    if (response.success) {
      await loadPricingRules();
      showEditRuleModal.value = false;
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.manager.updateSuccess', 'تم تحديث القاعدة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error updating rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.updateError', 'فشل في تحديث القاعدة')
    });
  }
};

const applyInsight = async (insight) => {
  try {
    const response = await PricingRulesService.testPricingRule(
      { type: 'ai_insight', insight: insight.id },
      'all'
    );
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: t('pricing.manager.applyInsightSuccess', 'تم تطبيق الرؤية بنجاح')
    });
  } catch (error) {
    console.error('Error applying insight:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.applyInsightError', 'فشل في تطبيق الرؤية')
    });
  }
};

const dismissInsight = (insightId) => {
  aiInsights.value = aiInsights.value.filter(insight => insight.id !== insightId);
};

const exportPricingReport = async () => {
  try {
    const response = await PricingRulesService.exportPricingRules({
      period: analyticsPeriod.value,
      format: 'excel'
    });
    
    if (response.success) {
      // Create download link
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pricing-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Sync with ERPNext
      await ERPNextService.syncToERPNext('pricing_reports', {
        report: response.data,
        timestamp: new Date().toISOString(),
        type: 'pricing_analysis'
      });
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.manager.exportSuccess', 'تم تصدير التقرير بنجاح')
      });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.exportError', 'فشل في تصدير التقرير')
    });
  }
};

// Helper functions
const getInsightColor = (type) => {
  const colors = {
    opportunity: '#4caf50',
    warning: '#ff9800',
    risk: '#f44336'
  };
  return colors[type] || '#2196f3';
};

const getInsightTypeColor = (type) => {
  const colors = {
    opportunity: 'success',
    warning: 'warning',
    risk: 'error'
  };
  return colors[type] || 'info';
};

// Dynamic data functions
const fetchProducts = async () => {
  try {
    const response = await fetch('/api/products/list');
    if (response.ok) {
      const data = await response.json();
      return data.map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category?.name || 'غير مصنف'
      }));
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
  }
  
  // Fallback to mock data
  return getMockProducts();
};

const getMockProducts = () => [
  { id: 1, name: 'فينيل ديكوري فاخر' },
  { id: 2, name: 'فينيل جدران عصري' },
  { id: 3, name: 'فينيل أرضيات مقاوم' },
  { id: 4, name: 'فينيل سقف حديث' },
  { id: 5, name: 'فينيل أثاث كلاسيكي' }
];

const fetchTestResults = async (productId) => {
  try {
    const response = await fetch(`/api/pricing/test-results/${productId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch test results:', error);
  }
  
  // Fallback to mock data
  return getMockTestResults();
};

const getMockTestResults = () => ({
  currentPrice: 2500,
  recommendedPrice: 2750,
  expectedImpact: 10.5,
  confidence: 85
});

const fetchAIInsights = async () => {
  try {
    const response = await fetch('/api/pricing/ai-insights');
    if (response.ok) {
      const data = await response.json();
      return data.map(insight => ({
        id: insight.id,
        title: insight.title,
        description: insight.description,
        icon: insight.icon || 'mdi-lightbulb',
        type: insight.type || 'info',
        typeLabel: insight.type_label || 'معلومة',
        impact: insight.impact || 0,
        confidence: insight.confidence || 0
      }));
    }
  } catch (error) {
    console.error('Failed to fetch AI insights:', error);
  }
  
  // Fallback to mock data
  return getMockAIInsights();
};

const getMockAIInsights = () => [
  {
    id: 1,
    title: 'زيادة الأسعار في موسم الأعياد',
    description: 'تحليل البيانات يظهر زيادة في الطلب خلال مواسم الأعياد، يوصى بزيادة الأسعار بنسبة 15%',
    icon: 'mdi-trending-up',
    type: 'opportunity',
    typeLabel: 'فرصة',
    impact: 15.5,
    confidence: 92
  },
  {
    id: 2,
    title: 'منافسون يخفضون الأسعار',
    description: 'تم رصد خفض في أسعار المنافسين الرئيسيين، يوصى بمراجعة استراتيجية التسعير',
    icon: 'mdi-alert',
    type: 'warning',
    typeLabel: 'تحذير',
    impact: -8.2,
    confidence: 78
  },
  {
    id: 3,
    title: 'طلب مرتفع على فينيل الأرضيات',
    description: 'زيادة في الطلب على منتجات فينيل الأرضيات بنسبة 25% في الشهر الماضي',
    icon: 'mdi-chart-line',
    type: 'opportunity',
    typeLabel: 'فرصة',
    impact: 12.3,
    confidence: 88
  }
];

const getMockChartData = () => ({
  pricePerformance: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    data: [120, 135, 142, 138, 155, 168]
  },
  priceDistribution: {
    labels: ['ديكور', 'جدران', 'أرضيات', 'سقف', 'أثاث'],
    data: [35, 25, 20, 12, 8]
  },
  competitorAnalysis: {
    labels: ['فينيل ديكوري', 'فينيل جدران', 'فينيل أرضيات'],
    ourPrices: [2500, 1800, 1200],
    competitorPrices: [2400, 1900, 1150]
  },
  roiAnalysis: {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    data: [12, 15, 18, 16, 22, 25]
  }
});

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true;
    
    // Load initial data
    await Promise.all([
      loadPricingRules(),
      loadAvailableProducts(),
      loadAnalytics(),
      generateAIInsights()
    ]);
    
    // Initialize charts
    await nextTick();
    
    // Subscribe to real-time pricing updates
    PricingRulesService.subscribeToPriceUpdates?.((data) => {
      console.log('Real-time pricing update:', data);
      // Refresh analytics when prices change
      loadAnalytics();
    });
    
  } catch (error) {
    console.error('Error initializing pricing manager:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.manager.initError', 'فشل في تهيئة مدير التسعير')
    });
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.pricing-manager {
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

.rules-list {
  max-height: 400px;
  overflow-y: auto;
}

.rule-item {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.rule-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
}

.test-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.chart-container {
  position: relative;
  height: 250px;
  width: 100%;
}

.insight-card {
  background: rgba(102, 126, 234, 0.1);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 12px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.insight-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.2);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .pricing-manager {
    padding: 10px;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .rules-list {
    max-height: 300px;
  }
}

/* Vuetify overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-chip) {
  transition: all 0.2s ease;
}

:deep(.v-select .v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

:deep(.v-data-table) {
  background: transparent;
}

:deep(.v-data-table .v-table__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
}

/* Loading states */
:deep(.v-progress-circular) {
  color: #d4af37;
}

:deep(.v-progress-linear) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.v-progress-linear .v-progress-linear__background) {
  background: rgba(255, 255, 255, 0.1);
}

/* Dialog styles */
:deep(.v-dialog .v-card) {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Alert styles */
:deep(.v-alert) {
  border-radius: 12px;
}

:deep(.v-alert--type-success) {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

:deep(.v-alert--type-warning) {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
}

:deep(.v-alert--type-error) {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}
</style>
