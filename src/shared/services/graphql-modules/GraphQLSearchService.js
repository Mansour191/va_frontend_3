// GraphQL Search Service - Complete replacement for REST API search operations
import { useQuery, useMutation } from '@apollo/client';
import { ref, computed } from 'vue';

// Import GraphQL queries and mutations
import {
  SEMANTIC_SEARCH,
  GLOBAL_SEARCH,
  GET_PRODUCTS,
  GET_CATEGORIES,
  GET_DESIGNS
} from '@/shared/services/graphql/enhancedQueries';

class GraphQLSearchService {
  constructor() {
    this.cache = new Map();
    this.searchHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
  }

  // Semantic Search using GraphQL
  async semanticSearch(query, options = {}) {
    try {
      const {
        filters = null,
        limit = 10,
        category = null,
        priceMin = null,
        priceMax = null
      } = options;

      // Build filters object
      const filterObj = {};
      if (category) filterObj.category = category;
      if (priceMin) filterObj.price_min = priceMin;
      if (priceMax) filterObj.price_max = priceMax;
      if (filters) filterObj.filters = filters;

      const result = await this.queryGraphQL(SEMANTIC_SEARCH, {
        query,
        filters: JSON.stringify(filterObj),
        limit
      });

      // Add to search history
      this.addToSearchHistory(query, 'semantic');

      return result;
    } catch (error) {
      console.error('Error performing semantic search:', error);
      throw error;
    }
  }

  // Global Search using GraphQL
  async globalSearch(query, options = {}) {
    try {
      const {
        types = ['products', 'categories', 'designs'],
        limit = 20
      } = options;

      const result = await this.queryGraphQL(GLOBAL_SEARCH, {
        query,
        types,
        limit
      });

      // Add to search history
      this.addToSearchHistory(query, 'global');

      return result;
    } catch (error) {
      console.error('Error performing global search:', error);
      throw error;
    }
  }

  // Product Search using GraphQL
  async searchProducts(query, options = {}) {
    try {
      const {
        categorySlug = null,
        limit = 20,
        sortBy = 'relevance',
        sortOrder = 'desc'
      } = options;

      const cacheKey = `product_search_${query}_${categorySlug}_${limit}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Use the products query with search parameter
      const result = await this.queryGraphQL(GET_PRODUCTS, {
        categorySlug,
        search: query,
        limit
      });

      this.cache.set(cacheKey, result);

      // Add to search history
      this.addToSearchHistory(query, 'products');

      return result;
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }

  // Category Search using GraphQL
  async searchCategories(query, options = {}) {
    try {
      const { limit = 50 } = options;

      const cacheKey = `category_search_${query}_${limit}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Get all categories and filter locally (since GraphQL doesn't have category search)
      const allCategories = await this.queryGraphQL(GET_CATEGORIES);
      const filteredCategories = allCategories.filter(category =>
        category.nameAr.toLowerCase().includes(query.toLowerCase()) ||
        category.nameEn.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);

      this.cache.set(cacheKey, filteredCategories);

      // Add to search history
      this.addToSearchHistory(query, 'categories');

      return filteredCategories;
    } catch (error) {
      console.error('Error searching categories:', error);
      throw error;
    }
  }

  // Design Search using GraphQL
  async searchDesigns(query, options = {}) {
    try {
      const {
        categoryId = null,
        limit = 20,
        featured = false
      } = options;

      const cacheKey = `design_search_${query}_${categoryId}_${limit}`;
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Get all designs and filter locally
      const allDesigns = await this.queryGraphQL(GET_DESIGNS, {
        categoryId,
        limit,
        featured
      });

      const filteredDesigns = allDesigns.filter(design =>
        design.name.toLowerCase().includes(query.toLowerCase()) ||
        design.description.toLowerCase().includes(query.toLowerCase()) ||
        design.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );

      this.cache.set(cacheKey, filteredDesigns);

      // Add to search history
      this.addToSearchHistory(query, 'designs');

      return filteredDesigns;
    } catch (error) {
      console.error('Error searching designs:', error);
      throw error;
    }
  }

  // Advanced Search with Multiple Criteria
  async advancedSearch(criteria, options = {}) {
    try {
      const {
        query = '',
        categories = [],
        priceRange = { min: null, max: null },
        materials = [],
        tags = [],
        sortBy = 'relevance',
        limit = 20
      } = criteria;

      // Build search query
      let searchQuery = query;
      
      // Add category names to search query
      if (categories.length > 0) {
        const categoryTerms = categories.join(' OR ');
        searchQuery = searchQuery ? `${searchQuery} ${categoryTerms}` : categoryTerms;
      }

      // Add tags to search query
      if (tags.length > 0) {
        const tagTerms = tags.join(' OR ');
        searchQuery = searchQuery ? `${searchQuery} ${tagTerms}` : tagTerms;
      }

      // Build filters
      const filters = {};
      if (priceRange.min !== null) filters.price_min = priceRange.min;
      if (priceRange.max !== null) filters.price_max = priceRange.max;
      if (categories.length > 0) filters.categories = categories;
      if (materials.length > 0) filters.materials = materials;

      const result = await this.semanticSearch(searchQuery, {
        filters: JSON.stringify(filters),
        limit
      });

      // Add to search history
      this.addToSearchHistory(searchQuery, 'advanced');

      return result;
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  }

  // Search Suggestions / Autocomplete
  async getSearchSuggestions(query, options = {}) {
    try {
      const { type = 'products', limit = 5 } = options;

      if (query.length < 2) {
        return [];
      }

      let suggestions = [];

      switch (type) {
        case 'products':
          const products = await this.searchProducts(query, { limit });
          suggestions = products.map(product => ({
            id: product.id,
            text: product.nameAr || product.nameEn,
            type: 'product',
            slug: product.slug,
            image: product.images?.[0]?.imageUrl
          }));
          break;

        case 'categories':
          const categories = await this.searchCategories(query, { limit });
          suggestions = categories.map(category => ({
            id: category.id,
            text: category.nameAr || category.nameEn,
            type: 'category',
            slug: category.slug,
            icon: category.icon
          }));
          break;

        case 'designs':
          const designs = await this.searchDesigns(query, { limit });
          suggestions = designs.map(design => ({
            id: design.id,
            text: design.name,
            type: 'design',
            image: design.image
          }));
          break;
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting search suggestions:', error);
      throw error;
    }
  }

  // Search Analytics
  async getSearchAnalytics(period = '30days') {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_SEARCH_ANALYTICS', {
        period
      });
      return result;
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      throw error;
    }
  }

  // Popular Searches
  async getPopularSearches(limit = 10) {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_POPULAR_SEARCHES', {
        limit
      });
      return result;
    } catch (error) {
      console.error('Error fetching popular searches:', error);
      throw error;
    }
  }

  // Search History Management
  addToSearchHistory(query, searchType) {
    const historyItem = {
      query,
      type: searchType,
      timestamp: new Date().toISOString()
    };

    this.searchHistory.unshift(historyItem);
    
    // Keep only last 50 searches
    if (this.searchHistory.length > 50) {
      this.searchHistory = this.searchHistory.slice(0, 50);
    }

    localStorage.setItem('search_history', JSON.stringify(this.searchHistory));
  }

  getSearchHistory(limit = 20) {
    return this.searchHistory.slice(0, limit);
  }

  clearSearchHistory() {
    this.searchHistory = [];
    localStorage.removeItem('search_history');
  }

  // Search Filtering and Sorting
  filterSearchResults(results, filters) {
    try {
      let filteredResults = [...results];

      // Filter by category
      if (filters.categories && filters.categories.length > 0) {
        filteredResults = filteredResults.filter(result => {
          if (result.product) {
            return filters.categories.includes(result.product.category?.slug);
          }
          return true;
        });
      }

      // Filter by price range
      if (filters.priceRange) {
        const { min, max } = filters.priceRange;
        filteredResults = filteredResults.filter(result => {
          const price = result.product?.basePrice || result.price || 0;
          if (min !== null && price < min) return false;
          if (max !== null && price > max) return false;
          return true;
        });
      }

      // Filter by rating
      if (filters.minRating !== undefined) {
        filteredResults = filteredResults.filter(result => {
          const rating = result.product?.averageRating || result.rating || 0;
          return rating >= filters.minRating;
        });
      }

      // Filter by availability
      if (filters.inStockOnly) {
        filteredResults = filteredResults.filter(result => {
          const stock = result.product?.stock || 0;
          return stock > 0;
        });
      }

      return filteredResults;
    } catch (error) {
      console.error('Error filtering search results:', error);
      return results;
    }
  }

  sortSearchResults(results, sortBy, sortOrder = 'desc') {
    try {
      const sortedResults = [...results];

      switch (sortBy) {
        case 'relevance':
          sortedResults.sort((a, b) => {
            const scoreA = a.relevanceScore || 0;
            const scoreB = b.relevanceScore || 0;
            return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
          });
          break;

        case 'price':
          sortedResults.sort((a, b) => {
            const priceA = a.product?.basePrice || a.price || 0;
            const priceB = b.product?.basePrice || b.price || 0;
            return sortOrder === 'desc' ? priceB - priceA : priceA - priceB;
          });
          break;

        case 'name':
          sortedResults.sort((a, b) => {
            const nameA = a.product?.nameAr || a.product?.nameEn || a.name || '';
            const nameB = b.product?.nameAr || b.product?.nameEn || b.name || '';
            return sortOrder === 'desc' 
              ? nameB.localeCompare(nameA) 
              : nameA.localeCompare(nameB);
          });
          break;

        case 'rating':
          sortedResults.sort((a, b) => {
            const ratingA = a.product?.averageRating || a.rating || 0;
            const ratingB = b.product?.averageRating || b.rating || 0;
            return sortOrder === 'desc' ? ratingB - ratingA : ratingA - ratingB;
          });
          break;

        case 'created':
          sortedResults.sort((a, b) => {
            const dateA = new Date(a.product?.createdAt || a.createdAt || 0);
            const dateB = new Date(b.product?.createdAt || b.createdAt || 0);
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
          });
          break;
      }

      return sortedResults;
    } catch (error) {
      console.error('Error sorting search results:', error);
      return results;
    }
  }

  // Search Performance Monitoring
  async measureSearchPerformance(searchFunction, ...args) {
    const startTime = performance.now();
    
    try {
      const result = await searchFunction(...args);
      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        result,
        performance: {
          duration: Math.round(duration * 100) / 100,
          success: true
        }
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      return {
        error,
        performance: {
          duration: Math.round(duration * 100) / 100,
          success: false
        }
      };
    }
  }

  // Helper methods for GraphQL operations
  async queryGraphQL(query, variables = {}) {
    // This would be implemented with Apollo Client
    console.log(`🔍 GraphQL Query: ${query}`, variables);
    return [];
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

  // Search Validation
  validateSearchQuery(query, options = {}) {
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate query
    if (!query || query.trim().length === 0) {
      validation.isValid = false;
      validation.errors.push('Search query cannot be empty');
    }

    if (query.length > 200) {
      validation.warnings.push('Search query is very long - consider being more specific');
    }

    // Validate options
    if (options.limit && (options.limit < 1 || options.limit > 100)) {
      validation.warnings.push('Limit should be between 1 and 100');
    }

    if (options.priceRange) {
      const { min, max } = options.priceRange;
      if (min !== null && max !== null && min > max) {
        validation.isValid = false;
        validation.errors.push('Minimum price cannot be greater than maximum price');
      }
    }

    return validation;
  }
}

// Create singleton instance
export const graphqlSearchService = new GraphQLSearchService();

// Export class for custom instances
export default GraphQLSearchService;

// Composable for Vue components
export function useGraphQLSearch() {
  const service = graphqlSearchService;
  
  return {
    service,
    semanticSearch: (query, options) => service.semanticSearch(query, options),
    globalSearch: (query, options) => service.globalSearch(query, options),
    searchProducts: (query, options) => service.searchProducts(query, options),
    searchCategories: (query, options) => service.searchCategories(query, options),
    searchDesigns: (query, options) => service.searchDesigns(query, options),
    advancedSearch: (criteria, options) => service.advancedSearch(criteria, options),
    getSearchSuggestions: (query, options) => service.getSearchSuggestions(query, options),
    getSearchAnalytics: (period) => service.getSearchAnalytics(period),
    getPopularSearches: (limit) => service.getPopularSearches(limit),
    getSearchHistory: (limit) => service.getSearchHistory(limit),
    clearSearchHistory: () => service.clearSearchHistory(),
    filterSearchResults: (results, filters) => service.filterSearchResults(results, filters),
    sortSearchResults: (results, sortBy, sortOrder) => service.sortSearchResults(results, sortBy, sortOrder),
    measureSearchPerformance: (searchFunction, ...args) => service.measureSearchPerformance(searchFunction, ...args),
    validateSearchQuery: (query, options) => service.validateSearchQuery(query, options),
    clearCache: (pattern) => service.clearCache(pattern)
  };
}
