<template>
  <v-card class="products-table-card" elevation="2">
    <v-card-text class="pa-0">
      <v-data-table
        :headers="tableHeaders"
        :items="products"
        :loading="loading"
        :sort-by="[{ key: sortKey, order: sortOrder }]"
        :items-per-page="itemsPerPage"
        :items-per-page-options="[10, 25, 50, 100]"
        class="products-table"
        hover
        @click:row="handleRowClick"
      >
        <!-- Loading State -->
        <template v-slot:loading>
          <div class="text-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            ></v-progress-circular>
            <p class="text-body-1 text-dim">
              {{ $t('products.loading', 'جاري تحميل البيانات...') }}
            </p>
          </div>
        </template>

        <!-- No Data State -->
        <template v-slot:no-data>
          <div class="text-center pa-8">
            <v-icon icon="mdi-package-variant-closed" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
            <p class="text-h6 font-weight-medium text-grey-darken-1 mb-2">
              {{ $t('products.noProducts', 'لا توجد منتجات') }}
            </p>
            <p class="text-body-2 text-grey-darken-1">
              {{ $t('products.noProductsDesc', 'لم يتم العثور على أي منتجات. قم بإضافة منتج جديد للبدء.') }}
            </p>
          </div>
        </template>

        <!-- Product Column -->
        <template v-slot:item.product="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="48" class="me-3 product-avatar">
              <v-img 
                :src="item.image || '/api/placeholder/48/48'" 
                :alt="item.name"
                cover
              ></v-img>
            </v-avatar>
            <div>
              <div class="font-weight-bold product-name">{{ item.name }}</div>
              <div class="text-caption product-sku">{{ item.sku }}</div>
            </div>
          </div>
        </template>

        <!-- Category Column -->
        <template v-slot:item.category="{ item }">
          <v-chip
            :color="getCategoryColor(item.category)"
            variant="elevated"
            size="small"
            class="category-chip"
          >
            {{ getCategoryLabel(item.category) }}
          </v-chip>
        </template>

        <!-- Price Column -->
        <template v-slot:item.price="{ item }">
          <div class="d-flex align-center">
            <span class="font-weight-bold price-text">{{ formatAmount(item.price) }}</span>
          </div>
        </template>

        <!-- Stock Column -->
        <template v-slot:item.stock="{ item }">
          <v-chip
            :color="getStockColor(item.stock)"
            variant="elevated"
            size="small"
            class="stock-chip"
          >
            <v-icon icon="mdi-package" size="14" class="me-1"></v-icon>
            {{ item.stock }} {{ $t('products.units', 'قطعة') }}
          </v-chip>
        </template>

        <!-- Sales Column -->
        <template v-slot:item.sales="{ item }">
          <div class="d-flex align-center">
            <v-icon icon="mdi-shopping" size="16" class="me-1 sales-icon"></v-icon>
            <span class="sales-text">{{ item.sales || 0 }}</span>
          </div>
        </template>

        <!-- Status Column -->
        <template v-slot:item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            variant="elevated"
            size="small"
            class="status-chip"
          >
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-1">
            <v-btn
              icon="mdi-eye"
              variant="text"
              size="small"
              @click.stop="$emit('view', item)"
              class="action-btn view-btn"
              :title="$t('common.view', 'عرض')"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              @click.stop="$emit('edit', item)"
              class="action-btn edit-btn"
              :title="$t('common.edit', 'تعديل')"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click.stop="$emit('delete', item)"
              class="action-btn delete-btn"
              :title="$t('common.delete', 'حذف')"
            ></v-btn>
          </div>
        </template>

        <!-- Expand Row for Additional Details -->
        <template v-slot:expanded-row="{ columns, item }">
          <td :colspan="columns.length" class="pa-4">
            <v-card class="expanded-details" variant="outlined">
              <v-card-text class="pa-4">
                <v-row>
                  <v-col cols="12" md="6">
                    <div class="detail-section">
                      <h4 class="text-h6 font-weight-bold mb-3">
                        <v-icon icon="mdi-information" size="20" class="me-2"></v-icon>
                        {{ $t('products.details', 'تفاصيل المنتج') }}
                      </h4>
                      <div class="detail-item">
                        <span class="detail-label">{{ $t('products.description', 'الوصف') }}:</span>
                        <p class="detail-text">{{ item.description || $t('products.noDescription', 'لا يوجد وصف') }}</p>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">{{ $t('products.createdAt', 'تاريخ الإنشاء') }}:</span>
                        <span class="detail-value">{{ formatDate(item.createdAt) }}</span>
                      </div>
                    </div>
                  </v-col>
                  <v-col cols="12" md="6">
                    <div class="detail-section">
                      <h4 class="text-h6 font-weight-bold mb-3">
                        <v-icon icon="mdi-chart-line" size="20" class="me-2"></v-icon>
                        {{ $t('products.performance', 'الأداء') }}
                      </h4>
                      <div class="detail-item">
                        <span class="detail-label">{{ $t('products.revenue', 'الإيرادات') }}:</span>
                        <span class="detail-value">{{ formatAmount((item.sales || 0) * item.price) }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">{{ $t('products.rating', 'التقييم') }}:</span>
                        <v-rating
                          :model-value="item.rating || 0"
                          density="compact"
                          size="small"
                          readonly
                          color="amber"
                        ></v-rating>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </td>
        </template>
      </v-data-table>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CurrencyService from '@/integration/services/CurrencyService';

// Props
const props = defineProps({
  products: { type: Array, required: true },
  sortKey: { type: String, default: 'name' },
  sortOrder: { type: String, default: 'asc' },
  loading: { type: Boolean, default: false },
  itemsPerPage: { type: Number, default: 10 }
});

// Emits
const emit = defineEmits(['sort', 'view', 'edit', 'delete']);

// Composables
const { t } = useI18n();

// State
const expanded = ref([]);

// Computed
const tableHeaders = computed(() => [
  { 
    title: t('products.product', 'المنتج'), 
    key: 'product', 
    sortable: false,
    width: '300px'
  },
  { 
    title: t('products.category', 'التصنيف'), 
    key: 'category',
    sortable: true
  },
  { 
    title: t('products.price', 'السعر'), 
    key: 'price',
    sortable: true,
    align: 'start'
  },
  { 
    title: t('products.stock', 'المخزون'), 
    key: 'stock',
    sortable: true,
    align: 'start'
  },
  { 
    title: t('products.sales', 'المبيعات'), 
    key: 'sales',
    sortable: true,
    align: 'start'
  },
  { 
    title: t('products.status', 'الحالة'), 
    key: 'status',
    sortable: true
  },
  { 
    title: t('products.actions', 'الإجراءات'), 
    key: 'actions', 
    sortable: false,
    align: 'center',
    width: '120px'
  }
]);

// Methods
const formatAmount = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return t('products.notAvailable', 'غير متوفر');
  return new Date(dateString).toLocaleDateString('ar-DZ');
};

const getCategoryLabel = (category) => {
  const categories = {
    'ديكوري': t('categories.decorative', 'ديكوري'),
    'جدران': t('categories.walls', 'جدران'),
    'أرضيات': t('categories.floors', 'أرضيات'),
    'سقوف': t('categories.ceilings', 'سقوف'),
    'أثاث': t('categories.furniture', 'أثاث'),
    'مطابخ': t('categories.kitchens', 'مطابخ'),
    'حمامات': t('categories.bathrooms', 'حمامات'),
    'furniture': t('categories.furniture', 'أثاث'),
    'doors': t('categories.doors', 'أبواب'),
    'walls': t('categories.walls', 'جدران'),
    'ceilings': t('categories.ceilings', 'أسقف'),
    'tiles': t('categories.tiles', 'بلاط'),
    'kitchens': t('categories.kitchens', 'مطابخ'),
    'cars': t('categories.cars', 'سيارات')
  };
  return categories[category] || category;
};

const getCategoryColor = (category) => {
  const colors = {
    'ديكوري': '#d4af37',
    'جدران': '#4caf50',
    'أرضيات': '#2196f3',
    'سقوف': '#ff9800',
    'أثاث': '#9c27b0',
    'مطابخ': '#f44336',
    'حمامات': '#00bcd4',
    'furniture': '#9c27b0',
    'doors': '#795548',
    'walls': '#4caf50',
    'ceilings': '#ff9800',
    'tiles': '#607d8b',
    'kitchens': '#f44336',
    'cars': '#3f51b5'
  };
  return colors[category] || '#757575';
};

const getStockColor = (stock) => {
  if (stock === 0) return 'error';
  if (stock <= 10) return 'warning';
  return 'success';
};

const getStatusColor = (status) => {
  const colors = {
    'active': 'success',
    'inactive': 'error',
    'low_stock': 'warning',
    'out_of_stock': 'error',
    true: 'success',
    false: 'error'
  };
  return colors[status] || 'default';
};

const getStatusLabel = (status) => {
  const labels = {
    'active': t('products.active', 'نشط'),
    'inactive': t('products.inactive', 'غير نشط'),
    'low_stock': t('products.lowStock', 'مخزون منخفض'),
    'out_of_stock': t('products.outOfStock', 'نفد المخزون'),
    true: t('products.active', 'نشط'),
    false: t('products.inactive', 'غير نشط')
  };
  return labels[status] || status;
};

const handleRowClick = (event, { item }) => {
  emit('view', item);
};
</script>

<style scoped>
.products-table-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  overflow: hidden;
}

.products-table {
  background: transparent;
}

/* Table Header Styles */
:deep(.v-data-table__thead > tr > th) {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
  color: #d4af37 !important;
  font-weight: 600 !important;
  font-size: 0.875rem !important;
  border-bottom: 2px solid rgba(212, 175, 55, 0.2) !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Table Row Styles */
:deep(.v-data-table__tbody > tr:hover) {
  background: rgba(212, 175, 55, 0.05) !important;
  cursor: pointer;
}

:deep(.v-data-table__tbody > tr > td) {
  border-bottom: 1px solid rgba(212, 175, 55, 0.1) !important;
  padding: 16px !important;
  vertical-align: middle !important;
}

/* Product Cell Styles */
.product-avatar {
  border: 2px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

.product-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.product-name {
  color: #1a1a2e;
  font-size: 0.95rem;
  line-height: 1.4;
}

.product-sku {
  color: #666;
  font-size: 0.75rem;
  margin-top: 2px;
}

/* Category Chip */
.category-chip {
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.2s ease;
}

.category-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
}

/* Price Styles */
.price-text {
  color: #d4af37;
  font-size: 1rem;
  font-weight: 600;
}

/* Stock Chip */
.stock-chip {
  font-weight: 500;
  transition: all 0.2s ease;
}

.stock-chip:hover {
  transform: translateY(-1px);
}

/* Sales Styles */
.sales-icon {
  color: #666;
}

.sales-text {
  font-weight: 500;
  color: #1a1a2e;
}

/* Status Chip */
.status-chip {
  font-weight: 500;
  transition: all 0.2s ease;
}

.status-chip:hover {
  transform: translateY(-1px);
}

/* Action Buttons */
.action-btn {
  transition: all 0.2s ease;
  border-radius: 8px;
}

.action-btn:hover {
  transform: scale(1.1);
  background: rgba(212, 175, 55, 0.1);
}

.view-btn:hover {
  background: rgba(33, 150, 243, 0.1);
  color: #2196f3;
}

.edit-btn:hover {
  background: rgba(76, 175, 80, 0.1);
  color: #4caf50;
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  color: #f44336;
}

/* Expanded Row Styles */
.expanded-details {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 12px;
  margin: 8px;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h4 {
  color: #d4af37;
  display: flex;
  align-items: center;
}

.detail-item {
  margin-bottom: 12px;
}

.detail-label {
  font-weight: 600;
  color: #666;
  display: block;
  margin-bottom: 4px;
  font-size: 0.875rem;
}

.detail-text {
  color: #1a1a2e;
  line-height: 1.5;
  margin: 0;
}

.detail-value {
  color: #1a1a2e;
  font-weight: 500;
}

/* Pagination Styles */
:deep(.v-pagination__item) {
  background: rgba(255, 255, 255, 0.8);
  color: #1a1a2e;
  border: 1px solid rgba(212, 175, 55, 0.2);
  transition: all 0.3s ease;
}

:deep(.v-pagination__item:hover) {
  background: rgba(212, 175, 55, 0.1);
  border-color: #d4af37;
}

:deep(.v-pagination__item--is-active) {
  background: #d4af37 !important;
  color: #1a1a2e !important;
  border-color: #d4af37 !important;
}

/* Loading State */
.text-dim {
  color: #666 !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .products-table-card {
    border-radius: 12px;
  }
  
  :deep(.v-data-table__thead > tr > th) {
    font-size: 0.75rem !important;
    padding: 12px 8px !important;
  }
  
  :deep(.v-data-table__tbody > tr > td) {
    padding: 12px 8px !important;
  }
  
  .product-name {
    font-size: 0.875rem;
  }
  
  .price-text {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  :deep(.v-data-table__thead > tr > th) {
    font-size: 0.7rem !important;
    padding: 8px 4px !important;
  }
  
  :deep(.v-data-table__tbody > tr > td) {
    padding: 8px 4px !important;
  }
  
  .product-avatar {
    width: 40px !important;
    height: 40px !important;
  }
  
  .action-btn {
    width: 28px !important;
    height: 28px !important;
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

.products-table-card {
  animation: fadeIn 0.6s ease-out;
}

/* Empty State */
:deep(.v-data-table__empty-content) {
  padding: 48px 24px;
}

/* Sort Icon */
:deep(.v-data-table__thead > tr > th .v-data-table-header__sort-icon) {
  color: #d4af37 !important;
}

/* Checkbox for Selection */
:deep(.v-data-table__thead > tr > th .v-checkbox) {
  .v-selection-control__wrapper {
    border: 2px solid rgba(212, 175, 55, 0.3);
  }
}

:deep(.v-data-table__tbody > tr > td .v-checkbox) {
  .v-selection-control__wrapper {
    border: 1px solid rgba(212, 175, 55, 0.2);
  }
}
</style>
