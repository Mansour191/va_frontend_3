/**
 * WebSocket Connection Manager
 * Prevents multiple WebSocket connections for the same purpose
 * Provides centralized connection management and cleanup
 */

class WebSocketManager {
  constructor() {
    this.connections = new Map() // Map of connectionName -> connectionInfo
    this.connectionPools = new Map() // Map of purpose -> pool of connections
    this.globalStats = {
      totalConnections: 0,
      activeConnections: 0,
      preventedDuplicates: 0,
      reconnectAttempts: 0,
      memoryLeaksPrevented: 0
    }
    this.maxConnectionsPerPurpose = 3 // Maximum connections for same purpose
    this.connectionTimeout = 30000 // 30 seconds connection timeout
  }

  /**
   * Create or get a WebSocket connection
   * @param {string} connectionName - Unique name for the connection
   * @param {string} url - WebSocket URL
   * @param {Object} options - Connection options
   * @returns {Promise<WebSocket>} WebSocket instance
   */
  async getConnection(connectionName, url, options = {}) {
    const {
      purpose = 'default',
      protocols = [],
      reconnect = true,
      maxReconnectAttempts = 5,
      reconnectDelay = 1000,
      onOpen,
      onMessage,
      onError,
      onClose,
      connectionParams = {},
      timeout = this.connectionTimeout
    } = options

    // Check if connection already exists
    if (this.connections.has(connectionName)) {
      const existingConnection = this.connections.get(connectionName)
      
      if (existingConnection.ws.readyState === WebSocket.OPEN) {
        console.log(`🔗 Reusing existing WebSocket connection: ${connectionName}`)
        this.globalStats.preventedDuplicates++
        return existingConnection.ws
      } else {
        // Remove dead connection
        this.removeConnection(connectionName)
      }
    }

    // Check connection pool limits
    if (!this.canCreateConnection(purpose)) {
      console.warn(`⚠️ Connection pool limit reached for purpose: ${purpose}`)
      throw new Error(`Cannot create connection: pool limit reached for ${purpose}`)
    }

    // Create new connection
    const ws = new WebSocket(url, protocols)
    const connectionInfo = {
      ws,
      name: connectionName,
      purpose,
      url,
      options,
      createdAt: Date.now(),
      reconnectAttempts: 0,
      isReconnecting: false,
      lastActivity: Date.now(),
      messageQueue: [],
      eventListeners: new Map()
    }

    // Set up connection timeout
    const timeoutId = setTimeout(() => {
      if (ws.readyState === WebSocket.CONNECTING) {
        ws.close()
        console.error(`❌ WebSocket connection timeout: ${connectionName}`)
      }
    }, timeout)

    // WebSocket event handlers
    ws.onopen = (event) => {
      clearTimeout(timeoutId)
      console.log(`🔗 WebSocket connected: ${connectionName}`)
      
      connectionInfo.lastActivity = Date.now()
      connectionInfo.reconnectAttempts = 0
      this.globalStats.activeConnections++

      // Send queued messages
      connectionInfo.messageQueue.forEach(message => {
        ws.send(message)
      })
      connectionInfo.messageQueue = []

      // Call user callback
      if (onOpen) onOpen(event)
      
      // Emit connection event
      this.emitConnectionEvent(connectionName, 'open', event)
    }

    ws.onmessage = (event) => {
      connectionInfo.lastActivity = Date.now()
      
      // Call user callback
      if (onMessage) onMessage(event)
      
      // Emit connection event
      this.emitConnectionEvent(connectionName, 'message', event)
    }

    ws.onerror = (event) => {
      console.error(`❌ WebSocket error: ${connectionName}`, event)
      
      // Call user callback
      if (onError) onError(event)
      
      // Emit connection event
      this.emitConnectionEvent(connectionName, 'error', event)
    }

    ws.onclose = (event) => {
      clearTimeout(timeoutId)
      console.log(`🔌 WebSocket closed: ${connectionName}`)
      
      this.globalStats.activeConnections--
      
      // Remove from active connections
      this.connections.delete(connectionName)
      this.updateConnectionPool(purpose, -1)

      // Call user callback
      if (onClose) onClose(event)
      
      // Emit connection event
      this.emitConnectionEvent(connectionName, 'close', event)

      // Auto-reconnect if enabled
      if (reconnect && !event.wasClean && connectionInfo.reconnectAttempts < maxReconnectAttempts) {
        this.attemptReconnect(connectionName, url, options)
      }
    }

    // Store connection
    this.connections.set(connectionName, connectionInfo)
    this.updateConnectionPool(purpose, 1)
    this.globalStats.totalConnections++

    return ws
  }

  /**
   * Check if we can create a new connection for a purpose
   * @param {string} purpose - Connection purpose
   * @returns {boolean} Whether connection can be created
   */
  canCreateConnection(purpose) {
    const pool = this.connectionPools.get(purpose) || 0
    return pool < this.maxConnectionsPerPurpose
  }

  /**
   * Update connection pool count
   * @param {string} purpose - Connection purpose
   * @param {number} delta - Change in count
   */
  updateConnectionPool(purpose, delta) {
    const current = this.connectionPools.get(purpose) || 0
    const newCount = Math.max(0, current + delta)
    
    if (newCount === 0) {
      this.connectionPools.delete(purpose)
    } else {
      this.connectionPools.set(purpose, newCount)
    }
  }

  /**
   * Attempt to reconnect a WebSocket
   * @param {string} connectionName - Connection name
   * @param {string} url - WebSocket URL
   * @param {Object} options - Connection options
   */
  async attemptReconnect(connectionName, url, options) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo || connectionInfo.isReconnecting) return

    connectionInfo.isReconnecting = true
    connectionInfo.reconnectAttempts++
    this.globalStats.reconnectAttempts++

    const delay = options.reconnectDelay * Math.pow(2, connectionInfo.reconnectAttempts - 1)
    
    console.log(`🔄 Attempting to reconnect ${connectionName} (${connectionInfo.reconnectAttempts}/${options.maxReconnectAttempts}) in ${delay}ms`)

    setTimeout(async () => {
      try {
        connectionInfo.isReconnecting = false
        await this.getConnection(connectionName, url, options)
      } catch (error) {
        console.error(`❌ Reconnect failed for ${connectionName}:`, error)
      }
    }, delay)
  }

  /**
   * Send a message through a WebSocket connection
   * @param {string} connectionName - Connection name
   * @param {string|Object} message - Message to send
   * @returns {boolean} Whether message was sent
   */
  sendMessage(connectionName, message) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) {
      console.error(`❌ Connection not found: ${connectionName}`)
      return false
    }

    const messageStr = typeof message === 'string' ? message : JSON.stringify(message)

    if (connectionInfo.ws.readyState === WebSocket.OPEN) {
      connectionInfo.ws.send(messageStr)
      connectionInfo.lastActivity = Date.now()
      return true
    } else if (connectionInfo.ws.readyState === WebSocket.CONNECTING) {
      // Queue message for when connection opens
      connectionInfo.messageQueue.push(messageStr)
      return true
    } else {
      console.error(`❌ WebSocket not ready for ${connectionName}: ${connectionInfo.ws.readyState}`)
      return false
    }
  }

  /**
   * Add event listener to a connection
   * @param {string} connectionName - Connection name
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  addEventListener(connectionName, event, callback) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) return false

    if (!connectionInfo.eventListeners.has(event)) {
      connectionInfo.eventListeners.set(event, new Set())
    }
    
    connectionInfo.eventListeners.get(event).add(callback)
    return true
  }

  /**
   * Remove event listener from a connection
   * @param {string} connectionName - Connection name
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  removeEventListener(connectionName, event, callback) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) return false

    const listeners = connectionInfo.eventListeners.get(event)
    if (listeners) {
      listeners.delete(callback)
      if (listeners.size === 0) {
        connectionInfo.eventListeners.delete(event)
      }
    }
    return true
  }

  /**
   * Emit connection event to all listeners
   * @param {string} connectionName - Connection name
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emitConnectionEvent(connectionName, event, data) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) return

    const listeners = connectionInfo.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${connectionName}:`, error)
        }
      })
    }
  }

  /**
   * Close a specific connection
   * @param {string} connectionName - Connection name
   * @param {number} code - Close code
   * @param {string} reason - Close reason
   */
  closeConnection(connectionName, code = 1000, reason = 'Manual close') {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) return false

    connectionInfo.ws.close(code, reason)
    this.removeConnection(connectionName)
    return true
  }

  /**
   * Remove connection from tracking
   * @param {string} connectionName - Connection name
   */
  removeConnection(connectionName) {
    const connectionInfo = this.connections.get(connectionName)
    if (connectionInfo) {
      this.updateConnectionPool(connectionInfo.purpose, -1)
      this.globalStats.activeConnections--
      this.connections.delete(connectionName)
      console.log(`🗑️ Removed connection: ${connectionName}`)
    }
  }

  /**
   * Close all connections
   * @param {string} purpose - Optional purpose filter
   */
  closeAllConnections(purpose = null) {
    let closedCount = 0
    
    this.connections.forEach((connectionInfo, connectionName) => {
      if (!purpose || connectionInfo.purpose === purpose) {
        this.closeConnection(connectionName, 1000, 'Global cleanup')
        closedCount++
      }
    })

    this.globalStats.memoryLeaksPrevented += closedCount
    console.log(`🧹 Closed ${closedCount} WebSocket connections${purpose ? ` for purpose: ${purpose}` : ''}`)
    
    return closedCount
  }

  /**
   * Get connection status
   * @param {string} connectionName - Connection name
   * @returns {Object} Connection status
   */
  getConnectionStatus(connectionName) {
    const connectionInfo = this.connections.get(connectionName)
    if (!connectionInfo) return null

    return {
      name: connectionName,
      purpose: connectionInfo.purpose,
      url: connectionInfo.url,
      readyState: connectionInfo.ws.readyState,
      readyStateText: this.getReadyStateText(connectionInfo.ws.readyState),
      createdAt: connectionInfo.createdAt,
      lastActivity: connectionInfo.lastActivity,
      reconnectAttempts: connectionInfo.reconnectAttempts,
      isReconnecting: connectionInfo.isReconnecting,
      queuedMessages: connectionInfo.messageQueue.length
    }
  }

  /**
   * Get all connections status
   * @returns {Array} Array of connection statuses
   */
  getAllConnectionsStatus() {
    return Array.from(this.connections.keys()).map(name => this.getConnectionStatus(name))
  }

  /**
   * Get WebSocket ready state text
   * @param {number} readyState - WebSocket ready state
   * @returns {string} Ready state description
   */
  getReadyStateText(readyState) {
    const states = {
      [WebSocket.CONNECTING]: 'CONNECTING',
      [WebSocket.OPEN]: 'OPEN',
      [WebSocket.CLOSING]: 'CLOSING',
      [WebSocket.CLOSED]: 'CLOSED'
    }
    return states[readyState] || 'UNKNOWN'
  }

  /**
   * Get global statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      ...this.globalStats,
      activeConnections: this.connections.size,
      connectionPools: Object.fromEntries(this.connectionPools),
      memoryUsage: this.estimateMemoryUsage()
    }
  }

  /**
   * Estimate memory usage of connections
   */
  estimateMemoryUsage() {
    const connectionMemory = this.connections.size * 2048 // ~2KB per connection
    const queueMemory = Array.from(this.connections.values())
      .reduce((total, conn) => total + (conn.messageQueue.length * 256), 0) // ~256B per queued message
    
    return {
      estimatedBytes: connectionMemory + queueMemory,
      estimatedMB: ((connectionMemory + queueMemory) / 1024 / 1024).toFixed(2)
    }
  }

  /**
   * Cleanup idle connections
   * @param {number} maxIdleTime - Maximum idle time in milliseconds
   */
  cleanupIdleConnections(maxIdleTime = 5 * 60 * 1000) { // 5 minutes
    const now = Date.now()
    let cleanedCount = 0

    this.connections.forEach((connectionInfo, connectionName) => {
      if (now - connectionInfo.lastActivity > maxIdleTime) {
        this.closeConnection(connectionName, 1000, 'Idle cleanup')
        cleanedCount++
      }
    })

    if (cleanedCount > 0) {
      this.globalStats.memoryLeaksPrevented += cleanedCount
      console.log(`🧹 Cleaned up ${cleanedCount} idle WebSocket connections`)
    }

    return cleanedCount
  }

  /**
   * Health check for all connections
   */
  healthCheck() {
    const now = Date.now()
    const health = {
      healthy: 0,
      unhealthy: 0,
      idle: 0,
      details: []
    }

    this.connections.forEach((connectionInfo, connectionName) => {
      const status = this.getConnectionStatus(connectionName)
      const idleTime = now - connectionInfo.lastActivity
      
      let connectionHealth = 'healthy'
      if (status.readyState !== WebSocket.OPEN) {
        connectionHealth = 'unhealthy'
        health.unhealthy++
      } else if (idleTime > 5 * 60 * 1000) { // 5 minutes
        connectionHealth = 'idle'
        health.idle++
      } else {
        health.healthy++
      }

      health.details.push({
        name: connectionName,
        health: connectionHealth,
        idleTime,
        ...status
      })
    })

    return health
  }
}

// Create singleton instance
const websocketManager = new WebSocketManager()

// Export singleton and class
export { websocketManager, WebSocketManager }
export default websocketManager

// Global cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketManager.closeAllConnections()
  })
}

// Periodic cleanup (every 5 minutes)
if (typeof window !== 'undefined') {
  setInterval(() => {
    websocketManager.cleanupIdleConnections()
  }, 5 * 60 * 1000)
}
