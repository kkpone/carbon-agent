/*
 * @@description: 柱状图
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-23 20:09:03
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 16:41:03
 */
import { Column, ColumnConfig } from '@ant-design/charts';
import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import I18N from '@src/lang/I18N';
import { memo } from 'react';

import { BAR_COLORS } from '@/views/carbonFootprint3/FootprintAccount/constant';

import style from './index.module.less';
import { ColumnChartProps } from './types';
import { EmissionTotalComparisonChartData } from '../../TotalView/type';

export const ColumnChart = memo(
  ({
    height,
    className,
    chartData,
    label,
    xAxis,
    yAxis,
    emissionTotalChartData,
    top10,
    showTransport = true,
    ...props
  }: ColumnChartProps & {
    top10?: boolean;
    emissionTotalChartData?: EmissionTotalComparisonChartData;
    showTransport?: boolean;
  }) => {
    /** 是否有数据 */
    const isHaveData =
      !!(emissionTotalChartData && emissionTotalChartData.byTypes.length > 0) ||
      chartData;
    // const colorMap = useRef<Record<string, string>>({});

    let data = chartData || emissionTotalChartData?.byTypes;

    // 是否只展示前十个
    if (top10) {
      data = data?.filter((d, dIndex) => dIndex < 10);
    }

    const nextData: any[] = [];
    data?.forEach(rr => {
      if (!showTransport) {
        nextData.push({
          ...rr,
          total: Number(rr.total),
          // type: '',
          all: Number(rr.total),
        });
        return;
      }
      if (rr.totalTrans) {
        nextData.push({
          ...rr,
          total: Number(rr.total) - Number(rr.totalTrans),
          type: I18N.carbonFootprint3.excludingTransportation,
          color: '#FA8202',
          all: Number(rr.total),
        });
        nextData.push({
          ...rr,
          total: Number(rr.totalTrans),
          type: I18N.carbonFootprint.transport,
          color: '#ED5555',
          all: Number(rr.total),
        });
      } else {
        nextData.push({
          ...rr,
          total: Number(rr.total),
          type: I18N.carbonFootprint3.excludingTransportation,
          all: Number(rr.total),
        });
      }
    });

    const config = {
      data: nextData,
      appendPadding: [24],
      xField: 'name',
      yField: 'total',
      isStack: showTransport,
      seriesField: showTransport ? 'type' : undefined,
      autoFit: true,
      height: height || 160,
      maxColumnWidth: 16,
      legend: {
        position: 'right',
        offsetX: 10,
      },
      columnStyle: {
        // fill: props.color || '#698CFF',
        cursor: 'pointer',
      },
      xAxis: {
        label: {
          autoHide: true,
          autoRotate: false,
          autoEllipsis: true,
        },
        ...xAxis,
      },
      yAxis: {
        label: {
          // autoEllipsis: true,
        },
        grid: {
          line: {
            style: {
              lineDash: [4, 5],
              stroke: '#EBEDF0',
            },
          },
        },
        ...yAxis,
      },
      meta: {
        type: {
          alias: I18N.carbonFootprint3.category,
        },
        sales: {
          alias: I18N.carbonFootprint3.salesRevenue,
        },
      },
      tooltip: {
        // eslint-disable-next-line react/no-unstable-nested-components
        customContent: (_, nodeList) => {
          const node = nodeList[0];
          const transNode = nodeList[1];
          if (!node) {
            return '';
          }
          return (
            <div className={style.chartTooltip}>
              <div>
                <div className={style.chartTooltipText}>
                  {node.data.name} {I18N.carbonFootprint3.emissionsVolume}
                  {node?.data?.all}
                  kgCO₂e
                </div>
              </div>
              {transNode && (
                <div>
                  <div className={style.chartTooltipText}>
                    {node.data.name}：{node?.data?.total.toFixed(2)}kgCO₂e
                  </div>
                </div>
              )}
              <div>
                {transNode && (
                  <div className={style.chartTooltipText}>
                    {transNode.data.name} {transNode.data.type}：
                    {transNode?.data?.total}kgCO₂e
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      ...props,
      color: showTransport ? [BAR_COLORS[3], BAR_COLORS[4]] : BAR_COLORS[3],
    } as ColumnConfig;

    return isHaveData ? (
      <Column {...config} className={className} />
    ) : (
      <div className={style.ColumnChart}>
        <div className={style.noData}>
          <img
            src={noData}
            alt={I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
          />
          <div className={style.noDataText}>
            {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
          </div>
        </div>
      </div>
    );
  },
);
