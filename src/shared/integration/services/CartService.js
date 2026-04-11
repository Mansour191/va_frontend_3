/**
 * CartService.js
 * خدمة إدارة سلة التسوق والربط مع قاعدة البيانات
 */

class CartService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * جلب عناصر السلة للمستخدم
   * @returns {Promise<Array>} - قائمة عناصر السلة
   */
  async getCartItems() {
    const cacheKey = 'cart_items';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/cart/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const items = this._transformCartItems(data.results || data);
      
      this._setCache(cacheKey, items);
      return items;
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      return this.getFallbackCartItems();
    }
  }

  /**
   * إضافة منتج إلى السلة
   * @param {number} productId - معرف المنتج
   * @param {Object} options - خيارات المنتج (الكمية، الخصائص)
   * @returns {Promise<Object>} - العنصر المضاف
   */
  async addToCart(productId, options = {}) {
    try {
      const url = `${this.apiBaseUrl}/cart/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_id: productId,
          quantity: options.quantity || 1,
          variant: options.variant || {}
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const item = this._transformCartItem(data);
      
      // Clear cache to force refresh
      this.cache.delete('cart_items');
      
      return item;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * تحديث عنصر في السلة
   * @param {number} itemId - معرف عنصر السلة
   * @param {Object} updates - البيانات المحدثة
   * @returns {Promise<Object>} - العنصر المحدث
   */
  async updateCartItem(itemId, updates) {
    try {
      const url = `${this.apiBaseUrl}/cart/${itemId}/`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const item = this._transformCartItem(data);
      
      // Clear cache to force refresh
      this.cache.delete('cart_items');
      
      return item;
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      throw error;
    }
  }

  /**
   * إزالة منتج من السلة
   * @param {number} itemId - معرف عنصر السلة
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async removeFromCart(itemId) {
    try {
      const url = `${this.apiBaseUrl}/cart/${itemId}/`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('cart_items');
      
      return true;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      throw error;
    }
  }

  /**
   * تفريغ السلة بالكامل
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async clearCart() {
    try {
      const url = `${this.apiBaseUrl}/cart/clear/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      // Clear cache to force refresh
      this.cache.delete('cart_items');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw error;
    }
  }

  /**
   * تطبيق كود الخصم
   * @param {string} promoCode - كود الخصم
   * @returns {Promise<Object>} - نتيجة تطبيق الكود
   */
  async applyPromoCode(promoCode) {
    try {
      const url = `${this.apiBaseUrl}/cart/apply-promo/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ promo_code: promoCode })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      // Clear cache to force refresh
      this.cache.delete('cart_items');
      
      return {
        success: true,
        discount: data.discount,
        updatedItems: this._transformCartItems(data.updated_items),
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error applying promo code:', error);
      return {
        success: false,
        message: 'كود الخصم غير صالح'
      };
    }
  }

  /**
   * الحصول على ملخص السلة
   * @returns {Promise<Object>} - ملخص السلة
   */
  async getCartSummary() {
    try {
      const url = `${this.apiBaseUrl}/cart/summary/`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        itemCount: data.item_count,
        subtotal: data.subtotal,
        shippingCost: data.shipping_cost,
        discountAmount: data.discount_amount,
        total: data.total,
        promoCode: data.promo_code
      };
    } catch (error) {
      console.error('❌ Error fetching cart summary:', error);
      throw error;
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل بيانات عناصر السلة من الـ API
   */
  _transformCartItems(data) {
    return data.map(item => this._transformCartItem(item));
  }

  /**
   * تحصر عنصر السلة واحد
   */
  _transformCartItem(item) {
    return {
      id: item.id,
      productId: item.product_id,
      name: item.name,
      name_ar: item.name_ar,
      name_en: item.name_en,
      description: item.description,
      price: item.price,
      originalPrice: item.original_price,
      discount: item.discount,
      image: item.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      category: item.category,
      quantity: item.quantity,
      variant: item.variant || {},
      inStock: item.in_stock !== false,
      addedAt: item.added_at
    };
  }

  /**
   * بيانات احتياطية للسلة
   */
  getFallbackCartItems() {
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
        quantity: 2,
        variant: {},
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
        quantity: 1,
        variant: {},
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
        quantity: 1,
        variant: {},
        inStock: true,
        addedAt: '2024-01-25T09:45:00Z'
      }
    ];
  }

  /**
   * الحصول على توكن المصادقة
   */
  _getAuthToken() {
    return localStorage.getItem('authToken') || 'mock-token';
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

export default new CartService();
