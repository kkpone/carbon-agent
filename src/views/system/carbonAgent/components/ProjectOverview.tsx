import projectOverviewBackIcon from '@src/assets/images/carbonAgent/icons/project-overview-back.svg';
import projectOverviewChevronIcon from '@src/assets/images/carbonAgent/icons/project-overview-chevron.svg';
import projectOverviewCompareIcon from '@src/assets/images/carbonAgent/icons/project-overview-compare.svg';
import projectOverviewSessionIcon from '@src/assets/images/carbonAgent/icons/project-overview-session.svg';
import I18N from '@src/lang/I18N';
import { message as antdMessage, Select, Spin } from 'antd';
import classNames from 'classnames';
import { useContext, useEffect, useMemo, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import { PreviewAccountDetail } from './PreviewPane';
import ProjectCalculationCompareDialog from './ProjectCalculationCompareDialog';
import mobileStyle from './ProjectOverview.mobile.module.less';
import ProjectTaskCreateDialog, {
  type ProjectTaskCreateContext,
} from './ProjectTaskCreateDialog';
import style from '../index.module.less';
import {
  type AgentProjectCalculation,
  type AgentProjectCalculationComparison,
  fetchAgentProjectCalculations,
} from '../service';

type ProjectOverviewProps = {
  onBack: () => void;
  onComparisonReady: (
    comparison: AgentProjectCalculationComparison,
    accountIds: Array<number | string>,
    calculations: AgentProjectCalculation[],
  ) => void;
  onConversationOpen: (sessionId: string, title: string) => void;
  projectId: string;
};

const loadProjectCalculations = (projectId: string, signal: AbortSignal) =>
  fetchAgentProjectCalculations(projectId, signal);

const getCalculationName = (calculation: AgentProjectCalculation) =>
  calculation.snapshot?.accountName?.trim() ||
  calculation.snapshot?.productName?.trim() ||
  I18N.template(I18N.carbonAgent.projectCalculationWithId, {
    val1: calculation.accountId,
  });

const normalizeEmissionSourceId = (
  value: number | string | null | undefined,
) => {
  const normalized =
    value === null || value === undefined ? '' : String(value).trim();

  return normalized && normalized !== 'null' && normalized !== 'undefined'
    ? normalized
    : '';
};

const ProjectOverview = ({
  onBack,
  onComparisonReady,
  onConversationOpen,
  projectId,
}: ProjectOverviewProps) => {
  const { locale } = useContext(LocaleContext);
  const [calculations, setCalculations] = useState<AgentProjectCalculation[]>(
    [],
  );
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [comparisonDialogOpen, setComparisonDialogOpen] = useState(false);
  const [taskContext, setTaskContext] = useState<ProjectTaskCreateContext>();

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setCalculations([]);
    setSelectedAccountId('');
    setLoading(true);
    setLoadError(false);

    loadProjectCalculations(projectId, abortController.signal)
      .then(nextCalculations => {
        if (cancelled) {
          return;
        }

        setCalculations(nextCalculations);
        setSelectedAccountId(
          nextCalculations[0] ? String(nextCalculations[0].accountId) : '',
        );
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [projectId, retryKey]);

  const selectedCalculation = calculations.find(
    calculation => String(calculation.accountId) === selectedAccountId,
  );
  const availableCalculations = useMemo(
    () => calculations.filter(calculation => calculation.available),
    [calculations],
  );
  const calculationOptions = calculations.map(calculation => ({
    disabled: !calculation.available,
    label: getCalculationName(calculation),
    value: String(calculation.accountId),
  }));
  const selectedCalculationName = selectedCalculation
    ? getCalculationName(selectedCalculation)
    : '';
  const comparisonInitialAccountIds = useMemo(() => {
    if (!selectedCalculation) {
      return [];
    }

    const comparisonCalculation = availableCalculations.find(
      calculation =>
        String(calculation.accountId) !== String(selectedCalculation.accountId),
    );

    return [
      selectedCalculation.accountId,
      ...(comparisonCalculation ? [comparisonCalculation.accountId] : []),
    ];
  }, [availableCalculations, selectedCalculation]);

  return (
    <section
      className={classNames(style.projectOverviewPage, mobileStyle.root)}
    >
      <header
        className={classNames(style.projectOverviewHeader, mobileStyle.header)}
      >
        <button
          className={style.projectOverviewBack}
          type='button'
          aria-label={I18N.carbonAgent.backToProjectHome}
          onClick={onBack}
        >
          <span className={style.projectOverviewBackIcon} aria-hidden='true'>
            <img src={projectOverviewBackIcon} alt='' width={10} height={6} />
          </span>
          <strong>{I18N.carbonAgent.projectDataOverview}</strong>
        </button>

        <div
          className={classNames(
            style.projectOverviewActions,
            mobileStyle.actions,
          )}
        >
          <Select
            className={classNames(
              style.projectOverviewCalculationSelect,
              mobileStyle.select,
            )}
            disabled={loading || !calculationOptions.length}
            options={calculationOptions}
            popupMatchSelectWidth={false}
            suffixIcon={
              <img
                src={projectOverviewChevronIcon}
                alt=''
                aria-hidden='true'
                width={16}
                height={16}
              />
            }
            value={selectedAccountId || undefined}
            aria-label={I18N.carbonAgent.selectProjectCalculation}
            placeholder={I18N.carbonAgent.selectProjectCalculation}
            onChange={setSelectedAccountId}
          />
          <button
            className={style.projectOverviewSessionButton}
            type='button'
            disabled={!selectedCalculation?.sourceSessionId}
            onClick={() => {
              if (selectedCalculation?.sourceSessionId) {
                onConversationOpen(
                  selectedCalculation.sourceSessionId,
                  selectedCalculationName,
                );
              }
            }}
          >
            <img
              src={projectOverviewSessionIcon}
              alt=''
              aria-hidden='true'
              width={16}
              height={16}
            />
            <span>{I18N.carbonAgent.viewCalculationConversation}</span>
          </button>
          <button
            className={style.projectOverviewCompareButton}
            type='button'
            disabled={
              !selectedCalculation || comparisonInitialAccountIds.length < 2
            }
            onClick={() => {
              if (selectedCalculation) {
                setComparisonDialogOpen(true);
              }
            }}
          >
            <img
              src={projectOverviewCompareIcon}
              alt=''
              aria-hidden='true'
              width={16}
              height={16}
            />
            <span>{I18N.carbonAgent.multiCalculationComparison}</span>
          </button>
        </div>
      </header>

      <div className={classNames(style.projectOverviewBody, mobileStyle.body)}>
        {loading ? (
          <div className={style.projectOverviewState}>
            <Spin />
            <span>{I18N.carbonAgent.projectCalculationsLoading}</span>
          </div>
        ) : loadError ? (
          <div className={style.projectOverviewState}>
            <span>{I18N.carbonAgent.projectCalculationsLoadFailed}</span>
            <button
              type='button'
              onClick={() => setRetryKey(value => value + 1)}
            >
              {I18N.carbonAgent.retry}
            </button>
          </div>
        ) : !selectedCalculation ? (
          <div className={style.projectOverviewState}>
            {I18N.carbonAgent.projectCalculationsEmpty}
          </div>
        ) : !selectedCalculation.available ? (
          <div className={style.projectOverviewState}>
            <strong>{I18N.carbonAgent.projectCalculationUnavailable}</strong>
            <span>
              {selectedCalculation.unavailableReason ||
                I18N.carbonAgent.projectCalculationUnavailableHint}
            </span>
          </div>
        ) : (
          <div className={style.projectOverviewResult}>
            <PreviewAccountDetail
              readonly
              accountId={String(selectedCalculation.accountId)}
              showBusinessForesight={false}
              onEmissionTaskCreate={target => {
                const sourceObjectId = normalizeEmissionSourceId(
                  target.emissionSourceId,
                );

                if (!sourceObjectId) {
                  antdMessage.error(
                    I18N.carbonAgent.projectTaskSourceUnavailable,
                  );
                  return;
                }

                setTaskContext({
                  initialTaskTitle: I18N.template(
                    I18N.carbonAgent.projectTaskEmissionSourceDefaultTitle,
                    { val1: target.emissionSourceName },
                  ),
                  relatedObjectLabel: I18N.template(
                    I18N.carbonAgent.projectTaskEmissionSourceObject,
                    { val1: target.emissionSourceName },
                  ),
                  sourceAccountId: selectedCalculation.accountId,
                  sourceObjectId,
                  sourceObjectType: 'emission_source',
                  sourceType: 'emission_source',
                });
              }}
              resultOnly
              showResultOverview
            />
          </div>
        )}
      </div>

      <ProjectCalculationCompareDialog
        calculations={availableCalculations}
        initialAccountIds={comparisonInitialAccountIds}
        open={comparisonDialogOpen}
        projectId={projectId}
        onCancel={() => setComparisonDialogOpen(false)}
        onCompared={(comparison, accountIds) => {
          setComparisonDialogOpen(false);
          onComparisonReady(comparison, accountIds, availableCalculations);
        }}
      />
      <ProjectTaskCreateDialog
        context={taskContext}
        locale={locale}
        open={Boolean(taskContext)}
        projectId={projectId}
        onCancel={() => setTaskContext(undefined)}
        onCreated={() => {
          setTaskContext(undefined);
          antdMessage.success(I18N.carbonAgent.projectTaskCreateSuccess);
        }}
      />
    </section>
  );
};

export default ProjectOverview;
