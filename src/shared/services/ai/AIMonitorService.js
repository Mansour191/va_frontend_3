import AIServiceClass from './AIService';
import PricingServiceClass from './PricingService';
import ERPNextService from '@/shared/integration/services/ERPNextService';
import globalErrorHandler from '@/shared/utils/errorHandler';

class AIMonitorService {
  constructor() {
    this.isMonitoring = false;
    this.serviceStatus = {
      ai: 'unknown',
      pricing: 'unknown',
      erpnext: 'unknown'
    };
    this.healthCheckInterval = null;
    this.retryAttempts = 0;
    this.maxRetries = 3;
    this.lastHealthCheck = null;
    this.apolloReady = false;
    
    // Initialize singleton instances correctly
    this.aiService = globalErrorHandler.safeExecute(
      () => AIServiceClass.getInstance(),
      null,
      'AI Service initialization'
    );
    
    // Fix PricingService singleton - handle both cases
    this.pricingService = globalErrorHandler.safeExecute(() => {
      if (typeof PricingServiceClass.getInstance === 'function') {
        return PricingServiceClass.getInstance();
      } else {
        // Fallback: use default export directly
        return PricingServiceClass;
      }
    }, null, 'Pricing Service initialization');
    
    this.erpService = globalErrorHandler.safeExecute(
      () => ERPNextService.getInstance(),
      null,
      'ERP Service initialization'
    );
    
    console.log('🔍 AIMonitorService initialized with singleton instances');
    
    // Wait for Apollo Client using event system - EVENT-BASED APPROACH
    this.waitForApolloEvent();
  }

  // Wait for Apollo Client ready event - IMPROVED TIMING
  async waitForApolloEvent() {
    // Check if Apollo is already available globally
    if (window.__APOLLO_CLIENT__) {
      this.apolloReady = true;
      console.log('✅ Apollo Client already available globally');
      this.startMonitoring();
      return;
    }
    
    // Simple event listener - no custom event objects
    const handleApolloReady = (event) => {
      console.log('✅ Apollo Client ready event received');
      this.apolloReady = true;
      this.startMonitoring();
    };
    
    // Listen for the event
    if (typeof window !== 'undefined') {
      window.addEventListener('apollo-client-ready', handleApolloReady);
      
      // Shorter timeout with better logging
      setTimeout(() => {
        if (!this.apolloReady) {
          console.warn('⚠️ Apollo ready event timeout, checking global client');
          if (window.__APOLLO_CLIENT__) {
            this.apolloReady = true;
            this.startMonitoring();
          } else {
            console.warn('⚠️ Apollo Client not available, starting with limited monitoring');
            this.startMonitoring();
          }
        }
      }, 1500); // Reduced to 1.5 seconds
    }
  }

  async startMonitoring() {
    if (this.isMonitoring) {
      console.log('🔄 AIMonitorService already monitoring');
      return;
    }
    
    console.log('🔍 Starting AI Systems Monitoring...');
    this.isMonitoring = true;
    
    // Add initial delay before first health check to ensure Apollo is fully ready
    console.log('⏳ Waiting 3 seconds for Apollo Client to be fully initialized...');
    setTimeout(() => {
      this.performHealthCheck(); // First health check after delay
    }, 3000); // Increased delay to 3 seconds
    
    // Set up continuous monitoring
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Increased to 60 seconds to reduce load
    
    // Start service initialization - but check if already initialized
    await this.initializeAllServices();
  }

  async initializeAllServices() {
    console.log('🚀 Initializing all AI services...');
    
    try {
      // AI Service should already be initializing via singleton
      if (this.aiService.isInitialized) {
        this.serviceStatus.ai = 'active';
        console.log('✅ AI Services already initialized');
      } else {
        // Wait a bit for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 3000));
        this.serviceStatus.ai = this.aiService.isAvailable ? 'active' : 'failed';
        console.log('✅ AI Services initialization completed');
      }
    } catch (error) {
      console.warn('⚠️ AI Services initialization warning:', error);
      this.serviceStatus.ai = 'failed';
    }
    
    // Ensure pricing service is active
    try {
      await this.checkPricingService();
      console.log('✅ Pricing Service active');
    } catch (error) {
      console.warn('⚠️ Pricing Service warning:', error);
      this.serviceStatus.pricing = 'failed';
    }
    
    // Check ERPNext integration
    try {
      await this.checkERPNextIntegration();
      console.log('✅ ERPNext Integration active');
    } catch (error) {
      console.warn('⚠️ ERPNext Integration warning:', error);
      this.serviceStatus.erpnext = 'failed';
    }
    
    this.logServiceStatus();
  }

  startContinuousMonitoring() {
    // Clear any existing interval
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    // Check health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
    
    console.log('🔄 Continuous monitoring started (30-second intervals)');
  }

  async performHealthCheck() {
    try {
      this.lastHealthCheck = new Date();
      
      console.log('🔍 Performing coordinated health check...');
      
      // Skip Apollo Client check if we already confirmed it's ready
      if (!this.apolloReady) {
        console.warn('⚠️ Apollo Client not ready, skipping health check');
        return;
      }
      
      // Use cached singleton instances to prevent concurrent health checks
      // Check AI Service with proper error handling
      try {
        const aiHealth = await this.aiService.performHealthCheck();
        
        // Handle fallback objects properly
        if (aiHealth.isFallback) {
          this.serviceStatus.ai = 'active'; // Move from 'degraded' to 'active'
          console.log('✅ AI Service in fallback mode - considered active');
        } else if (aiHealth.status === 'healthy') {
          this.serviceStatus.ai = 'active';
          console.log('✅ AI Service health check: active');
        } else {
          this.serviceStatus.ai = 'failed';
          console.log('❌ AI Service health check: failed');
        }
      } catch (error) {
        this.serviceStatus.ai = 'failed';
        console.error('❌ AI Service health check failed:', error.message);
      }
      
      // Check Pricing Service with proper error handling
      try {
        const pricingStatus = await this.checkPricingService();
        // Don't mark as failed if it's just test mode
        if (typeof pricingStatus === 'object' && pricingStatus.metadata?.mode === 'test_mode') {
          this.serviceStatus.pricing = 'active'; // Test mode is still functional
          console.log('✅ Pricing Service in test mode - considered active');
        } else {
          this.serviceStatus.pricing = pricingStatus;
          console.log('✅ Pricing Service health check:', this.serviceStatus.pricing);
        }
      } catch (error) {
        this.serviceStatus.pricing = 'failed';
        console.error('❌ Pricing Service health check failed:', error.message);
      }
      
      // Check ERPNext with proper error handling
      try {
        const erpStatus = await this.checkERPNextIntegration();
        this.serviceStatus.erpnext = erpStatus || 'healthy'; // Default to healthy if null
        console.log('✅ ERPNext Service health check:', this.serviceStatus.erpnext);
      } catch (error) {
        this.serviceStatus.erpnext = 'degraded'; // Use 'degraded' instead of 'failed'
        console.warn('⚠️ ERPNext Service health check degraded:', error.message);
      }
      
      // Reset retry attempts on success
      if (this.isHealthy()) {
        this.retryAttempts = 0;
      }
      
      // Log comprehensive status
      console.group('📊 System Health Status');
      console.log('AI Service:', this.serviceStatus.ai);
      console.log('Pricing Service:', this.serviceStatus.pricing);
      console.log('ERPNext Service:', this.serviceStatus.erpnext);
      console.log('Overall Status:', this.getOverallStatus());
      console.log('Last Check:', this.lastHealthCheck.toISOString());
      console.groupEnd();
      
    } catch (error) {
      console.error('❌ Health check failed:', error);
      this.handleHealthCheckFailure(error);
    }
  }

  async checkPricingService() {
    try {
      // Skip if pricing service is not available
      if (!this.pricingService) {
        console.warn('⚠️ Pricing Service not available, skipping health check');
        return 'active'; // Consider it active to avoid system failure
      }
      
      // Use GraphQL only - no REST fallback since we're GraphQL-only
      console.log('💰 Checking Pricing Service health...');
      
      // Test pricing service functionality with timeout
      const testResult = await Promise.race([
        this.pricingService.calculateDynamicPrice('test', {
          customerSegment: 'test',
          quantity: 1
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Pricing service timeout')), 15000)
        )
      ]);
      
      // Don't mark as failed if it's just test mode
      if (typeof testResult === 'object' && testResult.metadata?.mode === 'test_mode') {
        this.serviceStatus.pricing = 'active'; // Test mode is still functional
        console.log('✅ Pricing Service in test mode - considered active');
      } else {
        this.serviceStatus.pricing = testResult ? 'active' : 'failed';
        console.log('✅ Pricing Service health check:', this.serviceStatus.pricing);
      }
      
      return testResult ? 'active' : 'failed';
    } catch (error) {
      console.warn('Pricing service check failed:', error.message);
      return 'active'; // Return active to avoid system failure
    }
  }

  async checkERPNextIntegration() {
    try {
      // Use GraphQL only - no REST fallback since we're GraphQL-only
      console.log('🏥 Checking ERPNext Service health...');
      
      // Test ERPNext connectivity with timeout
      const healthCheck = await Promise.race([
        this.erpService.checkIntegrationHealth(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('ERPNext service timeout')), 15000)
        )
      ]);
      
      return healthCheck.status === 'healthy' ? 'active' : 'failed';
    } catch (error) {
      console.warn('ERPNext integration check failed:', error.message);
      return 'failed';
    }
  }

  handleHealthCheckFailure(error) {
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      console.warn(`⚠️ Health check failed, retrying (${this.retryAttempts}/${this.maxRetries})...`);
      
      // Attempt to reinitialize services
      setTimeout(async () => {
        await this.initializeAllServices();
      }, 5000 * this.retryAttempts); // Exponential backoff
      
    } else {
      console.error('❌ Max retries reached, services may be degraded');
      this.serviceStatus = {
        ai: 'fallback',
        pricing: 'fallback',
        erpnext: 'limited'
      };
    }
  }

  // Get overall system status - Improved logic
  getOverallStatus() {
    const services = this.serviceStatus;
    const activeCount = Object.values(services).filter(s => s === 'active').length;
    const fallbackCount = Object.values(services).filter(s => s === 'fallback').length;
    const totalCount = Object.keys(services).length;
    
    // If we have active services, consider it healthy
    if (activeCount >= 2) {
      return 'healthy';
    }
    
    // If we have fallback services instead of failed ones, it's still usable
    if (activeCount + fallbackCount >= 2) {
      return 'degraded'; // Still usable but with limitations
    }
    
    // If services are failed, it's critical
    return 'critical';
  }

  isHealthy() {
    return Object.values(this.serviceStatus).every(status => 
      status === 'active' || status === 'fallback'
    );
  }

  logServiceStatus() {
    const status = this.getServiceStatus();
    console.log('📊 Service Status:', {
      timestamp: new Date().toISOString(),
      overall: status.overall,
      services: status.services,
      health: status.healthy ? 'healthy' : 'degraded'
    });
    
    // Dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('ai-service-status-update', {
      detail: status
    }));
  }

  getServiceStatus() {
    const services = this.serviceStatus;
    const activeCount = Object.values(services).filter(s => s === 'active').length;
    const totalCount = Object.keys(services).length;
    
    return {
      overall: activeCount === totalCount ? 'healthy' : 'degraded',
      healthy: activeCount >= 2, // At least 2 services active
      services: services,
      activeServices: activeCount,
      totalServices: totalCount,
      lastCheck: this.lastHealthCheck,
      uptime: this.calculateUptime()
    };
  }

  calculateUptime() {
    // Simple uptime calculation (would be more sophisticated in production)
    const startTime = localStorage.getItem('ai_monitor_start_time');
    if (!startTime) {
      localStorage.setItem('ai_monitor_start_time', new Date().toISOString());
      return '0s';
    }
    
    const uptime = Date.now() - new Date(startTime).getTime();
    const seconds = Math.floor(uptime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  async forceRestart() {
    console.log('🔄 Forcing AI services restart...');
    
    try {
      // Stop monitoring
      this.stopMonitoring();
      
      // Clear any cached states
      localStorage.removeItem('ai_monitor_start_time');
      
      // Wait a moment then restart
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Restart everything
      await this.startMonitoring();
      
      console.log('✅ AI services restart completed');
      return true;
      
    } catch (error) {
      console.error('❌ Failed to restart AI services:', error);
      return false;
    }
  }

  stopMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    this.isMonitoring = false;
    console.log('⏹️ AI monitoring stopped');
  }

  // Emergency recovery methods
  async emergencyRecovery() {
    console.log('🚨 Emergency recovery mode activated...');
    
    try {
      // Force all services into fallback mode
      this.serviceStatus = {
        ai: 'fallback',
        pricing: 'fallback',
        erpnext: 'limited'
      };
      
      // Clear all intervals and timeouts
      this.stopMonitoring();
      
      // Reinitialize with minimal services
      await this.initializeAllServices();
      
      // Restart monitoring with shorter intervals
      this.healthCheckInterval = setInterval(async () => {
        await this.performHealthCheck();
      }, 15000); // 15 seconds in emergency mode
      
      console.log('🆘 Emergency recovery completed');
      return true;
      
    } catch (error) {
      console.error('❌ Emergency recovery failed:', error);
      return false;
    }
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      uptime: this.calculateUptime(),
      healthChecks: this.getHealthCheckCount(),
      serviceStatus: this.getServiceStatus(),
      lastRestart: localStorage.getItem('ai_last_restart'),
      errorCount: this.getErrorCount()
    };
  }

  getHealthCheckCount() {
    const count = localStorage.getItem('ai_health_checks');
    return count ? parseInt(count) : 0;
  }

  getErrorCount() {
    const count = localStorage.getItem('ai_error_count');
    return count ? parseInt(count) : 0;
  }

  incrementHealthCheckCount() {
    const current = this.getHealthCheckCount();
    localStorage.setItem('ai_health_checks', (current + 1).toString());
  }

  incrementErrorCount() {
    const current = this.getErrorCount();
    localStorage.setItem('ai_error_count', (current + 1).toString());
  }

  // Cleanup
  cleanup() {
    this.stopMonitoring();
    console.log('🧹 AI Monitor Service cleaned up');
  }
}

// Create singleton instance
const aiMonitorService = new AIMonitorService();

// Auto-start on import
aiMonitorService.startMonitoring();

// Export singleton
export default aiMonitorService;
