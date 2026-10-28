/*
 * @@description:首页入口
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-15 11:13:20
 */

import { Suspense, useEffect, useState } from 'react';
import { connect, useDispatch, useSelector } from 'react-redux';
import './index.less';

import ErrorBoundary from '@src/components/ErrorBoundary';
// import { ScrollMessage } from '@src/components/LayoutNavBar/ScrollMessage';
import BreadcrumbUtil from '@src/components/UI/Breadcrumb';
import { RouteMaps } from '@src/router/route-paths';
import { RootState } from '@src/store';
import { checkIsMobile, useCheckHomeRouterChange } from '@src/utils';
import { updateSideBar, AppState } from '@store/module/app';
import { Spin, Layout as AntdLayout } from 'antd';
import classnames from 'classnames';
import { matchPath, useHistory } from 'react-router-dom';
import { SwitchoverCompanyData } from '@src/api/types';

import { RouteMapsCorbonFootprint3 } from '@/router/route-paths/corbonFootprint3';
import { SET_COMPANY_USER_INFO } from '@/store/actionTypes';
import { CompanyUserInfoAction } from '@/store/module/user';

import MainRoutes from './MainRoutes';
import style from './index.module.less';
import {
  postUserAllPermissions,
  getUserIdentity,
  getUserCompanyType,
} from './servers';
// import { LayoutHeader } from '../components/LayoutHeader';
import LayoutSideBar from '../components/LayoutSideBar/index';
import { Settings } from '../store/module/settings';

import { useMount } from 'ahooks';

const { Content, Sider } = AntdLayout;

interface LayoutProps extends AppState {
  layout: Settings['layout'];
  colorWeak: boolean;
  ActionUpdateSideBar: (sidebar: AppState['sidebar']) => void;
}

export type ItemType = {
  auth?: string;
  base?: number;
  component?: string;
  createBy?: string;
  createTime?: string;
  delflag?: number;
  firstStage?: string;
  icon: string;
  id: number | null;
  isCache?: number;
  cache: boolean;
  orderNum: number;
  is_link: boolean;
  parentId: number;
  ident: string;
  path?: string;
  permissionId?: number;
  permissionName: string;
  perms?: string;
  query?: string;
  remark?: string;
  type?: string;
  updateBy?: string;
  creator: string;
  is_need_id: boolean;
  hidden: boolean;
  kind: number;
  name: string;
  update_time: string;
  title: string;
  creator_name: string;
  component_path: string;
  creator_dept_id: number;
  creator_organization_id: number;
  description: string;
  updateTime?: string;
  creator_post_id: number;
  visible: boolean;
  children?: ItemType[];
  web_path: string;
  web_id?: number;
  new_id: number;
  isFrame: boolean;
  status: boolean;
  tree_path: string;
  create_time: string;
};

const NO_PADDING_ROUTES = [
  RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
  RouteMaps.enterpriseCarbonAccountingTaskList,
  RouteMaps.enterpriseCarbonAccountingOrgReport,
  RouteMaps.CCDBHome,
  RouteMaps.CCDBSearch,
  RouteMaps.CCDBCollect,
  RouteMaps.enterpriseCarbonAccountingReducingPlan,
  RouteMaps.enterpriseCarbonAccountingAccounting,
  RouteMaps.enterpriseCarbonAccountingPom,
  RouteMaps.workIndex,
  RouteMaps.workArticleDetail,
  RouteMaps.broadcast,
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail,
  '/carbonNeutral/service',
];

const NO_WRAPPER_ROUTES = [
  RouteMaps.workIndex,
  RouteMaps.workArticleDetail,
  RouteMaps.broadcast,
  '/carbonNeutral/service',
];

/** 不需要自动生成面包屑的页面 */
const removeBreadCrumbs: string[] = [
  RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail,
  RouteMaps.CarbonFootprintCertificationProjectApplay,
];

const Layout = (props: LayoutProps) => {
  useCheckHomeRouterChange();
  // 监听页面压缩
  // 找出父节点
  // 获取顶级组织
  const [menuData, setMenuData] = useState<ItemType[]>([]);
  /** 需要自动生成面包屑的产品-根据路径上的唯一标识进行区分，例如产品碳足迹：carbonFootprint，只有包含carbonFootprint才会显示面包屑 */
  const [needBreadcrumbUtil, setNeedBreadcrumbUtil] = useState<boolean>(false);
  const historylist = [
    '/carbonemissioncalculator/industrial',
    '/carbonemissioncalculator/heat',
    '/carbonemissioncalculator/business',
    '/Certification/Enterprise/product/detail',
    '/Certification/Product/product/edit',
    '/Certification/Product/product/detail',
    '/Certification/Enterprise/product/submissions',
    '/Certification/Product/index',
    '/Certification/Enterprise/product/edit',
    '/Certification/Product/product/edit',
    '/Certification/Product/product/submissions',
  ]; // 此处判断需不需要背景色及padding
  const headerList = (data: ItemType[]) =>
    data?.filter((x: ItemType) => x.parentId === 0);
  function findChildren(parentId: number | null, MenuData: ItemType[]) {
    return MenuData.filter(
      (x: ItemType) => Number(x?.parentId) === Number(parentId),
    );
  }
  const findAncestryByPath = (data: ItemType[]) => {
    const headerDate = headerList(data)?.sort(
      (obj1, obj2) => obj1.orderNum - obj2.orderNum,
    );
    (function filterData(MenuData: ItemType[]) {
      MenuData?.forEach((atem: ItemType) => {
        const children = findChildren(Number(atem.permissionId), data)?.sort(
          (obj1, obj2) => obj1.orderNum - obj2.orderNum,
        );
        filterData(children);
        atem.children = findChildren(Number(atem.permissionId), data)?.sort(
          (obj1, obj2) => obj1.orderNum - obj2.orderNum,
        );
      });
    })(headerDate);
    return headerDate;
  };
  const history = useHistory();
  // 监听 页面放缩
  useState(() => {
    window.addEventListener('resize', () => {
      if (document.body.clientWidth < 1140) {
        props.ActionUpdateSideBar({
          ...props.sidebar,
          opened: false,
        });
      }
    });
  });
  const selector = useSelector<RootState, RootState['companyUserInfo']>(
    s => s.companyUserInfo,
  );

  const dispatch = useDispatch();

  useMount(async () => {
    if (!selector.userInfo?.companyId) {
      return;
    }
    // 同时请求用户权限和用户身份信息
    const [result, identityResult, companyTypeResult] = await Promise.all([
      postUserAllPermissions(),
      getUserIdentity(),
      getUserCompanyType(),
    ]);
    const permissionSet = result.data?.data?.userInfo?.permissionSet || [];
    const userInfo = result.data?.data?.userInfo || {};
    const companyType = companyTypeResult?.data?.data?.companyType || '1';

    // 将 userDemo 值合并到 userInfo 中
    if (identityResult.data?.code === 200 && identityResult.data?.data) {
      userInfo.userDemo = identityResult.data.data.userDemo;
      userInfo.companyType = companyType;
    }

    dispatch<CompanyUserInfoAction>({
      type: SET_COMPANY_USER_INFO,
      payload: {
        ...selector,
        userInfo,
      } as SwitchoverCompanyData,
    });
    if (permissionSet) {
      const arr = findAncestryByPath(permissionSet as unknown as ItemType[]);
      setMenuData([...arr]);
    }
  });
  useEffect(() => {
    // 获取 目录
    const needArr = [
      /** 指定前缀项目添加面包屑 */
      'carbonFootprint',
      'homeProductService',
      'supplyChain',
      /** 指定页面添加面包屑 */
      /** 企业碳核算 - 逐步介入中 */
      RouteMaps.enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo,
      'emission/organization',
    ];
    const { href, pathname } = location;
    // 每一个需要面包屑的数据都要进行判断区分,只要关键标识匹配上，就会展示面包屑

    setNeedBreadcrumbUtil(
      needArr.some(
        route =>
          href.includes(route) ||
          !!matchPath(pathname, {
            exact: true,
            path: route,
          }),
      ) && !removeBreadCrumbs.includes(history.location.pathname),
    );
  }, [selector?.userInfo?.permissionSet, history.location.pathname]);
  return (
    <AntdLayout hasSider>
      {/* <LayoutHeader /> */}
      <Sider
        width={checkIsMobile() ? 0 : 212}
        style={{ zIndex: 100 }}
        collapsed={false}
        collapsedWidth={60} // Matches closer to the image
        trigger={null}
      >
        <LayoutSideBar allrouter={menuData || []} />
      </Sider>
      <Content>
        <section
          className={classnames({
            layout: true,
            'layout--side-bar': props.layout === 'side',
            'layout--weak': props.colorWeak,
          })}
        >
          <section
            className={classnames('layout__main', {
              [style.noPadding]: NO_PADDING_ROUTES.some(
                noPaddingRoute => noPaddingRoute === history.location.pathname,
              ),
            })}
            style={{
              overflow: ['/carbonDataManagemen/overview'].some(
                item => history.location.pathname.indexOf(item) >= 0,
              )
                ? 'auto'
                : 'hidden',
            }}
          >
            {needBreadcrumbUtil && <BreadcrumbUtil />}
            <div
              className={classnames(
                'layout__container',
                ['/carbonDataManagemen/overview'].some(
                  item => history.location.pathname.indexOf(item) >= 0,
                )
                  ? ''
                  : style.layoutContainer,
                {
                  [style.noWrapper]: NO_WRAPPER_ROUTES.some(
                    noPaddingRoute =>
                      noPaddingRoute === history.location.pathname,
                  ),
                },
              )}
              style={{
                background:
                  historylist.filter(
                    (item: string) => item === history.location.pathname,
                  ).length > 0
                    ? 'rgba(0,0,0,0)'
                    : '',
                padding:
                  historylist.filter(
                    (item: string) => item === history.location.pathname,
                  ).length > 0
                    ? '0px'
                    : '',
              }}
            >
              <Suspense
                fallback={
                  <div className={style.center}>
                    <Spin delay={200} size='large' />
                  </div>
                }
              >
                {/* 主路由 */}
                <ErrorBoundary boundaryName='layout_boundary'>
                  <MainRoutes />
                </ErrorBoundary>
              </Suspense>
            </div>
          </section>
        </section>
      </Content>
    </AntdLayout>
  );
};

export default connect(
  ({ settings: { layout, colorWeak }, app }: RootState) => ({
    layout,
    colorWeak,
    sidebar: app.sidebar,
  }),
  {
    ActionUpdateSideBar: updateSideBar,
  },
)(Layout);
