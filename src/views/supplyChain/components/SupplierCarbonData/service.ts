import { request } from '@src/api/request';

import { AuditRecord } from './type';
import { CARBON_DATA_STATUS } from '../../constant';

export const getAuditRecordList = (params: {
  pageNum: number;
  pageSize: number;
  id: number;
}) =>
  request<{ rows: AuditRecord[]; total: number }>({
    method: 'get',
    url: '/chain/data/audit/list',
    params,
  });

export const carbonDataAudit = (params: {
  id: number;
  result:
    | typeof CARBON_DATA_STATUS.APPROVED
    | typeof CARBON_DATA_STATUS.DISAPPROVED;
  content?: string;
}) =>
  request({
    method: 'get',
    url: '/chain/data/audit',
    params,
  });
