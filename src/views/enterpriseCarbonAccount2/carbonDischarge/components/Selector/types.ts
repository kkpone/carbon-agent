/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-05 10:01:33
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 10:19:05
 */

import { NewSelectProps } from '@src/components/Select';
import { SourceLabel } from '@src/sdks_v2/enterpriseV2ApiDocs';
import { SelectValue } from 'antd/lib/select';

/** 活动数据记录方式 0   活动数据保存部门 1  排放因子来源 2 */
export type SelectType = 0 | 1 | 2;
export type ValueTypes = string | number | undefined;
export type Props<T = Options[] | string[], ValueType = ValueTypes> = {
  placeholder?: string;
  onChange?: (value: SelectValue) => void;
  options?: T;
  style?: React.CSSProperties;
  defaultValue?: string | number;
  value?: string | number;
  filterOption?: NewSelectProps<T, ValueType>['filterOption'];
  disabled?: boolean;
  className?: string;
  type: SelectType;
  dropdownClassName?: NewSelectProps<T, ValueType>['dropdownClassName'];
} & OriginSelectProps;

type OriginSelectProps<T = Options[] | string[], ValueType = any> = Omit<
  NewSelectProps<T, ValueType>,
  'defaultValue' | 'value'
>;
export type Options = {
  label: string;
  value: string | number;
  user?: number;
  [key: string]: any;
};

export type DataType = Record<SelectType, SourceLabel[]>;
