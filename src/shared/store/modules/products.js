import ProductSyncService from '@/integration/services/ProductSyncService';
import {
  DELETE_PRODUCT,
  GET_CATEGORIES,
  GET_PRODUCTS,
  UPSERT_PRODUCT,
  graphqlMutation,
  graphqlQuery,
} from '@/integration/services/graphql';

export default {
  namespaced: true,

  state: {
    products: [],
    categories: [],
    loading: false,
    error: null,
    syncProgress: 0,
  },

  mutations: {
    SET_PRODUCTS(state, products) {
      state.products = products;
    },
    SET_CATEGORIES(state, categories) {
      state.categories = categories;
    },
    SET_LOADING(state, status) {
      state.loading = status;
    },
    SET_ERROR(state, error) {
      state.error = error;
    },
    ADD_PRODUCT(state, product) {
      state.products.unshift(product);
    },
    UPDATE_PRODUCT(state, product) {
      const index = state.products.findIndex((p) => p.id === product.id);
      if (index !== -1) {
        state.products.splice(index, 1, product);
      }
    },
    DELETE_PRODUCT(state, id) {
      state.products = state.products.filter((p) => p.id !== id);
    },
    SET_SYNC_PROGRESS(state, progress) {
      state.syncProgress = progress;
    },
  },

  actions: {
    async fetchProducts({ commit }) {
      commit('SET_LOADING', true);
      try {
        const data = await graphqlQuery(GET_PRODUCTS);
        commit('SET_PRODUCTS', data.products || []);
      } catch (e) {
        commit('SET_ERROR', e.message);
      } finally {
        commit('SET_LOADING', false);
      }
    },

    async fetchCategories({ commit }) {
      try {
        const data = await graphqlQuery(GET_CATEGORIES);
        commit('SET_CATEGORIES', data.categories || []);
      } catch (e) {
        console.error('Error fetching categories:', e);
      }
    },

    async saveProduct({ commit }, product) {
      try {
        const variables = {
          id: product.id || null,
          nameAr: product.name_ar || product.nameAr || product.name_arabic || '',
          nameEn: product.name_en || product.nameEn || product.name || '',
          slug: product.slug,
          categoryId: product.category || product.category_id || product.categoryId,
          descriptionAr: product.description_ar || product.descriptionAr || '',
          descriptionEn: product.description_en || product.descriptionEn || '',
          basePrice: Number(product.base_price || product.basePrice || 0),
          onSale: Boolean(product.on_sale ?? product.onSale),
          discountPercent: Number(product.discount_percent || product.discountPercent || 0),
          isNew: Boolean(product.is_new ?? product.isNew ?? true),
        };
        const data = await graphqlMutation(UPSERT_PRODUCT, variables);
        const saved = data.upsertProduct.product;
        if (product.id) {
          commit('UPDATE_PRODUCT', saved);
        } else {
          commit('ADD_PRODUCT', saved);
        }
        return saved;
      } catch (e) {
        throw new Error(e.message || 'حدث خطأ أثناء حفظ المنتج');
      }
    },

    async deleteProduct({ commit }, id) {
      try {
        await graphqlMutation(DELETE_PRODUCT, { id });
        commit('DELETE_PRODUCT', id);
      } catch (e) {
        throw new Error(e.message || 'حدث خطأ أثناء حذف المنتج');
      }
    },

    async syncAllWithERPNext({ commit }) {
      commit('SET_LOADING', true);
      try {
        const result = await ProductSyncService.syncProducts((progress) => {
          commit('SET_SYNC_PROGRESS', progress);
        });
        // تحديث المنتجات بعد المزامنة
        // commit('SET_PRODUCTS', result.products);
        return result;
      } catch (e) {
        commit('SET_ERROR', e.message);
        throw e;
      } finally {
        commit('SET_LOADING', false);
        commit('SET_SYNC_PROGRESS', 0);
      }
    },
  },

  getters: {
    allProducts: (state) => state.products,
    productCount: (state) => state.products.length,
    lowStockProducts: (state) => state.products.filter((p) => p.stock < 10),
    getProductById: (state) => (id) => state.products.find((p) => p.id === id),
  },
};
