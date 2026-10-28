import { request } from '@/api/request';

export const postDownloadReport = (data: { id: number }) =>
  request<{ data: { reportUrl: string; id: string } }>({
    url: '/esg/frameReport/esgReportDown',
    data,
    method: 'POST',
  });

export const postEditReport = (data: { id: number; reportContent: string }) =>
  request<{ data: { reportUrl: string; id: string } }>({
    url: '/esg/frameReport/esgReportEdit',
    data,
    method: 'POST',
  });
