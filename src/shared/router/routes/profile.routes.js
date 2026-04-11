// src/router/routes/profile.js
export default [
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/modules/customer/views/Profile.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard/profile',
        name: 'DashboardProfile',
        component: () => import('@/modules/admin/views/users/Profile.vue'),
        meta: {
          requiresAuth: true,
          title: 'الملف الشخصي',
          icon: 'fa-solid fa-user-circle',
        },
      },
      {
        path: '',
        name: 'ProfileOverview',
        component: () => import('@/modules/customer/views/Profile.vue'),
        meta: { title: 'نظرة عامة' },
      },
      {
        path: 'orders',
        name: 'ProfileOrders',
        component: () => import('@/modules/customer/views/Orders.vue'),
        meta: { title: 'طلباتي' },
      },
      {
        path: 'wishlist',
        name: 'ProfileWishlist',
        component: () => import('@/modules/customer/views/Wishlist.vue'),
        meta: { title: 'المفضلة' },
      },
      {
        path: 'settings',
        name: 'ProfileSettings',
        component: () => import('@/modules/customer/views/Settings.vue'),
        meta: { title: 'الإعدادات' },
      },
    ],
  },
];
