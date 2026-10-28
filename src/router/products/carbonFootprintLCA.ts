/**
 * @description 产品环境足迹路由
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { Routes } from '../config';
import { LCARouteMaps } from '../route-paths/carbonFootprintLCA';
import { routeTypeNameRender } from '../utils';

export const carbonFootprintLCARoute: Routes[] = [
  {
    path: LCARouteMaps.lca,
    meta: {
      title: () => I18N.router.theProductEnvironmentIsSufficient,
      icon: 'icon-icon_foot2',
    },
    children: [
      {
        path: LCARouteMaps.lcaProduction,
        meta: {
          title: () => I18N.carbonFootPrintLCA.productInformationManagement,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCA/ProductManagement'),
        ),
        children: [
          {
            path: LCARouteMaps.lcaProductionManage,
            meta: {
              title: () => I18N.carbonFootprint.productManagement,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCA/ProductManagement/Management'
                ),
            ),
            children: [
              {
                path: LCARouteMaps.lcaProductionBomImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.bomImport,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCA/ProductManagement/Management/Bom/Import'
                    ),
                ),
              },
              {
                path: LCARouteMaps.lcaProductionSupplyImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.supplierData2,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCA/ProductManagement/Management/SupplyData/Import'
                    ),
                ),
              },
              {
                path: LCARouteMaps.lcaProductionLifeCycleImport,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.numberOfLifeCycles2,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCA/ProductManagement/Management/LifeCycleData/Import'
                    ),
                ),
              },
              {
                path: LCARouteMaps.lcaProductionLifeCycleInfo,
                meta: {
                  title: () => I18N.carbonFootPrintLCA.processDetails,
                },
                component: lazy(
                  () =>
                    import(
                      '@/views/carbonFootPrintLCA/ProductManagement/Management/LifeCycleData/Info'
                    ),
                ),
              },
            ],
          },
        ],
      },
      {
        path: LCARouteMaps.lcaModel,
        meta: {
          title: () => I18N.carbonFootPrintLCA.carbonFootprintModel,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCA/CarbonFootprintModel'),
        ),
        children: [
          {
            path: LCARouteMaps.lcaModelInfo,
            meta: {
              title: () =>
                routeTypeNameRender(
                  I18N.carbonFootPrintLCA.carbonFootprintModel,
                ),
            },
            component: lazy(
              () =>
                import('@/views/carbonFootPrintLCA/CarbonFootprintModel/Info'),
            ),
          },
          {
            path: LCARouteMaps.lcaModelInfoImport,
            meta: {
              title: () => I18N.carbonFootprint.import,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCA/CarbonFootprintModel/Info/Import'
                ),
            ),
          },
          {
            path: LCARouteMaps.lcaModelInfoImportDataSet,
            meta: {
              title: () => I18N.carbonFootprint.import,
            },
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootPrintLCA/CarbonFootprintModel/Info/DataSetImport'
                ),
            ),
          },
        ],
      },
      {
        path: LCARouteMaps.lcaReport,
        meta: {
          title: () => I18N.carbonFootPrintLCA.carbonFootprintReport,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCA/CarbonFootprintReport'),
        ),
      },
      {
        path: LCARouteMaps.lcaProcessLibrary,
        meta: {
          title: () => I18N.carbonFootPrintLCA.processLibrary,
        },
        component: lazy(
          () => import('@/views/carbonFootPrintLCA/ProcessesLibrary'),
        ),
        children: [
          {
            path: LCARouteMaps.lcaProcessLibraryInfo,
            meta: {
              title: () =>
                routeTypeNameRender(I18N.carbonFootPrintLCA.processLibrary),
            },
            component: lazy(
              () => import('@/views/carbonFootPrintLCA/ProcessesLibrary/Info'),
            ),
          },
        ],
      },
    ],
  },
];
