import { PlusCircleOutlined } from '@ant-design/icons';
import taskDialogCalendarIcon from '@src/assets/images/carbonAgent/icons/task-dialog-calendar.svg';
import taskDialogChevronIcon from '@src/assets/images/carbonAgent/icons/task-dialog-chevron.svg';
import taskDialogDeleteIcon from '@src/assets/images/carbonAgent/icons/task-dialog-delete.svg';
import taskDialogSourceSelectIcon from '@src/assets/images/carbonAgent/icons/task-dialog-source-select.svg';
import I18N from '@src/lang/I18N';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  message,
  Modal,
  Select,
} from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useMemo, useState } from 'react';

import { useMobile } from '@/hooks/use-mobile';

import styles from './index.module.less';
import {
  canCreateEnterpriseCarbonSourceTask,
  ENTERPRISE_CARBON_TASK_TYPE,
  getAvailableEnterpriseCarbonTaskTypes,
} from '../EnterpriseCarbonProjectTasks/type';
import type {
  EnterpriseCarbonSource,
  EnterpriseCarbonTaskCreateService,
  EnterpriseCarbonTaskOption,
  EnterpriseCarbonTaskOptionValue,
  EnterpriseCarbonTaskType,
} from '../EnterpriseCarbonProjectTasks/type';

type EnterpriseCarbonTaskAssignment = {
  assigneeMemberId?: EnterpriseCarbonTaskOptionValue;
  expectedCompletionTime?: Dayjs | null;
};

type EnterpriseCarbonTaskAssignmentMap = Partial<
  Record<EnterpriseCarbonTaskType, EnterpriseCarbonTaskAssignment>
>;

type EnterpriseCarbonTaskFormItem = {
  accountingSubjectId?: EnterpriseCarbonTaskOptionValue;
  accountingSubjectName?: string;
  assignments?: EnterpriseCarbonTaskAssignmentMap;
  categoryCode?: EnterpriseCarbonTaskOptionValue;
  categoryDisplayName?: string;
  emissionSourceId?: EnterpriseCarbonTaskOptionValue;
  availableProjectTypes?: EnterpriseCarbonTaskType[];
  scopeCode?: EnterpriseCarbonTaskOptionValue;
  scopeName?: string;
  selectedProjectTypes?: EnterpriseCarbonTaskType[];
};

type EnterpriseCarbonTaskFormValues = {
  tasks: EnterpriseCarbonTaskFormItem[];
};

type EnterpriseCarbonTaskCreateDialogProps = {
  allowed: boolean;
  onCancel: () => void;
  onSuccess: () => void;
  open: boolean;
  projectId: string;
  service: EnterpriseCarbonTaskCreateService;
};

type TaskAssignmentFieldsProps = {
  disabled: boolean;
  fieldName: number;
  isMobile: boolean;
  loading: boolean;
  onConfigured: () => void;
  projectType: EnterpriseCarbonTaskType;
  reporterOptions: EnterpriseCarbonTaskOption[];
  required: boolean;
};

const ACTIVITY_DATA_PROJECT_TYPE =
  ENTERPRISE_CARBON_TASK_TYPE.ACTIVITY_DATA_COLLECTION;
const CARBON_FOOTPRINT_PROJECT_TYPE =
  ENTERPRISE_CARBON_TASK_TYPE.ACCOUNTING_FACTOR_COLLECTION;
const SCOPE_THREE_CODE = '2';
const SCOPE_THREE_PROJECT_TYPE_CATEGORY_CODES = new Set(['10', '11']);
const EMISSION_SOURCE_POPUP_WIDTH = 640;
const MOBILE_EMISSION_SOURCE_POPUP_WIDTH = 320;

const hasValue = (value: EnterpriseCarbonTaskOptionValue | undefined) =>
  value !== undefined && String(value).trim() !== '';

const requiredRule = {
  message: I18N.carbonAgent.pleaseSelect,
  required: true,
};

const createTaskFormItem = (): EnterpriseCarbonTaskFormItem => ({
  assignments: {
    [ACTIVITY_DATA_PROJECT_TYPE]: {
      assigneeMemberId: undefined,
      expectedCompletionTime: null,
    },
    [CARBON_FOOTPRINT_PROJECT_TYPE]: {
      assigneeMemberId: undefined,
      expectedCompletionTime: null,
    },
  },
  selectedProjectTypes: [ACTIVITY_DATA_PROJECT_TYPE],
});

const getProjectTypeLabel = (projectType: EnterpriseCarbonTaskType) =>
  projectType === ACTIVITY_DATA_PROJECT_TYPE
    ? I18N.carbonAgent.enterpriseCanvasActivityDataTask
    : I18N.carbonAgent.enterpriseCanvasCarbonFootprintTask;

const supportsProjectTypeSelection = (source?: {
  categoryCode?: EnterpriseCarbonTaskOptionValue;
  emissionSourceId?: EnterpriseCarbonTaskOptionValue;
  sourceId?: EnterpriseCarbonTaskOptionValue;
  scopeCode?: EnterpriseCarbonTaskOptionValue;
}) =>
  hasValue(source?.emissionSourceId ?? source?.sourceId) &&
  String(source?.scopeCode) === SCOPE_THREE_CODE &&
  SCOPE_THREE_PROJECT_TYPE_CATEGORY_CODES.has(String(source?.categoryCode));

const getTaskAssignment = (
  task: EnterpriseCarbonTaskFormItem,
  projectType: EnterpriseCarbonTaskType,
) => task.assignments?.[projectType];

const isTaskAssignmentComplete = (
  assignment?: EnterpriseCarbonTaskAssignment,
) =>
  hasValue(assignment?.assigneeMemberId) &&
  Boolean(assignment?.expectedCompletionTime);

const isTaskBaseComplete = (task?: EnterpriseCarbonTaskFormItem) =>
  Boolean(
    task &&
      hasValue(task.accountingSubjectId) &&
      hasValue(task.scopeCode) &&
      hasValue(task.categoryCode) &&
      hasValue(task.emissionSourceId),
  );

const getRequiredProjectTypes = (
  task: EnterpriseCarbonTaskFormItem,
): EnterpriseCarbonTaskType[] => {
  const availableProjectTypes = task.availableProjectTypes || [];

  return supportsProjectTypeSelection(task)
    ? availableProjectTypes.filter(projectType =>
        task.selectedProjectTypes?.includes(projectType),
      )
    : availableProjectTypes.includes(ACTIVITY_DATA_PROJECT_TYPE)
    ? [ACTIVITY_DATA_PROJECT_TYPE]
    : [];
};

const isTaskComplete = (task?: EnterpriseCarbonTaskFormItem) => {
  if (!task || !isTaskBaseComplete(task)) {
    return false;
  }

  const projectTypes = getRequiredProjectTypes(task);

  return (
    projectTypes.length > 0 &&
    projectTypes.every(projectType =>
      isTaskAssignmentComplete(getTaskAssignment(task, projectType)),
    )
  );
};

const TaskAssignmentFields = ({
  disabled,
  fieldName,
  isMobile,
  loading,
  onConfigured,
  projectType,
  reporterOptions,
  required,
}: TaskAssignmentFieldsProps) => (
  <div className={styles.assignmentFields}>
    <Form.Item
      className={styles.assignmentField}
      label={I18N.carbonAgent.projectTaskAssignee}
      name={[fieldName, 'assignments', projectType, 'assigneeMemberId']}
      required={required}
      rules={required ? [requiredRule] : []}
    >
      <Select
        allowClear
        aria-label={`${getProjectTypeLabel(projectType)} ${
          I18N.carbonAgent.projectTaskAssignee
        }`}
        disabled={disabled || loading}
        loading={loading}
        optionFilterProp='label'
        options={reporterOptions}
        placeholder={I18N.carbonAgent.pleaseSelect}
        showSearch={!isMobile}
        suffixIcon={
          <img
            alt=''
            className={styles.controlSuffixIcon}
            src={taskDialogChevronIcon}
          />
        }
        onChange={value => {
          if (hasValue(value)) {
            onConfigured();
          }
        }}
      />
    </Form.Item>

    <Form.Item
      className={styles.assignmentField}
      label={I18N.carbonAgent.enterpriseCanvasTaskExpectedCompletionTime}
      name={[fieldName, 'assignments', projectType, 'expectedCompletionTime']}
      required={required}
      rules={required ? [requiredRule] : []}
    >
      <DatePicker
        aria-label={`${getProjectTypeLabel(projectType)} ${
          I18N.carbonAgent.enterpriseCanvasTaskExpectedCompletionTime
        }`}
        disabled={disabled}
        disabledDate={current =>
          current.isBefore(dayjs().startOf('day'), 'day')
        }
        format='YYYY-MM-DD'
        inputReadOnly={isMobile}
        placeholder={I18N.carbonAgent.pleaseSelect}
        suffixIcon={
          <img
            alt=''
            className={styles.calendarSuffixIcon}
            src={taskDialogCalendarIcon}
          />
        }
        onChange={value => {
          if (value) {
            onConfigured();
          }
        }}
      />
    </Form.Item>
  </div>
);

const EnterpriseCarbonTaskCreateDialog = ({
  allowed,
  onCancel,
  onSuccess,
  open,
  projectId,
  service,
}: EnterpriseCarbonTaskCreateDialogProps) => {
  const isMobile = useMobile();
  const [form] = Form.useForm<EnterpriseCarbonTaskFormValues>();
  const tasks = Form.useWatch('tasks', form);
  const [emissionSources, setEmissionSources] = useState<
    EnterpriseCarbonSource[]
  >([]);
  const [reporterOptions, setReporterOptions] = useState<
    EnterpriseCarbonTaskOption[]
  >([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [openEmissionSourceRow, setOpenEmissionSourceRow] = useState<
    number | null
  >(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedTaskIndexes, setExpandedTaskIndexes] = useState<number[]>([]);
  const emissionSourceOptions = useMemo(
    () =>
      emissionSources.map(source => ({
        disabled: !canCreateEnterpriseCarbonSourceTask(
          source,
          supportsProjectTypeSelection(source),
        ),
        label: `${source.orgName} ${source.scopeName} ${source.categoryDisplayName} ${source.sourceName}`,
        value: source.sourceId,
      })),
    [emissionSources],
  );
  const emissionSourceMap = useMemo(
    () =>
      new Map(emissionSources.map(source => [String(source.sourceId), source])),
    [emissionSources],
  );
  const selectedEmissionSourceIdSet = useMemo(
    () =>
      new Set(
        (tasks || []).flatMap(task =>
          hasValue(task.emissionSourceId)
            ? [String(task.emissionSourceId)]
            : [],
        ),
      ),
    [tasks],
  );

  useEffect(() => {
    if (!open || !allowed) {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    form.resetFields();
    setExpandedTaskIndexes([]);
    setEmissionSources([]);
    setOpenEmissionSourceRow(null);
    setReporterOptions([]);
    setOptionsLoading(true);

    Promise.all([
      service.fetchEmissionSources(projectId, abortController.signal),
      service.fetchReporters(projectId, abortController.signal),
    ])
      .then(([sources, reporters]) => {
        if (!cancelled) {
          setEmissionSources(sources);
          setReporterOptions(reporters);
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
  }, [allowed, form, open, projectId, service]);

  const handleCancel = () => {
    form.resetFields();
    setExpandedTaskIndexes([]);
    setOpenEmissionSourceRow(null);
    onCancel();
  };

  const handleEmissionSourceChange = (
    rowIndex: number,
    sourceId: EnterpriseCarbonTaskOptionValue,
  ) => {
    const source = emissionSourceMap.get(String(sourceId));
    const availableProjectTypes = getAvailableEnterpriseCarbonTaskTypes(
      source,
      supportsProjectTypeSelection(source),
    );
    const currentTasks = (form.getFieldValue('tasks') ||
      []) as EnterpriseCarbonTaskFormItem[];

    form.setFieldsValue({
      tasks: currentTasks.map((task, index) =>
        index === rowIndex
          ? {
              ...task,
              accountingSubjectId: source?.orgId,
              accountingSubjectName: source?.orgName,
              availableProjectTypes,
              categoryCode: source?.categoryCode,
              categoryDisplayName: source?.categoryDisplayName,
              emissionSourceId: source?.sourceId,
              scopeCode: source?.scopeCode,
              scopeName: source?.scopeName,
              selectedProjectTypes: availableProjectTypes.includes(
                ACTIVITY_DATA_PROJECT_TYPE,
              )
                ? [ACTIVITY_DATA_PROJECT_TYPE]
                : availableProjectTypes.slice(0, 1),
            }
          : task,
      ),
    });
  };

  const handleProjectTypeChange = (
    rowIndex: number,
    projectType: EnterpriseCarbonTaskType,
    checked: boolean,
  ) => {
    const currentTasks = (form.getFieldValue('tasks') ||
      []) as EnterpriseCarbonTaskFormItem[];

    form.setFieldsValue({
      tasks: currentTasks.map((task, index) => {
        if (index !== rowIndex) {
          return task;
        }

        const currentProjectTypes = task.selectedProjectTypes || [
          ACTIVITY_DATA_PROJECT_TYPE,
        ];

        let nextProjectTypes = currentProjectTypes;

        if (checked && !currentProjectTypes.includes(projectType)) {
          nextProjectTypes = currentProjectTypes.concat(projectType);
        } else if (!checked) {
          nextProjectTypes = currentProjectTypes.filter(
            item => item !== projectType,
          );
        }

        return { ...task, selectedProjectTypes: nextProjectTypes };
      }),
    });
  };

  const ensureProjectTypeSelected = (
    rowIndex: number,
    projectType: EnterpriseCarbonTaskType,
  ) => {
    const selectedProjectTypes =
      form.getFieldValue(['tasks', rowIndex, 'selectedProjectTypes']) || [];

    if (selectedProjectTypes.includes(projectType)) {
      return;
    }

    form.setFieldValue(
      ['tasks', rowIndex, 'selectedProjectTypes'],
      selectedProjectTypes.concat(projectType),
    );
  };

  const handleSubmit = async (values: EnterpriseCarbonTaskFormValues) => {
    if (
      !allowed ||
      !values.tasks.length ||
      !values.tasks.every(isTaskComplete)
    ) {
      return;
    }

    const taskDrafts = values.tasks.flatMap(task =>
      getRequiredProjectTypes(task).flatMap(projectType => {
        const assignment = getTaskAssignment(task, projectType);

        if (
          !hasValue(assignment?.assigneeMemberId) ||
          !assignment?.expectedCompletionTime ||
          !hasValue(task.emissionSourceId)
        ) {
          return [];
        }

        return [
          {
            assigneeMemberId: assignment.assigneeMemberId,
            dueTime: assignment.expectedCompletionTime.format(
              'YYYY-MM-DD 23:59:59',
            ),
            sourceId: task.emissionSourceId,
            taskType: projectType,
          },
        ];
      }),
    );
    const expectedTaskCount = values.tasks.reduce(
      (total, task) => total + getRequiredProjectTypes(task).length,
      0,
    );

    if (taskDrafts.length !== expectedTaskCount) {
      return;
    }

    setSubmitting(true);

    try {
      await service.createTasks(projectId, {
        items: taskDrafts,
        sourceSessionId: null,
        sourceType: 'manual',
      });
      message.success(I18N.carbonAgent.projectTaskCreateSuccess);
      form.resetFields();
      setExpandedTaskIndexes([]);
      onSuccess();
    } catch {
      return;
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(
    allowed &&
      tasks?.length &&
      tasks.every(isTaskComplete) &&
      !optionsLoading &&
      !submitting,
  );

  return (
    <Modal
      centered={!isMobile}
      className={styles.dialog}
      closable={!submitting}
      closeIcon={<span aria-hidden='true' className={styles.dialogCloseIcon} />}
      destroyOnClose
      footer={null}
      keyboard={!submitting}
      maskClosable={!submitting}
      open={open}
      title={I18N.carbonAgent.projectTaskCreateTitle}
      width={780}
      onCancel={handleCancel}
    >
      <Form<EnterpriseCarbonTaskFormValues>
        className={styles.form}
        form={form}
        initialValues={{ tasks: [] }}
        scrollToFirstError
        onFinish={handleSubmit}
      >
        <Form.List name='tasks'>
          {(fields, { add, remove }) => {
            const handleAddTask = () => {
              add(createTaskFormItem());
              setExpandedTaskIndexes(current =>
                isMobile ? [fields.length] : current.concat(fields.length),
              );
            };
            const handleRemoveTask = (rowIndex: number) => {
              remove(rowIndex);
              setExpandedTaskIndexes(current =>
                current.flatMap(index => {
                  if (index === rowIndex) {
                    return [];
                  }

                  return [index > rowIndex ? index - 1 : index];
                }),
              );
            };

            return (
              <>
                <div className={styles.taskList}>
                  {fields.map(field => {
                    const expanded = expandedTaskIndexes.includes(field.name);
                    const task = tasks?.[field.name];
                    const projectTypeSelectionEnabled =
                      supportsProjectTypeSelection(task);
                    const availableProjectTypes =
                      task?.availableProjectTypes || [];
                    const singleAvailableProjectType =
                      availableProjectTypes.length === 1
                        ? availableProjectTypes[0]
                        : undefined;
                    const showMultipleProjectTypes =
                      projectTypeSelectionEnabled &&
                      availableProjectTypes.length > 1;
                    const selectedProjectTypes = task
                      ? getRequiredProjectTypes(task)
                      : [ACTIVITY_DATA_PROJECT_TYPE];
                    const currentEmissionSourceId = hasValue(
                      task?.emissionSourceId,
                    )
                      ? String(task?.emissionSourceId)
                      : '';
                    const selectableEmissionSourceOptions =
                      emissionSourceOptions.map(option => ({
                        ...option,
                        disabled:
                          option.disabled ||
                          (selectedEmissionSourceIdSet.has(
                            String(option.value),
                          ) &&
                            String(option.value) !== currentEmissionSourceId),
                      }));

                    return (
                      <section
                        className={`${styles.taskCard} ${
                          expanded
                            ? styles.taskCardExpanded
                            : styles.taskCardCollapsed
                        }`}
                        key={field.key}
                      >
                        <div className={styles.taskCardHeader}>
                          <Form.Item
                            className={styles.emissionSourceField}
                            name={[field.name, 'emissionSourceId']}
                            rules={[requiredRule]}
                          >
                            <Select
                              aria-label={
                                I18N.carbonAgent.enterpriseTaskEmissionSource
                              }
                              className={styles.emissionSourceSelect}
                              disabled={optionsLoading || submitting}
                              loading={optionsLoading}
                              optionFilterProp='label'
                              open={openEmissionSourceRow === field.name}
                              options={selectableEmissionSourceOptions}
                              placeholder={
                                I18N.carbonAgent
                                  .enterpriseTaskSelectEmissionSource
                              }
                              popupMatchSelectWidth={
                                isMobile
                                  ? MOBILE_EMISSION_SOURCE_POPUP_WIDTH
                                  : EMISSION_SOURCE_POPUP_WIDTH
                              }
                              showSearch={!isMobile}
                              suffixIcon={
                                <button
                                  aria-label={
                                    I18N.carbonAgent
                                      .enterpriseTaskSelectEmissionSource
                                  }
                                  className={styles.sourceSuffixButton}
                                  disabled={optionsLoading || submitting}
                                  type='button'
                                  onMouseDown={event => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    if (optionsLoading || submitting) {
                                      return;
                                    }

                                    setOpenEmissionSourceRow(currentRow =>
                                      currentRow === field.name
                                        ? null
                                        : field.name,
                                    );
                                  }}
                                >
                                  <img
                                    alt=''
                                    aria-hidden='true'
                                    className={styles.sourceSelectIcon}
                                    src={taskDialogSourceSelectIcon}
                                  />
                                </button>
                              }
                              variant='borderless'
                              onDropdownVisibleChange={nextOpen =>
                                setOpenEmissionSourceRow(
                                  nextOpen ? field.name : null,
                                )
                              }
                              onMouseDown={event => {
                                if (
                                  openEmissionSourceRow === field.name &&
                                  event.target instanceof Element &&
                                  event.target.closest('.ant-select-selector')
                                ) {
                                  event.preventDefault();
                                  setOpenEmissionSourceRow(null);
                                }
                              }}
                              onChange={value =>
                                handleEmissionSourceChange(field.name, value)
                              }
                            />
                          </Form.Item>

                          <Button
                            aria-label={I18N.carbonAgent.delete}
                            className={styles.deleteButton}
                            disabled={submitting}
                            icon={
                              <img
                                alt=''
                                aria-hidden='true'
                                className={styles.deleteIcon}
                                src={taskDialogDeleteIcon}
                              />
                            }
                            type='text'
                            onClick={() => handleRemoveTask(field.name)}
                          />

                          <Button
                            aria-controls={`enterprise-task-body-${field.key}`}
                            aria-expanded={expanded}
                            aria-label={
                              expanded
                                ? I18N.carbonAgent.collapseMenu
                                : I18N.carbonAgent.expandMenu
                            }
                            className={styles.taskToggle}
                            disabled={submitting}
                            icon={
                              <img
                                alt=''
                                aria-hidden='true'
                                className={styles.taskToggleIcon}
                                src={taskDialogChevronIcon}
                              />
                            }
                            type='text'
                            onClick={() =>
                              setExpandedTaskIndexes(current => {
                                const currentlyExpanded = current.includes(
                                  field.name,
                                );

                                if (isMobile) {
                                  return currentlyExpanded ? [] : [field.name];
                                }

                                return currentlyExpanded
                                  ? current.filter(
                                      index => index !== field.name,
                                    )
                                  : current.concat(field.name);
                              })
                            }
                          />
                        </div>

                        <div
                          className={styles.taskCardBody}
                          id={`enterprise-task-body-${field.key}`}
                        >
                          <div className={styles.taskMeta}>
                            <div>
                              <span>
                                {
                                  I18N.carbonAgent
                                    .enterpriseTaskAccountingSubject
                                }
                              </span>
                              <strong>
                                {task?.accountingSubjectName || '-'}
                              </strong>
                            </div>
                            <div>
                              <span>
                                {I18N.carbonAgent.enterpriseTaskScope}
                              </span>
                              <strong>{task?.scopeName || '-'}</strong>
                            </div>
                            <div>
                              <span>
                                {I18N.carbonAgent.enterpriseTaskCategory}
                              </span>
                              <strong>
                                {task?.categoryDisplayName || '-'}
                              </strong>
                            </div>
                          </div>

                          {showMultipleProjectTypes ? (
                            <div className={styles.projectTypeSection}>
                              <div className={styles.requiredLabel}>
                                <b aria-hidden='true'>*</b>
                                <span>
                                  {I18N.carbonAgent.enterpriseCanvasProjectType}
                                </span>
                              </div>

                              <div className={styles.projectTypeGrid}>
                                {availableProjectTypes.map(projectType => {
                                  const checked =
                                    selectedProjectTypes.includes(projectType);

                                  return (
                                    <section
                                      className={styles.projectTypeCard}
                                      key={projectType}
                                    >
                                      <Checkbox
                                        checked={checked}
                                        disabled={submitting}
                                        onChange={event =>
                                          handleProjectTypeChange(
                                            field.name,
                                            projectType,
                                            event.target.checked,
                                          )
                                        }
                                      >
                                        {getProjectTypeLabel(projectType)}
                                      </Checkbox>

                                      <div
                                        className={styles.projectTypeCardBody}
                                      >
                                        <TaskAssignmentFields
                                          disabled={submitting}
                                          fieldName={field.name}
                                          isMobile={isMobile}
                                          loading={optionsLoading}
                                          onConfigured={() =>
                                            ensureProjectTypeSelected(
                                              field.name,
                                              projectType,
                                            )
                                          }
                                          projectType={projectType}
                                          reporterOptions={reporterOptions}
                                          required={checked}
                                        />
                                      </div>
                                    </section>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}

                          {singleAvailableProjectType ? (
                            <div className={styles.singleProjectTypeSection}>
                              <div className={styles.singleProjectTypeLabel}>
                                <b aria-hidden='true'>*</b>
                                <span>
                                  {getProjectTypeLabel(
                                    singleAvailableProjectType,
                                  )}
                                </span>
                              </div>

                              <TaskAssignmentFields
                                disabled={submitting}
                                fieldName={field.name}
                                isMobile={isMobile}
                                loading={optionsLoading}
                                onConfigured={() => undefined}
                                projectType={singleAvailableProjectType}
                                reporterOptions={reporterOptions}
                                required
                              />
                            </div>
                          ) : null}
                        </div>
                      </section>
                    );
                  })}
                </div>

                <Button
                  block
                  className={styles.addButton}
                  disabled={submitting}
                  icon={<PlusCircleOutlined />}
                  onClick={handleAddTask}
                >
                  {I18N.carbonAgent.enterpriseTaskAdd}
                </Button>
              </>
            );
          }}
        </Form.List>

        <div className={styles.footer}>
          <Button disabled={submitting} onClick={handleCancel}>
            {I18N.carbonAgent.cancel}
          </Button>
          <Button
            disabled={!canSubmit}
            htmlType='submit'
            loading={submitting}
            type='primary'
          >
            {I18N.carbonAgent.projectTaskCreateAction}
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default EnterpriseCarbonTaskCreateDialog;
