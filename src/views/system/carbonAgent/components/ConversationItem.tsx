import { useDraggable } from '@dnd-kit/core';
import I18N from '@src/lang/I18N';
import { Tooltip } from 'antd';
import classNames from 'classnames';
import { CSSProperties } from 'react';

import Icon from './Icon';
import { AgentConversation, getConversationDragId, icons } from '../constants';
import style from '../index.module.less';

type ConversationItemProps = {
  conversation: AgentConversation;
  draggable?: boolean;
  menuOpen: boolean;
  selected: boolean;
  tooltipEnabled?: boolean;
  onCloseMenu: () => void;
  onDelete: (conversationId: string) => void;
  onMenuToggle: (conversationId: string) => void;
  onRename: (conversationId: string) => void;
  onSelect: (conversation: AgentConversation) => void;
};

const ConversationItem = ({
  conversation,
  draggable = true,
  menuOpen,
  selected,
  tooltipEnabled = true,
  onCloseMenu,
  onDelete,
  onMenuToggle,
  onRename,
  onSelect,
}: ConversationItemProps) => {
  const actionsAvailable =
    !conversation.projectSession || conversation.canWrite === true;
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useDraggable({
      disabled: !draggable,
      id: getConversationDragId(conversation.id),
    });

  const draggableStyle: CSSProperties =
    draggable && transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : {};

  return (
    <div
      className={classNames(style.conversationItem, {
        [style.conversationItemDragging]: isDragging,
        [style.conversationItemStatic]: !draggable,
        [style.activeConversationItem]: selected,
        [style.conversationItemMenuOpen]: menuOpen,
      })}
      ref={setNodeRef}
      style={draggableStyle}
      onMouseLeave={onCloseMenu}
    >
      <button
        className={style.conversationContent}
        type='button'
        onClick={() => onSelect(conversation)}
        {...(draggable ? attributes : {})}
        {...(draggable ? listeners : {})}
      >
        {conversation.projectSession ? (
          <>
            <span
              aria-hidden='true'
              className={style.projectConversationInitiatorIcon}
            >
              <Icon
                className={
                  conversation.initiatedByMe
                    ? style.projectConversationPersonalIcon
                    : style.projectConversationMemberIcon
                }
                src={
                  conversation.initiatedByMe
                    ? icons.projectConversationPersonalIcon
                    : icons.projectConversationMemberIcon
                }
              />
            </span>
            <span className={style.projectConversationText}>
              <Tooltip
                mouseEnterDelay={0.2}
                placement='right'
                title={tooltipEnabled ? conversation.title : undefined}
              >
                <span className={style.historyTitle}>{conversation.title}</span>
              </Tooltip>
              <span className={style.conversationTime}>
                {conversation.time}
              </span>
            </span>
          </>
        ) : (
          <>
            <Tooltip
              mouseEnterDelay={0.2}
              placement='right'
              title={tooltipEnabled ? conversation.title : undefined}
            >
              <span className={style.historyTitle}>{conversation.title}</span>
            </Tooltip>
            <span className={style.conversationTime}>{conversation.time}</span>
          </>
        )}
      </button>
      {conversation.running || conversation.hasUnread ? (
        <span className={style.conversationState} aria-hidden='true'>
          {conversation.running ? (
            <span className={style.conversationRunning} />
          ) : (
            <span className={style.conversationUnread} />
          )}
        </span>
      ) : null}
      {actionsAvailable ? (
        <div className={style.conversationActions}>
          <button
            className={style.conversationMore}
            type='button'
            aria-haspopup='menu'
            aria-expanded={menuOpen}
            aria-label={`${conversation.title} ${I18N.carbonAgent.moreActions}`}
            onClick={event => {
              event.stopPropagation();
              onMenuToggle(conversation.id);
            }}
          >
            <span aria-hidden='true'>…</span>
          </button>
          {menuOpen ? (
            <div className={style.conversationMenu} role='menu'>
              <button
                className={style.conversationMenuItem}
                type='button'
                role='menuitem'
                onClick={() => onRename(conversation.id)}
              >
                {I18N.carbonAgent.rename}
              </button>
              <button
                className={classNames(
                  style.conversationMenuItem,
                  style.dangerMenuItem,
                )}
                type='button'
                role='menuitem'
                onClick={() => onDelete(conversation.id)}
              >
                {I18N.carbonAgent.delete}
              </button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};

export default ConversationItem;
