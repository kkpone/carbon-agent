import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  LeftOutlined,
  PaperClipOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { getUserInfo } from '@src/utils';
import { Empty, Image, Modal, Select, Spin, Switch, message } from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ClipboardEvent as ReactClipboardEvent,
  DragEvent as ReactDragEvent,
} from 'react';

import bugIcon from '@/assets/images/carbonAgent/feedback/bug.svg';
import featureIcon from '@/assets/images/carbonAgent/feedback/feature.svg';
import officialReplyIcon from '@/assets/images/carbonAgent/feedback/official-reply.svg';
import recordsIcon from '@/assets/images/carbonAgent/feedback/records.svg';
import ribbonAdopted from '@/assets/images/carbonAgent/feedback/ribbon-adopted.svg';
import ribbonPending from '@/assets/images/carbonAgent/feedback/ribbon-pending.svg';
import ribbonResolved from '@/assets/images/carbonAgent/feedback/ribbon-resolved.svg';
import rewardImage from '@/assets/images/carbonAgent/feedback/reward.png';
import rewardGrantedIcon from '@/assets/images/carbonAgent/feedback/reward-granted.svg';

import style from './IssueFeedbackPage.module.less';
import type { AgentConversation } from '../constants';
import {
  fetchAgentIssueFeedbackConfig,
  fetchAgentIssueFeedbackDetail,
  fetchAgentIssueFeedbackPage,
  fetchAgentSessionHistoryList,
  fetchAgentWorkspaceFileDownloadUrlById,
  submitAgentIssueFeedback,
  uploadAgentAttachment,
} from '../service';
import type {
  AgentIssueFeedback,
  AgentIssueFeedbackConfig,
  AgentIssueFeedbackDetail,
  AgentIssueFeedbackFile,
  AgentIssueFeedbackPageParams,
  AgentIssueFeedbackStatus,
  AgentIssueFeedbackType,
} from '../service';

export type IssueFeedbackView = 'create' | 'records';

type IssueFeedbackPageProps = {
  initialSessionId?: string;
  initialSessionTitle?: string;
  mobile?: boolean;
  refreshKey?: number;
  sourcePath?: string;
  view: IssueFeedbackView;
  onClose: () => void;
  onViewChange: (view: IssueFeedbackView) => void;
};

type UploadedFeedbackFile = {
  fileId: string;
  mime: string;
  name: string;
  previewUrl?: string;
};

type FeedbackStatusTone = 'adopted' | 'notAdopted' | 'pending' | 'resolved';
type FeedbackMediaType = 'image' | 'video';

const PAGE_SIZE = 10;
const SESSION_PAGE_SIZE = 100;
const MAX_CONTENT_LENGTH = 500;
const MAX_FILE_COUNT = 6;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const FEEDBACK_STATUSES: AgentIssueFeedbackStatus[] = [
  '',
  'pending',
  'adopted',
  'resolved',
];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMAGE_FILE_PATTERN = /\.(?:avif|bmp|gif|jpe?g|png|svg|webp)$/i;
const VIDEO_FILE_PATTERN = /\.(?:avi|m4v|mkv|mov|mp4|mpeg|mpg|webm)$/i;

const getFeedbackPageParams = (
  pageNum: number,
  status: AgentIssueFeedbackStatus,
  pageSize = PAGE_SIZE,
): AgentIssueFeedbackPageParams => ({
  pageNum,
  pageSize,
  status,
});

const mergeFeedbackRecords = (
  currentRecords: AgentIssueFeedback[],
  nextRecords: AgentIssueFeedback[],
) => {
  const feedbackByNo = new Map(
    currentRecords.map(feedback => [feedback.feedbackNo, feedback]),
  );

  nextRecords.forEach(feedback => {
    feedbackByNo.set(feedback.feedbackNo, feedback);
  });

  return Array.from(feedbackByNo.values());
};

const getFeedbackMediaType = (
  file: AgentIssueFeedbackFile,
): FeedbackMediaType | undefined => {
  const mime = file.mime?.toLowerCase() || '';

  if (mime.startsWith('image/')) {
    return 'image';
  }

  if (mime.startsWith('video/')) {
    return 'video';
  }

  const filename = file.filename || '';

  if (IMAGE_FILE_PATTERN.test(filename)) {
    return 'image';
  }

  if (VIDEO_FILE_PATTERN.test(filename)) {
    return 'video';
  }

  return undefined;
};

const resolveFeedbackFilePreviewUrls = async (
  files: AgentIssueFeedbackFile[],
  signal: AbortSignal,
) => {
  const fileResults = await Promise.allSettled(
    files.map(async file => {
      if (file.url || !file.fileId || !getFeedbackMediaType(file)) {
        return file;
      }

      const fileData = await fetchAgentWorkspaceFileDownloadUrlById(
        file.fileId,
        signal,
      );

      return {
        ...file,
        filename: file.filename || fileData.filename || fileData.name,
        mime: file.mime || fileData.mime,
        size: file.size ?? fileData.size,
        url: fileData.downloadUrl || fileData.url || undefined,
      };
    }),
  );

  return fileResults.map((result, index) =>
    result.status === 'fulfilled' ? result.value : files[index],
  );
};

const fetchFeedbackRecordFiles = async (
  records: AgentIssueFeedback[],
  signal: AbortSignal,
) => {
  const recordsWithFiles = records.filter(
    feedback => feedback.fileCount || feedback.files?.length,
  );
  const detailResults = await Promise.allSettled(
    recordsWithFiles.map(async feedback => {
      const detail = feedback.files?.length
        ? undefined
        : await fetchAgentIssueFeedbackDetail(feedback.feedbackNo, signal);
      const files = await resolveFeedbackFilePreviewUrls(
        feedback.files || detail?.files || [],
        signal,
      );

      return {
        feedbackNo: feedback.feedbackNo,
        files,
      };
    }),
  );
  const filesByFeedbackNo = new Map<string, AgentIssueFeedbackFile[]>();

  detailResults.forEach(result => {
    if (result.status === 'fulfilled' && result.value.files.length) {
      filesByFeedbackNo.set(result.value.feedbackNo, result.value.files);
    }
  });

  return filesByFeedbackNo;
};

const fetchFeedbackDetailWithPreviews = async (
  feedbackNo: string,
  signal: AbortSignal,
) => {
  const detail = await fetchAgentIssueFeedbackDetail(feedbackNo, signal);
  const files = await resolveFeedbackFilePreviewUrls(detail.files, signal);

  return {
    ...detail,
    files,
  };
};

const getContactEmail = () => {
  const userInfo = getUserInfo()?.userInfo as
    | {
        email?: string;
        user?: { email?: string };
      }
    | undefined;

  return userInfo?.user?.email || userInfo?.email || '';
};

const getStatusTone = (feedback: AgentIssueFeedback): FeedbackStatusTone => {
  const value = `${feedback.status || ''} ${feedback.statusName || ''}`
    .trim()
    .toLowerCase();

  if (
    value.includes('not_adopted') ||
    value.includes('not adopted') ||
    value.includes('未采纳') ||
    value.includes('未採納')
  ) {
    return 'notAdopted';
  }

  if (
    value.includes('adopt') ||
    value.includes('accept') ||
    value.includes('采纳') ||
    value.includes('採納')
  ) {
    return 'adopted';
  }

  if (
    value.includes('resolve') ||
    value.includes('complete') ||
    value.includes('close') ||
    value.includes('解决') ||
    value.includes('解決')
  ) {
    return 'resolved';
  }

  return 'pending';
};

const getStatusLabel = (
  feedback: AgentIssueFeedback,
  tone = getStatusTone(feedback),
) => {
  if (feedback.statusName) {
    return feedback.statusName;
  }

  if (tone === 'adopted') {
    return I18N.carbonAgent.feedbackStatusAdopted;
  }

  if (tone === 'resolved') {
    return I18N.carbonAgent.feedbackStatusResolved;
  }

  if (tone === 'notAdopted') {
    return I18N.carbonAgent.feedbackStatusNotAdopted;
  }

  return I18N.carbonAgent.feedbackStatusPending;
};

const getFeedbackTypeLabel = (feedback: AgentIssueFeedback) =>
  feedback.feedbackTypeName ||
  (feedback.feedbackType === 'bug'
    ? I18N.carbonAgent.feedbackTypeBug
    : I18N.carbonAgent.feedbackTypeFeature);

const getFeedbackStatusFilterLabel = (status: AgentIssueFeedbackStatus) => {
  if (status === 'pending') {
    return I18N.carbonAgent.feedbackStatusPending;
  }

  if (status === 'adopted') {
    return I18N.carbonAgent.feedbackStatusAdopted;
  }

  if (status === 'resolved') {
    return I18N.carbonAgent.feedbackStatusResolved;
  }

  if (status === 'not_adopted') {
    return I18N.carbonAgent.feedbackStatusNotAdopted;
  }

  return I18N.carbonAgent.feedbackStatusAll;
};

const FEEDBACK_RIBBON_BY_TONE: Partial<Record<FeedbackStatusTone, string>> = {
  adopted: ribbonAdopted,
  pending: ribbonPending,
  resolved: ribbonResolved,
};

const formatFileSize = (size?: number) => {
  if (!size) {
    return '';
  }

  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
};

const IssueFeedbackPage = ({
  initialSessionId = '',
  initialSessionTitle = '',
  mobile = false,
  refreshKey = 0,
  sourcePath,
  view,
  onClose,
  onViewChange,
}: IssueFeedbackPageProps) => {
  const [feedbackType, setFeedbackType] =
    useState<AgentIssueFeedbackType>('feature');
  const [categoryCode, setCategoryCode] = useState('');
  const [content, setContent] = useState('');
  const [sessionId, setSessionId] = useState(initialSessionId);
  const [allowContact, setAllowContact] = useState(false);
  const [contactEmail, setContactEmail] = useState(getContactEmail);
  const [sessions, setSessions] = useState<AgentConversation[]>([]);
  const [attachments, setAttachments] = useState<UploadedFeedbackFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackConfig, setFeedbackConfig] =
    useState<AgentIssueFeedbackConfig | null>(null);
  const [configLoading, setConfigLoading] = useState(false);
  const [status, setStatus] = useState<AgentIssueFeedbackStatus>('');
  const [pageNum, setPageNum] = useState(1);
  const [records, setRecords] = useState<AgentIssueFeedback[]>([]);
  const [total, setTotal] = useState(0);
  const [listLoading, setListLoading] = useState(false);
  const [listLoadingMore, setListLoadingMore] = useState(false);
  const [listError, setListError] = useState('');
  const [listLoadMoreError, setListLoadMoreError] = useState('');
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [statusTotals, setStatusTotals] = useState<
    Partial<Record<AgentIssueFeedbackStatus, number>>
  >({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<AgentIssueFeedbackDetail | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState('');
  const previewUrlsRef = useRef(new Set<string>());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordsScrollAreaRef = useRef<HTMLDivElement>(null);
  const recordsLoadMoreRef = useRef<HTMLDivElement>(null);
  const recordFilesAbortControllersRef = useRef(new Set<AbortController>());

  const categoryOptions = useMemo(
    () =>
      (
        feedbackConfig?.types.find(type => type.code === feedbackType)
          ?.categories || []
      ).map(category => ({
        label: category.name,
        value: category.code,
      })),
    [feedbackConfig, feedbackType],
  );
  const sessionOptions = useMemo(() => {
    const options = sessions.map(session => ({
      label: session.title,
      value: session.sessionId || session.id,
    }));

    if (
      initialSessionId &&
      initialSessionTitle &&
      !options.some(option => option.value === initialSessionId)
    ) {
      return [
        { label: initialSessionTitle, value: initialSessionId },
        ...options,
      ];
    }

    return options;
  }, [initialSessionId, initialSessionTitle, sessions]);

  useEffect(() => {
    const previewUrls = previewUrlsRef.current;

    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      previewUrls.clear();
    };
  }, []);

  useEffect(() => {
    const abortControllers = recordFilesAbortControllersRef.current;

    return () => {
      abortControllers.forEach(abortController => abortController.abort());
      abortControllers.clear();
    };
  }, [status, view]);

  useEffect(() => {
    if (view !== 'create') {
      return undefined;
    }

    const abortController = new AbortController();

    fetchAgentSessionHistoryList(
      {
        pageNum: 1,
        pageSize: SESSION_PAGE_SIZE,
      },
      abortController.signal,
    )
      .then(result => setSessions(result.rows))
      .catch(() => {
        if (!abortController.signal.aborted) {
          setSessions([]);
        }
      });

    return () => abortController.abort();
  }, [view]);

  useEffect(() => {
    if (view !== 'create' || feedbackConfig) {
      return undefined;
    }

    const abortController = new AbortController();

    setConfigLoading(true);
    fetchAgentIssueFeedbackConfig(abortController.signal)
      .then(setFeedbackConfig)
      .catch(() => {
        if (!abortController.signal.aborted) {
          message.error(I18N.carbonAgent.feedbackConfigLoadFailed);
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setConfigLoading(false);
        }
      });

    return () => abortController.abort();
  }, [feedbackConfig, view]);

  useEffect(() => {
    if (view !== 'records') {
      return undefined;
    }

    const abortController = new AbortController();

    const firstPage = pageNum === 1;

    if (firstPage) {
      setListLoading(true);
      setListError('');
    } else {
      setListLoadingMore(true);
      setListLoadMoreError('');
    }
    fetchAgentIssueFeedbackPage(
      getFeedbackPageParams(pageNum, status),
      abortController.signal,
    )
      .then(result => {
        setRecords(currentRecords =>
          firstPage
            ? result.rows
            : mergeFeedbackRecords(currentRecords, result.rows),
        );
        setTotal(result.total);
        setStatusTotals({
          '': result.summary.totalCount,
          adopted: result.summary.adoptedCount,
          pending: result.summary.pendingCount,
          resolved: result.summary.resolvedCount,
        });

        const recordFilesAbortController = new AbortController();
        recordFilesAbortControllersRef.current.add(recordFilesAbortController);
        fetchFeedbackRecordFiles(result.rows, recordFilesAbortController.signal)
          .then(filesByFeedbackNo => {
            if (
              !recordFilesAbortController.signal.aborted &&
              filesByFeedbackNo.size
            ) {
              setRecords(currentRecords =>
                currentRecords.map(feedback => ({
                  ...feedback,
                  files:
                    filesByFeedbackNo.get(feedback.feedbackNo) ||
                    feedback.files,
                })),
              );
            }
          })
          .catch(() => undefined)
          .finally(() => {
            recordFilesAbortControllersRef.current.delete(
              recordFilesAbortController,
            );
          });
      })
      .catch(() => {
        if (!abortController.signal.aborted) {
          if (firstPage) {
            setRecords([]);
            setTotal(0);
            setStatusTotals({});
            setListError(I18N.carbonAgent.feedbackListLoadFailed);
          } else {
            setListLoadMoreError(I18N.carbonAgent.feedbackListLoadFailed);
          }
        }
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          if (firstPage) {
            setListLoading(false);
          } else {
            setListLoadingMore(false);
          }
        }
      });

    return () => abortController.abort();
  }, [listRefreshKey, pageNum, refreshKey, status, view]);

  useEffect(() => {
    const loadMoreElement = recordsLoadMoreRef.current;
    const scrollArea = recordsScrollAreaRef.current;

    if (
      view !== 'records' ||
      !loadMoreElement ||
      listLoading ||
      listLoadingMore ||
      !!listError ||
      !!listLoadMoreError ||
      records.length >= total
    ) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setListLoadingMore(true);
          setPageNum(currentPage => currentPage + 1);
        }
      },
      {
        root: scrollArea,
        rootMargin: '0px 0px 160px',
      },
    );

    observer.observe(loadMoreElement);

    return () => observer.disconnect();
  }, [
    listError,
    listLoadMoreError,
    listLoading,
    listLoadingMore,
    records.length,
    total,
    view,
  ]);

  const clearForm = () => {
    attachments.forEach(file => {
      if (file.previewUrl) {
        URL.revokeObjectURL(file.previewUrl);
        previewUrlsRef.current.delete(file.previewUrl);
      }
    });
    setAttachments([]);
    setCategoryCode('');
    setContent('');
    setAllowContact(false);
  };

  const handleFilesSelect = async (files: File[]) => {
    const remainingCount = MAX_FILE_COUNT - attachments.length;

    if (remainingCount <= 0) {
      message.warning(
        I18N.template(I18N.carbonAgent.feedbackFileCountLimit, {
          val1: MAX_FILE_COUNT,
        }),
      );
      return;
    }

    const mediaFiles = files.filter(file => /^(image|video)\//.test(file.type));

    if (!mediaFiles.length) {
      message.warning(I18N.carbonAgent.feedbackFileTypeLimit);
      return;
    }

    if (files.length !== mediaFiles.length) {
      message.warning(I18N.carbonAgent.feedbackFileTypeLimit);
    }

    if (mediaFiles.length > remainingCount) {
      message.warning(
        I18N.template(I18N.carbonAgent.feedbackFileCountLimit, {
          val1: MAX_FILE_COUNT,
        }),
      );
    }

    const selectedFiles = mediaFiles.slice(0, remainingCount);
    const oversizedFile = selectedFiles.find(file => file.size > MAX_FILE_SIZE);

    if (oversizedFile) {
      message.warning(I18N.carbonAgent.feedbackFileSizeLimit);
      return;
    }

    setUploading(true);
    const results = await Promise.allSettled(
      selectedFiles.map(async file => {
        const uploadedFile = await uploadAgentAttachment(file);
        const previewUrl = /^(image|video)\//.test(file.type)
          ? URL.createObjectURL(file)
          : undefined;

        if (previewUrl) {
          previewUrlsRef.current.add(previewUrl);
        }

        return {
          fileId: uploadedFile.fileId,
          mime: file.type,
          name: uploadedFile.name || file.name,
          previewUrl,
        };
      }),
    );
    const uploadedFiles = results.flatMap(result =>
      result.status === 'fulfilled' ? [result.value] : [],
    );

    if (uploadedFiles.length) {
      setAttachments(currentFiles => [...currentFiles, ...uploadedFiles]);
    }

    if (uploadedFiles.length !== selectedFiles.length) {
      message.error(I18N.carbonAgent.feedbackFileUploadFailed);
    }

    setUploading(false);
  };

  const handleFeedbackPaste = (event: ReactClipboardEvent<HTMLDivElement>) => {
    const pastedFiles = Array.from(event.clipboardData.items).flatMap(item => {
      const file = item.kind === 'file' ? item.getAsFile() : null;

      return file ? [file] : [];
    });

    if (!pastedFiles.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const pastedText = event.clipboardData.getData('text/plain');

    if (pastedText) {
      setContent(currentContent =>
        `${currentContent}${pastedText}`.slice(0, MAX_CONTENT_LENGTH),
      );
    }

    handleFilesSelect(pastedFiles);
  };

  const handleFeedbackDrop = (event: ReactDragEvent<HTMLDivElement>) => {
    const droppedFiles = Array.from(event.dataTransfer.files || []);

    if (!droppedFiles.length) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    handleFilesSelect(droppedFiles);
  };

  const handleRemoveFile = (fileId: string) => {
    setAttachments(currentFiles =>
      currentFiles.filter(file => {
        if (file.fileId !== fileId) {
          return true;
        }

        if (file.previewUrl) {
          URL.revokeObjectURL(file.previewUrl);
          previewUrlsRef.current.delete(file.previewUrl);
        }

        return false;
      }),
    );
  };

  const handleSubmit = async () => {
    if (!categoryCode) {
      message.warning(I18N.carbonAgent.feedbackCategoryRequired);
      return;
    }

    if (!content.trim()) {
      message.warning(I18N.carbonAgent.feedbackContentRequired);
      return;
    }

    if (allowContact && !contactEmail.trim()) {
      message.warning(I18N.carbonAgent.feedbackEmailRequired);
      return;
    }

    if (allowContact && !EMAIL_PATTERN.test(contactEmail.trim())) {
      message.warning(I18N.carbonAgent.feedbackEmailInvalid);
      return;
    }

    setSubmitting(true);
    try {
      await submitAgentIssueFeedback({
        allowContact: String(allowContact),
        categoryCode,
        contactEmail: allowContact ? contactEmail.trim() : '',
        content: content.trim(),
        feedbackType,
        fileIds: attachments.map(file => file.fileId),
        sessionId,
        source: mobile ? 'agent_h5' : 'agent_web',
        sourcePath:
          sourcePath || `${window.location.pathname}${window.location.search}`,
      });
      message.success(I18N.carbonAgent.feedbackSubmitSuccess);
      clearForm();
      setStatus('');
      setPageNum(1);
      setRecords([]);
      setListRefreshKey(key => key + 1);
      onViewChange('records');
    } catch {
      message.error(I18N.carbonAgent.feedbackSubmitFailed);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordOpen = (feedbackNo: string) => {
    const abortController = new AbortController();

    setDetail(null);
    setDetailOpen(true);
    setDetailLoading(true);
    fetchFeedbackDetailWithPreviews(feedbackNo, abortController.signal)
      .then(setDetail)
      .catch(() => message.error(I18N.carbonAgent.feedbackDetailLoadFailed))
      .finally(() => setDetailLoading(false));
  };

  const handleFeedbackFileDownload = async (file: AgentIssueFeedbackFile) => {
    const { fileId } = file;
    const fileKey = String(fileId || file.id || file.filename || '');

    if (!file.url && !fileId) {
      message.error(I18N.carbonAgent.missingDownloadInfo);
      return;
    }

    setDownloadingFileId(fileKey);
    try {
      let downloadUrl = file.url || '';
      let { filename } = file;

      if (!downloadUrl && fileId) {
        const fileData = await fetchAgentWorkspaceFileDownloadUrlById(fileId);

        downloadUrl = fileData.downloadUrl || fileData.url || '';
        filename = fileData.filename || fileData.name || filename;
      }

      if (!downloadUrl) {
        throw new Error(I18N.carbonAgent.emptyDownloadLink);
      }

      saveAs(downloadUrl, filename);
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry,
      );
    } finally {
      setDownloadingFileId('');
    }
  };

  const renderDesktopHeader = () => (
    <header
      className={classNames(style.desktopHeader, {
        [style.recordsHeader]: view === 'records',
      })}
    >
      <div className={style.desktopHeaderMain}>
        {view === 'records' ? (
          <button
            className={style.backButton}
            type='button'
            onClick={() => onViewChange('create')}
          >
            <LeftOutlined aria-hidden='true' />
            {I18N.carbonAgent.feedbackRecords}
          </button>
        ) : (
          <h1>{I18N.carbonAgent.issueFeedback}</h1>
        )}
        {view === 'create' ? (
          <button
            className={style.recordsButton}
            type='button'
            onClick={() => onViewChange('records')}
          >
            <img src={recordsIcon} alt='' />
            {I18N.carbonAgent.feedbackRecords}
          </button>
        ) : null}
      </div>
      <button
        className={style.closeButton}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        onClick={onClose}
      >
        <CloseOutlined />
      </button>
    </header>
  );

  const renderRequiredLabel = (label: string) => (
    <div className={style.fieldLabel}>
      <span aria-hidden='true'>*</span>
      {label}
    </div>
  );

  const renderCreate = () => (
    <>
      <div className={style.createScrollArea}>
        <div className={style.createContent}>
          {!mobile ? (
            <section className={style.rewardBanner}>
              <div className={style.rewardImageWrap}>
                <img src={rewardImage} alt='' />
              </div>
              <div>
                <h2>
                  {I18N.carbonAgent.feedbackRewardTitle}
                  <strong>{I18N.carbonAgent.feedbackRewardPoints}</strong>
                </h2>
                <p>{I18N.carbonAgent.feedbackRewardDescription}</p>
              </div>
            </section>
          ) : null}

          <section className={classNames(style.formSection, style.typeSection)}>
            {renderRequiredLabel(I18N.carbonAgent.feedbackTypeLabel)}
            <div className={style.typeCards}>
              <button
                className={classNames(style.typeCard, {
                  [style.typeCardActive]: feedbackType === 'feature',
                })}
                type='button'
                onClick={() => {
                  setFeedbackType('feature');
                  setCategoryCode('');
                }}
              >
                <img src={featureIcon} alt='' />
                <strong>{I18N.carbonAgent.feedbackTypeFeature}</strong>
                <span>{I18N.carbonAgent.feedbackTypeFeatureDescription}</span>
              </button>
              <button
                className={classNames(style.typeCard, {
                  [style.typeCardActive]: feedbackType === 'bug',
                })}
                type='button'
                onClick={() => {
                  setFeedbackType('bug');
                  setCategoryCode('');
                }}
              >
                <img src={bugIcon} alt='' />
                <strong>{I18N.carbonAgent.feedbackTypeBug}</strong>
                <span>{I18N.carbonAgent.feedbackTypeBugDescription}</span>
              </button>
            </div>
          </section>

          <section className={style.formSection}>
            {renderRequiredLabel(I18N.carbonAgent.feedbackCategoryLabel)}
            <Select
              className={style.fieldSelect}
              loading={configLoading}
              options={categoryOptions}
              placeholder={I18N.carbonAgent.feedbackCategoryPlaceholder}
              value={categoryCode || undefined}
              onChange={setCategoryCode}
            />
          </section>

          <section className={style.formSection}>
            {renderRequiredLabel(I18N.carbonAgent.feedbackContentLabel)}
            <div
              className={style.feedbackEditor}
              onDragOver={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onDrop={handleFeedbackDrop}
              onPaste={handleFeedbackPaste}
            >
              <div className={style.uploadedFiles}>
                {attachments.map(file => (
                  <div className={style.uploadedFile} key={file.fileId}>
                    {file.previewUrl && file.mime.startsWith('image/') ? (
                      <img src={file.previewUrl} alt={file.name} />
                    ) : file.previewUrl && file.mime.startsWith('video/') ? (
                      <video src={file.previewUrl} aria-label={file.name}>
                        <track kind='captions' />
                      </video>
                    ) : (
                      <PaperClipOutlined />
                    )}
                    <button
                      type='button'
                      aria-label={I18N.carbonAgent.delete}
                      onClick={() => handleRemoveFile(file.fileId)}
                    >
                      <DeleteOutlined />
                    </button>
                  </div>
                ))}
                {attachments.length < MAX_FILE_COUNT ? (
                  <button
                    className={style.uploadButton}
                    type='button'
                    aria-label={I18N.carbonAgent.feedbackUploadFile}
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Spin size='small' /> : <PlusOutlined />}
                  </button>
                ) : null}
              </div>
              <textarea
                maxLength={MAX_CONTENT_LENGTH}
                placeholder={I18N.carbonAgent.feedbackContentPlaceholder}
                value={content}
                onChange={event => setContent(event.target.value)}
              />
              <span className={style.contentCount}>
                {content.length}/{MAX_CONTENT_LENGTH}
              </span>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*,video/*'
                multiple
                hidden
                onChange={event => {
                  handleFilesSelect(Array.from(event.target.files || []));
                  event.target.value = '';
                }}
              />
            </div>
          </section>

          <section
            className={classNames(
              style.formSection,
              style.relatedSessionSection,
            )}
          >
            <div className={style.optionalLabel}>
              <strong>{I18N.carbonAgent.feedbackRelatedSession}</strong>
              <span>{I18N.carbonAgent.feedbackRelatedSessionDescription}</span>
            </div>
            <Select
              allowClear
              className={style.fieldSelect}
              optionFilterProp='label'
              options={sessionOptions}
              placeholder={I18N.carbonAgent.feedbackSessionPlaceholder}
              showSearch
              value={sessionId || undefined}
              onChange={value => setSessionId(value || '')}
            />
          </section>

          <section className={style.contactSection}>
            <div className={style.optionalLabel}>
              <strong>{I18N.carbonAgent.feedbackAllowContact}</strong>
              <span>{I18N.carbonAgent.feedbackAllowContactDescription}</span>
            </div>
            <Switch
              className={style.contactSwitch}
              checked={allowContact}
              onChange={setAllowContact}
            />
          </section>
          {allowContact ? (
            <input
              className={style.emailInput}
              type='email'
              placeholder={I18N.carbonAgent.feedbackEmailPlaceholder}
              required
              value={contactEmail}
              onChange={event => setContactEmail(event.target.value)}
            />
          ) : null}
        </div>
      </div>
      <footer className={style.submitFooter}>
        <button
          type='button'
          disabled={submitting || uploading}
          onClick={handleSubmit}
        >
          {submitting
            ? I18N.carbonAgent.feedbackSubmitting
            : I18N.carbonAgent.feedbackSubmit}
        </button>
      </footer>
    </>
  );

  const renderFeedbackFiles = (files?: AgentIssueFeedbackFile[]) => {
    if (!files?.length) {
      return null;
    }

    return (
      <div className={style.recordFiles}>
        {files.slice(0, MAX_FILE_COUNT).map(file => {
          const mediaType = getFeedbackMediaType(file);

          return file.url && mediaType === 'image' ? (
            <img
              key={file.fileId || file.id}
              src={file.url}
              alt={file.filename || ''}
              loading='lazy'
            />
          ) : file.url && mediaType === 'video' ? (
            <video
              key={file.fileId || file.id}
              src={file.url}
              aria-label={file.filename || ''}
              muted
              playsInline
              preload='metadata'
            >
              <track kind='captions' />
            </video>
          ) : (
            <span key={file.fileId || file.id} title={file.filename}>
              <PaperClipOutlined />
            </span>
          );
        })}
      </div>
    );
  };

  const renderRecord = (feedback: AgentIssueFeedback) => {
    const tone = getStatusTone(feedback);
    const files = feedback.files || [];
    const ribbonImage = FEEDBACK_RIBBON_BY_TONE[tone];
    const showRewardCard =
      feedback.rewardStatus?.trim().toLowerCase() === 'granted';

    return (
      <button
        className={style.recordCard}
        key={feedback.feedbackNo}
        type='button'
        onClick={() => handleRecordOpen(feedback.feedbackNo)}
      >
        <span
          className={classNames(style.statusRibbon, {
            [style.statusRibbonFallback]: tone === 'notAdopted',
          })}
        >
          {ribbonImage ? <img src={ribbonImage} alt='' /> : null}
          <span>{getStatusLabel(feedback, tone)}</span>
        </span>
        <div className={style.recordBody}>
          <div className={style.recordSummary}>
            <div className={style.recordTags}>
              <span>{getFeedbackTypeLabel(feedback)}</span>
              {feedback.categoryName ? (
                <span>{feedback.categoryName}</span>
              ) : null}
            </div>
            <strong className={style.recordContent}>{feedback.content}</strong>
          </div>
          <div className={style.recordMeta}>
            {renderFeedbackFiles(files)}
            {!files.length && feedback.fileCount ? (
              <span className={style.fileCount}>
                <PaperClipOutlined />
                {I18N.template(I18N.carbonAgent.feedbackFileCount, {
                  val1: feedback.fileCount,
                })}
              </span>
            ) : null}
            <time>{feedback.createTime}</time>
          </div>
          {feedback.officialReply?.trim() ? (
            <div className={style.officialReply}>
              <strong>
                <img src={officialReplyIcon} alt='' />
                {I18N.carbonAgent.feedbackOfficialReply}
              </strong>
              <p>{feedback.officialReply}</p>
            </div>
          ) : null}
        </div>
        {showRewardCard ? (
          <div
            className={classNames(style.rewardState, style.rewardStateGranted)}
          >
            <img src={rewardGrantedIcon} alt='' />
            {I18N.template(I18N.carbonAgent.feedbackRewardGranted, {
              val1: feedback.rewardPoints || 100,
            })}
          </div>
        ) : null}
      </button>
    );
  };

  const renderRecords = () => (
    <div className={style.recordsPage}>
      <div className={style.statusTabsRow}>
        <div className={style.statusTabs}>
          {FEEDBACK_STATUSES.map(currentStatus => (
            <button
              className={classNames({
                [style.statusTabActive]: status === currentStatus,
              })}
              key={currentStatus || 'all'}
              type='button'
              aria-pressed={status === currentStatus}
              onClick={() => {
                if (status === currentStatus) {
                  return;
                }

                setStatus(currentStatus);
                setPageNum(1);
                setRecords([]);
                setTotal(0);
                setListError('');
                setListLoadMoreError('');
              }}
            >
              {getFeedbackStatusFilterLabel(currentStatus)}
              {statusTotals[currentStatus] !== undefined ? (
                <span>{statusTotals[currentStatus]}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>
      <div ref={recordsScrollAreaRef} className={style.recordsScrollArea}>
        <div className={style.recordsList}>
          {listLoading ? (
            <div className={style.recordsState}>
              <Spin />
            </div>
          ) : null}
          {!listLoading && listError ? (
            <div className={style.recordsState}>
              <p>{listError}</p>
              <button
                type='button'
                onClick={() => {
                  setPageNum(1);
                  setRecords([]);
                  setListRefreshKey(key => key + 1);
                }}
              >
                {I18N.carbonAgent.reload}
              </button>
            </div>
          ) : null}
          {!listLoading && !listError && !records.length ? (
            <Empty description={I18N.carbonAgent.feedbackEmpty} />
          ) : null}
          {!listLoading && !listError ? records.map(renderRecord) : null}
          {!listLoading && !listError ? (
            <div ref={recordsLoadMoreRef} className={style.recordsLoadMore}>
              {listLoadingMore ? <Spin size='small' /> : null}
              {listLoadMoreError ? (
                <button
                  type='button'
                  onClick={() => {
                    setListLoadMoreError('');
                    setListLoadingMore(true);
                    setListRefreshKey(key => key + 1);
                  }}
                >
                  {I18N.carbonAgent.reload}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  const detailFeedback = detail?.feedback;

  return (
    <section
      className={classNames(style.page, { [style.mobilePage]: mobile })}
      aria-label={I18N.carbonAgent.issueFeedback}
    >
      {!mobile ? renderDesktopHeader() : null}
      {view === 'create' ? renderCreate() : renderRecords()}

      <Modal
        centered
        destroyOnClose
        footer={null}
        open={detailOpen}
        title={I18N.carbonAgent.feedbackDetailTitle}
        width={640}
        wrapClassName={style.detailModal}
        onCancel={() => setDetailOpen(false)}
      >
        {detailLoading ? (
          <div className={style.detailLoading}>
            <Spin />
          </div>
        ) : null}
        {!detailLoading && detailFeedback ? (
          <div className={style.detailContent}>
            <div className={style.detailTags}>
              <span>{getFeedbackTypeLabel(detailFeedback)}</span>
              {detailFeedback.categoryName ? (
                <span>{detailFeedback.categoryName}</span>
              ) : null}
              <span>{getStatusLabel(detailFeedback)}</span>
            </div>
            <p className={style.detailText}>{detailFeedback.content}</p>
            <dl>
              <div>
                <dt>{I18N.carbonAgent.feedbackNumber}</dt>
                <dd>{detailFeedback.feedbackNo}</dd>
              </div>
              <div>
                <dt>{I18N.carbonAgent.feedbackCreateTime}</dt>
                <dd>{detailFeedback.createTime || '-'}</dd>
              </div>
              {detailFeedback.sessionTitle || detailFeedback.sessionId ? (
                <div>
                  <dt>{I18N.carbonAgent.feedbackRelatedSession}</dt>
                  <dd>
                    {detailFeedback.sessionTitle || detailFeedback.sessionId}
                  </dd>
                </div>
              ) : null}
            </dl>
            {detail?.files.length ? (
              <section className={style.detailSection}>
                <h3>{I18N.carbonAgent.feedbackAttachments}</h3>
                <div className={style.detailFiles}>
                  {detail.files.map((file, index) => {
                    const mediaType = getFeedbackMediaType(file);
                    const fileKey = String(
                      file.fileId || file.id || file.filename || index,
                    );
                    const filename = file.filename || file.fileId || '';
                    const downloadLabel = I18N.template(
                      I18N.carbonAgent.downloadAttachment,
                      {
                        val1: filename,
                      },
                    );

                    return (
                      <div
                        className={classNames(style.detailFileItem, {
                          [style.detailFileItemWithPreview]:
                            file.url && mediaType,
                        })}
                        key={fileKey}
                      >
                        {file.url && mediaType ? (
                          <div className={style.detailFilePreview}>
                            {mediaType === 'image' ? (
                              <Image src={file.url} alt={filename} preview />
                            ) : (
                              <video
                                src={file.url}
                                aria-label={filename}
                                controls
                                playsInline
                                preload='metadata'
                              >
                                <track kind='captions' />
                              </video>
                            )}
                          </div>
                        ) : null}
                        <div className={style.detailFileMeta}>
                          <PaperClipOutlined />
                          <span title={filename}>{filename}</span>
                          <small>{formatFileSize(file.size)}</small>
                          <button
                            type='button'
                            title={downloadLabel}
                            aria-label={downloadLabel}
                            disabled={downloadingFileId === fileKey}
                            onClick={() => handleFeedbackFileDownload(file)}
                          >
                            {downloadingFileId === fileKey ? (
                              <Spin size='small' />
                            ) : (
                              <DownloadOutlined />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {detailFeedback.officialReply ? (
              <section className={style.detailSection}>
                <h3>{I18N.carbonAgent.feedbackOfficialReply}</h3>
                <p>{detailFeedback.officialReply}</p>
              </section>
            ) : null}
            {detail?.logs.length ? (
              <section className={style.detailSection}>
                <h3>{I18N.carbonAgent.feedbackProgress}</h3>
                <ol className={style.detailLogs}>
                  {detail.logs.map(log => (
                    <li key={log.id || `${log.eventType}-${log.createTime}`}>
                      <strong>
                        {log.remark || log.eventType || log.toStatus}
                      </strong>
                      <time>{log.createTime}</time>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </section>
  );
};

export default IssueFeedbackPage;
