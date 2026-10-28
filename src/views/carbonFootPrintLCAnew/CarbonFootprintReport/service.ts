import { IPageList, request, ResponseData } from '@src/api/request';

import {
  AssessmentRequest,
  AssessmentResp,
  IPageReport,
  ReportProps,
  Request,
} from './type';

/**
 * @description 碳足迹报告列表
 */
export const getReportList = (params: Request) =>
  request<ResponseData<IPageReport>>({
    method: 'GET',
    url: '/lca2/report/page',
    params,
  });

/**
 * @description 碳足迹报告新增
 */
export const postReportAdd = (data: ReportProps) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/report/add',
    data,
  });

/**
 * @description 碳足迹报告编辑
 */
export const postReportEdit = (data: ReportProps) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/report/edit',
    data,
  });

/**
 * @description 碳足迹报告详情
 */
export const getReportDetailApi = (params: { id: number }) =>
  request<ResponseData<ReportProps>>({
    method: 'GET',
    url: `/lca2/report/${params.id}`,
    params,
  });

/**
 * @description 碳足迹报告删除
 */
export const postReportDelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/report/delete',
    data,
  });

/**
 * @description 生成报告
 */
export const postReportCreateApi = (data: {
  reportId: number;
  langTypeList: string;
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/report/generate',
    data,
  });

/**
 * @description 生成报告-PEF(带有数据质量类别的生成报告)
 */
export const postReportCreateStandards = (data: {
  dataQualityCategoryList: number[];
  reportId: number;
  langTypeList: number[];
}) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/report/pef/generate',
    data,
  });

/**
 * @description 报告抽屉-选择方案弹窗列表数据
 */
export const getReportSchemeAssessmentListApi = (params: AssessmentRequest) =>
  request<ResponseData<IPageList<AssessmentResp>>>({
    method: 'GET',
    url: '/lca2/assessment/page',
    params,
  });
