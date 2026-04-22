<template>
  <v-dialog
    v-model="isVisible"
    persistent
    width="600"
    :scrim="true"
    no-click-animation
    :retain-focus="true"
  >
    <v-card>
      <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
        <v-icon class="me-3" size="28">mdi-sync</v-icon>
        <span class="text-h5 font-weight-bold">{{ title || 'ERPNext Synchronization' }}</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Progress Section -->
        <div class="mb-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <span class="text-body-1 font-weight-medium">{{ currentOperation }}</span>
            <span class="text-body-2 text-medium-emphasis">{{ progressPercentage }}%</span>
          </div>
          
          <v-progress-linear
            :model-value="progressPercentage"
            :indeterminate="isIndeterminate"
            color="primary"
            height="8"
            rounded
            class="mb-2"
          ></v-progress-linear>
          
          <div class="d-flex justify-space-between text-caption text-medium-emphasis">
            <span>{{ progress.current || 0 }} {{ progressUnit }} of {{ progress.total || 0 }}</span>
            <span>{{ estimatedTimeRemaining }}</span>
          </div>
        </div>

        <!-- Status Messages -->
        <div class="mb-4">
          <v-alert
            v-if="statusMessage"
            :type="statusType"
            :variant="statusVariant"
            class="mb-3"
          >
            <div class="d-flex align-center">
              <v-icon class="me-2">{{ statusIcon }}</v-icon>
              <span>{{ statusMessage }}</span>
            </div>
          </v-alert>

          <!-- Error Details -->
          <div v-if="errors.length > 0" class="mb-3">
            <div class="text-body-2 font-weight-medium text-error mb-2">
              <v-icon class="me-1" size="18">mdi-alert-circle</v-icon>
              Errors ({{ errors.length }})
            </div>
            <v-expansion-panels variant="accordion" class="error-panels">
              <v-expansion-panel
                v-for="(error, index) in errors.slice(0, 3)"
                :key="index"
                class="mb-2"
              >
                <v-expansion-panel-title>
                  <div class="d-flex align-center">
                    <v-icon class="me-2" color="error" size="20">mdi-alert</v-icon>
                    <span class="text-body-2">{{ error.field || 'General Error' }}</span>
                  </div>
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div class="text-body-2">{{ error.message }}</div>
                  <div v-if="error.code" class="text-caption text-medium-emphasis mt-1">
                    Code: {{ error.code }}
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <div v-if="errors.length > 3" class="text-caption text-medium-emphasis mt-2">
              ... and {{ errors.length - 3 }} more errors
            </div>
          </div>
        </div>

        <!-- Sync Details -->
        <div class="sync-details">
          <div class="grid grid-cols-2 gap-4 text-body-2">
            <div>
              <span class="text-medium-emphasis">Sync Type:</span>
              <span class="font-weight-medium me-2">{{ syncType }}</span>
            </div>
            <div>
              <span class="text-medium-emphasis">Started:</span>
              <span class="font-weight-medium me-2">{{ formatTime(startTime) }}</span>
            </div>
            <div>
              <span class="text-medium-emphasis">Duration:</span>
              <span class="font-weight-medium me-2">{{ duration }}</span>
            </div>
            <div>
              <span class="text-medium-emphasis">Records:</span>
              <span class="font-weight-medium me-2">{{ progress.current || 0 }}</span>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 bg-grey-lighten-4">
        <v-spacer></v-spacer>
        
        <v-btn
          v-if="showCancelButton"
          variant="outlined"
          color="error"
          @click="cancelSync"
          :disabled="isCancelling"
          :loading="isCancelling"
        >
          <v-icon start>mdi-cancel</v-icon>
          {{ isCancelling ? 'Cancelling...' : 'Cancel' }}
        </v-btn>

        <v-btn
          v-if="showRetryButton"
          variant="outlined"
          color="warning"
          @click="retrySync"
          :disabled="isRetrying"
          :loading="isRetrying"
        >
          <v-icon start>mdi-restart</v-icon>
          {{ isRetrying ? 'Retrying...' : 'Retry' }}
        </v-btn>

        <v-btn
          v-if="showCloseButton"
          variant="elevated"
          color="primary"
          @click="closeOverlay"
        >
          <v-icon start>mdi-check</v-icon>
          {{ isCompleted ? 'Done' : 'Close' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { useToast } from 'vuetify'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  syncType: {
    type: String,
    default: 'GENERAL'
  },
  syncId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits([
  'update:modelValue',
  'cancel',
  'retry',
  'close'
])

// Toast
const toast = useToast()

// Reactive data
const isVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const progress = ref({
  current: 0,
  total: 0,
  stage: 'INITIALIZING'
})

const statusMessage = ref('')
const statusType = ref('info')
const statusVariant = ref('tonal')
const statusIcon = ref('mdi-information')
const errors = ref([])
const startTime = ref(new Date())
const isIndeterminate = ref(true)
const isCancelling = ref(false)
const isRetrying = ref(false)
const isCompleted = ref(false)

// Computed properties
const progressPercentage = computed(() => {
  if (progress.value.total === 0) return 0
  return Math.round((progress.value.current / progress.value.total) * 100)
})

const currentOperation = computed(() => {
  const stageMap = {
    'INITIALIZING': 'Initializing synchronization...',
    'CONNECTING': 'Connecting to ERPNext...',
    'VALIDATING': 'Validating data...',
    'SYNCING': 'Syncing data...',
    'PROCESSING': 'Processing records...',
    'FINALIZING': 'Finalizing synchronization...',
    'COMPLETED': 'Synchronization completed',
    'FAILED': 'Synchronization failed',
    'CANCELLED': 'Synchronization cancelled'
  }
  return stageMap[progress.value.stage] || 'Processing...'
})

const estimatedTimeRemaining = computed(() => {
  if (progress.value.current === 0 || progress.value.total === 0) {
    return 'Calculating...'
  }
  
  const elapsed = Date.now() - startTime.value.getTime()
  const rate = progress.value.current / (elapsed / 1000) // records per second
  const remaining = progress.value.total - progress.value.current
  const estimatedSeconds = remaining / rate
  
  if (estimatedSeconds < 60) {
    return `~${Math.round(estimatedSeconds)}s remaining`
  } else if (estimatedSeconds < 3600) {
    return `~${Math.round(estimatedSeconds / 60)}m remaining`
  } else {
    return `~${Math.round(estimatedSeconds / 3600)}h remaining`
  }
})

const duration = computed(() => {
  const elapsed = Date.now() - startTime.value.getTime()
  if (elapsed < 60000) {
    return `${Math.round(elapsed / 1000)}s`
  } else if (elapsed < 3600000) {
    return `${Math.round(elapsed / 60000)}m`
  } else {
    return `${Math.round(elapsed / 3600000)}h`
  }
})

const progressUnit = computed(() => {
  const unitMap = {
    'CUSTOMER': 'customers',
    'ORDER': 'orders',
    'PRODUCT': 'products',
    'INVENTORY': 'items',
    'GENERAL': 'records'
  }
  return unitMap[props.syncType] || 'records'
})

const showCancelButton = computed(() => {
  return !isCompleted.value && !isCancelling.value && progress.value.stage !== 'COMPLETED'
})

const showRetryButton = computed(() => {
  return (progress.value.stage === 'FAILED' || errors.value.length > 0) && !isRetrying.value
})

const showCloseButton = computed(() => {
  return isCompleted.value || progress.value.stage === 'CANCELLED'
})

// Methods
function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date)
}

function updateProgress(newProgress) {
  progress.value = { ...progress.value, ...newProgress }
  
  // Update indeterminate state
  if (newProgress.total > 0 && newProgress.current > 0) {
    isIndeterminate.value = false
  }
  
  // Update status based on stage
  updateStatus(newProgress.stage)
}

function updateStatus(stage) {
  switch (stage) {
    case 'INITIALIZING':
      statusMessage.value = 'Initializing synchronization...'
      statusType.value = 'info'
      statusVariant.value = 'tonal'
      statusIcon.value = 'mdi-information'
      break
    case 'CONNECTING':
      statusMessage.value = 'Connecting to ERPNext server...'
      statusType.value = 'info'
      statusVariant.value = 'tonal'
      statusIcon.value = 'mdi-connection'
      break
    case 'VALIDATING':
      statusMessage.value = 'Validating data before sync...'
      statusType.value = 'warning'
      statusVariant.value = 'tonal'
      statusIcon.value = 'mdi-check-decagram'
      break
    case 'SYNCING':
    case 'PROCESSING':
      statusMessage.value = 'Syncing data to ERPNext...'
      statusType.value = 'success'
      statusVariant.value = 'tonal'
      statusIcon.value = 'mdi-sync'
      break
    case 'FINALIZING':
      statusMessage.value = 'Finalizing synchronization...'
      statusType.value = 'info'
      statusVariant.value = 'tonal'
      statusIcon.value = 'mdi-check-all'
      break
    case 'COMPLETED':
      statusMessage.value = 'Synchronization completed successfully!'
      statusType.value = 'success'
      statusVariant.value = 'flat'
      statusIcon.value = 'mdi-check-circle'
      isCompleted.value = true
      isIndeterminate.value = false
      progress.value.current = progress.value.total
      break
    case 'FAILED':
      statusMessage.value = 'Synchronization failed. Please check errors below.'
      statusType.value = 'error'
      statusVariant.value = 'flat'
      statusIcon.value = 'mdi-alert-circle'
      isIndeterminate.value = false
      break
    case 'CANCELLED':
      statusMessage.value = 'Synchronization cancelled by user.'
      statusType.value = 'warning'
      statusVariant.value = 'flat'
      statusIcon.value = 'mdi-cancel'
      isIndeterminate.value = false
      break
  }
}

function addError(error) {
  errors.value.push({
    field: error.field || 'General',
    message: error.message || 'Unknown error occurred',
    code: error.code || 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  })
}

function clearErrors() {
  errors.value = []
}

async function cancelSync() {
  isCancelling.value = true
  
  try {
    emit('cancel', props.syncId)
    progress.value.stage = 'CANCELLED'
    updateStatus('CANCELLED')
    
    toast({
      title: 'Sync Cancelled',
      text: 'Synchronization was cancelled successfully',
      color: 'warning',
      timeout: 3000
    })
  } catch (error) {
    console.error('Error cancelling sync:', error)
    toast({
      title: 'Cancel Failed',
      text: 'Failed to cancel synchronization',
      color: 'error',
      timeout: 3000
    })
  } finally {
    isCancelling.value = false
  }
}

async function retrySync() {
  isRetrying.value = true
  clearErrors()
  
  try {
    emit('retry', props.syncId)
    
    // Reset progress for retry
    progress.value = {
      current: 0,
      total: progress.value.total,
      stage: 'INITIALIZING'
    }
    startTime.value = new Date()
    isCompleted.value = false
    isIndeterminate.value = true
    
    toast({
      title: 'Retrying Sync',
      text: 'Attempting to retry synchronization...',
      color: 'info',
      timeout: 3000
    })
  } catch (error) {
    console.error('Error retrying sync:', error)
    toast({
      title: 'Retry Failed',
      text: 'Failed to retry synchronization',
      color: 'error',
      timeout: 3000
    })
  } finally {
    isRetrying.value = false
  }
}

function closeOverlay() {
  isVisible.value = false
  emit('close')
}

function reset() {
  progress.value = {
    current: 0,
    total: 0,
    stage: 'INITIALIZING'
  }
  statusMessage.value = ''
  statusType.value = 'info'
  statusVariant.value = 'tonal'
  statusIcon.value = 'mdi-information'
  errors.value = []
  startTime.value = new Date()
  isIndeterminate.value = true
  isCancelling.value = false
  isRetrying.value = false
  isCompleted.value = false
}

// Expose methods for parent component
defineExpose({
  updateProgress,
  updateStatus,
  addError,
  clearErrors,
  reset
})

// Watch for visibility changes
watch(isVisible, (newValue) => {
  if (newValue) {
    reset()
  }
})
</script>

<style scoped>
.sync-details {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
  padding-top: 16px;
}

.grid {
  display: grid;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.gap-4 {
  gap: 1rem;
}

.error-panels :deep(.v-expansion-panel) {
  background-color: rgba(244, 67, 54, 0.05);
}

.error-panels :deep(.v-expansion-panel-title) {
  min-height: 48px;
}
</style>
