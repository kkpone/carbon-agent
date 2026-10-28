import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import classNames from 'classnames';
import { useId, useRef, useState } from 'react';

import style from './EnterpriseAccountingPurposeForm.module.less';
import { purposeRecord } from '../accountingPurpose';
import agentStyle from '../index.module.less';

type PurposeOption = {
  value: string;
  label: string;
  requiresText?: boolean;
  maxLength?: number;
  children?: PurposeOption[];
};

const OTHER_MAX_LENGTH = 200;

type Props = {
  ui: Record<string, unknown>;
  receipt: Record<string, unknown>;
  disabled: boolean;
  submitting: boolean;
  onSubmit: (value: Record<string, unknown>, message: string) => void;
  onCancel: () => void;
};

const PURPOSE_OPTION_LABELS = createI18nLabelMap<string, string>({
  INTERNAL_MANAGEMENT: () =>
    I18N.carbonAgent.accountingPurposeInternalManagement,
  CERTIFICATION_AUDIT: () =>
    I18N.carbonAgent.accountingPurposeCertificationAudit,
  DISCLOSURE: () => I18N.carbonAgent.accountingPurposeDisclosure,
  REDUCTION_MANAGEMENT: () =>
    I18N.carbonAgent.accountingPurposeReductionManagement,
  SUPPLY_CHAIN: () => I18N.carbonAgent.accountingPurposeSupplyChain,
  REGULATORY_COMPLIANCE: () =>
    I18N.carbonAgent.accountingPurposeRegulatoryCompliance,
  NEUTRALITY_OFFSET: () => I18N.carbonAgent.accountingPurposeNeutralityOffset,
  FIRST_INVENTORY: () => I18N.carbonAgent.accountingPurposeFirstInventory,
  EMISSIONS_STRUCTURE: () =>
    I18N.carbonAgent.accountingPurposeEmissionsStructure,
  BUDGET_ASSESSMENT: () => I18N.carbonAgent.accountingPurposeBudgetAssessment,
  ISO_14064_1: () => I18N.carbonAgent.accountingPurposeIso140641,
  THIRD_PARTY_GHG_VERIFICATION: () =>
    I18N.carbonAgent.accountingPurposeThirdPartyGhgVerification,
  CARBON_NEUTRAL_CERTIFICATION: () =>
    I18N.carbonAgent.accountingPurposeCarbonNeutralCertification,
  ESG_REPORT: () => I18N.carbonAgent.accountingPurposeEsgReport,
  CDP: () => I18N.carbonAgent.accountingPurposeCdp,
  EXCHANGE_DISCLOSURE: () =>
    I18N.carbonAgent.accountingPurposeExchangeDisclosure,
  ISSB: () => I18N.carbonAgent.accountingPurposeIssb,
  SBTI: () => I18N.carbonAgent.accountingPurposeSbti,
  ANNUAL_TARGET: () => I18N.carbonAgent.accountingPurposeAnnualTarget,
  INTERNAL_CARBON_MANAGEMENT: () =>
    I18N.carbonAgent.accountingPurposeInternalCarbonManagement,
  ENERGY_SAVING: () => I18N.carbonAgent.accountingPurposeEnergySaving,
  CUSTOMER_QUESTIONNAIRE: () =>
    I18N.carbonAgent.accountingPurposeCustomerQuestionnaire,
  SUPPLIER_DATA: () => I18N.carbonAgent.accountingPurposeSupplierData,
  SCOPE_3: () => I18N.carbonAgent.accountingPurposeScope3,
  GREEN_PROCUREMENT: () => I18N.carbonAgent.accountingPurposeGreenProcurement,
  NATIONAL_CARBON_MARKET: () =>
    I18N.carbonAgent.accountingPurposeNationalCarbonMarket,
  LOCAL_CARBON_MARKET: () =>
    I18N.carbonAgent.accountingPurposeLocalCarbonMarket,
  MANDATORY_REPORTING: () =>
    I18N.carbonAgent.accountingPurposeMandatoryReporting,
  KEY_EMITTER_ACCOUNTING: () =>
    I18N.carbonAgent.accountingPurposeKeyEmitterAccounting,
  CORPORATE_NEUTRALITY: () =>
    I18N.carbonAgent.accountingPurposeCorporateNeutrality,
  PARK_NEUTRALITY: () => I18N.carbonAgent.accountingPurposeParkNeutrality,
  EVENT_NEUTRALITY: () => I18N.carbonAgent.accountingPurposeEventNeutrality,
  OTHER: () => I18N.carbonAgent.accountingPurposeOther,
});

const getPurposeOptionLabel = (
  option?: PurposeOption,
  fallbackValue?: unknown,
) => {
  const value = option?.value || String(fallbackValue || '');
  return PURPOSE_OPTION_LABELS[value] || option?.label || value;
};

const EnterpriseAccountingPurposeForm = ({
  ui,
  receipt,
  disabled,
  submitting,
  onSubmit,
  onCancel,
}: Props) => {
  const initial = purposeRecord(ui.initial_values);
  const [primaryCode, setPrimaryCode] = useState(
    String(initial.primaryCode || ''),
  );
  const [secondaryCode, setSecondaryCode] = useState(
    String(initial.secondaryCode || ''),
  );
  const [otherText, setOtherText] = useState(String(initial.otherText || ''));
  const [step, setStep] = useState(initial.primaryCode ? 2 : 1);
  const [collapsed, setCollapsed] = useState(false);
  const [error, setError] = useState('');
  const radioName = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const options = (
    Array.isArray(ui.options) ? ui.options : []
  ) as PurposeOption[];
  const confirmed = receipt.status === 'CONFIRMED';
  const cancelled = receipt.status === 'CANCELLED';
  const terminal = confirmed || cancelled;
  const saved = purposeRecord(receipt.value);
  const selectedPrimary = options.find(
    option => option.value === (confirmed ? saved.primaryCode : primaryCode),
  );
  const selectedSecondary = selectedPrimary?.children?.find(
    option =>
      option.value === (confirmed ? saved.secondaryCode : secondaryCode),
  );
  const locked = disabled || submitting || terminal;
  const title = I18N.carbonAgent.accountingPurposeTitle;
  let status = I18N.carbonAgent.statusToConfirm;
  if (confirmed) {
    status = I18N.carbonAgent.accountingPurposeStatusConfirmed;
  } else if (cancelled) {
    status = I18N.carbonAgent.accountingPurposeStatusCancelled;
  }
  const selectedPrimaryLabel = getPurposeOptionLabel(
    selectedPrimary,
    confirmed ? saved.primaryCode : primaryCode,
  );
  const selectedSecondaryLabel = getPurposeOptionLabel(
    selectedSecondary,
    confirmed ? saved.secondaryCode : secondaryCode,
  );
  const selectPrimary = (value: string) => {
    if (primaryCode !== value) {
      setSecondaryCode('');
      setOtherText('');
    }
    setPrimaryCode(value);
    setStep(2);
    setError('');
    // 切换步骤后将焦点留在表单内，方便键盘用户继续选择。
    requestAnimationFrame(() => headingRef.current?.focus());
  };
  const handleSubmit = () => {
    if (locked) return;
    if (!selectedPrimary || !selectedSecondary) {
      setError(I18N.carbonAgent.accountingPurposeRequired);
      return;
    }
    const text = otherText.trim();
    if (
      selectedSecondary.requiresText &&
      (!text || text.length > OTHER_MAX_LENGTH)
    ) {
      setError(
        I18N.template(I18N.carbonAgent.accountingPurposeOtherRequired, {
          val1: OTHER_MAX_LENGTH,
        }),
      );
      return;
    }
    setError('');
    const otherSummary = selectedSecondary.requiresText
      ? I18N.template(I18N.carbonAgent.accountingPurposeOtherSummary, {
          val1: text,
        })
      : '';
    onSubmit(
      {
        primaryCode,
        secondaryCode,
        otherText: selectedSecondary.requiresText ? text : null,
      },
      I18N.template(I18N.carbonAgent.accountingPurposeSubmissionSummary, {
        val1: selectedPrimaryLabel,
        val2: selectedSecondaryLabel,
        val3: otherSummary,
      }),
    );
  };

  return (
    <section className={agentStyle.actionRequestCard} aria-label={title}>
      <div className={agentStyle.actionRequestCardSurface}>
        <header className={agentStyle.actionRequestHeader}>
          <div>
            <h3>{I18N.carbonAgent.needConfirmExecution}</h3>
            <p>{I18N.carbonAgent.accountingPurposePrompt}</p>
          </div>
          <div className={agentStyle.actionRequestHeaderActions}>
            <span>{status}</span>
            <button
              type='button'
              className={agentStyle.actionRequestToggle}
              aria-label={
                collapsed
                  ? I18N.carbonAgent.accountingPurposeExpand
                  : I18N.carbonAgent.accountingPurposeCollapse
              }
              aria-expanded={!collapsed}
              onClick={() => setCollapsed(!collapsed)}
            >
              <span
                className={classNames(agentStyle.actionRequestToggleIcon, {
                  [agentStyle.actionRequestToggleIconCollapsed]: collapsed,
                })}
                aria-hidden='true'
              />
            </button>
          </div>
        </header>
        {!collapsed && (
          <>
            <div className={agentStyle.actionRequestList}>
              <article className={agentStyle.actionRequestItem}>
                <div className={agentStyle.actionRequestToolName}>
                  <span>
                    {terminal ? status : I18N.carbonAgent.aboutToExecute}
                  </span>
                  <strong>{title}</strong>
                </div>
                <div className={style.body}>
                  {terminal ? (
                    <p className={style.summary}>
                      {confirmed
                        ? `${selectedPrimaryLabel} / ${selectedSecondaryLabel}${
                            saved.otherText
                              ? I18N.template(
                                  I18N.carbonAgent
                                    .accountingPurposeOtherSummary,
                                  { val1: String(saved.otherText) },
                                )
                              : ''
                          }`
                        : I18N.carbonAgent.accountingPurposeCancelledSummary}
                    </p>
                  ) : (
                    <>
                      <h3
                        tabIndex={-1}
                        ref={headingRef}
                        className={style.stepTitle}
                      >
                        {step === 1
                          ? I18N.carbonAgent.accountingPurposeChoosePrimary
                          : selectedPrimaryLabel}
                      </h3>
                      <fieldset
                        className={style.options}
                        disabled={locked}
                        aria-label={
                          step === 1
                            ? I18N.carbonAgent.accountingPurposePrimaryField
                            : I18N.carbonAgent.accountingPurposeSecondaryField
                        }
                      >
                        {(step === 1
                          ? options
                          : selectedPrimary?.children || []
                        ).map(option => (
                          <div
                            className={classNames(style.option, {
                              [style.optionSelected]:
                                (step === 1 ? primaryCode : secondaryCode) ===
                                option.value,
                              [style.optionWithInput]:
                                step === 2 &&
                                option.requiresText &&
                                secondaryCode === option.value,
                            })}
                            key={option.value}
                          >
                            <label
                              htmlFor={`${radioName}-${step}-${option.value}`}
                            >
                              <input
                                id={`${radioName}-${step}-${option.value}`}
                                type='radio'
                                name={`${radioName}-${step}`}
                                value={option.value}
                                checked={
                                  (step === 1 ? primaryCode : secondaryCode) ===
                                  option.value
                                }
                                onClick={() => {
                                  if (
                                    step === 1 &&
                                    primaryCode === option.value
                                  ) {
                                    selectPrimary(option.value);
                                  }
                                }}
                                onChange={() => {
                                  if (step === 1) {
                                    selectPrimary(option.value);
                                    return;
                                  }
                                  setSecondaryCode(option.value);
                                  if (!option.requiresText) setOtherText('');
                                  setError('');
                                }}
                              />
                              <span>{getPurposeOptionLabel(option)}</span>
                            </label>
                            {step === 2 &&
                              option.requiresText &&
                              secondaryCode === option.value && (
                                <>
                                  <textarea
                                    className={style.otherInput}
                                    rows={2}
                                    aria-label={
                                      I18N.carbonAgent
                                        .accountingPurposeOtherDescription
                                    }
                                    placeholder={I18N.carbonAgent.pleaseEnter}
                                    value={otherText}
                                    maxLength={OTHER_MAX_LENGTH}
                                    aria-describedby={`${radioName}-other-count`}
                                    disabled={locked}
                                    aria-invalid={!!error}
                                    onChange={event => {
                                      setOtherText(event.target.value);
                                      setError('');
                                    }}
                                  />
                                  <span
                                    id={`${radioName}-other-count`}
                                    className={style.otherCount}
                                  >
                                    {otherText.length} / {OTHER_MAX_LENGTH}
                                  </span>
                                </>
                              )}
                          </div>
                        ))}
                      </fieldset>
                      {!options.length && (
                        <p role='alert'>
                          {I18N.carbonAgent.accountingPurposeOptionsUnavailable}
                        </p>
                      )}
                      {step === 2 && (
                        <button
                          type='button'
                          className={style.back}
                          disabled={locked}
                          onClick={() => {
                            setStep(1);
                            setError('');
                          }}
                        >
                          〈 {I18N.carbonAgent.back}
                        </button>
                      )}
                      {error && (
                        <p className={style.error} role='alert'>
                          {error}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </article>
            </div>
            {!terminal && (
              <footer className={agentStyle.actionRequestActions}>
                <button
                  type='button'
                  className={agentStyle.actionRequestSecondaryButton}
                  disabled={locked}
                  onClick={onCancel}
                >
                  {I18N.carbonAgent.accountingPurposeCancel}
                </button>
                <button
                  type='button'
                  className={agentStyle.actionRequestPrimaryButton}
                  disabled={locked || !options.length}
                  aria-busy={submitting}
                  onClick={handleSubmit}
                >
                  {submitting
                    ? I18N.carbonAgent.submitting
                    : I18N.carbonAgent.confirmExecution}
                </button>
              </footer>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default EnterpriseAccountingPurposeForm;
