import { CaretRightFilled } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/enterprise_empty.svg';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { useDebounceEffect } from 'ahooks';
import {
  Button,
  DatePicker,
  Drawer,
  Dropdown,
  Select,
  Spin,
  Table,
} from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import moment, { Moment } from 'moment';
import { FC, useEffect, useMemo, useState } from 'react';

import styles from './index.module.less';
import {
  getEditorList,
  getHistoryRecords,
  getMatchSourceList,
} from './service';
import { EmissionHistoryRecords, MatchSource } from './type';
// import { DictEnumListRequest } from '@/views/carbonFootPrintLCA/CarbonFootprintModel/type';

const EDIT_TYPE = {
  ADD: 0,
  DELETE: 1,
  UPDATE: 2,
  AI_COMMON_IMPORT: 3,
  AI_TRAVEL_IMPORT: 4,
  AI_ROOM_IMPORT: 5,
};

const EDIT_TYPE_LABEL = {
  [EDIT_TYPE.ADD]: I18N.carbonFootprint.newEmissionSourcesAdded,
  [EDIT_TYPE.DELETE]: I18N.enterpriseCarbonAccount2.deleteEmissionSource,
  [EDIT_TYPE.UPDATE]: I18N.carbonFootprint.editEmissionSources2,
  [EDIT_TYPE.AI_COMMON_IMPORT]: I18N.carbonFootprint.editEmissionSources2,
  [EDIT_TYPE.AI_TRAVEL_IMPORT]: I18N.carbonFootprint.editEmissionSources2,
  [EDIT_TYPE.AI_ROOM_IMPORT]: I18N.carbonFootprint.editEmissionSources2,
};

const EmissionHistory: FC<{
  computationId: string;
  computationPeriod?: string;
  id?: number;
}> = ({ computationId, computationPeriod, id }) => {
  const [searchParams, setSearchParams] = useState<{
    id?: number;
    time?: [Moment | null, Moment | null] | null;
    editorList?: string[];
    type?: number;
  }>({ id });

  const [loading, setLoading] = useState(false);

  const [sourceList, setSourceList] = useState<MatchSource[]>([]);

  const [editorList, setEditorList] = useState<string[]>([]);

  const [historyRecords, setHistoryRecords] = useState<EmissionHistoryRecords>(
    [],
  );

  const optionRender = (source: MatchSource) => {
    const { name, facility, ghgCategoryName, ghgClassifyName } = source;
    return (
      <>
        <div className={styles.sourceName}>
          {name}
          <div className={styles.sourceNameSplit} />
          {facility}
        </div>
        <div className={styles.sourceCategory}>
          {ghgCategoryName}
          <div className={styles.sourceCategorySplit} />
          {ghgClassifyName}
        </div>
      </>
    );
  };

  const querySourceList = (params: {
    computationId: string;
    computationPeriod?: string;
    sourceName?: string;
  }) => {
    getMatchSourceList(params).then(({ data }) => {
      setSourceList(
        data.data.map(item => ({
          ...item,
          label: (
            <div className={styles.sourceName}>
              {item.name}
              <div className={styles.sourceNameSplit} />
              {item.facility}
            </div>
          ),
        })),
      );
    });
  };

  const onSourceSearch = useMemo(
    () =>
      debounce((sourceName?: string) => {
        querySourceList({ computationId, computationPeriod, sourceName });
      }, 300),
    [computationId, computationPeriod],
  );

  useEffect(() => {
    querySourceList({ computationId, computationPeriod });
  }, [computationId, computationPeriod]);

  useDebounceEffect(
    () => {
      setLoading(true);

      const { time } = searchParams;
      const [begin, end] = time || [];

      const beginTime = begin
        ? moment(begin).format('YYYY-MM-DD HH:mm:ss')
        : undefined;
      const endTime = end
        ? moment(end).format('YYYY-MM-DD HH:mm:ss')
        : undefined;

      getHistoryRecords({
        computationId,
        computationPeriod,
        beginTime,
        endTime,
        id: searchParams.id,
        userList: searchParams.editorList?.join(','),
        type: searchParams.type,
      })
        .then(({ data }) => {
          setHistoryRecords(data.data);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [searchParams, computationId, computationPeriod],
    { wait: 300 },
  );

  useEffect(() => {
    getEditorList({ computationId, computationPeriod }).then(({ data }) => {
      setEditorList(data.data);
    });
  }, [computationId, computationPeriod]);

  return (
    <>
      <div className={styles.searchContent}>
        <Dropdown
          trigger={['click']}
          overlay={
            <div className={styles.searchDropdown}>
              <div
                className={styles.searchDropdownContent}
                onClick={e => {
                  e.stopPropagation();
                }}
              >
                <div className={styles.searchItem}>
                  <div className={styles.searchLabel}>
                    {I18N.Certification.operationTime}
                  </div>
                  <DatePicker.RangePicker
                    showTime
                    // @ts-ignore
                    value={searchParams.time}
                    className={styles.searchDate}
                    onChange={timeValue => {
                      setSearchParams({
                        ...searchParams,
                        // @ts-ignore
                        time: timeValue,
                      });
                    }}
                  />
                </div>
                <div className={styles.searchItem}>
                  <div className={styles.searchLabel}>
                    {I18N.carbonFootprint.operator}
                  </div>
                  <div className={styles.operatorContent}>
                    {editorList.map(editor => (
                      <div
                        className={classNames(styles.operator, {
                          [styles.selectedOperator]:
                            searchParams.editorList?.includes(editor),
                        })}
                        onClick={() => {
                          setSearchParams({
                            ...searchParams,
                            editorList: searchParams.editorList?.includes(
                              editor,
                            )
                              ? searchParams.editorList.filter(
                                  item => item !== editor,
                                )
                              : [...(searchParams.editorList || []), editor],
                          });
                        }}
                      >
                        {editor}
                      </div>
                    ))}
                  </div>
                </div>
                <div className={styles.searchItem}>
                  <div className={styles.searchLabel}>
                    {I18N.enterpriseCarbonAccount2.operantClass}
                  </div>
                  <div className={styles.operatorContent}>
                    {[EDIT_TYPE.ADD, EDIT_TYPE.DELETE, EDIT_TYPE.UPDATE]
                      .map(type => ({ type, label: EDIT_TYPE_LABEL[type] }))
                      .map(item => (
                        <div
                          className={classNames(styles.operator, {
                            [styles.selectedOperator]:
                              searchParams.type === item.type,
                          })}
                          onClick={() => {
                            setSearchParams({
                              ...searchParams,
                              type:
                                searchParams.type !== item.type
                                  ? item.type
                                  : undefined,
                            });
                          }}
                        >
                          {item.label}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              <div className={styles.searchDropdownBottom}>
                <span
                  className={styles.clearText}
                  onClick={() => setSearchParams({})}
                >
                  {I18N.enterpriseCarbonAccount2.clearFilterBar}
                </span>
              </div>
            </div>
          }
          placement='bottomLeft'
        >
          <Button icon={<IconAlibaba type='icon-icon_filter' />} />
        </Dropdown>
        <Select
          className={styles.searchInput}
          options={sourceList}
          value={searchParams.id}
          allowClear
          showSearch
          onSearch={onSourceSearch}
          filterOption={false}
          fieldNames={{ value: 'id' }}
          placeholder={I18N.enterpriseCarbonAccount2.pleaseEnterTheContent}
          optionRender={opt => optionRender(opt.data)}
          onChange={val => {
            setSearchParams({
              ...searchParams,
              id: val,
            });
          }}
        />
      </div>
      <Spin spinning={loading}>
        {historyRecords.length > 0 ? (
          <div className={styles.historyContent}>
            {historyRecords.map(historyRecord => {
              const { time, records } = historyRecord;
              return (
                <div className={styles.historyItem}>
                  <div className={styles.historyTime}>{time}</div>

                  <div className={styles.historyDetails}>
                    {records.map(record => {
                      const {
                        editor,
                        editType,
                        time: recordTime,
                        editFields,
                        detail,
                        emissionName,
                      } = record;
                      return (
                        <div className={styles.historyDetailsItem}>
                          <div className={styles.split}>
                            <div className={styles.splitBar} />
                          </div>
                          <div className={styles.detailsItemContent}>
                            <div className={styles.historyDetailsHeader}>
                              <div className={styles.historyDetailsHeaderLeft}>
                                <span className={styles.historyOperator}>
                                  {editor}：
                                </span>
                                <span className={styles.operateType}>
                                  {EDIT_TYPE_LABEL[editType]}
                                </span>
                                {editType !== EDIT_TYPE.DELETE && (
                                  <span
                                    className={styles.emissionName}
                                    title={emissionName}
                                  >
                                    {emissionName}
                                  </span>
                                )}
                              </div>
                              <div className={styles.operateTime}>
                                {recordTime}
                              </div>
                            </div>
                            <div className={styles.detailsContent}>
                              {editType === EDIT_TYPE.DELETE && (
                                <div
                                  className={styles.detailsRow}
                                  title={emissionName || '--'}
                                >
                                  {emissionName}
                                </div>
                              )}
                              {editType === EDIT_TYPE.UPDATE &&
                                editFields.map(filed => {
                                  const { fieldName, oldValue, newValue } =
                                    filed;
                                  return (
                                    <div>
                                      <div className={styles.detailsRow}>
                                        {fieldName}
                                      </div>
                                      <div className={styles.detailsRow}>
                                        <span
                                          className={classNames(
                                            styles.detailsValue,
                                            styles.detailsNewValue,
                                          )}
                                          title={oldValue || '--'}
                                        >
                                          {
                                            I18N.enterpriseCarbonAccount2
                                              .primary
                                          }
                                          {oldValue || '--'}
                                        </span>
                                        <CaretRightFilled
                                          className={styles.triangle}
                                        />
                                        <span
                                          className={classNames(
                                            styles.detailsValue,
                                            styles.detailsNewValue,
                                          )}
                                          title={newValue || '--'}
                                        >
                                          {I18N.enterpriseCarbonAccount2.new}
                                          {newValue}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              {editType === EDIT_TYPE.ADD &&
                                editFields.map(field => {
                                  const { fieldName, newValue } = field;
                                  return (
                                    <div className={styles.detailsRow}>
                                      <span>{fieldName}：</span>
                                      <span
                                        className={styles.detailsNewValue}
                                        title={newValue || '--'}
                                      >
                                        {newValue}
                                      </span>
                                    </div>
                                  );
                                })}
                              {[
                                EDIT_TYPE.AI_COMMON_IMPORT,
                                EDIT_TYPE.AI_TRAVEL_IMPORT,
                                EDIT_TYPE.AI_ROOM_IMPORT,
                              ].includes(editType) && (
                                <>
                                  {editFields.map(filed => {
                                    const { fieldName, oldValue, newValue } =
                                      filed;
                                    return (
                                      <div>
                                        <div className={styles.detailsRow}>
                                          {fieldName}
                                        </div>
                                        <div className={styles.detailsRow}>
                                          <span
                                            className={classNames(
                                              styles.detailsValue,
                                              styles.detailsNewValue,
                                            )}
                                            title={oldValue || '--'}
                                          >
                                            {
                                              I18N.enterpriseCarbonAccount2
                                                .primary
                                            }
                                            {oldValue || '--'}
                                          </span>
                                          <CaretRightFilled
                                            className={styles.triangle}
                                          />
                                          <span
                                            className={classNames(
                                              styles.detailsValue,
                                              styles.detailsNewValue,
                                            )}
                                            title={newValue || '--'}
                                          >
                                            {I18N.enterpriseCarbonAccount2.new}
                                            {newValue}
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                  <div className={styles.tableDescText}>
                                    {I18N.enterpriseCarbonAccount2.relatedData}
                                  </div>
                                  <Table
                                    dataSource={detail}
                                    pagination={false}
                                    columns={(() => {
                                      switch (editType) {
                                        case EDIT_TYPE.AI_COMMON_IMPORT:
                                          return [
                                            {
                                              title:
                                                I18N.carbonFootprint.number,
                                              dataIndex: 'no',
                                              width: 60,
                                              ellipsis: true,
                                              render: (_, item, index) =>
                                                index + 1,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .originalDataName,
                                              dataIndex: 'name',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.carbonFootprint3
                                                  .activityData,
                                              dataIndex: 'activityData',
                                              ellipsis: true,
                                            },
                                            {
                                              title: I18N.carbonFootprint.unit,
                                              dataIndex: 'activityUnitName',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .parseFile,
                                              dataIndex: 'fileName',
                                              ellipsis: true,
                                            },
                                          ];
                                        case EDIT_TYPE.AI_TRAVEL_IMPORT:
                                          return [
                                            {
                                              title:
                                                I18N.carbonFootprint.number,
                                              dataIndex: 'no',
                                              width: 60,
                                              ellipsis: true,
                                              render: (_, item, index) =>
                                                index + 1,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .origin,
                                              dataIndex: 'startPoint',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .destination,
                                              dataIndex: 'endPoint',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .modeOfTransportation,
                                              dataIndex: 'travelWay',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .oneWayDistance,
                                              dataIndex: 'activityData',
                                              ellipsis: true,
                                            },
                                          ];
                                        case EDIT_TYPE.AI_ROOM_IMPORT:
                                          return [
                                            {
                                              title:
                                                I18N.carbonFootprint.number,
                                              dataIndex: 'no',
                                              width: 60,
                                              ellipsis: true,
                                              render: (_, item, index) =>
                                                index + 1,
                                            },
                                            {
                                              title:
                                                I18N.carbonFootprint.country,
                                              dataIndex: 'country',
                                              ellipsis: true,
                                            },
                                            {
                                              title: I18N.cbam.city,
                                              dataIndex: 'city',
                                              ellipsis: true,
                                            },
                                            {
                                              title:
                                                I18N.enterpriseCarbonAccount2
                                                  .numberOfNights,
                                              dataIndex: 'activityData',
                                              ellipsis: true,
                                            },
                                          ];
                                        default:
                                          return [];
                                      }
                                    })()}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>
            <img alt='' src={emptyImg} />
            <div className={styles.emptyText}>
              {I18N.enterpriseCarbonAccount2.thereIsCurrentlyNoHistoricalRecord}
            </div>
          </div>
        )}
      </Spin>
    </>
  );
};

type HistoryDrawerProps = {
  agentPreviewLayout?: boolean;
  visible: boolean;
  computationId: string;
  computationPeriod?: string;
  id?: number;
  onClose: () => void;
};

const HistoryDrawer: FC<HistoryDrawerProps> = props => {
  const {
    agentPreviewLayout,
    visible,
    id,
    computationId,
    computationPeriod,
    onClose,
  } = props;

  return (
    <Drawer
      title={I18N.enterpriseCarbonAccount2.history}
      width={634}
      visible={visible}
      destroyOnClose
      rootClassName={classNames({
        [styles.agentPreviewHistoryDrawer]: agentPreviewLayout,
      })}
      onClose={onClose}
    >
      <EmissionHistory
        id={id}
        computationId={computationId}
        computationPeriod={computationPeriod}
      />
    </Drawer>
  );
};

export default HistoryDrawer;
