import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';
import adminRoutes from './admin.routes';
import { registerSeoGuards } from './seo';

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

export default router;
