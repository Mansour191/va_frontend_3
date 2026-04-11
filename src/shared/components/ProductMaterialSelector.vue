<template>
  <v-card class="product-material-selector" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-palette</v-icon>
      {{ $t('selectMaterial') || 'اختر المادة' }}
      <v-spacer />
      <v-chip
        v-if="selectedMaterial"
        color="primary"
        variant="elevated"
        size="small"
      >
        {{ formatMaterialName(selectedMaterial) }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p class="text-body-2 mt-2">{{ $t('loadingMaterials') || 'جاري تحميل المواد...' }}</p>
      </div>

      <!-- No Materials State -->
      <div v-else-if="availableMaterials.length === 0" class="text-center py-4">
        <v-icon color="grey-lighten-1" size="48" class="mb-2">mdi-palette-off</v-icon>
        <p class="text-body-2 text-medium-emphasis">
          {{ $t('noMaterialsAvailable') || 'لا توجد مواد متاحة لهذا المنتج' }}
        </p>
      </div>

      <!-- Material Options -->
      <div v-else>
        <!-- Grid Style -->
        <v-row>
          <v-col
            v-for="material in availableMaterials"
            :key="material.id"
            cols="12"
            sm="6"
            md="4"
            class="mb-2"
          >
            <v-card
              :class="{ 
                'material-card--selected': isSelected(material),
                'material-card--premium': material.isPremium
              }"
              class="material-card cursor-pointer"
              elevation="2"
              hover
              @click="selectMaterial(material)"
            >
              <!-- Material Image -->
              <div class="material-image-container">
                <v-img
                  :src="getMaterialImage(material)"
                  :alt="formatMaterialName(material)"
                  height="120"
                  cover
                  class="material-image"
                >
                  <template v-slot:placeholder>
                    <v-skeleton-loader type="image" />
                  </template>
                  
                  <!-- Premium Badge -->
                  <v-chip
                    v-if="material.isPremium"
                    color="warning"
                    variant="elevated"
                    size="small"
                    class="premium-badge position-absolute top-2 right-2"
                  >
                    <v-icon size="small" class="me-1">mdi-star</v-icon>
                    {{ $t('premium') || 'مميز' }}
                  </v-chip>
                  
                  <!-- Selected Indicator -->
                  <div v-if="isSelected(material)" class="selected-indicator position-absolute top-2 left-2">
                    <v-icon color="success" size="24">mdi-check-circle</v-icon>
                  </div>
                </v-img>
              </div>
              
              <!-- Material Details -->
              <v-card-text class="pa-3">
                <h4 class="text-subtitle-1 font-weight-medium mb-2">
                  {{ formatMaterialName(material) }}
                </h4>
                
                <!-- Price -->
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-primary font-weight-bold">
                    {{ formatPrice(material.pricePerM2) }}/{{ $t('m2') || 'م²' }}
                  </span>
                  <span v-if="material.isPremium" class="text-caption text-warning">
                    +20%
                  </span>
                </div>

                <!-- Material Properties -->
                <div v-if="hasProperties(material)" class="properties-list mb-2">
                  <v-chip
                    v-for="(value, key) in getMaterialProperties(material)"
                    :key="key"
                    size="x-small"
                    variant="tonal"
                    class="me-1 mb-1"
                  >
                    {{ key }}: {{ value }}
                  </v-chip>
                </div>

                <!-- Description -->
                <div v-if="material.description" class="text-caption text-medium-emphasis">
                  {{ truncateText(material.description, 80) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Material Price Calculator -->
        <v-expand-transition>
          <div v-if="selectedMaterial && dimensions" class="price-calculator mt-4">
            <v-divider class="mb-3" />
            <h4 class="text-subtitle-1 font-weight-bold mb-3">
              {{ $t('materialPriceCalculation') || 'حساب سعر المادة' }}
            </h4>
            
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('material') }}:</span>
                  <span class="text-body-2 ms-2">{{ formatMaterialName(selectedMaterial) }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('dimensions') }}:</span>
                  <span class="text-body-2 ms-2">{{ dimensions.width }}×{{ dimensions.height}} سم</span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('area') }}:</span>
                  <span class="text-body-2 ms-2">{{ calculatedArea }} م²</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('unitPrice') }}:</span>
                  <span class="text-body-2 ms-2">{{ formatPrice(selectedMaterial.pricePerM2) }}/م²</span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('quantity') }}:</span>
                  <span class="text-body-2 ms-2">{{ quantity }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('totalMaterialCost') }}:</span>
                  <span class="text-body-2 ms-2 text-primary font-weight-bold">
                    {{ formatPrice(calculatedMaterialCost) }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn
        v-if="selectedMaterial"
        color="primary"
        variant="elevated"
        @click="confirmSelection"
      >
        {{ $t('confirmSelection') || 'تأكيد الاختيار' }}
      </v-btn>
    </v-card-actions>
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
  dimensions: {
    type: Object,
    default: () => ({ width: 100, height: 100 })
  },
  quantity: {
    type: Number,
    default: 1
  }
});

// Emits
const emit = defineEmits(['material-selected', 'price-change']);

// Composables
const { t } = useI18n();
const { 
  getAvailableMaterials,
  isMaterialAvailableForProduct,
  calculateProductMaterialPrice,
  formatMaterialName,
  getMaterialImage
} = useProductDetails();

// State
const selectedMaterial = ref(null);
const loading = ref(false);

// Computed
const availableMaterials = computed(() => {
  if (!props.product) return [];
  return getAvailableMaterials(props.product);
});

const calculatedArea = computed(() => {
  if (!props.dimensions) return 0;
  const area = (props.dimensions.width * props.dimensions.height) / 10000; // Convert cm² to m²
  return area.toFixed(2);
});

const calculatedMaterialCost = computed(() => {
  if (!selectedMaterial.value || !props.dimensions) return 0;
  return calculateProductMaterialPrice(
    props.product, 
    selectedMaterial.value, 
    props.dimensions, 
    props.quantity
  );
});

// Methods
const isSelected = (material) => {
  return selectedMaterial.value?.id === material.id;
};

const hasProperties = (material) => {
  return material.properties && Object.keys(material.properties).length > 0;
};

const getMaterialProperties = (material) => {
  if (!material.properties) return {};
  return material.properties;
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(price);
};

const selectMaterial = (material) => {
  if (!isMaterialAvailableForProduct(props.product, material.id)) {
    console.warn('Material is not available for this product');
    return;
  }
  
  selectedMaterial.value = material;
  
  emit('material-selected', material);
  emit('price-change', calculatedMaterialCost.value);
  
  console.log('✅ Material selected:', material.nameAr || material.nameEn);
};

const confirmSelection = () => {
  if (selectedMaterial.value) {
    emit('material-selected', selectedMaterial.value);
    emit('price-change', calculatedMaterialCost.value);
  }
};

// Watchers
watch(() => props.dimensions, () => {
  if (selectedMaterial.value) {
    emit('price-change', calculatedMaterialCost.value);
  }
}, { deep: true });

watch(() => props.quantity, () => {
  if (selectedMaterial.value) {
    emit('price-change', calculatedMaterialCost.value);
  }
});

// Initialize
onMounted(() => {
  loading.value = true;
  
  // Simulate loading or fetch additional data if needed
  setTimeout(() => {
    loading.value = false;
  }, 500);
});
</script>

<style scoped>
.product-material-selector {
  border-radius: 12px;
}

.material-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
  overflow: hidden;
}

.material-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.material-card--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.material-card--premium {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.material-image-container {
  position: relative;
  overflow: hidden;
}

.material-image {
  border-radius: 8px 8px 0 0;
}

.premium-badge {
  z-index: 1;
}

.selected-indicator {
  z-index: 2;
}

.properties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.price-calculator {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .material-card {
    margin-bottom: 8px;
  }
  
  .price-calculator .v-row {
    flex-direction: column;
  }
}
</style>
