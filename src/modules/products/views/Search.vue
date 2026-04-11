<template>
  <v-sheet class="search-page bg-surface min-h-screen">
    <v-container class="py-8">
      <!-- Search Header -->
      <div class="text-center mb-8">
        <h1 class="text-h3 font-weight-bold text-warning mb-4">{{ $t('advancedSearch') || 'البحث المتقدم' }}</h1>
        <v-row justify="center">
          <v-col cols="12" md="8">
            <v-form @submit.prevent="handleSearch">
              <v-text-field
                v-model="filters.query"
                :placeholder="$t('searchPlaceholder') || 'ابحث عن منتج، مقال، أو تصميم...'"
                variant="outlined"
                color="warning"
                bg-color="surface"
                prepend-inner-icon="mdi-magnify"
                append-inner-icon="mdi-magnify"
                autofocus
                hide-details
                class="search-field"
              >
                <template #append>
                  <v-btn
                    type="submit"
                    color="warning"
                    variant="elevated"
                    class="text-none rounded-pill"
                    prepend-icon="mdi-magnify"
                  >
                    {{ $t('search') }}
                  </v-btn>
                </template>
              </v-text-field>
            </v-form>
          </v-col>
        </v-row>
      </div>

      <v-row>
        <!-- Sidebar Filters -->
        <v-col cols="12" lg="3">
          <v-card elevation="4" class="filters-sidebar pa-4 sticky-top" style="top: 100px">
            <v-card-title class="text-h5 font-weight-bold text-warning mb-4 d-flex align-center gap-2">
              <v-icon size="20" color="warning">mdi-filter-variant</v-icon>
              {{ $t('filters') || 'تصفية النتائج' }}
            </v-card-title>

            <!-- Type Filter -->
            <div class="filter-group mb-6">
                <v-label class="text-subtitle-1 font-weight-bold mb-3">{{ $t('resultType') || 'نوع النتيجة' }}</v-label>
              <v-btn-toggle
                v-model="filters.type"
                variant="outlined"
                color="warning"
                class="w-100 mb-4"
                direction="vertical"
              >
                <v-btn value="all" prepend-icon="mdi-view-grid" class="text-none">
                  {{ $t('all') || 'الكل' }}
                </v-btn>
                <v-btn value="product" prepend-icon="mdi-shopping" class="text-none">
                  {{ $t('products') || 'المنتجات' }}
                </v-btn>
                <v-btn value="article" prepend-icon="mdi-newspaper" class="text-none">
                  {{ $t('articles') || 'المقالات' }}
                </v-btn>
                <v-btn value="design" prepend-icon="mdi-image-multiple" class="text-none">
                  {{ $t('designs') || 'التصاميم' }}
                </v-btn>
              </v-btn-toggle>
            </div>

            <!-- Category Filter -->
            <div class="filter-group mb-6">
              <v-label class="text-subtitle-1 font-weight-bold mb-3">{{ $t('category') }}</v-label>
              <v-select
                v-model="filters.category"
                variant="outlined"
                color="warning"
                bg-color="surface"
                :items="categoryItems"
                hide-details
              ></v-select>
            </div>

            <!-- Price Filter (Only for products) -->
            <div v-if="filters.type === 'product' || filters.type === 'all'" class="filter-group mb-6">
              <v-label class="text-subtitle-1 font-weight-bold mb-3">{{ $t('priceRange') || 'نطاق السعر' }}</v-label>
              <v-row dense>
                <v-col cols="5">
                  <v-text-field
                    v-model="filters.minPrice"
                    type="number"
                    label="0"
                    variant="outlined"
                    color="warning"
                    bg-color="surface"
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col cols="2" class="d-flex align-center justify-center">
                  <span class="text-h6">-</span>
                </v-col>
                <v-col cols="5">
                  <v-text-field
                    v-model="filters.maxPrice"
                    type="number"
                    label="50000"
                    variant="outlined"
                    color="warning"
                    bg-color="surface"
                    hide-details
                  ></v-text-field>
                </v-col>
              </v-row>
            </div>

            <v-btn
              @click="resetFilters"
              color="warning"
              variant="outlined"
              prepend-icon="mdi-undo"
              class="w-100 text-none"
            >
              {{ $t('resetFilters') || 'إعادة تعيين' }}
            </v-btn>
            </div>
          </div>
        </div>

        <!-- Search Results Area -->
        <v-col cols="12" lg="9">
          <div class="search-content">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-16">
              <v-progress-circular
                indeterminate
                color="warning"
                size="64"
                class="mb-4"
              ></v-progress-circular>
              <p class="text-body-1 text-medium-emphasis">{{ $t('searchingAcrossSources') || 'جاري البحث في جميع المصادر...' }}</p>
            </div>

            <!-- Empty State -->
            <v-card v-else-if="results.length === 0" class="text-center py-16" elevation="2">
              <v-card-text>
                <v-icon size="80" color="grey-lighten-2" class="mb-4">mdi-magnify-remove</v-icon>
                <h3 class="text-h4 font-weight-bold mb-2">{{ $t('noResultsFound') || 'لم يتم العثور على نتائج' }}</h3>
                <p class="text-body-2 text-medium-emphasis mb-4">{{ $t('tryAdjustingFilters') || 'جرب تغيير الكلمات المفتاحية أو تعديل الفلاتر' }}</p>
                <v-btn @click="resetFilters" color="warning" variant="elevated" class="text-none">
                  {{ $t('resetSearch') || 'بحث جديد' }}
                </v-btn>
              </v-card-text>
            </v-card>

            <!-- Results List -->
            <div v-else>
              <div class="d-flex justify-space-between align-center mb-6">
                <h5 class="text-h5 font-weight-bold mb-0">
                  {{ $t('foundResultsCount') || 'نتائج البحث:' }} 
                  <span class="text-warning">{{ totalResults }}</span>
                </h5>
                <div class="d-flex gap-2">
                  <v-chip size="small" color="grey-lighten-2" variant="elevated">ERPNext</v-chip>
                  <v-chip size="small" color="grey-lighten-2" variant="elevated">Blogger</v-chip>
                  <v-chip size="small" color="grey-lighten-2" variant="elevated">Gallery</v-chip>
                </div>
              </div>

              <v-row>
                <v-col
                  v-for="item in results"
                  :key="item.type + '-' + item.id"
                  cols="12"
                  md="6"
                  xl="4"
                >
                  <!-- Result Card -->
                  <v-card elevation="2" class="h-100 result-card">
                    <div class="position-relative">
                      <v-img
                        :src="item.image"
                        :alt="item.title"
                        height="200"
                        cover
                      ></v-img>
                      <v-chip
                        :color="item.type === 'product' ? 'success' : item.type === 'article' ? 'info' : 'warning'"
                        variant="elevated"
                        size="small"
                        class="type-badge"
                      >
                        {{ item.type === 'product' ? 'منتج' : item.type === 'article' ? 'مقال' : 'تصميم' }}
                      </v-chip>
                    </div>
                    <v-card-text class="d-flex flex-column">
                      <div class="mb-2">
                        <v-chip size="x-small" color="warning" variant="elevated">
                          {{ item.category }}
                        </v-chip>
                      </div>
                      <h6 class="text-h6 font-weight-bold mb-3 line-clamp-2">{{ item.title }}</h6>
                      
                      <div v-if="item.type === 'product'" class="mt-auto">
                        <div class="text-h5 font-weight-bold mb-3">{{ item.price }} د.ج</div>
                        <v-btn
                          :to="item.link"
                          color="warning"
                          variant="elevated"
                          class="w-100 text-none"
                        >
                          {{ $t('viewDetails') }}
                        </v-btn>
                      </div>
                      <div v-else class="mt-auto">
                        <p v-if="item.summary" class="text-body-2 text-medium-emphasis line-clamp-2 mb-3">{{ item.summary }}</p>
                        <v-btn
                          v-if="item.type === 'article'"
                          :href="item.link"
                          target="_blank"
                          color="warning"
                          variant="outlined"
                          class="w-100 text-none"
                        >
                          {{ $t('readMore') || 'اقرأ المزيد' }}
                        </v-btn>
                        <v-btn
                          v-else
                          :to="item.link"
                          color="warning"
                          variant="outlined"
                          class="w-100 text-none"
                        >
                          {{ $t('viewInGallery') || 'عرض في المعرض' }}
                        </v-btn>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-col>
              </v-row>

              <!-- Pagination -->
              <div v-if="totalPages > 1" class="d-flex justify-center mt-8">
                <v-pagination
                  v-model="filters.page"
                  :length="totalPages"
                  :total-visible="7"
                  color="warning"
                  variant="elevated"
                  rounded="circle"
                  @update:model-value="changePage"
                ></v-pagination>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import SearchService from '@/integration/services/SearchService';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// State
const results = ref([]);
const totalResults = ref(0);
const totalPages = ref(1);
const loading = ref(false);

const filters = reactive({
  query: route.query.q || '',
  type: route.query.type || 'all',
  category: route.query.category || 'all',
  minPrice: route.query.minPrice || null,
  maxPrice: route.query.maxPrice || null,
  page: parseInt(route.query.page) || 1,
  limit: 12
});

// Categories - Dynamic loading from API
const categories = ref([]);

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/products/categories');
    if (response.ok) {
      const data = await response.json();
      categories.value = [
        { value: 'all', title: 'allCategories' },
        ...data.map(cat => ({
          value: cat.value,
          title: cat.title_key || cat.value
        }))
      ];
    }
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    // Fallback to static data
    categories.value = [
      { value: 'all', title: 'allCategories' },
      { value: 'furniture', title: 'furniture' },
      { value: 'doors', title: 'doors' },
      { value: 'walls', title: 'walls' },
      { value: 'ceilings', title: 'ceilings' },
      { value: 'tiles', title: 'tiles' },
      { value: 'kitchens', title: 'kitchens' },
      { value: 'cars', title: 'cars' },
    ];
  }
};

// Lifecycle
onMounted(() => {
  fetchCategories();
});

const categoryItems = computed(() => 
  categories.map(cat => ({ 
    title: t(cat.title) || cat.value, 
    value: cat.value 
  }))
);

// Methods
const handleSearch = async () => {
  loading.value = true;
  try {
    const response = await SearchService.globalSearch({ ...filters });
    results.value = response.results;
    totalResults.value = response.total;
    totalPages.value = response.totalPages;
  } catch (error) {
    console.error('Error during global search:', error);
  } finally {
    loading.value = false;
    updateURL();
  }
};

const updateURL = () => {
  const query = { ...filters };
  // Remove empty or default values
  Object.keys(query).forEach(key => {
    if (!query[key] || query[key] === 'all') delete query[key];
  });
  
  router.push({ query });
};

const changePage = (p) => {
  if (p < 1 || p > totalPages.value) return;
  filters.page = p;
  handleSearch();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const resetFilters = () => {
  filters.query = '';
  filters.type = 'all';
  filters.category = 'all';
  filters.minPrice = null;
  filters.maxPrice = null;
  filters.page = 1;
  handleSearch();
};

// Watchers
watch(() => filters.type, () => { filters.page = 1; handleSearch(); });
watch(() => filters.category, () => { filters.page = 1; handleSearch(); });

// Lifecycle
onMounted(() => {
  if (filters.query || filters.type !== 'all' || filters.category !== 'all') {
    handleSearch();
  }
});
</script>

<style scoped>
/* Vuetify handles most styling */
.search-field .v-field__append-inner {
  margin-inline-start: 0;
}

.result-card .type-badge {
  position: absolute;
  top: 8px;
  right: 8px;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
