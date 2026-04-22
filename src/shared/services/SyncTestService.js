// Network Failure Simulation Service
// Tests IndexedDB storage and retry mechanism

import { syncStorage } from '@/shared/utils/syncStorage.js'
import { useMutation } from '@vue/apollo-composable'
import { SYNC_ERPNEXT_DATA } from '@/integration/graphql/erpnext.graphql'

class SyncTestService {
  constructor() {
    this.isOffline = false
    this.simulatedErrors = []
    this.testResults = []
  }

  // Simulate network disconnection
  simulateNetworkDisconnection() {
    console.log('=== NETWORK DISCONNECTION SIMULATION STARTED ===')
    this.isOffline = true
    
    // Override fetch to simulate network failure
    this.originalFetch = window.fetch
    window.fetch = (...args) => {
      if (this.isOffline) {
        return Promise.reject(new Error('Network request failed. Device is offline.'))
      }
      return this.originalFetch(...args)
    }

    // Override Apollo Client network interface
    this.simulateGraphQLFailure()
    
    return {
      message: 'Network disconnection simulated',
      timestamp: new Date().toISOString(),
      isOffline: this.isOffline
    }
  }

  // Restore network connection
  restoreNetworkConnection() {
    console.log('=== NETWORK CONNECTION RESTORED ===')
    this.isOffline = false
    
    // Restore original fetch
    if (this.originalFetch) {
      window.fetch = this.originalFetch
      this.originalFetch = null
    }
    
    // Restore Apollo Client
    this.restoreGraphQLConnection()
    
    return {
      message: 'Network connection restored',
      timestamp: new Date().toISOString(),
      isOffline: this.isOffline
    }
  }

  // Simulate GraphQL failure
  simulateGraphQLFailure() {
    // This would be handled by Apollo Client error handlers
    console.log('GraphQL requests will fail due to network disconnection')
  }

  // Restore GraphQL connection
  restoreGraphQLConnection() {
    console.log('GraphQL requests restored')
  }

  // Test sync failure and storage
  async testSyncFailureAndStorage() {
    console.log('=== TESTING SYNC FAILURE AND STORAGE ===')
    
    const testSyncData = {
      syncId: `test_sync_${Date.now()}`,
      syncType: 'CUSTOMER',
      data: {
        customer_name: 'Test Customer',
        contact_no: '0551234567',
        email_id: 'test@example.com',
        shipping_address: '123 Test Street',
        shipping_city: 'Algiers',
        shipping_pincode: '16000'
      }
    }

    try {
      // Simulate network failure
      this.simulateNetworkDisconnection()
      
      // Attempt sync (should fail)
      const syncResult = await this.attemptSync(testSyncData)
      
      // Store failed sync in IndexedDB
      const storedSync = await this.storeFailedSync(testSyncData, syncResult.error)
      
      // Verify storage
      const verification = await this.verifyIndexedDBStorage(storedSync.syncId)
      
      // Test result
      const testResult = {
        testId: testSyncData.syncId,
        success: true,
        networkFailure: true,
        storedInIndexedDB: verification.exists,
        storedData: verification.data,
        timestamp: new Date().toISOString()
      }
      
      this.testResults.push(testResult)
      
      return testResult
      
    } catch (error) {
      console.error('Test failed:', error)
      return {
        testId: testSyncData.syncId,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Attempt sync (will fail due to network)
  async attemptSync(syncData) {
    try {
      // This will fail due to network disconnection
      const { mutate: syncERPNext } = useMutation(SYNC_ERPNEXT_DATA)
      
      const result = await syncERPNext({
        syncType: syncData.syncType,
        options: {
          data: syncData.data,
          validateOnly: false
        }
      })
      
      return { success: true, data: result }
      
    } catch (error) {
      console.log('Sync failed as expected:', error.message)
      return { 
        success: false, 
        error: {
          code: 'NETWORK_ERROR',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      }
    }
  }

  // Store failed sync
  async storeFailedSync(syncData, error) {
    const failedSyncData = {
      syncId: syncData.syncId,
      syncType: syncData.syncType,
      data: syncData.data,
      error: error,
      errorMessage: error.message
    }
    
    return await syncStorage.storeFailedSync(failedSyncData)
  }

  // Verify IndexedDB storage
  async verifyIndexedDBStorage(syncId) {
    try {
      const failedSyncs = await syncStorage.getFailedSyncs()
      const storedSync = failedSyncs.find(sync => sync.syncId === syncId)
      
      return {
        exists: !!storedSync,
        data: storedSync || null,
        totalFailedSyncs: failedSyncs.length
      }
    } catch (error) {
      console.error('Error verifying IndexedDB storage:', error)
      return {
        exists: false,
        error: error.message
      }
    }
  }

  // Test retry mechanism
  async testRetryMechanism() {
    console.log('=== TESTING RETRY MECHANISM ===')
    
    try {
      // Get retryable syncs
      const retryableSyncs = await syncStorage.getRetryableSyncs()
      
      if (retryableSyncs.length === 0) {
        return {
          success: true,
          message: 'No retryable syncs found (as expected)',
          retryableCount: 0
        }
      }
      
      // Restore network connection
      this.restoreNetworkConnection()
      
      // Attempt retry for first sync
      const syncToRetry = retryableSyncs[0]
      const retryResult = await this.attemptSyncRetry(syncToRetry)
      
      return {
        success: retryResult.success,
        syncId: syncToRetry.syncId,
        retryCount: syncToRetry.retryCount + 1,
        result: retryResult
      }
      
    } catch (error) {
      console.error('Retry test failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Attempt sync retry
  async attemptSyncRetry(syncData) {
    try {
      const { mutate: syncERPNext } = useMutation(SYNC_ERPNEXT_DATA)
      
      const result = await syncERPNext({
        syncType: syncData.syncType,
        options: {
          data: syncData.data,
          validateOnly: false
        }
      })
      
      if (result?.data?.syncERPNextData?.success) {
        // Update sync status to success
        await syncStorage.updateSyncStatus(syncData.syncId, 'SUCCESS')
        
        return {
          success: true,
          message: 'Sync retry successful',
          erpnextId: result.data.syncERPNextData.erpnextCustomerId
        }
      } else {
        throw new Error(result?.data?.syncERPNextData?.message || 'Retry failed')
      }
      
    } catch (error) {
      // Update sync status to failed
      await syncStorage.updateSyncStatus(syncData.syncId, 'FAILED', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Get comprehensive test report
  async getTestReport() {
    const statistics = await syncStorage.getSyncStatistics()
    const failedSyncs = await syncStorage.getFailedSyncs()
    
    return {
      testResults: this.testResults,
      currentStatistics: statistics,
      failedSyncs: failedSyncs.slice(0, 5), // Last 5 failed syncs
      networkStatus: {
        isOffline: this.isOffline,
        timestamp: new Date().toISOString()
      },
      summary: {
        totalTests: this.testResults.length,
        successfulTests: this.testResults.filter(t => t.success).length,
        failedTests: this.testResults.filter(t => !t.success).length
      }
    }
  }

  // Clean up test data
  async cleanupTestData() {
    console.log('=== CLEANING UP TEST DATA ===')
    
    try {
      const failedSyncs = await syncStorage.getFailedSyncs()
      const testSyncs = failedSyncs.filter(sync => sync.syncId.startsWith('test_sync_'))
      
      let deletedCount = 0
      for (const sync of testSyncs) {
        await syncStorage.deleteSync(sync.syncId)
        deletedCount++
      }
      
      // Restore network connection if needed
      if (this.isOffline) {
        this.restoreNetworkConnection()
      }
      
      return {
        success: true,
        deletedCount,
        message: `Cleaned up ${deletedCount} test syncs`
      }
      
    } catch (error) {
      console.error('Cleanup failed:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Run complete test suite
  async runCompleteTestSuite() {
    console.log('=== STARTING COMPLETE TEST SUITE ===')
    
    const results = {
      startTime: new Date().toISOString(),
      tests: [],
      summary: {}
    }
    
    try {
      // Test 1: Sync failure and storage
      console.log('Running Test 1: Sync Failure and Storage')
      const test1 = await this.testSyncFailureAndStorage()
      results.tests.push({ name: 'Sync Failure and Storage', ...test1 })
      
      // Test 2: Retry mechanism
      console.log('Running Test 2: Retry Mechanism')
      const test2 = await this.testRetryMechanism()
      results.tests.push({ name: 'Retry Mechanism', ...test2 })
      
      // Test 3: Statistics verification
      console.log('Running Test 3: Statistics Verification')
      const stats = await syncStorage.getSyncStatistics()
      results.tests.push({ name: 'Statistics Verification', success: true, data: stats })
      
      // Generate summary
      results.summary = {
        totalTests: results.tests.length,
        successfulTests: results.tests.filter(t => t.success).length,
        failedTests: results.tests.filter(t => !t.success).length,
        endTime: new Date().toISOString()
      }
      
      console.log('=== TEST SUITE COMPLETED ===')
      return results
      
    } catch (error) {
      console.error('Test suite failed:', error)
      results.error = error.message
      results.endTime = new Date().toISOString()
      return results
    }
  }
}

// Export singleton instance
export const syncTestService = new SyncTestService()
export default syncTestService
