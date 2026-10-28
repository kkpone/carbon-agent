import I18N from '@src/lang/I18N';
import { Button, Input, Spin } from 'antd';
import classNames from 'classnames';
import { FC, useEffect, useRef, useState } from 'react';

import { Answer } from '@/components/AICarbonFloating/Answer';
import { AI_HISTORY_STATUS } from '@/components/AICarbonFloating/constant';
import { Markdown } from '@/components/Markdown';

import styles from './index.module.less';
import { ChatMessage, FormCard } from '../../type';

/** 列表中最后一条「继续提供信息 / 更新模型」类气泡的下标（后面可有评价等其它类型消息） */
function getLastActionButtonsMessageIndex(messages: ChatMessage[]): number {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    const m = messages[i];
    if (
      m.role === 'assistant' &&
      m.contentType === 'action-buttons' &&
      m.actionButtons?.length
    ) {
      return i;
    }
  }
  return -1;
}

interface FormCardProps {
  card: FormCard;
  questionNum?: number;
  onComplete: (selectedValue?: string, inputValue?: string) => void;
}

const OPTION_COMMIT_MS = 480;

const FormCardBlock: FC<FormCardProps> = ({
  card,
  questionNum,
  onComplete,
}) => {
  const [localInput, setLocalInput] = useState(card.inputValue || '');
  const [localSelected, setLocalSelected] = useState(card.selectedValue || '');
  const [editing, setEditing] = useState(!card.completed);
  const [multiSelected, setMultiSelected] = useState<string[]>(() => {
    if (card.optionSelectMode === 'multi' && card.selectedValue != null) {
      const raw = String(card.selectedValue).trim();
      if (!raw) return [];
      return raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
    }
    return [];
  });

  const isOptionOnly = Boolean(card.options?.length) && !card.inputField;
  const isMulti = card.optionSelectMode === 'multi';

  const singleOptionTouchRef = useRef(false);
  const multiOptionTouchRef = useRef(false);

  useEffect(() => {
    setLocalInput(card.inputValue || '');
    setLocalSelected(card.selectedValue || '');
    setEditing(!card.completed);
    if (isMulti) {
      setMultiSelected(
        card.selectedValue != null && `${card.selectedValue}`.length
          ? String(card.selectedValue)
              .split(',')
              .map(s => s.trim())
              .filter(Boolean)
          : [],
      );
      multiOptionTouchRef.current = false;
    }
    singleOptionTouchRef.current = false;
  }, [
    card.completed,
    card.selectedValue,
    card.inputValue,
    card.optionSelectMode,
    isMulti,
  ]);

  const confirmLabel =
    card.confirmButtonLabel ?? I18N.accountInfoAiChat.confirmDefault;

  /** 纯选项单选：防抖提交，便于期间改选其它项 */
  useEffect(() => {
    if (!isOptionOnly || isMulti || card.inputField) return undefined;
    if (!singleOptionTouchRef.current || !localSelected) return undefined;
    const t = window.setTimeout(() => {
      onComplete(localSelected, undefined);
    }, OPTION_COMMIT_MS);
    return () => window.clearTimeout(t);
  }, [localSelected, isOptionOnly, isMulti, card.inputField, onComplete]);

  const handleSingleOptionClick = (value: string) => {
    if (isOptionOnly && !isMulti) {
      singleOptionTouchRef.current = true;
      setLocalSelected(value);
      return;
    }
    if (!editing) return;
    setLocalSelected(value);
    if (!card.inputField) {
      onComplete(value, undefined);
    }
  };

  const selectionReady =
    !card.options?.length ||
    (isMulti ? multiSelected.length > 0 : !!localSelected);

  const toggleMultiValue = (value: string) => {
    setMultiSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value],
    );
  };

  const handleMultiToggle = (value: string) => {
    if (!isOptionOnly || !isMulti) return;
    multiOptionTouchRef.current = true;
    toggleMultiValue(value);
  };

  const handleMixedMultiToggle = (value: string) => {
    if (!editing || !isMulti || isOptionOnly) return;
    toggleMultiValue(value);
  };

  const handleConfirm = () => {
    const sel = isMulti ? multiSelected.join(',') : localSelected;
    onComplete(sel || undefined, localInput || undefined);
    setEditing(false);
  };

  const handleEdit = () => {
    setEditing(true);
    multiOptionTouchRef.current = false;
    singleOptionTouchRef.current = false;
  };

  /** 完成后整块置灰；任意题型点「修改」进入编辑态后取消置灰 */
  const inputAreaLocked =
    Boolean(card.inputField) && card.completed && !editing;
  const formCardMuted = card.completed && !editing;

  const optionRowDisabled =
    !isOptionOnly &&
    Boolean(card.options?.length) &&
    card.completed &&
    !editing;

  /** 纯选项（单选/多选）：已完成且未点「修改」时锁定选项，避免在置灰叠层下仍可点击 */
  const optionChoiceLocked = isOptionOnly && card.completed && !editing;

  const optionInteractiveLocked =
    optionRowDisabled ||
    optionChoiceLocked ||
    (isMulti && !isOptionOnly && !editing);

  const optionSelected = (value: string) => {
    if (isMulti) {
      return multiSelected.includes(value);
    }
    const savedCsv = String(card.selectedValue ?? '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    return (
      localSelected === value ||
      card.selectedValue === value ||
      savedCsv.includes(value)
    );
  };

  const handleOptionBtnClick = (value: string) => {
    if (isMulti && isOptionOnly) {
      handleMultiToggle(value);
      return;
    }
    if (isMulti && !isOptionOnly) {
      handleMixedMultiToggle(value);
      return;
    }
    handleSingleOptionClick(value);
  };

  return (
    <div
      className={classNames(styles.formCard, {
        [styles.formCardDone]: formCardMuted,
      })}
    >
      <div className={styles.formCardTitle}>
        {questionNum ? `${questionNum}. ` : ''}
        {card.title}
      </div>

      {card.options && card.options.length > 0 && (
        <div
          className={classNames(styles.optionList, {
            [styles.optionListStacked]: isOptionOnly,
          })}
        >
          {card.options.map(opt => (
            <button
              key={opt.value}
              type='button'
              className={classNames(styles.optionBtn, {
                [styles.optionBtnBlock]: isOptionOnly,
                [styles.optionSelected]: optionSelected(opt.value),
                [styles.optionDisabled]: optionInteractiveLocked,
              })}
              onClick={() => handleOptionBtnClick(opt.value)}
              disabled={optionInteractiveLocked}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {isOptionOnly && isMulti && (
        <div className={styles.inputFooterActions}>
          {card.completed && !editing ? (
            <Button className={styles.editBtn} block onClick={handleEdit}>
              {I18N.accountInfoAiChat.edit}
            </Button>
          ) : (
            <Button
              className={styles.confirmBtn}
              block
              type='primary'
              onClick={handleConfirm}
              disabled={!selectionReady}
            >
              {confirmLabel}
            </Button>
          )}
        </div>
      )}

      {isOptionOnly && !isMulti && card.completed && !editing && (
        <div className={styles.inputFooterActions}>
          <Button className={styles.editBtn} block onClick={handleEdit}>
            {I18N.accountInfoAiChat.edit}
          </Button>
        </div>
      )}

      {card.inputField && (
        <div className={styles.inputColumn}>
          <Input
            className={styles.cardInput}
            placeholder={card.inputField.placeholder}
            value={localInput}
            onChange={e => setLocalInput(e.target.value)}
            disabled={inputAreaLocked}
            suffix={
              card.inputField.unit ? (
                <span className={styles.unit}>{card.inputField.unit}</span>
              ) : null
            }
          />
          <div className={styles.inputFooterActions}>
            {inputAreaLocked ? (
              <Button className={styles.editBtn} block onClick={handleEdit}>
                {I18N.accountInfoAiChat.edit}
              </Button>
            ) : (
              <Button
                className={styles.confirmBtn}
                block
                type='primary'
                onClick={handleConfirm}
                disabled={!selectionReady || !localInput.trim()}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface AIMessageProps {
  message: ChatMessage;
  messageIndex: number;
  allMessages: ChatMessage[];
  onFormCardComplete?: (
    messageUuid: string,
    selectedValue?: string,
    inputValue?: string,
    questionNum?: number,
  ) => void;
  onContinue?: () => void;
  onUpdateModel?: () => void;
  onExpertGuide?: () => void;
  /** companyType 非轻量版（≠ ECompanyType.lite）时为 true：模型评价不展示「专家检查/指导」 */
  hideExpertEvaluationButton?: boolean;
  /** 与小碳 Answer json 失败重试一致：extraFunc.onHistoryFailed 后再拉 topicChat */
  onTopicJsonRetryFailed?: (historyId: number) => Promise<void>;
}

export const AIMessage: FC<AIMessageProps> = ({
  message,
  messageIndex,
  allMessages,
  onFormCardComplete,
  onContinue,
  onUpdateModel,
  onExpertGuide,
  hideExpertEvaluationButton,
  onTopicJsonRetryFailed,
}) => {
  const { contentType, content, formCard, actionButtons, loading } = message;

  if (loading) {
    return (
      <div className={styles.aiMessage}>
        <div className={styles.loadingDot}>
          <Spin size='small' />
        </div>
      </div>
    );
  }

  if (message.dataType === 'json') {
    const isLastJsonAnswer = allMessages
      .slice(messageIndex + 1)
      .every(m => !(m.role === 'assistant' && m.dataType === 'json'));
    return (
      <div className={styles.aiMessage}>
        <Answer
          content={content ?? ''}
          dataType='json'
          jsonList={message.jsonList}
          status={message.status}
          loading={message.status === AI_HISTORY_STATUS.PENDING}
          isLast={messageIndex === allMessages.length - 1}
          isLastJsonAnswer={isLastJsonAnswer}
          onFailed={
            isLastJsonAnswer &&
            onTopicJsonRetryFailed &&
            message.historyId != null
              ? async () => {
                  await onTopicJsonRetryFailed(message.historyId!);
                }
              : undefined
          }
        />
      </div>
    );
  }

  if (contentType === 'form-card' && formCard) {
    return (
      <div className={styles.aiMessage}>
        {content && (
          <div className={styles.textContent}>
            <Markdown content={content ?? ''} />
          </div>
        )}
        <FormCardBlock
          card={formCard}
          questionNum={message.questionMeta?.questionNum}
          onComplete={(selectedValue, inputValue) =>
            onFormCardComplete?.(
              message.uuid,
              selectedValue,
              inputValue,
              message.questionMeta?.questionNum,
            )
          }
        />
      </div>
    );
  }

  if (contentType === 'action-buttons' && actionButtons?.length) {
    const lastActionButtonsIdx = getLastActionButtonsMessageIndex(allMessages);
    const actionRowInteractive = messageIndex === lastActionButtonsIdx;
    return (
      <div className={styles.aiMessage}>
        {content && (
          <div className={styles.textContent}>
            <Markdown content={content ?? ''} />
          </div>
        )}
        <div className={styles.actionBtnGroup}>
          {actionButtons.includes('continue') && (
            <Button
              className={styles.continueBtn}
              disabled={!actionRowInteractive}
              onClick={onContinue}
            >
              {I18N.accountInfoAiChat.continueProvidingInfo}
            </Button>
          )}
          {actionButtons.includes('update-model') && (
            <Button
              className={styles.updateModelBtn}
              type='primary'
              disabled={!actionRowInteractive}
              onClick={onUpdateModel}
            >
              {I18N.accountInfoAiChat.updateModel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (contentType === 'evaluation') {
    return (
      <div className={styles.aiMessage}>
        <div className={styles.evaluationCard}>
          <div className={styles.evaluationContent}>
            <Markdown content={content ?? ''} />
          </div>
          {!hideExpertEvaluationButton && (
            <div className={styles.expertBtnWrapper}>
              <Button
                className={styles.expertBtn}
                type='primary'
                block
                onClick={onExpertGuide}
              >
                {I18N.accountInfoAiChat.expertReviewGuide}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.aiMessage}>
      <div className={styles.textContent}>
        <Markdown content={content ?? ''} />
      </div>
    </div>
  );
};
