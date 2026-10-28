/**
 * @description 产品环境足迹路由
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { Routes } from '../config';
import { LCANewRouteMaps } from '../route-paths/carbonFootprintLCAnew';
import { routeTypeNameRender } from '../utils';

export const carbonFootprintLCANewRoute: Routes[] = [
  {
    path: LCANewRouteMaps.lcanew,
    meta: {
      title: () => I18N.router.theProductEnvironmentIsSufficient,
      icon: 'icon-icon_foot2',
    },
    children: [
      {
        path: LCANewRouteMaps.lcaProduction,
        meta: {
          title: () => I18N.carbonFootPrintLCA.productInformationManagement,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCAnew/ProductManagement'),
        ),
        children: [
          {
            path: LCANewRouteMaps.lcaProductionManage,
            meta: {
              title: () => I18N.carbonFootprint.productManagement,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCAnew/ProductManagement/Management'
                ),
            ),
            children: [
              {
                path: LCANewRouteMaps.lcaProductionBomImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.bomImport,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCAnew/ProductManagement/Management/Bom/Import'
                    ),
                ),
              },
              {
                path: LCANewRouteMaps.lcaProductionSupplyImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.supplierData2,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCAnew/ProductManagement/Management/SupplyData/Import'
                    ),
                ),
              },
              {
                path: LCANewRouteMaps.lcaProductionLifeCycleImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.numberOfLifeCycles2,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCAnew/ProductManagement/Management/LifeCycleData/Import'
                    ),
                ),
              },
              {
                path: LCANewRouteMaps.lcaProductionLifeCycleInfo,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.processDetails,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCAnew/ProductManagement/Management/LifeCycleData/Info'
                    ),
                ),
              },
            ],
          },
        ],
      },
      {
        path: LCANewRouteMaps.lcaModel,
        meta: {
          title: () => I18N.carbonFootPrintLCA.carbonFootprintModel,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCAnew/CarbonFootprintModel'),
        ),
        children: [
          {
            path: LCANewRouteMaps.lcaModelInfo,
            meta: {
              title: () =>
                routeTypeNameRender(
                  I18N.carbonFootPrintLCA.carbonFootprintModel,
                ),
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/Info'
                ),
            ),
          },
          {
            path: LCANewRouteMaps.lcaModelInfoImport,
            meta: {
              title: () => I18N.carbonFootprint.import,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/Info/Import'
                ),
            ),
          },
          {
            path: LCANewRouteMaps.lcaModelInfoImportDataSet,
            meta: {
              title: () => I18N.carbonFootprint.import,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/Info/DataSetImport'
                ),
            ),
          },
        ],
      },
      {
        path: LCANewRouteMaps.lcaReport,
        meta: {
          title: () => I18N.carbonFootPrintLCA.carbonFootprintReport,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCAnew/CarbonFootprintReport'),
        ),
      },
      {
        path: LCANewRouteMaps.lcaProcessLibrary,
        meta: {
          title: () => I18N.carbonFootPrintLCA.processLibrary,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCAnew/ProcessesLibrary'),
        ),
        children: [
          {
            path: LCANewRouteMaps.lcaProcessLibraryInfo,
            meta: {
              title: () =>
                routeTypeNameRender(I18N.carbonFootPrintLCA.processLibrary),
            },
            component: lazy(
              () =>
                import('@/views/carbonFootPrintLCAnew/ProcessesLibrary/Info'),
            ),
          },
        ],
      },
    ],
  },
];
