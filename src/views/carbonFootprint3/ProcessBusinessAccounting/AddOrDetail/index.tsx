/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-29 14:49:20
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-29 21:05:30
 * @Date: 2023-03-10 10:00:12
 * @@description: 过程核算 - 新增 编辑 详情
 */
import { checkPermissions } from '@src/components/Permission/utils';
import IconFont, { IconAlibaba } from '@src/components/iconfont';
import I18N from '@src/lang/I18N';
import { virtualLinkTransform } from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { PageInfoType } from '@src/router/type';
import { POST019458d093852b75a996ddb8bf0570f1 } from '@src/sdks_v2/footprint3V2ApiDocs';
import { replaceParamVal } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import { Button, Modal, Select, Spin, Steps } from 'antd';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import styles from './index.module.less';
import '../index.less';
import { ProcessBusinessAccountingAddOrDetailProps } from './type';
import { ProcessModelGraph } from '../../BusinessAccountingModel/addBasic/components/Graph';
import {
  NodeData,
  TagName,
} from '../../BusinessAccountingModel/addBasic/components/Graph/types';
import { isFold } from '../../BusinessAccountingModel/addBasic/components/Graph/utils';
import {
  MODEL_EMISSION_MATCH_WAY,
  MODEL_EMISSION_REQUEST_STATE,
} from '../../BusinessAccountingModel/constant';
import { getProcessAccountView } from '../../QuickBusinessAccounting/AccountGraph/service';
import { ProcessEveryList } from '../../QuickBusinessAccounting/AccountGraph/type';
import { QuickBusinessAccountingInfo } from '../../QuickBusinessAccounting/type';
import EmissionDrawer from '../../component/AccessoryDrawer/EmissionDrawer';
import {
  getProcessAccountEmissionInfo,
  getProcessAccountInDetail,
  postProcessAccountEmissionInAdd,
  postProcessAccountInAddAndRequest,
  postProcessAccountInEmissionEdit,
  postProcessAccountInEditAndRequest,
} from '../../component/AccessoryDrawer/EmissionDrawer/service';
import { Emission } from '../../component/AccessoryDrawer/EmissionDrawer/type';
import AccessoryExportDrawer from '../../component/AccessoryDrawer/ExportDrawer';
import {
  postProcessVisualizationOutsAdd,
  postProcessVisualizationOutsList,
} from '../../component/AccessoryDrawer/ExportDrawer/service';
import AccessoryOutPutDrawer from '../../component/AccessoryDrawer/OutPutDrawer';
import { postProcessVisualizationOutPutsList } from '../../component/AccessoryDrawer/OutPutDrawer/service';
import { AccessoryOutPutData } from '../../component/AccessoryDrawer/OutPutDrawer/type';
import ProcessDrawer from '../../component/AccessoryDrawer/ProcessDrawer';
import { postProcessVisualizationInAdd } from '../../component/AccessoryDrawer/ProcessDrawer/service';
import AccessoryProductDrawer from '../../component/AccessoryDrawer/ProductDrawer';
import {
  postProcessVisualizationProductsAdd,
  postProcessVisualizationProductsList,
} from '../../component/AccessoryDrawer/ProductDrawer/service';
import { AccessoryProductData } from '../../component/AccessoryDrawer/ProductDrawer/type';
import TextOverflowTable from '../../component/TextOverflowTable';
import TextWidthOverflow from '../../component/TextOverflowTable/byWidth';
import { MATCH_WAY, MATCH_WAY_LABEL } from '../../discharge/process/constant';
import { GRAPH_SHAPE_NAME } from '../../graph/constant';
import {
  LIST_OR_GRAPH_VAL,
  PROCESS_ACCOUNT_SCOPED,
  PROCESS_ACCOUNT_SCOPED_LABEL,
  PROCESS_URL_PARAMS_KEY,
  STEP_OPTION,
  STEP_OPTION_LABEL,
  STEP_OPTION_VALUE,
} from '../../util/constant';
import ProcessBusinessAccountingAddBasic from '../AddBasic';
import CarbonFootprintResult from '../CarbonFootprintResult';
import { ShareModelSubmitButton } from '../../component/ShareModelSubmitButton';
import ProcessBusinessAccountingManagement from '../Management';
import { ProcessApiProduct } from '../VisualizationDrawer/type';
import { PROCESS_MATCH_TYPE } from '../constant';
import {
  getProcessAccountingInfo,
  postProcessAccountFinish,
  postProcessAccountUpadteScope,
  postProcessVisualizationInEdit,
} from '../service';

import { UnorderedListOutlined } from '@ant-design/icons';
import { Form } from '@formily/core';

const { INFO_ID, INFO_IS_EDIT, SCOPE_VALUE, LIST_OR_GRAPH } =
  PROCESS_URL_PARAMS_KEY;

const { GRAPH, LIST } = LIST_OR_GRAPH_VAL;
const { HALF, FULL } = PROCESS_ACCOUNT_SCOPED;
const { BASIC, MODEL, RESULT } = STEP_OPTION_VALUE;
const { FACTOR, PROCESS, SUPPLIER } = PROCESS_MATCH_TYPE;

const ProcessBusinessAccountingAddOrDetail = ({
  id,
}: ProcessBusinessAccountingAddOrDetailProps) => {
  const paramsUrl = useParams<{ id: string }>();

  const childGrapRef = useRef<{
    resetGraph: () => Promise<any>;
  }>(null);

  const childBasicRef = useRef<{
    goNextStep: (needGoStep: number) => Promise<boolean>;
  }>(null);

  const history = useHistory();
  const { pathname } = history.location;

  const isCopy = pathname.includes('copy');

  const paramsQuery = new URLSearchParams(location.search);

  const infoId = paramsQuery.get(INFO_ID) || undefined;

  const listOrGraph = paramsQuery.get(LIST_OR_GRAPH) || undefined;

  const infoIsEdit = paramsQuery.get(INFO_IS_EDIT) || undefined;

  const socpeValue = paramsQuery.get(SCOPE_VALUE) || undefined;

  const [processId, setProcessId] = useState<number | null>(null);

  /** 是否是根节点 */
  const [isRootProcessNode, setIsRootProcessNode] = useState(false);

  /** 产品的侧滑抽屉 */
  const [productVisible, setProductVisible] = useState(false);
  const [productDrawerLoading, setProductDrawerLoading] = useState(false);
  const [productInitValues, setProductInitValues] =
    useState<AccessoryProductData[]>();

  /** 产出物的侧滑抽屉 */
  const [outPutVisible, setOutPutVisible] = useState(false);
  const [outPutDrawerLoading, setOutPutDrawerLoading] = useState(false);
  const [outPutInitValues, setOutPutInitValues] =
    useState<AccessoryOutPutData[]>();

  /** 排放源 EmissionDrawer Props */
  const [emissionDrawerVisible, setEmissionDrawerVisible] = useState(false);
  const [emissionDrawerTitle, setEmissionDrawerTitle] = useState<string>();
  const [emissionDrawerLoading, setEmissionDrawerLoading] = useState(false);
  const [emissionInitialValues, setEmissionInitialValues] =
    useState<Emission>();
  const [stage, setStage] = useState<number>();
  const [emissionId, setEmissionId] = useState<number>();
  const [defaultMatchWay, setDefaultMatchWay] = useState<number>();
  const [matchWayOptions, setMatchWayOptions] =
    useState<{ value: number; label: string }[]>();
  const [, setEmissionDrawerFormMounted] = useState(false);

  const emissionDrawerRef = useRef<{
    form: Form<Record<string, any>>;
    getFormatterFormValues: () => Promise<Emission>;
  }>(null);

  /** 单元过程Drawer Props */
  const [processDrawerVisible, setProcessDrawerVisible] = useState(false);
  const [processDrawerEdit, setProcessDrawerEdit] = useState(false);
  const [processDrawerLoading, setProcessDrawerLoading] = useState(false);
  const [processInitialValues, setProcessInitialValues] =
    useState<Record<string, any>>();

  /** 输出的侧滑抽屉 */
  const [exportVisible, setExportVisible] = useState(false);
  const [exportDrawerLoading, setExportDrawerLoading] = useState(false);
  const [exportInitValues, setExportInitValues] =
    useState<ProcessApiProduct[]>();

  // 是否是可视化状态
  const [isVisualState, setIsVisualState] = useState(() => {
    // 链接上如果存在的话,优先按照链接上的为准
    if (socpeValue && listOrGraph && listOrGraph === `${GRAPH}`) {
      return true;
    }

    if (socpeValue && !listOrGraph) {
      return true;
    }

    return false;
  });
  const [isEdit] = useState<boolean>(() => {
    if (infoIsEdit) {
      return true;
    }
    return false;
  });

  const [clickModelValue, setClickModelValue] = useState<NodeData['value']>();

  const [stepValue, setStepValue] = useState<number>(() => {
    // 链接上如果存在的话,优先按照链接上的为准
    if (socpeValue) {
      return Number(socpeValue);
    }

    // 如果是保存过的话就进入建模
    if (infoId && infoIsEdit) {
      return STEP_OPTION[1].value;
    }

    return STEP_OPTION[0].value;
  });

  /** 基本信息 */
  const [processBasic, setProcessBasic] =
    useState<QuickBusinessAccountingInfo>();

  /** 切换步骤条 - 内容的loading */
  const [stepLoading, setStepLoading] = useState(false);

  /** 切换生命周期 */
  const [scopeVal, setScopeVal] = useState<number>();

  /** 核算管理页面的id */
  const [managementId, setManagementId] = useState<string | undefined>(
    id || infoId,
  );

  /** 当前点击节点父节点的信息 */
  const [parentNodeInfo, setParentNodeInfo] = useState<NodeData>();

  /**
   * @description: 获取过程详情
   */
  const getProcessInfo = async (backId?: string) => {
    if (managementId) {
      const data = await getProcessAccountingInfo({
        id: backId || managementId,
      });
      setProcessBasic(data.data.data);
      setScopeVal(data.data.data.scope);
    }
  };

  /**
   * @description: 切换步骤条
   * @param {number} current 点击步骤
   */
  const changeStep = async (current: number, backId?: number) => {
    const status = await childBasicRef.current?.goNextStep(current);

    // 存在status，说明基础信息没有保存编辑的信息，需要弹框提示
    if (status) return;

    if (backId) {
      setStepValue(current);
    }
    if (current === 1 && !managementId) {
      Toast('warn', I18N.carbonFootprint3.pleaseFirstConvertTheBasic);
      return;
    }

    if (current === 2 && !managementId) {
      Toast('warn', I18N.carbonFootprint3.pleaseFirstConvertTheBasic);
      return;
    }

    setStepValue(current);
  };

  /**
   * @description: 判断基础信息是否编辑状态，切换到指定步骤
   * @param {number} current 需要切换的目标步骤
   * @param {number} backId 携带的id
   */
  const changeStepBack = async (current: number, backId: number) => {
    setStepLoading(true);
    setManagementId(`${backId}`);
    getProcessInfo(`${backId}`);
    setStepValue(current);
    setStepLoading(false);
  };

  /**
   * @description: 切换生命周期
   * @param {number} value
   */
  const changeScope = async (value: number, backId?: number) => {
    setStepLoading(true);
    if (managementId) {
      await postProcessAccountUpadteScope({
        id: backId ? `${backId}` : managementId,
        scope: value,
      });
      await getProcessInfo();
      setScopeVal(value);
      // 生命周期变化更新画布
      childGrapRef.current?.resetGraph();
    }
    setStepLoading(false);
  };

  /**
   * 提交基础信息的回调
   * @param backId 提交基础信息返回的id
   */
  const subBasicInfo = (backId: number) => {
    setStepLoading(true);
    setManagementId(`${backId}`);
    getProcessInfo(`${backId}`);
    changeStep(STEP_OPTION[1].value, backId);
    setStepLoading(false);
  };

  /**
   * @description: 是否建模
   */
  const isBuildModel = useCallback(() => {
    if (Number(socpeValue) === 0) {
      return true;
    }
    if (!managementId) return true;
    return false;
  }, [managementId, socpeValue]);

  /**
   * @description: 是否碳足迹结果
   */
  const isFinishEnd = useCallback(() => {
    if (Number(socpeValue) === 2) {
      return false;
    }
    return true;
  }, [socpeValue]);

  const getProcessAccountListCheck = (data: ProcessEveryList) => {
    let backArr: ProcessEveryList[] = [];

    if (data.children && data.children.length > 0) {
      data.children.forEach(child => {
        backArr = [...backArr, ...getProcessAccountListCheck(child)];
      });
    } else {
      backArr.push(data);
    }

    return backArr;
  };

  /**
   * @description 校验所有的排放源是否信息完整
   */
  const checkEmissions: () => Promise<boolean> = async () => {
    try {
      if (infoId) {
        const resp = await getProcessAccountView({ id: infoId });
        const emissionList = getProcessAccountListCheck(resp.data.data);

        return emissionList
          .filter(
            emission =>
              emission.matchType !== MODEL_EMISSION_MATCH_WAY.SUPPLIER,
          )
          .every(emission => emission.emissionTotal !== null);
      }
      return false;
    } catch {
      return false;
    }
  };

  /**
   * @description: 生成碳足迹结果
   */
  const createFinishReport = async () => {
    if (managementId) {
      if (await checkEmissions()) {
        await postProcessAccountFinish({ id: managementId });
        const nUrl = replaceParamVal(SCOPE_VALUE, 2);
        window.history.replaceState(null, '', nUrl);
        setStepValue(RESULT);
        Toast('success', I18N.carbonFootprint3.successfullyGeneratedCarbon);
      } else {
        Toast('warn', I18N.carbonFootprint3.pleaseFillInTheInformation);
      }
    }
  };

  /**
   * @description: 生成报告
   */
  const goAddReport = () => {
    if (processBasic) {
      history.push(
        virtualLinkTransform(
          RouteMapsCorbonFootprint3.carbonFootprint3ProcessReportInfo,
          [':pageInfoType', ':id', ':comparisonId'],
          [PageInfoType.add, processBasic.id, 'null'],
        ),
      );
    }
  };

  /**
   * @description: 提交或者关闭抽屉后的回调
   */
  const closeDrawerBackCall = () => {
    setClickModelValue(undefined);
    if (clickModelValue) {
      // NOTE 后端不好实现添加因子后展开节点，所以改为前端添加数据后展开该节点
      // 顶级节点不调用折叠接口
      if (!isFold(clickModelValue)) {
        childGrapRef.current?.resetGraph();
        return;
      }
      // 展开当前节点
      POST019458d093852b75a996ddb8bf0570f1({
        id: clickModelValue.dataId,
        status: 1,
      }).finally(() => {
        childGrapRef.current?.resetGraph();
      });
    }
  };

  /**
   * @description: 从接口获取产品的回显信息
   */
  const getProductInitValues = async (nodeInfo: NodeData['value']) => {
    if (nodeInfo) {
      const { dataId, parentId } = nodeInfo;

      const { data } = await postProcessVisualizationProductsList({
        dataId,
        parentId,
      });

      return data.data.processProducts;
    }

    return undefined;
  };

  /**
   * @description: 编辑产品
   */
  const editProduct = async (nodeInfo: NodeData['value']) => {
    setProductDrawerLoading(true);
    setProductVisible(true);

    const data = await getProductInitValues(nodeInfo);
    setProductInitValues(data);
    setProductDrawerLoading(false);
  };

  /**
   * @description: 提交产品
   * @param {Record} productArr 当前整理好的提交产品数据
   */
  const subProduct = async (productArr: Record<string, any>[]) => {
    if (clickModelValue) {
      setProductDrawerLoading(true);

      const { dataId, parentId } = clickModelValue;

      try {
        const { data } = await postProcessVisualizationProductsAdd({
          dataId,
          parentId,
          processProducts: productArr,
        });

        if (data.code === 200) {
          setProductVisible(false);
          setProductDrawerLoading(false);
          closeDrawerBackCall();
        }
      } catch (e) {
        setProductDrawerLoading(false);
      }
    }
  };
  /**
   * @description: 从接口获取产品的回显信息
   */
  const getOutPutInitValues = async (nodeInfo: NodeData['value']) => {
    if (nodeInfo) {
      const { dataId, parentId } = nodeInfo;

      const { data } = await postProcessVisualizationOutPutsList({
        dataId,
        parentId,
      });

      return data.data.processProducts;
    }

    return undefined;
  };

  /**
   * @description: 从接口获取输出的回显信息
   */
  const getExportInitValues = async (nodeInfo: NodeData['value']) => {
    if (nodeInfo) {
      const { dataId, parentId } = nodeInfo;

      const { data } = await postProcessVisualizationOutsList({
        dataId,
        parentId,
      });

      return data.data.processOuts;
    }

    return undefined;
  };

  /**
   * @description: 提交产出物
   * @param {Record} outPutArr 产出物数据
   */
  const subOutPut = async (outPutArr: Record<string, any>[]) => {
    if (clickModelValue) {
      setOutPutDrawerLoading(true);

      const { dataId, parentId } = clickModelValue;

      try {
        const { data } = await postProcessVisualizationProductsAdd({
          dataId,
          parentId,
          processProducts: outPutArr,
        });

        if (data.code === 200) {
          setOutPutVisible(false);
          setOutPutDrawerLoading(false);
          closeDrawerBackCall();
        }
      } catch (e) {
        setOutPutDrawerLoading(false);
      }
    }
  };

  /**
   * @description: 编辑产出物
   */
  const editOutPut = async (nodeInfo: NodeData['value']) => {
    setOutPutDrawerLoading(true);
    setOutPutVisible(true);

    const data = await getOutPutInitValues(nodeInfo);
    setOutPutInitValues(data);
    setOutPutDrawerLoading(false);
  };

  /**
   * @description: 关闭或者提交排放源
   * @param {boolean} restGraph 是否刷新画布
   */
  const closeEmissionDrawer = (restGraph?: boolean) => {
    setEmissionDrawerVisible(false);
    setEmissionDrawerTitle(undefined);
    setEmissionDrawerLoading(false);
    setEmissionInitialValues(undefined);
    setEmissionId(undefined);
    setStage(undefined);
    setMatchWayOptions(undefined);
    setDefaultMatchWay(undefined);

    // 更新画布

    restGraph && closeDrawerBackCall();
  };

  /**
   * @description: 提交排放源
   */
  const submitEmission = async (
    values: Emission,
    requestSupplier?: boolean,
  ) => {
    if (clickModelValue) {
      setEmissionDrawerLoading(true);
      const { dataId, processId } = clickModelValue;
      if (emissionId === undefined) {
        const reqFunc = requestSupplier
          ? postProcessAccountInAddAndRequest
          : postProcessAccountEmissionInAdd;
        await reqFunc({
          ...values,
          processId: processId as number,
          accountId: infoId ? Number(infoId) : undefined,
        });
      } else {
        const reqFunc = requestSupplier
          ? postProcessAccountInEditAndRequest
          : postProcessAccountInEmissionEdit;
        await reqFunc({
          ...values,
          accountId: infoId ? Number(infoId) : undefined,
          id: dataId,
        });
      }
      Toast(
        'success',
        emissionId === undefined
          ? I18N.carbonFootprint.newSuccessfullyAdded2
          : I18N.carbonFootprint.editSuccessful,
      );

      setEmissionDrawerLoading(false);
      closeEmissionDrawer(true);
    }
  };

  /**
   * @description: 编辑排放源
   * @param {NodeData} nodeInfo 编辑的节点信息
   */
  const editEmissionClick = async (nodeInfo: NodeData['value']) => {
    setEmissionDrawerLoading(true);
    setEmissionDrawerVisible(true);
    const { dataId } = nodeInfo;
    const emissionInfo = await getProcessAccountEmissionInfo({
      id: dataId,
    });
    setEmissionInitialValues(emissionInfo.data.data);
    setEmissionId(dataId);
    if (
      emissionInfo.data.data.matchWay !== MATCH_WAY.FACTOR &&
      emissionInfo.data.data.matchWay !== MATCH_WAY.FACTOR_CREATE
    ) {
      setMatchWayOptions([
        {
          value: emissionInfo.data.data.matchWay,
          label: MATCH_WAY_LABEL[emissionInfo.data.data.matchWay],
        },
      ]);
    }
    setEmissionDrawerLoading(false);
  };

  const [, requestedSupplier, supplierDataId] = useMemo(() => {
    const selectedSupplierMatchWay =
      emissionInitialValues?.matchWay === MATCH_WAY.SUPPLIER;
    const { NOT_SUBMIT } = MODEL_EMISSION_REQUEST_STATE;
    return [
      selectedSupplierMatchWay || defaultMatchWay === MATCH_WAY.SUPPLIER,
      selectedSupplierMatchWay &&
        emissionInitialValues.requestState !== NOT_SUBMIT,
      emissionInitialValues?.supplierObj?.id,
    ];
  }, [defaultMatchWay, emissionInitialValues]);

  /**
   * @description: 编辑单元过程
   * @param {NodeData} nodeInfo 编辑的节点信息
   */
  const editProcessInClick = async (nodeInfo: NodeData['value']) => {
    const { data } = await getProcessAccountInDetail({
      dataId: nodeInfo.dataId,
      parentId: nodeInfo.parentId,
    });
    setIsRootProcessNode(nodeInfo.parentId === '0');
    setProcessInitialValues(data.data);
    setProcessId(nodeInfo.id ? Number(nodeInfo.id) : null);
    setProcessDrawerVisible(true);
  };

  /**
   * @description: 编辑输出
   */
  const editExport = async (nodeInfo: NodeData['value']) => {
    setExportDrawerLoading(true);
    setExportVisible(true);

    const data = await getExportInitValues(nodeInfo);
    setExportInitValues(data);
    setExportDrawerLoading(false);
  };

  /**
   * @description: 根据点击的画布节点 展示不同的Drawer
   * @param {TagName} tagName 点击节点的编码
   * @param {NodeData} model 点击节点的info
   */
  const graphNodeClick = async (
    tagName: TagName,
    model: NodeData['value'],
    parentNode?: NodeData,
  ) => {
    // 0因子,1过程,5供应商
    const { processId: nodeProcessId, matchType, dataId } = model;

    setProcessId(nodeProcessId);
    setParentNodeInfo(parentNode);
    setClickModelValue(model);

    /** 新增 - 排放源 过程 供应商 */
    // 新增过程
    if (tagName === GRAPH_SHAPE_NAME.ADD_UNIT_TEXT) {
      setProcessId(null);
      setProcessDrawerEdit(false);
      setIsRootProcessNode(model.parentId === '0');
      setProcessDrawerVisible(true);
    }

    // 新增排放源
    if (tagName === GRAPH_SHAPE_NAME.ADD_EMISSION_TEXT) {
      setEmissionDrawerVisible(true);
    }

    /** 这个是点击节点 要展开的编辑 */
    if (tagName === GRAPH_SHAPE_NAME.INFO_RECT) {
      // 排放源
      if (matchType === FACTOR) {
        setEmissionId(dataId);
        await editEmissionClick(model);
      }

      // 过程
      if (matchType === PROCESS) {
        setProcessDrawerEdit(true);
        editProcessInClick(model);
      }

      // 供应商收数
      if (matchType === SUPPLIER) {
        setEmissionId(dataId);
        await editEmissionClick(model);
      }
    }

    // 如果是点击的产品
    if (tagName === GRAPH_SHAPE_NAME.PRODUCT_INFO) {
      await editProduct(model);
    }

    // 如果是点击的产出物
    if (tagName === GRAPH_SHAPE_NAME.OUTPUT_INFO) {
      await editOutPut(model);
    }

    // 如果是点击的输出
    if (tagName === GRAPH_SHAPE_NAME.EXPORT_INFO) {
      await editExport(model);
    }

    // 供应商收数
    if (tagName === GRAPH_SHAPE_NAME.ADD_SUPPLY_TEXT) {
      setEmissionDrawerVisible(true);
      setDefaultMatchWay(MATCH_WAY.SUPPLIER);
      setMatchWayOptions([
        {
          value: MATCH_WAY.SUPPLIER,
          label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
        },
      ]);
    }
  };

  /**
   * @description:
   * @param {boolean} restGraph 是否刷新画布
   * @return {*}
   */
  const closeProcessDrawer = (restGraph?: boolean) => {
    setProcessDrawerVisible(false);
    setProcessInitialValues(undefined);
    setProcessId(null);
    setParentNodeInfo(undefined);

    restGraph && closeDrawerBackCall();
    setProcessDrawerLoading(false);
  };

  /**
   * @description: 新增或者编辑过程核算和过程库
   */
  const submitProcess = async values => {
    setProcessDrawerLoading(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      processDrawerEdit
        ? await postProcessVisualizationInEdit({
            ...values,
            dataId: clickModelValue?.dataId,
            parentId: isRootProcessNode ? 0 : 1,
          })
        : await postProcessVisualizationInAdd({
            ...values,
            dataId: clickModelValue?.dataId,
            parentId: isRootProcessNode ? 0 : 1,
          });
      Toast(
        'success',
        processId === undefined
          ? I18N.carbonFootprint.newSuccessfullyAdded2
          : I18N.carbonFootprint.editSuccessful,
      );
      closeProcessDrawer(true);
    } catch (e) {
      setProcessDrawerLoading(false);
    }
  };

  /**
   * @description: 提交输出
   * @param {Record} outPutArr 输出数据
   */
  const subExport = async (outPutArr: Record<string, any>[]) => {
    if (clickModelValue) {
      setExportDrawerLoading(true);

      const { dataId, parentId } = clickModelValue;

      try {
        // 过程核算和过程库
        const { data } = await postProcessVisualizationOutsAdd({
          dataId,
          parentId,
          processOuts: outPutArr,
        });

        if (data.code === 200) {
          setExportVisible(false);
          setExportDrawerLoading(false);
          closeDrawerBackCall();
        }
      } catch (e) {
        setExportDrawerLoading(false);
      }
    }
  };

  useEffect(() => {
    getProcessInfo();

    if (stepValue === BASIC && isCopy) {
      getProcessAccountingInfo({
        id: paramsUrl.id,
      }).then(data => {
        setProcessBasic(data.data.data);
        setScopeVal(data.data.data.scope);
      });
    }

    // 每次切换step步骤条都要讲搭建模型步骤重置到默认展示可视化
    // setIsVisualState(true);
  }, [stepValue]);

  return (
    <Modal
      destroyOnClose
      open
      className='businessAccountingFillModal'
      width='100%'
      title={undefined}
      footer={null}
      closable={false}
      transitionName=''
    >
      <div className={styles.wrapper} style={{ marginBottom: 0 }}>
        <div className={styles.container}>
          <section className={classNames(styles.stepBox)}>
            <div
              onClick={() => {
                // history.push(
                //   RouteMapsCorbonFootprint3.carbonFootprint3ProcessBusinessAccounting,
                // );
                history.push(
                  `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintProductDetail}?productId=${processBasic?.productId}`,
                );
              }}
              className={styles.stepBoxBack}
            >
              <IconFont
                type='icon-icon-zuojiantou'
                style={{ fontSize: 24, marginRight: 8 }}
              />
              <span>{I18N.carbonFootprint3.processAccounting2}</span>
              <TextWidthOverflow
                width={300}
                value={`${processBasic?.accountName || '-'}`}
              />
              <span>）</span>
            </div>
            <Steps
              style={{
                width: 700,
                margin: '0 auto',
              }}
              className={styles.stepsClass}
              current={stepValue}
              onChange={current => changeStep(current)}
            >
              <Steps.Step key={BASIC} title={STEP_OPTION_LABEL()[BASIC]} />
              <Steps.Step
                key={MODEL}
                title={STEP_OPTION_LABEL()[MODEL]}
                disabled={isBuildModel()}
              />
              <Steps.Step
                key={RESULT}
                title={STEP_OPTION_LABEL()[RESULT]}
                disabled={isFinishEnd()}
              />
            </Steps>

            {stepValue === MODEL &&
              checkPermissions(
                <div className={styles.stepBoxGoResut}>
                  <Button type='primary' onClick={createFinishReport}>
                    {I18N.carbonFootprint3.generateCarbonFootprint}
                  </Button>
                </div>,
                'footprint3:account:finish:process',
              )}

            {stepValue === RESULT && processBasic && (
              <ShareModelSubmitButton
                accountId={processBasic.id}
                shareStatus={processBasic.shareStatus}
                permissionCode='footprint3:account:finish:process'
                wrapperClassName={styles.stepBoxGoResut}
                onSuccess={getProcessInfo}
              />
            )}

            {stepValue === RESULT &&
              checkPermissions(
                <div className={styles.stepBoxGoResut}>
                  <Button type='primary' onClick={goAddReport}>
                    {I18N.carbonFootprint.generateReport}
                  </Button>
                </div>,
                'footprint3:account:finish:process',
              )}
          </section>

          {stepValue === BASIC && (
            <div className={styles.firstStep}>
              <Spin spinning={stepLoading}>
                <ProcessBusinessAccountingAddBasic
                  cRef={childBasicRef}
                  onSub={subBasicInfo}
                  changeStepBack={changeStepBack}
                  basicInfo={processBasic}
                  isCopy={isCopy}
                  isEdit={!!socpeValue}
                />
              </Spin>
            </div>
          )}

          {stepValue === MODEL && managementId && (
            <div className={classNames(styles.accountGraph, styles.main)}>
              <div
                className={classNames(styles.accountGraphHeader, {
                  [styles.visualViewport]: isVisualState,
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ color: '#999EA4' }}>
                    {I18N.carbonFootprint3.functionalUnits2}
                  </span>

                  <div style={{ maxWidth: 200 }}>
                    <TextOverflowTable
                      value={processBasic?.accountName || '-'}
                      maxLength={15}
                    />
                  </div>

                  <span className='m-l-30' style={{ color: '#999EA4' }}>
                    {I18N.carbonFootprint.accountingCycle2}
                  </span>
                  <span>
                    {processBasic?.startTime || '-'}
                    {I18N.carbonFootprint.to}
                    {processBasic?.endTime || '-'}
                  </span>
                  <span className={styles.selectScopeBorder} />
                  <Select
                    className={styles.processAccountScope}
                    bordered={false}
                    value={scopeVal}
                    onChange={val => changeScope(val)}
                    options={[
                      {
                        label: PROCESS_ACCOUNT_SCOPED_LABEL[HALF],
                        value: HALF,
                      },
                      {
                        label: PROCESS_ACCOUNT_SCOPED_LABEL[FULL],
                        value: FULL,
                      },
                    ]}
                  />
                </div>
                <div className={styles.operateContainer}>
                  <span
                    className={classNames(styles.textButton, 'm-l-16')}
                    onClick={() => {
                      const nUrl = replaceParamVal(
                        LIST_OR_GRAPH,
                        isVisualState ? LIST : GRAPH,
                      );
                      window.history.replaceState(null, '', nUrl);

                      setIsVisualState(s => !s);
                    }}
                  >
                    {isVisualState ? (
                      <span className={styles.changeListOrGraph}>
                        <UnorderedListOutlined />
                        <span className='m-l-6'>
                          {I18N.carbonFootprint3.switchToList}
                        </span>
                      </span>
                    ) : (
                      <span className={styles.changeListOrGraph}>
                        <IconAlibaba
                          type='icon-icon_qiehuanzhikeshihua'
                          style={{
                            fontSize: 16,
                          }}
                        />
                        <span className='m-l-6'>
                          {I18N.carbonFootprint3.switchToVisual}
                        </span>
                      </span>
                    )}
                  </span>
                </div>
              </div>
              {!isVisualState && (scopeVal || scopeVal === 0) && (
                <div className={styles.buildListMainStep}>
                  <div className={styles.buildListStep}>
                    <ProcessBusinessAccountingManagement
                      isEdit={isEdit}
                      id={`${managementId}`}
                      scope={scopeVal}
                    />
                  </div>
                </div>
              )}
              {isVisualState && (
                <Spin spinning={stepLoading}>
                  <ProcessModelGraph
                    cRef={childGrapRef}
                    infoId={infoId ? Number(infoId) : undefined}
                    onClickNode={(tagName, model, parentNode) => {
                      setStepLoading(true);
                      graphNodeClick(tagName, model, parentNode);
                      setStepLoading(false);
                    }}
                  />
                </Spin>
              )}
            </div>
          )}

          {stepValue === RESULT && managementId && (
            <div className={styles.step3}>
              <CarbonFootprintResult
                accountId={Number(infoId)}
                accountInfo={processBasic}
                getModelInfo={getProcessInfo}
              />
            </div>
          )}

          {productVisible && (
            <AccessoryProductDrawer
              isEdit
              unitName={processBasic?.accountName || '-'}
              visible={productVisible}
              loading={productDrawerLoading}
              initValues={productInitValues}
              onOk={subProduct}
              onCancel={() => {
                setProductVisible(false);
              }}
            />
          )}

          {outPutVisible && (
            <AccessoryOutPutDrawer
              isProcess={false}
              isEdit
              parentProcessNodeInfoName={parentNodeInfo?.value.name}
              visible={outPutVisible}
              loading={outPutDrawerLoading}
              initValues={outPutInitValues}
              onOk={subOutPut}
              onCancel={() => {
                setOutPutVisible(false);
              }}
            />
          )}

          {emissionDrawerVisible && (
            <EmissionDrawer
              visible={emissionDrawerVisible}
              title={emissionDrawerTitle}
              ref={emissionDrawerRef}
              readPretty={
                requestedSupplier &&
                (supplierDataId === null || supplierDataId === undefined)
              }
              matchWayOptions={matchWayOptions}
              defaultMatchWay={defaultMatchWay}
              initialValues={emissionInitialValues}
              loading={emissionDrawerLoading}
              stage={stage}
              processName={
                clickModelValue?.processId
                  ? clickModelValue?.name
                  : parentNodeInfo?.value.name
              }
              setFormMounted={setEmissionDrawerFormMounted}
              onOk={submitEmission}
              onCancel={closeEmissionDrawer}
            />
          )}

          {processDrawerVisible && (
            <ProcessDrawer
              visible={processDrawerVisible}
              initialValues={processInitialValues}
              loading={processDrawerLoading}
              onOk={submitProcess}
              onCancel={closeProcessDrawer}
              parentProcessNodeInfoName={parentNodeInfo?.value.name}
              isProcessAccountRoot={isRootProcessNode}
            />
          )}

          {exportVisible && (
            <AccessoryExportDrawer
              isEdit
              visible={exportVisible}
              loading={exportDrawerLoading}
              unitName={processBasic?.accountName || '-'}
              initValues={exportInitValues}
              accountId={infoId ? Number(infoId) : 0}
              processId={
                clickModelValue?.processId
                  ? Number(clickModelValue?.processId)
                  : 0
              }
              onOk={subExport}
              onCancel={() => {
                setExportVisible(false);
              }}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProcessBusinessAccountingAddOrDetail;
