/**
 * @file 企业碳报告结果卡，展示报告文件并接入企业专属复核与认证操作区。
 */
import { DownOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import { useState } from 'react';

import {
  isEnterpriseCarbonReportFileReady,
  type EnterpriseCarbonReportFile,
} from '../../enterpriseBusinessCard';
import style from '../../index.module.less';
import { batchDownloadAgentReport } from '../../service';
import type { EnterpriseCarbonCertificationTarget } from '../enterpriseCarbonCertification/types';
import type { EnterpriseCarbonExpertReviewTarget } from '../enterpriseCarbonExpertReview/types';
import EnterpriseCarbonReviewCertificationActions from '../enterpriseCarbonReviewCertification/EnterpriseCarbonReviewCertificationActions';

type EnterpriseCarbonReportTarget = {
  enterpriseCarbonBizId?: string;
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  refreshKey?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  orgId?: string;
  title?: string;
  type: 'enterpriseCarbonReport';
  year?: string;
};

type EnterpriseCarbonReportCardProps = {
  canOpen: boolean;
  interactionDisabled?: boolean;
  messageId?: string;
  onOpen?: (target: EnterpriseCarbonReportTarget) => void;
  onOpenCertification?: (target: EnterpriseCarbonCertificationTarget) => void;
  onOpenExpertReview?: (target: EnterpriseCarbonExpertReviewTarget) => void;
  projectId?: string;
  sessionId?: string;
  showThirdPartyCertification?: boolean;
  target: EnterpriseCarbonReportTarget;
};

/**
 * 企业碳报告卡的专家复核暂时隐藏，相关代码保留。
 * 后续恢复报告专家复核时只需将该开关改为 true。
 */
const SHOW_ENTERPRISE_CARBON_REPORT_EXPERT_REVIEW = false;

const getFileName = (file: EnterpriseCarbonReportFile, index: number) =>
  file.fileName ||
  file.versionTypeLabel ||
  I18N.template(I18N.carbonAgent.enterpriseCarbonReportFileDefaultName, {
    val1: index + 1,
  });

const getFileLabel = (file: EnterpriseCarbonReportFile, index: number) =>
  getFileName(file, index).replace(/\.[a-z0-9]+$/i, '');

const getFileIdentity = (file: EnterpriseCarbonReportFile, index: number) =>
  [file.reportFileRecordId, file.versionType, file.path, file.fileName, index]
    .filter(Boolean)
    .join(':');

const downloadFile = (file: EnterpriseCarbonReportFile, index: number) => {
  if (!file.path) {
    return;
  }

  const link = document.createElement('a');
  link.href = file.path;
  link.download = getFileName(file, index);
  link.rel = 'noreferrer';
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  link.remove();
};

const EnterpriseCarbonReportCard = ({
  canOpen,
  interactionDisabled,
  messageId,
  onOpen,
  onOpenCertification,
  onOpenExpertReview,
  projectId,
  sessionId,
  showThirdPartyCertification,
  target,
}: EnterpriseCarbonReportCardProps) => {
  const [batchDownloading, setBatchDownloading] = useState(false);
  const fileEntries = (target.enterpriseCarbonFiles || []).map(
    (file, index) => ({ file, index }),
  );
  const readyFileEntries = fileEntries.filter(({ file }) =>
    isEnterpriseCarbonReportFileReady(file),
  );
  const defaultFileEntry = readyFileEntries[0] || fileEntries[0];

  const getOpenTarget = (
    file?: EnterpriseCarbonReportFile,
    index = 0,
  ): EnterpriseCarbonReportTarget => {
    if (!file) {
      return target;
    }

    const fileIdentity = getFileIdentity(file, index);

    return {
      ...target,
      enterpriseCarbonSelectedFile: file,
      refreshKey: [target.refreshKey, fileIdentity].filter(Boolean).join('|'),
      reportName: getFileName(file, index),
      reportUrl: file.path || target.reportUrl,
    };
  };

  const openFile = (file?: EnterpriseCarbonReportFile, index = 0) => {
    if (onOpen) {
      onOpen(getOpenTarget(file, index));
    }
  };

  const openCard = () => {
    openFile(defaultFileEntry?.file, defaultFileEntry?.index);
  };

  const parsedReportId = Number(
    target.reportId || target.enterpriseCarbonBizId,
  );
  const reportId =
    Number.isSafeInteger(parsedReportId) && parsedReportId > 0
      ? parsedReportId
      : undefined;
  const downloadAll = async () => {
    if (!reportId || batchDownloading) {
      return;
    }

    setBatchDownloading(true);
    try {
      const downloadUrl = await batchDownloadAgentReport(reportId);

      if (downloadUrl) {
        window.open(downloadUrl, '_blank', 'noopener,noreferrer');
      }
    } catch {
      // 请求层统一展示接口错误，组件仅负责恢复下载状态。
    } finally {
      setBatchDownloading(false);
    }
  };

  const downloadMenuItems = [
    {
      key: 'all',
      disabled: !reportId || batchDownloading,
      label: (
        <span className={style.enterpriseReportDownloadMenuLabel}>
          {I18N.carbonAgent.tabAll}
        </span>
      ),
      onClick: downloadAll,
    },
    ...readyFileEntries.map(({ file, index }) => {
      const fileLabel = getFileLabel(file, index);

      return {
        key: getFileIdentity(file, index) || String(index),
        label: (
          <span
            className={style.enterpriseReportDownloadMenuLabel}
            title={fileLabel}
          >
            {fileLabel}
          </span>
        ),
        onClick: () => downloadFile(file, index),
      };
    }),
  ];

  return (
    <div
      className={classNames(
        style.businessCard,
        style.enterpriseBusinessCard,
        style.enterpriseReportBusinessCard,
      )}
      aria-label={I18N.carbonAgent.enterpriseCarbonReportCardLabel}
      aria-disabled={!canOpen}
      data-disabled={!canOpen || undefined}
      role='button'
      tabIndex={canOpen ? 0 : -1}
      onClick={canOpen ? openCard : undefined}
      onKeyDown={event => {
        if (!canOpen || event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCard();
        }
      }}
    >
      <div className={style.enterpriseBusinessCardNotice}>
        <span className={style.businessCardSuccessIcon} aria-hidden='true' />
        <span>{I18N.carbonAgent.enterpriseCarbonReportReadyNotice}</span>
      </div>
      <div className={style.enterpriseBusinessCardPanel}>
        <strong className={style.enterpriseBusinessCardTitle}>
          {target.title ||
            target.reportName ||
            I18N.carbonAgent.enterpriseCarbonReportPreviewTitle}
        </strong>
        <p className={style.enterpriseBusinessCardDescription}>
          {I18N.carbonAgent.enterpriseCarbonReportPreviewHint}
        </p>
        {fileEntries.length ? (
          <div className={style.enterpriseReportBusinessCardActions}>
            {fileEntries.map(({ file, index }) => {
              const ready = isEnterpriseCarbonReportFileReady(file);
              const fileLabel = getFileLabel(file, index);

              return (
                <button
                  className={classNames(
                    style.reportBusinessCardButton,
                    style.enterpriseReportFileButton,
                  )}
                  disabled={!canOpen || !ready}
                  key={getFileIdentity(file, index) || String(index)}
                  type='button'
                  onClick={event => {
                    event.stopPropagation();
                    openFile(file, index);
                  }}
                  title={fileLabel}
                >
                  <span className={style.enterpriseReportFileButtonText}>
                    {fileLabel}
                  </span>
                </button>
              );
            })}
            {readyFileEntries.length === 1 ? (
              <button
                className={style.reportBusinessCardButton}
                disabled={!canOpen}
                type='button'
                onClick={event => {
                  event.stopPropagation();
                  const [entry] = readyFileEntries;
                  downloadFile(entry.file, entry.index);
                }}
              >
                {I18N.carbonAgent.download}
              </button>
            ) : null}
            {readyFileEntries.length > 1 ? (
              <Dropdown
                menu={{
                  items: downloadMenuItems,
                  onClick: ({ domEvent }) => domEvent.stopPropagation(),
                }}
                overlayClassName={style.enterpriseReportDownloadDropdown}
                trigger={['click']}
              >
                <button
                  className={style.reportBusinessCardButton}
                  disabled={!canOpen}
                  type='button'
                  onClick={event => event.stopPropagation()}
                >
                  <span>{I18N.carbonAgent.download}</span>
                  <DownOutlined />
                </button>
              </Dropdown>
            ) : null}
          </div>
        ) : null}
      </div>
      <EnterpriseCarbonReviewCertificationActions
        context={{
          agentSessionId: sessionId,
          enterpriseCarbonBizId: target.enterpriseCarbonBizId,
          enterpriseCarbonBizType: 'report',
          messageId,
          orgId: target.orgId,
          projectId,
          reportId: target.reportId || target.enterpriseCarbonBizId,
          snapshot: {
            title:
              target.title ||
              target.reportName ||
              I18N.carbonAgent.enterpriseCarbonReportPreviewTitle,
          },
          year: target.year,
        }}
        interactionDisabled={interactionDisabled}
        showExpertReview={SHOW_ENTERPRISE_CARBON_REPORT_EXPERT_REVIEW}
        showThirdPartyCertification={showThirdPartyCertification}
        onOpenCertification={onOpenCertification}
        onOpenExpertReview={onOpenExpertReview}
      />
    </div>
  );
};

export default EnterpriseCarbonReportCard;
