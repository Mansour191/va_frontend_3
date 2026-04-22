// ERPNext Sync Service - Automated synchronization monitoring
// Handles sync status, notifications, and manual sync operations

import { ref, computed, reactive } from 'vue';
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { useErrorBoundary } from '@/shared/composables/useErrorBoundary';
import { syncLock } from '@/shared/utils/syncLock';

// GraphQL queries and mutations for sync operations
import {
  GET_SYNC_STATUS,
  GET_SYNC_HISTORY,
  GET_SYNC_REPORT,
  GET_SYNC_CONFIGURATION,
  GET_SYNC_METRICS,
  TRIGGER_MANUAL_SYNC,
  SCHEDULE_AUTO_SYNC,
  UPDATE_SYNC_CONFIGURATION,
  CANCEL_SYNC,
  RETRY_FAILED_SYNC,
  RESET_SYNC_STATISTICS,
  TEST_ERPNEXT_CONNECTION,
  SYNC_STATUS_UPDATED,
  SYNC_PROGRESS_UPDATED,
  SYNC_LOGS_UPDATED,
  SYNC_NOTIFICATION
} from '@/integration/graphql/erpnext';

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
    this.subscriptions = new Map();
    this.errorBoundary = useErrorBoundary();
    this.isProcessing = false;
    this.currentOperation = null;
    
    // Initialize GraphQL subscriptions
    this.initializeSubscriptions();
  }

  // Initialize real-time GraphQL subscriptions
  initializeSubscriptions() {
    try {
      // Sync status subscription
      const statusSubscription = useSubscription(SYNC_STATUS_UPDATED, {
        onSubscriptionData: ({ subscriptionData }) => {
          if (subscriptionData.data?.erpNextSyncStatusUpdated) {
            this.updateSyncStatus(subscriptionData.data.erpNextSyncStatusUpdated);
          }
        },
        onError: (error) => {
          this.errorBoundary.handleError(error, 'ERPNext sync status subscription');
        }
      });
      
      // Sync logs subscription
      const logsSubscription = useSubscription(SYNC_LOGS_UPDATED, {
        onSubscriptionData: ({ subscriptionData }) => {
          if (subscriptionData.data?.erpNextSyncLogsUpdated) {
            this.handleSyncLog(subscriptionData.data.erpNextSyncLogsUpdated);
          }
        },
        onError: (error) => {
          this.errorBoundary.handleError(error, 'ERPNext sync logs subscription');
        }
      });
      
      // Sync notifications subscription
      const notificationSubscription = useSubscription(SYNC_NOTIFICATION, {
        onSubscriptionData: ({ subscriptionData }) => {
          if (subscriptionData.data?.erpNextSyncNotification) {
            this.handleNotification(subscriptionData.data.erpNextSyncNotification);
          }
        },
        onError: (error) => {
          this.errorBoundary.handleError(error, 'ERPNext sync notification subscription');
        }
      });
      
      this.subscriptions.set('status', statusSubscription);
      this.subscriptions.set('logs', logsSubscription);
      this.subscriptions.set('notifications', notificationSubscription);
      
      console.log('🔄 ERPNext GraphQL subscriptions initialized');
    } catch (error) {
      this.errorBoundary.handleError(error, 'ERPNext subscription initialization');
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

  // Manual sync trigger using GraphQL mutation with sync lock protection
  async triggerManualSync(syncType = 'all', dryRun = false) {
    const operationName = `manual_sync_${syncType}`;
    
    // Check if already processing
    if (this.isProcessing) {
      console.log(`⚠️ Sync already in progress: ${this.currentOperation}`);
      return {
        success: false,
        message: `Sync already in progress: ${this.currentOperation}`,
        error: new Error('Concurrent sync operation detected')
      };
    }

    // Acquire sync lock
    const lockAcquired = await syncLock.acquireLock(operationName);
    if (!lockAcquired) {
      return {
        success: false,
        message: `Sync operation already locked: ${operationName}`,
        error: new Error('Sync lock acquisition failed')
      };
    }

    return this.errorBoundary.execute(async () => {
      try {
        this.isProcessing = true;
        this.currentOperation = operationName;
        
        console.log(`🔄 Triggering manual sync: ${syncType}, dry-run: ${dryRun}`);
        
        const { mutate } = useMutation(TRIGGER_MANUAL_SYNC);
        
        const result = await mutate({
          variables: {
            syncType,
            dryRun
          },
          errorPolicy: 'all'
        });
        
        if (result.data?.erpNextTriggerManualSync?.success) {
          const syncResult = result.data.erpNextTriggerManualSync;
          console.log('✅ Manual sync triggered successfully');
          return {
            success: true,
            message: syncResult.message,
            syncId: syncResult.syncId,
            estimatedDuration: syncResult.estimatedDuration
          };
        } else {
          const error = result.errors?.[0] || new Error('Unknown error');
          console.error('❌ Manual sync failed:', error);
          return {
            success: false,
            message: error.message,
            error: error
          };
        }
      } finally {
        this.isProcessing = false;
        this.currentOperation = null;
        syncLock.releaseLock(operationName);
      }
    }, 'ERPNext manual sync trigger');
  }

  // Get sync history using GraphQL query
  async getSyncHistory(limit = 10, offset = 0, status = null) {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_SYNC_HISTORY, {
        variables: {
          limit,
          offset,
          status
        },
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.erpNextSyncHistory) {
        return result.value.data.erpNextSyncHistory;
      } else {
        console.warn('No sync history data available');
        return [];
      }
    }, 'ERPNext sync history fetch');
  }

  // Get detailed sync report using GraphQL query
  async getSyncReport(syncId) {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_SYNC_REPORT, {
        variables: {
          syncId
        },
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.erpNextSyncReport) {
        return result.value.data.erpNextSyncReport;
      } else {
        console.warn('No sync report data available for syncId:', syncId);
        return null;
      }
    }, 'ERPNext sync report fetch');
  }

  // Schedule automatic sync using GraphQL mutation
  async scheduleAutoSync(interval = 'hourly', enabled = true) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(SCHEDULE_AUTO_SYNC);
      
      const result = await mutate({
        variables: {
          interval,
          enabled
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.erpNextScheduleAutoSync?.success) {
        const scheduleResult = result.data.erpNextScheduleAutoSync;
        console.log('✅ Auto-sync scheduled successfully');
        return {
          success: true,
          message: scheduleResult.message,
          scheduleId: scheduleResult.scheduleId,
          nextSyncTime: scheduleResult.nextSyncTime
        };
      } else {
        const error = result.errors?.[0] || new Error('Unknown error');
        console.error('❌ Failed to schedule auto-sync:', error);
        return {
          success: false,
          message: error.message,
          error: error
        };
      }
    }, 'ERPNext auto-sync schedule');
  }

  // Get sync configuration using GraphQL query
  async getSyncConfiguration() {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_SYNC_CONFIGURATION, {
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.erpNextSyncConfig) {
        return result.value.data.erpNextSyncConfig;
      } else {
        console.warn('No sync configuration data available');
        return null;
      }
    }, 'ERPNext sync configuration fetch');
  }

  // Update sync configuration using GraphQL mutation
  async updateSyncConfiguration(config) {
    return this.errorBoundary.execute(async () => {
      const { mutate } = useMutation(UPDATE_SYNC_CONFIGURATION);
      
      const result = await mutate({
        variables: {
          config
        },
        errorPolicy: 'all'
      });
      
      if (result.data?.erpNextUpdateSyncConfig?.success) {
        const updateResult = result.data.erpNextUpdateSyncConfig;
        console.log('✅ Sync configuration updated successfully');
        return {
          success: true,
          message: updateResult.message,
          config: updateResult.config
        };
      } else {
        const error = result.errors?.[0] || new Error('Unknown error');
        console.error('❌ Failed to update sync configuration:', error);
        return {
          success: false,
          message: error.message,
          error: error
        };
      }
    }, 'ERPNext sync configuration update');
  }

  // Test ERPNext connection using GraphQL query
  async testConnection() {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(TEST_ERPNEXT_CONNECTION, {
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.erpNextConnectionTest) {
        return result.value.data.erpNextConnectionTest;
      } else {
        console.warn('Connection test failed - no data available');
        return {
          success: false,
          message: 'Connection test failed - no response',
          error: 'No data available'
        };
      }
    }, 'ERPNext connection test');
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

  // Handle sync log updates
  handleSyncLog(logData) {
    console.log('📝 ERPNext sync log:', logData);
    // Could store logs in a reactive array if needed for UI display
  }
  
  // Handle sync notifications
  handleNotification(notificationData) {
    console.log('🔔 ERPNext sync notification:', notificationData);
    this.notifications.value.push(notificationData);
    
    // Keep only last 50 notifications
    if (this.notifications.value.length > 50) {
      this.notifications.value = this.notifications.value.slice(-50);
    }
  }
  
  // Get current sync status with GraphQL fallback
  async getCurrentSyncStatus() {
    return this.errorBoundary.execute(async () => {
      const { result } = useQuery(GET_SYNC_STATUS, {
        errorPolicy: 'all'
      });
      
      if (result.value?.data?.erpNextSyncStatus) {
        this.updateSyncStatus(result.value.data.erpNextSyncStatus);
        return result.value.data.erpNextSyncStatus;
      } else {
        console.warn('No sync status data available');
        return this.syncStatus;
      }
    }, 'ERPNext current sync status fetch');
  }
  
  // Cleanup
  cleanup() {
    this.subscriptions.forEach((subscription, key) => {
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
        console.log(`🔄 Cleaned up ${key} subscription`);
      }
    });
    this.subscriptions.clear();
    this.notifications.value = [];
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
