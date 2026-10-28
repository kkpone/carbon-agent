import { request } from '@src/api/request';

import type {
  EnterpriseOverviewData,
  EnterpriseOverviewListParams,
  EnterpriseOverviewOrg,
} from './types';

export const fetchEnterpriseOverviewOrgTree = async (
  projectId: number | string,
  signal?: AbortSignal,
): Promise<EnterpriseOverviewOrg[]> => {
  const response = await request<{ data: EnterpriseOverviewOrg[] }>({
    method: 'GET',
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/overview/orgTree`,
  });

  return response.data.data || [];
};

export const fetchEnterpriseOverviewData = async (
  projectId: number | string,
  params: EnterpriseOverviewListParams,
  signal?: AbortSignal,
): Promise<EnterpriseOverviewData> => {
  const response = await request<{ data: EnterpriseOverviewData }>({
    method: 'GET',
    params,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/overview/orgComputation`,
  });

  return response.data.data;
};
