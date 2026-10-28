/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-16 11:50:05
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';
import { BackTableData, OpreationBack, Pages } from '../../type';
import {
  DataAuditListTableData,
  DataAuditParams,
  DataComputationBackData,
} from './type';

/**
 * @description 审核
 * @param params
 * @returns
 */
export function apiDataAudit(params: DataAuditParams) {
  return request<OpreationBack>({
    method: 'get',
    url: '/chain/data/audit',
    params,
  });
}
/**
 * @description 审核列表
 * @param params
 * @returns
 */
export function apiDataAuditList(params: { id: number | string } & Pages) {
  return request<AxiosResponse<BackTableData<DataAuditListTableData[]>>>({
    method: 'get',
    url: '/chain/data/audit/list',
    params,
  });
}

/**
 * @description 核算详情
 * @param params
 * @returns
 */
export function apiDataComputation(id?: number | string) {
  return request<AxiosResponse<DataComputationBackData>>({
    method: 'get',
    url: `/chain/data/computation/${id}`,
  });
}
