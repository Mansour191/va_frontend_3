<template>
  <CategoryTemplate
    :icon="categoryData?.icon || 'fa-solid fa-th-large'"
    titleKey="wallsTitle"
    descriptionKey="wallsDescription"
    labelKey="wallsLabel"
    latestLabelKey="latestWallDesigns"
    :subCategories="subCategories"
    badgeLabel="wallDesign"
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
    const category = await CategoryService.getCategoryBySlug('walls');
    categoryData.value = category;
    
    // جلب الفئات الفرعية
    const subCats = await CategoryService.getSubCategories('walls');
    subCategories.value = subCats;
    
    console.log('✅ Walls category loaded:', category);
    console.log('✅ Walls subcategories loaded:', subCats);
  } catch (error) {
    console.error('❌ Error loading walls category:', error);
  }
});
</script>
