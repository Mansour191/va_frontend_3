import { ref, reactive, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DASHBOARD_SETTINGS } from '@/shared/services/graphql/queries';
import { UPDATE_DASHBOARD_SETTINGS } from '@/shared/services/graphql/mutations';

export function useDashboardSettings() {
  const store = useStore();

  // Default settings
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

  // Reactive state
  const settings = reactive({ ...defaultSettings });
  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);

  // GraphQL queries and mutations
  const { 
    data: settingsData, 
    loading: queryLoading, 
    error: queryError, 
    refetch: refetchSettings 
  } = useQuery(GET_DASHBOARD_SETTINGS, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all'
  });

  const [updateSettingsMutation] = useMutation(UPDATE_DASHBOARD_SETTINGS);

  // Computed properties
  const isLoaded = computed(() => !queryLoading.value && !queryError.value && settingsData.value?.myDashboardSettings);
  const hasChanges = computed(() => {
    return JSON.stringify(settings) !== JSON.stringify(settingsData.value?.myDashboardSettings || {});
  });

  // Methods
  const loadSettings = async () => {
    loading.value = true;
    error.value = null;

    try {
      if (settingsData.value?.myDashboardSettings) {
        const data = settingsData.value.myDashboardSettings;
        
        // Update reactive settings with fetched data
        Object.assign(settings, {
          layoutJson: data.layoutJson || {},
          refreshInterval: data.refreshInterval || 30,
          showNotifications: data.showNotifications ?? true,
          primaryColor: data.primaryColor || '#3B82F6',
          defaultChartType: data.defaultChartType || 'line',
          defaultDateRange: data.defaultDateRange || '7days',
          emailNotifications: data.emailNotifications ?? true,
          pushNotifications: data.pushNotifications ?? false,
          notificationFrequency: data.notificationFrequency || 'daily',
          shareAnalytics: data.shareAnalytics ?? false,
          publicDashboard: data.publicDashboard ?? false
        });

        // Apply primary color immediately
        applyThemeColor(settings.primaryColor);
        
        // Store in Vuex for global access
        store.dispatch('dashboard/updateSettings', settings);
        
        lastUpdated.value = new Date();
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error loading dashboard settings:', err);
    } finally {
      loading.value = false;
    }
  };

  const updateSettings = async (newSettings = null) => {
    const settingsToUpdate = newSettings || settings;
    
    loading.value = true;
    error.value = null;

    try {
      const result = await updateSettingsMutation({
        variables: {
          input: settingsToUpdate
        }
      });

      if (result.data?.updateDashboardSettings?.success) {
        // Apply primary color to CSS variables
        applyThemeColor(settingsToUpdate.primaryColor);
        
        // Store in Vuex
        store.dispatch('dashboard/updateSettings', settingsToUpdate);
        
        // Update local state
        Object.assign(settings, settingsToUpdate);
        
        lastUpdated.value = new Date();
        
        // Show success notification
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'Dashboard settings updated successfully'
        });
        
        return true;
      } else {
        throw new Error(result.data?.updateDashboardSettings?.message || 'Failed to update settings');
      }
    } catch (err) {
      error.value = err.message;
      console.error('Error updating dashboard settings:', err);
      
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: 'Failed to update dashboard settings'
      });
      
      return false;
    } finally {
      loading.value = false;
    }
  };

  const resetToDefaults = async () => {
    return await updateSettings(defaultSettings);
  };

  const applyThemeColor = (color) => {
    // Apply to CSS variables for immediate theme change
    document.documentElement.style.setProperty('--v-primary-base', color);
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Update Vuetify theme colors
    if (store.state.vuetify?.theme) {
      store.state.vuetify.theme.themes.light.primary = color;
      store.state.vuetify.theme.themes.dark.primary = color;
    }
    
    // Store in localStorage for persistence
    localStorage.setItem('dashboard-primary-color', color);
    
    // Update Tailwind CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--tw-primary', color);
    
    // Generate lighter and darker variants
    const lighterColor = adjustColorBrightness(color, 20);
    const darkerColor = adjustColorBrightness(color, -20);
    
    root.style.setProperty('--tw-primary-light', lighterColor);
    root.style.setProperty('--tw-primary-dark', darkerColor);
  };

  const adjustColorBrightness = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  };

  const getSetting = (key, defaultValue = null) => {
    return settings[key] !== undefined ? settings[key] : defaultValue;
  };

  const setSetting = (key, value) => {
    settings[key] = value;
  };

  // Debounced update function
  let debounceTimer = null;
  const debouncedUpdate = (newSettings, delay = 500) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      updateSettings(newSettings);
    }, delay);
  };

  // Watchers
  watch(settingsData, loadSettings, { immediate: true });

  // Watch for changes and auto-save
  watch(settings, (newSettings) => {
    if (isLoaded.value && hasChanges.value) {
      debouncedUpdate(newSettings);
    }
  }, { deep: true });

  // Initialize theme color from localStorage
  const initializeTheme = () => {
    const savedColor = localStorage.getItem('dashboard-primary-color');
    if (savedColor) {
      applyThemeColor(savedColor);
    }
  };

  // Auto-refresh functionality
  let refreshInterval = null;
  const startAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    if (settings.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        refetchSettings();
      }, settings.refreshInterval * 1000);
    }
  };

  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };

  // Watch refresh interval changes
  watch(() => settings.refreshInterval, startAutoRefresh);

  // Initialize
  initializeTheme();

  return {
    // State
    settings,
    loading,
    error,
    lastUpdated,
    isLoaded,
    hasChanges,
    
    // Methods
    loadSettings,
    updateSettings,
    resetToDefaults,
    refetchSettings,
    
    // Utility methods
    getSetting,
    setSetting,
    debouncedUpdate,
    applyThemeColor,
    
    // Auto-refresh
    startAutoRefresh,
    stopAutoRefresh
  };
}
