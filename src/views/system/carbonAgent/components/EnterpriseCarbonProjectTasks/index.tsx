import taskCenterAddIcon from '@src/assets/images/carbonAgent/icons/task-center-add.svg';
import I18N from '@src/lang/I18N';
import { Button, Empty, message, Pagination, Spin } from 'antd';
import { saveAs } from 'file-saver';
import { useEffect, useRef, useState } from 'react';

import type { AgentEnterpriseBusinessCapabilities } from '../../constants';
import { hasEnterpriseBusinessCapability } from '../../permissions';
import EnterpriseCarbonTaskCard from '../EnterpriseCarbonTaskCard';
import EnterpriseCarbonTaskCreateDialog from '../EnterpriseCarbonTaskCreateDialog';
import EnterpriseCarbonTaskRejectDialog from '../EnterpriseCarbonTaskRejectDialog';
import Icon from '../Icon';
import { enterpriseCarbonTaskService } from './service';
import { ENTERPRISE_CARBON_TASK_STATUS_LABELS } from './status';
import type {
  EnterpriseCarbonTaskListService,
  EnterpriseCarbonTask,
  EnterpriseCarbonTaskAction,
  EnterpriseCarbonTaskDirectOperation,
  EnterpriseCarbonTaskOptionValue,
  EnterpriseCarbonTaskPage,
  EnterpriseCarbonTaskPageParams,
  EnterpriseCarbonTaskSavePayload,
  EnterpriseCarbonTaskStatus,
  EnterpriseCarbonTaskSubmitPayload,
  EnterpriseCarbonTaskView,
} from './type';
import styles from './index.module.less';

type EnterpriseCarbonProjectTasksProps = {
  businessCapabilities?: AgentEnterpriseBusinessCapabilities;
  onProductFootprintAccountOpen?: (accountId: string) => void;
  projectId: string;
};

const defaultStatus: Record<
  EnterpriseCarbonTaskView,
  EnterpriseCarbonTaskStatus
> = {
  initiated: 'pendingApproval',
  reported: 'pendingReport',
};

const statuses: Record<EnterpriseCarbonTaskView, EnterpriseCarbonTaskStatus[]> =
  {
    initiated: ['pendingApproval', 'pendingReport', 'rejected', 'completed'],
    reported: ['pendingReport', 'pendingApproval', 'completed'],
  };

const initiatedActions: Record<
  EnterpriseCarbonTaskStatus,
  EnterpriseCarbonTaskAction[]
> = {
  completed: [],
  pendingApproval: ['approve', 'reject', 'delete'],
  pendingReport: ['delete'],
  rejected: ['delete'],
};

const reportedActions: Record<
  EnterpriseCarbonTaskStatus,
  EnterpriseCarbonTaskAction[]
> = {
  completed: [],
  pendingApproval: [],
  pendingReport: ['edit', 'upload', 'submit'],
  rejected: ['edit', 'upload', 'submit'],
};

const fetchTaskPage = (
  service: EnterpriseCarbonTaskListService,
  params: EnterpriseCarbonTaskPageParams,
  signal: AbortSignal,
) => service.fetchTaskPage(params, signal);

const EnterpriseCarbonProjectTasks = ({
  businessCapabilities,
  onProductFootprintAccountOpen,
  projectId,
}: EnterpriseCarbonProjectTasksProps) => {
  const service = enterpriseCarbonTaskService;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [rejectTaskId, setRejectTaskId] =
    useState<EnterpriseCarbonTaskOptionValue>();
  const [view, setView] = useState<EnterpriseCarbonTaskView>('initiated');
  const [status, setStatus] =
    useState<EnterpriseCarbonTaskStatus>('pendingApproval');
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState<EnterpriseCarbonTaskPage>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [busyTaskIds, setBusyTaskIds] = useState<
    EnterpriseCarbonTaskOptionValue[]
  >([]);
  const busyTaskIdsRef = useRef(new Set<EnterpriseCarbonTaskOptionValue>());
  const canCreateTask = hasEnterpriseBusinessCapability(
    businessCapabilities,
    'canCreateTask',
  );

  const getTask = (taskId: EnterpriseCarbonTaskOptionValue) =>
    page?.items.find(task => String(task.id) === String(taskId));

  const isTaskActionAllowed = (
    task: EnterpriseCarbonTask,
    action: EnterpriseCarbonTaskAction,
  ) => {
    if (action === 'approve') {
      return task.canApprove;
    }

    if (action === 'reject') {
      return task.canReject;
    }

    if (action === 'delete') {
      return task.canDelete;
    }

    if (action === 'edit' || action === 'upload' || action === 'submit') {
      return task.canSubmit;
    }

    return true;
  };

  const getVisibleTaskActions = (task: EnterpriseCarbonTask) => {
    const candidateActions =
      view === 'initiated'
        ? initiatedActions[task.status]
        : reportedActions[task.status];

    return candidateActions.filter(action => isTaskActionAllowed(task, action));
  };

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadFailed(false);

    fetchTaskPage(
      service,
      { pageNum, pageSize, projectId, status, view },
      controller.signal,
    )
      .then(result => {
        if (active) {
          setPage(result);
        }
      })
      .catch(() => {
        if (active) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [pageNum, pageSize, projectId, reloadKey, service, status, view]);

  const setTaskBusy = (
    taskId: EnterpriseCarbonTaskOptionValue,
    busy: boolean,
  ) => {
    if (busy) {
      busyTaskIdsRef.current.add(taskId);
    } else {
      busyTaskIdsRef.current.delete(taskId);
    }
    setBusyTaskIds([...busyTaskIdsRef.current]);
  };

  const refresh = () => setReloadKey(current => current + 1);

  const handleTaskAction = async (
    taskId: EnterpriseCarbonTaskOptionValue,
    operation: EnterpriseCarbonTaskDirectOperation,
  ) => {
    const task = getTask(taskId);

    if (
      !task ||
      !isTaskActionAllowed(task, operation) ||
      busyTaskIdsRef.current.has(taskId)
    ) {
      return;
    }
    setTaskBusy(taskId, true);
    try {
      await service.operateTask(projectId, taskId, operation);
      message.success(I18N.carbonAgent.enterpriseTaskOperationSuccess);
      if (operation === 'delete' && page?.items.length === 1 && pageNum > 1) {
        setPageNum(current => current - 1);
      } else {
        refresh();
      }
    } catch {
      return;
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleRejectTask = async (reason: string) => {
    const task = rejectTaskId === undefined ? undefined : getTask(rejectTaskId);

    if (
      rejectTaskId === undefined ||
      !task ||
      !isTaskActionAllowed(task, 'reject') ||
      busyTaskIdsRef.current.has(rejectTaskId)
    ) {
      return;
    }
    const taskId = rejectTaskId;
    setTaskBusy(taskId, true);
    try {
      await service.rejectTask(projectId, taskId, { reason });
      message.success(I18N.carbonAgent.enterpriseTaskOperationSuccess);
      setRejectTaskId(undefined);
      refresh();
    } catch {
      return;
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleSubmitTask = async (
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSubmitPayload,
  ) => {
    const task = getTask(taskId);

    if (
      view !== 'reported' ||
      !task ||
      !isTaskActionAllowed(task, 'submit') ||
      busyTaskIdsRef.current.has(taskId)
    ) {
      return;
    }
    setTaskBusy(taskId, true);
    try {
      await service.submitTask(projectId, taskId, payload);
      message.success(I18N.carbonAgent.enterpriseTaskOperationSuccess);
      refresh();
    } catch {
      return;
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleSaveTask = async (
    taskId: EnterpriseCarbonTaskOptionValue,
    payload: EnterpriseCarbonTaskSavePayload,
  ) => {
    const task = getTask(taskId);

    if (
      view !== 'reported' ||
      !task ||
      !isTaskActionAllowed(task, 'edit') ||
      busyTaskIdsRef.current.has(taskId)
    ) {
      return;
    }
    setTaskBusy(taskId, true);
    try {
      await service.saveTask(projectId, taskId, payload);
      refresh();
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleSelectProductFootprintAccount = async (
    taskId: EnterpriseCarbonTaskOptionValue,
    accountId: EnterpriseCarbonTaskOptionValue,
  ) => {
    const task = getTask(taskId);

    if (
      view !== 'reported' ||
      !task ||
      !isTaskActionAllowed(task, 'edit') ||
      busyTaskIdsRef.current.has(taskId)
    ) {
      return;
    }

    setTaskBusy(taskId, true);
    try {
      const snapshot = await service.createProductFootprintAccountSnapshot(
        accountId,
      );
      await service.saveTask(projectId, taskId, {
        supplyAccountId: snapshot.snapshotAccountId,
      });
      refresh();
    } finally {
      setTaskBusy(taskId, false);
    }
  };

  const handleUploadTaskFile = (
    taskId: EnterpriseCarbonTaskOptionValue,
    file: File,
  ) => {
    const task = getTask(taskId);

    if (view !== 'reported' || !task || !isTaskActionAllowed(task, 'upload')) {
      return Promise.reject(new Error('Task upload is not allowed'));
    }

    return service.uploadTaskFile(projectId, file);
  };

  const handleDownloadTaskFile = async (
    assetId: EnterpriseCarbonTaskOptionValue,
    fileName: string,
  ) => {
    try {
      const downloadUrl = await service.fetchTaskFileDownloadUrl(
        projectId,
        assetId,
      );

      if (!downloadUrl) {
        throw new Error(I18N.carbonAgent.projectFileDownloadUnavailable);
      }

      saveAs(downloadUrl, fileName);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry,
      );
    }
  };

  const handleTaskRejectOpen = (taskId: EnterpriseCarbonTaskOptionValue) => {
    const task = getTask(taskId);

    if (!task || !isTaskActionAllowed(task, 'reject')) {
      return;
    }

    setRejectTaskId(taskId);
  };

  const handleCreateTaskOpen = () => {
    if (!canCreateTask) {
      return;
    }

    setDialogOpen(true);
  };

  return (
    <section className={styles.page}>
      <div className={styles.panel}>
        <header className={styles.pageHeader}>
          <h2>{I18N.carbonAgent.enterpriseTaskSectionTitle}</h2>
        </header>

        <nav className={styles.viewTabs}>
          {(['initiated', 'reported'] as EnterpriseCarbonTaskView[]).map(
            item => (
              <button
                key={item}
                className={item === view ? styles.activeTab : undefined}
                type='button'
                onClick={() => {
                  setView(item);
                  setStatus(defaultStatus[item]);
                  setPageNum(1);
                }}
              >
                {item === 'initiated'
                  ? I18N.carbonAgent.enterpriseTaskInitiatedByMe
                  : I18N.carbonAgent.enterpriseTaskReportedByMe}
                <span>{page?.viewCounts[item] ?? 0}</span>
              </button>
            ),
          )}
        </nav>

        <div className={styles.filterBar}>
          <nav className={styles.statusTabs}>
            {statuses[view].map(item => (
              <button
                key={item}
                className={item === status ? styles.activeStatus : undefined}
                type='button'
                onClick={() => {
                  setStatus(item);
                  setPageNum(1);
                }}
              >
                {view === 'reported' && item === 'pendingApproval'
                  ? I18N.carbonAgent.enterpriseTaskInApproval
                  : ENTERPRISE_CARBON_TASK_STATUS_LABELS[item]}
                <span>{page?.statusCounts[item] ?? 0}</span>
              </button>
            ))}
          </nav>
          {canCreateTask ? (
            <div className={styles.createButtonBar}>
              <button
                className={styles.createButton}
                type='button'
                onClick={handleCreateTaskOpen}
              >
                <span aria-hidden='true'>
                  <Icon src={taskCenterAddIcon} />
                </span>
                {I18N.carbonAgent.enterpriseTaskCreateTitle}
              </button>
            </div>
          ) : null}
        </div>

        <Spin spinning={loading} tip={I18N.carbonAgent.projectTasksLoading}>
          <div className={styles.taskList}>
            {loadFailed ? (
              <Empty
                className={styles.emptyState}
                description={I18N.carbonAgent.projectTasksLoadFailed}
              >
                <Button onClick={refresh}>{I18N.carbonAgent.retry}</Button>
              </Empty>
            ) : page?.items.length ? (
              page.items.map(task => (
                <EnterpriseCarbonTaskCard
                  key={task.id}
                  busy={busyTaskIds.includes(task.id)}
                  reportingEnabled={view === 'reported'}
                  task={{
                    ...task,
                    actions: getVisibleTaskActions(task),
                  }}
                  onDownloadFile={handleDownloadTaskFile}
                  onSaveTask={handleSaveTask}
                  onSelectProductFootprintAccount={
                    handleSelectProductFootprintAccount
                  }
                  onSubmitTask={handleSubmitTask}
                  onTaskAction={handleTaskAction}
                  onTaskReject={handleTaskRejectOpen}
                  onUploadFile={handleUploadTaskFile}
                  onViewProductFootprintAccount={onProductFootprintAccountOpen}
                />
              ))
            ) : (
              !loading && (
                <Empty
                  className={styles.emptyState}
                  description={I18N.carbonAgent.noData}
                />
              )
            )}
          </div>
        </Spin>

        {!loadFailed && (page?.total ?? 0) > 0 && (
          <Pagination
            className={styles.pagination}
            current={pageNum}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            showSizeChanger
            total={page?.total ?? 0}
            onChange={(nextPage, nextPageSize) => {
              if (nextPageSize !== pageSize) {
                setPageNum(1);
                setPageSize(nextPageSize);
              } else {
                setPageNum(nextPage);
              }
            }}
          />
        )}
      </div>

      <EnterpriseCarbonTaskCreateDialog
        allowed={canCreateTask}
        open={dialogOpen && canCreateTask}
        projectId={projectId}
        service={service}
        onCancel={() => setDialogOpen(false)}
        onSuccess={() => {
          setDialogOpen(false);
          refresh();
        }}
      />
      <EnterpriseCarbonTaskRejectDialog
        busy={rejectTaskId !== undefined && busyTaskIds.includes(rejectTaskId)}
        open={rejectTaskId !== undefined}
        onCancel={() => setRejectTaskId(undefined)}
        onConfirm={handleRejectTask}
      />
    </section>
  );
};

export default EnterpriseCarbonProjectTasks;
