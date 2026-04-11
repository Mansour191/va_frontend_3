<template>
  <v-sheet class="wishlist-page bg-surface min-h-screen">
    <v-container>
      <!-- Page Title -->
      <div class="d-flex align-center gap-3 mb-8">
        <v-icon size="32" color="warning">mdi-heart</v-icon>
        <h1 class="text-h3 font-weight-bold">{{ $t('myWishlist') }}</h1>
        <v-chip v-if="wishlistCount > 0" color="warning" variant="elevated" size="small">
          {{ wishlistCount }}
        </v-chip>
      </div>

      <!-- Empty Wishlist State -->
      <v-card v-if="wishlistCount === 0" class="empty-wishlist text-center pa-8" elevation="2">
        <v-card-text>
          <div class="empty-icon-wrapper mb-6">
            <v-icon size="80" color="grey-lighten-2">mdi-heart-broken</v-icon>
            <div class="icon-ring"></div>
          </div>
          <h2 class="text-h4 font-weight-bold mb-4">{{ $t('wishlistEmpty') }}</h2>
          <p class="text-body-1 text-medium-emphasis mb-8">{{ $t('wishlistEmptyMessage') }}</p>

          <div class="suggestions-section">
            <h3 class="text-h5 font-weight-bold mb-6">{{ $t('explore') }}</h3>
            <v-row justify="center">
              <v-col cols="12" sm="6" md="4">
                <v-card
                  to="/gallery"
                  hover
                  elevation="2"
                  class="suggestion-card text-center pa-6"
                >
                  <v-icon size="48" color="warning" class="mb-4">mdi-image-multiple</v-icon>
                  <span class="text-h6">{{ $t('gallery') }}</span>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  to="/furniture"
                  hover
                  elevation="2"
                  class="suggestion-card text-center pa-6"
                >
                  <v-icon size="48" color="warning" class="mb-4">mdi-sofa</v-icon>
                  <span class="text-h6">{{ $t('furniture') }}</span>
                </v-card>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <v-card
                  to="/walls"
                  hover
                  elevation="2"
                  class="suggestion-card text-center pa-6"
                >
                  <v-icon size="48" color="warning" class="mb-4">mdi-roller-shade</v-icon>
                  <span class="text-h6">{{ $t('walls') }}</span>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-card-text>
      </v-card>

      <!-- Wishlist Items Grid -->
      <v-row v-else>
        <v-col
          v-for="item in wishlistItems"
          :key="item.id"
          cols="12"
          sm="6"
          md="4"
          lg="3"
        >
          <v-card elevation="4" class="wishlist-card h-100">
            <div class="card-image-wrapper position-relative">
              <v-img
                :src="item.image"
                :alt="item.title"
                height="200"
                cover
                class="rounded-t-lg"
              >
                <template #placeholder>
                  <v-skeleton-loader type="image"></v-skeleton-loader>
                </template>
              </v-img>
              
              <!-- View Overlay -->
              <div class="image-overlay">
                <v-btn
                  :to="item.link"
                  icon="mdi-eye"
                  variant="elevated"
                  color="warning"
                  size="small"
                ></v-btn>
              </div>

              <!-- Remove Button -->
              <v-btn
                @click="removeFromWishlist(item.id)"
                :title="$t('removeFromWishlist')"
                icon="mdi-close"
                variant="elevated"
                color="error"
                size="small"
                class="remove-btn"
              ></v-btn>
            </div>

            <v-card-text>
              <h3 class="text-h6 font-weight-bold mb-2">
                <router-link :to="item.link" class="text-decoration-none text-white">
                  {{ item.title }}
                </router-link>
              </h3>

              <div class="card-meta mb-4">
                <v-chip size="x-small" color="warning" variant="elevated" prepend-icon="mdi-tag">
                  {{ item.category }}
                </v-chip>
              </div>

              <div class="card-actions d-flex flex-column gap-2">
                <v-btn
                  :to="item.link"
                  color="warning"
                  variant="elevated"
                  prepend-icon="mdi-eye"
                  class="text-none"
                  block
                >
                  {{ $t('viewDetails') }}
                </v-btn>

                <v-btn
                  :href="`https://wa.me/213663140341?text=${encodeURIComponent(
                    $t('whatsappInquiry') + ': ' + item.title
                  )}`"
                  target="_blank"
                  color="success"
                  variant="elevated"
                  prepend-icon="mdi-whatsapp"
                  class="text-none"
                  block
                >
                  {{ $t('inquiry') }}
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Clear All Button -->
      <div v-if="wishlistCount > 0" class="text-center mt-8">
        <v-btn
          @click="clearAll"
          color="error"
          variant="outlined"
          prepend-icon="mdi-trash-can"
          class="text-none"
        >
          {{ $t('clearWishlist') }}
        </v-btn>
      </div>
    </v-container>
  </v-sheet>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const { t } = useI18n();

// Computed
const wishlistItems = computed(() => store.getters['wishlist/wishlistItems']);
const wishlistCount = computed(() => store.getters['wishlist/wishlistCount']);

// Methods
const removeFromWishlist = (id) => {
  store.dispatch('wishlist/toggleWishlist', { id });
};

const clearWishlist = () => {
  store.dispatch('wishlist/clearWishlist');
};

const clearAll = () => {
  if (confirm(t('confirmClearWishlist'))) {
    clearWishlist();
  }
};

// Lifecycle
onMounted(() => {
  console.log('✅ صفحة المفضلة:', wishlistItems.value);
});
</script>

<style scoped>
/* Vuetify handles most styling */
.empty-icon-wrapper {
  position: relative;
  display: inline-block;
}

.icon-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  border: 2px solid rgba(212, 175, 55, 0.2);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.2;
  }
}

.card-image-wrapper {
  position: relative;
}

.image-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wishlist-card:hover .image-overlay {
  opacity: 1;
}

.remove-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
</style>
