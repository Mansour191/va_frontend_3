/**
 * CartService.js
 * خدمة إدارة سلة التسوق والربط مع قاعدة البيانات
 */

class CartService {
  constructor() {
    this.graphqlEndpoint = '/graphql/';
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
      const query = `
        query {
          myCart {
            id
            quantity
            options
            createdAt
            updatedAt
            product {
              ...ProductEssential
              images {
                id
                imageUrl
                isMain
              }
            }
            material {
              id
              nameAr
              nameEn
              pricePerM2
            }
            productDetails
            subtotal
            totalWithDiscount
            finalTotal
            isAvailable
            maxQuantity
            currentUnitPrice
            currentMaterialPrice
            priceChanged
            weight
            dimensions
          }
        }
        fragment ProductEssential on Product {
          id
          nameAr
          nameEn
          slug
          basePrice
          onSale
          discountPercent
          isActive
        }
      `;

      const response = await this._makeGraphQLRequest(query);
      const items = this._transformCartItems(response.myCart || []);
      
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
      const mutation = `
        mutation AddToCart($input: CartItemInput!) {
          addToCart(input: $input) {
            success
            message
            cartItem {
              id
              quantity
              options
              createdAt
              updatedAt
              product {
                id
                nameAr
                nameEn
                basePrice
                stock
                isActive
                images {
                  id
                  imageUrl
                  isMain
                }
              }
              material {
                id
                nameAr
                nameEn
                pricePerM2
              }
              productDetails
              subtotal
              totalWithDiscount
              finalTotal
              isAvailable
              maxQuantity
              currentUnitPrice
              currentMaterialPrice
              priceChanged
              weight
              dimensions
            }
            cartSummary
          }
        }
      `;

      const variables = {
        input: {
          productId: productId,
          materialId: options.materialId || null,
          quantity: options.quantity || 1,
          options: JSON.stringify(options.variant || {})
        }
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.addToCart.success) {
        // Clear cache to force refresh
        this.cache.delete('cart_items');
        
        return this._transformCartItem(response.addToCart.cartItem);
      } else {
        throw new Error(response.addToCart.message || 'Failed to add to cart');
      }
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
      const mutation = `
        mutation UpdateCartQuantity($input: UpdateCartInput!) {
          updateCartQuantity(input: $input) {
            success
            message
            cartItem {
              id
              quantity
              subtotal
              totalWithDiscount
              finalTotal
              isAvailable
            }
            cartSummary
          }
        }
      `;

      const variables = {
        input: {
          cartItemId: itemId,
          quantity: updates.quantity
        }
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.updateCartQuantity.success) {
        // Clear cache to force refresh
        this.cache.delete('cart_items');
        
        return this._transformCartItem(response.updateCartQuantity.cartItem);
      } else {
        throw new Error(response.updateCartQuantity.message || 'Failed to update cart item');
      }
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
      const mutation = `
        mutation RemoveFromCart($cartItemId: Int!) {
          removeFromCart(cartItemId: $cartItemId) {
            success
            message
            cartSummary
          }
        }
      `;

      const variables = { cartItemId: itemId };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.removeFromCart.success) {
        // Clear cache to force refresh
        this.cache.delete('cart_items');
        
        return true;
      } else {
        throw new Error(response.removeFromCart.message || 'Failed to remove from cart');
      }
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
      const mutation = `
        mutation ClearCart {
          clearCart {
            success
            message
          }
        }
      `;

      const response = await this._makeGraphQLRequest(mutation);
      
      if (response.clearCart.success) {
        // Clear cache to force refresh
        this.cache.delete('cart_items');
        
        return true;
      } else {
        throw new Error(response.clearCart.message || 'Failed to clear cart');
      }
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
      const mutation = `
        mutation ApplyCoupon($input: ApplyCouponInput!) {
          applyCoupon(input: $input) {
            success
            message
            cartSummary
          }
        }
      `;

      const variables = {
        input: {
          couponCode: promoCode
        }
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.applyCoupon.success) {
        // Clear cache to force refresh
        this.cache.delete('cart_items');
        
        const summary = JSON.parse(response.applyCoupon.cartSummary || '{}');
        
        return {
          success: true,
          discount: summary.discountTotal || 0,
          updatedItems: [], // Will be populated by cart refresh
          message: response.applyCoupon.message
        };
      } else {
        return {
          success: false,
          message: response.applyCoupon.message || 'كود الخصم غير صالح'
        };
      }
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
      const query = `
        query {
          cartSummary {
            itemCount
            subtotal
            shippingCost
            discountAmount
            total
            promoCode
          }
        }
      `;

      const response = await this._makeGraphQLRequest(query);
      
      return response.cartSummary || {
        itemCount: 0,
        subtotal: 0,
        shippingCost: 0,
        discountAmount: 0,
        total: 0,
        promoCode: null
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
   * تنفيذ طلب GraphQL
   * @param {string} query - استعلام GraphQL
   * @param {Object} variables - متغيرات الاستعلام
   * @returns {Promise<Object>} - نتيجة الاستعلام
   */
  async _makeGraphQLRequest(query, variables = {}) {
    try {
      const response = await fetch(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this._getAuthToken()}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      return result.data;
    } catch (error) {
      console.error('❌ GraphQL request error:', error);
      throw error;
    }
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
