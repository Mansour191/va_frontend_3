<template>
  <v-container class="pa-4">
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="pa-4 border-b">
            <v-icon class="me-2" color="primary">mdi-shopping</v-icon>
            إتمام الطلب
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Customer Information -->
            <v-form ref="customerForm" v-model="customerInfo" class="mb-6">
              <h3 class="mb-4">معلومات العميل</h3>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="customerInfo.firstName"
                    label="الاسم الأول"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="customerInfo.lastName"
                    label="الاسم الأخير"
                    variant="outlined"
                    :rules="[rules.required]"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="customerInfo.phone"
                    label="رقم الهاتف"
                    variant="outlined"
                    :rules="[rules.required, rules.phone]"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="customerInfo.email"
                    label="البريد الإلكتروني"
                    variant="outlined"
                    :rules="[rules.email]"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-text-field
                v-model="customerInfo.address"
                label="عنوان التسليم"
                variant="outlined"
                :rules="[rules.required]"
                class="mb-4"
              ></v-text-field>
            </v-form>

            <!-- Shipping Information -->
            <v-form ref="shippingForm" v-model="shippingInfo" class="mb-6">
              <h3 class="mb-4">معلومات الشحن</h3>
              
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="shippingInfo.wilayaId"
                    :items="availableWilayas"
                    item-title="nameAr"
                    item-value="wilayaId"
                    label="الولاية"
                    variant="outlined"
                    :rules="[rules.required]"
                    :loading="shippingStore.isLoading"
                    @update:model-value="onWilayaChange"
                  ></v-select>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="shippingInfo.deliveryAddress"
                    label="عنوان التسليم التفصيلي"
                    variant="outlined"
                    :rules="[rules.required]"
                    hint="العنوان الكامل للتوصيل"
                    persistent-hint
                  ></v-text-field>
                </v-col>
              </v-row>

              <!-- Shipping Method Selection -->
              <v-row v-if="shippingInfo.wilayaId">
                <v-col cols="12">
                  <ShippingSelector
                    :wilaya-id="shippingInfo.wilayaId"
                    @shipping-selected="onShippingMethodSelected"
                    @price-updated="onShippingPriceUpdated"
                  />
                </v-col>
              </v-row>

              <!-- Selected Shipping Summary -->
              <v-row v-if="selectedShippingMethod" class="mt-4">
                <v-col cols="12">
                  <v-card variant="outlined" class="shipping-summary">
                    <v-card-text class="pa-4">
                      <div class="d-flex align-center mb-3">
                        <v-avatar size="32" class="me-3">
                          <v-img
                            v-if="selectedShippingMethod.logo"
                            :src="selectedShippingMethod.logo"
                            :alt="selectedShippingMethod.name"
                          ></v-img>
                          <v-icon v-else>mdi-truck</v-icon>
                        </v-avatar>
                        <div>
                          <h6 class="text-h6 font-weight-medium">
                            {{ selectedShippingMethod.name }}
                          </h6>
                          <div class="text-caption text-medium-emphasis">
                            {{ selectedShippingMethod.provider }} • {{ selectedShippingMethod.service_type }}
                          </div>
                        </div>
                        <v-spacer></v-spacer>
                        <div class="text-end">
                          <div class="text-h6 font-weight-bold primary--text">
                            {{ formatCurrency(shippingCost) }}
                          </div>
                          <div class="text-caption">
                            {{ selectedShippingMethod.expected_delivery_time }} يوم
                          </div>
                        </div>
                      </div>
                      
                      <v-divider class="my-3"></v-divider>
                      
                      <!-- Service Features -->
                      <div class="d-flex flex-wrap gap-2">
                        <v-chip
                          v-if="selectedShippingPrice?.cod_available"
                          size="small"
                          color="success"
                          variant="outlined"
                        >
                          <v-icon start size="14">mdi-cash</v-icon>
                          الدفع عند الاستلام
                        </v-chip>
                        <v-chip
                          v-if="selectedShippingPrice?.insurance_available"
                          size="small"
                          color="info"
                          variant="outlined"
                        >
                          <v-icon start size="14">mdi-shield-check</v-icon>
                          Insurance Available
                        </v-chip>
                        <v-chip
                          v-if="selectedShippingPrice?.tracking_available"
                          size="small"
                          color="primary"
                          variant="outlined"
                        >
                          <v-icon start size="14">mdi-map-marker-path</v-icon>
                          تتبع الشحنة
                        </v-chip>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Free Shipping Notice -->
              <v-alert
                v-if="selectedShippingPrice?.free_shipping_minimum && cartStore.totalBeforeShipping >= selectedShippingPrice.free_shipping_minimum"
                type="success"
                variant="tonal"
                class="mt-4"
              >
                <v-icon start>mdi-gift</v-icon>
                <span class="font-weight-medium">تهانينا! طلبك مؤهل للشحن المجاني</span>
                <div class="text-caption mt-1">
                  الحد الأدنى للشحن المجاني: {{ formatCurrency(selectedShippingPrice.free_shipping_minimum) }}
                </div>
              </v-alert>

              <v-alert
                v-if="!selectedWilaya || !selectedWilaya.isActive"
                type="error"
                variant="tonal"
                class="mt-4"
              >
                <v-icon start>mdi-alert</v-icon>
                الشحن إلى هذه الولاية غير متاح حالياً
              </v-alert>
            </v-form>

            <!-- Coupon Section -->
            <v-form ref="couponForm" class="mb-6">
              <h3 class="mb-4">كوبون الخصم</h3>
              
              <v-row>
                <v-col cols="12" md="8">
                  <v-text-field
                    v-model="couponCode"
                    label="رمز الكوبون"
                    variant="outlined"
                    placeholder="أدخل رمز الكوبون"
                    :loading="isApplyingCoupon"
                    :error-messages="couponError"
                    @keyup.enter="applyCoupon"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="4">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    block
                    height="56"
                    @click="applyCoupon"
                    :loading="isApplyingCoupon"
                    :disabled="!couponCode.trim()"
                  >
                    <v-icon start>mdi-ticket-percent</v-icon>
                    تطبيق
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Applied Coupon Info -->
              <v-card
                v-if="appliedCoupon"
                variant="outlined"
                color="success"
                class="mt-3"
              >
                <v-card-text class="pa-3">
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-icon color="success" class="me-2">mdi-check-circle</v-icon>
                      <div>
                        <div class="font-weight-medium">{{ appliedCoupon.code }}</div>
                        <div class="text-caption">{{ appliedCoupon.name || 'كوبون خصم' }}</div>
                      </div>
                    </div>
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeCoupon"
                    ></v-btn>
                  </div>
                </v-card-text>
              </v-card>

              <!-- Coupon Error -->
              <v-alert
                v-if="couponError"
                type="error"
                variant="tonal"
                class="mt-3"
                closable
                @click:close="couponError = ''"
              >
                {{ couponError }}
              </v-alert>
            </v-form>

            <!-- Payment Method -->
            <v-form ref="paymentForm" v-model="paymentInfo" class="mb-6">
              <h3 class="mb-4">طريقة الدفع</h3>
              
              <v-radio-group
                v-model="paymentInfo.method"
                column
                :rules="[rules.required]"
              >
                <v-radio
                  v-for="method in paymentMethods"
                  :key="method.value"
                  :label="method.title"
                  :value="method.value"
                ></v-radio>
              </v-radio-group>
            </v-form>

            <!-- Notes -->
            <v-textarea
              v-model="orderNotes"
              label="ملاحظات الطلب (اختياري)"
              variant="outlined"
              rows="3"
              class="mb-4"
            ></v-textarea>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <!-- Order Summary -->
        <v-card class="position-sticky" style="top: 20px;">
          <v-card-title class="pa-4 border-b">
            <v-icon class="me-2" color="primary">mdi-receipt</v-icon>
            ملخص الطلب
          </v-card-title>

          <v-card-text class="pa-4">
            <!-- Cart Items -->
            <div v-if="cartStore.items.length > 0" class="mb-4">
              <div
                v-for="item in cartStore.items"
                :key="item.id"
                class="mb-3 pb-3 border-bottom"
              >
                <div class="d-flex justify-space-between align-start">
                  <div class="flex-grow-1">
                    <h6 class="text-subtitle-1 font-weight-medium mb-1">
                      {{ item.product.nameAr || item.product.nameEn }}
                    </h6>
                    <div v-if="item.material" class="text-caption text-medium-emphasis mb-1">
                      المادة: {{ item.material.nameAr || item.material.nameEn }}
                    </div>
                    <div class="d-flex align-center">
                      <span class="text-body-2">الكمية: {{ item.quantity }}</span>
                      <span class="mx-2">×</span>
                      <span class="font-weight-medium">{{ formatCurrency(item.unitPrice + item.materialPrice) }}</span>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="font-weight-bold">
                      {{ formatCurrency(item.subtotal) }}
                    </div>
                    <div v-if="item.discountAmount + item.couponDiscount > 0" class="text-caption success--text">
                      -{{ formatCurrency(item.discountAmount + item.couponDiscount) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Price Breakdown -->
            <div class="price-summary">
              <div class="d-flex justify-space-between mb-2">
                <span>المجموع الفرعي:</span>
                <span class="font-weight-medium">{{ formatCurrency(cartStore.subtotal) }}</span>
              </div>

              <div v-if="cartStore.discountTotal > 0" class="d-flex justify-space-between mb-2">
                <span>الخصم:</span>
                <span class="font-weight-medium success--text">
                  -{{ formatCurrency(cartStore.discountTotal) }}
                </span>
              </div>

              <!-- Coupon Discount -->
              <div v-if="couponDiscount > 0" class="d-flex justify-space-between mb-2">
                <span>خصم الكوبون:</span>
                <span class="font-weight-medium success--text">
                  -{{ formatCurrency(couponDiscount) }}
                </span>
              </div>

              <div class="d-flex justify-space-between mb-2">
                <span>الشحن:</span>
                <span class="font-weight-medium">
                  {{ shippingCost > 0 ? formatCurrency(shippingCost) : 'مجاني' }}
                </span>
              </div>

              <v-divider class="my-3"></v-divider>

              <div class="d-flex justify-space-between">
                <span class="text-h6 font-weight-bold">الإجمالي:</span>
                <span class="text-h6 font-weight-bold primary--text">
                  {{ formatCurrency(cartStore.totalBeforeShipping + shippingCost - couponDiscount) }}
                </span>
              </div>

              <!-- Free Shipping Notice -->
              <div
                v-if="selectedWilaya?.freeShippingMinimum && 
                       cartStore.totalBeforeShipping >= selectedWilaya.freeShippingMinimum"
                class="mt-3"
              >
                <v-chip color="success" variant="flat" size="small">
                  <v-icon start>mdi-truck-delivery</v-icon>
                  الشحن مجاني!
                </v-chip>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="mt-6">
              <v-btn
                color="primary"
                size="large"
                block
                @click="placeOrder"
                :loading="isPlacingOrder"
                :disabled="!canPlaceOrder"
              >
                <v-icon start>mdi-check-circle</v-icon>
                تأكيد الطلب
              </v-btn>

              <v-btn
                variant="outlined"
                block
                class="mt-3"
                @click="$router.push('/cart')"
              >
                <v-icon start>mdi-arrow-right</v-icon>
                العودة للسلة
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useShippingStore } from '@/stores/shipping'
import { useToast } from 'vuetify'
import { useMutation, useQuery } from '@vue/apollo-composable'
import { gql } from '@apollo/client/core'
import { CALCULATE_SHIPPING_MUTATION, PAYMENT_METHODS_QUERY } from '@/integration/graphql/common.graphql'
import { GET_ALGERIAN_WILAYAS } from '@/integration/graphql/locations.graphql'
import { ALGERIA_STATES } from '@/shared/constants/algeriaStates.js'
import ShippingSelector from '@/components/ShippingSelector.vue'

// Router
const router = useRouter()

// Stores
const cartStore = useCartStore()
const shippingStore = useShippingStore()
const toast = useToast()

// Form refs
const customerForm = ref(null)
const shippingForm = ref(null)
const paymentForm = ref(null)

// Form data
const customerInfo = ref({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  address: ''
})

const shippingInfo = ref({
  wilayaId: null,
  deliveryType: 'home'
})

const paymentInfo = ref({
  method: 'cod'
})

const orderNotes = ref('')
const isPlacingOrder = ref(false)

// Coupon related data
const couponCode = ref('')
const appliedCoupon = ref(null)
const couponDiscount = ref(0)
const isApplyingCoupon = ref(false)
const couponError = ref('')

// GraphQL Query with 2-second fallback to algeriaStates.js
const wilayasQuery = useQuery(GET_ALGERIAN_WILAYAS)
const isUsingFallback = ref(false)
const fallbackWilayas = ref([])

// Race condition timer: if GraphQL takes > 2 seconds, use fallback
const raceConditionTimer = ref(null)

// Start race condition timer when component mounts
onMounted(() => {
  raceConditionTimer.value = setTimeout(() => {
    if (wilayasQuery.loading.value) {
      console.log('GraphQL timeout (2s) - switching to algeriaStates.js fallback')
      isUsingFallback.value = true
      fallbackWilayas.value = ALGERIA_STATES.map(state => ({
        id: state.id,
        wilayaId: state.code,
        nameAr: state.nameAr,
        nameFr: state.nameFr,
        nameEn: state.name,
        code: state.code,
        isActive: true,
        freeShippingMinimum: null,
        title: `${state.nameAr} (${state.code})`
      }))
    }
  }, 2000)
})

// Clean up timer on unmount
onUnmounted(() => {
  if (raceConditionTimer.value) {
    clearTimeout(raceConditionTimer.value)
  }
})

// Computed property that handles both GraphQL and fallback data
const availableWilayas = computed(() => {
  if (isUsingFallback.value) {
    return fallbackWilayas.value
  }
  
  if (wilayasQuery.data.value?.algerianWilayas) {
    return wilayasQuery.data.value.algerianWilayas.map(wilaya => ({
      ...wilaya,
      title: `${wilaya.nameAr} (${wilaya.wilayaId})`
    }))
  }
  
  // If GraphQL failed, use fallback
  if (wilayasQuery.error.value) {
    console.warn('GraphQL error for wilayas, using fallback:', wilayasQuery.error.value)
    isUsingFallback.value = true
    fallbackWilayas.value = ALGERIA_STATES.map(state => ({
      id: state.id,
      wilayaId: state.code,
      nameAr: state.nameAr,
      nameFr: state.nameFr,
      nameEn: state.name,
      code: state.code,
      isActive: true,
      freeShippingMinimum: null,
      title: `${state.nameAr} (${state.code})`
    }))
    return fallbackWilayas.value
  }
  
  return []
})

const shippingCost = ref(0)
const selectedShippingMethod = ref(null)
const selectedWilaya = ref(null)

const deliveryTypes = [
  { title: 'Home Delivery', value: 'home' },
  { title: 'Stop Desk', value: 'stop_desk' },
  { title: 'Express', value: 'express' }
]


const canPlaceOrder = computed(() => {
  return (
    cartStore.items.length > 0 &&
    cartStore.unavailableItems.length === 0 &&
    customerInfo.value.firstName &&
    customerInfo.value.lastName &&
    customerInfo.value.phone &&
    customerInfo.value.address &&
    shippingInfo.value.wilayaId &&
    selectedShippingMethod.value &&
    paymentInfo.value.method &&
    (!selectedWilaya.value || selectedWilaya.value.isActive)
  )
})

// Validation rules with Algerian patterns
const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(value) || 'البريد الإلكتروني غير صحيح'
  },
  phone: value => {
    // Algerian phone number pattern: (0|213)?[5-7][0-9]{8}
    const algerianPhonePattern = /^(0|213)?[5-7][0-9]{8}$/
    if (!algerianPhonePattern.test(value)) {
      return 'رقم الهاتف غير صحيح. يجب أن يكون على شكل 0XXXXXXXXX أو +213XXXXXXXXX'
    }
    return true
  },
  postalCode: value => {
    // Algerian postal code pattern: 5 digits
    const algerianPostalCodePattern = /^[0-9]{5}$/
    if (!algerianPostalCodePattern.test(value)) {
      return 'الرمز البريدي غير صحيح. يجب أن يكون 5 أرقام'
    }
    return true
  }
}

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount)
}

function onWilayaChange() {
  // Reset shipping method when wilaya changes
  selectedShippingMethod.value = null
  shippingCost.value = 0
  
  // Update selected wilaya
  selectedWilaya.value = shippingStore.getWilayaByCode(shippingInfo.value.wilayaId)
}

function onShippingMethodSelected(data) {
  selectedShippingMethod.value = data.method
  shippingCost.value = data.cost
}

function onShippingPriceUpdated(cost) {
  shippingCost.value = cost
}

// GraphQL Mutation for shipping calculation
const { mutate: calculateShipping } = useMutation(CALCULATE_SHIPPING_MUTATION)

// GraphQL Mutations for coupon validation and order creation
const VALIDATE_COUPON_MUTATION = gql`
  mutation ValidateCoupon($code: String!, $orderValue: Float!) {
    validateCoupon(code: $code, orderValue: $orderValue) {
      success
      message
      coupon {
        id
        code
        name
        discountType
        discountValue
        maxDiscount
        isActive
        usedCount
        usageLimit
        usageLimitPerUser
        minOrderValue
        maxOrderValue
        validFrom
        validTo
      }
      discountAmount
    }
  }
`;

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder($input: OrderInput!) {
    createOrder(input: $input) {
      success
      message
      order {
        id
        orderNumber
        totalAmount
        status
      }
    }
  }
`;

const { mutate: validateCoupon } = useMutation(VALIDATE_COUPON_MUTATION);
const { mutate: createOrder } = useMutation(CREATE_ORDER_MUTATION);

// Query for payment methods
const { result: paymentMethodsResult } = useQuery(PAYMENT_METHODS_QUERY);

const paymentMethods = computed(() => {
  if (paymentMethodsResult.value?.paymentMethods) {
    return paymentMethodsResult.value.paymentMethods
      .filter(method => method.isActive)
      .map(method => ({
        title: method.name,
        value: method.type
      }));
  }
  return [
    { title: 'Cash on Delivery (COD)', value: 'cod' },
    { title: 'Credit Card', value: 'credit_card' },
    { title: 'Bank Transfer', value: 'bank_transfer' }
  ];
});

// Loading states for double-click prevention
const isPlacingOrder = ref(false)
const isValidatingCoupon = ref(false)
const isCalculatingShipping = ref(false)

// Double-click prevention function
const preventDoubleClick = (loadingRef, callback) => {
  return async (...args) => {
    if (loadingRef.value) {
      console.log('⚠️ Double-click prevented')
      return
    }
    loadingRef.value = true
    try {
      await callback(...args)
    } finally {
      loadingRef.value = false
    }
  }
}

async function updateShippingCost() {
  if (!shippingInfo.value.wilayaId || !shippingInfo.value.deliveryType) {
    shippingCost.value = 0
    return
  }

  try {
    const result = await calculateShipping({
      input: {
        wilayaId: shippingInfo.value.wilayaId,
        deliveryType: shippingInfo.value.deliveryType,
        orderTotal: cartStore.totalBeforeShipping,
        orderWeight: calculateOrderWeight(),
        orderVolume: calculateOrderVolume()
      }
    })

    if (result?.data?.calculateShipping?.success) {
      const data = result.data.calculateShipping
      shippingCost.value = data.shippingCost || 0
    }
  } catch (error) {
    console.error('Error calculating shipping:', error)
  }
}

function calculateOrderWeight() {
  return cartStore.items.reduce((total, item) => {
    // Simple weight calculation (you can enhance this)
    return total + (item.quantity * 0.5) // 0.5kg per item
  }, 0)
}

function calculateOrderVolume() {
  return cartStore.items.reduce((total, item) => {
    if (item.width && item.height) {
      const volume = (item.width * item.height) / 10000 // Convert cm² to m²
      return total + (volume * 0.01) // Assume 1cm thickness
    }
    return total
  }, 0)
}

// Coupon methods
async function applyCoupon() {
  if (!couponCode.value.trim()) {
    couponError.value = 'يرجى إدخال كود الكوبون'
    return
  }

  couponError.value = ''

  try {
    const result = await validateCoupon({
      code: couponCode.value.trim().toUpperCase(),
      orderValue: cartStore.totalBeforeShipping
    })

    if (result?.data?.validateCoupon?.success) {
      const data = result.data.validateCoupon
      appliedCoupon.value = data.coupon
      couponDiscount.value = data.discountAmount
      
      toast({
        title: '✅ تم تطبيق الكوبون',
        text: `خصم ${data.discountAmount} دج`,
        color: 'success',
        timeout: 3000
      })
    } else {
      couponError.value = result?.data?.validateCoupon?.message || 'فشل تطبيق الكوبون'
    }
  } catch (error) {
    console.error('Error applying coupon:', error)
    couponError.value = error.message || 'فشل تطبيق الكوبون'
  } finally {
    isApplyingCoupon.value = false
  }
}

function removeCoupon() {
  appliedCoupon.value = null
  couponDiscount.value = 0
  couponCode.value = ''
  couponError.value = ''
}

async function placeOrder() {
  if (!canPlaceOrder.value) {
    toast({
      title: '❌ خطأ',
      text: 'يرجى تعبئة جميع الحقول المطلوبة',
      color: 'error',
      timeout: 3000
    })
    return
  }

  // isPlacingOrder.value is handled by preventDoubleClick wrapper

  try {
    const orderData = {
      customer_name: `${customerInfo.value.firstName} ${customerInfo.value.lastName}`,
      phone: customerInfo.value.phone,
      email: customerInfo.value.email,
      shipping_address: customerInfo.value.address,
      wilaya_id: shippingInfo.value.wilayaId,
      shipping_method_id: selectedShippingMethod.value?.id,
      payment_method: paymentInfo.value.method,
      notes: orderNotes.value,
      coupon_code: appliedCoupon.value ? appliedCoupon.value.code : null,
      items: cartStore.items.map(item => ({
        product_id: item.product.id,
        material_id: item.material?.id,
        width: item.width,
        height: item.height,
        dimension_unit: item.dimensionUnit,
        quantity: item.quantity,
        options: item.options
      }))
    }

    const result = await createOrder({ input: orderData })

    if (result?.data?.createOrder?.success) {
      const order = result.data.createOrder.order
      
      // Clear cart
      await cartStore.clearCart()
      
      // Show success message
      toast({
        title: '✅ تم إنشاء الطلب',
        text: `طلب رقم ${order.orderNumber} تم إنشاؤه بنجاح`,
        color: 'success',
        timeout: 5000
      })
      
      // Redirect to order confirmation
      router.push(`/orders/${order.id}`)
    } else {
      throw new Error(result?.data?.createOrder?.message || 'فشل إنشاء الطلب')
    }
  } catch (error) {
    console.error('Error placing order:', error)
    
    toast({
      title: '❌ خطأ',
      text: error.message || 'فشل إنشاء الطلب',
      color: 'error',
      timeout: 5000
    })
  }
  // isPlacingOrder.value = false is handled by preventDoubleClick wrapper
}

function getAuthToken() {
  return localStorage.getItem('auth_token') || ''
}


function getAuthToken() {
  return localStorage.getItem('auth_token') || ''
}

// Lifecycle
onMounted(() => {
  // Initialize stores
  cartStore.initialize()
  shippingStore.initialize()
  
  // Pre-fill customer info if available
  // This would come from user profile
})
</script>

<style scoped>
.position-sticky {
  position: sticky;
}

.price-summary {
  font-size: 0.9rem;
}

@media (max-width: 960px) {
  .position-sticky {
    position: relative;
    top: 0;
  }
}
</style>
