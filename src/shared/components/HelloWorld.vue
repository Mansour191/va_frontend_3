<template>
  <v-card variant="elevated" class="hello-card pa-6" rounded="xl">
    <v-card-title class="text-h4 font-weight-bold mb-6 text-center">
      <v-icon color="primary" class="me-3">mdi-rocket-launch</v-icon>
      {{ msg }}
    </v-card-title>
    
    <v-divider class="mb-6" />
    
    <!-- Welcome Section -->
    <v-card-text class="mb-6">
      <p class="text-body-1 mb-4 text-center">
        {{ $t('welcomeMessage') || 'For a guide and recipes on how to configure / customize this project,' }}<br />
        {{ $t('checkOut') || 'check out the' }}
        <v-btn
          href="https://cli.vuejs.org"
          target="_blank"
          rel="noopener"
          variant="text"
          color="primary"
          size="small"
          class="text-none"
        >
          <v-icon size="small" class="me-1">mdi-open-in-new</v-icon>
          {{ $t('vueCliDocs') || 'vue-cli documentation' }}
        </v-btn>
      </p>
      
      <!-- Feature Cards -->
      <v-row class="mt-6">
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal" class="feature-card h-100">
            <v-card-text class="text-center pa-4">
              <v-icon size="48" color="primary" class="mb-3">mdi-vuejs</v-icon>
              <h6 class="text-h6 font-weight-bold mb-2">Vue 3</h6>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('vue3Desc') || 'Built with the latest Vue 3 Composition API' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal" class="feature-card h-100">
            <v-card-text class="text-center pa-4">
              <v-icon size="48" color="success" class="mb-3">mdi-vuetify</v-icon>
              <h6 class="text-h6 font-weight-bold mb-2">Vuetify</h6>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('vuetifyDesc') || 'Material Design Component Framework' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-card variant="tonal" class="feature-card h-100">
            <v-card-text class="text-center pa-4">
              <v-icon size="48" color="info" class="mb-3">mdi-palette</v-icon>
              <h6 class="text-h6 font-weight-bold mb-2">Beautiful UI</h6>
              <p class="text-body-2 text-medium-emphasis">
                {{ $t('beautifulUIDesc') || 'Modern and responsive design' }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
    
    <v-divider class="mb-4" />
    
    <!-- Installed CLI Plugins -->
    <v-card-title class="text-h6 mb-4">
      <v-icon class="me-2">mdi-puzzle</v-icon>
      {{ $t('installedPlugins') || 'Installed CLI Plugins' }}
    </v-card-title>
    
    <v-card-text>
      <v-list density="compact" class="mb-6">
        <v-list-item>
          <v-list-item-title>
            <v-btn
              href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-babel"
              target="_blank"
              rel="noopener"
              variant="text"
              color="primary"
              size="small"
              class="text-none"
            >
              <v-icon class="me-1" size="16">mdi-language-javascript</v-icon>
              {{ $t('babel') || 'babel' }}
            </v-btn>
          </v-list-item-title>
        </v-list-item>
        
        <v-list-item>
          <v-list-item-title>
            <v-btn
              href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-eslint"
              target="_blank"
              rel="noopener"
              variant="text"
              color="primary"
              size="small"
              class="text-none"
            >
              <v-icon class="me-1" size="16">mdi-check-circle</v-icon>
              {{ $t('eslint') || 'eslint' }}
            </v-btn>
          </v-list-item-title>
        </v-list-item>
        
        <v-list-item>
          <v-list-item-title>
            <v-btn
              href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-router"
              target="_blank"
              rel="noopener"
              variant="text"
              color="primary"
              size="small"
              class="text-none"
            >
              <v-icon class="me-1" size="16">mdi-routes</v-icon>
              {{ $t('router') || 'router' }}
            </v-btn>
          </v-list-item-title>
        </v-list-item>
        
        <v-list-item>
          <v-list-item-title>
            <v-btn
              href="https://github.com/vuejs/vue-cli/tree/dev/packages/%40vue/cli-plugin-vuex"
              target="_blank"
              rel="noopener"
              variant="text"
              color="primary"
              size="small"
              class="text-none"
            >
              <v-icon class="me-1" size="16">mdi-database</v-icon>
              {{ $t('vuex') || 'vuex' }}
            </v-btn>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-card-text>
    
    <v-divider class="mb-4" />
    
    <!-- Essential Links -->
    <v-card-title class="text-h6 mb-4">
      <v-icon class="me-2">mdi-link</v-icon>
      {{ $t('essentialLinks') || 'Essential Links' }}
    </v-card-title>
    
    <v-card-text>
      <v-row dense>
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://vuejs.org"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="primary"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-code-tags</v-icon>
            {{ $t('coreDocs') || 'Core Docs' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://forum.vuejs.org"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="primary"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-forum</v-icon>
            {{ $t('forum') || 'Forum' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://chat.vuejs.org"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="primary"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-chat</v-icon>
            {{ $t('communityChat') || 'Community Chat' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://twitter.com/vuejs"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="info"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-twitter</v-icon>
            {{ $t('twitter') || 'Twitter' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://news.vuejs.org"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="info"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-newspaper</v-icon>
            {{ $t('news') || 'News' }}
          </v-btn>
        </v-col>
        
        <v-col cols="12" sm="6" md="4">
          <v-btn
            href="https://github.com/vuejs/vue"
            target="_blank"
            rel="noopener"
            variant="outlined"
            color="info"
            size="small"
            block
            class="mb-2 text-none"
          >
            <v-icon start>mdi-github</v-icon>
            {{ $t('github') || 'GitHub' }}
          </v-btn>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

// Props
defineProps({
  msg: {
    type: String,
    default: 'Welcome to Paclos Vinyl Art'
  }
});

// State
const loading = ref(false);

// Methods
const checkSystemStatus = async () => {
  loading.value = true;
  try {
    // Simulate system status check
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(' System status checked');
  } catch (error) {
    console.error(' Error checking system status:', error);
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  checkSystemStatus();
});
</script>

<style scoped>
.hello-card {
  background: linear-gradient(135deg, rgba(var(--v-theme-surface), 0.9), rgba(var(--v-theme-primary), 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(var(--v-theme-outline), 0.2);
  max-width: 800px;
  margin: 0 auto;
}

.feature-card {
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(var(--v-theme-primary), 0.15);
}

:deep(.v-list-item) {
  margin-bottom: 4px;
}

:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .hello-card {
    margin: 16px;
  }
  
  .feature-card {
    margin-bottom: 16px;
  }
}
</style>
