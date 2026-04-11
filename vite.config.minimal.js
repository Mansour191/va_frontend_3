import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@/integration': path.resolve(__dirname, './src/shared/integration'),
      },
    },
    server: {
      port: 8080,
      host: true,
      hmr: {
        port: 8080,
        host: 'localhost'
      },
      proxy: {
        '/graphql': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          ws: true
        },
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          ws: true
        }
      }
    },
    optimizeDeps: {
      include: [
        'vue',
        '@apollo/client',
        '@apollo/client/core',
        'graphql',
        'graphql-tag',
        'primevue',
        'primevue/config',
        'primevue/button',
        'primeicons',
        '@vueuse/core',
        '@vueuse/motion',
        'vuetify',
        'vuetify/components',
        'vuetify/labs/VDataTable'
      ],
      exclude: [
        '@apollo/client/react',
        'subscriptions-transport-ws'
      ],
      force: true
    },
  };
});
