<template>
  <v-main class="wishlist-page">
    <!-- Background Effects -->
    <div class="bg-effects">
      <v-overlay 
        v-model="overlayActive" 
        class="gradient-overlay" 
        persistent 
        opacity="0.1"
      />
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
                  المفضلة
                </h1>
                <p class="text-body-1 text-medium-emphasis">المنتجات التي تحبها</p>
              </div>
            </v-col>
            <v-col cols="auto">
              <div class="d-flex align-center gap-3">
                <div class="items-count">
                  <v-chip color="primary" variant="tonal">
                    <v-icon start>mdi-heart</v-icon>
                    {{ wishlistItems.length }} منتج
                  </v-chip>
                </div>
                <v-btn
                  variant="outlined"
                  color="primary"
                  prepend-icon="mdi-cog"
                  @click="openSettingsModal"
                >
                  الإعدادات
                </v-btn>
                <v-btn
                  v-if="wishlistItems.length > 0"
                  variant="outlined"
                  color="error"
                  prepend-icon="mdi-trash-can"
                  @click="clearWishlist"
                >
                  تفريغ
                </v-btn>
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
          <p class="text-body-1 text-medium-emphasis">جاري تحميل المفضلة...</p>
        </v-card-text>

        <!-- Empty State -->
        <v-card-text v-else-if="wishlistItems.length === 0" class="text-center py-12">
          <v-icon size="80" color="primary" class="mb-4">mdi-heart</v-icon>
          <h3 class="text-h5 mb-2">المفضلة فارغة</h3>
          <p class="text-body-1 text-medium-emphasis mb-4">لم تقم بإضافة أي منتجات إلى المفضلة بعد</p>
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
                    :src="item.image"
                    :alt="item.name"
                    height="200"
                    cover
                    class="wishlist-image"
                  />
                  <v-btn
                    icon
                    variant="elevated"
                    color="error"
                    class="remove-btn"
                    @click="removeFromWishlist(item.id)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-chip
                    v-if="item.discount"
                    color="error"
                    variant="tonal"
                    size="small"
                    class="discount-chip"
                  >
                    -{{ item.discount }}%
                  </v-chip>
                </div>

                <v-card-text class="pa-4">
                  <h3 class="text-h6 mb-2 text-truncate">{{ item.name }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-3">{{ item.category }}</p>
                  
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div>
                      <div v-if="item.discount" class="d-flex align-center gap-2">
                        <span class="text-body-2 text-decoration-line-through text-medium-emphasis">
                          {{ formatCurrency(item.originalPrice) }}
                        </span>
                        <span class="text-h6 font-weight-bold text-primary">
                          {{ formatCurrency(item.price) }}
                        </span>
                      </div>
                      <div v-else class="text-h6 font-weight-bold text-primary">
                        {{ formatCurrency(item.price) }}
                      </div>
                    </div>
                    <v-rating
                      :model-value="item.rating"
                      color="warning"
                      density="compact"
                      size="small"
                      readonly
                    />
                  </div>

                  <div class="d-flex gap-2">
                    <v-btn
                      color="primary"
                      variant="elevated"
                      prepend-icon="mdi-shopping-bag"
                      @click="addToCart(item)"
                      class="flex-grow-1"
                    >
                      أضف للسلة
                    </v-btn>
                    <v-btn
                      icon
                      variant="outlined"
                      @click="viewProduct(item.id)"
                    >
                      <v-icon>mdi-eye</v-icon>
                    </v-btn>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>

        <!-- Bulk Actions -->
        <v-divider v-if="wishlistItems.length > 0" />
        <v-card-actions v-if="wishlistItems.length > 0" class="pa-6">
          <v-spacer />
          <v-btn
            variant="outlined"
            prepend-icon="mdi-shopping-bag"
            @click="addAllToCart"
            :disabled="wishlistItems.length === 0"
          >
            إضافة الكل للسلة
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-container>

    <!-- Wishlist Settings Modal -->
    <WishlistSettingsModal
      v-model="showSettingsModal"
      @settings-updated="onSettingsUpdated"
    />
  </v-main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import WishlistService from '@/integration/services/WishlistService';
import WishlistSettingsModal from '@/components/WishlistSettingsModal.vue';

// Reactive data
const overlayActive = ref(true);
const loading = ref(false);
const wishlistItems = ref([]);
const showSettingsModal = ref(false);

// Methods
const loadWishlist = async () => {
  loading.value = true;
  try {
    // Fetch from API
    const items = await WishlistService.getWishlistItems();
    wishlistItems.value = items;
    console.log('✅ Wishlist loaded from API:', items);
  } catch (error) {
    console.error('❌ Error loading wishlist:', error);
    // Use fallback data if API fails
    wishlistItems.value = WishlistService.getFallbackWishlistItems();
  } finally {
    loading.value = false;
  }
};

const removeFromWishlist = async (itemId) => {
  try {
    await WishlistService.removeFromWishlist(itemId);
    wishlistItems.value = wishlistItems.value(item => item.id !== itemId);
    console.log('✅ Item removed from wishlist:', itemId);
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
  }
};

const clearWishlist = async () => {
  if (confirm('هل أنت متأكد من تفريغ المفضلة؟')) {
    try {
      await WishlistService.clearWishlist();
      wishlistItems.value = [];
      console.log('✅ Wishlist cleared');
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
    }
  }
};

const addToCart = async (item) => {
  try {
    // Add to cart logic
    console.log('Adding to cart:', item);
    // Show success message
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
  }
};

const addAllToCart = async () => {
  try {
    // Add all items to cart
    console.log('Adding all items to cart');
    // Show success message
  } catch (error) {
    console.error('❌ Error adding all to cart:', error);
  }
};

const viewProduct = (productId) => {
  // Navigate to product page
  console.log('Viewing product:', productId);
  // router.push(`/products/${productId}`);
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount);
};

const openSettingsModal = () => {
  showSettingsModal.value = true;
};

const onSettingsUpdated = (settings) => {
  console.log('Settings updated:', settings);
  // You could reload wishlist or show a success message
};

onMounted(() => {
  loadWishlist();
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

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  background: rgba(var(--v-theme-surface), 0.9);
  backdrop-filter: blur(10px);
}

.discount-chip {
  position: absolute;
  top: 8px;
  left: 8px;
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
          <p class="empty-text">لم تضف أي منتجات إلى المفضلة بعد</p>
          <router-link to="/products" class="browse-products-btn">
            <i class="fa-solid fa-shopping-bag"></i>
            تصفح المنتجات
          </router-link>
        </div>

        <!-- Wishlist Grid -->
        <div v-else class="wishlist-grid">
          <div 
            v-for="item in wishlistItems" 
            :key="item.id" 
            class="wishlist-item"
          >
            <div class="item-image-container">
              <img 
                :src="item.image || '/images/placeholder.jpg'" 
                :alt="item.name"
                class="item-image"
                @error="handleImageError"
              />
              <div class="item-overlay">
                <button class="remove-btn" @click="removeFromWishlist(item.id)">
                  <i class="fa-solid fa-times"></i>
                </button>
                <button class="quick-view-btn" @click="quickView(item)">
                  <i class="fa-solid fa-eye"></i>
                </button>
              </div>
              <div v-if="item.discountPercent" class="discount-badge">
                -{{ item.discountPercent }}%
              </div>
              <div v-if="item.isNew" class="new-badge">
                جديد
              </div>
            </div>

            <div class="item-content">
              <div class="item-category">
                {{ item.category }}
              </div>
              <h3 class="item-name">{{ item.name }}</h3>
              <p class="item-description">{{ item.description }}</p>
              
              <div class="item-rating">
                <div class="stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    :class="['fa-solid fa-star', { filled: star <= item.rating }]"
                  ></i>
                </div>
                <span class="rating-count">({{ item.reviewCount }})</span>
              </div>

              <div class="item-price-section">
                <div class="price-row">
                  <span class="current-price">{{ formatPrice(item.price) }}</span>
                  <span v-if="item.originalPrice" class="original-price">
                    {{ formatPrice(item.originalPrice) }}
                  </span>
                </div>
                <div v-if="item.stock > 0 && item.stock <= 5" class="stock-warning">
                  فقط {{ item.stock }} قطعة متبقية
                </div>
                <div v-else-if="item.stock === 0" class="out-of-stock">
                  نفد المخزون
                </div>
              </div>

              <div class="item-actions">
                <button 
                  class="add-to-cart-btn"
                  :disabled="item.stock === 0"
                  @click="addToCart(item)"
                >
                  <i class="fa-solid fa-shopping-cart"></i>
                  <span v-if="item.stock === 0">نفد المخزون</span>
                  <span v-else>أضف للسلة</span>
                </button>
                <button class="view-details-btn" @click="viewProduct(item.id)">
                  <i class="fa-solid fa-arrow-left"></i>
                  التفاصيل
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick View Modal -->
        <div v-if="showQuickView" class="quick-view-modal" @click="closeQuickView">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>{{ quickViewItem.name }}</h3>
              <button class="close-btn" @click="closeQuickView">
                <i class="fa-solid fa-times"></i>
              </button>
            </div>
            <div class="modal-body">
              <div class="modal-image">
                <img :src="quickViewItem.image" :alt="quickViewItem.name" />
              </div>
              <div class="modal-details">
                <div class="modal-price">
                  <span class="current-price">{{ formatPrice(quickViewItem.price) }}</span>
                  <span v-if="quickViewItem.originalPrice" class="original-price">
                    {{ formatPrice(quickViewItem.originalPrice) }}
                  </span>
                </div>
                <p class="modal-description">{{ quickViewItem.description }}</p>
                <div class="modal-actions">
                  <button class="add-to-cart-btn" @click="addToCart(quickViewItem)">
                    <i class="fa-solid fa-shopping-cart"></i>
                    أضف للسلة
                  </button>
                  <button class="view-details-btn" @click="viewProduct(quickViewItem.id)">
                    التفاصيل الكاملة
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { default as GraphQLService } from '@/services/GraphQLService';

const router = useRouter();
const authStore = useAuthStore();
const graphQLService = new GraphQLService();

const loading = ref(true);
const showQuickView = ref(false);
const quickViewItem = ref(null);

const wishlistItems = ref([]);

const formatPrice = (price) => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'DZD'
  }).format(price);
};

const handleImageError = (event) => {
  event.target.src = '/images/placeholder.jpg';
};

const quickView = (item) => {
  quickViewItem.value = item;
  showQuickView.value = true;
};

const closeQuickView = () => {
  showQuickView.value = false;
  quickViewItem.value = null;
};

const removeFromWishlist = async (itemId) => {
  try {
    const result = await graphQLService.removeFromWishlist(itemId);
    if (result.success) {
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== itemId);
    }
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    // Show error message to user
  }
};

const addToCart = async (item) => {
  try {
    if (item.stock === 0) {
      return;
    }
    
    const result = await graphQLService.addToCart(item.id, 1);
    if (result.success) {
      // Show success message
      alert(`تم إضافة "${item.name}" إلى السلة`);
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    // Show error message to user
  }
};

const viewProduct = (productId) => {
  router.push(`/products/${productId}`);
};

const clearWishlist = async () => {
  if (confirm('هل أنت متأكد من تفريغ المفضلة؟')) {
    try {
      const result = await graphQLService.clearWishlist();
      if (result.success) {
        wishlistItems.value = [];
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      // Show error message to user
    }
  }
};

const loadWishlist = async () => {
  try {
    loading.value = true;
    const result = await graphQLService.getWishlist();
    wishlistItems.value = result.items;
  } catch (error) {
    console.error('Error loading wishlist:', error);
    // Show error message to user
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadWishlist();
});
</script>

<style scoped>
/* ===== Wishlist Page ===== */
.wishlist-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 20px;
}

/* Background Effects */
.bg-effects {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 30% 20%, rgba(212, 175, 55, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 70% 80%, rgba(212, 175, 55, 0.12) 0%, transparent 50%);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.1) 50%, transparent 100%);
  filter: blur(2px);
  animation: float 6s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-20px) scale(1.05); }
}

/* Wishlist Container */
.wishlist-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1200px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.08),
              inset 0 0 30px rgba(255, 255, 255, 0.08);
  position: relative;
  overflow: hidden;
}

.glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.5), transparent);
}

/* Header */
.wishlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.page-title i {
  color: #d4af37;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.items-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 16px;
  background: rgba(212, 175, 55, 0.1);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 8px;
}

.count-number {
  color: #d4af37;
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.count-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  margin-top: 2px;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: rgba(220, 53, 69, 0.2);
  border: 1px solid rgba(220, 53, 69, 0.3);
  border-radius: 8px;
  color: #dc3545;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(220, 53, 69, 0.3);
  color: #ffffff;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.loading-spinner {
  font-size: 48px;
  color: #d4af37;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 18px;
  margin: 0;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-icon {
  font-size: 64px;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.empty-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
}

.empty-text {
  font-size: 16px;
  margin: 0 0 32px 0;
}

.browse-products-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  border: none;
  border-radius: 8px;
  color: #1a1a2e;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.browse-products-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* Wishlist Grid */
.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.wishlist-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.wishlist-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-4px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.3);
}

/* Item Image Container */
.item-image-container {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.wishlist-item:hover .item-image {
  transform: scale(1.05);
}

.item-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wishlist-item:hover .item-overlay {
  opacity: 1;
}

.remove-btn,
.quick-view-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-btn {
  color: #dc3545;
}

.remove-btn:hover {
  background: #dc3545;
  color: #ffffff;
  transform: scale(1.1);
}

.quick-view-btn {
  color: #007bff;
}

.quick-view-btn:hover {
  background: #007bff;
  color: #ffffff;
  transform: scale(1.1);
}

.discount-badge,
.new-badge {
  position: absolute;
  top: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.discount-badge {
  right: 12px;
  background: #dc3545;
  color: #ffffff;
}

.new-badge {
  left: 12px;
  background: #28a745;
  color: #ffffff;
}

/* Item Content */
.item-content {
  padding: 20px;
}

.item-category {
  color: #d4af37;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.item-name {
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.item-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  line-height: 1.5;
  margin: 0 0 16px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stars {
  display: flex;
  gap: 2px;
}

.stars i {
  color: rgba(255, 255, 255, 0.3);
  font-size: 14px;
}

.stars i.filled {
  color: #d4af37;
}

.rating-count {
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.item-price-section {
  margin-bottom: 20px;
}

.price-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  color: #d4af37;
  font-size: 20px;
  font-weight: 700;
}

.original-price {
  color: rgba(255, 255, 255, 0.5);
  font-size: 16px;
  text-decoration: line-through;
}

.stock-warning {
  color: #ffc107;
  font-size: 12px;
  font-weight: 500;
}

.out-of-stock {
  color: #dc3545;
  font-size: 12px;
  font-weight: 500;
}

.item-actions {
  display: flex;
  gap: 12px;
}

.add-to-cart-btn,
.view-details-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4c1 50%, #d4af37 100%);
  color: #1a1a2e;
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

.add-to-cart-btn:disabled {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: not-allowed;
}

.view-details-btn {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.view-details-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #d4af37;
  border-color: rgba(212, 175, 55, 0.3);
}

/* Quick View Modal */
.quick-view-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0 24px;
}

.modal-header h3 {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #dc3545;
}

.modal-body {
  display: flex;
  padding: 24px;
  gap: 32px;
}

.modal-image {
  flex: 1;
  max-width: 400px;
}

.modal-image img {
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.modal-details {
  flex: 1;
}

.modal-price {
  margin-bottom: 16px;
}

.modal-price .current-price {
  font-size: 28px;
}

.modal-description {
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin-bottom: 24px;
}

.modal-actions {
  display: flex;
  gap: 16px;
}

.modal-actions .add-to-cart-btn,
.modal-actions .view-details-btn {
  padding: 14px 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .wishlist-page {
    padding: 10px;
  }
  
  .glass-card {
    padding: 20px;
  }
  
  .wishlist-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .wishlist-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .item-actions {
    flex-direction: column;
  }
  
  .modal-body {
    flex-direction: column;
    gap: 20px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
