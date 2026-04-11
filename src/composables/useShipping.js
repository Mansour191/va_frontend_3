import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useApolloClient } from '@vue/apollo-composable';
import { useI18n } from 'vue-i18n';
import {
  ACTIVE_SHIPPING_ZONES_QUERY,
  SHIPPING_ZONE_QUERY,
  SHIPPING_ZONE_BY_WILAYA_QUERY,
  CALCULATE_SHIPPING_QUERY,
  CREATE_SHIPPING_ZONE_MUTATION,
  UPDATE_SHIPPING_ZONE_MUTATION,
  DELETE_SHIPPING_ZONE_MUTATION,
  TOGGLE_SHIPPING_ZONE_MUTATION
} from '@/integration/graphql/shipping.graphql';

export function useShipping() {
  const store = useStore();
  const { t } = useI18n();
  const { client } = useApolloClient();

  // State
  const shippingState = ref({
    activeZones: [],
    selectedZone: null,
    deliveryType: 'home_delivery', // 'home_delivery' or 'stop_desk'
    loading: false,
    error: null,
    calculatedShipping: null
  });

  // Computed
  const activeZones = computed(() => shippingState.value.activeZones);
  const selectedZone = computed(() => shippingState.value.selectedZone);
  const deliveryType = computed(() => shippingState.value.deliveryType);
  const loading = computed(() => shippingState.value.loading);
  const error = computed(() => shippingState.value.error);
  const calculatedShipping = computed(() => shippingState.value.calculatedShipping);

  // Functions
  const fetchActiveShippingZones = async () => {
    shippingState.value.loading = true;
    shippingState.value.error = null;

    try {
      const { data } = await client.query({
        query: ACTIVE_SHIPPING_ZONES_QUERY,
        fetchPolicy: 'cache-first'
      });

      shippingState.value.activeZones = data.activeShippingZones.edges.map(edge => edge.node);
      console.log('✅ Active shipping zones loaded:', shippingState.value.activeZones.length);
    } catch (err) {
      shippingState.value.error = err.message;
      console.error('❌ Error fetching shipping zones:', err);
    } finally {
      shippingState.value.loading = false;
    }
  };

  const fetchShippingZone = async (id) => {
    try {
      const { data } = await client.query({
        query: SHIPPING_ZONE_QUERY,
        variables: { id },
        fetchPolicy: 'cache-first'
      });

      return data.shippingZone;
    } catch (err) {
      console.error('❌ Error fetching shipping zone:', err);
      return null;
    }
  };

  const fetchShippingZoneByWilaya = async (wilayaId) => {
    try {
      const { data } = await client.query({
        query: SHIPPING_ZONE_BY_WILAYA_QUERY,
        variables: { wilayaId },
        fetchPolicy: 'cache-first'
      });

      return data.shippingZoneByWilaya;
    } catch (err) {
      console.error('❌ Error fetching shipping zone by wilaya:', err);
      return null;
    }
  };

  const calculateShipping = async (wilayaId, orderTotal, deliveryType = null) => {
    shippingState.value.loading = true;
    shippingState.value.error = null;

    try {
      const { data } = await client.query({
        query: CALCULATE_SHIPPING_QUERY,
        variables: {
          wilayaId,
          orderTotal,
          deliveryType: deliveryType || shippingState.value.deliveryType
        },
        fetchPolicy: 'no-cache'
      });

      shippingState.value.calculatedShipping = data.calculateShipping;
      console.log('✅ Shipping calculated:', data.calculateShipping);
      return data.calculateShipping;
    } catch (err) {
      shippingState.value.error = err.message;
      console.error('❌ Error calculating shipping:', err);
      return null;
    } finally {
      shippingState.value.loading = false;
    }
  };

  const selectShippingZone = async (zone) => {
    if (!zone) {
      shippingState.value.selectedZone = null;
      shippingState.value.calculatedShipping = null;
      return;
    }

    shippingState.value.selectedZone = zone;
    
    // Calculate shipping for selected zone
    const cartTotal = store.getters['cart/total'];
    await calculateShipping(zone.wilayaId, cartTotal);
    
    console.log('✅ Shipping zone selected:', zone.nameAr);
  };

  const setDeliveryType = (type) => {
    shippingState.value.deliveryType = type;
    
    // Recalculate shipping if zone is selected
    if (shippingState.value.selectedZone) {
      const cartTotal = store.getters['cart/total'];
      calculateShipping(shippingState.value.selectedZone.wilayaId, cartTotal, type);
    }
  };

  const calculateTotalWithShipping = (orderTotal, shippingZone = null, deliveryType = null) => {
    if (!shippingZone) {
      shippingZone = shippingState.value.selectedZone;
    }

    if (!deliveryType) {
      deliveryType = shippingState.value.deliveryType;
    }

    if (!shippingZone) {
      return {
        subtotal: orderTotal,
        shippingCost: 0,
        total: orderTotal,
        deliveryType: null,
        estimatedDays: null
      };
    }

    let shippingCost = 0;
    let estimatedDays = null;

    if (deliveryType === 'home_delivery') {
      shippingCost = shippingZone.homeDeliveryPrice;
      estimatedDays = '2-3';
    } else {
      shippingCost = shippingZone.stopDeskPrice;
      estimatedDays = '1-2';
    }

    const total = parseFloat(orderTotal) + parseFloat(shippingCost);

    return {
      subtotal: parseFloat(orderTotal),
      shippingCost: parseFloat(shippingCost),
      total: total,
      deliveryType,
      estimatedDays,
      shippingZone: {
        id: shippingZone.id,
        nameAr: shippingZone.nameAr,
        nameFr: shippingZone.nameFr,
        wilayaId: shippingZone.wilayaId
      }
    };
  };

  const formatShippingPrice = (price) => {
    return new Intl.NumberFormat('ar-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDeliveryTime = (days, deliveryType) => {
    if (!days) return t('unknown', 'غير محدد');
    
    const typeText = deliveryType === 'home_delivery' ? 
      t('homeDelivery', 'توصيل للمنزل') : 
      t('stopDesk', 'نقطة التوقف');
    
    return `${typeText}: ${days} ${t('days', 'أيام')}`;
  };

  const getShippingZoneName = (zone, locale = 'ar') => {
    if (!zone) return '';
    return locale === 'ar' ? zone.nameAr : zone.nameFr;
  };

  const isZoneActive = (zone) => {
    return zone && zone.isActive;
  };

  const validateShippingSelection = () => {
    if (!shippingState.value.selectedZone) {
      return {
        isValid: false,
        message: t('pleaseSelectShippingZone', 'الرجاء اختيار منطقة شحن')
      };
    }

    if (!isZoneActive(shippingState.value.selectedZone)) {
      return {
        isValid: false,
        message: t('shippingZoneNotActive', 'منطقة الشحن المختارة غير نشطة')
      };
    }

    return { isValid: true };
  };

  const createShippingZone = async (input) => {
    try {
      const { data } = await client.mutate({
        mutation: CREATE_SHIPPING_ZONE_MUTATION,
        variables: { input }
      });

      if (data.createShippingZone.success) {
        await fetchActiveShippingZones();
        console.log('✅ Shipping zone created:', data.createShippingZone.shippingZone);
      }

      return {
        success: data.createShippingZone.success,
        message: data.createShippingZone.message,
        shippingZone: data.createShippingZone.shippingZone
      };
    } catch (err) {
      console.error('❌ Error creating shipping zone:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const updateShippingZone = async (id, input) => {
    try {
      const { data } = await client.mutate({
        mutation: UPDATE_SHIPPING_ZONE_MUTATION,
        variables: { id, input }
      });

      if (data.updateShippingZone.success) {
        await fetchActiveShippingZones();
        console.log('✅ Shipping zone updated:', data.updateShippingZone.shippingZone);
      }

      return {
        success: data.updateShippingZone.success,
        message: data.updateShippingZone.message,
        shippingZone: data.updateShippingZone.shippingZone
      };
    } catch (err) {
      console.error('❌ Error updating shipping zone:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const deleteShippingZone = async (id) => {
    try {
      const { data } = await client.mutate({
        mutation: DELETE_SHIPPING_ZONE_MUTATION,
        variables: { id }
      });

      if (data.deleteShippingZone.success) {
        await fetchActiveShippingZones();
        console.log('✅ Shipping zone deleted');
      }

      return {
        success: data.deleteShippingZone.success,
        message: data.deleteShippingZone.message
      };
    } catch (err) {
      console.error('❌ Error deleting shipping zone:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const toggleShippingZone = async (id, isActive) => {
    try {
      const { data } = await client.mutate({
        mutation: TOGGLE_SHIPPING_ZONE_MUTATION,
        variables: { id, isActive }
      });

      if (data.toggleShippingZone.success) {
        await fetchActiveShippingZones();
        console.log('✅ Shipping zone status toggled');
      }

      return {
        success: data.toggleShippingZone.success,
        message: data.toggleShippingZone.message,
        shippingZone: data.toggleShippingZone.shippingZone
      };
    } catch (err) {
      console.error('❌ Error toggling shipping zone:', err);
      return {
        success: false,
        message: err.message
      };
    }
  };

  const resetShipping = () => {
    shippingState.value.selectedZone = null;
    shippingState.value.calculatedShipping = null;
    shippingState.value.deliveryType = 'home_delivery';
  };

  // Initialize
  const initialize = async () => {
    await fetchActiveShippingZones();
  };

  return {
    // State
    activeZones,
    selectedZone,
    deliveryType,
    loading,
    error,
    calculatedShipping,

    // Actions
    fetchActiveShippingZones,
    fetchShippingZone,
    fetchShippingZoneByWilaya,
    calculateShipping,
    selectShippingZone,
    setDeliveryType,
    calculateTotalWithShipping,
    formatShippingPrice,
    formatDeliveryTime,
    getShippingZoneName,
    isZoneActive,
    validateShippingSelection,
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    toggleShippingZone,
    resetShipping,
    initialize
  };
}
