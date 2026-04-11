import { defineStore } from 'pinia';
import GraphQLAuthService from '@/shared/integration/services/authGraphQL.js';
import DRFAuthService from '@/shared/integration/services/drfAuth.js';
import { DRF_LOGIN_MUTATION, DRF_REGISTER_MUTATION, DRF_UPDATE_PROFILE_MUTATION, DRF_ME_QUERY, DRF_MY_PROFILE_QUERY } from '@/shared/integration/services/drfAuth.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    refreshToken: null,
    role: 'guest',
    loading: false,
    error: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.role === 'admin' || Boolean(state.user && (state.user.isStaff || state.user.is_staff)),
    isInvestor: (state) => state.role === 'investor',
    isCustomer: (state) => state.role === 'customer' || Boolean(state.user && !(state.user.isStaff || state.user.is_staff)),
    userDisplayName: (state) => {
      if (state.user) {
        return state.user.firstName || state.user.username || 'مستخدم';
      }
      return 'ضيف';
    },
  },
  actions: {
    async initializeAuth() {
      try {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const userData = localStorage.getItem('user');
        const role = localStorage.getItem('role');

        console.log('🔐 Initializing auth with:', { token: !!token, userData: !!userData, role });

        if (token && userData) {
          this.token = token;
          this.refreshToken = refreshToken;
          try {
            this.user = JSON.parse(userData);
          } catch (parseError) {
            console.error('Failed to parse user data:', parseError);
            this.logout();
            return;
          }
          this.role = role || 'guest';
          
          // Ensure token is valid using GraphQL service
          try {
            const validToken = await GraphQLAuthService.ensureValidToken();
            if (!validToken) {
              console.warn('Token validation failed, logging out');
              this.logout();
            } else {
              // Fetch fresh user data from GraphQL
              try {
                const freshUser = await GraphQLAuthService.fetchMe();
                this.user = freshUser;
                localStorage.setItem('user', JSON.stringify(this.user));
              } catch (fetchError) {
                console.warn('Failed to fetch fresh user data:', fetchError);
                // Continue with existing user data
              }
            }
          } catch (tokenError) {
            console.error('Token validation error:', tokenError);
            // Don't logout immediately, let the user continue with existing token
            // Token refresh will happen on API calls
          }
        } else {
          console.log('No token or user data found, staying logged out');
          this.logout();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        this.logout();
      }
    },

    setUser(userData, token, refreshToken = null, role = null) {
      this.user = userData;
      this.token = token;
      this.refreshToken = refreshToken;
      this.role = role || ((userData.isStaff || userData.is_staff) ? 'admin' : 'customer');
      
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      localStorage.setItem('role', this.role);
    },

    async login(emailOrUsername, password) {
      try {
        this.loading = true;
        this.error = null;
        
        // Use GraphQL service (Apollo Client)
        const response = await GraphQLAuthService.login(emailOrUsername, password);
        
        if (!response.success) {
          throw new Error(response.message || 'فشل تسجيل الدخول');
        }
        
        const { user, tokens } = response;
        this.setUser(user, tokens, null); // tokens is now just the access token string
        
        return { success: true, user, role: this.role };
      } catch (e) {
        const errorMsg = e.message || 'بيانات الدخول غير صحيحة';
        this.error = errorMsg;
        throw new Error(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    async register(userData) {
      try {
        this.loading = true;
        this.error = null;
        
        // Use GraphQL service (Apollo Client)
        const response = await GraphQLAuthService.register(userData);
        
        if (!response.success) {
          throw new Error(response.message || 'فشل إنشاء الحساب');
        }
        
        const { user, tokens } = response;
        this.setUser(user, tokens, null); // tokens is now just the access token string
        
        return response;
      } catch (e) {
        const errorMsg = e.message || 'حدث خطأ أثناء التسجيل';
        this.error = errorMsg;
        throw new Error(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    async changePassword(oldPassword, newPassword, newPasswordConfirm) {
      try {
        this.loading = true;
        this.error = null;
        
        // This method still uses REST as GraphQL mutation is not implemented yet
        const response = await DRFAuthService.changePassword(oldPassword, newPassword, newPasswordConfirm);
        
        if (!response.success) {
          throw new Error(response.message || 'فشل تغيير كلمة المرور');
        }
        
        return response;
      } catch (e) {
        const errorMsg = e.message || 'حدث خطأ أثناء تغيير كلمة المرور';
        this.error = errorMsg;
        throw new Error(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    async updateProfile(userData) {
      try {
        this.loading = true;
        this.error = null;
        
        // Use GraphQL service (Apollo Client)
        const response = await GraphQLAuthService.updateProfile(userData);
        
        if (!response.success) {
          throw new Error(response.message || 'فشل تحديث الملف الشخصي');
        }
        
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        
        return response;
      } catch (e) {
        const errorMsg = e.message || 'حدث خطأ أثناء تحديث الملف الشخصي';
        this.error = errorMsg;
        throw new Error(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    async fetchProfile() {
      try {
        this.loading = true;
        this.error = null;
        
        // Use GraphQL service (Apollo Client)
        const user = await GraphQLAuthService.fetchMe();
        
        if (user) {
          this.user = user;
          localStorage.setItem('user', JSON.stringify(this.user));
          return this.user;
        }
        
        throw new Error('لم يتم العثور على بيانات المستخدم');
      } catch (e) {
        const errorMsg = e.message || 'حدث خطأ أثناء جلب الملف الشخصي';
        this.error = errorMsg;
        throw new Error(errorMsg);
      } finally {
        this.loading = false;
      }
    },

    logout() {
      console.log('🔐 Logging out from store');
      
      // Use GraphQL service for proper cleanup
      GraphQLAuthService.logout();
      
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      this.role = 'guest';
      this.error = null;
    },

    async refreshToken() {
      try {
        const newToken = await GraphQLAuthService.refreshToken();
        this.token = newToken;
        localStorage.setItem('token', newToken);
        return newToken;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    clearError() {
      this.error = null;
    },
  },
});
