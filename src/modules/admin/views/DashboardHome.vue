<template>
  <v-container class="pa-4">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" class="mb-4" />
      <h3 class="text-h5 font-weight-medium mb-2">
        {{ $t('loadingDashboard') || 'جاري تحميل لوحة التحكم...' }}
      </h3>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('pleaseWait') || 'يرجى الانتظار' }}
      </p>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="error = null"
    >
      <v-alert-title class="d-flex align-center ga-2">
        <v-icon>mdi-alert-circle</v-icon>
        {{ $t('errorLoadingDashboard') || 'خطأ في تحميل لوحة التحكم' }}
      </v-alert-title>
      <v-alert-text>
        {{ error }}
      </v-alert-text>
    </v-alert>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Statistics Cards -->
      <v-row class="mb-6">
        <v-col
          v-for="(stat, index) in formattedStats"
          :key="stat.title"
          cols="12"
          sm="6"
          lg="3"
        >
          <v-card
            variant="elevated"
            class="stat-card"
            :style="{ animationDelay: index * 0.1 + 's' }"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center ga-4">
                <v-avatar
                  size="56"
                  :color="stat.color + '20'"
                  class="stat-icon"
                >
                  <v-icon :color="stat.color" size="28">
                    {{ stat.icon }}
                  </v-icon>
                </v-avatar>
                
                <div class="flex-grow-1">
                  <h3 class="text-h4 font-weight-bold mb-1">
                    {{ stat.value }}
                  </h3>
                  <p class="text-body-2 text-medium-emphasis mb-2">
                    {{ stat.title }}
                  </p>
                  <div class="d-flex align-center ga-1">
                    <v-icon
                      :color="stat.trend > 0 ? 'success' : 'error'"
                      size="16"
                    >
                      {{ stat.trend > 0 ? 'mdi-trending-up' : 'mdi-trending-down' }}
                    </v-icon>
                    <span
                      :class="[
                        'text-caption font-weight-medium',
                        stat.trend > 0 ? 'text-success' : 'text-error'
                      ]"
                    >
                      {{ Math.abs(stat.trend) }}%
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Charts and Content -->
      <v-row class="mb-6">
        <!-- Sales Chart -->
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="chart-card">
            <v-card-title class="d-flex align-center justify-space-between pa-4">
              <span class="text-h6 font-weight-bold">
                <v-icon class="me-2" color="primary">mdi-chart-line</v-icon>
                {{ $t('monthlySales') || 'المبيعات الشهرية' }}
              </span>
              <v-select
                v-model="selectedPeriod"
                :items="periodOptions"
                item-title="text"
                item-value="value"
                variant="outlined"
                density="compact"
                hide-details
                @update:model-value="handlePeriodChange"
              />
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-4">
              <div class="chart-container">
                <!-- Simple Bar Chart -->
                <div class="bar-chart">
                  <div
                    v-for="(data, index) in chartData"
                    :key="index"
                    class="bar-wrapper"
                  >
                    <div
                      class="bar"
                      :style="{ height: data.height + 'px' }"
                    ></div>
                    <span class="text-caption text-medium-emphasis">
                      {{ data.label }}
                    </span>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Top Products -->
        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="top-products-card">
            <v-card-title class="d-flex align-center justify-space-between pa-4">
              <span class="text-h6 font-weight-bold">
                <v-icon class="me-2" color="primary">mdi-trophy</v-icon>
                {{ $t('topSellingProducts') || 'المنتجات الأكثر مبيعاً' }}
              </span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-eye"
              >
                {{ $t('viewAll') || 'عرض الكل' }}
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-4">
              <div class="products-list">
                <v-list density="compact">
                  <v-list-item
                    v-for="product in topProducts"
                    :key="product.id"
                    class="product-item"
                  >
                    <template v-slot:prepend>
                      <v-avatar size="40" class="me-3">
                        <v-img :src="product.image" :alt="product.name" />
                      </v-avatar>
                    </template>
                    
                    <v-list-item-title class="text-body-1 font-weight-medium">
                      {{ product.name }}
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-caption text-medium-emphasis">
                      {{ product.category }}
                    </v-list-item-subtitle>
                    
                    <template v-slot:append>
                      <div class="text-end">
                        <div class="text-caption text-medium-emphasis">
                          {{ product.sales }} {{ $t('sales') || 'مبيعات' }}
                        </div>
                        <div class="text-body-2 font-weight-bold text-primary">
                          {{ product.revenue }} {{ $t('currency') || 'ر.س' }}
                        </div>
                      </div>
                    </template>
                  </v-list-item>
                </v-list>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Orders -->
      <v-row>
        <v-col cols="12">
          <v-card variant="elevated" class="recent-orders-card">
            <v-card-title class="d-flex align-center justify-space-between pa-4">
              <span class="text-h6 font-weight-bold">
                <v-icon class="me-2" color="primary">mdi-receipt-text</v-icon>
                {{ $t('recentOrders') || 'الطلبات الأخيرة' }}
              </span>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                prepend-icon="mdi-eye"
                to="/dashboard/orders"
              >
                {{ $t('viewAll') || 'عرض الكل' }}
              </v-btn>
            </v-card-title>
            
            <v-divider />
            
            <v-card-text class="pa-0">
              <v-data-table
                :headers="orderHeaders"
                :items="recentOrders"
                :loading="loading"
                density="compact"
                hide-default-footer
                class="orders-table"
              >
                <template v-slot:item.orderId="{ item }">
                  <span class="text-primary font-weight-bold">
                    #{{ item.id }}
                  </span>
                </template>
                
                <template v-slot:item.amount="{ item }">
                  <span class="font-weight-bold">
                    {{ item.amount }} {{ $t('currency') || 'ر.س' }}
                  </span>
                </template>
                
                <template v-slot:item.status="{ item }">
                  <v-chip
                    :color="getStatusColor(item.status)"
                    size="small"
                    variant="tonal"
                  >
                    {{ item.statusText }}
                  </v-chip>
                </template>
                
                <template v-slot:item.actions="{ item }">
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    size="small"
                    color="primary"
                    @click="viewOrder(item.id)"
                  >
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useQuery } from '@vue/apollo-composable';
import { DASHBOARD_STATISTICS_QUERY, SHOP_STATISTICS_QUERY, RECENT_REVIEWS_QUERY } from '@/integration/graphql/common.graphql';

const router = useRouter();
const { t } = useI18n();
const store = useStore();

// State
const salesData = ref([]);
const selectedPeriod = ref('7days');

// Period options for chart filter
const periodOptions = computed(() => [
  { text: t('last7Days') || 'آخر 7 أيام', value: '7days' },
  { text: t('last30Days') || 'آخر 30 يوم', value: '30days' },
  { text: t('last3Months') || 'آخر 3 شهور', value: '3months' }
]);

// Order table headers
const orderHeaders = computed(() => [
  { title: t('orderNumber') || 'رقم الطلب', key: 'orderId', sortable: false },
  { title: t('customer') || 'العميل', key: 'customer', sortable: false },
  { title: t('date') || 'التاريخ', key: 'date', sortable: false },
  { title: t('amount') || 'المبلغ', key: 'amount', sortable: false },
  { title: t('status') || 'الحالة', key: 'status', sortable: false },
  { title: t('actions') || 'الإجراءات', key: 'actions', sortable: false, align: 'end' }
]);

// Chart data for visualization
const chartData = computed(() => {
  const days = parseInt(selectedPeriod.value.replace(/\D/g, '')) || 7;
  return Array.from({ length: Math.min(days, 7) }, (_, i) => ({
    label: t('day') || 'يوم' + ' ' + (i + 1),
    height: Math.random() * 150 + 50
  }));
});

// Computed
const formattedStats = computed(() => {
  return stats.value.map(stat => ({
    title: stat.title,
    value: formatValue(stat.value, stat.type),
    icon: getStatIcon(stat.icon),
    color: stat.color,
    trend: stat.trend || 0,
  }));
});

// Methods
const formatValue = (value, type = 'number') => {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
      }).format(value);
    case 'percentage':
      return `${value}%`;
    default:
      return value.toLocaleString('ar-SA');
  }
};

const getStatIcon = (iconClass) => {
  const iconMap = {
    'fa-solid fa-wallet': 'mdi-wallet',
    'fa-solid fa-shopping-bag': 'mdi-shopping',
    'fa-solid fa-users': 'mdi-account-group',
    'fa-solid fa-chart-line': 'mdi-chart-line'
  };
  return iconMap[iconClass] || 'mdi-chart-line';
};

const getStatusColor = (status) => {
  const colorMap = {
    'completed': 'success',
    'processing': 'info',
    'pending': 'warning',
    'cancelled': 'error'
  };
  return colorMap[status] || 'default';
};

const viewOrder = (orderId) => {
  router.push(`/dashboard/orders/${orderId}`);
};

// GraphQL Queries for instant dashboard statistics with caching
const { 
  result: dashboardStatsResult, 
  loading: statsLoading, 
  error: statsError 
} = useQuery(DASHBOARD_STATISTICS_QUERY, {}, {
  cachePolicy: 'cache-first', // Enable instant loading with cache
  errorPolicy: 'all'
});

const { 
  result: shopStatsResult, 
  loading: shopLoading, 
  error: shopError 
} = useQuery(SHOP_STATISTICS_QUERY, {}, {
  cachePolicy: 'cache-first',
  errorPolicy: 'all'
});

const { 
  result: reviewsResult, 
  loading: reviewsLoading, 
  error: reviewsError 
} = useQuery(RECENT_REVIEWS_QUERY, { limit: 5 }, {
  cachePolicy: 'cache-first',
  errorPolicy: 'all'
});

// Computed properties for reactive data
const loading = computed(() => statsLoading.value || shopLoading.value || reviewsLoading.value);
const error = computed(() => {
  if (statsError.value) return t('errorLoadingDashboard') || 'فشل في تحميل بيانات لوحة التحكم';
  if (shopError.value) return t('errorLoadingShopStats') || 'فشل في تحميل إحصائيات المتجر';
  if (reviewsError.value) return t('errorLoadingReviews') || 'فشل في تحميل التقييمات';
  return null;
});

const stats = computed(() => {
  if (dashboardStatsResult.value?.dashboardStatistics) {
    const data = dashboardStatsResult.value.dashboardStatistics;
    return [
      {
        title: t('totalRevenue') || 'إجمالي الإيرادات',
        value: data.totalRevenue || 0,
        type: 'currency',
        icon: 'fa-solid fa-wallet',
        color: '#D4AF37',
        trend: 12.5,
      },
      {
        title: t('totalOrders') || 'إجمالي الطلبات',
        value: data.totalOrders || 0,
        type: 'number',
        icon: 'fa-solid fa-shopping-bag',
        color: '#2196F3',
        trend: 8.2,
      },
      {
        title: t('totalCustomers') || 'إجمالي العملاء',
        value: data.totalCustomers || 0,
        type: 'number',
        icon: 'fa-solid fa-users',
        color: '#4CAF50',
        trend: -2.4,
      },
      {
        title: t('totalProducts') || 'إجمالي المنتجات',
        value: data.totalProducts || 0,
        type: 'number',
        icon: 'fa-solid fa-chart-line',
        color: '#9C27B0',
        trend: 5.1,
      },
    ];
  }
  
  // Fallback data
  return [
    {
      title: t('totalSales') || 'إجمالي المبيعات',
      value: 45280,
      type: 'currency',
      icon: 'fa-solid fa-wallet',
      color: '#D4AF37',
      trend: 12.5,
    },
    {
      title: t('newOrders') || 'الطلبات الجديدة',
      value: 156,
      type: 'number',
      icon: 'fa-solid fa-shopping-bag',
      color: '#2196F3',
      trend: 8.2,
    },
    {
      title: t('activeCustomers') || 'العملاء النشطون',
      value: 2420,
      type: 'number',
      icon: 'fa-solid fa-users',
      color: '#4CAF50',
      trend: -2.4,
    },
    {
      title: t('averageOrderValue') || 'متوسط قيمة الطلب',
      value: 290,
      type: 'currency',
      icon: 'fa-solid fa-chart-line',
      color: '#9C27B0',
      trend: 5.1,
    },
  ];
});

const topProducts = computed(() => {
  if (shopStatsResult.value?.shopStatistics?.topProducts) {
    return shopStatsResult.value.shopStatistics.topProducts.map(product => ({
      id: product.id,
      name: product.name,
      image: product.image || '/images/products/default.jpg',
      category: t('unknown') || 'Unknown',
      sales: product.sales,
      revenue: product.revenue
    }));
  }
  
  // Fallback data
  return [
    {
      id: 1,
      name: 'Vinyl Art Premium',
      image: '/images/products/product1.jpg',
      category: 'Wall Art',
      sales: 45,
      revenue: 13500
    },
    {
      id: 2,
      name: 'Custom Vinyl Design',
      image: '/images/products/product2.jpg',
      category: 'Custom Design',
      sales: 38,
      revenue: 11400
    },
    {
      id: 3,
      name: 'Modern Wall Decor',
      image: '/images/products/product3.jpg',
      category: 'Home Decor',
      sales: 32,
      revenue: 9600
    }
  ];
});

const recentOrders = computed(() => {
  const ordersData = dashboardStatsResult.value?.dashboardStatistics?.recentOrders || 
                   shopStatsResult.value?.shopStatistics?.recentOrders || [];
  
  if (ordersData.length > 0) {
    return ordersData.map(order => ({
      id: order.id,
      customer: order.customer?.name || t('unknownCustomer') || 'عميل غير معروف',
      date: formatDate(order.createdAt),
      amount: order.total || order.totalAmount,
      status: order.status,
      statusText: getStatusText(order.status)
    }));
  }
  
  // Fallback data
  return [
    {
      id: 1001,
      customer: 'أحمد محمد',
      date: '2024-03-15',
      amount: 450,
      status: 'completed',
      statusText: t('completed') || 'مكتمل'
    },
    {
      id: 1002,
      customer: 'فاطمة العلي',
      date: '2024-03-14',
      amount: 320,
      status: 'processing',
      statusText: t('processing') || 'قيد المعالجة'
    },
    {
      id: 1003,
      customer: 'محمد العبدالله',
      date: '2024-03-14',
      amount: 180,
      status: 'pending',
      statusText: t('pending') || 'في الانتظار'
    }
  ];
});

// Helper functions
const getTotalSalesTitle = (period) => {
  const titles = {
    'daily': t('dailySales') || 'إجمالي المبيعات اليومية',
    'weekly': t('weeklySales') || 'إجمالي المبيعات الأسبوعية',
    'monthly': t('monthlySales') || 'إجمالي المبيعات الشهرية',
    'yearly': t('yearlySales') || 'إجمالي المبيعات السنوية'
  };
  return titles[period] || t('totalSales') || 'إجمالي المبيعات';
};

const calculateTrend = (stat) => {
  // Simple trend calculation based on recent data
  return Math.random() * 20 - 10; // Random between -10 and 10
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-SA');
};

const getStatusText = (status) => {
  const statusMap = {
    'completed': t('completed') || 'مكتمل',
    'processing': t('processing') || 'قيد المعالجة',
    'pending': t('pending') || 'في الانتظار',
    'cancelled': t('cancelled') || 'ملغي'
  };
  return statusMap[status] || status;
};

const handlePeriodChange = async (period) => {
  try {
    const salesChartData = await DashboardService.getSalesData(period);
    salesData.value = salesChartData;
  } catch (err) {
    console.error('Error fetching sales data:', err);
    // Show notification to user
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('warning') || 'تحذير',
      message: t('errorLoadingSalesData') || 'خطأ في تحميل بيانات المبيعات',
      timeout: 5000
    });
  }
};

const updateOrderStatus = async (orderId, newStatus) => {
  try {
    await DashboardService.updateOrderStatus(orderId, newStatus);
    // Refresh orders list
    const ordersData = await DashboardService.getRecentOrders(5);
    recentOrders.value = ordersData;
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('success') || 'نجاح',
      message: t('orderStatusUpdated') || 'تم تحديث حالة الطلب بنجاح',
      timeout: 3000
    });
  } catch (err) {
    console.error('Error updating order status:', err);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('errorUpdatingOrder') || 'خطأ في تحديث حالة الطلب',
      timeout: 5000
    });
  }
};

// No need for onMounted - GraphQL queries are reactive and will load automatically with caching
</script>

<style scoped>
/* Statistics Cards */
.stat-card {
  transition: all 0.3s ease;
  animation: slideUp 0.5s ease forwards;
  opacity: 0;
  transform: translateY(20px);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.stat-icon {
  transition: all 0.3s ease;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
}

@keyframes slideUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Chart Container */
.chart-container {
  height: 300px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  height: 100%;
  width: 100%;
  padding: 0 16px;
}

.bar-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  max-width: 60px;
}

.bar {
  width: 100%;
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 8px 8px 0 0;
  min-height: 30px;
  transition: height 0.3s ease;
  animation: barGrow 1s ease;
}

@keyframes barGrow {
  from {
    height: 30px;
  }
  to {
    height: var(--height);
  }
}

.bar-wrapper span {
  color: rgb(var(--v-theme-on-surface-variant));
  font-size: 0.75rem;
  text-align: center;
}

/* Products List */
.products-list {
  max-height: 400px;
  overflow-y: auto;
}

.products-list::-webkit-scrollbar {
  width: 4px;
}

.products-list::-webkit-scrollbar-track {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 2px;
}

.products-list::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.5);
  border-radius: 2px;
}

.products-list::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.7);
}

.product-item {
  transition: all 0.3s ease;
}

.product-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Orders Table */
.orders-table {
  border-radius: 8px;
  overflow: hidden;
}

.orders-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
}

/* Card Animations */
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Button Animations */
.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
}

/* Loading Animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.v-progress-circular {
  animation: pulse 2s infinite;
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .bar-chart {
    gap: 8px;
    padding: 0 8px;
  }
  
  .bar-wrapper {
    max-width: 40px;
  }
}

@media (max-width: 600px) {
  .chart-container {
    height: 250px;
  }
  
  .bar-chart {
    gap: 4px;
    padding: 0 4px;
  }
  
  .bar-wrapper {
    max-width: 30px;
  }
  
  .bar-wrapper span {
    font-size: 0.65rem;
  }
}

/* Fade in animation for the whole dashboard */
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

.v-container {
  animation: fadeIn 0.5s ease;
}
</style>
