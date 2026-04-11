import { ref, computed } from 'vue';
import DesignCategoryService from '@/shared/integration/services/DesignCategoryService';

export function useDesignCategories() {
  // State
  const categories = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const selectedCategory = ref(null);

  // Computed
  const activeCategories = computed(() => {
    return categories.value.filter(category => category.isActive);
  });

  const categoriesWithDesigns = computed(() => {
    return activeCategories.value.filter(category => category.designCount > 0);
  });

  const categoriesSortedByDesignCount = computed(() => {
    return [...categoriesWithDesigns.value].sort((a, b) => b.designCount - a.designCount);
  });

  const featuredCategories = computed(() => {
    return categoriesSortedByDesignCount.value.slice(0, 6); // Top 6 categories
  });

  // Actions
  const fetchCategories = async () => {
    loading.value = true;
    error.value = null;
    
    try {
      const data = await DesignCategoryService.getCategories();
      categories.value = data;
      console.log('✅ Design categories loaded:', data);
    } catch (err) {
      error.value = err.message || 'Failed to load design categories';
      console.error('❌ Error fetching design categories:', err);
    } finally {
      loading.value = false;
    }
  };

  const fetchCategoryBySlug = async (slug) => {
    loading.value = true;
    error.value = null;
    
    try {
      const category = await DesignCategoryService.getCategoryBySlug(slug);
      selectedCategory.value = category;
      console.log(`✅ Design category loaded: ${slug}`, category);
      return category;
    } catch (err) {
      error.value = err.message || `Failed to load design category: ${slug}`;
      console.error(`❌ Error fetching design category ${slug}:`, err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const getCategoryBySlug = (slug) => {
    return categories.value.find(category => category.slug === slug) || null;
  };

  const getCategoryById = (id) => {
    return categories.value.find(category => category.id === parseInt(id)) || null;
  };

  const refreshCategories = async () => {
    DesignCategoryService.clearCache();
    await fetchCategories();
  };

  const refreshCategory = async (slug) => {
    DesignCategoryService.clearCache();
    return await fetchCategoryBySlug(slug);
  };

  // Initialize
  const initialize = async () => {
    if (categories.value.length === 0) {
      await fetchCategories();
    }
  };

  // Utility functions
  const getCategoryImageUrl = (category) => {
    return DesignCategoryService.getCategoryImageUrl(category);
  };

  const getCategoryDisplayName = (category) => {
    return category.name || category.nameAr || category.nameEn || 'Unknown Category';
  };

  const getCategoryDescription = (category) => {
    return category.description || '';
  };

  const isCategoryActive = (category) => {
    return category.isActive !== false; // Default to true if undefined
  };

  const formatDesignCount = (count) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return {
    // State
    categories,
    loading,
    error,
    selectedCategory,
    
    // Computed
    activeCategories,
    categoriesWithDesigns,
    categoriesSortedByDesignCount,
    featuredCategories,
    
    // Actions
    fetchCategories,
    fetchCategoryBySlug,
    getCategoryBySlug,
    getCategoryById,
    refreshCategories,
    refreshCategory,
    initialize,
    
    // Utilities
    getCategoryImageUrl,
    getCategoryDisplayName,
    getCategoryDescription,
    isCategoryActive,
    formatDesignCount,
  };
}
