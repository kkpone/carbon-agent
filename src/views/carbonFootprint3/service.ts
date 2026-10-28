import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ProductAccountingList } from './FootprintAccount/component/ProductSelectAccount/type';
import { ProductAccountingListParams } from './FootprintAccount/type';
import {
  BackTableData,
  CommonProductListData,
  CommonProductListDataParams,
} from './type';

/**
 * @description 是否购买供应链产品
 */
export function isBuySupplier() {
  return request<{ data: boolean }>({
    method: 'get',
    url: '/management/companyProduct/buy/supplier',
  });
}

/** 产品 - 列表 */
export function getCommonProductList(params: CommonProductListDataParams) {
  return request<AxiosResponse<BackTableData<CommonProductListData>>>({
    method: 'get',
    url: `footprint3/product/list`,
    params,
  });
}

/** 功能单位列表 - 根据产品Id获取列表 */
export function getCommonAccountListData(
  params: ProductAccountingListParams & { type?: number; id?: number },
) {
  return request<AxiosResponse<BackTableData<ProductAccountingList>>>({
    method: 'get',
    url: `footprint3/account/list`,
    params,
  });
}
