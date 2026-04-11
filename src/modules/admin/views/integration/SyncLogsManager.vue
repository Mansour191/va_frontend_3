<template>
  <div class="sync-logs-manager">
    <!-- Page Header -->
    <div class="d-flex align-center justify-space-between mb-6">
      <h1 class="text-h4 font-weight-bold">
        {{ $t('syncLogs') || 'سجلات المزامنة مع ERPNext' }}
      </h1>
      
      <!-- Status Filter -->
      <div class="d-flex align-center gap-3">
        <v-select
          v-model="selectedStatus"
          :items="statusOptions"
          :label="$t('filterByStatus') || 'فلترة حسب الحالة'"
          clearable
          outlined
          dense
          hide-details
          style="max-width: 200px"
          @change="fetchSyncLogs"
        />
        
        <v-btn
          color="primary"
          :loading="loading"
          @click="fetchSyncLogs"
        >
          <v-icon left>mdi-refresh</v-icon>
          {{ $t('refresh') || 'تحديث' }}
        </v-btn>
      </div>
    </div>

    <!-- Statistics Cards -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card">
          <v-card-text class="d-flex align-center">
            <v-icon color="blue" size="40" class="me-3">mdi-sync</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ statistics.total_syncs || 0 }}</div>
              <div class="text-caption">{{ $t('totalSyncs') || 'إجمالي العمليات' }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card">
          <v-card-text class="d-flex align-center">
            <v-icon color="green" size="40" class="me-3">mdi-check-circle</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ statistics.completed_syncs || 0 }}</div>
              <div class="text-caption">{{ $t('completed') || 'مكتملة' }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card">
          <v-card-text class="d-flex align-center">
            <v-icon color="red" size="40" class="me-3">mdi-alert-circle</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ statistics.failed_syncs || 0 }}</div>
              <div class="text-caption">{{ $t('failed') || 'فشلت' }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6" md="3">
        <v-card class="stats-card">
          <v-card-text class="d-flex align-center">
            <v-icon color="orange" size="40" class="me-3">mdi-loading</v-icon>
            <div>
              <div class="text-h6 font-weight-bold">{{ statistics.running_syncs || 0 }}</div>
              <div class="text-caption">{{ $t('running') || 'قيد التشغيل' }}</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Sync Logs Table -->
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon left>mdi-history</v-icon>
        {{ $t('recentSyncLogs') || 'سجلات المزامنة الأخيرة' }}
      </v-card-title>
      
      <v-card-text>
        <v-data-table
          :headers="tableHeaders"
          :items="syncLogs"
          :loading="loading"
          :items-per-page="50"
          :footer-props="{
            'items-per-page-options': [10, 25, 50, 100]
          }"
          class="elevation-1"
        >
          <!-- Status Column with Color Coding -->
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              :text-color="getStatusTextColor(item.status)"
              small
              label
            >
              <v-icon left small>{{ getStatusIcon(item.status) }}</v-icon>
              {{ getStatusText(item.status) }}
            </v-chip>
          </template>

          <!-- Timestamp Column -->
          <template v-slot:item.timestamp="{ item }">
            <div>
              <div>{{ formatDate(item.timestamp) }}</div>
              <div class="text-caption">{{ formatTime(item.timestamp) }}</div>
            </div>
          </template>

          <!-- Records Synced Column -->
          <template v-slot:item.recordsSynced="{ item }">
            <v-chip
              v-if="item.recordsSynced > 0"
              color="primary"
              text-color="white"
              small
            >
              {{ item.recordsSynced }}
            </v-chip>
            <span v-else class="text-muted">-</span>
          </template>

          <!-- Action Column -->
          <template v-slot:item.action="{ item }">
            <div class="text-truncate" style="max-width: 200px;">
              {{ item.action }}
            </div>
          </template>

          <!-- Error Message Column -->
          <template v-slot:item.errorMessage="{ item }">
            <div v-if="item.errorMessage">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="red"
                    text-color="white"
                    small
                    v-bind="attrs"
                    v-on="on"
                  >
                    <v-icon left small>mdi-alert</v-icon>
                    {{ $t('error') || 'خطأ' }}
                  </v-chip>
                </template>
                <div style="max-width: 300px; word-break: break-word;">
                  {{ item.errorMessage }}
                </div>
              </v-tooltip>
            </div>
            <span v-else class="text-muted">-</span>
          </template>

          <!-- Actions Column -->
          <template v-slot:item.actions="{ item }">
            <v-btn
              icon
              small
              @click="viewLogDetails(item)"
            >
              <v-icon>mdi-eye</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Log Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <v-card>
        <v-card-title class="d-flex align-center">
          <v-icon left>mdi-information</v-icon>
          {{ $t('logDetails') || 'تفاصيل السجل' }}
        </v-card-title>
        
        <v-card-text v-if="selectedLog">
          <v-row>
            <v-col cols="12" sm="6">
              <strong>{{ $t('action') || 'الإجراء' }}:</strong>
              <div>{{ selectedLog.action }}</div>
            </v-col>
            
            <v-col cols="12" sm="6">
              <strong>{{ $t('status') || 'الحالة' }}:</strong>
              <div>
                <v-chip
                  :color="getStatusColor(selectedLog.status)"
                  :text-color="getStatusTextColor(selectedLog.status)"
                  small
                  label
                >
                  {{ getStatusText(selectedLog.status) }}
                </v-chip>
              </div>
            </v-col>
            
            <v-col cols="12" sm="6">
              <strong>{{ $t('timestamp') || 'الوقت' }}:</strong>
              <div>{{ formatDateTime(selectedLog.timestamp) }}</div>
            </v-col>
            
            <v-col cols="12" sm="6">
              <strong>{{ $t('recordsSynced') || 'السجلات المزامنة' }}:</strong>
              <div>{{ selectedLog.recordsSynced || 0 }}</div>
            </v-col>
            
            <v-col cols="12" v-if="selectedLog.message">
              <strong>{{ $t('message') || 'الرسالة' }}:</strong>
              <div>{{ selectedLog.message }}</div>
            </v-col>
            
            <v-col cols="12" v-if="selectedLog.errorMessage">
              <strong>{{ $t('errorMessage') || 'رسالة الخطأ' }}:</strong>
              <v-alert type="error" class="mt-2">
                {{ selectedLog.errorMessage }}
              </v-alert>
            </v-col>
          </v-row>
        </v-card-text>
        
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="detailsDialog = false">
            {{ $t('close') || 'إغلاق' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useQuery } from '@apollo/client'
import { GET_SYNC_LOGS } from '@/shared/services/graphql/queries'
import { useI18n } from 'vue-i18n'

export default {
  name: 'SyncLogsManager',
  setup() {
    const { t } = useI18n()
    
    // Reactive data
    const selectedStatus = ref(null)
    const detailsDialog = ref(false)
    const selectedLog = ref(null)
    
    // GraphQL query
    const { 
      data: syncLogsData, 
      loading, 
      error, 
      refetch 
    } = useQuery(GET_SYNC_LOGS, {
      limit: 50,
      status: selectedStatus.value
    }, {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all'
    })

    // Computed properties
    const syncLogs = computed(() => syncLogsData.value?.syncLogs || [])
    
    const statistics = computed(() => {
      const logs = syncLogs.value
      return {
        total_syncs: logs.length,
        completed_syncs: logs.filter(log => log.status === 'completed').length,
        failed_syncs: logs.filter(log => log.status === 'failed').length,
        running_syncs: logs.filter(log => log.status === 'running').length
      }
    })

    const statusOptions = [
      { text: t('all') || 'الكل', value: null },
      { text: t('running') || 'قيد التشغيل', value: 'running' },
      { text: t('completed') || 'مكتملة', value: 'completed' },
      { text: t('failed') || 'فشلت', value: 'failed' }
    ]

    const tableHeaders = [
      { text: t('timestamp') || 'الوقت', value: 'timestamp', width: '150px' },
      { text: t('action') || 'الإجراء', value: 'action' },
      { text: t('status') || 'الحالة', value: 'status', width: '120px' },
      { text: t('recordsSynced') || 'السجلات المزامنة', value: 'recordsSynced', width: '120px' },
      { text: t('error') || 'خطأ', value: 'errorMessage', width: '100px' },
      { text: t('actions') || 'الإجراءات', value: 'actions', width: '80px', sortable: false }
    ]

    // Methods
    const fetchSyncLogs = () => {
      refetch({
        limit: 50,
        status: selectedStatus.value
      })
    }

    const getStatusColor = (status) => {
      switch (status) {
        case 'completed': return 'green'
        case 'failed': return 'red'
        case 'running': return 'orange'
        default: return 'grey'
      }
    }

    const getStatusTextColor = (status) => {
      return 'white'
    }

    const getStatusIcon = (status) => {
      switch (status) {
        case 'completed': return 'mdi-check-circle'
        case 'failed': return 'mdi-alert-circle'
        case 'running': return 'mdi-loading'
        default: return 'mdi-help-circle'
      }
    }

    const getStatusText = (status) => {
      switch (status) {
        case 'completed': return t('completed') || 'مكتملة'
        case 'failed': return t('failed') || 'فشلت'
        case 'running': return t('running') || 'قيد التشغيل'
        default: return status
      }
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleDateString('ar-DZ')
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleTimeString('ar-DZ')
    }

    const formatDateTime = (timestamp) => {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString('ar-DZ')
    }

    const viewLogDetails = (log) => {
      selectedLog.value = log
      detailsDialog.value = true
    }

    // Auto-refresh for running syncs
    let refreshInterval = null
    
    const startAutoRefresh = () => {
      refreshInterval = setInterval(() => {
        const hasRunningSyncs = syncLogs.value.some(log => log.status === 'running')
        if (hasRunningSyncs) {
          fetchSyncLogs()
        }
      }, 5000) // Refresh every 5 seconds
    }

    const stopAutoRefresh = () => {
      if (refreshInterval) {
        clearInterval(refreshInterval)
        refreshInterval = null
      }
    }

    // Lifecycle hooks
    onMounted(() => {
      fetchSyncLogs()
      startAutoRefresh()
    })

    // Cleanup on unmount
    onUnmounted(() => {
      stopAutoRefresh()
    })

    return {
      selectedStatus,
      detailsDialog,
      selectedLog,
      loading,
      error,
      syncLogs,
      statistics,
      statusOptions,
      tableHeaders,
      fetchSyncLogs,
      getStatusColor,
      getStatusTextColor,
      getStatusIcon,
      getStatusText,
      formatDate,
      formatTime,
      formatDateTime,
      viewLogDetails
    }
  }
}
</script>

<style scoped>
.sync-logs-manager {
  padding: 24px;
}

.stats-card {
  height: 100%;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-muted {
  color: #9e9e9e;
}

/* Status-based row colors */
.v-data-table tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .sync-logs-manager {
    padding: 12px;
  }
  
  .d-flex.align-center.justify-space-between {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
