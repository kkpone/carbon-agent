/* eslint-disable react/no-unstable-nested-components */
import useUrlState from '@ahooksjs/use-url-state';
import { SearchOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Input, Select, Table, TableColumnsType, Tooltip } from 'antd';
import classNames from 'classnames';
import { debounce } from 'lodash-es';
import {
  FC,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';

import ExpandIcon from '@/components/ExpandIcon';
import { IconFont } from '@/components/LcaIconFont';
import { RouteMaps } from '@/router/route-paths';

import styles from './index.module.less';
import {
  getFilterStandardList,
  getIndicatorTaskList,
  getOrgTaskFillProgress,
} from './service';
import AcIndicatorTag from '../components/AcIndicatorTag';
import {
  BOOLEAN_OPTIONS_LABEL,
  ESG_TASK_STATUS,
  ESG_TASK_STATUS_LABEL,
  INDICATOR_FILL_STATUS,
  INDICATOR_FILL_STATUS_LABEL,
  INDICATOR_TYPE,
} from '../constant';
import { ESGTask, Indicator } from '../type';
import {
  isGroupIndicator,
  isModelIndicator,
  isTopLevelIndicator,
} from '../utils';

const OrgTaskList: FC = () => {
  const [{ frameId, orgId }] = useUrlState();

  const [orgESGTask, setOrgESGTask] = useState<ESGTask>();

  const [indicatorList, setIndicatorList] = useState<Indicator[]>([]);

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const [tableScrollHeight, setTableScrollHeight] = useState<number>();

  const tableContentRef = useRef<HTMLDivElement>(null);

  const [standardList, setStandardList] = useState<
    { id: number; name: string }[]
  >([]);

  const [searchParams, setSearchParams] = useState<{
    name?: string;
    standardIds?: string;
    status?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const backToList = () =>
    history.push({
      pathname: RouteMaps.ESGFillManagement,
      search: `?period=${orgESGTask?.period || ''}`,
    });

  const getTaskList = async (params: {
    frameId: string | number;
    orgId: string | number;
    name?: string;
    standardIds?: string;
    status?: string;
    expandGroup?: boolean;
  }) => {
    try {
      const { expandGroup, ...restParams } = params;
      setLoading(true);

      const { data } = await getIndicatorTaskList(restParams);

      setIndicatorList(data.data);
      if (expandGroup) {
        setExpandedRowKeys(
          data.data.reduce(
            (prev: string[], group) => [
              ...prev,
              ...[group.id, ...group.children.map(topic => topic.id)],
            ],
            [],
          ),
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getOrgESGTask = async (params: {
    frameId: string | number;
    orgId: string | number;
  }) => {
    const { data } = await getOrgTaskFillProgress(params);
    setOrgESGTask(data.data);
  };

  const onNameSearch = useMemo(
    () =>
      debounce((name: string) => {
        setSearchParams({ ...searchParams, name });
      }, 300),
    [searchParams],
  );

  const columns: TableColumnsType<Indicator> = [
    {
      title: I18N.esg.allIndicators,
      dataIndex: 'name',
      width: 224,
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
      title: I18N.cbam.fillInStatus,
      dataIndex: 'status',
      width: 120,
      ellipsis: true,
      render: (status: number, indicator) =>
        isTopLevelIndicator(indicator) ? (
          <div
            className={classNames(styles.status, {
              [styles.completeStatus]:
                status === INDICATOR_FILL_STATUS.COMPLETED,
              [styles.notStartStatus]:
                status === INDICATOR_FILL_STATUS.NOT_FILL,
            })}
          >
            {INDICATOR_FILL_STATUS_LABEL[status]}
          </div>
        ) : null,
    },
    {
      title: I18N.cbam.fillInTheContent,
      dataIndex: 'indicatorValue',
      width: 130,
      ellipsis: true,
      render: (_, indicator) => {
        const { indicatorType, indicatorValue, unitName } = indicator;
        if (
          isGroupIndicator(indicator) ||
          indicatorType === INDICATOR_TYPE.TABLE ||
          indicatorType === INDICATOR_TYPE.ABSTRACT
        ) {
          return null;
        }

        if (indicatorType === INDICATOR_TYPE.BOOLEAN) {
          return (
            <div className={styles.indicatorValue}>
              {BOOLEAN_OPTIONS_LABEL[indicatorValue]}
            </div>
          );
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
      title: I18N.esg.referenceStandards,
      dataIndex: 'standardIds',
      width: 176,
      ellipsis: true,
      filterDropdownProps: {
        overlayClassName: styles.standardFilterOverlay,
      },
      filters: standardList.map(standard => ({
        value: standard.id,
        text: <span title={standard.name}>{standard.name}</span>,
      })),
      filteredValue: searchParams.standardIds?.split(','),
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
      width: 148,
      ellipsis: true,
      render: (text, indicator) =>
        isGroupIndicator(indicator) ? null : text || '-',
    },
    {
      title: I18N.carbonFootprint.operation,
      dataIndex: 'operate',
      width: 80,
      fixed: 'right',
      render: (_, indicator) =>
        isTopLevelIndicator(indicator) ? (
          <Button
            className={styles.operateBtn}
            type='link'
            onClick={() => {
              history.push({
                pathname: RouteMaps.ESGIndicatorFillInfo.replace(
                  ':frameId',
                  frameId,
                ).replace(':indicatorId', `${indicator.id}`),
                search: `?orgId=${orgId}`,
              });
            }}
          >
            {I18N.carbonFootprint3.details}
          </Button>
        ) : null,
    },
  ];

  useEffect(() => {
    getOrgESGTask({ frameId, orgId });
    getFilterStandardList({ frameId, orgId }).then(({ data }) => {
      setStandardList(data.data);
    });
  }, [frameId, orgId]);

  useEffect(() => {
    getTaskList({ frameId, orgId, ...searchParams, expandGroup: true });
  }, [frameId, orgId, searchParams]);

  useLayoutEffect(() => {
    if (tableContentRef.current) {
      setTableScrollHeight(tableContentRef.current.clientHeight - 120);
    }
  }, [indicatorList]);

  return (
    <div className={styles.orgTaskList}>
      <div className={styles.header}>
        <div className={styles.nav}>
          <IconFont
            className={styles.backIcon}
            icon='icon-icon_arrow_rioght'
            // @ts-ignore
            onClick={backToList}
          />
          <span className={styles.backNavText} onClick={backToList}>
            {I18N.esg.fillInTheIndicators}
          </span>
          <span className={styles.orgNavText}>/</span>
          <span className={styles.orgNavText}>
            {orgESGTask?.orgName}
            {I18N.DomesticVersion.dataReporting}
          </span>
        </div>
        <div className={styles.intro}>
          {orgESGTask && (
            <div className={styles.introLeft}>
              <div className={styles.orgName}>
                {orgESGTask?.orgName}
                {I18N.DomesticVersion.dataReporting}
              </div>
              <div className={styles.period}>{orgESGTask.period}</div>
              <div
                className={classNames(styles.status, {
                  [styles.completeStatus]:
                    ESG_TASK_STATUS.COMPLETED === orgESGTask.status,
                  [styles.notStartStatus]:
                    ESG_TASK_STATUS.NOT_STARTED === orgESGTask.status,
                })}
              >
                {ESG_TASK_STATUS_LABEL[orgESGTask.status]}
              </div>
              <div className={styles.progress}>
                <div>
                  <span className={styles.completeCount}>
                    {orgESGTask.finishCount}
                  </span>
                  <span className={styles.totalCount}>
                    /{orgESGTask.totalCount}
                  </span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressBarInner}
                    style={{
                      width: `${
                        (orgESGTask.finishCount / orgESGTask.totalCount) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.fillTitle}>{I18N.esg.fillInTheList}</div>
        <div className={styles.searchContent}>
          <Input
            className={styles.searchField}
            defaultValue={searchParams.name}
            prefix={<SearchOutlined className={styles.searchIcon} />}
            placeholder={I18N.esg.searchIndicatorName}
            onChange={e => onNameSearch(e.target.value)}
          />
          <Select
            className={styles.searchField}
            defaultValue={searchParams.status}
            allowClear
            placeholder={I18N.cbam.fillInStatus}
            options={Object.values(INDICATOR_FILL_STATUS).map(status => ({
              value: status,
              label: INDICATOR_FILL_STATUS_LABEL[status],
            }))}
            onChange={status => setSearchParams({ ...searchParams, status })}
          />
        </div>
        <Table
          className={styles.indicatorTable}
          rowKey='id'
          loading={loading}
          pagination={false}
          columns={columns}
          scroll={{ x: 1300, y: tableScrollHeight }}
          dataSource={indicatorList}
          expandable={{
            expandedRowKeys,
            indentSize: 0,
            expandIcon: () => null,
          }}
          onChange={(_, filter, sort, extra) => {
            if (extra.action === 'filter') {
              setSearchParams({
                ...searchParams,
                standardIds: filter.standardIds?.join(','),
              });
            }
          }}
        />
      </div>
    </div>
  );
};

export default OrgTaskList;
