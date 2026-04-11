import { createApp, h, provide } from 'vue'
import { createPinia } from 'pinia'
// Import Vuetify plugin
import vuetify from '@/shared/plugins/vuetify'
import App from './App.vue'
import router from '@/shared/router'
import i18n from '@/shared/plugins/i18n'
import AITranslation from '@/shared/plugins/AITranslation'
import store from '@/shared/store'
import seo from '@/shared/plugins/seo'
import '@/shared/assets/main.css'
import '@/shared/assets/theme.css'
import AlertService from '@/shared/integration/services/AlertService'
import { useAuthStore } from '@/shared/store/auth'
import AIService from '@/shared/services/ai/AIService'  // Import class directly
import AIMonitorService from '@/shared/services/ai/AIMonitorService'
import PricingService from '@/shared/services/ai/PricingService'  // Import class directly
import ChatService from '@/shared/integration/services/ChatService'
import AILearningService, { initializeLearningSystem } from '@/shared/services/AILearningService.js';
import apiErrorLogger from '@/shared/services/http/ApiErrorLogger.js'
import { httpClient } from '@/shared/services/http/HttpClient.js'

// Import new plugins - with conditional loading to prevent duplicates
import PrimeVuePlugin from '@/shared/plugins/primevue'
import VueUsePlugin from '@/shared/plugins/vueuse'
// Note: Motion and AutoAnimate are handled by VueUse plugin to avoid duplicates
import { ApolloPlugin, client } from '@/shared/plugins/apolloPlugin'
import { DefaultApolloClient, provideApolloClient } from '@vue/apollo-composable'

// Import icons
import '@fortawesome/fontawesome-free/css/all.min.css'
import '@mdi/font/css/materialdesignicons.min.css'
import 'primeicons/primeicons.css'

const app = createApp({
  setup() {
    // Provide Apollo Client at the root level
    provide(DefaultApolloClient, client);
    return {};
  },
  ...App
})
const pinia = createPinia()

// Initialize theme system first
import { useTheme } from '@/composables/useTheme';

console.log('🎬 Starting Vynil Art Application...')

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('🔥 Global Error:', err)
  console.error('📍 Info:', info)

  AlertService.sendAlert({
    type: 'danger',
    severity: 'high',
    title: '⚠️ حدث خطأ غير متوقع',
    message: 'نعتذر، حدث خطأ في النظام. تم تسجيل الخطأ وسنعمل على إصلاحه.',
  })
}

// Install plugins in correct order - REMOVE DUPLICATE MOTION PLUGIN
app.use(pinia)
app.use(store)

// Router with error handling
try {
  app.use(router)
  console.log('✅ Router initialized successfully')
} catch (error) {
  console.error('❌ Router initialization failed:', error)
  // Continue without router if it fails
}

app.use(i18n)
app.use(AITranslation)
app.use(seo)
app.use(vuetify)

// Only use PrimeVue if not already used
if (!app._context.components && !app._context.directives) {
  app.use(PrimeVuePlugin)
}

// Only use VueUse if not already applied
try {
  app.use(VueUsePlugin)
} catch (error) {
  if (error.message.includes('has already been applied')) {
    console.log('ℹ️ VueUse plugin already applied, skipping...')
  } else {
    console.warn('⚠️ VueUse plugin error:', error.message)
  }
}

// REMOVED: MotionPlugin - already handled by VueUse plugin
console.log('ℹ️ Motion plugin handled by VueUse plugin, skipping duplicate installation')

// REMOVED: AutoAnimatePlugin - already handled by VueUse plugin  
console.log('ℹ️ AutoAnimate plugin handled by VueUse plugin, skipping duplicate installation')

// Apollo Client is provided via setup, no need for ApolloPlugin

// Initialize auth store after all plugins are installed
const authStore = useAuthStore()
authStore.initializeAuth()

// Initialize theme
const { initTheme } = useTheme()

// Provide Apollo Client globally for services outside Vue setup
console.log('🔗 Providing Apollo Client globally...');
provideApolloClient(client);

// Make Apollo Client available globally and emit ready event
window.__APOLLO_CLIENT__ = client;

// Wait for Apollo Client to be fully initialized and emit simple event
setTimeout(() => {
  console.log('✅ Apollo Client is ready and provided globally');
  
  // Use simple window.dispatchEvent - no custom event objects
  window.dispatchEvent(new CustomEvent('apollo-client-ready', { 
    detail: { client } 
  }));
}, 100);

// Mount the app
const mountedApp = app.mount('#app')

// Initialize theme after mounting
initTheme()

// Initialize AI Services after Apollo is ready - EVENT-BASED APPROACH
const initializeAIServices = () => {
  console.log('🔍 Initializing AI Services after Apollo ready...');
  
  // Initialize AI services that depend on Apollo
  try {
    // These will now wait for the Apollo ready event
    import('@/shared/services/ai/AIMonitorService').then(module => {
      const AIMonitorService = module.default;
      // Service will auto-start when Apollo is ready
    });
  } catch (error) {
    console.error('❌ Failed to initialize AI services:', error);
  }
};

// Start AI services initialization (only once)
initializeAIServices();

// Initialize AI Learning System - Prevent duplicate initialization
console.log('🎓 Starting AI Learning System...')
if (!AILearningService.isInitialized) {
  initializeLearningSystem().then(() => {
    console.log('✅ AI Learning System Started Successfully')
  }).catch(error => {
    console.warn('⚠️ AI Learning System Warning:', error)
  })
} else {
  console.log('ℹ️ AI Learning System Already Initialized')
}

console.log('🎬 Vynil Art Application Started Successfully!')
