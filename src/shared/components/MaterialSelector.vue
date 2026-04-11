<template>
  <v-card class="material-selector" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-palette</v-icon>
      {{ $t('selectMaterial') || 'اختر المادة' }}
      <v-spacer />
      <v-chip
        v-if="selectedMaterial"
        :color="selectedMaterial.isPremium ? 'warning' : 'primary'"
        variant="elevated"
        size="small"
      >
        {{ selectedMaterial.isPremium ? ($t('premium') || 'مميز') : ($t('standard') || 'عادي') }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p class="text-body-2 mt-2">{{ $t('loadingMaterials') || 'جاري تحميل المواد...' }}</p>
      </div>

      <!-- Error State -->
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        class="mb-4"
      >
        {{ $t('materialsLoadError') || 'فشل تحميل المواد' }}
      </v-alert>

      <!-- Material Options -->
      <v-radio-group
        v-else
        v-model="selectedMaterialId"
        class="material-options"
        @update:model-value="onMaterialChange"
      >
        <v-row>
          <v-col
            v-for="material in displayMaterials"
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
              <v-radio :value="material.id" class="d-none" />
              
              <!-- Material Image -->
              <v-img
                :src="material.image || '/placeholder-material.jpg'"
                :alt="getMaterialName(material)"
                height="120"
                cover
                class="material-image"
              >
                <template v-slot:placeholder>
                  <v-sheet
                    color="grey-lighten-4"
                    class="d-flex align-center justify-center"
                    height="120"
                  >
                    <v-icon size="48" color="grey-lighten-2">mdi-palette</v-icon>
                  </v-sheet>
                </template>
              </v-img>

              <!-- Material Info -->
              <v-card-text class="pa-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h4 class="text-subtitle-1 font-weight-medium">
                    {{ getMaterialName(material) }}
                  </h4>
                  <v-chip
                    v-if="material.isPremium"
                    color="warning"
                    variant="elevated"
                    size="x-small"
                  >
                    {{ $t('premium') || 'مميز' }}
                  </v-chip>
                </div>

                <p class="text-body-2 text-medium-emphasis mb-2">
                  {{ material.description }}
                </p>

                <!-- Price Display -->
                <div class="d-flex align-center justify-space-between">
                  <span class="text-primary font-weight-bold">
                    {{ formatPrice(material.pricePerM2) }} /م²
                  </span>
                  <v-btn
                    :color="isSelected(material) ? 'primary' : 'default'"
                    :variant="isSelected(material) ? 'elevated' : 'outlined'"
                    size="small"
                  >
                    {{ isSelected(material) ? ($t('selected') || 'محدد') : ($t('select') || 'اختر') }}
                  </v-btn>
                </div>

                <!-- Material Properties -->
                <div v-if="material.properties && Object.keys(material.properties).length > 0" class="mt-2">
                  <v-chip
                    v-for="(value, key) in getDisplayProperties(material.properties)"
                    :key="key"
                    size="x-small"
                    variant="tonal"
                    class="me-1 mb-1"
                  >
                    {{ formatProperty(key, value) }}
                  </v-chip>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-radio-group>

      <!-- Selected Material Details -->
      <v-expand-transition>
        <div v-if="selectedMaterial" class="selected-details mt-4">
          <v-divider class="mb-3" />
          <h4 class="text-subtitle-1 font-weight-bold mb-2">
            {{ $t('selectedMaterialDetails') || 'تفاصيل المادة المحددة' }}
          </h4>
          
          <v-row>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <span class="text-caption text-medium-emphasis">{{ $t('materialName') }}:</span>
                <span class="text-body-2 ms-2">{{ getMaterialName(selectedMaterial) }}</span>
              </div>
              <div class="mb-2">
                <span class="text-caption text-medium-emphasis">{{ $t('pricePerM2') }}:</span>
                <span class="text-body-2 ms-2">{{ formatPrice(selectedMaterial.pricePerM2) }}</span>
              </div>
            </v-col>
            <v-col cols="12" md="6">
              <div class="mb-2">
                <span class="text-caption text-medium-emphasis">{{ $t('type') }}:</span>
                <v-chip
                  :color="selectedMaterial.isPremium ? 'warning' : 'primary'"
                  size="small"
                  class="ms-2"
                >
                  {{ selectedMaterial.isPremium ? ($t('premium') || 'مميز') : ($t('standard') || 'عادي') }}
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-expand-transition>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMaterials } from '@/composables/useMaterials';

// Props
const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  showPremiumOnly: {
    type: Boolean,
    default: false
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
const emit = defineEmits(['update:modelValue', 'change', 'price-update']);

// Composables
const { t } = useI18n();
const { 
  materials, 
  premiumMaterials, 
  activeMaterials, 
  loading, 
  error,
  selectMaterial: selectMaterialComposable,
  calculateTotalPrice
} = useMaterials();

// Local state
const selectedMaterialId = ref(null);
const selectedMaterial = ref(null);

// Computed
const displayMaterials = computed(() => {
  if (props.showPremiumOnly) {
    return premiumMaterials.value;
  }
  return activeMaterials.value;
});

const calculatedPrice = computed(() => {
  if (selectedMaterial.value && props.dimensions) {
    return calculateTotalPrice(selectedMaterial.value, props.dimensions, props.quantity);
  }
  return 0;
});

// Methods
const getMaterialName = (material) => {
  const locale = t('locale') || 'ar';
  return locale === 'ar' ? material.nameAr : material.nameEn;
};

const isSelected = (material) => {
  return selectedMaterial.value?.id === material.id;
};

const selectMaterial = (material) => {
  selectedMaterialId.value = material.id;
  selectedMaterial.value = material;
  selectMaterialComposable(material);
  
  emit('update:modelValue', material);
  emit('change', material);
  emit('price-update', calculatedPrice.value);
};

const onMaterialChange = (materialId) => {
  const material = displayMaterials.value.find(m => m.id === materialId);
  if (material) {
    selectMaterial(material);
  }
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(price);
};

const getDisplayProperties = (properties) => {
  const displayProps = {};
  Object.keys(properties).forEach(key => {
    if (properties[key] && typeof properties[key] !== 'object') {
      displayProps[key] = properties[key];
    }
  });
  return displayProps;
};

const formatProperty = (key, value) => {
  const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
  return `${formattedKey}: ${value}`;
};

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.id !== selectedMaterialId.value) {
    selectedMaterial.value = newValue;
    selectedMaterialId.value = newValue.id;
  }
}, { immediate: true });

watch(() => props.dimensions, () => {
  if (selectedMaterial.value) {
    emit('price-update', calculatedPrice.value);
  }
}, { deep: true });

watch(() => props.quantity, () => {
  if (selectedMaterial.value) {
    emit('price-update', calculatedPrice.value);
  }
});

// Initialize
onMounted(() => {
  if (props.modelValue) {
    selectedMaterial.value = props.modelValue;
    selectedMaterialId.value = props.modelValue.id;
  }
});
</script>

<style scoped>
.material-selector {
  border-radius: 12px;
}

.material-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
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

.material-image {
  border-radius: 8px 8px 0 0;
}

.material-options :deep(.v-radio-group) {
  .v-radio {
    display: none;
  }
}

.selected-details {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .material-card {
    margin-bottom: 8px;
  }
}
</style>
