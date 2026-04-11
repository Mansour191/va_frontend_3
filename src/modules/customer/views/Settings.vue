<template>
  <v-main class="settings-page">
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
          <div class="header-content">
            <h1 class="text-h4 font-weight-bold mb-2">
              <v-icon class="me-2">mdi-cog</v-icon>
              الإعدادات
            </h1>
            <p class="text-body-1 text-medium-emphasis">إدارة حسابك وتفضيلاتك</p>
          </div>
        </v-card-title>

        <!-- Settings Navigation -->
        <v-divider />
        <v-card-text class="pa-0">
          <v-tabs
            v-model="activeTab"
            color="primary"
            align-tabs="center"
            class="settings-tabs"
          >
            <v-tab
              v-for="tab in tabs"
              :key="tab.id"
              :value="tab.id"
            >
              <v-icon :icon="tab.icon" class="me-2" />
              {{ tab.label }}
            </v-tab>
          </v-tabs>
        </v-card-text>

        <v-divider />

        <!-- Tab Content -->
        <v-card-text class="pa-6">
          <!-- Profile Settings -->
          <v-window v-model="activeTab">
            <v-window-item value="profile">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card class="settings-section" elevation="2">
                    <v-card-title class="text-h6">معلومات الحساب</v-card-title>
                    
                    <v-card-text>
                      <v-form ref="profileForm" v-model="profileFormValid">
                        <v-row>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="profileForm.firstName"
                              label="الاسم الأول"
                              variant="outlined"
                              :rules="[v => !!v || 'هذا الحقل مطلوب']"
                            />
                          </v-col>
                          <v-col cols="12" sm="6">
                            <v-text-field
                              v-model="profileForm.lastName"
                              label="الاسم الأخير"
                              variant="outlined"
                              :rules="[v => !!v || 'هذا الحقل مطلوب']"
                            />
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="profileForm.email"
                              label="البريد الإلكتروني"
                              variant="outlined"
                              type="email"
                              :rules="[v => !!v || 'هذا الحقل مطلوب', v => /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صالح']"
                            />
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="profileForm.phone"
                              label="رقم الهاتف"
                              variant="outlined"
                              :rules="[v => !!v || 'هذا الحقل مطلوب']"
                            />
                          </v-col>
                        </v-row>
                      </v-form>
                    </v-card-text>
                    
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        @click="updateProfile"
                        :loading="saving"
                        :disabled="!profileFormValid"
                      >
                        حفظ التغييرات
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Privacy Settings -->
            <v-window-item value="privacy">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card class="settings-section" elevation="2">
                    <v-card-title class="text-h6">خصوصية الحساب</v-card-title>
                    
                    <v-card-text>
                      <v-list>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-eye-off</v-icon>
                          </template>
                          <v-list-item-title>إخفاء الملف الشخصي</v-list-item-title>
                          <v-list-item-subtitle>جعل حسابك خاصاً وغير مرئي للآخرين</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-switch v-model="privacySettings.privateProfile" />
                          </template>
                        </v-list-item>
                        
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-account-search</v-icon>
                          </template>
                          <v-list-item-title>البحث عني</v-list-item-item>
                          <v-list-item-subtitle>السماح للآخرين بالعثور على حسابك</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-switch v-model="privacySettings.allowSearch" />
                          </template>
                        </v-list-item>
                        
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-account-multiple</v-icon>
                          </template>
                          <v-list-item-title>عرض الأصدقاء</v-list-item-title>
                          <v-list-item-subtitle>إظهار قائمة الأصدقاء في ملفك الشخصي</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-switch v-model="privacySettings.showFriends" />
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                    
                    <v-card-actions>
                      <v-btn
                        color="primary"
                        @click="updatePrivacySettings"
                        :loading="saving"
                      >
                        حفظ الإعدادات
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Security Settings -->
            <v-window-item value="security">
              <v-row>
                <v-col cols="12" md="8">
                  <v-card class="settings-section" elevation="2">
                    <v-card-title class="text-h6">أمان الحساب</v-card-title>
                    
                    <v-card-text>
                      <v-list>
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-lock</v-icon>
                          </template>
                          <v-list-item-title>تغيير كلمة المرور</v-list-item-title>
                          <v-list-item-subtitle>تحديث كلمة المرور الخاصة بك</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-btn variant="outlined" @click="showPasswordDialog = true">
                              تغيير
                            </v-btn>
                          </template>
                        </v-list-item>
                        
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-shield-account</v-icon>
                          </template>
                          <v-list-item-title>المصادقة الثنائية</v-list-item-title>
                          <v-list-item-subtitle>إضافة طبقة أمان إضافية لحسابك</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-switch v-model="securitySettings.twoFactorEnabled" />
                          </template>
                        </v-list-item>
                        
                        <v-list-item>
                          <template v-slot:prepend>
                            <v-icon>mdi-cellphone-link</v-icon>
                          </template>
                          <v-list-item-title>الأجهزة المتصلة</v-list-item-title>
                          <v-list-item-subtitle>إدارة الأجهزة التي يمكنها الوصول لحسابك</v-list-item-subtitle>
                          <template v-slot:append>
                            <v-btn variant="outlined" @click="showDevicesDialog = true">
                              إدارة
                            </v-btn>
                          </template>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>

    <!-- Preferences Settings -->
    <v-window-item value="preferences">
      <v-row>
        <v-col cols="12" md="8">
          <v-card class="settings-section" elevation="2">
            <v-card-title class="text-h6">التفضيلات</v-card-title>
            
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="preferences.language"
                    :items="languageOptions"
                    label="اللغة"
                    variant="outlined"
                    prepend-inner-icon="mdi-translate"
                  />
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="preferences.theme"
                    :items="themeOptions"
                    label="المظهر"
                    variant="outlined"
                    prepend-inner-icon="mdi-palette"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="preferences.currency"
                    :items="currencyOptions"
                    label="العملة"
                    variant="outlined"
                    prepend-inner-icon="mdi-currency"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="preferences.timezone"
                    :items="timezoneOptions"
                    label="المنطقة الزمنية"
                    variant="outlined"
                    prepend-inner-icon="mdi-clock"
                  />
                </v-col>
              </v-row>
            </v-card-text>
            
            <v-card-actions>
              <v-btn
                color="primary"
                @click="updatePreferences"
                :loading="saving"
              >
                حفظ التفضيلات
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-window-item>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Change Password Dialog -->
    <v-dialog v-model="showPasswordDialog" max-width="500">
      <v-card>
        <v-card-title>تغيير كلمة المرور</v-card-title>
        
        <v-card-text>
          <v-form ref="passwordForm" v-model="passwordFormValid">
            <v-text-field
              v-model="passwordForm.currentPassword"
              label="كلمة المرور الحالية"
              variant="outlined"
              type="password"
              :rules="[v => !!v || 'هذا الحقل مطلوب']"
            />
            <v-text-field
              v-model="passwordForm.newPassword"
              label="كلمة المرور الجديدة"
              variant="outlined"
              type="password"
              :rules="[v => !!v || 'هذا الحقل مطلوب', v => v.length >= 8 || 'يجب أن تكون 8 أحرف على الأقل']"
            />
            <v-text-field
              v-model="passwordForm.confirmPassword"
              label="تأكيد كلمة المرور الجديدة"
              variant="outlined"
              type="password"
              :rules="[v => !!v || 'هذا الحقل مطلوب', v => v === passwordForm.newPassword || 'كلمات المرور غير متطابقة']"
            />
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showPasswordDialog = false">إلغاء</v-btn>
          <v-btn 
            color="primary" 
            @click="changePassword"
            :loading="changingPassword"
            :disabled="!passwordFormValid"
          >
            تغيير
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
<script setup>
import { ref, reactive, onMounted } from 'vue';
import SettingsService from '@/integration/services/SettingsService';
import SmartAlertManager from '@/components/alerts/SmartAlertManager.vue';

const settingsService = SettingsService;

// Reactive data
const overlayActive = ref(true);
const saving = ref(false);
const changingPassword = ref(false);
const activeTab = ref('profile');
const showPasswordDialog = ref(false);
const showDevicesDialog = ref(false);
const profileFormValid = ref(false);
const passwordFormValid = ref(false);
const profileFormRef = ref(null);
const passwordFormRef = ref(null);

const profileForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const privacySettings = reactive({
  privateProfile: false,
  allowSearch: true,
  showFriends: true
});

const securitySettings = reactive({
  twoFactorEnabled: false
});

const preferences = reactive({
  language: 'ar',
  theme: 'auto',
  currency: 'DZD',
  timezone: 'Africa/Algiers'
});

const tabs = ref([
  { id: 'profile', label: 'الملف الشخصي', icon: 'mdi-account' },
  { id: 'privacy', label: 'الخصوصية', icon: 'mdi-lock' },
  { id: 'security', label: 'الأمان', icon: 'mdi-shield-account' },
  { id: 'preferences', label: 'التفضيلات', icon: 'mdi-cog' },
  { id: 'alerts', label: 'إعدادات التنبيهات الذكية', icon: 'mdi-bell' }
]);

const languageOptions = [
  { title: 'العربية', value: 'ar' },
  { title: 'English', value: 'en' },
  { title: 'Français', value: 'fr' }
];

const themeOptions = [
  { title: 'تلقائي', value: 'auto' },
  { title: 'فاتح', value: 'light' },
  { title: 'داكن', value: 'dark' }
];

const currencyOptions = [
  { title: 'دينار جزائري (DZD)', value: 'DZD' },
  { title: 'يورو (EUR)', value: 'EUR' },
  { title: 'دولار أمريكي (USD)', value: 'USD' }
];

const timezoneOptions = [
  { title: 'الجزائر (GMT+1)', value: 'Africa/Algiers' },
  { title: 'باريس (GMT+1)', value: 'Europe/Paris' },
  { title: 'لندن (GMT+0)', value: 'Europe/London' },
  { title: 'نيويورك (GMT-5)', value: 'America/New_York' }
];

// Methods
const loadSettings = async () => {
  try {
    // Load all settings from API
    const [profileData, privacyData, securityData, preferencesData] = await Promise.all([
      settingsService.getProfileSettings(),
      settingsService.getPrivacySettings(),
      settingsService.getSecuritySettings(),
      settingsService.getPreferences()
    ]);
    
    // Update reactive data
    Object.assign(profileForm, profileData);
    Object.assign(privacySettings, privacyData);
    Object.assign(securitySettings, securityData);
    Object.assign(preferences, preferencesData);
    
    console.log('✅ Settings loaded successfully');
  } catch (error) {
    console.error('❌ Error loading settings:', error);
  }
};

const updateProfile = async () => {
  if (!profileFormValid.value) return;
  
  saving.value = true;
  try {
    await settingsService.updateProfileSettings(profileForm);
    console.log('✅ Profile updated successfully');
    // Show success message
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    // Show error message
  } finally {
    saving.value = false;
  }
};

const updatePrivacySettings = async () => {
  saving.value = true;
  try {
    await settingsService.updatePrivacySettings(privacySettings);
    console.log('✅ Privacy settings updated successfully');
    // Show success message
  } catch (error) {
    console.error('❌ Error updating privacy settings:', error);
    // Show error message
  } finally {
    saving.value = false;
  }
};

const updatePreferences = async () => {
  saving.value = true;
  try {
    await settingsService.updatePreferences(preferences);
    console.log('✅ Preferences updated successfully');
    
    // Apply theme change
    if (preferences.theme !== 'auto') {
      document.documentElement.setAttribute('data-theme', preferences.theme);
    }
    // Show success message
  } catch (error) {
    console.error('❌ Error updating preferences:', error);
    // Show error message
  } finally {
    saving.value = false;
  }
};

const changePassword = async () => {
  if (!passwordFormValid.value) return;
  
  changingPassword.value = true;
  try {
    await settingsService.changePassword(passwordForm);
    console.log('✅ Password changed successfully');
    
    // Reset form and close dialog
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    if (passwordForm.value) {
      passwordForm.value.reset();
    }
    
    showPasswordDialog.value = false;
    // Show success message
  } catch (error) {
    console.error('❌ Error changing password:', error);
    // Show error message
  } finally {
    changingPassword.value = false;
  }
};

onMounted(() => {
  loadSettings();
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

.settings-section {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.settings-section:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
}
</style>
                    />
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    v-model="profileForm.email" 
                    class="form-input"
                    placeholder="أدخل بريدك الإلكتروني"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">رقم الهاتف</label>
                  <input 
                    type="tel" 
                    v-model="profileForm.phone" 
                    class="form-input"
                    placeholder="أدخل رقم هاتفك"
                  />
                </div>
                <div class="form-actions">
                  <button type="submit" class="save-btn" :disabled="loading">
                    <i class="fa-solid fa-save"></i>
                    <span v-if="!loading">حفظ التغييرات</span>
                    <span v-else class="loading-text">
                      <i class="fa-solid fa-spinner fa-spin"></i>
                      جاري الحفظ...
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Security Settings -->
          <div v-if="activeTab === 'security'" class="tab-panel">
            <div class="settings-section">
              <h2 class="section-title">تغيير كلمة المرور</h2>
              <form @submit.prevent="changePassword" class="settings-form">
                <div class="form-group">
                  <label class="form-label">كلمة المرور الحالية</label>
                  <input 
                    type="password" 
                    v-model="passwordForm.oldPassword" 
                    class="form-input"
                    placeholder="أدخل كلمة المرور الحالية"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    v-model="passwordForm.newPassword" 
                    class="form-input"
                    placeholder="أدخل كلمة المرور الجديدة"
                    required
                  />
                  <div class="password-strength" v-if="passwordForm.newPassword">
                    <div class="strength-bars">
                      <div 
                        v-for="n in 4" 
                        :key="n" 
                        :class="['strength-bar', { active: n <= passwordStrength.score }]"
                      ></div>
                    </div>
                    <span class="strength-text">{{ passwordStrength.text }}</span>
                  </div>
                </div>
                <div class="form-group">
                  <label class="form-label">تأكيد كلمة المرور الجديدة</label>
                  <input 
                    type="password" 
                    v-model="passwordForm.confirmPassword" 
                    class="form-input"
                    placeholder="أعد إدخال كلمة المرور الجديدة"
                    required
                  />
                </div>
                <div class="form-actions">
                  <button type="submit" class="save-btn" :disabled="loading">
                    <i class="fa-solid fa-lock"></i>
                    <span v-if="!loading">تغيير كلمة المرور</span>
                    <span v-else class="loading-text">
                      <i class="fa-solid fa-spinner fa-spin"></i>
                      جاري التغيير...
                    </span>
                  </button>
                </div>
              </form>
            </div>

            <div class="settings-section">
              <h2 class="section-title">الأمان</h2>
              <div class="security-options">
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">المصادقة الثنائية</h3>
                    <p class="option-description">إضافة طبقة أمان إضافية لحسابك</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="securitySettings.twoFactor" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">تسجيل الخروج التلقائي</h3>
                    <p class="option-description">تسجيل الخروج تلقائياً بعد فترة من عدم النشاط</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="securitySettings.autoLogout" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div v-if="activeTab === 'notifications'" class="tab-panel">
            <div class="settings-section">
              <h2 class="section-title">إعدادات الإشعارات</h2>
              <div class="notification-options">
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">الإشعارات عبر البريد الإلكتروني</h3>
                    <p class="option-description">استلام الإشعارات الهامة عبر البريد الإلكتروني</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="notificationSettings.email" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">الإشعارات عبر الرسائل النصية</h3>
                    <p class="option-description">استلام الإشعارات الهامة عبر الرسائل النصية</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="notificationSettings.sms" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">الإشعارات الفورية</h3>
                    <p class="option-description">استلام الإشعارات الفورية في المتصفح</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="notificationSettings.push" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">نشرات المنتجات</h3>
                    <p class="option-description">إشعارات حول المنتجات الجديدة والعروض</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="notificationSettings.marketing" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Settings -->
          <div v-if="activeTab === 'privacy'" class="tab-panel">
            <div class="settings-section">
              <h2 class="section-title">الخصوصية</h2>
              <div class="privacy-options">
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">الملف الشخصي العام</h3>
                    <p class="option-description">جعل ملفك الشخصي مرئياً للجميع</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacySettings.publicProfile" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">إظهار النشاط</h3>
                    <p class="option-description">إظهار نشاطك الأخير للآخرين</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacySettings.showActivity" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
                <div class="option-item">
                  <div class="option-info">
                    <h3 class="option-title">البحث عني</h3>
                    <p class="option-description">السماح للآخرين بالعثور عنك عبر البحث</p>
                  </div>
                  <label class="toggle-switch">
                    <input type="checkbox" v-model="privacySettings.allowSearch" />
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>

            <div class="settings-section">
              <h2 class="section-title">حذف الحساب</h2>
              <div class="danger-zone">
                <p class="danger-text">
                  حذف حسابك سيزيل جميع بياناتك بشكل دائم. هذا الإجراء لا يمكن التراجع عنه.
                </p>
                <button class="danger-btn" @click="confirmDeleteAccount">
                  <i class="fa-solid fa-trash"></i>
                  حذف الحساب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" :class="['message-toast', message.type]">
      <div class="message-icon">
        <i :class="message.type === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle'"></i>
      </div>
      <div class="message-content">
        <span class="message-text">{{ message.text }}</span>
      </div>
      <button class="message-close" @click="clearMessage">
        <i class="fa-solid fa-times"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/store/auth';

const authStore = useAuthStore();

const activeTab = ref('profile');
const loading = ref(false);
const message = ref(null);

const tabs = [
  { id: 'profile', label: 'الملف الشخصي', icon: 'fa-solid fa-user' },
  { id: 'security', label: 'الأمان', icon: 'fa-solid fa-shield-alt' },
  { id: 'notifications', label: 'الإشعارات', icon: 'fa-solid fa-bell' },
  { id: 'privacy', label: 'الخصوصية', icon: 'fa-solid fa-lock' }
];

const passwordStrength = reactive({
  score: 0,
  text: ''
});

const securitySettings = reactive({
  twoFactor: false,
  autoLogout: false
});

const notificationSettings = reactive({
  email: true,
  sms: false,
  push: true,
  marketing: false
});

const privacySettings = reactive({
  publicProfile: false,
  showActivity: true,
  allowSearch: true
});

// Password strength checker
const checkPasswordStrength = () => {
  const password = passwordForm.newPassword;
  if (!password) {
    passwordStrength.score = 0;
    passwordStrength.text = '';
    return;
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
  if (password.match(/[0-9]/)) score++;
  if (password.match(/[^a-zA-Z0-9]/)) score++;

  passwordStrength.score = score;

  const strengthTexts = {
    0: 'ضعيف جداً',
    1: 'ضعيف',
    2: 'متوسط',
    3: 'قوي',
    4: 'قوي جداً'
  };
  passwordStrength.text = strengthTexts[score];
};

// Watch password changes
import { watch } from 'vue';
watch(() => passwordForm.newPassword, checkPasswordStrength);

const updateProfile = async () => {
  try {
    loading.value = true;
    
    await authStore.updateProfile(profileForm);
    
    showMessage('تم تحديث الملف الشخصي بنجاح', 'success');
  } catch (error) {
    showMessage(error.message || 'فشل تحديث الملف الشخصي', 'error');
  } finally {
    loading.value = false;
  }
};

const changePassword = async () => {
  try {
    loading.value = true;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('كلمات المرور الجديدة غير متطابقة', 'error');
      return;
    }
    
    await authStore.changePassword(
      passwordForm.oldPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    
    showMessage('تم تغيير كلمة المرور بنجاح', 'success');
    
    // Clear form
    passwordForm.oldPassword = '';
    passwordForm.newPassword = '';
    passwordForm.confirmPassword = '';
  } catch (error) {
    showMessage(error.message || 'فشل تغيير كلمة المرور', 'error');
  } finally {
    loading.value = false;
  }
};

const confirmDeleteAccount = () => {
  if (confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.')) {
    // TODO: Implement delete account functionality
    showMessage('سيتم تنفيذ حذف الحساب قريباً', 'info');
  }
};

const showMessage = (text, type) => {
  message.value = { text, type };
  setTimeout(() => {
    message.value = null;
  }, 5000);
};

const clearMessage = () => {
  message.value = null;
};

const loadUserData = () => {
  if (authStore.user) {
    profileForm.firstName = authStore.user.firstName || '';
    profileForm.lastName = authStore.user.lastName || '';
    profileForm.email = authStore.user.email || '';
    profileForm.phone = authStore.user.phone || '';
  }
};

onMounted(() => {
  loadUserData();
});
</script>

<style scoped>
/* ===== Settings Page ===== */
.settings-page {
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

/* Settings Container */
.settings-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 900px;
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
.settings-header {
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* Settings Navigation */
.settings-nav {
  display: flex;
  gap: 8px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 10px;
  overflow-x: auto;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px 8px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.nav-btn:hover {
  color: #ffffff;
  background: rgba(255, 255, 255, 0.05);
}

.nav-btn.active {
  color: #d4af37;
  background: rgba(212, 175, 55, 0.1);
}

.nav-btn i {
  font-size: 16px;
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Settings Sections */
.settings-section {
  margin-bottom: 40px;
}

.section-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

/* Forms */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.strength-bars {
  display: flex;
  gap: 4px;
}

.strength-bar {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-bar.active:nth-child(1) {
  background: #dc3545;
}

.strength-bar.active:nth-child(2) {
  background: #ffc107;
}

.strength-bar.active:nth-child(3) {
  background: #007bff;
}

.strength-bar.active:nth-child(4) {
  background: #28a745;
}

.strength-text {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

/* Form Actions */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
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

/* Options */
.security-options,
.notification-options,
.privacy-options {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.option-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.option-info {
  flex: 1;
}

.option-title {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.option-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  margin: 0;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: 0.4s;
  border-radius: 30px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 3px;
  background: rgba(255, 255, 255, 0.7);
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background: rgba(212, 175, 55, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

input:checked + .toggle-slider:before {
  transform: translateX(30px);
  background: #d4af37;
}

/* Danger Zone */
.danger-zone {
  padding: 24px;
  background: rgba(220, 53, 69, 0.1);
  border: 1px solid rgba(220, 53, 69, 0.2);
  border-radius: 12px;
}

.danger-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.danger-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.danger-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

/* Message Toast */
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.message-toast.success {
  background: rgba(40, 167, 69, 0.9);
  color: #ffffff;
}

.message-toast.error {
  background: rgba(220, 53, 69, 0.9);
  color: #ffffff;
}

.message-toast.info {
  background: rgba(0, 123, 255, 0.9);
  color: #ffffff;
}

.message-icon {
  font-size: 20px;
}

.message-content {
  flex: 1;
}

.message-text {
  font-weight: 500;
}

.message-close {
  background: transparent;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.message-close:hover {
  opacity: 1;
}

/* Responsive Design */
@media (max-width: 768px) {
  .settings-page {
    padding: 10px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .settings-nav {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .nav-btn {
    padding: 8px 12px;
    font-size: 14px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .option-item {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
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
