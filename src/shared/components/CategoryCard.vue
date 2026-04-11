<template>
  <v-card 
    class="category-card h-100"
    elevation="4"
    hover
    @click="navigateToCategory"
  >
    <!-- Category Image -->
    <div class="category-image-container position-relative">
      <v-img 
        :src="categoryImage" 
        :alt="categoryAltText" 
        :aspect-ratio="16/12"
        cover
        class="category-image"
      >
        <!-- Design Count Badge -->
        <v-chip
          v-if="category.designCount > 0"
          color="primary"
          size="small"
          class="design-count-badge position-absolute top-2 right-2"
        >
          <v-icon size="small" class="me-1">mdi-palette</v-icon>
          {{ category.designCount }} {{ $t('designs') }}
        </v-chip>

        <!-- Active Status Indicator -->
        <v-chip
          v-if="category.isActive"
          color="success"
          size="small"
          class="active-badge position-absolute top-2 left-2"
        >
          <v-icon size="small">mdi-check-circle</v-icon>
          {{ $t('active') }}
        </v-chip>
      </v-img>
    </div>

    <!-- Category Information -->
    <v-card-text>
      <div class="category-info">
        <!-- Category Title -->
        <v-card-title class="category-title">
          {{ categoryName }}
        </v-card-title>

        <!-- Category Description -->
        <v-card-subtitle 
          v-if="categoryDescription" 
          class="category-description"
        >
          {{ categoryDescription }}
        </v-card-subtitle>

        <!-- Category Meta -->
        <div class="category-footer">
          <div class="category-meta">
            <!-- Slug Display -->
            <v-chip
              prepend-icon="mdi-tag"
              size="small"
              variant="outlined"
              color="secondary"
              class="slug-chip"
            >
              {{ category.slug }}
            </v-chip>

            <!-- Created Date -->
            <v-chip
              v-if="category.createdAt"
              prepend-icon="mdi-calendar"
              size="small"
              variant="text"
              color="grey"
              class="date-chip"
            >
              {{ formatDate(category.createdAt) }}
            </v-chip>
          </div>
        </div>

        <!-- View Designs Button -->
        <v-btn
          :to="`/designs/category/${category.slug}`"
          prepend-icon="mdi-eye"
          variant="elevated"
          color="primary"
          size="small"
          block
          class="view-designs-btn mt-3"
          @click.stop
        >
          {{ $t('viewDesigns') || 'عرض التصاميم' }}
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  category: {
    type: Object,
    required: true
  }
});

const router = useRouter();
const { locale } = useI18n();

// Computed properties
const categoryImage = computed(() => {
  return props.category.image || '/placeholder-category.jpg';
});

const categoryAltText = computed(() => {
  return categoryName.value || 'Category Image';
});

const categoryName = computed(() => {
  // Use the resolved name from GraphQL (which handles translation)
  return props.category.name || 
         props.category.nameAr || 
         props.category.nameEn || 
         'Unnamed Category';
});

const categoryDescription = computed(() => {
  return props.category.description || '';
});

const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const navigateToCategory = () => {
  router.push(`/designs/category/${props.category.slug}`);
};
</script>

<style scoped>
.category-card {
  background: var(--bg-card);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.category-card:hover {
  transform: translateY(-10px);
  border-color: #d4af37;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.category-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.category-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.category-card:hover .category-image {
  transform: scale(1.1);
}

.design-count-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: var(--gold-gradient, linear-gradient(135deg, #d4af37 0%, #f1d592 100%));
  color: #000;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  z-index: 2;
  backdrop-filter: blur(5px);
  background: rgba(212, 175, 55, 0.9);
}

.active-badge {
  position: absolute;
  top: 15px;
  left: 15px;
  background: rgba(76, 175, 80, 0.9);
  color: #fff;
  padding: 4px 10px;
  border-radius: 15px;
  font-size: 0.7rem;
  font-weight: 600;
  z-index: 2;
  backdrop-filter: blur(5px);
}

.category-info {
  padding: 20px;
}

.category-title {
  font-size: 1.2rem;
  margin-bottom: 8px;
  line-height: 1.4;
  color: var(--text-primary);
  word-break: break-word;
}

.category-description {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.category-footer {
  margin-bottom: 15px;
}

.category-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slug-chip {
  font-size: 0.75rem;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.05);
}

.date-chip {
  font-size: 0.7rem;
  opacity: 0.7;
}

.view-designs-btn {
  background: var(--gold-gradient, linear-gradient(135deg, #d4af37 0%, #f1d592 100%));
  color: #1a1a2e;
  border: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.view-designs-btn:hover {
  background: linear-gradient(135deg, #f1d592 0%, #d4af37 100%);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(212, 175, 55, 0.3);
}

/* Responsive Design */
@media (max-width: 768px) {
  .category-image-container {
    height: 150px;
  }
  
  .category-title {
    font-size: 1.1rem;
  }
  
  .category-info {
    padding: 15px;
  }
}

/* RTL Support */
@media (dir: rtl) {
  .design-count-badge {
    right: auto;
    left: 15px;
  }
  
  .active-badge {
    left: auto;
    right: 15px;
  }
}
</style>
