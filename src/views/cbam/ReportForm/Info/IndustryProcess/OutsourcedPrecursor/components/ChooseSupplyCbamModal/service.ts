import { request, ResponseData, IPageList } from '@src/api/request';

import { ChooseSupplyCbamRequest, SupplyInfo } from './type';

/**
 * @description 选择供应商CBAM数据的列表
 */
export const getChooseSupplyCbamList = (params: ChooseSupplyCbamRequest) =>
  request<ResponseData<IPageList<SupplyInfo>>>({
    method: 'GET',
    url: `/cbam2/supplyInfo/findAuditPage`,
    params,
  });
