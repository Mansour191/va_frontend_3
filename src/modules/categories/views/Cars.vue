<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-car'"
    titleKey="carsTitle"
    descriptionKey="carsDescription"
    labelKey="carsLabel"
    latestLabelKey="latestCarDesigns"
    :subCategories="subCategories"
    badgeLabel="carWrap"
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
    const category = await CategoryService.getCategoryBySlug('cars');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('cars');
    subCategories.value = subCats;
    
    console.log('✅ Cars category loaded:', category);
    console.log('✅ Cars subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading cars category:', error);
  }
});
</script>
