<template>
  <div class="product-grid-wrapper">
    <!-- Grid Header -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" md="6">
        <h2 class="text-h4 font-weight-bold mb-0">
          <v-icon color="primary" class="me-2">mdi-store</v-icon>
          {{ $t('products') || 'المنتجات' }}
          <v-chip v-if="products.length > 0" class="ms-2" color="primary" variant="elevated" size="small">
            {{ products.length }} {{ $t('items') || 'عناصر' }}
          </v-chip>
        </h2>
      </v-col>
      
      <v-col cols="12" md="6" class="text-md-end">
        <div class="d-flex ga-2 justify-md-end justify-center">
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
          
          <!-- Sort Dropdown -->
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="mdi-sort"
                variant="outlined"
                size="small"
              >
                {{ $t('sort') || 'ترتيب' }}
              </v-btn>
            </template>
            <v-list density="compact">
              <v-list-item
                v-for="option in sortOptions"
                :key="option.value"
                @click="sortBy(option.value)"
                :active="currentSort === option.value"
              >
                <v-list-item-title>
                  <v-icon :icon="option.icon" class="me-2" size="16" />
                  {{ $t(option.label) || option.label }}
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
          
          <!-- Filter Button -->
          <v-btn
            prepend-icon="mdi-filter"
            variant="outlined"
            size="small"
            @click="showFilterDialog = true"
          >
            {{ $t('filter') || 'فلترة' }}
          </v-btn>
        </div>
      </v-col>
    </v-row>
    
    <!-- Loading State -->
    <v-row v-if="loading" justify="center" class="py-8">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="48" class="mb-4" />
        <p class="text-body-1 text-medium-emphasis">
          {{ $t('loadingProducts') || 'جاري تحميل المنتجات...' }}
        </p>
      </v-col>
    </v-row>
    
    <!-- Products Grid -->
    <v-row v-else-if="viewMode === 'grid'">
      <v-col
        v-for="product in sortedProducts"
        :key="product.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
        xl="2"
        class="mb-4"
      >
        <v-card
          class="product-card h-100"
          elevation="4"
          hover
          :class="{ 'on-sale': product.onSale }"
        >
          <!-- Product Image with Badges -->
          <div class="product-image-container position-relative">
            <v-img
              :src="product.image"
              :alt="product.name"
              height="200"
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
            
            <!-- Sale Badge -->
            <v-chip
              v-if="product.onSale"
              color="error"
              size="small"
              class="sale-badge position-absolute top-2 right-2"
            >
              <v-icon size="small" class="me-1">mdi-sale</v-icon>
              {{ Math.round((1 - product.salePrice / product.price) * 100) }}% OFF
            </v-chip>
            
            <!-- New Badge -->
            <v-chip
              v-if="product.isNew"
              color="success"
              size="small"
              class="new-badge position-absolute top-2 left-2"
            >
              {{ $t('new') || 'جديد' }}
            </v-chip>
            
            <!-- Wishlist Button -->
            <v-btn
              icon="mdi-heart-outline"
              variant="elevated"
              color="white"
              size="small"
              class="wishlist-btn position-absolute bottom-2 right-2"
              @click.stop="toggleWishlist(product)"
            />
          </div>
          
          <v-card-text class="pa-4">
            <!-- Product Name -->
            <v-card-title class="text-h6 mb-2 text-truncate">
              {{ product.name }}
            </v-card-title>
            
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
                variant="outlined"
                color="primary"
                prepend-icon="mdi-eye"
                size="small"
                @click="viewProduct(product)"
              >
                {{ $t('preview') || 'معاينة' }}
              </v-btn>
              
              <v-btn
                color="primary"
                prepend-icon="mdi-cart-plus"
                size="small"
                :loading="addingToCart === product.id"
                @click="addToCart(product)"
              >
                {{ $t('addToCart') || 'إضافة للسلة' }}
              </v-btn>
            </v-card-actions>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Products List View -->
    <v-list v-else class="products-list">
      <v-list-item
        v-for="product in sortedProducts"
        :key="product.id"
        class="product-list-item mb-2"
      >
        <template v-slot:prepend>
          <v-avatar size="80" class="me-4">
            <v-img :src="product.image" :alt="product.name" />
          </v-avatar>
        </template>
        
        <v-list-item-title class="text-h6 mb-1">{{ product.name }}</v-list-item-title>
        <v-list-item-subtitle>
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
              variant="outlined"
              color="primary"
              prepend-icon="mdi-eye"
              size="small"
              @click="viewProduct(product)"
            >
              {{ $t('preview') || 'معاينة' }}
            </v-btn>
            
            <v-btn
              color="primary"
              prepend-icon="mdi-cart-plus"
              size="small"
              :loading="addingToCart === product.id"
              @click="addToCart(product)"
            >
              {{ $t('addToCart') || 'إضافة للسلة' }}
            </v-btn>
          </div>
        </template>
      </v-list-item>
    </v-list>
    
    <!-- Empty State -->
    <v-row v-if="!loading && (!products || products.length === 0)" justify="center" class="py-8">
      <v-col cols="12" class="text-center">
        <v-icon size="64" color="primary" class="mb-4 opacity-50">
          mdi-package-variant-closed
        </v-icon>
        <h3 class="text-h5 font-weight-medium mb-2">
          {{ $t('noProducts') || 'لا توجد منتجات' }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('noProductsMessage') || 'لم يتم العثور على منتجات متاحة حالياً' }}
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-refresh"
          variant="outlined"
          @click="refreshProducts"
        >
          {{ $t('refresh') || 'تحديث' }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

// Props
defineProps({
  products: {
    type: Array,
    default: () => []
  }
});

// State
const viewMode = ref('grid');
const currentSort = ref('name');
const loading = ref(false);
const addingToCart = ref(null);
const showFilterDialog = ref(false);

// Sort options
const sortOptions = [
  { value: 'name', label: 'name', icon: 'mdi-sort-alphabetical-ascending' },
  { value: 'price-low', label: 'priceLowToHigh', icon: 'mdi-sort-numeric-ascending' },
  { value: 'price-high', label: 'priceHighToLow', icon: 'mdi-sort-numeric-descending' },
  { value: 'rating', label: 'rating', icon: 'mdi-star' },
  { value: 'newest', label: 'newest', icon: 'mdi-clock' }
];

// Computed
const sortedProducts = computed(() => {
  if (!props.products || props.products.length === 0) return [];
  
  const products = [...props.products];
  
  switch (currentSort.value) {
    case 'name':
      return products.sort((a, b) => a.name.localeCompare(b.name));
    case 'price-low':
      return products.sort((a, b) => {
        const priceA = a.onSale ? a.salePrice : a.price;
        const priceB = b.onSale ? b.salePrice : b.price;
        return priceA - priceB;
      });
    case 'price-high':
      return products.sort((a, b) => {
        const priceA = a.onSale ? a.salePrice : a.price;
        const priceB = b.onSale ? b.salePrice : b.price;
        return priceB - priceA;
      });
    case 'rating':
      return products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return products.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    default:
      return products;
  }
});

// Methods
const sortBy = (value) => {
  currentSort.value = value;
};

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0
  }).format(price);
};

const viewProduct = (product) => {
  router.push({
    name: 'product-detail',
    params: { id: product.id }
  });
};

const addToCart = async (product) => {
  addingToCart.value = product.id;
  
  try {
    await store.dispatch('cart/addToCart', {
      productId: product.id,
      quantity: 1
    });
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('addedToCart') || 'تمت الإضافة للسلة',
      message: `${product.name} ${t('addedToCartMessage') || 'تمت إضافته إلى سلة التسوق'}`,
      icon: 'mdi-check-circle',
      timeout: 3000
    });
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: error.message || t('addToCartError') || 'فشل في إضافة المنتج للسلة',
      icon: 'mdi-alert-circle',
      timeout: 3000
    });
  } finally {
    addingToCart.value = null;
  }
};

const toggleWishlist = async (product) => {
  try {
    await store.dispatch('wishlist/toggleWishlist', product);
    
    const isInWishlist = store.getters['wishlist/isInWishlist'](product.id);
    
    store.dispatch('notifications/add', {
      type: isInWishlist ? 'success' : 'info',
      title: isInWishlist ? t('addedToWishlist') || 'تمت الإضافة للمفضلة' : t('removedFromWishlist') || 'تمت الإزالة من المفضلة',
      message: `${product.name} ${isInWishlist ? t('addedToWishlistMessage') || 'تمت إضافته إلى المفضلة' : t('removedFromWishlistMessage') || 'تمت إزالته من المفضلة'}`,
      icon: isInWishlist ? 'mdi-heart' : 'mdi-heart-outline',
      timeout: 3000
    });
  } catch (error) {
    console.error('❌ Error toggling wishlist:', error);
  }
};

const refreshProducts = () => {
  loading.value = true;
  // Simulate refresh
  setTimeout(() => {
    loading.value = false;
  }, 1000);
};

// Lifecycle
onMounted(() => {
  // Initialize any required data
});
</script>
<style scoped>
.product-grid-wrapper {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 16px;
}

.product-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.product-card.on-sale {
  border: 2px solid rgb(var(--v-theme-error));
}

.product-image-container {
  position: relative;
}

.sale-badge,
.new-badge {
  position: absolute;
  z-index: 2;
}

.wishlist-btn {
  position: absolute;
  z-index: 2;
  transition: all 0.3s ease;
}

.wishlist-btn:hover {
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
}

.product-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .product-grid-wrapper {
    padding: 8px;
  }
  
  .product-card {
    margin-bottom: 12px;
  }
  
  .v-card-actions .v-btn {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}

/* Animation for view mode changes */
.view-transition-enter-active,
.view-transition-leave-active {
  transition: all 0.3s ease;
}

.view-transition-enter-from,
.view-transition-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
