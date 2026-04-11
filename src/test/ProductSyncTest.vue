<template>
  <v-container class="pa-4">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="8">
        <v-card variant="elevated" class="product-sync-test-card">
          <!-- Header -->
          <v-card-title class="text-h4 font-weight-bold text-center pa-6">
            <v-icon color="primary" size="32" class="me-3">mdi-sync</v-icon>
            {{ $t('productSyncTest') || 'اختبار مزامنة المنتجات مع ERPNext' }}
          </v-card-title>
          
          <v-divider />
          
          <!-- Actions -->
          <v-card-text class="pa-6">
            <v-row class="d-flex justify-center ga-3">
              <v-btn
                @click="runSync"
                :loading="loading && currentAction === 'sync'"
                color="primary"
                variant="elevated"
                prepend-icon="mdi-sync"
                size="large"
              >
                {{ $t('startSync') || 'بدء المزامنة' }}
              </v-btn>
              
              <v-btn
                @click="compareOnly"
                :loading="loading && currentAction === 'compare'"
                color="info"
                variant="elevated"
                prepend-icon="mdi-compare"
                size="large"
              >
                {{ $t('compareOnly') || 'مقارنة فقط' }}
              </v-btn>
              
              <v-btn
                @click="getStatus"
                :loading="loading && currentAction === 'status'"
                color="success"
                variant="elevated"
                prepend-icon="mdi-chart-line"
                size="large"
              >
                {{ $t('syncStatus') || 'حالة المزامنة' }}
              </v-btn>
            </v-row>
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
              <p class="text-body-1 text-medium-emphasis">
                {{ getLoadingMessage() }}
              </p>
            </div>
            
            <!-- Sync Status -->
            <v-alert
              v-if="status"
              type="info"
              variant="tonal"
              class="mt-6"
              closable
              @click:close="status = null"
            >
              <v-alert-title class="d-flex align-center ga-2">
                <v-icon>mdi-chart-line</v-icon>
                {{ $t('syncStatus') || 'حالة المزامنة' }}
              </v-alert-title>
              
              <v-alert-text>
                <v-list density="compact">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-sync</v-icon>
                    </template>
                    <v-list-item-title>
                      {{ $t('syncInProgress') || 'جاري المزامنة' }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      <v-chip
                        :color="status.inProgress ? 'warning' : 'success'"
                        size="small"
                        variant="tonal"
                      >
                        {{ status.inProgress ? ($t('yes') || 'نعم') : ($t('no') || 'لا') }}
                      </v-chip>
                    </v-list-item-subtitle>
                  </v-list-item>
                  
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon color="primary">mdi-clock</v-icon>
                    </template>
                    <v-list-item-title>
                      {{ $t('lastSync') || 'آخر مزامنة' }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ status.lastSync || ($t('never') || 'لم تتم بعد') }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-alert-text>
            </v-alert>
            
            <!-- Comparison Results -->
            <v-alert
              v-if="comparison"
              type="info"
              variant="tonal"
              class="mt-6"
              closable
              @click:close="comparison = null"
            >
              <v-alert-title class="d-flex align-center ga-2">
                <v-icon>mdi-compare</v-icon>
                {{ $t('comparisonResults') || 'نتائج المقارنة' }}
              </v-alert-title>
              
              <v-alert-text>
                <!-- Statistics -->
                <v-row class="mt-4 mb-4" dense>
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="info" class="text-center pa-3">
                      <v-icon color="info" size="24" class="mb-2">mdi-plus-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-info">
                        {{ comparison.toCreate?.length || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('toCreate') || 'للإضافة' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="warning" class="text-center pa-3">
                      <v-icon color="warning" size="24" class="mb-2">mdi-pencil-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-warning">
                        {{ comparison.toUpdate?.length || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('toUpdate') || 'للتحديث' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="success" class="text-center pa-3">
                      <v-icon color="success" size="24" class="mb-2">mdi-check-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-success">
                        {{ comparison.alreadySynced?.length || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('alreadySynced') || 'متزامن' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="error" class="text-center pa-3">
                      <v-icon color="error" size="24" class="mb-2">mdi-delete-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-error">
                        {{ comparison.toDelete?.length || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('toDelete') || 'للحذف' }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                
                <!-- Products to Create -->
                <v-expansion-panels v-if="comparison.toCreate?.length > 0" class="mt-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon class="me-2" color="info">mdi-plus-circle</v-icon>
                      {{ $t('newProductsToCreate') || 'منتجات جديدة للإضافة' }} ({{ comparison.toCreate.length }})
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list density="compact">
                        <v-list-item
                          v-for="product in comparison.toCreate"
                          :key="product.id"
                        >
                          <template v-slot:prepend>
                            <v-avatar size="32" color="info">
                              <v-icon color="white">mdi-package</v-icon>
                            </v-avatar>
                          </template>
                          
                          <v-list-item-title>{{ product.name }}</v-list-item-title>
                          <v-list-item-subtitle>
                            {{ $t('price') || 'السعر' }}: {{ product.price }} {{ $t('currency') || 'ر.س' }}
                          </v-list-item-subtitle>
                          
                          <template v-slot:append>
                            <v-chip
                              color="info"
                              size="small"
                              variant="elevated"
                            >
                              {{ $t('new') || 'جديد' }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-alert-text>
            </v-alert>
            
            <!-- Sync Results -->
            <v-alert
              v-if="syncResult"
              :type="syncResult.success ? 'success' : 'error'"
              variant="tonal"
              class="mt-6"
              closable
              @click:close="syncResult = null"
            >
              <v-alert-title class="d-flex align-center ga-2">
                <v-icon :icon="syncResult.success ? 'mdi-check-circle' : 'mdi-alert-circle'" />
                {{ syncResult.success ? ($t('syncSuccess') || 'نجحت المزامنة') : ($t('syncFailed') || 'فشلت المزامنة') }}
              </v-alert-title>
              
              <v-alert-text>
                <!-- Statistics -->
                <v-row class="mt-4 mb-4" dense>
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="success" class="text-center pa-3">
                      <v-icon color="success" size="24" class="mb-2">mdi-plus-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-success">
                        {{ syncResult.stats?.created || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('created') || 'تمت الإضافة' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="warning" class="text-center pa-3">
                      <v-icon color="warning" size="24" class="mb-2">mdi-pencil-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-warning">
                        {{ syncResult.stats?.updated || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('updated') || 'تم التحديث' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="error" class="text-center pa-3">
                      <v-icon color="error" size="24" class="mb-2">mdi-close-circle</v-icon>
                      <div class="text-h4 font-weight-bold text-error">
                        {{ syncResult.stats?.failed || 0 }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('failed') || 'فشل' }}
                      </div>
                    </v-card>
                  </v-col>
                  
                  <v-col cols="12" sm="3">
                    <v-card variant="tonal" color="info" class="text-center pa-3">
                      <v-icon color="info" size="24" class="mb-2">mdi-clock</v-icon>
                      <div class="text-h4 font-weight-bold text-info">
                        {{ syncResult.stats?.timeMs || 0 }}ms
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        {{ $t('time') || 'الوقت' }}
                      </div>
                    </v-card>
                  </v-col>
                </v-row>
                
                <!-- Errors -->
                <v-expansion-panels v-if="syncResult.errors?.length > 0" class="mt-4">
                  <v-expansion-panel>
                    <v-expansion-panel-title>
                      <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
                      {{ $t('errors') || 'الأخطاء' }} ({{ syncResult.errors.length }})
                    </v-expansion-panel-title>
                    <v-expansion-panel-text>
                      <v-list density="compact">
                        <v-list-item
                          v-for="(error, index) in syncResult.errors"
                          :key="index"
                        >
                          <template v-slot:prepend>
                            <v-avatar size="32" color="error">
                              <v-icon color="white">mdi-alert</v-icon>
                            </v-avatar>
                          </template>
                          
                          <v-list-item-title>{{ error.product }}</v-list-item-title>
                          <v-list-item-subtitle class="text-error">
                            {{ error.error }}
                          </v-list-item-subtitle>
                          
                          <template v-slot:append>
                            <v-chip
                              color="error"
                              size="small"
                              variant="elevated"
                            >
                              {{ $t('failed') || 'فشل' }}
                            </v-chip>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-alert-text>
            </v-alert>
            
            <!-- Raw Data -->
            <v-expansion-panels v-if="rawResult" class="mt-4">
              <v-expansion-panel>
                <v-expansion-panel-title>
                  <v-icon class="me-2">mdi-code-json</v-icon>
                  {{ $t('viewRawData') || 'عرض البيانات الخام' }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <v-code tag="pre" class="json-display">
                    {{ JSON.stringify(rawResult, null, 2) }}
                  </v-code>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import ProductSyncService from '@/integration/services/ProductSyncService';
import ERPNextService from '@/integration/services/ERPNextService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const currentAction = ref('');
const comparison = ref(null);
const syncResult = ref(null);
const status = ref(null);
const rawResult = ref(null);

// Methods
const getLoadingMessage = () => {
  switch (currentAction.value) {
    case 'sync':
      return t('syncingProducts') || 'جاري مزامنة المنتجات...';
    case 'compare':
      return t('comparingProducts') || 'جاري مقارنة المنتجات...';
    case 'status':
      return t('loadingStatus') || 'جاري تحميل الحالة...';
    default:
      return t('loading') || 'جاري التحميل...';
  }
};

const showNotification = (type, title, message) => {
  store.dispatch('notifications/add', {
    type,
    title,
    message,
    icon: type === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle',
    timeout: 5000
  });
};

const runSync = async () => {
  currentAction.value = 'sync';
  loading.value = true;
  comparison.value = null;
  syncResult.value = null;
  
  try {
    const result = await ProductSyncService.syncProducts({
      create: true,
      update: true,
      delete: false,
    });

    syncResult.value = result;
    rawResult.value = result;
    
    if (result.success) {
      showNotification(
        'success',
        t('syncSuccess') || 'نجحت المزامنة',
        `${result.stats?.created || 0} ${t('created') || 'تمت الإضافة'}, ${result.stats?.updated || 0} ${t('updated') || 'تم التحديث'} ${result.stats?.failed > 0 ? `, ${result.stats.failed} ${t('failed') || 'فشل'}` : ''}`
      );
    } else {
      showNotification(
        'error',
        t('syncFailed') || 'فشلت المزامنة',
        result.message || t('checkConnection') || 'تحقق من الاتصال'
      );
    }
  } catch (error) {
    syncResult.value = {
      success: false,
      message: error.message,
      error: error,
      stats: { created: 0, updated: 0, failed: 0, timeMs: 0 },
      errors: [{ product: 'N/A', error: error.message }]
    };
    rawResult.value = syncResult.value;
    showNotification(
      'error',
      t('syncError') || 'خطأ في المزامنة',
      error.message || t('tryAgain') || 'حاول مرة أخرى'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};

const compareOnly = async () => {
  currentAction.value = 'compare';
  loading.value = true;
  
  try {
    // Get products from both sources and compare without syncing
    const siteProducts = await ProductSyncService.getSiteProducts();
    const erpnextResponse = await ERPNextService.getProducts();
    const erpnextProducts = erpnextResponse.data || [];

    comparison.value = ProductSyncService.compareProducts(siteProducts, erpnextProducts);
    rawResult.value = comparison.value;
    
    showNotification(
      'info',
      t('comparisonComplete') || 'اكتملت المقارنة',
      `${comparison.value.toCreate?.length || 0} ${t('toCreate') || 'للإضافة'}, ${comparison.value.toUpdate?.length || 0} ${t('toUpdate') || 'للتحديث'}, ${comparison.value.alreadySynced?.length || 0} ${t('alreadySynced') || 'متزامن'}`
    );
  } catch (error) {
    showNotification(
      'error',
      t('comparisonError') || 'خطأ في المقارنة',
      error.message || t('tryAgain') || 'حاول مرة أخرى'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};

const getStatus = async () => {
  currentAction.value = 'status';
  loading.value = true;
  
  try {
    const response = await ProductSyncService.getSyncStatus();
    status.value = response;
    
    showNotification(
      'info',
      t('statusLoaded') || 'تم تحميل الحالة',
      response.inProgress ? (t('syncInProgress') || 'جاري المزامنة') : (t('syncIdle') || 'المزامنة متوقفة')
    );
  } catch (error) {
    status.value = {
      inProgress: false,
      lastSync: null,
      error: error.message
    };
    showNotification(
      'error',
      t('statusError') || 'خطأ في تحميل الحالة',
      error.message || t('tryAgain') || 'حاول مرة أخرى'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};
</script>

<style scoped>
.product-sync-test-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.json-display {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border-radius: 8px;
  padding: 12px;
  font-size: 0.875rem;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Custom scrollbar */
.json-display::-webkit-scrollbar {
  width: 6px;
}

.json-display::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 3px;
}

.json-display::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.5);
  border-radius: 3px;
}

.json-display::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.7);
}

/* Animations */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

.v-expansion-panel {
  transition: all 0.3s ease;
}

.v-expansion-panel:hover {
  background: rgba(var(--v-theme-primary), 0.02);
}

/* Statistics cards */
.v-card.text-center {
  transition: all 0.3s ease;
}

.v-card.text-center:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .d-flex.justify-center.ga-3 {
    flex-direction: column;
    align-items: stretch;
  }
  
  .v-btn {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .v-row.dense {
    gap: 8px;
  }
  
  .v-col[cols="12"][sm="3"] {
    margin-bottom: 8px;
  }
}

/* Loading animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.v-progress-circular {
  animation: pulse 2s infinite;
}
</style>
