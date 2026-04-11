<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="4" class="overflow-hidden">
          <!-- Header -->
          <v-card-text class="pa-8 text-center bg-surface">
            <h1 class="text-h3 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
              <v-icon size="40" color="warning">mdi-cart</v-icon>
              {{ $t('howToOrder') || 'كيف أطلب' }}
            </h1>
            <p class="text-h6 text-medium-emphasis">{{ $t('howToOrderIntro') || 'خطوات بسيطة للحصول على تصاميمك المفضلة' }}</p>
          </v-card-text>

          <!-- Steps -->
          <v-card-text class="pa-8">
            <div class="steps-container">
              <v-timeline density="compact" side="end">
                <v-timeline-item
                  v-for="(step, index) in steps"
                  :key="index"
                  dot-color="warning"
                  size="large"
                >
                  <template #icon>
                    <span class="step-number">{{ index + 1 }}</span>
                  </template>
                  <v-card elevation="2" class="pa-4">
                    <h3 class="text-h5 font-weight-bold text-warning mb-2">{{ step.title }}</h3>
                    <p class="text-body-1 text-medium-emphasis">{{ step.description }}</p>
                  </v-card>
                </v-timeline-item>
              </v-timeline>
            </div>

            <!-- Help Section -->
            <v-card elevation="6" class="pa-6 mt-8 text-center" color="grey-lighten-5">
              <h4 class="text-h5 font-weight-bold mb-4">{{ $t('needHelp') || 'هل تحتاج لمساعدة؟' }}</h4>
              <p class="text-body-1 text-medium-emphasis mb-6">{{ $t('contactOurTeam') || 'فريقنا متاح دائماً لمساعدتك في عملية الطلب.' }}</p>
              <v-btn
                to="/contact"
                color="warning"
                variant="elevated"
                size="large"
                prepend-icon="mdi-email"
                class="text-none"
              >
                {{ $t('contactUs') }}
              </v-btn>
            </v-card>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Order Steps - Dynamic loading from API
const steps = ref([]);

const fetchOrderSteps = async () => {
  try {
    const response = await fetch('/api/how-to-order/steps');
    if (response.ok) {
      const data = await response.json();
      steps.value = data.map(step => ({
        title: step.title,
        description: step.description
      }));
    }
  } catch (error) {
    console.error('Failed to fetch order steps:', error);
    // Fallback to static data
    steps.value = [
      {
        title: t('step1Title') || 'اختر التصميم المناسب',
        description: t('step1Desc') || 'تصفح معرض الأعمال أو المتجر واختر التصميم الذي يعجبك.'
      },
      {
        title: t('step2Title') || 'حدد المقاسات والألوان',
        description: t('step2Desc') || 'أدخل الطول والعرض المطلوبين، واختر الألوان ونوعية الخامة المفضلة.'
      },
      {
        title: t('step3Title') || 'أضف للسلة وأتمم الطلب',
        description: t('step3Desc') || 'أضف المنتج لسلة التسوق ثم توجه لصفحة الدفع وأدخل بيانات الشحن.'
      },
      {
        title: t('step4Title') || 'تأكيد الطلب والتوصيل',
        description: t('step4Desc') || 'بمجرد تأكيد الطلب، سيقوم فريقنا بتجهيزه وشحنه إليك في أسرع وقت.'
      }
    ];
  }
};

// Lifecycle
onMounted(() => {
  fetchOrderSteps();
});
</script>

<style scoped>
/* Custom step number styling */
.step-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
  background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%);
  border-radius: 50%;
}
</style>
