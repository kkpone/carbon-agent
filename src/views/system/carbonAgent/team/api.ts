import { request } from '@src/api/request';
import type { RequestOptions } from '@src/api/types';

import { errorCode } from './errors';
import { teamText } from './i18n';
import type {
  Workspace,
  Summary,
  Quote,
  PurchaseAction,
  TeamOrder,
  Plan,
  PointOrder,
  Page,
  MemberRow,
  MemberFilter,
  MemberOption,
  MemberCreate,
  MemberEdit,
  ImportRow,
  SeatHistory,
  PointSummary,
  Consumption,
  FinanceOrder,
  Invoice,
  Profile,
  Executions,
  Audit,
  DateFilter,
} from './types';
import { parseMonitorJson } from '../monitor/json';

export const normalizeTeamIds = (value: unknown, key = ''): any => {
  if (value == null) return value;
  if (Array.isArray(value))
    return value.map(item =>
      normalizeTeamIds(item, key.endsWith('Ids') ? key.slice(0, -1) : key),
    );
  if (typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([name, item]) => [
        name,
        normalizeTeamIds(item, name),
      ]),
    );
  return (key === 'id' || key.endsWith('Id')) &&
    (typeof value === 'number' || typeof value === 'string')
    ? String(value)
    : value;
};

const root = '/management/agent/team';
const managementDeniedListeners = new Set<() => void>();
export const subscribeTeamManagementDenied = (listener: () => void) => {
  managementDeniedListeners.add(listener);
  return () => {
    managementDeniedListeners.delete(listener);
  };
};
export const teamRequest = async <T>(
  url: string,
  options: RequestOptions = {},
): Promise<T> => {
  try {
    const response = await request<{ code: number; data: T; msg: string }>({
      method: 'GET',
      ...options,
      url,
      silentResponseError: true,
      transformResponse: [
        (value: unknown) =>
          typeof value === 'string' ? parseMonitorJson(value) : value,
      ],
    });
    if (response.data.code !== 200)
      throw Object.assign(
        new Error(response.data.msg || teamText('requestFailed')),
        {
          response,
        },
      );
    return normalizeTeamIds(response.data.data);
  } catch (error) {
    if (
      url.startsWith(`${root}/`) &&
      errorCode(error) === 'AGENT_TEAM_MANAGEMENT_FORBIDDEN'
    ) {
      managementDeniedListeners.forEach(listener => listener());
    }
    throw error;
  }
};
export const teamApi = {
  workspaces: (signal?: AbortSignal) =>
    teamRequest<Workspace[]>('/management/agent/workspaces', { signal }),
  access: (signal?: AbortSignal) =>
    teamRequest<Workspace>('/management/agent/workspace-access', { signal }),
  summary: () => teamRequest<Summary>(`${root}/summary`),
  profile: () => teamRequest<Profile>(`${root}/profile`),
  saveProfile: (data: { companyName: string; contactEmail: string }) =>
    teamRequest<Profile>(`${root}/profile`, { method: 'PUT', data }),
  plans: async (planKind: 'membership' | 'addon') => {
    const data = await teamRequest<Plan[] | { plans: Plan[] }>(
      '/management/agent/points/plans',
      { params: { planKind } },
    );
    return Array.isArray(data) ? data : data.plans;
  },
  quote: (
    data: { action: PurchaseAction; quantity: number; companyName?: string },
    signal?: AbortSignal,
  ) => teamRequest<Quote>(`${root}/quotes`, { method: 'POST', data, signal }),
  order: (quoteId: string) =>
    teamRequest<TeamOrder>(`${root}/orders`, {
      method: 'POST',
      data: { quoteId, confirmed: true },
    }),
  pending: () => teamRequest<TeamOrder | null>(`${root}/orders/pending`),
  orderStatus: (orderNo: string, signal?: AbortSignal) =>
    teamRequest<TeamOrder>(`${root}/orders/status`, {
      params: { orderNo },
      signal,
    }),
  members: (params: MemberFilter & { pageNum?: number; pageSize?: number }) =>
    teamRequest<Page<MemberRow>>(`${root}/seats`, { params }),
  options: () =>
    teamRequest<{ departments: MemberOption[]; roles: MemberOption[] }>(
      `${root}/members/options`,
    ),
  createMember: (data: MemberCreate) =>
    teamRequest(`${root}/members`, { method: 'POST', data }),
  editMember: (data: MemberEdit) =>
    teamRequest(`${root}/members`, { method: 'PUT', data }),
  memberState: (membershipIds: string[], action: string) =>
    teamRequest(`${root}/members/state`, {
      method: 'POST',
      data: { membershipIds, action, confirmed: true },
    }),
  transfer: (membershipIds: string[], orgId: string) =>
    teamRequest(`${root}/members/transfer`, {
      method: 'POST',
      data: { membershipIds, orgId, confirmed: true },
    }),
  assign: (membershipId: string, requestId: string) =>
    teamRequest<SeatHistory>(`${root}/seats/assign`, {
      method: 'POST',
      data: { membershipId, requestId },
    }),
  exportMembers: (params: MemberFilter) =>
    teamRequest<MemberRow[]>(`${root}/members/export`, { params }),
  previewImport: (file: File) => {
    const data = new FormData();
    data.append('file', file);
    return teamRequest<ImportRow[]>(`${root}/members/import/preview`, {
      method: 'POST',
      data,
    });
  },
  executeImport: (batchId: string) =>
    teamRequest<ImportRow[]>(`${root}/members/import/execute`, {
      method: 'POST',
      data: { batchId, confirmed: true },
    }),
  importResult: (batchId: string) =>
    teamRequest<ImportRow[]>(`${root}/members/import`, { params: { batchId } }),
  limits: (data: {
    membershipIds: string[];
    limitMode: string;
    limitValue?: number;
    versions: Record<string, number>;
  }) => teamRequest(`${root}/member-limits`, { method: 'PUT', data }),
  points: () => teamRequest<PointSummary>(`${root}/points/summary`),
  consumption: (params: DateFilter & { pageNum?: number; pageSize?: number }) =>
    teamRequest<Page<Consumption>>(`${root}/points/consumption`, { params }),
  consumptionExport: (params: DateFilter) =>
    teamRequest<Consumption[]>(`${root}/points/consumption/export`, { params }),
  seatHistory: (params: {
    keyword?: string;
    pageNum?: number;
    pageSize?: number;
  }) => teamRequest<Page<SeatHistory>>(`${root}/seats/history`, { params }),
  seatHistoryExport: (keyword?: string) =>
    teamRequest<SeatHistory[]>(`${root}/seats/history/export`, {
      params: { keyword },
    }),
  pointOrder: (planCode: string, requestId: string) =>
    teamRequest<PointOrder>('/management/agent/points/orders', {
      method: 'POST',
      data: { planCode, requestId, payChannel: 'wechat' },
    }),
  pointStatus: (orderNo: string, signal?: AbortSignal) =>
    teamRequest<PointOrder>('/management/agent/points/orders/payQuery', {
      params: { orderNo },
      signal,
    }),
  pointResume: (orderNo: string) =>
    teamRequest<PointOrder>('/management/agent/points/orders/resume', {
      method: 'POST',
      params: { orderNo },
    }),
  orders: (params: {
    keyword?: string;
    invoiceableOnly?: boolean;
    pageNum?: number;
    pageSize?: number;
  }) => teamRequest<Page<FinanceOrder>>(`${root}/finance/orders`, { params }),
  orderDetail: (orderNo: string) =>
    teamRequest<FinanceOrder>(
      `${root}/finance/orders/${encodeURIComponent(orderNo)}`,
    ),
  ordersExport: (params: { keyword?: string; invoiceableOnly?: boolean }) =>
    teamRequest<FinanceOrder[]>(`${root}/finance/orders/export`, { params }),
  invoices: (params: {
    keyword?: string;
    status?: number;
    pageNum?: number;
    pageSize?: number;
  }) => teamRequest<Page<Invoice>>(`${root}/finance/invoices`, { params }),
  invoiceDetail: (id: string) =>
    teamRequest<Invoice>(`${root}/finance/invoices/${encodeURIComponent(id)}`),
  invoice: (data: {
    orderNos: string[];
    invoiceTitle: string;
    taxCode: string;
    email: string;
  }) =>
    teamRequest<string>(`${root}/finance/invoices`, { method: 'POST', data }),
  executions: (params: DateFilter & { pageNum?: number; pageSize?: number }) =>
    teamRequest<Executions>(`${root}/executions`, { params }),
  execution: (runId: string) =>
    teamRequest<Executions['rows'][number]>(`${root}/executions/detail`, {
      params: { runId },
    }),
  audit: (params: DateFilter & { pageNum?: number; pageSize?: number }) =>
    teamRequest<Page<Audit>>(`${root}/audit`, { params }),
  auditExport: (params: DateFilter) =>
    teamRequest<Audit[]>(`${root}/audit/export`, { params }),
};
