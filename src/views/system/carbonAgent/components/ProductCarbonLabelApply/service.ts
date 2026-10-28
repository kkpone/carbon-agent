import { request } from '@src/api/request';
import type { BackendResponse } from '@src/api/types';
import type { AuditListData } from '@src/views/carbonFootprint3/CarbonLabel/component/AuditList/type';
import type { CarbonLabelListData } from '@src/views/carbonFootprint3/CarbonLabel/type';

import type {
  AgentLabelApplicationPayload,
  PreparedApplicationInfo,
} from './types';

/** Agent 碳标签申请初始化；不影响原碳标签模块的接口。 */
export function getAgentCarbonLabelPrepare({
  accountId,
  forceNew = false,
}: {
  accountId: string | number;
  forceNew?: boolean;
}) {
  return request<BackendResponse<PreparedApplicationInfo>>({
    method: 'get',
    url: '/footprint3/agent/tag-label/prepare',
    params: { accountId, forceNew },
  });
}

export function postAgentCarbonLabelSubmit(
  data: AgentLabelApplicationPayload,
  forceNew = false,
) {
  return request<BackendResponse<PreparedApplicationInfo>>({
    method: 'post',
    url: '/footprint3/agent/tag-label/submit',
    params: { forceNew },
    data,
  });
}

export function getAgentCarbonLabelList(
  params: { accountId: string },
  signal?: AbortSignal,
) {
  return request<BackendResponse<CarbonLabelListData[]>>({
    method: 'get',
    url: '/footprint3/agent/tag-label/list',
    params,
    signal,
  });
}

export function getAgentCarbonLabelDetail(id: string | number) {
  return request<BackendResponse<PreparedApplicationInfo>>({
    method: 'get',
    url: `/footprint3/agent/tag-label/${encodeURIComponent(String(id))}`,
  });
}

export function getAgentCarbonLabelAuditRecords(params: { applyNum: string }) {
  return request<BackendResponse<AuditListData[]>>({
    method: 'get',
    url: '/footprint3/agent/tag-label/audit-records',
    params,
  });
}

export function getAgentCarbonLabelPointCost(accountId: string | number) {
  return request<BackendResponse<{ pointCost?: number | null }>>({
    method: 'get',
    url: '/footprint3/agent/tag-label/point-cost',
    params: { accountId },
  });
}
