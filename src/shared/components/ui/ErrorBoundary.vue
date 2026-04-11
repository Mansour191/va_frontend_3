<template>
  <div class="error-boundary-container">
    <v-alert
      v-if="hasError"
      type="error"
      variant="elevated"
      class="error-alert"
    >
      <v-alert-title class="d-flex align-center ga-3">
        <v-icon size="large" color="error">mdi-alert-circle</v-icon>
        <span>{{ $t('unexpectedError') || 'عذراً، حدث خطأ غير متوقع' }}</span>
      </v-alert-title>
      <v-alert-text>{{ errorMessage }}</v-alert-text>
      <v-alert-actions>
        <v-btn
          @click="retry"
          prepend-icon="mdi-refresh"
          variant="elevated"
          color="primary"
        >
          {{ $t('retry') || 'إعادة المحاولة' }}
        </v-btn>
      </v-alert-actions>
    </v-alert>
    <div v-else>
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const hasError = ref(false);
const errorMessage = ref('');

const retry = () => {
  hasError.value = false;
  errorMessage.value = '';
};

const errorCaptured = (err, vm, info) => {
  hasError.value = true;
  errorMessage.value = err.message || t('unexpectedError');
  console.error('Error caught by boundary:', err, info);
  return false;
};

// Error boundary for Vue 3
defineExpose({
  errorCaptured
});
</script>

