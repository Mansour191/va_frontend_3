<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <v-dialog
        v-model="show"
        :max-width="maxWidth"
        :persistent="persistent"
        :fullscreen="fullscreen"
        :scrollable="scrollable"
        @keydown.esc="handleEscape"
        @click:outside="handleOutsideClick"
      >
        <v-card>
          <!-- Header -->
          <v-card-title v-if="showHeader" class="d-flex align-center">
            <slot name="header">
              <span class="text-h5">{{ title }}</span>
            </slot>
            <v-spacer />
            <v-btn
              v-if="showClose"
              icon="mdi-close"
              variant="text"
              @click="close"
              aria-label="Close"
            />
          </v-card-title>

          <v-divider v-if="showHeader" />

          <!-- Body -->
          <v-card-text class="pa-6">
            <slot></slot>
          </v-card-text>

          <!-- Footer -->
          <v-divider v-if="$slots.footer" />
          <v-card-actions v-if="$slots.footer" class="pa-4">
            <slot name="footer"></slot>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg, xl
  },
  closeOnOverlay: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  persistent: {
    type: Boolean,
    default: false
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  scrollable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue', 'close', 'open']);

// Computed
const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const maxWidth = computed(() => {
  const sizeMap = {
    sm: 400,
    md: 600,
    lg: 800,
    xl: 1200
  };
  return sizeMap[props.size] || sizeMap.md;
});

// Methods
const close = () => {
  emit('update:modelValue', false);
  emit('close');
};

const handleEscape = () => {
  if (!props.persistent) {
    close();
  }
};

const handleOutsideClick = () => {
  if (props.closeOnOverlay && !props.persistent) {
    close();
  }
};

// Watch for open events
watch(show, (newValue) => {
  if (newValue) {
    emit('open');
  }
});
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
