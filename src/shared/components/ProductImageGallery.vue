<template>
  <div class="product-gallery">
    <!-- Main Image Display -->
    <v-card
      class="main-image-wrapper mb-4"
      elevation="4"
      @click="openLightbox(0)"
      style="cursor: zoom-in"
    >
      <v-img
        :src="mainImage"
        :alt="title"
        aspect-ratio="1"
        cover
        class="main-img"
      >
        <template v-slot:placeholder>
          <v-row class="fill-height" align="center" justify="center">
            <v-progress-circular indeterminate color="primary" />
          </v-row>
        </template>
        
        <!-- Image Overlay Info -->
        <div class="image-overlay">
          <div class="overlay-content">
            <v-chip
              color="white"
              variant="elevated"
              prepend-icon="mdi-magnify-plus"
              size="small"
              class="mb-2"
            >
              {{ $t('clickToZoom') || 'انقر للتكبير' }}
            </v-chip>
            
            <div class="image-counter">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </div>
          </div>
        </div>
      </v-img>
      
      <!-- Navigation Arrows -->
      <v-btn
        v-if="images.length > 1"
        icon="mdi-chevron-left"
        variant="elevated"
        color="white"
        class="nav-arrow nav-arrow-left"
        @click.stop="previousImage"
      />
      
      <v-btn
        v-if="images.length > 1"
        icon="mdi-chevron-right"
        variant="elevated"
        color="white"
        class="nav-arrow nav-arrow-right"
        @click.stop="nextImage"
      />
    </v-card>

    <!-- Thumbnails Grid -->
    <div v-if="images.length > 1" class="thumbnails-section">
      <v-btn
        icon="mdi-chevron-left"
        variant="outlined"
        size="small"
        class="thumbnail-nav thumbnail-nav-left"
        @click="scrollThumbnails('left')"
        :disabled="!canScrollLeft"
      />
      
      <div class="thumbnails-container" ref="thumbnailsContainer">
        <div class="thumbnails-row d-flex ga-2">
          <v-card
            v-for="(img, index) in images"
            :key="index"
            class="thumb-item"
            :class="{ 'border-primary': currentImage === img || (!currentImage && index === 0) }"
            elevation="2"
            width="70"
            height="70"
            @click="selectImage(img, index)"
            style="cursor: pointer"
          >
            <v-img
              :src="img"
              :alt="`${title} - ${index + 1}`"
              aspect-ratio="1"
              cover
            />
            
            <!-- Active Indicator -->
            <div v-if="currentImage === img || (!currentImage && index === 0)" class="active-indicator">
              <v-icon size="16" color="white">mdi-check</v-icon>
            </div>
          </v-card>
        </div>
      </div>
      
      <v-btn
        icon="mdi-chevron-right"
        variant="outlined"
        size="small"
        class="thumbnail-nav thumbnail-nav-right"
        @click="scrollThumbnails('right')"
        :disabled="!canScrollRight"
      />
    </div>
    
    <!-- Lightbox Dialog -->
    <v-dialog
      v-model="showLightbox"
      fullscreen
      transition="dialog-transition"
      content-class="lightbox-dialog"
    >
      <v-card class="lightbox-content" color="black">
        <!-- Lightbox Header -->
        <v-card-actions class="lightbox-header pa-4">
          <v-spacer />
          <v-btn
            icon="mdi-close"
            variant="elevated"
            color="white"
            @click="closeLightbox"
          />
        </v-card-actions>
        
        <!-- Lightbox Main Image -->
        <div class="lightbox-image-container">
          <v-img
            :src="lightboxImages[lightboxIndex]"
            :alt="`${title} - ${lightboxIndex + 1}`"
            contain
            max-height="80vh"
            class="lightbox-main-image"
            @click="nextImage"
            style="cursor: pointer"
          >
            <template v-slot:placeholder>
              <v-row class="fill-height" align="center" justify="center">
                <v-progress-circular indeterminate color="white" size="48" />
              </v-row>
            </template>
          </v-img>
          
          <!-- Lightbox Navigation -->
          <v-btn
            v-if="lightboxImages.length > 1"
            icon="mdi-chevron-left"
            variant="elevated"
            color="white"
            size="large"
            class="lightbox-nav lightbox-nav-left"
            @click.stop="previousLightboxImage"
          />
          
          <v-btn
            v-if="lightboxImages.length > 1"
            icon="mdi-chevron-right"
            variant="elevated"
            color="white"
            size="large"
            class="lightbox-nav lightbox-nav-right"
            @click.stop="nextLightboxImage"
          />
        </div>
        
        <!-- Lightbox Thumbnails -->
        <div v-if="lightboxImages.length > 1" class="lightbox-thumbnails">
          <div class="d-flex justify-center ga-2 pa-4">
            <v-card
              v-for="(img, index) in lightboxImages"
              :key="index"
              :width="60"
              :height="60"
              class="lightbox-thumb"
              :class="{ 'lightbox-thumb-active': index === lightboxIndex }"
              elevation="2"
              @click="lightboxIndex = index"
              style="cursor: pointer"
            >
              <v-img
                :src="img"
                :alt="`${title} - ${index + 1}`"
                aspect-ratio="1"
                cover
              />
            </v-card>
          </div>
          
          <!-- Lightbox Info -->
          <div class="lightbox-info text-center pa-4">
            <p class="text-white text-body-2 mb-0">
              {{ lightboxIndex + 1 }} / {{ lightboxImages.length }} - {{ title }}
            </p>
          </div>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
defineProps({
  images: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: 'Product Gallery'
  }
});

// Emits
const emit = defineEmits(['open-lightbox']);

// State
const currentImage = ref(null);
const currentImageIndex = ref(0);
const showLightbox = ref(false);
const lightboxIndex = ref(0);
const thumbnailsContainer = ref(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

// Computed
const processedImages = computed(() => {
  // Process images array to handle both old and new formats
  if (!props.images || props.images.length === 0) {
    return ['/placeholder-product.jpg'];
  }
  
  return props.images.map(img => {
    if (typeof img === 'string') {
      return img; // Old format: string URLs
    }
    if (img.imageUrl) {
      return img.imageUrl; // New format: ProductImage objects
    }
    return img;
  });
});

const sortedImages = computed(() => {
  // Sort images by sort_order if available, otherwise keep original order
  if (!props.images || props.images.length === 0) {
    return processedImages.value;
  }
  
  return [...props.images]
    .sort((a, b) => {
      // Handle both string and object formats
      const orderA = typeof a === 'object' ? (a.sortOrder || 0) : 0;
      const orderB = typeof b === 'object' ? (b.sortOrder || 0) : 0;
      return orderA - orderB;
    })
    .map(img => typeof img === 'object' ? img.imageUrl : img);
});

const mainImage = computed(() => {
  // Find main image (is_main = true) or return first image
  if (!props.images || props.images.length === 0) {
    return processedImages.value[0];
  }
  
  const mainImageObj = props.images.find(img => 
    typeof img === 'object' && img.isMain
  );
  
  if (mainImageObj) {
    return mainImageObj.imageUrl;
  }
  
  return sortedImages.value[0];
});

const lightboxImages = computed(() => {
  return sortedImages.value.length > 0 ? sortedImages.value : [mainImage.value];
});

// Methods
const selectImage = (img, index) => {
  currentImage.value = img;
  currentImageIndex.value = index;
};

const nextImage = () => {
  if (sortedImages.value.length <= 1) return;
  
  const nextIndex = (currentImageIndex.value + 1) % sortedImages.value.length;
  currentImageIndex.value = nextIndex;
  currentImage.value = sortedImages.value[nextIndex];
};

const previousImage = () => {
  if (sortedImages.value.length <= 1) return;
  
  const prevIndex = currentImageIndex.value === 0 ? 
    sortedImages.value.length - 1 : 
    currentImageIndex.value - 1;
  currentImageIndex.value = prevIndex;
  currentImage.value = sortedImages.value[prevIndex];
};

const openLightbox = (index = 0) => {
  lightboxIndex.value = index;
  showLightbox.value = true;
  emit('open-lightbox');
};

const closeLightbox = () => {
  showLightbox.value = false;
};

const nextLightboxImage = () => {
  if (lightboxImages.value.length <= 1) return;
  
  lightboxIndex.value = (lightboxIndex.value + 1) % lightboxImages.value.length;
};

const previousLightboxImage = () => {
  if (lightboxImages.value.length <= 1) return;
  
  lightboxIndex.value = lightboxIndex.value === 0 ? lightboxImages.value.length - 1 : lightboxIndex.value - 1;
};

const scrollThumbnails = (direction) => {
  if (!thumbnailsContainer.value) return;
  
  const container = thumbnailsContainer.value;
  const scrollAmount = 200;
  
  if (direction === 'left') {
    container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
  } else {
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
  
  // Update scroll state after scroll
  setTimeout(updateScrollState, 300);
};

const updateScrollState = () => {
  if (!thumbnailsContainer.value) return;
  
  const container = thumbnailsContainer.value;
  canScrollLeft.value = container.scrollLeft > 0;
  canScrollRight.value = container.scrollLeft < container.scrollWidth - container.clientWidth;
};

// Keyboard navigation
const handleKeyDown = (event) => {
  if (!showLightbox.value) return;
  
  switch (event.key) {
    case 'ArrowLeft':
      previousLightboxImage();
      break;
    case 'ArrowRight':
      nextLightboxImage();
      break;
    case 'Escape':
      closeLightbox();
      break;
  }
};

// Lifecycle
onMounted(() => {
  // Set initial image
  if (props.images.length > 0) {
    currentImage.value = props.images[0];
    currentImageIndex.value = 0;
  }
  
  // Add keyboard event listener
  window.addEventListener('keydown', handleKeyDown);
  
  // Check scroll state
  nextTick(() => {
    updateScrollState();
  });
});

onUnmounted(() => {
  // Remove keyboard event listener
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<style scoped>
.product-gallery {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  padding: 16px;
}

.main-image-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
}

.main-img {
  transition: transform 0.3s ease;
}

.main-img:hover {
  transform: scale(1.02);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
}

.main-image-wrapper:hover .image-overlay {
  opacity: 1;
}

.overlay-content {
  text-align: center;
  color: white;
}

.image-counter {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 0.875rem;
  backdrop-filter: blur(10px);
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.nav-arrow:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow-left {
  left: 8px;
}

.nav-arrow-right {
  right: 8px;
}

.thumbnails-section {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}

.thumbnails-container {
  flex: 1;
  overflow: hidden;
  scroll-behavior: smooth;
}

.thumbnails-row {
  display: flex;
  gap: 8px;
  padding: 4px 0;
}

.thumb-item {
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumb-item:hover {
  transform: scale(1.05);
  border-color: rgb(var(--v-theme-primary));
}

.thumb-item.border-primary {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.2);
}

.active-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail-nav {
  flex-shrink: 0;
}

.thumbnail-nav-left {
  order: -1;
}

.thumbnail-nav-right {
  order: 1;
}

/* Lightbox Styles */
.lightbox-dialog {
  background: black !important;
}

.lightbox-content {
  background: black;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.lightbox-header {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 10;
}

.lightbox-image-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.lightbox-main-image {
  max-width: 90vw;
  max-height: 80vh;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  opacity: 0.8;
  transition: all 0.3s ease;
}

.lightbox-nav:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.lightbox-nav-left {
  left: 16px;
}

.lightbox-nav-right {
  right: 16px;
}

.lightbox-thumbnails {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.lightbox-thumb {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.lightbox-thumb:hover {
  transform: scale(1.1);
  border-color: rgb(var(--v-theme-primary));
}

.lightbox-thumb-active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 2px rgba(var(--v-theme-primary), 0.5);
}

.lightbox-info {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .product-gallery {
    padding: 8px;
  }
  
  .nav-arrow {
    opacity: 1;
  }
  
  .nav-arrow-left {
    left: 4px;
  }
  
  .nav-arrow-right {
    right: 4px;
  }
  
  .thumb-item {
    width: 60px !important;
    height: 60px !important;
  }
  
  .lightbox-nav {
    opacity: 1;
  }
  
  .lightbox-nav-left {
    left: 8px;
  }
  
  .lightbox-nav-right {
    right: 8px;
  }
}
</style>
