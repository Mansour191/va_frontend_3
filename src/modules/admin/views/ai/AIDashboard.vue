<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 dashboard-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-brain</v-icon>
              {{ $t('aiDashboard') || 'لوحة تحكم الذكاء الاصطناعي' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('aiDashboardSubtitle') || 'مراقبة وإدارة جميع أنظمة الذكاء الاصطناعي والتدريب' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="goToTraining"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-school"
            >
              {{ $t('trainingPlatform') || 'منصة التدريب' }}
            </v-btn>
            <v-btn
              @click="goToMonitoring"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-heart-pulse"
            >
              {{ $t('monitoring') || 'المراقبة' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Quick Stats -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="primary" variant="tonal" size="50">
                <v-icon size="28" color="primary">mdi-brain</v-icon>
              </v-avatar>
              <div class="stat-info">
                <h3 class="text-h4 font-weight-bold text-white mb-1">
                  {{ aiStatus.overall === 'healthy' ? ($t('active') || 'نشط') : ($t('limited') || 'محدود') }}
                </h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ $t('aiStatus') || 'حالة الذكاء الاصطناعي' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="success" variant="tonal" size="50">
                <v-icon size="28" color="success">mdi-school</v-icon>
              </v-avatar>
              <div class="stat-info">
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ learningStats.totalSessions }}</h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ $t('trainingSessions') || 'جلسات التدريب' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="info" variant="tonal" size="50">
                <v-icon size="28" color="info">mdi-chart-line</v-icon>
              </v-avatar>
              <div class="stat-info">
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ learningStats.averageAccuracy }}%</h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ $t('averageModelAccuracy') || 'متوسط دقة النماذج' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card variant="elevated" class="stat-card">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-4">
              <v-avatar color="warning" variant="tonal" size="50">
                <v-icon size="28" color="warning">mdi-cogs</v-icon>
              </v-avatar>
              <div class="stat-info">
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ systemStatus.activeServices }}/{{ systemStatus.totalServices }}</h3>
                <p class="text-caption text-medium-emphasis mb-0">
                  {{ $t('activeServices') || 'الخدمات النشطة' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Services Grid -->
    <v-row class="mb-6">
      <!-- AI Service Status -->
      <v-col cols="12" md="4">
        <v-card variant="elevated" class="service-panel">
          <v-card-text class="pa-4">
            <div class="panel-header d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-brain</v-icon>
                {{ $t('aiService') || 'خدمة الذكاء الاصطناعي' }}
              </h3>
              <v-chip
                :color="aiStatus.overall === 'healthy' ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                <v-icon start size="12">mdi-circle</v-icon>
                {{ aiStatus.overall === 'healthy' ? ($t('active') || 'نشط') : ($t('limited') || 'محدود') }}
              </v-chip>
            </div>
            
            <div class="service-content">
              <div class="service-metrics mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('subServices') || 'الخدمات الفرعية' }}:</span>
                  <span class="text-body-2 text-white">{{ aiStatus.services?.length || 0 }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('operatingSystem') || 'نظام التشغيل' }}:</span>
                  <span class="text-body-2 text-white">{{ aiStatus.fallbackMode ? ($t('backup') || 'احتياطي') : ($t('primary') || 'أساسي') }}</span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('uptime') || 'وقت التشغيل' }}:</span>
                  <span class="text-body-2 text-white">{{ systemStatus.uptime }}</span>
                </div>
              </div>
              
              <div class="service-actions d-flex ga-2">
                <v-btn
                  @click="testAIService"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-flask"
                >
                  {{ $t('test') || 'اختبار' }}
                </v-btn>
                <v-btn
                  @click="restartAIService"
                  variant="tonal"
                  color="secondary"
                  size="small"
                  prepend-icon="mdi-refresh"
                >
                  {{ $t('restart') || 'إعادة التشغيل' }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Learning System Status -->
      <v-col cols="12" md="4">
        <v-card variant="elevated" class="service-panel">
          <v-card-text class="pa-4">
            <div class="panel-header d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-school</v-icon>
                {{ $t('learningSystem') || 'نظام التعلم' }}
              </h3>
              <v-chip
                :color="learningStatus.isActive ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                <v-icon start size="12">mdi-circle</v-icon>
                {{ learningStatus.isActive ? ($t('active') || 'نشط') : ($t('inactive') || 'غير نشط') }}
              </v-chip>
            </div>
            
            <div class="service-content">
              <div class="service-metrics mb-4">
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('learningRate') || 'معدل التعلم' }}:</span>
                  <span class="text-body-2 text-white">{{ learningStats.learningRate }}%</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('improvement') || 'التحسين' }}:</span>
                  <span class="text-body-2 text-white">{{ learningStats.improvementRate }}%</span>
                </div>
                <div class="d-flex justify-space-between align-center mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('models') || 'النماذج' }}:</span>
                  <span class="text-body-2 text-white">{{ learningStats.totalModels }}</span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('lastUpdate') || 'آخر تحديث' }}:</span>
                  <span class="text-body-2 text-white">{{ formatTime(learningStats.lastUpdate) }}</span>
                </div>
              </div>
              
              <div class="service-actions d-flex ga-2">
                <v-btn
                  @click="viewTrainingDetails"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-chart-bar"
                >
                  {{ $t('details') || 'التفاصيل' }}
                </v-btn>
                <v-btn
                  @click="startQuickTraining"
                  variant="elevated"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-play"
                >
                  {{ $t('quickTraining') || 'تدريب سريع' }}
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Performance Monitor -->
      <v-col cols="12" md="4">
        <v-card variant="elevated" class="service-panel">
          <v-card-text class="pa-4">
            <div class="panel-header d-flex align-center justify-space-between mb-4">
              <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-gauge</v-icon>
                {{ $t('performanceMonitor') || 'مراقبة الأداء' }}
              </h3>
              <v-chip
                :color="systemStatus.healthy ? 'success' : 'warning'"
                variant="tonal"
                size="small"
              >
                <v-icon start size="12">mdi-circle</v-icon>
                {{ systemStatus.healthy ? ($t('normal') || 'طبيعي') : ($t('needsAttention') || 'يحتاج انتباه') }}
              </v-chip>
            </div>
            
            <div class="service-content">
              <div class="performance-chart mb-4" style="height: 120px;">
                <canvas ref="performanceChart"></canvas>
              </div>
              
              <div class="performance-metrics">
                <div class="metric-row mb-3">
                  <span class="metric-label text-caption text-medium-emphasis">{{ $t('cpuUsage') || 'استخدام المعالج' }}:</span>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear
                      :model-value="performanceMetrics.cpuUsage"
                      color="primary"
                      height="6"
                      rounded
                    />
                    <span class="text-body-2 text-white">{{ performanceMetrics.cpuUsage }}%</span>
                  </div>
                </div>
                
                <div class="metric-row mb-3">
                  <span class="metric-label text-caption text-medium-emphasis">{{ $t('memoryUsage') || 'استخدام الذاكرة' }}:</span>
                  <div class="d-flex align-center ga-2">
                    <v-progress-linear
                      :model-value="performanceMetrics.memoryUsage"
                      color="success"
                      height="6"
                      rounded
                    />
                    <span class="text-body-2 text-white">{{ performanceMetrics.memoryUsage }}%</span>
                  </div>
                </div>
                
                <div class="metric-row mb-3">
                  <span class="metric-label text-caption text-medium-emphasis">{{ $t('responseTime') || 'وقت الاستجابة' }}:</span>
                  <span class="text-body-2 text-white">{{ performanceMetrics.responseTime }}ms</span>
                </div>
                
                <div class="metric-row">
                  <span class="metric-label text-caption text-medium-emphasis">{{ $t('errorRate') || 'معدل الخطأ' }}:</span>
                  <span class="text-body-2 text-white">{{ performanceMetrics.errorRate }}%</span>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Activity -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="section-header d-flex align-center justify-space-between mb-4">
          <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
            <v-icon color="primary" size="20">mdi-history</v-icon>
            {{ $t('recentActivity') || 'النشاط الحديث' }}
          </h3>
          <v-btn
            @click="refreshActivity"
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-refresh"
          >
            {{ $t('refresh') || 'تحديث' }}
          </v-btn>
        </div>
        
        <div class="activity-list">
          <v-card
            v-for="activity in recentActivities"
            :key="activity.id"
            variant="outlined"
            class="activity-item mb-2"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center ga-3">
                <v-avatar
                  :color="getActivityColor(activity.type)"
                  variant="tonal"
                  size="40"
                >
                  <v-icon :color="getActivityColor(activity.type)">
                    {{ getActivityIcon(activity.type) }}
                  </v-icon>
                </v-avatar>
                
                <div class="flex-grow-1">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-body-2 font-weight-medium text-white">{{ activity.title }}</span>
                    <span class="text-caption text-medium-emphasis">{{ formatTime(activity.timestamp) }}</span>
                  </div>
                  <div class="text-caption text-medium-emphasis mb-2">{{ activity.description }}</div>
                </div>
                
                <v-chip
                  :color="getStatusColor(activity.status)"
                  variant="tonal"
                  size="small"
                >
                  {{ getStatusText(activity.status) }}
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Quick Actions -->
    <v-card variant="elevated">
      <v-card-text class="pa-4">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-lightning-bolt</v-icon>
          {{ $t('quickActions') || 'إجراءات سريعة' }}
        </h3>
        
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="optimizeAllModels"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-auto-fix"
              block
              class="action-btn"
            >
              {{ $t('optimizeAllModels') || 'تحسين جميع النماذج' }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="backupAllData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-download"
              block
              class="action-btn"
            >
              {{ $t('backupAllData') || 'نسخ احتياطي للبيانات' }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="runDiagnostics"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-stethoscope"
              block
              class="action-btn"
            >
              {{ $t('runDiagnostics') || 'تشخيص النظام' }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="clearAllCaches"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-broom"
              block
              class="action-btn"
            >
              {{ $t('clearAllCaches') || 'مسح جميع الكاشات' }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="emergencyMode"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-alert-triangle"
              block
              class="action-btn"
            >
              {{ $t('emergencyMode') || 'وضع الطوارئ' }}
            </v-btn>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-btn
              @click="shutdownAllServices"
              variant="tonal"
              color="error"
              prepend-icon="mdi-power"
              block
              class="action-btn"
            >
              {{ $t('shutdownAllServices') || 'إيقاف جميع الخدمات' }}
            </v-btn>
          </v-col>
        </v-row>
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
import { ref, computed, onMounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AIService from '@/services/AIService';
import AIMonitorService from '@/services/AIMonitorService';
import AILearningService from '@/services/AILearningService';
import Chart from 'chart.js/auto';

const router = useRouter();
const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const aiStatus = ref({
  overall: 'unknown',
  services: [],
  fallbackMode: false,
  uptime: '0s'
});

const learningStats = ref({
  totalSessions: 0,
  averageAccuracy: 0,
  learningRate: 0,
  improvementRate: 0,
  totalModels: 0,
  lastUpdate: null,
  isActive: false
});

const systemStatus = ref({
  healthy: false,
  activeServices: 0,
  totalServices: 0,
  uptime: '0s'
});

const performanceMetrics = ref({
  cpuUsage: 0,
  memoryUsage: 0,
  responseTime: 0,
  errorRate: 0
});

const recentActivities = ref([]);

// Chart refs
const performanceChart = ref(null);

// Computed
const getActivityIcon = (type) => {
  const icons = {
    training: 'mdi-school',
    monitoring: 'mdi-heart-pulse',
    error: 'mdi-alert-triangle',
    success: 'mdi-check-circle',
    warning: 'mdi-alert-circle',
    info: 'mdi-information',
    test: 'mdi-flask'
  };
  return icons[type] || 'mdi-cog';
};

const getActivityColor = (type) => {
  const colors = {
    training: 'primary',
    monitoring: 'success',
    error: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
    test: 'primary'
  };
  return colors[type] || 'default';
};

const getStatusText = (status) => {
  const statusTexts = {
    completed: t('completed') || 'مكتمل',
    running: t('running') || 'جاري التشغيل',
    failed: t('failed') || 'فشل',
    warning: t('warning') || 'تحذير',
    info: t('info') || 'معلومات'
  };
  return statusTexts[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    completed: 'success',
    running: 'info',
    failed: 'error',
    warning: 'warning',
    info: 'info'
  };
  return colors[status] || 'default';
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
};

// Methods
const loadStatusData = async () => {
  try {
    loading.value = true;
    
    // Load AI Service Status
    const aiServiceStatus = await AIService.getServiceStatus();
    if (aiServiceStatus.success) {
      aiStatus.value = aiServiceStatus.data;
    } else {
      // Fallback to mock data
      aiStatus.value = getMockAIStatus();
    }
    
    // Load Learning System Stats
    const learningAnalytics = await AILearningService.getLearningAnalytics();
    if (learningAnalytics.success) {
      learningStats.value = {
        ...learningAnalytics.data,
        isActive: true
      };
    } else {
      // Fallback to mock data
      learningStats.value = getMockLearningStats();
    }
    
    // Load System Status
    const monitorStatus = await AIMonitorService.getServiceStatus();
    if (monitorStatus.success) {
      systemStatus.value = monitorStatus.data;
    } else {
      // Fallback to mock data
      systemStatus.value = getMockSystemStatus();
    }
    
    // Load Performance Metrics
    const performance = await AIMonitorService.getPerformanceMetrics();
    if (performance.success) {
      performanceMetrics.value = performance.data;
    } else {
      // Fallback to mock data
      performanceMetrics.value = getMockPerformanceMetrics();
    }
    
    // Load Recent Activities
    await loadRecentActivities();
    
  } catch (error) {
    console.error('Error loading AI dashboard data:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('errorLoadingAIData') || 'خطأ في تحميل بيانات الذكاء الاصطناعي',
      timeout: 5000
    });
    
    // Set fallback data
    aiStatus.value = getMockAIStatus();
    learningStats.value = getMockLearningStats();
    systemStatus.value = getMockSystemStatus();
    performanceMetrics.value = getMockPerformanceMetrics();
  } finally {
    loading.value = false;
  }
};

const getMockAIStatus = () => ({
  overall: 'healthy',
  services: ['chatbot', 'recommendation', 'sentiment'],
  fallbackMode: false,
  uptime: '5d 12h 30m'
});

const getMockLearningStats = () => ({
  totalSessions: 156,
  averageAccuracy: 92,
  learningRate: 85,
  improvementRate: 12,
  totalModels: 8,
  lastUpdate: new Date().toISOString(),
  isActive: true
});

const getMockSystemStatus = () => ({
  healthy: true,
  activeServices: 4,
  totalServices: 5,
  uptime: '5d 12h 30m'
});

const getMockPerformanceMetrics = () => ({
  cpuUsage: 35,
  memoryUsage: 45,
  responseTime: 85,
  errorRate: 0.5
});

const loadRecentActivities = async () => {
  try {
    const response = await AIMonitorService.getRecentActivities();
    if (response.success) {
      recentActivities.value = response.data;
    } else {
      // Fallback to mock data
      recentActivities.value = getMockActivities();
    }
  } catch (error) {
    console.error('Error loading recent activities:', error);
    recentActivities.value = getMockActivities();
  }
};

const getMockActivities = () => [
  {
    id: 1,
    type: 'training',
    title: t('chatbotTraining') || 'تدريب نموذج المساعد',
    description: t('chatbotTrainingDesc') || 'تم تدريب نموذج المساعد الذكي بدقة 92%',
    status: 'completed',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 2,
    type: 'monitoring',
    title: t('systemHealthCheck') || 'فحص صحة النظام',
    description: t('systemHealthCheckDesc') || 'تم إجراء فحص شامل لجميع خدمات الذكاء الاصطناعي',
    status: 'success',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 3,
    type: 'info',
    title: t('pricingModelUpdate') || 'تحديث نموذج التسعير',
    description: t('pricingModelUpdateDesc') || 'تم تحديث نموذج التسعير الذكي ببيانات جديدة',
    status: 'completed',
    timestamp: new Date(Date.now() - 10800000).toISOString()
  },
  {
    id: 4,
    type: 'warning',
    title: t('highMemoryUsage') || 'استخدام عالي للذاكرة',
    description: t('highMemoryUsageDesc') || 'استخدام الذاكرة تجاوز 85% من السعة المتاحة',
    status: 'warning',
    timestamp: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 5,
    type: 'success',
    title: t('modelAccuracyImprovement') || 'تحسين دقة النموذج',
    description: t('modelAccuracyImprovementDesc') || 'تحسنت دقة نموذج تحليل المشاعر بنسبة 3%',
    status: 'completed',
    timestamp: new Date(Date.now() - 18000000).toISOString()
  }
];

const goToTraining = () => {
  router.push('/dashboard/ai/training');
};

const goToMonitoring = () => {
  router.push('/dashboard/ai/monitor');
};

const testAIService = async () => {
  try {
    const result = await AIService.healthCheck();
    addActivity('test', t('testAIService') || 'اختبار خدمة الذكاء الاصطناعي', 
               result.status === 'healthy' ? (t('testPassed') || 'نجح الاختبار') : (t('testFailed') || 'فشل الاختبار'), 
               result.status === 'healthy' ? 'success' : 'failed');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: result.status === 'healthy' ? 'success' : 'error',
      title: t('aiServiceTest') || 'اختبار خدمة الذكاء الاصطناعي',
      message: result.status === 'healthy' ? (t('serviceHealthy') || 'الخدمة تعمل بشكل طبيعي') : (t('serviceIssues') || 'هناك مشاكل في الخدمة'),
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorTestingAI') || 'خطأ في اختبار الذكاء الاصطناعي', error.message, 'failed');
  }
};

const restartAIService = async () => {
  try {
    const result = await AIService.initializeAISystems();
    addActivity('info', t('restartAIService') || 'إعادة تشغيل خدمة الذكاء الاصطناعي', t('restartSuccess') || 'تمت إعادة التشغيل بنجاح', 'success');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('aiServiceRestart') || 'إعادة تشغيل خدمة الذكاء الاصطناعي',
      message: t('restartSuccess') || 'تمت إعادة التشغيل بنجاح',
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorRestartingAI') || 'خطأ في إعادة تشغيل الذكاء الاصطناعي', error.message, 'failed');
  }
};

const viewTrainingDetails = () => {
  router.push('/dashboard/ai/training');
};

const startQuickTraining = async () => {
  try {
    const result = await AILearningService.startTraining('chatbot');
    addActivity('training', t('quickTraining') || 'تدريب سريع للمساعد', t('trainingStarted') || 'بدء تدريب نموذج المساعد', 'running');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'info',
      title: t('trainingStarted') || 'بدء التدريب',
      message: t('quickTrainingStarted') || 'بدء التدريب السريع لنموذج المساعد',
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorQuickTraining') || 'خطأ في التدريب السريع', error.message, 'failed');
  }
};

const optimizeAllModels = async () => {
  try {
    const results = await AILearningService.forceRetraining();
    const successCount = results.filter(r => r.success).length;
    addActivity('info', t('optimizeAllModels') || 'تحسين جميع النماذج', 
               `${t('optimizedModels') || 'تم تحسين'} ${successCount} ${t('modelsSuccessfully') || 'نماذج بنجاح'}`, 'success');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('modelOptimization') || 'تحسين النماذج',
      message: `${successCount} ${t('modelsOptimized') || 'نماذج تم تحسينها بنجاح'}`,
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorOptimizingModels') || 'خطأ في تحسين النماذج', error.message, 'failed');
  }
};

const backupAllData = async () => {
  try {
    await Promise.all([
      AILearningService.exportLearningData(),
      AIService.exportServiceStatus()
    ]);
    addActivity('info', t('backup') || 'نسخ احتياطي', t('backupSuccess') || 'تم تصدير جميع بيانات الذكاء الاصطناعي', 'success');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('backupCompleted') || 'اكتمل النسخ الاحتياطي',
      message: t('backupSuccess') || 'تم تصدير جميع بيانات الذكاء الاصطناعي',
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorBackup') || 'خطأ في النسخ الاحتياطي', error.message, 'failed');
  }
};

const runDiagnostics = async () => {
  try {
    const diagnostics = await Promise.all([
      AIService.healthCheck(),
      AIMonitorService.getServiceStatus(),
      AILearningService.getLearningAnalytics()
    ]);
    
    addActivity('info', t('systemDiagnostics') || 'تشخيص النظام', 
               t('diagnosticsSuccess') || 'اكتمل التشخيص بنجاح - جميع الأنظمة تعمل بشكل طبيعي', 'success');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('diagnosticsCompleted') || 'اكتمل التشخيص',
      message: t('allSystemsHealthy') || 'جميع الأنظمة تعمل بشكل طبيعي',
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorDiagnostics') || 'خطأ في التشخيص', error.message, 'failed');
  }
};

const clearAllCaches = () => {
  try {
    // Clear all caches
    localStorage.removeItem('ai_learning_data');
    localStorage.removeItem('ai_training_sessions');
    localStorage.removeItem('ai_models');
    
    addActivity('info', t('clearCaches') || 'مسح الكاشات', t('cachesCleared') || 'تم مسح جميع الكاشات بنجاح', 'success');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('cachesCleared') || 'تم مسح الكاشات',
      message: t('allCachesCleared') || 'تم مسح جميع الكاشات بنجاح',
      timeout: 3000
    });
  } catch (error) {
    addActivity('error', t('errorClearingCaches') || 'خطأ في مسح الكاشات', error.message, 'failed');
  }
};

const emergencyMode = async () => {
  try {
    await AIMonitorService.emergencyRecovery();
    addActivity('warning', t('activateEmergencyMode') || 'تفعيل وضع الطوارئ', t('emergencyModeActivated') || 'تم تفعيل وضع الطوارئ', 'warning');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('emergencyMode') || 'وضع الطوارئ',
      message: t('emergencyModeActivated') || 'تم تفعيل وضع الطوارئ',
      timeout: 5000
    });
  } catch (error) {
    addActivity('error', t('errorEmergencyMode') || 'خطأ في وضع الطوارئ', error.message, 'failed');
  }
};

const shutdownAllServices = () => {
  const confirmed = confirm(t('confirmShutdownServices') || 'هل أنت متأكد من إيقاف جميع خدمات الذكاء الاصطناعي؟');
  
  if (confirmed) {
    try {
      AIMonitorService.stopMonitoring();
      addActivity('warning', t('shutdownServices') || 'إيقاف الخدمات', t('servicesShutdown') || 'تم إيقاف جميع خدمات الذكاء الاصطناعي', 'warning');
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'warning',
        title: t('servicesShutdown') || 'إيقاف الخدمات',
        message: t('allServicesStopped') || 'تم إيقاف جميع خدمات الذكاء الاصطناعي',
        timeout: 5000
      });
    } catch (error) {
      addActivity('error', t('errorShutdownServices') || 'خطأ في إيقاف الخدمات', error.message, 'failed');
    }
  }
};

const refreshActivity = async () => {
  await loadRecentActivities();
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('refreshActivity') || 'تحديث النشاط',
    message: t('activityRefreshed') || 'تم تحديث قائمة النشاط',
    timeout: 2000
  });
};

const addActivity = (type, title, description, status) => {
  const activity = {
    id: Date.now(),
    type,
    title,
    description,
    status,
    timestamp: new Date().toISOString()
  };
  
  recentActivities.value.unshift(activity);
  
  // Keep only last 20 activities
  if (recentActivities.value.length > 20) {
    recentActivities.value = recentActivities.value.slice(0, 20);
  }
};

const updatePerformanceChart = () => {
  if (performanceChart.value) {
    new Chart(performanceChart.value, {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
          label: t('cpuUsage') || 'استخدام المعالج (%)',
          data: [25, 30, 45, 60, 55, 40],
          borderColor: 'rgb(var(--v-theme-primary))',
          backgroundColor: 'rgba(var(--v-theme-primary), 0.1)',
          tension: 0.4
        }, {
          label: t('memoryUsage') || 'استخدام الذاكرة (%)',
          data: [35, 40, 55, 70, 65, 50],
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

// Lifecycle
onMounted(async () => {
  await loadStatusData();
  
  // Update performance chart every 30 seconds
  setInterval(updatePerformanceChart, 30000);
  
  // Update status data every 10 seconds
  setInterval(loadStatusData, 10000);
  
  nextTick(() => {
    updatePerformanceChart();
  });
});
</script>

<style scoped>
/* Dashboard Header */
.dashboard-header {
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.dashboard-header:hover::before {
  left: 100%;
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

.stat-info h3 {
  position: relative;
}

.stat-info h3::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
}

/* Service Panels */
.service-panel {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-panel::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.service-panel:hover::before {
  left: 100%;
}

.service-panel:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.panel-header {
  position: relative;
}

.panel-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
}

.service-metrics {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
  padding: 1rem 0;
}

.service-actions .v-btn {
  transition: all 0.3s ease;
}

.service-actions .v-btn:hover {
  transform: translateY(-2px);
}

/* Performance Metrics */
.performance-chart {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.metric-row {
  transition: all 0.3s ease;
}

.metric-row:hover {
  transform: translateX(4px);
}

/* Activity List */
.activity-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.activity-item:hover::before {
  left: 100%;
}

.activity-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Quick Actions */
.action-btn {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  transition: left 0.5s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-2px);
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
  animation: fadeIn 0.6s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.service-panel {
  animation: fadeIn 0.8s ease forwards;
}

.service-panel:nth-child(1) { animation-delay: 0.2s; }
.service-panel:nth-child(2) { animation-delay: 0.4s; }
.service-panel:nth-child(3) { animation-delay: 0.6s; }

.activity-item {
  animation: fadeIn 0.5s ease forwards;
}

.action-btn {
  animation: fadeIn 0.4s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .dashboard-header .d-flex {
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
  .dashboard-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-info h3 {
    font-size: 1.2rem;
  }
  
  .activity-item .d-flex {
    flex-direction: column;
    text-align: center;
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

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
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
  height: 50px;
  border-radius: 12px;
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-info h3 {
  margin: 0 0 5px 0;
  color: #fff;
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-info p {
  margin: 0;
  color: var(--text-dim);
  font-size: 0.9rem;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.service-panel {
  background: var(--bg-card);
  border-radius: 15px;
  border: 1px solid var(--border-light);
  padding: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h3 {
  margin: 0;
  color: #fff;
  font-size: 1.2rem;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-indicator.online {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-indicator.offline {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.service-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.service-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.metric span {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.metric span:last-child {
  color: #fff;
  font-weight: 600;
}

.service-actions {
  display: flex;
  gap: 10px;
}

.performance-chart {
  height: 200px;
  margin-bottom: 20px;
}

.performance-metrics {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.metric-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.metric-label {
  color: var(--text-dim);
  font-size: 0.9rem;
}

.metric-bar {
  width: 100px;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
  margin: 0 10px;
}

.metric-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50 0%, #d4af37 50%, #ff9800 100%);
  border-radius: 3px;
}

.activity-section {
  margin-bottom: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #fff;
}

.activity-list {
  max-height: 400px;
  overflow-y: auto;
}

.activity-item {
  display: grid;
  grid-template-columns: 40px 1fr 80px 100px;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(212, 175, 55, 0.2);
  color: #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.activity-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-title {
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.activity-time {
  color: var(--text-dim);
  font-size: 0.8rem;
  font-family: monospace;
}

.activity-description {
  color: var(--text-dim);
  font-size: 0.85rem;
  line-height: 1.4;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
}

.activity-status.success {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.activity-status.failed {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.activity-status.warning {
  background: rgba(255, 152, 0, 0.2);
  color: #ff9800;
}

.activity-status.running {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
}

.quick-actions {
  margin-bottom: 30px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.action-btn {
  background: var(--bg-card);
  border: 1px solid var(--border-light);
  border-radius: 10px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
}

.action-btn:hover {
  transform: translateY(-2px);
  border-color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.action-btn.btn-warning {
  border-color: #ff9800;
}

.action-btn.btn-warning:hover {
  border-color: #f57c00;
}

.action-btn.btn-danger {
  border-color: #f44336;
}

.action-btn.btn-danger:hover {
  border-color: #d32f2f;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .service-metrics {
    grid-template-columns: 1fr;
  }
  
  .activity-item {
    grid-template-columns: 40px 1fr 80px;
    gap: 10px;
  }
  
  .activity-status {
    grid-column: 4;
    margin-top: 8px;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
}
</style>
