<template>
  <v-dialog
    v-model="dialogVisible"
    :persistent="persistent"
    max-width="500"
    transition="dialog-transition"
  >
    <v-card>
      <!-- Header -->
      <v-card-title class="d-flex align-center pa-4">
        <v-icon color="warning" size="24" class="me-3">
          mdi-alert-triangle
        </v-icon>
        <span class="text-h6 font-weight-bold">
          {{ $t('unsavedChanges') || 'هل تريد المغادرة؟' }}
        </span>
      </v-card-title>
      
      <v-divider />
      
      <!-- Body -->
      <v-card-text class="pa-4">
        <p class="text-body-1 text-medium-emphasis mb-0">
          {{ $t('unsavedChangesMessage') || 'لديك تغييرات غير محفوظة. هل أنت متأكد من أنك تريد المغادرة؟' }}
        </p>
        
        <v-alert
          v-if="showDetails"
          type="info"
          variant="tonal"
          class="mt-4"
          density="compact"
        >
          <div class="text-body-2">
            <strong>{{ $t('unsavedChangesDetails') || 'التغييرات غير المحفوظة:' }}</strong>
            <ul class="mt-2">
              <li v-for="change in unsavedItems" :key="change.id">
                {{ change.description }}
              </li>
            </ul>
          </div>
        </v-alert>
      </v-card-text>
      
      <v-divider />
      
      <!-- Actions -->
      <v-card-actions class="pa-4">
        <v-spacer />
        
        <v-btn
          variant="outlined"
          color="default"
          prepend-icon="mdi-pencil"
          @click="stay"
          :disabled="loading"
        >
          {{ $t('stayOnPage') || 'البقاء والتعديل' }}
        </v-btn>
        
        <v-btn
          color="error"
          variant="elevated"
          prepend-icon="mdi-logout"
          @click="leave"
          :loading="loading"
        >
          {{ $t('leaveAnyway') || 'المغادرة على أي حال' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  persistent: {
    type: Boolean,
    default: true,
  },
  unsavedItems: {
    type: Array,
    default: () => []
  },
  showDetails: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['stay', 'leave']);

// State
const loading = ref(false);

// Computed
const dialogVisible = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      stay();
    }
  }
});

// Methods
const stay = () => {
  emit('stay');
};

const leave = async () => {
  loading.value = true;
  
  try {
    // Simulate any cleanup or save operations
    await new Promise(resolve => setTimeout(resolve, 500));
    
    emit('leave');
  } catch (error) {
    console.error('❌ Error during leave action:', error);
  } finally {
    loading.value = false;
  }
};

// Watch for prop changes
watch(() => props.show, (newValue) => {
  if (newValue) {
    // Reset loading state when dialog opens
    loading.value = false;
  }
});
</script>

<style scoped>
/* Vuetify handles most styling, but we can add custom enhancements */
.v-card {
  border-radius: 16px;
  overflow: hidden;
}

/* Animation for dialog transition */
.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: all 0.3s ease;
}

.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card {
    margin: 16px;
  }
  
  .v-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .v-card-actions .v-btn {
    width: 100%;
  }
}
</style>
