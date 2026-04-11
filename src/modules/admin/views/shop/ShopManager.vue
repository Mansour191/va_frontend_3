<template>
  <v-container fluid class="shop-manager pa-4">
    <!-- Header -->
    <v-card class="shop-header mb-6" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar
                color="#d4af37"
                size="48"
                class="me-4"
              >
                <v-icon icon="mdi-store" size="28"></v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold">
                  {{ $t('shop.title', 'إدارة المتجر') }}
                </h1>
                <p class="text-body-1 text-dim mt-1">
                  {{ $t('shop.subtitle', 'إدارة جميع منتجات وعروض المتجر الإلكتروني') }}
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
                @click="exportShopData"
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
            <v-icon icon="mdi-package-variant" size="32" color="#d4af37" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ shopStats.totalProducts }}</h3>
            <p class="text-body-2 text-dim">{{ $t('shop.totalProducts', 'إجمالي المنتجات') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-tag" size="32" color="success" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ shopStats.activePromotions }}</h3>
            <p class="text-body-2 text-dim">{{ $t('shop.activePromotions', 'العروض النشطة') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-star" size="32" color="warning" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ shopStats.averageRating }}</h3>
            <p class="text-body-2 text-dim">{{ $t('shop.averageRating', 'متوسط التقييم') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card" elevation="2">
          <v-card-text class="pa-4 text-center">
            <v-icon icon="mdi-currency-usd" size="32" color="info" class="mb-2"></v-icon>
            <h3 class="text-h4 font-weight-bold">{{ formatCurrency(shopStats.totalRevenue) }}</h3>
            <p class="text-body-2 text-dim">{{ $t('shop.totalRevenue', 'إجمالي الإيرادات') }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main Content -->
    <v-card class="shop-content" elevation="2">
      <v-card-title class="pa-4">
        <div class="d-flex justify-space-between align-center w-100">
          <h3 class="text-h5 font-weight-bold">
            <v-icon icon="mdi-view-dashboard" size="24" class="me-2"></v-icon>
            {{ $t('shop.overview', 'نظرة عامة') }}
          </h3>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="#d4af37" size="48"></v-progress-circular>
          <div class="mt-4 text-body-2 text-dim">{{ $t('common.loading', 'جاري التحميل...') }}</div>
        </div>

        <!-- Overview Content -->
        <div v-else>
          <v-row>
            <!-- Recent Products -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="pa-3">
                  <h4 class="text-h6 font-weight-bold">
                    <v-icon icon="mdi-package" size="20" color="#d4af37" class="me-2"></v-icon>
                    {{ $t('shop.recentProducts', 'المنتجات الحديثة') }}
                  </h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-3">
                  <div v-if="recentProducts.length === 0" class="text-center py-4">
                    <v-icon icon="mdi-package-variant" size="48" color="#d4af37" class="mb-2"></v-icon>
                    <p class="text-body-2 text-dim">{{ $t('shop.noProducts', 'لا توجد منتجات') }}</p>
                  </div>
                  <div v-else>
                    <v-list density="compact">
                      <v-list-item
                        v-for="product in recentProducts"
                        :key="product.id"
                        class="px-0"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="32" class="me-3">
                            <v-img :src="product.image" cover></v-img>
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-body-2">{{ product.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption text-dim">
                          {{ formatCurrency(product.price) }} • {{ product.stock }} {{ $t('shop.inStock', 'في المخزون') }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                          <v-chip
                            :color="getProductStatusColor(product.status)"
                            variant="elevated"
                            size="x-small"
                          >
                            {{ getProductStatusText(product.status) }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div class="text-center mt-3">
                    <v-btn
                      variant="text"
                      size="small"
                      color="#d4af37"
                      to="/dashboard/products"
                    >
                      {{ $t('shop.viewAllProducts', 'عرض كل المنتجات') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Active Promotions -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="pa-3">
                  <h4 class="text-h6 font-weight-bold">
                    <v-icon icon="mdi-tag" size="20" color="#d4af37" class="me-2"></v-icon>
                    {{ $t('shop.activePromotions', 'العروض النشطة') }}
                  </h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-3">
                  <div v-if="activePromotions.length === 0" class="text-center py-4">
                    <v-icon icon="mdi-tag-outline" size="48" color="#d4af37" class="mb-2"></v-icon>
                    <p class="text-body-2 text-dim">{{ $t('shop.noPromotions', 'لا توجد عروض') }}</p>
                  </div>
                  <div v-else>
                    <v-list density="compact">
                      <v-list-item
                        v-for="promotion in activePromotions"
                        :key="promotion.id"
                        class="px-0"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="32" class="me-3" color="#d4af37">
                            <v-icon icon="mdi-tag" size="16"></v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-body-2">{{ promotion.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption text-dim">
                          {{ promotion.discount }}% {{ $t('shop.discount', 'خصم') }} • {{ $t('shop.until', 'حتى') }} {{ formatDate(promotion.endDate) }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                          <v-chip
                            color="success"
                            variant="elevated"
                            size="x-small"
                          >
                            {{ promotion.usedCount }} {{ $t('shop.used', 'مستخدم') }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div class="text-center mt-3">
                    <v-btn
                      variant="text"
                      size="small"
                      color="#d4af37"
                      to="/dashboard/promotions"
                    >
                      {{ $t('shop.managePromotions', 'إدارة العروض') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Recent Orders -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="pa-3">
                  <h4 class="text-h6 font-weight-bold">
                    <v-icon icon="mdi-receipt" size="20" color="#d4af37" class="me-2"></v-icon>
                    {{ $t('shop.recentOrders', 'الطلبات الحديثة') }}
                  </h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-3">
                  <div v-if="recentOrders.length === 0" class="text-center py-4">
                    <v-icon icon="mdi-receipt-outline" size="48" color="#d4af37" class="mb-2"></v-icon>
                    <p class="text-body-2 text-dim">{{ $t('shop.noOrders', 'لا توجد طلبات') }}</p>
                  </div>
                  <div v-else>
                    <v-list density="compact">
                      <v-list-item
                        v-for="order in recentOrders"
                        :key="order.id"
                        class="px-0"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="32" class="me-3" color="#d4af37">
                            <v-icon icon="mdi-receipt" size="16"></v-icon>
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-body-2">
                          {{ $t('shop.order', 'طلب') }} #{{ order.id }}
                        </v-list-item-title>
                        <v-list-item-subtitle class="text-caption text-dim">
                          {{ order.customerName }} • {{ formatCurrency(order.total) }}
                        </v-list-item-subtitle>
                        <template v-slot:append>
                          <v-chip
                            :color="getOrderStatusColor(order.status)"
                            variant="elevated"
                            size="x-small"
                          >
                            {{ getOrderStatusText(order.status) }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div class="text-center mt-3">
                    <v-btn
                      variant="text"
                      size="small"
                      color="#d4af37"
                      to="/dashboard/orders"
                    >
                      {{ $t('shop.viewAllOrders', 'عرض كل الطلبات') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Customer Reviews -->
            <v-col cols="12" md="6">
              <v-card variant="outlined" class="mb-4">
                <v-card-title class="pa-3">
                  <h4 class="text-h6 font-weight-bold">
                    <v-icon icon="mdi-star" size="20" color="#d4af37" class="me-2"></v-icon>
                    {{ $t('shop.recentReviews', 'التقييمات الحديثة') }}
                  </h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-3">
                  <div v-if="recentReviews.length === 0" class="text-center py-4">
                    <v-icon icon="mdi-star-outline" size="48" color="#d4af37" class="mb-2"></v-icon>
                    <p class="text-body-2 text-dim">{{ $t('shop.noReviews', 'لا توجد تقييمات') }}</p>
                  </div>
                  <div v-else>
                    <v-list density="compact">
                      <v-list-item
                        v-for="review in recentReviews"
                        :key="review.id"
                        class="px-0"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="32" class="me-3">
                            <v-img :src="review.customerAvatar" cover></v-img>
                          </v-avatar>
                        </template>
                        <v-list-item-title class="text-body-2">{{ review.customerName }}</v-list-item-title>
                        <v-list-item-subtitle class="text-caption text-dim">
                          {{ review.productName }}
                        </v-list-item-subtitle>
                        <v-rating
                          :model-value="review.rating"
                          size="16"
                          color="#d4af37"
                          readonly
                          density="compact"
                          class="mb-1"
                        ></v-rating>
                        <p class="text-caption text-dim">{{ review.comment }}</p>
                        <template v-slot:append>
                          <v-chip
                            :color="getReviewStatusColor(review.status)"
                            variant="elevated"
                            size="x-small"
                          >
                            {{ getReviewStatusText(review.status) }}
                          </v-chip>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>
                  <div class="text-center mt-3">
                    <v-btn
                      variant="text"
                      size="small"
                      color="#d4af37"
                      to="/dashboard/reviews"
                    >
                      {{ $t('shop.manageReviews', 'إدارة التقييمات') }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <!-- Shop Analytics -->
          <v-row class="mt-4">
            <v-col cols="12">
              <v-card variant="outlined">
                <v-card-title class="pa-3">
                  <h4 class="text-h6 font-weight-bold">
                    <v-icon icon="mdi-chart-line" size="20" color="#d4af37" class="me-2"></v-icon>
                    {{ $t('shop.analytics', 'تحليلات المتجر') }}
                  </h4>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text class="pa-3">
                  <v-row>
                    <v-col cols="12" md="3">
                      <div class="text-center">
                        <div class="text-h5 font-weight-bold text-success">{{ shopStats.todayOrders }}</div>
                        <div class="text-caption text-dim">{{ $t('shop.todayOrders', 'طلبات اليوم') }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-center">
                        <div class="text-h5 font-weight-bold text-info">{{ shopStats.todayRevenue }}</div>
                        <div class="text-caption text-dim">{{ $t('shop.todayRevenue', 'إيرادات اليوم') }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-center">
                        <div class="text-h5 font-weight-bold text-warning">{{ shopStats.newCustomers }}</div>
                        <div class="text-caption text-dim">{{ $t('shop.newCustomers', 'عملاء جدد') }}</div>
                      </div>
                    </v-col>
                    <v-col cols="12" md="3">
                      <div class="text-center">
                        <div class="text-h5 font-weight-bold text-error">{{ shopStats.conversionRate }}%</div>
                        <div class="text-caption text-dim">{{ $t('shop.conversionRate', 'معدل التحويل') }}</div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import ShopService from '@/services/ShopService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);

// Shop data
const recentProducts = ref([]);
const activePromotions = ref([]);
const recentOrders = ref([]);
const recentReviews = ref([]);

// Shop statistics
const shopStats = reactive({
  totalProducts: 0,
  activePromotions: 0,
  averageRating: 0,
  totalRevenue: 0,
  todayOrders: 0,
  todayRevenue: 0,
  newCustomers: 0,
  conversionRate: 0
});

// Methods
const loadShopData = async () => {
  try {
    loading.value = true;
    
    // Load shop statistics
    try {
      const statsResponse = await ShopService.getShopStats();
      if (statsResponse.success) {
        Object.assign(shopStats, statsResponse.data);
      } else {
        // Fallback to direct API
        const statsData = await fetch('/api/shop/statistics');
        if (statsData.ok) {
          const data = await statsData.json();
          Object.assign(shopStats, data);
        }
      }
    } catch (statsError) {
      console.error('Failed to load shop stats:', statsError);
      // Try direct API as fallback
      try {
        const statsData = await fetch('/api/shop/statistics');
        if (statsData.ok) {
          const data = await statsData.json();
          Object.assign(shopStats, data);
        }
      } catch (directError) {
        console.error('Direct API also failed:', directError);
      }
    }

    // Load recent products
    try {
      const productsResponse = await ShopService.getRecentProducts({ limit: 5 });
      if (productsResponse.success) {
        recentProducts.value = productsResponse.data.products;
      } else {
        // Fallback to direct API
        const productsData = await fetch('/api/products/recent?limit=5');
        if (productsData.ok) {
          recentProducts.value = await productsData.json();
        }
      }
    } catch (productsError) {
      console.error('Failed to load recent products:', productsError);
    }

    // Load active promotions
    try {
      const promotionsResponse = await ShopService.getActivePromotions({ limit: 5 });
      if (promotionsResponse.success) {
        activePromotions.value = promotionsResponse.data.promotions;
      } else {
        // Fallback to direct API
        const promotionsData = await fetch('/api/promotions/active?limit=5');
        if (promotionsData.ok) {
          activePromotions.value = await promotionsData.json();
        }
      }
    } catch (promotionsError) {
      console.error('Failed to load active promotions:', promotionsError);
    }

    // Load recent orders
    try {
      const ordersResponse = await ShopService.getRecentOrders({ limit: 5 });
      if (ordersResponse.success) {
        recentOrders.value = ordersResponse.data.orders;
      } else {
        // Fallback to direct API
        const ordersData = await fetch('/api/orders/recent?limit=5');
        if (ordersData.ok) {
          const data = await ordersData.json();
          recentOrders.value = data.map(order => ({
            id: order.id,
            customer: order.customer?.name || 'عميل غير معروف',
            total: order.total_amount,
            status: order.status,
            date: order.created_at
          }));
        }
      }
    } catch (ordersError) {
      console.error('Failed to load recent orders:', ordersError);
    }

    // Load recent reviews
    try {
      const reviewsResponse = await ShopService.getRecentReviews({ limit: 5 });
      if (reviewsResponse.success) {
        recentReviews.value = reviewsResponse.data.reviews;
      } else {
        // Fallback to direct API
        const reviewsData = await fetch('/api/reviews/recent?limit=5');
        if (reviewsData.ok) {
          const data = await reviewsData.json();
          recentReviews.value = data.map(review => ({
            id: review.id,
            customer: review.customer?.name || 'عميل غير معروف',
            rating: review.rating,
            comment: review.comment,
            product: review.product?.name || 'منتج غير محدد',
            date: review.created_at
          }));
        }
      }
    } catch (reviewsError) {
      console.error('Failed to load recent reviews:', reviewsError);
    }

  } catch (error) {
    console.error('Error loading shop data:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('shop.loadError', 'فشل في تحميل بيانات المتجر')
    });
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await loadShopData();
  store.dispatch('notifications/showNotification', {
    type: 'success',
    message: t('shop.refreshSuccess', 'تم تحديث البيانات بنجاح')
  });
};

const exportShopData = async () => {
  try {
    const response = await ShopService.exportShopData();
    
    if (response.success) {
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shop_data_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('shop.exportSuccess', 'تم تصدير البيانات بنجاح')
      });
    }
  } catch (error) {
    console.error('Error exporting shop data:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('shop.exportError', 'فشل في تصدير البيانات')
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
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const getProductStatusText = (status) => {
  const map = {
    active: t('shop.active', 'نشط'),
    inactive: t('shop.inactive', 'غير نشط'),
    out_of_stock: t('shop.outOfStock', 'نفد المخزون'),
    draft: t('shop.draft', 'مسودة')
  };
  return map[status] || status;
};

const getProductStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'warning',
    out_of_stock: 'error',
    draft: 'info'
  };
  return colors[status] || 'default';
};

const getOrderStatusText = (status) => {
  const map = {
    pending: t('shop.pending', 'قيد الانتظار'),
    processing: t('shop.processing', 'قيد المعالجة'),
    shipped: t('shop.shipped', 'تم الشحن'),
    delivered: t('shop.delivered', 'تم التوصيل'),
    cancelled: t('shop.cancelled', 'ملغي')
  };
  return map[status] || status;
};

const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };
  return colors[status] || 'default';
};

const getReviewStatusText = (status) => {
  const map = {
    approved: t('shop.approved', 'مقبول'),
    pending: t('shop.pending', 'قيد الانتظار'),
    rejected: t('shop.rejected', 'مرفوض')
  };
  return map[status] || status;
};

const getReviewStatusColor = (status) => {
  const colors = {
    approved: 'success',
    pending: 'warning',
    rejected: 'error'
  };
  return colors[status] || 'default';
};

// Lifecycle
onMounted(() => {
  loadShopData();
});
</script>

<style scoped>
.shop-manager {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
}

/* Header Styles */
.shop-header {
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
.shop-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
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
  .shop-header .v-btn {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  .shop-manager {
    padding: 1rem;
  }
  
  .shop-header,
  .shop-content {
    border-radius: 12px;
  }
}
</style>
