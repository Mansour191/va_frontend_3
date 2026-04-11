<template>
  <div class="toast-container">
    <v-snackbar
      v-for="toast in toasts"
      :key="toast.id"
      v-model="toast.show"
      :color="getToastColor(toast.type)"
      :timeout="toast.duration || TOAST_DURATION"
      :location="toast.location || 'bottom'"
      :position="toast.position || 'right'"
      class="toast-snackbar"
      @update:modelValue="() => removeToast(toast.id)"
    >
      <div class="toast-content">
        <div class="d-flex align-center">
          <v-icon :icon="getToastIcon(toast.type)" class="me-3" size="20" />
          <div class="flex-grow-1">
            <div class="toast-title">{{ toast.title }}</div>
            <div class="toast-message text-body-2">{{ toast.message }}</div>
          </div>
          <v-btn
            icon="mdi-close"
            variant="text"
            size="small"
            @click="removeToast(toast.id)"
            class="ms-2"
          />
        </div>
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const toasts = ref([]);
const TOAST_DURATION = 5000;

const isRtl = computed(() => locale.value === 'ar');

const removeToast = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};

const addToast = (event) => {
  const { title, message, type, icon, duration, location, position } = event.detail;
  const id = Date.now();
  
  const newToast = {
    id,
    title,
    message,
    type: type || 'info',
    icon: icon || 'mdi-information',
    duration: duration || TOAST_DURATION,
    location: location || (isRtl.value ? 'bottom' : 'bottom'),
    position: position || (isRtl.value ? 'left' : 'right'),
    show: true
  };

  toasts.value.push(newToast);
};

// Helper methods
const getToastColor = (type) => {
  const colorMap = {
    success: 'success',
    error: 'error',
    warning: 'warning',
    info: 'info',
    danger: 'error'
  };
  return colorMap[type] || 'info';
};

const getToastIcon = (type) => {
  const iconMap = {
    success: 'mdi-check-circle',
    error: 'mdi-alert-circle',
    warning: 'mdi-alert',
    info: 'mdi-information',
    danger: 'mdi-alert-circle'
  };
  return iconMap[type] || 'mdi-information';
};

onMounted(() => {
  window.addEventListener('app-toast', addToast);
});

onUnmounted(() => {
  window.removeEventListener('app-toast', addToast);
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
  pointer-events: none;
}

.toast-container[dir="rtl"] {
  right: auto;
  left: 20px;
}

.toast-snackbar {
  pointer-events: auto;
  margin-bottom: 8px;
}

.toast-content {
  width: 100%;
}

.toast-title {
  font-weight: 600;
  margin-bottom: 4px;
}

.toast-message {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .toast-container {
    left: 16px !important;
    right: 16px !important;
    bottom: 16px;
    max-width: none;
  }
}
</style>
