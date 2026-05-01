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
      meta: { showHeader: true, noindex: true }
    },
    {
      path: '/mis-courses',
      name: 'mycourses',
      component: () => import('../components/auth/my.courses.page.vue'),
      meta: { showHeader: true, noindex: true }
    },
    {
      path: '/monetizar',
      component: () => import('../monetizar/MonetizarLayout.vue'),
      meta: { showHeader: true },
      children: [
        {
          path: '',
          name: 'monetizar',
          component: () => import('../monetizar/monetizar.page.vue'),
        },
        {
          path: 'catalogo',
          name: 'monetizar-catalogo',
          component: () => import('../monetizar/MonetizarCatalogo.vue'),
        },
        {
          path: 'configuracion',
          name: 'monetizar-configuracion',
          component: () => import('../monetizar/configuracion/MonetizarConfiguracion.vue'),
          meta: { noindex: true },
        },
        {
          path: 'mis-ventas',
          component: () => import('../monetizar/mis-ventas/MonetizarMisVentas.vue'),
          meta: { noindex: true },
          children: [
            {
              path: '',
              name: 'monetizar-mis-ventas',
              component: () => import('../monetizar/mis-ventas/MonetizarMisVentas.vue'),
              meta: { noindex: true },
            },
            {
              path: 'resumen',
              name: 'monetizar-mis-ventas-resumen',
              component: () => import('../monetizar/mis-ventas/MonetizarMisVentasResumen.vue'),
              meta: { noindex: true },
            },
            {
              path: 'graficos',
              name: 'monetizar-mis-ventas-graficos',
              component: () => import('../monetizar/mis-ventas/MonetizarMisVentasGraficos.vue'),
              meta: { noindex: true },
            },
            {
              path: 'historial',
              name: 'monetizar-mis-ventas-historial',
              component: () => import('../monetizar/mis-ventas/MonetizarMisVentasHistorial.vue'),
              meta: { noindex: true },
            },
          ],
        },
      ],
    },
    {
      path: '/terminos-y-condiciones',
      name: 'terminos',
      component: () => import('../pages/TerminosCondiciones.vue'),
      meta: { showHeader: true }
    },
    {
      path: '/politica-de-privacidad',
      name: 'privacidad',
      component: () => import('../pages/PoliticaPrivacidad.vue'),
      meta: { showHeader: true }
    },
    {
      path: '/payment-response',
      name: 'payment-response',
      component: () => import('../pages/PaymentSuccess.vue'),
      meta: { showHeader: true, noindex: true }
    },
    {
      path: '/:pathMach(.*)*',
      name: 'not-found',
      component: () => import('../components/notfound.vue'),
      meta: { showHeader: true, noindex: true }
    },
  ];
  
