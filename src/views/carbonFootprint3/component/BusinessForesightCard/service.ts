import { request } from '@/api/request';

export interface BusinessForesightData {
  /** 参考标准 */
  standard: string;
  /** 应用范围 */
  scope: string;
  /** 风险规避 */
  riskAvoidance: string;
}

export const getBusinessForesight = (params: { accountId: number | string }) =>
  request<{ data: BusinessForesightData }>({
    url: '/footprint3/account/businessAdvice',
    method: 'get',
    params,
  });
