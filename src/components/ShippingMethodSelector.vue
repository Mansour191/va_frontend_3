<template>
  <v-card class="shipping-selector" :loading="isLoading">
    <v-card-title class="pa-4 border-b">
      <div class="d-flex align-center">
        <v-icon class="me-2" color="primary">mdi-truck</v-icon>
        <span class="text-h6">اختر شركة الشحن</span>
      </div>
    </v-card-title>

    <v-card-text class="pa-4">
      <!-- Shipping Method Selection -->
      <div v-if="availableMethods.length > 0">
        <h4 class="mb-4">شركات الشحن المتاحة</h4>
        
        <v-radio-group
          v-model="selectedMethodId"
          column
          class="mb-6"
          @update:model-value="updateShippingCost"
        >
          <div
            v-for="method in availableMethods"
            :key="method.id"
            class="mb-4 pa-4 border rounded-lg method-card"
            :class="{ 'selected': selectedMethodId === method.id }"
          >
            <div class="d-flex align-start">
              <!-- Method Logo/Icon -->
              <div class="me-4">
                <v-avatar size="48" class="method-logo">
                  <v-img
                    v-if="method.logo"
                    :src="method.logo"
                    :alt="method.name"
                  ></v-img>
                  <v-icon v-else size="24" :color="getProviderColor(method.provider)">
                    {{ getProviderIcon(method.provider) }}
                  </v-icon>
                </v-avatar>
              </div>

              <!-- Method Details -->
              <div class="flex-grow-1">
                <v-radio
                  :value="method.id"
                  :label="method.name"
                  class="method-radio"
                >
                  <template v-slot:label>
                    <div class="method-info">
                      <div class="d-flex align-center mb-2">
                        <h6 class="text-h6 font-weight-medium me-2">
                          {{ method.name }}
                        </h6>
                        <v-chip
                          size="small"
                          :color="getProviderColor(method.provider)"
                          class="me-2"
                        >
                          {{ getProviderLabel(method.provider) }}
                        </v-chip>
                        <v-chip
                          size="small"
                          :color="getServiceTypeColor(method.service_type)"
                        >
                          {{ getServiceTypeLabel(method.service_type) }}
                        </v-chip>
                      </div>
                      
                      <div class="text-caption text-medium-emphasis mb-2">
                        {{ method.description || 'خدمة توصيل موثوقة' }}
                      </div>
                      
                      <!-- Delivery Time -->
                      <div class="d-flex align-center mb-3">
                        <v-icon size="16" class="me-1" color="primary">mdi-clock</v-icon>
                        <span class="text-body-2">
                          وقت التوصيل المتوقع: {{ method.expected_delivery_time }} يوم
                          <span v-if="method.service_type === 'express'" class="text-success font-weight-medium">
                            (توصيل سريع)
                          </span>
                        </span>
                      </div>
                    </div>
                  </template>
                </v-radio>
              </div>
            </div>
          </div>
        </v-radio-group>

        <!-- Service Type Selection -->
        <div v-if="selectedMethod" class="mb-4">
          <h4 class="mb-3">نوع الخدمة</h4>
          <v-btn-toggle
            v-model="selectedServiceType"
            :disabled="!selectedMethodId"
            @update:model-value="updateShippingCost"
          >
            <v-btn
              v-if="hasServiceType('home')"
              value="home"
              prepend-icon="mdi-home"
            >
              توصيل للمنزل
            </v-btn>
            <v-btn
              v-if="hasServiceType('desk')"
              value="desk"
              prepend-icon="mdi-store"
            >
              استلام من المكتب
            </v-btn>
            <v-btn
              v-if="hasServiceType('express')"
              value="express"
              prepend-icon="mdi-rocket"
            >
              توصيل سريع
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Price Display -->
        <div v-if="shippingCost > 0" class="price-display pa-4 border rounded-lg bg-grey-lighten-4">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-h6">تكلفة الشحن:</span>
            <span class="text-h5 font-weight-bold primary--text">
              {{ formatCurrency(shippingCost) }}
            </span>
          </div>
          
          <div v-if="freeShippingMinimum" class="text-caption">
            <v-icon size="14" class="me-1" color="success">mdi-gift</v-icon>
            الشحن مجاني للطلبات فوق {{ formatCurrency(freeShippingMinimum) }}
            <span 
              v-if="cartSubtotal >= freeShippingMinimum" 
              class="text-success font-weight-medium"
            >
              ✓ طلبك مؤهل للشحن المجاني!
            </span>
          </div>
        </div>

        <!-- Additional Services -->
        <div v-if="selectedMethod" class="additional-services mt-4">
          <h4 class="mb-3">الخدمات الإضافية</h4>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-if="selectedMethodPrice?.cod_available"
              color="success"
              variant="outlined"
              prepend-icon="mdi-cash"
            >
              الدفع عند الاستلام
            </v-chip>
            <v-chip
              v-if="selectedMethodPrice?.insurance_available"
              color="info"
              variant="outlined"
              prepend-icon="mdi-shield-check"
            >
              تأمين الشحنة
            </v-chip>
            <v-chip
              v-if="selectedMethodPrice?.tracking_available"
              color="primary"
              variant="outlined"
              prepend-icon="mdi-map-marker-path"
            >
              تتبع الشحنة
            </v-chip>
          </div>
        </div>
      </div>

      <!-- No Methods Available -->
      <div v-else class="text-center pa-8">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-truck-off
        </v-icon>
        <div class="text-h6 mb-2">لا توجد شركات شحن متاحة</div>
        <div class="text-body-2 text-medium-emphasis">
          عذراً، لا تتوفر خدمات الشحن لهذه الولاية حالياً
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useShippingStore } from '@/stores/shipping'
import { useCartStore } from '@/stores/cart'

// Props
const props = defineProps({
  wilayaId: {
    type: Number,
    required: true
  }
})

// Emits
const emit = defineEmits(['shipping-selected', 'price-updated'])

// Stores
const shippingStore = useShippingStore()
const cartStore = useCartStore()

// Local state
const isLoading = ref(false)
const selectedMethodId = ref(null)
const selectedServiceType = ref('home')
const shippingCost = ref(0)
const availableMethods = ref([])

// Computed
const selectedMethod = computed(() => {
  return availableMethods.value.find(method => method.id === selectedMethodId.value)
})

const selectedMethodPrice = computed(() => {
  if (!selectedMethod.value || !props.wilayaId) return null
  
  return shippingStore.shippingPrices.value.find(price => 
    price.wilaya_id === props.wilayaId && 
    price.shipping_method_id === selectedMethodId.value
  )
})

const freeShippingMinimum = computed(() => {
  return selectedMethodPrice.value?.free_shipping_minimum
})

const cartSubtotal = computed(() => {
  return cartStore.totalBeforeShipping
})

// Methods
function getProviderLabel(provider) {
  const labels = {
    'yalidine': 'Yalidine',
    'zr_express': 'ZR Express',
    'fedex': 'FedEx',
    'dhl': 'DHL',
    'aramex': 'Aramex',
    'local_post': 'البريد المحلي',
    'custom': 'مخصص'
  }
  return labels[provider] || provider
}

function getProviderColor(provider) {
  const colors = {
    'yalidine': 'blue',
    'zr_express': 'green',
    'fedex': 'orange',
    'dhl': 'red',
    'aramex': 'purple',
    'local_post': 'grey',
    'custom': 'indigo'
  }
  return colors[provider] || 'grey'
}

function getProviderIcon(provider) {
  const icons = {
    'yalidine': 'mdi-truck',
    'zr_express': 'mdi-truck-fast',
    'fedex': 'mdi-package',
    'dhl': 'mdi-airplane',
    'aramex': 'mdi-cargo-ship',
    'local_post': 'mdi-mail',
    'custom': 'mdi-cog'
  }
  return icons[provider] || 'mdi-truck'
}

function getServiceTypeLabel(serviceType) {
  const labels = {
    'home': 'توصيل للمنزل',
    'desk': 'استلام من المكتب',
    'express': 'توصيل سريع',
    'economy': 'توصيل اقتصادي'
  }
  return labels[serviceType] || serviceType
}

function getServiceTypeColor(serviceType) {
  const colors = {
    'home': 'primary',
    'desk': 'secondary',
    'express': 'warning',
    'economy': 'info'
  }
  return colors[serviceType] || 'grey'
}

function hasServiceType(serviceType) {
  if (!selectedMethod.value) return false
  
  // Check if this method offers this service type
  return selectedMethod.value.service_type === serviceType || 
         availableMethods.value.some(method => 
           method.id === selectedMethodId.value && 
           method.service_type === serviceType
         )
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('ar-DZ', {
    style: 'currency',
    currency: 'DZD'
  }).format(amount)
}

async function updateShippingCost() {
  if (!selectedMethodId.value || !selectedServiceType.value) {
    shippingCost.value = 0
    return
  }

  // Calculate shipping cost
  const cost = shippingStore.calculateShippingCost(
    props.wilayaId,
    selectedServiceType.value,
    selectedMethodId.value,
    calculateOrderWeight(),
    calculateOrderVolume()
  )
  
  shippingCost.value = cost
  
  // Emit events
  emit('shipping-selected', {
    methodId: selectedMethodId.value,
    serviceType: selectedServiceType.value,
    method: selectedMethod.value,
    cost: cost
  })
  
  emit('price-updated', cost)
}

function calculateOrderWeight() {
  return cartStore.items.reduce((total, item) => {
    return total + (item.quantity * 0.5) // 0.5kg per item (example)
  }, 0)
}

function calculateOrderVolume() {
  return cartStore.items.reduce((total, item) => {
    if (item.width && item.height) {
      const volume = (item.width * item.height) / 10000 // cm² to m²
      return total + (volume * 0.01) // Assume 1cm thickness
    }
    return total
  }, 0)
}

async function loadAvailableMethods() {
  if (!props.wilayaId) return
  
  isLoading.value = true
  
  try {
    // Get available shipping methods for this wilaya
    const methods = shippingStore.getAvailableShippingMethods(props.wilayaId)
    availableMethods.value = methods
    
    // Auto-select first available method
    if (methods.length > 0 && !selectedMethodId.value) {
      selectedMethodId.value = methods[0].id
      selectedServiceType.value = methods[0].service_type
      await updateShippingCost()
    }
  } catch (error) {
    console.error('Error loading shipping methods:', error)
    availableMethods.value = []
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.wilayaId, () => {
  if (props.wilayaId) {
    loadAvailableMethods()
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  shippingStore.initialize()
})
</script>

<style scoped>
.shipping-selector {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.method-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.method-card:hover {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0.1);
}

.method-card.selected {
  background-color: rgba(var(--v-theme-primary), 0.05);
  border-color: var(--v-theme-primary);
}

.method-logo {
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.method-radio :deep(.v-selection-control) {
  align-items: flex-start;
  padding-top: 0;
}

.method-info {
  width: 100%;
}

.price-display {
  background: linear-gradient(135deg, rgba(var(--v-theme-grey-lighten-4), 0.1), rgba(var(--v-theme-grey-lighten-3), 0.1));
  border: 1px solid rgba(var(--v-border-color), 0.12);
}

.additional-services {
  border-top: 1px solid rgba(var(--v-border-color), 0.12);
  padding-top: 16px;
}

@media (max-width: 600px) {
  .method-card {
    padding: 12px;
  }
  
  .method-info h6 {
    font-size: 1rem;
  }
}
</style>
