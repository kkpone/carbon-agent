import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import {
  CarbonAccountInventoryRecordTable,
  CarbonAccountInventoryRecordTableGetParams,
} from './type';

// 兑换记录的列表
export function ApiInventoryRecordListGet(
  params: CarbonAccountInventoryRecordTableGetParams,
) {
  return request<AxiosResponse<CarbonAccountInventoryRecordTable>>({
    method: 'get',
    url: `/carbonAccount/stockRecord/list`,
    params,
  });
}
