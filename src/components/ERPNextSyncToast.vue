<template>
  <div>
    <!-- Toast Notification for Sync Failures -->
    <v-snackbar
      v-model="showToast"
      :color="toastColor"
      :timeout="toastTimeout"
      bottom
      right
      app
    >
      <div class="d-flex align-center">
        <v-icon :color="iconColor" class="me-3" size="24">
          {{ toastIcon }}
        </v-icon>
        
        <div class="flex-grow-1">
          <div class="font-weight-bold">{{ toastTitle }}</div>
          <div class="text-body-2">{{ toastMessage }}</div>
          <div v-if="syncDetails" class="text-caption mt-1">
            {{ syncDetails }}
          </div>
        </div>
        
        <v-btn
          icon
          @click="showToast = false"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
      
      <!-- Action Buttons -->
      <template v-slot:action="{ attrs }">
        <v-btn
          v-if="showViewLogsButton"
          text
          small
          v-bind="attrs"
          @click="viewSyncLogs"
        >
          {{ $t('viewLogs') || 'عرض السجلات' }}
        </v-btn>
        <v-btn
          v-if="showRetryButton"
          text
          small
          v-bind="attrs"
          @click="retrySync"
        >
          {{ $t('retry') || 'إعادة المحاولة' }}
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useSubscription } from '@apollo/client'
import { GET_SYNC_LOGS } from '@/shared/services/graphql/queries'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default {
  name: 'ERPNextSyncToast',
  setup() {
    const { t } = useI18n()
    const router = useRouter()
    
    // Toast state
    const showToast = ref(false)
    const toastType = ref('error')
    const toastTitle = ref('')
    const toastMessage = ref('')
    const syncDetails = ref('')
    const lastFailedSync = ref(null)
    
    // Subscription to sync logs for real-time monitoring
    const { data: syncLogsData, error } = useSubscription(GET_SYNC_LOGS, {
      variables: {
        limit: 10,
        status: 'failed'
      }
    })

    // Computed properties
    const toastColor = computed(() => {
      switch (toastType.value) {
        case 'error': return 'red darken-2'
        case 'warning': return 'orange darken-2'
        case 'success': return 'green darken-2'
        case 'info': return 'blue darken-2'
        default: return 'grey darken-2'
      }
    })

    const iconColor = computed(() => 'white')

    const toastIcon = computed(() => {
      switch (toastType.value) {
        case 'error': return 'mdi-alert-circle'
        case 'warning': return 'mdi-alert'
        case 'success': return 'mdi-check-circle'
        case 'info': return 'mdi-information'
        default: return 'mdi-information'
      }
    })

    const toastTimeout = computed(() => {
      switch (toastType.value) {
        case 'error': return 8000 // 8 seconds for errors
        case 'warning': return 6000 // 6 seconds for warnings
        default: return 4000 // 4 seconds for others
      }
    })

    const showViewLogsButton = computed(() => toastType.value === 'error')
    const showRetryButton = computed(() => toastType.value === 'error' && lastFailedSync.value)

    // Methods
    const showErrorToast = (title, message, details = null) => {
      toastType.value = 'error'
      toastTitle.value = title
      toastMessage.value = message
      syncDetails.value = details
      showToast.value = true
    }

    const showWarningToast = (title, message, details = null) => {
      toastType.value = 'warning'
      toastTitle.value = title
      toastMessage.value = message
      syncDetails.value = details
      showToast.value = true
    }

    const showSuccessToast = (title, message) => {
      toastType.value = 'success'
      toastTitle.value = title
      toastMessage.value = message
      syncDetails.value = null
      showToast.value = true
    }

    const showInfoToast = (title, message) => {
      toastType.value = 'info'
      toastTitle.value = title
      toastMessage.value = message
      syncDetails.value = null
      showToast.value = true
    }

    const viewSyncLogs = () => {
      router.push('/admin/integration/sync-logs')
      showToast.value = false
    }

    const retrySync = () => {
      // Emit retry event or call retry function
      if (lastFailedSync.value) {
        // This would typically trigger a retry of the failed sync
        console.log('Retrying sync:', lastFailedSync.value)
        showInfoToast(
          t('retryingSync') || 'إعادة محاولة المزامنة',
          t('retrySyncMessage') || 'جاري إعادة محاولة عملية المزامنة الفاشلة...'
        )
      }
      showToast.value = false
    }

    const monitorSyncFailures = () => {
      if (syncLogsData.value?.syncLogs) {
        const failedLogs = syncLogsData.value.syncLogs.filter(log => log.status === 'failed')
        
        if (failedLogs.length > 0) {
          const latestFailure = failedLogs[0] // Most recent failure
          
          // Only show toast if this is a new failure (avoid duplicate notifications)
          if (!lastFailedSync.value || latestFailure.id !== lastFailedSync.value.id) {
            lastFailedSync.value = latestFailure
            
            showErrorToast(
              t('syncFailed') || 'فشلت عملية المزامنة',
              t('syncFailedMessage') || `فشلت عملية المزامنة: ${latestFailure.action}`,
              t('syncErrorDetails') || `الخطأ: ${latestFailure.errorMessage || 'غير معروف'}`
            )
          }
        }
      }
    }

    // Check for failed syncs periodically
    let monitoringInterval = null
    
    const startMonitoring = () => {
      monitoringInterval = setInterval(() => {
        monitorSyncFailures()
      }, 10000) // Check every 10 seconds
    }

    const stopMonitoring = () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval)
        monitoringInterval = null
      }
    }

    // Listen for custom sync events (from other components)
    const handleSyncEvent = (event) => {
      const { type, data } = event.detail
      
      switch (type) {
        case 'sync_started':
          showInfoToast(
            t('syncStarted') || 'بدأت المزامنة',
            t('syncStartedMessage') || `بدأت عملية المزامنة: ${data.action}`
          )
          break
          
        case 'sync_completed':
          showSuccessToast(
            t('syncCompleted') || 'اكتملت المزامنة',
            t('syncCompletedMessage') || `اكتملت عملية المزامنة: ${data.action} (${data.recordsSynced || 0} سجل)`
          )
          break
          
        case 'sync_failed':
          lastFailedSync.value = data
          showErrorToast(
            t('syncFailed') || 'فشلت المزامنة',
            t('syncFailedMessage') || `فشلت عملية المزامنة: ${data.action}`,
            t('syncErrorDetails') || `الخطأ: ${data.errorMessage || 'غير معروف'}`
          )
          break
          
        case 'sync_warning':
          showWarningToast(
            t('syncWarning') || 'تحذير المزامنة',
            t('syncWarningMessage') || `تحذير في عملية المزامنة: ${data.action}`,
            data.warning
          )
          break
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      // Add event listener for custom sync events
      window.addEventListener('erpnext-sync-event', handleSyncEvent)
      
      // Start monitoring for failed syncs
      startMonitoring()
      
      // Initial check
      monitorSyncFailures()
    })

    onUnmounted(() => {
      // Remove event listener
      window.removeEventListener('erpnext-sync-event', handleSyncEvent)
      
      // Stop monitoring
      stopMonitoring()
    })

    // Expose methods for external use
    window.showERPNextSyncToast = {
      showError: showErrorToast,
      showWarning: showWarningToast,
      showSuccess: showSuccessToast,
      showInfo: showInfoToast
    }

    return {
      showToast,
      toastColor,
      iconColor,
      toastIcon,
      toastTimeout,
      toastTitle,
      toastMessage,
      syncDetails,
      showViewLogsButton,
      showRetryButton,
      viewSyncLogs,
      retrySync
    }
  }
}
</script>

<style scoped>
.v-snackbar__content {
  padding: 16px 24px;
}

.d-flex.align-center {
  align-items: center;
}

.flex-grow-1 {
  flex-grow: 1;
}

.text-body-2 {
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.text-caption {
  font-size: 0.75rem;
  line-height: 1rem;
  opacity: 0.8;
}

.me-3 {
  margin-right: 12px;
}

.mt-1 {
  margin-top: 4px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-snackbar__content {
    padding: 12px 16px;
  }
  
  .d-flex.align-center {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .me-3 {
    margin-right: 0;
    margin-bottom: 8px;
  }
}
</style>
