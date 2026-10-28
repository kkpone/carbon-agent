/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-21 17:33:45
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-07 17:57:40
 */
import { AllBaseConfig, Bar, Pie, Plot } from '@ant-design/charts';
import I18N from '@src/lang/I18N';
import { isNil } from 'lodash-es';
import React, { useState, useEffect, memo, useRef, useMemo } from 'react';

import Empty from './Empty';
import { STANDARD } from '../constant';
import styles from '../index.module.less';
import { getDataQuantityCateComparison } from '../service';
import { ClassifyData, CategoryData } from '../type';

type CateChartProps = {
  type: number;
  year: number | undefined;
  standardYearRefresh: boolean;
  orgId?: number;
};
const colors = [
  '#2FCCAA',
  '#08A28B',
  '#026961',
  '#E56665',
  '#7EC0DF',
  '#4EA271',
];

const PieChart = memo(
  (props: { categoryData: CategoryData[]; type: number }) => {
    const { categoryData, type } = props;
    const data = categoryData.filter(item => item.emissionQuantity !== 0);
    return data.length === 0 ? (
      <Empty />
    ) : (
      <Pie
        data={data}
        legend={
          type === STANDARD.ISO
            ? { layout: 'vertical', position: 'right' }
            : false
        }
        appendPadding={50}
        angleField='emissionQuantity'
        colorField='category'
        radius={1}
        innerRadius={0.85}
        color={colors}
        statistic={{
          title: false,
          content: false,
        }}
        label={{
          content: source => `${source.emissionQuantityScale}%`,
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
                  {node.name}：{node?.data?.emissionQuantity}tCO₂e-
                  {node?.data?.emissionQuantityScale}%
                </div>
              </div>
            );
          },
        }}
      />
    );
  },
  (prev, next) => prev.categoryData === next.categoryData,
);

const MAX_CLASSIFY_NAME_LENGTH = 7;

const BarChart = memo(({ data }: { data: ClassifyData[] }) => {
  const chartRef = useRef<Plot<AllBaseConfig>>();

  const chartData = useMemo(
    () => data.filter(({ classify }) => classify !== 0),
    [data],
  );

  useEffect(() => {
    if (chartRef.current) {
      const { chart } = chartRef.current;

      chart.on('axis-label:mouseenter', (ev: { x: number; y: number }) => {
        const { x, y } = ev;
        chart.showTooltip({ x: x + 50, y });
      });

      chart.on('axis-label:mouseleave', () => {
        chart.hideTooltip();
      });
    }
  }, []);

  return (
    <Bar
      data={chartData}
      appendPadding={[20, 20, 20, 0]}
      maxBarWidth={16}
      minBarWidth={16}
      xField='classify'
      yField='classifyName'
      barStyle={{ fill: '#048677' }}
      label={{
        position: 'right',
      }}
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
          style: {
            lineHeight: 16,
          },
          formatter: (...args) => {
            const index = args[2];
            let { classifyName, classifyNameSecond } = chartData[index];
            classifyName =
              classifyName?.length > MAX_CLASSIFY_NAME_LENGTH
                ? classifyName.slice(0, 7)
                : classifyName;
            classifyNameSecond =
              classifyNameSecond?.length > MAX_CLASSIFY_NAME_LENGTH
                ? classifyNameSecond.slice(0, 7)
                : classifyNameSecond;
            return `${classifyName}${
              classifyNameSecond ? `\n${classifyNameSecond}` : ''
            }`;
          },
        },
      }}
      chartRef={chartRef}
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
                {node.data.name}：{node?.data?.classify} tCO₂e
              </div>
            </div>
          );
        },
      }}
    />
  );
});

const CateChart: React.FC<CateChartProps> = ({
  type,
  year,
  orgId,
  standardYearRefresh,
}) => {
  const [classifyData, setClassifyData] = useState<ClassifyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    if (!isNil(year) && !isNil(orgId)) {
      getDataQuantityCateComparison({
        type,
        period: year.toString(),
        orgId,
      }).then(resp => {
        setClassifyData(
          (resp.data.data?.classifyData || []).map(data => ({
            ...data,
            name: `${data.classifyName}${
              data.classifyNameSecond ? `-${data.classifyNameSecond}` : ''
            }`,
          })),
        );
        setCategoryData(
          (resp.data.data?.categoryData || []).map(data => ({
            ...data,
            emissionQuantity: Number(data.emissionQuantity),
          })),
        );
      });
    } else {
      setClassifyData([]);
      setCategoryData([]);
    }
  }, [type, year, orgId, standardYearRefresh]);

  const hasBarChartData = classifyData.some(data => data.classify !== 0);

  return (
    <div className={styles.cateChart}>
      <div className={styles.cateChartContent}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.emissionRange}
        </div>
        <div className={styles.cateContent}>
          <div
            className={styles.pieContent}
            style={{
              width: `calc(100% - ${type === STANDARD.GHG ? '260' : '0'}px)`,
            }}
          >
            <PieChart type={type} categoryData={categoryData} />
          </div>
          {type === STANDARD.GHG && (
            <div className={styles.infoContent}>
              {(type === STANDARD.GHG ? categoryData : []).map(
                (data, index) => (
                  <div className={styles.infoItem}>
                    <div
                      className={styles.infoItemLeft}
                      style={{ background: colors[index] }}
                    >
                      {data.category}
                    </div>
                    <div className={styles.infoItemRight}>
                      <div className={styles.infoItemRightBody}>
                        <div>
                          <div className={styles.infoTip}>
                            {I18N.enterpriseCarbonAccount2.emissionsTC}
                          </div>
                          <div className={styles.infoTxt}>
                            {data.emissionQuantity}
                          </div>
                        </div>
                        <div className={styles.split} />
                        <div>
                          <div className={styles.infoTip}>
                            {I18N.enterpriseCarbonAccount2.baseYearTC}
                          </div>
                          <div className={styles.infoTxt}>
                            {data.standardEmissionQuantity}
                          </div>
                        </div>
                      </div>
                      <div className={styles.infoItemRightBottom}>
                        {I18N.enterpriseCarbonAccount2.proportion}
                        {data.standardEmissionQuantityScale}%
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.cateChartContent}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.topEmissions}
        </div>
        <div className={styles.cateContent}>
          {hasBarChartData ? <BarChart data={classifyData} /> : <Empty />}
        </div>
      </div>
    </div>
  );
};

export default memo(CateChart);
