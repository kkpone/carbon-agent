/**
 * @description 碳足迹模型的详情(目标与范围、清单分析、影响评价、结果解释)
 */

import I18N from '@src/lang/I18N';
import { Modal, Steps, StepProps, Button, Space } from 'antd';
import './index.less';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';

import CommonHeader from '@/components/CommonHeader';
import { usePageInfo } from '@/hooks';
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import {
  lcaUpdateUrl,
  getSearchParams,
  Toast,
  modelFooterBtnStyle,
} from '@/utils';
import { useNavigate } from '@/utils/polyfill';
import { downloadFile } from '@/views/components/utils';

import DataSetImport from './DataSetImport';
import ImpactAssessment from './ImpactAssessment';
import ListImport from './Import';
import InventoryAnalysis from './InventoryAnalysis';
import ObjectivesAndScope from './ObjectivesAndScope';
import { SYSTEM_BOUNDARY_TYPE } from './ObjectivesAndScope/constant';
import ResultsInterpretation from './ResultsInterpretation';
import { INFO_SOURCE, LIFE_CYCLE_TYPE, STEP_TYPE } from './constant';
import style from './index.module.less';
import BackIcon from '../Image/back.svg';
import BatchMatchModal from '../components/BatchMatchModal';
import { SetMainResearchObjModal } from '../components/SetMainResearchObjModal';
import {
  getCheckBomModel,
  getCheckCalc,
  getCheckSupplyDataModel,
  getExportList,
  getModelCalcStatus,
  getModelDetail,
  postBomModel,
  postCalc,
  postSetMainResearchObj,
  postSupplyDataModel,
} from '../service';
import { ModelInfo } from '../type';

const {
  OBJECTIVES_SCOPE,
  INVENTORY_ANALYSIS,
  IMPACT_ASSESSMENT,
  RESULTS_INTERPRETATION,
} = STEP_TYPE;

const { PRODUCTION_STAGE, PRODUCT_STAGE } = LIFE_CYCLE_TYPE;

const CarbonFootprintModel = () => {
  const navigate = useNavigate();

  /** 模型ID */
  const { id, isDetail } = usePageInfo();

  /** URL 携带的参数 */
  const search = { ...getSearchParams()[0] };

  /** 是否是环境足迹模型跳转过来的详情 是则展示返回 */
  const isModelInfo = search?.source === INFO_SOURCE.LCA_MODEL;

  /** 点击返回按钮的方法  返回到列表页 */
  const onBackClick = () => {
    navigate(LCARouteMaps.lcaModel);
  };

  /** ****************************************** 步骤条部分 ********************************************************/
  /** 步骤条枚举 */
  const [stepOptions, setStepOptions] = useState<StepProps[]>([
    {
      title: I18N.carbonFootPrintLCA.objectivesAndScope,
    },
    {
      title: I18N.carbonFootPrintLCA.inventoryAnalysis,
      disabled: true,
    },
    {
      title: I18N.carbonFootPrintLCA.impactAssessment,
      disabled: true,
    },
    {
      title: I18N.carbonFootPrintLCA.resultInterpretation,
      disabled: true,
    },
  ]);

  /** 当前步骤 */
  const [currentStep, setCurrentStep] = useState<number>(
    Number(search?.currentStep) || OBJECTIVES_SCOPE,
  );

  /** ****************************************** header部分 ********************************************************/
  /** 计算按钮loading */
  const [calculateLoading, setCalculateLoading] = useState(false);
  /** 校验模型计算是否有错误 */
  const [calcError, setCalcError] = useState(false);
  /** 是否展示过程结构图 */
  const [showProcessStructureDiagram, setShowProcessStructureDiagram] =
    useState(false);
  /** 是否展示基准流 */
  const [showBaseLine, setShowBaseLine] = useState(false);
  /** BOM一键建模按钮loading */
  const [bomLoading, setBomLoading] = useState(false);
  /** 供应商数据建模按钮loading */
  const [supplyDataLoading, setSupplyDataLoading] = useState(false);
  /** 背景数据批量匹配弹窗 */
  const [batchMatchOpen, setBatchMatchOpen] = useState(false);
  /** 导出按钮loading */
  const [exportLoading, setExportLoading] = useState(false);
  /** 数据集批量导入的弹窗显隐 */
  const [dataSetImportOpen, setDataSetImportOpen] = useState(false);
  /** 清单导入的弹窗显隐 */
  const [listImportOpen, setListImportOpen] = useState(false);

  /** ****************************************** 模型部分：目标与范围、清单分析 ********************************************************/
  /** 模型详情 */
  const [modelDetail, setModelDetail] = useState<ModelInfo>();
  const {
    orgId,
    productId,
    productName,
    funcUnit,
    baselineNum,
    baselineUnitName,
    lifeCycleList: currentLifeCycleList,
    selectedDb,
    systemBoundaryType,
  } = modelDetail || {};

  /** 主要研究对象默认的生命周期阶段 */
  const defaultMainLifeCycleId =
    systemBoundaryType === SYSTEM_BOUNDARY_TYPE.COMPLETE_LIFE_CYCLE
      ? PRODUCT_STAGE
      : PRODUCTION_STAGE;

  /** 控制主要研究对象配置弹窗 */
  const [mainResearchObjOpen, setMainResearchObjOpen] = useState(false);
  /** 主要研究对象配置弹窗loading */
  const [mainResearchObjLoading, setMainResearchObjLoading] = useState(false);
  /** 清单分析ref */
  const InventoryAnalysisRef = useRef<{
    onClickProcessAdd: () => void;
    onRefresh: () => void;
    onRefreshAllTables: () => void;
  }>();

  /** 获取当前模型计算按钮状态 */
  const getCalcStatus = () => {
    if (!id) return;
    getModelCalcStatus({ id }).then(({ data }) => {
      /** 当前接口返回的loading状态 */
      const currentLoading = !!data?.data?.calculating;

      /** 当前接口返回的errorFlag状态 */
      const errorFlag = !!data?.data?.errorFlag;

      setCalculateLoading(preLoading => {
        /** 当前接口返回的loading状态为false，并且之前的loading状态preBomLoading为true，则说明计算完成，刷新 */
        if (!currentLoading && preLoading) {
          if (errorFlag) {
            Modal.success({
              title: I18N.Factors.prompt,
              icon: '',
              content: (
                <span>
                  {I18N.carbonFootPrintLCA.modelBaselineValue}
                  <span className='warnRed'>
                    {I18N.carbonFootPrintLCA.arithmeticError}
                  </span>
                  {I18N.carbonFootPrintLCA.possibleErrors}
                </span>
              ),
              ...modelFooterBtnStyle,
              okText: I18N.base.confirm,
              cancelText: I18N.Factors.cancel,
              onOk: () => {
                /** 刷新左侧树 */
                InventoryAnalysisRef?.current?.onRefresh();
              },
            });
          } else {
            Toast('success', I18N.carbonFootPrintLCA.calculationCompleted);
            /** 刷新左侧树 */
            InventoryAnalysisRef?.current?.onRefresh();
            /** 刷新表格数据 */
            InventoryAnalysisRef?.current?.onRefreshAllTables();
          }
        }
        return currentLoading;
      });
    });
  };

  /** 获取当前BOM一键建模按钮状态 */
  const getBomModelStatus = () => {
    getCheckBomModel({ modelId: id }).then(({ data }) => {
      /** 当前接口返回的loading状态 */
      const currentBomLoading = !!data?.data;

      setBomLoading(preBomLoading => {
        /** 当前接口返回的loading状态为false，并且之前的loading状态preBomLoading为true，则说明BOM一键建模成功，弹出提示，并刷新清单分析页面 */
        if (!currentBomLoading && preBomLoading) {
          // Toast('success', I18N.carbonFootPrintLCA.bomModeling);
          // InventoryAnalysisRef.current?.onRefresh();
          // 暂时这样写=>TODO解决右侧未刷新问题
          window.location.reload();
        }
        return currentBomLoading;
      });
    });
  };

  /** 获取当前供应商数据建模按钮状态 */
  const getSupplyDataModelStatus = () => {
    getCheckSupplyDataModel({ modelId: id }).then(({ data }) => {
      /** 当前接口返回的loading状态 */
      const currentSupplyDataLoading = !!data?.data;

      setSupplyDataLoading(preSupplyDataLoading => {
        /** 当前接口返回的loading状态为false，并且之前的loading状态preSupplyDataLoading为true，则说明一键建模成功，刷新清单分析页面 */
        if (!currentSupplyDataLoading && preSupplyDataLoading) {
          window.location.reload();
        }
        return currentSupplyDataLoading;
      });
    });
  };

  /** ****************************************** 步骤条 ********************************************************/
  /** 步骤条状态 当没有模型id时，清单分析、影响评价、结果解释禁用 */
  useEffect(() => {
    const arr = stepOptions.map(item => ({
      ...item,
      disabled: !id,
    }));
    setStepOptions([...arr] as StepProps[]);
  }, [currentStep]);

  /** ****************************************** 模型部分：目标与范围、清单分析 ********************************************************/
  /** 获取模型详情 */
  useEffect(() => {
    setModelDetail(undefined);
    if (id) {
      getModelDetail({ id }).then(({ data }) => {
        setMainResearchObjOpen(!data?.data?.mainResearchObjectFlag);
        setModelDetail(data?.data);
      });
      /** 清单分析 - 获取BOM一键建模按钮/供应商建模按钮状态 */
      if (currentStep === INVENTORY_ANALYSIS) {
        getBomModelStatus();
        getSupplyDataModelStatus();
        /** 清单分析-获取当前计算按钮状态 */
        getCalcStatus();
      }
    }
  }, [id, currentStep]);

  return (
    <div>
      <Modal
        className='carbonFootprintModelWrapper'
        destroyOnClose
        mask={false}
        open
        width='100%'
        title={undefined}
        footer={null}
        closable={false}
        transitionName=''
        styles={{
          content: {
            padding: 0,
          },
        }}
        okText={I18N.base.confirm}
        cancelText={I18N.Factors.cancel}
      >
        <div className={style.wrapper}>
          <div className={style.container}>
            {/* 步骤条 */}
            <div className={style.stepWrapper}>
              {(!isDetail || isModelInfo) && (
                <div className={style.backBtn} onClick={() => onBackClick()}>
                  <img className={style.backIcon} src={BackIcon} alt='' />
                  <span className={style.backName}>
                    {I18N.carbonFootPrintLCA.carbonFootprintModel}
                  </span>
                </div>
              )}
              <div className={style.step}>
                <Steps
                  current={currentStep}
                  size='small'
                  responsive={false}
                  items={stepOptions}
                  onChange={currentStepValue => {
                    lcaUpdateUrl({
                      ...search,
                      currentStep: currentStepValue,
                    });
                    setShowBaseLine(false);
                    setShowProcessStructureDiagram(false);
                    setCurrentStep(currentStepValue);
                  }}
                />
              </div>
            </div>

            {/* 头部展示信息 目标与范围时不展示 */}
            {currentStep !== OBJECTIVES_SCOPE && (
              <div className={style.headerWrapper}>
                <div className={style.commonHeaderWrapper}>
                  <CommonHeader
                    basicInfo={[
                      {
                        label: I18N.carbonFootPrintLCA.functionalUnits,
                        value: funcUnit,
                      },
                      {
                        label: I18N.carbonFootPrintLCA.benchmarkFlow,
                        value:
                          baselineNum && baselineUnitName
                            ? `${baselineNum}${baselineUnitName}`
                            : '-',
                      },
                      // {
                      //   label: I18N.carbonData.affiliatedOrganization,
                      //   value: orgName,
                      // },
                    ]}
                  />
                </div>
                {/* 只有清单分析有右侧按钮 */}
                {currentStep === INVENTORY_ANALYSIS && (
                  <div className={style.headerRightBtn}>
                    <Space size='middle' className={style.btnSpace}>
                      {!showProcessStructureDiagram && !isDetail && (
                        <>
                          {!showBaseLine && (
                            <div className={style.modelCheck}>
                              {I18N.carbonFootPrintLCA.modelValidation}
                              <span
                                className={classNames({
                                  [style.modelCheckTextError]: calcError,
                                  [style.modelCheckTextRight]: !calcError,
                                })}
                              >
                                {calcError
                                  ? I18N.carbonFootPrintLCA
                                      .thereIsAnIncorrectConfiguration
                                  : I18N.carbonFootPrintLCA.noErrorsFound}
                              </span>
                            </div>
                          )}
                          {!showBaseLine && (
                            <Button
                              key='calculate'
                              type='primary'
                              loading={calculateLoading}
                              onClick={async () => {
                                setCalculateLoading(true);
                                try {
                                  await postCalc({
                                    modelId: id,
                                  });
                                } finally {
                                  /** 获取当前计算按钮状态 */
                                  getCalcStatus();
                                }
                              }}
                            >
                              {I18N.carbonFootPrintLCA.calculate}
                            </Button>
                          )}

                          <Button
                            key='baseShow'
                            type='primary'
                            onClick={() => {
                              setShowBaseLine(!showBaseLine);
                            }}
                          >
                            {showBaseLine
                              ? I18N.carbonFootPrintLCA.switchRawNumbers
                              : I18N.carbonFootPrintLCA.switchBenchmarkFlow}
                          </Button>
                          {!showBaseLine && (
                            <>
                              {false && (
                                <Button
                                  key='supplyImport'
                                  loading={supplyDataLoading}
                                  onClick={() => {
                                    Modal.confirm({
                                      title: I18N.Factors.prompt,
                                      icon: '',
                                      content: (
                                        <span>
                                          {
                                            I18N.carbonFootPrintLCA
                                              .confirmTheSupply
                                          }
                                        </span>
                                      ),
                                      ...modelFooterBtnStyle,
                                      okText: I18N.base.confirm,
                                      cancelText: I18N.Factors.cancel,
                                      onOk: async () => {
                                        setSupplyDataLoading(true);
                                        try {
                                          await postSupplyDataModel({
                                            id,
                                          });
                                          /** 获取当前供应商数据建模按钮状态 */
                                          getSupplyDataModelStatus();
                                        } catch {
                                          /** 建模失败重置供应商数据建模按钮状态 */
                                          setSupplyDataLoading(false);
                                        }
                                      },
                                    });
                                  }}
                                >
                                  {I18N.carbonFootPrintLCA.supplierData}
                                </Button>
                              )}
                              <Button
                                type='primary'
                                key='bomImport'
                                loading={bomLoading}
                                onClick={() => {
                                  Modal.confirm({
                                    title: I18N.Factors.prompt,
                                    icon: '',
                                    content: (
                                      <span>
                                        {
                                          I18N.carbonFootPrintLCA
                                            .confirmToProceedWithB
                                        }
                                      </span>
                                    ),
                                    ...modelFooterBtnStyle,
                                    okText: I18N.base.confirm,
                                    cancelText: I18N.Factors.cancel,
                                    onOk: async () => {
                                      setBomLoading(true);
                                      try {
                                        await postBomModel({
                                          id,
                                        });
                                        /** 获取当前BOM一键建模按钮状态 */
                                        getBomModelStatus();
                                      } catch {
                                        /** 建模失败重置BOM建模按钮状态 */
                                        setBomLoading(false);
                                      }
                                    },
                                  });
                                }}
                              >
                                {I18N.carbonFootPrintLCA.bomOneClick}
                              </Button>
                              <Button
                                key='importDataSet'
                                onClick={() => {
                                  setDataSetImportOpen(true);
                                }}
                              >
                                {I18N.carbonFootPrintLCA.batchDataset}
                              </Button>
                              <Button
                                type='primary'
                                key='batchMatch'
                                onClick={() => {
                                  setBatchMatchOpen(true);
                                }}
                              >
                                {I18N.carbonFootPrintLCA.backgroundDataBatch}
                              </Button>
                              <Button
                                key='importList'
                                onClick={() => {
                                  Modal.confirm({
                                    title: I18N.Factors.prompt,
                                    icon: '',
                                    content: (
                                      <span>
                                        {I18N.carbonFootPrintLCA.importListWill}
                                        <span className='warnRed'>
                                          {I18N.carbonFootPrintLCA.clearCurrent}
                                        </span>
                                        {
                                          I18N.carbonFootPrintLCA
                                            .pleaseConfirmToContinue
                                        }
                                      </span>
                                    ),
                                    ...modelFooterBtnStyle,
                                    okText: I18N.base.confirm,
                                    cancelText: I18N.Factors.cancel,
                                    onOk: () => {
                                      setListImportOpen(true);
                                    },
                                  });
                                }}
                              >
                                {I18N.carbonFootPrintLCA.importInventory}
                              </Button>
                              <Button
                                key='export'
                                type='primary'
                                loading={exportLoading}
                                onClick={async () => {
                                  if (id) {
                                    setExportLoading(true);
                                    try {
                                      await getExportList({
                                        modelId: id,
                                      }).then(({ data }) => {
                                        if (data.data) {
                                          downloadFile(data.data as string);
                                        }
                                      });
                                    } finally {
                                      setExportLoading(false);
                                    }
                                  }
                                }}
                              >
                                {I18N.carbonFootPrintLCA.exportListQuantity}
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {!showBaseLine && (
                        <Button
                          key='processDiagram'
                          type='default'
                          onClick={() => {
                            setShowProcessStructureDiagram(
                              !showProcessStructureDiagram,
                            );
                          }}
                        >
                          {showProcessStructureDiagram
                            ? I18N.carbonFootPrintLCA.returnListPoints
                            : I18N.carbonFootPrintLCA.processStructureDiagram}
                        </Button>
                      )}
                    </Space>
                  </div>
                )}

                {/* 批量匹配弹窗 */}
                <BatchMatchModal
                  modelId={id}
                  open={batchMatchOpen}
                  lifeCycleListIds={currentLifeCycleList}
                  handleCancel={() => {
                    setBatchMatchOpen(false);
                    /** 刷新页面 */
                    window.location.reload();
                  }}
                />
              </div>
            )}

            {/* 目标与范围 */}
            {currentStep === OBJECTIVES_SCOPE && (
              <ObjectivesAndScope
                isModelInfo={isModelInfo}
                modelDetail={modelDetail}
                onSaveAndNextStepClick={({ id: modelId }) => {
                  lcaUpdateUrl({
                    id: modelId,
                    currentStep: INVENTORY_ANALYSIS,
                  });
                  setCurrentStep(INVENTORY_ANALYSIS);
                }}
                onBackClick={() => onBackClick()}
              />
            )}
            {/* 配置主要研究对象 */}
            {currentStep !== OBJECTIVES_SCOPE &&
              currentLifeCycleList &&
              mainResearchObjOpen &&
              !isDetail && (
                <SetMainResearchObjModal
                  onImport={() => {
                    setListImportOpen(true);
                  }}
                  productName={productName}
                  defaultLifeCycleId={defaultMainLifeCycleId}
                  lifeCycleListIds={currentLifeCycleList}
                  open={mainResearchObjOpen}
                  confirmLoading={mainResearchObjLoading}
                  onCancel={() => {
                    setMainResearchObjOpen(false);
                    lcaUpdateUrl({
                      ...search,
                      currentStep: OBJECTIVES_SCOPE,
                    });
                    setCurrentStep(OBJECTIVES_SCOPE);
                  }}
                  onOk={async val => {
                    try {
                      setMainResearchObjLoading(true);
                      await postSetMainResearchObj({ ...val, modelId: id });
                      Toast(
                        'success',
                        I18N.supplyChainCarbonManagement.operationSuccessful,
                      );
                      setMainResearchObjOpen(false);
                      if (currentStep === INVENTORY_ANALYSIS) {
                        InventoryAnalysisRef?.current?.onRefresh();
                      }
                    } finally {
                      setMainResearchObjLoading(false);
                    }
                  }}
                />
              )}
            {/* 清单分析 */}
            {currentStep === INVENTORY_ANALYSIS && (
              <InventoryAnalysis
                orgId={orgId}
                defaultProductId={productId}
                isModelInfo={isModelInfo}
                showBaseLine={showBaseLine}
                ref={InventoryAnalysisRef}
                lifeCycleListIds={currentLifeCycleList}
                selectedDb={selectedDb}
                onNextStepClick={() => {
                  lcaUpdateUrl({
                    ...search,
                    currentStep: IMPACT_ASSESSMENT,
                  });
                  setCurrentStep(IMPACT_ASSESSMENT);
                }}
                onPreviousStepClick={() => {
                  lcaUpdateUrl({
                    ...search,
                    currentStep: OBJECTIVES_SCOPE,
                  });
                  setCurrentStep(OBJECTIVES_SCOPE);
                }}
                onBackClick={() => onBackClick()}
                showProcessStructureDiagram={showProcessStructureDiagram}
                onCheckCalc={async () => {
                  const { data } = await getCheckCalc({ id });
                  setCalcError(!!data.data);
                }}
              />
            )}
            {/* 影响评价 */}
            {currentStep === IMPACT_ASSESSMENT && (
              <ImpactAssessment
                isModelInfo={isModelInfo}
                onNextStepClick={() => {
                  lcaUpdateUrl({
                    ...search,
                    currentStep: RESULTS_INTERPRETATION,
                  });
                  setCurrentStep(RESULTS_INTERPRETATION);
                }}
                onPreviousStepClick={() => {
                  lcaUpdateUrl({
                    ...search,
                    currentStep: INVENTORY_ANALYSIS,
                  });
                  setCurrentStep(INVENTORY_ANALYSIS);
                }}
                onBackClick={() => onBackClick()}
              />
            )}
            {/* 结果解释 */}
            {currentStep === RESULTS_INTERPRETATION && (
              <ResultsInterpretation
                isModelInfo={isModelInfo}
                onPreviousStepClick={() => {
                  lcaUpdateUrl({
                    ...search,
                    currentStep: IMPACT_ASSESSMENT,
                  });
                  setCurrentStep(IMPACT_ASSESSMENT);
                }}
                onBackClick={() => onBackClick()}
              />
            )}
          </div>
        </div>
      </Modal>
      {/* 导入数据集弹窗 */}
      <DataSetImport
        dataId={id}
        open={dataSetImportOpen}
        handleCancel={() => setDataSetImportOpen(false)}
      />
      {/* 导入清单弹窗 */}
      <ListImport
        dataId={id}
        open={listImportOpen}
        handleCancel={() => {
          setListImportOpen(false);
          window.location.reload();
        }}
      />
    </div>
  );
};
export default CarbonFootprintModel;
