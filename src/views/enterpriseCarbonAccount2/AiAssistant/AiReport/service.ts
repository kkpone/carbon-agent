import { request } from '@src/api/request';
import { ValueOf } from 'type-fest';

import { AI_TIP_STATUS, REPORT_CLOSE_STATUS } from './constant';
import {
  Industry,
  Report,
  ReportOverview,
  ReportStatus,
  SearchParams,
} from './type';

export const getReportData = (params: {
  year?: string;
  industry?: number | string;
}) =>
  request<{
    data: ReportOverview;
  }>({
    method: 'get',
    url: '/enterprise/cdpReportData/reportData',
    params,
  });

export const getReportList = (params: Omit<SearchParams, 'refreshFlag'>) =>
  request<{ rows: Report[]; total: number }>({
    method: 'get',
    url: '/enterprise/cdpReportData/list',
    params,
  });

export const getYearList = () =>
  request<{ data: { yearList: string[] } }>({
    method: 'get',
    url: '/enterprise/cdpReportData/getReportYear',
  });

export const getIndustryList = () =>
  request<{ data: { cdp_industry: Industry[] } }>({
    method: 'get',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params: { dictTypes: 'cdp_industry' },
  });

export const collectReport = (params: { reportId: number }) =>
  request({
    method: 'post',
    url: '/enterprise/cdpReportData/reportCollect',
    params,
  });

export const getReportAnalyzeStatus = () =>
  request<{ data: ReportStatus }>({
    method: 'get',
    url: '/enterprise/cdpReportData/analysis/status',
  });

export const analyzeReport = (data: {
  name: string;
  url: string;
  year: string;
  scores?: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/cdpReportData/analysis',
    data,
  });

export const closeReportAnalyzeStatus = () =>
  request<{ data: { closeStatus: ValueOf<typeof REPORT_CLOSE_STATUS> } }>({
    method: 'get',
    url: '/enterprise/cdpReportData/analysis/status/close',
  });

export const getAiTipStatus = () =>
  request<{ data: { closeStatus: ValueOf<typeof AI_TIP_STATUS> } }>({
    method: 'get',
    url: '/enterprise/cdpReportData/ai/status',
  });

export const closeAiTip = () =>
  request({
    method: 'get',
    url: '/enterprise/cdpReportData/ai/pop/close',
  });
