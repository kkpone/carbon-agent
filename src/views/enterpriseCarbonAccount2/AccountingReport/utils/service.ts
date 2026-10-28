import { request } from '@src/api/request';

export const recordReportDownload = (params: { reportFileRecordId: number }) =>
  request({
    method: 'get',
    url: '/enterprise/calculate/report/downLoadRecord',
    params,
  });
