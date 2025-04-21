import { createRouter, createWebHistory } from 'vue-router';

import publicRoutes from './public.routes';
import authRoutes from './auth.routes';
import courseRoutes from './course.routes';

const routes = [
  ...publicRoutes,
  ...authRoutes,
  ...courseRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
