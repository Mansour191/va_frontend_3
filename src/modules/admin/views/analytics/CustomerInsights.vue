<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 insights-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-account-group</v-icon>
              {{ $t('customerInsights') || 'تحليلات سلوك العملاء' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('customerInsightsSubtitle') || 'تحليل متقدم لسلوك العملاء وتقسيمهم وتوقع قيمتهم' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="refreshAll"
              :disabled="loading"
              variant="elevated"
              color="primary"
              :prepend-icon="loading ? 'mdi-loading' : 'mdi-refresh'"
            >
              {{ loading ? ($t('updating') || 'جاري التحديث...') : ($t('refreshData') || 'تحديث البيانات') }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tabs Navigation -->
    <v-card variant="elevated" class="mb-6">
      <v-tabs
        v-model="activeTab"
        align-tabs="center"
        color="primary"
      >
        <v-tab
          value="overview"
          prepend-icon="mdi-chart-pie"
          @click="loadOverview"
        >
          {{ $t('overview') || 'نظرة عامة' }}
        </v-tab>
        <v-tab
          value="segments"
          prepend-icon="mdi-layer-group"
          @click="loadSegments"
        >
          {{ $t('customerSegments') || 'تقسيم العملاء' }}
        </v-tab>
        <v-tab
          value="churn"
          prepend-icon="mdi-alert-circle"
          @click="loadChurn"
        >
          {{ $t('churnAnalysis') || 'تحليل التسرب' }}
        </v-tab>
        <v-tab
          value="lifetime"
          prepend-icon="mdi-trending-up"
          @click="loadLifetime"
        >
          {{ $t('lifetimeValue') || 'القيمة الدائمة' }}
        </v-tab>
        <v-tab
          value="behavior"
          prepend-icon="mdi-brain"
          @click="loadBehavior"
        >
          {{ $t('behaviorAnalysis') || 'تحليل السلوك' }}
        </v-tab>
      </v-tabs>

      <v-divider />

      <!-- Tab Content -->
      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="mt-4 text-medium-emphasis">{{ $t('loadingInsights') || 'جاري تحميل الرؤى...' }}</p>
        </div>

        <!-- Overview Tab -->
        <div v-else-if="activeTab === 'overview'" class="overview-content">
          <v-row class="mb-6">
            <v-col
              v-for="metric in overviewMetrics"
              :key="metric.title"
              cols="12"
              sm="6"
              md="3"
            >
              <v-card variant="elevated" class="metric-card">
                <v-card-text class="pa-4 text-center">
                  <v-avatar
                    :color="metric.color"
                    variant="tonal"
                    size="50"
                    class="mb-3"
                  >
                    <v-icon :color="metric.color" size="28">{{ metric.icon }}</v-icon>
                  </v-avatar>
                  <h3 class="text-h4 font-weight-bold text-white mb-1">{{ metric.value }}</h3>
                  <p class="text-caption text-medium-emphasis mb-0">{{ metric.title }}</p>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-chart-line</v-icon>
                    {{ $t('customerGrowth') || 'نمو العملاء' }}
                  </h3>
                  <div class="chart-container" style="height: 300px;">
                    <canvas ref="growthChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-chart-pie</v-icon>
                    {{ $t('customerDistribution') || 'توزيع العملاء' }}
                  </h3>
                  <div class="chart-container" style="height: 300px;">
                    <canvas ref="distributionChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        <!-- Segments Tab -->
        <div v-else-if="activeTab === 'segments'" class="segments-content">
          <v-row class="mb-6">
            <v-col cols="12" lg="8">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-account-group-outline</v-icon>
                    {{ $t('customerSegments') || 'تقسيم العملاء' }}
                  </h3>
                  <div class="chart-container" style="height: 400px;">
                    <canvas ref="segmentsChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="4">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-information</v-icon>
                    {{ $t('segmentDetails') || 'تفاصيل الشرائح' }}
                  </h3>
                  <div class="segments-list">
                    <div v-for="segment in customerSegments" :key="segment.name" class="segment-item d-flex align-center justify-space-between mb-3">
                      <div class="d-flex align-center ga-2">
                        <v-avatar :color="segment.color" variant="tonal" size="24">
                          <v-icon size="14">{{ segment.icon }}</v-icon>
                        </v-avatar>
                        <span class="text-body-2">{{ segment.name }}</span>
                      </div>
                      <div class="text-end">
                        <div class="text-body-2 font-weight-medium">{{ segment.percentage }}%</div>
                        <div class="text-caption text-medium-emphasis">{{ segment.count }} {{ $t('customers') || 'عملاء' }}</div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Churn Tab -->
        <div v-else-if="activeTab === 'churn'" class="churn-content">
          <v-row class="mb-6">
            <v-col cols="12">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-alert-circle</v-icon>
                    {{ $t('churnRiskAnalysis') || 'تحليل مخاطر التسرب' }}
                  </h3>
                  <div class="chart-container" style="height: 400px;">
                    <canvas ref="churnChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-alert</v-icon>
                    {{ $t('highRiskCustomers') || 'العملاء ذوي المخاطر العالية' }}
                  </h3>
                  <div class="high-risk-customers">
                    <div v-for="customer in highRiskCustomers" :key="customer.id" class="risk-customer d-flex align-center ga-3 mb-3">
                      <v-avatar variant="tonal" color="error" size="40">
                        <v-icon>mdi-account-alert</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <h4 class="text-body-2 font-weight-medium text-white mb-1">{{ customer.name }}</h4>
                        <p class="text-caption text-medium-emphasis mb-0">{{ customer.email }}</p>
                      </div>
                      <v-chip color="error" variant="tonal" size="small">
                        {{ customer.riskScore }}% {{ $t('risk') || 'مخاطرة' }}
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-trending-down</v-icon>
                    {{ $t('churnTrends') || 'اتجاهات التسرب' }}
                  </h3>
                  <div class="churn-trends">
                    <div class="trend-item d-flex justify-space-between align-center mb-3">
                      <span class="text-caption text-medium-emphasis">{{ $t('monthlyChurnRate') || 'معدل التسرب الشهري' }}</span>
                      <span class="text-body-2 font-weight-medium text-error">{{ churnTrends.monthly }}%</span>
                    </div>
                    <div class="trend-item d-flex justify-space-between align-center mb-3">
                      <span class="text-caption text-medium-emphasis">{{ $t('quarterlyChurnRate') || 'معدل التسرب الربع سنوي' }}</span>
                      <span class="text-body-2 font-weight-medium text-warning">{{ churnTrends.quarterly }}%</span>
                    </div>
                    <div class="trend-item d-flex justify-space-between align-center">
                      <span class="text-caption text-medium-emphasis">{{ $t('annualChurnRate') || 'معدل التسرب السنوي' }}</span>
                      <span class="text-body-2 font-weight-medium text-success">{{ churnTrends.annual }}%</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Lifetime Value Tab -->
        <div v-else-if="activeTab === 'lifetime'" class="lifetime-content">
          <v-row class="mb-6">
            <v-col cols="12">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-trending-up</v-icon>
                    {{ $t('customerLifetimeValue') || 'القيمة الدائمة للعميل' }}
                  </h3>
                  <div class="chart-container" style="height: 400px;">
                    <canvas ref="lifetimeChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-star</v-icon>
                    {{ $t('highValueCustomers') || 'العملاء ذوي القيمة العالية' }}
                  </h3>
                  <div class="high-value-customers">
                    <div v-for="customer in highValueCustomers" :key="customer.id" class="value-customer d-flex align-center ga-3 mb-3">
                      <v-avatar variant="tonal" color="success" size="40">
                        <v-icon>mdi-star</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <h4 class="text-body-2 font-weight-medium text-white mb-1">{{ customer.name }}</h4>
                        <p class="text-caption text-medium-emphasis mb-0">{{ customer.email }}</p>
                      </div>
                      <div class="text-end">
                        <div class="text-body-2 font-weight-medium text-success">{{ formatCurrency(customer.lifetimeValue) }}</div>
                        <div class="text-caption text-medium-emphasis">{{ customer.orders }} {{ $t('orders') || 'طلبات' }}</div>
                      </div>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-chart-box</v-icon>
                    {{ $t('ltvMetrics') || 'مؤشرات القيمة الدائمة' }}
                  </h3>
                  <div class="ltv-metrics">
                    <div class="metric-item d-flex justify-space-between align-center mb-3">
                      <span class="text-caption text-medium-emphasis">{{ $t('averageLTV') || 'متوسط القيمة الدائمة' }}</span>
                      <span class="text-body-2 font-weight-medium text-white">{{ formatCurrency(ltvMetrics.average) }}</span>
                    </div>
                    <div class="metric-item d-flex justify-space-between align-center mb-3">
                      <span class="text-caption text-medium-emphasis">{{ $t('medianLTV') || 'وسيط القيمة الدائمة' }}</span>
                      <span class="text-body-2 font-weight-medium text-white">{{ formatCurrency(ltvMetrics.median) }}</span>
                    </div>
                    <div class="metric-item d-flex justify-space-between align-center">
                      <span class="text-caption text-medium-emphasis">{{ $t('top10LTV') || 'أعلى 10% القيمة الدائمة' }}</span>
                      <span class="text-body-2 font-weight-medium text-success">{{ formatCurrency(ltvMetrics.top10) }}</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Behavior Tab -->
        <div v-else-if="activeTab === 'behavior'" class="behavior-content">
          <v-row class="mb-6">
            <v-col cols="12">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-brain</v-icon>
                    {{ $t('behaviorPatterns') || 'أنماط السلوك' }}
                  </h3>
                  <div class="chart-container" style="height: 400px;">
                    <canvas ref="behaviorChart"></canvas>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-clock</v-icon>
                    {{ $t('purchasePatterns') || 'أنماط الشراء' }}
                  </h3>
                  <div class="purchase-patterns">
                    <div v-for="pattern in purchasePatterns" :key="pattern.name" class="pattern-item d-flex justify-space-between align-center mb-3">
                      <span class="text-caption text-medium-emphasis">{{ pattern.name }}</span>
                      <span class="text-body-2 font-weight-medium text-white">{{ pattern.percentage }}%</span>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" lg="6">
              <v-card variant="elevated" class="insights-card">
                <v-card-text class="pa-4">
                  <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-target</v-icon>
                    {{ $t('interestCategories') || 'فئات الاهتمام' }}
                  </h3>
                  <div class="interest-categories">
                    <div v-for="category in interestCategories" :key="category.name" class="category-item d-flex align-center ga-3 mb-3">
                      <v-avatar :color="category.color" variant="tonal" size="32">
                        <v-icon size="16">{{ category.icon }}</v-icon>
                      </v-avatar>
                      <div class="flex-grow-1">
                        <span class="text-body-2">{{ category.name }}</span>
                      </div>
                      <v-chip :color="category.color" variant="tonal" size="small">
                        {{ category.percentage }}%
                      </v-chip>
                    </div>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>
          <div class="stat-box">
            <span class="label">معدل عودة العملاء</span>
            <span class="value">{{ analytics.retention.returningRate.toFixed(1) }}%</span>
          </div>
          <div class="stat-box">
            <span class="label">متوسط الطلبات لكل عميل</span>
            <span class="value">{{ analytics.retention.averageOrdersPerCustomer.toFixed(1) }}</span>
          </div>
        </div>

        <!-- توصيات ذكية -->
        <div class="recommendations-card" v-if="marketingRecs">
          <h3><i class="fa-solid fa-lightbulb"></i> توصيات تسويقية ذكية</h3>
          <div class="rec-list">
            <div
              v-for="rec in marketingRecs"
              :key="rec.title"
              class="rec-item"
              :class="rec.priority"
            >
              <div class="rec-header">
                <span class="rec-title">{{ rec.title }}</span>
                <span class="rec-badge">{{ rec.priority === 'urgent' ? 'عاجل' : 'مهم' }}</span>
              </div>
              <p class="rec-message">{{ rec.message }}</p>
              <div class="rec-actions">
                <span v-for="action in rec.actions" :key="action" class="rec-action">
                  <i class="fa-solid fa-check-circle"></i> {{ action }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== تبويب تقسيم العملاء ===== -->
      <div v-if="activeTab === 'segments'" class="segments-tab">
        <div v-if="loadingSegments" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحميل بيانات العملاء...</p>

// State
const loading = ref(false);
const activeTab = ref('overview');

// Chart refs
const growthChart = ref(null);
const distributionChart = ref(null);
const segmentsChart = ref(null);
const churnChart = ref(null);
const lifetimeChart = ref(null);
const behaviorChart = ref(null);

// Data
const overviewMetrics = ref([
  {
    title: t('totalCustomers') || 'إجمالي العملاء',
    value: '1,234',
    icon: 'mdi-account-group',
    color: 'primary'
                </div>
                <span class="dist-value">{{ valueStats.distribution.over50000 }}</span>
              </div>
            </div>
          </div>

          <!-- أفضل العملاء -->
          <div class="top-customers" v-if="valueStats.topCustomer">
            <h3><i class="fa-solid fa-crown"></i> أفضل عميل</h3>
            <div class="top-card">
              <div class="top-info">
                <h4>{{ valueStats.topCustomer.customerName }}</h4>
                <p>القيمة التاريخية: {{ formatCurrency(valueStats.topCustomer.historical) }}</p>
                <p>
                  متوقع خلال 3 سنوات: {{ formatCurrency(valueStats.topCustomer.predicted3Years) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ===== تبويب تحليل السلوك ===== -->
      <div v-if="activeTab === 'behavior'" class="behavior-tab">
        <div v-if="loadingBehavior" class="loading-state">
          <div class="spinner"></div>
          <p>جاري تحليل سلوك العملاء...</p>
        </div>

        <div v-else-if="behaviorStats" class="behavior-container">
          <!-- إحصائيات السلوك -->
          <div class="behavior-stats">
            <div class="stat-item">
              <span class="stat-big">{{ behaviorStats.uniqueVisitors }}</span>
              <span class="stat-small">زوار فريدون</span>
            </div>
            <div class="stat-item">
              <span class="stat-big">{{ behaviorStats.totalViews }}</span>
              <span class="stat-small">إجمالي المشاهدات</span>
            </div>
            <div class="stat-item">
              <span class="stat-big">{{ behaviorStats.activeCarts }}</span>
              <span class="stat-small">سلال نشطة</span>
            </div>
            <div class="stat-item">
              <span class="stat-big">{{ behaviorStats.cartAbandonmentRate.toFixed(1) }}%</span>
              <span class="stat-small">نسبة السلال المتروكة</span>
            </div>
          </div>

          <!-- تحليل الساعات -->
          <div class="time-analysis">
            <h3><i class="fa-solid fa-clock"></i> أوقات الذروة</h3>
            <p>قيد التطوير - سيتم إضافة رسم بياني لتحليل أوقات التصفح</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomerAnalyticsService from '@/integration/ai/customers/CustomerAnalyticsService';
import CustomerSegmentation from '@/integration/ai/customers/CustomerSegmentation';
import ChurnPredictor from '@/integration/ai/customers/ChurnPredictor';
import CustomerValue from '@/integration/ai/customers/CustomerValue';
import BehaviorTracker from '@/integration/ai/customers/BehaviorTracker';
import CurrencyService from '@/integration/services/CurrencyService';

export default {
  name: 'CustomerInsights',
  data() {
    return {
      loading: false,
      activeTab: 'overview',

      // بيانات
      analytics: null,
      segments: null,
      engagementSegments: null,
      lifecycleSegments: null,
      churnStats: null,
      churnPredictions: null,
      retentionRecs: null,
      valueStats: null,
      behaviorStats: null,
      marketingRecs: null,

      // حالات التحميل
      loadingSegments: false,
      loadingChurn: false,
      loadingValue: false,
      loadingBehavior: false,
    };
  },
  mounted() {
    this.loadOverview();
  },
  methods: {
    formatCurrency(value) {
      return CurrencyService.formatAmount(value || 0);
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('ar-SA');
    },

    async loadOverview() {
      this.loading = true;
      try {
        this.analytics = await CustomerAnalyticsService.getCustomerAnalytics();
        this.marketingRecs = await CustomerSegmentation.getMarketingRecommendations();
      } catch (error) {
        console.error('خطأ في تحميل النظرة العامة:', error);
      } finally {
        this.loading = false;
      }
    },

    async loadSegments() {
      this.loadingSegments = true;
      try {
        const allSegments = await CustomerSegmentation.getAllSegments();
        this.segments = allSegments.byValue;
        this.engagementSegments = allSegments.byEngagement;
        this.lifecycleSegments = allSegments.byLifecycle;
      } catch (error) {
        console.error('خطأ في تحميل تقسيم العملاء:', error);
      } finally {
        this.loadingSegments = false;
      }
    },

    async loadChurn() {
      this.loadingChurn = true;
      try {
        this.churnStats = await ChurnPredictor.getChurnStats();
        this.churnPredictions = await ChurnPredictor.predictAllCustomers();
        this.retentionRecs = await ChurnPredictor.getRetentionRecommendations();
      } catch (error) {
        console.error('خطأ في تحميل تحليل التوقف:', error);
      } finally {
        this.loadingChurn = false;
      }
    },

    async loadValue() {
      this.loadingValue = true;
      try {
        this.valueStats = await CustomerValue.getValueStats();
      } catch (error) {
        console.error('خطأ في تحميل القيمة الدائمة:', error);
      } finally {
        this.loadingValue = false;
      }
    },

    async loadBehavior() {
      this.loadingBehavior = true;
      try {
        this.behaviorStats = await BehaviorTracker.getBehaviorStats();
      } catch (error) {
        console.error('خطأ في تحميل تحليل السلوك:', error);
      } finally {
        this.loadingBehavior = false;
      }
    },

    async refreshAll() {
      this.loading = true;
      try {
        await CustomerAnalyticsService.refreshAll();
        await CustomerSegmentation.getAllSegments();
        await ChurnPredictor.refreshAll();
        await CustomerValue.refreshAll();

        await this.loadOverview();
        if (this.activeTab === 'segments') await this.loadSegments();
        if (this.activeTab === 'churn') await this.loadChurn();
        if (this.activeTab === 'value') await this.loadValue();
        if (this.activeTab === 'behavior') await this.loadBehavior();

        this.$toast?.success('تم تحديث جميع البيانات بنجاح');
      } catch (error) {
        console.error('خطأ في تحديث البيانات:', error);
        this.$toast?.error('فشل تحديث البيانات');
      } finally {
        this.loading = false;
      }
    },

    getSegmentName(segment) {
      const names = {
        vip: 'عملاء VIP',
        regular: 'عملاء منتظمون',
        occasional: 'عملاء مناسبيون',
        new: 'عملاء جدد',
        churned: 'عملاء متوقفون',
      };
      return names[segment] || segment;
    },

    getSegmentIcon(segment) {
      const icons = {
        vip: 'fa-solid fa-crown',
        regular: 'fa-solid fa-user-check',
        occasional: 'fa-solid fa-user-clock',
        new: 'fa-solid fa-user-plus',
        churned: 'fa-solid fa-user-slash',
      };
      return icons[segment] || 'fa-solid fa-user';
    },

    getEngagementName(segment) {
      const names = {
        highlyEngaged: 'متفاعلون جداً',
        engaged: 'متفاعلون',
        atRisk: 'معرضون للخطر',
        lost: 'مفقودون',
        new: 'جدد',
      };
      return names[segment] || segment;
    },

    getLifecycleName(segment) {
      const names = {
        acquisition: 'اكتساب',
        growth: 'نمو',
        maturity: 'نضج',
        decline: 'تراجع',
        reactivation: 'إعادة تنشيط',
      };
      return names[segment] || segment;
    },
  },
};
</script>

<style scoped>
@import '@/assets/theme.css';

.customer-insights {
  padding: 25px;
  min-height: 100vh;
  background: var(--bg-primary);
  animation: fadeIn 0.5s ease;
  }

  .insights-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .insights-header:hover::before {
    left: 100%;
  }

  /* Metric Cards */
  .metric-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .metric-card:hover::before {
    left: 100%;
  }

  .metric-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
  }

  /* Insights Cards */
  .insights-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .insights-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .insights-card:hover::before {
    left: 100%;
  }

  .insights-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Customer Lists */
  .risk-customer,
  .value-customer {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .risk-customer::before,
  .value-customer::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .risk-customer:hover::before,
  .value-customer:hover::before {
    left: 100%;
  }

  .risk-customer:hover,
  .value-customer:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Segments List */
  .segment-item {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .segment-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .segment-item:hover::before {
    left: 100%;
  }

  .segment-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Chart Containers */
  .chart-container {
    position: relative;
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

  .metric-card {
    animation: fadeIn 0.5s ease forwards;
  }

  .metric-card:nth-child(1) { animation-delay: 0.1s; }
  .metric-card:nth-child(2) { animation-delay: 0.2s; }
  .metric-card:nth-child(3) { animation-delay: 0.3s; }
  .metric-card:nth-child(4) { animation-delay: 0.4s; }

  .insights-card {
    animation: fadeIn 0.6s ease forwards;
  }

  .insights-card:nth-child(1) { animation-delay: 0.1s; }
  .insights-card:nth-child(2) { animation-delay: 0.2s; }

  .risk-customer,
  .value-customer,
  .segment-item {
    animation: fadeIn 0.3s ease forwards;
  }

  /* Responsive Design */
  @media (max-width: 960px) {
    .insights-header .d-flex {
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
    .insights-header h1 {
      font-size: 1.5rem;
    }
    
    .metric-card {
      margin-bottom: 1rem;
    }
    
    .insights-card {
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

  :deep(.v-icon) {
    transition: all 0.3s ease;
  }

  :deep(.v-icon:hover) {
    transform: scale(1.1);
  }

  :deep(.v-tabs) {
    transition: all 0.3s ease;
  }

  :deep(.v-tab) {
    transition: all 0.3s ease;
  }

  :deep(.v-tab:hover) {
    transform: translateY(-1px);
  }

  :deep(.v-tab.v-tab--selected) {
    transform: translateY(0);
  }

  .customer-insights {
    padding: 25px;
    min-height: 100vh;
    background: var(--v-theme-surface);
    animation: fadeIn 0.5s ease;
  }

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

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px;
    background: var(--v-theme-surface);
    padding: 25px 30px;
    border-radius: 24px;
    border: 1px solid var(--v-theme-outline);
    box-shadow: var(--v-theme-shadow);
  }

  .header-title h1 {
    font-size: 2rem;
    color: var(--v-theme-on-surface);
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .header-icon {
    color: var(--v-theme-primary);
    font-size: 2rem;
    animation: iconPulse 2s ease infinite;
  }

  @keyframes iconPulse {
    0%,
    100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.1);
    }
  }

  .header-subtitle {
    color: var(--v-theme-on-surface);
    font-size: 0.95rem;
  }
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.blue {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.stat-icon.green {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.stat-icon.orange {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.stat-icon.red {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.stat-content {
  flex: 1;
}

.stat-value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.stat-label {
  color: var(--text-dim);
  font-size: 0.9rem;
}

/* ===== توزيع العملاء ===== */
.chart-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid var(--border-light);
}

.chart-card h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-card h3 i {
  color: var(--gold-1);
}

.distribution-grid {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.distribution-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.segment-name {
  width: 120px;
  color: white;
  font-weight: 600;
}

.progress-bar {
  flex: 1;
  height: 30px;
  background: var(--bg-primary);
  border-radius: 15px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f5e7b2);
  border-radius: 15px;
  transition: width 0.5s;
}

.segment-count {
  width: 80px;
  color: var(--gold-1);
  font-weight: 600;
  text-align: left;
}

/* ===== صف الإحصائيات ===== */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.stat-box {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 15px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.stat-box .label {
  display: block;
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.stat-box .value {
  display: block;
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
}

.stat-box.warning .value {
  color: #ff9800;
}

.stat-box.danger .value {
  color: #f44336;
}

/* ===== توصيات ذكية ===== */
.recommendations-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid var(--border-light);
}

.recommendations-card h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendations-card h3 i {
  color: var(--gold-1);
}

.rec-list {
  display: grid;
  gap: 15px;
}

.rec-item {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  border-right: 4px solid;
}

.rec-item.urgent {
  border-right-color: #f44336;
}

.rec-item.high {
  border-right-color: #ff9800;
}

.rec-item.medium {
  border-right-color: #2196f3;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.rec-title {
  color: white;
  font-weight: 600;
  font-size: 1rem;
}

.rec-badge {
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.rec-message {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 15px;
}

.rec-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.rec-action {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-1);
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

/* ===== شرائح العملاء ===== */
.segment-section {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid var(--border-light);
}

.segment-section h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.segment-section h3 i {
  color: var(--gold-1);
}

.segment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 15px;
}

.segment-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 15px;
  border: 1px solid var(--border-light);
  transition: all 0.3s;
}

.segment-card:hover {
  transform: translateY(-3px);
  border-color: var(--gold-1);
}

.segment-card.vip .segment-icon {
  color: #d4af37;
}

.segment-card.regular .segment-icon {
  color: #2196f3;
}

.segment-card.occasional .segment-icon {
  color: #ff9800;
}

.segment-card.new .segment-icon {
  color: #4caf50;
}

.segment-card.churned .segment-icon {
  color: #f44336;
}

.segment-icon {
  font-size: 2rem;
  width: 50px;
  text-align: center;
}

.segment-info {
  flex: 1;
}

.segment-info h4 {
  color: white;
  font-size: 1rem;
  margin-bottom: 15px;
}

.segment-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.segment-stats .stat .label {
  display: block;
  color: var(--text-dim);
  font-size: 0.7rem;
  margin-bottom: 3px;
}

.segment-stats .stat .value {
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
}

.mini-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
}

.mini-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 15px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.mini-card.highlyEngaged {
  border-top: 4px solid #4caf50;
}

.mini-card.engaged {
  border-top: 4px solid #2196f3;
}

.mini-card.atRisk {
  border-top: 4px solid #ff9800;
}

.mini-card.lost {
  border-top: 4px solid #f44336;
}

.mini-card.new {
  border-top: 4px solid #d4af37;
}

.mini-title {
  display: block;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.mini-count {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.mini-percent {
  color: var(--text-dim);
  font-size: 0.8rem;
}

.lifecycle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
}

.lifecycle-item {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 12px;
  text-align: center;
}

.lifecycle-name {
  display: block;
  color: white;
  font-size: 0.9rem;
  margin-bottom: 5px;
}

.lifecycle-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--gold-1);
  margin-bottom: 3px;
}

.lifecycle-percent {
  color: var(--text-dim);
  font-size: 0.8rem;
}

/* ===== خطر التوقف ===== */
.risk-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.risk-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  border: 1px solid var(--border-light);
}

.risk-card.high .risk-icon {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

.risk-card.medium .risk-icon {
  background: rgba(255, 152, 0, 0.1);
  color: #ff9800;
}

.risk-card.low .risk-icon {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.risk-card.safe .risk-icon {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.risk-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.risk-content {
  flex: 1;
}

.risk-label {
  display: block;
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 5px;
}

.risk-value {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 3px;
}

.risk-percent {
  color: var(--text-dim);
  font-size: 0.8rem;
}

.churn-stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.risk-list {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid var(--border-light);
}

.risk-list h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.risk-list h3 i {
  color: #f44336;
}

.customer-cards {
  display: grid;
  gap: 15px;
}

.customer-card {
  background: var(--bg-primary);
  border-radius: 12px;
  padding: 15px;
  border: 1px solid var(--border-light);
}

.customer-info h4 {
  color: white;
  font-size: 0.95rem;
  margin-bottom: 8px;
}

.customer-details {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  color: var(--text-dim);
  font-size: 0.8rem;
  margin-bottom: 10px;
}

.churn-bar {
  height: 6px;
  background: rgba(244, 67, 54, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.churn-fill {
  height: 100%;
  background: #f44336;
  border-radius: 3px;
  transition: width 0.5s;
}

.retention-recs {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid var(--border-light);
}

.retention-recs h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.recs-list {
  display: grid;
  gap: 15px;
}

.rec-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  gap: 15px;
  border: 1px solid var(--border-light);
}

.rec-level {
  width: 4px;
  border-radius: 2px;
}

.rec-level.high {
  background: #f44336;
}

.rec-level.medium {
  background: #ff9800;
}

.rec-level.low {
  background: #2196f3;
}

.rec-content {
  flex: 1;
}

.rec-content h4 {
  color: white;
  font-size: 1rem;
  margin-bottom: 5px;
}

.rec-content p {
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.rec-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-tag {
  background: rgba(212, 175, 55, 0.1);
  color: var(--gold-1);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
}

/* ===== القيمة الدائمة ===== */
.value-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.value-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.value-card.total .value {
  color: #d4af37;
}

.value-card.average .value {
  color: #2196f3;
}

.value-card.growth .value {
  color: #4caf50;
}

.value-card.atrisk .value {
  color: #f44336;
}

.value-card .label {
  display: block;
  color: var(--text-dim);
  font-size: 0.85rem;
  margin-bottom: 10px;
}

.value-card .value {
  display: block;
  font-size: 1.8rem;
  font-weight: 700;
}

.distribution-chart {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  margin-bottom: 25px;
  border: 1px solid var(--border-light);
}

.distribution-chart h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.dist-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dist-label {
  width: 100px;
  color: var(--text-dim);
  font-size: 0.85rem;
}

.dist-bar {
  flex: 1;
  height: 20px;
  background: var(--bg-primary);
  border-radius: 10px;
  overflow: hidden;
}

.dist-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4af37, #f5e7b2);
  border-radius: 10px;
  transition: width 0.5s;
}

.dist-value {
  width: 50px;
  color: white;
  font-weight: 600;
  text-align: left;
}

.top-customers {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid var(--border-light);
}

.top-customers h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.top-customers h3 i {
  color: #d4af37;
}

.top-card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-light);
}

.top-card h4 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 10px;
}

.top-card p {
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 5px;
}

/* ===== تحليل السلوك ===== */
.behavior-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-item {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  border: 1px solid var(--border-light);
}

.stat-big {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 5px;
}

.stat-small {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.time-analysis {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 25px;
  border: 1px solid var(--border-light);
}

.time-analysis h3 {
  color: white;
  font-size: 1.1rem;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.time-analysis p {
  color: var(--text-dim);
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
}

/* ===== حالة التحميل ===== */
.loading-state {
  text-align: center;
  padding: 50px;
  color: var(--text-dim);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: var(--gold-1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 15px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ===== استجابة للشاشات الصغيرة ===== */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .tabs-container {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: auto;
    min-width: 100px;
  }

  .segment-card {
    flex-direction: column;
    text-align: center;
  }

  .segment-stats {
    grid-template-columns: 1fr;
  }

  .distribution-item {
    flex-wrap: wrap;
  }

  .rec-card {
    flex-direction: column;
  }
}
</style>
