import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import style from '../index.module.less';

const CbamMonitorPlan = lazy(() => import('@/views/cbamMonitor/Plan'));

type CbamMonitorPreviewProps = {
  planId: number | string;
  readonly?: boolean;
  refreshKey?: string;
};

const CbamMonitorPreview = ({
  planId,
  readonly = false,
  refreshKey,
}: CbamMonitorPreviewProps) => {
  const previewPath = `/cbam/monitor/edit/${encodeURIComponent(String(planId))}`;
  const previewKey = [previewPath, refreshKey].filter(Boolean).join('|');

  return (
    <div className={style.cbamMonitorPreview}>
      <MemoryRouter initialEntries={[previewPath]} key={previewKey}>
        <Route path='/cbam/monitor/:pageType/:id'>
          <Suspense
            fallback={
              <div className={style.previewLoading}>
                <Spin />
              </div>
            }
          >
            <CbamMonitorPlan embedded readonly={readonly} />
          </Suspense>
        </Route>
      </MemoryRouter>
    </div>
  );
};

export default CbamMonitorPreview;
