// src/router/routes/dashboard.js

// مسارات لوحة التحكم
export default [
  {
    path: '/dashboard',
    component: () =>
      import(
        /* webpackChunkName: "dashboard" */ '@/modules/admin/layouts/DashboardLayout.vue'
      ),
    meta: {
      requiresAuth: true,
      requiresStaff: true,
      role: 'admin',
      title: 'لوحة التحكم',
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/modules/admin/views/DashboardHome.vue'),
        meta: {
          title: 'نظرة عامة',
          icon: 'fa-solid fa-chart-line',
        },
      },
      {
        path: 'products',
        name: 'DashboardProducts',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-products" */ '@/modules/admin/views/products/ProductsManager.vue'
          ),
        meta: {
          title: 'المنتجات',
          icon: 'fa-solid fa-box',
        },
      },
      {
        path: 'orders',
        name: 'DashboardOrders',
        component: () =>
          import(/* webpackChunkName: "dashboard-orders" */ '@/modules/admin/views/orders/OrdersManager.vue'),
        meta: {
          title: 'الطلبات',
          icon: 'fa-solid fa-shopping-cart',
        },
      },
      {
        path: 'users',
        name: 'DashboardUsers',
        component: () =>
          import(/* webpackChunkName: "dashboard-admin" */ '@/modules/admin/views/users/UsersManager.vue'),
        meta: {
          title: 'المستخدمين',
          icon: 'fa-solid fa-users',
        },
      },
      {
        path: 'designs',
        name: 'DashboardDesigns',
        component: () =>
          import(/* webpackChunkName: "dashboard-products" */ '@/modules/admin/views/designs/DesignsManager.vue'),
        meta: {
          title: 'التصاميم',
          icon: 'fa-solid fa-paint-brush',
        },
      },
      {
        path: 'navigation',
        name: 'NavigationPage',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/modules/admin/views/NavigationPage.vue'),
        meta: {
          title: 'خريطة الموقع',
          icon: 'fa-solid fa-compass',
        },
      },
      {
        path: 'settings',
        name: 'DashboardSettings',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-admin" */ '@/modules/admin/views/settings/SettingsManager.vue'
          ),
        meta: {
          title: 'الإعدادات',
          icon: 'fa-solid fa-cog',
        },
      },
      {
        path: 'profile',
        name: 'DashboardProfile',
        component: () => import(/* webpackChunkName: "dashboard" */ '@/modules/admin/views/users/Profile.vue'),
        meta: {
          title: 'الملف الشخصي',
          icon: 'fa-solid fa-user-circle',
        },
      },
      {
        path: 'integration',
        name: 'IntegrationDashboard',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-integration" */ '@/modules/admin/views/integration/IntegrationDashboard.vue'
          ),
        meta: {
          title: 'لوحة التكامل',
          icon: 'fa-solid fa-plug',
        },
      },
      {
        path: 'integration/settings',
        name: 'ERPNextSettings',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-integration" */ '@/modules/admin/views/integration/ERPNextSettings.vue'
          ),
        meta: {
          title: 'إعدادات ERPNext',
          icon: 'fa-solid fa-cog',
        },
      },
      {
        path: 'reports',
        name: 'UnifiedReports',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/reports/UnifiedReports.vue'
          ),
        meta: {
          title: 'التقارير الموحدة',
          icon: 'fa-solid fa-chart-pie',
        },
      },
      {
        path: 'analytics',
        name: 'AdvancedAnalytics',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/views/dashboard/analytics/AdvancedAnalytics.vue'
          ),
        meta: {
          title: 'التحليلات المتقدمة',
          icon: 'fa-solid fa-chart-line',
        },
      },
      {
        path: 'alerts',
        name: 'AlertsCenter',
        component: () =>
          import(/* webpackChunkName: "dashboard" */ '@/modules/admin/views/admin/AlertsCenter.vue'),
        meta: {
          title: 'مركز التنبيهات',
          icon: 'fa-solid fa-bell',
        },
      },
      {
        path: 'automation',
        name: 'AutomationRules',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-admin" */ '@/modules/admin/views/admin/AutomationRules.vue'
          ),
        meta: {
          title: 'قواعد الأتمتة',
          icon: 'fa-solid fa-robot',
        },
      },
      {
        path: 'forecasting',
        name: 'forecasting',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/forecasting/ForecastDashboard.vue'
          ),
        meta: {
          title: 'توقعات المبيعات',
          icon: 'fa-solid fa-chart-line',
          requiresAuth: true,
          permission: 'view_forecast',
        },
      },
      {
        path: 'forecasting/details',
        name: 'ForecastDetails',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-forecasting" */ '@/modules/admin/views/forecasting/components/ForecastDetails.vue'
          ),
        meta: {
          title: 'تفاصيل التوقعات',
          icon: 'fa-solid fa-chart-line-variant',
          requiresAuth: true,
          permission: 'view_forecast',
        },
      },
      {
        path: 'recommendations',
        name: 'recommendations',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/analytics/RecommendationsDashboard.vue'
          ),
        meta: {
          title: 'توصيات ذكية',
          icon: 'fa-solid fa-star',
          requiresAuth: true,
        },
      },
      {
        path: 'customerinsights',
        name: 'customerinsights',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/analytics/CustomerInsights.vue'
          ),
        meta: {
          title: 'تحليل سلوك العملاء',
          icon: 'fa-solid fa-users',
          requiresAuth: true,
        },
      },
      // AI and Pricing Routes
      {
        path: 'ai',
        name: 'AIDashboard',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-ai" */ '@/modules/admin/views/ai/AIDashboard.vue'
          ),
        meta: {
          title: 'لوحة الذكاء الاصطناعي',
          icon: 'fa-solid fa-brain',
        },
      },
      {
        path: 'ai/training',
        name: 'AITraining',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-ai" */ '@/modules/admin/views/ai/AITraining.vue'
          ),
        meta: {
          title: 'تدريب الذكاء الاصطناعي',
          icon: 'fa-solid fa-graduation-cap',
        },
      },
      {
        path: 'ai/monitor',
        name: 'AIMonitor',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-ai" */ '@/modules/admin/views/ai/AIMonitor.vue'
          ),
        meta: {
          title: 'مراقبة الذكاء الاصطناعي',
          icon: 'fa-solid fa-heartbeat',
        },
      },
      {
        path: 'pricing',
        name: 'PricingManager',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-pricing" */ '@/modules/admin/views/pricing/PricingManager.vue'
          ),
        meta: {
          title: 'إدارة التسعير',
          icon: 'fa-solid fa-chart-line',
        },
      },
      {
        path: 'pricing/analytics',
        name: 'PricingAnalytics',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-pricing" */ '@/modules/admin/views/pricing/PricingAnalytics.vue'
          ),
        meta: {
          title: 'تحليلات التسعير',
          icon: 'fa-solid fa-chart-bar',
        },
      },
      {
        path: 'pricing/rules',
        name: 'PricingRules',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-pricing" */ '@/modules/admin/views/pricing/PricingRules.vue'
          ),
        meta: {
          title: 'قواعد التسعير',
          icon: 'fa-solid fa-cogs',
        },
      },
      {
        path: 'analytics-duplicate',
        name: 'AdvancedAnalyticsDuplicate',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/analytics/AdvancedAnalytics.vue'
          ),
        meta: {
          title: 'التحليلات المتقدمة (نسخة)',
          icon: 'fa-solid fa-chart-line',
        },
      },
      // Shop Routes
      {
        path: 'shop',
        name: 'ShopManager',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-shop" */ '@/modules/admin/views/shop/ShopManager.vue'
          ),
        meta: {
          title: 'إدارة المتجر',
          icon: 'fa-solid fa-store',
        },
      },
      {
        path: 'cart',
        name: 'CartManagement',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-shop" */ '@/modules/admin/views/shop/CartManager.vue'
          ),
        meta: {
          title: 'إدارة السلة',
          icon: 'fa-solid fa-shopping-cart',
        },
      },
      // Customer Routes
      {
        path: 'customers',
        name: 'CustomerManagement',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-customers" */ '@/modules/admin/views/customers/CustomerManager.vue'
          ),
        meta: {
          title: 'إدارة العملاء',
          icon: 'fa-solid fa-users',
        },
      },
      {
        path: 'reviews',
        name: 'ReviewsManagement',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-customers" */ '@/modules/admin/views/customers/ReviewsManager.vue'
          ),
        meta: {
          title: 'إدارة المراجعات',
          icon: 'fa-solid fa-star',
        },
      },
      // Content Routes
      {
        path: 'content',
        name: 'ContentManager',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-content" */ '@/modules/admin/views/content/ContentManager.vue'
          ),
        meta: {
          title: 'إدارة المحتوى',
          icon: 'fa-solid fa-file-alt',
        },
      },
      {
        path: 'blog',
        name: 'BlogManager',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-content" */ '@/modules/admin/views/content/BlogManager.vue'
          ),
        meta: {
          title: 'إدارة المدونة',
          icon: 'fa-solid fa-blog',
        },
      },
      {
        path: 'media',
        name: 'MediaManager',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-content" */ '@/modules/admin/views/content/MediaManager.vue'
          ),
        meta: {
          title: 'إدارة الوسائط',
          icon: 'fa-solid fa-images',
        },
      },
      // Security Routes
      {
        path: 'security',
        name: 'SecuritySettings',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-settings" */ '@/modules/admin/views/settings/SecuritySettings.vue'
          ),
        meta: {
          title: 'إعدادات الأمان',
          icon: 'fa-solid fa-shield-alt',
        },
      },
      // Analytics Sub-routes
      {
        path: 'analytics/sales',
        name: 'SalesAnalytics',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/analytics/SalesAnalytics.vue'
          ),
        meta: {
          title: 'تحليلات المبيعات',
          icon: 'fa-solid fa-chart-line',
        },
      },
      {
        path: 'analytics/customers',
        name: 'CustomerAnalytics',
        component: () =>
          import(
            /* webpackChunkName: "dashboard-analytics" */ '@/modules/admin/views/analytics/CustomerAnalytics.vue'
          ),
        meta: {
          title: 'تحليلات العملاء',
          icon: 'fa-solid fa-users',
        },
      },
    ],
  },
  // مسارات الاختبار والتشخيص
  {
    path: '/test',
    component: () => import(/* webpackChunkName: "test" */ '@/modules/admin/layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true, isAdmin: true },
    children: [
      {
        path: 'erpnext',
        name: 'ERPNextTest',
        component: () => import(/* webpackChunkName: "test" */ '@/test/ERPNextTest.vue'),
        meta: { title: 'اختبار ERPNext' }
      },
      {
        path: 'sync-products',
        name: 'ProductSyncTest',
        component: () => import(/* webpackChunkName: "test" */ '@/test/ProductSyncTest.vue'),
        meta: { title: 'مزامنة المنتجات' }
      },
      {
        path: 'sync-orders',
        name: 'OrderSyncTest',
        component: () => import(/* webpackChunkName: "test" */ '@/test/OrderSyncTest.vue'),
        meta: { title: 'مزامنة الطلبات' }
      },
      {
        path: 'notifications',
        name: 'NotificationsTest',
        component: () => import(/* webpackChunkName: "test" */ '@/test/Notifications.vue'),
        meta: { title: 'اختبار الإشعارات' }
      }
    ]
  }
];
