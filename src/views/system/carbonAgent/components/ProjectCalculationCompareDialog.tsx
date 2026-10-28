import calculationIcon from '@src/assets/images/carbonAgent/icons/project-compare-calculation.svg';
import closeIcon from '@src/assets/images/carbonAgent/icons/project-compare-dialog-close.svg';
import selectedIcon from '@src/assets/images/carbonAgent/icons/project-compare-selected.svg';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import style from '../index.module.less';
import mobileStyle from './ProjectCalculationCompareDialog.mobile.module.less';
import {
  type AgentProjectCalculation,
  type AgentProjectCalculationComparison,
  compareAgentProjectCalculations,
} from '../service';

type ProjectCalculationCompareDialogProps = {
  calculations: AgentProjectCalculation[];
  initialAccountIds?: Array<number | string>;
  onCancel: () => void;
  onCompared: (
    comparison: AgentProjectCalculationComparison,
    accountIds: Array<number | string>,
  ) => void;
  open: boolean;
  projectId: string;
};

const MIN_CALCULATION_COUNT = 2;
const MAX_CALCULATION_COUNT = 4;

const getCalculationName = (calculation: AgentProjectCalculation) =>
  calculation.snapshot?.accountName?.trim() ||
  calculation.snapshot?.productName?.trim() ||
  I18N.template(I18N.carbonAgent.projectCalculationWithId, {
    val1: calculation.accountId,
  });

const getCalculationMeta = (calculation: AgentProjectCalculation) => {
  const type =
    calculation.snapshot?.accountType === 1
      ? I18N.carbonAgent.projectComparisonProcessCalculation
      : I18N.carbonAgent.projectComparisonQuickCalculation;
  const updateTime =
    calculation.snapshot?.updateTime || calculation.updateTime || '';
  const shortUpdateTime = updateTime
    ? updateTime.slice(5, 16).replace(' ', '  ')
    : '';

  return [type, shortUpdateTime].filter(Boolean).join(' · ');
};

const getEmissionUnit = (calculation: AgentProjectCalculation) => {
  const factorUnit = calculation.snapshot?.factorUnit?.trim();

  return factorUnit?.split('/')[0] || 'kgCO₂e';
};

const getInitialSelectedIds = (
  calculations: AgentProjectCalculation[],
  initialAccountIds: Array<number | string>,
) => {
  const availableCalculations = calculations.filter(
    calculation => calculation.available,
  );
  const requestedIds = initialAccountIds
    .map(accountId =>
      availableCalculations.find(
        calculation => String(calculation.accountId) === String(accountId),
      ),
    )
    .filter((calculation): calculation is AgentProjectCalculation =>
      Boolean(calculation),
    );
  const selectedCalculations = [
    ...requestedIds,
    ...availableCalculations,
  ].filter(
    (calculation, index, items) =>
      items.findIndex(
        item => String(item.accountId) === String(calculation.accountId),
      ) === index,
  );

  return selectedCalculations
    .slice(0, Math.max(MIN_CALCULATION_COUNT, requestedIds.length))
    .slice(0, MAX_CALCULATION_COUNT)
    .map(calculation => calculation.accountId);
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const requestError = error as {
    data?: { msg?: unknown };
    message?: unknown;
    response?: { data?: { msg?: unknown } };
  };
  const responseData = requestError.response?.data || requestError.data;

  if (typeof responseData?.msg === 'string' && responseData.msg.trim()) {
    return responseData.msg;
  }

  return typeof requestError.message === 'string' && requestError.message.trim()
    ? requestError.message
    : fallback;
};

const ProjectCalculationCompareDialog = ({
  calculations,
  initialAccountIds = [],
  onCancel,
  onCompared,
  open,
  projectId,
}: ProjectCalculationCompareDialogProps) => {
  const availableCalculations = useMemo(
    () => calculations.filter(calculation => calculation.available),
    [calculations],
  );
  const initialAccountIdsKey = initialAccountIds.map(String).join(',');
  const [selectedAccountIds, setSelectedAccountIds] = useState<
    Array<number | string>
  >([]);
  const [selectionError, setSelectionError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedAccountIds(
      getInitialSelectedIds(
        calculations,
        initialAccountIdsKey ? initialAccountIdsKey.split(',') : [],
      ),
    );
    setSelectionError('');
    setSubmitting(false);
    setSubmitError('');
  }, [calculations, initialAccountIdsKey, open, projectId]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onCancel();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open, submitting]);

  if (!open) {
    return null;
  }

  const selectedIdSet = new Set(selectedAccountIds.map(String));
  const canSubmit =
    selectedAccountIds.length >= MIN_CALCULATION_COUNT && !submitting;

  const handleCalculationToggle = (calculation: AgentProjectCalculation) => {
    const accountId = String(calculation.accountId);

    setSelectionError('');
    setSubmitError('');

    if (selectedIdSet.has(accountId)) {
      setSelectedAccountIds(currentIds =>
        currentIds.filter(currentId => String(currentId) !== accountId),
      );
      return;
    }

    if (selectedAccountIds.length >= MAX_CALCULATION_COUNT) {
      setSelectionError(I18N.carbonAgent.projectComparisonMaximumReached);
      return;
    }

    setSelectedAccountIds(currentIds => [...currentIds, calculation.accountId]);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    try {
      const comparison = await compareAgentProjectCalculations(projectId, {
        accountIds: selectedAccountIds,
        dimension: 'lifecycle_stage',
      });

      onCompared(comparison, selectedAccountIds);
    } catch (error) {
      setSubmitError(
        getRequestErrorMessage(
          error,
          I18N.carbonAgent.projectComparisonLoadFailed,
        ),
      );
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className={classNames(
        style.projectComparisonDialogBackdrop,
        mobileStyle.backdrop,
      )}
    >
      <button
        className={style.projectComparisonDialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={submitting}
        onClick={onCancel}
      />
      <section
        className={classNames(
          style.projectComparisonDialog,
          mobileStyle.dialog,
        )}
        role='dialog'
        aria-modal='true'
        aria-labelledby='carbon-agent-project-comparison-dialog-title'
        aria-busy={submitting}
      >
        <header
          className={classNames(
            style.projectComparisonDialogHeader,
            mobileStyle.header,
          )}
        >
          <div>
            <h2 id='carbon-agent-project-comparison-dialog-title'>
              {I18N.carbonAgent.multiCalculationComparison}
            </h2>
            <p>{I18N.carbonAgent.projectComparisonDialogHint}</p>
          </div>
          <button
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={submitting}
            onClick={onCancel}
          >
            <img src={closeIcon} alt='' aria-hidden='true' />
          </button>
        </header>

        <div
          className={classNames(
            style.projectComparisonDialogBody,
            mobileStyle.body,
          )}
        >
          <div
            className={classNames(
              style.projectComparisonChoiceGrid,
              mobileStyle.grid,
            )}
          >
            {availableCalculations.map(calculation => {
              const selected = selectedIdSet.has(String(calculation.accountId));

              return (
                <button
                  className={classNames(
                    selected
                      ? style.projectComparisonChoiceSelected
                      : style.projectComparisonChoice,
                    mobileStyle.choice,
                  )}
                  type='button'
                  key={String(calculation.accountId)}
                  aria-pressed={selected}
                  disabled={submitting}
                  onClick={() => handleCalculationToggle(calculation)}
                >
                  <span className={style.projectComparisonChoiceIcon}>
                    <img
                      src={selected ? selectedIcon : calculationIcon}
                      alt=''
                      aria-hidden='true'
                    />
                  </span>
                  <span className={style.projectComparisonChoiceContent}>
                    <strong>{getCalculationName(calculation)}</strong>
                    <small>{getCalculationMeta(calculation)}</small>
                    <b>
                      {calculation.snapshot?.totalEmission || '--'}{' '}
                      {getEmissionUnit(calculation)}
                    </b>
                  </span>
                </button>
              );
            })}
          </div>

          {!availableCalculations.length ? (
            <div className={style.projectComparisonDialogEmpty}>
              {I18N.carbonAgent.projectCalculationsEmpty}
            </div>
          ) : null}

          <div
            className={classNames(
              style.projectComparisonDialogStatus,
              mobileStyle.status,
            )}
          >
            <span>
              {I18N.template(I18N.carbonAgent.projectComparisonSelectedCount, {
                val1: selectedAccountIds.length,
              })}
            </span>
            {selectionError || submitError ? (
              <em role='alert'>{selectionError || submitError}</em>
            ) : null}
          </div>
        </div>

        <footer
          className={classNames(
            style.projectComparisonDialogFooter,
            mobileStyle.footer,
          )}
        >
          <button
            className={classNames(
              style.projectComparisonDialogCancel,
              mobileStyle.cancel,
            )}
            type='button'
            disabled={submitting}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={classNames(
              style.projectComparisonDialogConfirm,
              mobileStyle.confirm,
            )}
            type='button'
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting
              ? I18N.carbonAgent.projectComparisonStarting
              : I18N.carbonAgent.projectComparisonStart}
          </button>
        </footer>
      </section>
    </div>,
    document.body,
  );
};

export default ProjectCalculationCompareDialog;
