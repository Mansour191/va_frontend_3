// Sync Lock Utility to prevent concurrent sync operations
export class SyncLock {
  static instance = null
  static locks = new Map()
  
  static getInstance() {
    if (!this.instance) {
      this.instance = new SyncLock()
    }
    return this.instance
  }
  
  // Acquire a lock for a specific operation
  async acquireLock(operationName, timeoutMs = 30000) {
    const lockKey = `sync_${operationName}`
    
    if (this.locks.has(lockKey)) {
      const lockInfo = this.locks.get(lockKey)
      if (Date.now() - lockInfo.startTime < timeoutMs) {
        console.log(`🔒 Sync lock already active for: ${operationName}`)
        return false
      } else {
        // Lock expired, remove it
        this.locks.delete(lockKey)
        console.log(`⏰ Sync lock expired for: ${operationName}`)
      }
    }
    
    // Acquire new lock
    this.locks.set(lockKey, {
      startTime: Date.now(),
      operationName
    })
    
    console.log(`🔐 Sync lock acquired for: ${operationName}`)
    return true
  }
  
  // Release a lock for a specific operation
  releaseLock(operationName) {
    const lockKey = `sync_${operationName}`
    
    if (this.locks.has(lockKey)) {
      this.locks.delete(lockKey)
      console.log(`🔓 Sync lock released for: ${operationName}`)
      return true
    }
    
    console.warn(`⚠️ Attempted to release non-existent lock for: ${operationName}`)
    return false
  }
  
  // Check if a lock is active
  isLocked(operationName) {
    const lockKey = `sync_${operationName}`
    return this.locks.has(lockKey)
  }
  
  // Get all active locks
  getActiveLocks() {
    return Array.from(this.locks.entries()).map(([key, info]) => ({
      operation: key.replace('sync_', ''),
      startTime: info.startTime,
      duration: Date.now() - info.startTime
    }))
  }
  
  // Clear all locks (emergency cleanup)
  clearAllLocks() {
    const count = this.locks.size
    this.locks.clear()
    console.log(`🧹 Cleared ${count} sync locks`)
    return count
  }
  
  // Clean up expired locks
  cleanupExpiredLocks(maxAgeMs = 30000) {
    let cleaned = 0
    const now = Date.now()
    
    for (const [key, info] of this.locks.entries()) {
      if (now - info.startTime > maxAgeMs) {
        this.locks.delete(key)
        cleaned++
        console.log(`🧹 Cleaned expired lock: ${key}`)
      }
    }
    
    return cleaned
  }
}

// Export singleton instance
export const syncLock = SyncLock.getInstance()

// Auto-cleanup expired locks every 30 seconds
setInterval(() => {
  syncLock.cleanupExpiredLocks()
}, 30000)
