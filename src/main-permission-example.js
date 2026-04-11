import { createApp } from 'vue';
import App from './App.vue';
import { PermissionPlugin } from '@/shared/directives/permissionDirective';

// Import global styles
import '@/shared/styles/permissions.css';

const app = createApp(App);

// Install permission plugin globally
app.use(PermissionPlugin);

// Other plugins...
// app.use(router);
// app.use(store);
// app.use(vuetify);

app.mount('#app');
