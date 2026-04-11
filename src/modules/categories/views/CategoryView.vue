<template>
  <div v-if="loading" class="text-center py-8">
    <v-progress-circular
      indeterminate
      color="primary"
      size="48"
      class="mb-4"
    />
    <p class="text-body-1 text-medium-emphasis">
      {{ $t('loadingCategory') || 'جاري تحميل الفئة...' }}
    </p>
  </div>

  <div v-else-if="error" class="text-center py-8">
    <v-alert
      type="error"
      variant="elevated"
      class="mb-4 max-width-600 mx-auto"
    >
      <v-alert-title class="text-h6">
        {{ $t('categoryNotFound') || 'الفئة غير موجودة' }}
      </v-alert-title>
      <v-alert-text class="text-body-2">
        {{ $t('categoryNotFoundMessage') || 'لم يتم العثور على الفئة المطلوبة. يرجى التحقق من الرابط والمحاولة مرة أخرى.' }}
      </v-alert-text>
      <v-alert-actions>
        <v-btn @click="$router.push('/')" prepend-icon="mdi-home" variant="elevated">
          {{ $t('goHome') || 'العودة للرئيسية' }}
        </v-btn>
      </v-alert-actions>
    </v-alert>
  </div>

  <CategoryTemplate
    v-else-if="categoryData"
    :icon="categoryData.icon || 'mdi-folder'"
    :titleKey="categoryData.slug + 'Title'"
    :descriptionKey="categoryData.slug + 'Description'"
    :labelKey="categoryData.slug"
    :latestLabelKey="categoryData.slug + 'Featured'"
    :subCategories="subCategories"
    :badgeLabel="categoryData.slug + 'Design'"
  />
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CategoryTemplate from '@/shared/components/CategoryTemplate.vue';
import { useCategories } from '@/composables/useCategories';

const route = useRoute();
const router = useRouter();
const { 
  findCategoryBySlug, 
  getChildCategories,
  getCategoryBySlug,
  loading,
  error 
} = useCategories();

const categoryData = ref(null);
const subCategories = ref([]);
const categorySlug = computed(() => route.params.slug);

// Watch for route changes
watch(() => categorySlug.value, (newSlug) => {
  if (newSlug) {
    loadCategoryData(newSlug);
  }
}, { immediate: true });

// Load category data
const loadCategoryData = async (slug) => {
  try {
    const category = findCategoryBySlug(slug);
    
    if (category) {
      categoryData.value = category;
      subCategories.value = getChildCategories(category.id);
      console.log(`✅ Category loaded: ${slug}`, category);
      console.log(`✅ Subcategories loaded: ${slug}`, subCategories.value);
    } else {
      console.warn(`⚠️ Category not found: ${slug}`);
      // Try to fetch from server if not found in cache
      const { result } = getCategoryBySlug(slug);
      if (result.value?.category) {
        categoryData.value = result.value.category;
        subCategories.value = getChildCategories(result.value.category.id);
      }
    }
  } catch (err) {
    console.error(`❌ Error loading category ${slug}:`, err);
  }
};

// Initialize
onMounted(() => {
  if (categorySlug.value) {
    loadCategoryData(categorySlug.value);
  }
});
</script>
