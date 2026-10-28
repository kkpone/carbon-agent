/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unstable-nested-components */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-08 16:48:55
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-14 11:56:04
 */
import { Bar } from '@ant-design/charts';
import I18N from '@src/lang/I18N';
import { FC, memo } from 'react';

import style from './index.module.less';

type BarChartProps = {
  data: { value: number; label: string; [K: string]: any }[];
  barChartType: 'stage' | 'type' | 'emission';
};

const BarChart: FC<BarChartProps> = ({ data, barChartType }) => (
  <Bar
    data={data}
    isStack={barChartType === 'type'}
    seriesField={barChartType === 'type' ? 'type' : undefined}
    appendPadding={20}
    xField='value'
    yField='label'
    color={barChartType === 'type' ? ['#0CBF9F', '#7CE6C8'] : '#0CBF9F'}
    xAxis={{
      grid: {
        line: {
          style: {
            lineDash: [5, 5],
          },
        },
      },
    }}
    tooltip={{
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
                {I18N.carbonFootprint3.emissionsVolume}
                {node?.data?.all}
                kgCO₂e
              </div>
            </div>
            {transNode && (
              <div>
                <div className={style.chartTooltipText}>
                  {node.data.name}：{node?.data?.value.toFixed(2)}kgCO₂e
                </div>
              </div>
            )}
            <div>
              {transNode && (
                <div className={style.chartTooltipText}>
                  {transNode.data.type}：{transNode?.data?.value.toFixed(2)}
                  kgCO₂e
                </div>
              )}
            </div>
          </div>
        );
      },
    }}
  />
);

export default memo(BarChart);
