<template>
  <v-container class="pa-4">
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        <v-card variant="elevated" class="erpnext-test-card">
          <!-- Header -->
          <v-card-title class="text-h4 font-weight-bold text-center pa-6">
            <v-icon color="primary" size="32" class="me-3">mdi-test-tube</v-icon>
            {{ $t('erpNextTest') || 'اختبار ERPNext' }}
          </v-card-title>
          
          <v-divider />
          
          <!-- Actions -->
          <v-card-text class="pa-6">
            <v-row class="d-flex justify-center ga-3">
              <v-btn
                @click="testERPNext"
                :loading="loading && currentAction === 'test'"
                color="primary"
                variant="elevated"
                prepend-icon="mdi-power-plug"
                size="large"
              >
                {{ $t('testConnection') || 'اختبار الاتصال' }}
              </v-btn>
              
              <v-btn
                @click="getProducts"
                :loading="loading && currentAction === 'products'"
                color="info"
                variant="elevated"
                prepend-icon="mdi-package"
                size="large"
              >
                {{ $t('showProducts') || 'عرض المنتجات' }}
              </v-btn>
              
              <v-btn
                @click="createTestProduct"
                :loading="loading && currentAction === 'create'"
                color="success"
                variant="elevated"
                prepend-icon="mdi-plus"
                size="large"
              >
                {{ $t('addTestProduct') || 'إضافة منتج تجريبي' }}
              </v-btn>
            </v-row>
            
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
              <p class="text-body-1 text-medium-emphasis">
                {{ getLoadingMessage() }}
              </p>
            </div>
            
            <!-- Results -->
            <v-alert
              v-if="result"
              :type="result.success ? 'success' : 'error'"
              variant="tonal"
              class="mt-6"
              closable
              @click:close="result = null"
            >
              <v-alert-title class="d-flex align-center ga-2">
                <v-icon :icon="result.success ? 'mdi-check-circle' : 'mdi-alert-circle'" />
                {{ result.success ? ($t('success') || 'نجاح') : ($t('error') || 'خطأ') }}
              </v-alert-title>
              
              <v-alert-text>
                <div class="result-content">
                  <p class="mb-2" v-if="result.message">
                    {{ result.message }}
                  </p>
                  
                  <!-- Display products if available -->
                  <div v-if="result.data && Array.isArray(result.data) && result.data.length > 0">
                    <h4 class="text-h6 mb-3">{{ $t('products') || 'المنتجات' }} ({{ result.data.length }})</h4>
                    <v-list density="compact" max-height="300" class="overflow-y-auto">
                      <v-list-item
                        v-for="(product, index) in result.data.slice(0, 10)"
                        :key="product.id || index"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="32" color="primary">
                            <v-icon color="white">mdi-package</v-icon>
                          </v-avatar>
                        </template>
                        
                        <v-list-item-title>{{ product.name || product.item_name }}</v-list-item-title>
                        <v-list-item-subtitle>
                          SKU: {{ product.sku || product.item_code }} | 
                          {{ $t('price') || 'السعر' }}: {{ product.price || product.formatted_price || 'N/A' }}
                        </v-list-item-subtitle>
                        
                        <template v-slot:append>
                          <v-chip
                            :color="product.status === 'Active' ? 'success' : 'warning'"
                            size="small"
                            variant="tonal"
                          >
                            {{ product.status || 'N/A' }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                    
                    <v-btn
                      v-if="result.data.length > 10"
                      @click="showAllProducts = !showAllProducts"
                      variant="text"
                      color="primary"
                      class="mt-2"
                    >
                      {{ showAllProducts ? ($t('showLess') || 'عرض أقل') : ($t('showAll') || 'عرض الكل') }}
                    </v-btn>
                  </div>
                  
                  <!-- Display single product info -->
                  <div v-else-if="result.data && typeof result.data === 'object'">
                    <h4 class="text-h6 mb-3">{{ $t('productInfo') || 'معلومات المنتج' }}</h4>
                    <v-list density="compact">
                      <v-list-item v-for="(value, key) in result.data" :key="key">
                        <template v-slot:prepend>
                          <v-icon size="16" color="primary">mdi-information</v-icon>
                        </template>
                        <v-list-item-title>{{ key }}</v-list-item-title>
                        <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                  
                  <!-- Show raw JSON for debugging -->
                  <v-expansion-panels class="mt-4">
                    <v-expansion-panel>
                      <v-expansion-panel-title>
                        <v-icon class="me-2">mdi-code-json</v-icon>
                        {{ $t('viewRawData') || 'عرض البيانات الخام' }}
                      </v-expansion-panel-title>
                      <v-expansion-panel-text>
                        <v-code tag="pre" class="json-display">
                          {{ JSON.stringify(result, null, 2) }}
                        </v-code>
                      </v-expansion-panel-text>
                    </v-expansion-panel>
                  </v-expansion-panels>
                </div>
              </v-alert-text>
            </v-alert>
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
import ERPNextService from '@/integration/services/ERPNextService';

const { t } = useI18n();
const store = useStore();

// State
const result = ref(null);
const loading = ref(false);
const currentAction = ref('');
const showAllProducts = ref(false);

// Methods
const getLoadingMessage = () => {
  switch (currentAction.value) {
    case 'test':
      return t('testingConnection') || 'جاري اختبار الاتصال...';
    case 'products':
      return t('loadingProducts') || 'جاري تحميل المنتجات...';
    case 'create':
      return t('creatingProduct') || 'جاري إنشاء المنتج...';
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

const testERPNext = async () => {
  currentAction.value = 'test';
  loading.value = true;
  try {
    const response = await ERPNextService.testConnection();
    result.value = response;
    
    if (response.success) {
      showNotification(
        'success',
        t('connectionTestSuccess') || 'نجح اختبار الاتصال',
        response.message || t('erpNextConnected') || 'تم الاتصال بنجاح'
      );
    } else {
      showNotification(
        'error',
        t('connectionTestFailed') || 'فشل اختبار الاتصال',
        response.message || t('checkConnection') || 'تحقق من الاتصال'
      );
    }
  } catch (error) {
    result.value = {
      success: false,
      message: error.message,
      error: error
    };
    showNotification(
      'error',
      t('error') || 'خطأ',
      error.message || t('unexpectedError') || 'حدث خطأ غير متوقع'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};

const getProducts = async () => {
  currentAction.value = 'products';
  loading.value = true;
  try {
    const response = await ERPNextService.getProducts();
    result.value = response;
    
    if (response.success && response.data) {
      showNotification(
        'success',
        t('productsLoaded') || 'تم تحميل المنتجات',
        `${response.data.length} ${t('productsFound') || 'منتج تم العثور عليه'}`
      );
    } else {
      showNotification(
        'warning',
        t('noProductsFound') || 'لا توجد منتجات',
        response.message || t('tryDifferentFilters') || 'جرب فلترة مختلفة'
      );
    }
  } catch (error) {
    result.value = {
      success: false,
      message: error.message,
      error: error
    };
    showNotification(
      'error',
      t('loadProductsError') || 'خطأ في تحميل المنتجات',
      error.message || t('tryAgain') || 'حاول مرة أخرى'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};

const createTestProduct = async () => {
  currentAction.value = 'create';
  loading.value = true;
  try {
    const testProduct = {
      name: t('testProduct') || 'منتج تجريبي',
      sku: `TEST-${Date.now()}`,
      price: 99.99,
      category: 'walls',
      description: t('testProductDescription') || 'هذا منتج للتجربة والاختبار',
      status: 'Active',
      item_group: 'Products',
      stock_uom: 'Unit'
    };
    
    const response = await ERPNextService.createProduct(testProduct);
    result.value = response;
    
    if (response.success) {
      showNotification(
        'success',
        t('productCreated') || 'تم إنشاء المنتج',
        `${testProduct.name} ${t('createdSuccessfully') || 'تم إنشاؤه بنجاح'}`
      );
    } else {
      showNotification(
        'error',
        t('productCreationFailed') || 'فشل إنشاء المنتج',
        response.message || t('checkProductData') || 'تحقق من بيانات المنتج'
      );
    }
  } catch (error) {
    result.value = {
      success: false,
      message: error.message,
      error: error
    };
    showNotification(
      'error',
      t('createProductError') || 'خطأ في إنشاء المنتج',
      error.message || t('tryAgain') || 'حاول مرة أخرى'
    );
  } finally {
    loading.value = false;
    currentAction.value = '';
  }
};
</script>

<style scoped>
.erpnext-test-card {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 16px;
  overflow: hidden;
}

.result-content {
  max-height: 400px;
  overflow-y: auto;
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
.result-content::-webkit-scrollbar,
.json-display::-webkit-scrollbar {
  width: 6px;
}

.result-content::-webkit-scrollbar-track,
.json-display::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 3px;
}

.result-content::-webkit-scrollbar-thumb,
.json-display::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.5);
  border-radius: 3px;
}

.result-content::-webkit-scrollbar-thumb:hover,
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
}
</style>
