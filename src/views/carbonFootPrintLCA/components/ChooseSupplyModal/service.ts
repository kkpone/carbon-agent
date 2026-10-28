import { IPageList, ResponseData, request } from '@/api/request';

import { ApplyRefDto, SupplyRequest } from './type';

/**
 * @description 选择供应商结果的列表
 */
export const getChooseSupplyList = (params: SupplyRequest) =>
  request<ResponseData<IPageList<ApplyRefDto>>>({
    method: 'GET',
    url: '/lca/dataRef/supplierRef/page',
    params,
  });

/**
 * @description 供应商结果数据-获取评价指标列表
 */
export const getSupplierTargetList = (params: { applyInfoId: number }) =>
  request<ResponseData<IPageList<ApplyRefDto>>>({
    method: 'GET',
    url: `/lca/dataRef/supplierRef/result/${params.applyInfoId}`,
    params,
  });
