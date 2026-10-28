/*
 * @@description:碳数据管理
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:46:22
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 10:47:24
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

export const carbonDatasRoutes = [
  {
    path: '/carbonDataManagemen/overview',
    meta: {
      title: I18N.router.carbonNumberDataTube,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('@views/carbonDataManagemen/index')),
    children: [
      {
        path: '/carbonDataManagemen/homePage',
        meta: {
          title: I18N.notOrder.carbonDataManagement,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/home/index')),
      },
      {
        path: '/carbonDataManagemen/overview',
        meta: {
          title: I18N.router.dataBoard,
          icon: 'DashboardOutlined',
        },
        children: [
          {
            path: '/carbonDataManagemen/overview/viewdata',
            meta: {
              title: I18N.router.enterpriseCarbonData,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/carbonDataManagemen/index')),
          },
          {
            path: '/carbonDataManagemen/overview/employeeCarbonData',
            meta: {
              title: I18N.carbonDataManagemen.employeeCarbonData,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/employeeCarbonData'),
            ),
          },
        ],
      },
      {
        path: '/carbonDataManagemen/goalSetting',
        meta: {
          title: I18N.carbonDataManagemen.goalSetting,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
        children: [
          {
            path: '/carbonDataManagemen/goalSetting/add',
            meta: {
              title: I18N.router.newTargetAdded,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
          {
            path: '/carbonDataManagemen/goalSetting/addAllocation',
            meta: {
              title: I18N.carbonDataManagemen.targetAllocation,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
          {
            path: '/carbonDataManagemen/goalSetting/editAllocation',
            meta: {
              title: I18N.router.assignEditor,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
          {
            path: '/carbonDataManagemen/goalSetting/showAllocation',
            meta: {
              title: I18N.router.assignView,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
          {
            path: '/carbonDataManagemen/goalSetting/edit',
            meta: {
              title: I18N.router.editObjective,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
          {
            path: '/carbonDataManagemen/goalSetting/show',
            meta: {
              title: I18N.router.targetDetails,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
        ],
      },
      {
        path: '/carbonDataManagemen/goalObjective',
        meta: {
          title: I18N.carbonDataManagemen.targetExecution,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
        children: [
          {
            path: '/carbonDataManagemen/goalObjective/show',
            meta: {
              title: I18N.router.targetExecutionDetails,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
        ],
      },
      {
        path: '/carbonDataManagemen/dataToSubmit',
        meta: {
          title: I18N.carbonDataManagemen.carbonData,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
        children: [
          {
            path: '/carbonDataManagemen/dataToSubmit/audit',
            meta: {
              title: I18N.router.carbonDataReview,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/submitDetail'),
            ),
          },
          {
            path: '/carbonDataManagemen/dataToSubmit/show',
            meta: {
              title: I18N.router.submitDataForReview,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/submitDetail'),
            ),
          },
          {
            path: '/carbonDataManagemen/dataToSubmit/datashow',
            meta: {
              title: I18N.carbonInternational.associatedTargets,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
        ],
      },
      {
        path: '/carbonDataManagemen/performanceManagement',
        meta: {
          title: I18N.carbonDataManagemen.performanceManagement,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
        children: [
          {
            path: '/carbonDataManagemen/performanceManagement/show',
            meta: {
              title: I18N.router.viewTargetDetails,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonDataManagemen/detail/addActivity'),
            ),
          },
        ],
      },
      {
        path: '/carbonDataManagemen/downLoadManagement',
        meta: {
          title: I18N.carbonFootprint.downloadManagement,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
      },
      {
        path: '/carbonDataManagemen/enterPriceBasicData',
        meta: {
          title: I18N.router.basicNumberOfEnterprises,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonDataManagemen/list')),
        children: [
          {
            path: '/carbonDataManagemen/enterPriceBasicData/baseYearSet',
            meta: {
              title: I18N.carbonDataManagemen.benchmarkYearSetting,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/carbonDataManagemen/list')),
            children: [
              {
                path: '/carbonDataManagemen/enterPriceBasicData/baseYearSet/add',
                meta: {
                  title: I18N.router.newBaseYear,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
              {
                path: '/carbonDataManagemen/enterPriceBasicData/baseYearSet/edit',
                meta: {
                  title: I18N.router.editBaseYear,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
              {
                path: '/carbonDataManagemen/enterPriceBasicData/baseYearSet/show',
                meta: {
                  title: I18N.router.benchmarkYearSetting,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
            ],
          },
          {
            path: '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex',
            meta: {
              title: I18N.carbonDataManagemen.productionAndOperationReferTo,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/carbonDataManagemen/list')),
            children: [
              {
                path: '/carbonDataManagemen/enterPriceBasicData/productionAndOperationIndex/add',
                meta: {
                  title: I18N.router.newProductionExperience,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
            ],
          },
          {
            path: '/carbonDataManagemen/enterPriceBasicData/productionOperationData',
            meta: {
              title: I18N.carbonDataManagemen.productionOperations,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/carbonDataManagemen/list')),
            children: [
              {
                path: '/carbonDataManagemen/enterPriceBasicData/productionOperationData/add',
                meta: {
                  title: I18N.router.newProductionOperations,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
              {
                path: '/carbonDataManagemen/enterPriceBasicData/productionOperationData/edit',
                meta: {
                  title: I18N.router.editProductionOperations,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
              {
                path: '/carbonDataManagemen/enterPriceBasicData/productionOperationData/show',
                meta: {
                  title: I18N.router.viewProductionOperations,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonDataManagemen/detail/enterPriceBasicDataDetail'
                    ),
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
