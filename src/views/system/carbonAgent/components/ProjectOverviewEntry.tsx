import projectOverviewBackIcon from '@src/assets/images/carbonAgent/icons/project-overview-back.svg';
import I18N from '@src/lang/I18N';
import { Spin } from 'antd';
import { lazy, Suspense, useEffect, useState } from 'react';

import ProjectOverview from './ProjectOverview';
import type { AgentProject } from '../constants';
import style from '../index.module.less';
import {
  type AgentProjectCalculation,
  type AgentProjectCalculationComparison,
  fetchAgentProjectDetail,
} from '../service';

const EnterpriseCarbonProjectOverview = lazy(
  () => import('./EnterpriseCarbonProjectOverview'),
);

type ProjectOverviewEntryProps = {
  mobile?: boolean;
  onBack: () => void;
  onComparisonReady: (
    comparison: AgentProjectCalculationComparison,
    accountIds: Array<number | string>,
    calculations: AgentProjectCalculation[],
  ) => void;
  onConversationOpen: (sessionId: string, title: string) => void;
  projectId: string;
};

const loadProjectDetail = (projectId: string, signal: AbortSignal) =>
  fetchAgentProjectDetail(projectId, signal);

const ProjectOverviewState = ({
  loading,
  mobile = false,
  onBack,
  onRetry,
}: {
  loading: boolean;
  mobile?: boolean;
  onBack: () => void;
  onRetry?: () => void;
}) => (
  <section className={style.projectOverviewPage}>
    {mobile ? null : (
      <header className={style.projectOverviewHeader}>
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
      </header>
    )}
    <div className={style.projectOverviewBody}>
      <div className={style.projectOverviewState}>
        {loading ? (
          <>
            <Spin />
            <span>{I18N.carbonAgent.projectListLoading}</span>
          </>
        ) : (
          <>
            <span>{I18N.carbonAgent.projectDetailLoadFailed}</span>
            {onRetry ? (
              <button type='button' onClick={onRetry}>
                {I18N.carbonAgent.retry}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  </section>
);

const ProjectOverviewEntry = ({
  mobile = false,
  onBack,
  onComparisonReady,
  onConversationOpen,
  projectId,
}: ProjectOverviewEntryProps) => {
  const [project, setProject] = useState<AgentProject>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setProject(undefined);
    setLoading(true);
    setLoadError(false);

    loadProjectDetail(projectId, abortController.signal)
      .then(nextProject => {
        if (!cancelled) {
          setProject(nextProject);
        }
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

  if (loading || !project) {
    return (
      <ProjectOverviewState
        loading={loading && !loadError}
        onBack={onBack}
        onRetry={loadError ? () => setRetryKey(value => value + 1) : undefined}
      />
    );
  }

  if (project.businessType === 'enterprise_carbon') {
    return (
      <Suspense
        fallback={
          <ProjectOverviewState loading mobile={mobile} onBack={onBack} />
        }
      >
        <EnterpriseCarbonProjectOverview
          key={project.id}
          mobile={mobile}
          onBack={onBack}
          project={project}
        />
      </Suspense>
    );
  }

  return (
    <ProjectOverview
      projectId={projectId}
      onBack={onBack}
      onComparisonReady={onComparisonReady}
      onConversationOpen={onConversationOpen}
    />
  );
};

export default ProjectOverviewEntry;
