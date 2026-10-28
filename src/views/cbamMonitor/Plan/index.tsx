import I18N from '@src/lang/I18N';
import { useAllEnumsBatch } from '@src/views/dashborad/Dicts/hooks';
import {
  Button,
  Form,
  FormInstance,
  message,
  Progress,
  Space,
  Spin,
  Tabs,
  Typography,
} from 'antd';
import { merge, mergeWith } from 'lodash-es';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';

import {
  calculateCompletionPreview,
  calculateNavPendingCounts,
  MonitorNavKey,
} from '../completion';
import { ConfigSections } from '../components/ConfigSections';
import { EvidencePanel } from '../components/EvidencePanel';
import styles from '../plan.module.less';
import {
  deleteMonitorChild,
  getMonitorDetail,
  getMonitorFactories,
  getMonitorFactory,
  getMonitorUserCompany,
  saveMonitor,
  saveMonitorDraft,
} from '../service';
import {
  FactoryOption,
  FactorSamplingItem,
  MonitorChildDeleteRequest,
  MonitorSectionCode,
  MonitorPlanDetail,
  MonitorPlanPayload,
} from '../types';
import { findMonitorPlanLimitViolation } from '../validation';

const NAV_ITEMS: { key: MonitorNavKey; label: string }[] = [
  { key: 'identity', label: I18N.cbamMonitor.planAndFacilityIdentification },
  { key: 'goods', label: I18N.cbamMonitor.goodsAndBoundary },
  { key: 'direct', label: I18N.cbamMonitor.directEmissionMonitoring },
  { key: 'condition', label: I18N.cbamMonitor.conditionalItems },
  { key: 'control', label: I18N.cbamMonitor.controlAndConfirmation },
];

const LIMIT_FIELD_LABELS: Record<string, string> = {
  productName: I18N.cbamMonitor.productName,
  precursorName: I18N.cbamMonitor.precursorName,
  supplierName: I18N.cbamMonitor.supplierName,
  sourceFacility: I18N.cbamMonitor.sourceFacility,
  files: I18N.cbamMonitor.systemBoundaryFile,
};

const limitFieldLabel = (fieldPath: string) => {
  const field =
    fieldPath
      .split('.')
      .pop()
      ?.replace(/\[\d+]$/, '') || fieldPath;
  return LIMIT_FIELD_LABELS[field] || field;
};

const COMPLETION_GROUP_CODES: MonitorSectionCode[] = [
  'PLAN_IDENTITY',
  'FACILITY',
  'PRODUCT_COMPOSITION',
  'PROCESS_GOODS',
  'NON_CBAM_GOODS',
  'CBAM_BENCHMARK',
  'DATA_MONITOR_METHOD',
  'FACTOR_SAMPLING',
  'SOURCE_EMISSION_LIST',
  'CALCULATION_MASS_BALANCE_SOURCE',
  'MEASUREMENT_SOURCE',
  'PFC_MONITOR',
  'SYSTEM_BOUNDARY',
  'PRECURSOR_SUPPLIER_ORIGIN',
  'ZERO_RATED_FUEL',
  'MEASURABLE_HEAT',
  'FACILITY_ELECTRICITY',
  'ELECTRICITY_FACTOR',
  'IMPORTED_ELECTRICITY_EVIDENCE',
  'WASTE_GAS',
  'CO2_STAGE',
  'DATA_QUALITY_CONTROL',
];

interface SaveErrorEnvelope {
  code?: number;
  msg?: string;
  message?: string;
  data?: unknown;
}

interface SaveRequestError {
  data?: SaveErrorEnvelope;
  response?: {
    data?: SaveErrorEnvelope;
  };
}

interface FormValidationError {
  errorFields?: {
    name?: (string | number)[];
    errors?: string[];
  }[];
}

const getSaveErrorEnvelope = (error: SaveRequestError) =>
  error.data?.code !== undefined ? error.data : error.response?.data;

const isRequiredItemsError = (error?: SaveErrorEnvelope) => {
  if (error?.msg?.includes('必填项') || /required/i.test(error?.msg || ''))
    return true;
  const errorData = error?.data;
  if (!Array.isArray(errorData)) return false;
  return errorData.some(item => {
    if (!item || typeof item !== 'object') return false;
    const detail = item as {
      fieldPath?: unknown;
      blockingMissingFields?: unknown;
    };
    return (
      typeof detail.fieldPath === 'string' ||
      (Array.isArray(detail.blockingMissingFields) &&
        detail.blockingMissingFields.length > 0)
    );
  });
};

const completionGroupName = (code: MonitorSectionCode) =>
  ({
    PLAN_IDENTITY: I18N.cbamMonitor.completionPlanIdentity,
    FACILITY: I18N.cbamMonitor.completionFacilityProcess,
    PRODUCT_COMPOSITION: I18N.cbamMonitor.completionProductComposition,
    PROCESS_GOODS: I18N.cbamMonitor.completionProcessGoods,
    NON_CBAM_GOODS: I18N.cbamMonitor.completionNonCbamGoods,
    CBAM_BENCHMARK: I18N.cbamMonitor.completionCbamBenchmark,
    DATA_MONITOR_METHOD: I18N.cbamMonitor.completionDataMonitoring,
    FACTOR_SAMPLING: I18N.cbamMonitor.completionFactorSampling,
    SOURCE_EMISSION_LIST: I18N.cbamMonitor.completionSourceEmission,
    CALCULATION_MASS_BALANCE_SOURCE:
      I18N.cbamMonitor.completionCalculationMassBalance,
    MEASUREMENT_SOURCE: I18N.cbamMonitor.completionMeasurementSource,
    PFC_MONITOR: I18N.cbamMonitor.completionPfcMonitoring,
    SYSTEM_BOUNDARY: I18N.cbamMonitor.completionSystemBoundary,
    PRECURSOR_SUPPLIER_ORIGIN: I18N.cbamMonitor.completionPrecursorOrigin,
    ZERO_RATED_FUEL: I18N.cbamMonitor.completionZeroRatedFuel,
    MEASURABLE_HEAT: I18N.cbamMonitor.completionHeatInputOutput,
    FACILITY_ELECTRICITY: I18N.cbamMonitor.completionFacilityElectricity,
    ELECTRICITY_FACTOR: I18N.cbamMonitor.completionElectricityFactor,
    IMPORTED_ELECTRICITY_EVIDENCE:
      I18N.cbamMonitor.completionImportedElectricity,
    WASTE_GAS: I18N.cbamMonitor.completionWasteGas,
    CO2_STAGE: I18N.cbamMonitor.completionCo2Stage,
    DATA_QUALITY_CONTROL: I18N.cbamMonitor.completionDataQualityControl,
  }[code]);

const completionGroupLabel = (code: MonitorSectionCode) => {
  const index = COMPLETION_GROUP_CODES.indexOf(code);
  return `${index + 1}. ${completionGroupName(code)}`;
};

const presetProcedure = (
  procedureType: string,
  title: string,
  sortNo: number,
) => ({
  itemKey: `preset-${procedureType.toLowerCase().replace(/_/g, '-')}`,
  procedureType,
  title,
  sortNo,
});

const createItemKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const managementProcedurePresets = () => [
  presetProcedure(
    'RESPONSIBILITY_ASSIGNMENT',
    I18N.cbamMonitor.responsibilityAssignmentProcedure,
    1,
  ),
  presetProcedure(
    'PLAN_REGULAR_EVALUATION',
    I18N.cbamMonitor.planRegularEvaluationProcedure,
    2,
  ),
  presetProcedure(
    'IMPROVEMENT_REPORT_DEADLINE',
    I18N.cbamMonitor.improvementReportDeadlineProcedure,
    3,
  ),
];

const dataFlowProcedurePresets = () => [
  presetProcedure('DATA_FLOW', I18N.cbamMonitor.dataFlowProcedure, 1),
];

const controlActivityProcedurePresets = () => [
  presetProcedure(
    'RISK_ASSESSMENT',
    I18N.cbamMonitor.riskAssessmentProcedure,
    1,
  ),
  presetProcedure(
    'MEASUREMENT_QUALITY_ASSURANCE',
    I18N.cbamMonitor.measurementQualityAssuranceProcedure,
    2,
  ),
  presetProcedure(
    'IT_QUALITY_ASSURANCE',
    I18N.cbamMonitor.itQualityAssuranceProcedure,
    3,
  ),
  presetProcedure(
    'INTERNAL_REVIEW',
    I18N.cbamMonitor.internalReviewProcedure,
    4,
  ),
  presetProcedure(
    'CORRECTIVE_ACTION',
    I18N.cbamMonitor.correctiveActionProcedure,
    5,
  ),
  presetProcedure(
    'OUTSOURCED_PROCESS',
    I18N.cbamMonitor.outsourcedProcessProcedure,
    6,
  ),
  presetProcedure('DATA_GAP', I18N.cbamMonitor.dataGapProcedure, 7),
  presetProcedure('RECORD_KEEPING', I18N.cbamMonitor.recordKeepingProcedure, 8),
];

const emptySections = (): Pick<
  MonitorPlanPayload,
  | 'facility'
  | 'goodsBoundary'
  | 'directEmission'
  | 'condition'
  | 'controlConfirmation'
> => ({
  facility: { facilityJson: {} },
  goodsBoundary: {
    productJson: { products: [] },
    precursorJson: { precursors: [] },
    processJson: { processes: [] },
    nonCbamGoodsJson: { goods: [] },
    systemBoundaryJson: { files: [] },
  },
  directEmission: {
    processMonitorJson: { methods: [] },
    factorSamplingJson: { factors: [] },
    pfcMonitorJson: {
      applicable: true,
      methods: [],
      notApplicableReason: I18N.cbamMonitor.pfcNotApplicableDefault,
    },
  },
  condition: {
    zeroRatedFuelJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
    },
    measurableHeatJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
      heatFlows: [],
    },
    facilityElectricityJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
      generators: [],
    },
    electricityFactorJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
    },
    wasteGasJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
      wasteGasFlows: [],
    },
    co2StageJson: {
      itemKey: createItemKey(),
      applicable: true,
      evidenceIds: [],
    },
  },
  controlConfirmation: {
    divideWorkJson: { responsibilities: [] },
    manageEvaluateJson: { procedures: managementProcedurePresets() },
    dataFlowJson: { procedures: dataFlowProcedurePresets() },
    controlActivityJson: {
      includedInEnvironmentalManagementSystem: true,
      procedures: controlActivityProcedurePresets(),
    },
    otherProcedureJson: { procedures: [] },
  },
});

interface FormPayload
  extends Omit<MonitorPlanPayload, 'planDate' | 'effectiveDate'> {
  planDate?: string | Moment;
  effectiveDate?: string | Moment;
}

const toFormValue = (detail: MonitorPlanDetail): FormPayload => {
  const formValue = mergeWith(
    {
      ...emptySections(),
      evidences: [],
      evidenceRelations: [],
    },
    {
      ...detail,
      planDate: detail.planDate ? moment(detail.planDate) : undefined,
      effectiveDate: detail.effectiveDate
        ? moment(detail.effectiveDate)
        : undefined,
    },
    // Agent 分批保存的未填写区块可为 null；保留表单容器，普通字段的 null/false/0 仍按原值显示。
    (defaultValue: unknown, sourceValue: unknown) =>
      sourceValue === null &&
      defaultValue !== null &&
      typeof defaultValue === 'object'
        ? defaultValue
        : undefined,
  );
  const systemBoundary = formValue.goodsBoundary.systemBoundaryJson;
  if (systemBoundary) {
    systemBoundary.files = (systemBoundary.files || []).filter(file =>
      Boolean(file.url?.trim() || file.name?.trim()),
    );
  }
  const pfcMonitor = formValue.directEmission.pfcMonitorJson;
  if (pfcMonitor && !pfcMonitor.notApplicableReason?.trim()) {
    pfcMonitor.notApplicableReason = I18N.cbamMonitor.pfcNotApplicableDefault;
  }
  Object.values(formValue.condition).forEach(item => {
    if (!item.itemKey) item.itemKey = createItemKey();
    item.evidenceIds = item.evidenceIds || [];
  });
  const sourceFlowNameByMethodKey = new Map(
    (formValue.directEmission.processMonitorJson?.methods || []).flatMap(
      method =>
        method.itemKey && method.sourceFlowName?.trim()
          ? [[method.itemKey, method.sourceFlowName.trim()] as const]
          : [],
    ),
  );
  const factorSampling = formValue.directEmission.factorSamplingJson;
  if (factorSampling) {
    factorSampling.factors = (factorSampling.factors || []).map(factor => {
      const nextFactor = {
        ...factor,
        sourceFlowName:
          factor.sourceFlowName?.trim() ||
          sourceFlowNameByMethodKey.get(factor.processMonitorItemKey || ''),
      };
      delete nextFactor.processMonitorItemKey;
      return nextFactor;
    });
  }
  const detailProcedures =
    detail.controlConfirmation?.manageEvaluateJson?.procedures || [];
  formValue.controlConfirmation.manageEvaluateJson!.procedures =
    managementProcedurePresets().map(preset => ({
      ...preset,
      ...detailProcedures.find(
        item => item.procedureType === preset.procedureType,
      ),
    }));
  const detailDataFlowProcedures =
    detail.controlConfirmation?.dataFlowJson?.procedures || [];
  formValue.controlConfirmation.dataFlowJson!.procedures =
    dataFlowProcedurePresets().map(preset => ({
      ...preset,
      ...detailDataFlowProcedures.find(
        item => item.procedureType === preset.procedureType,
      ),
    }));
  const detailControlActivityProcedures = [
    ...(detail.controlConfirmation?.controlActivityJson?.procedures || []),
    ...detailDataFlowProcedures.filter(
      item => item.procedureType === 'RISK_ASSESSMENT',
    ),
  ];
  formValue.controlConfirmation.controlActivityJson!.procedures =
    controlActivityProcedurePresets().map(preset => {
      const detailProcedure = detailControlActivityProcedures.find(
        item => item.procedureType === preset.procedureType,
      );
      return {
        ...preset,
        ...detailProcedure,
        title: preset.title,
      };
    });
  const otherProcedures =
    formValue.controlConfirmation.otherProcedureJson?.procedures || [];
  formValue.controlConfirmation.otherProcedureJson!.procedures =
    otherProcedures.map((procedure, index) => ({
      ...procedure,
      title:
        !procedure.title?.trim() ||
        /^(补充程序|Supplementary Procedure)\s+\d+$/.test(
          procedure.title.trim(),
        )
          ? `${I18N.cbamMonitor.supplementaryProcedure} ${
              procedure.sortNo || index + 1
            }`
          : procedure.title.trim(),
    }));
  return formValue;
};

const withoutLegacyFactorReference = (factor: FactorSamplingItem) => {
  const nextFactor = { ...factor };
  delete nextFactor.processMonitorItemKey;
  return nextFactor;
};

const toPayload = (value: FormPayload): MonitorPlanPayload => ({
  ...value,
  goodsBoundary: {
    ...value.goodsBoundary,
    systemBoundaryJson: {
      ...value.goodsBoundary.systemBoundaryJson,
      files: (value.goodsBoundary.systemBoundaryJson?.files || []).filter(
        file => Boolean(file.url?.trim() || file.name?.trim()),
      ),
    },
  },
  directEmission: {
    ...value.directEmission,
    factorSamplingJson: {
      ...value.directEmission.factorSamplingJson,
      factors: (value.directEmission.factorSamplingJson?.factors || []).map(
        withoutLegacyFactorReference,
      ),
    },
  },
  planDate: moment.isMoment(value.planDate)
    ? value.planDate.format('YYYY-MM-DD')
    : value.planDate,
  effectiveDate: moment.isMoment(value.effectiveDate)
    ? value.effectiveDate.format('YYYY-MM-DD')
    : value.effectiveDate,
});

type PlanPageProps = {
  embedded?: boolean;
  readonly?: boolean;
};

const PlanPage = ({ embedded = false, readonly = false }: PlanPageProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { pageType, id } = useParams<{
    pageType: 'add' | 'edit';
    id?: string;
  }>();
  const [form] = Form.useForm<FormPayload>();
  const [activeNav, setActiveNav] = useState('identity');
  const [activeTab, setActiveTab] = useState('config');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evidenceCreateRequest, setEvidenceCreateRequest] = useState(0);
  const [evidenceCreatePartCode, setEvidenceCreatePartCode] =
    useState<number>();
  const [evidenceCreateItemKey, setEvidenceCreateItemKey] = useState<string>();
  const [onEvidenceCreated, setOnEvidenceCreated] =
    useState<(evidenceId: number) => void>();
  const [evidenceEditRequest, setEvidenceEditRequest] = useState<{
    evidenceId: number;
    sequence: number;
  }>();
  const [factories, setFactories] = useState<FactoryOption[]>([]);
  const [factory, setFactory] = useState<FactoryOption>();
  const [completionPayload, setCompletionPayload] =
    useState<Partial<MonitorPlanPayload>>();
  const countryEnums = useAllEnumsBatch('CBAMcountryinfo')?.CBAMcountryinfo;
  const countryOptions = useMemo(
    () =>
      (countryEnums || []).map(item => ({
        label: item.dictLabel,
        value: item.dictValue,
      })),
    [countryEnums],
  );
  const refreshCompletionPreview = useCallback(() => {
    setCompletionPayload(
      form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>,
    );
  }, [form]);
  const currentPlanId = Form.useWatch<number>('id', { form, preserve: true });
  const saveType = Form.useWatch('saveType', { form, preserve: true });
  const publishTime = Form.useWatch('publishTime', { form, preserve: true });
  const hasBeenFormallySaved = saveType === 1 || Boolean(publishTime);
  const canManageEvidence = Boolean(
    currentPlanId || (pageType === 'edit' && id),
  );
  const factoryId = Form.useWatch('factoryId', form);
  const completionPreview = calculateCompletionPreview(
    completionPayload ||
      (form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>),
  );
  const navPendingCounts = calculateNavPendingCounts(completionPreview);

  const loadFactories = useCallback(async () => {
    const { data } = await getMonitorFactories({ pageNum: 1, pageSize: 1000 });
    const page = data?.data;
    setFactories(page?.records || page?.rows || page?.list || []);
  }, []);

  useEffect(() => {
    loadFactories();
  }, [loadFactories]);

  useEffect(() => {
    if (!factoryId) {
      setFactory(undefined);
      return;
    }
    getMonitorFactory(factoryId).then(({ data }) => setFactory(data?.data));
  }, [factoryId]);

  useEffect(() => {
    const queryFactoryId = Number(
      new URLSearchParams(location.search).get('factoryId'),
    );
    form.setFieldsValue({
      year: new Date().getFullYear(),
      factoryId: queryFactoryId || undefined,
      ...emptySections(),
      evidences: [],
      evidenceRelations: [],
    });
    setCompletionPayload(
      form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>,
    );
    if (pageType === 'add') {
      setLoading(true);
      getMonitorUserCompany()
        .then(({ data }) => {
          const companyName = data?.data?.companyName;
          if (!companyName) return;
          form.setFields([
            {
              name: ['facility', 'facilityJson', 'operatorName'],
              value: companyName,
            },
          ]);
          setCompletionPayload(
            form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>,
          );
        })
        .finally(() => setLoading(false));
      return;
    }
    if (!id) return;
    setLoading(true);
    // Agent 返回的 Long ID 保持十进制字符串，避免预览定位到精度损失后的错误计划。
    const request = getMonitorDetail(id);
    request
      .then(({ data }) => {
        const detail = data?.data;
        if (!detail) {
          message.error(I18N.cbamMonitor.planDetailLoadFailed);
          return;
        }
        form.setFieldsValue(toFormValue(detail));
        setCompletionPayload(
          form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>,
        );
      })
      .catch((error: { data?: { msg?: string } }) => {
        message.error(
          error?.data?.msg || I18N.cbamMonitor.planDetailLoadFailed,
        );
      })
      .finally(() => setLoading(false));
  }, [form, id, location.search, pageType]);

  const submit = async (draft: boolean) => {
    if (readonly) return;
    let values: FormPayload;
    const currentValues = form.getFieldsValue(true);
    const limitViolation = findMonitorPlanLimitViolation(currentValues);
    if (limitViolation) {
      message.error(
        I18N.template(
          limitViolation.type === 'array'
            ? I18N.cbamMonitor.fieldItemCountExceeded
            : I18N.cbamMonitor.fieldLengthExceeded,
          {
            ...limitViolation,
            field: limitFieldLabel(limitViolation.fieldPath),
          },
        ),
      );
      return;
    }
    const productCompositionCompleted = calculateCompletionPreview(
      currentValues,
    ).find(group => group.sectionCode === 'PRODUCT_COMPOSITION')?.completed;
    if (!draft && !productCompositionCompleted) {
      message.error(I18N.cbamMonitor.requiredItemsIncomplete);
      setActiveTab('config');
      setActiveNav('goods');
      return;
    }
    if (draft) {
      values = currentValues;
      if (!values.year) {
        message.error(I18N.cbamMonitor.yearRequired);
        return;
      }
    } else {
      try {
        await form.validateFields();
        values = form.getFieldsValue(true);
      } catch (error) {
        const firstError = (error as FormValidationError).errorFields?.[0];
        message.error(
          firstError?.errors?.[0] || I18N.cbamMonitor.requiredItemsIncomplete,
        );
        if (firstError?.name) {
          // 嵌入模式只滚动右侧内容区，避免带动对话和外层页面。
          if (!embedded || scrollAreaRef.current) {
            form.scrollToField(firstError.name, {
              block: 'center',
              ...(embedded ? { boundary: scrollAreaRef.current } : {}),
            });
          }
        }
        return;
      }
      const planDate = values.planDate ? moment(values.planDate) : undefined;
      const effectiveDate = values.effectiveDate
        ? moment(values.effectiveDate)
        : undefined;
      if (
        planDate &&
        effectiveDate &&
        effectiveDate.isBefore(planDate, 'day')
      ) {
        message.error(I18N.cbamMonitor.effectiveDateBeforePlanDate);
        setActiveTab('config');
        setActiveNav('identity');
        return;
      }
    }
    setSaving(true);
    try {
      const payload = toPayload(values);
      const response = await (draft ? saveMonitorDraft : saveMonitor)(payload);
      const result = response.data?.data;
      if (result) {
        form.setFieldsValue({
          id: result.id,
          dataVersion: result.dataVersion,
          saveType: result.saveType,
        });
        const detailResponse = await getMonitorDetail(result.id);
        const detail = detailResponse.data?.data;
        if (detail) {
          form.setFieldsValue(toFormValue(detail));
          setCompletionPayload(
            form.getFieldsValue(true) as unknown as MonitorPlanPayload,
          );
        } else {
          setCompletionPayload({
            ...payload,
            id: result.id,
            dataVersion: result.dataVersion,
            completedCount: result.completedCount,
            saveType: result.saveType,
          });
        }
      }
      message.success(
        draft ? I18N.cbamMonitor.draftSaved : I18N.cbamMonitor.planSaved,
      );
    } catch (error) {
      const requestError = error as SaveRequestError;
      const errorEnvelope = getSaveErrorEnvelope(requestError);
      message.error(
        isRequiredItemsError(errorEnvelope)
          ? I18N.cbamMonitor.requiredItemsIncomplete
          : errorEnvelope?.msg ||
              errorEnvelope?.message ||
              (draft
                ? I18N.cbamMonitor.draftSaveFailed
                : I18N.cbamMonitor.planSaveFailed),
      );
    } finally {
      setSaving(false);
    }
  };

  const ensurePlanId = async () => {
    if (readonly) throw new Error(I18N.cbamMonitor.notAvailable);
    const persistedPlanId = form.getFieldValue('id');
    if (persistedPlanId) return persistedPlanId;
    const values = form.getFieldsValue(true);
    if (!values.year) {
      message.error(I18N.cbamMonitor.yearRequired);
      throw new Error(I18N.cbamMonitor.yearRequired);
    }
    const { data } = await saveMonitorDraft(toPayload(values));
    const result = data?.data;
    if (!result?.id) throw new Error(I18N.cbamMonitor.draftSaveFailed);
    form.setFieldsValue({ id: result.id, dataVersion: result.dataVersion });
    setCompletionPayload(
      form.getFieldsValue(true) as unknown as MonitorPlanPayload,
    );
    return result.id;
  };

  const refreshPersistedPlanState = async (planId: number) => {
    const { data } = await getMonitorDetail(planId);
    const detail = data?.data;
    if (!detail) return;
    form.setFieldsValue({
      dataVersion: detail.dataVersion,
      completedCount: detail.completedCount,
    });
    refreshCompletionPreview();
  };

  const deleteChild = async (
    request: Omit<MonitorChildDeleteRequest, 'dataVersion'>,
  ) => {
    if (readonly || pageType !== 'edit' || !id) return;
    try {
      const { data } = await deleteMonitorChild(id, {
        ...request,
        dataVersion: form.getFieldValue('dataVersion'),
      });
      const result = data?.data;
      if (result) {
        form.setFieldsValue({
          dataVersion: result.dataVersion,
          completedCount: result.completedCount,
        });
      }
      window.setTimeout(() => {
        setCompletionPayload(
          form.getFieldsValue(true) as unknown as Partial<MonitorPlanPayload>,
        );
      });
      message.success(I18N.cbamMonitor.itemDeleted);
    } catch (error) {
      const requestError = error as SaveRequestError;
      const handledByInterceptor = [500, 601].includes(
        requestError.data?.code || 0,
      );
      if (!handledByInterceptor) {
        message.error(
          requestError.response?.data?.msg ||
            requestError.response?.data?.message ||
            I18N.cbamMonitor.itemDeleteFailed,
        );
      }
      throw error;
    }
  };

  const completed = completionPreview.filter(group => group.completed).length;
  const rate = completionPreview.length
    ? (completed * 100) / completionPreview.length
    : 0;
  const pendingCount = Math.max(22 - completed, 0);
  const pendingGroups = completionPreview.filter(group => !group.completed);
  const pendingCopy = pendingGroups.length
    ? I18N.template(I18N.cbamMonitor.pendingItems, {
        items: pendingGroups
          .map(group => completionGroupLabel(group.sectionCode))
          .join(' / '),
      })
    : I18N.cbamMonitor.allRequirementsClosed;
  return (
    <Spin
      spinning={loading}
      wrapperClassName={embedded ? styles.embeddedSpin : undefined}
    >
      <div
        className={`${styles.planPage} ${
          embedded ? styles.embeddedPlanPage : ''
        }`}
      >
        <div
          ref={scrollAreaRef}
          className={embedded ? styles.embeddedScrollArea : undefined}
        >
          <Form
            disabled={readonly}
            form={form}
            layout='vertical'
            preserve
            onValuesChange={changedValues =>
              setCompletionPayload(
                merge(
                  {},
                  form.getFieldsValue(true),
                  changedValues,
                ) as Partial<MonitorPlanPayload>,
              )
            }
          >
            <div
              className={`${styles.completionBar} ${
                completed === 22 ? styles.completionBarCompleted : ''
              }`}
            >
              <Progress
                className={styles.completionProgress}
                type='circle'
                size={52}
                percent={rate}
                strokeColor={completed === 22 ? '#0cbf9f' : '#b0663c'}
                trailColor='#fff'
                strokeLinecap='round'
                strokeWidth={8}
                format={() => `${rate.toFixed(0)}%`}
              />
              <div className={styles.completionCopy}>
                <strong>
                  {I18N.template(I18N.cbamMonitor.completionSummary, {
                    rate: rate.toFixed(0),
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
                {completed} / 22
              </strong>
            </div>
            <div className={styles.configCard}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  { key: 'config', label: I18N.cbamMonitor.planConfiguration },
                  ...(canManageEvidence
                    ? [
                        {
                          key: 'evidence',
                          label: I18N.cbamMonitor.evidenceManagement,
                        },
                      ]
                    : []),
                ]}
              />
              {activeTab === 'config' ? (
                <div className={styles.configBody}>
                  <nav className={styles.sideNav}>
                    {NAV_ITEMS.map(item => {
                      const navPendingCount = navPendingCounts[item.key];
                      return (
                        <button
                          type='button'
                          key={item.key}
                          className={
                            activeNav === item.key ? styles.activeNav : ''
                          }
                          aria-label={`${item.label}: ${navPendingCount}`}
                          onClick={() => setActiveNav(item.key)}
                        >
                          <span className={styles.navItemLabel}>
                            {item.label}
                          </span>
                          <span className={styles.navPendingBadge}>
                            {navPendingCount}
                          </span>
                        </button>
                      );
                    })}
                  </nav>
                  <main className={styles.sectionContent}>
                    <ConfigSections
                      activeNav={activeNav}
                      countryOptions={countryOptions}
                      form={form as unknown as FormInstance<MonitorPlanPayload>}
                      factories={factories}
                      factory={factory}
                      readonly={readonly}
                      onAddEvidence={
                        readonly
                          ? undefined
                          : (partCode, itemKey, onCreated) => {
                              setEvidenceCreatePartCode(partCode);
                              setEvidenceCreateItemKey(itemKey);
                              setOnEvidenceCreated(() => onCreated);
                              setEvidenceCreateRequest(request => request + 1);
                            }
                      }
                      onEditEvidence={
                        readonly
                          ? undefined
                          : evidenceId =>
                              setEvidenceEditRequest(request => ({
                                evidenceId,
                                sequence: (request?.sequence || 0) + 1,
                              }))
                      }
                      onDeleteChild={readonly ? undefined : deleteChild}
                      onConfigChange={refreshCompletionPreview}
                    />
                  </main>
                </div>
              ) : null}
              <EvidencePanel
                createRequest={evidenceCreateRequest}
                editRequest={evidenceEditRequest}
                ensurePlanId={ensurePlanId}
                form={form as unknown as FormInstance<MonitorPlanPayload>}
                initialPartCode={evidenceCreatePartCode}
                initialItemKey={evidenceCreateItemKey}
                onCreated={onEvidenceCreated}
                onDeleteChild={readonly ? undefined : deleteChild}
                onPersistenceChanged={refreshPersistedPlanState}
                readonly={readonly}
                visible={activeTab === 'evidence'}
              />
            </div>
          </Form>
        </div>
        {!readonly ? (
          <footer
            className={`${styles.fixedFooter} ${
              embedded ? styles.embeddedFooter : ''
            }`}
          >
            <Space size={16}>
              <Button
                disabled={hasBeenFormallySaved}
                loading={saving}
                onClick={() => submit(true)}
              >
                {I18N.cbamMonitor.saveDraft}
              </Button>
              <Button
                type='primary'
                loading={saving}
                onClick={() => submit(false)}
              >
                {I18N.cbamMonitor.save}
              </Button>
            </Space>
          </footer>
        ) : null}
      </div>
    </Spin>
  );
};

export default PlanPage;
