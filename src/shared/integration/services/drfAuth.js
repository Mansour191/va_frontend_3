// Updated DRF Auth Service - Now uses GraphQL (Apollo Client) as primary
import GraphQLAuthService from './authGraphQL.js';
import apiErrorLogger from '@/shared/services/http/ApiErrorLogger.js';

// Keep the old mutations for backward compatibility during transition
export const DRF_LOGIN_MUTATION = GraphQLAuthService.LOGIN_MUTATION;
export const DRF_REGISTER_MUTATION = GraphQLAuthService.REGISTER_MUTATION;
export const DRF_UPDATE_PROFILE_MUTATION = GraphQLAuthService.UPDATE_PROFILE_MUTATION;
export const DRF_ME_QUERY = GraphQLAuthService.ME_QUERY;
export const DRF_MY_PROFILE_QUERY = GraphQLAuthService.MY_PROFILE_QUERY;

// GraphQL-only authentication service - REST API endpoints removed
// All authentication operations now use GraphQL mutations and queries

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
  
  // Password management using GraphQL
  static async changePassword(oldPassword, newPassword, newPasswordConfirm) {
    return GraphQLAuthService.changePassword(oldPassword, newPassword, newPasswordConfirm);
  }
  
  static async resetPassword(email) {
    return GraphQLAuthService.resetPassword(email);
  }
  
  static async confirmResetPassword(token, newPassword, newPasswordConfirm) {
    return GraphQLAuthService.confirmResetPassword(token, newPassword, newPasswordConfirm);
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
