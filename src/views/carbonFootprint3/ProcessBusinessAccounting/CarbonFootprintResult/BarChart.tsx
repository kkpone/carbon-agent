/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unstable-nested-components */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-08 16:48:55
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-03 11:59:04
 */
import { Bar } from '@ant-design/charts';
import { VFC, memo } from 'react';

import styles from './index.module.less';

type BarChartProps = {
  data: { value: number; label: string; [K: string]: any }[];
};

const BarChart: VFC<BarChartProps> = ({ data }) => (
  <Bar
    data={data}
    appendPadding={20}
    xField='value'
    yField='index'
    color='#0CBF9F'
    xAxis={{
      grid: {
        line: {
          style: {
            lineDash: [5, 5],
          },
        },
      },
    }}
    yAxis={{
      line: null,
      tickLine: null,
      label: {
        formatter: (_, item, index) => data[index].label,
      },
    }}
    tooltip={{
      customContent: (_, nodeList) => {
        const node = nodeList[0];
        if (!node) {
          return '';
        }
        return (
          <div className={styles.chartTooltip}>
            <div
              className={styles.chartTooltipCircle}
              style={{ background: node.color }}
            />
            <div className={styles.chartTooltipText}>
              {node.data.name}：{node?.data?.value}kgCO₂e
            </div>
          </div>
        );
      },
    }}
  />
);

export default memo(BarChart);
