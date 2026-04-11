<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 media-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-image-multiple</v-icon>
              {{ $t('mediaManager') || 'إدارة الوسائط' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('mediaManagerSubtitle') || 'إدارة الصور والفيديوهات والملفات' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="uploadMedia"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-upload"
            >
              {{ $t('uploadMedia') || 'رفع وسائط' }}
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
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingMedia') || 'جاري تحميل الوسائط...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Media Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in mediaStats"
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

      <!-- Media Types -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="media-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-folder-multiple</v-icon>
                {{ $t('mediaTypes') || 'أنواع الوسائط' }}
              </h3>
              <div class="media-types-grid">
                <div v-for="type in mediaTypes" :key="type.name" class="media-type-item">
                  <v-card variant="outlined" class="type-card">
                    <v-card-text class="pa-4 text-center">
                      <v-avatar :color="type.color" variant="tonal" size="48" class="mb-3">
                        <v-icon :color="type.color" size="24">{{ type.icon }}</v-icon>
                      </v-avatar>
                      <h4 class="text-body-2 font-weight-medium text-white mb-2">{{ type.name }}</h4>
                      <p class="text-caption text-medium-emphasis mb-3">{{ type.count }} {{ $t('files') || 'ملفات' }}</p>
                      <div class="text-caption text-medium-emphasis mb-3">{{ formatFileSize(type.size) }}</div>
                      <v-btn
                        @click="browseMediaType(type)"
                        variant="tonal"
                        :color="type.color"
                        size="small"
                        prepend-icon="mdi-folder-open"
                      >
                        {{ $t('browse') || 'استعراض' }}
                      </v-btn>
                    </v-card-text>
                  </v-card>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="media-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-pie</v-icon>
                {{ $t('storageUsage') || 'استخدام التخزين' }}
              </h3>
              <div class="storage-usage">
                <div class="usage-item mb-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('used') || 'مستخدم' }}</span>
                    <span class="text-body-2 font-weight-medium text-white">{{ formatFileSize(storageStats.used) }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(storageStats.used / storageStats.total) * 100"
                    color="primary"
                    height="8"
                    rounded
                  />
                </div>
                <div class="usage-item">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('available') || 'متاح' }}</span>
                    <span class="text-body-2 font-weight-medium text-success">{{ formatFileSize(storageStats.available) }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(storageStats.available / storageStats.total) * 100"
                    color="success"
                    height="8"
                    rounded
                  />
                </div>
                <div class="text-center mt-4">
                  <div class="text-h5 font-weight-bold text-white mb-1">{{ formatFileSize(storageStats.total) }}</div>
                  <div class="text-caption text-medium-emphasis">{{ $t('totalStorage') || 'إجمالي التخزين' }}</div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Media -->
      <v-card variant="elevated" class="media-card">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
              <v-icon color="primary" size="20">mdi-clock</v-icon>
              {{ $t('recentMedia') || 'الوسائط الأخيرة' }}
            </h3>
            <div class="d-flex ga-2">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchMedia') || 'البحث في الوسائط'"
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

          <v-row>
            <v-col
              v-for="media in filteredMedia"
              :key="media.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
            >
              <v-card variant="outlined" class="media-item">
                <v-card-text class="pa-3">
                  <div class="media-preview mb-3">
                    <v-img
                      v-if="media.type === 'image'"
                      :src="media.thumbnail"
                      :alt="media.name"
                      height="120"
                      cover
                      class="rounded"
                    />
                    <div v-else class="media-placeholder d-flex align-center justify-center" style="height: 120px;">
                      <v-icon :color="media.typeColor" size="48">{{ media.typeIcon }}</v-icon>
                    </div>
                  </div>
                  <h4 class="text-body-2 font-weight-medium text-white mb-1 text-truncate">{{ media.name }}</h4>
                  <div class="d-flex align-center ga-2 mb-2">
                    <v-chip :color="media.typeColor" variant="tonal" size="x-small">
                      {{ media.type }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">{{ formatFileSize(media.size) }}</span>
                  </div>
                  <div class="d-flex ga-1">
                    <v-btn
                      @click="viewMedia(media)"
                      variant="tonal"
                      color="primary"
                      size="small"
                      prepend-icon="mdi-eye"
                    >
                      {{ $t('view') || 'عرض' }}
                    </v-btn>
                    <v-btn
                      @click="downloadMedia(media)"
                      variant="tonal"
                      color="success"
                      size="small"
                      prepend-icon="mdi-download"
                    >
                      {{ $t('download') || 'تحميل' }}
                    </v-btn>
                    <v-btn
                      @click="deleteMedia(media)"
                      variant="tonal"
                      color="error"
                      size="small"
                      prepend-icon="mdi-delete"
                    >
                      {{ $t('delete') || 'حذف' }}
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <!-- Upload Dialog -->
    <v-dialog v-model="uploadDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium">
            {{ $t('uploadMedia') || 'رفع وسائط' }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="uploadForm" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-file-input
                  v-model="selectedFiles"
                  :label="$t('selectFiles') || 'اختر الملفات'"
                  multiple
                  variant="outlined"
                  prepend-icon="mdi-paperclip"
                  accept="image/*,video/*,.pdf,.doc,.docx"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="uploadCategory"
                  :label="$t('category') || 'الفئة'"
                  :items="categoryOptions"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="uploadDescription"
                  :label="$t('description') || 'الوصف'"
                  variant="outlined"
                  rows="3"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="uploadDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="uploadFiles" color="primary" variant="elevated">
            {{ $t('upload') || 'رفع' }}
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
import MediaService from '@/services/MediaService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const uploadDialog = ref(false);
const validForm = ref(false);
const searchQuery = ref('');
const typeFilter = ref('all');

// Form refs
const uploadForm = ref(null);

// Form data
const selectedFiles = ref([]);
const uploadCategory = ref('');
const uploadDescription = ref('');

// Data
const mediaStats = ref([
  {
    title: t('totalMedia') || 'إجمالي الوسائط',
    value: '456',
    icon: 'mdi-image-multiple',
    color: 'primary'
  },
  {
    title: t('images') || 'الصور',
    value: '324',
    icon: 'mdi-image',
    color: 'success'
  },
  {
    title: t('videos') || 'الفيديوهات',
    value: '67',
    icon: 'mdi-video',
    color: 'warning'
  },
  {
    title: t('documents') || 'المستندات',
    value: '65',
    icon: 'mdi-file-document',
    color: 'info'
  }
]);

const mediaTypes = ref([
  {
    name: 'الصور',
    count: 324,
    size: 2457600000,
    icon: 'mdi-image',
    color: 'success'
  },
  {
    name: 'الفيديوهات',
    count: 67,
    size: 8192000000,
    icon: 'mdi-video',
    color: 'warning'
  },
  {
    name: 'المستندات',
    count: 65,
    size: 512000000,
    icon: 'mdi-file-document',
    color: 'info'
  },
  {
    name: 'الصوت',
    count: 23,
    size: 256000000,
    icon: 'mdi-music',
    color: 'error'
  },
  {
    name: 'الأرشيف',
    count: 12,
    size: 1024000000,
    icon: 'mdi-archive',
    color: 'purple'
  },
  {
    name: 'آخر',
    count: 8,
    size: 128000000,
    icon: 'mdi-file',
    color: 'grey'
  }
]);

const storageStats = ref({
  used: 10240000000,
  available: 5242880000,
  total: 15462880000
});

const mediaItems = ref([
  {
    id: 1,
    name: 'ملصق حائط زهور',
    type: 'image',
    size: 2457600,
    thumbnail: 'https://picsum.photos/seed/wall1/300/200.jpg',
    typeColor: 'success',
    typeIcon: 'mdi-image',
    createdAt: '2024-01-15',
    category: 'الجدران'
  },
  {
    id: 2,
    name: 'فيديو تعليمي للمنتج',
    type: 'video',
    size: 52428800,
    thumbnail: null,
    typeColor: 'warning',
    typeIcon: 'mdi-video',
    createdAt: '2024-01-12',
    category: 'الفيديوهات'
  },
  {
    id: 3,
    name: 'دليل المستخدم',
    type: 'document',
    size: 1048576,
    thumbnail: null,
    typeColor: 'info',
    typeIcon: 'mdi-file-document',
    createdAt: '2024-01-10',
    category: 'المستندات'
  },
  {
    id: 4,
    name: 'ملصق باب خشبي',
    type: 'image',
    size: 3145728,
    thumbnail: 'https://picsum.photos/seed/door1/300/200.jpg',
    typeColor: 'success',
    typeIcon: 'mdi-image',
    createdAt: '2024-01-08',
    category: 'الأبواب'
  },
  {
    id: 5,
    name: 'ملصق سيارة رياضي',
    type: 'image',
    size: 4096000,
    thumbnail: 'https://picsum.photos/seed/car1/300/200.jpg',
    typeColor: 'success',
    typeIcon: 'mdi-image',
    createdAt: '2024-01-05',
    category: 'السيارات'
  },
  {
    id: 6,
    name: 'ملصق مطبخ عصري',
    type: 'image',
    size: 2867200,
    thumbnail: 'https://picsum.photos/seed/kitchen1/300/200.jpg',
    typeColor: 'success',
    typeIcon: 'mdi-image',
    createdAt: '2024-01-03',
    category: 'المطابخ'
  },
  {
    id: 7,
    name: 'موسيقى خلفية',
    type: 'audio',
    size: 8388608,
    thumbnail: null,
    typeColor: 'error',
    typeIcon: 'mdi-music',
    createdAt: '2024-01-01',
    category: 'الصوت'
  },
  {
    id: 8,
    name: 'أرشيف المنتجات',
    type: 'archive',
    size: 52428800,
    thumbnail: null,
    typeColor: 'purple',
    typeIcon: 'mdi-archive',
    createdAt: '2023-12-28',
    category: 'الأرشيف'
  }
]);

const categoryOptions = ref([
  'الجدران',
  'الأبواب',
  'السيارات',
  'المطابخ',
  'الأثاث',
  'الفيديوهات',
  'المستندات',
  'الصوت',
  'الأرشيف',
  'آخر'
]);

const typeOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'الصور', value: 'image' },
  { title: 'الفيديوهات', value: 'video' },
  { title: 'المستندات', value: 'document' },
  { title: 'الصوت', value: 'audio' },
  { title: 'الأرشيف', value: 'archive' }
]);

// Computed
const filteredMedia = computed(() => {
  let filtered = mediaItems.value;
  
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(item => item.type === typeFilter.value);
  }
  
  if (searchQuery.value) {
    filtered = filtered.filter(item => 
      item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return filtered;
});

// API Integration Methods
const loadMediaData = async () => {
  try {
    const response = await MediaService.getMediaItems();
    if (response.success) {
      // Update data with API response
      mediaItems.value = response.data.mediaItems || mediaItems.value;
      mediaStats.value = response.data.mediaStats || mediaStats.value;
      mediaTypes.value = response.data.mediaTypes || mediaTypes.value;
      storageStats.value = response.data.storageStats || storageStats.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for media manager');
    }
  } catch (error) {
    console.error('Error loading media data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('mediaError') || 'خطأ في تحميل الوسائط',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const uploadMedia = () => {
  uploadDialog.value = true;
  selectedFiles.value = [];
  uploadCategory.value = '';
  uploadDescription.value = '';
};

const uploadFiles = async () => {
  if (!uploadForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    const formData = new FormData();
    selectedFiles.value.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', uploadCategory.value);
    formData.append('description', uploadDescription.value);
    
    const response = await MediaService.uploadMedia(formData);
    if (response.success) {
      // Add uploaded files to media items
      const newMediaItems = response.data.uploadedFiles.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        type: file.type,
        size: file.size,
        thumbnail: file.thumbnail,
        typeColor: getTypeColor(file.type),
        typeIcon: getTypeIcon(file.type),
        createdAt: new Date().toISOString().split('T')[0],
        category: uploadCategory.value
      }));
      
      mediaItems.value.unshift(...newMediaItems);
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('mediaUploaded') || 'تم رفع الوسائط',
        message: t('mediaUploadedSuccessfully') || 'تم رفع الوسائط بنجاح',
        timeout: 2000
      });
      
      uploadDialog.value = false;
      await loadMediaData();
    }
  } catch (error) {
    console.error('Error uploading media:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('uploadError') || 'خطأ في الرفع',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const viewMedia = (media) => {
  // Open media viewer
  console.log('Viewing media:', media);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('viewingMedia') || 'عرض الوسائط',
    message: `${t('viewing') || 'جاري عرض'} ${media.name}`,
    timeout: 2000
  });
};

const downloadMedia = async (media) => {
  try {
    const response = await MediaService.downloadMedia(media.id);
    if (response.success) {
      // Create download link
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = media.name;
      a.click();
      URL.revokeObjectURL(url);
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('mediaDownloaded') || 'تم تحميل الوسائط',
        message: `${media.name} ${t('downloadedSuccessfully') || 'تم تحميله بنجاح'}`,
        timeout: 2000
      });
    }
  } catch (error) {
    console.error('Error downloading media:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('downloadError') || 'خطأ في التحميل',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

const deleteMedia = async (media) => {
  if (!confirm(t('confirmDeleteMedia') || 'هل أنت متأكد من حذف هذا الوسائط؟')) return;
  
  try {
    loading.value = true;
    
    const response = await MediaService.deleteMedia(media.id);
    if (response.success) {
      const index = mediaItems.value.findIndex(item => item.id === media.id);
      if (index > -1) {
        mediaItems.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('mediaDeleted') || 'تم حذف الوسائط',
        message: `${media.name} ${t('deletedSuccessfully') || 'تم حذفه بنجاح'}`,
        timeout: 2000
      });
      
      await loadMediaData();
    }
  } catch (error) {
    console.error('Error deleting media:', error);
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

const browseMediaType = (type) => {
  // Navigate to media type browser
  console.log('Browsing media type:', type);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('browsingMediaType') || 'استعراض نوع الوسائط',
    message: `${t('browsing') || 'جاري استعراض'} ${type.name}`,
    timeout: 2000
  });
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadMediaData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('mediaDataRefreshed') || 'تم تحديث بيانات الوسائط بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

const getTypeColor = (type) => {
  const colors = {
    image: 'success',
    video: 'warning',
    document: 'info',
    audio: 'error',
    archive: 'purple'
  };
  return colors[type] || 'grey';
};

const getTypeIcon = (type) => {
  const icons = {
    image: 'mdi-image',
    video: 'mdi-video',
    document: 'mdi-file-document',
    audio: 'mdi-music',
    archive: 'mdi-archive'
  };
  return icons[type] || 'mdi-file';
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    await loadMediaData();
  } catch (error) {
    console.error('Error initializing Media Manager:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Media Header */
.media-header {
  position: relative;
  overflow: hidden;
}

.media-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.media-header:hover::before {
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

/* Media Cards */
.media-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.media-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.media-card:hover::before {
  left: 100%;
}

.media-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Media Types Grid */
.media-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.media-type-item {
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

/* Storage Usage */
.storage-usage {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.usage-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.usage-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.usage-item:hover::before {
  left: 100%;
}

.usage-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Media Items */
.media-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.media-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.media-item:hover::before {
  left: 100%;
}

.media-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.media-preview {
  position: relative;
  overflow: hidden;
  border-radius: 8px;
}

.media-placeholder {
  background: rgba(var(--v-theme-surface), 0.5);
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 8px;
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

.media-card {
  animation: fadeIn 0.6s ease forwards;
}

.media-card:nth-child(1) { animation-delay: 0.1s; }
.media-card:nth-child(2) { animation-delay: 0.2s; }

.type-card,
.usage-item,
.media-item {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .media-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .media-types-grid {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

@media (max-width: 600px) {
  .media-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .media-card {
    margin-bottom: 1rem;
  }
  
  .media-types-grid {
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

:deep(.v-img) {
  transition: all 0.3s ease;
}

:deep(.v-img:hover) {
  transform: scale(1.05);
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

:deep(.v-file-input) {
  transition: all 0.3s ease;
}

:deep(.v-file-input:hover) {
  transform: scale(1.02);
}

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
}
</style>
