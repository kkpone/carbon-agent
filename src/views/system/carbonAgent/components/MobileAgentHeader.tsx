import Icon from './Icon';
import { icons } from '../constants';
import style from '../index.module.less';
import I18N from '@src/lang/I18N';
import feedbackCreateIcon from '@src/assets/images/carbonAgent/feedback/mobile-create.svg';
import feedbackRecordsIcon from '@src/assets/images/carbonAgent/feedback/mobile-records.svg';
import fileManagementBackIcon from '@src/assets/images/carbonAgent/file-management/back.svg';
import fileManagementNewChatIcon from '@src/assets/images/carbonAgent/file-management/new-chat.svg';
import type { ReactNode } from 'react';

type MobileAgentHeaderProps = {
  variant?: 'default' | 'fileManagement';
  leftAction?: 'back' | 'menu' | 'none';
  rightAction?: 'feedbackCreate' | 'feedbackRecords' | 'newChat' | 'none';
  title: string;
  centerContent?: ReactNode;
  onBack?: () => void;
  onMenu?: () => void;
  onNewChat?: () => void;
  onFeedbackAction?: () => void;
};

const MobileAgentHeader = ({
  variant = 'default',
  leftAction = 'menu',
  rightAction = 'newChat',
  title,
  centerContent,
  onBack,
  onMenu,
  onNewChat,
  onFeedbackAction,
}: MobileAgentHeaderProps) => {
  const isBack = leftAction === 'back';
  const isFileManagement = variant === 'fileManagement';
  const showLeftAction = leftAction !== 'none';
  const showRightAction = rightAction !== 'none';
  const isFeedbackAction =
    rightAction === 'feedbackCreate' || rightAction === 'feedbackRecords';

  return (
    <header
      className={`${style.mobileHeader} ${
        isFileManagement ? style.mobileFileHeader : ''
      }`}
    >
      {showLeftAction ? (
        <button
          className={style.mobileHeaderButton}
          type='button'
          data-agent-login-entry={isBack ? undefined : 'sidebar'}
          aria-label={
            isBack ? I18N.carbonAgent.back : I18N.carbonAgent.openMenu
          }
          onClick={isBack ? onBack : onMenu}
        >
          {isBack ? (
            <Icon
              className={
                isFileManagement
                  ? style.mobileFileHeaderBackIcon
                  : style.mobileHeaderBackIcon
              }
              src={
                isFileManagement ? fileManagementBackIcon : icons.chevronIcon
              }
            />
          ) : (
            <span className={style.mobileHeaderMenuIcon} aria-hidden='true' />
          )}
        </button>
      ) : (
        <span aria-hidden='true' />
      )}
      {centerContent ? (
        <div className={style.mobileHeaderCenter}>{centerContent}</div>
      ) : (
        <h1>{title}</h1>
      )}
      {showRightAction ? (
        <button
          className={style.mobileHeaderButton}
          type='button'
          data-agent-login-entry='menu'
          aria-label={
            rightAction === 'feedbackRecords'
              ? I18N.carbonAgent.feedbackRecords
              : rightAction === 'feedbackCreate'
              ? I18N.carbonAgent.issueFeedback
              : I18N.carbonAgent.newChat
          }
          onClick={isFeedbackAction ? onFeedbackAction : onNewChat}
        >
          <Icon
            className={
              isFileManagement
                ? style.mobileFileHeaderNewIcon
                : style.mobileHeaderNewIcon
            }
            src={
              rightAction === 'feedbackRecords'
                ? feedbackRecordsIcon
                : rightAction === 'feedbackCreate'
                ? feedbackCreateIcon
                : isFileManagement
                ? fileManagementNewChatIcon
                : icons.newChatIcon
            }
          />
        </button>
      ) : (
        <span aria-hidden='true' />
      )}
    </header>
  );
};

export default MobileAgentHeader;
