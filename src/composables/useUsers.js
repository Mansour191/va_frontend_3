import { ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { useStore } from 'vuex';
import { client } from '@/shared/plugins/apolloPlugin';
import { formatDate } from '@/shared/integration/utils/helpers.js';
import { 
  ALL_USERS_QUERY, 
  TOGGLE_USER_STATUS_MUTATION, 
  USER_STATS_QUERY 
} from '@/integration/graphql/users.graphql';
import {
  ALL_GROUPS_QUERY,
  GROUPS_WITH_MEMBER_COUNT_QUERY,
  ASSIGN_USER_TO_GROUP_MUTATION,
  REMOVE_USER_FROM_GROUP_MUTATION,
  USER_GROUPS_QUERY
} from '@/integration/graphql/groups.graphql';

export function useUsers() {
  const store = useStore();

  // GraphQL Queries
  const { 
    result: usersResult, 
    loading: usersLoading, 
    error: usersError, 
    refetch: refetchUsers 
  } = useQuery(ALL_USERS_QUERY);

  const { 
    result: statsResult, 
    loading: statsLoading 
  } = useQuery(USER_STATS_QUERY);

  // Groups GraphQL Queries
  const { 
    result: groupsResult, 
    loading: groupsLoading, 
    error: groupsError, 
    refetch: refetchGroups 
  } = useQuery(ALL_GROUPS_QUERY);

  const { 
    result: groupsWithMemberCountResult, 
    loading: groupsWithMemberCountLoading 
  } = useQuery(GROUPS_WITH_MEMBER_COUNT_QUERY);

  // GraphQL Mutations
  const { mutate: toggleUserStatus } = useMutation(TOGGLE_USER_STATUS_MUTATION);
  const { mutate: assignUserToGroup } = useMutation(ASSIGN_USER_TO_GROUP_MUTATION);
  const { mutate: removeUserFromGroup } = useMutation(REMOVE_USER_FROM_GROUP_MUTATION);

  // Computed properties for GraphQL data
  const users = computed(() => {
    if (!usersResult.value?.allUsers?.edges) return [];
    return usersResult.value.allUsers.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.username,
      email: edge.node.email,
      phone: edge.node.profile?.phone || null,
      address: null, // Not available in current schema
      role: edge.node.isStaff ? 'admin' : 'user',
      active: edge.node.isActive,
      avatar: edge.node.profile?.avatar || null,
      created_at: edge.node.dateJoined,
      last_login: null, // Not available in current schema
      groups: [] // Will be populated by userGroups query
    }));
  });

  const groups = computed(() => {
    if (!groupsResult.value?.allGroups?.edges) return [];
    return groupsResult.value.allGroups.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.name,
      memberCount: edge.node.userGroups?.totalCount || 0,
      permissions: edge.node.permissions?.edges?.map(edge => edge.node) || []
    }));
  });

  const groupsWithMemberCount = computed(() => {
    if (!groupsWithMemberCountResult.value?.allGroups?.edges) return [];
    return groupsWithMemberCountResult.value.allGroups.edges.map(edge => ({
      id: edge.node.id,
      name: edge.node.name,
      memberCount: edge.node.memberCount?.totalCount || 0
    }));
  });

  const userStatsData = computed(() => statsResult.value?.userStats || {});

  const loading = computed(() => usersLoading || statsLoading || groupsLoading || groupsWithMemberCountLoading);
  const error = computed(() => usersError || groupsError);

  // Methods
  const fetchUsers = () => {
    refetchUsers();
  };

  const fetchGroups = () => {
    refetchGroups();
  };

  const assignUserToGroupHandler = async (userId, groupId) => {
    try {
      const result = await assignUserToGroup({
        variables: {
          userId,
          groupId
        }
      });
      
      if (result.data?.assignUserToGroup?.success) {
        refetchUsers();
        refetchGroups();
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم إضافة المستخدم إلى المجموعة بنجاح'
        });
        
        return { success: true };
      } else {
        throw new Error(result.data?.assignUserToGroup?.message || 'فشل إضافة المستخدم إلى المجموعة');
      }
    } catch (error) {
      console.error('Error assigning user to group:', error);
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: 'حدث خطأ أثناء إضافة المستخدم إلى المجموعة'
      });
      
      return { success: false, error: error.message };
    }
  };

  const removeUserFromGroupHandler = async (userId, groupId) => {
    try {
      const result = await removeUserFromGroup({
        variables: {
          userId,
          groupId
        }
      });
      
      if (result.data?.removeUserFromGroup?.success) {
        refetchUsers();
        refetchGroups();
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم إزالة المستخدم من المجموعة بنجاح'
        });
        
        return { success: true };
      } else {
        throw new Error(result.data?.removeUserFromGroup?.message || 'فشل إزالة المستخدم من المجموعة');
      }
    } catch (error) {
      console.error('Error removing user from group:', error);
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: 'حدث خطأ أثناء إزالة المستخدم من المجموعة'
      });
      
      return { success: false, error: error.message };
    }
  };

  // Helper function to get user groups
  const getUserGroups = async (userId) => {
    try {
      const result = await client.query({
        query: USER_GROUPS_QUERY,
        variables: { userId },
        fetchPolicy: 'cache-first'
      });
      
      return result.data?.userGroups?.edges?.map(edge => edge.node.group) || [];
    } catch (error) {
      console.error('Error fetching user groups:', error);
      return [];
    }
  };

  // Check if user belongs to specific group
  const isUserInGroup = (user, groupName) => {
    return user.groups?.some(group => group.name === groupName) || false;
  };

  // Check if user has specific permission
  const hasPermission = (user, permissionName) => {
    if (!user.groups) return false;
    
    return user.groups.some(group => 
      group.permissions?.some(permission => permission.codename === permissionName)
    );
  };

  // Computed user statistics with fallbacks
  const userStats = computed(() => [
    {
      label: 'إجمالي المستخدمين',
      value: userStatsData.value.totalUsers || users.value.length,
      icon: 'mdi-account-group',
      color: '#2196f3',
      trend: 12
    },
    {
      label: 'مستخدمين نشطين',
      value: userStatsData.value.activeUsers || users.value.filter(u => u.active).length,
      icon: 'mdi-account-check',
      color: '#4caf50',
      trend: 8
    },
    {
      label: 'مديرين',
      value: userStatsData.value.staffUsers || users.value.filter(u => u.role === 'admin').length,
      icon: 'mdi-account-tie',
      color: '#ff9800',
      trend: -2
    },
    {
      label: 'مستخدمين جدد',
      value: userStatsData.value.newUsersThisMonth || users.value.filter(u => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return new Date(u.created_at) > thirtyDaysAgo;
      }).length,
      icon: 'mdi-account-plus',
      color: '#9c27b0',
      trend: 25
    }
  ]);

  // Utility functions
  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      moderator: 'warning',
      user: 'primary'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'مدير',
      moderator: 'مشرف',
      user: 'مستخدم'
    };
    return labels[role] || role;
  };

  
  return {
    // Data
    users,
    groups,
    groupsWithMemberCount,
    userStats,
    loading,
    error,
    
    // Actions
    fetchUsers,
    fetchGroups,
    toggleUserStatus: toggleUserStatusHandler,
    assignUserToGroup: assignUserToGroupHandler,
    removeUserFromGroup: removeUserFromGroupHandler,
    getUserGroups,
    
    // Utilities
    isUserInGroup,
    hasPermission,
    getRoleColor,
    getRoleLabel,
    formatDate
  };
}
