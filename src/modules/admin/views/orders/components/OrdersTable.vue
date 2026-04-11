<template>
  <v-card variant="elevated" class="orders-table-card">
    <v-data-table
      :headers="headers"
      :items="orders"
      :loading="loading"
      :sort-by="[{ key: sortKey, order: sortOrder }]"
      :search="searchQuery"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      class="elevation-0"
      @click:row="handleRowClick"
      @update:sort-by="handleSort"
    >
      <!-- Select All Checkbox -->
      <template #header.data-table-select>
        <v-checkbox
          :model-value="selectAll"
          @update:model-value="$emit('toggle-select-all')"
          color="primary"
          hide-details
        />
      </template>

      <!-- Row Selection Checkbox -->
      <template #item.data-table-select="{ item }">
        <v-checkbox
          :model-value="selectedOrders.includes(item.raw.id)"
          @update:model-value="$emit('toggle-select', item.raw.id)"
          @click.stop
          color="primary"
          hide-details
        />
      </template>

      <!-- Order ID Column -->
      <template #item.id="{ item }">
        <span class="order-id font-weight-bold text-primary">#{{ item.raw.id }}</span>
      </template>

      <!-- Customer Column -->
      <template #item.customer="{ item }">
        <div class="customer-info">
          <div class="customer-name font-weight-medium">{{ item.raw.customer }}</div>
          <div class="customer-email text-caption text-medium-emphasis">{{ item.raw.email }}</div>
        </div>
      </template>

      <!-- Date Column -->
      <template #item.date="{ item }">
        <div class="date-info">
          <div class="date">{{ formatDate(item.raw.date) }}</div>
          <div class="time text-caption text-medium-emphasis">{{ formatTime(item.raw.date) }}</div>
        </div>
      </template>

      <!-- Total Column -->
      <template #item.total="{ item }">
        <span class="order-total font-weight-bold">{{ formatAmount(item.raw.total) }}</span>
      </template>

      <!-- Status Column -->
      <template #item.status="{ item }">
        <v-chip
          :color="getStatusColor(item.raw.status)"
          :variant="getStatusVariant(item.raw.status)"
          size="small"
          class="font-weight-medium"
        >
          <v-icon start size="small">{{ getStatusIcon(item.raw.status) }}</v-icon>
          {{ getStatusText(item.raw.status) }}
        </v-chip>
      </template>

      <!-- Payment Method Column -->
      <template #item.paymentMethod="{ item }">
        <div class="payment-info d-flex align-center ga-2">
          <v-icon size="small" color="medium-emphasis">{{ getPaymentIcon(item.raw.paymentMethod) }}</v-icon>
          <span class="text-body-2">{{ getPaymentMethodText(item.raw.paymentMethod) }}</span>
        </div>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="action-buttons d-flex ga-1">
          <v-btn
            icon="mdi-eye"
            size="small"
            variant="text"
            color="info"
            @click.stop="$emit('view', item.raw)"
            @click:stop
          >
            <v-tooltip activator="parent" text="عرض"></v-tooltip>
          </v-btn>
          
          <v-btn
            icon="mdi-pencil"
            size="small"
            variant="text"
            color="success"
            @click.stop="$emit('edit', item.raw)"
            @click:stop
          >
            <v-tooltip activator="parent" text="تعديل"></v-tooltip>
          </v-btn>

          <v-menu
            :model-value="activeOrderMenu === item.raw.id"
            @update:model-value="$emit('toggle-menu', $event ? item.raw.id : null)"
            location="bottom end"
          >
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-dots-vertical"
                size="small"
                variant="text"
                color="medium-emphasis"
                @click.stop
              />
            </template>
            
            <v-list density="compact" min-width="160">
              <v-list-item
                @click="$emit('update-status', item.raw, 'processing')"
                prepend-icon="mdi-cogs"
                title="تجهيز الطلب"
              />
              <v-list-item
                @click="$emit('update-status', item.raw, 'shipped')"
                prepend-icon="mdi-truck"
                title="تم الشحن"
              />
              <v-list-item
                @click="$emit('update-status', item.raw, 'delivered')"
                prepend-icon="mdi-check-circle"
                title="تم التوصيل"
              />
              <v-divider />
              <v-list-item
                @click="$emit('update-status', item.raw, 'cancelled')"
                prepend-icon="mdi-cancel"
                title="إلغاء الطلب"
                class="text-error"
              />
            </v-list>
          </v-menu>
        </div>
      </template>

      <!-- No Data Template -->
      <template #no-data>
        <div class="pa-8 text-center">
          <v-icon size="64" color="medium-emphasis" class="mb-4">mdi-shopping-basket-outline</v-icon>
          <div class="text-h6 font-weight-medium mb-2">لا توجد طلبات</div>
          <div class="text-body-2 text-medium-emphasis mb-4">لم يتم العثور على أي طلبات حالياً</div>
          <v-btn
            variant="elevated"
            color="primary"
            prepend-icon="mdi-plus"
            @click="$emit('create-order')"
          >
            إنشاء طلب جديد
          </v-btn>
        </div>
      </template>

      <!-- Loading Template -->
      <template #loading>
        <div class="pa-8 text-center">
          <v-progress-circular indeterminate size="48" color="primary" class="mb-4" />
          <div class="text-body-2 text-medium-emphasis">جاري تحميل الطلبات...</div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { formatDate, formatTime } from '@/integration/utils/helpers';
import CurrencyService from '@/integration/services/CurrencyService';
import OrdersService from '@/services/OrdersService';

// Props
const props = defineProps({
  orders: { type: Array, required: true },
  columns: { type: Array, required: true },
  selectedOrders: { type: Array, required: true },
  selectAll: { type: Boolean, default: false },
  sortKey: { type: String, default: 'id' },
  sortOrder: { type: String, default: 'desc' },
  activeOrderMenu: { type: [String, Number], default: null },
  loading: { type: Boolean, default: false },
  searchQuery: { type: String, default: '' },
  itemsPerPage: { type: Number, default: 25 },
  itemsPerPageOptions: { type: Array, default: () => [10, 25, 50, 100] },
});

// Emits
const emit = defineEmits([
  'sort',
  'view',
  'edit',
  'toggle-select',
  'toggle-select-all',
  'toggle-menu',
  'update-status',
  'create-order',
]);

// Vue composition API
const store = useStore();
const { t } = useI18n();
const ordersService = OrdersService;

// Computed headers from columns
const headers = computed(() => {
  const baseHeaders = [
    { title: '', key: 'data-table-select', sortable: false, width: '48px' },
  ];
  
  const columnHeaders = props.columns.map(col => ({
    title: col.label,
    key: col.key,
    sortable: ['id', 'date', 'total'].includes(col.key),
  }));
  
  baseHeaders.push(...columnHeaders);
  baseHeaders.push({
    title: 'الإجراءات',
    key: 'actions',
    sortable: false,
    width: '120px',
    align: 'center'
  });
  
  return baseHeaders;
});

// Format amount with currency
const formatAmount = (amount) => CurrencyService.formatAmount(amount);

// Status text mapping
const getStatusText = (status) => {
  const map = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي',
    refunded: 'مسترجع',
  };
  return map[status] || status;
};

// Status color mapping
const getStatusColor = (status) => {
  const map = {
    pending: 'warning',
    processing: 'info',
    shipped: 'purple',
    delivered: 'success',
    cancelled: 'error',
    refunded: 'grey',
  };
  return map[status] || 'grey';
};

// Status variant mapping
const getStatusVariant = (status) => {
  const map = {
    pending: 'tonal',
    processing: 'tonal',
    shipped: 'tonal',
    delivered: 'tonal',
    cancelled: 'tonal',
    refunded: 'tonal',
  };
  return map[status] || 'tonal';
};

// Status icon mapping
const getStatusIcon = (status) => {
  const map = {
    pending: 'mdi-clock-outline',
    processing: 'mdi-cogs',
    shipped: 'mdi-truck',
    delivered: 'mdi-check-circle',
    cancelled: 'mdi-cancel',
    refunded: 'mdi-refresh',
  };
  return map[status] || 'mdi-help-circle';
};

// Payment method text mapping
const getPaymentMethodText = (method) => {
  const map = {
    cash: 'الدفع عند الاستلام',
    card: 'بطاقة ائتمان',
    bank: 'تحويل بنكي',
    wallet: 'محفظة إلكترونية',
  };
  return map[method] || method;
};

// Payment icon mapping (MDI icons)
const getPaymentIcon = (method) => {
  const map = {
    cash: 'mdi-cash',
    card: 'mdi-credit-card',
    bank: 'mdi-bank',
    wallet: 'mdi-wallet',
  };
  return map[method] || 'mdi-cash';
};

// Handle row click
const handleRowClick = (event, { item }) => {
  emit('view', item.raw);
};

// Handle sort change
const handleSort = (sortBy) => {
  if (sortBy && sortBy.length > 0) {
    const { key, order } = sortBy[0];
    emit('sort', key, order);
  }
};

// Show notification helper
const showNotification = (message, type = 'info') => {
  store.dispatch('notifications/showNotification', {
    message,
    type,
    duration: 3000,
  });
};
</script>

<style scoped>
.orders-table-card {
  border-radius: 16px;
  overflow: hidden;
}

/* Customer info styling */
.customer-info {
  line-height: 1.4;
}

.customer-name {
  font-weight: 600;
  color: rgb(26, 26, 46);
}

.customer-email {
  font-size: 12px;
  color: rgb(108, 117, 125);
}

/* Date info styling */
.date-info {
  line-height: 1.4;
}

.time {
  font-size: 12px;
  color: rgb(108, 117, 125);
}

/* Order ID styling */
.order-id {
  color: rgb(212, 175, 55);
  font-weight: 700;
}

/* Order total styling */
.order-total {
  color: rgb(26, 26, 46);
  font-weight: 700;
}

/* Payment info styling */
.payment-info {
  font-size: 13px;
  color: rgb(68, 68, 68);
}

/* Action buttons styling */
.action-buttons {
  justify-content: center;
}

/* Vuetify data table customizations */
:deep(.v-data-table) {
  border-radius: 0;
}

:deep(.v-data-table__tr) {
  cursor: pointer;
}

:deep(.v-data-table__tr:hover) {
  background-color: rgba(0, 0, 0, 0.02);
}

:deep(.v-data-table-header__content) {
  font-weight: 700;
  font-size: 14px;
  color: rgb(26, 26, 46);
}

:deep(.v-data-table-header__sort-badge) {
  display: none;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}

/* Animation for status changes */
.v-chip {
  transition: all 0.3s ease;
}

.v-chip:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Custom scrollbar for mobile */
@media (max-width: 600px) {
  :deep(.v-data-table__wrapper) {
    overflow-x: auto;
  }
}
</style>
