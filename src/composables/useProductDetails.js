import { ref, computed, reactive } from 'vue';
import { useQuery, useResult } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { client } from '@/shared/plugins/apolloPlugin';
import {
  PRODUCT_BY_ID_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  RELATED_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
  PRODUCTS_WITH_STOCK_QUERY
} from '@/integration/graphql/products.graphql';

// Ensure Apollo Client is available
provideApolloClient(client);

// Product Details State Management
const productDetailsState = reactive({
  currentProduct: null,
  relatedProducts: [],
  selectedVariant: null,
  selectedImage: null,
  loading: false,
  error: null,
  quantity: 1,
  customDimensions: { width: 100, height: 100 },
  priceBreakdown: {
    basePrice: 0,
    discountAmount: 0,
    finalPrice: 0,
    materialCost: 0,
    totalCost: 0
  }
});

export const useProductDetails = () => {
  // Fetch product by ID
  const getProductById = (id) => {
    const { result, loading, error } = useQuery(
      PRODUCT_BY_ID_QUERY,
      () => ({
        id: id
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Fetch product by slug
  const getProductBySlug = (slug) => {
    const { result, loading, error } = useQuery(
      PRODUCT_BY_SLUG_QUERY,
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

  // Fetch related products
  const getRelatedProducts = (categoryId, productId, limit = 8) => {
    const { result, loading, error } = useQuery(
      RELATED_PRODUCTS_QUERY,
      () => ({
        categoryId: categoryId,
        productId: productId,
        first: limit
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Search products
  const searchProducts = (searchTerm, filters = {}) => {
    const { result, loading, error } = useQuery(
      SEARCH_PRODUCTS_QUERY,
      () => ({
        searchTerm,
        filter: filters
      }),
      {
        fetchPolicy: 'cache-first',
        errorPolicy: 'all'
      }
    );
    return { result, loading, error };
  };

  // Computed properties
  const currentProduct = computed(() => productDetailsState.currentProduct);
  const relatedProducts = computed(() => productDetailsState.relatedProducts);
  const selectedVariant = computed(() => productDetailsState.selectedVariant);
  const selectedImage = computed(() => productDetailsState.selectedImage);
  const loading = computed(() => productDetailsState.loading);
  const error = computed(() => productDetailsState.error);
  const quantity = computed(() => productDetailsState.quantity);
  const customDimensions = computed(() => productDetailsState.customDimensions);
  const priceBreakdown = computed(() => productDetailsState.priceBreakdown);

  // Price calculation functions
  const calculateFinalPrice = (product, variant = null, quantity = 1, materialCost = 0) => {
    if (!product) return { basePrice: 0, discountAmount: 0, finalPrice: 0, materialCost, totalCost: 0 };

    // Use variant price if available, otherwise use product base price
    const basePrice = variant ? variant.price : product.basePrice;
    const discountAmount = product.onSale ? (basePrice * product.discountPercent / 100) : 0;
    const finalPrice = basePrice - discountAmount;
    const totalCost = (finalPrice + materialCost) * quantity;

    return {
      basePrice,
      discountAmount,
      finalPrice,
      materialCost,
      totalCost
    };
  };

  const calculateVariantPrice = (product, variant, quantity = 1, materialCost = 0) => {
    if (!product) return { basePrice: 0, variantPrice: 0, finalPrice: 0, materialCost, totalCost: 0 };
    
    const productBasePrice = product.basePrice;
    const variantPrice = variant ? variant.price : productBasePrice;
    
    // Apply discount to the selected price (variant or base)
    const selectedPrice = variant ? variantPrice : productBasePrice;
    const discountAmount = product.onSale ? (selectedPrice * product.discountPercent / 100) : 0;
    const finalPrice = selectedPrice - discountAmount;
    const totalCost = (finalPrice + materialCost) * quantity;

    return {
      basePrice: productBasePrice,
      variantPrice: variantPrice,
      discountAmount,
      finalPrice,
      materialCost,
      totalCost
    };
  };

  const updatePriceBreakdown = (materialCost = 0) => {
    if (currentProduct.value) {
      const breakdown = calculateVariantPrice(
        currentProduct.value,
        selectedVariant.value,
        quantity.value,
        materialCost
      );
      productDetailsState.priceBreakdown = breakdown;
    }
  };

  // Product selection functions
  const selectProduct = (product) => {
    productDetailsState.currentProduct = product;
    productDetailsState.selectedVariant = null;
    productDetailsState.selectedImage = getMainImage(product);
    productDetailsState.quantity = 1;
    
    // Initialize price breakdown
    updatePriceBreakdown();
    
    console.log('✅ Product selected:', product);
  };

  const selectVariant = (variant) => {
    productDetailsState.selectedVariant = variant;
    updatePriceBreakdown();
    console.log('✅ Variant selected:', variant);
  };

  const selectImage = (image) => {
    productDetailsState.selectedImage = image;
    console.log('✅ Image selected:', image);
  };

  // Image management functions
  const getMainImage = (product) => {
    if (!product || !product.images || product.images.length === 0) {
      return {
        imageUrl: '/placeholder-product.jpg',
        altText: 'Product Image',
        isMain: true,
        sortOrder: 0
      };
    }
    
    // Find main image first
    const mainImage = product.images.find(img => img.isMain);
    if (mainImage) return mainImage;
    
    // Return first image if no main image
    return product.images[0];
  };

  const getAllImages = (product) => {
    if (!product || !product.images) return [];
    
    // Sort images by sort_order, then by isMain
    return [...product.images].sort((a, b) => {
      // Main image first
      if (a.isMain && !b.isMain) return -1;
      if (!a.isMain && b.isMain) return 1;
      
      // Then by sort order
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  };

  const getSortedImages = (product) => {
    if (!product || !product.images) return [];
    
    return [...product.images].sort((a, b) => {
      return (a.sortOrder || 0) - (b.sortOrder || 0);
    });
  };

  const getCartImage = (product) => {
    // Get the best image for cart display (small, optimized)
    const mainImage = getMainImage(product);
    return mainImage.imageUrl || '/placeholder-product.jpg';
  };

  const getGalleryImages = (product) => {
    // Get all images formatted for gallery display
    if (!product || !product.images) return [];
    
    return getSortedImages(product).map(img => ({
      id: img.id,
      url: img.imageUrl,
      alt: img.altText || product.nameAr || product.nameEn,
      isMain: img.isMain,
      sortOrder: img.sortOrder
    }));
  };

  const hasMultipleImages = (product) => {
    return product && product.images && product.images.length > 1;
  };

  const getImageCount = (product) => {
    return product && product.images ? product.images.length : 0;
  };

  const validateImage = (image) => {
    if (!image) return false;
    if (typeof image === 'string') {
      return image.startsWith('http') || image.startsWith('/');
    }
    if (typeof image === 'object') {
      return image.imageUrl && (image.imageUrl.startsWith('http') || image.imageUrl.startsWith('/'));
    }
    return false;
  };

  const getValidImages = (product) => {
    if (!product || !product.images) return [];
    
    return product.images.filter(img => validateImage(img));
  };

  // Variant management functions
  const getAvailableVariants = (product) => {
    if (!product || !product.variants) return [];
    
    return product.variants.filter(variant => 
      variant.isActive && variant.stock > 0
    );
  };

  const getAllVariants = (product) => {
    if (!product || !product.variants) return [];
    
    return product.variants.filter(variant => variant.isActive);
  };

  const getVariantById = (product, variantId) => {
    if (!product || !product.variants) return null;
    
    return product.variants.find(variant => variant.id === variantId);
  };

  const getVariantBySku = (product, sku) => {
    if (!product || !product.variants) return null;
    
    return product.variants.find(variant => variant.sku === sku);
  };

  const isVariantAvailable = (variant) => {
    return variant && variant.isActive && variant.stock > 0;
  };

  const getVariantStockStatus = (variant) => {
    if (!variant) return 'out_of_stock';
    if (!variant.isActive) return 'inactive';
    if (variant.stock === 0) return 'out_of_stock';
    if (variant.stock <= 5) return 'low_stock';
    return 'in_stock';
  };

  const getVariantStockStatusText = (status) => {
    const statusMap = {
      'in_stock': 'متوفر',
      'low_stock': 'مخزون محدود',
      'out_of_stock': 'نفد المخزون',
      'inactive': 'غير متاحر'
    };
    return statusMap[status] || status;
  };

  const selectVariant = (variant) => {
    productDetailsState.selectedVariant = variant;
    updatePriceBreakdown();
    console.log('✅ Variant selected:', variant);
  };

  const clearVariantSelection = () => {
    productDetailsState.selectedVariant = null;
    updatePriceBreakdown();
  };

  const getDefaultVariant = (product) => {
    const availableVariants = getAvailableVariants(product);
    return availableVariants.length > 0 ? availableVariants[0] : null;
  };

  const getVariantDisplayPrice = (product, variant) => {
    if (!variant) return formatPrice(product.basePrice);
    return formatPrice(variant.price);
  };

  const getVariantAttributes = (variant) => {
    if (!variant || !variant.attributes) return {};
    
    return variant.attributes;
  };

  const formatVariantName = (variant, attributes = null) => {
    if (!variant) return '';
    
    const attrs = attributes || getVariantAttributes(variant);
    const attrString = Object.entries(attrs)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return attrString ? `${variant.name} (${attrString})` : variant.name;
  };

  // Product Materials Management
  const getAvailableMaterials = (product) => {
    if (!product || !product.available_materials) return [];
    
    return product.available_materials
      .filter(pm => pm.isActive && pm.material.isActive)
      .map(pm => pm.material);
  };

  const getAllProductMaterials = (product) => {
    if (!product || !product.available_materials) return [];
    
    return product.available_materials
      .filter(pm => pm.material.isActive)
      .map(pm => pm.material);
  };

  const isMaterialAvailableForProduct = (product, materialId) => {
    if (!product || !product.available_materials) return false;
    
    return product.available_materials.some(pm => 
      pm.isActive && 
      pm.material.isActive && 
      pm.material.id === materialId
    );
  };

  const getProductMaterialAssignment = (product, materialId) => {
    if (!product || !product.available_materials) return null;
    
    return product.available_materials.find(pm => pm.material.id === materialId);
  };

  const getMaterialPriceForProduct = (product, materialId) => {
    const material = getAvailableMaterials(product).find(m => m.id === materialId);
    return material ? material.pricePerM2 : 0;
  };

  const calculateProductMaterialPrice = (product, material, dimensions, quantity = 1) => {
    if (!product || !material || !dimensions) return 0;
    
    // Check if material is available for this product
    if (!isMaterialAvailableForProduct(product, material.id)) {
      console.warn(`Material ${material.id} is not available for product ${product.id}`);
      return 0;
    }
    
    // Calculate area in square meters (dimensions in cm)
    const area = (dimensions.width * dimensions.height) / 10000;
    
    // Calculate base material cost
    let materialCost = material.pricePerM2 * area * quantity;
    
    // Apply premium surcharge if applicable
    if (material.isPremium) {
      materialCost *= 1.2; // 20% premium surcharge
    }
    
    return materialCost;
  };

  const updatePriceWithMaterial = (product, material, dimensions, quantity = 1) => {
    const materialCost = calculateProductMaterialPrice(product, material, dimensions, quantity);
    updatePriceBreakdown(materialCost);
  };

  const selectProductMaterial = (material) => {
    // This would be used when a material is selected for the product
    console.log('✅ Product material selected:', material);
    return material;
  };

  const formatMaterialName = (material, locale = 'ar') => {
    if (!material) return '';
    return locale === 'ar' ? material.nameAr : material.nameEn;
  };

  const getMaterialImage = (material) => {
    if (!material) return '/placeholder-material.jpg';
    return material.image || '/placeholder-material.jpg';
  };

  const hasAvailableMaterials = (product) => {
    const materials = getAvailableMaterials(product);
    return materials.length > 0;
  };

  const getMaterialCount = (product) => {
    return getAvailableMaterials(product).length;
  };
  const getAvailableStock = (product, variant = null) => {
    if (variant) {
      return variant.stock || 0;
    }
    return product.stock || 0;
  };

  const isInStock = (product, variant = null) => {
    const stock = getAvailableStock(product, variant);
    return stock > 0;
  };

  const getStockStatus = (product, variant = null) => {
    const stock = getAvailableStock(product, variant);
    
    if (stock === 0) return 'out_of_stock';
    if (stock <= 5) return 'low_stock';
    return 'in_stock';
  };

  const getStockStatusText = (status) => {
    const statusMap = {
      'in_stock': 'متوفر',
      'low_stock': 'مخزون محدود',
      'out_of_stock': 'نفد المخزون'
    };
    return statusMap[status] || status;
  };

  // Quantity management
  const updateQuantity = (newQuantity) => {
    const maxQuantity = getAvailableStock(currentProduct.value, selectedVariant.value);
    const validQuantity = Math.min(Math.max(1, newQuantity), maxQuantity);
    productDetailsState.quantity = validQuantity;
    updatePriceBreakdown();
  };

  const incrementQuantity = () => {
    updateQuantity(quantity.value + 1);
  };

  const decrementQuantity = () => {
    updateQuantity(quantity.value - 1);
  };

  // Custom dimensions management
  const updateDimensions = (dimensions) => {
    productDetailsState.customDimensions = { ...dimensions };
    // Note: This would typically trigger a material price recalculation
    updatePriceBreakdown();
  };

  // Product validation functions
  const isValidProduct = (product) => {
    return product && 
           product.id && 
           product.nameAr && 
           product.nameEn && 
           product.basePrice >= 0;
  };

  const canAddToCart = (product, variant = null, quantity = 1) => {
    if (!isValidProduct(product)) return false;
    if (!isInStock(product, variant)) return false;
    if (quantity <= 0) return false;
    if (quantity > getAvailableStock(product, variant)) return false;
    
    return true;
  };

  // SEO functions
  const getSEOData = (product) => {
    if (!product) return null;
    
    return {
      title: product.seoTitle || `${product.nameAr} | VinylArt`,
      description: product.seoDescription || product.descriptionAr || '',
      keywords: product.tags ? product.tags.join(', ') : '',
      image: getMainImage(product)?.imageUrl || '',
      url: `/product/${product.slug}`,
      canonical: `/product/${product.slug}`
    };
  };

  // Product comparison functions
  const compareProducts = (product1, product2) => {
    if (!product1 || !product2) return 0;
    
    const price1 = product1.onSale ? 
      product1.basePrice * (1 - product1.discountPercent / 100) : 
      product1.basePrice;
    
    const price2 = product2.onSale ? 
      product2.basePrice * (1 - product2.discountPercent / 100) : 
      product2.basePrice;
    
    return price1 - price2;
  };

  // Related products management
  const loadRelatedProducts = async (categoryId, productId, limit = 8) => {
    try {
      const { result } = await getRelatedProducts(categoryId, productId, limit);
      const products = result.value?.products?.edges?.map(edge => edge.node) || [];
      
      // Filter out the current product
      productDetailsState.relatedProducts = products.filter(p => p.id !== productId);
      
      console.log(`✅ Loaded ${productDetailsState.relatedProducts.length} related products`);
    } catch (error) {
      console.error('❌ Error loading related products:', error);
      productDetailsState.relatedProducts = [];
    }
  };

  // Utility functions
  const formatPrice = (price, currency = 'DZD') => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDimensions = (dimensions) => {
    if (!dimensions) return '';
    return `${dimensions.width}×${dimensions.height} سم`;
  };

  const getDiscountPercentage = (product) => {
    return product.onSale ? product.discountPercent : 0;
  };

  const getDiscountLabel = (product) => {
    const discount = getDiscountPercentage(product);
    return discount > 0 ? `خصم ${discount}%` : '';
  };

  // State management
  const resetState = () => {
    productDetailsState.currentProduct = null;
    productDetailsState.relatedProducts = [];
    productDetailsState.selectedVariant = null;
    productDetailsState.selectedImage = null;
    productDetailsState.loading = false;
    productDetailsState.error = null;
    productDetailsState.quantity = 1;
    productDetailsState.customDimensions = { width: 100, height: 100 };
    productDetailsState.priceBreakdown = {
      basePrice: 0,
      discountAmount: 0,
      finalPrice: 0,
      materialCost: 0,
      totalCost: 0
    };
  };

  // Initialize
  const initialize = () => {
    resetState();
  };

  return {
    // State
    currentProduct,
    relatedProducts,
    selectedVariant,
    selectedImage,
    loading,
    error,
    quantity,
    customDimensions,
    priceBreakdown,

    // Queries
    getProductById,
    getProductBySlug,
    getRelatedProducts,
    searchProducts,

    // Product selection
    selectProduct,
    selectVariant,
    selectImage,

    // Image management
    getMainImage,
    getAllImages,
    getSortedImages,
    getCartImage,
    getGalleryImages,
    hasMultipleImages,
    getImageCount,
    validateImage,
    getValidImages,

    // Stock management
    getAvailableStock,
    isInStock,
    getStockStatus,
    getStockStatusText,

    // Quantity management
    updateQuantity,
    incrementQuantity,
    decrementQuantity,

    // Dimensions
    updateDimensions,

    // Price calculations
    calculateFinalPrice,
    calculateVariantPrice,
    updatePriceBreakdown,
    formatPrice,

    // Variant management
    getAvailableVariants,
    getAllVariants,
    getVariantById,
    getVariantBySku,
    isVariantAvailable,
    getVariantStockStatus,
    getVariantStockStatusText,
    selectVariant,
    clearVariantSelection,
    getDefaultVariant,
    getVariantDisplayPrice,
    getVariantAttributes,
    formatVariantName,

    // Product Materials Management
    getAvailableMaterials,
    getAllProductMaterials,
    isMaterialAvailableForProduct,
    getProductMaterialAssignment,
    getMaterialPriceForProduct,
    calculateProductMaterialPrice,
    updatePriceWithMaterial,
    selectProductMaterial,
    formatMaterialName,
    getMaterialImage,
    hasAvailableMaterials,
    getMaterialCount,

    // Validation
    isValidProduct,
    canAddToCart,

    // SEO
    getSEOData,

    // Comparison
    compareProducts,

    // Related products
    loadRelatedProducts,

    // Utilities
    formatDimensions,
    getDiscountPercentage,
    getDiscountLabel,

    // State management
    resetState,
    initialize
  };
};
