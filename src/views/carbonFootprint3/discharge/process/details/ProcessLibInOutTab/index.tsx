/* eslint-disable no-empty */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-04 15:40:39
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-25 20:45:34
 */

import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import { Form } from '@formily/core';
import { listALLByDictTypeBatch } from '@src/api/api';
import addEmissionIcon from '@src/assets/svg/icon-new-product-model.svg';
import addUnitIcon from '@src/assets/svg/icon_process_light-outline.svg';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { postProcessBusinessAccountingEmissionInStore } from '@src/views/carbonFootprint3/BusinessAccountingModel/addBasic/components/Graph/service';
import {
  MODEL_EMISSION_MATCH_WAY_ICON,
  MODEL_EMISSION_REQUEST_STATE,
} from '@src/views/carbonFootprint3/BusinessAccountingModel/constant';
import {
  postProcessBusinessAccountingDetails,
  postProcessDetails,
  postProcessVisualizationInEdit,
} from '@src/views/carbonFootprint3/ProcessBusinessAccounting/service';
import { ProcessBusinessAccountingMenu } from '@src/views/carbonFootprint3/ProcessBusinessAccounting/type';
import EmissionDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer';
import {
  getProcessAccountEmissionInfo,
  getProcessAccountInDetail,
  postProcessAccountEmissionInAdd,
  postProcessAccountInAddAndRequest,
  postProcessAccountInDelete,
  postProcessAccountInEmissionEdit,
  postProcessAccountInEditAndRequest,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/service';
import { Emission } from '@src/views/carbonFootprint3/component/AccessoryDrawer/EmissionDrawer/type';
import AccessoryOutPutDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer';
import { postProcessVisualizationOutPutsList } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/service';
import { AccessoryOutPutData } from '@src/views/carbonFootprint3/component/AccessoryDrawer/OutPutDrawer/type';
import ProcessDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer';
import {
  postProcessVisualizationInAdd,
  postProcessVisualizationInCopy,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProcessDrawer/service';
import AccessoryProductDrawer from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProductDrawer';
import {
  postProcessVisualizationProductsAdd,
  postProcessVisualizationProductsList,
} from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProductDrawer/service';
import { AccessoryProductData } from '@src/views/carbonFootprint3/component/AccessoryDrawer/ProductDrawer/type';
import ImportFileModal from '@src/views/carbonFootprint3/component/ImportFileModal';
import {
  getFileOutImportApi,
  getSysFileStatus,
  postFileImportProcessInApi,
} from '@src/views/carbonFootprint3/component/ImportFileModal/service';
import {
  EmissionImportTableList,
  ImportParams,
} from '@src/views/carbonFootprint3/component/ImportFileModal/type';
import TableExpandAccountIn from '@src/views/carbonFootprint3/component/TableExpandAccountIn';
import { FOOTPRINT3_IMPORT_MODAL_FILE_KEY } from '@src/views/carbonFootprint3/constant';
import { isBuySupplier } from '@src/views/carbonFootprint3/service';
import { Button, Table, Dropdown, Space, Menu, Modal } from 'antd';
import { has } from 'lodash-es';
import { VFC, useEffect, useMemo, useRef, useState } from 'react';

import { getToken } from '@/utils/cookie';

import {
  genProductTableColumns,
  genProductRootTableColumns,
  genInTableColumns,
} from './utils';
import { MATCH_WAY, MATCH_WAY_LABEL } from '../../constant';
import {
  getProcessLibDetails,
  postEmissionAdd,
  postUnitProcessAdd,
  getProcessOutputs,
  postProcessOutputsEdit,
  postProcessInDelete,
  getUnitProcessInfo,
  getEmissionInfo,
  postUnitProcessEdit,
  postEmissionEdit,
  postUnitProcessCopy,
} from '../../service';
import {
  Dicts,
  ProcessLibIn,
  ProcessLibOut,
  ProcessLibProduct,
} from '../../type';
import styles from '../index.module.less';

type ProcessLibInOutProps = {
  id: number;
  name: string;
  isEdit: boolean;
  apiExtraParams?: ApiExtraParams;
  isProcessBusinessAccount?: boolean;
  isProcess?: boolean;
  processTreeInfo?: ProcessBusinessAccountingMenu;
  parentProcessNodeInfo?: ProcessBusinessAccountingMenu;
  updateTreeNode?: (info: ProcessBusinessAccountingMenu) => void;
  isOnlyDetail?: boolean;
  isHaveSetDetil?: boolean;
  /** 因子选用评价卡片；默认展示，可由上层关闭 */
  showFactorEvaluationCard?: boolean;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
};

const { confirm } = Modal;
const { NOT_SUBMIT } = MODEL_EMISSION_REQUEST_STATE;
const { FACTOR_ICON, SUPPLIER_ICON } = MODEL_EMISSION_MATCH_WAY_ICON;

const ProcessLibInOutTab: VFC<ProcessLibInOutProps> = ({
  id,
  apiExtraParams,
  name,
  isEdit,
  isProcessBusinessAccount,
  isProcess,
  processTreeInfo,
  updateTreeNode,
  parentProcessNodeInfo,
  isOnlyDetail,
  isHaveSetDetil,
  showFactorEvaluationCard,
  enableFactorSourceRange,
  factorPrefId,
}) => {
  /** 接口标识 */
  const defaultApiExtraParams = apiExtraParams || {};

  // 是购买供应链相关产品
  const showSupplierRef = useRef<boolean>(false);

  /** 侧滑抽屉的只读状态 */
  const drawerDetail = isOnlyDetail || isHaveSetDetil;
  /** 是否是根节点 - 功能单位 */
  const isBaseRootTreeNode = processTreeInfo?.parentId === '0';

  /** 导入文件后返回的code - 用于判断是否异步导入完成 */
  const [importBackCode, setImportBackCode] = useState<number>();

  const [processLibDetails, setProcessLibDetails] = useState<{
    libProcessProducts: ProcessLibProduct[];
    libProcessIns: ProcessLibIn[];
    libProcessOuts: ProcessLibOut[];
  }>({ libProcessProducts: [], libProcessIns: [], libProcessOuts: [] });

  /** 输入表格的Data */
  const [libProcessInsData, setLibProcessInsData] = useState<ProcessLibIn[]>();

  /** 展开表格 */
  const [tableExpanded, setTableExpanded] = useState(false);
  const [expandedRowKeys, setExpandedRowKeys] = useState<number[]>([]);

  const [loading, setLoading] = useState(false);

  /** 是否是复制状态 */
  const [copyDrawerStatus, setCopyDrawerStatus] = useState(false);

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
  const [emissionDrawerLoading, setEmissionDrawerLoading] = useState(false);
  const [emissionInitialValues, setEmissionInitialValues] =
    useState<Emission>();
  const [stage, setStage] = useState<number>();
  const [emissionInfo, setEmissionInfo] = useState<Emission>();
  const [emissionId, setEmissionId] = useState<number>();
  const [defaultMatchWay, setDefaultMatchWay] = useState<number>();
  const [matchWayOptions, setMatchWayOptions] =
    useState<{ value: number; label: string }[]>();
  const [, setEmissionDrawerFormMounted] = useState(false);

  const emissionDrawerRef = useRef<{
    form: Form<Record<string, any>>;
    getFormatterFormValues: () => Promise<Emission>;
  }>(null);

  const [processDrawerVisible, setProcessDrawerVisible] = useState(false);
  const [processDrawerLoading, setProcessDrawerLoading] = useState(false);
  const [processInitialValues, setProcessInitialValues] =
    useState<Record<string, any>>();
  const [processId, setProcessId] = useState<number>();

  const [importEmissionFileVisible, setImportEmissionFileVisible] =
    useState(false);

  const [downLoadTemplateEmissionUrl, setDownLoadTemplateEmissionUrl] =
    useState<string>('');

  /** 导入输出文件的查询参数 */
  const [searchImportParams] = useState<ImportParams>({
    pageNum: 1,
    pageSize: 10,
    type: 1,
  });

  /**
   * @description: 给输入添加子级
   * @param {ProcessLibIn} arr
   */
  const addChildren = (arr: ProcessLibIn[]) =>
    arr.map(obj => ({
      ...obj,
      children: [],
    }));

  const getTableData = async (processLibId: number) => {
    try {
      setLoading(true);

      if (isProcessBusinessAccount && processTreeInfo) {
        if (isProcess) {
          const { data } = await postProcessDetails({
            ...processTreeInfo,
            ...defaultApiExtraParams,
          });
          setProcessLibDetails({
            libProcessIns: data.data.libProcessIns,
            libProcessOuts: data.data.libProcessOuts,
            libProcessProducts: data.data.libProcessProducts,
          });
          setLibProcessInsData(addChildren(data.data.libProcessIns));
        } else {
          const { data } = await postProcessBusinessAccountingDetails({
            ...processTreeInfo,
            ...defaultApiExtraParams,
          });
          setProcessLibDetails({
            libProcessIns: data.data.processIns,
            libProcessOuts: data.data.processOuts,
            libProcessProducts: data.data.processProducts,
          });
          setLibProcessInsData(addChildren(data.data.processIns));
        }
      } else {
        const { data } = await getProcessLibDetails({
          ...defaultApiExtraParams,
          id: processLibId,
        });
        setProcessLibDetails(data.data);
        setLibProcessInsData(addChildren(data.data.libProcessIns));
      }

      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  /**
   * @description: 更新左侧菜单树形
   */
  const resetTree = () => {
    if (updateTreeNode && processTreeInfo) {
      updateTreeNode(processTreeInfo);
    }
    // await getTableData(id);
  };

  /**
   * @description: 更新菜单树形和表格数据
   */
  const resetTreeAndTable = async () => {
    if (processTreeInfo) {
      await getTableData(processTreeInfo?.processId);
    }

    resetTree();
  };

  /**
   * @description: 从接口获取产品的回显信息
   */
  const getProductInitValues = async () => {
    if (processTreeInfo) {
      const { dataId, parentId } = processTreeInfo;

      const { data } = await (isProcess
        ? getProcessOutputs
        : postProcessVisualizationProductsList)({
        ...defaultApiExtraParams,
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
  const editProduct = async () => {
    setProductDrawerLoading(true);
    setProductVisible(true);

    const data = await getProductInitValues();
    setProductInitValues(data as AccessoryProductData[]);
    setProductDrawerLoading(false);
  };

  /**
   * @description: 提交产品
   * @param {Record} productArr 当前整理好的提交产品数据
   */
  const subProduct = async (productArr: Record<string, any>[]) => {
    if (processTreeInfo) {
      const { dataId, parentId } = processTreeInfo;

      try {
        const { data } = await postProcessVisualizationProductsAdd({
          ...defaultApiExtraParams,
          dataId,
          parentId,
          processProducts: productArr,
        });

        if (data.code === 200) {
          setProductVisible(false);
          setProductDrawerLoading(false);
          await getTableData(id);
          Toast('success', I18N.carbonFootprint.submittedSuccessfully);
        }
      } catch (e) {
        setProductDrawerLoading(false);
      }
    }
  };

  /**
   * @description: 从接口获取产品的回显信息
   */
  const getOutPutInitValues = async () => {
    if (processTreeInfo) {
      const { dataId, parentId } = processTreeInfo;

      const { data } = await (isProcess
        ? getProcessOutputs
        : postProcessVisualizationOutPutsList)({
        ...defaultApiExtraParams,
        dataId,
        parentId,
      });

      return data.data.processProducts;
    }

    return undefined;
  };

  /**
   * @description: 提交产出物
   * @param {Record} outPutArr 产出物数据
   */
  const subOutPut = async (outPutArr: Record<string, any>[]) => {
    if (processTreeInfo) {
      const { dataId, parentId } = processTreeInfo;

      try {
        const { data } = await (isProcess
          ? postProcessOutputsEdit
          : postProcessVisualizationProductsAdd)({
          ...defaultApiExtraParams,
          dataId,
          parentId,
          processProducts: outPutArr,
        });
        if (data.code === 200) {
          setOutPutVisible(false);
          setOutPutDrawerLoading(false);
          if (updateTreeNode && processTreeInfo) {
            updateTreeNode(processTreeInfo);
          }
          await getTableData(id);
        }
      } catch (e) {
        setOutPutDrawerLoading(false);
      }
    }
  };

  /**
   * @description: 编辑产出物
   */
  const editOutPut = async () => {
    setOutPutDrawerLoading(true);
    setOutPutVisible(true);

    const data = await getOutPutInitValues();
    setOutPutInitValues(data);
    setOutPutDrawerLoading(false);
  };

  useEffect(() => {
    getTableData(id);
  }, [id, processTreeInfo]);

  const addEmission = (options?: {
    defaultMatchWay?: number;
    matchWayOptions?: { value: number; label: string }[];
  }) => {
    setEmissionDrawerVisible(true);
    setDefaultMatchWay(options?.defaultMatchWay);
    const optionsTabBtns: { value: number; label: string; icon?: string }[] = [
      {
        value: MATCH_WAY.FACTOR,
        label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
        icon: FACTOR_ICON,
      },
    ];

    // 过程库没有发起收数功能
    if (!isProcess && showSupplierRef.current) {
      optionsTabBtns.push({
        value: MATCH_WAY.SUPPLIER,
        label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
        icon: SUPPLIER_ICON,
      });
    }
    setMatchWayOptions(optionsTabBtns);
  };

  const closeEmissionDrawer = () => {
    setEmissionDrawerVisible(false);
    setEmissionDrawerLoading(false);
    setEmissionInitialValues(undefined);
    setEmissionId(undefined);
    setStage(undefined);
    setMatchWayOptions(undefined);
    setDefaultMatchWay(undefined);
    setCopyDrawerStatus(false);
  };

  const submitEmission = async (
    values: Emission,
    requestSupplier?: boolean,
  ) => {
    try {
      setEmissionDrawerLoading(true);
      if (processTreeInfo === undefined) {
        return;
      }
      if (isProcess) {
        // 过程库的复制
        if (copyDrawerStatus) {
          // 新增排放源
          await postEmissionAdd({
            ...defaultApiExtraParams,
            ...values,
            processId: processTreeInfo.processId,
          });
          Toast('success', I18N.carbonFootprint3.copySuccessful);

          await resetTreeAndTable();

          closeEmissionDrawer();

          return;
        }

        // 过程库
        if (emissionId === undefined) {
          // 新增排放源
          await postEmissionAdd({
            ...defaultApiExtraParams,
            ...values,
            processId: processTreeInfo.processId,
          });
        } else {
          // 编辑排放源
          await postEmissionEdit({
            ...defaultApiExtraParams,
            ...values,
            processId: processTreeInfo.processId,
            id: emissionId,
          });
        }
      } else {
        // 复制
        if (copyDrawerStatus) {
          const reqFunc = requestSupplier
            ? postProcessAccountInAddAndRequest
            : postProcessAccountEmissionInAdd;
          await reqFunc({
            ...apiExtraParams,
            ...values,
            accountId: id,
          });
          Toast('success', I18N.carbonFootprint3.copySuccessful);

          await resetTreeAndTable();

          closeEmissionDrawer();

          return;
        }

        // 过程核算相关逻辑
        // eslint-disable-next-line no-lonely-if
        if (emissionId === undefined) {
          const reqFunc = requestSupplier
            ? postProcessAccountInAddAndRequest
            : postProcessAccountEmissionInAdd;
          await reqFunc({
            ...defaultApiExtraParams,
            ...values,
            processId: processTreeInfo!.processId,
            accountId: id,
          });
        } else {
          const reqFunc = requestSupplier
            ? postProcessAccountInEditAndRequest
            : postProcessAccountInEmissionEdit;
          await reqFunc({
            ...defaultApiExtraParams,
            ...values,
            processId: processTreeInfo!.processId,
            accountId: id,
            id: emissionInfo?.id,
          });
        }
      }
      Toast(
        'success',
        emissionId === undefined
          ? I18N.carbonFootprint.newSuccessfullyAdded2
          : I18N.carbonFootprint.editSuccessful,
      );

      await resetTreeAndTable();

      closeEmissionDrawer();
    } finally {
      setEmissionDrawerLoading(false);
    }
  };

  const [, requestedSupplier, supplierDataId] = useMemo(() => {
    const selectedSupplierMatchWay =
      emissionInitialValues?.matchWay === MATCH_WAY.SUPPLIER;
    return [
      selectedSupplierMatchWay || defaultMatchWay === MATCH_WAY.SUPPLIER,
      selectedSupplierMatchWay &&
        emissionInitialValues.requestState !== NOT_SUBMIT,
      emissionInitialValues?.supplierObj?.id,
    ];
  }, [defaultMatchWay, emissionInitialValues]);

  const addProcess = () => {
    setProcessDrawerVisible(true);
  };

  const closeProcessDrawer = () => {
    setProcessDrawerLoading(false);
    setProcessDrawerVisible(false);
    setProcessInitialValues(undefined);
    setProcessId(undefined);
    setCopyDrawerStatus(false);
  };

  /**
   * @description: 新增或者编辑过程核算和过程库
   * @param {*} values 操作的值
   */
  const submitProcess = async values => {
    if (!processTreeInfo) {
      return;
    }
    setEmissionDrawerLoading(true);
    // 复制逻辑补充
    if (copyDrawerStatus) {
      if (isProcess) {
        // 复制过程排放源
        await postUnitProcessCopy({
          ...defaultApiExtraParams,
          ...values,
          dataId: processId,
          parentId: 1,
        });
      } else {
        await postProcessVisualizationInCopy({
          ...defaultApiExtraParams,
          ...values,
          dataId: processTreeInfo?.dataId,
          parentId: 1,
        });
      }

      Toast('success', I18N.carbonFootprint3.copySuccessful);
      await resetTreeAndTable();

      setEmissionDrawerLoading(false);
      closeProcessDrawer();
      return;
    }

    if (isProcess) {
      if (processId === undefined) {
        // 新增单元过程
        await postUnitProcessAdd({
          ...defaultApiExtraParams,
          ...values,
          dataId: processTreeInfo.dataId,
          parentId: processTreeInfo.parentId,
        });
      } else {
        // 编辑单元过程
        await postUnitProcessEdit({
          ...defaultApiExtraParams,
          ...values,
          dataId: processId,
          parentId: 1,
        });
      }
    } else {
      // 过程核算相关逻辑
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      processId
        ? await postProcessVisualizationInEdit({
            ...defaultApiExtraParams,
            ...values,
            dataId: processTreeInfo?.dataId,
            parentId: 1,
          })
        : await postProcessVisualizationInAdd({
            ...defaultApiExtraParams,
            ...values,
            dataId: processTreeInfo?.dataId,
            parentId: 1,
          });
    }
    Toast(
      'success',
      processId === undefined
        ? I18N.carbonFootprint.newSuccessfullyAdded2
        : I18N.carbonFootprint.editSuccessful,
    );

    await resetTreeAndTable();

    setEmissionDrawerLoading(false);
    closeProcessDrawer();
  };

  /**
   * @description: 输入操作的详情点击
   * @param {ProcessLibIn} item 点击的详情数据
   */
  const editProcessInClick = async (
    item: ProcessLibIn,
    copyStatus?: boolean,
  ) => {
    setCopyDrawerStatus(copyStatus || false);
    setExpandedRowKeys([]);
    setTableExpanded(false);

    const { matchWay } = item;
    setLoading(true);

    // 点击的是过程
    if ([3, 4].includes(matchWay)) {
      const { data } = await (isProcess
        ? getUnitProcessInfo
        : getProcessAccountInDetail)({
        ...defaultApiExtraParams,
        dataId: item.id,
        parentId: 1,
      });
      setProcessInitialValues(data.data);
      setProcessId(item.id);
      setLoading(false);
      setProcessDrawerVisible(true);
      return;
    }

    const emissionInfo = await (isProcess
      ? getEmissionInfo
      : getProcessAccountEmissionInfo)({
      ...defaultApiExtraParams,
      id: item.id,
    });

    // 其他都是排放源
    setEmissionInfo(emissionInfo.data.data);
    setEmissionInitialValues(emissionInfo.data.data);
    setEmissionId(item.id);
    setLoading(false);
    const optionsTabBtns: { value: number; label: string; icon?: string }[] = [
      {
        value: MATCH_WAY.FACTOR,
        label: MATCH_WAY_LABEL[MATCH_WAY.FACTOR],
        icon: FACTOR_ICON,
      },
    ];

    // 过程库没有发起收数功能
    if (!isProcess && showSupplierRef.current) {
      optionsTabBtns.push({
        value: MATCH_WAY.SUPPLIER,
        label: MATCH_WAY_LABEL[MATCH_WAY.SUPPLIER],
        icon: SUPPLIER_ICON,
      });
    }
    setMatchWayOptions(optionsTabBtns);
    setEmissionDrawerVisible(true);
  };

  /**
   * 复制操作
   * @param item 选中的数据
   */
  const copyProcessInClick = async (item: ProcessLibIn) => {
    await editProcessInClick(item, true);
  };

  /**
   * @description: 删除输入按钮
   * @param {ProcessLibIn} item
   * @return {*}
   */
  const deleteProcessInClick = async (item: ProcessLibIn) => {
    confirm({
      title: I18N.carbonFootprint.prompt,
      content: I18N.template(I18N.carbonFootprint3.confirmDeletionOfThis14, {
        val1: item.name,
      }),

      okButtonProps: {
        danger: true,
      },
      icon: null,
      onOk: async () => {
        try {
          const back = await (isProcess
            ? postProcessInDelete
            : postProcessAccountInDelete)({
            ...defaultApiExtraParams,
            id: item.id,
          });
          if (back.data.code === 200) {
            await resetTreeAndTable();

            Toast('success', I18N.carbonFootprint.deleteSuccessful);
          }
        } catch {
          /* empty */
        }
      },
    });
  };

  /** 异步导入文件成功回调 */
  const syncFileStatusSuccess = () => {
    setImportBackCode(undefined);
    Toast('success', I18N.carbonFootprint3.importDataAs);
    resetTreeAndTable();
  };

  /**
   * 循环调用接口，判断是否导入异步文件完毕
   * @param id 查询的id
   */
  const getImportBackIdStatus = (id: number) => {
    const interval = setInterval(() => {
      getSysFileStatus({ id }).then(data => {
        if (data.data.data && data.data.data !== 0) {
          clearInterval(interval);
          syncFileStatusSuccess();
        }
      });
    }, 3000);
  };

  /**
   * 导入文件后的返回值
   * @param data 导入后的返回值,用于定时刷新
   */
  const onOkImportBack = (data?: number) => {
    if (data) {
      setImportBackCode(data);
      getSysFileStatus({ id: data })
        .then(fileStatus => {
          if (fileStatus.data.data && fileStatus.data.data !== 0) {
            syncFileStatusSuccess();
          } else {
            // 循环调用导入状态判断 - 每3s执行一次
            getImportBackIdStatus(data);
          }
        })
        .catch(() => {
          setImportBackCode(undefined);
        });
    }
  };

  /**
   * @description: 取消弹框的展示
   */
  const onCancelImportEmissionFile = async () => {
    setImportEmissionFileVisible(false);
  };

  /**
   * @description: 排放源 - 导入文件后的回调方法
   */
  const importEmissionFileRequestBack = async (
    url: string,
    fileName?: string,
  ) => {
    const { data } = await postFileImportProcessInApi(
      { fileUrl: url, fileName },
      {
        accountId: `${id}`,
        processId: `${processTreeInfo!.processId}`,
      },
    );

    return { code: data.code, data: data.data };
  };

  /**
   * 保存到库
   * @param saveAccountId 保存到库id
   */
  const saveEmissionSourceInStore = async (saveAccountId: number) => {
    setLoading(true);
    await postProcessBusinessAccountingEmissionInStore({
      ...defaultApiExtraParams,
      id: saveAccountId,
    });
    Toast('success', I18N.carbonFootprint3.successfullySavedTo);
    await getTableData(id);
  };

  /**
   * 是否有购买供应链产品
   */
  const isShowSupplier = async () => {
    // 过程库不需要发起收数，所以不用调用该方法
    if (isProcess) return;

    // 分享页面也不需要调用该方法
    if (apiExtraParams?.snapFlag === API_EXTRA_PARAMS_SNAPFLAG.SHARE) {
      showSupplierRef.current = true;
      return;
    }

    // SaaS分享页面也不需要调用该方法
    if (apiExtraParams?.snapFlag === API_EXTRA_PARAMS_SNAPFLAG.SAASSHARE) {
      showSupplierRef.current = true;
      return;
    }

    if (has(apiExtraParams, 'snapFlag')) {
      showSupplierRef.current = true;
      return;
    }
    if (!getToken()) {
      return;
    }
    const supplierBtn = await isBuySupplier();
    showSupplierRef.current = supplierBtn.data.data || false;
  };

  const init = async () => {
    const dic = await listALLByDictTypeBatch<{
      footprint3_export_template: Dicts[];
    }>({
      dictTypes: 'footprint3_export_template',
    });
    const { footprint3_export_template } = dic.data.data;

    footprint3_export_template.forEach(templ => {
      // 选择排放源的模板下载地址
      if (
        templ.dictValue ===
          FOOTPRINT3_IMPORT_MODAL_FILE_KEY.PROCESS_ACCOUNT_IN &&
        templ.relatedValue
      ) {
        setDownLoadTemplateEmissionUrl(templ.relatedValue);
      }
    });

    isShowSupplier();
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div
        className={styles.tableSection}
        style={isProcessBusinessAccount ? { padding: '16px 0' } : {}}
      >
        {productVisible && (
          <AccessoryProductDrawer
            isEdit
            unitName={name}
            visible={productVisible}
            loading={productDrawerLoading}
            initValues={productInitValues}
            enableFactorSourceRange={enableFactorSourceRange && !drawerDetail}
            factorPrefId={factorPrefId}
            onOk={subProduct}
            onCancel={() => {
              setProductVisible(false);
            }}
          />
        )}

        {outPutVisible && (
          <AccessoryOutPutDrawer
            isEdit
            unitName={name}
            parentProcessNodeInfo={parentProcessNodeInfo}
            visible={outPutVisible}
            loading={outPutDrawerLoading}
            initValues={outPutInitValues}
            onOk={subOutPut}
            onCancel={() => {
              setOutPutVisible(false);
            }}
            isProcess={isProcess}
            enableFactorSourceRange={enableFactorSourceRange && !drawerDetail}
            factorPrefId={factorPrefId}
          />
        )}

        {emissionDrawerVisible && (
          <EmissionDrawer
            copyStatus={copyDrawerStatus}
            apiExtraParams={apiExtraParams}
            isOnlyDetail={drawerDetail}
            visible={emissionDrawerVisible}
            ref={emissionDrawerRef}
            readPretty={
              requestedSupplier &&
              (supplierDataId === null || supplierDataId === undefined) &&
              !copyDrawerStatus
            }
            matchWayOptions={matchWayOptions}
            defaultMatchWay={defaultMatchWay}
            initialValues={emissionInitialValues}
            loading={emissionDrawerLoading}
            stage={stage}
            processName={processTreeInfo?.name}
            showFactorEvaluationCard={showFactorEvaluationCard}
            enableFactorSourceRange={
              enableFactorSourceRange &&
              !drawerDetail &&
              !(
                requestedSupplier &&
                (supplierDataId === null || supplierDataId === undefined) &&
                !copyDrawerStatus
              )
            }
            factorPrefId={factorPrefId}
            setFormMounted={setEmissionDrawerFormMounted}
            onOk={submitEmission}
            onCancel={closeEmissionDrawer}
            isProcess={isProcess}
          />
        )}

        {processDrawerVisible && (
          <ProcessDrawer
            copyStatus={copyDrawerStatus}
            apiExtraParams={apiExtraParams}
            isOnlyDetail={drawerDetail}
            visible={processDrawerVisible}
            initialValues={processInitialValues}
            loading={processDrawerLoading}
            rootProcessId={id.toString()}
            parentProcess={processTreeInfo}
            enableFactorSourceRange={enableFactorSourceRange && !drawerDetail}
            factorPrefId={factorPrefId}
            onOk={submitProcess}
            onCancel={closeProcessDrawer}
            isProcess={isProcess}
          />
        )}
        {importEmissionFileVisible && (
          <ImportFileModal<EmissionImportTableList, ImportParams>
            title={I18N.carbonFootprint.importEmissionSources}
            onOkImport={onOkImportBack}
            visible={importEmissionFileVisible}
            onCancelBack={onCancelImportEmissionFile}
            downLoadTemplateUrl={downLoadTemplateEmissionUrl}
            importFileRequestBack={importEmissionFileRequestBack}
            searchParamsData={searchImportParams}
            getFileListRequest={getFileOutImportApi}
          />
        )}

        <div className={styles.formTitle}>
          {isBaseRootTreeNode && !isProcess
            ? I18N.carbonFootprint3.product
            : I18N.carbonFootprint3.output2}
          {isEdit &&
            (isBaseRootTreeNode && !isProcess ? (
              <Button
                type='primary'
                onClick={async () => {
                  await editProduct();
                }}
              >
                {I18N.carbonFootprint3.editProduct}
              </Button>
            ) : (
              <Button
                type='primary'
                onClick={async () => {
                  await editOutPut();
                }}
              >
                {I18N.carbonFootprint3.editingOutput}
              </Button>
            ))}
        </div>
        <Table
          loading={loading}
          rowKey='id'
          columns={
            isBaseRootTreeNode && !isProcess
              ? genProductRootTableColumns()
              : genProductTableColumns(isBaseRootTreeNode)
          }
          dataSource={processLibDetails.libProcessProducts}
          pagination={false}
        />
      </div>
      <div
        className={styles.tableSection}
        style={isProcessBusinessAccount ? { padding: '16px 0' } : {}}
      >
        <div className={styles.formTitle}>
          {I18N.carbonFootprint3.input}
          {isEdit && (!isBaseRootTreeNode || isProcess) && (
            <div>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item
                      onClick={() => addEmission()}
                      icon={
                        <img
                          src={addEmissionIcon}
                          style={{ width: 16, height: 16, marginLeft: 6 }}
                          alt={I18N.carbonFootprint3.emissionSourceIc}
                        />
                      }
                    >
                      {I18N.carbonFootprint.emissionSources}
                    </Menu.Item>
                    <Menu.Item
                      onClick={addProcess}
                      icon={
                        <img
                          src={addUnitIcon}
                          style={{ width: 16, height: 16, marginLeft: 6 }}
                          alt={I18N.carbonFootprint3.unitProcessI}
                        />
                      }
                    >
                      {I18N.carbonFootprint3.unitProcess}
                    </Menu.Item>
                  </Menu>
                }
              >
                <Button>
                  <Space>{I18N.carbonFootprint3.addInput}</Space>
                  <DownOutlined className='m-l-10' />
                </Button>
              </Dropdown>
              {!isProcess && (
                <Button
                  className='m-l-10'
                  disabled={!!importBackCode}
                  onClick={() => {
                    setImportEmissionFileVisible(true);
                  }}
                >
                  {importBackCode ? (
                    <>
                      正在导入中
                      <LoadingOutlined className='m-l-6' />
                    </>
                  ) : (
                    I18N.carbonFootprint.importEmissionSources
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
        <Table
          loading={loading}
          rowKey='id'
          columns={genInTableColumns(
            isBaseRootTreeNode && !isProcess,
            editProcessInClick,
            copyProcessInClick,
            deleteProcessInClick,
            isOnlyDetail,
            isHaveSetDetil,
            saveEmissionSourceInStore,
            isProcess,
          )}
          scroll={{ x: 1200 }}
          dataSource={libProcessInsData}
          pagination={false}
          // eslint-disable-next-line react/no-unstable-nested-components
          expandedRowRender={record =>
            tableExpanded && (
              <TableExpandAccountIn<any>
                record={record}
                isProcess={isProcess}
                apiExtraParams={apiExtraParams}
              />
            )
          }
          expandable={{
            expandedRowKeys,
            rowExpandable: record => [3, 4].includes(record.matchWay),
            onExpand: (expanded, record) => {
              setTableExpanded(expanded);
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record.id]);
              } else {
                const rowKeys = expandedRowKeys.filter(kk => kk !== record.id);
                setExpandedRowKeys(rowKeys);
              }
            },
          }}
        />
      </div>
    </>
  );
};

export default ProcessLibInOutTab;
