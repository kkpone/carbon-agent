import { request } from '@/api/request';

import { Indicator } from '../type';

export const getSummaryList = (params: {
  frameId: number;
  name?: string;
  standardIds?: string;
  status?: string;
}) =>
  request<{
    data: {
      dataTree: Indicator[];
      status: number;
      finishCount: number;
      totalCount: number;
    };
  }>({
    url: '/esg/manage/topic/tree',
    params,
  });

export const exportSummaryData = (params: { frameId: number }) =>
  request<Blob>({
    url: '/esg/manage/export',
    params,
    responseType: 'blob',
  });
