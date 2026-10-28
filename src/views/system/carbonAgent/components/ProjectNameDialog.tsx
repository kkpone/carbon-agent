import { useEffect, useRef, useState } from 'react';

import { AGENT_SESSION_TITLE_MAX_LENGTH } from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';

type ProjectNameDialogProps = {
  confirmText: string;
  initialValue?: string;
  maxLength?: number;
  open: boolean;
  placeholder: string;
  submitting?: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (name: string) => void;
};

const ProjectNameDialog = ({
  confirmText,
  initialValue = '',
  maxLength = AGENT_SESSION_TITLE_MAX_LENGTH,
  open,
  placeholder,
  submitting = false,
  title,
  onCancel,
  onSubmit,
}: ProjectNameDialogProps) => {
  const [name, setName] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName(initialValue.slice(0, maxLength));
      inputRef.current?.focus();
    }
  }, [initialValue, maxLength, open]);

  if (!open) {
    return null;
  }

  const trimmedName = name.trim();

  return (
    <div className={style.dialogBackdrop}>
      <button
        className={style.dialogScrim}
        type='button'
        aria-label={I18N.carbonAgent.closeDialog}
        onClick={onCancel}
      />
      <form
        className={style.dialog}
        role='dialog'
        aria-modal='true'
        aria-label={title}
        onSubmit={event => {
          event.preventDefault();

          if (trimmedName && !submitting) {
            onSubmit(trimmedName);
          }
        }}
      >
        <div className={style.dialogHeader}>
          <h2 className={style.dialogTitle}>{title}</h2>
          <button
            className={style.dialogClose}
            type='button'
            aria-label={I18N.carbonAgent.closeDialog}
            disabled={submitting}
            onClick={onCancel}
          />
        </div>
        <input
          className={style.dialogInput}
          ref={inputRef}
          value={name}
          maxLength={maxLength}
          placeholder={placeholder}
          onChange={event => setName(event.target.value.slice(0, maxLength))}
        />
        <div className={style.dialogCounter}>
          {name.length}/{maxLength}
        </div>
        <div className={style.dialogFooter}>
          <button
            className={style.dialogCancel}
            type='button'
            disabled={submitting}
            onClick={onCancel}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={style.dialogConfirm}
            type='submit'
            disabled={!trimmedName || submitting}
            aria-busy={submitting}
          >
            {submitting ? I18N.carbonAgent.saving : confirmText}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProjectNameDialog;
