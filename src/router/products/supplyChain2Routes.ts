/*
 * @@description:建筑碳核算
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-22 10:51:54
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-30 14:34:38
 */
import I18N from '@src/lang/I18N';
import { lazy } from 'react';

import { RouteMapsSupplyChain2 } from '../route-paths/supplyChain2';

export const supplyChain2Routes = [
  {
    path: RouteMapsSupplyChain2.supplyChainIntroduce,
    component: lazy(() => import('@src/views/supplyChain2/home')),
    meta: {
      title: I18N.router.productIntroduction,
      icon: 'DashboardOutlined',
    },
  },
  {
    path: RouteMapsSupplyChain2.supplyChainSupplierManage,
    redirect: RouteMapsSupplyChain2.supplyChainIntroduce,
    meta: {
      title: I18N.supplyChain2.supplierManagement,
      icon: 'DashboardOutlined',
    },
  },

  {
    path: RouteMapsSupplyChain2.supplyChainManagement,
    meta: {
      title: () => I18N.notOrder.supplyChainManagement,
      icon: 'DashboardOutlined',
    },
    component: lazy(() => import('@src/views/supplyChain/Management')),
    children: [
      {
        // 为了兼容面包屑的实现逻辑，这里多嵌套一层
        path: RouteMapsSupplyChain2.supplyChainManagement,
        meta: {
          title: () => I18N.notOrder.supplyChainManagement,
          icon: 'DashboardOutlined',
        },
        component: lazy(() => import('@src/views/supplyChain/Management')),
        children: [
          {
            path: RouteMapsSupplyChain2.supplyChainSupplierAddition,
            meta: {
              title: () => I18N.router.invitingSuppliers,
            },
            component: lazy(() => import('@src/views/supplyChain/Supplier')),
          },
          {
            path: RouteMapsSupplyChain2.supplyChainSupplierDetails,
            meta: {
              title: () => I18N.supplyChain2.supplierDetails,
            },
            component: lazy(() => import('@src/views/supplyChain/Supplier')),
          },
          {
            path: RouteMapsSupplyChain2.supplyChainSupplierImport,
            meta: {
              title: () => I18N.supplyChain2.importSuppliers,
            },
            component: lazy(
              () => import('@src/views/supplyChain/SupplierImport'),
            ),
          },
        ],
      },
    ],
  },
  {
    path: RouteMapsSupplyChain2.supplyChainProduct,
    meta: {
      title: () => I18N.carbonFootprint3.purchasingProducts,
    },
    component: lazy(() => import('@src/views/supplyChain/ProductList')),
    children: [
      {
        path: RouteMapsSupplyChain2.supplyChainProduct,
        meta: {
          title: () => I18N.carbonFootprint3.purchasingProducts,
        },
        component: lazy(() => import('@src/views/supplyChain/ProductList')),
        children: [
          {
            path: RouteMapsSupplyChain2.supplyChainPurchaseProductAddition,
            meta: {
              title: () => I18N.supplyChain2.newlyAddedProcurementProducts,
            },
            component: lazy(
              () => import('@src/views/supplyChain/PurchaseProduct'),
            ),
          },
          {
            path: RouteMapsSupplyChain2.supplyChainPurchaseProductDetails,
            meta: {
              title: () => I18N.supplyChain2.productDetailsForProcurement,
            },
            component: lazy(
              () => import('@src/views/supplyChain/PurchaseProduct'),
            ),
          },
          {
            path: RouteMapsSupplyChain2.supplyChainPurchaseProductImport,
            meta: {
              title: () => I18N.supplyChain2.importProcurementProducts,
            },
            component: lazy(
              () => import('@src/views/supplyChain/PurchaseProductImport'),
            ),
          },
        ],
      },
    ],
  },
  {
    path: RouteMapsSupplyChain2.supplyChainCarbonDataFillList,
    meta: {
      title: () => I18N.supplyChain2.carbonDataReporting,
    },
    component: lazy(() => import('@src/views/supplyChain/FillList')),
    children: [
      {
        path: RouteMapsSupplyChain2.supplyChainCarbonDataFillList,
        meta: {
          title: () => I18N.supplyChain2.carbonDataReporting,
        },
        component: lazy(() => import('@src/views/supplyChain/FillList')),
        children: [
          {
            path: RouteMapsSupplyChain2.supplyChainCarbonDataFillInfo,
            meta: {
              title: () => I18N.supplyChain.fillInDetails,
            },
            component: lazy(() => import('@src/views/supplyChain/FillInfo')),
          },
        ],
      },
    ],
  },
  {
    path: RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
    meta: {
      title: () => I18N.supplyChain.fillInTheTask,
    },
    component: lazy(() => import('@src/views/supplyChain/TaskList')),
    children: [
      {
        path: RouteMapsSupplyChain2.supplyChainCarbonDataTaskList,
        meta: {
          title: () => I18N.supplyChain.fillInTheTask,
        },
        component: lazy(() => import('@src/views/supplyChain/TaskList')),
        children: [
          {
            path: RouteMapsSupplyChain2.supplyChainCarbonDataTaskInfo,
            meta: {
              title: () => I18N.supplyChain.fillInDetails,
            },
            component: lazy(() => import('@src/views/supplyChain/TaskInfo')),
          },
        ],
      },
    ],
  },
  {
    path: RouteMapsSupplyChain2.supplyChainClientList,
    meta: {
      title: () => I18N.router.customerList,
    },
    component: lazy(() => import('@src/views/supplyChain/ClientList')),
  },
];
