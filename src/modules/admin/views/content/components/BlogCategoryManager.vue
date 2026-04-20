<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 category-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-folder-multiple</v-icon>
              {{ $t('blogCategoryManager') || 'Blog Category Manager' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('blogCategoryManagerSubtitle') || 'Manage blog categories and their properties' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="createCategory"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t('createCategory') || 'Create Category' }}
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

    <!-- Loading State -->
    <div v-if="loading && categories.length === 0" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingCategories') || 'Loading categories...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Category Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in categoryStats"
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

      <!-- Categories Table -->
      <v-card variant="elevated" class="category-card">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
              <v-icon color="primary" size="20">mdi-folder-multiple-outline</v-icon>
              {{ $t('categories') || 'Categories' }}
            </h3>
            <div class="d-flex ga-2">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchCategories') || 'Search categories'"
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
            :items="filteredCategories"
            :loading="loading"
            :search="searchQuery"
            items-per-page="10"
            class="category-table"
            sort-by="order_priority"
          >
            <template #[`item.name`]="{ item }">
              <div class="d-flex align-center ga-3">
                <v-avatar :color="item.is_featured ? 'warning' : 'primary'" variant="tonal" size="32">
                  <v-icon size="16">
                    {{ item.icon_class || 'mdi-folder' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium text-white">{{ item.name_ar }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.name_en }}</div>
                </div>
              </div>
            </template>

            <template #[`item.order_priority`]="{ item }">
              <v-chip
                :color="getPriorityColor(item.order_priority)"
                variant="tonal"
                size="small"
              >
                {{ item.order_priority }}
              </v-chip>
            </template>

            <template #[`item.is_featured`]="{ item }">
              <v-chip
                :color="item.is_featured ? 'warning' : 'grey'"
                variant="tonal"
                size="small"
              >
                <v-icon size="14" start>
                  {{ item.is_featured ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
                {{ item.is_featured ? ($t('featured') || 'Featured') : ($t('regular') || 'Regular') }}
              </v-chip>
            </template>

            <template #[`item.is_active`]="{ item }">
              <v-chip
                :color="item.is_active ? 'success' : 'error'"
                variant="tonal"
                size="small"
              >
                <v-icon size="14" start>
                  {{ item.is_active ? 'mdi-check-circle' : 'mdi-close-circle' }}
                </v-icon>
                {{ item.is_active ? ($t('active') || 'Active') : ($t('inactive') || 'Inactive') }}
              </v-chip>
            </template>

            <template #[`item.created_at`]="{ item }">
              <div class="text-body-2">
                {{ formatDate(item.created_at) }}
              </div>
            </template>

            <template #[`item.actions`]="{ item }">
              <div class="d-flex ga-1">
                <v-btn
                  @click="editCategory(item)"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-pencil"
                >
                  {{ $t('edit') || 'Edit' }}
                </v-btn>
                <v-btn
                  @click="deleteCategory(item)"
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

    <!-- Category Modal -->
    <BlogCategoryModal
      v-model="categoryDialog"
      :category="currentCategory"
      @saved="onCategorySaved"
    />
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import BlogCategoryService from '@/services/BlogCategoryService';
import BlogCategoryModal from './BlogCategoryModal.vue';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const categoryDialog = ref(false);
const searchQuery = ref('');
const statusFilter = ref('all');

// Data
const categories = ref([]);
const currentCategory = ref(null);

const statusOptions = ref([
  { title: t('all') || 'All', value: 'all' },
  { title: t('active') || 'Active', value: 'active' },
  { title: t('inactive') || 'Inactive', value: 'inactive' },
  { title: t('featured') || 'Featured', value: 'featured' }
]);

const tableHeaders = ref([
  { title: t('name') || 'Name', key: 'name', sortable: true },
  { title: t('slug') || 'Slug', key: 'slug', sortable: true },
  { title: t('priority') || 'Priority', key: 'order_priority', sortable: true },
  { title: t('featured') || 'Featured', key: 'is_featured', sortable: true },
  { title: t('status') || 'Status', key: 'is_active', sortable: true },
  { title: t('created') || 'Created', key: 'created_at', sortable: true },
  { title: t('actions') || 'Actions', key: 'actions', sortable: false, align: 'center' }
]);

// Computed
const categoryStats = computed(() => {
  const total = categories.value.length;
  const active = categories.value.filter(c => c.is_active).length;
  const featured = categories.value.filter(c => c.is_featured).length;
  const inactive = total - active;

  return [
    {
      title: t('totalCategories') || 'Total Categories',
      value: total.toString(),
      icon: 'mdi-folder-multiple',
      color: 'primary'
    },
    {
      title: t('activeCategories') || 'Active Categories',
      value: active.toString(),
      icon: 'mdi-check-circle',
      color: 'success'
    },
    {
      title: t('featuredCategories') || 'Featured Categories',
      value: featured.toString(),
      icon: 'mdi-star',
      color: 'warning'
    },
    {
      title: t('inactiveCategories') || 'Inactive Categories',
      value: inactive.toString(),
      icon: 'mdi-close-circle',
      color: 'error'
    }
  ];
});

const filteredCategories = computed(() => {
  let filtered = categories.value;
  
  if (statusFilter.value !== 'all') {
    switch (statusFilter.value) {
      case 'active':
        filtered = filtered.filter(cat => cat.is_active);
        break;
      case 'inactive':
        filtered = filtered.filter(cat => !cat.is_active);
        break;
      case 'featured':
        filtered = filtered.filter(cat => cat.is_featured);
        break;
    }
  }
  
  return filtered;
});

// Methods
const loadCategories = async () => {
  try {
    loading.value = true;
    const response = await BlogCategoryService.getCategories();
    if (response.success) {
      categories.value = response.data;
    } else {
      console.warn('Using mock data for categories');
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('loadError') || 'Load Error',
      message: error.message || t('unexpectedError') || 'An unexpected error occurred',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const createCategory = () => {
  currentCategory.value = null;
  categoryDialog.value = true;
};

const editCategory = (category) => {
  currentCategory.value = category;
  categoryDialog.value = true;
};

const deleteCategory = async (category) => {
  if (!confirm(t('confirmDeleteCategory') || 'Are you sure you want to delete this category?')) {
    return;
  }

  try {
    loading.value = true;
    const response = await BlogCategoryService.deleteCategory(category.id);
    
    if (response.success) {
      // Remove from local list
      const index = categories.value.findIndex(c => c.id === category.id);
      if (index > -1) {
        categories.value.splice(index, 1);
      }

      store.dispatch('notifications/add', {
        type: 'success',
        title: t('categoryDeleted') || 'Category Deleted',
        message: t('categoryDeletedSuccessfully') || 'Category deleted successfully',
        timeout: 3000
      });
    } else {
      throw new Error(response.message || 'Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'Delete Error',
      message: error.message || t('unexpectedError') || 'An unexpected error occurred',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const refreshData = async () => {
  await loadCategories();
  
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('dataRefreshed') || 'Data Refreshed',
    message: t('categoriesRefreshed') || 'Categories refreshed successfully',
    timeout: 2000
  });
};

const onCategorySaved = (savedCategory) => {
  if (currentCategory.value) {
    // Update existing category
    const index = categories.value.findIndex(c => c.id === savedCategory.id);
    if (index > -1) {
      categories.value[index] = savedCategory;
    }
  } else {
    // Add new category
    categories.value.unshift(savedCategory);
  }
};

const getPriorityColor = (priority) => {
  if (priority === 0) return 'grey';
  if (priority <= 3) return 'success';
  if (priority <= 6) return 'warning';
  return 'error';
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// Lifecycle
onMounted(() => {
  loadCategories();
});
</script>

<style scoped>
/* Category Header */
.category-header {
  position: relative;
  overflow: hidden;
}

.category-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.category-header:hover::before {
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

/* Category Cards */
.category-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.category-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.category-card:hover::before {
  left: 100%;
}

.category-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Category Table */
.category-table {
  transition: all 0.3s ease;
}

.category-table:hover {
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

.category-card {
  animation: fadeIn 0.6s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .category-header .d-flex {
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
  .category-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .category-card {
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
</style>
