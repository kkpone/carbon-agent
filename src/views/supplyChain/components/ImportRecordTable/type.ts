import { ValueOf } from 'type-fest';

import { IMPORT_STATUS, SUPPLY_CHAIN_IMPORT_TYPE } from '../../constant';

export type ImportRecord = {
  id: number;
  companyId: number;
  name: string;
  // 源文件地址
  url: string;
  // 错误文件地址
  failUrl: string;
  success: number;
  fail: number;
  total: number;
  status: ValueOf<typeof IMPORT_STATUS>;
  type: ValueOf<typeof SUPPLY_CHAIN_IMPORT_TYPE>;
  operateKey: string;
  statusDesc: string;
};
