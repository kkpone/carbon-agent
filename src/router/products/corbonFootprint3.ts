/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-19 17:30:18
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-26 14:55:33
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 18:47:30
 * @Date: 2022-12-23 10:54:40
 * @@description:
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { routeTypeNameRender } from '../Uutils';
import { RouteMapsCorbonFootprint3 } from '../route-paths/corbonFootprint3';

/** 产品碳足迹 3.0 */
export const carbonFootprint3 = [
  {
    path: RouteMapsCorbonFootprint3.carbonFootprint3Index,
    meta: {
      title: I18N.router.carbonFootprintVerification5,
    },
    component: lazy(() => import('@views/carbonFootprint3/index')),
    children: [
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3Index,
        component: lazy(() => import('@views/carbonFootprint3/index/index')),
        meta: {
          title: I18N.router.homePage,
        },
      },

      /** 碳标签 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabel,
        component: lazy(
          () => import('@src/views/carbonFootprint3/CarbonLabel'),
        ),
        meta: {
          title: () => I18N.carbonFootprint3.carbonLabel,
        },
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabelAdd,
            component: lazy(
              () =>
                import('@src/views/carbonFootprint3/CarbonLabel/AddOrDetail'),
            ),
            meta: {
              title: () => I18N.carbonFootprint3.applyForCarbonLabels,
            },
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3CarbonLabelDetail,
            component: lazy(
              () =>
                import('@src/views/carbonFootprint3/CarbonLabel/AddOrDetail'),
            ),
            meta: {
              title: () => I18N.router.carbonLabelDetails,
            },
          },
        ],
      },

      /** 产品碳足迹核算 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount,
        component: lazy(
          () => import('@src/views/carbonFootprint3/FootprintAccount'),
        ),
        meta: {
          title: () => I18N.carbonFootprint.carbonFootprintAccounting,
        },
        children: [
          {
            id: 'carbonFootprint3FootprintAccountShare',
            path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShare,
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/FootprintAccount/ShareAccountDetail'
                ),
            ),
            meta: {
              title: I18N.router.carbonFootprintSharing2,
            },
          },
          {
            id: 'carbonFootprint3FootprintAccountShareBossModel',
            path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareBossModel,
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/FootprintAccount/ShareAccountDetailBossModel'
                ),
            ),
            meta: {
              title: () => I18N.router.carbonFootprintDetails,
            },
          },

          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountShareLogin,
            id: 'carbonFootprint3FootprintAccountShareLogin',
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/FootprintAccount/ShareAccountLogin'
                ),
            ),
            meta: {
              title: I18N.router.carbonFootprintSharing,
            },
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail,
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/FootprintAccount/ProductDetail'
                ),
            ),
            meta: {
              title: () => I18N.router.carbonFootprintDetails,
            },
          },
          {
            id: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
            path: RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
            component: lazy(
              () =>
                import(
                  '@src/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo'
                ),
            ),
            meta: {
              title: I18N.carbonFootprint.carbonFootprintAccounting,
            },
          },
        ],
      },

      // FootprintAccountProductDetail

      /** 供应商碳数据 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonData,
        component: lazy(
          () => import('@views/carbonFootprint3/SupplierCarbonData'),
        ),
        meta: {
          title: I18N.carbonFootprint3.supplierCarbonCount,
        },
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonDataAudit,
            meta: {
              title: I18N.router.reviewCarbonData,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import(
                  '@src/views/supplyChain2/carbonDataManage/SupplierCarbonData'
                ),
            ),
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3CarbonDataCarbonAccountAuditEmissionDetail,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/emissionFormPage'
                    ),
                ),
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3CarbonDataFootprintAuditEmissionDetail}/:id/:stage`,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                    ),
                ),
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierCarbonDataDetail,
            meta: {
              title: I18N.router.carbonDataDetails,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import(
                  '@src/views/supplyChain2/carbonDataManage/SupplierCarbonData'
                ),
            ),
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3CarbonDataCarbonAccountDetailEmissionDetail,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/emissionFormPage'
                    ),
                ),
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3CarbonDataFootprintDetailEmissionDetail}/:id/:stage`,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                    ),
                ),
              },
            ],
          },
        ],
      },

      /** 数据看板 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3Datas,
        meta: {
          title: I18N.router.dataBoard,
        },
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3DatasTotal,
            meta: {
              title: I18N.carbonFootprint.dataOverview,
            },
            component: lazy(
              () => import('@views/carbonFootprint3/datas/TotalView'),
            ),
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompare,
            meta: {
              title: I18N.router.comparisonReport,
            },
            component: lazy(
              () => import('@views/carbonFootprint3/datas/Compare'),
            ),
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareList,
            meta: {
              title: I18N.router.comparisonReport,
            },
            component: lazy(
              () => import('@views/carbonFootprint3/datas/CompareList'),
            ),
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3DatasCompareDetail,
            meta: {
              title: I18N.router.comparisonReport,
            },
            component: lazy(
              () => import('@views/carbonFootprint3/datas/CompareDetail'),
            ),
          },
        ],
      },

      /** 产品管理 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3ProductManagement,
        meta: {
          title: I18N.carbonFootprint.productManagement,
          icon: 'read',
        },
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ProductLibrary,
            component: lazy(
              () =>
                import(
                  '@src/views/carbonFootprint3/ProductManagement/productLibrary'
                ),
            ),
            meta: {
              title: I18N.carbonFootprint3.productLibrary,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryAdd,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.newProductsAdded,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryEdit}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.editProduct,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryDetail}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.productDetails,
                },
              },
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProductLibraryImport,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productLibrary/import'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.importProducts,
                },
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ProductAttribute,
            component: lazy(
              () =>
                import(
                  '@src/views/carbonFootprint3/ProductManagement/productAttribute'
                ),
            ),
            meta: {
              title: I18N.carbonFootprint3.productAttributes,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeAdd,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productAttribute/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.newAttributesAdded,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeEdit}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productAttribute/add'
                    ),
                ),
                meta: {
                  title: I18N.router.editProperties,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProductAttributeAddEnum}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProductManagement/productAttribute/addEnum'
                    ),
                ),
                meta: {
                  title: I18N.router.enumerationValueManagement,
                },
              },
            ],
          },
        ],
      },
      /** 碳足迹核算 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccounting,
        meta: {
          title: I18N.carbonFootprint.carbonFootprintAccounting,
          icon: 'read',
        },
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccounting,
            component: lazy(
              () =>
                import('@src/views/carbonFootprint3/QuickBusinessAccounting'),
            ),
            meta: {
              title: I18N.carbonFootprint3.quickAccounting,
            },
            children: [
              // 新增核算的选择模型 - 面包屑都显示新增核算
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingModel,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/addBasic/selectModel'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.addAccounting,
                },
              },
              // 新增核算的基本信息
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingAddBasic}`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/addBasic/FillAddBasic'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.addAccounting,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingEditBasic}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/addBasic'
                    ),
                ),
                meta: {
                  title: I18N.router.editAccounting,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingCopyBasic}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/addBasic/FillAddBasic'
                    ),
                ),
                meta: {
                  title: I18N.enterpriseCarbonAccount2.copyAccounting,
                },
              },

              // 核算管理
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagement}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/management'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.accountingManagement2,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementAddSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint.newEmissionSourcesAdded,
                    },
                    children: [
                      {
                        path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingFactorSelect}/:id/:stage`,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/QuickBusinessAccounting/management/selectFactor'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementEditSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint.editEmissionSources2,
                    },
                    children: [
                      {
                        path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingFactorSelectEdit}/:id/:stage`,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/QuickBusinessAccounting/management/selectFactor'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },

                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementDetailSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.emissionSourceDetails,
                    },
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementImportSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/import'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint.importEmissionSources,
                    },
                  },

                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementSelectSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/selectEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.selectingEmissionSources,
                    },
                  },
                ],
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementDetail}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/QuickBusinessAccounting/management'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.accountingDetails,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3QuickBusinessAccountingManagementDetailSourceDetail}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.emissionSourceDetails,
                    },
                  },
                ],
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessReport,
            component: lazy(() => import('@src/views/carbonFootprint3/Report')),
            meta: {
              title: () => I18N.carbonFootprint.carbonFootprintReport,
            },

            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
                component: lazy(
                  () => import('@src/views/carbonFootprint3/Report/Info'),
                ),
                meta: {
                  title: () =>
                    routeTypeNameRender(
                      I18N.carbonFootprint.carbonFootprintReport,
                    ),
                },
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccounting,
            component: lazy(
              () =>
                import('@src/views/carbonFootprint3/ProcessBusinessAccounting'),
            ),
            meta: {
              title: I18N.carbonFootprint3.processAccounting,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddOrBasicDetail,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProcessBusinessAccounting/AddOrDetail'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.addAccounting,
                },
              },
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddOrDetail,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProcessBusinessAccounting/AddOrDetail'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.addAccounting,
                },
              },

              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingAddBasic,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProcessBusinessAccounting/AddBasic'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.addAccounting,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingCopyBasic}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProcessBusinessAccounting/AddOrDetail'
                    ),
                ),
                meta: {
                  title: I18N.enterpriseCarbonAccount2.copyAccounting,
                },
              },
              // 核算管理
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingManagement,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/ProcessBusinessAccounting/AddOrDetail'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.accountingManagement2,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingManagementImportOut}/:accountId/:processId`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management/import/ImportOutFile'
                        ),
                    ),
                    meta: {
                      title: I18N.router.outputImport,
                    },
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccountingManagementImportIn}/:accountId/:processId`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/ProcessBusinessAccounting/Management/import/ImportInFile'
                        ),
                    ),
                    meta: {
                      title: I18N.router.inputImport,
                    },
                  },
                ],
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModel,
            component: lazy(
              () =>
                import('@src/views/carbonFootprint3/BusinessAccountingModel'),
            ),
            meta: {
              title: I18N.carbonFootprint.accountingModel,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelAddBasic,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic'
                    ),
                ),
                meta: {
                  title: I18N.router.newModelAdded,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelEditBasic}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic'
                    ),
                ),
                meta: {
                  title: I18N.router.editModel,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelCopyBasic}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic'
                    ),
                ),
                meta: {
                  title: I18N.router.copyModel,
                },
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagementDetail}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/BusinessAccountingModel/management/quickManagement'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.modelDetails,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementDetailSourceDetail}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/BusinessAccountingModel/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.emissionSourceDetails,
                    },
                  },
                ],
              },

              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingModelQuickManagement}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/BusinessAccountingModel/management/quickManagement'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.accountingManagement2,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementAddSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/BusinessAccountingModel/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint.newEmissionSourcesAdded,
                    },
                    children: [
                      {
                        path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementSelectFactor}/:id/:stage`,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/BusinessAccountingModel/management/selectFactor'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementSelectSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/BusinessAccountingModel/management/selectEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.selectingEmissionSources,
                    },
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementEditSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/BusinessAccountingModel/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint.editEmissionSources2,
                    },
                    children: [
                      {
                        path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuicEditkManagementSelectFactor}/:id/:stage`,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/BusinessAccountingModel/management/selectFactor'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3BusinessAccountingQuickManagementDetailSource}/:id/:stage`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/BusinessAccountingModel/management/addEmissionSource'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.emissionSourceDetails,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
      /** 排放数据库 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3Discharge,
        meta: {
          title: I18N.router.emissionsDatabase,
          icon: 'read',
        },
        children: [
          /** 核算模型库 */
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ModelLibrary,
            component: lazy(
              () => import('@/views/carbonFootprint3/discharge/ModelLibrary'),
            ),
            meta: {
              title: '核算模型库',
            },
          },
          {
            path: `${RouteMapsCorbonFootprint3.carbonFootprint3ModelManagement}/:id`,
            component: lazy(
              () =>
                import(
                  '@/views/carbonFootprint3/discharge/ModelLibrary/Management'
                ),
            ),
            meta: {
              title: '模型管理',
            },
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibrary,
            component: lazy(
              () =>
                import(
                  '@src/views/carbonFootprint3/discharge/emissionSoureLibrary'
                ),
            ),
            meta: {
              title: I18N.carbonFootprint3.emissionSourceRepository,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryAdd,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.newEmissionSourcesAdded,
                },
                children: [
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryAddSelectFactor,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/selectFactor'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.chooseEmissionFactors,
                    },
                  },
                ],
              },
              {
                path: `${RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryEdit}/:id`,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint.editEmissionSources2,
                },
                children: [
                  {
                    path: `${RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryEditSelectFactor}/:id`,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/selectFactor'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.chooseEmissionFactors,
                    },
                  },
                ],
              },
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3EmissionSoureLibraryDetail,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/discharge/emissionSoureLibrary/add'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                },
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibrary,
            component: lazy(
              () => import('@src/views/carbonFootprint3/discharge/process'),
            ),
            meta: {
              title: I18N.carbonFootprint3.processLibrary,
            },
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryAdd,
                component: lazy(
                  () =>
                    import('@src/views/carbonFootprint3/discharge/process/add'),
                ),
                meta: {
                  title: I18N.carbonFootprint3.newAdditionProcess,
                },
              },
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryDetails,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/discharge/process/details'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.processDetails,
                },
                children: [
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProductInfo,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/process/details/ProcessLibProduct'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.productDetails,
                    },
                  },
                ],
              },
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEdit,
                component: lazy(
                  () =>
                    import(
                      '@src/views/carbonFootprint3/discharge/process/details'
                    ),
                ),
                meta: {
                  title: I18N.carbonFootprint3.editingProcess,
                },
                children: [
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEmissionSourceSelect,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/process/details/EmissionSourceSelect'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.selectingEmissionSources,
                    },
                  },
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEditProductInfo,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/process/details/ProcessLibProduct'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.productDetails,
                    },
                  },
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProductAdd,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/process/details/ProcessLibProduct'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.newProductsAdded,
                    },
                    children: [
                      {
                        path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProcessLibSelect,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/discharge/process/details/ProcessLibSelect'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.selectionProcess,
                        },
                      },
                      {
                        path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryFactorSelect,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/discharge/process/details/FactorSelect'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },
                  {
                    path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProductEdit,
                    component: lazy(
                      () =>
                        import(
                          '@src/views/carbonFootprint3/discharge/process/details/ProcessLibProduct'
                        ),
                    ),
                    meta: {
                      title: I18N.carbonFootprint3.editProduct,
                    },
                    children: [
                      {
                        path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryProcessLibSelectEdit,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/discharge/process/details/ProcessLibSelect'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.selectionProcess,
                        },
                      },
                      {
                        path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryFactorSelectEdit,
                        component: lazy(
                          () =>
                            import(
                              '@src/views/carbonFootprint3/discharge/process/details/FactorSelect'
                            ),
                        ),
                        meta: {
                          title: I18N.carbonFootprint3.chooseEmissionFactors,
                        },
                      },
                    ],
                  },
                  // {
                  //   path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutAdd,
                  //   component: lazy(
                  //     () =>
                  //       import(
                  //         '@src/views/carbonFootprint3/discharge/process/details/ProcessLibOut'
                  //       ),
                  //   ),
                  //   children: [
                  //     {
                  //       path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutProcessLibSelect,
                  //       component: lazy(
                  //         () =>
                  //           import(
                  //             '@src/views/carbonFootprint3/discharge/process/details/ProcessLibSelect'
                  //           ),
                  //       ),
                  //       meta: {
                  //         title: '选择过程',
                  //       },
                  //     },
                  //     {
                  //       path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutFactorSelect,
                  //       component: lazy(
                  //         () =>
                  //           import(
                  //             '@src/views/carbonFootprint3/discharge/process/details/FactorSelect'
                  //           ),
                  //       ),
                  //       meta: {
                  //         title: '选择排放因子',
                  //       },
                  //     },
                  //   ],
                  //   meta: {
                  //     title: '新增输出',
                  //   },
                  // },
                  // {
                  //   path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutEdit,
                  //   component: lazy(
                  //     () =>
                  //       import(
                  //         '@src/views/carbonFootprint3/discharge/process/details/ProcessLibOut'
                  //       ),
                  //   ),
                  //   children: [
                  //     {
                  //       path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutProcessLibSelectEdit,
                  //       component: lazy(
                  //         () =>
                  //           import(
                  //             '@src/views/carbonFootprint3/discharge/process/details/ProcessLibSelect'
                  //           ),
                  //       ),
                  //       meta: {
                  //         title: '选择过程',
                  //       },
                  //     },
                  //     {
                  //       path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryOutFactorSelectEdit,
                  //       component: lazy(
                  //         () =>
                  //           import(
                  //             '@src/views/carbonFootprint3/discharge/process/details/FactorSelect'
                  //           ),
                  //       ),
                  //       meta: {
                  //         title: '选择排放因子',
                  //       },
                  //     },
                  //   ],
                  //   meta: {
                  //     title: '编辑输出',
                  //   },
                  // },
                  // {
                  //   path: RouteMapsCorbonFootprint3.carbonFootprint3ProcessLibraryEditOutInfo,
                  //   component: lazy(
                  //     () =>
                  //       import(
                  //         '@src/views/carbonFootprint3/discharge/process/details/ProcessLibOut'
                  //       ),
                  //   ),
                  //   meta: {
                  //     title: '输出详情',
                  //   },
                  // },
                ],
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3Download,
            meta: {
              title: I18N.carbonFootprint.downloadManagement,
            },
            component: lazy(
              () => import('@src/views/enterpriseCarbonAccount2/indexList'),
            ),
          },
        ],
      },
      /** 供应商碳管理 */
      {
        path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierManageList,
        meta: {
          title: I18N.router.supplierCarbonTube,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/carbonFootprint3/SupplierManage/index'),
        ),
        children: [
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierManageAudit,
            meta: {
              title: I18N.router.reviewCarbonData,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/SupplierManage/SupplierCarbonData/index'
                ),
            ),
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierManageAuditEmissionDetail,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'read',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
                    ),
                ),
              },
            ],
          },
          {
            path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierManagDetail,
            meta: {
              title: I18N.router.carbonDataDetails,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonFootprint3/SupplierManage/SupplierCarbonData/index'
                ),
            ),
            children: [
              {
                path: RouteMapsCorbonFootprint3.carbonFootprint3SupplierManagDetailEmissionDetail,
                meta: {
                  title: I18N.carbonFootprint3.emissionSourceDetails,
                  icon: 'read',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonFootprint3/QuickBusinessAccounting/management/addEmissionSource'
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
