import {
  ArrowDownOutlined,
  ClockCircleFilled,
  LinkOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import selectionQuoteIcon from '@src/assets/images/carbonAgent/icons/selection-quote.svg';
import I18N from '@src/lang/I18N';
import classNames from 'classnames';
import { useEffect, useMemo, useRef, useState } from 'react';

import AnswerMessage from './AnswerMessage';
import MonitorFileQueue from '../monitor/MonitorFileQueue';
import { isMonitorCard, monitorToolResult } from '../monitor/results';
import Composer, { type ProductFootprintComposerOptions } from './Composer';
import ContextInsightBanner from './ContextInsightBanner';
import type { CertificationApplyAuthType } from './PreviewPane';
import ProjectConversationHeader, {
  type ProjectConversationHeaderProps,
} from './ProjectConversationHeader';
import QuestionBubble from './QuestionBubble';
import type { EnterpriseCarbonCertificationTarget } from './enterpriseCarbonCertification/types';
import type { EnterpriseCarbonExpertReviewTarget } from './enterpriseCarbonExpertReview/types';
import { ModeKey, ModeOption } from '../constants';
import type { EnterpriseCarbonReportFile } from '../enterpriseBusinessCard';
import {
  getCcdbFactorValue,
  sessionFactorTarget,
  type CcdbSessionFactorRef,
  type CcdbFactorPreviewTarget,
} from '../ccdbFactor';
import style from '../index.module.less';
import type {
  AgentActionRequestSubmitPayload,
  AgentAnswerControls,
  AgentChatAttachment,
  AgentComposerAttachment,
  AgentMonitorMaterialOrigin,
  AgentContextInsightDecision,
  AgentFormRequestSubmitPayload,
  AgentCertificationItem,
  AgentConversationMessage,
  AgentFeedbackSource,
  AgentExpertReviewStatus,
  AgentMessageBlock,
  AgentMessageCard,
  AgentMessageReference,
  AgentProjectFile,
  AgentToolCall,
  AgentWorkspaceLiveSession,
} from '../service';

const noopQuestionChange = () => undefined;
const SCROLL_TO_BOTTOM_THRESHOLD = 120;
const MAX_SELECTION_QUOTE_LENGTH = 2000;
const QUOTE_ACTION_EDGE_PADDING = 16;
const ANSWER_SELECTION_SELECTOR = '[data-carbon-agent-answer-block="true"]';

const normalizeSelectedQuote = (text: string) =>
  text.replace(/\s+/g, ' ').trim().slice(0, MAX_SELECTION_QUOTE_LENGTH);

const getElementFromNode = (node: Node) =>
  node.nodeType === Node.ELEMENT_NODE ? (node as Element) : node.parentElement;

type BusinessCardPreviewTarget = {
  planId?: string;
  planName?: string;
  accountId?: string;
  agentSessionId?: string;
  cbamId?: string;
  certificationAuthType?: CertificationApplyAuthType;
  certificationDetails?: AgentCertificationItem[];
  enterpriseCarbonBizId?: string;
  enterpriseCarbonBizType?: 'account' | 'report';
  enterpriseCarbonCertificationDetails?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationDetails'];
  enterpriseCarbonCertificationDraft?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationDraft'];
  enterpriseCarbonFiles?: EnterpriseCarbonReportFile[];
  enterpriseCarbonExpertReviewDetail?: EnterpriseCarbonExpertReviewTarget['reviewDetail'];
  enterpriseCarbonExpertReviewDetails?: EnterpriseCarbonExpertReviewTarget['reviewDetails'];
  enterpriseCarbonSelectedFile?: EnterpriseCarbonReportFile;
  enterpriseCarbonSnapshot?: EnterpriseCarbonExpertReviewTarget['snapshot'];
  messageId?: string;
  reviewDetail?: AgentExpertReviewStatus;
  reviewDetails?: AgentExpertReviewStatus[];
  productId?: string;
  refreshKey?: string;
  reportId?: string;
  reportName?: string;
  reportUrl?: string;
  type?:
    | 'account'
    | 'cbamMonitor'
    | 'cbamReport'
    | 'certification'
    | 'enterpriseCarbonAccounting'
    | 'enterpriseCarbonCertification'
    | 'enterpriseCarbonExpertReview'
    | 'enterpriseCarbonReport'
    | 'expertReview'
    | 'report'
    | 'workspace';
  year?: string;
  enterpriseCarbonCertificationPageType?: EnterpriseCarbonCertificationTarget['enterpriseCarbonCertificationPageType'];
  orgId?: string;
  applyNo?: string;
  certificationId?: EnterpriseCarbonCertificationTarget['certificationId'];
  workspaceLiveSession?: AgentWorkspaceLiveSession;
};

type ConversationPanelProps = {
  monitorContext?: boolean;
  activeMode: ModeKey;
  attachments: AgentComposerAttachment[];
  answerControls?: AgentAnswerControls;
  answerBlocks: AgentMessageBlock[];
  answerCards: AgentMessageCard[];
  answerStreaming?: boolean;
  answerToolCalls: AgentToolCall[];
  copyOnly?: boolean;
  contextInsightBanner?: AgentContextInsightDecision | null;
  historyError?: string;
  historyLoading?: boolean;
  headerTitle?: string;
  liveWorkspaceOpen?: boolean;
  liveWorkspaceSession?: AgentWorkspaceLiveSession;
  messages: AgentConversationMessage[];
  modeOptions: ModeOption[];
  previewOpen: boolean;
  productFootprintOptions?: ProductFootprintComposerOptions;
  projectHeader?: ProjectConversationHeaderProps;
  projectId?: string;
  question: string;
  questionAttachments?: AgentChatAttachment[];
  questionCreateTime?: string;
  questionReferenceContents?: string[];
  questionReferenceCount?: number;
  readonly?: boolean;
  quotes?: string[];
  selectionResetKey?: string;
  sessionId?: string;
  shareDisabled?: boolean;
  shareExpired?: boolean;
  shareId?: string;
  shareExpireTime?: string | null;
  shareLoading?: boolean;
  feedbackSource?: AgentFeedbackSource;
  factorDraft?: CcdbFactorPreviewTarget;
  factorRefs?: CcdbSessionFactorRef[];
  factorRefsError?: string;
  onReloadFactorRefs?: () => void;
  enterpriseCarbonReviewCertificationDisabled?: boolean;
  showThirdPartyCertification?: boolean;
  submitting?: boolean;
  value: string;
  onChange: (value: string) => void;
  onContextInsightAction: () => void;
  onContextInsightDismiss: () => void;
  onActionRequestSubmit: (payload: AgentActionRequestSubmitPayload) => void;
  onAttachmentDownload?: (attachment: AgentChatAttachment) => void;
  onErrorFeedback?: () => void;
  onFileRemove: (fileId: string) => void;
  onFilesSelect: (files: File[], origin?: AgentMonitorMaterialOrigin) => void;
  onFormRequestSubmit: (payload: AgentFormRequestSubmitPayload) => void;
  onModeChange: (mode: ModeKey) => void;
  onProjectFileSelect?: (file: AgentProjectFile) => void;
  onBusinessCardOpen?: (target: BusinessCardPreviewTarget) => void;
  onFactorOpen?: (target: CcdbFactorPreviewTarget) => void;
  onCancel?: () => void;
  onOpenAccountingManagement?: () => void;
  onOpenLiveWorkspace?: (session?: AgentWorkspaceLiveSession) => void;
  onOpenPreview?: () => void;
  onQuestionChange: (question: string) => void;
  onQuoteRemove?: (quoteIndex: number) => void;
  onQuoteSelect?: (quote: AgentMessageReference) => void;
  onReloadHistory?: () => void;
  onRetryMessage: (message: string) => void;
  onShare?: () => void;
  onShareExpiredExit?: () => void;
  onMonitorParse?: () => void;
  onSubmit: () => void;
};

type SelectionQuoteAction = {
  blockId?: string;
  sourceMessageId?: string;
  text: string;
  x: number;
  y: number;
};

const ConversationPanel = ({
  monitorContext = false,
  onMonitorParse,
  activeMode,
  attachments,
  answerControls,
  answerBlocks,
  answerCards,
  answerStreaming = false,
  answerToolCalls,
  copyOnly = false,
  contextInsightBanner,
  historyError = '',
  historyLoading = false,
  headerTitle,
  liveWorkspaceOpen = false,
  liveWorkspaceSession,
  messages,
  modeOptions,
  previewOpen,
  productFootprintOptions,
  projectHeader,
  projectId,
  question,
  questionAttachments = [],
  questionCreateTime,
  questionReferenceContents = [],
  questionReferenceCount = 0,
  readonly = false,
  quotes = [],
  selectionResetKey = '',
  sessionId,
  shareDisabled = false,
  shareExpired = false,
  shareId,
  shareExpireTime,
  shareLoading = false,
  feedbackSource = 'agent_web',
  factorDraft,
  factorRefs = [],
  factorRefsError = '',
  onReloadFactorRefs,
  enterpriseCarbonReviewCertificationDisabled,
  showThirdPartyCertification = true,
  submitting = false,
  value,
  onChange,
  onContextInsightAction,
  onContextInsightDismiss,
  onActionRequestSubmit,
  onAttachmentDownload,
  onErrorFeedback,
  onFileRemove,
  onFilesSelect,
  onFormRequestSubmit,
  onModeChange,
  onProjectFileSelect,
  onBusinessCardOpen,
  onFactorOpen,
  onCancel,
  onOpenAccountingManagement,
  onOpenLiveWorkspace,
  onOpenPreview,
  onQuestionChange,
  onQuoteRemove,
  onQuoteSelect,
  onReloadHistory,
  onRetryMessage,
  onShare,
  onShareExpiredExit,
  onSubmit,
}: ConversationPanelProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const [selectionQuoteAction, setSelectionQuoteAction] =
    useState<SelectionQuoteAction | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const enterpriseCarbonCardInteractionDisabled =
    (enterpriseCarbonReviewCertificationDisabled ?? readonly) ||
    submitting ||
    historyLoading;
  const answerContentLength = useMemo(
    () =>
      answerBlocks.reduce(
        (totalLength, block) => totalLength + block.content.length,
        0,
      ),
    [answerBlocks],
  );
  const hasCurrentAnswer = Boolean(
    answerBlocks.length ||
      answerCards.length ||
      answerToolCalls.length ||
      answerControls ||
      answerStreaming,
  );
  const showContextInsightBanner = Boolean(
    contextInsightBanner?.status === 'READY' &&
      contextInsightBanner.category != null,
  );
  const lastHistoricalAnswerIndex = useMemo(() => {
    if (hasCurrentAnswer) {
      return -1;
    }

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index].role === 'assistant') {
        return index;
      }
    }

    return -1;
  }, [hasCurrentAnswer, messages]);

  useEffect(() => {
    setSelectionQuoteAction(null);
    window.getSelection()?.removeAllRanges();
  }, [selectionResetKey]);

  useEffect(() => {
    const scrollElement = scrollRef.current;

    if (!scrollElement || !stickToBottomRef.current) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      scrollElement.scrollTo({
        behavior: answerStreaming ? 'auto' : 'smooth',
        top: scrollElement.scrollHeight,
      });
      setShowScrollToBottom(false);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    answerCards.length,
    answerControls?.showStartModel,
    answerContentLength,
    answerStreaming,
    answerToolCalls.length,
    historyLoading,
    messages.length,
    question,
  ]);

  const handleScroll = () => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    const distanceToBottom =
      scrollElement.scrollHeight -
      scrollElement.scrollTop -
      scrollElement.clientHeight;
    const shouldStick = distanceToBottom < SCROLL_TO_BOTTOM_THRESHOLD;

    stickToBottomRef.current = shouldStick;
    setShowScrollToBottom(!shouldStick);
    setSelectionQuoteAction(null);
  };

  const updateSelectionQuoteAction = () => {
    if (readonly || !onQuoteSelect) {
      setSelectionQuoteAction(null);
      return;
    }

    const selection = window.getSelection();

    if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
      setSelectionQuoteAction(null);
      return;
    }

    const range = selection.getRangeAt(0);
    const selectionStartElement = getElementFromNode(range.startContainer);
    const selectionEndElement = getElementFromNode(range.endContainer);
    const selectedAnswerElement = selectionStartElement?.closest(
      ANSWER_SELECTION_SELECTOR,
    );

    if (
      !selectedAnswerElement ||
      selectionEndElement?.closest(ANSWER_SELECTION_SELECTOR) !==
        selectedAnswerElement ||
      !scrollRef.current?.contains(selectedAnswerElement)
    ) {
      setSelectionQuoteAction(null);
      return;
    }

    const quoteText = normalizeSelectedQuote(selection.toString());

    if (!quoteText) {
      setSelectionQuoteAction(null);
      return;
    }

    const selectionRect = range.getBoundingClientRect();

    if (!selectionRect.width && !selectionRect.height) {
      setSelectionQuoteAction(null);
      return;
    }

    const nextX = Math.min(
      window.innerWidth - QUOTE_ACTION_EDGE_PADDING,
      Math.max(
        QUOTE_ACTION_EDGE_PADDING,
        selectionRect.left + selectionRect.width / 2,
      ),
    );
    const nextY =
      selectionRect.top > 72
        ? selectionRect.top - 8
        : selectionRect.bottom + 48;

    setSelectionQuoteAction({
      blockId: selectedAnswerElement.getAttribute('data-block-id') || undefined,
      sourceMessageId:
        selectedAnswerElement.getAttribute('data-message-id') || undefined,
      text: quoteText,
      x: nextX,
      y: nextY,
    });
  };

  const handleQuoteActionClick = () => {
    if (!selectionQuoteAction) {
      return;
    }

    onQuoteSelect?.({
      blockId: selectionQuoteAction.blockId,
      content: selectionQuoteAction.text,
      sourceMessageId: selectionQuoteAction.sourceMessageId,
      type: 'message',
    });
    setSelectionQuoteAction(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleScrollToBottom = () => {
    const scrollElement = scrollRef.current;

    if (!scrollElement) {
      return;
    }

    stickToBottomRef.current = true;
    setShowScrollToBottom(false);
    scrollElement.scrollTo({
      behavior: 'smooth',
      top: scrollElement.scrollHeight,
    });
  };

  const factorTargets = factorRefs.map(sessionFactorTarget);
  if (!factorTargets.length && factorDraft) factorTargets.push(factorDraft);
  let latestUserQuestion = '';
  let latestUserAttachments: AgentChatAttachment[] = [];

  return (
    <section
      className={classNames(style.conversationPanel, {
        [style.conversationPanelPreviewOpen]: previewOpen,
        [style.conversationPanelReadonly]: readonly,
      })}
      aria-label={I18N.carbonAgent.conversationContentLabel}
    >
      {projectHeader ? (
        <ProjectConversationHeader {...projectHeader} />
      ) : headerTitle || readonly || onShare ? (
        <div className={style.conversationTopBar}>
          <div className={style.conversationTopBarInner}>
            <div className={style.conversationTopBarText}>
              {headerTitle ? (
                <strong title={headerTitle}>{headerTitle}</strong>
              ) : null}
              {readonly ? (
                <span>
                  {shareExpireTime
                    ? I18N.template(I18N.carbonAgent.shareReadonlyExpireTime, {
                        val1: shareExpireTime,
                      })
                    : I18N.carbonAgent.shareReadonly}
                </span>
              ) : null}
            </div>
            {onShare ? (
              <button
                className={style.conversationShareButton}
                type='button'
                aria-busy={shareLoading}
                disabled={shareDisabled}
                onClick={onShare}
              >
                <ShareAltOutlined />
                <span>
                  {shareLoading
                    ? I18N.carbonAgent.shareCreating
                    : I18N.carbonAgent.share}
                </span>
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
      <div
        className={style.conversationScroll}
        ref={scrollRef}
        onKeyUp={updateSelectionQuoteAction}
        onMouseDown={() => setSelectionQuoteAction(null)}
        onMouseUp={updateSelectionQuoteAction}
        onScroll={handleScroll}
      >
        <div
          className={classNames(style.conversationScrollInner, {
            [style.conversationScrollInnerExpired]: shareExpired,
          })}
        >
          {historyLoading ? (
            <p className={style.answerPending}>
              {I18N.carbonAgent.loadingHistory}
            </p>
          ) : null}

          {!historyLoading && shareExpired ? (
            <div className={style.shareExpiredState} role='status'>
              <div
                aria-hidden='true'
                className={style.shareExpiredIllustration}
              >
                <span className={style.shareExpiredLinkIcon}>
                  <LinkOutlined />
                </span>
                <span className={style.shareExpiredClockIcon}>
                  <ClockCircleFilled />
                </span>
              </div>
              <h2>{I18N.carbonAgent.shareExpiredTitle}</h2>
              <p>{I18N.carbonAgent.shareExpiredDescription}</p>
              {onShareExpiredExit ? (
                <button
                  className={style.shareExpiredButton}
                  type='button'
                  onClick={onShareExpiredExit}
                >
                  {I18N.carbonAgent.shareExpiredBackHome}
                </button>
              ) : null}
            </div>
          ) : null}

          {!historyLoading && historyError && !shareExpired ? (
            <div className={style.historyErrorState} role='alert'>
              <span>{historyError}</span>
              {onReloadHistory ? (
                <button type='button' onClick={onReloadHistory}>
                  {I18N.carbonAgent.reload}
                </button>
              ) : null}
            </div>
          ) : null}

          {!historyLoading && factorRefsError && (
            <div className={style.historyErrorState} role='alert'>
              <span>{factorRefsError}</span>
              <button type='button' onClick={onReloadFactorRefs}>
                {I18N.ccdb.retry}
              </button>
            </div>
          )}
          {!historyLoading && !historyError && !factorRefsError
            ? factorTargets.map(factor => (
                <div
                  className={style.ccdbFactorDraft}
                  key={`${factor.factorId}:${
                    factor.detail?.factorVersion ?? ''
                  }`}
                >
                  <div className={style.ccdbFactorDraftIntro}>
                    <span aria-hidden='true'>C</span>
                    <p>{I18N.ccdb.factorOpened}</p>
                  </div>
                  <button
                    className={style.ccdbFactorDraftCard}
                    type='button'
                    onClick={() => onFactorOpen?.(factor)}
                  >
                    <span className={style.ccdbFactorDraftBadge}>
                      {I18N.ccdb.ccdbFactor}
                    </span>
                    <strong>
                      {factor.detail?.name ||
                        factor.name ||
                        I18N.ccdb.emissionFactor}
                    </strong>
                    <b>
                      {getCcdbFactorValue(factor.detail) ||
                        [factor.value, factor.unit].filter(Boolean).join(' ') ||
                        I18N.ccdb.viewDetails}
                    </b>
                    <small>
                      {[
                        factor.detail?.countries || factor.countries,
                        factor.detail?.year || factor.year,
                        factor.detail?.institution || factor.sourceName,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </small>
                    <span className={style.ccdbFactorDraftLink}>
                      {I18N.ccdb.viewFactorDetails}
                    </span>
                  </button>
                </div>
              ))
            : null}

          {messages.map((message, index) => {
            const messageKey = [
              message.role,
              message.turnIndex ?? index,
              message.id,
            ].join(':');

            if (message.role === 'user') {
              latestUserQuestion = message.content;
              latestUserAttachments = message.attachments || [];

              return (
                <QuestionBubble
                  attachments={message.attachments}
                  createTime={message.createTime}
                  editable={false}
                  key={messageKey}
                  question={message.content}
                  referenceContents={message.referenceContents}
                  referenceCount={message.referenceCount}
                  onAttachmentDownload={onAttachmentDownload}
                  onChange={noopQuestionChange}
                />
              );
            }

            const previousQuestion = latestUserQuestion;

            return (
              <AnswerMessage
                onMonitorFilesSelect={readonly ? undefined : onFilesSelect}
                answerControls={message.answerControls}
                blocks={message.blocks}
                cards={message.cards}
                copyOnly={copyOnly}
                feedback={message.feedback}
                feedbackSource={feedbackSource}
                enterpriseCarbonReviewCertificationDisabled={
                  enterpriseCarbonCardInteractionDisabled
                }
                interactionDisabled={readonly || submitting || historyLoading}
                key={messageKey}
                liveWorkspaceOpen={liveWorkspaceOpen}
                liveWorkspaceSession={liveWorkspaceSession}
                messageId={message.id}
                previewOpen={previewOpen}
                sessionId={sessionId}
                shareId={shareId}
                showThirdPartyCertification={showThirdPartyCertification}
                showActionsByDefault={index === lastHistoricalAnswerIndex}
                toolCalls={message.toolCalls}
                uploadedAttachments={latestUserAttachments}
                onActionRequestSubmit={onActionRequestSubmit}
                onBusinessCardOpen={onBusinessCardOpen}
                onFactorOpen={onFactorOpen}
                onErrorFeedback={copyOnly ? undefined : onErrorFeedback}
                onErrorRetry={
                  !copyOnly && previousQuestion
                    ? () => onRetryMessage(previousQuestion)
                    : undefined
                }
                onFormRequestSubmit={onFormRequestSubmit}
                onOpenAccountingManagement={onOpenAccountingManagement}
                onOpenLiveWorkspace={copyOnly ? undefined : onOpenLiveWorkspace}
                onOpenPreview={onOpenPreview}
              />
            );
          })}

          {question ? (
            <QuestionBubble
              attachments={questionAttachments}
              createTime={questionCreateTime}
              question={question}
              referenceContents={
                questionReferenceContents.length
                  ? questionReferenceContents
                  : quotes
              }
              referenceCount={questionReferenceCount || quotes.length}
              onAttachmentDownload={onAttachmentDownload}
              onChange={onQuestionChange}
              editable={false}
            />
          ) : null}
          <AnswerMessage
            onMonitorFilesSelect={readonly ? undefined : onFilesSelect}
            answerControls={answerControls}
            blocks={answerBlocks}
            cards={answerCards}
            copyOnly={copyOnly}
            feedbackSource={feedbackSource}
            enterpriseCarbonReviewCertificationDisabled={
              enterpriseCarbonCardInteractionDisabled
            }
            interactionDisabled={readonly || submitting || historyLoading}
            liveWorkspaceOpen={liveWorkspaceOpen}
            liveWorkspaceSession={liveWorkspaceSession}
            previewOpen={previewOpen}
            sessionId={sessionId}
            shareId={shareId}
            showThirdPartyCertification={showThirdPartyCertification}
            showActionsByDefault={hasCurrentAnswer && !answerStreaming}
            streaming={answerStreaming}
            toolCalls={answerToolCalls}
            uploadedAttachments={questionAttachments}
            onActionRequestSubmit={onActionRequestSubmit}
            onBusinessCardOpen={onBusinessCardOpen}
            onFactorOpen={onFactorOpen}
            onErrorFeedback={copyOnly ? undefined : onErrorFeedback}
            onErrorRetry={
              !copyOnly && question ? () => onRetryMessage(question) : undefined
            }
            onFormRequestSubmit={onFormRequestSubmit}
            onOpenAccountingManagement={onOpenAccountingManagement}
            onOpenLiveWorkspace={copyOnly ? undefined : onOpenLiveWorkspace}
            onOpenPreview={onOpenPreview}
          />
          {/* 材料队列属于本次用户输入；解析结果只由 Agent 消息呈现，不另建管理工作区。 */}
          {!readonly &&
            !shareId &&
            !historyLoading &&
            (monitorContext ||
              answerCards.some(isMonitorCard) ||
              answerToolCalls.some(monitorToolResult) ||
              messages.some(
                item =>
                  item.cards?.some(isMonitorCard) ||
                  item.toolCalls?.some(monitorToolResult),
              )) &&
            attachments.length > 0 && (
              <MonitorFileQueue
                attachments={attachments}
                disabled={submitting}
                onFilesSelect={onFilesSelect}
                onRemove={onFileRemove}
                onParse={onMonitorParse}
              />
            )}
        </div>
      </div>

      {selectionQuoteAction && !readonly ? (
        <button
          className={style.selectionQuoteAction}
          type='button'
          style={{
            left: selectionQuoteAction.x,
            top: selectionQuoteAction.y,
          }}
          onMouseDown={event => event.preventDefault()}
          onClick={handleQuoteActionClick}
        >
          <span className={style.selectionQuoteActionInner}>
            <img
              className={style.selectionQuoteIcon}
              src={selectionQuoteIcon}
              alt=''
            />
            <span>{I18N.carbonAgent.addToConversation}</span>
          </span>
        </button>
      ) : null}

      <div className={style.conversationComposerDock}>
        {showScrollToBottom ? (
          <button
            className={classNames(style.conversationScrollToBottom, {
              [style.conversationScrollToBottomStreaming]: answerStreaming,
            })}
            type='button'
            aria-label={I18N.carbonAgent.scrollToBottom}
            title={I18N.carbonAgent.scrollToBottom}
            onClick={handleScrollToBottom}
          >
            <ArrowDownOutlined />
          </button>
        ) : null}
        {readonly ? null : (
          <div
            className={classNames(style.conversationComposerSurface, {
              [style.conversationComposerSurfaceWithInsight]:
                showContextInsightBanner,
            })}
          >
            {showContextInsightBanner && contextInsightBanner ? (
              <ContextInsightBanner
                banner={contextInsightBanner}
                onAction={onContextInsightAction}
                onDismiss={onContextInsightDismiss}
              />
            ) : null}
            <Composer
              activeMode={activeMode}
              attachments={attachments}
              className={style.conversationComposer}
              disabled={historyLoading}
              modeOptions={modeOptions}
              productFootprintOptions={productFootprintOptions}
              projectId={projectId}
              quotes={quotes}
              showModeSelector={!projectId}
              submitting={submitting}
              value={value}
              onChange={onChange}
              onAttachmentDownload={onAttachmentDownload}
              onFileRemove={onFileRemove}
              onFilesSelect={onFilesSelect}
              onModeChange={onModeChange}
              onProjectFileSelect={onProjectFileSelect}
              onQuoteRemove={onQuoteRemove}
              onCancel={onCancel}
              onSubmit={onSubmit}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default ConversationPanel;
