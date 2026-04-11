// src/router/routes/customer.js
// Customer-specific routes including profile
export default [
  {
    path: '/profile',
    name: 'CustomerProfile',
    component: () => import('@/modules/customer/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: 'الملف الشخصي',
      icon: 'fa-solid fa-user-circle',
    },
  },
  {
    path: '/profile/orders',
    name: 'CustomerOrders',
    component: () => import('@/modules/customer/views/Orders.vue'),
    meta: {
      requiresAuth: true,
      title: 'طلباتي',
      icon: 'fa-solid fa-shopping-bag',
    },
  },
  {
    path: '/profile/wishlist',
    name: 'CustomerWishlist',
    component: () => import('@/modules/customer/views/Wishlist.vue'),
    meta: {
      requiresAuth: true,
      title: 'المفضلة',
      icon: 'fa-solid fa-heart',
    },
  },
  {
    path: '/profile/settings',
    name: 'CustomerSettings',
    component: () => import('@/modules/customer/views/Settings.vue'),
    meta: {
      requiresAuth: true,
      title: 'الإعدادات',
      icon: 'fa-solid fa-cog',
    },
  },
  {
    path: '/profile/addresses',
    name: 'CustomerAddresses',
    component: () => import('@/modules/customer/views/Addresses.vue'),
    meta: {
      requiresAuth: true,
      title: 'العناوين',
      icon: 'fa-solid fa-map-marker-alt',
    },
  },
  {
    path: '/profile/payments',
    name: 'CustomerPayments',
    component: () => import('@/modules/customer/views/Payments.vue'),
    meta: {
      requiresAuth: true,
      title: 'طرق الدفع',
      icon: 'fa-solid fa-credit-card',
    },
  },
  {
    path: '/profile/notifications',
    name: 'CustomerNotifications',
    component: () => import('@/modules/customer/views/Notifications.vue'),
    meta: {
      requiresAuth: true,
      title: 'الإشعارات',
      icon: 'fa-solid fa-bell',
    },
  },
];
