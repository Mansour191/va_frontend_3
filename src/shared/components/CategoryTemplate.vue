<template>
  <v-main class="category-page">
    <!-- Hero Section -->
    <v-container class="py-8">
      <v-row class="text-center mb-8">
        <v-col cols="12">
          <div class="hero-content">
            <v-avatar
              :icon="icon"
              color="primary"
              size="80"
              class="mb-4 hero-icon"
            >
              <v-icon size="40" color="white">{{ icon }}</v-icon>
            </v-avatar>
            <h1 class="text-h3 font-weight-bold mb-4">
              {{ $t(titleKey) }}
              <v-chip
                v-if="products.length > 0"
                :text="products.length + ' ' + ($t('items') || 'عناصر')"
                color="primary"
                variant="elevated"
                class="ms-3"
                size="small"
              />
            </h1>
            <p class="text-h6 text-medium-emphasis mb-6">{{ $t(descriptionKey) }}</p>
            
            <!-- Quick Actions -->
            <div class="d-flex justify-center ga-3 flex-wrap">
              <v-btn
                :to="'/search?q=' + $t(labelKey)"
                color="primary"
                prepend-icon="mdi-magnify"
                variant="elevated"
              >
                {{ $t('browseAll') || 'تصفح الكل' }}
              </v-btn>
              <v-btn
                @click="showFilterDialog = true"
                prepend-icon="mdi-filter"
                variant="outlined"
              >
                {{ $t('filter') || 'فلترة' }}
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Sub Categories (Optional) -->
      <v-row v-if="subCategories && subCategories.length" class="mb-8">
        <v-col cols="12">
          <h2 class="text-h5 font-weight-bold mb-4">
            <v-icon color="primary" class="me-2">mdi-view-grid</v-icon>
            {{ $t('subCategories') || 'الفئات الفرعية' }}
          </h2>
        </v-col>
        <v-col
          v-for="sub in subCategories"
          :key="sub.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
          class="mb-4"
        >
          <v-card
            class="h-100 cursor-pointer sub-category-card"
            elevation="4"
            @click="navigateTo(sub.link)"
            hover
          >
            <v-card-text class="text-center pa-4">
              <div class="text-h3 mb-3">{{ sub.emoji }}</div>
              <h3 class="text-h6 mb-2 font-weight-bold">{{ $t(sub.titleKey) }}</h3>
              <p class="text-body-2 text-medium-emphasis">{{ $t(sub.descKey) }}</p>
              <v-chip
                :text="(sub.count || 0) + ' ' + ($t('items') || 'عناصر')"
                color="primary"
                variant="tonal"
                size="small"
                class="mt-2"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Latest Designs Section -->
      <v-row class="mb-6">
        <v-col cols="12">
          <div class="d-flex align-center justify-space-between mb-4">
            <h2 class="text-h5 font-weight-bold">
              <v-icon color="primary" class="me-2">mdi-clock</v-icon>
              {{ $t(latestLabelKey) || $t('latestDesigns') }}
              <v-chip
                v-if="products.length > 0"
                :text="products.length"
                color="primary"
                variant="tonal"
                size="small"
                class="ms-2"
              />
            </h2>
            <div class="d-flex ga-2">
              <!-- View Toggle -->
              <v-btn-toggle
                v-model="viewMode"
                variant="outlined"
                density="compact"
                mandatory
              >
                <v-btn
                  icon="mdi-view-grid"
                  value="grid"
                  :title="$t('gridView') || 'عرض شبكي'"
                />
                <v-btn
                  icon="mdi-view-list"
                  value="list"
                  :title="$t('listView') || 'عرض قائمة'"
                />
              </v-btn-toggle>
              
              <v-btn
                :to="'/search?q=' + $t(labelKey)"
                variant="outlined"
                color="primary"
                prepend-icon="mdi-arrow-left"
              >
                {{ $t('viewAll') || 'عرض الكل' }}
              </v-btn>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Products Grid/List -->
      <v-row class="mb-6">
        <!-- Loading State -->
        <v-col v-if="loading" cols="12" class="text-center py-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-body-1 text-medium-emphasis">
            {{ $t('loadingProducts') || 'جاري تحميل المنتجات...' }}
          </p>
        </v-col>

        <!-- Error State -->
        <v-col v-else-if="error" cols="12" class="text-center py-8">
          <v-alert
            type="error"
            variant="elevated"
            class="mb-4 max-width-600 mx-auto"
          >
            <v-alert-title class="text-h6">
              {{ errorMessage || ($t('loadError') || 'فشل في التحميل') }}
            </v-alert-title>
            <v-alert-text class="text-body-2">
              {{ $t('loadErrorMessage') || 'حدث خطأ أثناء تحميل المنتجات. يرجى المحاولة مرة أخرى.' }}
            </v-alert-text>
            <v-alert-actions>
              <v-btn @click="fetchData" prepend-icon="mdi-refresh" variant="elevated">
                {{ $t('retry') || 'إعادة المحاولة' }}
              </v-btn>
            </v-alert-actions>
          </v-alert>
        </v-col>

        <!-- Empty State -->
        <v-col v-else-if="products.length === 0" cols="12" class="text-center py-8">
          <v-icon size="64" color="info" class="mb-4 opacity-50">
            mdi-package-variant-closed
          </v-icon>
          <h3 class="text-h5 font-weight-medium mb-2">
            {{ $t('noProductsFound') || 'لا توجد منتجات' }}
          </h3>
          <p class="text-body-1 text-medium-emphasis mb-4">
            {{ $t('noProductsMessage') || 'لم يتم العثور على منتجات في هذه الفئة حالياً' }}
          </p>
          <v-btn
            @click="fetchData"
            prepend-icon="mdi-refresh"
            variant="outlined"
            color="primary"
          >
            {{ $t('refresh') || 'تحديث' }}
          </v-btn>
        </v-col>

        <!-- Products Display -->
        <template v-else>
          <!-- Grid View -->
          <template v-if="viewMode === 'grid'">
            <v-col
              v-for="product in paginatedProducts"
              :key="product.id"
              cols="12"
              sm="6"
              md="4"
              lg="3"
              class="mb-4"
            >
              <v-card class="h-100 product-card" elevation="4" hover>
                <!-- Product Image -->
                <div class="product-image-container position-relative">
                  <v-img
                    :src="product.image"
                    :alt="product.title"
                    height="240"
                    cover
                    class="product-image"
                    @click="viewProduct(product)"
                    style="cursor: pointer"
                  >
                    <template v-slot:placeholder>
                      <v-row class="fill-height" align="center" justify="center">
                        <v-progress-circular indeterminate color="primary" />
                      </v-row>
                    </template>
                  </v-img>
                  
                  <!-- Badges -->
                  <div class="product-badges position-absolute top-2 left-2">
                    <v-chip
                      v-if="badgeLabel"
                      :text="badgeLabel || $t('new')"
                      color="primary"
                      size="small"
                      variant="elevated"
                      class="mb-1"
                    />
                    <v-chip
                      v-if="product.isNew"
                      :text="$t('new') || 'جديد'"
                      color="success"
                      size="small"
                      variant="elevated"
                      class="mb-1"
                    />
                    <v-chip
                      v-if="product.onSale"
                      :text="Math.round((1 - product.salePrice / product.price) * 100) + '% OFF'"
                      color="error"
                      size="small"
                      variant="elevated"
                    />
                  </div>
                  
                  <!-- Quick Actions -->
                  <div class="quick-actions position-absolute top-2 right-2 d-flex flex-column ga-1">
                    <v-btn
                      icon="mdi-heart-outline"
                      variant="elevated"
                      color="white"
                      size="small"
                      @click.stop="toggleWishlist(product)"
                    />
                    <v-btn
                      icon="mdi-share"
                      variant="elevated"
                      color="white"
                      size="small"
                      @click.stop="shareProduct(product)"
                    />
                  </div>
                </div>
                
                <!-- Product Content -->
                <v-card-text class="pa-4">
                  <v-card-title class="text-h6 mb-2">
                    <router-link :to="product.link" class="text-decoration-none text-primary">
                      {{ product.title }}
                    </router-link>
                  </v-card-title>
                  
                  <v-card-subtitle class="text-body-2 text-medium-emphasis mb-3">
                    {{ product.summary }}
                  </v-card-subtitle>
                  
                  <!-- Price -->
                  <div class="mb-3">
                    <div v-if="product.onSale" class="d-flex align-center ga-2">
                      <span class="text-h5 font-weight-bold text-primary">{{ formatPrice(product.salePrice) }}</span>
                      <span class="text-body-2 text-medium-emphasis text-decoration-line-through">
                        {{ formatPrice(product.price) }}
                      </span>
                    </div>
                    <span v-else class="text-h5 font-weight-bold text-primary">
                      {{ formatPrice(product.price) }}
                    </span>
                  </div>
                  
                  <!-- Rating -->
                  <div class="d-flex align-center mb-3">
                    <v-icon
                      v-for="i in 5"
                      :key="i"
                      :icon="i <= (product.rating || 0) ? 'mdi-star' : 'mdi-star-outline'"
                      :color="i <= (product.rating || 0) ? 'warning' : 'grey-lighten-1'"
                      size="16"
                    />
                    <span class="text-body-2 text-medium-emphasis ms-1">
                      ({{ product.reviews || 0 }})
                    </span>
                  </div>
                  
                  <!-- Actions -->
                  <v-card-actions class="d-flex justify-space-between pa-0">
                    <v-btn
                      :to="product.link"
                      variant="outlined"
                      prepend-icon="mdi-eye"
                      size="small"
                    >
                      {{ $t('preview') || 'معاينة' }}
                    </v-btn>
                    
                    <v-btn
                      :href="'https://wa.me/213663140341?text=' + encodeURIComponent(($t('whatsappInquiry') || 'استفسار حول') + ': ' + product.title)"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="success"
                      prepend-icon="mdi-whatsapp"
                      size="small"
                    >
                      {{ $t('inquiry') || 'استفسار' }}
                    </v-btn>
                  </v-card-actions>
                </v-card-text>
              </v-card>
            </v-col>
          </template>
          
          <!-- List View -->
          <template v-else>
            <v-col cols="12">
              <v-list class="products-list">
                <v-list-item
                  v-for="product in paginatedProducts"
                  :key="product.id"
                  class="product-list-item mb-2"
                >
                  <template v-slot:prepend>
                    <v-avatar size="80" class="me-4">
                      <v-img :src="product.image" :alt="product.title" />
                    </v-avatar>
                  </template>
                  
                  <v-list-item-title class="text-h6 mb-1">{{ product.title }}</v-list-item-title>
                  <v-list-item-subtitle>
                    <p class="text-body-2 text-medium-emphasis mb-2">{{ product.summary }}</p>
                    
                    <div class="d-flex align-center ga-4 mb-2">
                      <span class="text-h5 font-weight-bold text-primary">
                        {{ formatPrice(product.onSale ? product.salePrice : product.price) }}
                      </span>
                      <span v-if="product.onSale" class="text-body-2 text-medium-emphasis text-decoration-line-through">
                        {{ formatPrice(product.price) }}
                      </span>
                    </div>
                    
                    <div class="d-flex align-center">
                      <v-icon
                        v-for="i in 5"
                        :key="i"
                        :icon="i <= (product.rating || 0) ? 'mdi-star' : 'mdi-star-outline'"
                        :color="i <= (product.rating || 0) ? 'warning' : 'grey-lighten-1'"
                        size="16"
                        class="me-1"
                      />
                      <span class="text-body-2 text-medium-emphasis">({{ product.reviews || 0 }})</span>
                    </div>
                  </v-list-item-subtitle>
                  
                  <template v-slot:append>
                    <div class="d-flex ga-2">
                      <v-btn
                        :to="product.link"
                        variant="outlined"
                        prepend-icon="mdi-eye"
                        size="small"
                      >
                        {{ $t('preview') || 'معاينة' }}
                      </v-btn>
                      
                      <v-btn
                        :href="'https://wa.me/213663140341?text=' + encodeURIComponent(($t('whatsappInquiry') || 'استفسار حول') + ': ' + product.title)"
                        target="_blank"
                        rel="noopener noreferrer"
                        color="success"
                        prepend-icon="mdi-whatsapp"
                        size="small"
                      >
                        {{ $t('inquiry') || 'استفسار' }}
                      </v-btn>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-col>
          </template>
        </template>
      </v-row>
      
      <!-- Pagination -->
      <v-row v-if="products.length > itemsPerPage && !loading && !error">
        <v-col cols="12" class="d-flex justify-center">
          <v-pagination
            v-model="currentPage"
            :length="Math.ceil(products.length / itemsPerPage)"
            :total-visible="5"
            @update:model-value="scrollToTop"
          />
        </v-col>
      </v-row>
    </v-container>
    
    <!-- Filter Dialog -->
    <v-dialog v-model="showFilterDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon color="primary" class="me-2">mdi-filter</v-icon>
          {{ $t('filterProducts') || 'فلترة المنتجات' }}
        </v-card-title>
        
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="searchQuery"
                :label="$t('search') || 'بحث'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                clearable
              />
            </v-col>
            
            <v-col cols="12">
              <v-select
                v-model="sortBy"
                :items="sortOptions"
                :label="$t('sortBy') || 'ترتيب حسب'"
                prepend-inner-icon="mdi-sort"
                variant="outlined"
              />
            </v-col>
            
            <v-col cols="12">
              <v-range-slider
                v-model="priceRange"
                :max="maxPrice"
                :min="0"
                :label="$t('priceRange') || 'نطاق السعر'"
                prepend-icon="mdi-currency"
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer />
          <v-btn @click="resetFilters" variant="text">
            {{ $t('reset') || 'إعادة تعيين' }}
          </v-btn>
          <v-btn @click="applyFilters" color="primary" variant="elevated">
            {{ $t('apply') || 'تطبيق' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-main>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import ProductService from '@/integration/services/ProductService';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

// Props
defineProps({
  icon: { type: String, required: true },
  titleKey: { type: String, required: true },
  descriptionKey: { type: String, required: true },
  labelKey: { type: String, required: true },
  latestLabelKey: { type: String, default: 'latestDesigns' },
  subCategories: { type: Array, default: () => [] },
  badgeLabel: { type: String, default: '' },
});

// State
const products = ref([]);
const loading = ref(true);
const error = ref(false);
const errorMessage = ref('');
const viewMode = ref('grid');
const currentPage = ref(1);
const itemsPerPage = 12;
const showFilterDialog = ref(false);
const searchQuery = ref('');
const sortBy = ref('newest');
const priceRange = ref([0, 10000]);

// Sort options
const sortOptions = computed(() => [
  { title: t('newest') || 'الأحدث', value: 'newest' },
  { title: t('oldest') || 'الأقدم', value: 'oldest' },
  { title: t('priceLow') || 'الأقل سعراً', value: 'price-low' },
  { title: t('priceHigh') || 'الأعلى سعراً', value: 'price-high' },
  { title: t('name') || 'الاسم', value: 'name' },
  { title: t('rating') || 'التقييم', value: 'rating' }
]);

// Computed
const filteredProducts = computed(() => {
  let filtered = [...products.value];
  
  // Apply search
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product => 
      product.title.toLowerCase().includes(query) || 
      product.summary.toLowerCase().includes(query)
    );
  }
  
  // Apply price filter
  filtered = filtered.filter(product => {
    const price = product.onSale ? product.salePrice : product.price;
    return price >= priceRange.value[0] && price <= priceRange.value[1];
  });
  
  // Apply sorting
  switch (sortBy.value) {
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      break;
    case 'oldest':
      filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
      break;
    case 'price-low':
      filtered.sort((a, b) => {
        const priceA = a.onSale ? a.salePrice : a.price;
        const priceB = b.onSale ? b.salePrice : b.price;
        return priceA - priceB;
      });
      break;
    case 'price-high':
      filtered.sort((a, b) => {
        const priceA = a.onSale ? a.salePrice : a.price;
        const priceB = b.onSale ? b.salePrice : b.price;
        return priceB - priceA;
      });
      break;
    case 'name':
      filtered.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'rating':
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
  }
  
  return filtered;
});

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

const maxPrice = computed(() => {
  if (products.value.length === 0) return 10000;
  return Math.max(...products.value.map(p => p.onSale ? p.salePrice : p.price));
});

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(price);
};

const fetchData = async () => {
  loading.value = true;
  error.value = false;
  try {
    const categorySlug = props.labelKey.toLowerCase().replace('label', '');
    const response = await ProductService.getProductsByCategory(categorySlug, 50);
    products.value = response.data || [];
    
    // Update price range based on actual products
    if (products.value.length > 0) {
      const prices = products.value.map(p => p.onSale ? p.salePrice : p.price);
      priceRange.value = [0, Math.max(...prices)];
    }
    
    console.log(`✅ Loaded ${products.value.length} products for category: ${categorySlug}`);
  } catch (err) {
    error.value = true;
    errorMessage.value = err.message || t('failedToLoadProducts') || 'فشل تحميل المنتجات. يرجى المحاولة مرة أخرى.';
    console.error('❌ Error fetching products:', err);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: errorMessage.value,
      icon: 'mdi-alert-circle',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const navigateTo = (link) => {
  if (link.startsWith('http')) {
    window.open(link, '_blank');
  } else {
    router.push(link);
  }
};

const viewProduct = (product) => {
  router.push(product.link);
};

const toggleWishlist = async (product) => {
  try {
    await store.dispatch('wishlist/toggleWishlist', product);
    
    const isInWishlist = store.getters['wishlist/isInWishlist'](product.id);
    
    store.dispatch('notifications/add', {
      type: isInWishlist ? 'success' : 'info',
      title: isInWishlist ? (t('addedToWishlist') || 'تمت الإضافة للمفضلة') : (t('removedFromWishlist') || 'تمت الإزالة من المفضلة'),
      message: `${product.title} ${isInWishlist ? (t('addedToWishlistMessage') || 'تمت إضافته إلى المفضلة') : (t('removedFromWishlistMessage') || 'تمت إزالته من المفضلة')}`,
      icon: isInWishlist ? 'mdi-heart' : 'mdi-heart-outline',
      timeout: 3000
    });
  } catch (error) {
    console.error('❌ Error toggling wishlist:', error);
  }
};

const shareProduct = (product) => {
  if (navigator.share) {
    navigator.share({
      title: product.title,
      text: product.summary,
      url: window.location.origin + product.link
    });
  } else {
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(window.location.origin + product.link);
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('linkCopied') || 'تم نسخ الرابط',
      message: t('linkCopiedMessage') || 'تم نسخ رابط المنتج إلى الحافظة',
      icon: 'mdi-clipboard',
      timeout: 3000
    });
  }
};

const resetFilters = () => {
  searchQuery.value = '';
  sortBy.value = 'newest';
  priceRange.value = [0, maxPrice.value];
  currentPage.value = 1;
};

const applyFilters = () => {
  currentPage.value = 1;
  showFilterDialog.value = false;
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Watchers
watch(() => searchQuery.value, () => {
  currentPage.value = 1;
});

watch(() => sortBy.value, () => {
  currentPage.value = 1;
});

watch(() => priceRange.value, () => {
  currentPage.value = 1;
});

// Lifecycle
onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.category-page {
  background: rgb(var(--v-theme-surface));
  min-height: 100vh;
}

.hero-content {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-secondary), 0.05) 100%);
  border-radius: 16px;
  padding: 48px 24px;
  margin-bottom: 32px;
}

.hero-icon {
  background: rgb(var(--v-theme-primary));
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.3);
  transition: all 0.3s ease;
}

.hero-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.4);
}

.sub-category-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.sub-category-card:hover {
  transform: translateY(-4px);
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.product-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.15);
}

.product-image-container {
  position: relative;
  overflow: hidden;
}

.product-image {
  transition: transform 0.3s ease;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-badges {
  z-index: 2;
}

.quick-actions {
  z-index: 2;
}

.quick-actions .v-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.quick-actions .v-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.products-list {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 8px;
}

.product-list-item {
  background: rgb(var(--v-theme-surface-variant));
  border-radius: 8px;
  transition: all 0.3s ease;
  margin-bottom: 8px;
}

.product-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .hero-content {
    padding: 32px 16px;
    margin-bottom: 24px;
  }
  
  .hero-content .text-h3 {
    font-size: 1.5rem !important;
  }
  
  .product-card {
    margin-bottom: 16px;
  }
  
  .quick-actions {
    top: 8px;
    right: 8px;
  }
  
  .product-badges {
    top: 8px;
    left: 8px;
  }
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
</style>

