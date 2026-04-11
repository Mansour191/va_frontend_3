<template>
  <v-main class="order-success-page">
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
        <!-- Success Animation -->
        <v-card-text class="text-center py-12">
          <div class="success-animation mb-8">
            <v-icon 
              size="120" 
              color="success" 
              class="success-icon"
            >
              mdi-check-circle
            </v-icon>
          </div>

          <h1 class="text-h3 font-weight-bold mb-4">
            {{ $t('orderPlaced') || 'تم استلام طلبك بنجاح!' }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-8 max-width-600 mx-auto">
            {{ $t('orderConfirmationEmail') || 'شكراً لك على ثقتك بـ Vinyl Art. تم إرسال تفاصيل الطلب إلى بريدك الإلكتروني.' }}
          </p>

          <!-- Order Details Card -->
          <v-card 
            class="order-details-card mx-auto mb-8" 
            max-width="600"
            elevation="2"
          >
            <v-card-title class="bg-surface pa-4">
              <h5 class="text-h5 mb-0 text-primary">
                <v-icon class="me-2">mdi-receipt</v-icon>
                {{ $t('orderDetails') || 'تفاصيل الطلب' }}
              </h5>
            </v-card-title>
            
            <v-divider />

            <v-card-text class="pa-4">
              <v-list density="compact">
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-pound</v-icon>
                  </template>
                  <v-list-item-title>{{ $t('orderNumber') || 'رقم الطلب' }}</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-body-1 font-weight-bold">#{{ orderId }}</span>
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-calendar</v-icon>
                  </template>
                  <v-list-item-title>{{ $t('orderDate') || 'تاريخ الطلب' }}</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-body-1">{{ new Date().toLocaleDateString('ar-DZ') }}</span>
                  </template>
                </v-list-item>
                
                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-credit-card</v-icon>
                  </template>
                  <v-list-item-title>{{ $t('paymentMethod') || 'طريقة الدفع' }}</v-list-item-title>
                  <template v-slot:append>
                    <v-chip variant="tonal" size="small">
                      {{ getPaymentMethodText(paymentMethod) }}
                    </v-chip>
                  </template>
                </v-list-item>

                <v-list-item>
                  <template v-slot:prepend>
                    <v-icon>mdi-truck</v-icon>
                  </template>
                  <v-list-item-title>{{ $t('shippingAddress') || 'عنوان الشحن' }}</v-list-item-title>
                  <template v-slot:append>
                    <span class="text-body-1 text-end">{{ shippingAddress }}</span>
                  </template>
                </v-list-item>
              </v-list>
              
              <v-divider class="my-4" />
              
              <div class="d-flex justify-space-between align-center">
                <span class="text-h6 font-weight-bold">{{ $t('total') || 'الإجمالي' }}</span>
                <span class="text-h4 font-weight-bold text-primary">{{ total }} د.ج</span>
              </div>
            </v-card-text>
          </v-card>

          <!-- Action Buttons -->
          <div class="actions d-flex justify-center gap-4 flex-wrap">
            <v-btn
              color="primary"
              variant="outlined"
              size="large"
              prepend-icon="mdi-shopping-bag"
              to="/shop"
            >
              {{ $t('continueShopping') || 'مواصلة التسوق' }}
            </v-btn>
            
            <v-btn
              color="primary"
              variant="elevated"
              size="large"
              prepend-icon="mdi-list-ul"
              to="/customer/orders"
            >
              {{ $t('trackOrder') || 'تتبع الطلب' }}
            </v-btn>
          </div>

          <!-- Additional Info -->
          <v-card 
            class="info-card mx-auto mt-8" 
            max-width="600"
            variant="tonal"
            color="info"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-start gap-3">
                <v-icon color="info" class="mt-1">mdi-information</v-icon>
                <div class="text-body-2">
                  <h6 class="text-h6 mb-2">{{ $t('nextSteps') || 'الخطوات التالية' }}</h6>
                  <ul class="text-start">
                    <li>{{ $t('step1') || 'ستصلك رسالة تأكيد عبر البريد الإلكتروني' }}</li>
                    <li>{{ $t('step2') || 'سيتم تجهيز طلبك خلال 24-48 ساعة' }}</li>
                    <li>{{ $t('step3') || 'سيتم إعلامك عند شحن الطلب' }}</li>
                    <li>{{ $t('step4') || 'التسليم المتوقع: 3-5 أيام عمل' }}</li>
                  </ul>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const overlayActive = ref(true);

// Get order details from route params or query
const orderId = ref(route.params.orderId || route.query.orderId || 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase());
const paymentMethod = ref(route.query.paymentMethod || 'cash_on_delivery');
const total = ref(route.query.total || '0');
const shippingAddress = ref(route.query.shippingAddress || '');

// Methods
const getPaymentMethodText = (method) => {
  const methodMap = {
    'cash_on_delivery': 'الدفع عند الاستلام',
    'credit_card': 'بطاقة بنكية',
    'cib': 'CIB',
    'edahabia': 'Edahabia'
  };
  return methodMap[method] || method;
};

onMounted(() => {
  // Load order details if orderId is provided
  if (orderId.value && orderId.value !== 'undefined') {
    console.log('Loading order details for:', orderId.value);
    // In real app, fetch order details from API
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

.success-animation {
  position: relative;
  display: inline-block;
}

.success-icon {
  animation: successPulse 2s ease-in-out infinite;
}

@keyframes successPulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.order-details-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.order-details-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.info-card {
  background: rgba(var(--v-theme-info), 0.1);
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  border-radius: 16px;
}

.actions {
  max-width: 600px;
  margin: 0 auto;
}

.max-width-600 {
  max-width: 600px;
}

.text-end {
  text-align: end;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
  
  .actions {
    flex-direction: column;
    align-items: center;
  }
  
  .actions .v-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>

      <div class="mt-5 p-4 bg-light rounded-lg border-dashed text-muted small mx-auto" style="max-width: 600px">
        <i class="fa-solid fa-info-circle me-2"></i>
        {{ $t('erpSyncNotice') || 'يتم الآن ترحيل طلبك إلى نظام ERPNext الخاص بنا لضمان أسرع عملية توصيل ممكنة.' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const orderId = ref(route.params.orderId || 'ORD-' + Date.now());
const total = ref(route.query.total || 0);
const paymentMethod = ref(route.query.method || 'cod');

const getPaymentMethodText = (method) => {
  const map = {
    cod: 'الدفع عند الاستلام',
    edahabia: 'البطاقة الذهبية (Edahabia)',
    cib: 'بطاقة CIB البنكية',
    card: 'بطاقة دفع إلكتروني'
  };
  return map[method] || method;
};

onMounted(() => {
  // يمكننا هنا التحقق من حالة الدفع فعلياً إذا كان هناك Transaction ID في الرابط
  console.log('✅ تم تحميل صفحة النجاح للطلب:', orderId.value);
});
</script>

<style scoped>
.order-success-page {
  background-color: #fbfbfb;
  min-height: 90vh;
}

.text-gold {
  color: #d4af37;
}

.btn-gold {
  background: linear-gradient(135deg, #d4af37 0%, #f1d592 100%);
  color: #1a1a2e;
  font-weight: 600;
  border: none;
}

.btn-outline-gold {
  color: #d4af37;
  border: 1.5px solid #d4af37;
  font-weight: 600;
}

.btn-outline-gold:hover {
  background-color: rgba(212, 175, 55, 0.05);
  color: #c4a02c;
  border-color: #c4a02c;
}

.border-dashed {
  border: 1px dashed #ddd;
}

/* Success Animation */
.checkmark-circle {
  width: 120px;
  height: 120px;
  position: relative;
  display: inline-block;
  vertical-align: top;
  margin-bottom: 30px;
}

.checkmark-circle .background {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #28a745;
  position: absolute;
}

.checkmark-circle .checkmark {
  border-radius: 5px;
}

.checkmark-circle .checkmark.draw:after {
  animation-duration: 800ms;
  animation-timing-function: ease;
  animation-name: checkmark;
  transform: scaleX(-1) rotate(135deg);
}

.checkmark-circle .checkmark:after {
  opacity: 1;
  height: 60px;
  width: 30px;
  transform-origin: left top;
  border-right: 8px solid #fff;
  border-top: 8px solid #fff;
  content: "";
  left: 25px;
  top: 65px;
  position: absolute;
}

@keyframes checkmark {
  0% {
    height: 0;
    width: 0;
    opacity: 1;
  }
  20% {
    height: 0;
    width: 30px;
    opacity: 1;
  }
  40% {
    height: 60px;
    width: 30px;
    opacity: 1;
  }
  100% {
    height: 60px;
    width: 30px;
    opacity: 1;
  }
}
</style>
