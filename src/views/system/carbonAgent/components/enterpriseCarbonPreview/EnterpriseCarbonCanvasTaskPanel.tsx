import taskDialogCalendarIcon from '@src/assets/images/carbonAgent/icons/task-dialog-calendar.svg';
import taskDialogChevronIcon from '@src/assets/images/carbonAgent/icons/task-dialog-chevron.svg';
import taskDialogCloseIcon from '@src/assets/images/carbonAgent/icons/task-dialog-close.svg';
import I18N from '@src/lang/I18N';
import { Button, Checkbox, DatePicker, message, Select } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { EVersionType } from '@/views/enterpriseCarbonAccount2/accounting/fillData/service';

import type { EnterpriseCarbonCanvasTaskContext } from './canvasTypes';
import styles from './index.module.less';
import {
  ENTERPRISE_CARBON_TASK_TYPE,
  getAvailableEnterpriseCarbonTaskTypes,
} from '../EnterpriseCarbonProjectTasks/type';
import type {
  EnterpriseCarbonTaskCreateService,
  EnterpriseCarbonTaskOption,
  EnterpriseCarbonTaskOptionValue,
  EnterpriseCarbonTaskPayload,
  EnterpriseCarbonTaskType,
} from '../EnterpriseCarbonProjectTasks/type';

type EnterpriseCarbonCanvasProjectType = EnterpriseCarbonTaskType;

type EnterpriseCarbonCanvasTaskAssignment = {
  assigneeMemberId?: EnterpriseCarbonTaskOptionValue;
  expectedCompletionTime: Dayjs | null;
};

type EnterpriseCarbonCanvasTaskAssignmentMap = Record<
  EnterpriseCarbonCanvasProjectType,
  EnterpriseCarbonCanvasTaskAssignment
>;

type EnterpriseCarbonCanvasTaskPanelProps = {
  allowed: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  projectId: string;
  selectedSources: EnterpriseCarbonCanvasTaskContext[];
  service: EnterpriseCarbonTaskCreateService;
  sourceSessionId: string;
};

const hasValue = (
  value?: EnterpriseCarbonTaskOptionValue,
): value is EnterpriseCarbonTaskOptionValue =>
  value !== undefined && String(value).trim() !== '';

const ACTIVITY_DATA_PROJECT_TYPE =
  ENTERPRISE_CARBON_TASK_TYPE.ACTIVITY_DATA_COLLECTION;
const CARBON_FOOTPRINT_PROJECT_TYPE =
  ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION;
const SCOPE_THREE_CODE = '2';
const SCOPE_THREE_PROJECT_TYPE_CATEGORY_IDS = new Set(['10', '11']);
const PROJECT_TYPES: EnterpriseCarbonCanvasProjectType[] = [
  ACTIVITY_DATA_PROJECT_TYPE,
  CARBON_FOOTPRINT_PROJECT_TYPE,
];

const createInitialTaskAssignments =
  (): EnterpriseCarbonCanvasTaskAssignmentMap => ({
    [ACTIVITY_DATA_PROJECT_TYPE]: {
      assigneeMemberId: undefined,
      expectedCompletionTime: null,
    },
    [CARBON_FOOTPRINT_PROJECT_TYPE]: {
      assigneeMemberId: undefined,
      expectedCompletionTime: null,
    },
  });

const getProjectTypeLabel = (projectType: EnterpriseCarbonCanvasProjectType) =>
  projectType === ACTIVITY_DATA_PROJECT_TYPE
    ? I18N.carbonAgent.enterpriseCanvasActivityDataTask
    : I18N.carbonAgent.enterpriseCanvasCarbonFootprintTask;

const supportsProjectTypeSelection = (
  source: EnterpriseCarbonCanvasTaskContext,
) =>
  source.versionType === EVersionType.ghg &&
  String(source.scopeCode) === SCOPE_THREE_CODE &&
  SCOPE_THREE_PROJECT_TYPE_CATEGORY_IDS.has(String(source.categoryId));

const isTaskAssignmentComplete = (
  assignment: EnterpriseCarbonCanvasTaskAssignment,
) =>
  hasValue(assignment.assigneeMemberId) &&
  Boolean(assignment.expectedCompletionTime);

const EnterpriseCarbonCanvasTaskPanel = ({
  allowed,
  onCancel,
  onSuccess,
  projectId,
  selectedSources,
  service,
  sourceSessionId,
}: EnterpriseCarbonCanvasTaskPanelProps) => {
  const [reporterOptions, setReporterOptions] = useState<
    EnterpriseCarbonTaskOption[]
  >([]);
  const [assigneeMemberId, setAssigneeMemberId] =
    useState<EnterpriseCarbonTaskOptionValue>();
  const [expectedCompletionTime, setExpectedCompletionTime] =
    useState<Dayjs | null>(null);
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<
    EnterpriseCarbonCanvasProjectType[]
  >([ACTIVITY_DATA_PROJECT_TYPE]);
  const [expandedProjectTypes, setExpandedProjectTypes] = useState<
    EnterpriseCarbonCanvasProjectType[]
  >([ACTIVITY_DATA_PROJECT_TYPE]);
  const [taskAssignments, setTaskAssignments] =
    useState<EnterpriseCarbonCanvasTaskAssignmentMap>(
      createInitialTaskAssignments,
    );
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!allowed) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setReporterOptions([]);
    setAssigneeMemberId(undefined);
    setExpectedCompletionTime(null);
    setSelectedProjectTypes([ACTIVITY_DATA_PROJECT_TYPE]);
    setExpandedProjectTypes([ACTIVITY_DATA_PROJECT_TYPE]);
    setTaskAssignments(createInitialTaskAssignments());
    setOptionsLoading(true);

    service
      .fetchReporters(projectId, abortController.signal)
      .then(options => {
        if (!cancelled) {
          setReporterOptions(options);
        }
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) {
          setOptionsLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [allowed, projectId, service]);

  const projectTypeSelectionEnabled =
    selectedSources.length > 0 &&
    selectedSources.every(supportsProjectTypeSelection);
  const availableProjectTypes = useMemo(
    () =>
      (projectTypeSelectionEnabled
        ? PROJECT_TYPES
        : [ACTIVITY_DATA_PROJECT_TYPE]
      ).filter(projectType =>
        selectedSources.every(source =>
          getAvailableEnterpriseCarbonTaskTypes(
            source,
            supportsProjectTypeSelection(source),
          ).includes(projectType),
        ),
      ),
    [projectTypeSelectionEnabled, selectedSources],
  );
  const singleAvailableProjectType =
    availableProjectTypes.length === 1 ? availableProjectTypes[0] : undefined;
  const requiredProjectTypes = singleAvailableProjectType
    ? [singleAvailableProjectType]
    : availableProjectTypes.filter(projectType =>
        selectedProjectTypes.includes(projectType),
      );
  const showProjectTypeSelection =
    projectTypeSelectionEnabled && availableProjectTypes.length > 1;
  const singleTaskAssignment = singleAvailableProjectType
    ? taskAssignments[singleAvailableProjectType]
    : undefined;
  const projectTypeAssignmentsComplete = requiredProjectTypes.every(
    projectType => isTaskAssignmentComplete(taskAssignments[projectType]),
  );
  const taskCount = projectTypeSelectionEnabled
    ? selectedSources.length * requiredProjectTypes.length
    : selectedSources.length;

  const canSubmit = Boolean(
    selectedSources.length &&
      allowed &&
      (projectTypeSelectionEnabled
        ? requiredProjectTypes.length && projectTypeAssignmentsComplete
        : availableProjectTypes.includes(ACTIVITY_DATA_PROJECT_TYPE) &&
          hasValue(assigneeMemberId) &&
          expectedCompletionTime) &&
      !optionsLoading &&
      !submitting,
  );

  useEffect(() => {
    if (!projectTypeSelectionEnabled) {
      return;
    }

    setSelectedProjectTypes(currentProjectTypes => {
      const retainedProjectTypes = currentProjectTypes.filter(projectType =>
        availableProjectTypes.includes(projectType),
      );

      if (retainedProjectTypes.length) {
        return retainedProjectTypes.length === currentProjectTypes.length
          ? currentProjectTypes
          : retainedProjectTypes;
      }

      return availableProjectTypes.includes(ACTIVITY_DATA_PROJECT_TYPE)
        ? [ACTIVITY_DATA_PROJECT_TYPE]
        : availableProjectTypes.slice(0, 1);
    });
    setExpandedProjectTypes(currentProjectTypes => {
      const retainedProjectTypes = currentProjectTypes.filter(projectType =>
        availableProjectTypes.includes(projectType),
      );

      if (retainedProjectTypes.length) {
        return retainedProjectTypes.length === currentProjectTypes.length
          ? currentProjectTypes
          : retainedProjectTypes;
      }

      return availableProjectTypes.includes(ACTIVITY_DATA_PROJECT_TYPE)
        ? [ACTIVITY_DATA_PROJECT_TYPE]
        : availableProjectTypes.slice(0, 1);
    });
  }, [availableProjectTypes, projectTypeSelectionEnabled]);

  const handleProjectTypeChange = (
    projectType: EnterpriseCarbonCanvasProjectType,
    checked: boolean,
  ) => {
    setSelectedProjectTypes(currentProjectTypes => {
      if (checked) {
        return currentProjectTypes.includes(projectType)
          ? currentProjectTypes
          : currentProjectTypes.concat(projectType);
      }

      return currentProjectTypes.filter(item => item !== projectType);
    });
    setExpandedProjectTypes(currentProjectTypes => {
      if (checked) {
        return currentProjectTypes.includes(projectType)
          ? currentProjectTypes
          : currentProjectTypes.concat(projectType);
      }

      return currentProjectTypes.filter(item => item !== projectType);
    });
  };

  const handleProjectTypeExpandedChange = (
    projectType: EnterpriseCarbonCanvasProjectType,
  ) => {
    if (!requiredProjectTypes.includes(projectType)) {
      return;
    }

    setExpandedProjectTypes(currentProjectTypes =>
      currentProjectTypes.includes(projectType)
        ? currentProjectTypes.filter(item => item !== projectType)
        : currentProjectTypes.concat(projectType),
    );
  };

  const updateTaskAssignment = (
    projectType: EnterpriseCarbonCanvasProjectType,
    assignment: Partial<EnterpriseCarbonCanvasTaskAssignment>,
  ) => {
    setTaskAssignments(currentAssignments => ({
      ...currentAssignments,
      [projectType]: {
        ...currentAssignments[projectType],
        ...assignment,
      },
    }));

    if (
      hasValue(assignment.assigneeMemberId) ||
      Boolean(assignment.expectedCompletionTime)
    ) {
      setSelectedProjectTypes(currentProjectTypes =>
        currentProjectTypes.includes(projectType)
          ? currentProjectTypes
          : currentProjectTypes.concat(projectType),
      );
    }
  };

  const handleSubmit = async () => {
    if (!allowed || !canSubmit) {
      return;
    }

    const taskDrafts: EnterpriseCarbonTaskPayload[] =
      projectTypeSelectionEnabled
        ? requiredProjectTypes.flatMap(projectType => {
            const assignment = taskAssignments[projectType];

            if (
              !hasValue(assignment.assigneeMemberId) ||
              !assignment.expectedCompletionTime
            ) {
              return [];
            }

            return selectedSources.map(source => ({
              assigneeMemberId: assignment.assigneeMemberId,
              dueTime: assignment.expectedCompletionTime.format(
                'YYYY-MM-DD 23:59:59',
              ),
              sourceId: source.emissionSourceId,
              taskType: projectType,
            }));
          })
        : hasValue(assigneeMemberId) && expectedCompletionTime
        ? selectedSources.map(source => ({
            assigneeMemberId,
            dueTime: expectedCompletionTime.format('YYYY-MM-DD 23:59:59'),
            sourceId: source.emissionSourceId,
            taskType: ACTIVITY_DATA_PROJECT_TYPE,
          }))
        : [];

    if (taskDrafts.length !== taskCount) {
      return;
    }

    setSubmitting(true);

    try {
      await service.createTasks(projectId, {
        items: taskDrafts,
        sourceSessionId,
        sourceType: 'emission_source',
      });
      message.success(I18N.carbonAgent.projectTaskCreateSuccess);
      onSuccess();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <section
      aria-busy={submitting}
      aria-label={I18N.carbonAgent.enterpriseCanvasTaskCreateTitle}
      className={`${styles.canvasTaskPanel} ${styles.canvasTaskPanelMultiple}`}
    >
      <header className={styles.canvasTaskPanelHeader}>
        <div className={styles.canvasTaskPanelHeaderContent}>
          <h3>{I18N.carbonAgent.enterpriseCanvasTaskCreateTitle}</h3>
          <span className={styles.canvasTaskPanelCount}>
            {I18N.carbonAgent.enterpriseCanvasTaskSelectedPrefix}
            <strong>{selectedSources.length}</strong>
            {I18N.carbonAgent.enterpriseCanvasTaskSelectedSuffix}
          </span>
        </div>
        <button
          aria-label={I18N.carbonAgent.closeDialog}
          className={styles.canvasTaskPanelClose}
          disabled={submitting}
          type='button'
          onClick={onCancel}
        >
          <img alt='' src={taskDialogCloseIcon} />
        </button>
      </header>

      <div className={styles.canvasTaskPanelBody}>
        {showProjectTypeSelection ? (
          <>
            <div className={styles.canvasTaskPanelRequiredLabel}>
              <b>*</b>
              <span title={I18N.carbonAgent.enterpriseCanvasProjectType}>
                {I18N.carbonAgent.enterpriseCanvasProjectType}
              </span>
            </div>

            <div className={styles.canvasTaskPanelProjectTaskList}>
              {availableProjectTypes.map(projectType => {
                const projectTypeLabel = getProjectTypeLabel(projectType);
                const assignment = taskAssignments[projectType];
                const checked = requiredProjectTypes.includes(projectType);
                const expanded =
                  checked && expandedProjectTypes.includes(projectType);
                const taskFieldsId = `canvas-task-type-fields-${projectType}`;

                return (
                  <section
                    className={styles.canvasTaskPanelProjectTask}
                    key={projectType}
                  >
                    <div className={styles.canvasTaskPanelProjectTaskHeader}>
                      <Checkbox
                        checked={checked}
                        disabled={submitting}
                        onChange={event =>
                          handleProjectTypeChange(
                            projectType,
                            event.target.checked,
                          )
                        }
                      >
                        <span title={projectTypeLabel}>{projectTypeLabel}</span>
                      </Checkbox>
                      <button
                        aria-controls={taskFieldsId}
                        aria-expanded={expanded}
                        aria-label={
                          expanded
                            ? I18N.carbonAgent.collapseMenu
                            : I18N.carbonAgent.expandMenu
                        }
                        className={styles.canvasTaskPanelChevronButton}
                        disabled={!checked || submitting}
                        type='button'
                        onClick={() =>
                          handleProjectTypeExpandedChange(projectType)
                        }
                      >
                        <img
                          alt=''
                          className={`${styles.canvasTaskPanelChevron} ${
                            expanded
                              ? styles.canvasTaskPanelChevronExpanded
                              : ''
                          }`}
                          src={taskDialogChevronIcon}
                        />
                      </button>
                    </div>

                    {expanded ? (
                      <div
                        className={styles.canvasTaskPanelProjectTaskFields}
                        id={taskFieldsId}
                      >
                        <div className={styles.canvasTaskPanelField}>
                          <span className={styles.canvasTaskPanelRequiredLabel}>
                            <b>*</b>
                            <span title={I18N.carbonAgent.projectTaskAssignee}>
                              {I18N.carbonAgent.projectTaskAssignee}
                            </span>
                          </span>
                          <Select
                            allowClear
                            aria-label={`${projectTypeLabel} ${I18N.carbonAgent.projectTaskAssignee}`}
                            disabled={optionsLoading || submitting}
                            loading={optionsLoading}
                            optionFilterProp='label'
                            options={reporterOptions}
                            placeholder={I18N.carbonAgent.pleaseSelect}
                            showSearch
                            suffixIcon={
                              <img
                                alt=''
                                className={styles.canvasTaskPanelSelectArrow}
                                src={taskDialogChevronIcon}
                              />
                            }
                            value={assignment.assigneeMemberId}
                            onChange={value =>
                              updateTaskAssignment(projectType, {
                                assigneeMemberId: value,
                              })
                            }
                          />
                        </div>

                        <div className={styles.canvasTaskPanelField}>
                          <span className={styles.canvasTaskPanelRequiredLabel}>
                            <b>*</b>
                            <span
                              title={
                                I18N.carbonAgent
                                  .enterpriseCanvasTaskExpectedCompletionTime
                              }
                            >
                              {
                                I18N.carbonAgent
                                  .enterpriseCanvasTaskExpectedCompletionTime
                              }
                            </span>
                          </span>
                          <DatePicker
                            aria-label={`${projectTypeLabel} ${I18N.carbonAgent.enterpriseCanvasTaskExpectedCompletionTime}`}
                            disabled={submitting}
                            disabledDate={current =>
                              current.isBefore(dayjs().startOf('day'), 'day')
                            }
                            format='YYYY-MM-DD'
                            placeholder={I18N.carbonAgent.pleaseSelect}
                            suffixIcon={
                              <img alt='' src={taskDialogCalendarIcon} />
                            }
                            value={assignment.expectedCompletionTime}
                            onChange={value =>
                              updateTaskAssignment(projectType, {
                                expectedCompletionTime: value,
                              })
                            }
                          />
                        </div>
                      </div>
                    ) : null}
                  </section>
                );
              })}
            </div>
          </>
        ) : singleAvailableProjectType ? (
          <section
            className={`${styles.canvasTaskPanelProjectTask} ${styles.canvasTaskPanelProjectTaskSingle}`}
          >
            <div className={styles.canvasTaskPanelProjectTaskHeader}>
              <span title={getProjectTypeLabel(singleAvailableProjectType)}>
                {getProjectTypeLabel(singleAvailableProjectType)}
              </span>
            </div>

            <div className={styles.canvasTaskPanelProjectTaskFields}>
              <div className={styles.canvasTaskPanelField}>
                <span className={styles.canvasTaskPanelRequiredLabel}>
                  <b>*</b>
                  <span title={I18N.carbonAgent.projectTaskAssignee}>
                    {I18N.carbonAgent.projectTaskAssignee}
                  </span>
                </span>
                <Select
                  allowClear
                  aria-label={`${getProjectTypeLabel(
                    singleAvailableProjectType,
                  )} ${I18N.carbonAgent.projectTaskAssignee}`}
                  disabled={optionsLoading || submitting}
                  loading={optionsLoading}
                  optionFilterProp='label'
                  options={reporterOptions}
                  placeholder={I18N.carbonAgent.pleaseSelect}
                  showSearch
                  suffixIcon={
                    <img
                      alt=''
                      className={styles.canvasTaskPanelSelectArrow}
                      src={taskDialogChevronIcon}
                    />
                  }
                  value={
                    projectTypeSelectionEnabled
                      ? singleTaskAssignment?.assigneeMemberId
                      : assigneeMemberId
                  }
                  onChange={value => {
                    if (projectTypeSelectionEnabled) {
                      updateTaskAssignment(singleAvailableProjectType, {
                        assigneeMemberId: value,
                      });
                      return;
                    }

                    setAssigneeMemberId(value);
                  }}
                />
              </div>

              <div className={styles.canvasTaskPanelField}>
                <span className={styles.canvasTaskPanelRequiredLabel}>
                  <b>*</b>
                  <span
                    title={
                      I18N.carbonAgent
                        .enterpriseCanvasTaskExpectedCompletionTime
                    }
                  >
                    {
                      I18N.carbonAgent
                        .enterpriseCanvasTaskExpectedCompletionTime
                    }
                  </span>
                </span>
                <DatePicker
                  aria-label={`${getProjectTypeLabel(
                    singleAvailableProjectType,
                  )} ${
                    I18N.carbonAgent.enterpriseCanvasTaskExpectedCompletionTime
                  }`}
                  disabled={submitting}
                  disabledDate={current =>
                    current.isBefore(dayjs().startOf('day'), 'day')
                  }
                  format='YYYY-MM-DD'
                  placeholder={I18N.carbonAgent.pleaseSelect}
                  suffixIcon={<img alt='' src={taskDialogCalendarIcon} />}
                  value={
                    projectTypeSelectionEnabled
                      ? singleTaskAssignment?.expectedCompletionTime
                      : expectedCompletionTime
                  }
                  onChange={value => {
                    if (projectTypeSelectionEnabled) {
                      updateTaskAssignment(singleAvailableProjectType, {
                        expectedCompletionTime: value,
                      });
                      return;
                    }

                    setExpectedCompletionTime(value);
                  }}
                />
              </div>
            </div>
          </section>
        ) : null}
      </div>

      <Button
        block
        className={styles.canvasTaskPanelSubmit}
        disabled={!canSubmit}
        loading={submitting}
        type='primary'
        onClick={handleSubmit}
      >
        {I18N.template(I18N.carbonAgent.enterpriseCanvasTaskCreateCount, {
          val1: taskCount,
        })}
      </Button>
    </section>
  );
};

export default EnterpriseCarbonCanvasTaskPanel;
