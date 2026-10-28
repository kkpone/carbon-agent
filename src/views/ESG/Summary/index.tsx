/* eslint-disable react/no-unstable-nested-components */

import { SearchOutlined } from '@ant-design/icons';
import emptyImg from '@assets/svg/enterprise_empty.svg';
import I18N from '@src/lang/I18N';
import { Button, Input, Select, Table, TableColumnsType, Tooltip } from 'antd';
import classNames from 'classnames';
import { debounce, isNil } from 'lodash-es';
import { FC, useEffect, useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ExpandIcon from '@/components/ExpandIcon';
import { IconFont } from '@/components/LcaIconFont';
import { IconAlibabaNew } from '@/components/iconfont';
import { RouteMaps } from '@/router/route-paths';
import { downloadFileFromBlob } from '@/utils';

import styles from './index.module.less';
import { exportSummaryData, getSummaryList } from './service';
import { getTaskPeriodList } from '../FillManagement/service';
import { getFilterStandardList } from '../OrgTaskList/service';
import AcIndicatorTag from '../components/AcIndicatorTag';
import SummaryDrawer from '../components/SummaryDrawer';
import {
  SUMMARY_INDICATOR_STATUS,
  SUMMARY_INDICATOR_STATUS_LABEL,
} from '../constant';
import { Indicator, IndicatorSystem } from '../type';
import { isGroupIndicator, isModelIndicator } from '../utils';

const Summary: FC = () => {
  const [taskPeriodList, setTaskPeriodList] = useState<IndicatorSystem[]>([]);

  const [taskPeriod, setTaskPeriod] = useState<IndicatorSystem>();

  const [loading, setLoading] = useState(false);

  const [exportLoading, setExportLoading] = useState(false);

  const [searchParams, setSearchParams] = useState<{
    name?: string;
    standardIds?: string;
    status?: string;
  }>();

  const [summary, setSummary] = useState<{
    status: number;
    finishCount: number;
    totalCount: number;
    dataTree: Indicator[];
  }>();

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [standardList, setStandardList] = useState<
    { id: number; name: string }[]
  >([]);

  const history = useHistory();

  const frameId = taskPeriod?.id;

  const taskPeriodIndex = taskPeriodList.findIndex(
    t => t.id === taskPeriod?.id,
  );

  const prevTaskPeriod = taskPeriodList[taskPeriodIndex + 1];
  const nextTaskPeriod = taskPeriodList[taskPeriodIndex - 1];

  const columns: TableColumnsType<Indicator> = [
    {
      title: I18N.esg.allIndicators,
      dataIndex: 'name',
      width: 200,
      ellipsis: true,
      fixed: 'left',
      render: (_, record) => {
        const { level, name, id, children } = record;
        const expanded = expandedRowKeys.includes(id);
        return (
          <div className={styles.tableNameColumn}>
            {!isModelIndicator(record) && (
              <div className={styles.tableLineContent}>
                {new Array(level - 1).fill('').map(() => (
                  <div className={styles.tableLine} />
                ))}
              </div>
            )}
            {(children || []).length > 0 ? (
              <ExpandIcon
                expanded={expanded}
                onClick={() =>
                  setExpandedRowKeys(
                    !expanded
                      ? [...expandedRowKeys, id]
                      : expandedRowKeys.filter(key => key !== id),
                  )
                }
              />
            ) : (
              <div className={styles.emptyExpandIcon} />
            )}
            <div
              className={classNames(styles.groupName, {
                [styles.indicatorName]: !isGroupIndicator(record),
              })}
              title={name}
            >
              {name}
            </div>
            <AcIndicatorTag indicator={record} />
          </div>
        );
      },
    },
    {
      title: I18N.esg.referenceStandards,
      dataIndex: 'standardIds',
      width: 164,
      ellipsis: true,
      filterDropdownProps: {
        overlayClassName: styles.standardFilterOverlay,
      },
      filters: standardList.map(standard => ({
        value: standard.id,
        text: <span title={standard.name}>{standard.name}</span>,
      })),
      filteredValue: searchParams?.standardIds?.split(','),
      render: (_, indicator) => {
        const { standardStr } = indicator;

        if (isGroupIndicator(indicator)) {
          return null;
        }

        if (!standardStr) {
          return '-';
        }
        const [standard, ...restStandard] = standardStr.split(',');
        return (
          <div className={styles.column}>
            <div className={styles.tag} title={standard}>
              {standard}
            </div>
            {restStandard.length > 0 && (
              <Tooltip title={restStandard.join('，')}>
                <div className={styles.tag}>+{restStandard.length}</div>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: I18N.esg.interpretationExplanationCase,
      dataIndex: 'description',
      width: 248,
      ellipsis: true,
      render: (text, indicator) =>
        isGroupIndicator(indicator) ? null : text || '-',
    },
    {
      title: I18N.cbam.fillInStatus,
      dataIndex: 'status',
      width: 120,
      ellipsis: true,
      render: (status: number, indicator) =>
        isGroupIndicator(indicator) ? null : (
          <div
            className={classNames(styles.status, {
              [styles.completeStatus]:
                status === SUMMARY_INDICATOR_STATUS.COMPLETED,
              [styles.unCompleteStatus]:
                status === SUMMARY_INDICATOR_STATUS.UNCOMPLETED,
            })}
          >
            {SUMMARY_INDICATOR_STATUS_LABEL[status]}
          </div>
        ),
    },
    {
      title: I18N.esg.summaryData,
      dataIndex: 'indicatorValue',
      width: 130,
      ellipsis: true,
      render: (_, indicator) => {
        const { indicatorValue, unitName } = indicator;

        if (isGroupIndicator(indicator)) {
          return null;
        }

        return indicatorValue ? (
          <div className={styles.indicatorValueColumn}>
            <div className={styles.indicatorValue} title={`${indicatorValue}`}>
              {indicatorValue}
            </div>
            <div className={styles.indicatorUnit}>{unitName}</div>
          </div>
        ) : (
          '-'
        );
      },
    },
    {
      title: I18N.carbonFootprint.operation,
      fixed: 'right',
      dataIndex: 'operate',
      width: 64,
      render: (_, indicator) =>
        !isGroupIndicator(indicator) ? (
          <SummaryDrawer id={indicator.id}>
            <Button className={styles.operateBtn} type='link'>
              {I18N.carbonFootprint3.details}
            </Button>
          </SummaryDrawer>
        ) : null,
    },
  ];

  const exportSummary = async () => {
    if (isNil(frameId)) {
      return;
    }

    try {
      setExportLoading(true);
      const response = await exportSummaryData({ frameId });
      downloadFileFromBlob(response);
    } finally {
      setExportLoading(false);
    }
  };

  const onNameInputChange = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({
          ...searchParams,
          name,
        });
      }, 300),
    [searchParams],
  );

  useEffect(() => {
    getTaskPeriodList().then(({ data }) => {
      setTaskPeriodList(data.data);
      setTaskPeriod(data.data[0]);
    });
  }, []);

  useEffect(() => {
    if (!isNil(frameId)) {
      getFilterStandardList({ frameId }).then(({ data }) => {
        setStandardList(data.data);
      });
    }
  }, [frameId]);

  useEffect(() => {
    if (!isNil(frameId)) {
      setLoading(true);
      getSummaryList({ frameId, ...searchParams })
        .then(({ data }) => {
          setSummary(data.data);
          setExpandedRowKeys(
            data.data.dataTree.reduce(
              (prev: string[], group) => [
                ...prev,
                ...[group.id, ...group.children.map(topic => topic.id)],
              ],
              [],
            ),
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [frameId, searchParams]);

  return (
    <div className={styles.summary}>
      {taskPeriod ? (
        <>
          <div className={styles.header}>
            <div className={styles.periodContent}>
              <div className={styles.periodLabel}>
                {I18N.esg.disclosureCycle}
              </div>
              <div className={styles.periodControl}>
                <div
                  className={classNames(styles.prevBtn, {
                    [styles.disabledBtn]: !prevTaskPeriod,
                  })}
                  onClick={() => {
                    if (prevTaskPeriod) {
                      setTaskPeriod(prevTaskPeriod);
                    }
                  }}
                >
                  <IconFont
                    className={styles.prevIcon}
                    icon='icon-icon_arrow_rioght'
                  />
                </div>
                <Select
                  className={styles.periodSelector}
                  value={taskPeriod?.period}
                  suffixIcon={null}
                  fieldNames={{ value: 'id', label: 'period' }}
                  options={taskPeriodList}
                  onChange={(_, selectedTaskPeriod) => {
                    setTaskPeriod(selectedTaskPeriod as IndicatorSystem);
                  }}
                />
                <div
                  className={classNames(styles.nextBtn, {
                    [styles.disabledBtn]: !nextTaskPeriod,
                  })}
                  onClick={() => {
                    if (nextTaskPeriod) {
                      setTaskPeriod(nextTaskPeriod);
                    }
                  }}
                >
                  <IconFont
                    className={styles.nextIcon}
                    icon='icon-icon_arrow_rioght'
                  />
                </div>
              </div>
              {summary && (
                <>
                  <div
                    className={classNames(styles.status, {
                      [styles.completeStatus]:
                        summary.status === SUMMARY_INDICATOR_STATUS.COMPLETED,
                      [styles.unCompleteStatus]:
                        summary.status === SUMMARY_INDICATOR_STATUS.UNCOMPLETED,
                    })}
                  >
                    {SUMMARY_INDICATOR_STATUS_LABEL[summary.status]}
                  </div>
                  <div className={styles.progress}>
                    <div>
                      <span className={styles.completeCount}>
                        {summary.finishCount}
                      </span>
                      <span className={styles.totalCount}>
                        /{summary.totalCount}
                      </span>
                    </div>
                    <div className={styles.progressBar}>
                      <div
                        className={styles.progressBarInner}
                        style={{
                          width: `${
                            (summary.finishCount / summary.totalCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <Button
              icon={
                <IconAlibabaNew type='icon-icon-chuangjianpaifangyuanqingdan' />
              }
              type='primary'
              onClick={() => {
                history.push({
                  pathname: RouteMaps.ESGAiGenerateHome,
                  search: `?taskId=${taskPeriod.id}`,
                });
              }}
            >
              {I18N.DomesticVersion.createReport}
            </Button>
          </div>
          <div className={styles.summaryContent}>
            <div className={styles.summaryTitle}>{I18N.esg.dataList}</div>
            <div className={styles.summaryOpe}>
              <div className={styles.summaryOpeLeft}>
                <Input
                  className={styles.searchField}
                  defaultValue={searchParams?.name}
                  prefix={<SearchOutlined />}
                  placeholder={I18N.esg.searchIndicatorName}
                  onChange={e => onNameInputChange(e.target.value)}
                />
                <Select
                  value={searchParams?.status}
                  className={styles.searchField}
                  placeholder={I18N.cbam.fillInStatus}
                  allowClear
                  options={Object.values(SUMMARY_INDICATOR_STATUS).map(
                    status => ({
                      value: status,
                      label: SUMMARY_INDICATOR_STATUS_LABEL[status],
                    }),
                  )}
                  onChange={status => {
                    setSearchParams({
                      ...searchParams,
                      status,
                    });
                  }}
                />
              </div>
              <Button
                type='primary'
                loading={exportLoading}
                onClick={exportSummary}
              >
                <IconAlibabaNew type='icon-shujudaochu' />
                {I18N.enterpriseCarbonAccount2.dataExport}
              </Button>
            </div>
            <Table
              className={styles.summaryTable}
              rowKey='id'
              loading={loading}
              pagination={false}
              columns={columns}
              scroll={{ x: 1200 }}
              dataSource={summary?.dataTree}
              expandable={{
                expandedRowKeys,
                indentSize: 0,
                expandIcon: () => null,
              }}
              onChange={(_, filter, sort, extra) => {
                if (extra.action === 'filter') {
                  setSearchParams({
                    standardIds: filter.standardIds?.join(','),
                  });
                }
              }}
            />
          </div>
        </>
      ) : (
        <div className={styles.empty}>
          <img className={styles.emptyImg} alt='' src={emptyImg} />
          <div className={styles.emptyText}>
            {I18N.esg.currentlyNotFilledIn}
          </div>
        </div>
      )}
    </div>
  );
};

export default Summary;
