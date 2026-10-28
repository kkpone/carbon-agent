import useUrlState from '@ahooksjs/use-url-state';
import { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Dropdown, Modal, Popover, Tooltip } from 'antd';
import * as echarts from 'echarts';
import { isNil, throttle } from 'lodash-es';
import { FC, useEffect, useRef, useState } from 'react';

import { Toast } from '@/utils/Toast';

import StageModal from './StageModal/StageModal';
import styles from './index.module.less';
import {
  addTargetStage,
  deleteTargetStage,
  editReducingPlanBaseYear,
  editTargetStage,
  getReducingTargetChartData,
  getTargetStageList,
  getYearList,
} from './service';
import { TargetStage, TargetStageItem } from './type';
import ScopeOrgSelect from '../ScopeOrgSelect';
import { SCOPE_BG_COLOR, TARGET_STAGE_LABEL } from '../constant';
import { getPlanDetails } from '../service';
import { ReducingPlan } from '../type';

type ReducingTargetProps = {
  reducingPlan: ReducingPlan;
  refreshPlanList: (opt?: { id?: number; useFirstPlan?: boolean }) => void;
};

const ReducingTarget: FC<ReducingTargetProps> = ({
  reducingPlan,
  refreshPlanList,
}) => {
  const [urlParams] = useUrlState<{ open?: string }>();

  const [baseYearList, setBaseYearList] = useState<string[]>([]);

  const [planDetails, setPlanDetails] = useState<ReducingPlan>();

  const [stageModal, setStageModal] = useState<{
    open: boolean;
    stageId?: number;
  }>({ open: false });

  const [targetStageList, setTargetStageList] = useState<TargetStageItem[]>([]);

  const [chartData, setChartData] = useState<
    { year: string; predictEmissions: number; emissions: number }[]
  >([]);

  const [scopeOrgData, setScopeOrgData] = useState<{
    scopeValues: string[][];
    orgValues: string[][];
  }>({ scopeValues: [], orgValues: [] });

  const { id: planId, standardYear, ghgCategoryList } = reducingPlan;

  const chartRef = useRef<echarts.ECharts | null>(null);

  const chartContainer = useRef<HTMLDivElement>(null);

  const getBaseYears = async (params: { id: number }) => {
    const { data } = await getYearList(params);
    setBaseYearList((data.data || []).map(year => `${year}`));
  };

  const getTargetStages = async ({ id }: { id: number }) => {
    const { data } = await getTargetStageList({ id });
    setTargetStageList(data.data);
  };

  const editBaseYear = async (year: string) => {
    await editReducingPlanBaseYear({ id: planId, standardYear: year });
    refreshPlanList({ id: planId });
    getTargetStages({ id: planId });
  };

  const getChartData = async (data: {
    id: number;
    scopeValues: string[][];
    orgValues: string[][];
  }) => {
    const resp = await getReducingTargetChartData(data);
    setChartData(resp.data.data.chart || []);
  };
  const addEditTargetStage = async (val: TargetStage) => {
    if (isNil(val.stageId)) {
      await addTargetStage({ ...val, id: planId });
    } else {
      await editTargetStage(val);
    }

    Toast('success', I18N.carbonFootprint.operationSuccessful);
    setStageModal({ open: false });
    getTargetStages({ id: planId });
    getChartData({ ...scopeOrgData, id: planId });
    getBaseYears({ id: reducingPlan.id });
  };

  const deleteStage = ({ stageId }: { stageId: number }) => {
    Modal.confirm({
      title: I18N.carbonFootprint.confirm,
      content: I18N.enterpriseCarbonAccount2.doYouWantToDeleteThis2,
      onOk: async () => {
        await deleteTargetStage({ stageId });
        Toast('success', I18N.carbonFootprint.deleteSuccessful);
        getTargetStages({ id: planId });
        getChartData({ ...scopeOrgData, id: planId });
        getBaseYears({ id: reducingPlan.id });
      },
    });
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
    getTargetStages({ id: reducingPlan.id });
    getPlanDetails({ id: reducingPlan.id }).then(({ data }) => {
      setPlanDetails(data.data);
    });
    getBaseYears({ id: reducingPlan.id });
    setScopeOrgData({
      scopeValues: [],
      orgValues: [],
    });
  }, [reducingPlan]);

  useEffect(() => {
    getChartData({ ...scopeOrgData, id: planId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scopeOrgData]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.setOption({
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
            const getTitle = (index: number) =>
              index === 0
                ? I18N.enterpriseCarbonAccount2.actualValue
                : I18N.enterpriseCarbonAccount2.targetValue;
            const toolTipText = `<div>
                <span style="color: #343A40; font-size: 14px; font-weight: 500">${
                  params[0].name
                }</span>
                <span>（tCO₂e）</span>
              </div>
              <div>
                <span>${getTitle(params[0].dataIndex)}：</span>
                <span>${params[0].value}</span>
              </div>`;
            return toolTipText;
          },
        },
        grid: {
          left: 80,
          right: 10,
          bottom: 30,
        },
        xAxis: [
          {
            type: 'category',
            data: chartData.map(({ year }) => year),
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
            type: 'line',
            name: I18N.enterpriseCarbonAccount2.targetEmissions,
            lineStyle: {
              color: '#FBA93E',
            },
            data: chartData.map(({ predictEmissions, emissions }, index) => ({
              value: index === 0 ? emissions : predictEmissions,
              itemStyle: { color: '#FBA93E' },
            })),
          },
        ],
      });
    }
  }, [chartData]);

  useMount(() => {
    setStageModal({ open: !!urlParams.open });
  });

  return (
    <div className={styles.reducingTarget}>
      <div className={styles.targetBaseYearContent}>
        <div className={styles.targetBaseYearHeader}>
          <div className={styles.contentTitle}>
            {I18N.enterpriseCarbonAccount2.targetBaseYear}
            <Tooltip
              overlay={I18N.enterpriseCarbonAccount2.youCanOnlyChooseToHave}
            >
              <IconAlibaba type='icon-icon_info' />
            </Tooltip>
          </div>
          <Dropdown
            className={styles.baseYearDropdown}
            menu={{
              items: baseYearList.map(year => ({
                key: year,
                label: year,
                onClick: () => {
                  editBaseYear(year);
                },
              })),
            }}
          >
            <div className={styles.baseYear}>
              <div className={styles.baseYearVal}>
                {standardYear ||
                  I18N.enterpriseCarbonAccount2.pleaseSelectABenchmark}
              </div>
              <IconAlibaba
                className={styles.dropdownIcon}
                type='icon-icon_arrow_rioght'
              />
            </div>
          </Dropdown>
        </div>
        <div className={styles.targetBaseYearScope}>
          {(planDetails?.emissionDetail || []).map(emission => (
            <div className={styles.scopeItem} key={emission.value}>
              <div
                className={styles.scopeItemLeft}
                style={{ backgroundColor: SCOPE_BG_COLOR[emission.value] }}
              >
                {emission.name}
              </div>
              <div className={styles.scopeItemRight}>
                <div className={styles.scopeEmission}>{emission.emission}</div>
                {(emission.classify || []).length > 0 && (
                  <Popover
                    content={
                      <div className={styles.classifyContent}>
                        {emission.classify.map(classify => (
                          <div
                            className={styles.classifyItem}
                            key={classify.value}
                          >
                            <div className={styles.classifyName}>
                              {classify.name}
                            </div>
                            <div className={styles.classifyValue}>
                              {classify.emission}
                            </div>
                          </div>
                        ))}
                      </div>
                    }
                  >
                    <div className={styles.classifyCount}>
                      {I18N.enterpriseCarbonAccount2.contain}
                      {emission.classify.length}
                      {I18N.enterpriseCarbonAccount2.aCategory}
                    </div>
                  </Popover>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.targetStageContent}>
        <div className={styles.contentTitle}>
          {I18N.enterpriseCarbonAccount2.targetStage}
        </div>
        {targetStageList.map((targetStage, index) => {
          const {
            id,
            targetStage: targetStageVal,
            targetYear,
            emissionDetail,
          } = targetStage;
          return (
            <div key={id} className={styles.targetStageItem}>
              <div className={styles.targetStageItemLeft}>
                <div className={styles.targetStageIndex}>
                  <div>{I18N.carbonFootprint3.stage}</div>
                  <div>{index + 1}</div>
                </div>
                <div className={styles.targetStageYear}>
                  <div className={styles.targetStageDesc}>
                    {I18N.enterpriseCarbonAccount2.sbtGoal}
                  </div>
                  <div className={styles.targetStageValue}>
                    {TARGET_STAGE_LABEL[targetStageVal]}
                  </div>
                </div>
                <div className={styles.targetStageSplit} />
                <div className={styles.targetStageYear}>
                  <div className={styles.targetStageDesc}>
                    {I18N.enterpriseCarbonAccount2.targetYear2}
                  </div>
                  <div className={styles.targetStageValue}>{targetYear}</div>
                </div>
                {emissionDetail.map(emission => (
                  <div className={styles.targetStageScope} key={emission.value}>
                    <div className={styles.targetStageDesc}>
                      {emission.name}
                    </div>
                    <div className={styles.targetStageValue}>
                      {(emission.classify || []).length > 0 ? (
                        <Popover
                          content={
                            <div className={styles.classifyContent}>
                              {emission.classify.map(classify => (
                                <div
                                  className={styles.classifyItem}
                                  key={classify.value}
                                >
                                  <div className={styles.classifyName}>
                                    {classify.name}
                                  </div>
                                  <div className={styles.classifyValue}>
                                    {classify.emissionRatio}%
                                  </div>
                                  <div className={styles.classifyName}>
                                    {
                                      I18N.enterpriseCarbonAccount2
                                        .annuallyAverage
                                    }
                                    {classify.emissionAvg}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          }
                        >
                          <span className={styles.classifyCount}>
                            {I18N.enterpriseCarbonAccount2.contain}
                            {emission.classify.length}
                            {I18N.enterpriseCarbonAccount2.aCategory}
                          </span>
                        </Popover>
                      ) : (
                        <>
                          <span>{emission.emissionRatio}%</span>
                          <span className={styles.avgValue}>
                            {I18N.enterpriseCarbonAccount2.annuallyAverage}
                            {emission.emissionAvg}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.targetStageOperate}>
                <div
                  className={styles.targetStageBtn}
                  onClick={() => setStageModal({ open: true, stageId: id })}
                >
                  {I18N.carbonFootprint.edit}
                </div>
                <div
                  className={styles.targetStageBtn}
                  onClick={() => deleteStage({ stageId: id })}
                >
                  {I18N.carbonFootprint.delete}
                </div>
              </div>
            </div>
          );
        })}
        <div
          className={styles.addTargetBtn}
          onClick={() => {
            if (targetStageList.length >= 5) {
              Toast('warn', I18N.enterpriseCarbonAccount2.addAtMost);
              return;
            }
            setStageModal({ open: true });
          }}
        >
          <IconAlibaba type='icon-icon_add_fill' />
          <div>{I18N.enterpriseCarbonAccount2.addStage}</div>
        </div>
      </div>
      <div className={styles.chartContent}>
        <div className={styles.chartContentHeader}>
          <div className={styles.contentTitle}>
            {I18N.enterpriseCarbonAccount2.targetTrends}
          </div>
          <ScopeOrgSelect
            reducingPlan={reducingPlan}
            value={scopeOrgData}
            onChange={setScopeOrgData}
          />
        </div>
        <div className={styles.chartContainer} ref={chartContainer} />
      </div>
      <StageModal
        open={stageModal.open}
        ghgCategoryList={ghgCategoryList}
        stageId={stageModal.stageId}
        planId={planId}
        onCancel={() => {
          setStageModal({ open: false });
        }}
        onConfirm={addEditTargetStage}
      />
    </div>
  );
};

export default ReducingTarget;
