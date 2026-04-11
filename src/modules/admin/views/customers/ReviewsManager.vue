<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 reviews-header">
      <v-card-text class="pa-6">
        <div class="d-flex align-center justify-space-between">
          <div class="header-content">
            <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center ga-3">
              <v-icon color="primary" size="40">mdi-star-multiple</v-icon>
              {{ $t('reviewsManager') || 'إدارة المراجعات' }}
            </h1>
            <p class="text-body-1 text-medium-emphasis mb-0">
              {{ $t('reviewsManagerSubtitle') || 'إدارة مراجعات وتقييمات العملاء' }}
            </p>
          </div>
          <div class="header-actions d-flex ga-3">
            <v-btn
              @click="addReview"
              variant="elevated"
              color="primary"
              prepend-icon="mdi-plus"
            >
              {{ $t('addReview') || 'إضافة مراجعة' }}
            </v-btn>
            <v-btn
              @click="exportReviews"
              variant="tonal"
              color="success"
              prepend-icon="mdi-download"
            >
              {{ $t('exportReviews') || 'تصدير المراجعات' }}
            </v-btn>
            <v-btn
              @click="refreshData"
              variant="tonal"
              color="primary"
              prepend-icon="mdi-refresh"
            >
              {{ $t('refresh') || 'تحديث' }}
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="48" />
      <p class="mt-4 text-medium-emphasis">{{ $t('loadingReviews') || 'جاري تحميل المراجعات...' }}</p>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Reviews Stats -->
      <v-row class="mb-6">
        <v-col
          v-for="stat in reviewsStats"
          :key="stat.title"
          cols="12"
          sm="6"
          md="3"
        >
          <v-card variant="elevated" class="stat-card">
            <v-card-text class="pa-4 text-center">
              <v-avatar
                :color="stat.color"
                variant="tonal"
                size="50"
                class="mb-3"
              >
                <v-icon :color="stat.color" size="28">{{ stat.icon }}</v-icon>
              </v-avatar>
              <h3 class="text-h4 font-weight-bold text-white mb-1">{{ stat.value }}</h3>
              <p class="text-caption text-medium-emphasis mb-0">{{ stat.title }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Rating Distribution -->
      <v-row class="mb-6">
        <v-col cols="12" lg="8">
          <v-card variant="elevated" class="reviews-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-chart-bar</v-icon>
                {{ $t('ratingDistribution') || 'توزيع التقييمات' }}
              </h3>
              <div class="rating-distribution">
                <div v-for="rating in ratingDistribution" :key="rating.stars" class="rating-item mb-3">
                  <div class="d-flex align-center ga-3">
                    <div class="d-flex align-center ga-1" style="min-width: 80px;">
                      <span class="text-body-2 font-weight-medium">{{ rating.stars }}</span>
                      <v-icon color="warning" size="16">mdi-star</v-icon>
                    </div>
                    <div class="flex-grow-1">
                      <v-progress-linear
                        :model-value="rating.percentage"
                        :color="rating.color"
                        height="8"
                        rounded
                      />
                    </div>
                    <div class="text-caption text-medium-emphasis" style="min-width: 60px;">
                      {{ rating.count }} ({{ rating.percentage }}%)
                    </div>
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" lg="4">
          <v-card variant="elevated" class="reviews-card">
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium text-white mb-4 d-flex align-center ga-2">
                <v-icon color="primary" size="20">mdi-trending-up</v-icon>
                {{ $t('reviewTrends') || 'اتجاهات المراجعات' }}
              </h3>
              <div class="trends-stats">
                <div class="trend-item mb-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('thisMonth') || 'هذا الشهر' }}</span>
                    <span class="text-body-2 font-weight-medium text-success">+{{ trendsStats.thisMonth }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(trendsStats.thisMonth / trendsStats.maxTrend) * 100"
                    color="success"
                    height="6"
                    rounded
                  />
                </div>
                <div class="trend-item mb-3">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('lastMonth') || 'الشهر الماضي' }}</span>
                    <span class="text-body-2 font-weight-medium text-warning">+{{ trendsStats.lastMonth }}</span>
                  </div>
                  <v-progress-linear
                    :model-value="(trendsStats.lastMonth / trendsStats.maxTrend) * 100"
                    color="warning"
                    height="6"
                    rounded
                  />
                </div>
                <div class="trend-item">
                  <div class="d-flex justify-space-between align-center mb-1">
                    <span class="text-caption text-medium-emphasis">{{ $t('averageRating') || 'متوسط التقييم' }}</span>
                    <span class="text-body-2 font-weight-medium text-primary">{{ trendsStats.averageRating }}/5</span>
                  </div>
                  <v-progress-linear
                    :model-value="(trendsStats.averageRating / 5) * 100"
                    color="primary"
                    height="6"
                    rounded
                  />
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Reviews Table -->
      <v-card variant="elevated" class="reviews-card">
        <v-card-text class="pa-4">
          <div class="d-flex align-center justify-space-between mb-4">
            <h3 class="text-h6 font-weight-medium text-white d-flex align-center ga-2">
              <v-icon color="primary" size="20">mdi-comment-multiple</v-icon>
              {{ $t('allReviews') || 'جميع المراجعات' }}
            </h3>
            <div class="d-flex ga-2">
              <v-text-field
                v-model="searchQuery"
                :label="$t('searchReviews') || 'البحث في المراجعات'"
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 300px;"
              />
              <v-select
                v-model="ratingFilter"
                :label="$t('filterByRating') || 'فلترة حسب التقييم'"
                :items="ratingOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px;"
              />
              <v-select
                v-model="statusFilter"
                :label="$t('filterByStatus') || 'فلترة حسب الحالة'"
                :items="statusOptions"
                variant="outlined"
                density="compact"
                hide-details
                style="max-width: 200px;"
              />
            </div>
          </div>

          <v-data-table
            :headers="tableHeaders"
            :items="filteredReviews"
            :loading="loading"
            :search="searchQuery"
            items-per-page="10"
            class="reviews-table"
          >
            <template #[`item.customer`="{ item }">
              <div class="d-flex align-center ga-2">
                <v-avatar :color="item.avatarColor" variant="tonal" size="32">
                  <v-icon size="16">{{ item.avatarIcon }}</v-icon>
                </v-avatar>
                <div>
                  <div class="text-body-2 font-weight-medium text-white">{{ item.customer }}</div>
                  <div class="text-caption text-medium-emphasis">{{ item.email }}</div>
                </div>
              </div>
            </template>

            <template #[`item.rating"="{ item }">
              <div class="d-flex align-center ga-1">
                <v-rating
                  :model-value="item.rating"
                  color="warning"
                  density="compact"
                  size="small"
                  readonly
                />
                <span class="text-body-2 font-weight-medium">{{ item.rating }}</span>
              </div>
            </template>

            <template #[`item.product"="{ item }">
              <div class="text-body-2 font-weight-medium text-white">{{ item.product }}</div>
            </template>

            <template #[`item.status"="{ item }">
              <v-chip :color="item.statusColor" variant="tonal" size="small">
                {{ item.status }}
              </v-chip>
            </template>

            <template #[`item.date"="{ item }">
              <div class="text-body-2">{{ item.date }}</div>
            </template>

            <template #[`item.actions`="{ item }">
              <div class="d-flex ga-1">
                <v-btn
                  @click="viewReview(item)"
                  variant="tonal"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-eye"
                >
                  {{ $t('view') || 'عرض' }}
                </v-btn>
                <v-btn
                  @click="editReview(item)"
                  variant="tonal"
                  color="warning"
                  size="small"
                  prepend-icon="mdi-pencil"
                >
                  {{ $t('edit') || 'تعديل' }}
                </v-btn>
                <v-btn
                  @click="deleteReview(item)"
                  variant="tonal"
                  color="error"
                  size="small"
                  prepend-icon="mdi-delete"
                >
                  {{ $t('delete') || 'حذف' }}
                </v-btn>
              </div>
            </template>
          </v-data-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Add/Edit Review Dialog -->
    <v-dialog v-model="reviewDialog" max-width="600px">
      <v-card>
        <v-card-title class="pa-4">
          <h3 class="text-h6 font-weight-medium">
            {{ editingReview ? ($t('editReview') || 'تعديل المراجعة') : ($t('addReview') || 'إضافة مراجعة') }}
          </h3>
        </v-card-title>
        <v-card-text class="pa-4">
          <v-form ref="reviewForm" v-model="validForm">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="currentReview.customer"
                  :label="$t('customerName') || 'اسم العميل'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="currentReview.email"
                  :label="$t('email') || 'البريد الإلكتروني'"
                  variant="outlined"
                  type="email"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="currentReview.product"
                  :label="$t('product') || 'المنتج'"
                  variant="outlined"
                  required
                />
              </v-col>
              <v-col cols="12">
                <v-rating
                  v-model="currentReview.rating"
                  :label="$t('rating') || 'التقييم'"
                  color="warning"
                  hover
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="currentReview.comment"
                  :label="$t('comment') || 'التعليق'"
                  variant="outlined"
                  rows="4"
                  required
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="currentReview.status"
                  :label="$t('status') || 'الحالة'"
                  :items="statusOptions"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="reviewDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="saveReview" color="primary" variant="elevated">
            {{ $t('save') || 'حفظ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import ReviewsService from '@/services/ReviewsService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(false);
const reviewDialog = ref(false);
const editingReview = ref(false);
const validForm = ref(false);
const searchQuery = ref('');
const ratingFilter = ref('all');
const statusFilter = ref('all');

// Form refs
const reviewForm = ref(null);

// Data
const reviewsStats = ref([
  {
    title: t('totalReviews') || 'إجمالي المراجعات',
    value: '2,456',
    icon: 'mdi-comment-multiple',
    color: 'primary'
  },
  {
    title: t('averageRating') || 'متوسط التقييم',
    value: '4.5',
    icon: 'mdi-star',
    color: 'warning'
  },
  {
    title: t('pendingReviews') || 'المراجعات المعلقة',
    value: '23',
    icon: 'mdi-clock',
    color: 'info'
  },
  {
    title: t('thisMonth') || 'هذا الشهر',
    value: '156',
    icon: 'mdi-calendar',
    color: 'success'
  }
]);

const ratingDistribution = ref([
  {
    stars: 5,
    count: 1234,
    percentage: 50,
    color: 'success'
  },
  {
    stars: 4,
    count: 734,
    percentage: 30,
    color: 'primary'
  },
  {
    stars: 3,
    count: 368,
    percentage: 15,
    color: 'warning'
  },
  {
    stars: 2,
    count: 98,
    percentage: 4,
    color: 'error'
  },
  {
    stars: 1,
    count: 22,
    percentage: 1,
    color: 'grey'
  }
]);

const trendsStats = ref({
  thisMonth: 156,
  lastMonth: 124,
  averageRating: 4.5,
  maxTrend: 200
});

const reviews = ref([
  {
    id: 1,
    customer: 'أحمد محمد',
    email: 'ahmed@example.com',
    product: 'ملصق حائط زهور',
    rating: 5,
    comment: 'منتج رائع جداً! جودة عالية وتصميم جميل. أنصح به بشدة.',
    status: 'منشور',
    statusColor: 'success',
    avatarColor: 'primary',
    avatarIcon: 'mdi-account',
    date: '2024-01-15'
  },
  {
    id: 2,
    customer: 'فاطمة علي',
    email: 'fatima@example.com',
    product: 'ملصق باب خشبي',
    rating: 4,
    comment: 'جيد جداً لكن يحتاج بعض التحسين في التغليف.',
    status: 'منشور',
    statusColor: 'success',
    avatarColor: 'success',
    avatarIcon: 'mdi-account',
    date: '2024-01-12'
  },
  {
    id: 3,
    customer: 'محمد عبدالله',
    email: 'mohammed@example.com',
    product: 'ملصق سيارة رياضي',
    rating: 5,
    comment: 'أفضل ملصق سيارة استخدمته. الألوان رائعة والجودة ممتازة.',
    status: 'معلق',
    statusColor: 'warning',
    avatarColor: 'warning',
    avatarIcon: 'mdi-account',
    date: '2024-01-10'
  },
  {
    id: 4,
    customer: 'نورة سالم',
    email: 'nora@example.com',
    product: 'ملصق مطبخ عصري',
    rating: 3,
    comment: 'جيد ولكن السعر مرتفع قليلاً مقارنة بالمنتجات المشابهة.',
    status: 'منشور',
    statusColor: 'success',
    avatarColor: 'info',
    avatarIcon: 'mdi-account',
    date: '2024-01-08'
  },
  {
    id: 5,
    customer: 'خالد العتيبي',
    email: 'khalid@example.com',
    product: 'ملصق باب خشبي',
    rating: 5,
    comment: 'ممتاز! جودة فائقة وتصميم أنيق. سأطلب مرة أخرى بالتأكيد.',
    status: 'منشور',
    statusColor: 'success',
    avatarColor: 'purple',
    avatarIcon: 'mdi-account',
    date: '2024-01-05'
  },
  {
    id: 6,
    customer: 'سارة أحمد',
    email: 'sara@example.com',
    product: 'ملصق حائط زهور',
    rating: 4,
    comment: 'منتج جيد جداً. الألوان جميلة والمادة عالية الجودة.',
    status: 'مرفوض',
    statusColor: 'error',
    avatarColor: 'pink',
    avatarIcon: 'mdi-account',
    date: '2024-01-03'
  }
]);

const currentReview = ref({
  id: null,
  customer: '',
  email: '',
  product: '',
  rating: 5,
  comment: '',
  status: 'معلق'
});

const statusOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: 'منشور', value: 'منشور' },
  { title: 'معلق', value: 'معلق' },
  { title: 'مرفوض', value: 'مرفوض' }
]);

const ratingOptions = ref([
  { title: 'الكل', value: 'all' },
  { title: '5 نجوم', value: 5 },
  { title: '4 نجوم', value: 4 },
  { title: '3 نجوم', value: 3 },
  { title: 'نجمتان', value: 2 },
  { title: 'نجمة', value: 1 }
]);

const tableHeaders = ref([
  { title: t('customer') || 'العميل', key: 'customer', sortable: true },
  { title: t('product') || 'المنتج', key: 'product', sortable: true },
  { title: t('rating') || 'التقييم', key: 'rating', sortable: true },
  { title: t('comment') || 'التعليق', key: 'comment', sortable: false },
  { title: t('status') || 'الحالة', key: 'status', sortable: true },
  { title: t('date') || 'التاريخ', key: 'date', sortable: true },
  { title: t('actions') || 'الإجراءات', key: 'actions', sortable: false, align: 'center' }
]);

// Computed
const filteredReviews = computed(() => {
  let filtered = reviews.value;
  
  if (ratingFilter.value !== 'all') {
    filtered = filtered.filter(review => review.rating === ratingFilter.value);
  }
  
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(review => review.status === statusFilter.value);
  }
  
  return filtered;
});

// API Integration Methods
const loadReviewsData = async () => {
  try {
    const response = await ReviewsService.getReviews();
    if (response.success) {
      // Update data with API response
      reviews.value = response.data.reviews || reviews.value;
      reviewsStats.value = response.data.reviewsStats || reviewsStats.value;
      ratingDistribution.value = response.data.ratingDistribution || ratingDistribution.value;
      trendsStats.value = response.data.trendsStats || trendsStats.value;
    } else {
      // Use mock data as fallback
      console.log('Using mock data for reviews manager');
    }
  } catch (error) {
    console.error('Error loading reviews data:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('reviewsError') || 'خطأ في تحميل المراجعات',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  }
};

// Methods
const addReview = () => {
  editingReview.value = false;
  currentReview.value = {
    id: null,
    customer: '',
    email: '',
    product: '',
    rating: 5,
    comment: '',
    status: 'معلق'
  };
  reviewDialog.value = true;
};

const editReview = (review) => {
  editingReview.value = true;
  currentReview.value = { ...review };
  reviewDialog.value = true;
};

const saveReview = async () => {
  if (!reviewForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    if (editingReview.value) {
      // Update existing review
      const response = await ReviewsService.updateReview(currentReview.value);
      if (response.success) {
        const index = reviews.value.findIndex(r => r.id === currentReview.value.id);
        if (index > -1) {
          reviews.value[index] = { ...reviews.value[index], ...currentReview.value };
        }
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('reviewUpdated') || 'تم تحديث المراجعة',
          message: t('reviewUpdatedSuccessfully') || 'تم تحديث المراجعة بنجاح',
          timeout: 2000
        });
      }
    } else {
      // Create new review
      const response = await ReviewsService.createReview(currentReview.value);
      if (response.success) {
        const newReview = {
          ...currentReview.value,
          id: Date.now(),
          statusColor: getStatusColor(currentReview.value.status),
          avatarColor: 'primary',
          avatarIcon: 'mdi-account',
          date: new Date().toISOString().split('T')[0]
        };
        
        reviews.value.unshift(newReview);
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('reviewCreated') || 'تم إنشاء المراجعة',
          message: t('reviewCreatedSuccessfully') || 'تم إنشاء المراجعة بنجاح',
          timeout: 2000
        });
      }
    }
    
    reviewDialog.value = false;
    await loadReviewsData();
  } catch (error) {
    console.error('Error saving review:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'خطأ في الحفظ',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const deleteReview = async (review) => {
  if (!confirm(t('confirmDeleteReview') || 'هل أنت متأكد من حذف هذه المراجعة؟')) return;
  
  try {
    loading.value = true;
    
    const response = await ReviewsService.deleteReview(review.id);
    if (response.success) {
      const index = reviews.value.findIndex(r => r.id === review.id);
      if (index > -1) {
        reviews.value.splice(index, 1);
      }
      
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('reviewDeleted') || 'تم حذف المراجعة',
        message: t('reviewDeletedSuccessfully') || 'تم حذف المراجعة بنجاح',
        timeout: 2000
      });
      
      await loadReviewsData();
    }
  } catch (error) {
    console.error('Error deleting review:', error);
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('deleteError') || 'خطأ في الحذف',
      message: error.message || t('unexpectedError') || 'حدث خطأ غير متوقع',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const viewReview = (review) => {
  // Navigate to review details
  console.log('Viewing review:', review);
  
  // Show info notification
  store.dispatch('notifications/add', {
    type: 'info',
    title: t('viewingReview') || 'عرض المراجعة',
    message: `${t('viewing') || 'جاري عرض'} مراجعة ${review.customer}`,
    timeout: 2000
  });
};

const exportReviews = () => {
  const reviewsData = {
    reviews: reviews.value,
    reviewsStats: reviewsStats.value,
    ratingDistribution: ratingDistribution.value,
    trendsStats: trendsStats.value,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(reviewsData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `reviews-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  // Show success notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('reviewsExported') || 'تم تصدير المراجعات',
    message: t('reviewsExportedSuccessfully') || 'تم تصدير المراجعات بنجاح',
    timeout: 3000
  });
};

const refreshData = async () => {
  loading.value = true;
  
  try {
    await loadReviewsData();
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('dataRefreshed') || 'تم تحديث البيانات',
      message: t('reviewsDataRefreshed') || 'تم تحديث بيانات المراجعات بنجاح',
      timeout: 2000
    });
  } catch (error) {
    console.error('Error refreshing data:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = (status) => {
  const colors = {
    'منشور': 'success',
    'معلق': 'warning',
    'مرفوض': 'error'
  };
  return colors[status] || 'grey';
};

// Lifecycle
onMounted(async () => {
  loading.value = true;
  
  try {
    await loadReviewsData();
  } catch (error) {
    console.error('Error initializing Reviews Manager:', error);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
/* Reviews Header */
.reviews-header {
  position: relative;
  overflow: hidden;
}

.reviews-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.reviews-header:hover::before {
  left: 100%;
}

/* Stat Cards */
.stat-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.stat-card:hover::before {
  left: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

/* Reviews Cards */
.reviews-card {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.reviews-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.reviews-card:hover::before {
  left: 100%;
}

.reviews-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Rating Distribution */
.rating-distribution {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rating-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.rating-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.rating-item:hover::before {
  left: 100%;
}

.rating-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Trends Stats */
.trends-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.trend-item {
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.trend-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.trend-item:hover::before {
  left: 100%;
}

.trend-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Reviews Table */
.reviews-table {
  transition: all 0.3s ease;
}

.reviews-table:hover {
  transform: scale(1.01);
}

/* Animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: fadeIn 0.5s ease forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }
.stat-card:nth-child(4) { animation-delay: 0.4s; }

.reviews-card {
  animation: fadeIn 0.6s ease forwards;
}

.reviews-card:nth-child(1) { animation-delay: 0.1s; }
.reviews-card:nth-child(2) { animation-delay: 0.2s; }

.rating-item,
.trend-item {
  animation: fadeIn 0.3s ease forwards;
}

/* Responsive Design */
@media (max-width: 960px) {
  .reviews-header .d-flex {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .header-actions {
    flex-direction: column;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .reviews-header h1 {
    font-size: 1.5rem;
  }
  
  .stat-card {
    margin-bottom: 1rem;
  }
  
  .reviews-card {
    margin-bottom: 1rem;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-chip) {
  transition: all 0.3s ease;
}

:deep(.v-chip:hover) {
  transform: translateY(-2px);
}

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.v-icon) {
  transition: all 0.3s ease;
}

:deep(.v-icon:hover) {
  transform: scale(1.1);
}

:deep(.v-rating) {
  transition: all 0.3s ease;
}

:deep(.v-rating:hover) {
  transform: scale(1.05);
}

:deep(.v-data-table) {
  transition: all 0.3s ease;
}

:deep(.v-data-table:hover) {
  transform: scale(1.01);
}

:deep(.v-dialog) {
  transition: all 0.3s ease;
}

:deep(.v-form) {
  transition: all 0.3s ease;
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: scale(1.02);
}

:deep(.v-select) {
  transition: all 0.3s ease;
}

:deep(.v-select:hover) {
  transform: scale(1.02);
}

:deep(.v-textarea) {
  transition: all 0.3s ease;
}

:deep(.v-textarea:hover) {
  transform: scale(1.01);
}

:deep(.v-progress-linear) {
  transition: all 0.3s ease;
}

:deep(.v-progress-linear:hover) {
  transform: scale(1.02);
}
</style>
