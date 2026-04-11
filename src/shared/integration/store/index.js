// Vuex store للتكامل مع ERPNext
export default {
  namespaced: true,

  state: {
    connectionStatus: false,
    lastSync: null,
    syncInProgress: false,
    syncHistory: [],
    integrationErrors: [],
    syncStats: {
      products: { total: 0, synced: 0, pending: 0 },
      orders: { total: 0, synced: 0, pending: 0 },
      customers: { total: 0, synced: 0, pending: 0 },
    },
  },

  mutations: {
    SET_CONNECTION_STATUS(state, status) {
      state.connectionStatus = status;
    },
    SET_LAST_SYNC(state, time) {
      state.lastSync = time;
    },
    SET_SYNC_IN_PROGRESS(state, inProgress) {
      state.syncInProgress = inProgress;
    },
    ADD_SYNC_HISTORY(state, record) {
      state.syncHistory.unshift(record);
      if (state.syncHistory.length > 50) state.syncHistory.pop();
    },
    ADD_INTEGRATION_ERROR(state, error) {
      state.integrationErrors.unshift(error);
      if (state.integrationErrors.length > 20) state.integrationErrors.pop();
    },
    UPDATE_SYNC_STATS(state, stats) {
      state.syncStats = { ...state.syncStats, ...stats };
    },
  },

  actions: {
    async testConnection({ commit }) {
      const erpnextService = (await import('@/shared/integration/services/ERPNextService')).default;
      const result = await erpnextService.testConnection();
      commit('SET_CONNECTION_STATUS', result.success);
      return result;
    },

    async syncProducts({ commit }) {
      commit('SET_SYNC_IN_PROGRESS', true);

      try {
        // سيتم إضافة منطق المزامنة لاحقاً
        commit('ADD_SYNC_HISTORY', {
          id: Date.now(),
          type: 'products',
          status: 'success',
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        commit('ADD_INTEGRATION_ERROR', {
          id: Date.now(),
          type: 'sync_error',
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } finally {
        commit('SET_SYNC_IN_PROGRESS', false);
        commit('SET_LAST_SYNC', new Date().toISOString());
      }
    },
  },

  getters: {
    connectionStatus: (state) => state.connectionStatus,
    lastSync: (state) => state.lastSync,
    syncInProgress: (state) => state.syncInProgress,
    recentErrors: (state) => state.integrationErrors.slice(0, 5),
    needsAttention: (state) => state.integrationErrors.length > 0,
  },
};
