<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 ai-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-brain</v-icon>
              {{ $t('aiInsights') || 'تحليلات الذكاء الاصطناعي' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('aiSubtitle') || 'رؤى استراتيجية مبنية على تعلم الآلة والنمذجة التنبؤية' }}
            </p>
          </div>
          <div class="ai-status d-flex align-center ga-2">
            <v-icon color="success" size="12">
              <v-progress-circular indeterminate size="12" width="2" />
            </v-icon>
            <v-chip color="success" variant="tonal" size="small">
              {{ $t('systemConnected') || 'النظام متصل | معالجة البيانات الحية' }}
            </v-chip>
          </div>
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
      <p class="text-body-1 text-medium-emphasis">{{ $t('loadingAIInsights') || 'جاري تحميل بيانات الذكاء الاصطناعي...' }}</p>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" variant="outlined" class="mb-6">
      <v-card-text class="pa-6 text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h6 font-weight-medium mb-2 text-error">{{ $t('errorLoadingData') || 'خطأ في تحميل البيانات' }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn @click="fetchAIInsights" variant="elevated" color="primary">
          {{ $t('retry') || 'إعادة المحاولة' }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Main Content -->
    <div v-else>
      <!-- AI Prediction Cards -->
      <v-row class="mb-8">
        <v-col cols="12" md="4">
          <v-card variant="elevated" class="ai-card prediction">
            <v-card-text class="pa-6">
              <div class="d-flex align-center ga-4 mb-4">
                <v-avatar color="success" variant="tonal" size="48">
                  <v-icon color="success" size="28">mdi-chart-line</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <span class="text-caption text-medium-emphasis d-block mb-1">
                    {{ $t('growthPrediction') || 'توقعات النمو الاستراتيجي' }}
                  </span>
                  <h3 class="text-h4 font-weight-bold text-success">+{{ aiStats.growthPrediction }}%</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ $t('algorithmicAnalysis') || 'تحليل خوارزمي للاتجاهات المستقبلية' }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="elevated" class="ai-card risk">
            <v-card-text class="pa-6">
              <div class="d-flex align-center ga-4 mb-4">
                <v-avatar color="warning" variant="tonal" size="48">
                  <v-icon color="warning" size="28">mdi-shield-account</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <span class="text-caption text-medium-emphasis d-block mb-1">
                    {{ $t('investmentSafety') || 'مؤشر أمان الاستثمار' }}
                  </span>
                  <h3 class="text-h4 font-weight-bold text-warning">{{ 100 - aiStats.riskScore }}/100</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ $t('riskAssessment') || 'تقييم المخاطر التشغيلية والمالية' }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card variant="elevated" class="ai-card roi">
            <v-card-text class="pa-6">
              <div class="d-flex align-center ga-4 mb-4">
                <v-avatar color="info" variant="tonal" size="48">
                  <v-icon color="info" size="28">mdi-gem</v-icon>
                </v-avatar>
                <div class="flex-grow-1">
                  <span class="text-caption text-medium-emphasis d-block mb-1">
                    {{ $t('expectedROI') || 'العائد السنوي المتوقع (ROI)' }}
                  </span>
                  <h3 class="text-h4 font-weight-bold text-info">{{ aiStats.expectedROI }}%</h3>
                  <p class="text-caption text-medium-emphasis mb-0">
                    {{ $t('profitEstimation') || 'تقدير الأرباح بناءً على كفاءة الأصول' }}
                  </p>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- AI Detailed Analysis -->
      <v-row class="mb-8">
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analysis-panel">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-flask</v-icon>
                {{ $t('scenarioSimulator') || 'محاكي السيناريوهات الذكي' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="simulator-controls mb-6">
                <v-row>
                  <v-col cols="12">
                    <v-slider
                      v-model="simParams.marketing"
                      :label="$t('marketingBudgetIncrease') || 'زيادة ميزانية التسويق (%)'"
                      min="0"
                      max="100"
                      thumb-label="always"
                      color="primary"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-slider
                      v-model="simParams.prices"
                      :label="$t('priceAdjustment') || 'تعديل السعر (%)'"
                      min="-20"
                      max="20"
                      thumb-label="always"
                      color="primary"
                    />
                  </v-col>
                  <v-col cols="12">
                    <v-checkbox
                      v-model="simParams.newBranch"
                      :label="$t('openNewBranch') || 'افتتاح فرع جديد في ولاية كبرى'"
                      color="primary"
                    />
                  </v-col>
                </v-row>
              </div>

              <v-card variant="outlined" class="simulation-result">
                <v-card-text class="pa-4">
                  <v-row class="mb-4">
                    <v-col cols="12" sm="4">
                      <div class="text-center">
                        <span class="text-caption text-medium-emphasis d-block mb-1">
                          {{ $t('projectedGrowth') || 'النمو المتوقع' }}
                        </span>
                        <h4 class="text-h5 font-weight-bold text-success">{{ simResult.projectedGrowth }}%</h4>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <div class="text-center">
                        <span class="text-caption text-medium-emphasis d-block mb-1">
                          {{ $t('totalReturn') || 'إجمالي العائد' }}
                        </span>
                        <h4 class="text-h5 font-weight-bold text-primary">{{ simResult.estimatedRevenue }} دج</h4>
                      </div>
                    </v-col>
                    <v-col cols="12" sm="4">
                      <div class="text-center">
                        <span class="text-caption text-medium-emphasis d-block mb-1">
                          {{ $t('riskImpact') || 'تأثير المخاطر' }}
                        </span>
                        <h4 
                          class="text-h5 font-weight-bold" 
                          :class="simResult.riskImpact === 'عالي' ? 'text-error' : 'text-warning'"
                        >
                          {{ simResult.riskImpact }}
                        </h4>
                      </div>
                    </v-col>
                  </v-row>
                  
                  <div class="confidence-bar">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="text-caption">{{ $t('confidenceScore') || 'نسبة الثقة في التوقعات' }}</span>
                      <span class="text-caption font-weight-medium">{{ simResult.confidenceScore }}%</span>
                    </div>
                    <v-progress-linear
                      :model-value="simResult.confidenceScore"
                      color="success"
                      height="6"
                      rounded
                    />
                  </div>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analysis-panel">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-trophy</v-icon>
                {{ $t('assetInvestmentMerit') || 'الجدارة الاستثمارية للأصول' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="asset-list">
                <v-card
                  v-for="asset in assetPerformance"
                  :key="asset.category"
                  variant="outlined"
                  class="asset-item mb-3"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="font-weight-medium">{{ asset.category }}</span>
                      <v-chip color="success" variant="tonal" size="small">
                        <v-icon size="12" class="me-1">mdi-trending-up</v-icon>
                        {{ asset.roi }}% ROI
                      </v-chip>
                    </div>
                    <div class="d-flex ga-4">
                      <span class="text-caption text-medium-emphasis">
                        <v-icon size="12" class="me-1">mdi-sync</v-icon>
                        {{ $t('turnover') || 'الدوران' }}: {{ asset.turnOver }}
                      </span>
                      <span class="text-caption text-medium-emphasis">
                        <v-icon size="12" class="me-1">mdi-shield-virus</v-icon>
                        {{ $t('inventoryRisk') || 'مخاطر المخزون' }}: {{ asset.inventoryRisk }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
              
              <v-card variant="outlined" class="strategic-recommendation mt-4">
                <v-card-text class="pa-4">
                  <h4 class="font-weight-medium mb-3 d-flex align-center ga-2">
                    <v-icon color="primary" size="20">mdi-lightning-bolt</v-icon>
                    {{ $t('strategicRecommendation') || 'توصية استراتيجية (AI Recommended):' }}
                  </h4>
                  <p class="text-body-2">{{ strategicRecommendation }}</p>
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Market Opportunities -->
      <v-row class="mb-8">
        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analysis-panel">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-satellite</v-icon>
                {{ $t('untappedMarkets') || 'فرص السوق الضائعة (Untapped Markets)' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="market-list">
                <v-card
                  v-for="market in untappedMarkets"
                  :key="market.region"
                  variant="outlined"
                  class="market-item mb-4"
                >
                  <v-card-text class="pa-4">
                    <div class="d-flex align-center ga-4">
                      <div class="market-score">
                        <v-progress-circular
                          :model-value="market.score"
                          :size="60"
                          :width="5"
                          color="primary"
                        >
                          <span class="text-caption font-weight-bold">{{ market.score }}%</span>
                        </v-progress-circular>
                      </div>
                      <div class="flex-grow-1">
                        <h4 class="text-h6 font-weight-medium mb-1">{{ market.region }}</h4>
                        <p class="text-caption text-medium-emphasis mb-0">
                          <v-icon size="12" class="me-1">mdi-information</v-icon>
                          {{ market.reason }}
                        </p>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="6">
          <v-card variant="elevated" class="analysis-panel">
            <v-card-title class="pa-4">
              <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
                <v-icon color="primary">mdi-account-tie</v-icon>
                {{ $t('customerLifetimeValue') || 'تحليل القيمة الحياتية للعملاء (Strategic CLV)' }}
              </h3>
            </v-card-title>
            <v-card-text class="pa-4">
              <div class="clv-insights">
                <v-card
                  v-for="clv in clvInsights"
                  :key="clv.segment"
                  variant="outlined"
                  class="clv-item mb-4"
                >
                  <v-card-text class="pa-3">
                    <div class="d-flex justify-space-between align-center mb-2">
                      <span class="font-weight-medium">{{ clv.segment }}</span>
                      <span class="text-primary font-weight-bold">
                        {{ clv.avgClv.toLocaleString() }} دج
                        <v-icon size="12" class="ms-1">mdi-coins</v-icon>
                      </span>
                    </div>
                    <v-progress-linear
                      :model-value="clv.potential"
                      color="primary"
                      height="6"
                      rounded
                      class="mb-2"
                    />
                    <div class="d-flex justify-space-between align-center">
                      <span class="text-caption text-medium-emphasis">
                        <v-icon size="12" class="me-1">mdi-arrow-expand-all</v-icon>
                        {{ $t('expansionPotential') || 'إمكانية التوسع' }}: {{ clv.potential }}%
                      </span>
                      <span 
                        class="text-caption"
                        :class="clv.trend === 'up' ? 'text-success' : 'text-error'"
                      >
                        <v-icon size="12" class="me-1">
                          {{ clv.trend === 'up' ? 'mdi-chart-line' : 'mdi-arrow-down' }}
                        </v-icon>
                        {{ clv.trend === 'up' ? ($t('continuedGrowth') || 'نمو مستمر') : ($t('slightDecline') || 'انخفاض طفيف') }}
                      </span>
                    </div>
                  </v-card-text>
                </v-card>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AIService from '@/services/AIService';
import ERPNextService from '@/services/ERPNextService';
import DashboardService from '@/services/DashboardService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(true);
const error = ref(null);
const aiStats = ref({
  growthPrediction: 0,
  riskScore: 15,
  expectedROI: 0,
  marketSentiment: 0,
  competitorAnalysis: {},
  demandForecast: []
});

const marketTrends = ref([]);
const customerInsights = ref({});
const recommendations = ref([]);

const simParams = ref({
  marketing: 10,
  prices: 0,
  newBranch: false
});

const assetPerformance = ref([]);
const untappedMarkets = ref([]);
const clvInsights = ref([]);

// Methods
const fetchAIInsights = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch AI insights from backend
    const [
      salesForecast,
      marketTrendData,
      customerData,
      productRecommendations,
      demandPrediction
    ] = await Promise.all([
      AIService.getSalesForecast('90days'),
      AIService.getMarketTrends(),
      AIService.getCustomerInsights(),
      AIService.getProductRecommendations(),
      AIService.predictDemand()
    ]);

    // Update AI stats with real data
    aiStats.value = {
      growthPrediction: salesForecast.growthRate || 23.5,
      riskScore: salesForecast.riskAssessment?.score || 15,
      expectedROI: salesForecast.expectedROI || 28.3,
      marketSentiment: marketTrendData.sentiment || 0.75,
      competitorAnalysis: marketTrendData.competitorAnalysis || {
        topCompetitors: ['منافس 1', 'منافس 2'],
        marketShare: 12.5
      },
      demandForecast: demandPrediction.demand || []
    };

    marketTrends.value = marketTrendData.trends || [];
    customerInsights.value = customerData;
    recommendations.value = productRecommendations;

    // Load additional AI data
    await loadAIData();

    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('aiDataLoaded') || 'تم تحميل بيانات الذكاء الاصطناعي',
      message: t('aiInsightsLoaded') || 'تم تحليل البيانات بنجاح',
      timeout: 3000
    });

  } catch (err) {
    console.error('Error fetching AI insights:', err);
    error.value = err.message || t('failedToLoadAIInsights') || 'فشل في تحميل بيانات الذكاء الاصطناعي';
    
    // Fallback to mock data if backend fails
    aiStats.value = {
      growthPrediction: 23.5,
      riskScore: 15,
      expectedROI: 28.3,
      marketSentiment: 0.75,
      competitorAnalysis: {
        topCompetitors: ['منافس 1', 'منافس 2'],
        marketShare: 12.5
      },
      demandForecast: [
        { month: 'يناير', demand: 1200 },
        { month: 'فبراير', demand: 1350 },
        { month: 'مارس', demand: 1100 }
      ]
    };

    await loadAIData();

    // Show warning notification
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('usingMockData') || 'استخدام بيانات وهمية',
      message: t('usingMockAIInsights') || 'جاري استخدام بيانات وهمية لتحليلات الذكاء الاصطناعي',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const loadAIData = async () => {
  try {
    // Load asset performance
    const assetData = await AIService.getAssetPerformance();
    assetPerformance.value = assetData || [
      {
        category: t('walls') || 'جدران',
        roi: 25.3,
        turnOver: 4.2,
        inventoryRisk: t('low') || 'منخفض'
      },
      {
        category: t('doors') || 'أبواب',
        roi: 18.7,
        turnOver: 3.8,
        inventoryRisk: t('medium') || 'متوسط'
      },
      {
        category: t('furniture') || 'أثاث',
        roi: 31.2,
        turnOver: 5.1,
        inventoryRisk: t('low') || 'منخفض'
      }
    ];

    // Load market opportunities
    const marketData = await AIService.getMarketOpportunities();
    untappedMarkets.value = marketData || [
      {
        region: 'تمنراست',
        score: 78,
        reason: t('marketReason1') || 'نمو سكاني عالي وطلب متزايد'
      },
      {
        region: 'المدية',
        score: 65,
        reason: t('marketReason2') || 'سوق تجاري ناشئ مع فرص كبيرة'
      },
      {
        region: 'عين الدفلى',
        score: 72,
        reason: t('marketReason3') || 'قرب من العاصمة وسهولة الوصول'
      }
    ];

    // Load CLV insights
    const clvData = await AIService.calculateCLVInsights();
    clvInsights.value = clvData || [
      {
        segment: t('premiumCustomers') || 'عملاء مميزون',
        avgClv: 12500,
        potential: 85,
        trend: 'up'
      },
      {
        segment: t('regularCustomers') || 'عملاء عاديون',
        avgClv: 4800,
        potential: 62,
        trend: 'up'
      },
      {
        segment: t('newCustomers') || 'عملاء جدد',
        avgClv: 2100,
        potential: 78,
        trend: 'up'
      }
    ];
  } catch (err) {
    console.error('Error loading AI data:', err);
  }
};

const generateAIReport = async () => {
  try {
    const report = await AIService.analyzeCustomerFeedback('overall_performance');
    console.log('AI Report generated:', report);
    
    // Sync report with ERPNext
    await ERPNextService.syncToERPNext('ai_reports', {
      report,
      timestamp: new Date().toISOString(),
      type: 'performance_analysis'
    });
  } catch (err) {
    console.error('Error generating AI report:', err);
  }
};

const optimizeInventory = async () => {
  try {
    const optimization = await AIService.getInventoryOptimization();
    console.log('Inventory optimization:', optimization);
    
    // Apply optimization recommendations
    for (const item of optimization.recommendations) {
      await DashboardService.updateProduct(item.productId, {
        stock_level: item.recommendedStock,
        reorder_point: item.reorderPoint
      });
    }
  } catch (err) {
    console.error('Error optimizing inventory:', err);
  }
};

// Computed
const simResult = computed(() => {
  const baseGrowth = 15;
  const marketingImpact = simParams.value.marketing * 0.3;
  const priceImpact = simParams.value.prices * 0.5;
  const branchImpact = simParams.value.newBranch ? 8 : 0;
  
  const projectedGrowth = Math.round(baseGrowth + marketingImpact + priceImpact + branchImpact);
  const estimatedRevenue = Math.round(1000000 * (1 + projectedGrowth / 100));
  const riskImpact = simParams.value.newBranch ? 'عالي' : 'متوسط';
  const confidenceScore = Math.max(60, 95 - Math.abs(simParams.value.prices) * 2);
  
  return {
    projectedGrowth,
    estimatedRevenue,
    riskImpact,
    confidenceScore
  };
});

const strategicRecommendation = computed(() => {
  if (simParams.value.newBranch) {
    return t('branchRecommendation') || "افتتاح فرع جديد سيزيد من حصتك السوقية بنسبة كبيرة، لكن تأكد من توفير سيولة كافية لتغطية التكاليف التشغيلية في أول 6 أشهر.";
  }
  return t('rdRecommendation') || "نقترح زيادة ميزانية البحث والتطوير (R&D) بنسبة 5% للتركيز على 'الرخام الذكي'، حيث يتوقع الذكاء الاصطناعي أن يكون هذا الاتجاه هو الرائد في عام 2026.";
});

const riskLevel = computed(() => {
  const score = aiStats.value.riskScore;
  if (score <= 20) return t('low') || 'منخفض';
  if (score <= 40) return t('medium') || 'متوسط';
  if (score <= 60) return t('high') || 'مرتفع';
  return t('veryHigh') || 'عالي';
});

const riskColor = computed(() => {
  const score = aiStats.value.riskScore;
  if (score <= 20) return 'success';
  if (score <= 40) return 'warning';
  if (score <= 60) return 'error';
  return 'error';
});

const roiLevel = computed(() => {
  const roi = aiStats.value.expectedROI;
  if (roi >= 30) return t('excellent') || 'ممتاز';
  if (roi >= 20) return t('good') || 'جيد';
  if (roi >= 10) return t('average') || 'متوسط';
  return t('poor') || 'ضعيف';
});

// Lifecycle
onMounted(() => {
  fetchAIInsights();
  
  // Refresh AI data every 5 minutes
  setInterval(fetchAIInsights, 300000);
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
.ai-header {
  animation: fadeIn 0.5s ease;
}

.ai-status {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 0.8; }
  50% { opacity: 1; }
  100% { opacity: 0.8; }
}

/* AI Cards */
.ai-card {
  transition: all 0.3s ease;
}

.ai-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Analysis Panels */
.analysis-panel {
  transition: all 0.3s ease;
}

.analysis-panel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Simulation Result */
.simulation-result {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

/* Asset Items */
.asset-item {
  transition: all 0.3s ease;
}

.asset-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Market Items */
.market-item {
  transition: all 0.3s ease;
}

.market-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.market-score {
  flex-shrink: 0;
}

/* CLV Items */
.clv-item {
  transition: all 0.3s ease;
}

.clv-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Strategic Recommendation */
.strategic-recommendation {
  background: rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
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
