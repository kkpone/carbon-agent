/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 11:30:00
 * @Date: 2023-06-14 11:56:02
 * @@description:
 */
// import { TextColorSecondary } from '@src/styles/color';
import I18N from '@src/lang/I18N';
import * as echarts from 'echarts';
import { EChartsCoreOption } from 'echarts';
import { memo, useEffect, useRef } from 'react';

import style from './index.module.less';
import { EmissionTotalRankingChartData } from '../../TotalView/type';

type Props = {
  height?: number;
  top10?: boolean;
  chartData?: EmissionTotalRankingChartData[];
};

export const ColumnEChart = memo(({ height, top10, chartData }: Props) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts>();
  const initHeight = height || 200;

  const dataName: string[] = [];
  const dataValue: string[] = [];
  chartData?.forEach((data, dataIndex) => {
    // 只展示前十条
    if (top10 && dataIndex < 10) {
      dataName.push(data.name);
      dataValue.push(data.total);
    } else {
      dataName.push(data.name);
      dataValue.push(data.total);
    }
  });

  const option: EChartsCoreOption = {
    dataZoom: {
      type: 'inside',
      startValue: 0,
      endValue: 10,
      zoomLock: true,
    },
    grid: {
      left: 80,
      right: 20,
      top: 20,
      bottom: 20,
    },
    tooltip: {
      formatter: (params: { name: string; dataIndex: number; value: string }) =>
        I18N.template(I18N.carbonFootprint3.divdi, {
          val1: params.name,
          val2: params.value,
        }),
    },
    xAxis: {
      type: 'category',
      textStyle: {
        color: '#999EA4',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: '#999EA4',
        },
      },
      axisLabel: {
        interval: 0,
        formatter: labelName => {
          const text = String(labelName);
          return text.length > 5 ? `${text.slice(0, 5)}...` : text;
        },
      },
      data: dataName,
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          type: 'dashed',
        },
        show: true,
      },
    },
    series: [
      {
        data: dataValue,
        type: 'bar',
        itemStyle: {
          color: '#08A28B',
        },
        barWidth: 16,
      },
    ],
  };

  useEffect(() => {
    echartsInstance.current = echarts.init(chartRef.current as HTMLDivElement);
  }, []);

  useEffect(() => {
    if (chartData) {
      echartsInstance.current?.setOption(option);
      window.onresize = () => {
        echartsInstance.current?.resize();
      };
    }
  }, [chartData]);

  return (
    <div
      style={{ height: initHeight }}
      className={style.columnEChart}
      ref={chartRef}
    />
  );
});
