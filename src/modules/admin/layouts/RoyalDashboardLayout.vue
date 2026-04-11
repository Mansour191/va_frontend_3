<template>
  <v-app>
    <!-- Animated Background Particles -->
    <div class="particles">
      <div
        v-for="n in 30"
        :key="n"
        class="particle"
        :style="getParticleStyle(n)"
      ></div>
    </div>

    <!-- Royal Header -->
    <v-app-bar
      elevation="4"
      color="transparent"
      class="royal-header"
      height="80"
    >
      <v-container class="px-4 py-2">
        <div class="d-flex align-center justify-space-between">
          <!-- Logo & Title -->
          <div class="d-flex align-center ga-4">
            <v-app-bar-nav-icon
              @click="toggleSidebar"
              class="d-lg-none"
              variant="tonal"
              color="primary"
            >
              <v-icon>mdi-menu</v-icon>
            </v-app-bar-nav-icon>
            
            <div class="d-flex align-center ga-3">
              <v-avatar
                size="40"
                class="logo-avatar"
                gradient="primary"
              >
                <v-icon size="24" color="white">mdi-palette</v-icon>
              </v-avatar>
              <div>
                <h1 class="text-h5 font-weight-bold text-white mb-0">VinylArt</h1>
                <p class="text-caption text-medium-emphasis mb-0">Dashboard</p>
              </div>
            </div>
          </div>

          <!-- Search & Actions -->
          <div class="d-flex align-center ga-3">
            <!-- Search -->
            <v-text-field
              v-model="searchQuery"
              :placeholder="$t('searchDashboard') || 'بحث في لوحة التحكم...'"
              variant="solo-filled"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              hide-details
              class="search-field d-none d-md-flex"
              style="max-width: 320px;"
              bg-color="rgba(0,0,0,0.3)"
              color="white"
              base-color="white"
            />

            <!-- Notifications -->
            <v-btn
              icon="mdi-bell"
              variant="tonal"
              color="primary"
              @click="toggleNotifications"
            >
              <v-badge content="3" color="error" dot />
            </v-btn>

            <!-- User Menu -->
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <div class="d-flex align-center ga-3">
                  <v-avatar
                    :image="userAvatar"
                    size="40"
                    class="user-avatar"
                  >
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  
                  <div class="d-none d-lg-block">
                    <div class="text-body-2 font-weight-medium text-white">{{ userName }}</div>
                    <div class="text-caption text-medium-emphasis">{{ userRole }}</div>
                  </div>
                  
                  <v-btn
                    v-bind="props"
                    icon="mdi-chevron-down"
                    variant="tonal"
                    color="primary"
                    size="small"
                  />
                </div>
              </template>

              <v-card min-width="280" class="user-dropdown">
                <v-card-text class="pa-4">
                  <div class="d-flex align-center ga-3 mb-4">
                    <v-avatar :image="userAvatar" size="48">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
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
        </div>
      </v-container>
    </v-app-bar>

    <!-- Main Layout -->
    <v-main class="royal-main">
      <!-- Royal Sidebar -->
      <RoyalSidebar
        :visible="sidebarVisible"
        @hide="sidebarVisible = false"
      />

      <!-- Main Content -->
      <div class="main-content pa-6">
        <!-- Breadcrumb -->
        <v-breadcrumbs
          :items="breadcrumbs"
          class="mb-6"
          bg-color="transparent"
        >
          <template v-slot:prepend>
            <v-icon size="small" color="primary">mdi-home</v-icon>
          </template>
        </v-breadcrumbs>

        <!-- Page Content -->
        <div class="page-content">
          <transition name="page-transition" mode="out-in">
            <router-view />
          </transition>
        </div>
      </div>
    </v-main>

    <!-- Mobile Sidebar Overlay -->
    <v-overlay
      v-model="sidebarVisible"
      class="d-lg-none"
      @click="sidebarVisible = false"
    />
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import RoyalSidebar from '@/shared/components/ui/RoyalSidebar.vue';
import NavigationService from '@/services/NavigationService';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const store = useStore();
const authStore = useAuthStore();

// State
const sidebarVisible = ref(false);
const searchQuery = ref('');

// Computed
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

const userRole = computed(() => {
  const roles = { 
    admin: t('systemAdmin') || 'مدير النظام', 
    investor: t('strategicInvestor') || 'ممول استراتيجي', 
    customer: t('premiumCustomer') || 'عميل مميز' 
  };
  return roles[authStore.role] || t('guest') || 'زائر';
});

const userAvatar = computed(() => {
  return `https://ui-avatars.com/api/?name=${userName.value}&background=d4af37&color=fff&size=100`;
});

const breadcrumbs = computed(() => {
  return [
    {
      title: t('home') || 'الرئيسية',
      disabled: false,
      href: '/dashboard'
    },
    {
      title: route.meta?.title || t('dashboard') || 'لوحة التحكم',
      disabled: true
    }
  ];
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

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};

const toggleNotifications = () => {
  // Show notifications panel or navigate
  store.dispatch('notifications/showPanel');
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

const trackPageVisit = async () => {
  try {
    await NavigationService.trackPageVisit(
      route.path,
      route.meta?.title || t('dashboard')
    );
  } catch (error) {
    console.error('Error tracking page visit:', error);
  }
};

// Watchers
watch(() => route.path, () => {
  trackPageVisit();
  
  // Close sidebar on route change (mobile)
  if (window.innerWidth < 1024) {
    sidebarVisible.value = false;
  }
});

// Lifecycle
onMounted(() => {
  trackPageVisit();
  
  // Close sidebar on route change (mobile)
  if (window.innerWidth < 1024) {
    sidebarVisible.value = false;
  }
});
</script>

<style scoped>
/* Royal Theme Variables */
:root {
  --royal-primary: #6b46c1;
  --royal-secondary: #9333ea;
  --gold-primary: #d4af37;
  --gold-secondary: #f4e4c1;
  --marble-light: #fafafa;
  --marble-dark: #e4e4e7;
}

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
  animation: floatParticle 20s infinite ease-in-out;
}

@keyframes floatParticle {
  0%, 100% {
    transform: translateY(0) translateX(0) rotate(0deg);
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

/* Royal Header */
.royal-header {
  backdrop-filter: blur(20px) !important;
  background: rgba(107, 70, 193, 0.1) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  position: relative;
  z-index: 100;
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

.user-avatar {
  border: 2px solid var(--gold-primary);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.search-field {
  transition: all 0.3s ease;
}

.search-field:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

.user-dropdown {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

/* Main Content */
.royal-main {
  position: relative;
  z-index: 1;
  background: linear-gradient(135deg, 
    var(--marble-light) 0%, 
    var(--marble-dark) 25%, 
    #f4f4f5 50%, 
    var(--marble-dark) 75%, 
    var(--marble-light) 100%);
  background-size: 400% 400%;
  animation: marbleShift 15s ease infinite;
  min-height: 100vh;
}

@keyframes marbleShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.main-content {
  position: relative;
  z-index: 2;
}

.page-content {
  min-height: calc(100vh - 200px);
  animation: contentFadeIn 0.6s ease;
}

@keyframes contentFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Transitions */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.4s, transform 0.4s;
}

.page-transition-enter {
  opacity: 0;
  transform: translateY(20px);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Responsive Design */
@media (max-width: 960px) {
  .search-field {
    max-width: 200px !important;
  }
}

@media (max-width: 600px) {
  .royal-header {
    height: 70px !important;
  }
  
  .search-field {
    display: none !important;
  }
  
  .main-content {
    padding: 16px !important;
  }
}

/* Vuetify Overrides */
:deep(.v-app-bar) {
  backdrop-filter: blur(20px);
  background: rgba(107, 70, 193, 0.1) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
}

:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(107, 70, 193, 0.2);
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

:deep(.v-avatar) {
  transition: all 0.3s ease;
}

:deep(.v-avatar:hover) {
  transform: scale(1.05);
}

:deep(.v-card) {
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

:deep(.v-overlay) {
  backdrop-filter: blur(5px);
}

:deep(.v-breadcrumbs) {
  background: transparent;
}

:deep(.v-breadcrumbs-item) {
  color: rgb(var(--v-theme-primary));
}

:deep(.v-breadcrumbs-item--disabled) {
  color: rgb(var(--v-theme-on-surface-variant));
}
</style>
