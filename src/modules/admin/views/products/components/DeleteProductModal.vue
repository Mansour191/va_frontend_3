<template>
  <v-dialog
    :model-value="show"
    @update:model-value="$emit('close')"
    max-width="500"
    persistent
    class="delete-product-dialog"
  >
    <v-card class="delete-modal" elevation="8">
      <!-- Header -->
      <v-card-title class="pa-4 delete-modal-header">
        <div class="d-flex align-center">
          <v-avatar color="error" size="40" class="me-3">
            <v-icon icon="mdi-delete-alert" size="24"></v-icon>
          </v-avatar>
          <div>
            <h3 class="text-h5 font-weight-bold">
              {{ $t('products.deleteTitle', 'تأكيد الحذف') }}
            </h3>
            <p class="text-body-2 text-dim mt-1">
              {{ $t('products.deleteSubtitle', 'هذا الإجراء لا يمكن التراجع عنه') }}
            </p>
          </div>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          size="small"
          @click="$emit('close')"
          class="close-btn"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Body -->
      <v-card-text class="pa-4">
        <!-- Warning Alert -->
        <v-alert
          type="warning"
          variant="tonal"
          class="mb-4 warning-alert"
          density="compact"
        >
          <template v-slot:prepend>
            <v-icon icon="mdi-alert-triangle" size="20"></v-icon>
          </template>
          <div class="text-body-2">
            {{ $t('products.deleteWarning', 'هل أنت متأكد من حذف هذا المنتج؟ سيتم حذف جميع البيانات المرتبطة به بشكل دائم.') }}
          </div>
        </v-alert>

        <!-- Product Info -->
        <div class="product-info-section">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t('products.productInfo', 'معلومات المنتج') }}
          </h4>
          
          <div class="product-details">
            <div class="d-flex align-center mb-3">
              <v-avatar size="48" class="me-3 product-avatar">
                <v-img 
                  :src="product?.image || '/api/placeholder/48/48'" 
                  :alt="product?.name"
                  cover
                ></v-img>
              </v-avatar>
              <div class="product-basic-info">
                <h5 class="text-h6 font-weight-bold text-error">
                  {{ product?.name || productName }}
                </h5>
                <p class="text-body-2 text-dim">
                  {{ $t('products.sku', 'رمز المنتج') }}: {{ product?.sku || 'N/A' }}
                </p>
              </div>
            </div>

            <div class="additional-info grid">
              <div class="info-item">
                <span class="info-label">{{ $t('products.category', 'الفئة') }}:</span>
                <span class="info-value">{{ getCategoryLabel(product?.category) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('products.price', 'السعر') }}:</span>
                <span class="info-value">{{ formatAmount(product?.price) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('products.stock', 'المخزون') }}:</span>
                <span class="info-value">{{ product?.stock || 0 }} {{ $t('products.units', 'قطعة') }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">{{ $t('products.sales', 'المبيعات') }}:</span>
                <span class="info-value">{{ product?.sales || 0 }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Impact Information -->
        <div class="impact-section" v-if="hasRelatedData">
          <h4 class="text-subtitle-1 font-weight-medium mb-3">
            {{ $t('products.impactInfo', 'تأثير الحذف') }}
          </h4>
          
          <v-list density="compact" class="impact-list">
            <v-list-item v-if="product?.orders > 0">
              <template v-slot:prepend>
                <v-icon icon="mdi-shopping" color="warning" size="20"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                {{ $t('products.ordersAffected', 'طلبات متأثرة') }}: {{ product.orders }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="product?.reviews > 0">
              <template v-slot:prepend>
                <v-icon icon="mdi-star" color="warning" size="20"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                {{ $t('products.reviewsAffected', 'تقييمات متأثرة') }}: {{ product.reviews }}
              </v-list-item-title>
            </v-list-item>
            
            <v-list-item v-if="product?.analytics">
              <template v-slot:prepend>
                <v-icon icon="mdi-chart-line" color="warning" size="20"></v-icon>
              </template>
              <v-list-item-title class="text-body-2">
                {{ $t('products.analyticsAffected', 'بيانات تحليلية متأثرة') }}
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </div>

        <!-- Confirmation Checkbox -->
        <div class="confirmation-section mt-4">
          <v-checkbox
            v-model="confirmationChecked"
            :label="$t('products.confirmDelete', 'أنا أفهم أن هذا الإجراء لا يمكن التراجع عنه')"
            color="error"
            hide-details
            class="confirmation-checkbox"
          ></v-checkbox>
        </div>
      </v-card-text>

      <v-divider></v-divider>

      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        
        <v-btn
          @click="$emit('close')"
          variant="outlined"
          prepend-icon="mdi-close"
          class="cancel-btn"
        >
          {{ $t('common.cancel', 'إلغاء') }}
        </v-btn>
        
        <v-btn
          @click="handleConfirm"
          color="error"
          variant="elevated"
          prepend-icon="mdi-delete"
          :disabled="!confirmationChecked"
          :loading="loading"
          class="delete-btn"
        >
          {{ $t('common.delete', 'حذف') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  show: { type: Boolean, required: true },
  productName: { type: String, default: '' },
  product: { type: Object, default: null },
  loading: { type: Boolean, default: false }
});

// Emits
const emit = defineEmits(['close', 'confirm']);

// Composables
const { t } = useI18n();

// State
const confirmationChecked = ref(false);

// Computed
const hasRelatedData = computed(() => {
  return props.product && (
    (props.product.orders && props.product.orders > 0) ||
    (props.product.reviews && props.product.reviews > 0) ||
    props.product.analytics
  );
});

// Methods
const formatAmount = (val) => {
  if (!val) return t('common.notAvailable', 'غير متوفر');
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(val);
};

const getCategoryLabel = (category) => {
  if (!category) return t('common.notAvailable', 'غير متوفر');
  
  const categories = {
    'ديكوري': t('categories.decorative', 'ديكوري'),
    'جدران': t('categories.walls', 'جدران'),
    'أرضيات': t('categories.floors', 'أرضيات'),
    'سقوف': t('categories.ceilings', 'سقوف'),
    'أثاث': t('categories.furniture', 'أثاث'),
    'مطابخ': t('categories.kitchens', 'مطابخ'),
    'حمامات': t('categories.bathrooms', 'حمامات')
  };
  return categories[category] || category;
};

const handleConfirm = () => {
  if (confirmationChecked.value) {
    emit('confirm');
  }
};

// Reset confirmation when dialog closes
const resetConfirmation = () => {
  confirmationChecked.value = false;
};

// Watch for dialog close
watch(() => props.show, (newValue) => {
  if (!newValue) {
    resetConfirmation();
  }
});
</script>

<style scoped>
.delete-modal {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(244, 67, 54, 0.2);
  border-radius: 20px;
  overflow: hidden;
}

/* Header */
.delete-modal-header {
  background: linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%);
  border-bottom: 1px solid rgba(244, 67, 54, 0.2);
}

.close-btn {
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(244, 67, 54, 0.1);
  transform: scale(1.1);
}

/* Alert */
.warning-alert {
  border-radius: 12px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

/* Product Info */
.product-info-section {
  background: rgba(244, 67, 54, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(244, 67, 54, 0.1);
  margin-bottom: 16px;
}

.product-avatar {
  border: 2px solid rgba(244, 67, 54, 0.3);
  box-shadow: 0 2px 8px rgba(244, 67, 54, 0.2);
}

.product-basic-info h5 {
  line-height: 1.3;
  margin-bottom: 4px;
}

.additional-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-weight: 600;
  color: #1a1a2e;
}

/* Impact Section */
.impact-section {
  background: rgba(255, 152, 0, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 152, 0, 0.1);
  margin-bottom: 16px;
}

.impact-list {
  background: transparent;
}

.impact-list :deep(.v-list-item) {
  padding-left: 0;
  padding-right: 0;
  min-height: auto;
}

/* Confirmation */
.confirmation-section {
  background: rgba(244, 67, 54, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(244, 67, 54, 0.1);
}

.confirmation-checkbox :deep(.v-checkbox) {
  align-items: flex-start;
}

.confirmation-checkbox :deep(.v-label) {
  font-size: 0.875rem;
  line-height: 1.4;
  color: #666;
}

/* Actions */
.cancel-btn {
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

.delete-btn {
  background: linear-gradient(135deg, #f44336 0%, #e53935 50%, #f44336 100%);
  color: white;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
  transition: all 0.3s ease;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(244, 67, 54, 0.4);
}

.delete-btn:disabled {
  background: #ccc;
  box-shadow: none;
  transform: none;
}

/* Responsive Design */
@media (max-width: 600px) {
  .delete-modal {
    border-radius: 16px;
  }
  
  .additional-info {
    grid-template-columns: 1fr;
  }
  
  .product-basic-info h5 {
    font-size: 1rem;
  }
  
  .cancel-btn,
  .delete-btn {
    font-size: 0.875rem;
    padding: 0 16px;
  }
}

/* Animation */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delete-modal {
  animation: slideIn 0.3s ease-out;
}

/* Hover Effects */
.product-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
}

.info-item:hover .info-value {
  color: #f44336;
}

/* Loading State */
.delete-btn:loading {
  pointer-events: none;
}

/* Text Styles */
.text-dim {
  color: #666 !important;
}

/* Dialog Overlay */
:deep(.v-overlay__scrim) {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

/* Dialog Content */
:deep(.v-dialog > .v-card) {
  margin: 24px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Scrollbar Styling */
.delete-modal::-webkit-scrollbar {
  width: 6px;
}

.delete-modal::-webkit-scrollbar-track {
  background: rgba(244, 67, 54, 0.1);
  border-radius: 3px;
}

.delete-modal::-webkit-scrollbar-thumb {
  background: rgba(244, 67, 54, 0.3);
  border-radius: 3px;
}

.delete-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(244, 67, 54, 0.5);
}
</style>
