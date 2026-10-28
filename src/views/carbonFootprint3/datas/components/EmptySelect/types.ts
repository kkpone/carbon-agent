/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-25 11:05:53
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-25 14:20:15
 */

import { ProductListData } from '../../Compare/types';

export type EmptySelectProps<ValueType> = {
  options?: ProductListData[];
  value?: ValueType;
  noWrapper?: boolean;
  onChange?: (v: ValueType) => void;
  // 选择产品名称
  selectName?: string;
  // 清空回调
  onClear?: () => void;
};
