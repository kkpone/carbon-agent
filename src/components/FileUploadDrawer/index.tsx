import { EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import uploadIcon from '@assets/svg/upload.svg';
import I18N from '@src/lang/I18N';
import { Button, Checkbox, Popconfirm, Upload, UploadFile } from 'antd';
import { saveAs } from 'file-saver';
import { FC, ReactNode, useState } from 'react';

import { Toast } from '@/views/subModules/CarbonFootprintModel/components/Toast/verifty';

import styles from './index.module.less';
import { CustomDrawer } from '../CustomDrawer';
import { IconAlibaba } from '../iconfont';

const { Dragger } = Upload;

const FILE_TYPE = [
  '.png',
  '.PNG',
  '.jpg',
  '.JPG',
  '.JPEG',
  '.jpeg',
  '.xlsx',
  '.XLSX',
  '.XLS',
  '.xls',
  '.doc',
  '.DOC',
  '.docx',
  '.DOCX',
  '.pdf',
  '.PDF',
  '.rar',
  '.RAR',
  '.zip',
  '.ZIP',
];

const FILE_ICON_MAP = {
  '.png': 'icon-icon_file_img',
  '.PNG': 'icon-icon_file_img',
  '.jpg': 'icon-icon_file_img',
  '.JPG': 'icon-icon_file_img',
  '.JPEG': 'icon-icon_file_img',
  '.jpeg': 'icon-icon_file_img',
  '.xlsx': 'icon-icon_file-icon-excel',
  '.XLSX': 'icon-icon_file-icon-excel',
  '.XLS': 'icon-icon_file-icon-excel',
  '.xls': 'icon-icon_file-icon-excel',
  '.doc': 'icon-icon_file_word',
  '.DOC': 'icon-icon_file_word',
  '.docx': 'icon-icon_file_word',
  '.DOCX': 'icon-icon_file_word',
  '.pdf': 'icon-icon_file_pdf',
  '.PDF': 'icon-icon_file_pdf',
  '.rar': 'icon-icon_file_rar',
  '.RAR': 'icon-icon_file_rar',
  '.zip': 'icon-icon_file_rar',
  '.ZIP': 'icon-icon_file_rar',
};

interface Attachment {
  assetId?: number | string;
  id: number | string;
  name: string;
  url: string;
  percent?: number;
  status?: string;
}

type FileUploadDrawerBaseProps = {
  children: ReactNode;
  batch?: boolean;
  drawerWidth?: number | string;
  files?: Attachment[];
  disabled?: boolean;
  footerMode?: 'default' | 'close';
  isolateDragEvents?: boolean;
  maxCount?: number;
  placement?: 'bottom' | 'right';
  showPreview?: boolean;
  onDownload?: (file: Attachment) => void | Promise<void>;
  onDelete?: (files: Attachment[]) => void | Promise<void>;
  onBatchDownload?: (files: Attachment[]) => void | Promise<void>;
};

type FileUploadDrawerProps = FileUploadDrawerBaseProps &
  (
    | {
        onSuccess: (files: Attachment[]) => void | Promise<void>;
        uploadFile: (file: File) => Promise<Attachment>;
      }
    | {
        onSuccess: (files: Omit<Attachment, 'id'>[]) => void | Promise<void>;
        uploadFile?: undefined;
      }
  );

const FileUploadDrawer: FC<FileUploadDrawerProps> = props => {
  const {
    children,
    batch: propsBatch,
    drawerWidth = 560,
    files: propsFiles,
    disabled,
    footerMode = 'default',
    isolateDragEvents = false,
    maxCount,
    placement = 'right',
    showPreview = true,
    onDownload,
    onDelete,
    onBatchDownload,
  } = props;
  const { uploadFile } = props;
  const [open, setOpen] = useState(false);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [uploadedFileList, setUploadedFileList] = useState<Attachment[]>([]);

  const [selectedFileList, setSelectedFileList] = useState<Attachment[]>([]);

  const batch = propsBatch ?? true;

  const files = propsFiles ?? uploadedFileList;

  const filesLength = files.length;

  const selectedFilesLength = selectedFileList.length;

  const remainingUploadCount =
    maxCount === undefined ? undefined : Math.max(maxCount - filesLength, 0);

  return (
    <>
      <CustomDrawer
        title={I18N.components.uploadAttachments}
        height={placement === 'bottom' ? '80dvh' : undefined}
        open={open}
        placement={placement}
        width={drawerWidth}
        rootClassName={styles.uploadAttachmentDrawer}
        headerClassName={styles.uploadDrawerHeader}
        titleClassName={styles.uploadDrawerTitle}
        headerRightClassName={styles.uploadDrawerHeaderRight}
        closeButtonClassName={styles.uploadDrawerClose}
        closeButtonStyle={{ left: 0 }}
        styles={{
          content: {
            zIndex: 2999,
          },
        }}
        destroyOnClose
        footer={
          footerMode === 'close' ? (
            <div className={styles.drawerFooter}>
              <Button
                className={styles.drawerFooterButton}
                onClick={() => setOpen(false)}
              >
                {I18N.carbonFootPrintLCA.close}
              </Button>
            </div>
          ) : (
            <div className={styles.drawerFooter}>
              <Button
                className={styles.drawerFooterButton}
                onClick={() => setOpen(false)}
              >
                {I18N.carbonFootprint.cancel}
              </Button>
              <Button
                className={styles.drawerFooterButton}
                type='primary'
                onClick={() => setOpen(false)}
              >
                {I18N.carbonFootprint.confirm2}
              </Button>
            </div>
          )
        }
        afterOpenChange={() => {
          setFileList([]);
          setSelectedFileList([]);
          setUploadedFileList([]);
        }}
        onClose={() => setOpen(false)}
      >
        <div
          className={styles.uploadDrawerBody}
          onDragEnter={
            isolateDragEvents ? event => event.stopPropagation() : undefined
          }
          onDragLeave={
            isolateDragEvents ? event => event.stopPropagation() : undefined
          }
          onDragOver={
            isolateDragEvents ? event => event.stopPropagation() : undefined
          }
          onDrop={
            isolateDragEvents ? event => event.stopPropagation() : undefined
          }
        >
          <Dragger
            className={styles.fileUploadDrawer}
            disabled={
              disabled ||
              remainingUploadCount === 0 ||
              (maxCount !== undefined && fileList.length > 0)
            }
            multiple
            maxCount={remainingUploadCount}
            fileList={fileList}
            showUploadList={false}
            name='file'
            accept={FILE_TYPE.join(',')}
            action={
              uploadFile
                ? undefined
                : `${process.env.REACT_APP_API_URL || ''}/file/file/uploadImg`
            }
            customRequest={
              uploadFile
                ? async ({ file, onError, onProgress, onSuccess }) => {
                    try {
                      onProgress?.({ percent: 0 });
                      const attachment = await uploadFile(file as File);
                      onProgress?.({ percent: 100 });
                      onSuccess?.(attachment);
                    } catch (error) {
                      onError?.(
                        error instanceof Error
                          ? error
                          : new Error(String(error)),
                      );
                    }
                  }
                : undefined
            }
            beforeUpload={(candidateFile, candidateFiles) => {
              const candidateIndex = candidateFiles.indexOf(candidateFile);

              if (
                remainingUploadCount !== undefined &&
                candidateIndex >= remainingUploadCount
              ) {
                if (candidateIndex === remainingUploadCount) {
                  Toast(
                    'error',
                    I18N.template(I18N.components.maxNumberOfFiles, {
                      val1: maxCount,
                    }),
                  );
                }
                return Upload.LIST_IGNORE;
              }

              if (candidateFile.size > 50 * 1024 * 1024) {
                Toast('error', I18N.enterpriseCarbonAccount2.fileMaximumNot);
                return Upload.LIST_IGNORE;
              }
              return true;
            }}
            onChange={async ({ fileList: changeFiles }) => {
              const activeFiles = changeFiles.filter(
                ({ status }) => status !== 'error',
              );
              setFileList(activeFiles);

              const uploadSettled = changeFiles.every(
                ({ status }) => status === 'done' || status === 'error',
              );
              if (!uploadSettled) {
                return;
              }

              const completedFiles = changeFiles.filter(
                ({ status }) => status === 'done',
              );
              if (completedFiles.length === 0) {
                setFileList([]);
                return;
              }

              const attachments = completedFiles.map(file => {
                const response = file.response as
                  | Attachment
                  | { data?: string }
                  | undefined;

                return 'id' in (response || {})
                  ? (response as Attachment)
                  : {
                      id: file.uid,
                      name: file.name,
                      url: (response as { data?: string })?.data || '',
                    };
              });

              try {
                if (props.uploadFile) {
                  await props.onSuccess(attachments);
                } else {
                  await props.onSuccess(
                    attachments.map(({ name, url }) => ({ name, url })),
                  );
                }
                setUploadedFileList(current => [...current, ...attachments]);
              } finally {
                setFileList([]);
              }
            }}
          >
            <img className={styles.uploadIcon} src={uploadIcon} alt='' />
            <div className={styles.uploadText}>
              <span>{I18N.components.dragAndDropTheFile}</span>
              <span className={styles.uploadHighlightText}>
                {I18N.components.clickToUpload}
              </span>
            </div>
            <div className={styles.tipText}>{I18N.components.supportPdf}</div>
          </Dragger>
          <div className={styles.uploadingContent}>
            <div className={styles.uploadTip}>
              {I18N.components.uploading}
              {fileList.length}）
            </div>
            {fileList.map(file => {
              const { uid: id, name, percent } = file;
              return (
                <div className={styles.fileItem} key={id}>
                  <div>
                    <IconAlibaba
                      className={styles.fileIcon}
                      type={FILE_ICON_MAP[`.${name.split('.').pop()}`]}
                    />
                    <span>{name}</span>
                  </div>
                  <div className={styles.percent}>
                    <LoadingOutlined className={styles.percentLoading} />
                    <span>{Math.ceil(Number(percent))}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles.uploadingContent}>
            <div className={styles.uploadTip}>
              {filesLength > 0 && batch && (
                <Checkbox
                  className={styles.checkbox}
                  indeterminate={
                    selectedFilesLength > 0 && selectedFilesLength < filesLength
                  }
                  checked={selectedFilesLength === filesLength}
                  onChange={e => {
                    setSelectedFileList(e.target.checked ? files : []);
                  }}
                />
              )}
              {I18N.components.fileUploaded}
              {filesLength}）
              {selectedFilesLength > 0 && (
                <div className={styles.batchOperate}>
                  {onBatchDownload && (
                    <Button
                      className={styles.batchOperateBtn}
                      type='link'
                      onClick={() => onBatchDownload(selectedFileList)}
                    >
                      {I18N.components.batchDownload}
                    </Button>
                  )}
                  {!disabled && onDelete && (
                    <Popconfirm
                      title={I18N.template(I18N.components.confirmToDeleteS, {
                        val1: selectedFilesLength,
                      })}
                      onConfirm={async () => {
                        await onDelete(selectedFileList);
                        setSelectedFileList([]);
                      }}
                    >
                      <Button className={styles.batchOperateBtn} type='link'>
                        {I18N.components.batchDeletion}
                      </Button>
                    </Popconfirm>
                  )}
                </div>
              )}
            </div>
            {files.map(file => {
              const { id, name, url } = file;

              return (
                <div className={styles.fileItem} key={id}>
                  <div className={styles.fileItemLeft}>
                    {batch && (
                      <Checkbox
                        className={styles.checkbox}
                        checked={selectedFileList.some(f => f.id === id)}
                        onChange={e => {
                          setSelectedFileList(
                            e.target.checked
                              ? [...selectedFileList, file]
                              : selectedFileList.filter(f => f.id !== id),
                          );
                        }}
                      />
                    )}
                    <IconAlibaba
                      className={styles.fileIcon}
                      type={FILE_ICON_MAP[`.${name.split('.').pop()}`]}
                    />
                    <div className={styles.fileName} title={name}>
                      {name}
                    </div>
                  </div>
                  <div className={styles.fileOperate}>
                    <div
                      className={styles.fileOperateBtn}
                      onClick={() => {
                        if (onDownload) {
                          Promise.resolve(onDownload(file)).catch(
                            () => undefined,
                          );
                          return;
                        }
                        saveAs(url, name);
                      }}
                    >
                      <IconAlibaba type='icon-icon_daoru' />
                    </div>
                    {showPreview && (
                      <div
                        className={styles.fileOperateBtn}
                        onClick={() => {
                          window.open(url);
                        }}
                      >
                        <EyeOutlined />
                      </div>
                    )}
                    {!disabled && onDelete && (
                      <div
                        className={styles.fileOperateBtn}
                        onClick={() => onDelete([file])}
                      >
                        <IconAlibaba type='icon-icon_delete' />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CustomDrawer>
      <div
        onClick={() => {
          setOpen(!open);
        }}
      >
        {children}
      </div>
    </>
  );
};

export default FileUploadDrawer;
