<template>
  <v-main class="post-page">
    <!-- Loading State -->
    <v-container v-if="loading" class="py-16">
      <v-row justify="center">
        <v-col cols="12" class="text-center">
          <v-progress-circular
            indeterminate
            color="primary"
            size="64"
            class="mb-4"
          ></v-progress-circular>
          <h3 class="text-h5 text-medium-emphasis">جاري تحميل المقال...</h3>
        </v-col>
      </v-row>
    </v-container>

    <!-- Error State -->
    <v-container v-else-if="error" class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="8">
          <v-alert
            type="error"
            variant="tonal"
            class="text-center"
            text
          >
            <template #prepend>
              <v-icon>mdi-alert-circle</v-icon>
            </template>
            {{ error }}
            <template #append>
              <v-btn
                @click="loadPost"
                variant="text"
                color="error"
                prepend-icon="mdi-refresh"
              >
                إعادة المحاولة
              </v-btn>
            </template>
          </v-alert>
        </v-col>
      </v-row>
    </v-container>

    <!-- Post Content -->
    <v-container v-else-if="post" class="py-8">
      <v-row>
        <v-col cols="12">
          <v-card class="post-card" elevation="4">
            <v-card-text class="pa-8">
              <!-- Post Header -->
              <div class="post-header mb-8">
                <h1 class="text-h3 font-weight-bold text-center mb-4 text-primary" v-if="post.title">
                  {{ post.title }}
                </h1>
                <div class="post-meta text-center mb-6">
                  <v-chip
                    v-if="post.category"
                    color="primary"
                    variant="tonal"
                    class="me-2"
                    size="small"
                  >
                    {{ getCategoryLabel(post.category) }}
                  </v-chip>
                  <span class="text-medium-emphasis">
                    {{ formatDate(post.publishedAt) }}
                  </span>
                </div>
              </div>

              <!-- Post Body -->
              <div class="post-body" v-html="post.content"></div>

              <!-- Post Tags -->
              <div v-if="post.tags && post.tags.length" class="post-tags mt-8">
                <v-chip
                  v-for="tag in post.tags"
                  :key="tag"
                  color="secondary"
                  variant="outlined"
                  class="me-2 mb-2"
                  size="small"
                >
                  {{ tag }}
                </v-chip>
              </div>

              <!-- Post Author -->
              <div v-if="post.author" class="post-author mt-8 pt-8 border-top">
                <v-row align="center">
                  <v-col cols="auto">
                    <v-avatar size="32" color="primary">
                      <v-icon>mdi-account</v-icon>
                    </v-avatar>
                  </v-col>
                  <v-col>
                    <div class="text-body-2 font-weight-medium">{{ post.author }}</div>
                    <div class="text-caption text-medium-emphasis">كاتب المقال</div>
                  </v-col>
                </v-row>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Related Posts -->
      <v-row v-if="relatedPosts.length" class="mt-12">
        <v-col cols="12">
          <h2 class="text-h4 font-weight-bold mb-6 text-center">مقالات ذات صلة</h2>
          <v-row>
            <v-col
              v-for="relatedPost in relatedPosts"
              :key="relatedPost.id"
              cols="12"
              md="6"
              lg="4"
              class="mb-4"
            >
              <v-card
                :to="`/post/${relatedPost.slug}`"
                class="related-post-card h-100"
                elevation="2"
                hover
              >
                <v-card-text class="pa-6">
                  <h3 class="text-h6 font-weight-bold mb-3">{{ relatedPost.title }}</h3>
                  <p class="text-body-2 text-medium-emphasis mb-4">{{ relatedPost.excerpt }}</p>
                  <div class="d-flex justify-space-between align-center">
                    <v-chip
                      color="primary"
                      variant="tonal"
                      size="small"
                    >
                      {{ getCategoryLabel(relatedPost.category) }}
                    </v-chip>
                    <span class="text-caption text-medium-emphasis">
                      {{ formatDate(relatedPost.publishedAt) }}
                    </span>
                  </div>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>

    <!-- Not Found State -->
    <v-container v-else class="py-16">
      <v-row justify="center">
        <v-col cols="12" md="8" class="text-center">
          <v-icon size="64" color="primary" class="mb-4">mdi-file-document-outline</v-icon>
          <h2 class="text-h4 font-weight-bold mb-4">المقال غير موجود</h2>
          <p class="text-body-1 text-medium-emphasis mb-6">
            عذراً، المقال الذي تبحث عنه غير موجود أو تم حذفه.
          </p>
          <v-btn
            to="/blog"
            color="primary"
            prepend-icon="mdi-arrow-left"
            variant="elevated"
          >
            العودة إلى المدونة
          </v-btn>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PostService from '@/integration/services/PostService';

const route = useRoute();
const router = useRouter();

// State
const post = ref(null);
const loading = ref(true);
const error = ref(null);
const relatedPosts = ref([]);

// Computed
const postId = computed(() => route.params.id || route.params.slug);

// Methods
const getCategoryLabel = (category) => {
  const categoryLabels = {
    guide: 'دليل',
    comparison: 'مقارنة',
    tutorial: 'دليل تعليمي',
    news: 'أخبار',
    review: 'مراجعة'
  };
  return categoryLabels[category] || category;
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

const loadPost = async () => {
  if (!postId.value) {
    error.value = 'معرف المقال غير موجود';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    // Try to get post by ID first, then by slug
    let postData = await PostService.getPost(postId.value);
    
    // If not found by ID, try by slug
    if (!postData) {
      postData = await PostService.getPostBySlug(postId.value);
    }

    // If still not found, use mock data as fallback
    if (!postData) {
      console.log('Using mock data fallback for post:', postId.value);
      postData = PostService.getMockPost(postId.value);
    }

    if (postData) {
      post.value = postData;
      // Load related posts
      await loadRelatedPosts(postData.category);
    } else {
      error.value = 'المقال غير موجود';
    }
  } catch (err) {
    console.error('Error loading post:', err);
    error.value = err.message || 'فشل تحميل المقال';
    
    // Fallback to mock data
    try {
      const mockPost = PostService.getMockPost(postId.value);
      if (mockPost) {
        post.value = mockPost;
        await loadRelatedPosts(mockPost.category);
      }
    } catch (mockErr) {
      console.error('Error loading mock post:', mockErr);
    }
  } finally {
    loading.value = false;
  }
};

const loadRelatedPosts = async (category) => {
  if (!category) return;

  try {
    // Load posts from the same category
    const related = await PostService.getPostsByCategory(category);
    // Filter out current post and limit to 3 posts
    relatedPosts.value = related
      .filter(p => p.id !== post.value?.id && p.slug !== postId.value)
      .slice(0, 3);
  } catch (err) {
    console.error('Error loading related posts:', err);
    // Use mock related posts as fallback
    relatedPosts.value = PostService.getMockPosts()
      .filter(p => p.category === category && p.id !== post.value?.id)
      .slice(0, 3);
  }
};

onMounted(() => {
  console.log('Loading post:', postId.value);
  loadPost();
});
</script>

<style scoped>
.post-page {
  min-height: 80vh;
  background: linear-gradient(135deg, var(--gradient-dark));
}

.post-card {
  background: rgba(26, 26, 26, 0.95);
  border: 1px solid var(--border-primary);
  backdrop-filter: blur(20px);
}

.post-header {
  border-bottom: 1px solid var(--border-secondary);
  padding-bottom: 24px;
}

.post-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.post-body {
  line-height: 1.8;
  font-size: 1.1rem;
}

.post-body :deep(h2) {
  color: var(--text-primary);
  margin: 24px 0 16px 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.post-body :deep(h3) {
  color: var(--text-primary);
  margin: 20px 0 12px 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.post-body :deep(p) {
  margin-bottom: 16px;
  color: var(--text-secondary);
}

.post-body :deep(.v-card) {
  margin: 16px 0;
  background: var(--surface);
}

.post-tags {
  border-top: 1px solid var(--border-secondary);
  padding-top: 16px;
}

.post-author {
  background: var(--surface);
  border-radius: 8px;
  padding: 16px;
}

.related-post-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.related-post-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

/* Responsive */
@media (max-width: 768px) {
  .post-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .post-body {
    font-size: 1rem;
  }
}
</style>

