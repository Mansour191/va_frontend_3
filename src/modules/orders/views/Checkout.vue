<template>
  <div class="checkout">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
      <p class="mt-4">جاري معالجة طلبك...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <v-alert type="error" prominent class="mb-4">
        <v-alert-title>خطأ في معالجة الطلب</v-alert-title>
        <div>{{ error }}</div>
        <v-btn color="white" variant="outlined" class="mt-3" @click="resetError">
          إعادة المحاولة
        </v-btn>
      </v-alert>
    </div>

    <!-- Success State -->
    <div v-else-if="orderCreated" class="success-state">
      <v-card class="success-card">
        <v-card-text class="text-center pa-8">
          <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
          <h2 class="success-title">تم إنشاء طلبك بنجاح!</h2>
          <p class="success-message">
            رقم طلبك: <strong>{{ createdOrder.orderNumber }}</strong>
          </p>
          <p class="success-subtitle">
            سيتم إرسال تفاصيل الطلب إلى بريدك الإلكتروني قريباً
          </p>
          <div class="success-actions">
            <v-btn color="primary" @click="viewOrder" class="me-2">
              عرض تفاصيل الطلب
            </v-btn>
            <v-btn color="secondary" variant="outlined" @click="continueShopping">
              متابعة التسوق
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </div>

    <!-- Checkout Form -->
    <div v-else class="checkout-form">
      <v-row>
        <!-- Customer Information -->
        <v-col cols="12" md="8">
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="me-2">mdi-account</v-icon>
              معلومات العميل
            </v-card-title>
            <v-card-text>
              <v-form ref="customerForm" v-model="customerFormValid">
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="orderData.customerName"
                      label="الاسم الكامل"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-account"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="orderData.phone"
                      label="رقم الهاتف"
                      :rules="[rules.required, rules.phone]"
                      outlined
                      prepend-inner-icon="mdi-phone"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="orderData.email"
                      label="البريد الإلكتروني"
                      :rules="[rules.email]"
                      outlined
                      prepend-inner-icon="mdi-email"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Shipping Information -->
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="me-2">mdi-map-marker</v-icon>
              معلومات الشحن
            </v-card-title>
            <v-card-text>
              <v-form ref="shippingForm" v-model="shippingFormValid">
                <v-row>
                  <v-col cols="12">
                    <v-textarea
                      v-model="orderData.shippingAddress"
                      label="عنوان الشحن التفصيلي"
                      :rules="[rules.required]"
                      outlined
                      rows="3"
                      prepend-inner-icon="mdi-home"
                    ></v-textarea>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="orderData.wilayaId"
                      label="الولاية"
                      :items="wilayas"
                      item-title="nameAr"
                      item-value="id"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-map"
                      @update:modelValue="updateShippingCost"
                      :loading="loadingWilayas"
                    ></v-select>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="orderData.paymentMethod"
                      label="طريقة الدفع"
                      :items="paymentMethods"
                      item-title="label"
                      item-value="value"
                      :rules="[rules.required]"
                      outlined
                      prepend-inner-icon="mdi-credit-card"
                    ></v-select>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>

          <!-- Order Notes -->
          <v-card class="mb-4">
            <v-card-title>
              <v-icon class="me-2">mdi-note-text</v-icon>
              ملاحظات الطلب
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="orderData.notes"
                label="ملاحظات إضافية (اختياري)"
                outlined
                rows="3"
                placeholder="أي ملاحظات تود إضافتها لطلبك..."
                prepend-inner-icon="mdi-note"
              ></v-textarea>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Order Summary -->
        <v-col cols="12" md="4">
          <v-card class="order-summary sticky">
            <v-card-title>
              <v-icon class="me-2">mdi-receipt</v-icon>
              ملخص الطلب
            </v-card-title>
            <v-card-text>
              <!-- Cart Items -->
              <div class="cart-items">
                <div
                  v-for="item in cartItems"
                  :key="item.id"
                  class="cart-item"
                >
                  <div class="item-info">
                    <div class="item-name">{{ item.product.nameAr }}</div>
                    <div class="item-details">
                      <span class="item-quantity">{{ item.quantity }}x</span>
                      <span v-if="item.material" class="item-material">
                        {{ item.material.nameAr }}
                      </span>
                      <span v-if="item.width && item.height" class="item-dimensions">
                        {{ item.width }}x{{ item.height }}{{ item.dimensionUnit }}
                      </span>
                    </div>
                  </div>
                  <div class="item-price">
                    {{ formatCurrency(item.price * item.quantity) }}
                  </div>
                </div>
              </div>

              <v-divider class="my-3"></v-divider>

              <!-- Price Breakdown -->
              <div class="price-breakdown">
                <div class="price-item">
                  <span>المجموع الفرعي:</span>
                  <span>{{ formatCurrency(orderData.subtotal) }}</span>
                </div>
                <div class="price-item">
                  <span>تكلفة الشحن:</span>
                  <span>{{ formatCurrency(orderData.shippingCost) }}</span>
                </div>
                <div class="price-item" v-if="orderData.tax > 0">
                  <span>الضريبة:</span>
                  <span>{{ formatCurrency(orderData.tax) }}</span>
                </div>
                <div class="price-item" v-if="orderData.discountAmount > 0">
                  <span>الخصم:</span>
                  <span class="discount">-{{ formatCurrency(orderData.discountAmount) }}</span>
                </div>
                <v-divider class="my-2"></v-divider>
                <div class="price-item total">
                  <span>المجموع:</span>
                  <span>{{ formatCurrency(orderData.totalAmount) }}</span>
                </div>
              </div>

              <!-- Place Order Button -->
              <v-btn
                color="primary"
                size="large"
                block
                class="place-order-btn"
                :disabled="!canPlaceOrder"
                :loading="placingOrder"
                @click="placeOrder"
              >
                <v-icon start>mdi-check-circle</v-icon>
                تأكيد الطلب
              </v-btn>

              <!-- Security Note -->
              <div class="security-note">
                <v-icon size="small" color="success" class="me-1">mdi-shield-check</v-icon>
                <span>معلوماتك آمنة ومشفرة</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useMutation, useQuery } from '@vue/apollo-composable';
import { CREATE_ORDER_MUTATION, SHIPPING_QUERY } from '@/integration/graphql/orders.graphql';
import { useStore } from 'vuex';
import PaymentService from '@/shared/integration/services/PaymentService';

const router = useRouter();
const store = useStore();

// Reactive data
const loading = ref(false);
const placingOrder = ref(false);
const error = ref(null);
const orderCreated = ref(false);
const createdOrder = ref(null);
const customerFormValid = ref(false);
const shippingFormValid = ref(false);
const loadingWilayas = ref(false);

// Form data
const orderData = ref({
  customerName: '',
  phone: '',
  email: '',
  shippingAddress: '',
  wilayaId: null,
  paymentMethod: 'cod',
  notes: '',
  subtotal: 0,
  shippingCost: 0,
  tax: 0,
  discountAmount: 0,
  totalAmount: 0
});

// Cart items from store
const cartItems = computed(() => store.getters['cart/cartItems']);

// Wilayas data
const { result: wilayasResult } = useQuery(SHIPPING_QUERY);
const wilayas = computed(() => wilayasResult.value?.shipping || []);

// Payment methods
const paymentMethods = [
  { label: 'الدفع عند الاستلام (COD)', value: 'cod' },
  { label: 'بطاقة ائتمانية', value: 'card' },
  { label: 'تحويل بنكي', value: 'transfer' },
  { label: 'CCP', value: 'ccp' }
];

// Validation rules
const rules = {
  required: value => !!value || 'هذا الحقل مطلوب',
  email: value => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(value) || 'البريد الإلكتروني غير صحيح';
  },
  phone: value => {
    const pattern = /^[0-9]{8,10}$/;
    return pattern.test(value) || 'رقم الهاتف غير صحيح';
  }
};

// Computed properties
const canPlaceOrder = computed(() => {
  return customerFormValid.value && 
         shippingFormValid.value && 
         cartItems.value.length > 0 &&
         !placingOrder.value;
});

// Methods
const updateShippingCost = () => {
  if (orderData.value.wilayaId) {
    const selectedWilaya = wilayas.value.find(w => w.id === orderData.value.wilayaId);
    if (selectedWilaya) {
      orderData.value.shippingCost = selectedWilaya.homeDeliveryPrice;
      calculateTotal();
    }
  }
};

const calculateTotal = () => {
  // Calculate subtotal from cart items
  const subtotal = cartItems.value.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  orderData.value.subtotal = subtotal;
  orderData.value.totalAmount = subtotal + orderData.value.shippingCost + orderData.value.tax - orderData.value.discountAmount;
};

const placeOrder = async () => {
  if (!canPlaceOrder.value) return;
  
  placingOrder.value = true;
  error.value = null;
  
  try {
    // Prepare order items
    const items = cartItems.value.map(item => ({
      productId: item.product.id,
      materialId: item.material?.id || null,
      width: item.width || 0,
      height: item.height || 0,
      dimensionUnit: item.dimensionUnit || 'cm',
      marbleTexture: item.marbleTexture || '',
      customDesign: item.customDesign || '',
      quantity: item.quantity,
      price: item.price
    }));
    
    // Create order mutation
    const { mutate } = useMutation(CREATE_ORDER_MUTATION);
    const result = await mutate({
      variables: {
        input: {
          customerName: orderData.value.customerName,
          phone: orderData.value.phone,
          email: orderData.value.email,
          shippingAddress: orderData.value.shippingAddress,
          wilayaId: orderData.value.wilayaId,
          subtotal: orderData.value.subtotal,
          shippingCost: orderData.value.shippingCost,
          tax: orderData.value.tax,
          discountAmount: orderData.value.discountAmount,
          paymentMethod: orderData.value.paymentMethod,
          notes: orderData.value.notes
        },
        items: items
      }
    });
    
    if (result.data?.createOrder?.success) {
      const order = result.data.createOrder.order;
      createdOrder.value = order;
      
      // Process payment based on payment method
      if (orderData.value.paymentMethod === 'cod') {
        // Record cash on delivery payment
        await PaymentService.processCashOnDelivery({
          id: order.id,
          total: order.totalAmount,
          paymentMethod: 'cod'
        });
        
        orderCreated.value = true;
        
        // Clear cart
        store.dispatch('cart/clearCart');
        
        // Show success notification
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم إنشاء طلبك بنجاح! الدفع عند الاستلام.'
        });
      } else {
        // Process online payment
        try {
          const paymentResult = await PaymentService.processCardPayment({
            id: order.id,
            total: order.totalAmount,
            paymentMethod: orderData.value.paymentMethod,
            email: orderData.value.email
          });
          
          if (paymentResult.success) {
            // In real implementation, redirect to payment gateway
            // For now, show success
            orderCreated.value = true;
            
            // Clear cart
            store.dispatch('cart/clearCart');
            
            store.dispatch('notifications/showNotification', {
              type: 'success',
              message: 'تم توجيهك إلى بوابة الدفع بنجاح!'
            });
          }
        } catch (paymentError) {
          console.error('Payment processing error:', paymentError);
          error.value = paymentError.message || 'فشل معالجة الدفع';
          
          store.dispatch('notifications/showNotification', {
            type: 'error',
            message: 'فشل معالجة الدفع، يرجى المحاولة مرة أخرى'
          });
        }
      }
    } else {
      throw new Error(result.data?.createOrder?.message || 'فشل إنشاء الطلب');
    }
  } catch (err) {
    console.error('Error creating order:', err);
    error.value = err.message || 'حدث خطأ أثناء إنشاء الطلب';
    
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء إنشاء الطلب'
    });
  } finally {
    placingOrder.value = false;
  }
};

const resetError = () => {
  error.value = null;
};

const viewOrder = () => {
  router.push(`/orders/${createdOrder.value.id}`);
};

const continueShopping = () => {
  router.push('/shop');
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

// Watch cart items for total calculation
watch(cartItems, () => {
  calculateTotal();
}, { deep: true });

// Lifecycle
onMounted(() => {
  // Calculate initial total
  calculateTotal();
  
  // Check if cart is empty
  if (cartItems.value.length === 0) {
    router.push('/cart');
  }
});
</script>

<style scoped>
.checkout {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-state {
  padding: 2rem;
}

.success-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.success-card {
  max-width: 500px;
  width: 100%;
}

.success-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.success-message {
  font-size: 1.125rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.success-subtitle {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.checkout-form {
  max-width: 1200px;
  margin: 0 auto;
}

.order-summary {
  position: sticky;
  top: 2rem;
}

.cart-items {
  margin-bottom: 1rem;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-subtle);
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  margin-right: 1rem;
}

.item-name {
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.item-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.item-quantity {
  background: var(--primary-color);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.item-material {
  background: var(--secondary-color);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.item-dimensions {
  background: var(--accent-color);
  color: white;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.item-price {
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.price-breakdown {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-item.total {
  font-weight: 700;
  font-size: 1.125rem;
  color: var(--primary-color);
  padding-top: 0.5rem;
  border-top: 2px solid var(--border-subtle);
}

.discount {
  color: #4caf50;
}

.place-order-btn {
  margin-top: 1.5rem;
  height: 48px;
  font-weight: 600;
}

.security-note {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .checkout {
    padding: 1rem;
  }
  
  .success-actions {
    flex-direction: column;
  }
  
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .item-info {
    margin-right: 0;
  }
  
  .order-summary {
    position: static;
    margin-top: 2rem;
  }
}
</style>
