<template>
  <v-navigation-drawer
    v-model="isOpen"
    :temporary="temporary"
    :permanent="permanent"
    :width="width"
    class="category-sidebar"
    :class="{ 'category-sidebar--collapsed': collapsed }"
  >
    <v-list class="category-list">
      <!-- Loading State -->
      <template v-if="loading">
        <v-list-item v-for="i in 5" :key="i" class="px-4">
          <template v-slot:prepend>
            <v-skeleton-loader type="avatar" size="24" class="me-3" />
          </template>
          <v-list-item-title>
            <v-skeleton-loader type="text" width="80%" />
          </v-list-item-title>
        </v-list-item>
      </template>

      <!-- Error State -->
      <template v-else-if="error">
        <v-list-item class="px-4">
          <template v-slot:prepend>
            <v-icon color="error" class="me-3">mdi-alert-circle</v-icon>
          </template>
          <v-list-item-title class="text-error">
            {{ $t('categoriesLoadError') || 'فشل تحميل الفئات' }}
          </v-list-item-title>
        </v-list-item>
      </template>

      <!-- Categories Tree -->
      <template v-else>
        <!-- Root Categories -->
        <template v-for="category in displayCategories" :key="category.id">
          <v-list-item
            :class="{ 
              'v-list-item--active': isSelected(category),
              'category-item': true 
            }"
            :value="category.id"
            @click="selectCategory(category)"
            class="category-item"
          >
            <template v-slot:prepend>
              <v-icon 
                :icon="category.icon || 'mdi-folder'" 
                :color="isSelected(category) ? 'primary' : 'grey-darken-1'"
                class="me-3"
              />
            </template>
            
            <v-list-item-title 
              :class="{ 'text-primary font-weight-bold': isSelected(category) }"
            >
              {{ getCategoryName(category) }}
            </v-list-item-title>
            
            <template v-slot:append v-if="category.children && category.children.length > 0">
              <v-btn
                :icon="isExpanded(category.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
                variant="text"
                size="small"
                @click.stop="toggleExpansion(category.id)"
                class="expand-btn"
              />
            </template>
          </v-list-item>

          <!-- Subcategories (Recursive) -->
          <v-list 
            v-if="category.children && category.children.length > 0 && isExpanded(category.id)"
            class="subcategory-list"
            density="compact"
          >
            <CategorySubItem
              v-for="subcategory in category.children"
              :key="subcategory.id"
              :category="subcategory"
              :selected-category="selectedCategory"
              :expanded-categories="expandedCategories"
              :level="1"
              @select="selectCategory"
              @toggle-expand="toggleExpansion"
            />
          </v-list>
        </template>
      </template>
    </v-list>

    <!-- Footer Actions -->
    <template v-slot:append>
      <v-divider />
      <div class="pa-4">
        <v-btn
          block
          variant="outlined"
          prepend-icon="mdi-refresh"
          @click="refreshCategories"
          :loading="loading"
        >
          {{ $t('refreshCategories') || 'تحديث الفئات' }}
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCategories } from '@/composables/useCategories';
import CategorySubItem from './CategorySubItem.vue';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  temporary: {
    type: Boolean,
    default: true
  },
  permanent: {
    type: Boolean,
    default: false
  },
  width: {
    type: [String, Number],
    default: 280
  },
  collapsed: {
    type: Boolean,
    default: false
  },
  showOnlyRoot: {
    type: Boolean,
    default: false
  },
  maxHeight: {
    type: [String, Number],
    default: 'auto'
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'select-category', 'toggle-expand']);

// Router and i18n
const router = useRouter();
const { t } = useI18n();

// Categories composable
const { 
  rootCategories, 
  categoryTree, 
  loading, 
  error,
  selectCategory: selectCategoryComposable,
  isCategoryExpanded,
  toggleCategoryExpansion,
  expandAll,
  collapseAll
} = useCategories();

// Local state
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const selectedCategory = ref(null);
const expandedCategories = ref(new Set());

// Computed
const displayCategories = computed(() => {
  if (props.showOnlyRoot) {
    return rootCategories.value;
  }
  return categoryTree.value || rootCategories.value;
});

// Methods
const getCategoryName = (category) => {
  const locale = t('locale') || 'ar';
  return locale === 'ar' ? category.nameAr : category.nameEn;
};

const isSelected = (category) => {
  return selectedCategory.value?.id === category.id;
};

const isExpanded = (categoryId) => {
  return expandedCategories.value.has(categoryId);
};

const toggleExpansion = (categoryId) => {
  if (expandedCategories.value.has(categoryId)) {
    expandedCategories.value.delete(categoryId);
  } else {
    expandedCategories.value.add(categoryId);
  }
  emit('toggle-expand', categoryId);
};

const selectCategory = (category) => {
  selectedCategory.value = category;
  selectCategoryComposable(category);
  
  // Navigate to category page
  if (category.slug) {
    router.push(`/category/${category.slug}`);
  }
  
  emit('select-category', category);
  
  // Close sidebar if temporary
  if (props.temporary) {
    isOpen.value = false;
  }
};

const refreshCategories = async () => {
  // Refresh categories data
  expandedCategories.value.clear();
  await expandAll();
};

// Watch for route changes to update selected category
watch(() => router.currentRoute.value, (newRoute) => {
  if (newRoute.params.slug) {
    // Find category by slug and select it
    const category = displayCategories.value.find(cat => 
      cat.slug === newRoute.params.slug || 
      cat.children?.some(sub => sub.slug === newRoute.params.slug)
    );
    if (category) {
      selectedCategory.value = category;
    }
  }
}, { immediate: true });
</script>

<style scoped>
.category-sidebar {
  background: rgb(var(--v-theme-surface));
  border-right: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

.category-sidebar--collapsed {
  width: 64px !important;
}

.category-list {
  height: 100%;
  overflow-y: auto;
  max-height: v-bind(maxHeight);
}

.category-item {
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 2px 8px;
}

.category-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
  transform: translateX(2px);
}

.category-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12);
  border-left: 3px solid rgb(var(--v-theme-primary));
}

.subcategory-list {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 0 0 8px 8px;
  margin: 0 16px 8px 32px;
}

.expand-btn {
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.expand-btn:hover {
  opacity: 1;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .category-sidebar {
    width: 100% !important;
  }
  
  .category-item {
    margin: 1px 4px;
  }
}

/* Animation classes */
.category-item {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
