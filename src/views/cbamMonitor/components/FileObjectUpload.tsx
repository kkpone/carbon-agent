import I18N from '@src/lang/I18N';
import moment from 'moment';
import { ReactNode, useMemo } from 'react';

import { showMonitorDeleteConfirm } from '../deleteConfirm';
import styles from '../plan.module.less';
import { FileObj } from '../types';
import FileUpload from './MonitorFileUpload';

interface FileObjectUploadProps {
  value?: FileObj[];
  onChange?: (value: FileObj[]) => void;
  maxCount: number;
  maxSize: number;
  disabled?: boolean;
  variant?: 'default' | 'boundary' | 'evidence' | 'evidenceAction';
  buttonIcon?: ReactNode;
  buttonText?: ReactNode;
  onDelete?: (file: FileObj) => void | Promise<void>;
  resolveUrl?: (url: string) => Promise<string>;
}

interface UploadValue {
  name: string;
  uid: string;
  url: string;
  size?: number;
  rawUploadTime?: string;
}

const fileNameFromUrl = (url?: string) => {
  const name = url?.split('?')[0].split('/').pop() || '';
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
};

const fileSizeToBytes = (size?: string, unit?: string) => {
  const value = Number(size);
  if (!Number.isFinite(value)) return undefined;
  if (unit?.toUpperCase() === 'MB') return value * 1024 * 1024;
  if (unit?.toUpperCase() === 'KB') return value * 1024;
  return value;
};

const formatFileSize = (size?: string, unit?: string) => {
  const bytes = fileSizeToBytes(size, unit);
  if (bytes === undefined) return '--';
  if (bytes >= 1024 * 1024)
    return `${Number((bytes / 1024 / 1024).toFixed(2))} MB`;
  if (bytes >= 1024) return `${Number((bytes / 1024).toFixed(2))} KB`;
  return `${bytes} B`;
};

export const FileObjectUpload = ({
  value = [],
  onChange,
  maxCount,
  maxSize,
  disabled,
  variant = 'default',
  buttonIcon,
  buttonText,
  onDelete,
  resolveUrl,
}: FileObjectUploadProps) => {
  const boundary = variant === 'boundary';
  const evidence = variant === 'evidence';
  const evidenceAction = variant === 'evidenceAction';
  const detailed = boundary || evidence;
  const validValue = useMemo(
    () => value.filter(file => Boolean(file.url?.trim() || file.name?.trim())),
    [value],
  );
  const fileList = useMemo(
    () =>
      validValue.map((file, index) => ({
        name:
          file.name?.trim() ||
          fileNameFromUrl(file.url) ||
          `${I18N.cbamMonitor.file} ${index + 1}`,
        uid: `${file.url || file.name || 'file'}-${
          file.uploadTime || index
        }-${index}`,
        url: file.url || '',
        size: fileSizeToBytes(file.size, file.unit),
        displaySize: formatFileSize(file.size, file.unit),
        uploadTime:
          file.uploadTime && moment(file.uploadTime).isValid()
            ? moment(file.uploadTime).format('YYYY.M.D')
            : file.uploadTime,
        rawUploadTime: file.uploadTime,
      })),
    [validValue],
  );
  let uploadWrapperClassName = styles.fileUpload;
  let uploadButtonClassName;
  let uploadButtonText;
  if (boundary) {
    uploadWrapperClassName = styles.boundaryFileUpload;
    uploadButtonClassName = styles.boundaryUploadButton;
    uploadButtonText = I18N.cbamMonitor.uploadFile;
  } else if (evidence) {
    uploadWrapperClassName = styles.evidenceFileUpload;
    uploadButtonClassName = styles.evidenceUploadButton;
    uploadButtonText = validValue.length
      ? I18N.cbamMonitor.updateFile
      : I18N.cbamMonitor.uploadFile;
  } else if (evidenceAction) {
    uploadWrapperClassName = styles.evidenceFileAction;
    uploadButtonClassName = styles.evidenceActionButton;
    uploadButtonText = buttonText || I18N.cbamMonitor.updateFile;
  }
  return (
    <div className={uploadWrapperClassName}>
      {boundary && (
        <div className={styles.boundaryUploadTip}>
          {I18N.cbamMonitor.boundaryUploadTip}
        </div>
      )}
      {evidence && (
        <div className={styles.evidenceUploadTip}>
          {I18N.cbamMonitor.evidenceUploadHint}
        </div>
      )}
      <FileUpload
        resolveUrl={resolveUrl}
        fileList={evidenceAction ? [] : fileList}
        fileCount={maxCount}
        fileSize={maxSize}
        fileTypeList={[
          'pdf',
          'jpg',
          'jpeg',
          'png',
          'doc',
          'docx',
          'xls',
          'xlsx',
        ]}
        disabled={disabled}
        detailed={detailed}
        singleColumn={evidence}
        detailedFileIcon={evidence ? '/images/file-icon.svg' : undefined}
        onConfirmDelete={(file, onOk) =>
          showMonitorDeleteConfirm({
            title: I18N.cbamMonitor.confirmDeleteFile,
            content: I18N.template(I18N.cbamMonitor.deleteFileTip, {
              name: file.name,
            }),
            onOk: async () => {
              await onDelete?.({
                name: file.name,
                url: file.url,
                uploadTime: file.rawUploadTime,
              });
              onOk();
            },
          })
        }
        uploadAction='/file/file/uploadOSS'
        buttonClassName={uploadButtonClassName}
        buttonText={uploadButtonText}
        buttonIcon={buttonIcon}
        replaceOnUpload={evidence || evidenceAction}
        onChange={items =>
          onChange?.(
            (items as UploadValue[])
              .filter(item => Boolean(item.url?.trim() || item.name?.trim()))
              .map(item => ({
                name: item.name,
                size: item.size ? `${item.size}` : undefined,
                unit: item.size ? 'B' : undefined,
                url: item.url,
                uploadTime:
                  item.rawUploadTime || moment().format('YYYY-MM-DD HH:mm:ss'),
              })),
          )
        }
      />
      {!detailed && (
        <div className={styles.uploadTip}>
          {I18N.template(I18N.cbamMonitor.uploadTip, {
            count: maxCount,
            size: maxSize,
          })}
        </div>
      )}
    </div>
  );
};
