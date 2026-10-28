import { IPageList, request, ResponseData } from '@/api/request';

import {
  EvidenceMutationResult,
  EvidencePayload,
  OperationEvidenceList,
  JsonObject,
  OperationDefaultCnCategory,
  OperationIndustryFieldConfig,
  OperationOption,
  OperationOverview,
  OperationReportDetail,
  OperationReportPage,
  OperationReportPayload,
  OperationReportQuery,
  OperationReportSaveResult,
} from './types';

export const resolveOperationFileUrl = async (
  operationId: number | string | undefined,
  url: string,
) => {
  const prefix = 'cbam-operation-file:';
  if (!url.startsWith(prefix)) return url;
  if (!operationId) throw new Error('REPORT_REQUIRED');
  const response = await request<ResponseData<{ downloadUrl: string }>>({
    method: 'GET',
    url: '/cbam2/operationReport/agentFile/downloadUrl',
    params: { operationId, fileRefKey: url.slice(prefix.length) },
  });
  const resolved = response.data?.data?.downloadUrl;
  if (!resolved || !/^https?:\/\//.test(resolved))
    throw new Error('FILE_UNAVAILABLE');
  return resolved;
};

export const getOperationOverview = (
  params: Omit<OperationReportQuery, 'pageNum' | 'pageSize'>,
) =>
  request<ResponseData<OperationOverview>>({
    method: 'GET',
    url: '/cbam2/operationReport/overview',
    params,
  });

export const getOperationPage = (params: OperationReportQuery) =>
  request<ResponseData<OperationReportPage>>({
    method: 'GET',
    url: '/cbam2/operationReport/page',
    params,
  });

export const getOperationFactories = () =>
  request<ResponseData<OperationOption[]>>({
    method: 'GET',
    url: '/cbam2/operationReport/options/factories',
  });

export const getOperationFactoryInfo = (factoryId: number) =>
  request<ResponseData<JsonObject>>({
    method: 'GET',
    url: `/cbam2/factory/${factoryId}`,
  });

export const getOperationMonitorPlans = (factoryId: number) =>
  request<ResponseData<OperationOption[]>>({
    method: 'GET',
    url: '/cbam2/operationReport/options/monitorPlans',
    params: { factoryId },
  });

export const getOperationAccountingTasks = (planId: number) =>
  request<ResponseData<OperationOption[]>>({
    method: 'GET',
    url: '/cbam2/operationReport/options/accountingTasks',
    params: { planId },
  });

export const getOperationIndustryFieldConfig = (productCategoryId: number) =>
  request<ResponseData<OperationIndustryFieldConfig[]>>({
    method: 'GET',
    url: '/cbam2/defaultSale',
    params: { productCategoryId },
  });

export const getOperationProductCategoryByCn = (cnCode: string) =>
  request<ResponseData<IPageList<OperationDefaultCnCategory>>>({
    method: 'GET',
    url: '/cbam2/defaultCn',
    params: { pageNum: 1, pageSize: 20, cnCode },
  });

export const addOperationReport = (data: OperationReportPayload) =>
  request<ResponseData<OperationReportSaveResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/add',
    data,
    silentResponseError: true,
  });

export const getOperationReport = (operationId: number | string) =>
  request<ResponseData<OperationReportDetail>>({
    method: 'GET',
    url: `/cbam2/operationReport/info/${operationId}`,
  });

export type OperationReportLanguage = 'EN' | 'ZH';

export const generateOperationReport = (
  operationId: number | string,
  language: OperationReportLanguage,
) =>
  request<Blob>({
    method: 'POST',
    url: `/cbam2/operationReport/reports/${operationId}/${language}`,
    responseType: 'blob',
    silentResponseError: true,
  });

export const saveOperationDraft = (data: OperationReportPayload) =>
  request<ResponseData<OperationReportSaveResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/edit/draft',
    data,
    silentResponseError: true,
  });

export const saveOperationComplete = (data: OperationReportPayload) =>
  request<ResponseData<OperationReportSaveResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/edit/complete',
    data,
    silentResponseError: true,
  });

export const deleteOperationReport = (operationId: number | string) =>
  request<ResponseData<void>>({
    method: 'DELETE',
    url: `/cbam2/operationReport/delete/${operationId}`,
  });

export const getOperationEvidences = (params: {
  operationId: number | string;
  keyword?: string;
  evidenceType?: string;
  partCode?: string;
  itemKey?: string;
}) =>
  request<ResponseData<OperationEvidenceList>>({
    method: 'GET',
    url: '/cbam2/operationReport/evidence/list',
    params,
  });

export const addOperationEvidence = (data: EvidencePayload) =>
  request<ResponseData<EvidenceMutationResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/evidence/add',
    data,
    silentResponseError: true,
  });

export const editOperationEvidence = (data: EvidencePayload) =>
  request<ResponseData<EvidenceMutationResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/evidence/edit',
    data,
    silentResponseError: true,
  });

export const selectOperationEvidence = (data: {
  operationId: number | string;
  dataVersion: number;
  evidenceId?: number;
  sourceEvidenceId?: number;
  partCode: string;
  itemKey: string;
}) =>
  request<ResponseData<EvidenceMutationResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/evidence/select',
    data,
    silentResponseError: true,
  });

export const deleteOperationEvidence = (data: {
  operationId: number | string;
  dataVersion: number;
  evidenceId?: number;
  relationId?: number;
}) =>
  request<ResponseData<EvidenceMutationResult>>({
    method: 'POST',
    url: '/cbam2/operationReport/evidence/delete',
    data,
    silentResponseError: true,
  });
