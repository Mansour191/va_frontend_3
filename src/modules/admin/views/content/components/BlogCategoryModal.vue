<template>
  <v-dialog v-model="dialog" max-width="800px" persistent>
    <v-card>
      <v-card-title class="pa-4">
        <h3 class="text-h6 font-weight-medium">
          {{ editingCategory ? ($t('editCategory') || 'Edit Category') : ($t('createCategory') || 'Create Category') }}
        </h3>
      </v-card-title>
      
      <v-card-text class="pa-4">
        <v-form ref="categoryForm" v-model="validForm">
          <v-row>
            <!-- Basic Information -->
            <v-col cols="12">
              <h4 class="text-subtitle-1 font-weight-medium mb-3 text-primary">
                {{ $t('basicInfo') || 'Basic Information' }}
              </h4>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentCategory.name_ar"
                :label="$t('nameArabic') || 'Name (Arabic)'"
                variant="outlined"
                required
                :rules="[v => !!v || ($t('required') || 'Required')]"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentCategory.name_en"
                :label="$t('nameEnglish') || 'Name (English)'"
                variant="outlined"
                required
                :rules="[v => !!v || ($t('required') || 'Required')]"
              />
            </v-col>
            
            <v-col cols="12">
              <v-text-field
                v-model="currentCategory.slug"
                :label="$t('slug') || 'Slug'"
                variant="outlined"
                :hint="$t('slugHint') || 'URL-friendly identifier'"
                persistent-hint
              />
            </v-col>
            
            <!-- Descriptions -->
            <v-col cols="12">
              <h4 class="text-subtitle-1 font-weight-medium mb-3 text-primary">
                {{ $t('descriptions') || 'Descriptions' }}
              </h4>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-textarea
                v-model="currentCategory.description"
                :label="$t('descriptionEnglish') || 'Description (English)'"
                variant="outlined"
                rows="3"
                auto-grow
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-textarea
                v-model="currentCategory.description_ar"
                :label="$t('descriptionArabic') || 'Description (Arabic)'"
                variant="outlined"
                rows="3"
                auto-grow
              />
            </v-col>
            
            <!-- Visual Settings -->
            <v-col cols="12">
              <h4 class="text-subtitle-1 font-weight-medium mb-3 text-primary">
                {{ $t('visualSettings') || 'Visual Settings' }}
              </h4>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentCategory.icon_class"
                :label="$t('iconClass') || 'Icon Class'"
                variant="outlined"
                :hint="$t('iconClassHint') || 'Material Design Icons class (e.g., mdi-home)'"
                persistent-hint
              >
                <template #append-inner>
                  <v-icon v-if="currentCategory.icon_class" :class="currentCategory.icon_class">
                    {{ currentCategory.icon_class }}
                  </v-icon>
                </template>
              </v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentCategory.meta_title"
                :label="$t('metaTitle') || 'Meta Title'"
                variant="outlined"
                :hint="$t('metaTitleHint') || 'SEO title for search engines'"
                persistent-hint
                counter="255"
              />
            </v-col>
            
            <!-- Organization -->
            <v-col cols="12">
              <h4 class="text-subtitle-1 font-weight-medium mb-3 text-primary">
                {{ $t('organization') || 'Organization' }}
              </h4>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-number-input
                v-model="currentCategory.order_priority"
                :label="$t('orderPriority') || 'Order Priority'"
                variant="outlined"
                :hint="$t('orderPriorityHint') || 'Lower numbers appear first'"
                persistent-hint
                min="0"
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-switch
                v-model="currentCategory.is_featured"
                :label="$t('isFeatured') || 'Featured Category'"
                color="primary"
                :hint="$t('isFeaturedHint') || 'Show in featured sections'"
                persistent-hint
              />
            </v-col>
            
            <v-col cols="12" md="6">
              <v-switch
                v-model="currentCategory.is_active"
                :label="$t('isActive') || 'Active'"
                color="success"
                :hint="$t('isActiveHint') || 'Category is visible to users'"
                persistent-hint
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn @click="closeDialog" variant="tonal">
          {{ $t('cancel') || 'Cancel' }}
        </v-btn>
        <v-btn 
          @click="saveCategory" 
          color="primary" 
          variant="elevated"
          :loading="loading"
          :disabled="!validForm"
        >
          {{ editingCategory ? ($t('update') || 'Update') : ($t('create') || 'Create') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import BlogCategoryService from '@/services/BlogCategoryService';

const { t } = useI18n();
const store = useStore();

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  category: {
    type: Object,
    default: null
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'saved']);

// State
const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const loading = ref(false);
const validForm = ref(false);
const categoryForm = ref(null);

const editingCategory = computed(() => !!props.category?.id);

const currentCategory = ref({
  id: null,
  name_ar: '',
  name_en: '',
  slug: '',
  description: '',
  description_ar: '',
  icon_class: '',
  order_priority: 0,
  is_featured: false,
  is_active: true,
  meta_title: ''
});

// Methods
const resetForm = () => {
  currentCategory.value = {
    id: null,
    name_ar: '',
    name_en: '',
    slug: '',
    description: '',
    description_ar: '',
    icon_class: '',
    order_priority: 0,
    is_featured: false,
    is_active: true,
    meta_title: ''
  };
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const generateSlug = (name) => {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const saveCategory = async () => {
  if (!categoryForm.value?.validate()) return;
  
  try {
    loading.value = true;
    
    // Auto-generate slug if not provided
    if (!currentCategory.value.slug && currentCategory.value.name_en) {
      currentCategory.value.slug = generateSlug(currentCategory.value.name_en);
    }
    
    const categoryData = { ...currentCategory.value };
    delete categoryData.id; // Remove ID from data for update operations
    
    let response;
    if (editingCategory.value) {
      response = await BlogCategoryService.updateCategory(props.category.id, categoryData);
    } else {
      response = await BlogCategoryService.createCategory(categoryData);
    }
    
    if (response.success) {
      // Show success notification
      store.dispatch('notifications/add', {
        type: 'success',
        title: editingCategory.value 
          ? (t('categoryUpdated') || 'Category Updated')
          : (t('categoryCreated') || 'Category Created'),
        message: editingCategory.value
          ? (t('categoryUpdatedSuccessfully') || 'Category updated successfully')
          : (t('categoryCreatedSuccessfully') || 'Category created successfully'),
        timeout: 3000
      });
      
      emit('saved', response.data);
      closeDialog();
    } else {
      throw new Error(response.message || 'Operation failed');
    }
  } catch (error) {
    console.error('Error saving category:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('saveError') || 'Save Error',
      message: error.message || t('unexpectedError') || 'An unexpected error occurred',
      timeout: 5000
    });
  } finally {
    loading.value = false;
  }
};

// Watchers
watch(() => props.category, (newCategory) => {
  if (newCategory) {
    currentCategory.value = { ...newCategory };
  } else {
    resetForm();
  }
}, { immediate: true });
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  transform: translateY(-2px);
}

.v-btn {
  transition: all 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-2px);
}

.v-text-field, .v-textarea, .v-number-input {
  transition: all 0.3s ease;
}

.v-text-field:hover, .v-textarea:hover, .v-number-input:hover {
  transform: scale(1.02);
}

.v-switch {
  transition: all 0.3s ease;
}

.v-switch:hover {
  transform: scale(1.05);
}

/* Form Sections */
.text-subtitle-1 {
  position: relative;
  padding-bottom: 8px;
}

.text-subtitle-1::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--v-theme-primary), transparent);
  border-radius: 1px;
}

/* Icon Preview */
.v-icon {
  transition: all 0.3s ease;
}

.v-icon:hover {
  transform: scale(1.1);
}

/* Responsive Design */
@media (max-width: 960px) {
  .v-dialog .v-card {
    margin: 16px;
  }
}

@media (max-width: 600px) {
  .v-dialog .v-card {
    margin: 8px;
  }
  
  .v-card-title {
    padding: 16px !important;
  }
  
  .v-card-text {
    padding: 16px !important;
  }
  
  .v-card-actions {
    padding: 16px !important;
    flex-direction: column;
    gap: 8px;
  }
  
  .v-card-actions .v-spacer {
    display: none;
  }
  
  .v-card-actions .v-btn {
    width: 100%;
  }
}
</style>
