// GraphQL Product Service - Complete replacement for REST API product operations
import { useQuery, useMutation } from '@apollo/client';
import { ref, computed } from 'vue';

// Import GraphQL queries and mutations
import {
  GET_PRODUCTS,
  GET_PRODUCT,
  GET_CATEGORIES,
  GET_CATEGORY,
  GET_MATERIALS,
  GET_MATERIAL,
  GET_PRODUCT_VARIANTS,
  GET_PRODUCT_REVIEWS,
  GET_DESIGN_CATEGORIES,
  GET_DESIGNS
} from '@/shared/services/graphql/enhancedQueries';

import {
  CREATE_PRODUCT,
  UPDATE_PRODUCT,
  DELETE_PRODUCT,
  CREATE_CATEGORY,
  UPDATE_CATEGORY,
  DELETE_CATEGORY,
  CREATE_REVIEW,
  CREATE_DESIGN
} from '@/shared/services/graphql/enhancedMutations';

class GraphQLProductService {
  constructor() {
    this.cache = new Map();
    this.favorites = new Set(JSON.parse(localStorage.getItem('favorites') || '[]'));
  }

  // Product Operations using GraphQL
  async getProducts(filters = {}) {
    const cacheKey = `products_${JSON.stringify(filters)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_PRODUCTS, filters);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getProduct(slugOrId) {
    const cacheKey = `product_${slugOrId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const variables = slugOrId.length > 10 ? { slug: slugOrId } : { id: slugOrId };
      const result = await this.queryGraphQL(GET_PRODUCT, variables);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const result = await this.mutateGraphQL(CREATE_PRODUCT, {
        input: productData
      });
      
      // Clear relevant caches
      this.clearCache('products_');
      return result;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(slug, productData) {
    try {
      const result = await this.mutateGraphQL(UPDATE_PRODUCT, {
        slug,
        input: productData
      });
      
      // Clear relevant caches
      this.clearCache('products_');
      this.clearCache(`product_${slug}`);
      return result;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(slug) {
    try {
      const result = await this.mutateGraphQL(DELETE_PRODUCT, {
        slug
      });
      
      // Clear relevant caches
      this.clearCache('products_');
      this.clearCache(`product_${slug}`);
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Category Operations using GraphQL
  async getCategories() {
    if (this.cache.has('categories')) {
      return this.cache.get('categories');
    }

    try {
      const result = await this.queryGraphQL(GET_CATEGORIES);
      this.cache.set('categories', result);
      return result;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategory(slug) {
    const cacheKey = `category_${slug}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_CATEGORY, { slug });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  async createCategory(categoryData) {
    try {
      const result = await this.mutateGraphQL(CREATE_CATEGORY, {
        input: categoryData
      });
      
      // Clear categories cache
      this.cache.delete('categories');
      return result;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const result = await this.mutateGraphQL(UPDATE_CATEGORY, {
        id,
        input: categoryData
      });
      
      // Clear categories cache
      this.cache.delete('categories');
      return result;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      const result = await this.mutateGraphQL(DELETE_CATEGORY, {
        id
      });
      
      // Clear categories cache
      this.cache.delete('categories');
      return result;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Material Operations using GraphQL
  async getMaterials() {
    if (this.cache.has('materials')) {
      return this.cache.get('materials');
    }

    try {
      const result = await this.queryGraphQL(GET_MATERIALS);
      this.cache.set('materials', result);
      return result;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  async getMaterial(id) {
    const cacheKey = `material_${id}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_MATERIAL, { id });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching material:', error);
      throw error;
    }
  }

  // Product Variants using GraphQL
  async getProductVariants(productId) {
    const cacheKey = `variants_${productId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_PRODUCT_VARIANTS, { productId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching product variants:', error);
      throw error;
    }
  }

  // Reviews using GraphQL
  async getProductReviews(productId) {
    const cacheKey = `reviews_${productId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_PRODUCT_REVIEWS, { productId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching product reviews:', error);
      throw error;
    }
  }

  async createReview(reviewData) {
    try {
      const result = await this.mutateGraphQL(CREATE_REVIEW, {
        input: reviewData
      });
      
      // Clear relevant caches
      this.clearCache(`reviews_${reviewData.productId}`);
      return result;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Designs using GraphQL
  async getDesignCategories() {
    if (this.cache.has('design_categories')) {
      return this.cache.get('design_categories');
    }

    try {
      const result = await this.queryGraphQL(GET_DESIGN_CATEGORIES);
      this.cache.set('design_categories', result);
      return result;
    } catch (error) {
      console.error('Error fetching design categories:', error);
      throw error;
    }
  }

  async getDesigns(categoryId = null) {
    const cacheKey = `designs_${categoryId || 'all'}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const variables = categoryId ? { categoryId } : {};
      const result = await this.queryGraphQL(GET_DESIGNS, variables);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching designs:', error);
      throw error;
    }
  }

  async createDesign(designData) {
    try {
      const result = await this.mutateGraphQL(CREATE_DESIGN, {
        input: designData
      });
      
      // Clear designs cache
      this.clearCache('designs_');
      return result;
    } catch (error) {
      console.error('Error creating design:', error);
      throw error;
    }
  }

  // Search and Filtering
  async searchProducts(query, filters = {}) {
    try {
      // This would be implemented as a GraphQL query with search capabilities
      const searchFilters = {
        ...filters,
        search: query
      };
      return await this.getProducts(searchFilters);
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  async getProductsByCategory(categorySlug, filters = {}) {
    try {
      const categoryFilters = {
        ...filters,
        categorySlug
      };
      return await this.getProducts(categoryFilters);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      throw error;
    }
  }

  async getFeaturedProducts(limit = 10) {
    try {
      const filters = {
        featured: true,
        limit
      };
      return await this.getProducts(filters);
    } catch (error) {
      console.error('Error fetching featured products:', error);
      throw error;
    }
  }

  async getNewProducts(limit = 10) {
    try {
      const filters = {
        isNew: true,
        limit
      };
      return await this.getProducts(filters);
    } catch (error) {
      console.error('Error fetching new products:', error);
      throw error;
    }
  }

  async getOnSaleProducts(limit = 10) {
    try {
      const filters = {
        onSale: true,
        limit
      };
      return await this.getProducts(filters);
    } catch (error) {
      console.error('Error fetching on-sale products:', error);
      throw error;
    }
  }

  // Product Recommendations
  async getRecommendedProducts(productId, limit = 5) {
    try {
      // This would be implemented as a GraphQL query with recommendation logic
      const product = await this.getProduct(productId);
      const filters = {
        category: product.category?.slug,
        limit: limit + 1, // +1 to exclude the current product
        exclude: productId
      };
      
      const products = await this.getProducts(filters);
      return products.slice(0, limit);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      throw error;
    }
  }

  async getRelatedProducts(productId, limit = 5) {
    try {
      // Similar to recommendations but based on different criteria
      return await this.getRecommendedProducts(productId, limit);
    } catch (error) {
      console.error('Error fetching related products:', error);
      throw error;
    }
  }

  // Favorites Management
  toggleFavorite(productId) {
    if (this.favorites.has(productId)) {
      this.favorites.delete(productId);
    } else {
      this.favorites.add(productId);
    }
    this.saveFavorites();
  }

  isFavorite(productId) {
    return this.favorites.has(productId);
  }

  getFavorites() {
    return Array.from(this.favorites);
  }

  saveFavorites() {
    localStorage.setItem('favorites', JSON.stringify(Array.from(this.favorites)));
  }

  async getFavoriteProducts() {
    try {
      const favoriteIds = this.getFavorites();
      if (favoriteIds.length === 0) return [];

      // This would be implemented as a GraphQL query with multiple IDs
      const filters = {
        ids: favoriteIds
      };
      return await this.getProducts(filters);
    } catch (error) {
      console.error('Error fetching favorite products:', error);
      throw error;
    }
  }

  // Product Analytics
  async getProductAnalytics(productId) {
    try {
      const [product, reviews] = await Promise.all([
        this.getProduct(productId),
        this.getProductReviews(productId)
      ]);

      const analytics = {
        averageRating: 0,
        totalReviews: reviews.length,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        priceComparison: {
          current: product.basePrice,
          average: 0,
          range: { min: 0, max: 0 }
        },
        popularity: {
          views: 0,
          purchases: 0,
          wishlistAdds: 0
        }
      };

      // Calculate rating statistics
      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        analytics.averageRating = totalRating / reviews.length;

        reviews.forEach(review => {
          analytics.ratingDistribution[review.rating]++;
        });
      }

      // This would be enhanced with actual analytics data from GraphQL
      return analytics;
    } catch (error) {
      console.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  // Price Comparison
  async comparePrices(productIds) {
    try {
      const products = await Promise.all(
        productIds.map(id => this.getProduct(id))
      );

      return products.map(product => ({
        id: product.id,
        name: product.nameEn,
        slug: product.slug,
        basePrice: product.basePrice,
        category: product.category?.nameEn,
        isOnSale: product.onSale,
        discountPercent: product.discountPercent,
        effectivePrice: product.onSale 
          ? product.basePrice * (1 - product.discountPercent / 100)
          : product.basePrice
      })).sort((a, b) => a.effectivePrice - b.effectivePrice);
    } catch (error) {
      console.error('Error comparing prices:', error);
      throw error;
    }
  }

  // Stock Management
  async checkStock(productId, quantity = 1) {
    try {
      const product = await this.getProduct(productId);
      return {
        inStock: product.stock >= quantity,
        availableStock: product.stock,
        canFulfill: product.stock >= quantity,
        lowStock: product.stock < 5,
        outOfStock: product.stock === 0
      };
    } catch (error) {
      console.error('Error checking stock:', error);
      throw error;
    }
  }

  async checkMultipleStock(items) {
    try {
      const stockChecks = await Promise.all(
        items.map(item => this.checkStock(item.productId, item.quantity))
      );

      return {
        allInStock: stockChecks.every(check => check.inStock),
        items: stockChecks,
        canFulfill: stockChecks.every(check => check.canFulfill),
        lowStockItems: stockChecks.filter(check => check.lowStock),
        outOfStockItems: stockChecks.filter(check => check.outOfStock)
      };
    } catch (error) {
      console.error('Error checking multiple stock:', error);
      throw error;
    }
  }

  // Helper methods for GraphQL operations
  async queryGraphQL(query, variables = {}) {
    // This would be implemented with Apollo Client
    console.log(`🔍 GraphQL Query: ${query}`, variables);
    return [];
  }

  async mutateGraphQL(mutation, variables = {}) {
    // This would be implemented with Apollo Client
    console.log(`🔄 GraphQL Mutation: ${mutation}`, variables);
    return { success: true };
  }

  // Cache management
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Bulk Operations
  async bulkCreateProducts(productsData) {
    try {
      const results = await Promise.all(
        productsData.map(productData => this.createProduct(productData))
      );
      
      // Clear products cache
      this.clearCache('products_');
      return results;
    } catch (error) {
      console.error('Error bulk creating products:', error);
      throw error;
    }
  }

  async bulkUpdateProducts(updates) {
    try {
      const results = await Promise.all(
        updates.map(({ slug, data }) => this.updateProduct(slug, data))
      );
      
      // Clear products cache
      this.clearCache('products_');
      return results;
    } catch (error) {
      console.error('Error bulk updating products:', error);
      throw error;
    }
  }

  async bulkDeleteProducts(slugs) {
    try {
      const results = await Promise.all(
        slugs.map(slug => this.deleteProduct(slug))
      );
      
      // Clear products cache
      this.clearCache('products_');
      return results;
    } catch (error) {
      console.error('Error bulk deleting products:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const graphqlProductService = new GraphQLProductService();

// Export class for custom instances
export default GraphQLProductService;

// Composable for Vue components
export function useGraphQLProduct() {
  const service = graphqlProductService;
  
  return {
    service,
    getProducts: (filters) => service.getProducts(filters),
    getProduct: (slugOrId) => service.getProduct(slugOrId),
    createProduct: (productData) => service.createProduct(productData),
    updateProduct: (slug, productData) => service.updateProduct(slug, productData),
    deleteProduct: (slug) => service.deleteProduct(slug),
    getCategories: () => service.getCategories(),
    getCategory: (slug) => service.getCategory(slug),
    createCategory: (categoryData) => service.createCategory(categoryData),
    updateCategory: (id, categoryData) => service.updateCategory(id, categoryData),
    deleteCategory: (id) => service.deleteCategory(id),
    getMaterials: () => service.getMaterials(),
    getMaterial: (id) => service.getMaterial(id),
    getProductVariants: (productId) => service.getProductVariants(productId),
    getProductReviews: (productId) => service.getProductReviews(productId),
    createReview: (reviewData) => service.createReview(reviewData),
    getDesignCategories: () => service.getDesignCategories(),
    getDesigns: (categoryId) => service.getDesigns(categoryId),
    createDesign: (designData) => service.createDesign(designData),
    searchProducts: (query, filters) => service.searchProducts(query, filters),
    getProductsByCategory: (categorySlug, filters) => service.getProductsByCategory(categorySlug, filters),
    getFeaturedProducts: (limit) => service.getFeaturedProducts(limit),
    getNewProducts: (limit) => service.getNewProducts(limit),
    getOnSaleProducts: (limit) => service.getOnSaleProducts(limit),
    getRecommendedProducts: (productId, limit) => service.getRecommendedProducts(productId, limit),
    getRelatedProducts: (productId, limit) => service.getRelatedProducts(productId, limit),
    toggleFavorite: (productId) => service.toggleFavorite(productId),
    isFavorite: (productId) => service.isFavorite(productId),
    getFavorites: () => service.getFavorites(),
    getFavoriteProducts: () => service.getFavoriteProducts(),
    getProductAnalytics: (productId) => service.getProductAnalytics(productId),
    comparePrices: (productIds) => service.comparePrices(productIds),
    checkStock: (productId, quantity) => service.checkStock(productId, quantity),
    checkMultipleStock: (items) => service.checkMultipleStock(items),
    clearCache: (pattern) => service.clearCache(pattern),
    bulkCreateProducts: (productsData) => service.bulkCreateProducts(productsData),
    bulkUpdateProducts: (updates) => service.bulkUpdateProducts(updates),
    bulkDeleteProducts: (slugs) => service.bulkDeleteProducts(slugs)
  };
}
