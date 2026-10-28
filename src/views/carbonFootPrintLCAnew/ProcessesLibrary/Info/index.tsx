/**
 * @description 过程建模-清单分析
 */

import I18N from '@src/lang/I18N';
import { Modal } from 'antd';
import { useEffect, useState } from 'react';

import './index.less';

import CommonHeader from '@/components/CommonHeader';
import { FormActions } from '@/components/FormActions';
import { PageEmpty } from '@/components/PageEmpty';
import { usePageInfo } from '@/hooks';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnumsnew';
import { Toast } from '@/utils';
import { useNavigate } from '@/utils/polyfill';
import OutputMultipleRefDrawer from '@/views/carbonFootPrintLCAnew/components/OutputMultipleRefDrawer';

import style from './index.module.less';
import { LIST_OUTPUT_TYPE } from '../../CarbonFootprintModel/Info/constant';
import {
  // getCheckLib,
  // getCheckModelRef,
  getFactorDetail,
  getMatchData,
  getModelDetail,
  getProcessDescDetail,
  getProcessModelIODetail,
  getProcessModelList,
  getProcessModelMultipleRefIODetail,
  getProcessTreeData,
  postProcessDescAdd,
  postProcessDescDelete,
  postProcessDescEdit,
  postProcessFactorIOAdd,
  postProcessFactorIOEdit,
  postProcessModelIOAdd,
  postProcessModelIODelete,
  postProcessModelIOEdit,
} from '../../CarbonFootprintModel/service';
import {
  ModelInfo,
  Process,
  ProcessModelIORes,
} from '../../CarbonFootprintModel/type';
import ChooseAssociateIOModal from '../../components/ChooseAssociateIOModal';
import ChooseDatabaseModal from '../../components/ChooseDatabaseModal';
import { LcaFactor } from '../../components/ChooseDatabaseModal/type';
import ChooseModelIOModal from '../../components/ChooseModelIOModal';
import ChooseModelModal from '../../components/ChooseModelModal';
import { ChooseModel } from '../../components/ChooseModelModal/type';
import ChooseProcessModal from '../../components/ChooseProcessModal';
import { ChooseProcessLibrary } from '../../components/ChooseProcessModal/type';
import ChooseSupplyModal from '../../components/ChooseSupplyModal';
import { ApplyRefDto } from '../../components/ChooseSupplyModal/type';
import { FactorResp } from '../../components/FactorDatabase/type';
import OtherData from '../../components/OtherData';
import ProcessDescribe from '../../components/ProcessDescribe';
import ProcessDescribeDrawer from '../../components/ProcessDescribeDrawer';
import ProcessLeftMenu from '../../components/ProcessLeftMenu';
import {
  NodeAllProps,
  SideBarNode,
} from '../../components/ProcessLeftMenu/type';
import ProcessManageDrawer from '../../components/ProcessManageDrawer';
import { SELECT_BUTTON_TYPE } from '../../components/ProcessManageDrawer/constant';
import { AssociationIo } from '../../components/ProcessManageDrawer/type';
import ProcessManageTable from '../../components/ProcessManageTable';
import { onGetProcessManageColumns } from '../../components/ProcessManageTable/columns';
import { PROCESS_CATEGORY } from '../../components/ProcessManageTable/constant';
import { InputOutput, IoDto } from '../../components/ProcessManageTable/type';
import { QualityBalanceCheck } from '../../components/QualityBalanceCheck';
import SupportFiles from '../../components/SupportFiles';
import { OBJECT_TYPE } from '../../components/SupportFiles/constant';
import { useLcaEnums, useLifeCycleList } from '../../hook';

const { add } = PageTypeInfo;

const ProcessesLibraryInfo = () => {
  const navigate = useNavigate();

  /** 是否是详情 模型ID 过程库id*/
  const { isDetail, id, processLibId } = usePageInfo();

  /** ****************************************** header部分 ********************************************************/
  /** 模型详情 */
  const [modelDetail, setModelDetail] = useState<ModelInfo>();
  const {
    orgId,
    modelName,
    lifeCycleList: currentLifeCycleList,
    selectedDb = '',
  } = modelDetail || {};

  /** 生命周期枚举 */
  const lifeCycleList = useLifeCycleList(
    currentLifeCycleList,
    currentLifeCycleList,
  )?.map(lifeCycle => ({
    label: lifeCycle.stageName,
    value: lifeCycle.id,
  }));

  /** ****************************************** 左侧菜单部分 ********************************************************/
  /** 左侧菜单的宽度 */
  const [currentWidth, setCurrentWidth] = useState<number>();
  /** 当前选中的菜单 */
  const [currentSelectedNode, setCurrentSelectedNode] =
    useState<NodeAllProps>();
  const { key, nodeType, isProcessPage, ioCode, linkType } =
    currentSelectedNode || {};

  /** 是否是因子页面 */
  const isIOFactor = !isProcessPage && nodeType && linkType;

  /** 当前点击的上下游数据/上下游关联对应的左侧菜单key */
  const [processManageUpOrDownStreamKey, setProcessManageUpOrDownStreamKey] =
    useState<string>();
  /** 全部的菜单数据（不隐藏） */
  const [allTreeData, setAllTreeData] = useState<SideBarNode[]>([]);
  /** 菜单数据 */
  const [treeData, setTreeData] = useState<SideBarNode[]>([]);
  /** 左侧树刷新标识 */
  const [treeRefreshFlag, setTreeRefreshFlag] = useState(false);
  /** 左侧树刷新loading */
  const [treeRefreshLoading, setTreeRefreshLoading] = useState(false);

  /** 隐藏其他模型过程按钮开关 */
  const [hiddenOtherModalBtnChecked, setHiddenOtherModalBtnChecked] =
    useState(true);

  /** ****************************************** 过程描述部分 ********************************************************/
  /** 过程id */
  const [processId, setProcessId] = useState<number>();
  /** 过程code */
  const [processCode, setProcessCode] = useState<string>();
  /** 过程描述详情 */
  const [processDescDataSource, setProcessDescDataSource] = useState<Process>();
  /** 新增过程时的默认数据 */
  const [defaultProcessDescData, setDefaultProcessDescData] =
    useState<Process>();
  /** 过程描述操作按钮的类型 */
  const [processDescActionBtnType, setProcessDescActionBtnType] =
    useState<string>();
  /** 控制过程描述详情抽屉的显隐 */
  const [processDescDrawerOpen, setProcessDescDrawerOpen] = useState(false);
  /** 过程描述详情的刷新标识 */
  const [processDescRefreshFlag, setProcessDescRefreshFlag] = useState(false);
  /** 过程删除标识 */
  const [processDeletedFlag, setProcessDeletedFlag] = useState(false);

  /** ****************************************** 过程管理部分 ********************************************************/
  /** 研究对象对应的输入输出类型 */
  const [productIOType, setProductIOType] = useState<number>();
  /** 过程管理表格的操作按钮的类型 */
  const [processManageActionBtnType, setProcessManageActionBtnType] =
    useState<string>();
  /** 当前过程管理表格所在列的id */
  const [processManageColumnId, setProcessManageColumnId] = useState<number>();
  /** 当前过程管理表格所在列的信息 */
  const [processManageColumnInfo, setProcessManageColumnInfo] = useState<{
    isMultipleRef: boolean;
    isChild: boolean;
    isAddConnect: boolean;
    multiMainIoCode?: string;
    unit?: string;
  }>();
  /** 当前过程管理表格的类型 1输入、2 输出 3产品 */
  const [processManageCategoryType, setProcessManageCategoryType] =
    useState<number>();
  /** 控制过程管理详情抽屉的显隐 */
  const [processManageDrawerOpen, setProcessManageDrawerOpen] = useState(false);
  /** 控制过程管理-输出列表-多重引用的主输出的详情抽屉的显隐 */
  const [outputMultipleRefDrawerOpen, setOutputMultipleRefDrawerOpen] =
    useState(false);
  /** 过程管理表格的刷新标识 */
  const [processManageTableRefreshFlag, setProcessManageTableRefreshFlag] =
    useState(false);
  /** linkType类型 */
  const { FACTOR_DATA } = SELECT_BUTTON_TYPE;
  /** 研究对象option */
  const researchObjectOption = useLcaEnums('researchObject')?.map(
    researchObject => ({
      label: researchObject.name,
      value: researchObject.code,
    }),
  );

  /** ****************************************** 过程管理详情部分 ********************************************************/
  /** 过程管理详情 */
  const [processManageDataSource, setProcessManageDataSource] =
    useState<ProcessModelIORes>();
  /** 输入输出名称 */
  const [selectIOName, setSelectIOName] = useState<string>();
  /** 选择的输入输出 */
  const [selectedIO, setSelectedIO] = useState<AssociationIo>();
  /** 选择的过程 */
  const [selectedProcess, setSelectedProcess] =
    useState<ChooseProcessLibrary>();
  /** 控制过程数据-选择过程弹窗的显隐 */
  const [chooseProcessOpen, setChooseProcessOpen] = useState(false);
  /** 控制过程数据-当前模型过程/过程库-选择关联输入输出弹窗的显隐 */
  const [chooseProcessModelIOOpen, setChooseProcessModelIOOpen] =
    useState(false);
  /** 过程数据-当前模型过程/过程库-选择关联输入输出弹窗的类型 */
  const [iOModalType, setIOModalType] = useState<'process' | 'modal'>();
  /** 选择的引用模型 */
  const [selectedModel, setSelectedModel] = useState<ChooseModel>();
  /** 暂时选择的引用模型 */
  const [temporarySelectedModel, setTemporarySelectedModel] =
    useState<ChooseModel>();
  /** 控制模型引用-选择引用模型弹窗的显隐 */
  const [chooseModelOpen, setChooseModelOpen] = useState(false);
  /** 引用模型-选择的关联输入输出 */
  const [selectedModelIO, setSelectedModelIO] = useState<AssociationIo>();
  /** 控制模型引用-选择关联输入输出弹窗的显隐 */
  const [chooseModelIOOpen, setChooseModelIOOpen] = useState(false);
  /** 选择的供应商数据 */
  const [selectedSupply, setSelectedSupply] = useState<ApplyRefDto>();
  /** 控制引用供应商结果数据-选择供应商数据结果弹窗的显隐 */
  const [chooseSupplyOpen, setChooseSupplyOpen] = useState(false);
  /** 选择的数据库数据 */
  const [selectedDatabase, setSelectedDatabase] = useState<LcaFactor>();
  /** 控制模型引用-选择关联输入输出弹窗的显隐 */
  const [chooseDatabaseOpen, setChooseDatabaseOpen] = useState(false);
  /** 过程支撑材料权限 */
  const hasFileAuth = !!checkAuth(
    '/carbonFootPrintLCAnew/processLibrary/processFile',
    true,
  );

  /** ****************************************** 因子数据库部分 ********************************************************/
  /** 因子详情数据 */
  const [factorInfo, setFactorInfo] = useState<FactorResp>();

  /** ****************************************** header部分 ********************************************************/
  /** 获取模型详情 */
  useEffect(() => {
    if (id) {
      getModelDetail({ id }).then(({ data }) => {
        setModelDetail(data?.data);
      });
    }
  }, [id]);

  /** ****************************************** 左侧菜单部分 ********************************************************/
  /** 获取菜单树的数据 */
  useEffect(() => {
    if (id) {
      setTreeRefreshLoading(true);
      getProcessTreeData({
        modelId: id,
        hidden: Number(hiddenOtherModalBtnChecked),
      })
        .then(({ data }) => {
          setTreeData(data?.data?.stageList || []);
        })
        .finally(() => {
          setTreeRefreshLoading(false);
        });
    }
  }, [id, treeRefreshFlag, hiddenOtherModalBtnChecked]);
  /** 获取全部菜单树的数据 */
  useEffect(() => {
    if (id) {
      getProcessTreeData({
        modelId: id,
        hidden: 0,
      }).then(({ data }) => {
        setAllTreeData(data?.data?.stageList || []);
      });
    }
  }, [id, treeRefreshFlag]);

  /** ****************************************** 过程描述部分 ********************************************************/
  /** 获取过程描述详情数据 */
  useEffect(() => {
    if (processId) {
      getProcessDescDetail({ id: processId }).then(({ data }) => {
        setProcessDescDataSource(data?.data);
      });
    } else {
      setProcessDescDataSource({});
    }
  }, [processId, processDescRefreshFlag]);
  /** 过程描述初始化 */
  const onProcessDescInit = () => {
    setProcessDescActionBtnType(undefined);
    setProcessDescDrawerOpen(false);
  };
  /** 过程描述的保存 */
  const onSaveProcessDesc = async (
    formValues: Process,
    successCallBack: () => void,
    failCallBack: () => void,
  ) => {
    const isAdd = processDescActionBtnType === add;
    const postApi = isAdd ? postProcessDescAdd : postProcessDescEdit;
    try {
      await postApi({ modelId: id, ...formValues });
      successCallBack();
      onProcessDescInit();
      setProcessDescRefreshFlag(!processDescRefreshFlag);
      setTreeRefreshFlag(!treeRefreshFlag);
    } catch (e) {
      failCallBack();
      throw e;
    }
  };
  /** 点击新增/编辑过程方法 */
  const onClickProcessActionBtn = (type: string, defaultData?: Process) => {
    setProcessDescActionBtnType(type);
    setProcessDescDrawerOpen(true);
    setDefaultProcessDescData(defaultData || undefined);
  };

  /** ****************************************** 过程管理部分 ********************************************************/
  const { INPUT, OUTPUT } = PROCESS_CATEGORY;
  /** 获取表格数据 */
  const generateDataSource = (allData: InputOutput, tableType: number) => {
    const { researchObjectList, inputList, outputList } = allData;
    let dataSource: IoDto[] = [];
    switch (tableType) {
      case INPUT:
        dataSource = inputList || [];
        break;
      case OUTPUT:
        dataSource =
          outputList?.map(item => {
            const {
              outputType,
              subIoList,
              ioCode: multiMainIoCode,
            } = item || {};
            /** 多重引用主输出 */
            const isMultipleRef = outputType === LIST_OUTPUT_TYPE.MULTI_MAIN;
            if (isMultipleRef) {
              const children =
                subIoList?.map?.(subItem => ({
                  ...subItem,
                  multiMainIoCode,
                  isChild: true,
                  allIndex: ' ',
                  ioName: ' ',
                  dataValue: ' ',
                  baselineValue: ' ',
                  unitName: ' ',
                })) || [];

              return {
                ...item,
                multiMainIoCode,
                isMultipleRef,
                dataType_name: '',
                children,
              };
            }
            return {
              ...item,
              multiMainIoCode,
              isMultipleRef,
            };
          }) || [];
        break;
      default:
        dataSource = researchObjectList || [];
        break;
    }
    return dataSource?.map((item, index) => ({
      ...item,
      allIndex: index + 1,
    }));
  };
  /** 点击过程管理表格删除 */
  const onProcessManageTableDeleteClick = async (
    columnId: number,
    successCallBack: () => void,
  ) => {
    await postProcessModelIODelete({ id: columnId });
    successCallBack();
    setTreeRefreshFlag(!treeRefreshFlag);
    setProcessManageTableRefreshFlag(!processManageTableRefreshFlag);
  };

  /** ****************************************** 过程管理详情部分 ********************************************************/
  /** 获取过程管理详情数据 */
  useEffect(() => {
    if (processManageColumnId) {
      if (processManageColumnInfo?.isMultipleRef) {
        // 多重引用的主输出
        getProcessModelMultipleRefIODetail({ id: processManageColumnId }).then(
          ({ data }) => {
            setProcessManageDataSource(data?.data);
          },
        );
      } else {
        getProcessModelIODetail({ id: processManageColumnId }).then(
          ({ data }) => {
            setProcessManageDataSource(data?.data);
          },
        );
      }
    }
  }, [processManageColumnId]);
  /** 过程管理详情初始化 */
  const onProcessManageInit = () => {
    setProcessManageActionBtnType(undefined);
    setProcessManageColumnId(undefined);
    setProcessManageColumnInfo(undefined);
    setProcessManageCategoryType(undefined);
    setProcessManageDrawerOpen(false);
    setOutputMultipleRefDrawerOpen(false);
    setProcessManageDataSource(undefined);
    setSelectedIO(undefined);
    setIOModalType(undefined);
    setSelectedModel(undefined);
    setTemporarySelectedModel(undefined);
    setSelectedModelIO(undefined);
    setSelectedProcess(undefined);
    setSelectedSupply(undefined);
    setSelectedDatabase(undefined);
  };
  /** 过程管理抽屉数据的保存方法 */
  const onSaveProcessManage = async (
    formValues: ProcessModelIORes,
    successCallBack: () => void,
    failCallBack: () => void,
  ) => {
    /** 是否是新增 */
    const isAdd = processManageActionBtnType === add;
    /** 输入输出-过程数据&模型引用（非自建因子都用这个） */
    let postApi = isAdd ? postProcessModelIOAdd : postProcessModelIOEdit;
    if (formValues.linkType === FACTOR_DATA) {
      /** 输入输出-自建因子 */
      postApi = isAdd ? postProcessFactorIOAdd : postProcessFactorIOEdit;
    }
    try {
      await postApi(formValues);
      successCallBack();
      onProcessManageInit();
      setProcessManageTableRefreshFlag(!processManageTableRefreshFlag);
      setTreeRefreshFlag(!treeRefreshFlag);
      setProcessDescRefreshFlag(!processDescRefreshFlag);
    } catch (e) {
      failCallBack();
      throw e;
    }
  };

  /** ****************************************** 因子数据库部分 ********************************************************/
  /** 因子详情 */
  useEffect(() => {
    if (isIOFactor && ioCode) {
      getFactorDetail({ code: ioCode }).then(({ data }) => {
        setFactorInfo(data?.data);
      });
    }
  }, [isIOFactor, ioCode]);

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
        styles={{
          content: {
            padding: 0,
          },
        }}
        transitionName=''
        okText={I18N.base.confirm}
        cancelText={I18N.Factors.cancel}
      >
        <div className={style.wrapper}>
          {/* 头部展示信息*/}
          <div className={style.headerWrapper}>
            <div className={style.commonHeaderWrapper}>
              <CommonHeader
                basicInfo={[
                  {
                    label: I18N.carbonFootPrintLCA.processSetName,
                    value: modelName,
                  },
                  // {
                  //   label: I18N.carbonData.affiliatedOrganization,
                  //   value: orgName,
                  // },
                ]}
              />
            </div>
            <div className={style.headerRightBtn}>
              {/* <Space size='middle'>
                {!isDetail && (
                  <Button
                    key='addProcess'
                    type='primary'
                    onClick={() => {
                      onClickProcessActionBtn(add);
                    }}
                  >
                    {I18N.carbonFootPrintLCA.newAdditionProcess}
                  </Button>
                )}
              </Space> */}
            </div>
          </div>
          {/* 过程建模部分 */}
          <div className={style.container}>
            <div className={style.left}>
              {/* 菜单 */}
              <ProcessLeftMenu
                isDetail={isDetail}
                processDeletedFlag={processDeletedFlag}
                loading={treeRefreshLoading}
                currentWidth={currentWidth}
                currentSelectedKeys={key ? [key] : undefined}
                processColumnKey={processManageUpOrDownStreamKey}
                treeData={treeData}
                allTreeData={allTreeData}
                hiddenOtherModalBtnChecked={hiddenOtherModalBtnChecked}
                onChangeHiddenOtherModalBtn={isChecked => {
                  setHiddenOtherModalBtnChecked(isChecked);
                }}
                changeCurrentWidth={(changeWidth: number) => {
                  setCurrentWidth(changeWidth);
                }}
                onSelect={selectedNode => {
                  setProcessManageUpOrDownStreamKey(undefined);
                  setProcessId(undefined);
                  setProcessCode(undefined);
                  setProductIOType(undefined);
                  setCurrentSelectedNode(selectedNode);
                  setProcessDeletedFlag(false);
                }}
                onActionBtnClick={onClickProcessActionBtn}
              />
            </div>
            <div
              className={style.right}
              style={{
                width: `calc(100% - ${currentWidth}px)`,
              }}
            >
              {/* 过程数据页面-过程和输入输出（过程数据、模型引用） */}
              {isProcessPage && (
                <div className={style.processDataWrapper}>
                  {/* 过程描述 选中菜单以及展示完整的过程数据展示 */}
                  <div className={style.section}>
                    <ProcessDescribe
                      isLib
                      showActionBtn={!isDetail}
                      showSaveToLibraryBtn={false}
                      processDescDataSource={{
                        processName: processDescDataSource?.processName,
                        systemBoundary: processDescDataSource?.systemBoundary,
                      }}
                      onActionBtnClick={onClickProcessActionBtn}
                      onDeleteProcess={async (callBack: () => void) => {
                        if (!processId) {
                          return;
                        }
                        try {
                          await postProcessDescDelete({ id: processId });
                          Toast('success', I18N.Factors.deleteSuccessful);
                          setTreeRefreshFlag(!treeRefreshFlag);
                          setCurrentSelectedNode(undefined);
                          setProcessDeletedFlag(true);
                        } catch (e) {
                          callBack();
                        }
                      }}
                    />
                  </div>
                  {/* 过程模型-产品、输入、输出 */}
                  {onGetProcessManageColumns().map(process => {
                    const { categoryType, columns } = process || {};
                    return (
                      <div className={style.section} key={categoryType}>
                        <ProcessManageTable
                          productIOType={productIOType}
                          categoryType={categoryType}
                          columns={columns}
                          showActionBtn={!isDetail}
                          refreshFlag={processManageTableRefreshFlag}
                          refreshFlagFn={() => {
                            /** 刷新表格 */
                            setProcessManageTableRefreshFlag(
                              !processManageTableRefreshFlag,
                            );
                            /** 刷新左侧树 */
                            setTreeRefreshFlag(!treeRefreshFlag);
                          }}
                          proTableProps={{
                            rowKey: 'ioId',
                            params: {
                              code: key as string,
                              linkType,
                            },
                            request: async params => {
                              const { code } = params || {};
                              if (!code) {
                                return {
                                  data: [],
                                  success: true,
                                };
                              }
                              return getProcessModelList({
                                code,
                                linkType,
                              })
                                .then(({ data }) => {
                                  const dataSource =
                                    generateDataSource(
                                      data.data,
                                      categoryType,
                                    ) || [];
                                  /** 请求研究对象的同时赋值过程id 过程code */
                                  if (
                                    categoryType === PROCESS_CATEGORY.PRODUCTION
                                  ) {
                                    setProcessId(data.data.processId);
                                    setProcessCode(data.data.processCode);
                                    /** 保存研究对象的输入输出类型=>控制输入输出列表的研究对象是否禁用 */
                                    setProductIOType(dataSource?.[0]?.ioType);
                                  }
                                  return {
                                    data: dataSource,
                                    total: dataSource.length,
                                    success: true,
                                  };
                                })
                                .catch(() => ({
                                  data: [],
                                  total: 0,
                                  success: true,
                                }));
                            },
                          }}
                          onActionBtnClick={(type, columnId, otherInfo) => {
                            const {
                              isMultipleRef,
                              isChild,
                              unit,
                              isAddConnect,
                              multiMainIoCode,
                            } = otherInfo || {};

                            setProcessManageActionBtnType(type);
                            setProcessManageCategoryType(categoryType);
                            setProcessManageColumnId(columnId);

                            /** 多重引用的输出 */
                            setProcessManageColumnInfo({
                              isMultipleRef: !!isMultipleRef,
                              isChild: !!isChild,
                              isAddConnect: !!isAddConnect,
                              multiMainIoCode,
                              unit,
                            });

                            /** 多重引用的主输出编辑 */
                            if (isMultipleRef && !isAddConnect) {
                              setOutputMultipleRefDrawerOpen(true);
                              return;
                            }

                            setProcessManageDrawerOpen(true);
                          }}
                          onProcessDataClick={upDownStreamKey => {
                            setProcessManageUpOrDownStreamKey(upDownStreamKey);
                          }}
                          onProcessManageDeleteClick={
                            onProcessManageTableDeleteClick
                          }
                        />
                      </div>
                    );
                  })}
                  {/* 过程管理-输出列表-多重引用的主输出详情抽屉 */}
                  <OutputMultipleRefDrawer
                    actionBtnType={processManageActionBtnType}
                    categoryType={processManageCategoryType}
                    open={outputMultipleRefDrawerOpen}
                    processManageDataSource={processManageDataSource}
                    processColumnId={processManageColumnId}
                    modelId={id}
                    processCode={processCode}
                    onSave={onSaveProcessManage}
                    onClose={() => onProcessManageInit()}
                  />

                  {/* 过程管理详情抽屉 */}
                  <ProcessManageDrawer
                    processManageColumnInfo={processManageColumnInfo}
                    isProcessesLibraryModule
                    lifeCycleList={lifeCycleList}
                    actionBtnType={processManageActionBtnType}
                    categoryType={processManageCategoryType}
                    open={processManageDrawerOpen}
                    processManageDataSource={processManageDataSource}
                    processColumnId={processManageColumnId}
                    showLifeStageSelectRadio
                    selectedIO={selectedIO}
                    selectedProcess={selectedProcess}
                    selectedModel={selectedModel}
                    selectedModelIO={selectedModelIO}
                    selectedSupply={selectedSupply}
                    selectedDatabase={selectedDatabase}
                    modelId={id}
                    processCode={processCode}
                    onDataTypeChange={() => {
                      setSelectedIO(undefined);
                      setIOModalType(undefined);
                      setSelectedModel(undefined);
                      setTemporarySelectedModel(undefined);
                      setSelectedModelIO(undefined);
                      setSelectedSupply(undefined);
                      setSelectedDatabase(undefined);
                    }}
                    onChooseModalProcessClick={ioName => {
                      setSelectIOName(ioName);
                      setIOModalType('modal');
                      setChooseProcessModelIOOpen(true);
                    }}
                    onChooseProcessClick={ioName => {
                      setSelectIOName(ioName);
                      setChooseProcessOpen(true);
                    }}
                    onChooseModelClick={() => {
                      setChooseModelOpen(true);
                    }}
                    onChooseModelIOClick={() => {
                      setChooseModelIOOpen(true);
                    }}
                    onChooseSupplierClick={() => {
                      setChooseSupplyOpen(true);
                    }}
                    onChooseDatabaseClick={ioName => {
                      setSelectIOName(ioName);
                      setChooseDatabaseOpen(true);
                    }}
                    onClickDataMatch={async (
                      matchData,
                      successCallBack,
                      failCallBack,
                    ) => {
                      setSelectedDatabase(undefined);
                      try {
                        /** 接口匹配数据库数据 */
                        const { data } = await getMatchData({
                          ...matchData,
                          selectedDb,
                        });
                        const result = data?.data || undefined;
                        setSelectedDatabase(result || {});
                        successCallBack(result);
                      } catch {
                        failCallBack();
                      }
                    }}
                    onSave={onSaveProcessManage}
                    onClose={() => onProcessManageInit()}
                  />
                  {/* 过程数据-选择当前模型过程/选择过程库后-选择关联输出/输出弹窗 */}
                  <ChooseAssociateIOModal
                    researchObjectOption={researchObjectOption}
                    iOModalType={iOModalType}
                    selectedProcessModelId={selectedProcess?.modelId}
                    ioName={selectIOName}
                    lifeCycleList={lifeCycleList}
                    categoryType={processManageCategoryType}
                    modelId={id}
                    open={chooseProcessModelIOOpen}
                    handleOk={({
                      selectRows,
                    }: {
                      selectRows: AssociationIo[];
                    }) => {
                      setSelectedIO(selectRows[0]);
                      setChooseProcessModelIOOpen(false);
                      setSelectIOName(undefined);
                    }}
                    handleCancel={() => {
                      setSelectIOName(undefined);
                      setChooseProcessModelIOOpen(false);
                    }}
                  />
                  {/* 过程数据-选择过程库过程弹窗 */}
                  <ChooseProcessModal
                    neLibId={processLibId}
                    open={chooseProcessOpen}
                    handleOk={async ({
                      selectRows,
                    }: {
                      selectRows: ChooseProcessLibrary[];
                    }) => {
                      // 接口校验是否进行 下一步 打开关联输入输出弹窗
                      // await getCheckLib({
                      //   modelId: id,
                      //   selectLibId: Number(selectRows?.[0]?.id),
                      // });
                      setSelectedProcess(selectRows[0]);
                      setChooseProcessOpen(false);

                      setIOModalType('process');
                      setChooseProcessModelIOOpen(true);
                    }}
                    handleCancel={() => setChooseProcessOpen(false)}
                  />
                  {/* 模型引用-选择引用模型弹窗 */}
                  <ChooseModelModal
                    modelId={id}
                    open={chooseModelOpen}
                    handleOk={async ({
                      selectRows,
                    }: {
                      selectRows: ChooseModel[];
                    }) => {
                      // 接口校验是否进行 下一步 打开关联输入输出弹窗
                      // await getCheckModelRef({
                      //   modelId: id,
                      //   selectModelId: Number(selectRows?.[0]?.id),
                      // });
                      setTemporarySelectedModel(selectRows[0]);
                      setChooseModelOpen(false);

                      setChooseModelIOOpen(true);
                    }}
                    handleCancel={() => {
                      setChooseModelOpen(false);
                    }}
                  />
                  {/* 模型引用-选择关联输入输出弹窗 */}
                  <ChooseModelIOModal
                    researchObjectOption={researchObjectOption}
                    selectedModelId={temporarySelectedModel?.id}
                    ioName={selectIOName}
                    lifeCycleList={lifeCycleList}
                    categoryType={processManageCategoryType}
                    modelId={id}
                    open={chooseModelIOOpen}
                    handleOk={({
                      selectRows,
                    }: {
                      selectRows: AssociationIo[];
                    }) => {
                      setSelectedModel(temporarySelectedModel);
                      setSelectedModelIO(selectRows[0]);
                      setChooseModelIOOpen(false);
                    }}
                    handleCancel={() => {
                      setTemporarySelectedModel(selectedModel);
                      setChooseModelIOOpen(false);
                    }}
                  />
                  {/* 引用供应商结果数据-选择供应商结果弹窗 */}
                  <ChooseSupplyModal
                    open={chooseSupplyOpen}
                    handleOk={({
                      selectRows,
                    }: {
                      selectRows: ApplyRefDto[];
                    }) => {
                      setSelectedSupply(selectRows[0]);
                      setChooseSupplyOpen(false);
                    }}
                    handleCancel={() => {
                      setChooseSupplyOpen(false);
                    }}
                  />
                  {/* 数据库数据-手动选择数据弹窗 */}
                  <ChooseDatabaseModal
                    modelId={id}
                    ioName={selectIOName}
                    selectedDb={selectedDb}
                    open={chooseDatabaseOpen}
                    handleOk={({ selectRows }: { selectRows: LcaFactor[] }) => {
                      setSelectedDatabase(selectRows[0]);
                      setChooseDatabaseOpen(false);
                      setSelectIOName(undefined);
                    }}
                    handleCancel={() => {
                      setSelectIOName(undefined);
                      setChooseDatabaseOpen(false);
                    }}
                  />
                  {/* 质量平衡检查 */}
                  <div className={style.section}>
                    <QualityBalanceCheck
                      processDescDataSource={{
                        inputTotal: processDescDataSource?.inputTotal,
                        outputTotal: processDescDataSource?.outputTotal,
                        deviation: processDescDataSource?.deviation,
                      }}
                    />
                  </div>
                  {/* 支撑材料 */}
                  <div className={style.section}>
                    <SupportFiles
                      showActionBtn={!isDetail && hasFileAuth}
                      objectType={OBJECT_TYPE.MODEL_PROCESS}
                      treeNodeId={processId}
                    />
                  </div>
                </div>
              )}
              {/* 过程描述详情抽屉 */}
              <ProcessDescribeDrawer<Process>
                orgId={orgId}
                lifeCycleList={lifeCycleList}
                actionBtnType={processDescActionBtnType}
                open={processDescDrawerOpen}
                processDescDataSource={processDescDataSource}
                defaultProcessDescData={defaultProcessDescData}
                onSave={onSaveProcessDesc}
                onClose={() => onProcessDescInit()}
              />
              {/* 输入输出 */}
              {isIOFactor && (
                <div className={style.fatorDatabaseWrapper}>
                  <OtherData baseInfo={factorInfo} />
                </div>
              )}
              {/* 空页面 */}
              {(!nodeType || !linkType) && (
                <PageEmpty
                  description={
                    processDeletedFlag
                      ? I18N.carbonFootPrintLCA.processDeleted
                      : I18N.utils.noData
                  }
                />
              )}
            </div>
          </div>
        </div>

        <FormActions
          className='footWrapper'
          place='center'
          buttons={[
            {
              title: I18N.Factors.return,
              onClick: async () => {
                navigate(LCARouteMaps.lcaProcessLibrary);
              },
            },
          ]}
        />
      </Modal>
    </div>
  );
};

export default ProcessesLibraryInfo;
