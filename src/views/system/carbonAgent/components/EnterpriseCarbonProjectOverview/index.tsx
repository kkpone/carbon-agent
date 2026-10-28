import I18N from '@src/lang/I18N';
import { Spin, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import classNames from 'classnames';
import type { Key, ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';

import {
  COMPUTATION_STATUS,
  COMPUTATION_STATUS_LABEL,
  ORG_TYPE,
} from '@/views/enterpriseCarbonAccount2/constant';

import type { AgentProject } from '../../constants';
import pageStyle from '../../index.module.less';
import overviewChevron from './assets/chevron.svg';
import enterpriseIcon from './assets/enterprise.svg';
import mobileEnterpriseIcon from './assets/enterprise-mobile.svg';
import mobileExpandIcon from './assets/expand-mobile.svg';
import mobileOrganizationIcon from './assets/organization-mobile.svg';
import mobileSuccessIcon from './assets/success-mobile.svg';
import organizationIcon from './assets/organization.svg';
import progressFill from './assets/progress-fill.svg';
import progressPattern from './assets/progress-pattern.svg';
import progressTrack from './assets/progress-track.svg';
import scopeOneIcon from './assets/scope-one.svg';
import scopeThreeIcon from './assets/scope-three.svg';
import scopeTwoIcon from './assets/scope-two.svg';
import totalEmissionIcon from './assets/total-emission.svg';
import trendArrowIcon from './assets/trend-arrow.svg';
import styles from './index.module.less';
import {
  fetchEnterpriseOverviewData,
  fetchEnterpriseOverviewOrgTree,
} from './service';
import type {
  EnterpriseOverviewData,
  EnterpriseOverviewGroup,
  EnterpriseOverviewOrg,
  EnterpriseOverviewPeriod,
  EnterpriseOverviewRow,
} from './types';

type EnterpriseCarbonProjectOverviewProps = {
  mobile?: boolean;
  onBack: () => void;
  project: AgentProject;
};

type ExpandedRowKeys = Record<string, Key[]>;

const isSameValue = (
  first: number | string | undefined,
  second: number | string | undefined,
) => String(first) === String(second);

const isNotStarted = (status: number | string) =>
  isSameValue(status, COMPUTATION_STATUS.NOT_START);

const isAllPeriod = (value: number | string) =>
  String(value).trim() === '' || isSameValue(value, 0);

const getDefaultPeriod = (
  periods: EnterpriseOverviewPeriod[] = [],
  mobile = false,
) =>
  mobile
    ? periods.find(period => !isAllPeriod(period.value)) || periods[0]
    : periods[0];

const getPeriodStatusLabel = (status: number | string) => {
  const normalizedStatus = Number(
    status,
  ) as keyof typeof COMPUTATION_STATUS_LABEL;

  return COMPUTATION_STATUS_LABEL[normalizedStatus] || '-';
};

const hasRequestValue = (value: number | string | null | undefined) =>
  value !== undefined && value !== null && String(value).trim() !== '';

const displayValue = (value?: string | null) =>
  value === undefined || value === null || value === '' ? '-' : value;

const displayPercentage = (value?: string | null) => {
  const displayedValue = displayValue(value);

  return displayedValue === '-' ? displayedValue : `${displayedValue}%`;
};

const getStatusLabel = (row: EnterpriseOverviewRow) => {
  const status = Number(row.status) as keyof typeof COMPUTATION_STATUS_LABEL;

  return row.statusDesc || COMPUTATION_STATUS_LABEL[status] || '-';
};

const getDisplayedRowStatusLabel = (row: EnterpriseOverviewRow) =>
  Number(row.orgType) === ORG_TYPE.MAIN_PART
    ? getStatusLabel(row)
    : displayValue(row.statusDesc);

const getGroupKey = (group: EnterpriseOverviewGroup, index: number) =>
  `${String(group.computationPeriod)}:${group.title}:${index}`;

const collectRowKeys = (rows: EnterpriseOverviewRow[]) => {
  const keys: Key[] = [];

  const visit = (items: EnterpriseOverviewRow[]) => {
    items.forEach(item => {
      if (item.children?.length) {
        keys.push(item.id);
        visit(item.children);
      }
    });
  };

  visit(rows);
  return keys;
};

const getInitialExpandedRowKeys = (
  data: EnterpriseOverviewData,
): ExpandedRowKeys =>
  data.orgInfoList.reduce<ExpandedRowKeys>((result, group, index) => {
    result[getGroupKey(group, index)] = collectRowKeys(group.orgList || []);
    return result;
  }, {});

const getProgress = (value?: string | null) => {
  const progress = Number(value);

  if (Number.isNaN(progress)) {
    return 0;
  }

  return Math.min(100, Math.max(0, progress));
};

const columns: TableColumnsType<EnterpriseOverviewRow> = [
  {
    className: styles.orgTableCell,
    dataIndex: 'name',
    fixed: 'left',
    title: I18N.enterpriseCarbonAccount2.accountingOrganization,
    width: 280,
    render: (_, row) => {
      const orgType = Number(row.orgType);
      const ratio = displayValue(row.totalEmissionRatio);

      return (
        <div className={styles.orgCell} title={row.name}>
          <span
            className={classNames(styles.orgIcon, {
              [styles.enterpriseOrgIcon]: orgType === ORG_TYPE.ENTERPRISE,
            })}
            aria-hidden='true'
          >
            <img
              alt=''
              src={
                orgType === ORG_TYPE.ENTERPRISE
                  ? enterpriseIcon
                  : organizationIcon
              }
            />
          </span>
          <span className={styles.orgInfo}>
            <span className={styles.orgName}>{row.name}</span>
            {orgType !== ORG_TYPE.ENTERPRISE ? (
              <span className={styles.progressInfo}>
                <span className={styles.progressTrack}>
                  <img alt='' src={progressTrack} />
                  <span
                    className={styles.progressValue}
                    style={{ width: `${getProgress(row.totalEmissionRatio)}%` }}
                  >
                    <img alt='' src={progressFill} />
                    <img alt='' src={progressPattern} />
                  </span>
                </span>
                <span className={styles.progressLabel}>
                  {ratio === '-' ? ratio : `${ratio}%`}
                </span>
              </span>
            ) : null}
          </span>
        </div>
      );
    },
  },
  {
    dataIndex: 'status',
    title: I18N.carbonFootprint.state,
    width: 100,
    render: (_, row) => {
      if (Number(row.orgType) !== ORG_TYPE.MAIN_PART) {
        return (
          <span className={styles.summaryStatus}>
            {getDisplayedRowStatusLabel(row)}
          </span>
        );
      }

      return (
        <span
          className={classNames(styles.statusTag, {
            [styles.statusComplete]: isSameValue(
              row.status,
              COMPUTATION_STATUS.COMPLETE,
            ),
            [styles.statusFilling]: isSameValue(
              row.status,
              COMPUTATION_STATUS.FILLING,
            ),
            [styles.statusPending]:
              isSameValue(row.status, COMPUTATION_STATUS.BE_FILLED) ||
              isSameValue(row.status, COMPUTATION_STATUS.BE_SUBMITTED),
          })}
        >
          {getStatusLabel(row)}
        </span>
      );
    },
  },
  {
    className: styles.emissionCell,
    dataIndex: 'totalEmission',
    ellipsis: true,
    title: I18N.enterpriseCarbonAccount2.totalCarbonEmissions2,
    width: 136,
    render: displayValue,
  },
  {
    className: styles.emissionCell,
    dataIndex: 'scopeOne',
    ellipsis: true,
    title: I18N.enterpriseCarbonAccount2.scopeOne,
    width: 128,
    render: displayValue,
  },
  {
    className: styles.emissionCell,
    dataIndex: 'scopeTwo',
    ellipsis: true,
    title: I18N.enterpriseCarbonAccount2.scope2,
    width: 128,
    render: displayValue,
  },
  {
    className: styles.emissionCell,
    dataIndex: 'scopeThree',
    ellipsis: true,
    title: I18N.enterpriseCarbonAccount2.fanWeisan,
    width: 128,
    render: displayValue,
  },
];

const OverviewState = ({
  loading = false,
  message,
  onRetry,
}: {
  loading?: boolean;
  message: string;
  onRetry?: () => void;
}) => (
  <div className={pageStyle.projectOverviewState}>
    {loading ? <Spin /> : null}
    <span>{message}</span>
    {onRetry ? (
      <button type='button' onClick={onRetry}>
        {I18N.carbonAgent.retry}
      </button>
    ) : null}
  </div>
);

const EmissionTrend = ({ data }: { data: EnterpriseOverviewData }) => {
  const isUp = isSameValue(data.totalEmissionRatioStatus, 1);
  const isDown = isSameValue(data.totalEmissionRatioStatus, 2);

  return (
    <span className={styles.trend}>
      <span>{I18N.enterpriseCarbonAccount2.comparedToThePreviousYear}</span>
      <span
        className={classNames(styles.trendValue, {
          [styles.trendDown]: isDown,
          [styles.trendUp]: isUp,
        })}
      >
        {displayPercentage(data.totalEmissionRatio)}
      </span>
      {isUp || isDown ? (
        <img
          alt=''
          className={classNames(styles.trendIcon, {
            [styles.trendIconDown]: isDown,
          })}
          src={trendArrowIcon}
        />
      ) : null}
    </span>
  );
};

const SummaryCard = ({ data }: { data: EnterpriseOverviewData }) => (
  <section className={styles.summaryCard}>
    <div className={styles.summaryTitle}>
      <img alt='' className={styles.summaryMainIcon} src={totalEmissionIcon} />
      <strong>{I18N.carbonAgent.totalEmission}</strong>
      <span>/tCO₂e</span>
    </div>
    <div className={styles.summaryContent}>
      <div className={styles.totalEmission}>
        <strong title={displayValue(data.totalEmission)}>
          {displayValue(data.totalEmission)}
        </strong>
        <EmissionTrend data={data} />
      </div>
      <div className={styles.scopeList}>
        {[
          {
            icon: scopeOneIcon,
            label: I18N.enterpriseCarbonAccount2.scopeOne,
            value: data.scopeOne,
          },
          {
            icon: scopeTwoIcon,
            label: I18N.enterpriseCarbonAccount2.scope2,
            value: data.scopeTwo,
          },
          {
            icon: scopeThreeIcon,
            label: I18N.enterpriseCarbonAccount2.fanWeisan,
            value: data.scopeThree,
          },
        ].map(scope => {
          const value = displayValue(scope.value);

          return (
            <div className={styles.scopeItem} key={scope.label}>
              <img alt='' className={styles.scopeBar} src={scope.icon} />
              <span>{scope.label}</span>
              <strong title={value}>{value}</strong>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const PeriodSwitcher = ({
  onChange,
  periods,
  selectedPeriod,
}: {
  onChange: (period: EnterpriseOverviewPeriod) => void;
  periods: EnterpriseOverviewPeriod[];
  selectedPeriod?: EnterpriseOverviewPeriod;
}) => (
  <div className={styles.periodSwitcher}>
    <span className={styles.periodOptions}>
      {periods.map(period => {
        const disabled = isNotStarted(period.status);
        const selected = isSameValue(period.value, selectedPeriod?.value);
        const showStatus = !isAllPeriod(period.value);

        return (
          <button
            className={classNames(styles.periodButton, {
              [styles.periodActive]: selected,
            })}
            disabled={disabled}
            key={String(period.value)}
            type='button'
            onClick={() => onChange(period)}
          >
            <span className={styles.periodButtonName}>{period.name}</span>
            {showStatus ? (
              <span className={styles.periodStatus}>
                {getPeriodStatusLabel(period.status)}
              </span>
            ) : null}
          </button>
        );
      })}
    </span>
  </div>
);

const MobilePeriodSwitcher = ({
  onChange,
  periods,
  selectedPeriod,
}: {
  onChange: (period: EnterpriseOverviewPeriod) => void;
  periods: EnterpriseOverviewPeriod[];
  selectedPeriod?: EnterpriseOverviewPeriod;
}) => (
  <div className={styles.mobilePeriodSwitcher}>
    {periods.map(period => {
      const disabled = isNotStarted(period.status);
      const selected = isSameValue(period.value, selectedPeriod?.value);
      const showStatus = !isAllPeriod(period.value);

      return (
        <button
          className={classNames(styles.mobilePeriodButton, {
            [styles.mobilePeriodActive]: selected,
          })}
          disabled={disabled}
          key={`${String(period.value)}:${period.name}`}
          type='button'
          onClick={() => onChange(period)}
        >
          <span>{period.name}</span>
          {showStatus ? (
            <small>{getPeriodStatusLabel(period.status)}</small>
          ) : null}
        </button>
      );
    })}
  </div>
);

const MobileEmissionDetails = ({
  root = false,
  row,
}: {
  root?: boolean;
  row: EnterpriseOverviewRow;
}) => (
  <div
    className={classNames(styles.mobileEmissionDetails, {
      [styles.mobileRootEmissionDetails]: root,
    })}
  >
    <div className={styles.mobileEmissionTotal}>
      <span>{I18N.carbonAgent.totalEmission}</span>
      <strong>{displayValue(row.totalEmission)}</strong>
    </div>
    <div className={styles.mobileEmissionScopes}>
      {[
        {
          label: I18N.enterpriseCarbonAccount2.scopeOne,
          value: row.scopeOne,
        },
        {
          label: I18N.enterpriseCarbonAccount2.scope2,
          value: row.scopeTwo,
        },
        {
          label: I18N.enterpriseCarbonAccount2.fanWeisan,
          value: row.scopeThree,
        },
      ].map(scope => (
        <div key={scope.label}>
          <span>{scope.label}</span>
          <strong>{displayValue(scope.value)}</strong>
        </div>
      ))}
    </div>
  </div>
);

const MobileProgress = ({ row }: { row: EnterpriseOverviewRow }) => {
  const ratio = displayValue(row.totalEmissionRatio);

  return (
    <div className={styles.mobileProgress}>
      <span className={styles.mobileProgressTrack}>
        <img alt='' src={progressTrack} />
        <span
          className={styles.mobileProgressValue}
          style={{ width: `${getProgress(row.totalEmissionRatio)}%` }}
        >
          <img alt='' src={progressFill} />
          <img alt='' src={progressPattern} />
        </span>
      </span>
      <span>{ratio === '-' ? ratio : `${ratio}%`}</span>
    </div>
  );
};

const MobileOrganizationRow = ({
  level = 0,
  row,
}: {
  level?: number;
  row: EnterpriseOverviewRow;
}) => {
  const [expanded, setExpanded] = useState(false);
  const complete = isSameValue(row.status, COMPUTATION_STATUS.COMPLETE);

  return (
    <>
      <div
        className={classNames(styles.mobileOrganizationRow, {
          [styles.mobileOrganizationRowOpen]: expanded,
        })}
      >
        <div
          className={styles.mobileOrganizationRowContent}
          style={{ paddingLeft: 8 + level * 12 }}
        >
          <button
            className={styles.mobileOrganizationToggle}
            type='button'
            aria-expanded={expanded}
            aria-label={
              expanded
                ? I18N.carbonAgent.enterpriseCarbonCollapseOrganizationNode
                : I18N.carbonAgent.enterpriseCarbonExpandOrganizationNode
            }
            onClick={() => setExpanded(value => !value)}
          >
            <span className={styles.mobileOrganizationName} title={row.name}>
              <img alt='' src={mobileOrganizationIcon} />
              <strong>{row.name}</strong>
            </span>
            <span className={styles.mobileOrganizationActions}>
              {complete ? (
                <img
                  alt=''
                  className={styles.mobileSuccessIcon}
                  src={mobileSuccessIcon}
                />
              ) : null}
              <img
                alt=''
                className={classNames(styles.mobileExpandIcon, {
                  [styles.mobileExpandIconOpen]: expanded,
                })}
                src={mobileExpandIcon}
              />
            </span>
          </button>
          <MobileProgress row={row} />
        </div>
        {expanded ? <MobileEmissionDetails row={row} /> : null}
      </div>
      {row.children?.map(child => (
        <MobileOrganizationRow
          key={`${String(child.id)}:${child.name}`}
          level={level + 1}
          row={child}
        />
      ))}
    </>
  );
};

const MobileOrganizationCard = ({ root }: { root: EnterpriseOverviewRow }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <section className={styles.mobileOrganizationCard}>
      <button
        className={styles.mobileRootHeader}
        type='button'
        aria-expanded={expanded}
        aria-label={
          expanded
            ? I18N.carbonAgent.enterpriseCarbonCollapseOrganizationNode
            : I18N.carbonAgent.enterpriseCarbonExpandOrganizationNode
        }
        onClick={() => setExpanded(value => !value)}
      >
        <span className={styles.mobileRootName} title={root.name}>
          <img alt='' src={mobileEnterpriseIcon} />
          <strong>{root.name}</strong>
        </span>
        <span className={styles.mobileRootActions}>
          <span className={styles.mobileRootStatus}>
            {getDisplayedRowStatusLabel(root)}
          </span>
          <img
            alt=''
            className={classNames(styles.mobileExpandIcon, {
              [styles.mobileExpandIconOpen]: expanded,
            })}
            src={mobileExpandIcon}
          />
        </span>
      </button>
      {expanded ? <MobileEmissionDetails root row={root} /> : null}
      {root.children?.length ? (
        <>
          <div className={styles.mobileOrganizationDivider} />
          <div className={styles.mobileOrganizationRows}>
            {root.children.map(child => (
              <MobileOrganizationRow
                key={`${String(child.id)}:${child.name}`}
                row={child}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
};

const MobileOverviewData = ({ data }: { data: EnterpriseOverviewData }) => (
  <>
    <SummaryCard data={data} />
    <div className={styles.mobileTableGroups}>
      {data.orgInfoList.map((group, index) => (
        <section
          className={styles.mobileTableGroup}
          key={getGroupKey(group, index)}
        >
          <div className={styles.mobileTableGroupTitle}>{group.title}</div>
          {group.orgList.map(root => (
            <MobileOrganizationCard
              key={`${String(root.id)}:${root.name}`}
              root={root}
            />
          ))}
        </section>
      ))}
    </div>
  </>
);

const EnterpriseCarbonProjectOverview = ({
  mobile = false,
  onBack,
  project,
}: EnterpriseCarbonProjectOverviewProps) => {
  const mobileRef = useRef(mobile);
  mobileRef.current = mobile;
  const accountingYear = project.enterpriseSetting?.accountingYear;
  const overviewOrgId = project.enterpriseSetting?.orgId;
  const year =
    accountingYear === undefined || accountingYear === null
      ? undefined
      : String(accountingYear);
  const hasOverviewOrgId = hasRequestValue(overviewOrgId);
  const [rootOrg, setRootOrg] = useState<EnterpriseOverviewOrg>();
  const [selectedPeriod, setSelectedPeriod] =
    useState<EnterpriseOverviewPeriod>();
  const [overviewData, setOverviewData] = useState<EnterpriseOverviewData>();
  const [expandedRowKeys, setExpandedRowKeys] = useState<ExpandedRowKeys>({});
  const [treeLoading, setTreeLoading] = useState(
    Boolean(year && hasOverviewOrgId),
  );
  const [treeResolved, setTreeResolved] = useState(false);
  const [treeError, setTreeError] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState(false);
  const [treeRetryKey, setTreeRetryKey] = useState(0);
  const [listRetryKey, setListRetryKey] = useState(0);

  useEffect(() => {
    setRootOrg(undefined);
    setSelectedPeriod(undefined);
    setOverviewData(undefined);
    setExpandedRowKeys({});
    setTreeError(false);
    setListError(false);
    setTreeResolved(false);

    if (!year || !hasOverviewOrgId) {
      setTreeLoading(false);
      setTreeResolved(true);
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setTreeLoading(true);
    fetchEnterpriseOverviewOrgTree(project.id, abortController.signal)
      .then(orgList => {
        if (cancelled) {
          return;
        }

        const nextRootOrg = orgList[0];
        const nextPeriod = getDefaultPeriod(
          nextRootOrg?.periodList,
          mobileRef.current,
        );

        setRootOrg(nextRootOrg);
        setSelectedPeriod(nextPeriod);
      })
      .catch(() => {
        if (!cancelled) {
          setTreeError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTreeLoading(false);
          setTreeResolved(true);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [hasOverviewOrgId, project.id, treeRetryKey, year]);

  useEffect(() => {
    if (!mobile || !rootOrg?.periodList?.length) {
      return;
    }

    setSelectedPeriod(currentPeriod =>
      currentPeriod && !isAllPeriod(currentPeriod.value)
        ? currentPeriod
        : getDefaultPeriod(rootOrg.periodList, true),
    );
  }, [mobile, rootOrg]);

  const selectedPeriodValue = selectedPeriod?.value;
  const hasRootOrg = Boolean(rootOrg);

  useEffect(() => {
    setOverviewData(undefined);
    setExpandedRowKeys({});
    setListError(false);

    if (
      !hasOverviewOrgId ||
      !hasRootOrg ||
      !treeResolved ||
      treeError ||
      !year
    ) {
      setListLoading(false);
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();
    const orgId = overviewOrgId as number | string;
    const period = hasRequestValue(selectedPeriodValue)
      ? (selectedPeriodValue as number | string)
      : '';

    setListLoading(true);
    fetchEnterpriseOverviewData(
      project.id,
      {
        orgId,
        period,
        year,
      },
      abortController.signal,
    )
      .then(data => {
        if (!cancelled) {
          setOverviewData(data);
          setExpandedRowKeys(getInitialExpandedRowKeys(data));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setListError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setListLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [
    hasOverviewOrgId,
    hasRootOrg,
    listRetryKey,
    overviewOrgId,
    project.id,
    selectedPeriodValue,
    treeError,
    treeResolved,
    year,
  ]);

  const handlePeriodChange = (period: EnterpriseOverviewPeriod) => {
    if (
      isNotStarted(period.status) ||
      isSameValue(period.value, selectedPeriod?.value)
    ) {
      return;
    }

    setOverviewData(undefined);
    setExpandedRowKeys({});
    setListError(false);
    setListLoading(true);
    setSelectedPeriod(period);
  };

  let overviewContent: ReactNode;

  if (!year || !hasOverviewOrgId) {
    overviewContent = (
      <OverviewState
        message={I18N.carbonAgent.enterpriseProjectOverviewConfigMissing}
      />
    );
  } else if (treeLoading || !treeResolved) {
    overviewContent = (
      <OverviewState
        loading
        message={I18N.carbonAgent.projectCalculationsLoading}
      />
    );
  } else if (treeError) {
    overviewContent = (
      <OverviewState
        message={I18N.carbonAgent.enterpriseProjectOverviewLoadFailed}
        onRetry={() => setTreeRetryKey(value => value + 1)}
      />
    );
  } else if (!rootOrg) {
    overviewContent = (
      <OverviewState
        message={I18N.carbonAgent.enterpriseProjectOverviewEmpty}
      />
    );
  } else {
    const periods = rootOrg.periodList || [];
    const hasRows = Boolean(
      overviewData?.orgInfoList.some(group => group.orgList?.length),
    );

    if (mobile) {
      const mobilePeriods = periods.filter(
        period => !isAllPeriod(period.value),
      );

      overviewContent = (
        <div className={styles.mobileContent}>
          {mobilePeriods.length ? (
            <MobilePeriodSwitcher
              periods={mobilePeriods}
              selectedPeriod={selectedPeriod}
              onChange={handlePeriodChange}
            />
          ) : null}
          <div className={styles.mobileOverviewMain}>
            {overviewData ? (
              hasRows ? (
                <MobileOverviewData data={overviewData} />
              ) : (
                <>
                  <SummaryCard data={overviewData} />
                  <OverviewState
                    message={I18N.carbonAgent.enterpriseProjectOverviewEmpty}
                  />
                </>
              )
            ) : listLoading ? (
              <OverviewState
                loading
                message={I18N.carbonAgent.projectCalculationsLoading}
              />
            ) : listError ? (
              <OverviewState
                message={I18N.carbonAgent.enterpriseProjectOverviewLoadFailed}
                onRetry={() => setListRetryKey(value => value + 1)}
              />
            ) : null}
          </div>
        </div>
      );
    } else {
      overviewContent = (
        <div className={styles.content}>
          {periods.length > 1 ? (
            <section className={styles.periodOverviewCard}>
              <PeriodSwitcher
                periods={periods}
                selectedPeriod={selectedPeriod}
                onChange={handlePeriodChange}
              />
              {overviewData ? <SummaryCard data={overviewData} /> : null}
            </section>
          ) : overviewData ? (
            <SummaryCard data={overviewData} />
          ) : null}
          {!overviewData && listLoading ? (
            <OverviewState
              loading
              message={I18N.carbonAgent.projectCalculationsLoading}
            />
          ) : null}
          {!overviewData && listError ? (
            <OverviewState
              message={I18N.carbonAgent.enterpriseProjectOverviewLoadFailed}
              onRetry={() => setListRetryKey(value => value + 1)}
            />
          ) : null}
          {overviewData && hasRows ? (
            <div className={styles.tableGroups}>
              {overviewData.orgInfoList.map((group, index) => {
                const groupKey = getGroupKey(group, index);

                return (
                  <section className={styles.tableGroup} key={groupKey}>
                    <div className={styles.tableGroupTitle}>{group.title}</div>
                    <div className={styles.tableCard}>
                      <Table<EnterpriseOverviewRow>
                        columns={columns}
                        dataSource={group.orgList}
                        locale={{
                          emptyText:
                            I18N.carbonAgent.enterpriseProjectOverviewEmpty,
                        }}
                        pagination={false}
                        rowKey='id'
                        scroll={{ x: 900 }}
                        expandable={{
                          expandedRowKeys: expandedRowKeys[groupKey] || [],
                          expandIcon: () => null,
                          indentSize: 16,
                        }}
                      />
                    </div>
                  </section>
                );
              })}
            </div>
          ) : null}
          {overviewData && !hasRows ? (
            <OverviewState
              message={I18N.carbonAgent.enterpriseProjectOverviewEmpty}
            />
          ) : null}
        </div>
      );
    }
  }

  return (
    <section
      className={classNames(pageStyle.projectOverviewPage, {
        [styles.mobilePage]: mobile,
      })}
    >
      <header
        className={classNames(pageStyle.projectOverviewHeader, {
          [styles.mobileHeader]: mobile,
        })}
      >
        <button
          className={pageStyle.projectOverviewBack}
          type='button'
          aria-label={I18N.carbonAgent.backToProjectHome}
          onClick={onBack}
        >
          <span
            className={pageStyle.projectOverviewBackIcon}
            aria-hidden='true'
          >
            <img src={overviewChevron} alt='' width={10} height={6} />
          </span>
          <strong>{I18N.carbonAgent.projectDataOverview}</strong>
        </button>
      </header>

      <div
        className={classNames(pageStyle.projectOverviewBody, {
          [styles.mobileBody]: mobile,
        })}
      >
        {overviewContent}
      </div>
    </section>
  );
};

export default EnterpriseCarbonProjectOverview;
