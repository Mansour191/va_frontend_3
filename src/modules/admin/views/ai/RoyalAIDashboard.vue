<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 royal-header">
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
              @click="refreshData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
            <v-btn
              @click="exportReport"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-download"
            >
              {{ $t('exportReport') || 'تصدير التقرير' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-20">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis">{{ $t('loadingAIData') || 'جاري تحميل بيانات الذكاء الاصطناعي...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Quick Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="(stat, index) in quickStats"
          :key="index"
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
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.label }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- AI Services Grid -->
      <v-row class="mb-6">
        <v-col cols="12" md="6" lg="4">
          <v-card variant="elevated" class="service-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
                  <v-icon color="primary" size="20">mdi-brain</v-icon>
                  {{ $t('aiService') || 'خدمة الذكاء الاصطناعي' }}
                </h3>
                <v-chip
                  :color="aiStatus.overall === 'healthy' ? 'success' : 'warning'"
                  variant="dot"
                  size="small"
                >
                  {{ aiStatus.overall === 'healthy' ? $t('healthy') || 'سليم' : $t('warning') || 'تحذير' }}
                </v-chip>
              </div>
              
              <div class="space-y-3">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('subServices') || 'الخدمات الفرعية' }}</span>
                  <span class="text-body-2 font-weight-medium text-white">{{ aiStatus.services?.length || 0 }}</span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('systemMode') || 'نظام التشغيل' }}</span>
                  <span class="text-body-2 font-weight-medium text-white">
                    {{ aiStatus.fallbackMode ? ($t('fallback') || 'احتياطي') : ($t('primary') || 'أساسي') }}
                  </span>
                </div>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('uptime') || 'وقت التشغيل' }}</span>
                  <span class="text-body-2 font-weight-medium text-white">{{ aiStatus.uptime || '0s' }}</span>
                </div>
              </div>

              <div class="d-flex ga-2 mt-4">
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
                  {{ $t('restart') || 'إعادة تشغيل' }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Learning System Status -->
        <v-col cols="12" md="6" lg="4">
          <v-card variant="elevated" class="service-card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-marble-900">
              <i class="fas fa-graduation-cap mr-2 text-gold-500"></i>
              نظام التعلم
            </h3>
            <div
              class="w-3 h-3 rounded-full"
              :class="learningStats.isActive ? 'bg-green-500 pulse-live' : 'bg-charcoal/60'"
            ></div>
          </div>
          
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-marble-600">معدل التعلم</span>
              <span class="font-medium text-marble-900">{{ learningStats.learningRate || 0 }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-marble-600">التحسين</span>
              <span class="font-medium text-marble-900">{{ learningStats.improvementRate || 0 }}%</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-marble-600">النماذج</span>
              <span class="font-medium text-marble-900">{{ learningStats.totalModels || 0 }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-marble-600">آخر تحديث</span>
              <span class="font-medium text-marble-900 text-sm">
                {{ formatTime(learningStats.lastUpdate) }}
              </span>
            </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button
              icon="fas fa-chart-bar"
              label="التفاصيل"
              class="p-button-outlined p-button-sm p-button-royal"
              @click="viewTrainingDetails"
            />
            <Button
              icon="fas fa-play"
              label="تدريب سريع"
              class="p-button-outlined p-button-sm p-button-gold"
              @click="startQuickTraining"
            />
          </div>
        </div>

        <!-- Performance Monitor -->
        <div
          class="card-royal"
          v-motion="fadeUpVariants"
        >
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-marble-900">
              <i class="fas fa-tachometer-alt mr-2 text-royal-600"></i>
              مراقبة الأداء
            </h3>
            <div
              class="w-3 h-3 rounded-full"
              :class="systemStatus.healthy ? 'bg-green-500 pulse-live' : 'bg-yellow-500'"
            ></div>
          </div>
          
          <div class="space-y-3">
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-marble-600 text-sm">استخدام المعالج</span>
                <span class="font-medium text-marble-900 text-sm">{{ performanceMetrics.cpuUsage || 0 }}%</span>
              </div>
              <div class="bg-marble-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-royal-500 to-gold-500 h-2 rounded-full"
                  :style="{ width: (performanceMetrics.cpuUsage || 0) + '%' }"
                ></div>
              </div>
            </div>
            
            <div>
              <div class="flex justify-between items-center mb-1">
                <span class="text-marble-600 text-sm">استخدام الذاكرة</span>
                <span class="font-medium text-marble-900 text-sm">{{ performanceMetrics.memoryUsage || 0 }}%</span>
              </div>
              <div class="bg-marble-200 rounded-full h-2">
                <div
                  class="bg-gradient-to-r from-royal-500 to-gold-500 h-2 rounded-full"
                  :style="{ width: (performanceMetrics.memoryUsage || 0) + '%' }"
                ></div>
              </div>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-marble-600 text-sm">وقت الاستجابة</span>
              <span class="font-medium text-marble-900 text-sm">{{ performanceMetrics.responseTime || 0 }}ms</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-marble-600 text-sm">معدل الخطأ</span>
              <span class="font-medium text-marble-900 text-sm">{{ performanceMetrics.errorRate || 0 }}%</span>
            </div>
          </div>

          <div class="mt-4">
            <Button
              icon="fas fa-chart-line"
              label="عرض الرسوم البيانية"
              class="p-button-outlined p-button-sm p-button-royal w-full"
              @click="showPerformanceCharts"
            />
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div
        class="card-royal"
        v-motion="fadeUpVariants"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-marble-900">
            <i class="fas fa-clock mr-2 text-royal-600"></i>
            النشاط الأخير
          </h3>
          <Button
            icon="fas fa-sync"
            class="p-button-outlined p-button-sm p-button-royal"
            @click="refreshActivity"
          />
        </div>
        
        <div class="space-y-3">
          <div
            v-for="(activity, index) in recentActivities"
            :key="activity.id"
            class="flex items-center justify-between p-3 rounded-xl bg-marble-50/50 border border-marble-200"
            v-motion="{
              initial: { opacity: 0, x: -20 },
              enter: {
                opacity: 1,
                x: 0,
                transition: {
                  delay: index * 50,
                  duration: 300
                }
              }
            }"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center"
                :class="getActivityIconBg(activity.type)"
              >
                <i :class="getActivityIcon(activity.type)" class="text-white"></i>
              </div>
              <div>
                <p class="font-medium text-marble-900">{{ activity.title }}</p>
                <p class="text-sm text-marble-600">{{ activity.description }}</p>
              </div>
            </div>
            <div class="text-left">
              <span class="text-sm text-marble-500">{{ formatTime(activity.timestamp) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div
        class="card-royal"
        v-motion="fadeUpVariants"
      >
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-marble-900">
            <i class="fas fa-bolt mr-2 text-gold-500"></i>
            الإجراءات السريعة
          </h3>
        </div>
        
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Button
            v-for="action in quickActions"
            :key="action.id"
            :icon="action.icon"
            :label="action.label"
            class="p-button-outlined p-button-royal flex flex-col items-center justify-center h-20 space-y-2"
            :class="action.class"
            @click="action.handler"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AIService from '@/services/AIService';
import AILearningService from '@/services/AILearningService';
import AIMonitorService from '@/services/AIMonitorService';
import Chart from 'chart.js/auto';

const { t } = useI18n();
const store = useStore();

// State
const isLoading = ref(false);
const aiStatus = ref({
  overall: 'healthy',
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

const recentActivities = ref([
  {
    id: 1,
    type: 'training',
    title: t('assistantModelTraining') || 'تدريب نموذج المساعد',
    description: t('assistantModelTrained') || 'تم تدريب نموذج المساعد الذكي بدقة 92%',
    timestamp: new Date(Date.now() - 1000 * 60 * 5)
  },
  {
    id: 2,
    type: 'optimization',
    title: t('algorithmOptimization') || 'تحسين الخوارزميات',
    description: t('pricingAlgorithmOptimized') || 'تم تحسين خوارزمية التسعير بنسبة 15%',
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    id: 3,
    type: 'monitoring',
    title: t('systemCheck') || 'فحص النظام',
    description: t('servicesHealthCheckCompleted') || 'اكتمل فحص صحة جميع الخدمات بنجاح',
    timestamp: new Date(Date.now() - 1000 * 60 * 30)
  }
]);

// Chart refs
const performanceChart = ref(null);
const learningChart = ref(null);

// Computed
const quickStats = computed(() => [
  {
    label: t('activeModels') || 'النماذج النشطة',
    value: learningStats.value.totalModels || 4,
    icon: 'mdi-brain',
    color: 'primary'
    icon: 'fas fa-brain',
    iconBg: 'bg-gradient-to-r from-royal-600 to-royal-700',
    changeLabel: 'معدل الاستجابة',
    change: '+2.3%',
    changeColor: 'text-green-600',
    progress: '85%',
    progressColor: 'bg-gradient-to-r from-royal-500 to-royal-600'
  },
  {
    label: 'جلسات التدريب',
    value: learningStats.value.totalSessions || 0,
    icon: 'fas fa-graduation-cap',
    iconBg: 'bg-gradient-to-r from-gold-500 to-gold-600',
    changeLabel: 'هذا الأسبوع',
    change: '+12',
    changeColor: 'text-green-600',
    progress: '72%',
    progressColor: 'bg-gradient-to-r from-gold-500 to-gold-600'
  },
  {
    label: 'متوسط دقة النماذج',
    value: `${learningStats.value.averageAccuracy || 0}%`,
    icon: 'fas fa-chart-line',
    iconBg: 'bg-gradient-to-r from-royal-600 to-gold-500',
    changeLabel: 'تحسن',
    change: '+5.2%',
    changeColor: 'text-green-600',
    progress: '91%',
    progressColor: 'bg-gradient-to-r from-royal-500 to-gold-500'
  },
  {
    label: 'الخدمات النشطة',
    value: `${systemStatus.value.activeServices || 0}/${systemStatus.value.totalServices || 0}`,
    icon: 'fas fa-cogs',
    iconBg: 'bg-gradient-to-r from-green-500 to-green-600',
    changeLabel: 'التشغيل',
    change: '100%',
    changeColor: 'text-green-600',
    progress: '100%',
    progressColor: 'bg-gradient-to-r from-green-500 to-green-600'
  }
]);

const quickActions = [
  {
    id: 1,
    icon: 'fas fa-magic',
    label: 'تحسين النماذج',
    handler: optimizeAllModels
  },
  {
    id: 2,
    icon: 'fas fa-download',
    label: 'نسخ احتياطي',
    handler: backupAllData
  },
  {
    id: 3,
    icon: 'fas fa-stethoscope',
    label: 'تشخيص',
    handler: runDiagnostics
  },
  {
    id: 4,
    icon: 'fas fa-broom',
    label: 'مسح الكاش',
    handler: clearAllCaches
  },
  {
    id: 5,
    icon: 'fas fa-exclamation-triangle',
    label: 'وضع الطوارئ',
    handler: emergencyMode,
    class: 'p-button-danger'
  },
  {
    id: 6,
    icon: 'fas fa-power-off',
    label: 'إيقاف الخدمات',
    handler: shutdownAllServices,
    class: 'p-button-danger'
  }
];

// Methods
const loadStatusData = async () => {
  try {
    const aiServiceStatus = AIService.getServiceStatus();
    aiStatus.value = aiServiceStatus || {
      overall: 'unknown',
      services: [],
      fallbackMode: false,
      uptime: '0s'
    };
    
    const learningAnalytics = AILearningService.getLearningAnalytics();
    learningStats.value = {
      totalSessions: learningAnalytics.totalTrainingSessions || 0,
      averageAccuracy: Math.round((learningAnalytics.averageAccuracy || 0) * 100),
      learningRate: Math.round((learningAnalytics.learningRate || 0) * 100),
      improvementRate: Math.round((learningAnalytics.learningRate || 0) * 100),
      totalModels: learningAnalytics.modelVersions ? Object.keys(learningAnalytics.modelVersions).length : 0,
      lastUpdate: learningAnalytics.lastUpdate,
      isActive: true
    };
    
    const monitorStatus = AIMonitorService.getServiceStatus();
    systemStatus.value = monitorStatus || {
      healthy: false,
      activeServices: 0,
      totalServices: 0,
      uptime: '0s'
    };
    
    performanceMetrics.value = {
      cpuUsage: Math.random() * 30 + 20,
      memoryUsage: Math.random() * 40 + 30,
      responseTime: Math.random() * 100 + 50,
      errorRate: Math.random() * 2
    };
    
  } catch (error) {
    console.error('Error loading AI dashboard data:', error);
  } finally {
    isLoading.value = false;
  }
};

const refreshData = async () => {
  isLoading.value = true;
  await loadStatusData();
};

const formatTime = (timestamp) => {
  if (!timestamp) return '--:--';
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp));
};

const getActivityIcon = (type) => {
  const icons = {
    training: 'fas fa-graduation-cap',
    optimization: 'fas fa-chart-line',
    monitoring: 'fas fa-heartbeat',
    error: 'fas fa-exclamation-triangle'
  };
  return icons[type] || 'fas fa-info-circle';
};

const getActivityIconBg = (type) => {
  const backgrounds = {
    training: 'bg-gradient-to-r from-gold-500 to-gold-600',
    optimization: 'bg-gradient-to-r from-royal-500 to-royal-600',
    monitoring: 'bg-gradient-to-r from-green-500 to-green-600',
    error: 'bg-gradient-to-r from-red-500 to-red-600'
  };
  return backgrounds[type] || 'bg-gradient-to-r from-charcoal to-charcoal/80';
};

// Action handlers
const testAIService = () => {
  console.log('Testing AI Service...');
};

const restartAIService = () => {
  console.log('Restarting AI Service...');
};

const viewTrainingDetails = () => {
  console.log('Viewing training details...');
};

const startQuickTraining = () => {
  console.log('Starting quick training...');
};

const showPerformanceCharts = () => {
  console.log('Showing performance charts...');
};

const refreshActivity = () => {
  console.log('Refreshing activity...');
};

const optimizeAllModels = () => {
  console.log('Optimizing all models...');
};

const backupAllData = () => {
  console.log('Backing up all data...');
};

const runDiagnostics = () => {
  console.log('Running diagnostics...');
};

const clearAllCaches = () => {
  console.log('Clearing all caches...');
};

const emergencyMode = () => {
  console.log('Entering emergency mode...');
};

const shutdownAllServices = () => {
  console.log('Shutting down all services...');
};

const exportReport = () => {
  console.log('Exporting report...');
};

onMounted(() => {
  loadStatusData();
});
</script>

<style scoped>
/* Royal Header */
.royal-header {
  position: relative;
  overflow: hidden;
}

.royal-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.royal-header:hover::before {
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

/* Service Cards */
.service-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.service-card:hover::before {
  left: 100%;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Activity Cards */
.activity-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.activity-card:hover::before {
  left: 100%;
}

.activity-card:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Chart Cards */
.chart-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.chart-card:hover::before {
  left: 100%;
}

.chart-card:hover {
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
  animation: fadeIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.service-card {
  animation: fadeIn 0.6s ease forwards;
}

.service-card:nth-child(1) { animation-delay: 0.1s; }
.service-card:nth-child(2) { animation-delay: 0.2s; }
.service-card:nth-child(3) { animation-delay: 0.3s; }

.activity-card {
  animation: fadeIn 0.3s ease forwards;
}

.chart-card {
  animation: fadeIn 0.5s ease forwards;
}

.chart-card:nth-child(1) { animation-delay: 0.1s; }
.chart-card:nth-child(2) { animation-delay: 0.2s; }

/* Responsive Design */
@media (max-width: 960px) {
  .royal-header .d-flex {
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
  .royal-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .service-card {
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
</style>
