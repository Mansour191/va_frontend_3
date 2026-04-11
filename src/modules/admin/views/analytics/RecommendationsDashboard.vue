<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 recommendations-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-star</v-icon>
              نظام التوصيات الذكي
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              توصيات مخصصة للمنتجات بناءً على تحليل سلوك العملاء
            </p>
          <span class="stat-label">إجمالي التوصيات</span>
        </div>
      </div>
    </div>

    <!-- تبويبات -->
    <div class="tabs-container">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'overview' }"
        @click="activeTab = 'overview'"
      >
        <i class="fa-solid fa-chart-pie"></i>
        نظرة عامة
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'general' }"
        @click="
          loadGeneralRecommendations();
          activeTab = 'general';
        "
      >
        <i class="fa-solid fa-fire"></i>
        الأكثر مبيعاً
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'trending' }"
        @click="
          loadTrendingProducts();
          activeTab = 'trending';
        "
      >
        <i class="fa-solid fa-chart-line"></i>
        رائج الآن
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'advanced' }"
        @click="activeTab = 'advanced'"
      >
        <i class="fa-solid fa-analytics"></i>
        تحليلات متقدمة
      </button>

      <!--  زر جديد -->
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'performance' }"
        @click="
          loadPerformance();
          activeTab = 'performance';
        "
      >
        <i class="fa-solid fa-chart-bar"></i>
        أداء التوصيات
      </button>

      <!-- محتوى التبويب -->
      <div v-if="activeTab === 'performance'" class="performance-tab">
        <div class="performance-header">
          <h3><i class="fa-solid fa-chart-line"></i> أداء التوصيات (آخر 30 يوم)</h3>
        </div>

        <div class="performance-stats" v-if="performance">
          <div class="stat-card">
            <div class="stat-value">{{ performance.total.clicks }}</div>
            <div class="stat-label">إجمالي النقرات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ performance.total.conversions }}</div>
            <div class="stat-label">تحويلات</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ (performance.total.ctr * 100).toFixed(1) }}%</div>
            <div class="stat-label">معدل التحويل</div>
          </div>
        </div>

        <div class="performance-by-type" v-if="performance">
          <h4>الأداء حسب نوع التوصية</h4>
          <div class="type-grid">
            <div v-for="(stat, type) in performance.byType" :key="type" class="type-card">
              <div class="type-name">{{ getTypeName(type) }}</div>
              <div class="type-stats">
                <span>نقرات: {{ stat.clicks }}</span>
                <span>تحويلات: {{ stat.conversions }}</span>
                <span>نسبة: {{ ((stat.conversions / stat.clicks) * 100).toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- محتوى التبويبات -->
    <div class="tab-content">
      <!-- تبويب النظرة العامة -->
      <div v-if="activeTab === 'overview'" class="overview-tab">
        <!-- أفضل الفئات -->
        <div class="category-performance" v-if="analytics">
          <h3><i class="fa-solid fa-trophy"></i> أفضل الفئات أداءً</h3>
          <div class="category-list">
            <div
              v-for="cat in analytics.topPerformingCategories"
              :key="cat.category"
              class="category-item"
            >
              <span class="category-name">{{ getCategoryName(cat.category) }}</span>
              <div class="category-bar">
                <div class="bar-fill" :style="{ width: (cat.revenue / 50000) * 100 + '%' }"></div>
              </div>
              <span class="category-revenue">{{ formatCurrency(cat.revenue) }}</span>
            </div>
          </div>
        </div>

        <!-- توصيات عامة -->
        <div class="recommendations-section">
          <h3><i class="fa-solid fa-fire"></i> الأكثر مبيعاً</h3>
          <RecommendationsWidget
            :products="generalRecommendations"
            :loading="loadingGeneral"
            horizontal
            viewAllLink="/dashboard/recommendations?tab=general"
          />
        </div>

        <!-- رائج الآن -->
        <div class="recommendations-section">
          <h3><i class="fa-solid fa-chart-line"></i> رائج الآن</h3>
          <RecommendationsWidget
            :products="trendingProducts"
            :loading="loadingTrending"
            horizontal
            viewAllLink="/dashboard/recommendations?tab=trending"
          />
        </div>
      </div>

      <!-- تبويب الأكثر مبيعاً -->
      <div v-if="activeTab === 'general'" class="general-tab">
        <RecommendationsWidget
          :products="generalRecommendations"
          :loading="loadingGeneral"
          title="المنتجات الأكثر مبيعاً"
          icon="fa-solid fa-crown"
        />
      </div>

      <!-- تبويب رائج الآن -->
      <div v-if="activeTab === 'trending'" class="trending-tab">
        <RecommendationsWidget
          :products="trendingProducts"
          :loading="loadingTrending"
          title="المنتجات الرائجة هذا الأسبوع"
          icon="fa-solid fa-fire"
        />
      </div>

      <!-- تبويب تحليلات متقدمة -->
      <div v-if="activeTab === 'advanced'" class="advanced-tab">
        <div class="advanced-grid">
          <!-- بطاقة أداء التوصيات -->
          <div class="analytics-card">
            <h4><i class="fa-solid fa-chart-line"></i> أداء التوصيات</h4>
            <canvas ref="performanceChart"></canvas>
          </div>

          <!-- بطاقة الفئات الأكثر توصية -->
          <div class="analytics-card">
            <h4><i class="fa-solid fa-tags"></i> الفئات الأكثر توصية</h4>
            <div class="category-list">
              <div v-for="cat in categoryPerformance" :key="cat.name" class="category-stat">
                <span>{{ cat.name }}</span>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: cat.percentage + '%' }"></div>
                </div>
                <span>{{ cat.count }} توصية</span>
              </div>
            </div>
          </div>

          <!-- بطاقة أنماط الشراء -->
          <div class="analytics-card">
            <h4><i class="fa-solid fa-clock"></i> أنماط الشراء</h4>
            <div class="patterns-list">
              <div class="pattern-item">
                <i class="fa-solid fa-clock"></i>
                <span>أوقات الذروة: الخميس والجمعة</span>
              </div>
              <div class="pattern-item">
                <i class="fa-solid fa-sun"></i>
                <span>الموسم النشط: الصيف</span>
              </div>
              <div class="pattern-item">
                <i class="fa-solid fa-gift"></i>
                <span>أعلى مبيعات: نهاية السنة</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- قسم توصيات المخصصة (للمدير) -->
    <div class="personalized-section" v-if="recommendationStats">
      <h2>
        <i class="fa-solid fa-chart-line"></i>
        أداء نظام التوصيات
      </h2>

      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">إجمالي التوصيات</span>
          <span class="stat-value">{{ recommendationStats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">نسبة النقر</span>
          <span class="stat-value">{{ recommendationStats.ctr }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">نسبة التحويل</span>
          <span class="stat-value">{{ recommendationStats.conversionRate }}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">إيرادات التوصيات</span>
          <span class="stat-value">{{ formatCurrency(recommendationStats.revenue) }}</span>
        </div>
      </div>

      <div class="top-recommendations">
        <h3><i class="fa-solid fa-star"></i> أفضل التوصيات أداءً</h3>
        <div class="recommendations-list">
          <div v-for="rec in topPerformingRecommendations" :key="rec.id" class="rec-item">
            <span class="rec-name">{{ rec.productName }}</span>
            <span class="rec-clicks">{{ rec.clicks }} نقرة</span>
            <span class="rec-conversions">{{ rec.conversions }} تحويل</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import Chart from 'chart.js/auto';
import AnalyticsService from '@/services/AnalyticsService';
import RecommendationService from '@/integration/ai/recommendations/RecommendationService';
import CurrencyService from '@/integration/services/CurrencyService';
import RecommendationsWidget from '@/shared/components/RecommendationsWidget.vue';

const { t } = useI18n();
const store = useStore();

// Service instance
const analyticsService = new AnalyticsService();

// State
const loading = ref(false);
const loadingPerformance = ref(false);
const loadingGeneral = ref(false);
const loadingTrending = ref(false);
const loadingPersonalized = ref(false);
const activeTab = ref('overview');
const analytics = ref(null);
const generalRecommendations = ref([]);
const trendingProducts = ref([]);
const personalizedRecommendations = ref([]);
const user = ref(null);
const categoryPerformance = ref([]);
const charts = ref({
  performance: null,
});
const performance = ref(null);
const recommendationStats = ref(null);
const topPerformingRecommendations = ref([]);

// Chart refs
const trendsChart = ref(null);
const performanceChart = ref(null);

// API Integration Methods
const loadRecommendationsData = async () => {
  loading.value = true;
  
  try {
    // Load user data
    const userResponse = await analyticsService.getCurrentUser();
    user.value = userResponse.data || analyticsService.getMockCurrentUser();
    
    // Load general recommendations
    const generalResponse = await analyticsService.getGeneralRecommendations();
    generalRecommendations.value = generalResponse.data || analyticsService.getMockGeneralRecommendations();
    
    // Load trending products
    const trendingResponse = await analyticsService.getTrendingProducts();
    trendingProducts.value = trendingResponse.data || analyticsService.getMockTrendingProducts();
    
    // Load personalized recommendations
    const personalizedResponse = await analyticsService.getPersonalizedRecommendations(user.value?.id);
    personalizedRecommendations.value = personalizedResponse.data || analyticsService.getMockPersonalizedRecommendations();
    
    // Load category performance
    const categoryResponse = await analyticsService.getCategoryPerformance();
    categoryPerformance.value = categoryResponse.data || analyticsService.getMockCategoryPerformance();
    
    // Load analytics data
    const analyticsResponse = await analyticsService.getRecommendationsAnalytics();
    analytics.value = analyticsResponse.data || analyticsService.getMockRecommendationsAnalytics();
    
    // Load recommendation stats
    const statsResponse = await analyticsService.getRecommendationStats();
    recommendationStats.value = statsResponse.data || analyticsService.getMockRecommendationStats();
    
    // Load top performing recommendations
    const topResponse = await analyticsService.getTopPerformingRecommendations();
    topPerformingRecommendations.value = topResponse.data || analyticsService.getMockTopPerformingRecommendations();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: 'تم تحميل التوصيات',
      message: 'تم تحميل بيانات التوصيات بنجاح',
      timeout: 3000
    });
    
  } catch (error) {
    console.error('Error loading recommendations data:', error);
    
    // Fallback to mock data from service
    user.value = analyticsService.getMockCurrentUser();
    generalRecommendations.value = analyticsService.getMockGeneralRecommendations();
    trendingProducts.value = analyticsService.getMockTrendingProducts();
    personalizedRecommendations.value = analyticsService.getMockPersonalizedRecommendations();
    categoryPerformance.value = analyticsService.getMockCategoryPerformance();
    analytics.value = analyticsService.getMockRecommendationsAnalytics();
    recommendationStats.value = analyticsService.getMockRecommendationStats();
    topPerformingRecommendations.value = analyticsService.getMockTopPerformingRecommendations();
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('recommendationsError') || 'خطأ في تحميل التوصيات',
      message: 'جاري استخدام البيانات الوهمية',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Load data on component mount
onMounted(() => {
  loadRecommendationsData();
});
</script>

<style scoped>
@import '@/assets/theme.css';

/* ... */
.recommendations-dashboard {
  padding: 25px;
  min-height: 100vh;
  background: var(--bg-primary);
  animation: fadeIn 0.5s ease;
  }

  .recommendations-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .recommendations-header:hover::before {
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

  /* Recommendations Cards */
  .recommendations-card {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .recommendations-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .recommendations-card:hover::before {
    left: 100%;
  }

  .recommendations-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Model Items */
  .model-item {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .model-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .model-item:hover::before {
    left: 100%;
  }

  .model-item:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Recommendation Items */
  .recommendation-item {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }

  .recommendation-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
    transition: left 0.5s ease;
  }

  .recommendation-item:hover::before {
    left: 100%;
  }

  .recommendation-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
  }

  /* Segment Items */
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
    transform: translateY(-2px);
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

  .stat-card {
    animation: fadeIn 0.5s ease forwards;
  }

  .stat-card:nth-child(1) { animation-delay: 0.1s; }
  .stat-card:nth-child(2) { animation-delay: 0.2s; }
  .stat-card:nth-child(3) { animation-delay: 0.3s; }
  .stat-card:nth-child(4) { animation-delay: 0.4s; }

  .recommendations-card {
    animation: fadeIn 0.6s ease forwards;
  }

  .recommendations-card:nth-child(1) { animation-delay: 0.1s; }
  .recommendations-card:nth-child(2) { animation-delay: 0.2s; }

  .model-item,
  .recommendation-item,
  .segment-item {
    animation: fadeIn 0.3s ease forwards;
  }

  /* Responsive Design */
  @media (max-width: 960px) {
    .recommendations-header .d-flex {
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
    .recommendations-header h1 {
      font-size: 1.5rem;
    }
    
    .stat-card {
      margin-bottom: 1rem;
    }
    
    .recommendations-card {
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

  :deep(.v-progress-linear) {
    transition: all 0.3s ease;
  }

  :deep(.v-progress-linear:hover) {
    transform: scale(1.02);
  }
  padding: 12px;
  background: var(--bg-primary);
  border-radius: 12px;
}

.rec-name {
  flex: 2;
  color: white;
  font-weight: 600;
}

.rec-clicks {
  flex: 1;
  color: var(--gold-1);
  font-size: 0.9rem;
}

.rec-conversions {
  flex: 1;
  color: #4caf50;
  font-size: 0.9rem;
}
</style>
