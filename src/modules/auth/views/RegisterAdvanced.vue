<template>
  <v-container class="register-page" fluid>
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-overlay"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="glass-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Header Section -->
            <div class="text-center mb-8">
              <div class="logo-icon">
                <v-icon size="48" color="primary">mdi-gem</v-icon>
              </div>
              <h1 class="logo-text">Paclos</h1>
              <p class="logo-subtitle">نظام التسجيل المتقدم</p>
            </div>

            <div class="auth-body">
              <!-- Progress Steps -->
              <v-stepper v-model="currentStep" class="mb-6">
                <v-stepper-header>
                  <v-stepper-item
                    :value="1"
                    :complete="currentStep > 1"
                    title="المعلومات الأساسية"
                  ></v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item
                    :value="2"
                    :complete="currentStep > 2"
                    title="معلومات التواصل"
                  ></v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item
                    :value="3"
                    :complete="currentStep > 3"
                    title="الأمان"
                  ></v-stepper-item>
                  
                  <v-divider></v-divider>
                  
                  <v-stepper-item
                    :value="4"
                    :complete="currentStep > 4"
                    title="التأكيد"
                  ></v-stepper-item>
                </v-stepper-header>
              </v-stepper>

              <!-- Error Alert -->
              <v-alert
                v-if="error"
                type="error"
                variant="tonal"
                class="mb-6"
                closable
                @update:model-value="error = null"
              >
                <v-alert-title>
                  <v-icon start>mdi-alert-triangle</v-icon>
                  خطأ في إنشاء الحساب
                </v-alert-title>
                {{ error }}
              </v-alert>

              <!-- Success Alert -->
              <v-alert
                v-if="success"
                type="success"
                variant="tonal"
                class="mb-6"
                closable
                @update:model-value="success = null"
              >
                <v-alert-title>
                  <v-icon start>mdi-check-circle</v-icon>
                  تم إنشاء الحساب!
                </v-alert-title>
                {{ success }}
              </v-alert>

              <!-- Step 1: Basic Information -->
              <div v-if="currentStep === 1" class="step-content">
                <h3 class="step-title">المعلومات الأساسية</h3>
                <v-form @submit.prevent="nextStep" class="form">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.firstName"
                        label="الاسم الأول"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        required
                        :rules="nameRules"
                        placeholder="أدخل اسمك الأول"
                        autocomplete="given-name"
                        class="mb-4"
                      />
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="form.lastName"
                        label="الاسم الأخير"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        required
                        :rules="nameRules"
                        placeholder="أدخل اسمك الأخير"
                        autocomplete="family-name"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="form.username"
                    label="اسم المستخدم"
                    prepend-inner-icon="mdi-account-outline"
                    variant="outlined"
                    required
                    :rules="usernameRules"
                    placeholder="اختر اسم مستخدم فريد"
                    autocomplete="username"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="form.birthDate"
                    label="تاريخ الميلاد"
                    prepend-inner-icon="mdi-calendar"
                    variant="outlined"
                    type="date"
                    required
                    :rules="birthDateRules"
                    class="mb-4"
                  />

                  <v-select
                    v-model="form.gender"
                    label="الجنس"
                    prepend-inner-icon="mdi-gender-variant"
                    variant="outlined"
                    :items="genderOptions"
                    item-title="text"
                    item-value="value"
                    required
                    :rules="requiredRules"
                    class="mb-4"
                  />

                  <div class="d-flex justify-end">
                    <v-btn
                      type="submit"
                      color="primary"
                      size="large"
                    >
                      التالي
                      <v-icon start>mdi-arrow-left</v-icon>
                    </v-btn>
                  </div>
                </v-form>
              </div>

              <!-- Step 2: Contact Information -->
              <div v-if="currentStep === 2" class="step-content">
                <h3 class="step-title">معلومات التواصل</h3>
                
                <!-- Contact Method Toggle -->
                <v-radio-group v-model="form.contactMethod" label="طريقة التواصل المفضلة" class="mb-4">
                  <v-radio
                    label="البريد الإلكتروني"
                    value="email"
                    color="primary"
                  >
                    <template v-slot:label>
                      <v-icon class="me-2">mdi-email</v-icon>
                      البريد الإلكتروني
                    </template>
                  </v-radio>
                  <v-radio
                    label="رقم الهاتف"
                    value="phone"
                    color="primary"
                  >
                    <template v-slot:label>
                      <v-icon class="me-2">mdi-phone</v-icon>
                      رقم الهاتف
                    </template>
                  </v-radio>
                </v-radio-group>

                <v-text-field
                  v-if="form.contactMethod === 'email'"
                  v-model="form.email"
                  label="البريد الإلكتروني"
                  prepend-inner-icon="mdi-email"
                  variant="outlined"
                  type="email"
                  required
                  :rules="emailRules"
                  placeholder="أدخل بريدك الإلكتروني"
                  autocomplete="email"
                  class="mb-4"
                />

                <v-text-field
                  v-if="form.contactMethod === 'phone'"
                  v-model="form.phone"
                  label="رقم الهاتف"
                  prepend-inner-icon="mdi-phone"
                  variant="outlined"
                  type="tel"
                  required
                  :rules="phoneRules"
                  placeholder="أدخل رقم هاتفك"
                  autocomplete="tel"
                  class="mb-4"
                />

                <v-text-field
                  v-model="form.address"
                  label="العنوان"
                  prepend-inner-icon="mdi-map-marker"
                  variant="outlined"
                  required
                  :rules="requiredRules"
                  placeholder="أدخل عنوانك الكامل"
                  autocomplete="street-address"
                  class="mb-4"
                />

                <div class="d-flex justify-space-between">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="previousStep"
                  >
                    <v-icon end>mdi-arrow-right</v-icon>
                    السابق
                  </v-btn>
                  <v-btn
                    color="primary"
                    @click="nextStep"
                  >
                    التالي
                    <v-icon start>mdi-arrow-left</v-icon>
                  </v-btn>
                </div>
              </div>

              <!-- Step 3: Security -->
              <div v-if="currentStep === 3" class="step-content">
                <h3 class="step-title">الأمان</h3>
                <v-form @submit.prevent="nextStep" class="form">
                  <v-text-field
                    v-model="form.password"
                    label="كلمة المرور"
                    prepend-inner-icon="mdi-lock"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="outlined"
                    required
                    :rules="passwordRules"
                    placeholder="اختر كلمة مرور قوية"
                    autocomplete="new-password"
                    @click:append-inner="showPassword = !showPassword"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="form.confirmPassword"
                    label="تأكيد كلمة المرور"
                    prepend-inner-icon="mdi-lock-check"
                    variant="outlined"
                    type="password"
                    required
                    :rules="confirmPasswordRules"
                    placeholder="أعد إدخال كلمة المرور"
                    autocomplete="new-password"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="form.securityQuestion"
                    label="سؤال الأمان"
                    prepend-inner-icon="mdi-shield-question"
                    variant="outlined"
                    required
                    :rules="requiredRules"
                    placeholder="اختر سؤال أمان"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="form.securityAnswer"
                    label="إجابة السؤال"
                    prepend-inner-icon="mdi-key"
                    variant="outlined"
                    required
                    :rules="requiredRules"
                    placeholder="أدخل إجابة السؤال"
                    class="mb-4"
                  />

                  <div class="d-flex justify-space-between">
                    <v-btn
                      variant="outlined"
                      color="primary"
                      @click="previousStep"
                    >
                      <v-icon end>mdi-arrow-right</v-icon>
                      السابق
                    </v-btn>
                    <v-btn
                      type="submit"
                      color="primary"
                    >
                      التالي
                      <v-icon start>mdi-arrow-left</v-icon>
                    </v-btn>
                  </div>
                </v-form>
              </div>

              <!-- Step 4: Confirmation -->
              <div v-if="currentStep === 4" class="step-content">
                <h3 class="step-title">التأكيد</h3>
                <v-card variant="tonal" color="info" class="mb-4">
                  <v-card-text>
                    <h4 class="text-h6 mb-4">مراجعة المعلومات</h4>
                    <v-list density="compact">
                      <v-list-item>
                        <v-list-item-title>الاسم الكامل</v-list-item-title>
                        <v-list-item-subtitle>{{ form.firstName }} {{ form.lastName }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>اسم المستخدم</v-list-item-title>
                        <v-list-item-subtitle>{{ form.username }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>تاريخ الميلاد</v-list-item-title>
                        <v-list-item-subtitle>{{ form.birthDate }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>الجنس</v-list-item-title>
                        <v-list-item-subtitle>{{ form.gender === 'male' ? 'ذكر' : 'أنثى' }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="form.email">
                        <v-list-item-title>البريد الإلكتروني</v-list-item-title>
                        <v-list-item-subtitle>{{ form.email }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item v-if="form.phone">
                        <v-list-item-title>رقم الهاتف</v-list-item-title>
                        <v-list-item-subtitle>{{ form.phone }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <v-list-item-title>العنوان</v-list-item-title>
                        <v-list-item-subtitle>{{ form.address }}</v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <v-checkbox
                  v-model="form.agreeTerms"
                  label="أوافق على الشروط والأحكام وسياسة الخصوصية"
                  color="primary"
                  required
                  :rules="termsRules"
                  class="mb-4"
                />

                <div class="d-flex justify-space-between">
                  <v-btn
                    variant="outlined"
                    color="primary"
                    @click="previousStep"
                  >
                    <v-icon end>mdi-arrow-right</v-icon>
                    السابق
                  </v-btn>
                  <v-btn
                    color="primary"
                    :loading="loading"
                    @click="handleSubmit"
                  >
                    إنشاء الحساب
                    <v-icon start>mdi-account-plus</v-icon>
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

// State
const currentStep = ref(1);
const loading = ref(false);
const showPassword = ref(false);
const error = ref(null);
const success = ref(null);

// Form data
const form = reactive({
  firstName: '',
  lastName: '',
  username: '',
  birthDate: '',
  gender: '',
  contactMethod: 'email',
  email: '',
  phone: '',
  address: '',
  password: '',
  confirmPassword: '',
  securityQuestion: '',
  securityAnswer: '',
  agreeTerms: false
});

// Options
const genderOptions = [
  { text: 'ذكر', value: 'male' },
  { text: 'أنثى', value: 'female' }
];

// Validation rules
const nameRules = [
  v => !!v || 'الاسم مطلوب',
  v => v.length >= 2 || 'الاسم يجب أن يكون حرفين على الأقل'
];

const usernameRules = [
  v => !!v || 'اسم المستخدم مطلوب',
  v => v.length >= 3 || 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
  v => /^[a-zA-Z0-9_]+$/.test(v) || 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطات سفلية فقط'
];

const birthDateRules = [
  v => !!v || 'تاريخ الميلاد مطلوب',
  v => {
    const age = new Date().getFullYear() - new Date(v).getFullYear();
    return age >= 18 || 'يجب أن تكون 18 سنة على الأقل';
  }
];

const requiredRules = [
  v => !!v || 'هذا الحقل مطلوب'
];

const emailRules = [
  v => !!v || 'البريد الإلكتروني مطلوب',
  v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صالح'
];

const phoneRules = [
  v => !!v || 'رقم الهاتف مطلوب',
  v => /^[0-9+\-\s()]+$/.test(v) || 'رقم الهاتف غير صالح'
];

const passwordRules = [
  v => !!v || 'كلمة المرور مطلوبة',
  v => v.length >= 8 || 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
  v => /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v) || 'كلمة المرور يجب أن تحتوي على حرف كبير، حرف صغير، ورقم'
];

const confirmPasswordRules = [
  v => !!v || 'تأكيد كلمة المرور مطلوب',
  v => v === form.password || 'كلمتا المرور غير متطابقتين'
];

const termsRules = [
  v => !!v || 'يجب الموافقة على الشروط والأحكام'
];

// Methods
const nextStep = () => {
  if (currentStep.value < 4) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = null;
  success.value = null;
  
  try {
    const result = await authStore.register(form);
    if (result.success) {
      success.value = 'تم إنشاء الحساب بنجاح!';
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  } catch (err) {
    error.value = err.message || 'فشل إنشاء الحساب';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--gradient-dark));
  position: relative;
  overflow: hidden;
}

/* Background Effects */
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
  background: radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%);
  animation: float 20s infinite ease-in-out;
}

.orb-1 { width: 300px; height: 300px; top: 10%; left: 10%; animation-delay: 0s; }
.orb-2 { width: 200px; height: 200px; top: 60%; right: 10%; animation-delay: 5s; }
.orb-3 { width: 150px; height: 150px; bottom: 20%; left: 60%; animation-delay: 10s; }

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.05) 0%, transparent 30%),
    radial-gradient(circle at 80% 70%, rgba(212, 175, 55, 0.05) 0%, transparent 30%);
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(20px) rotate(240deg); }
}

/* Glass Card */
.glass-card {
  backdrop-filter: blur(20px);
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid var(--border-primary);
  position: relative;
  z-index: 1;
}

/* Logo Section */
.logo-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #f5d742 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  box-shadow: var(--gold-glow);
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  background: var(--gold-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

/* Form Styles */
.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 24px;
}

/* Custom Vuetify overrides */
.v-text-field :deep(.v-field) {
  background-color: rgba(10, 10, 10, 0.5);
  border-color: var(--border-secondary);
}

.v-text-field :deep(.v-field:hover) {
  border-color: var(--color-primary);
}

.v-text-field :deep(.v-field--focused) {
  border-color: var(--color-primary);
  box-shadow: var(--gold-glow);
}

.v-select :deep(.v-field) {
  background-color: rgba(10, 10, 10, 0.5);
  border-color: var(--border-secondary);
}

.v-select :deep(.v-field:hover) {
  border-color: var(--color-primary);
}

.v-select :deep(.v-field--focused) {
  border-color: var(--color-primary);
  box-shadow: var(--gold-glow);
}

.v-radio-group :deep(.v-label) {
  color: var(--text-primary);
}

.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.v-stepper {
  background: transparent;
}

.v-stepper-header {
  background: rgba(10, 10, 10, 0.3);
  border-radius: 12px;
  padding: 16px;
}

/* Responsive */
@media (max-width: 640px) {
  .glass-card {
    margin: 16px;
  }
  
  .v-stepper-header {
    padding: 8px;
  }
  
  .v-stepper-item .v-stepper-item__title {
    font-size: 0.75rem;
  }
}
</style>
