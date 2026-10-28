/* eslint-disable jsx-a11y/label-has-associated-control -- AntD controls are nested in native labels */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  DatePicker,
  Drawer,
  Empty,
  Form,
  Input,
  message,
  Select,
  Tabs,
  Tooltip,
} from 'antd';
import type { FormInstance } from 'antd';
import BigNumber from 'bignumber.js';
import dayjs from 'dayjs';
import type { ComponentProps, ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { nanoid } from 'nanoid';

import I18N from '@src/lang/I18N';
import { useAllEnumsBatch } from '@src/views/dashborad/Dicts/hooks';

import { IPageList, request, ResponseData } from '@/api/request';
import {
  CbamDrawerClose,
  CbamDrawerTitle,
} from '@/components/CbamDrawerHeader';
import { commonRequestDownloadFile } from '@/api/commonRequest';
import { resolveOperationFileUrl } from '@/views/cbamOperationReport/service';
import editIcon from '@/views/cbamOperationReport/assets/edit.svg';
import excelFileIcon from '@/views/cbamOperationReport/assets/excel-file.svg';
import DecimalInput, {
  DecimalInputLimit,
  NON_CBAM_QUANTITY_LIMIT,
  NON_NEGATIVE_SIX_DECIMAL_LIMIT,
  PERCENT_SIX_DECIMAL_LIMIT,
  PERCENT_TWO_DECIMAL_LIMIT,
  QUANTITY_INPUT_LIMIT,
  RATIO_SIX_DECIMAL_LIMIT,
  SIGNED_SIX_DECIMAL_LIMIT,
} from '@/views/cbamOperationReport/components/DecimalInput';
import {
  JsonObject,
  OperationAccountingProcess,
  OperationCbamProductJson,
  OperationDirectEmissionItem,
  OperationElectricityItem,
  OperationHeatFlowItem,
  OperationNonCbamProductItem,
  OperationPrecursorReportItem,
  OperationProcessConsumption,
  OperationProcessItem,
  OperationProcessJson,
  OperationProductReportItem,
  OperationRouteItem,
  OperationWasteGasItem,
} from '@/views/cbamOperationReport/types';
import { FileObjectUpload } from '@/views/cbamMonitor/components/FileObjectUpload';
import { showMonitorDeleteConfirm } from '@/views/cbamMonitor/deleteConfirm';
import type {
  HeatFlowItem as MonitorHeatFlowItem,
  WasteGasItem as MonitorWasteGasItem,
} from '@/views/cbamMonitor/types';

import styles from './index.module.less';

interface ProductionInfoProps {
  operationId?: number | string;
  form: FormInstance;
  sourcePlan?: JsonObject;
  accountingTaskSelected?: boolean;
  readonly?: boolean;
  onDirty: () => void;
  onEvidenceClick: (itemKey: string, partCode?: string) => void;
}

interface SourceProcess extends JsonObject {
  itemKey?: string;
  id?: number;
  processName?: string;
  productItemKeys?: string[];
  productionRoute?: string;
  description?: string;
}

interface SourceProduct {
  itemKey?: string;
  id?: number;
  processId?: number;
  cnCode?: string;
  productName?: string;
  functionalUnit?: string;
  productType?: string;
}

interface DefaultEmissionOption {
  id?: number;
  defaultCode?: string;
  productionRoute?: string;
  directDefaultValue?: string | number;
  indirectDefaultValue?: string | number;
}

interface RecordDetail {
  title: string;
  currentFields?: [string, string][];
  fields?: [string, string][];
  monitorFields: [string, string][];
  accountingFields?: [string, string][];
}

interface BoundaryFile {
  name?: string;
  size?: string;
  unit?: string;
  url?: string;
  uploadTime?: string;
}

interface BoundaryFormValue {
  processDescription: string;
  boundaryDescription: string;
  files: BoundaryFile[];
}

interface ProcessDetailFormValue {
  routes: OperationRouteItem[];
  description?: string;
  routeChangeDesc?: string;
}

type CategoryKey =
  | 'product'
  | 'precursor'
  | 'direct'
  | 'nonCbam'
  | 'electricity'
  | 'heat'
  | 'wasteGas';
const CATEGORY_PART_CODES: Record<CategoryKey, string> = {
  product: 'CBAM_PRODUCT',
  precursor: 'PRECURSOR',
  direct: 'DIRECT_EMISSION',
  nonCbam: 'NON_CBAM_PRODUCT',
  electricity: 'ELECTRICITY_CONSUMPTION',
  heat: 'HEAT_FLOW',
  wasteGas: 'WASTE_GAS',
};
type ProcessDetailTabKey = 'current' | 'monitor' | 'accounting';
type RangePickerValue = ComponentProps<typeof DatePicker.RangePicker>['value'];

const PROCESS_FIELD_NAMES = [
  'processJson',
  'cbamProductJson',
  'precursorJson',
  'directEmissionJson',
  'nonCbamProductJson',
  'electricityJson',
  'heatFlowJson',
  'wasteGasJson',
];

const asObject = (value: unknown): JsonObject | undefined =>
  value && !Array.isArray(value) && typeof value === 'object'
    ? (value as JsonObject)
    : undefined;

const asArray = <T extends object>(value: unknown): T[] =>
  Array.isArray(value)
    ? (value.filter(item => Boolean(asObject(item))) as T[])
    : [];

const readObjectText = (value?: string): JsonObject => {
  if (!value?.trim()) return {};
  try {
    return asObject(JSON.parse(value)) || {};
  } catch {
    return {};
  }
};

const textValue = (value: unknown) =>
  value === undefined || value === null ? '' : String(value);

const isEditableEmissionValue = (value: string) => {
  if (!value) return true;
  if (value.length > 16 || !/^\d*(?:\.\d{0,6})?$/.test(value)) return false;
  const comparableValue = value.endsWith('.') ? value.slice(0, -1) : value;
  return (
    Boolean(comparableValue) &&
    new BigNumber(comparableValue).isLessThanOrEqualTo('999999999.999999')
  );
};

const directInputLimit = (
  key: keyof OperationDirectEmissionItem,
  isPfc: boolean,
  isMeasurement: boolean,
): DecimalInputLimit => {
  if (isPfc) {
    if (key === 'activityData') return SIGNED_SIX_DECIMAL_LIMIT;
    if (key === 'oxRate') return RATIO_SIX_DECIMAL_LIMIT;
    if (key === 'carbon') return { ...PERCENT_SIX_DECIMAL_LIMIT, min: '0.01' };
    if (key === 'carbonFossil') return PERCENT_SIX_DECIMAL_LIMIT;
    return NON_NEGATIVE_SIX_DECIMAL_LIMIT;
  }
  if (isMeasurement) {
    if (key === 'biomassContent') return PERCENT_SIX_DECIMAL_LIMIT;
    return NON_NEGATIVE_SIX_DECIMAL_LIMIT;
  }
  if (['activityData', 'lowHeat', 'emissionCoefficient'].includes(key)) {
    return SIGNED_SIX_DECIMAL_LIMIT;
  }
  if (['oxRate', 'conversionRate', 'biomassContent'].includes(key)) {
    return PERCENT_SIX_DECIMAL_LIMIT;
  }
  if (key === 'carbon') return RATIO_SIX_DECIMAL_LIMIT;
  return NON_NEGATIVE_SIX_DECIMAL_LIMIT;
};

const displayValue = (value: unknown) => textValue(value) || '-';

const displayWithUnit = (value: unknown, unit?: string) =>
  textValue(value) ? [textValue(value), unit].filter(Boolean).join(' ') : '-';

const displayPeriod = (start: unknown, end: unknown) =>
  textValue(start) || textValue(end)
    ? `${displayValue(start)} ~ ${displayValue(end)}`
    : '-';

const enumDisplayValue = (value: unknown, labels: Record<string, string>) =>
  labels[textValue(value)] || displayValue(value);

const directSourceTypeLabels = (): Record<string, string> => ({
  combustion: I18N.cbamMonitor.combustionFlow,
  COMBUSTION_FLOW: I18N.cbamMonitor.combustionFlow,
  process: I18N.cbamMonitor.processFlow,
  PROCESS_FLOW: I18N.cbamMonitor.processFlow,
  emission_source: I18N.cbamMonitor.emissionSource,
  EMISSION_SOURCE: I18N.cbamMonitor.emissionSource,
  PFC: 'PFC',
  Measurement_values: I18N.cbamMonitor.flow,
  Default_value: 'PFC',
  unknown: I18N.cbamMonitor.emissionSource,
  '1': I18N.cbamMonitor.flow,
  '2': 'PFC',
  '3': I18N.cbamMonitor.emissionSource,
});

const directMethodLabels = (): Record<string, string> => ({
  standard_calculation: I18N.cbamMonitor.standardCalculation,
  STANDARD_CALCULATION: I18N.cbamMonitor.standardCalculation,
  mass_balance: I18N.cbamMonitor.massBalance,
  MASS_BALANCE: I18N.cbamMonitor.massBalance,
  measurement_cems: I18N.cbamMonitor.measurementCems,
  MEASUREMENT_CEMS: I18N.cbamMonitor.measurementCems,
  SLOPE_METHOD: I18N.cbamMonitor.slopeMethod,
  OVERVOLTAGE_METHOD: I18N.cbamMonitor.overvoltageMethod,
  Slope_method: I18N.cbamMonitor.slopeMethod,
  Overpressure_method: I18N.cbamMonitor.overvoltageMethod,
  Burning: I18N.cbamMonitor.combustionFlow,
  Process_Emissions: I18N.cbamMonitor.processFlow,
  Material_Balance: I18N.cbamMonitor.massBalance,
  '1': I18N.cbamMonitor.combustionFlow,
  '2': I18N.cbamMonitor.processFlow,
  '3': I18N.cbamMonitor.massBalance,
  '4': I18N.cbamMonitor.slopeMethod,
  '5': I18N.cbamMonitor.overvoltageMethod,
  '6': 'N₂O',
  '7': 'CO₂',
});

const directFrequencyLabels = (): Record<string, string> => ({
  CONTINUOUS: I18N.cbamMonitor.monitorContinuous,
  SHIFT: I18N.cbamMonitor.monitorShift,
  DAILY: I18N.cbamMonitor.monitorDaily,
  MONTHLY: I18N.cbamMonitor.monitorMonthly,
  QUARTERLY: I18N.cbamMonitor.monitorQuarterly,
  ANNUAL: I18N.cbamMonitor.monitorAnnual,
});

const itemIdentity = (
  process: Pick<SourceProcess, 'itemKey' | 'id' | 'processName'>,
  index: number,
) => textValue(process.itemKey || process.id || process.processName || index);

const productIdentity = (product: SourceProduct, index: number) =>
  textValue(product.itemKey || product.id || product.productName || index);

const formatFileSize = (file: BoundaryFile) => {
  if (!file.size) return '-';
  return `${file.size}${file.unit ? ` ${file.unit}` : ''}`;
};

const productTypeName = (value?: string) => {
  if (value === 'SOLD_PRODUCT') return I18N.cbamOperationReport.soldProduct;
  if (value === 'INTERMEDIATE_PRODUCT')
    return I18N.cbamOperationReport.intermediateProduct;
  return value || '-';
};

const normalizeProcessJson = (value?: string): OperationProcessJson => {
  const parsed = readObjectText(value);
  return {
    processes: asArray<OperationProcessItem>(parsed.processes).map(item => ({
      ...item,
      routes: asArray<OperationRouteItem>(item.routes),
    })),
    productProcesses: asArray<OperationAccountingProcess>(
      parsed.productProcesses,
    ),
    processRelations: asArray(parsed.processRelations),
    reportProcessDescription: textValue(parsed.reportProcessDescription),
    reportBoundaryDescription: textValue(parsed.reportBoundaryDescription),
    reportBoundaryFiles: asArray<BoundaryFile>(parsed.reportBoundaryFiles),
  };
};

const normalizeProductJson = (value?: string): OperationCbamProductJson => {
  const parsed = readObjectText(value);
  return {
    saleProducts: asArray(parsed.saleProducts),
    productResults: asArray(parsed.productResults),
    reportItems: asArray<OperationProductReportItem>(parsed.reportItems).map(
      item => ({
        ...item,
        processConsumptions: asArray<OperationProcessConsumption>(
          item.processConsumptions,
        ),
      }),
    ),
    hiddenProductKeys: Array.isArray(parsed.hiddenProductKeys)
      ? parsed.hiddenProductKeys.map(textValue)
      : [],
  };
};

const routeNames = (process?: OperationProcessItem) =>
  (process?.routes || [])
    .map(item => item.routeName?.trim())
    .filter(Boolean) as string[];

const normalizedRouteNames = (values: string[]) =>
  [...new Set(values.map(item => item.trim()).filter(Boolean))]
    .sort()
    .join('\n');

const routeQuantityTotal = (routes: OperationRouteItem[]) =>
  routes
    .reduce((total, route) => {
      const quantity = new BigNumber(route.productionQuantity || '');
      return quantity.isFinite() ? total.plus(quantity) : total;
    }, new BigNumber(0))
    .toFixed();

const rangeValue = (start?: string, end?: string): RangePickerValue =>
  start && end
    ? ([dayjs(start), dayjs(end)] as unknown as RangePickerValue)
    : undefined;

const sourceMatchesProcess = (
  itemKey: string | undefined,
  process: OperationProcessItem,
  processKey: string,
  processCount: number,
) =>
  itemKey === processKey ||
  Boolean(itemKey && itemKey === process.sourceItemKey) ||
  (!itemKey && processCount === 1);

const ProductionInfo = ({
  operationId,
  form,
  sourcePlan,
  accountingTaskSelected,
  readonly,
  onDirty,
  onEvidenceClick,
}: ProductionInfoProps) => {
  const [boundaryForm] = Form.useForm<BoundaryFormValue>();
  const [processDetailForm] = Form.useForm<ProcessDetailFormValue>();
  const countryEnums = useAllEnumsBatch('CBAMcountryinfo')?.CBAMcountryinfo;
  const processJsonText = Form.useWatch('processJson', form) as
    | string
    | undefined;
  const productJsonText = Form.useWatch('cbamProductJson', form) as
    | string
    | undefined;
  const precursorJsonText = Form.useWatch('precursorJson', form) as
    | string
    | undefined;
  const directJsonText = Form.useWatch('directEmissionJson', form) as
    | string
    | undefined;
  const nonCbamJsonText = Form.useWatch('nonCbamProductJson', form) as
    | string
    | undefined;
  const electricityJsonText = Form.useWatch('electricityJson', form) as
    | string
    | undefined;
  const heatJsonText = Form.useWatch('heatFlowJson', form) as
    | string
    | undefined;
  const wasteGasJsonText = Form.useWatch('wasteGasJson', form) as
    | string
    | undefined;
  const detailRoutes = Form.useWatch('routes', processDetailForm) || [];
  const [activeCategories, setActiveCategories] = useState<
    Record<string, CategoryKey>
  >({});
  const [boundaryDrawerOpen, setBoundaryDrawerOpen] = useState(false);
  const [detailProcessKey, setDetailProcessKey] = useState<string>();
  const [selectedDetailProductKey, setSelectedDetailProductKey] =
    useState<string>();
  const [detailTab, setDetailTab] = useState<ProcessDetailTabKey>('current');
  const [recordDetail, setRecordDetail] = useState<RecordDetail>();
  const [defaultEmissions, setDefaultEmissions] = useState<
    DefaultEmissionOption[]
  >([]);

  useEffect(() => {
    if (!accountingTaskSelected && detailTab === 'accounting')
      setDetailTab('current');
  }, [accountingTaskSelected, detailTab]);

  useEffect(() => {
    request<ResponseData<IPageList<DefaultEmissionOption>>>({
      method: 'GET',
      url: '/cbam2/defaultCn',
      params: { pageNum: 1, pageSize: 10000 },
    })
      .then(response => setDefaultEmissions(response.data?.data?.records || []))
      .catch(() => {
        setDefaultEmissions([]);
      });
  }, []);

  const source = sourcePlan || {};
  const countryName = (value: unknown) =>
    countryEnums?.find(item => textValue(item.dictValue) === textValue(value))
      ?.dictLabel || displayValue(value);
  const facility = asObject(source.facility) || {};
  const facilityJson = asObject(facility.facilityJson) || {};
  const goodsBoundary = asObject(source.goodsBoundary) || {};
  const sourceProcessJson = asObject(goodsBoundary.processJson) || {};
  const sourceProductJson = asObject(goodsBoundary.productJson) || {};
  const sourcePrecursorJson = asObject(goodsBoundary.precursorJson) || {};
  const sourceNonCbamJson = asObject(goodsBoundary.nonCbamGoodsJson) || {};
  const sourceDirectEmission = asObject(source.directEmission) || {};
  const sourceProcessMonitorJson =
    asObject(sourceDirectEmission.processMonitorJson) || {};
  const sourcePfcMonitorJson =
    asObject(sourceDirectEmission.pfcMonitorJson) || {};
  const systemBoundaryJson = asObject(goodsBoundary.systemBoundaryJson) || {};
  const reportProcessJson = normalizeProcessJson(processJsonText);
  const reportProductJson = normalizeProductJson(productJsonText);
  const precursorJson = readObjectText(precursorJsonText);
  const directJson = readObjectText(directJsonText);
  const nonCbamJson = readObjectText(nonCbamJsonText);
  const electricityJson = readObjectText(electricityJsonText);
  const heatJson = readObjectText(heatJsonText);
  const wasteGasJson = readObjectText(wasteGasJsonText);
  const precursorItems = asArray<OperationPrecursorReportItem>(
    precursorJson.reportItems,
  );
  const directItems = asArray<OperationDirectEmissionItem>(directJson.items);
  const nonCbamItems = asArray<OperationNonCbamProductItem>(nonCbamJson.items);
  const electricityItems = asArray<OperationElectricityItem>(
    electricityJson.items,
  );
  const heatItems = asArray<OperationHeatFlowItem>(heatJson.items);
  const wasteGasItems = asArray<OperationWasteGasItem>(wasteGasJson.items);
  const accountingDirectItems = asArray<OperationDirectEmissionItem>(
    directJson.sourceFlows,
  );
  const accountingAttributions = asArray<JsonObject>(
    directJson.productAttributions,
  );
  const accountingElectricityItems = asArray<OperationElectricityItem>(
    electricityJson.eleCalculators,
  );
  const accountingHeatItems = asArray<JsonObject>(heatJson.hotEle);
  const accountingProcesses = reportProcessJson.productProcesses;
  const accountingRelations = reportProcessJson.processRelations;
  const accountingProducts = reportProductJson.saleProducts;
  const sourceProcesses = asArray<SourceProcess>(sourceProcessJson.processes);
  const sourceProducts = asArray<SourceProduct>(sourceProductJson.products);
  const sourcePrecursors = asArray<JsonObject>(sourcePrecursorJson.precursors);
  const sourceMonitorMethods = [
    ...asArray<JsonObject>(sourceProcessMonitorJson.methods),
    ...asArray<JsonObject>(sourcePfcMonitorJson.methods),
  ];
  const sourceCondition = asObject(source.condition) || {};
  const sourceFacilityElectricity =
    asObject(sourceCondition.facilityElectricityJson) || {};
  const sourceMeasurableHeat =
    asObject(sourceCondition.measurableHeatJson) || {};
  const sourceHeatFlows = asArray<MonitorHeatFlowItem>(
    sourceMeasurableHeat.heatFlows,
  );
  const sourceWasteGas = asObject(sourceCondition.wasteGasJson) || {};
  const sourceWasteGasFlows = asArray<MonitorWasteGasItem>(
    sourceWasteGas.wasteGasFlows,
  );
  const initializedSourceProcesses: OperationProcessItem[] =
    sourceProcesses.map((process, index) => {
      const sourceKey = itemIdentity(process, index);
      const accounting = accountingProcesses.find(
        item => item.processName === process.processName,
      );
      const sourceRouteName = textValue(process.productionRoute);
      return {
        itemKey: sourceKey,
        sourceItemKey: process.itemKey,
        accountingProcessId: accounting?.id,
        processName: process.processName,
        description: process.description,
        productItemKeys: process.productItemKeys || [],
        precursorItemKeys: Array.isArray(process.precursorItemKeys)
          ? process.precursorItemKeys
          : [],
        sourceRouteNames: sourceRouteName ? [sourceRouteName] : [],
        routes: [
          {
            itemKey: `${sourceKey}-route-1`,
            routeName: sourceRouteName,
            productionQuantity: accounting?.totalVolume,
            unit: accounting?.unitName || accounting?.unit || 't',
            sortNo: 1,
          },
        ],
        sortNo: index + 1,
      };
    });
  const processes = reportProcessJson.processes.length
    ? reportProcessJson.processes
    : initializedSourceProcesses;

  useEffect(() => {
    if (!sourcePlan || processJsonText === undefined || !processes.length)
      return;
    let initialized = false;
    const setReportList = (
      fieldName: string,
      json: JsonObject,
      listName: 'items' | 'reportItems',
      current: object[],
      next: object[],
    ) => {
      if (current.length || !next.length) return;
      form.setFieldValue(
        fieldName,
        JSON.stringify({ ...json, [listName]: next }, null, 2),
      );
      initialized = true;
    };

    const precursorByKey = new Map(
      sourcePrecursors.map((item, index) => [
        textValue(item.itemKey || index),
        item,
      ]),
    );
    const sourcePrecursorItems = processes.flatMap((process, processIndex) => {
      const processKey = itemIdentity(process, processIndex);
      return (process.precursorItemKeys || []).flatMap(precursorKey => {
        const sourceItem = precursorByKey.get(textValue(precursorKey));
        if (!sourceItem) return [];
        const itemKey = `${processKey}:${precursorKey}`;
        const item: OperationPrecursorReportItem = {
          itemKey,
          processItemKey: processKey,
          precursorItemKey: textValue(precursorKey),
          precursorName: textValue(sourceItem.precursorName),
          cnCode: textValue(sourceItem.cnCode),
          emissionBasis: textValue(sourceItem.emissionBasis),
          supplierName: textValue(sourceItem.supplierName),
          directEmission: '',
          indirectEmission: '',
          unit: 't',
          routeQuantities: [{ itemKey: `${itemKey}:route`, quantity: '' }],
          processConsumptions: [],
        };
        return [item];
      });
    });
    setReportList(
      'precursorJson',
      precursorJson,
      'reportItems',
      precursorItems,
      sourcePrecursorItems,
    );

    const sourceDirectItems: OperationDirectEmissionItem[] = [
      ...asArray<JsonObject>(sourceProcessMonitorJson.methods).map(
        (method, index) => ({
          itemKey: textValue(method.itemKey || `process-monitor:${index}`),
          sourceItemKey: textValue(method.itemKey),
          processItemKey: textValue(method.processItemKey),
          sourceName: textValue(method.sourceFlowName),
          monitorSourceType: textValue(method.sourceType),
          greenhouseGasType: textValue(method.ghgType),
          monitorMethod: textValue(method.monitorMethod),
          dataSource: textValue(method.dataSource),
          biomassContentUnit: '%',
        }),
      ),
      ...asArray<JsonObject>(sourcePfcMonitorJson.methods).map(
        (method, index) => ({
          itemKey: textValue(method.itemKey || `pfc-monitor:${index}`),
          sourceItemKey: textValue(method.itemKey),
          processItemKey: textValue(method.processItemKey),
          sourceName: textValue(method.technology),
          greenhouseGasType: 'PFC（CF₄/C₂F₆）',
          pfcMethod: textValue(method.method),
          dataSource: textValue(method.dataSource),
          activityUnit: 't',
        }),
      ),
    ];
    setReportList(
      'directEmissionJson',
      directJson,
      'items',
      directItems,
      sourceDirectItems,
    );

    const sourceNonCbamItems: OperationNonCbamProductItem[] =
      asArray<JsonObject>(sourceNonCbamJson.goods).map((goods, index) => ({
        itemKey: textValue(goods.itemKey || `non-cbam:${index}`),
        sourceItemKey: textValue(goods.itemKey),
        processItemKey: textValue(goods.processItemKey),
        goodsName: textValue(goods.goodsName),
        plannedAllocationMethod: textValue(goods.allocationMethod),
        plannedAllocationRate: textValue(goods.allocationRate),
        allocationMethod: textValue(goods.allocationMethod),
        allocationRate: textValue(goods.allocationRate),
      }));
    setReportList(
      'nonCbamProductJson',
      nonCbamJson,
      'items',
      nonCbamItems,
      sourceNonCbamItems,
    );

    const sourceElectricityItems: OperationElectricityItem[] =
      asArray<JsonObject>(sourceFacilityElectricity.generators).map(
        (generator, index) => ({
          itemKey: textValue(generator.itemKey || `generator:${index}`),
          sourceItemKey: textValue(generator.itemKey),
          processItemKey: textValue(generator.processItemKey),
          electricitySource: textValue(generator.generationMode),
          powerFacility: textValue(generator.generationMode),
        }),
      );
    setReportList(
      'electricityJson',
      electricityJson,
      'items',
      electricityItems,
      sourceElectricityItems,
    );

    const sourceHeatItems: OperationHeatFlowItem[] = sourceHeatFlows.map(
      (flow, index) => ({
        itemKey: textValue(flow.itemKey || `heat-flow:${index}`),
        sourceItemKey: textValue(flow.itemKey),
        processItemKey: textValue(flow.processItemKey),
        medium: textValue(flow.medium),
        direction: textValue(flow.direction),
        counterpartyFacility: textValue(flow.counterparty),
        allocationMethod: textValue(flow.allocationMethod),
        meteringPoint: textValue(flow.meteringPoint),
      }),
    );
    setReportList(
      'heatFlowJson',
      heatJson,
      'items',
      heatItems,
      sourceHeatItems,
    );

    const sourceWasteGasItems: OperationWasteGasItem[] =
      sourceWasteGasFlows.map((flow, index) => ({
        itemKey: textValue(flow.itemKey || `waste-gas:${index}`),
        sourceItemKey: textValue(flow.itemKey),
        processItemKey: textValue(flow.processItemKey),
        wasteGasType: textValue(flow.wasteGasType),
        method: Array.isArray(flow.flowModes)
          ? flow.flowModes.join(', ')
          : textValue(flow.flowModes),
        counterpartyFacility: textValue(flow.counterparty),
        monitoringAllocationMethod: textValue(flow.method),
      }));
    setReportList(
      'wasteGasJson',
      wasteGasJson,
      'items',
      wasteGasItems,
      sourceWasteGasItems,
    );
    if (initialized && !readonly) onDirty();
  }, [
    form,
    sourcePlan,
    processJsonText,
    precursorJsonText,
    directJsonText,
    nonCbamJsonText,
    electricityJsonText,
    heatJsonText,
    wasteGasJsonText,
    readonly,
    onDirty,
  ]);
  const { reportItems, hiddenProductKeys } = reportProductJson;
  const processDescription = textValue(
    reportProcessJson.reportProcessDescription ??
      facilityJson.processDescription,
  );
  const boundaryDescription = textValue(
    reportProcessJson.reportBoundaryDescription ??
      systemBoundaryJson.boundaryDescription,
  );
  const boundaryFiles = asArray<BoundaryFile>(
    reportProcessJson.reportBoundaryFiles ?? systemBoundaryJson.files,
  );

  const processProducts = processes.reduce<Record<string, SourceProduct[]>>(
    (result, process, processIndex) => {
      const processKey = itemIdentity(process, processIndex);
      const productKeys = Array.isArray(process.productItemKeys)
        ? process.productItemKeys.map(textValue)
        : [];
      const accountProducts = accountingProducts.filter(
        product =>
          textValue(product.processId) ===
          textValue(process.accountingProcessId),
      );
      const products: SourceProduct[] = productKeys.length
        ? sourceProducts.filter(product =>
            productKeys.includes(textValue(product.itemKey)),
          )
        : accountProducts.length
        ? accountProducts.map(product => ({ ...product }))
        : sourceProducts.filter(() => processes.length === 1);
      result[processKey] = products.filter((product, productIndex) => {
        const key = `${processKey}:${productIdentity(product, productIndex)}`;
        return !hiddenProductKeys.includes(key);
      });
      return result;
    },
    {},
  );
  const detailProcessIndex = processes.findIndex(
    (process, index) => itemIdentity(process, index) === detailProcessKey,
  );
  const detailProcess =
    detailProcessIndex >= 0 ? processes[detailProcessIndex] : undefined;
  const detailSourceProcess = sourceProcesses.find(
    (process, index) =>
      textValue(process.itemKey) === textValue(detailProcess?.sourceItemKey) ||
      itemIdentity(process, index) === detailProcessKey ||
      process.processName === detailProcess?.processName,
  );
  const detailAccountProcess = accountingProcesses.find(
    item =>
      item.id === detailProcess?.accountingProcessId ||
      item.processName === detailProcess?.processName,
  );
  const linkedDetailAccountProcess =
    detailProcess?.accountingProcessId === undefined
      ? undefined
      : accountingProcesses.find(
          item => item.id === detailProcess.accountingProcessId,
        );
  const detailProducts = detailProcessKey
    ? processProducts[detailProcessKey] || []
    : [];
  const selectedDetailProductIndex = detailProducts.findIndex(
    (product, index) =>
      productIdentity(product, index) === selectedDetailProductKey,
  );
  const detailProductIndex =
    selectedDetailProductIndex >= 0 ? selectedDetailProductIndex : 0;
  const detailProduct = detailProducts[detailProductIndex];
  const detailUnit = textValue(
    detailProduct?.functionalUnit ||
      detailAccountProcess?.unitName ||
      detailAccountProcess?.unit ||
      't',
  );
  const detailRouteUnit = textValue(
    detailProcess?.routes[0]?.unit || detailUnit || 't',
  );
  const detailRoutesChanged =
    normalizedRouteNames(detailProcess?.sourceRouteNames || []) !==
    normalizedRouteNames(detailRoutes.map(route => route.routeName || ''));

  const updateProcessJson = (patch: Partial<OperationProcessJson>) => {
    form.setFieldValue(
      'processJson',
      JSON.stringify({ ...reportProcessJson, ...patch }, null, 2),
    );
    onDirty();
  };

  const updateRoutes = (
    process: OperationProcessItem,
    routes: OperationRouteItem[],
  ) => {
    const nextAccountingProcesses = accountingProcesses.map(item =>
      item.id === process.accountingProcessId
        ? { ...item, totalVolume: routeQuantityTotal(routes) }
        : item,
    );
    updateProcessJson({
      processes: processes.map(item =>
        item.itemKey === process.itemKey ? { ...item, routes } : item,
      ),
      productProcesses: nextAccountingProcesses,
    });
  };

  const updateProductItem = (
    processKey: string,
    productKey: string,
    patch: Partial<OperationProductReportItem>,
    fallback?: Partial<OperationProductReportItem>,
  ) => {
    const key = `${processKey}:${productKey}`;
    const index = reportItems.findIndex(item => item.itemKey === key);
    const base: OperationProductReportItem =
      index >= 0
        ? reportItems[index]
        : {
            itemKey: key,
            processItemKey: processKey,
            productItemKey: productKey,
            processConsumptions: [],
            ...fallback,
          };
    const nextItem = { ...base, ...patch };
    const nextItems =
      index >= 0
        ? reportItems.map((item, itemIndex) =>
            itemIndex === index ? nextItem : item,
          )
        : [...reportItems, nextItem];
    form.setFieldValue(
      'cbamProductJson',
      JSON.stringify({ ...reportProductJson, reportItems: nextItems }, null, 2),
    );
    onDirty();
  };

  const updateCategoryItem = <T extends { itemKey?: string }>(
    fieldName: string,
    json: JsonObject,
    listName: 'items' | 'reportItems',
    items: T[],
    currentItem: T,
    patch: Partial<T>,
  ) => {
    form.setFieldValue(
      fieldName,
      JSON.stringify(
        {
          ...json,
          [listName]: items.map(item =>
            item === currentItem ? { ...item, ...patch } : item,
          ),
        },
        null,
        2,
      ),
    );
    onDirty();
  };

  const renderNumberField = (
    label: string,
    value: string | undefined,
    unit: string | undefined,
    onChange: (value: string) => void,
    key?: string,
    required = true,
    limit: DecimalInputLimit = QUANTITY_INPUT_LIMIT,
  ) => (
    <label key={key || label}>
      <span
        className={
          required ? styles.quantityLabel : styles.optionalQuantityLabel
        }
      >
        {label}
      </span>
      <DecimalInput
        value={value}
        disabled={readonly}
        {...limit}
        addonAfter={
          unit && unit.length > 18 ? (
            <Tooltip title={unit}>
              <span className={styles.compactUnit}>{unit}</span>
            </Tooltip>
          ) : (
            unit
          )
        }
        onValueChange={onChange}
      />
    </label>
  );

  const renderPeriodField = (
    label: string,
    start: string | undefined,
    end: string | undefined,
    onChange: (start?: string, end?: string) => void,
  ) => (
    <label className={styles.monitorPeriod}>
      <span>{label}</span>
      <DatePicker.RangePicker
        value={rangeValue(start, end)}
        disabled={readonly}
        placeholder={['', '']}
        onChange={dates =>
          onChange(
            dates?.[0]?.format('YYYY-MM-DD'),
            dates?.[1]?.format('YYYY-MM-DD'),
          )
        }
      />
    </label>
  );

  const renderCategoryCard = (
    category: CategoryKey,
    itemKey: string,
    index: number,
    title: string,
    metadata: [string, string][],
    fields: [string, string][],
    monitorFields: [string, string][],
    accountingFields: [string, string][] | undefined,
    children: ReactNode,
    trailingAction?: ReactNode,
  ) => (
    <article className={styles.productItem} key={itemKey}>
      <header className={styles.productHeader}>
        <span className={styles.productIndex}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div
          className={`${styles.productTitle} ${
            metadata.length ? '' : styles.productTitleOnly
          }`}
        >
          <strong>{title}</strong>
          {metadata.length ? (
            <div>
              {metadata.map(([label, value]) => (
                <span key={label}>
                  <span className={styles.metaLabel}>{label}: </span>
                  {value}
                </span>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.productActions}>
          <button
            type='button'
            onClick={() =>
              onEvidenceClick(itemKey, CATEGORY_PART_CODES[category])
            }
          >
            {I18N.cbamOperationReport.evidenceManagement}
          </button>
          <button
            type='button'
            onClick={() =>
              setRecordDetail({
                title,
                currentFields: [...metadata, ...fields],
                monitorFields,
                accountingFields,
              })
            }
          >
            {I18N.cbamOperationReport.viewDetails}
          </button>
          {trailingAction}
        </div>
      </header>
      {children}
    </article>
  );

  const updateAccountingSales = (
    process: OperationProcessItem,
    salesVolume: string,
  ) => {
    updateProcessJson({
      productProcesses: accountingProcesses.map(item =>
        item.id === process.accountingProcessId
          ? { ...item, salesVolume }
          : item,
      ),
    });
  };

  const openProcessDetail = (
    process: OperationProcessItem,
    processKey: string,
    productKey?: string,
  ) => {
    processDetailForm.setFieldsValue({
      routes: process.routes.length
        ? process.routes
        : [
            {
              itemKey: nanoid(),
              routeName: '',
              productionQuantity: '',
              unit: 't',
              sortNo: 1,
            },
          ],
      description: process.description,
      routeChangeDesc: process.routeChangeDesc,
    });
    setDetailTab('current');
    setSelectedDetailProductKey(productKey);
    setDetailProcessKey(processKey);
  };

  const closeProcessDetail = () => {
    setDetailProcessKey(undefined);
    setSelectedDetailProductKey(undefined);
  };

  const saveProcessDetail = async () => {
    if (!detailProcess || !detailProcessKey) return;
    if (detailTab !== 'current' || readonly) {
      closeProcessDetail();
      return;
    }
    const values = await processDetailForm.validateFields();
    const nextRoutes = values.routes.map((route, index) => ({
      ...detailProcess.routes[index],
      ...route,
      itemKey:
        route.itemKey || detailProcess.routes[index]?.itemKey || nanoid(),
      unit: detailRouteUnit,
      sortNo: index + 1,
    }));
    const nextProcesses = processes.map((process, index) =>
      itemIdentity(process, index) === detailProcessKey
        ? {
            ...process,
            description: values.description,
            routeChangeDesc: values.routeChangeDesc,
            routes: nextRoutes,
          }
        : process,
    );
    updateProcessJson({
      processes: nextProcesses,
      productProcesses: accountingProcesses.map(item =>
        item.id === detailProcess.accountingProcessId
          ? { ...item, totalVolume: routeQuantityTotal(nextRoutes) }
          : item,
      ),
    });
    closeProcessDetail();
  };

  const openBoundaryEditor = () => {
    boundaryForm.setFieldsValue({
      processDescription,
      boundaryDescription,
      files: boundaryFiles,
    });
    setBoundaryDrawerOpen(true);
  };

  const saveBoundary = async () => {
    const values = await boundaryForm.validateFields();
    updateProcessJson({
      reportProcessDescription: values.processDescription,
      reportBoundaryDescription: values.boundaryDescription,
      reportBoundaryFiles: values.files,
    });
    setBoundaryDrawerOpen(false);
  };

  const downloadBoundaryFile = async (file: BoundaryFile) => {
    if (!file.url) return;
    try {
      await commonRequestDownloadFile(
        await resolveOperationFileUrl(operationId, file.url),
        file.name || I18N.cbamOperationReport.unnamedFile,
      );
    } catch {
      message.error(I18N.carbonData.downloadFailed);
    }
  };

  const categoryTabs: { key: CategoryKey; label: string }[] = [
    { key: 'product', label: I18N.cbamOperationReport.cbamProducts },
    {
      key: 'precursor',
      label: I18N.cbamOperationReport.purchasedCbamPrecursors,
    },
    { key: 'direct', label: I18N.cbamOperationReport.directEmissions },
    { key: 'nonCbam', label: I18N.cbamOperationReport.nonCbamProducts },
    {
      key: 'electricity',
      label: I18N.cbamOperationReport.electricityConsumption,
    },
    { key: 'heat', label: I18N.cbamOperationReport.heatFlows },
    { key: 'wasteGas', label: I18N.cbamOperationReport.wasteGas },
  ];

  return (
    <div className={styles.root}>
      {PROCESS_FIELD_NAMES.map(name => (
        <Form.Item key={name} name={name} hidden>
          <Input />
        </Form.Item>
      ))}
      <section className={styles.boundarySection}>
        <header className={styles.sectionHeader}>
          <h3>{I18N.cbamOperationReport.onsiteProcessBoundary}</h3>
          {!readonly && (
            <button
              type='button'
              className={styles.editButton}
              onClick={openBoundaryEditor}
            >
              <img src={editIcon} alt='' />
              {I18N.cbamOperationReport.edit}
            </button>
          )}
        </header>
        <div className={styles.boundaryGrid}>
          <label>
            <span>{I18N.cbamOperationReport.onsiteProcessDescription}</span>
            <Input value={processDescription} readOnly />
          </label>
          <label>
            <span>
              {I18N.cbamOperationReport.boundaryCompletenessDescription}
            </span>
            <Input value={boundaryDescription} readOnly />
          </label>
        </div>
        <div className={styles.fileGroup}>
          <span className={styles.fieldLabel}>
            {I18N.cbamOperationReport.systemBoundaryDiagram}
          </span>
          {boundaryFiles.length ? (
            boundaryFiles.map((file, index) => (
              <div
                className={styles.fileCard}
                key={`${file.url || file.name || index}`}
              >
                <img src={excelFileIcon} alt='' />
                <div className={styles.fileInfo}>
                  <strong>
                    <Tooltip
                      title={file.name || I18N.cbamOperationReport.unnamedFile}
                    >
                      {file.url ? (
                        <Button
                          type='link'
                          className={styles.fileNameLink}
                          onClick={() => downloadBoundaryFile(file)}
                        >
                          {file.name || I18N.cbamOperationReport.unnamedFile}
                        </Button>
                      ) : (
                        <span className={styles.fileNameLink}>
                          {file.name || I18N.cbamOperationReport.unnamedFile}
                        </span>
                      )}
                    </Tooltip>
                  </strong>
                  <span>
                    {I18N.cbamOperationReport.fileSize}: {formatFileSize(file)}
                    &nbsp;&nbsp;{I18N.cbamOperationReport.uploadTime}:{' '}
                    {file.uploadTime || '-'}
                  </span>
                </div>
                {file.url ? (
                  <button
                    type='button'
                    className={styles.downloadButton}
                    onClick={() => downloadBoundaryFile(file)}
                  >
                    {I18N.cbamOperationReport.download}
                  </button>
                ) : null}
              </div>
            ))
          ) : (
            <div className={styles.emptyFile}>-</div>
          )}
        </div>
      </section>

      <div className={styles.processList}>
        {processes.length ? (
          processes.map((process, processIndex) => {
            const processKey = itemIdentity(process, processIndex);
            const activeCategory = activeCategories[processKey] || 'product';
            const accountProcess = accountingProcesses.find(
              item =>
                item.id === process.accountingProcessId ||
                item.processName === process.processName,
            );
            const hasAccountingTask =
              process.accountingProcessId !== undefined &&
              process.accountingProcessId !== null;
            const routeSummary = routeNames(process).join('、');
            const unit = textValue(
              accountProcess?.unitName || accountProcess?.unit || 't',
            );
            const routeUnit = textValue(process.routes[0]?.unit || 't');
            const products = processProducts[processKey] || [];
            const precursors = precursorItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const emissions = directItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const nonCbamProducts = nonCbamItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const electricitySources = electricityItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const heatFlows = heatItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const wasteGases = wasteGasItems.filter(item =>
              sourceMatchesProcess(
                item.processItemKey,
                process,
                processKey,
                processes.length,
              ),
            );
            const sourceCondition = asObject(source.condition) || {};
            const facilityElectricity =
              asObject(sourceCondition.facilityElectricityJson) || {};
            const electricityModes = asArray<JsonObject>(
              facilityElectricity.generators,
            )
              .map(generator => textValue(generator.generationMode))
              .filter(Boolean);
            const electricityOptions = [
              ...new Set([
                'GRID',
                ...electricityModes,
                ...electricitySources
                  .map(item => textValue(item.electricitySource))
                  .filter(Boolean),
              ]),
            ].map(value => ({
              value,
              label:
                value === 'GRID'
                  ? I18N.cbamOperationReport.gridElectricity
                  : value,
            }));
            return (
              <section className={styles.processCard} key={processKey}>
                <header className={styles.processHeader}>
                  <div>
                    <strong>
                      {process.processName ||
                        I18N.cbamOperationReport.unnamedProcess}
                    </strong>
                    <span>
                      {I18N.cbamOperationReport.productionRouteLabel}:{' '}
                      {routeSummary || '-'}
                    </span>
                  </div>
                  <Button
                    className={styles.processDetailButton}
                    onClick={() => openProcessDetail(process, processKey)}
                  >
                    {I18N.cbamOperationReport.viewDetails}
                  </Button>
                </header>
                <div className={styles.processBody}>
                  <div className={styles.categoryToolbar}>
                    <div className={styles.categoryTabs}>
                      {categoryTabs.map(tab => (
                        <button
                          type='button'
                          key={tab.key}
                          className={
                            activeCategory === tab.key
                              ? styles.activeCategory
                              : ''
                          }
                          onClick={() =>
                            setActiveCategories(current => ({
                              ...current,
                              [processKey]: tab.key,
                            }))
                          }
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    {activeCategory === 'electricity' && !readonly ? (
                      <Button
                        type='primary'
                        className={styles.addElectricityButton}
                        icon={<PlusOutlined />}
                        onClick={() => {
                          form.setFieldValue(
                            'electricityJson',
                            JSON.stringify(
                              {
                                ...electricityJson,
                                items: [
                                  ...electricityItems,
                                  {
                                    itemKey: nanoid(),
                                    processItemKey: processKey,
                                    electricitySource: 'GRID',
                                  },
                                ],
                              },
                              null,
                              2,
                            ),
                          );
                          onDirty();
                        }}
                      >
                        {I18N.cbamOperationReport.addElectricitySource}
                      </Button>
                    ) : null}
                  </div>
                  {activeCategory === 'product' ? (
                    products.length ? (
                      products.map((product, productIndex) => {
                        const productKey = productIdentity(
                          product,
                          productIndex,
                        );
                        const itemKey = `${processKey}:${productKey}`;
                        const reportItem = reportItems.find(
                          item => item.itemKey === itemKey,
                        );
                        const matchingAccountProduct = accountingProducts.find(
                          item =>
                            textValue(item.id) === textValue(product.id) ||
                            (item.productName === product.productName &&
                              textValue(item.processId) ===
                                textValue(accountProcess?.id)),
                        );
                        const fallback = {
                          externalSalesQuantity: textValue(
                            accountProcess?.salesVolume,
                          ),
                          processConsumptions: [],
                        };
                        const periodValue: RangePickerValue =
                          reportItem?.monitorStartDate &&
                          reportItem.monitorEndDate
                            ? ([
                                dayjs(reportItem.monitorStartDate),
                                dayjs(reportItem.monitorEndDate),
                              ] as unknown as RangePickerValue)
                            : undefined;
                        const consumptions =
                          reportItem?.processConsumptions || [];
                        const productTitle =
                          product.productName ||
                          matchingAccountProduct?.productName ||
                          I18N.cbamOperationReport.unnamedProduct;
                        const productMetadata: [string, string][] = [
                          [I18N.cbamOperationReport.productName, productTitle],
                          [
                            I18N.cbamOperationReport.cnCode,
                            product.cnCode ||
                              matchingAccountProduct?.cnCode ||
                              '-',
                          ],
                          [
                            I18N.cbamOperationReport.productType,
                            productTypeName(product.productType),
                          ],
                          [
                            I18N.cbamOperationReport.functionalUnit,
                            product.functionalUnit || unit || '-',
                          ],
                        ];
                        const accountConsumptions = hasAccountingTask
                          ? accountingRelations
                              .filter(
                                relation =>
                                  relation.relationId ===
                                    process.accountingProcessId &&
                                  relation.isProcess === 0,
                              )
                              .map((relation, relationIndex) => {
                                const consumer = accountingProcesses.find(
                                  value =>
                                    value.id === relation.productProcessId,
                                );
                                return [
                                  I18N.template(
                                    I18N.cbamOperationReport.processConsumption,
                                    {
                                      process:
                                        consumer?.processName ||
                                        String(relationIndex + 1),
                                    },
                                  ),
                                  displayWithUnit(relation.emission, unit),
                                ] as [string, string];
                              })
                          : [];
                        const productAccountingFields:
                          | [string, string][]
                          | undefined =
                          hasAccountingTask && accountProcess
                            ? [
                                [
                                  I18N.cbamOperationReport
                                    .factoryProductionQuantity,
                                  displayWithUnit(
                                    accountProcess.totalVolume,
                                    unit,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .totalProductionQuantity,
                                  displayWithUnit(
                                    accountProcess.totalVolume,
                                    unit,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .externalSalesQuantity,
                                  displayWithUnit(
                                    accountProcess.salesVolume,
                                    unit,
                                  ),
                                ],
                                ...accountConsumptions,
                                [
                                  I18N.cbamOperationReport.nonCbamConsumption,
                                  displayWithUnit(
                                    accountProcess.nonCbamConsumption,
                                    unit,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.processName,
                                  displayValue(
                                    matchingAccountProduct?.processName,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.productName,
                                  displayValue(
                                    matchingAccountProduct?.productName,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.cnCode,
                                  displayValue(matchingAccountProduct?.cnCode),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .mainPrecursorReducingAgent,
                                  displayValue(
                                    matchingAccountProduct?.reducing,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.manganeseContent,
                                  displayValue(matchingAccountProduct?.mnPer),
                                ],
                                [
                                  I18N.cbamOperationReport.chromiumContent,
                                  displayValue(matchingAccountProduct?.crPer),
                                ],
                                [
                                  I18N.cbamOperationReport.nickelContent,
                                  displayValue(matchingAccountProduct?.niPer),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .totalOtherAlloyContent,
                                  displayValue(
                                    matchingAccountProduct?.alloyPer,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .scrapConsumptionPerProduct,
                                  displayValue(
                                    matchingAccountProduct?.steelScrap,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .preConsumerScrapRatio,
                                  displayValue(
                                    matchingAccountProduct?.wasteMaterial,
                                  ),
                                ],
                              ]
                            : undefined;
                        return (
                          <article className={styles.productItem} key={itemKey}>
                            <header className={styles.productHeader}>
                              <span className={styles.productIndex}>
                                {String(productIndex + 1).padStart(2, '0')}
                              </span>
                              <div className={styles.productTitle}>
                                <strong>
                                  {product.productName ||
                                    matchingAccountProduct?.productName ||
                                    I18N.cbamOperationReport.unnamedProduct}
                                </strong>
                                <div>
                                  <span>
                                    <span className={styles.metaLabel}>
                                      {I18N.cbamOperationReport.cnCode}:{' '}
                                    </span>
                                    {product.cnCode ||
                                      matchingAccountProduct?.cnCode ||
                                      '-'}
                                  </span>
                                  <span>
                                    <span className={styles.metaLabel}>
                                      {I18N.cbamOperationReport.productType}:{' '}
                                    </span>
                                    {productTypeName(product.productType)}
                                  </span>
                                  <span>
                                    <span className={styles.metaLabel}>
                                      {I18N.cbamOperationReport.functionalUnit}:{' '}
                                    </span>
                                    {product.functionalUnit || unit || '-'}
                                  </span>
                                </div>
                              </div>
                              <div className={styles.productActions}>
                                <button
                                  type='button'
                                  onClick={() =>
                                    onEvidenceClick(itemKey, 'CBAM_PRODUCT')
                                  }
                                >
                                  {I18N.cbamOperationReport.evidenceManagement}
                                </button>
                                <button
                                  type='button'
                                  onClick={() =>
                                    setRecordDetail({
                                      title: productTitle,
                                      monitorFields: productMetadata,
                                      accountingFields: productAccountingFields,
                                      fields: [
                                        [
                                          I18N.cbamOperationReport.productName,
                                          productTitle,
                                        ],
                                        [
                                          I18N.cbamOperationReport.cnCode,
                                          product.cnCode ||
                                            matchingAccountProduct?.cnCode ||
                                            '-',
                                        ],
                                        [
                                          I18N.cbamOperationReport.productType,
                                          productTypeName(product.productType),
                                        ],
                                        [
                                          I18N.cbamOperationReport
                                            .functionalUnit,
                                          product.functionalUnit || unit || '-',
                                        ],
                                        ...process.routes.map(
                                          route =>
                                            [
                                              I18N.template(
                                                I18N.cbamOperationReport
                                                  .productionQuantity,
                                                {
                                                  route: route.routeName || '-',
                                                },
                                              ),
                                              textValue(
                                                route.productionQuantity,
                                              )
                                                ? [
                                                    route.productionQuantity,
                                                    route.unit || routeUnit,
                                                  ]
                                                    .filter(Boolean)
                                                    .join(' ')
                                                : '-',
                                            ] as [string, string],
                                        ),
                                        [
                                          I18N.cbamOperationReport
                                            .externalSalesQuantity,
                                          textValue(
                                            reportItem?.externalSalesQuantity ||
                                              fallback.externalSalesQuantity,
                                          )
                                            ? [
                                                reportItem?.externalSalesQuantity ||
                                                  fallback.externalSalesQuantity,
                                                unit,
                                              ]
                                                .filter(Boolean)
                                                .join(' ')
                                            : '-',
                                        ],
                                        [
                                          I18N.cbamOperationReport
                                            .actualMonitoringPeriod,
                                          reportItem?.monitorStartDate ||
                                          reportItem?.monitorEndDate
                                            ? `${
                                                reportItem?.monitorStartDate ||
                                                '-'
                                              } ~ ${
                                                reportItem?.monitorEndDate ||
                                                '-'
                                              }`
                                            : '-',
                                        ],
                                        ...consumptions.map(
                                          (consumption, index) =>
                                            [
                                              I18N.template(
                                                I18N.cbamOperationReport
                                                  .processConsumption,
                                                {
                                                  process:
                                                    consumption.targetProcessName ||
                                                    String(index + 1),
                                                },
                                              ),
                                              [consumption.quantity, unit]
                                                .filter(Boolean)
                                                .join(' ') || '-',
                                            ] as [string, string],
                                        ),
                                      ],
                                    })
                                  }
                                >
                                  {I18N.cbamOperationReport.viewDetails}
                                </button>
                              </div>
                            </header>
                            <div className={styles.quantityGrid}>
                              {process.routes.map((route, routeIndex) => (
                                <label key={route.itemKey || routeIndex}>
                                  <span className={styles.quantityLabel}>
                                    {I18N.template(
                                      I18N.cbamOperationReport
                                        .productionQuantity,
                                      {
                                        route: route.routeName || '-',
                                      },
                                    )}
                                  </span>
                                  <DecimalInput
                                    value={route.productionQuantity}
                                    disabled={readonly}
                                    {...QUANTITY_INPUT_LIMIT}
                                    addonAfter={routeUnit}
                                    onValueChange={value =>
                                      updateRoutes(
                                        process,
                                        process.routes.map((item, index) =>
                                          index === routeIndex
                                            ? {
                                                ...item,
                                                productionQuantity: value,
                                                unit: routeUnit,
                                              }
                                            : item,
                                        ),
                                      )
                                    }
                                  />
                                </label>
                              ))}
                              <label>
                                <span className={styles.quantityLabel}>
                                  {
                                    I18N.cbamOperationReport
                                      .externalSalesQuantity
                                  }
                                </span>
                                <DecimalInput
                                  value={
                                    reportItem?.externalSalesQuantity ??
                                    fallback.externalSalesQuantity
                                  }
                                  disabled={readonly}
                                  {...QUANTITY_INPUT_LIMIT}
                                  addonAfter={unit}
                                  onValueChange={value => {
                                    updateProductItem(
                                      processKey,
                                      productKey,
                                      {
                                        externalSalesQuantity: value,
                                      },
                                      fallback,
                                    );
                                    updateAccountingSales(process, value);
                                  }}
                                />
                              </label>
                              {consumptions.map(
                                (consumption, consumptionIndex) => (
                                  <label
                                    key={
                                      consumption.itemKey ||
                                      consumption.targetProcessItemKey
                                    }
                                  >
                                    <span className={styles.quantityLabel}>
                                      {I18N.template(
                                        I18N.cbamOperationReport
                                          .processConsumption,
                                        {
                                          process:
                                            consumption.targetProcessName ||
                                            '-',
                                        },
                                      )}
                                    </span>
                                    <DecimalInput
                                      value={consumption.quantity}
                                      disabled={readonly}
                                      {...QUANTITY_INPUT_LIMIT}
                                      addonAfter={unit}
                                      onValueChange={value =>
                                        updateProductItem(
                                          processKey,
                                          productKey,
                                          {
                                            processConsumptions:
                                              consumptions.map((item, index) =>
                                                index === consumptionIndex
                                                  ? {
                                                      ...item,
                                                      quantity: value,
                                                    }
                                                  : item,
                                              ),
                                          },
                                          fallback,
                                        )
                                      }
                                    />
                                  </label>
                                ),
                              )}
                            </div>
                            <label className={styles.monitorPeriod}>
                              <span>
                                {
                                  I18N.cbamOperationReport
                                    .actualMonitoringPeriod
                                }
                              </span>
                              <DatePicker.RangePicker
                                value={periodValue}
                                disabled={readonly}
                                placeholder={['', '']}
                                onChange={dates =>
                                  updateProductItem(
                                    processKey,
                                    productKey,
                                    {
                                      monitorStartDate:
                                        dates?.[0]?.format('YYYY-MM-DD'),
                                      monitorEndDate:
                                        dates?.[1]?.format('YYYY-MM-DD'),
                                    },
                                    fallback,
                                  )
                                }
                              />
                            </label>
                          </article>
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noProductData}
                      />
                    )
                  ) : activeCategory === 'precursor' ? (
                    precursors.length ? (
                      precursors.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:precursor:${index}`;
                        const sourcePrecursor = sourcePrecursors.find(
                          value =>
                            textValue(value.itemKey) ===
                            textValue(item.precursorItemKey),
                        );
                        const accountPrecursor = asArray<JsonObject>(
                          precursorJson.productPrecursors,
                        ).find(
                          value => value.id === item.accountingPrecursorId,
                        );
                        const quantityRows = item.routeQuantities?.length
                          ? item.routeQuantities
                          : [{ itemKey: `${itemKey}:quantity`, quantity: '' }];
                        const defaultOptions = defaultEmissions.filter(
                          option =>
                            option.id !== undefined &&
                            option.defaultCode === item.cnCode,
                        );
                        const selectDefaultEmission = (value: number) => {
                          const selected = defaultOptions.find(
                            option => option.id === value,
                          );
                          updateCategoryItem(
                            'precursorJson',
                            precursorJson,
                            'reportItems',
                            precursorItems,
                            item,
                            {
                              defaultCnId: value,
                              directEmission:
                                selected?.directDefaultValue === undefined
                                  ? ''
                                  : String(selected.directDefaultValue),
                              indirectEmission:
                                selected?.indirectDefaultValue === undefined
                                  ? ''
                                  : String(selected.indirectDefaultValue),
                            },
                          );
                        };
                        const defaultEmissionOptions = defaultOptions.map(
                          option => ({
                            value: String(option.id),
                            label: `${option.directDefaultValue ?? '-'} / ${
                              option.indirectDefaultValue ?? '-'
                            } / ${option.productionRoute || '-'}`,
                            defaultId: option.id,
                          }),
                        );
                        const updateDefaultEmissionValue = (
                          field: 'directEmission' | 'indirectEmission',
                          value: string,
                        ) => {
                          if (!isEditableEmissionValue(value)) return;
                          updateCategoryItem(
                            'precursorJson',
                            precursorJson,
                            'reportItems',
                            precursorItems,
                            item,
                            { [field]: value },
                          );
                        };
                        const fields: [string, string][] = [
                          ...quantityRows.map(
                            row =>
                              [
                                row.routeName
                                  ? I18N.template(
                                      I18N.cbamOperationReport
                                        .precursorRouteQuantity,
                                      { route: row.routeName },
                                    )
                                  : I18N.cbamOperationReport.precursorQuantity,
                                displayWithUnit(row.quantity, 't'),
                              ] as [string, string],
                          ),
                          [
                            I18N.cbamOperationReport.originCountry,
                            countryName(sourcePrecursor?.originCountry),
                          ],
                          [
                            I18N.cbamOperationReport.unitDirectEmission,
                            displayWithUnit(item.directEmission, 'tCO₂e/t'),
                          ],
                          [
                            I18N.cbamOperationReport.unitIndirectEmission,
                            displayWithUnit(item.indirectEmission, 'tCO₂e/t'),
                          ],
                          [
                            I18N.cbamOperationReport.actualMonitoringPeriod,
                            displayPeriod(
                              item.monitorStartDate,
                              item.monitorEndDate,
                            ),
                          ],
                        ];
                        const monitorFields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.productName,
                            displayValue(sourcePrecursor?.precursorName),
                          ],
                          [
                            I18N.cbamOperationReport.cnCode,
                            displayValue(sourcePrecursor?.cnCode),
                          ],
                          [
                            I18N.cbamOperationReport.emissionBasis,
                            sourcePrecursor?.emissionBasis === 'DEFAULT_VALUE'
                              ? I18N.cbamOperationReport.defaultValue
                              : sourcePrecursor?.emissionBasis ===
                                'MEASURED_VALUE'
                              ? I18N.cbamMonitor.measuredValue
                              : '-',
                          ],
                          [
                            I18N.cbamOperationReport.supplierName,
                            displayValue(sourcePrecursor?.supplierName),
                          ],
                          [
                            I18N.cbamOperationReport.sourceFacility,
                            displayValue(sourcePrecursor?.sourceFacility),
                          ],
                          [
                            I18N.cbamOperationReport.originCountry,
                            countryName(sourcePrecursor?.originCountry),
                          ],
                          [
                            I18N.cbamOperationReport.verificationPeriod,
                            displayValue(sourcePrecursor?.verificationPeriod),
                          ],
                          [
                            I18N.cbamOperationReport.embeddedEmission,
                            displayWithUnit(
                              sourcePrecursor?.embeddedEmission,
                              'tCO₂e/t',
                            ),
                          ],
                        ];
                        const accountingFields: [string, string][] | undefined =
                          hasAccountingTask &&
                          item.accountingPrecursorId &&
                          accountPrecursor
                            ? [
                                [
                                  I18N.cbamOperationReport.productName,
                                  displayValue(accountPrecursor.preName),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .purchasedPrecursorCategory,
                                  displayValue(
                                    accountPrecursor.productCategoryName,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.accountingRoute,
                                  displayValue(
                                    accountPrecursor.productRouteNames ||
                                      accountPrecursor.productRoute,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.precursorQuantity,
                                  displayWithUnit(
                                    accountPrecursor.purchaseVolume,
                                    textValue(accountPrecursor.unit) || 't',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.nonCbamConsumption,
                                  displayWithUnit(
                                    accountPrecursor.nonProduct,
                                    textValue(accountPrecursor.unit) || 't',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .useDefaultCalculation,
                                  accountPrecursor.isDefault === undefined
                                    ? '-'
                                    : accountPrecursor.isDefault === 1
                                    ? I18N.cbamOperationReport.yes
                                    : I18N.cbamOperationReport.no,
                                ],
                                [
                                  I18N.cbamOperationReport.unitDirectEmission,
                                  displayWithUnit(
                                    accountPrecursor.outPower,
                                    'tCO₂e/t',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.unitIndirectEmission,
                                  displayWithUnit(
                                    accountPrecursor.inputPower,
                                    'tCO₂e/t',
                                  ),
                                ],
                              ]
                            : undefined;
                        return renderCategoryCard(
                          'precursor',
                          itemKey,
                          index,
                          item.precursorName ||
                            I18N.cbamOperationReport.unnamedProduct,
                          [
                            [
                              I18N.cbamOperationReport.cnCode,
                              displayValue(item.cnCode),
                            ],
                            [
                              I18N.cbamOperationReport.supplierName,
                              displayValue(item.supplierName),
                            ],
                            [
                              I18N.cbamOperationReport.sourceFacility,
                              displayValue(sourcePrecursor?.sourceFacility),
                            ],
                            [
                              I18N.cbamOperationReport.accountingRoute,
                              displayValue(accountPrecursor?.productRoute),
                            ],
                            [
                              I18N.cbamOperationReport.emissionBasis,
                              item.emissionBasis === 'DEFAULT_VALUE'
                                ? I18N.cbamOperationReport.defaultValue
                                : item.emissionBasis === 'MEASURED_VALUE'
                                ? I18N.cbamMonitor.measuredValue
                                : '-',
                            ],
                          ],
                          fields,
                          monitorFields,
                          accountingFields,
                          <>
                            <div className={styles.quantityGrid}>
                              {quantityRows.map((row, rowIndex) =>
                                renderNumberField(
                                  row.routeName
                                    ? I18N.template(
                                        I18N.cbamOperationReport
                                          .precursorRouteQuantity,
                                        { route: row.routeName },
                                      )
                                    : I18N.cbamOperationReport
                                        .precursorQuantity,
                                  row.quantity,
                                  't',
                                  value =>
                                    updateCategoryItem(
                                      'precursorJson',
                                      precursorJson,
                                      'reportItems',
                                      precursorItems,
                                      item,
                                      {
                                        routeQuantities: quantityRows.map(
                                          (current, currentIndex) =>
                                            currentIndex === rowIndex
                                              ? { ...current, quantity: value }
                                              : current,
                                        ),
                                      },
                                    ),
                                  row.itemKey || String(rowIndex),
                                ),
                              )}
                              <label>
                                <span className={styles.quantityLabel}>
                                  {`${I18N.cbamOperationReport.unitDirectEmission} (tCO₂e/t)`}
                                </span>
                                {item.emissionBasis === 'DEFAULT_VALUE' ? (
                                  <AutoComplete
                                    value={item.directEmission}
                                    disabled={readonly}
                                    options={defaultEmissionOptions}
                                    onSearch={value =>
                                      updateDefaultEmissionValue(
                                        'directEmission',
                                        value,
                                      )
                                    }
                                    onSelect={(_value, option) =>
                                      selectDefaultEmission(option.defaultId)
                                    }
                                  >
                                    <Input inputMode='decimal' />
                                  </AutoComplete>
                                ) : (
                                  <DecimalInput
                                    value={item.directEmission}
                                    disabled={readonly}
                                    {...NON_NEGATIVE_SIX_DECIMAL_LIMIT}
                                    onValueChange={value =>
                                      updateCategoryItem(
                                        'precursorJson',
                                        precursorJson,
                                        'reportItems',
                                        precursorItems,
                                        item,
                                        { directEmission: value },
                                      )
                                    }
                                  />
                                )}
                              </label>
                              <label>
                                <span className={styles.quantityLabel}>
                                  {`${I18N.cbamOperationReport.unitIndirectEmission} (tCO₂e/t)`}
                                </span>
                                {item.emissionBasis === 'DEFAULT_VALUE' ? (
                                  <AutoComplete
                                    value={item.indirectEmission}
                                    disabled={readonly}
                                    options={defaultEmissionOptions}
                                    onSearch={value =>
                                      updateDefaultEmissionValue(
                                        'indirectEmission',
                                        value,
                                      )
                                    }
                                    onSelect={(_value, option) =>
                                      selectDefaultEmission(option.defaultId)
                                    }
                                  >
                                    <Input inputMode='decimal' />
                                  </AutoComplete>
                                ) : (
                                  <DecimalInput
                                    value={item.indirectEmission}
                                    disabled={readonly}
                                    {...NON_NEGATIVE_SIX_DECIMAL_LIMIT}
                                    onValueChange={value =>
                                      updateCategoryItem(
                                        'precursorJson',
                                        precursorJson,
                                        'reportItems',
                                        precursorItems,
                                        item,
                                        { indirectEmission: value },
                                      )
                                    }
                                  />
                                )}
                              </label>
                            </div>
                            {renderPeriodField(
                              I18N.cbamOperationReport.actualMonitoringPeriod,
                              item.monitorStartDate,
                              item.monitorEndDate,
                              (start, end) =>
                                updateCategoryItem(
                                  'precursorJson',
                                  precursorJson,
                                  'reportItems',
                                  precursorItems,
                                  item,
                                  {
                                    monitorStartDate: start,
                                    monitorEndDate: end,
                                  },
                                ),
                            )}
                          </>,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : activeCategory === 'direct' ? (
                    emissions.length ? (
                      emissions.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:direct:${index}`;
                        const sourceMethod = sourceMonitorMethods.find(
                          value =>
                            textValue(value.itemKey) ===
                            textValue(item.sourceItemKey),
                        );
                        const accountingDirect = accountingDirectItems.find(
                          value =>
                            value.id === item.id ||
                            (value.productProcessId ===
                              process.accountingProcessId &&
                              value.sourceName === item.sourceName),
                        );
                        const legacyMethod = textValue(item.processMethod);
                        const monitorMethod = textValue(item.monitorMethod);
                        const isPfc =
                          Boolean(item.pfcMethod) ||
                          [
                            'Slope_method',
                            'Overpressure_method',
                            '4',
                            '5',
                          ].includes(legacyMethod);
                        const isMeasurement =
                          ['N2O', 'CO2', '6', '7'].includes(legacyMethod) ||
                          ['measurement_cems', 'MEASUREMENT_CEMS'].includes(
                            monitorMethod,
                          );
                        const isMassBalance =
                          ['Material_Balance', '3'].includes(legacyMethod) ||
                          ['mass_balance', 'MASS_BALANCE'].includes(
                            monitorMethod,
                          );
                        const coefficientOptions =
                          item.activityUnit === 't'
                            ? [
                                { value: 'tCO2/t', label: 'tCO₂/t' },
                                { value: 'tCO2/TJ', label: 'tCO₂/TJ' },
                              ]
                            : item.activityUnit === '1000Nm3'
                            ? [
                                {
                                  value: 'tCO2/1000Nm3',
                                  label: 'tCO₂/1000Nm³',
                                },
                                { value: 'tCO2/TJ', label: 'tCO₂/TJ' },
                              ]
                            : [];
                        const isSlopePfc =
                          ['SLOPE_METHOD', 'Slope_method', '4'].includes(
                            textValue(item.pfcMethod),
                          ) || ['Slope_method', '4'].includes(legacyMethod);
                        const isProcessStandard =
                          ['Process_Emissions', '2'].includes(legacyMethod) ||
                          ['process', 'PROCESS_FLOW'].includes(
                            item.monitorSourceType || '',
                          );
                        const parameterKeys: (keyof OperationDirectEmissionItem)[] =
                          isPfc
                            ? isSlopePfc
                              ? [
                                  'activityData',
                                  'activityUnit',
                                  'lowHeat',
                                  'emissionCoefficient',
                                  'conversionRate',
                                  'oxRate',
                                  'carbon',
                                ]
                              : [
                                  'activityData',
                                  'activityUnit',
                                  'biomassContent',
                                  'carbonFossil',
                                  'carbonBiological',
                                  'oxRate',
                                  'carbon',
                                ]
                            : isMeasurement
                            ? [
                                'biomassContent',
                                'lowHeat',
                                'emissionCoefficient',
                                'conversionRate',
                                'oxRate',
                                'carbon',
                              ]
                            : isMassBalance
                            ? [
                                'activityData',
                                'activityUnit',
                                'lowHeat',
                                'lowHeatUnit',
                                'carbon',
                                'carbonUnit',
                                'biomassContent',
                                'biomassContentUnit',
                              ]
                            : [
                                'activityData',
                                'activityUnit',
                                'lowHeat',
                                'lowHeatUnit',
                                'emissionCoefficient',
                                'emissionCoefficientUnit',
                                ...(isProcessStandard
                                  ? [
                                      'conversionRate' as const,
                                      'conversionRateUnit' as const,
                                    ]
                                  : ['oxRate' as const]),
                                'biomassContent',
                                'biomassContentUnit',
                              ];
                        const formParameterKeys = parameterKeys.filter(
                          key =>
                            !(isPfc && key === 'activityUnit') &&
                            ![
                              'lowHeatUnit',
                              'biomassContentUnit',
                              'conversionRateUnit',
                              'carbonUnit',
                            ].includes(key),
                        );
                        const optionalKeys = new Set<
                          keyof OperationDirectEmissionItem
                        >(
                          isPfc
                            ? ['carbon']
                            : isMeasurement
                            ? ['oxRate', 'carbon']
                            : ['lowHeat', 'biomassContent'],
                        );
                        const parameterLabels: Partial<
                          Record<keyof OperationDirectEmissionItem, string>
                        > = {
                          activityData: I18N.cbamOperationReport.activityData,
                          activityUnit: I18N.cbamOperationReport.activityUnit,
                          lowHeat: isPfc
                            ? I18N.cbam.theAnodicEffect2
                            : isMeasurement
                            ? I18N.cbam.averagePerHour
                            : I18N.cbamOperationReport.lowHeat,
                          lowHeatUnit: I18N.cbamOperationReport.lowHeatUnit,
                          emissionCoefficient: isPfc
                            ? I18N.cbam.theAnodicEffect
                            : isMeasurement
                            ? I18N.cbam.operateWithinTheCycle
                            : I18N.cbamOperationReport.emissionCoefficient,
                          emissionCoefficientUnit:
                            I18N.cbamOperationReport.emissionCoefficientUnit,
                          oxRate: isPfc
                            ? I18N.cbam.carbonHexafluoride
                            : isMeasurement
                            ? I18N.cbam.fossilFuelsContain
                            : I18N.cbamOperationReport.oxidationRate,
                          conversionRate: isPfc
                            ? I18N.cbam.slopeEmissionSystem
                            : isMeasurement
                            ? I18N.cbam.averageSmokeFlow
                            : I18N.cbamOperationReport.conversionRate,
                          conversionRateUnit:
                            I18N.cbam.conversionCoefficientSheet,
                          carbon: isPfc
                            ? I18N.cbam.collectUnorganizedData
                            : isMeasurement
                            ? I18N.cbam.biomassEnergy
                            : I18N.cbamOperationReport.carbonContent,
                          carbonUnit: I18N.cbam.carbonContentUnit,
                          biomassContent: isPfc
                            ? I18N.cbam.theAnodeEffectHasPassed2
                            : I18N.cbamOperationReport.biomassContent,
                          biomassContentUnit:
                            I18N.cbamOperationReport.biomassContentUnit,
                          carbonFossil: I18N.cbam.theAnodeEffectHasPassed,
                          carbonBiological: I18N.cbam.overvoltageCoefficient,
                        };
                        const metadata: [string, string][] = [
                          [
                            I18N.cbamOperationReport.emissionType,
                            enumDisplayValue(
                              item.monitorSourceType ||
                                item.sourceType ||
                                (isPfc ? 'PFC' : ''),
                              directSourceTypeLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.method,
                            enumDisplayValue(
                              item.monitorMethod ||
                                item.processMethod ||
                                item.pfcMethod,
                              directMethodLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.greenhouseGasType,
                            displayValue(item.greenhouseGasType),
                          ],
                          [
                            I18N.cbamOperationReport.dataSource,
                            displayValue(item.dataSource),
                          ],
                          [
                            I18N.cbamOperationReport.measurementEquipment,
                            displayValue(sourceMethod?.equipment),
                          ],
                          [
                            I18N.cbamOperationReport.equipmentLocation,
                            displayValue(sourceMethod?.location),
                          ],
                          [
                            I18N.cbamOperationReport.collectionFrequency,
                            enumDisplayValue(
                              sourceMethod?.frequency,
                              directFrequencyLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.uncertainty,
                            displayValue(sourceMethod?.uncertainty),
                          ],
                          [
                            I18N.cbamOperationReport.calibrationMethod,
                            displayValue(sourceMethod?.calibration),
                          ],
                        ];
                        const fields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.applicablePeriod,
                            displayPeriod(
                              item.applicableStartDate,
                              item.applicableEndDate,
                            ),
                          ],
                          ...parameterKeys.map(
                            key =>
                              [
                                parameterLabels[key] || String(key),
                                displayValue(item[key]),
                              ] as [string, string],
                          ),
                        ];
                        const monitorFields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.sourceName,
                            displayValue(
                              sourceMethod?.sourceFlowName ||
                                sourceMethod?.technology,
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.emissionType,
                            enumDisplayValue(
                              sourceMethod?.sourceType ||
                                (sourceMethod?.technology ? 'PFC' : ''),
                              directSourceTypeLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.greenhouseGasType,
                            displayValue(
                              sourceMethod?.ghgType ||
                                (sourceMethod?.technology
                                  ? 'PFC（CF₄/C₂F₆）'
                                  : ''),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.method,
                            enumDisplayValue(
                              sourceMethod?.monitorMethod ||
                                sourceMethod?.method,
                              directMethodLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.dataSource,
                            displayValue(sourceMethod?.dataSource),
                          ],
                          [
                            I18N.cbamOperationReport.measurementEquipment,
                            displayValue(sourceMethod?.equipment),
                          ],
                          [
                            I18N.cbamOperationReport.equipmentLocation,
                            displayValue(sourceMethod?.location),
                          ],
                          [
                            I18N.cbamOperationReport.collectionFrequency,
                            enumDisplayValue(
                              sourceMethod?.frequency,
                              directFrequencyLabels(),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.uncertainty,
                            displayValue(sourceMethod?.uncertainty),
                          ],
                          [
                            I18N.cbamOperationReport.calibrationMethod,
                            displayValue(sourceMethod?.calibration),
                          ],
                          [
                            I18N.cbamOperationReport.missingDataMethod,
                            displayValue(sourceMethod?.missingDataMethod),
                          ],
                          [
                            I18N.cbamOperationReport.calculationFormula,
                            displayValue(sourceMethod?.formulaCode),
                          ],
                        ];
                        const accountingFields: [string, string][] | undefined =
                          hasAccountingTask && accountingDirect
                            ? [
                                [
                                  I18N.cbamOperationReport.sourceName,
                                  displayValue(accountingDirect.sourceName),
                                ],
                                [
                                  I18N.cbamOperationReport.emissionType,
                                  enumDisplayValue(
                                    accountingDirect.sourceType,
                                    directSourceTypeLabels(),
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.greenhouseGasType,
                                  displayValue(
                                    accountingDirect.greenhouseGasType,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.method,
                                  enumDisplayValue(
                                    accountingDirect.processMethod,
                                    directMethodLabels(),
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.dataSource,
                                  displayValue(accountingDirect.dataSource),
                                ],
                                ...parameterKeys.map(
                                  key =>
                                    [
                                      parameterLabels[key] || String(key),
                                      displayValue(accountingDirect[key]),
                                    ] as [string, string],
                                ),
                              ]
                            : undefined;
                        return renderCategoryCard(
                          'direct',
                          itemKey,
                          index,
                          item.sourceName ||
                            I18N.cbamOperationReport.directEmissions,
                          metadata,
                          fields,
                          monitorFields,
                          accountingFields,
                          <>
                            {renderPeriodField(
                              I18N.cbamOperationReport.applicablePeriod,
                              item.applicableStartDate,
                              item.applicableEndDate,
                              (start, end) =>
                                updateCategoryItem(
                                  'directEmissionJson',
                                  directJson,
                                  'items',
                                  directItems,
                                  item,
                                  {
                                    applicableStartDate: start,
                                    applicableEndDate: end,
                                  },
                                ),
                            )}
                            {parameterKeys.length ? (
                              <div className={styles.parameterSection}>
                                <h4>
                                  {
                                    I18N.cbamOperationReport
                                      .calculationParameters
                                  }
                                </h4>
                                <div className={styles.quantityGrid}>
                                  {formParameterKeys.map(key => {
                                    if (
                                      key === 'activityUnit' ||
                                      key === 'emissionCoefficientUnit'
                                    )
                                      return (
                                        <label key={key}>
                                          <span
                                            className={styles.quantityLabel}
                                          >
                                            {parameterLabels[key]}
                                          </span>
                                          <Select
                                            value={
                                              textValue(item[key]) || undefined
                                            }
                                            disabled={readonly}
                                            options={
                                              key === 'activityUnit'
                                                ? [
                                                    {
                                                      value: '1000Nm3',
                                                      label: '1000Nm³',
                                                    },
                                                    { value: 't', label: 't' },
                                                  ]
                                                : coefficientOptions
                                            }
                                            onChange={value => {
                                              const patch =
                                                key === 'activityUnit'
                                                  ? {
                                                      activityUnit: value,
                                                      lowHeatUnit: `GJ/${value}`,
                                                      carbonUnit: `tC/${value}`,
                                                      biomassContentUnit: '%',
                                                      conversionRateUnit: '%',
                                                      emissionCoefficientUnit: [
                                                        value === 't'
                                                          ? 'tCO2/t'
                                                          : 'tCO2/1000Nm3',
                                                        'tCO2/TJ',
                                                      ].includes(
                                                        item.emissionCoefficientUnit ||
                                                          '',
                                                      )
                                                        ? item.emissionCoefficientUnit
                                                        : undefined,
                                                    }
                                                  : {
                                                      emissionCoefficientUnit:
                                                        value,
                                                    };
                                              updateCategoryItem(
                                                'directEmissionJson',
                                                directJson,
                                                'items',
                                                directItems,
                                                item,
                                                patch,
                                              );
                                            }}
                                          />
                                        </label>
                                      );
                                    const rawLabel =
                                      parameterLabels[key] || String(key);
                                    const unitStart =
                                      isPfc || isMeasurement
                                        ? rawLabel.search(/[（(]/)
                                        : -1;
                                    const label =
                                      unitStart < 0
                                        ? rawLabel
                                        : rawLabel.slice(0, unitStart).trim();
                                    const labelUnitText =
                                      unitStart < 0
                                        ? ''
                                        : rawLabel.slice(unitStart).trim();
                                    const labelUnit =
                                      /^[（(][^()（）]+[）)]$/.test(
                                        labelUnitText,
                                      )
                                        ? labelUnitText.slice(1, -1)
                                        : labelUnitText;
                                    const unit = isPfc
                                      ? key === 'activityData'
                                        ? 't'
                                        : labelUnit
                                      : isMeasurement
                                      ? key === 'biomassContent'
                                        ? '%'
                                        : labelUnit
                                      : key === 'lowHeat'
                                      ? textValue(
                                          item.activityUnit
                                            ? `GJ/${item.activityUnit}`
                                            : item.lowHeatUnit,
                                        )
                                      : key === 'carbon'
                                      ? textValue(
                                          item.activityUnit
                                            ? `tC/${item.activityUnit}`
                                            : item.carbonUnit,
                                        )
                                      : [
                                          'oxRate',
                                          'biomassContent',
                                          'conversionRate',
                                        ].includes(key)
                                      ? '%'
                                      : '';
                                    return renderNumberField(
                                      label,
                                      textValue(item[key]),
                                      unit.replace(/Nm3/g, 'Nm³') || undefined,
                                      value =>
                                        updateCategoryItem(
                                          'directEmissionJson',
                                          directJson,
                                          'items',
                                          directItems,
                                          item,
                                          {
                                            [key]: value,
                                            ...(isPfc
                                              ? { activityUnit: 't' }
                                              : {}),
                                          },
                                        ),
                                      key,
                                      !optionalKeys.has(key),
                                      directInputLimit(
                                        key,
                                        isPfc,
                                        isMeasurement,
                                      ),
                                    );
                                  })}
                                </div>
                              </div>
                            ) : null}
                          </>,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : activeCategory === 'nonCbam' ? (
                    nonCbamProducts.length ? (
                      nonCbamProducts.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:nonCbam:${index}`;
                        const sourceGoods = asArray<JsonObject>(
                          sourceNonCbamJson.goods,
                        ).find(
                          (goods, goodsIndex) =>
                            textValue(
                              goods.itemKey || `non-cbam:${goodsIndex}`,
                            ) === textValue(item.sourceItemKey || item.itemKey),
                        );
                        const metadata: [string, string][] = [
                          [
                            I18N.cbamOperationReport.plannedAllocationMethod,
                            displayValue(item.plannedAllocationMethod),
                          ],
                          [
                            I18N.cbamOperationReport.plannedAllocationRate,
                            displayValue(item.plannedAllocationRate),
                          ],
                        ];
                        const fields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.routeProductionQuantity,
                            displayWithUnit(item.productionQuantity, 't'),
                          ],
                          [
                            I18N.cbamOperationReport.allocationMethod,
                            displayValue(item.allocationMethod),
                          ],
                          [
                            I18N.cbamOperationReport.allocationRate,
                            displayWithUnit(item.allocationRate, '%'),
                          ],
                        ];
                        return renderCategoryCard(
                          'nonCbam',
                          itemKey,
                          index,
                          item.goodsName ||
                            I18N.cbamOperationReport.nonCbamProducts,
                          metadata,
                          fields,
                          [
                            [
                              I18N.cbamOperationReport.productName,
                              displayValue(sourceGoods?.goodsName),
                            ],
                            [
                              I18N.cbamOperationReport.plannedAllocationMethod,
                              displayValue(sourceGoods?.allocationMethod),
                            ],
                            [
                              I18N.cbamOperationReport.plannedAllocationRate,
                              displayValue(sourceGoods?.allocationRate),
                            ],
                          ],
                          undefined,
                          <div className={styles.quantityGrid}>
                            {renderNumberField(
                              I18N.cbamOperationReport.routeProductionQuantity,
                              item.productionQuantity,
                              't',
                              value =>
                                updateCategoryItem(
                                  'nonCbamProductJson',
                                  nonCbamJson,
                                  'items',
                                  nonCbamItems,
                                  item,
                                  { productionQuantity: value },
                                ),
                              undefined,
                              true,
                              NON_CBAM_QUANTITY_LIMIT,
                            )}
                            <label>
                              <span className={styles.quantityLabel}>
                                {I18N.cbamOperationReport.allocationMethod}
                              </span>
                              <Input
                                value={item.allocationMethod}
                                disabled={readonly}
                                onChange={event =>
                                  updateCategoryItem(
                                    'nonCbamProductJson',
                                    nonCbamJson,
                                    'items',
                                    nonCbamItems,
                                    item,
                                    { allocationMethod: event.target.value },
                                  )
                                }
                              />
                            </label>
                            {renderNumberField(
                              I18N.cbamOperationReport.allocationRate,
                              item.allocationRate,
                              '%',
                              value =>
                                updateCategoryItem(
                                  'nonCbamProductJson',
                                  nonCbamJson,
                                  'items',
                                  nonCbamItems,
                                  item,
                                  { allocationRate: value },
                                ),
                              undefined,
                              true,
                              PERCENT_TWO_DECIMAL_LIMIT,
                            )}
                          </div>,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : activeCategory === 'electricity' ? (
                    electricitySources.length ? (
                      electricitySources.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:electricity:${index}`;
                        const sourceGenerator = asArray<JsonObject>(
                          sourceFacilityElectricity.generators,
                        ).find(
                          (generator, generatorIndex) =>
                            textValue(
                              generator.itemKey ||
                                `generator:${generatorIndex}`,
                            ) === textValue(item.sourceItemKey || item.itemKey),
                        );
                        const accountElectricity =
                          accountingElectricityItems.find(
                            value =>
                              value.id === item.id ||
                              value.productProcessId ===
                                process.accountingProcessId,
                          );
                        const processAttributions =
                          accountingAttributions.filter(
                            value =>
                              textValue(value.productProcessId) ===
                              textValue(process.accountingProcessId),
                          );
                        const electricityUseAttribution =
                          processAttributions.find(value =>
                            ['4', 'EleUser'].includes(
                              textValue(value.emissionElement),
                            ),
                          );
                        const electricityFactorAttribution =
                          processAttributions.find(value =>
                            ['5', 'EleOut'].includes(
                              textValue(value.emissionElement),
                            ),
                          );
                        const metadata: [string, string][] = [];
                        const fields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.electricitySource,
                            displayValue(item.electricitySource),
                          ],
                          [
                            I18N.cbamOperationReport.powerFacility,
                            displayValue(item.powerFacility),
                          ],
                          [
                            I18N.cbamOperationReport.usePeriod,
                            displayPeriod(item.useStartDate, item.useEndDate),
                          ],
                          [
                            I18N.cbamOperationReport.electricityUse,
                            displayWithUnit(item.electricityConsumption, 'MWh'),
                          ],
                          [
                            I18N.cbamOperationReport.emissionFactor,
                            displayWithUnit(item.emissionFactor, 'tCO₂e/MWh'),
                          ],
                        ];
                        const cardTitle =
                          item.electricitySource === 'GRID'
                            ? I18N.cbamOperationReport.gridElectricity
                            : item.electricitySource ||
                              I18N.cbamOperationReport.electricityConsumption;
                        return renderCategoryCard(
                          'electricity',
                          itemKey,
                          index,
                          cardTitle,
                          metadata,
                          fields,
                          [
                            [
                              I18N.cbamOperationReport.electricitySource,
                              displayValue(sourceGenerator?.generationMode),
                            ],
                            [
                              I18N.cbamMonitor.energyProperty,
                              displayValue(sourceGenerator?.energyProperty),
                            ],
                            [
                              I18N.cbamMonitor.includedInOutputBoundary,
                              sourceGenerator?.includedInOutputBoundary ===
                              undefined
                                ? '-'
                                : sourceGenerator.includedInOutputBoundary
                                ? I18N.cbamOperationReport.yes
                                : I18N.cbamOperationReport.no,
                            ],
                            [
                              I18N.cbamMonitor.meteringAllocationMethod,
                              displayValue(
                                sourceGenerator?.meteringAllocationMethod,
                              ),
                            ],
                          ],
                          hasAccountingTask &&
                            (accountElectricity ||
                              electricityUseAttribution ||
                              electricityFactorAttribution)
                            ? [
                                [
                                  I18N.cbamOperationReport.factorSourceMode,
                                  displayValue(
                                    electricityFactorAttribution?.eleChoose,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.factorSource,
                                  displayValue(
                                    electricityFactorAttribution?.emissionSource ||
                                      electricityFactorAttribution?.eleSource,
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.electricityUse,
                                  displayWithUnit(
                                    accountElectricity?.electricityConsumption ||
                                      electricityUseAttribution?.inputPower,
                                    'MWh',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .electricityEmissionFactor,
                                  displayWithUnit(
                                    accountElectricity?.emissionFactor ||
                                      electricityFactorAttribution?.outFactor,
                                    'tCO₂e/MWh',
                                  ),
                                ],
                              ]
                            : undefined,
                          <div
                            className={`${styles.quantityGrid} ${styles.electricityGrid}`}
                          >
                            <label>
                              <span className={styles.optionalQuantityLabel}>
                                {I18N.cbamOperationReport.electricitySource}
                              </span>
                              <Select
                                value={item.electricitySource}
                                disabled={readonly}
                                options={electricityOptions}
                                onChange={value =>
                                  updateCategoryItem(
                                    'electricityJson',
                                    electricityJson,
                                    'items',
                                    electricityItems,
                                    item,
                                    { electricitySource: value },
                                  )
                                }
                              />
                            </label>
                            <div className={styles.electricityPeriod}>
                              {renderPeriodField(
                                I18N.cbamOperationReport.usePeriod,
                                item.useStartDate,
                                item.useEndDate,
                                (start, end) =>
                                  updateCategoryItem(
                                    'electricityJson',
                                    electricityJson,
                                    'items',
                                    electricityItems,
                                    item,
                                    { useStartDate: start, useEndDate: end },
                                  ),
                              )}
                            </div>
                            {renderNumberField(
                              I18N.cbamOperationReport.electricityUse,
                              item.electricityConsumption,
                              'MWh',
                              value =>
                                updateCategoryItem(
                                  'electricityJson',
                                  electricityJson,
                                  'items',
                                  electricityItems,
                                  item,
                                  { electricityConsumption: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                            {renderNumberField(
                              I18N.cbamOperationReport
                                .electricityEmissionFactor,
                              item.emissionFactor,
                              'tCO₂e/MWh',
                              value =>
                                updateCategoryItem(
                                  'electricityJson',
                                  electricityJson,
                                  'items',
                                  electricityItems,
                                  item,
                                  { emissionFactor: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                            <label className={styles.electricityFacility}>
                              <span className={styles.optionalQuantityLabel}>
                                {I18N.cbamOperationReport.powerFacility}
                              </span>
                              <Input
                                value={item.powerFacility}
                                disabled={
                                  readonly || item.electricitySource !== 'GRID'
                                }
                                maxLength={40}
                                onChange={event =>
                                  updateCategoryItem(
                                    'electricityJson',
                                    electricityJson,
                                    'items',
                                    electricityItems,
                                    item,
                                    { powerFacility: event.target.value },
                                  )
                                }
                              />
                            </label>
                          </div>,
                          !readonly && !item.sourceItemKey && !item.id ? (
                            <button
                              type='button'
                              className={styles.electricityDeleteAction}
                              onClick={() =>
                                showMonitorDeleteConfirm({
                                  title:
                                    I18N.cbamOperationReport
                                      .deleteElectricitySource,
                                  content: I18N.template(
                                    I18N.cbamOperationReport
                                      .confirmDeleteElectricitySource,
                                    { name: cardTitle },
                                  ),
                                  onOk: () => {
                                    form.setFieldValue(
                                      'electricityJson',
                                      JSON.stringify(
                                        {
                                          ...electricityJson,
                                          items: electricityItems.filter(
                                            current => current !== item,
                                          ),
                                        },
                                        null,
                                        2,
                                      ),
                                    );
                                    onDirty();
                                  },
                                })
                              }
                            >
                              {I18N.cbamOperationReport.delete}
                            </button>
                          ) : null,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : activeCategory === 'heat' ? (
                    heatFlows.length ? (
                      heatFlows.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:heat:${index}`;
                        const sourceFlow = sourceHeatFlows.find(
                          (flow, sourceIndex) =>
                            textValue(
                              flow.itemKey || `heat-flow:${sourceIndex}`,
                            ) === textValue(item.sourceItemKey || item.itemKey),
                        );
                        const accountingHeat = accountingHeatItems.find(
                          value =>
                            textValue(value.id) === textValue(item.id) ||
                            textValue(value.productProcessId) ===
                              textValue(process.accountingProcessId),
                        );
                        const medium = textValue(
                          sourceFlow ? sourceFlow.medium : item.medium,
                        );
                        const normalizedMedium = medium
                          .replace(/[-\s]/g, '_')
                          .toUpperCase();
                        const mediumLabel =
                          normalizedMedium === 'STEAM' || medium === '蒸汽'
                            ? I18N.cbamMonitor.steam
                            : normalizedMedium === 'HOT_WATER' ||
                              medium === '热水'
                            ? I18N.cbamMonitor.hotWater
                            : normalizedMedium === 'OTHER' || medium === '其它'
                            ? I18N.cbamMonitor.other
                            : medium;
                        const direction = textValue(
                          sourceFlow ? sourceFlow.direction : item.direction,
                        );
                        const directionLabel =
                          direction === 'INPUT'
                            ? I18N.cbamMonitor.input
                            : direction === 'OUTPUT'
                            ? I18N.cbamMonitor.output
                            : direction;
                        const metadata: [string, string][] = [
                          [
                            I18N.cbamOperationReport.counterpartyFacility,
                            displayValue(
                              sourceFlow
                                ? sourceFlow.counterparty
                                : item.counterpartyFacility,
                            ),
                          ],
                          [
                            I18N.cbamMonitor.emissionAllocationMethod,
                            displayValue(
                              sourceFlow
                                ? sourceFlow.allocationMethod
                                : item.allocationMethod,
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.meteringPoint,
                            displayValue(
                              sourceFlow
                                ? sourceFlow.meteringPoint
                                : item.meteringPoint,
                            ),
                          ],
                        ];
                        const fields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.heatAmount,
                            displayWithUnit(item.heatAmount, 'TJ'),
                          ],
                          [
                            I18N.cbamOperationReport.emissionFactor,
                            displayWithUnit(item.emissionFactor, 'tCO₂e/TJ'),
                          ],
                        ];
                        return renderCategoryCard(
                          'heat',
                          itemKey,
                          index,
                          [mediumLabel, directionLabel]
                            .filter(Boolean)
                            .join(' / ') || I18N.cbamOperationReport.heatFlows,
                          metadata,
                          fields,
                          [
                            [
                              I18N.cbamMonitor.medium,
                              displayValue(mediumLabel),
                            ],
                            [
                              I18N.cbamMonitor.direction,
                              displayValue(directionLabel),
                            ],
                            [
                              I18N.cbamOperationReport.counterpartyFacility,
                              displayValue(sourceFlow?.counterparty),
                            ],
                            [
                              I18N.cbamMonitor.emissionAllocationMethod,
                              displayValue(sourceFlow?.allocationMethod),
                            ],
                            [
                              I18N.cbamOperationReport.meteringPoint,
                              displayValue(sourceFlow?.meteringPoint),
                            ],
                          ],
                          hasAccountingTask && accountingHeat
                            ? [
                                [
                                  I18N.cbamOperationReport.heatInput,
                                  displayWithUnit(accountingHeat.fuelIn, 'TJ'),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .inputHeatEmissionFactor,
                                  displayWithUnit(
                                    accountingHeat.inputFactor,
                                    'tCO₂e/TJ',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.heatOutput,
                                  displayWithUnit(accountingHeat.hotOut, 'TJ'),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .outputHeatEmissionFactor,
                                  displayWithUnit(
                                    accountingHeat.outFactor,
                                    'tCO₂e/TJ',
                                  ),
                                ],
                              ]
                            : undefined,
                          <div className={styles.quantityGrid}>
                            {renderNumberField(
                              I18N.cbamOperationReport.heatAmount,
                              item.heatAmount,
                              'TJ',
                              value =>
                                updateCategoryItem(
                                  'heatFlowJson',
                                  heatJson,
                                  'items',
                                  heatItems,
                                  item,
                                  { heatAmount: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                            {renderNumberField(
                              I18N.cbamOperationReport.emissionFactor,
                              item.emissionFactor,
                              'tCO₂e/TJ',
                              value =>
                                updateCategoryItem(
                                  'heatFlowJson',
                                  heatJson,
                                  'items',
                                  heatItems,
                                  item,
                                  { emissionFactor: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                          </div>,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : activeCategory === 'wasteGas' ? (
                    wasteGases.length ? (
                      wasteGases.map((item, index) => {
                        const itemKey =
                          item.itemKey || `${processKey}:wasteGas:${index}`;
                        const sourceFlow = sourceWasteGasFlows.find(
                          (flow, sourceIndex) =>
                            textValue(
                              flow.itemKey || `waste-gas:${sourceIndex}`,
                            ) === textValue(item.sourceItemKey || item.itemKey),
                        );
                        const accountingWasteGas = accountingAttributions.find(
                          value =>
                            textValue(value.productProcessId) ===
                              textValue(process.accountingProcessId) &&
                            ['3', 'Waste'].includes(
                              textValue(value.emissionElement),
                            ),
                        );
                        const modeLabels: Record<string, string> = {
                          PRODUCE: I18N.cbamMonitor.produce,
                          USE: I18N.cbamMonitor.use,
                          INPUT: I18N.cbamMonitor.input,
                          OUTPUT: I18N.cbamMonitor.output,
                        };
                        const modes = sourceFlow
                          ? sourceFlow.flowModes || []
                          : textValue(item.method)
                              .replace(/^\[|\]$/g, '')
                              .split(',')
                              .map(value => value.trim())
                              .filter(Boolean);
                        const metadata: [string, string][] = [
                          [
                            I18N.cbamOperationReport.wasteGasMethod,
                            displayValue(
                              modes
                                .map(value => modeLabels[value] || value)
                                .join('、'),
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.counterpartyFacility,
                            displayValue(
                              sourceFlow
                                ? sourceFlow.counterparty
                                : item.counterpartyFacility,
                            ),
                          ],
                          [
                            I18N.cbamOperationReport.monitoringAllocationMethod,
                            displayValue(
                              sourceFlow
                                ? sourceFlow.method
                                : item.monitoringAllocationMethod,
                            ),
                          ],
                        ];
                        const fields: [string, string][] = [
                          [
                            I18N.cbamOperationReport.wasteGasAmount,
                            displayWithUnit(item.wasteGasAmount, 'TJ'),
                          ],
                          [
                            I18N.cbamOperationReport.emissionFactor,
                            displayWithUnit(item.emissionFactor, 'tCO₂e/TJ'),
                          ],
                        ];
                        return renderCategoryCard(
                          'wasteGas',
                          itemKey,
                          index,
                          textValue(
                            sourceFlow
                              ? sourceFlow.wasteGasType
                              : item.wasteGasType,
                          ) || I18N.cbamOperationReport.wasteGas,
                          metadata,
                          fields,
                          [
                            [
                              I18N.cbamOperationReport.productName,
                              displayValue(sourceFlow?.wasteGasType),
                            ],
                            [
                              I18N.cbamOperationReport.wasteGasMethod,
                              displayValue(
                                modes
                                  .map(value => modeLabels[value] || value)
                                  .join('、'),
                              ),
                            ],
                            [
                              I18N.cbamOperationReport.counterpartyFacility,
                              displayValue(sourceFlow?.counterparty),
                            ],
                            [
                              I18N.cbamOperationReport
                                .monitoringAllocationMethod,
                              displayValue(sourceFlow?.method),
                            ],
                          ],
                          hasAccountingTask && accountingWasteGas
                            ? [
                                [
                                  I18N.cbamOperationReport.wasteGasInput,
                                  displayWithUnit(
                                    accountingWasteGas.inputPower,
                                    'TJ',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .inputWasteGasEmissionFactor,
                                  displayWithUnit(
                                    accountingWasteGas.inputFactor,
                                    'tCO₂e/TJ',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport.wasteGasRecovery,
                                  displayWithUnit(
                                    accountingWasteGas.outPower,
                                    'TJ',
                                  ),
                                ],
                                [
                                  I18N.cbamOperationReport
                                    .recoveredWasteGasEmissionFactor,
                                  displayWithUnit(
                                    accountingWasteGas.outFactor,
                                    'tCO₂e/TJ',
                                  ),
                                ],
                              ]
                            : undefined,
                          <div className={styles.quantityGrid}>
                            {renderNumberField(
                              I18N.cbamOperationReport.wasteGasAmount,
                              item.wasteGasAmount,
                              'TJ',
                              value =>
                                updateCategoryItem(
                                  'wasteGasJson',
                                  wasteGasJson,
                                  'items',
                                  wasteGasItems,
                                  item,
                                  { wasteGasAmount: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                            {renderNumberField(
                              I18N.cbamOperationReport.emissionFactor,
                              item.emissionFactor,
                              'tCO₂e/TJ',
                              value =>
                                updateCategoryItem(
                                  'wasteGasJson',
                                  wasteGasJson,
                                  'items',
                                  wasteGasItems,
                                  item,
                                  { emissionFactor: value },
                                ),
                              undefined,
                              true,
                              NON_NEGATIVE_SIX_DECIMAL_LIMIT,
                            )}
                          </div>,
                        );
                      })
                    ) : (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={I18N.cbamOperationReport.noCategoryData}
                      />
                    )
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={I18N.cbamOperationReport.noCategoryData}
                    />
                  )}
                </div>
              </section>
            );
          })
        ) : (
          <div className={styles.noProcess}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                sourcePlan
                  ? I18N.cbamOperationReport.noProcessData
                  : I18N.cbamOperationReport.selectMonitorPlanFirst
              }
            />
          </div>
        )}
      </div>

      <Drawer
        closable={false}
        destroyOnClose
        title={
          <CbamDrawerTitle>
            {I18N.cbamOperationReport.editOnsiteProcessBoundary}
          </CbamDrawerTitle>
        }
        width={724}
        open={boundaryDrawerOpen}
        rootClassName={styles.boundaryDrawer}
        extra={<CbamDrawerClose onClick={() => setBoundaryDrawerOpen(false)} />}
        onClose={() => setBoundaryDrawerOpen(false)}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={() => setBoundaryDrawerOpen(false)}>
              {I18N.cbamOperationReport.cancel}
            </Button>
            <Button type='primary' onClick={saveBoundary}>
              {I18N.cbamOperationReport.save}
            </Button>
          </div>
        }
      >
        <Form form={boundaryForm} layout='vertical'>
          <Form.Item
            name='processDescription'
            label={I18N.cbamOperationReport.onsiteProcessDescription}
            rules={[
              {
                required: true,
                max: 1000,
                message: I18N.template(I18N.cbamOperationReport.requiredField, {
                  field: I18N.cbamOperationReport.onsiteProcessDescription,
                }),
              },
            ]}
          >
            <Input.TextArea
              className={styles.drawerTextarea}
              maxLength={1000}
            />
          </Form.Item>
          <Form.Item
            name='boundaryDescription'
            label={I18N.cbamOperationReport.boundaryCompletenessDescription}
            rules={[
              {
                required: true,
                max: 1000,
                message: I18N.template(I18N.cbamOperationReport.requiredField, {
                  field:
                    I18N.cbamOperationReport.boundaryCompletenessDescription,
                }),
              },
            ]}
          >
            <Input.TextArea
              className={styles.drawerTextarea}
              maxLength={1000}
            />
          </Form.Item>
          <Form.Item
            name='files'
            label={I18N.cbamOperationReport.systemBoundaryDiagram}
          >
            <FileObjectUpload
              maxCount={5}
              maxSize={20}
              variant='boundary'
              resolveUrl={url => resolveOperationFileUrl(operationId, url)}
            />
          </Form.Item>
        </Form>
      </Drawer>

      <Drawer
        closable={false}
        destroyOnClose
        rootClassName={styles.processDetailDrawer}
        title={
          <CbamDrawerTitle>
            {I18N.template(I18N.cbamOperationReport.processDetailTitle, {
              name:
                detailProcess?.processName ||
                I18N.cbamOperationReport.unnamedProcess,
            })}
          </CbamDrawerTitle>
        }
        width={604}
        open={Boolean(detailProcessKey)}
        onClose={closeProcessDetail}
        extra={<CbamDrawerClose onClick={closeProcessDetail} />}
        footer={
          <div className={styles.drawerFooter}>
            <Button onClick={closeProcessDetail}>
              {I18N.cbamOperationReport.cancel}
            </Button>
            <Button type='primary' onClick={saveProcessDetail}>
              {I18N.cbamOperationReport.confirm}
            </Button>
          </div>
        }
      >
        <Tabs
          className={styles.detailTabs}
          activeKey={detailTab}
          onChange={key => setDetailTab(key as ProcessDetailTabKey)}
          items={[
            {
              key: 'current',
              label: I18N.cbamOperationReport.currentReport,
              children: (
                <Form form={processDetailForm} layout='vertical'>
                  <Form.List name='routes'>
                    {(fields, { add, remove }) => (
                      <Form.Item
                        required
                        label={I18N.cbamOperationReport.productionRouteLabel}
                      >
                        <div className={styles.detailRouteList}>
                          {fields.map((field, index) => (
                            <div
                              className={styles.detailRouteRow}
                              key={field.key}
                            >
                              <Form.Item
                                name={[field.name, 'routeName']}
                                style={{ marginBottom: 0 }}
                                rules={[
                                  {
                                    required: true,
                                    message: I18N.template(
                                      I18N.cbamOperationReport.requiredField,
                                      {
                                        field:
                                          I18N.cbamOperationReport
                                            .productionRouteLabel,
                                      },
                                    ),
                                  },
                                ]}
                              >
                                <Input maxLength={40} disabled={readonly} />
                              </Form.Item>
                              {!readonly &&
                                (index === 0 ? (
                                  <Button
                                    aria-label={
                                      I18N.cbamOperationReport
                                        .addProductionRoute
                                    }
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                      add({
                                        itemKey: nanoid(),
                                        routeName: '',
                                        productionQuantity: '',
                                        unit: detailRouteUnit,
                                      })
                                    }
                                  />
                                ) : (
                                  <Button
                                    danger
                                    aria-label={
                                      I18N.cbamOperationReport.deleteRoute
                                    }
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(field.name)}
                                  />
                                ))}
                            </div>
                          ))}
                        </div>
                      </Form.Item>
                    )}
                  </Form.List>
                  <Form.Item
                    name='description'
                    label={I18N.cbamOperationReport.processDescription}
                    rules={[
                      {
                        required: true,
                        message: I18N.template(
                          I18N.cbamOperationReport.requiredField,
                          {
                            field: I18N.cbamOperationReport.processDescription,
                          },
                        ),
                      },
                    ]}
                  >
                    <Input.TextArea maxLength={100} disabled={readonly} />
                  </Form.Item>
                  <Form.Item
                    name='routeChangeDesc'
                    label={I18N.cbamOperationReport.routeChangeDescription}
                    rules={
                      detailRoutesChanged
                        ? [
                            {
                              required: true,
                              message: I18N.template(
                                I18N.cbamOperationReport.requiredField,
                                {
                                  field:
                                    I18N.cbamOperationReport
                                      .routeChangeDescription,
                                },
                              ),
                            },
                          ]
                        : undefined
                    }
                  >
                    <Input.TextArea maxLength={500} disabled={readonly} />
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'monitor',
              label: I18N.cbamOperationReport.monitoringPlan,
              children: (
                <div className={styles.detailReadOnlyList}>
                  <label>
                    <span>{I18N.cbamOperationReport.processName}</span>
                    <div>{detailSourceProcess?.processName || '-'}</div>
                  </label>
                  <label>
                    <span>{I18N.cbamOperationReport.productionRouteLabel}</span>
                    <div>{detailSourceProcess?.productionRoute || '-'}</div>
                  </label>
                  <label>
                    <span>{I18N.cbamOperationReport.processDescription}</span>
                    <div className={styles.detailDescription}>
                      {detailSourceProcess?.description || '-'}
                    </div>
                  </label>
                </div>
              ),
            },
            ...(accountingTaskSelected
              ? [
                  {
                    key: 'accounting',
                    label: I18N.cbamOperationReport.accountingTask,
                    children: (
                      <div className={styles.accountingDetail}>
                        <div className={styles.accountingGrid}>
                          <label>
                            <span>{I18N.cbamOperationReport.processName}</span>
                            <div>
                              {linkedDetailAccountProcess?.processName || ''}
                            </div>
                          </label>
                          <label>
                            <span>
                              {I18N.cbamOperationReport.productionRouteLabel}
                            </span>
                            <div>
                              {linkedDetailAccountProcess?.productionRoute ||
                                ''}
                            </div>
                          </label>
                          <label>
                            <span>
                              {I18N.cbamOperationReport.processProductType}
                            </span>
                            <div>
                              {linkedDetailAccountProcess?.processProductType ||
                                ''}
                            </div>
                          </label>
                        </div>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Drawer>
      <Drawer
        closable={false}
        destroyOnClose
        width={604}
        rootClassName={styles.processDetailDrawer}
        title={<CbamDrawerTitle>{recordDetail?.title || '-'}</CbamDrawerTitle>}
        open={Boolean(recordDetail)}
        onClose={() => setRecordDetail(undefined)}
        extra={<CbamDrawerClose onClick={() => setRecordDetail(undefined)} />}
      >
        <Tabs
          className={styles.detailTabs}
          defaultActiveKey='current'
          items={
            recordDetail
              ? [
                  {
                    key: 'current',
                    label: I18N.cbamOperationReport.currentReport,
                    children: (
                      <div className={styles.detailReadOnlyList}>
                        {(
                          recordDetail.currentFields ||
                          recordDetail.fields ||
                          []
                        ).map(([label, value]) => (
                          <label key={`${label}:${value}`}>
                            <span>{label}</span>
                            <div>{value}</div>
                          </label>
                        ))}
                      </div>
                    ),
                  },
                  {
                    key: 'monitor',
                    label: I18N.cbamOperationReport.monitoringPlan,
                    children: (
                      <div className={styles.detailReadOnlyList}>
                        {recordDetail.monitorFields.map(([label, value]) => (
                          <label key={`${label}:${value}`}>
                            <span>{label}</span>
                            <div>{value}</div>
                          </label>
                        ))}
                      </div>
                    ),
                  },
                  ...(recordDetail.accountingFields
                    ? [
                        {
                          key: 'accounting',
                          label: I18N.cbamOperationReport.accountingTask,
                          children: (
                            <div className={styles.detailReadOnlyList}>
                              {recordDetail.accountingFields.map(
                                ([label, value]) => (
                                  <label key={`${label}:${value}`}>
                                    <span>{label}</span>
                                    <div>{value}</div>
                                  </label>
                                ),
                              )}
                            </div>
                          ),
                        },
                      ]
                    : []),
                ]
              : []
          }
        />
      </Drawer>
    </div>
  );
};

export default ProductionInfo;
