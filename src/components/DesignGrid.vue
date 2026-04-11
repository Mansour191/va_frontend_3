<template>
  <div class="design-grid-container">
    <!-- Search and Filter Section -->
    <div class="search-section mb-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search by tags -->
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search designs by tags..."
              class="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="handleSearch"
            />
            <svg
              class="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        
        <!-- Filter options -->
        <div class="flex gap-2">
          <button
            @click="showFeaturedOnly = !showFeaturedOnly"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              showFeaturedOnly
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            <svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
            </svg>
            Featured Only
          </button>
          
          <button
            @click="showMyDesigns = !showMyDesigns"
            :class="[
              'px-4 py-2 rounded-lg transition-colors',
              showMyDesigns
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            <svg class="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
            </svg>
            My Designs
          </button>
        </div>
      </div>
      
      <!-- Active tags filter -->
      <div v-if="activeTags.length > 0" class="mt-3 flex flex-wrap gap-2">
        <span class="text-sm text-gray-600">Active filters:</span>
        <span
          v-for="tag in activeTags"
          :key="tag"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
        >
          {{ tag }}
          <button
            @click="removeTag(tag)"
            class="ml-2 text-blue-600 hover:text-blue-800"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 mb-4">{{ error }}</div>
      <button
        @click="refetch"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>

    <!-- Designs Grid -->
    <div v-else class="designs-grid">
      <div
        v-if="filteredDesigns.length === 0"
        class="text-center py-12 text-gray-500"
      >
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
        </svg>
        <p class="text-lg font-medium">No designs found</p>
        <p class="text-sm mt-2">Try adjusting your search or filters</p>
      </div>

      <div
        v-else
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        <div
          v-for="design in paginatedDesigns"
          :key="design.id"
          class="design-card bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          @click="trackDesignClick(design)"
        >
          <!-- Design Image -->
          <div class="relative aspect-w-16 aspect-h-12 bg-gray-100">
            <img
              v-if="design.imageUrl"
              :src="design.imageUrl"
              :alt="design.name"
              class="w-full h-48 object-cover"
              @error="handleImageError"
            />
            <div
              v-else
              class="w-full h-48 flex items-center justify-center bg-gray-200"
            >
              <svg class="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
              </svg>
            </div>
            
            <!-- Featured Badge -->
            <div
              v-if="design.isFeatured"
              class="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold"
            >
              <svg class="w-4 h-4 inline mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              Featured
            </div>
          </div>

          <!-- Design Info -->
          <div class="p-4">
            <h3 class="font-semibold text-gray-900 mb-2 truncate">
              {{ design.name }}
            </h3>
            
            <p
              v-if="design.description"
              class="text-sm text-gray-600 mb-3 line-clamp-2"
            >
              {{ design.description }}
            </p>

            <!-- Tags -->
            <div v-if="design.tagsList && design.tagsList.length > 0" class="mb-3">
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="tag in design.tagsList.slice(0, 3)"
                  :key="tag"
                  class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  {{ tag }}
                </span>
                <span
                  v-if="design.tagsList.length > 3"
                  class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                >
                  +{{ design.tagsList.length - 3 }}
                </span>
              </div>
            </div>

            <!-- Stats and Actions -->
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4 text-sm text-gray-500">
                <!-- Likes -->
                <button
                  @click="toggleLike(design)"
                  :disabled="liking"
                  class="flex items-center space-x-1 hover:text-red-600 transition-colors"
                >
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ design.likes || 0 }}</span>
                </button>

                <!-- Downloads -->
                <div class="flex items-center space-x-1">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"/>
                  </svg>
                  <span>{{ design.downloads || 0 }}</span>
                </div>
              </div>

              <!-- Status Badge -->
              <div
                :class="[
                  'px-2 py-1 text-xs rounded-full',
                  getStatusClass(design.status)
                ]"
              >
                {{ design.status }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div
        v-if="totalPages > 1"
        class="mt-8 flex justify-center items-center space-x-2"
      >
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span class="text-sm text-gray-600">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        
        <button
          @click="currentPage++"
          :disabled="currentPage === totalPages"
          class="px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuery, useMutation } from '@vue/apollo-composable'
import gql from 'graphql-tag'

// GraphQL Queries
const GET_FEATURED_DESIGNS = gql`
  query GetFeaturedDesigns {
    featuredDesigns {
      id
      name
      description
      imageUrl
      isFeatured
      isActive
      likes
      downloads
      tagsList
      status
      createdAt
    }
  }
`

const GET_DESIGNS_BY_TAGS = gql`
  query GetDesignsByTags($tags: [String!]!) {
    designsByTags(tags: $tags) {
      id
      name
      description
      imageUrl
      isFeatured
      isActive
      likes
      downloads
      tagsList
      status
      createdAt
    }
  }
`

const GET_MY_DESIGNS = gql`
  query GetMyDesigns {
    myDesigns {
      id
      name
      description
      imageUrl
      isFeatured
      isActive
      likes
      downloads
      tagsList
      status
      createdAt
    }
  }
`

const TOGGLE_LIKE_DESIGN = gql`
  mutation ToggleLikeDesign($id: ID!) {
    toggleLikeDesign(id: $id) {
      success
      likes
      design {
        id
        likes
      }
    }
  }
`

export default {
  name: 'DesignGrid',
  setup() {
    // Reactive state
    const searchQuery = ref('')
    const activeTags = ref([])
    const showFeaturedOnly = ref(false)
    const showMyDesigns = ref(false)
    const currentPage = ref(1)
    const itemsPerPage = ref(12)
    const liking = ref(false)

    // GraphQL queries
    const {
      result: featuredResult,
      loading: featuredLoading,
      error: featuredError,
      refetch: refetchFeatured
    } = useQuery(GET_FEATURED_DESIGNS)

    const {
      result: tagsResult,
      loading: tagsLoading,
      error: tagsError,
      refetch: refetchTags
    } = useQuery(GET_DESIGNS_BY_TAGS, () => ({ tags: activeTags.value }), () => ({
      enabled: activeTags.value.length > 0
    }))

    const {
      result: myDesignsResult,
      loading: myDesignsLoading,
      error: myDesignsError,
      refetch: refetchMyDesigns
    } = useQuery(GET_MY_DESIGNS, null, () => ({
      enabled: showMyDesigns.value
    }))

    // Toggle like mutation
    const { mutate: toggleLikeDesign } = useMutation(TOGGLE_LIKE_DESIGN)

    // Computed properties
    const loading = computed(() => {
      if (showMyDesigns.value) return myDesignsLoading.value
      if (activeTags.value.length > 0) return tagsLoading.value
      return featuredLoading.value
    })

    const error = computed(() => {
      if (showMyDesigns.value) return myDesignsError.value
      if (activeTags.value.length > 0) return tagsError.value
      return featuredError.value
    })

    const allDesigns = computed(() => {
      if (showMyDesigns.value) return myDesignsResult.value?.myDesigns || []
      if (activeTags.value.length > 0) return tagsResult.value?.designsByTags || []
      return featuredResult.value?.featuredDesigns || []
    })

    const filteredDesigns = computed(() => {
      let designs = allDesigns.value

      // Filter by featured if requested
      if (showFeaturedOnly.value) {
        designs = designs.filter(design => design.isFeatured)
      }

      return designs
    })

    const totalPages = computed(() => {
      return Math.ceil(filteredDesigns.value.length / itemsPerPage.value)
    })

    const paginatedDesigns = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredDesigns.value.slice(start, end)
    })

    // Methods
    const handleSearch = () => {
      const query = searchQuery.value.trim()
      if (query) {
        const tags = query.split(',').map(tag => tag.trim()).filter(tag => tag)
        activeTags.value = tags
      } else {
        activeTags.value = []
      }
      currentPage.value = 1
    }

    const removeTag = (tagToRemove) => {
      activeTags.value = activeTags.value.filter(tag => tag !== tagToRemove)
      searchQuery.value = activeTags.value.join(', ')
      currentPage.value = 1
    }

    const toggleLike = async (design) => {
      if (liking.value) return
      
      liking.value = true
      try {
        const result = await toggleLikeDesign({ id: design.id })
        if (result?.data?.toggleLikeDesign?.success) {
          // Update local design's likes count
          design.likes = result.data.toggleLikeDesign.likes
          
          // Track like action
          trackDesignInteraction('like_design', design)
        }
      } catch (err) {
        console.error('Error toggling like:', err)
      } finally {
        liking.value = false
      }
    }

    const trackDesignClick = (design) => {
      // Track design view when card is clicked
      import('@/services/TrackingService').then(({ trackingService }) => {
        trackingService.trackDesignView({
          id: design.id,
          name: design.name,
          category: design.category,
          imageUrl: design.imageUrl
        }).catch(error => {
          console.warn('Design tracking failed:', error)
        })
      }).catch(error => {
        console.warn('Failed to load tracking service:', error)
      })
    }

    const trackDesignInteraction = (action, design) => {
      import('@/services/TrackingService').then(({ trackingService }) => {
        trackingService.trackAction({
          action: action,
          targetType: 'design',
          targetId: design.id,
          metadata: {
            designName: design.name,
            category: design.category,
            imageUrl: design.imageUrl,
            timestamp: Date.now()
          }
        }).catch(error => {
          console.warn('Design interaction tracking failed:', error)
        })
      }).catch(error => {
        console.warn('Failed to load tracking service:', error)
      })
    }

    const handleImageError = (event) => {
      event.target.src = '/placeholder-design.png'
    }

    const getStatusClass = (status) => {
      switch (status) {
        case 'approved':
          return 'bg-green-100 text-green-800'
        case 'pending':
          return 'bg-yellow-100 text-yellow-800'
        case 'rejected':
          return 'bg-red-100 text-red-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const refetch = () => {
      if (showMyDesigns.value) refetchMyDesigns()
      else if (activeTags.value.length > 0) refetchTags()
      else refetchFeatured()
    }

    // Watch for filter changes
    watch([showFeaturedOnly, showMyDesigns], () => {
      currentPage.value = 1
    })

    // Reset page when filtered designs change
    watch(filteredDesigns, () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1
      }
    })

    return {
      // Reactive state
      searchQuery,
      activeTags,
      showFeaturedOnly,
      showMyDesigns,
      currentPage,
      itemsPerPage,
      liking,
      
      // Computed
      loading,
      error,
      filteredDesigns,
      totalPages,
      paginatedDesigns,
      
      // Methods
      handleSearch,
      removeTag,
      toggleLike,
      trackDesignClick,
      trackDesignInteraction,
      handleImageError,
      getStatusClass,
      refetch
    }
  }
}
</script>

<style scoped>
.design-grid-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

.designs-grid {
  min-height: 400px;
}

.design-card {
  transition: transform 0.2s ease-in-out;
}

.design-card:hover {
  transform: translateY(-2px);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

@media (max-width: 640px) {
  .design-grid-container {
    padding: 0.5rem;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
