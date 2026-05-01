export default [
    {
      path: '/admin',
      component: () => import('../pages/admin.page.vue'),
      name: 'admin',
      meta: { showHeader: false, noindex: true }
    },
    {
      path: '/admin/refund',
      component: () => import('../components/admin/sales/refundHistory/refund.admin.history.page.vue'),
      name: 'sales-admin-refund-user',
      meta: { showHeader: false, noindex: true }
    },
    {
      path: '/admin/managment',
      component: () => import('../components/admin/sales/accountManagement/management.admin.account.page.vue'),
      name: 'sales-admin-management-user',
      meta: { showHeader: false, noindex: true }
    }
  ];


  //management.admin.account.page
