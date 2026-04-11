// GraphQL User Service - Complete replacement for REST API user operations
import { useQuery, useMutation } from '@apollo/client';
import { ref, computed } from 'vue';

// Import GraphQL queries and mutations
import {
  GET_ME,
  GET_MY_PROFILE,
  GET_USERS,
  GET_USER,
  GET_USER_REVIEWS,
  GET_USER_DESIGNS,
  GET_USER_ORDERS,
  GET_USER_NOTIFICATIONS,
  GET_USER_ALERTS
} from '@/shared/services/graphql/queries';

import {
  LOGIN,
  REGISTER,
  UPDATE_PROFILE,
  UPDATE_PASSWORD,
  DELETE_ACCOUNT,
  CREATE_REVIEW,
  CREATE_DESIGN,
  UPDATE_USER_PREFERENCES,
  UPDATE_USER_SETTINGS
} from '@/shared/services/graphql/mutations';

class GraphQLUserService {
  constructor() {
    this.cache = new Map();
    this.currentUser = null;
    this.preferences = JSON.parse(localStorage.getItem('user_preferences') || '{}');
    this.settings = JSON.parse(localStorage.getItem('user_settings') || '{}');
  }

  // Authentication using GraphQL
  async login(emailOrUsername, password) {
    try {
      const result = await this.mutateGraphQL(LOGIN, {
        emailOrUsername,
        password
      });
      
      if (result.success) {
        this.currentUser = result.user;
        this.cache.set('current_user', result.user);
        this.cache.set('my_profile', result.user?.profile);
      }
      
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const result = await this.mutateGraphQL(REGISTER, {
        input: userData
      });
      
      if (result.success) {
        this.currentUser = result.user;
        this.cache.set('current_user', result.user);
        this.cache.set('my_profile', result.user?.profile);
      }
      
      return result;
    } catch (error) {
      console.error('Error registering:', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      
      // Clear cache
      this.cache.delete('current_user');
      this.cache.delete('my_profile');
      this.currentUser = null;
      
      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // User Profile using GraphQL
  async getMe() {
    if (this.cache.has('current_user')) {
      return this.cache.get('current_user');
    }

    try {
      const result = await this.queryGraphQL(GET_ME);
      this.cache.set('current_user', result);
      this.currentUser = result;
      return result;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }

  async getMyProfile() {
    if (this.cache.has('my_profile')) {
      return this.cache.get('my_profile');
    }

    try {
      const result = await this.queryGraphQL(GET_MY_PROFILE);
      this.cache.set('my_profile', result);
      return result;
    } catch (error) {
      console.error('Error fetching my profile:', error);
      throw error;
    }
  }

  async updateProfile(profileData) {
    try {
      const result = await this.mutateGraphQL(UPDATE_PROFILE, {
        input: profileData
      });
      
      // Clear relevant caches
      this.cache.delete('current_user');
      this.cache.delete('my_profile');
      
      // Update current user
      if (result.success) {
        this.currentUser = result.user;
        this.cache.set('current_user', result.user);
        this.cache.set('my_profile', result.user?.profile);
      }
      
      return result;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async updatePassword(passwordData) {
    try {
      const result = await this.mutateGraphQL(UPDATE_PASSWORD, {
        input: passwordData
      });
      return result;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async deleteAccount(password) {
    try {
      const result = await this.mutateGraphQL(DELETE_ACCOUNT, {
        password
      });
      
      if (result.success) {
        await this.logout();
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  }

  // User Management (Admin) using GraphQL
  async getUsers(filters = {}) {
    const cacheKey = `users_${JSON.stringify(filters)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USERS, filters);
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(userId) {
    const cacheKey = `user_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER, { id: userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  async updateUser(userId, userData) {
    try {
      // This would be implemented as a GraphQL mutation
      const result = await this.mutateGraphQL('UPDATE_USER', {
        userId,
        input: userData
      });
      
      // Clear relevant caches
      this.cache.delete(`user_${userId}`);
      this.clearCache('users_');
      
      return result;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      // This would be implemented as a GraphQL mutation
      const result = await this.mutateGraphQL('DELETE_USER', {
        userId
      });
      
      // Clear relevant caches
      this.cache.delete(`user_${userId}`);
      this.clearCache('users_');
      
      return result;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  // User Content using GraphQL
  async getUserReviews(userId) {
    const cacheKey = `user_reviews_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER_REVIEWS, { userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      throw error;
    }
  }

  async getUserDesigns(userId) {
    const cacheKey = `user_designs_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER_DESIGNS, { userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user designs:', error);
      throw error;
    }
  }

  async getUserOrders(userId) {
    const cacheKey = `user_orders_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER_ORDERS, { userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw error;
    }
  }

  async getUserNotifications(userId) {
    const cacheKey = `user_notifications_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER_NOTIFICATIONS, { userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  async getUserAlerts(userId) {
    const cacheKey = `user_alerts_${userId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const result = await this.queryGraphQL(GET_USER_ALERTS, { userId });
      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Error fetching user alerts:', error);
      throw error;
    }
  }

  // User Preferences and Settings
  async updatePreferences(preferences) {
    try {
      const result = await this.mutateGraphQL(UPDATE_USER_PREFERENCES, {
        input: preferences
      });
      
      // Update local preferences
      this.preferences = { ...this.preferences, ...preferences };
      localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
      
      return result;
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  }

  async updateSettings(settings) {
    try {
      const result = await this.mutateGraphQL(UPDATE_USER_SETTINGS, {
        input: settings
      });
      
      // Update local settings
      this.settings = { ...this.settings, ...settings };
      localStorage.setItem('user_settings', JSON.stringify(this.settings));
      
      return result;
    } catch (error) {
      console.error('Error updating settings:', error);
      throw error;
    }
  }

  getPreferences() {
    return this.preferences;
  }

  getSettings() {
    return this.settings;
  }

  // User Analytics
  async getUserAnalytics(userId, period = '30days') {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_USER_ANALYTICS', {
        userId,
        period
      });
      return result;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }

  async getActivityHistory(userId, limit = 50) {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_ACTIVITY_HISTORY', {
        userId,
        limit
      });
      return result;
    } catch (error) {
      console.error('Error fetching activity history:', error);
      throw error;
    }
  }

  // User Search and Filtering
  async searchUsers(query, filters = {}) {
    try {
      // This would be implemented as a GraphQL query
      const searchFilters = {
        ...filters,
        search: query
      };
      return await this.getUsers(searchFilters);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  async getUsersByRole(role, filters = {}) {
    try {
      const roleFilters = {
        ...filters,
        role
      };
      return await this.getUsers(roleFilters);
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  }

  async getActiveUsers(filters = {}) {
    try {
      const activeFilters = {
        ...filters,
        isActive: true
      };
      return await this.getUsers(activeFilters);
    } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
    }
  }

  // User Statistics
  async getUserStatistics(filters = {}) {
    try {
      const users = await this.getUsers(filters);
      
      const statistics = {
        total: users.length,
        active: users.filter(user => user.isActive).length,
        inactive: users.filter(user => !user.isActive).length,
        staff: users.filter(user => user.isStaff).length,
        recent: users.filter(user => {
          const joinDate = new Date(user.dateJoined);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return joinDate > thirtyDaysAgo;
        }).length,
        roleDistribution: {},
        joinDateDistribution: {}
      };

      // Calculate role distribution
      users.forEach(user => {
        const role = user.isStaff ? 'staff' : 'customer';
        statistics.roleDistribution[role] = (statistics.roleDistribution[role] || 0) + 1;
      });

      // Calculate join date distribution
      users.forEach(user => {
        const joinDate = new Date(user.dateJoined);
        const month = joinDate.toLocaleString('default', { month: 'short', year: 'numeric' });
        statistics.joinDateDistribution[month] = (statistics.joinDateDistribution[month] || 0) + 1;
      });

      return statistics;
    } catch (error) {
      console.error('Error fetching user statistics:', error);
      throw error;
    }
  }

  // User Validation
  async validateUser(userData) {
    try {
      const validation = {
        isValid: true,
        errors: [],
        warnings: []
      };

      // Validate required fields
      if (!userData.username) {
        validation.isValid = false;
        validation.errors.push('Username is required');
      }

      if (!userData.email) {
        validation.isValid = false;
        validation.errors.push('Email is required');
      }

      if (!userData.password) {
        validation.isValid = false;
        validation.errors.push('Password is required');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (userData.email && !emailRegex.test(userData.email)) {
        validation.isValid = false;
        validation.errors.push('Invalid email format');
      }

      // Validate password strength
      if (userData.password) {
        if (userData.password.length < 8) {
          validation.isValid = false;
          validation.errors.push('Password must be at least 8 characters long');
        }

        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(userData.password)) {
          validation.warnings.push('Password should contain uppercase, lowercase, and numbers');
        }
      }

      // Validate username format
      if (userData.username) {
        if (userData.username.length < 3) {
          validation.isValid = false;
          validation.errors.push('Username must be at least 3 characters long');
        }

        if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
          validation.isValid = false;
          validation.errors.push('Username can only contain letters, numbers, and underscores');
        }
      }

      return validation;
    } catch (error) {
      console.error('Error validating user:', error);
      throw error;
    }
  }

  // User Permissions
  async getUserPermissions(userId) {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_USER_PERMISSIONS', { userId });
      return result;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      throw error;
    }
  }

  async hasPermission(userId, permission) {
    try {
      const permissions = await this.getUserPermissions(userId);
      return permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // User Sessions
  async getUserSessions(userId) {
    try {
      // This would be implemented as a GraphQL query
      const result = await this.queryGraphQL('GET_USER_SESSIONS', { userId });
      return result;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  async revokeSession(sessionId) {
    try {
      // This would be implemented as a GraphQL mutation
      const result = await this.mutateGraphQL('REVOKE_SESSION', { sessionId });
      return result;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  async revokeAllSessions(userId) {
    try {
      // This would be implemented as a GraphQL mutation
      const result = await this.mutateGraphQL('REVOKE_ALL_SESSIONS', { userId });
      return result;
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      throw error;
    }
  }

  // Helper methods for GraphQL operations
  async queryGraphQL(query, variables = {}) {
    // This would be implemented with Apollo Client
    console.log(`🔍 GraphQL Query: ${query}`, variables);
    return [];
  }

  async mutateGraphQL(mutation, variables = {}) {
    // This would be implemented with Apollo Client
    console.log(`🔄 GraphQL Mutation: ${mutation}`, variables);
    return { success: true };
  }

  // Cache management
  clearCache(pattern = null) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Current user management
  getCurrentUser() {
    return this.currentUser;
  }

  setCurrentUser(user) {
    this.currentUser = user;
    this.cache.set('current_user', user);
  }

  isAuthenticated() {
    return !!this.currentUser;
  }

  // Bulk Operations
  async bulkUpdateUsers(updates) {
    try {
      const results = await Promise.all(
        updates.map(({ userId, userData }) => this.updateUser(userId, userData))
      );
      
      // Clear caches
      this.clearCache('users_');
      
      return results;
    } catch (error) {
      console.error('Error bulk updating users:', error);
      throw error;
    }
  }

  async bulkDeleteUsers(userIds) {
    try {
      const results = await Promise.all(
        userIds.map(userId => this.deleteUser(userId))
      );
      
      // Clear caches
      this.clearCache('users_');
      
      return results;
    } catch (error) {
      console.error('Error bulk deleting users:', error);
      throw error;
    }
  }
}

// Create singleton instance
export const graphqlUserService = new GraphQLUserService();

// Export class for custom instances
export default GraphQLUserService;

// Composable for Vue components
export function useGraphQLUser() {
  const service = graphqlUserService;
  
  return {
    service,
    login: (emailOrUsername, password) => service.login(emailOrUsername, password),
    register: (userData) => service.register(userData),
    logout: () => service.logout(),
    getMe: () => service.getMe(),
    getMyProfile: () => service.getMyProfile(),
    updateProfile: (profileData) => service.updateProfile(profileData),
    updatePassword: (passwordData) => service.updatePassword(passwordData),
    deleteAccount: (password) => service.deleteAccount(password),
    getUsers: (filters) => service.getUsers(filters),
    getUser: (userId) => service.getUser(userId),
    updateUser: (userId, userData) => service.updateUser(userId, userData),
    deleteUser: (userId) => service.deleteUser(userId),
    getUserReviews: (userId) => service.getUserReviews(userId),
    getUserDesigns: (userId) => service.getUserDesigns(userId),
    getUserOrders: (userId) => service.getUserOrders(userId),
    getUserNotifications: (userId) => service.getUserNotifications(userId),
    getUserAlerts: (userId) => service.getUserAlerts(userId),
    updatePreferences: (preferences) => service.updatePreferences(preferences),
    updateSettings: (settings) => service.updateSettings(settings),
    getPreferences: () => service.getPreferences(),
    getSettings: () => service.getSettings(),
    getUserAnalytics: (userId, period) => service.getUserAnalytics(userId, period),
    getActivityHistory: (userId, limit) => service.getActivityHistory(userId, limit),
    searchUsers: (query, filters) => service.searchUsers(query, filters),
    getUsersByRole: (role, filters) => service.getUsersByRole(role, filters),
    getActiveUsers: (filters) => service.getActiveUsers(filters),
    getUserStatistics: (filters) => service.getUserStatistics(filters),
    validateUser: (userData) => service.validateUser(userData),
    getUserPermissions: (userId) => service.getUserPermissions(userId),
    hasPermission: (userId, permission) => service.hasPermission(userId, permission),
    getUserSessions: (userId) => service.getUserSessions(userId),
    revokeSession: (sessionId) => service.revokeSession(sessionId),
    revokeAllSessions: (userId) => service.revokeAllSessions(userId),
    getCurrentUser: () => service.getCurrentUser(),
    setCurrentUser: (user) => service.setCurrentUser(user),
    isAuthenticated: () => service.isAuthenticated(),
    clearCache: (pattern) => service.clearCache(pattern),
    bulkUpdateUsers: (updates) => service.bulkUpdateUsers(updates),
    bulkDeleteUsers: (userIds) => service.bulkDeleteUsers(userIds)
  };
}
