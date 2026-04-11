// src/router/routes/categories.js

// Dynamic slug-based category route
const dynamicCategoryRoute = {
  path: '/category/:slug',
  name: 'CategoryView',
  component: () => import(/* webpackChunkName: "categories" */ '@/modules/categories/views/CategoryView.vue'),
  meta: {
    title: 'Category',
    icon: 'mdi-folder',
    requiresAuth: false,
  },
  props: true
};

// Legacy static routes for backward compatibility
const legacyCategories = [
  { path: 'furniture', name: 'Furniture', component: 'Furniture', title: 'الأثاث', icon: 'couch' },
  { path: 'doors', name: 'Doors', component: 'Doors', title: 'الأبواب', icon: 'door-open' },
  { path: 'walls', name: 'Walls', component: 'Walls', title: 'الجدران', icon: 'paint-roller' },
  { path: 'ceilings', name: 'Ceilings', component: 'Ceilings', title: 'الأسقف', icon: 'arrow-up' },
  { path: 'tiles', name: 'Tiles', component: 'Tiles', title: 'البلاط', icon: 'border-all' },
  { path: 'kitchens', name: 'Kitchens', component: 'Kitchens', title: 'المطابخ', icon: 'utensils' },
  { path: 'cars', name: 'Cars', component: 'Cars', title: 'السيارات', icon: 'car' },
];

// Create legacy routes with Lazy Loading
const legacyRoutes = legacyCategories.map((cat) => ({
  path: `/${cat.path}`,
  name: cat.name,
  component: () => import(/* webpackChunkName: "categories" */ `@/modules/categories/views/${cat.component}.vue`),
  meta: {
    title: cat.title,
    icon: cat.icon,
    category: cat.path,
    requiresAuth: false,
  },
}));

// Export all routes - dynamic route first for priority
export default [dynamicCategoryRoute, ...legacyRoutes];
