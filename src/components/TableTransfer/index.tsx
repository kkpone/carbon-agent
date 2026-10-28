import { CloseOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { PageInfoType } from '@src/router/type';
import { shouldHideEcoinventValue } from '@src/utils/ecoinvent';
import { ECOINVENT_TEXT } from '@src/views/carbonFootprint3/constant';
import { FactorPatternType } from '@src/views/emission/utils/index-type';
import { AddSource } from '@src/views/enterpriseCarbonAccount2/accounting/fillData/components/addSource';
import { Modal, Table, TablePaginationConfig, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table/interface';
import { TableRowSelection } from 'antd/lib/table/interface';
import type { AxiosResponse } from 'axios';
import { concat, difference } from 'lodash-es';
import { useState, FC, useEffect, useMemo, PropsWithChildren } from 'react';

import styles from './index.module.less';
import type {
  ChooseList,
  UnselectedList,
} from '../../views/enterpriseCarbonAccount2/accounting/fillData/service';

interface TableParams {
  pagination?: TablePaginationConfig;
  sortField?: string;
  sortOrder?: string;
}

interface DataType {
  key: string;
  title?: string;
  description?: string;
  disabled?: boolean;
  tag?: string;
  name: string;
  facility: string;
  activityUnit: string;
  factorValue: string;
  activityUnitDesc: string;
  dictSourceId: string;
  factorPattern: FactorPatternType;
  ecoinventValueVisible?: boolean;
}

const leftTableColumns: ColumnsType<DataType> = [
  {
    dataIndex: 'name',
    title: I18N.components.selectAll,
    render: (_, record) => (
      <div className={styles.itemWrapper}>
        <div className={styles.nameWrapper}>
          <span onClick={e => e.stopPropagation()}>
            <AddSource
              dictSourceId={record.dictSourceId}
              computationId=''
              modelId=''
              pageInfoType={PageInfoType.edit}
              fromSource='model'
              readPretty
            >
              <span className={styles.name} title={record?.name}>
                {record.name}
              </span>
            </AddSource>
          </span>

          <span className={styles.facility} title={record?.facility}>
            {record.facility}
          </span>
        </div>
        <div>
          <span>
            {I18N.components.unit}
            {record.activityUnitDesc}{' '}
          </span>
          <span>
            {I18N.components.factorValue}
            {shouldHideEcoinventValue(record)
              ? ECOINVENT_TEXT
              : record.factorValue}
          </span>
        </div>
      </div>
    ),
  },
];

type TableTransferAppProps = {
  groupId?: number;
  addSuccess: () => void;
  getSourceChooseList: () => Promise<ChooseList['data']>;
  getSourceUnselectedList: (params: {
    pageNum?: number;
    pageSize?: number;
    name?: string;
  }) => Promise<AxiosResponse<UnselectedList, any>>;
  saveSelectSource: (params: {
    groupId?: number;
    deleteSourceList: { id: number }[];
    dictSourceList: { id: number }[];
  }) => void;
  stringTitle: string;
};

export const TableTransferApp: FC<
  PropsWithChildren<TableTransferAppProps>
> = props => {
  const {
    groupId,
    getSourceChooseList,
    getSourceUnselectedList,
    stringTitle,
    saveSelectSource,
  } = props;
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [visible, setVisible] = useState(false);
  // 原始数据
  const [originTargetKeys, setOriginTargetKeys] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const [AllFetchDataSource, setAllFetchDataSource] = useState<
    UnselectedList['rows']
  >([]);

  const [chooseList, setChooseList] = useState<ChooseList['data']>([]);

  const [name, setName] = useState('');

  const [tableParams, setTableParams] = useState<TableParams>({
    pagination: {
      current: 1,
      pageSize: 100000,
    },
  });

  const allData = useMemo(
    () =>
      concat(chooseList, AllFetchDataSource as unknown as ChooseList['data']),
    [chooseList, AllFetchDataSource],
  );

  useEffect(() => {
    if (visible) {
      const getData = async () => {
        const data = await getSourceChooseList();
        setOriginTargetKeys(data.map(item => item.dictSourceId!));
        setSelectedRowKeys(data.map(item => item.dictSourceId!));
        setChooseList(data);
      };
      getData();
    }
  }, [visible]);

  const fetchData = async ({
    searchName,
    current,
    pageSize,
  }: {
    searchName?: string;
    current?: number;
    pageSize?: number;
  }) => {
    setLoading(true);

    const unselected = await getSourceUnselectedList({
      pageNum: current,
      pageSize,
      name: searchName,
    });

    setTableParams({
      ...tableParams,
      pagination: {
        current,
        pageSize,
        total: unselected.data.total,
      },
    });
    const fetchedData = unselected.data.rows.map(item => ({
      ...item,
      key: item.dictSourceId,
      id: item.dictSourceId,
    }));
    setDataSource(fetchedData);
    setAllFetchDataSource(pre => concat(pre, fetchedData));
    setLoading(false);
  };

  useEffect(() => {
    if (visible) {
      fetchData({
        searchName: name,
        pageSize: tableParams.pagination?.pageSize,
        current: tableParams.pagination?.current,
      });
    }
  }, [visible]);

  const handleTableChange = (pagination: TablePaginationConfig) => {
    setTableParams({
      pagination,
    });
    fetchData({
      searchName: name,
      pageSize: pagination?.pageSize,
      current: pagination?.current,
    });
  };
  const Submit = async () => {
    setConfirmLoading(true);
    try {
      await saveSelectSource({
        groupId: Number(groupId),
        deleteSourceList: difference(originTargetKeys, selectedRowKeys).map(
          key => {
            const item = chooseList.find(
              chooseListItem => chooseListItem.dictSourceId === key,
            );
            return {
              id: item?.id!,
            };
          },
        ),
        dictSourceList: difference(selectedRowKeys, originTargetKeys).map(
          item => ({
            id: item,
          }),
        ),
      });
      setVisible(false);
      props.addSuccess();
    } finally {
      setConfirmLoading(false);
    }
  };

  const rowSelection: TableRowSelection<DataType> = {
    selectedRowKeys,
    onChange: (keys: React.Key[], _, info) => {
      if (info.type === 'all') {
        if (keys.length > 0) {
          setSelectedRowKeys(pre =>
            concat(pre, difference(keys as number[], pre)),
          );
        } else {
          setSelectedRowKeys(pre =>
            difference(
              pre,
              dataSource.map(item => item.id),
            ),
          );
        }
      }
    },
    onSelect: (record: { key: number | string }, selected: boolean) => {
      if (selected) {
        setSelectedRowKeys(pre => concat(pre, record.key as number));
      } else {
        setSelectedRowKeys(pre => difference(pre, [record.key as number]));
      }
    },
  };

  const deleteItem = (itemKey: number) => {
    setSelectedRowKeys(pre => difference(pre, [itemKey]));
  };
  return (
    <>
      <Modal
        title={I18N.components.fromEmissionSources}
        open={visible}
        onCancel={() => setVisible(false)}
        width={900}
        confirmLoading={confirmLoading}
        onOk={() => Submit()}
        centered
        className={styles.modal}
      >
        <div className={styles.wrapper}>
          <div className={styles.tableWrapper}>
            <Input.Search
              allowClear
              onSearch={value => {
                fetchData({
                  searchName: value,
                  pageSize: tableParams.pagination?.pageSize,
                  current: tableParams.pagination?.current,
                });
                setName(value);
              }}
              placeholder={I18N.components.pleaseEnterTheContent}
            />
            <div className={styles.names}>{stringTitle}</div>
            <div className={styles.table}>
              <Table
                rowKey='key'
                columns={leftTableColumns}
                dataSource={dataSource}
                pagination={false}
                loading={loading}
                onChange={handleTableChange}
                rowSelection={rowSelection}
                scroll={{
                  y: 440,
                }}
                onRow={record => ({
                  onClick: () => {
                    setSelectedRowKeys(pre => {
                      const key = Number(record.key);
                      if (pre.includes(key)) {
                        return difference(pre, [key]);
                      }
                      return concat(pre, [key]);
                    });
                  },
                })}
              />
            </div>
          </div>
          <div className={styles.selectedBox}>
            <div className={styles.selectedTitle}>
              {I18N.components.selected2}
            </div>
            <div className={styles.selectedItemWrapper}>
              {selectedRowKeys.map(item => {
                const record = allData.find(
                  findItem => findItem.dictSourceId === item,
                );
                return (
                  <div className={styles.selectedItem} key={item}>
                    <div className={styles.itemWrapper}>
                      <div className={styles.nameWrapper}>
                        <AddSource
                          dictSourceId={record?.dictSourceId?.toString()}
                          computationId=''
                          modelId=''
                          pageInfoType={PageInfoType.edit}
                          fromSource='model'
                          readPretty
                        >
                          <span className={styles.name} title={record?.name}>
                            {record?.name}
                          </span>
                        </AddSource>

                        <span
                          className={styles.facility}
                          title={record?.facility}
                        >
                          {record?.facility}
                        </span>
                      </div>
                      <div>
                        <span>
                          {I18N.components.unit}
                          {record?.activityUnitDesc}{' '}
                        </span>
                        <span>
                          {I18N.components.factorValue}
                          {shouldHideEcoinventValue(record)
                            ? ECOINVENT_TEXT
                            : record?.factorValue}
                        </span>
                      </div>
                    </div>
                    <div
                      className={styles.close}
                      onClick={() => deleteItem(item)}
                    >
                      <CloseOutlined />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Modal>
      <div onClick={() => setVisible(true)}>{props.children}</div>
    </>
  );
};
