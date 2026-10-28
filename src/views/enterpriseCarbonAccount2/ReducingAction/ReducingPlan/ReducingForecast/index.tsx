import useUrlState from '@ahooksjs/use-url-state';
import { LoadingOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import emptyImg from '@src/assets/svg/empty.svg';
import { checkPermissions } from '@src/components/Permission/utils';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { RouteMaps } from '@src/router/route-paths';
import { useMount } from 'ahooks';
import { Button, Spin, Tag } from 'antd';
import classNames from 'classnames';
import * as echarts from 'echarts';
import { isNil, throttle } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import ForecastSettingModal from './ForecastSettingModal';
import styles from './index.module.less';
import {
  getForecastDataRefresh,
  getReducingForecastData,
  getReducingForecastSetting,
} from './service';
import { ReducingForecastSetting, ReducingForecastData } from './type';
import ScopeOrgSelect from '../ScopeOrgSelect';
import {
  FORECAST_WAY,
  FORECAST_WAY_DESC,
  FORECAST_WAY_ICON,
  FORECAST_WAY_LABEL,
  HISTORY_DATA_RANGE_LABEL,
} from '../constant';
import { ReducingPlan } from '../type';

type ReducingForecastProps = {
  reducingPlan: ReducingPlan;
};

const ReducingForecast: FC<ReducingForecastProps> = ({ reducingPlan }) => {
  const [urlParams] = useUrlState<{ open?: string }>();

  const [forecastData, setForecastData] = useState<ReducingForecastData>();

  const [forecastSetting, setForecastSetting] =
    useState<ReducingForecastSetting | null>(null);

  const [forecastSettingModalVisible, setForecastSettingModalVisible] =
    useState(false);

  const [scopeOrgData, setScopeOrgData] = useState<{
    scopeValues: string[][];
    orgValues: string[][];
  }>({ scopeValues: [], orgValues: [] });

  const [loading, setLoading] = useState(false);

  const { id: planId } = reducingPlan;
  const chartRef = useRef<echarts.ECharts | null>(null);

  const chartContainer = useRef<HTMLDivElement>(null);

  const history = useHistory();

  const hasYesterYearData = !isNil(forecastData?.yesterYearEmissions);

  const hasForecastSetting = forecastSetting !== null;

  const hasChartData =
    forecastData?.chartDataList && forecastData.chartDataList.length > 0;

  const getForecastData = async ({
    id,
    scopeValues,
    orgValues,
  }: {
    id: number;
    scopeValues: string[][];
    orgValues: string[][];
  }) => {
    try {
      setLoading(true);
      const { data } = await getReducingForecastData({
        id,
        scopeValues,
        orgValues,
      });
      setForecastData(data.data);
    } finally {
      setLoading(false);
    }
  };

  const getForecastSetting = async (params: { id: number }) => {
    const { data } = await getReducingForecastSetting(params);
    setForecastSetting(data.data);
  };

  const refreshForecastData = async () => {
    await getForecastDataRefresh({ id: planId });
    getForecastData({ id: planId, ...scopeOrgData });
  };

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
    getForecastSetting({ id: reducingPlan.id });
    setScopeOrgData({ scopeValues: [], orgValues: [] });
  }, [reducingPlan]);

  useEffect(() => {
    getForecastData({ id: planId, ...scopeOrgData });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeOrgData]);

  useEffect(() => {
    if (chartRef.current && forecastData) {
      const firstAfterIndex = (forecastData.chartDataList || []).findIndex(
        ({ beforeFlag }) => !beforeFlag,
      );

      const { years, realityEmissions, emissions, beforeCurrentYears } = (
        forecastData.chartDataList || []
      ).reduce<{
        years: string[];
        realityEmissions: number[];
        emissions: number[];
        beforeCurrentYears: boolean[];
      }>(
        (prev, curr) => {
          const beforeCurrentYear = curr.beforeFlag;
          return {
            years: [...prev.years, curr.year],
            realityEmissions: [...prev.realityEmissions, curr.realityEmission],
            emissions: [...prev.emissions, curr.emission],
            beforeCurrentYears: [...prev.beforeCurrentYears, beforeCurrentYear],
          };
        },
        {
          years: [],
          realityEmissions: [],
          emissions: [],
          beforeCurrentYears: [],
        },
      );

      chartRef.current.setOption({
        legend: {
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
              name: I18N.enterpriseCarbonAccount2.naturalBusinessGrowth2,
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
          ],
        },
        tooltip: {
          trigger: 'axis',
          formatter: (
            params: {
              name: string;
              value: number;
              marker: string;
              seriesName: string;
              seriesIndex: number;
              dataIndex: number;
            }[],
          ) => {
            const { name, dataIndex } = params[0];
            const beforeCurrentYear = beforeCurrentYears[dataIndex];
            const { realityEmission, emission } =
              forecastData.chartDataList[dataIndex];

            const year = I18N.enterpriseCarbonAccount2.year8;
            const actualText = I18N.enterpriseCarbonAccount2.actualValue;
            const forecastText = I18N.enterpriseCarbonAccount2.estimate;
            let toolTipText = `
              <div class="${styles.tooltipName}">
                ${name}${year}
                <span class="${styles.tooltipUnit}">(tCO₂e)</span>
              </div>
            `;
            if (!isNil(realityEmission)) {
              toolTipText += `
                <div class="${styles.tooltipItem}">
                  <div class="${styles.customLegend} ${styles.realLegend}"></div>
                  <div class="${styles.tooltipTitle}">${actualText}</div>
                  <div class="${styles.tooltipValue}">${realityEmission}</div>
                </div>
              `;
            }
            if (!beforeCurrentYear) {
              toolTipText += `
                <div class="${styles.tooltipItem}">
                  <div class="${styles.customLegend} ${styles.forecastLegend}"></div>
                  <div class="${styles.tooltipTitle}">${forecastText}</div>
                  <div class="${styles.tooltipValue}">${emission}</div>
                </div>
            `;
            }
            return toolTipText;
          },
        },
        grid: {
          left: 80,
          right: 20,
          bottom: 30,
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
            axisTick: { alignWithLabel: true },
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
            areaStyle: {
              color: 'rgba(12, 191, 159, 0.07)',
            },
            data: realityEmissions.map(value => ({
              value,
              itemStyle: {
                color: '#0CBF9F',
              },
            })),
          },
          {
            name: I18N.enterpriseCarbonAccount2.naturalBusinessGrowth2,
            type: 'line',
            lineStyle: {
              type: 'dashed',
              color: '#3491FA',
            },
            data: emissions.slice(firstAfterIndex).map((value, index) => ({
              value: [firstAfterIndex + index, value],
              itemStyle: {
                color: '#3491FA',
              },
            })),
          },
        ],
      });
    }
  }, [forecastData]);

  useMount(() => {
    setForecastSettingModalVisible(!!urlParams.open);
  });

  return (
    <div className={styles.reducingForecast}>
      <Spin
        wrapperClassName={styles.loadingContainer}
        spinning={loading}
        indicator={<LoadingOutlined />}
      >
        {!hasYesterYearData || !hasForecastSetting ? (
          <div className={styles.forecastSetting}>
            <div className={styles.notComplete}>
              <ExclamationCircleOutlined className={styles.notCompleteIcon} />
              <span>
                {I18N.enterpriseCarbonAccount2.pleaseFollowTheInstructions2}
              </span>
            </div>
            <div className={styles.completeContent}>
              <div className={styles.completeItem}>
                <div
                  className={classNames(styles.completeTitle, {
                    [styles.completedText]: hasYesterYearData,
                  })}
                >
                  {I18N.enterpriseCarbonAccount2.carbonEmissionAccounting2}
                </div>
                <div
                  className={classNames(styles.completeDesc, {
                    [styles.completedText]: hasYesterYearData,
                  })}
                >
                  {hasYesterYearData
                    ? I18N.enterpriseCarbonAccount2.already
                    : I18N.enterpriseCarbonAccount2.please}
                  {I18N.enterpriseCarbonAccount2.complete}
                  {forecastData?.yesterYear || ''}
                  {I18N.enterpriseCarbonAccount2.annualCorporateCarbonCore}
                </div>
                <div className={styles.operate}>
                  {hasYesterYearData ? (
                    <Tag className={styles.completeTag}>
                      {I18N.components.completed}
                    </Tag>
                  ) : (
                    <Button
                      type='primary'
                      onClick={() =>
                        history.push(
                          RouteMaps.enterpriseCarbonAccountingcarbonDischarge,
                        )
                      }
                    >
                      {I18N.enterpriseCarbonAccount2.goToAccounting}
                    </Button>
                  )}
                </div>
              </div>
              <div className={styles.completeItem}>
                <div
                  className={classNames(styles.completeTitle, {
                    [styles.completedText]: hasForecastSetting,
                  })}
                >
                  {I18N.enterpriseCarbonAccount2.selectPredictor3}
                </div>
                <div
                  className={classNames(styles.completeDesc, {
                    [styles.completedText]: hasForecastSetting,
                  })}
                >
                  {hasForecastSetting
                    ? I18N.enterpriseCarbonAccount2.already
                    : I18N.enterpriseCarbonAccount2.please}
                  {I18N.enterpriseCarbonAccount2.selectPredictor2}
                </div>
                <div className={styles.operate}>
                  {hasForecastSetting ? (
                    <Tag className={styles.completeTag}>
                      {I18N.components.completed}
                    </Tag>
                  ) : (
                    checkPermissions(
                      <Button
                        type='primary'
                        onClick={() => setForecastSettingModalVisible(true)}
                      >
                        {I18N.enterpriseCarbonAccount2.selectPredictor}
                      </Button>,
                      'enterprise:forecast:edit',
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className={classNames(
              styles.forecastSetting,
              styles.forecastSettingData,
            )}
          >
            <div className={styles.titleContent}>
              <div className={styles.titleContentLeft}>
                <IconAlibaba
                  className={styles.forecastIcon}
                  type={FORECAST_WAY_ICON[forecastSetting.type]}
                />
                <div className={styles.forecastTitle}>
                  {FORECAST_WAY_LABEL[forecastSetting.type]}
                </div>
                <div className={styles.forecastDesc}>
                  {FORECAST_WAY_DESC[forecastSetting.type]}
                </div>
              </div>
              {checkPermissions(
                <Button
                  type='primary'
                  onClick={() => setForecastSettingModalVisible(true)}
                >
                  {I18N.enterpriseCarbonAccount2.switchPredictor}
                </Button>,
                'enterprise:forecast:edit',
              )}
            </div>
            <div className={styles.forecastDetails}>
              {forecastSetting.type === FORECAST_WAY.FUTURE ? (
                <>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.plannedSalesRevenue}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {forecastSetting.marketRatio ?? '-'}%
                    </div>
                  </div>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.planningProductProduction}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {forecastSetting.productRatio ?? '-'}%
                    </div>
                  </div>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.planEmployees}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {forecastSetting.employeeRatio ?? '-'}%
                    </div>
                  </div>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.planningSiteGround}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {forecastSetting.placeRatio ?? '-'}%
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.historicalDataScope}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {HISTORY_DATA_RANGE_LABEL[forecastSetting.dataScope]}
                    </div>
                  </div>
                  <div className={styles.forecastDetailsItem}>
                    <div className={styles.forecastDetailsTitle}>
                      {I18N.enterpriseCarbonAccount2.estimatedSalesRevenue}
                    </div>
                    <div className={styles.forecastDetailsValue}>
                      {forecastSetting.marketRatio ?? '-'}%
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        <div className={styles.forecastData}>
          <div className={styles.forecastDataHeader}>
            <div className={styles.forecastDataTitle}>
              {I18N.enterpriseCarbonAccount2.predictionSituation}
            </div>
            <ScopeOrgSelect
              value={scopeOrgData}
              reducingPlan={reducingPlan}
              onChange={setScopeOrgData}
            />
          </div>
          {hasYesterYearData && hasForecastSetting && (
            <div className={styles.forecastDataDesc}>
              {I18N.enterpriseCarbonAccount2.theSystemWillBeBasedOn}
              <span className={styles.refreshBtn} onClick={refreshForecastData}>
                {I18N.enterpriseCarbonAccount2.refreshNow}
              </span>
            </div>
          )}
          <div className={styles.forecastDataContent}>
            <div className={styles.forecastDataDetails}>
              <div className={styles.forecastDataDetailsItem}>
                <div className={styles.forecastDataDetailsLabel}>
                  {forecastData?.yesterYear}
                  {I18N.enterpriseCarbonAccount2.annualActualEmissions}
                  <span className={styles.tip}>(tCO₂e)</span>
                </div>
                <div className={styles.forecastDataDetailsValue}>
                  {forecastData?.yesterYearEmissions ?? '-'}
                </div>
              </div>
              <div className={styles.forecastDataDetailsItem}>
                <div className={styles.forecastDataDetailsLabel}>
                  {forecastData?.forecastYear}
                  {I18N.enterpriseCarbonAccount2.annualForecastEmissions}
                  <span className={styles.tip}>(tCO₂e)</span>
                </div>
                <div className={styles.forecastDataDetailsValue}>
                  {forecastData?.forecastYearEmissions ?? '-'}
                </div>
              </div>
              <div className={styles.forecastDataDetailsItem}>
                <div className={styles.forecastDataDetailsLabel}>
                  {I18N.enterpriseCarbonAccount2.predictedChangeRatio}
                </div>
                <div className={styles.forecastDataDetailsValue}>
                  {forecastData?.forecastChangeRatio ?? '-'}%
                </div>
              </div>
            </div>
            <div className={styles.tip}>
              {I18N.enterpriseCarbonAccount2.thePredictedResultsAreOnly}
            </div>
            <div className={styles.chartContainer} ref={chartContainer} />

            {!hasChartData && (
              <div className={styles.empty}>
                <img className={styles.emptyImg} src={emptyImg} alt='' />
                <span className={styles.emptyText}>
                  {I18N.carbonFootprint3.thereIsCurrentlyNoDataAvailable}
                </span>
              </div>
            )}
          </div>
        </div>
      </Spin>
      <ForecastSettingModal
        visible={forecastSettingModalVisible}
        reducingPlan={reducingPlan}
        forecastSetting={forecastSetting}
        onCancel={() => setForecastSettingModalVisible(false)}
        onSuccess={() => {
          getForecastData({ id: planId, ...scopeOrgData });
          getForecastSetting({ id: planId });
          setForecastSettingModalVisible(false);
        }}
      />
    </div>
  );
};

export default ReducingForecast;
