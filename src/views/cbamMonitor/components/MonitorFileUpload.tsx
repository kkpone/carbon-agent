import {
  DeleteOutlined,
  DownloadOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button, Upload } from 'antd';
import type { UploadFile } from 'antd';
import { FC, ReactNode, useMemo, useState } from 'react';

import { commonRequestDownloadFile } from '@/api/commonRequest';
import { Toast } from '@/utils';
import { getToken } from '@/utils/cookie';

import { IconAlibabaNew } from '@/components/iconfont';

import styles from './MonitorFileUpload.module.less';

interface FileUploadItem
  extends Pick<UploadFile, 'name' | 'uid' | 'url' | 'size' | 'status'> {
  displaySize?: string;
  uploadTime?: string;
  rawUploadTime?: string;
}

interface FileUploadResponse {
  data?: string | { name?: string; url?: string };
}

const getUploadedFileUrl = (response?: FileUploadResponse) => {
  if (typeof response?.data === 'string') return response.data;
  return response?.data?.url || '';
};

const getUploadedFileName = (response?: FileUploadResponse) =>
  typeof response?.data === 'string' ? '' : response?.data?.name || '';

const downloadUploadedFile = async (
  file: FileUploadItem,
  resolveUrl?: (url: string) => Promise<string>,
) => {
  if (!file.url) {
    Toast('error', I18N.carbonData.downloadFailed);
    return;
  }
  try {
    await commonRequestDownloadFile(
      resolveUrl ? await resolveUrl(file.url) : file.url,
      file.name,
    );
  } catch {
    Toast('error', I18N.carbonData.downloadFailed);
  }
};

const FileUpload: FC<{
  fileList?: FileUploadItem[];
  fileSize?: number;
  fileCount?: number;
  fileTypeList?: string[];
  disabled?: boolean;
  detailed?: boolean;
  singleColumn?: boolean;
  detailedFileIcon?: string;
  onConfirmDelete?: (file: FileUploadItem, onOk: () => void) => void;
  resolveUrl?: (url: string) => Promise<string>;
  uploadAction?: string;
  buttonClassName?: string;
  buttonText?: ReactNode;
  buttonIcon?: ReactNode;
  replaceOnUpload?: boolean;
  onChange: (val: FileUploadItem[]) => void;
}> = ({
  fileList,
  fileSize = 50,
  fileCount = 10,
  fileTypeList = [
    'xls',
    'xlsx',
    'pdf',
    'jpg',
    'jpeg',
    'png',
    'doc',
    'docx',
    'rar',
    'zip',
  ],
  disabled,
  detailed,
  singleColumn,
  detailedFileIcon,
  onConfirmDelete,
  resolveUrl,
  uploadAction = '/file/file/uploadImg',
  buttonClassName,
  buttonText,
  buttonIcon,
  replaceOnUpload = false,
  onChange,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<FileUploadItem[]>([]);
  const displayedFileList = useMemo(
    () => [
      ...(fileList || []),
      ...uploadingFiles.filter(
        uploadingFile =>
          !(fileList || []).some(file => file.uid === uploadingFile.uid),
      ),
    ],
    [fileList, uploadingFiles],
  );
  const removeFile = (file: FileUploadItem) => {
    const remove = () =>
      onChange(
        (fileList || []).filter(item =>
          detailed ? item.uid !== file.uid : item.url !== file.url,
        ),
      );
    if (onConfirmDelete) onConfirmDelete(file, remove);
    else remove();
  };
  const renderFileActions = (file: FileUploadItem) => {
    if (file.status === 'uploading') return <LoadingOutlined />;
    if (detailed) {
      return (
        <>
          <button
            type='button'
            className={styles.downloadAction}
            onClick={() => downloadUploadedFile(file, resolveUrl)}
          >
            {I18N.cbamMonitor.download}
          </button>
          {!disabled && (
            <button
              type='button'
              className={styles.deleteAction}
              onClick={() => removeFile(file)}
            >
              {I18N.cbamMonitor.delete}
            </button>
          )}
        </>
      );
    }
    return (
      <>
        <DownloadOutlined
          className={styles.operateIcon}
          onClick={() => downloadUploadedFile(file, resolveUrl)}
        />
        {!disabled && (
          <DeleteOutlined
            className={styles.operateIcon}
            onClick={() => removeFile(file)}
          />
        )}
      </>
    );
  };
  return (
    <>
      <Upload<FileUploadResponse>
        accept={fileTypeList
          .flatMap(type => [`.${type}`, `.${type.toUpperCase()}`])
          .join(', ')}
        action={`${process.env.REACT_APP_API_URL || ''}${uploadAction}`}
        headers={{
          Authorization: getToken(),
        }}
        name='file'
        fileList={displayedFileList}
        showUploadList={false}
        beforeUpload={file => {
          const { name } = file;
          const fileType = name.split('.').pop();

          if (!fileTypeList.includes((fileType ?? '').toLowerCase())) {
            Toast(
              'error',
              I18N.template(I18N.supplyChain.onlySupportsFi, {
                val1: fileTypeList.join(','),
              }),
            );
            return Upload.LIST_IGNORE;
          }

          if (file.size > fileSize * 1024 * 1024) {
            Toast('error', I18N.carbonFootprint3.fileMaximumNot);
            return Upload.LIST_IGNORE;
          }

          if (!replaceOnUpload && displayedFileList.length >= fileCount) {
            Toast(
              'error',
              I18N.template(I18N.components.maxNumberOfFiles, {
                val1: fileCount,
              }),
            );
            return Upload.LIST_IGNORE;
          }

          return true;
        }}
        onChange={e => {
          setUploadingFiles(
            e.fileList.filter(file => file.status === 'uploading'),
          );
          if (e.file.status === 'error') {
            Toast('error', I18N.carbonFootprint3.uploadFailedPlease);
            return;
          }
          if (e.file.status !== 'done') return;
          const url = e.file.url || getUploadedFileUrl(e.file.response);
          if (!url) {
            Toast('error', I18N.carbonFootprint3.uploadFileUrlMissing);
            return;
          }
          const uploadedFile = {
            ...e.file,
            name: getUploadedFileName(e.file.response) || e.file.name,
            url,
          };
          onChange(
            replaceOnUpload
              ? [uploadedFile]
              : [
                  ...(fileList || []).filter(
                    item => item.uid !== e.file.uid && item.url !== url,
                  ),
                  uploadedFile,
                ],
          );
        }}
      >
        {!disabled && (
          <Button
            className={buttonClassName}
            icon={
              buttonIcon === undefined ? (
                <IconAlibabaNew
                  className={styles.uploadIcon}
                  type='icon-icon-shangchuan'
                />
              ) : (
                buttonIcon
              )
            }
          >
            {buttonText || I18N.emission.uploadSourceFiles}
          </Button>
        )}
      </Upload>
      {displayedFileList.length > 0 && (
        <div
          className={
            detailed
              ? `${styles.detailedFileContent} ${
                  singleColumn ? styles.singleColumnDetailedFileContent : ''
                }`
              : styles.fileContent
          }
        >
          {displayedFileList.map(file => (
            <div
              className={detailed ? styles.detailedFileItem : styles.fileItem}
              key={file.uid}
            >
              {detailed ? (
                <div className={styles.detailedFileInfo}>
                  <img
                    className={styles.detailedFileIcon}
                    src={
                      detailedFileIcon ||
                      (/\.xlsx?$/i.test(file.name)
                        ? '/images/icon-excel.png'
                        : '/images/file-icon.svg')
                    }
                    alt=''
                  />
                  <div className={styles.detailedFileText}>
                    <div className={styles.fileName} title={file.name}>
                      {file.name}
                    </div>
                    <div className={styles.detailedFileMeta}>
                      <span>
                        {I18N.cbamMonitor.fileSizeLabel}
                        {file.displaySize || '--'}
                      </span>
                      <span>
                        {I18N.cbamMonitor.uploadTimeLabel}
                        {file.uploadTime || '--'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className={styles.fileName} title={file.name}>
                  {file.name}
                </div>
              )}
              <div
                className={detailed ? styles.detailedOperate : styles.operate}
              >
                {renderFileActions(file)}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FileUpload;
