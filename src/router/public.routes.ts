export default [
    {
      path: '/',
      component: () => import('../home/home.component.vue'),
      name: 'home',
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('../cart/cart.page.vue'),
    },
    {
      path: '/mis-courses',
      name: 'mycourses',
      component: () => import('../components/auth/my.courses.page.vue'),
    },
    {
      path: '/:pathMach(.*)*',
      component: () => import('../components/notfound.vue'),
    },
  ];
  