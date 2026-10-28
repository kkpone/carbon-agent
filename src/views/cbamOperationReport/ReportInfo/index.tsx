/* eslint-disable no-restricted-syntax, no-continue, no-await-in-loop -- evidence mutations must preserve dataVersion order */
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Cascader,
  DatePicker,
  Drawer,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Select,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import I18N from '@src/lang/I18N';

import {
  CbamDrawerClose,
  CbamDrawerTitle,
} from '@/components/CbamDrawerHeader';
import { useCityInfo } from '@/hooks/useCityInfo';
import { CBAMRouteMaps } from '@/router/utils/cbam';
import {
  getMonitorDetail,
  getMonitorOrgTree,
  MonitorOrgOption,
} from '@/views/cbamMonitor/service';
import {
  MonitorEvidence,
  MonitorEvidenceRelation,
} from '@/views/cbamMonitor/types';
import planBackIcon from '@/views/cbamMonitor/assets/plan-back.svg';

import factoryInfoIcon from '../assets/factory-info.svg';
import DataGapManager from './components/DataGapManager';
import EvidenceManager from '../components/EvidenceManager';
import Co2EvidenceModal, {
  Co2EvidenceDraft,
  evidenceValues,
} from './components/Co2EvidenceModal';
import ConditionInfo from './components/ConditionInfo';
import ProductionInfo from './components/ProductionInfo';
import {
  addOperationReport,
  addOperationEvidence,
  deleteOperationEvidence,
  editOperationEvidence,
  getOperationEvidences,
  getOperationAccountingTasks,
  getOperationFactories,
  getOperationFactoryInfo,
  getOperationMonitorPlans,
  getOperationReport,
  saveOperationComplete,
  saveOperationDraft,
  selectOperationEvidence,
} from '../service';
import {
  DataGapData,
  EvidenceRelationData,
  OperationCompletion,
  OperationCbamProductJson,
  OperationCo2StageJson,
  OperationDirectEmissionJson,
  OperationElectricityJson,
  OperationFacilityElectricityJson,
  OperationHeatFlowJson,
  OperationIndustryParameterJson,
  OperationNonCbamProductJson,
  OperationOption,
  OperationPrecursorJson,
  OperationProcessJson,
  OperationReportDetail,
  OperationReportPayload,
  OperationEvidence,
  OperationWasteGasJson,
  OperationZeroRatedFuelJson,
  JsonObject,
} from '../types';
import {
  calculateOperationCompletionPreview,
  OPERATION_SECTION_CODES,
  OperationSectionCode,
} from '../completion';
import { parseJson, requestErrorMessage, stringifyJson } from '../utils';
import styles from './index.module.less';

interface ReportFormValue {
  reportName?: string;
  reportPeriod?: [Dayjs, Dayjs];
  versionNo?: string;
  submitTarget?: string;
  deviateDesc?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  detailedAddress?: string;
  postalCode?: string;
  postBox?: string;
  regionCodes?: string[];
  compileDate?: Dayjs;
  reviewDate?: Dayjs;
  compilerName?: string;
  reviewerName?: string;
  methodChangeDesc?: string;
  confidentialDesc?: string;
  processJson?: string;
  cbamProductJson?: string;
  precursorJson?: string;
  directEmissionJson?: string;
  nonCbamProductJson?: string;
  electricityJson?: string;
  heatFlowJson?: string;
  wasteGasJson?: string;
  industryParameterJson?: string;
  zeroRatedFuelJson?: string;
  facilityElectricityJson?: string;
  co2StageJson?: string;
}

type ConfigNavKey = 'general' | 'process' | 'condition' | 'quality';

interface EvidenceModalContext {
  itemKey: string;
  partCode: string;
  sourceItemKey?: string;
  sourcePartCodes: string[];
  relatedDataLabel: string;
}

const CONFIG_NAV_ITEMS: { key: ConfigNavKey; label: string }[] = [
  { key: 'general', label: I18N.cbamOperationReport.generalInformation },
  { key: 'process', label: I18N.cbamOperationReport.productionInformation },
  {
    key: 'condition',
    label: I18N.cbamOperationReport.conditionalItemInformation,
  },
  { key: 'quality', label: I18N.cbamOperationReport.preparationAndQuality },
];

const CONFIG_NAV_SECTION_CODES: Record<ConfigNavKey, string[]> = {
  general: ['REPORT_INFO', 'ASSOCIATION_INFO', 'OPERATOR_INFO'],
  process: [
    'PROCESS_BOUNDARY',
    'PROCESS_INFO',
    'CBAM_PRODUCT',
    'PRECURSOR',
    'DIRECT_EMISSION',
    'NON_CBAM_PRODUCT',
    'ELECTRICITY_CONSUMPTION',
    'HEAT_FLOW',
    'WASTE_GAS',
  ],
  condition: ['ZERO_RATED_FUEL', 'FACILITY_ELECTRICITY', 'CO2_STAGE'],
  quality: ['QUALITY', 'DATA_GAP'],
};

const EVIDENCE_PART_LABELS: Record<string, string> = {
  CBAM_PRODUCT: I18N.cbamOperationReport.cbamProducts,
  PRECURSOR: I18N.cbamOperationReport.purchasedPrecursors,
  DIRECT_EMISSION: I18N.cbamOperationReport.directEmissions,
  NON_CBAM_PRODUCT: I18N.cbamOperationReport.nonCbamProducts,
  ELECTRICITY_CONSUMPTION: I18N.cbamOperationReport.electricityConsumption,
  FACILITY_ELECTRICITY: I18N.cbamOperationReport.onsiteElectricityGeneration,
  HEAT_FLOW: I18N.cbamOperationReport.heatFlows,
  WASTE_GAS: I18N.cbamOperationReport.wasteGas,
  CO2_STAGE: I18N.cbamOperationReport.co2CaptureTransferUseStorage,
};

const EMPTY_COMPLETION: OperationCompletion = {
  completedCount: 0,
  totalCount: 17,
  completionRate: 0,
  pendingItems: [],
};

const nestedText = (root: JsonObject | undefined, path: string[]) => {
  let value: unknown = root;
  for (const key of path) {
    if (!value || Array.isArray(value) || typeof value !== 'object') return '-';
    value = (value as JsonObject)[key];
  }
  return value === undefined || value === null || value === ''
    ? '-'
    : String(value);
};

const collectOrgNames = (items: MonitorOrgOption[]): Record<number, string> =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item.id]: item.name,
      ...collectOrgNames(item.children || []),
    }),
    {},
  );

const mergeJson = <T extends object>(
  base: T | undefined,
  text?: string,
): T | undefined => {
  const current = parseJson(text);
  if (!current) return base;
  return { ...(base || {}), ...current } as T;
};

const mergeJsonWithSourceCopies = <T extends object>(
  base: T | undefined,
  text: string | undefined,
  sourceKeys: string[],
): T | undefined => {
  const current = parseJson(text);
  if (!current) return base;
  const result = { ...(base || {}), ...current } as T;
  const baseRecord = objectValue(base);
  const resultRecord = result as unknown as JsonObject;
  sourceKeys.forEach(key => {
    const sourceItems = baseRecord[key];
    const currentItems = current[key];
    if (
      Array.isArray(sourceItems) &&
      sourceItems.length > 0 &&
      Array.isArray(currentItems) &&
      currentItems.length === 0
    ) {
      resultRecord[key] = sourceItems;
    }
  });
  return result;
};

const preserveProcessCopies = (
  persisted: OperationProcessJson | undefined,
  current: OperationProcessJson | undefined,
): OperationProcessJson | undefined => {
  if (!persisted || !current || !persisted.processes.length)
    return current || persisted;
  const candidates = [...current.processes];
  const processes = persisted.processes.map(source => {
    const index = candidates.findIndex(
      target =>
        target.itemKey === source.itemKey ||
        Boolean(
          source.sourceItemKey && target.sourceItemKey === source.sourceItemKey,
        ) ||
        (!source.sourceItemKey && target.processName === source.processName),
    );
    if (index < 0) return source;
    const target = candidates.splice(index, 1)[0];
    return {
      ...source,
      ...target,
      itemKey: source.itemKey,
      sourceItemKey: source.sourceItemKey,
      accountingProcessId: source.accountingProcessId,
      processName: source.processName,
      productItemKeys: source.productItemKeys,
      precursorItemKeys: source.precursorItemKeys,
      sourceRouteNames: source.sourceRouteNames,
      sortNo: source.sortNo,
    };
  });
  return { ...persisted, ...current, processes };
};

const objectValue = (value: unknown): JsonObject =>
  value && !Array.isArray(value) && typeof value === 'object'
    ? (value as JsonObject)
    : {};
const displayReadOnlyValue = (value: unknown) =>
  value === undefined || value === null || String(value).trim() === ''
    ? '-'
    : String(value);

const linkedCo2MonitorEvidences = (plan?: JsonObject): MonitorEvidence[] => {
  const sourceCo2 = objectValue(objectValue(plan?.condition).co2StageJson);
  const relations = Array.isArray(plan?.evidenceRelations)
    ? (plan?.evidenceRelations as MonitorEvidenceRelation[])
    : [];
  const linkedIds = new Set(
    relations
      .filter(item => item.partCode === 8 && item.itemKey === sourceCo2.itemKey)
      .map(item => item.evidenceId),
  );
  return (
    Array.isArray(plan?.evidences) ? (plan?.evidences as MonitorEvidence[]) : []
  ).filter(item => item.id != null && linkedIds.has(item.id));
};

const snapshotBoundaryInfo = (
  value: OperationProcessJson | undefined,
  sourcePlan?: JsonObject,
) => {
  const result: OperationProcessJson = {
    processes: [],
    productProcesses: [],
    processRelations: [],
    reportBoundaryFiles: [],
    ...(value || {}),
  };
  const facility = objectValue(sourcePlan?.facility);
  const facilityJson = objectValue(facility.facilityJson);
  const goodsBoundary = objectValue(sourcePlan?.goodsBoundary);
  const systemBoundary = objectValue(goodsBoundary.systemBoundaryJson);
  if (
    !Object.prototype.hasOwnProperty.call(result, 'reportProcessDescription')
  ) {
    result.reportProcessDescription =
      typeof facilityJson.processDescription === 'string'
        ? facilityJson.processDescription
        : undefined;
  }
  if (
    !Object.prototype.hasOwnProperty.call(result, 'reportBoundaryDescription')
  ) {
    result.reportBoundaryDescription =
      typeof systemBoundary.boundaryDescription === 'string'
        ? systemBoundary.boundaryDescription
        : undefined;
  }
  if (!Object.prototype.hasOwnProperty.call(result, 'reportBoundaryFiles')) {
    result.reportBoundaryFiles = Array.isArray(systemBoundary.files)
      ? systemBoundary.files
      : [];
  }
  return result;
};

const validateBoundaryInfo = (value: OperationProcessJson) => {
  if (!String(value.reportProcessDescription || '').trim()) {
    throw new Error(
      I18N.template(I18N.cbamOperationReport.requiredField, {
        field: I18N.cbamOperationReport.onsiteProcessDescription,
      }),
    );
  }
  if (!String(value.reportBoundaryDescription || '').trim()) {
    throw new Error(
      I18N.template(I18N.cbamOperationReport.requiredField, {
        field: I18N.cbamOperationReport.boundaryCompletenessDescription,
      }),
    );
  }
};

const normalizedRouteNames = (values: string[]) =>
  [...new Set(values.map(item => item.trim()).filter(Boolean))]
    .sort()
    .join('\n');

const validateProcessInfo = (value: OperationProcessJson) => {
  value.processes.forEach(process => {
    if (!process.description?.trim()) {
      throw new Error(
        I18N.template(I18N.cbamOperationReport.requiredField, {
          field: `${
            process.processName || I18N.cbamOperationReport.unnamedProcess
          } - ${I18N.cbamOperationReport.processDescription}`,
        }),
      );
    }
    if (!process.routes.length) {
      throw new Error(
        I18N.template(I18N.cbamOperationReport.requiredField, {
          field: `${
            process.processName || I18N.cbamOperationReport.unnamedProcess
          } - ${I18N.cbamOperationReport.productionRouteLabel}`,
        }),
      );
    }
    process.routes.forEach(route => {
      if (!route.routeName?.trim()) {
        throw new Error(
          I18N.template(I18N.cbamOperationReport.requiredField, {
            field: I18N.cbamOperationReport.productionRouteLabel,
          }),
        );
      }
      if (!route.productionQuantity?.trim()) {
        throw new Error(
          I18N.template(I18N.cbamOperationReport.requiredField, {
            field: I18N.cbamOperationReport.routeProductionQuantity,
          }),
        );
      }
    });
    if (
      normalizedRouteNames(process.sourceRouteNames || []) !==
        normalizedRouteNames(
          process.routes.map(route => route.routeName || ''),
        ) &&
      !process.routeChangeDesc?.trim()
    ) {
      throw new Error(
        I18N.template(I18N.cbamOperationReport.requiredField, {
          field: I18N.cbamOperationReport.routeChangeDescription,
        }),
      );
    }
  });
};

type OperationReportInfoProps = {
  embedded?: boolean;
  readonly?: boolean;
  refreshKey?: string;
};

const OperationReportInfo = ({
  embedded = false,
  readonly: readonlyProp = false,
  refreshKey,
}: OperationReportInfoProps) => {
  const history = useHistory();
  const location = useLocation();
  const [form] = Form.useForm<ReportFormValue>();
  const watchedFormValues = Form.useWatch([], {
    form,
    preserve: true,
  }) as ReportFormValue | undefined;
  const regionOptions = useCityInfo(3);
  const rawOperationId = new URLSearchParams(location.search).get(
    'operationId',
  );
  const queryOperationId =
    rawOperationId && /^\d+$/.test(rawOperationId) ? rawOperationId : undefined;
  const pageMode = location.pathname.endsWith('/show')
    ? 'show'
    : location.pathname.endsWith('/add')
    ? 'add'
    : 'edit';
  const readonly = readonlyProp || pageMode === 'show';
  const dirtyRef = useRef(false);
  const lastRefreshKeyRef = useRef(refreshKey);
  const loadSequenceRef = useRef(0);
  const [operationId, setOperationId] = useState<number | string | undefined>(
    queryOperationId,
  );
  const [detail, setDetail] = useState<OperationReportDetail>();
  const [serverUpdatePending, setServerUpdatePending] = useState(false);
  const [factoryId, setFactoryId] = useState<number>();
  const [planId, setPlanId] = useState<number>();
  const [accountId, setAccountId] = useState<number>();
  const [factories, setFactories] = useState<OperationOption[]>([]);
  const [plans, setPlans] = useState<OperationOption[]>([]);
  const [accounts, setAccounts] = useState<OperationOption[]>([]);
  const [dataGaps, setDataGaps] = useState<DataGapData[]>([]);
  const [confirmedNoGaps, setConfirmedNoGaps] = useState(false);
  const [relations, setRelations] = useState<EvidenceRelationData[]>([]);
  const [completion, setCompletion] =
    useState<OperationCompletion>(EMPTY_COMPLETION);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<'draft' | 'complete'>();
  const [factoryDrawerOpen, setFactoryDrawerOpen] = useState(false);
  const [factoryInfo, setFactoryInfo] = useState<JsonObject>();
  const [monitorPlanInfo, setMonitorPlanInfo] = useState<JsonObject>();
  const [orgNames, setOrgNames] = useState<Record<number, string>>({});
  const [activeTab, setActiveTab] = useState<'config' | 'evidence'>('config');
  const [activeNav, setActiveNav] = useState<ConfigNavKey>('general');
  const [evidenceModalContext, setEvidenceModalContext] =
    useState<EvidenceModalContext>();
  const [co2EvidenceDrafts, setCo2EvidenceDrafts] = useState<
    Co2EvidenceDraft[]
  >([]);
  const sourcePlan = monitorPlanInfo || detail?.monitorPlan;
  const sourceEvidences = Array.isArray(sourcePlan?.evidences)
    ? (sourcePlan?.evidences as MonitorEvidence[])
    : [];
  const co2ItemKey =
    detail?.condition?.co2StageJson?.itemKey ||
    (parseJson(form.getFieldValue('co2StageJson'))?.itemKey as
      | string
      | undefined) ||
    'operation-co2-stage';
  const co2SourceItemKey =
    detail?.condition?.co2StageJson?.sourceItemKey ||
    (parseJson(form.getFieldValue('co2StageJson'))?.sourceItemKey as
      | string
      | undefined);

  const markDirty = (value = true) => {
    dirtyRef.current = value;
  };

  const applyDetail = useCallback(
    (value: OperationReportDetail) => {
      setDetail(value);
      setOperationId(value.operationId);
      setFactoryId(value.factoryId);
      setPlanId(value.planId);
      setAccountId(value.accountId);
      setDataGaps(value.dataGaps || []);
      setConfirmedNoGaps(
        Boolean(value.quality?.noDataGap) && !value.dataGaps?.length,
      );
      setRelations(value.evidenceRelations || []);
      setCompletion(value.completion || EMPTY_COMPLETION);
      setMonitorPlanInfo(value.monitorPlan);
      form.setFieldsValue({
        reportName: value.reportName,
        reportPeriod:
          value.startDate && value.endDate
            ? [dayjs(value.startDate), dayjs(value.endDate)]
            : undefined,
        versionNo: value.versionNo,
        submitTarget: value.submitTarget,
        deviateDesc: value.deviateDesc,
        contactName: value.contactName,
        contactEmail: value.contactEmail,
        contactPhone: value.contactPhone,
        detailedAddress: value.detailedAddress,
        postalCode: value.postalCode,
        postBox: value.postBox,
        regionCodes: value.regionCodes?.map(String),
        compileDate: value.quality?.compileDate
          ? dayjs(value.quality.compileDate)
          : dayjs(),
        reviewDate: value.quality?.reviewDate
          ? dayjs(value.quality.reviewDate)
          : undefined,
        compilerName: value.quality?.compilerName,
        reviewerName: value.quality?.reviewerName,
        methodChangeDesc: value.quality?.methodChangeDesc,
        confidentialDesc: value.quality?.confidentialDesc,
        processJson: stringifyJson(value.processData?.processJson),
        cbamProductJson: stringifyJson(value.processData?.cbamProductJson),
        precursorJson: stringifyJson(value.processData?.precursorJson),
        directEmissionJson: stringifyJson(
          value.processData?.directEmissionJson,
        ),
        nonCbamProductJson: stringifyJson(
          value.processData?.nonCbamProductJson,
        ),
        electricityJson: stringifyJson(value.processData?.electricityJson),
        heatFlowJson: stringifyJson(value.processData?.heatFlowJson),
        wasteGasJson: stringifyJson(value.processData?.wasteGasJson),
        industryParameterJson: stringifyJson(
          value.condition?.industryParameterJson,
        ),
        zeroRatedFuelJson: stringifyJson(value.condition?.zeroRatedFuelJson),
        facilityElectricityJson: stringifyJson(
          value.condition?.facilityElectricityJson,
        ),
        co2StageJson: stringifyJson(value.condition?.co2StageJson),
      });
      markDirty(false);
    },
    [form],
  );

  const loadDetail = useCallback(
    async (id: number | string, preserveEdits = false) => {
      const sequence = ++loadSequenceRef.current;
      setLoading(true);
      try {
        const response = await getOperationReport(id);
        const value = response.data?.data;
        if (!value) throw new Error(I18N.cbamOperationReport.reportNotFound);
        if (sequence !== loadSequenceRef.current) return;
        if (preserveEdits && dirtyRef.current) {
          setServerUpdatePending(true);
          return;
        }
        applyDetail(value);
        setServerUpdatePending(false);
        const [planResponse, accountResponse, factoryResponse] =
          await Promise.all([
            getOperationMonitorPlans(value.factoryId),
            getOperationAccountingTasks(value.planId),
            getOperationFactoryInfo(value.factoryId),
          ]);
        if (sequence !== loadSequenceRef.current) return;
        setPlans(planResponse.data?.data || []);
        setAccounts(accountResponse.data?.data || []);
        setFactoryInfo(factoryResponse.data?.data);
      } catch (error) {
        message.error(
          requestErrorMessage(error, I18N.cbamOperationReport.reportLoadFailed),
        );
      } finally {
        if (sequence === loadSequenceRef.current) setLoading(false);
      }
    },
    [applyDetail],
  );

  useEffect(() => {
    Promise.all([getOperationFactories(), getMonitorOrgTree()]).then(
      ([factoryResponse, orgResponse]) => {
        setFactories(factoryResponse.data?.data || []);
        setOrgNames(collectOrgNames(orgResponse.data?.data || []));
      },
    );
  }, []);

  useEffect(() => {
    if (operationId) loadDetail(operationId);
  }, [loadDetail, operationId]);

  useEffect(() => {
    if (lastRefreshKeyRef.current === refreshKey) return;
    lastRefreshKeyRef.current = refreshKey;
    if (!operationId) return;
    if (dirtyRef.current) {
      // 保留未保存的表单值，由保存时的版本校验防止旧数据覆盖新结果。
      message.info(I18N.cbamOperationReport.agentUpdatePreserved);
      setServerUpdatePending(true);
      return;
    }
    loadDetail(operationId, true);
  }, [refreshKey, operationId, loadDetail]);

  useEffect(() => {
    if (!operationId) return undefined;
    const unblock = history.block(() =>
      dirtyRef.current
        ? I18N.cbamOperationReport.unsavedLeaveConfirm
        : undefined,
    );
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => {
      unblock();
      window.removeEventListener('beforeunload', beforeUnload);
    };
  }, [history, operationId]);

  const changeFactory = async (value?: number) => {
    setFactoryId(value);
    setPlanId(undefined);
    setAccountId(undefined);
    setPlans([]);
    setAccounts([]);
    setFactoryInfo(undefined);
    setMonitorPlanInfo(undefined);
    setCo2EvidenceDrafts([]);
    if (!operationId)
      form.setFieldsValue({
        processJson: undefined,
        cbamProductJson: undefined,
        precursorJson: undefined,
        directEmissionJson: undefined,
        nonCbamProductJson: undefined,
        electricityJson: undefined,
        heatFlowJson: undefined,
        wasteGasJson: undefined,
        co2StageJson: undefined,
      });
    if (value) {
      const [planResponse, factoryResponse] = await Promise.all([
        getOperationMonitorPlans(value),
        getOperationFactoryInfo(value),
      ]);
      setPlans(planResponse.data?.data || []);
      setFactoryInfo(factoryResponse.data?.data);
    }
  };

  const changePlan = async (value?: number) => {
    setPlanId(value);
    setAccountId(undefined);
    setAccounts([]);
    setMonitorPlanInfo(undefined);
    setCo2EvidenceDrafts([]);
    if (!operationId)
      form.setFieldsValue({
        processJson: undefined,
        cbamProductJson: undefined,
        precursorJson: undefined,
        directEmissionJson: undefined,
        nonCbamProductJson: undefined,
        electricityJson: undefined,
        heatFlowJson: undefined,
        wasteGasJson: undefined,
        co2StageJson: undefined,
      });
    if (value) {
      const [accountResponse, monitorResponse] = await Promise.all([
        getOperationAccountingTasks(value),
        getMonitorDetail(value),
      ]);
      setAccounts(accountResponse.data?.data || []);
      const monitorPlan = monitorResponse.data?.data as unknown as JsonObject;
      setMonitorPlanInfo(monitorPlan);
      setCo2EvidenceDrafts(
        linkedCo2MonitorEvidences(monitorPlan).map(item => ({
          ...item,
          draftKey: `source:${item.id}`,
          sourceEvidenceId: item.id,
        })),
      );
    }
  };

  const buildPayload = (
    values: ReportFormValue,
    currentOperationId?: number | string,
    currentDataVersion?: number,
    currentDetail?: OperationReportDetail,
    requireComplete = false,
  ): OperationReportPayload => {
    const mergedProcessJson = mergeJsonWithSourceCopies<OperationProcessJson>(
      currentDetail?.processData?.processJson,
      values.processJson,
      ['productProcesses', 'processRelations'],
    );
    const processJson = snapshotBoundaryInfo(
      preserveProcessCopies(
        currentDetail?.processData?.processJson,
        mergedProcessJson,
      ),
      sourcePlan,
    );
    if (requireComplete) {
      validateBoundaryInfo(processJson);
      validateProcessInfo(processJson);
    }
    return {
      operationId: currentOperationId,
      dataVersion: currentDataVersion,
      planId: planId as number,
      accountId,
      reportName: values.reportName,
      startDate: values.reportPeriod?.[0].format('YYYY-MM-DD'),
      endDate: values.reportPeriod?.[1].format('YYYY-MM-DD'),
      versionNo: values.versionNo,
      submitTarget: values.submitTarget,
      deviateDesc: values.deviateDesc,
      contactName: values.contactName,
      contactEmail: values.contactEmail,
      contactPhone: values.contactPhone,
      detailedAddress: values.detailedAddress,
      postalCode: values.postalCode,
      postBox: values.postBox,
      regionCodes: values.regionCodes || [],
      processData: {
        processJson,
        cbamProductJson: mergeJsonWithSourceCopies<OperationCbamProductJson>(
          currentDetail?.processData?.cbamProductJson,
          values.cbamProductJson,
          ['saleProducts', 'productResults'],
        ),
        precursorJson: mergeJsonWithSourceCopies<OperationPrecursorJson>(
          currentDetail?.processData?.precursorJson,
          values.precursorJson,
          ['productPrecursors'],
        ),
        directEmissionJson:
          mergeJsonWithSourceCopies<OperationDirectEmissionJson>(
            currentDetail?.processData?.directEmissionJson,
            values.directEmissionJson,
            ['sourceFlows', 'productAttributions'],
          ),
        nonCbamProductJson: mergeJson<OperationNonCbamProductJson>(
          currentDetail?.processData?.nonCbamProductJson,
          values.nonCbamProductJson,
        ),
        electricityJson: mergeJsonWithSourceCopies<OperationElectricityJson>(
          currentDetail?.processData?.electricityJson,
          values.electricityJson,
          ['eleCalculators'],
        ),
        heatFlowJson: mergeJsonWithSourceCopies<OperationHeatFlowJson>(
          currentDetail?.processData?.heatFlowJson,
          values.heatFlowJson,
          ['hotEle'],
        ),
        wasteGasJson: mergeJson<OperationWasteGasJson>(
          currentDetail?.processData?.wasteGasJson,
          values.wasteGasJson,
        ),
        schemaVersion: currentDetail?.processData?.schemaVersion || 2,
      },
      condition: {
        industryParameterJson: mergeJson<OperationIndustryParameterJson>(
          currentDetail?.condition?.industryParameterJson,
          values.industryParameterJson,
        ),
        zeroRatedFuelJson: mergeJson<OperationZeroRatedFuelJson>(
          currentDetail?.condition?.zeroRatedFuelJson,
          values.zeroRatedFuelJson,
        ),
        facilityElectricityJson: mergeJson<OperationFacilityElectricityJson>(
          currentDetail?.condition?.facilityElectricityJson,
          values.facilityElectricityJson,
        ),
        co2StageJson: mergeJson<OperationCo2StageJson>(
          currentDetail?.condition?.co2StageJson,
          values.co2StageJson,
        ),
        schemaVersion: currentDetail?.condition?.schemaVersion || 2,
      },
      quality: {
        compileDate: values.compileDate?.format('YYYY-MM-DD'),
        reviewDate: values.reviewDate?.format('YYYY-MM-DD'),
        compilerName: values.compilerName,
        reviewerName: values.reviewerName,
        methodChangeDesc: values.methodChangeDesc,
        confidentialDesc: values.confidentialDesc,
        noDataGap: confirmedNoGaps,
      },
      dataGaps,
      evidenceRelations: relations,
    };
  };

  const persistInitialCo2Evidences = async (
    id: number | string,
    initialVersion: number,
    itemKey: string,
  ): Promise<void> => {
    let version = initialVersion;
    const response = await getOperationEvidences({
      operationId: id,
      partCode: 'CO2_STAGE',
      itemKey,
    });
    let evidences = response.data?.data?.evidences || [];
    const retainedSources = new Set(
      co2EvidenceDrafts
        .map(item => item.sourceEvidenceId)
        .filter((value): value is number => value != null),
    );
    for (const item of evidences.filter(
      value =>
        value.relatedToCurrentItem &&
        value.sourceId != null &&
        !retainedSources.has(value.sourceId),
    )) {
      const relation = item.relations?.find(
        value => value.partCode === 'CO2_STAGE' && value.itemKey === itemKey,
      );
      if (!relation) continue;
      const deleted = await deleteOperationEvidence({
        operationId: id,
        dataVersion: version,
        evidenceId: item.evidenceId,
        relationId: relation.relationId,
      });
      if (!deleted.data?.data)
        throw new Error(I18N.cbamOperationReport.emptySaveResult);
      version = deleted.data.data.dataVersion;
    }
    for (const draft of co2EvidenceDrafts) {
      if (draft.sourceEvidenceId) {
        let copied: OperationEvidence | undefined = evidences.find(
          value => value.sourceId === draft.sourceEvidenceId,
        );
        if (!copied?.relatedToCurrentItem) {
          const related = await selectOperationEvidence({
            operationId: id,
            dataVersion: version,
            ...(copied
              ? { evidenceId: copied.evidenceId }
              : { sourceEvidenceId: draft.sourceEvidenceId }),
            partCode: 'CO2_STAGE',
            itemKey,
          });
          if (!related.data?.data)
            throw new Error(I18N.cbamOperationReport.emptySaveResult);
          version = related.data.data.dataVersion;
        }
        const original = sourceEvidences.find(
          item => item.id === draft.sourceEvidenceId,
        );
        if (
          original &&
          JSON.stringify(evidenceValues(original)) !==
            JSON.stringify(evidenceValues(draft))
        ) {
          if (!copied) {
            const latest = await getOperationEvidences({
              operationId: id,
              partCode: 'CO2_STAGE',
              itemKey,
            });
            evidences = latest.data?.data?.evidences || [];
            copied = evidences.find(
              value => value.sourceId === draft.sourceEvidenceId,
            );
          }
          if (!copied)
            throw new Error(I18N.cbamOperationReport.evidenceLoadFailed);
          const edited = await editOperationEvidence({
            operationId: id,
            dataVersion: version,
            evidenceId: copied.evidenceId,
            ...evidenceValues(draft),
          });
          if (!edited.data?.data)
            throw new Error(I18N.cbamOperationReport.emptySaveResult);
          version = edited.data.data.dataVersion;
        }
      } else {
        const added = await addOperationEvidence({
          operationId: id,
          dataVersion: version,
          ...evidenceValues(draft),
        });
        if (!added.data?.data?.evidenceId)
          throw new Error(I18N.cbamOperationReport.emptySaveResult);
        version = added.data.data.dataVersion;
        const related = await selectOperationEvidence({
          operationId: id,
          dataVersion: version,
          evidenceId: added.data.data.evidenceId,
          partCode: 'CO2_STAGE',
          itemKey,
        });
        if (!related.data?.data)
          throw new Error(I18N.cbamOperationReport.emptySaveResult);
        version = related.data.data.dataVersion;
      }
    }
  };

  const create = async (type: 'draft' | 'complete') => {
    if (!factoryId || !planId) {
      message.warning(I18N.cbamOperationReport.selectFactoryAndPlan);
      return;
    }
    setSaving(type);
    try {
      if (type === 'complete') await form.validateFields();
      const values = form.getFieldsValue(true);
      const response = await addOperationReport({ planId, accountId });
      const result = response.data?.data;
      if (!result) throw new Error(I18N.cbamOperationReport.operationIdMissing);
      const initializedResponse = await getOperationReport(result.operationId);
      const initializedDetail = initializedResponse.data?.data;
      if (!initializedDetail)
        throw new Error(I18N.cbamOperationReport.reportNotInitialized);
      await persistInitialCo2Evidences(
        result.operationId,
        initializedDetail.dataVersion,
        initializedDetail.condition?.co2StageJson?.itemKey ||
          'operation-co2-stage',
      );
      const persistedResponse = await getOperationReport(result.operationId);
      const persistedDetail = persistedResponse.data?.data;
      if (!persistedDetail)
        throw new Error(I18N.cbamOperationReport.reportNotInitialized);
      const request = buildPayload(
        values,
        result.operationId,
        persistedDetail.dataVersion,
        persistedDetail,
        type === 'complete',
      );
      request.evidenceRelations = persistedDetail.evidenceRelations || [];
      const saveResponse =
        type === 'draft'
          ? await saveOperationDraft(request)
          : await saveOperationComplete(request);
      const saveResult = saveResponse.data?.data;
      if (!saveResult)
        throw new Error(I18N.cbamOperationReport.emptySaveResult);
      markDirty(false);
      setOperationId(result.operationId);
      history.replace(
        `${CBAMRouteMaps.cbamOperationReportEdit}?operationId=${result.operationId}`,
      );
      message.success(
        type === 'draft'
          ? I18N.cbamOperationReport.draftSaved
          : saveResult.recalculated
          ? I18N.cbamOperationReport.completeSavedRecalculated
          : I18N.cbamOperationReport.completeSavedUnchanged,
      );
    } catch (error) {
      message.error(
        requestErrorMessage(
          error,
          type === 'draft'
            ? I18N.cbamOperationReport.draftSaveFailed
            : I18N.cbamOperationReport.completeSaveFailed,
        ),
      );
    } finally {
      setSaving(undefined);
    }
  };

  const changeAccount = (next?: number) => {
    if (!operationId || next === accountId) {
      setAccountId(next);
      return;
    }
    Modal.confirm({
      title: I18N.cbamOperationReport.switchAccountingTask,
      icon: <ExclamationCircleOutlined />,
      content: I18N.cbamOperationReport.switchAccountingTaskTip,
      okText: I18N.cbamOperationReport.confirmSwitch,
      cancelText: I18N.cbamOperationReport.cancel,
      onOk: () => {
        setAccountId(next);
        markDirty();
      },
    });
  };

  const openFactory = async () => {
    if (!factoryId) return;
    const response = await getOperationFactoryInfo(factoryId);
    setFactoryInfo(response.data?.data);
    setFactoryDrawerOpen(true);
  };

  const payload = async (
    type: 'draft' | 'complete',
  ): Promise<OperationReportPayload> => {
    if (type === 'complete') await form.validateFields();
    const values = form.getFieldsValue(true);
    if (!operationId || !detail || !planId)
      throw new Error(I18N.cbamOperationReport.reportNotInitialized);
    return buildPayload(
      values,
      operationId,
      detail.dataVersion,
      detail,
      type === 'complete',
    );
  };

  const save = async (type: 'draft' | 'complete') => {
    setSaving(type);
    try {
      const request = await payload(type);
      const response =
        type === 'draft'
          ? await saveOperationDraft(request)
          : await saveOperationComplete(request);
      const result = response.data?.data;
      if (!result) throw new Error(I18N.cbamOperationReport.emptySaveResult);
      markDirty(false);
      setDetail(current =>
        current
          ? {
              ...current,
              dataVersion: result.dataVersion,
              status: result.status,
              completion: result.completion,
            }
          : current,
      );
      setCompletion(result.completion);
      message.success(
        type === 'draft'
          ? I18N.cbamOperationReport.draftSaved
          : result.recalculated
          ? I18N.cbamOperationReport.completeSavedRecalculated
          : I18N.cbamOperationReport.completeSavedUnchanged,
      );
      if (operationId) await loadDetail(operationId);
    } catch (error) {
      message.error(
        requestErrorMessage(
          error,
          type === 'draft'
            ? I18N.cbamOperationReport.draftSaveFailed
            : I18N.cbamOperationReport.completeSaveFailed,
        ),
      );
    } finally {
      setSaving(undefined);
    }
  };

  const selectedFactory = factories.find(item => item.id === factoryId);
  const selectedAccount = accounts.find(item => item.id === accountId);
  const factoryOrgId =
    Number(factoryInfo?.orgId || selectedFactory?.orgId) || undefined;
  const factoryLabel =
    [
      factoryInfo?.factorName || selectedFactory?.name,
      factoryInfo?.factoryCode,
      factoryInfo?.countryName || factoryInfo?.country,
      factoryInfo?.city,
    ]
      .filter(Boolean)
      .join(' / ') || undefined;
  const factoryInfoFields: [string, unknown][] = [
    [I18N.cbam.factoryName, factoryInfo?.factorName || selectedFactory?.name],
    [
      I18N.cbamOperationReport.relatedEntity,
      factoryInfo?.orgName ||
        (factoryOrgId ? orgNames[factoryOrgId] : undefined),
    ],
    [I18N.cbamMonitor.uniqueIdentifier, factoryInfo?.factoryCode],
    [I18N.cbamMonitor.locationCode, factoryInfo?.locationCode],
    [I18N.cbam.country, factoryInfo?.countryName || factoryInfo?.country],
    [I18N.cbam.city, factoryInfo?.city],
    [I18N.cbam.postalCode, factoryInfo?.postalCode],
    [I18N.cbamMonitor.chineseAddress, factoryInfo?.detailedAddress],
    [I18N.cbamMonitor.englishAddress, factoryInfo?.addressEn],
    [I18N.cbamMonitor.longitude, factoryInfo?.longitude],
    [I18N.cbamMonitor.latitude, factoryInfo?.latitude],
    [I18N.cbamMonitor.ePrtrIdentifier, factoryInfo?.ePrtrCode],
  ];
  const accountingPeriod =
    selectedAccount?.startDate && selectedAccount?.endDate
      ? `${selectedAccount.startDate} ~ ${selectedAccount.endDate}`
      : accountId && detail?.accountingTask
      ? `${nestedText(detail.accountingTask, ['startDate'])} ~ ${nestedText(
          detail.accountingTask,
          ['endDate'],
        )}`
      : undefined;
  const backToReportList = () => {
    if (!embedded) history.push(CBAMRouteMaps.cbamOperationReport);
  };
  const pageTitle =
    pageMode === 'add'
      ? I18N.cbamOperationReport.addReportTask
      : readonly
      ? I18N.cbamOperationReport.viewOperationReport
      : I18N.cbamOperationReport.editOperationReport;
  const completionGroups = calculateOperationCompletionPreview({
    ...buildPayload(
      watchedFormValues || form.getFieldsValue(true),
      operationId,
      detail?.dataVersion,
      detail,
    ),
    factoryId,
    sourcePlan,
  });
  const completedCount = completionGroups.filter(
    group => group.completed,
  ).length;
  const totalCount = completion.totalCount || OPERATION_SECTION_CODES.length;
  const completionRate = totalCount ? (completedCount * 100) / totalCount : 0;
  const pendingGroups = completionGroups.filter(group => !group.completed);
  const pendingCount = pendingGroups.length;
  const completionFinished = pendingCount === 0;
  const currentProcessJson = parseJson(
    form.getFieldValue('processJson'),
  ) as unknown as OperationProcessJson | undefined;
  const dataGapProcesses =
    currentProcessJson?.processes ||
    detail?.processData?.processJson?.processes ||
    [];
  const pendingSectionCodes = new Set(
    pendingGroups.map(group => group.sectionCode),
  );
  const navPendingCount = (key: ConfigNavKey) =>
    CONFIG_NAV_SECTION_CODES[key].filter(sectionCode =>
      pendingSectionCodes.has(sectionCode),
    ).length;
  const sectionNames: Record<OperationSectionCode, string> = {
    REPORT_INFO: I18N.cbamOperationReport.reportInformation,
    ASSOCIATION_INFO: I18N.cbamOperationReport.relatedInformation,
    OPERATOR_INFO: I18N.cbamOperationReport.operatorInformation,
    PROCESS_BOUNDARY: I18N.cbamOperationReport.onsiteProcessBoundary,
    PROCESS_INFO: I18N.cbamOperationReport.productionProcessInformation,
    CBAM_PRODUCT: I18N.cbamOperationReport.cbamProducts,
    PRECURSOR: I18N.cbamOperationReport.purchasedPrecursors,
    DIRECT_EMISSION: I18N.cbamOperationReport.directEmissions,
    NON_CBAM_PRODUCT: I18N.cbamOperationReport.nonCbamProducts,
    ELECTRICITY_CONSUMPTION: I18N.cbamOperationReport.electricityConsumption,
    HEAT_FLOW: I18N.cbamOperationReport.heatFlows,
    WASTE_GAS: I18N.cbamOperationReport.wasteGas,
    ZERO_RATED_FUEL: I18N.cbamOperationReport.zeroRatedFuels,
    FACILITY_ELECTRICITY: I18N.cbamOperationReport.onsiteElectricityGeneration,
    CO2_STAGE: I18N.cbamOperationReport.co2CaptureTransferUseStorage,
    QUALITY: I18N.cbamOperationReport.preparationAndQuality,
    DATA_GAP: I18N.cbamOperationReport.dataGaps,
  };
  const pendingCopy = pendingGroups.length
    ? pendingGroups
        .map(group => {
          const code = group.sectionCode as OperationSectionCode;
          return `${OPERATION_SECTION_CODES.indexOf(code) + 1}. ${
            sectionNames[code]
          }`;
        })
        .join(' / ')
    : I18N.cbamOperationReport.allRequirementsCompleted;
  const productionEvidenceContext = (
    itemKey: string,
    partCode: string,
  ): EvidenceModalContext => {
    const config: Record<
      string,
      { field: keyof ReportFormValue; list: string }
    > = {
      CBAM_PRODUCT: { field: 'cbamProductJson', list: 'reportItems' },
      PRECURSOR: { field: 'precursorJson', list: 'reportItems' },
      DIRECT_EMISSION: { field: 'directEmissionJson', list: 'items' },
      NON_CBAM_PRODUCT: { field: 'nonCbamProductJson', list: 'items' },
      ELECTRICITY_CONSUMPTION: { field: 'electricityJson', list: 'items' },
      FACILITY_ELECTRICITY: {
        field: 'facilityElectricityJson',
        list: 'generators',
      },
      HEAT_FLOW: { field: 'heatFlowJson', list: 'items' },
      WASTE_GAS: { field: 'wasteGasJson', list: 'items' },
    };
    const target = config[partCode];
    const json = target
      ? parseJson(form.getFieldValue(target.field)) || {}
      : {};
    const items =
      target && Array.isArray(json[target.list])
        ? (json[target.list] as JsonObject[])
        : [];
    const item = items.find(value => String(value.itemKey || '') === itemKey);
    const sourceItemKey =
      typeof item?.sourceItemKey === 'string' && item.sourceItemKey
        ? item.sourceItemKey
        : undefined;
    let sourcePartCodes: string[] = [];
    if (partCode === 'DIRECT_EMISSION') {
      const pfc =
        Boolean(item?.pfcMethod) ||
        String(item?.greenhouseGasType || '').includes('PFC');
      sourcePartCodes = [pfc ? 'PFC_MONITOR' : 'PROCESS_MONITOR'];
    }
    if (partCode === 'ELECTRICITY_CONSUMPTION')
      sourcePartCodes = ['FACILITY_ELECTRICITY'];
    if (partCode === 'FACILITY_ELECTRICITY')
      sourcePartCodes = ['FACILITY_ELECTRICITY'];
    if (partCode === 'HEAT_FLOW') sourcePartCodes = ['MEASURABLE_HEAT'];
    if (partCode === 'WASTE_GAS') sourcePartCodes = ['WASTE_GAS'];
    return {
      itemKey,
      partCode,
      sourceItemKey,
      sourcePartCodes,
      relatedDataLabel: EVIDENCE_PART_LABELS[partCode] || partCode,
    };
  };
  const pageHeader = (
    <header className={styles.header}>
      <div className={styles.breadcrumb}>
        <button
          type='button'
          className={styles.breadcrumbBack}
          onClick={backToReportList}
        >
          <img src={planBackIcon} alt='' />
        </button>
        <button
          type='button'
          className={styles.breadcrumbParent}
          onClick={backToReportList}
        >
          {I18N.cbamOperationReport.reportManagement}
        </button>
        <span className={styles.breadcrumbDivider}>/</span>
        <span className={styles.breadcrumbCurrent}>{pageTitle}</span>
      </div>
    </header>
  );

  return (
    <Spin
      spinning={loading}
      wrapperClassName={embedded ? styles.embeddedSpin : undefined}
    >
      <div className={`${styles.page} ${embedded ? styles.embeddedPage : ''}`}>
        <div className={embedded ? styles.embeddedScrollArea : undefined}>
          {serverUpdatePending && (
            <Alert
              type='info'
              showIcon
              message={I18N.cbamOperationReport.agentUpdatePreserved}
              action={
                <Button
                  onClick={() =>
                    Modal.confirm({
                      title: I18N.cbamOperationReport.agentReloadTitle,
                      content: I18N.cbamOperationReport.agentReloadContent,
                      onOk: () =>
                        operationId ? loadDetail(operationId) : undefined,
                    })
                  }
                >
                  {I18N.cbamOperationReport.agentReloadAction}
                </Button>
              }
            />
          )}
          {!embedded && pageHeader}
          <div
            className={`${styles.completionBar} ${
              completionFinished ? styles.completionBarCompleted : ''
            }`}
          >
            <Progress
              className={styles.completionProgress}
              type='circle'
              size={52}
              percent={completionRate}
              strokeColor={completionFinished ? '#0cbf9f' : '#b0663c'}
              trailColor='#fff'
              strokeLinecap='round'
              strokeWidth={8}
              format={() => `${completionRate.toFixed(0)}%`}
            />
            <div className={styles.completionCopy}>
              <strong>
                {I18N.template(I18N.cbamOperationReport.completionSummary, {
                  rate: completionRate.toFixed(0),
                  count: pendingCount,
                })}
              </strong>
              <Typography.Text
                className={styles.pendingCopy}
                ellipsis={{
                  tooltip: {
                    title: (
                      <span className={styles.pendingTooltipContent}>
                        {pendingCopy}
                      </span>
                    ),
                    overlayClassName: styles.pendingTooltip,
                    overlayStyle: { maxWidth: 480 },
                  },
                }}
              >
                {pendingCopy}
              </Typography.Text>
            </div>
            <strong className={styles.completionFraction}>
              {completedCount} / {totalCount}
            </strong>
          </div>
          <main className={styles.content}>
            <div className={styles.configCard}>
              <Tabs
                activeKey={activeTab}
                onChange={key => setActiveTab(key as 'config' | 'evidence')}
                items={[
                  {
                    key: 'config',
                    label: I18N.cbamOperationReport.informationConfiguration,
                  },
                  {
                    key: 'evidence',
                    label: I18N.cbamOperationReport.evidenceManagement,
                    disabled: !operationId,
                  },
                ]}
              />
              {activeTab === 'config' ? (
                <div className={styles.configBody}>
                  <nav className={styles.sideNav}>
                    {CONFIG_NAV_ITEMS.map(item => (
                      <button
                        type='button'
                        key={item.key}
                        className={
                          activeNav === item.key ? styles.activeNav : ''
                        }
                        aria-label={`${item.label}: ${navPendingCount(
                          item.key,
                        )}`}
                        onClick={() => setActiveNav(item.key)}
                      >
                        <span className={styles.navItemLabel}>
                          {item.label}
                        </span>
                        <span className={styles.navPendingBadge}>
                          {navPendingCount(item.key)}
                        </span>
                      </button>
                    ))}
                  </nav>
                  <main className={styles.sectionContent}>
                    <Form
                      form={form}
                      layout='vertical'
                      preserve
                      initialValues={{ compileDate: dayjs() }}
                      disabled={readonly}
                      onValuesChange={() => markDirty()}
                    >
                      {activeNav === 'general' && (
                        <>
                          <section className={styles.section}>
                            <h3>
                              {I18N.cbamOperationReport.reportInformation}
                            </h3>
                            <div className={styles.formGrid}>
                              <Form.Item
                                name='reportName'
                                label={I18N.cbamOperationReport.reportName}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={40} />
                              </Form.Item>
                              <Form.Item
                                name='reportPeriod'
                                label={I18N.cbamOperationReport.reportingPeriod}
                                rules={[{ required: true }]}
                              >
                                <DatePicker.RangePicker
                                  placeholder={['', '']}
                                />
                              </Form.Item>
                              <Form.Item
                                name='versionNo'
                                label={I18N.cbamOperationReport.versionNo}
                                rules={[
                                  { required: true },
                                  {
                                    pattern: /^V.*/,
                                    message:
                                      I18N.cbamOperationReport.versionNoRule,
                                  },
                                ]}
                              >
                                <Input maxLength={40} />
                              </Form.Item>
                              <Form.Item
                                name='submitTarget'
                                label={I18N.cbamOperationReport.submitTarget}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={40} />
                              </Form.Item>
                            </div>
                          </section>
                          <section className={styles.section}>
                            <h3>
                              {I18N.cbamOperationReport.relatedInformation}
                            </h3>
                            <div className={styles.formGrid}>
                              <Form.Item
                                className={styles.factoryField}
                                label={
                                  <span className={styles.fieldLabelWithAction}>
                                    <span>
                                      {I18N.cbamOperationReport.relatedFactory}
                                    </span>
                                    <button
                                      type='button'
                                      disabled={!factoryId}
                                      onClick={openFactory}
                                    >
                                      <img src={factoryInfoIcon} alt='' />
                                      {
                                        I18N.cbamOperationReport
                                          .factoryInformation
                                      }
                                    </button>
                                  </span>
                                }
                                required
                              >
                                <Select
                                  value={factoryId}
                                  disabled={Boolean(operationId) || readonly}
                                  options={factories.map(item => ({
                                    label:
                                      item.id === factoryId && factoryLabel
                                        ? factoryLabel
                                        : item.name,
                                    value: item.id,
                                  }))}
                                  onChange={changeFactory}
                                />
                              </Form.Item>
                              <Form.Item
                                label={I18N.cbamOperationReport.relatedEntity}
                              >
                                <Input
                                  className={styles.derivedInput}
                                  disabled
                                  value={
                                    factoryOrgId
                                      ? orgNames[factoryOrgId]
                                      : undefined
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                label={I18N.cbamOperationReport.monitoringPlan}
                                required
                              >
                                <Select
                                  value={planId}
                                  disabled={
                                    !factoryId ||
                                    Boolean(operationId) ||
                                    readonly
                                  }
                                  options={plans.map(item => ({
                                    label: item.name,
                                    value: item.id,
                                  }))}
                                  onChange={changePlan}
                                />
                              </Form.Item>
                              <Form.Item
                                label={
                                  I18N.cbamOperationReport.monitoringPlanYear
                                }
                              >
                                <Input
                                  className={styles.derivedInput}
                                  disabled
                                  value={
                                    nestedText(sourcePlan, ['year']) === '-'
                                      ? undefined
                                      : nestedText(sourcePlan, ['year'])
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                label={I18N.cbamOperationReport.accountingTask}
                              >
                                <Select
                                  allowClear
                                  value={accountId}
                                  disabled={
                                    !planId || Boolean(operationId) || readonly
                                  }
                                  options={accounts.map(item => ({
                                    label: item.name,
                                    value: item.id,
                                  }))}
                                  onChange={changeAccount}
                                />
                              </Form.Item>
                              <Form.Item
                                label={
                                  I18N.cbamOperationReport.accountingTaskPeriod
                                }
                              >
                                <Input
                                  className={styles.derivedInput}
                                  disabled
                                  value={accountingPeriod}
                                />
                              </Form.Item>
                            </div>
                            <Form.Item
                              className={styles.deviationField}
                              name='deviateDesc'
                              label={
                                I18N.cbamOperationReport.monitoringPlanDeviation
                              }
                              required={false}
                            >
                              <Input.TextArea maxLength={1000} />
                            </Form.Item>
                          </section>
                          <section className={styles.section}>
                            <h3>
                              {I18N.cbamOperationReport.operatorInformation}
                            </h3>
                            <div className={styles.formGridThree}>
                              <Form.Item
                                label={I18N.cbamOperationReport.operatorName}
                              >
                                <Input
                                  className={styles.readOnlyInput}
                                  readOnly
                                  value={
                                    nestedText(sourcePlan, [
                                      'facility',
                                      'facilityJson',
                                      'operatorName',
                                    ]) === '-'
                                      ? undefined
                                      : nestedText(sourcePlan, [
                                          'facility',
                                          'facilityJson',
                                          'operatorName',
                                        ])
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                label={I18N.cbamOperationReport.registrationNo}
                              >
                                <Input
                                  className={styles.readOnlyInput}
                                  readOnly
                                  value={
                                    nestedText(sourcePlan, [
                                      'facility',
                                      'facilityJson',
                                      'registNo',
                                    ]) === '-'
                                      ? undefined
                                      : nestedText(sourcePlan, [
                                          'facility',
                                          'facilityJson',
                                          'registNo',
                                        ])
                                  }
                                />
                              </Form.Item>
                              <Form.Item
                                name='contactName'
                                label={I18N.cbamOperationReport.contactName}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={40} />
                              </Form.Item>
                              <Form.Item
                                name='contactEmail'
                                label={I18N.cbamOperationReport.email}
                                rules={[{ required: true }, { type: 'email' }]}
                              >
                                <Input maxLength={100} />
                              </Form.Item>
                              <Form.Item
                                name='contactPhone'
                                label={I18N.cbamOperationReport.phone}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={20} />
                              </Form.Item>
                              <Form.Item
                                name='detailedAddress'
                                label={I18N.cbamOperationReport.detailedAddress}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={100} />
                              </Form.Item>
                              <Form.Item
                                name='postalCode'
                                label={I18N.cbamOperationReport.postalCode}
                              >
                                <Input maxLength={10} />
                              </Form.Item>
                              <Form.Item
                                name='postBox'
                                label={I18N.cbamOperationReport.postBox}
                              >
                                <Input maxLength={40} />
                              </Form.Item>
                              <Form.Item
                                name='regionCodes'
                                label={I18N.cbamOperationReport.region}
                              >
                                <Cascader
                                  options={regionOptions}
                                  showSearch
                                  placeholder=''
                                />
                              </Form.Item>
                            </div>
                          </section>
                        </>
                      )}
                      {activeNav === 'process' && (
                        <ProductionInfo
                          operationId={operationId}
                          form={form}
                          sourcePlan={sourcePlan}
                          accountingTaskSelected={Boolean(accountId)}
                          readonly={readonly}
                          onDirty={() => markDirty()}
                          onEvidenceClick={(itemKey, partCode) => {
                            if (operationId && partCode) {
                              setEvidenceModalContext(
                                productionEvidenceContext(itemKey, partCode),
                              );
                            } else
                              message.info(
                                I18N.cbamOperationReport.saveBeforeEvidence,
                              );
                          }}
                        />
                      )}
                      {activeNav === 'condition' && (
                        <ConditionInfo
                          form={form}
                          sourcePlan={sourcePlan}
                          accountingTaskSelected={Boolean(accountId)}
                          readonly={readonly}
                          onDirty={() => markDirty()}
                          onEvidenceClick={(itemKey, partCode) => {
                            if (partCode === 'CO2_STAGE' && planId) {
                              setEvidenceModalContext({
                                itemKey: co2ItemKey,
                                partCode: 'CO2_STAGE',
                                sourceItemKey: co2SourceItemKey,
                                sourcePartCodes: ['CO2_STAGE'],
                                relatedDataLabel:
                                  I18N.cbamOperationReport.co2ProjectGroupTitle,
                              });
                            } else if (operationId && partCode) {
                              setEvidenceModalContext(
                                productionEvidenceContext(itemKey, partCode),
                              );
                            } else
                              message.info(
                                I18N.cbamOperationReport.saveBeforeEvidence,
                              );
                          }}
                        />
                      )}
                      {activeNav === 'quality' && (
                        <div className={styles.sectionStack}>
                          <section className={styles.section}>
                            <h3>
                              {I18N.cbamOperationReport.preparationAndReview}
                            </h3>
                            <div className={styles.qualityGrid}>
                              <Form.Item
                                name='compileDate'
                                label={I18N.cbamOperationReport.preparationDate}
                                rules={[{ required: true }]}
                              >
                                <DatePicker placeholder='' />
                              </Form.Item>
                              <Form.Item
                                name='reviewDate'
                                label={I18N.cbamOperationReport.reviewDate}
                              >
                                <DatePicker placeholder='' />
                              </Form.Item>
                              <Form.Item
                                name='compilerName'
                                label={I18N.cbamOperationReport.compiler}
                                rules={[{ required: true }]}
                              >
                                <Input maxLength={20} />
                              </Form.Item>
                              <Form.Item
                                name='reviewerName'
                                label={I18N.cbamOperationReport.reviewer}
                              >
                                <Input maxLength={20} />
                              </Form.Item>
                            </div>
                            <Form.Item
                              className={styles.qualityFullField}
                              name='methodChangeDesc'
                              label={
                                I18N.cbamOperationReport.methodChangeDescription
                              }
                            >
                              <Input.TextArea
                                className={styles.qualityTextArea}
                                maxLength={200}
                              />
                            </Form.Item>
                            <Form.Item
                              className={styles.qualityFullField}
                              name='confidentialDesc'
                              label={
                                I18N.cbamOperationReport
                                  .confidentialityDescription
                              }
                            >
                              <Input.TextArea
                                className={styles.qualityTextArea}
                                maxLength={200}
                              />
                            </Form.Item>
                          </section>
                          <section>
                            <DataGapManager
                              value={dataGaps}
                              processes={dataGapProcesses}
                              disabled={readonly}
                              confirmedNoGaps={confirmedNoGaps}
                              onConfirmedNoGapsChange={value => {
                                setConfirmedNoGaps(value);
                                markDirty();
                              }}
                              onChange={value => {
                                setDataGaps(value);
                                if (value.length) setConfirmedNoGaps(false);
                                markDirty();
                              }}
                            />
                          </section>
                        </div>
                      )}
                    </Form>
                  </main>
                </div>
              ) : detail ? (
                <div className={styles.evidenceBody}>
                  <EvidenceManager
                    operationId={detail.operationId}
                    dataVersion={detail.dataVersion}
                    disabled={readonlyProp}
                    onMutation={(
                      dataVersion,
                      nextCompletion,
                      nextRelations,
                    ) => {
                      setDetail(current =>
                        current
                          ? {
                              ...current,
                              dataVersion,
                              completion: nextCompletion,
                            }
                          : current,
                      );
                      setCompletion(nextCompletion);
                      setRelations(nextRelations);
                    }}
                  />
                </div>
              ) : null}
            </div>
          </main>
        </div>
        {!readonly && (
          <footer
            className={`${styles.footer} ${
              embedded ? styles.embeddedFooter : ''
            }`}
          >
            {!embedded && (
              <Button
                onClick={() => history.push(CBAMRouteMaps.cbamOperationReport)}
              >
                {I18N.cbamOperationReport.cancel}
              </Button>
            )}
            <Button
              disabled={detail?.status === 1}
              loading={saving === 'draft'}
              onClick={() => (operationId ? save('draft') : create('draft'))}
            >
              {I18N.cbamOperationReport.saveDraft}
            </Button>
            <Button
              type='primary'
              loading={saving === 'complete'}
              onClick={() =>
                operationId ? save('complete') : create('complete')
              }
            >
              {I18N.cbamOperationReport.formalSave}
            </Button>
          </footer>
        )}
        <Drawer
          closable={false}
          destroyOnClose
          open={factoryDrawerOpen}
          width={620}
          rootClassName={styles.factoryInfoDrawer}
          title={
            <CbamDrawerTitle>
              {I18N.cbamOperationReport.factoryInformation}
            </CbamDrawerTitle>
          }
          extra={
            <CbamDrawerClose onClick={() => setFactoryDrawerOpen(false)} />
          }
          onClose={() => setFactoryDrawerOpen(false)}
        >
          <div className={styles.factoryInfoList}>
            {factoryInfoFields.map(([label, rawValue]) => {
              const value = displayReadOnlyValue(rawValue);
              return (
                <div className={styles.factoryInfoRow} key={label}>
                  <span>{label}</span>
                  <div title={value}>{value}</div>
                </div>
              );
            })}
          </div>
        </Drawer>
        <Co2EvidenceModal
          open={Boolean(evidenceModalContext)}
          onClose={() => setEvidenceModalContext(undefined)}
          operationId={operationId}
          dataVersion={detail?.dataVersion}
          itemKey={evidenceModalContext?.itemKey || co2ItemKey}
          partCode={evidenceModalContext?.partCode}
          sourceItemKey={evidenceModalContext?.sourceItemKey}
          sourcePartCodes={evidenceModalContext?.sourcePartCodes}
          relatedDataLabel={evidenceModalContext?.relatedDataLabel}
          readonly={readonly}
          sourceEvidences={sourceEvidences}
          drafts={
            evidenceModalContext?.partCode === 'CO2_STAGE'
              ? co2EvidenceDrafts
              : []
          }
          onDraftChange={value => {
            if (evidenceModalContext?.partCode === 'CO2_STAGE')
              setCo2EvidenceDrafts(value);
            markDirty();
          }}
          onMutation={async result => {
            if (!operationId) return;
            const response = await getOperationReport(operationId);
            const next = response.data?.data;
            if (!next)
              throw new Error(I18N.cbamOperationReport.reportLoadFailed);
            setDetail(current =>
              current
                ? {
                    ...current,
                    dataVersion: next.dataVersion,
                    completion: next.completion,
                    processData: next.processData,
                    condition: next.condition,
                    evidenceRelations: next.evidenceRelations,
                  }
                : current,
            );
            setCompletion(next.completion || result.completion);
            setRelations(next.evidenceRelations || []);
            if (evidenceModalContext?.partCode === 'CO2_STAGE') {
              const currentCo2 =
                parseJson(form.getFieldValue('co2StageJson')) || {};
              form.setFieldValue(
                'co2StageJson',
                stringifyJson({
                  ...currentCo2,
                  evidenceIds: next.condition?.co2StageJson?.evidenceIds || [],
                }),
              );
            } else if (evidenceModalContext) {
              const syncConfig: Record<
                string,
                { field: keyof ReportFormValue; jsonKey: string; list: string }
              > = {
                DIRECT_EMISSION: {
                  field: 'directEmissionJson',
                  jsonKey: 'directEmissionJson',
                  list: 'items',
                },
                ELECTRICITY_CONSUMPTION: {
                  field: 'electricityJson',
                  jsonKey: 'electricityJson',
                  list: 'items',
                },
                FACILITY_ELECTRICITY: {
                  field: 'facilityElectricityJson',
                  jsonKey: 'facilityElectricityJson',
                  list: 'generators',
                },
                HEAT_FLOW: {
                  field: 'heatFlowJson',
                  jsonKey: 'heatFlowJson',
                  list: 'items',
                },
                WASTE_GAS: {
                  field: 'wasteGasJson',
                  jsonKey: 'wasteGasJson',
                  list: 'items',
                },
              };
              const target = syncConfig[evidenceModalContext.partCode];
              const persistedRoot =
                evidenceModalContext.partCode === 'FACILITY_ELECTRICITY'
                  ? objectValue(next.condition)
                  : objectValue(next.processData);
              const persistedJson = target
                ? objectValue(persistedRoot[target.jsonKey])
                : {};
              const persistedItems =
                target && Array.isArray(persistedJson[target.list])
                  ? (persistedJson[target.list] as JsonObject[])
                  : [];
              const persistedItem = persistedItems.find(
                item =>
                  String(item.itemKey || '') === evidenceModalContext.itemKey,
              );
              if (target && persistedItem) {
                const currentJson =
                  parseJson(form.getFieldValue(target.field)) || {};
                const currentItems = Array.isArray(currentJson[target.list])
                  ? (currentJson[target.list] as JsonObject[])
                  : [];
                form.setFieldValue(
                  target.field,
                  stringifyJson({
                    ...currentJson,
                    [target.list]: currentItems.map(item =>
                      String(item.itemKey || '') ===
                      evidenceModalContext.itemKey
                        ? {
                            ...item,
                            evidenceIds: persistedItem.evidenceIds || [],
                          }
                        : item,
                    ),
                  }),
                );
              }
            }
          }}
        />
      </div>
    </Spin>
  );
};

export default OperationReportInfo;
