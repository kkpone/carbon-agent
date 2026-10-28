import { Table } from 'antd';
import '../carbon-greenMeeting.scss';

interface Props {
  dataSource: any[];
  columns: any[];
  page?: {
    current: number;
    pageSize: number;
    total: number;
  };
  onchanage: (e) => void;
  showLoading: boolean;
  rowSelection?: any;
  rowClassName?: any;
  rowKey?: any;
}
const SearchTableList = (Props: Props) => {
  const {
    dataSource,
    columns,
    page,
    onchanage,
    showLoading,
    rowSelection,
    rowClassName,
    rowKey,
  } = Props;
  return (
    <div>
      <Table
        bordered
        expandIconColumnIndex={-1}
        rowKey={rowKey}
        rowClassName={rowClassName}
        rowSelection={rowSelection}
        className='SearchTable'
        dataSource={dataSource}
        loading={showLoading}
        columns={columns}
        style={{ marginTop: '40px', width: '100%' }}
        pagination={
          page
            ? {
                pageSize: page?.pageSize,
                current: page?.current,
                total: page?.total,
                showSizeChanger: true,
              }
            : false
        }
        onChange={e => {
          const obj = {
            current: e.current,
            pageSize: e.pageSize,
            total: e.total,
          };
          onchanage(obj);
        }}
      />
    </div>
  );
};
export default SearchTableList;
