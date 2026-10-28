import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import styles from './index.module.less';

const OperationReportInfo = lazy(
  () => import('@/views/cbamOperationReport/ReportInfo'),
);

type CbamOperationReportPreviewProps = {
  operationId: number | string;
  readonly?: boolean;
  refreshKey?: string;
};

const CbamOperationReportPreview = ({
  operationId,
  readonly = false,
  refreshKey,
}: CbamOperationReportPreviewProps) => {
  const previewPath = `/cbam/operationReport/edit?operationId=${encodeURIComponent(
    String(operationId),
  )}`;

  return (
    <div className={styles.preview}>
      <MemoryRouter initialEntries={[previewPath]} key={previewPath}>
        <Route path='/cbam/operationReport/edit'>
          <Suspense
            fallback={
              <div className={styles.loading}>
                <Spin />
              </div>
            }
          >
            <OperationReportInfo
              embedded
              readonly={readonly}
              refreshKey={refreshKey}
            />
          </Suspense>
        </Route>
      </MemoryRouter>
    </div>
  );
};

export default CbamOperationReportPreview;
