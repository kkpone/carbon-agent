/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-23 18:03:42
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-15 15:53:36
 */
import noData from '@src/assets/svg/icon-zanmoneiyong.svg';
import I18N from '@src/lang/I18N';
import EChartsReact from 'echarts-for-react';
import { memo } from 'react';

import { BAR_COLORS } from '@/views/carbonFootprint3/FootprintAccount/constant';

import style from './index.module.less';
import { EmissionTotalComparisonChartData } from '../../TotalView/type';

type Props = {
  emissionTotalChartData?: EmissionTotalComparisonChartData;
};

export const PieChart = memo(({ emissionTotalChartData }: Props) => {
  /** 是否有数据 */
  const isHaveData = !!(
    emissionTotalChartData && emissionTotalChartData.byTypes.length > 0
  );
  const total = emissionTotalChartData?.emissionTotal;
  const data = emissionTotalChartData?.byTypes.map(emission => ({
    type: emission.name,
    value: Number(emission.total),
    rate: emission.rate,
    code: emission.code,
  }));

  const targetString = I18N.carbonFootprint3.totalEmissionsK;

  return isHaveData ? (
    <EChartsReact
      style={{ height: 256 }}
      option={{
        tooltip: {
          trigger: 'item',
          appendToBody: true,
          formatter: (arg: {
            marker: string;
            name: string;
            value: number;
            percent: number;
          }) => {
            const { name, marker, value, percent } = arg;
            return `
                ${marker}
                <span>${name}<span>
                <span style="font-weight: bold; display: inline-block; margin-left: 16px">
                  <span>${value}<span>
                  <span style="display: inline-block; margin-left: 4px">${percent}%<span>
                <span>
            `;
          },
        },
        legend: {
          orient: 'vertical',
          top: 20,
          right: 20,
          type: 'scroll',
          inactiveBorderColor: '#fff',
          textStyle: {
            overflow: 'breakAll',
          },
        },
        series: [
          {
            type: 'pie',
            tooltip: {},
            center: ['25%', '50%'],
            radius: ['58%', '73%'],
            itemStyle: {
              borderRadius: 4,
              borderColor: '#fff',
              borderWidth: 2,
            },
            data: (data || []).map((item, index) => ({
              name: item.type,
              value: item.value,
              itemStyle: {
                color: BAR_COLORS[index],
              },
            })),
            label: {
              show: true,
              position: 'center',
              formatter: `{value|${total}}\n{name|${targetString}}`,
              rich: {
                value: {
                  color: '#026961',
                  backgroundColor: '#f7f8f9',
                  align: 'center',
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: 26,
                },
                name: {
                  color: '#999EA4',
                  backgroundColor: '#f7f8f9',
                  align: 'center',
                  fontSize: 12,
                  lineHeight: 18,
                  padding: [4, 0, 0, 0],
                },
              },
            },
          },
        ],
      }}
    />
  ) : (
    <div className={style.PieChart}>
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
});
