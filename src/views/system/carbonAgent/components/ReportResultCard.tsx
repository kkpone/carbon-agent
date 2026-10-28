import type { ReactNode } from 'react';

import style from '../index.module.less';

/** CBAM 会话报告共用结果卡；卡片只查看已有产物，生成动作由会话中的 Agent 编排。 */
export default function ReportResultCard({
  title,
  notice,
  hint,
  viewLabel,
  disabled,
  onOpen,
  extraActions,
}: {
  title: string;
  notice: string;
  hint?: ReactNode;
  viewLabel: string;
  disabled?: boolean;
  onOpen: () => void;
  extraActions?: ReactNode;
}) {
  return (
    <div
      className={`${style.businessCard} ${style.reportBusinessCard}`}
      aria-label={title}
      aria-disabled={disabled}
      data-disabled={disabled || undefined}
      role='button'
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onOpen}
      onKeyDown={event => {
        if (
          !disabled &&
          event.target === event.currentTarget &&
          (event.key === 'Enter' || event.key === ' ')
        ) {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <div className={style.businessCardNotice}>
        <span className={style.businessCardSuccessIcon} aria-hidden='true' />
        <span>{notice}</span>
      </div>
      <div className={style.reportBusinessCardPanel}>
        <div className={style.reportBusinessCardCopy}>
          <strong
            className={`${style.businessCardTitle} ${style.reportResultCardTitle}`}
          >
            {title}
          </strong>
          {hint && <p className={style.reportBusinessCardHint}>{hint}</p>}
        </div>
        <div
          className={style.reportBusinessCardActions}
          onClick={event => event.stopPropagation()}
        >
          <button
            className={style.reportBusinessCardButton}
            type='button'
            disabled={disabled}
            onClick={onOpen}
          >
            {viewLabel}
          </button>
          {extraActions}
        </div>
      </div>
    </div>
  );
}
