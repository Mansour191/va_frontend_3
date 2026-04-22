/**
 * Subscription Manager Composable
 * Tracks and automatically cleans up subscriptions and watchers
 * Prevents memory leaks from hanging subscriptions
 */

import { onUnmounted, ref, getCurrentInstance } from 'vue'
import { watch, watchEffect } from 'vue'

class SubscriptionManager {
  constructor() {
    this.subscriptions = new Map()
    this.watchers = new Map()
    this.timeouts = new Map()
    this.intervals = new Map()
    this.eventListeners = new Map()
    this.componentInstances = new Map()
    this.globalStats = {
      totalSubscriptions: 0,
      totalWatchers: 0,
      totalTimeouts: 0,
      totalIntervals: 0,
      totalEventListeners: 0,
      memoryLeaksPrevented: 0
    }
  }

  /**
   * Register a subscription for automatic cleanup
   * @param {string} id - Unique identifier for the subscription
   * @param {Function} unsubscribe - Unsubscribe function
   * @param {Object} options - Additional options
   */
  registerSubscription(id, unsubscribe, options = {}) {
    const subscriptionId = `${options.componentName || 'unknown'}_${id}`
    
    this.subscriptions.set(subscriptionId, {
      unsubscribe,
      createdAt: Date.now(),
      componentName: options.componentName || 'unknown',
      type: options.type || 'graphql'
    })
    
    this.globalStats.totalSubscriptions++
    
    // Return enhanced unsubscribe function
    return {
      unsubscribe: () => {
        this.unsubscribe(subscriptionId)
      },
      id: subscriptionId
    }
  }

  /**
   * Register a watcher for automatic cleanup
   * @param {string} id - Unique identifier for the watcher
   * @param {Function} stopWatch - Stop watching function
   * @param {Object} options - Additional options
   */
  registerWatcher(id, stopWatch, options = {}) {
    const watcherId = `${options.componentName || 'unknown'}_${id}`
    
    this.watchers.set(watcherId, {
      stopWatch,
      createdAt: Date.now(),
      componentName: options.componentName || 'unknown',
      type: options.type || 'reactive'
    })
    
    this.globalStats.totalWatchers++
    
    return {
      stopWatch: () => {
        this.stopWatcher(watcherId)
      },
      id: watcherId
    }
  }

  /**
   * Register a timeout for automatic cleanup
   * @param {string} id - Unique identifier
   * @param {number} timeoutId - Timeout ID from setTimeout
   * @param {Object} options - Additional options
   */
  registerTimeout(id, timeoutId, options = {}) {
    const timeoutKey = `${options.componentName || 'unknown'}_${id}`
    
    this.timeouts.set(timeoutKey, {
      timeoutId,
      createdAt: Date.now(),
      componentName: options.componentName || 'unknown'
    })
    
    this.globalStats.totalTimeouts++
    
    return {
      clear: () => {
        this.clearTimeout(timeoutKey)
      },
      id: timeoutKey
    }
  }

  /**
   * Register an interval for automatic cleanup
   * @param {string} id - Unique identifier
   * @param {number} intervalId - Interval ID from setInterval
   * @param {Object} options - Additional options
   */
  registerInterval(id, intervalId, options = {}) {
    const intervalKey = `${options.componentName || 'unknown'}_${id}`
    
    this.intervals.set(intervalKey, {
      intervalId,
      createdAt: Date.now(),
      componentName: options.componentName || 'unknown'
    })
    
    this.globalStats.totalIntervals++
    
    return {
      clear: () => {
        this.clearInterval(intervalKey)
      },
      id: intervalKey
    }
  }

  /**
   * Register event listeners for automatic cleanup
   * @param {string} id - Unique identifier
   * @param {Element|Window|Document} target - Event target
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   */
  registerEventListener(id, target, event, handler, options = {}) {
    const listenerId = `${options.componentName || 'unknown'}_${id}`
    
    target.addEventListener(event, handler, options)
    
    this.eventListeners.set(listenerId, {
      target,
      event,
      handler,
      options,
      createdAt: Date.now(),
      componentName: options.componentName || 'unknown'
    })
    
    this.globalStats.totalEventListeners++
    
    return {
      remove: () => {
        this.removeEventListener(listenerId)
      },
      id: listenerId
    }
  }

  /**
   * Unsubscribe from a specific subscription
   * @param {string} id - Subscription ID
   */
  unsubscribe(id) {
    const subscription = this.subscriptions.get(id)
    if (subscription) {
      try {
        subscription.unsubscribe()
        this.subscriptions.delete(id)
        console.log(`✅ Unsubscribed: ${id}`)
      } catch (error) {
        console.error(`❌ Error unsubscribing ${id}:`, error)
      }
    }
  }

  /**
   * Stop a specific watcher
   * @param {string} id - Watcher ID
   */
  stopWatcher(id) {
    const watcher = this.watchers.get(id)
    if (watcher) {
      try {
        watcher.stopWatch()
        this.watchers.delete(id)
        console.log(`✅ Stopped watcher: ${id}`)
      } catch (error) {
        console.error(`❌ Error stopping watcher ${id}:`, error)
      }
    }
  }

  /**
   * Clear a specific timeout
   * @param {string} id - Timeout ID
   */
  clearTimeout(id) {
    const timeout = this.timeouts.get(id)
    if (timeout) {
      clearTimeout(timeout.timeoutId)
      this.timeouts.delete(id)
      console.log(`✅ Cleared timeout: ${id}`)
    }
  }

  /**
   * Clear a specific interval
   * @param {string} id - Interval ID
   */
  clearInterval(id) {
    const interval = this.intervals.get(id)
    if (interval) {
      clearInterval(interval.intervalId)
      this.intervals.delete(id)
      console.log(`✅ Cleared interval: ${id}`)
    }
  }

  /**
   * Remove a specific event listener
   * @param {string} id - Listener ID
   */
  removeEventListener(id) {
    const listener = this.eventListeners.get(id)
    if (listener) {
      listener.target.removeEventListener(listener.event, listener.handler, listener.options)
      this.eventListeners.delete(id)
      console.log(`✅ Removed event listener: ${id}`)
    }
  }

  /**
   * Clean up all resources for a specific component
   * @param {string} componentName - Component name
   */
  cleanupComponent(componentName) {
    let cleanedCount = 0
    
    // Clean subscriptions
    this.subscriptions.forEach((subscription, id) => {
      if (id.startsWith(componentName)) {
        this.unsubscribe(id)
        cleanedCount++
      }
    })
    
    // Clean watchers
    this.watchers.forEach((watcher, id) => {
      if (id.startsWith(componentName)) {
        this.stopWatcher(id)
        cleanedCount++
      }
    })
    
    // Clean timeouts
    this.timeouts.forEach((timeout, id) => {
      if (id.startsWith(componentName)) {
        this.clearTimeout(id)
        cleanedCount++
      }
    })
    
    // Clean intervals
    this.intervals.forEach((interval, id) => {
      if (id.startsWith(componentName)) {
        this.clearInterval(id)
        cleanedCount++
      }
    })
    
    // Clean event listeners
    this.eventListeners.forEach((listener, id) => {
      if (id.startsWith(componentName)) {
        this.removeEventListener(id)
        cleanedCount++
      }
    })
    
    this.globalStats.memoryLeaksPrevented += cleanedCount
    console.log(`🧹 Component ${componentName}: Cleaned up ${cleanedCount} resources`)
    
    return cleanedCount
  }

  /**
   * Get statistics for monitoring
   */
  getStats() {
    return {
      activeSubscriptions: this.subscriptions.size,
      activeWatchers: this.watchers.size,
      activeTimeouts: this.timeouts.size,
      activeIntervals: this.intervals.size,
      activeEventListeners: this.eventListeners.size,
      ...this.globalStats,
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Estimate memory usage of tracked resources
   */
  estimateMemoryUsage() {
    const subscriptionMemory = this.subscriptions.size * 1024 // ~1KB per subscription
    const watcherMemory = this.watchers.size * 512 // ~512B per watcher
    const timeoutMemory = this.timeouts.size * 256 // ~256B per timeout
    const intervalMemory = this.intervals.size * 256 // ~256B per interval
    const eventListenerMemory = this.eventListeners.size * 512 // ~512B per listener
    
    return {
      estimatedBytes: subscriptionMemory + watcherMemory + timeoutMemory + intervalMemory + eventListenerMemory,
      estimatedMB: ((subscriptionMemory + watcherMemory + timeoutMemory + intervalMemory + eventListenerMemory) / 1024 / 1024).toFixed(2)
    }
  }

  /**
   * Force cleanup of all resources (emergency use)
   */
  forceCleanupAll() {
    let totalCleaned = 0
    
    // Clean everything
    this.subscriptions.forEach((_, id) => {
      this.unsubscribe(id)
      totalCleaned++
    })
    
    this.watchers.forEach((_, id) => {
      this.stopWatcher(id)
      totalCleaned++
    })
    
    this.timeouts.forEach((_, id) => {
      this.clearTimeout(id)
      totalCleaned++
    })
    
    this.intervals.forEach((_, id) => {
      this.clearInterval(id)
      totalCleaned++
    })
    
    this.eventListeners.forEach((_, id) => {
      this.removeEventListener(id)
      totalCleaned++
    })
    
    this.globalStats.memoryLeaksPrevented += totalCleaned
    console.log(`🚨 Emergency cleanup: Removed ${totalCleaned} resources`)
    
    return totalCleaned
  }

  /**
   * Detect potential memory leaks
   */
  detectMemoryLeaks() {
    const now = Date.now()
    const leaks = []
    
    // Check for old subscriptions (> 10 minutes)
    this.subscriptions.forEach((subscription, id) => {
      if (now - subscription.createdAt > 10 * 60 * 1000) {
        leaks.push({
          type: 'subscription',
          id,
          age: now - subscription.createdAt,
          component: subscription.componentName
        })
      }
    })
    
    // Check for old watchers
    this.watchers.forEach((watcher, id) => {
      if (now - watcher.createdAt > 10 * 60 * 1000) {
        leaks.push({
          type: 'watcher',
          id,
          age: now - watcher.createdAt,
          component: watcher.componentName
        })
      }
    })
    
    return leaks
  }
}

// Global singleton instance
const subscriptionManager = new SubscriptionManager()

/**
 * Composable for Vue components
 * @param {string} componentName - Name of the component using the composable
 */
export function useSubscriptionManager(componentName = null) {
  const instance = getCurrentInstance()
  const actualComponentName = componentName || instance?.type?.name || 'AnonymousComponent'
  
  // Auto-cleanup on unmount
  onUnmounted(() => {
    const cleanedCount = subscriptionManager.cleanupComponent(actualComponentName)
    if (cleanedCount > 0) {
      console.log(`🧹 Auto-cleanup for ${actualComponentName}: ${cleanedCount} resources freed`)
    }
  })
  
  return {
    // Subscription management
    trackSubscription: (id, unsubscribe, options = {}) => {
      return subscriptionManager.registerSubscription(id, unsubscribe, {
        componentName: actualComponentName,
        ...options
      })
    },
    
    // Watcher management
    trackWatcher: (id, stopWatch, options = {}) => {
      return subscriptionManager.registerWatcher(id, stopWatch, {
        componentName: actualComponentName,
        ...options
      })
    },
    
    // Timeout management
    trackTimeout: (id, timeoutId, options = {}) => {
      return subscriptionManager.registerTimeout(id, timeoutId, {
        componentName: actualComponentName,
        ...options
      })
    },
    
    // Interval management
    trackInterval: (id, intervalId, options = {}) => {
      return subscriptionManager.registerInterval(id, intervalId, {
        componentName: actualComponentName,
        ...options
      })
    },
    
    // Event listener management
    trackEventListener: (id, target, event, handler, options = {}) => {
      return subscriptionManager.registerEventListener(id, target, event, handler, {
        componentName: actualComponentName,
        ...options
      })
    },
    
    // Utility methods
    getStats: () => subscriptionManager.getStats(),
    detectLeaks: () => subscriptionManager.detectMemoryLeaks(),
    cleanupComponent: () => subscriptionManager.cleanupComponent(actualComponentName),
    
    // Direct access to manager (for advanced usage)
    manager: subscriptionManager
  }
}

// Export global instance for direct access
export { subscriptionManager }

// Export default
export default useSubscriptionManager

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    subscriptionManager.forceCleanupAll()
  })
}
