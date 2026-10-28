import { baseURL } from '@src/api/request';
import I18N from '@src/lang/I18N';
import { Alert, Button, message, Spin } from 'antd';
import axios from 'axios';
import saveAs from 'file-saver';
import { useEffect, useRef, useState } from 'react';
import style from '../index.module.less';
import { readOperationReportPreview } from '../operation/reportPreview';
import type { OperationReportOpenTarget } from '../operation/reportPreview';

import ReportResultCard from './ReportResultCard';
import type { OperationDownloadAccess } from '../operation/reportDownload';

export { getOperationReportDownloadAccess } from '../operation/reportDownload';

export default function CbamOperationReportDownload({
  access,
  disabled = false,
  restricted = false,
  onOpen,
}: {
  access: OperationDownloadAccess;
  disabled?: boolean;
  restricted?: boolean;
  onOpen?: (target: OperationReportOpenTarget) => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState('');
  const context = useRef(0);
  useEffect(() => {
    context.current += 1;
    setOpening(false);
    setError('');
    return () => {
      context.current += 1;
    };
  }, [access.body.sessionId, access.fileId, restricted]);
  const openReport = async () => {
    if (disabled || restricted || opening || !access.fileId || !onOpen) return;
    const { current } = context;
    setOpening(true);
    setError('');
    try {
      const report = await readOperationReportPreview(
        access.body.sessionId,
        access.fileId,
      );
      if (current !== context.current) return;
      onOpen({
        type: 'report',
        reportId: access.fileId,
        reportName: report.fileName,
        reportUrl: report.reportUrl,
        reportReadonly: true,
        reportKind: 'cbamOperation',
        reportLabel:
          report.language === 'EN'
            ? I18N.cbamOperationReport.agentReportEnTab
            : I18N.cbamOperationReport.agentReportZhTab,
        refreshKey: `${access.fileId}:${report.sourceDataVersion ?? ''}`,
      });
    } catch (cause) {
      if (current === context.current)
        setError(
          cause instanceof Error
            ? cause.message
            : I18N.cbamMonitor.agentLoadFailed,
        );
    } finally {
      if (current === context.current) setOpening(false);
    }
  };
  const download = async () => {
    if (disabled || restricted || downloading) return;
    setDownloading(true);
    try {
      const options = {
        baseURL,
        method: 'POST' as const,
        url: access.path,
        data: access.body,
        responseType: 'blob' as const,
        silentResponseError: true,
      };
      const { data } = await axios.request<Blob>(options);
      if (!data.size || !/officedocument|octet-stream|zip/i.test(data.type)) {
        throw new Error(I18N.cbamOperationReport.reportGenerateFailed);
      }
      saveAs(
        data,
        access.fileName ||
          ('operationId' in access.body
            ? `CBAM_Operator_Report_${
                access.body.operationId
              }_${access.body.language.toLowerCase()}.docx`
            : 'CBAM_Operator_Report.docx'),
      );
    } catch {
      message.error(I18N.cbamOperationReport.reportGenerateFailed);
    } finally {
      setDownloading(false);
    }
  };
  if (access.fileId) {
    return (
      <section data-screen-label='Operation conversation result'>
        <ReportResultCard
          title={access.fileName || 'CBAM Operator Report'}
          notice={I18N.cbamOperationReport.agentReportGenerated}
          hint={
            restricted
              ? I18N.cbamMonitor.agentPrivateResource
              : [
                  access.language
                    ? access.language === 'EN'
                      ? I18N.cbamMonitor.agentEnglishReport
                      : I18N.cbamMonitor.agentChineseReport
                    : undefined,
                  `${I18N.cbamOperationReport.agentFileSourceVersion}: ${access.sourceDataVersion}`,
                ]
                  .filter(Boolean)
                  .join(' · ')
          }
          viewLabel={I18N.cbamMonitor.agentViewReport}
          disabled={disabled || restricted || opening || !onOpen}
          onOpen={openReport}
          extraActions={
            !restricted && (
              <button
                type='button'
                className={style.reportBusinessCardButton}
                disabled={disabled || downloading}
                onClick={download}
              >
                {I18N.cbamMonitor.agentDownload}
              </button>
            )
          }
        />
        {opening && <Spin size='small' />}
        {error && <Alert type='error' showIcon message={error} />}
      </section>
    );
  }
  return (
    <Button
      type='link'
      disabled={disabled || restricted}
      loading={downloading}
      onClick={download}
    >
      {I18N.cbamOperationReport.download}
    </Button>
  );
}
