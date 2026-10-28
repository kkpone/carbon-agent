/*
 * @@description:绿色会议
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:59:55
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-22 11:00:35
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { RouteMaps } from '../route-paths';

export const greenMeetingRoutes = [
  {
    path: '/greenMeeting',
    meta: {
      title: I18N.notOrder.greenConference,
    },
    redirect: RouteMaps.greenMeetingActiveity,
    children: [
      {
        path: RouteMaps.greenMeetingActiveity,
        component: lazy(() => import('@views/greenMeeting')),
        meta: {
          title: I18N.greenMeeting.activityList,
        },
        children: [
          {
            path: RouteMaps.greenMeetingAddActiveity,
            component: lazy(
              () => import('@views/greenMeeting/activityManage/addActivity'),
            ),
            meta: {
              title: I18N.router.newActivity,
            },
          },
          {
            path: RouteMaps.greenMeetingEidtActiveity,
            component: lazy(
              () => import('@views/greenMeeting/activityManage/addActivity'),
            ),
            meta: {
              title: I18N.router.editingActivities,
            },
          },
          {
            path: RouteMaps.greenMeetingDetailActiveity,
            component: lazy(
              () => import('@views/greenMeeting/activityManage/addActivity'),
            ),
            meta: {
              title: I18N.router.eventDetails,
            },
          },
        ],
      },
      {
        path: RouteMaps.greenMeetingAdjust,
        component: lazy(() => import('@views/greenMeeting')),
        meta: {
          title: I18N.enterpriseCarbonAccount2.carbonEmissionAccounting,
        },
        children: [
          {
            path: RouteMaps.greenMeetingEidtAdjustOne,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustOne'),
            ),
            meta: {
              title: I18N.router.editCarbonAccounting,
            },
          },
          {
            path: RouteMaps.greenMeetingAdjustDetail,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustTwo'),
            ),
            meta: {
              title: I18N.router.viewCarbonAccounting,
            },
          },
          {
            path: RouteMaps.greenMeetingAdjustDataMange,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustTwo'),
            ),
            meta: {
              title: I18N.greenMeeting.dataManagement,
            },
          },
          {
            path: RouteMaps.greenMeetingAddAdjustOne,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustOne'),
            ),
            meta: {
              title: I18N.enterpriseCarbonAccount2.addCarbonAccounting,
            },
          },
          {
            path: RouteMaps.greenMeetingAddAdjustTwo,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustTwo'),
            ),
            meta: {
              title: I18N.enterpriseCarbonAccount2.addCarbonAccounting,
            },
          },
          {
            path: RouteMaps.greenMeetingAdjustData,
            component: lazy(
              () => import('@views/greenMeeting/adjust/addAdjustData'),
            ),
            meta: {
              title: I18N.ModelManagement.dataStatistics2,
            },
          },
        ],
      },
      {
        path: RouteMaps.greenMeetingReport,
        component: lazy(() => import('@views/greenMeeting')),
        meta: {
          title: I18N.carbonNeutral.carbonAccountingReport,
        },
        children: [
          {
            path: RouteMaps.greenMeetingReportAdd,
            component: lazy(
              () => import('@views/greenMeeting/report/addReport'),
            ),
            meta: {
              title: I18N.carbonFootprint.newReportAdded,
            },
          },
          {
            path: RouteMaps.greenMeetingEidtReport,
            component: lazy(
              () => import('@views/greenMeeting/report/addReport'),
            ),
            meta: {
              title: I18N.carbonFootprint.editReport,
            },
          },
          {
            path: RouteMaps.greenMeetingReportDetail,
            component: lazy(
              () => import('@views/greenMeeting/report/addReport'),
            ),
            meta: {
              title: I18N.carbonFootprint.reportDetails,
            },
          },
        ],
      },
      {
        path: RouteMaps.greenMeetingProductIntor,
        component: lazy(() => import('@views/productIntor')),
        meta: {
          title: I18N.router.productIntroduction,
          icon: 'read',
        },
      },
      // 首页-下载管理
      {
        path: RouteMaps.downloadManage,
        component: lazy(() => import('@views/dashborad/downloadManage/index')),
        meta: {
          title: I18N.carbonFootprint.downloadManagement,
          icon: 'read',
        },
      },
    ],
  },
];
