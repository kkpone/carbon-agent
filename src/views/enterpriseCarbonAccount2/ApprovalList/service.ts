import I18N from '@src/lang/I18N';
import { request } from '@/api/request';

import { ApprovalOption, ApprovalSearchParams, ApprovalTask } from './type';

// 获取审批列表
export const getApprovalList = (params: ApprovalSearchParams) =>
  request<{
    rows: ApprovalTask[];
    total: number;
    sumTotal: number;
    waitDealTotal: number;
    flowingCount: number;
    completeCount: number;
    cancelCount: number;
    backCount: number;
  }>({
    url: '/enterprise/source/task/auditTaskList',
    method: 'POST',
    data: params,
  });

// 获取审批筛选项
export const getApprovalOption = (params: { ticket?: string }) =>
  request<{
    data: ApprovalOption;
  }>({
    url: '/enterprise/source/task/org/list',
    method: 'GET',
    params: {
      ...params,
      type: '2',
    },
  });

// 审批提交（通过/驳回）
export const auditTaskSubmit = (params: {
  idList: number[];
  auditStatus: '1' | '2'; // 1: 通过, 2: 驳回
  opinion?: string;
  ticket?: string;
}) =>
  request({
    url: '/enterprise/source/task/auditTaskSubmit//batch',
    method: 'POST',
    data: params,
  });

// 审批通过
export const approveTask = (params: {
  idList: number[];
  opinion?: string;
  ticket?: string;
}) =>
  auditTaskSubmit({
    idList: params.idList,
    auditStatus: '1',
    opinion: params.opinion || I18N.carbonAccount.adopt,
    ticket: params.ticket,
  });

// 审批驳回
export const rejectTask = (params: {
  idList: number[];
  reason: string;
  ticket?: string;
}) =>
  auditTaskSubmit({
    idList: params.idList,
    auditStatus: '2',
    opinion: params.reason,
    ticket: params.ticket,
  });

// 下载附件
export const batchDownloadAttachment = (params: {
  supportImgIds: number[];
  ticket?: string;
}) =>
  request<{
    data: { url: string };
  }>({
    url: '/enterprise/carbon/account/attachment/batchDownload',
    method: 'POST',
    data: params,
  });
