<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-utensils'"
    titleKey="kitchensTitle"
    descriptionKey="kitchensDescription"
    labelKey="kitchensLabel"
    latestLabelKey="latestKitchenDesigns"
    :subCategories="subCategories"
    badgeLabel="kitchenDesign"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import CategoryTemplate from '@/shared/components/CategoryTemplate.vue';
import CategoryService from '@/integration/services/CategoryService';

const categoryData = ref(null);
const subCategories = ref([]);

onMounted(async () => {
  try {
    // جلب بيانات الفئة من قاعدة البيانات
    const category = await CategoryService.getCategoryBySlug('kitchens');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('kitchens');
    subCategories.value = subCats;
    
    console.log('✅ Kitchens category loaded:', category);
    console.log('✅ Kitchens subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading kitchens category:', error);
  }
});
</script>
