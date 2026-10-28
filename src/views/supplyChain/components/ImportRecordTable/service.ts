import { request } from '@src/api/request';
import { ValueOf } from 'type-fest';

import { ImportRecord } from './type';
import { SUPPLY_CHAIN_IMPORT_TYPE } from '../../constant';

export const getImportRecordList = (params: {
  type: ValueOf<typeof SUPPLY_CHAIN_IMPORT_TYPE>;
  pageNum: number;
  pageSize: number;
}) =>
  request<{ rows: ImportRecord[]; total: number }>({
    method: 'get',
    url: '/chain/excel/list',
    params,
  });
