import projectFolderIcon from '@src/assets/images/carbonAgent/icons/folder.svg';
import projectDownloadIcon from '@src/assets/images/carbonAgent/icons/project-home-download.svg';
import projectFeishuIcon from '@src/assets/images/carbonAgent/icons/project-home-feishu.svg';
import projectUploadIcon from '@src/assets/images/carbonAgent/icons/project-home-upload.svg';
import projectOverviewBackIcon from '@src/assets/images/carbonAgent/icons/project-overview-back.svg';
import searchIcon from '@src/assets/images/carbonAgent/icons/search.svg';
import taskCenterCloseIcon from '@src/assets/images/carbonAgent/icons/task-center-close.svg';
import I18N from '@src/lang/I18N';
import { message as antdMessage } from 'antd';
import classNames from 'classnames';
import saveAs from 'file-saver';
import {
  type ChangeEvent,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { LocaleContext } from '@/components/LocaleProvider';

import Icon from './Icon';
import ProjectFeishuCollectionDialog from './ProjectFeishuCollectionDialog';
import style from './ProjectFilesPage.module.less';
import {
  FEISHU_COLLECTION_CHANGE_EVENT,
  type ProjectFeishuGroupState,
  getProjectFeishuGroupState,
  mergeProjectFilesWithFeishuFiles,
} from '../feishuCollectionStore';
import {
  type AgentProjectFile,
  type AgentProjectMember,
  fetchAgentProjectDetail,
  fetchAgentProjectFileDownloadUrl,
  fetchAgentProjectFiles,
  fetchAgentProjectMembers,
  uploadAgentProjectFile,
} from '../service';

type ProjectFileSourceFilter = 'all' | 'feishu' | 'uploaded';

type ProjectFilesPageProps = {
  onBack: () => void;
  onUseFileAsContext?: (
    file: AgentProjectFile,
    promptText?: string,
  ) => void;
  projectId: string;
};

const isFeishuCollectedFile = (file: AgentProjectFile) =>
  String(file.fileId).startsWith('feishu_') ||
  String(file.assetId).startsWith('feishu_');

const getProjectFileKey = (file: AgentProjectFile) =>
  String(file.assetId || file.fileId);

const formatFileSize = (
  fileSize: number | undefined,
  numberFormatter: Intl.NumberFormat,
) => {
  if (!fileSize || fileSize < 0) {
    return '—';
  }

  if (fileSize < 1024) {
    return `${numberFormatter.format(fileSize)} B`;
  }

  if (fileSize < 1024 * 1024) {
    return `${numberFormatter.format(fileSize / 1024)} KB`;
  }

  return `${numberFormatter.format(fileSize / (1024 * 1024))} MB`;
};

const formatFileDate = (
  createTime: string | null | undefined,
  dateFormatter: Intl.DateTimeFormat,
) => {
  if (!createTime) {
    return '—';
  }

  const date = new Date(createTime.replace(' ', 'T'));

  return Number.isNaN(date.getTime()) ? createTime : dateFormatter.format(date);
};

const ProjectFilesPage = ({
  onBack,
  onUseFileAsContext,
  projectId,
}: ProjectFilesPageProps) => {
  const { locale } = useContext(LocaleContext);
  const fallbackProjectName = I18N.template(I18N.carbonAgent.projectWithId, {
    val1: projectId,
  });
  const [projectName, setProjectName] = useState(fallbackProjectName);
  const [members, setMembers] = useState<AgentProjectMember[]>([]);
  const [files, setFiles] = useState<AgentProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [filter, setFilter] = useState<ProjectFileSourceFilter>('all');
  const [keyword, setKeyword] = useState('');
  const [fileUploading, setFileUploading] = useState(false);
  const [downloadingFileKey, setDownloadingFileKey] = useState<string>();
  const [feishuDialogOpen, setFeishuDialogOpen] = useState(false);
  const [feishuGroupState, setFeishuGroupState] =
    useState<ProjectFeishuGroupState | null>(() =>
      getProjectFeishuGroupState(projectId),
    );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectIdRef = useRef(projectId);
  projectIdRef.current = projectId;

  const fileDateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
    [locale],
  );
  const fileNumberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        maximumFractionDigits: 1,
      }),
    [locale],
  );

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setLoadError(false);
    setFeishuGroupState(getProjectFeishuGroupState(projectId));

    Promise.allSettled([
      fetchAgentProjectFiles(projectId, abortController.signal),
      fetchAgentProjectDetail(projectId, abortController.signal),
      fetchAgentProjectMembers(projectId, abortController.signal),
    ])
      .then(([filesResult, detailResult, membersResult]) => {
        if (cancelled) {
          return;
        }

        if (detailResult.status === 'fulfilled') {
          setProjectName(detailResult.value.name || fallbackProjectName);
        }

        if (membersResult.status === 'fulfilled') {
          setMembers(membersResult.value);
        }

        if (filesResult.status === 'fulfilled') {
          setFiles(filesResult.value);
          setLoadError(false);
        } else {
          setLoadError(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [fallbackProjectName, projectId, retryKey]);

  useEffect(() => {
    const syncFeishuState = () => {
      setFeishuGroupState(getProjectFeishuGroupState(projectId));
      setFiles(currentFiles =>
        mergeProjectFilesWithFeishuFiles(projectId, currentFiles),
      );
    };

    window.addEventListener(FEISHU_COLLECTION_CHANGE_EVENT, syncFeishuState);
    return () => {
      window.removeEventListener(
        FEISHU_COLLECTION_CHANGE_EVENT,
        syncFeishuState,
      );
    };
  }, [projectId]);

  const feishuCount = useMemo(
    () => files.filter(file => isFeishuCollectedFile(file)).length,
    [files],
  );
  const uploadedCount = useMemo(
    () => files.filter(file => !isFeishuCollectedFile(file)).length,
    [files],
  );

  const filteredFiles = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return files.filter(file => {
      const fromFeishu = isFeishuCollectedFile(file);

      if (filter === 'feishu' && !fromFeishu) {
        return false;
      }

      if (filter === 'uploaded' && fromFeishu) {
        return false;
      }

      if (!normalizedKeyword) {
        return true;
      }

      const candidate = feishuGroupState?.candidates.find(
        item =>
          String(item.file.assetId || item.file.fileId) ===
          String(file.assetId || file.fileId),
      );
      const searchableText = [
        file.fileName,
        file.uploaderUserName,
        file.uploaderCompanyName,
        candidate?.note,
        candidate?.summary,
        candidate?.groupName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedKeyword);
    });
  }, [feishuGroupState?.candidates, files, filter, keyword]);

  const handleFileUploadChange = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.currentTarget.files?.[0];

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file || fileUploading) {
      return;
    }

    const uploadProjectId = projectId;
    setFileUploading(true);

    try {
      const uploadedFile = await uploadAgentProjectFile(uploadProjectId, file);

      if (projectIdRef.current !== uploadProjectId) {
        return;
      }

      const uploadedKey = getProjectFileKey(uploadedFile);
      setFiles(currentFiles => [
        uploadedFile,
        ...currentFiles.filter(
          currentFile => getProjectFileKey(currentFile) !== uploadedKey,
        ),
      ]);
      setLoadError(false);
      antdMessage.success(
        I18N.template(I18N.carbonAgent.projectFileUploadSuccess, {
          val1: uploadedFile.fileName || file.name,
        }),
      );
    } catch (error) {
      if (projectIdRef.current !== uploadProjectId) {
        return;
      }

      const errorMessage =
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.projectFileUploadFailed;

      antdMessage.error(
        I18N.template(I18N.carbonAgent.fileUploadFailedDetail, {
          val1: file.name,
          val2: errorMessage,
        }),
      );
    } finally {
      if (projectIdRef.current === uploadProjectId) {
        setFileUploading(false);
      }
    }
  };

  const handleFileDownload = async (file: AgentProjectFile) => {
    if (downloadingFileKey) {
      return;
    }

    const downloadProjectId = projectId;
    const fileKey = getProjectFileKey(file);
    setDownloadingFileKey(fileKey);

    try {
      const downloadableFile = await fetchAgentProjectFileDownloadUrl(
        downloadProjectId,
        file.assetId,
      );

      if (projectIdRef.current !== downloadProjectId) {
        return;
      }

      if (!downloadableFile.downloadUrl) {
        throw new Error(I18N.carbonAgent.projectFileDownloadUnavailable);
      }

      saveAs(
        downloadableFile.downloadUrl,
        downloadableFile.fileName || file.fileName,
      );
    } catch (error) {
      if (projectIdRef.current !== downloadProjectId) {
        return;
      }

      antdMessage.error(
        error instanceof Error
          ? error.message
          : I18N.carbonAgent.fileDownloadFailedRetry,
      );
    } finally {
      if (projectIdRef.current === downloadProjectId) {
        setDownloadingFileKey(currentKey =>
          currentKey === fileKey ? undefined : currentKey,
        );
      }
    }
  };

  const handleUseAsContext = (
    file: AgentProjectFile,
    groupName?: string,
    summary?: string,
  ) => {
    if (!onUseFileAsContext) {
      return;
    }

    const candidate = feishuGroupState?.candidates.find(
      item =>
        String(item.file.assetId || item.file.fileId) ===
        String(file.assetId || file.fileId),
    );
    const resolvedGroupName =
      groupName ||
      candidate?.groupName ||
      feishuGroupState?.groupName ||
      file.uploaderCompanyName ||
      projectName;
    const resolvedSummary =
      summary || candidate?.note || candidate?.summary || file.fileName;
    const promptText = I18N.template(
      I18N.carbonAgent.feishuCollectContextPromptTemplate,
      {
        val1: resolvedGroupName,
        val2: file.fileName,
        val3: resolvedSummary,
      },
    );

    onUseFileAsContext(file, promptText);
    onBack();
  };

  const filters: Array<{
    count: number;
    key: ProjectFileSourceFilter;
    label: string;
  }> = [
    {
      count: files.length,
      key: 'all',
      label: I18N.carbonAgent.projectFileFilterAll,
    },
    {
      count: uploadedCount,
      key: 'uploaded',
      label: I18N.carbonAgent.projectFileFilterUploaded,
    },
    {
      count: feishuCount,
      key: 'feishu',
      label: I18N.carbonAgent.projectFileFilterFeishu,
    },
  ];

  return (
    <section className={style.page}>
      <header className={style.header}>
        <div className={style.headerTitleGroup}>
          <button
            className={style.backButton}
            type='button'
            aria-label={I18N.carbonAgent.backToProjectHome}
            onClick={onBack}
          >
            <img src={projectOverviewBackIcon} alt='' aria-hidden='true' />
          </button>
          <h1>{I18N.carbonAgent.projectFileListTitle}</h1>
        </div>
        <button
          className={style.closeButton}
          type='button'
          aria-label={I18N.carbonAgent.backToProjectHome}
          onClick={onBack}
        >
          <Icon src={taskCenterCloseIcon} />
        </button>
      </header>

      <div className={style.toolbar}>
        <nav
          className={style.filters}
          aria-label={I18N.carbonAgent.projectFileListTitle}
        >
          {filters.map(item => (
            <button
              key={item.key}
              className={classNames({
                [style.filterActive]: filter === item.key,
              })}
              type='button'
              aria-pressed={filter === item.key}
              onClick={() => setFilter(item.key)}
            >
              <span>{item.label}</span>
              <strong>{item.count}</strong>
            </button>
          ))}
        </nav>

        <div className={style.toolbarRight}>
          <div className={style.searchBox}>
            <img src={searchIcon} alt='' aria-hidden='true' />
            <input
              type='search'
              value={keyword}
              placeholder={I18N.carbonAgent.projectFileSearchPlaceholder}
              onChange={event => setKeyword(event.currentTarget.value)}
            />
          </div>
          <button
            className={style.feishuActionBtn}
            type='button'
            onClick={() => setFeishuDialogOpen(true)}
          >
            <img src={projectFeishuIcon} alt='' aria-hidden='true' />
            <span>{I18N.carbonAgent.feishuCollect}</span>
          </button>
          <button
            className={style.uploadActionBtn}
            type='button'
            disabled={fileUploading}
            aria-busy={fileUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <img src={projectUploadIcon} alt='' aria-hidden='true' />
            <span>
              {fileUploading
                ? I18N.carbonAgent.projectFileUploading
                : I18N.carbonAgent.uploadProjectFiles}
            </span>
          </button>
          <input
            ref={fileInputRef}
            type='file'
            hidden
            aria-label={I18N.carbonAgent.uploadProjectFiles}
            onChange={handleFileUploadChange}
          />
        </div>
      </div>

      <div className={style.tableWrap} aria-busy={loading} aria-live='polite'>
        <table className={style.table}>
          <colgroup>
            <col className={style.colName} />
            <col className={style.colSource} />
            <col className={style.colUploader} />
            <col className={style.colSize} />
            <col className={style.colTime} />
            <col className={style.colActions} />
          </colgroup>
          <thead>
            <tr>
              <th>{I18N.carbonAgent.projectFileColumnName}</th>
              <th>{I18N.carbonAgent.projectFileColumnSource}</th>
              <th>{I18N.carbonAgent.projectFileColumnUploader}</th>
              <th>{I18N.carbonAgent.projectFileColumnSize}</th>
              <th>{I18N.carbonAgent.projectFileColumnTime}</th>
              <th>{I18N.carbonAgent.projectFileColumnActions}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className={style.tableState} colSpan={6}>
                  {I18N.carbonAgent.projectFilesLoading}
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td className={style.tableState} colSpan={6}>
                  <span>{I18N.carbonAgent.projectFilesLoadFailed}</span>
                  <button
                    type='button'
                    onClick={() => setRetryKey(value => value + 1)}
                  >
                    {I18N.carbonAgent.retry}
                  </button>
                </td>
              </tr>
            ) : filteredFiles.length ? (
              filteredFiles.map(file => {
                const fileKey = getProjectFileKey(file);
                const fromFeishu = isFeishuCollectedFile(file);
                const fileDownloading = downloadingFileKey === fileKey;
                const matchedCandidate = feishuGroupState?.candidates.find(
                  item =>
                    String(item.file.assetId || item.file.fileId) === fileKey,
                );
                const uploaderTitle = fromFeishu
                  ? matchedCandidate?.senderName ||
                    file.uploaderUserName ||
                    I18N.carbonAgent.feishuCollectCustomerTag
                  : file.uploaderUserName ||
                    file.uploaderCompanyName ||
                    projectName;
                const uploaderSub = fromFeishu
                  ? matchedCandidate?.groupName ||
                    feishuGroupState?.groupName ||
                    file.uploaderCompanyName ||
                    ''
                  : file.uploaderCompanyName || '';

                return (
                  <tr key={fileKey}>
                    <td>
                      <div className={style.filePrimaryCell}>
                        <div className={style.fileTitleRow}>
                          <img
                            src={projectFolderIcon}
                            alt=''
                            aria-hidden='true'
                          />
                          <strong title={file.fileName}>{file.fileName}</strong>
                        </div>
                        {matchedCandidate?.note ? (
                          <span title={matchedCandidate.note}>
                            {matchedCandidate.note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <em
                        className={classNames(style.sourceBadge, {
                          [style.sourceBadgeFeishu]: fromFeishu,
                          [style.sourceBadgeUploaded]: !fromFeishu,
                        })}
                      >
                        {fromFeishu
                          ? I18N.carbonAgent.projectFileSourceFeishu
                          : I18N.carbonAgent.projectFileSourceUploaded}
                      </em>
                    </td>
                    <td>
                      <div className={style.uploaderCell}>
                        <strong title={uploaderTitle}>{uploaderTitle}</strong>
                        {uploaderSub ? (
                          <span title={uploaderSub}>{uploaderSub}</span>
                        ) : null}
                      </div>
                    </td>
                    <td>{formatFileSize(file.fileSize, fileNumberFormatter)}</td>
                    <td>{formatFileDate(file.createTime, fileDateFormatter)}</td>
                    <td>
                      <div className={style.actionCell}>
                        {onUseFileAsContext ? (
                          <button
                            className={style.contextActionBtn}
                            type='button'
                            onClick={() => handleUseAsContext(file)}
                          >
                            {I18N.carbonAgent.feishuCollectUseAsContext}
                          </button>
                        ) : null}
                        <button
                          className={style.downloadActionBtn}
                          type='button'
                          disabled={Boolean(downloadingFileKey)}
                          aria-busy={fileDownloading}
                          aria-label={`${file.fileName} ${
                            fileDownloading
                              ? I18N.carbonAgent.projectFileDownloading
                              : I18N.carbonAgent.download
                          }`}
                          onClick={() => handleFileDownload(file)}
                        >
                          <img
                            src={projectDownloadIcon}
                            alt=''
                            aria-hidden='true'
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td className={style.tableState} colSpan={6}>
                  {I18N.carbonAgent.projectFilesEmpty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ProjectFeishuCollectionDialog
        open={feishuDialogOpen}
        projectId={projectId}
        projectMembers={members}
        projectName={projectName}
        tasks={[]}
        onCancel={() => setFeishuDialogOpen(false)}
        onGroupStateChange={nextState => {
          setFeishuGroupState(nextState);
          setFiles(currentFiles =>
            mergeProjectFilesWithFeishuFiles(projectId, currentFiles),
          );
        }}
        onFileSyncedToProject={syncedFile => {
          const syncedKey = getProjectFileKey(syncedFile);
          setFiles(currentFiles => [
            syncedFile,
            ...currentFiles.filter(
              currentFile => getProjectFileKey(currentFile) !== syncedKey,
            ),
          ]);
          setLoadError(false);
        }}
        onUseFileAsContext={(file, groupName, summary) =>
          handleUseAsContext(file, groupName, summary)
        }
      />
    </section>
  );
};

export default ProjectFilesPage;

