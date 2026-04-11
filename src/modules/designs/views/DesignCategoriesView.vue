<template>
  <div class="design-categories-view">
    <!-- Header Section -->
    <v-container fluid class="header-section py-8">
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8" class="text-center">
          <h1 class="text-h3 text-h2-md font-weight-bold mb-4 text-primary">
            {{ $t('designCategories') || 'فئات التصاميم' }}
          </h1>
          <p class="text-h6 text-medium-emphasis mb-6">
            {{ $t('designCategoriesDescription') || 'استكشف مجموعتنا الواسعة من التصاميم المبتكرة لكل الأذواق والاحتياجات' }}
          </p>
          
          <!-- Search and Filter Section -->
          <v-row justify="center" class="mb-6">
            <v-col cols="12" md="8">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchCategories') || 'ابحث عن فئة'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
                hide-details
                class="search-field"
              />
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p class="text-h6 text-medium-emphasis">
        {{ $t('loadingCategories') || 'جاري تحميل الفئات...' }}
      </p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <v-alert
        type="error"
        variant="elevated"
        class="mb-4 max-width-600 mx-auto"
      >
        <v-alert-title class="text-h6">
          {{ $t('errorLoadingCategories') || 'خطأ في تحميل الفئات' }}
        </v-alert-title>
        <v-alert-text class="text-body-2">
          {{ error }}
        </v-alert-text>
        <v-alert-actions>
          <v-btn @click="refreshCategories" prepend-icon="mdi-refresh" variant="elevated">
            {{ $t('retry') || 'إعادة المحاولة' }}
          </v-btn>
        </v-alert-actions>
      </v-alert>
    </div>

    <!-- Categories Grid -->
    <v-container v-else fluid class="categories-section py-4">
      <!-- Featured Categories Section -->
      <v-section v-if="featuredCategories.length > 0" class="mb-8">
        <v-row>
          <v-col cols="12">
            <h2 class="text-h4 font-weight-bold mb-4 text-primary">
              {{ $t('featuredCategories') || 'الفئات المميزة' }}
            </h2>
          </v-col>
        </v-row>
        
        <v-row>
          <v-col
            v-for="category in featuredCategories"
            :key="`featured-${category.id}`"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="mb-4"
          >
            <CategoryCard :category="category" />
          </v-col>
        </v-row>
      </v-section>

      <!-- All Categories Section -->
      <v-section>
        <v-row>
          <v-col cols="12">
            <h2 class="text-h4 font-weight-bold mb-4 text-primary">
              {{ $t('allCategories') || 'جميع الفئات' }}
            </h2>
          </v-col>
        </v-row>
        
        <v-row v-if="filteredCategories.length > 0">
          <v-col
            v-for="category in filteredCategories"
            :key="category.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="mb-4"
          >
            <CategoryCard :category="category" />
          </v-col>
        </v-row>
        
        <!-- No Results -->
        <v-row v-else justify="center">
          <v-col cols="12" md="8" class="text-center py-8">
            <v-icon size="64" color="grey-lighten-1" class="mb-4">
              mdi-folder-open-outline
            </v-icon>
            <h3 class="text-h5 font-weight-medium mb-2">
              {{ $t('noCategoriesFound') || 'لم يتم العثور على فئات' }}
            </h3>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ $t('tryDifferentSearch') || 'جرب تغيير مصطلح البحث أو تصفية جميع الفئات' }}
            </p>
            <v-btn @click="clearSearch" variant="outlined" color="primary">
              {{ $t('clearSearch') || 'مسح البحث' }}
            </v-btn>
          </v-col>
        </v-row>
      </v-section>
    </v-container>

    <!-- Statistics Section -->
    <v-container v-if="categories.length > 0" fluid class="stats-section py-8 bg-surface">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-row>
            <v-col cols="6" md="3" class="text-center">
              <div class="stat-item">
                <v-icon size="32" color="primary" class="mb-2">mdi-folder</v-icon>
                <div class="text-h4 font-weight-bold text-primary">
                  {{ categories.length }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ $t('totalCategories') || 'إجمالي الفئات' }}
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="3" class="text-center">
              <div class="stat-item">
                <v-icon size="32" color="success" class="mb-2">mdi-check-circle</v-icon>
                <div class="text-h4 font-weight-bold text-success">
                  {{ activeCategories.length }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ $t('activeCategories') || 'الفئات النشطة' }}
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="3" class="text-center">
              <div class="stat-item">
                <v-icon size="32" color="info" class="mb-2">mdi-palette</v-icon>
                <div class="text-h4 font-weight-bold text-info">
                  {{ totalDesigns }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ $t('totalDesigns') || 'إجمالي التصاميم' }}
                </div>
              </div>
            </v-col>
            <v-col cols="6" md="3" class="text-center">
              <div class="stat-item">
                <v-icon size="32" color="warning" class="mb-2">mdi-star</v-icon>
                <div class="text-h4 font-weight-bold text-warning">
                  {{ categoriesWithDesigns.length }}
                </div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ $t('categoriesWithDesigns') || 'فئات تحتوي على تصاميم' }}
                </div>
              </div>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import CategoryCard from '@/shared/components/CategoryCard.vue';
import { useDesignCategories } from '@/composables/useDesignCategories';

const { t } = useI18n();
const {
  categories,
  loading,
  error,
  activeCategories,
  categoriesWithDesigns,
  featuredCategories,
  fetchCategories,
  refreshCategories,
} = useDesignCategories();

// Local state
const searchQuery = ref('');

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) {
    return categoriesSortedByDesignCount.value;
  }
  
  const query = searchQuery.value.toLowerCase();
  return categoriesSortedByDesignCount.value.filter(category => 
    category.name.toLowerCase().includes(query) ||
    category.nameAr?.toLowerCase().includes(query) ||
    category.nameEn?.toLowerCase().includes(query) ||
    category.slug.toLowerCase().includes(query) ||
    category.description?.toLowerCase().includes(query)
  );
});

const categoriesSortedByDesignCount = computed(() => {
  return [...categories.value].sort((a, b) => b.designCount - a.designCount);
});

const totalDesigns = computed(() => {
  return categories.value.reduce((total, category) => total + (category.designCount || 0), 0);
});

// Methods
const clearSearch = () => {
  searchQuery.value = '';
};

// Lifecycle
onMounted(async () => {
  await fetchCategories();
});
</script>

<style scoped>
.design-categories-view {
  min-height: 100vh;
}

.header-section {
  background: linear-gradient(135deg, var(--v-theme-surface) 0%, var(--v-theme-surface-variant) 100%);
}

.search-field {
  max-width: 600px;
  margin: 0 auto;
}

.categories-section {
  background: var(--v-theme-background);
}

.stats-section {
  border-top: 1px solid var(--v-theme-surface-variant);
}

.stat-item {
  padding: 16px;
  border-radius: 12px;
  background: var(--v-theme-surface);
  border: 1px solid var(--v-theme-surface-variant);
  transition: all 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-section {
    padding: 32px 16px;
  }
  
  .categories-section {
    padding: 16px;
  }
  
  .stats-section {
    padding: 32px 16px;
  }
}

/* RTL Support */
@media (dir: rtl) {
  .search-field .v-field__prepend-inner {
    margin-right: 0;
    margin-left: 8px;
  }
}
</style>
