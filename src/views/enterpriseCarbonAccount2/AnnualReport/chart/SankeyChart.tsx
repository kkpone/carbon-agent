/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable react/no-unstable-nested-components */

import { Sankey } from '@ant-design/charts';
import I18N from '@src/lang/I18N';
import { isNil } from 'lodash-es';
import React, { useEffect, useState, memo } from 'react';

import Empty from './Empty';
import { CHART_COLORS } from '../constant';
import styles from '../index.module.less';
import { getDataQuantityDiversion } from '../service';

type SankeyChartProps = {
  year: number | undefined;
  type: number;
  orgId?: number;
};

const ChartContent = memo(
  (props: {
    data: { target: string; source: string; value: number; [P: string]: any }[];
  }) => (
    <Sankey
      data={props.data}
      color={CHART_COLORS}
      sourceField='source'
      targetField='target'
      weightField='value'
      nodeDraggable
      nodePadding={8}
      rawFields={['path']}
      tooltip={{
        fields: ['path', 'value'],
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
                <span className={styles.scopeChartName}>{node.data.path}</span>
                <span className={styles.scopeChartValueText}>{node.value}</span>
                <span className={styles.scopeChartName}>tCO₂e</span>
              </div>
            </div>
          );
        },
      }}
    />
  ),
);

const SankeyChart: React.FC<SankeyChartProps> = ({ year, type, orgId }) => {
  const [data, setData] = useState<
    { target: string; source: string; value: number; [P: string]: any }[]
  >([]);

  useEffect(() => {
    if (!isNil(year) && !isNil(orgId)) {
      getDataQuantityDiversion({
        type,
        period: year.toString(),
        orgId,
      }).then(resp => {
        const dataList: {
          target: string;
          source: string;
          value: number;
          [P: string]: any;
        }[] = [];
        (resp.data.data?.categoryDataList || []).forEach(
          ({ emissionQuantity, category, classifyDataList }) => {
            dataList.push({
              target: category,
              source: 'tCO₂e',
              value: Number(emissionQuantity),
              path: `tCO₂e--${category}`,
            });
            classifyDataList.forEach(item => {
              dataList.push({
                source: item.category,
                target: item.sourceName,
                value: Number(item.emissionQuantity),
                path: `tCO₂e--${category}--${item.sourceName}`,
              });
            });
          },
        );
        setData(dataList.filter(item => item.value !== 0));
      });
    } else {
      setData([]);
    }
  }, [year, type, orgId]);

  const hasData = data.some(item => item.value !== 0);

  return (
    <div className={styles.sankeyChart}>
      <div className={styles.title}>
        {I18N.enterpriseCarbonAccount2.corporateCarbonEmissions}
      </div>
      <div
        className={styles.sankeyContent}
        style={{
          minHeight: 140,
          height: `${data.length * 12}px`,
        }}
      >
        {hasData ? <ChartContent data={data} /> : <Empty />}
      </div>
    </div>
  );
};

export default memo(SankeyChart);
