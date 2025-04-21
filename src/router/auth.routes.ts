export default [
    {
      path: '/login',
      component: () => import('../components/auth/login.component.vue'),
      name: 'login',
    },
    {
      path: '/register',
      component: () => import('../components/auth/register.component.vue'),
      name: 'register',
    },
    {
        path: '/config',
        component: () => import('../components/auth/account/my.account.page.vue'),
        name: 'config',
      },
      {
        path: '/config/user',
        component: () => import('../components/auth/account/config.user.page.vue'),
        name: 'config-user',
      },
  ];
  