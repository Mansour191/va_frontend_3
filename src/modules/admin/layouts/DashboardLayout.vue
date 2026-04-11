// src\views\dashboard\DashboardLayout.vue
<template>
  <v-app>
    <!-- Animated Background Particles -->
    <div class="particles">
      <div v-for="n in 30" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>

    <v-navigation-drawer
      v-model="drawer"
      :rail="isSidebarCollapsed"
      :temporary="mobileMenuOpen"
      :permanent="!mobileMenuOpen"
      location="end"
      class="dashboard-sidebar"
      color="sidebar"
      width="300"
      rail-width="90"
    >
      <!-- Logo Section -->
      <div class="sidebar-header">
        <div class="logo-wrapper">
          <v-avatar size="40" color="primary" class="logo-avatar">
            <v-icon size="24">mdi-palette</v-icon>
          </v-avatar>
          <div class="logo-text-wrapper" v-if="!isSidebarCollapsed">
            <h2 class="logo-text">Vinyl<span>Art</span></h2>
            <v-chip size="x-small" color="primary" variant="elevated" class="logo-badge">
              PRO
            </v-chip>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <v-list density="compact" class="sidebar-nav">
        <div v-for="section in navSections" :key="section.title">
          <v-list-subheader v-if="!isSidebarCollapsed" class="nav-section-title">
            {{ section.title }}
          </v-list-subheader>
          
          <v-list-item
            v-for="item in section.items"
            :key="item.path"
            :to="item.path"
            :value="item.path"
            :prepend-icon="getVuetifyIcon(item.icon)"
            :title="item.title"
            nav
            class="nav-item"
            @click="handleNavClick"
          >
            <template v-slot:append v-if="item.badge && !isSidebarCollapsed">
              <v-chip size="x-small" color="error" variant="elevated">
                {{ item.badge }}
              </v-chip>
            </template>
          </v-list-item>
          
          <v-divider v-if="!isSidebarCollapsed" class="my-2" />
        </div>
      </v-list>

      <!-- User Section -->
      <template v-slot:append>
        <div class="sidebar-footer">
          <v-card v-if="!isSidebarCollapsed" class="user-card mb-3" variant="tonal">
            <v-card-text class="pa-3">
              <div class="d-flex align-center ga-3">
                <v-avatar size="40" :image="userAvatar" />
                <div class="flex-grow-1">
                  <div class="text-body-2 font-weight-medium">{{ userName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ userRoleText }}</div>
                </div>
                <v-icon size="8" color="success">mdi-circle</v-icon>
              </div>
            </v-card-text>
          </v-card>

          <v-btn
            @click="toggleSidebar"
            variant="tonal"
            color="primary"
            block
            class="sidebar-toggle"
          >
            <v-icon>
              {{ isSidebarCollapsed ? 'mdi-chevron-left' : 'mdi-chevron-right' }}
            </v-icon>
            <span v-if="!isSidebarCollapsed">{{ $t('toggleSidebar') || 'طي الشريط' }}</span>
          </v-btn>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main class="dashboard-main">
      <!-- Header -->
      <v-app-bar
        :elevation="isHeaderScrolled ? 8 : 0"
        color="surface"
        class="dashboard-header"
        :height="80"
      >
        <v-app-bar-nav-icon @click="toggleMobileMenu" class="d-lg-none">
          <v-icon>mdi-menu</v-icon>
        </v-app-bar-nav-icon>

        <v-spacer />

        <!-- Page Title -->
        <div class="page-title">
          <h1 class="text-h4 font-weight-bold mb-1">{{ pageTitle }}</h1>
          <v-breadcrumbs :items="breadcrumbs" class="text-caption">
            <template v-slot:prepend>
              <v-icon size="small" color="primary">mdi-home</v-icon>
            </template>
          </v-breadcrumbs>
        </div>

        <v-spacer />

        <!-- Header Actions -->
        <div class="header-actions d-flex align-center ga-2">
          <!-- Search -->
          <v-text-field
            v-model="searchQuery"
            :label="$t('search') || 'بحث'"
            variant="outlined"
            density="compact"
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="header-search d-none d-md-flex"
            style="max-width: 320px;"
          />

          <!-- Language Switcher -->
          <LanguageSwitcher />

          <!-- Alert Center -->
          <AlertCenter />

          <!-- Currency Selector -->
          <CurrencySelector />

          <!-- Notifications -->
          <v-btn
            icon="mdi-bell"
            variant="tonal"
            color="primary"
            @click="toggleNotifications"
          >
            <v-badge content="3" color="error" dot />
          </v-btn>

          <!-- Messages -->
          <v-btn
            icon="mdi-email"
            variant="tonal"
            color="primary"
            @click="toggleMessages"
          >
            <v-badge content="5" color="error" dot />
          </v-btn>

          <!-- User Menu -->
          <v-menu v-model="showUserMenu" location="bottom end">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                variant="tonal"
                class="user-menu"
              >
                <v-avatar size="32" :image="userAvatar" />
                <v-icon class="ms-2">mdi-chevron-down</v-icon>
              </v-btn>
            </template>

            <v-card min-width="280" class="user-dropdown">
              <v-card-text class="pa-4">
                <div class="d-flex align-center ga-3 mb-4">
                  <v-avatar size="48" :image="userAvatar" />
                  <div>
                    <div class="text-body-2 font-weight-medium">{{ userName }}</div>
                    <div class="text-caption text-medium-emphasis">
                      {{ authStore.user?.email || 'user@vinylart.com' }}
                    </div>
                  </div>
                </div>

                <v-divider class="mb-2" />

                <v-list density="compact">
                  <v-list-item
                    :to="{ name: 'profile' }"
                    prepend-icon="mdi-account"
                    :title="$t('profile') || 'الملف الشخصي'"
                  />
                  <v-list-item
                    :to="{ name: 'settings' }"
                    prepend-icon="mdi-cog"
                    :title="$t('settings') || 'الإعدادات'"
                  />
                  <v-list-item
                    :to="{ name: 'integration-settings' }"
                    prepend-icon="mdi-connection"
                    :title="$t('erpSettings') || 'إعدادات ERPNext'"
                  />
                </v-list>

                <v-divider class="my-2" />

                <v-btn
                  @click="logout"
                  variant="text"
                  color="error"
                  prepend-icon="mdi-logout"
                  block
                >
                  {{ $t('logout') || 'تسجيل خروج' }}
                </v-btn>
              </v-card-text>
            </v-card>
          </v-menu>
        </div>
      </v-app-bar>

      <!-- Page Content -->
      <div class="dashboard-content">
        <ErrorBoundary>
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </ErrorBoundary>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AlertCenter from '@/shared/components/common/AlertCenter.vue';
import CurrencySelector from '@/shared/components/CurrencySelector.vue';
import LanguageSwitcher from '@/shared/components/common/LanguageSwitcher.vue';
import ErrorBoundary from '@/shared/components/ui/ErrorBoundary.vue';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const store = useStore();
const authStore = useAuthStore();

// State
const isSidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);
const showUserMenu = ref(false);
const isHeaderScrolled = ref(false);
const searchQuery = ref('');

// Computed
const drawer = computed({
  get: () => !isSidebarCollapsed.value,
  set: (val) => {
    isSidebarCollapsed.value = !val;
  }
});

const navSections = computed(() => {
  const common = [
    {
      title: t('main') || 'الرئيسية',
      items: [
        { 
          path: authStore.isAdmin ? '/dashboard' : '/investor', 
          icon: 'fa-solid fa-home', 
          title: t('dashboard') || 'لوحة التحكم' 
        },
      ],
    }
  ];

  if (authStore.isAdmin) {
    return [
      ...common,
      {
        title: t('management') || 'الإدارة',
        items: [
          { path: '/dashboard/products', icon: 'fa-solid fa-box', title: t('products') || 'المنتجات', badge: '12' },
          { path: '/dashboard/orders', icon: 'fa-solid fa-shopping-cart', title: t('orders') || 'الطلبات', badge: '5' },
          { path: '/dashboard/users', icon: 'fa-solid fa-users', title: t('users') || 'المستخدمين' },
          { path: '/dashboard/designs', icon: 'fa-solid fa-paint-brush', title: t('designs') || 'التصاميم' },
          { path: '/dashboard/integration', icon: 'fa-solid fa-plug', title: t('integration') || 'لوحة التكامل' },
          { path: '/dashboard/settings', icon: 'fa-solid fa-cog', title: t('settings') || 'الإعدادات' },
        ],
      },
      {
        title: t('analytics') || 'التحليلات',
        items: [
          { path: '/dashboard/analytics', icon: 'fa-solid fa-chart-pie', title: t('advancedAnalytics') || 'التحليلات المتقدمة' },
          { path: '/dashboard/forecasting', icon: 'fa-solid fa-chart-line', title: t('salesForecast') || 'توقعات المبيعات' },
        ],
      },
      {
        title: t('investorCorner') || 'ركن الممولين',
        items: [
          { path: '/investor', icon: 'fa-solid fa-external-link-alt', title: t('investorPlatform') || 'منصة الممولين' },
        ],
      },
    ];
  }

  if (authStore.role === 'investor') {
    return [
      ...common,
      {
        title: t('investorCorner') || 'ركن الممولين',
        items: [
          { path: '/investor', icon: 'fa-solid fa-chart-line', title: t('investorDashboard') || 'لوحة الممول الرئيسية' },
          { path: '/investor/reports', icon: 'fa-solid fa-file-invoice-dollar', title: t('investorReports') || 'التقارير المالية للممول' },
          { path: '/investor/ai-insights', icon: 'fa-solid fa-brain', title: t('investorAI') || 'تحليلات AI للممول' },
        ],
      },
    ];
  }

  return common;
});

const pageTitle = computed(() => route.meta?.title || t('dashboard') || 'لوحة التحكم');
const breadcrumbs = computed(() => [
  {
    title: t('home') || 'الرئيسية',
    disabled: false,
    href: '/dashboard'
  },
  {
    title: breadcrumbTitle.value,
    disabled: true
  }
]);
const breadcrumbTitle = computed(() => route.meta?.title || '');

const userName = computed(() => {
  const user = authStore.user;
  if (user?.firstName && user?.lastName) {
    return `${user.firstName} ${user.lastName}`;
  } else if (user?.firstName) {
    return user.firstName;
  } else if (user?.lastName) {
    return user.lastName;
  } else if (user?.username) {
    return user.username;
  } else {
    return t('user') || 'مستخدم';
  }
});

const userAvatar = computed(() => `https://ui-avatars.com/api/?name=${userName.value}&background=d4af37&color=fff&size=100`);
const userRoleText = computed(() => {
  const roles = { 
    admin: t('systemAdmin') || 'مدير النظام', 
    investor: t('strategicInvestor') || 'ممول استراتيجي', 
    customer: t('premiumCustomer') || 'عميل مميز' 
  };
  return roles[authStore.role] || t('guest') || 'زائر';
});

// Methods
const getParticleStyle = (n) => {
  return {
    left: Math.random() * 100 + '%',
    animationDelay: Math.random() * 20 + 's',
    animationDuration: 15 + Math.random() * 10 + 's',
    width: Math.random() * 3 + 1 + 'px',
    height: Math.random() * 3 + 1 + 'px',
    background: `rgba(212, 175, 55, ${0.2 + Math.random() * 0.3})`,
    filter: `blur(${Math.random() * 2}px)`,
  };
};

const getVuetifyIcon = (fontAwesomeClass) => {
  const iconMap = {
    'fa-solid fa-home': 'mdi-home',
    'fa-solid fa-box': 'mdi-package-variant',
    'fa-solid fa-shopping-cart': 'mdi-cart',
    'fa-solid fa-users': 'mdi-account-group',
    'fa-solid fa-paint-brush': 'mdi-brush',
    'fa-solid fa-plug': 'mdi-connection',
    'fa-solid fa-cog': 'mdi-cog',
    'fa-solid fa-chart-pie': 'mdi-chart-pie',
    'fa-solid fa-chart-line': 'mdi-chart-line',
    'fa-solid fa-external-link-alt': 'mdi-open-in-new',
    'fa-solid fa-file-invoice-dollar': 'mdi-file-invoice',
    'fa-solid fa-brain': 'mdi-brain',
  };
  return iconMap[fontAwesomeClass] || 'mdi-circle';
};

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value);
};

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
};

const toggleNotifications = () => {
  // Show notifications panel or navigate
  store.dispatch('notifications/showPanel');
};

const toggleMessages = () => {
  // Show messages panel or navigate
  console.log('Toggle messages');
};

const handleNavClick = () => {
  if (mobileMenuOpen.value) {
    mobileMenuOpen.value = false;
  }
};

const logout = () => {
  authStore.logout();
  router.push('/');
  
  // Show notification
  store.dispatch('notifications/add', {
    type: 'success',
    title: t('loggedOut') || 'تم تسجيل الخروج',
    message: t('loggedOutMessage') || 'تم تسجيل خروجك بنجاح',
    timeout: 3000
  });
};

const handleScroll = () => {
  isHeaderScrolled.value = window.scrollY > 50;
};

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  const saved = localStorage.getItem('sidebarCollapsed');
  if (saved) isSidebarCollapsed.value = saved === 'true';
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Watch
watch(isSidebarCollapsed, (val) => {
  localStorage.setItem('sidebarCollapsed', val);
});
</script>

<style scoped>
/* Particles Background */
.particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: floatParticle 20s infinite linear;
  opacity: 0;
}

@keyframes floatParticle {
  0% {
    transform: translateY(100vh) translateX(0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.8;
  }
  90% {
    opacity: 0.6;
  }
  100% {
    transform: translateY(-100px) translateX(100px) rotate(360deg);
    opacity: 0;
  }
}

/* Sidebar Styles */
.dashboard-sidebar {
  border-left: 1px solid rgba(var(--v-theme-outline), 0.2);
  backdrop-filter: blur(10px);
}

.sidebar-header {
  padding: 24px 16px;
  border-bottom: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-avatar {
  animation: logoFloat 3s ease infinite;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-5px) rotate(5deg);
  }
}

.logo-text-wrapper {
  transition: opacity 0.3s ease;
}

.logo-text {
  font-size: 1.6rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  position: relative;
}

.logo-text span {
  font-weight: 900;
  color: rgb(var(--v-theme-primary));
}

.logo-badge {
  animation: badgePulse 2s ease infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.9;
  }
}

/* Navigation */
.sidebar-nav {
  padding: 16px 12px;
}

.nav-section-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: rgb(var(--v-theme-on-surface-variant));
  opacity: 0.8;
  margin-bottom: 12px;
}

.nav-item {
  margin-bottom: 4px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.nav-item:hover {
  transform: translateX(-4px);
  background: rgba(var(--v-theme-primary), 0.1);
}

.nav-item.v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.15);
  border: 1px solid rgba(var(--v-theme-primary), 0.3);
  color: rgb(var(--v-theme-primary));
}

/* Footer */
.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(var(--v-theme-outline), 0.2);
}

.user-card {
  transition: all 0.3s ease;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.sidebar-toggle {
  transition: all 0.3s ease;
}

.sidebar-toggle:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2);
}

/* Header */
.dashboard-header {
  transition: all 0.3s ease;
  backdrop-filter: blur(20px);
}

.header-search {
  transition: all 0.3s ease;
}

.header-actions {
  gap: 8px;
}

.user-menu {
  transition: all 0.3s ease;
}

.user-menu:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.user-dropdown {
  backdrop-filter: blur(20px);
}

/* Main Content */
.dashboard-main {
  position: relative;
  z-index: 1;
}

.dashboard-content {
  padding: 24px;
  animation: contentFadeIn 0.6s ease;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.page-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Adjustments */
@media (max-width: 960px) {
  .dashboard-content {
    padding: 16px;
  }
}

@media (max-width: 600px) {
  .dashboard-content {
    padding: 12px;
  }
  
  .page-title h1 {
    font-size: 1.2rem;
  }
}

/* Vuetify Overrides */
:deep(.v-navigation-drawer) {
  background: rgb(var(--v-theme-surface)) !important;
}

:deep(.v-navigation-drawer .v-list-item) {
  margin-bottom: 4px;
  border-radius: 12px;
}

:deep(.v-navigation-drawer .v-list-item:hover) {
  background: rgba(var(--v-theme-primary), 0.1);
}

:deep(.v-navigation-drawer .v-list-item--active) {
  background: rgba(var(--v-theme-primary), 0.15);
  color: rgb(var(--v-theme-primary));
}

:deep(.v-app-bar) {
  background: rgb(var(--v-theme-surface)) !important;
  backdrop-filter: blur(20px);
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-1px);
}
</style>
