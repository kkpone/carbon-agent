import { request } from '@src/api/request';

import { SearchParams, AuditData } from './type';

export const getAuditData = (
  params: SearchParams & { pageNum: number; pageSize: number },
) =>
  request<{ rows: AuditData[]; total: number }>({
    method: 'get',
    url: '/chain/data/inner/footprint/list',
    params,
  });
