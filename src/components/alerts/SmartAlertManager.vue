<template>
  <div class="smart-alert-manager">
    <!-- Alert List -->
    <v-card class="alerts-list-card" elevation="2">
      <v-card-title class="d-flex align-center justify-space-between">
        <div>
          <v-icon class="me-2">mdi-bell-outline</v-icon>
          <span>my altnbyh aldhkyh</span>
        </div>
        <v-btn
          color="primary"
          variant="outlined"
          @click="showCreateDialog = true"
          prepend-icon="mdi-plus"
        >
          ansha' altnbyh
        </v-btn>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-0">
        <v-list v-if="alerts.length > 0" class="alerts-list">
          <v-list-item
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-item"
            :class="{ 'alert-disabled': !alert.is_active }"
          >
            <template v-slot:prepend>
              <v-icon
                :color="alert.is_active ? 'primary' : 'grey'"
                :icon="getAlertIcon(alert.type)"
              />
            </template>

            <v-list-item-title class="d-flex align-center">
              <span class="alert-name">{{ alert.name }}</span>
              <v-chip
                :color="alert.is_active ? 'success' : 'grey'"
                size="x-small"
                class="ms-2"
              >
                {{ alert.is_active ? 'mf\'l' : 'm\'tl' }}
              </v-chip>
            </v-list-item-title>

            <v-list-item-subtitle>
              {{ alert.message }}
              <div class="alert-meta">
                <span class="text-caption">
                  {{ getAlertTypeDisplay(alert.type) }}
                </span>
                <span v-if="alert.last_triggered" class="text-caption ms-2">
                  akhr tshghyr: {{ formatDate(alert.last_triggered) }}
                </span>
              </div>
            </v-list-item-subtitle>

            <template v-slot:append>
              <div class="alert-actions">
                <v-btn
                  :color="alert.is_active ? 'warning' : 'success'"
                  size="small"
                  variant="text"
                  @click="toggleAlert(alert)"
                  :loading="togglingAlerts.includes(alert.id)"
                >
                  <v-icon>
                    {{ alert.is_active ? 'mdi-pause' : 'mdi-play' }}
                  </v-icon>
                </v-btn>
                
                <v-btn
                  color="info"
                  size="small"
                  variant="text"
                  @click="editAlert(alert)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                
                <v-btn
                  color="error"
                  size="small"
                  variant="text"
                  @click="confirmDelete(alert)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </div>
            </template>
          </v-list-item>
        </v-list>

        <v-empty-state
          v-else
          icon="mdi-bell-off"
          title="la ywjod altnbyh aldhkyh"
          text="ansa' awwl altnbyh aldhkyh lyndh' altnbyh almts'h bshrtayk"
        >
          <v-btn
            color="primary"
            @click="showCreateDialog = true"
            prepend-icon="mdi-plus"
          >
            ansha' altnbyh alawal
          </v-btn>
        </v-empty-state>
      </v-card-text>
    </v-card>

    <!-- Create/Edit Alert Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="me-2">mdi-bell-plus</v-icon>
          {{ editingAlert ? 'tdhyr altnbyh' : 'ansha' altnbyh aldhkyh' }}
        </v-card-title>

        <v-card-text>
          <v-form ref="alertForm" v-model="formValid">
            <v-text-field
              v-model="alertForm.name"
              label="asm altnbyh"
              variant="outlined"
              :rules="[v => !!v || 'hhdh alhql mtlwb']"
              prepend-inner-icon="mdi-tag"
              class="mb-4"
            />

            <v-select
              v-model="alertForm.type"
              :items="alertTypes"
              label="naw' altnbyh"
              variant="outlined"
              :rules="[v => !!v || 'hhdh alhql mtlwb']"
              prepend-inner-icon="mdi-bell-ring"
              class="mb-4"
              @update:model-value="onTypeChange"
            />

            <v-textarea
              v-model="alertForm.message"
              label="rsalh altnbyh"
              variant="outlined"
              :rules="[v => !!v || 'hhdh alhql mtlwb']"
              prepend-inner-icon="mdi-message-text"
              rows="3"
              class="mb-4"
            />

            <!-- Condition Fields Based on Alert Type -->
            <div class="conditions-section mb-4">
              <h3 class="text-h6 mb-3">alshrt almts'h</h3>
              
              <!-- Price Drop Conditions -->
              <div v-if="alertForm.type === 'PRICE_DROP'">
                <v-text-field
                  v-model.number="alertForm.conditions.threshold_percentage"
                  label="nsbt altnkhfs altdnyh (%)"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="100"
                  prepend-inner-icon="mdi-percent"
                  class="mb-3"
                />
                <v-text-field
                  v-model.number="alertForm.conditions.min_price"
                  label="als'ar aladna"
                  type="number"
                  variant="outlined"
                  min="0"
                  prepend-inner-icon="mdi-currency"
                  class="mb-3"
                />
              </div>

              <!-- Stock Alert Conditions -->
              <div v-else-if="alertForm.type === 'STOCK_ALERT'">
                <v-text-field
                  v-model.number="alertForm.conditions.min_stock"
                  label="mkdwy almkhzn aladna"
                  type="number"
                  variant="outlined"
                  min="0"
                  prepend-inner-icon="mdi-package-variant"
                  class="mb-3"
                />
                <v-text-field
                  v-model.number="alertForm.conditions.max_stock"
                  label="mkdwy almkhzn alaqsa"
                  type="number"
                  variant="outlined"
                  min="0"
                  prepend-inner-icon="mdi-package-variant-closed"
                  class="mb-3"
                />
              </div>

              <!-- New Product Conditions -->
              <div v-else-if="alertForm.type === 'NEW_PRODUCT'">
                <v-select
                  v-model="alertForm.conditions.categories"
                  :items="categoryOptions"
                  label="altsnifat"
                  variant="outlined"
                  multiple
                  chips
                  prepend-inner-icon="mdi-category"
                  class="mb-3"
                />
                <v-text-field
                  v-model.number="alertForm.conditions.min_price"
                  label="als'ar aladna"
                  type="number"
                  variant="outlined"
                  min="0"
                  prepend-inner-icon="mdi-currency"
                  class="mb-3"
                />
                <v-text-field
                  v-model.number="alertForm.conditions.max_price"
                  label="als'ar alaqsa"
                  type="number"
                  variant="outlined"
                  min="0"
                  prepend-inner-icon="mdi-currency"
                  class="mb-3"
                />
              </div>

              <!-- Order Status Conditions -->
              <div v-else-if="alertForm.type === 'ORDER_STATUS'">
                <v-select
                  v-model="alertForm.conditions.statuses"
                  :items="orderStatusOptions"
                  label="halat alttb"
                  variant="outlined"
                  multiple
                  chips
                  prepend-inner-icon="mdi-clipboard-list"
                  class="mb-3"
                />
              </div>

              <!-- Promotion Conditions -->
              <div v-else-if="alertForm.type === 'PROMOTION'">
                <v-text-field
                  v-model.number="alertForm.conditions.min_discount"
                  label="nsbt altkhsym altdnyh (%)"
                  type="number"
                  variant="outlined"
                  min="1"
                  max="100"
                  prepend-inner-icon="mdi-percent"
                  class="mb-3"
                />
                <v-select
                  v-model="alertForm.conditions.categories"
                  :items="categoryOptions"
                  label="altsnifat almts'h"
                  variant="outlined"
                  multiple
                  chips
                  prepend-inner-icon="mdi-category"
                  class="mb-3"
                />
              </div>

              <!-- Custom Conditions -->
              <div v-else-if="alertForm.type === 'CUSTOM'">
                <v-textarea
                  v-model="customConditionsJson"
                  label="alshrt almts'h (JSON)"
                  variant="outlined"
                  rows="4"
                  placeholder='{"field": "price", "operator": "lte", "value": 1000}'
                  class="mb-3"
                  @input="parseCustomConditions"
                />
                <v-alert
                  v-if="customConditionsError"
                  type="error"
                  variant="tonal"
                  class="mb-3"
                >
                  {{ customConditionsError }}
                </v-alert>
              </div>
            </div>

            <v-switch
              v-model="alertForm.is_active"
              label="tfdyl altnbyh fwan'"
              color="primary"
              inset
            />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="closeDialog">ilgha'</v-btn>
          <v-btn
            color="primary"
            @click="saveAlert"
            :loading="saving"
            :disabled="!formValid || (alertForm.type === 'CUSTOM' && customConditionsError)"
          >
            {{ editingAlert ? 'tdhyr' : 'ansha'' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title>
          <v-icon class="me-2" color="error">mdi-delete-alert</v-icon>
          tdkyd alhdf
        </v-card-title>

        <v-card-text>
          hhal tbyd hdh altnbyh: <strong>{{ alertToDelete?.name }}</strong>
          <br><br>
          hadh alijra' ghayr qabl llraj'.
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn @click="showDeleteDialog = false">ilgha'</v-btn>
          <v-btn
            color="error"
            @click="deleteAlert"
            :loading="deleting"
          >
            hdf
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useApolloClient } from '@apollo/client';
import { gql } from '@apollo/client/core';

const { client } = useApolloClient();

// Reactive data
const alerts = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const togglingAlerts = ref([]);
const showCreateDialog = ref(false);
const showDeleteDialog = ref(false);
const editingAlert = ref(null);
const alertToDelete = ref(null);
const formValid = ref(false);
const customConditionsJson = ref('');
const customConditionsError = ref('');

// Form data
const alertForm = reactive({
  name: '',
  type: '',
  message: '',
  conditions: {},
  is_active: true
});

// Options
const alertTypes = [
  { title: 'tnkhfs als\'ar', value: 'PRICE_DROP' },
  { title: 'tnbyh almkhzn', value: 'STOCK_ALERT' },
  { title: 'mntjt jdyd', value: 'NEW_PRODUCT' },
  { title: 'halh alttb', value: 'ORDER_STATUS' },
  { title: 'tkhsym', value: 'PROMOTION' },
  { title: 'mts\'h', value: 'CUSTOM' }
];

const categoryOptions = [
  { title: 'fny', value: 1 },
  { title: 'tsmyh', value: 2 },
  { title: 'dkwr', value: 3 },
  { title: 'akss', value: 4 }
];

const orderStatusOptions = [
  { title: 'jary altthbyth', value: 'pending' },
  { title: 'moqwd', value: 'confirmed' },
  { title: 'fy altslym', value: 'processing' },
  { title: 'mtil', value: 'shipped' },
  { title: 'tslm', value: 'delivered' },
  { title: 'mlghy', value: 'cancelled' }
];

// GraphQL queries and mutations
const GET_ACTIVE_ALERTS = gql`
  query GetActiveAlerts {
    activeAlerts {
      id
      name
      type
      message
      is_active
      conditions
      created_at
      last_triggered
      trigger_count
    }
  }
`;

const CREATE_CUSTOM_ALERT = gql`
  mutation CreateCustomAlert($input: SmartAlertInput!) {
    createCustomAlert(input: $input) {
      success
      message
      alert {
        id
        name
        type
        message
        is_active
        conditions
        created_at
        last_triggered
        trigger_count
      }
    }
  }
`;

const TOGGLE_ALERT_STATUS = gql`
  mutation ToggleAlertStatus($alertId: ID!) {
    toggleAlertStatus(alertId: $alertId) {
      success
      message
      alert {
        id
        name
        type
        message
        is_active
        conditions
        created_at
        last_triggered
        trigger_count
      }
    }
  }
`;

const UPDATE_SMART_ALERT = gql`
  mutation UpdateSmartAlert($alertId: ID!, $input: SmartAlertUpdateInput!) {
    updateSmartAlert(alertId: $alertId, input: $input) {
      success
      message
      alert {
        id
        name
        type
        message
        is_active
        conditions
        created_at
        last_triggered
        trigger_count
      }
    }
  }
`;

const DELETE_SMART_ALERT = gql`
  mutation DeleteSmartAlert($alertId: ID!) {
    deleteSmartAlert(alertId: $alertId) {
      success
      message
    }
  }
`;

// Methods
const loadAlerts = async () => {
  loading.value = true;
  try {
    const { data } = await client.query({
      query: GET_ACTIVE_ALERTS,
      fetchPolicy: 'network-only'
    });
    alerts.value = data.activeAlerts || [];
  } catch (error) {
    console.error('Error loading alerts:', error);
  } finally {
    loading.value = false;
  }
};

const saveAlert = async () => {
  if (!formValid.value) return;
  
  saving.value = true;
  try {
    const input = {
      name: alertForm.name,
      type: alertForm.type,
      message: alertForm.message,
      conditions: alertForm.conditions,
      is_active: alertForm.is_active
    };

    if (editingAlert.value) {
      const { data } = await client.mutate({
        mutation: UPDATE_SMART_ALERT,
        variables: {
          alertId: editingAlert.value.id,
          input
        }
      });
      
      if (data.updateSmartAlert.success) {
        await loadAlerts();
        closeDialog();
      }
    } else {
      const { data } = await client.mutate({
        mutation: CREATE_CUSTOM_ALERT,
        variables: { input }
      });
      
      if (data.createCustomAlert.success) {
        await loadAlerts();
        closeDialog();
      }
    }
  } catch (error) {
    console.error('Error saving alert:', error);
  } finally {
    saving.value = false;
  }
};

const toggleAlert = async (alert) => {
  togglingAlerts.value.push(alert.id);
  try {
    const { data } = await client.mutate({
      mutation: TOGGLE_ALERT_STATUS,
      variables: { alertId: alert.id }
    });
    
    if (data.toggleAlertStatus.success) {
      // Update local alert
      const index = alerts.value.findIndex(a => a.id === alert.id);
      if (index !== -1) {
        alerts.value[index] = data.toggleAlertStatus.alert;
      }
    }
  } catch (error) {
    console.error('Error toggling alert:', error);
  } finally {
    togglingAlerts.value = togglingAlerts.value.filter(id => id !== alert.id);
  }
};

const editAlert = (alert) => {
  editingAlert.value = alert;
  Object.assign(alertForm, {
    name: alert.name,
    type: alert.type,
    message: alert.message,
    conditions: { ...alert.conditions },
    is_active: alert.is_active
  });
  
  if (alert.type === 'CUSTOM') {
    customConditionsJson.value = JSON.stringify(alert.conditions, null, 2);
  }
  
  showCreateDialog.value = true;
};

const confirmDelete = (alert) => {
  alertToDelete.value = alert;
  showDeleteDialog.value = true;
};

const deleteAlert = async () => {
  deleting.value = true;
  try {
    const { data } = await client.mutate({
      mutation: DELETE_SMART_ALERT,
      variables: { alertId: alertToDelete.value.id }
    });
    
    if (data.deleteSmartAlert.success) {
      alerts.value = alerts.value.filter(a => a.id !== alertToDelete.value.id);
      showDeleteDialog.value = false;
      alertToDelete.value = null;
    }
  } catch (error) {
    console.error('Error deleting alert:', error);
  } finally {
    deleting.value = false;
  }
};

const closeDialog = () => {
  showCreateDialog.value = false;
  editingAlert.value = null;
  Object.assign(alertForm, {
    name: '',
    type: '',
    message: '',
    conditions: {},
    is_active: true
  });
  customConditionsJson.value = '';
  customConditionsError.value = '';
};

const onTypeChange = () => {
  // Reset conditions when type changes
  alertForm.conditions = {};
  customConditionsJson.value = '';
  customConditionsError.value = '';
};

const parseCustomConditions = () => {
  if (!customConditionsJson.value.trim()) {
    alertForm.conditions = {};
    customConditionsError.value = '';
    return;
  }
  
  try {
    alertForm.conditions = JSON.parse(customConditionsJson.value);
    customConditionsError.value = '';
  } catch (error) {
    customConditionsError.value = 'JSON ghayr salh: ' + error.message;
  }
};

// Helper methods
const getAlertIcon = (type) => {
  const icons = {
    'PRICE_DROP': 'mdi-tag-off',
    'STOCK_ALERT': 'mdi-package-variant',
    'NEW_PRODUCT': 'mdi-new-box',
    'ORDER_STATUS': 'mdi-clipboard-list',
    'PROMOTION': 'mdi-tag',
    'CUSTOM': 'mdi-cog'
  };
  return icons[type] || 'mdi-bell';
};

const getAlertTypeDisplay = (type) => {
  const alertType = alertTypes.find(t => t.value === type);
  return alertType ? alertType.title : type;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

onMounted(() => {
  loadAlerts();
});
</script>

<style scoped>
.smart-alert-manager {
  width: 100%;
}

.alerts-list-card {
  border-radius: 12px;
}

.alerts-list {
  max-height: 400px;
  overflow-y: auto;
}

.alert-item {
  transition: all 0.3s ease;
}

.alert-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.alert-disabled {
  opacity: 0.6;
}

.alert-name {
  font-weight: 500;
}

.alert-meta {
  margin-top: 4px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-actions {
  display: flex;
  gap: 4px;
}

.conditions-section {
  background-color: rgba(var(--v-theme-surface-variant), 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
}

@media (max-width: 768px) {
  .alert-actions {
    flex-direction: column;
  }
}
</style>
