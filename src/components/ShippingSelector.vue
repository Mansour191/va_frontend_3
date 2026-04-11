<template>
  <v-card variant="outlined" class="shipping-selector">
    <v-card-title class="pa-4 bg-grey-lighten-5">
      <v-icon class="me-2" color="primary">mdi-truck</v-icon>
      choix de la méthode de livraison
    </v-card-title>
    
    <v-card-text class="pa-4">
      <v-row v-if="!selectedWilaya">
        <v-col cols="12">
          <v-alert type="info" variant="tonal">
            <v-icon start>mdi-information</v-icon>
            Veuillez sélectionner votre wilaya pour voir les options de livraison
          </v-alert>
        </v-col>
      </v-row>

      <v-row v-else-if="!selectedWilaya.isActive">
        <v-col cols="12">
          <v-alert type="error" variant="tonal">
            <v-icon start>mdi-alert</v-icon>
            La livraison vers cette wilaya n'est pas disponible actuellement
          </v-alert>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12">
          <v-radio-group
            v-model="selectedMethod"
            column
            @update:model-value="onMethodSelected"
          >
            <v-card
              v-for="method in availableMethods"
              :key="method.id"
              :class="['mb-3', selectedMethod === method.id ? 'border-primary border-2' : '']"
              variant="outlined"
            >
              <v-card-text class="pa-4">
                <v-radio
                  :label="method.name"
                  :value="method.id"
                  class="mb-2"
                ></v-radio>
                
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="text-caption text-medium-emphasis">
                      Temps de livraison estimé: {{ method.estimatedTime }} jour(s)
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Type: {{ getServiceTypeLabel(method.serviceType) }}
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="text-h6 font-weight-bold primary--text">
                      {{ formatCurrency(method.price) }}
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-radio-group>
        </v-col>
      </v-row>

      <!-- Selected Method Summary -->
      <v-row v-if="selectedMethod && selectedMethodData" class="mt-4">
        <v-col cols="12">
          <v-card color="primary" variant="tonal">
            <v-card-text class="pa-4">
              <div class="d-flex align-center">
                <v-icon class="me-3">mdi-check-circle</v-icon>
                <div>
                  <h6 class="text-h6 font-weight-medium">
                    {{ selectedMethodData.name }}
                  </h6>
                  <div class="text-caption">
                    Coût: {{ formatCurrency(selectedMethodData.price) }} - 
                    Livraison: {{ selectedMethodData.estimatedTime }} jour(s)
                  </div>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useShippingStore } from '@/stores/shipping'

// Props
const props = defineProps({
  wilayaId: {
    type: String,
    required: true
  }
})

// Emits
const emit = defineEmits(['shipping-selected', 'price-updated'])

// Store
const shippingStore = useShippingStore()

// Local state
const selectedMethod = ref(null)

// Computed
const selectedWilaya = computed(() => {
  return shippingStore.getWilayaByCode(props.wilayaId)
})

const availableMethods = computed(() => {
  if (!selectedWilaya.value || !selectedWilaya.value.isActive) return []
  return shippingStore.getAvailableShippingMethods(props.wilayaId)
})

const selectedMethodData = computed(() => {
  return availableMethods.value.find(method => method.id === selectedMethod.value)
})

// Methods
function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount)
}

function getServiceTypeLabel(serviceType) {
  const labels = {
    'home': 'Livraison à domicile',
    'stop_desk': 'Point de retrait',
    'express': 'Livraison express'
  }
  return labels[serviceType] || serviceType
}

function onMethodSelected(methodId) {
  const method = availableMethods.value.find(m => m.id === methodId)
  if (method) {
    emit('shipping-selected', {
      method: method,
      serviceType: method.serviceType,
      cost: method.price,
      estimatedTime: method.estimatedTime
    })
    emit('price-updated', method.price)
  }
}

// Watch for wilaya changes
watch(() => props.wilayaId, (newWilayaId) => {
  selectedMethod.value = null
  if (newWilayaId) {
    // Auto-select first available method
    const methods = availableMethods.value
    if (methods.length > 0) {
      selectedMethod.value = methods[0].id
      onMethodSelected(methods[0].id)
    }
  }
}, { immediate: true })
</script>

<style scoped>
.shipping-selector {
  border-radius: 12px;
}

.border-primary {
  border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
