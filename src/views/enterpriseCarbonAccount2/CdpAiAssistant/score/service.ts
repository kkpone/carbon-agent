import { request } from '@/api/request';

export const postDownloadReport = (data: { reportId: number }) =>
  request<{ data: { reportUrl: string; id: string } }>({
    url: '/enterprise/cdpReportAnswer/cdpReportDown',
    data,
    method: 'POST',
  });

export const postEditReport = (data: {
  reportId: number;
  reportContent: string;
}) =>
  request<{ data: { reportUrl: string; id: string } }>({
    url: '/enterprise/cdpReportAnswer/cdpEdit',
    data,
    method: 'POST',
  });

export const getReportInfo = (params: { id: number }) =>
  request<{
    data: {
      reportUrl: string;
      id: string;
      year: string;
      cdpContent: string;
      corporateName: string;
    };
  }>({
    url: '/enterprise/cdp/report/query',
    params,
    method: 'GET',
  });
