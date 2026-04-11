import { ref, computed } from 'vue';
import { useQuery, useMutation } from '@vue/apollo-composable';
import { useStore } from 'vuex';
import { client } from '@/shared/plugins/apolloPlugin';
import {
  ALL_GROUPS_QUERY,
  GROUPS_WITH_MEMBER_COUNT_QUERY,
  CREATE_GROUP_MUTATION,
  UPDATE_GROUP_MUTATION,
  DELETE_GROUP_MUTATION,
  ALL_PERMISSIONS_QUERY
} from '@/integration/graphql/groups.graphql';

export function useGroups() {
  const store = useStore();

  // GraphQL Queries
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

  const { 
    result: permissionsResult, 
    loading: permissionsLoading 
  } = useQuery(ALL_PERMISSIONS_QUERY);

  // GraphQL Mutations
  const { mutate: createGroupMutation } = useMutation(CREATE_GROUP_MUTATION);
  const { mutate: updateGroupMutation } = useMutation(UPDATE_GROUP_MUTATION);
  const { mutate: deleteGroupMutation } = useMutation(DELETE_GROUP_MUTATION);

  // Computed properties for GraphQL data
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

  const availablePermissions = computed(() => {
    if (!permissionsResult.value?.allPermissions?.edges) return [];
    return permissionsResult.value.allPermissions.edges.map(edge => edge.node);
  });

  const loading = computed(() => groupsLoading || groupsWithMemberCountLoading || permissionsLoading);
  const error = computed(() => groupsError);

  // Methods
  const fetchGroups = () => {
    refetchGroups();
  };

  const createGroup = async (groupData) => {
    try {
      const result = await createGroupMutation({
        variables: {
          name: groupData.name,
          permissions: groupData.permissions
        }
      });
      
      if (result.data?.createGroup?.success) {
        refetchGroups();
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم إنشاء المجموعة بنجاح'
        });
        
        return { success: true, group: result.data.createGroup.group };
      } else {
        throw new Error(result.data?.createGroup?.message || 'فشل إنشاء المجموعة');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      
      // Enhanced error handling
      let errorMessage = 'حدث خطأ أثناء إنشاء المجموعة';
      
      if (error.message) {
        if (error.message.includes('UniqueConstraint') || error.message.includes('unique')) {
          errorMessage = 'اسم المجموعة موجود بالفعل';
        } else if (error.message.includes('PermissionDenied') || error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لإنشاء مجموعات جديدة';
        } else if (error.message.includes('ValidationError') || error.message.includes('validation')) {
          errorMessage = 'بيانات المجموعة غير صالحة';
        } else if (error.message.includes('IntegrityError')) {
          errorMessage = 'خطأ في سلامة البيانات';
        }
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const updateGroup = async (groupId, groupData) => {
    try {
      const result = await updateGroupMutation({
        variables: {
          id: groupId,
          name: groupData.name,
          permissions: groupData.permissions
        }
      });
      
      if (result.data?.updateGroup?.success) {
        refetchGroups();
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم تحديث المجموعة بنجاح'
        });
        
        return { success: true, group: result.data.updateGroup.group };
      } else {
        throw new Error(result.data?.updateGroup?.message || 'فشل تحديث المجموعة');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      
      // Enhanced error handling
      let errorMessage = 'حدث خطأ أثناء تحديث المجموعة';
      
      if (error.message) {
        if (error.message.includes('UniqueConstraint') || error.message.includes('unique')) {
          errorMessage = 'اسم المجموعة موجود بالفعل';
        } else if (error.message.includes('PermissionDenied') || error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لتعديل هذه المجموعة';
        } else if (error.message.includes('ValidationError') || error.message.includes('validation')) {
          errorMessage = 'بيانات المجموعة غير صالحة';
        } else if (error.message.includes('DoesNotExist')) {
          errorMessage = 'المجموعة المطلوبة غير موجودة';
        }
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  const deleteGroup = async (groupId) => {
    try {
      const result = await deleteGroupMutation({
        variables: {
          id: groupId
        }
      });
      
      if (result.data?.deleteGroup?.success) {
        refetchGroups();
        
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: 'تم حذف المجموعة بنجاح'
        });
        
        return { success: true };
      } else {
        throw new Error(result.data?.deleteGroup?.message || 'فشل حذف المجموعة');
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      
      // Enhanced error handling
      let errorMessage = 'حدث خطأ أثناء حذف المجموعة';
      
      if (error.message) {
        if (error.message.includes('ProtectedError') || error.message.includes('protected')) {
          errorMessage = 'لا يمكن حذف هذه المجموعة لأنها محمية من النظام';
        } else if (error.message.includes('ForeignKey') || error.message.includes('foreign key')) {
          errorMessage = 'لا يمكن حذف المجموعة لأنها مرتبطة بمستخدمين أو بيانات أخرى';
        } else if (error.message.includes('PermissionDenied') || error.message.includes('permission')) {
          errorMessage = 'ليس لديك صلاحية لحذف هذه المجموعة';
        } else if (error.message.includes('DoesNotExist')) {
          errorMessage = 'المجموعة المطلوبة غير موجودة';
        }
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: errorMessage
      });
      
      return { success: false, error: errorMessage };
    }
  };

  // Helper functions
  const getGroupById = (groupId) => {
    return groups.value.find(group => group.id === groupId);
  };

  const getGroupsByPermission = (permissionName) => {
    return groups.value.filter(group =>
      group.permissions.some(permission => permission.codename === permissionName)
    );
  };

  return {
    // Data
    groups,
    groupsWithMemberCount,
    availablePermissions,
    loading,
    error,
    
    // Actions
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    
    // Utilities
    getGroupById,
    getGroupsByPermission
  };
}
