<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-arrow-up'"
    titleKey="ceilingsTitle"
    descriptionKey="ceilingsDescription"
    labelKey="ceilingsLabel"
    latestLabelKey="latestCeilingDesigns"
    :subCategories="subCategories"
    badgeLabel="ceilingDesign"
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
    const category = await CategoryService.getCategoryBySlug('ceilings');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('ceilings');
    subCategories.value = subCats;
    
    console.log('✅ Ceilings category loaded:', category);
    console.log('✅ Ceilings subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading ceilings category:', error);
  }
});
</script>
