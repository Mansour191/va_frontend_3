<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-door-open'"
    titleKey="doorsTitle"
    descriptionKey="doorsDescription"
    labelKey="doorsLabel"
    latestLabelKey="latestDoorDesigns"
    :subCategories="subCategories"
    badgeLabel="doorDesign"
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
    const category = await CategoryService.getCategoryBySlug('doors');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('doors');
    subCategories.value = subCats;
    
    console.log('✅ Doors category loaded:', category);
    console.log('✅ Doors subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading doors category:', error);
  }
});
</script>
