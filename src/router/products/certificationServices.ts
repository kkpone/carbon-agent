/*
 * @@description:认证服务
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:54:19
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 10:55:31
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { RouteMaps } from '../route-paths';

export const certificationServicesRoutes = [
  {
    path: RouteMaps.Certification,
    meta: {
      title: I18N.router.verificationAndCertificationServices,
      icon: 'icon-icon_foot2',
    },
    component: lazy(() => import('@views/Certification/Enterprise/index')),
    children: [
      {
        path: RouteMaps.CertificationEnterprise,
        meta: {
          title: I18N.Certification.enterpriseCarbonVerification,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/Certification/Product/index')),
        children: [
          {
            path: RouteMaps.CertificationEnterpriseIndex,
            meta: {
              title: I18N.Certification.enterpriseCarbonVerification,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/Certification/Product/index')),
            children: [
              {
                path: RouteMaps.CertificationEnterpriseApply,
                meta: {
                  title: I18N.router.initiateApplication,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
            ],
          },

          {
            path: RouteMaps.CertificationEnterpriseProduct,
            meta: {
              title: I18N.router.enterpriseCarbonVerification4,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/Certification/Enterprise/product'),
            ),
            children: [
              {
                path: RouteMaps.CertificationEnterpriseproductApply,
                meta: {
                  title: I18N.router.initiateApplication,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
              {
                path: RouteMaps.CertificationEnterpriseProductDetail,
                meta: {
                  title: I18N.router.enterpriseCarbonVerification3,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
              {
                path: RouteMaps.CertificationEnterpriseProductSubmit,
                meta: {
                  title: I18N.router.enterpriseCarbonVerification2,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
              {
                path: RouteMaps.CertificationEnterpriseEditApply,
                meta: {
                  title: I18N.router.enterpriseCarbonVerification,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
              {
                path: RouteMaps.CertificationEnterpriseproductedit,
                meta: {
                  title: I18N.Certification.modifyMaterials,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
            ],
          },
        ],
      },
      {
        path: RouteMaps.CertificationProduct,
        meta: {
          title: I18N.Certification.carbonFootprintVerification,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/Certification/Product/index')),
        children: [
          {
            path: RouteMaps.CertificationProductIndex,
            meta: {
              title: I18N.Certification.carbonFootprintVerification,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('@views/Certification/HomePage')),

            children: [
              {
                path: RouteMaps.CertificationProductApply,
                meta: {
                  title: I18N.router.initiateApplication,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
            ],
          },
          {
            path: RouteMaps.CertificationProductProduct,
            meta: {
              title: I18N.router.carbonFootprintVerification4,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/Certification/Product/product'),
            ),
            children: [
              {
                path: RouteMaps.CertificationProductProductDetail,
                meta: {
                  title: I18N.router.carbonFootprintVerification4,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
              {
                path: RouteMaps.CertificationProductProductDetailSubmit,
                meta: {
                  title: I18N.router.carbonFootprintVerification3,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
              {
                path: RouteMaps.CertificationProductProductDetailEdit,
                meta: {
                  title: I18N.router.carbonFootprintVerification2,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/ProjectDetails/index'),
                ),
              },
              {
                path: RouteMaps.CertificationProductproductEditApply,
                meta: {
                  title: I18N.router.carbonFootprintVerification,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
              {
                path: RouteMaps.CertificationProductproductApply,
                meta: {
                  title: I18N.router.initiateApplication,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () => import('@views/Certification/apply/index'),
                ),
              },
            ],
          },
        ],
      },

      {
        path: RouteMaps.CarbonFootprintCertificationProject,
        meta: {
          title: () => I18N.Certification.carbonFootprintCertification2,
          icon: 'DashboardOutlined',
        },
        component: lazy(
          () =>
            import(
              '@views/Certification/carbonFootprintCertification/certificationProject/index'
            ),
        ),
        children: [
          {
            path: RouteMaps.CarbonFootprintCertificationProjectApplay,
            meta: {
              title: () => {
                const search = new URLSearchParams(window.location.search);
                const titleMap = {
                  edit: I18N.router.editingCertificationApplication,
                  show: I18N.router.certificationAndReview,
                  add: I18N.Certification.initiateCertificationApplication,
                };
                return titleMap[search?.get('pageType') as string];
              },
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import(
                  '@views/Certification/carbonFootprintCertification/certificationProject/applyPage/index'
                ),
            ),
          },
        ],
      },
    ],
  },
];
