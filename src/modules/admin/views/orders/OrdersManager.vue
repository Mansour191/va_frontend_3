<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-4">
        <div class="d-flex align-center justify-space-between">
          <div>
            <h1 class="text-h4 font-weight-bold mb-2">إدارة الطلبات</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">متابعة ومعالجة طلبات العملاء والمبيعات</p>
          </div>
          <div class="d-flex ga-2">
            <v-btn
              @click="exportOrders"
              variant="tonal"
              prepend-icon="mdi-file-export"
            >
              تصدير
            </v-btn>
            <v-btn
              @click="openNewOrderModal"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              طلب جديد
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Stats -->
    <v-row class="mb-6">
      <v-col cols="12" md="3">
        <v-card variant="tonal" color="primary">
          <v-card-text class="pa-4 text-center">
            <v-icon size="32" color="primary" class="mb-2">mdi-shopping-basket</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.totalOrders }}</div>
            <div class="text-caption text-medium-emphasis">إجمالي الطلبات</div>
            <v-chip size="small" :color="stats.totalOrdersTrend > 0 ? 'success' : 'error'" class="mt-2">
              {{ stats.totalOrdersTrend > 0 ? '+' : '' }}{{ stats.totalOrdersTrend }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="tonal" color="info">
          <v-card-text class="pa-4 text-center">
            <v-icon size="32" color="info" class="mb-2">mdi-calendar-day</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.todayOrders }}</div>
            <div class="text-caption text-medium-emphasis">طلبات اليوم</div>
            <v-chip size="small" :color="stats.todayOrdersTrend > 0 ? 'success' : 'error'" class="mt-2">
              {{ stats.todayOrdersTrend > 0 ? '+' : '' }}{{ stats.todayOrdersTrend }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="tonal" color="warning">
          <v-card-text class="pa-4 text-center">
            <v-icon size="32" color="warning" class="mb-2">mdi-cogs</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.processingOrders }}</div>
            <div class="text-caption text-medium-emphasis">قيد المعالجة</div>
            <v-chip size="small" :color="stats.processingOrdersTrend > 0 ? 'success' : 'error'" class="mt-2">
              {{ stats.processingOrdersTrend > 0 ? '+' : '' }}{{ stats.processingOrdersTrend }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="3">
        <v-card variant="tonal" color="success">
          <v-card-text class="pa-4 text-center">
            <v-icon size="32" color="success" class="mb-2">mdi-check-double</v-icon>
            <div class="text-h4 font-weight-bold">{{ stats.deliveredOrders }}</div>
            <div class="text-caption text-medium-emphasis">تم التوصيل</div>
            <v-chip size="small" :color="stats.deliveredOrdersTrend > 0 ? 'success' : 'error'" class="mt-2">
              {{ stats.deliveredOrdersTrend > 0 ? '+' : '' }}{{ stats.deliveredOrdersTrend }}%
            </v-chip>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Filters -->
    <v-card variant="elevated" class="mb-6">
      <v-card-title class="pa-4">
        <v-icon color="primary" class="me-2">mdi-filter</v-icon>
        البحث والتصفية
      </v-card-title>
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="البحث عن طلب"
              placeholder="رقم الطلب، اسم العميل، أو البريد الإلكتروني..."
              prepend-inner-icon="mdi-magnify"
              clearable
              @click:clear="clearSearch"
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="statusFilter"
              label="الحالة"
              :items="statusOptions"
              item-title="text"
              item-value="value"
              clearable
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-select
              v-model="paymentFilter"
              label="طريقة الدفع"
              :items="paymentOptions"
              item-title="text"
              item-value="value"
              clearable
              variant="outlined"
              density="compact"
            />
          </v-col>
          <v-col cols="12" md="2">
            <v-btn
              @click="resetFilters"
              variant="tonal"
              prepend-icon="mdi-refresh"
              block
            >
              إعادة تعيين
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Orders Table -->
    <v-card variant="elevated" class="mb-6">
      <v-card-text class="pa-0">
        <v-data-table
          :headers="tableHeaders"
          :items="paginatedOrders"
          :loading="loading"
          :sort-by="sortKey"
          :sort-desc="sortOrder === 'desc'"
          @update:sort-by="handleSort"
          show-select
          v-model="selectedOrders"
          item-value="id"
          density="comfortable"
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>
          
          <template v-slot:item.paymentMethod="{ item }">
            <v-icon
              :icon="getPaymentIcon(item.paymentMethod)"
              :color="getPaymentColor(item.paymentMethod)"
              size="small"
              class="me-2"
            />
            {{ getPaymentText(item.paymentMethod) }}
          </template>
          
          <template v-slot:item.total="{ item }">
            <div class="font-weight-bold">
              {{ formatCurrency(item.total) }}
            </div>
          </template>
          
          <template v-slot:item.actions="{ item }">
            <v-btn
              @click="viewOrder(item)"
              icon="mdi-eye"
              variant="text"
              size="small"
              class="me-1"
            />
            <v-btn
              @click="editOrder(item)"
              icon="mdi-pencil"
              variant="text"
              size="small"
              class="me-1"
            />
            <v-menu>
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  variant="text"
                  size="small"
                />
              </template>
              <v-list>
                <v-list-item @click="updateOrderStatus(item, 'shipped')">
                  <template v-slot:prepend>
                    <v-icon>mdi-truck</v-icon>
                  </template>
                  تم الشحن
                </v-list-item>
                <v-list-item @click="sendInvoice(item)">
                  <template v-slot:prepend>
                    <v-icon>mdi-email</v-icon>
                  </template>
                  إرسال فاتورة
                </v-list-item>
                <v-list-item @click="printOrder(item)">
                  <template v-slot:prepend>
                    <v-icon>mdi-printer</v-icon>
                  </template>
                  طباعة
                </v-list-item>
              </v-list>
            </v-menu>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Pagination -->
    <v-card variant="tonal">
      <v-card-text class="pa-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :items-per-page="itemsPerPage"
          :total-visible="7"
          @update:model-value="handlePageChange"
        />
      </v-card-text>
    </v-card>

    <!-- Order Details Modal -->
    <v-dialog v-model="showOrderModal" max-width="800">
      <v-card>
        <v-card-title class="pa-4">
          <div class="d-flex align-center">
            <v-icon color="primary" class="me-2">mdi-receipt</v-icon>
            تفاصيل الطلب
          </div>
          <v-spacer />
          <v-btn
            @click="closeOrderModal"
            icon="mdi-close"
            variant="text"
          />
        </v-card-title>
        
        <v-card-text v-if="selectedOrder" class="pa-4">
          <v-row>
            <v-col cols="12" md="6">
              <v-card variant="tonal" class="mb-4">
                <v-card-title class="text-subtitle-1">معلومات العميل</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <strong>الاسم:</strong> {{ selectedOrder.customer }}
                  </div>
                  <div class="mb-2">
                    <strong>البريد:</strong> {{ selectedOrder.email }}
                  </div>
                  <div class="mb-2">
                    <strong>الهاتف:</strong> {{ selectedOrder.phone }}
                  </div>
                  <div>
                    <strong>العنوان:</strong><br>
                    {{ selectedOrder.shippingAddress?.street }}<br>
                    {{ selectedOrder.shippingAddress?.city }}, {{ selectedOrder.shippingAddress?.country }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-card variant="tonal" class="mb-4">
                <v-card-title class="text-subtitle-1">معلومات الطلب</v-card-title>
                <v-card-text>
                  <div class="mb-2">
                    <strong>رقم الطلب:</strong> {{ selectedOrder.id }}
                  </div>
                  <div class="mb-2">
                    <strong>التاريخ:</strong> {{ formatDate(selectedOrder.date) }}
                  </div>
                  <div class="mb-2">
                    <strong>الحالة:</strong>
                    <v-chip
                      :color="getStatusColor(selectedOrder.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ getStatusText(selectedOrder.status) }}
                    </v-chip>
                  </div>
                  <div class="mb-2">
                    <strong>طريقة الدفع:</strong>
                    <v-icon
                      :icon="getPaymentIcon(selectedOrder.paymentMethod)"
                      :color="getPaymentColor(selectedOrder.paymentMethod)"
                      size="small"
                      class="me-2"
                    />
                    {{ getPaymentText(selectedOrder.paymentMethod) }}
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
          
          <v-divider class="my-4" />
          
          <!-- Order Items for Production -->
          <v-card variant="tonal">
            <v-card-title class="text-subtitle-1 mb-4">
              <v-icon color="warning" class="me-2">mdi-hammer-wrench</v-icon>
              تفاصيل الإنتاج (الخامات المطلوبة)
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="productionHeaders"
                :items="selectedOrder.items || []"
                class="production-table"
                hide-default-footer
                disable-pagination
                density="compact"
              >
                <template v-slot:item.product="{ item }">
                  <div class="product-info">
                    <div class="product-image" v-if="item.product?.images?.length">
                      <img :src="item.product.images[0].imageUrl" :alt="item.product.nameAr" />
                    </div>
                    <div class="product-details">
                      <div class="product-name">{{ item.product?.nameAr }}</div>
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
                    <div class="material-properties" v-if="item.material?.properties">
                      <v-icon size="x-small" class="me-1">mdi-information</v-icon>
                      {{ getMaterialProperties(item.material.properties) }}
                    </div>
                  </div>
                </template>

                <template v-slot:item.specifications="{ item }">
                  <div class="specifications">
                    <div class="spec-item" v-if="item.quantity">
                      <v-icon size="x-small" class="me-1">mdi-ruler</v-icon>
                      الكمية: {{ item.quantity }}
                      <span v-if="item.variant?.attributes?.unit">{{ item.variant.attributes.unit }}</span>
                    </div>
                    <div class="spec-item" v-if="item.variant?.attributes">
                      <v-icon size="x-small" class="me-1">mdi-cog</v-icon>
                      {{ getVariantAttributes(item.variant.attributes) }}
                    </div>
                    <div class="spec-item" v-if="item.customAttributes">
                      <v-icon size="x-small" class="me-1">mdi-pencil</v-icon>
                      {{ getCustomAttributes(item.customAttributes) }}
                    </div>
                  </div>
                </template>

                <template v-slot:item.pricing="{ item }">
                  <div class="pricing-info">
                    <div class="unit-price">{{ formatCurrency(item.price) }}</div>
                    <div class="total-price">{{ formatCurrency(item.totalPrice) }}</div>
                  </div>
                </template>

                <template v-slot:item.status="{ item }">
                  <div class="production-status">
                    <v-chip
                      :color="getProductionStatusColor(item)"
                      size="small"
                      variant="flat"
                    >
                      {{ getProductionStatusText(item) }}
                    </v-chip>
                    <div class="production-notes" v-if="item.notes">
                      <v-icon size="x-small" class="me-1">mdi-note-text</v-icon>
                      {{ item.notes }}
                    </div>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
          
          <!-- Order Summary -->
          <v-row class="mt-4">
            <v-col cols="12" md="6" offset-md="6">
              <v-card variant="tonal" color="primary">
                <v-card-title class="text-subtitle-1">ملخص الطلب</v-card-title>
                <v-card-text>
                  <div class="d-flex justify-space-between mb-2">
                    <span>الإجمالي الفرعي:</span>
                    <span>{{ formatCurrency(selectedOrder.subtotal) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>الشحن:</span>
                    <span>{{ formatCurrency(selectedOrder.shipping || 0) }}</span>
                  </div>
                  <div class="d-flex justify-space-between mb-2">
                    <span>الضريبة:</span>
                    <span>{{ formatCurrency(selectedOrder.tax || 0) }}</span>
                  </div>
                  <v-divider class="my-2" />
                  <div class="d-flex justify-space-between">
                    <strong class="text-h6">الإجمالي:</strong>
                    <strong class="text-h6 text-primary">{{ formatCurrency(selectedOrder.total) }}</strong>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
        
        <!-- Order History Section -->
        <v-card variant="tonal" v-if="selectedOrder">
          <v-card-title class="text-subtitle-1 mb-4">
            <v-icon color="info" class="me-2">mdi-history</v-icon>
            تاريخ الطلب (سجل التغييرات)
          </v-card-title>
          <v-card-text>
            <div class="history-section">
              <div class="history-header">
                <div class="history-info">
                  <span class="history-count">سجل {{ selectedOrder.timeline?.length || 0 }} تحديث</span>
                  <v-btn
                    @click="fetchOrderTimeline(selectedOrder.id)"
                    :loading="timelineLoading"
                    variant="text"
                    size="small"
                    prepend-icon="mdi-refresh"
                  >
                    تحديث السجل
                  </v-btn>
                </div>
              </div>
              
              <v-timeline density="compact" align="start" v-if="selectedOrder.timeline?.length > 0">
                <v-timeline-item
                  v-for="timelineEntry in selectedOrder.timeline"
                  :key="timelineEntry.id"
                  :dot-color="getTimelineColor(timelineEntry.status)"
                  size="small"
                  :icon="getTimelineIcon(timelineEntry.status)"
                >
                  <template v-slot:opposite>
                    <div class="history-date">
                      {{ formatFullDate(timelineEntry.createdAt) }}
                    </div>
                    <div class="history-time">
                      {{ formatTime(timelineEntry.createdAt) }}
                    </div>
                  </template>
                  <div class="history-content">
                    <div class="history-header-info">
                      <div class="history-status">
                        <v-chip
                          :color="getTimelineColor(timelineEntry.status)"
                          size="small"
                          variant="flat"
                        >
                          <v-icon start :icon="getTimelineIcon(timelineEntry.status)"></v-icon>
                          {{ getStatusText(timelineEntry.status) }}
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
                      <div class="history-user-info">
                        <span v-if="timelineEntry.createdBy" class="history-user">
                          <v-icon size="x-small" class="me-1">mdi-account</v-icon>
                          {{ getUserName(timelineEntry.createdBy) }}
                        </span>
                      </div>
                    </div>
                    <div class="history-note" v-if="timelineEntry.note">
                      <v-icon size="small" class="me-1">mdi-note-text"></v-icon>
                      {{ timelineEntry.note }}
                    </div>
                    <div class="history-actions" v-if="canAddTimelineEntry && !timelineEntry.isAutomatic">
                      <v-btn
                        size="x-small"
                        variant="text"
                        prepend-icon="mdi-comment-plus"
                        @click="addTimelineNote(timelineEntry)"
                      >
                        إضافة ملاحظة
                      </v-btn>
                    </div>
                  </div>
                </v-timeline-item>
              </v-timeline>
              
              <div v-else class="no-history">
                <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
                <p class="mt-3 text-medium-emphasis">لا يوجد سجل تغييرات لهذا الطلب</p>
              </div>
            </div>
          </v-card-text>
        </v-card>
        
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="closeOrderModal" variant="tonal">إغلاق</v-btn>
          <v-btn @click="printOrder(selectedOrder)" color="primary" prepend-icon="mdi-printer">
            طباعة
          </v-btn>
          <v-btn @click="sendInvoice(selectedOrder)" color="success" prepend-icon="mdi-email">
            إرسال فاتورة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { debounce } from 'lodash';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { useOrders } from '@/composables/useOrders';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { ORDER_TIMELINE_QUERY, ADD_TIMELINE_STEP_MUTATION } from '@/integration/graphql/orders.graphql';

// Composables
const { 
  allOrders, 
  loading, 
  error,
  fetchAllOrders,
  getOrderStatusInfo,
  getPaymentMethodInfo,
  canUpdateStatus,
  formatOrderNumber,
  formatPrice,
  formatDate,
  updateOrderStatus,
  updateTrackingNumber,
  fetchOrderStats,
  searchOrders
} = useOrders();

const store = useStore();
const { t } = useI18n();

// State
const searchQuery = ref('');
const statusFilter = ref('');
const paymentFilter = ref('');
const sortKey = ref('date');
const sortOrder = ref('desc');
const currentPage = ref(1);
const itemsPerPage = ref(10);
const selectedOrders = ref([]);
const showOrderModal = ref(false);
const selectedOrder = ref(null);
const updatingStatus = ref(false);
const updatingTracking = ref(false);
const timelineLoading = ref(false);
const canAddTimelineEntry = ref(true);

// Stats - will be loaded from API
const stats = ref({
  totalOrders: 0,
  totalOrdersTrend: 0,
  todayOrders: 0,
  todayOrdersTrend: 0,
  processingOrders: 0,
  processingOrdersTrend: 0,
  deliveredOrders: 0,
  deliveredOrdersTrend: 0
});

// Options
const statusOptions = [
  { text: t('allStatuses') || 'جميع الحالات', value: '' },
  { text: t('pending') || 'قيد الانتظار', value: 'pending' },
  { text: t('confirmed') || 'مؤكد', value: 'confirmed' },
  { text: t('processing') || 'قيد المعالجة', value: 'processing' },
  { text: t('shipped') || 'تم الشحن', value: 'shipped' },
  { text: t('delivered') || 'تم التوصيل', value: 'delivered' },
  { text: t('cancelled') || 'ملغي', value: 'cancelled' }
];

const paymentOptions = [
  { text: t('allPaymentMethods') || 'جميع طرق الدفع', value: '' },
  { text: t('cashOnDelivery') || 'الدفع عند الاستلام', value: 'cod' },
  { text: t('creditCard') || 'بطاقة بنكية', value: 'card' },
  { text: t('ccp') || 'CCP', value: 'ccp' }
];

// Table Headers
const tableHeaders = [
  { title: 'رقم الطلب', key: 'id', sortable: true },
  { title: 'العميل', key: 'customer', sortable: true },
  { title: 'التاريخ', key: 'date', sortable: true },
  { title: 'الإجمالي', key: 'total', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الدفع', key: 'paymentMethod', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false }
];

// Production Table Headers
const productionHeaders = [
  { title: 'المنتج', key: 'product', sortable: false },
  { title: 'نوع الخامة', key: 'material', sortable: false },
  { title: 'المواصفات', key: 'specifications', sortable: false },
  { title: 'السعر', key: 'pricing', sortable: false },
  { title: 'الحالة', key: 'status', sortable: false }
];

// Computed
const filteredOrders = computed(() => {
  let orders = allOrders.value;
  
  // Apply filters
  if (statusFilter.value) {
    orders = orders.filter(order => order.status === statusFilter.value);
  }
  
  if (paymentFilter.value) {
    orders = orders.filter(order => order.paymentMethod === paymentFilter.value);
  }
  
  // Apply search
  if (searchQuery.value) {
    orders = searchOrders(orders, searchQuery.value);
  }
  
  return orders;
});

const sortedOrders = computed(() => {
  const sorted = [...filteredOrders.value];
  sorted.sort((a, b) => {
    let aVal = a[sortKey.value];
    let bVal = b[sortKey.value];
    
    if (sortKey.value === 'totalAmount') return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal;
    if (sortKey.value === 'createdAt') return sortOrder.value === 'asc' ? new Date(aVal) - new Date(bVal) : new Date(bVal) - new Date(aVal);
    
    aVal = String(aVal).toLowerCase();
    bVal = String(bVal).toLowerCase();
    return sortOrder.value === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });
  return sorted;
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  return sortedOrders.value.slice(start, start + itemsPerPage.value);
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / itemsPerPage.value);
});

// Methods
const handleSort = (column) => {
  if (sortKey.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = column;
    sortOrder.value = 'asc';
  }
};

const handlePageChange = (page) => {
  currentPage.value = page;
};

const clearSearch = () => {
  searchQuery.value = '';
  currentPage.value = 1;
};

const resetFilters = () => {
  searchQuery.value = '';
  statusFilter.value = '';
  paymentFilter.value = '';
  currentPage.value = 1;
};

const viewOrder = async (order) => {
  selectedOrder.value = { ...order };
  showOrderModal.value = true;
  
  // Fetch timeline data for the selected order
  await fetchOrderTimeline(order.id);
};

const closeOrderModal = () => {
  showOrderModal.value = false;
  selectedOrder.value = null;
};

const editOrder = (order) => {
  console.log('Edit order:', order);
};

const handleUpdateOrderStatus = async (order, status) => {
  if (!canUpdateStatus(order)) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('cannotUpdateStatus') || 'لا يمكن تحديث حالة هذا الطلب',
      timeout: 3000
    });
    return;
  }

  updatingStatus.value = true;
  try {
    const result = await updateOrderStatus(order.id, status, `تم تحديث الحالة إلى ${getOrderStatusInfo(status).text}`);
    if (result.success) {
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('statusUpdated') || 'تم تحديث الحالة',
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
    updatingStatus.value = false;
  }
};

const handleUpdateTracking = async (order, trackingNumber) => {
  if (!trackingNumber) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('trackingNumberRequired') || 'رقم التتبع مطلوب',
      timeout: 3000
    });
    return;
  }

  updatingTracking.value = true;
  try {
    const result = await updateTrackingNumber(order.id, trackingNumber);
    if (result.success) {
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('trackingUpdated') || 'تم تحديث رقم التتبع',
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
    updatingTracking.value = false;
  }
};

const printOrder = (order) => {
  window.print();
};

const sendInvoice = async (order) => {
  try {
    // Import OrdersService dynamically
    const { default: OrdersService } = await import('./OrdersService.js');
    
    // Send invoice via API
    const response = await OrdersService.sendInvoice(order.id, {
      email: order.email,
      customerName: order.customer
    });
    
    if (response.success) {
      console.log('Invoice sent successfully:', response.message);
      // Show success notification
      // TODO: Add notification system
    } else {
      console.error('Failed to send invoice:', response.error);
      // Show error notification
      // TODO: Add notification system
    }
  } catch (error) {
    console.error('Error sending invoice:', error);
    // Show error notification
    // TODO: Add notification system
  }
};

const exportOrders = async () => {
  try {
    // Import OrdersService dynamically
    const { default: OrdersService } = await import('./OrdersService.js');
    
    // Export orders via API
    const response = await OrdersService.exportOrders({
      search: searchQuery.value,
      status: statusFilter.value,
      paymentMethod: paymentFilter.value,
      sortBy: sortKey.value,
      sortOrder: sortOrder.value
    });
    
    if (response.success) {
      console.log('Orders exported successfully:', response.message);
      // TODO: Handle file download
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } else {
      console.error('Failed to export orders:', response.error);
      // Show error notification
      // TODO: Add notification system
    }
  } catch (error) {
    console.error('Error exporting orders:', error);
    // Show error notification
    // TODO: Add notification system
  }
};

const openNewOrderModal = () => {
  console.log('Open new order modal');
};

// Helper Functions
const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };
  return colors[status] || 'grey';
};

const getStatusText = (status) => {
  const texts = {
    pending: 'قيد الانتظار',
    processing: 'قيد المعالجة',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
    cancelled: 'ملغي'
  };
  return texts[status] || status;
};

const getPaymentIcon = (method) => {
  const icons = {
    cash: 'mdi-cash',
    card: 'mdi-credit-card',
    bank: 'mdi-bank',
    electronic: 'mdi-wallet'
  };
  return icons[method] || 'mdi-help-circle';
};

const getPaymentColor = (method) => {
  const colors = {
    cash: 'success',
    card: 'primary',
    bank: 'info',
    electronic: 'warning'
  };
  return colors[method] || 'grey';
};

const getPaymentText = (method) => {
  const texts = {
    cash: 'الدفع عند الاستلام',
    card: 'بطاقة ائتمان',
    bank: 'تحويل بنكي',
    electronic: 'الدفع الإلكتروني'
  };
  return texts[method] || method;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Production Helper Methods
const getMaterialProperties = (properties) => {
  if (!properties || typeof properties !== 'object') return '';
  
  const props = [];
  if (properties.texture) props.push(`ملمس: ${properties.texture}`);
  if (properties.finish) props.push(`نهاية: ${properties.finish}`);
  if (properties.thickness) props.push(`سمك: ${properties.thickness}mm`);
  if (properties.weight) props.push(`وزن: ${properties.weight}g/m²`);
  
  return props.join(' | ');
};

const getVariantAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return '';
  
  const attrs = [];
  if (attributes.size) attrs.push(`المقاس: ${attributes.size}`);
  if (attributes.color) attrs.push(`اللون: ${attributes.color}`);
  if (attributes.dimension) attrs.push(`الأبعاد: ${attributes.dimension}`);
  if (attributes.orientation) attrs.push(`الاتجاه: ${attributes.orientation}`);
  
  return attrs.join(' | ');
};

const getCustomAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return '';
  
  const attrs = [];
  if (attributes.customText) attrs.push(`نص مخصص: ${attributes.customText}`);
  if (attributes.customDesign) attrs.push(`تصميم مخصص`);
  if (attributes.urgent) attrs.push(`طلب عاجل`);
  if (attributes.notes) attrs.push(`ملاحظات: ${attributes.notes}`);
  
  return attrs.join(' | ');
};

const getProductionStatusColor = (item) => {
  // Logic to determine production status based on order status and item properties
  const orderStatus = selectedOrder.value?.status;
  
  if (orderStatus === 'cancelled') return 'error';
  if (orderStatus === 'delivered') return 'success';
  if (orderStatus === 'shipped') return 'info';
  if (orderStatus === 'processing') return 'warning';
  if (item.material?.isPremium) return 'purple';
  
  return 'grey';
};

const getProductionStatusText = (item) => {
  const orderStatus = selectedOrder.value?.status;
  
  if (orderStatus === 'cancelled') return 'ملغي';
  if (orderStatus === 'delivered') return 'مكتمل';
  if (orderStatus === 'shipped') return 'تم الشحن';
  if (orderStatus === 'processing') return 'قيد الإنتاج';
  if (item.material?.isPremium) return 'خامة مميزة';
  
  return 'في الانتظار';
};

// Timeline Methods
const fetchOrderTimeline = async (orderId) => {
  if (!orderId) return;
  
  timelineLoading.value = true;
  try {
    const { client } = await import('@/shared/plugins/apolloPlugin');
    const { result } = await client.default.query({
      query: ORDER_TIMELINE_QUERY,
      variables: { orderId },
      fetchPolicy: 'network-only'
    });
    
    if (result.data?.orderTimeline) {
      // Update selectedOrder with timeline data
      if (selectedOrder.value) {
        selectedOrder.value.timeline = result.data.orderTimeline.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
      }
    }
  } catch (error) {
    console.error('Error fetching order timeline:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء جلب سجل الطلب'
    });
  } finally {
    timelineLoading.value = false;
  }
};

const addTimelineNote = async (timelineEntry) => {
  const note = prompt('أدخل ملاحظة:');
  if (!note) return;
  
  try {
    const { mutate } = useMutation(ADD_TIMELINE_STEP_MUTATION);
    const result = await mutate({
      variables: {
        orderId: selectedOrder.value.id,
        status: timelineEntry.status,
        note: note,
        isAutomatic: false
      }
    });
    
    if (result.data?.addTimelineStep?.success) {
      // Refresh timeline
      await fetchOrderTimeline(selectedOrder.value.id);
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'تمت إضافة الملاحظة بنجاح'
      });
    } else {
      throw new Error(result.data?.addTimelineStep?.message || 'فشل إضافة الملاحظة');
    }
  } catch (error) {
    console.error('Error adding timeline note:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء إضافة الملاحظة'
    });
  }
};

const getTimelineColor = (status) => {
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

// Load data from API
const loadOrders = async () => {
  await fetchAllOrders();
  await loadStats();
};

const loadStats = async () => {
  const statsData = await fetchOrderStats();
  if (statsData) {
    stats.value = {
      totalOrders: statsData.totalOrders || 0,
      totalOrdersTrend: 0, // Will be calculated from historical data
      todayOrders: 0, // Will be calculated from statsData
      todayOrdersTrend: 0,
      processingOrders: statsData.ordersByStatus?.find(s => s.status === 'processing')?.count || 0,
      processingOrdersTrend: 0,
      deliveredOrders: statsData.ordersByStatus?.find(s => s.status === 'delivered')?.count || 0,
      deliveredOrdersTrend: 0
    };
  }
};

const fetchAllOrders = async () => {
  loading.value = true;
  try {
    // Import OrdersService dynamically
    const { default: OrdersService } = await import('./OrdersService.js');
    
    // Load orders from API
    try {
      const ordersResponse = await OrdersService.getOrders({
        page: currentPage.value,
        limit: itemsPerPage.value,
        search: searchQuery.value,
        status: statusFilter.value,
        paymentMethod: paymentFilter.value,
        sortBy: sortKey.value,
        sortOrder: sortOrder.value
      });
      
      if (ordersResponse.success) {
        orders.value = ordersResponse.data.orders || [];
      } else {
        console.error('Failed to load orders:', ordersResponse.error);
        // Try direct API as fallback
        orders.value = await fetchOrders();
      }
    } catch (ordersError) {
      console.error('OrdersService failed:', ordersError);
      // Final fallback to direct API
      orders.value = await fetchOrders();
    }
          stats.value = await statsData.json();
        } else {
          // Fallback to calculated stats
          stats.value = calculateStatsFromOrders();
        }
      }
    } catch (statsError) {
      console.error('Stats API failed:', statsError);
      // Fallback to calculated stats
      stats.value = calculateStatsFromOrders();
    }
  } catch (error) {
    console.error('Error loading orders:', error);
    // Fallback to mock data if API fails
    orders.value = getMockOrders();
    stats.value = calculateStatsFromOrders();
  } finally {
    loading.value = false;
  }
};

// Dynamic data functions
const fetchOrders = async () => {
  try {
    const { GET_ORDERS_QUERY } = await import('@/integration/graphql/orders.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(GET_ORDERS_QUERY);
    
    if (data.value && !error.value) {
      return data.value.orders.edges.map(edge => {
        const order = edge.node;
        return {
          id: order.orderNumber || `ORD-${order.id}`,
          customer: order.customerName || 'عميل غير معروف',
          email: order.email || '',
          phone: order.phone || '',
          date: order.createdAt,
          total: order.totalAmount,
          subtotal: order.subtotal,
          shipping: order.shippingAmount || 0,
          tax: order.taxAmount || 0,
          status: order.status,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          shippingAddress: {
            street: order.shippingAddress?.street || '',
          city: order.shipping_address?.city || '',
          country: order.shipping_address?.country || '',
          zipCode: order.shipping_address?.zip_code || ''
        },
        products: order.items?.map(item => ({
          id: item.product_id,
          name: item.product_name,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku || '',
          image: item.product_image || 'https://via.placeholder.com/50'
        })) || [],
        timeline: order.timeline || [
          { status: order.status, date: order.created_at, note: 'تم إنشاء الطلب بنجاح' }
        ]
      }));
    }
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }
  
  // Fallback to mock data
  return getMockOrders();
};

// Mock data fallback
const getMockOrders = () => {
  return [
    {
      id: 'ORD-1001',
      customer: 'أحمد محمد',
      email: 'ahmed@example.com',
      phone: '0663140341',
      date: '2024-03-15T10:30:00',
      total: 450,
      subtotal: 380,
      shipping: 20,
      tax: 50,
      status: 'pending',
      paymentMethod: 'cash',
      paymentStatus: 'unpaid',
      shippingAddress: { street: 'حي 100 مسكن', city: 'سطيف', country: 'الجزائر', zipCode: '19000' },
      products: [
        { id: 1, name: 'ملصق حائط زهور', price: 45, quantity: 2, sku: 'WAL-001', image: 'https://via.placeholder.com/50' },
        { id: 2, name: 'ملصق باب خشبي', price: 89, quantity: 1, sku: 'DR-002', image: 'https://via.placeholder.com/50' }
      ],
      timeline: [
        { status: 'pending', date: '2024-03-15T10:30:00', note: 'تم إنشاء الطلب بنجاح' }
      ]
    },
    {
      id: 'ORD-1002',
      customer: 'سارة أحمد',
      email: 'sara@example.com',
      phone: '0555987654',
      date: '2024-03-14T15:45:00',
      total: 280,
      subtotal: 240,
      shipping: 0,
      tax: 40,
      status: 'processing',
      paymentMethod: 'card',
      paymentStatus: 'paid',
      shippingAddress: { street: 'شارع الحرية', city: 'الجزائر العاصمة', country: 'الجزائر', zipCode: '16000' },
      products: [
        { id: 4, name: 'ملصق مطبخ فواكه', price: 65, quantity: 3, sku: 'KIT-004', image: 'https://via.placeholder.com/50' }
      ],
      timeline: [
        { status: 'pending', date: '2024-03-14T15:45:00', note: 'تم إنشاء الطلب بنجاح' },
        { status: 'processing', date: '2024-03-14T16:00:00', note: 'الطلب قيد التجهيز' }
      ]
    }
  ];
};

// Calculate stats from orders
const calculateStatsFromOrders = () => {
  const today = new Date().toDateString();
  const todayOrders = orders.value.filter(order => 
    new Date(order.date).toDateString() === today
  );
  
  return {
    totalOrders: orders.value.length,
    totalOrdersTrend: 12,
    todayOrders: todayOrders.length,
    todayOrdersTrend: 8,
    processingOrders: orders.value.filter(o => o.status === 'processing').length,
    processingOrdersTrend: -3,
    deliveredOrders: orders.value.filter(o => o.status === 'delivered').length,
    deliveredOrdersTrend: 15
  };
};

// Lifecycle
onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
}

.v-dialog .v-card {
  overflow-y: auto;
  max-height: 90vh;
}

/* Production Table Styles */
.production-table {
  border-radius: 12px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.product-image {
  width: 50px;
  height: 50px;
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
  font-size: 0.875rem;
}

.product-sku {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.material-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.material-chip {
  font-weight: 500;
  font-size: 0.75rem;
}

.material-properties {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.specifications {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.spec-item {
  font-size: 0.75rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
}

.pricing-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.unit-price {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.875rem;
}

.total-price {
  font-weight: 700;
  color: var(--primary-color);
  font-size: 1rem;
}

.production-status {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
}

.production-notes {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  text-align: center;
}

@media print {
  .v-btn {
    display: none !important;
  }
  
  .production-table {
    font-size: 10px;
  }
  
  .product-image {
    width: 30px;
    height: 30px;
  }
}

/* History Section Styles */
.history-section {
  max-height: 400px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.history-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.history-count {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.history-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.history-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 2px;
}

.history-content {
  margin-bottom: 0.5rem;
}

.history-header-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.history-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.history-user-info {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.history-user {
  font-weight: 500;
  display: flex;
  align-items: center;
}

.history-note {
  font-size: 0.875rem;
  color: var(--text-secondary);
  display: flex;
  align-items: flex-start;
  gap: 0.25rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
}

.history-actions {
  margin-top: 0.5rem;
}

.no-history {
  text-align: center;
  padding: 2rem;
  color: var(--text-secondary);
}
</style>
