// Cache Manager with TTL and Memory Management for 4GB RAM Systems
class CacheManager {
  constructor(apolloClient) {
    this.client = apolloClient
    this.timers = new Map()
    this.memoryThreshold = 50 * 1024 * 1024 // 50MB threshold for 4GB RAM
    this.checkInterval = 30000 // 30 seconds
    this.isMonitoring = false
    
    // TTL Configuration (in milliseconds)
    this.ttlConfig = {
      products: 15 * 60 * 1000,        // 15 minutes
      categories: 30 * 60 * 1000,      // 30 minutes
      users: 30 * 60 * 1000,           // 30 minutes
      orders: 20 * 60 * 1000,           // 20 minutes
      statistics: 5 * 60 * 1000,        // 5 minutes
      gallery: 60 * 60 * 1000,           // 1 hour
      search: 10 * 60 * 1000,           // 10 minutes
      featured: 25 * 60 * 1000,         // 25 minutes
      recent: 15 * 60 * 1000            // 15 minutes
    }
    
    // Route-based eviction mapping
    this.routeEvictionMap = {
      '/shop': ['products', 'categories', 'featured', 'recent'],
      '/dashboard': ['statistics', 'users', 'orders', 'products'],
      '/gallery': ['gallery'],
      '/profile': ['users'],
      '/checkout': ['products', 'categories'],
      '/search': ['search', 'products'],
      '/': ['featured', 'recent', 'products', 'categories']
    }
    
    this.startMemoryMonitoring()
  }
  
  // Set TTL for specific cache key
  setTTL(key, ttl) {
    // Clear existing timer if any
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key))
    }
    
    // Set new eviction timer
    const timer = setTimeout(() => {
      this.evictByKey(key)
    }, ttl)
    
    this.timers.set(key, timer)
    console.log(`🕐 Cache TTL set for ${key}: ${ttl}ms`)
  }
  
  // Evict cache by key pattern
  evictByKey(key) {
    try {
      this.client.cache.evict({ id: key })
      this.client.cache.gc()
      this.timers.delete(key)
      console.log(`🗑️ Cache evicted: ${key}`)
    } catch (error) {
      console.warn(`⚠️ Failed to evict cache ${key}:`, error)
    }
  }
  
  // Evict cache by key pattern (wildcard)
  evictByPattern(pattern) {
    try {
      const cache = this.client.extract()
      const keysToEvict = Object.keys(cache).filter(key => 
        key.includes(pattern) || key.startsWith(pattern)
      )
      
      keysToEvict.forEach(key => {
        this.client.cache.evict({ id: key })
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key))
          this.timers.delete(key)
        }
      })
      
      this.client.cache.gc()
      console.log(`🗑️ Cache evicted by pattern "${pattern}": ${keysToEvict.length} keys`)
    } catch (error) {
      console.warn(`⚠️ Failed to evict cache pattern ${pattern}:`, error)
    }
  }
  
  // Route-based cache eviction
  evictByRoute(route) {
    const keysToEvict = this.routeEvictionMap[route] || []
    
    console.log(`🚗 Route change detected: ${route}`)
    console.log(`🗑️ Evicting cache for: ${keysToEvict.join(', ')}`)
    
    keysToEvict.forEach(key => {
      this.evictByPattern(key)
    })
  }
  
  // Smart eviction based on memory usage
  evictByMemoryPressure() {
    if (!performance.memory) {
      console.warn('⚠️ performance.memory not available')
      return
    }
    
    const usedMemory = performance.memory.usedJSHeapSize
    const totalMemory = performance.memory.totalJSHeapSize
    
    console.log(`📊 Memory usage: ${(usedMemory / 1024 / 1024).toFixed(2)}MB / ${(totalMemory / 1024 / 1024).toFixed(2)}MB`)
    
    if (usedMemory > this.memoryThreshold) {
      console.log(`🚨 Memory threshold exceeded (${(this.memoryThreshold / 1024 / 1024).toFixed(2)}MB), performing emergency eviction`)
      
      // Get current cache state
      const cache = this.client.extract()
      const cacheKeys = Object.keys(cache)
      
      // Sort by timestamp (oldest first) if available
      const sortedKeys = cacheKeys.sort((a, b) => {
        const aTime = cache[a]?.__typename || 0
        const bTime = cache[b]?.__typename || 0
        return aTime - bTime
      })
      
      // Evict oldest 20% of cache
      const keysToEvict = Math.floor(sortedKeys.length * 0.2)
      const evictedKeys = sortedKeys.slice(0, keysToEvict)
      
      evictedKeys.forEach(key => {
        this.client.cache.evict({ id: key })
        if (this.timers.has(key)) {
          clearTimeout(this.timers.get(key))
          this.timers.delete(key)
        }
      })
      
      this.client.cache.gc()
      console.log(`🗑️ Emergency eviction: ${evictedKeys.length} oldest cache entries removed`)
      
      // Force garbage collection if available
      if (window.gc) {
        window.gc()
        console.log('🗑️ Forced garbage collection')
      }
    }
  }
  
  // Start memory monitoring
  startMemoryMonitoring() {
    if (this.isMonitoring) {
      return
    }
    
    this.isMonitoring = true
    this.memoryMonitor = setInterval(() => {
      this.evictByMemoryPressure()
    }, this.checkInterval)
    
    console.log(`🔍 Memory monitoring started (threshold: ${(this.memoryThreshold / 1024 / 1024).toFixed(2)}MB, interval: ${this.checkInterval / 1000}s)`)
  }
  
  // Stop memory monitoring
  stopMemoryMonitoring() {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor)
      this.memoryMonitor = null
      this.isMonitoring = false
      console.log('⏹️ Memory monitoring stopped')
    }
  }
  
  // Set TTL for specific query types
  setTTLForQuery(queryName, variables = {}) {
    const key = `${queryName}:${JSON.stringify(variables)}`
    const ttl = this.ttlConfig[queryName] || this.ttlConfig.products
    
    this.setTTL(key, ttl)
  }
  
  // Clear all cache and timers
  clearAll() {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    
    // Clear Apollo cache
    this.client.clearStore()
    
    console.log('🗑️ All cache cleared')
  }
  
  // Get cache statistics
  getCacheStats() {
    if (!performance.memory) {
      return { error: 'Memory API not available' }
    }
    
    const cache = this.client.extract()
    const cacheSize = Object.keys(cache).length
    const memoryUsage = {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    }
    
    return {
      cacheEntries: cacheSize,
      activeTimers: this.timers.size,
      memoryUsage: {
        used: `${(memoryUsage.used / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memoryUsage.total / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memoryUsage.limit / 1024 / 1024).toFixed(2)}MB`,
        percentage: `${((memoryUsage.used / memoryUsage.limit) * 100).toFixed(2)}%`
      },
      threshold: `${(this.memoryThreshold / 1024 / 1024).toFixed(2)}MB`,
      isMonitoring: this.isMonitoring
    }
  }
  
  // Optimize cache for low-memory devices
  optimizeForLowMemory() {
    console.log('🔧 Optimizing cache for low-memory device (4GB RAM)')
    
    // Reduce TTLs for aggressive eviction
    this.ttlConfig = {
      products: 10 * 60 * 1000,        // 10 minutes (reduced from 15)
      categories: 20 * 60 * 1000,      // 20 minutes (reduced from 30)
      users: 20 * 60 * 1000,           // 20 minutes (reduced from 30)
      orders: 15 * 60 * 1000,           // 15 minutes (reduced from 20)
      statistics: 3 * 60 * 1000,        // 3 minutes (reduced from 5)
      gallery: 30 * 60 * 1000,           // 30 minutes (reduced from 60)
      search: 5 * 60 * 1000,            // 5 minutes (reduced from 10)
      featured: 15 * 60 * 1000,         // 15 minutes (reduced from 25)
      recent: 10 * 60 * 1000            // 10 minutes (reduced from 15)
    }
    
    // Lower memory threshold
    this.memoryThreshold = 35 * 1024 * 1024 // 35MB (reduced from 50MB)
    
    // More frequent monitoring
    this.checkInterval = 15000 // 15 seconds (reduced from 30)
    
    // Restart monitoring with new settings
    this.stopMemoryMonitoring()
    this.startMemoryMonitoring()
    
    console.log('✅ Cache optimization applied for low-memory devices')
  }
  
  // Cleanup method
  destroy() {
    this.stopMemoryMonitoring()
    this.clearAll()
    console.log('🗑️ Cache manager destroyed')
  }
}

export default CacheManager
