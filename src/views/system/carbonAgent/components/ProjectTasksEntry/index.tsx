import I18N from '@src/lang/I18N';
import { Button, Spin } from 'antd';
import { lazy, Suspense, useEffect, useState } from 'react';

import type { AgentProject } from '../../constants';
import { fetchAgentProjectDetail } from '../../service';
import ProjectTasks from '../ProjectTasks';

import styles from './index.module.less';

const EnterpriseCarbonProjectTasks = lazy(
  () => import('../EnterpriseCarbonProjectTasks'),
);

type ProjectTasksEntryProps = {
  initialTaskId?: string;
  onBack: () => void;
  onConversationStart: (taskId: string) => void;
  onProductFootprintAccountOpen?: (accountId: string) => void;
  projectId: string;
};

const loadProjectDetail = (projectId: string, signal: AbortSignal) =>
  fetchAgentProjectDetail(projectId, signal);

const ProjectTasksEntryState = ({
  loading,
  onRetry,
}: {
  loading: boolean;
  onRetry?: () => void;
}) => (
  <section className={styles.state}>
    {loading ? (
      <Spin tip={I18N.carbonAgent.projectTasksLoading} />
    ) : (
      <>
        <span>{I18N.carbonAgent.projectTasksLoadFailed}</span>
        <Button size='small' onClick={onRetry}>
          {I18N.carbonAgent.retry}
        </Button>
      </>
    )}
  </section>
);

const ProjectTasksEntry = ({
  initialTaskId,
  onBack,
  onConversationStart,
  onProductFootprintAccountOpen,
  projectId,
}: ProjectTasksEntryProps) => {
  const [project, setProject] = useState<AgentProject>();
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setProject(undefined);
    setLoading(true);
    setLoadFailed(false);

    loadProjectDetail(projectId, abortController.signal)
      .then(nextProject => {
        if (!cancelled) {
          setProject(nextProject);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadFailed(true);
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

  if (loading || !project) {
    return (
      <ProjectTasksEntryState
        loading={loading && !loadFailed}
        onRetry={
          loadFailed ? () => setRetryKey(current => current + 1) : undefined
        }
      />
    );
  }

  if (project.businessType === 'enterprise_carbon') {
    return (
      <Suspense fallback={<ProjectTasksEntryState loading />}>
        <EnterpriseCarbonProjectTasks
          businessCapabilities={project.businessCapabilities}
          onProductFootprintAccountOpen={onProductFootprintAccountOpen}
          projectId={projectId}
        />
      </Suspense>
    );
  }

  return (
    <ProjectTasks
      initialTaskId={initialTaskId}
      projectId={projectId}
      onBack={onBack}
      onConversationStart={onConversationStart}
    />
  );
};

export default ProjectTasksEntry;
