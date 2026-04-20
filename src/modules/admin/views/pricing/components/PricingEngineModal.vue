<template>
  <v-card>
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center">
        <v-icon class="me-2" color="#d4af37">mdi-currency-usd</v-icon>
        {{ isEdit ? $t('pricing.engine.editTitle', 'Edit Pricing Engine') : $t('pricing.engine.createTitle', 'Create Pricing Engine') }}
      </div>
      <v-btn
        icon="mdi-close"
        variant="text"
        @click="$emit('close')"
      ></v-btn>
    </v-card-title>

    <v-card-text class="pa-4">
      <v-form ref="form" @submit.prevent="handleSubmit">
        <v-row>
          <!-- Base Costs -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ $t('pricing.engine.baseCosts', 'Base Costs') }}</h3>
            
            <v-text-field
              v-model.number="form.rawMaterialCost"
              :label="$t('pricing.engine.rawMaterialCost', 'Raw Material Cost')"
              type="number"
              step="0.01"
              :prefix="form.currency"
              variant="outlined"
              density="compact"
              class="mb-3"
              :rules="[v => v >= 0 || $t('validation.positiveNumber', 'Must be positive')]"
            ></v-text-field>

            <v-text-field
              v-model.number="form.laborCost"
              :label="$t('pricing.engine.laborCost', 'Labor Cost')"
              type="number"
              step="0.01"
              :prefix="form.currency"
              variant="outlined"
              density="compact"
              class="mb-3"
              :rules="[v => v >= 0 || $t('validation.positiveNumber', 'Must be positive')]"
            ></v-text-field>

            <v-text-field
              v-model.number="form.internationalShipping"
              :label="$t('pricing.engine.internationalShipping', 'International Shipping')"
              type="number"
              step="0.01"
              :prefix="form.currency"
              variant="outlined"
              density="compact"
              class="mb-3"
              :rules="[v => v >= 0 || $t('validation.positiveNumber', 'Must be positive')]"
            ></v-text-field>
          </v-col>

          <!-- Tax and Currency Settings -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ $t('pricing.engine.taxCurrency', 'Tax & Currency') }}</h3>
            
            <v-select
              v-model="form.currency"
              :items="currencyOptions"
              :label="$t('pricing.engine.currency', 'Currency')"
              item-title="text"
              item-value="value"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-select>

            <v-text-field
              v-model.number="form.taxPercentage"
              :label="$t('pricing.engine.taxPercentage', 'Tax Percentage')"
              type="number"
              step="0.01"
              suffix="%"
              variant="outlined"
              density="compact"
              class="mb-3"
              :rules="[v => v >= 0 && v <= 100 || $t('validation.percentageRange', 'Must be between 0 and 100')]"
            ></v-text-field>

            <!-- Computed Total Cost Display -->
            <v-card class="mt-4" variant="outlined">
              <v-card-text class="pa-3">
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-2">{{ $t('pricing.engine.baseTotal', 'Base Total:') }}</span>
                  <span class="font-weight-bold">{{ formatCurrency(baseTotal) }}</span>
                </div>
                <div class="d-flex justify-space-between align-center mt-2">
                  <span class="text-body-2">{{ $t('pricing.engine.taxAmount', 'Tax Amount:') }}</span>
                  <span class="font-weight-bold">{{ formatCurrency(taxAmount) }}</span>
                </div>
                <v-divider class="my-2"></v-divider>
                <div class="d-flex justify-space-between align-center">
                  <span class="text-body-1 font-weight-bold">{{ $t('pricing.engine.totalWithTax', 'Total with Tax:') }}</span>
                  <span class="text-h6 gold-text">{{ formatCurrency(totalWithTax) }}</span>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- Validity Dates -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ $t('pricing.engine.validity', 'Validity Period') }}</h3>
            
            <v-text-field
              v-model="form.validFrom"
              :label="$t('pricing.engine.validFrom', 'Valid From')"
              type="datetime-local"
              variant="outlined"
              density="compact"
              class="mb-3"
            ></v-text-field>

            <v-text-field
              v-model="form.validTo"
              :label="$t('pricing.engine.validTo', 'Valid To')"
              type="datetime-local"
              variant="outlined"
              density="compact"
              class="mb-3"
              :rules="validToRules"
            ></v-text-field>

            <v-switch
              v-model="form.isActive"
              :label="$t('pricing.engine.isActive', 'Is Active')"
              color="primary"
              inset
            ></v-switch>
          </v-col>

          <!-- Status Information -->
          <v-col cols="12" md="6">
            <h3 class="text-h6 mb-3">{{ $t('pricing.engine.status', 'Status Information') }}</h3>
            
            <v-card variant="outlined">
              <v-card-text class="pa-3">
                <v-chip
                  :color="form.isActive ? 'success' : 'error'"
                  variant="elevated"
                  class="mb-2"
                >
                  <v-icon class="me-1" size="16">
                    {{ form.isActive ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  {{ form.isActive ? $t('common.active', 'Active') : $t('common.inactive', 'Inactive') }}
                </v-chip>

                <div v-if="form.validFrom || form.validTo" class="mt-3">
                  <div v-if="form.validFrom" class="text-body-2 mb-1">
                    <v-icon class="me-1" size="14">mdi-calendar-start</v-icon>
                    {{ $t('pricing.engine.startsFrom', 'Starts:') }} {{ formatDate(form.validFrom) }}
                  </div>
                  <div v-if="form.validTo" class="text-body-2">
                    <v-icon class="me-1" size="14">mdi-calendar-end</v-icon>
                    {{ $t('pricing.engine.endsOn', 'Ends:') }} {{ formatDate(form.validTo) }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn
        @click="$emit('close')"
        variant="outlined"
      >
        {{ $t('common.cancel', 'Cancel') }}
      </v-btn>
      <v-btn
        @click="handleSubmit"
        :color="loading ? 'grey' : 'primary'"
        :loading="loading"
        variant="elevated"
      >
        {{ isEdit ? $t('common.update', 'Update') : $t('common.create', 'Create') }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGraphQLPricing } from '@/shared/services/graphql-modules/GraphQLPricingService';

// Props
const props = defineProps({
  pricingEngine: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['close', 'created', 'updated']);

// Composables
const { t } = useI18n();
const { createPricingEngine, updatePricingEngine } = useGraphQLPricing();

// State
const loading = ref(false);
const form = ref({
  rawMaterialCost: 500,
  laborCost: 300,
  internationalShipping: 200,
  currency: 'DZD',
  taxPercentage: 0,
  validFrom: '',
  validTo: '',
  isActive: true
});

const formRef = ref(null);

// Computed
const isEdit = computed(() => !!props.pricingEngine);

const currencyOptions = computed(() => [
  { text: 'DZD ( Algerian Dinar)', value: 'DZD' },
  { text: 'EUR (Euro)', value: 'EUR' },
  { text: 'USD (US Dollar)', value: 'USD' },
  { text: 'GBP (British Pound)', value: 'GBP' }
]);

const baseTotal = computed(() => {
  return (form.value.rawMaterialCost || 0) + 
         (form.value.laborCost || 0) + 
         (form.value.internationalShipping || 0);
});

const taxAmount = computed(() => {
  if (form.value.taxPercentage) {
    return baseTotal.value * (form.value.taxPercentage / 100);
  }
  return 0;
});

const totalWithTax = computed(() => {
  return baseTotal.value + taxAmount.value;
});

const validToRules = computed(() => {
  if (!form.value.validFrom || !form.value.validTo) {
    return [];
  }
  return [
    v => new Date(v) > new Date(form.value.validFrom) || t('validation.validToAfterValidFrom', 'Valid to must be after valid from')
  ];
});

// Methods
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: form.value.currency || 'DZD',
    minimumFractionDigits: 2
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleString('ar-DZ');
};

const handleSubmit = async () => {
  if (!formRef.value?.validate()) {
    return;
  }

  try {
    loading.value = true;

    const payload = {
      rawMaterialCost: form.value.rawMaterialCost,
      laborCost: form.value.laborCost,
      internationalShipping: form.value.internationalShipping,
      currency: form.value.currency,
      taxPercentage: form.value.taxPercentage,
      validFrom: form.value.validFrom || null,
      validTo: form.value.validTo || null,
      isActive: form.value.isActive
    };

    let result;
    if (isEdit.value) {
      result = await updatePricingEngine(props.pricingEngine.id, payload);
      if (result.success) {
        emit('updated', result.pricingEngine);
      }
    } else {
      result = await createPricingEngine(payload);
      if (result.success) {
        emit('created', result.pricingEngine);
      }
    }

    if (result.success) {
      emit('close');
    }
  } catch (error) {
    console.error('Error saving pricing engine:', error);
  } finally {
    loading.value = false;
  }
};

const initializeForm = () => {
  if (props.pricingEngine) {
    form.value = {
      rawMaterialCost: props.pricingEngine.rawMaterialCost || 500,
      laborCost: props.pricingEngine.laborCost || 300,
      internationalShipping: props.pricingEngine.internationalShipping || 200,
      currency: props.pricingEngine.currency || 'DZD',
      taxPercentage: props.pricingEngine.taxPercentage || 0,
      validFrom: props.pricingEngine.validFrom ? 
        new Date(props.pricingEngine.validFrom).toISOString().slice(0, 16) : '',
      validTo: props.pricingEngine.validTo ? 
        new Date(props.pricingEngine.validTo).toISOString().slice(0, 16) : '',
      isActive: props.pricingEngine.isActive ?? true
    };
  }
};

// Watch for prop changes
watch(() => props.pricingEngine, initializeForm, { immediate: true });

// Lifecycle
onMounted(() => {
  initializeForm();
});
</script>

<style scoped>
.gold-text {
  color: #d4af37 !important;
}

.text-dim {
  color: rgba(255, 255, 255, 0.7);
}
</style>
