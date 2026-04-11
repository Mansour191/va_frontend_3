import { ref, computed, watch } from 'vue';
import { useAuth } from '@/composables/useAuth';
import '@/shared/styles/permissions.css'; // Import visual filtering styles

// Global permission cache
const permissionCache = ref(new Set());
const permissionsLoaded = ref(false);

/**
 * Vue 3 Permission Directive
 * Usage: <button v-can="'api.delete_product'">Delete</button>
 *        <div v-can="['api.add_product', 'api.edit_product']">Admin Section</div>
 */
export const vCan = {
  mounted(el, binding) {
    updateElement(el, binding);
  },
  updated(el, binding) {
    updateElement(el, binding);
  }
};

/**
 * Permission Composable for reactive permission checking
 * Usage: const { hasPerm, hasAnyPerm, hasAllPerms } = usePermissionCheck();
 */
export function usePermissionCheck() {
  const { user, isAuthenticated } = useAuth();

  // Load permissions from cache or fetch them
  const loadPermissions = async () => {
    if (permissionsLoaded.value) return;

    try {
      // Try to load from SessionStorage first
      const cachedPerms = sessionStorage.getItem('userPermissions');
      if (cachedPerms) {
        const perms = JSON.parse(cachedPerms);
        permissionCache.value = new Set(perms);
        permissionsLoaded.value = true;
        return;
      }

      // Fetch from GraphQL if not cached
      const { client } = await import('@/shared/plugins/apolloPlugin');
      const { MY_PERMISSIONS_QUERY } = await import('@/integration/graphql/user.graphql');
      
      const result = await client.default.query({
        query: MY_PERMISSIONS_QUERY,
        fetchPolicy: 'cache-first'
      });

      if (result.data?.myPermissions?.edges) {
        const permissions = result.data.myPermissions.edges.map(edge => edge.node.codename);
        permissionCache.value = new Set(permissions);
        
        // Cache in SessionStorage
        sessionStorage.setItem('userPermissions', JSON.stringify(permissions));
        permissionsLoaded.value = true;
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  // Check single permission
  const hasPerm = (permission) => {
    if (!isAuthenticated.value) return false;
    if (user.value?.isStaff) return true; // Superuser has all permissions
    
    return permissionCache.value.has(permission);
  };

  // Check if user has any of the specified permissions
  const hasAnyPerm = (permissions) => {
    if (!isAuthenticated.value) return false;
    if (user.value?.isStaff) return true;
    
    return permissions.some(perm => permissionCache.value.has(perm));
  };

  // Check if user has all specified permissions
  const hasAllPerms = (permissions) => {
    if (!isAuthenticated.value) return false;
    if (user.value?.isStaff) return true;
    
    return permissions.every(perm => permissionCache.value.has(perm));
  };

  // Get all user permissions as array
  const getUserPermissions = () => {
    return Array.from(permissionCache.value);
  };

  // Clear permissions cache
  const clearPermissionCache = () => {
    permissionCache.value.clear();
    permissionsLoaded.value = false;
    sessionStorage.removeItem('userPermissions');
  };

  // Watch for authentication changes
  watch([isAuthenticated, user], () => {
    if (isAuthenticated.value) {
      loadPermissions();
    } else {
      clearPermissionCache();
    }
  }, { immediate: true });

  return {
    hasPerm,
    hasAnyPerm,
    hasAllPerms,
    getUserPermissions,
    clearPermissionCache,
    permissionsLoaded: computed(() => permissionsLoaded.value)
  };
}

/**
 * Update element visibility based on permissions
 */
function updateElement(el, binding) {
  const { value } = binding;
  const { hasPerm, hasAnyPerm, hasAllPerms } = usePermissionCheck();
  
  let hasPermission = false;
  
  if (Array.isArray(value)) {
    // Array of permissions - user needs ANY of them
    hasPermission = hasAnyPerm(value);
  } else if (typeof value === 'string') {
    // Single permission
    hasPermission = hasPerm(value);
  } else if (typeof value === 'object' && value.type === 'all') {
    // Object with type: 'all' - user needs ALL permissions
    hasPermission = hasAllPerms(value.permissions);
  } else {
    console.warn('v-can directive: Invalid permission format', value);
    hasPermission = false;
  }
  
  // Apply visual filtering - hide element if no permission
  if (!hasPermission) {
    el.style.display = 'none';
    el.setAttribute('aria-hidden', 'true');
    // Add CSS class for styling
    el.classList.add('permission-hidden');
  } else {
    el.style.display = '';
    el.removeAttribute('aria-hidden');
    el.classList.remove('permission-hidden');
  }
}

/**
 * Global permission checker for direct use
 */
export const checkPermission = (permission) => {
  const { hasPerm } = usePermissionCheck();
  return hasPerm(permission);
};

/**
 * Install function for Vue app
 */
export const PermissionPlugin = {
  install(app) {
    app.directive('can', vCan);
    app.config.globalProperties.$can = checkPermission;
    app.provide('permissionCheck', usePermissionCheck);
  }
};

export default {
  vCan,
  usePermissionCheck,
  checkPermission,
  PermissionPlugin
};
