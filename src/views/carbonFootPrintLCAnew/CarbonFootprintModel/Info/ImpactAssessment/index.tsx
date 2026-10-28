/**
 * @description 影响评价
 */
import {
  LightFilter,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import type { ActionType, ProFormInstance } from '@ant-design/pro-components';
import I18N, { LocaleType } from '@src/lang/I18N';
import { Button, Empty, InputNumber, Spin, Table } from 'antd';
import ReactECharts from 'echarts-for-react';
import { cloneDeep, compact, includes, keyBy, reverse } from 'lodash-es';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { FormActions } from '@/components/FormActions';
import { IconFont } from '@/components/LcaIconFont';
import { LocaleContext } from '@/components/LocaleProvider';
import { PageEmpty } from '@/components/PageEmpty';
import { REPONSE_CODE } from '@/config';
import { usePageInfo } from '@/hooks';
import { Toast, changeTableColumnsNoText, formatScientific } from '@/utils';

import { columns, impactResultColumns } from './columns';
import style from './index.module.less';
import { ImpactAssessmentModal } from '../../components/ImpactAssessmentModal';
import { ProgrammeCards } from '../../components/ProgrammeCards';
import {
  getDictEnum,
  getExportAssessment,
  getImpactAssessmentData,
  getImpactAssessmentDataSunburst,
  getImpactAssessmentList,
  getImpactAssessmentTotal,
  getVersion,
  postImpactAssessmentCalc,
  postImpactAssessmentListAdd,
  postImpactAssessmentListDelete,
} from '../../service';
import {
  AssessmentDataResp,
  AssessmentVersionResp,
  ImpactAssessmentListResp,
  StageImpactAssessment,
  SunburstDto,
} from '../../type';
import { IO_TYPE_NAME } from '../constant';
import { saveAs } from 'file-saver';

interface ImpactFormType {
  assessmentTarget?: string;
}

const ImpactAssessment = ({
  onNextStepClick,
  onPreviousStepClick,
  onBackClick,
  isModelInfo,
}: {
  /** 点击下一步的方法 */
  onNextStepClick: () => void;
  /** 点击上一步的方法 */
  onPreviousStepClick: () => void;
  /** 返回的方法 */
  onBackClick: () => void;
  /** 是否是环境足迹模型跳转 */
  isModelInfo?: boolean;
}) => {
  const { locale } = useContext(LocaleContext);

  /** 是否是英文 */
  const isEn = locale === LocaleType.enUS;

  /** 是否是详情  模型id*/
  const { isDetail, id } = usePageInfo();

  const tableRef = useRef<ActionType>();

  const columnsStateDefault = useMemo(() => keyBy(columns, 'dataIndex'), []);

  /** 影响评价选择表单 */
  const impactForm = useRef<ProFormInstance>();

  /** 当前评价指标 */
  const [currentAssessmentTarget, setCurrentAssessmentTarget] =
    useState<string>();

  /** 计算按钮loading */
  const [calculateLoading, setCalculateLoading] = useState(false);

  /** 控制评价方案弹窗显隐 */
  const [impactAssessmentOpen, setImpactAssessmentOpen] = useState(false);

  /** 右侧页面刷新标识 */
  const [infoRefreshFlag, setInfoRefreshFlag] = useState(false);

  /** 方案列表 */
  const [planList, setPlanList] = useState<ImpactAssessmentListResp[]>([]);

  /** 方案列表刷新标识 */
  const [planListRefreshFlag, setPlanListRefreshFlag] = useState(false);

  /** 方案列表刷新loading */
  const [planListRefreshLoading, setPlanListRefreshLoading] = useState(false);

  /** 方案删除标识 */
  const [planDeletedFlag, setPlanDeletedFlag] = useState(false);

  /** 当前方案列表信息 */
  const [planInfo, setPlanInfo] = useState<ImpactAssessmentListResp>({});

  /** 当前评价方案id */
  const planId = planInfo?.id;

  /** 当前单位 */
  const [currentUnit, setCurrentUnit] = useState<string>('');

  /** 整体影响评价结果dataSource */
  const [impactAssessmentTotalDataSource, setImpactAssessmentTotalDataSource] =
    useState<AssessmentDataResp[]>([]);

  /** 生命周期阶段的影响评价echarts刷新loading */
  const [echartsRefreshLoading, setEchartsRefreshLoading] = useState(false);

  /** 生命周期阶段的影响评价 */
  const [stageImpactAssessmentsData, setStageImpactAssessmentsData] =
    useState<StageImpactAssessment[]>();
  const stageImpactAssessmentsChartsData = reverse(
    cloneDeep(stageImpactAssessmentsData || []),
  );

  /** 生命周期阶段的影响评价echarts刷新loading-旭日图 */
  const [echartsRefreshLoadingSunburst, setEchartsRefreshLoadingSunburst] =
    useState(false);
  /** 生命周期阶段的影响评价-旭日图 */
  const [
    stageImpactAssessmentsDataSunburst,
    setStageImpactAssessmentsDataSunburst,
  ] = useState<SunburstDto[]>();
  /** 生命周期阶段的影响评价-旭日图-全是0 */
  const [sunburstALlZero, setSunburstALlZero] = useState(false);

  /** 截止比例 */
  const [cutOffRatio, setCutOffRatio] = useState(5);

  /** 实时输入的截止比例 */
  const [cutOffRatioInput, setCutOffRatioInput] = useState(5);

  /** 总排放量 */
  const [emissionTotal, setEmissionTotal] = useState<number>();

  /** 是否展示版本提示 */
  const [showVersionTip, setShowVersionTip] = useState(false);

  /** 版本信息 */
  const [versionInfo, setVersionInfo] = useState<AssessmentVersionResp>();

  /** 检测计算版本是否是最新 */
  const checkVersion = () => {
    if (planId) {
      getVersion({ assessmentId: planId }).then(({ data }) => {
        setVersionInfo(data?.data);
      });
    }
  };

  /** 柱状图option */
  const optionBar = {
    title: {
      subtext: I18N.template(I18N.carbonFootPrintLCA.unitCur, {
        val1: currentUnit,
      }),
      textStyle: {
        color: '#999EA4',
        fontWeight: 400,
        fontSize: 12,
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      containLabel: true,
      top: 38,
      left: 0,
      right: 46,
      bottom: 16,
    },
    xAxis: {
      type: 'value',
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
    yAxis: {
      type: 'category',
      data: stageImpactAssessmentsChartsData?.map(v => v.lifeCycle),
      axisLabel: {
        color: '#343A40',
        fontSize: 12,
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
    series: [
      {
        type: 'bar',
        barWidth: 16,
        data: stageImpactAssessmentsChartsData?.map(v => v.dataValue),
        color: '#FBA93E',
      },
    ],
  };

  /** 检查旭日图阶段数据是否全0 */
  const checkSunburstDataAllZero = (sunburstData: SunburstDto[]) => {
    const allZero = !sunburstData?.some(item => Number(item.value));
    setSunburstALlZero(allZero);
  };

  /** 处理旭日图数据 */
  const handleSunburstData = (sunburst: SunburstDto) => {
    const originValue = sunburst.value;
    // 按贡献度部分的科学计数法规则处理
    const showVal = originValue
      ? originValue.toLocaleString('en-US', {
          maximumFractionDigits: 20,
          useGrouping: false,
        })
      : originValue;
    sunburst.showValue = formatScientific(showVal, true);
    sunburst.value = Number(originValue);

    if (sunburst.children) {
      sunburst.children = sunburst.children?.map(child =>
        handleSunburstData(child),
      );
    }

    return sunburst;
  };

  /** 旭日图截止比例处理 */
  const handleCutOffRatioChange = (currentCutOffRatio: number) => {
    if (isNaN(currentCutOffRatio)) {
      return;
    }

    /** 小于0.01取0.01 */
    if (currentCutOffRatio < 0.01) {
      setCutOffRatio(0.01);
    }

    /** 大于10取10 */
    if (currentCutOffRatio > 10) {
      setCutOffRatio(10);
    }

    /** 大于0.01且小于等于10取当前值并保留两位小数 */
    if (currentCutOffRatio >= 0.01 && currentCutOffRatio <= 10) {
      const currentCutOff = Number(currentCutOffRatio.toFixed(2));
      setCutOffRatio(currentCutOff);
    }
  };

  /** 旭日图option */
  const optionSunburst = {
    tooltip: {
      trigger: 'item',
      formatter: (params: SunburstDto) => {
        const apiData = params?.data || {};
        let content = '';
        if (apiData) {
          const { name, showValue, unit, ratio, ioType } = apiData;

          /** showValue不存在则是中间的返回按钮 */
          if (showValue) {
            /** 名称 */
            content += `${name || ''}<br>`;

            /** 输入输出展示流类型 */
            if (ioType) {
              content += `${I18N.carbonFootPrintLCA.streamTypeIo}${
                IO_TYPE_NAME?.[Number(ioType)] || '-'
              }<br>`;
            }

            /** 环境影响 */
            content += `${I18N.carbonFootPrintLCA.environmentalImpactS}${
              showValue || '-'
            }${unit || ''}<br>`;

            /** 占比 */
            content += `${I18N.carbonFootPrintLCA.proportionRat}${
              ratio || '-'
            }%`;
          } else {
            content = I18N.carbonFootPrintLCA.returnToThePreviousDisplay;
          }
        }

        return content;
      },
    },
    series: {
      type: 'sunburst',
      emphasis: {
        focus: 'ancestor',
      },
      sort: undefined,
      data: stageImpactAssessmentsDataSunburst,
      radius: [0, '100%'],
      itemStyle: {
        borderRadius: 7,
        borderWidth: 2,
      },
      label: {
        show: true,
        formatter(params: SunburstDto) {
          const apiData = params?.data || {};
          const { name = '', ioType, ratio } = apiData;
          // 小于1%时不展示label
          if (Number(ratio) < 1) {
            return ' ';
          }
          // 内圈
          if (!ioType && name.length > 6) {
            return `${name?.substring(0, 5)}…`;
          }
          // 外圈
          if (!!ioType && name.length > 4) {
            return `${name?.substring(0, 3)}…`;
          }
          return name;
        },
      },
      levels: [
        {},
        {
          r0: '28%',
          r: '72%',
          itemStyle: {
            borderWidth: 2,
          },
          label: {
            align: 'right',
          },
        },
        {
          r0: '72%',
          r: '100%',
        },
      ],
    },
  };

  /** 初始化 */
  const onInit = () => {
    /** 清空基本信息 */
    setPlanInfo({});
    /** 清空整体评价结果 */
    setImpactAssessmentTotalDataSource([]);
    /** 清空生命周期阶段的影响评价 */
    setStageImpactAssessmentsData([]);
    /** 清空生命周期阶段的影响评价-旭日图 */
    setStageImpactAssessmentsDataSunburst([]);
    /** 重置旭日图是否全为0 */
    setSunburstALlZero(false);
    /** 清空当前评价指标 */
    setCurrentAssessmentTarget(undefined);
  };

  /** 点击左侧card的方法 */
  const onClickCard = (plan: ImpactAssessmentListResp) => {
    onInit();
    setPlanInfo(plan);
    setPlanDeletedFlag(false);
    setInfoRefreshFlag(!infoRefreshFlag);
  };

  /** 新增评价方案保存loading */
  const [planAddConfirmLoading, setPlanAddConfirmLoading] = useState(false);

  /** 打开新增评价方案弹窗的方法 */
  const onAddPlan = () => {
    setImpactAssessmentOpen(true);
  };

  /** 删除评价方案的方法 */
  const onDelete = async (cardId: number) => {
    await postImpactAssessmentListDelete({ id: cardId });
    /** 删除的是当前选中的方案时 */
    if (cardId === planId) {
      onInit();
      setPlanDeletedFlag(true);
    }
    Toast('success', I18N.Factors.deleteSuccessful);
    setPlanListRefreshFlag(!planListRefreshFlag);
  };

  /** 获取方案列表 */
  useEffect(() => {
    if (id) {
      setPlanListRefreshLoading(true);
      getImpactAssessmentList({ modelId: id })
        .then(({ data }) => {
          setPlanList(data?.data);
          if (!planDeletedFlag) {
            setPlanInfo(data?.data?.[0]);
          }
        })
        .finally(() => {
          setPlanListRefreshLoading(false);
        });
    }
  }, [id, planListRefreshFlag]);

  useEffect(() => {
    /** 更新版本信息 */
    checkVersion();

    if (planId) {
      /**  整体影响评价结果 */
      getImpactAssessmentTotal({ assessmentId: planId }).then(({ data }) => {
        setShowVersionTip(!!(data?.data && data?.data?.length));
        setImpactAssessmentTotalDataSource(data?.data || []);
      });
    }
  }, [planId, infoRefreshFlag]);

  /** 旭日图 */
  useEffect(() => {
    if (planId && currentAssessmentTarget && cutOffRatio) {
      setEchartsRefreshLoadingSunburst(true);
      getImpactAssessmentDataSunburst({
        assessmentId: planId,
        assessmentTarget: currentAssessmentTarget,
        cutOff: cutOffRatio,
      })
        .then(({ data: result }) => {
          const sunburstData = result?.data;
          /** 检查旭日图是否全为0 */
          checkSunburstDataAllZero(sunburstData);
          /** 处理旭日图数据 */
          const newData = sunburstData?.map(sunburstItem =>
            handleSunburstData(sunburstItem),
          );
          setStageImpactAssessmentsDataSunburst(newData || []);
        })
        .finally(() => {
          setEchartsRefreshLoadingSunburst(false);
        });
    }
  }, [planId, currentAssessmentTarget, cutOffRatio]);

  return (
    <div className={style.wrapper}>
      <div className={style.left}>
        <ProgrammeCards
          loading={planListRefreshLoading}
          planList={planList}
          cardId={planId}
          onClickCard={onClickCard}
          onAddPlan={onAddPlan}
          onDelete={onDelete}
        />
      </div>
      {planId && !planDeletedFlag ? (
        <div className={style.container} key={`impact${planId}`}>
          <div className={style.header}>
            <div className={style.headerLeft}>
              <h3 className={style.headerLeftName}>
                {planInfo?.planName || '-'}
              </h3>
              <div className={style.headerLeftMethod}>
                {I18N.carbonFootPrintLCA.evaluationMethods}
                {planInfo?.assessmentMethodName || '-'}
              </div>
            </div>
            <div>
              {!isDetail && (
                <div className={style.calcBtn}>
                  <Button
                    type='primary'
                    loading={calculateLoading}
                    onClick={async () => {
                      setCalculateLoading(true);
                      try {
                        const { data } = await postImpactAssessmentCalc({
                          id: planId,
                        });
                        if (data?.code === REPONSE_CODE.SUCCESS_TOAST) {
                          Toast(
                            'error',
                            I18N.carbonFootPrintLCA.calculationErrorPlease,
                          );
                        } else {
                          Toast(
                            'success',
                            I18N.carbonFootPrintLCA.calculationCompleted,
                          );
                          setInfoRefreshFlag(!infoRefreshFlag);
                          /** 更新版本信息 */
                          checkVersion();
                          /** 更新生命周期表格 */
                          tableRef?.current?.reloadAndRest?.();
                        }
                      } finally {
                        setCalculateLoading(false);
                      }
                    }}
                  >
                    {I18N.carbonFootPrintLCA.planCalculation}
                  </Button>
                  {showVersionTip && (
                    <div>
                      {versionInfo?.assessmentLatest ? (
                        <div className={style.successTip}>
                          {I18N.carbonFootPrintLCA.currentCalculationResult}
                        </div>
                      ) : (
                        <div className={style.warnTip}>
                          {I18N.carbonFootPrintLCA.noteDetectionOfMold}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={style.impactResult}>
            <div className={style.titleHeader}>
              <h4>{I18N.carbonFootPrintLCA.overallImpactAssessment}</h4>
              <div>
                {!isDetail && (
                  <Button
                    type='primary'
                    size='small'
                    onClick={() => {
                      if (planId) {
                        getExportAssessment({ id: planId }).then(({ data }) => {
                          if (data.data) {
                            saveAs(data.data);
                          }
                        });
                      }
                    }}
                  >
                    {I18N.eca.export}
                  </Button>
                )}
              </div>
            </div>
            <Table
              dataSource={impactAssessmentTotalDataSource}
              columns={changeTableColumnsNoText(impactResultColumns(), '-')}
              pagination={false}
              scroll={{ y: 260 }}
            />
          </div>
          <div className={style.impactAssessment}>
            <div className={style.titleHeader}>
              <h4>{I18N.carbonFootPrintLCA.lifeCycleShadow}</h4>
              <div>
                <LightFilter<ImpactFormType> formRef={impactForm}>
                  <div className={style.filter}>
                    <span>
                      {I18N.carbonFootPrintLCA.selectImpactAssessment}
                    </span>
                    <ProFormSelect
                      width={200}
                      allowClear={false}
                      name='assessmentTarget'
                      placeholder={I18N.Factors.pleaseSelect}
                      params={{
                        infoRefreshFlag,
                        assessmentMethod: planInfo.assessmentMethod,
                        currentTargetArr:
                          planInfo?.assessmentTargetList?.split('|'),
                      }}
                      request={async (params: {
                        assessmentMethod: string;
                        currentTargetArr?: string[];
                      }) => {
                        const { assessmentMethod, currentTargetArr } =
                          params || {};
                        if (assessmentMethod && currentTargetArr) {
                          const { data } = await getDictEnum({
                            dictType: 'AssessmentProposal',
                            pageNum: 1,
                            pageSize: 1000,
                            labelValue: assessmentMethod,
                          });
                          const assessmentTargetOption =
                            data?.data?.map(item => ({
                              label: isEn
                                ? item.dictLabelLanguage
                                : item.dictLabel,
                              value: `${item.sourceType},${item.dictValue}`,
                              unit: item.relatedValue,
                            })) || [];
                          const newAssessmentTargetOption =
                            assessmentTargetOption?.filter(item =>
                              includes(currentTargetArr, item.value),
                            );

                          const firstValue =
                            newAssessmentTargetOption?.[0]?.value || undefined;
                          impactForm?.current?.setFieldValue(
                            'assessmentTarget',
                            firstValue,
                          );

                          setCurrentUnit(
                            newAssessmentTargetOption?.[0]?.unit || '',
                          );

                          setCurrentAssessmentTarget(firstValue);
                          return newAssessmentTargetOption || [];
                        }
                        return [];
                      }}
                      onChange={(v: string, o) => {
                        setCurrentAssessmentTarget(v);
                        setCurrentUnit(o.unit || '');
                      }}
                    />
                  </div>
                </LightFilter>
              </div>
            </div>
            <div className={style.main}>
              {/* 总排放量 */}
              <div className={style.carbonTotalWrap}>
                <span className={style.iconWrap}>
                  <IconFont className={style.icon} icon='icon-ditanguanli' />
                </span>
                <span className={style.totalTitle}>
                  {I18N.carbonFootPrintLCA.totalEmissions}
                </span>
                <span className={style.carbonTotal}>
                  {formatScientific(emissionTotal, true)}
                  <span className={style.unit}>{currentUnit}</span>
                </span>
              </div>
              {/* 图表部分-柱状图 */}
              {stageImpactAssessmentsData &&
              stageImpactAssessmentsData.length > 0 ? (
                <div className={style.chartWrap}>
                  <Spin spinning={echartsRefreshLoading}>
                    <ReactECharts
                      className={style.chart}
                      key={`${planId}bar`}
                      option={optionBar}
                    />
                  </Spin>
                </div>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )}
              {/* 图表部分-旭日图 */}
              <div className={style.cutOff}>
                {I18N.carbonFootPrintLCA.cutOffRatio}
                <InputNumber
                  min={0.01}
                  max={10}
                  precision={2}
                  style={{ width: 130 }}
                  controls={false}
                  value={cutOffRatio}
                  onInput={val => {
                    setCutOffRatioInput(val ? Number(val) : cutOffRatio);
                  }}
                  onBlur={e => {
                    const cutOff = Number(e.target.value);
                    handleCutOffRatioChange(cutOff);
                  }}
                  onKeyPress={e => {
                    // 检查是否按下了回车键
                    if (e.key === 'Enter') {
                      e.preventDefault(); // 阻止默认行为，避免触发onBlur
                      handleCutOffRatioChange(Number(cutOffRatioInput));
                    }
                  }}
                />
              </div>
              {stageImpactAssessmentsDataSunburst &&
              stageImpactAssessmentsDataSunburst.length > 0 &&
              !sunburstALlZero ? (
                <div className={style.chartWrap}>
                  <Spin spinning={echartsRefreshLoadingSunburst}>
                    <ReactECharts
                      className={style.chart}
                      style={{ height: 400 }}
                      key={`${planId}sunburst`}
                      option={optionSunburst}
                    />
                  </Spin>
                </div>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    sunburstALlZero
                      ? I18N.carbonFootPrintLCA.indicatorDataCalculation
                      : I18N.utils.noData
                  }
                />
              )}
            </div>
            {/* 表格部分 */}
            <ProTable<StageImpactAssessment>
              columns={columns(currentUnit)}
              actionRef={tableRef}
              pagination={false}
              search={false}
              columnsState={{
                persistenceKey: 'ProcessModalTable',
                persistenceType: 'localStorage',
                defaultValue: columnsStateDefault,
              }}
              toolBarRender={false}
              params={{
                assessmentId: planId,
                assessmentTarget: currentAssessmentTarget,
              }}
              request={async params => {
                const { assessmentId, assessmentTarget } = params || {};
                if (assessmentId && assessmentTarget) {
                  setEchartsRefreshLoading(true);
                  return getImpactAssessmentData({
                    assessmentId,
                    assessmentTarget,
                  })
                    .then(({ data }) => {
                      setStageImpactAssessmentsData(data?.data || []);
                      const total = data?.data?.[0]?.total || 0;
                      setEmissionTotal(total);
                      return {
                        data: data?.data || [],
                        success: true,
                      };
                    })
                    .finally(() => {
                      setEchartsRefreshLoading(false);
                    });
                }
                return { data: [], success: true };
              }}
            />
          </div>
        </div>
      ) : (
        <PageEmpty
          description={I18N.carbonFootPrintLCA.pleaseSelectASolution}
        />
      )}

      {/* 新增评价方案 */}
      <ImpactAssessmentModal
        open={impactAssessmentOpen}
        confirmLoading={planAddConfirmLoading}
        onCancel={() => {
          setImpactAssessmentOpen(false);
        }}
        onOk={async value => {
          setPlanAddConfirmLoading(true);
          const assessmentValue = {
            ...value,
            modelId: id,
          };
          try {
            await postImpactAssessmentListAdd(assessmentValue);
            setImpactAssessmentOpen(false);
            Toast('success', I18N.Factors.saveSuccessful);
            setPlanListRefreshFlag(!planListRefreshFlag);
          } finally {
            setPlanAddConfirmLoading(false);
          }
        }}
      />

      <FormActions
        className='footWrapper'
        place='center'
        buttons={compact([
          !isDetail && {
            title: I18N.carbonFootPrintLCA.nextStep,
            type: 'primary',
            onClick: async () => {
              onNextStepClick();
            },
          },
          !isDetail && {
            title: I18N.carbonFootPrintLCA.previousStep,
            onClick: async () => {
              onPreviousStepClick();
            },
          },
          isModelInfo && {
            title: I18N.Factors.return,
            onClick: async () => {
              onBackClick();
            },
          },
        ])}
      />
    </div>
  );
};
export default ImpactAssessment;
