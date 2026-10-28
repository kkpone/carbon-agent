import { request } from '@src/api/request';
import type { BackendResponse, SwitchoverCompanyData } from '@src/api/types';
import { parseMonitorJson } from '@src/views/system/carbonAgent/monitor/json';

export type AgentSsoExchangeData = SwitchoverCompanyData & {
  clientType?: string;
  lang?: 'en' | 'zh' | 'zt';
  reusedExistingSession?: boolean;
  destination?: 'TEAM_MANAGEMENT';
  targetCompanyId?: string | number;
};

export const exchangeAgentSsoTicket = (ticket: string) =>
  request<BackendResponse<AgentSsoExchangeData>>({
    data: { ticket },
    method: 'POST',
    silentResponseError: true,
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
    url: '/auth/token/agent-sso/exchange',
  });
