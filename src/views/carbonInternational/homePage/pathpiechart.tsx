/*
 * @@description:国际版 首页图表
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2022-11-28 19:43:14
 */

import I18N from '@src/lang/I18N';
import { EChartsCoreOption } from 'echarts';
import { CSSProperties } from 'react';
import Echart from '../../carbonproduct/components/echartBar';
import styles from './homePage.module.less';

const PathPieChart = ({
  data,
  style,
}: {
  data: { [k: string]: number };
  style?: CSSProperties;
}) => {
  const arr = Object.entries(data || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  const dataArr: { name: string; value: number }[] = [];
  let total = 0;
  arr.forEach(item => {
    if (item.value !== null) {
      dataArr.push(item);
      total += item.value;
    }
  });

  const option: EChartsCoreOption = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: <br/>{c}({d}%)',
    },
    color: ['#6F94F1', '#3AD0BE', '#FFCB72', '#FFA372', '#FF7272'],
    legend: {
      itemGap: 15,
      itemHeight: 14,
      itemWidth: 14,
      top: '-5',
      textStyle: {
        color: '#666666',
      },
    },
    grid: {
      left: '10%',
      right: 0,
      top: '30%',
      bottom: 0,
    },
    series: [
      {
        name: '',
        type: 'pie',
        radius: ['25%', '56%'],
        labelLine: {
          length: 12,
        },

        label: {
          formatter: '{b|{b}:}{c}',
          rich: {
            a: {
              color: '#666666',
              lineHeight: 22,
              align: 'center',
            },
            hr: {
              borderColor: '#fff',
              width: '100%',
              borderWidth: 1,
              height: 0,
            },
            b: {
              color: '#666666',
              fontSize: 12,
              lineHeight: 33,
            },
            per: {
              color: '#fff',
              backgroundColor: '#4C5058',
              padding: [3, 4],
              borderRadius: 4,
            },
          },
        },
        data: dataArr,
        itemStyle: {
          normal: {
            label: {
              show: true,
              formatter: val => {
                const { name, value } = val.data;
                return `${name} : ${
                  total > 0 ? ((value / total) * 100).toFixed(2) : 0
                }%`;
              },
            },
            labelLine: { show: true },
          },
        },
      },
    ],
  };
  return (
    <div className={styles.chartWrapper} style={style || {}}>
      {dataArr.length > 0 ? (
        <Echart option={option} style={{ width: '100%', height: '100%' }} />
      ) : (
        <div>{I18N.enterpriseCarbonAccount2.thereIsCurrentlyNoDataExhibitionAvailable}</div>
      )}
    </div>
  );
};
export default PathPieChart;
