import BaseService from './BaseService';

class CartService extends BaseService {
  constructor() {
    super();
    this.endpoint = '/cart';
  }

  // Get cart items
  async getCartItems() {
    try {
      const response = await this.get('/cart/items');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return this.getMockCartItems();
    }
  }

  // Add item to cart
  async addToCart(productId, quantity = 1, options = {}) {
    try {
      const response = await this.post('/cart/add', { productId, quantity, ...options });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return this.getMockAddToCartResponse(productId, quantity, options);
    }
  }

  // Update cart item quantity
  async updateCartItem(itemId, quantity) {
    try {
      const response = await this.put(`/cart/items/${itemId}`, { quantity });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error updating cart item:', error);
      return this.getMockUpdateCartItemResponse(itemId, quantity);
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    try {
      const response = await this.delete(`/cart/items/${itemId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error removing from cart:', error);
      return this.getMockRemoveFromCartResponse(itemId);
    }
  }

  // Clear cart
  async clearCart() {
    try {
      const response = await this.delete('/cart/clear');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: true, mockData: true };
    }
  }

  // Get cart summary
  async getCartSummary() {
    try {
      const response = await this.get('/cart/summary');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      return this.getMockCartSummary();
    }
  }

  // Apply coupon code
  async applyCoupon(couponCode) {
    try {
      const response = await this.post('/cart/coupon', { couponCode });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error applying coupon:', error);
      return this.getMockApplyCouponResponse(couponCode);
    }
  }

  // Remove coupon
  async removeCoupon() {
    try {
      const response = await this.delete('/cart/coupon');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error removing coupon:', error);
      return { success: true, mockData: true };
    }
  }

  // Calculate shipping
  async calculateShipping(address) {
    try {
      const response = await this.post('/cart/shipping', { address });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return this.getMockShippingCalculation(address);
    }
  }

  // Get available shipping methods
  async getShippingMethods() {
    try {
      const response = await this.get('/cart/shipping-methods');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching shipping methods:', error);
      return this.getMockShippingMethods();
    }
  }

  // Save cart for later
  async saveCartForLater(name) {
    try {
      const response = await this.post('/cart/save', { name });
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error saving cart:', error);
      return this.getMockSaveCartResponse(name);
    }
  }

  // Get saved carts
  async getSavedCarts() {
    try {
      const response = await this.get('/cart/saved');
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching saved carts:', error);
      return this.getMockSavedCarts();
    }
  }

  // Load saved cart
  async loadSavedCart(cartId) {
    try {
      const response = await this.post(`/cart/load/${cartId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error loading saved cart:', error);
      return this.getMockLoadCartResponse(cartId);
    }
  }

  // Delete saved cart
  async deleteSavedCart(cartId) {
    try {
      const response = await this.delete(`/cart/saved/${cartId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error deleting saved cart:', error);
      return { success: true, mockData: true };
    }
  }

  // Mock data methods
  getMockCartItems() {
    return {
      success: true,
      data: {
        items: [
          {
            id: 1,
            productId: 1,
            name: 'فينيل ديكوري ذهبي',
            sku: 'VD-001',
            price: 15000,
            quantity: 2,
            totalPrice: 30000,
            image: '/api/placeholder/100/100',
            category: 'ديكوري',
            inStock: true,
            stock: 45,
            weight: 2.5,
            dimensions: { length: 100, width: 50, height: 10 },
            options: {
              size: 'large',
              color: 'gold'
            },
            addedAt: '2024-03-20T10:30:00Z'
          },
          {
            id: 2,
            productId: 2,
            name: 'فينيل جدران فضي',
            sku: 'VW-002',
            price: 12000,
            quantity: 1,
            totalPrice: 12000,
            image: '/api/placeholder/100/100',
            category: 'جدران',
            inStock: true,
            stock: 28,
            weight: 1.8,
            dimensions: { length: 80, width: 40, height: 8 },
            options: {
              size: 'medium',
              finish: 'matte'
            },
            addedAt: '2024-03-20T11:15:00Z'
          },
          {
            id: 3,
            productId: 3,
            name: 'فينيل أرضيات بني',
            sku: 'VF-003',
            price: 8000,
            quantity: 3,
            totalPrice: 24000,
            image: '/api/placeholder/100/100',
            category: 'أرضيات',
            inStock: true,
            stock: 67,
            weight: 3.2,
            dimensions: { length: 120, width: 60, height: 12 },
            options: {
              thickness: '3mm',
              texture: 'wood'
            },
            addedAt: '2024-03-20T12:00:00Z'
          }
        ]
      },
      mockData: true
    };
  }

  getMockAddToCartResponse(productId, quantity, options) {
    return {
      success: true,
      data: {
        itemId: Date.now(),
        productId,
        quantity,
        totalPrice: quantity * 15000, // Mock price
        message: 'تمت إضافة المنتج إلى السلة بنجاح'
      },
      mockData: true
    };
  }

  getMockUpdateCartItemResponse(itemId, quantity) {
    return {
      success: true,
      data: {
        itemId,
        quantity,
        totalPrice: quantity * 15000, // Mock price
        message: 'تم تحديث الكمية بنجاح'
      },
      mockData: true
    };
  }

  getMockRemoveFromCartResponse(itemId) {
    return {
      success: true,
      data: {
        itemId,
        message: 'تم حذف المنتج من السلة بنجاح'
      },
      mockData: true
    };
  }

  getMockCartSummary() {
    const items = this.getMockCartItems().data.items;
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const shipping = 2500;
    const tax = subtotal * 0.19; // 19% tax
    const discount = 0;
    const total = subtotal + shipping + tax - discount;

    return {
      success: true,
      data: {
        itemsCount: items.reduce((sum, item) => sum + item.quantity, 0),
        subtotal,
        shipping,
        tax,
        discount,
        total,
        currency: 'DZD',
        coupon: null,
        estimatedDelivery: '3-5 أيام عمل'
      },
      mockData: true
    };
  }

  getMockApplyCouponResponse(couponCode) {
    const validCoupons = {
      'SAVE10': { discount: 0.1, type: 'percentage' },
      'SAVE20': { discount: 0.2, type: 'percentage' },
      'FIXED500': { discount: 500, type: 'fixed' },
      'FREESHIP': { discount: 2500, type: 'shipping' }
    };

    const coupon = validCoupons[couponCode];

    if (coupon) {
      return {
        success: true,
        data: {
          couponCode,
          discount: coupon.discount,
          type: coupon.type,
          message: 'تم تطبيق الكوبون بنجاح'
        },
        mockData: true
      };
    } else {
      return {
        success: false,
        error: 'كوبون غير صالح',
        mockData: true
      };
    }
  }

  getMockShippingCalculation(address) {
    return {
      success: true,
      data: {
        methods: [
          {
            id: 'standard',
            name: 'شحن عادي',
            price: 2500,
            estimatedDays: '3-5 أيام عمل',
            available: true
          },
          {
            id: 'express',
            name: 'شحن سريع',
            price: 5000,
            estimatedDays: '1-2 أيام عمل',
            available: true
          },
          {
            id: 'overnight',
            name: 'شحن خلال 24 ساعة',
            price: 8000,
            estimatedDays: 'اليوم',
            available: false
          }
        ],
        selectedMethod: 'standard'
      },
      mockData: true
    };
  }

  getMockShippingMethods() {
    return {
      success: true,
      data: [
        {
          id: 'standard',
          name: 'شحن عادي',
          description: 'توصيل عادي خلال 3-5 أيام عمل',
          price: 2500,
          estimatedDays: '3-5 أيام عمل',
          available: true,
          tracking: true,
          insurance: false
        },
        {
          id: 'express',
          name: 'شحن سريع',
          description: 'توصيل سريع خلال 1-2 أيام عمل',
          price: 5000,
          estimatedDays: '1-2 أيام عمل',
          available: true,
          tracking: true,
          insurance: true
        },
        {
          id: 'overnight',
          name: 'شحن خلال 24 ساعة',
          description: 'توصيل خلال 24 ساعة',
          price: 8000,
          estimatedDays: 'اليوم',
          available: false,
          tracking: true,
          insurance: true
        },
        {
          id: 'pickup',
          name: 'استلام من المتجر',
          description: 'استلام من فرعنا الرئيسي',
          price: 0,
          estimatedDays: 'فوراً',
          available: true,
          tracking: false,
          insurance: false
        }
      ],
      mockData: true
    };
  }

  getMockSaveCartResponse(name) {
    return {
      success: true,
      data: {
        cartId: 'saved_' + Date.now(),
        name,
        itemsCount: 3,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      mockData: true
    };
  }

  getMockSavedCarts() {
    return {
      success: true,
      data: {
        carts: [
          {
            id: 'saved_1710921600000',
            name: 'سلة المشتريات المفضلة',
            itemsCount: 5,
            total: 75000,
            savedAt: '2024-03-20T10:30:00Z',
            expiresAt: '2024-04-19T10:30:00Z',
            isExpired: false
          },
          {
            id: 'saved_1710835200000',
            name: 'سلة المنتجات الديكورية',
            itemsCount: 3,
            total: 45000,
            savedAt: '2024-03-19T14:20:00Z',
            expiresAt: '2024-04-18T14:20:00Z',
            isExpired: false
          },
          {
            id: 'saved_1710748800000',
            name: 'سلة قديمة',
            itemsCount: 2,
            total: 28000,
            savedAt: '2024-03-18T09:15:00Z',
            expiresAt: '2024-03-18T09:15:00Z',
            isExpired: true
          }
        ],
        total: 3
      },
      mockData: true
    };
  }

  getMockLoadCartResponse(cartId) {
    return {
      success: true,
      data: {
        cartId,
        itemsLoaded: 3,
        message: 'تم تحميل السلة المحفوظة بنجاح'
      },
      mockData: true
    };
  }
}

export default new CartService();
