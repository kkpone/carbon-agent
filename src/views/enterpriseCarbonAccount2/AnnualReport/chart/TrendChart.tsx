/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import I18N from '@src/lang/I18N';
import { Select } from 'antd';
import * as echarts from 'echarts';
import { isNil } from 'lodash-es';
import { memo, useEffect, useState, useRef, FC } from 'react';

import { Org } from '../../AccountingList/type';
import { CustomRadio } from '../components/Radio';
import styles from '../index.module.less';
import {
  getDataIntensityComparison,
  getDataQuantityComparison,
  getIndicatorList,
} from '../service';
import { QuantityData } from '../type';

type TrendChartProps = {
  type: number;
  standardYearRefresh: boolean;
  org?: Org;
};

const TrendChart: FC<TrendChartProps> = ({
  org,
  type,
  standardYearRefresh,
}) => {
  const [yearNum, setYearNum] = useState(5);

  const [chartType, setChartType] = useState<'amount' | 'intensity'>('amount');

  const [indicatorList, setIndicatorList] = useState<
    { indicatorName: string; unitValue: string; indicatorId: number }[]
  >([]);

  const [indicatorId, setIndicatorId] = useState<number>();

  const indicatorIdRef = useRef<number>();

  const [quantityData, setQuantityData] = useState<QuantityData[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartType === 'intensity') {
      setIndicatorId(undefined);
      indicatorIdRef.current = undefined;

      getIndicatorList({ yearNum }).then(({ data }) => {
        setIndicatorList(data.data);
        setIndicatorId(data.data[0]?.indicatorId);
      });
    }
  }, [yearNum, chartType]);

  useEffect(() => {
    indicatorIdRef.current = indicatorId;
  }, [indicatorId]);

  useEffect(() => {
    if (isNil(org)) {
      return;
    }

    const { id: orgId } = org;

    if (chartType === 'amount') {
      getDataQuantityComparison({
        type,
        yearNum,
        orgId,
      }).then(({ data }) => {
        setQuantityData(data.data.reverse());
      });
    } else if (chartType === 'intensity' && !isNil(indicatorIdRef.current)) {
      getDataIntensityComparison({
        type,
        yearNum,
        orgId,
        indicatorId: indicatorIdRef.current,
      }).then(({ data }) => {
        setQuantityData(data.data.reverse());
      });
    }
  }, [type, org, yearNum, chartType, indicatorId, standardYearRefresh]);

  useEffect(() => {
    const chartDom = chartContainerRef.current;

    if (chartDom === null) {
      return () => {};
    }

    chartRef.current = echarts.init(chartDom, undefined, {
      width: 'auto',
      height: 'auto',
    });
    const observer = new ResizeObserver(() => {
      chartRef.current?.resize();
    });
    observer.observe(chartDom);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const colors = [
      '#2FCCAA',
      '#08A28B',
      '#026961',
      '#E56665',
      '#7EC0DF',
      '#4EA271',
    ];

    const categorySeries: Record<string, number[]>[] = [];

    (quantityData || []).forEach(({ categoryData }) => {
      (categoryData || []).forEach(
        ({ category, emissionQuantity, emissionIntensity }) => {
          categorySeries[category] = [
            ...(categorySeries[category] || []),
            chartType === 'amount'
              ? Number(emissionQuantity)
              : Number(emissionIntensity),
          ];
        },
      );
    });

    const typeText =
      chartType === 'amount'
        ? I18N.enterpriseCarbonAccount2.annualEmissions2
        : I18N.enterpriseCarbonAccount2.annualEmissionIntensity;
    const compareText = I18N.enterpriseCarbonAccount2.comparedToTheBaseYear2;
    const unit = I18N.enterpriseCarbonAccount2.unitTCo3;

    const option: echarts.EChartsOption = {
      grid: {
        containLabel: true,
        left: '40px',
        right: '20px',
        bottom: '20px',
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter: params => {
          let relVal = `<div style="color: #343A40;">${params[0].name}${typeText}
           ${compareText}</div>`;
          for (let i = 0, l = params.length; i < l; i += 1) {
            relVal += `<div style="display: flex; align-items: center; margin-top: 4px">
              ${params[i].marker}
              <span style="color: #6C757D; font-size: 12px; min-width: 36px;">${
                params[i].seriesName
              }</span>
              <span style="color: #343A40; font-weight: 500; font-size: 12px; margin: 0 4px 0 16px">${
                params[i].value
              }</span>
              <span style="color: #999EA4, font-size: 12px">tCO₂e${
                chartType === 'intensity' && indicatorId
                  ? `/${
                      indicatorList.find(
                        indicator => indicator.indicatorId === indicatorId,
                      )?.unitValue ?? ''
                    }`
                  : ''
              }</span>
            </div>`;
          }
          return relVal;
        },
      },
      legend: {
        data: [
          ...Object.keys(categorySeries).map(category => ({ name: category })),
          {
            name: I18N.enterpriseCarbonAccount2.baseYear,
            itemStyle: { opacity: 0 },
          },
        ],
        type: 'scroll',
      },
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          axisLine: { show: false },
          data: quantityData.map(data => data.year),
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: `${unit}${
            chartType === 'intensity' && indicatorId
              ? `/${
                  indicatorList.find(
                    indicator => indicator.indicatorId === indicatorId,
                  )?.unitValue ?? ''
                }`
              : ''
          }）`,
          position: 'left',
        },
      ],
      series: [
        ...Object.keys(categorySeries).map((category, index) => ({
          name: category,
          type: 'bar' as const,
          stack: 'total',
          barMaxWidth: 16,
          color: colors[index],
          data: categorySeries[category],
        })),
        {
          name: I18N.enterpriseCarbonAccount2.baseYear,
          type: 'line',
          lineStyle: {
            type: 'dotted',
          },
          color: '#5EAFFF',
          data: quantityData.map(
            data =>
              data[
                chartType === 'amount'
                  ? 'baseYear_totalYearQuantity'
                  : 'baseYear_totalYearQuantity_intensity'
              ],
          ),
        },
      ],
    };

    chartRef.current?.setOption(option, { notMerge: true });
  }, [quantityData, indicatorId, indicatorList, chartType]);

  return (
    <div className={styles.columnChart}>
      <div className={styles.columnChartHeader}>
        <div className={styles['title-s-b']}>
          {I18N.enterpriseCarbonAccount2.trendAnalysis}
        </div>
        <div style={{ display: 'flex' }}>
          {chartType === 'intensity' && (
            <Select
              className={styles.indicatorSelect}
              value={indicatorId}
              options={indicatorList.map(indicator => ({
                value: indicator.indicatorId,
                label: indicator.indicatorName,
              }))}
              onChange={setIndicatorId}
            />
          )}
          <Select
            className={styles.yearNumSelect}
            value={yearNum}
            placeholder={I18N.enterpriseCarbonAccount2.time}
            options={[
              { value: 5, label: I18N.enterpriseCarbonAccount2.recentYears2 },
              {
                value: 10,
                label: I18N.enterpriseCarbonAccount2.recentYears3,
              },
              {
                value: 15,
                label: I18N.enterpriseCarbonAccount2.recentYears4,
              },
            ]}
            onChange={setYearNum}
          />
          <CustomRadio
            value={chartType}
            onChange={newChartType =>
              setChartType(newChartType as 'amount' | 'intensity')
            }
            items={[
              {
                label: I18N.enterpriseCarbonAccount2.totalEmissions,
                value: 'amount',
              },
              {
                label: I18N.carbonFootprint.emissionIntensity,
                value: 'intensity',
              },
            ]}
          />
        </div>
      </div>
      <div className={styles.columnChartContent}>
        {/* {chartType === 'intensity' && org?.orgType !== ORG_TYPE.ENTERPRISE && (
          <Empty
            className={styles.floatEmpty}
            text={I18N.enterpriseCarbonAccount2.subOrganizationsTemporarily}
          />
        )} */}
        <div ref={chartContainerRef} className={styles.columnChartContent} />
      </div>
    </div>
  );
};

export default memo(TrendChart);
