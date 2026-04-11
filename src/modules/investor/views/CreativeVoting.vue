<template>
  <v-container class="pa-4">
    <!-- Header -->
    <v-card variant="elevated" class="mb-6 creative-header">
      <v-card-text class="pa-6">
        <div class="text-center">
          <h1 class="text-h3 font-weight-bold text-primary mb-2 d-flex align-center justify-center ga-3">
            <v-icon color="primary" size="40">mdi-vote</v-icon>
            {{ $t('creativeVoting') || 'التصويت الإبداعي | Creative Voting' }}
          </h1>
          <p class="text-body-1 text-medium-emphasis mb-0">
            {{ $t('votingSubtitle') || 'شارك في تشكيل مستقبل Paclos من خلال التصويت على التصاميم القادمة' }}
          </p>
        </div>
      </v-card-text>
    </v-card>

    <!-- Loading State -->
    <div v-if="loading" class="text-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
        class="mb-4"
      />
      <p class="text-body-1 text-medium-emphasis">{{ $t('loadingDesigns') || 'جاري تحميل التصاميم...' }}</p>
    </div>

    <!-- Error State -->
    <v-card v-else-if="error" variant="outlined" class="mb-6">
      <v-card-text class="pa-6 text-center">
        <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
        <h3 class="text-h6 font-weight-medium mb-2 text-error">{{ $t('errorLoadingDesigns') || 'خطأ في تحميل التصاميم' }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ error }}</p>
        <v-btn @click="loadDesigns" variant="elevated" color="primary">
          {{ $t('retry') || 'إعادة المحاولة' }}
        </v-btn>
      </v-card-text>
    </v-card>

    <!-- Main Content -->
    <div v-else>
      <!-- Designs Grid -->
      <v-row class="mb-8">
        <v-col
          v-for="design in designs"
          :key="design.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card variant="elevated" class="design-card">
            <div class="design-image-container">
              <v-img
                :src="design.image"
                :alt="design.title"
                height="200"
                cover
                class="design-image"
              >
                <template v-slot:placeholder>
                  <div class="d-flex align-center justify-center h-100">
                    <v-progress-circular indeterminate color="primary" />
                  </div>
                </template>
              </v-img>
              
              <div class="vote-overlay">
                <v-chip
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-vote"
                  class="vote-chip"
                >
                  {{ design.votes }} {{ $t('votes') || 'صوت' }}
                </v-chip>
              </div>
            </div>
            
            <v-card-text class="pa-4">
              <h3 class="text-h6 font-weight-medium mb-2">{{ design.title }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-4 line-clamp-2">{{ design.description }}</p>
              
              <v-btn
                @click="voteForDesign(design.id)"
                :disabled="hasVoted(design.id)"
                :loading="voting === design.id"
                variant="elevated"
                color="primary"
                block
                prepend-icon="mdi-plus"
              >
                <span v-if="hasVoted(design.id)">
                  <v-icon size="16" class="me-1">mdi-check</v-icon>
                  {{ $t('voted') || 'تم التصويت' }}
                </span>
                <span v-else>
                  {{ $t('voteForDesign') || 'تصويت لهذا التصميم' }}
                </span>
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Future Design Goal Section -->
      <v-card variant="elevated" class="goal-section">
        <v-card-text class="pa-6">
          <div class="text-center">
            <h2 class="text-h4 font-weight-bold text-primary mb-4">
              {{ $t('nextDesignGoal') || 'هدفنا القادم: 50 تصميماً ملكياً' }}
            </h2>
            
            <div class="max-w-2xl mx-auto">
              <div class="progress-section mb-4">
                <div class="text-caption text-medium-emphasis mb-2">
                  {{ $t('catalogProgress') || 'تم إنجاز' }} {{ catalogProgress }} {{ $t('of') || 'من أصل' }} 50 {{ $t('designsTargeted') || 'تصميماً مستهدفاً للكتالوج الأساسي' }}
                </div>
                <v-progress-linear
                  :model-value="(catalogProgress / 50) * 100"
                  color="primary"
                  height="8"
                  rounded
                >
                  <template v-slot:default="{ value }">
                    <strong>{{ Math.round(value) }}%</strong>
                  </template>
                </v-progress-linear>
              </div>
              
              <div class="d-flex justify-center ga-4 mb-4">
                <v-chip color="primary" variant="tonal">
                  <v-icon size="16" class="me-1">mdi-check-circle</v-icon>
                  {{ catalogProgress }} {{ $t('completed') || 'مكتمل' }}
                </v-chip>
                <v-chip color="grey" variant="tonal">
                  <v-icon size="16" class="me-1">mdi-clock-outline</v-icon>
                  {{ 50 - catalogProgress }} {{ $t('remaining') || 'متبقي' }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import InvestorService from '@/services/InvestorService';
import DesignsService from '@/services/DesignsService';

const { t } = useI18n();
const store = useStore();

// State
const loading = ref(true);
const error = ref(null);
const designs = ref([]);
const voting = ref(null);
const votedDesignIds = ref([]);
const catalogProgress = ref(0);

// Methods
const loadDesigns = async () => {
  try {
    loading.value = true;
    error.value = null;

    // Fetch designs from API
    const result = await InvestorService.getDraftDesigns();
    if (result.success) {
      designs.value = result.data;
    } else {
      throw new Error(result.message);
    }

    // Fetch voting status
    const votingResult = await InvestorService.getVotingStatus();
    if (votingResult.success) {
      votedDesignIds.value = votingResult.data.votedDesignIds || [];
    }

    // Fetch catalog progress
    const progressResult = await InvestorService.getCatalogProgress();
    if (progressResult.success) {
      catalogProgress.value = progressResult.data.progress || 0;
    }

    // Show success notification
    store.dispatch('notifications/add', {
      type: 'success',
      title: t('designsLoaded') || 'تم تحميل التصاميم',
      message: t('designsLoadedMessage') || 'تم تحميل التصاميم بنجاح',
      timeout: 3000
    });

  } catch (err) {
    console.error('Error loading designs:', err);
    error.value = err.message || t('failedToLoadDesigns') || 'فشل في تحميل التصاميم';
    
    // Use fallback mock data
    designs.value = [
      {
        id: 1,
        title: t('design1Title') || 'تصميم جدران عصري',
        description: t('design1Desc') || 'تصميم مبتكر يجمع بين الفن الحديث والتراث الجزائري',
        image: '/api/placeholder/400/300',
        votes: 45
      },
      {
        id: 2,
        title: t('design2Title') || 'ملصقات أبواب كلاسيكية',
        description: t('design2Desc') || 'تصاميم كلاسيكية منقحة بلمسة عصرية',
        image: '/api/placeholder/400/300',
        votes: 38
      },
      {
        id: 3,
        title: t('design3Title') || 'أثاث مبتكر',
        description: t('design3Desc') || 'تصاميم أثاث فريدة تجمع بين الجمال والوظيفة',
        image: '/api/placeholder/400/300',
        votes: 52
      }
    ];
    votedDesignIds.value = [];
    catalogProgress.value = 35;

    // Show warning notification
    store.dispatch('notifications/add', {
      type: 'warning',
      title: t('usingMockData') || 'استخدام بيانات وهمية',
      message: t('usingMockDesigns') || 'جاري استخدام بيانات وهمية للتصاميم',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

const voteForDesign = async (designId) => {
  try {
    voting.value = designId;

    // Submit vote to API
    const result = await InvestorService.voteForDesign(designId);
    if (result.success) {
      // Update local state
      votedDesignIds.value.push(designId);
      
      // Update design votes
      const design = designs.value.find(d => d.id === designId);
      if (design) {
        design.votes++;
      }

      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: t('voteSubmitted') || 'تم تقديم التصويت',
        message: t('voteSubmittedMessage') || 'شكراً لمشاركتك في التصويت',
        timeout: 3000
      });
    } else {
      throw new Error(result.message);
    }
  } catch (err) {
    console.error('Error voting:', err);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('voteFailed') || 'فشل التصويت',
      message: err.message || t('voteFailedMessage') || 'فشل في تقديم التصويت',
      timeout: 5000
    });
  } finally {
    voting.value = null;
  }
};

const hasVoted = (designId) => {
  return votedDesignIds.value.includes(designId);
};

// Computed
const totalVotes = computed(() => {
  return designs.value.reduce((total, design) => total + design.votes, 0);
});

const votingProgress = computed(() => {
  return designs.value.length > 0 ? (votedDesignIds.value.length / designs.value.length) * 100 : 0;
});

// Lifecycle
onMounted(() => {
  loadDesigns();
});
</script>

<style scoped>
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

/* Header */
.creative-header {
  animation: fadeIn 0.5s ease;
}

/* Design Cards */
.design-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.design-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.design-image-container {
  position: relative;
  overflow: hidden;
}

.design-image {
  transition: transform 0.6s ease;
}

.design-card:hover .design-image {
  transform: scale(1.05);
}

.vote-overlay {
  position: absolute;
  top: 12px;
  right: 12px;
}

.vote-chip {
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
}

/* Goal Section */
.goal-section {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.1), rgba(212, 175, 55, 0.05));
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.progress-section {
  max-width: 600px;
  margin: 0 auto;
}

/* Text utilities */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .text-center {
    text-align: center;
  }
  
  .max-w-2xl {
    max-width: 100%;
  }
}

/* Loading states */
.v-progress-circular {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
