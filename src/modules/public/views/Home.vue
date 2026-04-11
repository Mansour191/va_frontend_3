<template>
  <div>
    <!-- Error Boundary Wrapper -->
    <div v-if="hasCriticalError" class="error-boundary">
      <div class="alert alert-danger text-center m-4">
        <i class="fa-solid fa-exclamation-triangle me-2"></i>
        {{ $t('pageLoadError') || 'حدث خطأ أثناء تحميل الصفحة' }}
        <button @click="retryLoading" class="btn btn-primary btn-sm ms-2">
          {{ $t('retry') || 'إعادة المحاولة' }}
        </button>
      </div>
    </div>

    <div v-else>
      <!-- Hero Slider -->
      <HeroSlider />

      <!-- Featured Products Section -->
      <v-container class="py-8">
        <!-- Section Header -->
        <div class="d-flex justify-space-between align-center mb-6">
          <h2 class="text-h4 font-weight-bold text-center">
            {{ $t('featuredProducts') || 'منتجات مميزة' }}
          </h2>
          <v-btn
            :to="'/shop'"
            variant="text"
            color="warning"
            class="text-none"
            append-icon="mdi-arrow-right"
          >
            {{ $t('viewAll') }}
          </v-btn>
        </div>

        <!-- Products Loading Skeleton -->
        <v-row v-if="loadingProducts">
          <v-col
            v-for="i in 4"
            :key="i"
            cols="6"
            md="3"
          >
            <v-card elevation="2" class="h-100">
              <v-skeleton-loader
                type="image, heading, text"
                height="300"
                class="pa-0"
              ></v-skeleton-loader>
            </v-card>
          </v-col>
        </v-row>

        <!-- Products Error -->
        <v-alert
          v-else-if="productsError"
          type="error"
          variant="tonal"
          class="mb-6"
          text
        >
          <template #prepend>
            <v-icon>mdi-alert-circle</v-icon>
          </template>
          {{ productsError }}
        </v-alert>

        <!-- Featured Products Grid -->
        <v-row v-else>
          <v-col
            v-for="(product, index) in featuredProducts"
            :key="product.id"
            cols="6"
            md="3"
          >
            <ProductCard 
              :product="product"
              @add-to-cart="handleAddToCart"
              @toggle-favorite="handleToggleFavorite"
              :is-new="index === 0"
            />
          </v-col>
        </v-row>
      </v-container>

      <!-- Google Maps Section -->
<v-container class="py-8">
  <div class="text-center mb-6">
    <h2 class="text-h4 font-weight-bold">
      {{ $t('ourLocation') || 'موقعنا' }}
    </h2>
  </div>
  <GoogleMap />
</v-container>

<!-- Blog Section -->
<v-container class="py-8">
  <!-- Section Header -->
  <div class="d-flex justify-space-between align-center mb-6">
    <h2 class="text-h4 font-weight-bold text-center">
      {{ $t('latestBlog') || 'أحدث المدونات' }}
    </h2>
    <v-btn
      :to="'/blog'"
      variant="text"
      color="warning"
      class="text-none"
      append-icon="mdi-arrow-right"
    >
      {{ $t('viewAll') }}
    </v-btn>
  </div>

      <!-- Blog Loading Skeleton -->
<v-row v-if="loadingPosts">
  <v-col
    v-for="i in 4"
    :key="i"
    cols="6"
    md="3"
  >
    <v-card elevation="2" class="h-100">
      <v-skeleton-loader
        type="image, heading, text"
        height="250"
        class="pa-0"
      ></v-skeleton-loader>
    </v-card>
  </v-col>
</v-row>

<!-- Blog Error -->
<v-alert
  v-else-if="postsError"
  type="warning"
  variant="tonal"
  class="mb-6"
  text
>
  <template #prepend>
    <v-icon>mdi-alert-circle</v-icon>
  </template>
  {{ postsError }}
</v-alert>

<!-- Blog Posts Grid -->
<v-row v-else>
  <v-col
    v-for="post in posts"
    :key="post.id"
    cols="6"
    md="3"
  >
    <v-card elevation="2" class="h-100" hover>
      <v-img
        :src="post.featuredImage || '/images/blog/placeholder.jpg'"
        :alt="post.title"
        height="150"
        cover
      ></v-img>
      <v-card-title class="text-h6">
        {{ post.title }}
      </v-card-title>
      <v-card-text>
        <p class="text-medium-emphasis">{{ post.excerpt }}</p>
        <small class="text-caption text-medium-emphasis">
          {{ new Date(post.publishedAt).toLocaleDateString() }}
        </small>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :to="`/blog/${post.slug}`"
          variant="outlined"
          color="primary"
          size="small"
          class="text-none"
        >
          {{ $t('readMore') || 'اقرأ المزيد' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</v-row>
</v-container>

<!-- Contact Section -->
<v-container class="py-8">
  <ContactForm />
</v-container>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onErrorCaptured } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import HeroSlider from '@/shared/components/HeroSlider.vue';
import GoogleMap from '@/shared/components/GoogleMap.vue';
import ContactForm from '@/shared/components/common/ContactForm.vue';
import ProductCard from '@/shared/components/ProductCard.vue';
import { useProducts } from '@/shared/composables/useGraphQL';

const { t, locale } = useI18n();
const store = useStore();
const router = useRouter();

// Error boundary state
const hasCriticalError = ref(false);
const errorDetails = ref(null);

// Capture errors from child components
onErrorCaptured((error, instance, info) => {
  console.error('Home.vue Error Boundary:', error, info);
  hasCriticalError.value = true;
  errorDetails.value = { error: error.message, info };
  
  // Prevent error from propagating further
  return false;
});

// GraphQL Products Hook with error handling - Initialize only once
let productsData;
let isProductsInitialized = false;

const initializeProducts = () => {
  if (isProductsInitialized) {
    return productsData;
  }
  
  try {
    productsData = useProducts();
    isProductsInitialized = true;
    console.log('✅ Products composable initialized');
  } catch (error) {
    console.error('Error initializing useProducts:', error);
    productsData = {
      products: ref([]),
      loading: ref(false),
      error: ref(error.message),
      fetchProducts: async () => {}
    };
    isProductsInitialized = true;
  }
  
  return productsData;
};

const { products: featuredProducts, loading: loadingProducts, error: productsError, fetchProducts } = initializeProducts();

const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

const handleAddToCart = (product) => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  
  const item = {
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    quantity: 1
  };
  
  store.dispatch('cart/addToCart', item);
  
  // Show success message
  store.dispatch('notifications/showNotification', {
    type: 'success',
    message: `${product.title} ${t('addedToCart') || 'تمت إضافته إلى السلة'}`
  });
};

const handleToggleFavorite = ({ productId }) => {
  if (!isAuthenticated.value) {
    router.push('/login');
    return;
  }
  
  const product = featuredProducts.value.find(p => p.id === productId);
  if (product) {
    store.dispatch('wishlist/toggleWishlist', product);
  }
};

// Retry function for error recovery
const retryLoading = () => {
  hasCriticalError.value = false;
  errorDetails.value = null;
  
  // Re-trigger fetch without reinitializing the composable
  try {
    console.log('🔄 Retrying products fetch...');
    fetchFeaturedProducts();
  } catch (error) {
    console.error('Retry failed:', error);
    hasCriticalError.value = true;
    errorDetails.value = { error: error.message, info: 'retry_failed' };
  }
};


// Blog State - DISABLED (No backend models)
const posts = ref([]);
const loadingPosts = ref(false);
const postsError = ref(null);

// Mock blog posts for display
const mockPosts = [
  {
    id: 1,
    title: 'مرحباً بك في فينيل آرت',
    excerpt: 'نحن متخصصون في فن الفينيل والأعمال الفنية',
    featuredImage: '/images/blog/placeholder.jpg',
    publishedAt: '2024-01-15'
  },
  {
    id: 2,
    title: 'أحدث منتجاتنا',
    excerpt: 'استكشف تشكيلة جديدة من الفينيل الفاخر',
    featuredImage: '/images/blog/placeholder.jpg',
    publishedAt: '2024-01-10'
  }
];

const fetchLatestPosts = async () => {
  // Simulate loading for demo purposes
  loadingPosts.value = true;
  postsError.value = null;
  
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    posts.value = mockPosts;
  } catch (err) {
    postsError.value = err.message;
  } finally {
    loadingPosts.value = false;
  }
};
  // Prevent duplicate requests
  if (loadingProducts.value) {
    console.log('⏳ Products fetch already in progress, skipping...');
    return;
  }
  
  // Use the composable correctly - no parameters for featured products
  try {
    // useProducts() will automatically fetch all products (no category filter)
    const productsResult = await fetchProducts();
    console.log('✅ Featured products fetched via GraphQL');
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    productsError.value = error.message;
  }
};

// Fetch data on mount
onMounted(() => {
  // useProducts composable handles automatic fetching
  // fetchLatestPosts for demo blog posts
  fetchLatestPosts();
  console.log('🏠 Home component mounted - GraphQL ready');
});
</script>

<style scoped>
/* Vuetify handles most styling, only custom styles needed */
.text-center {
  text-align: center;
}
</style>
