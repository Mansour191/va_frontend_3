<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card elevation="4" class="overflow-hidden">
          <!-- Header -->
          <v-card-text class="pa-8 text-center bg-surface">
            <h1 class="text-h3 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
              <v-icon size="40" color="warning">mdi-help-circle</v-icon>
              {{ $t('faq') || 'الأسئلة الشائعة' }}
            </h1>
            <p class="text-h6 text-medium-emphasis">{{ $t('faqIntro') || 'إليك إجابات لأكثر الأسئلة شيوعاً من عملائنا' }}</p>
          </v-card-text>

          <!-- FAQ Accordion -->
          <v-card-text class="pa-8">
            <v-expansion-panels variant="accordion" class="mb-6">
              <v-expansion-panel
                v-for="(item, index) in faqItems"
                :key="index"
                :title="item.question"
                :text="item.answer"
              >
              </v-expansion-panel>
            </v-expansion-panels>

            <!-- Contact Section -->
            <v-card elevation="6" class="pa-6 bg-surface text-center">
              <h3 class="text-h5 font-weight-bold text-warning mb-4">{{ $t('stillHaveQuestions') || 'هل لديك أسئلة أخرى؟' }}</h3>
              <p class="text-body-1 text-medium-emphasis mb-6">{{ $t('contactUsFaq') || 'فريق دعمنا الفني جاهز للرد على استفساراتك عبر واتساب أو الهاتف.' }}</p>
              <div class="d-flex justify-center gap-4 flex-wrap">
                <v-btn
                  href="https://wa.me/213663140341"
                  target="_blank"
                  color="success"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-whatsapp"
                  class="text-none"
                >
                  واتساب
                </v-btn>
                <v-btn
                  to="/contact"
                  color="warning"
                  variant="elevated"
                  size="large"
                  prepend-icon="mdi-email"
                  class="text-none"
                >
                  اتصل بنا
                </v-btn>
              </div>
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

// FAQ Items - Dynamic loading from API
const faqItems = ref([]);

const fetchFAQItems = async () => {
  try {
    const response = await fetch('/api/faq/items');
    if (response.ok) {
      const data = await response.json();
      faqItems.value = data.map(item => ({
        question: item.question,
        answer: item.answer
      }));
    }
  } catch (error) {
    console.error('Failed to fetch FAQ items:', error);
    // Fallback to static data
    faqItems.value = [
      {
        question: t('faq1Q') || 'هل يمكنني طلب مقاسات مخصصة غير الموجودة في الموقع؟',
        answer: t('faq1A') || 'نعم بكل تأكيد! يمكنك إدخال المقاسات التي تناسب مساحتك (الطول والعرض) في صفحة تفاصيل المنتج، وسيتم حساب السعر تلقائياً.'
      },
      {
        question: t('faq2Q') || 'كيف يتم تثبيت الملصقات على الجدران؟',
        answer: t('faq2A') || 'الملصقات ذاتية اللصق وسهلة التركيب. سنرسل لك دليلاً مطبوعاً مع كل طلب يشرح خطوات التركيب بدقة، كما يمكنك مشاهدة فيديوهات توضيحية على صفحتنا.'
      },
      {
        question: t('faq3Q') || 'ما هي خامات الطباعة المستخدمة؟',
        answer: t('faq3A') || 'نستخدم أفضل خامات الفينيل (Vinyl) المستوردة، وهي مقاومة للماء والحرارة وسهلة التنظيف، وتدوم لسنوات طويلة دون أن تفقد ألوانها.'
      },
      {
        question: t('faq4Q') || 'هل توفرون خدمة التركيب؟',
        answer: t('faq4A') || 'حالياً نوفر خدمة التوصيل فقط، لكن تصاميمنا مصممة لتكون سهلة التركيب لغير المحترفين. كما يمكننا ترشيح فنيين في منطقتك إذا دعت الحاجة.'
      },
      {
        question: t('faq5Q') || 'ما هي مدة تجهيز الطلب؟',
        answer: t('faq5A') || 'يستغرق تجهيز الطلبات المخصصة من 24 إلى 48 ساعة قبل شحنها. الطلبات الجاهزة تُشحن فور تأكيدها.'
      }
    ];
  }
};

// Lifecycle
onMounted(() => {
  fetchFAQItems();
});
</script>

<style scoped>
/* Vuetify handles most styling */
</style>
