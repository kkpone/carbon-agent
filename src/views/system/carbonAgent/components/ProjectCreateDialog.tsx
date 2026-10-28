import projectBusinessSelectedIcon from '@src/assets/images/carbonAgent/icons/project-business-selected.svg';
import projectDialogCloseIcon from '@src/assets/images/carbonAgent/icons/project-dialog-close.svg';
import projectPreferenceChevronIcon from '@src/assets/images/carbonAgent/icons/project-preference-chevron.svg';
import projectSelectChevronIcon from '@src/assets/images/carbonAgent/icons/project-select-chevron.svg';
import projectTextareaResizerIcon from '@src/assets/images/carbonAgent/icons/project-textarea-resizer.svg';
import I18N, { LocaleType, serviceLangMap } from '@src/lang/I18N';
import { Select } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';

import EnterpriseCarbonProjectForm from './EnterpriseCarbonProjectForm';
import Icon from './Icon';
import type { AgentProject } from '../constants';
import style from '../index.module.less';
import {
  createAgentProject,
  fetchAgentProjectCalculationCandidates,
  fetchAgentProjectConfig,
  fetchAgentProjectDetail,
  type AgentProjectCalculationCandidate,
  type AgentProjectConfig,
  updateAgentProject,
} from '../service';

const PRODUCT_CARBON_BUSINESS_TYPE = 'product_carbon';
const ENTERPRISE_CARBON_BUSINESS_TYPE = 'enterprise_carbon';
const CUSTOM_LIFECYCLE_SCOPE = '2';
const PROJECT_NAME_MAX_LENGTH = 50;
const PROJECT_GOAL_MAX_LENGTH = 500;
const MAX_LINKED_CALCULATIONS = 50;
const PRODUCT_PROJECT_FORM_ID = 'carbon-agent-product-project-form';
const ENTERPRISE_PROJECT_FORM_ID = 'carbon-agent-enterprise-project-form';

type ProjectCreateDialogProps = {
  locale: LocaleType;
  open: boolean;
  onCancel: () => void;
  onCreated?: (project?: AgentProject) => void;
  onUpdated?: (project?: AgentProject) => void;
  projectId?: string;
};

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (!error || typeof error !== 'object') {
    return fallback;
  }

  const requestError = error as {
    data?: { msg?: unknown };
    response?: { data?: { msg?: unknown } };
  };
  const responseData = requestError.response?.data || requestError.data;

  return typeof responseData?.msg === 'string' && responseData.msg.trim()
    ? responseData.msg
    : fallback;
};

const getCandidateLabel = (candidate: AgentProjectCalculationCandidate) =>
  candidate.accountName.trim() ||
  candidate.productName?.trim() ||
  I18N.template(I18N.carbonAgent.calculationWithId, {
    val1: candidate.accountId,
  });

const ProjectCreateDialog = ({
  locale,
  open,
  onCancel,
  onCreated,
  onUpdated,
  projectId,
}: ProjectCreateDialogProps) => {
  const editMode = Boolean(projectId);
  const [config, setConfig] = useState<AgentProjectConfig>();
  const [candidates, setCandidates] = useState<
    AgentProjectCalculationCandidate[]
  >([]);
  const [configLoading, setConfigLoading] = useState(false);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [configError, setConfigError] = useState('');
  const [candidateError, setCandidateError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [projectDetail, setProjectDetail] = useState<AgentProject>();
  const [projectVersion, setProjectVersion] = useState<number>();
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>(
    PRODUCT_CARBON_BUSINESS_TYPE,
  );
  const [retryKey, setRetryKey] = useState(0);
  const [projectName, setProjectName] = useState('');
  const [projectGoal, setProjectGoal] = useState('');
  const [preferenceExpanded, setPreferenceExpanded] = useState(true);
  const [lifecycleScope, setLifecycleScope] = useState('');
  const [customLifecycleStages, setCustomLifecycleStages] = useState<string[]>(
    [],
  );
  const [factorPreferences, setFactorPreferences] = useState<
    Record<string, string>
  >({});
  const [accountIds, setAccountIds] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const projectNameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setConfig(undefined);
    setCandidates([]);
    setConfigError('');
    setCandidateError('');
    setDetailError('');
    setProjectDetail(undefined);
    setProjectVersion(undefined);
    setSelectedBusinessType(PRODUCT_CARBON_BUSINESS_TYPE);
    setProjectName('');
    setProjectGoal('');
    setPreferenceExpanded(true);
    setLifecycleScope('');
    setCustomLifecycleStages([]);
    setFactorPreferences({});
    setAccountIds([]);
    setSubmitting(false);
    setSubmitError('');

    window.requestAnimationFrame(() => {
      projectNameRef.current?.focus();
    });
  }, [open, projectId]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    let cancelled = false;
    const requestAbortController = new AbortController();
    const lang = serviceLangMap[locale] || 'zh';

    setConfigLoading(true);
    setCandidateLoading(!editMode);
    setDetailLoading(editMode);
    setConfigError('');
    setCandidateError('');
    setDetailError('');

    Promise.allSettled([
      fetchAgentProjectConfig(lang, requestAbortController.signal),
      editMode
        ? Promise.resolve<AgentProjectCalculationCandidate[]>([])
        : fetchAgentProjectCalculationCandidates(requestAbortController.signal),
      editMode && projectId
        ? fetchAgentProjectDetail(projectId, requestAbortController.signal)
        : Promise.resolve<AgentProject | undefined>(undefined),
    ]).then(([configResult, candidateResult, detailResult]) => {
      if (cancelled) {
        return;
      }

      const projectDetail =
        detailResult.status === 'fulfilled' ? detailResult.value : undefined;

      if (configResult.status === 'fulfilled') {
        const nextConfig = configResult.value;
        const enabledScopes = nextConfig.lifecycleScopes.filter(
          option => option.enabled,
        );
        const defaultScope =
          enabledScopes.find(option => option.code === '0') || enabledScopes[0];
        const requestedScope = projectDetail?.setting?.lifecycleScope || '';

        setConfig(nextConfig);
        setLifecycleScope(
          enabledScopes.some(option => option.code === requestedScope)
            ? requestedScope
            : defaultScope?.code || '',
        );
      } else {
        setConfigError(I18N.carbonAgent.projectFormLoadFailed);
      }

      if (candidateResult.status === 'fulfilled') {
        setCandidates(candidateResult.value);
      } else {
        setCandidateError(I18N.carbonAgent.calculationCandidatesLoadFailed);
      }

      if (editMode) {
        if (projectDetail && projectDetail.version !== undefined) {
          setProjectDetail(projectDetail);
          setSelectedBusinessType(projectDetail.businessType!);
          setProjectName(projectDetail.name);
          setProjectGoal(projectDetail.projectGoal || '');
          setCustomLifecycleStages(
            (projectDetail.setting?.scopeValue || '')
              .split(',')
              .map(stageCode => stageCode.trim())
              .filter(Boolean),
          );
          setFactorPreferences({
            ...(projectDetail.setting?.factorPreferences || {}),
          });
          setProjectVersion(projectDetail.version);
        } else {
          setProjectDetail(undefined);
          setDetailError(I18N.carbonAgent.projectDetailLoadFailed);
        }
      }

      setConfigLoading(false);
      setCandidateLoading(false);
      setDetailLoading(false);

      window.requestAnimationFrame(() => {
        projectNameRef.current?.focus();
      });
    });

    return () => {
      cancelled = true;
      requestAbortController.abort();
    };
  }, [editMode, locale, open, projectId, retryKey]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !submitting) {
        onCancel();
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel, open, submitting]);

  const enabledLifecycleScopes = useMemo(
    () => config?.lifecycleScopes.filter(option => option.enabled) || [],
    [config],
  );
  const enabledLifecycleStages = useMemo(
    () => config?.lifecycleStages.filter(option => option.enabled) || [],
    [config],
  );
  const enabledFactorSources = useMemo(
    () => config?.factorSources.filter(option => option.enabled) || [],
    [config],
  );
  const productBusinessType = config?.businessTypes.find(
    option => option.code === PRODUCT_CARBON_BUSINESS_TYPE,
  );
  const enterpriseBusinessType = config?.businessTypes.find(
    option => option.code === ENTERPRISE_CARBON_BUSINESS_TYPE,
  );
  const selectedScopeName = enabledLifecycleScopes.find(
    option => option.code === lifecycleScope,
  )?.name;
  const selectedPreferenceCount = enabledLifecycleStages.reduce(
    (count, stage) => count + (factorPreferences[stage.code] ? 1 : 0),
    0,
  );
  const preferenceSummary = selectedScopeName
    ? I18N.template(I18N.carbonAgent.projectPreferenceSummary, {
        val1: selectedScopeName,
        val2: selectedPreferenceCount,
      })
    : I18N.carbonAgent.projectPreferenceDescription;
  const lifecycleScopeOptions = enabledLifecycleScopes.map(option => ({
    label: option.name,
    value: option.code,
  }));
  const lifecycleStageOptions = enabledLifecycleStages.map(option => ({
    label: option.name,
    value: option.code,
  }));
  const factorSourceOptions = enabledFactorSources.map(option => ({
    label: option.name,
    value: option.code,
  }));
  const enterpriseGwpOptions =
    config?.enterpriseGwpVersions
      .filter(option => option.enabled)
      .map(option => ({ label: option.name, value: option.code })) || [];
  const enterpriseTimeTypeOptions =
    config?.enterpriseTimeTypes
      .filter(option => option.enabled)
      .map(option => ({ label: option.name, value: Number(option.code) })) ||
    [];
  const candidateOptions = candidates.map(candidate => ({
    label: getCandidateLabel(candidate),
    value: candidate.accountId,
  }));
  const trimmedProjectName = projectName.trim();
  const customScopeInvalid =
    lifecycleScope === CUSTOM_LIFECYCLE_SCOPE &&
    customLifecycleStages.length === 0;
  const projectTypeAvailable = Boolean(
    config?.enabled && productBusinessType?.enabled,
  );
  const enterpriseProjectTypeAvailable = Boolean(
    config?.enabled && enterpriseBusinessType?.enabled,
  );
  const enterpriseSelected =
    selectedBusinessType === ENTERPRISE_CARBON_BUSINESS_TYPE;
  const canSubmit = Boolean(
    trimmedProjectName &&
      lifecycleScope &&
      !customScopeInvalid &&
      projectTypeAvailable &&
      !configError &&
      !detailError &&
      !configLoading &&
      !detailLoading &&
      (!editMode || projectVersion !== undefined) &&
      !submitting,
  );

  /** 企业碳项目保存成功 */
  const handleEnterpriseProjectSuccess = (project?: AgentProject) => {
    if (editMode) {
      onUpdated?.(project);
      return;
    }

    onCreated?.(project);
  };

  if (!open) {
    return null;
  }

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }

    const enabledStageCodes = new Set(
      enabledLifecycleStages.map(stage => stage.code),
    );
    const normalizedFactorPreferences = Object.entries(
      factorPreferences,
    ).reduce<Record<string, string>>((result, [stageCode, sourceCode]) => {
      if (enabledStageCodes.has(stageCode) && sourceCode) {
        result[stageCode] = sourceCode;
      }

      return result;
    }, {});

    setSubmitting(true);
    setSubmitError('');

    try {
      const scopeValue =
        lifecycleScope === CUSTOM_LIFECYCLE_SCOPE
          ? customLifecycleStages.join(',')
          : null;

      if (editMode && projectId && projectVersion !== undefined) {
        const project = await updateAgentProject(projectId, {
          factorPreferences: normalizedFactorPreferences,
          lifecycleScope,
          projectGoal: projectGoal.trim(),
          projectName: trimmedProjectName,
          scopeValue,
          version: projectVersion,
        });

        onUpdated?.(project);
      } else {
        const project = await createAgentProject({
          accountIds: accountIds.slice(0, MAX_LINKED_CALCULATIONS),
          businessType: PRODUCT_CARBON_BUSINESS_TYPE,
          factorPreferences: normalizedFactorPreferences,
          lifecycleScope,
          projectGoal: projectGoal.trim(),
          projectName: trimmedProjectName,
          scopeValue,
        });

        onCreated?.(project);
      }
    } catch (error) {
      setSubmitError(
        getRequestErrorMessage(
          error,
          editMode
            ? I18N.carbonAgent.updateProjectFailed
            : I18N.carbonAgent.createProjectFailed,
        ),
      );
      setSubmitting(false);
    }
  };

  let dialogTitle = I18N.carbonAgent.newProjectTitle;
  let submitButtonLabel = I18N.carbonAgent.createProject;

  if (editMode) {
    dialogTitle = I18N.carbonAgent.projectSettings;
    submitButtonLabel = I18N.carbonAgent.saveProjectSettings;
  }

  if (submitting) {
    submitButtonLabel = I18N.carbonAgent.creatingProject;
  }

  if (submitting && editMode) {
    submitButtonLabel = I18N.carbonAgent.updatingProject;
  }

  let activeFormId = PRODUCT_PROJECT_FORM_ID;
  let submitDisabled = !canSubmit;

  if (enterpriseSelected) {
    activeFormId = ENTERPRISE_PROJECT_FORM_ID;
    submitDisabled =
      !enterpriseProjectTypeAvailable ||
      Boolean(configError) ||
      Boolean(detailError) ||
      configLoading ||
      detailLoading ||
      submitting;
  }

  if (enterpriseSelected && editMode && projectDetail?.version === undefined) {
    submitDisabled = true;
  }

  return (
    <div className={style.projectCreateDialogBackdrop}>
      <button
        className={style.projectCreateDialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={submitting}
        onClick={onCancel}
      />
      <div
        className={style.projectCreateDialog}
        role='dialog'
        aria-modal='true'
        aria-label={dialogTitle}
        aria-busy={configLoading || detailLoading || submitting}
      >
        <div className={style.projectCreateDialogHeader}>
          <h2>{dialogTitle}</h2>
          <button
            className={style.projectCreateDialogClose}
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={submitting}
            onClick={onCancel}
          >
            <Icon src={projectDialogCloseIcon} />
          </button>
        </div>

        <div className={style.projectCreateDialogBody}>
          {configError ? (
            <div className={style.projectCreateDialogError} role='alert'>
              <span>{configError}</span>
              <button
                type='button'
                onClick={() => setRetryKey(currentKey => currentKey + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          ) : null}
          {detailError ? (
            <div className={style.projectCreateDialogError} role='alert'>
              <span>{detailError}</span>
              <button
                type='button'
                onClick={() => setRetryKey(currentKey => currentKey + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          ) : null}
          {config?.enabled === false ? (
            <div className={style.projectCreateDialogError} role='alert'>
              {I18N.carbonAgent.projectFeatureUnavailable}
            </div>
          ) : null}

          <section className={style.projectCreateBusinessSection}>
            <h3>{I18N.carbonAgent.projectBusinessType}</h3>
            <div className={style.projectCreateBusinessCards}>
              {enterpriseSelected ? (
                <button
                  className={classNames(
                    style.projectCreateBusinessCard,
                    style.projectCreateBusinessCardInactive,
                    style.projectCreateBusinessCardSelectable,
                    {
                      [style.projectCreateBusinessCardDisabled]:
                        editMode || !projectTypeAvailable || configLoading,
                    },
                  )}
                  type='button'
                  disabled={editMode || !projectTypeAvailable || configLoading}
                  onClick={() =>
                    setSelectedBusinessType(PRODUCT_CARBON_BUSINESS_TYPE)
                  }
                >
                  <strong>
                    {productBusinessType?.name ||
                      I18N.carbonAgent.productCarbonProject}
                  </strong>
                  <span>
                    {I18N.carbonAgent.productCarbonProjectDescription}
                  </span>
                </button>
              ) : (
                <div
                  className={classNames(style.projectCreateBusinessCard, {
                    [style.projectCreateBusinessCardSelected]:
                      projectTypeAvailable && !configLoading,
                    [style.projectCreateBusinessCardDisabled]:
                      !projectTypeAvailable || configLoading,
                  })}
                >
                  <strong>
                    {productBusinessType?.name ||
                      I18N.carbonAgent.productCarbonProject}
                  </strong>
                  <span>
                    {I18N.carbonAgent.productCarbonProjectDescription}
                  </span>
                  <Icon
                    className={style.projectCreateBusinessSelected}
                    src={projectBusinessSelectedIcon}
                  />
                </div>
              )}
              {enterpriseProjectTypeAvailable ? (
                enterpriseSelected ? (
                  <div
                    className={classNames(
                      style.projectCreateBusinessCard,
                      style.projectCreateBusinessCardSelected,
                    )}
                  >
                    <strong>
                      {enterpriseBusinessType?.name ||
                        I18N.carbonAgent.enterpriseCarbonProject}
                    </strong>
                    <span>
                      {I18N.carbonAgent.enterpriseCarbonProjectDescription}
                    </span>
                    <Icon
                      className={style.projectCreateBusinessSelected}
                      src={projectBusinessSelectedIcon}
                    />
                  </div>
                ) : (
                  <button
                    className={classNames(
                      style.projectCreateBusinessCard,
                      style.projectCreateBusinessCardInactive,
                      style.projectCreateBusinessCardSelectable,
                      {
                        [style.projectCreateBusinessCardDisabled]:
                          editMode || configLoading,
                      },
                    )}
                    type='button'
                    disabled={editMode || configLoading}
                    onClick={() =>
                      setSelectedBusinessType(ENTERPRISE_CARBON_BUSINESS_TYPE)
                    }
                  >
                    <strong>
                      {enterpriseBusinessType?.name ||
                        I18N.carbonAgent.enterpriseCarbonProject}
                    </strong>
                    <span>
                      {I18N.carbonAgent.enterpriseCarbonProjectDescription}
                    </span>
                  </button>
                )
              ) : null}
              <div
                className={classNames(
                  style.projectCreateBusinessCard,
                  style.projectCreateBusinessCardComingSoon,
                )}
                aria-disabled='true'
              >
                <strong>{I18N.carbonAgent.moreBusinessScenarios}</strong>
                <span>{I18N.carbonAgent.moreBusinessScenariosDescription}</span>
              </div>
            </div>
          </section>

          {enterpriseSelected ? (
            <EnterpriseCarbonProjectForm
              available={enterpriseProjectTypeAvailable}
              editMode={editMode}
              formId={ENTERPRISE_PROJECT_FORM_ID}
              gwpOptions={enterpriseGwpOptions}
              project={projectDetail}
              projectId={projectId}
              submitting={submitting}
              timeTypeOptions={enterpriseTimeTypeOptions}
              onSuccess={handleEnterpriseProjectSuccess}
              onSubmittingChange={setSubmitting}
            />
          ) : (
            <form
              id={PRODUCT_PROJECT_FORM_ID}
              className={style.projectCreateForm}
              onSubmit={event => {
                event.preventDefault();
                handleSubmit();
              }}
            >
              <div className={style.projectCreateField}>
                <label htmlFor='carbon-agent-project-name'>
                  <b aria-hidden='true'>*</b>
                  {I18N.carbonAgent.projectName}
                </label>
                <input
                  id='carbon-agent-project-name'
                  ref={projectNameRef}
                  value={projectName}
                  maxLength={PROJECT_NAME_MAX_LENGTH}
                  placeholder={I18N.carbonAgent.pleaseEnter}
                  disabled={submitting}
                  onChange={event =>
                    setProjectName(
                      event.target.value.slice(0, PROJECT_NAME_MAX_LENGTH),
                    )
                  }
                />
              </div>

              <div className={style.projectCreateField}>
                <label htmlFor='carbon-agent-project-goal'>
                  {I18N.carbonAgent.projectGoal}
                </label>
                <div className={style.projectCreateTextareaWrap}>
                  <textarea
                    id='carbon-agent-project-goal'
                    value={projectGoal}
                    maxLength={PROJECT_GOAL_MAX_LENGTH}
                    placeholder={I18N.carbonAgent.projectGoalPlaceholder}
                    disabled={submitting}
                    onChange={event =>
                      setProjectGoal(
                        event.target.value.slice(0, PROJECT_GOAL_MAX_LENGTH),
                      )
                    }
                  />
                  <span>
                    {projectGoal.length}/{PROJECT_GOAL_MAX_LENGTH}
                  </span>
                  <Icon
                    className={style.projectCreateTextareaResizer}
                    src={projectTextareaResizerIcon}
                  />
                </div>
              </div>

              <section
                className={classNames(style.projectPreferencePanel, {
                  [style.projectPreferencePanelExpanded]: preferenceExpanded,
                })}
              >
                <button
                  className={style.projectPreferenceHeader}
                  type='button'
                  aria-expanded={preferenceExpanded}
                  disabled={configLoading || Boolean(configError)}
                  onClick={() => setPreferenceExpanded(current => !current)}
                >
                  <span>
                    <strong>{I18N.carbonAgent.projectPreferences}</strong>
                    <small>{preferenceSummary}</small>
                  </span>
                  <Icon
                    className={style.projectPreferenceChevron}
                    src={projectPreferenceChevronIcon}
                  />
                </button>

                {preferenceExpanded ? (
                  <div className={style.projectPreferenceContent}>
                    <div className={style.projectCreateField}>
                      <label htmlFor='carbon-agent-project-lifecycle'>
                        {I18N.carbonAgent.lifecycleScope}
                      </label>
                      <Select<string>
                        className={style.projectCreateSelect}
                        id='carbon-agent-project-lifecycle'
                        value={lifecycleScope || undefined}
                        options={lifecycleScopeOptions}
                        placeholder={I18N.carbonAgent.pleaseSelect}
                        disabled={submitting}
                        notFoundContent={I18N.carbonAgent.noData}
                        suffixIcon={
                          <Icon
                            className={style.projectSelectChevron}
                            src={projectSelectChevronIcon}
                          />
                        }
                        onChange={setLifecycleScope}
                      />
                    </div>

                    {lifecycleScope === CUSTOM_LIFECYCLE_SCOPE ? (
                      <div className={style.projectCreateField}>
                        <label htmlFor='carbon-agent-project-lifecycle-stages'>
                          <b aria-hidden='true'>*</b>
                          {I18N.carbonAgent.customLifecycleStages}
                        </label>
                        <Select<string[]>
                          className={style.projectCreateSelect}
                          id='carbon-agent-project-lifecycle-stages'
                          mode='multiple'
                          value={customLifecycleStages}
                          options={lifecycleStageOptions}
                          placeholder={I18N.carbonAgent.pleaseSelect}
                          disabled={submitting}
                          maxTagCount='responsive'
                          notFoundContent={I18N.carbonAgent.noData}
                          suffixIcon={
                            <Icon
                              className={style.projectSelectChevron}
                              src={projectSelectChevronIcon}
                            />
                          }
                          onChange={setCustomLifecycleStages}
                        />
                      </div>
                    ) : null}

                    <div className={style.projectFactorPreferenceTable}>
                      <div className={style.projectFactorPreferenceHeader}>
                        <strong>
                          {I18N.carbonAgent.lifecycleFactorPreference}
                        </strong>
                        <span>
                          {I18N.carbonAgent.factorPreferenceAdjustableHint}
                        </span>
                      </div>
                      <div className={style.projectFactorPreferenceGrid}>
                        {enabledLifecycleStages.map(stage => (
                          <div
                            className={style.projectFactorPreferenceCell}
                            key={stage.code}
                          >
                            <label htmlFor={`project-factor-${stage.code}`}>
                              {stage.name}
                            </label>
                            <Select<string>
                              className={style.projectFactorPreferenceSelect}
                              id={`project-factor-${stage.code}`}
                              value={factorPreferences[stage.code] || undefined}
                              options={factorSourceOptions}
                              placeholder={I18N.carbonAgent.pleaseSelect}
                              allowClear
                              disabled={submitting}
                              notFoundContent={I18N.carbonAgent.noData}
                              suffixIcon={
                                <Icon
                                  className={style.projectSelectChevron}
                                  src={projectSelectChevronIcon}
                                />
                              }
                              onChange={nextValue =>
                                setFactorPreferences(currentPreferences => {
                                  const nextPreferences = {
                                    ...currentPreferences,
                                  };

                                  if (nextValue) {
                                    nextPreferences[stage.code] = nextValue;
                                  } else {
                                    delete nextPreferences[stage.code];
                                  }

                                  return nextPreferences;
                                })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </section>

              {!editMode ? (
                <div className={style.projectCreateBottomFields}>
                  <div className={style.projectCreateField}>
                    <label htmlFor='carbon-agent-project-calculations'>
                      {I18N.carbonAgent.linkedCalculations}
                    </label>
                    <Select<number[]>
                      className={style.projectCreateSelect}
                      id='carbon-agent-project-calculations'
                      mode='multiple'
                      value={accountIds}
                      options={candidateOptions}
                      placeholder={I18N.carbonAgent.pleaseSelect}
                      allowClear
                      showSearch={false}
                      optionFilterProp='label'
                      maxCount={MAX_LINKED_CALCULATIONS}
                      maxTagCount='responsive'
                      loading={candidateLoading}
                      disabled={submitting}
                      suffixIcon={
                        <Icon
                          className={style.projectSelectChevron}
                          src={projectSelectChevronIcon}
                        />
                      }
                      notFoundContent={
                        candidateLoading
                          ? I18N.carbonAgent.calculationCandidatesLoading
                          : I18N.carbonAgent.noData
                      }
                      onChange={nextAccountIds =>
                        setAccountIds(
                          nextAccountIds.slice(0, MAX_LINKED_CALCULATIONS),
                        )
                      }
                    />
                    {candidateError ? (
                      <span className={style.projectCreateFieldError}>
                        {candidateError}
                        <button
                          type='button'
                          onClick={() =>
                            setRetryKey(currentKey => currentKey + 1)
                          }
                        >
                          {I18N.carbonAgent.retry}
                        </button>
                      </span>
                    ) : null}
                  </div>
                  {/* <div className={style.projectCreateField}>
                <span className={style.projectCreateFieldLabel}>
                  {I18N.carbonAgent.projectMembers}
                </span>
                <div
                  className={style.projectCreateReadonlySelect}
                  aria-disabled='true'
                >
                  <span>{I18N.carbonAgent.pleaseSelect}</span>
                  <Icon
                    className={style.projectSelectChevron}
                    src={projectSelectChevronIcon}
                  />
                </div>
              </div> */}
                </div>
              ) : null}

              {submitError ? (
                <div className={style.projectCreateDialogError} role='alert'>
                  {submitError}
                </div>
              ) : null}
            </form>
          )}
        </div>

        <div className={style.projectCreateDialogFooter}>
          <button
            className={style.projectCreateCancel}
            type='button'
            disabled={submitting}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={style.projectCreateConfirm}
            type='submit'
            form={activeFormId}
            disabled={submitDisabled}
          >
            {submitButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreateDialog;
