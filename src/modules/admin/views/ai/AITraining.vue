<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 training-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-brain</v-icon>
              {{ $t('aiTrainingPlatform') || 'منصة تدريب الذكاء الاصطناعي' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('aiTrainingSubtitle') || 'تدريب وتحسين نماذج الذكاء الاصطناعي لتصبح أكثر ذكاءً وتعلماً' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="startAllTraining"
              :disabled="isTraining"
              variant="elevated"
              color="primary"
              :prepend-icon="isTraining ? 'mdi-loading' : 'mdi-play'"
            >
              {{ $t('trainAllModels') || 'تدريب جميع النماذج' }}
            </v-btn>
            <v-btn
              @click="exportData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-download"
            >
              {{ $t('exportData') || 'تصدير البيانات' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Training Overview -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-chart-box</v-icon>
          {{ $t('trainingOverview') || 'نظرة عامة على التدريب' }}
        </h3>
        
        <v-row>
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="overview-card">
              <v-card-text class="pa-4 text-center">
                <v-avatar color="primary" variant="tonal" size="50" class="mb-3">
                  <v-icon size="28" color="primary">mdi-school</v-icon>
                </v-avatar>
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ totalTrainingSessions }}</h3>
                <p class="text-caption text-medium-emphasis mb-0">{{ $t('trainingSessions') || 'جلسات التدريب' }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="overview-card">
              <v-card-text class="pa-4 text-center">
                <v-avatar color="success" variant="tonal" size="50" class="mb-3">
                  <v-icon size="28" color="success">mdi-chart-line</v-icon>
                </v-avatar>
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ averageAccuracy }}%</h3>
                <p class="text-caption text-medium-emphasis mb-0">{{ $t('averageAccuracy') || 'متوسط الدقة' }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="overview-card">
              <v-card-text class="pa-4 text-center">
                <v-avatar color="warning" variant="tonal" size="50" class="mb-3">
                  <v-icon size="28" color="warning">mdi-trophy</v-icon>
                </v-avatar>
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ learningRate }}%</h3>
                <p class="text-caption text-medium-emphasis mb-0">{{ $t('learningRate') || 'معدل التعلم' }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" sm="6" md="3">
            <v-card variant="outlined" class="overview-card">
              <v-card-text class="pa-4 text-center">
                <v-avatar color="info" variant="tonal" size="50" class="mb-3">
                  <v-icon size="28" color="info">mdi-clock</v-icon>
                </v-avatar>
                <h3 class="text-h4 font-weight-bold text-white mb-1">{{ lastUpdate }}</h3>
                <p class="text-caption text-medium-emphasis mb-0">{{ $t('lastUpdate') || 'آخر تحديث' }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Models Grid -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-cube</v-icon>
          {{ $t('aiModels') || 'نماذج الذكاء الاصطناعي' }}
        </h3>
        
        <v-row>
          <v-col
            v-for="(model, modelName) in aiModels"
            :key="modelName"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card variant="elevated" class="model-card">
              <v-card-text class="pa-4">
                <div class="model-header d-flex align-center justify-space-between mb-4">
                  <div class="model-info">
                    <h3 class="text-h6 font-weight-medium text-white mb-1">{{ getModelName(modelName) }}</h3>
                    <div class="d-flex align-center ga-2">
                      <v-chip variant="tonal" size="small">v{{ model.version }}</v-chip>
                      <v-chip
                        :color="getModelStatusColor(model)"
                        variant="tonal"
                        size="small"
                      >
                        {{ getModelStatus(model) }}
                      </v-chip>
                    </div>
                  </div>
                  <v-avatar
                    :color="getModelColor(modelName)"
                    variant="tonal"
                    size="40"
                  >
                    <v-icon :color="getModelColor(modelName)">
                      {{ getModelIcon(modelName) }}
                    </v-icon>
                  </v-avatar>
                </div>
                
                <div class="model-metrics mb-4">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <span class="text-caption text-medium-emphasis">{{ $t('accuracy') || 'الدقة' }}:</span>
                    <div class="d-flex align-center ga-2">
                      <v-progress-linear
                        :model-value="model.accuracy * 100"
                        :color="getAccuracyColor(model.accuracy)"
                        height="6"
                        rounded
                        style="width: 100px;"
                      />
                      <span class="text-body-2 text-white">{{ Math.round(model.accuracy * 100) }}%</span>
                    </div>
                  </div>
            
            <div class="metric">
              <span class="metric-label">الأداء:</span>
                  <div class="d-flex justify-space-between align-center mb-3">
                    <span class="text-caption text-medium-emphasis">{{ $t('precision') || 'الدقة' }}:</span>
                    <div class="d-flex align-center ga-2">
                      <v-progress-linear
                        :model-value="(model.performance?.precision || 0) * 100"
                        :color="getAccuracyColor(model.performance?.precision || 0)"
                        height="6"
                        rounded
                        style="width: 100px;"
                      />
                      <span class="text-body-2 text-white">{{ Math.round((model.performance?.precision || 0) * 100) }}%</span>
                    </div>
                  </div>
                  
                  <div class="d-flex justify-space-between align-center mb-3">
                    <span class="text-caption text-medium-emphasis">Recall:</span>
                    <div class="d-flex align-center ga-2">
                      <v-progress-linear
                        :model-value="(model.performance?.recall || 0) * 100"
                        :color="getAccuracyColor(model.performance?.recall || 0)"
                        height="6"
                        rounded
                        style="width: 100px;"
                      />
                      <span class="text-body-2 text-white">{{ Math.round((model.performance?.recall || 0) * 100) }}%</span>
                    </div>
                  </div>
                  
                  <div class="d-flex justify-space-between align-center mb-3">
                    <span class="text-caption text-medium-emphasis">F1 Score:</span>
                    <div class="d-flex align-center ga-2">
                      <v-progress-linear
                        :model-value="(model.performance?.f1Score || 0) * 100"
                        :color="getAccuracyColor(model.performance?.f1Score || 0)"
                        height="6"
                        rounded
                        style="width: 100px;"
                      />
                      <span class="text-body-2 text-white">{{ Math.round((model.performance?.f1Score || 0) * 100) }}%</span>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex justify-space-between align-center mb-3">
                  <span class="text-caption text-medium-emphasis">{{ $t('lastTraining') || 'آخر تدريب' }}:</span>
                  <span class="text-body-2 text-white">{{ formatDate(model.lastTrained) }}</span>
                </div>
                
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('trainingData') || 'بيانات التدريب' }}:</span>
                  <span class="text-body-2 text-white">{{ model.trainingData?.length || 0 }}</span>
                </div>
              </div>
              
              <div class="model-actions d-flex ga-2">
                <v-btn
                  @click="trainModel(modelName)"
                  :disabled="isTraining"
                  variant="tonal"
                  color="primary"
                  size="small"
                  :prepend-icon="isTraining ? 'mdi-loading' : 'mdi-bell'
                >
                  {{ $t('train') || 'تدريب' }}
                </v-btn>
                <v-btn
                  @click="viewModelDetails(modelName)"
                  variant="tonal"
                  color="secondary"
                  size="small"
                  prepend-icon="mdi-eye"
                >
                  {{ $t('details') || 'تفاصيل' }}
                </v-btn>
                <v-btn
                  @click="resetModel(modelName)"
                  variant="tonal"
                  color="warning"
                  size="small"
                  prepend-icon="mdi-undo"
                >
                  {{ $t('reset') || 'إعادة تعيين' }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

    <!-- Training Progress -->
    <v-card v-if="currentTrainingSession" variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <div class="progress-header d-flex align-center justify-space-between mb-4">
          <h3 class="text-h5 font-weight-bold text-white d-flex align-center ga-2">
            <v-icon color="primary" size="24">mdi-cogs</v-icon>
            {{ $t('trainingInProgress') || 'جاري التدريب' }}
          </h3>
          <v-chip variant="tonal" color="primary">
            {{ getModelName(currentTrainingSession.modelName) }}
          </v-chip>
        </div>
        
        <div class="progress-content">
          <div class="mb-4">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-body-2 text-medium-emphasis">{{ $t('currentStep') || 'الخطوة الحالية' }}: {{ getStepName(currentTrainingSession.currentStep) }}</span>
              <span class="text-body-2 text-white">{{ currentTrainingSession.progress }}%</span>
            </div>
            <v-progress-linear
              :model-value="currentTrainingSession.progress"
              color="primary"
              height="8"
              rounded
            />
          </div>
          
          <div class="training-details">
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('startTime') || 'وقت البدء' }}:</span>
                  <span class="text-body-2 text-white">{{ formatTime(currentTrainingSession.startTime) }}</span>
                </div>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('status') || 'الحالة' }}:</span>
                  <v-chip
                    :color="getStatusColor(currentTrainingSession.status)"
                    variant="tonal"
                    size="small"
                  >
                    {{ getStatusText(currentTrainingSession.status) }}
                  </v-chip>
                </div>
              </v-col>
              <v-col v-if="currentTrainingSession.result" cols="12" sm="6" md="3">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-caption text-medium-emphasis">{{ $t('result') || 'النتيجة' }}:</span>
                  <span class="text-body-2 text-white">
                    {{ $t('accuracy') || 'الدقة' }}: {{ Math.round(currentTrainingSession.result.accuracy * 100) }}%
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Training History -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <div class="history-header d-flex align-center justify-space-between mb-4">
          <h3 class="text-h5 font-weight-bold text-white d-flex align-center ga-2">
            <v-icon color="primary" size="24">mdi-history</v-icon>
            {{ $t('trainingHistory') || 'سجل التدريب' }}
          </h3>
          <div class="history-controls d-flex ga-2">
            <v-btn
              @click="clearHistory"
              variant="tonal"
              color="error"
              size="small"
              prepend-icon="mdi-delete"
            >
              {{ $t('clearHistory') || 'مسح السجل' }}
            </v-btn>
            <v-btn
              @click="exportHistory"
              variant="tonal"
              color="primary"
              size="small"
              prepend-icon="mdi-download"
            >
              {{ $t('exportHistory') || 'تصدير السجل' }}
            </v-btn>
          </div>
        </div>
        
        <div class="history-list">
          <v-card
            v-for="(session, index) in recentSessions"
            :key="session.id"
            variant="outlined"
            class="history-item mb-2"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div class="session-info d-flex align-center ga-3">
                  <v-avatar
                    :color="getModelColor(session.modelName)"
                    variant="tonal"
                    size="32"
                  >
                    <v-icon :color="getModelColor(session.modelName)" size="16">
                      {{ getModelIcon(session.modelName) }}
                    </v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-body-2 font-weight-medium text-white">{{ getModelName(session.modelName) }}</div>
                    <div class="d-flex align-center ga-2">
                      <span class="text-caption text-medium-emphasis">{{ formatTime(session.startTime) }}</span>
                      <span class="text-caption text-medium-emphasis">{{ calculateDuration(session) }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="session-status d-flex align-center ga-2">
                  <v-chip
                    :color="getStatusColor(session.status)"
                    variant="tonal"
                    size="small"
                  >
                    {{ getStatusText(session.status) }}
                  </v-chip>
                  <div v-if="session.result" class="text-body-2 text-white">
                    {{ $t('accuracy') || 'الدقة' }}: {{ Math.round(session.result.accuracy * 100) }}%
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
    </v-card>

    <!-- Learning Analytics -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-6">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-chart-bar</v-icon>
          {{ $t('learningAnalytics') || 'تحليلات التعلم' }}
        </h3>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="analytics-card">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('improvementRate') || 'معدل التحسن' }}</h4>
                <div class="analytics-chart" style="height: 200px;">
                  <canvas ref="improvementChart"></canvas>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="analytics-card">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('modelAccuracy') || 'دقة النماذج' }}</h4>
                <div class="analytics-chart" style="height: 200px;">
                  <canvas ref="accuracyChart"></canvas>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="analytics-card">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('trainingDataPoints') || 'بيانات التدريب' }}</h4>
                <div class="data-points">
                  <div v-for="(value, key) in trainingDataPoints" :key="key" class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption text-medium-emphasis">{{ key }}</span>
                    <span class="text-body-2 text-white font-weight-bold">{{ value }}</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="analytics-card">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('systemPerformance') || 'أداء النظام' }}</h4>
                <div class="performance-metrics">
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption text-medium-emphasis">{{ $t('responseTime') || 'سرعة الاستجابة' }}:</span>
                    <span class="text-body-2 text-white">{{ systemPerformance.responseTime }}ms</span>
                  </div>
                  <div class="d-flex justify-space-between align-center mb-2">
                    <span class="text-caption text-medium-emphasis">{{ $t('errorRate') || 'معدل الخطأ' }}:</span>
                    <span class="text-body-2 text-white">{{ systemPerformance.errorRate }}%</span>
                  </div>
                  <div class="d-flex justify-space-between align-center">
                    <span class="text-caption text-medium-emphasis">{{ $t('memoryUsage') || 'استخدام الذاكرة' }}:</span>
                    <span class="text-body-2 text-white">{{ systemPerformance.memoryUsage }}MB</span>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Advanced Settings -->
    <v-card variant="elevated">
      <v-card-text class="pa-6">
        <h3 class="text-h5 font-weight-bold text-white mb-4 d-flex align-center ga-2">
          <v-icon color="primary" size="24">mdi-cog</v-icon>
          {{ $t('advancedSettings') || 'إعدادات متقدمة' }}
        </h3>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="setting-group">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('trainingSettings') || 'إعدادات التدريب' }}</h4>
                <div class="setting-item mb-3">
                  <v-label class="text-caption text-medium-emphasis mb-2">{{ $t('autoTrainingInterval') || 'تكرار التدريب التلقائي' }}</v-label>
                  <v-select
                    v-model="trainingSettings.autoTrainingInterval"
                    :items="[
                      { title: $t('everyHour') || 'كل ساعة', value: 3600000 },
                      { title: $t('every6Hours') || 'كل 6 ساعات', value: 21600000 },
                      { title: $t('every24Hours') || 'كل 24 ساعة', value: 86400000 },
                      { title: $t('everyWeek') || 'كل أسبوع', value: 604800000 }
                    ]"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    density="compact"
                  />
                </div>
                <div class="setting-item mb-3">
                  <v-label class="text-caption text-medium-emphasis mb-2">{{ $t('targetAccuracy') || 'دقة التدريب المطلوبة' }}</v-label>
                  <div class="d-flex align-center ga-3">
                    <v-slider
                      v-model="trainingSettings.targetAccuracy"
                      :min="0.8"
                      :max="0.99"
                      :step="0.01"
                      color="primary"
                      hide-details
                      style="flex: 1;"
                    />
                    <span class="text-body-2 text-white">{{ trainingSettings.targetAccuracy }}</span>
                  </div>
                </div>
                <div class="setting-item">
                  <v-label class="text-caption text-medium-emphasis mb-2">{{ $t('maxTrainingData') || 'الحد الأقصى لبيانات التدريب' }}</v-label>
                  <v-text-field
                    v-model="trainingSettings.maxTrainingData"
                    type="number"
                    :min="100"
                    :max="10000"
                    :step="100"
                    variant="outlined"
                    density="compact"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
          
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="setting-group">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('learningSettings') || 'إعدادات التعلم' }}</h4>
                <div class="setting-item mb-3">
                  <v-checkbox
                    v-model="learningSettings.continuousLearning"
                    :label="$t('continuousLearning') || 'التعلم المستمر'"
                    color="primary"
                    hide-details
                  />
                </div>
                <div class="setting-item mb-3">
                  <v-checkbox
                    v-model="learningSettings.adaptiveLearning"
                    :label="$t('adaptiveLearning') || 'التعلم التكيفي'"
                    color="primary"
                    hide-details
                  />
                </div>
                <div class="setting-item">
                  <v-checkbox
                    v-model="learningSettings.realTimeAdaptation"
                    :label="$t('realTimeAdaptation') || 'التكيف في الوقت الحقيقي'"
                    color="primary"
                    hide-details
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <v-row class="mt-4">
          <v-col cols="12" md="6">
            <v-card variant="outlined" class="setting-group">
              <v-card-text class="pa-4">
                <h4 class="text-h6 font-weight-medium text-white mb-3">{{ $t('systemSettings') || 'إعدادات النظام' }}</h4>
                <div class="setting-item mb-3">
                  <v-checkbox
                    v-model="systemSettings.autoBackup"
                    :label="$t('autoBackup') || 'نسخ احتياطي تلقائي'"
                    color="primary"
                    hide-details
                  />
                </div>
                <div class="setting-item mb-3">
                  <v-checkbox
                    v-model="systemSettings.performanceMonitoring"
                    :label="$t('performanceMonitoring') || 'مراقبة الأداء'"
                    color="primary"
                    hide-details
                  />
                </div>
                <div class="setting-item">
                  <v-checkbox
                    v-model="systemSettings.errorRecovery"
                    :label="$t('errorRecovery') || 'استرداد الأخطاء التلقائي'"
                    color="primary"
                    hide-details
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        
        <div class="settings-actions d-flex ga-3 mt-4">
          <v-btn
            @click="saveSettings"
            variant="elevated"
            color="primary"
            prepend-icon="mdi-content-save"
          >
            {{ $t('saveSettings') || 'حفظ الإعدادات' }}
          </v-btn>
          <v-btn
            @click="resetSettings"
            variant="tonal"
            color="secondary"
            prepend-icon="mdi-undo"
          >
            {{ $t('resetSettings') || 'إعادة تعيين الإعدادات' }}
          </v-btn>
        </div>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AILearningService from '@/services/AILearningService';
import Chart from 'chart.js/auto';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const isTraining = ref(false);
const currentTrainingSession = ref(null);
const aiModels = ref({});
const trainingSessions = ref([]);
const learningData = ref({});
const systemPerformance = ref({
  responseTime: 150,
  errorRate: 0.5,
  memoryUsage: 256
});

const trainingSettings = ref({
  autoTrainingInterval: 21600000, // 6 hours
  targetAccuracy: 0.95,
  maxTrainingData: 5000
});

const learningSettings = ref({
  continuousLearning: true,
  adaptiveLearning: true,
  realTimeAdaptation: true
});

const systemSettings = ref({
  autoBackup: true,
  performanceMonitoring: true,
  errorRecovery: true
});

// Chart refs
const improvementChart = ref(null);
const accuracyChart = ref(null);

// Computed
const totalTrainingSessions = computed(() => trainingSessions.value.length);
const averageAccuracy = computed(() => {
  const models = Object.values(aiModels.value);
  if (models.length === 0) return 0;
  const totalAccuracy = models.reduce((sum, model) => sum + (model.accuracy || 0), 0);
  return Math.round((totalAccuracy / models.length) * 100);
});
const learningRate = computed(() => {
  const recentSessions = trainingSessions.value.slice(-10);
  if (recentSessions.length === 0) return 0;
  const totalImprovement = recentSessions.reduce((sum, session) => {
    return sum + (session.result?.improvements?.accuracyImprovement || 0);
  }, 0);
  return Math.round((totalImprovement / recentSessions.length) * 100);
});
const lastUpdate = computed(() => {
  const lastSession = trainingSessions.value[trainingSessions.value.length - 1];
  return lastSession ? formatDate(lastSession.endTime) : 'N/A';
});
const recentSessions = computed(() => trainingSessions.value.slice(-10).reverse());
const trainingDataPoints = computed(() => {
  return {
    [t('conversations') || 'المحادثات']: learningData.value.conversationContexts?.length || 0,
    [t('pricing') || 'التسعير']: learningData.value.pricingPatterns?.length || 0,
    [t('interactions') || 'التفاعلات']: learningData.value.userInteractions?.length || 0,
    [t('insights') || 'الرؤى']: learningData.value.productInsights?.length || 0
  };
});

// Methods
const getModelName = (modelName) => {
  const names = {
    chatbot: t('chatbot') || 'مساعد الدردشة',
    pricing: t('pricingSystem') || 'نظام التسعير',
    recommendations: t('recommendationSystem') || 'نظام التوصيات',
    sentiment: t('sentimentAnalysis') || 'تحليل المشاعر'
  };
  return names[modelName] || modelName;
};

const getModelIcon = (modelName) => {
  const icons = {
    chatbot: 'mdi-message-text',
    pricing: 'mdi-chart-line',
    recommendations: 'mdi-lightbulb',
    sentiment: 'mdi-heart'
  };
  return icons[modelName] || 'mdi-cube';
};

const getModelColor = (modelName) => {
  const colors = {
    chatbot: 'primary',
    pricing: 'success',
    recommendations: 'warning',
    sentiment: 'error'
  };
  return colors[modelName] || 'default';
};

const getModelStatus = (model) => {
  if (!model.lastTrained) return 'not_trained';
  const daysSinceTraining = (Date.now() - new Date(model.lastTrained).getTime()) / (1000 * 60 * 60 * 24);
  return daysSinceTraining > 7 ? 'needs_update' : 'active';
};

const getModelStatusClass = (status) => {
  const classes = {
    active: 'status-active',
    needs_update: 'status-warning',
    not_trained: 'status-inactive'
  };
  return classes[status] || 'status-unknown';
};

const getModelStatusColor = (model) => {
  const status = getModelStatus(model);
  const colors = {
    active: 'success',
    needs_update: 'warning',
    not_trained: 'error'
  };
  return colors[status] || 'default';
};

const getAccuracyColor = (accuracy) => {
  if (accuracy >= 0.9) return 'success';
  if (accuracy >= 0.7) return 'warning';
  return 'error';
};

const getStepName = (step) => {
  const stepNames = {
    data_preprocessing: t('dataPreprocessing') || 'معالجة البيانات',
    feature_extraction: t('featureExtraction') || 'استخراج الميزات',
    model_training: t('modelTraining') || 'تدريب النموذج',
    validation: t('validation') || 'التحقق من الصحة',
    finalization: t('finalization') || 'الإنهاء'
  };
  return stepNames[step] || step;
};

const getStatusText = (status) => {
  const statusTexts = {
    pending: t('pending') || 'قيد الانتظار',
    running: t('running') || 'قيد التشغيل',
    completed: t('completed') || 'مكتمل',
    failed: t('failed') || 'فشل',
    cancelled: t('cancelled') || 'ملغي'
  };
  return statusTexts[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    running: 'info',
    completed: 'success',
    failed: 'error',
    cancelled: 'default'
  };
  return colors[status] || 'default';
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(date));
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const calculateDuration = (session) => {
  if (!session.startTime || !session.endTime) return 'N/A';
  const duration = new Date(session.endTime) - new Date(session.startTime);
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

// API Integration Methods
const loadAIModels = async () => {
  try {
    const response = await AILearningService.getModels();
    if (response.success) {
      aiModels.value = response.data;
    } else {
      // Fallback to mock data
      aiModels.value = getMockAIModels();
    }
  } catch (error) {
    console.error('Error loading AI models:', error);
    aiModels.value = getMockAIModels();
  }
};

const loadTrainingSessions = async () => {
  try {
    const response = await AILearningService.getTrainingSessions();
    if (response.success) {
      trainingSessions.value = response.data;
    } else {
      // Fallback to mock data
      trainingSessions.value = getMockTrainingSessions();
    }
  } catch (error) {
    console.error('Error loading training sessions:', error);
    trainingSessions.value = getMockTrainingSessions();
  }
};

const loadLearningData = async () => {
  try {
    const response = await AILearningService.getLearningData();
    if (response.success) {
      learningData.value = response.data;
    } else {
      // Fallback to mock data
      learningData.value = getMockLearningData();
    }
  } catch (error) {
    console.error('Error loading learning data:', error);
    learningData.value = getMockLearningData();
  }
};

const getMockAIModels = () => ({
  chatbot: {
    version: '2.1.0',
    accuracy: 0.92,
    lastTrained: new Date(Date.now() - 86400000).toISOString(),
    performance: {
      precision: 0.88,
      recall: 0.91,
      f1Score: 0.89
    },
    trainingData: Array.from({ length: 1250 }, (_, i) => ({ id: i + 1 }))
  },
  pricing: {
    version: '1.8.3',
    accuracy: 0.87,
    lastTrained: new Date(Date.now() - 172800000).toISOString(),
    performance: {
      precision: 0.85,
      recall: 0.88,
      f1Score: 0.86
    },
    trainingData: Array.from({ length: 890 }, (_, i) => ({ id: i + 1 }))
  },
  recommendations: {
    version: '3.0.1',
    accuracy: 0.94,
    lastTrained: new Date(Date.now() - 259200000).toISOString(),
    performance: {
      precision: 0.92,
      recall: 0.94,
      f1Score: 0.93
    },
    trainingData: Array.from({ length: 2100 }, (_, i) => ({ id: i + 1 }))
  },
  sentiment: {
    version: '1.5.2',
    accuracy: 0.89,
    lastTrained: new Date(Date.now() - 345600000).toISOString(),
    performance: {
      precision: 0.87,
      recall: 0.90,
      f1Score: 0.88
    },
    trainingData: Array.from({ length: 1560 }, (_, i) => ({ id: i + 1 }))
  }
});

const getMockTrainingSessions = () => [
  {
    id: 1,
    modelName: 'chatbot',
    startTime: new Date(Date.now() - 3600000).toISOString(),
    endTime: new Date(Date.now() - 3000000).toISOString(),
    status: 'completed',
    result: {
      accuracy: 0.92,
      improvements: {
        accuracyImprovement: 0.03
      }
    }
  },
  {
    id: 2,
    modelName: 'pricing',
    startTime: new Date(Date.now() - 7200000).toISOString(),
    endTime: new Date(Date.now() - 6000000).toISOString(),
    status: 'completed',
    result: {
      accuracy: 0.87,
      improvements: {
        accuracyImprovement: 0.02
      }
    }
  }
];

const getMockLearningData = () => ({
  conversationContexts: Array.from({ length: 450 }, (_, i) => ({ id: i + 1 })),
  pricingPatterns: Array.from({ length: 230 }, (_, i) => ({ id: i + 1 })),
  userInteractions: Array.from({ length: 1200 }, (_, i) => ({ id: i + 1 })),
  productInsights: Array.from({ length: 180 }, (_, i) => ({ id: i + 1 }))
});

const startAllTraining = async () => {
  isTraining.value = true;
  
  try {
    const response = await AILearningService.startAllTraining();
    
    if (response.success) {
      currentTrainingSession.value = response.data;
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('trainingStarted') || 'بدء التدريب',
        message: t('allModelsTraining') || 'تم بدء تدريب جميع النماذج',
        timeout: 3000
      });
    } else {
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('trainingError') || 'خطأ في التدريب',
        message: t('failedToStartTraining') || 'فشل في بدء التدريب',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Error starting training:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('trainingError') || 'خطأ في التدريب',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    isTraining.value = false;
  }
};

const trainModel = async (modelName) => {
  isTraining.value = true;
  
  try {
    const response = await AILearningService.trainModel(modelName);
    
    if (response.success) {
      currentTrainingSession.value = response.data;
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('modelTrainingStarted') || 'بدء تدريب النموذج',
        message: `${t('training') || 'تدريب'} ${getModelName(modelName)}`,
        timeout: 3000
      });
    } else {
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('trainingError') || 'خطأ في التدريب',
        message: t('failedToStartModelTraining') || 'فشل في بدء تدريب النموذج',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Error training model:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('trainingError') || 'خطأ في التدريب',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    isTraining.value = false;
  }
};

const viewModelDetails = (modelName) => {
  // Navigate to model details or show modal
  console.log('View details for:', modelName);
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('modelDetails') || 'تفاصيل النموذج',
    message: `${t('viewingDetailsFor') || 'عرض تفاصيل'} ${getModelName(modelName)}`,
    timeout: 2000
  });
};

const resetModel = async (modelName) => {
  try {
    const response = await AILearningService.resetModel(modelName);
    
    if (response.success) {
      // Update model data
      await loadAIModels();
      
      // Show notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('modelReset') || 'إعادة تعيين النموذج',
        message: `${t('modelResetSuccessfully') || 'تم إعادة تعيين'} ${getModelName(modelName)}`,
        timeout: 3000
      });
    } else {
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('resetError') || 'خطأ في إعادة التعيين',
        message: t('failedToResetModel') || 'فشل في إعادة تعيين النموذج',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Error resetting model:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('resetError') || 'خطأ في إعادة التعيين',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

const clearHistory = () => {
  trainingSessions.value = [];
  localStorage.removeItem('ai_training_sessions');
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('historyCleared') || 'تم مسح السجل',
    message: t('trainingHistoryCleared') || 'تم مسح سجل التدريب',
    timeout: 2000
  });
};

const exportHistory = () => {
  const historyData = {
    sessions: trainingSessions.value,
    models: aiModels.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-training-history-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('historyExported') || 'تم تصدير السجل',
    message: t('trainingHistoryExported') || 'تم تصدير سجل التدريب',
    timeout: 3000
  });
};

const exportData = () => {
  const exportData = {
    models: aiModels.value,
    sessions: trainingSessions.value,
    learningData: learningData.value,
    systemPerformance: systemPerformance.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ai-training-data-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('dataExported') || 'تم تصدير البيانات',
    message: t('trainingDataExported') || 'تم تصدير بيانات التدريب',
    timeout: 3000
  });
};

const saveSettings = async () => {
  try {
    const settings = {
      training: trainingSettings.value,
      learning: learningSettings.value,
      system: systemSettings.value
    };
    
    const response = await AILearningService.saveSettings(settings);
    
    if (response.success) {
      // Show notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('settingsSaved') || 'تم حفظ الإعدادات',
        message: t('trainingSettingsSaved') || 'تم حفظ إعدادات التدريب',
        timeout: 3000
      });
    } else {
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('saveError') || 'خطأ في الحفظ',
        message: t('failedToSaveSettings') || 'فشل في حفظ الإعدادات',
        timeout: 5000
      });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'خطأ في الحفظ',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

const resetSettings = () => {
  trainingSettings.value = {
    autoTrainingInterval: 21600000,
    targetAccuracy: 0.95,
    maxTrainingData: 5000
  };
  
  learningSettings.value = {
    continuousLearning: true,
    adaptiveLearning: true,
    realTimeAdaptation: true
  };
  
  systemSettings.value = {
    autoBackup: true,
    performanceMonitoring: true,
    errorRecovery: true
  };
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('settingsReset') || 'تم إعادة تعيين الإعدادات',
    message: t('trainingSettingsReset') || 'تم إعادة تعيين إعدادات التدريب',
    timeout: 2000
  });
};

const initializeCharts = () => {
  nextTick(() => {
    // Initialize improvement chart
    if (improvementChart.value) {
      const ctx = improvementChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: t('improvementRate') || 'معدل التحسن',
            data: [2, 5, 3, 8, 6, 9],
            borderColor: 'rgb(var(--v-theme-primary))',
            backgroundColor: 'rgba(var(--v-theme-primary), 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(var(--v-theme-on-surface))'
              }
            }
          },
          scales: {
            y: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            },
            x: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            }
          }
        }
      });
    }
    
    // Initialize accuracy chart
    if (accuracyChart.value) {
      const ctx = accuracyChart.value.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: Object.keys(aiModels.value).map(getModelName),
          datasets: [{
            label: t('accuracy') || 'الدقة',
            data: Object.values(aiModels.value).map(model => model.accuracy * 100),
            backgroundColor: [
              'rgba(var(--v-theme-primary), 0.8)',
              'rgba(var(--v-theme-success), 0.8)',
              'rgba(var(--v-theme-warning), 0.8)',
              'rgba(var(--v-theme-error), 0.8)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: 'rgb(var(--v-theme-on-surface))'
              }
            }
          },
          scales: {
            y: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            },
            x: {
              ticks: {
                color: 'rgb(var(--v-theme-on-surface))'
              },
              grid: {
                color: 'rgba(var(--v-theme-on-surface), 0.1)'
              }
            }
          }
        }
      });
    }
  });
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    // Load all data
    await Promise.all([
      loadAIModels(),
      loadTrainingSessions(),
      loadLearningData()
    ]);
    
    // Initialize charts
    initializeCharts();
    
  } catch (error) {
    console.error('Error initializing AI Training:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('initializationError') || 'خطأ في التهيئة',
      message: t('failedToInitializeTraining') || 'فشل في تهيئة نظام التدريب',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  // Cleanup charts
  if (improvementChart.value) {
    const chart = Chart.getChart(improvementChart.value);
    if (chart) chart.destroy();
  }
  
  if (accuracyChart.value) {
    const chart = Chart.getChart(accuracyChart.value);
    if (chart) chart.destroy();
  }
});
</script>
    training: 'جاري التدريب',
    completed: 'مكتمل',
    failed: 'فشل'
  };
  return statusTexts[status] || status;
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const formatTime = (date) => {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('ar-DZ', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

const calculateDuration = (session) => {
  if (!session.startTime || !session.endTime) return 'N/A';
  const duration = new Date(session.endTime) - new Date(session.startTime);
  const minutes = Math.floor(duration / 60000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

const trainModel = async (modelName) => {
  isTraining.value = true;
  
  try {
    const result = await AILearningService.startTraining(modelName);
    if (result) {
      await loadTrainingData();
      updateCharts();
    }
  } catch (error) {
    console.error(`Error training ${modelName}:`, error);
  } finally {
    isTraining.value = false;
  }
};

const startAllTraining = async () => {
  isTraining.value = true;
  
  try {
    const results = await AILearningService.forceRetraining();
    await loadTrainingData();
    updateCharts();
  } catch (error) {
    console.error('Error in batch training:', error);
  } finally {
    isTraining.value = false;
  }
};

const resetModel = async (modelName) => {
  if (confirm(`هل أنت متأكد من إعادة تعيين نموذج ${getModelName(modelName)}؟`)) {
    // Reset model logic would go here
    console.log(`Reset ${modelName} model`);
  }
};

const viewModelDetails = (modelName) => {
  // Show detailed model information
  console.log(`View details for ${modelName} model`);
};

const clearHistory = () => {
  if (confirm('هل أنت متأكد من مسح سجل التدريب؟')) {
    trainingSessions.value = [];
    console.log('Training history cleared');
  }
};

const exportHistory = () => {
  const historyData = {
    sessions: trainingSessions.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(historyData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `training-history-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportData = () => {
  AILearningService.exportLearningData();
};

const saveSettings = () => {
  const settings = {
    training: trainingSettings.value,
    learning: learningSettings.value,
    system: systemSettings.value
  };
  
  localStorage.setItem('ai_training_settings', JSON.stringify(settings));
  console.log('Settings saved');
};

const resetSettings = () => {
  trainingSettings.value = {
    autoTrainingInterval: 21600000,
    targetAccuracy: 0.95,
    maxTrainingData: 5000
  };
  
  learningSettings.value = {
    continuousLearning: true,
    adaptiveLearning: true,
    realTimeAdaptation: true
  };
  
  systemSettings.value = {
    autoBackup: true,
    performanceMonitoring: true,
    errorRecovery: true
  };
  
  localStorage.removeItem('ai_training_settings');
  console.log('Settings reset');
};

const loadTrainingData = async () => {
  try {
    aiModels.value = AILearningService.getAllModels();
    trainingSessions.value = AILearningService.getTrainingStatus().completedSessions;
    learningData.value = AILearningService.getLearningAnalytics();
    
    // Update current training session
    const status = AILearningService.getTrainingStatus();
    currentTrainingSession.value = status.currentSession;
    isTraining.value = status.isTraining;
    
  } catch (error) {
    console.error('Error loading training data:', error);
  }
};

const updateCharts = () => {
  nextTick(() => {
    // Update improvement chart
    if (improvementChart.value) {
      new Chart(improvementChart.value, {
        type: 'line',
        data: {
          labels: ['الجلسة 1', 'الجلسة 2', 'الجلسة 3', 'الجلسة 4', 'الجلسة 5'],
          datasets: [{
            label: 'معدل التحسن (%)',
            data: [2.1, 3.5, 2.8, 4.2, 3.9],
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
    
    // Update accuracy chart
    if (accuracyChart.value) {
      new Chart(accuracyChart.value, {
        type: 'doughnut',
        data: {
          labels: ['مساعد الدردشة', 'التسعير', 'التوصيات', 'تحليل المشاعر'],
          datasets: [{
            data: [
              aiModels.value.chatbot?.accuracy || 0,
              aiModels.value.pricing?.accuracy || 0,
              aiModels.value.recommendations?.accuracy || 0,
              aiModels.value.sentiment?.accuracy || 0
            ],
            backgroundColor: [
              '#4caf50',
              '#d4af37',
              '#ff9800',
              '#f44336'
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
  });
};

// Lifecycle
onMounted(async () => {
  await loadTrainingData();
  updateCharts();
  
  // Load settings
  const savedSettings = localStorage.getItem('ai_training_settings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    trainingSettings.value = { ...trainingSettings.value, ...settings.training };
    learningSettings.value = { ...learningSettings.value, ...settings.learning };
    systemSettings.value = { ...systemSettings.value, ...settings.system };
  }
  
  // Monitor training status
  setInterval(async () => {
    await loadTrainingData();
  }, 5000);
});
</script>

<style scoped>
/* Training Header */
.training-header {
  position: relative;
  overflow: hidden;
}

.training-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.training-header:hover::before {
  left: 100%;
}

/* Overview Cards */
.overview-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.overview-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.overview-card:hover::before {
  left: 100%;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Model Cards */
.model-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.model-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.model-card:hover::before {
  left: 100%;
}

.model-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.model-header {
  position: relative;
}

.model-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
}

.model-metrics {
  border-top: 1px solid rgba(var(--v-theme-primary), 0.1);
  border-bottom: 1px solid rgba(var(--v-theme-primary), 0.1);
  padding: 1rem 0;
}

.model-actions .v-btn {
  transition: all 0.3s ease;
}

.model-actions .v-btn:hover {
  transform: translateY(-2px);
}

/* Training Progress */
.progress-header {
  position: relative;
}

.progress-header::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 1px;
}

/* History Items */
.history-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.history-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.history-item:hover::before {
  left: 100%;
}

.history-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Analytics Cards */
.analytics-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.analytics-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.analytics-card:hover::before {
  left: 100%;
}

.analytics-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Settings Groups */
.setting-group {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.setting-group::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.setting-group:hover::before {
  left: 100%;
}

.setting-group:hover {
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

.overview-card {
  animation: fadeIn 0.5s ease forwards;
}

.overview-card:nth-child(1) { animation-delay: 0.1s; }
.overview-card:nth-child(2) { animation-delay: 0.2s; }
.overview-card:nth-child(3) { animation-delay: 0.3s; }
.overview-card:nth-child(4) { animation-delay: 0.4s; }

.model-card {
  animation: fadeIn 0.6s ease forwards;
}

.model-card:nth-child(1) { animation-delay: 0.1s; }
.model-card:nth-child(2) { animation-delay: 0.2s; }
.model-card:nth-child(3) { animation-delay: 0.3s; }
.model-card:nth-child(4) { animation-delay: 0.4s; }

.history-item {
  animation: fadeIn 0.3s ease forwards;
}

.analytics-card {
  animation: fadeIn 0.5s ease forwards;
}

.analytics-card:nth-child(1) { animation-delay: 0.1s; }
.analytics-card:nth-child(2) { animation-delay: 0.2s; }

.setting-group {
  animation: fadeIn 0.4s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .training-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .model-card .d-flex {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 600px) {
  .training-header h1 {
    font-size: 1.5rem;
  }
  
  .overview-card {
    margin-bottom: 1rem;
  }
  
  .model-card {
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

:deep(.v-slider) {
  transition: all 0.3s ease;
}

:deep(.v-slider:hover) {
  transform: scale(1.02);
}

:deep(.v-select) {
  transition: all 0.3s ease;
}

:deep(.v-select:hover) {
  transform: translateY(-1px);
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: translateY(-1px);
}

:deep(.v-checkbox) {
  transition: all 0.3s ease;
}

:deep(.v-checkbox:hover) {
  transform: scale(1.05);
}
</style>
