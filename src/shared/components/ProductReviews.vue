<template>
  <v-card variant="elevated" class="product-reviews mt-5">
    <!-- Header -->
    <v-card-title class="d-flex justify-space-between align-center pa-4">
      <h4 class="text-h5 font-weight-bold mb-0">
        <v-icon color="warning" class="me-2">mdi-star</v-icon>
        {{ $t('reviews') || 'المراجعات والتقييمات' }} ({{ reviewsCount }})
      </h4>
      
      <div v-if="reviewsCount > 0" class="d-flex align-center">
        <span class="text-h4 font-weight-bold mb-0 me-2 text-warning">{{ averageRating }}</span>
        <div class="d-flex me-2">
          <v-icon
            v-for="i in 5"
            :key="i"
            :icon="i <= Math.round(averageRating) ? 'mdi-star' : 'mdi-star-outline'"
            :color="i <= Math.round(averageRating) ? 'warning' : 'grey-lighten-1'"
            size="20"
          />
        </div>
      </div>
    </v-card-title>
    
    <v-divider />
    
    <!-- Add Review Form -->
    <v-card-text class="pa-4">
      <v-card variant="outlined" class="add-review-card">
        <v-card-title class="text-h6">
          <v-icon color="primary" class="me-2">mdi-pencil-plus</v-icon>
          {{ $t('addReview') || 'أضف مراجعتك' }}
        </v-card-title>
        
        <v-card-text>
          <!-- Not Authenticated -->
          <div v-if="!isAuthenticated" class="text-center py-6">
            <v-icon size="64" color="primary" class="mb-4 opacity-50">
              mdi-account-lock
            </v-icon>
            <p class="text-body-1 text-medium-emphasis mb-4">
              {{ $t('loginToReview') || 'يجب تسجيل الدخول لإضافة تقييمك' }}
            </p>
            <v-btn
              to="/login"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-login"
            >
              {{ $t('login') || 'تسجيل الدخول' }}
            </v-btn>
          </div>
          
          <!-- Review Form -->
          <v-form v-else @submit.prevent="submitReview">
            <v-row>
              <v-col cols="12">
                <label class="text-subtitle-2 font-weight-medium mb-2 d-block">
                  <v-icon color="warning" class="me-1">mdi-star</v-icon>
                  {{ $t('rating') || 'تقييمك' }}
                </label>
                <div class="d-flex ga-1 mb-4">
                  <v-icon
                    v-for="i in 5"
                    :key="i"
                    :icon="i <= newReview.rating ? 'mdi-star' : 'mdi-star-outline'"
                    :color="i <= newReview.rating ? 'warning' : 'grey-lighten-1'"
                    size="32"
                    class="cursor-pointer transition-scale"
                    @click="newReview.rating = i"
                  />
                </div>
              </v-col>
              
              <v-col cols="12">
                <v-textarea
                  v-model="newReview.comment"
                  :label="$t('reviewPlaceholder') || 'اكتب رأيك في المنتج هنا...'"
                  variant="outlined"
                  rows="3"
                  auto-grow
                  required
                  prepend-inner-icon="mdi-comment-text"
                />
              </v-col>
              
              <v-col cols="12">
                <v-btn
                  type="submit"
                  color="primary"
                  variant="elevated"
                  prepend-icon="mdi-send"
                  :loading="submitting"
                  :disabled="!newReview.comment.trim()"
                >
                  {{ $t('submitReview') || 'إرسال المراجعة' }}
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-card-text>
    
    <v-divider />
    
    <!-- Reviews List -->
    <v-card-text class="pa-4">
      <div class="reviews-list">
        <!-- No Reviews -->
        <div v-if="reviews.length === 0" class="text-center py-8">
          <v-icon size="64" color="primary" class="mb-4 opacity-50">
            mdi-comment-text-multiple-outline
          </v-icon>
          <p class="text-body-1 text-medium-emphasis">
            {{ $t('noReviewsYet') || 'لا توجد مراجعات لهذا المنتج بعد.' }}
          </p>
          <p class="text-body-2 text-medium-emphasis">
            {{ $t('beFirstToReview') || 'كن أول من يقيّم هذا المنتج!' }}
          </p>
        </div>
        
        <!-- Reviews Items -->
        <div v-else>
          <v-card
            v-for="review in reviews"
            :key="review.id"
            variant="outlined"
            class="review-item mb-4"
          >
            <v-card-text class="pa-4">
              <div class="d-flex justify-space-between align-start mb-3">
                <div class="user-info">
                  <div class="d-flex align-center mb-2">
                    <v-avatar size="32" class="me-2">
                      <v-icon color="primary">mdi-account</v-icon>
                    </v-avatar>
                    <div>
                      <h6 class="text-subtitle-1 font-weight-bold mb-0">{{ review.userName }}</h6>
                      <div class="d-flex">
                        <v-icon
                          v-for="i in 5"
                          :key="i"
                          :icon="i <= review.rating ? 'mdi-star' : 'mdi-star-outline'"
                          :color="i <= review.rating ? 'warning' : 'grey-lighten-1'"
                          size="16"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="review-meta text-end">
                  <v-chip
                    :text="formatDate(review.date)"
                    variant="text"
                    size="small"
                    prepend-icon="mdi-calendar"
                    class="mb-2"
                  />
                  
                  <div>
                    <v-btn
                      v-if="!review.reported"
                      variant="text"
                      size="small"
                      prepend-icon="mdi-flag"
                      @click="reportReview(review.id)"
                      color="error"
                    >
                      {{ $t('report') || 'إبلاغ' }}
                    </v-btn>
                    
                    <v-chip
                      v-else
                      color="error"
                      variant="elevated"
                      size="small"
                      prepend-icon="mdi-alert"
                    >
                      {{ $t('reported') || 'تم الإبلاغ' }}
                    </v-chip>
                  </div>
                </div>
              </div>
              
              <p class="review-comment text-body-1 mb-0 text-medium-emphasis">
                {{ review.comment }}
              </p>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-card-text>
    
    <!-- Report Review Dialog -->
    <v-dialog v-model="reportDialog" max-width="500" persistent>
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon color="error" class="me-2">mdi-flag</v-icon>
          {{ t('reportReview') || 'إبلاغ عن مراجعة' }}
        </v-card-title>
        
        <v-card-text>
          <v-form ref="reportForm" @submit.prevent="submitReport">
            <v-select
              v-model="reportReason"
              :items="reportReasons"
              :label="t('selectReportReason') || 'اختر سبب الإبلاغ'"
              item-title="text"
              item-value="value"
              variant="outlined"
              :rules="[
                v => !!v || (t('reportReasonRequired') || 'يجب اختيار سبب للإبلاغ')
              ]"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            @click="reportDialog = false"
            :disabled="reportSubmitting"
            variant="text"
          >
            {{ t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn
            @click="submitReport"
            :loading="reportSubmitting"
            color="error"
            variant="elevated"
            prepend-icon="mdi-flag"
          >
            {{ t('submitReport') || 'إرسال البلاغ' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  productId: {
    type: String,
    required: true
  }
});

// State
const store = useStore();
const submitting = ref(false);
const loading = ref(true);

const newReview = ref({
  rating: 5,
  comment: ''
});

// Computed
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);
const reviews = computed(() => store.getters['reviews/getProductReviews'](props.productId));
const averageRating = computed(() => store.getters['reviews/getAverageRating'](props.productId));
const reviewsCount = computed(() => store.getters['reviews/getReviewsCount'](props.productId));

// Methods
const loadReviews = async () => {
  try {
    loading.value = true;
    await store.dispatch('reviews/loadReviews', props.productId);
  } catch (error) {
    console.error('❌ Error loading reviews:', error);
  } finally {
    loading.value = false;
  }
};

const submitReview = async () => {
  if (!newReview.value.comment.trim()) return;
  
  submitting.value = true;
  try {
    await store.dispatch('reviews/submitReview', {
      productId: props.productId,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    });
    
    // Reset form
    newReview.value = { rating: 5, comment: '' };
    
    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('reviewSubmitted') || 'تم إرسال التقييم',
      message: t('reviewSubmittedMessage') || 'شكراً لتقييمك، سيتم نشره بعد المراجعة',
      icon: 'mdi-check-circle',
      timeout: 3000
    });
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: error.message || t('reviewSubmitError') || 'فشل في إرسال التقييم',
      icon: 'mdi-alert-circle',
      timeout: 3000
    });
  } finally {
    submitting.value = false;
  }
};

// Report dialog state
const reportDialog = ref(false);
const selectedReviewId = ref(null);
const reportReason = ref('');
const reportSubmitting = ref(false);
const reportForm = ref();

// Predefined report reasons
const reportReasons = [
  { value: 'inappropriate_content', text: 'محتوى غير لائق' },
  { value: 'spam', text: 'رسائل مزعجة أو إعلانات' },
  { value: 'fake_review', text: 'مراجعة مزيفة' },
  { value: 'offensive_language', text: 'لغة مسيئة' },
  { value: 'irrelevant', text: 'محتوى غير متعلق بالمنتج' },
  { value: 'discrimination', text: 'تمييز أو تحريض' },
  { value: 'other', text: 'سبب آخر' }
];

const reportReview = (reviewId) => {
  selectedReviewId.value = reviewId;
  reportDialog.value = true;
};

const submitReport = async () => {
  const { valid } = await reportForm.value.validate();
  if (!valid) return;

  reportSubmitting.value = true;
  try {
    await store.dispatch('reviews/reportReview', {
      productId: props.productId,
      reviewId: selectedReviewId.value,
      reason: reportReason.value
    });
    
    reportDialog.value = false;
    reportReason.value = '';
    selectedReviewId.value = null;
    
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('reviewReported') || 'تم الإبلاغ',
      message: t('reviewReportedMessage') || 'شكراً لإبلاغك، سيقوم الفريق بمراجعة البلاغ',
      icon: 'mdi-flag',
      timeout: 3000
    });
  } catch (error) {
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: error.message || t('reportError') || 'فشل في إرسال البلاغ',
      icon: 'mdi-alert-circle',
      timeout: 3000
    });
  } finally {
    reportSubmitting.value = false;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  loadReviews();
});
</script>

<style scoped>
.product-reviews {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.add-review-card {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.review-item {
  transition: all 0.3s ease;
}

.review-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.1);
}

.cursor-pointer {
  cursor: pointer;
}

.transition-scale {
  transition: transform 0.2s ease;
}

.transition-scale:hover {
  transform: scale(1.2);
}

.review-comment {
  line-height: 1.6;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .review-meta {
    text-align: start !important;
    margin-top: 8px;
  }
  
  .d-flex.justify-space-between {
    flex-direction: column;
    align-items: flex-start !important;
  }
}
</style>
