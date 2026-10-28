import taskCenterAddIcon from '@src/assets/images/carbonAgent/icons/task-center-add.svg';
import taskCenterCloseIcon from '@src/assets/images/carbonAgent/icons/task-center-close.svg';
import taskCenterPageChevronIcon from '@src/assets/images/carbonAgent/icons/task-center-page-chevron.svg';
import I18N from '@src/lang/I18N';
import { message as antdMessage } from 'antd';
import classNames from 'classnames';
import { useContext, useEffect, useState } from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import Icon from './Icon';
import ProjectTaskCreateDialog from './ProjectTaskCreateDialog';
import ProjectTaskDetailDrawer from './ProjectTaskDetailDrawer';
import taskDrawerStyle from './ProjectTaskDetailDrawer.module.less';
import style from './ProjectTasks.module.less';
import {
  type AgentProjectTask,
  type AgentProjectTaskListParams,
  type AgentProjectTaskPage,
  fetchAgentProjectTasks,
} from '../service';

type ProjectTaskFilter = 'all' | 'done' | 'mine' | 'overdue';

type ProjectTasksProps = {
  initialTaskId?: string;
  onBack: () => void;
  onConversationStart: (taskId: string) => void;
  projectId: string;
};

const PROJECT_TASK_PAGE_SIZE = 20;

const getProjectTaskParams = (
  filter: ProjectTaskFilter,
  pageNum: number,
): AgentProjectTaskListParams => ({
  keyword: '',
  mineOnly: filter === 'mine',
  overdueOnly: filter === 'overdue',
  pageNum,
  pageSize: PROJECT_TASK_PAGE_SIZE,
  status: filter === 'done' ? 'done' : '',
});

const loadProjectTaskPage = (
  projectId: string,
  filter: ProjectTaskFilter,
  pageNum: number,
  signal: AbortSignal,
) =>
  fetchAgentProjectTasks(
    projectId,
    getProjectTaskParams(filter, pageNum),
    signal,
  );

const formatTaskDueTime = (value: string | null | undefined) =>
  value?.trim().replace(/-/g, '/') || I18N.carbonAgent.projectTaskNoDueTime;

const getProjectTaskRelatedObject = (task: AgentProjectTask) => {
  const title =
    task.sourceObjectName ||
    task.sourceObjectTypeName ||
    task.sourceAccountName ||
    task.sourceObjectId ||
    task.sourceObjectType ||
    task.sourceTypeName ||
    I18N.carbonAgent.projectTaskRelatedProject;
  const detail =
    task.sourceObjectPath ||
    task.sourceAccountName ||
    task.sourceTypeName ||
    (task.sourceAccountId
      ? I18N.template(I18N.carbonAgent.projectTaskRelatedCalculation, {
          val1: task.sourceAccountId,
        })
      : '') ||
    task.sourceObjectTypeName ||
    task.sourceObjectType;

  return {
    detail: detail || I18N.carbonAgent.projectTaskRelatedProject,
    title,
  };
};

const ProjectTasks = ({
  initialTaskId,
  onBack,
  onConversationStart,
  projectId,
}: ProjectTasksProps) => {
  const { locale } = useContext(LocaleContext);
  const [filter, setFilter] = useState<ProjectTaskFilter>('all');
  const [pageNum, setPageNum] = useState(1);
  const [taskPage, setTaskPage] = useState<AgentProjectTaskPage>();
  const [highlightTaskId, setHighlightTaskId] = useState(initialTaskId || '');
  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId || '');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    setFilter('all');
    setPageNum(1);
    setHighlightTaskId(initialTaskId || '');
    setSelectedTaskId(initialTaskId || '');
  }, [initialTaskId, projectId]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setLoadError(false);

    loadProjectTaskPage(projectId, filter, pageNum, abortController.signal)
      .then(nextTaskPage => {
        if (cancelled) {
          return;
        }

        setTaskPage(nextTaskPage);
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
  }, [filter, pageNum, projectId, retryKey]);

  const totalPages = Math.max(
    1,
    Math.ceil((taskPage?.total || 0) / PROJECT_TASK_PAGE_SIZE),
  );
  const filters: Array<{
    count: number;
    key: ProjectTaskFilter;
    label: string;
  }> = [
    {
      count: taskPage?.allCount || 0,
      key: 'all',
      label: I18N.carbonAgent.projectTaskFilterAll,
    },
    {
      count: taskPage?.mineCount || 0,
      key: 'mine',
      label: I18N.carbonAgent.projectTaskFilterMine,
    },
    {
      count: taskPage?.overdueCount || 0,
      key: 'overdue',
      label: I18N.carbonAgent.projectTaskFilterOverdue,
    },
    {
      count: taskPage?.doneCount || 0,
      key: 'done',
      label: I18N.carbonAgent.projectTaskFilterDone,
    },
  ];

  return (
    <section className={style.projectTasksPage}>
      <header className={style.projectTasksHeader}>
        <h1>{I18N.carbonAgent.projectTasks}</h1>
        <button
          type='button'
          aria-label={I18N.carbonAgent.backToProjectHome}
          onClick={onBack}
        >
          <Icon src={taskCenterCloseIcon} />
        </button>
      </header>

      <div className={style.projectTasksToolbar}>
        <nav
          className={style.projectTaskFilters}
          aria-label={I18N.carbonAgent.projectTaskFilters}
        >
          {filters.map(item => (
            <button
              className={classNames({
                [style.projectTaskFilterActive]: filter === item.key,
              })}
              key={item.key}
              type='button'
              aria-pressed={filter === item.key}
              onClick={() => {
                setFilter(item.key);
                setPageNum(1);
                setHighlightTaskId('');
                setSelectedTaskId('');
              }}
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </nav>

        <button
          className={style.projectTaskCreateButton}
          type='button'
          onClick={() => setCreateDialogOpen(true)}
        >
          <span aria-hidden='true'>
            <Icon src={taskCenterAddIcon} />
          </span>
          {I18N.carbonAgent.projectTaskCreateTitle}
        </button>
      </div>

      <div
        className={style.projectTaskTableWrap}
        aria-busy={loading}
        aria-live='polite'
      >
        <table className={style.projectTaskTable}>
          <colgroup>
            <col className={style.projectTaskColumnTask} />
            <col className={style.projectTaskColumnObject} />
            <col className={style.projectTaskColumnAssignee} />
            <col className={style.projectTaskColumnDueTime} />
            <col className={style.projectTaskColumnStatus} />
          </colgroup>
          <thead>
            <tr>
              <th>{I18N.carbonAgent.projectTaskTitle}</th>
              <th>{I18N.carbonAgent.projectTaskRelatedObject}</th>
              <th>{I18N.carbonAgent.projectTaskAssignee}</th>
              <th>{I18N.carbonAgent.projectTaskDueTime}</th>
              <th>{I18N.carbonAgent.projectTaskStatus}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className={style.projectTaskStateRow}>
                <td className={style.projectTaskTableState} colSpan={5}>
                  {I18N.carbonAgent.projectTasksLoading}
                </td>
              </tr>
            ) : loadError ? (
              <tr className={style.projectTaskStateRow}>
                <td className={style.projectTaskTableState} colSpan={5}>
                  <span>{I18N.carbonAgent.projectTasksLoadFailed}</span>
                  <button
                    type='button'
                    onClick={() => setRetryKey(value => value + 1)}
                  >
                    {I18N.carbonAgent.retry}
                  </button>
                </td>
              </tr>
            ) : taskPage?.items.length ? (
              taskPage.items.map(task => {
                const taskId = String(task.taskId);
                const relatedObject = getProjectTaskRelatedObject(task);

                return (
                  <tr
                    className={classNames(taskDrawerStyle.taskTriggerRow, {
                      [style.projectTaskRowHighlighted]:
                        highlightTaskId === taskId,
                    })}
                    key={taskId}
                    role='button'
                    tabIndex={0}
                    onClick={() => {
                      setHighlightTaskId(taskId);
                      setSelectedTaskId(taskId);
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        setHighlightTaskId(taskId);
                        setSelectedTaskId(taskId);
                      }
                    }}
                  >
                    <td data-label={I18N.carbonAgent.projectTaskTitle}>
                      <div className={style.projectTaskPrimaryCell}>
                        <strong title={task.taskTitle}>{task.taskTitle}</strong>
                        <span>
                          {I18N.template(
                            I18N.carbonAgent.projectTaskSourceValue,
                            {
                              val1:
                                task.sourceTypeName ||
                                I18N.carbonAgent.projectTaskUnknownSource,
                            },
                          )}
                        </span>
                      </div>
                    </td>
                    <td data-label={I18N.carbonAgent.projectTaskRelatedObject}>
                      <div className={style.projectTaskPrimaryCell}>
                        <strong title={relatedObject.title}>
                          {relatedObject.title}
                        </strong>
                        <span title={relatedObject.detail}>
                          {relatedObject.detail}
                        </span>
                      </div>
                    </td>
                    <td data-label={I18N.carbonAgent.projectTaskAssignee}>
                      {task.assigneeName ||
                        I18N.carbonAgent.projectTaskUnassigned}
                    </td>
                    <td data-label={I18N.carbonAgent.projectTaskDueTime}>
                      <div className={style.projectTaskDueTime}>
                        <span>{formatTaskDueTime(task.dueTime)}</span>
                        {task.overdue ? (
                          <em>{I18N.carbonAgent.projectTaskOverdue}</em>
                        ) : null}
                      </div>
                    </td>
                    <td data-label={I18N.carbonAgent.projectTaskStatus}>
                      <em
                        className={classNames(
                          style.projectTaskStatus,
                          style[
                            `projectTaskStatus${task.status}` as keyof typeof style
                          ],
                        )}
                      >
                        {task.statusName || task.status}
                      </em>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className={style.projectTaskStateRow}>
                <td className={style.projectTaskTableState} colSpan={5}>
                  {I18N.carbonAgent.projectTasksEmpty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {taskPage && taskPage.total > 0 ? (
        <footer className={style.projectTaskPagination}>
          <button
            className={style.projectTaskPaginationPrevious}
            type='button'
            aria-label={I18N.carbonAgent.previousPage}
            disabled={pageNum <= 1}
            onClick={() => setPageNum(value => Math.max(1, value - 1))}
          >
            <Icon src={taskCenterPageChevronIcon} />
          </button>
          <span>{pageNum}</span>
          <button
            className={style.projectTaskPaginationNext}
            type='button'
            aria-label={I18N.carbonAgent.nextPage}
            disabled={pageNum >= totalPages}
            onClick={() => setPageNum(value => Math.min(totalPages, value + 1))}
          >
            <Icon src={taskCenterPageChevronIcon} />
          </button>
        </footer>
      ) : null}

      <ProjectTaskCreateDialog
        locale={locale}
        open={createDialogOpen}
        projectId={projectId}
        onCancel={() => setCreateDialogOpen(false)}
        onCreated={task => {
          setCreateDialogOpen(false);
          setFilter('all');
          setPageNum(1);
          setHighlightTaskId(String(task.taskId));
          setRetryKey(value => value + 1);
          antdMessage.success(I18N.carbonAgent.projectTaskCreateSuccess);
        }}
      />
      <ProjectTaskDetailDrawer
        open={Boolean(selectedTaskId)}
        projectId={projectId}
        taskId={selectedTaskId}
        onCancel={() => setSelectedTaskId('')}
        onConversationStart={taskId => {
          setSelectedTaskId('');
          onConversationStart(taskId);
        }}
        onChanged={() => {
          setRetryKey(value => value + 1);
          antdMessage.success(I18N.carbonAgent.projectTaskSubmitSuccess);
        }}
      />
    </section>
  );
};

export default ProjectTasks;
