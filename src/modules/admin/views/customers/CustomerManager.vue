<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 customer-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-account-multiple</v-icon>
              {{ $t('customerManager') || 'إدارة العملاء' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('customerManagerSubtitle') || 'إدارة بيانات وحسابات العملاء' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="addCustomer"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t('addCustomer') || 'إضافة عميل' }}
            </v-btn>
            <v-btn
              @click="exportCustomers"
              variant="tonal"
              color="success"
              prepend-icon="mdi-download"
            >
              {{ $t('exportCustomers') || 'تصدير العملاء' }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingCustomers') || 'جاري تحميل العملاء...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Customer Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in customerStats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="stat-card">
            <v-card-text class="pa-4 text-center">
              <v-avatar
                :color="stat.color"
                variant="tonal"
                size="50"
                class="mb-3"
              >
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.title }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Customer Segments -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="customer-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-account-group</v-icon>
                {{ $t('customerSegments') || 'شرائح العملاء' }}
              </h3>
              <div class="segments-grid">
                <div v-for="segment in customerSegments" :key="segment.name" class="segment-item">
                  <v-card variant="outlined" class="segment-card">
                    <v-card-text class="pa-4 text-center">
                      <v-avatar :color="segment.color" variant="tonal" size="48" class="mb-3">
                        <v-icon :color="segment.color" size="24">{{ segment.icon }}</v-icon>
                      </v-avatar>
                      <h4 class="text-body-2 font-weight-medium text-white mb-2">{{ segment.name }}</h4>
                      <p class="text-caption text-medium-emphasis mb-3">{{ segment.count }} {{ $t('customers') || 'عملاء' }}</p>
                      <div class="text-caption text-medium-emphasis mb-3">{{ segment.percentage }}%</div>
                      <v-btn
                        @click="viewSegment(segment)"
                        variant="tonal"
                        :color="segment.color"
                        size="small"
                        prepend-icon="mdi-eye"
                      >
                        {{ $t('view') || 'عرض' }}
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="customer-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-line</v-icon>
                {{ $t('customerGrowth') || 'نمو العملاء' }}
              </h3>
              <div class="growth-stats">
                <div class="growth-item mb-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('thisMonth') || 'هذا الشهر' }}</span>
                    <span class="text-body-2 font-weight-medium text-success">+{{ growthStats.thisMonth }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(growthStats.thisMonth / growthStats.maxGrowth) * 100"
                    color="success"
                    height="6"
                    rounded
                  />
                </div>
                <div class="growth-item mb-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('lastMonth') || 'الشهر الماضي' }}</span>
                    <span class="text-body-2 font-weight-medium text-warning">+{{ growthStats.lastMonth }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(growthStats.lastMonth / growthStats.maxGrowth) * 100"
                    color="warning"
                    height="6"
                    rounded
                  />
                </div>
                <div class="growth-item">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('thisYear') || 'هذا العام' }}</span>
                    <span class="text-body-2 font-weight-medium text-primary">+{{ growthStats.thisYear }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(growthStats.thisYear / growthStats.maxGrowth) * 100"
                    color="primary"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Customers Table -->
      <v-card variant="elevated" class="customer-card">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
              <v-icon color="primary" size="20">mdi-account-multiple</v-icon>
              {{ $t('allCustomers') || 'جميع العملاء' }}
            </h3>
            <div class="d-flex ga-2">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchCustomers') || 'البحث في العملاء'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 300px;"
              />
              <v-select
                v-model="statusFilter"
                :label="$t('filterByStatus') || 'فلترة حسب الحالة'"
                :items="statusOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px;"
              />
              <v-select
                v-model="segmentFilter"
                :label="$t('filterBySegment') || 'فلترة حسب الشريحة'"
                :items="segmentOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px;"
              />
            </div>
          </div>

          <v-data-table
            :headers="tableHeaders"
            :items="filteredCustomers"
            :loading="loading"
            :search="searchQuery"
            items-per-page="10"
            class="customer-table"
          >
            <template #[`item.name`="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar :color="item.avatarColor" variant="tonal" size="32">
                  <v-icon size="16">{{ item.avatarIcon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium text-white">{{ item.name }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template #[`item.segment`="{ item }">
              <v-chip :color="item.segmentColor" variant="tonal" size="small">
                {{ item.segment }}
              </v-chip>
            </template>

            <template #[`item.status`="{ item }">
              <v-chip :color="item.statusColor" variant="tonal" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.orders"="{ item }">
              <div class="text-body-2 font-weight-medium">{{ item.orders }}</div>
            </template>

            <template #[`item.revenue"="{ item }">
              <div class="text-body-2 font-weight-medium text-success">{{ formatCurrency(item.revenue) }}</div>
            </template>

            <template #[`item.actions`="{ item }">
              <div class="d-flex ga-1">
                <v-btn
                  @click="viewCustomer(item)"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-eye"
                >
                  {{ $t('view') || 'عرض' }}
                </v-btn>
                <v-btn
                  @click="editCustomer(item)"
                  variant="tonal"
                  color="warning"
                  size="small"
                  prepend-icon="mdi-pencil"
                >
                  {{ $t('edit') || 'تعديل' }}
                </v-btn>
                <v-btn
                  @click="deleteCustomer(item)"
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="mdi-delete"
                >
                  {{ $t('delete') || 'حذف' }}
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Add/Edit Customer Dialog -->
    <v-dialog v-model="customerDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium">
            {{ editingCustomer ? ($t('editCustomer') || 'تعديل العميل') : ($t('addCustomer') || 'إضافة عميل') }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="customerForm" v-model="validForm">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentCustomer.firstName"
                  :label="$t('firstName') || 'الاسم الأول'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentCustomer.lastName"
                  :label="$t('lastName') || 'الاسم الأخير'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="currentCustomer.email"
                  :label="$t('email') || 'البريد الإلكتروني'"
                  variant="outlined"
                  type="email"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="currentCustomer.phone"
                  :label="$t('phone') || 'رقم الهاتف'"
                  variant="outlined"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentCustomer.segment"
                  :label="$t('segment') || 'الشريحة'"
                  :items="segmentOptions"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentCustomer.status"
                  :label="$t('status') || 'الحالة'"
                  :items="statusOptions"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentCustomer.address"
                  :label="$t('address') || 'العنوان'"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="customerDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="saveCustomer" color="primary" variant="elevated">
            {{ $t('save') || 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import CustomerService from '@/services/CustomerService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const customerDialog = ref(false);
const editingCustomer = ref(false);
const validForm = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const segmentFilter = ref('all');

// Form refs
const customerForm = ref(null);

// Data
const customerStats = ref([
  {
    title: t('totalCustomers') || 'إجمالي العملاء',
    value: '1,234',
    icon: 'mdi-account-multiple',
    color: 'primary'
  },
  {
    title: t('activeCustomers') || 'العملاء النشطون',
    value: '987',
    icon: 'mdi-account-check',
    color: 'success'
  },
  {
    title: t('newCustomers') || 'العملاء الجدد',
    value: '156',
    icon: 'mdi-account-plus',
    color: 'warning'
  },
  {
    title: t('vipCustomers') || 'العملاء المميزون',
    value: '89',
    icon: 'mdi-star',
    color: 'info'
  }
]);

const customerSegments = ref([
  {
    name: 'العملاء العاديون',
    count: 456,
    percentage: 37,
    icon: 'mdi-account',
    color: 'primary'
  },
  {
    name: 'العملاء المميزون',
    count: 234,
    percentage: 19,
    icon: 'mdi-star',
    color: 'warning'
  },
  {
    name: 'العملاء الجدد',
    count: 156,
    percentage: 13,
    icon: 'mdi-account-plus',
    color: 'success'
  },
  {
    name: 'العملاء النشطون',
    count: 388,
    percentage: 31,
    icon: 'mdi-account-check',
    color: 'info'
  }
]);

const growthStats = ref({
  thisMonth: 156,
  lastMonth: 124,
  thisYear: 1234,
  maxGrowth: 1500
});

const customers = ref([
  {
    id: 1,
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    segment: 'العملاء المميزون',
    status: 'نشط',
    segmentColor: 'warning',
    statusColor: 'success',
    avatarColor: 'primary',
    avatarIcon: 'mdi-account',
    orders: 23,
    revenue: 15450,
    address: 'الرياض، المملكة العربية السعودية',
    createdAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'فاطمة علي',
    email: 'fatima@example.com',
    phone: '+966 55 987 6543',
    segment: 'العملاء النشطون',
    status: 'نشط',
    segmentColor: 'info',
    statusColor: 'success',
    avatarColor: 'success',
    avatarIcon: 'mdi-account',
    orders: 18,
    revenue: 12340,
    address: 'جدة، المملكة العربية السعودية',
    createdAt: '2024-01-12'
  },
  {
    id: 3,
    name: 'محمد عبدالله',
    email: 'mohammed@example.com',
    phone: '+966 51 234 5678',
    segment: 'العملاء العاديون',
    status: 'غير نشط',
    segmentColor: 'primary',
    statusColor: 'error',
    avatarColor: 'warning',
    avatarIcon: 'mdi-account',
    orders: 7,
    revenue: 3450,
    address: 'الدمام، المملكة العربية السعودية',
    createdAt: '2024-01-10'
  },
  {
    id: 4,
    name: 'نورة سالم',
    email: 'nora@example.com',
    phone: '+966 56 789 0123',
    segment: 'العملاء الجدد',
    status: 'نشط',
    segmentColor: 'success',
    statusColor: 'success',
    avatarColor: 'info',
    avatarIcon: 'mdi-account',
    orders: 3,
    revenue: 1230,
    address: 'مكة المكرمة، المملكة العربية السعودية',
    createdAt: '2024-01-08'
  },
  {
    id: 5,
    name: 'خالد العتيبي',
    email: 'khalid@example.com',
    phone: '+966 50 345 6789',
    segment: 'العملاء المميزون',
    status: 'نشط',
    segmentColor: 'warning',
    statusColor: 'success',
    avatarColor: 'purple',
    avatarIcon: 'mdi-account',
    orders: 31,
    revenue: 23450,
    address: 'الخبر، المملكة العربية السعودية',
    createdAt: '2024-01-05'
  },
  {
    id: 6,
    name: 'سارة أحمد',
    email: 'sara@example.com',
    phone: '+966 53 456 7890',
    segment: 'العملاء النشطون',
    status: 'نشط',
    segmentColor: 'info',
    statusColor: 'success',
    avatarColor: 'pink',
    avatarIcon: 'mdi-account',
    orders: 15,
    revenue: 8900,
    address: 'المدينة المنورة، المملكة العربية السعودية',
    createdAt: '2024-01-03'
  }
]);

const currentCustomer = ref({
  id: null,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  segment: '',
  status: '',
  address: ''
});

const statusOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'نشط', value: 'نشط' },
  { title: 'غير نشط', value: 'غير نشط' },
  { title: 'محظور', value: 'محظور' }
]);

const segmentOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'العملاء العاديون', value: 'العملاء العاديون' },
  { title: 'العملاء المميزون', value: 'العملاء المميزون' },
  { title: 'العملاء الجدد', value: 'العملاء الجدد' },
  { title: 'العملاء النشطون', value: 'العملاء النشطون' }
]);

const tableHeaders = ref([
  { title: t('name') || 'الاسم', key: 'name', sortable: true },
  { title: t('phone') || 'الهاتف', key: 'phone', sortable: true },
  { title: t('segment') || 'الشريحة', key: 'segment', sortable: true },
  { title: t('status') || 'الحالة', key: 'status', sortable: true },
  { title: t('orders') || 'الطلبات', key: 'orders', sortable: true },
  { title: t('revenue') || 'الإيرادات', key: 'revenue', sortable: true },
  { title: t('actions') || 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]);

// Computed
const filteredCustomers = computed(() => {
  let filtered = customers.value;
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(customer => customer.status === statusFilter.value);
  }
  
  if (segmentFilter.value !== 'all') {
    filtered = filtered.filter(customer => customer.segment === segmentFilter.value);
  }
  
  return filtered;
});

// API Integration Methods
const loadCustomerData = async () => {
  try {
    const response = await CustomerService.getCustomers();
    if (response.success) {
      // Update data with API response
      customers.value = response.data.customers || customers.value;
      customerStats.value = response.data.customerStats || customerStats.value;
      customerSegments.value = response.data.customerSegments || customerSegments.value;
      growthStats.value = response.data.growthStats || growthStats.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for customer manager');
    }
  } catch (error) {
    console.error('Error loading customer data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('customerError') || 'خطأ في تحميل العملاء',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const formatCurrency = (value) => {
  return `${value.toLocaleString()} ر.س`;
};

const addCustomer = () => {
  editingCustomer.value = false;
  currentCustomer.value = {
    id: null,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    segment: '',
    status: '',
    address: ''
  };
  customerDialog.value = true;
};

const editCustomer = (customer) => {
  editingCustomer.value = true;
  currentCustomer.value = {
    id: customer.id,
    firstName: customer.name.split(' ')[0],
    lastName: customer.name.split(' ')[1] || '',
    email: customer.email,
    phone: customer.phone,
    segment: customer.segment,
    status: customer.status,
    address: customer.address
  };
  customerDialog.value = true;
};

const saveCustomer = async () => {
  if (!customerForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    const customerData = {
      ...currentCustomer.value,
      name: `${currentCustomer.value.firstName} ${currentCustomer.value.lastName}`.trim()
    };
    
    if (editingCustomer.value) {
      // Update existing customer
      const response = await CustomerService.updateCustomer(customerData);
      if (response.success) {
        const index = customers.value.findIndex(c => c.id === currentCustomer.value.id);
        if (index > -1) {
          customers.value[index] = { ...customers.value[index], ...customerData };
        }
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('customerUpdated') || 'تم تحديث العميل',
          message: t('customerUpdatedSuccessfully') || 'تم تحديث العميل بنجاح',
          timeout: 2000
        });
      }
    } else {
      // Create new customer
      const response = await CustomerService.createCustomer(customerData);
      if (response.success) {
        const newCustomer = {
          ...customerData,
          id: Date.now(),
          segmentColor: getSegmentColor(customerData.segment),
          statusColor: getStatusColor(customerData.status),
          avatarColor: 'primary',
          avatarIcon: 'mdi-account',
          orders: 0,
          revenue: 0,
          createdAt: new Date().toISOString().split('T')[0]
        };
        
        customers.value.unshift(newCustomer);
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('customerCreated') || 'تم إنشاء العميل',
          message: t('customerCreatedSuccessfully') || 'تم إنشاء العميل بنجاح',
          timeout: 2000
        });
      }
    }
    
    customerDialog.value = false;
    await loadCustomerData();
  } catch (error) {
    console.error('Error saving customer:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'خطأ في الحفظ',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const deleteCustomer = async (customer) => {
  if (!confirm(t('confirmDeleteCustomer') || 'هل أنت متأكد من حذف هذا العميل؟')) return;
  
  try {
    loading.value = true;
    
    const response = await CustomerService.deleteCustomer(customer.id);
    if (response.success) {
      const index = customers.value.findIndex(c => c.id === customer.id);
      if (index > -1) {
        customers.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('customerDeleted') || 'تم حذف العميل',
        message: t('customerDeletedSuccessfully') || 'تم حذف العميل بنجاح',
        timeout: 2000
      });
      
      await loadCustomerData();
    }
  } catch (error) {
    console.error('Error deleting customer:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'خطأ في الحذف',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const viewCustomer = (customer) => {
  // Navigate to customer details
  console.log('Viewing customer:', customer);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('viewingCustomer') || 'عرض العميل',
    message: `${t('viewing') || 'جاري عرض'} ${customer.name}`,
    timeout: 2000
  });
};

const viewSegment = (segment) => {
  // Navigate to segment details
  console.log('Viewing segment:', segment);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('viewingSegment') || 'عرض الشريحة',
    message: `${t('viewing') || 'جاري عرض'} ${segment.name}`,
    timeout: 2000
  });
};

const exportCustomers = () => {
  const customerData = {
    customers: customers.value,
    customerStats: customerStats.value,
    customerSegments: customerSegments.value,
    growthStats: growthStats.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(customerData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('customersExported') || 'تم تصدير العملاء',
    message: t('customersExportedSuccessfully') || 'تم تصدير العملاء بنجاح',
    timeout: 3000
  });
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadCustomerData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('customerDataRefreshed') || 'تم تحديث بيانات العملاء بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

const getSegmentColor = (segment) => {
  const colors = {
    'العملاء العاديون': 'primary',
    'العملاء المميزون': 'warning',
    'العملاء الجدد': 'success',
    'العملاء النشطون': 'info'
  };
  return colors[segment] || 'grey';
};

const getStatusColor = (status) => {
  const colors = {
    'نشط': 'success',
    'غير نشط': 'error',
    'محظور': 'warning'
  };
  return colors[status] || 'grey';
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    await loadCustomerData();
  } catch (error) {
    console.error('Error initializing Customer Manager:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Customer Header */
.customer-header {
  position: relative;
  overflow: hidden;
}

.customer-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.customer-header:hover::before {
  left: 100%;
}

/* Stat Cards */
.stat-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Customer Cards */
.customer-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.customer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.customer-card:hover::before {
  left: 100%;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Segments Grid */
.segments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.segment-item {
  transition: all 0.3s ease;
}

.segment-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.segment-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.segment-card:hover::before {
  left: 100%;
}

.segment-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Growth Stats */
.growth-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.growth-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.growth-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.growth-item:hover::before {
  left: 100%;
}

.growth-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Customer Table */
.customer-table {
  transition: all 0.3s ease;
}

.customer-table:hover {
  transform: scale(1.01);
}

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

.stat-card {
  animation: fadeIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.customer-card {
  animation: fadeIn 0.6s ease forwards;
}

.customer-card:nth-child(1) { animation-delay: 0.1s; }
.customer-card:nth-child(2) { animation-delay: 0.2s; }

.segment-card,
.growth-item {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .customer-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .segments-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 600px) {
  .customer-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .customer-card {
    margin-bottom: 1rem;
  }
  
  .segments-grid {
    grid-template-columns: 1fr;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-chip) {
  transition: all 0.3s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
}

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-icon) {
  transition: all 0.3s ease;
}

:deep(.v-icon:hover) {
  transform: scale(1.1);
}

:deep(.v-data-table) {
  transition: all 0.3s ease;
}

:deep(.v-data-table:hover) {
  transform: scale(1.01);
}

:deep(.v-dialog) {
  transition: all 0.3s ease;
}

:deep(.v-form) {
  transition: all 0.3s ease;
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: scale(1.02);
}

:deep(.v-select) {
  transition: all 0.3s ease;
}

:deep(.v-select:hover) {
  transform: scale(1.02);
}

:deep(.v-textarea) {
  transition: all 0.3s ease;
}

:deep(.v-textarea:hover) {
  transform: scale(1.01);
}

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
}
</style>
