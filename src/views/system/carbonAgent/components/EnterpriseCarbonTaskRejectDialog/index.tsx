import projectDialogCloseIcon from '@src/assets/images/carbonAgent/icons/project-dialog-close.svg';
import projectTextareaResizerIcon from '@src/assets/images/carbonAgent/icons/project-textarea-resizer.svg';
import I18N from '@src/lang/I18N';
import { useEffect, useRef, useState } from 'react';

import styles from './index.module.less';

const FORM_ID = 'enterprise-carbon-task-reject-form';

type EnterpriseCarbonTaskRejectDialogProps = {
  busy: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => Promise<void>;
  open: boolean;
};

const EnterpriseCarbonTaskRejectDialog = ({
  busy,
  onCancel,
  onConfirm,
  open,
}: EnterpriseCarbonTaskRejectDialogProps) => {
  const [reason, setReason] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const trimmedReason = reason.trim();

  useEffect(() => {
    if (!open) {
      return;
    }

    setReason('');
    window.requestAnimationFrame(() => textareaRef.current?.focus());
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) {
        onCancel();
      }
    };
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [busy, onCancel, open]);

  if (!open) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <button
        className={styles.scrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        disabled={busy}
        onClick={onCancel}
      />
      <div
        className={styles.dialog}
        role='dialog'
        aria-busy={busy}
        aria-label={I18N.carbonAgent.enterpriseTaskRejectTitle}
        aria-modal='true'
      >
        <header className={styles.header}>
          <h2>{I18N.carbonAgent.enterpriseTaskRejectTitle}</h2>
          <button
            className={styles.closeButton}
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={busy}
            onClick={onCancel}
          >
            <img src={projectDialogCloseIcon} alt='' />
          </button>
        </header>

        <form
          id={FORM_ID}
          className={styles.body}
          onSubmit={event => {
            event.preventDefault();
            if (trimmedReason && !busy) {
              onConfirm(trimmedReason);
            }
          }}
        >
          <div className={styles.field}>
            <label htmlFor='enterprise-carbon-task-reject-reason'>
              <b aria-hidden='true'>*</b>
              {I18N.carbonAgent.enterpriseTaskRejectReason}
            </label>
            <div className={styles.textareaWrap}>
              <textarea
                ref={textareaRef}
                id='enterprise-carbon-task-reject-reason'
                value={reason}
                aria-required='true'
                disabled={busy}
                placeholder={
                  I18N.carbonAgent.enterpriseTaskRejectReasonPlaceholder
                }
                onChange={event => setReason(event.target.value)}
              />
              <img
                className={styles.textareaResizer}
                src={projectTextareaResizerIcon}
                alt=''
              />
            </div>
          </div>
        </form>

        <footer className={styles.footer}>
          <button
            className={styles.cancelButton}
            type='button'
            disabled={busy}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={styles.confirmButton}
            type='submit'
            disabled={!trimmedReason || busy}
            form={FORM_ID}
          >
            {I18N.carbonAgent.enterpriseTaskReject}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default EnterpriseCarbonTaskRejectDialog;
