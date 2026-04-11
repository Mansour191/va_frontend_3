<template>
  <v-card class="product-material-manager" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-palette</v-icon>
      {{ $t('manageProductMaterials') || 'إدارة مواد المنتج' }}
      <v-spacer />
      <v-chip
        :color="selectedMaterials.length > 0 ? 'success' : 'default'"
        variant="elevated"
        size="small"
      >
        {{ selectedMaterials.length }} {{ $t('selected') || 'محدد' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-1 mt-4">{{ $t('loadingMaterials') || 'جاري تحميل المواد...' }}</p>
      </div>

      <!-- Material Selection Interface -->
      <div v-else>
        <!-- Search and Filter -->
        <div class="d-flex align-center gap-3 mb-4">
          <v-text-field
            v-model="searchQuery"
            :label="$t('searchMaterials') || 'البحث عن مواد'"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            clearable
            hide-details
            class="flex-grow-1"
          />
          
          <v-select
            v-model="filterType"
            :items="filterOptions"
            :label="$t('filterBy') || 'تصفية حسب'"
            variant="outlined"
            density="compact"
            hide-details
            style="width: 150px"
          />
        </div>

        <!-- Quick Actions -->
        <div class="d-flex gap-2 mb-4">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-check-all"
            @click="selectAllMaterials"
            :disabled="filteredMaterials.length === 0"
          >
            {{ $t('selectAll') || 'تحديد الكل' }}
          </v-btn>
          <v-btn
            color="default"
            variant="elevated"
            prepend-icon="mdi-close-all"
            @click="clearAllSelections"
            :disabled="selectedMaterials.length === 0"
          >
            {{ $t('clearAll') || 'إلغاء الكل' }}
          </v-btn>
          <v-btn
            color="success"
            variant="elevated"
            prepend-icon="mdi-content-save"
            @click="saveMaterialAssignments"
            :loading="saving"
            :disabled="selectedMaterials.length === 0"
          >
            {{ $t('saveChanges') || 'حفظ التغييرات' }}
          </v-btn>
        </div>

        <!-- Materials Grid -->
        <v-row>
          <v-col
            v-for="material in filteredMaterials"
            :key="material.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card
              :class="{ 
                'material-card--selected': isMaterialSelected(material),
                'material-card--premium': material.isPremium,
                'material-card--inactive': !material.isActive
              }"
              class="material-card cursor-pointer"
              elevation="2"
              hover
              @click="toggleMaterialSelection(material)"
            >
              <!-- Material Image -->
              <div class="material-image-container position-relative">
                <v-img
                  :src="material.image || '/placeholder-material.jpg'"
                  :alt="material.nameAr || material.nameEn"
                  height="120"
                  cover
                  class="material-image"
                >
                  <template v-slot:placeholder>
                    <v-skeleton-loader type="image" />
                  </template>
                </v-img>
                
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
                
                <!-- Inactive Badge -->
                <v-chip
                  v-if="!material.isActive"
                  color="error"
                  variant="elevated"
                  size="small"
                  class="inactive-badge position-absolute top-2 left-2"
                >
                  {{ $t('inactive') || 'غير نشط' }}
                </v-chip>
                
                <!-- Selection Checkbox -->
                <v-checkbox
                  :model-value="isMaterialSelected(material)"
                  class="selection-checkbox position-absolute bottom-2 right-2"
                  color="success"
                  hide-details
                  @click.stop="toggleMaterialSelection(material)"
                />
              </div>
              
              <!-- Material Details -->
              <v-card-text class="pa-3">
                <h4 class="text-subtitle-1 font-weight-medium mb-2 text-truncate">
                  {{ material.nameAr || material.nameEn }}
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
                  {{ truncateText(material.description, 60) }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- No Materials Found -->
        <div v-if="filteredMaterials.length === 0" class="text-center py-8">
          <v-icon color="grey-lighten-1" size="48" class="mb-2">mdi-palette-off</v-icon>
          <p class="text-body-1 text-medium-emphasis">
            {{ $t('noMaterialsFound') || 'لم يتم العثور على مواد' }}
          </p>
        </div>
      </div>
    </v-card-text>

    <!-- Summary Section -->
    <v-expand-transition>
      <div v-if="selectedMaterials.length > 0" class="summary-section pa-4 pt-0">
        <v-divider class="mb-3" />
        <h4 class="text-subtitle-1 font-weight-bold mb-3">
          {{ $t('selectedMaterialsSummary') || 'ملخص المواد المحددة' }}
        </h4>
        
        <v-row>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('totalSelected') }}:</span>
              <span class="text-body-2 ms-2 font-weight-bold">{{ selectedMaterials.length }}</span>
            </div>
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('premiumMaterials') }}:</span>
              <span class="text-body-2 ms-2">{{ selectedPremiumMaterials.length }}</span>
            </div>
          </v-col>
          <v-col cols="12" md="6">
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('priceRange') }}:</span>
              <span class="text-body-2 ms-2">
                {{ formatPrice(minPrice) }} - {{ formatPrice(maxPrice) }}/{{ $t('m2') || 'م²' }}
              </span>
            </div>
            <div class="mb-2">
              <span class="text-caption text-medium-emphasis">{{ $t('averagePrice') }}:</span>
              <span class="text-body-2 ms-2 text-primary font-weight-bold">
                {{ formatPrice(averagePrice) }}/{{ $t('m2') || 'م²' }}
              </span>
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

// Props
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  initialAssignments: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['save', 'change']);

// Composables
const { t } = useI18n();

// State
const allMaterials = ref([]);
const selectedMaterials = ref([]);
const loading = ref(false);
const saving = ref(false);
const searchQuery = ref('');
const filterType = ref('all');

// Computed
const filterOptions = computed(() => [
  { title: t('all') || 'الكل', value: 'all' },
  { title: t('premium') || 'مميز', value: 'premium' },
  { title: t('standard') || 'عادي', value: 'standard' },
  { title: t('active') || 'نشط', value: 'active' },
  { title: t('inactive') || 'غير نشط', value: 'inactive' }
]);

const filteredMaterials = computed(() => {
  let materials = allMaterials.value;

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    materials = materials.filter(material => 
      (material.nameAr && material.nameAr.toLowerCase().includes(query)) ||
      (material.nameEn && material.nameEn.toLowerCase().includes(query)) ||
      (material.description && material.description.toLowerCase().includes(query))
    );
  }

  // Apply type filter
  switch (filterType.value) {
    case 'premium':
      materials = materials.filter(m => m.isPremium);
      break;
    case 'standard':
      materials = materials.filter(m => !m.isPremium);
      break;
    case 'active':
      materials = materials.filter(m => m.isActive);
      break;
    case 'inactive':
      materials = materials.filter(m => !m.isActive);
      break;
  }

  return materials;
});

const selectedPremiumMaterials = computed(() => {
  return selectedMaterials.value.filter(m => m.isPremium);
});

const minPrice = computed(() => {
  if (selectedMaterials.value.length === 0) return 0;
  return Math.min(...selectedMaterials.value.map(m => m.pricePerM2));
});

const maxPrice = computed(() => {
  if (selectedMaterials.value.length === 0) return 0;
  return Math.max(...selectedMaterials.value.map(m => m.pricePerM2));
});

const averagePrice = computed(() => {
  if (selectedMaterials.value.length === 0) return 0;
  const total = selectedMaterials.value.reduce((sum, m) => sum + m.pricePerM2, 0);
  return total / selectedMaterials.value.length;
});

// Methods
const isMaterialSelected = (material) => {
  return selectedMaterials.value.some(m => m.id === material.id);
};

const toggleMaterialSelection = (material) => {
  const index = selectedMaterials.value.findIndex(m => m.id === material.id);
  
  if (index > -1) {
    selectedMaterials.value.splice(index, 1);
  } else {
    selectedMaterials.value.push(material);
  }
  
  emit('change', selectedMaterials.value);
};

const selectAllMaterials = () => {
  selectedMaterials.value = [...filteredMaterials.value];
  emit('change', selectedMaterials.value);
};

const clearAllSelections = () => {
  selectedMaterials.value = [];
  emit('change', selectedMaterials.value);
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

const saveMaterialAssignments = async () => {
  if (selectedMaterials.value.length === 0) return;
  
  saving.value = true;
  
  try {
    // Prepare data for saving
    const assignments = selectedMaterials.value.map(material => ({
      productId: props.productId,
      materialId: material.id,
      isActive: true
    }));
    
    // Emit save event
    emit('save', assignments);
    
    console.log('✅ Material assignments saved:', assignments);
  } catch (error) {
    console.error('❌ Error saving material assignments:', error);
  } finally {
    saving.value = false;
  }
};

const loadMaterials = async () => {
  loading.value = true;
  
  try {
    // Mock API call to fetch all materials
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock materials data
    allMaterials.value = [
      {
        id: 1,
        nameAr: 'فينيل عالي الجودة',
        nameEn: 'High Quality Vinyl',
        pricePerM2: 1500,
        isPremium: false,
        isActive: true,
        image: '/materials/vinyl-premium.jpg',
        description: 'مادة فينيل عالية الجودة مناسبة للديكور الداخلي',
        properties: { durability: 'عالي', waterproof: 'نعم', thickness: '2mm' }
      },
      {
        id: 2,
        nameAr: 'فينيل مميز',
        nameEn: 'Premium Vinyl',
        pricePerM2: 2500,
        isPremium: true,
        isActive: true,
        image: '/materials/vinyl-luxury.jpg',
        description: 'مادة فينيل فاخرة مع حماية إضافية',
        properties: { durability: 'فائق', waterproof: 'نعم', thickness: '3mm', uvProtection: 'نعم' }
      },
      {
        id: 3,
        nameAr: 'ستيكر بلاستيك',
        nameEn: 'Plastic Sticker',
        pricePerM2: 800,
        isPremium: false,
        isActive: true,
        image: '/materials/plastic-sticker.jpg',
        description: 'ملصق بلاستيك اقتصادي',
        properties: { durability: 'متوسط', waterproof: 'نعم', thickness: '1mm' }
      }
    ];
    
    // Set initial selections from props
    if (props.initialAssignments && props.initialAssignments.length > 0) {
      selectedMaterials.value = props.initialAssignments.map(assignment => 
        allMaterials.value.find(m => m.id === assignment.materialId)
      ).filter(Boolean);
    }
    
    console.log('✅ Materials loaded:', allMaterials.value.length);
  } catch (error) {
    console.error('❌ Error loading materials:', error);
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(() => props.initialAssignments, (newAssignments) => {
  if (newAssignments && newAssignments.length > 0) {
    selectedMaterials.value = newAssignments.map(assignment => 
      allMaterials.value.find(m => m.id === assignment.materialId)
    ).filter(Boolean);
  }
}, { immediate: true });

// Initialize
onMounted(() => {
  loadMaterials();
});
</script>

<style scoped>
.product-material-manager {
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
  border-color: rgb(var(--v-theme-success));
  background: rgba(var(--v-theme-success), 0.05);
}

.material-card--premium {
  border-left: 4px solid rgb(var(--v-theme-warning));
}

.material-card--inactive {
  opacity: 0.6;
  cursor: not-allowed;
}

.material-image-container {
  position: relative;
  overflow: hidden;
}

.material-image {
  border-radius: 8px 8px 0 0;
}

.premium-badge,
.inactive-badge {
  z-index: 1;
}

.selection-checkbox {
  z-index: 2;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  padding: 4px;
}

.properties-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.summary-section {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .material-card {
    margin-bottom: 8px;
  }
  
  .d-flex.gap-3 {
    flex-direction: column;
  }
  
  .d-flex.gap-2 {
    flex-wrap: wrap;
  }
}
</style>
