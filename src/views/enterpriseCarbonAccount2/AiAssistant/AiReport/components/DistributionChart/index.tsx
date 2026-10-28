import * as Echarts from 'echarts';
import { FC, useEffect, useRef } from 'react';

import styles from './index.module.less';
import { Score } from '../../type';

const DistributionChart: FC<
  Pick<Score, 'yearPercents'> & { year?: string }
> = ({ yearPercents, year }) => {
  const chartRef = useRef<Echarts.ECharts | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current) {
      const chart = Echarts.init(chartContainerRef.current);
      chartRef.current = chart;

      const observer = new ResizeObserver(() => {
        chartRef.current?.resize();
      });
      observer.observe(chartContainerRef.current);

      return () => observer.disconnect();
    }

    return () => {};
  }, []);

  useEffect(() => {
    const chart = chartRef.current;

    if (chart) {
      chart.setOption({
        grid: {
          left: 15,
          right: 15,
          top: 5,
          bottom: 20,
        },
        tooltip: {
          trigger: 'axis',
          appendToBody: true,
          className: styles.cdpTooltip,
          formatter: `<div class="${styles.cdpTooltipContent}">{c0}%</div>`,
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#999EA4',
            fontSize: 11,
          },
          data: yearPercents.map(yearItem => yearItem.year),
        },
        yAxis: {
          type: 'value',
          show: false,
        },
        series: [
          {
            data: yearPercents.map(({ percents }) => Number(percents)),
            type: 'line',
            symbol: 'none',
            lineStyle: {
              color: '#0CBF9F',
            },
            markLine: {
              silent: true,
              symbol: ['none', 'none'],
              label: { show: false },
              lineStyle: {
                color: '#999EA4',
              },
              data: yearPercents
                .map((yearItem, index) => ({
                  year: yearItem.year,
                  xAxis: index,
                }))
                .filter(yearItem => `${yearItem.year}` === `${year}`),
            },
            areaStyle: {
              color: new Echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgba(12, 191, 159, 0.12)',
                },
                {
                  offset: 1,
                  color: 'rgba(12, 191, 159, 0.00)',
                },
              ]),
            },
          },
        ],
      });
    }
  }, [yearPercents, year]);

  return <div className={styles.chartContainer} ref={chartContainerRef} />;
};

export default DistributionChart;
