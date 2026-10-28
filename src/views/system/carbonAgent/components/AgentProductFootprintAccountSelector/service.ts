import { request } from '@/api/request';

import type {
  AgentProductFootprintAccountPageParams,
  AgentProductFootprintAccountPageResponse,
} from './types';

export const fetchAgentProductFootprintAccountPage = async (
  params: AgentProductFootprintAccountPageParams,
  signal?: AbortSignal,
) => {
  const response = await request<AgentProductFootprintAccountPageResponse>({
    method: 'GET',
    params,
    signal,
    url: '/ai/agent/product-carbon/accounts/referable',
  });
  const responseData = response.data;

  if (responseData.code !== 200) {
    throw new Error(responseData.msg || '');
  }

  return {
    rows: responseData.data?.rows || [],
    total: responseData.data?.total || 0,
  };
};
