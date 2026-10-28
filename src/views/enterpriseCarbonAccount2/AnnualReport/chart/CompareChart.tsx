/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import I18N from '@src/lang/I18N';
import { Select } from 'antd';
import * as echarts from 'echarts';
import { isNil } from 'lodash-es';
import React, { memo, useEffect, useState, useRef } from 'react';

import Empty from './Empty';
import { Org } from '../../AccountingList/type';
import { ORG_TYPE } from '../../constant';
import styles from '../index.module.less';
import {
  getDataIntensityComparison,
  getDataQuantityComparison,
  getIndicatorList,
} from '../service';
import { QuantityData } from '../type';

type CompareChartProps = {
  type: number;
  yearNum: number;
  chartType: 'amount' | 'intensity';
  org?: Org;
};

const CompareChart: React.FC<CompareChartProps> = ({
  type,
  yearNum,
  chartType,
  org,
}) => {
  const [indicatorList, setIndicatorList] = useState<
    { indicatorName: string; unitValue: string }[]
  >([]);

  const [indicatorName, setIndicatorName] = useState<string>();

  const indicatorNameRef = useRef<string>();

  const [quantityData, setQuantityData] = useState<QuantityData[]>([]);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartType === 'intensity') {
      setIndicatorName(undefined);
      indicatorNameRef.current = undefined;

      getIndicatorList({ yearNum }).then(({ data }) => {
        setIndicatorList(data.data);
        setIndicatorName(data.data[0]?.indicatorName);
      });
    }
  }, [yearNum, chartType]);

  useEffect(() => {
    indicatorNameRef.current = indicatorName;
  }, [indicatorName]);

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
    } else if (chartType === 'intensity' && !isNil(indicatorNameRef.current)) {
      if (org.orgType === ORG_TYPE.ENTERPRISE) {
        getDataIntensityComparison({
          type,
          yearNum,
          orgId,
          indicatorName: indicatorNameRef.current,
        }).then(({ data }) => {
          setQuantityData(data.data.reverse());
        });
      } else {
        setQuantityData([]);
      }
    }
  }, [type, org, yearNum, chartType, indicatorName]);

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
      '#5871C7',
      '#98CC72',
      '#F5C753',
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
                chartType === 'intensity' && indicatorName
                  ? `/${
                      indicatorList.find(
                        indicator => indicator.indicatorName === indicatorName,
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
            chartType === 'intensity' && indicatorName
              ? `/${
                  indicatorList.find(
                    indicator => indicator.indicatorName === indicatorName,
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
          barMaxWidth: 52,
          color: colors[index],
          data: categorySeries[category],
        })),
        {
          name: I18N.enterpriseCarbonAccount2.baseYear,
          type: 'line',
          symbol: 'none',
          lineStyle: {
            type: 'dotted',
          },
          color: '#f00',
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
  }, [quantityData, indicatorName, indicatorList, chartType]);

  return (
    <div className={styles.columnChart}>
      <div className={styles.columnChartHeader}>
        <div className={styles['title-s-b']}>
          {chartType === 'amount'
            ? I18N.enterpriseCarbonAccount2.emissionsAndBase
            : I18N.enterpriseCarbonAccount2.emissionIntensityAnd}
        </div>
        {chartType === 'intensity' && org?.orgType === ORG_TYPE.ENTERPRISE && (
          <div>
            <span>{I18N.enterpriseCarbonAccount2.accordingTo}</span>
            <Select
              className={styles.indicatorSelect}
              value={indicatorName}
              options={indicatorList.map(indicator => ({
                value: indicator.indicatorName,
                label: indicator.indicatorName,
              }))}
              onChange={setIndicatorName}
            />
          </div>
        )}
      </div>
      <div className={styles.columnChartContent}>
        {chartType === 'intensity' && org?.orgType !== ORG_TYPE.ENTERPRISE && (
          <Empty
            className={styles.floatEmpty}
            text={I18N.enterpriseCarbonAccount2.subOrganizationsTemporarily}
          />
        )}
        <div ref={chartContainerRef} className={styles.columnChartContent} />
      </div>
    </div>
  );
};

export default memo(CompareChart);
