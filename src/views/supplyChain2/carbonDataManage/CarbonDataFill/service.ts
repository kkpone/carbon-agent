/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-08 16:11:30
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

import { DataIfoReqBackData } from './type';

/**
 * @description 数据请求详情
 * @param params
 * @returns
 */
export function apiDataIfoReq(params: { id: number | string }) {
  return request<AxiosResponse<DataIfoReqBackData>>({
    method: 'get',
    url: `/chain/data/info/req`,
    params,
  });
}

// /**
//  * @description 选择核算
//  * @param params
//  * @returns
//  */
// export function apiDataEnterpriseChoose(data: { id: number | string }) {
//   return request<OpreationBack>({
//     method: 'get',
//     url: `/chain/data/enterprise/choose`,
//     data,
//   });
// }
