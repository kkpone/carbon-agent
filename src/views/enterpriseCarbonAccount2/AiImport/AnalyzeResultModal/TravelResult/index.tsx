/* eslint-disable react/no-unstable-nested-components */
import AiSvg from '@src/assets/icon/esg/ai.svg';
import I18N from '@src/lang/I18N';
import { useMount, useUnmount } from 'ahooks';
import {
  Button,
  Cascader,
  message,
  Modal,
  Popover,
  Segmented,
  Table,
  TableColumnsType,
  Tabs,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import { isNil, omit } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import NumberInputTableCell from '@/components/NumberInputTableCell';
import TableInputFilter from '@/components/TableInputFilter';
import { IconAlibabaNew } from '@/components/iconfont';
import { useGHGList } from '@/hooks/useScope';
import { Toast } from '@/utils';

import styles from './index.module.less';
import {
  batchDeleteTempData,
  deleteTempData,
  editTempData,
  getAnalyzeList,
  getTravelImportStatus,
} from './service';
import { TravelRoomTempData } from './type';
import BindEmissionSelect from '../../BindEmissionSelect';
import {
  TRAVEL_ANALYZE_ERROR_LABEL,
  ROOM_ANALYZE_ERROR_LABEL,
  IMPORT_STATUS,
} from '../../constant';
import { getComputationSourceList } from '../service';
import { ComputationSource } from '../type';

type TravelResultProps = {
  computationId: string;
  computationPeriod: string;
  importStatus: number;
  onClose: () => void;
  setAnalyzing: (val: boolean) => void;
};

const messageKey = 'travelImportStatus';

const TEMP_DATA_TYPE = {
  TRAVEL: 0,
  ROOM: 1,
};

const TravelResult: FC<TravelResultProps> = ({
  computationId,
  computationPeriod,
  importStatus: importStatusFromProps,
  onClose,
  setAnalyzing,
}) => {
  const [count, setCount] = useState({
    total: 0,
    sumTotal: 0,
    waitDealTotal: 0,
  });

  const [loading, setLoading] = useState(false);

  const [importStatus, setImportStatus] = useState(importStatusFromProps);

  const [computationSource, setComputationSource] = useState<
    ComputationSource[]
  >([]);

  const [tempDataList, setTempDataList] = useState<TravelRoomTempData[]>([]);

  const [selectedList, setSelectedList] = useState<TravelRoomTempData[]>([]);

  const [searchParams, setSearchParams] = useState<{
    computationId: string;
    computationPeriod: string;
    pageNum: number;
    pageSize: number;
    type: number;
    error?: number;
    startPoint?: string;
    endPoint?: string;
    name?: string;
    country?: string;
  }>({
    pageNum: 1,
    pageSize: 10,
    computationId,
    computationPeriod,
    type: TEMP_DATA_TYPE.TRAVEL,
    error: 0,
  });

  const [messageApi, contextHolder] = message.useMessage();

  const timerRef = useRef<NodeJS.Timeout>();

  const GHGList = useGHGList();

  const queryTempList = async params => {
    try {
      setLoading(true);
      const { data } = await getAnalyzeList(params);
      setTempDataList(data.rows);
      setCount({
        total: data.total,
        sumTotal: data.sumTotal,
        waitDealTotal: data.waitDealTotal,
      });
    } finally {
      setLoading(false);
    }
  };

  const editData = async (tempData: TravelRoomTempData) => {
    await editTempData(tempData);
    queryTempList(searchParams);
  };

  const deleteData = (tempData: TravelRoomTempData) => {
    Modal.confirm({
      icon: null,
      title: I18N.base.confirm,
      content: I18N.enterpriseCarbonAccount2.doYouWantToDeleteIt,
      onOk: async () => {
        await deleteTempData(tempData.id);
        setSelectedList(selectedList.filter(item => item.id !== tempData.id));
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryTempList(searchParams);
      },
    });
  };

  const batchDeleteData = () => {
    Modal.confirm({
      icon: null,
      title: I18N.components.batchDeletion,
      content: (
        <div>
          {I18N.components.selected}
          {selectedList.length}
          {I18N.enterpriseCarbonAccount2.isThereAnyData}
        </div>
      ),
      onOk: async () => {
        await batchDeleteTempData({
          idList: selectedList.map(item => item.id),
        });
        setSelectedList([]);
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        queryTempList(searchParams);
      },
    });
  };

  const columns: TableColumnsType<TravelRoomTempData> = [
    {
      title: I18N.carbonFootprint.number,
      dataIndex: '__No__',
      width: 64,
      fixed: 'left' as const,
      render: (_, record, index) => (
        <div className={styles.flexRow}>
          <span>
            {(searchParams.pageNum - 1) * searchParams.pageSize + index + 1}
          </span>
          {(record.errorList || []).length > 0 && (
            <Popover
              rootClassName={styles.errorPopover}
              placement='bottomLeft'
              content={
                <div>
                  {record.errorList.map(err => (
                    <div className={styles.flexRow} key={err.type}>
                      <IconAlibabaNew
                        className={styles.errorIcon}
                        type='icon-icon-tishi'
                      />
                      <span className={styles.errorText}>
                        {
                          (searchParams.type === TEMP_DATA_TYPE.TRAVEL
                            ? TRAVEL_ANALYZE_ERROR_LABEL
                            : ROOM_ANALYZE_ERROR_LABEL)[err.type]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              }
            >
              <div className={styles.errorTag}>Error</div>
            </Popover>
          )}
        </div>
      ),
    },
    ...(searchParams.type === TEMP_DATA_TYPE.TRAVEL
      ? [
          {
            title: I18N.enterpriseCarbonAccount2.origin,
            dataIndex: 'startPoint',
            width: 100,
            ellipsis: true,
            filteredValue: searchParams.startPoint
              ? [searchParams.startPoint]
              : [],
            filterDropdown: props => {
              const { selectedKeys, setSelectedKeys, confirm } = props;
              return (
                <TableInputFilter
                  selectedKeys={selectedKeys}
                  setSelectedKeys={setSelectedKeys}
                  confirm={confirm}
                />
              );
            },

            render: text => text || '-',
          },
          {
            title: I18N.enterpriseCarbonAccount2.destination,
            dataIndex: 'endPoint',
            width: 100,
            ellipsis: true,
            filteredValue: searchParams.endPoint ? [searchParams.endPoint] : [],
            filterDropdown: props => {
              const { selectedKeys, setSelectedKeys, confirm } = props;
              return (
                <TableInputFilter
                  selectedKeys={selectedKeys}
                  setSelectedKeys={setSelectedKeys}
                  confirm={confirm}
                />
              );
            },
            render: text => text || '-',
          },
          {
            title: I18N.enterpriseCarbonAccount2.modeOfTransportation,
            dataIndex: 'travelWay',
            width: 126,
            ellipsis: true,
            filteredValue: searchParams.name ? [searchParams.name] : [],
            filterDropdown: props => {
              const { selectedKeys, setSelectedKeys, confirm } = props;
              return (
                <TableInputFilter
                  selectedKeys={selectedKeys}
                  setSelectedKeys={setSelectedKeys}
                  confirm={confirm}
                />
              );
            },
            render: text => text || '-',
          },
          {
            title: I18N.enterpriseCarbonAccount2.oneWayDistance,
            dataIndex: 'singleDistance',
            width: 196,
            render: (_, record: TravelRoomTempData) => (
              <NumberInputTableCell
                value={record.singleDistance}
                placeholder={I18N.base.pleaseEnter}
                min={0}
                controls={false}
                onBlur={singleDistance => {
                  editData({
                    ...record,
                    singleDistance: singleDistance as number,
                  });
                }}
              />
            ),
          },
          {
            title: I18N.enterpriseCarbonAccount2.relatedDataVolume,
            dataIndex: 'dataCount',
            width: 120,
            render: (_, record: TravelRoomTempData) => (
              <NumberInputTableCell
                value={record.dataCount}
                placeholder={I18N.base.pleaseEnter}
                min={0}
                precision={0}
                controls={false}
                onBlur={dataCount => {
                  editData({ ...record, dataCount: dataCount as number });
                }}
              />
            ),
          },
          {
            title: I18N.enterpriseCarbonAccount2.summarizeDistancePeople,
            dataIndex: 'activityData',
            width: 164,
            ellipsis: true,
            render: activityData =>
              isNil(activityData) ? (
                '-'
              ) : (
                <span className={styles.distance}>{activityData}</span>
              ),
          },
        ]
      : [
          {
            title: I18N.carbonFootprint.country,
            dataIndex: 'country',
            width: 144,
            ellipsis: true,
            filteredValue: searchParams.country ? [searchParams.country] : [],
            filterDropdown: props => {
              const { selectedKeys, setSelectedKeys, confirm } = props;
              return (
                <TableInputFilter
                  selectedKeys={selectedKeys}
                  setSelectedKeys={setSelectedKeys}
                  confirm={confirm}
                />
              );
            },
            render: text => text || '-',
          },
          {
            title: I18N.cbam.city,
            dataIndex: 'city',
            width: 144,
            ellipsis: true,
            render: text => text || '-',
          },
          {
            title: I18N.enterpriseCarbonAccount2.relatedDataVolume,
            dataIndex: 'dataCount',
            width: 254,
            render: (_, record: TravelRoomTempData) => (
              <NumberInputTableCell
                value={record.dataCount}
                placeholder={I18N.base.pleaseEnter}
                min={0}
                precision={0}
                controls={false}
                onBlur={dataCount => {
                  editData({ ...record, dataCount: dataCount as number });
                }}
              />
            ),
          },
          {
            title: (
              <div className={styles.flexRow}>
                <span>{I18N.enterpriseCarbonAccount2.numberOfNights}</span>
                <Tooltip
                  title={I18N.enterpriseCarbonAccount2.numberOfRoomsPerNight}
                >
                  <IconAlibabaNew
                    className={styles.tipIcon}
                    type='icon-icon-tishi'
                  />
                </Tooltip>
              </div>
            ),
            dataIndex: 'activityData',
            width: 224,
            render: (_, record: TravelRoomTempData) => (
              <NumberInputTableCell
                value={record.activityData}
                placeholder={I18N.base.pleaseEnter}
                min={0}
                precision={0}
                controls={false}
                onBlur={activityData => {
                  editData({ ...record, activityData: activityData as number });
                }}
              />
            ),
          },
        ]),
    {
      title: (
        <div className={styles.flexRow}>
          <span>{I18N.enterpriseCarbonAccount2.bindingEmissionSources}</span>
          <Tooltip
            title={
              <div>
                <div>{I18N.enterpriseCarbonAccount2.newAddition}</div>
                <div className={styles.tipRow}>
                  <IconAlibabaNew
                    className={styles.bindIcon}
                    type='icon-guanlian'
                  />
                  {I18N.enterpriseCarbonAccount2.existingWithTheList}
                </div>
              </div>
            }
          >
            <IconAlibabaNew className={styles.tipIcon} type='icon-icon-tishi' />
          </Tooltip>
        </div>
      ),
      dataIndex: 'bindId',
      width: 334,
      className: styles.boldColumn,
      // filterSearch: (input, record) =>
      //   (record as unknown as { searchText: string }).searchText.includes(
      //     input,
      //   ),
      // filters: computationSource.map(source => ({
      //   value: source.id,
      //   searchText: source.name + source.facility,
      //   text: <BindEmission source={source} inline />,
      // })),
      render: (_, record) => (
        <BindEmissionSelect
          value={record.bindId}
          sourceList={computationSource}
          onChange={bindId => {
            editData({
              ...record,
              bindId,
            });
          }}
        />
      ),
    },
    {
      title: I18N.eca.ghgClassification,
      dataIndex: 'ghgClassify',
      width: 236,
      className: styles.boldColumn,
      render: () => (
        <Cascader
          value={['2', '15']}
          options={GHGList}
          disabled
          fieldNames={{ value: 'id', label: 'name' }}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseSelectGh}
          allowClear={false}
        />
      ),
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: '__operate__',
      width: 88,
      fixed: 'right',
      render: (_, record) => (
        <Button
          className={styles.deleteBtn}
          type='link'
          onClick={() => deleteData(record)}
        >
          {I18N.carbonFootprint.delete}
        </Button>
      ),
    },
  ];

  useMount(() => {
    getComputationSourceList({
      computationId,
      computationPeriod,
      ghgClassify: '15',
    }).then(({ data }) => {
      setComputationSource(data.data);
    });

    if (importStatus === IMPORT_STATUS.PENDING) {
      const loopImportStatus = () => {
        getTravelImportStatus({ computationId, computationPeriod }).then(
          ({ data }) => {
            if (data.data === IMPORT_STATUS.PENDING) {
              timerRef.current = setTimeout(loopImportStatus, 1000);
            } else if (data.data === IMPORT_STATUS.DONE) {
              setImportStatus(data.data);
              messageApi.open({
                key: messageKey,
                className: styles.successMessage,
                icon: false,
                content: (
                  <div className={styles.messageContent}>
                    <IconAlibabaNew type='icon-icon-tongguo' />
                    <div className={styles.messageText}>
                      {I18N.enterpriseCarbonAccount2.dataParsingInto}
                    </div>
                  </div>
                ),
                duration: 2,
              });
            } else {
              messageApi.destroy(messageKey);
              Toast('error', I18N.enterpriseCarbonAccount2.dataParsingLost);
              onClose();
            }
          },
        );
      };

      messageApi.open({
        key: messageKey,
        className: styles.pendingMessage,
        icon: false,
        content: (
          <div className={styles.messageContent}>
            <img alt='' src={AiSvg} />
            <div className={styles.messageText}>
              {I18N.enterpriseCarbonAccount2.aiAnalysisInProgress}
            </div>
          </div>
        ),
        duration: 0,
      });
      loopImportStatus();
    }
  });

  useUnmount(() => clearInterval(timerRef.current));

  useEffect(() => {
    if (importStatus === IMPORT_STATUS.DONE) {
      queryTempList(searchParams);
      setSelectedList([]);
    }
  }, [importStatus, searchParams]);

  useEffect(() => {
    setAnalyzing(importStatus !== IMPORT_STATUS.DONE);
  }, [importStatus, setAnalyzing]);

  return (
    <div>
      {contextHolder}
      <Tabs
        className={styles.tabs}
        activeKey={`${searchParams.type}`}
        items={[
          {
            key: `${TEMP_DATA_TYPE.TRAVEL}`,
            label: I18N.enterpriseCarbonAccount2.travel,
          },
          {
            key: `${TEMP_DATA_TYPE.ROOM}`,
            label: I18N.enterpriseCarbonAccount2.stay,
          },
        ]}
        onChange={type => {
          setSearchParams({
            ...omit(searchParams, [
              'startPoint',
              'endPoint',
              'name',
              'country',
            ]),
            pageNum: 1,
            type: Number(type),
          });
        }}
      />
      <div className={styles.operate}>
        <Segmented
          value={searchParams.error}
          options={[
            {
              value: 0,
              label: (
                <div
                  className={classNames(styles.segmentedTab, {
                    [styles.activeSegmentedTab]: searchParams.error === 0,
                  })}
                >
                  <span>{I18N.carbonFootprint3.whole}</span>
                  <span>{count.sumTotal}</span>
                </div>
              ),
            },
            {
              value: 1,
              label: (
                <div
                  className={classNames(styles.segmentedTab, {
                    [styles.activeSegmentedTab]: searchParams.error === 1,
                  })}
                >
                  <span>{I18N.enterpriseCarbonAccount2.problemData}</span>
                  <span>{count.waitDealTotal}</span>
                </div>
              ),
            },
          ]}
          onChange={error => {
            setSearchParams({
              ...searchParams,
              error,
              pageNum: 1,
            });
          }}
        />
        <div className={styles.batchOperate}>
          <div className={styles.selectCountContent}>
            <div>{I18N.components.selected}</div>
            <div className={styles.selectCount}>
              {selectedList.length}
              {I18N.workbench.strip}
            </div>
            <div>{I18N.enterpriseCarbonAccount2.emissionSourceData}</div>
          </div>
          <Button
            disabled={selectedList.length === 0}
            onClick={batchDeleteData}
          >
            {I18N.components.batchDeletion}
          </Button>
        </div>
      </div>
      <Table
        key={searchParams.type}
        className={styles.table}
        rowKey='id'
        columns={columns}
        loading={loading}
        dataSource={tempDataList}
        scroll={{ x: 1360, y: 504 }}
        pagination={{
          total: count.total,
          current: searchParams.pageNum,
          pageSize: searchParams.pageSize,
        }}
        rowSelection={{
          selectedRowKeys: selectedList.map(tempData => tempData.id),
          checkStrictly: false,
          onChange: (_, selected) => {
            setSelectedList(selected);
          },
        }}
        onChange={(pagination, filter, _, { action }) => {
          if (action === 'paginate') {
            setSearchParams({
              ...searchParams,
              pageNum: pagination.current || 1,
              pageSize: pagination.pageSize || 10,
            });
          }

          if (action === 'filter') {
            setSearchParams({
              ...searchParams,
              country: filter.country?.[0] as string,
              name: filter.name?.[0] as string,
              startPoint: filter.startPoint?.[0] as string,
              endPoint: filter.endPoint?.[0] as string,
              pageNum: 1,
              pageSize: pagination.pageSize || 10,
            });
          }
        }}
      />
    </div>
  );
};

export default TravelResult;
