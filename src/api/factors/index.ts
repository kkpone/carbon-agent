/**
 * @file 因子接口
 */

import { FactorInfoForms, Factors } from '@src/views/emission/utils/index-type';
import { AxiosResponse } from 'axios';
import { request } from '../request';
import { BackendResponse } from '../types';
import { FactorUsageRecor } from './type';

/**
 * @description 碳足迹、再生塑料 添加因子
 */
export const addFactor = (data: Partial<FactorInfoForms>) =>
  request<BackendResponse<null>>({
    url: 'management/system/company/addSaasBusiness',
    method: 'post',
    data,
  });

/**
 * @description 碳足迹、再生塑料 添加因子
 */
export const addFactorUsageRecord = (data: FactorUsageRecor) =>
  request<BackendResponse<null>>({
    url: 'management/system/useRecord/add',
    method: 'post',
    data,
  });
/**
 * @description 碳足迹、再生塑料  编辑因子
 */
export const editFactor = (data: FactorInfoForms & { id: string | number }) =>
  request<BackendResponse<null>>({
    url: 'management/system/company/editSaasBusiness',
    method: 'post',
    data,
  });

/**
 * @description 查 因子详情
 */
export const getFactors = (id: string) =>
  request<BackendResponse<Factors>>({
    url: `management/system/company/querySaas?id=${id}`,
  });

interface FactorType {
  pageSize: number;
  pageNum: number;
  name?: string;
  source?: string;
  institution?: string;
  businessLabel?: string;
  id?: number | string;
  companyId: string;
}
export interface EmissionFactor {
  factorId: string;
  name: string;
  specification: string;
  year: string;
  cValue: string;
  unit: string;
  description: string;
  institution: string;
  countries: string;
  rate: string;
  area: string;
  areaDesc: string;
}

export function apiFactorDataByBusiness(
  params: FactorType,
): Promise<AxiosResponse<any>> {
  return request<any>({
    method: 'GET',
    url: `/management/system/company/listRelationCompany`,
    params,
  });
}
