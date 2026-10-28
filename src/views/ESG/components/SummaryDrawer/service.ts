import { request } from '@/api/request';

import { Indicator } from '../../type';

export const getSummaryDetails = (params: { id: string }) =>
  request<{
    data: {
      baseInfo: Indicator;
      orgTasks: Record<string, any>[];
    };
  }>({
    url: '/esg/manage/indicator/info',
    params,
  });
