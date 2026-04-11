<template>
  <v-app-bar 
    :color="isDarkMode ? 'grey-darken-4' : 'white'"
    :dark="isDarkMode"
    elevation="4"
    app
    height="80"
    class="header-app-bar"
  >
    <v-container class="header-container d-flex align-center justify-space-between">
      <!-- Logo -->
      <div class="site-title">
        <router-link to="/" class="text-decoration-none d-flex align-center">
          <img 
            v-if="organizationLogo" 
            :src="organizationLogo" 
            :alt="organizationName"
            class="site-logo-img me-2"
          />
          <span class="site-logo">{{ organizationName || $t('siteTitle') }}</span>
        </router-link>
      </div>

      <!-- Desktop Navigation -->
      <v-menu
        v-for="item in navigationItems"
        :key="item.title"
        open-on-hover
        offset-y
        transition="slide-y-transition"
        :close-on-content-click="false"
        class="desktop-nav-menu"
      >
        <template v-slot:activator="{ props }">
          <v-btn
            v-if="!item.children"
            :to="item.to"
            variant="text"
            class="nav-btn"
            v-bind="props"
          >
            <v-icon :icon="item.icon" class="me-2" size="20" />
            {{ $t(item.title) }}
          </v-btn>
          
          <v-btn
            v-else
            variant="text"
            class="nav-btn"
            v-bind="props"
          >
            <v-icon :icon="item.icon" class="me-2" size="20" />
            {{ $t(item.title) }}
            <v-icon icon="mdi-chevron-down" class="ms-2" size="16" />
          </v-btn>
        </template>

        <v-list v-if="item.children" class="dropdown-list">
          <v-list-item
            v-for="child in item.children"
            :key="child.title"
            :to="child.to"
            class="dropdown-item"
          >
            <template v-slot:prepend>
              <v-icon :icon="child.icon" size="20" color="amber-darken-2" />
            </template>
            <v-list-item-title>{{ $t(child.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Header Actions -->
      <div class="header-actions d-flex align-center">
        <!-- Wishlist Icon -->
        <v-btn
          :to="'/wishlist'"
          icon
          variant="outlined"
          class="action-btn"
          :title="$t('wishlist')"
        >
          <v-badge
            :content="wishlistCount"
            :color="wishlistCount > 0 ? 'error' : 'transparent'"
            :model-value="wishlistCount > 0"
            overlap
          >
            <v-icon icon="mdi-heart" size="20" />
          </v-badge>
        </v-btn>

        <!-- Notifications Dropdown -->
        <NotificationsDropdown />

        <!-- Theme Switcher -->
        <v-btn
          icon
          variant="outlined"
          class="action-btn"
          @click="toggleTheme"
          :title="$t('toggleTheme')"
        >
          <v-icon 
            :icon="isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night'" 
            size="20" 
          />
        </v-btn>

        <!-- Language Switcher -->
        <LanguageSwitcher @change-language="changeLanguage" />

        <!-- Login Button -->
        <v-btn
          v-if="!isAuthenticated"
          color="amber-darken-2"
          variant="elevated"
          class="login-btn"
          @click="handleLoginClick"
          prepend-icon="mdi-account-circle"
        >
          {{ $t('login') }}
        </v-btn>

        <v-btn
          v-else
          :to="authStore.role === 'admin' ? '/dashboard' : (authStore.role === 'investor' ? '/investor' : '/profile')"
          variant="outlined"
          class="login-btn logged-in"
          prepend-icon="mdi-check-circle"
        >
          {{ userDisplayName }}
        </v-btn>

        <!-- Mobile Menu Toggle -->
        <v-btn
          icon
          variant="outlined"
          class="mobile-menu-btn d-md-none"
          @click="emit('toggle-mobile-menu')"
          :title="$t('openMenu')"
        >
          <v-icon icon="mdi-menu" size="20" />
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useI18n } from 'vue-i18n';
import { useOrganizationStore } from '@/stores/organization';
import NotificationsDropdown from './NotificationsDropdown.vue';
import LanguageSwitcher from './common/LanguageSwitcher.vue';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-mobile-menu', 'change-language', 'toggle-theme']);

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

// Organization store
const organizationStore = useOrganizationStore();
const { 
  organizationName, 
  organizationLogo: getOrganizationLogo,
  initialize: initializeOrg 
} = organizationStore;

// Navigation items configuration
const navigationItems = computed(() => [
  {
    title: 'home',
    to: '/',
    icon: 'mdi-home'
  },
  {
    title: 'products',
    icon: 'mdi-view-grid',
    children: [
      {
        title: 'furniture',
        to: '/furniture',
        icon: 'mdi-sofa'
      },
      {
        title: 'doors',
        to: '/doors',
        icon: 'mdi-door-open'
      },
      {
        title: 'walls',
        to: '/walls',
        icon: 'mdi-roller-shade'
      },
      {
        title: 'ceilings',
        to: '/ceilings',
        icon: 'mdi-arrow-up-bold'
      },
      {
        title: 'tiles',
        to: '/tiles',
        icon: 'mdi-grid'
      },
      {
        title: 'kitchens',
        to: '/kitchens',
        icon: 'mdi-silverware-fork-knife'
      },
      {
        title: 'cars',
        to: '/cars',
        icon: 'mdi-car'
      }
    ]
  },
  {
    title: 'gallery',
    to: '/gallery',
    icon: 'mdi-image-multiple'
  },
  {
    title: 'about',
    to: '/about',
    icon: 'mdi-account-group'
  },
  {
    title: 'contact',
    to: '/contact',
    icon: 'mdi-phone'
  }
]);

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);
const currentUser = computed(() => authStore.user);
const wishlistCount = computed(() => 0); // TODO: Implement wishlist count in DRF Auth Store

// Organization computed properties
const organizationLogo = computed(() => {
  if (organizationStore.organization?.logo) {
    // Get full URL from organization store
    return organizationStore.organization.logo_url || organizationStore.organization.logo;
  }
  return null;
});

const userDisplayName = computed(() => {
  if (authStore.user) {
    return authStore.user.firstName || authStore.user.username || 'مستخدم';
  }
  return 'ضيف';
});

// Methods
const handleLoginClick = () => {
  console.log('✅ Header: تم النقر على زر تسجيل الدخول - التوجيه لصفحة الدخول المتقدمة');
  router.push('/auth');
};

const changeLanguage = (lang) => {
  emit('change-language', lang);
};

const toggleTheme = () => {
  emit('toggle-theme');
};

// Initialize auth and organization stores on mount
onMounted(async () => {
  authStore.initializeAuth();
  await initializeOrg();
});
</script>

<style scoped>
.header-app-bar {
  backdrop-filter: blur(10px) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
}

.header-container {
  max-width: 1200px !important;
  height: 100% !important;
}

/* Logo Styling */
.site-title {
  font-size: 1.5rem;
  font-weight: 800;
}

.site-logo-img {
  height: 40px;
  width: auto;
  object-fit: contain;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.site-logo-img:hover {
  transform: scale(1.05);
}

.site-logo {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
  font-size: 1.5rem;
  font-weight: 800;
}

/* Navigation Buttons */
.nav-btn {
  text-transform: none !important;
  font-weight: 600 !important;
  font-size: 0.95rem !important;
  color: rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s ease !important;
}

.nav-btn:hover {
  color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
}

.nav-btn.v-btn--active {
  color: #d4af37 !important;
}

/* Dropdown Menu */
.dropdown-list {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(212, 175, 55, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.1) !important;
  min-width: 260px !important;
  padding: 8px !important;
}

.dropdown-item {
  margin: 4px 0 !important;
  border-radius: 8px !important;
  transition: all 0.3s ease !important;
}

.dropdown-item:hover {
  background: rgba(212, 175, 55, 0.1) !important;
  transform: translateX(5px);
}

.dropdown-item .v-list-item-title {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 0.95rem !important;
}

.dropdown-item:hover .v-list-item-title {
  color: #d4af37 !important;
}

/* Action Buttons */
.action-btn {
  width: 42px !important;
  height: 42px !important;
  border-radius: 50% !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
  background: rgba(255, 255, 255, 0.05) !important;
  color: #d4af37 !important;
  transition: all 0.3s ease !important;
}

.action-btn:hover {
  border-color: #d4af37 !important;
  background: rgba(212, 175, 55, 0.1) !important;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3) !important;
}

/* Login Button */
.login-btn {
  text-transform: none !important;
  font-weight: 700 !important;
  font-size: 0.95rem !important;
  border-radius: 30px !important;
  transition: all 0.3s ease !important;
}

.login-btn:hover {
  transform: translateY(-2px) !important;
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.4) !important;
}

.login-btn.logged-in {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
}

.login-btn.logged-in:hover {
  border-color: #d4af37 !important;
  color: #d4af37 !important;
}

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none !important;
}

/* Responsive Design */
@media (max-width: 960px) {
  .desktop-nav-menu {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: flex !important;
  }
  
  .login-btn .v-btn__content {
    display: none !important;
  }
  
  .login-btn {
    min-width: 42px !important;
    width: 42px !important;
    height: 42px !important;
    border-radius: 50% !important;
    padding: 0 !important;
  }
}

/* Light Mode Styles */
.v-theme--light .header-app-bar {
  background: rgba(255, 255, 255, 0.98) !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.v-theme--light .nav-btn {
  color: rgba(0, 0, 0, 0.7) !important;
}

.v-theme--light .nav-btn:hover,
.v-theme--light .nav-btn.v-btn--active {
  color: #d4af37 !important;
}

.v-theme--light .dropdown-list {
  background: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(0, 0, 0, 0.1) !important;
}

.v-theme--light .dropdown-item .v-list-item-title {
  color: rgba(0, 0, 0, 0.9) !important;
}

.v-theme--light .action-btn {
  background: rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
  color: #d4af37 !important;
}

.v-theme--light .login-btn.logged-in {
  background: rgba(0, 0, 0, 0.05) !important;
  color: rgba(0, 0, 0, 0.9) !important;
  border: 1px solid rgba(0, 0, 0, 0.2) !important;
}

/* RTL Support */
[dir="rtl"] .dropdown-item:hover {
  transform: translateX(-5px);
}

[dir="rtl"] .nav-btn .v-icon--first {
  margin-left: 8px !important;
  margin-right: 0 !important;
}

[dir="rtl"] .nav-btn .v-icon--last {
  margin-right: 8px !important;
  margin-left: 0 !important;
}
</style>
