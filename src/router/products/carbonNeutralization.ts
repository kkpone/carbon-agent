/*
 * @@description:碳中和
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:48:50
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 10:49:44
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

export const carbonNeutralizationRoutes = [
  {
    path: '/carbonNeutral/overview',
    meta: {
      title: I18N.router.carbonNeutrality,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('@views/carbonNeutral/index')),
    children: [
      {
        path: '/carbonNeutral/overview',
        meta: {
          title: I18N.router.overview,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonNeutral/index')),
        children: [
          {
            path: '/carbonNeutral/service',
            meta: {
              title: I18N.router.purchasingServices,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonNeutral/activityManage/addActivity'),
            ),
            children: [
              {
                path: '/carbonNeutral/service/confimOrder',
                meta: {
                  title: I18N.carbonNeutral.confirmOrder,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import('@views/carbonNeutral/activityManage/addActivity'),
                ),
              },
            ],
          },
          {
            path: '/carbonNeutral/records',
            meta: {
              title: I18N.carbonNeutral.purchaseRecords,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/carbonNeutral/list')),
          },
          {
            path: '/carbonNeutral/orderList',
            meta: {
              title: I18N.carbonNeutral.carbonNeutralityOrders,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonNeutral/orderList/list'),
            ),
            children: [
              {
                path: '/carbonNeutral/orderList/detail',
                meta: {
                  title: I18N.carbonNeutral.confirmOrder,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/carbonNeutral/orderList/detail'),
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
