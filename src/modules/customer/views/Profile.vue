<template>
  <v-main class="profile-page">
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
        <!-- Profile Header -->
        <v-card-text class="pa-6">
          <v-row align="center" class="profile-header">
            <v-col cols="12" md="3" class="text-center">
              <!-- Avatar Section -->
              <div class="avatar-wrapper">
                <v-avatar size="120" class="avatar-circle">
                  <v-img 
                    v-if="currentUser?.profile?.avatar" 
                    :src="currentUser.profile.avatar" 
                    :alt="currentUser?.firstName || currentUser?.username"
                  />
                  <v-icon v-else size="60" color="primary">mdi-account</v-icon>
                </v-avatar>
                <v-btn
                  fab
                  size="small"
                  class="avatar-upload-btn"
                  @click="uploadAvatar"
                  :disabled="isLoading"
                >
                  <v-icon>mdi-camera</v-icon>
                </v-btn>
              </div>
            </v-col>
            
            <v-col cols="12" md="6">
              <!-- Profile Info -->
              <div class="profile-info">
                <h1 class="text-h4 font-weight-bold mb-2">
                  {{ currentUser?.firstName || currentUser?.username || 'مستخدم' }}
                </h1>
                <p class="text-body-1 text-medium-emphasis mb-4">
                  {{ currentUser?.email || 'لا يوجد بريد إلكتروني' }}
                </p>
                
                <!-- Stats -->
                <v-row class="profile-stats">
                  <v-col cols="4" class="text-center">
                    <div class="stat-item">
                      <div class="text-h4 font-weight-bold text-primary">{{ userStats.orders || 0 }}</div>
                      <div class="text-caption">طلب</div>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center">
                    <div class="stat-item">
                      <div class="text-h4 font-weight-bold text-primary">{{ userStats.wishlist || 0 }}</div>
                      <div class="text-caption">مفضل</div>
                    </div>
                  </v-col>
                  <v-col cols="4" class="text-center">
                    <div class="stat-item">
                      <div class="text-h4 font-weight-bold text-primary">{{ userStats.points || 0 }}</div>
                      <div class="text-caption">نقطة</div>
                    </div>
                  </v-col>
                </v-row>
              </div>
            </v-col>
            
            <v-col cols="12" md="3" class="text-center">
              <v-btn
                color="error"
                variant="outlined"
                prepend-icon="mdi-logout"
                @click="handleLogout"
                :loading="authStore.loading"
                class="logout-btn"
              >
                {{ authStore.loading ? 'جاري تسجيل الخروج...' : 'تسجيل الخروج' }}
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Navigation Tabs -->
        <v-divider />
        <v-card-text class="pa-0">
          <v-tabs
            v-model="activeTab"
            color="primary"
            align-tabs="center"
            class="profile-tabs"
          >
            <v-tab
              v-for="tab in tabs"
              :key="tab.name"
              :value="tab.name"
            >
              <v-icon :icon="tab.icon" class="me-2" />
              {{ tab.label }}
            </v-tab>
          </v-tabs>
        </v-card-text>

        <!-- Tab Content -->
        <v-divider />
        <v-card-text class="pa-6">
          <!-- Overview Tab -->
          <v-window v-model="activeTab">
            <v-window-item value="overview">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title class="d-flex align-center justify-space-between">
                      <div>
                        <v-icon class="me-2">mdi-account</v-icon>
                        المعلومات الشخصية
                      </div>
                      <v-btn
                        icon
                        variant="text"
                        @click="editProfile"
                        :loading="authStore.loading"
                      >
                        <v-icon>mdi-pencil</v-icon>
                      </v-btn>
                    </v-card-title>
                    
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-label class="text-caption">الاسم الكامل:</v-label>
                          <div v-if="!settingsForm.isEditing" class="text-body-1">
                            {{ currentUser?.firstName || 'غير محدد' }} {{ currentUser?.lastName || '' }}
                          </div>
                          <v-text-field
                            v-else
                            v-model="settingsForm.firstName"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-label class="text-caption">البريد الإلكتروني:</v-label>
                          <div v-if="!settingsForm.isEditing" class="text-body-1">
                            {{ currentUser?.email || 'غير محدد' }}
                          </div>
                          <v-text-field
                            v-else
                            v-model="settingsForm.email"
                            variant="outlined"
                            density="compact"
                            type="email"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-phone</v-icon>
                      معلومات الاتصال
                    </v-card-title>
                    
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-label class="text-caption">رقم الهاتف:</v-label>
                          <div v-if="!settingsForm.isEditing" class="text-body-1">
                            {{ currentUser?.phone || 'غير محدد' }}
                          </div>
                          <v-text-field
                            v-else
                            v-model="settingsForm.phone"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="12" sm="6">
                          <v-label class="text-caption">العنوان:</v-label>
                          <div v-if="!settingsForm.isEditing" class="text-body-1">
                            {{ currentUser?.address || 'غير محدد' }}
                          </div>
                          <v-text-field
                            v-else
                            v-model="settingsForm.address"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                      
                      <!-- Update Reason Field (only show when editing) -->
                      <v-row v-if="settingsForm.isEditing">
                        <v-col cols="12">
                          <v-label class="text-caption">سبب التحديث (اختياري):</v-label>
                          <v-text-field
                            v-model="settingsForm.update_reason"
                            variant="outlined"
                            density="compact"
                            placeholder="مثال: تحديث معلومات الاتصال، إضافة عنوان جديد..."
                            hint="سيتم حفظ هذا السبب في سجل التغييرات"
                            persistent-hint
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-phone</v-icon>
                      معلومات الاتصال
                    </v-card-title>
                    
                    <v-card-text>
                      <v-row>
                        <v-col cols="12" sm="6">
                          <v-label class="text-caption">رقم الهاتف:</v-label>
                          <div v-if="!settingsForm.isEditing" class="text-body-1">
                            {{ currentUser?.phone || 'غير محدد' }}
                          </div>
                          <v-text-field
                            v-else
                            v-model="settingsForm.phone"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                      </v-row>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Save Button -->
              <v-row v-if="settingsForm.isEditing" class="mt-4">
                <v-col cols="12" class="text-center">
                  <v-btn
                    color="primary"
                    @click="saveProfile"
                    :loading="saving"
                    class="me-2"
                  >
                    حفظ التغييرات
                  </v-btn>
                  <v-btn
                    variant="outlined"
                    @click="cancelEdit"
                  >
                    إلغاء
                  </v-btn>
                </v-col>
              </v-row>
            </v-window-item>
            
            <!-- Security Tab -->
            <v-window-item value="security">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-lock</v-icon>
                      تغيير كلمة المرور
                    </v-card-title>
                    
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
                      <v-btn
                        color="primary"
                        @click="changePassword"
                        :loading="changingPassword"
                        :disabled="!passwordFormValid"
                      >
                        تغيير كلمة المرور
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-shield-check</v-icon>
                      الأمان ثنائي العامل
                    </v-card-title>
                    
                    <v-card-text>
                      <v-switch
                        v-model="securitySettings.twoFactorEnabled"
                        label="تفعيل المصادقة ثنائية العامل"
                        color="primary"
                      />
                      <p class="text-body-2 text-medium-emphasis">
                        إضافة طبقة أمان إضافية لحسابك باستخدام تطبيق المصادقة
                      </p>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
            
            <!-- Preferences Tab -->
            <v-window-item value="preferences">
              <v-row>
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-bell</v-icon>
                      الإشعارات
                    </v-card-title>
                    
                    <v-card-text>
                      <v-switch
                        v-model="preferences.emailNotifications"
                        label="الإشعارات البريدية"
                        color="primary"
                      />
                      <v-switch
                        v-model="preferences.smsNotifications"
                        label="الإشعارات عبر الرسائل النصية"
                        color="primary"
                      />
                      <v-switch
                        v-model="preferences.pushNotifications"
                        label="الإشعارات الفورية"
                        color="primary"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-card class="overview-card" elevation="2">
                    <v-card-title>
                      <v-icon class="me-2">mdi-palette</v-icon>
                      المظهر
                    </v-card-title>
                    
                    <v-card-text>
                      <v-select
                        v-model="preferences.theme"
                        :items="themeOptions"
                        label="السمة"
                        variant="outlined"
                      />
                      <v-select
                        v-model="preferences.language"
                        :items="languageOptions"
                        label="اللغة"
                        variant="outlined"
                      />
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>
              
              <!-- Save Preferences Button -->
              <v-row class="mt-4">
                <v-col cols="12" class="text-center">
                  <v-btn
                    color="primary"
                    @click="savePreferences"
                    :loading="savingPreferences"
                  >
                    حفظ التفضيلات
                  </v-btn>
                </v-col>
              </v-row>
            </v-window-item>
            
            <!-- Activity History Tab -->
            <v-window-item value="history">
              <ActivityHistory :user-id="currentUser?.id" />
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import ActivityHistory from '@/modules/customer/components/ActivityHistory.vue';

const router = useRouter();
const { user, isAuthenticated, updateProfile, uploadAvatar, isLoading, error, success } = useAuth();

// Reactive data
const overlayActive = ref(true);
const activeTab = ref('overview');
const saving = ref(false);
const changingPassword = ref(false);
const savingPreferences = ref(false);
const passwordFormValid = ref(false);
const passwordFormRef = ref(null);

const userStats = ref({
  orders: 0,
  wishlist: 0,
  points: 0
});

const settingsForm = ref({
  isEditing: false,
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  update_reason: ''
});

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const securitySettings = reactive({
  twoFactorEnabled: false
});

const preferences = reactive({
  emailNotifications: true,
  smsNotifications: false,
  pushNotifications: true,
  theme: 'auto',
  language: 'ar'
});

const tabs = ref([
  { name: 'overview', label: 'نظرة عامة', icon: 'mdi-view-dashboard' },
  { name: 'security', label: 'الأمان', icon: 'mdi-shield-account' },
  { name: 'preferences', label: 'التفضيلات', icon: 'mdi-cog' },
  { name: 'history', label: 'سجل التغييرات', icon: 'mdi-history' }
]);

const themeOptions = [
  { title: 'تلقائي', value: 'auto' },
  { title: 'فاتح', value: 'light' },
  { title: 'داكن', value: 'dark' }
];

const languageOptions = [
  { title: 'العربية', value: 'ar' },
  { title: 'English', value: 'en' }
];

// Computed
const currentUser = computed(() => authStore.user);

// uploadAvatar is imported from useAuth composable

const editProfile = () => {
  settingsForm.value.isEditing = true;
  // Populate form with current user data
  settingsForm.value.firstName = currentUser.value?.firstName || '';
  settingsForm.value.lastName = currentUser.value?.lastName || '';
  settingsForm.value.email = currentUser.value?.email || '';
  settingsForm.value.phone = currentUser.value?.phone || '';
  settingsForm.value.address = currentUser.value?.address || '';
};

const saveProfile = async () => {
  saving.value = true;
  try {
    // Get device info for audit trail
    const deviceInfo = navigator.userAgent || 'Unknown device';
    
    const result = await updateProfile({
      firstName: settingsForm.value.firstName,
      lastName: settingsForm.value.lastName,
      email: settingsForm.value.email,
      phone: settingsForm.value.phone,
      address: settingsForm.value.address,
      update_reason: settingsForm.value.update_reason || null,
      change_type: 'profile_update',
      device_info: deviceInfo
    });
    
    if (result.success) {
      settingsForm.value.isEditing = false;
      // Clear update reason after successful save
      settingsForm.value.update_reason = '';
      
      // Show success message (you can use a toast/snackbar here)
      console.log('✅ Profile updated successfully:', result.message);
    } else {
      throw new Error(result.error || 'Profile update failed');
    }
  } catch (error) {
    console.error('❌ Error saving profile:', error);
    // Show error message (you can use a toast/snackbar here)
  } finally {
    saving.value = false;
  }
};

const cancelEdit = () => {
  settingsForm.value.isEditing = false;
};

const changePassword = async () => {
  if (!passwordFormValid.value) return;
  
  changingPassword.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Password changed');
    
    // Reset form
    Object.assign(passwordForm, {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    // Reset form validation
    if (passwordForm.value) {
      passwordForm.value.reset();
    }
  } catch (error) {
    console.error('Error changing password:', error);
  } finally {
    changingPassword.value = false;
  }
};

const savePreferences = async () => {
  savingPreferences.value = true;
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Preferences saved:', preferences);
  } catch (error) {
    console.error('Error saving preferences:', error);
  } finally {
    savingPreferences.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

onMounted(() => {
  // Load user stats
  loadUserStats();
});

const loadUserStats = async () => {
  try {
    // Simulate loading user stats from API
    userStats.value = {
      orders: 12,
      wishlist: 8,
      points: 2450
    };
  } catch (error) {
    console.error('Error loading user stats:', error);
  }
};
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

.avatar-wrapper {
  position: relative;
  display: inline-block;
}

.avatar-upload-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  background: var(--v-theme-primary);
  color: white;
}

.profile-stats .stat-item {
  padding: 16px;
  border-radius: 12px;
  background: rgba(var(--v-theme-surface-variant), 0.1);
  transition: all 0.3s ease;
}

.profile-stats .stat-item:hover {
  transform: translateY(-2px);
  background: rgba(var(--v-theme-surface-variant), 0.2);
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.overview-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
  
  .profile-stats .stat-item {
    margin-bottom: 8px;
  }
}
</style>
