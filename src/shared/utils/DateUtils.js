// Date Utility Functions - Safe Date Handling

export class DateUtils {
  /**
   * Creates a safe ISO timestamp
   * @returns {string} ISO timestamp or fallback
   */
  static createTimestamp() {
    try {
      return new Date().toISOString();
    } catch (error) {
      console.error('Error creating timestamp:', error);
      return Date.now().toString();
    }
  }

  /**
   * Validates if a timestamp is valid
   * @param {string|number|Date} timestamp - The timestamp to validate
   * @returns {boolean} True if valid
   */
  static isValidTimestamp(timestamp) {
    if (!timestamp) return false;
    
    try {
      const date = new Date(timestamp);
      return !isNaN(date.getTime());
    } catch (error) {
      return false;
    }
  }

  /**
   * Safely formats time for display
   * @param {string|number|Date} timestamp - The timestamp to format
   * @param {string} locale - Locale for formatting (default: 'ar-DZ')
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted time or empty string if invalid
   */
  static formatTime(timestamp, locale = 'ar-DZ', options = null) {
    // Safety validation for timestamp
    if (!timestamp) {
      return '';
    }
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
      
      // Default options for time formatting
      const defaultOptions = {
        hour: '2-digit',
        minute: '2-digit'
      };
      
      const formatOptions = options || defaultOptions;
      
      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    } catch (error) {
      console.error('Error formatting time:', error, 'Timestamp:', timestamp);
      return '';
    }
  }

  /**
   * Safely formats date for display (alias for formatTime)
   * @param {string|number|Date} timestamp - The timestamp to format
   * @param {string} locale - Locale for formatting (default: 'ar-DZ')
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted time or empty string if invalid
   */
  static formatSafeDate(timestamp, locale = 'ar-DZ', options = null) {
    return this.formatTime(timestamp, locale, options);
  }

  /**
   * Safely formats date for display
   * @param {string|number|Date} timestamp - The timestamp to format
   * @param {string} locale - Locale for formatting (default: 'ar-DZ')
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted date or empty string if invalid
   */
  static formatDate(timestamp, locale = 'ar-DZ', options = null) {
    // Safety validation for timestamp
    if (!timestamp) {
      return '';
    }
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
      
      // Default options for date formatting
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      const formatOptions = options || defaultOptions;
      
      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, 'Timestamp:', timestamp);
      return '';
    }
  }

  /**
   * Safely formats datetime for display
   * @param {string|number|Date} timestamp - The timestamp to format
   * @param {string} locale - Locale for formatting (default: 'ar-DZ')
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} Formatted datetime or empty string if invalid
   */
  static formatDateTime(timestamp, locale = 'ar-DZ', options = null) {
    // Safety validation for timestamp
    if (!timestamp) {
      return '';
    }
    
    try {
      const date = new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp:', timestamp);
        return '';
      }
      
      // Default options for datetime formatting
      const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      
      const formatOptions = options || defaultOptions;
      
      return new Intl.DateTimeFormat(locale, formatOptions).format(date);
    } catch (error) {
      console.error('Error formatting datetime:', error, 'Timestamp:', timestamp);
      return '';
    }
  }

  /**
   * Gets relative time (e.g., "2 hours ago", "منذ ساعتين")
   * @param {string|number|Date} timestamp - The timestamp
   * @param {string} locale - Locale for formatting (default: 'ar-DZ')
   * @returns {string} Relative time or empty string if invalid
   */
  static getRelativeTime(timestamp, locale = 'ar-DZ') {
    if (!timestamp) {
      return '';
    }
    
    try {
      const date = new Date(timestamp);
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid timestamp for relative time:', timestamp);
        return '';
      }
      
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
      const now = new Date();
      const diffInSeconds = Math.round((now - date) / 1000);
      
      // Handle different time ranges
      if (Math.abs(diffInSeconds) < 60) {
        return rtf.format(diffInSeconds, 'second');
      } else if (Math.abs(diffInSeconds) < 3600) {
        return rtf.format(Math.round(diffInSeconds / 60), 'minute');
      } else if (Math.abs(diffInSeconds) < 86400) {
        return rtf.format(Math.round(diffInSeconds / 3600), 'hour');
      } else {
        return rtf.format(Math.round(diffInSeconds / 86400), 'day');
      }
    } catch (error) {
      console.error('Error getting relative time:', error, 'Timestamp:', timestamp);
      return '';
    }
  }

  /**
   * Converts backend timestamp to safe format
   * @param {any} backendTimestamp - Timestamp from backend
   * @returns {string|null} Safe ISO timestamp or null
   */
  static normalizeBackendTimestamp(backendTimestamp) {
    if (!backendTimestamp) {
      return null;
    }
    
    try {
      // If it's already a valid ISO string, return it
      if (typeof backendTimestamp === 'string' && backendTimestamp.includes('T')) {
        const date = new Date(backendTimestamp);
        if (!isNaN(date.getTime())) {
          return backendTimestamp;
        }
      }
      
      // Try to create date from various formats
      const date = new Date(backendTimestamp);
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
      
      console.warn('Could not normalize backend timestamp:', backendTimestamp);
      return null;
    } catch (error) {
      console.error('Error normalizing backend timestamp:', error);
      return null;
    }
  }
}

// Make available globally for debugging
window.DateUtils = DateUtils;

export default DateUtils;
