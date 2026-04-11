<template>
  <v-btn
    :icon="isInWishlist ? 'mdi-heart' : 'mdi-heart-outline'"
    :variant="isInWishlist ? 'elevated' : 'outlined'"
    :color="isInWishlist ? 'primary' : 'default'"
    :loading="loading"
    :disabled="loading"
    @click="toggleWishlist"
    :title="$t(isInWishlist ? 'removeFromWishlist' : 'addToWishlist')"
    class="wishlist-btn transition-all"
    :class="{ 'wishlist-btn--active': isInWishlist }"
  >
    <v-icon
      v-if="loading"
      icon="mdi-loading"
      size="20"
      class="animate-spin"
    />
    <template v-else>
      <v-icon
        :icon="isInWishlist ? 'mdi-heart' : 'mdi-heart-outline'"
        :color="isInWishlist ? 'primary' : 'default'"
        :class="{ 'animate-heart': justAdded }"
      />
      <span v-if="showText" class="ms-2">
        {{ $t(isInWishlist ? 'removeFromWishlist' : 'addToWishlist') }}
      </span>
    </template>
    
    <!-- Wishlist Count Badge -->
    <v-badge
      v-if="showCount && wishlistCount > 0"
      :content="wishlistCount"
      color="error"
      offset-x="-4"
      offset-y="-4"
      class="wishlist-badge"
    />
  </v-btn>
  
  <!-- Login Dialog -->
  <v-dialog v-model="showLoginDialog" max-width="400">
    <v-card>
      <v-card-title class="text-h6 pa-4">
        <v-icon color="primary" class="me-2">mdi-account-heart</v-icon>
        {{ $t('loginRequired') || 'تسجيل الدخول مطلوب' }}
      </v-card-title>
      
      <v-card-text class="pa-4">
        <p class="text-body-2 text-medium-emphasis mb-4">
          {{ $t('loginForWishlist') || 'يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة' }}
        </p>
        
        <div class="d-flex ga-2">
          <v-btn
            color="primary"
            variant="elevated"
            prepend-icon="mdi-login"
            @click="goToLogin"
            block
          >
            {{ $t('login') || 'تسجيل الدخول' }}
          </v-btn>
          
          <v-btn
            variant="outlined"
            @click="showLoginDialog = false"
          >
            {{ $t('cancel') || 'إلغاء' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import WishlistService from '@/integration/services/WishlistService';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

// Props
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  showText: {
    type: Boolean,
    default: false,
  },
  showCount: {
    type: Boolean,
    default: false,
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['x-small', 'small', 'default', 'large', 'x-large'].includes(value)
  }
});

// State
const loading = ref(false);
const isInWishlist = ref(false);
const wishlistCount = ref(0);
const showLoginDialog = ref(false);
const justAdded = ref(false);

// Computed
const isAuthenticated = computed(() => store.getters['auth/isAuthenticated']);

// Methods
const checkWishlistStatus = async () => {
  if (!isAuthenticated.value) return;
  
  try {
    // Use the optimized isInWishlist method
    const inWishlist = await WishlistService.isInWishlist(props.item.id || props.item.productId);
    isInWishlist.value = inWishlist;
    
    // Also update count
    await loadWishlistCount();
  } catch (error) {
    console.error('❌ Error checking wishlist status:', error);
    // Fallback to getting all items
    try {
      const wishlistItems = await WishlistService.getWishlistItems();
      isInWishlist.value = wishlistItems.some(item => 
        item.productId === props.item.id || 
        item.productId === props.item.productId || 
        item.product?.id === props.item.id ||
        item.product?.id === props.item.productId
      );
      wishlistCount.value = wishlistItems.length;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
};

const toggleWishlist = async () => {
  if (!isAuthenticated.value) {
    showLoginDialog.value = true;
    return;
  }
  
  loading.value = true;
  
  try {
    // Use the new toggleWishlist method from WishlistService
    const response = await WishlistService.toggleWishlist(props.item.id || props.item.productId);
    
    if (response.success) {
      // Update state immediately based on response
      isInWishlist.value = response.is_in_wishlist;
      wishlistCount.value = response.wishlist_count || 0;
      
      if (response.is_in_wishlist) {
        justAdded.value = true;
        showNotification('added');
        
        // Update Vuex store
        store.dispatch('user/addToWishlist', props.item);
        
        // Reset animation
        setTimeout(() => {
          justAdded.value = false;
        }, 600);
      } else {
        showNotification('removed');
        
        // Update Vuex store
        store.dispatch('user/removeFromWishlist', props.item.id || props.item.productId);
      }
    } else {
      console.error('❌ Failed to toggle wishlist:', response.message);
      showNotification('error', response.message || t('wishlistError') || 'حدث خطأ في المفضلة');
    }
  } catch (error) {
    console.error('❌ Error toggling wishlist:', error);
    showNotification('error', t('wishlistError') || 'حدث خطأ في المفضلة');
  } finally {
    loading.value = false;
  }
};

const showNotification = (type, customMessage = null) => {
  const messages = {
    added: t('itemAddedToWishlist') || 'تمت الإضافة إلى المفضلة',
    removed: t('itemRemovedFromWishlist') || 'تمت الإزالة من المفضلة',
    error: customMessage || t('wishlistError') || 'حدث خطأ في المفضلة'
  };
  
  const icons = {
    added: 'mdi-heart',
    removed: 'mdi-heart-broken',
    error: 'mdi-alert-circle'
  };
  
  const colors = {
    added: 'success',
    removed: 'info',
    error: 'error'
  };
  
  // Show notification via Vuex store
  store.dispatch('notifications/add', {
    type: colors[type],
    title: t('wishlist') || 'المفضلة',
    message: `${messages[type]}: ${props.item.title || props.item.name || t('item') || 'المنتج'}`,
    icon: icons[type],
    timeout: 3000
  });
};

const goToLogin = () => {
  showLoginDialog.value = false;
  router.push({
    name: 'login',
    query: { redirect: router.currentRoute.value.fullPath }
  });
};

const loadWishlistCount = async () => {
  if (!isAuthenticated.value) return;
  
  try {
    // Use the new getWishlistCount method for better performance
    const count = await WishlistService.getWishlistCount();
    wishlistCount.value = count;
  } catch (error) {
    console.error('❌ Error loading wishlist count:', error);
    // Fallback to getting all items
    try {
      const wishlistItems = await WishlistService.getWishlistItems();
      wishlistCount.value = wishlistItems.length;
    } catch (fallbackError) {
      console.error('❌ Fallback also failed:', fallbackError);
    }
  }
};

// Watchers
watch(() => props.item.id, () => {
  checkWishlistStatus();
});

watch(() => isAuthenticated.value, (newValue) => {
  if (newValue) {
    checkWishlistStatus();
    loadWishlistCount();
  } else {
    isInWishlist.value = false;
    wishlistCount.value = 0;
  }
});

// Lifecycle
onMounted(() => {
  checkWishlistStatus();
  loadWishlistCount();
});
</script>

<style scoped>
.wishlist-btn {
  position: relative;
  transition: all 0.3s ease;
}

.wishlist-btn--active {
  transform: scale(1.05);
}

.wishlist-btn:hover {
  transform: translateY(-2px);
}

.wishlist-badge {
  position: absolute;
  top: -8px;
  right: -8px;
}

.animate-heart {
  animation: heartBeat 0.6s ease-in-out;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.3);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.2);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Size variations */
.v-btn--size-x-small .wishlist-badge {
  top: -6px;
  right: -6px;
}

.v-btn--size-small .wishlist-badge {
  top: -7px;
  right: -7px;
}

.v-btn--size-large .wishlist-badge {
  top: -10px;
  right: -10px;
}

.v-btn--size-x-large .wishlist-badge {
  top: -12px;
  right: -12px;
}
</style>

