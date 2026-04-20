import { reactive } from 'vue';

// Default dashboard settings
const defaultSettings = {
  layoutJson: {},
  refreshInterval: 30,
  showNotifications: true,
  primaryColor: '#3B82F6',
  defaultChartType: 'line',
  defaultDateRange: '7days',
  emailNotifications: true,
  pushNotifications: false,
  notificationFrequency: 'daily',
  shareAnalytics: false,
  publicDashboard: false
};

// State
const state = reactive({
  settings: { ...defaultSettings },
  loading: false,
  error: null,
  lastUpdated: null
});

// Getters
const getters = {
  getSettings: () => state.settings,
  getSetting: (key) => state.settings[key],
  isLoading: () => state.loading,
  getError: () => state.error,
  getLastUpdated: () => state.lastUpdated,
  getPrimaryColor: () => state.settings.primaryColor,
  getRefreshInterval: () => state.settings.refreshInterval,
  getShowNotifications: () => state.settings.showNotifications,
  getDefaultChartType: () => state.settings.defaultChartType
};

// Mutations
const mutations = {
  SET_SETTINGS(state, settings) {
    state.settings = { ...state.settings, ...settings };
    state.lastUpdated = new Date();
  },
  
  SET_SETTING(state, { key, value }) {
    state.settings[key] = value;
    state.lastUpdated = new Date();
  },
  
  SET_LOADING(state, loading) {
    state.loading = loading;
  },
  
  SET_ERROR(state, error) {
    state.error = error;
  },
  
  RESET_SETTINGS(state) {
    state.settings = { ...defaultSettings };
    state.lastUpdated = new Date();
  },
  
  CLEAR_ERROR(state) {
    state.error = null;
  }
};

// Actions
const actions = {
  updateSettings({ commit }, settings) {
    commit('SET_SETTINGS', settings);
  },
  
  updateSetting({ commit }, { key, value }) {
    commit('SET_SETTING', { key, value });
  },
  
  setLoading({ commit }, loading) {
    commit('SET_LOADING', loading);
  },
  
  setError({ commit }, error) {
    commit('SET_ERROR', error);
  },
  
  resetSettings({ commit }) {
    commit('RESET_SETTINGS');
  },
  
  clearError({ commit }) {
    commit('CLEAR_ERROR');
  },
  
  // Apply theme color to DOM
  applyThemeColor({ getters }, color) {
    const primaryColor = color || getters.getPrimaryColor();
    
    // Apply to CSS variables
    document.documentElement.style.setProperty('--v-primary-base', primaryColor);
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    
    // Update Tailwind CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--tw-primary', primaryColor);
    
    // Generate lighter and darker variants
    const lighterColor = adjustColorBrightness(primaryColor, 20);
    const darkerColor = adjustColorBrightness(primaryColor, -20);
    
    root.style.setProperty('--tw-primary-light', lighterColor);
    root.style.setProperty('--tw-primary-dark', darkerColor);
    
    // Store in localStorage
    localStorage.setItem('dashboard-primary-color', primaryColor);
  },
  
  // Initialize theme from localStorage
  initializeTheme({ dispatch }) {
    const savedColor = localStorage.getItem('dashboard-primary-color');
    if (savedColor) {
      dispatch('applyThemeColor', savedColor);
      dispatch('updateSetting', { key: 'primaryColor', value: savedColor });
    }
  }
};

// Helper function
function adjustColorBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
