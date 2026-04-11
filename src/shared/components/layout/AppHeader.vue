// @\components\Header.vue
<template>
  <v-app-bar 
    :color="isDarkMode ? 'grey-darken-4' : 'white'"
    :dark="isDarkMode"
    elevation="4"
    height="80"
    class="header-app-bar full-width-header"
    style="margin: 0; padding: 0; left: 0; right: 0; width: 100%; top: 0; position: sticky; z-index: 1000;"
  >
    <v-container class="header-container d-flex align-center justify-space-between" dir="rtl">
      <!-- Logo -->
      <div class="site-title">
        <router-link to="/" class="text-decoration-none">
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
            <v-icon :icon="item.icon" class="me-2" size="18" />
            {{ $t(item.title) }}
          </v-btn>
          
          <v-btn
            v-else
            variant="text"
            class="nav-btn"
            v-bind="props"
          >
            <v-icon :icon="item.icon" class="me-2" size="18" />
            {{ $t(item.title) }}
            <v-icon icon="mdi-chevron-down" class="ms-2" size="14" />
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
              <v-icon :icon="child.icon" size="16" color="amber-darken-2" />
            </template>
            <v-list-item-title>{{ $t(child.title) }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- Header Actions -->
      <div class="header-actions d-flex align-center" dir="rtl" style="display: flex; align-items: center;">
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
            <v-icon icon="mdi-heart" size="18" />
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
          <v-icon :icon="isDarkMode ? 'mdi-weather-night' : 'mdi-white-balance-sunny'" size="18" />
        </v-btn>

        <!-- Language Switcher -->
        <LanguageSwitcher />
              
        <!-- Login Button -->
        <v-btn
          v-if="!isAuthenticated"
          icon
          variant="outlined"
          class="action-btn"
          @click="handleLoginClick"
          :title="$t('login')"
        >
          <v-icon icon="mdi-account-circle" size="18" />
        </v-btn>

        <v-btn
          v-else
          icon
          variant="outlined"
          class="action-btn logged-in"
          :to="currentUserRole === 'admin' ? '/dashboard' : (currentUserRole === 'investor' ? '/investor' : '/profile')"
          :title="userDisplayName"
        >
          <v-avatar size="32" class="user-avatar">
            <v-img
              v-if="user?.profile?.avatar"
              :src="user.profile.avatar"
              :alt="userDisplayName"
              cover
            />
            <v-icon
              v-else
              icon="mdi-account-circle"
              size="24"
              color="primary"
            />
          </v-avatar>
        </v-btn>

        <!-- Mobile Menu Toggle -->
        <v-btn
          icon
          variant="outlined"
          class="action-btn mobile-menu-btn d-md-none"
          @click="emit('toggle-mobile-menu')"
          :title="$t('openMenu')"
        >
          <v-icon icon="mdi-menu" size="18" />
        </v-btn>
      </div>
    </v-container>
  </v-app-bar>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '@/composables/useAuth';
import { useCategories } from '@/composables/useCategories';
import { useI18n } from 'vue-i18n';
import { useAppConfig } from '@/composables/useAppConfig';
import NotificationsDropdown from '@/shared/components/common/NotificationsDropdown.vue';
import LanguageSwitcher from '@/shared/components/common/LanguageSwitcher.vue';

const props = defineProps({
  isDarkMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['toggle-mobile-menu', 'change-language', 'toggle-theme']);

const router = useRouter();
const { 
  isAuthenticated, 
  user, 
  currentUserRole, 
  isAdmin, 
  isInvestor 
} = useAuth();
const { rootCategories, loading: categoriesLoading } = useCategories();
const { t } = useI18n();
const { organizationName, initialize: initializeOrg } = useAppConfig();

// State
const showLanguageMenu = ref(false);
const isDarkMode = ref(false);
const languages = [
  { code: 'ar', name: 'العربية' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'ch', name: '中文' },
];

// Navigation items configuration
const navigationItems = computed(() => {
  const staticItems = [
    {
      title: 'home',
      to: '/',
      icon: 'mdi-home'
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
  ];

  // Add categories if loaded
  const categoriesItem = {
    title: 'products',
    icon: 'mdi-view-grid',
    children: rootCategories.value.map(category => ({
      title: category.slug, // Use slug as translation key
      to: `/category/${category.slug}`,
      icon: category.icon || 'mdi-folder'
    }))
  };

  // Insert categories after home and before gallery
  return [
    staticItems[0], // home
    categoriesItem,
    ...staticItems.slice(1) // gallery, about, contact
  ];
});

// Computed
const currentLang = computed(() => locale.value);
const wishlistCount = computed(() => 0); // TODO: Implement wishlist count in DRF Auth Store

const userDisplayName = computed(() => {
  if (user.value) {
    return user.value.firstName || user.value.username || 'مستخدم';
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
  const newTheme = !isDarkMode.value;
  isDarkMode.value = newTheme;
  emit('toggle-theme');
};

// Initialize auth state and organization data on mount
onMounted(async () => {
  // Auth state is automatically initialized by useAuth composable
  // Initialize organization data
  await initializeOrg();
});
</script>

<style scoped>
.full-width-header {
  margin: 0 !important;
  padding: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  max-width: none !important;
  top: 0 !important;
  position: sticky !important;
  z-index: 1000 !important;
}

/* Remove spacing issues */
.header-app-bar {
  backdrop-filter: blur(10px) !important;
  border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
  margin: 0 !important;
  padding: 0 !important;
  left: 0 !important;
  right: 0 !important;
  width: 100% !important;
  top: 0 !important;
  position: sticky !important;
  z-index: 1000 !important;
  min-height: 80px !important;
  max-height: 80px !important;
}

/* Remove Vuetify default spacing */
.v-app-bar {
  margin: 0 !important;
  padding: 0 !important;
}

.v-app-bar > .v-toolbar__content {
  padding: 0 !important;
  margin: 0 !important;
}

.v-container {
  padding: 0 20px !important;
  margin: 0 !important;
}

/* Remove v-main default padding */
.v-main {
  padding: 0 !important;
  margin: 0 !important;
}

.v-main > .v-main__wrap {
  padding: 0 !important;
  margin: 0 !important;
}

/* Remove any body/app margin */
.v-application {
  padding: 0 !important;
  margin: 0 !important;
}

.header-container {
  max-width: 1200px !important;
  height: 100% !important;
  margin: 0 auto !important;
  padding: 0 20px !important;
  width: 100% !important;
  direction: rtl !important;
}

/* Header Actions RTL */
.header-actions {
  display: flex !important;
  align-items: center !important;
  direction: rtl !important;
}

/* RTL Support for Navigation */
[dir="rtl"] .desktop-nav-menu {
  direction: rtl !important;
}

[dir="rtl"] .nav-btn {
  direction: rtl !important;
}

[dir="rtl"] .dropdown-list {
  direction: rtl !important;
  text-align: right !important;
}

[dir="rtl"] .dropdown-item {
  direction: rtl !important;
}

[dir="rtl"] .v-list-item-title {
  text-align: right !important;
}

/* Icon Standardization */
.header-app-bar .v-icon {
  width: 18px !important;
  height: 18px !important;
  font-size: 18px !important;
}

.dropdown-item .v-icon {
  width: 16px !important;
  height: 16px !important;
  font-size: 16px !important;
}

.nav-btn .v-icon--first {
  width: 18px !important;
  height: 18px !important;
  font-size: 18px !important;
}

.nav-btn .v-icon--last {
  width: 14px !important;
  height: 14px !important;
  font-size: 14px !important;
}

.action-btn .v-icon {
  width: 18px !important;
  height: 18px !important;
  font-size: 18px !important;
}

/* Logo Styling */
.site-title {
  font-size: 1.5rem;
  font-weight: 800;
}

.site-logo {
  background: linear-gradient(135deg, #d4af37 0%, #f4e4bc 50%, #d4af37 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.5px;
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

.action-btn.logged-in {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(212, 175, 55, 0.3) !important;
}

.action-btn.logged-in:hover {
  border-color: #d4af37 !important;
  color: #d4af37 !important;
}

/* Remove old login button styles */
.login-btn {
  /* Deprecated - using action-btn instead */
}

/* Mobile Menu Button */
.mobile-menu-btn {
  /* Same style as action-btn - no special styling needed */
}

/* Responsive Design */
@media (max-width: 960px) {
  .desktop-nav-menu {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: flex !important;
  }
  
  /* All action buttons remain the same size on mobile */
  .action-btn {
    width: 42px !important;
    height: 42px !important;
    min-width: 42px !important;
    padding: 0 !important;
  }
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
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

/* Responsive Design */
@media (max-width: 768px) {
  .header-app-bar {
    height: 60px !important;
  }
  
  .header-container {
    padding: 0 10px !important;
  }
  
  .action-btn {
    width: 36px !important;
    height: 36px !important;
  }
  
  .site-logo {
    font-size: 14px !important;
  }
  
  .nav-btn {
    font-size: 12px !important;
    padding: 4px 8px !important;
  }
  
  .header-actions {
    gap: 8px !important;
  }
  
  .dropdown-list {
    position: fixed !important;
    top: 100% !important;
    left: 0 !important;
    right: 0 !important;
    max-height: 50vh !important;
    overflow-y: auto !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .header-app-bar {
    height: 70px !important;
  }
  
  .header-container {
    padding: 0 15px !important;
  }
  
  .action-btn {
    width: 38px !important;
    height: 38px !important;
  }
  
  .site-logo {
    font-size: 16px !important;
  }
}

@media (min-width: 1025px) {
  .header-app-bar {
    height: 80px !important;
  }
  
  .header-container {
    padding: 0 20px !important;
  }
  
  .action-btn {
    width: 42px !important;
    height: 42px !important;
  }
  
  .site-logo {
    font-size: 18px !important;
  }
}

/* Performance Improvements */
.header-app-bar {
  will-change: transform !important;
  transition: all 0.3s ease !important;
}

.action-btn {
  border-radius: 50% !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transform: scale(1) !important;
  transition: all 0.2s ease !important;
}

.action-btn:hover {
  transform: scale(1.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
}

/* Mobile Touch Improvements */
@media (max-width: 768px) {
  .action-btn {
    -webkit-tap-highlight-color: transparent !important;
    touch-action: manipulation !important;
  }
  
  .nav-btn {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: block !important;
  }
}
</style>
