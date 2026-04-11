<template>
  <v-container fluid class="cart-manager pa-4">
    <!-- Header -->
    <v-card class="cart-header mb-6" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar
                color="#d4af37"
                size="48"
                class="me-4"
              >
                <v-icon icon="mdi-shopping" size="28"></v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold">
                  {{ $t('cart.title', 'إدارة السلة') }}
                </h1>
                <p class="text-body-1 text-dim mt-1">
                  {{ $t('cart.subtitle', 'مراقبة وإدارة سلة التسوق') }}
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-2 justify-md-end justify-start">
              <v-btn
                @click="refreshData"
                variant="elevated"
                prepend-icon="mdi-refresh"
                color="#d4af37"
                class="refresh-btn"
                :loading="loading"
              >
                {{ $t('common.refresh', 'تحديث') }}
              </v-btn>
              <v-btn
                @click="exportCartData"
                variant="outlined"
                prepend-icon="mdi-download"
                class="export-btn"
              >
                {{ $t('common.export', 'تصدير') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-shopping-outline" size="32" color="#d4af37" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ cartStats.totalCarts }}</h3>
            <p class="text-body-2 text-dim">{{ $t('cart.totalCarts', 'إجمالي السلال') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-currency-usd" size="32" color="success" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ formatCurrency(cartStats.totalValue) }}</h3>
            <p class="text-body-2 text-dim">{{ $t('cart.totalValue', 'إجمالي القيمة') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-package-variant" size="32" color="info" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ cartStats.totalItems }}</h3>
            <p class="text-body-2 text-dim">{{ $t('cart.totalItems', 'إجمالي المنتجات') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-chart-line" size="32" color="warning" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ cartStats.averageCartValue }}</h3>
            <p class="text-body-2 text-dim">{{ $t('cart.averageValue', 'متوسط قيمة السلة') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-card class="cart-content" elevation="2">
      <v-card-title class="pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <h3 class="text-h5 font-weight-bold">
            <v-icon icon="mdi-format-list-bulleted" size="24" class="me-2"></v-icon>
            {{ $t('cart.activeCarts', 'السلال النشطة') }}
          </h3>
          <div class="d-flex gap-2">
            <v-text-field
              v-model="searchQuery"
              :label="$t('common.search', 'بحث')"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              hide-details
              density="compact"
              style="max-width: 300px;"
              class="me-2"
            ></v-text-field>
            <v-select
              v-model="statusFilter"
              :label="$t('cart.filterByStatus', 'فلترة بالحالة')"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              variant="outlined"
              hide-details
              density="compact"
              style="max-width: 200px;"
            ></v-select>
          </div>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="#d4af37" size="48"></v-progress-circular>
          <div class="mt-4 text-body-2 text-dim">{{ $t('common.loading', 'جاري التحميل...') }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredCarts.length === 0" class="text-center py-8">
          <v-icon icon="mdi-shopping-outline" size="64" color="#d4af37" class="mb-4"></v-icon>
          <h4 class="text-h6 font-weight-bold mb-2">{{ $t('cart.noCarts', 'لا توجد سلال') }}</h4>
          <p class="text-body-2 text-dim mb-4">{{ $t('cart.noCartsDesc', 'لا توجد سلال نشطة حالياً') }}</p>
        </div>

        <!-- Carts List -->
        <div v-else class="carts-list">
          <v-card
            v-for="cart in paginatedCarts"
            :key="cart.id"
            variant="outlined"
            class="mb-4 cart-card"
          >
            <v-card-text class="pa-4">
              <v-row align="center">
                <!-- Cart Info -->
                <v-col cols="12" md="4">
                  <div class="d-flex align-center">
                    <v-avatar color="#d4af37" size="40" class="me-3">
                      <v-icon icon="mdi-shopping" size="20"></v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-bold">
                        {{ $t('cart.cartNumber', 'سلة رقم') }} #{{ cart.id }}
                      </div>
                      <div class="text-caption text-dim">
                        {{ formatDate(cart.createdAt) }}
                      </div>
                      <div v-if="cart.customer" class="text-caption">
                        {{ cart.customer.name || $t('cart.guest', 'ضيف') }}
                      </div>
                    </div>
                  </div>
                </v-col>

                <!-- Cart Items -->
                <v-col cols="12" md="3">
                  <div class="text-center">
                    <div class="text-body-2 font-weight-bold">{{ cart.items.length }}</div>
                    <div class="text-caption text-dim">{{ $t('cart.items', 'منتجات') }}</div>
                  </div>
                </v-col>

                <!-- Cart Value -->
                <v-col cols="12" md="2">
                  <div class="text-center">
                    <div class="text-h6 font-weight-bold">{{ formatCurrency(cart.total) }}</div>
                    <div class="text-caption text-dim">{{ $t('cart.total', 'الإجمالي') }}</div>
                  </div>
                </v-col>

                <!-- Status -->
                <v-col cols="12" md="2">
                  <div class="text-center">
                    <v-chip
                      :color="getCartStatusColor(cart.status)"
                      variant="elevated"
                      size="small"
                    >
                      {{ getCartStatusText(cart.status) }}
                    </v-chip>
                  </div>
                </v-col>

                <!-- Actions -->
                <v-col cols="12" md="1">
                  <div class="d-flex justify-end">
                    <v-menu>
                      <template v-slot:activator="{ props }">
                        <v-btn
                          v-bind="props"
                          variant="text"
                          icon="mdi-dots-vertical"
                          size="small"
                        ></v-btn>
                      </template>
                      <v-list>
                        <v-list-item @click="viewCartDetails(cart)">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-eye" size="20"></v-icon>
                          </template>
                          <v-list-item-title>{{ $t('common.view', 'عرض') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="editCart(cart)">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-pencil" size="20"></v-icon>
                          </template>
                          <v-list-item-title>{{ $t('common.edit', 'تعديل') }}</v-list-item-title>
                        </v-list-item>
                        <v-list-item @click="deleteCart(cart)" class="text-error">
                          <template v-slot:prepend>
                            <v-icon icon="mdi-delete" size="20" color="error"></v-icon>
                          </template>
                          <v-list-item-title>{{ $t('common.delete', 'حذف') }}</v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>
                </v-col>
              </v-row>

              <!-- Cart Items Preview -->
              <v-divider class="my-3" v-if="cart.items.length > 0"></v-divider>
              <div v-if="cart.items.length > 0" class="cart-items-preview">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption text-dim">{{ $t('cart.recentItems', 'أحدث المنتجات') }}</span>
                  <v-btn
                    variant="text"
                    size="x-small"
                    color="#d4af37"
                    @click="viewCartDetails(cart)"
                  >
                    {{ $t('cart.viewAll', 'عرض الكل') }}
                  </v-btn>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <v-chip
                    v-for="item in cart.items.slice(0, 3)"
                    :key="item.id"
                    variant="outlined"
                    size="x-small"
                  >
                    {{ item.name }} ({{ item.quantity }})
                  </v-chip>
                  <v-chip
                    v-if="cart.items.length > 3"
                    variant="outlined"
                    size="x-small"
                  >
                    +{{ cart.items.length - 3 }}
                  </v-chip>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <!-- Pagination -->
        <div v-if="filteredCarts.length > itemsPerPage" class="d-flex justify-center mt-4">
          <v-pagination
            v-model="currentPage"
            :length="totalPages"
            :total-visible="7"
            color="#d4af37"
          ></v-pagination>
        </div>
      </v-card-text>
    </v-card>

    <!-- Cart Details Dialog -->
    <v-dialog v-model="cartDetailsDialog" max-width="800px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h5 font-weight-bold">
            <v-icon icon="mdi-shopping" size="24" class="me-2"></v-icon>
            {{ $t('cart.cartDetails', 'تفاصيل السلة') }} #{{ selectedCart?.id }}
          </h3>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text class="pa-4">
          <div v-if="selectedCart">
            <!-- Cart Info -->
            <v-row class="mb-4">
              <v-col cols="12" md="6">
                <div class="text-caption text-dim">{{ $t('cart.createdAt', 'تاريخ الإنشاء') }}</div>
                <div class="text-body-2">{{ formatDate(selectedCart.createdAt) }}</div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="text-caption text-dim">{{ $t('cart.status', 'الحالة') }}</div>
                <v-chip
                  :color="getCartStatusColor(selectedCart.status)"
                  variant="elevated"
                  size="small"
                >
                  {{ getCartStatusText(selectedCart.status) }}
                </v-chip>
              </v-col>
            </v-row>

            <!-- Customer Info -->
            <v-row class="mb-4" v-if="selectedCart.customer">
              <v-col cols="12">
                <h4 class="text-h6 font-weight-bold mb-2">{{ $t('cart.customerInfo', 'معلومات العميل') }}</h4>
                <v-card variant="outlined">
                  <v-card-text class="pa-3">
                    <v-row>
                      <v-col cols="12" md="6">
                        <div class="text-caption text-dim">{{ $t('cart.name', 'الاسم') }}</div>
                        <div class="text-body-2">{{ selectedCart.customer.name }}</div>
                      </v-col>
                      <v-col cols="12" md="6">
                        <div class="text-caption text-dim">{{ $t('cart.email', 'البريد الإلكتروني') }}</div>
                        <div class="text-body-2">{{ selectedCart.customer.email }}</div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <!-- Cart Items -->
            <v-row>
              <v-col cols="12">
                <h4 class="text-h6 font-weight-bold mb-2">{{ $t('cart.cartItems', 'منتجات السلة') }}</h4>
                <v-data-table
                  :headers="cartItemsHeaders"
                  :items="selectedCart.items"
                  hide-default-footer
                  class="cart-items-table"
                >
                  <template v-slot:item.price="{ item }">
                    {{ formatCurrency(item.price) }}
                  </template>
                  <template v-slot:item.total="{ item }">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </template>
                </v-data-table>
              </v-col>
            </v-row>

            <!-- Cart Summary -->
            <v-row class="mt-4">
              <v-col cols="12" md="6" offset-md="6">
                <v-card variant="outlined">
                  <v-card-text class="pa-4">
                    <div class="d-flex justify-space-between mb-2">
                      <span>{{ $t('cart.subtotal', 'المجموع الفرعي') }}</span>
                      <span>{{ formatCurrency(selectedCart.subtotal) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="selectedCart.discount">
                      <span>{{ $t('cart.discount', 'الخصم') }}</span>
                      <span class="text-error">-{{ formatCurrency(selectedCart.discount) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="selectedCart.tax">
                      <span>{{ $t('cart.tax', 'الضريبة') }}</span>
                      <span>{{ formatCurrency(selectedCart.tax) }}</span>
                    </div>
                    <div class="d-flex justify-space-between mb-2" v-if="selectedCart.shipping">
                      <span>{{ $t('cart.shipping', 'الشحن') }}</span>
                      <span>{{ formatCurrency(selectedCart.shipping) }}</span>
                    </div>
                    <v-divider class="my-2"></v-divider>
                    <div class="d-flex justify-space-between">
                      <span class="text-h6 font-weight-bold">{{ $t('cart.total', 'الإجمالي') }}</span>
                      <span class="text-h6 font-weight-bold">{{ formatCurrency(selectedCart.total) }}</span>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="cartDetailsDialog = false" variant="outlined">
            {{ $t('common.close', 'إغلاق') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import CartService from '@/services/CartService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const cartDetailsDialog = ref(false);
const selectedCart = ref(null);

// Cart data
const carts = ref([]);

// Cart statistics
const cartStats = reactive({
  totalCarts: 0,
  totalValue: 0,
  totalItems: 0,
  averageCartValue: 0
});

// Status options
const statusOptions = ref([
  { text: t('cart.allStatus', 'الكل'), value: 'all' },
  { text: t('cart.active', 'نشط'), value: 'active' },
  { text: t('cart.abandoned', 'مهمل'), value: 'abandoned' },
  { text: t('cart.converted', 'محول'), value: 'converted' },
  { text: t('cart.expired', 'منتهي الصلاحية'), value: 'expired' }
]);

// Cart items table headers
const cartItemsHeaders = ref([
  { title: t('cart.productName', 'اسم المنتج'), key: 'name' },
  { title: t('cart.quantity', 'الكمية'), key: 'quantity' },
  { title: t('cart.price', 'السعر'), key: 'price' },
  { title: t('cart.total', 'الإجمالي'), key: 'total' }
]);

// Computed
const filteredCarts = computed(() => {
  let filtered = carts.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(cart => 
      cart.id.toString().includes(query) ||
      (cart.customer && cart.customer.name && cart.customer.name.toLowerCase().includes(query)) ||
      cart.items.some(item => item.name.toLowerCase().includes(query))
    );
  }

  // Filter by status
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(cart => cart.status === statusFilter.value);
  }

  return filtered;
});

const totalPages = computed(() => {
  return Math.ceil(filteredCarts.value.length / itemsPerPage.value);
});

const paginatedCarts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredCarts.value.slice(start, end);
});

// Methods
const loadCarts = async () => {
  try {
    loading.value = true;
    const response = await CartService.getActiveCarts();
    
    if (response.success) {
      carts.value = response.data.carts;
      updateCartStats();
    }
  } catch (error) {
    console.error('Error loading carts:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('cart.loadError', 'فشل في تحميل السلال')
    });
  } finally {
    loading.value = false;
  }
};

const updateCartStats = () => {
  cartStats.totalCarts = carts.value.length;
  cartStats.totalValue = carts.value.reduce((sum, cart) => sum + cart.total, 0);
  cartStats.totalItems = carts.value.reduce((sum, cart) => sum + cart.items.length, 0);
  cartStats.averageCartValue = cartStats.totalCarts > 0 ? cartStats.totalValue / cartStats.totalCarts : 0;
};

const refreshData = async () => {
  await loadCarts();
  store.dispatch('notifications/showNotification', {
    type: 'success',
    message: t('cart.refreshSuccess', 'تم تحديث البيانات بنجاح')
  });
};

const exportCartData = async () => {
  try {
    const response = await CartService.exportCartData();
    
    if (response.success) {
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `carts_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('cart.exportSuccess', 'تم تصدير البيانات بنجاح')
      });
    }
  } catch (error) {
    console.error('Error exporting cart data:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('cart.exportError', 'فشل في تصدير البيانات')
    });
  }
};

const viewCartDetails = (cart) => {
  selectedCart.value = cart;
  cartDetailsDialog.value = true;
};

const editCart = (cart) => {
  // TODO: Implement edit cart functionality
  console.log('Edit cart:', cart);
};

const deleteCart = async (cart) => {
  try {
    const response = await CartService.deleteCart(cart.id);
    
    if (response.success) {
      carts.value = carts.value.filter(c => c.id !== cart.id);
      updateCartStats();
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('cart.deleteSuccess', 'تم حذف السلة بنجاح')
      });
    }
  } catch (error) {
    console.error('Error deleting cart:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('cart.deleteError', 'فشل في حذف السلة')
    });
  }
};

// Utility methods
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const getCartStatusText = (status) => {
  const map = {
    active: t('cart.active', 'نشط'),
    abandoned: t('cart.abandoned', 'مهمل'),
    converted: t('cart.converted', 'محول'),
    expired: t('cart.expired', 'منتهي الصلاحية')
  };
  return map[status] || status;
};

const getCartStatusColor = (status) => {
  const colors = {
    active: 'success',
    abandoned: 'warning',
    converted: 'info',
    expired: 'error'
  };
  return colors[status] || 'default';
};

// Lifecycle
onMounted(() => {
  loadCarts();
});
</script>

<style scoped>
.cart-manager {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
}

/* Header Styles */
.cart-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.refresh-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.refresh-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.export-btn {
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transition: all 0.3s ease;
}

.export-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

/* Statistics Cards */
.stat-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Content Styles */
.cart-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.cart-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.cart-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
}

.cart-items-preview {
  animation: fadeIn 0.6s ease-out;
}

/* Text Styles */
.text-dim {
  color: #666 !important;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .cart-header .v-btn {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  .cart-manager {
    padding: 1rem;
  }
  
  .cart-header,
  .cart-content {
    border-radius: 12px;
  }
}
</style>
