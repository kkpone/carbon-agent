/*
 * @Author: 张明尧
 * @Date: 2022-09-15 14:38:47
 */

import { FlattenRoutes } from '@src/router/type';
import { RouterHistory } from '@src/types';

/**
 * 当前面包屑基于路由树的拓展，每一层都包含一份所有的父级路由地址
 */
export interface BreadcrumbRoute extends FlattenRoutes {
  /** 存放所有的父级信息 */
  // parents?: string[];
  /** 跳转到当前页面的实际地址，因为可能存在xxx/xxx/:id之类的这种情况，所以需要存储当前的跳转信息 */
  currentHref?: string;
}

/**
 * 针对面包屑处理的路径上的信息
 */
export interface BreadcrumbRouteParams {
  /** 是否显示自己的父级 */
  noParents?: boolean;
}

export type Action = Parameters<Parameters<RouterHistory['listen']>[0]>[1];
