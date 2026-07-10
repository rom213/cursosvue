import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import adminRoutes from './admin.routes';
import { registerSeoGuards } from './seo';
import { registerTrackingGuards } from './tracking';
import { registerClickTracking } from './clickTracking';

const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...courseRoutes,
  ...adminRoutes
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

registerSeoGuards(router);
registerTrackingGuards(router);
registerClickTracking(router);

export default router;
