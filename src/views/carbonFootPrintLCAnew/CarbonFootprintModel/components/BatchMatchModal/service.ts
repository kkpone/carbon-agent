import { ResponseData, request } from '@/api/request';

import {
  IoFactorMatchRequest,
  IoFactorMatchResp,
  IOFactorRequest,
  IOFactorResp,
} from './type';

/**
 * @description 背景数据输入输出列表
 */
export const getIOFactorList = (params: IOFactorRequest) =>
  request<ResponseData<IOFactorResp[]>>({
    method: 'GET',
    url: '/lca2/io/model/factorList',
    params,
  });

/**
 * @description 背景数据匹配
 */
export const postIOFactorListMatch = (data: IoFactorMatchRequest) =>
  request<ResponseData<IoFactorMatchResp[]>>({
    method: 'POST',
    url: '/lca2/io/factorListMatch',
    data,
  });
