// src/router/routes/index.js

import PublicRoutes from './public.routes';
import DashboardRoutes from './dashboard';
import AuthRoutes from './auth.routes';
import CategoryRoutes from './categories.routes';
import InvestorRoutes from './investor.routes';
import CustomerRoutes from './customer.routes';

// دمج جميع المسارات
const routes = [
  ...PublicRoutes,
  ...AuthRoutes,
  ...DashboardRoutes,
  ...CategoryRoutes,
  ...InvestorRoutes,
  ...CustomerRoutes
];

console.log('📊 المسارات المحملة:', routes);

export default routes;
