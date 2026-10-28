import { request } from '@/api/request';

// 描述数据结构的类型
type ReportDetailsType = {
  id: number; // 对应id字段，值为20002
  period: string; // 对应period字段，值为"2020"
  reportName: string; // 对应reportName字段，值为"报告2"
  reportUrl: string; // 对应reportUrl字段，值为空字符串
  outline: string; // 对应outline字段，值为空字符串
  reportContent: null; // 对应reportContent字段，值为null
};

export const getReportInfo = (params: { id: number }) =>
  request<{ data: ReportDetailsType }>({
    url: '/esg/frameReport/reportInfo',
    params,
  });

export const postEditOutline = (data: { id: number; outline: string }) =>
  request<{ data: ReportDetailsType }>({
    url: '/esg/frameReport/esgOutlineEdit',
    data,
    method: 'POST',
  });

export const postEsgAnalyzeFilesExtractImages = (data: { reportId: number }) =>
  request<{ data: ReportDetailsType }>({
    url: '/esg/frameReport/esgAnalyzeFilesExtractImages',
    data,
    method: 'POST',
  });

export const getFileStatus = (params: { reportId: number }) =>
  request<{ data: { status: 0 | 1 } }>({
    url: '/esg/frameReport/getFileStatus',
    params,
    method: 'get',
  });
