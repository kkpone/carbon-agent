import classNames from 'classnames';
import { Select } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import CbamNextActionForm, {
  CBAM_EXECUTION_OPTIONS_FORM_TITLE,
  CBAM_NEXT_ACTION_FORM_TITLE,
  type CbamExecutionDetail,
  type CbamExecutionField,
} from './CbamNextActionForm';
import EnterpriseAccountingPurposeForm from './EnterpriseAccountingPurposeForm';
import Icon from './Icon';
import { ACCOUNTING_PURPOSE_FORM } from '../accountingPurpose';
import {
  AGENT_FORM_TEXTAREA_MAX_LENGTH,
  AGENT_FORM_TEXT_MAX_LENGTH,
  icons,
} from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import type {
  AgentFormRequestSubmitPayload,
  AgentMessageCard,
} from '../service';

type FormPathSegment = string | number;
type FormPath = FormPathSegment[];
type FormValue =
  | string
  | number
  | boolean
  | string[]
  | FormValues
  | FormValues[];

type FormValues = {
  [key: string]: FormValue;
};

type FormOption = {
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  value: string;
  rawValue?: string | number | boolean;
};

type FormField = {
  integer?: boolean;
  allowEstimated?: boolean;
  allowUnknown?: boolean;
  columns: FormField[];
  defaultValue?: unknown;
  description?: string;
  id: string;
  label: string;
  linkedField?: string;
  linkedPresets?: Record<string, string[]>;
  max?: number;
  maxLength?: number;
  min?: number;
  minLength?: number;
  options: FormOption[];
  pattern?: string;
  placeholder?: string;
  recommended?: string;
  required?: boolean;
  subfields: FormField[];
  type: string;
  unit?: string;
};

type FormRequestCardProps = {
  card: AgentMessageCard;
  submitting?: boolean;
  onSubmit?: (payload: AgentFormRequestSubmitPayload) => void;
};

const ESTIMATED_FIELD_SUFFIX = '__estimated';
const TABLE_ROW_KEY = '__rowKey';
const MAX_FALLBACK_FIELDS = 5;
const MATERIAL_TABLE_ID = 'materials';
const MATERIAL_FIELD_ALIASES: Record<string, string[]> = {
  amount: [
    'amount',
    'quantity',
    'weight',
    'weight_g',
    'weightG',
    'mass_g',
    'Weight (g)',
    '重量(g)',
  ],
  estimated: ['estimated'],
  name: [
    'name',
    'material_name',
    'materialName',
    'material',
    'item_name',
    'component_name',
    'componentName',
    'component',
    'part_name',
    'partName',
    'main_material',
    'primary_material',
  ],
  unit: ['unit', 'Unit'],
};
const BOUNDARY_FIELD_IDS = new Set([
  'boundary',
  'life_cycle_boundary',
  'lifecycleboundary',
  'lifecycle_boundary',
  'system_boundary',
]);
const BOUNDARY_VALUE_ALIASES: Record<string, string> = {
  'cradle-to-gate': 'half_lifecycle',
  'cradle-to-grave': 'full_lifecycle',
  cradle_to_gate: 'half_lifecycle',
  cradle_to_grave: 'full_lifecycle',
  custom: 'custom',
  full: 'full_lifecycle',
  full_life_cycle: 'full_lifecycle',
  full_lifecycle: 'full_lifecycle',
  half: 'half_lifecycle',
  half_life_cycle: 'half_lifecycle',
  half_lifecycle: 'half_lifecycle',
  全生命周期: 'full_lifecycle',
  半生命周期: 'half_lifecycle',
  自定义: 'custom',
};
const CUSTOM_OPTION_KEYS = new Set([
  'custom',
  'other',
  'others',
  '其它',
  '其他',
  '自定义',
]);
const CUSTOM_FUNCTIONAL_UNIT_FIELD_IDS = new Set([
  'custom_functional_unit',
  'custom-functional-unit',
  'customfunctionalunit',
  'functional_unit_custom',
  'functional-unit-custom',
  'functionalunitcustom',
]);
const FUNCTIONAL_UNIT_FIELD_IDS = new Set([
  'functional_unit',
  'functional-unit',
  'functionalunit',
  'function_unit',
  'function-unit',
  'functionunit',
]);
const LIFECYCLE_STAGE_FIELD_IDS = new Set([
  'life_cycle_stages',
  'life-cycle-stages',
  'lifecyclestages',
  'lifecycle_stages',
  'lifecycle-stages',
  'lifestages',
]);
const BOUNDARY_OPTION_LABELS = createI18nLabelMap<string, string>({
  custom: () => I18N.carbonAgent.customOption,
  full_lifecycle: () => I18N.carbonAgent.fullLifeCycle,
  half_lifecycle: () => I18N.carbonAgent.halfLifeCycle,
});
const getBoundaryDefaultOptions = () => [
  {
    label: BOUNDARY_OPTION_LABELS.full_lifecycle,
    value: 'full_lifecycle',
  },
  {
    label: BOUNDARY_OPTION_LABELS.half_lifecycle,
    value: 'half_lifecycle',
  },
  {
    label: BOUNDARY_OPTION_LABELS.custom,
    value: 'custom',
  },
];
const FIELD_INITIAL_ALIASES: Record<string, string[]> = {
  boundary: [
    'boundary',
    'life_cycle_boundary',
    'lifeCycleBoundary',
    'lifecycle_boundary',
  ],
  lifeCycleBoundary: [
    'lifeCycleBoundary',
    'life_cycle_boundary',
    'lifecycle_boundary',
    'boundary',
  ],
  life_cycle_stages: [
    'life_cycle_stages',
    'lifeCycleStages',
    'lifecycle_stages',
    'lifeCycleStage',
  ],
  lifeCycleStages: [
    'lifeCycleStages',
    'life_cycle_stages',
    'lifecycle_stages',
    'lifeCycleStage',
  ],
  product_name: ['product_name', 'productName'],
  productName: ['productName', 'product_name'],
};
const getEstimatedFieldId = (fieldId: string) =>
  `${fieldId}${ESTIMATED_FIELD_SUFFIX}`;
const createTableRowKey = () =>
  `row_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const asRecord = (data: unknown): Record<string, unknown> =>
  data && typeof data === 'object' && !Array.isArray(data)
    ? (data as Record<string, unknown>)
    : {};

const getOptionalString = (data: unknown) =>
  typeof data === 'string' && data.trim() ? data.trim() : undefined;

const getOptionalPrimitiveString = (data: unknown) => {
  if (typeof data === 'string') {
    return data.trim() ? data.trim() : undefined;
  }

  return typeof data === 'number' || typeof data === 'boolean'
    ? String(data)
    : undefined;
};

const getOptionalNumber = (data: unknown) => {
  const value = Number(data);

  return Number.isFinite(value) ? value : undefined;
};

const getOptionalPositiveInteger = (data: unknown) => {
  const value = getOptionalNumber(data);

  return value && value > 0 ? Math.floor(value) : undefined;
};

const getOptionalArray = (data: unknown) => (Array.isArray(data) ? data : []);

const hasRecordValue = (data: unknown) =>
  Object.keys(asRecord(data)).length > 0;

const hasDefinedValue = (data: unknown) => data !== undefined && data !== null;

const getOptionKey = (data: unknown) =>
  String(data ?? '')
    .trim()
    .toLowerCase();

const getRecordValueByAlias = (
  data: Record<string, unknown>,
  aliases: string[],
) => {
  const exactAlias = aliases.find(alias =>
    Object.prototype.hasOwnProperty.call(data, alias),
  );

  if (exactAlias) {
    return data[exactAlias];
  }

  const normalizedAliases = new Set(aliases.map(getOptionKey));
  const matchedKey = Object.keys(data).find(key =>
    normalizedAliases.has(getOptionKey(key)),
  );

  return matchedKey ? data[matchedKey] : undefined;
};

const getFieldAliases = (fieldId: string) =>
  uniqueFieldNames([fieldId, ...(FIELD_INITIAL_ALIASES[fieldId] || [])]);

const isMaterialTable = (field: FormField) =>
  getOptionKey(field.id) === MATERIAL_TABLE_ID;

const isUnitField = (field: FormField) =>
  getOptionKey(field.id) === 'unit' || field.label === '单位';

const isBoundaryFieldIdentity = (id: string, label?: string) =>
  BOUNDARY_FIELD_IDS.has(getOptionKey(id)) ||
  Boolean(label && /生命周期范围|系统边界/.test(label));

const isBoundaryField = (field: FormField) =>
  isBoundaryFieldIdentity(field.id, field.label);

const isCustomOptionValue = (value: unknown) =>
  CUSTOM_OPTION_KEYS.has(getOptionKey(value));

const isCustomOptionSelected = (value: FormValue | undefined) =>
  Array.isArray(value)
    ? value.some(item => isCustomOptionValue(item))
    : isCustomOptionValue(value);

const hasCustomOption = (field: FormField) =>
  field.options.some(
    option =>
      isCustomOptionValue(option.value) || isCustomOptionValue(option.label),
  );

const isCustomFunctionalUnitField = (field: FormField) =>
  CUSTOM_FUNCTIONAL_UNIT_FIELD_IDS.has(getOptionKey(field.id)) ||
  /自定义.*功能单位|功能单位.*自定义/.test(field.label);

const isFunctionalUnitChoiceField = (field: FormField) =>
  !isCustomFunctionalUnitField(field) &&
  (FUNCTIONAL_UNIT_FIELD_IDS.has(getOptionKey(field.id)) ||
    /功能单位/.test(field.label)) &&
  hasCustomOption(field);

const isLifecycleStageField = (field: FormField) =>
  LIFECYCLE_STAGE_FIELD_IDS.has(getOptionKey(field.id)) ||
  /生命周期阶段|自定义生命周期/.test(field.label);

const getCustomFunctionalUnitController = (
  field: FormField,
  siblingFields: FormField[],
) =>
  isCustomFunctionalUnitField(field)
    ? siblingFields.find(isFunctionalUnitChoiceField)
    : undefined;

const getLifecycleBoundaryController = (
  field: FormField,
  siblingFields: FormField[],
) =>
  isLifecycleStageField(field)
    ? siblingFields.find(
        candidate =>
          isBoundaryField(candidate) &&
          (!candidate.linkedField ||
            getOptionKey(candidate.linkedField) === getOptionKey(field.id)),
      ) || siblingFields.find(isBoundaryField)
    : undefined;

const normalizeBoundaryValue = (value: unknown) => {
  const stringValue = getOptionalPrimitiveString(value);

  if (!stringValue) {
    return '';
  }

  return BOUNDARY_VALUE_ALIASES[getOptionKey(stringValue)] || stringValue;
};

const normalizeBoundaryOption = (option: FormOption): FormOption => {
  const normalizedValue =
    normalizeBoundaryValue(option.value) ||
    normalizeBoundaryValue(option.label);

  if (!normalizedValue) {
    return option;
  }

  return {
    label: BOUNDARY_OPTION_LABELS[normalizedValue] || option.label,
    value: normalizedValue,
  };
};

const normalizeBoundaryOptions = (options: FormOption[]) =>
  mergeOptions([
    ...options.map(normalizeBoundaryOption),
    ...getBoundaryDefaultOptions(),
  ]);

const normalizeBoundaryLinkedPresets = (
  presets: Record<string, string[]>,
): Record<string, string[]> =>
  Object.entries(presets).reduce<Record<string, string[]>>(
    (nextPresets, [key, value]) => ({
      ...nextPresets,
      [normalizeBoundaryValue(key) || key]: value,
    }),
    {},
  );

const getFieldDefaultValue = (fieldRecord: Record<string, unknown>) =>
  [
    fieldRecord.value,
    fieldRecord.defaultValue,
    fieldRecord.default,
    fieldRecord.default_rows,
    fieldRecord.default_value,
    fieldRecord.initial_value,
    fieldRecord.initialValue,
    fieldRecord.recommended,
  ].find(hasDefinedValue);

const normalizeMaterialUnitColumn = (column: FormField): FormField =>
  isUnitField(column)
    ? {
        ...column,
        defaultValue: hasDefinedValue(column.defaultValue)
          ? column.defaultValue
          : 'g',
        options: [],
        placeholder:
          column.placeholder || I18N.carbonAgent.unitPlaceholderExample,
        type: 'text',
      }
    : column;

const normalizeMaterialTableField = (field: FormField): FormField =>
  isMaterialTable(field) && field.columns.length
    ? {
        ...field,
        columns: field.columns.map(normalizeMaterialUnitColumn),
      }
    : field;

const isEmptyRecordValue = (data: unknown) =>
  data !== null &&
  typeof data === 'object' &&
  !Array.isArray(data) &&
  !Object.keys(asRecord(data)).length;

const getPathKey = (path: FormPath) => path.map(String).join('.');
const getFieldContainerId = (pathKey: string) =>
  `form-request-field-${encodeURIComponent(pathKey)}`;

const scrollFirstErrorIntoView = (errors: Record<string, string>) => {
  const firstErrorKey = Object.keys(errors)[0];

  if (!firstErrorKey || typeof document === 'undefined') {
    return;
  }

  window.requestAnimationFrame(() => {
    document
      .getElementById(getFieldContainerId(firstErrorKey))
      ?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
  });
};

const parseJsonRecord = (data: unknown) => {
  if (typeof data !== 'string') {
    return {};
  }

  try {
    return asRecord(JSON.parse(data));
  } catch {
    return {};
  }
};

const normalizeOption = (option: unknown): FormOption | undefined => {
  if (
    typeof option === 'string' ||
    typeof option === 'number' ||
    typeof option === 'boolean'
  ) {
    const label = String(option).trim();

    return label
      ? {
          label,
          value:
            typeof option === 'string'
              ? option
              : `__agent_${typeof option}:${option}`,
          rawValue: option,
        }
      : undefined;
  }

  const optionRecord = asRecord(option);
  const rawValue = [
    optionRecord.value,
    optionRecord.id,
    optionRecord.key,
    optionRecord.label,
    optionRecord.text,
    optionRecord.name,
  ].find(value => ['string', 'number', 'boolean'].includes(typeof value)) as
    | string
    | number
    | boolean
    | undefined;
  const value =
    getOptionalPrimitiveString(optionRecord.value) ||
    getOptionalPrimitiveString(optionRecord.id) ||
    getOptionalPrimitiveString(optionRecord.key) ||
    getOptionalPrimitiveString(optionRecord.label) ||
    getOptionalPrimitiveString(optionRecord.text) ||
    getOptionalPrimitiveString(optionRecord.name);
  const label =
    getOptionalPrimitiveString(optionRecord.label) ||
    getOptionalPrimitiveString(optionRecord.text) ||
    getOptionalPrimitiveString(optionRecord.name) ||
    value;

  return value && label
    ? {
        disabled: optionRecord.disabled === true,
        disabledReason: getOptionalString(optionRecord.disabledReason),
        label,
        value:
          typeof rawValue === 'number' || typeof rawValue === 'boolean'
            ? `__agent_${typeof rawValue}:${rawValue}`
            : value,
        rawValue,
      }
    : undefined;
};

const isFormOption = (option: FormOption | undefined): option is FormOption =>
  Boolean(option);

const mergeOptions = (options: FormOption[]) =>
  options.reduce<FormOption[]>((nextOptions, option) => {
    const optionKey = getOptionKey(option.value);

    return optionKey &&
      !nextOptions.some(item => getOptionKey(item.value) === optionKey)
      ? [...nextOptions, option]
      : nextOptions;
  }, []);

const optionsWithUnknown = (field: FormField, allowUnknown = false) => {
  const baseOptions = field.options;

  if (
    !allowUnknown ||
    baseOptions.some(option => getOptionKey(option.value) === 'unknown')
  ) {
    return baseOptions;
  }

  return [
    ...baseOptions,
    {
      label: I18N.carbonAgent.unknownOption,
      value: 'unknown',
    },
  ];
};

const getOptionsWithCurrentValue = (field: FormField, value?: FormValue) => {
  const baseOptions = optionsWithUnknown(field, field.allowUnknown);
  const values = Array.isArray(value)
    ? value
    : hasDefinedValue(value)
    ? [value]
    : [];
  const additionalOptions = values
    .map(getOptionalPrimitiveString)
    .map(item => (isBoundaryField(field) ? normalizeBoundaryValue(item) : item))
    .filter((item): item is string => Boolean(item))
    .filter(
      item =>
        !baseOptions.some(
          option => getOptionKey(option.value) === getOptionKey(item),
        ),
    )
    .map(item => ({
      label: item,
      value: item,
    }));

  return mergeOptions([...baseOptions, ...additionalOptions]);
};

const normalizeLinkedPresets = (presets: unknown) =>
  Object.entries(asRecord(presets)).reduce<Record<string, string[]>>(
    (nextPresets, [key, value]) => {
      const presetValues = getOptionalArray(value)
        .map(getOptionalPrimitiveString)
        .filter((item): item is string => Boolean(item));

      return {
        ...nextPresets,
        [key]: presetValues,
      };
    },
    {},
  );

const normalizeFieldType = (type: unknown) => {
  const normalizedType = getOptionalString(type)?.toLowerCase();
  if (normalizedType === 'array') return 'table';
  if (normalizedType === 'integer') return 'number';
  if (normalizedType === 'boolean') return 'checkbox';

  if (
    normalizedType === 'select' ||
    normalizedType === 'single-select' ||
    normalizedType === 'single_select'
  ) {
    return 'single_select';
  }

  if (
    normalizedType === 'multiselect' ||
    normalizedType === 'multi-select' ||
    normalizedType === 'multi_select'
  ) {
    return 'multi_select';
  }

  if (normalizedType === 'text_area') {
    return 'textarea';
  }

  return normalizedType || 'text';
};

const getDefaultMaxLength = (type: string) => {
  if (type === 'textarea') {
    return AGENT_FORM_TEXTAREA_MAX_LENGTH;
  }

  return type === 'text' || type === 'email' || type === 'url'
    ? AGENT_FORM_TEXT_MAX_LENGTH
    : undefined;
};

const normalizeChoiceValue = (field: FormField, value: unknown) => {
  const typedOption = field.options.find(
    option => option.rawValue !== undefined && option.rawValue === value,
  );
  if (typedOption) return typedOption.value;
  const stringValue = getOptionalPrimitiveString(value);

  if (!stringValue) {
    return '';
  }

  const normalizedValue = isBoundaryField(field)
    ? normalizeBoundaryValue(stringValue)
    : stringValue;

  return (
    getOptionsWithCurrentValue(field, normalizedValue).find(
      option =>
        getOptionKey(option.value) === getOptionKey(normalizedValue) ||
        getOptionKey(option.label) === getOptionKey(normalizedValue) ||
        (option.rawValue !== undefined &&
          String(option.rawValue) === normalizedValue),
    )?.value || normalizedValue
  );
};

const getFieldReference = (field: unknown) => {
  const fieldString = getOptionalString(field);
  const baseRecord = asRecord(field);
  const fieldRecord = {
    ...baseRecord,
    ...parseJsonRecord(field),
    ...parseJsonRecord(baseRecord.label),
    ...parseJsonRecord(baseRecord.field),
  };

  return (
    getOptionalString(fieldRecord.name) ||
    getOptionalString(fieldRecord.field_id) ||
    getOptionalString(fieldRecord.fieldId) ||
    getOptionalString(fieldRecord.id) ||
    getOptionalString(fieldRecord.field) ||
    getOptionalString(fieldRecord.key) ||
    fieldString
  );
};

const normalizeField = (
  field: unknown,
  index: number,
  requiredNames: string[] = [],
  fallbackName?: string,
): FormField => {
  const fieldString = getOptionalString(field);
  const baseRecord = asRecord(field);
  const fieldRecord = {
    ...baseRecord,
    ...parseJsonRecord(field),
    ...parseJsonRecord(baseRecord.label),
    ...parseJsonRecord(baseRecord.field),
  };
  const id =
    getOptionalString(fieldRecord.name) ||
    getOptionalString(fieldRecord.field_id) ||
    getOptionalString(fieldRecord.fieldId) ||
    getOptionalString(fieldRecord.id) ||
    getOptionalString(fieldRecord.field) ||
    getOptionalString(fieldRecord.key) ||
    fallbackName ||
    fieldString ||
    `field_${index + 1}`;
  const label =
    getOptionalString(fieldRecord.label) ||
    getOptionalString(fieldRecord.title) ||
    id;
  const type = normalizeFieldType(fieldRecord.kind || fieldRecord.type);
  const maxLength =
    getOptionalPositiveInteger(fieldRecord.maxLength) ||
    getOptionalPositiveInteger(fieldRecord.max_length) ||
    getDefaultMaxLength(type);
  const items = asRecord(fieldRecord.items);
  const columnDefinitions =
    fieldRecord.columns ??
    (Array.isArray(fieldRecord.items)
      ? fieldRecord.items
      : Object.entries(asRecord(items.properties)).map(
          ([name, definition]) => ({
            ...asRecord(definition),
            name,
            required:
              getOptionalArray(items.required).includes(name) ||
              asRecord(definition).required,
          }),
        ));
  const columns = getOptionalArray(columnDefinitions).map(
    (column, columnIndex) => normalizeField(column, columnIndex),
  );
  const subfields = getOptionalArray(fieldRecord.subfields).map(
    (subfield, subfieldIndex) => normalizeField(subfield, subfieldIndex),
  );
  const linkedPresets = normalizeLinkedPresets(
    fieldRecord.linked_presets ?? fieldRecord.linkedPresets,
  );
  const options = getOptionalArray(fieldRecord.options)
    .map(normalizeOption)
    .filter(isFormOption);

  const normalizedField: FormField = {
    integer: (fieldRecord.kind || fieldRecord.type) === 'integer',
    allowEstimated: Boolean(
      fieldRecord.allow_estimated ?? fieldRecord.allowEstimated,
    ),
    allowUnknown: Boolean(
      fieldRecord.allow_unknown ?? fieldRecord.allowUnknown,
    ),
    columns,
    defaultValue: getFieldDefaultValue(fieldRecord),
    description:
      getOptionalString(fieldRecord.description) ||
      getOptionalString(fieldRecord.helpText) ||
      getOptionalString(fieldRecord.help_text),
    id,
    label,
    linkedField:
      getOptionalString(fieldRecord.linked_field) ||
      getOptionalString(fieldRecord.linkedField),
    linkedPresets: isBoundaryFieldIdentity(id, label)
      ? normalizeBoundaryLinkedPresets(linkedPresets)
      : linkedPresets,
    max: getOptionalNumber(fieldRecord.max ?? fieldRecord.maximum),
    maxLength,
    min: getOptionalNumber(fieldRecord.min ?? fieldRecord.minimum),
    minLength:
      getOptionalPositiveInteger(fieldRecord.minLength) ||
      getOptionalPositiveInteger(fieldRecord.min_length),
    options: isBoundaryFieldIdentity(id, label)
      ? normalizeBoundaryOptions(options)
      : options,
    pattern: getOptionalString(fieldRecord.pattern),
    placeholder: getOptionalString(fieldRecord.placeholder),
    recommended: getOptionalPrimitiveString(fieldRecord.recommended),
    required: fieldRecord.required === true || requiredNames.includes(id),
    subfields,
    type,
    unit: getOptionalString(fieldRecord.unit),
  };

  return normalizeMaterialTableField(normalizedField);
};

const normalizeFields = (fields: unknown, requiredNames: string[] = []) =>
  getOptionalArray(fields).map((field, index) =>
    normalizeField(field, index, requiredNames),
  );

const getFormPayload = (card: AgentMessageCard) => {
  const cardRecord = asRecord(card.card);
  const safePayload = asRecord(cardRecord.safePayload);

  return {
    ...safePayload,
    ...cardRecord,
  };
};

const getFormName = (payload: Record<string, unknown>) => {
  const rawValue = asRecord(asRecord(payload.rawInterrupt).value);

  return (
    getOptionalString(payload.formTitle) ||
    getOptionalString(payload.formName) ||
    getOptionalString(payload.component_name) ||
    getOptionalString(payload.componentName) ||
    getOptionalString(payload.component) ||
    getOptionalString(rawValue.form_title) ||
    getOptionalString(rawValue.form_name) ||
    getOptionalString(rawValue.form_id) ||
    getOptionalString(rawValue.component_name) ||
    getOptionalString(rawValue.component)
  );
};

const isCbamExecutionOptionsForm = (payload: Record<string, unknown>) => {
  const formName = getFormName(payload);

  return (
    formName === CBAM_EXECUTION_OPTIONS_FORM_TITLE ||
    formName === CBAM_NEXT_ACTION_FORM_TITLE
  );
};

const getRawInterruptValue = (payload: Record<string, unknown>) =>
  asRecord(asRecord(payload.rawInterrupt).value);

const getCbamExecutionSection = (
  payload: Record<string, unknown>,
  sectionName: 'business_information' | 'business_assessment',
) => {
  const rawValue = getRawInterruptValue(payload);

  return (
    payload[sectionName] ??
    rawValue[sectionName] ??
    asRecord(payload.data)[sectionName] ??
    asRecord(rawValue.data)[sectionName]
  );
};

const CBAM_EXECUTION_VALUE_LABELS = createI18nLabelMap<string, string>({
  actions: () => I18N.carbonAgent.cbamBusinessActions,
  materials: () => I18N.carbonAgent.cbamMaterialActions,
});

const formatCbamExecutionValue = (value: unknown, depth = 0): string => {
  if (value === undefined || value === null || depth > 4) {
    return '';
  }

  const primitiveValue = getOptionalPrimitiveString(value);

  if (primitiveValue) {
    return primitiveValue;
  }

  if (Array.isArray(value)) {
    return value
      .map(item => formatCbamExecutionValue(item, depth + 1))
      .filter(Boolean)
      .join('；');
  }

  const record = asRecord(value);
  const primaryValues = [
    record.content,
    record.summary,
    record.message,
    record.recommendation,
    record.description,
    record.text,
  ]
    .filter(hasDefinedValue)
    .map(item => formatCbamExecutionValue(item, depth + 1))
    .filter(Boolean);
  const actionValues = ['materials', 'actions']
    .map(key => {
      const actionValue = formatCbamExecutionValue(record[key], depth + 1);

      return actionValue
        ? `${CBAM_EXECUTION_VALUE_LABELS[key] || key}：${actionValue}`
        : '';
    })
    .filter(Boolean);

  if (primaryValues.length || actionValues.length) {
    return [...primaryValues, ...actionValues].join('\n');
  }

  return Object.entries(record)
    .filter(([key]) => !['label', 'name', 'title'].includes(key))
    .map(
      ([key, item]) => `${key}: ${formatCbamExecutionValue(item, depth + 1)}`,
    )
    .filter(Boolean)
    .join('；');
};

const formatCbamExecutionDetailValue = (key: string, value: unknown) =>
  key === 'hasScenarioComparison' && typeof value === 'boolean'
    ? value
      ? I18N.carbonAgent.cbamScenarioComparisonAvailable
      : I18N.carbonAgent.cbamScenarioComparisonUnavailable
    : formatCbamExecutionValue(value);

const getCbamExecutionDetails = (
  payload: Record<string, unknown>,
  sectionName: 'business_information' | 'business_assessment',
): CbamExecutionDetail[] =>
  Object.entries(getCbamExecutionSection(payload, sectionName) || {})
    .map(([key, value]) => {
      const valueRecord = asRecord(value);

      return {
        key,
        label:
          getOptionalString(valueRecord.label) ||
          getOptionalString(valueRecord.title) ||
          getOptionalString(valueRecord.name),
        value: formatCbamExecutionDetailValue(key, value),
      };
    })
    .filter(detail => Boolean(detail.value));

const getFirstInterruptId = (
  payload: Record<string, unknown>,
  requestTemplate?: Record<string, unknown>,
) => {
  const payloadInterrupt = asRecord(getOptionalArray(payload.interrupts)[0]);
  const templateInterrupt = asRecord(
    getOptionalArray(requestTemplate?.interrupts)[0],
  );

  return (
    getOptionalString(payloadInterrupt.id) ||
    getOptionalString(templateInterrupt.id) ||
    getOptionalString(asRecord(payload.rawInterrupt).id) ||
    getOptionalString(asRecord(requestTemplate?.rawInterrupt).id) ||
    getOptionalString(payload.resumeEventId) ||
    getOptionalString(requestTemplate?.resumeEventId)
  );
};

const getFieldReferences = (fields: unknown) =>
  getOptionalArray(fields)
    .map(getFieldReference)
    .filter((field): field is string => Boolean(field));

const uniqueFieldNames = (names: string[]) =>
  names.filter((name, index) => names.indexOf(name) === index);

const getRequestFieldLists = (
  payload: Record<string, unknown>,
  rawValue: Record<string, unknown>,
) => ({
  optionalNames: getFieldReferences(
    rawValue.optional_fields ??
      rawValue.optionalFields ??
      payload.optional_fields ??
      payload.optionalFields,
  ),
  requiredNames: getFieldReferences(
    rawValue.required_fields ??
      rawValue.requiredFields ??
      payload.required_fields ??
      payload.requiredFields,
  ),
});

const getFieldReferenceWithFallback = (field: unknown, fallbackName?: string) =>
  getFieldReference(field) || fallbackName;

const createTextFallbackField = (name: string, requiredNames: string[]) => ({
  kind: 'text',
  label: name,
  name,
  required: requiredNames.includes(name),
});

const getUiFieldDefinitions = (
  uiFields: unknown,
  requiredNames: string[],
  optionalNames: string[],
) => {
  const orderedNames = uniqueFieldNames([...requiredNames, ...optionalNames]);
  const fields = getOptionalArray(uiFields).map((field, index) => {
    const fieldName = getFieldReferenceWithFallback(field, orderedNames[index]);

    return typeof field === 'string'
      ? {
          kind: 'text',
          label: fieldName || field,
          name: fieldName || field,
        }
      : {
          ...asRecord(field),
          ...(fieldName ? { name: fieldName } : {}),
        };
  });
  const knownNames = new Set(
    fields
      .map(field => getFieldReference(field))
      .filter((field): field is string => Boolean(field)),
  );
  const fallbackFields = orderedNames
    .filter(name => !knownNames.has(name))
    .slice(0, MAX_FALLBACK_FIELDS)
    .map(name => createTextFallbackField(name, requiredNames));

  return [...fields, ...fallbackFields];
};

const getSchemaFields = (schema: unknown) => {
  const schemaRecord = asRecord(schema);
  const directFields = getOptionalArray(schemaRecord.fields);

  if (directFields.length) {
    return directFields;
  }

  const properties = asRecord(schemaRecord.properties);
  const requiredIds = new Set(getOptionalArray(schemaRecord.required));

  return Object.entries(properties).map(([id, property]) => {
    const propertyRecord = asRecord(property);

    return {
      ...propertyRecord,
      id,
      label:
        getOptionalString(propertyRecord.label) ||
        getOptionalString(propertyRecord.title) ||
        id,
      required: requiredIds.has(id) || Boolean(propertyRecord.required),
    };
  });
};

const getFormFields = (payload: Record<string, unknown>) => {
  const rawValue = getRawInterruptValue(payload);
  const formSchema =
    payload.formSchema || rawValue.form_schema || rawValue.formSchema;
  const ui = {
    ...asRecord(rawValue.ui),
    ...asRecord(payload.ui),
  };
  const { optionalNames, requiredNames } = getRequestFieldLists(
    payload,
    rawValue,
  );
  const uiFieldDefinitions = getUiFieldDefinitions(
    ui.fields,
    requiredNames,
    optionalNames,
  );

  return normalizeFields(
    uiFieldDefinitions.length
      ? uiFieldDefinitions
      : payload.fields || rawValue.fields || getSchemaFields(formSchema),
    requiredNames,
  );
};

const getFormTitle = (payload: Record<string, unknown>) => {
  const rawValue = getRawInterruptValue(payload);
  const title =
    getOptionalString(asRecord(payload.ui).title) ||
    getOptionalString(asRecord(rawValue.ui).title) ||
    getOptionalString(rawValue.form_title) ||
    getOptionalString(rawValue.title) ||
    getOptionalString(payload.title) ||
    getOptionalString(rawValue.form_id) ||
    I18N.carbonAgent.fillBelowInfo;

  return /^[a-z0-9_:-]+$/i.test(title) ? I18N.carbonAgent.fillBelowInfo : title;
};

const getFormHelperText = (payload: Record<string, unknown>) => {
  const rawValue = getRawInterruptValue(payload);

  return (
    getOptionalString(asRecord(payload.ui).helper_text) ||
    getOptionalString(asRecord(rawValue.ui).helper_text) ||
    I18N.carbonAgent.submitAtOnce
  );
};

const getFormStatus = (payload: Record<string, unknown>) =>
  getOptionalString(payload.status);

const getInitialCollapsed = (payload: Record<string, unknown>) =>
  Boolean(
    payload.collapsed ||
      payload.defaultCollapsed ||
      payload.formCollapsed ||
      payload.formSubmitted ||
      payload.submitted,
  );

const getFormUi = (payload: Record<string, unknown>) => {
  const rawValue = getRawInterruptValue(payload);

  return {
    ...asRecord(rawValue.ui),
    ...asRecord(payload.ui),
  };
};

const getFormInitialValueSources = (payload: Record<string, unknown>) => {
  const rawValue = getRawInterruptValue(payload);
  const payloadRequest = asRecord(payload.request);
  const rawRequest = asRecord(rawValue.request);

  return [
    asRecord(payload.initial_values),
    asRecord(payload.initialValues),
    asRecord(payload.default_values),
    asRecord(payload.defaultValues),
    asRecord(payload.defaults),
    asRecord(payload.form_data),
    asRecord(payload.formData),
    asRecord(payload.values),
    asRecord(rawValue.initial_values),
    asRecord(rawValue.initialValues),
    asRecord(rawValue.default_values),
    asRecord(rawValue.defaultValues),
    asRecord(rawValue.defaults),
    asRecord(rawValue.form_data),
    asRecord(rawValue.formData),
    asRecord(rawValue.values),
    asRecord(payloadRequest.form_data),
    asRecord(payloadRequest.formData),
    asRecord(payloadRequest.values),
    asRecord(rawRequest.form_data),
    asRecord(rawRequest.formData),
    asRecord(rawRequest.values),
    rawValue,
    payload,
  ].filter(hasRecordValue);
};

const parseCheckboxValue = (value: unknown) =>
  value === true || value === 'true' || value === 1 || value === '1';

const normalizeMultiSelectValue = (field: FormField, value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(item => normalizeChoiceValue(field, item));
  }

  const normalizedValue = normalizeChoiceValue(field, value);

  return normalizedValue ? [normalizedValue] : [];
};

const normalizeInitialScalarValue = (
  field: FormField,
  value: unknown,
): FormValue => {
  if (!hasDefinedValue(value)) {
    return '';
  }

  if (field.type === 'checkbox') {
    return parseCheckboxValue(value);
  }

  if (field.type === 'multi_select') {
    return normalizeMultiSelectValue(field, value);
  }

  if (field.type === 'single_select') {
    return normalizeChoiceValue(field, value);
  }

  if (field.type === 'number' && typeof value === 'number') {
    return value;
  }

  return getOptionalPrimitiveString(value) || '';
};

const getInitialFieldValue = (
  field: FormField,
  valueSources: Record<string, unknown>[],
) => {
  if (hasDefinedValue(field.defaultValue)) {
    return field.defaultValue;
  }

  const aliases = getFieldAliases(field.id);
  const matchedValue = valueSources.reduce<unknown>((currentValue, source) => {
    if (hasDefinedValue(currentValue)) {
      return currentValue;
    }

    return getRecordValueByAlias(source, aliases);
  }, undefined);

  return hasDefinedValue(matchedValue) ? matchedValue : undefined;
};

const getMaterialEstimatedValue = (row: Record<string, unknown>) => {
  const explicitValue = getRecordValueByAlias(
    row,
    MATERIAL_FIELD_ALIASES.estimated,
  );

  if (hasDefinedValue(explicitValue)) {
    return explicitValue;
  }

  const dataQuality = getOptionalPrimitiveString(row.data_quality);
  const source = getOptionalPrimitiveString(row.source);

  if (
    dataQuality?.toLowerCase() === 'estimated' ||
    source?.toLowerCase() === 'estimated'
  ) {
    return true;
  }

  return undefined;
};

const normalizeTableRowColumns = (
  field: FormField,
  row: Record<string, unknown>,
) =>
  field.columns.reduce<FormValues>((nextRow, column) => {
    const aliases = isMaterialTable(field)
      ? MATERIAL_FIELD_ALIASES[column.id] || [column.id]
      : [column.id];
    const value =
      column.id === 'estimated' && isMaterialTable(field)
        ? getMaterialEstimatedValue(row)
        : getRecordValueByAlias(row, aliases);

    return hasDefinedValue(value)
      ? {
          ...nextRow,
          [column.id]: normalizeInitialScalarValue(column, value),
        }
      : nextRow;
  }, {});

const normalizeTableValue = (field: FormField, value: unknown) =>
  getOptionalArray(value).map((row, index) => {
    const rowRecord = asRecord(row);

    return {
      ...createInitialValues(field.columns),
      ...rowRecord,
      ...normalizeTableRowColumns(field, rowRecord),
      [TABLE_ROW_KEY]:
        getOptionalString(rowRecord[TABLE_ROW_KEY]) || `initial_${index + 1}`,
    };
  });

const createInitialValues = (
  fields: FormField[],
  valueSources: Record<string, unknown>[] = [],
): FormValues => {
  const values = fields.reduce<FormValues>((currentValues, field) => {
    const nextValues = { ...currentValues };
    const initialValue = getInitialFieldValue(field, valueSources);

    if (field.type === 'subform') {
      nextValues[field.id] = createInitialValues(
        field.subfields,
        hasRecordValue(initialValue) ? [asRecord(initialValue)] : [],
      );
    } else if (field.type === 'table') {
      nextValues[field.id] = normalizeTableValue(field, initialValue);
    } else if (field.type === 'checkbox') {
      nextValues[field.id] = parseCheckboxValue(initialValue);
    } else if (field.type === 'multi_select') {
      nextValues[field.id] = normalizeMultiSelectValue(field, initialValue);
    } else {
      nextValues[field.id] =
        initialValue === null || initialValue === undefined
          ? ''
          : normalizeInitialScalarValue(field, initialValue);
    }

    if (field.allowEstimated) {
      nextValues[getEstimatedFieldId(field.id)] = false;
    }

    return nextValues;
  }, {});

  // Legacy product forms stored free text in the choice field. Migrate only
  // after all siblings are initialized so their order cannot overwrite it.
  fields.forEach(field => {
    if (field.type !== 'single_select' || !isFunctionalUnitChoiceField(field))
      return;

    const value = values[field.id];
    if (
      typeof value !== 'string' ||
      !value.trim() ||
      optionsWithUnknown(field, field.allowUnknown).some(
        option => option.value === value,
      )
    )
      return;

    const customField = fields.find(isCustomFunctionalUnitField);
    const customOption = field.options.find(option =>
      isCustomOptionValue(option.value),
    );
    const originalValue = getInitialFieldValue(field, valueSources);
    if (!customField || !customOption || typeof originalValue !== 'string')
      return;

    const existingCustomValue = getInitialFieldValue(customField, valueSources);
    values[field.id] = customOption.value;
    values[customField.id] =
      typeof existingCustomValue === 'string' && existingCustomValue.trim()
        ? existingCustomValue
        : originalValue;
  });

  return values;
};

const asFormValues = (value: unknown): FormValues =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as FormValues)
    : {};

const asFormValueArray = (value: FormValue | undefined): FormValues[] =>
  Array.isArray(value) ? value.map(asFormValues) : [];

const asStringArray = (value: FormValue | undefined): string[] =>
  Array.isArray(value)
    ? (value as unknown[]).filter(
        (item): item is string => typeof item === 'string',
      )
    : [];

const getInputDisplayValue = (value: FormValue | undefined) =>
  value === undefined || value === null || typeof value === 'object'
    ? ''
    : String(value);

const getValueAtPath = (
  values: FormValues,
  path: FormPath,
): FormValue | undefined =>
  path.reduce<FormValue | undefined>((currentValue, key) => {
    if (
      currentValue === undefined ||
      currentValue === null ||
      typeof currentValue !== 'object'
    ) {
      return undefined;
    }

    if (Array.isArray(currentValue)) {
      return currentValue[Number(key)];
    }

    return currentValue[String(key)];
  }, values as FormValue);

const shouldHideFieldForValues = (
  field: FormField,
  siblingFields: FormField[],
  values: FormValues,
  parentPath: FormPath = [],
) => {
  const customFunctionalUnitController = getCustomFunctionalUnitController(
    field,
    siblingFields,
  );

  if (customFunctionalUnitController) {
    return !isCustomOptionSelected(
      getValueAtPath(values, [
        ...parentPath,
        customFunctionalUnitController.id,
      ]),
    );
  }

  const lifecycleBoundaryController = getLifecycleBoundaryController(
    field,
    siblingFields,
  );

  if (lifecycleBoundaryController) {
    return !isCustomOptionSelected(
      getValueAtPath(values, [...parentPath, lifecycleBoundaryController.id]),
    );
  }

  return false;
};

const isCustomDependentField = (field: FormField, siblingFields: FormField[]) =>
  Boolean(
    getCustomFunctionalUnitController(field, siblingFields) ||
      getLifecycleBoundaryController(field, siblingFields),
  );

const shouldSkipFieldInSubmission = (
  field: FormField,
  siblingFields: FormField[],
  values: FormValues,
) =>
  isCustomFunctionalUnitField(field) &&
  shouldHideFieldForValues(field, siblingFields, values);

const getFormFieldPlaceholder = (field: FormField) =>
  field.placeholder ||
  (isCustomFunctionalUnitField(field)
    ? I18N.carbonAgent.customFunctionalUnitPlaceholder
    : undefined);

const getSiblingFieldsForParentPath = (
  fields: FormField[],
  parentPath: FormPath,
): FormField[] => {
  if (!parentPath.length) {
    return fields;
  }

  const [fieldId, nextSegment, ...restPath] = parentPath;
  const parentField = fields.find(field => field.id === fieldId);

  if (!parentField) {
    return fields;
  }

  if (parentField.type === 'subform') {
    return getSiblingFieldsForParentPath(
      parentField.subfields,
      [nextSegment, ...restPath].filter(segment => segment !== undefined),
    );
  }

  if (parentField.type === 'table') {
    return typeof nextSegment === 'number'
      ? getSiblingFieldsForParentPath(parentField.columns, restPath)
      : parentField.columns;
  }

  return fields;
};

const setValueInContainer = (
  container: FormValue | FormValues | undefined,
  path: FormPath,
  value: FormValue,
): FormValue | FormValues => {
  const [currentKey, ...restPath] = path;

  if (currentKey === undefined) {
    return container || {};
  }

  if (!restPath.length) {
    if (Array.isArray(container)) {
      const nextItems = [...container] as FormValues[];
      nextItems[Number(currentKey)] = value as FormValues;

      return nextItems;
    }

    return {
      ...asFormValues(container as FormValue | undefined),
      [String(currentKey)]: value,
    };
  }

  if (Array.isArray(container)) {
    const nextItems = [...container] as FormValues[];
    nextItems[Number(currentKey)] = setValueInContainer(
      nextItems[Number(currentKey)],
      restPath,
      value,
    ) as FormValues;

    return nextItems;
  }

  const record = asFormValues(container as FormValue | undefined);

  return {
    ...record,
    [String(currentKey)]: setValueInContainer(
      record[String(currentKey)],
      restPath,
      value,
    ) as FormValue,
  };
};

const setValueAtPath = (
  values: FormValues,
  path: FormPath,
  value: FormValue,
): FormValues => setValueInContainer(values, path, value) as FormValues;

const isEmptyValue = (value: FormValue | undefined) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'boolean') {
    return false;
  }

  if (typeof value === 'number') {
    return false;
  }

  if (typeof value === 'string') {
    return !value.trim();
  }

  return !Object.keys(asFormValues(value)).length;
};

const getFieldValidationError = (
  field: FormField,
  value: FormValue | undefined,
) => {
  if (field.type === 'checkbox') {
    return field.required && typeof value !== 'boolean'
      ? I18N.carbonAgent.checkRequiredField
      : '';
  }

  if (field.required && isEmptyValue(value)) {
    return I18N.carbonAgent.fillRequiredField;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    return '';
  }

  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return '';
  }

  if (field.allowUnknown && trimmedValue === 'unknown') {
    return '';
  }

  if (field.type === 'number') {
    const numberValue = Number(trimmedValue);

    if (
      !Number.isFinite(numberValue) ||
      (field.integer && !Number.isSafeInteger(numberValue))
    ) {
      return I18N.carbonAgent.enterValidNumber;
    }

    if (field.min !== undefined && numberValue < field.min) {
      return I18N.template(I18N.carbonAgent.numberMin, { val1: field.min });
    }

    if (field.max !== undefined && numberValue > field.max) {
      return I18N.template(I18N.carbonAgent.numberMax, { val1: field.max });
    }
  }

  if (field.minLength && trimmedValue.length < field.minLength) {
    return I18N.template(I18N.carbonAgent.minCharsField, {
      val1: field.minLength,
    });
  }

  if (field.maxLength && trimmedValue.length > field.maxLength) {
    return I18N.template(I18N.carbonAgent.maxCharsField, {
      val1: field.maxLength,
    });
  }

  if (field.pattern) {
    try {
      if (!new RegExp(field.pattern).test(trimmedValue)) {
        return I18N.carbonAgent.formatIncorrect;
      }
    } catch {
      return '';
    }
  }

  return '';
};

const validateFields = (
  fields: FormField[],
  values: FormValues,
  parentPath: FormPath = [],
) =>
  fields.reduce<Record<string, string>>((errors, field) => {
    const path = [...parentPath, field.id];
    const value = getValueAtPath(values, path);

    if (shouldHideFieldForValues(field, fields, values, parentPath)) {
      return errors;
    }

    if (field.type === 'subform') {
      return {
        ...errors,
        ...validateFields(field.subfields, values, path),
      };
    }

    if (field.type === 'table') {
      const rows = asFormValueArray(value);
      const tableError =
        field.required && rows.length === 0
          ? {
              [getPathKey(path)]: I18N.carbonAgent.fillAtLeastOneRow,
            }
          : {};
      const rowErrors = rows.reduce<Record<string, string>>(
        (nextErrors, _row, rowIndex) => ({
          ...nextErrors,
          ...validateFields(field.columns, values, [...path, rowIndex]),
        }),
        {},
      );

      return {
        ...errors,
        ...tableError,
        ...rowErrors,
      };
    }

    const validationError = getFieldValidationError(field, value);

    if (validationError) {
      return {
        ...errors,
        [getPathKey(path)]: validationError,
      };
    }

    return errors;
  }, {});

const normalizeNumberValue = (value: string) => {
  const trimmedValue = value.trim();
  const numberValue = Number(trimmedValue);

  return trimmedValue && !Number.isNaN(numberValue)
    ? numberValue
    : trimmedValue;
};

const normalizeSubmitValue = (
  field: FormField,
  value: FormValue | undefined,
): unknown => {
  if (field.type === 'subform') {
    return buildFormSubmission(field.subfields, asFormValues(value));
  }

  if (field.type === 'table') {
    return asFormValueArray(value)
      .map(row => buildFormSubmission(field.columns, asFormValues(row)))
      .filter(row => Object.keys(row).length > 0);
  }

  const decodeOption = (item: string) => {
    const option = field.options.find(candidate => candidate.value === item);
    return option?.rawValue ?? item;
  };
  if (field.type === 'multi_select') {
    return asStringArray(value).map(decodeOption);
  }
  if (field.type === 'single_select' && typeof value === 'string')
    return decodeOption(value);

  if (typeof value !== 'string') {
    return value;
  }

  return field.type === 'number' ? normalizeNumberValue(value) : value.trim();
};

function buildFormSubmission(fields: FormField[], values: FormValues) {
  return fields.reduce<Record<string, unknown>>((submission, field) => {
    if (shouldSkipFieldInSubmission(field, fields, values)) {
      return submission;
    }

    const value = normalizeSubmitValue(field, values[field.id]);
    const shouldSubmit =
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && !value.length) &&
      !isEmptyRecordValue(value);

    if (!shouldSubmit) {
      return submission;
    }

    const nextSubmission = {
      ...submission,
      [field.id]: value,
    };

    return field.allowEstimated &&
      values[getEstimatedFieldId(field.id)] === true
      ? {
          ...nextSubmission,
          [`${field.id}_estimated`]: true,
        }
      : nextSubmission;
  }, {});
}

const getDisplayOptionLabel = (field: FormField, value: unknown) => {
  const optionValue = getOptionalPrimitiveString(value);

  if (!optionValue) {
    return '';
  }

  return (
    getOptionsWithCurrentValue(field, optionValue).find(
      option =>
        getOptionKey(option.value) === getOptionKey(optionValue) ||
        getOptionKey(option.label) === getOptionKey(optionValue),
    )?.label || optionValue
  );
};

const getDisplayValue = (field: FormField, value: FormValue | undefined) => {
  if (field.type === 'multi_select' && Array.isArray(value)) {
    return asStringArray(value)
      .map(item => getDisplayOptionLabel(field, item))
      .filter(Boolean)
      .join('、');
  }

  if (typeof value === 'boolean') {
    return value ? I18N.carbonAgent.yes : I18N.carbonAgent.no;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (typeof value !== 'string') {
    return '';
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return '';
  }

  return field.options.length
    ? getDisplayOptionLabel(field, trimmedValue)
    : trimmedValue;
};

const buildTableRowDisplayValue = (columns: FormField[], row: FormValues) =>
  columns
    .map(column => {
      const displayValue = getDisplayValue(column, row[column.id]);

      return displayValue ? `${column.label}：${displayValue}` : '';
    })
    .filter(Boolean)
    .join('；');

const buildFormMessageLines = (
  fields: FormField[],
  values: FormValues,
  parentLabel = '',
): string[] =>
  fields.flatMap(field => {
    if (shouldSkipFieldInSubmission(field, fields, values)) {
      return [];
    }

    const value = values[field.id];

    if (field.type === 'subform') {
      return buildFormMessageLines(
        field.subfields,
        asFormValues(value),
        field.label,
      );
    }

    if (field.type === 'table') {
      return asFormValueArray(value)
        .map((row, rowIndex) => {
          const rowLabel = I18N.template(I18N.carbonAgent.rowNumberLabel, {
            val1: field.label,
            val2: rowIndex + 1,
          });
          const rowValue = buildTableRowDisplayValue(
            field.columns,
            asFormValues(row),
          );

          return rowValue
            ? I18N.template(I18N.carbonAgent.messageLine, {
                val1: rowLabel,
                val2: rowValue,
                val3: '',
              })
            : '';
        })
        .filter(Boolean);
    }

    const displayValue = getDisplayValue(field, value);

    if (!displayValue) {
      return [];
    }

    const label = parentLabel ? `${parentLabel} - ${field.label}` : field.label;
    const estimatedText =
      field.allowEstimated && values[getEstimatedFieldId(field.id)] === true
        ? I18N.carbonAgent.estimatedValueParen
        : '';

    return I18N.template(I18N.carbonAgent.messageLine, {
      val1: label,
      val2: displayValue,
      val3: estimatedText,
    });
  });

const buildFormSubmitMessage = (fields: FormField[], values: FormValues) =>
  buildFormMessageLines(fields, values).join('\n');

const cloneRecord = (record: Record<string, unknown>) =>
  JSON.parse(JSON.stringify(record)) as Record<string, unknown>;

type ResumeDataPathSegment = string | number;

const normalizeFormDataPathSegment = (segment: unknown) => {
  if (typeof segment === 'number') {
    return Number.isFinite(segment) ? segment : undefined;
  }

  return getOptionalPrimitiveString(segment);
};

const normalizeFormDataPath = (path: unknown): ResumeDataPathSegment[] => {
  if (Array.isArray(path)) {
    return path
      .map(normalizeFormDataPathSegment)
      .filter(
        (segment): segment is ResumeDataPathSegment => segment !== undefined,
      );
  }

  const pathString = getOptionalString(path);

  if (!pathString) {
    return [];
  }

  return pathString
    .replace(/^\$\.?/, '')
    .replace(/\[([^\]]+)\]/g, '.$1')
    .split('.')
    .map(segment => segment.trim().replace(/^['"]|['"]$/g, ''))
    .filter(Boolean);
};

const isPathContainer = (
  value: unknown,
): value is Record<string, unknown> | unknown[] =>
  Boolean(value) && typeof value === 'object';

const getPathContainerValue = (
  container: Record<string, unknown> | unknown[],
  segment: ResumeDataPathSegment,
) =>
  Array.isArray(container) ? container[Number(segment)] : container[segment];

const setPathContainerValue = (
  container: Record<string, unknown> | unknown[],
  segment: ResumeDataPathSegment,
  value: unknown,
) => {
  if (Array.isArray(container)) {
    container[Number(segment)] = value;
    return;
  }

  container[segment] = value;
};

const setValueByPath = (
  target: Record<string, unknown>,
  path: ResumeDataPathSegment[],
  value: unknown,
) => {
  if (!path.length) {
    return;
  }

  let current: Record<string, unknown> | unknown[] = target;

  path.slice(0, -1).forEach((segment, index) => {
    const child = getPathContainerValue(current, segment);
    const nextSegment = path[index + 1];

    if (isPathContainer(child)) {
      current = child;
      return;
    }

    const nextChild = typeof nextSegment === 'number' ? [] : {};

    setPathContainerValue(current, segment, nextChild);
    current = nextChild;
  });

  setPathContainerValue(current, path[path.length - 1], value);
};

const findFieldPath = (
  target: unknown,
  fieldName: string,
  parentPath: ResumeDataPathSegment[] = [],
): ResumeDataPathSegment[] => {
  if (!isPathContainer(target)) {
    return [];
  }

  if (Array.isArray(target)) {
    for (let index = 0; index < target.length; index += 1) {
      const foundPath = findFieldPath(target[index], fieldName, [
        ...parentPath,
        index,
      ]);

      if (foundPath.length) {
        return foundPath;
      }
    }

    return [];
  }

  if (Object.prototype.hasOwnProperty.call(target, fieldName)) {
    return [...parentPath, fieldName];
  }

  return Object.entries(target).reduce<ResumeDataPathSegment[]>(
    (matchedPath, [key, value]) =>
      matchedPath.length
        ? matchedPath
        : findFieldPath(value, fieldName, [...parentPath, key]),
    [],
  );
};

const getFormSubmissionPath = (
  requestTemplate: Record<string, unknown>,
  interruptId?: string,
) => {
  const formDataPath = normalizeFormDataPath(requestTemplate.formDataPath);

  if (formDataPath.length) {
    return formDataPath;
  }

  const existingFormSubmissionPath = findFieldPath(
    requestTemplate,
    'form_submission',
  );

  if (existingFormSubmissionPath.length) {
    return existingFormSubmissionPath;
  }

  return interruptId
    ? ['resumeData', interruptId, 'form_submission']
    : ['resumeData', 'form_submission'];
};

const buildSubmitPayload = (
  payload: Record<string, unknown>,
  formSubmission: Record<string, unknown>,
  message: string,
): AgentFormRequestSubmitPayload => {
  const resumeRequest = asRecord(payload.resumeRequest);
  const submitTemplate = asRecord(resumeRequest.submit);
  const hasSubmitTemplate = hasRecordValue(submitTemplate);
  const requestTemplate = hasSubmitTemplate ? cloneRecord(submitTemplate) : {};
  const interruptId = getFirstInterruptId(payload, requestTemplate);
  const baseMessage =
    message ||
    getOptionalString(requestTemplate.message) ||
    getOptionalString(payload.formSubmitLabel) ||
    getOptionalString(asRecord(payload.ui).submit_label) ||
    I18N.carbonAgent.continueModeling;

  if (hasSubmitTemplate) {
    const submitPayload = cloneRecord(submitTemplate);
    const submitInterruptId = getFirstInterruptId(payload, submitPayload);
    const formSubmissionPath = getFormSubmissionPath(
      submitPayload,
      submitInterruptId,
    );

    delete submitPayload.formDataPath;
    setValueByPath(submitPayload, formSubmissionPath, formSubmission);
    submitPayload.message = baseMessage;

    return submitPayload;
  }

  return {
    action: getOptionalString(requestTemplate.action) || 'form_submit',
    checkpoint: payload.checkpoint,
    message: baseMessage,
    resumeData: interruptId
      ? {
          [interruptId]: {
            form_submission: formSubmission,
          },
        }
      : {
          form_submission: formSubmission,
        },
    resumeEventId: interruptId,
  };
};

const buildCancelPayload = (payload: Record<string, unknown>) => {
  const resumeRequest = asRecord(payload.resumeRequest);
  const cancelRequest = asRecord(resumeRequest.cancel);
  const hasCancelTemplate = hasRecordValue(cancelRequest);
  const interruptId = getFirstInterruptId(payload, cancelRequest);
  const message =
    getOptionalString(cancelRequest.message) ||
    getOptionalString(asRecord(payload.ui).cancel_label) ||
    I18N.carbonAgent.cancelModeling;

  if (hasCancelTemplate) {
    return cloneRecord(cancelRequest);
  }

  return {
    action: getOptionalString(cancelRequest.action) || 'form_cancel',
    checkpoint: payload.checkpoint,
    message,
    resumeData: interruptId
      ? {
          [interruptId]: {
            cancelled: true,
            reason: 'user_cancelled',
          },
        }
      : {
          cancelled: true,
          reason: 'user_cancelled',
        },
    resumeEventId: interruptId,
  };
};

const FormRequestCard = ({
  card,
  submitting = false,
  onSubmit,
}: FormRequestCardProps) => {
  const payload = useMemo(() => getFormPayload(card), [card]);
  const locked =
    !onSubmit ||
    submitting ||
    payload.formSubmitted === true ||
    payload.submitted === true;
  const fields = useMemo(() => getFormFields(payload), [payload]);
  const initialValueSources = useMemo(
    () => getFormInitialValueSources(payload),
    [payload],
  );
  const formKey = `${getOptionalString(payload.resumeEventId) || ''}-${fields
    .map(field => field.id)
    .join('-')}`;
  const ui = getFormUi(payload);
  const [collapsed, setCollapsed] = useState(() =>
    getInitialCollapsed(payload),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [values, setValues] = useState<FormValues>(() =>
    createInitialValues(fields, initialValueSources),
  );

  useEffect(() => {
    setValues(createInitialValues(fields, initialValueSources));
    setFieldErrors({});
    setCollapsed(getInitialCollapsed(payload));
  }, [fields, formKey, initialValueSources, payload]);

  const getPresetKey = (field: FormField | undefined, value: FormValue) => {
    const raw =
      field?.options.find(option => option.value === value)?.rawValue ?? value;
    return ['string', 'number', 'boolean'].includes(typeof raw)
      ? String(raw)
      : '';
  };
  const getLinkedValuePath = (
    field: FormField | undefined,
    path: FormPath,
    value: FormValue,
  ) => {
    const linkedField = field?.linkedField;
    const linkedPresets = field?.linkedPresets;
    const presetKey = getPresetKey(field, value);

    return linkedField &&
      linkedPresets &&
      presetKey !== 'custom' &&
      Array.isArray(linkedPresets[presetKey])
      ? [...path.slice(0, -1), linkedField]
      : undefined;
  };

  const updateValue = (path: FormPath, value: FormValue, field?: FormField) => {
    if (locked) return;
    const errorKey = getPathKey(path);
    const linkedPath = getLinkedValuePath(field, path, value);
    const parentPath = path.slice(0, -1);
    const siblingFields = getSiblingFieldsForParentPath(fields, parentPath);
    const resetPaths =
      field &&
      isFunctionalUnitChoiceField(field) &&
      !isCustomOptionSelected(value)
        ? siblingFields
            .filter(isCustomFunctionalUnitField)
            .map(dependentField => [...parentPath, dependentField.id])
        : [];

    setValues(prevValues => {
      const nextValues = setValueAtPath(prevValues, path, value);
      const presetKey = getPresetKey(field, value);
      const linkedValues =
        linkedPath && field?.linkedPresets
          ? field.linkedPresets[presetKey]
          : undefined;

      const linkedDefinition = siblingFields.find(
        candidate => candidate.id === field?.linkedField,
      );
      const normalizedLinkedValues =
        linkedDefinition && Array.isArray(linkedValues)
          ? normalizeMultiSelectValue(linkedDefinition, linkedValues)
          : linkedValues;
      const nextLinkedValues =
        linkedPath && Array.isArray(linkedValues)
          ? setValueAtPath(nextValues, linkedPath, [
              ...(normalizedLinkedValues || []),
            ])
          : nextValues;

      return resetPaths.reduce(
        (currentValues, resetPath) =>
          setValueAtPath(currentValues, resetPath, ''),
        nextLinkedValues,
      );
    });
    setFieldErrors(prevErrors => {
      const linkedErrorKey = linkedPath ? getPathKey(linkedPath) : '';
      const resetErrorKeys = resetPaths.map(getPathKey);

      if (
        !prevErrors[errorKey] &&
        !prevErrors[linkedErrorKey] &&
        !resetErrorKeys.some(resetErrorKey => prevErrors[resetErrorKey])
      ) {
        return prevErrors;
      }

      const nextErrors = { ...prevErrors };
      delete nextErrors[errorKey];
      delete nextErrors[linkedErrorKey];
      resetErrorKeys.forEach(resetErrorKey => {
        delete nextErrors[resetErrorKey];
      });

      return nextErrors;
    });
  };

  const updateTextValue = (field: FormField, path: FormPath, value: string) => {
    updateValue(
      path,
      field.maxLength ? value.slice(0, field.maxLength) : value,
      field,
    );
  };

  const getTableRows = (path: FormPath) => {
    const value = getValueAtPath(values, path);

    return asFormValueArray(value);
  };

  const addTableRow = (field: FormField, path: FormPath) => {
    updateValue(path, [
      ...getTableRows(path),
      {
        ...createInitialValues(field.columns),
        [TABLE_ROW_KEY]: createTableRowKey(),
      },
    ]);
  };

  const removeTableRow = (path: FormPath, rowIndex: number) => {
    updateValue(
      path,
      getTableRows(path).filter((_, index) => index !== rowIndex),
    );
  };

  const fillUnknownValue = (field: FormField, path: FormPath) => {
    updateValue(
      path,
      field.type === 'multi_select' ? ['unknown'] : 'unknown',
      field,
    );
  };

  const toggleEstimatedValue = (path: FormPath, checked: boolean) => {
    const [fieldId, ...restPath] = [...path].reverse();

    updateValue(
      [...restPath.reverse(), getEstimatedFieldId(String(fieldId))],
      checked,
    );
  };

  const handleSubmit = () => {
    if (locked) {
      return;
    }

    const nextErrors = validateFields(fields, values);
    const formSubmission = buildFormSubmission(fields, values);
    const normalizedFormSubmission = isCbamExecutionOptionsForm(payload)
      ? {
          ...formSubmission,
          confirmed: true,
        }
      : formSubmission;
    const submitMessage = buildFormSubmitMessage(fields, values);

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      scrollFirstErrorIntoView(nextErrors);
      return;
    }

    setCollapsed(true);
    onSubmit?.(
      buildSubmitPayload(payload, normalizedFormSubmission, submitMessage),
    );
  };

  const handleCancel = () => {
    if (locked) {
      return;
    }

    setCollapsed(true);
    onSubmit?.(buildCancelPayload(payload));
  };

  const renderField = (
    field: FormField,
    path: FormPath,
    displayIndex?: number,
    siblingFields: FormField[] = fields,
  ) => {
    const pathKey = getPathKey(path);
    const labelId = `${pathKey}-label`;
    const checkboxId = `${pathKey}-checkbox`;
    const estimatedId = `${pathKey}-estimated`;
    const value = getValueAtPath(values, path);
    const error = fieldErrors[pathKey];
    const textValue = getInputDisplayValue(value);
    const parentPath = path.slice(0, -1);
    const hidden = shouldHideFieldForValues(
      field,
      siblingFields,
      values,
      parentPath,
    );

    if (hidden) {
      return null;
    }

    const estimatedPath = [
      ...path.slice(0, -1),
      getEstimatedFieldId(String(path[path.length - 1])),
    ];
    const estimatedValue = getValueAtPath(values, estimatedPath);
    const fieldOptions = getOptionsWithCurrentValue(field, value);
    const shouldRenderTextInput =
      field.type !== 'textarea' &&
      field.type !== 'multi_select' &&
      field.type !== 'checkbox' &&
      field.type !== 'table' &&
      !(field.type === 'single_select' && fieldOptions.length);
    const showTextCounter =
      Boolean(field.maxLength) &&
      (field.type === 'textarea' || shouldRenderTextInput) &&
      field.type !== 'number';
    const showFieldUnit = Boolean(field.unit && shouldRenderTextInput);
    const showFieldExtras = field.allowUnknown || field.allowEstimated;
    const showFieldMeta = showFieldExtras || showTextCounter;
    const customDependentField = isCustomDependentField(field, siblingFields);
    const unknownSelected =
      field.type === 'multi_select'
        ? asStringArray(value).includes('unknown')
        : textValue === 'unknown';

    if (field.type === 'subform') {
      return (
        <fieldset
          className={style.formRequestSubform}
          id={getFieldContainerId(pathKey)}
          key={pathKey}
        >
          <legend>
            <span>{field.label}</span>
            {field.required ? (
              <b className={style.followUpRequired}>
                {I18N.carbonAgent.required}
              </b>
            ) : (
              <b className={style.followUpOptional}>
                {I18N.carbonAgent.optional}
              </b>
            )}
          </legend>
          {field.description ? (
            <p className={style.formRequestHint}>{field.description}</p>
          ) : null}
          <div className={style.formRequestGrid}>
            {field.subfields.map((subfield, index) =>
              renderField(
                subfield,
                [...path, subfield.id],
                index + 1,
                field.subfields,
              ),
            )}
          </div>
        </fieldset>
      );
    }

    if (field.type === 'table') {
      const rows = getTableRows(path);

      return (
        <div
          className={classNames(
            style.formRequestField,
            style.formRequestFieldWide,
            {
              [style.formRequestFieldError]: Boolean(error),
            },
          )}
          id={getFieldContainerId(pathKey)}
          key={pathKey}
        >
          <div className={style.formRequestLabel} id={labelId}>
            <span>
              {displayIndex ? `${displayIndex}. ` : ''}
              {field.label}
            </span>
            {field.required ? <b>{I18N.carbonAgent.required}</b> : null}
          </div>
          {field.description ? (
            <p className={style.formRequestHint}>{field.description}</p>
          ) : null}
          <div className={style.formRequestTableWrap}>
            <table className={style.formRequestTable}>
              <thead>
                <tr>
                  {field.columns.map(column => (
                    <th key={column.id}>
                      {column.label}
                      {column.required ? <b> *</b> : null}
                    </th>
                  ))}
                  <th aria-label={I18N.carbonAgent.operation} />
                </tr>
              </thead>
              <tbody>
                {rows.map((row, rowIndex) => (
                  <tr
                    key={
                      getOptionalString(row[TABLE_ROW_KEY]) ||
                      `${pathKey}-${JSON.stringify(row)}`
                    }
                  >
                    {field.columns.map(column => (
                      <td
                        className={style.formRequestTableCell}
                        key={column.id}
                      >
                        {renderField(
                          column,
                          [...path, rowIndex, column.id],
                          undefined,
                          field.columns,
                        )}
                      </td>
                    ))}
                    <td className={style.formRequestTableActionCell}>
                      <button
                        className={style.formRequestTableAction}
                        disabled={locked}
                        type='button'
                        onClick={() => removeTableRow(path, rowIndex)}
                      >
                        {I18N.carbonAgent.delete}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!rows.length ? (
              <div className={style.formRequestTableEmpty}>
                {I18N.carbonAgent.noData}
              </div>
            ) : null}
          </div>
          <button
            className={style.formRequestTableAdd}
            disabled={locked}
            type='button'
            onClick={() => addTableRow(field, path)}
          >
            {I18N.carbonAgent.addRow}
          </button>
          {error ? (
            <span className={style.followUpErrorText}>{error}</span>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className={classNames(style.formRequestField, {
          [style.formRequestFieldWide]:
            field.type === 'textarea' || customDependentField,
          [style.formRequestFieldError]: Boolean(error),
        })}
        id={getFieldContainerId(pathKey)}
        key={pathKey}
      >
        <div className={style.formRequestLabel} id={labelId}>
          <span>
            {displayIndex ? `${displayIndex}. ` : ''}
            {field.label}
          </span>
          {field.required ? <b>{I18N.carbonAgent.required}</b> : null}
        </div>
        {field.description ? (
          <p className={style.formRequestHint}>{field.description}</p>
        ) : null}

        {field.type === 'textarea' ? (
          <textarea
            disabled={locked}
            className={style.formRequestTextarea}
            id={pathKey}
            value={textValue}
            maxLength={field.maxLength}
            minLength={field.minLength}
            placeholder={getFormFieldPlaceholder(field)}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
            onChange={event => updateTextValue(field, path, event.target.value)}
          />
        ) : null}

        {field.type === 'single_select' && fieldOptions.length ? (
          <Select<string>
            disabled={locked}
            className={style.formRequestSelect}
            id={pathKey}
            value={textValue || undefined}
            options={fieldOptions}
            placeholder={field.placeholder || I18N.carbonAgent.pleaseSelect}
            allowClear={!field.required}
            showSearch
            optionFilterProp='label'
            status={error ? 'error' : undefined}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
            notFoundContent={I18N.carbonAgent.noData}
            onChange={nextValue => updateValue(path, nextValue ?? '', field)}
          />
        ) : null}

        {field.type === 'multi_select' ? (
          <Select<string[]>
            disabled={locked}
            className={style.formRequestSelect}
            id={pathKey}
            mode='multiple'
            value={asStringArray(value)}
            options={fieldOptions}
            placeholder={field.placeholder || I18N.carbonAgent.pleaseSelect}
            allowClear
            maxTagCount='responsive'
            showSearch
            optionFilterProp='label'
            status={error ? 'error' : undefined}
            aria-labelledby={labelId}
            aria-invalid={Boolean(error)}
            notFoundContent={I18N.carbonAgent.noData}
            onChange={nextValues => updateValue(path, nextValues, field)}
          />
        ) : null}

        {field.type === 'checkbox' ? (
          <label className={style.formRequestCheckbox} htmlFor={checkboxId}>
            <input
              disabled={locked}
              id={checkboxId}
              type='checkbox'
              checked={value === true}
              aria-labelledby={labelId}
              aria-invalid={Boolean(error)}
              onChange={event => updateValue(path, event.target.checked, field)}
            />
            <span>{field.placeholder || I18N.carbonAgent.yes}</span>
          </label>
        ) : null}

        {shouldRenderTextInput ? (
          <div className={style.formRequestInputRow}>
            <input
              disabled={locked}
              className={style.formRequestControl}
              id={pathKey}
              inputMode={
                field.type === 'number' && textValue !== 'unknown'
                  ? 'decimal'
                  : undefined
              }
              max={field.type === 'number' ? field.max : undefined}
              maxLength={field.type === 'number' ? undefined : field.maxLength}
              min={field.type === 'number' ? field.min : undefined}
              minLength={field.type === 'number' ? undefined : field.minLength}
              pattern={field.type === 'number' ? undefined : field.pattern}
              type={
                field.type === 'number' && textValue !== 'unknown'
                  ? 'number'
                  : 'text'
              }
              value={textValue}
              placeholder={getFormFieldPlaceholder(field)}
              aria-labelledby={labelId}
              aria-invalid={Boolean(error)}
              onChange={event =>
                updateTextValue(field, path, event.target.value)
              }
            />
            {showFieldUnit ? (
              <span className={style.formRequestUnit}>{field.unit}</span>
            ) : null}
          </div>
        ) : null}

        {showFieldMeta ? (
          <div
            className={classNames(style.formRequestFieldMeta, {
              [style.formRequestFieldMetaOnlyCounter]: !showFieldExtras,
            })}
          >
            {showFieldExtras ? (
              <div className={style.formRequestFieldExtras}>
                {field.allowUnknown ? (
                  <button
                    className={classNames(style.formRequestUnknownButton, {
                      [style.formRequestUnknownButtonActive]: unknownSelected,
                    })}
                    type='button'
                    aria-label={`${field.label}${
                      unknownSelected
                        ? I18N.carbonAgent.markedUnknown
                        : I18N.carbonAgent.notSure
                    }`}
                    title={I18N.carbonAgent.cannotDetermineHint}
                    onClick={() => fillUnknownValue(field, path)}
                  >
                    {unknownSelected
                      ? I18N.carbonAgent.markedUnknown
                      : I18N.carbonAgent.notSure}
                  </button>
                ) : null}
                {field.allowEstimated ? (
                  <label
                    className={style.formRequestEstimated}
                    htmlFor={estimatedId}
                  >
                    <input
                      disabled={locked}
                      id={estimatedId}
                      type='checkbox'
                      checked={estimatedValue === true}
                      onChange={event =>
                        toggleEstimatedValue(path, event.target.checked)
                      }
                    />
                    <span>{I18N.carbonAgent.estimatedValueShort}</span>
                  </label>
                ) : null}
              </div>
            ) : null}
            {showTextCounter ? (
              <span
                className={classNames(style.formRequestCounter, {
                  [style.formRequestCounterLimit]:
                    textValue.length >= Number(field.maxLength),
                })}
              >
                {textValue.length}/{field.maxLength}
              </span>
            ) : null}
          </div>
        ) : null}

        {error ? (
          <span className={style.followUpErrorText}>{error}</span>
        ) : null}
      </div>
    );
  };

  if (payload.formName === ACCOUNTING_PURPOSE_FORM) {
    return (
      <EnterpriseAccountingPurposeForm
        key={String(payload.resumeEventId || card.messageId)}
        ui={{
          ...ui,
          initial_values: payload.accountingPurposeDraft || ui.initial_values,
        }}
        receipt={asRecord(payload.accountingPurposeConfirmation)}
        disabled={locked}
        submitting={submitting}
        onSubmit={(value, message) =>
          onSubmit?.(buildSubmitPayload(payload, value, message))
        }
        onCancel={() => onSubmit?.(buildCancelPayload(payload))}
      />
    );
  }

  if (isCbamExecutionOptionsForm(payload)) {
    const defaultPolicyField = fields.find(
      field =>
        ['defaultpolicy', 'default_policy'].includes(getOptionKey(field.id)) ||
        /默认值.*策略|default.*policy/i.test(field.label),
    );
    const deliverableField = fields.find(
      field =>
        [
          'deliverabletype',
          'deliverable_type',
          'executionplan',
          'execution_plan',
        ].includes(getOptionKey(field.id)) ||
        /执行计划|execution plan/i.test(field.label),
    );

    if (defaultPolicyField && deliverableField) {
      const defaultPolicyValue = getInputDisplayValue(
        getValueAtPath(values, [defaultPolicyField.id]),
      );
      const deliverableValue = getInputDisplayValue(
        getValueAtPath(values, [deliverableField.id]),
      );
      const defaultPolicyOptions = getOptionsWithCurrentValue(
        defaultPolicyField,
        defaultPolicyValue,
      );
      const deliverableOptions = getOptionsWithCurrentValue(
        deliverableField,
        deliverableValue,
      );
      const uiFields: CbamExecutionField[] = fields
        .filter(
          field =>
            field.id !== defaultPolicyField.id &&
            field.id !== deliverableField.id,
        )
        .map(field => {
          const value = getInputDisplayValue(
            getValueAtPath(values, [field.id]),
          );

          return {
            error: fieldErrors[field.id],
            id: field.id,
            label: field.label,
            options: getOptionsWithCurrentValue(field, value),
            required: field.required,
            value,
          };
        });

      return (
        <CbamNextActionForm
          businessAssessment={getCbamExecutionDetails(
            payload,
            'business_assessment',
          )}
          businessInformation={getCbamExecutionDetails(
            payload,
            'business_information',
          )}
          collapsed={collapsed}
          defaultPolicyError={fieldErrors[defaultPolicyField.id]}
          defaultPolicyOptions={defaultPolicyOptions}
          defaultPolicyValue={defaultPolicyValue}
          deliverableError={fieldErrors[deliverableField.id]}
          deliverableOptions={deliverableOptions}
          recommendedDeliverableValue={deliverableField.recommended}
          deliverableValue={deliverableValue}
          disabled={locked}
          submitting={submitting}
          onDefaultPolicyChange={value =>
            updateValue([defaultPolicyField.id], value, defaultPolicyField)
          }
          onDeliverableChange={value =>
            updateValue([deliverableField.id], value, deliverableField)
          }
          onFieldChange={(id, value) => {
            const field = fields.find(item => item.id === id);

            if (field) {
              updateValue([id], value, field);
            }
          }}
          onSubmit={handleSubmit}
          onToggleCollapsed={() =>
            setCollapsed(prevCollapsed => !prevCollapsed)
          }
          uiFields={uiFields}
        />
      );
    }
  }

  return (
    <section
      className={style.formRequestCard}
      aria-label={getFormTitle(payload)}
    >
      <header className={style.formRequestHeader}>
        <div className={style.formRequestTitle}>
          <span>{getFormTitle(payload)}</span>
          {getFormHelperText(payload) ? (
            <span>{getFormHelperText(payload)}</span>
          ) : null}
        </div>
        <div className={style.formRequestHeaderActions}>
          {getFormStatus(payload) ? (
            <span className={style.formRequestStatus}>
              {getFormStatus(payload)}
            </span>
          ) : null}
          <button
            className={style.followUpToggle}
            type='button'
            aria-expanded={!collapsed}
            aria-label={
              collapsed
                ? I18N.carbonAgent.expandSupplementInfo
                : I18N.carbonAgent.collapseSupplementInfo
            }
            onClick={() => setCollapsed(prevCollapsed => !prevCollapsed)}
          >
            <Icon
              className={classNames(style.followUpToggleIcon, {
                [style.followUpToggleIconCollapsed]: collapsed,
              })}
              src={icons.chevronIcon}
            />
          </button>
        </div>
      </header>

      {!collapsed ? (
        <div className={style.formRequestPanel}>
          <div className={style.formRequestBody}>
            {fields.map((field, index) =>
              renderField(field, [field.id], index + 1),
            )}
          </div>

          <footer className={style.formRequestFooter}>
            <button
              className={style.followUpSkip}
              type='button'
              disabled={locked}
              onClick={handleCancel}
            >
              {getOptionalString(ui.cancel_label) ||
                I18N.carbonAgent.cancelModeling}
            </button>
            <button
              className={style.followUpSubmit}
              type='button'
              disabled={locked}
              aria-busy={submitting}
              onClick={handleSubmit}
            >
              <Icon
                className={style.followUpSuccessIcon}
                src={icons.successIcon}
              />
              <span>
                {submitting
                  ? I18N.carbonAgent.submitting
                  : getOptionalString(ui.submit_label) ||
                    I18N.carbonAgent.continueModeling}
              </span>
            </button>
          </footer>
        </div>
      ) : null}
    </section>
  );
};

export default FormRequestCard;
