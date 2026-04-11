// GraphQL Authentication Service - Pure Apollo Client Implementation
import { gql } from '@apollo/client/core';
import apolloClient from './apollo.js';

// GraphQL Mutations and Queries for Authentication
export const LOGIN_MUTATION = gql`
  mutation Login($email_or_username: String!, $password: String!) {
    login(emailOrUsername: $email_or_username, password: $password) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        dateJoined
      }
      tokens
      errors
    }
  }
`;

export const TOKEN_AUTH_MUTATION = gql`
  mutation TokenAuth($email_or_username: String!, $password: String!) {
    tokenAuth(emailOrUsername: $email_or_username, password: $password) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        dateJoined
      }
      tokens
      errors
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!, $password_confirm: String!, $first_name: String!, $last_name: String, $phone: String) {
    register(username: $username, email: $email, password: $password, passwordConfirm: $password_confirm, firstName: $first_name, lastName: $last_name, phone: $phone) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        dateJoined
      }
      tokens
      errors
    }
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($first_name: String, $last_name: String, $email: String, $phone: String, $address: String) {
    updateProfile(firstName: $first_name, lastName: $last_name, email: $email, phone: $phone, address: $address) {
      success
      message
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
        dateJoined
      }
      errors
    }
  }
`;

export const ME_QUERY = gql`
  query Me {
    me {
      id
      username
      email
      firstName
      lastName
      isStaff
      dateJoined
    }
  }
`;

export const MY_PROFILE_QUERY = gql`
  query MyProfile {
    myProfile {
      id
      user {
        id
        username
        email
        firstName
        lastName
        isStaff
      }
      phone
      address
      avatar
      createdAt
    }
  }
`;

// GraphQL Authentication Service Class
export class GraphQLAuthService {
  // Token management
  static setTokens(tokens) {
    if (tokens) {
      // Handle both string (access token) and object formats
      const accessToken = typeof tokens === 'string' ? tokens : tokens.access;
      if (accessToken) {
        localStorage.setItem('token', accessToken);
        apolloClient.resetStore(); // Reset cache to update auth state
      }
      
      // Handle refresh token if available
      if (tokens.refresh) {
        localStorage.setItem('refreshToken', tokens.refresh);
      }
    }
  }
  
  static getAccessToken() {
    return localStorage.getItem('token');
  }
  
  static getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }
  
  static clearTokens() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    apolloClient.resetStore(); // Clear cached data
  }
  
  // Authentication methods
  static async login(emailOrUsername, password) {
    console.log('🔐 GraphQL Login Attempt');
    
    try {
      const response = await apolloClient.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          email_or_username: emailOrUsername,
          password,
        },
        errorPolicy: 'all',
      });
      
      const data = response.data?.login;
      
      if (!data?.success) {
        throw new Error(data?.message || 'فشل تسجيل الدخول');
      }
      
      this.setTokens(data.tokens);
      console.log('✅ GraphQL Login Success');
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens,
        message: data.message
      };
    } catch (error) {
      console.error('❌ GraphQL Login Error:', error);
      throw new Error(error.message || 'فشل تسجيل الدخول');
    }
  }
  
  static async register(userData) {
    console.log('🔐 GraphQL Register Attempt');
    
    try {
      const response = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: userData,
        errorPolicy: 'all',
      });
      
      const data = response.data?.register;
      
      if (!data?.success) {
        throw new Error(data?.message || 'فشل إنشاء الحساب');
      }
      
      this.setTokens(data.tokens);
      console.log('✅ GraphQL Register Success');
      
      return {
        success: true,
        user: data.user,
        tokens: data.tokens,
        message: data.message
      };
    } catch (error) {
      console.error('❌ GraphQL Register Error:', error);
      throw new Error(error.message || 'فشل إنشاء الحساب');
    }
  }
  
  static async updateProfile(userData) {
    console.log('🔐 GraphQL Update Profile Attempt');
    
    try {
      const response = await apolloClient.mutate({
        mutation: UPDATE_PROFILE_MUTATION,
        variables: userData,
        errorPolicy: 'all',
      });
      
      const data = response.data?.updateProfile;
      
      if (!data?.success) {
        throw new Error(data?.message || 'فشل تحديث الملف الشخصي');
      }
      
      console.log('✅ GraphQL Update Profile Success');
      
      return {
        success: true,
        user: data.user,
        message: data.message
      };
    } catch (error) {
      console.error('❌ GraphQL Update Profile Error:', error);
      throw new Error(error.message || 'فشل تحديث الملف الشخصي');
    }
  }
  
  static async fetchMe() {
    console.log('🔐 GraphQL Fetch Me Attempt');
    
    try {
      const response = await apolloClient.query({
        query: ME_QUERY,
        errorPolicy: 'all',
      });
      
      const user = response.data?.me;
      
      if (!user) {
        throw new Error('المستخدم غير موجود');
      }
      
      console.log('✅ GraphQL Fetch Me Success');
      return user;
    } catch (error) {
      console.error('❌ GraphQL Fetch Me Error:', error);
      throw new Error(error.message || 'فشل جلب بيانات المستخدم');
    }
  }
  
  static async fetchMyProfile() {
    console.log('🔐 GraphQL Fetch My Profile Attempt');
    
    try {
      const response = await apolloClient.query({
        query: MY_PROFILE_QUERY,
        errorPolicy: 'all',
      });
      
      const profile = response.data?.myProfile;
      
      console.log('✅ GraphQL Fetch My Profile Success');
      return profile;
    } catch (error) {
      console.error('❌ GraphQL Fetch My Profile Error:', error);
      throw new Error(error.message || 'فشل جلب الملف الشخصي');
    }
  }
  
  // Token refresh (if needed in future)
  static async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      // This would need a refresh token mutation in the backend
      // For now, we'll clear tokens and force re-login
      this.clearTokens();
      throw new Error('Token refresh not implemented - please login again');
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
  
  // Check if token is expired and refresh if needed
  static async ensureValidToken() {
    const token = this.getAccessToken();
    if (!token) {
      return null;
    }
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      // If token expires in less than 5 minutes, refresh it
      if (payload.exp - currentTime < 300) {
        return await this.refreshToken();
      }
      
      return token;
    } catch (error) {
      // If token is invalid, clear it and return null
      this.clearTokens();
      return null;
    }
  }
  
  // Logout method
  static logout() {
    console.log('🔐 GraphQL Logout');
    this.clearTokens();
  }
}

// Export default service
export default GraphQLAuthService;
