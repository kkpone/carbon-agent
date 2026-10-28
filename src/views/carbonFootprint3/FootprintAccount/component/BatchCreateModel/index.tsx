/**
 * @description 产品碳足迹批量解析后待建模确认弹框
 */
import {
  CaretDownFilled,
  CaretRightFilled,
  CheckCircleFilled,
  CloseOutlined,
  ExclamationCircleFilled,
  FolderFilled,
  InfoCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import AiIconImg from './ai-footprint3-modal.svg';

import ReferCountIcon from './refer-count-icon.svg';
import DividerHandleIcon from './divider-handle-icon.svg';
import TreeDragHandleIcon from './tree-drag-handle.svg';
import config from '@src/config';
import I18N from '@src/lang/I18N';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import { downloadFile, Toast } from '@src/utils';
import { STEP_OPTION_VALUE } from '@src/views/carbonFootprint3/util/constant';
import {
  Button,
  Cascader,
  Checkbox,
  DatePicker,
  Input,
  InputNumber,
  Modal,
  Pagination,
  Select,
  Spin,
  Switch,
  Table,
  Tooltip,
  Upload,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import classNames from 'classnames';
import dayjs, { Dayjs } from 'dayjs';
import {
  CSSProperties,
  FC,
  Fragment,
  MouseEvent,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import { FootprintAccountInfoUrlStatus } from '../../constant';
import { BuildModelDescribeSet } from '../AccountInfoBuildModel/constant';
import {
  BATCH_FILE_ACCEPT,
  BATCH_FILE_MAX_COUNT,
  BATCH_FILE_MAX_SIZE_MB,
  formatBatchFileSizeText,
  isBatchUploadFileAllowed,
} from '../batchFileUpload';
import styles from './index.module.less';
import {
  addBatchRefer,
  cancelBatchParse,
  changeBatchReferToT1,
  copyBatchReferTree,
  createBatchModel,
  deleteBatchReferTree,
  getAccountResults,
  getAccountTmpList,
  getBatchProductOptions,
  getBatchReferList,
  getBatchTaskInfo,
  getBatchUnitOptions,
  getReferTree,
  moveBatchReferTree,
  reparseBatchFile,
  saveBatchAccount,
} from './service';
import {
  BatchAccountTmp,
  BatchFile,
  BatchTaskInfo,
  BatchUploadFile,
  ByReferVo,
  DictOption,
  ProductOption,
  ReferTreeNode,
} from './type';
import {
  flattenReferTree,
  formatDateRange,
  formatDateTime,
  getFileKey,
  getFileType,
  getSortedFileLevels,
  groupFilesByLevel,
  isInvalidMoveCopyTarget,
  isSameFile,
  isT2OrAbove,
  uniqueFiles,
  updateReferTreeNode,
} from './utils';

/** 其他引用弹框表格每页条数 */
const OTHER_REFER_PAGE_SIZE = 8;

/** 参考 BatchParseModel Drawer 底部栏：固定贴底 + 右对齐按钮组 */
const modalFooterStyle: CSSProperties = {
  marginTop: 18,
  padding: '12px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 16,
  boxShadow: '0 -4px 4px rgba(0, 0, 0, 0.04)',
};

/** 批量建模主弹框层级；子弹框需更高，避免切换 tab 后被子级 mask 遮挡 */
const BATCH_CREATE_MODEL_Z_INDEX = 1000;
const BATCH_CREATE_MODEL_NESTED_MODAL_Z_INDEX = 1100;

const { RangePicker } = DatePicker;
const { confirm } = Modal;

type ModelRequiredField =
  | 'accountName'
  | 'productName'
  | 'amount'
  | 'unitCode'
  | 'dateRange'
  | 'scope'
  | 'scopeValue';

type ValidateFormResult =
  | { valid: true }
  | { valid: false; field: ModelRequiredField };

type ValidateAllBeforeCreateResult =
  | { valid: true; focusId?: number }
  | { valid: false; focusId?: number; field: ModelRequiredField };

type FormFieldErrors = Partial<Record<ModelRequiredField, string>>;

/** 收集建模表单必填项错误，供字段下方展示（不再使用 Toast） */
const collectFormFieldErrors = (record: BatchAccountTmp): FormFieldErrors => {
  const errors: FormFieldErrors = {};
  if (!record.accountName?.trim()) {
    errors.accountName = I18N.carbonFootprint3.pleaseInputFunctionalUnit;
  }
  if (!record.productId && !record.productName?.trim()) {
    errors.productName = `${I18N.carbonFootprint3.pleaseSelectOrEnter}${I18N.carbonFootprint3.relatedProduct}`;
  }
  if (!record.amount || Number(record.amount) <= 0) {
    errors.amount = I18N.carbonFootprint3.pleaseInputAccountingAmount;
  }
  if (!record.unitCode) {
    errors.unitCode = I18N.carbonFootprint3.pleaseSelectAccountingUnit;
  }
  if (!record.startTime || !record.endTime) {
    errors.dateRange = I18N.carbonFootprint3.pleaseSelectAccountingPeriod;
  }
  if (record.scope === undefined || record.scope === null) {
    errors.scope = I18N.carbonFootprint3.pleaseSelectSystemBoundary;
  }
  if (record.scope === 2 && !record.scopeValue) {
    errors.scopeValue = I18N.carbonFootprint3.pleaseSelectCustomScope;
  }
  return errors;
};

const clearFieldErrorsFromPatch = (
  prev: FormFieldErrors,
  patch: Partial<BatchAccountTmp>,
): FormFieldErrors => {
  const next = { ...prev };
  if ('accountName' in patch) {
    delete next.accountName;
  }
  if (
    'productId' in patch ||
    'productName' in patch ||
    'productFrom' in patch
  ) {
    delete next.productName;
  }
  if ('amount' in patch) {
    delete next.amount;
  }
  if ('unitCode' in patch || 'unitName' in patch) {
    delete next.unitCode;
  }
  if ('startTime' in patch || 'endTime' in patch) {
    delete next.dateRange;
  }
  if ('scope' in patch) {
    delete next.scope;
    if (patch.scope !== 2) {
      delete next.scopeValue;
    }
  }
  if ('scopeValue' in patch) {
    delete next.scopeValue;
  }
  return next;
};

const SCOPE_OPTIONS = [
  {
    value: 0,
    label: I18N.carbonFootprint3.halfLifeCycle,
    desc: I18N.carbonFootprint3.halfLifeCycleDesc,
  },
  {
    value: 1,
    label: I18N.carbonFootprint3.fullLifecycle,
    desc: I18N.carbonFootprint3.fullLifeCycleDesc,
  },
  {
    value: 2,
    label: I18N.carbonFootprint3.customLifeCycle,
    desc: '',
  },
] as const;

const CUSTOM_SCOPE_OPTIONS = [
  { label: I18N.carbonFootprint3.rawMaterialAcquisition, value: '0' },
  { label: I18N.carbonFootprint3.productionManufacturing, value: '1' },
  { label: I18N.carbonFootprint3.distributionStorage, value: '2' },
  { label: I18N.carbonFootprint3.productUse, value: '3' },
  { label: I18N.carbonFootprint3.wasteDisposal, value: '4' },
];

const BATCH_TASK_STATUS = {
  WAIT_MODEL: 1,
  MODELING: 2,
  MODEL_DONE: 3,
  MODEL_FAIL: 4,
} as const;

/** 首张 T1 卡片顶部插入区域高度，与 t1InsertZone 命中区一致 */
const T1_INSERT_TOP_EDGE_HEIGHT = 16;

type UnitCascaderOption = DictOption & {
  label: string;
  value: string;
  children?: UnitCascaderOption[];
};

const fileIconMap: Record<string, string> = {
  xls: 'icon-icon-excel2',
  xlsx: 'icon-icon-excel2',
  doc: 'icon-icon-word',
  docx: 'icon-icon-word',
  pdf: 'icon-icon-pdf',
  csv: 'icon-icon-csv',
  jpg: 'icon-icon-jpg',
  jpeg: 'icon-icon-jpg',
  png: 'icon-icon-png',
};

type BatchCreateModelProps = {
  open: boolean;
  batchId?: number;
  onClose: () => void;
  onCancelParseSuccess?: () => void;
};

const getResponseFile = (file: BatchUploadFile): BatchFile | undefined => {
  const data = file.response?.data;
  if (!data) {
    return undefined;
  }
  if (typeof data === 'string') {
    return {
      name: file.name,
      url: data,
      size: String(file.size || 0),
      sizeUnit: 'B',
      fileType: getFileType(file.name),
    };
  }
  if (!data.url) {
    return undefined;
  }
  return {
    name: data.name || file.name,
    url: data.url,
    size: String(file.size || 0),
    sizeUnit: 'B',
    fileType: getFileType(data.name || file.name),
  };
};

const toDateRange = (record?: BatchAccountTmp): [Dayjs, Dayjs] | undefined => {
  if (!record?.startTime || !record?.endTime) {
    return undefined;
  }
  return [dayjs(record.startTime), dayjs(record.endTime)];
};

const getReferId = (node: ReferTreeNode) => node.referId || node.id;

/** 收集默认展开的父节点 id，与 Figma 树默认展开一致 */
const getDefaultExpandedReferIds = (nodes: ReferTreeNode[]) => {
  const ids = new Set<number>();
  const walk = (list: ReferTreeNode[]) => {
    list.forEach(node => {
      if (node.children?.length) {
        ids.add(getReferId(node));
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return ids;
};

const BatchCreateModel: FC<BatchCreateModelProps> = ({
  open,
  batchId,
  onClose,
  onCancelParseSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [treeData, setTreeData] = useState<ReferTreeNode[]>([]);
  const [accountList, setAccountList] = useState<BatchAccountTmp[]>([]);
  const [taskInfo, setTaskInfo] = useState<BatchTaskInfo>();
  const [selectedReferId, setSelectedReferId] = useState<number>();
  const [formData, setFormData] = useState<BatchAccountTmp>({});
  const [formFieldErrors, setFormFieldErrors] = useState<FormFieldErrors>({});
  const [formDirty, setFormDirty] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [unitOptions, setUnitOptions] = useState<DictOption[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const skipProductBlurRef = useRef(false);
  const [fileTab, setFileTab] = useState<'supportFile' | 'dataFile'>(
    'supportFile',
  );
  const [otherReferOpen, setOtherReferOpen] = useState(false);
  const [otherReferNode, setOtherReferNode] = useState<ReferTreeNode>();
  const [otherReferLoading, setOtherReferLoading] = useState(false);
  const [otherReferList, setOtherReferList] = useState<ByReferVo[]>([]);
  const [otherReferPage, setOtherReferPage] = useState(1);
  const [selectFileOpen, setSelectFileOpen] = useState(false);
  const [selectedFileKeys, setSelectedFileKeys] = useState<string[]>([]);
  const [draggingReferId, setDraggingReferId] = useState<number>();
  const [dragHoverReferId, setDragHoverReferId] = useState<number>();
  const [dragHoverAction, setDragHoverAction] = useState<'move' | 'copy'>();
  const [t1InsertIndex, setT1InsertIndex] = useState<number>();
  const [expandedReferIds, setExpandedReferIds] = useState<Set<number>>(
    () => new Set(),
  );
  const [selectedResultId, setSelectedResultId] = useState<number>();
  const [showOriginalFiles, setShowOriginalFiles] = useState(false);
  const [originalFileLevel, setOriginalFileLevel] = useState('1');

  const flatTree = useMemo(() => flattenReferTree(treeData), [treeData]);
  const dragSourceNode = useMemo(
    () =>
      draggingReferId
        ? flatTree.find(item => getReferId(item) === draggingReferId)
        : undefined,
    [draggingReferId, flatTree],
  );
  const canDragToT1Insert = Boolean(
    dragSourceNode && isT2OrAbove(dragSourceNode),
  );
  const shouldShowSelectFileLevelTag = taskInfo?.fileWay === 1;
  const originalDataFiles = taskInfo?.dataFile || [];
  const isModeling = taskInfo?.status === BATCH_TASK_STATUS.MODELING;
  const isModelDone = taskInfo?.status === BATCH_TASK_STATUS.MODEL_DONE;
  const isModelFail = taskInfo?.status === BATCH_TASK_STATUS.MODEL_FAIL;
  const editDisabled = isModeling;
  const selectedResult = useMemo(
    () =>
      accountList.find(item => item.id === selectedResultId) || accountList[0],
    [accountList, selectedResultId],
  );
  const originalFileLevels = useMemo(
    () => getSortedFileLevels(originalDataFiles),
    [originalDataFiles],
  );
  const availableDataFiles = useMemo(
    () =>
      // “选择文件”只关联数据文件；仅展示 csv / excel，与批量解析上传规则一致
      uniqueFiles([
        ...originalDataFiles,
        ...accountList.flatMap(item => item.dataFile || []),
      ]).filter(file => isBatchUploadFileAllowed(file.name)),
    [accountList, originalDataFiles],
  );
  const unitCascaderOptions = useMemo<UnitCascaderOption[]>(() => {
    const map = new Map<string, UnitCascaderOption>();
    unitOptions.forEach(item => {
      const sourceType = item.sourceType || 'default';
      const sourceName = item.sourceName || '-';
      if (!map.has(sourceType)) {
        map.set(sourceType, {
          ...item,
          dictValue: sourceType,
          dictLabel: sourceName,
          label: sourceName,
          value: sourceType,
          sourceType,
          sourceName,
          children: [],
        });
      }
      map.get(sourceType)?.children?.push({
        ...item,
        label: item.dictLabel,
        value: item.dictValue,
      });
    });
    return [...map.values()];
  }, [unitOptions]);
  const unitCascaderValue = useMemo(() => {
    if (!formData.unitCode) {
      return undefined;
    }
    const matchedOption = unitCascaderOptions.find(option =>
      option.children?.some(
        item =>
          item.dictValue === formData.unitCode ||
          item.dictLabel === formData.unitCode,
      ),
    );
    const matchedChild = matchedOption?.children?.find(
      item =>
        item.dictValue === formData.unitCode ||
        item.dictLabel === formData.unitCode,
    );
    return matchedOption && matchedChild
      ? [matchedOption.value, matchedChild.value]
      : undefined;
  }, [formData.unitCode, unitCascaderOptions]);

  const loadData = async (nextSelectedReferId?: number) => {
    if (!batchId) {
      return;
    }
    setLoading(true);
    try {
      const [taskResp, treeResp] = await Promise.all([
        getBatchTaskInfo(batchId),
        getReferTree(batchId),
      ]);
      const nextTaskInfo = taskResp.data.data;
      const accountResp =
        nextTaskInfo?.status === BATCH_TASK_STATUS.MODEL_DONE
          ? await getAccountResults(batchId)
          : await getAccountTmpList(batchId);
      const nextTree = treeResp.data.data || [];
      const nextAccounts = accountResp.data.data || [];
      setTaskInfo(nextTaskInfo);
      setTreeData(nextTree);
      setAccountList(nextAccounts);
      if (nextTaskInfo?.status === BATCH_TASK_STATUS.MODEL_DONE) {
        setSelectedResultId(prev =>
          prev && nextAccounts.some(item => item.id === prev)
            ? prev
            : nextAccounts[0]?.id,
        );
        setShowOriginalFiles(false);
      }
      setExpandedReferIds(getDefaultExpandedReferIds(nextTree));
      const nextFlatTree = flattenReferTree(nextTree);
      const selected =
        nextSelectedReferId &&
        nextFlatTree.find(item => getReferId(item) === nextSelectedReferId)
          ? nextSelectedReferId
          : getReferId(nextFlatTree[0] || ({} as ReferTreeNode));
      setSelectedReferId(selected);
      const nextNode = nextFlatTree.find(item => getReferId(item) === selected);
      const nextAccount =
        nextAccounts.find(item => item.id === nextNode?.tmpId) || {};
      setFormData(nextAccount);
      setFormDirty(false);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountTmpList = async (nextFormId = formData.id) => {
    if (!batchId) {
      return accountList;
    }
    const { data } = await getAccountTmpList(batchId);
    const nextAccounts = data.data || [];
    setAccountList(nextAccounts);
    if (nextFormId) {
      const nextForm = nextAccounts.find(item => item.id === nextFormId);
      if (nextForm) {
        setFormData(nextForm);
      }
    }
    setFormDirty(false);
    return nextAccounts;
  };

  /** saveAccount 成功后刷新左侧引用树 */
  const refreshTree = async () => {
    if (!batchId) {
      return;
    }
    try {
      const { data } = await getReferTree(batchId);
      setTreeData(data.data || []);
    } catch {
      // refreshTree 为保存后的辅助刷新，失败时不打断主流程
    }
  };

  const loadResultData = async () => {
    if (!batchId) {
      return;
    }
    const { data } = await getAccountResults(batchId);
    const nextAccounts = data.data || [];
    setAccountList(nextAccounts);
    setSelectedResultId(prev =>
      prev && nextAccounts.some(item => item.id === prev)
        ? prev
        : nextAccounts[0]?.id,
    );
    setShowOriginalFiles(false);
  };

  useEffect(() => {
    if (!open || !batchId) {
      return;
    }
    loadData().catch(() => undefined);
    getBatchProductOptions()
      .then(setProductOptions)
      .catch(() => undefined);
    getBatchUnitOptions()
      .then(setUnitOptions)
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, open]);

  useEffect(() => {
    if (!open || !batchId || !isModeling) {
      return undefined;
    }
    let stopped = false;
    const pollTaskInfo = async () => {
      const { data } = await getBatchTaskInfo(batchId);
      if (stopped) {
        return;
      }
      const nextTaskInfo = data.data;
      setTaskInfo(nextTaskInfo);
      if (nextTaskInfo.status === BATCH_TASK_STATUS.MODEL_DONE) {
        await loadResultData();
      }
    };
    const timer = window.setInterval(() => {
      pollTaskInfo().catch(() => undefined);
    }, 3000);
    pollTaskInfo().catch(() => undefined);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [batchId, isModeling, open]);

  useEffect(() => {
    if (
      showOriginalFiles &&
      taskInfo?.fileWay === 1 &&
      originalFileLevels.length &&
      !originalFileLevels.includes(originalFileLevel)
    ) {
      setOriginalFileLevel(originalFileLevels[0]);
    }
  }, [
    originalFileLevel,
    originalFileLevels,
    showOriginalFiles,
    taskInfo?.fileWay,
  ]);

  const updateForm = (patch: Partial<BatchAccountTmp>) => {
    if (editDisabled) {
      return;
    }
    setFormData(prev => {
      const next = { ...prev, ...patch };
      const shouldSyncTree =
        patch.accountName !== undefined || patch.aiFill !== undefined;
      if (shouldSyncTree && (next.id || selectedReferId)) {
        setTreeData(treePrev =>
          updateReferTreeNode(
            treePrev,
            { tmpId: next.id, referId: selectedReferId },
            {
              ...(patch.accountName !== undefined
                ? { accountName: patch.accountName }
                : {}),
              ...(patch.aiFill !== undefined ? { aiFill: patch.aiFill } : {}),
            },
          ),
        );
      }
      return next;
    });
    setFormDirty(true);
    setFormFieldErrors(prev => clearFieldErrorsFromPatch(prev, patch));
  };

  const validateForm = (record = formData): ValidateFormResult => {
    const errors = collectFormFieldErrors(record);
    const firstInvalidField = (
      Object.keys(errors) as ModelRequiredField[]
    ).find(field => errors[field]);
    if (firstInvalidField) {
      return { valid: false, field: firstInvalidField };
    }
    return { valid: true };
  };

  const focusModelField = (field: ModelRequiredField) => {
    const fieldNode = document.querySelector<HTMLElement>(
      `[data-model-field="${field}"]`,
    );
    if (!fieldNode) {
      return;
    }
    fieldNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
    if (field === 'scope') {
      return;
    }
    const focusable = fieldNode.querySelector<HTMLElement>(
      [
        'input:not([disabled])',
        'textarea:not([disabled])',
        '.ant-input-number-input:not([disabled])',
        '.ant-select-selection-search-input:not([disabled])',
        '.ant-picker input:not([disabled])',
        'button:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(','),
    );
    (focusable || fieldNode).focus({ preventScroll: true });
  };

  /** 校验/提交前合并当前编辑中的 formData，避免未点保存时 accountList 仍是旧值 */
  const getAccountListWithCurrentForm = () => {
    if (!formData.id) {
      return accountList;
    }
    return accountList.map(item =>
      item.id === formData.id ? { ...item, ...formData } : item,
    );
  };

  const saveCurrent = async (showToast = true) => {
    if (!formData.id) {
      return true;
    }
    setSaveLoading(true);
    try {
      await saveBatchAccount(formData);
      await refreshTree();
      await loadAccountTmpList(formData.id);
      if (showToast) {
        Toast('success', I18N.carbonFootprint3.batchTaskSaveSuccess);
      }
      return true;
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSelectNode = async (node: ReferTreeNode) => {
    if (getReferId(node) === selectedReferId) {
      return;
    }
    if (!isModeling && formDirty) {
      const saved = await saveCurrent(false);
      if (!saved) {
        return;
      }
    }
    const nextAccounts = await loadAccountTmpList(node.tmpId);
    const nextAccount = nextAccounts.find(item => item.id === node.tmpId) || {};
    setSelectedReferId(getReferId(node));
    setFormData(nextAccount);
    setFormFieldErrors({});
    setFormDirty(false);
  };

  const handleAddNode = async () => {
    if (!batchId || editDisabled) {
      return;
    }
    const saved = formDirty ? await saveCurrent(false) : true;
    if (!saved) {
      return;
    }
    const { data } = await addBatchRefer({ batchId });
    await loadData(data.data);
  };

  const confirmDeleteReferTree = (
    referId: number,
    modelName: string,
    referCount: number,
    onSuccess?: () => Promise<void>,
  ) => {
    if (!batchId || editDisabled) {
      return;
    }
    confirm({
      className: styles.deleteConfirmModal,
      wrapClassName: styles.deleteConfirmModal,
      centered: true,
      width: 460,
      icon: null,
      closable: true,
      title: I18N.carbonFootprint3.confirmDeleteThisModel,
      content: (
        <div className={styles.deleteConfirmContent}>
          <ExclamationCircleFilled className={styles.deleteConfirmIcon} />
          <p className={styles.deleteConfirmText}>
            {I18N.carbonFootprint3.deleteModel}
            <span className={styles.deleteConfirmHighlight}>{modelName}</span>
            {I18N.carbonFootprint3.deleteModelReferMiddle}
            <span className={styles.deleteConfirmHighlight}>{referCount}</span>
            {I18N.carbonFootprint3.deleteModelReferEnd}
          </p>
        </div>
      ),
      okText: I18N.base.confirm,
      cancelText: I18N.carbonFootprint3.cancel,
      okButtonProps: { className: styles.deleteConfirmOkBtn },
      onOk: async () => {
        await deleteBatchReferTree({ batchId, referId });
        Toast('success', I18N.carbonFootprint3.deleteSuccess);
        if (onSuccess) {
          await onSuccess();
        } else {
          await loadData();
        }
      },
    });
  };

  const handleDeleteNode = (node: ReferTreeNode) => {
    if (!batchId || editDisabled) {
      return;
    }
    confirmDeleteReferTree(
      getReferId(node),
      node.accountName || I18N.carbonFootprint3.unnamedModel,
      node.referCount || 0,
    );
  };

  const handleDeleteOtherRefer = (record: ByReferVo) => {
    if (!batchId || !otherReferNode || editDisabled) {
      return;
    }
    confirmDeleteReferTree(
      record.referId,
      otherReferNode.accountName || I18N.carbonFootprint3.unnamedModel,
      otherReferNode.referCount || 0,
      async () => {
        await handleOpenOtherRefer(otherReferNode);
        await loadData(selectedReferId);
      },
    );
  };

  const handleOpenOtherRefer = async (node: ReferTreeNode) => {
    if (!batchId || !node.tmpId) {
      return;
    }
    setOtherReferNode(node);
    setOtherReferPage(1);
    setOtherReferOpen(true);
    setOtherReferLoading(true);
    try {
      const { data } = await getBatchReferList({
        batchId,
        tmpId: node.tmpId,
      });
      setOtherReferList(data.data || []);
    } finally {
      setOtherReferLoading(false);
    }
  };

  const handleMoveTree = async (
    source: ReferTreeNode,
    target: ReferTreeNode,
    copy = false,
  ) => {
    if (!batchId || editDisabled || getReferId(source) === getReferId(target)) {
      return;
    }
    const saved = formDirty ? await saveCurrent(false) : true;
    if (!saved) {
      return;
    }
    const req = {
      batchId,
      referId: getReferId(source),
      targetReferId: getReferId(target),
    };
    if (copy) {
      await copyBatchReferTree(req);
    } else {
      await moveBatchReferTree(req);
    }
    Toast('success', I18N.carbonFootprint3.operationSuccessful);
    // 移动/复制完成后，焦点保持在被拖拽的源菜单，而不是拖放目标菜单
    await loadData(getReferId(source));
  };

  const handleChangeToT1 = async (node: ReferTreeNode) => {
    if (!batchId || editDisabled) {
      return;
    }
    const saved = formDirty ? await saveCurrent(false) : true;
    if (!saved) {
      return;
    }
    await changeBatchReferToT1({ batchId, referId: getReferId(node) });
    Toast('success', I18N.carbonFootprint3.operationSuccessful);
    // 转为 T1 后仍选中被拖拽的源菜单
    await loadData(getReferId(node));
  };

  const handleReparse = () => {
    if (!batchId || editDisabled) {
      return;
    }
    confirm({
      wrapClassName: styles.confirmModal,
      title: I18N.carbonFootprint.prompt,
      content: I18N.carbonFootprint3.confirmReparseFile,
      onOk: async () => {
        await reparseBatchFile(batchId);
        Toast('success', I18N.carbonFootprint3.batchTaskParseStarted);
        await loadData();
      },
    });
  };

  const handleCancelParse = () => {
    if (!batchId || editDisabled) {
      return;
    }
    confirm({
      wrapClassName: styles.confirmModal,
      title: I18N.carbonFootprint.prompt,
      content: I18N.carbonFootprint3.confirmCancelParse,
      onOk: async () => {
        await cancelBatchParse(batchId);
        Toast('success', I18N.carbonFootprint3.operationSuccessful);
        onCancelParseSuccess?.();
        onClose();
      },
    });
  };

  const validateAllBeforeCreate = (
    accounts = getAccountListWithCurrentForm(),
    currentRecord = formData,
  ): ValidateAllBeforeCreateResult => {
    const currentValidateResult = validateForm(currentRecord);
    if (!currentValidateResult.valid) {
      return {
        valid: false,
        focusId: currentRecord.id,
        field: currentValidateResult.field,
      };
    }
    let invalidResult:
      | { account: BatchAccountTmp; field: ModelRequiredField }
      | undefined;
    accounts
      .filter(account => account.id !== currentRecord.id)
      .some(account => {
        const validateResult = validateForm(account);
        if (!validateResult.valid) {
          invalidResult = {
            account,
            field: validateResult.field,
          };
          return true;
        }
        return false;
      });
    if (invalidResult) {
      const { account, field } = invalidResult;
      const node = flatTree.find(item => item.tmpId === account.id);
      if (node) {
        setSelectedReferId(getReferId(node));
        setFormData(account);
      }
      return {
        valid: false,
        focusId: account.id,
        field,
      };
    }
    return {
      valid: true,
      focusId: currentRecord.id,
    };
  };

  const handleCreateModel = async () => {
    if (!formData.id || editDisabled) {
      return;
    }
    const currentForm = formData;
    let refreshFormId = currentForm.id;
    setCreateLoading(true);
    try {
      await saveBatchAccount(currentForm);
      const nextAccounts = await loadAccountTmpList(currentForm.id);
      const currentAccount =
        nextAccounts.find(item => item.id === currentForm.id) || currentForm;
      const validateResult = validateAllBeforeCreate(
        nextAccounts,
        currentAccount,
      );
      refreshFormId = validateResult.focusId || refreshFormId;
      if (!validateResult.valid) {
        const targetAccount =
          nextAccounts.find(item => item.id === validateResult.focusId) ||
          currentAccount;
        setFormFieldErrors(collectFormFieldErrors(targetAccount));
        if (validateResult.field) {
          window.setTimeout(() => focusModelField(validateResult.field), 0);
        }
        return;
      }
      setFormFieldErrors({});
      await createBatchModel(currentAccount);
      Toast('success', I18N.carbonFootprint3.batchModelStarted);
      setTaskInfo(prev =>
        prev
          ? { ...prev, status: BATCH_TASK_STATUS.MODELING }
          : ({
              id: batchId,
              status: BATCH_TASK_STATUS.MODELING,
            } as BatchTaskInfo),
      );
    } finally {
      await loadAccountTmpList(refreshFormId).catch(() => undefined);
      setCreateLoading(false);
    }
  };

  const getCurrentFiles = () => formData[fileTab] || [];

  const updateCurrentFiles = (files: BatchFile[]) => {
    updateForm({
      [fileTab]: files,
    } as Partial<BatchAccountTmp>);
  };

  const handleDeleteFile = (file: BatchFile) => {
    if (editDisabled) {
      return;
    }
    confirm({
      wrapClassName: styles.confirmModal,
      title: I18N.carbonFootprint.prompt,
      content: I18N.carbonFootprint3.confirmDeleteFile,
      onOk: async () => {
        updateCurrentFiles(
          getCurrentFiles().filter(item => !isSameFile(item, file)),
        );
      },
    });
  };

  const handleUploadFileChange = ({ file }: { file: BatchUploadFile }) => {
    if (editDisabled) {
      return;
    }
    if (file.status === 'done') {
      const nextFile = getResponseFile(file);
      if (!nextFile) {
        Toast('error', I18N.carbonFootprint3.uploadFileUrlMissing);
        return;
      }
      const merged = uniqueFiles([...getCurrentFiles(), nextFile]);
      if (merged.length > BATCH_FILE_MAX_COUNT) {
        Toast(
          'error',
          I18N.template(I18N.carbonFootprint3.maxUploadFileCount, {
            val1: BATCH_FILE_MAX_COUNT,
          }),
        );
        return;
      }
      updateCurrentFiles(merged);
    } else if (file.status === 'error') {
      Toast('error', I18N.carbonFootprint3.uploadFailedPlease);
    }
  };

  /** 待建模步骤上传前校验：格式、数量、大小与解析步骤一致 */
  const beforeBatchCreateUpload = (uploadFile: File) => {
    if (!isBatchUploadFileAllowed(uploadFile.name)) {
      Toast('error', I18N.carbonFootprint3.batchUploadFileTypeInvalid);
      return false;
    }
    if (getCurrentFiles().length >= BATCH_FILE_MAX_COUNT) {
      Toast(
        'error',
        I18N.template(I18N.carbonFootprint3.maxUploadFileCount, {
          val1: BATCH_FILE_MAX_COUNT,
        }),
      );
      return false;
    }
    if (uploadFile.size > BATCH_FILE_MAX_SIZE_MB * 1024 * 1024) {
      Toast(
        'error',
        I18N.template(I18N.components.theMaximumFileSizeIsNot, {
          val1: BATCH_FILE_MAX_SIZE_MB,
        }),
      );
      return false;
    }
    if (getCurrentFiles().some(item => item.name === uploadFile.name)) {
      Toast('error', I18N.components.pleaseDoNotRepeat);
      return false;
    }
    return true;
  };

  const handleSelectFiles = () => {
    if (editDisabled) {
      return;
    }
    // 反显当前模型已关联的数据文件（与可选池按 name/url 匹配）
    const currentDataFiles = formData.dataFile || [];
    setSelectedFileKeys(
      availableDataFiles
        .filter(file => currentDataFiles.some(item => isSameFile(item, file)))
        .map(file => getFileKey(file)),
    );
    setSelectFileOpen(true);
  };

  /** 切换文件 tab 时关闭选择文件弹框，避免 open 状态残留导致层级错乱 */
  const changeFileTab = (tab: 'supportFile' | 'dataFile') => {
    setFileTab(tab);
    setSelectFileOpen(false);
  };

  const confirmSelectFiles = () => {
    const selectedFiles = availableDataFiles.filter(file =>
      selectedFileKeys.includes(getFileKey(file)),
    );
    // 保留不在可选池中的本地上传文件，其余以弹框勾选结果为准
    const uploadOnlyFiles = getCurrentFiles().filter(
      file => !availableDataFiles.some(item => isSameFile(item, file)),
    );
    const merged = uniqueFiles([...uploadOnlyFiles, ...selectedFiles]);
    if (merged.length > BATCH_FILE_MAX_COUNT) {
      Toast(
        'error',
        I18N.template(I18N.carbonFootprint3.maxUploadFileCount, {
          val1: BATCH_FILE_MAX_COUNT,
        }),
      );
      return;
    }
    updateCurrentFiles(merged);
    setSelectFileOpen(false);
  };

  /** 拖拽引用树节点结束后重置状态 */
  const clearDragState = () => {
    setDraggingReferId(undefined);
    setDragHoverReferId(undefined);
    setDragHoverAction(undefined);
    setT1InsertIndex(undefined);
  };

  const toggleTreeExpand = (referId: number, event: MouseEvent) => {
    event.stopPropagation();
    setExpandedReferIds(prev => {
      const next = new Set(prev);
      if (next.has(referId)) {
        next.delete(referId);
      } else {
        next.add(referId);
      }
      return next;
    });
  };

  const renderT1InsertZone = (insertIndex: number) => {
    if (!canDragToT1Insert) {
      return null;
    }
    const isActive = t1InsertIndex === insertIndex;
    return (
      <div
        key={`t1-insert-${insertIndex}`}
        className={classNames(styles.t1InsertZone, {
          [styles.t1InsertZoneFirst]: insertIndex === 0,
          [styles.t1InsertZoneActive]: isActive,
        })}
        onDragOver={event => {
          event.preventDefault();
          event.stopPropagation();
          event.dataTransfer.dropEffect = 'move';
          setT1InsertIndex(insertIndex);
          setDragHoverReferId(undefined);
          setDragHoverAction(undefined);
        }}
        onDragLeave={event => {
          const related = event.relatedTarget as Node | null;
          if (related && event.currentTarget.contains(related)) {
            return;
          }
          if (t1InsertIndex === insertIndex) {
            setT1InsertIndex(undefined);
          }
        }}
        onDrop={event => {
          event.preventDefault();
          event.stopPropagation();
          if (!dragSourceNode) {
            return;
          }
          clearDragState();
          handleChangeToT1(dragSourceNode).catch(() => undefined);
        }}
      />
    );
  };

  const renderTreeList = () => {
    if (!treeData.length) {
      return <div className={styles.empty}>{I18N.carbonFootprint3.noData}</div>;
    }
    return (
      <>
        {treeData.map((node, index) => (
          <Fragment key={getReferId(node)}>
            {renderT1InsertZone(index)}
            {renderTreeNode(node, index)}
          </Fragment>
        ))}
        {renderT1InsertZone(treeData.length)}
      </>
    );
  };

  const renderTreeNode = (node: ReferTreeNode, rootIndex?: number) => {
    const referId = getReferId(node);
    const selected = selectedReferId === referId;
    const isDraggingSource = draggingReferId === referId;
    const isFirstRootNode = rootIndex === 0;
    const isInvalidDropTarget =
      !dragSourceNode ||
      isInvalidMoveCopyTarget(treeData, draggingReferId!, referId);
    const isDragTarget =
      draggingReferId !== undefined &&
      draggingReferId !== referId &&
      dragHoverReferId === referId &&
      t1InsertIndex === undefined &&
      !isInvalidDropTarget;
    const hasChildren = Boolean(node.children?.length);
    const expanded = expandedReferIds.has(referId);
    return (
      <div
        key={referId}
        className={classNames(styles.treeNodeWrap, {
          [styles.treeNodeWrapFirstInsertTarget]:
            isFirstRootNode && t1InsertIndex === 0,
        })}
      >
        <div
          className={classNames(styles.treeNode, {
            [styles.treeNodeT1]: !isT2OrAbove(node),
            [styles.treeNodeSelected]: selected,
            [styles.treeNodeDropTarget]: isDragTarget,
            [styles.treeNodeDragging]: isDraggingSource,
            [styles.treeNodeAiFill]: node.aiFill === 1,
          })}
          draggable={!editDisabled}
          onClick={() => handleSelectNode(node)}
          onDragStart={event => {
            const target = event.currentTarget as HTMLDivElement;
            // 同步加上拖拽样式，确保 setDragImage 快照与 Figma 虚线框一致
            target.classList.add(styles.treeNodeDragging);
            const rect = target.getBoundingClientRect();
            const offsetX = event.clientX - rect.left;
            const offsetY = event.clientY - rect.top;
            const dragPreview = target.cloneNode(true) as HTMLDivElement;
            dragPreview.style.position = 'fixed';
            dragPreview.style.top = '-9999px';
            dragPreview.style.left = '-9999px';
            dragPreview.style.width = `${rect.width}px`;
            dragPreview.style.height = `${rect.height}px`;
            document.body.appendChild(dragPreview);
            event.dataTransfer.setDragImage(dragPreview, offsetX, offsetY);
            requestAnimationFrame(() => {
              document.body.removeChild(dragPreview);
            });
            event.dataTransfer.setData('referId', String(referId));
            event.dataTransfer.effectAllowed = 'move';
            setDraggingReferId(referId);
          }}
          onDragEnd={event => {
            (event.currentTarget as HTMLDivElement).classList.remove(
              styles.treeNodeDragging,
            );
            clearDragState();
          }}
          onDragOver={event => {
            if (
              draggingReferId === undefined ||
              draggingReferId === referId ||
              isInvalidDropTarget
            ) {
              return;
            }
            if (
              canDragToT1Insert &&
              isFirstRootNode &&
              event.clientY - event.currentTarget.getBoundingClientRect().top <=
                T1_INSERT_TOP_EDGE_HEIGHT
            ) {
              event.preventDefault();
              event.stopPropagation();
              event.dataTransfer.dropEffect = 'move';
              setT1InsertIndex(0);
              setDragHoverReferId(undefined);
              setDragHoverAction(undefined);
              return;
            }
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
            setT1InsertIndex(undefined);
            setDragHoverReferId(prev => {
              if (prev !== referId) {
                setDragHoverAction(undefined);
              }
              return referId;
            });
          }}
          onDrop={event => {
            if (
              !canDragToT1Insert ||
              !isFirstRootNode ||
              !dragSourceNode ||
              event.clientY - event.currentTarget.getBoundingClientRect().top >
                T1_INSERT_TOP_EDGE_HEIGHT
            ) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            clearDragState();
            handleChangeToT1(dragSourceNode).catch(() => undefined);
          }}
          onDragLeave={event => {
            const related = event.relatedTarget as Node | null;
            if (related && event.currentTarget.contains(related)) {
              return;
            }
            if (dragHoverReferId === referId) {
              setDragHoverReferId(undefined);
              setDragHoverAction(undefined);
            }
            if (isFirstRootNode && t1InsertIndex === 0) {
              setT1InsertIndex(undefined);
            }
          }}
        >
          <div className={styles.treeNodeRow}>
            <div className={styles.treeNodeMain}>
              <span className={styles.treeLeadingIcon}>
                {hasChildren ? (
                  <button
                    type='button'
                    className={styles.treeExpandBtn}
                    onClick={event => toggleTreeExpand(referId, event)}
                  >
                    {expanded ? (
                      <CaretDownFilled className={styles.treeArrow} />
                    ) : (
                      <CaretRightFilled className={styles.treeArrow} />
                    )}
                  </button>
                ) : null}
                <span className={styles.treeDragHandle} aria-hidden>
                  <img
                    src={TreeDragHandleIcon}
                    alt=''
                    className={styles.treeDragHandleIcon}
                  />
                </span>
              </span>
              <div className={styles.treeNameGroup}>
                <span
                  className={styles.treeName}
                  title={node.accountName || '-'}
                >
                  {node.accountName || I18N.carbonFootprint3.unnamedModel}
                </span>
                {node.levelName && (
                  <span className={styles.levelTag}>{node.levelName}</span>
                )}
              </div>
            </div>
            <div className={styles.treeActions}>
              <div className={styles.referCountWrap}>
                <span className={styles.referIconBox}>
                  <img
                    src={ReferCountIcon}
                    alt=''
                    className={styles.referIconImg}
                  />
                </span>
                <span className={styles.referCount}>
                  {node.referCount || 0}
                </span>
              </div>
              {node.multiRefer === 1 && (
                <button
                  type='button'
                  className={styles.linkBtn}
                  onClick={event => {
                    event.stopPropagation();
                    handleOpenOtherRefer(node);
                  }}
                >
                  {I18N.carbonFootprint3.otherReference}
                </button>
              )}
              <button
                type='button'
                className={classNames(styles.dangerBtn, {
                  [styles.disabledBtn]: editDisabled,
                })}
                disabled={editDisabled}
                onClick={event => {
                  event.stopPropagation();
                  handleDeleteNode(node);
                }}
              >
                {I18N.Factors.delete}
              </button>
            </div>
          </div>
          {node.aiFill === 1 && (
            <span className={styles.aiFillTag}>
              {I18N.carbonFootprint3.aiFill}
            </span>
          )}
          {isDragTarget && dragSourceNode ? (
            <div className={styles.quickMoveActions}>
              <div
                className={classNames(
                  styles.quickMoveActionItem,
                  styles.quickMoveActionMove,
                  {
                    [styles.quickMoveActionInactive]:
                      dragHoverAction === 'copy',
                  },
                )}
                onDragOver={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragHoverAction('move');
                }}
                onDrop={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearDragState();
                  handleMoveTree(dragSourceNode, node, false).catch(
                    () => undefined,
                  );
                }}
              >
                {I18N.carbonFootprint3.moveToCurrentModel}
              </div>
              <div
                className={classNames(
                  styles.quickMoveActionItem,
                  styles.quickMoveActionCopy,
                  {
                    [styles.quickMoveActionActive]: dragHoverAction === 'copy',
                  },
                )}
                onDragOver={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  setDragHoverAction('copy');
                }}
                onDrop={event => {
                  event.preventDefault();
                  event.stopPropagation();
                  clearDragState();
                  handleMoveTree(dragSourceNode, node, true).catch(
                    () => undefined,
                  );
                }}
              >
                {I18N.carbonFootprint3.copyToCurrentModel}
              </div>
            </div>
          ) : null}
        </div>
        {hasChildren && expanded ? (
          <div className={styles.treeChildGroup}>
            {node.children!.map(child => renderTreeNode(child))}
          </div>
        ) : null}
      </div>
    );
  };

  const renderRequiredLabel = (label: string, required = true) => (
    <div className={styles.formLabel}>
      {required && <span>*</span>}
      {label}
    </div>
  );

  const getFieldStatus = (field: ModelRequiredField) =>
    formFieldErrors[field] ? ('error' as const) : undefined;

  const renderFormFieldError = (field: ModelRequiredField) => {
    const message = formFieldErrors[field];
    if (!message) {
      return null;
    }
    return <div className={styles.formFieldError}>{message}</div>;
  };

  const renderFileCard = (file: BatchFile) => {
    const disabledDelete =
      fileTab === 'dataFile' &&
      originalDataFiles.some(item => isSameFile(item, file));
    return (
      <div className={styles.fileCard} key={getFileKey(file)}>
        <div className={styles.fileInfo}>
          <IconAlibabaNew
            className={styles.fileIcon}
            type={fileIconMap[getFileType(file.name)] || fileIconMap.xls}
          />
          <div>
            <div className={styles.fileName} title={file.name}>
              {file.name || '-'}
            </div>
            <div className={styles.fileDate}>
              {formatBatchFileSizeText(file.size, file.sizeUnit)}
            </div>
          </div>
        </div>
        <div className={styles.fileActions}>
          <button
            type='button'
            className={styles.linkBtn}
            onClick={() => downloadFile(file.url, file.name)}
          >
            {I18N.carbonFootprint.download}
          </button>
          <button
            type='button'
            className={classNames(styles.dangerBtn, {
              [styles.disabledBtn]: disabledDelete || editDisabled,
            })}
            disabled={disabledDelete || editDisabled}
            onClick={() => handleDeleteFile(file)}
          >
            {I18N.Factors.delete}
          </button>
        </div>
      </div>
    );
  };

  const otherColumns: ColumnsType<ByReferVo> = useMemo(
    () => [
      {
        title: I18N.carbonFootprint3.locatedLevel,
        dataIndex: 'levelName',
        width: 120,
        render: (_, record) =>
          record.levelName || (record.level ? `T${record.level}` : '-'),
      },
      {
        title: I18N.carbonFootprint3.downstreamProduct,
        dataIndex: 'parentName',
        width: 200,
        ellipsis: true,
        render: value => value || '-',
      },
      {
        title: I18N.carbonFootprint3.upstreamComposition,
        dataIndex: 'childNames',
        width: 200,
        ellipsis: true,
        render: value => value || '-',
      },
      {
        title: I18N.carbonFootprint.operation,
        dataIndex: 'operation',
        width: 100,
        render: (_, record) => (
          <button
            type='button'
            className={classNames(styles.dangerBtn, {
              [styles.disabledBtn]: editDisabled,
            })}
            disabled={editDisabled}
            onClick={() => handleDeleteOtherRefer(record)}
          >
            {I18N.Factors.delete}
          </button>
        ),
      },
    ],
    [batchId, editDisabled, handleDeleteOtherRefer],
  );

  const paginatedOtherReferList = useMemo(() => {
    const start = (otherReferPage - 1) * OTHER_REFER_PAGE_SIZE;
    return otherReferList.slice(start, start + OTHER_REFER_PAGE_SIZE);
  }, [otherReferList, otherReferPage]);

  const getScopeText = (record?: BatchAccountTmp) => {
    if (!record) {
      return '-';
    }
    if (record.scope === 2) {
      const values = record.scopeValue?.split(',').filter(Boolean) || [];
      const labels = values
        .map(
          value =>
            CUSTOM_SCOPE_OPTIONS.find(item => item.value === value)?.label,
        )
        .filter(Boolean);
      return labels.length
        ? `${I18N.carbonFootprint3.customLifeCycle}：${labels.join('、')}`
        : I18N.carbonFootprint3.customLifeCycle;
    }
    return (
      SCOPE_OPTIONS.find(item => item.value === record.scope)?.label || '-'
    );
  };

  const getFileSubText = (file: BatchFile) =>
    file.createTime || file.uploadTime || file.size
      ? file.createTime?.slice(0, 10) ||
        file.uploadTime?.slice(0, 10) ||
        formatBatchFileSizeText(file.size, file.sizeUnit)
      : '-';

  /** 建模结果 delFlag=1 时「进入建模」按钮只读不可点 */
  const isEnterModelingDisabled = (record?: BatchAccountTmp) =>
    !record?.accountId || Number(record?.delFlag) === 1;

  const handleEnterModeling = (record?: BatchAccountTmp) => {
    if (isEnterModelingDisabled(record) || !record?.productId) {
      return;
    }
    const route =
      `${RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccountDetail}` +
      `?productId=${record.productId}` +
      `&status=${FootprintAccountInfoUrlStatus.EDIT}` +
      `&accountId=${record.accountId}` +
      `&stepValue=${STEP_OPTION_VALUE.MODEL}` +
      `&listOrGraph=${BuildModelDescribeSet.VISUAL}`;
    window.open(
      `${window.location.origin}${config.BASENAME || ''}${route}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const renderResultStatusIcon = (record: BatchAccountTmp) =>
    record.accountStatus === 2 ? (
      <CheckCircleFilled className={styles.resultStatusSuccess} />
    ) : (
      <ExclamationCircleFilled className={styles.resultStatusWarning} />
    );

  const renderDownloadFileRow = (file: BatchFile) => (
    <div className={styles.resultFileRow} key={getFileKey(file)}>
      <div className={styles.fileInfo}>
        <IconAlibabaNew
          className={styles.fileIcon}
          type={fileIconMap[getFileType(file.name)] || fileIconMap.xls}
        />
        <div>
          <div className={styles.resultFileName} title={file.name}>
            {file.name || '-'}
          </div>
          <div className={styles.fileDate}>{getFileSubText(file)}</div>
        </div>
      </div>
      {file.url ? (
        <button
          type='button'
          className={styles.linkBtn}
          onClick={() => downloadFile(file.url, file.name)}
        >
          {I18N.carbonFootprint.download}
        </button>
      ) : null}
    </div>
  );

  const renderResultFiles = (files: BatchFile[] = []) =>
    files.length ? (
      <div className={styles.resultFileList}>
        {files.map(renderDownloadFileRow)}
      </div>
    ) : (
      <div className={styles.empty}>{I18N.carbonFootprint3.noData}</div>
    );

  const renderResultMenu = () => (
    <div className={styles.resultMenu}>
      <div className={styles.resultMenuScroll}>
        <div className={styles.resultMenuList}>
          {accountList.map(item => {
            const selected =
              !showOriginalFiles && selectedResult?.id === item.id;
            return (
              <div
                key={item.id}
                className={classNames(styles.resultMenuItem, {
                  [styles.resultMenuItemActive]: selected,
                })}
                onClick={() => {
                  setShowOriginalFiles(false);
                  setSelectedResultId(item.id);
                }}
              >
                <div className={styles.resultMenuNameWrap}>
                  {renderResultStatusIcon(item)}
                  <div className={styles.resultMenuNameOuter}>
                    <Tooltip
                      title={
                        item.accountName || I18N.carbonFootprint3.unnamedModel
                      }
                      placement='top'
                    >
                      <span className={styles.resultMenuName}>
                        {item.accountName || I18N.carbonFootprint3.unnamedModel}
                      </span>
                    </Tooltip>
                  </div>
                </div>
                {item.levelName ? (
                  <Tooltip title={item.levelName} placement='top'>
                    <span className={styles.resultLevelTag}>
                      {item.levelName}
                    </span>
                  </Tooltip>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      <div className={styles.originalFileSection}>
        <div
          className={classNames(styles.originalFileEntry, {
            [styles.originalFileEntryActive]: showOriginalFiles,
          })}
          onClick={() => setShowOriginalFiles(true)}
        >
          <div className={styles.originalFileName}>
            <FolderFilled className={styles.originalFileIcon} />
            <span>{I18N.carbonFootprint3.originalFile}</span>
          </div>
          <span className={styles.originalFileCount}>
            {originalDataFiles.length}
          </span>
        </div>
      </div>
    </div>
  );

  const renderResultField = (
    label: string,
    content: ReactNode,
    className?: string,
  ) => (
    <div className={classNames(styles.resultField, className)}>
      <div className={styles.resultFieldLabel}>{label}</div>
      <div className={styles.resultFieldValue}>{content || '-'}</div>
    </div>
  );

  const renderModelResultDetail = () => {
    const record = selectedResult;
    if (!record) {
      return <div className={styles.empty}>{I18N.carbonFootprint3.noData}</div>;
    }
    const isCalculationUnfinished = record.accountStatus !== 2;
    const emissionText = isCalculationUnfinished
      ? I18N.carbonFootprint3.unfinishedCalculation
      : `${record.emissionTotal} kgCO₂e`;
    return (
      <div className={styles.resultDetail}>
        <div className={styles.resultDetailHeader}>
          <div className={styles.resultDetailTitleWrap}>
            <span className={styles.resultDetailTitle}>
              {I18N.carbonFootprint3.modelInfo}
            </span>
            {Number(record.delFlag) === 1 ? (
              <span className={styles.resultDeletedTag}>
                {I18N.carbonFootprint3.modelDeleted}
              </span>
            ) : null}
          </div>
          <Button
            type='primary'
            className={styles.resultEnterBtn}
            disabled={isEnterModelingDisabled(record)}
            onClick={() => handleEnterModeling(record)}
          >
            {I18N.carbonFootprint3.enterModeling}
          </Button>
        </div>
        <div className={styles.resultTopFields}>
          {renderResultField(
            I18N.carbonFootprint3.modelCalculationResult,
            <span
              className={classNames(styles.resultEmission, {
                [styles.resultEmissionEmpty]: isCalculationUnfinished,
              })}
            >
              {emissionText}
            </span>,
          )}
          {renderResultField(
            I18N.carbonFootprint3.functionalUnits,
            record.accountName || '-',
          )}
        </div>
        <div className={styles.adviceBox}>
          <div className={styles.adviceTitle}>
            <InfoCircleOutlined />
            {I18N.carbonFootprint3.modelCheckAdvice}
          </div>
          {record.advice?.length ? (
            <ol className={styles.adviceList}>
              {record.advice.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          ) : (
            <div className={styles.emptyAdvice}>
              {I18N.carbonFootprint3.noData}
            </div>
          )}
        </div>
        <div className={styles.resultInfoGrid}>
          {renderResultField(
            I18N.carbonFootprint3.supplier,
            record.supplierName || '-',
          )}
          {renderResultField(
            I18N.carbonFootprint3.relatedProduct,
            <div className={styles.resultProduct}>
              <span>{record.productName || '-'}</span>
              {record.productName && record.productFrom === 0 ? (
                <span className={styles.newProductTagInline}>
                  {I18N.carbonFootprint3.new}
                </span>
              ) : null}
            </div>,
          )}
          {renderResultField(
            I18N.carbonFootprint3.accountingAmount,
            `${record.amount || '-'}${record.unitName || ''}`,
          )}
          {renderResultField(
            I18N.carbonFootprint.accountingCycle,
            formatDateRange(record.startTime, record.endTime),
          )}
          {renderResultField(
            I18N.carbonFootprint.systemBoundary,
            getScopeText(record),
          )}
        </div>
        <div className={styles.resultFilesSection}>
          <div className={styles.fileTabs}>
            <button
              type='button'
              className={fileTab === 'supportFile' ? styles.fileTabActive : ''}
              onClick={() => changeFileTab('supportFile')}
            >
              {I18N.carbonFootprint3.relatedSupportFile}
            </button>
            <button
              type='button'
              className={fileTab === 'dataFile' ? styles.fileTabActive : ''}
              onClick={() => changeFileTab('dataFile')}
            >
              {I18N.carbonFootprint3.relatedDataFile}
            </button>
          </div>
          {renderResultFiles(record[fileTab] || [])}
        </div>
      </div>
    );
  };

  const renderOriginalFiles = () => {
    const groupedFiles = groupFilesByLevel(originalDataFiles);
    const levelFiles = groupedFiles.get(originalFileLevel) || [];
    const shouldShowLevelTabs = taskInfo?.fileWay === 1;
    return (
      <div className={styles.resultDetail}>
        <div className={styles.resultDetailHeader}>
          <span className={styles.resultDetailTitle}>
            {I18N.carbonFootprint3.fileList}
          </span>
        </div>
        {shouldShowLevelTabs ? (
          <div className={styles.originalLevelTabs}>
            {(originalFileLevels.length ? originalFileLevels : ['1']).map(
              level => (
                <button
                  key={level}
                  type='button'
                  className={classNames(styles.originalLevelTab, {
                    [styles.originalLevelTabActive]:
                      originalFileLevel === level,
                  })}
                  onClick={() => setOriginalFileLevel(level)}
                >
                  T{level}
                </button>
              ),
            )}
          </div>
        ) : null}
        {renderResultFiles(
          shouldShowLevelTabs ? levelFiles : originalDataFiles,
        )}
      </div>
    );
  };

  const renderResultPage = () => (
    <div className={styles.resultContent}>
      {renderResultMenu()}
      <div className={styles.resultRightPanel}>
        {showOriginalFiles ? renderOriginalFiles() : renderModelResultDetail()}
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        width={1264}
        centered
        destroyOnClose
        closable={false}
        zIndex={BATCH_CREATE_MODEL_Z_INDEX}
        className={styles.createModelModal}
        styles={{
          content: { padding: 0 },
          body: { padding: 0 },
          footer: modalFooterStyle,
        }}
        footer={
          isModelDone ? null : (
            <div className={styles.footerActions}>
              <Button
                className={styles.footerBtn}
                disabled={editDisabled}
                onClick={handleCancelParse}
              >
                {I18N.carbonFootprint3.cancelParse}
              </Button>
              <Button
                className={styles.footerBtn}
                disabled={editDisabled}
                loading={saveLoading}
                onClick={() => saveCurrent()}
              >
                {I18N.carbonFootprint3.saveOnly}
              </Button>
              <Button
                type='primary'
                className={[styles.footerBtn, styles.primaryBtn].join(' ')}
                disabled={editDisabled}
                loading={createLoading}
                onClick={handleCreateModel}
              >
                {I18N.carbonFootprint3.startModeling}
              </Button>
            </div>
          )
        }
        onCancel={onClose}
        afterClose={() => {
          setTreeData([]);
          setAccountList([]);
          setTaskInfo(undefined);
          setSelectedReferId(undefined);
          setFormData({});
          setFormFieldErrors({});
          setFormDirty(false);
          setExpandedReferIds(new Set());
          setSelectedResultId(undefined);
          setShowOriginalFiles(false);
          setOriginalFileLevel('1');
          setSelectFileOpen(false);
          setSelectedFileKeys([]);
          setFileTab('supportFile');
        }}
      >
        <div className={styles.modalRoot}>
          <div className={styles.modalBody}>
            <div className={styles.header}>
              <div className={styles.titleWrap}>
                <img src={AiIconImg} alt='AI' className={styles.aiLogo} />
                <span className={styles.title}>
                  {I18N.carbonFootprint3.batchParseModeling}
                </span>
              </div>
              <CloseOutlined className={styles.closeIcon} onClick={onClose} />
            </div>
            <div className={styles.mainBlock}>
              <div
                className={classNames(styles.tipRow, {
                  [styles.tipRowError]: isModelFail,
                  [styles.tipRowModeling]: isModeling,
                })}
              >
                <InfoCircleOutlined className={styles.infoIcon} />
                {isModelDone
                  ? I18N.carbonFootprint3.batchModelResultTip
                  : isModeling
                  ? `${I18N.carbonFootprint3.modelingInProgress}，${I18N.carbonFootprint3.modelingInProgressTip}`
                  : isModelFail
                  ? I18N.carbonFootprint3.modelingFailedTip
                  : I18N.carbonFootprint3.batchCreateModelTip}
              </div>
              <div
                className={classNames(styles.bodyWrap, {
                  [styles.bodyWrapResult]: isModelDone,
                })}
              >
                {isModelDone ? (
                  renderResultPage()
                ) : (
                  <Spin spinning={loading}>
                    <div className={styles.content}>
                      <div className={styles.treePanel}>
                        <div className={styles.panelHeader}>
                          <span className={styles.panelTitle}>
                            {I18N.carbonFootprint3.pendingModelProducts}
                          </span>
                          <div className={styles.headerActions}>
                            <Tooltip
                              placement='top'
                              title={I18N.carbonFootprint3.batchAddModel}
                            >
                              <Button
                                disabled={editDisabled}
                                icon={<PlusOutlined />}
                                onClick={handleAddNode}
                              />
                            </Tooltip>
                            <Tooltip
                              placement='top'
                              title={I18N.carbonFootprint3.batchReIdentify}
                            >
                              <Button
                                className={styles.headerActionRefresh}
                                disabled={editDisabled}
                                icon={<ReloadOutlined />}
                                onClick={handleReparse}
                              />
                            </Tooltip>
                          </div>
                        </div>
                        <div className={styles.treeList}>
                          {renderTreeList()}
                        </div>
                      </div>
                      <div className={styles.dividerHandle}>
                        <img
                          src={DividerHandleIcon}
                          alt=''
                          className={styles.dividerHandleIcon}
                        />
                      </div>
                      <div className={styles.formPanel}>
                        <div className={styles.panelHeader}>
                          <span className={styles.panelTitle}>
                            {I18N.carbonFootprint3.modelInfo}
                          </span>
                          <div className={styles.aiSwitch}>
                            {I18N.carbonFootprint3.aiFillEmissionVisible}
                            <Switch
                              size='small'
                              disabled={editDisabled}
                              checked={formData.aiFill === 1}
                              onChange={checked =>
                                updateForm({ aiFill: checked ? 1 : 0 })
                              }
                            />
                          </div>
                        </div>
                        <div className={styles.formFields}>
                          <div className={styles.formGrid}>
                            <div
                              className={styles.formField}
                              data-model-field='accountName'
                            >
                              {renderRequiredLabel(
                                I18N.carbonFootprint3.functionalUnits,
                              )}
                              <div className={styles.formControlWrap}>
                                <Input
                                  disabled={editDisabled}
                                  maxLength={100}
                                  status={getFieldStatus('accountName')}
                                  value={formData.accountName}
                                  placeholder={
                                    I18N.carbonFootprint3.pleaseEnter
                                  }
                                  onChange={event =>
                                    updateForm({
                                      accountName: event.target.value,
                                    })
                                  }
                                />
                                {renderFormFieldError('accountName')}
                              </div>
                            </div>
                            <div className={styles.formField}>
                              {renderRequiredLabel(
                                I18N.carbonFootprint3.supplier,
                                false,
                              )}
                              <Input
                                disabled={editDisabled}
                                maxLength={100}
                                value={formData.supplierName}
                                placeholder={I18N.carbonFootprint3.pleaseEnter}
                                onChange={event =>
                                  updateForm({
                                    supplierName: event.target.value,
                                  })
                                }
                              />
                            </div>
                            <div
                              className={styles.formField}
                              data-model-field='productName'
                            >
                              {renderRequiredLabel(
                                I18N.carbonFootprint3.relatedProduct,
                              )}
                              <div className={styles.formControlWrap}>
                                <div className={styles.productSelectWrap}>
                                  <Tooltip
                                    title={formData.productName || undefined}
                                    placement='top'
                                  >
                                    <Select
                                      disabled={editDisabled}
                                      showSearch
                                      allowClear
                                      status={getFieldStatus('productName')}
                                      className={styles.productSelect}
                                      value={
                                        formData.productId ||
                                        formData.productName ||
                                        undefined
                                      }
                                      placeholder={
                                        I18N.carbonFootprint3.pleaseSelect
                                      }
                                      optionFilterProp='label'
                                      onSearch={value => {
                                        skipProductBlurRef.current = false;
                                        setProductSearch(value);
                                      }}
                                      onBlur={() => {
                                        if (skipProductBlurRef.current) {
                                          skipProductBlurRef.current = false;
                                          return;
                                        }
                                        const searchValue =
                                          productSearch.trim();
                                        if (
                                          searchValue &&
                                          !productOptions.some(
                                            item =>
                                              item.productName === searchValue,
                                          )
                                        ) {
                                          updateForm({
                                            productId:
                                              null as unknown as number,
                                            productName: searchValue,
                                            productFrom: 0,
                                          });
                                        }
                                        setProductSearch('');
                                      }}
                                      onClear={() => {
                                        skipProductBlurRef.current = true;
                                        setProductSearch('');
                                        updateForm({
                                          // 清空时必须显式传 null，否则 JSON 会忽略 undefined，后端可能保留旧 productId
                                          productId: null as unknown as number,
                                          productName: '',
                                          productFrom: null as unknown as 0 | 1,
                                        });
                                      }}
                                      onChange={(value, option: any) => {
                                        skipProductBlurRef.current = true;
                                        setProductSearch('');
                                        if (!value) {
                                          updateForm({
                                            // 清空时必须显式传 null，否则 JSON 会忽略 undefined，后端可能保留旧 productId
                                            productId:
                                              null as unknown as number,
                                            productName: '',
                                            productFrom: null as unknown as
                                              | 0
                                              | 1,
                                          });
                                          return;
                                        }
                                        updateForm({
                                          productId: Number(value),
                                          productName: option?.label
                                            ? String(option.label)
                                            : undefined,
                                          productFrom: 1,
                                        });
                                      }}
                                      options={productOptions.map(item => ({
                                        value: item.id,
                                        label: item.productName,
                                      }))}
                                    />
                                  </Tooltip>
                                  {formData.productName &&
                                  formData.productFrom === 0 ? (
                                    <span className={styles.newProductTag}>
                                      {I18N.carbonFootprint3.new}
                                    </span>
                                  ) : null}
                                </div>
                                {renderFormFieldError('productName')}
                              </div>
                            </div>
                            <div className={styles.formField}>
                              {renderRequiredLabel(
                                I18N.carbonFootprint3.accountingAmount,
                              )}
                              <div className={styles.amountRow}>
                                <div className={styles.formControlWrap}>
                                  <InputNumber
                                    data-model-field='amount'
                                    disabled={editDisabled}
                                    min={0}
                                    max={10000000000}
                                    precision={4}
                                    status={getFieldStatus('amount')}
                                    value={
                                      formData.amount
                                        ? Number(formData.amount)
                                        : undefined
                                    }
                                    placeholder={
                                      I18N.carbonFootprint3.accountingAmount
                                    }
                                    onChange={value =>
                                      updateForm({
                                        amount: value
                                          ? String(value)
                                          : undefined,
                                      })
                                    }
                                  />
                                  {renderFormFieldError('amount')}
                                </div>
                                <div className={styles.formControlWrap}>
                                  <Cascader
                                    data-model-field='unitCode'
                                    allowClear={false}
                                    status={getFieldStatus('unitCode')}
                                    className={styles.unitCascader}
                                    disabled={editDisabled}
                                    displayRender={labels =>
                                      labels?.[1] || labels?.join(' / ')
                                    }
                                    options={unitCascaderOptions}
                                    value={unitCascaderValue}
                                    placeholder={I18N.carbonFootprint3.unit}
                                    onChange={(value, selectedOptions) => {
                                      const unit = selectedOptions?.[1] as
                                        | UnitCascaderOption
                                        | undefined;
                                      updateForm({
                                        unitCode: value?.[1]
                                          ? String(value[1])
                                          : undefined,
                                        unitName:
                                          unit?.dictLabel || unit?.label,
                                      });
                                    }}
                                  />
                                  {renderFormFieldError('unitCode')}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className={styles.formField}>
                            {renderRequiredLabel(
                              I18N.carbonFootprint.accountingCycle,
                            )}
                            <div className={styles.formControlWrap}>
                              <RangePicker
                                data-model-field='dateRange'
                                disabled={editDisabled}
                                status={getFieldStatus('dateRange')}
                                className={styles.rangePicker}
                                value={toDateRange(formData)}
                                format='YYYY.MM.DD'
                                onChange={dates => {
                                  updateForm({
                                    startTime: dates?.[0]
                                      ? formatDateTime(
                                          dates[0].format('YYYY-MM-DD'),
                                        )
                                      : undefined,
                                    endTime: dates?.[1]
                                      ? `${dates[1].format(
                                          'YYYY-MM-DD',
                                        )} 23:59:59`
                                      : undefined,
                                  });
                                }}
                              />
                              {renderFormFieldError('dateRange')}
                            </div>
                          </div>
                          <div className={styles.formField}>
                            {renderRequiredLabel(
                              I18N.carbonFootprint.systemBoundary,
                            )}
                            <div className={styles.formControlWrap}>
                              <div
                                className={styles.scopeSection}
                                data-model-field='scope'
                              >
                                <div className={styles.scopeRow}>
                                  {SCOPE_OPTIONS.filter(
                                    scope => scope.value !== 2,
                                  ).map(scope => (
                                    <div
                                      key={scope.value}
                                      tabIndex={editDisabled ? -1 : 0}
                                      className={classNames(styles.scopeCard, {
                                        [styles.scopeCardActive]:
                                          formData.scope === scope.value,
                                      })}
                                      onClick={() =>
                                        !editDisabled &&
                                        updateForm({
                                          scope: scope.value,
                                          scopeValue: undefined,
                                        })
                                      }
                                    >
                                      <div className={styles.scopeCardTitle}>
                                        {scope.label}
                                      </div>
                                      {scope.desc ? (
                                        <div className={styles.scopeCardDesc}>
                                          {scope.desc.split('\n').map(line => (
                                            <p
                                              key={line}
                                              className={
                                                styles.scopeCardDescLine
                                              }
                                            >
                                              {line}
                                            </p>
                                          ))}
                                        </div>
                                      ) : null}
                                    </div>
                                  ))}
                                </div>
                                <div
                                  tabIndex={editDisabled ? -1 : 0}
                                  className={classNames(
                                    styles.customScopeCard,
                                    {
                                      [styles.scopeCardActive]:
                                        formData.scope === 2,
                                    },
                                  )}
                                  onClick={() =>
                                    !editDisabled && updateForm({ scope: 2 })
                                  }
                                >
                                  <div className={styles.scopeCardTitle}>
                                    {I18N.carbonFootprint3.customLifeCycle}
                                  </div>
                                  <div
                                    data-model-field='scopeValue'
                                    className={classNames(styles.scopeChecks, {
                                      [styles.scopeChecksEnabled]:
                                        formData.scope === 2,
                                    })}
                                    onClick={event => event.stopPropagation()}
                                  >
                                    {CUSTOM_SCOPE_OPTIONS.map(option => {
                                      const checkedValues =
                                        formData.scopeValue
                                          ?.split(',')
                                          .filter(Boolean) || [];
                                      const checked = checkedValues.includes(
                                        option.value,
                                      );
                                      return (
                                        <Checkbox
                                          key={option.value}
                                          disabled={
                                            formData.scope !== 2 || editDisabled
                                          }
                                          checked={checked}
                                          onChange={event => {
                                            const nextValues = event.target
                                              .checked
                                              ? [...checkedValues, option.value]
                                              : checkedValues.filter(
                                                  value =>
                                                    value !== option.value,
                                                );
                                            updateForm({
                                              scope: 2,
                                              scopeValue: nextValues.join(','),
                                            });
                                          }}
                                        >
                                          {option.label}
                                        </Checkbox>
                                      );
                                    })}
                                  </div>
                                </div>
                                {renderFormFieldError('scopeValue')}
                              </div>
                              {renderFormFieldError('scope')}
                            </div>
                          </div>
                        </div>
                        <div className={styles.fileSection}>
                          <div className={styles.fileTabHeader}>
                            <div className={styles.fileTabs}>
                              <button
                                type='button'
                                className={
                                  fileTab === 'supportFile'
                                    ? styles.fileTabActive
                                    : ''
                                }
                                onClick={() => changeFileTab('supportFile')}
                              >
                                {I18N.carbonFootprint3.relatedSupportFile}
                              </button>
                              <button
                                type='button'
                                className={
                                  fileTab === 'dataFile'
                                    ? styles.fileTabActive
                                    : ''
                                }
                                onClick={() => changeFileTab('dataFile')}
                              >
                                {I18N.carbonFootprint3.relatedDataFile}
                              </button>
                            </div>
                            <div className={styles.uploadActions}>
                              {fileTab === 'dataFile' && (
                                <button
                                  type='button'
                                  className={styles.linkBtn}
                                  disabled={editDisabled}
                                  onClick={handleSelectFiles}
                                >
                                  {I18N.carbonFootprint3.selectFile}
                                </button>
                              )}
                              <Upload
                                disabled={
                                  editDisabled ||
                                  getCurrentFiles().length >=
                                    BATCH_FILE_MAX_COUNT
                                }
                                showUploadList={false}
                                accept={BATCH_FILE_ACCEPT}
                                beforeUpload={beforeBatchCreateUpload}
                                action={`${
                                  process.env.REACT_APP_API_URL || ''
                                }/file/file/uploadOSS`}
                                onChange={handleUploadFileChange}
                              >
                                <button
                                  type='button'
                                  className={styles.uploadBtn}
                                  disabled={editDisabled}
                                >
                                  {I18N.carbonFootprint3.uploadFile}
                                </button>
                              </Upload>
                            </div>
                          </div>
                          <div className={styles.fileList}>
                            {getCurrentFiles().length ? (
                              getCurrentFiles().map(renderFileCard)
                            ) : (
                              <div className={styles.empty}>
                                {I18N.carbonFootprint3.noData}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Spin>
                )}
              </div>
            </div>
          </div>
        </div>
      </Modal>
      <Modal
        open={otherReferOpen}
        width={704}
        centered
        destroyOnClose
        closable={false}
        zIndex={BATCH_CREATE_MODEL_NESTED_MODAL_Z_INDEX}
        className={styles.otherReferModal}
        styles={{
          content: { padding: 0 },
          body: { padding: 0 },
          footer: modalFooterStyle,
        }}
        footer={
          <div className={styles.otherReferFooter}>
            <div className={styles.otherReferPaginationTotal}>
              <span>{I18N.carbonFootprint3.totalPrefix}</span>
              <span className={styles.otherReferPaginationCount}>
                {otherReferList.length}
              </span>
              <span>{I18N.carbonFootprint3.totalRecordSuffix}</span>
            </div>
            <Pagination
              current={otherReferPage}
              pageSize={OTHER_REFER_PAGE_SIZE}
              total={otherReferList.length}
              showSizeChanger={false}
              onChange={page => setOtherReferPage(page)}
            />
          </div>
        }
        onCancel={() => setOtherReferOpen(false)}
      >
        <div className={styles.otherReferModalRoot}>
          <div className={styles.otherReferHeader}>
            <span className={styles.otherReferTitle}>
              {I18N.carbonFootprint3.otherReference}：
              {otherReferNode?.accountName ||
                I18N.carbonFootprint3.unnamedModel}
            </span>
            <CloseOutlined
              className={styles.otherReferClose}
              onClick={() => setOtherReferOpen(false)}
            />
          </div>
          <div className={styles.otherReferBody}>
            <Table<ByReferVo>
              rowKey='referId'
              className={styles.otherReferTable}
              loading={otherReferLoading}
              columns={otherColumns}
              dataSource={paginatedOtherReferList}
              tableLayout='fixed'
              pagination={false}
            />
          </div>
        </div>
      </Modal>
      <Modal
        open={selectFileOpen}
        width={564}
        centered
        destroyOnClose
        zIndex={BATCH_CREATE_MODEL_NESTED_MODAL_Z_INDEX}
        className={styles.selectFileModal}
        title={I18N.carbonFootprint3.selectFile}
        onCancel={() => setSelectFileOpen(false)}
        onOk={confirmSelectFiles}
      >
        <div className={styles.selectFileGrid}>
          {availableDataFiles.map(file => {
            const fileKey = getFileKey(file);
            const checked = selectedFileKeys.includes(fileKey);
            return (
              <div
                key={fileKey}
                className={classNames(styles.selectFileCard, {
                  [styles.selectFileCardChecked]: checked,
                })}
                onClick={() =>
                  setSelectedFileKeys(prev =>
                    checked
                      ? prev.filter(item => item !== fileKey)
                      : [...prev, fileKey],
                  )
                }
              >
                <Checkbox checked={checked} />
                <IconAlibabaNew
                  className={styles.fileIcon}
                  type={fileIconMap[getFileType(file.name)] || fileIconMap.xls}
                />
                <div className={styles.selectFileMeta}>
                  <Tooltip title={file.name || '-'} placement='top'>
                    <div className={styles.selectFileName}>
                      {file.name || '-'}
                    </div>
                  </Tooltip>
                  <div className={styles.selectFileSubRow}>
                    {shouldShowSelectFileLevelTag ? (
                      <span className={styles.levelTag}>
                        T{file.level || 1}
                      </span>
                    ) : null}
                    <div className={styles.fileDate}>
                      {formatBatchFileSizeText(file.size, file.sizeUnit)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </>
  );
};

export default BatchCreateModel;
