/**
 * CheckoutService.js
 * خدمة إدارة عملية الدفع والربط مع قاعدة البيانات
 */

import { useQuery, useMutation } from '@apollo/client';
import { useErrorBoundary } from '@/shared/composables/useErrorBoundary';

// GraphQL queries and mutations for checkout operations
import {
  GET_PAYMENT_METHODS,
  GET_SHIPPING_COST,
  VALIDATE_SHIPPING_ADDRESS,
  GET_CHECKOUT_SUMMARY,
  GET_ORDER_DETAILS,
  GET_CUSTOMER_ORDERS,
  CREATE_ORDER,
  VALIDATE_SHIPPING,
  APPLY_PROMO_CODE,
  PROCESS_PAYMENT,
  CALCULATE_SHIPPING_COST,
  UPDATE_ORDER_STATUS,
  CANCEL_ORDER,
  REFUND_ORDER,
  ORDER_STATUS_UPDATED,
  PAYMENT_STATUS_UPDATED,
  ORDER_CREATED
} from '@/integration/graphql/checkout';

class CheckoutService {
  constructor() {
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 دقائق
    this.errorBoundary = useErrorBoundary();
  }

  /**
   * إنشاء طلب جديد باستخدام GraphQL
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - الطلب المنشأ
   */
  async createOrder(orderData) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(CREATE_ORDER);
      
      const result = await mutate({
        variables: {
          orderData: this._prepareOrderData(orderData)
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.createOrder?.success) {
        const orderData = result.data.createOrder;
        const order = this._transformOrder(orderData.order);
        
        // Clear cart cache after successful order
        this.cache.delete('cart_items');
        
        return {
          ...order,
          paymentRedirectUrl: orderData.paymentRedirectUrl,
          transactionId: orderData.transactionId
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to create order');
        console.error('❌ Error creating order:', error);
        throw error;
      }
    }, 'Checkout order creation');
  }

  /**
   * التحقق من صحة بيانات الشحن باستخدام GraphQL
   * @param {Object} shippingData - بيانات الشحن
   * @returns {Promise<Object>} - نتيجة التحقق
   */
  async validateShipping(shippingData) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(VALIDATE_SHIPPING);
      
      const result = await mutate({
        variables: {
          shippingData: this._prepareShippingData(shippingData)
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.validateShipping) {
        const validation = result.data.validateShipping;
        return {
          valid: validation.valid,
          shippingCost: validation.shippingCost,
          estimatedDelivery: validation.estimatedDelivery,
          errors: validation.errors?.map(err => err.message) || [],
          warnings: validation.warnings?.map(warn => warn.message) || []
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to validate shipping');
        console.error('❌ Error validating shipping:', error);
        return {
          valid: false,
          errors: [error.message]
        };
      }
    }, 'Checkout shipping validation');
  }

  /**
   * تطبيق كود الخصم على الطلب باستخدام GraphQL
   * @param {string} promoCode - كود الخصم
   * @param {Object} orderData - بيانات الطلب
   * @returns {Promise<Object>} - نتيجة تطبيق الكود
   */
  async applyPromoCode(promoCode, orderData) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(APPLY_PROMO_CODE);
      
      const result = await mutate({
        variables: {
          promoCode,
          orderData: this._prepareOrderData(orderData)
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.applyPromoCode) {
        const promoResult = result.data.applyPromoCode;
        return {
          success: promoResult.success,
          discount: promoResult.discount,
          discountType: promoResult.discountType,
          message: promoResult.message,
          updatedTotals: promoResult.updatedTotals,
          applicableItems: promoResult.applicableItems
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to apply promo code');
        console.error('❌ Error applying promo code:', error);
        return {
          success: false,
          message: error.message || 'كود الخصم غير صالح'
        };
      }
    }, 'Checkout promo code application');
  }

  /**
   * معالجة الدفع باستخدام GraphQL
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Promise<Object>} - نتيجة معالجة الدفع
   */
  async processPayment(paymentData) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(PROCESS_PAYMENT);
      
      const result = await mutate({
        variables: {
          paymentData: this._preparePaymentData(paymentData)
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.processPayment?.success) {
        const paymentResult = result.data.processPayment;
        return {
          success: paymentResult.success,
          paymentId: paymentResult.paymentId,
          redirectUrl: paymentResult.redirectUrl,
          transactionId: paymentResult.transactionId,
          message: paymentResult.message,
          paymentMethod: paymentResult.paymentMethod,
          status: paymentResult.status,
          amount: paymentResult.amount
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to process payment');
        console.error('❌ Error processing payment:', error);
        throw error;
      }
    }, 'Checkout payment processing');
  }

  /**
   * الحصول على تكاليف الشحن حسب الولاية باستخدام GraphQL
   * @param {string} wilaya - الولاية
   * @param {number} weight - الوزن الإجمالي
   * @param {Array} items - عناصر الطلب
   * @returns {Promise<Object>} - تكاليف الشحن
   */
  async getShippingCost(wilaya, weight = 0, items = []) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(CALCULATE_SHIPPING_COST);
      
      const result = await mutate({
        variables: {
          wilaya,
          weight,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            variant: item.variant
          }))
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.calculateShippingCost) {
        const shippingData = result.data.calculateShippingCost;
        return {
          cost: shippingData.cost,
          estimatedDays: shippingData.estimatedDays,
          freeShipping: shippingData.freeShipping,
          freeShippingThreshold: shippingData.freeShippingThreshold,
          availableMethods: shippingData.availableMethods || []
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to get shipping cost');
        console.error('❌ Error getting shipping cost:', error);
        
        // Return default shipping cost
        return {
          cost: 800,
          estimatedDays: 3,
          freeShipping: false,
          freeShippingThreshold: 15000,
          availableMethods: []
        };
      }
    }, 'Checkout shipping cost calculation');
  }

  /**
   * الحصول على طرق الدفع المتاحة باستخدام GraphQL
   * @returns {Promise<Array>} - طرق الدفع
   */
  async getPaymentMethods() {
    const cacheKey = 'payment_methods';
    
    if (this._isCacheValid(cacheKey)) {
      return this.cache.get(cacheKey).data;
    }

    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_PAYMENT_METHODS, {
        errorPolicy: 'all',
        fetchPolicy: 'cache-first'
      });
      
      if (result.value?.data?.paymentMethods) {
        const methods = this._transformPaymentMethods(result.value.data.paymentMethods);
        this._setCache(cacheKey, methods);
        return methods;
      } else {
        console.warn('No payment methods data available, using fallback');
        return this.getFallbackPaymentMethods();
      }
    }, 'Checkout payment methods fetch');
  }

  // ========== دوال مساعدة ==========

  /**
   * تجهيز بيانات الطلب للإرسال إلى GraphQL
   */
  _prepareOrderData(orderData) {
    return {
      customer: {
        firstName: orderData.customer.firstName,
        lastName: orderData.customer.lastName,
        email: orderData.customer.email,
        phone: orderData.customer.phone
      },
      shippingAddress: {
        address: orderData.shipping.address,
        wilaya: orderData.shipping.wilaya,
        commune: orderData.shipping.commune,
        postalCode: orderData.shipping.postalCode,
        instructions: orderData.shipping.instructions
      },
      paymentMethod: orderData.payment.method,
      items: orderData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        variant: item.variant
      })),
      notes: orderData.notes,
      promoCode: orderData.promoCode,
      totals: orderData.totals
    };
  }

  /**
   * تجهيز بيانات الشحن للإرسال إلى GraphQL
   */
  _prepareShippingData(shippingData) {
    return {
      address: shippingData.address,
      wilaya: shippingData.wilaya,
      commune: shippingData.commune,
      postalCode: shippingData.postalCode,
      instructions: shippingData.instructions
    };
  }

  /**
   * تجهيز بيانات الدفع للإرسال إلى GraphQL
   */
  _preparePaymentData(paymentData) {
    return {
      orderId: paymentData.orderId,
      method: paymentData.method,
      amount: paymentData.amount,
      currency: paymentData.currency || 'DZD',
      returnUrl: paymentData.returnUrl,
      cancelUrl: paymentData.cancelUrl,
      metadata: paymentData.metadata || {}
    };
  }

  /**
   * تحويل طلب من GraphQL
   */
  _transformOrder(order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      wilaya: order.wilaya,
      paymentMethod: order.paymentMethod,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      discountAmount: order.discountAmount,
      total: order.total,
      items: order.items ? order.items.map(item => this._transformOrderItem(item)) : [],
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      notes: order.notes
    };
  }

  /**
   * تحويل عنصر الطلب
   */
  _transformOrderItem(item) {
    return {
      id: item.id,
      productId: item.productId,
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
   * تحويل طرق الدفع
   */
  _transformPaymentMethods(data) {
    return data.map(method => ({
      value: method.value,
      label: method.label,
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
   * الحصول على تفاصيل الطلب
   * @param {string} orderId - معرف الطلب
   * @returns {Promise<Object>} - تفاصيل الطلب
   */
  async getOrderDetails(orderId) {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_ORDER_DETAILS, {
        variables: { orderId },
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.order) {
        return this._transformOrder(result.value.data.order);
      } else {
        console.warn('No order details available for orderId:', orderId);
        return null;
      }
    }, 'Checkout order details fetch');
  }

  /**
   * الحصول على طلبات العميل
   * @param {number} limit - عدد الطلبات
   * @param {string} status - حالة الطلبات
   * @returns {Promise<Array>} - قائمة الطلبات
   */
  async getCustomerOrders(limit = 10, status = null) {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_CUSTOMER_ORDERS, {
        variables: { limit, status },
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.customerOrders) {
        return result.value.data.customerOrders.map(order => this._transformOrder(order));
      } else {
        console.warn('No customer orders available');
        return [];
      }
    }, 'Checkout customer orders fetch');
  }

  /**
   * تحديث حالة الطلب
   * @param {string} orderId - معرف الطلب
   * @param {string} status - الحالة الجديدة
   * @param {string} reason - سبب التغيير
   * @returns {Promise<Object>} - نتيجة التحديث
   */
  async updateOrderStatus(orderId, status, reason = null) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(UPDATE_ORDER_STATUS);
      
      const result = await mutate({
        variables: { orderId, status, reason },
        errorPolicy: 'all'
      });
      
      if (result.data?.updateOrderStatus?.success) {
        return {
          success: true,
          order: this._transformOrder(result.data.updateOrderStatus.order),
          message: result.data.updateOrderStatus.message
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to update order status');
        console.error('❌ Error updating order status:', error);
        throw error;
      }
    }, 'Checkout order status update');
  }

  /**
   * إلغاء الطلب
   * @param {string} orderId - معرف الطلب
   * @param {string} reason - سبب الإلغاء
   * @returns {Promise<Object>} - نتيجة الإلغاء
   */
  async cancelOrder(orderId, reason) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(CANCEL_ORDER);
      
      const result = await mutate({
        variables: { orderId, reason },
        errorPolicy: 'all'
      });
      
      if (result.data?.cancelOrder?.success) {
        const cancelResult = result.data.cancelOrder;
        return {
          success: true,
          order: this._transformOrder(cancelResult.order),
          refundAmount: cancelResult.refundAmount,
          refundStatus: cancelResult.refundStatus,
          message: cancelResult.message
        };
      } else {
        const error = result.errors?.[0] || new Error('Failed to cancel order');
        console.error('❌ Error cancelling order:', error);
        throw error;
      }
    }, 'Checkout order cancellation');
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
