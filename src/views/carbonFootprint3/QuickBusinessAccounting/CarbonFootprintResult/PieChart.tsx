/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unstable-nested-components */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-08 15:49:40
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-27 16:53:29
 */
import I18N from '@src/lang/I18N';
import { VFC, memo, useRef } from 'react';
import { Pie, Plot, AllBaseConfig } from '@ant-design/charts';
import styles from './index.module.less';

type PieChartProps = {
  data: { value: number; label: string; [K: string]: any }[];
  emissionTotal: string;
};

const PieChart: VFC<PieChartProps> = ({ data, emissionTotal }) => {
  const ref = useRef<Plot<AllBaseConfig>>();

  return (
    <Pie
      data={data}
      angleField='value'
      colorField='label'
      padding={20}
      appendPadding={50}
      radius={1}
      innerRadius={0.85}
      ref={ref}
      color={['#698CFF', '#64DBC5', '#F06E6E', '#F6C06B', '#EE8F58']}
      label={{
        content: '',
      }}
      statistic={{
        title: {
          style: {
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: 500,
            color: '#343A40',
          },
          content: emissionTotal,
        },
        content: {
          style: {
            marginTop: '8px',
            marginBottom: '8px',
            textAlign: 'center',
            fontSize: '12px',
            fontWeight: 400,
            color: '#999EA4',
          },
          customHtml: () => I18N.carbonFootprint3.divEmissions,
        },
      }}
      legend={{
        itemMarginBottom: 25,
      }}
      tooltip={{
        customContent: (title, nodeList) => {
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
                {node.data.name}：{node?.data?.total}kgCO₂e-{node?.data?.value}%
              </div>
            </div>
          );
        },
      }}
      chartRef={ref}
    />
  );
};

export default memo(PieChart);
