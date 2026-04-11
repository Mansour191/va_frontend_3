/**
 * CheckoutService.js
 * خدمة إدارة عملية الدفع والربط مع قاعدة البيانات
 */

class CheckoutService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * إنشاء طلب جديد
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - الطلب المنشأ
   */
  async createOrder(orderData) {
    try {
      const url = `${this.apiBaseUrl}/checkout/orders/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this._prepareOrderData(orderData))
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const order = this._transformOrder(data);
      
      // Clear cart cache after successful order
      this.cache.delete('cart_items');
      
      return order;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * التحقق من صحة بيانات الشحن
   * @param {Object} shippingData - بيانات الشحن
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  async validateShipping(shippingData) {
    try {
      const url = `${this.apiBaseUrl}/checkout/validate-shipping/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(shippingData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        valid: data.valid,
        shippingCost: data.shipping_cost,
        estimatedDelivery: data.estimated_delivery,
        errors: data.errors || []
      };
    } catch (error) {
      console.error('❌ Error validating shipping:', error);
      return {
        valid: false,
        errors: ['فشل في التحقق من بيانات الشحن']
      };
    }
  }

  /**
   * تطبيق كود الخصم على الطلب
   * @param {string} promoCode - كود الخصم
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - نتيجة تطبيق الكود
   */
  async applyPromoCode(promoCode, orderData) {
    try {
      const url = `${this.apiBaseUrl}/checkout/apply-promo/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          promo_code: promoCode,
          order_data: this._prepareOrderData(orderData)
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        discount: data.discount,
        discountType: data.discount_type,
        message: data.message,
        updatedTotals: data.updated_totals
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
   * معالجة الدفع
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Promise<Object>} - نتيجة معالجة الدفع
   */
  async processPayment(paymentData) {
    try {
      const url = `${this.apiBaseUrl}/checkout/payment/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        success: data.success,
        paymentId: data.payment_id,
        redirectUrl: data.redirect_url,
        transactionId: data.transaction_id,
        message: data.message
      };
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      throw error;
    }
  }

  /**
   * الحصول على تكاليف الشحن حسب الولاية
   * @param {string} wilaya - الولاية
   * @param {number} weight - الوزن الإجمالي
   * @returns {Promise<Object>} - تكاليف الشحن
   */
  async getShippingCost(wilaya, weight = 0) {
    try {
      const url = `${this.apiBaseUrl}/checkout/shipping-cost/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ wilaya, weight })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return {
        cost: data.cost,
        estimatedDays: data.estimated_days,
        freeShipping: data.free_shipping,
        freeShippingThreshold: data.free_shipping_threshold
      };
    } catch (error) {
      console.error('❌ Error getting shipping cost:', error);
      // Return default shipping cost
      return {
        cost: 800,
        estimatedDays: 3,
        freeShipping: false,
        freeShippingThreshold: 15000
      };
    }
  }

  /**
   * الحصول على طرق الدفع المتاحة
   * @returns {Promise<Array>} - طرق الدفع
   */
  async getPaymentMethods() {
    const cacheKey = 'payment_methods';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/checkout/payment-methods/`;
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
      const methods = this._transformPaymentMethods(data);
      
      this._setCache(cacheKey, methods);
      return methods;
    } catch (error) {
      console.error('❌ Error fetching payment methods:', error);
      return this.getFallbackPaymentMethods();
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تجهيز بيانات الطلب للإرسال إلى الـ API
   */
  _prepareOrderData(orderData) {
    return {
      customer: {
        first_name: orderData.customer.firstName,
        last_name: orderData.customer.lastName,
        email: orderData.customer.email,
        phone: orderData.customer.phone
      },
      shipping_address: {
        address: orderData.shipping.address,
        wilaya: orderData.shipping.wilaya
      },
      payment_method: orderData.payment.method,
      items: orderData.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      })),
      notes: orderData.notes,
      totals: orderData.totals
    };
  }

  /**
   * تحصر طلب من الـ API
   */
  _transformOrder(order) {
    return {
      id: order.id,
      orderNumber: order.order_number,
      status: order.status,
      customerName: order.customer_name,
      email: order.email,
      phone: order.phone,
      address: order.address,
      wilaya: order.wilaya,
      paymentMethod: order.payment_method,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      discountAmount: order.discount_amount,
      total: order.total,
      items: order.items ? order.items.map(item => this._transformOrderItem(item)) : [],
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      notes: order.notes
    };
  }

  /**
   * تحصر عنصر الطلب
   */
  _transformOrderItem(item) {
    return {
      id: item.id,
      productId: item.product_id,
      name: item.name,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variant: item.variant
    };
  }

  /**
   * تحصر طرق الدفع
   */
  _transformPaymentMethods(data) {
    return data.map(method => ({
      value: method.code,
      label: method.name,
      description: method.description,
      icon: method.icon,
      enabled: method.enabled,
      fees: method.fees
    }));
  }

  /**
   * بيانات احتياطية لطرق الدفع
   */
  getFallbackPaymentMethods() {
    return [
      {
        value: 'cash_on_delivery',
        label: 'الدفع عند الاستلام',
        description: 'الدفع عند استلام المنتجات',
        icon: 'mdi-cash',
        enabled: true,
        fees: 0
      },
      {
        value: 'credit_card',
        label: 'بطاقة بنكية',
        description: 'الدفع الآمن بالبطاقة البنكية',
        icon: 'mdi-credit-card',
        enabled: true,
        fees: 0.02 // 2% fees
      },
      {
        value: 'cib',
        label: 'CIB',
        description: 'الدفع عبر CIB',
        icon: 'mdi-bank',
        enabled: true,
        fees: 0.015 // 1.5% fees
      },
      {
        value: 'edahabia',
        label: 'Edahabia',
        description: 'الدفع عبر محفظة Edahabia',
        icon: 'mdi-wallet',
        enabled: true,
        fees: 0.01 // 1% fees
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

export default new CheckoutService();
