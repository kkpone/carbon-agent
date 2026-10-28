/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-02-03 09:34:11
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-09 15:45:34
 */
import { BreadcrumbRoute } from '@src/components/UI/Breadcrumb/type';
import { ItemType } from '@src/layout';
import { RootState } from '@src/store';
import { NavState } from '@src/store/module/nav';
import { shakingObj } from '@src/utils';
import { StatisticProps } from '@src/utils/types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { matchPath, useLocation } from 'react-router-dom';

import routes, { menuRoutes, Routes } from './config';
import { stripLocalePrefixFromPathname } from './localePath';
import { FlattenRoutes } from './type';
import config from '../config';
import I18N from '@src/lang/I18N';

/**
 *
 * 将路由转换为一维数组
 * @param routeList 路由
 * @param deep 是否深层转化
 * @param auth 路由是否需要检查授权, 路由配置的auth优先级比这里高
 */

export function flattenRoute(
  routeList: Routes[],
  deep: boolean,
  auth?: boolean,
  parent?: FlattenRoutes,
): FlattenRoutes[] {
  const result: FlattenRoutes[] = [];

  for (let i = 0; i < routeList.length; i += 1) {
    const route = routeList[i];
    const routeWithParent = {
      ...route,
      auth: route.auth ?? !!auth,
      parent,
    };
    result.push(routeWithParent);
    if (route.children && deep) {
      result.push(...flattenRoute(route.children, deep, auth, routeWithParent));
    }
  }

  return result;
}

/**
 * 获取没有权限的路由
 */
function getLayoutRouteList(): Routes[] {
  const noAuthRoutes = flattenRoute(
    routes?.map(r => {
      // 业务权限路由都在path 为 '/' 的 children 中
      if (r.path === '/') {
        return { ...r, children: [] };
      }
      return r;
    }),
    true,
    false,
  );

  return noAuthRoutes;
}

function getBusinessRouteList(): FlattenRoutes[] {
  const routeList = routes.filter(route => route.path === '/');

  if (routeList.length > 0) {
    return flattenRoute(routeList, true, true);
  }
  return [];
}

/**
 * 这里会将 config 中所有路由解析成三个数组
 * 第一个: 最外层的路由，例如  Layout UserLayout ...
 * 第二个: 系统路由, 例如 Login Register RegisterResult
 * 第三个: 业务路由，为 / 路由下的业务路由
 */

export const layoutRouteList = getLayoutRouteList();

export const businessRouteList = getBusinessRouteList();

function findRoutesByPaths(
  pathList: string[],
  routeList: Routes[],
  basename?: string,
): Routes[] {
  return routeList.filter(
    (child: Routes) => pathList.indexOf((basename || '') + child.path) !== -1,
  );
}

export const getRouteTitle = (route?: BreadcrumbRoute) => {
  if (!route) return '';
  return typeof route.meta.title === 'function'
    ? route.meta.title(route.currentHref)
    : route.meta.title;
};

function getPagePathList(pathname?: string): string[] {
  const routePathname = stripLocalePrefixFromPathname(
    pathname || window.location.pathname,
  );
  const pathnameWithBasename = config.BASENAME
    ? `${config.BASENAME}${routePathname}`
    : routePathname;

  return pathnameWithBasename
    .split('/')
    .filter(Boolean)
    .map((value, index, array) =>
      '/'.concat(array.slice(0, index + 1).join('/')),
    );
}

/**
 * 只有业务路由会有面包屑
 */
export function getBreadcrumbs(): Routes[] {
  return findRoutesByPaths(
    getPagePathList(),
    businessRouteList,
    config.BASENAME,
  );
}
/** 扁平化的业务菜单路由 */
export const FlattedMenuRoutes = () => flattenRoute(menuRoutes(), true);

type MatchRoute<T> = {
  matchLen: number;
  route: ChildRoutes<T>[];
};

// 计算最佳匹配的路由
export const caculateCheckedMenu = <T extends Routes | ItemType>(
  routerTree: T[],
  pathName: string,
) => {
  if (!routerTree?.length || !(typeof pathName === 'string')) return [];
  const pathNameArr = pathName.split('/').filter(Boolean);
  const pathNameArrLength = pathNameArr.length;
  const childRoutes = getFlatedRoutes<T>(routerTree, []);
  let matchRoute: MatchRoute<T> = {
    matchLen: 0,
    route: [],
  };
  childRoutes.forEach(route => {
    // eslint-disable-next-line
    let pathArr = route.path?.split('/') || [];
    pathArr = pathArr.filter(Boolean);
    const pathLength = pathArr.length;
    // todo 需要fix 路由最后是可选参数的情况，可能有连续多个可选参数
    if (
      pathLength === pathNameArrLength ||
      (pathLength - 1 === pathNameArrLength &&
        pathArr[pathLength - 1].endsWith('?'))
    ) {
      let matchLen = 0;
      for (let i = 0; i < pathNameArrLength; i += 1) {
        if (pathArr[i] === pathNameArr[i]) {
          matchLen += 1;
        }
      }

      if (matchLen >= matchRoute.matchLen) {
        matchRoute = {
          matchLen,
          route:
            matchLen > matchRoute.matchLen
              ? [route]
              : [...matchRoute.route, route],
        };
      }
    }
  });
  if (!matchRoute?.route?.[0]) return [undefined, undefined];
  const { $$$keyMap, ...matchRoutes } = matchRoute.route[0];
  return [$$$keyMap, matchRoutes] as const;
};

type ChildRoutes<T> = {
  $$$keyMap?: number[];
} & T;

// 获取所有的子路由
export const getFlatedRoutes = <T extends Routes | ItemType>(
  routeTree: ChildRoutes<T>[],
  childRoutes?: ChildRoutes<T>[],
  $$$keyMap?: number[],
): ChildRoutes<T>[] => {
  let routes = childRoutes || [];
  const nowKeyArr = $$$keyMap || [];
  routeTree.forEach((route, index) => {
    if (!route?.children?.length) {
      routes.push({
        $$$keyMap: [...nowKeyArr, index],
        ...route,
      });
    } else {
      routes = routes.concat(
        [{ ...route, $$$keyMap: [...nowKeyArr, index] }],
        // @ts-ignore
        getFlatedRoutes<T>(route.children, [], [...nowKeyArr, index]),
      );
    }
  });

  return routes;
};

/** 系统所有的路由 */
const allFlattenRoutes = getFlatedRoutes(routes, []);

/** 获取当前匹配的路由 */
const useMatchedRoute = () => {
  const location = useLocation();

  const matchRoute = useMemo(() => {
    const match = allFlattenRoutes.find(
      r => !!matchPath(location.pathname, { ...r, exact: true }),
    );

    return match;
  }, [location.pathname]);
  return [matchRoute, location, routes] as const;
};

const usePermissionMenuMatch = () => {
  const userInfo = useSelector<
    RootState,
    RootState['companyUserInfo']['userInfo']
  >(s => s.companyUserInfo.userInfo);
  const permissionMenu = userInfo.permissionSet || [];
  const location = useLocation();
  const { companyId, userId } = userInfo;
  const matchRoute = useMemo(() => {
    if (permissionMenu?.length) {
      const match = permissionMenu.find(
        r => !!matchPath(location.pathname, { ...r, exact: true }),
      );

      return match;
    }
    return null;
  }, [location.pathname, permissionMenu]);

  return { companyId, userId, matchRoute, location };
};

/** 获取当前产品 */
const useGetCurrentProduct = () => {
  const { currentNav, productId } = useSelector<
    RootState,
    RootState['products']
  >(s => s.products);
  const navs = useSelector<RootState, RootState['Nav']>(s => s.Nav);

  const { currentProductType, currentProduct, tabName } = useMemo(() => {
    let currentProd: NavState | null = null;
    const currentActive = navs.find(n => `${n.id}` === `${currentNav}`);
    const children = currentActive?.children;
    const type = children?.find(tp =>
      tp.children?.some(prod => {
        if (`${prod.id}` === `${productId}`) {
          currentProd = prod;
          return true;
        }
        return false;
      }),
    );

    return {
      tabName: currentActive?.name,
      currentProductType: type,
      currentProduct: currentProd as NavState | null,
    };
  }, [currentNav, navs]);

  return { productId, currentProductType, currentProduct, tabName };
};

/** 获取统计需要的 pageName & ProductType */
export const useGetStatisticInfo = () => {
  const [matched] = useMatchedRoute();
  const permissionMatch = usePermissionMenuMatch();
  const prod = useGetCurrentProduct();
  const statisticValue: StatisticProps = useMemo(
    () =>
      shakingObj({
        ...permissionMatch,
        pageName:
          permissionMatch.matchRoute?.permissionName || matched?.meta?.title,
        productType: `${prod.currentProductType?.name || ''}_${
          prod.currentProduct?.name || ''
        }`,
        href: window.location.href,
        matchRoute: null,
        location: null,
      }),
    [permissionMatch.location],
  );
  return [statisticValue, permissionMatch.location] as const;
};
export const initCarbonData = [
  {
    w: 6,
    h: 3,
    x: 0,
    y: 0,
    i: '0-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 0,
    i: '0-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 0,
    y: 4,
    i: '1-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 4,
    i: '2-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    // 减排量趋势图
    w: 12,
    h: 3,
    x: 0,
    y: 10,
    i: '3-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 0,
    y: 10,
    i: '3-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 0,
    y: 11,
    i: '4-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 6,
    y: 11,
    i: '4-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 0,
    y: 12,
    i: '5-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 6,
    y: 12,
    i: '5-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 0,
    y: 14,
    i: '7-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 6,
    y: 14,
    i: '7-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 0,
    y: 15,
    i: '8-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 15,
    i: '8-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 18,
    i: '9-0',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 0,
    y: 21,
    i: '10-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 21,
    i: '10-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 24,
    i: '11-0',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 27,
    i: '12-0',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
];
export const initCarbonDataSearch = {
  '2-1': '1',
  '3-1': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '3-2': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '4-1': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '5-3': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '7-1': '1',
  '7-2': '1',
  '8-1': '1',
  '8-2': '1',
  strengthType: 1,
  strengthYear: 2022,
  strengthNorm: null,
  isAdd: 0,
};
export const initCarbonEmployData = [
  {
    w: 6,
    h: 1,
    x: 0,
    y: 0,
    i: '0-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 6,
    y: 0,
    i: '0-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 1,
    i: '1-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 4,
    i: '2-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 0,
    y: 7,
    i: '3-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 7,
    i: '3-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 10,
    i: '4-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 4,
    h: 1,
    x: 0,
    y: 13,
    i: '5-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 4,
    h: 1,
    x: 4,
    y: 13,
    i: '5-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 4,
    h: 1,
    x: 8,
    y: 13,
    i: '5-3',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 0,
    y: 14,
    i: '7-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 1,
    x: 6,
    y: 14,
    i: '7-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 0,
    y: 15,
    i: '8-1',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 6,
    h: 3,
    x: 6,
    y: 15,
    i: '8-2',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 18,
    i: '9-0',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
  {
    w: 12,
    h: 3,
    x: 0,
    y: 21,
    i: '10-0',
    moved: false,
    static: false,
    isDraggable: false,
    isResizable: true,
  },
];
export const initCarbonEmploySearchData = {
  '0-1': '1',
  '0-2': '1',
  '1-1': '1',
  '2-1': '1',
  '3-1': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '3-2': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '4-1': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '5-3': '1', // 1 本月 2近三月 3 今年以来 4 历史以来
  '7-1': '1',
  '7-2': '1',
  '8-1': '1',
  '8-2': '1',
  '10-2': '1',
  strengthType: 1,
  strengthYear: 2022,
  strengthNorm: null,
  isAdd: 0,
};

/** 页面状态 */
enum PageTypeInfo {
  /** 新增 */
  'add' = 'add',
  /** 编辑 */
  'edit' = 'edit',
  /** 详情 */
  'show' = 'show',
  /** 复制 */
  'copy' = 'copy',
}

/** （新增、编辑、详情）页面标题自动生成 */
export const routeTypeNameRender = (
  titleMap: Record<PageTypeInfo, string> | string,
) => {
  const { pathname } = window.location;
  let usedMap: Record<PageTypeInfo, string>;
  if (typeof titleMap === 'string') {
    usedMap = {
      [PageTypeInfo.add]: I18N.template(I18N.router.addTit, { val1: titleMap }),
      [PageTypeInfo.show]: I18N.template(I18N.router.title, { val1: titleMap }),
      [PageTypeInfo.edit]: I18N.template(I18N.router.editTit, {
        val1: titleMap,
      }),
      [PageTypeInfo.copy]: I18N.template(I18N.router.copyTit, {
        val1: titleMap,
      }),
    };
  } else usedMap = titleMap;
  return pathname.includes(`/${PageTypeInfo.add}`)
    ? usedMap[PageTypeInfo.add]
    : pathname.includes(`/${PageTypeInfo.edit}`)
    ? usedMap[PageTypeInfo.edit]
    : pathname.includes(`/${PageTypeInfo.show}`)
    ? usedMap[PageTypeInfo.show]
    : usedMap[PageTypeInfo.copy];
};
