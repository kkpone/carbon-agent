/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-02-16 16:31:13
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-15 15:35:35
 */
import { TableProps } from 'antd';
import { FilterValue } from 'antd/es/table/interface';
import { ColumnsType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import { Ref } from 'react';

import { FetchPage } from './util';

/**
 * table ref 暴露方法
 */
export type TableRef<T extends Record<string, any> = Record<string, any>> = {
  reset: (page?: Partial<FetchPage>) => Promise<void>;
  getTableData: () => T[];
  initTableData: () => Promise<any>;
};

export type ReturnDataType<T> = {
  data: T[];
  count: number;
};

/**
 * 通用组件的参数 --- T: 是当前接口返回的每条数据的类型 P: 是当前接口取值的方式
 */
export interface CommonProps<
  Row,
  AxiosResponseData,
  SearchParams = Record<string | number, any>,
> extends TableProps<Row> {
  /** 表头 */
  columns: ColumnsType<Row>;
  /** 子组件ref */
  cRef?: Ref<TableRef | undefined>;
  /** 当前接口调用的方法 */
  fetchApi: (
    params: FetchPage & SearchParams,
  ) => Promise<AxiosResponse<AxiosResponseData, any>>;
  // resetTable: () => void; // 更新当前表格 主动触发初始化
  /** 过滤接口数据，返回组件需要的数据格式 */
  returnFetchApi?: (
    data: AxiosResponse<AxiosResponseData, any>,
  ) => ReturnDataType<Row>;
  /** 查询条件 */
  searchParams?: SearchParams;
  /** 每页展示的数据条数 */
  pageSize?: number;
  /** 控制是否在底部 */
  pagePosition?: boolean;
  /** 是否显示分页条 */
  showPageBar?: boolean;
  /** 表格改变 插入写法 */
  onChangeInsert?: (
    pagination: any,
    filters: Record<string, FilterValue | null>,
  ) => void;
  /** 表格改变 排序写法 */
  onSorterChange?: (
    pagination: any,
    filters: Record<string, FilterValue | null>,
    sorter: {
      field: string;
      order: 'ascend' | 'descend' | undefined;
    },
  ) => void;
  /** 搜索前是否需要先清空现有的 table 内容 */
  resetBeforeSearch?: boolean;
}
