<template>
  <v-card class="recommendations-widget" elevation="4" rounded="xl">
    <!-- Header -->
    <v-card-title v-if="title" class="d-flex align-center justify-space-between pa-4">
      <div class="d-flex align-center ga-2">
        <v-icon :icon="icon" color="primary" size="20" />
        <span class="text-h6">{{ title }}</span>
      </div>
      <v-btn
        v-if="viewAllLink"
        :to="viewAllLink"
        variant="text"
        color="primary"
        size="small"
        class="text-none"
      >
        <span class="me-1">{{ $t('viewAll') || 'عرض الكل' }}</span>
        <v-icon size="16">mdi-chevron-left</v-icon>
      </v-btn>
    </v-card-title>

    <v-divider />

    <!-- Loading State -->
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="40"
        width="3"
        class="mb-4"
      />
      <p class="text-body-2 text-medium-emphasis">
        {{ $t('loadingRecommendations') || 'جاري تحميل التوصيات...' }}
      </p>
    </v-card-text>

    <!-- Products Grid -->
    <v-card-text v-else-if="products.length > 0" class="pa-4">
      <v-row :dense="horizontal">
        <v-col
          v-for="item in products"
          :key="item.product?.id || item.id"
          :cols="horizontal ? 'auto' : 12"
          :sm="horizontal ? 'auto' : 6"
          :md="horizontal ? 'auto' : 4"
          :lg="horizontal ? 'auto' : 3"
        >
          <v-card
            class="product-card cursor-pointer"
            elevation="2"
            rounded="lg"
            hover
            @click="viewProduct(item.product || item)"
            :width="horizontal ? 200 : '100%'"
          >
            <!-- Product Image -->
            <div class="product-image-container position-relative">
              <v-img
                :src="item.product?.image || item.image"
                :alt="item.product?.name || item.name"
                height="150"
                cover
                class="product-image"
              >
                <!-- Score Badge -->
                <v-chip
                  v-if="item.score"
                  color="primary"
                  size="small"
                  class="score-badge position-absolute top-2 right-2"
                >
                  {{ Math.round(item.score * 100) }}% {{ $t('match') || 'توافق' }}
                </v-chip>

                <!-- Recommendation Type Badge -->
                <v-chip
                  v-if="item.type"
                  :color="getTypeColor(item.type)"
                  size="small"
                  class="recommendation-badge position-absolute top-2 left-2"
                >
                  <v-icon size="12" start :icon="getTypeIcon(item.type)" />
                  {{ getTypeLabel(item.type) }}
                </v-chip>
              </v-img>
            </div>

            <!-- Product Info -->
            <v-card-text class="pa-3">
              <h6 class="product-name text-subtitle-1 font-weight-bold mb-1">
                {{ item.product?.name || item.name }}
              </h6>
              <p class="product-category text-caption text-primary mb-2">
                {{ getCategoryLabel(item.product?.category || item.category) }}
              </p>

              <div class="product-price mb-3">
                <span class="current-price text-h6 font-weight-bold">
                  {{ formatCurrency(item.product?.price || item.price) }}
                </span>
              </div>

              <!-- Product Badges -->
              <div v-if="item.details" class="product-badges mb-3">
                <v-chip
                  v-if="item.details.event"
                  color="purple"
                  size="x-small"
                  class="me-1 mb-1"
                >
                  <v-icon size="10" start>mdi-gift</v-icon>
                  {{ item.details.event }}
                </v-chip>
                <v-chip
                  v-if="item.details.season"
                  color="orange"
                  size="x-small"
                  class="me-1 mb-1"
                >
                  <v-icon size="10" start>mdi-white-balance-sunny</v-icon>
                  {{ getSeasonName(item.details.season) }}
                </v-chip>
                <v-chip
                  v-if="item.details.priority === 'high'"
                  color="error"
                  size="x-small"
                  class="me-1 mb-1"
                >
                  <v-icon size="10" start>mdi-alert-circle</v-icon>
                  {{ $t('limitedStock') || 'مخزون محدود' }}
                </v-chip>
                <v-chip
                  v-if="item.details.daysUntil === 0"
                  color="warning"
                  size="x-small"
                  class="me-1 mb-1"
                >
                  <v-icon size="10" start>mdi-clock</v-icon>
                  {{ $t('lastChance') || 'اليوم آخر فرصة' }}
                </v-chip>
              </div>

              <!-- Add to Cart Button -->
              <v-btn
                block
                color="primary"
                variant="elevated"
                size="small"
                class="text-none"
                @click.stop="addToCart(item.product || item)"
              >
                <v-icon size="16" start>mdi-cart-plus</v-icon>
                {{ $t('addToCart') || 'أضف للسلة' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>

    <!-- Empty State -->
    <v-card-text v-else class="text-center py-8">
      <v-icon size="64" color="primary" class="mb-4 opacity-50">
        mdi-gift-outline
      </v-icon>
      <p class="text-body-1 text-medium-emphasis">
        {{ $t('noRecommendations') || 'لا توجد توصيات متاحة' }}
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import CurrencyService from '@/integration/services/CurrencyService';
import RecommendationsService from '@/integration/services/RecommendationsService';

const router = useRouter();
const { t } = useI18n();

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'توصيات لك',
  },
  icon: {
    type: String,
    default: 'mdi-star',
  },
  products: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  horizontal: {
    type: Boolean,
    default: false,
  },
  viewAllLink: {
    type: [String, Object],
    default: null,
  },
});

// Emits
const emit = defineEmits(['add-to-cart']);

// Methods
const formatCurrency = (value) => {
  return CurrencyService.formatAmount(value || 0);
};

const getCategoryLabel = (category) => {
  const categories = {
    walls: t('walls') || 'جدران',
    doors: t('doors') || 'أبواب',
    cars: t('cars') || 'سيارات',
    kitchens: t('kitchens') || 'مطابخ',
    furniture: t('furniture') || 'أثاث',
    ceilings: t('ceilings') || 'أسقف',
    tiles: t('tiles') || 'بلاط',
  };
  return categories[category] || category;
};

const getTypeIcon = (type) => {
  const icons = {
    collaborative: 'mdi-account-group',
    content: 'mdi-tag',
    trending: 'mdi-fire',
    similar: 'mdi-content-copy',
  };
  return icons[type] || 'mdi-star';
};

const getTypeColor = (type) => {
  const colors = {
    collaborative: 'purple',
    content: 'success',
    trending: 'error',
    similar: 'info',
  };
  return colors[type] || 'primary';
};

const getTypeLabel = (type) => {
  const labels = {
    collaborative: t('collaborative') || 'مناسب لك',
    content: t('suggested') || 'مقترح',
    trending: t('trending') || 'رائج',
    similar: t('similar') || 'مشابه',
  };
  return labels[type] || t('recommendation') || 'توصية';
};

const viewProduct = (product) => {
  router.push(`/dashboard/products?view=${product.id}`);
};

const addToCart = (product) => {
  emit('add-to-cart', product);
  // Show success notification
  // In a real app, you might use a toast notification system
  console.log('✅ Added to cart:', product.name);
};

const getSeasonName = (season) => {
  const names = {
    spring: t('spring') || 'الربيع',
    summer: t('summer') || 'الصيف',
    autumn: t('autumn') || 'الخريف',
    winter: t('winter') || 'الشتاء',
  };
  return names[season] || season;
};
</script>

<style scoped>
.recommendations-widget {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
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

.product-image {
  transition: transform 0.5s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.score-badge {
  z-index: 1;
}

.recommendation-badge {
  z-index: 1;
}

.product-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.2;
}

.product-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* Horizontal layout adjustments */
:deep(.v-col) {
  flex: 0 0 auto;
}

:deep(.v-col[cols="auto"]) {
  flex: 0 0 auto;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .product-name {
    font-size: 0.875rem;
  }
  
  .product-badges {
    margin-bottom: 8px;
  }
}
</style>
