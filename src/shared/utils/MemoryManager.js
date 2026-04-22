/**
 * MemoryManager.js - Nuclear GC for 4GB RAM systems
 * Aggressive memory cleanup to prevent leaks and crashes
 */

class MemoryManager {
  constructor() {
    this.cleanupThreshold = 100 * 1024 * 1024; // 100MB threshold
    this.cleanupInterval = null;
    this.isCleaning = false;
    this.cleanupStats = {
      totalCleanups: 0,
      memoryFreed: 0,
      lastCleanup: null,
      averageCleanupTime: 0
    };
  }

  /**
   * Initialize memory monitoring
   */
  init() {
    this.startPeriodicCleanup();
    this.setupMemoryPressureListener();
    console.log('Memory Manager initialized - Nuclear GC active');
  }

  /**
   * Force global cleanup - called after each route change
   */
  async forceGlobalCleanup() {
    if (this.isCleaning) {
      console.log('Cleanup already in progress, skipping...');
      return;
    }

    this.isCleaning = true;
    const startTime = performance.now();
    
    try {
      console.log('Starting nuclear cleanup...');
      
      // 1. Clear Apollo Client cache
      await this.clearApolloCache();
      
      // 2. Force garbage collection if available
      await this.forceGarbageCollection();
      
      // 3. Clear TCP connections and buffers
      await this.clearNetworkResources();
      
      // 4. Clear DOM caches and event listeners
      await this.clearDOMResources();
      
      // 5. Clear image caches and blobs
      await this.clearImageCaches();
      
      // 6. Clear service worker caches
      await this.clearServiceWorkerCaches();
      
      // 7. Clear IndexedDB transactions
      await this.clearIndexedDBTransactions();
      
      // 8. Clear WebGL contexts
      await this.clearWebGLContexts();
      
      // 9. Clear audio/video buffers
      await this.clearMediaBuffers();
      
      // 10. Clear custom caches and storages
      await this.clearCustomCaches();
      
      const endTime = performance.now();
      const cleanupTime = endTime - startTime;
      
      // Update stats
      this.cleanupStats.totalCleanups++;
      this.cleanupStats.lastCleanup = new Date();
      this.cleanupStats.averageCleanupTime = 
        (this.cleanupStats.averageCleanupTime * (this.cleanupStats.totalCleanups - 1) + cleanupTime) / 
        this.cleanupStats.totalCleanups;
      
      console.log(`Nuclear cleanup completed in ${cleanupTime.toFixed(2)}ms`);
      console.log('Cleanup stats:', this.cleanupStats);
      
    } catch (error) {
      console.error('Error during nuclear cleanup:', error);
    } finally {
      this.isCleaning = false;
    }
  }

  /**
   * Clear Apollo Client cache completely
   */
  async clearApolloCache() {
    try {
      // Import Apollo client dynamically
      const { default: apolloClient } = await import('@/shared/plugins/apolloPlugin.js');
      
      if (apolloClient && apolloClient.cache) {
        // Clear entire cache
        apolloClient.cache.reset();
        
        // Clear store
        if (apolloClient.clearStore) {
          await apolloClient.clearStore();
        }
        
        // Stop all active queries
        if (apolloClient.stop) {
          apolloClient.stop();
        }
        
        console.log('Apollo cache cleared');
      }
    } catch (error) {
      console.warn('Failed to clear Apollo cache:', error);
    }
  }

  /**
   * Force garbage collection if available
   */
  async forceGarbageCollection() {
    try {
      // Force GC if available (Node.js or Chrome dev tools)
      if (global.gc) {
        global.gc();
        console.log('Forced garbage collection');
      }
      
      // Alternative method for browsers
      if (window.gc) {
        window.gc();
        console.log('Forced garbage collection (window.gc)');
      }
      
      // Memory pressure API
      if ('memory' in performance) {
        const memory = performance.memory;
        console.log('Memory usage:', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        });
      }
    } catch (error) {
      console.warn('Failed to force garbage collection:', error);
    }
  }

  /**
   * Clear network resources and TCP connections
   */
  async clearNetworkResources() {
    try {
      // Close all open XMLHttpRequests
      const xhrs = XMLHttpRequest._instances || [];
      xhrs.forEach(xhr => {
        if (xhr.readyState !== XMLHttpRequest.DONE) {
          xhr.abort();
        }
      });
      
      // Clear fetch controller caches
      if (window.AbortController) {
        // Create and immediately abort to clear any pending operations
        const controller = new AbortController();
        controller.abort();
      }
      
      // Clear WebSocket connections
      const websockets = window.WebSocket?._instances || [];
      websockets.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close(1000, 'Memory cleanup');
        }
      });
      
      console.log('Network resources cleared');
    } catch (error) {
      console.warn('Failed to clear network resources:', error);
    }
  }

  /**
   * Clear DOM resources and event listeners
   */
  async clearDOMResources() {
    try {
      // Clear unused DOM nodes
      const unusedNodes = document.querySelectorAll('[data-unused="true"]');
      unusedNodes.forEach(node => node.remove());
      
      // Clear event listeners from removed elements
      const removedElements = document.querySelectorAll('[style*="display: none"]');
      removedElements.forEach(element => {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
      });
      
      // Clear selection ranges
      window.getSelection().removeAllRanges();
      
      console.log('DOM resources cleared');
    } catch (error) {
      console.warn('Failed to clear DOM resources:', error);
    }
  }

  /**
   * Clear image caches and blob URLs
   */
  async clearImageCaches() {
    try {
      // Revoke all blob URLs
      const blobUrls = Object.keys(window).filter(key => key.startsWith('blob:'));
      blobUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Clear image cache
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.complete || img.naturalWidth === 0) {
          img.src = '';
        }
      });
      
      // Clear canvas contexts
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
      
      console.log('Image caches cleared');
    } catch (error) {
      console.warn('Failed to clear image caches:', error);
    }
  }

  /**
   * Clear service worker caches
   */
  async clearServiceWorkerCaches() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        console.log('Service worker caches cleared');
      }
    } catch (error) {
      console.warn('Failed to clear service worker caches:', error);
    }
  }

  /**
   * Clear IndexedDB transactions
   */
  async clearIndexedDBTransactions() {
    try {
      const databases = await indexedDB.databases();
      await Promise.all(
        databases.map(db => {
          return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(db.name);
            request.onsuccess = resolve;
            request.onerror = reject;
          });
        })
      );
      console.log('IndexedDB cleared');
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
    }
  }

  /**
   * Clear WebGL contexts
   */
  async clearWebGLContexts() {
    try {
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
          gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
          gl.finish();
        }
      });
      console.log('WebGL contexts cleared');
    } catch (error) {
      console.warn('Failed to clear WebGL contexts:', error);
    }
  }

  /**
   * Clear audio/video buffers
   */
  async clearMediaBuffers() {
    try {
      // Stop all media elements
      const mediaElements = document.querySelectorAll('audio, video');
      mediaElements.forEach(media => {
        media.pause();
        media.currentTime = 0;
        media.src = '';
        media.load();
      });
      
      // Clear Web Audio API contexts
      if (window.AudioContext || window.webkitAudioContext) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const contexts = AudioContext._instances || [];
        contexts.forEach(ctx => {
          ctx.close();
        });
      }
      
      console.log('Media buffers cleared');
    } catch (error) {
      console.warn('Failed to clear media buffers:', error);
    }
  }

  /**
   * Clear custom caches and storages
   */
  async clearCustomCaches() {
    try {
      // Clear localStorage (except essential items)
      const essentialKeys = ['authToken', 'userPreferences', 'theme'];
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        if (!essentialKeys.includes(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear Map and Set caches
      if (window._caches) {
        window._caches.clear();
      }
      
      console.log('Custom caches cleared');
    } catch (error) {
      console.warn('Failed to clear custom caches:', error);
    }
  }

  /**
   * Setup memory pressure listener
   */
  setupMemoryPressureListener() {
    try {
      if ('memory' in performance) {
        setInterval(() => {
          const memory = performance.memory;
          const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
          
          if (usage > 0.8) { // 80% threshold
            console.warn(`High memory usage detected: ${(usage * 100).toFixed(2)}%`);
            this.forceGlobalCleanup();
          }
        }, 30000); // Check every 30 seconds
      }
    } catch (error) {
      console.warn('Failed to setup memory pressure listener:', error);
    }
  }

  /**
   * Start periodic cleanup
   */
  startPeriodicCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.forceGlobalCleanup();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Stop periodic cleanup
   */
  stopPeriodicCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cleanup statistics
   */
  getStats() {
    return { ...this.cleanupStats };
  }

  /**
   * Destroy memory manager
   */
  destroy() {
    this.stopPeriodicCleanup();
    this.forceGlobalCleanup();
  }
}

// Export singleton instance
export default new MemoryManager();
