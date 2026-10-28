import { Gauge } from '@ant-design/charts';
import { CustomDrawer } from '@src/components/CustomDrawer';
import I18N from '@src/lang/I18N';
import {
  Button,
  Checkbox,
  Empty as AntEmpty,
  Select,
  Spin,
  Table,
  Tabs,
  Tooltip,
} from 'antd';
import classNames from 'classnames';
import type { EChartsOption } from 'echarts';
import ReactECharts from 'echarts-for-react';
import { FC, useEffect, useMemo, useState } from 'react';

import { IconAlibaba } from '@/components/iconfont';
import { RouteMapsSupplyChain2 } from '@/router/route-paths/supplyChain2';

import styles from './index.module.less';
import benchmarkIcon from '../../../../enterpriseCarbonAccount2/AnnualReport/chart/Benchmarking/icon.svg';
import benchmarkStyles from '../../../../enterpriseCarbonAccount2/AnnualReport/chart/Benchmarking/index.module.less';
import Empty from '../../../../enterpriseCarbonAccount2/AnnualReport/chart/Empty';
import AIReductionAdvice from '../../../../enterpriseCarbonAccount2/AnnualReport/components/AIReductionAdvice';
import { CustomRadio } from '../../../../enterpriseCarbonAccount2/AnnualReport/components/Radio';
import reportStyles from '../../../../enterpriseCarbonAccount2/AnnualReport/index.module.less';
import {
  getSupplierEnterpriseEmissionManageRecords,
  getSupplierEnterpriseEmissionOverviewAiAdvice,
  getSupplierEnterpriseEmissionOverviewDetail,
  getSupplierEnterpriseEmissionOverviewOptions,
} from '../../service';
import {
  SupplierEnterpriseEmissionManageRecord,
  SupplierEnterpriseEmissionManageYearGroup,
  SupplierEnterpriseEmissionIndustry,
  SupplierEnterpriseEmissionOverviewDetail,
  SupplierEnterpriseEmissionYearOption,
  SupplierProductEmissionOverviewSankey,
  SupplierProductEmissionOverviewSummary,
} from '../../type';
import { formatPlainNumber } from '../../utils';

type SupplierEnterpriseCarbonOverviewProps = {
  supplierId: number;
};

type ManageDrawerProps = {
  supplierId: number;
  open: boolean;
  selectedMap: Record<string, number | undefined>;
  onClose: () => void;
  onConfirm: (selectedMap: Record<string, number | undefined>) => void;
};

const STANDARD_OPTIONS = [
  { value: 1, label: I18N.enterpriseCarbonAccount2.ghgPr2 },
  { value: 2, label: I18N.enterpriseCarbonAccount2.isoStandard },
];

const YEAR_NUM_OPTIONS = [
  { value: 3, label: I18N.enterpriseCarbonAccount2.recentYears },
  { value: 5, label: I18N.enterpriseCarbonAccount2.recentYears2 },
  { value: 10, label: I18N.enterpriseCarbonAccount2.recentYears3 },
];

const BENCHMARK_DATA_TYPE = {
  AMOUNT: '1',
  INTENSITY: '2',
};

const BENCHMARK_SCOPE_TYPE = {
  WITHOUT_SCOPE_THREE: '0',
  WITH_SCOPE_THREE: '1',
};

const COLORS = [
  '#2FCCAA',
  '#08A28B',
  '#026961',
  '#5EAFFF',
  '#F6B44B',
  '#E56665',
];

const LEVEL_BACKGROUND_MAP: Record<string, string> = {
  A: 'linear-gradient(90deg, rgba(12, 191, 159, 0.08) 0%, rgba(12, 191, 159, 0.00) 100%)',
  B: 'linear-gradient(90deg, rgba(52, 145, 250, 0.08) 0%, rgba(52, 145, 250, 0.00) 100%)',
  C: 'linear-gradient(90deg, rgba(251, 169, 62, 0.08) 0%, rgba(251, 169, 62, 0.00) 100%)',
  D: 'linear-gradient(90deg, rgba(113, 111, 255, 0.08) 0%, rgba(113, 111, 255, 0.00) 100%)',
  E: 'linear-gradient(90deg, rgba(108, 117, 125, 0.08) 0%, rgba(108, 117, 125, 0.00) 100%)',
};

const LEVEL_COLOR_MAP: Record<string, string> = {
  A: '#0CBF9F',
  B: '#3491FA',
  C: '#FBA93E',
  D: '#716FFF',
  E: '#6C757D',
};

const LEVEL_DESCRIPTION_MAP: Record<string, string> = {
  A: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation5,
  B: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation4,
  C: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation3,
  D: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation2,
  E: I18N.enterpriseCarbonAccount2.enterpriseEmissionsSituation,
};

const toNumber = (value?: number | string | null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatEmission = (value?: number | string | null) =>
  value === undefined || value === null || value === ''
    ? '-'
    : formatPlainNumber(toNumber(value));

const NoData: FC<{ className?: string }> = ({ className }) => (
  <Empty className={className} />
);

const getGaugeColor = (percent: number) => {
  if (percent === 1) {
    return '#F6C06B';
  }
  if (percent > 1) {
    return '#026961';
  }
  return '#08A28B';
};

const MetricGaugeCard: FC<{
  title: string;
  unitText: string;
  valueLabel: string;
  metric?: {
    total?: string | null;
    base?: string | null;
    compare?: string | null;
  };
}> = ({ title, unitText, valueLabel, metric }) => {
  const percent = toNumber(metric?.compare) / 100;
  const gaugeColor = getGaugeColor(percent);

  return (
    <div className={reportStyles.gaugeChartItem}>
      <div className={classNames(reportStyles.title, reportStyles.gaugeTitle)}>
        {title}
        <span className={reportStyles['caption-s']}>{unitText}</span>
      </div>
      <div className={reportStyles.gaugeChartItemContent}>
        <div className={reportStyles.gaugeChartContent}>
          <Gauge
            percent={percent}
            radius={1}
            range={{ width: 8, color: gaugeColor }}
            indicator={{ pointer: undefined, pin: undefined }}
            statistic={{
              title: {
                offsetY: -40,
                style: {
                  fontSize: '20px',
                  fontWeight: 500,
                  color: gaugeColor,
                },
                formatter: value =>
                  value !== undefined
                    ? `${formatEmission(toNumber(value.percent) * 100)}%`
                    : '',
              },
              content: {
                offsetY: -20,
                style: {
                  fontSize: '10px',
                  color: '#999EA4',
                },
                formatter: () =>
                  I18N.enterpriseCarbonAccount2.comparedToTheBaseYear,
              },
            }}
            axis={{
              tickInterval: 25,
              subTickLine: null,
              tickLine: null,
              label: null,
              max: 100,
              min: 0,
            }}
          />
        </div>
        <div className={reportStyles.gaugeSplit} />
        <div className={reportStyles.gaugeInfoBlock}>
          <div className={reportStyles.infoTip}>{valueLabel}</div>
          <div className={reportStyles.infoValue}>
            {formatEmission(metric?.total)}
          </div>
          <div className={reportStyles.infoTip}>
            {I18N.enterpriseCarbonAccount2.baseYear} {metric?.base || '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricOverview: FC<{
  detail?: SupplierEnterpriseEmissionOverviewDetail;
}> = ({ detail }) => (
  <div className={reportStyles.gaugeChart}>
    <MetricGaugeCard
      title={I18N.enterpriseCarbonAccount2.annualCarbonEmissions2}
      unitText={I18N.enterpriseCarbonAccount2.unitTCo}
      valueLabel={I18N.enterpriseCarbonAccount2.annualEmissions2}
      metric={detail?.emissionMetric}
    />
    <MetricGaugeCard
      title={I18N.enterpriseCarbonAccount2.annualCarbonEmissions}
      unitText={I18N.supplyChain2.enterpriseCarbonIntensityUnit}
      valueLabel={I18N.enterpriseCarbonAccount2.annualStrongEmissions}
      metric={detail?.intensityMetric}
    />
  </div>
);

const SummaryChart: FC<{
  data?: SupplierProductEmissionOverviewSummary[];
  type: 'pie' | 'bar';
  height?: number;
  unit?: string;
}> = ({ data, type, height = 260, unit = 'tCO₂e' }) => {
  const chartData = (data || []).filter(item => toNumber(item.total) > 0);

  const option = useMemo<EChartsOption>(() => {
    if (type === 'pie') {
      return {
        color: COLORS,
        tooltip: {
          trigger: 'item',
          formatter: (params: any) =>
            `${params.marker}${params.name}<br/>${formatEmission(
              params.value,
            )}${unit} (${formatEmission(params.percent)}%)`,
        },
        legend: {
          orient: 'vertical',
          right: 16,
          top: 'middle',
        },
        series: [
          {
            type: 'pie',
            radius: ['48%', '68%'],
            center: ['38%', '50%'],
            label: { show: false },
            data: chartData.map(item => ({
              name: item.name,
              value: toNumber(item.total),
            })),
          },
        ],
      };
    }

    return {
      color: '#08A28B',
      grid: { left: 16, right: 32, top: 16, bottom: 16, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params?.[0];
          return `${item?.marker || ''}${
            item?.name || '-'
          }<br/>${formatEmission(item?.value)}${unit}`;
        },
      },
      xAxis: {
        type: 'value',
        axisLabel: {
          formatter: value => formatEmission(value),
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#E8EDF2' } },
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        data: chartData.map(item => item.name),
      },
      series: [
        {
          type: 'bar',
          barMaxWidth: 14,
          data: chartData.map(item => toNumber(item.total)),
        },
      ],
    };
  }, [chartData, type, unit]);

  if (chartData.length === 0) {
    return <NoData />;
  }

  return <ReactECharts option={option} style={{ height }} />;
};

const TrendChart: FC<{
  detail?: SupplierEnterpriseEmissionOverviewDetail;
  metric: 'amount' | 'intensity';
  unit?: string | null;
}> = ({ detail, metric, unit }) => {
  const trend = detail?.trend || [];

  const option = useMemo<EChartsOption>(() => {
    const years = trend.map(item => item.year);
    const totalName =
      metric === 'intensity'
        ? I18N.carbonFootprint.emissionIntensity
        : I18N.enterpriseCarbonAccount2.totalEmissions;
    return {
      color: ['#2FCCAA', '#08A28B', '#026961', '#5EAFFF'],
      grid: { left: 32, right: 32, top: 48, bottom: 24, containLabel: true },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const paramList = Array.isArray(params) ? params : [params];
          const title = paramList[0]?.axisValueLabel || '';
          const rows = paramList
            .map(
              item =>
                `${item.marker || ''}${
                  item.seriesName || '-'
                }：${formatEmission(item.value)}`,
            )
            .join('<br/>');

          return [title, rows].filter(Boolean).join('<br/>');
        },
      },
      legend: {
        top: 8,
        data: [
          I18N.enterpriseCarbonAccount2.scopeOne,
          I18N.enterpriseCarbonAccount2.scope2,
          I18N.enterpriseCarbonAccount2.fanWeisan,
          totalName,
        ],
      },
      xAxis: {
        type: 'category',
        axisTick: { show: false },
        axisLine: { show: false },
        data: years.map(year => `FY${`${year}`.slice(-2)}`),
      },
      yAxis: {
        type: 'value',
        name:
          metric === 'intensity'
            ? I18N.template(
                I18N.supplyChain2.enterpriseCarbonIntensityUnitWithUnit,
                {
                  val1: unit || I18N.supplyChain2.tenThousandYuan,
                },
              )
            : I18N.enterpriseCarbonAccount2.unitTCo,
        axisLabel: {
          formatter: value => formatEmission(value),
        },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#E8EDF2' } },
      },
      series: [
        {
          name: I18N.enterpriseCarbonAccount2.scopeOne,
          type: 'bar',
          stack: 'total',
          barMaxWidth: 18,
          data: trend.map(item => toNumber(item.scopeOne)),
        },
        {
          name: I18N.enterpriseCarbonAccount2.scope2,
          type: 'bar',
          stack: 'total',
          barMaxWidth: 18,
          data: trend.map(item => toNumber(item.scopeTwo)),
        },
        {
          name: I18N.enterpriseCarbonAccount2.fanWeisan,
          type: 'bar',
          stack: 'total',
          barMaxWidth: 18,
          data: trend.map(item => toNumber(item.scopeThree)),
        },
        {
          name: totalName,
          type: 'line',
          symbolSize: 6,
          data: trend.map(item => toNumber(item.total)),
        },
      ],
    };
  }, [metric, trend, unit]);

  if (trend.length === 0) {
    return <NoData />;
  }

  return <ReactECharts option={option} style={{ height: 320 }} />;
};

const IndustryBenchmark: FC<{
  data?: SupplierEnterpriseEmissionIndustry | null;
  orgName?: string | null;
  dataType: string;
  scopeType: string;
  onDataTypeChange: (value: string) => void;
  onScopeTypeChange: (value: string) => void;
}> = ({
  data,
  orgName,
  dataType,
  scopeType,
  onDataTypeChange,
  onScopeTypeChange,
}) => {
  const hidden = !data || data.isShowIndustryData === '0';
  const visible = !hidden && !!data;

  const option = useMemo<EChartsOption>(() => {
    const min = toNumber(data?.minIndustryData);
    const avg = toNumber(data?.avgIndustryData);
    const median = toNumber(data?.medianIndustryData);
    const max = toNumber(data?.maxIndustryData);
    return {
      color: '#0CBF9F',
      grid: {
        top: '5%',
        left: '3%',
        right: '10%',
        bottom: '3%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const item = Array.isArray(params) ? params[0] : params;
          return `${item?.marker || ''}${
            item?.name || '-'
          }<br/>${formatEmission(item?.value)}`;
        },
      },
      xAxis: {
        type: 'log',
        min: 1,
        logBase: 10,
        axisLabel: {
          formatter: value => {
            const numericValue = Number(value);
            if (!Number.isFinite(numericValue) || numericValue <= 0) {
              return '';
            }
            return Math.log10(numericValue) % 2 === 0
              ? formatEmission(numericValue)
              : '';
          },
        },
      },
      yAxis: {
        type: 'category',
        data: [
          I18N.enterpriseCarbonAccount2.minimum,
          I18N.enterpriseCarbonAccount2.average,
          I18N.enterpriseCarbonAccount2.median,
          I18N.enterpriseCarbonAccount2.highest,
        ],
      },
      series: [
        {
          type: 'bar',
          barWidth: 12,
          data: [min, avg, median, max],
        },
      ],
    };
  }, [data]);

  const level = data?.ratingCompany || 'A';

  if (hidden) {
    return null;
  }

  return (
    <Spin spinning={false}>
      <div className={benchmarkStyles.wrapper}>
        <div className={benchmarkStyles.header}>
          <div className={benchmarkStyles.title}>
            {I18N.enterpriseCarbonAccount2.latestIndustryNumbers}
          </div>
          <div className={benchmarkStyles.right}>
            <span className={benchmarkStyles.unit}>
              {dataType === BENCHMARK_DATA_TYPE.AMOUNT
                ? I18N.enterpriseCarbonAccount2.unitTCo
                : I18N.enterpriseCarbonAccount2.unitTCo6}
            </span>
            <CustomRadio
              value={dataType}
              onChange={onDataTypeChange}
              items={[
                {
                  label: I18N.enterpriseCarbonAccount2.totalEmissions,
                  value: BENCHMARK_DATA_TYPE.AMOUNT,
                },
                {
                  label: I18N.enterpriseCarbonAccount2.emissionIntensityCamp,
                  value: BENCHMARK_DATA_TYPE.INTENSITY,
                },
              ]}
            />
          </div>
        </div>
        {!visible ? (
          <div className={benchmarkStyles.emptyWrapper}>
            <NoData />
          </div>
        ) : (
          <div className={benchmarkStyles.content}>
            <div className={benchmarkStyles.left}>
              <div className={benchmarkStyles.header}>
                <div className={benchmarkStyles.headerLeft}>
                  <img src={benchmarkIcon} alt='' />
                  <div className={benchmarkStyles.companyName}>
                    {orgName || '-'}
                  </div>
                </div>
                <div className={benchmarkStyles.headerRight}>
                  <Checkbox
                    checked={
                      scopeType === BENCHMARK_SCOPE_TYPE.WITH_SCOPE_THREE
                    }
                    onChange={e =>
                      onScopeTypeChange(
                        e.target.checked
                          ? BENCHMARK_SCOPE_TYPE.WITH_SCOPE_THREE
                          : BENCHMARK_SCOPE_TYPE.WITHOUT_SCOPE_THREE,
                      )
                    }
                  >
                    {I18N.enterpriseCarbonAccount2.scopeThree}
                  </Checkbox>
                </div>
              </div>
              <ReactECharts option={option} style={{ height: 140 }} />
            </div>
            <div className={benchmarkStyles.right}>
              <div
                className={benchmarkStyles.tag}
                style={{
                  background:
                    LEVEL_BACKGROUND_MAP[level] || LEVEL_BACKGROUND_MAP.E,
                }}
              >
                <div className={benchmarkStyles.tit}>
                  {I18N.enterpriseCarbonAccount2.enterpriseRating}
                </div>
                <div
                  className={benchmarkStyles.level}
                  style={{
                    color: LEVEL_COLOR_MAP[level] || LEVEL_COLOR_MAP.E,
                  }}
                >
                  {level}
                </div>
                <div className={benchmarkStyles.des}>
                  <em>{LEVEL_DESCRIPTION_MAP[level] || '-'}</em>
                </div>
              </div>
              <div className={benchmarkStyles.cards}>
                <div className={benchmarkStyles.average}>
                  <div className={benchmarkStyles.title}>
                    {I18N.enterpriseCarbonAccount2.industryAverage}
                  </div>
                  <div className={benchmarkStyles.number}>
                    {formatEmission(data?.avgIndustryData)}
                  </div>
                  <div>
                    <span className={benchmarkStyles.title}>
                      {Number(data?.avgIndustryPercent) > 0
                        ? I18N.enterpriseCarbonAccount2
                            .higherThanIndustryAverage
                        : I18N.enterpriseCarbonAccount2
                            .belowIndustryAverage2}{' '}
                    </span>
                    <span
                      style={{
                        color:
                          Number(data?.avgIndustryPercent) > 0
                            ? '#ED5555'
                            : '#0CBF9F',
                      }}
                    >
                      {data?.avgIndustryPercent || 0}%
                    </span>
                  </div>
                </div>
                <div className={benchmarkStyles.median}>
                  <div className={benchmarkStyles.title}>
                    {I18N.enterpriseCarbonAccount2.industryMedian}
                  </div>
                  <div className={benchmarkStyles.number}>
                    {formatEmission(data?.medianIndustryData)}
                  </div>
                  <div>
                    <span className={benchmarkStyles.title}>
                      {Number(data?.medianIndustryPercent) > 0
                        ? I18N.enterpriseCarbonAccount2.higherThanInTheIndustry
                        : I18N.enterpriseCarbonAccount2
                            .belowIndustryAverage}{' '}
                    </span>
                    <span
                      style={{
                        color:
                          Number(data?.medianIndustryPercent) > 0
                            ? '#ED5555'
                            : '#0CBF9F',
                      }}
                    >
                      {data?.medianIndustryPercent || 0}%
                    </span>
                  </div>
                </div>
                <div className={benchmarkStyles.minMax}>
                  <div className={benchmarkStyles.minItem}>
                    <span className={benchmarkStyles.title}>
                      {I18N.enterpriseCarbonAccount2.theLowestInTheIndustry}
                    </span>
                    <span className={benchmarkStyles.number}>
                      {formatEmission(data?.minIndustryData)}
                    </span>
                  </div>
                  <div className={benchmarkStyles.maxItem}>
                    <span className={benchmarkStyles.title}>
                      {I18N.enterpriseCarbonAccount2.theHighestInTheIndustry}
                    </span>
                    <span className={benchmarkStyles.number}>
                      {formatEmission(data?.maxIndustryData)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Spin>
  );
};

const EnterpriseSankeyChart: FC<{
  sankey?: SupplierProductEmissionOverviewSankey | null;
}> = ({ sankey }) => {
  const links = useMemo(() => {
    const result: { source: string; target: string; value: number }[] = [];
    (sankey?.stageList || []).forEach(stage => {
      if (toNumber(stage.total) > 0) {
        result.push({
          source: 'tCO₂e',
          target: stage.name,
          value: toNumber(stage.total),
        });
      }
      (stage.emissionList || []).forEach(emission => {
        if (toNumber(emission.total) > 0) {
          result.push({
            source: stage.name,
            target: emission.name,
            value: toNumber(emission.total),
          });
        }
      });
    });
    return result;
  }, [sankey]);

  const option = useMemo<any>(
    () => ({
      color: COLORS,
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = Array.isArray(params.value)
            ? params.value[2]
            : params.value;
          return `${params.name}<br/>${formatEmission(value)}tCO₂e`;
        },
      },
      series: [
        {
          type: 'sankey',
          nodeGap: 10,
          nodeWidth: 12,
          draggable: true,
          emphasis: { focus: 'adjacency' },
          data: Array.from(
            new Set(
              links.flatMap(link => [link.source, link.target]).filter(Boolean),
            ),
          ).map(name => ({ name })),
          links,
          lineStyle: {
            color: 'gradient',
            curveness: 0.5,
          },
        },
      ],
    }),
    [links],
  );

  if (links.length === 0) {
    return <NoData />;
  }

  return <ReactECharts option={option} style={{ height: 320 }} />;
};

const CategoryDistribution: FC<{
  standard: number;
  byScopes: SupplierProductEmissionOverviewSummary[];
  byTypes: SupplierProductEmissionOverviewSummary[];
  showTopTypes?: boolean;
}> = ({ standard, byScopes, byTypes, showTopTypes }) => (
  <div className={reportStyles.cateChart}>
    <div className={reportStyles.cateChartContent}>
      <div className={reportStyles.title}>
        {I18N.enterpriseCarbonAccount2.emissionRange}
      </div>
      <div className={reportStyles.cateContent}>
        <div
          className={reportStyles.pieContent}
          style={{
            width: `calc(100% - ${standard === 1 ? '260' : '0'}px)`,
          }}
        >
          <SummaryChart data={byScopes} type='pie' height={300} />
        </div>
        {standard === 1 && (
          <div className={reportStyles.infoContent}>
            {byScopes.map((data, index) => (
              <div className={reportStyles.infoItem} key={data.name}>
                <div
                  className={reportStyles.infoItemLeft}
                  style={{ background: COLORS[index] }}
                >
                  {data.name}
                </div>
                <div className={reportStyles.infoItemRight}>
                  <div className={reportStyles.infoItemRightBody}>
                    <div>
                      <div className={reportStyles.infoTip}>
                        {I18N.enterpriseCarbonAccount2.emissionsTC}
                      </div>
                      <div className={reportStyles.infoTxt}>
                        {formatEmission(data.total)}
                      </div>
                    </div>
                    <div className={reportStyles.split} />
                    <div>
                      <div className={reportStyles.infoTip}>
                        {I18N.supplyChain2.proportion}
                      </div>
                      <div className={reportStyles.infoTxt}>
                        {formatEmission(data.rate)}%
                      </div>
                    </div>
                  </div>
                  <div className={reportStyles.infoItemRightBottom}>
                    {I18N.template(I18N.supplyChain2.proportionValue, {
                      val1: formatEmission(data.rate),
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    {showTopTypes && (
      <div className={reportStyles.cateChartContent}>
        <div className={reportStyles.title}>
          {I18N.enterpriseCarbonAccount2.topEmissions}
        </div>
        <div className={reportStyles.cateContent}>
          <SummaryChart data={byTypes.slice(0, 5)} type='bar' height={300} />
        </div>
      </div>
    )}
  </div>
);

const ColumnSummaryChart: FC<{
  title: string;
  data?: SupplierProductEmissionOverviewSummary[];
}> = ({ title, data }) => (
  <div className={reportStyles.columnChart}>
    <div className={reportStyles.columnChartHeader}>
      <div className={reportStyles['title-s-b']}>{title}</div>
    </div>
    <div className={reportStyles.columnChartContent}>
      <SummaryChart data={data} type='bar' height={300} />
    </div>
  </div>
);

const TrendAnalysis: FC<{
  detail?: SupplierEnterpriseEmissionOverviewDetail;
  trendMetric: 'amount' | 'intensity';
  yearNum: number;
  indicatorId?: string | number;
  selectedIndicatorUnit?: string | null;
  onTrendMetricChange: (value: 'amount' | 'intensity') => void;
  onYearNumChange: (value: number) => void;
  onIndicatorChange: (value: string | number) => void;
}> = ({
  detail,
  trendMetric,
  yearNum,
  indicatorId,
  selectedIndicatorUnit,
  onTrendMetricChange,
  onYearNumChange,
  onIndicatorChange,
}) => {
  const metricItems = detail?.visibility?.intensityTrend
    ? [
        {
          label: I18N.enterpriseCarbonAccount2.totalEmissions,
          value: 'amount',
        },
        { label: I18N.carbonFootprint.emissionIntensity, value: 'intensity' },
      ]
    : [
        {
          label: I18N.enterpriseCarbonAccount2.totalEmissions,
          value: 'amount',
        },
      ];

  return (
    <div className={reportStyles.columnChart}>
      <div className={reportStyles.columnChartHeader}>
        <div className={reportStyles['title-s-b']}>
          {I18N.enterpriseCarbonAccount2.trendAnalysis}
        </div>
        <div style={{ display: 'flex' }}>
          {trendMetric === 'intensity' && (
            <Select
              className={reportStyles.indicatorSelect}
              value={indicatorId}
              placeholder={I18N.supplyChain2.pleaseSelectIndicator}
              options={(detail?.indicatorList || []).map(item => ({
                value: item.foreignId,
                label: item.indicatorName || '-',
              }))}
              onChange={onIndicatorChange}
            />
          )}
          <Select
            className={reportStyles.yearNumSelect}
            value={yearNum}
            options={YEAR_NUM_OPTIONS}
            onChange={onYearNumChange}
          />
          <CustomRadio
            value={trendMetric}
            onChange={value =>
              onTrendMetricChange(value as 'amount' | 'intensity')
            }
            items={metricItems}
          />
        </div>
      </div>
      <div className={reportStyles.columnChartContent}>
        <TrendChart
          detail={detail}
          metric={trendMetric}
          unit={selectedIndicatorUnit}
        />
      </div>
    </div>
  );
};

const EnterpriseSankeyBlock: FC<{
  sankey?: SupplierProductEmissionOverviewSankey | null;
}> = ({ sankey }) => (
  <div className={reportStyles.sankeyChart}>
    <div className={reportStyles.title}>
      {I18N.enterpriseCarbonAccount2.corporateCarbonEmissions}
    </div>
    <div className={reportStyles.sankeyContent}>
      <EnterpriseSankeyChart sankey={sankey} />
    </div>
  </div>
);

const ManageDrawer: FC<ManageDrawerProps> = ({
  supplierId,
  open,
  selectedMap: selectedMapProp,
  onClose,
  onConfirm,
}) => {
  const [groups, setGroups] = useState<
    SupplierEnterpriseEmissionManageYearGroup[]
  >([]);

  const [activeYear, setActiveYear] = useState<string>();

  const [selectedMap, setSelectedMap] = useState<
    Record<string, number | undefined>
  >({});

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    let ignore = false;
    setLoading(true);

    getSupplierEnterpriseEmissionManageRecords({ supplierId })
      .then(({ data }) => {
        if (ignore) return;
        const nextGroups = data.data || [];
        const nextSelectedMap: Record<string, number | undefined> = {};
        nextGroups.forEach(group => {
          const selected =
            selectedMapProp[group.year] ||
            group.selectedSupplierDataId ||
            group.records?.[0]?.supplierDataId;
          if (selected) {
            nextSelectedMap[group.year] = selected;
          }
        });
        setGroups(nextGroups);
        setSelectedMap(nextSelectedMap);
        setActiveYear(nextGroups[0]?.year);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [open, supplierId, selectedMapProp]);

  const activeGroup = groups.find(group => group.year === activeYear);

  const columns = [
    {
      title: I18N.supplyChain.fillInTheName,
      dataIndex: 'fillName',
      ellipsis: true,
      width: 130,
      render: (text: string) => (
        <Tooltip title={text} placement='topLeft'>
          <span>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: I18N.supplyChain.typeOfFilling,
      dataIndex: 'fillTypeDesc',
      width: 110,
    },
    {
      title: I18N.supplyChain.initiateTheFillingProcess,
      dataIndex: 'fillSource',
      width: 130,
    },
    {
      title: I18N.supplyChain2.updateTime,
      dataIndex: 'updateTime',
      width: 178,
    },
    {
      title: I18N.supplyChain2.updatedBy,
      dataIndex: 'updateBy',
      width: 118,
    },
    {
      title: I18N.supplyChain2.operation,
      width: 80,
      render: (_: unknown, record: SupplierEnterpriseEmissionManageRecord) => (
        <Button
          type='link'
          className={styles.tableAction}
          onClick={() => {
            window.open(
              RouteMapsSupplyChain2.supplyChainCarbonDataFillInfo.replace(
                ':id',
                `${record.supplierDataId}`,
              ),
              '_blank',
              'noopener,noreferrer',
            );
          }}
        >
          {I18N.carbonFootprint3.view}
        </Button>
      ),
    },
  ];

  const confirm = () => {
    onConfirm(selectedMap);
    onClose();
  };

  return (
    <CustomDrawer
      open={open}
      width={860}
      title={I18N.supplyChain2.enterpriseCarbonDataManage}
      onClose={onClose}
      destroyOnClose
      className={styles.manageDrawer}
      footerStyle={{ padding: 0 }}
      footer={
        <div className={styles.drawerFooter}>
          <Button onClick={onClose}>{I18N.carbonFootprint.cancel}</Button>
          <Button type='primary' onClick={confirm}>
            {I18N.carbonFootprint.confirm}
          </Button>
        </div>
      }
    >
      <div className={styles.drawerBody}>
        <div className={styles.drawerDesc}>
          {I18N.supplyChain2.enterpriseCarbonDataManageDescription}
        </div>
        <Spin spinning={loading}>
          {groups.length === 0 ? (
            <AntEmpty />
          ) : (
            <>
              <Tabs
                className={styles.manageTabs}
                activeKey={activeYear}
                items={groups.map(group => ({
                  key: group.year,
                  label: I18N.template(I18N.enterpriseCarbonAccount2.year, {
                    val1: group.year,
                  }),
                }))}
                onChange={setActiveYear}
              />
              <Table
                className={styles.manageTable}
                rowKey='supplierDataId'
                columns={columns}
                dataSource={activeGroup?.records || []}
                pagination={false}
                tableLayout='fixed'
                rowSelection={{
                  type: 'radio',
                  columnWidth: 44,
                  selectedRowKeys:
                    activeYear && selectedMap[activeYear]
                      ? [selectedMap[activeYear] as number]
                      : [],
                  onChange: keys => {
                    if (activeYear) {
                      setSelectedMap(prev => ({
                        ...prev,
                        [activeYear]: Number(keys[0]),
                      }));
                    }
                  },
                }}
              />
            </>
          )}
        </Spin>
      </div>
    </CustomDrawer>
  );
};

const SupplierEnterpriseCarbonOverview: FC<
  SupplierEnterpriseCarbonOverviewProps
> = ({ supplierId }) => {
  const [yearOptions, setYearOptions] = useState<
    SupplierEnterpriseEmissionYearOption[]
  >([]);

  const [year, setYear] = useState<string>();

  const [standard, setStandard] = useState<number>(1);

  const [yearNum, setYearNum] = useState(5);

  const [trendMetric, setTrendMetric] = useState<'amount' | 'intensity'>(
    'amount',
  );

  const [benchmarkDataType, setBenchmarkDataType] = useState(
    BENCHMARK_DATA_TYPE.AMOUNT,
  );

  const [benchmarkScopeType, setBenchmarkScopeType] = useState(
    BENCHMARK_SCOPE_TYPE.WITHOUT_SCOPE_THREE,
  );

  const [indicatorId, setIndicatorId] = useState<string | number>();

  const [detail, setDetail] =
    useState<SupplierEnterpriseEmissionOverviewDetail>();

  const [optionsLoading, setOptionsLoading] = useState(false);

  const [detailLoading, setDetailLoading] = useState(false);

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [selectedSupplierDataMap, setSelectedSupplierDataMap] = useState<
    Record<string, number | undefined>
  >({});

  const [manageRefreshKey, setManageRefreshKey] = useState(0);

  const selectedYearOption = useMemo(
    () => yearOptions.find(item => item.year === year),
    [yearOptions, year],
  );

  const selectedSupplierDataIdFromMap = year
    ? selectedSupplierDataMap[year]
    : undefined;

  const selectedSupplierDataId =
    selectedSupplierDataIdFromMap ??
    selectedYearOption?.supplierDataId ??
    undefined;

  const selectedSupplierDataIdsParam = useMemo(() => {
    const selectedMap = Object.entries(selectedSupplierDataMap).reduce<
      Record<string, number>
    >((acc, [selectedYear, selectedId]) => {
      if (selectedId) {
        acc[selectedYear] = selectedId;
      }
      return acc;
    }, {});

    return Object.keys(selectedMap).length
      ? JSON.stringify(selectedMap)
      : undefined;
  }, [selectedSupplierDataMap]);

  const useYearOptionSelection =
    !selectedSupplierDataIdFromMap ||
    selectedSupplierDataIdFromMap === selectedYearOption?.supplierDataId;

  const standardLocked =
    detail?.standardLocked ??
    (useYearOptionSelection ? selectedYearOption?.standardLocked : false);

  const manual =
    detail?.manual ??
    (useYearOptionSelection ? selectedYearOption?.manual : false);

  const byScopes = detail?.byScopes || [];

  const byTypes = detail?.byTypes || [];

  const selectedIndicator = useMemo(
    () =>
      (detail?.indicatorList || []).find(
        item => `${item.foreignId}` === `${indicatorId}`,
      ) || detail?.indicatorList?.[0],
    [detail?.indicatorList, indicatorId],
  );

  useEffect(() => {
    let ignore = false;
    setOptionsLoading(true);
    getSupplierEnterpriseEmissionOverviewOptions({ supplierId })
      .then(({ data }) => {
        if (ignore) return;
        const options = data.data.years || [];
        setYearOptions(options);
        const nextSelectedMap: Record<string, number | undefined> = {};
        options.forEach(option => {
          if (option.supplierDataId) {
            nextSelectedMap[option.year] = option.supplierDataId;
          }
        });
        setSelectedSupplierDataMap(nextSelectedMap);
        const nextYear =
          options.find(option => option.year === year)?.year ||
          data.data.defaultYear ||
          options[0]?.year;
        setYear(nextYear);
        const nextOption = options.find(option => option.year === nextYear);
        setStandard(
          nextOption?.standardLocked ? 1 : data.data.defaultStandard || 1,
        );
      })
      .finally(() => {
        if (!ignore) {
          setOptionsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [supplierId]);

  useEffect(() => {
    if (!year) {
      setDetail(undefined);
      return;
    }
    if (standardLocked && standard !== 1) {
      setStandard(1);
      return;
    }

    let ignore = false;
    setDetailLoading(true);

    getSupplierEnterpriseEmissionOverviewDetail({
      supplierId,
      year,
      standard,
      yearNum,
      scopeType: 0,
      supplierDataId: selectedSupplierDataId,
      selectedSupplierDataIds: selectedSupplierDataIdsParam,
      trendMetric,
      benchmarkDataType,
      benchmarkScopeType,
      indicatorId,
    })
      .then(({ data }) => {
        if (ignore) return;
        setDetail(data.data);
        const responseYear = data.data?.year || year;
        const responseSupplierDataId = data.data?.account?.supplierDataId;
        if (responseYear && responseSupplierDataId) {
          setSelectedSupplierDataMap(prev =>
            prev[responseYear]
              ? prev
              : {
                  ...prev,
                  [responseYear]: responseSupplierDataId,
                },
          );
        }
        if (data.data?.standardLocked && standard !== 1) {
          setStandard(1);
        }
      })
      .finally(() => {
        if (!ignore) {
          setDetailLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [
    supplierId,
    year,
    standard,
    yearNum,
    standardLocked,
    selectedSupplierDataId,
    selectedSupplierDataIdsParam,
    manageRefreshKey,
    trendMetric,
    benchmarkDataType,
    benchmarkScopeType,
    indicatorId,
  ]);

  useEffect(() => {
    if (manual && trendMetric === 'intensity') {
      setTrendMetric('amount');
    }
  }, [manual, trendMetric]);

  useEffect(() => {
    if (manual) {
      setIndicatorId(undefined);
      return;
    }
    const firstIndicatorId = detail?.indicatorList?.[0]?.foreignId;
    if (!indicatorId && firstIndicatorId) {
      setIndicatorId(firstIndicatorId);
    }
  }, [detail?.indicatorList, indicatorId, manual]);

  const changeYear = (nextYear: string) => {
    const nextOption = yearOptions.find(option => option.year === nextYear);
    setYear(nextYear);
    setIndicatorId(undefined);
    if (nextOption?.standardLocked) {
      setStandard(1);
    }
  };

  const confirmManageSelection = (
    selectedMap: Record<string, number | undefined>,
  ) => {
    setSelectedSupplierDataMap({ ...selectedMap });
    setIndicatorId(undefined);
    setManageRefreshKey(prev => prev + 1);
  };

  return (
    <section className={styles.enterpriseReportContent}>
      <div
        className={classNames(
          reportStyles.reportSection,
          styles.enterpriseReportHeader,
        )}
      >
        <div className={reportStyles.orgSelectLabel}>
          <div
            className={classNames(
              reportStyles.orgIcon,
              reportStyles.companyOrgIcon,
            )}
          >
            <IconAlibaba
              className={reportStyles.companyOrgImg}
              type='icon-a-icon-qiyebeijing'
            />
          </div>
          <div className={reportStyles.rootOrgLabel}>
            {detail?.account?.fillName || '-'}
          </div>
        </div>
        <div className={styles.reportActions}>
          <Select
            className={reportStyles.yearSelect}
            value={year}
            loading={optionsLoading}
            placeholder={I18N.carbonFootprint.year}
            options={yearOptions.map(option => ({
              value: option.year,
              label: I18N.template(I18N.enterpriseCarbonAccount2.year, {
                val1: option.year,
              }),
            }))}
            onChange={changeYear}
          />
          <Select
            className={reportStyles.classifySelect}
            value={standard}
            disabled={standardLocked}
            options={STANDARD_OPTIONS}
            onChange={value => {
              setStandard(value);
              setIndicatorId(undefined);
            }}
          />
          <Button type='primary' onClick={() => setDrawerOpen(true)}>
            {I18N.supplyChain2.enterpriseCarbonDataManage}
          </Button>
        </div>
      </div>
      {yearOptions.length === 0 && !optionsLoading ? (
        <div className={styles.emptyWrapper}>
          <NoData />
        </div>
      ) : (
        <Spin spinning={optionsLoading || detailLoading}>
          <div
            className={classNames(
              reportStyles.chartContent,
              styles.enterpriseChartContent,
            )}
          >
            <MetricOverview detail={detail} />
            {detail?.visibility?.aiAdvice &&
              detail?.year &&
              detail?.account?.supplierDataId && (
                <AIReductionAdvice
                  year={Number(detail.year)}
                  orgId={detail.account.supplierDataId}
                  autoGenerate={false}
                  readonly
                  getAiEmissionInfoService={() =>
                    getSupplierEnterpriseEmissionOverviewAiAdvice({
                      supplierId,
                      supplierDataId: detail.account!.supplierDataId,
                    })
                  }
                />
              )}
            <IndustryBenchmark
              data={detail?.industry}
              orgName={detail?.account?.fillName}
              dataType={benchmarkDataType}
              scopeType={benchmarkScopeType}
              onDataTypeChange={setBenchmarkDataType}
              onScopeTypeChange={setBenchmarkScopeType}
            />
            <TrendAnalysis
              detail={detail}
              trendMetric={trendMetric}
              yearNum={yearNum}
              indicatorId={indicatorId}
              selectedIndicatorUnit={selectedIndicator?.unitValue}
              onTrendMetricChange={setTrendMetric}
              onYearNumChange={setYearNum}
              onIndicatorChange={setIndicatorId}
            />
            <CategoryDistribution
              standard={standard}
              byScopes={byScopes}
              byTypes={byTypes}
              showTopTypes={detail?.visibility?.topTypes}
            />
            {detail?.visibility?.topEmissions && (
              <ColumnSummaryChart
                title={I18N.enterpriseCarbonAccount2.topEmissions2}
                data={detail.topEmissions}
              />
            )}
            {detail?.visibility?.childOrg && (
              <ColumnSummaryChart
                title={I18N.enterpriseCarbonAccount2.subOrganizationEmissions}
                data={detail.childOrgs}
              />
            )}
            {detail?.visibility?.sankey && (
              <EnterpriseSankeyBlock sankey={detail.sankey} />
            )}
          </div>
        </Spin>
      )}
      <ManageDrawer
        supplierId={supplierId}
        open={drawerOpen}
        selectedMap={selectedSupplierDataMap}
        onClose={() => setDrawerOpen(false)}
        onConfirm={confirmManageSelection}
      />
    </section>
  );
};

export default SupplierEnterpriseCarbonOverview;
