<template>
  <div class="settings-manager">
    <!-- Header -->
    <div class="settings-header">
      <h1 class="text-h2 font-weight-bold mb-2">الإعدادات</h1>
      <p class="text-body-1 text-medium-emphasis">إدارة إعدادات النظام والتكوينات</p>
    </div>

    <!-- Settings Tabs -->
    <v-tabs v-model="activeTab" class="settings-tabs">
      <v-tab value="general">عام</v-tab>
      <v-tab value="security">الأمان</v-tab>
      <v-tab value="notifications">الإشعارات</v-tab>
      <v-tab value="integrations">التكاملات</v-tab>
      <v-tab value="backup">النسخ الاحتياطي</v-tab>
    </v-tabs>

    <!-- Settings Content -->
    <v-window v-model="activeTab" class="settings-content">
      <!-- General Settings -->
      <v-window-item value="general">
        <v-card class="mb-6">
          <v-card-title>الإعدادات العامة</v-card-title>
          <v-card-text>
            <v-form ref="generalForm" v-model="generalFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.siteName"
                    label="اسم الموقع"
                    variant="outlined"
                    :rules="[v => !!v || 'اسم الموقع مطلوب']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.general.siteEmail"
                    label="البريد الإلكتروني للموقع"
                    type="email"
                    variant="outlined"
                    :rules="[v => !!v || 'البريد الإلكتروني مطلوب', v => /.+@.+\..+/.test(v) || 'البريد الإلكتروني غير صالح']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="settings.general.siteDescription"
                    label="وصف الموقع"
                    variant="outlined"
                    rows="3"
                    :rules="[v => !!v || 'وصف الموقع مطلوب']"
                  ></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="settings.general.keywords"
                    label="كلمات البحث (SEO)"
                    variant="outlined"
                    hint="افصل بين الكلمات بفاصلة"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveGeneralSettings"
              :loading="saving.general"
              :disabled="!generalFormValid"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <!-- Security Settings -->
      <v-window-item value="security">
        <v-card class="mb-6">
          <v-card-title>إعدادات الأمان</v-card-title>
          <v-card-text>
            <v-form ref="securityForm" v-model="securityFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.security.requireTwoFactor"
                    label="تطلب المصادقة الثنائية"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.security.sessionTimeout"
                    label="انتهاء جلسة العمل تلقائياً"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.security.maxLoginAttempts"
                    label="أقصى عدد محاولات الدخول"
                    type="number"
                    variant="outlined"
                    :rules="[v => v > 0 || 'يجب أن يكون أكبر من صفر']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.security.passwordMinLength"
                    label="الحد الأدنى لطول كلمة المرور"
                    type="number"
                    variant="outlined"
                    :rules="[v => v >= 8 || 'الحد الأدنى 8 أحرف']"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveSecuritySettings"
              :loading="saving.security"
              :disabled="!securityFormValid"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <!-- Notification Settings -->
      <v-window-item value="notifications">
        <v-card class="mb-6">
          <v-card-title>إعدادات الإشعارات</v-card-title>
          <v-card-text>
            <v-form ref="notificationsForm" v-model="notificationsFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.emailNotifications"
                    label="الإشعارات عبر البريد الإلكتروني"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.smsNotifications"
                    label="الإشعارات عبر الرسائل النصية"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.orderNotifications"
                    label="إشعارات الطلبات الجديدة"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.notifications.systemNotifications"
                    label="إشعارات النظام"
                    color="primary"
                  ></v-switch>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveNotificationSettings"
              :loading="saving.notifications"
              :disabled="!notificationsFormValid"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <!-- Integration Settings -->
      <v-window-item value="integrations">
        <v-card class="mb-6">
          <v-card-title>إعدادات التكاملات</v-card-title>
          <v-card-text>
            <v-form ref="integrationsForm" v-model="integrationsFormValid">
              <v-row>
                <v-col cols="12">
                  <h3 class="text-h6 mb-3">تكامل ERPNext</h3>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.integrations.erpnext.url"
                    label="رابط ERPNext"
                    variant="outlined"
                    placeholder="https://your-erpnext.com"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.integrations.erpnext.apiKey"
                    label="مفتاح API"
                    type="password"
                    variant="outlined"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" class="text-center mt-4">
                  <v-btn
                    color="secondary"
                    @click="testERPNextConnection"
                    :loading="testing.erpnext"
                    prepend-icon="mdi-test-tube"
                  >
                    اختبار الاتصال
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              @click="saveIntegrationSettings"
              :loading="saving.integrations"
              :disabled="!integrationsFormValid"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>

      <!-- Backup Settings -->
      <v-window-item value="backup">
        <v-card class="mb-6">
          <v-card-title>إعدادات النسخ الاحتياطي</v-card-title>
          <v-card-text>
            <v-form ref="backupForm" v-model="backupFormValid">
              <v-row>
                <v-col cols="12" md="6">
                  <v-switch
                    v-model="settings.backup.autoBackup"
                    label="نسخ احتياطي تلقائي"
                    color="primary"
                  ></v-switch>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.backup.backupFrequency"
                    label="تكرار النسخ الاحتياطي"
                    variant="outlined"
                    :items="backupFrequencies"
                    item-title="label"
                    item-value="value"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.backup.retentionDays"
                    label="فترة الاحتفاظ بالنسخ (أيام)"
                    type="number"
                    variant="outlined"
                    :rules="[v => v > 0 || 'يجب أن يكون أكبر من صفر']"
                  ></v-text-field>
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="settings.backup.backupLocation"
                    label="موقع تخزين النسخ الاحتياطي"
                    variant="outlined"
                    placeholder="/path/to/backup"
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="secondary"
              @click="createBackup"
              :loading="creatingBackup"
              prepend-icon="mdi-backup-restore"
            >
              إنشاء نسخة احتياطية الآن
            </v-btn>
            <v-btn
              color="primary"
              @click="saveBackupSettings"
              :loading="saving.backup"
              :disabled="!backupFormValid"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();

// Reactive data
const activeTab = ref('general');
const loading = ref(false);
const saving = reactive({
  general: false,
  security: false,
  notifications: false,
  integrations: false,
  backup: false
});
const testing = reactive({
  erpnext: false
});
const creatingBackup = ref(false);

// Form validation
const generalFormValid = ref(false);
const securityFormValid = ref(false);
const notificationsFormValid = ref(false);
const integrationsFormValid = ref(false);
const backupFormValid = ref(false);

// Settings data
const settings = reactive({
  general: {
    siteName: 'متجر الفينيل',
    siteEmail: 'info@vynilart.com',
    siteDescription: 'متجر الفينيل الأول في الجزائر',
    keywords: 'فينيل, ملصقات, ديكور, أثاث'
  },
  security: {
    requireTwoFactor: false,
    sessionTimeout: true,
    maxLoginAttempts: 5,
    passwordMinLength: 8
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    orderNotifications: true,
    systemNotifications: true
  },
  integrations: {
    erpnext: {
      url: '',
      apiKey: ''
    }
  },
  backup: {
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    backupLocation: '/backups'
  }
});

// Backup frequencies
const backupFrequencies = [
  { label: 'يومياً', value: 'daily' },
  { label: 'أسبوعياً', value: 'weekly' },
  { label: 'شهرياً', value: 'monthly' }
];

// Form references
const generalFormRef = ref(null);
const securityFormRef = ref(null);
const notificationsFormRef = ref(null);
const integrationsFormRef = ref(null);
const backupFormRef = ref(null);

// Methods
const fetchSettings = async () => {
  loading.value = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real app, fetch from API
    // const response = await fetch('/api/settings');
    // const data = await response.json();
    // Object.assign(settings, data);
    
  } catch (error) {
    console.error('Error fetching settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء جلب الإعدادات'
    });
  } finally {
    loading.value = false;
  }
};

const saveGeneralSettings = async () => {
  saving.general = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم حفظ الإعدادات العامة بنجاح'
    });
  } catch (error) {
    console.error('Error saving general settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  } finally {
    saving.general = false;
  }
};

const saveSecuritySettings = async () => {
  saving.security = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم حفظ إعدادات الأمان بنجاح'
    });
  } catch (error) {
    console.error('Error saving security settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  } finally {
    saving.security = false;
  }
};

const saveNotificationSettings = async () => {
  saving.notifications = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم حفظ إعدادات الإشعارات بنجاح'
    });
  } catch (error) {
    console.error('Error saving notification settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  } finally {
    saving.notifications = false;
  }
};

const saveIntegrationSettings = async () => {
  saving.integrations = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم حفظ إعدادات التكاملات بنجاح'
    });
  } catch (error) {
    console.error('Error saving integration settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  } finally {
    saving.integrations = false;
  }
};

const saveBackupSettings = async () => {
  saving.backup = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم حفظ إعدادات النسخ الاحتياطي بنجاح'
    });
  } catch (error) {
    console.error('Error saving backup settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء حفظ الإعدادات'
    });
  } finally {
    saving.backup = false;
  }
};

const testERPNextConnection = async () => {
  testing.erpnext = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم الاتصال بـ ERPNext بنجاح'
    });
  } catch (error) {
    console.error('Error testing ERPNext connection:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'فشل الاتصال بـ ERPNext'
    });
  } finally {
    testing.erpnext = false;
  }
};

const createBackup = async () => {
  creatingBackup.value = true;
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    store.dispatch('notifications/showNotification', {
      type: 'success',
      message: 'تم إنشاء نسخة احتياطية بنجاح'
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء إنشاء النسخة الاحتياطية'
    });
  } finally {
    creatingBackup.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchSettings();
});
</script>

<style scoped>
.settings-manager {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 2rem;
  text-align: center;
}

.settings-header h1 {
  color: var(--text-primary);
}

.settings-tabs {
  margin-bottom: 2rem;
}

.settings-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.v-window-item {
  padding: 1rem;
}

/* Responsive */
@media (max-width: 600px) {
  .settings-manager {
    padding: 1rem;
  }
  
  .settings-header,
  .settings-tabs,
  .settings-content {
    border-radius: 12px;
  }
}
</style>
