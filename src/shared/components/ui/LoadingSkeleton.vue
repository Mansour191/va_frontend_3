<template>
  <div class="loading-skeleton-container">
    <!-- Basic Skeleton Loader -->
    <v-skeleton-loader
      :type="skeletonType"
      :width="width"
      :height="height"
      :loading="animate"
      class="skeleton-item"
      :style="customStyle"
      :color="skeletonColor"
      :elevation="elevation"
      :rounded="rounded"
    />
    
    <!-- Enhanced Skeleton with Animation Variants -->
    <div v-if="showEnhanced" class="enhanced-skeleton">
      <!-- Pulse Animation -->
      <div v-if="animationType === 'pulse'" class="pulse-skeleton" :style="customStyle">
        <div class="pulse-content" :class="`skeleton-${skeletonType}`"></div>
      </div>
      
      <!-- Wave Animation -->
      <div v-else-if="animationType === 'wave'" class="wave-skeleton" :style="customStyle">
        <div class="wave-content" :class="`skeleton-${skeletonType}`">
          <div class="wave-overlay"></div>
        </div>
      </div>
      
      <!-- Shimmer Animation -->
      <div v-else-if="animationType === 'shimmer'" class="shimmer-skeleton" :style="customStyle">
        <div class="shimmer-content" :class="`skeleton-${skeletonType}`">
          <div class="shimmer-overlay"></div>
        </div>
      </div>
    </div>
    
    <!-- Skeleton Group for Complex Layouts -->
    <div v-if="showGroup" class="skeleton-group">
      <!-- Card Skeleton -->
      <v-card v-if="groupType === 'card'" :elevation="elevation" class="skeleton-card">
        <v-skeleton-loader
          type="avatar"
          width="40"
          height="40"
          class="skeleton-avatar ma-3"
        />
        <v-skeleton-loader
          type="heading"
          width="60%"
          height="24"
          class="skeleton-title mx-3 mb-2"
        />
        <v-skeleton-loader
          type="text@3"
          width="100%"
          height="16"
          class="skeleton-text mx-3 mb-2"
        />
        <v-skeleton-loader
          type="button"
          width="80"
          height="32"
          class="skeleton-button ma-3"
        />
      </v-card>
      
      <!-- List Skeleton -->
      <v-list v-else-if="groupType === 'list'" class="skeleton-list">
        <v-list-item v-for="i in listItems" :key="i">
          <template v-slot:prepend>
            <v-skeleton-loader
              type="avatar"
              width="40"
              height="40"
              class="skeleton-avatar me-3"
            />
          </template>
          <v-list-item-title>
            <v-skeleton-loader
              type="text"
              width="70%"
              height="20"
              class="skeleton-text"
            />
          </v-list-item-title>
          <v-list-item-subtitle>
            <v-skeleton-loader
              type="text"
              width="50%"
              height="16"
              class="skeleton-text mt-1"
            />
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
      
      <!-- Table Skeleton -->
      <v-table v-else-if="groupType === 'table'" class="skeleton-table">
        <thead>
          <tr>
            <th v-for="i in tableColumns" :key="i">
              <v-skeleton-loader
                type="text"
                width="80%"
                height="20"
                class="skeleton-text"
              />
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableRows" :key="row">
            <td v-for="col in tableColumns" :key="col">
              <v-skeleton-loader
                type="text"
                width="60%"
                height="16"
                class="skeleton-text"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
    
    <!-- Loading State with Text -->
    <div v-if="showText" class="loading-text-container">
      <v-skeleton-loader
        :type="skeletonType"
        :width="width"
        :height="height"
        :loading="animate"
        class="skeleton-item mb-2"
        :style="customStyle"
      />
      <p class="loading-text text-body-2 text-medium-emphasis">
        {{ loadingText || $t('loading') || 'Loading...' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale, t } = useI18n();

// Props
defineProps({
  type: {
    type: String,
    default: 'text', // text, title, avatar, image, button, circle
  },
  width: {
    type: String,
    default: '100%',
  },
  height: {
    type: String,
    default: '1rem',
  },
  animate: {
    type: Boolean,
    default: true,
  },
  borderRadius: {
    type: String,
    default: '8px'
  },
  // Enhanced props
  showEnhanced: {
    type: Boolean,
    default: false
  },
  animationType: {
    type: String,
    default: 'pulse', // pulse, wave, shimmer
    validator: (value) => ['pulse', 'wave', 'shimmer'].includes(value)
  },
  skeletonColor: {
    type: String,
    default: 'surface-variant'
  },
  elevation: {
    type: [String, Number],
    default: 0
  },
  rounded: {
    type: [String, Boolean],
    default: 'lg'
  },
  // Group props
  showGroup: {
    type: Boolean,
    default: false
  },
  groupType: {
    type: String,
    default: 'card', // card, list, table
    validator: (value) => ['card', 'list', 'table'].includes(value)
  },
  listItems: {
    type: Number,
    default: 3
  },
  tableColumns: {
    type: Number,
    default: 4
  },
  tableRows: {
    type: Number,
    default: 3
  },
  // Text props
  showText: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: ''
  }
});

// Computed
const isRtl = computed(() => locale.value === 'ar');

const skeletonType = computed(() => {
  const typeMap = {
    'text': 'text',
    'title': 'heading',
    'avatar': 'avatar',
    'image': 'image',
    'button': 'button',
    'circle': 'avatar'
  };
  return typeMap[props.type] || 'text';
});

const customStyle = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.type === 'circle' || props.type === 'avatar' ? '50%' : props.borderRadius
}));
</script>

<style scoped>
.loading-skeleton-container {
  position: relative;
}

.skeleton-item {
  transition: all 0.3s ease;
}

/* Enhanced Skeleton Animations */
.enhanced-skeleton {
  position: relative;
  overflow: hidden;
}

/* Pulse Animation */
.pulse-skeleton {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
}

.pulse-content {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

/* Wave Animation */
.wave-skeleton {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.wave-content {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  position: relative;
}

.wave-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(var(--v-theme-surface), 0.3),
    transparent
  );
  animation: wave 1.5s ease-in-out infinite;
}

@keyframes wave {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Shimmer Animation */
.shimmer-skeleton {
  background: rgba(var(--v-theme-surface-variant), 0.3);
  border-radius: 8px;
  overflow: hidden;
}

.shimmer-content {
  width: 100%;
  height: 100%;
  background: rgba(var(--v-theme-surface-variant), 0.5);
  position: relative;
}

.shimmer-overlay {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(var(--v-theme-surface), 0.2) 20%,
    rgba(var(--v-theme-surface), 0.5) 60%,
    rgba(var(--v-theme-surface), 0.2) 80%,
    transparent 100%
  );
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* Skeleton Types */
.skeleton-text {
  height: 1rem;
  border-radius: 4px;
}

.skeleton-heading {
  height: 1.5rem;
  border-radius: 6px;
}

.skeleton-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-image {
  aspect-ratio: 16/9;
  border-radius: 8px;
}

.skeleton-button {
  height: 2.5rem;
  border-radius: 6px;
  width: 80px;
}

/* Skeleton Group Styles */
.skeleton-group {
  width: 100%;
}

.skeleton-card {
  margin-bottom: 16px;
}

.skeleton-list {
  background: transparent;
}

.skeleton-table {
  width: 100%;
}

.skeleton-table th,
.skeleton-table td {
  padding: 12px;
  text-align: left;
}

/* Loading Text */
.loading-text-container {
  text-align: center;
}

.loading-text {
  margin-top: 8px;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

/* RTL Support */
[dir="rtl"] .wave-overlay,
[dir="rtl"] .shimmer-overlay {
  animation-direction: reverse;
}

/* Responsive Adjustments */
@media (max-width: 600px) {
  .skeleton-card {
    margin-bottom: 12px;
  }
  
  .skeleton-avatar {
    width: 32px;
    height: 32px;
  }
  
  .skeleton-text {
    height: 0.875rem;
  }
  
  .skeleton-heading {
    height: 1.25rem;
  }
}
</style>
