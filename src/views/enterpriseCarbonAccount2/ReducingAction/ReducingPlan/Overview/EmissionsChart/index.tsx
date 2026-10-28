import I18N from '@src/lang/I18N';
import * as echarts from 'echarts';
import { isNil, throttle } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import styles from './index.module.less';
import { COMPARE_TAG } from '../../constant';
import { ReducingPlan } from '../../type';
import { getYearEmissionList } from '../service';
import { YearType, YearEmission } from '../type';

type EmissionChartProps = {
  reducingPlan: ReducingPlan;
  scopeOrgData: {
    scopeValues?: string[][];
    orgValues?: string[][];
  };
  yearType?: YearType;
  chartOption?: echarts.EChartsOption;
};

const EmissionChart: FC<EmissionChartProps> = ({
  reducingPlan,
  scopeOrgData,
  yearType,
  chartOption,
}) => {
  const [chartData, setChartData] = useState<YearEmission[]>([]);

  const chartRef = useRef<echarts.ECharts | null>(null);

  const chartContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new ResizeObserver(
      throttle(() => {
        chartRef.current?.resize();
      }, 50),
    );

    if (chartContainer.current) {
      chartRef.current = echarts.init(chartContainer.current);
      observer.observe(chartContainer.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    getYearEmissionList({
      id: reducingPlan.id,
      choose: yearType,
      ...scopeOrgData,
    }).then(({ data }) => {
      setChartData(data.data || []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeOrgData, yearType]);

  useEffect(() => {
    if (chartRef.current) {
      const {
        years,
        emissions,
        forecastEmissions,
        predictEmissions,
        standardEmissions,
        forecastEmissionsReduce,
      } = chartData.reduce<{
        years: string[];
        emissions: number[];
        forecastEmissions: number[];
        standardEmissions: number[];
        predictEmissions: number[];
        forecastEmissionsReduce: number[];
      }>(
        (prev, curr) => ({
          years: [...prev.years, String(curr.year)],
          emissions: [...prev.emissions, curr.emissions],
          forecastEmissions: [
            ...prev.forecastEmissions,
            curr.forecastEmissions,
          ],
          standardEmissions: [
            ...prev.standardEmissions,
            curr.standardEmissions,
          ],
          predictEmissions: [...prev.predictEmissions, curr.predictEmissions],
          forecastEmissionsReduce: [
            ...prev.forecastEmissionsReduce,
            curr.forecastEmissionsReduce,
          ],
        }),
        {
          years: [],
          emissions: [],
          forecastEmissions: [],
          standardEmissions: [],
          predictEmissions: [],
          forecastEmissionsReduce: [],
        },
      );

      const transformTooltipValue: <T>(val: T) => T | string = val =>
        isNil(val) ? '-' : val;
      chartRef.current.setOption({
        tooltip: {
          trigger: 'axis',
          formatter: (
            params: {
              name: string;
              dataIndex: number;
            }[],
          ) => {
            const { name, dataIndex } = params[0];
            const emissionData = chartData[dataIndex];
            const greaterThanStandard =
              emissionData.compareStandardEmissionsResult ===
              COMPARE_TAG.GREATER;
            const greaterThanPredict =
              emissionData.comparePredictEmissionsResult ===
              COMPARE_TAG.GREATER;

            const templateText = {
              year: I18N.enterpriseCarbonAccount2.year8,
              actualEmission: I18N.enterpriseCarbonAccount2.actualValue,
              forecastEmission:
                I18N.enterpriseCarbonAccount2.naturalBusinessGrowth,
              reduceForecastEmission:
                I18N.enterpriseCarbonAccount2.predictionAfterEmissionReduction,
              predictEmission: I18N.enterpriseCarbonAccount2.targetValue,
              standardEmission: I18N.enterpriseCarbonAccount2.benchmarkValue,
              overTarget: I18N.enterpriseCarbonAccount2.beyondTarget,
              backTarget: I18N.enterpriseCarbonAccount2.belowTarget,
              overBase: I18N.enterpriseCarbonAccount2.beyondBenchmark,
              backBase: I18N.enterpriseCarbonAccount2.belowBenchmark,
              predictReduceEmission:
                I18N.enterpriseCarbonAccount2.expectedEmissionReduction,
            };

            let toolTipText = `
              <div class="${styles.tooltipName}">
                ${name}${templateText?.year}
                <span class="${styles.tooltipUnit}">(tCO₂e)</span>
              </div>
            `;

            if (!isNil(emissionData.emissions)) {
              toolTipText += `
                <div class="${styles.tooltipItem}">
                  <div class="${styles.emissionLegend}"></div>
                  <div class="${styles.tooltipTitle}">${
                templateText.actualEmission
              }</div>
                  <div class="${styles.tooltipValue}">${transformTooltipValue(
                emissionData.emissions,
              )}</div>
                </div>
              `;
            }

            toolTipText += `
              <div class="${styles.tooltipItem}">
                <div class="${styles.forecastLegend}"></div>
                <div class="${styles.tooltipTitle}">${
              templateText.forecastEmission
            }</div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.forecastEmissions,
            )}</div>
              </div>
            `;

            toolTipText += `
            <div class="${styles.tooltipItem}">
              <div class="${styles.forecastReduceLegend}"></div>
              <div class="${styles.tooltipTitle}">${
              templateText.reduceForecastEmission
            }</div>
              <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.forecastEmissionsReduce,
            )}</div>
            </div>
          `;

            toolTipText += `
              <div class="${styles.tooltipItem}">
                <div class="${styles.measureReduceLegend}"></div>
                <div class="${styles.tooltipTitle}">${
              templateText.predictReduceEmission
            }</div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.measureTotalReduceEmission,
            )}</div>
              </div>
            `;

            toolTipText += `
              <div class="${styles.tooltipItem}">
                <div class="${styles.predictLegend}"></div>
                <div class="${styles.tooltipTitle}">${
              templateText.predictEmission
            }</div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.predictEmissions,
            )}</div>
              </div>
              <div class="${styles.tooltipItem}">
                <div class="${styles.standardLegend}"></div>
                <div class="${styles.tooltipTitle}">${
              templateText.standardEmission
            }</div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.standardEmissions,
            )}</div>
              </div>
              <div class="${styles.tooltipItem}">
                <div class="${styles.tooltipTitle} ${
              greaterThanStandard ? styles.warnText : styles.brandText
            }">
                  ${
                    greaterThanStandard
                      ? templateText.overBase
                      : templateText.backBase
                  }
                </div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.compareStandardEmissions,
            )}</div>
              </div>
              <div class="${styles.tooltipItem}">
                <div class="${styles.tooltipTitle} ${
              greaterThanPredict ? styles.warnText : styles.brandText
            }">${
              greaterThanPredict
                ? templateText.overTarget
                : templateText.backTarget
            } </div>
                <div class="${styles.tooltipValue}">${transformTooltipValue(
              emissionData.comparePredictEmissions,
            )}</div>
              </div>
            `;

            return toolTipText;
          },
        },
        legend: {
          textStyle: {
            width: 120,
            overflow: 'truncate',
            ellipsis: '...',
          },
          data: [
            {
              name: I18N.enterpriseCarbonAccount2.actualValue,
              itemStyle: {
                color: '#0CBF9F',
              },
              lineStyle: {
                color: '#0CBF9F',
              },
              textStyle: {
                color: '#999EA4',
              },
            },
            {
              name: I18N.enterpriseCarbonAccount2.naturalBusinessGrowth,
              itemStyle: {
                color: '#3491FA',
              },
              lineStyle: {
                color: '#3491FA',
              },
              textStyle: {
                color: '#999EA4',
              },
            },
            {
              name: I18N.enterpriseCarbonAccount2
                .predictionAfterEmissionReduction,
              itemStyle: {
                color: '#3491FA',
              },
              lineStyle: {
                color: '#3491FA',
              },
              textStyle: {
                color: '#999EA4',
              },
            },
            {
              name: I18N.enterpriseCarbonAccount2.targetValue,
              itemStyle: {
                color: '#FBA93E',
              },
              lineStyle: {
                color: '#FBA93E',
              },
              textStyle: {
                color: '#999EA4',
              },
            },
            {
              name: I18N.enterpriseCarbonAccount2.benchmarkValue,
              itemStyle: {
                color: '#D2D6DA',
                opacity: 0,
              },
              lineStyle: {
                color: '#D2D6DA',
              },
              textStyle: {
                color: '#999EA4',
              },
            },
            {
              name: I18N.enterpriseCarbonAccount2.expectedEmissionReduction,
              itemStyle: {
                borderWidth: 2,
                color: 'rgb(52, 145, 250)',
                opacity: 0.24,
              },
              icon: 'rect',
              textStyle: {
                color: '#999EA4',
              },
            },
          ],
          ...(chartOption?.legend || {}),
        },
        grid: chartOption?.grid || {
          top: 54,
          right: 16,
          bottom: 42,
          left: 94,
        },
        xAxis: [
          {
            type: 'category',
            data: years,
            axisPointer: {
              type: 'shadow',
            },
            axisLabel: {
              color: '#999EA4',
            },
            axisLine: { lineStyle: { color: '#EBEDF0' } },
            axisTick: { show: false },
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: I18N.enterpriseCarbonAccount2.unitTCo4,
            nameTextStyle: {
              color: '#999EA4',
              align: 'right',
              lineHeight: 60,
            },
            axisLabel: {
              color: '#999EA4',
            },
            splitLine: {
              lineStyle: {
                type: 'dashed',
              },
            },
            zlevel: 1,
          },
        ],
        series: [
          {
            name: I18N.enterpriseCarbonAccount2.actualValue,
            type: 'line',
            lineStyle: {
              type: 'solid',
              color: '#0CBF9F',
            },
            smooth: true,
            data: emissions.map(value => ({
              value,
              itemStyle: {
                color: '#0CBF9F',
              },
            })),
          },
          {
            name: I18N.enterpriseCarbonAccount2.naturalBusinessGrowth,
            type: 'line',
            lineStyle: {
              type: 'dashed',
              color: '#3491FA',
            },
            itemStyle: {
              color: '#3491FA',
            },
            smooth: true,
            data: forecastEmissions,
          },
          {
            name: I18N.enterpriseCarbonAccount2.expectedEmissionReduction,
            type: 'line',
            lineStyle: {
              color: 'rgba(255,255,255,0)',
            },
            itemStyle: {
              color: 'rgba(255,255,255,0)',
              opacity: 0,
            },
            smooth: true,
            emphasis: {
              disabled: true,
            },
            areaStyle: {
              origin: 'start',
              color: 'rgba(52, 145, 250, 0.24)',
            },
            data: forecastEmissions.map((val, index) =>
              isNil(forecastEmissionsReduce[index]) ? null : val,
            ),
          },
          {
            name: I18N.enterpriseCarbonAccount2
              .predictionAfterEmissionReduction,
            type: 'line',
            lineStyle: {
              type: 'solid',
              color: '#3491FA',
            },
            itemStyle: {
              color: '#3491FA',
            },
            smooth: true,
            emphasis: {
              disabled: true,
            },
            areaStyle: {
              origin: 'start',
              color: '#fff',
              opacity: 1,
            },
            data: forecastEmissionsReduce,
          },
          {
            name: I18N.enterpriseCarbonAccount2.targetValue,
            type: 'line',
            data: predictEmissions,
            smooth: true,
            itemStyle: {
              color: '#FBA93E',
            },
          },
          {
            name: I18N.enterpriseCarbonAccount2.benchmarkValue,
            type: 'line',
            symbol: 'none',
            smooth: true,
            lineStyle: {
              type: 'dashed',
              color: '#D2D6DA',
            },
            emphasis: {
              disabled: true,
            },
            data: standardEmissions,
          },
        ],
      });
    }
  }, [chartData, chartOption]);

  return (
    <div className={styles.chartContent}>
      <div className={styles.chartContainer} ref={chartContainer} />
    </div>
  );
};

export default EmissionChart;
