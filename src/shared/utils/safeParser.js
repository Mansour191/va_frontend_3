/**
 * Safe JSON Parser Utility
 * Prevents application crashes from corrupted localStorage data
 * 
 * @author vynilart_3 Error Prevention System
 * @version 1.0.0
 */

/**
 * Safely parse JSON data with fallback and error logging
 * @param {string} data - JSON string to parse
 * @param {any} fallback - Default value to return on parse failure (default: null)
 * @param {string} source - Source filename for error logging (optional, auto-detected)
 * @returns {any} Parsed data or fallback value
 */
export function safeJSONParse(data, fallback = null, source = null) {
  // Auto-detect source from stack trace if not provided
  if (!source) {
    try {
      const stack = new Error().stack;
      const match = stack.match(/at.*\((.*):(\d+):(\d+)\)/);
      if (match && match[1]) {
        source = match[1].split('/').pop(); // Get filename only
      }
    } catch (e) {
      source = 'unknown';
    }
  }

  // Handle null/undefined input
  if (data === null || data === undefined) {
    console.warn(`[safeParser] ${source}: Received null/undefined data, returning fallback`);
    return fallback;
  }

  // Handle non-string input
  if (typeof data !== 'string') {
    console.warn(`[safeParser] ${source}: Expected string, got ${typeof data}, returning fallback`);
    return fallback;
  }

  // Handle empty string
  if (data.trim() === '') {
    console.warn(`[safeParser] ${source}: Received empty string, returning fallback`);
    return fallback;
  }

  try {
    const result = JSON.parse(data);
    console.log(`[safeParser] ${source}: Successfully parsed JSON`);
    return result;
  } catch (error) {
    console.error(`[safeParser] ${source}: JSON parse failed - ${error.message}`);
    console.error(`[safeParser] ${source}: Problematic data:`, data.substring(0, 200) + (data.length > 200 ? '...' : ''));
    
    // Try to provide more helpful error information
    if (data.includes('undefined')) {
      console.error(`[safeParser] ${source}: Data contains 'undefined' values`);
    }
    if (data.includes('NaN') || data.includes('Infinity')) {
      console.error(`[safeParser] ${source}: Data contains invalid numeric values`);
    }
    if (!data.startsWith('{') && !data.startsWith('[')) {
      console.error(`[safeParser] ${source}: Data doesn't start with JSON object/array`);
    }
    
    return fallback;
  }
}

/**
 * Safely stringify data with fallback and error logging
 * @param {any} data - Data to stringify
 * @param {string} fallback - Fallback string on failure (default: '{}')
 * @param {string} source - Source filename for error logging (optional)
 * @returns {string} JSON string or fallback
 */
export function safeJSONStringify(data, fallback = '{}', source = null) {
  if (!source) {
    try {
      const stack = new Error().stack;
      const match = stack.match(/at.*\((.*):(\d+):(\d+)\)/);
      if (match && match[1]) {
        source = match[1].split('/').pop();
      }
    } catch (e) {
      source = 'unknown';
    }
  }

  try {
    const result = JSON.stringify(data);
    console.log(`[safeParser] ${source}: Successfully stringified JSON`);
    return result;
  } catch (error) {
    console.error(`[safeParser] ${source}: JSON stringify failed - ${error.message}`);
    console.error(`[safeParser] ${source}: Problematic data:`, data);
    return fallback;
  }
}

/**
 * Enhanced localStorage operations with safety
 */
export const safeLocalStorage = {
  /**
   * Safely get and parse item from localStorage
   * @param {string} key - localStorage key
   * @param {any} fallback - Default value if parsing fails (default: null)
   * @returns {any} Parsed data or fallback
   */
  getItem(key, fallback = null) {
    try {
      const data = localStorage.getItem(key);
      return safeJSONParse(data, fallback, `localStorage.getItem(${key})`);
    } catch (error) {
      console.error(`[safeParser] localStorage.getItem(${key}): Access failed - ${error.message}`);
      return fallback;
    }
  },

  /**
   * Safely stringify and set item in localStorage
   * @param {string} key - localStorage key
   * @param {any} value - Value to store
   * @returns {boolean} Success status
   */
  setItem(key, value) {
    try {
      const stringified = safeJSONStringify(value, '{}', `localStorage.setItem(${key})`);
      localStorage.setItem(key, stringified);
      console.log(`[safeParser] localStorage.setItem(${key}): Success`);
      return true;
    } catch (error) {
      console.error(`[safeParser] localStorage.setItem(${key}): Failed - ${error.message}`);
      return false;
    }
  },

  /**
   * Safely remove item from localStorage
   * @param {string} key - localStorage key
   * @returns {boolean} Success status
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      console.log(`[safeParser] localStorage.removeItem(${key}): Success`);
      return true;
    } catch (error) {
      console.error(`[safeParser] localStorage.removeItem(${key}): Failed - ${error.message}`);
      return false;
    }
  },

  /**
   * Safely clear all localStorage
   * @returns {boolean} Success status
   */
  clear() {
    try {
      localStorage.clear();
      console.log(`[safeParser] localStorage.clear(): Success`);
      return true;
    } catch (error) {
      console.error(`[safeParser] localStorage.clear(): Failed - ${error.message}`);
      return false;
    }
  }
};

// Export default for convenience
export default safeJSONParse;
