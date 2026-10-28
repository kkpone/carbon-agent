import classNames from 'classnames';

import Icon from './Icon';
import style from './CbamNextActionForm.module.less';
import { icons } from '../constants';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export const CBAM_NEXT_ACTION_FORM_TITLE = 'cbam_next_action';
export const CBAM_EXECUTION_OPTIONS_FORM_TITLE = 'cbam_execution_options';

export type CbamNextActionOption = {
  disabled?: boolean;
  disabledReason?: string;
  label: string;
  value: string;
};

export type CbamExecutionDetail = {
  key: string;
  label?: string;
  value: string;
};

export type CbamExecutionField = {
  error?: string;
  id: string;
  label: string;
  options: CbamNextActionOption[];
  required?: boolean;
  value: string;
};

type CbamNextActionFormProps = {
  collapsed: boolean;
  defaultPolicyError?: string;
  defaultPolicyOptions: CbamNextActionOption[];
  defaultPolicyValue: string;
  businessAssessment: CbamExecutionDetail[];
  businessInformation: CbamExecutionDetail[];
  deliverableError?: string;
  deliverableOptions: CbamNextActionOption[];
  deliverableValue: string;
  disabled?: boolean;
  submitting?: boolean;
  onDefaultPolicyChange: (value: string) => void;
  onDeliverableChange: (value: string) => void;
  onFieldChange: (id: string, value: string) => void;
  onSubmit: () => void;
  onToggleCollapsed: () => void;
  recommendedDeliverableValue?: string;
  uiFields: CbamExecutionField[];
};

const DEFAULT_POLICY_LABELS = createI18nLabelMap<string, string>({
  all_default: () => I18N.carbonAgent.cbamDefaultPolicyAll,
  all_measured: () => I18N.carbonAgent.cbamDefaultPolicyMeasured,
  precursor_default: () => I18N.carbonAgent.cbamDefaultPolicyPrecursor,
});

const DELIVERABLE_LABELS = createI18nLabelMap<string, string>({
  monitoring_plan: () => I18N.carbonAgent.cbamDeliverableMonitoring,
  operator_communication_template: () =>
    I18N.carbonAgent.cbamDeliverableCommunication,
  operator_emission_report: () =>
    I18N.carbonAgent.cbamDeliverableEmissionReport,
  verification_package: () => I18N.carbonAgent.cbamDeliverableVerification,
});

const DETAIL_LABELS = createI18nLabelMap<string, string>({
  business_actions: () => I18N.carbonAgent.cbamBusinessActions,
  businessStatus: () => I18N.carbonAgent.cbamBusinessStatus,
  business_status: () => I18N.carbonAgent.cbamBusinessStatus,
  current_carbon_tax: () => I18N.carbonAgent.cbamCurrentCarbonTax,
  currentTax: () => I18N.carbonAgent.cbamCurrentCarbonTax,
  hasScenarioComparison: () => I18N.carbonAgent.cbamScenarioComparison,
  material_actions: () => I18N.carbonAgent.cbamMaterialActions,
  policyAdvice: () => I18N.carbonAgent.cbamPolicyAdvice,
  productBoundary: () => I18N.carbonAgent.cbamProductBoundary,
  product_boundary: () => I18N.carbonAgent.cbamProductBoundary,
  recommendation: () => I18N.carbonAgent.cbamRecommendation,
  summary: () => I18N.carbonAgent.cbamAssessmentSummary,
  strategy_recommendations: () => I18N.carbonAgent.cbamStrategyRecommendations,
  warnings: () => I18N.carbonAgent.cbamWarnings,
});

const getDetailLabel = (detail: CbamExecutionDetail) =>
  detail.label || DETAIL_LABELS[detail.key] || detail.key.replace(/_/g, ' ');

const CbamExecutionDetails = ({
  details,
  title,
}: {
  details: CbamExecutionDetail[];
  title: string;
}) =>
  details.length ? (
    <div className={style.cbamNextActionGroup}>
      <div className={style.cbamNextActionLabel}>{title}</div>
      <dl className={style.cbamExecutionDetails}>
        {details.map(detail => (
          <div
            className={classNames(style.cbamExecutionDetail, {
              [style.cbamExecutionDetailHighlight]:
                detail.key === 'currentTax' ||
                detail.key === 'current_carbon_tax',
            })}
            key={detail.key}
          >
            <dt>{getDetailLabel(detail)}</dt>
            <dd>{detail.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  ) : null;

const CbamNextActionForm = ({
  collapsed,
  defaultPolicyError,
  defaultPolicyOptions,
  defaultPolicyValue,
  businessAssessment,
  businessInformation,
  deliverableError,
  deliverableOptions,
  deliverableValue,
  disabled = false,
  submitting = false,
  onDefaultPolicyChange,
  onDeliverableChange,
  onFieldChange,
  onSubmit,
  onToggleCollapsed,
  recommendedDeliverableValue,
  uiFields,
}: CbamNextActionFormProps) => {
  const selectedDeliverableLabel =
    DELIVERABLE_LABELS[deliverableValue] || deliverableValue;

  return (
    <section
      className={style.cbamNextActionCard}
      aria-label={I18N.carbonAgent.cbamNextActionTitle}
    >
      <header className={style.cbamNextActionHeader}>
        <div className={style.cbamNextActionHeaderCopy}>
          <strong>{I18N.carbonAgent.cbamNextActionTitle}</strong>
          <span>{I18N.carbonAgent.cbamNextActionHelper}</span>
        </div>
        <button
          className={style.cbamNextActionToggle}
          type='button'
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? I18N.carbonAgent.expandSupplementInfo
              : I18N.carbonAgent.collapseSupplementInfo
          }
          onClick={onToggleCollapsed}
        >
          <Icon
            className={classNames(style.cbamNextActionToggleIcon, {
              [style.cbamNextActionToggleIconCollapsed]: collapsed,
            })}
            src={icons.chevronIcon}
          />
        </button>
      </header>
      {!collapsed ? (
        <div className={style.cbamNextActionPanel}>
          <CbamExecutionDetails
            details={businessInformation}
            title={I18N.carbonAgent.cbamBusinessInformation}
          />
          <CbamExecutionDetails
            details={businessAssessment}
            title={I18N.carbonAgent.cbamBusinessAssessment}
          />

          <div className={style.cbamNextActionGroup}>
            <div className={style.cbamNextActionLabel}>
              <b aria-hidden='true'>*</b>
              <span>{I18N.carbonAgent.cbamDefaultPolicyLabel}</span>
            </div>
            <div className={style.cbamDefaultPolicyOptions}>
              {defaultPolicyOptions.map(option => {
                const selected = option.value === defaultPolicyValue;

                return (
                  <button
                    className={classNames(style.cbamDefaultPolicyOption, {
                      [style.cbamDefaultPolicyOptionSelected]: selected,
                    })}
                    key={option.value}
                    type='button'
                    aria-pressed={selected}
                    disabled={submitting || option.disabled}
                    title={option.disabledReason}
                    onClick={() => onDefaultPolicyChange(option.value)}
                  >
                    {DEFAULT_POLICY_LABELS[option.value] || option.label}
                  </button>
                );
              })}
            </div>
            {defaultPolicyError ? (
              <span className={style.errorText}>{defaultPolicyError}</span>
            ) : null}
          </div>

          <div className={style.cbamNextActionGroup}>
            <div className={style.cbamNextActionLabel}>
              <b aria-hidden='true'>*</b>
              <span>{I18N.carbonAgent.cbamExecutionPlanLabel}</span>
            </div>
            <div className={style.cbamDeliverableOptions}>
              {deliverableOptions.map(option => {
                const selected = option.value === deliverableValue;

                return (
                  <button
                    className={classNames(style.cbamDeliverableOption, {
                      [style.cbamDeliverableOptionSelected]: selected,
                    })}
                    key={option.value}
                    type='button'
                    aria-pressed={selected}
                    disabled={submitting || option.disabled}
                    title={option.disabledReason}
                    onClick={() => onDeliverableChange(option.value)}
                  >
                    <span className={style.cbamDeliverableOptionTitle}>
                      {DELIVERABLE_LABELS[option.value] || option.label}
                    </span>
                    {selected ||
                    option.value === recommendedDeliverableValue ? (
                      <span className={style.cbamDeliverableOptionMeta}>
                        {selected ? (
                          <em>{I18N.carbonAgent.cbamCurrentGoal}</em>
                        ) : null}
                        {option.value === recommendedDeliverableValue ? (
                          <i>{I18N.carbonAgent.cbamRecommended}</i>
                        ) : null}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
            {deliverableError ? (
              <span className={style.errorText}>{deliverableError}</span>
            ) : null}
          </div>

          {uiFields.map(field => (
            <div className={style.cbamNextActionGroup} key={field.id}>
              <div className={style.cbamNextActionLabel}>
                {field.required ? <b aria-hidden='true'>*</b> : null}
                <span>{field.label}</span>
              </div>
              <div className={style.cbamDefaultPolicyOptions}>
                {field.options.map(option => {
                  const selected = option.value === field.value;

                  return (
                    <button
                      className={classNames(style.cbamDefaultPolicyOption, {
                        [style.cbamDefaultPolicyOptionSelected]: selected,
                      })}
                      key={option.value}
                      type='button'
                      aria-pressed={selected}
                      disabled={submitting || option.disabled}
                      title={option.disabledReason}
                      onClick={() => onFieldChange(field.id, option.value)}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              {field.error ? (
                <span className={style.errorText}>{field.error}</span>
              ) : null}
            </div>
          ))}

          <footer className={style.cbamNextActionFooter}>
            <span>
              {I18N.template(I18N.carbonAgent.cbamWillExecute, {
                val1: selectedDeliverableLabel,
              })}
            </span>
            <button
              type='button'
              disabled={disabled || submitting}
              aria-busy={submitting}
              onClick={onSubmit}
            >
              {submitting
                ? I18N.carbonAgent.submitting
                : I18N.carbonAgent.cbamConfirmNextAction}
            </button>
          </footer>
        </div>
      ) : null}
    </section>
  );
};

export default CbamNextActionForm;
