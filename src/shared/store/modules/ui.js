export default {
  namespaced: true,
  state: {
    drawer: false,
    language: localStorage.getItem('language') || 'ar',
    theme: localStorage.getItem('theme') || 'dark',
    loading: false,
  },
  mutations: {
    SET_DRAWER(state, drawer) {
      state.drawer = drawer;
    },
    SET_LANGUAGE(state, lang) {
      state.language = lang;
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
      document.body.dir = lang === 'ar' ? 'rtl' : 'ltr';
    },
    SET_THEME(state, theme) {
      state.theme = theme;
      localStorage.setItem('theme', theme);
    },
    SET_LOADING(state, loading) {
      state.loading = loading;
    },
  },
  actions: {
    toggleDrawer({ commit, state }) {
      commit('SET_DRAWER', !state.drawer);
    },
    setLanguage({ commit }, lang) {
      commit('SET_LANGUAGE', lang);
    },
    setTheme({ commit }, theme) {
      commit('SET_THEME', theme);
    },
  },
  getters: {
    drawer: (state) => state.drawer,
    language: (state) => state.language,
    theme: (state) => state.theme,
    loading: (state) => state.loading,
  },
};
