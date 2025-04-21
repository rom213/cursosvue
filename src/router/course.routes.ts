import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router';


export default [
    {
      path: '/courses',
      component: () => import('../courses/courses.component.vue'),
      name: 'courses',
    },
    {
      path: '/courses/:id',
      component: () => import('../courses/courseInfoPage/course.info.page.vue'),
      name: 'courses-description',
    },
{
  path: '/:googleid/affiliaty/:id',
  name: 'affiliaty',
  component: () => import('../courses/courseInfoPage/course.info.page.vue'),
  beforeEnter: (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext
  ) => {
    import('../services/AuthServices').then(({ default: AuthService }) => {
      AuthService.getProfile().then((res) => {
        if (res == null) {
          localStorage.setItem('path_referido', to.fullPath);
          next({ name: 'register' });
        } else {
          next();
        }
      });
    });
  },
}

  ];
  