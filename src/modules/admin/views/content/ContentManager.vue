<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 content-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-file-document-multiple</v-icon>
              {{ $t('contentManager') || 'إدارة المحتوى' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('contentManagerSubtitle') || 'إدارة المحتوى والصفحات' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="createContent"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t('createContent') || 'إنشاء محتوى' }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingContent') || 'جاري تحميل المحتوى...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Content Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in contentStats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="stat-card">
            <v-card-text class="pa-4 text-center">
              <v-avatar
                :color="stat.color"
                variant="tonal"
                size="50"
                class="mb-3"
              >
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.title }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Content Types -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="content-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-file-multiple</v-icon>
                {{ $t('contentTypes') || 'أنواع المحتوى' }}
              </h3>
              <div class="content-types-grid">
                <div v-for="type in contentTypes" :key="type.name" class="content-type-item">
                  <v-card variant="outlined" class="type-card">
                    <v-card-text class="pa-4 text-center">
                      <v-avatar :color="type.color" variant="tonal" size="48" class="mb-3">
                        <v-icon :color="type.color" size="24">{{ type.icon }}</v-icon>
                      </v-avatar>
                      <h4 class="text-body-2 font-weight-medium text-white mb-2">{{ type.name }}</h4>
                      <p class="text-caption text-medium-emphasis mb-3">{{ type.count }} {{ $t('items') || 'عناصر' }}</p>
                      <v-btn
                        @click="manageContentType(type)"
                        variant="tonal"
                        :color="type.color"
                        size="small"
                        prepend-icon="mdi-cog"
                      >
                        {{ $t('manage') || 'إدارة' }}
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="content-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-pie</v-icon>
                {{ $t('contentDistribution') || 'توزيع المحتوى' }}
              </h3>
              <div class="distribution-list">
                <div v-for="item in contentDistribution" :key="item.type" class="distribution-item d-flex align-center justify-space-between mb-3">
                  <div class="d-flex align-center ga-2">
                    <v-avatar :color="item.color" variant="tonal" size="24">
                      <v-icon size="12">{{ item.icon }}</v-icon>
                    </v-avatar>
                    <span class="text-body-2">{{ item.type }}</span>
                  </div>
                  <div class="text-end">
                    <span class="text-body-2 font-weight-medium text-white">{{ item.percentage }}%</span>
                    <v-progress-linear
                      :model-value="item.percentage"
                      :color="item.color"
                      height="4"
                      rounded
                      class="mt-1"
                    />
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Content -->
      <v-card variant="elevated" class="content-card">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
              <v-icon color="primary" size="20">mdi-clock</v-icon>
              {{ $t('recentContent') || 'المحتوى الأخير' }}
            </h3>
            <div class="d-flex ga-2">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchContent') || 'البحث في المحتوى'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 300px;"
              />
              <v-select
                v-model="typeFilter"
                :label="$t('filterByType') || 'فلترة حسب النوع'"
                :items="typeOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px;"
              />
            </div>
          </div>

          <v-data-table
            :headers="tableHeaders"
            :items="filteredContent"
            :loading="loading"
            :search="searchQuery"
            items-per-page="10"
            class="content-table"
          >
            <template #[`item.title`="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar :color="item.typeColor" variant="tonal" size="32">
                  <v-icon size="16">{{ item.typeIcon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium text-white">{{ item.title }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.description }}</div>
                </div>
              </div>
            </template>

            <template #[`item.author`="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar :color="item.authorColor" variant="tonal" size="24">
                  <v-icon size="12">mdi-account</v-icon>
                </v-avatar>
                <span class="text-body-2">{{ item.author }}</span>
              </div>
            </template>

            <template #[`item.status`="{ item }">
              <v-chip :color="item.statusColor" variant="tonal" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.actions`="{ item }">
              <div class="d-flex ga-1">
                <v-btn
                  @click="editContent(item)"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-pencil"
                >
                  {{ $t('edit') || 'تعديل' }}
                </v-btn>
                <v-btn
                  @click="deleteContent(item)"
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="mdi-delete"
                >
                  {{ $t('delete') || 'حذف' }}
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Create/Edit Content Dialog -->
    <v-dialog v-model="contentDialog" max-width="800px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium">
            {{ editingContent ? ($t('editContent') || 'تعديل المحتوى') : ($t('createContent') || 'إنشاء محتوى') }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="contentForm" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="currentContent.title"
                  :label="$t('contentTitle') || 'عنوان المحتوى'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentContent.description"
                  :label="$t('contentDescription') || 'وصف المحتوى'"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentContent.type"
                  :label="$t('contentType') || 'نوع المحتوى'"
                  :items="contentTypeOptions"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentContent.status"
                  :label="$t('status') || 'الحالة'"
                  :items="statusOptions"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentContent.content"
                  :label="$t('contentBody') || 'نص المحتوى'"
                  variant="outlined"
                  rows="10"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="contentDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="saveContent" color="primary" variant="elevated">
            {{ $t('save') || 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import ContentService from '@/services/ContentService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const contentDialog = ref(false);
const editingContent = ref(false);
const validForm = ref(false);
const searchQuery = ref('');
const typeFilter = ref('all');

// Form refs
const contentForm = ref(null);

// Data
const contentStats = ref([
  {
    title: t('totalContent') || 'إجمالي المحتوى',
    value: '234',
    icon: 'mdi-file-document-multiple',
    color: 'primary'
  },
  {
    title: t('publishedContent') || 'المحتوى المنشور',
    value: '189',
    icon: 'mdi-publish',
    color: 'success'
  },
  {
    title: t('draftContent') || 'المحتوى المسودة',
    value: '45',
    icon: 'mdi-file-edit',
    color: 'warning'
  },
  {
    title: t('scheduledContent') || 'المحتوى المجدول',
    value: '12',
    icon: 'mdi-clock',
    color: 'info'
  }
]);

const contentTypes = ref([
  {
    name: 'الصفحات',
    count: 45,
    icon: 'mdi-file-document',
    color: 'primary'
  },
  {
    name: 'المقالات',
    count: 67,
    icon: 'mdi-blog',
    color: 'success'
  },
  {
    name: 'المنتجات',
    count: 89,
    icon: 'mdi-shopping',
    color: 'warning'
  },
  {
    name: 'الصور',
    count: 156,
    icon: 'mdi-image',
    color: 'info'
  },
  {
    name: 'الفيديو',
    count: 23,
    icon: 'mdi-video',
    color: 'error'
  },
  {
    name: 'المستندات',
    count: 34,
    icon: 'mdi-file',
    color: 'purple'
  }
]);

const contentDistribution = ref([
  {
    type: 'الصفحات',
    percentage: 19,
    icon: 'mdi-file-document',
    color: 'primary'
  },
  {
    type: 'المقالات',
    percentage: 29,
    icon: 'mdi-blog',
    color: 'success'
  },
  {
    type: 'المنتجات',
    percentage: 38,
    icon: 'mdi-shopping',
    color: 'warning'
  },
  {
    type: 'الوسائط',
    percentage: 14,
    icon: 'mdi-image',
    color: 'info'
  }
]);

const contentItems = ref([
  {
    id: 1,
    title: 'الصفحة الرئيسية',
    description: 'صفحة الترحيب الرئيسية للموقع',
    type: 'الصفحات',
    status: 'منشور',
    statusColor: 'success',
    statusIcon: 'mdi-publish',
    typeColor: 'primary',
    typeIcon: 'mdi-file-document',
    author: 'أحمد محمد',
    authorColor: 'primary',
    createdAt: '2024-01-15',
    views: 3450
  },
  {
    id: 2,
    title: 'دليل استخدام المنتجات',
    description: 'دليل شامل لاستخدام منتجاتنا',
    type: 'المقالات',
    status: 'منشور',
    statusColor: 'success',
    statusIcon: 'mdi-publish',
    typeColor: 'success',
    typeIcon: 'mdi-blog',
    author: 'فاطمة علي',
    authorColor: 'success',
    createdAt: '2024-01-12',
    views: 2180
  },
  {
    id: 3,
    title: 'سياسة الخصوصية',
    description: 'سياسة الخصوصية والاستخدام',
    type: 'الصفحات',
    status: 'منشور',
    statusColor: 'success',
    statusIcon: 'mdi-publish',
    typeColor: 'primary',
    typeIcon: 'mdi-file-document',
    author: 'محمد عبدالله',
    authorColor: 'warning',
    createdAt: '2024-01-10',
    views: 890
  },
  {
    id: 4,
    title: 'مقالة جديدة عن المنتجات',
    description: 'مقالة قيد المراجعة',
    type: 'المقالات',
    status: 'مسودة',
    statusColor: 'warning',
    statusIcon: 'mdi-file-edit',
    typeColor: 'success',
    typeIcon: 'mdi-blog',
    author: 'نورة سالم',
    authorColor: 'info',
    createdAt: '2024-01-08',
    views: 0
  }
]);

const currentContent = ref({
  id: null,
  title: '',
  description: '',
  content: '',
  type: '',
  status: 'مسودة'
});

const contentTypeOptions = ref([
  'الصفحات',
  'المقالات',
  'المنتجات',
  'الصور',
  'الفيديو',
  'المستندات'
]);

const statusOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'منشور', value: 'منشور' },
  { title: 'مسودة', value: 'مسودة' },
  { title: 'مجدول', value: 'مجدول' }
]);

const typeOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'الصفحات', value: 'الصفحات' },
  { title: 'المقالات', value: 'المقالات' },
  { title: 'المنتجات', value: 'المنتجات' },
  { title: 'الوسائط', value: 'الوسائط' }
]);

const tableHeaders = ref([
  { title: t('title') || 'العنوان', key: 'title', sortable: true },
  { title: t('type') || 'النوع', key: 'type', sortable: true },
  { title: t('author') || 'المؤلف', key: 'author', sortable: true },
  { title: t('status') || 'الحالة', key: 'status', sortable: true },
  { title: t('views') || 'المشاهدات', key: 'views', sortable: true },
  { title: t('actions') || 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]);

// Computed
const filteredContent = computed(() => {
  let filtered = contentItems.value;
  
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(item => item.type === typeFilter.value);
  }
  
  return filtered;
});

// API Integration Methods
const loadContentData = async () => {
  try {
    const response = await ContentService.getContentItems();
    if (response.success) {
      // Update data with API response
      contentItems.value = response.data.contentItems || contentItems.value;
      contentStats.value = response.data.contentStats || contentStats.value;
      contentTypes.value = response.data.contentTypes || contentTypes.value;
      contentDistribution.value = response.data.contentDistribution || contentDistribution.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for content manager');
    }
  } catch (error) {
    console.error('Error loading content data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('contentError') || 'خطأ في تحميل المحتوى',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const createContent = () => {
  editingContent.value = false;
  currentContent.value = {
    id: null,
    title: '',
    description: '',
    content: '',
    type: '',
    status: 'مسودة'
  };
  contentDialog.value = true;
};

const editContent = (item) => {
  editingContent.value = true;
  currentContent.value = { ...item };
  contentDialog.value = true;
};

const saveContent = async () => {
  if (!contentForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    if (editingContent.value) {
      // Update existing content
      const response = await ContentService.updateContent(currentContent.value);
      if (response.success) {
        const index = contentItems.value.findIndex(item => item.id === currentContent.value.id);
        if (index > -1) {
          contentItems.value[index] = { ...currentContent.value };
        }
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('contentUpdated') || 'تم تحديث المحتوى',
          message: t('contentUpdatedSuccessfully') || 'تم تحديث المحتوى بنجاح',
          timeout: 2000
        });
      }
    } else {
      // Create new content
      const response = await ContentService.createContent(currentContent.value);
      if (response.success) {
        contentItems.value.unshift({
          ...currentContent.value,
          id: Date.now(),
          author: 'المسؤول الحالي',
          authorColor: 'primary',
          createdAt: new Date().toISOString().split('T')[0],
          views: 0,
          statusColor: currentContent.value.status === 'منشور' ? 'success' : 'warning',
          statusIcon: currentContent.value.status === 'منشور' ? 'mdi-publish' : 'mdi-file-edit'
        });
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('contentCreated') || 'تم إنشاء المحتوى',
          message: t('contentCreatedSuccessfully') || 'تم إنشاء المحتوى بنجاح',
          timeout: 2000
        });
      }
    }
    
    contentDialog.value = false;
    await loadContentData();
  } catch (error) {
    console.error('Error saving content:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'خطأ في الحفظ',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const deleteContent = async (item) => {
  if (!confirm(t('confirmDeleteContent') || 'هل أنت متأكد من حذف هذا المحتوى؟')) return;
  
  try {
    loading.value = true;
    
    const response = await ContentService.deleteContent(item.id);
    if (response.success) {
      const index = contentItems.value.findIndex(item => item.id === item.id);
      if (index > -1) {
        contentItems.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('contentDeleted') || 'تم حذف المحتوى',
        message: t('contentDeletedSuccessfully') || 'تم حذف المحتوى بنجاح',
        timeout: 2000
      });
    }
    
    await loadContentData();
  } catch (error) {
    console.error('Error deleting content:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'خطأ في الحذف',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const manageContentType = (type) => {
  // Navigate to content type management
  console.log('Managing content type:', type);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('contentTypeManagement') || 'إدارة نوع المحتوى',
    message: `${t('managing') || 'جاري إدارة'} ${type.name}`,
    timeout: 2000
  });
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadContentData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('contentDataRefreshed') || 'تم تحديث بيانات المحتوى بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    await loadContentData();
  } catch (error) {
    console.error('Error initializing Content Manager:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Content Header */
.content-header {
  position: relative;
  overflow: hidden;
}

.content-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.content-header:hover::before {
  left: 100%;
}

/* Stat Cards */
.stat-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Content Cards */
.content-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.content-card:hover::before {
  left: 100%;
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Content Types Grid */
.content-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.content-type-item {
  transition: all 0.3s ease;
}

.type-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.type-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.type-card:hover::before {
  left: 100%;
}

.type-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Distribution Items */
.distribution-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.distribution-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.distribution-item:hover::before {
  left: 100%;
}

.distribution-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Content Table */
.content-table {
  transition: all 0.3s ease;
}

.content-table:hover {
  transform: scale(1.01);
}

/* Animations */
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

.stat-card {
  animation: fadeIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.content-card {
  animation: fadeIn 0.6s ease forwards;
}

.content-card:nth-child(1) { animation-delay: 0.1s; }
.content-card:nth-child(2) { animation-delay: 0.2s; }

.type-card,
.distribution-item {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .content-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .content-types-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 600px) {
  .content-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .content-card {
    margin-bottom: 1rem;
  }
  
  .content-types-grid {
    grid-template-columns: 1fr;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-chip) {
  transition: all 0.3s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
}

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-icon) {
  transition: all 0.3s ease;
}

:deep(.v-icon:hover) {
  transform: scale(1.1);
}

:deep(.v-data-table) {
  transition: all 0.3s ease;
}

:deep(.v-data-table:hover) {
  transform: scale(1.01);
}

:deep(.v-dialog) {
  transition: all 0.3s ease;
}

:deep(.v-form) {
  transition: all 0.3s ease;
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: scale(1.02);
}

:deep(.v-select) {
  transition: all 0.3s ease;
}

:deep(.v-select:hover) {
  transform: scale(1.02);
}

:deep(.v-textarea) {
  transition: all 0.3s ease;
}

:deep(.v-textarea:hover) {
  transform: scale(1.01);
}

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
}
</style>
