import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import I18N from '@src/lang/I18N';
import { Button } from 'antd';
import { useId } from 'react';

import type { AgentComposerAttachment } from '../service';
import styles from './monitor.module.less';

/** 仅展示本次真实待发送附件；点击解析仍发送给 Agent，不在浏览器伪造解析或保存结果。 */
export default function MonitorFileQueue({
  attachments,
  disabled,
  onFilesSelect,
  onRemove,
  onParse,
}: {
  attachments: AgentComposerAttachment[];
  disabled?: boolean;
  onFilesSelect: (files: File[]) => void;
  onRemove: (id: string) => void;
  onParse?: () => void;
}) {
  const inputId = useId();
  const ready = attachments.filter(
    file => file.status === 'done' && file.fileId,
  );
  const blocked = ready.length !== attachments.length;
  return (
    <section
      className={styles.fileQueue}
      data-screen-label='Monitor file queue'
    >
      <header>
        <strong>
          {I18N.template(I18N.cbamMonitor.agentQueueTitle, {
            count: ready.length,
          })}
        </strong>
        <p>{I18N.cbamMonitor.agentQueueHint}</p>
      </header>
      <ul className={styles.fileRows}>
        {attachments.map(file => (
          <li key={file.id}>
            <FileTextOutlined aria-hidden />
            <div className={styles.fileInfo}>
              <strong>{file.name}</strong>
              <small>
                {file.size < 1024 * 1024
                  ? `${Math.ceil(file.size / 1024)} KB`
                  : `${(file.size / 1024 / 1024).toFixed(1)} MB`}
                {' · '}
                {file.status === 'uploading'
                  ? I18N.carbonAgent.attachmentUploading
                  : file.status === 'error'
                  ? file.error || I18N.carbonAgent.attachmentUploadError
                  : I18N.cbamMonitor.agentFileReady}
              </small>
            </div>
            <Button
              type='text'
              disabled={disabled || file.status === 'uploading'}
              onClick={() => onRemove(file.id)}
            >
              {I18N.cbamMonitor.agentRemoveFromQueue}
            </Button>
          </li>
        ))}
      </ul>
      {blocked && (
        <p role='status' className={styles.muted}>
          {I18N.cbamMonitor.agentQueueBlocked}
        </p>
      )}
      <div className={styles.queueActions}>
        <label
          htmlFor={inputId}
          className={styles.upload}
          aria-disabled={disabled}
        >
          <PlusOutlined /> {I18N.cbamMonitor.agentAddMore}
          <input
            id={inputId}
            type='file'
            multiple
            disabled={disabled}
            aria-label={I18N.cbamMonitor.agentAddMore}
            onChange={event => {
              const files = Array.from(event.target.files || []);
              if (files.length) onFilesSelect(files);
              event.target.value = '';
            }}
          />
        </label>
        <Button
          type='primary'
          disabled={disabled || blocked || !ready.length || !onParse}
          onClick={onParse}
        >
          {I18N.cbamMonitor.agentParseNow}
        </Button>
      </div>
    </section>
  );
}
