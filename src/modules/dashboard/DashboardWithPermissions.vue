<template>
  <div class="dashboard">
    <!-- Navigation with Permission-based Access -->
    <v-navigation-drawer v-model="drawer" app>
      <v-list>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.title"
          :prepend-icon="item.icon"
          :title="item.title"
          :to="item.to"
          v-if="item.canAccess"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <!-- Finance Section - Only for Accountants group -->
        <v-card v-if="canAccessFinanceSection" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-currency-usd</v-icon>
            قسم المالية
          </v-card-title>
          <v-card-text>
            محتوى قسم المالية يظهر فقط لمجموعة المحاسبين
          </v-card-text>
        </v-card>

        <!-- User Management Section - Only for Admin/HR groups -->
        <v-card v-if="canManageUsersSection" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-account-group</v-icon>
            إدارة المستخدمين
          </v-card-title>
          <v-card-text>
            محتوى إدارة المستخدمين يظهر فقط لمجموعات Admin و HR
          </v-card-text>
        </v-card>

        <!-- Reports Section - Only for Managers/Admin groups -->
        <v-card v-if="canAccessReportsSection" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-chart-box</v-icon>
            التقارير
          </v-card-title>
          <v-card-text>
            محتوى التقارير يظهر فقط لمجموعات Managers و Admin
          </v-card-text>
        </v-card>

        <!-- Settings Section - Only for Admin group -->
        <v-card v-if="canAccessSettingsSection" class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-cog</v-icon>
            الإعدادات
          </v-card-title>
          <v-card-text>
            محتوى الإعدادات يظهر فقط لمجموعة Admin
          </v-card-text>
        </v-card>

        <!-- Public Section - Accessible to all authenticated users -->
        <v-card class="mb-4">
          <v-card-title>
            <v-icon class="me-2">mdi-home</v-icon>
            الرئيسية
          </v-card-title>
          <v-card-text>
            محتوى عام متاح لجميع المستخدمين المسجلين
          </v-card-text>
        </v-card>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { usePermissions } from '@/composables/usePermissions';

const { user, isAuthenticated } = useAuth();
const {
  canAccessFinance,
  canManageUsers,
  canAccessReports,
  canAccessSettings
} = usePermissions();

const drawer = ref(true);

// Permission-based navigation items
const navigationItems = computed(() => [
  {
    title: 'الرئيسية',
    icon: 'mdi-home',
    to: '/dashboard',
    canAccess: true // All authenticated users
  },
  {
    title: 'المالية',
    icon: 'mdi-currency-usd',
    to: '/finance',
    canAccess: false // Will be updated by permission check
  },
  {
    title: 'المستخدمين',
    icon: 'mdi-account-group',
    to: '/admin/users',
    canAccess: false // Will be updated by permission check
  },
  {
    title: 'المجموعات',
    icon: 'mdi-account-group-outline',
    to: '/admin/groups',
    canAccess: false // Will be updated by permission check
  },
  {
    title: 'التقارير',
    icon: 'mdi-chart-box',
    to: '/reports',
    canAccess: false // Will be updated by permission check
  },
  {
    title: 'الإعدادات',
    icon: 'mdi-cog',
    to: '/settings',
    canAccess: false // Will be updated by permission check
  }
]);

// Permission-based section visibility
const canAccessFinanceSection = ref(false);
const canManageUsersSection = ref(false);
const canAccessReportsSection = ref(false);
const canAccessSettingsSection = ref(false);

// Check permissions on component mount
onMounted(async () => {
  if (isAuthenticated.value) {
    // Check individual permissions
    canAccessFinanceSection.value = await canAccessFinance();
    canManageUsersSection.value = await canManageUsers();
    canAccessReportsSection.value = await canAccessReports();
    canAccessSettingsSection.value = await canAccessSettings();

    // Update navigation items based on permissions
    navigationItems.value[1].canAccess = canAccessFinanceSection.value; // Finance
    navigationItems.value[2].canAccess = canManageUsersSection.value; // Users
    navigationItems.value[3].canAccess = canManageUsersSection.value; // Groups
    navigationItems.value[4].canAccess = canAccessReportsSection.value; // Reports
    navigationItems.value[5].canAccess = canAccessSettingsSection.value; // Settings
  }
});
</script>

<style scoped>
.dashboard {
  direction: rtl;
}

.v-card {
  margin-bottom: 1rem;
}

.v-card-title {
  display: flex;
  align-items: center;
  font-weight: 600;
}
</style>
