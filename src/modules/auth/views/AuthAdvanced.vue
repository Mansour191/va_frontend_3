<template>
  <v-container class="auth-page" fluid>
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="gradient-overlay"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
      <div class="floating-orb orb-4"></div>
      <div class="grid-pattern"></div>
    </div>

    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="10" md="8" lg="6" xl="4">
        <v-card class="glass-card" elevation="8">
          <v-card-text class="pa-8">
            <!-- Logo Section -->
            <div class="text-center mb-8">
              <div class="logo-circle">
                <v-icon size="48" color="primary">mdi-gem</v-icon>
              </div>
              <h1 class="logo-text">Paclos</h1>
              <p class="logo-subtitle">نظام التسجيل المتقدم</p>
            </div>

            <!-- Auth Forms -->
            <div class="auth-forms">
              <!-- Login Form -->
              <div v-if="currentView === 'login'" class="auth-form">
                <h2 class="form-title">تسجيل الدخول</h2>
                <p class="form-subtitle">مرحباً بعودتك! سجل الدخول لحسابك</p>

                <v-form @submit.prevent="handleLogin" class="form">
                  <v-text-field
                    v-model="loginForm.emailOrUsername"
                    label="البريد الإلكتروني أو اسم المستخدم"
                    prepend-inner-icon="mdi-account"
                    variant="outlined"
                    required
                    :rules="emailOrUsernameRules"
                    placeholder="أدخل بريدك الإلكتروني أو اسم المستخدم"
                    autocomplete="username"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="loginForm.password"
                    label="كلمة المرور"
                    prepend-inner-icon="mdi-lock"
                    :type="showPassword ? 'text' : 'password'"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="outlined"
                    required
                    :rules="passwordRules"
                    placeholder="أدخل كلمة المرور"
                    autocomplete="current-password"
                    @click:append-inner="showPassword = !showPassword"
                    class="mb-4"
                  />

                  <div class="form-options mb-4">
                    <v-checkbox
                      v-model="loginForm.rememberMe"
                      label="تذكرني"
                      color="primary"
                      density="compact"
                      hide-details
                    />
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
                    :loading="loading"
                    class="mb-6"
                  >
                    <v-icon start>mdi-login</v-icon>
                    <span v-if="!loading">تسجيل الدخول</span>
                    <span v-else>جاري تسجيل الدخول...</span>
                  </v-btn>
                </v-form>

                <!-- Social Login -->
                <div class="social-login">
                  <v-divider class="my-6">
                    <span class="divider-text">أو سجل الدخول باستخدام</span>
                  </v-divider>
                  <div class="social-buttons">
                    <v-btn
                      variant="outlined"
                      prepend-icon="mdi-google"
                      @click="socialLogin('google')"
                      class="social-btn google"
                    >
                      Google
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      prepend-icon="mdi-facebook"
                      @click="socialLogin('facebook')"
                      class="social-btn facebook"
                    >
                      Facebook
                    </v-btn>
                    <v-btn
                      variant="outlined"
                      prepend-icon="mdi-microsoft"
                      @click="socialLogin('microsoft')"
                      class="social-btn microsoft"
                    >
                      Microsoft
                    </v-btn>
                  </div>
                </div>

                <!-- Switch to Register -->
                <div class="switch-form text-center mt-6">
                  <p class="switch-text">
                    ليس لديك حساب؟
                    <v-btn
                      variant="text"
                      color="primary"
                      @click="currentView = 'register'"
                      class="switch-btn"
                    >
                      إنشاء حساب جديد
                    </v-btn>
                  </p>
                </div>
              </div>

          <!-- Register Form -->
              <div v-if="currentView === 'register'" class="auth-form">
                <h2 class="form-title">إنشاء حساب جديد</h2>
                <p class="form-subtitle">انضم إلينا وأنشئ حسابك الجديد</p>

                <v-form @submit.prevent="handleRegister" class="form">
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-text-field
                        v-model="registerForm.firstName"
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
                        v-model="registerForm.lastName"
                        label="الاسم الأخير"
                        prepend-inner-icon="mdi-account"
                        variant="outlined"
                        :rules="nameRules"
                        placeholder="أدخل اسمك الأخير"
                        autocomplete="family-name"
                        class="mb-4"
                      />
                    </v-col>
                  </v-row>

                  <v-text-field
                    v-model="registerForm.username"
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
                    v-model="registerForm.email"
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
                    v-model="registerForm.phone"
                    label="رقم الهاتف"
                    prepend-inner-icon="mdi-phone"
                    variant="outlined"
                    type="tel"
                    :rules="phoneRules"
                    placeholder="أدخل رقم هاتفك"
                    autocomplete="tel"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="registerForm.password"
                    label="كلمة المرور"
                    prepend-inner-icon="mdi-lock"
                    :type="showRegPassword ? 'text' : 'password'"
                    :append-inner-icon="showRegPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    variant="outlined"
                    required
                    :rules="passwordRules"
                    placeholder="اختر كلمة مرور قوية"
                    autocomplete="new-password"
                    @click:append-inner="showRegPassword = !showRegPassword"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="registerForm.confirmPassword"
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

                  <div class="form-options mb-4">
                    <v-checkbox
                      v-model="registerForm.agreeTerms"
                      label="أوافق على الشروط والأحكام"
                      color="primary"
                      density="compact"
                      hide-details
                      :rules="termsRules"
                      required
                    />
                  </div>

                  <v-btn
                    type="submit"
                    block
                    size="large"
                    color="primary"
                    :loading="loading"
                    class="mb-6"
                  >
                    <v-icon start>mdi-account-plus</v-icon>
                    <span v-if="!loading">إنشاء حساب</span>
                    <span v-else>جاري إنشاء الحساب...</span>
                  </v-btn>
                </v-form>

                <!-- Switch to Login -->
                <div class="switch-form text-center mt-6">
                  <p class="switch-text">
                    لديك حساب بالفعل؟
                    <v-btn
                      variant="text"
                      color="primary"
                      @click="currentView = 'login'"
                      class="switch-btn"
                    >
                      تسجيل الدخول
                    </v-btn>
                  </p>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';

const router = useRouter();
const authStore = useAuthStore();

// View state
const currentView = ref('login');
const loading = ref(false);
const showPassword = ref(false);
const showRegPassword = ref(false);

// Login form
const loginForm = reactive({
  emailOrUsername: '',
  password: '',
  rememberMe: false
});

// Register form
const registerForm = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

// Validation rules
const emailOrUsernameRules = [
  v => !!v || 'البريد الإلكتروني أو اسم المستخدم مطلوب',
  v => v.length >= 3 || 'يجب أن يكون 3 أحرف على الأقل'
];

const passwordRules = [
  v => !!v || 'كلمة المرور مطلوبة',
  v => v.length >= 6 || 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
];

const nameRules = [
  v => !!v || 'الاسم مطلوب',
  v => v.length >= 2 || 'الاسم يجب أن يكون حرفين على الأقل'
];

const usernameRules = [
  v => !!v || 'اسم المستخدم مطلوب',
  v => v.length >= 3 || 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل',
  v => /^[a-zA-Z0-9_]+$/.test(v) || 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام وشرطات سفلية فقط'
];

const emailRules = [
  v => !!v || 'البريد الإلكتروني مطلوب',
  v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صالح'
];

const phoneRules = [
  v => !!v || 'رقم الهاتف مطلوب',
  v => /^[0-9+\-\s()]+$/.test(v) || 'رقم الهاتف غير صالح'
];

const confirmPasswordRules = [
  v => !!v || 'تأكيد كلمة المرور مطلوب',
  v => v === registerForm.password || 'كلمتا المرور غير متطابقتين'
];

const termsRules = [
  v => !!v || 'يجب الموافقة على الشروط والأحكام'
];

// Methods
const handleLogin = async () => {
  loading.value = true;
  try {
    const result = await authStore.login(loginForm.emailOrUsername, loginForm.password);
    if (result.success) {
      if (result.role === 'admin') {
        router.push('/dashboard');
      } else if (result.role === 'investor') {
        router.push('/investor');
      } else {
        router.push('/');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  try {
    const result = await authStore.register(registerForm);
    if (result.success) {
      currentView.value = 'login';
    }
  } catch (error) {
    console.error('Register error:', error);
  } finally {
    loading.value = false;
  }
};

const socialLogin = async (provider) => {
  loading.value = true;
  try {
    await authStore.socialLogin(provider);
  } catch (error) {
    console.error('Social login error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page {
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
.orb-4 { width: 100px; height: 100px; top: 30%; right: 30%; animation-delay: 15s; }

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

.grid-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(212, 175, 55, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 175, 55, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
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
.logo-circle {
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
.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.form-subtitle {
  color: var(--text-muted);
  margin-bottom: 24px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Social Buttons */
.social-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.social-btn {
  flex: 1;
  max-width: 120px;
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

.switch-text {
  color: var(--text-muted);
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
    max-width: none;
  }
}
</style>
