<template>
  <div class="blog-page">
    <!-- Hero Section -->
    <v-container class="py-16 text-center">
      <h1 class="text-h2 font-weight-bold text-warning mb-4">{{ $t('blog') }}</h1>
      <div class="d-flex align-center justify-center gap-4 mb-6">
        <v-divider color="warning" thickness="2" length="60"></v-divider>
        <v-icon size="36" color="warning">mdi-post</v-icon>
        <v-divider color="warning" thickness="2" length="60"></v-divider>
      </div>
      <p class="text-h6 text-medium-emphasis">{{ $t('blogIntro') }}</p>
    </v-container>

    <!-- Blog Posts -->
    <v-container>
      <v-row>
        <v-col
          v-for="post in blogPosts"
          :key="post.id"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card
            class="blog-card h-100"
            elevation="4"
            @click="openPost(post)"
          >
            <v-img
              :src="post.image"
              :alt="post.title"
              aspect-ratio="16/9"
              cover
              class="blog-image"
            ></v-img>
            <v-card-text>
              <div class="blog-meta mb-2">
                <v-chip
                  :color="getCategoryColor(post.categoryValue)"
                  size="small"
                  variant="flat"
                >
                  {{ post.category }}
                </v-chip>
                <span class="text-caption text-medium-emphasis">{{ post.date }}</span>
              </div>
              <h3 class="text-h6 font-weight-bold mb-2">{{ post.title }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-3">{{ post.excerpt }}</p>
              <div class="blog-stats">
                <v-icon size="16" color="medium-emphasis">mdi-eye</v-icon>
                <span class="text-caption">{{ post.views }}</span>
                <v-icon size="16" color="medium-emphasis" class="mr-2">mdi-comment</v-icon>
                <span class="text-caption">{{ post.comments }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Load More Button -->
      <v-row class="mt-8">
        <v-col cols="12" class="text-center">
          <v-btn
            @click="loadMore"
            :loading="loading"
            color="warning"
            variant="outlined"
            size="large"
            prepend-icon="mdi-plus"
          >
            {{ $t('loadMore') }}
          </v-btn>
        </v-col>
      </v-row>
    </v-container>

    <!-- Post Detail Dialog -->
    <v-dialog
      v-model="showPostDetail"
      max-width="800"
      scrollable
    >
      <v-card v-if="selectedPost">
        <v-card-title class="text-h5">{{ selectedPost.title }}</v-card-title>
        <v-card-text>
          <v-img
            :src="selectedPost.image"
            :alt="selectedPost.title"
            aspect-ratio="16/9"
            cover
            class="mb-4"
          ></v-img>
          <div class="blog-meta mb-4">
            <v-chip
              :color="getCategoryColor(selectedPost.categoryValue)"
              size="small"
              variant="flat"
            >
              {{ selectedPost.category }}
            </v-chip>
            <span class="text-caption text-medium-emphasis">{{ selectedPost.date }}</span>
            <span class="text-caption text-medium-emphasis">{{ selectedPost.author }}</span>
          </div>
          <div class="blog-content" v-html="selectedPost.content"></div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn @click="showPostDetail = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();

// Reactive data
const blogPosts = ref([]);
const loading = ref(false);
const showPostDetail = ref(false);
const selectedPost = ref(null);

// Methods
const fetchBlogPosts = async () => {
  loading.value = true;
  try {
    // Dynamic API call
    const response = await fetch('/api/blog/posts');
    if (response.ok) {
      const data = await response.json();
      blogPosts.value = data.map(post => ({
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.image_url || 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
        category: post.category?.name || 'ديكور',
        categoryValue: post.category?.value || 'decor',
        date: formatDate(post.created_at),
        author: post.author?.name || 'فينيل آرت',
        views: post.views || 0,
        comments: post.comments_count || 0,
        content: post.content || '<p>محتوى المقال...</p>'
      }));
    } else {
      // Fallback to static data if API fails
      setFallbackPosts();
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Fallback to static data
    setFallbackPosts();
    store.dispatch('notifications/showNotification', {
      type: 'error',
      message: 'حدث خطأ أثناء جلب المقالات'
    });
  } finally {
    loading.value = false;
  }
};

const setFallbackPosts = () => {
  blogPosts.value = [
    {
      id: 1,
      title: 'أحدث اتجاهات الفينيل لعام 2026',
      excerpt: 'اكتشف أحدث التصاميم والألوان التي ستجعل منزلك يبدو رائعاً...',
      image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
      category: 'ديكور',
      categoryValue: 'decor',
      date: '15 يناير 2026',
      author: 'أحمد محمد',
      views: 2456,
      comments: 45,
      content: '<p>محتوى المقال كامل هنا...</p>'
    },
    {
      id: 2,
      title: 'كيفية تركيب ملصقات الفينيل مثل المحترفين',
      excerpt: 'دليل شامل لتركيب ملصقات الفينيل بدون فقاعات ومشاكل...',
      image: 'https://i.postimg.cc/htCcH3cZ/table1.png',
      category: 'دروس',
      categoryValue: 'tutorial',
      date: '10 يناير 2026',
      author: 'فاطمة علي',
      views: 1892,
      comments: 23,
      content: '<p>محتوى المقال كامل هنا...</p>'
    },
    {
      id: 3,
      title: 'أثاث كلاسيكي بالفينيل',
      excerpt: 'تحويل الأثاث الكلاسيكي بتصاميم فينيل عصرية...',
      image: 'https://i.postimg.cc/Qx9tkDDn/wardrobe.png',
      category: 'أثاث',
      categoryValue: 'furniture',
      date: '15 فبراير 2026',
      author: 'نورا حسن',
      views: 1098,
      comments: 22,
      content: '<p>محتوى المقال كامل هنا...</p>'
    }
  ];
};

const loadMore = () => {
  // Load more posts logic
  console.log('Loading more posts...');
};

const openPost = (post) => {
  selectedPost.value = post;
  showPostDetail.value = true;
};

const getCategoryColor = (category) => {
  const colors = {
    decor: 'primary',
    tutorial: 'success',
    furniture: 'warning',
    news: 'info'
  };
  return colors[category] || 'default';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Lifecycle
onMounted(() => {
  fetchBlogPosts();
});
</script>

<style scoped>
.blog-page {
  background: var(--bg-deep);
  min-height: 100vh;
}

.blog-card {
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.blog-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.2);
}

.blog-image {
  transition: transform 0.3s ease;
}

.blog-card:hover .blog-image {
  transform: scale(1.05);
}

.blog-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.blog-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.blog-content {
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 600px) {
  .blog-card {
    margin-bottom: 16px;
  }
}
</style>
