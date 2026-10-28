/*
 * @Author: 张明尧
 * @Date: 2022-09-15 14:36:42
 */
import { utilGetUrlParams } from '@src/components/SearchForm/util';
import { FlattenRoutes } from '@src/router/type';
import { FlattedMenuRoutes, getRouteTitle } from '@src/router/utils';
import LocalStore from '@src/utils/store';
import { Breadcrumb } from 'antd';
import { memo, useEffect, useRef, useState } from 'react';
import { useHistory, matchPath } from 'react-router-dom';

import style from './index.module.less';
import { Action, BreadcrumbRoute, BreadcrumbRouteParams } from './type';

const ignoreList = [
  '/enterpriseCarbonAccounting/carbonDischargeEmissionManage',
];

/**
 * 根据当前页面的路径，前往传递过来的路由表中的数据进行匹配，动态生成通用型的面包屑
 * 此组件的核心就是：
 * 1. 每次都会生成最新的面包屑，是通过默认配置的路有树的关联关系进行生成的 (所以对于路由树的配置要求需要遵循规范)
 * 2. 每次都会生成一条历史记录，目前只支持最多30层历史记录（超过之后会删除掉最早的历史），该历史记录中存储着每个路由对象对应的真实路由地址（为了处理携带参数的路由）
 * props: BreadcrumbUtilProps
 */
const BreadcrumbUtil = () => {
  const history = useHistory();
  /** 是否不显示面包屑（如果是根节点的菜单的话是不需要显示面包屑的） */
  // const [isBreadcrumbVisible, setIsBreadcrumbVisible] =
  //   useState<boolean>(false);
  /** FIXME 不知道存在的意义 当前自定义添加上parents属性后的数据 */
  // const [, setCustomRouteData] = useState<BreadcrumbRoute[]>();
  /** 正常情况下的面包屑 */
  const [breadcrumbRoute, setBreadcrumbRoute] = useState<BreadcrumbRoute[]>();
  /** 非正常情况下的面包屑 */
  const [noParentRoute, setNoParentRoute] = useState<BreadcrumbRoute[]>([]);
  /**
   * fixme 都在什么场景下使用
   * 初始化处理当前的路径地址，把地址进行分割切分成数组
   * @param href 当前的url路径
   * @returns 返回已经处理好的数据格式
   */
  // const initLocationHref = (href: string) => {
  //   const splitHref = href.split('/');
  //   if (splitHref.length === 0) return [];
  //   // 前三条数据是http: / / xxx路径所以要去除掉
  //   let [, , , ...backArr] = splitHref;
  //   // 不包含的话只需要去除一层
  //   if (!href.includes('http')) {
  //     [, ...backArr] = splitHref;
  //   }
  //   return backArr;
  // };
  const BreadcrumbHistoryKey = 'BreadcrumbHistoryKey';

  /** 保存浏览历史记录数 */
  const CachedHistoryLength = 50;
  /**
   * 存储当前页面的信息，主要是实际地址存储到历史中去
   * @param findRoute 当前匹配到的路由
   */
  const setLocalStorageBreadcrumbHistory = (findRoute: BreadcrumbRoute) => {
    let historyArr =
      LocalStore.getValue<BreadcrumbRoute[]>(BreadcrumbHistoryKey);
    // 当前要存储的信息
    const currentRouteInfo = {
      ...findRoute,
      // 保存当前路径信息
      currentHref: location.pathname + location.search,
    };
    // 如果存在历史记录的话
    if (historyArr) {
      // 如果当前路由与上一次存储的路由不同，将新路由存储进去
      if (
        currentRouteInfo.currentHref !==
        historyArr[historyArr.length - 1].currentHref
      ) {
        // 将当前的路由信息加入进去，尤其是当前的实际地址
        historyArr.push(currentRouteInfo);
      }
      // 拿到总长度
      const allLength = historyArr.length;
      // 将数组进行切割，超过30条，切割剩到29条，最早的数据舍弃
      if (allLength >= CachedHistoryLength) {
        historyArr = historyArr.slice(allLength - CachedHistoryLength + 1);
      }

      // 将最新的一条放入后，存储到历史记录中去
      LocalStore.setValue(BreadcrumbHistoryKey, historyArr);
    } else {
      // 不存在历史记录就要去创建
      LocalStore.setValue(BreadcrumbHistoryKey, [currentRouteInfo]);
    }
  };
  /**
   * 根据当前匹配到的所有面包屑数据前往缓存的历史中去查找对应的真实地址
   * @param parentsUrl 当前所有的匹配好的路由信息
   */
  const changeBreadcrumbRoute = (parentsUrl: FlattenRoutes[]) => {
    const breadHistory = localStorage.getItem(BreadcrumbHistoryKey);
    // 如果没有历史记录就直接将当前的匹配路由放入
    if (!breadHistory) {
      // 最终传递到面包屑上
      setBreadcrumbRoute(parentsUrl);
    } else {
      // 拿到历史记录
      const historyArr: BreadcrumbRoute[] = JSON.parse(breadHistory);
      // 翻转历史记录，通过find只查找到第一条数据即可
      const historyArrReverse = historyArr.reverse();
      const getCurrentParentsUrl = parentsUrl.map(route => {
        // 将每个面包屑都去历史记录中进行匹配
        const historyRoute = historyArrReverse.find(
          historyRoute => historyRoute.path === route.path,
        );
        if (historyRoute) {
          return { ...route, currentHref: historyRoute.currentHref };
        }
        return route;
      });

      // 去除掉根节点没有component的面包屑，因为点击无法跳转制定组件 - 一般都是根节点
      const getHaveComponentRoute = getCurrentParentsUrl.filter(
        ur => ur.component,
      );

      // 将携带真实地址的路径传递给面包屑
      setBreadcrumbRoute(getHaveComponentRoute);
    }
  };

  /**
   * 匹配当前对应的路由信息
   * @param pathname 当前的路由
   * @returns 当前查找到的路由树上的信息
   */
  const findMatchRoute = (pathname: string, isMatchWithHistory?: boolean) => {
    // 获取产品路由前缀 - 由于每个产品的路径前缀都是一致的
    const pathStart = `/${pathname.split('/')[1]}`;

    // 格式化好需要当前匹配的路由后，前往自定义的路由树匹配当前路由
    let findRoute = FlattedMenuRoutes().filter(
      route =>
        // 符合条件的路由
        matchPath(pathname, { path: route.path, exact: true }) &&
        // 该路由必须属于当前产品
        route.path.startsWith(pathStart),
    );
    if (isMatchWithHistory && findRoute.length > 1) {
      const cachedHistory = (
        LocalStore.getValue<FlattenRoutes[]>(BreadcrumbHistoryKey) || []
      ).reverse();
      // 通过排序，找到最近访问的路由
      let sortIndex: number | undefined;
      findRoute = findRoute.reduce((tmp, next) => {
        // 计算父级的排序
        const currentSortIndex = cachedHistory.findIndex(
          r => r.path === next.parent?.path,
        );
        // 历史记录中找到的第一个，记录当前排序
        if (currentSortIndex > -1 && !Number.isInteger(sortIndex)) {
          sortIndex = currentSortIndex;
        }
        //  第一次，直接存入
        if (!tmp.length) return [next];
        if (
          typeof sortIndex === 'number' &&
          currentSortIndex > -1 &&
          currentSortIndex <= sortIndex
        ) {
          sortIndex = currentSortIndex;
          return [next];
        }
        return tmp;
      }, [] as FlattenRoutes[]);
    }
    return findRoute;
  };
  const routeToBreadcrumb = (route: FlattenRoutes) => {
    let breadcrumb: BreadcrumbRoute[] = [];
    let nextParent = route;
    // 从后向前查找匹配路径
    const cachedHistory = (
      LocalStore.getValue<BreadcrumbRoute[]>(BreadcrumbHistoryKey) || []
    ).reverse();
    // 一层层遍历路由，直到找到根节点
    while (nextParent.parent) {
      breadcrumb = [
        {
          ...nextParent,
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          currentHref: cachedHistory.find(r => r.path === nextParent.path)
            ?.currentHref,
        } as BreadcrumbRoute,
      ].concat(breadcrumb);
      nextParent = nextParent.parent;
    }
    return breadcrumb;
  };
  /**
   * 根据当前路径信息找到自定义好的数组格式
   */
  const customRouteByHref = (historyAction?: Action) => {
    // 前往查找到路由树上的完整信息
    const findRoute = findMatchRoute(location.pathname, true);
    const breadcrumb = routeToBreadcrumb(findRoute[0]);
    // 如果找到匹配信息  并且 匹配的parents的数据大于1条才行, 因为默认第一层的根目录是产品的根节点
    if (findRoute.length >= 1) {
      // 不存储 pophistory 时跳转的页面
      if (historyAction !== 'POP') {
        // 优先将当前的地址放到历史记录中去，目前最大值限制是30条，超过的删除最早的记录
        setLocalStorageBreadcrumbHistory(findRoute[0]);
      }

      /* 当前已经找到了所有的层级关系，然后就需要去缓存的历史记录中进行查找真实的路由信息(主要是处理路径上携带参数的问题) */
      changeBreadcrumbRoute(breadcrumb);
    }
  };
  /**
   * 点击面包屑
   * @param route 当前选中的面包屑
   */
  const onClickRoute = (route: BreadcrumbRoute) => {
    if (!route || !route.path) {
      // Toast('error', '当前面包屑不存在路径');
      return;
    }
    const jumpRoute = route.currentHref || route.path;
    // todo 目前存在问题
    // 1. 直接输入地址后 history.goback 无法再知道具体的跳转路径
    // 如果 currentHref 和某一条历史记录相同，使用 history.back 替代 push 跳转
    // const cachedHistorys =
    //   LocalStore.getValue<BreadcrumbRoute[]>(BreadcrumbHistoryKey);
    // // 计算回跳的步数
    // const jumpBackIndex = cachedHistorys
    //   ?.reverse()
    //   .findIndex(r => r.currentHref === jumpRoute);

    // if (jumpBackIndex && jumpBackIndex > 0) {
    //   history.go(-1 * jumpBackIndex);
    //   return;
    // }
    // 如果是忽略了的页面的话，就不跳转
    if (ignoreList.includes(jumpRoute)) {
      return;
    }
    history.push(jumpRoute);
  };
  /**
   * 根据当前页面上的路由参数进行判断，是否有自定义的路由信息
   * @returns 当前不匹配路由历史上的最近的一条数据 --- 后面要拓展多层不匹配的情况
   */
  const getUrlParams = () => {
    let backUrl = window.location.href;
    // 获取面包屑上的参数信息
    const params = utilGetUrlParams('breadcrumb');
    if (params) {
      // 拿到历史记录，准备查找当前最近的没有noParents的数据
      const breadHistoryArr =
        LocalStore.getValue<BreadcrumbRoute[]>(BreadcrumbHistoryKey);
      const breadcrumbParams: BreadcrumbRouteParams = JSON.parse(params);
      // 如果不显示父级就将历史记录中的上层返回
      if (breadcrumbParams.noParents && breadHistoryArr) {
        // 翻转数组  找到第一条包含历史的面包屑
        const findRoute = breadHistoryArr
          .reverse()
          .find(
            route =>
              route.currentHref && !route.currentHref.includes('noParents'),
          );
        // 如果匹配到的话，就让当前的面包屑去遍历当前查找到的面包屑历史
        if (findRoute) {
          backUrl = findRoute.currentHref || findRoute.path;
        }
      }
    } else {
      setNoParentRoute([]);
    }
    return backUrl;
  };
  /** 初始化 */
  const init = (historyAction?: Action) => {
    // 特殊处理当前不需要父级的场景,拿去当前的路径上的参数
    // 当前页面不属于当前产品时，隐藏路由
    const nowLocationHref = getUrlParams();

    // 根据 '/'前往切割数组
    // const hrefArr = initLocationHref(nowLocationHref);
    // 默认根节点下的两层是不显示的,因为大概率是菜单级别，但是不排除特殊情况
    // 所以要遍历每一层的route节点，确保是第二层的情况才不会被显示面包屑 --- 后续再判断，方便起来的话就要硬性要求必须是在第二层创建菜单路由
    // if (hrefArr.length <= 2) {
    //   setIsBreadcrumbVisible(true);
    // } else {
    //   setIsBreadcrumbVisible(false);
    // }

    // 减少一次代码遍历执行，在这加上自定义的面包屑
    if (nowLocationHref !== window.location.href) {
      // 两个实际地址不相同，说明当前父级有问题需要手动添加自定义了
      const findRoute = findMatchRoute(new URL(nowLocationHref).pathname);
      if (findRoute?.length) {
        // fixme 这里不知道会不会有问题，因为可能存在多个相同的路由，但是他们的父级不同
        setNoParentRoute([findRoute[0]]);
      }
    }

    // 根据当前的路由去匹配自定义的路由树，拿到对应的路由信息和父级中的关系
    customRouteByHref(historyAction);
    // }
  };
  const removeHistoryListen = useRef<ReturnType<typeof history.listen> | null>(
    null,
  );
  useEffect(() => {
    removeHistoryListen.current = history.listen((location, action) => {
      init(action);
    });
    // 初始化时执行一次
    init();
    return () => {
      removeHistoryListen.current?.();
    };
  }, []);
  return (
    <div>
      {breadcrumbRoute && [...breadcrumbRoute, ...noParentRoute].length > 1 && (
        <div className={style.breadcrumbUtilContainer}>
          <Breadcrumb>
            {[...breadcrumbRoute, ...noParentRoute].map((bread, _index) => (
              <Breadcrumb.Item
                key={`${bread.path}`}
                aria-label={getRouteTitle(bread)}
              >
                <div
                  onClick={() => {
                    if (
                      _index <
                      [...breadcrumbRoute, ...noParentRoute].length - 1
                    ) {
                      onClickRoute(bread);
                    }
                  }}
                  style={
                    _index < [...breadcrumbRoute, ...noParentRoute].length - 1
                      ? { cursor: 'pointer' }
                      : {}
                  }
                >
                  {getRouteTitle(bread)}
                </div>
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        </div>
      )}
    </div>
  );
};

export default memo(BreadcrumbUtil);
