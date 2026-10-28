import { useCallback, useEffect, useState } from 'react';
import { Table } from 'antd';
import { PaginationProps } from 'antd/lib/pagination';
import { TableProps } from 'antd/lib/table';
import { PageResponseData } from '../../typings';

// 基本的表格组件，后续根据需求可继续完善

interface BaseTableProps<T> extends TableProps<T> {
  data: {
    list: T[];
    page?: PageResponseData;
  };
  rowKey?: string;
  children?: React.ReactNode;
  onChange: (page: PaginationProps) => void;
}

/**
 * @deprecated 这个table已经过时了，请使用 src/components/TableUtil/page/CommonTable.tsx
 */
const BaseTable = <T extends { [key: string]: any }>(
  props: BaseTableProps<T>,
) => {
  const {
    data: { list, page },
    scroll,
    rowKey,
    ...resetProps
  } = props;

  const [pagination, setPagination] = useState<PaginationProps>({
    current: page?.page,
    pageSize: page?.size,
    showSizeChanger: true,
  });

  const onTableChange = useCallback((pageParams: PaginationProps) => {
    setPagination({ ...pageParams });
    props.onChange(pageParams);
  }, []);

  useEffect(() => {
    setPagination({
      current: page?.page,
      pageSize: page?.size,
      showSizeChanger: true,
    });
  }, [page]);

  return (
    <Table<T>
      bordered
      scroll={scroll}
      {...resetProps}
      onChange={onTableChange}
      //   style={{ marginTop: '40px' }}
      dataSource={list}
      rowKey={(record: T) =>
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${record[rowKey as keyof T] || record?.key || record?.id || ''}`
      }
      pagination={{
        ...pagination,
        total: page?.dataTotal,
      }}
    >
      {props?.children}
    </Table>
  );
};

export default BaseTable;
