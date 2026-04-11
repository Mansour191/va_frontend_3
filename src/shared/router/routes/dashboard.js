// Dashboard Routes - Stub file for development
// TODO: Implement actual dashboard routes

const dashboardRoutes = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/modules/admin/views/DashboardHome.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'staff']
    }
  },
  // Add more dashboard routes here
];

export default dashboardRoutes;
