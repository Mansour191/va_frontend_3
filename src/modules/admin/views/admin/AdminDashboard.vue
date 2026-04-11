<template>
  <v-app>
    <!-- Admin Sidebar -->
    <AdminSidebar :collapsed="sidebarCollapsed" @toggle="sidebarCollapsed = !sidebarCollapsed" />

    <!-- Main Content -->
    <v-main :class="{ 'sidebar-collapsed': sidebarCollapsed }" class="admin-main">
      <!-- Admin Header -->
      <AdminHeader
        :sidebar-collapsed="sidebarCollapsed"
        @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
      />

      <!-- Page Content -->
      <v-container class="pa-4">
        <!-- Page Title -->
        <h1 class="text-h3 font-weight-bold text-primary mb-6">
          {{ $t('dashboard') || 'لوحة التحكم' }}
        </h1>

        <!-- Statistics Cards -->
        <v-row class="mb-6">
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-newspaper"
              :title="$t('totalPosts') || 'إجمالي المقالات'"
              :value="stats.posts"
              color="#D4AF37"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-tag"
              :title="$t('totalCategories') || 'إجمالي الفئات'"
              :value="stats.categories"
              color="#4CAF50"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-couch"
              :title="$t('totalProducts') || 'إجمالي المنتجات'"
              :value="stats.products"
              color="#2196F3"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-comment"
              :title="$t('totalComments') || 'إجمالي التعليقات'"
              :value="stats.comments"
              color="#FF9800"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-account-group"
              :title="$t('totalUsers') || 'إجمالي المستخدمين'"
              :value="stats.users"
              color="#9C27B0"
            />
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="2">
            <StatsCard
              icon="mdi-eye"
              :title="$t('totalViews') || 'إجمالي المشاهدات'"
              :value="stats.views"
              color="#F44336"
            />
          </v-col>
        </v-row>

        <!-- Welcome Card -->
        <v-card variant="elevated" class="mb-6 welcome-card">
          <v-card-text class="pa-6">
            <div class="d-flex align-center ga-6">
              <v-avatar size="80" color="primary" variant="tonal">
                <v-icon size="48" color="primary">mdi-crown</v-icon>
              </v-avatar>
              <div class="welcome-text">
                <h2 class="text-h4 font-weight-bold text-primary mb-2">
                  {{ $t('welcomeAdmin') || 'مرحباً بك أيها المدير' }}
                </h2>
                <p class="text-body-1 text-medium-emphasis">
                  {{ $t('welcomeAdminMessage') || 'نحن سعداء بوجودك في لوحة التحكم. يمكنك إدارة المحتوى والمنتجات والمستخدمين من هنا.' }}
                </p>
              </div>
            </div>
          </v-card-text>
        </v-card>

        <!-- Recent Posts Section -->
        <div class="section-header mb-4">
          <div class="d-flex align-center justify-space-between">
            <h2 class="text-h5 font-weight-bold text-primary d-flex align-center ga-2">
              <v-icon color="primary">mdi-clock</v-icon>
              {{ $t('recentPosts') || 'المقالات الأخيرة' }}
            </h2>
            <v-btn
              to="/admin/posts"
              variant="tonal"
              color="primary"
              append-icon="mdi-arrow-left"
            >
              {{ $t('viewAll') || 'عرض الكل' }}
            </v-btn>
          </div>
        </div>

        <!-- Recent Posts Grid -->
        <v-row>
          <v-col
            v-for="post in recentPosts"
            :key="post.id"
            cols="12"
            md="6"
            lg="4"
          >
            <v-card variant="elevated" class="recent-post-card">
              <v-card-text class="pa-4">
                <div class="d-flex ga-4">
                  <!-- Post Image -->
                  <v-avatar size="80" rounded="lg">
                    <v-img :src="post.image" :alt="post.title" />
                  </v-avatar>
                  
                  <!-- Post Info -->
                  <div class="flex-grow-1">
                    <h3 class="text-h6 font-weight-medium mb-2">{{ post.title }}</h3>
                    
                    <!-- Post Meta -->
                    <div class="d-flex ga-4 mb-3">
                      <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
                        <v-icon size="16" color="primary">mdi-calendar</v-icon>
                        {{ post.date }}
                      </div>
                      <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
                        <v-icon size="16" color="primary">mdi-eye</v-icon>
                        {{ post.views }}
                      </div>
                      <div class="d-flex align-center ga-1 text-caption text-medium-emphasis">
                        <v-icon size="16" color="primary">mdi-comment</v-icon>
                        {{ post.comments }}
                      </div>
                    </div>
                    
                    <!-- Post Actions -->
                    <div class="d-flex ga-2">
                      <v-btn
                        :to="`/admin/posts/edit/${post.id}`"
                        variant="tonal"
                        color="primary"
                        size="small"
                        icon="mdi-pencil"
                      />
                      <v-btn
                        @click="deletePost(post.id)"
                        variant="tonal"
                        color="error"
                        size="small"
                        icon="mdi-delete"
                      />
                    </div>
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="primary" size="48" />
          <p class="mt-4 text-medium-emphasis">
            {{ $t('loading') || 'جاري التحميل...' }}
          </p>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import AdminSidebar from './components/Sidebar.vue';
import AdminHeader from './components/Header.vue';
import StatsCard from './components/StatsCard.vue';
import AdminService from '@/services/AdminService';

const router = useRouter();
const { t } = useI18n();
const store = useStore();

// State
const sidebarCollapsed = ref(false);
const loading = ref(false);
const stats = ref({
  posts: 0,
  categories: 0,
  products: 0,
  comments: 0,
  users: 0,
  views: '0',
});
const recentPosts = ref([]);

// Methods
const fetchDashboardData = async () => {
  try {
    loading.value = true;
    
    // Fetch statistics
    const statsResponse = await AdminService.getDashboardStats();
    if (statsResponse.success) {
      stats.value = statsResponse.data;
    } else {
      // Fallback to mock data
      stats.value = {
        posts: 128,
        categories: 8,
        products: 256,
        comments: 342,
        users: 89,
        views: '45.2K',
      };
    }
    
    // Fetch recent posts
    const postsResponse = await AdminService.getRecentPosts();
    if (postsResponse.success) {
      recentPosts.value = postsResponse.data;
    } else {
      // Fallback to mock data
      recentPosts.value = [
        {
          id: 1,
          title: 'كيف تختار الفينيل المناسب لمشروعك؟',
          image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
          date: '15 مارس 2026',
          views: 1234,
          comments: 23,
        },
        {
          id: 2,
          title: '10 أفكار لتجديد غرفة نوم أطفالك بالفينيل',
          image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
          date: '12 مارس 2026',
          views: 856,
          comments: 15,
        },
        {
          id: 3,
          title: '5 أخطاء شائعة عند تركيب الفينيل',
          image: 'https://i.postimg.cc/htCcH3cZ/table1.png',
          date: '10 مارس 2026',
          views: 2100,
          comments: 42,
        },
      ];
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    
    // Show error notification
    store.dispatch('notifications/add', {
      type: 'error',
      title: t('error') || 'خطأ',
      message: t('errorLoadingData') || 'خطأ في تحميل البيانات',
      timeout: 5000
    });
    
    // Set fallback data
    stats.value = {
      posts: 128,
      categories: 8,
      products: 256,
      comments: 342,
      users: 89,
      views: '45.2K',
    };
    
    recentPosts.value = [
      {
        id: 1,
        title: 'كيف تختار الفينيل المناسب لمشروعك؟',
        image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
        date: '15 مارس 2026',
        views: 1234,
        comments: 23,
      },
      {
        id: 2,
        title: '10 أفكار لتجديد غرفة نوم أطفالك بالفينيل',
        image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
        date: '12 مارس 2026',
        views: 856,
        comments: 15,
      },
      {
        id: 3,
        title: '5 أخطاء شائعة عند تركيب الفينيل',
        image: 'https://i.postimg.cc/htCcH3cZ/table1.png',
        date: '10 مارس 2026',
        views: 2100,
        comments: 42,
      },
    ];
  } finally {
    loading.value = false;
  }
};

const deletePost = async (postId) => {
  const confirmed = confirm(t('confirmDeletePost') || 'هل أنت متأكد من حذف هذا المقال؟');
  
  if (confirmed) {
    try {
      loading.value = true;
      
      const response = await AdminService.deletePost(postId);
      
      if (response.success) {
        // Remove post from local state
        recentPosts.value = recentPosts.value.filter(post => post.id !== postId);
        
        // Update stats
        stats.value.posts -= 1;
        
        // Show success notification
        store.dispatch('notifications/add', {
          type: 'success',
          title: t('success') || 'نجاح',
          message: t('postDeleted') || 'تم حذف المقال بنجاح',
          timeout: 3000
        });
      } else {
        throw new Error(response.error || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      
      // Show error notification
      store.dispatch('notifications/add', {
        type: 'error',
        title: t('error') || 'خطأ',
        message: t('errorDeletingPost') || 'خطأ في حذف المقال',
        timeout: 5000
      });
    } finally {
      loading.value = false;
    }
  }
};

const checkAuth = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    router.push('/admin/login');
  }
};

// Lifecycle
onMounted(() => {
  checkAuth();
  fetchDashboardData();
});
</script>

<style scoped>
/* Admin Main Layout */
.admin-main {
  transition: margin-right 0.3s ease;
  margin-right: 280px;
}

.admin-main.sidebar-collapsed {
  margin-right: 80px;
}

/* RTL Support */
[dir='ltr'] .admin-main {
  margin-right: 0;
  margin-left: 280px;
}

[dir='ltr'] .admin-main.sidebar-collapsed {
  margin-right: 0;
  margin-left: 80px;
}

/* Welcome Card */
.welcome-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05), rgba(var(--v-theme-secondary), 0.05));
  border: 1px solid rgba(var(--v-theme-primary), 0.1);
  transition: all 0.3s ease;
}

.welcome-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.welcome-text h2 {
  background: linear-gradient(45deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Recent Posts Cards */
.recent-post-card {
  transition: all 0.3s ease;
  overflow: hidden;
}

.recent-post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

.recent-post-card .v-card-text {
  position: relative;
}

.recent-post-card .v-card-text::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(var(--v-theme-primary), 0.05), transparent);
  transition: left 0.5s ease;
}

.recent-post-card:hover .v-card-text::before {
  left: 100%;
}

/* Section Header */
.section-header h2 {
  position: relative;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 50px;
  height: 3px;
  background: linear-gradient(90deg, rgb(var(--v-theme-primary)), rgb(var(--v-theme-secondary)));
  border-radius: 2px;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recent-post-card {
  animation: fadeInUp 0.6s ease forwards;
}

.recent-post-card:nth-child(1) { animation-delay: 0.1s; }
.recent-post-card:nth-child(2) { animation-delay: 0.2s; }
.recent-post-card:nth-child(3) { animation-delay: 0.3s; }

/* Responsive Design */
@media (max-width: 960px) {
  .admin-main {
    margin-right: 0;
    margin-left: 0;
  }
}

@media (max-width: 600px) {
  .welcome-card .d-flex {
    flex-direction: column;
    text-align: center;
  }
  
  .recent-post-card .d-flex {
    flex-direction: column;
    text-align: center;
  }
}

/* Vuetify Overrides */
:deep(.v-card) {
  transition: all 0.3s ease;
}

:deep(.v-card:hover) {
  transform: translateY(-2px);
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

:deep(.v-progress-circular) {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
