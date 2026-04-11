<template>
  <v-card class="product-image-uploader" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-image-multiple</v-icon>
      {{ $t('productImages') || 'صور المنتج' }}
      <v-spacer />
      <v-chip
        :color="images.length > 0 ? 'success' : 'default'"
        variant="elevated"
        size="small"
      >
        {{ images.length }} {{ $t('images') || 'صور' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Upload Area -->
      <div
        class="upload-area"
        :class="{ 'drag-over': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
        @click="$refs.fileInput.click()"
      >
        <v-icon size="48" color="primary" class="mb-2">mdi-cloud-upload</v-icon>
        <h3 class="text-h6 font-weight-medium mb-2">
          {{ $t('uploadImages') || 'رفع الصور' }}
        </h3>
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('uploadInstructions') || 'اسحب وأفلت الصور هنا أو انقر للاختيار' }}
        </p>
        <v-btn color="primary" variant="elevated">
          <v-icon class="me-2">mdi-plus</v-icon>
          {{ $t('selectImages') || 'اختر الصور' }}
        </v-btn>
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          @change="handleFileSelect"
          class="d-none"
        />
      </div>

      <!-- Uploaded Images -->
      <div v-if="images.length > 0" class="uploaded-images mt-6">
        <h4 class="text-subtitle-1 font-weight-bold mb-4">
          {{ $t('uploadedImages') || 'الصور المرفوعة' }}
        </h4>
        
        <v-row>
          <v-col
            v-for="(image, index) in sortedImages"
            :key="image.id || index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <v-card class="image-card" elevation="2">
              <div class="image-wrapper position-relative">
                <v-img
                  :src="image.imageUrl"
                  :alt="image.altText || 'Product Image'"
                  height="150"
                  cover
                  class="product-image"
                >
                  <template v-slot:placeholder>
                    <v-skeleton-loader type="image" />
                  </template>
                </v-img>
                
                <!-- Main Image Badge -->
                <v-chip
                  v-if="image.isMain"
                  color="primary"
                  variant="elevated"
                  size="small"
                  class="main-badge position-absolute top-2 left-2"
                >
                  <v-icon size="small" class="me-1">mdi-star</v-icon>
                  {{ $t('main') || 'رئيسي' }}
                </v-chip>
                
                <!-- Image Actions -->
                <div class="image-actions position-absolute top-2 right-2">
                  <v-btn-group density="compact" variant="elevated">
                    <v-btn
                      size="small"
                      :color="image.isMain ? 'default' : 'primary'"
                      @click="setMainImage(image)"
                      :disabled="image.isMain"
                    >
                      <v-icon size="small">mdi-star</v-icon>
                    </v-btn>
                    <v-btn
                      size="small"
                      color="error"
                      @click="removeImage(image)"
                    >
                      <v-icon size="small">mdi-delete</v-icon>
                    </v-btn>
                  </v-btn-group>
                </div>
              </div>
              
              <!-- Image Details -->
              <v-card-text class="pa-3">
                <v-text-field
                  v-model="image.altText"
                  :label="$t('altText') || 'النص البديل'"
                  variant="outlined"
                  density="compact"
                  hide-details
                  @update:model-value="updateImageAltText(image, $event)"
                />
                
                <div class="d-flex align-center mt-2">
                  <v-text-field
                    v-model.number="image.sortOrder"
                    type="number"
                    :label="$t('order') || 'الترتيب'"
                    variant="outlined"
                    density="compact"
                    hide-details
                    class="flex-grow-0"
                    style="width: 80px"
                    @update:model-value="updateImageOrder(image, $event)"
                  />
                  
                  <v-btn
                    size="small"
                    icon="mdi-arrow-up"
                    variant="text"
                    @click="moveImageUp(index)"
                    :disabled="index === 0"
                    class="ms-2"
                  />
                  <v-btn
                    size="small"
                    icon="mdi-arrow-down"
                    variant="text"
                    @click="moveImageDown(index)"
                    :disabled="index === images.length - 1"
                  />
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </div>

      <!-- Loading State -->
      <div v-if="uploading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p class="text-body-1 mt-4">
          {{ $t('uploadingImages') || 'جاري رفع الصور...' }}
        </p>
        <v-progress-linear
          :model-value="uploadProgress"
          color="primary"
          height="4"
          class="mt-2"
        />
      </div>
    </v-card-text>

    <!-- Actions -->
    <v-card-actions class="pa-4">
      <v-spacer />
      <v-btn @click="$emit('cancel')" variant="outlined">
        {{ $t('cancel') || 'إلغاء' }}
      </v-btn>
      <v-btn
        color="primary"
        @click="saveImages"
        :loading="saving"
        :disabled="images.length === 0"
      >
        {{ $t('save') || 'حفظ' }}
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  productId: {
    type: [String, Number],
    required: true
  },
  initialImages: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['save', 'cancel', 'change']);

// Composables
const { t } = useI18n();

// State
const images = ref([]);
const uploading = ref(false);
const uploadProgress = ref(0);
const saving = ref(false);
const isDragOver = ref(false);
const fileInput = ref(null);

// Computed
const sortedImages = computed(() => {
  return [...images.value].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
});

const hasMainImage = computed(() => {
  return images.value.some(img => img.isMain);
});

// Methods
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);
  processFiles(files);
};

const handleDrop = (event) => {
  isDragOver.value = false;
  const files = Array.from(event.dataTransfer.files);
  processFiles(files);
};

const processFiles = async (files) => {
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  if (imageFiles.length === 0) {
    console.warn('⚠️ No image files found');
    return;
  }

  uploading.value = true;
  uploadProgress.value = 0;

  try {
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const imageData = await uploadImage(file);
      
      // Add to images array
      const newImage = {
        id: Date.now() + Math.random(), // Temporary ID
        imageUrl: imageData.url,
        altText: file.name.split('.')[0],
        isMain: images.value.length === 0 && !hasMainImage.value,
        sortOrder: images.value.length,
        isNew: true
      };
      
      images.value.push(newImage);
      uploadProgress.value = ((i + 1) / imageFiles.length) * 100;
    }

    emit('change', images.value);
    console.log(`✅ Uploaded ${imageFiles.length} images`);
  } catch (error) {
    console.error('❌ Error uploading images:', error);
  } finally {
    uploading.value = false;
    uploadProgress.value = 0;
  }
};

const uploadImage = async (file) => {
  // Mock upload - in production, this would be an actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const url = URL.createObjectURL(file);
      resolve({ url, name: file.name });
    }, 1000);
  });
};

const setMainImage = (image) => {
  // Reset all images to non-main
  images.value.forEach(img => {
    img.isMain = false;
  });
  
  // Set selected image as main
  image.isMain = true;
  
  emit('change', images.value);
  console.log('✅ Main image set:', image.altText);
};

const removeImage = (image) => {
  const index = images.value.findIndex(img => img.id === image.id);
  if (index > -1) {
    const wasMain = image.isMain;
    images.value.splice(index, 1);
    
    // If removed image was main, set first image as main
    if (wasMain && images.value.length > 0) {
      images.value[0].isMain = true;
    }
    
    emit('change', images.value);
    console.log('✅ Image removed:', image.altText);
  }
};

const updateImageAltText = (image, altText) => {
  image.altText = altText;
  emit('change', images.value);
};

const updateImageOrder = (image, sortOrder) => {
  image.sortOrder = sortOrder;
  emit('change', images.value);
};

const moveImageUp = (index) => {
  if (index > 0) {
    const temp = images.value[index];
    images.value[index] = images.value[index - 1];
    images.value[index - 1] = temp;
    
    // Update sort orders
    images.value.forEach((img, i) => {
      img.sortOrder = i;
    });
    
    emit('change', images.value);
  }
};

const moveImageDown = (index) => {
  if (index < images.value.length - 1) {
    const temp = images.value[index];
    images.value[index] = images.value[index + 1];
    images.value[index + 1] = temp;
    
    // Update sort orders
    images.value.forEach((img, i) => {
      img.sortOrder = i;
    });
    
    emit('change', images.value);
  }
};

const saveImages = async () => {
  if (images.value.length === 0) return;
  
  saving.value = true;
  
  try {
    // Ensure we have a main image
    if (!hasMainImage.value && images.value.length > 0) {
      images.value[0].isMain = true;
    }
    
    // Emit save event with processed images
    emit('save', {
      productId: props.productId,
      images: sortedImages.value.map(img => ({
        id: img.isNew ? null : img.id,
        imageUrl: img.imageUrl,
        altText: img.altText || '',
        isMain: img.isMain,
        sortOrder: img.sortOrder || 0
      }))
    });
    
    console.log('✅ Images saved for product:', props.productId);
  } catch (error) {
    console.error('❌ Error saving images:', error);
  } finally {
    saving.value = false;
  }
};

// Initialize
const initialize = () => {
  if (props.initialImages && props.initialImages.length > 0) {
    images.value = [...props.initialImages];
  }
};

// Watch for initial images changes
watch(() => props.initialImages, (newImages) => {
  if (newImages && newImages.length > 0) {
    images.value = [...newImages];
  }
}, { immediate: true });

// Initialize on mount
initialize();
</script>

<style scoped>
.product-image-uploader {
  border-radius: 12px;
}

.upload-area {
  border: 2px dashed rgba(var(--v-theme-primary), 0.3);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.upload-area:hover {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.upload-area.drag-over {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.1);
  transform: scale(1.02);
}

.image-card {
  border-radius: 8px;
  overflow: hidden;
}

.image-wrapper {
  position: relative;
}

.product-image {
  border-radius: 8px 8px 0 0;
}

.main-badge {
  z-index: 1;
}

.image-actions {
  z-index: 2;
}

.uploaded-images {
  max-height: 600px;
  overflow-y: auto;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .upload-area {
    padding: 24px 16px;
  }
  
  .image-card {
    margin-bottom: 16px;
  }
}
</style>
