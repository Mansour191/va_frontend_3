// GraphQL Subscriptions - Real-time queries for streaming data
// These subscriptions enable live updates for AI chat, orders, notifications, and sync status

import { gql } from '@apollo/client';

// AI Chat Streaming Subscription
export const AI_CHAT_STREAM_SUBSCRIPTION = gql`
  subscription AIChatStream($message: String!, $context: String) {
    aiChatStream(message: $message, context: $context) {
      content
      type
      progress
      timestamp
      userId
    }
  }
`;

// Order Updates Subscription
export const ORDER_UPDATES_SUBSCRIPTION = gql`
  subscription OrderUpdates($orderId: ID!) {
    orderUpdates(orderId: $orderId) {
      orderId
      status
      message
      timestamp
      userId
    }
  }
`;

// Notifications Subscription
export const NOTIFICATIONS_SUBSCRIPTION = gql`
  subscription Notifications($userId: ID) {
    notifications(userId: $userId) {
      id
      title
      message
      type
      isRead
      userId
    }
  }
`;

// ERPNext Sync Status Subscription
export const ERPNEXT_SYNC_STATUS_SUBSCRIPTION = gql`
  subscription ERPNextSyncStatus {
    erpnextSyncStatus {
      syncId
      status
      message
      recordsSynced
      timestamp
      errorMessage
    }
  }
`;

// Combined subscription for multiple updates
export const REAL_TIME_UPDATES_SUBSCRIPTION = gql`
  subscription RealTimeUpdates($userId: ID) {
    notifications(userId: $userId) {
      id
      title
      message
      type
      isRead
      userId
    }
  }
`;

console.log('🚀 GraphQL Subscriptions defined for real-time features');
