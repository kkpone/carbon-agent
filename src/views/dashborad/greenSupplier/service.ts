import { request } from '@api/request';
import { GreenSupplierInfo, GreenSupplierListParams, PageReturn } from './type';

// 供应商管理列表
export const apiGetGreenSupplierList = (params: GreenSupplierListParams) => request<{ data: PageReturn<GreenSupplierInfo> }>({
    method: 'get',
    url: '/management/greenSupplier/list',
    params,
  });
