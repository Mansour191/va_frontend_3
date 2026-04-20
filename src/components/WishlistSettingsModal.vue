<template>
  <v-dialog v-model="isOpen" max-width="600" persistent>
    <v-card class="wishlist-settings-modal">
      <v-card-title class="pa-6">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center gap-3">
            <v-icon color="primary" size="28">mdi-cog</v-icon>
            <h2 class="text-h5 font-weight-bold">إعدادات المفضلة</h2>
          </div>
          <v-btn
            icon
            variant="text"
            @click="closeModal"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="form" v-model="valid" @submit.prevent="saveSettings">
          <!-- Display Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-medium mb-4">
              <v-icon class="me-2">mdi-eye</v-icon>
              إعدادات العرض
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.itemsPerPage"
                  label="عدد العناصر في الصفحة"
                  type="number"
                  min="5"
                  max="100"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-list-numbered"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.sortBy"
                  :items="sortOptions"
                  label="ترتيب حسب"
                  variant="outlined"
                  prepend-inner-icon="mdi-sort"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-select
                  v-model="settings.sortOrder"
                  :items="sortOrderOptions"
                  label="اتجاه الترتيب"
                  variant="outlined"
                  prepend-inner-icon="mdi-sort-ascending"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-text-field
                  v-model.number="settings.maxItemsAllowed"
                  label="الحد الأقصى للعناصر"
                  type="number"
                  min="10"
                  max="500"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-list-checks"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Privacy Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-medium mb-4">
              <v-icon class="me-2">mdi-shield-lock</v-icon>
              الخصوصية والمشاركة
            </h3>
            
            <v-row>
              <v-col cols="12">
                <v-select
                  v-model="settings.privacyLevel"
                  :items="privacyOptions"
                  label="مستوى الخصوصية"
                  variant="outlined"
                  prepend-inner-icon="mdi-lock"
                  @update:model-value="onPrivacyChange"
                />
              </v-col>
              
              <v-col cols="12" v-if="settings.privacyLevel !== 'private'">
                <div class="d-flex align-center gap-3 pa-3 bg-grey-lighten-5 rounded-lg">
                  <v-icon color="info">mdi-share-variant</v-icon>
                  <div class="flex-grow-1">
                    <div class="text-body-2 font-weight-medium">رابط المشاركة</div>
                    <div class="text-caption text-medium-emphasis" v-if="settings.shareToken">
                      {{ shareUrl }}
                    </div>
                  </div>
                  <v-btn
                    v-if="!settings.shareToken"
                    variant="outlined"
                    color="primary"
                    prepend-icon="mdi-share-variant"
                    @click="generateShareToken"
                    :loading="generatingToken"
                  >
                    إنشاء رابط
                  </v-btn>
                  <v-btn
                    v-else
                    variant="outlined"
                    color="success"
                    prepend-icon="mdi-content-copy"
                    @click="copyShareLink"
                  >
                    نسخ الرابط
                  </v-btn>
                  <v-btn
                    v-if="settings.shareToken"
                    variant="text"
                    color="error"
                    prepend-icon="mdi-refresh"
                    @click="regenerateShareToken"
                    :loading="generatingToken"
                  >
                    إعادة تعيين
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- Notification Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-medium mb-4">
              <v-icon class="me-2">mdi-bell</v-icon>
              الإشعارات
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.emailNotifications"
                  label="الإشعارات البريدية"
                  color="primary"
                  prepend-icon="mdi-email"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.pushNotifications"
                  label="الإشعارات الفورية"
                  color="primary"
                  prepend-icon="mdi-bell-ring"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.notifyOnPriceDrop"
                  label="إشعار عند انخفاض السعر"
                  color="primary"
                  prepend-icon="mdi-tag-arrow-down"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.alertOnLowStock"
                  label="تنبيه عند نفاد المخزون"
                  color="primary"
                  prepend-icon="mdi-package-variant-closed"
                />
              </v-col>
            </v-row>
          </div>

          <!-- Auto-cleanup Settings -->
          <div class="settings-section mb-6">
            <h3 class="text-h6 font-weight-medium mb-4">
              <v-icon class="me-2">mdi-auto-fix</v-icon>
              الصيانة التلقائية
            </h3>
            
            <v-row>
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.autoRemoveOutOfStock"
                  label="إزالة المنتجات المنتهية تلقائياً"
                  color="primary"
                  prepend-icon="mdi-delete-sweep"
                />
              </v-col>
              
              <v-col cols="12" md="6">
                <v-switch
                  v-model="settings.autoRemoveDiscontinued"
                  label="إزالة المنتجات الموقوفة تلقائياً"
                  color="primary"
                  prepend-icon="mdi-delete-forever"
                />
              </v-col>
            </v-row>
          </div>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-6">
        <v-spacer />
        <v-btn
          variant="outlined"
          @click="closeModal"
        >
          إلغاء
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="saving"
          @click="saveSettings"
        >
          <v-icon start>mdi-content-save</v-icon>
          حفظ الإعدادات
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useApolloClient } from '@vue/apollo-composable';
import { 
  GET_WISHLIST_SETTINGS, 
  UPDATE_WISHLIST_SETTINGS, 
  GENERATE_SHARE_TOKEN 
} from '@/graphql/wishlist';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'settings-updated']);

// Apollo client
const { resolveClient } = useApolloClient();
const apolloClient = resolveClient();

// Reactive data
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const valid = ref(true);
const saving = ref(false);
const generatingToken = ref(false);
const form = ref(null);

// Default settings
const defaultSettings = {
  itemsPerPage: 20,
  sortBy: 'created_at',
  sortOrder: 'desc',
  emailNotifications: true,
  pushNotifications: true,
  autoRemoveOutOfStock: false,
  autoRemoveDiscontinued: true,
  makePublic: false,
  privacyLevel: 'private',
  maxItemsAllowed: 100,
  notifyOnPriceDrop: true,
  alertOnLowStock: true,
  shareToken: null
};

const settings = ref({ ...defaultSettings });

// Options
const sortOptions = [
  { title: 'تاريخ الإضافة', value: 'created_at' },
  { title: 'اسم المنتج', value: 'product__name_ar' },
  { title: 'السعر', value: 'product__base_price' },
  { title: 'الأولوية', value: 'priority' }
];

const sortOrderOptions = [
  { title: 'تصاعدي', value: 'asc' },
  { title: 'تنازلي', value: 'desc' }
];

const privacyOptions = [
  { title: 'خاص', value: 'private' },
  { title: 'عام', value: 'public' },
  { title: 'مشاركة', value: 'shared' }
];

// Computed
const shareUrl = computed(() => {
  if (settings.value.shareToken) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/wishlist/view/${settings.value.shareToken}`;
  }
  return null;
});

// Methods
const loadSettings = async () => {
  try {
    const { data } = await apolloClient.query({
      query: GET_WISHLIST_SETTINGS,
      fetchPolicy: 'network-only'
    });
    
    if (data?.wishlistSettings) {
      settings.value = { ...settings.value, ...data.wishlistSettings };
    }
  } catch (error) {
    console.error('Error loading wishlist settings:', error);
  }
};

const saveSettings = async () => {
  if (!form.value?.validate()) return;
  
  saving.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: UPDATE_WISHLIST_SETTINGS,
      variables: {
        input: {
          itemsPerPage: settings.value.itemsPerPage,
          sortBy: settings.value.sortBy,
          sortOrder: settings.value.sortOrder,
          emailNotifications: settings.value.emailNotifications,
          pushNotifications: settings.value.pushNotifications,
          autoRemoveOutOfStock: settings.value.autoRemoveOutOfStock,
          autoRemoveDiscontinued: settings.value.autoRemoveDiscontinued,
          makePublic: settings.value.makePublic,
          privacyLevel: settings.value.privacyLevel,
          maxItemsAllowed: settings.value.maxItemsAllowed,
          notifyOnPriceDrop: settings.value.notifyOnPriceDrop,
          alertOnLowStock: settings.value.alertOnLowStock
        }
      }
    });
    
    if (data?.updateWishlistSettings?.success) {
      emit('settings-updated', data.updateWishlistSettings.settings);
      closeModal();
    }
  } catch (error) {
    console.error('Error saving wishlist settings:', error);
  } finally {
    saving.value = false;
  }
};

const generateShareToken = async () => {
  generatingToken.value = true;
  try {
    const { data } = await apolloClient.mutate({
      mutation: GENERATE_SHARE_TOKEN
    });
    
    if (data?.generateShareToken?.success) {
      settings.value.shareToken = data.generateShareToken.shareToken;
    }
  } catch (error) {
    console.error('Error generating share token:', error);
  } finally {
    generatingToken.value = false;
  }
};

const regenerateShareToken = async () => {
  if (confirm('هل أنت متأكد من إعادة تعيين رابط المشاركة؟')) {
    await generateShareToken();
  }
};

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value);
    // You could show a toast notification here
    console.log('Share link copied to clipboard');
  } catch (error) {
    console.error('Error copying share link:', error);
  }
};

const onPrivacyChange = (newPrivacyLevel) => {
  if (newPrivacyLevel === 'private') {
    settings.value.makePublic = false;
    settings.value.shareToken = null;
  } else if (newPrivacyLevel === 'public') {
    settings.value.makePublic = true;
  }
};

const closeModal = () => {
  isOpen.value = false;
};

// Watchers
watch(isOpen, (newValue) => {
  if (newValue) {
    loadSettings();
  }
});

// Lifecycle
onMounted(() => {
  if (isOpen.value) {
    loadSettings();
  }
});
</script>

<style scoped>
.wishlist-settings-modal {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.settings-section {
  border-left: 3px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.settings-section h3 {
  color: rgb(var(--v-theme-primary));
}

.bg-grey-lighten-5 {
  background-color: rgba(var(--v-theme-on-surface), 0.05);
}
</style>
