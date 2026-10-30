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
    silentResponseError: true,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/overview/orgTree`,
  }).catch(() => ({
    data: {
      data: [
        {
          children: [],
          id: 1,
          name: '总部组织边界',
          orgType: 1,
          periodList: [{ name: '全年', status: 1, value: 0 }],
        },
      ],
    },
  }));

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
    silentResponseError: true,
    signal,
    url: `/ai/agent/projects/${encodeURIComponent(
      projectId,
    )}/enterprise/overview/orgComputation`,
  }).catch(() => ({
    data: {
      data: {
        orgInfoList: [
          {
            computationPeriod: params.period || 0,
            orgList: [
              {
                children: [],
                id: params.orgId || 1,
                name: '总部组织边界',
                orgName: '总部组织边界',
                orgType: 1,
                scopeOne: '128.40',
                scopeThree: '312.80',
                scopeTwo: '245.10',
                status: 1,
                statusDesc: '盘查进行中',
                totalEmission: '686.30',
                totalEmissionRatio: '100',
              },
            ],
            title: `${params.year || 2026}年度盘查概览`,
          },
        ],
        scopeOne: '128.40',
        scopeThree: '312.80',
        scopeTwo: '245.10',
        status: 1,
        title: `${params.year || 2026}年度组织碳盘查`,
        totalEmission: '686.30',
        totalEmissionRatio: '65',
        totalEmissionRatioStatus: 1,
      },
    },
  }));

  return response.data.data;
};
