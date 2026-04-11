<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    :permanent="!temporary"
    :temporary="temporary"
    @click="rail = false"
    class="sidebar-royal"
    theme="dark"
    width="300"
    rail-width="56"
  >
    <!-- Logo Section -->
    <v-list-item class="pa-4 mb-2">
      <template v-slot:prepend>
        <v-avatar color="primary" rounded="lg" size="45" class="elevation-4">
          <v-icon icon="mdi-paint-roller" size="24" />
        </v-avatar>
      </template>
      
      <v-list-item-title class="text-h6 font-weight-black">
        <span class="gold-text">PACLOS</span>
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption opacity-70">
        {{ $t('luxuryControlPanel') || 'لوحة التحكم الفاخرة' }}
      </v-list-item-subtitle>
      
      <template v-slot:append>
        <v-btn
          variant="text"
          icon="mdi-chevron-left"
          @click.stop="toggleRail"
          size="small"
        />
      </template>
    </v-list-item>

    <v-divider class="mx-4 opacity-20" thickness="1" />

    <!-- Navigation Menu -->
    <v-list nav density="comfortable" class="pa-4">
      <template v-for="(item, index) in menuItems" :key="index">
        <!-- Menu Group -->
        <v-list-group v-if="item.items" :value="item.label">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :prepend-icon="item.icon"
              :title="$t(item.labelKey) || item.label"
              class="rounded-lg mb-1 menu-item"
            >
              <template v-slot:append>
                <v-badge
                  v-if="item.badge"
                  :content="item.badge"
                  color="error"
                  inline
                />
              </template>
            </v-list-item>
          </template>

          <v-list-item
            v-for="(sub, subIdx) in item.items"
            :key="subIdx"
            :title="$t(sub.labelKey) || sub.label"
            :prepend-icon="sub.icon"
            :to="sub.to"
            rounded="lg"
            class="mb-1 ps-8 sub-menu-item"
            active-color="primary"
            exact
          >
            <template v-slot:append>
              <v-badge
                v-if="sub.badge"
                :content="sub.badge"
                color="error"
                inline
              />
            </template>
          </v-list-item>
        </v-list-group>

        <!-- Single Menu Item -->
        <v-list-item
          v-else
          :prepend-icon="item.icon"
          :title="$t(item.labelKey) || item.label"
          :to="item.to"
          rounded="lg"
          class="mb-1 menu-item"
          active-color="primary"
          exact
        >
          <template v-slot:append>
            <v-badge
              v-if="item.badge"
              :content="item.badge"
              color="error"
              inline
            />
          </template>
        </v-list-item>
      </template>
    </v-list>

    <!-- User Section -->
    <template v-slot:append>
      <div class="pa-4">
        <!-- User Profile Card -->
        <v-card
          v-if="!rail"
          variant="tonal"
          color="rgba(var(--v-theme-primary), 0.1)"
          class="rounded-xl pa-2 mb-4 user-card"
        >
          <v-list-item
            :prepend-avatar="user?.avatar || '/default-avatar.png'"
            :title="user?.username || $t('admin') || 'المدير'"
            :subtitle="$t('systemAdmin') || 'مسؤول النظام'"
          >
            <template v-slot:append>
              <v-menu>
                <template v-slot:activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    variant="text"
                    size="small"
                  />
                </template>
                <v-list density="compact">
                  <v-list-item
                    prepend-icon="mdi-account-edit"
                    :title="$t('editProfile') || 'تعديل الملف الشخصي'"
                    @click="$emit('edit-profile')"
                  />
                  <v-list-item
                    prepend-icon="mdi-cog"
                    :title="$t('settings') || 'الإعدادات'"
                    @click="$emit('settings')"
                  />
                </v-list>
              </v-menu>
            </template>
          </v-list-item>
        </v-card>
        
        <!-- Logout Button -->
        <v-btn
          block
          color="error"
          variant="flat"
          rounded="pill"
          prepend-icon="mdi-logout"
          @click="handleLogout"
          :size="rail ? 'small' : 'default'"
          class="logout-btn"
        >
          <span v-if="!rail">{{ $t('logout') || 'تسجيل الخروج' }}</span>
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const router = useRouter();
const authStore = useAuthStore();

// Props
const props = defineProps({
  temporary: { type: Boolean, default: false }
});

// Emits
const emit = defineEmits(['edit-profile', 'settings']);

// State
const drawer = ref(true);
const rail = ref(false);
const user = computed(() => authStore.user || { username: 'Remadna', avatar: null });

// Computed
const menuItems = computed(() => {
  const common = [
    { 
      label: 'dashboard', 
      labelKey: 'dashboard',
      icon: 'mdi-view-dashboard-outline', 
      to: '/admin',
      badge: null
    },
    { 
      label: 'orders', 
      labelKey: 'orders',
      icon: 'mdi-cart-outline', 
      to: '/admin/orders',
      badge: '5' // Example badge count
    },
    { 
      label: 'catalog', 
      labelKey: 'catalog',
      icon: 'mdi-format-list-bulleted', 
      to: '/admin/catalog',
      badge: null
    },
  ];

  // Investors section
  const investorItems = {
    label: 'investors',
    labelKey: 'investors',
    icon: 'mdi-trending-up',
    badge: null,
    items: [
      { 
        label: 'investorDashboard', 
        labelKey: 'investorDashboard',
        icon: 'mdi-chart-arc', 
        to: '/investor',
        badge: null
      },
      { 
        label: 'financialReports', 
        labelKey: 'financialReports',
        icon: 'mdi-cash-register', 
        to: '/investor/reports',
        badge: null
      },
      { 
        label: 'aiInsights', 
        labelKey: 'aiInsights',
        icon: 'mdi-brain', 
        to: '/investor/ai-insights',
        badge: '2' // Example badge for new insights
      },
    ]
  };

  return [...common, investorItems];
});

// Methods
const toggleRail = () => {
  rail.value = !rail.value;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('❌ Logout error:', error);
    // Fallback logout
    router.push('/login');
  }
};
</script>

<style scoped>
.sidebar-royal {
  background: linear-gradient(180deg, rgb(var(--v-theme-surface)) 0%, rgb(var(--v-theme-surface-variant)) 100%) !important;
  border-right: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.gold-text {
  color: rgb(var(--v-theme-primary));
  letter-spacing: 1.5px;
  font-weight: 900;
}

/* Menu items */
.menu-item {
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.menu-item:hover {
  transform: translateX(-2px);
}

.sub-menu-item {
  transition: all 0.3s ease;
  margin-bottom: 2px;
}

.sub-menu-item:hover {
  transform: translateX(-1px);
}

/* Active states */
:deep(.v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.1) !important;
  color: rgb(var(--v-theme-primary)) !important;
}

:deep(.v-list-item--active .v-list-item__prepend) {
  color: rgb(var(--v-theme-primary)) !important;
}

/* List group styling */
:deep(.v-list-group__items .v-list-item) {
  padding-inline-start: 32px !important;
}

:deep(.v-list-group__items) {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 8px;
  margin: 4px 0;
}

/* User card */
.user-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.15);
}

/* Logout button */
.logout-btn {
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-error), 0.3);
}

/* Scrollbar styling */
:deep(.v-navigation-drawer__content) {
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--v-theme-outline), 0.3) transparent;
}

:deep(.v-navigation-drawer__content::-webkit-scrollbar) {
  width: 4px;
}

:deep(.v-navigation-drawer__content::-webkit-scrollbar-track) {
  background: transparent;
}

:deep(.v-navigation-drawer__content::-webkit-scrollbar-thumb) {
  background: rgba(var(--v-theme-outline), 0.3);
  border-radius: 2px;
}

:deep(.v-navigation-drawer__content::-webkit-scrollbar-thumb:hover) {
  background: rgba(var(--v-theme-outline), 0.5);
}

/* Rail mode adjustments */
:deep(.v-navigation-drawer--rail) {
  .menu-item {
    margin-bottom: 2px;
  }
  
  .user-card {
    margin-bottom: 8px;
  }
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .sidebar-royal {
    width: 280px !important;
  }
}

@media (max-width: 600px) {
  .sidebar-royal {
    width: 100vw !important;
  }
  
  .menu-item {
    margin-bottom: 2px;
  }
  
  .sub-menu-item {
    padding-inline-start: 24px !important;
  }
}
</style>
