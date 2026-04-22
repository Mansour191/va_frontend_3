<template>
  <div class="gallery-page">
    <!-- Hero Section -->
    <v-container class="py-16 text-center">
      <h1 class="text-h2 font-weight-bold text-warning mb-4">{{ $t('gallery') }}</h1>
      <div class="d-flex align-center justify-center gap-4 mb-6">
        <v-divider color="warning" thickness="2" length="60"></v-divider>
        <v-icon size="36" color="warning">mdi-image-multiple</v-icon>
        <v-divider color="warning" thickness="2" length="60"></v-divider>
      </div>
      <p class="text-h6 text-medium-emphasis">{{ $t('galleryIntro') }}</p>
    </v-container>

    <!-- Filter Tabs -->
    <v-container class="mb-8">
      <v-chip-group
        v-model="activeCategory"
        mandatory
        center-active
        class="justify-center"
      >
        <v-chip
          v-for="category in categories"
          :key="category.value"
          :value="category.value"
          :prepend-icon="category.icon"
          color="warning"
          variant="outlined"
          class="text-none"
        >
          {{ $t(category.nameKey) }}
        </v-chip>
      </v-chip-group>
    </v-container>

    <!-- Gallery Grid -->
    <v-container>
      <v-row>
        <v-col
          v-for="item in filteredItems"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card
            class="gallery-card h-100"
            elevation="4"
            @click="openLightbox(item)"
          >
            <v-img
              :src="item.image"
              :alt="$t(item.titleKey)"
              aspect-ratio="1"
              cover
              class="gallery-image"
            ></v-img>
            <v-card-text>
              <h4 class="text-h6 mb-2">{{ $t(item.titleKey) }}</h4>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ $t(item.descKey) }}</p>
              <v-chip
                :color="getCategoryColor(item.category)"
                size="small"
                class="mb-2"
              >
                <v-icon start>{{ getCategoryIcon(item.category) }}</v-icon>
                {{ $t(item.categoryKey) }}
              </v-chip>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Load More Button -->
      <v-row v-if="hasMore" class="mt-8">
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

    <!-- Lightbox -->
    <v-dialog
      v-model="lightbox.show"
      max-width="800"
      @click:outside="closeLightbox"
    >
      <v-card>
        <v-card-title class="text-h5">{{ $t(lightbox.titleKey) }}</v-card-title>
        <v-card-text>
          <v-img
            :src="lightbox.image"
            :alt="$t(lightbox.titleKey)"
            aspect-ratio="1"
            cover
            class="lightbox-image"
          ></v-img>
          <p class="text-body-1 mt-4">{{ $t(lightbox.descKey) }}</p>
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="prevImage"
            :disabled="!hasPrev"
            icon="mdi-chevron-left"
          ></v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="nextImage"
            :disabled="!hasNext"
            icon="mdi-chevron-right"
          ></v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, onMounted } from 'vue';
import { useQuery } from '@vue/apollo-composable';
import { 
  GALLERY_CATEGORIES_QUERY, 
  GALLERY_ITEMS_QUERY 
} from '@/integration/graphql/common.graphql';

// State
const activeCategory = ref('all');
const itemsPerPage = ref(12);
const currentPage = ref(1);

// GraphQL Query for gallery categories
const { 
  result: categoriesResult, 
  error: categoriesError 
} = useQuery(GALLERY_CATEGORIES_QUERY);

// Computed property for categories
const categories = computed(() => {
  if (categoriesError.value) {
    console.error('GraphQL Error fetching categories:', categoriesError.value);
    // Fallback to static data
    return [
      { value: 'all', nameKey: 'allCategories', icon: 'mdi-view-grid' },
      { value: 'furniture', nameKey: 'furniture', icon: 'mdi-sofa' },
      { value: 'doors', nameKey: 'doors', icon: 'mdi-door' },
      { value: 'walls', nameKey: 'walls', icon: 'mdi-roller-brush' },
      { value: 'ceilings', nameKey: 'ceilings', icon: 'mdi-arrow-up-bold' },
      { value: 'tiles', nameKey: 'tiles', icon: 'mdi-border-all' },
      { value: 'kitchens', nameKey: 'kitchens', icon: 'mdi-silverware' },
      { value: 'cars', nameKey: 'cars', icon: 'mdi-car' },
    ];
  }
  
  const data = categoriesResult.value?.galleryCategories || [];
  return [
    { value: 'all', nameKey: 'allCategories', icon: 'mdi-view-grid' },
    ...data.map(cat => ({
      value: cat.slug || cat.id,
      nameKey: cat.name.toLowerCase().replace(/\s+/g, ''),
      icon: 'mdi-view-grid'
    }))
  ];
});

// GraphQL Query for gallery items
const { 
  result: itemsResult, 
  loading, 
  error: itemsError,
  refetch: refetchGalleryItems 
} = useQuery(GALLERY_ITEMS_QUERY, {
  first: 100
});

// Computed property for gallery items
const allItems = computed(() => {
  if (itemsError.value) {
    console.error('GraphQL Error fetching gallery items:', itemsError.value);
    // Fallback to static data
    return getFallbackItems();
  }
  
  const data = itemsResult.value?.galleryItems?.edges?.map(edge => ({
    id: edge.node.id,
    titleKey: edge.node.title.toLowerCase().replace(/\s+/g, ''),
    descKey: edge.node.description ? edge.node.description.toLowerCase().replace(/\s+/g, '') : 'galleryItemDesc',
    category: edge.node.category?.slug || 'furniture',
    categoryKey: edge.node.category?.name?.toLowerCase().replace(/\s+/g, '') || 'furniture',
    image: edge.node.image || 'https://i.postimg.cc/Qx9tkDDn/wardrobe.png',
    title: edge.node.title,
    description: edge.node.description
  })) || [];
  
  return data.length > 0 ? data : getFallbackItems();
});

// Helper function to get fallback items
const getFallbackItems = () => {
  return [
    {
      id: 1,
      titleKey: 'galleryItem1Title',
      descKey: 'galleryItem1Desc',
      category: 'furniture',
      categoryKey: 'furniture',
      image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
    },
    {
      id: 2,
      titleKey: 'galleryItem2Title',
      descKey: 'galleryItem2Desc',
      category: 'furniture',
      categoryKey: 'furniture',
      image: 'https://i.postimg.cc/htCcH3cZ/table1.png',
    },
    {
      id: 3,
      titleKey: 'galleryItem3Title',
      descKey: 'galleryItem3Desc',
      category: 'doors',
      categoryKey: 'doors',
      image: 'https://i.postimg.cc/wjXjw0mj/slider-decore2.png',
    },
    {
      id: 4,
      titleKey: 'galleryItem4Title',
      descKey: 'galleryItem4Desc',
      category: 'walls',
      categoryKey: 'walls',
      image: 'https://i.postimg.cc/7L0DfPgY/Entrance1.png',
    },
    {
      id: 5,
      titleKey: 'galleryItem5Title',
      descKey: 'galleryItem5Desc',
      category: 'kitchens',
      categoryKey: 'kitchens',
      image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
    },
    {
      id: 6,
      titleKey: 'galleryItem6Title',
      descKey: 'galleryItem6Desc',
      category: 'cars',
      categoryKey: 'cars',
      image: 'https://i.postimg.cc/wjXjw0mj/slider-decore2.png',
    },
    {
      id: 7,
      titleKey: 'galleryItem7Title',
      descKey: 'galleryItem7Desc',
      category: 'ceilings',
      categoryKey: 'ceilings',
      image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
    },
    {
      id: 8,
      titleKey: 'galleryItem8Title',
      descKey: 'galleryItem8Desc',
      category: 'tiles',
      categoryKey: 'tiles',
      image: 'https://i.postimg.cc/0QKmBBJ9/kitchen2.png',
    }
  ];
};

// Lightbox state
const lightbox = reactive({
  show: false,
  image: '',
  titleKey: '',
  descKey: '',
  index: 0
});

// Computed
const filteredItems = computed(() => {
  let items =
    activeCategory.value === 'all'
      ? allItems.value
      : allItems.value.filter((item) => item.category === activeCategory.value);

  return items.slice(0, currentPage.value * itemsPerPage.value);
});

const hasMore = computed(() => {
  let totalItems =
    activeCategory.value === 'all'
      ? allItems.value.length
      : allItems.value.filter((item) => item.category === activeCategory.value).length;

  return filteredItems.value.length < totalItems;
});

const hasPrev = computed(() => lightbox.index > 0);

const hasNext = computed(() => {
  let items =
    activeCategory.value === 'all'
      ? allItems.value
      : allItems.value.filter((item) => item.category === activeCategory.value);
  return lightbox.index < items.length - 1;
});

// Methods
const loadMore = () => {
  currentPage.value++;
};

const openLightbox = (item) => {
  const items =
    activeCategory.value === 'all'
      ? allItems.value
      : allItems.value.filter((i) => i.category === activeCategory.value);

  lightbox.show = true;
  lightbox.image = item.image;
  lightbox.titleKey = item.titleKey;
  lightbox.descKey = item.descKey;
  lightbox.index = items.findIndex((i) => i.id === item.id);

  document.body.style.overflow = 'hidden';
};

const closeLightbox = () => {
  lightbox.show = false;
  document.body.style.overflow = '';
};

const prevImage = () => {
  if (!hasPrev.value) return;

  const items =
    activeCategory.value === 'all'
      ? allItems.value
      : allItems.value.filter((item) => item.category === activeCategory.value);

  const newIndex = lightbox.index - 1;
  lightbox.image = items[newIndex].image;
  lightbox.titleKey = items[newIndex].titleKey;
  lightbox.descKey = items[newIndex].descKey;
  lightbox.index = newIndex;
};

const nextImage = () => {
  if (!hasNext.value) return;

  const items =
    activeCategory.value === 'all'
      ? allItems.value
      : allItems.value.filter((item) => item.category === activeCategory.value);

  const newIndex = lightbox.index + 1;
  lightbox.image = items[newIndex].image;
  lightbox.titleKey = items[newIndex].titleKey;
  lightbox.descKey = items[newIndex].descKey;
  lightbox.index = newIndex;
};

const getCategoryColor = (category) => {
  const colors = {
    furniture: 'primary',
    doors: 'secondary',
    walls: 'success',
    ceilings: 'warning',
    tiles: 'info',
    kitchens: 'error',
    cars: 'purple'
  };
  return colors[category] || 'default';
};

const getCategoryIcon = (category) => {
  const icons = {
    furniture: 'mdi-sofa',
    doors: 'mdi-door',
    walls: 'mdi-roller-brush',
    ceilings: 'mdi-arrow-up-bold',
    tiles: 'mdi-border-all',
    kitchens: 'mdi-silverware',
    cars: 'mdi-car'
  };
  return icons[category] || 'mdi-view-grid';
};

// Lifecycle
onMounted(() => {
  // GraphQL queries will automatically fetch on mount
});

// Watchers
watch(activeCategory, () => {
  currentPage.value = 1;
});
</script>

<style scoped>
.gallery-page {
  background: var(--bg-deep);
  min-height: 100vh;
}

.gallery-card {
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.gallery-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(212, 175, 55, 0.2);
}

.gallery-image {
  transition: transform 0.3s ease;
}

.gallery-card:hover .gallery-image {
  transform: scale(1.05);
}

.lightbox-image {
  border-radius: 8px;
}

/* Responsive */
@media (max-width: 600px) {
  .gallery-card {
    margin-bottom: 16px;
  }
}
</style>
