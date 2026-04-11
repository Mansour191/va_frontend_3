// GraphQL Streaming Service - Real-time AI Chat and Subscriptions
// Supports WebSocket connections for live data streaming

import { ApolloClient, InMemoryCache, split, HttpLink } from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

// GraphQL Subscriptions
import {
  AI_CHAT_STREAM_SUBSCRIPTION,
  ORDER_UPDATES_SUBSCRIPTION,
  NOTIFICATIONS_SUBSCRIPTION,
  ERPNEXT_SYNC_STATUS_SUBSCRIPTION
} from '@/shared/services/graphql/subscriptions';

class GraphQLStreamingService {
  constructor() {
    this.subscriptionClient = null;
    this.wsLink = null;
    this.apolloClient = null;
    this.activeSubscriptions = new Map();
    this.eventListeners = new Map();
  }

  // Initialize WebSocket connection
  initializeWebSocket() {
    try {
      // Create WebSocket subscription client
      this.subscriptionClient = new SubscriptionClient(
        process.env.VUE_APP_WS_URL || 'ws://127.0.0.1:8000/ws/graphql/subscriptions/',
        {
          reconnect: true,
          connectionParams: () => {
            const token = localStorage.getItem('token');
            return {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            };
          },
          connectionCallback: (error) => {
            if (error) {
              console.error('WebSocket connection error:', error);
              this.emit('connection_error', error);
            } else {
              console.log('🔗 WebSocket connected successfully');
              this.emit('connected');
            }
          },
          disconnected: () => {
            console.log('🔌 WebSocket disconnected');
            this.emit('disconnected');
          },
          reconnected: () => {
            console.log('🔄 WebSocket reconnected');
            this.emit('reconnected');
          },
        }
      );

      // Create WebSocket link
      this.wsLink = new WebSocketLink(this.subscriptionClient);

      // Create HTTP link for regular queries/mutations
      const httpLink = new HttpLink({
        uri: process.env.VUE_APP_GRAPHQL_URL || 'http://127.0.0.1:8000/graphql/',
      });

      // Authentication link
      const authLink = setContext((_, { headers }) => {
        const token = localStorage.getItem('token');
        return {
          headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : '',
          },
        };
      });

      // Error handling link
      const errorLink = onError(({ graphQLErrors, networkError }) => {
        if (graphQLErrors) {
          graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
          );
        }
        if (networkError) {
          console.error(`[Network error]: ${networkError}`);
          this.emit('network_error', networkError);
        }
      });

      // Split link for subscriptions vs queries/mutations
      const splitLink = split(
        ({ query }) => {
          const definition = getMainDefinition(query);
          return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
          );
        },
        this.wsLink,
        httpLink
      );

      // Create Apollo Client with streaming support
      this.apolloClient = new ApolloClient({
        link: authLink.concat(errorLink).concat(splitLink),
        cache: new InMemoryCache({
          typePolicies: {
            Query: {
              fields: {
                // Cache streaming data
                aiChatStream: {
                  merge: false, // Don't merge streaming data
                },
                orderUpdates: {
                  merge: false,
                },
                notifications: {
                  merge: (existing, incoming) => {
                    return incoming || existing;
                  },
                },
              },
            },
          },
        }),
        defaultOptions: {
          watchQuery: {
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
          },
          subscribe: {
            errorPolicy: 'all',
          },
        },
      });

      console.log('🚀 GraphQL Streaming Service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      this.emit('initialization_error', error);
      return false;
    }
  }

  // AI Chat Streaming
  async subscribeToAIChat(message, context = {}, callbacks = {}) {
    try {
      if (!this.apolloClient) {
        throw new Error('Apollo Client not initialized');
      }

      const subscription = this.apolloClient.subscribe({
        query: AI_CHAT_STREAM_SUBSCRIPTION,
        variables: {
          message,
          context: JSON.stringify(context),
        },
      });

      const subscriptionId = `ai_chat_${Date.now()}`;
      
      const subscriptionObserver = subscription.subscribe({
        next: (result) => {
          const data = result.data?.ai_chat_stream;
          if (data) {
            console.log('🤖 AI Chat Stream:', data);
            
            // Emit event for different message types
            this.emit('ai_chat_message', data);
            
            // Call specific callback if provided
            if (callbacks.onNext) {
              callbacks.onNext(data);
            }
            
            // Handle completion
            if (data.type === 'complete') {
              this.emit('ai_chat_complete', data);
              if (callbacks.onComplete) {
                callbacks.onComplete(data);
              }
            } else if (data.type === 'error') {
              this.emit('ai_chat_error', data);
              if (callbacks.onError) {
                callbacks.onError(data);
              }
            }
          }
        },
        error: (error) => {
          console.error('❌ AI Chat subscription error:', error);
          this.emit('ai_chat_error', { error: error.message });
          if (callbacks.onError) {
            callbacks.onError({ error: error.message });
          }
        },
        complete: () => {
          console.log('✅ AI Chat subscription completed');
          this.emit('ai_chat_subscription_complete');
          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
        },
      });

      // Store subscription for cleanup
      this.activeSubscriptions.set(subscriptionId, subscriptionObserver);
      
      return {
        subscriptionId,
        unsubscribe: () => {
          subscriptionObserver.unsubscribe();
          this.activeSubscriptions.delete(subscriptionId);
        },
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to AI Chat:', error);
      throw error;
    }
  }

  // Order Updates Subscription
  async subscribeToOrderUpdates(orderId, callbacks = {}) {
    try {
      if (!this.apolloClient) {
        throw new Error('Apollo Client not initialized');
      }

      const subscription = this.apolloClient.subscribe({
        query: ORDER_UPDATES_SUBSCRIPTION,
        variables: { orderId },
      });

      const subscriptionId = `order_updates_${orderId}_${Date.now()}`;
      
      const subscriptionObserver = subscription.subscribe({
        next: (result) => {
          const data = result.data?.order_updates;
          if (data) {
            console.log('📦 Order Update:', data);
            this.emit('order_update', data);
            
            if (callbacks.onNext) {
              callbacks.onNext(data);
            }
          }
        },
        error: (error) => {
          console.error('❌ Order updates subscription error:', error);
          this.emit('order_updates_error', { error: error.message });
          if (callbacks.onError) {
            callbacks.onError({ error: error.message });
          }
        },
        complete: () => {
          console.log('✅ Order updates subscription completed');
          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
        },
      });

      this.activeSubscriptions.set(subscriptionId, subscriptionObserver);
      
      return {
        subscriptionId,
        orderId,
        unsubscribe: () => {
          subscriptionObserver.unsubscribe();
          this.activeSubscriptions.delete(subscriptionId);
        },
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to order updates:', error);
      throw error;
    }
  }

  // Notifications Subscription
  async subscribeToNotifications(userId = null, callbacks = {}) {
    try {
      if (!this.apolloClient) {
        throw new Error('Apollo Client not initialized');
      }

      const subscription = this.apolloClient.subscribe({
        query: NOTIFICATIONS_SUBSCRIPTION,
        variables: { userId },
      });

      const subscriptionId = `notifications_${userId || 'current'}_${Date.now()}`;
      
      const subscriptionObserver = subscription.subscribe({
        next: (result) => {
          const data = result.data?.notifications;
          if (data) {
            console.log('🔔 Notification:', data);
            this.emit('notification', data);
            
            if (callbacks.onNext) {
              callbacks.onNext(data);
            }
            
            // Show browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(data.title, {
                body: data.message,
                icon: '/favicon.ico',
              });
            }
          }
        },
        error: (error) => {
          console.error('❌ Notifications subscription error:', error);
          this.emit('notifications_error', { error: error.message });
          if (callbacks.onError) {
            callbacks.onError({ error: error.message });
          }
        },
        complete: () => {
          console.log('✅ Notifications subscription completed');
          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
        },
      });

      this.activeSubscriptions.set(subscriptionId, subscriptionObserver);
      
      return {
        subscriptionId,
        unsubscribe: () => {
          subscriptionObserver.unsubscribe();
          this.activeSubscriptions.delete(subscriptionId);
        },
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to notifications:', error);
      throw error;
    }
  }

  // ERPNext Sync Status Subscription
  async subscribeToERPNextSyncStatus(callbacks = {}) {
    try {
      if (!this.apolloClient) {
        throw new Error('Apollo Client not initialized');
      }

      const subscription = this.apolloClient.subscribe({
        query: ERPNEXT_SYNC_STATUS_SUBSCRIPTION,
      });

      const subscriptionId = `erpnext_sync_${Date.now()}`;
      
      const subscriptionObserver = subscription.subscribe({
        next: (result) => {
          const data = result.data?.erpnextSyncStatus;
          if (data) {
            console.log('🔄 ERPNext Sync Status:', data);
            this.emit('erpnext_sync_status', data);
            
            if (callbacks.onNext) {
              callbacks.onNext(data);
            }
          }
        },
        error: (error) => {
          console.error('❌ ERPNext sync subscription error:', error);
          this.emit('erpnext_sync_error', { error: error.message });
          if (callbacks.onError) {
            callbacks.onError({ error: error.message });
          }
        },
        complete: () => {
          console.log('✅ ERPNext sync subscription completed');
          if (callbacks.onComplete) {
            callbacks.onComplete();
          }
        },
      });

      this.activeSubscriptions.set(subscriptionId, subscriptionObserver);
      
      return {
        subscriptionId,
        unsubscribe: () => {
          subscriptionObserver.unsubscribe();
          this.activeSubscriptions.delete(subscriptionId);
        },
      };
    } catch (error) {
      console.error('❌ Failed to subscribe to ERPNext sync status:', error);
      throw error;
    }
  }

  // Event management
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Cleanup all subscriptions
  cleanup() {
    console.log('🧹 Cleaning up all subscriptions...');
    
    // Unsubscribe from all active subscriptions
    this.activeSubscriptions.forEach((subscription, id) => {
      subscription.unsubscribe();
      console.log(`🗑️ Unsubscribed: ${id}`);
    });
    this.activeSubscriptions.clear();
    
    // Close WebSocket connection
    if (this.subscriptionClient) {
      this.subscriptionClient.close();
      this.subscriptionClient = null;
    }
    
    // Clear event listeners
    this.eventListeners.clear();
    
    console.log('✅ Cleanup completed');
  }

  // Get connection status
  getConnectionStatus() {
    return {
      connected: this.subscriptionClient?.status === 1, // 1 = connected
      subscriptionsActive: this.activeSubscriptions.size,
      subscriptionIds: Array.from(this.activeSubscriptions.keys()),
    };
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('🔔 Notification permission:', permission);
      return permission;
    }
    return 'denied';
  }
}

// Create singleton instance
export const graphqlStreamingService = new GraphQLStreamingService();

// Export class for custom instances
export default GraphQLStreamingService;

// Composable for Vue components
export function useGraphQLStreaming() {
  const service = graphqlStreamingService;
  
  return {
    service,
    initializeWebSocket: () => service.initializeWebSocket(),
    subscribeToAIChat: (message, context, callbacks) => service.subscribeToAIChat(message, context, callbacks),
    subscribeToOrderUpdates: (orderId, callbacks) => service.subscribeToOrderUpdates(orderId, callbacks),
    subscribeToNotifications: (userId, callbacks) => service.subscribeToNotifications(userId, callbacks),
    subscribeToERPNextSyncStatus: (callbacks) => service.subscribeToERPNextSyncStatus(callbacks),
    on: (event, callback) => service.on(event, callback),
    off: (event, callback) => service.off(event, callback),
    cleanup: () => service.cleanup(),
    getConnectionStatus: () => service.getConnectionStatus(),
    requestNotificationPermission: () => service.requestNotificationPermission(),
  };
}

console.log('🚀 GraphQL Streaming Service loaded');
