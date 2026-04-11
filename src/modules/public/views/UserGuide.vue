<template>
  <v-container class="py-8">
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <!-- Header -->
        <v-card elevation="4" class="overflow-hidden mb-8">
          <v-card-text class="pa-8 text-center bg-surface">
            <h1 class="text-h3 font-weight-bold text-warning mb-4 d-flex align-center justify-center gap-3">
              <v-icon size="40" color="warning">mdi-book-open-variant</v-icon>
              {{ $t('userGuide') || 'دليل المستخدم للمبتدئين' }}
            </h1>
            <p class="text-h6 text-medium-emphasis">{{ $t('userGuideIntro') || 'كل ما تحتاجه لتبدأ رحلتك مع فينيل آرت باحترافية' }}</p>
          </v-card-text>
        </v-card>

        <!-- Beginner's Steps -->
        <v-card elevation="4" class="mb-8">
          <v-card-text class="pa-8">
            <h2 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center gap-3">
              <v-icon size="32" color="warning">mdi-rocket</v-icon>
              البداية السريعة
            </h2>
            <v-row>
              <v-col
                v-for="(step, index) in steps"
                :key="index"
                cols="12"
                md="4"
              >
                <v-card elevation="2" class="pa-6 text-center h-100">
                  <div class="step-num mb-4">{{ index + 1 }}</div>
                  <v-icon :icon="step.icon" size="48" color="warning" class="mb-4"></v-icon>
                  <h5 class="text-h5 font-weight-bold mb-3">{{ step.title }}</h5>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ step.desc }}</p>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Video Tutorials -->
        <v-card elevation="4" class="mb-8">
          <v-card-text class="pa-8">
            <h2 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center gap-3">
              <v-icon size="32" color="warning">mdi-play-circle</v-icon>
              دروس فيديو تعليمية
            </h2>
            <v-row>
              <v-col
                v-for="(video, index) in tutorials"
                :key="index"
                cols="12"
                md="6"
              >
                <v-card elevation="2" class="h-100">
                  <div class="video-wrapper">
                    <v-img
                      :src="video.thumbnail"
                      aspect-ratio="16/9"
                      cover
                      class="video-thumbnail"
                    >
                      <template #placeholder>
                        <v-skeleton-loader type="image"></v-skeleton-loader>
                      </template>
                    </v-img>
                    <div class="play-overlay">
                      <v-btn
                        icon="mdi-play"
                        size="large"
                        color="warning"
                        variant="elevated"
                        class="play-button"
                      ></v-btn>
                    </div>
                  </div>
                      <v-card-text class="pa-4">
                    <h5 class="text-h5 font-weight-bold text-warning mb-2">{{ video.title }}</h5>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ video.desc }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Trusted & Quality Badges -->
        <v-card elevation="6" class="pa-8 text-center bg-surface">
          <h3 class="text-h4 font-weight-bold text-warning mb-6 d-flex align-center justify-center gap-3">
            <v-icon size="32" color="warning">mdi-award</v-icon>
            ضمان الجودة والموثوقية
          </h3>
          <v-row justify="center">
            <v-col cols="12" sm="6" md="4">
              <div class="badge-item text-center pa-4">
                <v-icon size="64" color="success" class="mb-4">mdi-check-circle</v-icon>
                <h6 class="text-h6 font-weight-bold mb-2">موثوق ومجرب</h6>
                <p class="text-body-2 text-medium-emphasis mb-0">أكثر من 5000+ عميل راضٍ</p>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="badge-item text-center pa-4">
                <v-icon size="64" color="warning" class="mb-4">mdi-shield-check</v-icon>
                <h6 class="text-h6 font-weight-bold mb-2">ضمان لمدة سنة</h6>
                <p class="text-body-2 text-medium-emphasis mb-0">على جميع أنواع الطباعة</p>
              </div>
            </v-col>
            <v-col cols="12" sm="6" md="4">
              <div class="badge-item text-center pa-4">
                <v-icon size="64" color="info" class="mb-4">mdi-hand-heart</v-icon>
                <h6 class="text-h6 font-weight-bold mb-2">صديق للبيئة</h6>
                <p class="text-body-2 text-medium-emphasis mb-0">خامات غير سامة وآمنة</p>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// User Guide Steps - Dynamic loading from API
const steps = ref([]);

const fetchUserGuideSteps = async () => {
  try {
    const response = await fetch('/api/user-guide/steps');
    if (response.ok) {
      const data = await response.json();
      steps.value = data.map(step => ({
        icon: step.icon || 'mdi-help-circle',
        title: step.title,
        desc: step.description
      }));
    }
  } catch (error) {
    console.error('Failed to fetch user guide steps:', error);
    // Fallback to static data
    steps.value = [
      { icon: 'mdi-account-plus', title: 'إنشاء حساب', desc: 'قم بإنشاء حسابك لتتبع طلباتك والحصول على خصومات حصرية.' },
      { icon: 'mdi-magnify', title: 'تصفح التصاميم', desc: 'استخدم محرك البحث المتقدم للعثور على ما يناسب ذوقك.' },
      { icon: 'mdi-pencil-ruler', title: 'التخصيص', desc: 'أدخل مقاساتك الخاصة واختر الألوان المناسبة لمساحتك.' }
    ];
  }
};

// Tutorials - Dynamic loading from API
const tutorials = ref([]);

const fetchTutorials = async () => {
  try {
    const response = await fetch('/api/user-guide/tutorials');
    if (response.ok) {
      const data = await response.json();
      tutorials.value = data.map(tutorial => ({
        title: tutorial.title,
        desc: tutorial.description,
        thumbnail: tutorial.thumbnail_url || 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
        embedUrl: tutorial.embed_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }));
    }
  } catch (error) {
    console.error('Failed to fetch tutorials:', error);
    // Fallback to static data
    tutorials.value = [
      { 
        title: 'كيفية أخذ المقاسات بدقة', 
        desc: 'تعلم الطريقة الصحيحة لقياس الجدران والأسطح لتجنب أي أخطاء في الطلب.',
        thumbnail: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      },
      { 
        title: 'طريقة تركيب الفينيل المخصص', 
        desc: 'خطوات بسيطة وسهلة لتركيب ملصقات الفينيل على الجدران دون فقاعات هواء.',
        thumbnail: 'https://i.postimg.cc/htCcH3cZ/table1.png',
        embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
      }
    ];
  }
};

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchUserGuideSteps(),
    fetchTutorials()
  ]);
});
</script>

<style scoped>
/* Vuetify handles most styling */
.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 1.2rem;
  font-weight: 800;
  color: #000;
  background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%);
  border-radius: 50%;
  margin: 0 auto;
}

.video-wrapper {
  position: relative;
}

.play-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.play-button:hover {
  transform: scale(1.1);
  transition: transform 0.3s ease;
}
</style>
