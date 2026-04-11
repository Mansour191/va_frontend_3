<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'mdi-sofa'"
    titleKey="furnitureTitle"
    descriptionKey="furnitureDescription"
    labelKey="furnitureLabel"
    latestLabelKey="featuredFurniture"
    :subCategories="subCategories"
    badgeLabel="furnitureDesign"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import CategoryTemplate from '@/shared/components/CategoryTemplate.vue';
import { useCategories } from '@/composables/useCategories';

const route = useRoute();
const { 
  categories, 
  getCategoryBySlug, 
  findCategoryBySlug, 
  getChildCategories,
  loading,
  error 
} = useCategories();

const categoryData = ref(null);
const subCategories = ref([]);

// Computed properties
const furnitureCategory = computed(() => {
  return findCategoryBySlug('furniture') || 
         categories.value.find(cat => cat.slug === 'furniture');
});

// Watch for categories to load
watch(() => categories.value, (newCategories) => {
  if (newCategories && newCategories.length > 0) {
    const furniture = findCategoryBySlug('furniture');
    if (furniture) {
      categoryData.value = furniture;
      subCategories.value = getChildCategories(furniture.id);
      console.log('✅ Furniture category loaded:', furniture);
      console.log('✅ Furniture subcategories loaded:', subCategories.value);
    }
  }
}, { immediate: true });

// Initialize
onMounted(() => {
  // Categories are automatically loaded by useCategories composable
  // The watcher will handle the rest
});
</script>
