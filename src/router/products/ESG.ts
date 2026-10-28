import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { RouteMaps } from '../route-paths';

export const ESGRoutes = [
  {
    path: RouteMaps.ESG,
    meta: {
      title: 'ESG',
      icon: 'DashboardOutlined',
    },
    redirect: RouteMaps.ESGManagement,
    children: [
      {
        path: RouteMaps.ESGManagement,
        component: lazy(() => import('@views/ESG/Management')),
        meta: {
          title: I18N.esg.esgIndicators,
        },
        children: [
          {
            path: RouteMaps.ESGIndicatorInfo,
            component: lazy(() => import('@views/ESG/IndicatorInfo')),
          },
        ],
      },
      {
        path: RouteMaps.ESGFillManagement,
        component: lazy(() => import('@/views/ESG/FillManagement')),
        meta: {
          title: I18N.router.esgTasks,
        },
        children: [
          {
            path: RouteMaps.ESGOrgTaskList,
            component: lazy(() => import('@views/ESG/OrgTaskList')),
          },
          {
            path: RouteMaps.ESGIndicatorFillInfo,
            component: lazy(() => import('@views/ESG/IndicatorFillInfo')),
          },
        ],
      },
      {
        path: RouteMaps.ESGSummary,
        component: lazy(() => import('@/views/ESG/Summary')),
        meta: {
          title: I18N.router.esgData,
        },
      },
      {
        path: RouteMaps.ESGAiGenerateDetail,
        component: lazy(() => import('@views/ESG/AiGenerateDetail')),
        meta: {
          title: 'ESG指标体系管理',
        },
      },
      {
        path: RouteMaps.ESGAiGenerateOutline,
        component: lazy(() => import('@views/ESG/AiGenerateOutline')),
        meta: {
          title: 'ESG指标体系管理',
        },
      },
      {
        path: RouteMaps.ESGAiGenerateHome,
        component: lazy(() => import('@views/ESG/AiGenerateHome')),
        meta: {
          title: 'ESG指标体系管理',
        },
      },
      {
        path: RouteMaps.ESGAiGenerateList,
        component: lazy(() => import('@views/ESG/AiGenerateList')),
        meta: {
          title: 'ESG指标体系管理',
        },
      },
      {
        path: RouteMaps.ESGMsciRatingList,
        component: lazy(() => import('@views/ESG/MsciRatingList')),
        meta: {
          title: 'MSCI 评级列表',
        },
      },
      {
        path: RouteMaps.ESGMsciRatingDetail,
        component: lazy(() => import('@views/ESG/MsciRatingDetail')),
        meta: {
          title: 'MSCI 评级详情',
        },
      },
      {
        path: RouteMaps.ESGImportanceAnalysis,
        component: lazy(() => import('@views/ESG/ImportanceAnalysis')),
        meta: {
          title: '重要性议题分析',
        },
        children: [
          {
            path: RouteMaps.ESGImportanceAnalysisAdd,
            component: lazy(() => import('@views/ESG/ImportanceAnalysisInfo')),
            meta: {
              title: '新增重要性议题分析',
            },
          },
          {
            path: RouteMaps.ESGImportanceAnalysisInfo,
            component: lazy(() => import('@views/ESG/ImportanceAnalysisInfo')),
            meta: {
              title: '重要性议题分析详情',
            },
          },
          {
            path: RouteMaps.ESGImportanceAnalysisFill,
            id: 'ESGImportanceAnalysisFill',
            component: lazy(() => import('@views/ESG/ImportanceAnalysisFill')),
            meta: {
              title: '重要性议题分析填写',
            },
          },
          {
            path: RouteMaps.ESGImportanceAnalysisResult,
            component: lazy(
              () => import('@views/ESG/ImportanceAnalysisResult'),
            ),
            meta: {
              title: '重要性议题分析结果',
            },
          },
        ],
      },
    ],
  },
];
