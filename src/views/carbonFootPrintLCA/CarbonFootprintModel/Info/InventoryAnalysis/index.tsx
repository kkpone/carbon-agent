/**
 * @description 清单分析
 */

import { GraphData } from 'g6-5';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { compact } from 'lodash-es';
import {
  Ref,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { FormActions } from '@/components/FormActions';
import { PageEmpty } from '@/components/PageEmpty';
import { usePageInfo } from '@/hooks';
import { checkAuth } from '@/layout/utills';
import { PageTypeInfo } from '@/router/utils/enums';
import { Toast } from '@/utils';
import ChooseAssociateIOModal from '@/views/carbonFootPrintLCA/components/ChooseAssociateIOModal';
import ChooseDatabaseModal from '@/views/carbonFootPrintLCA/components/ChooseDatabaseModal';
import { LcaFactor } from '@/views/carbonFootPrintLCA/components/ChooseDatabaseModal/type';
import ChooseModelIOModal from '@/views/carbonFootPrintLCA/components/ChooseModelIOModal';
import ChooseModelModal from '@/views/carbonFootPrintLCA/components/ChooseModelModal';
import { ChooseModel } from '@/views/carbonFootPrintLCA/components/ChooseModelModal/type';
import ChooseProcessModal from '@/views/carbonFootPrintLCA/components/ChooseProcessModal';
import { ChooseProcessLibrary } from '@/views/carbonFootPrintLCA/components/ChooseProcessModal/type';
import ChooseSupplyModal from '@/views/carbonFootPrintLCA/components/ChooseSupplyModal';
import { ApplyRefDto } from '@/views/carbonFootPrintLCA/components/ChooseSupplyModal/type';
import { FactorResp } from '@/views/carbonFootPrintLCA/components/FactorDatabase/type';
import OtherData from '@/views/carbonFootPrintLCA/components/OtherData';
import OutputMultipleRefDrawer from '@/views/carbonFootPrintLCA/components/OutputMultipleRefDrawer';
import ProcessDescribe from '@/views/carbonFootPrintLCA/components/ProcessDescribe';
import ProcessDescribeDrawer from '@/views/carbonFootPrintLCA/components/ProcessDescribeDrawer';
import ProcessLeftMenu from '@/views/carbonFootPrintLCA/components/ProcessLeftMenu';
import {
  NodeAllProps,
  SideBarNode,
} from '@/views/carbonFootPrintLCA/components/ProcessLeftMenu/type';
import ProcessManageDrawer from '@/views/carbonFootPrintLCA/components/ProcessManageDrawer';
import { SELECT_BUTTON_TYPE } from '@/views/carbonFootPrintLCA/components/ProcessManageDrawer/constant';
import { AssociationIo } from '@/views/carbonFootPrintLCA/components/ProcessManageDrawer/type';
import ProcessManageTable from '@/views/carbonFootPrintLCA/components/ProcessManageTable';
import { onGetProcessManageColumns } from '@/views/carbonFootPrintLCA/components/ProcessManageTable/columns';
import { PROCESS_CATEGORY } from '@/views/carbonFootPrintLCA/components/ProcessManageTable/constant';
import {
  InputOutput,
  IoDto,
} from '@/views/carbonFootPrintLCA/components/ProcessManageTable/type';
import { QualityBalanceCheck } from '@/views/carbonFootPrintLCA/components/QualityBalanceCheck';
import SupportFiles from '@/views/carbonFootPrintLCA/components/SupportFiles';
import { OBJECT_TYPE } from '@/views/carbonFootPrintLCA/components/SupportFiles/constant';
import { useLcaEnums, useLifeCycleList } from '@/views/carbonFootPrintLCA/hook';

import style from './index.module.less';
import ProcessStructureDiagram from '../../components/ProcessStructureDiagram';
import { transformData } from '../../components/ProcessStructureDiagram/until';
import { SaveProcessToLibraryModal } from '../../components/SaveProcessToLibraryModal';
import {
  getProcessTreeData,
  postProcessDescEdit,
  getProcessDescDetail,
  getProcessModelList,
  postProcessModelIODelete,
  postProcessModelIOAdd,
  postProcessModelIOEdit,
  getProcessModelIODetail,
  getFactorDetail,
  postProcessDescDelete,
  postProcessDescAdd,
  getStructureChart,
  postProcessFactorIOAdd,
  postProcessFactorIOEdit,
  postSaveToLibrary,
  // getCheckLib,
  // getCheckModelRef,
  getMatchData,
  getProcessModelMultipleRefIODetail,
} from '../../service';
import { Process, ProcessModelIORes } from '../../type';
import { LIST_OUTPUT_TYPE } from '../constant';

interface InventoryAnalysisProps {
  /** 当前选择的组织id */
  orgId?: number;
  /** 当前选择的产品id */
  defaultProductId?: number;
  /** 数据库ids */
  selectedDb?: string;
  /** 是否展示基准流 */
  showBaseLine?: boolean;
  /** 点击下一步的方法 */
  onNextStepClick: () => void;
  /** 点击上一步的方法 */
  onPreviousStepClick: () => void;
  /** 返回的方法 */
  onBackClick: () => void;
  /** 展示过程结构图 */
  showProcessStructureDiagram?: boolean;
  /** 生命周期id列表 */
  lifeCycleListIds?: string;
  /** 是否是环境足迹模型跳转 */
  isModelInfo?: boolean;
  /** 检查模型是否计算错误 */
  onCheckCalc?: () => void;
}

const { add } = PageTypeInfo;

const InventoryAnalysis = (
  {
    orgId,
    defaultProductId,
    selectedDb = '',
    showBaseLine,
    onNextStepClick,
    onPreviousStepClick,
    onBackClick,
    showProcessStructureDiagram,
    lifeCycleListIds,
    isModelInfo,
    onCheckCalc,
  }: InventoryAnalysisProps,
  ref?: Ref<unknown>,
) => {
  /** id-模型id */
  const { isDetail, id } = usePageInfo();

  /** 生命周期枚举 */
  const lifeCycleList = useLifeCycleList(
    lifeCycleListIds,
    lifeCycleListIds,
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
  /** 控制保存到库弹窗的显隐 */
  const [saveProcessToLibOpen, setSaveProcessToLibOpen] = useState(false);
  /** 控制保存到库弹窗确定按钮的loading */
  const [saveToLibLoading, setSaveToLibLoading] = useState(false);

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

  /** 刷新过程管理（产品、输入、输出）表格的方法 */
  const onRefreshProcessManageTable = () => {
    setProcessManageTableRefreshFlag(!processManageTableRefreshFlag);
  };

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
    '/carbonFootprintLCA/model/processFile',
    true,
  );

  /** ****************************************** 因子数据库部分 ********************************************************/
  /** 因子详情数据 */
  const [factorInfo, setFactorInfo] = useState<FactorResp>();

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
      /** 更新模型校验 */
      onCheckCalc?.();
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
    onRefreshProcessManageTable();
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
      onRefreshProcessManageTable();
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

  /** ****************************************** 过程结构图部分 ********************************************************/
  /** 过程结构图数据 */
  const [diagramData, setDiagramData] = useState<GraphData>();

  /** 获取过程结构图数据 */
  const getDiagramData = () => {
    getStructureChart({ modelId: id }).then(({ data }) => {
      if (data.data) {
        const newData = transformData(data.data);
        setDiagramData(newData);
      }
    });
  };
  useEffect(() => {
    if (showProcessStructureDiagram) {
      getDiagramData();
    }
  }, [showProcessStructureDiagram]);

  /** ****************************************** 暴露组件方法 ********************************************************/
  /** 暴露组件方法 接受外部获取的ref */
  useImperativeHandle(ref, () => ({
    /** 点击新增过程方法 */
    onClickProcessAdd: () => {
      onClickProcessActionBtn(add);
    },
    /** 刷新左侧树的方法 */
    onRefresh: () => {
      setTreeRefreshFlag(!treeRefreshFlag);
    },
    /** 刷新产品、输入、输出表格的方法 */
    onRefreshAllTables: onRefreshProcessManageTable,
  }));

  return (
    <div
      className={classNames(style.wrapper, {
        [style.diagramWrapper]: showProcessStructureDiagram,
      })}
    >
      <div
        className={classNames(style.container, {
          [style.hiddenProcess]: showProcessStructureDiagram,
        })}
      >
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
                  showActionBtn={!isDetail && !showBaseLine}
                  showSaveToLibraryBtn
                  processDescDataSource={{
                    processName: processDescDataSource?.processName,
                    systemBoundary: processDescDataSource?.systemBoundary,
                  }}
                  onActionBtnClick={onClickProcessActionBtn}
                  onSaveToLibraryFn={() => {
                    if (processCode) {
                      setSaveProcessToLibOpen(true);
                    }
                  }}
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
              {/* 保存到库弹窗 */}
              <SaveProcessToLibraryModal
                confirmLoading={saveToLibLoading}
                open={saveProcessToLibOpen}
                onCancel={() => {
                  setSaveProcessToLibOpen(false);
                }}
                onOk={async values => {
                  setSaveToLibLoading(true);
                  try {
                    await postSaveToLibrary({ ...values, processCode });
                    Toast('success', I18N.carbonFootPrintLCA.saveToLibrary);
                    setSaveProcessToLibOpen(false);
                  } finally {
                    setSaveToLibLoading(false);
                  }
                }}
              />
              {/* 过程模型-产品、输入、输出 */}
              {onGetProcessManageColumns().map(process => {
                const { categoryType, columns } = process || {};
                return (
                  <div className={style.section} key={categoryType}>
                    <ProcessManageTable
                      showBaseLine={showBaseLine}
                      productIOType={productIOType}
                      categoryType={categoryType}
                      columns={columns}
                      showActionBtn={!isDetail && !showBaseLine}
                      refreshFlag={processManageTableRefreshFlag}
                      refreshFlagFn={() => {
                        /** 刷新表格 */
                        onRefreshProcessManageTable();
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
                                generateDataSource(data.data, categoryType) ||
                                [];
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
                showBaseLine={showBaseLine}
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
                showBaseLine={showBaseLine}
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
                handleOk={({ selectRows }: { selectRows: AssociationIo[] }) => {
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
                handleOk={({ selectRows }: { selectRows: AssociationIo[] }) => {
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
                handleOk={({ selectRows }: { selectRows: ApplyRefDto[] }) => {
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
                  showActionBtn={!isDetail && !showBaseLine && hasFileAuth}
                  objectType={OBJECT_TYPE.MODEL_PROCESS}
                  treeNodeId={processId}
                />
              </div>
            </div>
          )}
          {/* 过程描述详情抽屉 */}
          <ProcessDescribeDrawer<Process>
            orgId={orgId}
            defaultProductId={defaultProductId}
            showReportDisclosureField
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

      {/* 过程结构图 */}
      {showProcessStructureDiagram && (
        <div className={style.diagramWrapper}>
          {diagramData ? (
            <ProcessStructureDiagram diagramData={diagramData} />
          ) : (
            <PageEmpty />
          )}
        </div>
      )}

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
export default forwardRef(InventoryAnalysis);
