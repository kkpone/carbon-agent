import { request } from '@src/api/request';

import { Org } from '../AccountingList/type';

export const getTrendAnalysisOrgData = (params: { yearNum: number }) =>
  request<{ data: Org[] }>({
    method: 'get',
    url: '/enterprise/computation/task/trendAnalysis/orgTree',
    params,
  });
