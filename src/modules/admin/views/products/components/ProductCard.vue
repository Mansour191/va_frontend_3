<template>
  <v-card class="product-card" elevation="4" hover>
    <!-- Product Image with Overlay Actions -->
    <div class="product-image-container">
      <v-img
        :src="product.image || '/api/placeholder/300/200'"
        :alt="product.name"
        height="200"
        cover
        class="product-image"
      >
        <!-- Featured Badge -->
        <v-chip
          v-if="product.featured"
          color="#d4af37"
          variant="elevated"
          size="small"
          class="featured-badge ma-2"
        >
          <v-icon icon="mdi-star" size="12" class="me-1"></v-icon>
          {{ $t('products.featured', 'مميز') }}
        </v-chip>

        <!-- Overlay Actions -->
        <div class="image-overlay">
          <div class="action-buttons">
            <v-btn
              icon="mdi-eye"
              variant="elevated"
              size="small"
              color="white"
              class="action-btn view-btn"
              @click="$emit('view', product)"
              :title="$t('common.view', 'عرض')"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              variant="elevated"
              size="small"
              color="white"
              class="action-btn edit-btn"
              @click="$emit('edit', product)"
              :title="$t('common.edit', 'تعديل')"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              variant="elevated"
              size="small"
              color="error"
              class="action-btn delete-btn"
              @click="$emit('delete', product)"
              :title="$t('common.delete', 'حذف')"
            ></v-btn>
          </div>
        </div>
      </v-img>
    </div>

    <!-- Card Content -->
    <v-card-text class="pa-4">
      <!-- Header with SKU and Status -->
      <div class="d-flex justify-space-between align-center mb-2">
        <span class="sku-text">{{ product.sku }}</span>
        <v-chip
          :color="getStatusColor(product.status)"
          variant="elevated"
          size="x-small"
          class="status-chip"
        >
          <v-icon 
            :icon="getStatusIcon(product.status)" 
            size="10" 
            class="me-1"
          ></v-icon>
          {{ getStatusLabel(product.status) }}
        </v-chip>
      </div>

      <!-- Product Name -->
      <h3 class="product-name mb-2">{{ product.name }}</h3>

      <!-- Category -->
      <div class="d-flex align-center mb-3">
        <v-icon icon="mdi-folder" size="16" class="me-1 category-icon"></v-icon>
        <span class="category-text">{{ categoryLabel }}</span>
      </div>

      <!-- Description (if available) -->
      <p v-if="product.description" class="product-description mb-3">
        {{ product.description }}
      </p>

      <!-- Stock and Sales Info -->
      <div class="d-flex justify-space-between align-center mb-3">
        <div class="d-flex align-center">
          <v-icon icon="mdi-package" size="16" class="me-1 stock-icon"></v-icon>
          <span class="stock-text">{{ product.stock }} {{ $t('products.units', 'قطعة') }}</span>
        </div>
        <div class="d-flex align-center">
          <v-icon icon="mdi-shopping" size="16" class="me-1 sales-icon"></v-icon>
          <span class="sales-text">{{ product.sales || 0 }} {{ $t('products.sales', 'مبيعات') }}</span>
        </div>
      </div>

      <!-- Rating (if available) -->
      <div v-if="product.rating" class="d-flex align-center mb-3">
        <v-rating
          :model-value="product.rating"
          density="compact"
          size="small"
          readonly
          color="amber"
          class="me-2"
        ></v-rating>
        <span class="rating-text">({{ product.reviews || 0 }})</span>
      </div>
    </v-card-text>

    <!-- Card Footer with Price and Actions -->
    <v-divider></v-divider>
    
    <v-card-actions class="pa-4">
      <div class="flex-grow-1">
        <div class="price-container">
          <span class="price-text">{{ formatAmount(product.price) }}</span>
          <span v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
            {{ formatAmount(product.originalPrice) }}
          </span>
        </div>
        <div v-if="product.discount" class="discount-badge">
          {{ product.discount }}% {{ $t('products.off', 'خصم') }}
        </div>
      </div>
      
      <div class="d-flex gap-2">
        <v-btn
          variant="outlined"
          size="small"
          prepend-icon="mdi-eye"
          @click="$emit('view', product)"
        >
          {{ $t('common.view', 'عرض') }}
        </v-btn>
        <v-btn
          variant="elevated"
          size="small"
          color="#d4af37"
          prepend-icon="mdi-pencil"
          @click="$emit('edit', product)"
        >
          {{ $t('common.edit', 'تعديل') }}
        </v-btn>
      </div>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import CurrencyService from '@/integration/services/CurrencyService';

// Props
const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  categoryLabel: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['view', 'edit', 'delete']);

// Composables
const { t } = useI18n();

// Computed
const stockStatus = computed(() => {
  const stock = props.product.stock;
  if (stock === 0) return 'out';
  if (stock <= 10) return 'low';
  return 'in';
});

// Methods
const formatAmount = (val) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(val);
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

const getStatusIcon = (status) => {
  const icons = {
    'active': 'mdi-check-circle',
    'inactive': 'mdi-close-circle',
    'low_stock': 'mdi-alert',
    'out_of_stock': 'mdi-close-circle',
    true: 'mdi-check-circle',
    false: 'mdi-close-circle'
  };
  return icons[status] || 'mdi-help-circle';
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
</script>

<style scoped>
.product-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.25);
}

/* Image Container */
.product-image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.featured-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  font-weight: 600;
  border: 1px solid rgba(212, 175, 55, 0.3);
}

/* Image Overlay */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 0.6) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.product-card:hover .image-overlay {
  opacity: 1;
}

.action-buttons {
  display: flex;
  gap: 12px;
  transform: translateY(20px);
  transition: transform 0.3s ease;
}

.product-card:hover .action-buttons {
  transform: translateY(0);
}

.action-btn {
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.1);
}

.view-btn:hover {
  background: rgba(33, 150, 243, 0.9) !important;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.4);
}

.edit-btn:hover {
  background: rgba(76, 175, 80, 0.9) !important;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.delete-btn:hover {
  background: rgba(244, 67, 54, 0.9) !important;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

/* Card Content */
.sku-text {
  font-size: 0.75rem;
  color: #666;
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

.status-chip {
  font-weight: 500;
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.product-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.category-icon {
  color: #666;
}

.category-text {
  font-size: 0.875rem;
  color: #666;
  font-weight: 500;
}

.product-description {
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin: 0;
}

.stock-icon,
.sales-icon {
  color: #666;
}

.stock-text,
.sales-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
}

.rating-text {
  font-size: 0.75rem;
  color: #666;
}

/* Price Section */
.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.price-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: #d4af37;
}

.original-price {
  font-size: 0.875rem;
  color: #999;
  text-decoration: line-through;
  font-weight: 400;
}

.discount-badge {
  font-size: 0.75rem;
  color: #f44336;
  font-weight: 600;
  background: rgba(244, 67, 54, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

/* Card Actions */
:deep(.v-card-actions) {
  background: rgba(212, 175, 55, 0.05);
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

/* Responsive Design */
@media (max-width: 960px) {
  .product-name {
    font-size: 1rem;
  }
  
  .price-text {
    font-size: 1.125rem;
  }
  
  .action-btn {
    width: 40px !important;
    height: 40px !important;
  }
}

@media (max-width: 600px) {
  .product-card:hover {
    transform: translateY(-2px);
  }
  
  .product-name {
    font-size: 0.875rem;
  }
  
  .price-text {
    font-size: 1rem;
  }
  
  .action-btn {
    width: 36px !important;
    height: 36px !important;
  }
  
  :deep(.v-card-actions .v-btn) {
    font-size: 0.75rem;
    padding: 0 12px;
  }
}

/* Animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.product-card {
  animation: fadeInUp 0.6s ease-out;
}

/* Hover Effects for Stock Status */
.stock-text {
  transition: color 0.2s ease;
}

.product-card:hover .stock-text {
  color: getStockColor(props.product.stock);
}

/* Loading State */
.product-card.loading {
  opacity: 0.6;
  pointer-events: none;
}

.product-card.loading :deep(.v-img) {
  filter: blur(2px);
}

/* Empty State */
.product-card.empty {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.product-card.empty .v-icon {
  font-size: 64px;
  color: #ccc;
  margin-bottom: 16px;
}

.product-card.empty .v-card-text {
  text-align: center;
  color: #999;
}
</style>
