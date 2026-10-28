import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { MemoryRouter, Route } from 'react-router-dom';

import { EmbeddedFormActionsBoundary } from '@/components/FormActions';
import { CbamReportPreviewProvider } from '@/views/cbam/ReportForm/Info/context';

import style from '../index.module.less';

const CbamReportInfo = lazy(() => import('@/views/cbam/ReportForm/Info'));

type CbamReportPreviewProps = {
  cbamId: number | string;
  onBack?: () => void;
};

const CbamReportPreview = ({ cbamId, onBack }: CbamReportPreviewProps) => {
  const previewPath = `/cbam/report/edit/${encodeURIComponent(String(cbamId))}`;

  return (
    <div className={style.cbamReportPreview}>
      <MemoryRouter initialEntries={[previewPath]} key={previewPath}>
        <Route path='/cbam/report/:pageTypeInfo/:id'>
          <CbamReportPreviewProvider onBack={onBack} reportId={cbamId}>
            <EmbeddedFormActionsBoundary>
              <Suspense
                fallback={
                  <div className={style.previewLoading}>
                    <Spin />
                  </div>
                }
              >
                <CbamReportInfo />
              </Suspense>
            </EmbeddedFormActionsBoundary>
          </CbamReportPreviewProvider>
        </Route>
      </MemoryRouter>
    </div>
  );
};

export default CbamReportPreview;
