import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  BackTableData,
  SelectAccountListData,
  SelectAccountListParams,
  SelectAccountProductData,
} from './type';
/** 已完成核算列表 */
export function getSelectAccountList(params: SelectAccountListParams) {
  return request<AxiosResponse<BackTableData<SelectAccountListData>>>({
    method: 'get',
    url: `footprint3/account/list`,
    params: {
      ...params,
      referFlag: 2,
      accountStatus: 2,
    },
  });
}

/** 产品列表 - 用于右上角产品搜索下拉（仅返回已有核算的产品） */
export function getSelectAccountProductList() {
  return request<AxiosResponse<BackTableData<SelectAccountProductData>>>({
    method: 'get',
    url: `footprint3/product/hasAccounts`,
    params: {
      pageNum: 1,
      pageSize: 10000,
    },
  });
}
