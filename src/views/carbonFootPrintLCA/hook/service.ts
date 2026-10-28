import { ResponseData, request } from '@/api/request';

import { DictTree, LcaDb, LcaEnumResp, LifeCycle } from './type';

/**
 * 查询lca枚举
 */
export const getLcaEnums = ({ enumName }: { enumName: string }) =>
  request<ResponseData<LcaEnumResp[]>>({
    method: 'GET',
    url: `/lca/enums/${enumName}`,
  });

/**
 * 查询生命周期枚举
 */
export const getLiftCycleList = (params: { ids?: string }) =>
  request<ResponseData<LifeCycle[]>>({
    method: 'GET',
    url: `/lca/lifeCycle/list`,
    params,
  });

/**
 * 查询系统边界生命周期枚举
 */
export const getSysLiftCycleList = (params: { systemBoundaryType: number }) =>
  request<ResponseData<LifeCycle[]>>({
    method: 'GET',
    url: `/lca/lifeCycle/listAll`,
    params,
  });

/**
 * 查询数据分类枚举
 */
export const getDataCategoryList = () =>
  request<ResponseData<DictTree[]>>({
    method: 'GET',
    url: `/lca/dataRef/lcaFactorCategory`,
  });

/**
 * 查询lca数据库列表
 */
export const getLcaDbList = (params?: { ids?: string }) =>
  request<ResponseData<LcaDb[]>>({
    method: 'GET',
    url: `/management/lcaDb/db/list`,
    params,
  });
