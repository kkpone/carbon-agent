import uploadIcon from '@assets/svg/upload.svg';
import I18N from '@src/lang/I18N';
import { Modal, Progress, Upload, UploadFile } from 'antd';
import { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';

import { downloadFile, getTemplateFile, Toast } from '@/utils';

import styles from './index.module.less';
import { IconAlibabaNew } from '../iconfont';

export const fileIconMap = {
  xls: 'icon-icon-excel2',
  xlsx: 'icon-icon-excel2',
  doc: 'icon-icon-word',
  docx: 'icon-icon-word',
  pdf: 'icon-icon-pdf',
  csv: 'icon-icon-csv',
  jpg: 'icon-icon-jpg',
  jpeg: 'icon-icon-jpg',
  png: 'icon-icon-png',
  txt: 'icon-icon-txt',
};

type UploadListFile = UploadFile<{ data: { name: string; url: string } }>;

type FileUploadModalProps = {
  open: boolean;
  title?: string;
  width?: number;
  allowEmpty?: boolean;
  files?: UploadListFile[];
  accept?: string;
  maxCount?: number;
  maxSize?: number;
  titleIcon?: ReactNode;
  exampleText?: ReactNode;
  zIndex?: number;
  templateDictType?: string;
  templateDictValue?: string;
  onClose: () => void;
  onConfirm: (files: UploadListFile[]) => void | Promise<void>;
  onTemplateDownload?: () => void | Promise<void>;
};

const FileUploadModal: FC<FileUploadModalProps> = ({
  open,
  title,
  width = 687,
  allowEmpty = true,
  files,
  accept = '.xls, .xlsx, .pdf, .jpg, .png, .doc, .docx, .csv, .txt, .XLS, .XLSX, .PDF, .JPG, .PNG, .DOC,.DOCX, .CSV, .TXT',
  titleIcon,
  maxCount = 12,
  maxSize = 10,
  exampleText,
  zIndex,
  templateDictType,
  templateDictValue,
  onClose,
  onConfirm,
  onTemplateDownload,
}) => {
  const [loading, setLoading] = useState(false);

  const [fileList, setFileList] = useState<UploadListFile[]>([]);

  const divRef = useRef<HTMLDivElement>(null);

  const acceptFileStringTransform = () =>
    [
      ...new Set(
        accept
          .toLocaleLowerCase()
          .replace(/\s/g, '')
          .split(',')
          .map(fileType =>
            ['.xls', '.xlsx'].includes(fileType)
              ? 'Excel'
              : fileType.replace('.', ''),
          ),
      ),
    ].join('、');

  const submit = async () => {
    if (
      (fileList.length === 0 && !allowEmpty) ||
      fileList.some(file => file.status !== 'done')
    ) {
      Toast('error', I18N.Certification.pleaseSelectAFile);
      return;
    }
    try {
      setLoading(true);
      await onConfirm(fileList);
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const fileInput = divRef.current?.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement | null;
    const { clipboardData } = e;

    if (!clipboardData || !fileInput) {
      return;
    }

    const pasteText = clipboardData.getData('text/plain').trim();
    const pasteFiles = [...clipboardData.items]
      .map(item => item.getAsFile())
      .filter((file): file is File => !!file);

    if (!pasteText && pasteFiles.length === 0) {
      return;
    }

    e.preventDefault();

    const dataTransfer = new DataTransfer();

    // 先保留已有文件
    [...(fileInput.files || [])].forEach(file => dataTransfer.items.add(file));

    // 粘贴文本转为 txt 文件
    if (pasteText) {
      dataTransfer.items.add(
        new File([pasteText], `paste_text_${Date.now()}.txt`, {
          type: 'text/plain',
          lastModified: Date.now(),
        }),
      );
    }

    // 粘贴的文件
    pasteFiles.forEach(file => dataTransfer.items.add(file));

    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));
  }, []);

  useEffect(() => {
    if (files instanceof Array) {
      setFileList(files);
    }
  }, [files]);

  useEffect(() => {
    if (open) {
      document.addEventListener('paste', handlePaste);
    }

    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [open, handlePaste]);

  return (
    <Modal
      open={open}
      width={width}
      mask={false}
      title={
        <div className={styles.modalTitle}>
          {titleIcon ?? (
            <IconAlibabaNew className={styles.aiIcon} type='icon-icon-AI' />
          )}
          <span className={styles.modalTitleText}>{title}</span>
        </div>
      }
      okButtonProps={{ loading }}
      zIndex={zIndex}
      afterClose={() => {
        if (!files) {
          setFileList([]);
        }
      }}
      onCancel={onClose}
      onClose={onClose}
      onOk={submit}
    >
      <div ref={divRef}>
        {exampleText}
        <div className={styles.uploadContent}>
          <Upload.Dragger
            className={styles.uploadDragger}
            disabled={fileList.length >= maxCount}
            showUploadList={false}
            fileList={fileList}
            name='file'
            multiple
            accept={accept}
            maxCount={maxCount}
            action={`${
              process.env.REACT_APP_API_URL || ''
            }/file/file/uploadOSS`}
            beforeUpload={uploadFile => {
              if (uploadFile.size > maxSize * 1024 * 1024) {
                Toast(
                  'error',
                  I18N.template(I18N.components.theMaximumFileSizeIsNot, {
                    val1: maxSize,
                  }),
                );
                return false;
              }

              if (fileList.some(file => file.name === uploadFile.name)) {
                Toast('error', I18N.components.pleaseDoNotRepeat);
                return false;
              }
              return true;
            }}
            onChange={info => {
              setFileList(info.fileList.filter(file => !!file.status));
            }}
          >
            <img alt='' src={uploadIcon} />
            <div className={styles.uploadText}>
              <span>{I18N.components.dragAndDropTheFile}</span>
              <span className={styles.strokeText}>
                {I18N.components.clickToUpload}
              </span>
              <span>{I18N.components.youCanAlsoReplyDirectly}</span>
            </div>
            <span className={styles.uploadTip}>
              {I18N.template(I18N.components.supportAcc, {
                val1: acceptFileStringTransform(),
                val2: maxCount,
                val3: maxSize,
              })}
            </span>
          </Upload.Dragger>
        </div>
        {((templateDictType && templateDictValue) || onTemplateDownload) && (
          <div className={styles.downloadText}>
            <span>{I18N.carbonAccount.adopt}</span>
            <span
              className={styles.strokeText}
              onClick={() => {
                if (onTemplateDownload) {
                  onTemplateDownload();
                  return;
                }
                getTemplateFile({ dictTypes: templateDictType! }).then(
                  ({ data }) => {
                    data.data.footprint3_export_template.forEach(
                      ({ dictValue, dictLabel, relatedValue }) => {
                        if (dictValue === templateDictValue) {
                          downloadFile(relatedValue, dictLabel);
                        }
                      },
                    );
                  },
                );
              }}
            >
              {I18N.components.downloadTemplate}
            </span>
            <span>{I18N.enterpriseCarbonAccount2.fillInAndUpload}</span>
          </div>
        )}
        {fileList.length > 0 && (
          <div className={styles.fileListContent}>
            <div className={styles.fileListTitle}>
              {I18N.components.uploadList}
            </div>
            <div className={styles.fileList}>
              {fileList.map(file => {
                const { uid, name, size, status, percent } = file;
                const fileType = (
                  name.split('.').pop() || ''
                ).toLocaleLowerCase();
                const uploaded = status === 'done';

                return (
                  <div className={styles.file} key={uid}>
                    <div className={styles.fileInfoRow}>
                      <IconAlibabaNew
                        className={styles.fileTypeIcon}
                        type={fileIconMap[fileType] || fileIconMap.xls}
                      />
                      <div className={styles.fileInfo}>
                        <div className={styles.fileName}>{name}</div>
                        <div className={styles.fileSizeRow}>
                          <div className={styles.fileSize}>
                            {((size || 0) / 1024).toFixed(2)}kb
                          </div>
                        </div>
                      </div>
                      <div className={styles.fileInfoRight}>
                        <div className={styles.fileOperation}>
                          {uploaded && (
                            <div className={styles.uploadStatusContent}>
                              <IconAlibabaNew
                                className={styles.uploadStatusIcon}
                                type='icon-icon-tongguo'
                              />
                              <span className={styles.uploadSuccessText}>
                                {I18N.enterpriseCarbonAccount2.uploadSuccessful}
                              </span>
                            </div>
                          )}
                          {uploaded && (
                            <div
                              className={styles.filePreviewBtn}
                              onClick={() => {
                                downloadFile(
                                  file.response?.data?.url || '',
                                  file.name,
                                );
                              }}
                            >
                              {I18N.carbonFootprint.download}
                            </div>
                          )}
                          <div
                            className={styles.fileCloseBtn}
                            onClick={() => {
                              setFileList(
                                fileList.filter(
                                  fileItem => fileItem.uid !== uid,
                                ),
                              );
                            }}
                          >
                            {I18N.Factors.delete}
                          </div>
                        </div>
                        {!uploaded && (
                          <div className={styles.uploadPercent}>
                            {percent?.toFixed(2)}%
                          </div>
                        )}
                      </div>
                    </div>
                    {!uploaded && (
                      <Progress
                        percent={percent}
                        strokeWidth={4}
                        showInfo={false}
                        strokeColor='#026961'
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FileUploadModal;
