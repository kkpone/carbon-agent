import { Table } from 'antd';
import { TableLocale, TableRowSelection } from 'antd/lib/table/interface';
import { SearchTableListPage } from './indexjson';
import style from './Enterprise/index.module.scss';

interface Props {
  columns: any;
  dataSource: any[];
  pageTion: SearchTableListPage;
  total: number;
  handlePage: (page: SearchTableListPage) => void;
  loading: boolean;
  tableClass?: string;
  rowSelection?: TableRowSelection<any> | undefined;
  locale?: TableLocale | undefined;
  rowKey?: string;
  scroll?:
    | ({
        x?: string | number | true | undefined;
        y?: string | number | undefined;
      } & {
        scrollToFirstRowOnChange?: boolean | undefined;
      })
    | undefined;
}
const CerSearchTable = (Props: Props) => {
  const {
    columns,
    dataSource,
    pageTion,
    handlePage,
    loading,
    tableClass,
    rowSelection,
    locale,
    scroll,
    rowKey,
    total,
  } = Props;
  return (
    <Table
      locale={locale}
      scroll={scroll}
      rowSelection={rowSelection}
      loading={loading}
      className={tableClass ? style[tableClass] : style.searchTableBtn}
      columns={columns}
      dataSource={dataSource}
      rowKey={rowKey}
      pagination={{
        showSizeChanger: true,
        pageSize: pageTion.size,
        current: pageTion.page,
        total,
        onChange: (page: number, size: number) => {
          let pageList = { ...pageTion };
          if (page === pageList.page) {
            pageList = {
              ...pageList,
              page: 1,
              size,
            };
          } else {
            pageList = {
              ...pageList,
              page,
              size,
            };
          }
          handlePage(pageList);
        },
      }}
    />
  );
};
export default CerSearchTable;
