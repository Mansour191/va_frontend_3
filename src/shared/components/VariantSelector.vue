<template>
  <v-card class="variant-selector" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-format-list-bulleted</v-icon>
      {{ $t('selectVariant') || 'اختر التنوع' }}
      <v-spacer />
      <v-chip
        v-if="selectedVariant"
        color="primary"
        variant="elevated"
        size="small"
      >
        {{ selectedVariant.sku }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p class="text-body-2 mt-2">{{ $t('loadingVariants') || 'جاري تحميل التنويعات...' }}</p>
      </div>

      <!-- No Variants State -->
      <div v-else-if="availableVariants.length === 0" class="text-center py-4">
        <v-icon color="grey-lighten-1" size="48" class="mb-2">mdi-package-variant</v-icon>
        <p class="text-body-2 text-medium-emphasis">
          {{ $t('noVariantsAvailable') || 'لا توجد تنويعات متاحة' }}
        </p>
      </div>

      <!-- Variant Options -->
      <div v-else>
        <!-- Radio Button Style -->
        <v-radio-group
          v-model="selectedVariantId"
          class="variant-options"
          @update:model-value="onVariantChange"
        >
          <v-row>
            <v-col
              v-for="variant in availableVariants"
              :key="variant.id"
              cols="12"
              sm="6"
              md="4"
              class="mb-2"
            >
              <v-card
                :class="{ 
                  'variant-card--selected': isSelected(variant),
                  'variant-card--unavailable': !isVariantAvailable(variant)
                }"
                class="variant-card cursor-pointer"
                elevation="2"
                hover
                @click="selectVariant(variant)"
              >
                <v-radio :value="variant.id" class="d-none" />
                
                <!-- Variant Header -->
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <h4 class="text-subtitle-1 font-weight-medium">
                      {{ formatVariantName(variant) }}
                    </h4>
                    <v-chip
                      :color="getVariantStockColor(variant)"
                      variant="elevated"
                      size="x-small"
                    >
                      {{ getVariantStockText(variant) }}
                    </v-chip>
                  </div>

                  <!-- SKU -->
                  <div class="text-caption text-medium-emphasis mb-2">
                    {{ $t('sku') || 'رمز المنتج' }}: {{ variant.sku }}
                  </div>

                  <!-- Price -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-primary font-weight-bold">
                      {{ formatPrice(variant.price) }}
                    </span>
                    <span
                      v-if="showPriceComparison && variant.price !== productBasePrice"
                      class="text-body-2 text-medium-emphasis text-decoration-line-through"
                    >
                      {{ formatPrice(productBasePrice) }}
                    </span>
                  </div>

                  <!-- Attributes -->
                  <div v-if="hasAttributes(variant)" class="attributes-list">
                    <v-chip
                      v-for="(value, key) in variant.attributes"
                      :key="key"
                      size="x-small"
                      variant="tonal"
                      class="me-1 mb-1"
                    >
                      {{ key }}: {{ value }}
                    </v-chip>
                  </div>

                  <!-- Stock Info -->
                  <div class="text-caption text-medium-emphasis mt-2">
                    {{ $t('availableStock') || 'المخزون المتاح' }}: {{ variant.stock }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-radio-group>

        <!-- Dropdown Style (Alternative) -->
        <v-select
          v-if="useDropdown"
          :model-value="selectedVariantId"
          :items="variantOptions"
          :label="$t('selectVariant') || 'اختر التنوع'"
          item-title="displayText"
          item-value="id"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="onVariantChange"
        >
          <template v-slot:selection="{ item }">
            <div class="d-flex align-center justify-space-between w-100">
              <span>{{ item.displayText }}</span>
              <v-chip
                :color="getVariantStockColor(item.raw)"
                size="x-small"
                variant="elevated"
              >
                {{ getVariantStockText(item.raw) }}
              </v-chip>
            </div>
          </template>
          
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props">
              <template v-slot:prepend>
                <v-icon :color="getVariantStockColor(item.raw)" class="me-2">
                  {{ getVariantStockIcon(item.raw) }}
                </v-icon>
              </template>
              <v-list-item-title>{{ item.displayText }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ $t('sku') || 'رمز المنتج' }}: {{ item.raw.sku }} | 
                {{ $t('price') || 'السعر' }}: {{ formatPrice(item.raw.price) }} | 
                {{ $t('stock') || 'المخزون' }}: {{ item.raw.stock }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>
      </div>
    </v-card-text>

    <!-- Selected Variant Details -->
    <v-expand-transition>
      <div v-if="selectedVariant" class="selected-details pa-4 pt-0">
        <v-divider class="mb-3" />
        <h4 class="text-subtitle-1 font-weight-bold mb-2">
          {{ $t('selectedVariantDetails') || 'تفاصيل التنوع المحدد' }}
        </h4>
        
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('variantName') }}:</span>
              <span class="text-body-2 ms-2">{{ selectedVariant.name }}</span>
            </div>
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('sku') }}:</span>
              <span class="text-body-2 ms-2">{{ selectedVariant.sku }}</span>
            </div>
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('price') }}:</span>
              <span class="text-body-2 ms-2 text-primary font-weight-bold">
                {{ formatPrice(selectedVariant.price) }}
              </span>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('stock') }}:</span>
              <v-chip
                :color="getVariantStockColor(selectedVariant)"
                size="small"
                class="ms-2"
              >
                {{ getVariantStockText(selectedVariant) }}
              </v-chip>
            </div>
            <div v-if="hasAttributes(selectedVariant)" class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('attributes') }}:</span>
              <div class="d-flex flex-wrap gap-1 mt-1">
                <v-chip
                  v-for="(value, key) in selectedVariant.attributes"
                  :key="key"
                  size="small"
                  variant="tonal"
                >
                  {{ key }}: {{ value }}
                </v-chip>
              </div>
            </div>
          </v-col>
        </v-row>
      </div>
    </v-expand-transition>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useProductDetails } from '@/composables/useProductDetails';

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  useDropdown: {
    type: Boolean,
    default: false
  },
  showPriceComparison: {
    type: Boolean,
    default: true
  }
});

// Emits
const emit = defineEmits(['variant-selected', 'price-change']);

// Composables
const { t } = useI18n();
const { 
  getAvailableVariants,
  getAllVariants,
  selectVariant: selectVariantComposable,
  getVariantStockStatus,
  getVariantStockStatusText,
  formatVariantName,
  formatPrice
} = useProductDetails();

// State
const selectedVariantId = ref(null);
const loading = ref(false);

// Computed
const availableVariants = computed(() => {
  if (!props.product) return [];
  return getAvailableVariants(props.product);
});

const allVariants = computed(() => {
  if (!props.product) return [];
  return getAllVariants(props.product);
});

const selectedVariant = computed(() => {
  if (!selectedVariantId.value || !props.product) return null;
  return allVariants.value.find(v => v.id === selectedVariantId.value);
});

const productBasePrice = computed(() => {
  return props.product?.basePrice || 0;
});

const variantOptions = computed(() => {
  return availableVariants.value.map(variant => ({
    id: variant.id,
    displayText: formatVariantName(variant),
    raw: variant
  }));
});

// Methods
const isSelected = (variant) => {
  return selectedVariantId.value === variant.id;
};

const isVariantAvailable = (variant) => {
  return variant.isActive && variant.stock > 0;
};

const hasAttributes = (variant) => {
  return variant.attributes && Object.keys(variant.attributes).length > 0;
};

const getVariantStockColor = (variant) => {
  const status = getVariantStockStatus(variant);
  const colorMap = {
    'in_stock': 'success',
    'low_stock': 'warning',
    'out_of_stock': 'error',
    'inactive': 'grey'
  };
  return colorMap[status] || 'grey';
};

const getVariantStockText = (variant) => {
  const status = getVariantStockStatus(variant);
  return getVariantStockStatusText(status);
};

const getVariantStockIcon = (variant) => {
  const status = getVariantStockStatus(variant);
  const iconMap = {
    'in_stock': 'mdi-check-circle',
    'low_stock': 'mdi-alert-circle',
    'out_of_stock': 'mdi-close-circle',
    'inactive': 'mdi-cancel'
  };
  return iconMap[status] || 'mdi-help-circle';
};

const selectVariant = (variant) => {
  if (!isVariantAvailable(variant)) return;
  
  selectedVariantId.value = variant.id;
  selectVariantComposable(variant);
  
  emit('variant-selected', variant);
  emit('price-change', variant.price);
  
  console.log('✅ Variant selected:', variant.name);
};

const onVariantChange = (variantId) => {
  const variant = availableVariants.value.find(v => v.id === variantId);
  if (variant) {
    selectVariant(variant);
  }
};

// Watchers
watch(() => props.product, (newProduct) => {
  if (newProduct) {
    // Auto-select first available variant if none selected
    if (!selectedVariantId.value && availableVariants.value.length > 0) {
      selectVariant(availableVariants.value[0]);
    }
  }
}, { immediate: true });

// Initialize
onMounted(() => {
  if (props.product && availableVariants.value.length > 0) {
    // Auto-select first available variant
    selectVariant(availableVariants.value[0]);
  }
});
</script>

<style scoped>
.variant-selector {
  border-radius: 12px;
}

.variant-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.variant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.variant-card--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.variant-card--unavailable {
  opacity: 0.6;
  cursor: not-allowed;
}

.variant-options :deep(.v-radio-group) {
  .v-radio {
    display: none;
  }
}

.attributes-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.selected-details {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .variant-card {
    margin-bottom: 8px;
  }
}
</style>
