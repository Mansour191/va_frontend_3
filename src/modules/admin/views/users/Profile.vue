<template>
  <v-container fluid class="profile-page pa-4">
    <!-- Header -->
    <v-card class="profile-header mb-6" elevation="2">
      <v-card-text class="pa-4">
        <v-row align="center">
          <v-col cols="12" md="8">
            <div class="d-flex align-center">
              <v-avatar
                color="#d4af37"
                size="48"
                class="me-4"
              >
                <v-icon icon="mdi-account-circle" size="28"></v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h3 font-weight-bold">
                  {{ $t('profile.title', 'الملف الشخصي') }}
                </h1>
                <p class="text-body-1 text-dim mt-1">
                  {{ $t('profile.subtitle', 'عرض وتعديل معلوماتك الشخصية وإعدادات الحساب') }}
                </p>
              </div>
            </div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="d-flex gap-2 justify-md-end justify-start">
              <v-btn
                v-if="isEditing"
                @click="saveProfile"
                variant="elevated"
                prepend-icon="mdi-content-save"
                color="#d4af37"
                class="save-btn"
                :loading="loading"
              >
                {{ $t('common.save', 'حفظ التغييرات') }}
              </v-btn>
              <v-btn
                v-else
                @click="startEditing"
                variant="outlined"
                prepend-icon="mdi-pencil"
                class="edit-btn"
              >
                {{ $t('profile.edit', 'تعديل الملف') }}
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Profile Content -->
    <v-row>
      <!-- Sidebar -->
      <v-col cols="12" md="4" lg="3">
        <div class="profile-sidebar">
          <!-- Profile Card -->
          <v-card class="profile-card mb-4" elevation="2">
            <v-card-text class="pa-4 text-center">
              <!-- Avatar -->
              <div class="profile-avatar mb-4">
                <v-avatar
                  :image="profile.avatar"
                  size="120"
                  class="avatar-main"
                >
                  <v-icon icon="mdi-account" size="60"></v-icon>
                </v-avatar>
                <v-btn
                  v-if="isEditing"
                  @click="triggerAvatarUpload"
                  variant="elevated"
                  size="small"
                  color="#d4af37"
                  class="avatar-upload-btn"
                >
                  <v-icon icon="mdi-camera" size="16" class="me-1"></v-icon>
                  {{ $t('profile.changeAvatar', 'تغيير الصورة') }}
                </v-btn>
                <input
                  ref="avatarInput"
                  type="file"
                  @change="handleAvatarUpload"
                  accept="image/*"
                  style="display: none"
                />
              </div>

              <!-- Name and Role -->
              <h2 class="text-h5 font-weight-bold mb-2">{{ profile.name }}</h2>
              <p class="text-body-2 text-dim mb-3">{{ getRoleText(profile.role) }}</p>

              <!-- Status -->
              <v-chip
                :color="getStatusColor(profile.status)"
                variant="elevated"
                class="mb-4"
              >
                {{ getStatusText(profile.status) }}
              </v-chip>

              <!-- Meta Info -->
              <div class="profile-meta">
                <div class="meta-item">
                  <v-icon icon="mdi-calendar" size="20" color="#d4af37" class="me-2"></v-icon>
                  <div class="text-start">
                    <div class="text-caption text-dim">{{ $t('profile.memberSince', 'عضو منذ') }}</div>
                    <div class="text-body-2">{{ formatDate(profile.createdAt) }}</div>
                  </div>
                </div>
                <div class="meta-item">
                  <v-icon icon="mdi-clock" size="20" color="#d4af37" class="me-2"></v-icon>
                  <div class="text-start">
                    <div class="text-caption text-dim">{{ $t('profile.lastActive', 'آخر نشاط') }}</div>
                    <div class="text-body-2">{{ getLastActiveText(profile.lastLogin) }}</div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Stats Card -->
          <v-card class="stats-card" elevation="2">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-bold mb-4 d-flex align-center">
                <v-icon icon="mdi-chart-line" size="20" color="#d4af37" class="me-2"></v-icon>
                {{ $t('profile.activity', 'نشاطك') }}
              </h3>
              <v-row>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold">{{ profileStats.orders }}</div>
                    <div class="text-caption text-dim">{{ $t('profile.orders', 'الطلبات') }}</div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold">{{ profileStats.products }}</div>
                    <div class="text-caption text-dim">{{ $t('profile.products', 'المنتجات') }}</div>
                  </div>
                </v-col>
                <v-col cols="4">
                  <div class="text-center">
                    <div class="text-h4 font-weight-bold">{{ profileStats.reviews }}</div>
                    <div class="text-caption text-dim">{{ $t('profile.reviews', 'تقييمات') }}</div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </div>
      </v-col>

      <!-- Main Content -->
      <v-col cols="12" md="8" lg="9">
        <v-card class="profile-main" elevation="2">
          <!-- Tabs -->
          <v-tabs
            v-model="activeTab"
            align-tabs="start"
            color="#d4af37"
            class="profile-tabs"
          >
            <v-tab
              v-for="tab in tabs"
              :key="tab.id"
              :value="tab.id"
              class="profile-tab"
            >
              <v-icon :icon="tab.icon" size="20" class="me-2"></v-icon>
              {{ tab.name }}
            </v-tab>
          </v-tabs>

          <v-divider></v-divider>

          <!-- Tab Content -->
          <v-card-text class="pa-4">
            <!-- Personal Information -->
            <div v-if="activeTab === 'personal'" class="tab-content">
              <h3 class="text-h5 font-weight-bold mb-4">
                <v-icon icon="mdi-account" size="24" class="me-2"></v-icon>
                {{ $t('profile.personalInfo', 'المعلومات الشخصية') }}
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.firstName"
                    :label="$t('profile.firstName', 'الاسم الأول')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.lastName"
                    :label="$t('profile.lastName', 'اسم العائلة')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.username"
                    :label="$t('profile.username', 'اسم المستخدم')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.email"
                    :label="$t('profile.email', 'البريد الإلكتروني')"
                    type="email"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.phone"
                    :label="$t('profile.phone', 'رقم الهاتف')"
                    type="tel"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="editableProfile.bio"
                    :label="$t('profile.bio', 'نبذة عني')"
                    variant="outlined"
                    :disabled="!isEditing"
                    rows="4"
                    class="mb-4"
                  ></v-textarea>
                </v-col>
              </v-row>
            </div>

            <!-- Address Information -->
            <div v-if="activeTab === 'address'" class="tab-content">
              <h3 class="text-h5 font-weight-bold mb-4">
                <v-icon icon="mdi-map-marker" size="24" class="me-2"></v-icon>
                {{ $t('profile.addressInfo', 'معلومات العنوان') }}
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.location.city"
                    :label="$t('profile.city', 'المدينة')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.location.region"
                    :label="$t('profile.region', 'المنطقة')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="editableProfile.location.address"
                    :label="$t('profile.street', 'العنوان التفصيلي')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="editableProfile.location.postalCode"
                    :label="$t('profile.postalCode', 'الرمز البريدي')"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="editableProfile.location.country"
                    :label="$t('profile.country', 'الدولة')"
                    :items="countries"
                    item-title="text"
                    item-value="value"
                    variant="outlined"
                    :disabled="!isEditing"
                    class="mb-4"
                  ></v-select>
                </v-col>
              </v-row>
            </div>

            <!-- Security Settings -->
            <div v-if="activeTab === 'security'" class="tab-content">
              <h3 class="text-h5 font-weight-bold mb-4">
                <v-icon icon="mdi-shield-account" size="24" class="me-2"></v-icon>
                {{ $t('profile.changePassword', 'تغيير كلمة المرور') }}
              </h3>

              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordForm.current"
                    :label="$t('profile.currentPassword', 'كلمة المرور الحالية')"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordForm.new"
                    :label="$t('profile.newPassword', 'كلمة المرور الجديدة')"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="passwordForm.confirm"
                    :label="$t('profile.confirmPassword', 'تأكيد كلمة المرور')"
                    type="password"
                    variant="outlined"
                    class="mb-4"
                    :error-messages="passwordError"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-btn
                    @click="changePassword"
                    variant="elevated"
                    color="#d4af37"
                    :disabled="!canChangePassword"
                    :loading="passwordLoading"
                    class="mb-4"
                  >
                    <v-icon icon="mdi-key" size="20" class="me-2"></v-icon>
                    {{ $t('profile.changePasswordBtn', 'تغيير كلمة المرور') }}
                  </v-btn>
                </v-col>
              </v-row>

              <!-- Password Strength -->
              <v-card v-if="passwordForm.new" variant="outlined" class="mb-4">
                <v-card-text class="pa-4">
                  <div class="text-caption mb-2">{{ $t('profile.passwordStrength', 'قوة كلمة المرور') }}</div>
                  <v-progress-linear
                    :model-value="passwordStrength.score * 25"
                    :color="passwordStrength.color"
                    height="8"
                    rounded
                    class="mb-2"
                  ></v-progress-linear>
                  <div class="text-body-2">{{ passwordStrength.text }}</div>
                </v-card-text>
              </v-card>

              <v-alert type="info" variant="tonal" class="mb-4">
                <v-icon icon="mdi-shield-check" size="20" class="me-2"></v-icon>
                {{ $t('profile.passwordTip', 'ننصح باستخدام كلمة مرور قوية تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز') }}
              </v-alert>
            </div>

            <!-- Recent Orders -->
            <div v-if="activeTab === 'orders'" class="tab-content">
              <div class="d-flex justify-space-between align-center mb-4">
                <h3 class="text-h5 font-weight-bold">
                  <v-icon icon="mdi-shopping" size="24" class="me-2"></v-icon>
                  {{ $t('profile.recentOrders', 'آخر الطلبات') }}
                </h3>
                <v-btn
                  variant="text"
                  color="#d4af37"
                  prepend-icon="mdi-arrow-left"
                  to="/dashboard/orders"
                >
                  {{ $t('profile.viewAll', 'عرض الكل') }}
                </v-btn>
              </div>

              <div v-if="loadingOrders" class="text-center py-8">
                <v-progress-circular indeterminate color="#d4af37" size="48"></v-progress-circular>
                <div class="mt-4 text-body-2 text-dim">{{ $t('common.loading', 'جاري التحميل...') }}</div>
              </div>

              <div v-else-if="recentOrders.length === 0" class="text-center py-8">
                <v-icon icon="mdi-shopping-outline" size="64" color="#d4af37" class="mb-4"></v-icon>
                <h4 class="text-h6 font-weight-bold mb-2">{{ $t('profile.noOrders', 'لا توجد طلبات سابقة') }}</h4>
                <p class="text-body-2 text-dim mb-4">{{ $t('profile.startShopping', 'ابدأ التسوق الآن') }}</p>
                <v-btn variant="elevated" color="#d4af37" to="/shop">
                  {{ $t('profile.shopNow', 'تسوق الآن') }}
                </v-btn>
              </div>

              <div v-else class="orders-list">
                <v-card
                  v-for="order in recentOrders"
                  :key="order.id"
                  variant="outlined"
                  class="mb-4 order-card"
                >
                  <v-card-text class="pa-4">
                    <v-row align="center">
                      <v-col cols="12" md="4">
                        <div class="d-flex align-center">
                          <v-icon icon="mdi-receipt" size="20" color="#d4af37" class="me-2"></v-icon>
                          <div>
                            <div class="text-body-2 font-weight-bold">#{{ order.id }}</div>
                            <div class="text-caption text-dim">{{ formatDate(order.createdAt) }}</div>
                          </div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="text-center">
                          <div class="text-body-2">{{ order.itemsCount }} {{ $t('profile.items', 'منتج') }}</div>
                          <div class="text-h6 font-weight-bold">{{ formatCurrency(order.total) }}</div>
                        </div>
                      </v-col>
                      <v-col cols="12" md="4">
                        <div class="d-flex align-center justify-end gap-2">
                          <v-chip
                            :color="getOrderStatusColor(order.status)"
                            variant="elevated"
                            size="small"
                          >
                            {{ getOrderStatusText(order.status) }}
                          </v-chip>
                          <v-btn
                            variant="text"
                            size="small"
                            color="#d4af37"
                            @click="viewOrder(order.id)"
                          >
                            {{ $t('common.details', 'التفاصيل') }}
                          </v-btn>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import UserService from '@/services/UserService';

// Router, store, and i18n
const router = useRouter();
const store = useStore();
const { t } = useI18n();

// State
const loading = ref(false);
const loadingOrders = ref(false);
const passwordLoading = ref(false);
const isEditing = ref(false);
const activeTab = ref('personal');
const avatarInput = ref(null);

// Profile data
const profile = reactive({
  id: null,
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  role: '',
  status: '',
  bio: '',
  avatar: '',
  createdAt: '',
  lastLogin: '',
  location: {
    city: '',
    region: '',
    address: '',
    postalCode: '',
    country: ''
  }
});

// Editable profile
const editableProfile = reactive({
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  bio: '',
  location: {
    city: '',
    region: '',
    address: '',
    postalCode: '',
    country: ''
  }
});

// Profile stats
const profileStats = reactive({
  orders: 0,
  products: 0,
  reviews: 0
});

// Password form
const passwordForm = reactive({
  current: '',
  new: '',
  confirm: ''
});

// Password strength
const passwordStrength = reactive({
  score: 0,
  text: '',
  color: 'error'
});

// Recent orders
const recentOrders = ref([]);

// Password error
const passwordError = ref('');

// Countries - Dynamic loading from API
const countries = ref([]);

const fetchCountries = async () => {
  try {
    const { COUNTRIES_QUERY } = await import('@/integration/graphql/common.graphql');
    const { useQuery } = await import('@apollo/client');
    
    const { data, error } = await useQuery(COUNTRIES_QUERY);
    
    if (data.value && !error.value) {
      countries.value = data.value.countries.map(country => ({
        text: country.name,
        value: country.code
      }));
    }
  } catch (error) {
    console.error('Failed to fetch countries:', error);
    // Fallback to static data
    countries.value = [
      { text: t('countries.algeria', 'الجزائر'), value: 'DZ' },
      { text: t('countries.morocco', 'المغرب'), value: 'MA' },
      { text: t('countries.tunisia', 'تونس'), value: 'TN' },
      { text: t('countries.egypt', 'مصر'), value: 'EG' },
      { text: t('countries.saudi', 'السعودية'), value: 'SA' },
      { text: t('countries.uae', 'الإمارات'), value: 'AE' },
      { text: t('countries.kuwait', 'الكويت'), value: 'KW' },
      { text: t('countries.qatar', 'قطر'), value: 'QA' },
      { text: t('countries.bahrain', 'البحرين'), value: 'BH' },
      { text: t('countries.oman', 'عُمان'), value: 'OM' }
    ];
  }
};

// Tabs
const tabs = ref([
  { id: 'personal', name: t('profile.personalInfo', 'المعلومات الشخصية'), icon: 'mdi-account' },
  { id: 'address', name: t('profile.address', 'العنوان'), icon: 'mdi-map-marker' },
  { id: 'security', name: t('profile.security', 'الأمان'), icon: 'mdi-shield-account' },
  { id: 'orders', name: t('profile.orders', 'الطلبات'), icon: 'mdi-shopping' }
]);

// Computed
const canChangePassword = computed(() => {
  return (
    passwordForm.current &&
    passwordForm.new &&
    passwordForm.confirm &&
    passwordForm.new === passwordForm.confirm &&
    passwordStrength.score >= 2
  );
});

// Methods
const loadUserProfile = async () => {
  try {
    loading.value = true;
    
    // Get current user ID from store or auth
    const userId = store.getters['auth/userId'] || 1;
    
    const response = await UserService.getUserProfile(userId);
    
    if (response.success) {
      Object.assign(profile, response.data);
      resetEditableProfile();
      
      // Load user stats
      const statsResponse = await UserService.getUserStats();
      if (statsResponse.success) {
        Object.assign(profileStats, statsResponse.data);
      }
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('profile.loadError', 'فشل في تحميل الملف الشخصي')
    });
  } finally {
    loading.value = false;
  }
};

const loadRecentOrders = async () => {
  try {
    loadingOrders.value = true;
    
    const userId = store.getters['auth/userId'] || 1;
    const response = await UserService.getUserActivityLog(userId, { limit: 5 });
    
    if (response.success) {
      // Transform activity log to orders format
      recentOrders.value = response.data.activities
        .filter(activity => activity.action === 'ORDER_PLACED')
        .slice(0, 5)
        .map(activity => ({
          id: activity.details?.orderId || activity.id,
          createdAt: activity.timestamp,
          itemsCount: activity.details?.itemsCount || 1,
          total: activity.details?.total || 0,
          status: activity.details?.status || 'pending'
        }));
    }
  } catch (error) {
    console.error('Error loading recent orders:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('profile.ordersLoadError', 'فشل في تحميل الطلبات')
    });
  } finally {
    loadingOrders.value = false;
  }
};

const resetEditableProfile = () => {
  editableProfile.firstName = profile.firstName || '';
  editableProfile.lastName = profile.lastName || '';
  editableProfile.username = profile.username || '';
  editableProfile.email = profile.email || '';
  editableProfile.phone = profile.phone || '';
  editableProfile.bio = profile.bio || '';
  editableProfile.location = {
    city: profile.location?.city || '',
    region: profile.location?.region || '',
    address: profile.location?.address || '',
    postalCode: profile.location?.postalCode || '',
    country: profile.location?.country || 'DZ'
  };
};

const startEditing = () => {
  isEditing.value = true;
  resetEditableProfile();
};

const saveProfile = async () => {
  try {
    loading.value = true;
    
    const userId = store.getters['auth/userId'] || 1;
    const response = await UserService.updateUserProfile(userId, editableProfile);
    
    if (response.success) {
      Object.assign(profile, editableProfile);
      isEditing.value = false;
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('profile.saveSuccess', 'تم حفظ الملف الشخصي بنجاح')
      });
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('profile.saveError', 'فشل في حفظ الملف الشخصي')
    });
  } finally {
    loading.value = false;
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    if (file.size > 2 * 1024 * 1024) {
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: t('profile.avatarSizeError', 'حجم الصورة يجب أن يكون أقل من 2MB')
      });
      return;
    }

    try {
      loading.value = true;
      const userId = store.getters['auth/userId'] || 1;
      const response = await UserService.uploadAvatar(userId, file);
      
      if (response.success) {
        profile.avatar = response.data.avatar;
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: t('profile.avatarUploadSuccess', 'تم رفع الصورة بنجاح')
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: t('profile.avatarUploadError', 'فشل في رفع الصورة')
      });
    } finally {
      loading.value = false;
    }
  }
};

const changePassword = async () => {
  try {
    passwordLoading.value = true;
    
    const userId = store.getters['auth/userId'] || 1;
    const response = await UserService.changePassword(userId, {
      currentPassword: passwordForm.current,
      newPassword: passwordForm.new
    });
    
    if (response.success) {
      // Clear form
      passwordForm.current = '';
      passwordForm.new = '';
      passwordForm.confirm = '';
      passwordError.value = '';
      
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: t('profile.passwordChangeSuccess', 'تم تغيير كلمة المرور بنجاح')
      });
    }
  } catch (error) {
    console.error('Error changing password:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: t('profile.passwordChangeError', 'فشل في تغيير كلمة المرور')
    });
  } finally {
    passwordLoading.value = false;
  }
};

const checkPasswordStrength = () => {
  if (!passwordForm.new) {
    passwordStrength.score = 0;
    passwordStrength.text = '';
    passwordStrength.color = 'error';
    return;
  }

  // Simple password strength calculation
  let score = 0;
  const password = passwordForm.new;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  passwordStrength.score = Math.min(score, 4);

  const strengthLevels = {
    0: { text: t('profile.passwordVeryWeak', 'ضعيفة جداً'), color: 'error' },
    1: { text: t('profile.passwordWeak', 'ضعيفة'), color: 'error' },
    2: { text: t('profile.passwordMedium', 'متوسطة'), color: 'warning' },
    3: { text: t('profile.passwordStrong', 'قوية'), color: 'success' },
    4: { text: t('profile.passwordVeryStrong', 'قوية جداً'), color: 'success' }
  };

  const level = strengthLevels[passwordStrength.score];
  passwordStrength.text = level.text;
  passwordStrength.color = level.color;
};

const viewOrder = (orderId) => {
  router.push(`/dashboard/orders/${orderId}`);
};

// Utility methods
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(amount);
};

const getLastActiveText = (dateString) => {
  if (!dateString) return t('profile.unknown', 'غير معروف');
  const lastActive = new Date(dateString);
  const now = new Date();
  const diffMs = now - lastActive;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('profile.now', 'الآن');
  if (diffMins < 60) return t('profile.minutesAgo', `منذ ${diffMins} دقيقة`);
  if (diffHours < 24) return t('profile.hoursAgo', `منذ ${diffHours} ساعة`);
  if (diffDays === 1) return t('profile.yesterday', 'أمس');
  return formatDate(dateString);
};

const getRoleText = (role) => {
  const map = {
    admin: t('roles.admin', 'مدير'),
    manager: t('roles.manager', 'مسؤول'),
    employee: t('roles.employee', 'موظف'),
    user: t('roles.user', 'مستخدم')
  };
  return map[role] || role;
};

const getStatusText = (status) => {
  const map = {
    active: t('status.active', 'نشط'),
    inactive: t('status.inactive', 'غير نشط'),
    banned: t('status.banned', 'محظور'),
    pending: t('status.pending', 'قيد الانتظار')
  };
  return map[status] || status;
};

const getStatusColor = (status) => {
  const colors = {
    active: 'success',
    inactive: 'warning',
    banned: 'error',
    pending: 'info'
  };
  return colors[status] || 'default';
};

const getOrderStatusText = (status) => {
  const map = {
    pending: t('orderStatus.pending', 'قيد الانتظار'),
    processing: t('orderStatus.processing', 'قيد المعالجة'),
    shipped: t('orderStatus.shipped', 'تم الشحن'),
    delivered: t('orderStatus.delivered', 'تم التوصيل'),
    cancelled: t('orderStatus.cancelled', 'ملغي')
  };
  return map[status] || status;
};

const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'error'
  };
  return colors[status] || 'default';
};

// Watchers
watch(() => passwordForm.new, () => {
  checkPasswordStrength();
  if (passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm) {
    passwordError.value = t('profile.passwordMismatch', 'كلمة المرور غير متطابقة');
  } else {
    passwordError.value = '';
  }
});

watch(() => passwordForm.confirm, () => {
  if (passwordForm.new && passwordForm.confirm && passwordForm.new !== passwordForm.confirm) {
    passwordError.value = t('profile.passwordMismatch', 'كلمة المرور غير متطابقة');
  } else {
    passwordError.value = '';
  }
});

// Lifecycle
onMounted(() => {
  fetchCountries();
  loadUserProfile();
  loadRecentOrders();
});
</script>

<style scoped>
.profile-page {
  background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
  min-height: 100vh;
}

/* Header Styles */
.profile-header {
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

.edit-btn {
  border-color: #d4af37;
  color: #d4af37;
  font-weight: 500;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  transform: translateY(-1px);
}

/* Sidebar Styles */
.profile-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.profile-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.profile-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
}

.profile-avatar {
  position: relative;
  display: inline-block;
}

.avatar-main {
  border: 4px solid #d4af37;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.avatar-upload-btn {
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.75rem;
  padding: 4px 8px;
}

.profile-meta {
  text-align: right;
  padding-top: 1rem;
  border-top: 1px solid rgba(212, 175, 55, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-bottom: 12px;
}

.stats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

/* Main Content Styles */
.profile-main {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(212, 175, 55, 0.1);
  border-radius: 16px;
}

.profile-tabs :deep(.v-tabs-slider) {
  background: #d4af37;
}

.profile-tab {
  font-weight: 500;
  transition: all 0.3s ease;
}

.tab-content {
  animation: fadeIn 0.6s ease-out;
}

/* Order Cards */
.order-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.order-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
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
  .profile-header .v-btn {
    font-size: 0.875rem;
  }
}

@media (max-width: 600px) {
  .profile-page {
    padding: 1rem;
  }
  
  .profile-header,
  .profile-card,
  .stats-card,
  .profile-main {
    border-radius: 12px;
  }
  
  .avatar-upload-btn {
    font-size: 0.7rem;
    padding: 2px 6px;
  }
}
</style>

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-id {
  color: var(--gold-1);
  font-weight: 600;
}

.order-date {
  color: var(--text-dim);
  font-size: 0.85rem;
}

.order-body {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-light);
}

.order-products {
  color: var(--text-secondary);
}

.order-total {
  color: white;
  font-weight: 700;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.order-status.pending {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
  border: 1px solid #ffc107;
}

.order-status.processing {
  background: rgba(33, 150, 243, 0.2);
  color: #2196f3;
  border: 1px solid #2196f3;
}

.order-status.shipped {
  background: rgba(156, 39, 176, 0.2);
  color: #9c27b0;
  border: 1px solid #9c27b0;
}

.order-status.delivered {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
  border: 1px solid #4caf50;
}

.order-details-btn {
  padding: 6px 15px;
  background: transparent;
  border: 1px solid var(--gold-1);
  border-radius: 20px;
  color: var(--gold-1);
  cursor: pointer;
  transition: all 0.3s;
}

.order-details-btn:hover {
  background: var(--gold-gradient);
  color: var(--bg-deep);
  border-color: transparent;
}

.no-orders {
  text-align: center;
  padding: 40px;
  color: var(--text-dim);
}

.no-orders i {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.no-orders p {
  margin-bottom: 15px;
}

.shop-link {
  display: inline-block;
  padding: 10px 20px;
  background: var(--gold-gradient);
  color: var(--bg-deep);
  text-decoration: none;
  border-radius: 30px;
  font-weight: 600;
  transition: all 0.3s;
}

.shop-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-gold);
}

/* ===== استجابة ===== */
@media (max-width: 992px) {
  .profile-content {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-field.full-width {
    grid-column: span 1;
  }

  .profile-tabs {
    overflow-x: auto;
    padding: 0 10px;
  }

  .tab-btn {
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .profile-page {
    padding: 15px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    background: var(--bg-primary);
    border-radius: 12px;
  }

  .stat-value {
    margin-bottom: 0;
  }
}
</style>
