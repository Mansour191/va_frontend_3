import { ref, computed } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { client } from '@/shared/plugins/apolloPlugin';
import { USER_GROUPS_QUERY } from '@/integration/graphql/groups.graphql';
import { useAuth } from '@/composables/useAuth';

export function usePermissions() {
  const { user, isAuthenticated } = useAuth();
  
  // Cache for user permissions
  const userPermissionsCache = ref(new Map());
  
  // Get user groups with permissions
  const getUserPermissions = async (userId) => {
    if (userPermissionsCache.value.has(userId)) {
      return userPermissionsCache.value.get(userId);
    }

    try {
      const result = await client.query({
        query: USER_GROUPS_QUERY,
        variables: { userId },
        fetchPolicy: 'cache-first'
      });
      
      const groups = result.data?.userGroups?.edges?.map(edge => edge.node.group) || [];
      const permissions = groups.flatMap(group => 
        group.permissions?.edges?.map(edge => edge.node) || []
      );
      
      // Remove duplicates
      const uniquePermissions = permissions.filter((permission, index, self) =>
        index === self.findIndex(p => p.codename === permission.codename)
      );
      
      userPermissionsCache.value.set(userId, uniquePermissions);
      return uniquePermissions;
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  };

  // Check if user has specific permission
  const hasPermission = async (permissionName) => {
    if (!isAuthenticated.value || !user.value) return false;
    
    const permissions = await getUserPermissions(user.value.id);
    return permissions.some(permission => permission.codename === permissionName);
  };

  // Check if user belongs to specific group
  const isUserInGroup = async (groupName) => {
    if (!isAuthenticated.value || !user.value) return false;
    
    try {
      const result = await client.query({
        query: USER_GROUPS_QUERY,
        variables: { userId: user.value.id },
        fetchPolicy: 'cache-first'
      });
      
      const groups = result.data?.userGroups?.edges?.map(edge => edge.node.group) || [];
      return groups.some(group => group.name === groupName);
    } catch (error) {
      console.error('Error checking user group membership:', error);
      return false;
    }
  };

  // Check if user has any of the specified permissions
  const hasAnyPermission = async (permissionNames) => {
    if (!isAuthenticated.value || !user.value) return false;
    
    const permissions = await getUserPermissions(user.value.id);
    return permissionNames.some(name => 
      permissions.some(permission => permission.codename === name)
    );
  };

  // Check if user has all specified permissions
  const hasAllPermissions = async (permissionNames) => {
    if (!isAuthenticated.value || !user.value) return false;
    
    const permissions = await getUserPermissions(user.value.id);
    return permissionNames.every(name => 
      permissions.some(permission => permission.codename === name)
    );
  };

  // Permission-based access control for UI components
  const canAccess = async (requiredPermissions = [], requiredGroups = []) => {
    if (!isAuthenticated.value || !user.value) return false;
    
    // Superuser (isStaff) has access to everything
    if (user.value.isStaff) return true;
    
    // Check group membership
    if (requiredGroups.length > 0) {
      const groupCheck = await Promise.all(
        requiredGroups.map(group => isUserInGroup(group))
      );
      if (!groupCheck.some(Boolean)) return false;
    }
    
    // Check permissions
    if (requiredPermissions.length > 0) {
      const permissionCheck = await hasAnyPermission(requiredPermissions);
      if (!permissionCheck) return false;
    }
    
    return true;
  };

  // Predefined permission checks for common use cases
  const canAccessFinance = async () => {
    return await canAccess(['view_finance', 'manage_finance'], ['Accountants', 'Finance']);
  };

  const canAccessHR = async () => {
    return await canAccess(['view_hr', 'manage_users'], ['HR', 'Admin']);
  };

  const canAccessReports = async () => {
    return await canAccess(['view_reports'], ['Managers', 'Admin']);
  };

  const canAccessSettings = async () => {
    return await canAccess(['manage_settings'], ['Admin']);
  };

  const canManageUsers = async () => {
    return await canAccess(['manage_users'], ['Admin', 'HR']);
  };

  const canManageProducts = async () => {
    return await canAccess(['manage_products'], ['Product Managers', 'Admin']);
  };

  const canManageOrders = async () => {
    return await canAccess(['manage_orders'], ['Order Managers', 'Admin']);
  };

  // Clear cache when user logs out
  const clearPermissionCache = () => {
    userPermissionsCache.value.clear();
  };

  return {
    // Core permission methods
    getUserPermissions,
    hasPermission,
    isUserInGroup,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    
    // Predefined access checks
    canAccessFinance,
    canAccessHR,
    canAccessReports,
    canAccessSettings,
    canManageUsers,
    canManageProducts,
    canManageOrders,
    
    // Utility
    clearPermissionCache
  };
}
