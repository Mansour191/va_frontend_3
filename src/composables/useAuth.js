import { ref, computed, reactive } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { provideApolloClient } from '@vue/apollo-composable';
import { client } from '@/shared/plugins/apolloPlugin';
import { ME_QUERY, MY_PERMISSIONS_QUERY, UPDATE_EMAIL_MUTATION, CHANGE_PASSWORD_MUTATION, UPDATE_PROFILE_MUTATION, UPLOAD_AVATAR_MUTATION } from '@/integration/graphql/user.graphql';
import { usePermissions } from '@/composables/usePermissions';
import { usePermissionCheck } from '@/shared/directives/permissionDirective';

// Ensure Apollo Client is available
provideApolloClient(client);

// Authentication State Management
const authState = reactive({
  user: null,
  token: localStorage.getItem('authToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
  success: null,
  permissions: []
});

// Reactive getters
export const useAuth = () => {
  const login = async (credentials) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(LOGIN_MUTATION);
      const result = await mutate({
        variables: {
          username: credentials.username,
          password: credentials.password
        }
      });
      
      if (result.data?.login?.success) {
        const { token, refreshToken, user } = result.data.login;
        
        // Store tokens securely
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        
        // Update state
        authState.user = user;
        authState.token = token;
        authState.refreshToken = refreshToken;
        authState.isAuthenticated = true;
        authState.isLoading = false;
        
        // Load user permissions
        loadUserPermissions();
        
        // Update Apollo Client headers
        client.setLink(
          client.link.concat((operation, forward) => {
            operation.setContext({
              headers: {
                ...operation.getContext().headers,
                authorization: token ? `Bearer ${token}` : '',
              }
            });
            return forward(operation);
          })
        );
        
        console.log('✅ Login successful:', user);
        return { 
          success: true, 
          user,
          role: user.isStaff ? 'admin' : 'user'
        };
      } else {
        throw new Error(result.data?.login?.message || 'Login failed');
      }
    } catch (error) {
      authState.error = error.message;
      authState.isLoading = false;
      console.error('❌ Login error:', error);
      return { success: false, error: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const register = async (userData) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(REGISTER_MUTATION);
      const result = await mutate({
        variables: {
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName || userData.name,
          lastName: userData.lastName || ''
        }
      });
      
      if (result.data?.register?.success) {
        const { user } = result.data.register;
        
        // Update state (user gets token on next login)
        authState.user = user;
        authState.isAuthenticated = true;
        authState.isLoading = false;
        authState.success = 'Registration successful! Please login.';
        
        console.log('✅ Registration successful:', user);
        return { 
          success: true, 
          user,
          role: user.isStaff ? 'admin' : 'user'
        };
      } else {
        throw new Error(result.data?.register?.message || 'Registration failed');
      }
    } catch (error) {
      authState.error = error.message;
      authState.isLoading = false;
      console.error('❌ Registration error:', error);
      return { success: false, error: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const socialLogin = async (provider, socialToken) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      // Mock social login for now - in production, this would call a real social auth mutation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful social login
      const mockUser = {
        id: 1,
        username: `${provider}_user`,
        email: `user@${provider}.com`,
        firstName: provider.charAt(0).toUpperCase() + provider.slice(1),
        lastName: 'User',
        isStaff: false
      };
      
      authState.user = mockUser;
      authState.isAuthenticated = true;
      authState.isLoading = false;
      authState.success = `Successfully logged in with ${provider}`;
      
      return { 
        success: true, 
        user: mockUser,
        role: 'user'
      };
    } catch (error) {
      authState.error = error.message;
      authState.isLoading = false;
      console.error(`❌ ${provider} login error:`, error);
      return { success: false, error: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const logout = () => {
    // Clear tokens
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    
    // Reset state
    authState.user = null;
    authState.token = null;
    authState.refreshToken = null;
    authState.isAuthenticated = false;
    authState.error = null;
    authState.success = null;
    authState.permissions = [];
    
    // Clear permission caches
    clearPermissionCache();
    const { clearPermissionCache: clearPermCache } = usePermissions();
    clearPermCache();
    
    // Clear SessionStorage
    sessionStorage.removeItem('userPermissions');
    
    // Reset Apollo Client headers
    client.resetStore();
    
    console.log('🚪 User logged out');
  };

  const updateProfile = async (profileData) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(UPDATE_PROFILE_MUTATION);
      const result = await mutate({
        variables: {
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          address: profileData.address,
          bio: profileData.bio
        }
      });
      
      if (result.data?.updateProfile?.success) {
        const { user } = result.data.updateProfile;
        
        // Update local state
        authState.user = user;
        authState.isLoading = false;
        authState.success = 'Profile updated successfully';
        
        console.log('✅ Profile updated:', user);
        return { success: true, user };
      } else {
        throw new Error(result.data?.updateProfile?.message || 'Profile update failed');
      }
    } catch (error) {
      authState.error = error.message;
      authState.isLoading = false;
      console.error('❌ Profile update error:', error);
      return { success: false, error: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  // Permission Management
const { hasPerm, hasAnyPerm, hasAllPerms, getUserPermissions, clearPermissionCache, permissionsLoaded } = usePermissionCheck();

// Load user permissions
const loadUserPermissions = async () => {
  if (!authState.isAuthenticated || !authState.user) return;
  
  try {
    // Try to load from SessionStorage first
    const cachedPerms = sessionStorage.getItem('userPermissions');
    if (cachedPerms) {
      const perms = JSON.parse(cachedPerms);
      authState.permissions = perms;
      return;
    }

    // Fetch from GraphQL if not cached
    const { result } = await client.query({
      query: MY_PERMISSIONS_QUERY,
      fetchPolicy: 'cache-first'
    });

    if (result.data?.myPermissions?.edges) {
      const permissions = result.data.myPermissions.edges.map(edge => edge.node.codename);
      authState.permissions = permissions;
      
      // Cache in SessionStorage
      sessionStorage.setItem('userPermissions', JSON.stringify(permissions));
    }
  } catch (error) {
    console.error('Error loading user permissions:', error);
  }
};
  const initializeAuth = () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      authState.token = token;
      authState.isAuthenticated = true;
      
      // Set Apollo Client headers
      client.setLink(
        client.link.concat((operation, forward) => {
          operation.setContext({
            headers: {
              ...operation.getContext().headers,
              authorization: token ? `Bearer ${token}` : '',
            }
          });
          return forward(operation);
        })
      );
      
      // Fetch user data if token exists
      fetchUserData();
    }
  };

  const fetchUserData = async () => {
    try {
      const { result } = await client.query({
        query: ME_QUERY,
        fetchPolicy: 'cache-first'
      });
      
      if (result.data?.me) {
        authState.user = result.data.me;
        // Load permissions after user data is loaded
        loadUserPermissions();
      }
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      // If token is invalid, logout
      if (error.message.includes('Authentication') || error.message.includes('token')) {
        logout();
      }
    }
  };

  // Computed properties
  const currentUser = computed(() => authState.user);
  const isLoggedIn = computed(() => authState.isAuthenticated);
  const loading = computed(() => authState.isLoading);
  const error = computed(() => authState.error);
  const success = computed(() => authState.success);
  const userPermissions = computed(() => authState.permissions);
  const isPermissionsLoaded = computed(() => permissionsLoaded.value);
  
  // Role-based computed properties
  const currentUserRole = computed(() => {
    if (!authState.user) return null;
    return authState.user.isStaff ? 'admin' : 'user';
  });
  
  const isAdmin = computed(() => currentUserRole.value === 'admin');
  const isInvestor = computed(() => currentUserRole.value === 'investor');
  
  // Permission-based computed properties
  const canManageUsers = computed(() => hasPerm('auth.change_permission') || isAdmin.value);
  const canDeleteProducts = computed(() => hasPerm('api.delete_product'));
  const canEditPrices = computed(() => hasPerm('api.change_price'));
  const canViewReports = computed(() => hasPerm('view.reports'));
  const canManageSettings = computed(() => hasPerm('manage.settings') || isAdmin.value);

  // Additional auth functions
  const updateEmail = async (email, password) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(UPDATE_EMAIL_MUTATION);
      const result = await mutate({
        variables: { email, password }
      });
      
      if (result.data?.updateEmail?.success) {
        authState.user = result.data.updateEmail.user;
        authState.success = result.data.updateEmail.message;
        return { success: true, message: result.data.updateEmail.message };
      } else {
        throw new Error(result.data?.updateEmail?.message || 'Failed to update email');
      }
    } catch (error) {
      authState.error = error.message;
      return { success: false, message: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(CHANGE_PASSWORD_MUTATION);
      const result = await mutate({
        variables: { currentPassword, newPassword }
      });
      
      if (result.data?.changePassword?.success) {
        authState.success = result.data.changePassword.message;
        return { success: true, message: result.data.changePassword.message };
      } else {
        throw new Error(result.data?.changePassword?.message || 'Failed to change password');
      }
    } catch (error) {
      authState.error = error.message;
      return { success: false, message: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const updateProfile = async (profileData) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(UPDATE_PROFILE_MUTATION);
      const result = await mutate({
        variables: { input: profileData }
      });
      
      if (result.data?.updateProfile?.success) {
        authState.user = result.data.updateProfile.user;
        authState.success = result.data.updateProfile.message;
        return { success: true, message: result.data.updateProfile.message };
      } else {
        throw new Error(result.data?.updateProfile?.message || 'Failed to update profile');
      }
    } catch (error) {
      authState.error = error.message;
      return { success: false, message: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  const uploadAvatar = async (file) => {
    authState.isLoading = true;
    authState.error = null;
    authState.success = null;
    
    try {
      const { mutate } = useMutation(UPLOAD_AVATAR_MUTATION);
      const result = await mutate({
        variables: { file }
      });
      
      if (result.data?.uploadAvatar?.success) {
        // Update user state with new avatar
        if (authState.user && authState.user.profile) {
          authState.user.profile.avatar = result.data.uploadAvatar.avatarUrl;
        }
        authState.success = result.data.uploadAvatar.message;
        return { success: true, message: result.data.uploadAvatar.message, avatarUrl: result.data.uploadAvatar.avatarUrl };
      } else {
        throw new Error(result.data?.uploadAvatar?.message || 'Failed to upload avatar');
      }
    } catch (error) {
      authState.error = error.message;
      return { success: false, message: error.message };
    } finally {
      authState.isLoading = false;
    }
  };

  // Initialize on import
  initializeAuth();

  return {
    // State
    user: currentUser,
    token: computed(() => authState.token),
    refreshToken: computed(() => authState.refreshToken),
    isAuthenticated: isLoggedIn,
    isLoading: loading,
    error,
    success,
    permissions: userPermissions,
    isPermissionsLoaded,
    
    // Role-based properties
    currentUserRole,
    isAdmin,
    isInvestor,
    
    // Permission-based properties
    canManageUsers,
    canDeleteProducts,
    canEditPrices,
    canViewReports,
    canManageSettings,
    
    // Permission checking functions
    hasPerm,
    hasAnyPerm,
    hasAllPerms,
    getUserPermissions,
    
    // Actions
    login,
    register,
    socialLogin,
    logout,
    updateProfile,
    updateEmail,
    changePassword,
    uploadAvatar,
    fetchUserData,
    loadUserPermissions
  };
};
