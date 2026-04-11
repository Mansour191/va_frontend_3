<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-border-all'"
    titleKey="tilesTitle"
    descriptionKey="tilesDescription"
    labelKey="tilesLabel"
    latestLabelKey="latestTileDesigns"
    :subCategories="subCategories"
    badgeLabel="tileDesign"
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
    const category = await CategoryService.getCategoryBySlug('tiles');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('tiles');
    subCategories.value = subCats;
    
    console.log('✅ Tiles category loaded:', category);
    console.log('✅ Tiles subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading tiles category:', error);
  }
});
</script>
