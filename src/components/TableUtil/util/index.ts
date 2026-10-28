/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-05 15:36:39
 */
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';

import { ReturnDataType } from '../types/common';
import { JavaResponse, PageResult } from '../types/util';

/**
 * 表格 --- 如果返回值为空则设置文本表格显示对应传递过来的newText
 * @param val 当前返回的替换内容
 * @param newText 显示替换的文本内容
 */
const noValueBackText = (val: string | number, newText: string): string => {
  if (val || val === 0) {
    return `${val}`;
  }
  return newText || '-';
};

/**
 * 根据分页的问题动态返回序号
 * @param page 当前的页码
 *  @param pageSize 当前一页显示的条数
 * @returns 返回定制的render函数
 */
const serialNumberInit = (page: number, pageSize: number) => {
  const num = page - 1;
  return (text: any, record: any, index: number) => {
    const numIndex = index + 1;
    if (page === 1) {
      return numIndex;
    }
    return num * pageSize + numIndex;
  };
};
/**
 * 找到表格中的key或者dataIndex的值为index的数据，然后更改render方法
 * @param colnums 当前表格的colnums的配置
 * @param page 当前的页码
 * @param pageSize 当前每页显示的条数
 */
export const getIndexTableColums = <T>(
  colnums: ColumnsType<T>,
  page: number,
  pageSize: number,
) => {
  const index = colnums.findIndex(
    (res: ColumnType<T>) => res.dataIndex === 'index' || res.key === 'index',
  );
  if (index !== -1) {
    colnums[index].render = serialNumberInit(page, pageSize || 10);
  }
  return colnums;
};
/**
 * 处理表格中没有render，并且没有数据的时候的展示
 * @param colnums 当前的表头
 * @param text 传入为空的文案,默认是'-'
 * @returns 返回最新的表头
 */
export const changeTableColumsNoText = <T>(
  colnums: ColumnsType<T>,
  text: string,
) =>
  colnums.map(colnum => {
    if (!colnum.render) {
      colnum.render = (value: string | number) =>
        noValueBackText(value, text || '-');
    }
    return colnum;
  });

/** java 接口处理 data 数据 */
export const returnTableRows = <RecordType = any>(
  res: AxiosResponse<JavaResponse<RecordType>, any>,
  callback?: (data?: PageResult<RecordType>) => any,
): ReturnDataType<RecordType> => {
  const result = res?.data?.data;
  callback?.(result);
  return {
    data: result?.rows || [],
    count: result?.total || 0,
  };
};
