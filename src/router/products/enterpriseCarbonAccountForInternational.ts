/*
 * @@description:碳核算通用版 国际版
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 11:02:35
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 11:03:38
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';
import { RouteMaps } from '../route-paths';

export const enterpriseCarbonAccountForInternationalRoutes = [
  {
    path: RouteMaps.internationalHome,
    meta: {
      title: I18N.router.carbonAccountingUniversal,
    },
    component: lazy(() => import('@views/carbonInternational/homePage')),
    children: [
      {
        path: RouteMaps.internationalHome,
        meta: {
          title: I18N.carbonFootprint.dataOverview,
        },
        component: lazy(() => import('@views/carbonInternational/homePage')),
      },
      {
        path: RouteMaps.internationalCarbonManagement,
        meta: {
          title: I18N.carbonInternational.reportSubjectManagement2,
        },
        component: lazy(
          () => import('@views/carbonInternational/carbonManagement'),
        ),
        children: [
          {
            path: RouteMaps.internationaloperationManagement,
            meta: {
              title: I18N.carbonNeutral.addReportMaster,
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonInternational/carbonManagement/operationManagement'
                ),
            ),
          },
          {
            path: RouteMaps.internationaloperationManagementShow,
            meta: {
              title: I18N.router.viewReportMaster,
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonInternational/carbonManagement/operationManagement'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.internationalOrganizationalManagement,
        meta: {
          title: I18N.DomesticVersion.carbonEmissionInformation2,
        },
        children: [
          {
            path: RouteMaps.internationalManageGHGOrISO,
            meta: {
              title: I18N.router.ghgPr,
            },
            component: lazy(
              () =>
                import('@views/carbonInternational/organizationalManagement'),
            ),
          },
          {
            path: RouteMaps.internationaladdCarbonReport,
            meta: {
              title: I18N.router.newEmissionSignal,
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonInternational/organizationalManagement/addCarbonReport'
                ),
            ),
          },
          {
            path: RouteMaps.internationalAddEmissions,
            meta: {
              title: I18N.carbonInternational.newEmissions,
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonInternational/organizationalManagement/addEmissionData'
                ),
            ),
          },
        ],
      },
    ],
  },
];
