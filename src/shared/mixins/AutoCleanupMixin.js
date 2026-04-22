/**
 * Auto-Cleanup Mixin for Vue Options API Components
 * Automatically tracks and cleans up subscriptions, watchers, timeouts, intervals, and event listeners
 * Prevents memory leaks in components that don't use Composition API
 */

import { subscriptionManager } from '@/composables/useSubscriptionManager'
import { websocketManager } from '@/shared/utils/websocketManager'

export default {
  data() {
    return {
      // Auto-cleanup tracking
      $autoCleanup: {
        subscriptions: new Map(),
        watchers: new Map(),
        timeouts: new Map(),
        intervals: new Map(),
        eventListeners: new Map(),
        websockets: new Map()
      }
    }
  },

  created() {
    // Store original methods
    this.$originalMethods = {
      $watch: this.$watch,
      $once: this.$once,
      $on: this.$on,
      $off: this.$off
    }

    // Override $watch to track watchers
    this.$watch = (expOrFn, callback, options = {}) => {
      const unwatch = this.$originalMethods.$watch.call(this, expOrFn, callback, options)
      const watcherId = `${this.$options.name || 'AnonymousComponent'}_watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      this.$autoCleanup.watchers.set(watcherId, {
        unwatch,
        expOrFn,
        callback,
        options,
        createdAt: Date.now()
      })

      return {
        unwatch: () => {
          this.$cleanupWatcher(watcherId)
        },
        id: watcherId
      }
    }

    // Override $once to track one-time event listeners
    this.$once = (event, callback) => {
      const wrappedCallback = (...args) => {
        callback.apply(this, args)
        // Remove from tracking after execution
        this.$removeTrackedEventListener(event, callback)
      }
      
      return this.$originalMethods.$once.call(this, event, wrappedCallback)
    }

    // Override $on to track event listeners
    this.$on = (event, callback) => {
      this.$originalMethods.$on.call(this, event, callback)
      this.$trackEventListener(event, callback)
    }
  },

  mounted() {
    // Add cleanup method to component instance
    this.$cleanup = this.$cleanupAll
    this.$cleanupWatcher = this.$cleanupWatcherById
    this.$cleanupTimeout = this.$cleanupTimeoutById
    this.$cleanupInterval = this.$cleanupIntervalById
    this.$cleanupWebSocket = this.$cleanupWebSocketById
    this.$getCleanupStats = this.$getCleanupStats
  },

  beforeUnmount() {
    // Auto-cleanup all tracked resources
    this.$cleanupAll()
  },

  methods: {
    /**
     * Track a subscription for automatic cleanup
     * @param {string} id - Unique identifier
     * @param {Function} unsubscribe - Unsubscribe function
     * @param {Object} options - Additional options
     */
    $trackSubscription(id, unsubscribe, options = {}) {
      const subscriptionId = `${this.$options.name || 'AnonymousComponent'}_${id}`
      
      this.$autoCleanup.subscriptions.set(subscriptionId, {
        unsubscribe,
        options,
        createdAt: Date.now()
      })

      // Also track in global subscription manager
      subscriptionManager.registerSubscription(subscriptionId, unsubscribe, {
        componentName: this.$options.name || 'AnonymousComponent',
        ...options
      })

      return {
        unsubscribe: () => {
          this.$cleanupSubscription(subscriptionId)
        },
        id: subscriptionId
      }
    },

    /**
     * Track a timeout for automatic cleanup
     * @param {string} id - Unique identifier
     * @param {Function} callback - Timeout callback
     * @param {number} delay - Delay in milliseconds
     * @param {Object} options - Additional options
     */
    $trackTimeout(id, callback, delay, options = {}) {
      const timeoutId = setTimeout(() => {
        try {
          callback()
        } catch (error) {
          console.error(`Error in tracked timeout ${id}:`, error)
        } finally {
          this.$autoCleanup.timeouts.delete(id)
        }
      }, delay)

      const timeoutKey = `${this.$options.name || 'AnonymousComponent'}_${id}`
      
      this.$autoCleanup.timeouts.set(timeoutKey, {
        timeoutId,
        callback,
        delay,
        options,
        createdAt: Date.now()
      })

      // Also track in global subscription manager
      subscriptionManager.registerTimeout(timeoutKey, timeoutId, {
        componentName: this.$options.name || 'AnonymousComponent'
      })

      return {
        clear: () => {
          this.$cleanupTimeout(timeoutKey)
        },
        id: timeoutKey
      }
    },

    /**
     * Track an interval for automatic cleanup
     * @param {string} id - Unique identifier
     * @param {Function} callback - Interval callback
     * @param {number} interval - Interval in milliseconds
     * @param {Object} options - Additional options
     */
    $trackInterval(id, callback, interval, options = {}) {
      const intervalId = setInterval(() => {
        try {
          callback()
        } catch (error) {
          console.error(`Error in tracked interval ${id}:`, error)
        }
      }, interval)

      const intervalKey = `${this.$options.name || 'AnonymousComponent'}_${id}`
      
      this.$autoCleanup.intervals.set(intervalKey, {
        intervalId,
        callback,
        interval,
        options,
        createdAt: Date.now()
      })

      // Also track in global subscription manager
      subscriptionManager.registerInterval(intervalKey, intervalId, {
        componentName: this.$options.name || 'AnonymousComponent'
      })

      return {
        clear: () => {
          this.$cleanupInterval(intervalKey)
        },
        id: intervalKey
      }
    },

    /**
     * Track an event listener for automatic cleanup
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     * @param {Object} options - Event options
     */
    $trackEventListener(event, callback, options = {}) {
      if (!this.$autoCleanup.eventListeners.has(event)) {
        this.$autoCleanup.eventListeners.set(event, new Set())
      }
      
      this.$autoCleanup.eventListeners.get(event).add({
        callback,
        options,
        createdAt: Date.now()
      })
    },

    /**
     * Remove tracked event listener
     * @param {string} event - Event name
     * @param {Function} callback - Event callback
     */
    $removeTrackedEventListener(event, callback) {
      const listeners = this.$autoCleanup.eventListeners.get(event)
      if (listeners) {
        for (const listener of listeners) {
          if (listener.callback === callback) {
            listeners.delete(listener)
            break
          }
        }
        
        if (listeners.size === 0) {
          this.$autoCleanup.eventListeners.delete(event)
        }
      }
    },

    /**
     * Track a WebSocket connection for automatic cleanup
     * @param {string} id - Unique identifier
     * @param {string} connectionName - WebSocket connection name
     * @param {Object} options - Additional options
     */
    $trackWebSocket(id, connectionName, options = {}) {
      const wsKey = `${this.$options.name || 'AnonymousComponent'}_${id}`
      
      this.$autoCleanup.websockets.set(wsKey, {
        connectionName,
        options,
        createdAt: Date.now()
      })

      return {
        close: () => {
          this.$cleanupWebSocket(wsKey)
        },
        id: wsKey
      }
    },

    /**
     * Clean up a specific subscription
     * @param {string} subscriptionId - Subscription ID
     */
    $cleanupSubscription(subscriptionId) {
      const subscription = this.$autoCleanup.subscriptions.get(subscriptionId)
      if (subscription) {
        try {
          subscription.unsubscribe()
          this.$autoCleanup.subscriptions.delete(subscriptionId)
          console.log(`✅ Cleaned up subscription: ${subscriptionId}`)
        } catch (error) {
          console.error(`❌ Error cleaning up subscription ${subscriptionId}:`, error)
        }
      }
    },

    /**
     * Clean up a specific watcher
     * @param {string} watcherId - Watcher ID
     */
    $cleanupWatcherById(watcherId) {
      const watcher = this.$autoCleanup.watchers.get(watcherId)
      if (watcher) {
        try {
          watcher.unwatch()
          this.$autoCleanup.watchers.delete(watcherId)
          console.log(`✅ Cleaned up watcher: ${watcherId}`)
        } catch (error) {
          console.error(`❌ Error cleaning up watcher ${watcherId}:`, error)
        }
      }
    },

    /**
     * Clean up a specific timeout
     * @param {string} timeoutKey - Timeout key
     */
    $cleanupTimeoutById(timeoutKey) {
      const timeout = this.$autoCleanup.timeouts.get(timeoutKey)
      if (timeout) {
        clearTimeout(timeout.timeoutId)
        this.$autoCleanup.timeouts.delete(timeoutKey)
        console.log(`✅ Cleaned up timeout: ${timeoutKey}`)
      }
    },

    /**
     * Clean up a specific interval
     * @param {string} intervalKey - Interval key
     */
    $cleanupIntervalById(intervalKey) {
      const interval = this.$autoCleanup.intervals.get(intervalKey)
      if (interval) {
        clearInterval(interval.intervalId)
        this.$autoCleanup.intervals.delete(intervalKey)
        console.log(`✅ Cleaned up interval: ${intervalKey}`)
      }
    },

    /**
     * Clean up a specific WebSocket connection
     * @param {string} wsKey - WebSocket key
     */
    $cleanupWebSocketById(wsKey) {
      const ws = this.$autoCleanup.websockets.get(wsKey)
      if (ws) {
        try {
          websocketManager.closeConnection(ws.connectionName)
          this.$autoCleanup.websockets.delete(wsKey)
          console.log(`✅ Cleaned up WebSocket: ${wsKey}`)
        } catch (error) {
          console.error(`❌ Error cleaning up WebSocket ${wsKey}:`, error)
        }
      }
    },

    /**
     * Clean up all tracked resources
     */
    $cleanupAll() {
      const componentName = this.$options.name || 'AnonymousComponent'
      let totalCleaned = 0

      // Clean subscriptions
      this.$autoCleanup.subscriptions.forEach((subscription, id) => {
        this.$cleanupSubscription(id)
        totalCleaned++
      })

      // Clean watchers
      this.$autoCleanup.watchers.forEach((watcher, id) => {
        this.$cleanupWatcherById(id)
        totalCleaned++
      })

      // Clean timeouts
      this.$autoCleanup.timeouts.forEach((timeout, id) => {
        this.$cleanupTimeoutById(id)
        totalCleaned++
      })

      // Clean intervals
      this.$autoCleanup.intervals.forEach((interval, id) => {
        this.$cleanupIntervalById(id)
        totalCleaned++
      })

      // Clean WebSockets
      this.$autoCleanup.websockets.forEach((ws, id) => {
        this.$cleanupWebSocketById(id)
        totalCleaned++
      })

      // Clean event listeners
      this.$autoCleanup.eventListeners.forEach((listeners, event) => {
        listeners.forEach(listener => {
          this.$originalMethods.$off.call(this, event, listener.callback)
        })
        totalCleaned++
      })
      this.$autoCleanup.eventListeners.clear()

      console.log(`🧹 Auto-cleanup for ${componentName}: ${totalCleaned} resources freed`)
      return totalCleaned
    },

    /**
     * Get cleanup statistics
     */
    $getCleanupStats() {
      return {
        componentName: this.$options.name || 'AnonymousComponent',
        subscriptions: this.$autoCleanup.subscriptions.size,
        watchers: this.$autoCleanup.watchers.size,
        timeouts: this.$autoCleanup.timeouts.size,
        intervals: this.$autoCleanup.intervals.size,
        eventListeners: Array.from(this.$autoCleanup.eventListeners.values())
          .reduce((total, listeners) => total + listeners.size, 0),
        websockets: this.$autoCleanup.websockets.size,
        total: this.$autoCleanup.subscriptions.size + 
               this.$autoCleanup.watchers.size + 
               this.$autoCleanup.timeouts.size + 
               this.$autoCleanup.intervals.size + 
               Array.from(this.$autoCleanup.eventListeners.values())
                 .reduce((total, listeners) => total + listeners.size, 0) + 
               this.$autoCleanup.websockets.size
      }
    },

    /**
     * Detect potential memory leaks
     */
    $detectMemoryLeaks() {
      const now = Date.now()
      const leaks = []
      const maxAge = 10 * 60 * 1000 // 10 minutes

      // Check for old resources
      this.$autoCleanup.subscriptions.forEach((subscription, id) => {
        if (now - subscription.createdAt > maxAge) {
          leaks.push({ type: 'subscription', id, age: now - subscription.createdAt })
        }
      })

      this.$autoCleanup.watchers.forEach((watcher, id) => {
        if (now - watcher.createdAt > maxAge) {
          leaks.push({ type: 'watcher', id, age: now - watcher.createdAt })
        }
      })

      this.$autoCleanup.timeouts.forEach((timeout, id) => {
        if (now - timeout.createdAt > maxAge) {
          leaks.push({ type: 'timeout', id, age: now - timeout.createdAt })
        }
      })

      this.$autoCleanup.intervals.forEach((interval, id) => {
        if (now - interval.createdAt > maxAge) {
          leaks.push({ type: 'interval', id, age: now - interval.createdAt })
        }
      })

      return leaks
    }
  }
}
