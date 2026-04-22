/**
 * OrderService.js
 * خدمة إدارة طلبات العملاء والربط مع قاعدة البيانات
 */

class OrderService {
  constructor() {
    this.graphqlEndpoint = '/graphql/';
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
      const query = `
        query {
          myOrders {
            id
            status
            paymentMethod
            customerName
            phone
            address
            wilaya
            subtotal
            shippingCost
            discountAmount
            total
            createdAt
            updatedAt
            items {
              id
              name
              nameAr
              nameEn
              price
              quantity
              image
              productId
              variant
            }
            trackingNumber
            notes
          }
        }
      `;

      const response = await this._makeGraphQLRequest(query);
      const orders = this._transformOrders(response.myOrders || []);
      
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
      const query = `
        query GetOrderById($orderId: ID!) {
          order(id: $orderId) {
            id
            status
            paymentMethod
            customerName
            phone
            address
            wilaya
            subtotal
            shippingCost
            discountAmount
            total
            createdAt
            updatedAt
            items {
              id
              name
              nameAr
              nameEn
              price
              quantity
              image
              productId
              variant
            }
            trackingNumber
            notes
          }
        }
      `;

      const variables = { orderId };
      const response = await this._makeGraphQLRequest(query, variables);
      const order = this._transformOrder(response.order);
      
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
      const mutation = `
        mutation CreateOrder($input: OrderInput!) {
          createOrder(input: $input) {
            success
            message
            order {
              id
              status
              paymentMethod
              customerName
              phone
              address
              wilaya
              subtotal
              shippingCost
              discountAmount
              total
              createdAt
              updatedAt
              items {
                id
                name
                nameAr
                nameEn
                price
                quantity
                image
                productId
                variant
              }
              trackingNumber
              notes
            }
            errors
          }
        }
      `;

      const variables = {
        input: this._prepareOrderData(orderData)
      };

      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.createOrder.success) {
        // Clear cache to force refresh
        this.cache.delete('user_orders');
        
        return this._transformOrder(response.createOrder.order);
      } else {
        throw new Error(response.createOrder.message || 'Failed to create order');
      }
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
      const mutation = `
        mutation UpdateOrderStatus($orderId: ID!, $status: String!) {
          updateOrderStatus(orderId: $orderId, status: $status) {
            success
            message
            order {
              id
              status
              paymentMethod
              customerName
              phone
              address
              wilaya
              subtotal
              shippingCost
              discountAmount
              total
              createdAt
              updatedAt
              items {
                id
                name
                nameAr
                nameEn
                price
                quantity
                image
                productId
                variant
              }
              trackingNumber
              notes
            }
            errors
          }
        }
      `;

      const variables = { orderId, status };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.updateOrderStatus.success) {
        // Clear cache to force refresh
        this.cache.delete('user_orders');
        this.cache.delete(`order_${orderId}`);
        
        return this._transformOrder(response.updateOrderStatus.order);
      } else {
        throw new Error(response.updateOrderStatus.message || 'Failed to update order status');
      }
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
      const mutation = `
        mutation CancelOrder($orderId: ID!) {
          cancelOrder(orderId: $orderId) {
            success
            message
            order {
              id
              status
            }
            errors
          }
        }
      `;

      const variables = { orderId };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.cancelOrder.success) {
        // Clear cache to force refresh
        this.cache.delete('user_orders');
        this.cache.delete(`order_${orderId}`);
        
        return true;
      } else {
        throw new Error(response.cancelOrder.message || 'Failed to cancel order');
      }
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
      const mutation = `
        mutation ReorderOrder($orderId: ID!) {
          reorderOrder(orderId: $orderId) {
            success
            message
            order {
              id
              status
              paymentMethod
              customerName
              phone
              address
              wilaya
              subtotal
              shippingCost
              discountAmount
              total
              createdAt
              updatedAt
              items {
                id
                name
                nameAr
                nameEn
                price
                quantity
                image
                productId
                variant
              }
              trackingNumber
              notes
            }
            errors
          }
        }
      `;

      const variables = { orderId };
      const response = await this._makeGraphQLRequest(mutation, variables);
      
      if (response.reorderOrder.success) {
        // Clear cache to force refresh
        this.cache.delete('user_orders');
        
        return this._transformOrder(response.reorderOrder.order);
      } else {
        throw new Error(response.reorderOrder.message || 'Failed to reorder');
      }
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

export default new OrderService();
