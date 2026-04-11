import { useAuthStore } from '@/shared/store/auth';

// src/store/modules/wishlist.js

export default {
  namespaced: true,
  state: {
    items: (() => {
      try {
        const saved = localStorage.getItem('wishlist');
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
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    ADD_TO_WISHLIST(state, product) {
      if (!state.items.some(item => item.id === product.id)) {
        state.items.push(product);
        localStorage.setItem('wishlist', JSON.stringify(state.items));
      }
    },
    REMOVE_FROM_WISHLIST(state, productId) {
      state.items = state.items.filter(item => item.id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    CLEAR_WISHLIST(state) {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    async fetchWishlist({ commit }) {
      commit('SET_LOADING', true);
      try {
        const authStore = useAuthStore();
        if (authStore.isAuthenticated) {
          // محاكاة طلب API لجلب المفضلة من الخادم
          await new Promise(resolve => setTimeout(resolve, 500));
          // const response = await api.get('/wishlist');
          // commit('SET_ITEMS', response.data);
        }
      } catch (error) {
        commit('SET_ERROR', error.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },
    toggleWishlist({ state, commit }, product) {
      const exists = state.items.some(item => item.id === product.id);
      if (exists) {
        commit('REMOVE_FROM_WISHLIST', product.id);
      } else {
        commit('ADD_TO_WISHLIST', product);
      }
      
      const authStore = useAuthStore();
      if (authStore.isAuthenticated) {
        // sync with server
        console.log('Syncing wishlist toggle with server...');
      }
    },
    async mergeWishlist({ state, commit }) {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) return;

      commit('SET_LOADING', true);
      try {
        // محاكاة جلب المفضلة من الخادم
        await new Promise(resolve => setTimeout(resolve, 800));
        const serverWishlist = []; // محاكاة: المفضلة في الخادم فارغة حالياً
        
        const localWishlist = state.items;
        const mergedWishlist = [...serverWishlist];

        localWishlist.forEach(localItem => {
          if (!mergedWishlist.some(item => item.id === localItem.id)) {
            mergedWishlist.push(localItem);
          }
        });

        commit('SET_ITEMS', mergedWishlist);
        console.log('Wishlist merged and synced with server');
      } catch (error) {
        console.error('Failed to merge wishlist:', error);
      } finally {
        commit('SET_LOADING', false);
      }
    }
  },
  getters: {
    wishlistItems: state => state.items,
    wishlistCount: state => state.items.length,
    isInWishlist: state => productId => state.items.some(item => item.id === productId)
  }
};
