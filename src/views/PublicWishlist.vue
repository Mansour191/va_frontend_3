<template>
  <v-main class="public-wishlist-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <v-container>
      <v-card class="glass-card" elevation="8">
        <!-- Header -->
        <v-card-title class="pa-6">
          <v-row align="center" justify="space-between">
            <v-col>
              <div class="header-content">
                <h1 class="text-h4 font-weight-bold mb-2">
                  <v-icon class="me-2">mdi-heart</v-icon>
                  قائمة أمنيات {{ wishlistData?.user?.username || 'المستخدم' }}
                </h1>
                <p class="text-body-1 text-medium-emphasis">
                  المنتجات التي يرغب في شرائها
                </p>
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="items-count">
                <v-chip color="primary" variant="tonal">
                  <v-icon start>mdi-heart</v-icon>
                  {{ wishlistItems.length }} منتج
                </v-chip>
              </div>
            </v-col>
          </v-row>
        </v-card-title>

        <v-divider />

        <!-- Loading State -->
        <v-card-text v-if="loading" class="text-center py-12">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
            class="mb-4"
          />
          <p class="text-body-1 text-medium-emphasis">جاري تحميل قائمة الأمنيات...</p>
        </v-card-text>

        <!-- Error State -->
        <v-card-text v-else-if="error" class="text-center py-12">
          <v-icon size="80" color="error" class="mb-4">mdi-alert-circle</v-icon>
          <h3 class="text-h5 mb-2">خطأ في التحميل</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">{{ error }}</p>
          <v-btn
            color="primary"
            prepend-icon="mdi-refresh"
            @click="loadPublicWishlist"
          >
            إعادة المحاولة
          </v-btn>
        </v-card-text>

        <!-- Empty State -->
        <v-card-text v-else-if="wishlistItems.length === 0" class="text-center py-12">
          <v-icon size="80" color="primary" class="mb-4">mdi-heart</v-icon>
          <h3 class="text-h5 mb-2">قائمة الأمنيات فارغة</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">لم يتم إضافة أي منتجات إلى قائمة الأمنيات بعد</p>
          <v-btn
            color="primary"
            prepend-icon="mdi-shopping-bag"
            to="/products"
          >
            تصفح المنتجات
          </v-btn>
        </v-card-text>

        <!-- Wishlist Grid -->
        <v-card-text v-else class="pa-6">
          <v-row>
            <v-col 
              v-for="item in wishlistItems" 
              :key="item.id" 
              cols="12" 
              sm="6" 
              md="4" 
              lg="3"
            >
              <v-card 
                class="wishlist-item h-100"
                elevation="2"
                hover
              >
                <div class="position-relative">
                  <v-img
                    :src="getMainImage(item.product.images)"
                    :alt="item.product.nameAr"
                    height="200"
                    cover
                    class="wishlist-image"
                  />
                  <v-chip
                    v-if="item.product.onSale && item.product.discountPercent"
                    color="error"
                    variant="tonal"
                    size="small"
                    class="discount-chip"
                  >
                    -{{ item.product.discountPercent }}%
                  </v-chip>
                  <v-chip
                    v-if="!item.product.isActive"
                    color="grey"
                    variant="tonal"
                    size="small"
                    class="status-chip"
                  >
                    غير متوفر
                  </v-chip>
                </div>

                <v-card-text class="pa-4">
                  <h3 class="text-h6 mb-2 text-truncate">{{ item.product.nameAr }}</h3>
                  
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      <div v-if="item.product.onSale && item.product.discountPercent" class="d-flex align-center gap-2">
                        <span class="text-body-2 text-decoration-line-through text-medium-emphasis">
                          {{ formatCurrency(item.product.basePrice) }}
                        </span>
                        <span class="text-h6 font-weight-bold text-primary">
                          {{ formatCurrency(getDiscountedPrice(item.product)) }}
                        </span>
                      </div>
                      <div v-else class="text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(item.product.basePrice) }}
                      </div>
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      {{ formatDate(item.createdAt) }}
                    </div>
                  </div>

                  <div class="d-flex align-center mb-3">
                    <v-icon 
                      :color="item.product.stock > 0 ? 'success' : 'error'" 
                      size="small"
                      class="me-1"
                    >
                      {{ item.product.stock > 0 ? 'mdi-check-circle' : 'mdi-close-circle' }}
                    </v-icon>
                    <span class="text-body-2" :class="item.product.stock > 0 ? 'text-success' : 'text-error'">
                      {{ item.product.stock > 0 ? 'متوفر' : 'نفد المخزون' }}
                    </span>
                  </div>

                  <div class="d-flex gap-2">
                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-shopping-bag"
                      @click="addToCart(item.product)"
                      class="flex-grow-1"
                      :disabled="item.product.stock === 0 || !item.product.isActive"
                    >
                      أضف للسلة
                    </v-btn>
                    <v-btn
                      icon
                      variant="outlined"
                      @click="viewProduct(item.product)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Footer -->
        <v-divider v-if="wishlistItems.length > 0" />
        <v-card-actions v-if="wishlistItems.length > 0" class="pa-6">
          <v-spacer />
          <div class="text-caption text-medium-emphasis">
            تمت المشاركة {{ formatDate(wishlistData?.user?.createdAt) }}
          </div>
        </v-card-actions>
      </v-card>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApolloClient } from '@vue/apollo-composable';
import { GET_PUBLIC_WISHLIST } from '@/graphql/wishlist';

// Router
const route = useRoute();
const router = useRouter();

// Apollo client
const { resolveClient } = useApolloClient();
const apolloClient = resolveClient();

// Reactive data
const loading = ref(false);
const error = ref(null);
const wishlistData = ref(null);
const wishlistItems = ref([]);

// Methods
const loadPublicWishlist = async () => {
  const token = route.params.token;
  if (!token) {
    error.value = 'رابط المشاركة غير صالح';
    return;
  }

  loading.value = true;
  error.value = null;
  
  try {
    const { data } = await apolloClient.query({
      query: GET_PUBLIC_WISHLIST,
      variables: { token },
      fetchPolicy: 'network-only'
    });
    
    if (data?.publicWishlist) {
      wishlistData.value = data.publicWishlist;
      wishlistItems.value = data.publicWishlist.items || [];
    } else {
      error.value = 'قائمة الأمنيات غير موجودة أو غير متاحة للعرض';
    }
  } catch (err) {
    console.error('Error loading public wishlist:', err);
    error.value = 'فشل في تحميل قائمة الأمنيات. يرجى التأكد من الرابط والمحاولة مرة أخرى.';
  } finally {
    loading.value = false;
  }
};

const getMainImage = (images) => {
  if (!images || images.length === 0) {
    return '/images/placeholder.jpg';
  }
  const mainImage = images.find(img => img.isMain);
  return mainImage?.imageUrl || images[0].imageUrl || '/images/placeholder.jpg';
};

const getDiscountedPrice = (product) => {
  if (product.onSale && product.discountPercent) {
    return product.basePrice * (1 - product.discountPercent / 100);
  }
  return product.basePrice;
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-DZ');
};

const addToCart = async (product) => {
  try {
    // Add to cart logic - you'll need to implement this
    console.log('Adding to cart:', product);
    // Show success message
  } catch (error) {
    console.error('Error adding to cart:', error);
  }
};

const viewProduct = (product) => {
  router.push(`/products/${product.slug}`);
};

// Lifecycle
onMounted(() => {
  loadPublicWishlist();
});
</script>

<style scoped>
.bg-effects {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 20%;
  left: 60%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.glass-card {
  background: rgba(var(--v-theme-surface), 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  border-radius: 24px;
  margin-top: 80px;
}

.wishlist-item {
  background: rgba(var(--v-theme-surface-variant), 0.05);
  border: 1px solid rgba(var(--v-theme-outline), 0.1);
  border-radius: 16px;
  transition: all 0.3s ease;
  position: relative;
}

.wishlist-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.wishlist-image {
  border-radius: 16px 16px 0 0;
}

.discount-chip {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 1;
}

.status-chip {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

@media (max-width: 768px) {
  .glass-card {
    margin-top: 20px;
    border-radius: 16px;
  }
  
  .wishlist-item {
    margin-bottom: 16px;
  }
}
</style>
