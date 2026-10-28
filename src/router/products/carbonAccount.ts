/*
 * @@description:碳账户路由
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-23 16:26:34
 */

import I18N from '@src/lang/I18N';
import { lazy } from 'react';
import { RouteMaps } from '../route-paths';

/** 碳账户路由 */
export const carbonAccountRoutes = [
  {
    path: RouteMaps.CarbonAccount,
    meta: {
      title: I18N.carbonAccount.carbonAccount,
      icon: 'DashboardOutlined',
    },
    redirect: RouteMaps.CarbonAccountWelcome,
    children: [
      {
        path: RouteMaps.CarbonAccountWelcome,
        meta: {
          title: I18N.carbonAccount.carbonAccount,
          icon: 'read',
        },
        component: lazy(() => import('@views/carbonAccount/home')),
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
      {
        path: RouteMaps.CarbonAccountUserManagement,
        meta: {
          title: I18N.router.userManagement,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.CarbonAccountUserList,
            meta: {
              title: I18N.carbonAccount.userList,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/userManagement/userList'),
            ),
            children: [
              {
                path: RouteMaps.CarbonAccountUserListDetail,
                meta: {
                  title: I18N.router.viewUsers,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/userManagement/userList/detail'
                    ),
                ),
              },
              {
                path: RouteMaps.CarbonAccountImportUser,
                meta: {
                  title: I18N.carbonAccount.importUsers,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/userManagement/userList/importUser'
                    ),
                ),
              },
            ],
          },
          {
            path: RouteMaps.CarbonAccountActiveDataRecording,
            meta: {
              title: I18N.router.activityDataRecording2,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonAccount/userManagement/activeDataRecording'
                ),
            ),
          },
          {
            path: RouteMaps.CarbonAccountActiveDataRecordingDetail,
            meta: {
              title: I18N.router.activityDataRecording,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import(
                  '@views/carbonAccount/userManagement/activeDataRecording/detail'
                ),
            ),
          },
          {
            path: RouteMaps.CarbonAccountLntergralRecord,
            meta: {
              title: I18N.router.integralRecord,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import('@views/carbonAccount/userManagement/lntegralRecord'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.CarbonAccountSceneManagement,
        meta: {
          title: I18N.carbonAccount.scenarioManagement,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@views/carbonAccount/sceneManagement')),
        children: [
          {
            path: RouteMaps.CarbonAccountSceneManagementAdd,
            meta: {
              title: I18N.carbonAccount.newScenarios,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/detail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementEdit,
            meta: {
              title: I18N.carbonAccount.editScene,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/detail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementFind,
            meta: {
              title: I18N.carbonAccount.viewingScenes,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/detail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementCustomAdd,
            meta: {
              title: I18N.carbonAccount.newScenarios,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/customDetail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementCustomEdit,
            meta: {
              title: I18N.carbonAccount.editScene,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/customDetail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementCustomFind,
            meta: {
              title: I18N.carbonAccount.viewingScenes,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/customDetail'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountSceneManagementLocationLimitRecords,
            meta: {
              title: I18N.carbonAccount.travelRestrictions,
            },
            component: lazy(
              () => import('@views/carbonAccount/sceneManagement/LimitRecord'),
            ),
            children: [
              {
                path: RouteMaps.CarbonAccountSceneManagementLocationLimit,
                meta: {
                  title: I18N.router.clockInRestrictions,
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/sceneManagement/detail/LimitMap'
                    ),
                ),
              },
              {
                path: RouteMaps.CarbonAccountSceneManagementLocationLimitShow,
                meta: {
                  title: I18N.router.checkInRestrictionsDetailed,
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/sceneManagement/detail/LimitMap'
                    ),
                ),
              },
            ],
          },
        ],
      },
      {
        path: RouteMaps.CertificateManagement,
        meta: {
          title: I18N.carbonAccount.certificateManagement,
          icon: 'Certificate',
        },
        component: lazy(
          () => import('@views/carbonAccount/certificate/management'),
        ),
      },
      {
        path: RouteMaps.CarbonAccountAwardConversion,
        meta: {
          title: I18N.router.awardRedemption,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.CarbonAccountAwardConversionAwardList,
            meta: {
              title: I18N.carbonAccount.listOfPrizes,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/awardConversion/awardList'),
            ),
            children: [
              {
                path: RouteMaps.CarbonAccountAwardConversionAwardListAdd,
                meta: {
                  title: I18N.router.addPrizes,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/awardConversion/awardList/detail'
                    ),
                ),
              },
              {
                path: RouteMaps.CarbonAccountAwardConversionAwardListEdit,
                meta: {
                  title: I18N.router.editingPrizes,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/awardConversion/awardList/detail'
                    ),
                ),
              },
            ],
          },
          {
            path: RouteMaps.CarbonAccountAwardConversionConversionRecord,
            meta: {
              title: I18N.router.exchangeRecords,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import('@views/carbonAccount/awardConversion/conversionRecord'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountAwardConversionInventoryRecord,
            meta: {
              title: I18N.router.inventoryChangeRecord,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () =>
                import('@views/carbonAccount/awardConversion/inventoryRecord'),
            ),
          },
        ],
      },
      {
        path: RouteMaps.CarbonAccountBaseSetting,
        meta: {
          title: I18N.router.basicSettings,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.CarbonAccountBaseSettingOrgSetting,
            meta: {
              title: I18N.router.groupSettings,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/baseSetting/orgSetting'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountBaseSettingCommonSetting,
            meta: {
              title: I18N.router.generalSettings,
            },
            component: lazy(
              () => import('@views/carbonAccount/baseSetting/CommonSetting'),
            ),
          },
          {
            path: RouteMaps.CarbonAccountBaseSettingTheme,
            meta: {
              title: I18N.carbonAccount.themeSettings,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/baseSetting/Theme'),
            ),
            children: [
              {
                path: RouteMaps.CarbonAccountBaseSettingThemeDetail,
                meta: {
                  title: I18N.router.themeDetails,
                },
                component: lazy(
                  () => import('@views/carbonAccount/baseSetting/Theme/Detail'),
                ),
              },
              {
                path: RouteMaps.CarbonAccountBaseSettingThemeEdit,
                meta: {
                  title: I18N.router.editTheme,
                },
                component: lazy(
                  () => import('@views/carbonAccount/baseSetting/Theme/Detail'),
                ),
              },
            ],
          },
          {
            path: RouteMaps.CarbonAccountBaseSettingBanner,
            meta: {
              title: I18N.router.bannerSettings,
              icon: 'DashboardOutlined',
            },
            component: lazy(
              () => import('@views/carbonAccount/baseSetting/Banner'),
            ),
            children: [
              {
                path: RouteMaps.CarbonAccountBaseSettingAddBanner,
                meta: {
                  title: I18N.router.addBan,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import('@views/carbonAccount/baseSetting/Banner/banner'),
                ),
              },
              {
                path: RouteMaps.CarbonAccountBaseSettingCheckBanner,
                meta: {
                  title: I18N.router.viewBan,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import('@views/carbonAccount/baseSetting/Banner/banner'),
                ),
              },
              {
                path: RouteMaps.CarbonAccountBaseSettingEditBanner,
                meta: {
                  title: I18N.router.editBan,
                  icon: 'DashboardOutlined',
                },
                component: lazy(
                  () =>
                    import('@views/carbonAccount/baseSetting/Banner/banner'),
                ),
              },
            ],
          },

          {
            path: RouteMaps.carbonAccountFeedBacks,
            meta: {
              title: I18N.carbonAccount.feedbackList,
            },
            component: lazy(
              () => import('@views/carbonAccount/baseSetting/FeedBack'),
            ),
            children: [
              {
                path: RouteMaps.carbonAccountFeedBackDetail,
                component: lazy(
                  () =>
                    import(
                      '@views/carbonAccount/baseSetting/FeedBack/FeedBackDetail'
                    ),
                ),
                meta: {
                  title: I18N.router.feedbackDetails,
                },
              },
            ],
          },
        ],
      },
      {
        path: RouteMaps.CarbonAccountDownload,
        meta: {
          title: I18N.carbonFootprint.downloadManagement,
          icon: 'read',
        },
        component: lazy(() => import('@views/carbonAccount/downloadManage')),
      },
    ],
  },
];
