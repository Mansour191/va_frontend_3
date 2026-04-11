<template>
  <v-container fluid class="review-section pa-4">
    <!-- Review Summary -->
    <v-row v-if="reviews.length > 0" class="mb-6">
      <v-col cols="12" md="4">
        <v-card class="text-center pa-4" elevation="2">
          <div class="text-h2 font-weight-bold primary--text mb-2">
            {{ averageRating.toFixed(1) }}
          </div>
          <v-rating
            :model-value="averageRating"
            color="amber"
            density="compact"
            half-increments
            readonly
            size="large"
          ></v-rating>
          <div class="text-caption text-medium-emphasis mt-1">
            {{ totalReviews }} {{ $t('reviews.totalReviews') }}
          </div>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="8">
        <v-card class="pa-4" elevation="2">
          <div class="text-h6 mb-3">{{ $t('reviews.ratingDistribution') }}</div>
          <div v-for="star in 5" :key="star" class="d-flex align-center mb-2">
            <span class="me-2" style="min-width: 30px;">{{ 6 - star }}</span>
            <v-icon class="me-2" color="amber" size="small">mdi-star</v-icon>
            <v-progress-linear
              :model-value="getRatingPercentage(6 - star)"
              color="amber"
              height="8"
              rounded
            ></v-progress-linear>
            <span class="ms-2 text-caption" style="min-width: 40px;">
              {{ getRatingCount(6 - star) }}
            </span>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Review Form -->
    <v-card v-if="isAuthenticated && !userReview" class="mb-6" elevation="2">
      <v-card-title class="text-h6">
        {{ $t('reviews.writeReview') }}
      </v-card-title>
      <v-card-text>
        <v-form @submit.prevent="submitReview" ref="reviewForm">
          <v-row>
            <v-col cols="12">
              <v-rating
                v-model="newReview.rating"
                :label="$t('reviews.rating')"
                color="amber"
                hover
                size="large"
                class="mb-2"
              ></v-rating>
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="newReview.comment"
                :label="$t('reviews.comment')"
                :rules="commentRules"
                rows="3"
                auto-grow
                variant="outlined"
                counter="500"
              ></v-textarea>
            </v-col>
            <v-col cols="12">
              <v-btn
                type="submit"
                :loading="isSubmitting"
                color="primary"
                :disabled="!newReview.rating"
              >
                {{ $t('reviews.submitReview') }}
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- User's Existing Review -->
    <v-card v-if="userReview" class="mb-6" elevation="2" color="blue-grey-lighten-5">
      <v-card-title class="text-h6">
        {{ $t('reviews.yourReview') }}
      </v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="12">
            <v-rating
              :model-value="userReview.rating"
              color="amber"
              density="compact"
              readonly
              size="small"
            ></v-rating>
          </v-col>
          <v-col cols="12" v-if="userReview.comment">
            <p class="text-body-1">{{ userReview.comment }}</p>
          </v-col>
          <v-col cols="12">
            <v-btn
              @click="editReview"
              variant="outlined"
              color="primary"
              size="small"
            >
              {{ $t('reviews.editReview') }}
            </v-btn>
            <v-btn
              @click="deleteReview"
              variant="outlined"
              color="error"
              size="small"
              class="ms-2"
            >
              {{ $t('reviews.deleteReview') }}
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Reviews List -->
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <h3 class="text-h6">{{ $t('reviews.customerReviews') }}</h3>
          <v-select
            v-model="sortBy"
            :items="sortOptions"
            :label="$t('reviews.sortBy')"
            variant="outlined"
            density="compact"
            style="max-width: 200px;"
            hide-details
          ></v-select>
        </div>

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <div class="mt-2">{{ $t('common.loading') }}</div>
        </div>

        <div v-else-if="sortedReviews.length === 0" class="text-center py-8">
          <v-icon size="large" color="grey-lighten-1">mdi-comment-text-outline</v-icon>
          <div class="text-h6 mt-2">{{ $t('reviews.noReviews') }}</div>
          <div class="text-body-2 text-medium-emphasis">
            {{ $t('reviews.beFirstToReview') }}
          </div>
        </div>

        <v-card
          v-else
          v-for="review in sortedReviews"
          :key="review.id"
          class="mb-4"
          elevation="2"
        >
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <div class="d-flex justify-space-between align-start mb-2">
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ review.user?.first_name || $t('reviews.anonymousUser') }}
                    </div>
                    <v-rating
                      :model-value="review.rating"
                      color="amber"
                      density="compact"
                      readonly
                      size="small"
                    ></v-rating>
                  </div>
                  <div class="text-end">
                    <v-chip
                      v-if="review.isVerified"
                      color="success"
                      size="x-small"
                      variant="elevated"
                    >
                      <v-icon start size="x-small">mdi-check-circle</v-icon>
                      {{ $t('reviews.verified') }}
                    </v-chip>
                    <div class="text-caption text-medium-emphasis mt-1">
                      {{ formatDate(review.createdAt) }}
                    </div>
                  </div>
                </div>

                <p v-if="review.comment" class="text-body-1 mb-3">
                  {{ review.comment }}
                </p>

                <div class="d-flex align-center justify-space-between">
                  <div class="d-flex align-center">
                    <v-btn
                      @click="markHelpful(review.id)"
                      :loading="helpfulLoading[review.id]"
                      variant="text"
                      size="small"
                      color="primary"
                      prepend-icon="mdi-thumb-up-outline"
                    >
                      {{ $t('reviews.helpful') }} ({{ review.helpfulCount }})
                    </v-btn>
                    
                    <v-btn
                      @click="reportReview(review.id)"
                      variant="text"
                      size="small"
                      color="error"
                      prepend-icon="mdi-flag-outline"
                      class="ms-2"
                    >
                      {{ $t('reviews.report') }}
                    </v-btn>
                  </div>

                  <v-btn
                    v-if="isAuthenticated && review.user?.id === currentUserId"
                    @click="editReview(review)"
                    variant="text"
                    size="small"
                    icon="mdi-pencil"
                  ></v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Report Dialog -->
    <v-dialog v-model="reportDialog" max-width="500">
      <v-card>
        <v-card-title>{{ $t('reviews.reportReview') }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="submitReport" ref="reportForm">
            <v-textarea
              v-model="reportReason"
              :label="$t('reviews.reportReason')"
              :rules="reportRules"
              rows="3"
              auto-grow
              variant="outlined"
              required
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="reportDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            @click="submitReport"
            :loading="reportSubmitting"
            color="error"
          >
            {{ $t('reviews.submitReport') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Review Dialog -->
    <v-dialog v-model="editDialog" max-width="600">
      <v-card>
        <v-card-title>{{ $t('reviews.editReview') }}</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="updateReview" ref="editForm">
            <v-rating
              v-model="editingReview.rating"
              :label="$t('reviews.rating')"
              color="amber"
              hover
              size="large"
              class="mb-4"
            ></v-rating>
            <v-textarea
              v-model="editingReview.comment"
              :label="$t('reviews.comment')"
              :rules="commentRules"
              rows="3"
              auto-grow
              variant="outlined"
              counter="500"
            ></v-textarea>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="editDialog = false">{{ $t('common.cancel') }}</v-btn>
          <v-btn
            @click="updateReview"
            :loading="editSubmitting"
            color="primary"
          >
            {{ $t('common.save') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'
import { useReviewsStore } from '@/stores/reviews'
import { useToast } from 'vuetify'

// Props
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  }
})

// Composables
const store = useStore()
const { t } = useI18n()
const reviewsStore = useReviewsStore()
const toast = useToast()

// Reactive data
const loading = ref(false)
const isSubmitting = ref(false)
const helpfulLoading = ref({})
const reportSubmitting = ref(false)
const editSubmitting = ref(false)
const sortBy = ref('newest')
const reportDialog = ref(false)
const editDialog = ref(false)
const selectedReviewId = ref(null)
const reportReason = ref('')

// New review form
const newReview = ref({
  rating: 0,
  comment: ''
})

// Editing review
const editingReview = ref({
  id: null,
  rating: 0,
  comment: ''
})

// Form refs
const reviewForm = ref()
const reportForm = ref()
const editForm = ref()

// Validation rules
const commentRules = [
  v => (v || '').length <= 500 || t('reviews.commentTooLong')
]

const reportRules = [
  v => !!v || t('reviews.reportReasonRequired'),
  v => (v || '').length >= 10 || t('reviews.reportReasonTooShort')
]

// Sort options
const sortOptions = [
  { title: t('reviews.newestFirst'), value: 'newest' },
  { title: t('reviews.oldestFirst'), value: 'oldest' },
  { title: t('reviews.highestRating'), value: 'rating_desc' },
  { title: t('reviews.lowestRating'), value: 'rating_asc' },
  { title: t('reviews.mostHelpful'), value: 'helpful' }
]

// Computed properties
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated'])
const currentUserId = computed(() => store.getters['auth/user']?.id)

const reviews = computed(() => reviewsStore.reviews)
const userReview = computed(() => reviewsStore.userReview)

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, review) => acc + review.rating, 0)
  return sum / reviews.value.length
})

const totalReviews = computed(() => reviews.value.length)

const sortedReviews = computed(() => {
  const sorted = [...reviews.value]
  
  switch (sortBy.value) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'rating_desc':
      return sorted.sort((a, b) => b.rating - a.rating)
    case 'rating_asc':
      return sorted.sort((a, b) => a.rating - b.rating)
    case 'helpful':
      return sorted.sort((a, b) => b.helpfulCount - a.helpfulCount)
    default:
      return sorted
  }
})

// Methods
const loadReviews = async () => {
  loading.value = true
  try {
    await reviewsStore.fetchProductReviews(props.productId)
    if (isAuthenticated.value) {
      await reviewsStore.fetchUserReview(props.productId)
    }
  } catch (error) {
    console.error('Error loading reviews:', error)
    toast.error(t('reviews.errorLoadingReviews'))
  } finally {
    loading.value = false
  }
}

const submitReview = async () => {
  const { valid } = await reviewForm.value.validate()
  if (!valid) return

  isSubmitting.value = true
  try {
    await reviewsStore.submitReview({
      productId: props.productId,
      rating: newReview.value.rating,
      comment: newReview.value.comment
    })
    
    // Reset form
    newReview.value = { rating: 0, comment: '' }
    reviewForm.value.reset()
    
    toast.success(t('reviews.reviewSubmitted'))
    await loadReviews()
  } catch (error) {
    console.error('Error submitting review:', error)
    toast.error(error.message || t('reviews.errorSubmittingReview'))
  } finally {
    isSubmitting.value = false
  }
}

const markHelpful = async (reviewId) => {
  helpfulLoading.value[reviewId] = true
  try {
    await reviewsStore.markReviewHelpful(reviewId)
    toast.success(t('reviews.markedHelpful'))
    await loadReviews()
  } catch (error) {
    console.error('Error marking review as helpful:', error)
    toast.error(t('reviews.errorMarkingHelpful'))
  } finally {
    helpfulLoading.value[reviewId] = false
  }
}

const reportReview = (reviewId) => {
  selectedReviewId.value = reviewId
  reportDialog.value = true
}

const submitReport = async () => {
  const { valid } = await reportForm.value.validate()
  if (!valid) return

  reportSubmitting.value = true
  try {
    await reviewsStore.reportReview({
      reviewId: selectedReviewId.value,
      reason: reportReason.value
    })
    
    reportDialog.value = false
    reportReason.value = ''
    selectedReviewId.value = null
    
    toast.success(t('reviews.reviewReported'))
  } catch (error) {
    console.error('Error reporting review:', error)
    toast.error(error.message || t('reviews.errorReportingReview'))
  } finally {
    reportSubmitting.value = false
  }
}

const editReview = (review = null) => {
  if (review) {
    editingReview.value = {
      id: review.id,
      rating: review.rating,
      comment: review.comment || ''
    }
  } else if (userReview.value) {
    editingReview.value = {
      id: userReview.value.id,
      rating: userReview.value.rating,
      comment: userReview.value.comment || ''
    }
  }
  editDialog.value = true
}

const updateReview = async () => {
  const { valid } = await editForm.value.validate()
  if (!valid) return

  editSubmitting.value = true
  try {
    await reviewsStore.updateReview({
      reviewId: editingReview.value.id,
      rating: editingReview.value.rating,
      comment: editingReview.value.comment
    })
    
    editDialog.value = false
    editingReview.value = { id: null, rating: 0, comment: '' }
    
    toast.success(t('reviews.reviewUpdated'))
    await loadReviews()
  } catch (error) {
    console.error('Error updating review:', error)
    toast.error(error.message || t('reviews.errorUpdatingReview'))
  } finally {
    editSubmitting.value = false
  }
}

const deleteReview = async () => {
  if (!confirm(t('reviews.confirmDeleteReview'))) return

  try {
    await reviewsStore.deleteReview(userReview.value.id)
    toast.success(t('reviews.reviewDeleted'))
    await loadReviews()
  } catch (error) {
    console.error('Error deleting review:', error)
    toast.error(error.message || t('reviews.errorDeletingReview'))
  }
}

const getRatingCount = (rating) => {
  return reviews.value.filter(review => review.rating === rating).length
}

const getRatingPercentage = (rating) => {
  if (reviews.value.length === 0) return 0
  return (getRatingCount(rating) / reviews.value.length) * 100
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

// Lifecycle
onMounted(() => {
  loadReviews()
})

watch(() => props.productId, () => {
  loadReviews()
})

watch(isAuthenticated, (newValue) => {
  if (newValue) {
    loadReviews()
  }
})
</script>

<style scoped>
.review-section {
  background-color: transparent;
}

.v-rating {
  display: inline-flex;
}

.text-medium-emphasis {
  opacity: 0.7;
}
</style>
