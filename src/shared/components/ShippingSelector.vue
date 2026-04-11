<template>
  <v-card class="shipping-selector" elevation="2">
    <v-card-title class="d-flex align-center pa-4">
      <v-icon color="primary" class="me-2">mdi-truck</v-icon>
      {{ $t('selectShipping') || 'Select Shipping Method' }}
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <v-progress-circular indeterminate color="primary" size="32" />
        <p class="text-body-2 mt-2">{{ $t('loadingShipping') || 'Loading shipping methods...' }}</p>
      </div>

      <!-- Shipping Methods Selection -->
      <div v-else>
        <!-- Organization Selection (if multiple organizations) -->
        <v-select
          v-if="organizations.length > 1"
          v-model="selectedOrganization"
          :items="organizations"
          :label="$t('selectOrganization') || 'Select Organization'"
          item-title="name"
          item-value="id"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
          @update:model-value="onOrganizationChange"
        />

        <!-- Wilaya Selection -->
        <v-select
          v-model="selectedWilaya"
          :items="activeZones"
          :label="$t('selectWilaya') || 'Select Wilaya'"
          item-title="nameAr"
          item-value="wilayaId"
          variant="outlined"
          density="compact"
          hide-details
          class="mb-4"
          @update:model-value="onWilayaChange"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props">
              <v-list-item-title>{{ item.raw.nameAr }}</v-list-item-title>
              <v-list-item-subtitle>
                {{ $t('homeDelivery') }}: {{ formatPrice(item.raw.homeDeliveryPrice) }} | 
                {{ $t('stopDesk') }}: {{ formatPrice(item.raw.stopDeskPrice) }}
              </v-list-item-subtitle>
            </v-list-item>
          </template>
        </v-select>

        <!-- Shipping Methods Selection -->
        <v-radio-group
          v-if="availableShippingMethods.length > 0"
          v-model="selectedShippingMethod"
          class="shipping-methods-group"
          @update:model-value="onShippingMethodChange"
        >
          <v-card
            v-for="method in availableShippingMethods"
            :key="method.id"
            :class="{ 'shipping-method-card--selected': selectedShippingMethod === method.id }"
            class="shipping-method-card cursor-pointer mb-2"
            elevation="1"
            @click="selectedShippingMethod = method.id"
          >
            <v-card-text class="pa-3">
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center">
                  <v-radio :value="method.id" class="me-3" />
                  <div>
                    <h4 class="text-subtitle-1 font-weight-medium mb-1">
                      {{ method.name }}
                    </h4>
                    <p class="text-caption text-medium-emphasis mb-0">
                      {{ method.provider_name || $t('standardShipping') }}
                    </p>
                    <p class="text-caption text-medium-emphasis mb-0" v-if="method.description">
                      {{ method.description }}
                    </p>
                  </div>
                </div>
                <div class="text-end">
                  <div class="text-primary font-weight-bold">
                    {{ formatPrice(method.base_cost) }}
                  </div>
                  <div class="text-caption text-medium-emphasis" v-if="method.estimated_days">
                    {{ method.estimated_days }}
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-radio-group>

        <!-- No Shipping Methods Available -->
        <v-alert
          v-else-if="selectedWilaya && availableShippingMethods.length === 0"
          type="info"
          variant="tonal"
          class="mt-4"
        >
          <v-alert-title>{{ $t('noShippingMethods') || 'No Shipping Methods Available' }}</v-alert-title>
          {{ $t('noShippingMethodsForWilaya') || 'No shipping methods are available for the selected wilaya.' }}
        </v-alert>

        <!-- Shipping Summary -->
        <v-expand-transition>
          <div v-if="selectedShippingMethodInfo" class="shipping-summary mt-4">
            <v-divider class="mb-3" />
            <h4 class="text-subtitle-1 font-weight-bold mb-3">
              {{ $t('shippingSummary') || 'Shipping Summary' }}
            </h4>
            
            <v-row>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('wilaya') }}:</span>
                  <span class="text-body-2 ms-2">{{ selectedZone?.nameAr }}</span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('shippingMethod') }}:</span>
                  <span class="text-body-2 ms-2">{{ selectedShippingMethodInfo.name }}</span>
                </div>
              </v-col>
              <v-col cols="12" md="6">
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('shippingCost') }}:</span>
                  <span class="text-body-2 ms-2 text-primary font-weight-bold">
                    {{ formatPrice(selectedShippingMethodInfo.base_cost) }}
                  </span>
                </div>
                <div class="mb-2">
                  <span class="text-caption text-medium-emphasis">{{ $t('estimatedDelivery') }}:</span>
                  <span class="text-body-2 ms-2">{{ selectedShippingMethodInfo.estimated_days || $t('standardDelivery') }}</span>
                </div>
              </v-col>
            </v-row>
          </div>
        </v-expand-transition>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useShipping } from '@/composables/useShipping';
import { useGraphQL } from '@/shared/composables/useGraphQL';

// Props
const props = defineProps({
  orderTotal: {
    type: Number,
    default: 0
  }
});

// Emits
const emit = defineEmits(['shipping-selected', 'price-change']);

// Composables
const { t } = useI18n();
const {
  activeZones,
  selectedZone,
  loading,
  selectShippingZone,
  calculateTotalWithShipping,
  formatShippingPrice
} = useShipping();

const { executeQuery } = useGraphQL();

// State
const selectedWilaya = ref(null);
const selectedOrganization = ref(null);
const selectedShippingMethod = ref(null);
const organizations = ref([]);
const shippingMethods = ref([]);
const loadingMethods = ref(false);

// Computed
const availableShippingMethods = computed(() => {
  if (!selectedOrganization.value) return [];
  return shippingMethods.value.filter(method => 
    method.organization.id === selectedOrganization.value && method.is_active
  );
});

const selectedShippingMethodInfo = computed(() => {
  if (!selectedShippingMethod.value) return null;
  return availableShippingMethods.value.find(method => method.id === selectedShippingMethod.value);
});

// Methods
const formatPrice = (price) => {
  return formatShippingPrice(price);
};

const fetchOrganizations = async () => {
  try {
    const query = `
      query GetOrganizations {
        organizations {
          id
          name_ar
          name_en
          is_active
        }
      }
    `;
    
    const response = await executeQuery(query);
    if (response?.data?.organizations) {
      organizations.value = response.data.organizations.filter(org => org.is_active);
      
      // Auto-select first organization if only one exists
      if (organizations.value.length === 1) {
        selectedOrganization.value = organizations.value[0].id;
        await fetchShippingMethods();
      }
    }
  } catch (error) {
    console.error('Error fetching organizations:', error);
  }
};

const fetchShippingMethods = async () => {
  if (!selectedOrganization.value) return;
  
  loadingMethods.value = true;
  try {
    const query = `
      query GetShippingMethodsByOrganization($organizationId: ID!) {
        shippingMethodsByOrganization(organizationId: $organizationId) {
          id
          name
          provider_name
          base_cost
          estimated_days
          is_active
          description
          organization {
            id
            name_ar
            name_en
          }
          created_at
          updated_at
        }
      }
    `;
    
    const response = await executeQuery(query, { organizationId: selectedOrganization.value });
    if (response?.data?.shippingMethodsByOrganization) {
      shippingMethods.value = response.data.shippingMethodsByOrganization;
      console.log('Shipping methods loaded:', shippingMethods.value.length);
    }
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
  } finally {
    loadingMethods.value = false;
  }
};

const onOrganizationChange = async (organizationId) => {
  selectedOrganization.value = organizationId;
  selectedShippingMethod.value = null;
  await fetchShippingMethods();
  emitShippingInfo();
};

const onWilayaChange = async (wilayaId) => {
  const zone = activeZones.value.find(z => z.wilayaId === wilayaId);
  if (zone) {
    await selectShippingZone(zone);
    emitShippingInfo();
  }
};

const onShippingMethodChange = (methodId) => {
  selectedShippingMethod.value = methodId;
  emitShippingInfo();
};

const emitShippingInfo = () => {
  if (selectedZone.value && selectedShippingMethodInfo.value) {
    const shippingInfo = {
      wilayaId: selectedZone.value.wilayaId,
      shippingMethodId: selectedShippingMethodInfo.value.id,
      shippingCost: selectedShippingMethodInfo.value.base_cost,
      estimatedDays: selectedShippingMethodInfo.value.estimated_days,
      shippingMethodName: selectedShippingMethodInfo.value.name,
      deliveryType: 'standard', // Can be extended based on method type
      total: props.orderTotal + selectedShippingMethodInfo.value.base_cost,
      subtotal: props.orderTotal,
      zone: selectedZone.value,
      shippingMethod: selectedShippingMethodInfo.value
    };
    
    emit('shipping-selected', shippingInfo);
    emit('price-change', shippingInfo.total);
  }
};

// Watchers
watch(() => props.orderTotal, () => {
  if (selectedZone.value && selectedShippingMethodInfo.value) {
    emitShippingInfo();
  }
});

// Lifecycle
onMounted(async () => {
  await fetchOrganizations();
});
</script>

<style scoped>
.shipping-selector {
  border-radius: 12px;
}

.shipping-method-card {
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.shipping-method-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

.shipping-method-card--selected {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.05);
}

.shipping-methods-group :deep(.v-radio-group) {
  .v-radio {
    display: none;
  }
}
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  padding: 16px;
}
</style>
