<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 erpnext-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-cog</v-icon>
              {{ $t('erpNextIntegration') || 'إعدادات التكامل مع ERPNext' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('erpNextSubtitle') || 'تكوين وإدارة الاتصال مع نظام ERPNext' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="testConnection"
              :disabled="testing"
              variant="tonal"
              color="info"
              prepend-icon="mdi-plug"
            >
              {{ testing ? ($t('testing') || 'جاري الاختبار...') : ($t('testConnection') || 'اختبار الاتصال') }}
            </v-btn>
            <v-btn
              @click="saveSettings"
              :disabled="!settingsChanged"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-content-save"
            >
              {{ $t('saveSettings') || 'حفظ الإعدادات' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Connection Status -->
    <v-card 
      v-if="connectionTested" 
      variant="outlined" 
      class="mb-6"
      :color="connectionStatus ? 'success' : 'error'"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center ga-3">
          <v-icon 
            :color="connectionStatus ? 'success' : 'error'" 
            size="32"
          >
            {{ connectionStatus ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
          <div class="flex-grow-1">
            <h3 class="text-h6 font-weight-medium mb-1" :class="connectionStatus ? 'text-success' : 'text-error'">
              {{ connectionStatus ? ($t('connectionSuccess') || 'اتصال ناجح') : ($t('connectionFailed') || 'فشل الاتصال') }}
            </h3>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ connectionMessage }}</p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Settings Form -->
    <v-form @submit.prevent="saveSettings" class="settings-form">
      <!-- Connection Settings -->
      <v-card variant="elevated" class="mb-6">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-plug</v-icon>
            {{ $t('connectionSettings') || 'إعدادات الاتصال' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="settings.baseURL"
                :label="($t('serverUrl') || 'عنوان الخادم (URL)') + ' *'"
                placeholder="https://your-erpnext.com"
                type="url"
                required
                :hint="$t('serverUrlHint') || 'مثال: https://erpnext.yourcompany.com'"
                persistent-hint
                prepend-icon="mdi-web"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.apiKey"
                :label="($t('apiKey') || 'مفتاح API (API Key)') + ' *'"
                :placeholder="$t('enterApiKey') || 'أدخل مفتاح API'"
                required
                prepend-icon="mdi-key"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.apiSecret"
                :label="($t('apiSecret') || 'السر (API Secret)') + ' *'"
                :placeholder="$t('enterSecretKey') || 'أدخل secret key'"
                :type="showSecret ? 'text' : 'password'"
                required
                prepend-icon="mdi-lock"
                :append-inner-icon="showSecret ? 'mdi-eye-off' : 'mdi-eye'"
                @click:append-inner="showSecret = !showSecret"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="settings.timeout"
                :label="$t('requestTimeout') || 'مهلة الطلب (Timeout)'"
                type="number"
                min="5"
                max="120"
                :hint="$t('timeoutHint') || 'بالثواني (افتراضي: 30 ثانية)'"
                persistent-hint
                prepend-icon="mdi-clock"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Sync Settings -->
      <v-card variant="elevated" class="mb-6">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-sync</v-icon>
            {{ $t('syncSettings') || 'إعدادات المزامنة' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12">
              <v-checkbox
                v-model="settings.sync.autoSync"
                :label="$t('enableAutoSync') || 'تفعيل المزامنة التلقائية'"
                color="primary"
              />
            </v-col>
          </v-row>

          <v-row v-if="settings.sync.autoSync">
            <v-col cols="12" md="6">
              <v-select
                v-model="settings.sync.interval"
                :label="$t('syncInterval') || 'فترة المزامنة'"
                :items="syncIntervalOptions"
                prepend-icon="mdi-clock-outline"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.sync.retryAttempts"
                :label="$t('retryAttempts') || 'عدد محاولات إعادة المحاولة'"
                type="number"
                min="1"
                max="10"
                prepend-icon="mdi-refresh"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="settings.sync.autoCreateProducts"
                :label="$t('autoCreateProducts') || 'إنشاء منتجات جديدة في ERPNext تلقائياً'"
                color="primary"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="settings.sync.autoUpdateProducts"
                :label="$t('autoUpdateProducts') || 'تحديث المنتجات في ERPNext تلقائياً'"
                color="primary"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="settings.sync.autoCreateCustomers"
                :label="$t('autoCreateCustomers') || 'إنشاء عملاء جدد في ERPNext تلقائياً'"
                color="primary"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-checkbox
                v-model="settings.sync.autoCreateInvoices"
                :label="$t('autoCreateInvoices') || 'إنشاء فواتير للطلبات المكتملة تلقائياً'"
                color="primary"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Accounting Settings -->
      <v-card variant="elevated" class="mb-6">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-chart-line</v-icon>
            {{ $t('accountingSettings') || 'إعدادات المحاسبة' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.accounting.defaultWarehouse"
                :label="$t('defaultWarehouse') || 'المستودع الافتراضي'"
                placeholder="Stores - SA"
                prepend-icon="mdi-warehouse"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.accounting.defaultTaxAccount"
                :label="$t('defaultTaxAccount') || 'حساب الضرائب الافتراضي'"
                placeholder="VAT - 15% - SA"
                prepend-icon="mdi-receipt"
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" md="6">
              <v-select
                v-model="settings.accounting.defaultPaymentMethod"
                :label="$t('defaultPaymentMethod') || 'طريقة الدفع الافتراضية'"
                :items="paymentMethodOptions"
                prepend-icon="mdi-cash"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="settings.accounting.defaultTaxRate"
                :label="$t('defaultTaxRate') || 'نسبة الضريبة الافتراضية (%)'"
                type="number"
                min="0"
                max="100"
                step="0.1"
                prepend-icon="mdi-percent"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Product Category Mapping -->
      <v-card variant="elevated" class="mb-6">
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
            <v-icon color="primary">mdi-tag</v-icon>
            {{ $t('productCategoryMapping') || 'تصنيف المنتجات' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-alert
            type="info"
            variant="tonal"
            class="mb-4"
          >
            <v-alert-title>{{ $t('categoryMappingInfo') || 'معلومات التصنيف' }}</v-alert-title>
            {{ $t('categoryMappingDescription') || 'ربط تصنيفات الموقع مع مجموعات المنتجات في ERPNext' }}
          </v-alert>

          <v-row>
            <v-col
              v-for="(category, index) in categoryMappings"
              :key="index"
              cols="12"
              md="6"
              lg="4"
            >
              <v-card variant="outlined" class="category-mapping-card">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-3">
                    <v-chip color="primary" variant="tonal" size="small">
                      {{ category.siteLabel }}
                    </v-chip>
                    <v-icon color="primary">mdi-arrow-left</v-icon>
                  </div>
                  <v-text-field
                    v-model="category.erpnextGroup"
                    :placeholder="`${$t('erpnextGroup') || 'مجموعة'} ${category.siteLabel} ${$t('inERPNext') || 'في ERPNext'}`"
                    variant="outlined"
                    density="compact"
                    prepend-icon="mdi-folder"
                  />
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Action Buttons -->
      <v-card variant="elevated">
        <v-card-text class="pa-4">
          <div class="d-flex justify-end ga-3">
            <v-btn
              @click="resetSettings"
              variant="tonal"
              color="secondary"
              prepend-icon="mdi-undo"
            >
              {{ $t('reset') || 'إعادة تعيين' }}
            </v-btn>
            <v-btn
              type="submit"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-content-save"
              :disabled="!settingsChanged"
            >
              {{ $t('saveSettings') || 'حفظ الإعدادات' }}
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { erpNextSyncService } from '@/services/ERPNextSyncService';

const { t } = useI18n();
const store = useStore();

const emit = defineEmits(['settings-saved']);

// State
const testing = ref(false);
const connectionTested = ref(false);
const connectionStatus = ref(false);
const connectionMessage = ref('');
const showSecret = ref(false);
const originalSettings = ref(null);

const settings = reactive({
  baseURL: '',
  apiKey: '',
  apiSecret: '',
  timeout: 30,
  sync: {
    autoSync: false,
    interval: 60,
    retryAttempts: 3,
    autoCreateProducts: true,
    autoUpdateProducts: true,
    autoCreateCustomers: true,
    autoCreateInvoices: true,
  },
  accounting: {
    defaultWarehouse: 'Stores - SA',
    defaultTaxAccount: 'VAT - 15% - SA',
    defaultPaymentMethod: 'cash',
    defaultTaxRate: 15,
  },
});

const categoryMappings = ref([
  { siteKey: 'walls', siteLabel: t('walls') || 'جدران', erpnextGroup: t('wallStickers') || 'ملصقات جدران' },
  { siteKey: 'doors', siteLabel: t('doors') || 'أبواب', erpnextGroup: t('doorStickers') || 'ملصقات أبواب' },
  { siteKey: 'furniture', siteLabel: t('furniture') || 'أثاث', erpnextGroup: t('furnitureStickers') || 'ملصقات أثاث' },
  { siteKey: 'cars', siteLabel: t('cars') || 'سيارات', erpnextGroup: t('carStickers') || 'ملصقات سيارات' },
  { siteKey: 'kitchens', siteLabel: t('kitchens') || 'مطابخ', erpnextGroup: t('kitchenStickers') || 'ملصقات مطابخ' },
  { siteKey: 'ceilings', siteLabel: t('ceilings') || 'أسقف', erpnextGroup: t('ceilingStickers') || 'ملصقات أسقف' },
  { siteKey: 'tiles', siteLabel: t('tiles') || 'بلاط', erpnextGroup: t('tileStickers') || 'ملصقات بلاط' },
]);

// Computed
const settingsChanged = computed(() => {
  return JSON.stringify(originalSettings.value) !== JSON.stringify(settings);
});

const syncIntervalOptions = computed(() => [
  { title: t('every5Minutes') || 'كل 5 دقائق', value: 5 },
  { title: t('every15Minutes') || 'كل 15 دقيقة', value: 15 },
  { title: t('every30Minutes') || 'كل 30 دقيقة', value: 30 },
  { title: t('everyHour') || 'كل ساعة', value: 60 },
  { title: t('every6Hours') || 'كل 6 ساعات', value: 360 },
  { title: t('every12Hours') || 'كل 12 ساعة', value: 720 },
  { title: t('everyDay') || 'كل يوم', value: 1440 },
]);

const paymentMethodOptions = computed(() => [
  { title: t('cashOnDelivery') || 'الدفع عند الاستلام', value: 'cash' },
  { title: t('creditCard') || 'بطاقة ائتمان', value: 'card' },
  { title: t('bankTransfer') || 'تحويل بنكي', value: 'bank' },
]);

// Methods
const loadSettings = async () => {
  try {
    // Try to load from API first
    const result = await erpNextSyncService.getSettings();
    if (result.success && result.data) {
      Object.assign(settings, result.data);
      if (result.data.categoryMappings) {
        categoryMappings.value = result.data.categoryMappings;
      }
    } else {
      // Fallback to localStorage
      const saved = localStorage.getItem('erpnextSettings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          Object.assign(settings, parsed);
          if (parsed.categoryMappings) {
            categoryMappings.value = parsed.categoryMappings;
          }
        } catch (e) {
          console.error('Failed to load settings from localStorage:', e);
        }
      }
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
    // Fallback to localStorage
    const saved = localStorage.getItem('erpnextSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        Object.assign(settings, parsed);
        if (parsed.categoryMappings) {
          categoryMappings.value = parsed.categoryMappings;
        }
      } catch (e) {
        console.error('Failed to load settings from localStorage:', e);
      }
    }
  }
  
  originalSettings.value = JSON.parse(JSON.stringify(settings));
};

const testConnection = async () => {
  testing.value = true;
  connectionTested.value = true;
  
  try {
    // Save current settings first
    await saveSettingsToAPI();
    
    const result = await erpNextSyncService.testConnection();
    connectionStatus.value = result.success;
    connectionMessage.value = result.success
      ? (t('connectionSuccessMessage') || 'تم الاتصال بنجاح مع ERPNext')
      : result.message || (t('connectionFailedMessage') || 'فشل الاتصال');
    
    // Show notification
    store.dispatch('notifications/add', {
      type: connectionStatus.value ? 'success' : 'error',
      title: connectionStatus.value ? (t('connectionSuccess') || 'اتصال ناجح') : (t('connectionFailed') || 'فشل الاتصال'),
      message: connectionMessage.value,
      timeout: 5000
    });
  } catch (error) {
    connectionStatus.value = false;
    connectionMessage.value = error.message || (t('connectionError') || 'حدث خطأ أثناء الاتصال');
    
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('connectionError') || 'خطأ في الاتصال',
      message: connectionMessage.value,
      timeout: 5000
    });
  } finally {
    testing.value = false;
  }
};

const saveSettingsToAPI = async () => {
  try {
    const settingsToSave = {
      ...settings,
      categoryMappings: categoryMappings.value,
    };
    
    const result = await erpNextSyncService.saveSettings(settingsToSave);
    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to save settings to API');
    }
  } catch (error) {
    // Fallback to localStorage
    const settingsToSave = {
      ...settings,
      categoryMappings: categoryMappings.value,
    };
    localStorage.setItem('erpnextSettings', JSON.stringify(settingsToSave));
    throw error;
  }
};

const saveSettings = async () => {
  try {
    await saveSettingsToAPI();
    originalSettings.value = JSON.parse(JSON.stringify(settings));
    emit('settings-saved', { ...settings, categoryMappings: categoryMappings.value });
    
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('settingsSaved') || 'تم حفظ الإعدادات',
      message: t('settingsSavedMessage') || 'تم حفظ إعدادات ERPNext بنجاح',
      timeout: 3000
    });
  } catch (error) {
    console.error('Save error:', error);
    
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('settingsSaveFailed') || 'فشل حفظ الإعدادات',
      message: error.message || (t('settingsSaveFailedMessage') || 'فشل حفظ إعدادات ERPNext'),
      timeout: 5000
    });
  }
};

const resetSettings = async () => {
  try {
    const confirmed = await new Promise((resolve) => {
      store.dispatch('notifications/add', {
        type: 'warning',
        title: t('resetSettings') || 'إعادة تعيين الإعدادات',
        message: t('resetSettingsConfirm') || 'هل أنت متأكد من إعادة تعيين جميع الإعدادات؟',
        timeout: 0,
        actions: [
          {
            text: t('cancel') || 'إلغاء',
            color: 'secondary',
            handler: () => resolve(false)
          },
          {
            text: t('confirm') || 'تأكيد',
            color: 'error',
            handler: () => resolve(true)
          }
        ]
      });
    });
    
    if (confirmed) {
      await loadSettings();
      
      store.dispatch('notifications/add', {
        type: 'info',
        title: t('settingsReset') || 'تم إعادة تعيين الإعدادات',
        message: t('settingsResetMessage') || 'تم إعادة تعيين الإعدادات إلى القيم الافتراضية',
        timeout: 3000
      });
    }
  } catch (error) {
    console.error('Reset error:', error);
  }
};

// Lifecycle
onMounted(() => {
  loadSettings();
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
.erpnext-header {
  animation: fadeIn 0.5s ease;
}

/* Category Mapping Cards */
.category-mapping-card {
  transition: all 0.3s ease;
}

.category-mapping-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Form Styles */
.settings-form {
  animation: fadeIn 0.6s ease;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .d-flex.justify-space-between {
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
