/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-10 17:20:34
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';
import {
  BackTableData,
  OpreationBack,
  Pages,
} from '@src/views/supplyChain2/type';
// import { Dicts } from '../emission/Show/type';
import {
  InnerEnterpriseAuditParmas,
  InnerEnterpriseListParmas,
  InnerEnterpriseListTableData,
} from './type';

/**
 * @description 供应商管理
 * @param params
 * @returns
 */
export function apiInnerEnterpriseList(
  params: InnerEnterpriseListParmas & Pages,
) {
  return request<AxiosResponse<BackTableData<InnerEnterpriseListTableData[]>>>({
    method: 'get',
    url: '/chain/data/inner/enterprise/list',
    params,
  });
}
/**
 * @description 供应商管理 审核
 * @param params
 * @returns
 */
export function apiInnerEnterpriseAudit(params: InnerEnterpriseAuditParmas) {
  return request<OpreationBack>({
    method: 'get',
    url: '/chain/data/inner/enterprise/audit',
    params,
  });
}
