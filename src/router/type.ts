/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-06-01 14:10:23
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-06 11:53:18
 */
import type { Routes } from './config';

export type FlattenRoutes = Routes & { parent?: FlattenRoutes };

/** 路由上定义的参数名 */
export const PageInfoTypeName = ':pageInfoTypeName';

export type PathParamsType = {
  pageInfoTypeName: PageInfoType;
  /** 根据需求自定义处理，因为大多数地方都有id 需求，所以就直接加上了 */
  id?: string;
};

/** 新增、编辑、详情页状态值 */
export enum PageInfoType {
  'add' = 'add',
  'edit' = 'edit',
  'show' = 'show',
  'copy' = 'copy',
}
