<template>
  <v-card elevation="2" class="mb-6">
    <v-card-title class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center ga-2">
        <v-icon color="primary">mdi-ticket-percent</v-icon>
        <span class="text-h6">{{ $t('couponsManager') }}</span>
      </div>
      <div class="d-flex ga-2">
        <v-btn
          color="success"
          variant="elevated"
          prepend-icon="mdi-chart-line"
          @click="showStatistics = true"
        >
          {{ $t('statistics') }}
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          {{ $t('addCoupon') }}
        </v-btn>
      </div>
    </v-card-title>
    
    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
        <p class="mt-4">{{ $t('loadingCoupons') }}</p>
      </div>
      
      <!-- Coupons Table -->
      <v-data-table
        v-else-if="coupons.length > 0"
        :headers="headers"
        :items="coupons"
        :loading="loading"
        class="coupons-table"
        elevation="0"
      >
        <!-- Code Column -->
        <template v-slot:item.code="{ item }">
          <div class="d-flex align-center ga-2">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              variant="tonal"
            >
              {{ item.code }}
            </v-chip>
            <v-btn
              v-if="item.code"
              icon="mdi-content-copy"
              size="x-small"
              variant="text"
              @click="copyCode(item.code)"
            ></v-btn>
          </div>
        </template>
        
        <!-- Name Column -->
        <template v-slot:item.name="{ item }">
          <div>
            <div class="text-body-2 font-weight-medium">{{ item.name || item.code }}</div>
            <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
          </div>
        </template>
        
        <!-- Discount Column -->
        <template v-slot:item.discount="{ item }">
          <div class="text-body-2">
            <v-icon :icon="getDiscountIcon(item.discount_type)" size="16" class="me-1"></v-icon>
            {{ item.formatted_discount }}
          </div>
          <div v-if="item.max_discount" class="text-caption text-medium-emphasis">
            {{ $t('max') }}: {{ formatCurrency(item.max_discount) }}
          </div>
        </template>
        
        <!-- Usage Column -->
        <template v-slot:item.usage="{ item }">
          <div class="text-body-2">
            <v-progress-linear
              :model-value="getUsagePercentage(item)"
              :color="getUsageColor(item)"
              height="6"
              rounded
              class="mb-2"
            ></v-progress-linear>
            <div class="d-flex justify-space-between">
              <span>{{ item.used_count }}</span>
              <span v-if="item.remaining_uses !== null">{{ item.remaining_uses }}</span>
              <span v-else>∞</span>
            </div>
          </div>
        </template>
        
        <!-- Validity Column -->
        <template v-slot:item.validity="{ item }">
          <div class="text-body-2">
            <div v-if="item.valid_from" class="text-caption">
              {{ $t('from') }}: {{ formatDate(item.valid_from) }}
            </div>
            <div v-if="item.valid_to" class="text-caption">
              {{ $t('to') }}: {{ formatDate(item.valid_to) }}
            </div>
            <v-chip
              v-if="item.is_expired"
              color="error"
              size="x-small"
              variant="tonal"
            >
              {{ $t('expired') }}
            </v-chip>
            <v-chip
              v-else-if="item.is_upcoming"
              color="warning"
              size="x-small"
              variant="tonal"
            >
              {{ $t('upcoming') }}
            </v-chip>
          </div>
        </template>
        
        <!-- Status Column -->
        <template v-slot:item.is_active="{ item }">
          <v-switch
            v-model="item.is_active"
            :label="item.is_active ? $t('active') : $t('inactive')"
            color="success"
            hide-details
            density="compact"
            @change="toggleCouponStatus(item)"
          ></v-switch>
        </template>
        
        <!-- Actions Column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex ga-1">
            <v-btn
              icon="mdi-eye"
              size="small"
              variant="text"
              color="info"
              @click="viewCouponDetails(item)"
            ></v-btn>
            <v-btn
              icon="mdi-pencil"
              size="small"
              variant="text"
              color="primary"
              @click="openEditModal(item)"
            ></v-btn>
            <v-btn
              icon="mdi-delete"
              size="small"
              variant="text"
              color="error"
              @click="confirmDelete(item)"
            ></v-btn>
          </div>
        </template>
      </v-data-table>
      
      <!-- Empty State -->
      <v-card
        v-else
        variant="outlined"
        class="text-center py-8"
        color="grey-lighten-4"
      >
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-ticket-percent-outline
        </v-icon>
        <h3 class="text-h5 mb-2">{{ $t('noCoupons') }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('noCouponsDesc') }}
        </p>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="openAddModal"
        >
          {{ $t('addFirstCoupon') }}
        </v-btn>
      </v-card>
    </v-card-text>
  </v-card>
  
  <!-- Add/Edit Coupon Modal -->
  <v-dialog v-model="showModal" max-width="900" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">
          {{ editingCoupon ? $t('editCoupon') : $t('addCoupon') }}
        </span>
        <v-btn icon="mdi-close" variant="text" @click="closeModal"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form ref="couponForm" v-model="formValid">
          <v-row>
            <!-- Basic Information -->
            <v-col cols="12">
              <h6 class="text-h6 mb-3">{{ $t('basicInformation') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.code"
                :label="$t('couponCode')"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-ticket"
                :hint="$t('couponCodeHint')"
                persistent-hint
                :append-inner-icon="formData.code ? 'mdi-refresh' : null"
                @click:append-inner="generateRandomCode"
              >
                <template v-slot:append>
                  <v-btn
                    icon="mdi-dice-6"
                    size="small"
                    variant="text"
                    @click="generateRandomCode"
                  ></v-btn>
                </template>
              </v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                :label="$t('couponName')"
                variant="outlined"
                prepend-inner-icon="mdi-rename"
                :hint="$t('couponNameHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.description"
                :label="$t('couponDescription')"
                variant="outlined"
                rows="3"
                prepend-inner-icon="mdi-text"
                :hint="$t('couponDescriptionHint')"
                persistent-hint
              ></v-textarea>
            </v-col>
            
            <!-- Discount Configuration -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('discountConfiguration') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.discount_type"
                :label="$t('discountType')"
                :items="discountTypes"
                item-title="text"
                item-value="value"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-percent"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.discount_value"
                :label="formData.discount_type === 'percentage' ? $t('discountPercentage') : $t('discountAmount')"
                type="number"
                :rules="[requiredRule, discountValueRule]"
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd"
                :suffix="formData.discount_type === 'percentage' ? '%' : 'د.ج'"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" v-if="formData.discount_type === 'percentage'">
              <v-text-field
                v-model="formData.max_discount"
                :label="$t('maxDiscount')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd-off"
                :hint="$t('maxDiscountHint')"
                persistent-hint
                suffix="د.ج"
              ></v-text-field>
            </v-col>
            
            <!-- Usage Limits -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('usageLimits') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.usage_limit"
                :label="$t('usageLimit')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-counter"
                :hint="$t('usageLimitHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.usage_limit_per_user"
                :label="$t('usageLimitPerUser')"
                type="number"
                :rules="[requiredRule]"
                variant="outlined"
                prepend-inner-icon="mdi-account-lock"
                :hint="$t('usageLimitPerUserHint')"
                persistent-hint
              ></v-text-field>
            </v-col>
            
            <!-- Order Requirements -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('orderRequirements') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.min_order_value"
                :label="$t('minOrderValue')"
                type="number"
                :rules="[minOrderValueRule]"
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd"
                suffix="د.ج"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.max_order_value"
                :label="$t('maxOrderValue')"
                type="number"
                variant="outlined"
                prepend-inner-icon="mdi-currency-usd"
                suffix="د.ج"
              ></v-text-field>
            </v-col>
            
            <!-- Validity Period -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <h6 class="text-h6 mb-3">{{ $t('validityPeriod') }}</h6>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.valid_from"
                :label="$t('validFrom')"
                type="datetime-local"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-start"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.valid_to"
                :label="$t('validTo')"
                type="datetime-local"
                variant="outlined"
                prepend-inner-icon="mdi-calendar-end"
              ></v-text-field>
            </v-col>
            
            <!-- Status -->
            <v-col cols="12">
              <v-divider class="my-4"></v-divider>
              <v-switch
                v-model="formData.is_active"
                :label="$t('active')"
                color="success"
                hide-details
              ></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="closeModal">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          :loading="saving"
          :disabled="!formValid"
          color="primary"
          variant="elevated"
          @click="saveCoupon"
        >
          {{ editingCoupon ? $t('update') : $t('add') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Coupon Details Modal -->
  <v-dialog v-model="showDetailsModal" max-width="700">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ $t('couponDetails') }}</span>
        <v-btn icon="mdi-close" variant="text" @click="showDetailsModal = false"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4" v-if="selectedCoupon">
        <v-row>
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>{{ $t('code') }}</v-list-item-title>
                <v-list-item-subtitle>
                  <v-chip :color="getStatusColor(selectedCoupon.status)" variant="tonal">
                    {{ selectedCoupon.code }}
                  </v-chip>
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('name') }}</v-list-item-title>
                <v-list-item-subtitle>{{ selectedCoupon.name || '-' }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('discount') }}</v-list-item-title>
                <v-list-item-subtitle>{{ selectedCoupon.formatted_discount }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('usage') }}</v-list-item-title>
                <v-list-item-subtitle>{{ selectedCoupon.used_count }} / {{ selectedCoupon.remaining_uses || '∞' }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
          <v-col cols="12" md="6">
            <v-list density="compact">
              <v-list-item>
                <v-list-item-title>{{ $t('status') }}</v-list-item-title>
                <v-list-item-subtitle>{{ selectedCoupon.status }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('validFrom') }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(selectedCoupon.valid_from) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('validTo') }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatDate(selectedCoupon.valid_to) }}</v-list-item-subtitle>
              </v-list-item>
              <v-list-item>
                <v-list-item-title>{{ $t('minOrderValue') }}</v-list-item-title>
                <v-list-item-subtitle>{{ formatCurrency(selectedCoupon.min_order_value) }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-col>
        </v-row>
        
        <!-- Usage History -->
        <v-divider class="my-4"></v-divider>
        <h6 class="text-h6 mb-3">{{ $t('usageHistory') }}</h6>
        <v-data-table
          v-if="selectedCoupon.usage_history && selectedCoupon.usage_history.length > 0"
          :headers="usageHeaders"
          :items="selectedCoupon.usage_history"
          density="compact"
          hide-default-footer
        >
          <template v-slot:item.used_at="{ item }">
            {{ formatDateTime(item.used_at) }}
          </template>
          <template v-slot:item.discount_amount="{ item }">
            {{ formatCurrency(item.discount_amount) }}
          </template>
        </v-data-table>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          class="text-center"
        >
          {{ $t('noUsageHistory') }}
        </v-alert>
      </v-card-text>
    </v-card>
  </v-dialog>
  
  <!-- Statistics Modal -->
  <v-dialog v-model="showStatistics" max-width="800">
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ $t('couponStatistics') }}</span>
        <v-btn icon="mdi-close" variant="text" @click="showStatistics = false"></v-btn>
      </v-card-title>
      
      <v-card-text class="pa-4" v-if="statistics">
        <v-row>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon size="40" color="primary" class="mb-2">mdi-ticket-percent</v-icon>
              <div class="text-h4">{{ statistics.total_coupons }}</div>
              <div class="text-caption">{{ $t('totalCoupons') }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon size="40" color="success" class="mb-2">mdi-check-circle</v-icon>
              <div class="text-h4">{{ statistics.active_coupons }}</div>
              <div class="text-caption">{{ $t('activeCoupons') }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon size="40" color="error" class="mb-2">mdi-clock-alert</v-icon>
              <div class="text-h4">{{ statistics.expired_coupons }}</div>
              <div class="text-caption">{{ $t('expiredCoupons') }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="3">
            <v-card variant="outlined" class="text-center pa-4">
              <v-icon size="40" color="warning" class="mb-2">mdi-trending-up</v-icon>
              <div class="text-h4">{{ statistics.total_usage }}</div>
              <div class="text-caption">{{ $t('totalUsage') }}</div>
            </v-card>
          </v-col>
        </v-row>
        
        <!-- Most Used Coupon -->
        <v-divider class="my-4"></v-divider>
        <h6 class="text-h6 mb-3">{{ $t('mostUsedCoupon') }}</h6>
        <v-card v-if="statistics.most_used" variant="outlined" class="pa-4">
          <div class="d-flex align-center justify-space-between">
            <div>
              <div class="text-h6">{{ statistics.most_used.code }}</div>
              <div class="text-body-2 text-medium-emphasis">{{ statistics.most_used.name }}</div>
            </div>
            <div class="text-right">
              <div class="text-h4">{{ statistics.most_used.used_count }}</div>
              <div class="text-caption">{{ $t('uses') }}</div>
            </div>
          </div>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
  
  <!-- Delete Confirmation Dialog -->
  <v-dialog v-model="showDeleteDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 pa-4">
        {{ $t('confirmDelete') }}
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p>{{ $t('confirmDeleteCoupon') }}</p>
        <v-chip
          v-if="deletingCoupon"
          color="primary"
          class="mt-2"
        >
          {{ deletingCoupon.code }}
        </v-chip>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn variant="text" @click="showDeleteDialog = false">
          {{ $t('cancel') }}
        </v-btn>
        <v-btn
          :loading="deleting"
          color="error"
          variant="elevated"
          @click="deleteCoupon"
        >
          {{ $t('delete') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  
  <!-- Success/Error Messages -->
  <v-snackbar
    v-model="showSnackbar"
    :color="snackbarColor"
    :timeout="3000"
    location="top"
  >
    {{ snackbarMessage }}
  </v-snackbar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGraphQL } from '@/shared/composables/useGraphQL';

const { t } = useI18n();
const { executeQuery, executeMutation } = useGraphQL();

// State
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const showModal = ref(false);
const showDetailsModal = ref(false);
const showStatistics = ref(false);
const showDeleteDialog = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const snackbarColor = ref('success');
const editingCoupon = ref(null);
const deletingCoupon = ref(null);
const selectedCoupon = ref(null);
const formValid = ref(false);
const couponForm = ref(null);
const coupons = ref([]);
const statistics = ref(null);

// Form data
const formData = ref({
  code: '',
  name: '',
  description: '',
  discount_type: 'percentage',
  discount_value: 0,
  max_discount: null,
  usage_limit: null,
  usage_limit_per_user: 1,
  min_order_value: 0,
  max_order_value: null,
  valid_from: null,
  valid_to: null,
  is_active: true
});

// Discount types
const discountTypes = computed(() => [
  { text: t('percentage'), value: 'percentage' },
  { text: t('fixedAmount'), value: 'fixed' }
]);

// Table headers
const headers = computed(() => [
  { title: t('code'), key: 'code', sortable: true },
  { title: t('name'), key: 'name', sortable: true },
  { title: t('discount'), key: 'discount', sortable: false },
  { title: t('usage'), key: 'usage', sortable: false },
  { title: t('validity'), key: 'validity', sortable: false },
  { title: t('status'), key: 'is_active', sortable: false },
  { title: t('actions'), key: 'actions', sortable: false, align: 'end' }
]);

// Usage history headers
const usageHeaders = computed(() => [
  { title: t('user'), key: 'user_name' },
  { title: t('order'), key: 'order_number' },
  { title: t('discount'), key: 'discount_amount' },
  { title: t('date'), key: 'used_at' }
]);

// Validation rules
const requiredRule = v => !!v || t('fieldRequired');
const discountValueRule = v => {
  if (formData.value.discount_type === 'percentage') {
    return (v > 0 && v <= 100) || t('discountPercentageRule');
  }
  return v > 0 || t('discountAmountRule');
};
const minOrderValueRule = v => v >= 0 || t('minOrderValueRule');

// Methods
const openAddModal = () => {
  editingCoupon.value = null;
  formData.value = {
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    max_discount: null,
    usage_limit: null,
    usage_limit_per_user: 1,
    min_order_value: 0,
    max_order_value: null,
    valid_from: null,
    valid_to: null,
    is_active: true
  };
  showModal.value = true;
};

const openEditModal = (coupon) => {
  editingCoupon.value = coupon;
  formData.value = {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    max_discount: coupon.max_discount,
    usage_limit: coupon.usage_limit,
    usage_limit_per_user: coupon.usage_limit_per_user,
    min_order_value: coupon.min_order_value,
    max_order_value: coupon.max_order_value,
    valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().slice(0, 16) : null,
    valid_to: coupon.valid_to ? new Date(coupon.valid_to).toISOString().slice(0, 16) : null,
    is_active: coupon.is_active
  };
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  editingCoupon.value = null;
  if (couponForm.value) {
    couponForm.value.resetValidation();
  }
};

const generateRandomCode = async () => {
  try {
    const mutation = `
      mutation GenerateCouponCode {
        generateCouponCode {
          success
          code
        }
      }
    `;
    
    const response = await executeMutation(mutation);
    if (response?.data?.generateCouponCode?.success) {
      formData.value.code = response.data.generateCouponCode.code;
    }
  } catch (error) {
    console.error('Error generating code:', error);
  }
};

const saveCoupon = async () => {
  if (!couponForm.value?.validate()) return;
  
  saving.value = true;
  try {
    const mutation = editingCoupon.value
      ? `
        mutation UpdateCoupon($input: UpdateCouponInput!) {
          updateCoupon(input: $input) {
            success
            message
            coupon {
              id
              code
              name
            }
          }
        }
      `
      : `
        mutation CreateCoupon($input: CreateCouponInput!) {
          createCoupon(input: $input) {
            success
            message
            coupon {
              id
              code
              name
            }
          }
        }
      `;
    
    const variables = {
      input: {
        ...formData.value,
        valid_from: formData.value.valid_from ? new Date(formData.value.valid_from).toISOString() : null,
        valid_to: formData.value.valid_to ? new Date(formData.value.valid_to).toISOString() : null
      }
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.[editingCoupon.value ? 'updateCoupon' : 'createCoupon']?.success) {
      showMessage(
        editingCoupon.value 
          ? t('couponUpdatedSuccessfully') 
          : t('couponAddedSuccessfully'), 
        'success'
      );
      closeModal();
      await fetchCoupons();
    } else {
      throw new Error(response?.data?.[editingCoupon.value ? 'updateCoupon' : 'createCoupon']?.message || 'Failed to save coupon');
    }
  } catch (error) {
    console.error('Error saving coupon:', error);
    showMessage(error.message || t('saveFailed'), 'error');
  } finally {
    saving.value = false;
  }
};

const toggleCouponStatus = async (coupon) => {
  try {
    const mutation = `
      mutation UpdateCoupon($input: UpdateCouponInput!) {
        updateCoupon(input: $input) {
          success
          message
        }
      }
    `;
    
    const variables = {
      input: {
        id: coupon.id,
        is_active: coupon.is_active
      }
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.updateCoupon?.success) {
      showMessage(t('couponStatusUpdated'), 'success');
      await fetchCoupons();
    } else {
      throw new Error(response?.data?.updateCoupon?.message || 'Failed to update status');
    }
  } catch (error) {
    console.error('Error toggling coupon status:', error);
    showMessage(error.message || t('updateFailed'), 'error');
    // Revert the change
    coupon.is_active = !coupon.is_active;
  }
};

const viewCouponDetails = async (coupon) => {
  try {
    const query = `
      query GetCoupon($id: ID!) {
        coupon(id: $id) {
          id
          code
          name
          description
          discount_type
          discount_value
          max_discount
          usage_limit
          usage_limit_per_user
          min_order_value
          max_order_value
          valid_from
          valid_to
          is_active
          used_count
          remaining_uses
          formatted_discount
          status
          is_expired
          is_upcoming
          usage_history {
            user_name
            order_number
            discount_amount
            used_at
          }
        }
      }
    `;
    
    const variables = { id: coupon.id };
    const response = await executeQuery(query, variables);
    
    if (response?.data?.coupon) {
      selectedCoupon.value = response.data.coupon;
      showDetailsModal.value = true;
    }
  } catch (error) {
    console.error('Error fetching coupon details:', error);
  }
};

const confirmDelete = (coupon) => {
  deletingCoupon.value = coupon;
  showDeleteDialog.value = true;
};

const deleteCoupon = async () => {
  deleting.value = true;
  try {
    const mutation = `
      mutation DeleteCoupon($id: ID!) {
        deleteCoupon(id: $id) {
          success
          message
        }
      }
    `;
    
    const variables = { id: deletingCoupon.value.id };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.deleteCoupon?.success) {
      showMessage(t('couponDeletedSuccessfully'), 'success');
      showDeleteDialog.value = false;
      deletingCoupon.value = null;
      await fetchCoupons();
    } else {
      throw new Error(response?.data?.deleteCoupon?.message || 'Failed to delete coupon');
    }
  } catch (error) {
    console.error('Error deleting coupon:', error);
    showMessage(error.message || t('deleteFailed'), 'error');
  } finally {
    deleting.value = false;
  }
};

const fetchCoupons = async () => {
  loading.value = true;
  try {
    const query = `
      query GetCoupons {
        coupons {
          id
          code
          name
          description
          discount_type
          discount_value
          max_discount
          usage_limit
          usage_limit_per_user
          min_order_value
          max_order_value
          valid_from
          valid_to
          is_active
          used_count
          remaining_uses
          formatted_discount
          status
          is_expired
          is_upcoming
        }
      }
    `;
    
    const response = await executeQuery(query);
    
    if (response?.data?.coupons) {
      coupons.value = response.data.coupons;
    }
  } catch (error) {
    console.error('Error fetching coupons:', error);
    showMessage(t('loadFailed'), 'error');
  } finally {
    loading.value = false;
  }
};

const fetchStatistics = async () => {
  try {
    const query = `
      query GetCouponStatistics {
        couponStatistics
      }
    `;
    
    const response = await executeQuery(query);
    
    if (response?.data?.couponStatistics) {
      statistics.value = response.data.couponStatistics;
    }
  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

// Helper methods
const getStatusColor = (status) => {
  const colors = {
    'نشط': 'success',
    'active': 'success',
    'غير نشط': 'error',
    'inactive': 'error',
    'منتهي': 'error',
    'expired': 'error',
    'قادم': 'warning',
    'upcoming': 'warning',
    'مستنفذ': 'grey',
    'exhausted': 'grey'
  };
  return colors[status] || 'grey';
};

const getDiscountIcon = (type) => {
  return type === 'percentage' ? 'mdi-percent' : 'mdi-currency-usd';
};

const getUsagePercentage = (coupon) => {
  if (!coupon.usage_limit) return 0;
  return (coupon.used_count / coupon.usage_limit) * 100;
};

const getUsageColor = (coupon) => {
  const percentage = getUsagePercentage(coupon);
  if (percentage >= 90) return 'error';
  if (percentage >= 70) return 'warning';
  return 'success';
};

const copyCode = (code) => {
  navigator.clipboard.writeText(code);
  showMessage(t('codeCopied'), 'success');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ar-DZ');
};

const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('ar-DZ');
};

const showMessage = (message, color = 'success') => {
  snackbarMessage.value = message;
  snackbarColor.value = color;
  showSnackbar.value = true;
};

// Initialize
onMounted(async () => {
  await Promise.all([
    fetchCoupons(),
    fetchStatistics()
  ]);
});
</script>

<style scoped>
.coupons-table {
  border-radius: 8px;
  overflow: hidden;
}

.v-data-table >>> .v-data-table__th {
  font-weight: 600;
}

.v-switch {
  margin-top: 0;
}
</style>
