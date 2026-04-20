<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 blog-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-blog</v-icon>
              {{ $t('blogManager') || 'Blog Manager' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('blogManagerSubtitle') || 'Manage blog posts and categories' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="currentTab === 'posts' ? createPost() : createCategory()"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ currentTab === 'posts' ? ($t('createPost') || 'Create Post') : ($t('createCategory') || 'Create Category') }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
              :loading="loading"
            >
              {{ $t('refresh') || 'Refresh' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Tab Navigation -->
    <v-tabs
      v-model="currentTab"
      color="primary"
      class="mb-6"
      grow
    >
      <v-tab value="posts">
        <v-icon start>mdi-file-document-multiple</v-icon>
        {{ $t('posts') || 'Posts' }}
      </v-tab>
      <v-tab value="categories">
        <v-icon start>mdi-folder-multiple</v-icon>
        {{ $t('categories') || 'Categories' }}
      </v-tab>
    </v-tabs>

    <!-- Tab Content -->
    <v-window v-model="currentTab">
      <!-- Posts Tab -->
      <v-window-item value="posts">
        <div v-if="loading && blogPosts.length === 0" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="mt-4 text-medium-emphasis">{{ $t('loadingBlogPosts') || 'Loading blog posts...' }}</p>
        </div>

        <div v-else>
          <!-- Blog Stats -->
          <v-row class="mb-6">
            <v-col
              v-for="stat in blogStats"
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

          <!-- Blog Posts Table -->
          <v-card variant="elevated" class="blog-card">
            <v-card-text class="pa-4">
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
                  <v-icon color="primary" size="20">mdi-file-document-multiple</v-icon>
                  {{ $t('blogPosts') || 'Blog Posts' }}
                </h3>
                <div class="d-flex ga-2">
                  <v-text-field
                    v-model="searchQuery"
                    :label="$t('searchPosts') || 'Search posts'"
                    prepend-inner-icon="mdi-magnify"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 300px;"
                  />
                  <v-select
                    v-model="statusFilter"
                    :label="$t('filterByStatus') || 'Filter by status'"
                    :items="statusOptions"
                    variant="outlined"
                    density="compact"
                    hide-details
                    style="max-width: 200px;"
                  />
                </div>
              </div>

              <v-data-table
                :headers="tableHeaders"
                :items="filteredPosts"
                :loading="loading"
                :search="searchQuery"
                items-per-page="10"
                class="blog-table"
              >
                <template #[`item.title`]="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-avatar :color="item.statusColor" variant="tonal" size="32">
                      <v-icon size="16">{{ item.statusIcon }}</v-icon>
                    </v-avatar>
                    <div>
                      <div class="text-body-2 font-weight-medium text-white">{{ item.title }}</div>
                      <div class="text-caption text-medium-emphasis">{{ item.excerpt }}</div>
                    </div>
                  </div>
                </template>

                <template #[`item.author`]="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-avatar :color="item.authorColor" variant="tonal" size="24">
                      <v-icon size="12">mdi-account</v-icon>
                    </v-avatar>
                    <span class="text-body-2">{{ item.author }}</span>
                  </div>
                </template>

                <template #[`item.status`]="{ item }">
                  <v-chip :color="item.statusColor" variant="tonal" size="small">
                    {{ item.status }}
                  </v-chip>
                </template>

                <template #[`item.view_count`]="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-icon color="primary" size="16">mdi-eye</v-icon>
                    <span class="text-body-2">{{ item.view_count || item.views || 0 }}</span>
                  </div>
                </template>

                <template #[`item.read_time_minutes`]="{ item }">
                  <div class="d-flex align-center ga-2">
                    <v-icon color="info" size="16">mdi-clock-outline</v-icon>
                    <span class="text-body-2">{{ item.read_time_minutes || 1 }} {{ $t('minutes') || 'min' }}</span>
                  </div>
                </template>

                <template #[`item.actions`]="{ item }">
                  <div class="d-flex ga-1">
                    <v-btn
                      @click="editPost(item)"
                      variant="tonal"
                      color="primary"
                      size="small"
                      prepend-icon="mdi-pencil"
                    >
                      {{ $t('edit') || 'Edit' }}
                    </v-btn>
                    <v-btn
                      @click="deletePost(item)"
                      variant="tonal"
                      color="error"
                      size="small"
                      prepend-icon="mdi-delete"
                    >
                      {{ $t('delete') || 'Delete' }}
                    </v-btn>
                  </div>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>
      </v-window-item>

      <!-- Categories Tab -->
      <v-window-item value="categories">
        <BlogCategoryManager ref="categoryManager" />
      </v-window-item>
    </v-window>

    <!-- Create/Edit Post Dialog -->
    <v-dialog v-model="postDialog" max-width="800px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium">
            {{ editingPost ? ($t('editPost') || 'Edit Post') : ($t('createPost') || 'Create Post') }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="postForm" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="currentPost.title"
                  :label="$t('postTitle') || 'عنوان المقال'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentPost.excerpt"
                  :label="$t('postExcerpt') || 'Post Excerpt/Summary'"
                  variant="outlined"
                  rows="3"
                  :hint="$t('excerptHint') || 'Brief summary of the blog post'"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentPost.featured_image_url"
                  :label="$t('featuredImageUrl') || 'Featured Image URL'"
                  variant="outlined"
                  :hint="$t('featuredImageHint') || 'URL to the featured image'"
                  persistent-hint
                  prepend-inner-icon="mdi-image"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentPost.read_time_minutes"
                  :label="$t('readTimeMinutes') || 'Read Time (minutes)'"
                  variant="outlined"
                  type="number"
                  min="1"
                  :hint="$t('readTimeHint') || 'Estimated reading time in minutes'"
                  persistent-hint
                  prepend-inner-icon="mdi-clock-outline"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentPost.category"
                  :label="$t('category') || 'الفئة'"
                  :items="categories"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentPost.is_published"
                  :label="$t('status') || 'Status'"
                  :items="publishStatusOptions"
                  variant="outlined"
                  required
                  item-title="title"
                  item-value="value"
                  :hint="$t('statusHint') || 'Publishing status of the post'"
                  persistent-hint
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="currentPost.scheduled_at"
                  :label="$t('scheduledAt') || 'Scheduled At'"
                  variant="outlined"
                  type="datetime-local"
                  :hint="$t('scheduleHint') || 'When this post is scheduled to be published'"
                  persistent-hint
                  prepend-inner-icon="mdi-calendar-clock"
                  :disabled="currentPost.is_published"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentPost.content"
                  :label="$t('postContent') || 'محتوى المقال'"
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
          <v-btn @click="postDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="savePost" color="primary" variant="elevated">
            {{ $t('save') || 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import BlogService from '@/shared/services/business/BlogService';
import BlogCategoryManager from './components/BlogCategoryManager.vue';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const postDialog = ref(false);
const editingPost = ref(false);
const validForm = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');
const currentTab = ref('posts');

// Form refs
const postForm = ref(null);
const categoryManager = ref(null);

// Data
const blogStats = ref([
  {
    title: t('totalPosts') || 'إجمالي المقالات',
    value: '156',
    icon: 'mdi-file-document-multiple',
    color: 'primary'
  },
  {
    title: t('publishedPosts') || 'المقالات المنشورة',
    value: '124',
    icon: 'mdi-publish',
    color: 'success'
  },
  {
    title: t('draftPosts') || 'المقالات المسودة',
    value: '32',
    icon: 'mdi-file-edit',
    color: 'warning'
  },
  {
    title: t('scheduledPosts') || 'المقالات المجدولة',
    value: '8',
    icon: 'mdi-clock',
    color: 'info'
  }
]);

const blogPosts = ref([
  {
    id: 1,
    title: 'كيفية تزيين جدران منزلك بملصقات فنية',
    excerpt: 'دليل شامل لاختيار وتركيب الملصقات الفنية لجدران منزلك',
    author: 'أحمد محمد',
    category: 'ديكور',
    status: 'منشور',
    statusColor: 'success',
    statusIcon: 'mdi-publish',
    authorColor: 'primary',
    createdAt: '2024-01-15',
    views: 1250
  },
  {
    id: 2,
    title: 'أفضل ملصقات السيارات لعام 2024',
    excerpt: 'استعراض لأحدث ملصقات السيارات وتطبيقاتها',
    author: 'فاطمة علي',
    category: 'سيارات',
    status: 'منشور',
    statusColor: 'success',
    statusIcon: 'mdi-publish',
    authorColor: 'success',
    createdAt: '2024-01-12',
    views: 980
  },
  {
    id: 3,
    title: 'ملصقات المطابخ العصرية',
    excerpt: 'أفكار مبتكرة لملصقات المطابخ العصرية',
    author: 'محمد عبدالله',
    category: 'مطابخ',
    status: 'مسودة',
    statusColor: 'warning',
    statusIcon: 'mdi-file-edit',
    authorColor: 'warning',
    createdAt: '2024-01-10',
    views: 0
  },
  {
    id: 4,
    title: 'فن الملصقات ثلاثية الأبعاد',
    excerpt: 'تقنيات جديدة في عالم الملصقات ثلاثية الأبعاد',
    author: 'نورة سالم',
    category: 'فن',
    status: 'مجدول',
    statusColor: 'info',
    statusIcon: 'mdi-clock',
    authorColor: 'info',
    createdAt: '2024-01-08',
    views: 0
  }
]);

const currentPost = ref({
  id: null,
  title: '',
  excerpt: '',
  content: '',
  category: '',
  is_published: false,
  featured_image_url: '',
  read_time_minutes: 1,
  scheduled_at: null
});

const categories = ref([
  'ديكور',
  'سيارات',
  'مطابخ',
  'فن',
  'أثاث',
  'أبواب'
]);

const statusOptions = ref([
  { title: 'All', value: 'all' },
  { title: 'Published', value: true },
  { title: 'Draft', value: false },
  { title: 'Scheduled', value: 'scheduled' }
]);

const publishStatusOptions = ref([
  { title: 'Draft', value: false },
  { title: 'Published', value: true }
]);

const tableHeaders = ref([
  { title: t('title') || 'Title', key: 'title', sortable: true },
  { title: t('author') || 'Author', key: 'author', sortable: true },
  { title: t('category') || 'Category', key: 'category', sortable: true },
  { title: t('status') || 'Status', key: 'status', sortable: true },
  { title: t('views') || 'Views', key: 'view_count', sortable: true },
  { title: t('readTime') || 'Read Time', key: 'read_time_minutes', sortable: true },
  { title: t('actions') || 'Actions', key: 'actions', sortable: false, align: 'center' }
]);

// Computed
const filteredPosts = computed(() => {
  let filtered = blogPosts.value;
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(post => post.status === statusFilter.value);
  }
  
  return filtered;
});

// API Integration Methods
const loadBlogData = async () => {
  try {
    const response = await BlogService.getBlogPosts();
    if (response.success) {
      // Update data with API response
      blogPosts.value = response.data.blogPosts || blogPosts.value;
      blogStats.value = response.data.blogStats || blogStats.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for blog manager');
    }
  } catch (error) {
    console.error('Error loading blog data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('blogError') || 'خطأ في تحميل المدونة',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const createPost = () => {
  editingPost.value = false;
  currentPost.value = {
    id: null,
    title: '',
    excerpt: '',
    content: '',
    category: '',
    is_published: false,
    featured_image_url: '',
    read_time_minutes: 1,
    scheduled_at: null
  };
  postDialog.value = true;
};

const createCategory = () => {
  // Switch to categories tab and trigger create
  currentTab.value = 'categories';
  // Use $nextTick to ensure the tab switch is complete before accessing the component
  nextTick(() => {
    if (categoryManager.value) {
      categoryManager.value.createCategory();
    }
  });
};

const editPost = (post) => {
  editingPost.value = true;
  currentPost.value = { ...post };
  postDialog.value = true;
};

const savePost = async () => {
  if (!postForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    if (editingPost.value) {
      // Update existing post
      const response = await BlogService.updatePost(currentPost.value);
      if (response.success) {
        const index = blogPosts.value.findIndex(p => p.id === currentPost.value.id);
        if (index > -1) {
          blogPosts.value[index] = { ...currentPost.value };
        }
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('postUpdated') || 'تم تحديث المقال',
          message: t('postUpdatedSuccessfully') || 'تم تحديث المقال بنجاح',
          timeout: 2000
        });
      }
    } else {
      // Create new post
      const response = await BlogService.createPost(currentPost.value);
      if (response.success) {
        blogPosts.value.unshift({
          ...currentPost.value,
          id: Date.now(),
          author: 'المسؤول الحالي',
          authorColor: 'primary',
          createdAt: new Date().toISOString().split('T')[0],
          views: 0
        });
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('postCreated') || 'تم إنشاء المقال',
          message: t('postCreatedSuccessfully') || 'تم إنشاء المقال بنجاح',
          timeout: 2000
        });
      }
    }
    
    postDialog.value = false;
    await loadBlogData();
  } catch (error) {
    console.error('Error saving post:', error);
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

const deletePost = async (post) => {
  if (!confirm(t('confirmDeletePost') || 'هل أنت متأكد من حذف هذا المقال؟')) return;
  
  try {
    loading.value = true;
    
    const response = await BlogService.deletePost(post.id);
    if (response.success) {
      const index = blogPosts.value.findIndex(p => p.id === post.id);
      if (index > -1) {
        blogPosts.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('postDeleted') || 'تم حذف المقال',
        message: t('postDeletedSuccessfully') || 'تم حذف المقال بنجاح',
        timeout: 2000
      });
    }
    
    await loadBlogData();
  } catch (error) {
    console.error('Error deleting post:', error);
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

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadBlogData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('blogDataRefreshed') || 'تم تحديث بيانات المدونة بنجاح',
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
    await loadBlogData();
  } catch (error) {
    console.error('Error initializing Blog Manager:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Blog Header */
.blog-header {
  position: relative;
  overflow: hidden;
}

.blog-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.blog-header:hover::before {
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

/* Blog Cards */
.blog-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.blog-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.blog-card:hover::before {
  left: 100%;
}

.blog-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Blog Table */
.blog-table {
  transition: all 0.3s ease;
}

.blog-table:hover {
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

.blog-card {
  animation: fadeIn 0.6s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .blog-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .blog-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .blog-card {
    margin-bottom: 1rem;
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
</style>
