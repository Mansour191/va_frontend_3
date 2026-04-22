// src/views/dashboard/NavigationPage.vue
<template>
  <v-container class="pa-4">
    <!-- Page Header -->
    <div class="page-header text-center mb-8">
      <h1 class="text-h3 font-weight-bold mb-2">
        <v-icon class="me-2" color="primary">mdi-map</v-icon>
        {{ $t('siteMap') || 'خريطة الموقع' }}
      </h1>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('allLinksAndSections') || 'جميع الروابط والأقسام المتاحة في الموقع' }}
      </p>
    </div>

    <!-- Navigation Grid -->
    <v-row>
      <!-- Main Pages -->
      <v-col cols="12" md="6" lg="4">
        <v-card variant="elevated" class="nav-section h-100">
          <v-card-title class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-home</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">
              {{ $t('mainPages') || 'الصفحات الرئيسية' }}
            </span>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-list density="compact" class="nav-items">
              <v-list-item
                to="/"
                :title="$t('home') || 'الرئيسية'"
                :subtitle="$t('homeDescription') || 'الصفحة الرئيسية للموقع'"
                prepend-avatar="mdi-home"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/about"
                :title="$t('aboutUs') || 'من نحن'"
                :subtitle="$t('aboutDescription') || 'معلومات عن الشركة'"
                prepend-avatar="mdi-information"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/contact"
                :title="$t('contactUs') || 'اتصل بنا'"
                :subtitle="$t('contactDescription') || 'طرق التواصل معنا'"
                prepend-avatar="mdi-phone"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/gallery"
                :title="$t('gallery') || 'معرض الأعمال'"
                :subtitle="$t('galleryDescription') || 'صور ومشاريع سابقة'"
                prepend-avatar="mdi-image-multiple"
                class="nav-item"
                rounded="lg"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Products and Categories -->
      <v-col cols="12" md="6" lg="4">
        <v-card variant="elevated" class="nav-section h-100">
          <v-card-title class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-package-variant</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">
              {{ $t('productsAndCategories') || 'المنتجات والفئات' }}
            </span>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-list density="compact" class="nav-items">
              <v-list-item
                to="/shop"
                :title="$t('shop') || 'المتجر'"
                :subtitle="$t('shopDescription') || 'جميع المنتجات المتاحة'"
                prepend-avatar="mdi-store"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/furniture"
                :title="$t('furniture') || 'الأثاث'"
                :subtitle="$t('furnitureDescription') || 'أثاث فاخر ومميز'"
                prepend-avatar="mdi-sofa"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/doors"
                :title="$t('doors') || 'الأبواب'"
                :subtitle="$t('doorsDescription') || 'مجموعة متنوعة من الأبواب'"
                prepend-avatar="mdi-door-open"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/walls"
                :title="$t('walls') || 'الجدران'"
                :subtitle="$t('wallsDescription') || 'ديكورات وتشطيبات الجدران'"
                prepend-avatar="mdi-roller-shade"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/ceilings"
                :title="$t('ceilings') || 'الأسقف'"
                :subtitle="$t('ceilingsDescription') || 'تصاميم أسقف مبتكرة'"
                prepend-avatar="mdi-arrow-up-bold-box"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/tiles"
                :title="$t('tiles') || 'البلاط'"
                :subtitle="$t('tilesDescription') || 'بلاط فاخر بأنواعه'"
                prepend-avatar="mdi-grid"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/kitchens"
                :title="$t('kitchens') || 'المطابخ'"
                :subtitle="$t('kitchensDescription') || 'تصاميم مطابخ عصرية'"
                prepend-avatar="mdi-silverware-fork-knife"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/cars"
                :title="$t('cars') || 'السيارات'"
                :subtitle="$t('carsDescription') || 'تعديلات وتجميل السيارات'"
                prepend-avatar="mdi-car"
                class="nav-item"
                rounded="lg"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Dashboard Controls -->
      <v-col cols="12" md="6" lg="4">
        <v-card variant="elevated" class="nav-section h-100">
          <v-card-title class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-view-dashboard</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">
              {{ $t('dashboards') || 'لوحات التحكم' }}
            </span>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-list density="compact" class="nav-items">
              <v-list-item
                to="/dashboard"
                :title="$t('mainDashboard') || 'لوحة التحكم الرئيسية'"
                :subtitle="$t('dashboardDescription') || 'إدارة الموقع والمنتجات'"
                prepend-avatar="mdi-gauge"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/dashboard/products"
                :title="$t('productManagement') || 'إدارة المنتجات'"
                :subtitle="$t('productManagementDescription') || 'إضافة وتعديل المنتجات'"
                prepend-avatar="mdi-package-variant-closed"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/dashboard/analytics"
                :title="$t('analytics') || 'التحليلات'"
                :subtitle="$t('analyticsDescription') || 'إحصائيات وتقارير الموقع'"
                prepend-avatar="mdi-chart-line"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/dashboard/ai"
                :title="$t('aiTools') || 'الذكاء الاصطناعي'"
                :subtitle="$t('aiToolsDescription') || 'أدوات وتحليلات ذكية'"
                prepend-avatar="mdi-brain"
                class="nav-item"
                rounded="lg"
              />
              <v-list-item
                to="/investor"
                :title="$t('investorPlatform') || 'منصة المستثمرين'"
                :subtitle="$t('investorPlatformDescription') || 'تقارير واستثمارات'"
                prepend-avatar="mdi-trending-up"
                class="nav-item"
                rounded="lg"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Additional Services -->
      <v-col cols="12" md="6" lg="4">
        <v-card variant="elevated" class="nav-section h-100">
          <v-card-title class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-cog</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">
              {{ $t('additionalServices') || 'الخدمات الإضافية' }}
            </span>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-list density="compact" class="nav-items">
              <v-list-item
                to="/cart"
                :title="$t('shoppingCart') || 'سلة التسوق'"
                :subtitle="$t('cartDescription') || 'المنتجات المختارة'"
                prepend-avatar="mdi-cart"
                class="nav-item"
                rounded="lg"
              >
                <template v-slot:append>
                  <v-chip size="small" color="primary" variant="elevated">
                    {{ cartItemCount }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item
                to="/wishlist"
                :title="$t('wishlist') || 'قائمة الرغبات'"
                :subtitle="$t('wishlistDescription') || 'المنتجات المفضلة'"
                prepend-avatar="mdi-heart"
                class="nav-item"
                rounded="lg"
              >
                <template v-slot:append>
                  <v-chip size="small" color="error" variant="elevated">
                    {{ wishlistItemCount }}
                  </v-chip>
                </template>
              </v-list-item>
              <v-list-item
                to="/search"
                :title="$t('advancedSearch') || 'البحث المتقدم'"
                :subtitle="$t('searchDescription') || 'بحث في جميع المحتويات'"
                prepend-avatar="mdi-magnify"
                class="nav-item"
                rounded="lg"
              />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Site Statistics -->
      <v-col cols="12" md="6" lg="4">
        <v-card variant="elevated" class="nav-section h-100">
          <v-card-title class="d-flex align-center ga-3 pa-4">
            <v-avatar color="primary" variant="tonal">
              <v-icon>mdi-chart-box</v-icon>
            </v-avatar>
            <span class="text-h6 font-weight-bold">
              {{ $t('siteStatistics') || 'إحصائيات الموقع' }}
            </span>
          </v-card-title>
          
          <v-divider />
          
          <v-card-text class="pa-4">
            <v-row class="text-center">
              <v-col cols="6" class="mb-4">
                <v-icon size="32" color="primary" class="mb-2">mdi-package-variant</v-icon>
                <div class="text-h4 font-weight-bold text-primary">{{ stats.totalProducts }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('totalProducts') || 'إجمالي المنتجات' }}
                </div>
              </v-col>
              <v-col cols="6" class="mb-4">
                <v-icon size="32" color="success" class="mb-2">mdi-shape</v-icon>
                <div class="text-h4 font-weight-bold text-success">{{ stats.totalCategories }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('totalCategories') || 'إجمالي الفئات' }}
                </div>
              </v-col>
              <v-col cols="6" class="mb-4">
                <v-icon size="32" color="info" class="mb-2">mdi-file-document-multiple</v-icon>
                <div class="text-h4 font-weight-bold text-info">{{ stats.totalPages }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('totalPages') || 'إجمالي الصفحات' }}
                </div>
              </v-col>
              <v-col cols="6" class="mb-4">
                <v-icon size="32" color="warning" class="mb-2">mdi-account-group</v-icon>
                <div class="text-h4 font-weight-bold text-warning">{{ stats.totalUsers }}</div>
                <div class="text-caption text-medium-emphasis">
                  {{ $t('totalUsers') || 'إجمالي المستخدمين' }}
                </div>
              </v-col>
            </v-row>
            
            <v-btn
              @click="refreshStats"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
              block
              class="mt-4"
            >
              {{ $t('refreshStats') || 'تحديث الإحصائيات' }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useQuery, useMutation } from '@apollo/client';
import NavigationService from '@/services/NavigationService';
import CartService from '@/services/CartService';
import WishlistService from '@/services/WishlistService';
import { useErrorBoundary } from '@/shared/composables/useErrorBoundary';

// GraphQL queries and mutations
import {
  GET_SITE_STATISTICS,
  GET_PRODUCTS_COUNT,
  GET_CATEGORIES_COUNT,
  GET_PAGES_COUNT,
  GET_USERS_COUNT,
  REFRESH_SITE_STATISTICS,
  SITE_STATISTICS_UPDATED
} from '@/integration/graphql/shop';

const { t } = useI18n();
const store = useStore();
const errorBoundary = useErrorBoundary();

// State
const loading = ref(false);
const refreshing = ref(false);

// Computed
const cartItemCount = computed(() => {
  return store.getters['cart/items'].length || 0;
});

const wishlistItemCount = computed(() => {
  return store.getters['wishlist/items'].length || 0;
});

// GraphQL Queries
const { 
  result: siteStatsResult,
  loading: siteStatsLoading,
  error: siteStatsError,
  refetch: refetchSiteStats
} = useQuery(GET_SITE_STATISTICS, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
});

const { 
  result: productsCountResult,
  loading: productsCountLoading,
  refetch: refetchProductsCount
} = useQuery(GET_PRODUCTS_COUNT, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
});

const { 
  result: categoriesCountResult,
  loading: categoriesCountLoading,
  refetch: refetchCategoriesCount
} = useQuery(GET_CATEGORIES_COUNT, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
});

const { 
  result: pagesCountResult,
  loading: pagesCountLoading,
  refetch: refetchPagesCount
} = useQuery(GET_PAGES_COUNT, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
});

const { 
  result: usersCountResult,
  loading: usersCountLoading,
  refetch: refetchUsersCount
} = useQuery(GET_USERS_COUNT, {
  errorPolicy: 'all',
  fetchPolicy: 'cache-and-network'
});

// Computed properties for reactive data
const stats = computed(() => {
  if (siteStatsResult.value?.data?.siteStatistics) {
    const siteStats = siteStatsResult.value.data.siteStatistics;
    return {
      totalProducts: siteStats.totalProducts || 0,
      totalCategories: siteStats.totalCategories || 0,
      totalPages: siteStats.totalPages || 0,
      totalUsers: siteStats.totalUsers || 0
    };
  }
  
  // Fallback to individual count queries
  return {
    totalProducts: productsCountResult.value?.data?.productsCount || 0,
    totalCategories: categoriesCountResult.value?.data?.categoriesCount || 0,
    totalPages: pagesCountResult.value?.data?.pagesCount || 0,
    totalUsers: usersCountResult.value?.data?.usersCount || 0
  };
});

// Combined loading state
const loading = computed(() => {
  return siteStatsLoading.value || 
         productsCountLoading.value || 
         categoriesCountLoading.value || 
         pagesCountLoading.value || 
         usersCountLoading.value;
});

// Error handling
const hasErrors = computed(() => {
  return !!(siteStatsError.value);
});

// Methods
const fetchSiteStats = async () => {
  return errorBoundary.execute(async () => {
    loading.value = true;
    
    try {
      // Try site statistics query first
      await refetchSiteStats();
      
      if (siteStatsResult.value?.data?.siteStatistics) {
        console.log('✅ Site statistics loaded successfully via GraphQL');
        return;
      }
      
      // Fallback to individual count queries
      await Promise.all([
        refetchProductsCount(),
        refetchCategoriesCount(),
        refetchPagesCount(),
        refetchUsersCount()
      ]);
      
      console.log('✅ Site statistics loaded via individual count queries');
    } catch (error) {
      console.error('❌ Error fetching site statistics:', error);
      
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'warning',
        title: t('warning') || 'تحذير',
        message: t('errorLoadingStats') || 'خطأ في تحميل الإحصائيات',
        timeout: 5000
      });
      
      throw error;
    } finally {
      loading.value = false;
    }
  }, 'Site statistics fetch');
};

const { mutate: refreshSiteStatsMutation } = useMutation(REFRESH_SITE_STATISTICS);

const refreshStats = async () => {
  return errorBoundary.execute(async () => {
    refreshing.value = true;
    
    try {
      // Try refresh mutation first
      const result = await refreshSiteStatsMutation({
        errorPolicy: 'all'
      });
      
      if (result.data?.refreshSiteStatistics?.success) {
        console.log('✅ Site statistics refreshed successfully');
        
        // Refetch data after refresh
        await fetchSiteStats();
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('success') || 'نجاح',
          message: t('statsRefreshed') || 'تم تحديث الإحصائيات بنجاح',
          timeout: 3000
        });
      } else {
        throw new Error(result.errors?.[0]?.message || 'Refresh failed');
      }
    } catch (error) {
      console.error('❌ Error refreshing site statistics:', error);
      
      // Fallback to simple refetch
      await fetchSiteStats();
      
      // Show success notification anyway
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('success') || 'نجاح',
        message: t('statsRefreshed') || 'تم تحديث الإحصائيات بنجاح',
        timeout: 3000
      });
      
      throw error;
    } finally {
      refreshing.value = false;
    }
  }, 'Site statistics refresh');
};

// Lifecycle
onMounted(() => {
  fetchSiteStats();
  
  // Load cart and wishlist data
  CartService.loadCart();
  WishlistService.loadWishlist();
});
</script>

<style scoped>
/* Page Header */
.page-header {
  position: relative;
}

.page-header::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 2px;
}

/* Navigation Sections */
.nav-section {
  transition: all 0.3s ease;
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

.nav-section:nth-child(1) { animation-delay: 0.1s; }
.nav-section:nth-child(2) { animation-delay: 0.2s; }
.nav-section:nth-child(3) { animation-delay: 0.3s; }
.nav-section:nth-child(4) { animation-delay: 0.4s; }

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-section:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(var(--v-theme-primary), 0.15);
}

/* Navigation Items */
.nav-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.1), transparent);
  transition: left 0.5s ease;
}

.nav-item:hover::before {
  left: 100%;
}

.nav-item:hover {
  transform: translateX(8px);
  background: rgba(var(--v-theme-primary), 0.05);
}

.nav-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

/* Statistics Cards */
.nav-section .v-card-text {
  position: relative;
}

.nav-section .v-icon {
  transition: all 0.3s ease;
}

.nav-section:hover .v-icon {
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 960px) {
  .page-header h1 {
    font-size: 2rem;
  }
}

@media (max-width: 600px) {
  .page-header h1 {
    font-size: 1.5rem;
  }
  
  .nav-items {
    gap: 4px;
  }
  
  .nav-item {
    padding: 8px 12px;
  }
}

/* Vuetify Overrides */
:deep(.v-list-item) {
  margin-bottom: 4px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

:deep(.v-list-item:hover) {
  background: rgba(var(--v-theme-primary), 0.05);
  transform: translateX(4px);
}

:deep(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.1);
  border-left: 4px solid rgb(var(--v-theme-primary));
}

:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-chip) {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}
</style>
