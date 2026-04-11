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
        '@/shared': path.resolve(__dirname, './src/shared'),
        '@/modules': path.resolve(__dirname, './src/modules'),
        '@/composables': path.resolve(__dirname, './src/composables'),
        '@/shared/composables': path.resolve(__dirname, './src/shared/composables'),
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
          ws: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Forward authentication headers
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
              if (req.headers['x-csrftoken']) {
                proxyReq.setHeader('X-CSRFToken', req.headers['x-csrftoken']);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Handle CORS headers
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken';
            });
          }
        },
        '/api': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          ws: true,
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              // Forward authentication headers
              if (req.headers.authorization) {
                proxyReq.setHeader('Authorization', req.headers.authorization);
              }
              if (req.headers['x-csrftoken']) {
                proxyReq.setHeader('X-CSRFToken', req.headers['x-csrftoken']);
              }
              // Handle CSRF cookie
              if (req.cookies && req.cookies.csrftoken) {
                proxyReq.setHeader('X-CSRFToken', req.cookies.csrftoken);
              }
            });
            proxy.on('proxyRes', (proxyRes, req, res) => {
              // Handle CORS headers
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken';
              proxyRes.headers['Access-Control-Allow-Credentials'] = 'true';
            });
          }
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
        '@vueuse/core',
        '@vueuse/motion',
        'vuetify',
        'vuetify/components'
      ],
      exclude: [
        '@apollo/client/react',
        'subscriptions-transport-ws'
      ]
    },
  };
});
