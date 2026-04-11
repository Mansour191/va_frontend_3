<template>
  <v-container class="register-page" fluid>
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
      <div class="gradient-overlay"></div>
    </div>

    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="glass-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="logo-icon">
                <v-icon size="48" color="primary">mdi-account-plus</v-icon>
              </div>
              <h2 class="text-h4 font-weight-bold text-primary mb-2">
                {{ $t('signupTitle') }}
              </h2>
              <p class="text-body-1 text-medium-emphasis">
                أنشئ حساب جديد وابدأ رحلتك معنا
              </p>
            </div>

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

            <!-- Social Signup -->
            <div class="social-section mb-6">
              <p class="text-center text-body-2 text-medium-emphasis mb-4">سجل بسرعة باستخدام</p>
              <div class="social-buttons">
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-google"
                  @click="handleSocialSignup('google')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Google
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-facebook"
                  @click="handleSocialSignup('facebook')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Facebook
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-microsoft"
                  @click="handleSocialSignup('microsoft')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Microsoft
                </v-btn>
              </div>
            </div>

            <v-divider class="my-6">
              <span class="divider-text">أو سجل باستخدام البريد الإلكتروني</span>
            </v-divider>

            <!-- Registration Form with Vuelidate -->
            <v-form @submit.prevent="handleSignup" v-if="!loading" class="auth-form">
              <v-text-field
                v-model="form.name"
                label="الاسم الكامل"
                prepend-inner-icon="mdi-account"
                variant="outlined"
                required
                :error-messages="v$.name.$dirty ? v$.name.$errors.map(e => e.$message) : []"
                @blur="v$.name.$touch()"
                placeholder="أدخل اسمك الكامل"
                autocomplete="name"
                class="mb-4"
              />

              <!-- Contact Method Toggle -->
              <v-radio-group v-model="form.contactMethod" label="طريقة التواصل" class="mb-4">
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
                :error-messages="v$.email.$dirty ? v$.email.$errors.map(e => e.$message) : []"
                @blur="v$.email.$touch()"
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
                :error-messages="v$.phone.$dirty ? v$.phone.$errors.map(e => e.$message) : []"
                @blur="v$.phone.$touch()"
                placeholder="أدخل رقم هاتفك"
                autocomplete="tel"
                class="mb-4"
              />

              <v-text-field
                v-model="form.password"
                label="كلمة المرور"
                prepend-inner-icon="mdi-lock"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                required
                :error-messages="v$.password.$dirty ? v$.password.$errors.map(e => e.$message) : []"
                @blur="v$.password.$touch()"
                placeholder="أدخل كلمة المرور"
                autocomplete="new-password"
                @click:append-inner="showPassword = !showPassword"
                @input="checkPasswordStrength"
                class="mb-4"
              />

              <!-- Password Strength Indicator -->
              <div v-if="form.password && passwordStrength.score > 0" class="password-strength mb-4">
                <div class="d-flex align-center mb-2">
                  <span class="text-caption me-2">قوة كلمة المرور:</span>
                  <span class="text-caption" :class="passwordStrength.color">
                    {{ passwordStrength.text }}
                  </span>
                </div>
                <div class="strength-bars">
                  <div
                    v-for="n in 4"
                    :key="n"
                    class="strength-bar"
                    :class="{
                      active: n <= passwordStrength.score,
                      [passwordStrength.color]: true
                    }"
                  ></div>
                </div>
              </div>

              <v-checkbox
                v-model="form.agreeTerms"
                label="أوافق على الشروط والأحكام"
                color="primary"
                required
                :error-messages="v$.agreeTerms.$dirty ? v$.agreeTerms.$errors.map(e => e.$message) : []"
                @blur="v$.agreeTerms.$touch()"
                class="mb-4"
              />

              <v-btn
                type="submit"
                block
                size="large"
                color="primary"
                :disabled="v$.$invalid || loading"
                class="mb-4"
              >
                <v-progress-circular
                  v-if="loading"
                  indeterminate
                  size="20"
                  width="2"
                  class="me-2"
                ></v-progress-circular>
                <v-icon start v-else>mdi-account-plus</v-icon>
                إنشاء حساب
              </v-btn>
            </v-form>

            <!-- Footer Link -->
            <div class="text-center mt-6">
              <router-link 
                to="/login" 
                class="text-decoration-none text-primary font-weight-medium"
              >
                <v-icon start size="small">mdi-arrow-left</v-icon>
                لديك حساب بالفعل؟ سجل الدخول
              </router-link>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email, helpers } from '@vuelidate/validators';
import { useTitle } from '@vueuse/core';
import { useAuth } from '@/composables/useAuth';

// Set page title
useTitle('Paclos | Register');

const router = useRouter();
const { t } = useI18n();

// Use secure auth composable
const { 
  register, 
  socialLogin, 
  loading, 
  error, 
  success,
  isAuthenticated, 
  currentUser,
  currentUserRole,
  isAdmin,
  isInvestor 
} = useAuth();

// Form data
const form = reactive({
  name: '',
  contactMethod: 'email',
  email: '',
  phone: '',
  password: '',
  agreeTerms: false
});

// Password strength
const passwordStrength = reactive({
  score: 0,
  text: '',
  color: 'text-error'
});

// Custom validators
const phoneValidator = helpers.regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صالح');

// Vuelidate validation rules
const validationRules = computed(() => ({
  name: { 
    required: { $validator: required, $message: 'الاسم الكامل مطلوب' },
    minLength: { $validator: minLength(3), $message: 'الاسم يجب أن يكون 3 أحرف على الأقل' },
    $autoDirty: true
  },
  email: { 
    required: { $validator: required, $message: 'البريد الإلكتروني مطلوب' },
    email: { $validator: email, $message: 'البريد الإلكتروني غير صالح' },
    $autoDirty: true
  },
  phone: { 
    required: { $validator: required, $message: 'رقم الهاتف مطلوب' },
    phoneValidator,
    $autoDirty: true
  },
  password: { 
    required: { $validator: required, $message: 'كلمة المرور مطلوبة' },
    minLength: { $validator: minLength(6), $message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
    $autoDirty: true
  },
  agreeTerms: { 
    required: { $validator: required, $message: 'يجب الموافقة على الشروط والأحكام' },
    $autoDirty: true
  }
}));

const v$ = useVuelidate(validationRules, form);

// Methods
const checkPasswordStrength = () => {
  if (!form.password) {
    passwordStrength.score = 0;
    passwordStrength.text = '';
    return;
  }

  let score = 0;
  const password = form.password;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Complexity checks
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  passwordStrength.score = Math.min(score, 4);

  // Set text and color based on score
  const strengthLevels = [
    { text: 'ضعيف جداً', color: 'text-error' },
    { text: 'ضعيف', color: 'text-warning' },
    { text: 'متوسط', color: 'text-info' },
    { text: 'قوي', color: 'text-success' },
    { text: 'قوي جداً', color: 'text-success' }
  ];

  const level = strengthLevels[passwordStrength.score];
  passwordStrength.text = level.text;
  passwordStrength.color = level.color;
};

// Enhanced signup handler with GraphQL
const handleSignup = async () => {
  // Validate form
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }

  try {
    const result = await register({
      username: form.email,
      email: form.email,
      name: form.name,
      password: form.password,
      agreeTerms: form.agreeTerms
    });
    
    if (result.success) {
      // Success message is already set by the auth composable
      
      // Redirect to dashboard or appropriate page after delay
      setTimeout(() => {
        if (result.role === 'admin') {
          router.push('/dashboard');
        } else if (result.role === 'investor') {
          router.push('/investor');
        } else {
          router.push('/');
        }
      }, 2000);
    } else {
      console.error('Registration failed:', result.message);
    }
  } catch (err) {
    console.error('Registration error:', err);
  }
};

// Social signup handler with GraphQL
const handleSocialSignup = async (provider) => {
  try {
    // In a real implementation, you would get the social token from the provider's SDK
    const socialToken = 'mock_social_token'; // This would come from Google/Facebook/Microsoft SDK
    
    const result = await socialLogin(provider, socialToken);
    
    if (result.success) {
      // Success message is already set by the auth composable
      
      // Redirect based on role
      setTimeout(() => {
        if (result.role === 'admin') {
          router.push('/dashboard');
        } else if (result.role === 'investor') {
          router.push('/investor');
        } else {
          router.push('/');
        }
      }, 2000);
    } else {
      console.error('Social registration failed:', result.message);
    }
  } catch (err) {
    console.error('Social registration error:', err);
  }
};

// Initialize component
onMounted(() => {
  // Clear any existing messages
  error.value = null;
  success.value = null;
  
  // Check if user is already logged in
  if (isAuthenticated.value) {
    const redirectPath = route.query.redirect;
    if (redirectPath) {
      router.push(redirectPath);
    } else {
      // Default redirect based on role
      if (isAdmin.value) {
        router.push('/dashboard');
      } else if (isInvestor.value) {
        router.push('/investor');
      } else {
        router.push('/');
      }
    }
  }
});
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

/* Social Buttons */
.social-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.social-btn {
  flex: 1;
  min-width: 100px;
}

/* Password Strength */
.password-strength {
  padding: 12px;
  background: rgba(10, 10, 10, 0.3);
  border-radius: 8px;
  border: 1px solid var(--border-secondary);
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--border-secondary);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.active {
  background: currentColor;
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

.v-radio-group :deep(.v-label) {
  color: var(--text-primary);
}

.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.v-divider {
  border-color: var(--border-secondary);
}

.divider-text {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Responsive */
@media (max-width: 640px) {
  .glass-card {
    margin: 16px;
  }
  
  .social-buttons {
    flex-direction: column;
  }
  
  .social-btn {
    min-width: auto;
  }
}
</style>
