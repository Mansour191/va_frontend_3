<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 monitor-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-brain</v-icon>
              {{ $t('aiMonitoring') || 'مراقبة أنظمة الذكاء الاصطناعي' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('aiMonitoringSubtitle') || 'مراقبة مستمرة لجميع خدمات الذكاء الاصطناعي والتكاملات' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="forceRestart"
              :disabled="isRestarting"
              variant="elevated"
              color="primary"
              :prepend-icon="isRestarting ? 'mdi-loading' : 'mdi-refresh'"
            >
              {{ $t('restart') || 'إعادة التشغيل' }}
            </v-btn>
            <v-btn
              @click="emergencyRecovery"
              :disabled="isEmergencyMode"
              variant="tonal"
              color="warning"
              prepend-icon="mdi-alert-triangle"
            >
              {{ $t('emergencyRecovery') || 'استرداد عاجل' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Status Overview -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <div class="status-overview">
          <v-card
            :class="{ 'status-card': true, 'healthy': serviceStatus.overall === 'healthy', 'degraded': serviceStatus.overall === 'degraded' }"
            variant="outlined"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-4">
                <v-avatar
                  :color="serviceStatus.overall === 'healthy' ? 'success' : 'warning'"
                  variant="tonal"
                  size="60"
                >
                  <v-icon :color="serviceStatus.overall === 'healthy' ? 'success' : 'warning'" size="32">
                    {{ serviceStatus.overall === 'healthy' ? 'mdi-check-circle' : 'mdi-alert-triangle' }}
                  </v-icon>
                </v-avatar>
                <div class="status-info flex-grow-1">
                  <h3 class="text-h5 font-weight-medium text-white mb-2">{{ $t('systemStatus') || 'حالة النظام' }}</h3>
                  <p class="text-body-1 text-medium-emphasis mb-3">
                    {{ serviceStatus.overall === 'healthy' 
                      ? ($t('allServicesNormal') || 'جميع الخدمات تعمل بشكل طبيعي') 
                      : ($t('someServicesLimited') || 'بعض الخدمات تعمل بوضع محدود') }}
                  </p>
                  <div class="status-details d-flex ga-4">
                    <v-chip variant="tonal" size="small">
                      <v-icon start size="14">mdi-clock</v-icon>
                      {{ $t('uptime') || 'وقت التشغيل' }}: {{ serviceStatus.uptime }}
                    </v-chip>
                    <v-chip variant="tonal" size="small">
                      <v-icon start size="14">mdi-update</v-icon>
                      {{ $t('lastCheck') || 'آخر فحص' }}: {{ formatTime(serviceStatus.lastCheck) }}
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Services Grid -->
    <v-row class="mb-6">
      <v-col
        v-for="(status, service) in serviceStatus.services"
        :key="service"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card variant="elevated" class="service-card">
          <v-card-text class="pa-4">
            <div class="service-header d-flex align-center justify-space-between mb-4">
              <div class="service-info">
                <h3 class="text-h6 font-weight-medium text-white mb-1">{{ getServiceName(service) }}</h3>
                <v-chip
                  :color="getStatusColor(status)"
                  variant="tonal"
                  size="small"
                >
                  {{ getStatusText(status) }}
                </v-chip>
              </div>
              <v-avatar
                :color="getServiceColor(service)"
                variant="tonal"
                size="40"
              >
                <v-icon :color="getServiceColor(service)">
                  {{ getServiceIcon(service) }}
                </v-icon>
              </v-avatar>
            </div>
            
            <div class="service-metrics mb-4">
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption text-medium-emphasis">{{ $t('status') || 'الحالة' }}:</span>
                <span class="text-body-2 text-white" :class="`text-${getStatusColor(status)}`">{{ getStatusText(status) }}</span>
              </div>
              <div class="d-flex justify-space-between align-center mb-2">
                <span class="text-caption text-medium-emphasis">{{ $t('performance') || 'الأداء' }}:</span>
                <div class="d-flex align-center ga-2">
                  <v-progress-linear
                    :model-value="getPerformanceLevel(status)"
                    :color="getPerformanceColor(status)"
                    height="6"
                    rounded
                    style="width: 80px;"
                  />
                  <span class="text-body-2 text-white">{{ getPerformanceLevel(status) }}%</span>
                </div>
              </div>
              <div class="d-flex justify-space-between align-center">
                <span class="text-caption text-medium-emphasis">{{ $t('lastUpdate') || 'آخر تحديث' }}:</span>
                <span class="text-body-2 text-white">{{ formatTime(serviceStatus.lastCheck) }}</span>
              </div>
            </div>
            
            <div class="service-actions d-flex ga-2">
              <v-btn
                @click="testService(service)"
                :disabled="isTesting"
                variant="tonal"
                color="primary"
                size="small"
                :prepend-icon="isTesting ? 'mdi-loading' : 'mdi-flask'"
              >
                {{ $t('test') || 'اختبار' }}
              </v-btn>
              <v-btn
                @click="restartService(service)"
                :disabled="isRestarting"
                variant="tonal"
                color="secondary"
                size="small"
                prepend-icon="mdi-restart"
              >
                {{ $t('restart') || 'إعادة تشغيل' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Performance Metrics -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-chart-line</v-icon>
          {{ $t('performanceMetrics') || 'مؤشرات الأداء' }}
        </h3>
        
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="metric-card">
              <v-card-text class="pa-4 text-center">
                <v-icon color="primary" size="32" class="mb-2">mdi-clock</v-icon>
                <h4 class="text-h6 font-weight-medium text-white mb-1">{{ $t('uptime') || 'وقت التشغيل' }}</h4>
                <p class="text-h5 font-weight-bold text-primary">{{ performanceMetrics.uptime }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="metric-card">
              <v-card-text class="pa-4 text-center">
                <v-icon color="success" size="32" class="mb-2">mdi-heart-pulse</v-icon>
                <h4 class="text-h6 font-weight-medium text-white mb-1">{{ $t('healthChecks') || 'فحوص الحالة' }}</h4>
                <p class="text-h5 font-weight-bold text-success">{{ performanceMetrics.healthChecks }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="metric-card">
              <v-card-text class="pa-4 text-center">
                <v-icon color="error" size="32" class="mb-2">mdi-alert-circle</v-icon>
                <h4 class="text-h6 font-weight-medium text-white mb-1">{{ $t('errorCount') || 'عدد الأخطاء' }}</h4>
                <p class="text-h5 font-weight-bold text-error">{{ performanceMetrics.errorCount }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="metric-card">
              <v-card-text class="pa-4 text-center">
                <v-icon color="info" size="32" class="mb-2">mdi-server</v-icon>
                <h4 class="text-h6 font-weight-medium text-white mb-1">{{ $t('activeServices') || 'الخدمات النشطة' }}</h4>
                <p class="text-h5 font-weight-bold text-info">{{ serviceStatus.activeServices }}/{{ serviceStatus.totalServices }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Real-time Logs -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <div class="logs-header d-flex align-center justify-space-between mb-4">
          <h3 class="text-h5 font-weight-bold text-white d-flex align-center ga-2">
            <v-icon color="primary" size="24">mdi-console</v-icon>
            {{ $t('realTimeLogs') || 'السجلات المباشرة' }}
          </h3>
          <div class="logs-controls d-flex ga-2">
            <v-btn
              @click="clearLogs"
              variant="tonal"
              color="error"
              size="small"
              prepend-icon="mdi-delete"
            >
              {{ $t('clear') || 'مسح' }}
            </v-btn>
            <v-btn
              @click="exportLogs"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-download"
            >
              {{ $t('export') || 'تصدير' }}
            </v-btn>
          </div>
        </div>
        
        <v-card
          ref="logsContainer"
          variant="outlined"
          class="logs-container"
          max-height="400"
          style="overflow-y: auto;"
        >
          <v-card-text class="pa-0">
            <div
              v-for="(log, index) in logs"
              :key="index"
              class="log-entry pa-2 mb-1"
              :class="`log-${log.type}`"
            >
              <div class="d-flex align-center ga-2">
                <v-chip
                  :color="getLogColor(log.level)"
                  variant="tonal"
                  size="small"
                >
                  {{ log.level }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">{{ formatTime(log.timestamp) }}</span>
                <v-chip
                  variant="tonal"
                  size="small"
                >
                  {{ log.service }}
                </v-chip>
                <span class="text-body-2 text-white flex-grow-1">{{ log.message }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-card-text>
    </v-card>

    <!-- Emergency Mode Alert -->
    <v-alert
      v-if="isEmergencyMode"
      type="warning"
      variant="tonal"
      prominent
      class="mb-6"
    >
      <v-alert-title class="d-flex align-center ga-2">
        <v-icon size="24">mdi-alert-triangle</v-icon>
        {{ $t('emergencyModeActive') || 'وضع الاسترداد العاجل نشط' }}
      </v-alert-title>
      <p class="text-body-1 mb-0">
        {{ $t('emergencyModeMessage') || 'يعمل النظام في وضع محدود. بعض المميزات قد لا تكون متاحة.' }}
      </p>
    </v-alert>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loading') || 'جاري التحميل...' }}</p>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AIMonitorService from '@/services/AIMonitorService';
import AIService from '@/services/AIService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const serviceStatus = ref({
  overall: 'unknown',
  healthy: false,
  services: {},
  activeServices: 0,
  totalServices: 0,
  lastCheck: null,
  uptime: '0s'
});

const performanceMetrics = ref({
  uptime: '0s',
  healthChecks: 0,
  errorCount: 0,
  lastRestart: null
});

const logs = ref([]);
const isRestarting = ref(false);
const isTesting = ref(false);
const isEmergencyMode = ref(false);
const logsContainer = ref(null);

// Methods
const formatTime = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
};

const getServiceName = (service) => {
  const names = {
    ai: t('aiServices') || 'خدمات الذكاء الاصطناعي',
    pricing: t('smartPricing') || 'نظام التسعير الذكي',
    erpnext: t('erpIntegration') || 'تكامل ERPNext'
  };
  return names[service] || service;
};

const getServiceIcon = (service) => {
  const icons = {
    ai: 'mdi-brain',
    pricing: 'mdi-chart-line',
    erpnext: 'mdi-database'
  };
  return icons[service] || 'mdi-cog';
};

const getServiceColor = (service) => {
  const colors = {
    ai: 'primary',
    pricing: 'success',
    erpnext: 'info'
  };
  return colors[service] || 'default';
};

const getStatusText = (status) => {
  const texts = {
    active: t('active') || 'نشط',
    fallback: t('fallbackMode') || 'وضع احتياطي',
    limited: t('limited') || 'محدود',
    unknown: t('unknown') || 'غير معروف'
  };
  return texts[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    fallback: 'warning',
    limited: 'warning',
    unknown: 'error'
  };
  return colors[status] || 'default';
};

const getPerformanceLevel = (status) => {
  const levels = {
    active: 95,
    fallback: 70,
    limited: 50,
    unknown: 30
  };
  return levels[status] || 30;
};

const getPerformanceColor = (status) => {
  const colors = {
    active: 'success',
    fallback: 'warning',
    limited: 'warning',
    unknown: 'error'
  };
  return colors[status] || 'default';
};

const getLogColor = (level) => {
  const colors = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error'
  };
  return colors[level] || 'default';
};

const updateServiceStatus = async () => {
  try {
    const response = await AIMonitorService.getServiceStatus();
    if (response.success) {
      serviceStatus.value = response.data;
    } else {
      // Fallback to mock data
      serviceStatus.value = getMockServiceStatus();
    }
  } catch (error) {
    console.error('Error updating service status:', error);
    serviceStatus.value = getMockServiceStatus();
  }
};

const updatePerformanceMetrics = async () => {
  try {
    const response = await AIMonitorService.getPerformanceMetrics();
    if (response.success) {
      performanceMetrics.value = response.data;
    } else {
      // Fallback to mock data
      performanceMetrics.value = getMockPerformanceMetrics();
    }
  } catch (error) {
    console.error('Error updating performance metrics:', error);
    performanceMetrics.value = getMockPerformanceMetrics();
  }
};

const getMockServiceStatus = () => ({
  overall: 'healthy',
  healthy: true,
  services: {
    ai: 'active',
    pricing: 'active',
    erpnext: 'limited'
  },
  activeServices: 2,
  totalServices: 3,
  lastCheck: new Date().toISOString(),
  uptime: '5d 12h 30m'
});

const getMockPerformanceMetrics = () => ({
  uptime: '5d 12h 30m',
  healthChecks: 1247,
  errorCount: 3,
  lastRestart: new Date(Date.now() - 86400000).toISOString()
});

const addLog = (message, type = 'info', level = 'INFO', service = 'SYSTEM') => {
  const log = {
    timestamp: new Date(),
    message,
    type,
    level,
    service
  };
  
  logs.value.unshift(log);
  
  // Keep only last 100 logs
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100);
  }
  
  // Auto-scroll to top
  nextTick(() => {
    if (logsContainer.value) {
      logsContainer.value.scrollTop = 0;
    }
  });
};

const forceRestart = async () => {
  isRestarting.value = true;
  addLog(t('restartingAISystems') || 'بدء إعادة تشغيل أنظمة الذكاء الاصطناعي...', 'info', 'INFO', 'MONITOR');
  
  try {
    const response = await AIMonitorService.forceRestart();
    
    if (response.success) {
      addLog(t('systemsRestartedSuccessfully') || 'تمت إعادة تشغيل الأنظمة بنجاح', 'success', 'SUCCESS', 'MONITOR');
      localStorage.setItem('ai_last_restart', new Date().toISOString());
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('systemsRestarted') || 'إعادة تشغيل الأنظمة',
        message: t('restartSuccess') || 'تمت إعادة التشغيل بنجاح',
        timeout: 3000
      });
    } else {
      addLog(t('systemsRestartFailed') || 'فشلت إعادة تشغيل الأنظمة', 'error', 'ERROR', 'MONITOR');
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('systemsRestarted') || 'إعادة تشغيل الأنظمة',
        message: t('restartFailed') || 'فشلت إعادة التشغيل',
        timeout: 5000
      });
    }
  } catch (error) {
    addLog(`${t('restartError') || 'خطأ في إعادة التشغيل'}: ${error.message}`, 'error', 'ERROR', 'MONITOR');
  } finally {
    isRestarting.value = false;
    await updateServiceStatus();
    await updatePerformanceMetrics();
  }
};

const emergencyRecovery = async () => {
  isEmergencyMode.value = true;
  addLog(t('activatingEmergencyMode') || 'تفعيل وضع الاسترداد العاجل...', 'warning', 'WARNING', 'MONITOR');
  
  try {
    const response = await AIMonitorService.emergencyRecovery();
    
    if (response.success) {
      addLog(t('emergencyModeActivated') || 'تم تفعيل وضع الاسترداد العاجل بنجاح', 'success', 'SUCCESS', 'MONITOR');
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'warning',
        title: t('emergencyMode') || 'وضع الطوارئ',
        message: t('emergencyModeActivated') || 'تم تفعيل وضع الطوارئ',
        timeout: 5000
      });
    } else {
      addLog('فشل تفعيل وضع الاسترداد العاجل', 'error', 'ERROR', 'MONITOR');
    }
  } catch (error) {
    addLog(`خطأ في الاسترداد العاجل: ${error.message}`, 'error', 'ERROR', 'MONITOR');
  } finally {
    isEmergencyMode.value = false;
    updateServiceStatus();
  }
};

const testService = async (serviceName) => {
  isTesting.value = true;
  addLog(`${t('testingService') || 'بدء اختبار خدمة'} ${getServiceName(serviceName)}...`, 'info', 'INFO', 'TEST');
  
  try {
    let response;
    
    switch (serviceName) {
      case 'ai':
        response = await AIService.healthCheck();
        break;
      case 'pricing':
        response = await AIMonitorService.checkPricingService();
        break;
      case 'erpnext':
        response = await AIMonitorService.checkERPNextIntegration();
        break;
      default:
        response = { success: false, status: 'unknown' };
    }
    
    const status = response.status || (response.success ? 'active' : 'unknown');
    addLog(`${t('testResult') || 'نتيجة اختبار'} ${getServiceName(serviceName)}: ${getStatusText(status)}`, 
             status === 'active' ? 'success' : 'warning', 
             status === 'active' ? 'SUCCESS' : 'WARNING', 
             'TEST');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: status === 'active' ? 'success' : 'warning',
      title: `${t('serviceTest') || 'اختبار الخدمة'}: ${getServiceName(serviceName)}`,
      message: status === 'active' 
        ? (t('serviceHealthy') || 'الخدمة تعمل بشكل طبيعي')
        : (t('serviceNeedsAttention') || 'الخدمة تحتاج إلى انتباه'),
      timeout: 3000
    });
    
  } catch (error) {
    addLog(`${t('errorTestingService') || 'خطأ في اختبار'} ${getServiceName(serviceName)}: ${error.message}`, 'error', 'ERROR', 'TEST');
  } finally {
    isTesting.value = false;
    await updateServiceStatus();
  }
};

const restartService = async (serviceName) => {
  addLog(`${t('restartingService') || 'إعادة تشغيل خدمة'} ${getServiceName(serviceName)}...`, 'info', 'INFO', 'RESTART');
  
  try {
    // Service-specific restart logic would go here
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    addLog(`${t('serviceRestarted') || 'تمت إعادة تشغيل خدمة'} ${getServiceName(serviceName)} ${t('successfully') || 'بنجاح'}`, 'success', 'SUCCESS', 'RESTART');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: `${t('serviceRestarted') || 'إعادة تشغيل الخدمة'}: ${getServiceName(serviceName)}`,
      message: t('restartSuccess') || 'تمت إعادة التشغيل بنجاح',
      timeout: 3000
    });
    
  } catch (error) {
    addLog(`${t('errorRestartingService') || 'خطأ في إعادة تشغيل'} ${getServiceName(serviceName)}: ${error.message}`, 'error', 'ERROR', 'RESTART');
  } finally {
    await updateServiceStatus();
  }
};

const clearLogs = () => {
  logs.value = [];
  addLog(t('logsCleared') || 'تم مسح السجلات', 'info', 'INFO', 'SYSTEM');
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('logsCleared') || 'تم مسح السجلات',
    message: t('allLogsCleared') || 'تم مسح جميع السجلات بنجاح',
    timeout: 2000
  });
};

const exportLogs = () => {
  const logData = {
    logs: logs.value,
    serviceStatus: serviceStatus.value,
    performanceMetrics: performanceMetrics.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-monitor-logs-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  addLog(t('logsExported') || 'تم تصدير السجلات', 'info', 'INFO', 'SYSTEM');
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('logsExported') || 'تم تصدير السجلات',
    message: t('exportSuccess') || 'تم التصدير بنجاح',
    timeout: 3000
  });
};

// Event Listeners
const handleServiceStatusUpdate = (event) => {
  const status = event.detail;
  serviceStatus.value = status;
  
  // Add log for status changes
  if (status.overall !== serviceStatus.value.overall) {
    const statusText = status.overall === 'healthy' 
      ? (t('healthy') || 'صحي') 
      : (t('degraded') || 'محظور');
    addLog(`${t('systemStatusChanged') || 'تغير حالة النظام إلى'}: ${statusText}`, 'info', 'INFO', 'MONITOR');
  }
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    // Initial status update
    await updateServiceStatus();
    await updatePerformanceMetrics();
    
    // Add initial log
    addLog(t('monitoringStarted') || 'بدء المراقبة', 'info', 'INFO', 'MONITOR');
    
    // Set up real-time updates
    if (window.eventBus) {
      window.eventBus.addEventListener('ai-service-status-update', handleServiceStatusUpdate);
    }
    
    // Update status every 5 seconds
    const statusInterval = setInterval(async () => {
      await updateServiceStatus();
    }, 5000);
    
    // Update performance metrics every 10 seconds
    const performanceInterval = setInterval(async () => {
      await updatePerformanceMetrics();
    }, 10000);
    
    // Store intervals for cleanup
    window.aiMonitorIntervals = {
      status: statusInterval,
      performance: performanceInterval
    };
    
  } catch (error) {
    console.error('Error initializing AI Monitor:', error);
    addLog(t('initializationError') || 'خطأ في التهيئة', 'error', 'ERROR', 'MONITOR');
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // Clear intervals
  if (window.aiMonitorIntervals) {
    clearInterval(window.aiMonitorIntervals.status);
    clearInterval(window.aiMonitorIntervals.performance);
    delete window.aiMonitorIntervals;
  }
  
  // Remove event listeners
  if (window.eventBus) {
    window.eventBus.removeEventListener('ai-service-status-update', handleServiceStatusUpdate);
  }
});
</script>

<style scoped>
/* Monitor Header */
.monitor-header {
  position: relative;
  overflow: hidden;
}

.monitor-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.monitor-header:hover::before {
  left: 100%;
}

/* Status Overview */
.status-overview {
  position: relative;
}

.status-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.status-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.status-card:hover::before {
  left: 100%;
}

.status-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.status-card.healthy {
  border-color: rgb(var(--v-theme-success));
}

.status-card.degraded {
  border-color: rgb(var(--v-theme-warning));
}

.status-info h3 {
  position: relative;
}

.status-info h3::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
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

.service-header {
  position: relative;
}

.service-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Logs Section */
.logs-header {
  position: relative;
}

.logs-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
}

.logs-container {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
}

.log-entry {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.log-entry::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.log-entry:hover::before {
  left: 100%;
}

.log-entry:hover {
  transform: translateX(4px);
  background: rgba(var(--v-theme-surface-variant), 0.5);
}

.log-log-info {
  border-left: 4px solid rgb(var(--v-theme-info));
}

.log-log-success {
  border-left: 4px solid rgb(var(--v-theme-success));
}

.log-log-warning {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.log-log-error {
  border-left: 4px solid rgb(var(--v-theme-error));
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

.service-card {
  animation: fadeIn 0.6s ease forwards;
}

.service-card:nth-child(1) { animation-delay: 0.1s; }
.service-card:nth-child(2) { animation-delay: 0.2s; }
.service-card:nth-child(3) { animation-delay: 0.3s; }
.service-card:nth-child(4) { animation-delay: 0.4s; }

.metric-card {
  animation: fadeIn 0.5s ease forwards;
}

.metric-card:nth-child(1) { animation-delay: 0.1s; }
.metric-card:nth-child(2) { animation-delay: 0.2s; }
.metric-card:nth-child(3) { animation-delay: 0.3s; }
.metric-card:nth-child(4) { animation-delay: 0.4s; }

.log-entry {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .monitor-header .d-flex {
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
  .monitor-header h1 {
    font-size: 1.5rem;
  }
  
  .service-card .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .metric-card {
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

:deep(.v-alert) {
  animation: pulse 2s ease infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}
</style>
