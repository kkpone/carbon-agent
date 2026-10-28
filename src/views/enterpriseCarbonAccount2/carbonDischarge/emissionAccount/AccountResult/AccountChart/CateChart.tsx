/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { AllBaseConfig, Bar, Pie, Plot } from '@ant-design/charts';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import React, { useState, useEffect, memo, useRef, useMemo } from 'react';

import Empty from './Empty';
import { CHART_COLORS, STANDARD } from './constant';
import styles from './index.module.less';
import { getDataQuantityCateComparison } from './service';
import { ClassifyData, CategoryData } from './type';

type CateChartProps = {
  agentPreviewLayout?: boolean;
  type: number;
  period: string;
  computationId?: number;
  computationPeriod?: string;
  orgId?: number | string;
  refreshFlag?: boolean;
  sessionId?: string;
  shareId?: string;
};

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
        innerRadius={0.7}
        color={CHART_COLORS}
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
      maxBarWidth={30}
      xField='classify'
      yField='classifyName'
      color={['#698CFF']}
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
  agentPreviewLayout,
  type,
  period,
  computationId,
  computationPeriod,
  orgId,
  refreshFlag,
  sessionId,
  shareId,
}) => {
  const [classifyData, setClassifyData] = useState<ClassifyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);

  useEffect(() => {
    const request =
      sessionId || shareId
        ? getDataQuantityCateComparison({
            type,
            period,
            computationId,
            computationPeriod,
            orgId,
            ...(sessionId ? { sessionId } : {}),
            ...(shareId ? { shareId } : {}),
          })
        : getDataQuantityCateComparison({
            type,
            period,
            computationId,
            computationPeriod,
            orgId,
          });

    request.then(resp => {
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
  }, [
    type,
    period,
    computationId,
    computationPeriod,
    orgId,
    refreshFlag,
    sessionId,
    shareId,
  ]);

  const hasBarChartData = classifyData.some(data => data.classify !== 0);
  const showCategoryInfo = type === STANDARD.GHG && categoryData.length > 0;

  return (
    <div
      className={classNames(styles.cateChart, {
        [styles.cateChartAgentPreview]: agentPreviewLayout,
      })}
    >
      <div className={styles.cateChartContent}>
        <div className={styles.title}>
          {I18N.enterpriseCarbonAccount2.emissionRange}
        </div>
        <div className={styles.cateContent}>
          <div
            className={styles.pieContent}
            style={{
              width: showCategoryInfo ? 'calc(100% - 260px)' : '100%',
            }}
          >
            <PieChart type={type} categoryData={categoryData} />
          </div>
          {showCategoryInfo && (
            <div className={styles.infoContent}>
              {categoryData.map((data, index) => (
                <div className={styles.infoItem}>
                  <div
                    className={styles.infoItemLeft}
                    style={{ background: CHART_COLORS[index] }}
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
                      {/* Agent 结果页暂不展示基准年，保留原页面展示逻辑。 */}
                      {!agentPreviewLayout && (
                        <>
                          <div className={styles.split} />
                          <div>
                            <div className={styles.infoTip}>
                              {I18N.enterpriseCarbonAccount2.baseYearTC}
                            </div>
                            <div className={styles.infoTxt}>
                              {data.standardEmissionQuantity}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    {/* Agent 结果页暂不展示比例，保留原页面展示逻辑。 */}
                    {!agentPreviewLayout && (
                      <div className={styles.infoItemRightBottom}>
                        {I18N.enterpriseCarbonAccount2.proportion}
                        {data.standardEmissionQuantityScale}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
