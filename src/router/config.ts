/*
 * @@description:路由配置
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-24 09:59:04
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-09 15:43:27
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-04 16:51:58
 */

import I18N from '@src/lang/I18N';
import { ComponentType, lazy } from 'react';

import { CCDBRoutes } from './products/CCDB';
import { ESGRoutes } from './products/ESG';
import { carbonAccountRoutes } from './products/carbonAccount';
import { carbonDatasRoutes } from './products/carbonDatas';
import { carbonFootprintLCARoute } from './products/carbonFootprintLCA';
import { carbonFootprintLCANewRoute } from './products/carbonFootprintLCAnew';
import { carbonNeutralizationRoutes } from './products/carbonNeutralization';
import { certificationServicesRoutes } from './products/certificationServices';
import { carbonFootprint3 } from './products/corbonFootprint3';
import { enterPriceCarbonAccountRoutes } from './products/enterpriseCarbonAccount';
import { enterpriseCarbonAccountForInternationalRoutes } from './products/enterpriseCarbonAccountForInternational';
import { greenMeetingRoutes } from './products/greenMeeting';
// import { supplyChainRoutes } from './products/supplyChain';
import { QuestionnaireRoutes } from './products/questionnaire';
import { supplyChain2Routes } from './products/supplyChain2Routes';
import { RouteMaps } from './route-paths';
import { RouteMapsCorbonFootprint3 } from './route-paths/corbonFootprint3';

interface RouteBase {
  // 路由路径
  path: string;
  // 路由组件
  component?: ComponentType<any>;
  // Layout routes can keep their component mounted while child routes change.
  exact?: boolean;
  // 302 跳转
  redirect?: string;
  // 路由信息
  meta: RouteMeta;
  // 是否校验权限, false 为不校验, 不存在该属性或者为true 为校验, 子路由会继承父路由的 auth 属性
  auth?: boolean;
  // 唯一标识
  id?: string;
}

interface RouteMeta {
  title: string | ((href?: string) => string);
  icon?: string;
}

export interface Routes extends RouteBase {
  children?: Routes[];
}

/**
 * routes 第一级路由负责最外层的路由渲染，比如 userLayout 和 Layout 的区分
 * 所有系统内部存在的页面路由都要在此地申明引入，而菜单栏的控制是支持异步请求控制的
 */
export const menuRoutes: () => Routes[] = () => [
  {
    path: RouteMaps.supplierBindTransfer,
    meta: {
      title: '',
    },
    auth: false,
    id: 'supplierBindTransfer',
    component: lazy(() => import('../views/supplierBindTransfer')),
  },
  {
    path: RouteMaps.workIndex,
    meta: {
      title: I18N.workbench.workbench,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('../views/work/index')),
    // component: lazy(() => import('../views/carbonDataManagemen/index')),
    children: [
      {
        path: RouteMaps.informationList,
        meta: {
          title: I18N.router.lowCarbonInformationColumn,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('../views/workbench/informationList')),
      },
      {
        path: RouteMaps.informationDetail,
        meta: {
          title: I18N.workbench.productInformationDetail,
          icon: 'DashboardOutlined',
        },
        component: lazy(
          () => import('../views/workbench/productInformationDetail'),
        ),
      },
      {
        path: RouteMaps.productList,
        meta: {
          title: I18N.components.productList,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('../views/workbench/productList')),
      },
      {
        path: RouteMaps.productDetail,
        meta: {
          title: I18N.carbonFootprint3.productDetails,
          icon: 'DashboardOutlined',
        },
        component: lazy(
          () => import('../views/workbench/productInformationDetail'),
        ),
      },
    ],
  },
  {
    path: RouteMaps.workArticleDetail,
    meta: {
      title: I18N.workbench.workbench,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('../views/work/articleDetail/index')),
  },
  {
    path: RouteMaps.dashborad,
    meta: {
      title: I18N.dashborad.organizationalManagement,
      icon: 'DashboardOutlined',
    },
    children: [
      {
        path: RouteMaps.dashboradOrganization,
        component: lazy(() => import('../views/dashborad/organization/index')),
        meta: {
          title: I18N.router.organizationalInformation,
          icon: 'read',
        },
      },
      {
        path: RouteMaps.dashboradOrgstaff,
        component: lazy(() => import('../views/dashborad/orgstaff/index')),
        meta: {
          title: I18N.dashborad.employeeManagement,
          icon: 'read',
        },
      },
      {
        path: RouteMaps.dashboradRole,
        component: lazy(() => import('../views/dashborad/role/index')),
        meta: {
          title: I18N.dashborad.roleManagement,
          icon: 'read',
        },
      },
      {
        path: RouteMaps.dashboradDepartment,
        component: lazy(() => import('../views/dashborad/department/index')),
        meta: {
          title: I18N.dashborad.departmentManagement,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.dashboradDepartmentAdd,
            component: lazy(
              () => import('../views/dashborad/department/index'),
            ),
            meta: {
              title: I18N.router.departmentManagementAdd,
              icon: 'read',
            },
          },
        ],
      },
    ],
  },
  {
    path: RouteMaps.greenSupplier,
    meta: {
      title: I18N.router.greenSupplier,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('../views/dashborad/greenSupplier/index')),
  },
  {
    path: RouteMaps.broadcast,
    component: lazy(() => import('../views/system/Broadcast/list')),
    meta: {
      title: I18N.router.notificationList,
    },
    children: [
      {
        path: RouteMaps.broadcastDetail,
        component: lazy(() => import('../views/system/Broadcast/list/show')),
        meta: {
          title: I18N.router.notificationDetails,
        },
      },
    ],
  },
  {
    path: RouteMaps.emission,
    meta: {
      title: I18N.carbonFootprint.emissionFactors,
      icon: 'DashboardOutlined',
    },
    children: [
      {
        path: RouteMaps.emissionOrganization,
        component: lazy(() => import('../views/emission/EmissionFactorList')),
        meta: {
          title: I18N.carbonFootprint.organizationalFactorLibrary,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.emissionOrganizationDetail,
            component: lazy(
              () => import('../views/emission/EmissionFactorDetail'),
            ),
            meta: {
              title: I18N.router.organizationalFactorLibrary,
              icon: 'read',
            },
          },
          {
            path: RouteMaps.emissionOrganizationAdd,
            component: lazy(
              () => import('../views/emission/EmissionFactorAdd'),
            ),
            meta: {
              title: I18N.router.addOrganizationalReason,
              icon: 'read',
            },
          },
          {
            path: RouteMaps.emissionOrganizationEdit,
            component: lazy(
              () => import('../views/emission/EmissionFactorEdit'),
            ),
            meta: {
              title: I18N.router.editingOrganizationalReasons,
              icon: 'read',
            },
          },
        ],
      },
      {
        path: RouteMaps.searchFactors,
        meta: {
          title: I18N.router.searchForMoreRows,
        },
        component: lazy(() => import('../views/emission/SearchFactors/index')),
      },
      {
        path: RouteMaps.emissionCarbonStop,
        component: lazy(() => import('../views/emission/carbonStop/index')),
        meta: {
          title: I18N.router.carbonHindranceFactor,
          icon: 'read',
        },
        children: [
          {
            path: RouteMaps.emissionCarbonStopDetail,
            component: lazy(() => import('../views/emission/Show/index')),
            meta: {
              title: I18N.router.viewCarbonFootprint,
              icon: 'read',
            },
          },
        ],
      },
    ],
  },
  {
    path: RouteMaps.homeProductOrder,
    meta: {
      title: I18N.router.productServices,
    },
    children: [
      {
        path: RouteMaps.homeProductOrderServiceCenter,
        component: lazy(
          () => import('../views/system/productService/orderServiceCenter'),
        ),
        meta: {
          title: I18N.system.serviceCenter,
        },
      },
      {
        path: RouteMaps.homeProductOrderRecord,
        component: lazy(
          () => import('../views/system/productService/orderRecord'),
        ),
        meta: {
          title: I18N.system.orderRecords,
        },
      },
      {
        path: RouteMaps.homeInvoiceManagement,
        component: lazy(
          () => import('../views/system/productService/invoiceManagement'),
        ),
        meta: {
          title: I18N.system.controlOverInvoices,
        },
        children: [
          {
            path: RouteMaps.homeInvoiceManagementNotice,
            component: lazy(
              () =>
                import(
                  '../views/system/productService/invoiceManagement/notice'
                ),
            ),
            meta: {
              title: I18N.system.invoicingNotice,
            },
          },
          {
            path: RouteMaps.homeInvoiceManagementApplyForInvoice,
            component: lazy(
              () =>
                import(
                  '../views/system/productService/invoiceManagement/applyForInvoice'
                ),
            ),
            meta: {
              title: I18N.components.applyForInvoice,
            },
          },
        ],
      },
      {
        path: RouteMaps.homeOpenPlatform,
        component: lazy(
          () => import('../views/system/productService/openPlatform/index'),
        ),
        meta: {
          title: I18N.components.openPlatform,
        },
      },
    ],
  },
  {
    path: RouteMaps.dashboradSettings,
    meta: {
      title: I18N.router.systemSettings,
    },
    children: [
      {
        path: RouteMaps.datasAuth,
        component: lazy(() => import('../views/system/settings/DatasAuth')),
        meta: {
          title: I18N.router.dataPermissionManagement,
        },
      },
      {
        path: RouteMaps.actionsLog,
        component: lazy(() => import('../views/system/settings/ActionsLog')),
        meta: {
          title: I18N.system.operationLog,
        },
      },
    ],
  },
  // 产品碳足迹3.0版本
  ...carbonFootprint3,
  // 碳核算通用版
  ...enterpriseCarbonAccountForInternationalRoutes,
  // 供应链碳管理
  // ...supplyChainRoutes,

  // 绿色会议
  ...greenMeetingRoutes,
  // 咨询服务
  {
    path: RouteMaps.consultingServe,
    meta: {
      title: I18N.router.consultingService,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('../views/consulting/index')),
    children: [
      {
        path: RouteMaps.consultingindustrial,
        meta: {
          title: I18N.consulting.carbonEmissionCalculation,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('../views/consulting/index')),
        children: [
          {
            path: RouteMaps.consultingindustrial,
            meta: {
              title: I18N.consulting.industrialWastewaterCarbon,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('../views/consulting/index')),
          },
          {
            path: RouteMaps.consultingheat,
            meta: {
              title: I18N.consulting.outsourcedThermalCarbon,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('../views/consulting/index')),
          },
          {
            path: RouteMaps.consultingbusiness,
            meta: {
              title: I18N.consulting.aircraftTravelCarbon2,
              icon: 'DashboardOutlined',
            },
            component: lazy(() => import('../views/consulting/index')),
          },
        ],
      },
    ],
  },
  // 认证服务
  ...certificationServicesRoutes,
  // // 建筑碳核算
  // ...buildingCarbonAccountRoutes,
  // 碳中和
  ...carbonNeutralizationRoutes,
  // 碳数据管理
  ...carbonDatasRoutes,
  // 碳账户
  ...carbonAccountRoutes,
  // 企业碳核算2.0
  ...enterPriceCarbonAccountRoutes,
  // 供应链碳管理2.0
  ...supplyChain2Routes,
  ...CCDBRoutes,
  ...carbonFootprintLCARoute,
  ...carbonFootprintLCANewRoute,
  ...ESGRoutes,
  ...QuestionnaireRoutes,
];
const routes: Routes[] = [
  {
    path: RouteMaps.carbonAgentTeam,
    exact: false,
    auth: false,
    component: lazy(() => import('../views/system/carbonAgent/team')),
    meta: { title: 'Carbon Agent 团队管理' },
  },
  {
    path: RouteMaps.carbonAgentOAuthAuthorize,
    auth: false,
    component: lazy(
      () => import('../views/system/carbonAgent/ccdb/OAuthAuthorizePage'),
    ),
    meta: {
      title: 'Carbon Agent OAuth',
    },
  },
  {
    path: RouteMaps.carbonAgentDeviceAuthorize,
    auth: false,
    component: lazy(
      () => import('../views/system/carbonAgent/ccdb/DeviceAuthorizationPage'),
    ),
    meta: {
      title: 'Carbon Agent Device Authorization',
    },
  },
  {
    path: RouteMaps.carbonAgentSsoCallback,
    auth: false,
    component: lazy(() => import('../views/system/agentSsoCallback')),
    meta: {
      title: 'Carbon Agent SSO',
    },
  },
  {
    path: RouteMaps.carbonAgentProjectInvite,
    auth: false,
    component: lazy(
      () => import('../views/system/carbonAgent/ProjectInviteRedirect'),
    ),
    meta: {
      title: 'Carbon Agent Project Invite',
    },
  },
  {
    path: RouteMaps.carbonAgentFeishuSimulator,
    auth: false,
    component: lazy(
      () => import('../views/system/carbonAgent/FeishuGroupSimulatorPage'),
    ),
    meta: {
      title: 'Feishu Group Data Collection Simulator',
    },
  },
  {
    path: RouteMaps.carbonAgentShare,
    auth: false,
    component: lazy(() => import('../views/system/carbonAgent')),
    meta: {
      title: 'Carbon Agent Share',
    },
  },
  {
    path: RouteMaps.carbonAgentFactor,
    auth: false,
    component: lazy(() => import('../views/system/carbonAgent')),
    meta: {
      title: 'CCDB Factor - Carbon Agent',
    },
  },
  // 登录、注册、
  {
    path: '/system',
    meta: {
      title: I18N.router.systemRouting,
    },
    redirect: RouteMaps.login,
    children: [
      {
        path: RouteMaps.login,
        component: lazy(() => import('../views/system/login')),
        meta: {
          title: I18N.router.carbonCloudLogin,
        },
      },
      {
        path: RouteMaps.scanLogin,
        component: lazy(() => import('../views/system/ScanLogin')),
        meta: {
          title: I18N.router.carbonCloudLogin,
        },
      },
      {
        path: RouteMaps.carbonAgent,
        component: lazy(() => import('../views/system/carbonAgent')),
        meta: {
          title: 'Carbon Agent',
        },
      },
      {
        path: '/system/agreement',
        component: lazy(() => import('../views/system/argument/index')),
        meta: {
          title: I18N.system.serviceAgreement,
        },
      },
      {
        path: '/system/server-agreement',
        component: lazy(() => import('../views/system/argument/index')),
        meta: {
          title: I18N.router.privacyPolicy,
        },
      },
    ],
  },
  {
    path: RouteMaps.account,
    component: lazy(() => import('../views/system/account')),
    meta: {
      title: I18N.router.organizationalList,
    },
    children: [
      {
        path: RouteMaps.newOrganization,
        component: lazy(() => import('@src/views/system/account/New')),
        meta: {
          title: I18N.router.createAnOrganization,
        },
      },
      {
        path: RouteMaps.accountSettions,
        component: lazy(() => import('@src/views/system/account/New')),
        meta: {
          title: I18N.workbench.setUp,
        },
      },
    ],
  },
  {
    path: RouteMaps.inviteLink,
    meta: {
      title: I18N.router.invitationLink,
    },
    component: lazy(
      () => import('@src/views/becomeSupplierOrPurchasing/InviteLink'),
    ),
  },
  {
    path: '/agreement',
    meta: {
      title: I18N.router.privacyPolicy,
    },
    component: lazy(() => import('../views/agreement/index')),
  },
  {
    path: '/',
    component: lazy(() => import('../layout/index')),
    meta: {
      title: I18N.router.system,
    },
    redirect: RouteMaps.login,
    children: [
      ...menuRoutes(),
      {
        path: RouteMaps.NoOrder,
        component: lazy(() => import('../views/notOrder')),
        meta: {
          title: I18N.router.thereAreCurrentlyNoOrdersAvailable,
        },
      },
      {
        path: RouteMaps.NoOnline,
        component: lazy(() => import('../views/notOnline/index')),
        meta: {
          title: I18N.router.notYetOnline,
        },
      },
      {
        path: '/error',
        meta: {
          title: I18N.router.errorPage,
        },
        redirect: RouteMaps.notFound,
        children: [
          {
            path: RouteMaps.notFound,
            auth: false,
            component: lazy(() => import('../views/error/404')),
            meta: {
              title: I18N.router.pageDoesNotExist,
            },
          },
          {
            path: RouteMaps.notPermission,
            auth: false,
            component: lazy(() => import('../views/error/403')),
            meta: {
              title: I18N.carbonAccount.noPermissionTemporarily,
            },
          },
        ],
      },
      {
        path: '/*',
        meta: {
          title: I18N.router.errorPage,
        },
        redirect: RouteMaps.notFound,
      },
    ],
  },
];

export default routes;

/**
 * carbonFootprint3FootprintAccountShare: Boss产品碳足迹分享页面
 * carbonFootprint3FootprintAccountShareBossModel: Boss产品碳足迹分享详情页 - Boss模型相关
 * carbonFootprint3FootprintAccountShareLogin: SaaS 产品碳足迹分享页面
 */
export const routeWhiteList = [
  'supplierBindTransfer',
  'carbonFootprint3FootprintAccountShare',
  'carbonFootprint3FootprintAccountShareBossModel',
  'carbonFootprint3FootprintAccountShareLogin',
  'enterpriseCarbonAccountingcarbonDischargeShare',
  'enterpriseCarbonAccountingAccountingShare',
  'enterpriseTaskFill',
  'questionnaireFill',
  'ESGImportanceAnalysisFill',
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail,
  'enterpriseApprovalNoLogin',
];
