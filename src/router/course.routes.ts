import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';
import AuthService from '../services/AuthServices';


export default [
    {
      path: '/courses',
      component: () => import('../courses/courses.component.vue'),
      name: 'courses',
      meta: { showHeader: true }
    },
    {
      path: '/courses/:id',
      component: () => import('../courses/courseInfoPage/course.info.page.vue'),
      name: 'courses-description',
      meta: { showHeader: true }
    },
{
  path: '/:googleid/affiliaty/:id',
  name: 'affiliaty',
  component: () => import('../courses/courseInfoPage/course.info.page.vue'),
  beforeEnter: async (
    to: RouteLocationNormalized,
    _from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    const res = await AuthService.getProfile();
    if (res == null) {
      localStorage.setItem('path_referido', to.fullPath);
      next({ name: 'register' });
    } else {
      next();
    }
  },
  meta: { showHeader: true }
}

  ];
  