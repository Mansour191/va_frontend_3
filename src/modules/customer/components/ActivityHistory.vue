<template>
  <v-card class="activity-history-card" elevation="2">
    <v-card-title class="d-flex align-center justify-space-between">
      <div>
        <v-icon class="me-2">mdi-history</v-icon>
        سجل التغييرات
      </div>
      <v-btn
        icon
        variant="text"
        @click="refreshHistory"
        :loading="loading"
        size="small"
      >
        <v-icon>mdi-refresh</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <div v-if="loading && !history.length" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
        <p class="mt-4 text-medium-emphasis">جاري تحميل السجل...</p>
      </div>
      
      <div v-else-if="!history.length" class="text-center py-8">
        <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
        <p class="mt-4 text-medium-emphasis">لا يوجد سجل تغييرات بعد</p>
      </div>
      
      <v-timeline v-else density="compact" side="end">
        <v-timeline-item
          v-for="item in history"
          :key="item.id"
          :dot-color="getChangeTypeColor(item.changeType)"
          size="small"
        >
          <template #opposite>
            <span class="text-caption text-medium-emphasis">
              {{ formatDate(item.snapshotDate) }}
            </span>
          </template>
          
          <v-card class="timeline-card" variant="outlined">
            <v-card-title class="text-h6 pa-3">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <v-icon :icon="getChangeTypeIcon(item.changeType)" class="me-2" />
                  {{ getChangeTypeLabel(item.changeType) }}
                </div>
                <v-chip
                  :color="getChangeTypeColor(item.changeType)"
                  size="x-small"
                  variant="flat"
                >
                  {{ item.changeType }}
                </v-chip>
              </div>
            </v-card-title>
            
            <v-card-text class="pa-3 pt-0">
              <!-- Update Reason -->
              <div v-if="item.updateReason" class="mb-3">
                <v-label class="text-caption">سبب التغيير:</v-label>
                <p class="text-body-2">{{ item.updateReason }}</p>
              </div>
              
              <!-- Changed Fields -->
              <div class="changed-fields mb-3">
                <v-label class="text-caption">الحقول المحدثة:</v-label>
                <v-chip-group>
                  <v-chip
                    v-for="field in getChangedFields(item)"
                    :key="field"
                    size="x-small"
                    variant="outlined"
                    color="primary"
                  >
                    {{ getFieldLabel(field) }}
                  </v-chip>
                </v-chip-group>
              </div>
              
              <!-- Device Info -->
              <div v-if="item.deviceInfo" class="mb-3">
                <v-label class="text-caption">الجهاز:</v-label>
                <p class="text-caption text-medium-emphasis">{{ truncateText(item.deviceInfo, 50) }}</p>
              </div>
              
              <!-- Updated By -->
              <div v-if="item.updatedBy" class="d-flex align-center">
                <v-icon size="16" class="me-1">mdi-account</v-icon>
                <span class="text-caption">
                  بواسطة: {{ item.updatedBy.firstName || item.updatedBy.username }}
                </span>
              </div>
            </v-card-text>
            
            <!-- Expand/Collapse Details -->
            <v-card-actions class="pa-0">
              <v-btn
                variant="text"
                size="small"
                @click="toggleDetails(item.id)"
                :icon="expandedItems.has(item.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
              >
                {{ expandedItems.has(item.id) ? 'إخفاء' : 'عرض' }} التفاصيل
              </v-btn>
            </v-card-actions>
            
            <!-- Expanded Details -->
            <v-expand-transition>
              <div v-show="expandedItems.has(item.id)">
                <v-divider />
                <v-card-text class="pa-3">
                  <h4 class="text-subtitle-2 mb-3">بيانات النسخة الاحتياطية:</h4>
                  
                  <v-row>
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">رقم الهاتف:</v-label>
                      <p class="text-body-2">{{ item.phone || 'غير محدد' }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">العنوان:</v-label>
                      <p class="text-body-2">{{ item.address || 'غير محدد' }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">الوصف:</v-label>
                      <p class="text-body-2">{{ item.bio || 'غير محدد' }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">الصورة الرمزية:</v-label>
                      <p class="text-body-2">{{ item.avatar ? 'محددة' : 'غير محددة' }}</p>
                    </v-col>
                  </v-row>
                  
                  <!-- Original Timestamps -->
                  <v-row class="mt-3">
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">تاريخ الإنشاء الأصلي:</v-label>
                      <p class="text-caption">{{ formatDate(item.originalCreatedAt) }}</p>
                    </v-col>
                    <v-col cols="12" sm="6">
                      <v-label class="text-caption">تاريخ التحديث الأصلي:</v-label>
                      <p class="text-caption">{{ formatDate(item.originalUpdatedAt) }}</p>
                    </v-col>
                  </v-row>
                </v-card-text>
              </div>
            </v-expand-transition>
          </v-card>
        </v-timeline-item>
      </v-timeline>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { PROFILE_HISTORY_QUERY } from '@/integration/graphql/me.graphql';

// Props
const props = defineProps({
  userId: {
    type: String,
    default: null
  }
});

// Reactive data
const loading = ref(false);
const history = ref([]);
const expandedItems = ref(new Set());

// GraphQL Query
const { refetch } = useQuery(PROFILE_HISTORY_QUERY, {
  userId: props.userId
}, {
  fetchPolicy: 'cache-and-network',
  errorPolicy: 'all',
  result({ data }) {
    if (data?.profileHistory) {
      history.value = data.profileHistory;
    }
  },
  error(error) {
    console.error('Error loading profile history:', error);
  }
});

// Methods
const refreshHistory = async () => {
  loading.value = true;
  try {
    await refetch();
  } catch (error) {
    console.error('Error refreshing profile history:', error);
  } finally {
    loading.value = false;
  }
};

const toggleDetails = (itemId) => {
  if (expandedItems.value.has(itemId)) {
    expandedItems.value.delete(itemId);
  } else {
    expandedItems.value.add(itemId);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  return date.toLocaleString('ar-SA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const truncateText = (text, maxLength) => {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const getChangeTypeColor = (changeType) => {
  const colors = {
    'profile_update': 'primary',
    'settings_change': 'secondary',
    'avatar_change': 'success',
    'contact_update': 'info',
    'security_change': 'warning'
  };
  return colors[changeType] || 'grey';
};

const getChangeTypeIcon = (changeType) => {
  const icons = {
    'profile_update': 'mdi-account-edit',
    'settings_change': 'mdi-cog',
    'avatar_change': 'mdi-image',
    'contact_update': 'mdi-phone',
    'security_change': 'mdi-shield'
  };
  return icons[changeType] || 'mdi-pencil';
};

const getChangeTypeLabel = (changeType) => {
  const labels = {
    'profile_update': 'تحديث الملف الشخصي',
    'settings_change': 'تغيير الإعدادات',
    'avatar_change': 'تغيير الصورة الرمزية',
    'contact_update': 'تحديث معلومات الاتصال',
    'security_change': 'تغيير إعدادات الأمان'
  };
  return labels[changeType] || 'تغيير غير معروف';
};

const getChangedFields = (item) => {
  const fields = [];
  if (item.phone) fields.push('phone');
  if (item.address) fields.push('address');
  if (item.bio) fields.push('bio');
  if (item.avatar) fields.push('avatar');
  if (item.preferences && Object.keys(item.preferences).length > 0) fields.push('preferences');
  return fields;
};

const getFieldLabel = (field) => {
  const labels = {
    'phone': 'رقم الهاتف',
    'address': 'العنوان',
    'bio': 'الوصف',
    'avatar': 'الصورة الرمزية',
    'preferences': 'التفضيلات'
  };
  return labels[field] || field;
};

onMounted(() => {
  refreshHistory();
});
</script>

<style scoped>
.activity-history-card {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.activity-history-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.timeline-card {
  background: rgba(var(--v-theme-surface), 0.95);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.timeline-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.changed-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

@media (max-width: 768px) {
  .timeline-card {
    margin-bottom: 8px;
  }
}
</style>
