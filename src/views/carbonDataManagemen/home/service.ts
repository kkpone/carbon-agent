import { request } from '@src/api/request';
import { CarbonAccountNoOrderSubForm } from './type';

// 新增用户线索（other 官网，saas）
export function apiNoOrderAdd(data: CarbonAccountNoOrderSubForm) {
  return request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/system/clew/add/other`,
    data,
  });
}

// 初始化企业生成秘钥
