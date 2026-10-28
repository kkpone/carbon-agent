/**
 * @description 不确定性分析
 */
import {
  ActionType,
  LightFilter,
  ProFormInstance,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import I18N, { LocaleType } from '@src/lang/I18N';
import { useRequest } from 'ahooks';
import { Button, Empty, Progress, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import { divide, flatten, includes, isInteger, keyBy, map } from 'lodash-es';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';
import { REPONSE_CODE } from '@/config';
import { useDownloadHandler, usePageInfo } from '@/hooks';
import { formatScientific, Toast } from '@/utils';
import {
  getDictEnum,
  postUncertaintyAnalysisCalc,
  getUncertaintyAnalysisCalcProgress,
  getUncertaintyAnalysisHistogram,
  getUncertaintyAnalysisList,
  postUncertaintyAnalysisDesc,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/service';
import {
  AssessmentUncertaintyHistogramResp,
  AssessmentVersionResp,
  ImpactAssessmentListResp,
  StageImpactAssessment,
  UncertaintyProgressCalcResp,
} from '@/views/carbonFootPrintLCAnew/CarbonFootprintModel/type';

import { ExecuteConfigurationModal } from './ExecuteConfigurationModal';
import { UncertaintyDescriptionModal } from './UncertaintyDescriptionModal';
import { uncertaintyAnalysisColumns } from './columns';
import { EXECUTIVE_STATUS, EXECUTIVE_STATUS_TEXT } from './constant';
import styles from './index.module.less';
import { columns } from '../../columns';

interface UncertaintyAnalysisProps {
  planInfo: ImpactAssessmentListResp;
  versionInfo?: AssessmentVersionResp;
  checkVersion?: () => void;
}

interface SearchFormType {
  assessmentTarget?: string;
}

const { UNEXECUTED, IN_PROGRESS, EXECUTION_COMPLETED } = EXECUTIVE_STATUS;

export const UncertaintyAnalysis = ({
  planInfo,
  versionInfo,
  checkVersion,
}: UncertaintyAnalysisProps) => {
  const { locale } = useContext(LocaleContext);

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  const { isDetail } = usePageInfo();

  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 执行状态 */
  const [executiveStatus, setExecutiveStatus] = useState<number>(UNEXECUTED);

  /** 是否是执行中 */
  const isIngProgress = executiveStatus === IN_PROGRESS;

  /** 执行进度 */
  const [calcProgress, setCalcProgress] =
    useState<UncertaintyProgressCalcResp>();
  const { countNum, currNum } = calcProgress || {};

  /** 控制不确定分析描述弹窗显隐 */
  const [uncertaintyDescriptionOpen, setUncertaintyDescriptionOpen] =
    useState(false);

  /** 不确定分析描述弹窗确定loading */
  const [uncertaintyDescConfirmLoading, setUncertaintyDescConfirmLoading] =
    useState(false);

  /** 控制执行配置弹窗显隐 */
  const [executeConfigurationOpen, setExecuteConfigurationOpen] =
    useState(false);

  /** 执行配置弹窗确定loading */
  const [configureConfirmLoading, setConfigureConfirmLoading] = useState(false);

  /** 不确定性分析选择表单 */
  const uncertaintyForm = useRef<ProFormInstance>();

  /** 当前评价指标 */
  const [currentAssessmentTarget, setCurrentAssessmentTarget] =
    useState<string>();

  /** 结果echarts刷新loading */
  const [echartsRefreshLoading, setEchartsRefreshLoading] = useState(false);

  /** 结果echarts数据 */
  const [stageImpactAssessmentsData, setStageImpactAssessmentsData] =
    useState<AssessmentUncertaintyHistogramResp[]>();

  /** 是否展示图表 */
  const showEcharts =
    stageImpactAssessmentsData && stageImpactAssessmentsData?.length > 0;

  /** 图表配置 */
  const option = {
    tooltip: {
      show: true,
      trigger: 'axis',
      formatter: (params: any) => {
        if (isInteger(divide(params[0].dataIndex, 2))) {
          return null;
        }
        const binStartValue = stageImpactAssessmentsData?.find(
          v => Number(v.endValue) === Number(params[0].axisValue),
        );
        const contentHtml = `<div style="display: flex; align-items: center;">
            <span style="width: 10px; height: 10px; background-color: #FBA93E; border-radius: 50%; margin-right: 8px;"></span>
            <span>${params[0].value}</span>
          `;
        const tooltipContent = `<div class=${styles.tooltipWrapper}>
            <div class=${styles.tooltipTitle}>${binStartValue?.startValue}~${params[0].axisValue}</div>
            <div>${contentHtml}</div>
          </div>`;
        return tooltipContent;
      },
    },
    grid: {
      containLabel: true,
      top: 38,
      left: '2.5%',
      right: 62,
      bottom: 16,
    },
    xAxis: {
      type: 'category',
      name: I18N.carbonFootPrintLCA.result,
      nameTextStyle: {
        color: '#343A40',
        fontFamily: 'PingFang SC',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 22,
      },
      data: flatten(
        map(stageImpactAssessmentsData, item => [
          item.startValue,
          item.endValue,
        ]),
      ),
      boundaryGap: true,
      axisLabel: {
        color: '#343A40',
        fontSize: 12,
        interval: 5,
        rotate: 60,
      },
      axisLine: {
        lineStyle: {
          color: '#D2D6DA',
        },
      },
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
      name: I18N.carbonFootPrintLCA.probability,
      nameTextStyle: {
        color: '#343A40',
        fontFamily: 'PingFang SC',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: 22,
      },
      axisLabel: {
        color: '#999EA4',
        fontSize: 12,
      },
      axisLine: {
        lineStyle: {
          color: '#D2D6DA',
        },
      },
      splitLine: {
        lineStyle: {
          type: 'dashed',
          color: '#D2D6DA',
        },
      },
    },
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: flatten(
          map(stageImpactAssessmentsData, item => [0, item.probability]),
        ),
        color: '#FBA93E',
        barCategoryGap: '50%',
      },
    ],
  };

  /** 下载图片 */
  const downloadImgFn = useDownloadHandler(
    () => I18N.carbonFootPrintLCA.probabilityDistributionMap,
    'uncertainEchartsPng',
  );

  /** 获取柱状图数据 */
  const getEchartsData = async () => {
    if (currentAssessmentTarget && planInfo?.id) {
      setEchartsRefreshLoading(true);
      try {
        const { data } = await getUncertaintyAnalysisHistogram({
          assessmentId: planInfo?.id,
          assessmentTarget: currentAssessmentTarget,
        });
        setStageImpactAssessmentsData(data?.data);
      } finally {
        setEchartsRefreshLoading(false);
      }
    }
  };

  /** 更新进度和柱状图的方法 */
  const getUncertaintyAnalysisCalcApi = async () => {
    /** 获取不确定分析计算进度 */
    const { data } = await getUncertaintyAnalysisCalcProgress({
      assessmentId: Number(planInfo?.id),
    });
    const status = data?.data;
    if (status) {
      /** 是否在执行中 */
      const isIng = Number(status.currNum) < Number(status.countNum);
      /** 执行状态 */
      setExecutiveStatus(isIng ? IN_PROGRESS : EXECUTION_COMPLETED);

      /** 获取柱状图数据 */
      getEchartsData();

      /** 进度条进度信息 */
      setCalcProgress(data?.data);
    } else {
      setExecutiveStatus(UNEXECUTED);
    }

    return data?.data;
  };

  const { run, cancel } = useRequest(getUncertaintyAnalysisCalcApi, {
    pollingInterval: 5000,
    pollingWhenHidden: false,
  });

  /** 初始化 */
  const onInit = () => {
    /** 重置进度条进度 */
    setCalcProgress(undefined);
    /** 清空柱状图数据 */
    setStageImpactAssessmentsData([]);
  };

  /** 执行不确定性分析 */
  useEffect(() => {
    if (isIngProgress) {
      run();
    } else {
      cancel();
      /** 更新版本信息 */
      checkVersion?.();
    }
  }, [executiveStatus]);

  useEffect(() => {
    /** 获取柱状图数据 */
    getEchartsData();
  }, [currentAssessmentTarget]);

  useEffect(() => {
    onInit();
    /** 首次进入更新一次 避免在当前tab切换方案时不更新 */
    getUncertaintyAnalysisCalcApi();
  }, [planInfo.id]);

  return (
    <div
      className={styles.uncertaintyWrapper}
      key={`uncertainty${planInfo.id}`}
    >
      <div className={styles.analysisWrapper}>
        <div>
          <h3>{I18N.carbonFootPrintLCA.uncertaintyScore}</h3>
          <div>{I18N.carbonFootPrintLCA.thePlatformAdoptsMongolian}</div>
        </div>
        {!isDetail && (
          <Button
            type='primary'
            onClick={() => setUncertaintyDescriptionOpen(true)}
          >
            {I18N.carbonFootPrintLCA.uncertaintyDescription}
          </Button>
        )}
      </div>
      <div className={styles.processWrapper}>
        <div className={styles.titleWrapper}>
          {I18N.carbonFootPrintLCA.executionProcess}
        </div>
        <div className={styles.processMain}>
          <div className={styles.progressBox}>
            <Progress
              status={isIngProgress ? 'active' : 'normal'}
              percent={currNum && countNum ? (currNum / countNum) * 100 : 0}
              strokeWidth={16}
              strokeColor='#FBA93E'
              format={() => `${currNum ?? 0}/${countNum ?? 0}`}
            />
          </div>
          {!isDetail && (
            <Button
              loading={isIngProgress}
              type='primary'
              onClick={() => {
                setExecuteConfigurationOpen(true);
              }}
            >
              {EXECUTIVE_STATUS_TEXT?.[executiveStatus] ||
                I18N.carbonFootPrintLCA.implement}
            </Button>
          )}
        </div>
      </div>
      <div className={styles.resultWrapper}>
        <div className={styles.titleHeader}>
          <div>
            <div className={styles.titleWrapper}>
              {I18N.carbonFootPrintLCA.result}
            </div>
            {executiveStatus === EXECUTION_COMPLETED && (
              <div>
                {versionInfo?.uncertaintyLatest ? (
                  <div className={styles.successTip}>
                    {I18N.carbonFootPrintLCA.currentCalculationResult}
                  </div>
                ) : (
                  <div className={styles.warnTip}>
                    {I18N.carbonFootPrintLCA.noteDetectionOfMold}
                  </div>
                )}
              </div>
            )}
          </div>
          <LightFilter<SearchFormType> formRef={uncertaintyForm}>
            <div className={styles.filter}>
              <span>{I18N.carbonFootPrintLCA.selectionEvaluationIndex2}</span>
              <ProFormSelect
                width={200}
                allowClear={false}
                name='assessmentTarget'
                placeholder={I18N.Factors.pleaseSelect}
                initialValue={currentAssessmentTarget}
                params={{
                  id: planInfo.id,
                  assessmentMethod: planInfo.assessmentMethod,
                  currentTargetArr: planInfo?.assessmentTargetList?.split('|'),
                }}
                request={async (params: {
                  assessmentMethod: string;
                  currentTargetArr?: string[];
                }) => {
                  const { assessmentMethod, currentTargetArr } = params || {};
                  if (assessmentMethod && currentTargetArr) {
                    const { data } = await getDictEnum({
                      dictType: 'AssessmentProposal',
                      pageNum: 1,
                      pageSize: 1000,
                      labelValue: assessmentMethod,
                    });
                    const assessmentTargetOption =
                      data?.data?.map(item => ({
                        label: isEn ? item.dictLabelLanguage : item.dictLabel,
                        value: `${item.sourceType},${item.dictValue}`,
                        unit: item.relatedValue,
                      })) || [];
                    const newAssessmentTargetOption =
                      assessmentTargetOption?.filter(item =>
                        includes(currentTargetArr, item.value),
                      );

                    const defaultValue = newAssessmentTargetOption?.[0]?.value;
                    setCurrentAssessmentTarget(defaultValue);
                    uncertaintyForm?.current?.setFieldValue(
                      'assessmentTarget',
                      defaultValue,
                    );

                    return newAssessmentTargetOption;
                  }
                  return [];
                }}
                onChange={(v: string) => {
                  setCurrentAssessmentTarget(v);
                }}
              />
            </div>
          </LightFilter>
        </div>
        {!isDetail && (
          <div className={styles.echartsExport}>
            <Button
              disabled={!showEcharts}
              type='primary'
              size='small'
              onClick={downloadImgFn}
            >
              {I18N.eca.export}
            </Button>
          </div>
        )}
        {/* 图表部分 */}
        {showEcharts ? (
          <div className={styles.chartWrap} id='uncertainEchartsPng'>
            <Spin spinning={echartsRefreshLoading}>
              <ReactECharts
                className={styles.chart}
                key='uncertainEchartsPng'
                option={option}
              />
            </Spin>
          </div>
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
        {/* 表格部分 */}
        <ProTable<StageImpactAssessment>
          columns={uncertaintyAnalysisColumns()}
          actionRef={tableRef}
          pagination={false}
          search={false}
          columnsState={{
            persistenceKey: 'UncertaintyAnalysis',
            persistenceType: 'localStorage',
            defaultValue: columnsStateDefault,
          }}
          toolBarRender={false}
          params={{
            assessmentId: planInfo?.id,
            currentExecutiveStatus: executiveStatus,
          }}
          request={async params => {
            const { assessmentId, currentExecutiveStatus } = params || {};
            if (assessmentId && currentExecutiveStatus) {
              return getUncertaintyAnalysisList({
                assessmentId,
              }).then(({ data }) => {
                const result = data?.data?.map(item => {
                  const {
                    assessmentTargetName,
                    avgValue,
                    medianValue,
                    deviationValue,
                    changeValue,
                    floorValue,
                    upperValue,
                  } = item;
                  return {
                    assessmentTargetName,
                    avgValue: formatScientific(avgValue, true),
                    medianValue: formatScientific(medianValue, true),
                    deviationValue: formatScientific(deviationValue, true),
                    changeValue: formatScientific(changeValue, true),
                    floorValue: formatScientific(floorValue, true),
                    upperValue: formatScientific(upperValue, true),
                  };
                });
                return {
                  data: result || [],
                  success: true,
                };
              });
            }
            return { data: [], success: true };
          }}
        />
      </div>

      {/* 执行配置弹窗 */}
      <ExecuteConfigurationModal
        confirmLoading={configureConfirmLoading}
        open={executeConfigurationOpen}
        onCancel={() => {
          setExecuteConfigurationOpen(false);
        }}
        onOk={async value => {
          setConfigureConfirmLoading(true);
          const assessmentValue = {
            ...value,
            assessmentId: planInfo?.id,
          };
          try {
            // 执行接口 判断执行按钮loading
            const { data } = await postUncertaintyAnalysisCalc(assessmentValue);
            setExecuteConfigurationOpen(false);
            if (data?.code === REPONSE_CODE.SUCCESS_TOAST) {
              Toast('error', I18N.carbonFootPrintLCA.calculationErrorPlease);
            } else {
              run();
            }
          } finally {
            setConfigureConfirmLoading(false);
          }
        }}
      />

      {/* 不确定性描述弹窗 */}
      <UncertaintyDescriptionModal
        id={planInfo?.id}
        confirmLoading={uncertaintyDescConfirmLoading}
        open={uncertaintyDescriptionOpen}
        onOk={async value => {
          if (!planInfo?.id) {
            return;
          }
          setUncertaintyDescConfirmLoading(true);
          const assessmentValue = {
            ...value,
            assessmentId: planInfo?.id,
          };
          try {
            await postUncertaintyAnalysisDesc(assessmentValue);
            setUncertaintyDescriptionOpen(false);
          } finally {
            setUncertaintyDescConfirmLoading(false);
          }
        }}
        onCancel={() => {
          setUncertaintyDescriptionOpen(false);
        }}
      />
    </div>
  );
};
