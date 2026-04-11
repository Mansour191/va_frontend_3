/**
 * Behavior Tracking Service for VynilArt
 * Handles user behavior tracking with Apollo Client for GraphQL
 * Optimized for low memory usage and async performance
 */

import { gql } from '@apollo/client/core'
import { apolloClient } from '@/shared/services/graphql/apolloClient'
import { generateSessionId } from '@/shared/utils/session'

// GraphQL mutation for tracking user actions
const TRACK_USER_ACTION = gql`
  mutation TrackUserAction($input: BehaviorTrackingInput!) {
    trackUserAction(input: $input) {
      success
      message
      tracking {
        id
        action
        targetType
        targetId
        sessionId
        duration
        metadata
        createdAt
      }
      errors
    }
  }
`

class TrackingService {
  constructor() {
    this.sessionId = generateSessionId()
    this.pageStartTime = Date.now()
    this.pendingActions = []
    this.isOnline = navigator.onLine
    this.batchSize = 10
    this.batchTimeout = 5000 // 5 seconds
    
    // Setup online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.flushPendingActions()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
    
    // Setup periodic batch sending
    this.setupBatchSender()
  }

  /**
   * Track a user action asynchronously
   * @param {Object} actionData - Action data to track
   * @param {string} actionData.action - Action type (required)
   * @param {string} actionData.targetType - Target type (optional)
   * @param {number} actionData.targetId - Target ID (optional)
   * @param {Object} actionData.metadata - Additional metadata (optional)
   * @param {number} actionData.duration - Duration in seconds (optional)
   */
  async trackAction(actionData) {
    try {
      const trackingData = {
        action: actionData.action,
        targetType: actionData.targetType || null,
        targetId: actionData.targetId || null,
        sessionId: this.sessionId,
        duration: actionData.duration || 0,
        metadata: actionData.metadata || {}
      }

      // If online, send immediately
      if (this.isOnline) {
        await this.sendAction(trackingData)
      } else {
        // If offline, queue for later
        this.pendingActions.push(trackingData)
        this.savePendingActions()
      }
    } catch (error) {
      console.warn('Tracking failed:', error)
      // Silently fail to not disrupt user experience
    }
  }

  /**
   * Track page view automatically
   * @param {Object} routeData - Route information
   */
  trackPageView(routeData) {
    const duration = this.pageStartTime ? Math.floor((Date.now() - this.pageStartTime) / 1000) : 0
    
    this.trackAction({
      action: 'page_view',
      targetType: 'page',
      metadata: {
        path: routeData.path,
        fullPath: routeData.fullPath,
        name: routeData.name,
        query: routeData.query,
        params: routeData.params,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: Date.now()
      },
      duration: duration
    })

    // Reset page start time for new page
    this.pageStartTime = Date.now()
  }

  /**
   * Track design view
   * @param {Object} designData - Design information
   */
  trackDesignView(designData) {
    this.trackAction({
      action: 'view_design',
      targetType: 'design',
      targetId: designData.id,
      metadata: {
        designName: designData.name,
        category: designData.category,
        imageUrl: designData.imageUrl,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Track product interactions
   * @param {string} action - Action type (view, add_to_cart, etc.)
   * @param {Object} productData - Product information
   */
  trackProduct(action, productData) {
    this.trackAction({
      action: action,
      targetType: 'product',
      targetId: productData.id,
      metadata: {
        productName: productData.name,
        price: productData.price,
        category: productData.category,
        material: productData.material,
        timestamp: Date.now()
      }
    })
  }

  /**
   * Send action to GraphQL API
   * @param {Object} trackingData - Tracking data
   */
  async sendAction(trackingData) {
    try {
      const result = await apolloClient.mutate({
        mutation: TRACK_USER_ACTION,
        variables: {
          input: trackingData
        },
        errorPolicy: 'all' // Don't throw on errors
      })

      if (result.errors) {
        console.warn('Tracking API errors:', result.errors)
      }

      return result.data?.trackUserAction
    } catch (error) {
      console.warn('Tracking API call failed:', error)
      throw error
    }
  }

  /**
   * Setup periodic batch sender for performance
   */
  setupBatchSender() {
    setInterval(() => {
      if (this.pendingActions.length > 0 && this.isOnline) {
        this.flushPendingActions()
      }
    }, this.batchTimeout)
  }

  /**
   * Flush pending actions
   */
  async flushPendingActions() {
    if (this.pendingActions.length === 0) return

    const actionsToSend = this.pendingActions.splice(0, this.batchSize)
    
    // Send actions in parallel for better performance
    const promises = actionsToSend.map(action => 
      this.sendAction(action).catch(error => {
        // Re-queue failed actions
        this.pendingActions.unshift(action)
        console.warn('Failed to send action, re-queued:', error)
      })
    )

    await Promise.allSettled(promises)
    this.savePendingActions()
  }

  /**
   * Save pending actions to localStorage for persistence
   */
  savePendingActions() {
    try {
      localStorage.setItem('pendingTrackingActions', JSON.stringify(this.pendingActions))
    } catch (error) {
      console.warn('Failed to save pending actions:', error)
    }
  }

  /**
   * Load pending actions from localStorage
   */
  loadPendingActions() {
    try {
      const saved = localStorage.getItem('pendingTrackingActions')
      if (saved) {
        this.pendingActions = JSON.parse(saved)
      }
    } catch (error) {
      console.warn('Failed to load pending actions:', error)
      this.pendingActions = []
    }
  }

  /**
   * Clear pending actions
   */
  clearPendingActions() {
    this.pendingActions = []
    localStorage.removeItem('pendingTrackingActions')
  }

  /**
   * Get current session ID
   */
  getSessionId() {
    return this.sessionId
  }

  /**
   * Reset session ID (useful for testing)
   */
  resetSession() {
    this.sessionId = generateSessionId()
    this.pageStartTime = Date.now()
  }
}

// Create singleton instance
export const trackingService = new TrackingService()

// Auto-load pending actions on service initialization
trackingService.loadPendingActions()

// Export default for convenience
export default trackingService
