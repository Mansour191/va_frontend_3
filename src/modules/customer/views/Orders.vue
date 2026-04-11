<template>
  <v-main class="orders-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <v-row align="center" justify="space-between">
            <v-col>
              <div class="header-content">
                <h1 class="text-h4 font-weight-bold mb-2">
                  <v-icon class="me-2">mdi-shopping-bag</v-icon>
                  طلباتي
                </h1>
                <p class="text-body-1 text-medium-emphasis">تتبع جميع طلباتك وحالتها</p>
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="d-flex gap-2">
                <v-select
                  v-model="selectedFilter"
                  :items="filterOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="min-width: 150px"
                />
                <v-btn
                  icon
                  variant="outlined"
                  @click="toggleSearch"
                >
                  <v-icon>mdi-magnify</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card-title>

        <!-- Search Bar -->
        <v-expand-transition>
          <v-card-text v-if="showSearch" class="pa-4 pt-0">
            <v-text-field
              v-model="searchQuery"
              label="ابحث عن طلباتك..."
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              append-inner-icon="mdi-close"
              @click:append-inner="toggleSearch"
              clearable
            />
          </v-card-text>
        </v-expand-transition>

        <v-divider />

        <!-- Orders List -->
        <v-card-text class="pa-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            />
            <p class="text-body-1 text-medium-emphasis">جاري تحميل الطلبات...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredOrders.length === 0" class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-shopping-cart</v-icon>
            <h3 class="text-h5 mb-2">لا توجد طلبات</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">لم تقم بإنشاء أي طلبات بعد</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-shopping-bag"
              to="/products"
            >
              تصفح المنتجات
            </v-btn>
          </div>

          <!-- Orders Grid -->
          <v-row v-else>
            <v-col 
              v-for="order in filteredOrders" 
              :key="order.id" 
              cols="12" 
              md="6"
              lg="4"
            >
              <v-card 
                class="order-card h-100"
                elevation="2"
                hover
                @click="viewOrderDetails(order)"
              >
                <v-card-title class="d-flex align-center justify-space-between">
                  <div>
                    <h3 class="text-h6">{{ formatOrderNumber(order.orderNumber) }}</h3>
                    <p class="text-caption text-medium-emphasis">{{ formatDate(order.createdAt) }}</p>
                  </div>
                  <v-chip
                    :color="getOrderStatusInfo(order.status).color"
                    variant="tonal"
                    size="small"
                  >
                    <v-icon size="small" class="me-1">
                      {{ getOrderStatusInfo(order.status).icon }}
                    </v-icon>
                    {{ getOrderStatusInfo(order.status).text }}
                  </v-chip>
                </v-card-title>

                <v-divider />

                <v-card-text>
                  <div class="order-items">
                    <div 
                      v-for="item in order.items.slice(0, 3)" 
                      :key="item.id" 
                      class="d-flex align-center mb-2"
                    >
                      <v-avatar size="40" class="me-3">
                        <v-img :src="item.image" />
                      </v-avatar>
                      <div class="flex-grow-1">
                        <div class="text-body-2 font-weight-medium">{{ item.name }}</div>
                        <div class="text-caption text-medium-emphasis">
                          {{ item.quantity }} × {{ formatCurrency(item.price) }}
                        </div>
                      </div>
                    </div>
                    
                    <div v-if="order.items.length > 3" class="text-caption text-center mt-2">
                      +{{ order.items.length - 3 }} منتجات أخرى
                    </div>
                  </div>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-bold text-primary">
                      {{ formatCurrency(order.total) }}
                    </div>
                  </div>
                  <v-btn
                    size="small"
                    variant="outlined"
                    prepend-icon="mdi-eye"
                  >
                    عرض التفاصيل
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Order Details Dialog -->
    <v-dialog v-model="showOrderDetails" max-width="800" scrollable>
      <v-card v-if="selectedOrder">
        <v-card-title class="d-flex align-center justify-space-between">
          <span class="text-h5">تفاصيل الطلب #{{ selectedOrder.id }}</span>
          <v-btn icon variant="text" @click="showOrderDetails = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6">معلومات الطلب</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title>رقم الطلب</v-list-item-title>
                      <v-list-item-subtitle>#{{ selectedOrder.id }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>التاريخ</v-list-item-title>
                      <v-list-item-subtitle>{{ formatDate(selectedOrder.createdAt) }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>الحالة</v-list-item-title>
                      <v-list-item-subtitle>
                        <v-chip
                          :color="getStatusColor(selectedOrder.status)"
                          variant="tonal"
                          size="small"
                        >
                          {{ getStatusText(selectedOrder.status) }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>طريقة الدفع</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedOrder.paymentMethod }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card variant="outlined">
                <v-card-title class="text-h6">معلومات الشحن</v-card-title>
                <v-card-text>
                  <v-list density="compact">
                    <v-list-item>
                      <v-list-item-title>الاسم</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedOrder.customerName }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>الهاتف</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedOrder.phone }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>العنوان</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedOrder.address }}</v-list-item-subtitle>
                    </v-list-item>
                    <v-list-item>
                      <v-list-item-title>الولاية</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedOrder.wilaya }}</v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="text-h6">المنتجات</v-card-title>
                <v-card-text>
                  <v-data-table
                    :headers="orderItemsHeaders"
                    :items="selectedOrder.items"
                    hide-default-footer
                  >
                    <template v-slot:item.image="{ item }">
                      <v-avatar size="40">
                        <v-img :src="item.image" />
                      </v-avatar>
                    </template>
                    <template v-slot:item.price="{ item }">
                      {{ formatCurrency(item.price) }}
                    </template>
                    <template v-slot:item.total="{ item }">
                      {{ formatCurrency(item.price * item.quantity) }}
                    </template>
                  </v-data-table>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-4">
            <v-col cols="12" md="6" offset-md="6">
              <v-card variant="outlined">
                <v-card-text>
                  <v-row>
                    <v-col cols="6">
                      <div class="text-body-2">المجموع الفرعي:</div>
                    </v-col>
                    <v-col cols="6" class="text-left">
                      <div class="text-body-2">{{ formatCurrency(selectedOrder.subtotal) }}</div>
                    </v-col>
                    <v-col cols="6">
                      <div class="text-body-2">الشحن:</div>
                    </v-col>
                    <v-col cols="6" class="text-left">
                      <div class="text-body-2">{{ formatCurrency(selectedOrder.shippingCost) }}</div>
                    </v-col>
                    <v-col cols="6" v-if="selectedOrder.discountAmount > 0">
                      <div class="text-body-2">الخصم:</div>
                    </v-col>
                    <v-col cols="6" class="text-left" v-if="selectedOrder.discountAmount > 0">
                      <div class="text-body-2 text-error">-{{ formatCurrency(selectedOrder.discountAmount) }}</div>
                    </v-col>
                    <v-divider class="my-2" />
                    <v-col cols="6">
                      <div class="text-h6 font-weight-bold">الإجمالي:</div>
                    </v-col>
                    <v-col cols="6" class="text-left">
                      <div class="text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(selectedOrder.total) }}
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showOrderDetails = false">إغلاق</v-btn>
          <v-btn 
            v-if="selectedOrder.status === 'delivered'"
            color="primary"
            prepend-icon="mdi-repeat"
          >
            إعادة الطلب
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
<script setup>
import { ref, computed, onMounted } from 'vue';
import { useOrders } from '@/composables/useOrders';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

// Composables
const { 
  userOrders, 
  loading, 
  error,
  fetchUserOrders,
  getOrderStatusInfo,
  canCancelOrder,
  formatOrderNumber,
  formatPrice,
  formatDate,
  cancelOrder,
  generateInvoice
} = useOrders();

const store = useStore();
const { t } = useI18n();

// Reactive data
const overlayActive = ref(true);
const showSearch = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('all');
const showOrderDetails = ref(false);
const selectedOrder = ref(null);
const cancellingOrder = ref(false);
const generatingInvoice = ref(false);

const filterOptions = [
  { title: t('allOrders') || 'جميع الطلبات', value: 'all' },
  { title: t('pending') || 'قيد الانتظار', value: 'pending' },
  { title: t('confirmed') || 'مؤكد', value: 'confirmed' },
  { title: t('processing') || 'قيد المعالجة', value: 'processing' },
  { title: t('shipped') || 'تم الشحن', value: 'shipped' },
  { title: t('delivered') || 'تم التسليم', value: 'delivered' },
  { title: t('cancelled') || 'ملغي', value: 'cancelled' }
];

const orderItemsHeaders = [
  { title: t('image') || 'الصورة', key: 'image', sortable: false },
  { title: t('product') || 'المنتج', key: 'name' },
  { title: t('quantity') || 'الكمية', key: 'quantity' },
  { title: t('price') || 'السعر', key: 'price' },
  { title: t('total') || 'الإجمالي', key: 'total' }
];

// Computed
const filteredOrders = computed(() => {
  let orders = userOrders.value;
  
  // Apply status filter
  if (selectedFilter.value !== 'all') {
    orders = orders.filter(order => order.status === selectedFilter.value);
  }
  
  // Apply search filter
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase();
    orders = orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.shippingAddress?.toLowerCase().includes(term)
    );
  }
  
  return orders;
});

// Methods
const loadOrders = async () => {
  await fetchUserOrders();
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) {
    searchQuery.value = '';
  }
};

const viewOrderDetails = async (order) => {
  selectedOrder.value = order;
  showOrderDetails.value = true;
  console.log('✅ Order details loaded:', order);
};

const handleCancelOrder = async (order) => {
  const reason = prompt(t('cancelReason') || 'يرجى إدخال سبب الإلغاء:');
  if (!reason) return;

  cancellingOrder.value = true;
  try {
    const result = await cancelOrder(order.id, reason);
    if (result.success) {
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('orderCancelled') || 'تم إلغاء الطلب',
        message: result.message,
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: error.message,
      timeout: 5000
    });
  } finally {
    cancellingOrder.value = false;
  }
};

const handleGenerateInvoice = async (order) => {
  generatingInvoice.value = true;
  try {
    const result = await generateInvoice(order.id);
    if (result.success) {
      // Download the invoice
      window.open(result.invoiceUrl, '_blank');
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('invoiceGenerated') || 'تم إنشاء الفاتورة',
        message: result.message,
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: error.message,
      timeout: 5000
    });
  } finally {
    generatingInvoice.value = false;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-DZ', {
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

const getStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };
  return colorMap[status] || 'default';
};

// Computed
const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Filter by status
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === selectedFilter.value);
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.id.toString().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query))
    );
  }

  return filtered;
});

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.order-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.order-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.order-items {
  max-height: 200px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
              </div>
            </div>

            <div class="order-footer">
              <div class="order-total">
                <span class="total-label">الإجمالي:</span>
                <span class="total-amount">{{ formatPrice(order.total) }}</span>
              </div>
              <div class="order-actions">
                <button class="action-btn primary" @click.stop="viewOrderDetails(order.id)">
                  <i class="fa-solid fa-eye"></i>
                  التفاصيل
                </button>
                <button 
                  v-if="order.status === 'delivered'" 
                  class="action-btn secondary" 
                  @click.stop="reorderItems(order)"
                >
                  <i class="fa-solid fa-redo"></i>
                  إعادة الطلب
                </button>
                <button 
                  v-if="['pending', 'processing'].includes(order.status)" 
                  class="action-btn danger" 
                  @click.stop="cancelOrder(order.id)"
                >
                  <i class="fa-solid fa-times"></i>
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            v-if="currentPage > 1" 
            @click="changePage(currentPage - 1)"
            class="pagination-btn"
          >
            <i class="fa-solid fa-chevron-right"></i>
            السابق
          </button>
          
          <div class="pagination-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              :class="['pagination-number', { active: page === currentPage }]"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            v-if="currentPage < totalPages" 
            @click="changePage(currentPage + 1)"
            class="pagination-btn"
          >
            التالي
            <i class="fa-solid fa-chevron-left"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { default as GraphQLService } from '@/services/GraphQLService';

const router = useRouter();
const authStore = useAuthStore();
const graphQLService = new GraphQLService();

const loading = ref(true);
const showSearch = ref(false);
const searchQuery = ref('');
const selectedFilter = ref('all');
const currentPage = ref(1);
const totalPages = ref(1);
const ordersPerPage = 10;

const orders = ref([]);

const filteredOrders = computed(() => {
  let filtered = orders.value;

  // Apply status filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter(order => order.status === selectedFilter.value);
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(order => 
      order.id.toLowerCase().includes(query) ||
      order.items.some(item => item.name.toLowerCase().includes(query))
    );
  }

  return filtered;
});

const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages.value, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'DZD'
  }).format(price);
};

const getStatusText = (status) => {
  const statusMap = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التسليم',
    cancelled: 'ملغي'
  };
  return statusMap[status] || status;
};

const toggleSearch = () => {
  showSearch.value = !showSearch.value;
  if (!showSearch.value) {
    searchQuery.value = '';
  }
};

const changePage = (page) => {
  currentPage.value = page;
  loadOrders();
};

const viewOrderDetails = (orderId) => {
  router.push(`/profile/orders/${orderId}`);
};

const cancelOrder = async (orderId) => {
  if (confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) {
    try {
      const result = await graphQLService.cancelOrder(orderId);
      if (result.success) {
        const order = orders.value.find(o => o.id === orderId);
        if (order) {
          order.status = 'cancelled';
        }
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Show error message to user
    }
  }
};

const reorderItems = async (order) => {
  try {
    const result = await graphQLService.reorderItems(order.id);
    if (result.success) {
      router.push('/cart');
    }
  } catch (error) {
    console.error('Error reordering:', error);
    // Show error message to user
  }
};

const loadOrders = async () => {
  try {
    loading.value = true;
    const result = await graphQLService.getOrders({
      page: currentPage.value,
      limit: ordersPerPage,
      filter: selectedFilter.value,
      search: searchQuery.value
    });
    
    orders.value = result.orders;
    totalPages.value = Math.ceil(result.total / ordersPerPage);
  } catch (error) {
    console.error('Error loading orders:', error);
    // Show error message to user
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
/* ===== Orders Page ===== */
.orders-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.12) 0%, transparent 50%);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
  filter: blur(2px);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Orders Container */
.orders-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1000px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 0 0 30px rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}

/* Header */
.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-title i {
  color: #d4af37;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-dropdown {
  position: relative;
}

.filter-select {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 10px 16px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  outline: none;
}

.filter-select:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
}

.filter-select:focus {
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-select option {
  background: #1a1a2e;
  color: #ffffff;
}

.search-btn {
  width: 44px;
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
  color: #d4af37;
}

/* Search Bar */
.search-bar {
  margin-bottom: 30px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0 16px;
}

.search-icon {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 16px;
  padding: 12px 0;
  outline: none;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.search-close {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 8px;
  transition: color 0.3s ease;
}

.search-close:hover {
  color: #ffffff;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  font-size: 48px;
  color: #d4af37;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 18px;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.empty-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 32px 0;
}

.browse-products-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.browse-products-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Orders List */
.orders-list {
  display: grid;
  gap: 20px;
}

.order-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-info {
  flex: 1;
}

.order-number {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.order-date {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
}

.order-status {
  margin-left: 16px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.pending {
  background: rgba(108, 117, 125, 0.2);
  color: #6c757d;
}

.status-badge.processing {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.status-badge.shipped {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.status-badge.delivered {
  background: rgba(0, 200, 81, 0.2);
  color: #00c851;
}

.status-badge.cancelled {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

/* Order Items */
.order-items {
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  background: rgba(255, 255, 255, 0.05);
}

.item-details {
  flex: 1;
}

.item-name {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
}

.item-quantity {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0 0 4px 0;
}

.item-price {
  color: #d4af37;
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

/* Order Footer */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.order-total {
  display: flex;
  align-items: center;
  gap: 8px;
}

.total-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.total-amount {
  color: #d4af37;
  font-size: 20px;
  font-weight: 700;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-btn.primary {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.3);
}

.action-btn.danger {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
  border: 1px solid rgba(220, 53, 69, 0.3);
}

.action-btn.danger:hover {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
  color: #d4af37;
}

.pagination-numbers {
  display: flex;
  gap: 8px;
}

.pagination-number {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-number:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.3);
  color: #d4af37;
}

.pagination-number.active {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border-color: #d4af37;
  color: #1a1a2e;
}

/* Responsive Design */
@media (max-width: 768px) {
  .orders-page {
    padding: 10px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .orders-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .order-card {
    padding: 16px;
  }
  
  .order-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .order-status {
    margin-left: 0;
  }
  
  .order-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .order-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .pagination-btn {
    flex: 1;
    min-width: 100px;
  }
}
</style>
