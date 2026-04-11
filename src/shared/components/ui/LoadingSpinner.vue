<template>
  <v-overlay
    v-model="showOverlay"
    :contained="!fullscreen"
    :scrim="overlay"
    class="loading-overlay"
  >
    <div class="d-flex flex-column align-center justify-center pa-8">
      <v-progress-circular
        :size="spinnerSize"
        :width="3"
        color="primary"
        indeterminate
        class="mb-4"
      />
      <v-card
        v-if="message"
        variant="elevated"
        color="surface"
        class="pa-4 text-center"
        max-width="300"
      >
        <v-card-text class="text-body-1">{{ message }}</v-card-text>
      </v-card>
    </div>
  </v-overlay>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  fullscreen: {
    type: Boolean,
    default: false,
  },
  overlay: {
    type: Boolean,
    default: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
  medium: {
    type: Boolean,
    default: false,
  },
  large: {
    type: Boolean,
    default: true,
  },
  message: {
    type: String,
    default: '',
  },
});

const showOverlay = computed(() => true);

const spinnerSize = computed(() => {
  if (props.small) return 40;
  if (props.medium) return 60;
  if (props.large) return 80;
  return 60;
});
</script>

