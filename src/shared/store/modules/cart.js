import { useAuthStore } from '@/shared/store/auth';

// src/store/modules/cart.js

export default {
  namespaced: true,
  state: {
    items: (() => {
      try {
        const saved = localStorage.getItem('cart');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    })(),
    loading: false,
    error: null,
  },
  mutations: {
    SET_ITEMS(state, items) {
      state.items = items;
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    ADD_TO_CART(state, orderItem) {
      // Create a unique key for the item based on product, variant, and material
      const itemKey = `${orderItem.product?.id || orderItem.productId}_${orderItem.variant?.id || 'default'}_${orderItem.material?.id || 'default'}`;
      
      const existingItem = state.items.find(item => 
        item.itemKey === itemKey || 
        (item.product?.id === orderItem.product?.id && 
         item.variant?.id === orderItem.variant?.id && 
         item.material?.id === orderItem.material?.id)
      );
      
      if (existingItem) {
        existingItem.quantity += orderItem.quantity || 1;
        existingItem.totalPrice = existingItem.price * existingItem.quantity;
      } else {
        // Create proper orderitem object structure
        const newItem = {
          id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          itemKey,
          product: orderItem.product || {
            id: orderItem.productId,
            nameAr: orderItem.nameAr || orderItem.name,
            nameEn: orderItem.nameEn,
            slug: orderItem.slug,
            basePrice: orderItem.basePrice,
            images: orderItem.images || []
          },
          variant: orderItem.variant || null,
          material: orderItem.material || null,
          quantity: orderItem.quantity || 1,
          price: orderItem.price || orderItem.product?.basePrice || 0,
          totalPrice: (orderItem.price || orderItem.product?.basePrice || 0) * (orderItem.quantity || 1),
          notes: orderItem.notes || '',
          customAttributes: orderItem.customAttributes || {},
          addedAt: new Date().toISOString()
        };
        
        state.items.push(newItem);
      }
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    REMOVE_FROM_CART(state, itemKey) {
      state.items = state.items.filter(item => item.itemKey !== itemKey && item.id !== itemKey);
      localStorage.setItem('cart', JSON.stringify(state.items));
    },
    UPDATE_QUANTITY(state, { itemKey, quantity }) {
      const item = state.items.find(item => item.itemKey === itemKey || item.id === itemKey);
      if (item) {
        item.quantity = Math.max(1, quantity);
        item.totalPrice = item.price * item.quantity;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    UPDATE_ITEM_VARIANT(state, { itemKey, variant }) {
      const item = state.items.find(item => item.itemKey === itemKey || item.id === itemKey);
      if (item) {
        item.variant = variant;
        item.price = variant.price || item.product.basePrice;
        item.totalPrice = item.price * item.quantity;
        item.itemKey = `${item.product.id}_${variant.id || 'default'}_${item.material?.id || 'default'}`;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    UPDATE_ITEM_MATERIAL(state, { itemKey, material }) {
      const item = state.items.find(item => item.itemKey === itemKey || item.id === itemKey);
      if (item) {
        item.material = material;
        // Update price based on material if it affects pricing
        if (material.pricePerM2 && item.variant?.attributes?.size) {
          // Calculate price based on material and size
          item.price = material.pricePerM2 * parseFloat(item.variant.attributes.size);
          item.totalPrice = item.price * item.quantity;
        }
        item.itemKey = `${item.product.id}_${item.variant?.id || 'default'}_${material.id || 'default'}`;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    UPDATE_ITEM_NOTES(state, { itemKey, notes }) {
      const item = state.items.find(item => item.itemKey === itemKey || item.id === itemKey);
      if (item) {
        item.notes = notes;
        localStorage.setItem('cart', JSON.stringify(state.items));
      }
    },
    CLEAR_CART(state) {
      state.items = [];
      localStorage.removeItem('cart');
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchCart({ commit }) {
      commit('SET_LOADING', true);
      try {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          // محاكاة طلب API لجلب السلة من الخادم
          await new Promise(resolve => setTimeout(resolve, 500));
          // const response = await api.get('/cart');
          // commit('SET_ITEMS', response.data);
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    addToCart({ commit }, orderItem) {
      commit('ADD_TO_CART', orderItem);
      
      // إرسال إشعار وتوست عند إضافة منتج للسلة
      import('@/shared/integration/services/NotificationService').then(service => {
        const productName = orderItem.product?.nameAr || orderItem.nameAr || orderItem.name || 'منتج';
        const materialName = orderItem.material?.nameAr ? ` (${orderItem.material.nameAr})` : '';
        service.default.success(
          'تمت الإضافة للسلة', 
          `تم إضافة ${productName}${materialName} بنجاح إلى سلة التسوق الخاصة بك.`
        );
      });

      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing cart addition with server...');
      }
    },
    removeFromCart({ commit }, itemKey) {
      commit('REMOVE_FROM_CART', itemKey);
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing cart removal with server...');
      }
    },
    updateQuantity({ commit }, payload) {
      commit('UPDATE_QUANTITY', payload);
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing quantity update with server...');
      }
    },
    updateItemVariant({ commit }, payload) {
      commit('UPDATE_ITEM_VARIANT', payload);
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing variant update with server...');
      }
    },
    updateItemMaterial({ commit }, payload) {
      commit('UPDATE_ITEM_MATERIAL', payload);
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing material update with server...');
      }
    },
    updateItemNotes({ commit }, payload) {
      commit('UPDATE_ITEM_NOTES', payload);
    },
    clearCart({ commit }) {
      commit('CLEAR_CART');
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server logic
        console.log('Syncing cart clear with server...');
      }
    },
    async mergeCart({ state, commit }) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;
      
      commit('SET_LOADING', true);
      try {
        // محاكاة جلب السلة من الخادم
        await new Promise(resolve => setTimeout(resolve, 800));
        const serverCart = []; // هب أن السلة في الخادم فارغة حالياً للمحاكاة
        
        const localCart = state.items;
        const mergedCart = [...serverCart];

        localCart.forEach(localItem => {
          const existingItem = mergedCart.find(item => 
            item.product?.id === localItem.product?.id && 
            item.variant?.id === localItem.variant?.id && 
            item.material?.id === localItem.material?.id
          );
          if (existingItem) {
            existingItem.quantity += localItem.quantity;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
          } else {
            mergedCart.push(localItem);
          }
        });

        commit('SET_ITEMS', mergedCart);
        // بعد الدمج، نقوم بتحديث الخادم
        console.log('Cart merged and synced with server');
      } catch (error) {
        console.error('Failed to merge cart:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    // Convert cart items to order items format for checkout
    convertToOrderItems({ state }) {
      return state.items.map(item => ({
        productId: item.product.id,
        variantId: item.variant?.id,
        materialId: item.material?.id,
        quantity: item.quantity,
        price: item.price,
        notes: item.notes,
        customAttributes: item.customAttributes
      }));
    }
  },
  getters: {
    cartItems: state => state.items,
    cartTotalItems: state => state.items.reduce((total, item) => total + item.quantity, 0),
    cartTotalPrice: state => state.items.reduce((total, item) => total + item.totalPrice, 0),
    isCartEmpty: state => state.items.length === 0,
    // Helper getters for specific use cases
    getItemsByMaterial: (state) => (materialId) => {
      return state.items.filter(item => item.material?.id === materialId);
    },
    getPremiumItems: (state) => {
      return state.items.filter(item => item.material?.isPremium);
    },
    getItemsNeedingCustomWork: (state) => {
      return state.items.filter(item => 
        item.customAttributes && Object.keys(item.customAttributes).length > 0
      );
    }
  }
};
