<template>
  <v-main class="payments-page">
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
          <v-row align="center" justify="space-between">
            <v-col>
              <div class="header-content">
                <h1 class="text-h4 font-weight-bold mb-2">
                  <v-icon class="me-2">mdi-credit-card</v-icon>
                  طرق الدفع
                </h1>
                <p class="text-body-1 text-medium-emphasis">إدارة بطاقات الدفع وطرق الدفع المحفوظة</p>
              </div>
            </v-col>
            <v-col cols="auto">
              <v-btn
                color="primary"
                prepend-icon="mdi-plus"
                @click="showAddForm = true"
              >
                إضافة طريقة دفع
              </v-btn>
            </v-col>
          </v-row>
        </v-card-title>

        <v-divider />

        <!-- Payment Methods List -->
        <v-card-text class="pa-6">
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12">
            <v-progress-circular
              indeterminate
              color="primary"
              size="48"
              class="mb-4"
            />
            <p class="text-body-1 text-medium-emphasis">جاري تحميل طرق الدفع...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="paymentMethods.length === 0" class="text-center py-12">
            <v-icon size="80" color="primary" class="mb-4">mdi-credit-card</v-icon>
            <h3 class="text-h5 mb-2">لا توجد طرق دفع</h3>
            <p class="text-body-1 text-medium-emphasis mb-4">لم تقم بإضافة أي طرق دفع بعد</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="showAddForm = true"
            >
              إضافة أول طريقة دفع
            </v-btn>
          </div>

          <!-- Payment Methods Grid -->
          <v-row v-else>
            <v-col 
              v-for="method in paymentMethods" 
              :key="method.id" 
              cols="12" 
              md="6"
              lg="4"
            >
              <v-card 
                class="payment-card h-100"
                :class="{ 'default-payment': method.isDefault }"
                elevation="2"
                hover
              >
                <v-card-title class="d-flex align-center justify-space-between">
                  <div>
                    <div class="d-flex align-center mb-2">
                      <v-icon :icon="getPaymentIcon(method.type)" class="me-2" />
                      <span class="text-body-2">{{ getPaymentTypeName(method.type) }}</span>
                    </div>
                    <h3 class="text-h6">{{ method.title }}</h3>
                  </div>
                  <div class="d-flex gap-1">
                    <v-btn
                      v-if="!method.isDefault"
                      size="small"
                      variant="text"
                      color="warning"
                      @click="setDefault(method.id)"
                    >
                      <v-icon>mdi-star</v-icon>
                      افتراضي
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      @click="editPaymentMethod(method)"
                    >
                      <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <v-btn
                      size="small"
                      variant="text"
                      color="error"
                      @click="deletePaymentMethod(method.id)"
                    >
                      <v-icon>mdi-delete</v-icon>
                    </v-btn>
                  </div>
                </v-card-title>

                <v-divider />

                <v-card-text>
                  <!-- Card Details -->
                  <div v-if="method.type === 'card'" class="card-details">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-credit-card</v-icon>
                        </template>
                        <v-list-item-title>**** **** **** {{ method.last4 }}</v-list-item-title>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-account</v-icon>
                        </template>
                        <v-list-item-title>{{ method.cardholderName }}</v-list-item-title>
                        <v-list-item-subtitle>صاحب البطاقة</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-calendar</v-icon>
                        </template>
                        <v-list-item-title>{{ method.expiryMonth }}/{{ method.expiryYear }}</v-list-item-title>
                        <v-list-item-subtitle>تاريخ الانتهاء</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- Bank Details -->
                  <div v-else-if="method.type === 'bank'" class="bank-details">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-bank</v-icon>
                        </template>
                        <v-list-item-title>{{ method.bankName }}</v-list-item-title>
                        <v-list-item-subtitle>اسم البنك</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-account</v-icon>
                        </template>
                        <v-list-item-title>{{ method.accountName }}</v-list-item-title>
                        <v-list-item-subtitle>اسم الحساب</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-numeric</v-icon>
                        </template>
                        <v-list-item-title>{{ method.accountNumber }}</v-list-item-title>
                        <v-list-item-subtitle>رقم الحساب</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="method.iban">
                        <template v-slot:prepend>
                          <v-icon>mdi-bank-transfer</v-icon>
                        </template>
                        <v-list-item-title>{{ method.iban }}</v-list-item-title>
                        <v-list-item-subtitle>IBAN</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>

                  <!-- Wallet Details -->
                  <div v-else-if="method.type === 'wallet'" class="wallet-details">
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-wallet</v-icon>
                        </template>
                        <v-list-item-title>{{ method.walletProvider }}</v-list-item-title>
                        <v-list-item-subtitle>المحفظة</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon>mdi-phone</v-icon>
                        </template>
                        <v-list-item-title>{{ method.phoneNumber }}</v-list-item-title>
                        <v-list-item-subtitle>رقم الهاتف</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </div>
                </v-card-text>

                <v-card-actions v-if="method.isDefault">
                  <v-chip color="warning" variant="tonal" size="small">
                    <v-icon start>mdi-star</v-icon>
                    طريقة الدفع الافتراضية
                  </v-chip>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Add/Edit Payment Method Dialog -->
    <v-dialog v-model="showAddForm" max-width="600" persistent>
      <v-card>
        <v-card-title>
          <span class="text-h5">{{ editingPaymentMethod ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة' }}</span>
        </v-card-title>
        
        <v-card-text>
          <v-form ref="paymentForm" v-model="formValid">
            <!-- Payment Type Selection -->
            <v-select
              v-model="paymentForm.type"
              :items="paymentTypes"
              label="نوع طريقة الدفع"
              variant="outlined"
              :rules="[v => !!v || 'هذا الحقل مطلوب']"
              required
            />

            <!-- Card Fields -->
            <div v-if="paymentForm.type === 'card'">
              <v-text-field
                v-model="paymentForm.title"
                label="اسم البطاقة"
                placeholder="مثلاً: البطاقة الشخصية"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.cardholderName"
                label="الاسم على البطاقة"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.cardNumber"
                label="رقم البطاقة"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب', v => v.length === 16 || 'رقم بطاقة غير صالح']"
                maxlength="16"
                required
              />
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="paymentForm.expiryMonth"
                    label="الشهر"
                    variant="outlined"
                    :rules="[v => !!v || 'هذا الحقل مطلوب', v => (v >= 1 && v <= 12) || 'شهر غير صالح']"
                    maxlength="2"
                    required
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="paymentForm.expiryYear"
                    label="السنة"
                    variant="outlined"
                    :rules="[v => !!v || 'هذا الحقل مطلوب', v => v.length === 2 || 'سنة غير صالحة']"
                    maxlength="2"
                    required
                  />
                </v-col>
              </v-row>
              <v-text-field
                v-model="paymentForm.cvv"
                label="CVV"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب', v => v.length === 3 || 'CVV غير صالح']"
                maxlength="3"
                type="password"
                required
              />
            </div>

            <!-- Bank Fields -->
            <div v-else-if="paymentForm.type === 'bank'">
              <v-text-field
                v-model="paymentForm.title"
                label="اسم الحساب"
                placeholder="مثلاً: حساب البنك الوطني"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.bankName"
                label="اسم البنك"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.accountName"
                label="اسم صاحب الحساب"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.accountNumber"
                label="رقم الحساب"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.iban"
                label="IBAN"
                variant="outlined"
              />
            </div>

            <!-- Wallet Fields -->
            <div v-else-if="paymentForm.type === 'wallet'">
              <v-text-field
                v-model="paymentForm.title"
                label="اسم المحفظة"
                placeholder="مثلاً: محفظة CIB"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-select
                v-model="paymentForm.walletProvider"
                :items="walletProviders"
                label="مزود المحفظة"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
              <v-text-field
                v-model="paymentForm.phoneNumber"
                label="رقم الهاتف"
                variant="outlined"
                :rules="[v => !!v || 'هذا الحقل مطلوب']"
                required
              />
            </div>
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeForm">إلغاء</v-btn>
          <v-btn 
            color="primary" 
            @click="savePaymentMethod"
            :loading="saving"
            :disabled="!formValid"
          >
            {{ editingPaymentMethod ? 'تحديث' : 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import PaymentService from '@/integration/services/PaymentService';

// Reactive data
const overlayActive = ref(true);
const loading = ref(false);
const saving = ref(false);
const showAddForm = ref(false);
const editingPaymentMethod = ref(null);
const formValid = ref(false);
const paymentFormRef = ref(null);

const paymentMethods = ref([]);
const paymentForm = reactive({
  type: '',
  title: '',
  // Card fields
  cardholderName: '',
  cardNumber: '',
  expiryMonth: '',
  expiryYear: '',
  cvv: '',
  // Bank fields
  bankName: '',
  accountName: '',
  accountNumber: '',
  iban: '',
  // Wallet fields
  walletProvider: '',
  phoneNumber: ''
});

// Payment types from API
const paymentTypes = computed(() => [
  { value: 'card', label: 'بطاقة ائتمان', icon: 'mdi-credit-card' },
  { value: 'bank', label: 'تحويل بنكي', icon: 'mdi-bank' },
  { value: 'wallet', label: 'محفظة إلكترونية', icon: 'mdi-wallet' }
]);

// Wallet providers from API
const walletProviders = computed(() => [
  { value: 'cib', label: 'CIB Wallet', icon: 'mdi-cellphone' },
  { value: 'edahabia', label: 'Edahabia', icon: 'mdi-cellphone-android' },
  { value: 'baridimob', label: 'BaridiMob', icon: 'mdi-cellphone-text' }
]);

// Methods
const loadPaymentMethods = async () => {
  loading.value = true;
  try {
    // Fetch from API
    const methods = await PaymentService.getPaymentMethods();
    paymentMethods.value = methods;
    console.log('✅ Payment methods loaded:', methods);
  } catch (error) {
    console.error('❌ Error loading payment methods:', error);
    // Use fallback data if API fails
    paymentMethods.value = PaymentService.getFallbackPaymentMethods();
  } finally {
    loading.value = false;
  }
};

const editPaymentMethod = (method) => {
  editingPaymentMethod.value = method;
  Object.assign(paymentForm, method);
  showAddForm.value = true;
};

const deletePaymentMethod = async (id) => {
  if (confirm('هل أنت متأكد من حذف طريقة الدفع؟')) {
    try {
      await PaymentService.deletePaymentMethod(id);
      paymentMethods.value = paymentMethods.value(method => method.id !== id);
      console.log('✅ Payment method deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting payment method:', error);
    }
  }
};

const setDefault = async (id) => {
  try {
    await PaymentService.setDefaultPaymentMethod(id);
    paymentMethods.value.forEach(method => {
      method.isDefault = method.id === id;
    });
    console.log('✅ Default payment method set:', id);
  } catch (error) {
    console.error('❌ Error setting default payment method:', error);
  }
};

const savePaymentMethod = async () => {
  if (!formValid.value) return;
  
  saving.value = true;
  try {
    let savedMethod;
    
    if (editingPaymentMethod.value) {
      // Update existing method
      savedMethod = await PaymentService.updatePaymentMethod(
        editingPaymentMethod.value.id, 
        paymentForm
      );
      const index = paymentMethods.value.findIndex(m => m.id === editingPaymentMethod.value.id);
      if (index !== -1) {
        paymentMethods.value[index] = savedMethod;
      }
    } else {
      // Add new method
      savedMethod = await PaymentService.createPaymentMethod(paymentForm);
      paymentMethods.value.push(savedMethod);
    }
    
    closeForm();
    console.log('✅ Payment method saved:', savedMethod);
  } catch (error) {
    console.error('❌ Error saving payment method:', error);
  } finally {
    saving.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingPaymentMethod.value = null;
  Object.assign(paymentForm, {
    type: '',
    title: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
    walletProvider: '',
    phoneNumber: ''
  });
  
  // Reset form validation
  if (paymentForm.value) {
    paymentForm.value.reset();
  }
};

const getPaymentIcon = (type) => {
  const iconMap = {
    card: 'mdi-credit-card',
    bank: 'mdi-bank',
    wallet: 'mdi-wallet'
  };
  return iconMap[type] || 'mdi-credit-card';
};

const getPaymentTypeName = (type) => {
  const nameMap = {
    card: 'بطاقة ائتمان',
    bank: 'تحويل بنكي',
    wallet: 'محفظة إلكترونية'
  };
  return nameMap[type] || type;
};

onMounted(() => {
  loadPaymentMethods();
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

.payment-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.payment-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.default-payment {
  border-color: var(--v-theme-warning);
  background: rgba(var(--v-theme-warning), 0.05);
}

.card-details,
.bank-details,
.wallet-details {
  min-height: 120px;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
                    <div class="wallet-row">
                      <span class="label">المحفظة:</span>
                      <span class="value">{{ method.walletProvider }}</span>
                    </div>
                    <div class="wallet-row">
                      <span class="label">رقم الهاتف:</span>
                      <span class="value">{{ method.phoneNumber }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="method.isDefault" class="default-badge">
                <i class="fa-solid fa-star"></i>
                طريقة الدفع الافتراضية
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Payment Method Modal -->
    <div v-if="showAddForm || editingPayment" class="payment-modal" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ editingPayment ? 'تعديل طريقة الدفع' : 'إضافة طريقة دفع جديدة' }}</h2>
          <button class="close-btn" @click="closeModal">
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="savePaymentMethod" class="payment-form">
          <div class="payment-type-selector">
            <label class="form-label">نوع طريقة الدفع *</label>
            <div class="payment-types">
              <label 
                v-for="type in paymentTypes" 
                :key="type.value"
                :class="['payment-type-option', { active: paymentForm.type === type.value }]"
              >
                <input 
                  type="radio" 
                  v-model="paymentForm.type" 
                  :value="type.value"
                  required
                />
                <i :class="type.icon"></i>
                <span>{{ type.label }}</span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">عنوان طريقة الدفع *</label>
            <input 
              type="text" 
              v-model="paymentForm.title" 
              class="form-input"
              placeholder="مثلاً: البطاقة الشخصية، حساب البنك"
              required
            />
          </div>

          <!-- Card Payment Fields -->
          <div v-if="paymentForm.type === 'card'" class="card-fields">
            <div class="form-group">
              <label class="form-label">اسم حامل البطاقة *</label>
              <input 
                type="text" 
                v-model="paymentForm.cardholderName" 
                class="form-input"
                placeholder="الاسم كما يظهر على البطاقة"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">رقم البطاقة *</label>
              <input 
                type="text" 
                v-model="paymentForm.cardNumber" 
                class="form-input"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                required
                @input="formatCardNumber"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">تاريخ الانتهاء *</label>
                <div class="expiry-input">
                  <input 
                    type="text" 
                    v-model="paymentForm.expiryMonth" 
                    class="form-input"
                    placeholder="MM"
                    maxlength="2"
                    required
                  />
                  <span class="expiry-separator">/</span>
                  <input 
                    type="text" 
                    v-model="paymentForm.expiryYear" 
                    class="form-input"
                    placeholder="YY"
                    maxlength="2"
                    required
                  />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">CVV *</label>
                <input 
                  type="text" 
                  v-model="paymentForm.cvv" 
                  class="form-input"
                  placeholder="123"
                  maxlength="4"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Bank Transfer Fields -->
          <div v-else-if="paymentForm.type === 'bank'" class="bank-fields">
            <div class="form-group">
              <label class="form-label">اسم البنك *</label>
              <select v-model="paymentForm.bankName" class="form-input" required>
                <option value="">اختر البنك</option>
                <option value="البنك الوطني الجزائري">البنك الوطني الجزائري</option>
                <option value="البنك الخارجي الجزائري">البنك الخارجي الجزائري</option>
                <option value="البنك الشعبي الجزائري">البنك الشعبي الجزائري</option>
                <option value="البنك الجزائري للتنمية">البنك الجزائري للتنمية</option>
                <option value="البنك الفلاحي الجزائري">البنك الفلاحي الجزائري</option>
                <option value="بنك القرض الشعبي الجزائري">بنك القرض الشعبي الجزائري</option>
                <option value="البنك الأفريكي">البنك الأفريقي</option>
                <option value="سيتي بنك">سيتي بنك</option>
                <option value="بي إن بي باريباس">بي إن بي باريباس</option>
                <option value="سوسيتيه جنرال">سوسيتيه جنرال</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">اسم الحساب *</label>
              <input 
                type="text" 
                v-model="paymentForm.accountName" 
                class="form-input"
                placeholder="اسم صاحب الحساب"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">رقم الحساب *</label>
              <input 
                type="text" 
                v-model="paymentForm.accountNumber" 
                class="form-input"
                placeholder="رقم الحساب البنكي"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">IBAN</label>
              <input 
                type="text" 
                v-model="paymentForm.iban" 
                class="form-input"
                placeholder="DZXX XXXX XXXX XXXX XXXX XXXX XXXX"
              />
            </div>
          </div>

          <!-- E-Wallet Fields -->
          <div v-else-if="paymentForm.type === 'wallet'" class="wallet-fields">
            <div class="form-group">
              <label class="form-label">المحفظة الإلكترونية *</label>
              <select v-model="paymentForm.walletProvider" class="form-input" required>
                <option value="">اختر المحفظة</option>
                <option value="CIB">CIB Pay</option>
                <option value="BaridiMob">BaridiMob</option>
                <option value="Djezzy">Djezzy Cash</option>
                <option value="Mobilis">Mobilis Money</option>
                <option value="Edahabia">Edahabia</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">رقم الهاتف *</label>
              <input 
                type="tel" 
                v-model="paymentForm.phoneNumber" 
                class="form-input"
                placeholder="+213 XXX XXX XXXX"
                required
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeModal">
              إلغاء
            </button>
            <button type="submit" class="save-btn" :disabled="loading">
              <i class="fa-solid fa-save"></i>
              <span v-if="!loading">{{ editingPayment ? 'تحديث' : 'حفظ' }}</span>
              <span v-else class="loading-text">
                <i class="fa-solid fa-spinner fa-spin"></i>
                جاري الحفظ...
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import PaymentService from '@/integration/services/PaymentService';

const paymentService = PaymentService;
const loading = ref(false);
const showAddForm = ref(false);
const editingPayment = ref(null);

const paymentMethods = ref([]);

const paymentTypes = [
  { value: 'card', label: 'بطاقة ائتمان', icon: 'fa-solid fa-credit-card' },
  { value: 'bank', label: 'تحويل بنكي', icon: 'fa-solid fa-university' },
  { value: 'wallet', label: 'محفظة إلكترونية', icon: 'fa-solid fa-wallet' }
];

const getPaymentIcon = (type) => {
  const icons = {
    card: 'fa-solid fa-credit-card',
    bank: 'fa-solid fa-university',
    wallet: 'fa-solid fa-wallet'
  };
  return icons[type] || 'fa-solid fa-credit-card';
};

const getPaymentTypeName = (type) => {
  const names = {
    card: 'بطاقة ائتمان',
    bank: 'تحويل بنكي',
    wallet: 'محفظة إلكترونية'
  };
  return names[type] || type;
};

const formatCardNumber = () => {
  let value = paymentForm.cardNumber.replace(/\s/g, '');
  let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
  paymentForm.cardNumber = formattedValue;
};

const closeModal = () => {
  showAddForm.value = false;
  editingPayment.value = null;
  resetForm();
};

const resetForm = () => {
  Object.assign(paymentForm, {
    type: '',
    title: '',
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    iban: '',
    walletProvider: '',
    phoneNumber: ''
  });
};

const editPaymentMethod = (method) => {
  editingPayment.value = method;
  Object.assign(paymentForm, method);
};

const savePaymentMethod = async () => {
  try {
    loading.value = true;
    
    if (editingPayment.value) {
      // Update existing payment method
      const method = await paymentService.updatePaymentMethod(editingPayment.value.id, paymentForm);
      const index = paymentMethods.value.findIndex(m => m.id === editingPayment.value.id);
      if (index !== -1) {
        paymentMethods.value[index] = method;
      }
    } else {
      // Add new payment method
      const method = await paymentService.createPaymentMethod(paymentForm);
      paymentMethods.value.push(method);
    }
    
    closeModal();
  } catch (error) {
    console.error('Error saving payment method:', error);
    // Show error message to user
  } finally {
    loading.value = false;
  }
};

const deletePaymentMethod = async (paymentId) => {
  if (confirm('هل أنت متأكد من حذف طريقة الدفع؟')) {
    try {
      await paymentService.deletePaymentMethod(paymentId);
      paymentMethods.value = paymentMethods.value.filter(m => m.id !== paymentId);
    } catch (error) {
      console.error('Error deleting payment method:', error);
      // Show error message to user
    }
  }
};

const setDefault = async (paymentId) => {
  try {
    await paymentService.setDefaultPaymentMethod(paymentId);
    paymentMethods.value.forEach(method => {
      method.isDefault = method.id === paymentId;
    });
  } catch (error) {
    console.error('Error setting default payment method:', error);
    // Show error message to user
  }
};

const loadPaymentMethods = async () => {
  try {
    loading.value = true;
    paymentMethods.value = await paymentService.getPaymentMethods();
  } catch (error) {
    console.error('Error loading payment methods:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadPaymentMethods();
});
</script>

<style scoped>
/* ===== Payments Page ===== */
.payments-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.12) 0%, transparent 50%);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
  filter: blur(2px);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Payments Container */
.payments-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1000px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 0 0 30px rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}

/* Header */
.payments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-title i {
  color: #d4af37;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.add-payment-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  font-size: 48px;
  color: #d4af37;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 18px;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.empty-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 32px 0;
}

.add-first-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-first-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Payment Methods Grid */
.payment-methods-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.payment-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.payment-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

.payment-card.default {
  border-color: rgba(212, 175, 55, 0.3);
  background: rgba(212, 175, 55, 0.05);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.payment-info {
  flex: 1;
}

.payment-type {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d4af37;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
}

.payment-type i {
  font-size: 16px;
}

.payment-title {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.payment-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.default-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 6px;
  color: #d4af37;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.default-btn:hover {
  background: rgba(212, 175, 55, 0.3);
  color: #ffffff;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn {
  background: rgba(0, 123, 255, 0.2);
  color: #007bff;
}

.edit-btn:hover {
  background: rgba(0, 123, 255, 0.3);
  color: #ffffff;
}

.delete-btn {
  background: rgba(220, 53, 69, 0.2);
  color: #dc3545;
}

.delete-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

/* Payment Details */
.card-details,
.bank-details,
.wallet-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-number {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

.card-number i {
  color: #d4af37;
}

.card-info,
.bank-info,
.wallet-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-row,
.bank-row,
.wallet-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.label {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
}

.value {
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
}

.default-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 4px;
  color: #d4af37;
  font-size: 12px;
  font-weight: 500;
}

/* Modal */
.payment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h2 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #dc3545;
}

.payment-form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.payment-type-selector {
  margin-bottom: 20px;
}

.payment-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 12px;
}

.payment-type-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.payment-type-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.payment-type-option.active {
  background: rgba(212, 175, 55, 0.2);
  border-color: rgba(212, 175, 55, 0.3);
}

.payment-type-option i {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  transition: color 0.3s ease;
}

.payment-type-option.active i {
  color: #d4af37;
}

.payment-type-option span {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.payment-type-option input {
  display: none;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
}

.form-input {
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #ffffff;
  font-size: 16px;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(212, 175, 55, 0.5);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.expiry-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expiry-separator {
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
}

.cancel-btn {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: #ffffff;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .payments-page {
    padding: 10px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .payments-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .payment-methods-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .payment-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .payment-actions {
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
  }
  
  .payment-types {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
