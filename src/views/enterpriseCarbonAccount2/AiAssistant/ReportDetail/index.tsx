import { CdpRender } from '@src/components/CdpRender';
import { FullscreenModal } from '@src/components/FullscreenModal';
import { PdfRender } from '@src/components/PdfRender';
import { SearchInContent } from '@src/components/SearchInContent';
import I18N from '@src/lang/I18N';
import { useMount } from 'ahooks';
import { Spin } from 'antd';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { Assistant } from './components/Assistant';
import { CollapseRender } from './components/CollapseRender';
import { Feedback } from './components/Feedback';
import { Title } from './components/Title';
import styles from './index.module.less';
import { ReportData, getCdpReportDetail, getReportAnalysis } from './service';

enum EReportSource {
  cdp = 1,
  custom = 2,
}

const ReportDetail: React.FC = () => {
  const [cdpRenderData, setCdpRenderData] = useState();
  const [cdpLoading, setCdpLoading] = useState(true);

  const [reportData, setReportData] = useState<ReportData | undefined>();
  const [reportSource, setReportSource] = useState<1 | 2>();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const reportId = searchParams.get('reportId') || '';
  const [scale, setScale] = useState<number>(1);

  useMount(async () => {
    setCdpLoading(true);
    const result = await getCdpReportDetail({
      reportId: Number(reportId),
    }).finally(() => setCdpLoading(false));
    setCdpRenderData(result?.data?.data?.json);
  });

  useMount(async () => {
    const result = await getReportAnalysis({ reportId: Number(reportId) });
    setReportData(result.data.data);
    setReportSource(result.data.data.reportSource);
  });
  return (
    // Add component logic here

    <FullscreenModal>
      <div className={styles.wrapper}>
        <div className={styles.header}>
          <Title reportData={reportData} />
          <Feedback reportId={Number(reportId)} />
        </div>
        <div className={styles.content}>
          <div className={styles.left}>
            <div className={styles.leftHeader}>
              <div className={styles.leftTitle}>
                {I18N.enterpriseCarbonAccount2.reportContent}
              </div>
              <div>
                {reportSource === EReportSource.cdp && (
                  <SearchInContent contentId='formatted_responses_ndp__container' />
                )}
                {reportSource === EReportSource.custom && (
                  <div className={styles.scaleWrapper}>
                    <div
                      onClick={() =>
                        setScale(pre => {
                          const result = parseFloat((pre - 0.1).toFixed(10));
                          return result;
                        })
                      }
                      className={styles.scaleBtn}
                    >
                      -
                    </div>
                    <div>{parseFloat((scale * 100).toFixed(10))}%</div>
                    <div
                      onClick={() =>
                        setScale(pre => {
                          const result = parseFloat((pre + 0.1).toFixed(10));
                          return result;
                        })
                      }
                      className={styles.scaleBtn}
                    >
                      +
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className={styles.cdpRender}>
              {cdpLoading && (
                <div className={styles.loading}>
                  <Spin spinning={cdpLoading} />
                </div>
              )}
              {reportSource === EReportSource.custom && (
                <PdfRender url={reportData?.cdpUrl} scale={scale} />
              )}
              {reportSource === EReportSource.cdp && (
                <CdpRender reportData={cdpRenderData} />
              )}
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.rightHeader}>
              <div className={styles.title}>
                <span className={styles.ai}>AI </span>
                {I18N.enterpriseCarbonAccount2.unscramble}
              </div>
              <Assistant reportId={reportId} />
            </div>
            <div className={styles.rightContent}>
              <CollapseRender reportData={reportData} />
              <div className={styles.tip}>
                {I18N.enterpriseCarbonAccount2.theAnswerIsProvidedBy}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FullscreenModal>
  );
};
export default ReportDetail;
