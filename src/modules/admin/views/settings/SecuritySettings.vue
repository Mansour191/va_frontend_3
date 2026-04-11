<template>
  <v-container fluid class="security-settings pa-4">
    <!-- Header -->
    <v-card class="security-header mb-6" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar
                color="#d4af37"
                size="48"
                class="me-4"
              >
                <v-icon icon="mdi-shield-account" size="28"></v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold">
                  {{ $t('security.title', 'إعدادات الأمان') }}
                </h1>
                <p class="text-body-1 text-dim mt-1">
                  {{ $t('security.subtitle', 'إعدادات الأمان والصلاحيات') }}
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-2 justify-md-end justify-start">
              <v-btn
                @click="saveAllSettings"
                variant="elevated"
                prepend-icon="mdi-content-save"
                color="#d4af37"
                class="save-btn"
                :loading="loading"
              >
                {{ $t('common.save', 'حفظ') }}
              </v-btn>
              <v-btn
                @click="resetSettings"
                variant="outlined"
                prepend-icon="mdi-refresh"
                class="reset-btn"
              >
                {{ $t('common.reset', 'إعادة تعيين') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Settings Tabs -->
    <v-card class="settings-tabs mb-6" elevation="2">
      <v-tabs
        v-model="activeTab"
        align-tabs="center"
        color="#d4af37"
        class="settings-tabs-container"
      >
        <v-tab
          v-for="tab in tabs"
          :key="tab.id"
          :value="tab.id"
          class="settings-tab"
        >
          <v-icon :icon="tab.icon" size="20" class="me-2"></v-icon>
          {{ tab.name }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Tab Content -->
    <v-card class="settings-content" elevation="2">
      <v-card-text class="pa-4">
        <!-- Password Policy -->
        <div v-if="activeTab === 'password'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-key" size="24" class="me-2"></v-icon>
            {{ $t('security.passwordPolicy', 'سياسة كلمات المرور') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="passwordPolicy.minLength"
                :label="$t('security.minLength', 'الحد الأدنى للطول')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>

              <v-switch
                v-model="passwordPolicy.requireUppercase"
                :label="$t('security.requireUppercase', 'يتطلب أحرف كبيرة')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="passwordPolicy.requireLowercase"
                :label="$t('security.requireLowercase', 'يتطلب أحرف صغيرة')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="passwordPolicy.requireNumbers"
                :label="$t('security.requireNumbers', 'يتطلب أرقام')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="passwordPolicy.requireSpecialChars"
                :label="$t('security.requireSpecialChars', 'يتطلب رموز خاصة')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-text-field
                v-model="passwordPolicy.passwordExpiry"
                :label="$t('security.passwordExpiry', 'انتهاء صلاحية كلمة المرور (أيام)')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <!-- Session Settings -->
        <div v-if="activeTab === 'session'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-clock" size="24" class="me-2"></v-icon>
            {{ $t('security.sessionSettings', 'إعدادات الجلسات') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="sessionSettings.sessionTimeout"
                :label="$t('security.sessionTimeout', 'مهلة الجلسة (دقائق)')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="sessionSettings.maxConcurrentSessions"
                :label="$t('security.maxConcurrentSessions', 'الحد الأقصى للجلسات المتزامنة')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="sessionSettings.requireReauth"
                :label="$t('security.requireReauth', 'يتطلب إعادة المصادقة')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="sessionSettings.autoLogout"
                :label="$t('security.autoLogout', 'تسجيل الخروج التلقائي')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>
          </v-row>
        </div>

        <!-- Two-Factor Authentication -->
        <div v-if="activeTab === '2fa'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-two-factor-authentication" size="24" class="me-2"></v-icon>
            {{ $t('security.twoFactorAuth', 'المصادقة الثنائية') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="twoFactorAuth.enabled"
                :label="$t('security.enable2FA', 'تمكين المصادقة الثنائية')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="twoFactorAuth.requiredForAdmins"
                :label="$t('security.requiredForAdmins', 'مطلوبة للمسؤولين')"
                color="#d4af37"
                hide-details
                class="mb-4"
                :disabled="!twoFactorAuth.enabled"
              ></v-switch>

              <v-switch
                v-model="twoFactorAuth.requiredForUsers"
                :label="$t('security.requiredForUsers', 'مطلوبة للمستخدمين')"
                color="#d4af37"
                hide-details
                class="mb-4"
                :disabled="!twoFactorAuth.enabled"
              ></v-switch>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="twoFactorAuth.backupCodesEnabled"
                :label="$t('security.backupCodes', 'رموز النسخ الاحتياطي')"
                color="#d4af37"
                hide-details
                class="mb-4"
                :disabled="!twoFactorAuth.enabled"
              ></v-switch>

              <v-alert
                v-if="twoFactorAuth.enabled"
                type="info"
                variant="tonal"
                class="mb-4"
              >
                <v-icon icon="mdi-information" size="20" class="me-2"></v-icon>
                {{ $t('security.twoFactorInfo', 'المصادقة الثنائية توفر طبقة إضافية من الأمان لحسابات المستخدمين') }}
              </v-alert>
            </v-col>
          </v-row>
        </div>

        <!-- Login Security -->
        <div v-if="activeTab === 'login'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-login" size="24" class="me-2"></v-icon>
            {{ $t('security.loginSecurity', 'أمان تسجيل الدخول') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="loginSecurity.maxLoginAttempts"
                :label="$t('security.maxLoginAttempts', 'الحد الأقصى لمحاولات تسجيل الدخول')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>

              <v-text-field
                v-model="loginSecurity.lockoutDuration"
                :label="$t('security.lockoutDuration', 'مدة القفل (دقائق)')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="loginSecurity.captchaEnabled"
                :label="$t('security.captchaEnabled', 'تمكين CAPTCHA')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="loginSecurity.ipWhitelistEnabled"
                :label="$t('security.ipWhitelist', 'القائمة البيضاء للعناوين IP')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>
          </v-row>
        </div>

        <!-- API Security -->
        <div v-if="activeTab === 'api'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-api" size="24" class="me-2"></v-icon>
            {{ $t('security.apiSecurity', 'أمان الـ API') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="apiSecurity.rateLimiting"
                :label="$t('security.rateLimiting', 'تقييد معدل الطلبات')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="apiSecurity.apiKeyRequired"
                :label="$t('security.apiKeyRequired', 'يتطلب مفتاح API')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="apiSecurity.corsEnabled"
                :label="$t('security.corsEnabled', 'تمكين CORS')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="apiSecurity.httpsOnly"
                :label="$t('security.httpsOnly', 'HTTPS فقط')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>
          </v-row>
        </div>

        <!-- Audit Settings -->
        <div v-if="activeTab === 'audit'" class="settings-section">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon icon="mdi-history" size="24" class="me-2"></v-icon>
            {{ $t('security.auditSettings', 'إعدادات التدقيق') }}
          </h2>

          <v-row>
            <v-col cols="12" md="6">
              <v-switch
                v-model="auditSettings.logAllActions"
                :label="$t('security.logAllActions', 'تسجيل جميع الإجراءات')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-switch
                v-model="auditSettings.logFailedLogins"
                :label="$t('security.logFailedLogins', 'تسجيل عمليات تسجيل الدخول الفاشلة')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>
            </v-col>

            <v-col cols="12" md="6">
              <v-switch
                v-model="auditSettings.logPasswordChanges"
                :label="$t('security.logPasswordChanges', 'تسجيل تغييرات كلمة المرور')"
                color="#d4af37"
                hide-details
                class="mb-4"
              ></v-switch>

              <v-text-field
                v-model="auditSettings.retentionPeriod"
                :label="$t('security.retentionPeriod', 'فترة الاحتفاظ بالسجلات (أيام)')"
                type="number"
                variant="outlined"
                hide-details
                class="mb-4"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>
      </v-card-text>
    </v-card>

    <!-- Security Status -->
    <v-card class="security-status mt-6" elevation="2">
      <v-card-title class="pa-4">
        <h3 class="text-h6 font-weight-bold">
          <v-icon icon="mdi-shield-check" size="20" class="me-2"></v-icon>
          {{ $t('security.status', 'حالة الأمان') }}
        </h3>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-4">
        <v-row>
          <v-col cols="12" md="4">
            <v-card class="status-card" elevation="1">
              <v-card-text class="pa-4 text-center">
                <v-icon icon="mdi-shield-check" size="48" color="success" class="mb-2"></v-icon>
                <h4 class="text-h6 font-weight-bold">{{ $t('security.overall', 'إجمالي') }}</h4>
                <v-chip color="success" variant="elevated" class="mt-2">
                  {{ $t('security.secure', 'آمن') }}
                </v-chip>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="status-card" elevation="1">
              <v-card-text class="pa-4 text-center">
                <v-icon icon="mdi-account-key" size="48" color="#d4af37" class="mb-2"></v-icon>
                <h4 class="text-h6 font-weight-bold">{{ $t('security.activeUsers', 'المستخدمون النشطون') }}</h4>
                <p class="text-h4 font-weight-bold mt-2">{{ activeUsers }}</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card class="status-card" elevation="1">
              <v-card-text class="pa-4 text-center">
                <v-icon icon="mdi-alert-circle" size="48" color="warning" class="mb-2"></v-icon>
                <h4 class="text-h6 font-weight-bold">{{ $t('security.securityEvents', 'أحداث الأمان') }}</h4>
                <p class="text-h4 font-weight-bold mt-2">{{ securityEvents }}</p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import SecurityService from '@/services/SecurityService';

// Store and i18n
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const activeTab = ref('password');
const activeUsers = ref(2341);
const securityEvents = ref(12);

// Settings data
const passwordPolicy = ref({
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  passwordExpiry: 90
});

const sessionSettings = ref({
  sessionTimeout: 30,
  maxConcurrentSessions: 3,
  requireReauth: false,
  autoLogout: true
});

const twoFactorAuth = ref({
  enabled: true,
  requiredForAdmins: true,
  requiredForUsers: false,
  backupCodesEnabled: true
});

const loginSecurity = ref({
  maxLoginAttempts: 5,
  lockoutDuration: 15,
  captchaEnabled: true,
  ipWhitelistEnabled: false
});

const apiSecurity = ref({
  rateLimiting: true,
  apiKeyRequired: false,
  corsEnabled: true,
  httpsOnly: true
});

const auditSettings = ref({
  logAllActions: true,
  logFailedLogins: true,
  logPasswordChanges: true,
  logPermissionChanges: true,
  retentionPeriod: 90
});

// Tabs configuration
const tabs = ref([
  { id: 'password', name: t('security.password', 'كلمة المرور'), icon: 'mdi-key' },
  { id: 'session', name: t('security.session', 'الجلسات'), icon: 'mdi-clock' },
  { id: '2fa', name: t('security.twoFactor', 'المصادقة الثنائية'), icon: 'mdi-two-factor-authentication' },
  { id: 'login', name: t('security.login', 'تسجيل الدخول'), icon: 'mdi-login' },
  { id: 'api', name: t('security.api', 'API'), icon: 'mdi-api' },
  { id: 'audit', name: t('security.audit', 'التدقيق'), icon: 'mdi-history' }
]);

// Methods
const loadSecuritySettings = async () => {
  try {
    loading.value = true;
    const response = await SecurityService.getSecuritySettings();
    
    if (response.success) {
      const settings = response.data;
      passwordPolicy.value = { ...passwordPolicy.value, ...settings.passwordPolicy };
      sessionSettings.value = { ...sessionSettings.value, ...settings.sessionSettings };
      twoFactorAuth.value = { ...twoFactorAuth.value, ...settings.twoFactorAuth };
      loginSecurity.value = { ...loginSecurity.value, ...settings.loginSecurity };
      apiSecurity.value = { ...apiSecurity.value, ...settings.apiSecurity };
      auditSettings.value = { ...auditSettings.value, ...settings.auditSettings };
    }
  } catch (error) {
    console.error('Error loading security settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('security.loadError', 'فشل في تحميل إعدادات الأمان')
    });
  } finally {
    loading.value = false;
  }
};

const saveAllSettings = async () => {
  try {
    loading.value = true;
    
    const settings = {
      passwordPolicy: passwordPolicy.value,
      sessionSettings: sessionSettings.value,
      twoFactorAuth: twoFactorAuth.value,
      loginSecurity: loginSecurity.value,
      apiSecurity: apiSecurity.value,
      auditSettings: auditSettings.value
    };

    const response = await SecurityService.updateSecuritySettings(settings);
    
    if (response.success) {
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('security.saveSuccess', 'تم حفظ إعدادات الأمان بنجاح')
      });
    }
  } catch (error) {
    console.error('Error saving security settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('security.saveError', 'فشل في حفظ إعدادات الأمان')
    });
  } finally {
    loading.value = false;
  }
};

const resetSettings = async () => {
  try {
    loading.value = true;
    const response = await SecurityService.resetSettings();
    
    if (response.success) {
      await loadSecuritySettings();
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('security.resetSuccess', 'تم إعادة تعيين الإعدادات بنجاح')
      });
    }
  } catch (error) {
    console.error('Error resetting settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('security.resetError', 'فشل في إعادة تعيين الإعدادات')
    });
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  loadSecuritySettings();
});
</script>

<style scoped>
.security-settings {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
}

/* Header Styles */
.security-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.save-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
  font-weight: 600;
  border: none;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.reset-btn {
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

/* Tabs Styles */
.settings-tabs {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.settings-tabs-container :deep(.v-tabs-slider) {
  background: #d4af37;
}

.settings-tab {
  font-weight: 500;
  transition: all 0.3s ease;
}

/* Content Styles */
.settings-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.settings-section {
  animation: fadeIn 0.6s ease-out;
}

/* Status Cards */
.security-status {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.status-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.status-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

/* Text Styles */
.text-dim {
  color: #666 !important;
}

/* Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 960px) {
  .security-header .v-btn {
    font-size: 0.875rem;
  }
  
  .status-card {
    margin-bottom: 16px;
  }
}

@media (max-width: 600px) {
  .security-settings {
    padding: 1rem;
  }
  
  .security-header,
  .settings-tabs,
  .settings-content,
  .security-status {
    border-radius: 12px;
  }
}
</style>
