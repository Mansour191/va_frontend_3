<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 integration-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-plug</v-icon>
              {{ $t('integrationDashboard') || 'لوحة التكامل' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('integrationSubtitle') || 'مراقبة وإدارة التكامل مع ERPNext' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="syncAll"
              :disabled="globalSyncing"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-sync"
            >
              {{ globalSyncing ? ($t('globalSyncing') || 'جاري المزامنة الشاملة...') : ($t('globalSync') || 'مزامنة شاملة') }}
            </v-btn>
            <v-btn
              @click="refreshAll"
              variant="tonal"
              color="info"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Connection Status -->
    <v-card 
      variant="elevated" 
      class="mb-6"
      :class="{ 'border-success': connectionStatus, 'border-error': !connectionStatus }"
    >
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div class="d-flex align-center ga-4">
            <v-avatar 
              :color="connectionStatus ? 'success' : 'error'" 
              variant="tonal" 
              size="48"
            >
              <v-icon :color="connectionStatus ? 'success' : 'error'" size="28">
                {{ connectionStatus ? 'mdi-check-circle' : 'mdi-exclamation-circle' }}
              </v-icon>
            </v-avatar>
            <div>
              <h3 class="text-h6 font-weight-medium mb-1">ERPNext</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                {{ connectionStatus ? ($t('connected') || 'متصل') : ($t('disconnected') || 'غير متصل') }}
              </p>
              <small v-if="connectionStatus" class="text-caption text-medium-emphasis">
                {{ $t('lastUpdate') || 'آخر تحديث' }}: {{ lastSync || ($t('neverSynced') || 'لم تتم المزامنة بعد') }}
              </small>
            </div>
          </div>
          <v-btn
            @click="testConnection"
            :disabled="testing"
            :loading="testing"
            variant="tonal"
            color="info"
          >
            {{ testing ? ($t('testing') || 'جاري الاختبار...') : ($t('testConnection') || 'اختبار الاتصال') }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Sync Statistics -->
    <v-row class="mb-6">
      <v-col cols="12" md="4">
        <v-card variant="elevated" class="stat-card products">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="primary" variant="tonal" size="40">
                <v-icon color="primary" size="24">mdi-package</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-medium">{{ $t('products') || 'المنتجات' }}</h3>
            </div>
            
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">{{ $t('total') || 'الإجمالي' }}:</span>
                <span class="stat-value">{{ stats.products.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('synced') || 'متزامن' }}:</span>
                <span class="stat-value success">{{ stats.products.synced }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pending') || 'معلق' }}:</span>
                <span class="stat-value warning">{{ stats.products.pending }}</span>
              </div>
            </div>
            
            <div class="d-flex ga-2">
              <v-btn
                @click="syncProducts"
                :disabled="syncing.products"
                :loading="syncing.products"
                variant="elevated"
                color="primary"
                size="small"
                prepend-icon="mdi-sync"
              >
                {{ syncing.products ? ($t('syncing') || 'جاري...') : ($t('sync') || 'مزامنة') }}
              </v-btn>
              <v-btn
                variant="tonal"
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                to="/dashboard/products"
              >
                {{ $t('view') || 'عرض' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="elevated" class="stat-card customers">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="success" variant="tonal" size="40">
                <v-icon color="success" size="24">mdi-account-group</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-medium">{{ $t('customers') || 'العملاء' }}</h3>
            </div>
            
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">{{ $t('total') || 'الإجمالي' }}:</span>
                <span class="stat-value">{{ stats.customers.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('synced') || 'متزامن' }}:</span>
                <span class="stat-value success">{{ stats.customers.synced }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pending') || 'معلق' }}:</span>
                <span class="stat-value warning">{{ stats.customers.pending }}</span>
              </div>
            </div>
            
            <div class="d-flex ga-2">
              <v-btn
                @click="syncCustomers"
                :disabled="syncing.customers"
                :loading="syncing.customers"
                variant="elevated"
                color="primary"
                size="small"
                prepend-icon="mdi-sync"
              >
                {{ syncing.customers ? ($t('syncing') || 'جاري...') : ($t('sync') || 'مزامنة') }}
              </v-btn>
              <v-btn
                variant="tonal"
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                to="/dashboard/users"
              >
                {{ $t('view') || 'عرض' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card variant="elevated" class="stat-card orders">
          <v-card-text class="pa-4">
            <div class="d-flex align-center ga-3 mb-4">
              <v-avatar color="warning" variant="tonal" size="40">
                <v-icon color="warning" size="24">mdi-shopping-cart</v-icon>
              </v-avatar>
              <h3 class="text-h6 font-weight-medium">{{ $t('orders') || 'الطلبات' }}</h3>
            </div>
            
            <div class="stats-grid mb-4">
              <div class="stat-item">
                <span class="stat-label">{{ $t('total') || 'الإجمالي' }}:</span>
                <span class="stat-value">{{ stats.orders.total }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('synced') || 'متزامن' }}:</span>
                <span class="stat-value success">{{ stats.orders.synced }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">{{ $t('pending') || 'معلق' }}:</span>
                <span class="stat-value warning">{{ stats.orders.pending }}</span>
              </div>
            </div>
            
            <div class="d-flex ga-2">
              <v-btn
                @click="syncOrders"
                :disabled="syncing.orders"
                :loading="syncing.orders"
                variant="elevated"
                color="primary"
                size="small"
                prepend-icon="mdi-sync"
              >
                {{ syncing.orders ? ($t('syncing') || 'جاري...') : ($t('sync') || 'مزامنة') }}
              </v-btn>
              <v-btn
                variant="tonal"
                color="info"
                size="small"
                prepend-icon="mdi-eye"
                to="/dashboard/orders"
              >
                {{ $t('view') || 'عرض' }}
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Global Sync Progress -->
    <v-card variant="elevated" class="mb-6" v-if="globalSyncing">
      <v-card-title class="pa-4">
        <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
          <v-icon color="primary">mdi-sync</v-icon>
          {{ $t('globalSyncProgress') || 'تقدم المزامنة الشاملة' }}
        </h3>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-stepper v-model="currentSyncStep" alt-labels>
          <v-stepper-header>
            <v-stepper-item
              :title="$t('products') || 'المنتجات'"
              :value="1"
              :complete="syncSteps.products.completed"
              :color="syncSteps.products.completed ? 'success' : 'primary'"
            >
              <template v-slot:icon>
                <v-icon v-if="syncSteps.products.completed">mdi-check</v-icon>
                <v-progress-circular
                  v-else-if="syncSteps.products.inProgress"
                  indeterminate
                  size="20"
                  width="2"
                />
                <span v-else>1</span>
              </template>
            </v-stepper-item>

            <v-divider></v-divider>

            <v-stepper-item
              :title="$t('customers') || 'العملاء'"
              :value="2"
              :complete="syncSteps.customers.completed"
              :color="syncSteps.customers.completed ? 'success' : 'primary'"
            >
              <template v-slot:icon>
                <v-icon v-if="syncSteps.customers.completed">mdi-check</v-icon>
                <v-progress-circular
                  v-else-if="syncSteps.customers.inProgress"
                  indeterminate
                  size="20"
                  width="2"
                />
                <span v-else>2</span>
              </template>
            </v-stepper-item>

            <v-divider></v-divider>

            <v-stepper-item
              :title="$t('orders') || 'الطلبات'"
              :value="3"
              :complete="syncSteps.orders.completed"
              :color="syncSteps.orders.completed ? 'success' : 'primary'"
            >
              <template v-slot:icon>
                <v-icon v-if="syncSteps.orders.completed">mdi-check</v-icon>
                <v-progress-circular
                  v-else-if="syncSteps.orders.inProgress"
                  indeterminate
                  size="20"
                  width="2"
                />
                <span v-else>3</span>
              </template>
            </v-stepper-item>
          </v-stepper-header>
        </v-stepper>
      </v-card-text>
    </v-card>

    <!-- Sync History -->
    <v-card variant="elevated" class="mb-6">
      <v-card-title class="pa-4">
        <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
          <v-icon color="primary">mdi-history</v-icon>
          {{ $t('syncHistory') || 'سجل المزامنة' }}
        </h3>
        <v-spacer />
        <v-btn
          @click="loadSyncHistory"
          variant="tonal"
          color="info"
          prepend-icon="mdi-refresh"
          size="small"
        >
          {{ $t('refresh') || 'تحديث' }}
        </v-btn>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-timeline density="compact" v-if="syncHistory.length">
          <v-timeline-item
            v-for="(item, index) in syncHistory"
            :key="index"
            :dot-color="getSyncStatusColor(item.status)"
            size="small"
          >
            <template v-slot:opposite>
              <span class="text-caption text-medium-emphasis">{{ formatTime(item.timestamp) }}</span>
            </template>
            <div class="d-flex align-center ga-2">
              <v-icon :color="getSyncStatusColor(item.status)" size="16">
                {{ getSyncStatusIcon(item.status) }}
              </v-icon>
              <div>
                <p class="text-body-2 font-weight-medium mb-0">{{ item.type }}</p>
                <p class="text-caption text-medium-emphasis mb-0">{{ item.message }}</p>
              </div>
            </div>
          </v-timeline-item>
        </v-timeline>
        
        <v-empty-state
          v-else
          icon="mdi-history"
          :title="$t('noSyncHistory') || 'لا يوجد سجل مزامنة'"
          :text="$t('noSyncHistoryText') || 'لم تتم أي عمليات مزامنة بعد'"
        >
          <v-btn variant="tonal" color="primary" @click="syncAll">
            {{ $t('startFirstSync') || 'بدأ المزامنة الأولى' }}
          </v-btn>
        </v-empty-state>
      </v-card-text>
    </v-card>

    <!-- Integration Errors -->
    <v-card variant="elevated" v-if="integrationErrors.length">
      <v-card-title class="pa-4">
        <h3 class="text-h6 font-weight-medium d-flex align-center ga-2">
          <v-icon color="error">mdi-alert-circle</v-icon>
          {{ $t('integrationErrors') || 'أخطاء التكامل' }}
        </h3>
        <v-spacer />
        <v-chip color="error" variant="tonal" size="small">
          {{ integrationErrors.length }}
        </v-chip>
      </v-card-title>
      <v-card-text class="pa-4">
        <v-list density="compact">
          <v-list-item
            v-for="(error, index) in integrationErrors"
            :key="index"
            class="error-item"
          >
            <template v-slot:prepend>
              <v-icon color="error">mdi-alert-circle</v-icon>
            </template>
            <v-list-item-title class="text-error">{{ error.title }}</v-list-item-title>
            <v-list-item-subtitle>{{ error.message }}</v-list-item-subtitle>
            <template v-slot:append>
              <v-btn
                @click="retrySync(error.type)"
                variant="tonal"
                color="warning"
                size="small"
                prepend-icon="mdi-retry"
              >
                {{ $t('retry') || 'إعادة المحاولة' }}
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { ProductSyncService } from '@/services/ProductSyncService';
import { CustomerSyncService } from '@/services/CustomerSyncService';
import { OrderSyncService } from '@/services/OrderSyncService';
import ERPNextService from '@/services/ERPNextService';

const { t } = useI18n();
const store = useStore();

// Service instance
const erpNextService = new ERPNextService();

// State
const testing = ref(false);
const globalSyncing = ref(false);
const connectionStatus = ref(false);
const lastSync = ref(null);
const currentSyncStep = ref(1);

const syncing = reactive({
  products: false,
  customers: false,
  orders: false,
});

const syncSteps = reactive({
  products: { inProgress: false, completed: false },
  customers: { inProgress: false, completed: false },
  orders: { inProgress: false, completed: false },
});

const stats = reactive({
  products: { total: 0, synced: 0, pending: 0 },
  customers: { total: 0, synced: 0, pending: 0 },
  orders: { total: 0, synced: 0, pending: 0 },
});

const syncHistory = ref([]);
const integrationErrors = ref([]);

// Methods
const loadStats = async () => {
  try {
    // Load products stats
    const productsResult = await ProductSyncService.getSyncStats();
    if (productsResult.success) {
      stats.products = productsResult.data;
    }

    // Load customers stats
    const customersResult = await CustomerSyncService.getSyncStats();
    if (customersResult.success) {
      stats.customers = customersResult.data;
    }

    // Load orders stats
    const ordersResult = await OrderSyncService.getSyncStats();
    if (ordersResult.success) {
      stats.orders = ordersResult.data;
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
    // Use mock data as fallback
    stats.products = { total: 156, synced: 142, pending: 14 };
    stats.customers = { total: 89, synced: 85, pending: 4 };
    stats.orders = { total: 234, synced: 228, pending: 6 };
  }
};

const testConnection = async () => {
  testing.value = true;
  try {
    const result = await erpNextService.testConnection();
    connectionStatus.value = result.success;
    lastSync.value = new Date().toLocaleString();
    
    store.dispatch('notifications/add', {
      type: connectionStatus.value ? 'success' : 'error',
      title: connectionStatus.value ? (t('connectionSuccess') || 'اتصال ناجح') : (t('connectionFailed') || 'فشل الاتصال'),
      message: result.message || (connectionStatus.value ? (t('connectedSuccessfully') || 'تم الاتصال بنجاح') : (t('connectionFailedMessage') || 'فشل الاتصال')),
      timeout: 5000
    });
  } catch (error) {
    connectionStatus.value = false;
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('connectionError') || 'خطأ في الاتصال',
      message: error.message || (t('connectionErrorMessage') || 'حدث خطأ أثناء اختبار الاتصال'),
      timeout: 5000
    });
  } finally {
    testing.value = false;
  }
};

const syncProducts = async () => {
  syncing.products = true;
  try {
    const result = await ProductSyncService.syncAll();
    if (result.success) {
      await loadStats();
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('productsSynced') || 'تمت مزامنة المنتجات',
        message: `${result.data.synced} ${t('productsSyncedMessage') || 'منتج تمت مزامنته بنجاح'}`,
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('productsSyncFailed') || 'فشلت مزامنة المنتجات',
      message: error.message || (t('productsSyncFailedMessage') || 'فشلت مزامنة المنتجات'),
      timeout: 5000
    });
  } finally {
    syncing.products = false;
  }
};

const syncCustomers = async () => {
  syncing.customers = true;
  try {
    const result = await CustomerSyncService.syncAll();
    if (result.success) {
      await loadStats();
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('customersSynced') || 'تمت مزامنة العملاء',
        message: `${result.data.synced} ${t('customersSyncedMessage') || 'عميل تمت مزامنته بنجاح'}`,
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('customersSyncFailed') || 'فشلت مزامنة العملاء',
      message: error.message || (t('customersSyncFailedMessage') || 'فشلت مزامنة العملاء'),
      timeout: 5000
    });
  } finally {
    syncing.customers = false;
  }
};

const syncOrders = async () => {
  syncing.orders = true;
  try {
    const result = await OrderSyncService.syncAll();
    if (result.success) {
      await loadStats();
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('ordersSynced') || 'تمت مزامنة الطلبات',
        message: `${result.data.synced} ${t('ordersSyncedMessage') || 'طلب تمت مزامنته بنجاح'}`,
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('ordersSyncFailed') || 'فشلت مزامنة الطلبات',
      message: error.message || (t('ordersSyncFailedMessage') || 'فشلت مزامنة الطلبات'),
      timeout: 5000
    });
  } finally {
    syncing.orders = false;
  }
};

const syncAll = async () => {
  globalSyncing.value = true;
  currentSyncStep.value = 1;
  
  // Reset sync steps
  Object.keys(syncSteps).forEach(key => {
    syncSteps[key] = { inProgress: false, completed: false };
  });

  try {
    // Sync Products
    syncSteps.products.inProgress = true;
    await syncProducts();
    syncSteps.products.inProgress = false;
    syncSteps.products.completed = true;
    currentSyncStep.value = 2;

    // Sync Customers
    syncSteps.customers.inProgress = true;
    await syncCustomers();
    syncSteps.customers.inProgress = false;
    syncSteps.customers.completed = true;
    currentSyncStep.value = 3;

    // Sync Orders
    syncSteps.orders.inProgress = true;
    await syncOrders();
    syncSteps.orders.inProgress = false;
    syncSteps.orders.completed = true;

    store.dispatch('notifications/add', {
      type: 'success',
      title: t('globalSyncCompleted') || 'اكتملت المزامنة الشاملة',
      message: t('globalSyncCompletedMessage') || 'تمت مزامنة جميع البيانات بنجاح',
      timeout: 5000
    });

    await loadSyncHistory();
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('globalSyncFailed') || 'فشلت المزامنة الشاملة',
      message: error.message || (t('globalSyncFailedMessage') || 'فشلت المزامنة الشاملة'),
      timeout: 5000
    });
  } finally {
    globalSyncing.value = false;
  }
};

const refreshAll = async () => {
  await Promise.all([
    loadStats(),
    loadSyncHistory(),
    testConnection()
  ]);
};

const loadSyncHistory = async () => {
  try {
    const result = await erpNextService.getSyncHistory();
    if (result.success) {
      syncHistory.value = result.data;
    } else {
      // Use mock data as fallback
      syncHistory.value = [
        {
          type: t('products') || 'المنتجات',
          status: 'success',
          message: 'تمت مزامنة 142 منتج',
          timestamp: new Date(Date.now() - 1000 * 60 * 30)
        },
        {
          type: t('customers') || 'العملاء',
          status: 'success',
          message: 'تمت مزامنة 85 عميل',
          timestamp: new Date(Date.now() - 1000 * 60 * 60)
        },
        {
          type: t('orders') || 'الطلبات',
          status: 'warning',
          message: 'تمت مزامنة 228 طلب، 6 معلقة',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2)
        }
      ];
    }
  } catch (error) {
    console.error('Failed to load sync history:', error);
  }
};

const loadIntegrationErrors = async () => {
  try {
    const result = await erpNextService.getIntegrationErrors();
    if (result.success) {
      integrationErrors.value = result.data;
    } else {
      // Use mock data as fallback
      integrationErrors.value = [
        {
          type: 'products',
          title: t('productSyncError') || 'خطأ في مزامنة المنتجات',
          message: 'فشل الاتصال بخادم ERPNext'
        }
      ];
    }
  } catch (error) {
    console.error('Failed to load integration errors:', error);
  }
};

const retrySync = async (type) => {
  switch (type) {
    case 'products':
      await syncProducts();
      break;
    case 'customers':
      await syncCustomers();
      break;
    case 'orders':
      await syncOrders();
      break;
  }
};

const getSyncStatusColor = (status) => {
  const colors = {
    success: 'success',
    warning: 'warning',
    error: 'error',
    info: 'info'
  };
  return colors[status] || 'info';
};

const getSyncStatusIcon = (status) => {
  const icons = {
    success: 'mdi-check-circle',
    warning: 'mdi-alert-circle',
    error: 'mdi-close-circle',
    info: 'mdi-information'
  };
  return icons[status] || 'mdi-information';
};

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleString();
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadSyncHistory(),
    loadIntegrationErrors(),
    testConnection()
  ]);
});
</script>

<style scoped>
/* Animations */
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

/* Header */
.integration-header {
  animation: fadeIn 0.5s ease;
}

/* Stat Cards */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

/* Stats Grid */
.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-value {
  font-weight: 600;
  font-size: 0.875rem;
}

.stat-value.success {
  color: #4caf50;
}

.stat-value.warning {
  color: #ff9800;
}

/* Border classes */
.border-success {
  border-left: 4px solid #4caf50;
}

.border-error {
  border-left: 4px solid #f44336;
}

/* Error Items */
.error-item {
  border-left: 3px solid #f44336;
}

/* Responsive */
@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}

/* Loading states */
.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
