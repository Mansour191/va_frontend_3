<template>
  <v-card variant="elevated" class="product-faq mt-8">
    <!-- Header -->
    <v-card-title class="text-h5 font-weight-bold pa-6 pb-2">
      <v-icon color="primary" class="me-2">mdi-help-circle</v-icon>
      {{ $t('productFaq') || 'الأسئلة الشائعة حول هذا المنتج' }}
    </v-card-title>
    
    <!-- Loading State -->
    <v-card-text v-if="loading" class="text-center py-8">
      <v-progress-circular indeterminate color="primary" size="40" class="mb-4" />
      <p class="text-body-2 text-medium-emphasis">
        {{ $t('loadingFAQ') || 'جاري تحميل الأسئلة الشائعة...' }}
      </p>
    </v-card-text>
    
    <!-- FAQ Content -->
    <v-card-text v-else class="pa-6 pt-2">
      <!-- Search Bar -->
      <v-text-field
        v-model="searchQuery"
        :label="$t('searchFAQ') || 'ابحث في الأسئلة الشائعة'"
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        class="mb-6"
        clearable
        @input="searchFAQs"
      />
      
      <!-- FAQ Accordion -->
      <v-expansion-panels variant="accordion" class="mb-6" v-if="filteredFAQs.length > 0">
        <v-expansion-panel
          v-for="(item, index) in filteredFAQs"
          :key="item.id || index"
          :value="item.id || index"
        >
          <v-expansion-panel-title>
            <div class="d-flex align-center">
              <v-icon color="primary" class="me-3">mdi-help-circle-outline</v-icon>
              <span class="text-subtitle-1">{{ item.question }}</span>
            </div>
          </v-expansion-panel-title>
          
          <v-expansion-panel-text>
            <div class="text-body-2 text-medium-emphasis">
              {{ item.answer }}
            </div>
            
            <!-- Helpful Buttons -->
            <div class="d-flex align-center justify-space-between mt-4">
              <div class="d-flex ga-2">
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-thumb-up"
                  @click="markHelpful(item.id, 'yes')"
                  :color="item.helpful === 'yes' ? 'success' : 'default'"
                >
                  {{ $t('helpful') || 'مفيد' }}
                </v-btn>
                <v-btn
                  variant="text"
                  size="small"
                  prepend-icon="mdi-thumb-down"
                  @click="markHelpful(item.id, 'no')"
                  :color="item.helpful === 'no' ? 'error' : 'default'"
                >
                  {{ $t('notHelpful') || 'غير مفيد' }}
                </v-btn>
              </div>
              
              <v-btn
                variant="text"
                size="small"
                prepend-icon="mdi-share"
                @click="shareFAQ(item)"
              >
                {{ $t('share') || 'مشاركة' }}
              </v-btn>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      
      <!-- No Results -->
      <div v-else-if="searchQuery && filteredFAQs.length === 0" class="text-center py-8">
        <v-icon size="64" color="primary" class="mb-4 opacity-50">
          mdi-help-circle-outline
        </v-icon>
        <p class="text-body-1 text-medium-emphasis mb-4">
          {{ $t('noFAQResults') || 'لم يتم العثور على نتائج لبحثك' }}
        </p>
        <v-btn
          variant="outlined"
          prepend-icon="mdi-plus"
          @click="showQuestionForm = true"
        >
          {{ $t('askQuestion') || 'اطرح سؤالك' }}
        </v-btn>
      </div>
      
      <!-- Ask Question Section -->
      <v-card variant="outlined" class="ask-question-card mt-6">
        <v-card-title class="text-h6">
          <v-icon color="primary" class="me-2">mdi-message-question</v-icon>
          {{ $t('stillHaveQuestions') || 'لا تزال لديك أسئلة؟' }}
        </v-card-title>
        
        <v-card-text>
          <p class="text-body-2 text-medium-emphasis mb-4">
            {{ $t('askQuestionDesc') || 'اطرح سؤالك وسنجيبك في أقرب وقت ممكن' }}
          </p>
          
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-send"
            @click="showQuestionForm = true"
          >
            {{ $t('askQuestion') || 'اطرح سؤالك' }}
          </v-btn>
        </v-card-text>
      </v-card>
    </v-card-text>
    
    <!-- Quality Badges -->
    <v-card variant="outlined" class="trust-badges ma-6">
      <v-card-title class="text-h6 mb-4">
        <v-icon color="primary" class="me-2">mdi-shield-check</v-icon>
        {{ $t('qualityGuarantees') || 'ضمانات الجودة' }}
      </v-card-title>
      
      <v-card-text>
        <v-row justify="center" class="ga-4">
          <v-col cols="auto" class="d-flex align-center ga-2">
            <v-icon color="primary" size="large">mdi-certificate</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ $t('highQuality') || 'جودة عالية (A+)' }}
            </span>
          </v-col>
          <v-col cols="auto" class="d-flex align-center ga-2">
            <v-icon color="success" size="large">mdi-shield-check</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ $t('warranty') || 'ضمان 12 شهر' }}
            </span>
          </v-col>
          <v-col cols="auto" class="d-flex align-center ga-2">
            <v-icon color="info" size="large">mdi-hand-coin</v-icon>
            <span class="text-body-2 font-weight-medium">
              {{ $t('bestPrice') || 'أفضل سعر للـ م²' }}
            </span>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
    
    <!-- Question Form Dialog -->
    <v-dialog v-model="showQuestionForm" max-width="600">
      <v-card>
        <v-card-title class="text-h6 pa-4">
          <v-icon color="primary" class="me-2">mdi-message-question</v-icon>
          {{ $t('askQuestion') || 'اطرح سؤالك' }}
        </v-card-title>
        
        <v-card-text class="pa-4">
          <v-form ref="questionForm" @submit.prevent="submitQuestion">
            <v-text-field
              v-model="questionForm.name"
              :label="$t('yourName') || 'اسمك'"
              variant="outlined"
              prepend-inner-icon="mdi-account"
              :rules="nameRules"
              required
              class="mb-4"
            />
            
            <v-text-field
              v-model="questionForm.email"
              :label="$t('yourEmail') || 'بريدك الإلكتروني'"
              variant="outlined"
              prepend-inner-icon="mdi-email"
              type="email"
              :rules="emailRules"
              required
              class="mb-4"
            />
            
            <v-textarea
              v-model="questionForm.question"
              :label="$t('yourQuestion') || 'سؤالك'"
              variant="outlined"
              prepend-inner-icon="mdi-help"
              :rules="questionRules"
              required
              rows="4"
              class="mb-4"
            />
            
            <div class="d-flex ga-2">
              <v-btn
                color="primary"
                variant="elevated"
                type="submit"
                :loading="submitting"
                :disabled="!isQuestionFormValid"
              >
                {{ $t('submit') || 'إرسال' }}
              </v-btn>
              
              <v-btn
                variant="outlined"
                @click="showQuestionForm = false"
                :disabled="submitting"
              >
                {{ $t('cancel') || 'إلغاء' }}
              </v-btn>
            </div>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import FAQService from '@/integration/services/FAQService';

const { t } = useI18n();

// Props
const props = defineProps({
  productId: { type: String, required: true },
  category: { type: String, default: 'general' }
});

// State
const loading = ref(true);
const faqItems = ref([]);
const searchQuery = ref('');
const filteredFAQs = ref([]);
const showQuestionForm = ref(false);
const submitting = ref(false);

// Form state
const questionForm = reactive({
  name: '',
  email: '',
  question: ''
});

// Form validation rules
const nameRules = [
  v => !!v || (t('nameRequired') || 'الاسم مطلوب'),
  v => v.length >= 3 || (t('nameMinLength') || 'يجب أن يكون الاسم 3 أحرف على الأقل')
];

const emailRules = [
  v => !!v || (t('emailRequired') || 'البريد الإلكتروني مطلوب'),
  v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || (t('emailInvalid') || 'البريد الإلكتروني غير صالح')
];

const questionRules = [
  v => !!v || (t('questionRequired') || 'السؤال مطلوب'),
  v => v.length >= 10 || (t('questionMinLength') || 'يجب أن يكون السؤال 10 أحرف على الأقل')
];

// Computed
const isQuestionFormValid = computed(() => {
  return questionForm.name.length >= 3 &&
         /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(questionForm.email) &&
         questionForm.question.length >= 10;
});

// Methods
const loadFAQs = async () => {
  try {
    loading.value = true;
    
    const response = await FAQService.getFAQItems(props.productId, props.category);
    if (response.success) {
      faqItems.value = response.data;
      filteredFAQs.value = response.data;
    }
  } catch (error) {
    console.error('❌ Error loading FAQs:', error);
  } finally {
    loading.value = false;
  }
};

const searchFAQs = async () => {
  if (!searchQuery.value.trim()) {
    filteredFAQs.value = faqItems.value;
    return;
  }
  
  try {
    const response = await FAQService.searchFAQs(searchQuery.value, props.category);
    if (response.success) {
      filteredFAQs.value = response.data;
    }
  } catch (error) {
    console.error('❌ Error searching FAQs:', error);
    // Fallback to client-side search
    filteredFAQs.value = faqItems.value.filter(item => 
      item.question.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
};

const markHelpful = (faqId, helpful) => {
  const faq = faqItems.value.find(item => item.id === faqId);
  if (faq) {
    faq.helpful = helpful;
    // In a real app, you would send this to the API
    console.log(`✅ FAQ ${faqId} marked as ${helpful}`);
  }
};

const shareFAQ = async (item) => {
  try {
    const shareData = {
      title: t('shareFAQ') || 'مشاركة سؤال شائع',
      text: `${item.question}\n\n${item.answer}`,
      url: window.location.href
    };
    
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.text}\n\n${shareData.url}`);
      console.log('✅ FAQ copied to clipboard');
    }
  } catch (error) {
    console.error('❌ Error sharing FAQ:', error);
  }
};

const submitQuestion = async () => {
  if (!isQuestionFormValid.value) return;
  
  submitting.value = true;
  
  try {
    const questionData = {
      name: questionForm.name,
      email: questionForm.email,
      question: questionForm.question,
      productId: props.productId,
      category: props.category
    };
    
    const response = await FAQService.submitQuestion(questionData);
    
    if (response.success) {
      // Reset form
      questionForm.name = '';
      questionForm.email = '';
      questionForm.question = '';
      showQuestionForm.value = false;
      
      console.log('✅ Question submitted successfully');
      // In a real app, show a success notification
    } else {
      console.error('❌ Failed to submit question:', response.error);
    }
  } catch (error) {
    console.error('❌ Error submitting question:', error);
  } finally {
    submitting.value = false;
  }
};

// Watchers
watch(() => props.productId, () => {
  loadFAQs();
});

watch(() => props.category, () => {
  loadFAQs();
});

// Lifecycle
onMounted(() => {
  loadFAQs();
});
</script>

<style scoped>
.product-faq {
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.ask-question-card {
  background: rgba(var(--v-theme-surface-variant), 0.5);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.trust-badges {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

:deep(.v-expansion-panel-title) {
  font-weight: 600;
}

:deep(.v-expansion-panel-text) {
  padding-top: 16px;
}

:deep(.v-expansion-panel) {
  margin-bottom: 8px;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .product-faq {
    margin-top: 16px;
  }
  
  .trust-badges :deep(.v-col) {
    flex: 0 0 100%;
    margin-bottom: 8px;
  }
}
</style>

