<template>
  <v-container class="pa-4">
    <v-card variant="elevated" class="mb-6">
      <v-card-title class="d-flex align-center pa-4 bg-primary text-white">
        <v-icon class="me-3" size="32">mdi-test-tube</v-icon>
        <span class="text-h5 font-weight-bold">Sync Failure Simulation Dashboard</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <!-- Network Status -->
        <v-alert
          :type="networkStatus.isOffline ? 'error' : 'success'"
          :variant="networkStatus.isOffline ? 'flat' : 'tonal'"
          class="mb-6"
        >
          <div class="d-flex align-center">
            <v-icon class="me-2" size="24">
              {{ networkStatus.isOffline ? 'mdi-network-off' : 'mdi-network-outline' }}
            </v-icon>
            <span class="font-weight-medium">
              Network Status: {{ networkStatus.isOffline ? 'OFFLINE (Simulated)' : 'ONLINE' }}
            </span>
          </div>
        </v-alert>

        <!-- Test Controls -->
        <v-row class="mb-6">
          <v-col cols="12" md="4">
            <v-btn
              @click="simulateDisconnection"
              :disabled="networkStatus.isOffline"
              color="error"
              variant="elevated"
              block
              prepend-icon="mdi-network-off"
            >
              Simulate Disconnection
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="restoreConnection"
              :disabled="!networkStatus.isOffline"
              color="success"
              variant="elevated"
              block
              prepend-icon="mdi-network-outline"
            >
              Restore Connection
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="runCompleteTest"
              :loading="isRunningTests"
              color="primary"
              variant="elevated"
              block
              prepend-icon="mdi-play-circle"
            >
              {{ isRunningTests ? 'Running Tests...' : 'Run Complete Test Suite' }}
            </v-btn>
          </v-col>
        </v-row>

        <!-- Test Results -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="pa-4 bg-grey-lighten-4">
            <span class="text-h6 font-weight-medium">Test Results</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="testResults.length === 0" class="text-center py-8 text-medium-emphasis">
              <v-icon size="48" class="mb-3">mdi-information-outline</v-icon>
              <div>No tests run yet. Click "Run Complete Test Suite" to start.</div>
            </div>
            
            <div v-else>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="(result, index) in testResults"
                  :key="index"
                  class="mb-2"
                >
                  <v-expansion-panel-title>
                    <div class="d-flex align-center justify-space-between w-100">
                      <div class="d-flex align-center">
                        <v-icon
                          :color="result.success ? 'success' : 'error'"
                          class="me-3"
                        >
                          {{ result.success ? 'mdi-check-circle' : 'mdi-alert-circle' }}
                        </v-icon>
                        <span class="font-weight-medium">{{ result.name }}</span>
                      </div>
                      <v-chip
                        :color="result.success ? 'success' : 'error'"
                        size="small"
                        variant="flat"
                      >
                        {{ result.success ? 'SUCCESS' : 'FAILED' }}
                      </v-chip>
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <div class="test-details">
                      <div class="mb-3">
                        <span class="text-caption text-medium-emphasis">Timestamp:</span>
                        <span class="text-body-2 ms-2">{{ formatTime(result.timestamp) }}</span>
                      </div>
                      
                      <div v-if="result.success" class="success-details">
                        <div v-if="result.storedInIndexedDB" class="mb-2">
                          <span class="text-caption text-medium-emphasis">Stored in IndexedDB:</span>
                          <span class="text-body-2 ms-2 text-success">Yes</span>
                        </div>
                        <div v-if="result.erpnextId" class="mb-2">
                          <span class="text-caption text-medium-emphasis">ERPNext ID:</span>
                          <span class="text-body-2 ms-2">{{ result.erpnextId }}</span>
                        </div>
                        <div v-if="result.retryCount" class="mb-2">
                          <span class="text-caption text-medium-emphasis">Retry Count:</span>
                          <span class="text-body-2 ms-2">{{ result.retryCount }}</span>
                        </div>
                      </div>
                      
                      <div v-if="!result.success" class="error-details">
                        <div class="mb-2">
                          <span class="text-caption text-medium-emphasis">Error:</span>
                          <span class="text-body-2 ms-2 text-error">{{ result.error }}</span>
                        </div>
                      </div>
                      
                      <div v-if="result.data" class="mt-3">
                        <div class="text-caption text-medium-emphasis mb-2">Raw Data:</div>
                        <v-code class="text-body-2">{{ JSON.stringify(result.data, null, 2) }}</v-code>
                      </div>
                    </div>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
          </v-card-text>
        </v-card>

        <!-- IndexedDB Statistics -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="pa-4 bg-grey-lighten-4">
            <span class="text-h6 font-weight-medium">IndexedDB Statistics</span>
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="!statistics" class="text-center py-4 text-medium-emphasis">
              <v-icon size="32" class="mb-2">mdi-database-off</v-icon>
              <div>No statistics available</div>
            </div>
            
            <div v-else class="stats-grid">
              <div class="stat-item">
                <div class="stat-value text-h4 font-weight-bold text-primary">{{ statistics.total }}</div>
                <div class="stat-label text-caption text-medium-emphasis">Total Failed Syncs</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 font-weight-bold text-error">{{ statistics.failed }}</div>
                <div class="stat-label text-caption text-medium-emphasis">Currently Failed</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 font-weight-bold text-warning">{{ statistics.retryable }}</div>
                <div class="stat-label text-caption text-medium-emphasis">Can Retry</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-h4 font-weight-bold text-info">{{ statistics.requiresIntervention }}</div>
                <div class="stat-label text-caption text-medium-emphasis">Need User Action</div>
              </div>
            </div>
            
            <div v-if="statistics.byType" class="mt-4">
              <div class="text-caption text-medium-emphasis mb-2">By Sync Type:</div>
              <div class="d-flex flex-wrap gap-2">
                <v-chip
                  v-for="(count, type) in statistics.byType"
                  :key="type"
                  size="small"
                  variant="outlined"
                >
                  {{ type }}: {{ count }}
                </v-chip>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Recent Failed Syncs -->
        <v-card variant="outlined" class="mb-6">
          <v-card-title class="pa-4 bg-grey-lighten-4 d-flex justify-space-between align-center">
            <span class="text-h6 font-weight-medium">Recent Failed Syncs</span>
            <v-btn
              @click="refreshFailedSyncs"
              variant="text"
              size="small"
              prepend-icon="mdi-refresh"
            >
              Refresh
            </v-btn>
          </v-card-title>
          <v-card-text class="pa-4">
            <div v-if="failedSyncs.length === 0" class="text-center py-4 text-medium-emphasis">
              <v-icon size="32" class="mb-2">mdi-check-circle-outline</v-icon>
              <div>No failed syncs found</div>
            </div>
            
            <v-list v-else density="compact">
              <v-list-item
                v-for="sync in failedSyncs"
                :key="sync.syncId"
                class="mb-2"
              >
                <template v-slot:prepend>
                  <v-icon color="error">mdi-alert-circle</v-icon>
                </template>
                
                <v-list-item-title class="font-weight-medium">
                  {{ sync.syncType }} - {{ sync.syncId }}
                </v-list-item-title>
                
                <v-list-item-subtitle>
                  <div class="d-flex align-center justify-space-between">
                    <span>{{ sync.errorMessage }}</span>
                    <v-chip size="x-small" :color="getRetryCountColor(sync.retryCount)">
                      Retry: {{ sync.retryCount }}/{{ sync.maxRetries }}
                    </v-chip>
                  </div>
                </v-list-item-subtitle>
                
                <template v-slot:append>
                  <v-btn
                    @click="viewSyncDetails(sync)"
                    variant="text"
                    size="small"
                    icon="mdi-eye"
                  ></v-btn>
                </template>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>

        <!-- Actions -->
        <v-row>
          <v-col cols="12" md="4">
            <v-btn
              @click="cleanupTestData"
              :loading="isCleaning"
              color="warning"
              variant="outlined"
              block
              prepend-icon="mdi-broom"
            >
              {{ isCleaning ? 'Cleaning...' : 'Cleanup Test Data' }}
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="refreshStatistics"
              variant="outlined"
              block
              prepend-icon="mdi-refresh"
            >
              Refresh Statistics
            </v-btn>
          </v-col>
          <v-col cols="12" md="4">
            <v-btn
              @click="exportTestReport"
              variant="outlined"
              block
              prepend-icon="mdi-download"
            >
              Export Report
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Sync Details Dialog -->
    <v-dialog v-model="showDetailsDialog" max-width="800">
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          <span class="text-h6 font-weight-medium">Sync Details</span>
        </v-card-title>
        <v-card-text class="pa-4">
          <div v-if="selectedSync">
            <v-code class="text-body-2">{{ JSON.stringify(selectedSync, null, 2) }}</v-code>
          </div>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn @click="showDetailsDialog = false" variant="elevated" color="primary">
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vuetify'
import { syncTestService } from '@/shared/services/SyncTestService.js'
import { syncStorage } from '@/shared/utils/syncStorage.js'

// Toast
const toast = useToast()

// Reactive data
const networkStatus = ref({
  isOffline: false,
  timestamp: null
})

const testResults = ref([])
const statistics = ref(null)
const failedSyncs = ref([])
const isRunningTests = ref(false)
const isCleaning = ref(false)
const showDetailsDialog = ref(false)
const selectedSync = ref(null)

// Methods
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function getRetryCountColor(retryCount) {
  if (retryCount === 0) return 'success'
  if (retryCount < 3) return 'warning'
  return 'error'
}

async function simulateDisconnection() {
  try {
    const result = syncTestService.simulateNetworkDisconnection()
    networkStatus.value = result
    
    toast({
      title: 'Network Disconnected',
      text: 'Network disconnection simulated successfully',
      color: 'error',
      timeout: 3000
    })
  } catch (error) {
    console.error('Error simulating disconnection:', error)
    toast({
      title: 'Simulation Failed',
      text: 'Failed to simulate network disconnection',
      color: 'error',
      timeout: 3000
    })
  }
}

async function restoreConnection() {
  try {
    const result = syncTestService.restoreNetworkConnection()
    networkStatus.value = result
    
    toast({
      title: 'Network Restored',
      text: 'Network connection restored successfully',
      color: 'success',
      timeout: 3000
    })
  } catch (error) {
    console.error('Error restoring connection:', error)
    toast({
      title: 'Restore Failed',
      text: 'Failed to restore network connection',
      color: 'error',
      timeout: 3000
    })
  }
}

async function runCompleteTest() {
  isRunningTests.value = true
  
  try {
    const results = await syncTestService.runCompleteTestSuite()
    testResults.value = results.tests
    
    // Refresh statistics after tests
    await refreshStatistics()
    await refreshFailedSyncs()
    
    const summary = results.summary
    toast({
      title: 'Test Suite Completed',
      text: `${summary.successfulTests}/${summary.totalTests} tests passed`,
      color: summary.failedTests === 0 ? 'success' : 'warning',
      timeout: 5000
    })
  } catch (error) {
    console.error('Test suite failed:', error)
    toast({
      title: 'Test Suite Failed',
      text: error.message,
      color: 'error',
      timeout: 5000
    })
  } finally {
    isRunningTests.value = false
  }
}

async function refreshStatistics() {
  try {
    statistics.value = await syncStorage.getSyncStatistics()
  } catch (error) {
    console.error('Error refreshing statistics:', error)
  }
}

async function refreshFailedSyncs() {
  try {
    failedSyncs.value = await syncStorage.getFailedSyncs()
    failedSyncs.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Error refreshing failed syncs:', error)
  }
}

function viewSyncDetails(sync) {
  selectedSync.value = sync
  showDetailsDialog.value = true
}

async function cleanupTestData() {
  isCleaning.value = true
  
  try {
    const result = await syncTestService.cleanupTestData()
    
    toast({
      title: 'Cleanup Completed',
      text: result.message,
      color: 'success',
      timeout: 3000
    })
    
    // Refresh data
    await refreshStatistics()
    await refreshFailedSyncs()
    
  } catch (error) {
    console.error('Cleanup failed:', error)
    toast({
      title: 'Cleanup Failed',
      text: error.message,
      color: 'error',
      timeout: 3000
    })
  } finally {
    isCleaning.value = false
  }
}

async function exportTestReport() {
  try {
    const report = await syncTestService.getTestReport()
    
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `sync-test-report-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    
    toast({
      title: 'Report Exported',
      text: 'Test report downloaded successfully',
      color: 'success',
      timeout: 3000
    })
  } catch (error) {
    console.error('Export failed:', error)
    toast({
      title: 'Export Failed',
      text: 'Failed to export test report',
      color: 'error',
      timeout: 3000
    })
  }
}

// Lifecycle
onMounted(async () => {
  await refreshStatistics()
  await refreshFailedSyncs()
})
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  text-align: center;
  padding: 1rem;
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 8px;
}

.stat-value {
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.test-details {
  font-family: 'Courier New', monospace;
}

.v-code {
  background-color: #f5f5f5;
  padding: 1rem;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
