import { ArrowLeftOutlined } from '@ant-design/icons';
import projectFolderIcon from '@src/assets/images/carbonAgent/icons/folder.svg';
import I18N from '@src/lang/I18N';
import { Popover } from 'antd';
import { useEffect, useState } from 'react';

import Icon from './Icon';
import style from './ProjectConversationAttachmentPicker.module.less';
import { icons } from '../constants';
import { FEISHU_COLLECTION_CHANGE_EVENT } from '../feishuCollectionStore';
import { type AgentProjectFile, fetchAgentProjectFiles } from '../service';

type ProjectConversationAttachmentPickerProps = {
  className?: string;
  disabled?: boolean;
  iconClassName?: string;
  projectId: string;
  onLocalFilesSelect: () => void;
  onProjectFileSelect: (file: AgentProjectFile) => void;
};

type AttachmentPickerView = 'files' | 'menu';

const loadProjectConversationFiles = (projectId: string, signal: AbortSignal) =>
  fetchAgentProjectFiles(projectId, signal);

const getProjectFileKey = (file: AgentProjectFile) =>
  String(file.assetId || file.fileId);

const ProjectConversationAttachmentPicker = ({
  className,
  disabled = false,
  iconClassName,
  projectId,
  onLocalFilesSelect,
  onProjectFileSelect,
}: ProjectConversationAttachmentPickerProps) => {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<AttachmentPickerView>('menu');
  const [files, setFiles] = useState<AgentProjectFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setOpen(false);
    setView('menu');
    setFiles([]);
    setLoadError(false);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    const handleFeishuChange = () => {
      setRetryKey(value => value + 1);
    };

    window.addEventListener(FEISHU_COLLECTION_CHANGE_EVENT, handleFeishuChange);
    return () => {
      window.removeEventListener(
        FEISHU_COLLECTION_CHANGE_EVENT,
        handleFeishuChange,
      );
    };
  }, []);

  useEffect(() => {
    if (!open || view !== 'files') {
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    setLoading(true);
    setLoadError(false);

    loadProjectConversationFiles(projectId, abortController.signal)
      .then(nextFiles => {
        if (!cancelled) {
          setFiles(nextFiles);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFiles([]);
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
  }, [open, projectId, retryKey, view]);

  const closePicker = () => {
    setOpen(false);
    setView('menu');
  };

  const content =
    view === 'menu' ? (
      <div
        className={style.projectAttachmentMenu}
        role='menu'
        aria-label={I18N.carbonAgent.addAttachment}
      >
        <button
          type='button'
          role='menuitem'
          onClick={() => {
            closePicker();
            onLocalFilesSelect();
          }}
        >
          {I18N.carbonAgent.uploadLocalAttachment}
        </button>
        <button type='button' role='menuitem' onClick={() => setView('files')}>
          {I18N.carbonAgent.selectFromProjectFiles}
        </button>
      </div>
    ) : (
      <div
        className={style.projectAttachmentFiles}
        role='dialog'
        aria-label={I18N.carbonAgent.selectFromProjectFiles}
      >
        <header>
          <button
            type='button'
            aria-label={I18N.carbonAgent.back}
            onClick={() => setView('menu')}
          >
            <ArrowLeftOutlined />
          </button>
          <strong>{I18N.carbonAgent.selectFromProjectFiles}</strong>
        </header>
        <div className={style.projectAttachmentFileBody}>
          {loading ? (
            <span>{I18N.carbonAgent.projectFilesLoading}</span>
          ) : loadError ? (
            <div className={style.projectAttachmentFileState}>
              <span>{I18N.carbonAgent.projectFilesLoadFailed}</span>
              <button
                type='button'
                onClick={() => setRetryKey(value => value + 1)}
              >
                {I18N.carbonAgent.retry}
              </button>
            </div>
          ) : files.length ? (
            <ul>
              {files.map(file => (
                <li key={getProjectFileKey(file)}>
                  <button
                    type='button'
                    title={file.fileName}
                    onClick={() => {
                      onProjectFileSelect(file);
                      closePicker();
                    }}
                  >
                    <img src={projectFolderIcon} alt='' aria-hidden='true' />
                    <span>{file.fileName}</span>
                    {String(file.fileId).startsWith('feishu_') ? (
                      <em className={style.projectAttachmentFeishuBadge}>
                        {I18N.carbonAgent.feishuCollectSyncedBadge}
                      </em>
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <span>{I18N.carbonAgent.projectFilesEmpty}</span>
          )}
        </div>
      </div>
    );

  return (
    <Popover
      arrow={false}
      content={content}
      open={open}
      overlayClassName={style.projectAttachmentPopover}
      placement='topLeft'
      trigger='click'
      onOpenChange={nextOpen => {
        setOpen(nextOpen);

        if (!nextOpen) {
          setView('menu');
        }
      }}
    >
      <button
        className={className}
        type='button'
        data-agent-login-entry='file_upload'
        aria-label={I18N.carbonAgent.addAttachment}
        aria-expanded={open}
        aria-haspopup='menu'
        disabled={disabled}
      >
        <Icon className={iconClassName} src={icons.addIcon} />
      </button>
    </Popover>
  );
};

export default ProjectConversationAttachmentPicker;
