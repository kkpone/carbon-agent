/**
 * @description 产品碳足迹批量解析建模弹框
 */
import {
  CheckCircleFilled,
  CloseOutlined,
  CloudUploadOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { downloadFile, sleep, Toast } from '@src/utils';
import {
  Button,
  Checkbox,
  Drawer,
  Dropdown,
  Input,
  Progress,
  Spin,
  Upload,
} from 'antd';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { MenuProps } from 'antd/es/menu';
import saveAs from 'file-saver';
import { CSSProperties, FC, useEffect, useMemo, useRef, useState } from 'react';

import { IconAlibabaNew } from '@/components/iconfont';

import AiIconImg from '../BatchCreateModel/ai-footprint3-modal.svg';
import { getBatchTaskInfo } from '../BatchCreateModel/service';
import type { BatchFile, BatchTaskInfo } from '../BatchCreateModel/type';
import {
  BATCH_FILE_ACCEPT,
  BATCH_FILE_MAX_COUNT,
  BATCH_FILE_MAX_SIZE_MB,
  formatBatchFileSizeText,
  isBatchUploadFileAllowed,
} from '../batchFileUpload';

import LevelDeleteIcon from './level-delete-icon.svg';
import styles from './index.module.less';
import { parseBatchTaskFile, saveBatchTask } from './service';
import {
  BatchParseFileWay,
  BatchTaskPayload,
  BatchUploadFile,
  LevelItem,
  UploadResponseData,
} from './type';

const { TextArea } = Input;

/** 层级上传最多 10 个 T 层级 */
const MAX_LEVEL_COUNT = 10;
const PROMPT_MAX_LENGTH = 2000;
/** 打开后短时间内忽略遮罩关闭，避免入口按钮连点误触 mask 导致弹框闪退 */
const DRAWER_MASK_CLOSE_GUARD_MS = 400;
/** 批量下载间隔，避免浏览器拦截连续触发的多次下载 */
const BATCH_DOWNLOAD_INTERVAL_MS = 300;

/** 参考排放源 Drawer 底部栏样式 */
const drawerFooterStyle: CSSProperties = {
  padding: '12px 32px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: 16,
  boxShadow: '0 -4px 4px rgba(0, 0, 0, 0.04)',
};

const fileIconMap: Record<string, string> = {
  xls: 'icon-icon-excel2',
  xlsx: 'icon-icon-excel2',
  doc: 'icon-icon-word',
  docx: 'icon-icon-word',
  pdf: 'icon-icon-pdf',
  csv: 'icon-icon-csv',
  jpg: 'icon-icon-jpg',
  jpeg: 'icon-icon-jpg',
  png: 'icon-icon-png',
};

type BatchParseModelProps = {
  open: boolean;
  onClose: () => void;
  /** 建模记录「待解析」查看时传入，用于回填已保存的解析任务 */
  batchId?: number;
  onTemplateDownload?: () => void | Promise<void>;
  /** 解析成功后预留回调，任务3打开解析结果弹框时可直接接入 */
  onParseSuccess?: (taskId?: number) => void;
};

const getFileType = (fileName?: string) =>
  fileName?.split('.').pop()?.toLocaleLowerCase() || '';

const getResponseData = (
  file: BatchUploadFile,
): UploadResponseData | undefined => {
  const data = file.response?.data;
  if (!data) {
    return undefined;
  }

  if (typeof data === 'string') {
    return {
      name: file.name,
      url: data,
    };
  }

  return data;
};

const getFileUrl = (file: BatchUploadFile) =>
  getResponseData(file)?.url || file.url || '';

const getFileName = (file: BatchUploadFile) =>
  getResponseData(file)?.name || file.name;

const getDefaultLevels = (): LevelItem[] => [{ level: 1, name: 'T1' }];

const getFinishedTaskId = (payload: BatchTaskPayload, responseData?: number) =>
  responseData || payload.id;

/** 将后端 dataFile 转为 Upload 组件可展示的文件列表 */
const batchFilesToUploadFiles = (
  batchId: number,
  dataFiles: BatchFile[],
): BatchUploadFile[] =>
  dataFiles.map((file, index) => ({
    uid: `batch-${batchId}-${index}-${file.url}`,
    name: file.name,
    status: 'done',
    url: file.url,
    size: file.size ? Number(file.size) : undefined,
    level: file.level ? Number(file.level) : undefined,
    response: {
      data: {
        name: file.name,
        url: file.url,
      },
    },
  }));

/** 根据已上传文件的 level 字段还原层级 Tab */
const buildLevelsFromFiles = (files: BatchUploadFile[]): LevelItem[] => {
  const levelSet = new Set<number>();
  files.forEach(file => levelSet.add(file.level || 1));
  return [...levelSet]
    .sort((a, b) => a - b)
    .map(level => ({ level, name: `T${level}` }));
};

const applyTaskInfo = (
  info: BatchTaskInfo,
  setters: {
    setTaskId: (id: number) => void;
    setUserContent: (value: string) => void;
    setFileWay: (value: BatchParseFileWay) => void;
    setFileList: (files: BatchUploadFile[]) => void;
    setSelectedUids: (uids: string[]) => void;
    setLevels: (levels: LevelItem[]) => void;
    setActiveLevel: (level: number) => void;
  },
) => {
  const nextFileWay = (info.fileWay ??
    BatchParseFileWay.NORMAL) as BatchParseFileWay;
  const uploadFiles = batchFilesToUploadFiles(info.id, info.dataFile || []);

  setters.setTaskId(info.id);
  setters.setUserContent(info.userContent || '');
  setters.setFileWay(nextFileWay);
  setters.setFileList(uploadFiles);
  setters.setSelectedUids([]);

  if (nextFileWay === BatchParseFileWay.LEVEL) {
    const nextLevels = buildLevelsFromFiles(uploadFiles);
    setters.setLevels(nextLevels.length > 0 ? nextLevels : getDefaultLevels());
    setters.setActiveLevel(nextLevels[0]?.level || 1);
  } else {
    setters.setLevels(getDefaultLevels());
    setters.setActiveLevel(1);
  }
};

const BatchParseModel: FC<BatchParseModelProps> = ({
  open,
  onClose,
  batchId,
  onTemplateDownload,
  onParseSuccess,
}) => {
  const [fileWay, setFileWay] = useState<BatchParseFileWay>(
    BatchParseFileWay.NORMAL,
  );
  const [userContent, setUserContent] = useState('');
  const [fileList, setFileList] = useState<BatchUploadFile[]>([]);
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [levels, setLevels] = useState<LevelItem[]>(getDefaultLevels);
  const [activeLevel, setActiveLevel] = useState(1);
  const [taskId, setTaskId] = useState<number>();
  const [saveLoading, setSaveLoading] = useState(false);
  const [parseLoading, setParseLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const drawerOpenedAtRef = useRef(0);

  // 建模记录「待解析」查看：按 batchId 拉取任务详情并回填表单
  useEffect(() => {
    if (!open || !batchId) {
      return undefined;
    }

    let cancelled = false;
    setInitLoading(true);

    getBatchTaskInfo(batchId)
      .then(resp => {
        if (cancelled || !resp.data?.data) {
          return;
        }
        applyTaskInfo(resp.data.data, {
          setTaskId,
          setUserContent,
          setFileWay,
          setFileList,
          setSelectedUids,
          setLevels,
          setActiveLevel,
        });
      })
      .catch(() => {
        if (!cancelled) {
          Toast('error', I18N.carbonFootprint3.requestFailed);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setInitLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [batchId, open]);

  const visibleFileList = useMemo(
    () =>
      fileWay === BatchParseFileWay.LEVEL
        ? fileList.filter(file => (file.level || 1) === activeLevel)
        : fileList,
    [activeLevel, fileList, fileWay],
  );

  const maxLevel = useMemo(
    () => Math.max(...levels.map(item => item.level), 1),
    [levels],
  );

  const isLevelLimitReached = levels.length >= MAX_LEVEL_COUNT;

  const selectedVisibleUids = visibleFileList
    .map(file => file.uid)
    .filter(uid => selectedUids.includes(uid));

  const allVisibleSelected =
    visibleFileList.length > 0 &&
    selectedVisibleUids.length === visibleFileList.length;

  const resetState = () => {
    setFileWay(BatchParseFileWay.NORMAL);
    setUserContent('');
    setFileList([]);
    setSelectedUids([]);
    setLevels(getDefaultLevels());
    setActiveLevel(1);
    setTaskId(undefined);
    setSaveLoading(false);
    setParseLoading(false);
  };

  /** 遮罩点击关闭：打开后短暂忽略，防止入口连点误关；显式关闭按钮仍走 onClose */
  const handleMaskClose = () => {
    if (Date.now() - drawerOpenedAtRef.current < DRAWER_MASK_CLOSE_GUARD_MS) {
      return;
    }
    onClose();
  };

  const updateFileWay = (nextFileWay: BatchParseFileWay) => {
    if (nextFileWay === fileWay) {
      return;
    }

    if (nextFileWay === BatchParseFileWay.LEVEL) {
      setFileList(prev =>
        prev.map(file => ({
          ...file,
          level: file.level || 1,
        })),
      );
      setActiveLevel(1);
    }

    setSelectedUids([]);
    setFileWay(nextFileWay);
  };

  const handleSelectAll = (event: CheckboxChangeEvent) => {
    const visibleUids = visibleFileList.map(file => file.uid);
    if (event.target.checked) {
      setSelectedUids(prev => [...new Set([...prev, ...visibleUids])]);
      return;
    }

    setSelectedUids(prev => prev.filter(uid => !visibleUids.includes(uid)));
  };

  const handleSelectFile = (uid: string, checked: boolean) => {
    setSelectedUids(prev =>
      checked
        ? [...new Set([...prev, uid])]
        : prev.filter(item => item !== uid),
    );
  };

  const handleDeleteFiles = (uids: string[]) => {
    if (uids.length === 0) {
      return;
    }

    setFileList(prev => prev.filter(file => !uids.includes(file.uid)));
    setSelectedUids(prev => prev.filter(uid => !uids.includes(uid)));
  };

  const handleDownloadFile = (file: BatchUploadFile) => {
    const url = getFileUrl(file);
    if (!url) {
      Toast('error', I18N.carbonFootprint3.fileUrlNotFound);
      return;
    }

    downloadFile(url, getFileName(file));
  };

  const handleBatchDownload = async (uids: string[] = selectedUids) => {
    const selectedFiles = fileList.filter(
      file =>
        uids.includes(file.uid) && file.status === 'done' && !!getFileUrl(file),
    );

    if (selectedFiles.length === 0) {
      Toast('error', I18N.carbonFootprint3.fileUrlNotFound);
      return;
    }

    Toast('success', I18N.components.batchDownload);
    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles[index];
      saveAs(getFileUrl(file)!, getFileName(file));
      if (index < selectedFiles.length - 1) {
        // eslint-disable-next-line no-await-in-loop -- 需顺序间隔触发，否则仅首个文件会下载
        await sleep(BATCH_DOWNLOAD_INTERVAL_MS);
      }
    }
  };

  const handleAddLevel = () => {
    if (isLevelLimitReached) {
      return;
    }
    const nextLevel = maxLevel + 1;
    setLevels(prev => [...prev, { level: nextLevel, name: `T${nextLevel}` }]);
    setActiveLevel(nextLevel);
  };

  /** 仅允许删除当前最大层级；需先清空该层级文件 */
  const handleDeleteLevel = (level: number) => {
    if (levels.length <= 1 || level !== maxLevel) {
      return;
    }
    const hasLevelFiles = fileList.some(file => (file.level || 1) === level);
    if (hasLevelFiles) {
      Toast('warning', I18N.carbonFootprint3.pleaseClearLevelFilesBeforeDelete);
      return;
    }
    const fallbackLevel = maxLevel - 1;
    setLevels(prev => prev.filter(item => item.level !== level));
    if (activeLevel === level) {
      setActiveLevel(fallbackLevel);
    }
  };

  const handleMoveFile = (uid: string, level: number) => {
    setFileList(prev =>
      prev.map(file => (file.uid === uid ? { ...file, level } : file)),
    );
  };

  const buildPayload = (): BatchTaskPayload => ({
    id: taskId,
    userContent: userContent.trim() || undefined,
    fileWay,
    dataFile: fileList
      .filter(file => file.status === 'done' && !!getFileUrl(file))
      .map(file => {
        const name = getFileName(file);
        return {
          name,
          url: getFileUrl(file),
          fileType: getFileType(name),
          size: String(file.size || 0),
          sizeUnit: 'B',
          level: String(file.level || 1),
        };
      }),
  });

  const validateBeforeSubmit = () => {
    if (fileList.length === 0) {
      Toast('error', I18N.carbonFootprint3.pleaseUploadFile);
      return false;
    }

    if (
      fileList.some(
        file => file.status === 'uploading' || file.status === undefined,
      )
    ) {
      Toast('warning', I18N.carbonFootprint3.fileUploadingPleaseWait);
      return false;
    }

    if (fileList.some(file => file.status === 'error')) {
      Toast('error', I18N.carbonFootprint3.pleaseRemoveFailedFiles);
      return false;
    }

    if (fileList.some(file => file.status === 'done' && !getFileUrl(file))) {
      Toast('error', I18N.carbonFootprint3.uploadFileUrlMissing);
      return false;
    }

    if (
      fileWay === BatchParseFileWay.LEVEL &&
      fileList.some(file => !file.level)
    ) {
      Toast('error', I18N.carbonFootprint3.pleaseSetFileLevel);
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    setSaveLoading(true);
    try {
      const payload = buildPayload();
      const { data } = await saveBatchTask(payload);
      setTaskId(getFinishedTaskId(payload, data.data));
      Toast('success', I18N.carbonFootprint3.batchTaskSaveSuccess);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleParse = async () => {
    if (!validateBeforeSubmit()) {
      return;
    }

    setParseLoading(true);
    try {
      const payload = buildPayload();
      const { data } = await parseBatchTaskFile(payload);
      const nextTaskId = getFinishedTaskId(payload, data.data);
      Toast('success', I18N.carbonFootprint3.batchTaskParseStarted);
      onParseSuccess?.(nextTaskId);
      onClose();
    } finally {
      setParseLoading(false);
    }
  };

  const renderUploadArea = () => (
    <div className={styles.uploadPanel}>
      <div className={styles.templateBlock}>
        <div className={styles.templateRow}>
          <span className={styles.templateMainText}>
            {I18N.carbonFootprint3.uploadByTemplatePrefix}
            <span
              className={styles.downloadTemplate}
              onClick={() => onTemplateDownload?.()}
            >
              {I18N.components.downloadTemplate}
            </span>
            {I18N.enterpriseCarbonAccount2.fillInAndUpload}
          </span>
          <span className={styles.templateTip}>
            {I18N.carbonFootprint3.uploadByTemplateTip}
          </span>
        </div>
        {fileWay === BatchParseFileWay.LEVEL ? (
          <div className={styles.levelUploadDesc}>
            {I18N.carbonFootprint3.levelUploadTip}
          </div>
        ) : null}
      </div>
      <Upload.Dragger
        className={styles.uploadDragger}
        disabled={fileList.length >= BATCH_FILE_MAX_COUNT}
        showUploadList={false}
        fileList={fileList}
        name='file'
        multiple
        accept={BATCH_FILE_ACCEPT}
        maxCount={BATCH_FILE_MAX_COUNT}
        action={`${process.env.REACT_APP_API_URL || ''}/file/file/uploadOSS`}
        beforeUpload={uploadFile => {
          if (!isBatchUploadFileAllowed(uploadFile.name)) {
            Toast('error', I18N.carbonFootprint3.batchUploadFileTypeInvalid);
            return false;
          }

          if (fileList.length >= BATCH_FILE_MAX_COUNT) {
            Toast(
              'error',
              I18N.template(I18N.carbonFootprint3.maxUploadFileCount, {
                val1: BATCH_FILE_MAX_COUNT,
              }),
            );
            return false;
          }

          if (uploadFile.size > BATCH_FILE_MAX_SIZE_MB * 1024 * 1024) {
            Toast(
              'error',
              I18N.template(I18N.components.theMaximumFileSizeIsNot, {
                val1: BATCH_FILE_MAX_SIZE_MB,
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
          setFileList(
            info.fileList
              .filter(file => !!file.status)
              .map(file => ({
                ...(file as BatchUploadFile),
                level:
                  (file as BatchUploadFile).level ||
                  (fileWay === BatchParseFileWay.LEVEL
                    ? activeLevel
                    : undefined),
              })),
          );
        }}
      >
        <CloudUploadOutlined className={styles.uploadIcon} />
        <div className={styles.uploadText}>
          {I18N.carbonFootprint3.dragFileHereOr}
          <span className={styles.uploadActionText}>
            {I18N.components.clickToUpload}
          </span>
        </div>
        <div className={styles.uploadTip}>
          {I18N.carbonFootprint3.batchUploadFileTip}
        </div>
      </Upload.Dragger>
    </div>
  );

  const renderFileList = () => (
    <div className={styles.fileListBlock}>
      <div className={styles.fileListHeader}>
        <div className={styles.fileListTitle}>{I18N.components.uploadList}</div>
        <div className={styles.fileActions}>
          <Checkbox
            checked={allVisibleSelected}
            indeterminate={
              selectedVisibleUids.length > 0 &&
              selectedVisibleUids.length < visibleFileList.length
            }
            onChange={handleSelectAll}
          >
            {I18N.carbonFootprint3.selectAll}
          </Checkbox>
          {selectedVisibleUids.length > 0 && (
            <>
              <span className={styles.selectedCount}>
                {I18N.carbonFootprint3.selectedFilePrefix}
                <span className={styles.selectedNumber}>
                  {selectedVisibleUids.length}
                </span>
                {I18N.carbonFootprint3.selectedFileSuffix}
              </span>
              <button
                type='button'
                className={styles.linkAction}
                onClick={() => handleBatchDownload(selectedVisibleUids)}
              >
                {I18N.carbonFootprint.download}
              </button>
              <button
                type='button'
                className={styles.dangerAction}
                onClick={() => handleDeleteFiles(selectedVisibleUids)}
              >
                {I18N.Factors.delete}
              </button>
            </>
          )}
        </div>
      </div>
      <div className={styles.fileList}>
        {visibleFileList.length === 0 ? (
          <div className={styles.emptyList}>
            {I18N.carbonFootprint3.noUploadedFiles}
          </div>
        ) : (
          visibleFileList.map(file => renderFileItem(file))
        )}
      </div>
    </div>
  );

  const renderFileItem = (file: BatchUploadFile) => {
    const fileType = getFileType(getFileName(file));
    const uploaded = file.status === 'done';
    const uploading = file.status === 'uploading';
    const failed = file.status === 'error';
    const moveMenuItems: MenuProps['items'] = levels
      .filter(level => level.level !== (file.level || 1))
      .map(level => ({
        key: String(level.level),
        label: `${I18N.carbonFootprint3.moveTo} ${level.name}`,
        onClick: () => handleMoveFile(file.uid, level.level),
      }));

    return (
      <div
        className={[
          styles.fileItem,
          uploading ? styles.fileItemUploading : '',
          selectedUids.includes(file.uid) ? styles.fileItemChecked : '',
        ]
          .filter(Boolean)
          .join(' ')}
        key={file.uid}
      >
        <Checkbox
          checked={selectedUids.includes(file.uid)}
          onChange={event => handleSelectFile(file.uid, event.target.checked)}
        />
        <div className={styles.fileInfo}>
          <div className={styles.fileTopRow}>
            <div className={styles.fileMain}>
              <IconAlibabaNew
                className={styles.fileIcon}
                type={fileIconMap[fileType] || fileIconMap.xls}
              />
              <div className={styles.fileMeta}>
                <div className={styles.fileNameRow}>
                  <span className={styles.fileName} title={getFileName(file)}>
                    {getFileName(file)}
                  </span>
                  {fileWay === BatchParseFileWay.LEVEL && (
                    <span className={styles.levelTag}>T{file.level || 1}</span>
                  )}
                </div>
                <div className={styles.fileSub}>
                  {formatBatchFileSizeText(file.size)}
                </div>
              </div>
            </div>
            <div className={styles.fileRight}>
              {uploading && (
                <span className={styles.uploadingPercent}>
                  {(file.percent || 0).toFixed(0)}%
                </span>
              )}
              {uploaded && (
                <span className={styles.uploadSuccess}>
                  <CheckCircleFilled />
                  {I18N.enterpriseCarbonAccount2.uploadSuccessful}
                </span>
              )}
              {failed && (
                <span className={styles.uploadFailed}>
                  <ExclamationCircleFilled />
                  {I18N.carbonFootprint3.uploadFailedPlease}
                </span>
              )}
              <div className={styles.fileOperate}>
                {fileWay === BatchParseFileWay.LEVEL &&
                  uploaded &&
                  moveMenuItems.length > 0 && (
                    <Dropdown
                      menu={{ items: moveMenuItems }}
                      trigger={['click']}
                    >
                      <button type='button' className={styles.linkAction}>
                        {I18N.carbonFootprint3.move}
                      </button>
                    </Dropdown>
                  )}
                {uploaded && (
                  <button
                    type='button'
                    className={styles.linkAction}
                    onClick={() => handleDownloadFile(file)}
                  >
                    {I18N.carbonFootprint.download}
                  </button>
                )}
                <button
                  type='button'
                  className={styles.dangerAction}
                  onClick={() => handleDeleteFiles([file.uid])}
                >
                  {I18N.Factors.delete}
                </button>
              </div>
            </div>
          </div>
          {uploading && (
            <Progress
              className={styles.progress}
              percent={file.percent}
              strokeWidth={4}
              showInfo={false}
              strokeColor='#026961'
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      open={open}
      width={700}
      destroyOnClose
      maskClosable={false}
      closable={false}
      placement='right'
      rootClassName='batchParseDrawer'
      title={
        <div className={styles.titleWrap}>
          <img src={AiIconImg} alt='AI' className={styles.aiLogo} />
          <span className={styles.modalTitle}>
            {I18N.carbonFootprint3.batchParseModeling}
          </span>
        </div>
      }
      extra={<CloseOutlined className={styles.closeIcon} onClick={onClose} />}
      styles={{
        header: {
          padding: '32px 32px 0',
          borderBottom: 'none',
        },
        body: {
          padding: '32px',
        },
      }}
      footerStyle={drawerFooterStyle}
      footer={
        <>
          <Button className={styles.footerBtn} onClick={onClose}>
            {I18N.carbonFootprint3.cancel}
          </Button>
          <Button
            className={styles.footerBtn}
            loading={saveLoading}
            disabled={parseLoading || initLoading}
            onClick={handleSave}
          >
            {I18N.carbonFootprint3.save}
          </Button>
          <Button
            type='primary'
            className={[styles.footerBtn, styles.primaryBtn].join(' ')}
            loading={parseLoading}
            disabled={saveLoading || initLoading}
            onClick={handleParse}
          >
            {I18N.carbonFootprint3.startParse}
          </Button>
        </>
      }
      afterOpenChange={visible => {
        if (visible) {
          drawerOpenedAtRef.current = Date.now();
          return;
        }
        resetState();
      }}
      onClose={handleMaskClose}
    >
      <Spin spinning={initLoading}>
        <div className={styles.formSection}>
          <div className={styles.labelRow}>
            <span className={styles.sectionLabel}>
              {I18N.carbonFootprint3.parsePrompt}
            </span>
          </div>
          <div className={styles.promptTextAreaWrap}>
            <TextArea
              className={styles.promptTextArea}
              style={{
                minHeight: 120,
                maxHeight: 280,
                resize: 'vertical',
              }}
              value={userContent}
              maxLength={PROMPT_MAX_LENGTH}
              placeholder={I18N.carbonFootprint3.parsePromptPlaceholder}
              onChange={event => setUserContent(event.target.value)}
            />
            <span className={styles.promptCount}>
              {userContent.length}/{PROMPT_MAX_LENGTH}
            </span>
          </div>
        </div>

        <div className={styles.formSection}>
          <div className={styles.fileHeader}>
            <span className={styles.sectionLabel}>
              {I18N.carbonFootprint3.dataFile}
            </span>
            <div className={styles.fileWayTabs}>
              <button
                type='button'
                className={[
                  styles.fileWayTab,
                  fileWay === BatchParseFileWay.NORMAL
                    ? styles.fileWayTabActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => updateFileWay(BatchParseFileWay.NORMAL)}
              >
                {I18N.carbonFootprint3.normalUpload}
              </button>
              <button
                type='button'
                className={[
                  styles.fileWayTab,
                  fileWay === BatchParseFileWay.LEVEL
                    ? styles.fileWayTabActive
                    : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => updateFileWay(BatchParseFileWay.LEVEL)}
              >
                {I18N.carbonFootprint3.levelUpload}
              </button>
            </div>
          </div>

          {fileWay === BatchParseFileWay.NORMAL ? (
            <>
              {renderUploadArea()}
              {renderFileList()}
            </>
          ) : (
            <div className={styles.levelPanel}>
              <div className={styles.levelSidebar}>
                <div className={styles.levelList}>
                  {levels.map(level => {
                    const isMaxDeletableLevel =
                      level.level === maxLevel && levels.length > 1;
                    return (
                      <div
                        key={level.level}
                        className={[
                          styles.levelItemWrap,
                          isMaxDeletableLevel
                            ? styles.levelItemWrapDeletable
                            : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <button
                          type='button'
                          className={[
                            styles.levelItem,
                            activeLevel === level.level
                              ? styles.levelItemActive
                              : '',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                          onClick={() => {
                            setActiveLevel(level.level);
                            setSelectedUids([]);
                          }}
                        >
                          {level.name}
                        </button>
                        {isMaxDeletableLevel ? (
                          <button
                            type='button'
                            className={styles.levelDeleteBtn}
                            aria-label={I18N.Factors.delete}
                            onClick={event => {
                              event.stopPropagation();
                              handleDeleteLevel(level.level);
                            }}
                          >
                            <img
                              src={LevelDeleteIcon}
                              alt=''
                              className={styles.levelDeleteIcon}
                            />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <button
                  type='button'
                  className={styles.addLevelBtn}
                  disabled={isLevelLimitReached}
                  onClick={handleAddLevel}
                >
                  <PlusOutlined className={styles.addLevelIcon} />
                  {I18N.carbonFootprint3.add}
                </button>
              </div>
              <div className={styles.levelContent}>
                {renderUploadArea()}
                {renderFileList()}
              </div>
            </div>
          )}
        </div>
      </Spin>
    </Drawer>
  );
};

export default BatchParseModel;
