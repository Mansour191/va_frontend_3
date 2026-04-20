<template>
  <v-dialog v-model="isOpen" max-width="800px" persistent>
    <v-card>
      <v-card-title class="d-flex align-center justify-space-between">
        <span class="text-h5">Dashboard Settings</span>
        <v-btn icon @click="closeModal">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-form ref="settingsForm" v-model="formValid">
          <!-- UI Customization Section -->
          <v-row class="mb-6">
            <v-col cols="12">
              <h3 class="text-h6 mb-3">UI Customization</h3>
            </v-col>
            
            <!-- Primary Color -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="localSettings.primaryColor"
                label="Primary Color"
                type="color"
                variant="outlined"
                hint="Choose your primary theme color"
                persistent-hint
                @update:model-value="debouncedUpdateSettings"
              ></v-text-field>
            </v-col>

            <!-- Default Chart Type -->
            <v-col cols="12" md="6">
              <v-select
                v-model="localSettings.defaultChartType"
                label="Default Chart Type"
                :items="chartTypes"
                item-title="label"
                item-value="value"
                variant="outlined"
                hint="Default chart type for analytics"
                persistent-hint
                @update:model-value="updateSettings"
              ></v-select>
            </v-col>

            <!-- Refresh Interval -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="localSettings.refreshInterval"
                label="Auto-refresh Interval (seconds)"
                type="number"
                variant="outlined"
                :rules="[v => v > 0 || 'Must be greater than 0']"
                hint="Dashboard data refresh interval"
                persistent-hint
                @update:model-value="updateSettings"
              ></v-text-field>
            </v-col>

            <!-- Show Notifications -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="localSettings.showNotifications"
                label="Show Dashboard Notifications"
                color="primary"
                hint="Enable/disable dashboard notifications"
                @update:model-value="updateSettings"
              ></v-switch>
            </v-col>
          </v-row>

          <!-- Layout Configuration Section -->
          <v-row class="mb-6">
            <v-col cols="12">
              <h3 class="text-h6 mb-3">Layout Configuration</h3>
            </v-col>

            <!-- Layout JSON Editor -->
            <v-col cols="12">
              <v-textarea
                v-model="layoutJsonText"
                label="Advanced Layout Configuration"
                variant="outlined"
                rows="8"
                hint="JSON configuration for widget layout"
                persistent-hint
                :error-messages="layoutJsonError"
                @update:model-value="debouncedUpdateLayoutJson"
              ></v-textarea>
            </v-col>
          </v-row>

          <!-- Data Preferences Section -->
          <v-row>
            <v-col cols="12">
              <h3 class="text-h6 mb-3">Data Preferences</h3>
            </v-col>

            <!-- Default Date Range -->
            <v-col cols="12" md="6">
              <v-select
                v-model="localSettings.defaultDateRange"
                label="Default Date Range"
                :items="dateRanges"
                item-title="label"
                item-value="value"
                variant="outlined"
                @update:model-value="updateSettings"
              ></v-select>
            </v-col>

            <!-- Email Notifications -->
            <v-col cols="12" md="6">
              <v-switch
                v-model="localSettings.emailNotifications"
                label="Email Notifications"
                color="primary"
                @update:model-value="updateSettings"
              ></v-switch>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="secondary" @click="resetToDefaults">
          Reset to Defaults
        </v-btn>
        <v-btn color="primary" @click="saveAndClose" :loading="saving">
          Save Settings
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useQuery, useMutation } from '@apollo/client';
import { GET_DASHBOARD_SETTINGS } from '@/shared/services/graphql/queries';
import { UPDATE_DASHBOARD_SETTINGS } from '@/shared/services/graphql/mutations';

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'settings-updated']);

// Store
const store = useStore();

// Reactive data
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const formValid = ref(false);
const saving = ref(false);
const layoutJsonError = ref('');

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

// Local settings state
const localSettings = reactive({ ...defaultSettings });

// Options for selects
const chartTypes = [
  { label: 'Line Chart', value: 'line' },
  { label: 'Bar Chart', value: 'bar' },
  { label: 'Pie Chart', value: 'pie' },
  { label: 'Area Chart', value: 'area' },
  { label: 'Scatter Plot', value: 'scatter' }
];

const dateRanges = [
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Last 90 Days', value: '90days' },
  { label: 'Last Year', value: '1year' },
  { label: 'All Time', value: 'all' }
];

// GraphQL queries and mutations
const { data: settingsData, loading: loadingSettings, error: settingsError, refetch } = useQuery(GET_DASHBOARD_SETTINGS);
const [updateSettingsMutation] = useMutation(UPDATE_DASHBOARD_SETTINGS);

// Computed properties
const layoutJsonText = computed({
  get: () => JSON.stringify(localSettings.layoutJson || {}, null, 2),
  set: (value) => {
    try {
      const parsed = JSON.parse(value);
      localSettings.layoutJson = parsed;
      layoutJsonError.value = '';
    } catch (e) {
      layoutJsonError.value = 'Invalid JSON format';
    }
  }
});

// Debounce function
let debounceTimer = null;
const debouncedUpdateSettings = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    updateSettings();
  }, 500);
};

const debouncedUpdateLayoutJson = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (!layoutJsonError.value) {
      updateSettings();
    }
  }, 1000);
};

// Methods
const loadSettings = () => {
  if (settingsData.value?.myDashboardSettings) {
    const settings = settingsData.value.myDashboardSettings;
    Object.assign(localSettings, {
      layoutJson: settings.layoutJson || {},
      refreshInterval: settings.refreshInterval || 30,
      showNotifications: settings.showNotifications ?? true,
      primaryColor: settings.primaryColor || '#3B82F6',
      defaultChartType: settings.defaultChartType || 'line',
      defaultDateRange: settings.defaultDateRange || '7days',
      emailNotifications: settings.emailNotifications ?? true,
      pushNotifications: settings.pushNotifications ?? false,
      notificationFrequency: settings.notificationFrequency || 'daily',
      shareAnalytics: settings.shareAnalytics ?? false,
      publicDashboard: settings.publicDashboard ?? false
    });
  }
};

const updateSettings = async () => {
  if (!formValid.value) return;

  try {
    const result = await updateSettingsMutation({
      variables: {
        input: {
          layoutJson: localSettings.layoutJson,
          refreshInterval: localSettings.refreshInterval,
          showNotifications: localSettings.showNotifications,
          primaryColor: localSettings.primaryColor,
          defaultChartType: localSettings.defaultChartType,
          defaultDateRange: localSettings.defaultDateRange,
          emailNotifications: localSettings.emailNotifications,
          pushNotifications: localSettings.pushNotifications,
          notificationFrequency: localSettings.notificationFrequency,
          shareAnalytics: localSettings.shareAnalytics,
          publicDashboard: localSettings.publicDashboard
        }
      }
    });

    if (result.data?.updateDashboardSettings?.success) {
      // Apply primary color to CSS variables
      applyThemeColor(localSettings.primaryColor);
      
      // Store settings in Vuex
      store.dispatch('dashboard/updateSettings', localSettings);
      
      // Emit update event
      emit('settings-updated', localSettings);
      
      // Show success notification
      store.dispatch('notifications/showNotification', {
        type: 'success',
        message: 'Dashboard settings updated successfully'
      });
    } else {
      throw new Error(result.data?.updateDashboardSettings?.message || 'Failed to update settings');
    }
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'Failed to update dashboard settings'
    });
  }
};

const applyThemeColor = (color) => {
  // Apply primary color to CSS variables
  document.documentElement.style.setProperty('--v-primary-base', color);
  
  // Store in localStorage for persistence
  localStorage.setItem('dashboard-primary-color', color);
};

const resetToDefaults = () => {
  Object.assign(localSettings, defaultSettings);
  updateSettings();
};

const saveAndClose = async () => {
  saving.value = true;
  try {
    await updateSettings();
    closeModal();
  } finally {
    saving.value = false;
  }
};

const closeModal = () => {
  isOpen.value = false;
};

// Watchers
watch(settingsData, loadSettings, { immediate: true });

watch(() => localSettings.primaryColor, (newColor) => {
  applyThemeColor(newColor);
});

// Lifecycle
onMounted(() => {
  // Load saved primary color from localStorage
  const savedColor = localStorage.getItem('dashboard-primary-color');
  if (savedColor) {
    applyThemeColor(savedColor);
  }
});
</script>

<style scoped>
.v-dialog > .v-overlay__content > .v-card {
  overflow-y: auto;
  max-height: 90vh;
}

.text-h6 {
  color: var(--v-theme-primary);
  font-weight: 600;
}

/* Custom color picker styling */
:deep(.v-text-field input[type="color"]) {
  height: 40px;
  border-radius: 4px;
  cursor: pointer;
}

/* JSON textarea styling */
:deep(.v-textarea textarea) {
  font-family: 'Courier New', monospace;
  font-size: 13px;
}
</style>
