/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-24 16:30:05
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-13 10:26:47
 */
import { get } from 'lodash-es';

/**
 * @description 计算 table rowSpan
 */
export const calcRowSpan = <T = any>({
  data,
  key,
  currentIndex,
  row,
}: {
  data?: T[];
  key: keyof T;
  currentIndex: number;
  row: T;
}) => {
  const rowVal = get(row, key);
  // 条件不足，保持原装
  if (!data?.length || !rowVal) return { rowSpan: 1 };

  const valueInData = get(data[currentIndex], key);

  if (!valueInData) return { rowSpan: 1 };

  // 非第一条数据 & 之前已有 rowSpan 值 ，去除当前row
  if (
    currentIndex !== 0 &&
    get(data[currentIndex - 1], key) === get(row, key)
  ) {
    return { rowSpan: 0 };
  }

  // 判断需要合并多少行
  for (let i = currentIndex; i < (data?.length || 0); i++) {
    if (get(data[i], key) !== rowVal) {
      return { rowSpan: i - currentIndex };
    }
    // 最后一条数据
    if (i === data.length - 1) {
      return { rowSpan: i - currentIndex + 1 };
    }
  }
  return { rowSpan: 1 };
};
