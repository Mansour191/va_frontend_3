/**
 * WishlistService.js
 * خدمة إدارة قائمة المفضلة والربط مع GraphQL API
 */

import apolloClient from '@/shared/integration/services/apollo.js';
import { gql } from '@apollo/client/core';

// GraphQL Mutations
const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($input: WishlistItemInput!) {
    toggleWishlist(input: $input) {
      success
      message
      isInWishlist
      wishlistItem {
        id
        product {
          id
          name_ar
          name_en
          slug
          base_price
          stock
          is_active
          on_sale
          discount_percent
        }
        created_at
      }
      wishlistCount
    }
  }
`;

const MOVE_TO_CART = gql`
  mutation MoveToCart($wishlistItemId: ID!, $quantity: Int, $materialId: Int, $width: Float, $height: Float, $dimensionUnit: String, $deliveryType: String, $wilayaId: String) {
    moveToCart(
      wishlistItemId: $wishlistItemId
      quantity: $quantity
      materialId: $materialId
      width: $width
      height: $height
      dimensionUnit: $dimensionUnit
      deliveryType: $deliveryType
      wilayaId: $wilayaId
    ) {
      success
      message
      cartItem {
        id
        product {
          id
          name_ar
          name_en
        }
        quantity
      }
      removedFromWishlist
    }
  }
`;

const CLEAR_WISHLIST = gql`
  mutation ClearWishlist {
    clearWishlist {
      success
      message
      clearedCount
    }
  }
`;

// GraphQL Queries
const GET_MY_WISHLIST = gql`
  query GetMyWishlist {
    myWishlist {
      id
      product {
        id
        name_ar
        name_en
        slug
        base_price
        stock
        is_active
        on_sale
        discount_percent
        images {
          id
          image_url
          is_main
        }
      }
      created_at
      isAvailable
      isInStock
      currentPrice
      hasDiscount
      discountPercentage
      discountedPrice
      savingsAmount
      daysInWishlist
    }
  }
`;

const GET_WISHLIST_COUNT = gql`
  query GetWishlistCount {
    wishlistCount
  }
`;

class WishlistService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * جلب عناصر المفضلة للمستخدم
   * @returns {Promise<Array>} - قائمة عناصر المفضلة
   */
  async getWishlistItems() {
    const cacheKey = 'wishlist_items';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const response = await apolloClient.query({
        query: GET_MY_WISHLIST,
        fetchPolicy: 'network-only'
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const items = this._transformWishlistItems(response.data.myWishlist || []);
      this._setCache(cacheKey, items);
      return items;
    } catch (error) {
      console.error('❌ Error fetching wishlist items:', error);
      return this.getFallbackWishlistItems();
    }
  }

  /**
   * تبديل حالة المنتج في المفضلة (إضافة/إزالة)
   * @param {number} productId - معرف المنتج
   * @returns {Promise<Object>} - نتيجة العملية
   */
  async toggleWishlist(productId) {
    try {
      const response = await apolloClient.mutate({
        mutation: TOGGLE_WISHLIST,
        variables: {
          input: {
            productId: productId
          }
        },
        update: (cache) => {
          // Invalidate wishlist cache
          cache.evict({ fieldName: 'myWishlist' });
          cache.evict({ fieldName: 'wishlistCount' });
        }
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const result = response.data.toggleWishlist;
      
      // Clear local cache
      this.cache.delete('wishlist_items');
      
      return {
        success: result.success,
        message: result.message,
        is_in_wishlist: result.isInWishlist,
        wishlist_item: result.wishlistItem ? this._transformWishlistItem(result.wishlistItem) : null,
        wishlist_count: result.wishlistCount
      };
    } catch (error) {
      console.error('❌ Error toggling wishlist:', error);
      throw error;
    }
  }

  /**
   * نقل منتج من المفضلة إلى السلة
   * @param {number} wishlistItemId - معرف عنصر المفضلة
   * @param {Object} options - خيارات الإضافة للسلة
   * @returns {Promise<Object>} - نتيجة العملية
   */
  async moveToCart(wishlistItemId, options = {}) {
    try {
      const response = await apolloClient.mutate({
        mutation: MOVE_TO_CART,
        variables: {
          wishlistItemId,
          quantity: options.quantity || 1,
          materialId: options.materialId,
          width: options.width,
          height: options.height,
          dimensionUnit: options.dimensionUnit || 'cm',
          deliveryType: options.deliveryType || 'home',
          wilayaId: options.wilayaId
        },
        update: (cache) => {
          // Invalidate wishlist cache
          cache.evict({ fieldName: 'myWishlist' });
          cache.evict({ fieldName: 'wishlistCount' });
        }
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const result = response.data.moveToCart;
      
      // Clear local cache
      this.cache.delete('wishlist_items');
      
      return {
        success: result.success,
        message: result.message,
        cart_item: result.cartItem,
        removed_from_wishlist: result.removedFromWishlist
      };
    } catch (error) {
      console.error('❌ Error moving to cart:', error);
      throw error;
    }
  }

  /**
   * تفريغ المفضلة بالكامل
   * @returns {Promise<Object>} - نتيجة العملية
   */
  async clearWishlist() {
    try {
      const response = await apolloClient.mutate({
        mutation: CLEAR_WISHLIST,
        update: (cache) => {
          // Invalidate wishlist cache
          cache.evict({ fieldName: 'myWishlist' });
          cache.evict({ fieldName: 'wishlistCount' });
        }
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      const result = response.data.clearWishlist;
      
      // Clear local cache
      this.cache.delete('wishlist_items');
      
      return {
        success: result.success,
        message: result.message,
        cleared_count: result.clearedCount
      };
    } catch (error) {
      console.error('❌ Error clearing wishlist:', error);
      throw error;
    }
  }

  /**
   * الحصول على عدد عناصر المفضلة
   * @returns {Promise<number>} - عدد العناصر
   */
  async getWishlistCount() {
    try {
      const response = await apolloClient.query({
        query: GET_WISHLIST_COUNT,
        fetchPolicy: 'network-only'
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      return response.data.wishlistCount || 0;
    } catch (error) {
      console.error('❌ Error getting wishlist count:', error);
      return 0;
    }
  }

  /**
   * التحقق مما إذا كان المنتج في المفضلة
   * @param {number} productId - معرف المنتج
   * @returns {Promise<boolean>} - هل المنتج في المفضلة
   */
  async isInWishlist(productId) {
    try {
      const items = await this.getWishlistItems();
      return items.some(item => item.productId === productId || item.product?.id === productId);
    } catch (error) {
      console.error('❌ Error checking wishlist status:', error);
      return false;
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل بيانات عناصر المفضلة من الـ API
   */
  _transformWishlistItems(data) {
    return data.map(item => this._transformWishlistItem(item));
  }

  /**
   * تحصر عنصر المفضلة واحد
   */
  _transformWishlistItem(item) {
    const product = item.product || {};
    return {
      id: item.id,
      productId: product.id,
      name: product.name_ar || product.name,
      name_ar: product.name_ar,
      name_en: product.name_en,
      slug: product.slug,
      description: product.description_ar || product.description,
      price: item.currentPrice || product.base_price,
      originalPrice: product.base_price,
      discount: item.discountPercentage || product.discount_percent,
      image: product.images?.find(img => img.is_main)?.image_url || product.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      category: product.category?.name_ar,
      rating: item.rating || 4.5,
      reviews: item.reviews || 0,
      inStock: item.isInStock !== false,
      addedAt: item.created_at || item.addedAt,
      isAvailable: item.isAvailable,
      hasDiscount: item.hasDiscount,
      savingsAmount: item.savingsAmount,
      daysInWishlist: item.daysInWishlist
    };
  }

  /**
   * بيانات احتياطية للمفضلة
   */
  getFallbackWishlistItems() {
    return [
      {
        id: 1,
        productId: 1,
        name: 'فينيل جدران ثلاثي الأبعاد',
        name_ar: 'فينيل جدران ثلاثي الأبعاد',
        name_en: '3D Wall Vinyl',
        description: 'فينيل عالي الجودة للجدران مع تأثير ثلاثي الأبعاد',
        price: 8500,
        originalPrice: 10000,
        discount: 15,
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
        category: 'جدران',
        rating: 4.8,
        reviews: 124,
        inStock: true,
        addedAt: '2024-01-15T10:30:00Z'
      },
      {
        id: 2,
        productId: 2,
        name: 'فينيل سيارة مطفي',
        name_ar: 'فينيل سيارة مطفي',
        name_en: 'Matte Car Vinyl',
        description: 'فينيل سيارة مخصص بلمسة مطفي أنيقة',
        price: 6500,
        originalPrice: null,
        discount: null,
        image: 'https://images.unsplash.com/photo-1552519507-da3b142c42e3?q=80&w=800&auto=format&fit=crop',
        category: 'سيارات',
        rating: 4.6,
        reviews: 89,
        inStock: true,
        addedAt: '2024-01-20T14:15:00Z'
      },
      {
        id: 3,
        productId: 3,
        name: 'فينيل مطبخ كلاسيكي',
        name_ar: 'فينيل مطبخ كلاسيكي',
        name_en: 'Classic Kitchen Vinyl',
        description: 'فينيل مطبخ بتصميم كلاسيكي عالي الجودة',
        price: 12000,
        originalPrice: 15000,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
        category: 'مطابخ',
        rating: 4.9,
        reviews: 203,
        inStock: true,
        addedAt: '2024-01-25T09:45:00Z'
      },
      {
        id: 4,
        productId: 4,
        name: 'فينيل باب خشبي',
        name_ar: 'فينيل باب خشبي',
        name_en: 'Wooden Door Vinyl',
        description: 'فينيل باب بتشطيب خشبي طبيعي',
        price: 10000,
        originalPrice: null,
        discount: null,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
        category: 'أبواب',
        rating: 4.7,
        reviews: 156,
        inStock: false,
        addedAt: '2024-01-30T16:20:00Z'
      }
    ];
  }

  /**
   * الحصول على توكن المصادقة
   */
  _getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || 'mock-token';
  }

  /**
   * التحقق من صلاحية الكاش
   */
  _isCacheValid(key) {
    const cached = this.cache.get(key);
    return cached && (Date.now() - cached.timestamp < this.cacheTTL);
  }

  /**
   * حفظ البيانات في الكاش
   */
  _setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * مسح الكاش
   */
  clearCache() {
    this.cache.clear();
  }
}

export default new WishlistService();
