export default [
    {
      path: '/admin',
      component: () => import('../pages/admin.page.vue'),
      name: 'admin',
      meta: { showHeader: false }
    },
    {
      path: '/admin/refund',
      component: () => import('../components/admin/sales/refundHistory/refund.admin.history.page.vue'),
      name: 'sales-admin-refund-user',
      meta: { showHeader: false }
    },
    {
      path: '/admin/managment',
      component: () => import('../components/admin/sales/accountManagement/management.admin.account.page.vue'),
      name: 'sales-admin-management-user',
      meta: { showHeader: false }
    }
  ];


  //management.admin.account.page