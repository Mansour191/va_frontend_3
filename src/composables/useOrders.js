import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useApolloClient } from '@vue/apollo-composable';
import { useI18n } from 'vue-i18n';
import {
  USER_ORDERS_QUERY,
  ORDER_QUERY,
  ALL_ORDERS_QUERY,
  CREATE_ORDER_MUTATION,
  UPDATE_ORDER_STATUS_MUTATION,
  UPDATE_TRACKING_MUTATION,
  CANCEL_ORDER_MUTATION,
  ADD_TIMELINE_MUTATION,
  ORDER_STATS_QUERY,
  GENERATE_INVOICE_MUTATION
} from '@/integration/graphql/orders.graphql';

export function useOrders() {
  const store = useStore();
  const { t } = useI18n();
  const { client } = useApolloClient();

  // State
  const ordersState = ref({
    userOrders: [],
    allOrders: [],
    currentOrder: null,
    orderStats: null,
    loading: false,
    error: null,
    pagination: {
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: null,
      endCursor: null
    }
  });

  // Computed
  const userOrders = computed(() => ordersState.value.userOrders);
  const allOrders = computed(() => ordersState.value.allOrders);
  const currentOrder = computed(() => ordersState.value.currentOrder);
  const orderStats = computed(() => ordersState.value.orderStats);
  const loading = computed(() => ordersState.value.loading);
  const error = computed(() => ordersState.value.error);
  const pagination = computed(() => ordersState.value.pagination);

  // Order status configuration
  const orderStatusConfig = {
    pending: {
      color: 'warning',
      icon: 'mdi-clock-outline',
      text: t('pending', 'قيد الانتظار'),
      description: t('pendingDesc', 'الطلب قيد المراجعة')
    },
    confirmed: {
      color: 'info',
      icon: 'mdi-check-circle-outline',
      text: t('confirmed', 'مؤكد'),
      description: t('confirmedDesc', 'تم تأكيد الطلب')
    },
    processing: {
      color: 'primary',
      icon: 'mdi-cog-outline',
      text: t('processing', 'قيد المعالجة'),
      description: t('processingDesc', 'الطلب قيد المعالجة')
    },
    shipped: {
      color: 'blue',
      icon: 'mdi-truck-fast',
      text: t('shipped', 'تم الشحن'),
      description: t('shippedDesc', 'الطلب في طريقه إليك')
    },
    delivered: {
      color: 'success',
      icon: 'mdi-check-circle',
      text: t('delivered', 'تم التوصيل'),
      description: t('deliveredDesc', 'تم تسليم الطلب بنجاح')
    },
    cancelled: {
      color: 'error',
      icon: 'mdi-close-circle',
      text: t('cancelled', 'ملغي'),
      description: t('cancelledDesc', 'تم إلغاء الطلب')
    }
  };

  const paymentMethodConfig = {
    cod: {
      text: t('cashOnDelivery', 'الدفع عند الاستلام'),
      icon: 'mdi-cash'
    },
    ccp: {
      text: t('ccp', 'CCP'),
      icon: 'mdi-bank'
    },
    card: {
      text: t('creditCard', 'بطاقة بنكية'),
      icon: 'mdi-credit-card'
    }
  };

  // Functions
  const fetchUserOrders = async (filter = {}, pagination = {}) => {
    ordersState.value.loading = true;
    ordersState.value.error = null;

    try {
      const { data } = await client.query({
        query: USER_ORDERS_QUERY,
        variables: {
          filter,
          first: pagination.first || 20,
          after: pagination.after,
          orderBy: pagination.orderBy || '-created_at'
        },
        fetchPolicy: 'cache-first'
      });

      ordersState.value.userOrders = data.userOrders.edges.map(edge => edge.node);
      ordersState.value.pagination = data.userOrders.pageInfo;
      
      console.log('✅ User orders loaded:', ordersState.value.userOrders.length);
    } catch (err) {
      ordersState.value.error = err.message;
      console.error('❌ Error fetching user orders:', err);
    } finally {
      ordersState.value.loading = false;
    }
  };

  const fetchAllOrders = async (filter = {}, pagination = {}) => {
    ordersState.value.loading = true;
    ordersState.value.error = null;

    try {
      const { data } = await client.query({
        query: ALL_ORDERS_QUERY,
        variables: {
          filter,
          first: pagination.first || 50,
          after: pagination.after,
          orderBy: pagination.orderBy || '-created_at'
        },
        fetchPolicy: 'cache-first'
      });

      ordersState.value.allOrders = data.allOrders.edges.map(edge => edge.node);
      ordersState.value.pagination = data.allOrders.pageInfo;
      
      console.log('✅ All orders loaded:', ordersState.value.allOrders.length);
    } catch (err) {
      ordersState.value.error = err.message;
      console.error('❌ Error fetching all orders:', err);
    } finally {
      ordersState.value.loading = false;
    }
  };

  const fetchOrder = async (id = null, orderNumber = null) => {
    ordersState.value.loading = true;
    ordersState.value.error = null;

    try {
      const { data } = await client.query({
        query: ORDER_QUERY,
        variables: { id, orderNumber },
        fetchPolicy: 'cache-first'
      });

      ordersState.value.currentOrder = data.order;
      console.log('✅ Order loaded:', data.order);
      return data.order;
    } catch (err) {
      ordersState.value.error = err.message;
      console.error('❌ Error fetching order:', err);
      return null;
    } finally {
      ordersState.value.loading = false;
    }
  };

  const createOrder = async (orderData) => {
    ordersState.value.loading = true;
    ordersState.value.error = null;

    try {
      const { data } = await client.mutate({
        mutation: CREATE_ORDER_MUTATION,
        variables: { input: orderData }
      });

      if (data.createOrder.success) {
        console.log('✅ Order created:', data.createOrder.order);
        return {
          success: true,
          order: data.createOrder.order,
          message: data.createOrder.message
        };
      } else {
        throw new Error(data.createOrder.message);
      }
    } catch (err) {
      ordersState.value.error = err.message;
      console.error('❌ Error creating order:', err);
      return {
        success: false,
        message: err.message
      };
    } finally {
      ordersState.value.loading = false;
    }
  };

  const updateOrderStatus = async (orderId, status, note = null) => {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_ORDER_STATUS_MUTATION,
        variables: { id: orderId, status, note }
      });

      if (data.updateOrderStatus.success) {
        // Update local state
        const updateOrderInList = (orderList) => {
          const index = orderList.findIndex(order => order.id === orderId);
          if (index > -1) {
            orderList[index] = { ...orderList[index], ...data.updateOrderStatus.order };
          }
        };

        updateOrderInList(ordersState.value.userOrders);
        updateOrderInList(ordersState.value.allOrders);
        
        if (ordersState.value.currentOrder?.id === orderId) {
          ordersState.value.currentOrder = { ...ordersState.value.currentOrder, ...data.updateOrderStatus.order };
        }

        console.log('✅ Order status updated:', status);
        return {
          success: true,
          message: data.updateOrderStatus.message,
          order: data.updateOrderStatus.order
        };
      } else {
        throw new Error(data.updateOrderStatus.message);
      }
    } catch (err) {
      console.error('❌ Error updating order status:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const updateTrackingNumber = async (orderId, trackingNumber) => {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_TRACKING_MUTATION,
        variables: { id: orderId, trackingNumber }
      });

      if (data.updateTrackingNumber.success) {
        // Update local state
        const updateOrderInList = (orderList) => {
          const index = orderList.findIndex(order => order.id === orderId);
          if (index > -1) {
            orderList[index].trackingNumber = trackingNumber;
          }
        };

        updateOrderInList(ordersState.value.userOrders);
        updateOrderInList(ordersState.value.allOrders);
        
        if (ordersState.value.currentOrder?.id === orderId) {
          ordersState.value.currentOrder.trackingNumber = trackingNumber;
        }

        console.log('✅ Tracking number updated:', trackingNumber);
        return {
          success: true,
          message: data.updateTrackingNumber.message
        };
      } else {
        throw new Error(data.updateTrackingNumber.message);
      }
    } catch (err) {
      console.error('❌ Error updating tracking number:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const cancelOrder = async (orderId, reason) => {
    try {
      const { data } = await client.mutate({
        mutation: CANCEL_ORDER_MUTATION,
        variables: { id: orderId, reason }
      });

      if (data.cancelOrder.success) {
        // Update local state
        const updateOrderInList = (orderList) => {
          const index = orderList.findIndex(order => order.id === orderId);
          if (index > -1) {
            orderList[index] = { ...orderList[index], ...data.cancelOrder.order };
          }
        };

        updateOrderInList(ordersState.value.userOrders);
        updateOrderInList(ordersState.value.allOrders);
        
        if (ordersState.value.currentOrder?.id === orderId) {
          ordersState.value.currentOrder = { ...ordersState.value.currentOrder, ...data.cancelOrder.order };
        }

        console.log('✅ Order cancelled:', orderId);
        return {
          success: true,
          message: data.cancelOrder.message,
          order: data.cancelOrder.order
        };
      } else {
        throw new Error(data.cancelOrder.message);
      }
    } catch (err) {
      console.error('❌ Error cancelling order:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const addTimelineEntry = async (orderId, status, note) => {
    try {
      const { data } = await client.mutate({
        mutation: ADD_TIMELINE_MUTATION,
        variables: { orderId, status, note }
      });

      if (data.addTimelineEntry.success) {
        // Update local state
        const updateOrderInList = (orderList) => {
          const index = orderList.findIndex(order => order.id === orderId);
          if (index > -1 && orderList[index].timeline) {
            orderList[index].timeline.unshift(data.addTimelineEntry.timelineEntry);
          }
        };

        updateOrderInList(ordersState.value.userOrders);
        updateOrderInList(ordersState.value.allOrders);
        
        if (ordersState.value.currentOrder?.id === orderId) {
          if (ordersState.value.currentOrder.timeline) {
            ordersState.value.currentOrder.timeline.unshift(data.addTimelineEntry.timelineEntry);
          }
        }

        console.log('✅ Timeline entry added:', status);
        return {
          success: true,
          message: data.addTimelineEntry.message,
          timelineEntry: data.addTimelineEntry.timelineEntry
        };
      } else {
        throw new Error(data.addTimelineEntry.message);
      }
    } catch (err) {
      console.error('❌ Error adding timeline entry:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const fetchOrderStats = async (dateFrom = null, dateTo = null) => {
    try {
      const { data } = await client.query({
        query: ORDER_STATS_QUERY,
        variables: { dateFrom, dateTo },
        fetchPolicy: 'cache-first'
      });

      ordersState.value.orderStats = data.orderStats;
      console.log('✅ Order stats loaded:', data.orderStats);
      return data.orderStats;
    } catch (err) {
      console.error('❌ Error fetching order stats:', err);
      return null;
    }
  };

  const generateInvoice = async (orderId) => {
    try {
      const { data } = await client.mutate({
        mutation: GENERATE_INVOICE_MUTATION,
        variables: { orderId }
      });

      if (data.generateInvoice.success) {
        console.log('✅ Invoice generated:', data.generateInvoice.invoiceUrl);
        return {
          success: true,
          invoiceUrl: data.generateInvoice.invoiceUrl,
          invoiceNumber: data.generateInvoice.invoiceNumber,
          message: data.generateInvoice.message
        };
      } else {
        throw new Error(data.generateInvoice.message);
      }
    } catch (err) {
      console.error('❌ Error generating invoice:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const getOrderStatusInfo = (status) => {
    return orderStatusConfig[status] || orderStatusConfig.pending;
  };

  const getPaymentMethodInfo = (method) => {
    return paymentMethodConfig[method] || paymentMethodConfig.cod;
  };

  const canCancelOrder = (order) => {
    if (!order) return false;
    return ['pending', 'confirmed'].includes(order.status);
  };

  const canUpdateStatus = (order) => {
    if (!order) return false;
    return !['delivered', 'cancelled'].includes(order.status);
  };

  const formatOrderNumber = (orderNumber) => {
    if (!orderNumber) return '';
    return orderNumber.startsWith('#') ? orderNumber : `#${orderNumber}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString, locale = 'ar') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : 'fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getOrdersByStatus = (orders, status) => {
    return orders.filter(order => order.status === status);
  };

  const getTotalRevenue = (orders) => {
    return orders.reduce((total, order) => total + parseFloat(order.totalAmount || 0), 0);
  };

  const searchOrders = (orders, searchTerm) => {
    if (!searchTerm) return orders;
    
    const term = searchTerm.toLowerCase();
    return orders.filter(order => 
      order.orderNumber?.toLowerCase().includes(term) ||
      order.customerName?.toLowerCase().includes(term) ||
      order.phone?.toLowerCase().includes(term) ||
      order.email?.toLowerCase().includes(term) ||
      order.shippingAddress?.toLowerCase().includes(term)
    );
  };

  const resetOrders = () => {
    ordersState.value.userOrders = [];
    ordersState.value.allOrders = [];
    ordersState.value.currentOrder = null;
    ordersState.value.orderStats = null;
    ordersState.value.error = null;
  };

  return {
    // State
    userOrders,
    allOrders,
    currentOrder,
    orderStats,
    loading,
    error,
    pagination,

    // Config
    orderStatusConfig,
    paymentMethodConfig,

    // Actions
    fetchUserOrders,
    fetchAllOrders,
    fetchOrder,
    createOrder,
    updateOrderStatus,
    updateTrackingNumber,
    cancelOrder,
    addTimelineEntry,
    fetchOrderStats,
    generateInvoice,

    // Utilities
    getOrderStatusInfo,
    getPaymentMethodInfo,
    canCancelOrder,
    canUpdateStatus,
    formatOrderNumber,
    formatPrice,
    formatDate,
    getOrdersByStatus,
    getTotalRevenue,
    searchOrders,
    resetOrders
  };
}
