/**
 * Session utilities for behavior tracking
 * Generates and manages session IDs for anonymous users
 */

/**
 * Generate a unique session ID
 * @returns {string} Unique session identifier
 */
export function generateSessionId() {
  // Check if session ID exists in sessionStorage
  let sessionId = sessionStorage.getItem('trackingSessionId')
  
  if (!sessionId) {
    // Generate new session ID
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    sessionStorage.setItem('trackingSessionId', sessionId)
  }
  
  return sessionId
}

/**
 * Reset session ID
 * @returns {string} New session identifier
 */
export function resetSessionId() {
  const sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  sessionStorage.setItem('trackingSessionId', sessionId)
  return sessionId
}

/**
 * Get current session ID
 * @returns {string|null} Current session identifier
 */
export function getSessionId() {
  return sessionStorage.getItem('trackingSessionId')
}

/**
 * Check if session is new (created within last 30 minutes)
 * @returns {boolean} True if session is new
 */
export function isNewSession() {
  const sessionId = getSessionId()
  if (!sessionId) return true
  
  // Extract timestamp from session ID
  const timestamp = parseInt(sessionId.split('_')[1])
  const thirtyMinutesAgo = Date.now() - (30 * 60 * 1000)
  
  return timestamp > thirtyMinutesAgo
}
