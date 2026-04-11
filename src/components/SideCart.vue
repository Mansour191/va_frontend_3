<template>
  <v-navigation-drawer
    v-model="drawer"
    location="end"
    temporary
    width="450"
    class="side-cart"
    :class="{ 'has-items': !cartStore.isEmpty }"
  >
    <!-- Header -->
    <v-card class="h-100 d-flex flex-column">
      <v-card-title class="pa-4 border-b">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center">
            <v-icon class="me-2" color="primary">mdi-shopping-outline</v-icon>
            <span class="text-h6">السلة التسوق</span>
            <v-chip
              v-if="cartStore.totalItems > 0"
              size="small"
              color="primary"
              class="ms-2"
            >
              {{ cartStore.totalItems }}
            </v-chip>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="drawer = false"
          ></v-btn>
        </div>
      </v-card-title>

      <!-- Cart Items -->
      <v-card-text class="pa-0 flex-grow-1 overflow-y-auto" style="max-height: 400px;">
        <div v-if="cartStore.isLoading" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-4 text-body-2">جاري التحميل...</div>
        </div>

        <div v-else-if="cartStore.isEmpty" class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">
            mdi-cart-outline
          </v-icon>
          <div class="text-h6 mb-2">السلة فارغة</div>
          <div class="text-body-2 text-medium-emphasis mb-4">
            أضف بعض المنتجات للبدء
          </div>
          <v-btn
            color="primary"
            variant="outlined"
            @click="closeCartAndNavigate('/products')"
          >
            <v-icon start>mdi-shopping</v-icon>
            تسوق الآن
          </v-btn>
        </div>

        <div v-else>
          <!-- Available Items -->
          <div v-for="item in cartStore.availableItems" :key="item.id" class="cart-item">
            <v-card variant="outlined" class="ma-2">
              <div class="d-flex">
                <!-- Product Image -->
                <v-avatar
                  size="80"
                  class="me-3 flex-shrink-0"
                  :image="item.product.images[0]?.imageUrl"
                >
                  <v-img v-if="!item.product.images[0]?.imageUrl" src="/placeholder-product.jpg"></v-img>
                </v-avatar>

                <!-- Product Details -->
                <div class="flex-grow-1">
                  <div class="d-flex align-start justify-space-between">
                    <div class="flex-grow-1">
                      <h6 class="text-subtitle-1 font-weight-medium mb-1">
                        {{ item.product.nameAr || item.product.nameEn }}
                      </h6>
                      
                      <!-- Material Info -->
                      <div v-if="item.material" class="text-caption text-medium-emphasis mb-2">
                        المادة: {{ item.material.nameAr || item.material.nameEn }}
                      </div>

                      <!-- Dimensions from options JSON -->
                      <div v-if="item.dimensions" class="text-caption text-medium-emphasis mb-2">
                        {{ item.dimensions }}
                      </div>

                      <!-- Price -->
                      <div class="d-flex align-center mb-2">
                        <span class="text-h6 font-weight-bold primary--text">
                          {{ formatCurrency(item.subtotal) }}
                        </span>
                        <v-chip
                          v-if="item.discountAmount > 0 || item.couponDiscount > 0"
                          size="x-small"
                          color="success"
                          class="ms-2"
                        >
                          -{{ formatCurrency(item.discountAmount + item.couponDiscount) }}
                        </v-chip>
                      </div>
                    </div>

                    <!-- Remove Button -->
                    <v-btn
                      icon="mdi-close"
                      size="small"
                      variant="text"
                      color="error"
                      @click="removeItem(item.id)"
                      :loading="cartStore.isUpdating"
                    ></v-btn>
                  </div>

                  <!-- Quantity Controls -->
                  <div class="d-flex align-center justify-space-between">
                    <div class="d-flex align-center">
                      <v-btn
                        icon="mdi-minus"
                        size="small"
                        variant="outlined"
                        :disabled="item.quantity <= 1 || cartStore.isUpdating"
                        @click="updateQuantity(item.id, item.quantity - 1)"
                        :loading="cartStore.isUpdating"
                      ></v-btn>
                      
                      <v-text-field
                        v-model.number="item.quantity"
                        type="number"
                        variant="outlined"
                        density="compact"
                        hide-details
                        class="mx-2 quantity-input"
                        min="1"
                        :max="item.maxQuantity"
                        style="width: 80px;"
                        @update:model-value="updateQuantity(item.id, $event)"
                        :disabled="cartStore.isUpdating"
                      ></v-text-field>
                      
                      <v-btn
                        icon="mdi-plus"
                        size="small"
                        variant="outlined"
                        :disabled="item.quantity >= item.maxQuantity || cartStore.isUpdating"
                        @click="updateQuantity(item.id, item.quantity + 1)"
                        :loading="cartStore.isUpdating"
                      ></v-btn>
                    </div>

                    <!-- Stock Warning -->
                    <div v-if="!item.isAvailable" class="text-caption error--text">
                      <v-icon size="small" start>mdi-alert</v-icon>
                      متوفر {{ item.maxQuantity }} فقط
                    </div>
                  </div>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Unavailable Items Warning -->
          <v-alert
            v-if="cartStore.unavailableItems.length > 0"
            type="warning"
            variant="tonal"
            class="ma-2"
            closable
          >
            <template v-slot:prepend>
              <v-icon>mdi-alert</v-icon>
            </template>
            <div class="text-body-2">
              <strong>{{ cartStore.unavailableItems.length }} منتجات غير متوفرة حالياً</strong>
              <br>
              يرجى تعديل الكمية أو إزالة هذه المنتجات من السلة
            </div>
          </v-alert>
        </div>
      </v-card-text>

      <!-- Cart Summary -->
      <v-card-actions v-if="!cartStore.isEmpty" class="pa-4 border-t flex-column">
        <!-- Coupon Input -->
        <div class="w-100 mb-4">
          <v-text-field
            v-model="couponCode"
            label="كود الخصم"
            variant="outlined"
            prepend-inner-icon="mdi-ticket-percent"
            append-inner-icon="mdi-send"
            clearable
            @click:append-inner="applyCoupon"
            @keyup.enter="applyCoupon"
            :disabled="cartStore.isUpdating"
            :loading="cartStore.isUpdating"
          ></v-text-field>
          
          <div v-if="cartStore.appliedCoupon" class="mt-2">
            <v-chip color="success" variant="flat" closable @click:close="removeCoupon">
              <v-icon start>mdi-check</v-icon>
              {{ cartStore.appliedCoupon.code }} - {{ formatCurrency(cartStore.couponDiscount) }}
            </v-chip>
          </div>
        </div>

        <!-- Shipping Selection -->
        <div class="w-100 mb-4">
          <v-select
            v-model="selectedWilaya"
            :items="availableWilayas"
            item-title="nameAr"
            item-value="wilayaId"
            label="الولاية"
            variant="outlined"
            prepend-inner-icon="mdi-map-marker"
            clearable
            @update:model-value="updateShipping"
            :disabled="cartStore.isUpdating"
            :loading="cartStore.isUpdating"
          ></v-select>

          <v-radio-group
            v-model="deliveryType"
            inline
            class="mt-2"
            @update:model-value="updateShippingType"
            :disabled="cartStore.isUpdating"
          >
            <v-radio label="توصيل للمنزل" value="home"></v-radio>
            <v-radio label="نقطة استلام" value="stop_desk"></v-radio>
            <v-radio
              v-if="selectedWilayaInfo?.expressDeliveryPrice"
              label="توصيل سريع"
              value="express"
            ></v-radio>
          </v-radio-group>
        </div>

        <!-- Price Summary -->
        <div class="w-100">
          <v-divider class="mb-3"></v-divider>
          
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

          <div class="d-flex justify-space-between mb-2">
            <span>الشحن:</span>
            <span class="font-weight-medium">
              {{ cartStore.shippingCost > 0 ? formatCurrency(cartStore.shippingCost) : 'مجاني' }}
            </span>
          </div>

          <v-divider class="mb-3"></v-divider>

          <div class="d-flex justify-space-between">
            <span class="text-h6 font-weight-bold">الإجمالي:</span>
            <span class="text-h6 font-weight-bold primary--text">
              {{ formatCurrency(cartStore.total) }}
            </span>
          </div>

          <!-- Free Shipping Notice -->
          <div
            v-if="selectedWilayaInfo?.freeShippingMinimum && 
                   cartStore.totalBeforeShipping >= selectedWilayaInfo.freeShippingMinimum"
            class="mt-3"
          >
            <v-chip color="success" variant="flat" size="small">
              <v-icon start>mdi-truck-delivery</v-icon>
              الشحن مجاني!
            </v-chip>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="w-100 mt-4 d-flex gap-2">
          <v-btn
            variant="outlined"
            @click="clearCart"
            :disabled="cartStore.isUpdating"
            :loading="cartStore.isUpdating"
          >
            <v-icon start>mdi-delete-sweep</v-icon>
            مسح السلة
          </v-btn>
          
          <v-btn
            color="primary"
            size="large"
            @click="proceedToCheckout"
            :disabled="cartStore.unavailableItems.length > 0 || cartStore.isUpdating"
            :loading="cartStore.isUpdating"
            block
          >
            <v-icon start>mdi-cash-register</v-icon>
            إتمام الطلب
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useShippingStore } from '@/stores/shipping'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// Router
const router = useRouter()

// Stores
const cartStore = useCartStore()
const shippingStore = useShippingStore()

// Local state
const drawer = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const couponCode = ref('')
const selectedWilaya = ref(null)
const deliveryType = ref('home')

// Computed
const availableWilayas = computed(() => {
  return shippingStore.wilayas.filter(wilaya => wilaya.isActive)
})

const selectedWilayaInfo = computed(() => {
  if (!selectedWilaya.value) return null
  return availableWilayas.value.find(w => w.wilayaId === selectedWilaya.value)
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount)
}

async function updateQuantity(itemId, quantity) {
  if (quantity < 1) return
  
  await cartStore.updateQuantity(itemId, quantity)
}

async function removeItem(itemId) {
  await cartStore.removeFromCart(itemId)
}

async function applyCoupon() {
  if (!couponCode.value.trim()) return
  
  await cartStore.applyCoupon(couponCode.value.trim())
  couponCode.value = ''
}

function removeCoupon() {
  cartStore.appliedCoupon = null
  cartStore.couponDiscount = 0
}

async function updateShipping() {
  if (selectedWilaya.value) {
    const wilaya = availableWilayas.value.find(w => w.wilayaId === selectedWilaya.value)
    await cartStore.setShipping(wilaya, deliveryType.value)
  }
}

async function updateShippingType(type) {
  deliveryType.value = type
  if (selectedWilaya.value) {
    const wilaya = availableWilayas.value.find(w => w.wilayaId === selectedWilaya.value)
    await cartStore.setShipping(wilaya, type)
  }
}

async function clearCart() {
  if (confirm('هل أنت متأكد من مسح السلة؟')) {
    await cartStore.clearCart()
    couponCode.value = ''
    selectedWilaya.value = null
  }
}

function closeCartAndNavigate(path) {
  drawer.value = false
  router.push(path)
}

function proceedToCheckout() {
  if (cartStore.unavailableItems.length > 0) {
    alert('يرجى تعديل المنتجات غير المتوفرة أولاً')
    return
  }
  
  drawer.value = false
  router.push('/checkout')
}

// Watch for store changes
watch(() => cartStore.selectedWilaya, (newWilaya) => {
  if (newWilaya) {
    selectedWilaya.value = newWilaya.wilayaId
  }
})

watch(() => cartStore.deliveryType, (newType) => {
  deliveryType.value = newType
})

// Lifecycle
onMounted(() => {
  // Initialize stores
  cartStore.initialize()
  shippingStore.initialize()
  
  // Sync local state with store
  if (cartStore.selectedWilaya) {
    selectedWilaya.value = cartStore.selectedWilaya.wilayaId
  }
  deliveryType.value = cartStore.deliveryType
})
</script>

<style scoped>
.side-cart {
  border-left: 1px solid rgba(var(--v-border-color), 0.12);
}

.side-cart.has-items {
  border-left-color: var(--v-primary-color);
}

.cart-item {
  transition: all 0.2s ease;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quantity-input :deep(.v-field__control) {
  text-align: center;
}

.v-navigation-drawer--temporary {
  z-index: 1006;
}

@media (max-width: 600px) {
  .side-cart {
    width: 100% !important;
  }
}
</style>
