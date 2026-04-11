<template>
  <v-dialog
    v-model="dialogVisible"
    max-width="600"
    persistent
    scrollable
  >
    <v-card class="glass-card">
      <v-card-title class="pa-4 pb-2">
        <div class="d-flex align-center">
          <v-avatar
            color="#d4af37"
            size="32"
            class="me-3"
          >
            <v-icon icon="mdi-pencil" size="16"></v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h5 font-weight-bold">
              {{ $t('pricing.editRule.title', 'تعديل قاعدة التسعير') }}
            </h3>
            <p class="text-body-2 text-dim mt-1">
              {{ $t('pricing.editRule.subtitle', 'قم بتعديل قاعدة التسعير الحالية') }}
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          @click="closeDialog"
          class="ms-auto"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pa-4">
        <v-form @submit.prevent="handleSubmit" ref="ruleForm">
          <v-row>
            <!-- Rule Name -->
            <v-col cols="12">
              <v-text-field
                v-model="editedRule.name"
                :label="$t('pricing.editRule.name', 'اسم القاعدة')"
                :placeholder="$t('pricing.editRule.namePlaceholder', 'أدخل اسم القاعدة')"
                variant="outlined"
                density="compact"
                :rules="nameRules"
                prepend-inner-icon="mdi-tag"
                required
              ></v-text-field>
            </v-col>

            <!-- Rule Type -->
            <v-col cols="12" md="6">
              <v-select
                v-model="editedRule.type"
                :items="ruleTypes"
                :label="$t('pricing.editRule.type', 'نوع القاعدة')"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                :rules="typeRules"
                prepend-inner-icon="mdi-cog"
                required
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar
                        :color="getRuleTypeColor(item.value)"
                        size="24"
                        class="me-3"
                      >
                        <v-icon :icon="getRuleTypeIcon(item.value)" size="14"></v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Rule Value -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="editedRule.value"
                :label="$t('pricing.editRule.value', 'قيمة القاعدة')"
                :placeholder="getValuePlaceholder()"
                type="number"
                step="0.01"
                variant="outlined"
                density="compact"
                :rules="valueRules"
                prepend-inner-icon="mdi-calculator"
                required
              >
                <template v-slot:append-inner>
                  <span class="text-caption text-dim">{{ getValueSuffix() }}</span>
                </template>
              </v-text-field>
            </v-col>

            <!-- Rule Description -->
            <v-col cols="12">
              <v-textarea
                v-model="editedRule.description"
                :label="$t('pricing.editRule.description', 'وصف القاعدة')"
                :placeholder="$t('pricing.editRule.descriptionPlaceholder', 'صف كيف تعمل هذه القاعدة')"
                variant="outlined"
                density="compact"
                rows="3"
                prepend-inner-icon="mdi-text"
                counter="200"
              ></v-textarea>
            </v-col>

            <!-- Target Products -->
            <v-col cols="12">
              <v-select
                v-model="editedRule.targetProducts"
                :items="products"
                :label="$t('pricing.editRule.targetProducts', 'المنتجات المستهدفة')"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="compact"
                multiple
                chips
                clearable
                prepend-inner-icon="mdi-package-variant-closed"
                :rules="productsRules"
              >
                <template v-slot:selection="{ item, index }">
                  <v-chip
                    v-if="index < 3"
                    size="small"
                    color="primary"
                    variant="elevated"
                    class="ma-1"
                  >
                    {{ item.title }}
                  </v-chip>
                  <span
                    v-if="index === 3"
                    class="text-grey text-caption align-self-center"
                  >
                    (+{{ editedRule.targetProducts.length - 3 }} {{ $t('common.others', 'آخرين') }})
                  </span>
                </template>
              </v-select>
            </v-col>

            <!-- Priority -->
            <v-col cols="12" md="6">
              <v-select
                v-model="editedRule.priority"
                :items="priorityOptions"
                :label="$t('pricing.editRule.priority', 'الأولوية')"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="compact"
                prepend-inner-icon="mdi-flag"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                    <template v-slot:prepend>
                      <v-avatar
                        :color="getPriorityColor(item.value)"
                        size="24"
                        class="me-3"
                      >
                        <v-icon icon="mdi-flag" size="14"></v-icon>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </template>
              </v-select>
            </v-col>

            <!-- Rule Status -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="editedRule.isActive"
                :label="$t('pricing.editRule.active', 'تفعيل القاعدة')"
                color="success"
                inset
                hide-details
              ></v-switch>
            </v-col>

            <!-- Conditions -->
            <v-col cols="12">
              <v-textarea
                v-model="editedRule.conditionsText"
                :label="$t('pricing.editRule.conditions', 'الشروط')"
                :placeholder="$t('pricing.editRule.conditionsPlaceholder', 'أدخل الشروط مفصولة بفواصل (مثال: موسم الأعياد, مخزون منخفض)')"
                variant="outlined"
                density="compact"
                rows="2"
                prepend-inner-icon="mdi-code-brackets"
              ></v-textarea>
            </v-col>

            <!-- Rule Statistics -->
            <v-col cols="12" v-if="originalRule">
              <v-card
                color="rgba(33, 150, 243, 0.1)"
                variant="tonal"
                class="pa-3"
              >
                <div class="d-flex align-center mb-2">
                  <v-icon class="me-2" color="#2196f3">mdi-chart-line</v-icon>
                  <span class="font-weight-bold">{{ $t('pricing.editRule.statistics', 'إحصائيات القاعدة') }}</span>
                </div>
                <div class="text-body-2">
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.createdAt', 'تاريخ الإنشاء') }}:</strong> 
                    {{ formatDate(originalRule.createdAt) }}
                  </p>
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.updatedAt', 'آخر تحديث') }}:</strong> 
                    {{ formatDate(originalRule.updatedAt) }}
                  </p>
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.appliedCount', 'عدد التطبيقات') }}:</strong> 
                    {{ originalRule.appliedCount || 0 }}
                  </p>
                  <p class="mb-0">
                    <strong>{{ $t('pricing.editRule.impact', 'التأثير') }}:</strong> 
                    <v-chip
                      :color="(originalRule.impact || 0) > 0 ? 'success' : 'error'"
                      size="small"
                      variant="elevated"
                      class="ms-2"
                    >
                      {{ (originalRule.impact || 0) > 0 ? '+' : '' }}{{ originalRule.impact || 0 }}%
                    </v-chip>
                  </p>
                </div>
              </v-card>
            </v-col>

            <!-- Preview Section -->
            <v-col cols="12" v-if="editedRule.name && editedRule.type && editedRule.value">
              <v-card
                color="rgba(212, 175, 55, 0.1)"
                variant="tonal"
                class="pa-3"
              >
                <div class="d-flex align-center mb-2">
                  <v-icon class="me-2" color="#d4af37">mdi-eye</v-icon>
                  <span class="font-weight-bold">{{ $t('pricing.editRule.preview', 'معاينة التعديلات') }}</span>
                </div>
                <div class="text-body-2">
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.ruleName', 'اسم القاعدة') }}:</strong> {{ editedRule.name }}
                  </p>
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.ruleType', 'نوع القاعدة') }}:</strong> 
                    {{ $t(`pricing.ruleTypes.${editedRule.type}`, editedRule.type) }}
                  </p>
                  <p class="mb-1">
                    <strong>{{ $t('pricing.editRule.ruleValue', 'قيمة القاعدة') }}:</strong> 
                    {{ formatRuleValue() }}
                  </p>
                  <p v-if="editedRule.targetProducts.length > 0" class="mb-1">
                    <strong>{{ $t('pricing.editRule.targetCount', 'عدد المنتجات المستهدفة') }}:</strong> 
                    {{ editedRule.targetProducts.length }}
                  </p>
                  <p class="mb-0">
                    <strong>{{ $t('pricing.editRule.ruleStatus', 'حالة القاعدة') }}:</strong> 
                    <v-chip
                      :color="editedRule.isActive ? 'success' : 'error'"
                      size="small"
                      variant="elevated"
                      class="ms-2"
                    >
                      {{ editedRule.isActive ? $t('common.active', 'نشط') : $t('common.inactive', 'غير نشط') }}
                    </v-chip>
                  </p>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          @click="closeDialog"
          variant="outlined"
        >
          <v-icon class="me-2">mdi-close</v-icon>
          {{ $t('common.cancel', 'إلغاء') }}
        </v-btn>
        <v-btn
          :color="loading ? 'grey' : 'primary'"
          :loading="loading"
          @click="handleSubmit"
          variant="elevated"
        >
          <v-icon class="me-2">mdi-content-save</v-icon>
          {{ $t('common.update', 'تحديث') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import PricingRulesService from '@/services/PricingRulesService';
import DashboardService from '@/services/DashboardService';

// Props and emits
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  rule: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'updated']);

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const ruleForm = ref(null);
const products = ref([]);
const originalRule = ref(null);

const editedRule = ref({
  id: '',
  name: '',
  type: '',
  description: '',
  value: '',
  priority: 'medium',
  targetProducts: [],
  conditionsText: '',
  isActive: true
});

// Computed
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const ruleTypes = computed(() => [
  { 
    title: t('pricing.ruleTypes.percentage', 'نسبة مئوية'), 
    value: 'percentage',
    description: t('pricing.ruleTypes.percentageDesc', 'زيادة أو إنقاص السعر بنسبة مئوية')
  },
  { 
    title: t('pricing.ruleTypes.fixed', 'قيمة ثابتة'), 
    value: 'fixed',
    description: t('pricing.ruleTypes.fixedDesc', 'إضافة أو طرح مبلغ ثابت من السعر')
  },
  { 
    title: t('pricing.ruleTypes.formula', 'معادلة'), 
    value: 'formula',
    description: t('pricing.ruleTypes.formulaDesc', 'حساب السعر بناءً على معادلة معقدة')
  },
  { 
    title: t('pricing.ruleTypes.conditional', 'شرطية'), 
    value: 'conditional',
    description: t('pricing.ruleTypes.conditionalDesc', 'تطبيق القاعدة بناءً على شروط محددة')
  }
]);

const priorityOptions = computed(() => [
  { 
    title: t('pricing.priority.low', 'منخفضة'), 
    value: 'low',
    description: t('pricing.priority.lowDesc', 'تطبيق القاعدة كخيار أخير')
  },
  { 
    title: t('pricing.priority.medium', 'متوسطة'), 
    value: 'medium',
    description: t('pricing.priority.mediumDesc', 'تطبيق القاعدة بعد القواعد العالية')
  },
  { 
    title: t('pricing.priority.high', 'عالية'), 
    value: 'high',
    description: t('pricing.priority.highDesc', 'تطبيق القاعدة أولاً')
  }
]);

// Validation rules
const nameRules = computed(() => [
  v => !!v || t('validation.required', 'هذا الحقل مطلوب'),
  v => (v && v.length >= 3) || t('validation.minLength', 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  v => (v && v.length <= 50) || t('validation.maxLength', 'الاسم يجب أن يكون 50 حرف كحد أقصى')
]);

const typeRules = computed(() => [
  v => !!v || t('validation.required', 'هذا الحقل مطلوب')
]);

const valueRules = computed(() => [
  v => !!v || t('validation.required', 'هذا الحقل مطلوب'),
  v => !isNaN(v) || t('validation.number', 'يجب أن يكون رقمًا'),
  v => (editedRule.value.type === 'percentage' ? (v >= -100 && v <= 100) : true) || 
    t('validation.percentageRange', 'النسبة المئوية يجب أن تكون بين -100 و 100')
]);

const productsRules = computed(() => [
  v => (v && v.length > 0) || t('validation.required', 'يجب اختيار منتج واحد على الأقل')
]);

// Methods
const loadProducts = async () => {
  try {
    const response = await DashboardService.getProducts({ limit: 100 });
    if (response.success) {
      products.value = response.data.products || [];
    } else {
      products.value = getMockProducts();
    }
  } catch (error) {
    console.error('Error loading products:', error);
    products.value = getMockProducts();
  }
};

const initializeRule = () => {
  if (props.rule) {
    originalRule.value = { ...props.rule };
    editedRule.value = {
      id: props.rule.id || '',
      name: props.rule.name || '',
      type: props.rule.type || '',
      description: props.rule.description || '',
      value: props.rule.value || '',
      priority: props.rule.priority || 'medium',
      targetProducts: props.rule.targetProducts || [],
      conditionsText: props.rule.conditions ? props.rule.conditions.join(', ') : '',
      isActive: props.rule.isActive !== undefined ? props.rule.isActive : true
    };
  }
};

const handleSubmit = async () => {
  if (!ruleForm.value) return;
  
  const { valid } = await ruleForm.value.validate();
  if (!valid) return;

  try {
    loading.value = true;
    
    const ruleData = {
      ...editedRule.value,
      conditions: editedRule.value.conditionsText 
        ? editedRule.value.conditionsText.split(',').map(c => c.trim()).filter(c => c)
        : []
    };
    
    const response = await PricingRulesService.updatePricingRule(editedRule.value.id, ruleData);
    
    if (response.success) {
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('pricing.editRule.success', 'تم تحديث القاعدة بنجاح')
      });
      
      emit('updated', response.data);
      closeDialog();
    } else {
      throw new Error(response.message || 'Failed to update rule');
    }
  } catch (error) {
    console.error('Error updating rule:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('pricing.editRule.error', 'فشل في تحديث القاعدة')
    });
  } finally {
    loading.value = false;
  }
};

const closeDialog = () => {
  dialogVisible.value = false;
  emit('close');
};

// Helper functions
const getRuleTypeColor = (type) => {
  const colors = {
    percentage: '#d4af37',
    fixed: '#4caf50',
    formula: '#2196f3',
    conditional: '#ff9800'
  };
  return colors[type] || '#9e9e9e';
};

const getRuleTypeIcon = (type) => {
  const icons = {
    percentage: 'mdi-percent',
    fixed: 'mdi-currency-usd',
    formula: 'mdi-function',
    conditional: 'mdi-code-braces'
  };
  return icons[type] || 'mdi-cog';
};

const getPriorityColor = (priority) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336'
  };
  return colors[priority] || '#9e9e9e';
};

const getValuePlaceholder = () => {
  const placeholders = {
    percentage: t('pricing.editRule.valuePlaceholderPercentage', 'مثال: 15 للزيادة بنسبة 15%'),
    fixed: t('pricing.editRule.valuePlaceholderFixed', 'مثال: 500 لإضافة 500 دينار'),
    formula: t('pricing.editRule.valuePlaceholderFormula', 'مثال: cost * 1.2'),
    conditional: t('pricing.editRule.valuePlaceholderConditional', 'مثال: 0 للشرط فقط')
  };
  return placeholders[editedRule.value.type] || t('pricing.editRule.valuePlaceholderDefault', 'أدخل القيمة');
};

const getValueSuffix = () => {
  const suffixes = {
    percentage: '%',
    fixed: 'د.ج',
    formula: '',
    conditional: ''
  };
  return suffixes[editedRule.value.type] || '';
};

const formatRuleValue = () => {
  if (editedRule.value.type === 'percentage') {
    return `${editedRule.value > 0 ? '+' : ''}${editedRule.value}%`;
  }
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(editedRule.value);
};

const formatDate = (dateString) => {
  if (!dateString) return t('pricing.editRule.notAvailable', 'غير متوفر');
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Mock data
const getMockProducts = () => [
  { id: 1, name: 'فينيل ديكوري فاخر' },
  { id: 2, name: 'فينيل جدران عصري' },
  { id: 3, name: 'فينيل أرضيات مقاوم' },
  { id: 4, name: 'فينيل سقف حديث' },
  { id: 5, name: 'فينيل أثاث كلاسيكي' },
  { id: 6, name: 'فينيل مطابخ حديث' },
  { id: 7, name: 'فينيل حمامات عصري' },
  { id: 8, name: 'فينيل غرف نوم كلاسيكي' }
];

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    initializeRule();
  }
});

watch(() => props.rule, () => {
  if (props.modelValue) {
    initializeRule();
  }
}, { deep: true });

// Lifecycle
onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.glass-card {
  background: rgba(30, 30, 30, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.gold-text {
  color: #d4af37 !important;
}

.text-dim {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Vuetify overrides */
:deep(.v-field) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

:deep(.v-field .v-field__input) {
  color: #fff;
}

:deep(.v-field .v-label) {
  color: rgba(255, 255, 255, 0.7);
}

:deep(.v-field .v-text-field__prefix),
:deep(.v-field .v-text-field__suffix) {
  color: rgba(255, 255, 255, 0.5);
}

:deep(.v-select .v-field__input) {
  color: #fff;
}

:deep(.v-textarea .v-field__input) {
  color: #fff;
}

:deep(.v-switch .v-switch__track) {
  background: rgba(255, 255, 255, 0.2);
}

:deep(.v-switch .v-switch__thumb) {
  background: #d4af37;
}

:deep(.v-chip) {
  transition: all 0.2s ease;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

/* Form validation styles */
:deep(.v-field--error .v-field__outline) {
  color: #f44336 !important;
}

:deep(.v-field--error .v-label) {
  color: #f44336 !important;
}

:deep(.v-messages__message) {
  color: #f44336;
}

/* Preview and statistics card styles */
.preview-card,
.statistics-card {
  border-radius: 12px;
}

.preview-card {
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.statistics-card {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.3);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  :deep(.v-dialog .v-card) {
    margin: 16px;
  }
  
  :deep(.v-card-text) {
    padding: 16px !important;
  }
}
</style>
