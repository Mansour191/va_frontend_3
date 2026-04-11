<template>
  <v-main class="cart-page">
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
            <v-icon class="me-2">mdi-shopping-cart</v-icon>
            {{ $t('cart') || 'السلة' }}
          </h1>
        </v-card-title>

        <v-divider />

        <!-- Empty State -->
        <v-card-text v-if="cartItems.length === 0" class="text-center py-12">
          <v-icon size="80" color="primary" class="mb-4">mdi-shopping-basket</v-icon>
          <h3 class="text-h5 mb-2">{{ $t('emptyCart') || 'سلتك فارغة حالياً' }}</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ $t('emptyCartMessage') || 'ابدأ بالتسوق لإضافة منتجات إلى سلتك' }}
          </p>
          <v-btn
            color="primary"
            prepend-icon="mdi-shopping-bag"
            to="/shop"
            size="large"
          >
            {{ $t('shopNow') || 'التسوق الآن' }}
          </v-btn>
        </v-card-text>

        <!-- Cart Content -->
        <v-card-text v-else class="pa-6">
          <v-row>
            <!-- Cart Items -->
            <v-col cols="12" md="8">
              <v-card class="cart-items-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-shopping-cart</v-icon>
                  المنتجات في السلة ({{ cartItems.length }})
                </v-card-title>
                
                <v-divider />

                <v-card-text class="pa-0">
                  <v-list>
                    <v-list-item
                      v-for="item in cartItems"
                      :key="item.id"
                      class="cart-item"
                    >
                      <template v-slot:prepend>
                        <v-avatar size="80" rounded="lg">
                          <v-img
                            :src="item.image"
                            :alt="item.name"
                            cover
                          />
                        </v-avatar>
                      </template>

                      <v-list-item-content>
                        <v-list-item-title class="text-h6 mb-1">{{ item.name }}</v-list-item-title>
                        <v-list-item-subtitle class="text-body-2 mb-2">
                          {{ $t(item.category) || item.category }}
                        </v-list-item-subtitle>
                        
                        <div class="d-flex align-center gap-4">
                          <div class="price-info">
                            <div v-if="item.discount" class="d-flex align-center gap-2">
                              <span class="text-body-2 text-decoration-line-through text-medium-emphasis">
                                {{ formatCurrency(item.originalPrice) }}
                              </span>
                              <span class="text-h6 font-weight-bold text-primary">
                                {{ formatCurrency(item.price) }}
                              </span>
                            </div>
                            <div v-else class="text-h6 font-weight-bold text-primary">
                              {{ formatCurrency(item.price) }}
                            </div>
                          </div>
                          
                          <div class="quantity-controls">
                            <v-btn
                              icon="mdi-minus"
                              size="small"
                              variant="outlined"
                              @click="updateQuantity(item.id, item.quantity - 1)"
                              :disabled="item.quantity <= 1"
                            />
                            <v-text-field
                              v-model.number="item.quantity"
                              type="number"
                              min="1"
                              max="99"
                              variant="outlined"
                              density="compact"
                              hide-details
                              class="quantity-input mx-2"
                              style="width: 60px"
                              @change="updateQuantity(item.id, item.quantity)"
                            />
                            <v-btn
                              icon="mdi-plus"
                              size="small"
                              variant="outlined"
                              @click="updateQuantity(item.id, item.quantity + 1)"
                              :disabled="item.quantity >= 99"
                            />
                          </div>
                        </div>
                      </v-list-item-content>

                      <template v-slot:append>
                        <div class="d-flex flex-column align-center gap-2">
                          <div class="item-total text-h6 font-weight-bold text-primary">
                            {{ formatCurrency(item.price * item.quantity) }}
                          </div>
                          <v-btn
                            icon="mdi-delete"
                            size="small"
                            variant="text"
                            color="error"
                            @click="removeFromCart(item.id)"
                          />
                        </div>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>

            <!-- Order Summary -->
            <v-col cols="12" md="4">
              <v-card class="order-summary-card" elevation="2">
                <v-card-title class="text-h6">
                  <v-icon class="me-2">mdi-receipt</v-icon>
                  {{ $t('orderSummary') || 'ملخص الطلب' }}
                </v-card-title>
                
                <v-divider />

                <v-card-text>
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

                  <!-- Promo Code -->
                  <v-divider class="my-4" />
                  
                  <v-form @submit.prevent="applyPromoCode" class="promo-code-form">
                    <v-text-field
                      v-model="promoCode"
                      :label="$t('promoCode') || 'كود الخصم'"
                      variant="outlined"
                      density="compact"
                      append-inner-icon="mdi-tag"
                      :loading="applyingPromo"
                    >
                      <template v-slot:append>
                        <v-btn
                          type="submit"
                          variant="text"
                          color="primary"
                          :disabled="!promoCode"
                          :loading="applyingPromo"
                        >
                          تطبيق
                        </v-btn>
                      </template>
                    </v-text-field>
                  </v-form>
                </v-card-text>

                <v-divider />

                <v-card-actions class="pa-4">
                  <v-btn
                    color="primary"
                    variant="elevated"
                    size="large"
                    block
                    prepend-icon="mdi-credit-card"
                    @click="proceedToCheckout"
                  >
                    {{ $t('proceedToCheckout') || 'متابعة الدفع' }}
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CartService from '@/integration/services/CartService';

// Reactive data
const overlayActive = ref(true);
const loading = ref(false);
const applyingPromo = ref(false);
const promoCode = ref('');
const cartItems = ref([]);

// Computed
const subtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

const shippingCost = computed(() => {
  return subtotal.value > 15000 ? 0 : 800; // شحن مجاني فوق 15000 د.ج
});

const discountAmount = computed(() => {
  return cartItems.value.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);
});

const total = computed(() => {
  return subtotal.value + shippingCost.value - discountAmount.value;
});

// Methods
const loadCart = async () => {
  loading.value = true;
  try {
    const items = await CartService.getCartItems();
    cartItems.value = items;
    console.log('✅ Cart loaded from API:', items);
  } catch (error) {
    console.error('❌ Error loading cart:', error);
    cartItems.value = CartService.getFallbackCartItems();
  } finally {
    loading.value = false;
  }
};

const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1 || newQuantity > 99) return;
  
  try {
    await CartService.updateCartItem(itemId, { quantity: newQuantity });
    const item = cartItems.value.find(item => item.id === itemId);
    if (item) {
      item.quantity = newQuantity;
    }
    console.log('✅ Cart item quantity updated:', itemId, newQuantity);
  } catch (error) {
    console.error('❌ Error updating cart item quantity:', error);
  }
};

const removeFromCart = async (itemId) => {
  try {
    await CartService.removeFromCart(itemId);
    cartItems.value = cartItems.value.filter(item => item.id !== itemId);
    console.log('✅ Item removed from cart:', itemId);
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
  }
};

const applyPromoCode = async () => {
  if (!promoCode.value) return;
  
  applyingPromo.value = true;
  try {
    const result = await CartService.applyPromoCode(promoCode.value);
    if (result.success) {
      // Update cart items with new prices
      cartItems.value = result.updatedItems;
      promoCode.value = '';
      console.log('✅ Promo code applied successfully');
    } else {
      console.error('❌ Invalid promo code');
    }
  } catch (error) {
    console.error('❌ Error applying promo code:', error);
  } finally {
    applyingPromo.value = false;
  }
};

const proceedToCheckout = () => {
  // Navigate to checkout
  console.log('Proceeding to checkout...');
  // router.push('/checkout');
};

onMounted(() => {
  loadCart();
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

.cart-item {
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(var(--v-theme-surface-variant), 0.05);
}

.quantity-controls {
  display: flex;
  align-items: center;
}

.quantity-input :deep(.v-field__input) {
  text-align: center;
}

.item-total {
  min-width: 100px;
  text-align: center;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
  
  .quantity-controls {
    flex-direction: column;
    gap: 8px;
  }
  
  .item-total {
    min-width: auto;
  }
}
</style>
