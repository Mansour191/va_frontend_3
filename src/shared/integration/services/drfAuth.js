// Updated DRF Auth Service - Now uses GraphQL (Apollo Client) as primary
import GraphQLAuthService from './authGraphQL.js';
import apiErrorLogger from '@/shared/services/http/ApiErrorLogger.js';

// Keep the old mutations for backward compatibility during transition
export const DRF_LOGIN_MUTATION = GraphQLAuthService.LOGIN_MUTATION;
export const DRF_REGISTER_MUTATION = GraphQLAuthService.REGISTER_MUTATION;
export const DRF_UPDATE_PROFILE_MUTATION = GraphQLAuthService.UPDATE_PROFILE_MUTATION;
export const DRF_ME_QUERY = GraphQLAuthService.ME_QUERY;
export const DRF_MY_PROFILE_QUERY = GraphQLAuthService.MY_PROFILE_QUERY;

// REST API endpoints (kept for backward compatibility - will be removed in future)
export const DRF_AUTH_ENDPOINTS = {
  login: '/api/auth/login/',
  register: '/api/auth/register/',
  changePassword: '/api/auth/change-password/',
  resetPassword: '/api/auth/reset-password/',
  confirmResetPassword: '/api/auth/confirm-reset-password/',
  profile: '/api/auth/profile/',
  updateProfile: '/api/auth/profile/update/',
};

// Helper functions for REST API calls (deprecated - will be removed)
export const drfAuthRequest = async (endpoint, data = {}, method = 'POST') => {
  console.warn(`⚠️  DEPRECATED: Using REST API endpoint ${endpoint}. Consider migrating to GraphQL.`);
  
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    let response;
    const url = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}${endpoint}`;
    
    switch (method.toUpperCase()) {
      case 'GET':
        response = await fetch(url, { headers, method: 'GET' });
        break;
      case 'POST':
        response = await fetch(url, { headers, method: 'POST', body: JSON.stringify(data) });
        break;
      case 'PATCH':
        response = await fetch(url, { headers, method: 'PATCH', body: JSON.stringify(data) });
        break;
      case 'PUT':
        response = await fetch(url, { headers, method: 'PUT', body: JSON.stringify(data) });
        break;
      case 'DELETE':
        response = await fetch(url, { headers, method: 'DELETE' });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(responseData.message || responseData.detail || `HTTP ${response.status}`);
    }
    
    return responseData;
    
  } catch (error) {
    apiErrorLogger.logError(error, {
      type: 'DRF_AUTH_ERROR',
      endpoint,
      method,
      data: data ? Object.keys(data) : null,
      timestamp: new Date().toISOString()
    });
    
    throw new Error(error.message || 'Authentication error');
  }
};

// Updated DRF Auth Kit service class - Now uses GraphQL as primary
export class DRFAuthService {
  // Authentication methods now use GraphQL
  static async login(emailOrUsername, password) {
    return GraphQLAuthService.login(emailOrUsername, password);
  }
  
  static async register(userData) {
    return GraphQLAuthService.register(userData);
  }
  
  static async updateProfile(userData) {
    return GraphQLAuthService.updateProfile(userData);
  }
  
  static async getProfile() {
    return GraphQLAuthService.fetchMyProfile();
  }
  
  // Deprecated methods - kept for backward compatibility
  static async changePassword(oldPassword, newPassword, newPasswordConfirm) {
    console.warn('⚠️  DEPRECATED: changePassword via REST. Use GraphQL mutation when available.');
    return drfAuthRequest(DRF_AUTH_ENDPOINTS.changePassword, {
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  }
  
  static async resetPassword(email) {
    console.warn('⚠️  DEPRECATED: resetPassword via REST. Use GraphQL mutation when available.');
    return drfAuthRequest(DRF_AUTH_ENDPOINTS.resetPassword, { email });
  }
  
  static async confirmResetPassword(token, newPassword, newPasswordConfirm) {
    console.warn('⚠️  DEPRECATED: confirmResetPassword via REST. Use GraphQL mutation when available.');
    return drfAuthRequest(DRF_AUTH_ENDPOINTS.confirmResetPassword, {
      token,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    });
  }
  
  // Token management - delegated to GraphQL service
  static setTokens(tokens) {
    GraphQLAuthService.setTokens(tokens);
  }
  
  static getAccessToken() {
    return GraphQLAuthService.getAccessToken();
  }
  
  static getRefreshToken() {
    return GraphQLAuthService.getRefreshToken();
  }
  
  static clearTokens() {
    GraphQLAuthService.clearTokens();
  }
  
  // Token refresh
  static async refreshToken() {
    return GraphQLAuthService.refreshToken();
  }
  
  // Check if token is expired and refresh if needed
  static async ensureValidToken() {
    return GraphQLAuthService.ensureValidToken();
  }
  
  // Logout
  static logout() {
    GraphQLAuthService.logout();
  }
}

// Export default service
export default DRFAuthService;
