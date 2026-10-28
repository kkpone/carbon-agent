import quoteContentIcon from '@src/assets/images/carbonAgent/icons/quote-content.svg';
import { Popover } from 'antd';
import classNames from 'classnames';
import copy from 'copy-to-clipboard';
import { memo, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import { AGENT_COMPOSER_MESSAGE_MAX_LENGTH } from '../constants';
import style from '../index.module.less';
import type { AgentChatAttachment } from '../service';
import I18N from '@src/lang/I18N';

type QuestionBubbleProps = {
  attachments?: AgentChatAttachment[];
  createTime?: string;
  editable?: boolean;
  onAttachmentDownload?: (attachment: AgentChatAttachment) => void;
  onChange: (question: string) => void;
  question: string;
  referenceContents?: string[];
  referenceCount?: number;
};

const CopyIcon = () => (
  <svg
    className={style.questionActionIcon}
    viewBox='0 0 20 20'
    fill='none'
    aria-hidden='true'
  >
    <rect
      x='7'
      y='3'
      width='10'
      height='10'
      rx='2.5'
      stroke='currentColor'
      strokeWidth='1.5'
    />
    <rect
      x='3'
      y='7'
      width='10'
      height='10'
      rx='2.5'
      stroke='currentColor'
      strokeWidth='1.5'
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className={style.questionActionIcon}
    viewBox='0 0 20 20'
    fill='none'
    aria-hidden='true'
  >
    <path
      d='M4.25 14.92l.72-3.28 7.47-7.47a2 2 0 0 1 2.83 0l.56.56a2 2 0 0 1 0 2.83l-7.47 7.47-3.28.72a.7.7 0 0 1-.83-.83z'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
      strokeLinejoin='round'
    />
    <path
      d='M11.38 5.23l3.39 3.39'
      stroke='currentColor'
      strokeWidth='1.5'
      strokeLinecap='round'
    />
  </svg>
);

const parseStructuredQuestion = (question: string) => {
  const lines = question
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  return lines.every(line => line.includes('：'))
    ? lines.map(line => {
        const separatorIndex = line.indexOf('：');

        return {
          label: line.slice(0, separatorIndex),
          value: line.slice(separatorIndex + 1),
        };
      })
    : [];
};

const formatQuestionTime = (time?: string) => {
  if (!time) {
    return '';
  }

  const date = new Date(time);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  });
};

const limitQuestion = (nextQuestion: string) =>
  nextQuestion.slice(0, AGENT_COMPOSER_MESSAGE_MAX_LENGTH);

const getFileExtension = (fileName: string) =>
  fileName.split('.').pop()?.toUpperCase() || 'FILE';

const formatAttachmentSize = (size?: number) => {
  if (!size || !Number.isFinite(size)) {
    return '';
  }

  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(size < 10 * 1024 ? 1 : 0)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(size < 10 * 1024 * 1024 ? 1 : 0)} MB`;
};

const QuestionBubble = ({
  attachments = [],
  createTime,
  editable = true,
  onAttachmentDownload,
  onChange,
  question,
  referenceContents = [],
  referenceCount = 0,
}: QuestionBubbleProps) => {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draftQuestion, setDraftQuestion] = useState(question);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) {
      setDraftQuestion(limitQuestion(question));
    }
  }, [editing, question]);

  useEffect(() => {
    if (!editing) {
      return;
    }

    const input = inputRef.current;
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  }, [editing]);

  useEffect(() => {
    if (!copied) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopied(false);
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = () => {
    setCopied(copy(question));
  };

  const handleAttachmentDownload = (attachment: AgentChatAttachment) => {
    if (onAttachmentDownload) {
      onAttachmentDownload(attachment);
      return;
    }

    if (attachment.url) {
      window.open(attachment.url, '_blank', 'noreferrer');
    }
  };

  const handleStartEditing = () => {
    setDraftQuestion(limitQuestion(question));
    setEditing(true);
  };

  const handleCancelEditing = () => {
    setDraftQuestion(limitQuestion(question));
    setEditing(false);
  };

  const handleSaveQuestion = () => {
    const nextQuestion = draftQuestion.trim();

    if (!nextQuestion) {
      return;
    }

    onChange(nextQuestion);
    setEditing(false);
  };

  const handleDraftChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraftQuestion(limitQuestion(event.target.value));
  };

  const handleEditKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape') {
      handleCancelEditing();
      return;
    }

    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSaveQuestion();
    }
  };

  const canSaveQuestion = Boolean(draftQuestion.trim());
  const draftQuestionLength = draftQuestion.length;
  const hasQuestionContent = question.trim().length > 0;
  const referenceDetailContents = referenceContents
    .map(content => content.trim())
    .filter(Boolean);
  const displayReferenceCount =
    referenceCount || referenceDetailContents.length;
  const hasReferences = displayReferenceCount > 0;
  const structuredQuestion = parseStructuredQuestion(question);
  const hasStructuredQuestion =
    hasQuestionContent && structuredQuestion.length > 0;
  const questionTime = formatQuestionTime(createTime);

  if (editing) {
    return (
      <div className={style.questionEditor}>
        <textarea
          ref={inputRef}
          className={style.questionEditInput}
          value={draftQuestion}
          maxLength={AGENT_COMPOSER_MESSAGE_MAX_LENGTH}
          aria-label={I18N.carbonAgent.editQuestion}
          onChange={handleDraftChange}
          onKeyDown={handleEditKeyDown}
        />
        <div className={style.questionEditActions}>
          <span
            className={classNames(style.questionEditCounter, {
              [style.questionEditCounterLimit]:
                draftQuestionLength >= AGENT_COMPOSER_MESSAGE_MAX_LENGTH,
            })}
          >
            {draftQuestionLength}/{AGENT_COMPOSER_MESSAGE_MAX_LENGTH}
          </span>
          <button
            className={style.questionEditButton}
            type='button'
            aria-label={I18N.carbonAgent.cancelEditing}
            title={I18N.carbonAgent.cancel}
            onClick={handleCancelEditing}
          >
            {I18N.carbonAgent.cancel}
          </button>
          <button
            className={style.questionEditButtonPrimary}
            type='button'
            disabled={!canSaveQuestion}
            aria-label={I18N.carbonAgent.sendEditedQuestion}
            title={I18N.carbonAgent.send}
            onClick={handleSaveQuestion}
          >
            {I18N.carbonAgent.send}
          </button>
        </div>
      </div>
    );
  }

  const referenceBadge = hasReferences ? (
    <div className={style.questionReferenceBadge}>
      <img src={quoteContentIcon} alt='' />
      <span>
        {I18N.template(I18N.carbonAgent.selectedTextCount, {
          val1: displayReferenceCount,
        })}
      </span>
    </div>
  ) : null;

  const referenceBadgeNode =
    referenceBadge && referenceDetailContents.length ? (
      <Popover
        overlayClassName={style.questionReferencePopover}
        placement='leftTop'
        trigger='hover'
        content={
          <ol className={style.questionReferenceDetailList}>
            {referenceDetailContents.map((content, index) => (
              <li key={content}>
                <strong>
                  {I18N.template(I18N.carbonAgent.snippetN, {
                    val1: index + 1,
                  })}
                </strong>
                <p>{content}</p>
              </li>
            ))}
          </ol>
        }
      >
        {referenceBadge}
      </Popover>
    ) : (
      referenceBadge
    );

  return (
    <div className={style.questionMessage}>
      {referenceBadgeNode}
      {hasQuestionContent ? (
        <div
          className={classNames(style.questionBubble, {
            [style.questionBubbleStructured]: hasStructuredQuestion,
          })}
        >
          {hasStructuredQuestion ? (
            <dl className={style.questionFieldList}>
              {structuredQuestion.map(item => (
                <div className={style.questionFieldItem} key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            question
          )}
        </div>
      ) : null}
      {attachments.length ? (
        <div
          className={style.questionAttachmentList}
          aria-label={I18N.carbonAgent.uploadedFiles}
        >
          {attachments.map(attachment => {
            const sizeText = formatAttachmentSize(attachment.size);
            const attachmentKey =
              attachment.fileId ||
              attachment.url ||
              `${attachment.name}-${attachment.size || ''}`;
            const attachmentContent = (
              <>
                <span
                  className={style.questionAttachmentIcon}
                  aria-hidden='true'
                >
                  {getFileExtension(attachment.name)}
                </span>
                <span className={style.questionAttachmentBody}>
                  <span
                    className={style.questionAttachmentName}
                    title={attachment.name}
                  >
                    {attachment.name}
                  </span>
                  {sizeText ? (
                    <span className={style.questionAttachmentMeta}>
                      {sizeText}
                    </span>
                  ) : null}
                </span>
              </>
            );

            return attachment.fileId || attachment.url ? (
              <button
                className={style.questionAttachment}
                key={attachmentKey}
                type='button'
                onClick={() => handleAttachmentDownload(attachment)}
              >
                {attachmentContent}
              </button>
            ) : (
              <div className={style.questionAttachment} key={attachmentKey}>
                {attachmentContent}
              </div>
            );
          })}
        </div>
      ) : null}
      <div
        className={style.questionActions}
        aria-label={I18N.carbonAgent.questionActions}
      >
        {questionTime ? (
          <time className={style.questionActionTime} dateTime={createTime}>
            {questionTime}
          </time>
        ) : null}
        {hasQuestionContent ? (
          <button
            className={style.questionActionButton}
            type='button'
            aria-label={I18N.carbonAgent.copyQuestion}
            data-tooltip={
              copied ? I18N.carbonAgent.copied : I18N.carbonAgent.copy
            }
            onClick={handleCopy}
          >
            <CopyIcon />
          </button>
        ) : null}
        {editable && hasQuestionContent ? (
          <button
            className={style.questionActionButton}
            type='button'
            aria-label={I18N.carbonAgent.editQuestion}
            title={I18N.carbonAgent.edit}
            onClick={handleStartEditing}
          >
            <EditIcon />
          </button>
        ) : null}
      </div>
      <span className={style.srOnly} aria-live='polite'>
        {copied ? I18N.carbonAgent.copiedQuestion : ''}
      </span>
    </div>
  );
};

export default memo(QuestionBubble);
