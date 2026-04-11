<template>
  <div class="order-history">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">طلباتي</h1>
      <p class="page-subtitle">عرض وتتبع جميع طلباتك السابقة</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">جاري تحميل طلباتك...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-alert type="error" prominent class="mb-4">
        <v-alert-title>خطأ في جلب البيانات</v-alert-title>
        <div>{{ error.message }}</div>
        <v-btn color="white" variant="outlined" class="mt-3" @click="fetchOrders">
          إعادة المحاولة
        </v-btn>
      </v-alert>
    </div>

    <!-- Empty State -->
    <div v-else-if="orders.length === 0" class="empty-state">
      <v-card class="empty-card">
        <v-card-text class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-package-variant</v-icon>
          <h2 class="empty-title">لا توجد طلبات بعد</h2>
          <p class="empty-subtitle">
            قم ببعض التسوق وسيظهر تاريخ طلباتك هنا
          </p>
          <v-btn color="primary" @click="goToShop" class="mt-4">
            <v-icon start>mdi-shopping</v-icon>
            ابدأ التسوق
          </v-btn>
        </v-card-text>
      </v-card>
    </div>

    <!-- Orders List -->
    <div v-else class="orders-content">
      <!-- Filters -->
      <v-card class="filters-card mb-4">
        <v-card-text>
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.status"
                label="حالة الطلب"
                :items="statusOptions"
                item-title="label"
                item-value="value"
                clearable
                outlined
                prepend-inner-icon="mdi-filter"
                @update:modelValue="applyFilters"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="filters.paymentMethod"
                label="طريقة الدفع"
                :items="paymentMethodOptions"
                item-title="label"
                item-value="value"
                clearable
                outlined
                prepend-inner-icon="mdi-credit-card"
                @update:modelValue="applyFilters"
              ></v-select>
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model="searchQuery"
                label="البحث عن طلب"
                placeholder="رقم الطلب أو اسم العميل..."
                outlined
                clearable
                prepend-inner-icon="mdi-magnify"
                @update:modelValue="searchOrders"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- Orders Grid -->
      <v-row>
        <v-col
          v-for="order in filteredOrders"
          :key="order.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="order-card" hover>
            <v-card-text>
              <!-- Order Header -->
              <div class="order-header">
                <div class="order-number">
                  <span class="order-label">طلب #</span>
                  <span class="order-value">{{ order.orderNumber }}</span>
                </div>
                <v-chip
                  :color="getStatusColor(order.status)"
                  size="small"
                  variant="flat"
                >
                  {{ getStatusLabel(order.status) }}
                </v-chip>
              </div>

              <!-- Order Date -->
              <div class="order-date">
                <v-icon size="small" class="me-1">mdi-calendar</v-icon>
                {{ formatDate(order.createdAt) }}
              </div>

              <!-- Customer Info -->
              <div class="customer-info">
                <div class="customer-name">
                  <v-icon size="small" class="me-1">mdi-account</v-icon>
                  {{ order.customerName }}
                </div>
                <div class="customer-phone">
                  <v-icon size="small" class="me-1">mdi-phone</v-icon>
                  {{ order.phone }}
                </div>
              </div>

              <!-- Order Items Preview -->
              <div class="items-preview">
                <div class="items-count">
                  {{ order.items?.length || 0 }} منتجات
                </div>
                <div class="items-total">
                  {{ formatCurrency(order.totalAmount) }}
                </div>
              </div>

              <!-- Payment Status -->
              <div class="payment-status">
                <div class="payment-info">
                  <v-icon size="small" class="me-1">mdi-credit-card</v-icon>
                  <span class="payment-method">{{ getPaymentMethodLabel(order.paymentMethod) }}</span>
                </div>
                <v-chip
                  :color="getPaymentStatusColor(order.paymentStatus, order.payments)"
                  size="small"
                  variant="flat"
                >
                  {{ getPaymentStatusLabel(order.paymentStatus, order.payments) }}
                </v-chip>
              </div>

              <!-- Order Actions -->
              <div class="order-actions">
                <v-btn
                  color="primary"
                  variant="text"
                  size="small"
                  @click="viewOrder(order.id)"
                >
                  <v-icon start>mdi-eye</v-icon>
                  عرض التفاصيل
                </v-btn>
                <v-btn
                  v-if="canTrackOrder(order.status)"
                  color="info"
                  variant="text"
                  size="small"
                  @click="trackOrder(order)"
                >
                  <v-icon start>mdi-truck</v-icon>
                  تتبع الشحنة
                </v-btn>
                <v-btn
                  v-if="canCancelOrder(order.status)"
                  color="error"
                  variant="text"
                  size="small"
                  @click="cancelOrder(order)"
                >
                  <v-icon start>mdi-cancel</v-icon>
                  إلغاء الطلب
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div class="pagination-wrapper" v-if="totalPages > 1">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          @update:modelValue="changePage"
        ></v-pagination>
      </div>
    </div>

    <!-- Cancel Order Dialog -->
    <v-dialog v-model="cancelDialog" max-width="500">
      <v-card>
        <v-card-title>
          <v-icon class="me-2" color="error">mdi-cancel</v-icon>
          تأكيد إلغاء الطلب
        </v-card-title>
        <v-card-text>
          <p>هل أنت متأكد من إلغاء الطلب #{{ selectedOrder?.orderNumber }}؟</p>
          <p class="text-medium-emphasis">هذا الإجراء لا يمكن التراجع عنه.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="cancelDialog = false">
            تراجع
          </v-btn>
          <v-btn
            color="error"
            :loading="cancellingOrder"
            @click="confirmCancelOrder"
          >
            تأكيد الإلغاء
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { MY_ORDERS_QUERY, CANCEL_ORDER_MUTATION } from '@/integration/graphql/orders.graphql';
import { useStore } from 'vuex';

const router = useRouter();
const store = useStore();

// Reactive data
const loading = ref(false);
const error = ref(null);
const searchQuery = ref('');
const currentPage = ref(1);
const cancelDialog = ref(false);
const selectedOrder = ref(null);
const cancellingOrder = ref(false);

// Filters
const filters = ref({
  status: null,
  paymentMethod: null
});

// GraphQL Query
const { 
  result: ordersResult, 
  loading: queryLoading, 
  error: queryError, 
  refetch: fetchOrders 
} = useQuery(MY_ORDERS_QUERY, {
  page: currentPage.value,
  limit: 12
});

// Computed properties
const orders = computed(() => ordersResult.value?.myOrders || []);

const filteredOrders = computed(() => {
  let filtered = [...orders.value];
  
  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter(order => order.status === filters.value.status);
  }
  
  // Apply payment method filter
  if (filters.value.paymentMethod) {
    filtered = filtered.filter(order => order.paymentMethod === filters.value.paymentMethod);
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.orderNumber.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.phone.includes(query)
    );
  }
  
  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(ordersResult.value?.myOrdersCount / 12) || 1;
});

// Filter options
const statusOptions = [
  { label: 'الكل', value: null },
  { label: 'في الانتظار', value: 'pending' },
  { label: 'مؤكد', value: 'confirmed' },
  { label: 'قيد المعالجة', value: 'processing' },
  { label: 'تم الشحن', value: 'shipped' },
  { label: 'تم التسليم', value: 'delivered' },
  { label: 'ملغي', value: 'cancelled' }
];

const paymentMethodOptions = [
  { label: 'الكل', value: null },
  { label: 'الدفع عند الاستلام', value: 'cod' },
  { label: 'بطاقة ائتمانية', value: 'card' },
  { label: 'تحويل بنكي', value: 'transfer' },
  { label: 'CCP', value: 'ccp' }
];

// Methods
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

const canTrackOrder = (status) => {
  return ['shipped', 'delivered'].includes(status);
};

const canCancelOrder = (status) => {
  return ['pending', 'confirmed'].includes(status);
};

const viewOrder = (orderId) => {
  router.push(`/orders/${orderId}`);
};

const trackOrder = (order) => {
  // Open tracking in new tab or show tracking modal
  if (order.trackingNumber) {
    window.open(`https://tracking.example.com/${order.trackingNumber}`, '_blank');
  } else {
    store.dispatch('notifications/showNotification', {
      type: 'info',
      message: 'رقم التتبع غير متوفر بعد'
    });
  }
};

const cancelOrder = (order) => {
  selectedOrder.value = order;
  cancelDialog.value = true;
};

const confirmCancelOrder = async () => {
  if (!selectedOrder.value) return;
  
  cancellingOrder.value = true;
  try {
    const { mutate } = useMutation(CANCEL_ORDER_MUTATION);
    const result = await mutate({
      variables: {
        orderId: selectedOrder.value.id,
        reason: 'إلغاء من قبل العميل'
      }
    });
    
    if (result.data?.cancelOrder?.success) {
      cancelDialog.value = false;
      selectedOrder.value = null;
      
      // Refetch orders
      fetchOrders();
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'تم إلغاء الطلب بنجاح'
      });
    } else {
      throw new Error(result.data?.cancelOrder?.message || 'فشل إلغاء الطلب');
    }
  } catch (err) {
    console.error('Error cancelling order:', err);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء إلغاء الطلب'
    });
  } finally {
    cancellingOrder.value = false;
  }
};

const applyFilters = () => {
  currentPage.value = 1;
};

const searchOrders = () => {
  currentPage.value = 1;
};

const changePage = (page) => {
  currentPage.value = page;
  fetchOrders({
    page: page,
    limit: 12
  });
};

const goToShop = () => {
  router.push('/shop');
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

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const getPaymentMethodLabel = (method) => {
  const methodLabels = {
    'cod': 'الدفع عند الاستلام',
    'card': 'بطاقة ائتمانية',
    'transfer': 'تحويل بنكي',
    'ccp': 'CCP',
    'edahabia': 'Edahabia',
    'cib': 'CIB',
    'wallet': 'محفظة إلكترونية'
  };
  return methodLabels[method] || method;
};

const getPaymentStatusLabel = (paymentStatus, payments) => {
  // Check if there are any payments and get the latest status
  if (payments && payments.length > 0) {
    const latestPayment = payments[0]; // Assuming payments are ordered by creation date
    const statusLabels = {
      'pending': 'في الانتظار',
      'processing': 'قيد المعالجة',
      'completed': 'مكتمل',
      'failed': 'فشل',
      'cancelled': 'ملغي',
      'refunded': 'مسترد'
    };
    return statusLabels[latestPayment.status] || latestPayment.status;
  }
  
  // Fallback to order payment status
  return paymentStatus ? 'مدفوع' : 'غير مدفوع';
};

const getPaymentStatusColor = (paymentStatus, payments) => {
  // Check if there are any payments and get the latest status
  if (payments && payments.length > 0) {
    const latestPayment = payments[0];
    const statusColors = {
      'pending': 'warning',
      'processing': 'info',
      'completed': 'success',
      'failed': 'error',
      'cancelled': 'grey',
      'refunded': 'orange'
    };
    return statusColors[latestPayment.status] || 'grey';
  }
  
  // Fallback to order payment status
  return paymentStatus ? 'success' : 'warning';
};

// Watch loading state
loading.value = queryLoading.value;
error.value = queryError.value;

// Lifecycle
onMounted(() => {
  fetchOrders();
});
</script>

<style scoped>
.order-history {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1.125rem;
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

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.empty-card {
  max-width: 500px;
  width: 100%;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.empty-subtitle {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

.orders-content {
  max-width: 1200px;
  margin: 0 auto;
}

.filters-card {
  background: var(--bg-card);
}

.order-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.order-number {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.order-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.order-value {
  font-weight: 600;
  color: var(--text-primary);
}

.order-date {
  display: flex;
  align-items: center;
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.customer-info {
  margin-bottom: 1rem;
}

.customer-name,
.customer-phone {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.items-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-surface);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.items-count {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.items-total {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1rem;
}

.payment-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-surface);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.payment-info {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.payment-method {
  font-weight: 500;
}

.order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .order-history {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .items-preview {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .order-actions {
    justify-content: center;
  }
}
</style>
