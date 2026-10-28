/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-15 14:42:52
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 14:46:29
 */
import { DataType } from '../types';

// scope 接口数据格式转换成 select 需要格式
export const changeData2SelectOptions = (data?: DataType[]) =>
  data?.map(d => ({
    label: d.name,
    value: d.code,
    labelSlice: `${d.name.slice(0, 6)}...`,
  }));
