import { ref, computed, reactive } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { client } from '@/shared/plugins/apolloPlugin';
import { 
  ALL_CATEGORIES_QUERY, 
  CATEGORY_BY_SLUG_QUERY, 
  ROOT_CATEGORIES_QUERY, 
  CATEGORY_TREE_QUERY 
} from '@/integration/graphql/categories.graphql';

// Ensure Apollo Client is available
provideApolloClient(client);

// Categories State Management
const categoriesState = reactive({
  categories: [],
  rootCategories: [],
  categoryTree: [],
  currentCategory: null,
  loading: false,
  error: null,
  selectedCategory: null,
  expandedCategories: new Set()
});

export const useCategories = () => {
  // Fetch all categories with tree structure
  const { result: allCategoriesResult, loading: allCategoriesLoading, error: allCategoriesError } = useQuery(
    ALL_CATEGORIES_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch root categories (top-level)
  const { result: rootCategoriesResult, loading: rootCategoriesLoading, error: rootCategoriesError } = useQuery(
    ROOT_CATEGORIES_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch category tree (hierarchical)
  const { result: categoryTreeResult, loading: categoryTreeLoading, error: categoryTreeError } = useQuery(
    CATEGORY_TREE_QUERY,
    {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    }
  );

  // Fetch category by slug
  const getCategoryBySlug = (slug) => {
    const { result, loading, error } = useQuery(
      CATEGORY_BY_SLUG_QUERY,
      () => ({
        slug: slug
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Computed properties
  const categories = computed(() => {
    return useResult(allCategoriesResult, []).value || [];
  });

  const rootCategories = computed(() => {
    return useResult(rootCategoriesResult, []).value || [];
  });

  const categoryTree = computed(() => {
    return useResult(categoryTreeResult, []).value || [];
  });

  const loading = computed(() => 
    allCategoriesLoading.value || 
    rootCategoriesLoading.value || 
    categoryTreeLoading.value
  );

  const error = computed(() => 
    allCategoriesError.value || 
    rootCategoriesError.value || 
    categoryTreeError.value
  );

  // Helper functions
  const findCategoryById = (categoryId) => {
    return categories.value.find(cat => cat.id === categoryId);
  };

  const findCategoryBySlug = (slug) => {
    return categories.value.find(cat => cat.slug === slug);
  };

  const getCategoryPath = (category) => {
    const path = [];
    let current = category;
    
    while (current) {
      path.unshift(current);
      current = current.parent;
    }
    
    return path;
  };

  const getCategoryBreadcrumbs = (category) => {
    const path = getCategoryPath(category);
    return path.map((cat, index) => ({
      name: cat.nameAr || cat.nameEn,
      slug: cat.slug,
      isLast: index === path.length - 1
    }));
  };

  const getChildCategories = (parentId) => {
    return categories.value.filter(cat => cat.parent?.id === parentId);
  };

  const getSiblingCategories = (categoryId) => {
    const category = findCategoryById(categoryId);
    if (!category?.parent) return [];
    
    return getChildCategories(category.parent.id);
  };

  const toggleCategoryExpansion = (categoryId) => {
    if (categoriesState.expandedCategories.has(categoryId)) {
      categoriesState.expandedCategories.delete(categoryId);
    } else {
      categoriesState.expandedCategories.add(categoryId);
    }
  };

  const isCategoryExpanded = (categoryId) => {
    return categoriesState.expandedCategories.has(categoryId);
  };

  const selectCategory = (category) => {
    categoriesState.selectedCategory = category;
    categoriesState.currentCategory = category;
  };

  const clearSelection = () => {
    categoriesState.selectedCategory = null;
    categoriesState.currentCategory = null;
  };

  const expandAll = () => {
    categories.value.forEach(category => {
      categoriesState.expandedCategories.add(category.id);
    });
  };

  const collapseAll = () => {
    categoriesState.expandedCategories.clear();
  };

  // Tree navigation functions
  const navigateToCategory = (category, router) => {
    if (category && category.slug) {
      router.push(`/shop/category/${category.slug}`);
    }
  };

  const getCategoryProducts = (categorySlug, router) => {
    if (categorySlug) {
      router.push(`/shop/category/${categorySlug}/products`);
    }
  };

  // Search and filter functions
  const searchCategories = (searchTerm) => {
    if (!searchTerm) return categories.value;
    
    const term = searchTerm.toLowerCase();
    return categories.value.filter(category => 
      category.nameAr?.toLowerCase().includes(term) ||
      category.nameEn?.toLowerCase().includes(term) ||
      category.description?.toLowerCase().includes(term)
    );
  };

  const filterActiveCategories = (categoryList = null) => {
    const sourceList = categoryList || categories.value;
    return sourceList.filter(category => category.isActive);
  };

  const filterByParent = (parentId, categoryList = null) => {
    const sourceList = categoryList || categories.value;
    return sourceList.filter(category => category.parent?.id === parentId);
  };

  // Update reactive state
  const updateState = () => {
    categoriesState.categories = categories.value;
    categoriesState.rootCategories = rootCategories.value;
    categoriesState.categoryTree = categoryTree.value;
    categoriesState.loading = loading.value;
    categoriesState.error = error.value;
  };

  // Watch for changes and update state
  const stopWatcher = computed(() => {
    updateState();
    return null;
  });

  // Initialize
  const initialize = () => {
    updateState();
  };

  return {
    // State
    categories,
    rootCategories,
    categoryTree,
    currentCategory: computed(() => categoriesState.currentCategory),
    selectedCategory: computed(() => categoriesState.selectedCategory),
    loading,
    error,
    expandedCategories: computed(() => Array.from(categoriesState.expandedCategories)),

    // Actions
    getCategoryBySlug,
    findCategoryById,
    findCategoryBySlug,
    getCategoryPath,
    getCategoryBreadcrumbs,
    getChildCategories,
    getSiblingCategories,
    toggleCategoryExpansion,
    isCategoryExpanded,
    selectCategory,
    clearSelection,
    expandAll,
    collapseAll,

    // Navigation
    navigateToCategory,
    getCategoryProducts,

    // Search and Filter
    searchCategories,
    filterActiveCategories,
    filterByParent,

    // Initialization
    initialize
  };
};
