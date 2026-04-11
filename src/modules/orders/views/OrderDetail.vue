<template>
  <div class="order-detail">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">جاري تحميل تفاصيل الطلب...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-alert type="error" prominent class="mb-4">
        <v-alert-title>خطأ في جلب البيانات</v-alert-title>
        <div>{{ error.message }}</div>
        <v-btn color="white" variant="outlined" class="mt-3" @click="fetchOrder">
          إعادة المحاولة
        </v-btn>
      </v-alert>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="order-content">
      <!-- Order Header -->
      <div class="order-header">
        <v-card class="mb-4">
          <v-card-text>
            <div class="header-content">
              <div class="header-left">
                <h1 class="order-title">تفاصيل الطلب #{{ order.orderNumber }}</h1>
                <div class="order-meta">
                  <v-chip :color="getStatusColor(order.status)" size="small" variant="flat">
                    {{ getStatusLabel(order.status) }}
                  </v-chip>
                  <span class="order-date">{{ formatDate(order.createdAt) }}</span>
                </div>
              </div>
              <div class="header-right">
                <v-btn
                  color="secondary"
                  prepend-icon="mdi-printer"
                  @click="generateInvoice"
                  :loading="generatingInvoice"
                >
                  طباعة الفاتورة
                </v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

      <!-- Customer Information -->
      <div class="customer-info">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-account</v-icon>
            معلومات العميل
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <span class="info-label">الاسم:</span>
                  <span class="info-value">{{ order.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">الهاتف:</span>
                  <span class="info-value">{{ order.phone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">البريد الإلكتروني:</span>
                  <span class="info-value">{{ order.email }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="info-item">
                  <span class="info-label">العنوان:</span>
                  <span class="info-value">{{ order.shippingAddress }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">الولاية:</span>
                  <span class="info-value">{{ order.wilaya?.nameAr }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">طريقة الدفع:</span>
                  <span class="info-value">{{ getPaymentMethodLabel(order.paymentMethod) }}</span>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>

      <!-- Order Items Table -->
      <div class="order-items">
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-shopping</v-icon>
            المنتجات المشتراة
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="itemsHeaders"
              :items="order.items"
              class="items-table"
              hide-default-footer
              disable-pagination
            >
              <template v-slot:item.product="{ item }">
                <div class="product-info">
                  <div class="product-image" v-if="item.product.images?.length">
                    <img :src="item.product.images[0].imageUrl" :alt="item.product.nameAr" />
                  </div>
                  <div class="product-details">
                    <div class="product-name">{{ item.product.nameAr }}</div>
                    <div class="product-sku" v-if="item.variant?.sku">SKU: {{ item.variant.sku }}</div>
                  </div>
                </div>
              </template>

              <template v-slot:item.material="{ item }">
                <div class="material-info">
                  <v-chip
                    :color="item.material?.isPremium ? 'warning' : 'primary'"
                    size="small"
                    variant="flat"
                    class="material-chip"
                  >
                    <v-icon start :icon="item.material?.isPremium ? 'mdi-star' : 'mdi-cube'"></v-icon>
                    {{ item.material?.nameAr || 'خامة قياسية' }}
                  </v-chip>
                  <div class="material-price" v-if="item.material?.pricePerM2">
                    {{ formatCurrency(item.material.pricePerM2) }} / م²
                  </div>
                </div>
              </template>

              <template v-slot:item.quantity="{ item }">
                <div class="quantity-info">
                  <span class="quantity-value">{{ item.quantity }}</span>
                  <span class="quantity-unit" v-if="item.variant?.attributes?.unit">
                    {{ item.variant.attributes.unit }}
                  </span>
                </div>
              </template>

              <template v-slot:item.price="{ item }">
                <div class="price-info">
                  <span class="unit-price">{{ formatCurrency(item.price) }}</span>
                  <span class="price-per-unit" v-if="item.variant?.attributes?.unit">
                    لكل {{ item.variant.attributes.unit }}
                  </span>
                </div>
              </template>

              <template v-slot:item.total="{ item }">
                <div class="total-price">
                  {{ formatCurrency(item.totalPrice) }}
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <v-card>
          <v-card-title>
            <v-icon class="me-2">mdi-receipt</v-icon>
            ملخص الطلب
          </v-card-title>
          <v-card-text>
            <div class="summary-items">
              <div class="summary-item">
                <span class="summary-label">المجموع الفرعي:</span>
                <span class="summary-value">{{ formatCurrency(order.subtotal) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">تكلفة الشحن:</span>
                <span class="summary-value">{{ formatCurrency(order.shippingCost) }}</span>
              </div>
              <div class="summary-item" v-if="order.tax > 0">
                <span class="summary-label">الضريبة:</span>
                <span class="summary-value">{{ formatCurrency(order.tax) }}</span>
              </div>
              <div class="summary-item" v-if="order.discountAmount > 0">
                <span class="summary-label">الخصم:</span>
                <span class="summary-value discount">-{{ formatCurrency(order.discountAmount) }}</span>
              </div>
              <div class="summary-item total">
                <span class="summary-label">المجموع:</span>
                <span class="summary-value">{{ formatCurrency(order.totalAmount) }}</span>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </div>

  <!-- Order Items Table -->
  <div class="order-items">
    <v-card class="mb-4">
      <v-card-title>
        <v-icon class="me-2">mdi-shopping</v-icon>
        المنتجات المشتراة
      </v-card-title>
      <v-card-text>
        <v-data-table
          :headers="itemsHeaders"
          :items="order.items"
          class="items-table"
          hide-default-footer
          disable-pagination
        >
          <template v-slot:item.product="{ item }">
            <div class="product-info">
              <div class="product-image" v-if="item.product.images?.length">
                <img :src="item.product.images[0].imageUrl" :alt="item.product.nameAr" />
              </div>
              <div class="product-details">
                <div class="product-name">{{ item.product.nameAr }}</div>
                <div class="product-sku" v-if="item.variant?.sku">SKU: {{ item.variant.sku }}</div>
              </div>
            </div>
          </template>

          <template v-slot:item.material="{ item }">
            <div class="material-info">
              <v-chip
                :color="item.material?.isPremium ? 'warning' : 'primary'"
                size="small"
                variant="flat"
                class="material-chip"
              >
                <v-icon start :icon="item.material?.isPremium ? 'mdi-star' : 'mdi-cube'"></v-icon>
                {{ item.material?.nameAr || 'خامة قياسية' }}
              </v-chip>
              <div class="material-price" v-if="item.material?.pricePerM2">
                {{ formatCurrency(item.material.pricePerM2) }} / م²
              </div>
            </div>
          </template>

          <template v-slot:item.quantity="{ item }">
            <div class="quantity-info">
              <span class="quantity-value">{{ item.quantity }}</span>
              <span class="quantity-unit" v-if="item.variant?.attributes?.unit">
                {{ item.variant.attributes.unit }}
              </span>
            </div>
          </template>

          <template v-slot:item.price="{ item }">
            <div class="price-info">
              <span class="unit-price">{{ formatCurrency(item.price) }}</span>
              <span class="price-per-unit" v-if="item.variant?.attributes?.unit">
                لكل {{ item.variant.attributes.unit }}
              </span>
            </div>
          </template>

          <template v-slot:item.total="{ item }">
            <div class="total-price">
              {{ formatCurrency(item.totalPrice) }}
            </div>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
      </div>

      <!-- Order Timeline -->
      <div class="order-timeline">
        <v-card>
          <v-card-title>
            <div class="d-flex align-center justify-space-between">
              <div class="d-flex align-center">
                <v-icon color="primary" class="me-2">mdi-timeline</v-icon>
                مسار الطلب
                <v-chip 
                  v-if="timeline.length > 0" 
                  size="small" 
                  color="primary" 
                  variant="flat" 
                  class="ms-2"
                >
                  {{ timeline.length }} تحديث
                </v-chip>
              </div>
              <v-btn
                @click="fetchTimeline"
                :loading="timelineLoading"
                variant="text"
                size="small"
                prepend-icon="mdi-refresh"
              >
                تحديث
              </v-btn>
            </div>
          </v-card-title>
          <v-card-text>
            <div v-if="timelineLoading && timeline.length === 0" class="text-center py-8">
              <v-progress-circular indeterminate color="primary" size="32"></v-progress-circular>
              <p class="mt-3 text-medium-emphasis">جاري تحميل مسار الطلب...</p>
            </div>
            
            <div v-else-if="timeline.length === 0" class="text-center py-8">
              <v-icon size="48" color="grey-lighten-1">mdi-timeline-text</v-icon>
              <p class="mt-3 text-medium-emphasis">لا توجد تحديثات بعد</p>
            </div>
            
            <v-timeline v-else density="compact" align="start">
              <v-timeline-item
                v-for="timelineEntry in timeline"
                :key="timelineEntry.id"
                :dot-color="getTimelineColor(timelineEntry.status)"
                size="small"
                :icon="getTimelineIcon(timelineEntry.status)"
              >
                <template v-slot:opposite>
                  <div class="timeline-date">
                    {{ formatFullDate(timelineEntry.createdAt) }}
                  </div>
                  <div class="timeline-time">
                    {{ formatTime(timelineEntry.createdAt) }}
                  </div>
                </template>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <div class="timeline-status">
                      <v-chip
                        :color="getTimelineColor(timelineEntry.status)"
                        size="small"
                        variant="flat"
                      >
                        <v-icon start :icon="getTimelineIcon(timelineEntry.status)"></v-icon>
                        {{ getStatusLabel(timelineEntry.status) }}
                      </v-chip>
                      <v-chip
                        v-if="timelineEntry.isAutomatic"
                        size="x-small"
                        color="info"
                        variant="flat"
                        class="ms-2"
                      >
                        <v-icon start icon="mdi-robot"></v-icon>
                        تلقائي
                      </v-chip>
                    </div>
                    <div class="timeline-meta">
                      <span v-if="timelineEntry.createdBy" class="timeline-user">
                        بواسطة: {{ getUserName(timelineEntry.createdBy) }}
                      </span>
                    </div>
                  </div>
                  <div class="timeline-note" v-if="timelineEntry.note">
                    <v-icon size="small" class="me-1">mdi-note-text</v-icon>
                    {{ timelineEntry.note }}
                  </div>
                  <div class="timeline-metadata" v-if="timelineEntry.metadata && Object.keys(timelineEntry.metadata).length > 0">
                    <v-expansion-panels variant="accordion" class="mt-2">
                      <v-expansion-panel>
                        <v-expansion-panel-title>
                          <v-icon size="small" class="me-2">mdi-information</v-icon>
                          تفاصيل إضافية
                        </v-expansion-panel-title>
                        <v-expansion-panel-text>
                          <pre class="metadata-content">{{ JSON.stringify(timelineEntry.metadata, null, 2) }}</pre>
                        </v-expansion-panel-text>
                      </v-expansion-panel>
                    </v-expansion-panels>
                  </div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { ORDER_QUERY, GENERATE_INVOICE_MUTATION, ORDER_TIMELINE_QUERY } from '@/integration/graphql/orders.graphql';
import { useStore } from 'vuex';

const route = useRoute();
const router = useRouter();
const store = useStore();

// Reactive data
const generatingInvoice = ref(false);

// GraphQL Query
const { 
  result: orderResult, 
  loading, 
  error, 
  refetch: fetchOrder 
} = useQuery(ORDER_QUERY, {
  id: route.params.id,
  orderNumber: route.params.orderNumber
});

// Timeline Query
const { 
  result: timelineResult, 
  loading: timelineLoading, 
  error: timelineError, 
  refetch: fetchTimeline 
} = useQuery(ORDER_TIMELINE_QUERY, {
  orderId: route.params.id
}, {
  pollInterval: 30000 // Refresh every 30 seconds for real-time updates
});

// Computed order data
const order = computed(() => orderResult.value?.order);

// Computed timeline data
const timeline = computed(() => {
  const entries = timelineResult.value?.orderTimeline || [];
  // Sort by date, newest first
  return entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
});

// Table headers for items
const itemsHeaders = [
  { title: 'المنتج', key: 'product', sortable: false },
  { title: 'نوع الخامة', key: 'material', sortable: false },
  { title: 'الكمية', key: 'quantity', sortable: false },
  { title: 'سعر الوحدة', key: 'price', sortable: false },
  { title: 'المجموع', key: 'total', sortable: false }
];

// Methods
const generateInvoice = async () => {
  if (!order.value) return;
  
  generatingInvoice.value = true;
  try {
    const { mutate } = useMutation(GENERATE_INVOICE_MUTATION);
    const result = await mutate({
      variables: { orderId: order.value.id }
    });
    
    if (result.data?.generateInvoice?.success) {
      // Open invoice in new tab
      window.open(result.data.generateInvoice.invoiceUrl, '_blank');
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'تم إنشاء الفاتورة بنجاح'
      });
    } else {
      throw new Error(result.data?.generateInvoice?.message || 'فشل إنشاء الفاتورة');
    }
  } catch (error) {
    console.error('Error generating invoice:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء إنشاء الفاتورة'
    });
  } finally {
    generatingInvoice.value = false;
  }
};

const getStatusColor = (status) => {
  const colors = {
    'pending': 'warning',
    'confirmed': 'info',
    'processing': 'primary',
    'shipped': 'purple',
    'delivered': 'success',
    'cancelled': 'error'
  };
  return colors[status] || 'grey';
};

const getStatusLabel = (status) => {
  const labels = {
    'pending': 'في الانتظار',
    'confirmed': 'مؤكد',
    'processing': 'قيد المعالجة',
    'shipped': 'تم الشحن',
    'delivered': 'تم التسليم',
    'cancelled': 'ملغي'
  };
  return labels[status] || status;
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    'cash': 'نقدي',
    'card': 'بطاقة',
    'transfer': 'تحويل بنكي',
    'ccp': ' CCP'
  };
  return labels[method] || method;
};

const getTimelineColor = (status) => {
  return getStatusColor(status);
};

const getTimelineIcon = (status) => {
  const icons = {
    'pending': 'mdi-clock-outline',
    'confirmed': 'mdi-check-circle-outline',
    'processing': 'mdi-cog',
    'shipped': 'mdi-truck',
    'delivered': 'mdi-package-variant-closed',
    'cancelled': 'mdi-cancel'
  };
  return icons[status] || 'mdi-information';
};

const getUserName = (user) => {
  if (!user) return 'النظام';
  return user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.username || 'مستخدم';
};

const formatFullDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Lifecycle
onMounted(() => {
  if (!route.params.id && !route.params.orderNumber) {
    router.push('/orders');
  }
});
</script>

<style scoped>
.order-detail {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-state {
  padding: 2rem;
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.order-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.order-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-date {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.info-label {
  font-weight: 500;
  color: var(--text-secondary);
  min-width: 120px;
}

.info-value {
  color: var(--text-primary);
  font-weight: 600;
}

.items-table {
  border-radius: 12px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.product-sku {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.material-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.material-chip {
  font-weight: 500;
}

.material-price {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.quantity-info {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.quantity-value {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.quantity-unit {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.price-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.unit-price {
  font-weight: 600;
  color: var(--text-primary);
}

.price-per-unit {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.total-price {
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.125rem;
}

.summary-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.summary-item.total {
  border-top: 2px solid var(--border-subtle);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.summary-label {
  font-weight: 500;
  color: var(--text-secondary);
}

.summary-value {
  font-weight: 600;
  color: var(--text-primary);
}

.summary-value.discount {
  color: #4caf50;
}

.summary-item.total .summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-color);
}

.timeline-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.timeline-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.timeline-content {
  margin-bottom: 0.5rem;
}

.timeline-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.timeline-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.timeline-meta {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.timeline-user {
  font-weight: 500;
}

.timeline-status {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.timeline-note {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  line-height: 1.4;
}

.timeline-metadata {
  margin-top: 0.5rem;
}

.metadata-content {
  font-size: 0.75rem;
  background: var(--bg-surface);
  padding: 0.5rem;
  border-radius: 4px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-detail {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .info-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .info-label {
    min-width: auto;
  }
  
  .product-info {
    flex-direction: column;
    text-align: center;
  }
  
  .summary-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
