import { useApolloClient } from '@vue/apollo-composable';
import { gql } from '@apollo/client/core';
import i18n from '@/plugins/i18n';

class DesignCategoryService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * GraphQL query for fetching active design categories
   */
  get CATEGORIES_QUERY() {
    return gql`
      query GetCategories {
        categories {
          id
          name
          nameAr
          nameEn
          slug
          description
          image
          isActive
          designCount
          createdAt
          updatedAt
        }
      }
    `;
  }

  /**
   * GraphQL query for fetching a single category by slug
   */
  get CATEGORY_BY_SLUG_QUERY() {
    return gql`
      query GetCategoryBySlug($slug: String!) {
        designCategory(slug: $slug) {
          id
          name
          nameAr
          nameEn
          slug
          description
          image
          isActive
          designCount
          createdAt
          updatedAt
        }
      }
    `;
  }

  /**
   * Fetch all active design categories ordered by design count
   */
  async getCategories() {
    const cacheKey = `design_categories_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { resolveClient } = useApolloClient();
      const apolloClient = resolveClient();
      
      const result = await apolloClient.query({
        query: this.CATEGORIES_QUERY,
        variables: {},
        fetchPolicy: 'network-only' // Skip cache for now to ensure fresh data
      });

      const categories = result.data?.categories || [];
      const transformedCategories = this._transformCategories(categories);
      
      this._setCache(cacheKey, transformedCategories);
      return transformedCategories;
    } catch (error) {
      console.error('❌ Error fetching design categories:', error);
      return this._getFallbackCategories();
    }
  }

  /**
   * Fetch a single design category by slug
   */
  async getCategoryBySlug(slug) {
    const cacheKey = `design_category_${slug}_${i18n.global.locale.value || i18n.global.locale}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const { resolveClient } = useApolloClient();
      const apolloClient = resolveClient();
      
      const result = await apolloClient.query({
        query: this.CATEGORY_BY_SLUG_QUERY,
        variables: { slug },
        fetchPolicy: 'network-only'
      });

      const category = result.data?.designCategory;
      if (!category) {
        throw new Error(`Category with slug "${slug}" not found`);
      }

      const transformedCategory = this._transformCategory(category);
      this._setCache(cacheKey, transformedCategory);
      return transformedCategory;
    } catch (error) {
      console.error(`❌ Error fetching design category ${slug}:`, error);
      return this._getFallbackCategory(slug);
    }
  }

  /**
   * Transform categories data for frontend use
   */
  _transformCategories(categories) {
    return categories.map(category => this._transformCategory(category));
  }

  /**
   * Transform single category data
   */
  _transformCategory(category) {
    return {
      id: category.id,
      name: category.name, // Already resolved by GraphQL resolver
      nameAr: category.nameAr,
      nameEn: category.nameEn,
      slug: category.slug,
      description: category.description,
      image: category.image,
      isActive: category.isActive,
      designCount: category.designCount || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }

  /**
   * Fallback categories in case of API failure
   */
  _getFallbackCategories() {
    return [
      {
        id: 1,
        name: 'Islamic Patterns',
        nameAr: 'زخارف إسلامية',
        nameEn: 'Islamic Patterns',
        slug: 'islamic-patterns',
        description: 'Traditional Islamic geometric patterns and calligraphy designs',
        image: '/images/categories/islamic-patterns.jpg',
        isActive: true,
        designCount: 25,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        name: 'Modern Abstract',
        nameAr: 'تجريد حديث',
        nameEn: 'Modern Abstract',
        slug: 'modern-abstract',
        description: 'Contemporary abstract art designs and patterns',
        image: '/images/categories/modern-abstract.jpg',
        isActive: true,
        designCount: 18,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 3,
        name: 'Nature & Landscapes',
        nameAr: 'طبيعة ومناظر طبيعية',
        nameEn: 'Nature & Landscapes',
        slug: 'nature-landscapes',
        description: 'Beautiful nature scenes and landscape designs',
        image: '/images/categories/nature-landscapes.jpg',
        isActive: true,
        designCount: 32,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 4,
        name: 'Floral Patterns',
        nameAr: 'زخارف زهرية',
        nameEn: 'Floral Patterns',
        slug: 'floral-patterns',
        description: 'Elegant floral patterns and botanical designs',
        image: '/images/categories/floral-patterns.jpg',
        isActive: true,
        designCount: 21,
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];
  }

  /**
   * Fallback category by slug
   */
  _getFallbackCategory(slug) {
    const categories = this._getFallbackCategories();
    return categories.find(cat => cat.slug === slug) || null;
  }

  /**
   * Check if cache is still valid
   */
  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < this.cacheTTL);
  }

  /**
   * Set cache with timestamp
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear all cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get category image URL with fallback
   */
  getCategoryImageUrl(category) {
    if (category.image) {
      // If it's a full URL, return as is
      if (category.image.startsWith('http')) {
        return category.image;
      }
      // If it's a relative path, prepend base URL
      const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
      return `${baseUrl}${category.image.startsWith('/') ? '' : '/'}${category.image}`;
    }
    
    // Fallback to placeholder
    return '/images/placeholder-category.jpg';
  }
}

export default new DesignCategoryService();
