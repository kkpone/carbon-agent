import { IPageList, request, ResponseData } from '@/api/request';

import {
  FactoryOption,
  MonitorChildDeleteRequest,
  MonitorCnOption,
  MonitorEvidence,
  MonitorEvidenceRelation,
  MonitorOverview,
  MonitorPlanDetail,
  MonitorPlanPage,
  MonitorPlanPayload,
  MonitorPlanQuery,
  MonitorPlanSaveResult,
  MonitorPrecursorOption,
  MonitorPrecursorQuery,
} from './types';

export const getMonitorOverview = (
  params: Omit<MonitorPlanQuery, 'pageNum' | 'pageSize'>,
) =>
  request<ResponseData<MonitorOverview>>({
    method: 'GET',
    url: '/cbam2/monitor/overview',
    params,
  });

export const getMonitorPage = (params: MonitorPlanQuery) =>
  request<ResponseData<MonitorPlanPage>>({
    method: 'GET',
    url: '/cbam2/monitor/page',
    params,
  });

export const getMonitorFactoryPage = (params: MonitorPlanQuery) =>
  request<ResponseData<MonitorPlanPage>>({
    method: 'GET',
    url: '/cbam2/monitor/factory/page',
    params,
  });

export const getMonitorYears = () =>
  request<ResponseData<number[]>>({
    method: 'GET',
    url: '/cbam2/monitor/years',
  });

export const getMonitorUserCompany = () =>
  request<ResponseData<{ companyName?: string }>>({
    method: 'GET',
    url: '/management/user/queryUserCompany',
  });

export const getMonitorDetail = (id: number | string) =>
  request<ResponseData<MonitorPlanDetail>>({
    method: 'GET',
    url: `/cbam2/monitor/plans/${id}`,
  });

export const copyMonitorPlan = (id: number) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: `/cbam2/monitor/plans/${id}/copy`,
    silentResponseError: true,
  });

export const saveMonitorDraft = (data: MonitorPlanPayload) =>
  request<ResponseData<MonitorPlanSaveResult>>({
    method: 'POST',
    url: '/cbam2/monitor/plans/save-draft',
    data,
    silentResponseError: true,
  });

export const saveMonitor = (data: MonitorPlanPayload) =>
  request<ResponseData<MonitorPlanSaveResult>>({
    method: 'POST',
    url: '/cbam2/monitor/plans/save',
    data,
    silentResponseError: true,
  });

export const deleteMonitorChild = (
  id: number | string,
  data: MonitorChildDeleteRequest,
) =>
  request<ResponseData<MonitorPlanSaveResult>>({
    method: 'DELETE',
    url: `/cbam2/monitor/plans/${id}/children`,
    data,
  });

export const deleteMonitorPlan = (id: number) =>
  request<ResponseData<void>>({
    method: 'DELETE',
    url: `/cbam2/monitor/plans/${id}`,
  });

export const getMonitorFactories = (params: {
  pageNum: number;
  pageSize: number;
  factoryName?: string;
}) =>
  request<ResponseData<IPageList<FactoryOption>>>({
    method: 'GET',
    url: '/cbam2/factory',
    params,
  });

export const getMonitorCnOptions = () =>
  request<ResponseData<IPageList<MonitorCnOption>>>({
    method: 'GET',
    url: '/cbam2/defaultCn',
    params: {
      pageNum: 1,
      pageSize: 10000,
      deduplicateCode: true,
    },
  });

export const getMonitorPrecursorPage = (params: MonitorPrecursorQuery) =>
  request<ResponseData<IPageList<MonitorPrecursorOption>>>({
    method: 'GET',
    url: '/cbam2/supplyInfo/findAuditPage',
    params,
  });

export const createMonitorFactory = (data: FactoryOption) =>
  request<ResponseData<boolean>>({
    method: 'POST',
    url: '/cbam2/factory',
    data,
  });

export const getMonitorFactory = (id: number) =>
  request<ResponseData<FactoryOption>>({
    method: 'GET',
    url: `/cbam2/factory/${id}`,
  });

export const updateMonitorFactory = (data: FactoryOption) =>
  request<ResponseData<boolean>>({
    method: 'PUT',
    url: '/cbam2/factory',
    data,
  });

export const deleteMonitorFactory = (id: number) =>
  request<ResponseData<boolean>>({
    method: 'DELETE',
    url: `/cbam2/factory/${id}`,
  });

export const getMonitorEvidences = (planId: number) =>
  request<ResponseData<MonitorEvidence[]>>({
    method: 'GET',
    url: `/cbam2/monitor/plans/${planId}/evidences`,
  });

export const createMonitorEvidence = (planId: number, data: MonitorEvidence) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: `/cbam2/monitor/plans/${planId}/evidences`,
    data,
  });

export const updateMonitorEvidence = (
  planId: number,
  evidenceId: number,
  data: MonitorEvidence,
) =>
  request<ResponseData<MonitorEvidence>>({
    method: 'PUT',
    url: `/cbam2/monitor/plans/${planId}/evidences/${evidenceId}`,
    data,
    silentResponseError: true,
  });

export const createMonitorEvidenceRelation = (
  planId: number,
  data: Omit<MonitorEvidenceRelation, 'id'>,
) =>
  request<ResponseData<number>>({
    method: 'POST',
    url: `/cbam2/monitor/plans/${planId}/evidence-relations`,
    data,
  });

export interface MonitorOrgOption {
  id: number;
  name: string;
  children?: MonitorOrgOption[];
}

export const getMonitorOrgTree = () =>
  request<ResponseData<MonitorOrgOption[]>>({
    method: 'GET',
    url: '/cbam2/cbam/orgList',
  });
