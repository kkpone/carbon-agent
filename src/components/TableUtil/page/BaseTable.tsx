/*
 * @Author: 张明尧
 * @Date: 2022-07-29 11:37:25
 */
import { PaginationProps, Table, Select as AntSelect } from 'antd';
import { FilterValue } from 'antd/es/table/interface';
import { TableProps } from 'antd/lib/table';
import { ReactNode } from 'react';

import style from '../style/index.module.less';
import { FetchPage } from '../types/util';

// 基本的表格组件，后续根据需求可继续完善
interface BaseTableProps<T> extends TableProps<T> {
  tableData?: T[];
  // rowKey?: string; // rowKey 使用table继承过来的类型
  children?: ReactNode;
  pageParams?: FetchPage & { total: number; userShowPageBar: boolean };
  onTableChange: (
    pageParams: PaginationProps,
    filters: Record<string, FilterValue | null>,
    sorter: {
      field: string;
      order: 'ascend' | 'descend' | undefined;
    },
  ) => void;
}

const Select = props => (
  <AntSelect
    {...props}
    className={`${props.prefixCls}-size-changer`}
    placement='topRight'
  />
);
Select.Option = AntSelect.Option;

const BaseTable = <T = Record<any, any>,>(props: BaseTableProps<T>) => {
  const {
    tableData = [],
    rowKey = 'id',
    pageParams,
    onTableChange,
    pagination,
    ...resetProps
  } = props;

  return (
    <div className={style.base_table}>
      {/* @ts-ignore */}
      <Table<T>
        rowKey={rowKey}
        dataSource={tableData}
        onChange={onTableChange}
        pagination={
          pageParams && pagination !== false
            ? {
                current: pageParams.page,
                total: pageParams.total,
                defaultPageSize: pageParams.size,
                showSizeChanger: true,
                selectComponentClass: Select,
                // pageSize: pageParams.size,
                ...pagination,
              }
            : false
        }
        {...resetProps}
      >
        {props?.children}
      </Table>
    </div>
  );
};

export default BaseTable;
