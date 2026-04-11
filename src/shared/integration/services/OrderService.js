/**
 * OrderService.js
 * خدمة إدارة طلبات العملاء والربط مع قاعدة البيانات
 */

class OrderService {
  constructor() {
    this.apiBaseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
  }

  /**
   * جلب جميع طلبات المستخدم
   * @returns {Promise<Array>} - قائمة الطلبات
   */
  async getOrders() {
    const cacheKey = 'user_orders';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/orders/`;
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
      const orders = this._transformOrders(data.results || data);
      
      this._setCache(cacheKey, orders);
      return orders;
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return this.getFallbackOrders();
    }
  }

  /**
   * جلب تفاصيل طلب معين
   * @param {number} orderId - معرف الطلب
   * @returns {Promise<Object>} - تفاصيل الطلب
   */
  async getOrderById(orderId) {
    const cacheKey = `order_${orderId}`;
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    try {
      const url = `${this.apiBaseUrl}/orders/${orderId}/`;
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
      const order = this._transformOrder(data);
      
      this._setCache(cacheKey, order);
      return order;
    } catch (error) {
      console.error(`❌ Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * إنشاء طلب جديد
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - الطلب المنشأ
   */
  async createOrder(orderData) {
    try {
      const url = `${this.apiBaseUrl}/orders/`;
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
      
      // Clear cache to force refresh
      this.cache.delete('user_orders');
      
      return order;
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  }

  /**
   * تحديث حالة الطلب
   * @param {number} orderId - معرف الطلب
   * @param {string} status - الحالة الجديدة
   * @returns {Promise<Object>} - الطلب المحدث
   */
  async updateOrderStatus(orderId, status) {
    try {
      const url = `${this.apiBaseUrl}/orders/${orderId}/status/`;
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this._getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const order = this._transformOrder(data);
      
      // Clear cache to force refresh
      this.cache.delete('user_orders');
      this.cache.delete(`order_${orderId}`);
      
      return order;
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      throw error;
    }
  }

  /**
   * إلغاء الطلب
   * @param {number} orderId - معرف الطلب
   * @returns {Promise<boolean>} - نجاح العملية
   */
  async cancelOrder(orderId) {
    try {
      const url = `${this.apiBaseUrl}/orders/${orderId}/cancel/`;
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
      this.cache.delete('user_orders');
      this.cache.delete(`order_${orderId}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }

  /**
   * إعادة الطلب
   * @param {number} orderId - معرف الطلب الأصلي
   * @returns {Promise<Object>} - الطلب الجديد
   */
  async reorder(orderId) {
    try {
      const url = `${this.apiBaseUrl}/orders/${orderId}/reorder/`;
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

      const data = await response.json();
      const order = this._transformOrder(data);
      
      // Clear cache to force refresh
      this.cache.delete('user_orders');
      
      return order;
    } catch (error) {
      console.error('❌ Error reordering:', error);
      throw error;
    }
  }

  // ========== دوال مساعدة ==========

  /**
   * تحويل بيانات الطلبات من الـ API
   */
  _transformOrders(data) {
    return data.map(order => this._transformOrder(order));
  }

  /**
   * تحويل طلب واحد
   */
  _transformOrder(order) {
    return {
      id: order.id,
      status: order.status,
      paymentMethod: order.payment_method,
      customerName: order.customer_name,
      phone: order.phone,
      address: order.address,
      wilaya: order.wilaya,
      subtotal: order.subtotal,
      shippingCost: order.shipping_cost,
      discountAmount: order.discount_amount,
      total: order.total,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.items ? order.items.map(item => this._transformOrderItem(item)) : [],
      trackingNumber: order.tracking_number,
      notes: order.notes
    };
  }

  /**
   * تحصر عنصر الطلب
   */
  _transformOrderItem(item) {
    return {
      id: item.id,
      name: item.name,
      name_ar: item.name_ar,
      name_en: item.name_en,
      price: item.price,
      quantity: item.quantity,
      image: item.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
      productId: item.product_id,
      variant: item.variant
    };
  }

  /**
   * تجهيز بيانات الطلب للإرسال إلى الـ API
   */
  _prepareOrderData(orderData) {
    return {
      items: orderData.items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        variant: item.variant || {}
      })),
      shipping_address: {
        name: orderData.customerName,
        phone: orderData.phone,
        address: orderData.address,
        wilaya: orderData.wilaya
      },
      payment_method: orderData.paymentMethod,
      notes: orderData.notes || ''
    };
  }

  /**
   * بيانات احتياطية للطلبات
   */
  getFallbackOrders() {
    return [
      {
        id: 1001,
        status: 'delivered',
        paymentMethod: 'الدفع عند الاستلام',
        customerName: 'أحمد محمد',
        phone: '0551234567',
        address: 'شارع النخالة، بناية 12، الطابق الثالث',
        wilaya: 'الجزائر',
        subtotal: 15000,
        shippingCost: 800,
        discountAmount: 500,
        total: 15300,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        items: [
          {
            id: 1,
            name: 'فينيل جدران ثلاثي الأبعاد',
            name_ar: 'فينيل جدران ثلاثي الأبعاد',
            name_en: '3D Wall Vinyl',
            price: 8500,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop',
            productId: 1,
            variant: {}
          },
          {
            id: 2,
            name: 'فينيل سيارة مطفي',
            name_ar: 'فينيل سيارة مطفي',
            name_en: 'Matte Car Vinyl',
            price: 6500,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1552519507-da3b142c42e3?q=80&w=800&auto=format&fit=crop',
            productId: 2,
            variant: {}
          }
        ],
        trackingNumber: 'TRK123456789DZ',
        notes: 'التسليم في وقت العمل'
      },
      {
        id: 1002,
        status: 'processing',
        paymentMethod: 'بطاقة بنكية',
        customerName: 'أحمد محمد',
        phone: '0551234567',
        address: 'شارع الحرية، مركز الأعمال',
        wilaya: 'الجزائر',
        subtotal: 22000,
        shippingCost: 600,
        discountAmount: 0,
        total: 22600,
        createdAt: '2024-01-20T14:15:00Z',
        updatedAt: '2024-01-20T14:15:00Z',
        items: [
          {
            id: 3,
            name: 'فينيل مطبخ كلاسيكي',
            name_ar: 'فينيل مطبخ كلاسيكي',
            name_en: 'Classic Kitchen Vinyl',
            price: 12000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=800&auto=format&fit=crop',
            productId: 3,
            variant: {}
          },
          {
            id: 4,
            name: 'فينيل باب خشبي',
            name_ar: 'فينيل باب خشبي',
            name_en: 'Wooden Door Vinyl',
            price: 10000,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800&auto=format&fit=crop',
            productId: 4,
            variant: {}
          }
        ],
        trackingNumber: null,
        notes: ''
      },
      {
        id: 1003,
        status: 'shipped',
        paymentMethod: 'الدفع عند الاستلام',
        customerName: 'أحمد محمد',
        phone: '0551234567',
        address: 'شارع النخالة، بناية 12',
        wilaya: 'الجزائر',
        subtotal: 8500,
        shippingCost: 700,
        discountAmount: 200,
        total: 9000,
        createdAt: '2024-01-25T09:45:00Z',
        updatedAt: '2024-01-25T09:45:00Z',
        items: [
          {
            id: 5,
            name: 'فينيل أثاث أنيق',
            name_ar: 'فينيل أثاث أنيق',
            name_en: 'Elegant Furniture Vinyl',
            price: 8500,
            quantity: 1,
            image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop',
            productId: 5,
            variant: {}
          }
        ],
        trackingNumber: 'TRK987654321DZ',
        notes: ''
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

export default new OrderService();
