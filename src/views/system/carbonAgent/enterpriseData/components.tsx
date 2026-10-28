import { CheckOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Button,
  Descriptions,
  Dropdown,
  Empty,
  message,
  Pagination,
  Space,
  Spin,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useRef, useState } from 'react';

import addIcon from './assets/add.svg';
import addedIcon from './assets/added.svg';
import starIcon from './assets/star.svg';
import starFilledIcon from './assets/star-filled.svg';
import pageStyle from './Pages.module.less';
import {
  displayUnit,
  formatDecimal,
  hasUndisclosedScopeTwoBasis,
  metricKey,
  metricRows,
  metricValue,
  safeReportUrl,
} from './data';
import { enterpriseError, fetchReports, refreshReport } from './service';
import { useEnterpriseData } from './state';
import type {
  CarbonData,
  Company,
  Comparison,
  EnterpriseReport,
  Metric,
} from './types';
import style from './index.module.less';

export const ErrorState = ({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) => (
  <Alert
    type='error'
    showIcon
    message={typeof error === 'string' ? error : enterpriseError(error)}
    action={
      onRetry ? (
        <Button onClick={onRetry}>{I18N.enterpriseData.retry}</Button>
      ) : undefined
    }
  />
);

export const Loading = () => (
  <div className={style.loading}>
    <Spin />
    <span>{I18N.enterpriseData.loading}</span>
  </div>
);

export const securitiesText = (company: Company) =>
  company.securities
    ?.map(item =>
      [item.marketCode, item.code, item.name].filter(Boolean).join(' · '),
    )
    .join(' / ') || '—';

export const CompanySummary = ({ company }: { company: Company }) => (
  <div className={style.companySummary}>
    <strong>{company.name}</strong>
    <div>
      {company.labels?.map(label => (
        <Tag key={label}>{label}</Tag>
      ))}
    </div>
    <span>
      {I18N.enterpriseData.creditCode}：{company.unifiedSocialCreditCode || '—'}
    </span>
    <span>
      {I18N.enterpriseData.industry}：{company.industryCategory || '—'}
    </span>
    <span>
      {I18N.enterpriseData.securities}：{securitiesText(company)}
    </span>
  </div>
);

export const FollowButton = ({
  companyId,
  disabled = false,
  menu = false,
  appearance = 'default',
  className,
}: {
  companyId: string;
  disabled?: boolean;
  menu?: boolean;
  appearance?: 'default' | 'star' | 'add' | 'link';
  className?: string;
}) => {
  const state = useEnterpriseData();
  const followed =
    state.follows.data?.some(item => item.enterpriseId === companyId) || false;
  const busy = state.pending.includes(companyId);
  const count = state.follows.data?.length || 0;
  const limit = state.entitlement.data?.followLimit || 0;
  const unavailable =
    !state.enabled ||
    disabled ||
    !state.follows.isSuccess ||
    state.follows.isError ||
    (!followed &&
      (!state.entitlement.isSuccess ||
        state.entitlement.isError ||
        count >= limit));
  let reason = '';
  if (!state.enabled || disabled) reason = I18N.enterpriseData.readonly;
  else if (state.follows.isError || (!followed && state.entitlement.isError))
    reason = I18N.enterpriseData.limitsFailed;
  else if (!followed && count >= limit)
    reason = limit
      ? I18N.enterpriseData.followLimit
      : I18N.enterpriseData.followUnavailable;
  if (appearance === 'link') {
    return (
      <Tooltip title={reason || undefined}>
        <Button
          type='link'
          className={className}
          disabled={unavailable || busy}
          loading={busy}
          onClick={() => state.mutateFollow(companyId, !followed)}
        >
          {followed ? I18N.enterpriseData.unfollow : I18N.enterpriseData.follow}
        </Button>
      </Tooltip>
    );
  }
  if (menu && followed) {
    return (
      <Dropdown
        trigger={['click', 'hover']}
        menu={{
          items: [
            {
              key: 'unfollow',
              label: I18N.enterpriseData.unfollow,
              disabled: unavailable || busy,
            },
          ],
          onClick: () => state.mutateFollow(companyId, false),
        }}
      >
        <Button
          aria-label={I18N.enterpriseData.unfollow}
          loading={busy}
          icon={<MoreOutlined />}
        />
      </Dropdown>
    );
  }
  const compact = appearance !== 'default';
  const actionIcon =
    appearance === 'star'
      ? followed
        ? starFilledIcon
        : starIcon
      : followed
      ? addedIcon
      : addIcon;
  const label =
    appearance === 'star'
      ? followed
        ? I18N.enterpriseData.followedShort
        : I18N.enterpriseData.followShort
      : appearance === 'add'
      ? followed
        ? I18N.enterpriseData.added
        : I18N.enterpriseData.addShort
      : followed
      ? I18N.enterpriseData.followed
      : I18N.enterpriseData.follow;
  return (
    <Tooltip
      title={
        reason ||
        (appearance === 'star' && followed
          ? I18N.enterpriseData.unfollow
          : undefined)
      }
    >
      <Button
        className={className}
        type={compact ? 'text' : 'default'}
        data-added={appearance === 'add' && followed ? true : undefined}
        aria-label={
          appearance === 'star' && followed
            ? I18N.enterpriseData.unfollow
            : label
        }
        disabled={unavailable || busy || (appearance === 'add' && followed)}
        loading={busy}
        icon={
          compact ? (
            <img src={actionIcon} alt='' />
          ) : followed ? (
            <CheckOutlined />
          ) : (
            <PlusOutlined />
          )
        }
        onClick={() => state.mutateFollow(companyId, !followed)}
      >
        {label}
      </Button>
    </Tooltip>
  );
};

export const BasicInformation = ({ company }: { company: Company }) => {
  const t = I18N.enterpriseData;
  const fields = [
    [t.company, company.name],
    [t.creditCode, company.unifiedSocialCreditCode],
    [t.industry, company.industryCategory],
    [t.securities, securitiesText(company)],
    [t.representative, company.legalRepresentative],
    [t.state, company.companyState],
    [t.foundationDate, company.foundationDate],
    [
      t.capital,
      company.registeredCapital != null
        ? `${formatDecimal(company.registeredCapital)} ${
            company.registeredCapitalUnit || ''
          }`
        : undefined,
    ],
    [t.companyType, company.companyType],
    [t.address, company.registeredAddress],
    [t.scope, company.businessScope],
  ];
  return (
    <section className={style.section}>
      <h3>{t.basic}</h3>
      <Descriptions
        bordered
        size='small'
        column={{ xs: 1, sm: 1, md: 2, lg: 2, xl: 2, xxl: 2 }}
      >
        {fields.map(([label, value]) => (
          <Descriptions.Item key={label} label={label}>
            {value || '—'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    </section>
  );
};

const baseColumns = (): ColumnsType<Metric> => [
  {
    title: I18N.enterpriseData.indicator,
    key: 'name',
    width: 240,
    render: (_, metric) => (
      <div>
        {metric.path && metric.path.length > 1 ? (
          <small className={style.muted}>
            {metric.path.slice(0, -1).join(' / ')}
          </small>
        ) : null}
        <div>{metric.name}</div>
        {hasUndisclosedScopeTwoBasis(metric) ? (
          <Tag>{I18N.enterpriseData.basisUnknown}</Tag>
        ) : null}
      </div>
    ),
  },
  {
    title: I18N.enterpriseData.basis,
    dataIndex: 'marketCode',
    width: 150,
    render: value => value || I18N.enterpriseData.basisUnknown,
  },
  {
    title: I18N.enterpriseData.unit,
    dataIndex: 'unit',
    width: 140,
    render: displayUnit,
  },
  {
    title: I18N.enterpriseData.currency,
    dataIndex: 'currency',
    width: 90,
    render: value => value || '—',
  },
];

export const MetricsTable = ({ data }: { data: CarbonData }) => {
  const metrics = data.metrics.filter(item =>
    data.years.includes(item.statisticalPeriod),
  );
  const values = new Map(
    metrics.map(item => [`${metricKey(item)}:${item.statisticalPeriod}`, item]),
  );
  const columns: ColumnsType<Metric> = [
    ...baseColumns(),
    ...data.years.map(year => ({
      title: year,
      key: year,
      width: 150,
      render: (_: unknown, row: Metric) =>
        metricValue(values.get(`${metricKey(row)}:${year}`)),
    })),
  ];
  return (
    <Table
      size='small'
      rowKey={metricKey}
      columns={columns}
      dataSource={metricRows([metrics])}
      pagination={false}
      scroll={{ x: 'max-content' }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={I18N.enterpriseData.noData}
          />
        ),
      }}
    />
  );
};

export const ComparisonTable = ({
  comparison,
  showMedian,
}: {
  comparison: Comparison;
  showMedian: boolean;
}) => {
  const metrics = comparison.companies.map(item =>
    item.metrics.filter(metric => metric.statisticalPeriod === comparison.year),
  );
  const medians = new Map(
    comparison.medians.map(item => [metricKey(item), item]),
  );
  const columns: ColumnsType<Metric> = [
    ...baseColumns(),
    ...comparison.companies.map((item, index) => {
      const values = new Map(
        metrics[index].map(metric => [metricKey(metric), metric]),
      );
      return {
        title: item.company.name,
        key: item.company.companyId,
        width: 220,
        render: (_: unknown, row: Metric) =>
          metricValue(values.get(metricKey(row))),
      };
    }),
  ];
  if (comparison.sameIndustry && showMedian) {
    columns.push({
      title: I18N.enterpriseData.median,
      key: 'median',
      width: 180,
      render: (_, row) => {
        const median = medians.get(metricKey(row));
        return (
          <Tooltip
            title={`${I18N.enterpriseData.samples}：${
              median?.sampleCount ?? 0
            }`}
          >
            <span>
              {median && median.sampleCount >= 2
                ? metricValue({ valueNumeric: median.value })
                : '—'}
            </span>
          </Tooltip>
        );
      },
    });
  }
  return (
    <Space direction='vertical' className={style.fullWidth}>
      {comparison.companies.map((item, index) =>
        !metrics[index].length ? (
          <Alert
            key={item.company.companyId}
            type='info'
            message={`${item.company.name}：${I18N.enterpriseData.missingYear}`}
          />
        ) : null,
      )}
      <Table
        size='small'
        rowKey={metricKey}
        columns={columns}
        dataSource={metricRows(metrics)}
        pagination={false}
        scroll={{ x: 'max-content' }}
        locale={{ emptyText: I18N.enterpriseData.noData }}
      />
      {comparison.sameIndustry && showMedian ? (
        <p className={style.muted}>{I18N.enterpriseData.medianNote}</p>
      ) : null}
    </Space>
  );
};

export const ReportList = ({
  companyId,
  sources,
  snapshot = false,
  readonly = false,
  layout = 'card',
}: {
  companyId: string;
  sources: EnterpriseReport[];
  snapshot?: boolean;
  readonly?: boolean;
  layout?: 'card' | 'page';
}) => {
  const state = useEnterpriseData();
  const [page, setPage] = useState(1);
  const [opening, setOpening] = useState('');
  const abortRef = useRef<AbortController>();
  const windowRef = useRef<Window | null>(null);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      windowRef.current?.close();
    },
    [],
  );
  const paged = !snapshot && state.enabled;
  const query = useQuery({
    queryKey: ['enterpriseData', state.scope, 'reports', companyId, page],
    queryFn: ({ signal }) => fetchReports(companyId, page, signal),
    enabled: paged,
    retry: false,
  });
  const records = paged
    ? query.data?.records || []
    : sources.slice((page - 1) * 20, page * 20);
  const openReport = async (report: EnterpriseReport) => {
    const url = safeReportUrl(report.linkUrl);
    if (!url || opening) return;
    const expires = report.linkExpiresAt
      ? Date.parse(report.linkExpiresAt)
      : NaN;
    const expired = Number.isFinite(expires) && expires <= Date.now();
    if (!expired) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (readonly || !state.enabled) {
      message.warning(I18N.enterpriseData.reportUnavailable);
      return;
    }
    // 在点击栈内创建窗口，异步更新链接后仍可在 Safari 打开。
    const target = window.open('', '_blank');
    if (!target) {
      message.warning(I18N.enterpriseData.popupBlocked);
      return;
    }
    target.opener = null;
    windowRef.current = target;
    const controller = new AbortController();
    abortRef.current = controller;
    setOpening(report.reportId);
    try {
      const updated = await refreshReport(
        companyId,
        report.reportId,
        controller.signal,
      );
      const nextUrl = safeReportUrl(updated?.linkUrl);
      if (controller.signal.aborted) return;
      if (
        !nextUrl ||
        (updated?.linkExpiresAt &&
          Date.parse(updated.linkExpiresAt) <= Date.now())
      ) {
        throw new Error(I18N.enterpriseData.reportUnavailable);
      }
      target.location.replace(nextUrl);
      windowRef.current = null;
    } catch (error) {
      target.close();
      if (!controller.signal.aborted) message.error(enterpriseError(error));
    } finally {
      if (!controller.signal.aborted) setOpening('');
    }
  };
  const t = I18N.enterpriseData;
  return (
    <section className={layout === 'page' ? pageStyle.reports : style.section}>
      {layout === 'card' ? (
        <>
          <h3>{t.sources}</h3>
          <p className={style.muted}>{t.sourceNote}</p>
        </>
      ) : null}
      {paged && query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <>
          <Table<EnterpriseReport>
            className={layout === 'page' ? pageStyle.metricTable : undefined}
            tableLayout={layout === 'page' ? 'fixed' : undefined}
            rowKey='reportId'
            size={layout === 'page' ? 'middle' : 'small'}
            loading={paged && query.isLoading}
            dataSource={records}
            pagination={false}
            scroll={{ x: layout === 'page' ? 860 : 'max-content' }}
            locale={{ emptyText: t.noSources }}
            columns={[
              ...(layout === 'page'
                ? [
                    {
                      title: t.serial,
                      key: 'serial',
                      width: 68,
                      render: (
                        _: unknown,
                        _row: EnterpriseReport,
                        index: number,
                      ) => (page - 1) * 20 + index + 1,
                    },
                    {
                      title: t.published,
                      dataIndex: 'disclosureDate',
                      width: 150,
                      render: (value: string) => value || '—',
                    },
                  ]
                : []),
              {
                title: t.reportTitle,
                key: 'title',
                width: layout === 'page' ? undefined : 300,
                ellipsis: layout === 'page',
                render: (_, report) =>
                  safeReportUrl(report.linkUrl) ? (
                    <Button
                      type='link'
                      className={style.reportLink}
                      disabled={Boolean(opening)}
                      loading={opening === report.reportId}
                      onClick={() => openReport(report)}
                    >
                      {report.title || '—'}
                    </Button>
                  ) : (
                    <span>{report.title || '—'}</span>
                  ),
              },
              ...(layout === 'card'
                ? [
                    {
                      title: t.published,
                      dataIndex: 'disclosureDate',
                      width: 140,
                      render: (value: string) => value || '—',
                    },
                  ]
                : []),
              {
                title: t.reportType,
                dataIndex: 'reportType',
                width: 120,
                render: value => value || '—',
              },
              {
                title: t.source,
                dataIndex: 'source',
                width: 150,
                render: value => value || '—',
              },
            ]}
          />
          <div
            className={layout === 'page' ? pageStyle.reportFooter : undefined}
          >
            {layout === 'page' ? (
              <span>
                {t.totalRecords.replace(
                  '{count}',
                  String(paged ? query.data?.total || 0 : sources.length),
                )}
              </span>
            ) : null}
            <Pagination
              className={style.pagination}
              current={page}
              pageSize={20}
              total={paged ? query.data?.total || 0 : sources.length}
              showSizeChanger={false}
              hideOnSinglePage={layout !== 'page'}
              onChange={setPage}
            />
          </div>
          {layout === 'page' ? (
            <p className={pageStyle.sourceNote}>{t.sourceNote}</p>
          ) : null}
        </>
      )}
    </section>
  );
};
