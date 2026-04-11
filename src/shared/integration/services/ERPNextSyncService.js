// ERPNext Sync Service - Automated synchronization monitoring
// Handles sync status, notifications, and manual sync operations

import { ref, computed, reactive } from 'vue';
import { useQuery, useMutation } from '@apollo/client';
import { useGraphQLStreaming } from '@/shared/services/graphql-modules/GraphQLStreamingService';

// GraphQL queries and mutations for sync operations
import {
  ERPNEXT_SYNC_STATUS_SUBSCRIPTION
} from '@/shared/services/graphql/subscriptions';

class ERPNextSyncService {
  constructor() {
    this.syncStatus = reactive({
      isRunning: false,
      lastSync: null,
      recordsSynced: 0,
      status: 'unknown',
      message: '',
      errorMessage: null,
      statistics: {
        totalSyncs: 0,
        successfulSyncs: 0,
        failedSyncs: 0,
        successRate: 0
      }
    });
    
    this.notifications = ref([]);
    this.subscription = null;
    this.streamingService = useGraphQLStreaming();
    
    // Initialize streaming subscription
    this.initializeSubscription();
  }

  // Initialize real-time sync status subscription
  async initializeSubscription() {
    try {
      this.subscription = await this.streamingService.subscribeToERPNextSyncStatus({
        onNext: (data) => {
          this.updateSyncStatus(data);
        },
        onError: (error) => {
          console.error('ERPNext sync subscription error:', error);
          this.syncStatus.errorMessage = error.error;
        }
      });
      
      console.log('🔄 ERPNext sync subscription initialized');
    } catch (error) {
      console.error('Failed to initialize ERPNext sync subscription:', error);
    }
  }

  // Update sync status from subscription data
  updateSyncStatus(data) {
    this.syncStatus.status = data.status;
    this.syncStatus.message = data.message;
    this.syncStatus.recordsSynced = data.recordsSynced;
    this.syncStatus.errorMessage = data.errorMessage;
    this.syncStatus.lastSync = data.timestamp;
    this.syncStatus.isRunning = data.status === 'running';
    
    console.log('📊 ERPNext sync status updated:', data);
  }

  // Get current sync status
  getSyncStatus() {
    return computed(() => ({
      ...this.syncStatus,
      isHealthy: this.syncStatus.status === 'success' || this.syncStatus.status === 'unknown',
      needsAttention: this.syncStatus.status === 'failed' || this.syncStatus.status === 'partial_success',
      lastSyncFormatted: this.formatDate(this.syncStatus.lastSync),
      statusColor: this.getStatusColor(this.syncStatus.status),
      statusIcon: this.getStatusIcon(this.syncStatus.status)
    }));
  }

  // Get sync statistics
  getSyncStatistics() {
    return computed(() => this.syncStatus.statistics);
  }

  // Manual sync trigger (calls backend management command)
  async triggerManualSync(syncType = 'all', dryRun = false) {
    try {
      console.log(`🔄 Triggering manual sync: ${syncType}, dry-run: ${dryRun}`);
      
      // This would call a GraphQL mutation that triggers the management command
      // For now, we'll simulate the call
      const response = await fetch('/api/management/run_sync/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken(),
        },
        body: JSON.stringify({
          type: syncType,
          dry_run: dryRun,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Manual sync triggered successfully');
        return {
          success: true,
          message: result.message,
          syncId: result.sync_id
        };
      } else {
        console.error('❌ Manual sync failed:', result.message);
        return {
          success: false,
          message: result.message,
          error: result.error
        };
      }
      
    } catch (error) {
      console.error('❌ Failed to trigger manual sync:', error);
      return {
        success: false,
        message: 'Failed to trigger manual sync',
        error: error.message
      };
    }
  }

  // Get sync history
  async getSyncHistory(limit = 10) {
    try {
      const response = await fetch('/api/erpnext/sync-history/');
      const history = await response.json();
      
      return history.slice(0, limit);
    } catch (error) {
      console.error('Failed to get sync history:', error);
      return [];
    }
  }

  // Get detailed sync report
  async getSyncReport(syncId) {
    try {
      const response = await fetch(`/api/erpnext/sync-report/${syncId}/`);
      const report = await response.json();
      
      return report;
    } catch (error) {
      console.error('Failed to get sync report:', error);
      return null;
    }
  }

  // Schedule automatic sync (if allowed)
  async scheduleAutoSync(interval = 'hourly') {
    try {
      const response = await fetch('/api/erpnext/schedule-sync/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken(),
        },
        body: JSON.stringify({
          interval,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Auto-sync scheduled successfully');
        return result;
      } else {
        console.error('❌ Failed to schedule auto-sync:', result.message);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Failed to schedule auto-sync:', error);
      return {
        success: false,
        message: 'Failed to schedule auto-sync',
        error: error.message
      };
    }
  }

  // Get sync configuration
  async getSyncConfiguration() {
    try {
      const response = await fetch('/api/erpnext/sync-config/');
      const config = await response.json();
      
      return config;
    } catch (error) {
      console.error('Failed to get sync configuration:', error);
      return null;
    }
  }

  // Update sync configuration
  async updateSyncConfiguration(config) {
    try {
      const response = await fetch('/api/erpnext/sync-config/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken(),
        },
        body: JSON.stringify(config),
      });
      
      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Sync configuration updated successfully');
        return result;
      } else {
        console.error('❌ Failed to update sync configuration:', result.message);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Failed to update sync configuration:', error);
      return {
        success: false,
        message: 'Failed to update sync configuration',
        error: error.message
      };
    }
  }

  // Test ERPNext connection
  async testConnection() {
    try {
      const response = await fetch('/api/erpnext/test-connection/');
      const result = await response.json();
      
      return result;
    } catch (error) {
      console.error('Failed to test ERPNext connection:', error);
      return {
        success: false,
        message: 'Connection test failed',
        error: error.message
      };
    }
  }

  // Get sync metrics
  getSyncMetrics() {
    return computed(() => {
      const stats = this.syncStatus.statistics;
      
      return {
        totalSyncs: stats.totalSyncs,
        successRate: stats.successRate,
        averageRecordsPerSync: stats.totalSyncs > 0 ? 
          Math.round(this.syncStatus.recordsSynced / stats.totalSyncs) : 0,
        lastSyncTime: this.syncStatus.lastSync,
        timeSinceLastSync: this.getTimeSinceLastSync(),
        healthScore: this.calculateHealthScore()
      };
    });
  }

  // Utility methods
  formatDate(dateString) {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  getStatusColor(status) {
    const colors = {
      'success': 'green',
      'failed': 'red',
      'running': 'blue',
      'partial_success': 'orange',
      'unknown': 'gray',
      'never_synced': 'gray'
    };
    
    return colors[status] || 'gray';
  }

  getStatusIcon(status) {
    const icons = {
      'success': '✅',
      'failed': '❌',
      'running': '🔄',
      'partial_success': '⚠️',
      'unknown': '❓',
      'never_synced': '⏸️'
    };
    
    return icons[status] || '❓';
  }

  getTimeSinceLastSync() {
    if (!this.syncStatus.lastSync) return null;
    
    const now = new Date();
    const lastSync = new Date(this.syncStatus.lastSync);
    const diffMs = now - lastSync;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Less than 1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  }

  calculateHealthScore() {
    const stats = this.syncStatus.statistics;
    
    if (stats.totalSyncs === 0) return 0;
    
    const successRate = stats.successRate;
    const recencyScore = this.getRecencyScore();
    
    return Math.round((successRate * 0.7 + recencyScore * 0.3));
  }

  getRecencyScore() {
    if (!this.syncStatus.lastSync) return 0;
    
    const now = new Date();
    const lastSync = new Date(this.syncStatus.lastSync);
    const diffHours = (now - lastSync) / (1000 * 60 * 60);
    
    if (diffHours < 2) return 100;
    if (diffHours < 6) return 80;
    if (diffHours < 24) return 60;
    if (diffHours < 48) return 40;
    return 20;
  }

  getCSRFToken() {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='));
    
    return cookie ? cookie.split('=')[1] : '';
  }

  // Cleanup
  cleanup() {
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }
  }
}

// Create singleton instance
export const erpNextSyncService = new ERPNextSyncService();

// Export class for custom instances
export default ERPNextSyncService;

// Composable for Vue components
export function useERPNextSync() {
  const service = erpNextSyncService;
  
  return {
    syncStatus: service.getSyncStatus(),
    syncStatistics: service.getSyncStatistics(),
    syncMetrics: service.getSyncMetrics(),
    triggerManualSync: (syncType, dryRun) => service.triggerManualSync(syncType, dryRun),
    getSyncHistory: (limit) => service.getSyncHistory(limit),
    getSyncReport: (syncId) => service.getSyncReport(syncId),
    scheduleAutoSync: (interval) => service.scheduleAutoSync(interval),
    getSyncConfiguration: () => service.getSyncConfiguration(),
    updateSyncConfiguration: (config) => service.updateSyncConfiguration(config),
    testConnection: () => service.testConnection(),
    cleanup: () => service.cleanup()
  };
}

console.log('🚀 ERPNext Sync Service loaded');
