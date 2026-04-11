<template>
  <v-list-item
    :class="{ 
      'v-list-item--active': isSelected(category),
      'subcategory-item': true 
    }"
    :value="category.id"
    @click="selectCategory(category)"
    :style="{ paddingLeft: `${level * 16 + 16}px` }"
    class="subcategory-item"
  >
    <template v-slot:prepend>
      <v-icon 
        :icon="category.icon || 'mdi-folder-outline'" 
        :color="isSelected(category) ? 'primary' : 'grey-darken-1'"
        :size="20 - level * 2"
        class="me-3"
      />
    </template>
    
    <v-list-item-title 
      :class="{ 'text-primary font-weight-medium': isSelected(category) }"
      class="text-body-2"
    >
      {{ getCategoryName(category) }}
    </v-list-item-title>
    
    <template v-slot:append v-if="category.children && category.children.length > 0">
      <v-btn
        :icon="isExpanded(category.id) ? 'mdi-chevron-up' : 'mdi-chevron-down'"
        variant="text"
        size="x-small"
        @click.stop="toggleExpansion(category.id)"
        class="expand-btn"
      />
    </template>
  </v-list-item>

  <!-- Nested Subcategories -->
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
      :level="level + 1"
      @select="$emit('select', $event)"
      @toggle-expand="$emit('toggle-expand', $event)"
    />
  </v-list>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

// Props
const props = defineProps({
  category: {
    type: Object,
    required: true
  },
  selectedCategory: {
    type: Object,
    default: null
  },
  expandedCategories: {
    type: Set,
    default: () => new Set()
  },
  level: {
    type: Number,
    default: 1
  }
});

// Emits
const emit = defineEmits(['select', 'toggle-expand']);

// i18n
const { t } = useI18n();

// Methods
const getCategoryName = (category) => {
  const locale = t('locale') || 'ar';
  return locale === 'ar' ? category.nameAr : category.nameEn;
};

const isSelected = (category) => {
  return props.selectedCategory?.id === category.id;
};

const isExpanded = (categoryId) => {
  return props.expandedCategories.has(categoryId);
};

const toggleExpansion = (categoryId) => {
  emit('toggle-expand', categoryId);
};

const selectCategory = (category) => {
  emit('select', category);
};
</script>

<style scoped>
.subcategory-item {
  transition: all 0.3s ease;
  border-radius: 6px;
  margin: 1px 4px;
  min-height: 40px;
}

.subcategory-item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
  transform: translateX(2px);
}

.subcategory-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-left: 2px solid rgb(var(--v-theme-primary));
}

.subcategory-list {
  background: rgba(var(--v-theme-surface-variant), 0.2);
  border-radius: 0 0 6px 6px;
  margin: 0 8px 4px 16px;
}

.expand-btn {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.expand-btn:hover {
  opacity: 1;
}

/* Level-based styling */
.subcategory-item {
  font-size: calc(0.875rem - (v-bind(level) * 0.05rem));
}

@media (max-width: 960px) {
  .subcategory-item {
    margin: 1px 2px;
    min-height: 36px;
  }
}
</style>
