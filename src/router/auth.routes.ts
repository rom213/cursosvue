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

      {
        path: '/config/sales',
        component: () => import('../components/auth/sales/sales.page.vue'),
        name: 'sales-user',
      },
      {
        path: '/config/sales/managenent',
        component: () => import('../components/auth/sales/accountManagement/management.account.page.vue'),
        name: 'sales-management-user',
      },
      {
        path: '/config/sales/refund',
        component: () => import('../components/auth/sales/refundHistory/refund.history.page.vue'),
        name: 'sales-refund-user',
      },
      {
        path: '/config/sales/detail',
        component: () => import('../components/auth/sales/salesHistory/sail.history.page.vue'),
        name: 'sales-detail-user',
      }
  ];
  