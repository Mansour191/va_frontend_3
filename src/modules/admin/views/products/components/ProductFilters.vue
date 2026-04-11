<template>
  <v-card class="filters-card" elevation="2">
    <v-card-text class="pa-4">
      <!-- Search Section -->
      <div class="search-section mb-4">
        <v-text-field
          :model-value="searchQuery"
          @update:model-value="$emit('update:searchQuery', $event)"
          :label="$t('products.searchPlaceholder', 'البحث باسم المنتج، SKU، أو الوصف...')"
          prepend-inner-icon="mdi-magnify"
          append-inner-icon="mdi-close-circle"
          :append-inner-icon="searchQuery ? 'mdi-close-circle' : ''"
          @click:append-inner="searchQuery ? $emit('clear-search') : null"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="search-field"
        ></v-text-field>
      </div>

      <!-- Filters Section -->
      <v-row class="filters-row">
        <!-- Category Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="categoryFilter"
            @update:model-value="$emit('update:categoryFilter', $event)"
            :items="categoryOptions"
            :label="$t('products.categoryFilter', 'الفئة')"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-folder"
            clearable
            hide-details
            class="filter-select"
          ></v-select>
        </v-col>

        <!-- Stock Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="stockFilter"
            @update:model-value="$emit('update:stockFilter', $event)"
            :items="stockOptions"
            :label="$t('products.stockFilter', 'المخزون')"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-package"
            clearable
            hide-details
            class="filter-select"
          ></v-select>
        </v-col>

        <!-- Status Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="statusFilter"
            @update:model-value="$emit('update:statusFilter', $event)"
            :items="statusOptions"
            :label="$t('products.statusFilter', 'الحالة')"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-check-circle"
            clearable
            hide-details
            class="filter-select"
          ></v-select>
        </v-col>

        <!-- Price Range Filter -->
        <v-col cols="12" sm="6" md="3">
          <v-select
            :model-value="priceRangeFilter"
            @update:model-value="$emit('update:priceRangeFilter', $event)"
            :items="priceRangeOptions"
            :label="$t('products.priceRangeFilter', 'نطاق السعر')"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-currency-usd"
            clearable
            hide-details
            class="filter-select"
          ></v-select>
        </v-col>
      </v-row>

      <!-- Advanced Filters Toggle -->
      <div class="advanced-filters-section">
        <v-btn
          @click="showAdvancedFilters = !showAdvancedFilters"
          variant="text"
          size="small"
          prepend-icon="mdi-tune"
          class="advanced-filters-toggle"
        >
          {{ showAdvancedFilters ? $t('common.hideAdvanced', 'إخفاء المتقدم') : $t('common.showAdvanced', 'عرض المتقدم') }}
          <v-icon 
            :icon="showAdvancedFilters ? 'mdi-chevron-up' : 'mdi-chevron-down'" 
            class="ms-2"
          ></v-icon>
        </v-btn>

        <v-expand-transition>
          <div v-show="showAdvancedFilters" class="advanced-filters mt-4">
            <v-row>
              <!-- Date Range Filter -->
              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  :model-value="dateFromFilter"
                  @update:model-value="$emit('update:dateFromFilter', $event)"
                  :label="$t('products.dateFrom', 'من تاريخ')"
                  type="date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-start"
                  hide-details
                  class="filter-select"
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-text-field
                  :model-value="dateToFilter"
                  @update:model-value="$emit('update:dateToFilter', $event)"
                  :label="$t('products.dateTo', 'إلى تاريخ')"
                  type="date"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-calendar-end"
                  hide-details
                  class="filter-select"
                ></v-text-field>
              </v-col>

              <!-- Featured Filter -->
              <v-col cols="12" sm="6" md="4">
                <v-select
                  :model-value="featuredFilter"
                  @update:model-value="$emit('update:featuredFilter', $event)"
                  :items="featuredOptions"
                  :label="$t('products.featuredFilter', 'المميزات')"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  prepend-inner-icon="mdi-star"
                  clearable
                  hide-details
                  class="filter-select"
                ></v-select>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>

      <!-- Action Bar -->
      <div class="action-bar mt-4 d-flex align-center justify-space-between">
        <!-- View Mode Toggle -->
        <div class="view-toggle-group">
          <v-btn-toggle
            :model-value="viewMode"
            @update:model-value="$emit('update:viewMode', $event)"
            variant="outlined"
            density="compact"
            class="view-toggle"
          >
            <v-btn
              value="grid"
              icon="mdi-view-grid"
              :title="$t('products.gridView', 'عرض شبكي')"
            ></v-btn>
            <v-btn
              value="table"
              icon="mdi-table"
              :title="$t('products.tableView', 'عرض جدول')"
            ></v-btn>
            <v-btn
              value="list"
              icon="mdi-view-list"
              :title="$t('products.listView', 'عرض قائمة')"
            ></v-btn>
          </v-btn-toggle>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons d-flex gap-2">
          <v-btn
            @click="$emit('reset-filters')"
            variant="outlined"
            size="small"
            prepend-icon="mdi-refresh"
            class="reset-btn"
          >
            {{ $t('common.reset', 'إعادة تعيين') }}
          </v-btn>
          
          <v-btn
            @click="$emit('export-filters')"
            variant="outlined"
            size="small"
            prepend-icon="mdi-download"
            class="export-btn"
          >
            {{ $t('common.export', 'تصدير') }}
          </v-btn>

          <v-btn
            @click="$emit('save-filters')"
            variant="elevated"
            size="small"
            color="#d4af37"
            prepend-icon="mdi-content-save"
            class="save-btn"
          >
            {{ $t('common.save', 'حفظ') }}
          </v-btn>
        </div>
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="active-filters mt-4">
        <div class="d-flex align-center flex-wrap gap-2">
          <span class="active-filters-label text-caption font-weight-medium me-2">
            {{ $t('products.activeFilters', 'الفلاتر النشطة:') }}
          </span>
          
          <v-chip
            v-if="searchQuery"
            closable
            @click:close="$emit('update:searchQuery', '')"
            variant="elevated"
            size="small"
            class="active-filter-chip"
          >
            <v-icon icon="mdi-magnify" size="12" class="me-1"></v-icon>
            {{ $t('products.search', 'بحث') }}: {{ searchQuery }}
          </v-chip>
          
          <v-chip
            v-if="categoryFilter"
            closable
            @click:close="$emit('update:categoryFilter', '')"
            variant="elevated"
            size="small"
            class="active-filter-chip"
          >
            <v-icon icon="mdi-folder" size="12" class="me-1"></v-icon>
            {{ getCategoryLabel(categoryFilter) }}
          </v-chip>
          
          <v-chip
            v-if="stockFilter"
            closable
            @click:close="$emit('update:stockFilter', '')"
            variant="elevated"
            size="small"
            class="active-filter-chip"
          >
            <v-icon icon="mdi-package" size="12" class="me-1"></v-icon>
            {{ getStockLabel(stockFilter) }}
          </v-chip>
          
          <v-chip
            v-if="statusFilter"
            closable
            @click:close="$emit('update:statusFilter', '')"
            variant="elevated"
            size="small"
            class="active-filter-chip"
          >
            <v-icon icon="mdi-check-circle" size="12" class="me-1"></v-icon>
            {{ getStatusLabel(statusFilter) }}
          </v-chip>
          
          <v-chip
            v-if="priceRangeFilter"
            closable
            @click:close="$emit('update:priceRangeFilter', '')"
            variant="elevated"
            size="small"
            class="active-filter-chip"
          >
            <v-icon icon="mdi-currency-usd" size="12" class="me-1"></v-icon>
            {{ getPriceRangeLabel(priceRangeFilter) }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  searchQuery: { type: String, default: '' },
  categoryFilter: { type: String, default: '' },
  stockFilter: { type: String, default: '' },
  statusFilter: { type: String, default: '' },
  priceRangeFilter: { type: String, default: '' },
  dateFromFilter: { type: String, default: '' },
  dateToFilter: { type: String, default: '' },
  featuredFilter: { type: String, default: '' },
  viewMode: { type: String, default: 'grid' },
  categories: { type: Array, required: true }
});

// Emits
const emit = defineEmits([
  'update:searchQuery',
  'update:categoryFilter',
  'update:stockFilter',
  'update:statusFilter',
  'update:priceRangeFilter',
  'update:dateFromFilter',
  'update:dateToFilter',
  'update:featuredFilter',
  'update:viewMode',
  'clear-search',
  'reset-filters',
  'export-filters',
  'save-filters'
]);

// Composables
const { t } = useI18n();

// State
const showAdvancedFilters = ref(false);

// Computed
const categoryOptions = computed(() => [
  { value: '', label: t('products.allCategories', 'جميع الفئات') },
  ...props.categories
]);

const stockOptions = computed(() => [
  { value: '', label: t('products.allStockLevels', 'جميع مستويات المخزون') },
  { value: 'in-stock', label: t('products.inStock', 'متوفر') },
  { value: 'low-stock', label: t('products.lowStock', 'منخفض') },
  { value: 'out-of-stock', label: t('products.outOfStock', 'نفد') }
]);

const statusOptions = computed(() => [
  { value: '', label: t('products.allStatuses', 'جميع الحالات') },
  { value: 'active', label: t('products.active', 'نشط') },
  { value: 'inactive', label: t('products.inactive', 'غير نشط') },
  { value: 'low_stock', label: t('products.lowStock', 'مخزون منخفض') },
  { value: 'out_of_stock', label: t('products.outOfStock', 'نفد المخزون') }
]);

const priceRangeOptions = computed(() => [
  { value: '', label: t('products.allPriceRanges', 'جميع نطاقات السعر') },
  { value: '0-1000', label: t('products.under1000', 'أقل من 1000') },
  { value: '1000-5000', label: t('products.1000to5000', '1000 - 5000') },
  { value: '5000-10000', label: t('products.5000to10000', '5000 - 10000') },
  { value: '10000+', label: t('products.over10000', 'أكثر من 10000') }
]);

const featuredOptions = computed(() => [
  { value: '', label: t('products.allFeatured', 'الكل') },
  { value: 'featured', label: t('products.featuredOnly', 'المميزة فقط') },
  { value: 'not-featured', label: t('products.notFeatured', 'غير المميزة') }
]);

const hasActiveFilters = computed(() => {
  return props.searchQuery ||
         props.categoryFilter ||
         props.stockFilter ||
         props.statusFilter ||
         props.priceRangeFilter ||
         props.dateFromFilter ||
         props.dateToFilter ||
         props.featuredFilter;
});

// Methods
const getCategoryLabel = (value) => {
  const category = props.categories.find(cat => cat.value === value);
  return category ? category.label : value;
};

const getStockLabel = (value) => {
  const stock = stockOptions.value.find(option => option.value === value);
  return stock ? stock.label : value;
};

const getStatusLabel = (value) => {
  const status = statusOptions.value.find(option => option.value === value);
  return status ? status.label : value;
};

const getPriceRangeLabel = (value) => {
  const priceRange = priceRangeOptions.value.find(option => option.value === value);
  return priceRange ? priceRange.label : value;
};
</script>

<style scoped>
.filters-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

/* Search Field */
.search-field {
  transition: all 0.3s ease;
}

.search-field :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.search-field :deep(.v-field:hover) {
  border-color: #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
}

.search-field :deep(.v-field__input) {
  color: #1a1a2e;
  font-weight: 500;
}

.search-field :deep(.v-label) {
  color: #666;
  font-weight: 500;
}

/* Filter Selects */
.filter-select {
  transition: all 0.3s ease;
}

.filter-select :deep(.v-field) {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.filter-select :deep(.v-field:hover) {
  border-color: #d4af37;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.15);
}

.filter-select :deep(.v-field__input) {
  color: #1a1a2e;
  font-weight: 500;
}

.filter-select :deep(.v-label) {
  color: #666;
  font-weight: 500;
}

/* Advanced Filters */
.advanced-filters-toggle {
  color: #d4af37 !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.advanced-filters-toggle:hover {
  background: rgba(212, 175, 55, 0.1);
}

.advanced-filters {
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

/* View Toggle */
.view-toggle :deep(.v-btn-toggle) {
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  padding: 2px;
}

.view-toggle :deep(.v-btn) {
  border-radius: 10px;
  transition: all 0.3s ease;
}

.view-toggle :deep(.v-btn--active) {
  background: #d4af37 !important;
  color: #1a1a2e !important;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

/* Action Buttons */
.reset-btn {
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

.export-btn {
  border-color: #2196f3;
  color: #2196f3;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  transform: translateY(-1px);
}

.save-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* Active Filters */
.active-filters {
  background: rgba(212, 175, 55, 0.05);
  border-radius: 12px;
  padding: 12px;
  border: 1px solid rgba(212, 175, 55, 0.1);
}

.active-filters-label {
  color: #d4af37;
  font-weight: 600;
}

.active-filter-chip {
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.2s ease;
}

.active-filter-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}

/* Responsive Design */
@media (max-width: 960px) {
  .filters-row .v-col {
    padding: 4px !important;
  }
  
  .action-bar {
    flex-direction: column;
    align-items: stretch !important;
    gap: 12px;
  }
  
  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 600px) {
  .filters-card {
    border-radius: 12px;
  }
  
  .view-toggle :deep(.v-btn) {
    min-width: 40px;
    height: 40px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-buttons .v-btn {
    width: 100%;
  }
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.filters-card {
  animation: fadeIn 0.6s ease-out;
}

/* Hover Effects */
.filter-select:hover :deep(.v-field) {
  transform: translateY(-1px);
}

.active-filter-chip:hover {
  background: rgba(212, 175, 55, 0.1);
}

/* Loading State */
.filters-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.filters-card.loading :deep(.v-field) {
  background: rgba(212, 175, 55, 0.05);
}

/* Empty State */
.filters-card.empty {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filters-card.empty .v-card-text {
  text-align: center;
  color: #999;
}
</style>
