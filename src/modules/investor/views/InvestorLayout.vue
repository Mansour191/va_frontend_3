<template>
  <v-app>
    <!-- Background Particles -->
    <div class="particles">
      <div v-for="n in 30" :key="n" class="particle" :style="getParticleStyle(n)"></div>
    </div>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="isRail"
      class="investor-sidebar"
      color="surface"
      width="280"
      rail-width="56"
    >
      <!-- Logo Section -->
      <div class="sidebar-header pa-4">
        <div class="d-flex align-center ga-3">
          <v-avatar color="primary" variant="tonal" size="40">
            <v-icon color="primary" size="24">mdi-crown</v-icon>
          </v-avatar>
          <div v-if="!isRail" class="flex-grow-1">
            <h2 class="text-h6 font-weight-bold text-primary">Premium<span class="text-primary">Hub</span></h2>
            <v-chip color="primary" variant="tonal" size="x-small">PRO</v-chip>
          </div>
        </div>
      </div>

      <v-divider class="my-2" />

      <!-- Navigation Items -->
      <v-list density="compact" nav>
        <v-list-subheader v-if="!isRail" class="text-caption text-medium-emphasis">
          {{ $t('strategicAnalysis') || 'التحليل الاستراتيجي' }}
        </v-list-subheader>

        <v-list-item
          to="/dashboard/investor"
          :value="'investor-hub'"
          title=""
          nav
        >
          <template v-slot:prepend>
            <v-icon>mdi-view-dashboard</v-icon>
          </template>
          <v-list-item-title>{{ $t('overview') || 'نظرة عامة' }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/dashboard/investor/ai-insights"
          :value="'ai-insights'"
          title=""
          nav
        >
          <template v-slot:prepend>
            <v-icon>mdi-brain</v-icon>
          </template>
          <v-list-item-title>{{ $t('businessIntelligence') || 'ذكاء الأعمال' }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/dashboard/investor/creative-voting"
          :value="'creative-voting'"
          title=""
          nav
        >
          <template v-slot:prepend>
            <v-icon>mdi-fingerprint</v-icon>
          </template>
          <v-list-item-title>{{ $t('innovationLab') || 'مختبر الابتكار' }}</v-list-item-title>
        </v-list-item>

        <v-list-item
          to="/dashboard/investor/reports"
          :value="'reports'"
          title=""
          nav
        >
          <template v-slot:prepend>
            <v-icon>mdi-chart-pie</v-icon>
          </template>
          <v-list-item-title>{{ $t('smartReports') || 'التقارير الذكية' }}</v-list-item-title>
        </v-list-item>

        <v-divider class="my-2" />

        <v-list-subheader v-if="!isRail" class="text-caption text-medium-emphasis">
          {{ $t('quickAccess') || 'الوصول السريع' }}
        </v-list-subheader>

        <v-list-item
          to="/"
          :value="'main-store'"
          title=""
          nav
        >
          <template v-slot:prepend>
            <v-icon>mdi-open-in-new</v-icon>
          </template>
          <v-list-item-title>{{ $t('mainStore') || 'المتجر الرئيسي' }}</v-list-item-title>
        </v-list-item>
      </v-list>

      <template v-slot:append>
        <div class="pa-4">
          <!-- User Card -->
          <v-card v-if="!isRail" variant="outlined" class="user-card mb-4">
            <v-card-text class="pa-3">
              <div class="d-flex align-center ga-3">
                <v-avatar size="32">
                  <v-img :src="userAvatar" :alt="userName" />
                </v-avatar>
                <div class="flex-grow-1">
                  <p class="text-body-2 font-weight-medium mb-0">{{ userName }}</p>
                  <p class="text-caption text-medium-emphasis mb-0">{{ $t('strategicInvestor') || 'ممول استراتيجي' }}</p>
                </div>
                <v-avatar size="8" color="success" variant="tonal">
                  <v-icon size="6" color="success">mdi-circle</v-icon>
                </v-avatar>
              </div>
            </v-card-text>
          </v-card>

          <!-- Logout Button -->
          <v-btn
            v-if="!isRail"
            @click="logout"
            variant="tonal"
            color="error"
            prepend-icon="mdi-logout"
            block
          >
            {{ $t('logout') || 'تسجيل خروج' }}
          </v-btn>

          <!-- Rail Toggle -->
          <v-btn
            @click="toggleRail"
            variant="tonal"
            color="primary"
            :icon="isRail ? 'mdi-chevron-right' : 'mdi-chevron-left'"
            class="rail-toggle"
          />
        </div>
      </template>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar
      :elevation="isScrolled ? 4 : 0"
      :color="isScrolled ? 'surface' : 'transparent'"
      class="investor-header"
      height="64"
    >
      <v-app-bar-nav-icon @click="drawer = !drawer" />

      <v-spacer />

      <!-- Header Actions -->
      <div class="d-flex align-center ga-2">
        <!-- Notifications -->
        <v-btn
          @click="toggleNotifications"
          variant="tonal"
          color="primary"
          icon="mdi-bell"
        >
          <v-badge
            v-if="unreadNotifications > 0"
            :content="unreadNotifications"
            color="error"
            offset-x="-4"
            offset-y="-4"
          />
        </v-btn>

        <!-- Search -->
        <v-btn
          @click="toggleSearch"
          variant="tonal"
          color="primary"
          icon="mdi-magnify"
        />

        <!-- Theme Toggle -->
        <v-btn
          @click="toggleTheme"
          variant="tonal"
          :color="isDark ? 'warning' : 'primary'"
          :icon="isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night'"
        />

        <!-- User Menu -->
        <v-menu offset-y>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              variant="tonal"
              color="primary"
              icon
            >
              <v-avatar size="32">
                <v-img :src="userAvatar" :alt="userName" />
              </v-avatar>
            </v-btn>
          </template>
          <v-list density="compact">
            <v-list-item @click="goToProfile">
              <template v-slot:prepend>
                <v-icon>mdi-account</v-icon>
              </template>
              <v-list-item-title>{{ $t('profile') || 'الملف الشخصي' }}</v-list-item-title>
            </v-list-item>
            <v-list-item @click="goToSettings">
              <template v-slot:prepend>
                <v-icon>mdi-cog</v-icon>
              </template>
              <v-list-item-title>{{ $t('settings') || 'الإعدادات' }}</v-list-item-title>
            </v-list-item>
            <v-divider />
            <v-list-item @click="logout">
              <template v-slot:prepend>
                <v-icon>mdi-logout</v-icon>
              </template>
              <v-list-item-title>{{ $t('logout') || 'تسجيل خروج' }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <!-- Main Content -->
    <v-main class="investor-main">
      <v-container fluid class="pa-4">
        <slot />
      </v-container>
    </v-main>

    <!-- Notifications Drawer -->
    <v-navigation-drawer
      v-model="notificationsDrawer"
      location="right"
      temporary
      width="320"
    >
      <v-list>
        <v-list-item>
          <template v-slot:prepend>
            <v-icon>mdi-bell</v-icon>
          </template>
          <v-list-item-title>{{ $t('notifications') || 'التنبيهات' }}</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item
          v-for="notification in notifications"
          :key="notification.id"
          @click="markAsRead(notification.id)"
        >
          <template v-slot:prepend>
            <v-icon :color="notification.color">{{ notification.icon }}</v-icon>
          </template>
          <v-list-item-title>{{ notification.title }}</v-list-item-title>
          <v-list-item-subtitle>{{ notification.message }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Search Dialog -->
    <v-dialog v-model="searchDialog" max-width="600">
      <v-card>
        <v-card-title class="pa-4">
          <v-icon class="me-2">mdi-magnify</v-icon>
          {{ $t('search') || 'بحث' }}
        </v-card-title>
        <v-card-text class="pa-4">
          <v-text-field
            v-model="searchQuery"
            :label="$t('searchPlaceholder') || 'ابحث عن أي شيء...'"
            variant="outlined"
            prepend-inner-icon="mdi-magnify"
            clearable
            autofocus
          />
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn @click="searchDialog = false" variant="tonal">
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
          <v-btn @click="performSearch" variant="elevated" color="primary">
            {{ $t('search') || 'بحث' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const store = useStore();
const router = useRouter();

// State
const drawer = ref(true);
const isRail = ref(false);
const isScrolled = ref(false);
const isDark = ref(false);
const notificationsDrawer = ref(false);
const searchDialog = ref(false);
const searchQuery = ref('');

const userAvatar = ref('/api/placeholder/40/40');
const userName = ref('المستثمر الاستراتيجي');
const unreadNotifications = ref(3);
const notifications = ref([
  {
    id: 1,
    title: t('newInvestment') || 'استثمار جديد',
    message: t('newInvestmentMessage') || 'تم استلام استثمار جديد بقيمة 50,000 دج',
    icon: 'mdi-trending-up',
    color: 'success',
    read: false
  },
  {
    id: 2,
    title: t('designApproved') || 'تم الموافقة على التصميم',
    message: t('designApprovedMessage') || 'تمت الموافقة على تصميم الجدران الجديد',
    icon: 'mdi-check-circle',
    color: 'primary',
    read: false
  },
  {
    id: 3,
    title: t('marketUpdate') || 'تحديث السوق',
    message: t('marketUpdateMessage') || 'هناك فرص جديدة في السوق الشمالي',
    icon: 'mdi-chart-line',
    color: 'info',
    read: false
  }
]);

// Methods
const toggleRail = () => {
  isRail.value = !isRail.value;
};

const toggleNotifications = () => {
  notificationsDrawer.value = !notificationsDrawer.value;
};

const toggleSearch = () => {
  searchDialog.value = !searchDialog.value;
};

const toggleTheme = () => {
  isDark.value = !isDark.value;
  store.dispatch('theme/toggleTheme');
};

const logout = async () => {
  try {
    await store.dispatch('auth/logout');
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const goToProfile = () => {
  router.push('/dashboard/profile');
};

const goToSettings = () => {
  router.push('/dashboard/settings');
};

const markAsRead = (notificationId) => {
  const notification = notifications.value.find(n => n.id === notificationId);
  if (notification) {
    notification.read = true;
    unreadNotifications.value = Math.max(0, unreadNotifications.value - 1);
  }
};

const performSearch = () => {
  console.log('Searching for:', searchQuery.value);
  // Implement search logic
  searchDialog.value = false;
  searchQuery.value = '';
};

const getParticleStyle = (n) => {
  const size = Math.random() * 4 + 2;
  const duration = Math.random() * 20 + 10;
  const delay = Math.random() * 5;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

// Lifecycle
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  
  // Load user data
  const user = store.getters['auth/user'];
  if (user) {
    userName.value = user.name || userName.value;
    userAvatar.value = user.avatar || userAvatar.value;
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
/* Particles */
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
  background: rgba(212, 175, 55, 0.3);
  border-radius: 50%;
  animation: float linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Sidebar */
.investor-sidebar {
  border-right: 1px solid rgba(212, 175, 55, 0.2);
}

.sidebar-header {
  border-bottom: 1px solid rgba(212, 175, 55, 0.1);
}

.user-card {
  background: rgba(212, 175, 55, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
}

.rail-toggle {
  position: absolute;
  bottom: 16px;
  right: 16px;
}

/* Header */
.investor-header {
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

/* Main Content */
.investor-main {
  position: relative;
  z-index: 1;
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .investor-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .investor-sidebar.v-navigation-drawer--active {
    transform: translateX(0);
  }
}

/* Animations */
.v-navigation-drawer {
  transition: all 0.3s ease;
}

.v-app-bar {
  transition: all 0.3s ease;
}

/* Custom scrollbar for notifications */
.v-navigation-drawer--right {
  scrollbar-width: thin;
  scrollbar-color: rgba(212, 175, 55, 0.3) transparent;
}

.v-navigation-drawer--right::-webkit-scrollbar {
  width: 6px;
}

.v-navigation-drawer--right::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer--right::-webkit-scrollbar-thumb {
  background: rgba(212, 175, 55, 0.3);
  border-radius: 3px;
}

.v-navigation-drawer--right::-webkit-scrollbar-thumb:hover {
  background: rgba(212, 175, 55, 0.5);
}
</style>
