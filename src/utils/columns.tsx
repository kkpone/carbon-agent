/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-09 20:03:19
 * @LastEditors: liuxinxin xinxin@carbonstop.net
 * @LastEditTime: 2023-03-21 11:52:30
 */

import { ColumnsType } from 'antd/es/table';
import { useMemo } from 'react';

import I18N from '@/lang/I18N';

/**
 * @description table 表头 序号
 * @param start number 起始值
 */
export const useIndexColumn = <T,>(start: number): ColumnsType<T> =>
  useMemo(
    () => [
      {
        title: I18N.utils.allIndex,
        dataIndex: 'pk',
        fixed: 'left',
        ellipsis: true,
        width: 68,
        render: (t: any, _: unknown, index: number) => start + index + 1,
      },
    ],
    [start],
  );
