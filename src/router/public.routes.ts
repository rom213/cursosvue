export default [
    {
      path: '/',
      component: () => import('../home/home.component.vue'),
      name: 'home',
      meta: { showHeader: true }
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../cart/cart.page.vue'),
      meta: { showHeader: true }
    },
    {
      path: '/mis-courses',
      name: 'mycourses',
      component: () => import('../components/auth/my.courses.page.vue'),
      meta: { showHeader: true }
    },
    {
      path: '/monetizar',
      name: 'monetizar',
      component: () => import('../monetizar/monetizar.page.vue'),
      meta: { showHeader: true }
    },
    {
      path: '/:pathMach(.*)*',
      component: () => import('../components/notfound.vue'),
      meta: { showHeader: true }
    },
  ];
  