// IndexedDB Wrapper for Failed Sync Operations
// Hybrid Approach: Local Cache + Auto-Retry + User Intervention

class SyncStorageDB {
  constructor() {
    this.dbName = 'VynilartSyncDB'
    this.dbVersion = 1
    this.db = null
    this.storeName = 'failedSyncs'
    this.retryStoreName = 'retryQueue'
  }

  // Initialize IndexedDB
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve(this.db)
      }

      request.onupgradeneeded = (event) => {
        const db = event.target.result

        // Store for failed sync operations
        if (!db.objectStoreNames.contains(this.storeName)) {
          const failedSyncsStore = db.createObjectStore(this.storeName, { keyPath: 'syncId' })
          failedSyncsStore.createIndex('status', 'status', { unique: false })
          failedSyncsStore.createIndex('syncType', 'syncType', { unique: false })
          failedSyncsStore.createIndex('createdAt', 'createdAt', { unique: false })
          failedSyncsStore.createIndex('retryCount', 'retryCount', { unique: false })
        }

        // Store for retry queue
        if (!db.objectStoreNames.contains(this.retryStoreName)) {
          const retryQueueStore = db.createObjectStore(this.retryStoreName, { keyPath: 'queueId' })
          retryQueueStore.createIndex('nextRetryAt', 'nextRetryAt', { unique: false })
          retryQueueStore.createIndex('priority', 'priority', { unique: false })
        }
      }
    })
  }

  // Store failed sync operation
  async storeFailedSync(syncData) {
    if (!this.db) await this.init()

    const failedSync = {
      syncId: syncData.syncId || this.generateSyncId(),
      syncType: syncData.syncType,
      data: syncData.data,
      error: syncData.error,
      errorMessage: syncData.errorMessage,
      status: 'FAILED',
      retryCount: 0,
      maxRetries: 5,
      nextRetryAt: this.calculateNextRetry(0),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requiresUserIntervention: this.requiresUserIntervention(syncData.error),
      priority: this.getPriority(syncData.syncType)
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.add(failedSync)

      request.onsuccess = () => {
        console.log('Failed sync stored:', failedSync.syncId)
        resolve(failedSync)
      }

      request.onerror = () => {
        console.error('Error storing failed sync:', request.error)
        reject(request.error)
      }
    })
  }

  // Get all failed syncs
  async getFailedSyncs() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        resolve(request.result || [])
      }

      request.onerror = () => {
        console.error('Error getting failed syncs:', request.error)
        reject(request.error)
      }
    })
  }

  // Get failed syncs ready for retry
  async getRetryableSyncs() {
    if (!this.db) await this.init()

    const now = new Date().toISOString()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('status')
      const request = index.getAll('FAILED')

      request.onsuccess = () => {
        const retryableSyncs = (request.result || []).filter(sync => 
          sync.nextRetryAt <= now && 
          sync.retryCount < sync.maxRetries &&
          !sync.requiresUserIntervention
        )
        resolve(retryableSyncs)
      }

      request.onerror = () => {
        console.error('Error getting retryable syncs:', request.error)
        reject(request.error)
      }
    })
  }

  // Update sync status
  async updateSyncStatus(syncId, status, error = null) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      
      // First get the existing record
      const getRequest = store.get(syncId)
      
      getRequest.onsuccess = () => {
        const sync = getRequest.result
        if (!sync) {
          reject(new Error('Sync not found'))
          return
        }

        // Update the record
        sync.status = status
        sync.updatedAt = new Date().toISOString()
        
        if (status === 'FAILED') {
          sync.retryCount += 1
          sync.nextRetryAt = this.calculateNextRetry(sync.retryCount)
          sync.error = error
          sync.errorMessage = error?.message || 'Unknown error'
        } else if (status === 'SUCCESS') {
          sync.nextRetryAt = null
          sync.error = null
          sync.errorMessage = null
        }

        const updateRequest = store.put(sync)
        
        updateRequest.onsuccess = () => {
          console.log('Sync status updated:', syncId, status)
          resolve(sync)
        }
        
        updateRequest.onerror = () => {
          console.error('Error updating sync status:', updateRequest.error)
          reject(updateRequest.error)
        }
      }
      
      getRequest.onerror = () => {
        console.error('Error getting sync for update:', getRequest.error)
        reject(getRequest.error)
      }
    })
  }

  // Delete sync record
  async deleteSync(syncId) {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const request = store.delete(syncId)

      request.onsuccess = () => {
        console.log('Sync deleted:', syncId)
        resolve(true)
      }

      request.onerror = () => {
        console.error('Error deleting sync:', request.error)
        reject(request.error)
      }
    })
  }

  // Get sync statistics
  async getSyncStatistics() {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readonly')
      const store = transaction.objectStore(this.storeName)
      const request = store.getAll()

      request.onsuccess = () => {
        const syncs = request.result || []
        const stats = {
          total: syncs.length,
          failed: syncs.filter(s => s.status === 'FAILED').length,
          retryable: syncs.filter(s => s.status === 'FAILED' && s.retryCount < s.maxRetries).length,
          requiresIntervention: syncs.filter(s => s.requiresUserIntervention).length,
          byType: {},
          avgRetryCount: 0
        }

        syncs.forEach(sync => {
          stats.byType[sync.syncType] = (stats.byType[sync.syncType] || 0) + 1
        })

        if (syncs.length > 0) {
          stats.avgRetryCount = syncs.reduce((sum, sync) => sum + sync.retryCount, 0) / syncs.length
        }

        resolve(stats)
      }

      request.onerror = () => {
        console.error('Error getting sync statistics:', request.error)
        reject(request.error)
      }
    })
  }

  // Helper methods
  generateSyncId() {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  calculateNextRetry(retryCount) {
    // Exponential backoff: 1min, 2min, 4min, 8min, 16min
    const delayMinutes = Math.min(Math.pow(2, retryCount), 16)
    const nextRetry = new Date()
    nextRetry.setMinutes(nextRetry.getMinutes() + delayMinutes)
    return nextRetry.toISOString()
  }

  requiresUserIntervention(error) {
    if (!error) return false
    
    const userInterventionCodes = [
      'VALIDATION_ERROR',
      'DATA_CONFLICT',
      'AUTHENTICATION_ERROR',
      'PERMISSION_DENIED',
      'BUSINESS_RULE_VIOLATION'
    ]
    
    return userInterventionCodes.includes(error.code) || 
           error.message?.includes('validation') ||
           error.message?.includes('conflict')
  }

  getPriority(syncType) {
    const priorities = {
      'CUSTOMER': 1,      // Highest priority
      'ORDER': 2,
      'PAYMENT': 3,
      'PRODUCT': 4,
      'INVENTORY': 5,
      'REPORT': 6        // Lowest priority
    }
    
    return priorities[syncType] || 5
  }

  // Clean up old successful syncs (older than 30 days)
  async cleanupOldSyncs() {
    if (!this.db) await this.init()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString()

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([this.storeName], 'readwrite')
      const store = transaction.objectStore(this.storeName)
      const index = store.index('status')
      const request = index.openCursor(IDBKeyRange.only('SUCCESS'))

      let deletedCount = 0
      
      request.onsuccess = (event) => {
        const cursor = event.target.result
        if (cursor) {
          if (cursor.value.updatedAt < cutoffDate) {
            cursor.delete()
            deletedCount++
          }
          cursor.continue()
        } else {
          console.log(`Cleaned up ${deletedCount} old syncs`)
          resolve(deletedCount)
        }
      }

      request.onerror = () => {
        console.error('Error cleaning up old syncs:', request.error)
        reject(request.error)
      }
    })
  }
}

// Export singleton instance
export const syncStorage = new SyncStorageDB()
export default syncStorage
