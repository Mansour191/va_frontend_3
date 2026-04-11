<template>
  <div v-if="!canAccessGroupsManager" class="access-denied">
    <v-alert
      type="error"
      prominent
      class="mb-4"
    >
      <v-alert-title>الوصول مرفوض</v-alert-title>
      <div>ليس لديك صلاحية للوصول إلى صفحة إدارة المجموعات.</div>
      <v-btn
        color="white"
        variant="outlined"
        class="mt-3"
        @click="router.push('/dashboard')"
      >
        العودة إلى لوحة التحكم
      </v-btn>
    </v-alert>
  </div>
  <div v-else class="groups-manager">
    <!-- Header Section -->
    <div class="groups-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">إدارة المجموعات</h1>
          <p class="page-subtitle">إدارة مجموعات المستخدمين والصلاحيات</p>
        </div>
        <div class="header-right">
          <v-btn
            color="primary"
            prepend-icon="mdi-plus"
            @click="showAddGroupDialog = true"
            class="add-group-btn"
          >
            إضافة مجموعة
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div class="groups-content">
      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card" v-for="stat in groupStats" :key="stat.label">
            <div class="stat-icon" :style="{ background: stat.color + '20' }">
              <i :class="stat.icon" :style="{ color: stat.color }"></i>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state">
        <v-alert
          type="error"
          prominent
          class="mb-4"
        >
          <v-alert-title>خطأ في جلب البيانات</v-alert-title>
          <div>{{ error.message }}</div>
          <v-btn
            color="white"
            variant="outlined"
            class="mt-3"
            @click="fetchGroups"
          >
            إعادة المحاولة
          </v-btn>
        </v-alert>
      </div>

      <!-- Groups Table -->
      <div v-else class="groups-table-section">
        <v-data-table
          :headers="tableHeaders"
          :items="groups"
          :loading="loading"
          class="groups-table"
          :items-per-page="[10, 25, 50, 100]"
          :sort-by="[{ key: 'memberCount', order: 'desc' }]"
        >
          <template v-slot:item.name="{ item }">
            <div class="group-name">
              <v-icon :color="getGroupColor(item.name)" class="me-2">
                {{ getGroupIcon(item.name) }}
              </v-icon>
              <span>{{ item.name }}</span>
            </div>
          </template>

          <template v-slot:item.memberCount="{ item }">
            <v-chip
              :color="getMemberCountColor(item.memberCount)"
              size="small"
              variant="flat"
            >
              {{ item.memberCount }} عضو
            </v-chip>
          </template>

          <template v-slot:item.permissions="{ item }">
            <div class="permissions-list">
              <v-chip
                v-for="permission in item.permissions.slice(0, 3)"
                :key="permission.id"
                size="x-small"
                variant="outlined"
                class="me-1 mb-1"
              >
                {{ permission.name }}
              </v-chip>
              <v-chip
                v-if="item.permissions.length > 3"
                size="x-small"
                variant="outlined"
                color="grey"
              >
                +{{ item.permissions.length - 3 }}
              </v-chip>
            </div>
          </template>

          <template v-slot:item.actions="{ item }">
            <div class="action-buttons">
              <v-btn
                icon="mdi-eye"
                size="small"
                variant="text"
                @click="viewGroup(item)"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-pencil"
                size="small"
                variant="text"
                @click="editGroup(item)"
                class="action-btn"
              ></v-btn>
              <v-btn
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="deleteGroup(item)"
                class="action-btn"
                :disabled="item.memberCount > 0"
                :title="item.memberCount > 0 ? 'لا يمكن حذف مجموعة تحتوي على أعضاء' : 'حذف المجموعة'"
              ></v-btn>
            </div>
          </template>
        </v-data-table>
      </div>
    </div>

    <!-- Add/Edit Group Dialog -->
    <v-dialog v-model="showAddGroupDialog" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          {{ editingGroup ? 'تعديل مجموعة' : 'إضافة مجموعة جديدة' }}
        </v-card-title>
        <v-card-text>
          <v-form ref="groupForm" v-model="groupFormValid">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="groupForm.name"
                  label="اسم المجموعة"
                  :rules="[v => !!v || 'اسم المجموعة مطلوب']"
                  variant="outlined"
                  density="compact"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="groupForm.permissions"
                  label="الصلاحيات"
                  :items="availablePermissions"
                  item-title="name"
                  item-value="id"
                  multiple
                  chips
                  variant="outlined"
                  density="compact"
                  :rules="[v => v.length > 0 || 'يجب اختيار صلاحية واحدة على الأقل']"
                ></v-select>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showAddGroupDialog = false">إلغاء</v-btn>
          <v-btn
            color="primary"
            @click="saveGroup"
            :loading="savingGroup"
            :disabled="!groupFormValid"
          >
            حفظ
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Group Dialog -->
    <v-dialog v-model="showViewGroupDialog" max-width="800">
      <v-card>
        <v-card-title class="dialog-title">
          تفاصيل المجموعة
        </v-card-title>
        <v-card-text>
          <div class="group-details" v-if="selectedGroup">
            <div class="group-info">
              <h3>{{ selectedGroup.name }}</h3>
              <v-chip :color="getMemberCountColor(selectedGroup.memberCount)" class="mt-2">
                {{ selectedGroup.memberCount }} عضو
              </v-chip>
            </div>
            
            <div class="permissions-section">
              <h4>الصلاحيات:</h4>
              <div class="permissions-grid">
                <v-chip
                  v-for="permission in selectedGroup.permissions"
                  :key="permission.id"
                  size="small"
                  variant="outlined"
                  class="me-2 mb-2"
                >
                  {{ permission.name }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showViewGroupDialog = false">إغلاق</v-btn>
          <v-btn color="primary" @click="editGroup(selectedGroup)">تعديل</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useGroups } from '@/composables/useGroups';

const router = useRouter();
const { user, isAdmin } = useAuth();

// Use groups composable
const {
  groups,
  availablePermissions,
  loading,
  error,
  fetchGroups,
  createGroup,
  updateGroup,
  deleteGroup: deleteGroupHandler
} = useGroups();

// Security check - only allow admin users
const canAccessGroupsManager = computed(() => {
  return isAdmin.value;
});

// Redirect if not admin
if (!canAccessGroupsManager.value) {
  router.push('/dashboard');
}

// Reactive data
const showAddGroupDialog = ref(false);
const showViewGroupDialog = ref(false);
const editingGroup = ref(null);
const selectedGroup = ref(null);
const savingGroup = ref(false);
const groupFormValid = ref(false);

// Group form
const groupForm = ref({
  name: '',
  permissions: []
});

// Table headers
const tableHeaders = [
  { title: 'اسم المجموعة', key: 'name' },
  { title: 'عدد الأعضاء', key: 'memberCount' },
  { title: 'الصلاحيات', key: 'permissions', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false }
];

// Computed statistics
const groupStats = computed(() => [
  {
    label: 'إجمالي المجموعات',
    value: groups.value.length,
    icon: 'mdi-account-group',
    color: '#2196f3'
  },
  {
    label: 'مجموعات نشطة',
    value: groups.value.filter(g => g.memberCount > 0).length,
    icon: 'mdi-account-check',
    color: '#4caf50'
  },
  {
    label: 'مجموعات فارغة',
    value: groups.value.filter(g => g.memberCount === 0).length,
    icon: 'mdi-account-off',
    color: '#ff9800'
  }
]);

// Methods
const getGroupColor = (groupName) => {
  const colors = {
    'Admin': 'error',
    'Staff': 'warning',
    'Customer': 'primary',
    'Manager': 'success'
  };
  return colors[groupName] || 'grey';
};

const getGroupIcon = (groupName) => {
  const icons = {
    'Admin': 'mdi-shield-account',
    'Staff': 'mdi-account-tie',
    'Customer': 'mdi-account',
    'Manager': 'mdi-account-star'
  };
  return icons[groupName] || 'mdi-account-group';
};

const getMemberCountColor = (count) => {
  if (count === 0) return 'grey';
  if (count < 5) return 'warning';
  return 'success';
};

const saveGroup = async () => {
  if (!groupFormValid.value) return;

  // Validate group name uniqueness
  const existingGroup = groups.value.find(g => 
    g.name.toLowerCase() === groupForm.value.name.toLowerCase() && 
    g.id !== editingGroup.value?.id
  );
  
  if (existingGroup) {
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'اسم المجموعة موجود بالفعل. الرجاء اختيار اسم آخر.'
    });
    return;
  }

  savingGroup.value = true;
  try {
    const result = editingGroup.value 
      ? await updateGroup(editingGroup.value.id, groupForm.value)
      : await createGroup(groupForm.value);
    
    if (result.success) {
      showAddGroupDialog.value = false;
      resetGroupForm();
    }
  } catch (error) {
    console.error('Error saving group:', error);
    
    // Handle specific error cases
    let errorMessage = editingGroup.value 
      ? 'حدث خطأ أثناء تحديث المجموعة'
      : 'حدث خطأ أثناء إنشاء المجموعة';
    
    if (error.message.includes('UniqueConstraint')) {
      errorMessage = 'اسم المجموعة موجود بالفعل';
    } else if (error.message.includes('PermissionDenied')) {
      errorMessage = 'ليس لديك صلاحية لإدارة المجموعات';
    } else if (error.message.includes('ValidationError')) {
      errorMessage = 'بيانات المجموعة غير صالحة';
    }
    
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: errorMessage
    });
  } finally {
    savingGroup.value = false;
  }
};

const editGroup = (group) => {
  editingGroup.value = group;
  groupForm.value = {
    name: group.name,
    permissions: group.permissions.map(p => p.id)
  };
  showAddGroupDialog.value = true;
};

const viewGroup = (group) => {
  selectedGroup.value = group;
  showViewGroupDialog.value = true;
};

const deleteGroup = async (group) => {
  // Prevent deletion of groups with members
  if (group.memberCount > 0) {
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: `لا يمكن حذف المجموعة "${group.name}" لأنها تحتوي على ${group.memberCount} أعضاء. قم بنقل الأعضاء أولاً.`
    });
    return;
  }

  if (confirm(`هل أنت متأكد من حذف المجموعة "${group.name}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
    try {
      const result = await deleteGroupHandler(group.id);
      
      if (result.success) {
        store.dispatch('notifications/showNotification', {
          type: 'success',
          message: `تم حذف المجموعة "${group.name}" بنجاح`
        });
      }
    } catch (error) {
      console.error('Error deleting group:', error);
      
      // Handle specific error cases
      let errorMessage = 'حدث خطأ أثناء حذف المجموعة';
      
      if (error.message.includes('ProtectedError')) {
        errorMessage = 'لا يمكن حذف هذه المجموعة لأنها محمية من النظام';
      } else if (error.message.includes('ForeignKey')) {
        errorMessage = 'لا يمكن حذف المجموعة لأنها مرتبطة ببيانات أخرى';
      } else if (error.message.includes('PermissionDenied')) {
        errorMessage = 'ليس لديك صلاحية لحذف هذه المجموعة';
      }
      
      store.dispatch('notifications/showNotification', {
        type: 'error',
        message: errorMessage
      });
    }
  }
};

const resetGroupForm = () => {
  groupForm.value = {
    name: '',
    permissions: []
  };
  editingGroup.value = null;
};

// Lifecycle
onMounted(() => {
  fetchGroups();
});
</script>

<style scoped>
.access-denied {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--bg-surface);
}

.groups-manager {
  padding: 2rem;
  background: var(--bg-surface);
  min-height: 100vh;
}

.groups-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
}

.header-right {
  display: flex;
  gap: 1rem;
}

.add-group-btn {
  min-width: 120px;
}

.groups-content {
  background: var(--bg-card);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border-subtle);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.groups-table-section {
  background: var(--bg-card);
  border-radius: 12px;
  overflow: hidden;
}

.groups-table {
  border-radius: 12px;
}

.group-name {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--text-primary);
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  max-width: 300px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  min-width: 32px;
}

.dialog-title {
  font-size: 1.25rem;
  font-weight: 600;
  padding: 1.5rem;
}

.group-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.group-info h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.permissions-section h4 {
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 1rem;
  color: var(--text-primary);
}

.permissions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Responsive Design */
@media (max-width: 960px) {
  .groups-manager {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-right {
    justify-content: center;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
