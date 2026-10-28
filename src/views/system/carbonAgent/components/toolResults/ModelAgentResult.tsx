import { useMemo } from 'react';

import I18N from '@src/lang/I18N';
import style from '../../index.module.less';
import {
  asRecord,
  extractPythonAssignedValue,
  getOptionalArray,
  getOptionalScalarString,
  getOptionalString,
  parsePythonLiteral,
} from './utils';

type ModelAgentOption = {
  label: string;
  value: string;
};

type ModelAgentFormField = {
  defaultValue?: string;
  description?: string;
  fieldName: string;
  label: string;
  options?: ModelAgentOption[];
  placeholder?: string;
  required?: boolean;
  type?: string;
};

type ModelAgentResultData = {
  allowEstimatedValue?: boolean;
  allowUnknown?: boolean;
  description?: string;
  nextAction?: string;
  optionalFields: ModelAgentFormField[];
  requiredFields: ModelAgentFormField[];
  resumeHint?: string;
  riskNotes: string[];
  status?: string;
  submitLabel?: string;
  summary?: string;
  title?: string;
};

const parseModelAgentBoolean = (value: unknown) =>
  typeof value === 'boolean' ? value : undefined;

const normalizeModelAgentOptions = (options: unknown): ModelAgentOption[] => {
  if (!Array.isArray(options)) {
    return [];
  }

  return options
    .map(option => {
      const optionRecord = asRecord(option);
      const label =
        getOptionalScalarString(optionRecord.label) ||
        getOptionalScalarString(optionRecord.value);
      const value =
        getOptionalScalarString(optionRecord.value) ||
        getOptionalScalarString(optionRecord.label);

      return label && value ? { label, value } : undefined;
    })
    .filter(Boolean) as ModelAgentOption[];
};

const normalizeModelAgentField = (
  field: unknown,
): ModelAgentFormField | undefined => {
  const fieldRecord = asRecord(field);
  const fieldName =
    getOptionalString(fieldRecord.field_name) ||
    getOptionalString(fieldRecord.fieldName) ||
    getOptionalString(fieldRecord.id) ||
    getOptionalString(fieldRecord.name) ||
    getOptionalString(fieldRecord.field);

  if (!fieldName) {
    return undefined;
  }

  return {
    defaultValue: getOptionalScalarString(
      fieldRecord.default_value ?? fieldRecord.defaultValue,
    ),
    description: getOptionalString(fieldRecord.description),
    fieldName,
    label:
      getOptionalString(fieldRecord.label) ||
      getOptionalString(fieldRecord.title) ||
      fieldName,
    options: normalizeModelAgentOptions(fieldRecord.options),
    placeholder: getOptionalString(fieldRecord.placeholder),
    required:
      typeof fieldRecord.required === 'boolean'
        ? fieldRecord.required
        : undefined,
    type: getOptionalString(fieldRecord.type),
  };
};

const normalizeModelAgentFields = (fields: unknown) =>
  (Array.isArray(fields) ? fields : [])
    .map(normalizeModelAgentField)
    .filter(Boolean) as ModelAgentFormField[];

const parseModelAgentResult = (result: string): ModelAgentResultData | null => {
  if (!/Returning structured response:/i.test(result)) {
    return null;
  }

  const formRequest = asRecord(
    parsePythonLiteral(extractPythonAssignedValue(result, 'form_request')),
  );
  const requiredFields = normalizeModelAgentFields(
    formRequest.required_fields || formRequest.requiredFields,
  );
  const optionalFields = normalizeModelAgentFields(
    formRequest.optional_fields || formRequest.optionalFields,
  );
  const riskNotes = getOptionalArray(
    parsePythonLiteral(extractPythonAssignedValue(result, 'risk_notes')),
  )
    .map(getOptionalScalarString)
    .filter(Boolean) as string[];

  if (!Object.keys(formRequest).length && !riskNotes.length) {
    return null;
  }

  return {
    allowEstimatedValue: parseModelAgentBoolean(
      formRequest.allow_estimated_value ?? formRequest.allowEstimatedValue,
    ),
    allowUnknown: parseModelAgentBoolean(
      formRequest.allow_unknown ?? formRequest.allowUnknown,
    ),
    description: getOptionalString(formRequest.description),
    nextAction: getOptionalString(
      parsePythonLiteral(extractPythonAssignedValue(result, 'next_action')),
    ),
    optionalFields,
    requiredFields,
    resumeHint:
      getOptionalString(formRequest.resume_hint) ||
      getOptionalString(formRequest.resumeHint),
    riskNotes,
    status: getOptionalString(
      parsePythonLiteral(extractPythonAssignedValue(result, 'status')),
    ),
    submitLabel:
      getOptionalString(formRequest.submit_label) ||
      getOptionalString(formRequest.submitLabel),
    summary: getOptionalString(
      parsePythonLiteral(extractPythonAssignedValue(result, 'summary')),
    ),
    title:
      getOptionalString(formRequest.title) ||
      getOptionalString(formRequest.form_title),
  };
};

const getModelAgentFieldTypeLabel = (field: ModelAgentFormField) => {
  const typeLabelMap: Record<string, string> = {
    number: I18N.carbonAgent.fieldTypeNumber,
    select: I18N.carbonAgent.fieldTypeSelect,
    text: I18N.carbonAgent.fieldTypeText,
    textarea: I18N.carbonAgent.fieldTypeTextarea,
  };

  return field.type
    ? typeLabelMap[field.type] || field.type
    : I18N.carbonAgent.fieldTypeDefault;
};

const ModelAgentFieldList = ({
  fields,
  title,
}: {
  fields: ModelAgentFormField[];
  title: string;
}) => {
  if (!fields.length) {
    return null;
  }

  return (
    <div className={style.modelAgentFieldSection}>
      <div className={style.modelAgentFieldSectionTitle}>
        <span>{title}</span>
        <b>
          {I18N.template(I18N.carbonAgent.todoCount, { val1: fields.length })}
        </b>
      </div>
      <div className={style.modelAgentFieldList}>
        {fields.map(field => (
          <article className={style.modelAgentFieldItem} key={field.fieldName}>
            <div className={style.modelAgentFieldHead}>
              <h4>{field.label}</h4>
              <span>{getModelAgentFieldTypeLabel(field)}</span>
            </div>
            <div className={style.modelAgentFieldCode}>
              {field.fieldName}
              {field.required ? <em>*</em> : null}
            </div>
            {field.description ? (
              <p className={style.modelAgentFieldDesc}>{field.description}</p>
            ) : null}
            {field.defaultValue ? (
              <p className={style.modelAgentFieldDefault}>
                {I18N.carbonAgent.defaultValueLabel}
                {field.defaultValue}
              </p>
            ) : null}
            {field.options?.length ? (
              <div className={style.modelAgentOptions}>
                {field.options.slice(0, 4).map(option => (
                  <span key={`${field.fieldName}-${option.value}`}>
                    {option.label}
                  </span>
                ))}
                {field.options.length > 4 ? (
                  <span>+{field.options.length - 4}</span>
                ) : null}
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};

const ModelAgentResult = ({ result }: { result: string }) => {
  const modelResult = useMemo(() => parseModelAgentResult(result), [result]);

  if (!modelResult) {
    return <pre className={style.toolProcessResult}>{result}</pre>;
  }

  const flags = [
    modelResult.allowEstimatedValue
      ? I18N.carbonAgent.allowEstimatedValue
      : undefined,
    modelResult.allowUnknown ? I18N.carbonAgent.allowUnknown : undefined,
    modelResult.submitLabel
      ? I18N.template(I18N.carbonAgent.buttonLabel, {
          val1: modelResult.submitLabel,
        })
      : undefined,
  ].filter(Boolean) as string[];

  return (
    <div className={style.modelAgentResult}>
      <div className={style.modelAgentResultHead}>
        <div>
          <span>{I18N.carbonAgent.modelSubAgentResult}</span>
          {modelResult.title ? <h4>{modelResult.title}</h4> : null}
        </div>
        {modelResult.status ? (
          <b className={style.modelAgentStatus}>{modelResult.status}</b>
        ) : null}
      </div>
      {modelResult.summary ? (
        <p className={style.modelAgentSummary}>{modelResult.summary}</p>
      ) : null}
      {modelResult.nextAction ? (
        <div className={style.modelAgentNextAction}>
          <span>{I18N.carbonAgent.nextStep}</span>
          <p>{modelResult.nextAction}</p>
        </div>
      ) : null}
      {modelResult.description || modelResult.resumeHint || flags.length ? (
        <div className={style.modelAgentHints}>
          {modelResult.description ? (
            <span>{modelResult.description}</span>
          ) : null}
          {modelResult.resumeHint ? (
            <span>{modelResult.resumeHint}</span>
          ) : null}
          {flags.map(flag => (
            <span key={flag}>{flag}</span>
          ))}
        </div>
      ) : null}
      <ModelAgentFieldList
        fields={modelResult.requiredFields}
        title={I18N.carbonAgent.requiredFields}
      />
      <ModelAgentFieldList
        fields={modelResult.optionalFields}
        title={I18N.carbonAgent.optionalFields}
      />
      {modelResult.riskNotes.length ? (
        <div className={style.modelAgentRisk}>
          <span>{I18N.carbonAgent.riskNotes}</span>
          <ul>
            {modelResult.riskNotes.map(note => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default ModelAgentResult;
