// src/router/routes/investor.js

export default [
  {
    path: '/investor',
    component: () => import(/* webpackChunkName: "investor" */ '@/modules/investor/layouts/InvestorLayout.vue'),
    meta: {
      requiresAuth: true,
      role: 'investor',
      title: 'ركن الممولين',
    },
    children: [
      {
        path: '',
        name: 'InvestorHub',
        component: () => import(/* webpackChunkName: "investor" */ '@/modules/investor/views/InvestorHub.vue'),
        meta: {
          title: 'لوحة المؤشرات',
          icon: 'fa-solid fa-chart-line',
          role: 'investor',
        },
      },
      {
        path: 'ai-insights',
        name: 'AIInsights',
        component: () => import(/* webpackChunkName: "investor" */ '@/modules/investor/views/AIInsights.vue'),
        meta: {
          title: 'تحليلات الذكاء الاصطناعي',
          icon: 'fa-solid fa-brain',
          role: 'investor',
        },
      },
      {
        path: 'voting',
        name: 'CreativeVoting',
        component: () => import(/* webpackChunkName: "investor" */ '@/modules/investor/views/CreativeVoting.vue'),
        meta: {
          title: 'التصويت الإبداعي',
          icon: 'fa-solid fa-vote-yea',
          role: 'investor',
        },
      },
      {
        path: 'reports',
        name: 'InvestorReports',
        component: () => import(/* webpackChunkName: "investor" */ '@/modules/admin/views/reports/UnifiedReports.vue'),
        meta: {
          title: 'التقارير المالية',
          icon: 'fa-solid fa-file-invoice-dollar',
          role: 'investor',
        },
      }
    ]
  }
];
