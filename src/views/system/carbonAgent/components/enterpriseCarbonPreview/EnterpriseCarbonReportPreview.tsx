import I18N from '@src/lang/I18N';
import { Empty, Spin } from 'antd';
import { useEffect, useMemo, useState } from 'react';

import style from '../../index.module.less';
import {
  ENTERPRISE_CARBON_MODULE,
  getEnterpriseCarbonReportFiles,
  isEnterpriseCarbonReportFileReady,
  type EnterpriseCarbonReportFile,
} from '../../enterpriseBusinessCard';
import { fetchAgentShareBusinessDetail } from '../../service';

type EnterpriseCarbonReportPreviewProps = {
  files?: EnterpriseCarbonReportFile[];
  readonly?: boolean;
  reportId?: string;
  reportName?: string;
  shareId?: string;
};

const getFileIdentity = (file: EnterpriseCarbonReportFile, index: number) =>
  [file.reportFileRecordId, file.versionType, file.path, file.fileName, index]
    .filter(Boolean)
    .join(':');

const getReportFileName = (file: EnterpriseCarbonReportFile, index: number) =>
  file.fileName ||
  file.versionTypeLabel ||
  I18N.template(I18N.carbonAgent.enterpriseCarbonReportFileDefaultName, {
    val1: index + 1,
  });

const EnterpriseCarbonReportPreview = ({
  files,
  readonly = false,
  reportId,
  reportName,
  shareId,
}: EnterpriseCarbonReportPreviewProps) => {
  const initialFiles = useMemo(() => files || [], [files]);
  const [loadedFiles, setLoadedFiles] =
    useState<EnterpriseCarbonReportFile[]>(initialFiles);
  const [loading, setLoading] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    setLoadedFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    if (!readonly || !shareId || !reportId || initialFiles.length) {
      return undefined;
    }

    const abortController = new AbortController();

    setLoading(true);
    setLoadFailed(false);
    fetchAgentShareBusinessDetail(
      {
        bizId: reportId,
        bizType: 'report',
        module: ENTERPRISE_CARBON_MODULE,
        shareId,
      },
      abortController.signal,
    )
      .then(detail => {
        if (abortController.signal.aborted) {
          return;
        }

        setLoadedFiles(
          detail.files.length
            ? detail.files
            : getEnterpriseCarbonReportFiles([detail.detail || {}]),
        );
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => abortController.abort();
  }, [initialFiles, readonly, reportId, shareId]);

  return (
    <div className={style.enterpriseCarbonReportPreview}>
      <div className={style.enterpriseCarbonReportPreviewHeader}>
        <h3>
          {reportName || I18N.carbonAgent.enterpriseCarbonReportPreviewTitle}
        </h3>
      </div>
      <div className={style.enterpriseCarbonReportPreviewBody}>
        {loading ? (
          <div className={style.enterpriseCarbonReportPreviewState}>
            <Spin />
          </div>
        ) : loadFailed ? (
          <Empty
            description={I18N.carbonAgent.enterpriseCarbonReportLoadFailed}
          />
        ) : loadedFiles.length ? (
          <ul className={style.enterpriseCarbonReportFileList}>
            {loadedFiles.map((file, index) => {
              const ready = isEnterpriseCarbonReportFileReady(file);
              const fileName = getReportFileName(file, index);

              return (
                <li
                  className={style.enterpriseCarbonReportFileItem}
                  key={getFileIdentity(file, index)}
                >
                  <div className={style.enterpriseCarbonReportFileInfo}>
                    <strong>{fileName}</strong>
                    {file.versionTypeLabel || file.statusLabel ? (
                      <span>
                        {[file.versionTypeLabel, file.statusLabel]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    ) : null}
                    {!ready && file.message ? (
                      <span>{file.message}</span>
                    ) : null}
                  </div>
                  <div className={style.enterpriseCarbonReportFileActions}>
                    <a
                      aria-disabled={!ready}
                      className={style.enterpriseCarbonReportFileAction}
                      href={ready ? file.path : undefined}
                      rel='noreferrer'
                      target='_blank'
                    >
                      {I18N.carbonAgent.viewReport}
                    </a>
                    <a
                      aria-disabled={!ready}
                      className={style.enterpriseCarbonReportFileAction}
                      download={ready ? fileName : undefined}
                      href={ready ? file.path : undefined}
                      rel='noreferrer'
                      target='_blank'
                    >
                      {I18N.carbonAgent.download}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty description={I18N.carbonAgent.enterpriseCarbonReportNoFiles} />
        )}
      </div>
    </div>
  );
};

export default EnterpriseCarbonReportPreview;
