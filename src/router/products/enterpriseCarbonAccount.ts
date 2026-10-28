/*
 * @@description:企业碳核算2.0
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:35:02
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 16:46:09
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { routeTypeNameRender } from '../Uutils';
import { RouteMaps } from '../route-paths';

export const enterPriceCarbonAccountRoutes = [
  {
    path: RouteMaps.enterpriseCarbonAccounting,
    meta: {
      title: I18N.carbonFootprint3.enterpriseCarbonAccounting,
      icon: 'DashboardOutlined',
    },
    redirect: RouteMaps.enterpriseCarbonAccountingProductIntor,
    children: [
      {
        path: RouteMaps.enterpriseCarbonAccountingProductIntor,
        meta: {
          title: I18N.router.productIntroduction,
          icon: 'read',
        },
        component: lazy(() => import('@views/productIntor')),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingSetting,
        meta: {
          title: I18N.enterpriseCarbonAccount2.accountingSettings,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/AccountingSetting'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingPom,
        meta: {
          title: I18N.router.productionAndOperationManagement,
        },
        component: lazy(() => import('@views/enterpriseCarbonAccount2/Pom')),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingFormulaSetting,
        meta: {
          title: '计算方法配置',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/FormulaSetting'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingApprovalConfig,
        meta: {
          title: '审批配置',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/ApprovalConfig'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingAnnualReport,
        meta: {
          title: I18N.router.dataBoard,
        },
        redirect: RouteMaps.enterpriseCarbonAccountingOrgReport,
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingOrgReport,
            meta: {
              title: I18N.router.organizationalKanban,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/AnnualReport'),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingIndustryBenchmarking,
            meta: {
              title: I18N.carbonFootprint.industryBenchmarking,
            },
            component: lazy(
              () =>
                import('@views/enterpriseCarbonAccount2/IndustryBenchmarking'),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingTrendAnalysis,
            meta: {
              title: I18N.enterpriseCarbonAccount2.trendAnalysis,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/TrendAnalysis'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingAiReport,
        meta: {
          title: I18N.router.aiReport,
        },
        // component: lazy(
        //   () => import('@views/enterpriseCarbonAccount2/AiAssistant/AiReport'),
        // ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingAiReportDetail,
            meta: {
              title: I18N.router.aiReportDetails,
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/AiAssistant/ReportDetail'
                ),
            ),
          },
        ],
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/AiAssistant/AiReport'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingCdpAiReportDetail,
        meta: {
          title: I18N.router.aiReport,
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/CdpAiAssistant/detail'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingCdpAiReportList,
        meta: {
          title: I18N.router.aiReport,
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/CdpAiAssistant/list'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingCdpAiReportScore,
        meta: {
          title: I18N.router.aiReport,
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/CdpAiAssistant/score'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingDataView,
        meta: {
          title: I18N.carbonFootprint.dataOverview,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/Welcome'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanList,
        meta: {
          title: I18N.enterpriseCarbonAccount2.controlPlan,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/indexList'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanAdd,
            meta: {
              title: I18N.router.controlPlanNew,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/addCopy'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanCopy,
            meta: {
              title: I18N.router.controlPlanReply,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/addCopy'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanEdit,
            meta: {
              title: I18N.router.controlPlanCompilation,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/editDetail'
                ),
            ),
            children: [
              {
                path: RouteMaps.enterpriseCarbonAccountingDataQualitydataManagePlanEdit,
                meta: {
                  title: I18N.enterpriseCarbonAccount2.editDataTube,
                  icon: 'read',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/dataManagePlanEditDetail'
                    ),
                ),
              },
              {
                path: RouteMaps.enterpriseCarbonAccountingDataQualityControldataManagePlanDetail,
                meta: {
                  title: I18N.enterpriseCarbonAccount2.dataManagementMeter2,
                  icon: 'read',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/dataManagePlanEditDetail'
                    ),
                ),
              },
            ],
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingDataQualityControlPlanDetail,
            meta: {
              title: I18N.enterpriseCarbonAccount2.detailedControlPlan,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/dataQuality/controlPlan/editDetail'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
        meta: {
          title: I18N.router.carbonEmissionAccounting,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/AccountingList'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingAccounting,
            meta: {
              title: I18N.carbonNeutral.businessAccounting,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/accounting'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingDisclosureReportEdit,
        meta: {
          title: I18N.enterpriseCarbonAccount2.disclosureAndReport,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/DisclosureReport/Edit'),
        ),
      },
      {
        id: 'enterpriseCarbonAccountingcarbonDischargeShare',
        path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeShare,
        meta: {
          title: I18N.router.carbonEmissionAccounting,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/AccountingListShare'),
        ),
        children: [
          {
            id: 'enterpriseCarbonAccountingAccountingShare',
            path: RouteMaps.enterpriseCarbonAccountingAccountingShare,
            meta: {
              title: I18N.carbonNeutral.businessAccounting,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/accountingShare'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportList,
        meta: {
          title: I18N.enterpriseCarbonAccount2.accountingReport,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/AccountingReport'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportAdd,
            meta: {
              title: I18N.carbonFootprint.newReportAdded,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/accountReport/addEdit'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportEdit,
            meta: {
              title: I18N.carbonFootprint.editReport,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/accountReport/addEdit'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountReportDetail,
            meta: {
              title: I18N.carbonFootprint.reportDetails,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/accountReport/addEdit'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountsSelectScene,
            meta: {
              title: I18N.enterpriseCarbonAccount2.chooseAReductionVenue,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/accountReport/selectScene'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountModelList,
        meta: {
          title: I18N.carbonFootprint.accountingModel,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/model/list'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingModelList,
            meta: {
              title: I18N.carbonFootprint.accountingModel,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/model/list'),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingModelDetail,
            meta: {
              title: I18N.carbonFootprint.accountingModel,
            },
            component: lazy(
              () => import('@views/enterpriseCarbonAccount2/model/detail'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicList,
        meta: {
          title: () => I18N.carbonFootprint3.emissionSourceRepository,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/Emissions'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactor,
            meta: {
              title: I18N.components.selectionFactor,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/selectFactor'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactorDetail,
            meta: {
              title: I18N.router.factorDetails,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/factorDetail'
                ),
            ),
          },
          // 碳核算2.22新增库新增
          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
            meta: {
              title: href =>
                routeTypeNameRender(I18N.carbonFootprint.emissionSources, href),
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/emissionDic/addEdit'
                ),
            ),
          },

          {
            path: RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicImport,
            meta: {
              title: I18N.carbonFootprint.importEmissionSources,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/carbonDischarge/emissionAccount/emissionManage/importDischarge'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardList,
        meta: {
          title: I18N.router.emissionBenchmarkColumn,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/indexList'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardEdit,
            meta: {
              title: I18N.carbonFootprint.editEmissionSources2,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/emissionLess/emissionStandard/editDetail'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionStandardDetail,
            meta: {
              title: I18N.carbonFootprint3.emissionSourceDetails,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/emissionLess/emissionStandard/editDetail'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingReducingPlan,
        meta: {
          title: I18N.enterpriseCarbonAccount2.emissionReductionPlan,
        },
        component: lazy(
          () =>
            import(
              '@src/views/enterpriseCarbonAccount2/ReducingAction/ReducingPlan'
            ),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneList,
        meta: {
          title: I18N.router.emissionReductionScenarioColumn,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/indexList'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneAdd,
            meta: {
              title:
                I18N.enterpriseCarbonAccount2.newAdditionsAndDeletionsInLayout,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/emissionLess/emissionLessScene/editDetail'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneEdit,
            meta: {
              title: I18N.router.emissionReductionScenarioCompilation,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/emissionLess/emissionLessScene/editDetail'
                ),
            ),
          },
          {
            path: RouteMaps.enterpriseCarbonAccountingEmissionLessEmissionLessSceneDetail,
            meta: {
              title:
                I18N.enterpriseCarbonAccount2
                  .detailsOfEmissionReductionScenarios,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/emissionLess/emissionLessScene/editDetail'
                ),
            ),
          },
        ],
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingDownloadList,
        meta: {
          title: I18N.router.downloadManagementColumn,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/indexList'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingSupplierManageList,
        meta: {
          title: I18N.router.supplierCarbonTube,
          icon: 'read',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/SupplierManage'),
        ),
        children: [
          {
            path: RouteMaps.enterpriseCarbonAccountingSupplierManageAudit,
            meta: {
              title: I18N.router.reviewCarbonData,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/SupplierManage/SupplierCarbonData/index'
                ),
            ),
            children: [
              {
                path: RouteMaps.enterpriseCarbonAccountingSupplierManageAuditEmissionDetail,
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
            path: RouteMaps.enterpriseCarbonAccountingSupplierManagDetail,
            meta: {
              title: () => I18N.router.carbonDataDetails,
              icon: 'read',
            },
            component: lazy(
              () =>
                import(
                  '@views/enterpriseCarbonAccount2/SupplierManage/SupplierCarbonData/index'
                ),
            ),
            children: [
              {
                path: `${RouteMaps.enterpriseCarbonAccountingSupplierManagDetailEmissionDetail}/:id/:stage`,
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
      {
        path: RouteMaps.enterpriseCarbonAccountingTaskList,
        meta: {
          title: I18N.DomesticVersion.dataReporting,
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/TaskList'),
        ),
      },
      {
        id: 'enterpriseTaskFill',
        path: RouteMaps.enterpriseCarbonAccountingNoLoginTaskList,
        meta: {
          title: I18N.DomesticVersion.dataReporting,
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/NoLoginTaskList'),
        ),
      },
      {
        path: RouteMaps.enterpriseCarbonAccountingApprovalList,
        meta: {
          title: '数据审批',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/ApprovalList'),
        ),
      },
      {
        id: 'enterpriseApprovalNoLogin',
        path: RouteMaps.enterpriseCarbonAccountingNoLoginApprovalList,
        meta: {
          title: '数据审批',
        },
        component: lazy(
          () => import('@views/enterpriseCarbonAccount2/NoLoginApprovalList'),
        ),
      },
      {
        path: RouteMaps.cbam,
        meta: {
          title: 'CBAM',
        },
        component: lazy(() => import('@/views/cbam/Home')),
        children: [
          {
            path: RouteMaps.cbamHome,
            meta: {
              title: 'CBAM',
            },
            component: lazy(() => import('@/views/cbam/Home')),
          },
          {
            path: RouteMaps.cbamFactory,
            meta: {
              title: '工厂信息',
            },
            component: lazy(() => import('@/views/cbam/FactoryInformation')),
          },
          {
            path: RouteMaps.cbamReport,
            meta: { title: 'CBAM报表' },
            component: lazy(() => import('@/views/cbam/ReportForm')),
            children: [
              {
                path: RouteMaps.cbamReportInfo,
                meta: { title: 'CBAM报表详情' },
                component: lazy(() => import('@/views/cbam/ReportForm/Info')),
              },
            ],
          },
          {
            path: RouteMaps.cbamPrecursorData,
            meta: { title: 'CBAM前体数据' },
            component: lazy(() => import('@/views/cbam/PrecursorData')),
            children: [
              {
                path: RouteMaps.cbamPrecursorDataInfo,
                meta: { title: 'CBAM前体数据详情' },
                component: lazy(
                  () => import('@/views/cbam/PrecursorData/Info'),
                ),
              },
            ],
          },
          {
            path: RouteMaps.cbamPrecursorDataApproval,
            meta: { title: 'CBAM前体数据审批' },
            component: lazy(() => import('@/views/cbam/PrecursorDataApproval')),
            children: [
              {
                path: RouteMaps.cbamPrecursorDataApprovalInfo,
                meta: { title: 'CBAM前体数据审批详情' },
                component: lazy(
                  () => import('@/views/cbam/PrecursorDataApproval/Info'),
                ),
              },
            ],
          },
          {
            path: RouteMaps.cbamPrecursorDataFill,
            meta: { title: 'CBAM前体数据填报' },
            component: lazy(() => import('@/views/cbam/PrecursorDataFill')),
            children: [
              {
                path: RouteMaps.cbamPrecursorDataFillInfo,
                meta: { title: 'CBAM前体数据填报详情' },
                component: lazy(
                  () => import('@/views/cbam/PrecursorDataFill/Info'),
                ),
              },
            ],
          },
        ],
      },
    ],
  },
];
