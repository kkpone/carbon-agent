import { ValueOf } from 'type-fest';

import { SKU_STATUS } from './constant';

export type SkuCount = {
  total: number;
  useCount: number;
  status: ValueOf<typeof SKU_STATUS>;
};
