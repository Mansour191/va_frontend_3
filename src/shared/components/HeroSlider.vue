<template>
  <v-card class="hero-slider" elevation="8">
    <v-carousel
      v-model="currentSlide"
      :show-arrows="false"
      :cycle="true"
      :interval="15000"
      height="500"
      hide-delimiter-background
      class="custom-carousel"
      :continuous="true"
    >
      <v-carousel-item
        v-for="(slide, index) in slides"
        :key="`slide-${index}`"
        :src="slide.image"
        cover
      >
        <!-- Overlay for better text visibility -->
        <div class="carousel-overlay"></div>
        
        <!-- Slide Content -->
        <v-container class="fill-height">
          <v-row
            justify="center"
            align="center"
            class="fill-height"
          >
            <v-col
              cols="12"
              md="8"
              lg="6"
              class="text-center"
            >
              <!-- Category Badge -->
              <v-chip
                class="mb-4 category-chip"
                color="warning"
                variant="elevated"
                size="small"
              >
                <v-icon start :icon="slide.icon"></v-icon>
                {{ $t(slide.categoryKey) }}
              </v-chip>

              <!-- Title -->
              <h1 class="slide-title mb-4">
                {{ $t(slide.titleKey) }}
              </h1>

              <!-- Description -->
              <p class="slide-description mb-6">
                {{ $t(slide.descKey) }}
              </p>

              <!-- Action Buttons -->
              <div class="d-flex flex-column flex-md-row gap-3 justify-center">
                <!-- Primary Button -->
                <v-btn
                  v-if="!isExternalLink(slide.btn1Link)"
                  :to="slide.btn1Link"
                  color="warning"
                  variant="elevated"
                  size="large"
                  class="action-btn"
                >
                  <v-icon start :icon="slide.btn1Icon"></v-icon>
                  {{ $t(slide.btn1Key) }}
                </v-btn>
                
                <v-btn
                  v-else
                  :href="slide.btn1Link"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="warning"
                  variant="elevated"
                  size="large"
                  class="action-btn"
                >
                  <v-icon start :icon="slide.btn1Icon"></v-icon>
                  {{ $t(slide.btn1Key) }}
                </v-btn>

                <!-- Secondary Button -->
                <v-btn
                  v-if="!isExternalLink(slide.btn2Link)"
                  :to="slide.btn2Link"
                  color="white"
                  variant="outlined"
                  size="large"
                  class="action-btn"
                >
                  <v-icon start :icon="slide.btn2Icon"></v-icon>
                  {{ $t(slide.btn2Key) }}
                </v-btn>
                
                <v-btn
                  v-else
                  :href="slide.btn2Link"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="white"
                  variant="outlined"
                  size="large"
                  class="action-btn"
                >
                  <v-icon start :icon="slide.btn2Icon"></v-icon>
                  {{ $t(slide.btn2Key) }}
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-container>
      </v-carousel-item>
    </v-carousel>

    <!-- Custom Navigation Controls -->
    <v-btn
      class="nav-btn nav-prev"
      icon="mdi-chevron-left"
      variant="elevated"
      color="rgba(0,0,0,0.7)"
      @click="prevSlide"
    ></v-btn>
    
    <v-btn
      class="nav-btn nav-next"
      icon="mdi-chevron-right"
      variant="elevated"
      color="rgba(0,0,0,0.7)"
      @click="nextSlide"
    ></v-btn>

    <!-- Custom Indicators -->
    <div class="custom-indicators">
      <v-progress-linear
        :model-value="progressWidth"
        color="warning"
        height="3"
        rounded
        class="mb-2"
      ></v-progress-linear>
      
      <div class="d-flex align-center gap-3">
        <!-- Dots -->
        <div class="d-flex gap-1">
          <v-btn
            v-for="(slide, index) in slides"
            :key="`dot-${index}`"
            :icon="false"
            :color="currentSlide === index ? 'warning' : 'rgba(255,255,255,0.3)'"
            :variant="currentSlide === index ? 'flat' : 'text'"
            size="small"
            class="dot-btn"
            @click="goToSlide(index)"
          >
            <v-icon size="8">mdi-circle</v-icon>
          </v-btn>
        </div>
        
        <!-- Counter -->
        <span class="text-caption font-weight-medium">
          <span class="text-warning">{{ currentSlideDisplay }}</span>
          <span class="mx-1">/</span>
          <span>{{ totalSlidesDisplay }}</span>
        </span>
      </div>
    </div>
  </v-card>
</template>

<script>
export default {
  name: 'HeroSlider',
  data() {
    return {
      currentSlide: 0,
      slides: [
        {
          image: 'https://images.unsplash.com/photo-1616486338817-5719a7495c2b?w=1200&h=600&fit=crop',
          icon: 'mdi-sofa',
          categoryKey: 'slide1Category',
          titleKey: 'slide1Title',
          descKey: 'slide1Desc',
          btn1Key: 'slide1Btn1',
          btn1Icon: 'mdi-magnify',
          btn1Link: '/gallery',
          btn2Key: 'slide1Btn2',
          btn2Icon: 'mdi-phone',
          btn2Link: '/contact',
        },
        {
          image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=600&fit=crop',
          icon: 'mdi-roller-brush',
          categoryKey: 'slide2Category',
          titleKey: 'slide2Title',
          descKey: 'slide2Desc',
          btn1Key: 'slide2Btn1',
          btn1Icon: 'mdi-image',
          btn1Link: '/gallery?category=walls',
          btn2Key: 'slide2Btn2',
          btn2Icon: 'mdi-information',
          btn2Link: '/about',
        },
        {
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop',
          icon: 'mdi-silverware',
          categoryKey: 'slide3Category',
          titleKey: 'slide3Title',
          descKey: 'slide3Desc',
          btn1Key: 'slide3Btn1',
          btn1Icon: 'mdi-silverware',
          btn1Link: '/gallery?category=kitchens',
          btn2Key: 'slide3Btn2',
          btn2Icon: 'mdi-whatsapp',
          btn2Link: 'https://wa.me/213663140341',
        },
        {
          image: 'https://images.unsplash.com/photo-1554997174-93d5bb26f0c6?w=1200&h=600&fit=crop',
          icon: 'mdi-door-open',
          categoryKey: 'slide4Category',
          titleKey: 'slide4Title',
          descKey: 'slide4Desc',
          btn1Key: 'slide4Btn1',
          btn1Icon: 'mdi-door-open',
          btn1Link: '/gallery?category=doors',
          btn2Key: 'slide4Btn2',
          btn2Icon: 'mdi-email',
          btn2Link: '/contact',
        },
        {
          image: 'https://images.unsplash.com/photo-1507036044920-40c27d6b4842?w=1200&h=600&fit=crop',
          icon: 'mdi-border-all',
          categoryKey: 'slide5Category',
          titleKey: 'slide5Title',
          descKey: 'slide5Desc',
          btn1Key: 'slide5Btn1',
          btn1Icon: 'mdi-border-all',
          btn1Link: '/gallery?category=tiles',
          btn2Key: 'slide5Btn2',
          btn2Icon: 'mdi-image',
          btn2Link: '/gallery',
        },
      ],
    };
  },
  mounted() {
    console.log('HeroSlider mounted successfully!');
    console.log('Slides count:', this.slides.length);
  },
  computed: {
    progressWidth() {
      // Cache calculation to avoid repeated computation
      const slidesLength = this.slides.length;
      return slidesLength > 0 ? ((this.currentSlide + 1) / slidesLength) * 100 : 0;
    },
    // Add computed property for formatted counter to avoid repeated formatting
    currentSlideDisplay() {
      return this.formatNumber(this.currentSlide + 1);
    },
    totalSlidesDisplay() {
      return this.formatNumber(this.slides.length);
    },
  },
  methods: {
    nextSlide() {
      // Use direct assignment instead of modulo operation for better performance
      const nextIndex = this.currentSlide + 1;
      this.currentSlide = nextIndex >= this.slides.length ? 0 : nextIndex;
    },
    prevSlide() {
      // Use direct assignment instead of modulo operation for better performance
      const prevIndex = this.currentSlide - 1;
      this.currentSlide = prevIndex < 0 ? this.slides.length - 1 : prevIndex;
    },
    goToSlide(index) {
      // Only update if index is different to avoid unnecessary re-renders
      if (index !== this.currentSlide) {
        this.currentSlide = index;
      }
    },
    formatNumber(num) {
      // Cache formatted numbers to avoid repeated computation
      return num < 10 ? `0${num}` : `${num}`;
    },
    isExternalLink(link) {
      // Use more efficient string checking
      return link && (link.includes('http') || link.includes('https') || link.includes('www'));
    },
  },
};
</script>

<style scoped>
/* Vuetify Hero Slider Styles */
.hero-slider {
  margin: 20px 0;
  border-radius: 16px;
  overflow: hidden;
  min-height: 500px;
  background: #000;
  will-change: transform;
  transform: translateZ(0);
}

.custom-carousel :deep(.v-carousel__item) {
  position: relative;
  will-change: opacity;
  transform: translateZ(0);
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 100%);
  z-index: 1;
  pointer-events: none;
}

/* Content Styles */
.slide-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.2;
  background: linear-gradient(135deg, #ffffff 0%, #ffc107 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  margin-bottom: 1rem;
  will-change: transform;
  transform: translateZ(0);
}

.slide-description {
  font-size: 1.1rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin-bottom: 1.5rem;
}

/* Category Chip */
.category-chip {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  will-change: transform;
  transform: translateZ(0);
}

/* Action Buttons */
.action-btn {
  min-width: 160px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  will-change: transform;
  transform: translateZ(0);
}

.action-btn:hover {
  transform: translateY(-2px) translateZ(0);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

/* Navigation Buttons */
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) translateZ(0);
  z-index: 10;
  opacity: 0.8;
  transition: opacity 0.3s ease, transform 0.3s ease;
  will-change: opacity, transform;
}

.nav-btn:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1) translateZ(0);
}

.nav-prev {
  left: 20px;
}

.nav-next {
  right: 20px;
}

/* Custom Indicators */
.custom-indicators {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateZ(0);
  z-index: 10;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 12px 20px;
  border-radius: 30px;
  border: 1px solid rgba(212, 175, 55, 0.3);
  min-width: 200px;
  will-change: transform;
  transform: translateX(-50%) translateZ(0);
}

.dot-btn {
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  transition: all 0.3s ease;
  will-change: transform;
  transform: translateZ(0);
}

.dot-btn.v-btn--active {
  width: 40px !important;
  border-radius: 20px !important;
}

/* Gold Color Theme */
.text-gold {
  color: #ffc107 !important;
}

.text-warning {
  color: #ffc107 !important;
}

:deep(.v-btn--color-warning) {
  background: linear-gradient(135deg, #ffc107 0%, #ffca28 100%) !important;
  color: #000 !important;
  border-color: transparent !important;
  will-change: transform;
  transform: translateZ(0);
}

:deep(.v-btn--color-warning:hover) {
  background: linear-gradient(135deg, #ffca28 0%, #ffc107 100%) !important;
  box-shadow: 0 4px 20px rgba(255, 193, 7, 0.4) !important;
  transform: translateZ(0);
}

:deep(.v-progress-linear__bar) {
  background: linear-gradient(90deg, #ffc107 0%, #ffca28 100%) !important;
  will-change: width;
}

/* RTL Support */
[dir='rtl'] .nav-prev {
  left: auto;
  right: 20px;
}

[dir='rtl'] .nav-next {
  right: auto;
  left: 20px;
}

/* Responsive Design */
@media (max-width: 960px) {
  .slide-title {
    font-size: 2rem;
  }
  
  .slide-description {
    font-size: 1rem;
  }
  
  .action-btn {
    min-width: 140px;
  }
}

@media (max-width: 600px) {
  .hero-slider {
    margin: 10px 0;
    border-radius: 12px;
  }
  
  .slide-title {
    font-size: 1.5rem;
  }
  
  .slide-description {
    font-size: 0.9rem;
  }
  
  .nav-btn {
    width: 40px !important;
    height: 40px !important;
  }
  
  .nav-prev {
    left: 10px;
  }
  
  .nav-next {
    right: 10px;
  }
  
  .custom-indicators {
    bottom: 15px;
    padding: 8px 15px;
    min-width: 180px;
  }
  
  .action-btn {
    min-width: 120px;
    font-size: 0.9rem;
  }
}

@media (min-width: 1200px) {
  .slide-title {
    font-size: 3rem;
  }
  
  .slide-description {
    font-size: 1.2rem;
  }
}

/* Animation Effects - Optimized */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px) translateZ(0);
  }
  to {
    opacity: 1;
    transform: translateY(0) translateZ(0);
  }
}

.custom-carousel :deep(.v-window-item) {
  animation: slideInUp 0.8s ease-out;
  will-change: transform, opacity;
}

/* Progress Bar Animation - Optimized */
:deep(.v-progress-linear__bar) {
  transition: width 0.3s ease;
  will-change: width;
}
</style>
