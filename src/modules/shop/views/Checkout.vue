<template>
  <v-main class="checkout-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <h1 class="text-h4 font-weight-bold">
            <v-icon class="me-2">mdi-credit-card</v-icon>
            {{ $t('checkout') || 'الدفع' }}
          </h1>
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-6">
          <v-row>
            <!-- Billing Details -->
            <v-col cols="12" md="7">
              <v-card class="billing-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-account-details</v-icon>
                  {{ $t('billingDetails') || 'تفاصيل الشحن والدفع' }}
                </v-card-title>
                
                <v-divider />

                <v-card-text>
                  <v-form ref="checkoutForm" v-model="formValid">
                    <v-row>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="form.firstName"
                          :label="$t('firstName') || 'الاسم الأول'"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                      <v-col cols="12" sm="6">
                        <v-text-field
                          v-model="form.lastName"
                          :label="$t('lastName') || 'الاسم الأخير'"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="form.email"
                          :label="$t('email')"
                          variant="outlined"
                          type="email"
                          :rules="[v => !!v || 'هذا الحقل مطلوب', v => /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صالح']"
                          required
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="form.phone"
                          :label="$t('phone')"
                          variant="outlined"
                          type="tel"
                          :placeholder="$t('phonePlaceholder') || '05 / 06 / 07 ...'"
                          :rules="[v => !!v || 'هذا الحقل مطلوب', v => /^(05|06|07)\d{8}$/.test(v) || 'رقم هاتف غير صالح']"
                          required
                        />
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-model="form.address"
                          :label="$t('address')"
                          variant="outlined"
                          :rules="[v => !!v || 'هذا الحقل مطلوب']"
                          required
                        />
                      </v-col>
                    </v-row>

                    <!-- Shipping Selection -->
                    <v-divider class="my-4" />
                    
                    <div class="shipping-selection mb-4">
                      <ShippingSelector
                        :order-total="subtotal"
                        @shipping-selected="onShippingSelected"
                        @price-change="onShippingPriceChange"
                      />
                    </div>

                    <!-- Payment Method -->
                    <v-divider class="my-4" />
                    
                    <h6 class="text-h6 mb-4">{{ $t('paymentMethod') || 'طريقة الدفع' }}</h6>
                    
                    <v-radio-group v-model="form.paymentMethod" class="payment-methods">
                      <v-radio 
                        v-for="method in activePaymentMethods" 
                        :key="method.id"
                        :value="method.id"
                        class="payment-option"
                      >
                        <template v-slot:label>
                          <div class="d-flex align-center">
                            <v-icon :icon="method.display_icon" class="me-3" />
                            <div>
                              <div class="text-body-1">{{ method.name }}</div>
                              <div class="text-caption text-medium-emphasis">{{ getPaymentTypeLabel(method.payment_type) }}</div>
                            </div>
                            <v-tooltip
                              v-if="method.instructions"
                              :text="method.instructions"
                              location="top"
                            >
                              <template v-slot:activator="{ props }">
                                <v-btn
                                  v-bind="props"
                                  icon="mdi-information"
                                  size="small"
                                  variant="text"
                                  color="primary"
                                  class="ms-2"
                                ></v-btn>
                              </template>
                            </v-tooltip>
                          </div>
                        </template>
                      </v-radio>
                    </v-radio-group>

                    <!-- Coupon Section -->
                    <v-divider class="my-4" />
                    
                    <div class="coupon-section mb-4">
                      <h6 class="text-h6 mb-3">{{ $t('haveCouponCode') || 'هل لديك كود خصم؟' }}</h6>
                      
                      <div class="d-flex ga-2">
                        <v-text-field
                          v-model="couponCode"
                          :label="$t('couponCode') || 'كود الخصم'"
                          variant="outlined"
                          prepend-inner-icon="mdi-ticket-percent"
                          :loading="validatingCoupon"
                          :error-messages="couponError"
                          :success-messages="couponSuccess"
                          @keyup.enter="applyCoupon"
                          clearable
                        ></v-text-field>
                        
                        <v-btn
                          color="primary"
                          variant="elevated"
                          :loading="validatingCoupon"
                          :disabled="!couponCode || validatingCoupon"
                          @click="applyCoupon"
                          height="56"
                        >
                          {{ $t('applyCoupon') || 'تطبيق' }}
                        </v-btn>
                      </div>
                      
                      <!-- Applied Coupon Display -->
                      <v-card
                        v-if="appliedCoupon"
                        variant="tonal"
                        color="success"
                        class="mt-3"
                      >
                        <v-card-text class="pa-3">
                          <div class="d-flex align-center justify-space-between">
                            <div class="d-flex align-center ga-2">
                              <v-icon color="success">mdi-check-circle</v-icon>
                              <div>
                                <div class="text-body-2 font-weight-medium">
                                  {{ $t('couponApplied') || 'تم تطبيق الكوبون' }}
                                </div>
                                <div class="text-caption">
                                  {{ appliedCoupon.code }} - {{ formatCurrency(appliedCoupon.discount_amount) }}
                                </div>
                              </div>
                            </div>
                            <v-btn
                              icon="mdi-close"
                              size="small"
                              variant="text"
                              @click="removeCoupon"
                            ></v-btn>
                          </div>
                        </v-card-text>
                      </v-card>
                    </div>

                    <!-- Order Notes -->
                    <v-divider class="my-4" />
                    
                    <v-textarea
                      v-model="form.notes"
                      :label="$t('orderNotes') || 'ملاحظات الطلب'"
                      variant="outlined"
                      rows="3"
                      :placeholder="$t('orderNotesPlaceholder') || 'أي ملاحظات خاصة بالطلب...'"
                    />
                  </v-form>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Order Summary -->
            <v-col cols="12" md="5">
              <v-card class="order-summary-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-receipt</v-icon>
                  {{ $t('orderSummary') || 'ملخص الطلب' }}
                </v-card-title>
                
                <v-divider />

                <v-card-text>
                  <!-- Cart Items -->
                  <div class="cart-items mb-4">
                    <v-list density="compact">
                      <v-list-item
                        v-for="item in cartItems"
                        :key="item.id"
                        class="cart-summary-item"
                      >
                        <template v-slot:prepend>
                          <v-avatar size="40" rounded>
                            <v-img
                              :src="item.image"
                              :alt="item.name"
                              cover
                            />
                          </v-avatar>
                        </template>

                        <v-list-item-content>
                          <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ $t('quantity') || 'الكمية' }}: {{ item.quantity }}
                          </v-list-item-subtitle>
                        </v-list-item-content>

                        <template v-slot:append>
                          <span class="text-body-2 font-weight-bold">
                            {{ formatCurrency(item.price * item.quantity) }}
                          </span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- Price Summary -->
                  <v-divider class="my-3" />
                  
                  <v-list density="compact">
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-shopping-bag</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('subtotal') || 'المجموع الفرعي' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2">{{ formatCurrency(subtotal) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-list-item>
                      <template v-slot:prepend>
                        <v-icon>mdi-truck</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('shipping') || 'الشحن' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2">{{ formatCurrency(shippingCost) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-list-item v-if="discountAmount > 0">
                      <template v-slot:prepend>
                        <v-icon>mdi-tag</v-icon>
                      </template>
                      <v-list-item-title>{{ $t('discount') || 'الخصم' }}</v-list-item-title>
                      <template v-slot:append>
                        <span class="text-body-2 text-success">-{{ formatCurrency(discountAmount) }}</span>
                      </template>
                    </v-list-item>
                    
                    <v-divider class="my-2" />
                    
                    <v-list-item>
                      <v-list-item-title class="text-h6 font-weight-bold">
                        {{ $t('total') || 'الإجمالي' }}
                      </v-list-item-title>
                      <template v-slot:append>
                        <span class="text-h5 font-weight-bold text-primary">{{ formatCurrency(total) }}</span>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>

                <v-divider />

                <!-- Submit Button -->
                <v-card-actions class="pa-4">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    prepend-icon="mdi-check"
                    @click="submitOrder"
                    :loading="submitting"
                    :disabled="!formValid || cartItems.length === 0"
                  >
                    {{ $t('placeOrder') || 'تأكيد الطلب' }}
                  </v-btn>
                </v-card-actions>

                <!-- Security Note -->
                <v-card-text class="text-center text-caption text-medium-emphasis">
                  <v-icon size="small" class="me-1">mdi-shield-check</v-icon>
                  {{ $t('securePayment') || 'دفع آمن ومشفر' }}
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import ShippingSelector from '@/shared/components/ShippingSelector.vue'
import { useShipping } from '@/composables/useShipping'
import { useAuth } from '@/composables/useAuth'
import { useAuthStore } from '@/store/auth'
import { useAppConfig } from '@/composables/useAppConfig';
import CartService from '@/shared/services/CartService';
import ShippingService from '@/shared/services/ShippingService';
import NotificationService from '@/shared/services/NotificationService';
import { useGraphQL } from '@/shared/composables/useGraphQL';

const { activePaymentMethods, fetchPaymentMethods } = useAppConfig();
const { executeQuery, executeMutation } = useGraphQL();

// Composables
const store = useStore();
const { validateShippingSelection } = useShipping();
const { user, isAuthenticated } = useAuth();

// Reactive data
const overlayActive = ref(true);
const submitting = ref(false);
const formValid = ref(false);
const checkoutForm = ref(null);
const cartItems = ref([]);
const router = useRouter();
const selectedShipping = ref(null);

// Coupon related data
const couponCode = ref('');
const validatingCoupon = ref(false);
const couponError = ref('');
const couponSuccess = ref('');
const appliedCoupon = ref(null);

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  wilaya: '', // Will be set from shipping selection
  paymentMethod: 'cash_on_delivery',
  notes: ''
});

// Wilayas - Dynamic loading from API
const wilayas = ref([]);

// Payment Methods - Dynamic loading from API
const paymentMethods = ref([]);

// Computed
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const shippingCost = computed(() => {
  return selectedShipping.value ? selectedShipping.value.shippingCost : 0;
});

const discountAmountOriginal = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
});

const discountAmount = computed(() => {
  return appliedCoupon.value ? appliedCoupon.value.discount_amount : 0;
});

const total = computed(() => {
  return subtotal.value + shippingCost.value - discountAmount.value;
});

// Methods
const fetchWilayas = async () => {
  try {
    const { WILAYAS_QUERY } = await import('@/integration/graphql/common.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(WILAYAS_QUERY);
    
    if (data.value && !error.value) {
      wilayas.value = data.value.wilayas.map(wilaya => ({
        id: wilaya.id,
        name: wilaya.name || wilaya.arabicName
      }));
    }
  } catch (error) {
    console.error('Failed to fetch wilayas:', error);
    wilayas.value = [
      { id: '1', name: 'أدرار' },
      { id: '2', name: 'الشلف' },
      { id: '3', name: 'الأغواط' },
      { id: '4', name: 'أم البواقي' },
      { id: '5', name: 'باتنة' },
      { id: '6', name: 'بجاية' },
      { id: '7', name: 'بسكرة' },
      { id: '8', name: 'بشار' },
      { id: '9', name: 'البليدة' },
      { id: '10', name: 'البويرة' },
      { id: '11', name: 'تمنراست' },
      { id: '12', name: 'تبسة' },
      { id: '13', name: 'تلمسان' },
      { id: '14', name: 'تيارت' },
      { id: '15', name: 'تيزي وزو' },
      { id: '16', name: 'الجزائر' },
      { id: '17', name: 'الجلفة' },
      { id: '18', name: 'جيجل' },
      { id: '19', name: 'سوق أهراس' },
      { id: '20', name: 'سيدي بلعباس' },
      { id: '21', name: 'عنابة' },
      { id: '22', name: 'قالمة' },
      { id: '23', name: 'قسنطينة' },
      { id: '24', name: 'المدية' },
      { id: '25', name: 'ميلة' },
      { id: '26', name: 'معسكر' },
      { id: '27', name: 'مسردة' },
      { id: '28', name: 'مستغانم' },
      { id: '29', name: 'المسيلة' },
      { id: '30', name: 'ورقلة' },
      { id: '31', name: 'وهران' },
      { id: '32', name: 'البيض' },
      { id: '33', name: 'إليزي' },
      { id: '34', name: 'برج بوعريريج' },
      { id: '35', name: 'بومرداس' },
      { id: '36', name: 'الطارف' },
      { id: '37', name: 'تندوف' },
      { id: '38', name: 'تميمون' },
      { id: '39', name: 'غرداية' },
      { id: '40', name: 'غليزان' },
      { id: '41', name: 'قايدي بلعباس' },
      { id: '42', name: 'خنشلة' },
      { id: '43', name: 'سطيف' },
      { id: '44', name: 'عين الدفلى' },
      { id: '45', name: 'النعامة' },
      { id: '46', name: 'عين تموشنت' },
      { id: '47', name: 'غرداية' },
      { id: '48', name: 'غليزان' },
      { id: '54', name: 'المنطقة' },
      { id: '55', name: 'نعامة' },
      { id: '56', name: 'تيميمون' },
      { id: '57', name: 'برج بوعريريج' },
      { id: '58', name: 'تلمسان' }
    ];
  }
};

const loadCart = async () => {
  try {
    const items = await CartService.getCartItems();
    cartItems.value = items;
    console.log('✅ Cart loaded for checkout:', items);
  } catch (error) {
    console.error('❌ Error loading cart:', error);
    cartItems.value = CartService.getFallbackCartItems();
  }
};

const getPaymentTypeLabel = (type) => {
  const labels = {
    'cash': t('cashOnDelivery') || 'الدفع عند الاستلام',
    'bank_transfer': t('bankTransfer') || 'تحويل بنكي',
    'wallet': t('electronicWallet') || 'محفظة إلكترونية',
    'card': t('creditCard') || 'بطاقة بنكية',
    'other': t('other') || 'أخرى'
  };
  return labels[type] || type;
};

const submitOrder = async () => {
  if (!formValid.value) return;
  
  // Validate shipping selection
  const shippingValidation = validateShippingSelection();
  if (!shippingValidation.isValid) {
    NotificationService.error(
      'Shipping Error',
      shippingValidation.message
    );
    return;
  }
  
  submitting.value = true;
  try {
    const mutation = `
      mutation CreateOrder($input: OrderInput!, $items: [OrderItemInput!]!) {
        createOrder(input: $input, items: $items) {
          success
          message
          order {
            id
            order_number
            customer_name
            phone
            email
            shipping_address
            wilaya {
              id
              name_ar
            }
            shipping_method {
              id
              name
              base_cost
            }
            subtotal
            shipping_cost
            tax
            discount_amount
            total_amount
            status
            payment_method
            payment_status
            created_at
            updated_at
          }
          errors
        }
      }
    `;
    
    const variables = {
      input: {
        customer_name: `${form.value.firstName} ${form.value.lastName}`,
        phone: form.value.phone,
        email: form.value.email,
        shipping_address: form.value.address,
        wilaya_id: form.value.wilaya,
        shipping_method_id: form.value.shippingMethodId,
        subtotal: subtotal.value,
        shipping_cost: shippingCost.value,
        tax: 0,
        discount_amount: discountAmount.value,
        coupon_code: appliedCoupon.value?.code,
        payment_method: form.value.paymentMethod,
        notes: form.value.notes
      },
      items: cartItems.value.map(item => ({
        product_id: item.productId,
        material_id: item.materialId,
        width: item.width || 10,
        height: item.height || 10,
        dimension_unit: 'cm',
        quantity: item.quantity,
        price: item.price
      }))
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.createOrder?.success) {
      const order = response.data.createOrder.order;
      
      console.log('Order created successfully:', order);
      
      // Show success notification
      NotificationService.success(
        'Order Confirmed',
        `Order #${order.order_number} is now being processed. Thank you!`
      );
      
      // Clear cart
      localStorage.removeItem('cart');
      
      // Navigate to success page
      router.push(`/shop/order-success?orderId=${order.id}`);
    } else {
      const errors = response?.data?.createOrder?.errors || ['Order creation failed'];
      NotificationService.error(
        'Order Creation Failed',
        errors.join(', ')
      );
    }
    
  } catch (error) {
    console.error('Error submitting order:', error);
    NotificationService.error(
      'Order Creation Failed',
      error.message || 'An error occurred while processing your order. Please try again.'
    );
  } finally {
    submitting.value = false;
  }
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

// Coupon methods
const applyCoupon = async () => {
  if (!couponCode.value) return;
  
  validatingCoupon.value = true;
  couponError.value = '';
  couponSuccess.value = '';
  
  try {
    const mutation = `
      mutation ApplyCoupon($input: ApplyCouponInput!) {
        applyCoupon(input: $input) {
          success
          message
          coupon {
            id
            code
            name
            discount_type
            discount_value
            formatted_discount
          }
          discount_amount
        }
      }
    `;
    
    const variables = {
      input: {
        code: couponCode.value,
        order_value: subtotal.value
      }
    };
    
    const response = await executeMutation(mutation, variables);
    
    if (response?.data?.applyCoupon?.success) {
      appliedCoupon.value = {
        ...response.data.applyCoupon.coupon,
        discount_amount: response.data.applyCoupon.discount_amount
      };
      couponSuccess.value = response.data.applyCoupon.message;
      couponCode.value = '';
    } else {
      couponError.value = response?.data?.applyCoupon?.message || 'فشل تطبيق الكوبون';
    }
  } catch (error) {
    console.error('Error applying coupon:', error);
    couponError.value = error.message || 'حدث خطأ أثناء تطبيق الكوبون';
  } finally {
    validatingCoupon.value = false;
  }
};

const removeCoupon = () => {
  appliedCoupon.value = null;
  couponError.value = '';
  couponSuccess.value = '';
};

// Shipping event handlers
const onShippingSelected = (shippingInfo) => {
  selectedShipping.value = shippingInfo;
  form.value.wilaya = shippingInfo.wilayaId;
  form.value.shippingMethodId = shippingInfo.shippingMethodId;
  console.log('Shipping selected:', shippingInfo);
};

const onShippingPriceChange = (newTotal) => {
  // Total will be automatically recalculated
  console.log('💰 Shipping price changed, new total:', newTotal);
};

const populateFormWithUserData = () => {
  if (isAuthenticated.value && user.value) {
    // Populate form with user profile data
    form.value.firstName = user.value.firstName || '';
    form.value.lastName = user.value.lastName || '';
    form.value.email = user.value.email || '';
    form.value.phone = user.value.profile?.phone || '';
    form.value.address = user.value.profile?.address || '';
    
    console.log('✅ Form populated with user data:', user.value);
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchPaymentMethods(),
    fetchWilayas(),
    loadCart()
  ]);
  if (cartItems.value.length === 0) {
    router.push('/shop');
  }
});

</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.cart-summary-item {
  transition: all 0.3s ease;
}

.cart-summary-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.05);
}

.payment-methods :deep(.v-radio) {
  margin-bottom: 16px;
}

.payment-option {
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.payment-option:hover {
  border-color: var(--v-theme-primary);
  background: rgba(var(--v-theme-primary), 0.05);
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
