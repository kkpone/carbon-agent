import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { RouteMaps } from '../route-paths';

export const CCDBRoutes = [
  {
    path: RouteMaps.CCDB,
    meta: {
      title: I18N.router.certificationServices,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('@views/CCDB/Home')),
    children: [
      {
        path: RouteMaps.CCDBHome,
        component: lazy(() => import('@views/CCDB/Home')),
        meta: {
          title: I18N.router.homePage,
        },
      },
      {
        path: RouteMaps.CCDBSearch,
        component: lazy(() => import('@/views/CCDB/Search')),
        meta: {
          title: I18N.router.homePage,
        },
      },
      {
        path: RouteMaps.CCDBCollect,
        component: lazy(() => import('@views/CCDB/Collect')),
        meta: {
          title: I18N.router.homePage,
        },
      },
    ],
  },
];
