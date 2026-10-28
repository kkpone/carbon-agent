import contextInsightCloseIcon from '@src/assets/images/carbonAgent/icons/context-insight-close.svg';
import contextInsightFeedbackIcon from '@src/assets/images/carbonAgent/icons/context-insight-feedback.svg';
import contextInsightInviteIcon from '@src/assets/images/carbonAgent/icons/context-insight-invite.svg';
import I18N from '@src/lang/I18N';

import style from '../index.module.less';
import type { AgentContextInsightDecision } from '../service';

type ContextInsightBannerProps = {
  banner: AgentContextInsightDecision;
  onAction: () => void;
  onDismiss: () => void;
};

const ContextInsightBanner = ({
  banner,
  onAction,
  onDismiss,
}: ContextInsightBannerProps) => {
  const categoryIcon =
    banner.category === 'INVITE'
      ? contextInsightInviteIcon
      : contextInsightFeedbackIcon;

  return (
    <div
      className={style.contextInsightBanner}
      role='status'
      aria-live='polite'
    >
      <div className={style.contextInsightBannerContent}>
        <img
          alt=''
          aria-hidden='true'
          className={style.contextInsightBannerIcon}
          src={categoryIcon}
        />
        {banner.title ? (
          <span className={style.contextInsightBannerTitle}>
            {banner.title}
          </span>
        ) : null}
      </div>
      <div className={style.contextInsightBannerActions}>
        {banner.actionText ? (
          <button
            className={style.contextInsightBannerAction}
            type='button'
            onClick={onAction}
          >
            {banner.actionText}
          </button>
        ) : null}
        <button
          className={style.contextInsightBannerClose}
          type='button'
          aria-label={I18N.carbonAgent.closeDialog}
          title={I18N.carbonAgent.closeDialog}
          onClick={onDismiss}
        >
          <img alt='' aria-hidden='true' src={contextInsightCloseIcon} />
        </button>
      </div>
    </div>
  );
};

export default ContextInsightBanner;
