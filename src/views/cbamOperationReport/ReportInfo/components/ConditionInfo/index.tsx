/* eslint-disable jsx-a11y/label-has-associated-control -- AntD controls are nested in native labels */
import { DatePicker, Form, Input, Radio, Select } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';

import I18N from '@src/lang/I18N';

import { useCbamEnums } from '@/views/cbam/hook';
import { showMonitorDeleteConfirm } from '@/views/cbamMonitor/deleteConfirm';
import { FacilityElectricityItem } from '@/views/cbamMonitor/types';
import conditionChevron from '@/views/cbamOperationReport/assets/condition-chevron.svg';
import DecimalInput, {
  NON_NEGATIVE_SIX_DECIMAL_LIMIT,
  PERCENT_SIX_DECIMAL_LIMIT,
  PERCENT_TWO_DECIMAL_LIMIT,
} from '@/views/cbamOperationReport/components/DecimalInput';
import {
  getOperationIndustryFieldConfig,
  getOperationProductCategoryByCn,
} from '@/views/cbamOperationReport/service';
import {
  JsonObject,
  OperationAccountingProcess,
  OperationAccountingProduct,
  OperationGeneratorItem,
  OperationIndustryFieldConfig,
  OperationIndustryParameterItem,
  OperationProcessItem,
} from '@/views/cbamOperationReport/types';

import styles from './index.module.less';

interface ConditionInfoProps {
  form: FormInstance;
  sourcePlan?: JsonObject;
  accountingTaskSelected?: boolean;
  readonly?: boolean;
  onDirty: () => void;
  onEvidenceClick: (itemKey: string, partCode?: string) => void;
}

type IndustryProduct = OperationIndustryParameterItem & JsonObject;

interface SourceIndustryProcess extends JsonObject {
  itemKey?: string;
  processName?: string;
  productItemKeys?: string[];
  productionRoute?: string;
}

interface ZeroRatedFuelData extends JsonObject {
  itemKey?: string;
  applicable?: boolean;
  description?: string;
  notApplicableReason?: string;
  consumption?: string | number;
  biomassRatio?: string | number;
  zeroEmissionRatio?: string | number;
  verificationStartDate?: string;
  verificationEndDate?: string;
}

interface FacilityElectricityData extends JsonObject {
  itemKey?: string;
  applicable?: boolean;
  notApplicableReason?: string;
  generators?: OperationGeneratorItem[];
}

interface Co2StageProject extends JsonObject {
  itemKey?: string;
  sortNo?: number;
  projectName?: string;
  receivedAmount?: string | number;
  outputAmount?: string | number;
  sourceDestination?: string;
  purpose?: string;
  responsiblePerson?: string;
  contactInfo?: string;
  claimedDeductionAmount?: string | number;
}

interface Co2StageData extends JsonObject {
  itemKey?: string;
  applicable?: boolean;
  notApplicableReason?: string;
  projects?: Co2StageProject[];
}

type ConditionKey =
  | 'industry'
  | 'zeroRatedFuel'
  | 'facilityElectricity'
  | 'co2Stage';
type IndustryField =
  | 'reducing'
  | 'steelCode'
  | 'mnPer'
  | 'crPer'
  | 'niPer'
  | 'alloyPer'
  | 'cPer'
  | 'materialPer'
  | 'steelScrap'
  | 'wasteMaterial'
  | 'alUse'
  | 'nonAl'
  | 'clinker'
  | 'calcine'
  | 'solution'
  | 'nitric'
  | 'urea'
  | 'nitrogen'
  | 'ammonium'
  | 'noPer'
  | 'urPer'
  | 'organic';
type IndustryInputKind = 'text' | 'number' | 'reducing' | 'calcine';
interface IndustryFieldDefinition {
  key: IndustryField;
  label: string;
  kind: IndustryInputKind;
  unit?: string;
  maxLength?: number;
}
type VisibleIndustryField = IndustryFieldDefinition;
type ZeroRatedFuelField = 'consumption' | 'biomassRatio' | 'zeroEmissionRatio';
type GeneratorField =
  | 'generationAmount'
  | 'outputAmount'
  | 'emissionFactor'
  | 'nonCbamAmount';
type Co2StageField =
  | 'projectName'
  | 'receivedAmount'
  | 'outputAmount'
  | 'sourceDestination'
  | 'purpose'
  | 'responsiblePerson'
  | 'contactInfo'
  | 'claimedDeductionAmount';
type RangePickerValue = ComponentProps<typeof DatePicker.RangePicker>['value'];

const asObject = (value: unknown): JsonObject | undefined =>
  value && !Array.isArray(value) && typeof value === 'object'
    ? (value as JsonObject)
    : undefined;

const asArray = <T extends object>(value: unknown): T[] =>
  Array.isArray(value)
    ? (value.filter(item => Boolean(asObject(item))) as T[])
    : [];

const parseObject = (value?: string): JsonObject => {
  if (!value?.trim()) return {};
  try {
    return asObject(JSON.parse(value)) || {};
  } catch {
    return {};
  }
};

const textValue = (value: unknown) =>
  value === undefined || value === null ? '' : String(value);

const productIdentity = (product: IndustryProduct, index: number) =>
  textValue(
    product.productItemKey ||
      product.itemKey ||
      product.id ||
      product.productName ||
      index,
  );

const industryFieldDefinitions: Record<
  IndustryField,
  IndustryFieldDefinition
> = {
  reducing: {
    key: 'reducing',
    label: I18N.cbam.theMainPrecursor,
    kind: 'reducing',
  },
  steelCode: {
    key: 'steelCode',
    label: I18N.cbam.steelMillIdentificationNumber,
    kind: 'text',
    maxLength: 100,
  },
  mnPer: {
    key: 'mnPer',
    label: I18N.cbam.manganeseElementRatio,
    kind: 'number',
    unit: '%',
  },
  crPer: {
    key: 'crPer',
    label: I18N.cbam.chromiumElementRatio,
    kind: 'number',
    unit: '%',
  },
  niPer: {
    key: 'niPer',
    label: I18N.cbam.nickelElementRatio,
    kind: 'number',
    unit: '%',
  },
  alloyPer: {
    key: 'alloyPer',
    label: I18N.cbam.otherAlloyRatios,
    kind: 'number',
    unit: '%',
  },
  cPer: {
    key: 'cPer',
    label: I18N.cbam.carbonContent2,
    kind: 'number',
    unit: '%',
  },
  materialPer: {
    key: 'materialPer',
    label: I18N.cbam.otherMaterialsAccountFor,
    kind: 'number',
    unit: '%',
  },
  steelScrap: {
    key: 'steelScrap',
    label: I18N.cbam.usagePerTonOfSteel,
    kind: 'number',
  },
  wasteMaterial: {
    key: 'wasteMaterial',
    label: I18N.cbam.preConsumptionWaste,
    kind: 'number',
    unit: '%',
  },
  alUse: {
    key: 'alUse',
    label: I18N.cbam.usagePerTonOfAluminum,
    kind: 'number',
  },
  nonAl: {
    key: 'nonAl',
    label: I18N.cbam.nonAluminumElementsAccountFor,
    kind: 'number',
    unit: '%',
  },
  clinker: {
    key: 'clinker',
    label: I18N.cbam.clinkerParameters,
    kind: 'number',
  },
  calcine: {
    key: 'calcine',
    label: I18N.cbam.whetherToCalcineOrNot,
    kind: 'calcine',
  },
  solution: {
    key: 'solution',
    label: I18N.cbam.concentratedAqueousSolution,
    kind: 'number',
    unit: '%',
  },
  nitric: {
    key: 'nitric',
    label: I18N.cbam.nitricAcidRatio,
    kind: 'number',
    unit: '%',
  },
  urea: {
    key: 'urea',
    label: I18N.cbam.urea,
    kind: 'number',
    unit: '%',
  },
  nitrogen: {
    key: 'nitrogen',
    label: I18N.cbam.nitrogenContent,
    kind: 'number',
    unit: '%',
  },
  ammonium: {
    key: 'ammonium',
    label: I18N.cbam.nIsAmmoniumNitrogen,
    kind: 'number',
    unit: '%',
  },
  noPer: {
    key: 'noPer',
    label: I18N.cbam.nAsNitrate,
    kind: 'number',
    unit: '%',
  },
  urPer: {
    key: 'urPer',
    label: I18N.cbam.nIsInTheFormOfUrea,
    kind: 'number',
    unit: '%',
  },
  organic: {
    key: 'organic',
    label: I18N.cbam.nInOtherForms,
    kind: 'number',
    unit: '%',
  },
};
const industryFieldKeys = Object.keys(
  industryFieldDefinitions,
) as IndustryField[];
const dataIndustryFields = new Set<IndustryField>([
  'steelScrap',
  'alUse',
  'clinker',
]);

const normalizeIndustryField = (
  config: OperationIndustryFieldConfig,
): VisibleIndustryField | undefined => {
  const key = (config.link === 'cper' ? 'cPer' : config.link) as
    | IndustryField
    | undefined;
  if (!key || !industryFieldKeys.includes(key)) return undefined;
  return industryFieldDefinitions[key];
};

const zeroRatedFuelFields: {
  key: ZeroRatedFuelField;
  label: string;
  unit: string;
}[] = [
  {
    key: 'consumption',
    label: I18N.cbamOperationReport.consumptionAmount,
    unit: 'TJ',
  },
  {
    key: 'biomassRatio',
    label: I18N.cbamOperationReport.biomassRatio,
    unit: '%',
  },
  {
    key: 'zeroEmissionRatio',
    label: I18N.cbamOperationReport.zeroEmissionEligibleRatio,
    unit: '%',
  },
];

const generatorFields: {
  key: GeneratorField;
  label: string;
  unit: string;
  required: boolean;
}[] = [
  {
    key: 'generationAmount',
    label: I18N.cbamOperationReport.generationAmount,
    unit: 'MWh',
    required: true,
  },
  {
    key: 'outputAmount',
    label: I18N.cbamOperationReport.outputElectricityAmount,
    unit: 'MWh',
    required: true,
  },
  {
    key: 'emissionFactor',
    label: I18N.cbamOperationReport.electricityEmissionFactor,
    unit: 'tCO₂e/MWh',
    required: true,
  },
  {
    key: 'nonCbamAmount',
    label: I18N.cbamOperationReport.nonCbamElectricityAmount,
    unit: 'MWh',
    required: false,
  },
];

const co2StageFields: {
  key: Co2StageField;
  label: string;
  unit?: string;
  maxLength?: number;
}[] = [
  {
    key: 'projectName',
    label: I18N.cbamOperationReport.co2ProjectName,
    maxLength: 40,
  },
  {
    key: 'receivedAmount',
    label: I18N.cbamOperationReport.receivedAmount,
    unit: 'tCO₂',
  },
  {
    key: 'outputAmount',
    label: I18N.cbamOperationReport.outputAmount,
    unit: 'tCO₂',
  },
  {
    key: 'sourceDestination',
    label: I18N.cbamOperationReport.sourceDestination,
    maxLength: 40,
  },
  { key: 'purpose', label: I18N.cbamOperationReport.purpose, maxLength: 40 },
  {
    key: 'responsiblePerson',
    label: I18N.cbamOperationReport.responsiblePerson,
    maxLength: 40,
  },
  {
    key: 'contactInfo',
    label: I18N.cbamOperationReport.contactInfo,
    maxLength: 40,
  },
  {
    key: 'claimedDeductionAmount',
    label: I18N.cbamOperationReport.claimedDeductionAmount,
    unit: 'tCO₂',
  },
];

const createItemKey = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const ConditionInfo = ({
  form,
  sourcePlan,
  accountingTaskSelected,
  readonly,
  onDirty,
  onEvidenceClick,
}: ConditionInfoProps) => {
  const [expandedKey, setExpandedKey] = useState<ConditionKey | undefined>(
    'zeroRatedFuel',
  );
  const [resolvedCategoryIds, setResolvedCategoryIds] = useState<
    Record<string, number>
  >({});
  const [industryFieldsByCategory, setIndustryFieldsByCategory] = useState<
    Record<number, VisibleIndustryField[]>
  >({});
  const reducingEnums = useCbamEnums('Reducing');
  const watchOptions = { form, preserve: true };
  const processJsonText = Form.useWatch('processJson', watchOptions) as
    | string
    | undefined;
  const cbamProductJsonText = Form.useWatch('cbamProductJson', watchOptions) as
    | string
    | undefined;
  const industryJsonText = Form.useWatch(
    'industryParameterJson',
    watchOptions,
  ) as string | undefined;
  const zeroRatedFuelJsonText = Form.useWatch(
    'zeroRatedFuelJson',
    watchOptions,
  ) as string | undefined;
  const facilityElectricityJsonText = Form.useWatch(
    'facilityElectricityJson',
    watchOptions,
  ) as string | undefined;
  const co2StageJsonText = Form.useWatch('co2StageJson', watchOptions) as
    | string
    | undefined;
  const industryData = parseObject(industryJsonText);
  const zeroRatedFuelData = parseObject(
    zeroRatedFuelJsonText,
  ) as ZeroRatedFuelData;
  const facilityElectricityData = parseObject(
    facilityElectricityJsonText,
  ) as FacilityElectricityData;
  const co2StageData = parseObject(co2StageJsonText) as Co2StageData;
  const sourceCondition = asObject(sourcePlan?.condition) || {};
  const sourceZeroRatedFuel = (asObject(sourceCondition.zeroRatedFuelJson) ||
    {}) as ZeroRatedFuelData;
  const sourceFacilityElectricity = (asObject(
    sourceCondition.facilityElectricityJson,
  ) || {}) as FacilityElectricityData;
  const sourceCo2Stage = (asObject(sourceCondition.co2StageJson) ||
    {}) as Co2StageData;
  const sourceZeroRatedFuelApplicable =
    typeof sourceZeroRatedFuel.applicable === 'boolean'
      ? sourceZeroRatedFuel.applicable
      : undefined;
  const sourceFacilityElectricityApplicable =
    typeof sourceFacilityElectricity.applicable === 'boolean'
      ? sourceFacilityElectricity.applicable
      : undefined;
  const sourceCo2StageApplicable =
    typeof sourceCo2Stage.applicable === 'boolean'
      ? sourceCo2Stage.applicable
      : undefined;
  const zeroRatedFuel = {
    ...sourceZeroRatedFuel,
    ...zeroRatedFuelData,
    applicable: sourceZeroRatedFuelApplicable ?? zeroRatedFuelData.applicable,
  };
  const facilityElectricity = {
    ...sourceFacilityElectricity,
    ...facilityElectricityData,
    applicable:
      sourceFacilityElectricityApplicable ?? facilityElectricityData.applicable,
  };
  const co2Stage = {
    ...sourceCo2Stage,
    ...co2StageData,
    applicable: sourceCo2StageApplicable ?? co2StageData.applicable,
  };
  const zeroRatedFuelApplicable = zeroRatedFuel.applicable ?? true;
  const facilityElectricityApplicable = facilityElectricity.applicable ?? true;
  const co2StageApplicable = co2Stage.applicable ?? true;
  const verificationPeriod: RangePickerValue =
    zeroRatedFuel.verificationStartDate && zeroRatedFuel.verificationEndDate
      ? ([
          dayjs(zeroRatedFuel.verificationStartDate),
          dayjs(zeroRatedFuel.verificationEndDate),
        ] as unknown as RangePickerValue)
      : undefined;
  const goodsBoundary = asObject(sourcePlan?.goodsBoundary) || {};
  const productJson = asObject(goodsBoundary.productJson) || {};
  const processJson = asObject(goodsBoundary.processJson) || {};
  const sourceProcesses = asArray<SourceIndustryProcess>(
    processJson.processes,
  );
  const sourceProducts = asArray<IndustryProduct>(productJson.products).filter(
    product => product.productType === 'SOLD_PRODUCT',
  );
  const reportProcessJson = parseObject(processJsonText);
  const reportProcesses = asArray<OperationProcessItem>(
    reportProcessJson.processes,
  );
  const accountingProcesses = asArray<OperationAccountingProcess>(
    reportProcessJson.productProcesses,
  );
  const cbamProductJson = parseObject(cbamProductJsonText);
  const accountingProducts = asArray<OperationAccountingProduct>(
    cbamProductJson.saleProducts,
  );
  const itemListKey = Array.isArray(industryData.items)
    ? 'items'
    : Array.isArray(industryData.products)
    ? 'products'
    : Array.isArray(industryData.saleProducts)
    ? 'saleProducts'
    : 'items';
  const savedProducts = asArray<IndustryProduct>(industryData[itemListKey]);
  const products = sourceProducts.length
    ? sourceProducts
    : savedProducts.filter(
        product =>
          !product.productType || product.productType === 'SOLD_PRODUCT',
      );
  const sourceGenerators = asArray<FacilityElectricityItem>(
    sourceFacilityElectricity.generators,
  );
  const savedGenerators = asArray<OperationGeneratorItem>(
    facilityElectricityData.generators,
  );
  const generators: OperationGeneratorItem[] = savedGenerators.length
    ? savedGenerators.map(item => {
        const sourceItem = sourceGenerators.find(
          source => source.itemKey === item.sourceItemKey,
        );
        return sourceItem
          ? {
              ...item,
              generationMode: sourceItem.generationMode,
              energyProperty: sourceItem.energyProperty,
              includedInOutputBoundary: sourceItem.includedInOutputBoundary,
              meteringAllocationMethod: sourceItem.meteringAllocationMethod,
            }
          : item;
      })
    : sourceGenerators.map(item => ({
        sourceItemKey: item.itemKey,
        generationMode: item.generationMode,
        energyProperty: item.energyProperty,
        includedInOutputBoundary: item.includedInOutputBoundary,
        meteringAllocationMethod: item.meteringAllocationMethod,
      }));
  const co2Projects = asArray<Co2StageProject>(co2Stage.projects);

  const findSavedProduct = (product: IndustryProduct, productIndex: number) => {
    const identity = productIdentity(product, productIndex);
    return savedProducts.find(
      (item, itemIndex) => productIdentity(item, itemIndex) === identity,
    );
  };

  const linkedSourceProcesses = (
    product: IndustryProduct,
    productIndex: number,
  ) => {
    const identity = productIdentity(product, productIndex);
    return sourceProcesses.filter(process =>
      process.productItemKeys?.map(textValue).includes(identity),
    );
  };

  const linkedReportProcesses = (
    product: IndustryProduct,
    productIndex: number,
  ) => {
    const identity = productIdentity(product, productIndex);
    const sourceKeys = new Set(
      linkedSourceProcesses(product, productIndex).map(item =>
        textValue(item.itemKey),
      ),
    );
    return reportProcesses.filter(
      process =>
        process.productItemKeys?.map(textValue).includes(identity) ||
        sourceKeys.has(textValue(process.sourceItemKey)),
    );
  };

  const findAccountingProduct = (
    product: IndustryProduct,
    productIndex: number,
  ) => {
    if (!accountingTaskSelected) return undefined;
    const processIds = new Set(
      linkedReportProcesses(product, productIndex)
        .map(process => process.accountingProcessId)
        .filter((id): id is number => id != null),
    );
    return (
      accountingProducts.find(
        item =>
          processIds.has(item.processId as number) &&
          textValue(item.cnCode) === textValue(product.cnCode),
      ) ||
      accountingProducts.find(item => processIds.has(item.processId as number))
    );
  };

  const currentIndustryProduct = (
    product: IndustryProduct,
    productIndex: number,
  ): IndustryProduct => ({
    ...(findAccountingProduct(product, productIndex) || {}),
    ...product,
    ...(findSavedProduct(product, productIndex) || {}),
  });

  const productCategoryId = (
    product: IndustryProduct,
    productIndex: number,
  ) => {
    const identity = productIdentity(product, productIndex);
    const current = currentIndustryProduct(product, productIndex);
    if (current.productCategoryId != null)
      return Number(current.productCategoryId);
    const processIds = new Set(
      linkedReportProcesses(product, productIndex)
        .map(process => process.accountingProcessId)
        .filter((id): id is number => id != null),
    );
    return (
      accountingProcesses.find(
        process => process.id != null && processIds.has(process.id),
      )?.productCategoryId || resolvedCategoryIds[identity]
    );
  };

  const categoryLookupSignature = products
    .map((product, index) =>
      [
        productIdentity(product, index),
        product.cnCode || '',
        productCategoryId(product, index) || '',
      ].join(':'),
    )
    .join('|');

  useEffect(() => {
    let active = true;
    const unresolvedProducts = products
      .map((product, index) => ({ product, index }))
      .filter(
        ({ product, index }) =>
          !productCategoryId(product, index) && product.cnCode,
      );
    if (!unresolvedProducts.length)
      return () => {
        active = false;
      };
    Promise.all(
      unresolvedProducts.map(async ({ product, index }) => {
        const response = await getOperationProductCategoryByCn(
          product.cnCode as string,
        );
        const records = response.data?.data?.records || [];
        const category = records
          .filter(item => item.defaultCode === product.cnCode)
          .sort(
            (left, right) =>
              (left.id || Number.MAX_SAFE_INTEGER) -
              (right.id || Number.MAX_SAFE_INTEGER),
          )[0];
        return [
          productIdentity(product, index),
          category?.productCategoryId,
        ] as const;
      }),
    )
      .then(values => {
        if (!active) return;
        setResolvedCategoryIds(current =>
          values.reduce(
            (result, [key, categoryId]) =>
              categoryId == null
                ? result
                : { ...result, [key]: categoryId },
            current,
          ),
        );
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [
    sourcePlan,
    industryJsonText,
    processJsonText,
    cbamProductJsonText,
    categoryLookupSignature,
  ]);

  const categoryIds = [
    ...new Set(
      products
        .map(productCategoryId)
        .filter((id): id is number => id != null),
    ),
  ];
  const categoryConfigSignature = categoryIds
    .slice()
    .sort((left, right) => left - right)
    .join(',');

  useEffect(() => {
    let active = true;
    if (!categoryIds.length)
      return () => {
        active = false;
      };
    Promise.all(
      categoryIds.map(async categoryId => {
        const response = await getOperationIndustryFieldConfig(categoryId);
        const fields = (response.data?.data || [])
          .filter(config => config.isShow !== 1)
          .map(normalizeIndustryField)
          .filter((field): field is VisibleIndustryField => Boolean(field));
        return [categoryId, fields] as const;
      }),
    )
      .then(values => {
        if (!active) return;
        setIndustryFieldsByCategory(current => ({
          ...current,
          ...Object.fromEntries(values),
        }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [categoryConfigSignature]);

  const visibleIndustryFields = (
    product: IndustryProduct,
    productIndex: number,
  ) => {
    const categoryId = productCategoryId(product, productIndex);
    if (
      categoryId != null &&
      Object.prototype.hasOwnProperty.call(
        industryFieldsByCategory,
        categoryId,
      )
    ) {
      return industryFieldsByCategory[categoryId];
    }
    const current = currentIndustryProduct(product, productIndex);
    return industryFieldKeys
      .filter(key => textValue(current[key]))
      .map(key => industryFieldDefinitions[key]);
  };

  const updateIndustryField = (
    product: IndustryProduct,
    productIndex: number,
    field: IndustryField,
    value: string,
  ) => {
    const identity = productIdentity(product, productIndex);
    const savedIndex = savedProducts.findIndex(
      (item, itemIndex) => productIdentity(item, itemIndex) === identity,
    );
    const savedProduct =
      savedIndex >= 0 ? savedProducts[savedIndex] : undefined;
    const nextProduct: IndustryProduct = {
      ...currentIndustryProduct(product, productIndex),
      itemKey: savedProduct?.itemKey || `industry:${identity}`,
      productItemKey: identity,
      productName: product.productName,
      cnCode: product.cnCode,
      productType: product.productType,
      functionalUnit: product.functionalUnit,
      productCategoryId: productCategoryId(product, productIndex),
      [field]: value,
    };
    const nextProducts =
      savedIndex >= 0
        ? savedProducts.map((item, index) =>
            index === savedIndex ? nextProduct : item,
          )
        : [...savedProducts, nextProduct];
    form.setFieldValue(
      'industryParameterJson',
      JSON.stringify(
        {
          ...industryData,
          [itemListKey]: nextProducts,
        },
        null,
        2,
      ),
    );
    onDirty();
  };

  const updateZeroRatedFuel = (patch: Partial<ZeroRatedFuelData>) => {
    form.setFieldValue(
      'zeroRatedFuelJson',
      JSON.stringify(
        {
          ...sourceZeroRatedFuel,
          ...zeroRatedFuelData,
          itemKey: zeroRatedFuel.itemKey || 'operation-zero-rated-fuel',
          ...patch,
          ...(sourceZeroRatedFuelApplicable === undefined
            ? {}
            : { applicable: sourceZeroRatedFuelApplicable }),
        },
        null,
        2,
      ),
    );
    onDirty();
  };

  const updateFacilityElectricity = (
    patch: Partial<FacilityElectricityData>,
  ) => {
    form.setFieldValue(
      'facilityElectricityJson',
      JSON.stringify(
        {
          ...sourceFacilityElectricity,
          ...facilityElectricityData,
          itemKey:
            facilityElectricity.itemKey || 'operation-facility-electricity',
          ...patch,
          ...(sourceFacilityElectricityApplicable === undefined
            ? {}
            : { applicable: sourceFacilityElectricityApplicable }),
        },
        null,
        2,
      ),
    );
    onDirty();
  };

  const updateGeneratorField = (
    generatorIndex: number,
    field: GeneratorField,
    value: string,
  ) => {
    updateFacilityElectricity({
      generators: generators.map((item, index) => ({
        ...item,
        itemKey: item.itemKey || createItemKey(),
        ...(index === generatorIndex ? { [field]: value } : {}),
      })),
    });
  };

  const updateCo2Stage = (patch: Partial<Co2StageData>) => {
    form.setFieldValue(
      'co2StageJson',
      JSON.stringify(
        {
          ...co2StageData,
          itemKey: co2StageData.itemKey || 'operation-co2-stage',
          ...patch,
          ...(sourceCo2StageApplicable === undefined
            ? {}
            : { applicable: sourceCo2StageApplicable }),
        },
        null,
        2,
      ),
    );
    onDirty();
  };

  const addCo2Project = () => {
    updateCo2Stage({
      projects: [
        ...co2Projects,
        {
          itemKey: `operation-co2-stage:${createItemKey()}`,
          sortNo: co2Projects.length + 1,
        },
      ],
    });
  };

  const updateCo2Project = (
    projectIndex: number,
    field: Co2StageField,
    value: string,
  ) => {
    updateCo2Stage({
      projects: co2Projects.map((project, index) =>
        index === projectIndex
          ? {
              ...project,
              itemKey:
                project.itemKey || `operation-co2-stage:${createItemKey()}`,
              sortNo: project.sortNo || projectIndex + 1,
              [field]: value,
            }
          : project,
      ),
    });
  };

  const removeCo2Project = (projectIndex: number) => {
    const project = co2Projects[projectIndex];
    showMonitorDeleteConfirm({
      title: I18N.cbamOperationReport.deleteCo2Project,
      content: I18N.template(I18N.cbamOperationReport.confirmDeleteCo2Project, {
        name: project.projectName || I18N.cbamOperationReport.unnamedCo2Project,
      }),
      onOk: () =>
        updateCo2Stage({
          projects: co2Projects
            .filter((_, index) => index !== projectIndex)
            .map((item, index) => ({ ...item, sortNo: index + 1 })),
        }),
    });
  };

  const sections: {
    key: ConditionKey;
    name:
      | 'industryParameterJson'
      | 'zeroRatedFuelJson'
      | 'facilityElectricityJson'
      | 'co2StageJson';
    label: string;
    description: string;
  }[] = [
    {
      key: 'zeroRatedFuel',
      name: 'zeroRatedFuelJson',
      label: I18N.cbamOperationReport.zeroRatedFuels,
      description: I18N.cbamOperationReport.zeroRatedFuelsHint,
    },
    {
      key: 'facilityElectricity',
      name: 'facilityElectricityJson',
      label: I18N.cbamOperationReport.onsiteElectricityGeneration,
      description: I18N.cbamOperationReport.onsiteElectricityGenerationHint,
    },
    {
      key: 'co2Stage',
      name: 'co2StageJson',
      label: I18N.cbamOperationReport.co2CaptureTransferUseStorage,
      description: I18N.cbamOperationReport.co2CaptureTransferUseStorageHint,
    },
    {
      key: 'industry',
      name: 'industryParameterJson',
      label: I18N.cbamOperationReport.industryParameters,
      description: I18N.cbamOperationReport.industryParametersHint,
    },
  ];

  return (
    <div className={styles.root}>
      {sections.map(section => {
        const expanded = expandedKey === section.key;
        return (
          <section
            className={`${styles.panel} ${
              expanded ? styles.expandedPanel : ''
            }`}
            key={section.key}
          >
            <button
              type='button'
              className={`${styles.panelHeader} ${
                expanded ? styles.expandedHeader : ''
              }`}
              aria-expanded={expanded}
              onClick={() =>
                setExpandedKey(current =>
                  current === section.key ? undefined : section.key,
                )
              }
            >
              <img
                className={
                  expanded ? styles.expandedChevron : styles.collapsedChevron
                }
                src={conditionChevron}
                alt=''
              />
              <span>{section.label}</span>
            </button>
            {expanded && section.key === 'industry' ? (
              <div className={styles.industryContent}>
                {products.length ? (
                  products.map((product, productIndex) => {
                    const currentProduct = currentIndustryProduct(
                      product,
                      productIndex,
                    );
                    const sourceLinkedProcesses = linkedSourceProcesses(
                      product,
                      productIndex,
                    );
                    const reportLinkedProcesses = linkedReportProcesses(
                      product,
                      productIndex,
                    );
                    const processNames = sourceLinkedProcesses.length
                      ? sourceLinkedProcesses.map(process => process.processName)
                      : reportLinkedProcesses.map(
                          process => process.processName,
                        );
                    const routeNames = sourceLinkedProcesses.length
                      ? sourceLinkedProcesses.map(
                          process => process.productionRoute,
                        )
                      : reportLinkedProcesses.flatMap(process =>
                          process.sourceRouteNames?.length
                            ? process.sourceRouteNames
                            : process.routes.map(route => route.routeName),
                        );
                    return (
                      <article
                        className={styles.productItem}
                        key={productIdentity(product, productIndex)}
                      >
                        <header className={styles.productHeader}>
                          <span className={styles.productIndex}>
                            {String(productIndex + 1).padStart(2, '0')}
                          </span>
                          <div className={styles.productInfo}>
                            <strong>
                              {product.productName ||
                                I18N.cbamOperationReport.unnamedProduct}
                            </strong>
                            <div className={styles.productMeta}>
                              <span>
                                <span>
                                  {I18N.cbamOperationReport.cnCodeCompact}:{' '}
                                </span>
                                {product.cnCode || '-'}
                              </span>
                              <span>
                                <span>
                                  {I18N.cbamOperationReport.associatedProcess}:{' '}
                                </span>
                                {[...new Set(processNames.filter(Boolean))].join(
                                  '、',
                                ) || '-'}
                              </span>
                              <span>
                                <span>
                                  {
                                    I18N.cbamOperationReport
                                      .productionRouteLabel
                                  }
                                  :{' '}
                                </span>
                                {[...new Set(routeNames.filter(Boolean))].join(
                                  '、',
                                ) || '-'}
                              </span>
                            </div>
                          </div>
                        </header>
                        <div className={styles.fieldGrid}>
                          {visibleIndustryFields(product, productIndex).map(
                            field => (
                            <label className={styles.field} key={field.key}>
                              <span
                                className={`${styles.fieldLabel} ${styles.optionalFieldLabel}`}
                              >
                                {field.label}
                              </span>
                              {field.kind === 'reducing' ? (
                                <Select
                                  value={
                                    textValue(currentProduct[field.key]) ||
                                    undefined
                                  }
                                  disabled={readonly}
                                  allowClear
                                  showSearch
                                  optionFilterProp='label'
                                  options={(reducingEnums || []).map(item => ({
                                    value: textValue(item.code),
                                    label: item.name,
                                  }))}
                                  onChange={value =>
                                    updateIndustryField(
                                      product,
                                      productIndex,
                                      field.key,
                                      textValue(value),
                                    )
                                  }
                                />
                              ) : field.kind === 'calcine' ? (
                                <Select
                                  value={
                                    textValue(currentProduct[field.key]) ||
                                    undefined
                                  }
                                  disabled={readonly}
                                  allowClear
                                  options={[
                                    {
                                      value: '1',
                                      label: I18N.cbamOperationReport.yes,
                                    },
                                    {
                                      value: '2',
                                      label: I18N.cbamOperationReport.no,
                                    },
                                  ]}
                                  onChange={value =>
                                    updateIndustryField(
                                      product,
                                      productIndex,
                                      field.key,
                                      textValue(value),
                                    )
                                  }
                                />
                              ) : field.kind === 'text' ? (
                                <Input
                                  value={textValue(currentProduct[field.key])}
                                  disabled={readonly}
                                  maxLength={field.maxLength || 40}
                                  addonAfter={field.unit}
                                  onChange={event =>
                                    updateIndustryField(
                                      product,
                                      productIndex,
                                      field.key,
                                      event.target.value,
                                    )
                                  }
                                />
                              ) : (
                                <DecimalInput
                                  value={textValue(currentProduct[field.key])}
                                  disabled={readonly}
                                  {...(dataIndustryFields.has(field.key)
                                    ? NON_NEGATIVE_SIX_DECIMAL_LIMIT
                                    : PERCENT_SIX_DECIMAL_LIMIT)}
                                  addonAfter={field.unit}
                                  onValueChange={value =>
                                    updateIndustryField(
                                      product,
                                      productIndex,
                                      field.key,
                                      value,
                                    )
                                  }
                                />
                              )}
                            </label>
                            ),
                          )}
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <div className={styles.emptyProducts}>
                    {I18N.cbamOperationReport.noProductData}
                  </div>
                )}
              </div>
            ) : null}
            {expanded && section.key === 'zeroRatedFuel' ? (
              <div className={styles.zeroRatedContent}>
                <label className={styles.applicableField}>
                  <span>{I18N.cbamOperationReport.whetherApplicable}</span>
                  <Radio.Group value={zeroRatedFuelApplicable} disabled>
                    <Radio value>{I18N.cbamOperationReport.yes}</Radio>
                    <Radio value={false}>{I18N.cbamOperationReport.no}</Radio>
                  </Radio.Group>
                </label>
                {zeroRatedFuelApplicable ? (
                  <>
                    <label className={styles.descriptionField}>
                      <span>
                        {I18N.cbamOperationReport.zeroRatedFuelDescription}
                      </span>
                      <Input.TextArea
                        value={textValue(zeroRatedFuel.description)}
                        disabled={readonly}
                        maxLength={1000}
                        onChange={event =>
                          updateZeroRatedFuel({
                            description: event.target.value,
                          })
                        }
                      />
                    </label>
                    <div className={styles.zeroRatedGrid}>
                      {zeroRatedFuelFields.map(field => (
                        <label className={styles.field} key={field.key}>
                          <span className={styles.fieldLabel}>
                            {field.label}
                          </span>
                          <DecimalInput
                            value={textValue(zeroRatedFuel[field.key])}
                            disabled={readonly}
                            {...(field.key === 'consumption'
                              ? NON_NEGATIVE_SIX_DECIMAL_LIMIT
                              : PERCENT_TWO_DECIMAL_LIMIT)}
                            addonAfter={field.unit}
                            onValueChange={value =>
                              updateZeroRatedFuel({
                                [field.key]: value,
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                    <label
                      className={`${styles.field} ${styles.verificationPeriod}`}
                    >
                      <span
                        className={`${styles.fieldLabel} ${styles.optionalFieldLabel}`}
                      >
                        {I18N.cbamOperationReport.verificationPeriod}
                      </span>
                      <DatePicker.RangePicker
                        value={verificationPeriod}
                        disabled={readonly}
                        placeholder={['', '']}
                        onChange={dates =>
                          updateZeroRatedFuel({
                            verificationStartDate:
                              dates?.[0]?.format('YYYY-MM-DD'),
                            verificationEndDate:
                              dates?.[1]?.format('YYYY-MM-DD'),
                          })
                        }
                      />
                    </label>
                  </>
                ) : (
                  <label className={styles.notApplicableField}>
                    <span>
                      {I18N.cbamOperationReport.notApplicableDescription}
                    </span>
                    <Input
                      value={
                        sourceZeroRatedFuel.notApplicableReason ??
                        zeroRatedFuel.notApplicableReason ??
                        '-'
                      }
                      disabled
                    />
                  </label>
                )}
              </div>
            ) : null}
            {expanded && section.key === 'facilityElectricity' ? (
              <div className={styles.facilityElectricityContent}>
                <label className={styles.applicableField}>
                  <span>{I18N.cbamOperationReport.whetherApplicable}</span>
                  <Radio.Group value={facilityElectricityApplicable} disabled>
                    <Radio value>{I18N.cbamOperationReport.yes}</Radio>
                    <Radio value={false}>{I18N.cbamOperationReport.no}</Radio>
                  </Radio.Group>
                </label>
                {facilityElectricityApplicable ? (
                  <div className={styles.generatorList}>
                    {generators.length ? (
                      generators.map((generator, generatorIndex) => (
                        <article
                          className={styles.generatorCard}
                          key={
                            generator.itemKey ||
                            generator.sourceItemKey ||
                            generatorIndex
                          }
                        >
                          <header className={styles.generatorHeader}>
                            <span className={styles.productIndex}>
                              {String(generatorIndex + 1).padStart(2, '0')}
                            </span>
                            <div className={styles.generatorInfo}>
                              <strong>
                                {generator.generationMode ||
                                  I18N.cbamMonitor.generationMode}
                              </strong>
                              <div className={styles.generatorMeta}>
                                <span>
                                  {I18N.cbamMonitor.energyProperty}:{' '}
                                  {generator.energyProperty || '-'}
                                </span>
                                <span>
                                  {I18N.cbamMonitor.includedInOutputBoundary}:{' '}
                                  {generator.includedInOutputBoundary == null
                                    ? '-'
                                    : generator.includedInOutputBoundary
                                    ? I18N.cbamOperationReport.yes
                                    : I18N.cbamOperationReport.no}
                                </span>
                                <span>
                                  {I18N.cbamMonitor.meteringAllocationMethod}:{' '}
                                  {generator.meteringAllocationMethod || '-'}
                                </span>
                              </div>
                            </div>
                            <button
                              type='button'
                              className={styles.generatorEvidence}
                              onClick={() =>
                                onEvidenceClick(
                                  generator.itemKey ||
                                    generator.sourceItemKey ||
                                    '',
                                  'FACILITY_ELECTRICITY',
                                )
                              }
                            >
                              {I18N.cbamOperationReport.evidenceManagement}
                            </button>
                          </header>
                          <div className={styles.generatorFields}>
                            {generatorFields.map(field => (
                              <label className={styles.field} key={field.key}>
                                <span
                                  className={`${styles.fieldLabel} ${
                                    field.required
                                      ? ''
                                      : styles.optionalFieldLabel
                                  }`}
                                >
                                  {field.label}
                                </span>
                                <DecimalInput
                                  value={textValue(generator[field.key])}
                                  disabled={readonly}
                                  {...NON_NEGATIVE_SIX_DECIMAL_LIMIT}
                                  addonAfter={field.unit}
                                  onValueChange={value =>
                                    updateGeneratorField(
                                      generatorIndex,
                                      field.key,
                                      value,
                                    )
                                  }
                                />
                              </label>
                            ))}
                          </div>
                        </article>
                      ))
                    ) : (
                      <div className={styles.emptyProducts}>
                        {I18N.cbamOperationReport.noCategoryData}
                      </div>
                    )}
                  </div>
                ) : (
                  <label className={styles.notApplicableTextArea}>
                    <span>
                      {I18N.cbamOperationReport.notApplicableDescription}
                    </span>
                    <Input.TextArea
                      value={
                        sourceFacilityElectricity.notApplicableReason ??
                        facilityElectricity.notApplicableReason ??
                        '-'
                      }
                      disabled
                    />
                  </label>
                )}
              </div>
            ) : null}
            {expanded && section.key === 'co2Stage' ? (
              <div className={styles.co2StageContent}>
                <label className={styles.applicableField}>
                  <span>{I18N.cbamOperationReport.whetherApplicable}</span>
                  <Radio.Group value={co2StageApplicable} disabled>
                    <Radio value>{I18N.cbamOperationReport.yes}</Radio>
                    <Radio value={false}>{I18N.cbamOperationReport.no}</Radio>
                  </Radio.Group>
                </label>
                {co2StageApplicable ? (
                  <div className={styles.co2ProjectGroup}>
                    <header className={styles.co2ProjectToolbar}>
                      <span>
                        {I18N.cbamOperationReport.co2ProjectGroupTitle}
                      </span>
                      <div>
                        <span>
                          {I18N.template(
                            I18N.cbamOperationReport.co2ProjectCount,
                            { count: co2Projects.length },
                          )}
                        </span>
                        <button
                          type='button'
                          className={styles.co2GroupEvidence}
                          onClick={() =>
                            onEvidenceClick(
                              co2StageData.itemKey || 'operation-co2-stage',
                              'CO2_STAGE',
                            )
                          }
                        >
                          {I18N.cbamOperationReport.evidenceManagement}
                        </button>
                        {!readonly && (
                          <button type='button' onClick={addCo2Project}>
                            {I18N.cbamOperationReport.addCo2Project}
                          </button>
                        )}
                      </div>
                    </header>
                    <div className={styles.co2ProjectList}>
                      {co2Projects.map((project, projectIndex) => (
                        <article
                          className={styles.co2ProjectCard}
                          key={
                            project.itemKey ||
                            `operation-co2-stage:${projectIndex + 1}`
                          }
                        >
                          <header className={styles.co2ProjectHeader}>
                            <strong>
                              {project.projectName ||
                                I18N.cbamOperationReport.unnamedCo2Project}
                            </strong>
                            <div className={styles.co2ProjectActions}>
                              {!readonly && (
                                <button
                                  type='button'
                                  onClick={() => removeCo2Project(projectIndex)}
                                >
                                  {I18N.cbamOperationReport.delete}
                                </button>
                              )}
                            </div>
                          </header>
                          <div className={styles.co2ProjectFields}>
                            {co2StageFields.map(field => (
                              <label className={styles.field} key={field.key}>
                                <span className={styles.fieldLabel}>
                                  {field.label}
                                </span>
                                {field.unit ? (
                                  <DecimalInput
                                    value={textValue(project[field.key])}
                                    disabled={readonly}
                                    {...NON_NEGATIVE_SIX_DECIMAL_LIMIT}
                                    addonAfter={field.unit}
                                    onValueChange={value =>
                                      updateCo2Project(
                                        projectIndex,
                                        field.key,
                                        value,
                                      )
                                    }
                                  />
                                ) : (
                                  <Input
                                    value={textValue(project[field.key])}
                                    disabled={readonly}
                                    maxLength={field.maxLength || 40}
                                    onChange={event =>
                                      updateCo2Project(
                                        projectIndex,
                                        field.key,
                                        event.target.value,
                                      )
                                    }
                                  />
                                )}
                              </label>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  <label className={styles.notApplicableTextArea}>
                    <span>
                      {I18N.cbamOperationReport.notApplicableDescription}
                    </span>
                    <Input.TextArea
                      value={
                        sourceCo2Stage.notApplicableReason ??
                        co2Stage.notApplicableReason ??
                        '-'
                      }
                      disabled
                    />
                  </label>
                )}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
};

export default ConditionInfo;
