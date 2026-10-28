import I18N from '@src/lang/I18N';
import { Alert, Empty, Table, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { stockCodes } from './FollowCompany';
import {
  displayUnit,
  groupedMetricRows,
  hasUndisclosedScopeTwoBasis,
  metricKey,
  metricValue,
} from './data';
import type { GroupedMetricRow } from './data';
import type { CarbonData, Comparison, Metric } from './types';
import style from './Pages.module.less';

const MetricLabel = ({
  metric,
  unit = false,
}: {
  metric: Metric;
  unit?: boolean;
}) => (
  <div className={style.metricLabel}>
    <span>{metric.name}</span>
    {hasUndisclosedScopeTwoBasis(metric) ? (
      <small>{I18N.enterpriseData.basisUnknown}</small>
    ) : null}
    {unit ? (
      <small>
        {displayUnit(metric.unit)}
        {metric.currency ? ` · ${metric.currency}` : ''}
      </small>
    ) : null}
    <Tooltip
      title={[
        I18N.enterpriseData.marketSource,
        metric.marketCode || '—',
        ...(metric.path || []),
      ].join(' · ')}
    >
      <span
        className={style.metricBasis}
        aria-label={`${I18N.enterpriseData.marketSource}: ${
          metric.marketCode || '—'
        }`}
      >
        ⓘ
      </span>
    </Tooltip>
  </div>
);

const groupTitle = (row: GroupedMetricRow) =>
  row.group === 'emissions'
    ? I18N.enterpriseData.emissionAmount
    : row.group === 'intensity'
    ? I18N.enterpriseData.emissionIntensity
    : row.title;
const groupColumns = (
  columns: ColumnsType<GroupedMetricRow>,
  fixedIndicator = false,
): ColumnsType<GroupedMetricRow> =>
  columns.map((column, index) => ({
    ...column,
    onCell: row => {
      if (row.kind !== 'group') return {};
      // 固定指标列不能跨越可滚动的数据列，否则会遮住整行。
      if (fixedIndicator)
        return {
          colSpan: index === 0 ? 1 : index === 1 ? columns.length - 1 : 0,
        };
      return { colSpan: index === 0 ? columns.length : 0 };
    },
    render: (value, row, rowIndex) =>
      row.kind === 'group'
        ? index === 0
          ? groupTitle(row)
          : null
        : column.render?.(value, row, rowIndex),
  }));
const rowClass = (row: GroupedMetricRow) =>
  row.kind === 'group'
    ? `${style.groupRow} ${
        row.group === 'intensity'
          ? style.intensityGroup
          : row.group === 'emissions'
          ? style.emissionsGroup
          : style.otherGroup
      }`
    : '';

export const DetailMetricsTable = ({ data }: { data: CarbonData }) => {
  const metrics = data.metrics.filter(metric =>
    data.years.includes(metric.statisticalPeriod),
  );
  const values = new Map(
    metrics.map(metric => [
      `${metricKey(metric)}:${metric.statisticalPeriod}`,
      metric,
    ]),
  );
  const columns: ColumnsType<GroupedMetricRow> = [
    {
      title: I18N.enterpriseData.indicator,
      key: 'metric',
      width: 280,
      render: (_, row) => row.metric && <MetricLabel metric={row.metric} />,
    },
    {
      title: I18N.enterpriseData.unit,
      key: 'unit',
      width: 140,
      render: (_, row) => (
        <>
          {displayUnit(row.metric?.unit)}
          {row.metric?.currency ? (
            <small className={style.muted}>{row.metric.currency}</small>
          ) : null}
        </>
      ),
    },
    ...data.years.map(year => ({
      title: year,
      key: year,
      width: 140,
      render: (_: unknown, row: GroupedMetricRow) =>
        metricValue(
          row.metric && values.get(`${metricKey(row.metric)}:${year}`),
        ),
    })),
  ];
  const rows = groupedMetricRows([metrics]);
  return (
    <Table<GroupedMetricRow>
      className={style.metricTable}
      tableLayout='fixed'
      rowKey='key'
      columns={groupColumns(columns)}
      dataSource={rows}
      rowClassName={rowClass}
      pagination={false}
      scroll={rows.length ? { x: 420 + 140 * data.years.length } : undefined}
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

export const PageComparisonTable = ({
  comparison,
  showMedian,
  mobile = false,
  pageScroll = mobile,
}: {
  comparison: Comparison;
  showMedian: boolean;
  mobile?: boolean;
  pageScroll?: boolean;
}) => {
  const indicatorWidth = mobile ? 160 : 340;
  const companyWidth = mobile ? 200 : 250;
  const medianWidth = mobile ? 180 : 220;
  const metrics = comparison.companies.map(item =>
    item.metrics.filter(metric => metric.statisticalPeriod === comparison.year),
  );
  const medians = new Map(
    comparison.medians.map(median => [metricKey(median), median]),
  );
  const columns: ColumnsType<GroupedMetricRow> = [
    {
      title: I18N.enterpriseData.indicator,
      key: 'metric',
      width: indicatorWidth,
      fixed: pageScroll ? 'left' : undefined,
      render: (_, row) =>
        row.metric && <MetricLabel metric={row.metric} unit />,
    },
    ...comparison.companies.map((item, index) => {
      const values = new Map(
        metrics[index].map(metric => [metricKey(metric), metric]),
      );
      return {
        title: (
          <div className={style.columnCompany}>
            <span title={item.company.name}>
              {item.company.shortName || item.company.name}
            </span>
            <small>{stockCodes(item.company)}</small>
          </div>
        ),
        key: item.company.companyId,
        width: companyWidth,
        render: (_: unknown, row: GroupedMetricRow) =>
          metricValue(row.metric && values.get(metricKey(row.metric))),
      };
    }),
  ];
  if (comparison.sameIndustry && showMedian)
    columns.push({
      title: (
        <div className={style.columnCompany}>
          {I18N.enterpriseData.median}
          <small>{comparison.year}</small>
        </div>
      ),
      key: 'median',
      width: medianWidth,
      render: (_, row) => {
        const median = row.metric && medians.get(metricKey(row.metric));
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
  return (
    <div className={style.comparisonTable}>
      {comparison.companies.map((item, index) =>
        !metrics[index].length ? (
          <Alert
            key={item.company.companyId}
            type='info'
            message={`${item.company.name}：${I18N.enterpriseData.missingYear}`}
          />
        ) : null,
      )}
      <Table<GroupedMetricRow>
        className={style.metricTable}
        tableLayout='fixed'
        rowKey='key'
        columns={groupColumns(columns, pageScroll)}
        dataSource={groupedMetricRows(metrics)}
        rowClassName={rowClass}
        pagination={false}
        scroll={{
          x:
            indicatorWidth +
            companyWidth * comparison.companies.length +
            (comparison.sameIndustry && showMedian ? medianWidth : 0),
          ...(pageScroll ? {} : { y: '100%' }),
        }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={I18N.enterpriseData.noData}
            />
          ),
        }}
      />
      {comparison.sameIndustry && showMedian ? (
        <p className={style.sourceNote}>{I18N.enterpriseData.medianNote}</p>
      ) : null}
    </div>
  );
};
