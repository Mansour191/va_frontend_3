export default {
  namespaced: true,
  state: {
    notifications: (() => {
      try {
        const saved = localStorage.getItem('notifications');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    })(),
    unreadCount: 0,
  },
  mutations: {
    // ... باقي الميوتيشنز
    SET_NOTIFICATIONS(state, notifications) {
      state.notifications = notifications;
      state.unreadCount = notifications.filter((n) => !n.read).length;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    },
    ADD_NOTIFICATION(state, notification) {
      state.notifications.unshift({
        id: Date.now(),
        read: false,
        time: new Date().toISOString(),
        ...notification,
      });
      state.unreadCount = state.notifications.filter((n) => !n.read).length;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    MARK_NOTIFICATION_READ(state, id) {
      const notification = state.notifications.find((n) => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount--;
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      }
    },
    MARK_ALL_READ(state) {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
      localStorage.setItem('notifications', JSON.stringify(state.notifications));
    },
    DELETE_NOTIFICATION(state, id) {
      const index = state.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount--;
        }
        state.notifications.splice(index, 1);
        localStorage.setItem('notifications', JSON.stringify(state.notifications));
      }
    },
  },
  actions: {
    // ... باقي الأكشنز
    addNotification({ commit }, notification) {
      commit('ADD_NOTIFICATION', notification);
    },
    markNotificationRead({ commit }, id) {
      commit('MARK_NOTIFICATION_READ', id);
    },
    markAllRead({ commit }) {
      commit('MARK_ALL_READ');
    },
    deleteNotification({ commit }, id) {
      commit('DELETE_NOTIFICATION', id);
    },
  },
  getters: {
    notifications: (state) => state.notifications, // ✅ تأكد من وجود هذا
    unreadCount: (state) => state.unreadCount, // ✅ تأكد من وجود هذا
  },
};
