<template>
  <v-container class="login-page" fluid>
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
              <div class="logo-section">
                <v-icon size="64" color="primary" class="mb-4">
                  mdi-account-circle
                </v-icon>
                <h2 class="text-h4 font-weight-bold text-primary mb-2">
                  {{ $t('loginTitle') }}
                </h2>
                <p class="text-body-1 text-medium-emphasis">
                  مرحباً بعودتك! سجل الدخول لحسابك
                </p>
              </div>
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
                خطأ في تسجيل الدخول
              </v-alert-title>
              {{ error }}
            </v-alert>

            <!-- Warning Alert for Protected Pages -->
            <v-alert
              v-if="isAttemptingProtected"
              type="warning"
              variant="tonal"
              class="mb-6"
              closable
              @update:model-value="isAttemptingProtected = false"
            >
              <v-alert-title>
                <v-icon start>mdi-shield-alt</v-icon>
                وصول غير مصرح به
              </v-alert-title>
              هذه الصفحة محمية. يرجى تسجيل الدخول باستخدام حساب مصرح به.
            </v-alert>

            <!-- Login Form with Vuelidate -->
            <v-form @submit.prevent="handleLogin" class="auth-form">
              <v-text-field
                v-model="form.email"
                label="اسم المستخدم أو البريد الإلكتروني"
                prepend-inner-icon="mdi-email"
                variant="outlined"
                required
                :error-messages="v$.email.$dirty ? v$.email.$errors.map(e => e.$message) : []"
                @blur="v$.email.$touch()"
                placeholder="أدخل اسم المستخدم أو البريد الإلكتروني"
                autocomplete="username"
                class="mb-4"
              />

              <v-text-field
                v-model="form.password"
                label="كلمة المرور"
                prepend-inner-icon="mdi-lock"
                variant="outlined"
                type="password"
                required
                :error-messages="v$.password.$dirty ? v$.password.$errors.map(e => e.$message) : []"
                @blur="v$.password.$touch()"
                placeholder="أدخل كلمة المرور"
                autocomplete="current-password"
                class="mb-4"
              />

              <div class="form-options mb-4">
                <router-link 
                  to="/forgot-password" 
                  class="text-decoration-none text-primary font-weight-medium"
                >
                  نسيت كلمة المرور؟
                </router-link>
              </div>

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
                <v-icon start v-else>mdi-login</v-icon>
                تسجيل الدخول
              </v-btn>
            </v-form>

            <!-- Social Login -->
            <div class="social-section mb-6">
              <p class="text-center text-body-2 text-medium-emphasis mb-4">أو سجل الدخول باستخدام</p>
              <div class="social-buttons">
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-google"
                  @click="handleSocialLogin('google')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Google
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-facebook"
                  @click="handleSocialLogin('facebook')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Facebook
                </v-btn>
                <v-btn
                  variant="outlined"
                  prepend-icon="mdi-microsoft"
                  @click="handleSocialLogin('microsoft')"
                  :disabled="loading"
                  class="social-btn"
                >
                  Microsoft
                </v-btn>
              </div>
            </div>

            <!-- Footer Link -->
            <div class="text-center">
              <router-link 
                to="/register" 
                class="text-decoration-none text-primary font-weight-medium"
              >
                <v-icon start size="small">mdi-account-plus</v-icon>
                ليس لديك حساب؟ سجل الآن
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
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, email, helpers } from '@vuelidate/validators';
import { useTitle } from '@vueuse/core';
import { useAuth } from '@/composables/useAuth';

// Set page title
useTitle('Paclos | Login');

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

// Use secure auth composable
const { 
  login, 
  socialLogin, 
  loading, 
  error, 
  isAuthenticated, 
  currentUser,
  currentUserRole,
  isAdmin,
  isInvestor 
} = useAuth();

// Form data with reactive
const form = reactive({
  email: '',
  password: '',
});

// Vuelidate validation rules
const validationRules = computed(() => ({
  email: { 
    required: { $validator: required, $message: 'اسم المستخدم أو البريد الإلكتروني مطلوب' },
    minLength: { $validator: minLength(3), $message: 'يجب أن يكون 3 أحرف على الأقل' },
    // Optional email validation for when user enters email format
    $autoDirty: true
  },
  password: { 
    required: { $validator: required, $message: 'كلمة المرور مطلوبة' },
    minLength: { $validator: minLength(4), $message: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل' },
    $autoDirty: true
  }
}));

const v$ = useVuelidate(validationRules, form);

// Check if user is attempting to access protected page
const isAttemptingProtected = computed(() => {
  const redirect = route.query.redirect;
  return redirect === '/dashboard' || 
         redirect === '/investor' ||
         (redirect && (redirect.startsWith('/dashboard') || redirect.startsWith('/investor')));
});

// Enhanced login handler with GraphQL
const handleLogin = async () => {
  // Validate form
  const isFormCorrect = await v$.value.$validate();
  if (!isFormCorrect) {
    return;
  }

  try {
    const result = await login({
      username: form.email,
      password: form.password
    });
    
    if (result.success) {
      // Redirect based on role or requested path
      const redirectPath = route.query.redirect;
      
      if (redirectPath && (redirectPath === '/dashboard' || redirectPath === '/investor')) {
        if (result.role === 'admin' && redirectPath === '/dashboard') {
          router.push('/dashboard');
        } else if (result.role === 'investor' && redirectPath === '/investor') {
          router.push('/investor');
        } else {
          router.push('/');
        }
      } else {
        // Default redirect based on role
        if (result.role === 'admin') {
          router.push('/dashboard');
        } else if (result.role === 'investor') {
          router.push('/investor');
        } else {
          router.push('/');
        }
      }
    } else {
      // Error is already set by the auth composable
      console.error('Login failed:', result.message);
    }
  } catch (err) {
    // Error is already handled by the auth composable
    console.error('Login error:', err);
  }
};

// Social login handler with GraphQL
const handleSocialLogin = async (provider) => {
  try {
    // In a real implementation, you would get the social token from the provider's SDK
    // For now, we'll simulate the social login flow
    const socialToken = 'mock_social_token'; // This would come from Google/Facebook/Microsoft SDK
    
    const result = await socialLogin(provider, socialToken);
    
    if (result.success) {
      // Redirect based on role
      if (result.role === 'admin') {
        router.push('/dashboard');
      } else if (result.role === 'investor') {
        router.push('/investor');
      } else {
        router.push('/');
      }
    } else {
      console.error('Social login failed:', result.message);
    }
  } catch (err) {
    console.error('Social login error:', err);
  }
};

// Initialize component
onMounted(() => {
  // Clear any existing errors
  error.value = null;
  
  // Check if user is already logged in and redirect if needed
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
/* إضافة تنسيق للرسالة التحذيرية */
.warning-message {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
  color: #ff9800;
}

.warning-message .message-icon {
  background: rgba(255, 152, 0, 0.2);
}

/* باقي التنسيقات كما هي */
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

.bg-effects {
  position: absolute;
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
  right: 10%;
  animation-delay: 5s;
}

.orb-3 {
  width: 150px;
  height: 150px;
  bottom: 20%;
  left: 60%;
  animation-delay: 10s;
}

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

/* Custom styles for dark luxury theme */
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

.v-btn {
  text-transform: none;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.v-alert {
  backdrop-filter: blur(10px);
}

.form-options {
  display: flex;
  justify-content: flex-end;
}

.demo-info {
  margin-top: 24px;
}

/* Responsive */
@media (max-width: 640px) {
  .glass-card {
    margin: 16px;
  }
}
</style>
