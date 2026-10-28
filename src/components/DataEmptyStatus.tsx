/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Table } from 'antd';
import { TablePaginationConfig } from 'antd/es/table';

type Pagination = {
  onChange?: (page: number, pageSize: number) => void;
} & Omit<TablePaginationConfig, 'onChange'>;

// 表格dataSource,columns
interface DataEmptyStatusProps {
  columns?: any;
  scroll?: any;
  dataSource?: object[];
  pagination?: Pagination | false;
  loadIcon?: boolean;
  bordered?: boolean;
}
const DataEmptyStatus = (props: DataEmptyStatusProps) => {
  const { columns, dataSource, pagination, scroll, loadIcon, bordered } = props;

  return (
    <Table
      dataSource={dataSource}
      bordered={bordered || false}
      loading={loadIcon}
      scroll={scroll}
      columns={columns}
      pagination={
        !pagination
          ? false
          : {
              ...pagination,
              onChange: (page: number, pageSize?: number) =>
                pagination?.onChange?.(page, pageSize || 10),
            }
      }
    />
  );
};

export default DataEmptyStatus;
