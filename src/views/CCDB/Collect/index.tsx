import I18N from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import type { GetProp, TableProps } from 'antd';
import { Table } from 'antd';
import type { SorterResult } from 'antd/es/table/interface';
import { FC, useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import backSvg from './back.svg';
import styles from './index.module.less';
import { getColumns } from '../components/Columns';
import { FullPageDetail } from '../components/FullPageDetail';
import { SearchInput } from '../components/SearchInput';
import { ccdbCollectList, Row } from '../service';

type ColumnsType<T> = TableProps<T>['columns'];
type TablePaginationConfig = Exclude<
  GetProp<TableProps, 'pagination'>,
  boolean
>;

interface DataType extends Row {
  id: string;
}

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: SorterResult<any>['field'];
  sortOrder?: SorterResult<any>['order'];
  filters?: Parameters<GetProp<TableProps, 'onChange'>>[1];
}

export interface ICollectProps {}

export const Collect: FC<ICollectProps> = () => {
  const location = useLocation<{ name: string }>();

  const searchParams = new URLSearchParams(location.search);

  const name = searchParams.get('name') || '';

  const type = searchParams.get('type') || '';

  const isPermissionDenied = type === 'permission_denied';

  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const [searchName, setSearchName] = useState(name);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {
    data: requestData,
    loading,
    run,
  } = useRequest(
    async () => {
      let sortInfo: {
        sortField?: string;
        sortType?: 'asc' | 'desc';
      } = {};
      if (tableParams.sortOrder) {
        sortInfo = {
          sortField: tableParams.sortField as string,
          sortType: tableParams.sortOrder === 'ascend' ? 'asc' : 'desc',
        };
      }
      return ccdbCollectList({
        pageNum: tableParams.pagination?.current || 1,
        pageSize: tableParams.pagination?.pageSize || 10,
        name: searchName,
        ...sortInfo,
      });
    },
    {
      refreshDeps: [
        searchName,
        tableParams.pagination?.current,
        tableParams.pagination?.pageSize,
        tableParams?.sortOrder,
        tableParams?.sortField,
      ],
    },
  );

  const resetTableParams = () => {
    setTableParams({
      pagination: {
        current: 1,
        pageSize: 10,
      },
      sortOrder: undefined,
      sortField: undefined,
    });
  };

  useEffect(
    () =>
      setTableParams(pre => ({
        ...pre,
        pagination: {
          ...pre.pagination,
          total: requestData?.data.total,
        },
      })),
    [requestData?.data.total],
  );

  const handleTableChange: TableProps['onChange'] = (
    pagination,
    filters,
    sorter,
  ) => {
    setTableParams({
      pagination,
      filters,
      sortOrder: Array.isArray(sorter) ? undefined : sorter.order,
      sortField: Array.isArray(sorter) ? undefined : sorter.field,
    });
  };
  const search = (value: string) => {
    setSearchName(value);
    resetTableParams();
  };
  const [open, setOpen] = useState(false);

  const columns: ColumnsType<DataType> = getColumns(() => {}, run, tableParams);
  const history = useHistory();
  return (
    <div className={styles.wrapper}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div
            className={styles.back}
            onClick={() =>
              history.push(
                `/CCDB/Home${
                  isPermissionDenied ? '?type=permission_denied' : ''
                }`,
              )
            }
          >
            <img src={backSvg} alt='' />
          </div>
          <div className={styles.collect}>{I18N.ccdb.myCollection}</div>
        </div>
        <div className={styles.searchInput}>
          <SearchInput
            initValue={name}
            search={search}
            autoFocus={false}
            showTips={false}
            placeholder={I18N.ccdb.searchCollectFactor}
          />
        </div>
        <div className={styles.tableTitle}>
          {requestData?.data.total} {I18N.ccdb.stripFactor}
        </div>
        <div>
          <Table<DataType>
            columns={columns}
            rowKey={(record: { id: string }) => record.id}
            dataSource={requestData?.data.rows.map(item => ({
              ...item,
              isCollectFactor: '1',
            }))}
            pagination={tableParams.pagination}
            loading={loading}
            onChange={handleTableChange}
            onRow={record => ({
              onClick: () => {
                setSelectedFactorId(record.id);
                setOpen(true);
              },
            })}
          />
        </div>
        {open && (
          <FullPageDetail
            open={open}
            hideNextPre
            onClose={() => {
              setOpen(false);
              run();
            }}
            isCollectFactor
            initFactorId={selectedFactorId}
            searchParams={{
              name: searchName,
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Collect;
