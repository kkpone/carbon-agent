import { request, ResponseData, IPageList } from '@src/api/request';

import { CbamProductInfo, ChooseCbamRequest } from './type';

/**
 * @description 选择CBAM数据的列表-外购产品列表
 */
export const getChooseSupplyCbamList = (params: ChooseCbamRequest) =>
  request<ResponseData<IPageList<CbamProductInfo>>>({
    method: 'GET',
    url: `/cbam2/saleProduct/getAllSaleProduct`,
    params,
  });
