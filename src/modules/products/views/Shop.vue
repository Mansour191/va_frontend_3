<template>
  <v-sheet class="bg-deep min-h-screen">
    <!-- Hero Banner -->
    <v-sheet class="shop-hero relative h-80 d-flex align-center justify-center overflow-hidden">
      <div class="absolute inset-0 bg-black/60 z-10"></div>
      <v-img
        src="https://i.postimg.cc/0QKmBBJ9/kitchen2.png"
        class="absolute inset-0 w-full h-full"
        cover
        gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7)"
      ></v-img>
      <div class="relative z-20 text-center px-4">
        <h1 class="text-h2 text-md-h4 font-weight-bold text-warning mb-4">{{ $t('shopTitle') || 'الكتالوج الملكي' }}</h1>
        <p class="text-h6 text-white/80 max-w-2xl mx-auto">{{ $t('shopSubtitle') || 'تصاميم فينيل ورخام تجسد الفخامة في كل تفصيل' }}</p>
      </div>
    </v-sheet>

    <v-container class="mt-12">
      <v-row>
        <!-- Mobile Filter Toggle -->
        <v-col cols="12" class="lg:hidden">
          <div class="d-flex justify-space-between align-center mb-6">
            <v-btn
              @click="showMobileFilters = true"
              variant="outlined"
              color="warning"
              prepend-icon="mdi-filter-variant"
              class="text-none"
            >
              {{ $t('filter') }}
            </v-btn>
            <div class="text-white/60 text-body-2">
              {{ filteredProducts.length }} {{ $t('results') }}
            </div>
          </div>
        </v-col>

        <!-- Mobile Filter Drawer -->
        <v-navigation-drawer
          v-model="showMobileFilters"
          location="end"
          temporary
          class="lg:hidden"
        >
          <v-card-title class="d-flex justify-space-between align-center pa-4">
            <span class="text-warning font-weight-bold">{{ $t('filter') }}</span>
            <v-btn
              @click="showMobileFilters = false"
              icon="mdi-close"
              variant="text"
            ></v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <!-- Categories (Mobile) -->
            <div class="mb-8">
              <h4 class="text-white font-weight-bold mb-4">{{ $t('categories') }}</h4>
              <v-row dense>
                  <v-col
                  v-for="cat in categories"
                  :key="cat.id"
                  cols="6"
                >
                  <v-btn
                    @click="activeCategory = cat.id"
                    :variant="activeCategory === cat.id ? 'elevated' : 'outlined'"
                    :color="activeCategory === cat.id ? 'warning' : 'warning'"
                    class="text-none w-100"
                    :prepend-icon="getCategoryIcon(cat.id)"
                  >
                    {{ $t(cat.id) }}
                  </v-btn>
                </v-col>
              </v-row>
            </div>

            <!-- Price Range (Mobile) -->
            <div class="mb-8">
              <h4 class="text-white font-weight-bold mb-4">{{ $t('price') }}</h4>
              <v-slider
                v-model="priceRange"
                min="0"
                max="50000"
                step="500"
                color="warning"
                track-color="warning"
                thumb-color="warning"
                class="mb-4"
              ></v-slider>
              <div class="d-flex justify-space-between text-warning">
                <span>0 دج</span>
                <span>{{ priceRange.toLocaleString() }} دج</span>
              </div>
            </div>

            <v-btn
              @click="showMobileFilters = false"
              color="warning"
              variant="elevated"
              class="w-100 py-4 rounded-xl font-weight-bold"
            >
              {{ $t('apply') }}
            </v-btn>
          </v-card-text>
        </v-navigation-drawer>

        <!-- Sidebar Filters (Desktop) -->
        <v-col cols="12" lg="3" class="hidden lg:block">
          <v-card elevation="4" class="pa-8 sticky top-24">
            <h3 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center gap-3">
              <v-icon size="24" color="warning">mdi-filter-variant</v-icon>
              {{ $t('filter') }}
            </h3>

            <!-- Categories -->
            <div class="mb-8">
              <h4 class="text-white font-weight-bold mb-4 text-uppercase text-caption tracking-wider">{{ $t('categories') }}</h4>
              <v-list density="compact" class="mb-4">
                <v-list-item
                  v-for="cat in categories"
                  :key="cat.id"
                  @click="activeCategory = cat.id"
                  :active="activeCategory === cat.id"
                  :color="activeCategory === cat.id ? 'warning' : ''"
                  class="filter-item"
                >
                  <template #prepend>
                    <v-icon :icon="getCategoryIcon(cat.id)" :color="activeCategory === cat.id ? 'warning' : 'grey'"></v-icon>
                  </template>
                  <v-list-item-title class="text-white">
                    {{ $t(cat.id) }}
                  </v-list-item-title>
                  <template #append>
                    <v-chip size="x-small" color="warning" variant="elevated">
                      {{ cat.count }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </div>

            <!-- Price Range -->
            <div class="mb-8">
              <h4 class="text-white font-weight-bold mb-4 text-uppercase text-caption tracking-wider">{{ $t('price') }}</h4>
              <v-slider
                v-model="priceRange"
                min="0"
                max="50000"
                step="500"
                color="warning"
                track-color="warning"
                thumb-color="warning"
                class="mb-4"
              ></v-slider>
              <div class="d-flex justify-space-between text-sm font-mono text-warning">
                <span>0 دج</span>
                <span>{{ priceRange.toLocaleString() }} دج</span>
              </div>
            </div>

            <v-btn
              @click="resetFilters"
              color="warning"
              variant="outlined"
              class="w-100 py-4 rounded-xl font-weight-bold"
            >
              {{ $t('reset') }}
            </v-btn>
          </v-card>
        </v-col>

        <!-- Product Grid -->
        <v-col cols="12" lg="9">
          <!-- Toolbar -->
          <div class="d-flex flex-column flex-sm-row justify-space-between align-center mb-10 gap-6">
            <div class="text-white/60 font-medium">
              تم العثور على <span class="text-warning font-weight-bold text-h6 mx-1">{{ filteredProducts.length }}</span> تصميم
            </div>
            <div class="d-flex align-center gap-4">
              <v-text-field
                v-model="semanticQuery"
                variant="outlined"
                color="warning"
                bg-color="surface"
                placeholder="بحث دلالي: modern marble for office"
                prepend-inner-icon="mdi-magnify"
                hide-details
                class="max-width-300"
              ></v-text-field>
              <v-btn
                @click="runSemanticSearch"
                color="warning"
                variant="outlined"
                prepend-icon="mdi-brain"
                class="text-none"
              >
                بحث ذكي
              </v-btn>
              <span class="text-caption text-white/40 text-uppercase tracking-wider">ترتيب:</span>
              <v-select
                v-model="sortBy"
                variant="outlined"
                color="warning"
                bg-color="surface"
                hide-details
                class="max-width-200"
                :items="[
                  { title: $t('newest'), value: 'newest' },
                  { title: 'السعر: الأدنى أولاً', value: 'price-low' },
                  { title: 'السعر: الأعلى أولاً', value: 'price-high' }
                ]"
              ></v-select>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loading" class="d-flex flex-column align-center justify-center py-20">
            <v-progress-circular
              indeterminate
              color="warning"
              size="64"
              class="mb-6"
            ></v-progress-circular>
            <p class="text-warning animate-pulse">جاري تحميل التصاميم الملكية...</p>
          </div>

          <!-- No Results -->
          <v-card v-else-if="filteredProducts.length === 0" class="text-center py-20 px-8" elevation="2">
            <div class="mb-6 text-h1 text-white/10">
              <v-icon size="80" color="grey-lighten-2">mdi-magnify</v-icon>
            </div>
            <h3 class="text-h4 font-weight-bold text-warning mb-2">لا توجد نتائج تطابق بحثك</h3>
            <p class="text-white/40">جرب تغيير الفلاتر أو السعر للحصول على نتائج أفضل</p>
          </v-card>

          <!-- Grid -->
          <v-row v-else>
            <v-col
              v-for="product in paginatedProducts"
              :key="product.id"
              cols="12"
              md="6"
              xl="4"
            >
              <ProductCard :product="product" />
            </v-col>
          </v-row>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-16 d-flex justify-center gap-4">
            <v-btn
              :disabled="currentPage === 1"
              @click="currentPage--"
              icon="mdi-chevron-right"
              variant="outlined"
              color="warning"
            ></v-btn>
            <v-btn
              v-for="page in totalPages"
              :key="page"
              :variant="currentPage === page ? 'elevated' : 'outlined'"
              :color="currentPage === page ? 'warning' : 'warning'"
              @click="currentPage = page"
              class="text-none"
            >
              {{ page }}
            </v-btn>

            <v-btn
              :disabled="currentPage === totalPages"
              @click="currentPage++"
              icon="mdi-chevron-left"
              variant="outlined"
              color="warning"
            ></v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ProductCard from '@/shared/components/ProductCard.vue';
import ERPNextService from '@/integration/services/ERPNextService';
import SemanticSearchService from '@/integration/services/SemanticSearchService';

const products = ref([]);
const loading = ref(true);
const activeCategory = ref('all');
const priceRange = ref(50000);
const sortBy = ref('newest');
const currentPage = ref(1);
const itemsPerPage = ref(9);
const showMobileFilters = ref(false);
const semanticQuery = ref('');

// Categories - Dynamic loading from API
const categories = ref([]);

const fetchCategories = async () => {
  try {
    const response = await fetch('/api/products/categories');
    if (response.ok) {
      const data = await response.json();
      categories.value = [
        { id: 'all', key: 'allCategories', icon: 'mdi-view-grid', count: 0 },
        ...data.map(cat => ({
          id: cat.value,
          key: cat.name_key || cat.value,
          icon: cat.icon || 'mdi-view-grid',
          count: 0
        }))
      ];
    }
  } catch (error) {
    console.error('Failed to fetch product categories:', error);
    // Fallback to static data
    categories.value = [
      { id: 'all', key: 'allCategories', icon: 'mdi-view-grid', count: 0 },
      { id: 'furniture', key: 'furniture', icon: 'mdi-sofa', count: 0 },
      { id: 'doors', key: 'doors', icon: 'mdi-door-open', count: 0 },
      { id: 'walls', key: 'walls', icon: 'mdi-roller-shade', count: 0 },
      { id: 'ceilings', key: 'ceilings', icon: 'mdi-arrow-up-bold', count: 0 },
      { id: 'tiles', key: 'tiles', icon: 'mdi-grid', count: 0 },
      { id: 'kitchens', key: 'kitchens', icon: 'mdi-silverware-fork-knife', count: 0 },
      { id: 'cars', key: 'cars', icon: 'mdi-car', count: 0 },
    ];
  }
};

// Lifecycle
onMounted(() => {
  fetchCategories();
});

const getCategoryIcon = (id) => {
  const icons = {
    all: 'mdi-view-grid',
    walls: 'mdi-roller-shade',
    doors: 'mdi-door-open',
    furniture: 'mdi-sofa',
    kitchens: 'mdi-silverware-fork-knife',
    ceilings: 'mdi-arrow-up-bold',
    tiles: 'mdi-grid',
    cars: 'mdi-car'
  };
  return icons[id] || 'mdi-package-variant';
};

const mapERPNextCategory = (group) => {
  const mapping = {
    Walls: 'walls',
    Doors: 'doors',
    Furniture: 'furniture',
    Kitchens: 'kitchens',
    Ceilings: 'ceilings',
    Tiles: 'tiles',
    Cars: 'cars',
  };
  return mapping[group] || 'all';
};

const updateCategoryCounts = () => {
  categories.value.forEach((cat) => {
    if (cat.id === 'all') {
      cat.count = products.value.length;
    } else {
      cat.count = products.value.filter((p) => p.category === cat.id).length;
    }
  });
};

const filteredProducts = computed(() => {
  let result = [...products.value];
  if (activeCategory.value !== 'all') {
    result = result.filter((p) => p.category === activeCategory.value);
  }
  result = result.filter((p) => p.price <= priceRange.value);
  if (sortBy.value === 'price-low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy.value === 'price-high') {
    result.sort((a, b) => b.price - a.price);
  }
  return result;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredProducts.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

const resetFilters = () => {
  activeCategory.value = 'all';
  priceRange.value = 50000;
  sortBy.value = 'newest';
};

const runSemanticSearch = async () => {
  const query = semanticQuery.value.trim();
  if (!query) return;
  loading.value = true;
  try {
    const data = await SemanticSearchService.searchProducts(query, {
      category: activeCategory.value,
      topK: 40,
    });
    products.value = (data.results || []).map((p) => ({
      id: p.id,
      title: p.name,
      price: p.price,
      image: p.image || 'https://i.postimg.cc/wjXjw0mj/slider-decore2.png',
      category: p.category || 'all',
      categoryKey: p.category || 'all',
      categoryIcon: 'fa-solid fa-star',
      minSize: '50',
      maxSize: '200',
      excerpt: `Semantic score: ${p.score}`,
      onSale: false,
      discount: 0,
      isNew: false,
    }));
    updateCategoryCounts();
    currentPage.value = 1;
  } catch (error) {
    console.error('Semantic search failed:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const response = await ERPNextService.getProducts();
    if (response.success) {
      products.value = response.data.map((p) => ({
        id: p.name,
        title: p.item_name,
        price: p.standard_rate,
        image: p.image || 'https://i.postimg.cc/wjXjw0mj/slider-decore2.png',
        category: mapERPNextCategory(p.item_group),
        categoryKey: mapERPNextCategory(p.item_group),
        categoryIcon: 'fa-solid fa-star', // For compatibility with ProductCard
        minSize: '50',
        maxSize: '200',
        excerpt: p.description || 'تصميم ملكي فاخر بجودة عالية',
        onSale: Math.random() > 0.7,
        discount: 15,
        isNew: Math.random() > 0.8
      }));
      updateCategoryCounts();
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.shop-hero img {
  transform: scale(1.04);
  transition: transform 6s ease;
}

.shop-hero:hover img {
  transform: scale(1.09);
}

.max-width-300 {
  max-width: 300px;
}

.max-width-200 {
  max-width: 200px;
}
</style>
