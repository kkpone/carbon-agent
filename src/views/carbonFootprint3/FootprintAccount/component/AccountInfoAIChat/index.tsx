/**
 * 碳足迹核算-AI对话组件
 */
// import { PaperClipOutlined } from '@ant-design/icons';
import upArrowSvg from '@src/assets/icon/esg/upArrow.svg';
import closeGraySvg from '@src/assets/icon/lj/login/close-gray.svg';
import aiStarSvg from '@src/assets/svg/aiStar.svg';
import circleCloseSvg from '@src/assets/svg/circle_close.svg';
import I18N from '@src/lang/I18N';
import { Toast } from '@src/utils/Toast';
import { Button, Spin } from 'antd';
import classNames from 'classnames';
import {
  forwardRef,
  KeyboardEvent,
  ReactNode,
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { streamFetch } from '@/api/streamFetch';
import { ECompanyType } from '@/api/types';
import referenceIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/history-dialogue.svg';
import reductionAiAvatarIcon from '@/assets/images/carbonFootprint3/figma-agent-ui/reduction-ai-avatar.svg';
import { useAICarbonFloating } from '@/components/AICarbonFloating/AICarbonContext';
import FileUploadModal, { fileIconMap } from '@/components/FileUploadModal';
import { useSubscriptionServiceModal } from '@/components/SubscriptionServiceModal';
import { IconAlibabaNew } from '@/components/iconfont';
import { getUserInfo, sleep, uuid } from '@/utils';
import { ProductSource } from '@/views/system/login/component/Login';

import { AIMessage } from './components/AIMessage';
import { UserMessage } from './components/UserMessage';
import styles from './index.module.less';
import {
  AiTopicChatRecord,
  collectTopicRowsIntentType1UserTexts,
  fetchAiChatIntentType,
  fetchAccountEmissionAiProcess,
  fetchAiModelQuestions,
  fetchAiTopicChatMessages,
  fetchModelCheck,
  jsonQuestionItemToAiModelQuestionItem,
  jsonQuestionRecordToUpdateChatBody,
  mapTopicChatRowsToChatMessages,
  pickLatestJsonQuestionRow,
  pollTopicChatUntilSettled,
  postAiChatUpdateChat,
  resolveFootprintAiTopicId,
  updateModel,
} from './service';
import {
  AccountInfoAIChatProps,
  AccountInfoAIChatRef,
  AiModelQuestionAnswerPayload,
  AiModelQuestionItem,
  ChatAppendix,
  ChatMessage,
  FormCard,
  UploadListFile,
} from './type';

function buildGreetingMessage(): ChatMessage {
  return {
    role: 'assistant',
    uuid: 'greeting',
    time: new Date().toLocaleTimeString(),
    content: I18N.accountInfoAiChat.greeting,
    contentType: 'text',
  };
}

/** 接口偶发返回非数组 optionList，直接 .map 会导致页面白屏崩溃 */
function normalizeQuestionOptionList(
  raw: AiModelQuestionItem['optionList'],
): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => (item == null ? '' : String(item)));
}

function mapQuestionToFormCard(q: AiModelQuestionItem): FormCard {
  const hasInput = q.inputBox === 1;
  const optionListSafe = normalizeQuestionOptionList(q.optionList);
  /** 有输入框时不展示选项（二者互斥）；多选纯选项题单独展示「确定」按钮 */
  const showOptions =
    !hasInput && q.optionType !== 0 && optionListSafe.length > 0;
  const options = showOptions
    ? optionListSafe.map(text => ({ label: text, value: text }))
    : undefined;
  const inputField = hasInput
    ? {
        placeholder: I18N.accountInfoAiChat.placeholderEnter,
        unit: q.inputBoxUnit?.trim() ? q.inputBoxUnit.trim() : undefined,
      }
    : undefined;
  let optionSelectMode: 'multi' | 'single' | undefined;
  if (q.optionType === 2) {
    optionSelectMode = 'multi';
  } else if (q.optionType === 1) {
    optionSelectMode = 'single';
  }

  return {
    title: q.questionTitle ?? '',
    options,
    inputField,
    optionSelectMode,
    confirmButtonLabel: inputField
      ? I18N.accountInfoAiChat.confirmOk
      : q.optionType === 2 && showOptions
      ? I18N.accountInfoAiChat.confirmOk
      : undefined,
  };
}

function buildAssistantQuestionMessage(q: AiModelQuestionItem): ChatMessage {
  return {
    role: 'assistant',
    uuid: uuid(),
    time: new Date().toLocaleTimeString(),
    content: '',
    contentType: 'form-card',
    questionMeta: { questionNum: q.questionNum },
    formCard: mapQuestionToFormCard(q),
  };
}

function collectionFinishedAssistantMessages(): ChatMessage[] {
  return [
    {
      role: 'assistant',
      uuid: uuid(),
      time: new Date().toLocaleTimeString(),
      content: I18N.accountInfoAiChat.collectionCompletePrompt,
      contentType: 'text',
    },
    {
      role: 'assistant',
      uuid: uuid(),
      time: new Date().toLocaleTimeString(),
      content: '',
      contentType: 'action-buttons',
      actionButtons: ['continue', 'update-model'],
    },
  ];
}

/**
 * 在最新 json_question 记录对应的时间线气泡之后插入「采集完毕」文案与双按钮，
 * 后续时间线仍可接模型评价、意图对话等。
 */
function insertCollectionFinishedAfterLatestJsonQuestionTimeline(
  timeline: ChatMessage[],
  latestJsonQuestionRecordId: number,
): ChatMessage[] {
  let lastIdx = -1;
  timeline.forEach((m, i) => {
    if (m.historyId === latestJsonQuestionRecordId) {
      lastIdx = i;
    }
  });
  const chunk = collectionFinishedAssistantMessages();
  if (lastIdx === -1) {
    return [...timeline, ...chunk];
  }
  return [
    ...timeline.slice(0, lastIdx + 1),
    ...chunk,
    ...timeline.slice(lastIdx + 1),
  ];
}

function buildAnswerForQuestion(
  q: AiModelQuestionItem | undefined,
  selectedValue?: string,
  inputValue?: string,
): string {
  if (!q) return '';
  if (q.inputBox === 1 && inputValue?.trim()) {
    const v = inputValue.trim();
    const u = q.inputBoxUnit?.trim() ?? '';
    return u ? `${v} ${u}` : v;
  }
  if (q.optionType !== 0 && selectedValue?.trim()) return selectedValue.trim();
  return (selectedValue || inputValue || '').trim();
}

/** type=1 时累积进 aiModelUpdate.content；意图接口仅传正文，此处也只累积用户输入文案 */
function intentUserChunkForAccumulate(trimmed: string): string {
  return trimmed;
}

/** 回形针通用附件发送成功后累积，供 aiModelUpdate.fileUrl（按 url 去重） */
function mergeAppendixIntoModelUpdateFiles(
  ref: { current: { name: string; url: string }[] },
  appendix: ChatAppendix[],
) {
  if (appendix.length === 0) return;
  const seen = new Set(ref.current.map(f => f.url));
  appendix.forEach(item => {
    if (!item.url || seen.has(item.url)) {
      return;
    }
    seen.add(item.url);
    ref.current.push({ name: item.name, url: item.url });
  });
}

export const AccountInfoAIChat = forwardRef<
  AccountInfoAIChatRef,
  AccountInfoAIChatProps
>(({ accountId, onUpdateModel, aiCheck, onAfterProvideDetail }, ref) => {
  /** companyType 非轻量版（≠ ECompanyType.lite）时隐藏模型评价「专家检查/指导」 */
  const hideExpertEvaluationUi =
    String(getUserInfo()?.userInfo?.companyType ?? '') !== ECompanyType.lite;

  /** topicChat JSON 重试仍用小碳上下文 extraFunc */
  const { extraFunc } = useAICarbonFloating();

  /** 菜单 / aiChat 使用的会话 id：historyTopic 首条或 getSid */
  const [historyTopicId, setHistoryTopicId] = useState<number | undefined>(
    undefined,
  );

  /** 异步回调里读取当前会话 id（避免闭包陈旧），与进入页首次解析结果一致 */
  const historyTopicIdRef = useRef(historyTopicId);
  useEffect(() => {
    historyTopicIdRef.current = historyTopicId;
  }, [historyTopicId]);

  /** topicChat 原始行快照（保存小题后整体重算 UI） */
  const lastTopicRowsRef = useRef<AiTopicChatRecord[]>([]);
  /** topicChat 中 chatFrom 为 intentType1 的用户正文，与本轮意图 type=1 一并写入 aiModelUpdate.content */
  const topicChatIntentType1HistoryRef = useRef<string[]>([]);

  /** topicChat 映射后的时间线气泡（含 json_question 展开），不含问候语 */
  const topicChatBaselineRef = useRef<ChatMessage[]>([]);
  const jsonQuestionParentRef = useRef<AiTopicChatRecord | null>(null);
  const fullQuestionDefsRef = useRef<AiModelQuestionItem[]>([]);
  const questionnaireTopicModeRef = useRef(false);
  const submittingQuestionRef = useRef<number | null>(null);

  const { openSubscriptionModal } = useSubscriptionServiceModal();
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    buildGreetingMessage(),
  ]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const [sortedQuestions, setSortedQuestions] = useState<AiModelQuestionItem[]>(
    [],
  );
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const answersRef = useRef<Record<number, string>>({});
  /** 某题是否已触发过「前进下一题」逻辑（改选同一题答案时不重复追加下一题） */
  const answeredQuestionAdvanceRef = useRef<Set<number>>(new Set());
  /** 意图识别为 type 1 时累积的用户补充文案，更新模型时用「#」拼接传给 aiModelUpdate.content */
  const intentType1UserTextsRef = useRef<string[]>([]);
  /** 未选中菜单时通过回形针上传并发消息的附件，更新模型时作为 fileUrl 提交 */
  const modelUpdateFileUrlRef = useRef<{ name: string; url: string }[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [collectionFinished, setCollectionFinished] = useState(false);
  /** 预留：与采集完成态联动；展示「继续提供信息 / 更新模型」时底部输入也可直接使用 */
  const [allowBottomChat, setAllowBottomChat] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [referenceContent, setReferenceContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  /** 通用对话附件文件（回形针上传） */
  const [attachmentFiles, setAttachmentFiles] = useState<UploadListFile[]>([]);
  /** 仅用户点击回形针后为 true */
  // const [paperclipHighlight, setPaperclipHighlight] = useState(false);
  /** 「提供详细信息」请求中 */
  const [provideDetailLoading, setProvideDetailLoading] = useState(false);

  const messageListRef = useRef<HTMLDivElement>(null);
  /** 用户未主动上滑离开时保持贴底，上滑查看历史则不再强制滚到底 */
  const stickToBottomRef = useRef(true);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);
  const pendingQuestionGuideRef = useRef<string>();

  const PINNED_TO_BOTTOM_THRESHOLD_PX = 100;

  const updateStickToBottomFromScroll = useCallback(() => {
    const root = messageListRef.current;
    if (!root) return;
    const distanceFromBottom =
      root.scrollHeight - root.scrollTop - root.clientHeight;
    stickToBottomRef.current =
      distanceFromBottom <= PINNED_TO_BOTTOM_THRESHOLD_PX;
  }, []);

  const scrollMessageListToBottom = useCallback((focusInput = false) => {
    stickToBottomRef.current = true;
    const run = () => {
      const root = messageListRef.current;
      if (root) {
        root.scrollTop = root.scrollHeight;
      }
    };
    run();
    requestAnimationFrame(run);
    window.setTimeout(run, 80);
    if (focusInput) {
      window.setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, []);

  const scrollCollectionFinishedIntoView = useCallback(() => {
    stickToBottomRef.current = false;
    const run = () => {
      const root = messageListRef.current;
      if (!root) return;

      const completeTextNodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-ai-collection-complete="true"]',
        ),
      );
      const completeActionNodes = Array.from(
        root.querySelectorAll<HTMLElement>(
          '[data-ai-collection-actions="true"]',
        ),
      );
      const textTarget = completeTextNodes[completeTextNodes.length - 1];
      const actionTarget = completeActionNodes[completeActionNodes.length - 1];
      if (!textTarget && !actionTarget) return;

      const firstTarget = textTarget || actionTarget;
      const lastTarget = actionTarget || textTarget;
      const rootRect = root.getBoundingClientRect();
      const firstRect = firstTarget.getBoundingClientRect();
      const lastRect = lastTarget.getBoundingClientRect();
      const topMargin = 8;
      const bottomMargin = 8;
      const minVisibleTop = rootRect.top + topMargin;
      const maxVisibleBottom = rootRect.bottom - bottomMargin;
      const blockHeight = lastRect.bottom - firstRect.top;
      const availableHeight = maxVisibleBottom - minVisibleTop;

      if (blockHeight > availableHeight) {
        root.scrollTop += firstRect.top - minVisibleTop;
        return;
      }
      if (firstRect.top < minVisibleTop) {
        root.scrollTop += firstRect.top - minVisibleTop;
        return;
      }
      if (lastRect.bottom > maxVisibleBottom) {
        root.scrollTop += lastRect.bottom - maxVisibleBottom;
      }
    };

    requestAnimationFrame(run);
    window.setTimeout(run, 80);
  }, []);

  const scrollQuestionIntoView = useCallback(
    (questionNum?: number) => {
      if (questionNum == null) {
        scrollCollectionFinishedIntoView();
        return;
      }

      stickToBottomRef.current = false;
      const run = () => {
        const root = messageListRef.current;
        const target = root?.querySelector<HTMLElement>(
          `[data-ai-question-num="${questionNum}"]`,
        );
        if (!root || !target) {
          return;
        }

        const rootRect = root.getBoundingClientRect();
        const targetRect = target.getBoundingClientRect();
        const topMargin = 8;
        const bottomMargin = 8;
        const minVisibleTop = rootRect.top + topMargin;
        const maxVisibleBottom = rootRect.bottom - bottomMargin;

        if (targetRect.top < minVisibleTop) {
          root.scrollTop += targetRect.top - minVisibleTop;
          return;
        }
        if (targetRect.bottom > maxVisibleBottom) {
          root.scrollTop += targetRect.bottom - maxVisibleBottom;
        }
      };

      requestAnimationFrame(run);
      window.setTimeout(run, 80);
    },
    [scrollCollectionFinishedIntoView],
  );

  useLayoutEffect(() => {
    if (!stickToBottomRef.current) return;
    const root = messageListRef.current;
    if (!root) return;
    const run = () => {
      root.scrollTop = root.scrollHeight;
    };
    run();
    requestAnimationFrame(run);
  }, [messages, isSending, questionsLoading]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /** 根据 topicChat 行数据刷新问卷区与消息列表（挂载与「提供详细信息」成功后共用） */
  const applyTopicChatRows = useCallback(
    (
      rows: AiTopicChatRecord[],
      opts?: { preserveSessionAccumulators?: boolean },
    ) => {
      answeredQuestionAdvanceRef.current = new Set();
      submittingQuestionRef.current = null;
      if (!opts?.preserveSessionAccumulators) {
        intentType1UserTextsRef.current = [];
        modelUpdateFileUrlRef.current = [];
      }

      lastTopicRowsRef.current = rows.slice();

      const timeline = mapTopicChatRowsToChatMessages(rows);
      topicChatBaselineRef.current = timeline;
      topicChatIntentType1HistoryRef.current =
        collectTopicRowsIntentType1UserTexts(rows);

      const latestJson = pickLatestJsonQuestionRow(rows);
      const greeting = buildGreetingMessage();

      let timelineForUi = timeline;

      if (latestJson?.jsonList && latestJson.jsonList.length > 0) {
        questionnaireTopicModeRef.current = true;
        jsonQuestionParentRef.current = latestJson;

        const defs = [...latestJson.jsonList]
          .sort((a, b) => Number(a.questionNum) - Number(b.questionNum))
          .map(row =>
            jsonQuestionItemToAiModelQuestionItem(
              row as Record<string, unknown>,
            ),
          );
        fullQuestionDefsRef.current = defs;

        const ans: Record<number, string> = {};
        defs.forEach(q => {
          if ((q.status ?? 0) !== 0 && q.answer) {
            ans[q.questionNum] = q.answer;
          }
        });
        setAnswers(ans);
        answersRef.current = ans;

        const firstZeroIdx = defs.findIndex(q => (q.status ?? 0) === 0);

        if (firstZeroIdx === -1) {
          timelineForUi =
            insertCollectionFinishedAfterLatestJsonQuestionTimeline(
              timeline,
              latestJson.id,
            );
          setCollectionFinished(true);
          setAllowBottomChat(true);
          setSortedQuestions([]);
        } else {
          setSortedQuestions(defs.slice(firstZeroIdx));
          setCollectionFinished(false);
          setAllowBottomChat(false);
        }
      } else {
        questionnaireTopicModeRef.current = false;
        jsonQuestionParentRef.current = null;
        fullQuestionDefsRef.current = [];
        setSortedQuestions([]);
        setAnswers({});
        answersRef.current = {};

        if (timeline.length === 0) {
          setCollectionFinished(false);
          setAllowBottomChat(false);
        } else {
          setCollectionFinished(true);
          setAllowBottomChat(true);
        }
      }

      const nextMessages: ChatMessage[] = [greeting, ...timelineForUi];

      setMessages(nextMessages);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;
    setQuestionsLoading(true);
    setSortedQuestions([]);
    setAnswers({});
    answersRef.current = {};
    answeredQuestionAdvanceRef.current = new Set();
    intentType1UserTextsRef.current = [];
    modelUpdateFileUrlRef.current = [];
    setCollectionFinished(false);
    setAllowBottomChat(false);
    setReferenceContent('');
    setMessages([buildGreetingMessage()]);
    stickToBottomRef.current = true;

    questionnaireTopicModeRef.current = false;
    jsonQuestionParentRef.current = null;
    fullQuestionDefsRef.current = [];
    topicChatBaselineRef.current = [];
    submittingQuestionRef.current = null;
    lastTopicRowsRef.current = [];
    topicChatIntentType1HistoryRef.current = [];

    const appendQuestionsFailed = () => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          uuid: uuid(),
          time: new Date().toLocaleTimeString(),
          content: I18N.accountInfoAiChat.loadQuestionsFailed,
          contentType: 'text',
        },
      ]);
    };

    (async () => {
      try {
        const topicId = await resolveFootprintAiTopicId(accountId);
        if (cancelled) return;
        if (topicId == null) {
          throw new Error('no_topic');
        }
        setHistoryTopicId(topicId);

        const chatRes = await fetchAiTopicChatMessages({
          topicId: String(topicId),
        });
        if (cancelled) return;

        const rows = Array.isArray(chatRes.data?.data) ? chatRes.data.data : [];
        applyTopicChatRows(rows);

        const pollAccountEmissionAiUntilIdle = async (): Promise<void> => {
          const deadline = Date.now() + 120_000;
          const step = async (): Promise<void> => {
            if (cancelled || Date.now() >= deadline) return;
            try {
              const pr = await fetchAccountEmissionAiProcess({
                accountId,
              });
              if (cancelled) return;
              if (pr.data?.code === 200 && pr.data.data === 0) {
                const again = await fetchAiTopicChatMessages({
                  topicId: String(topicId),
                });
                if (cancelled) return;
                const rows2 = Array.isArray(again.data?.data)
                  ? again.data.data
                  : [];
                applyTopicChatRows(rows2);
                return;
              }
            } catch {
              /* 单次请求失败不中断，继续轮询 */
            }
            if (cancelled) return;
            await sleep(2000);
            await step();
          };
          await step();
        };
        pollAccountEmissionAiUntilIdle().catch(() => {
          /* 后台轮询失败不打扰主流程 */
        });
      } catch {
        if (!cancelled) {
          appendQuestionsFailed();
          setHistoryTopicId(undefined);
        }
      } finally {
        if (!cancelled) setQuestionsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [accountId, applyTopicChatRows]);

  const appendAssistantMessage = useCallback(
    (content: string, extra?: Partial<ChatMessage>) => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          uuid: uuid(),
          time: new Date().toLocaleTimeString(),
          content,
          contentType: 'text',
          ...extra,
        },
      ]);
    },
    [],
  );

  /** AI助手对话（意图 type=3）；若已在列表中插入用户消息则勿重复插入 */
  const sendAssistantStream = useCallback(
    async (
      content: string,
      appendix?: ChatAppendix[],
      opts?: { userMessageAlreadyInList?: boolean; referContent?: string },
    ) => {
      let resolvedTopicId = historyTopicId;
      if (
        resolvedTopicId === undefined ||
        resolvedTopicId === null ||
        Number.isNaN(Number(resolvedTopicId))
      ) {
        try {
          resolvedTopicId = await resolveFootprintAiTopicId(accountId);
          if (
            resolvedTopicId !== undefined &&
            resolvedTopicId !== null &&
            !Number.isNaN(Number(resolvedTopicId))
          ) {
            setHistoryTopicId(resolvedTopicId);
          }
        } catch {
          resolvedTopicId = undefined;
        }
      }

      if (
        resolvedTopicId === undefined ||
        resolvedTopicId === null ||
        Number.isNaN(Number(resolvedTopicId))
      ) {
        Toast('error', I18N.accountInfoAiChat.topicMissingToast);
        return;
      }

      const topicIdStr = String(resolvedTopicId);

      const userMsg: ChatMessage = {
        role: 'user',
        uuid: uuid(),
        time: new Date().toLocaleTimeString(),
        content,
        appendix,
        referContent: opts?.referContent,
      };

      const loadingAssistantMsg: ChatMessage = {
        role: 'assistant',
        uuid: uuid(),
        time: new Date().toLocaleTimeString(),
        content: '',
        loading: true,
      };

      setMessages(prev =>
        opts?.userMessageAlreadyInList
          ? [...prev, loadingAssistantMsg]
          : [...prev, userMsg, loadingAssistantMsg],
      );

      const abortCtrl = new AbortController();
      abortCtrlRef.current = abortCtrl;

      try {
        await streamFetch({
          url: `${process.env.REACT_APP_API_URL}/ai/chat/aiAssistantChatting`,
          data: {
            query: content,
            topicId: topicIdStr,
            detail: true,
            stream: true,
            accountId,
            ...(opts?.referContent ? { referContent: opts.referContent } : {}),
            referFiles:
              appendix?.map(a => ({ name: a.name, url: a.url })) ?? [],
            referLink: [],
            referText: [],
          },
          onMessage: (e: string) => {
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (!last) return prev;
              if (last.role === 'user') {
                return [
                  ...prev,
                  {
                    role: 'assistant',
                    uuid: uuid(),
                    time: new Date().toLocaleTimeString(),
                    content: e,
                    loading: false,
                  },
                ];
              }
              return [
                ...prev.slice(0, prev.length - 1),
                {
                  ...last,
                  content: `${last.content}${e}`,
                  loading: false,
                },
              ];
            });
          },
          abortCtrl,
        });
      } catch {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (!last) return prev;
          if (last.loading) {
            return [
              ...prev.slice(0, prev.length - 1),
              {
                ...last,
                content: I18N.accountInfoAiChat.streamFailed,
                loading: false,
              },
            ];
          }
          return prev;
        });
      }
    },
    [accountId, historyTopicId],
  );

  const executeModelUpdateThenCheck = useCallback(async () => {
    const defs =
      fullQuestionDefsRef.current.length > 0
        ? fullQuestionDefsRef.current
        : sortedQuestions;
    const questionList: AiModelQuestionAnswerPayload[] = defs.map(q => ({
      questionNum: q.questionNum,
      questionTitle: q.questionTitle,
      questionDescription: q.questionDescription,
      answer: answersRef.current[q.questionNum] ?? q.answer ?? '',
    }));
    const historical = topicChatIntentType1HistoryRef.current.filter(Boolean);
    const session = intentType1UserTextsRef.current.filter(Boolean);
    const content = [...historical, ...session].join('#');
    const fileUrl =
      modelUpdateFileUrlRef.current.length > 0
        ? modelUpdateFileUrlRef.current.map(f => ({ ...f }))
        : undefined;
    let tid = historyTopicIdRef.current;
    if (tid == null || Number.isNaN(Number(tid))) {
      try {
        const resolved = await resolveFootprintAiTopicId(accountId);
        if (resolved != null && !Number.isNaN(Number(resolved))) {
          tid = resolved;
          setHistoryTopicId(resolved);
        }
      } catch {
        tid = undefined;
      }
    }
    if (tid == null || Number.isNaN(Number(tid))) {
      Toast('error', I18N.accountInfoAiChat.topicMissingToast);
      return;
    }
    await updateModel({
      accountId,
      content,
      questionList,
      topicId: String(tid),
      ...(fileUrl ? { fileUrl } : {}),
    });
    intentType1UserTextsRef.current = [];
    modelUpdateFileUrlRef.current = [];
    let evaluateList: string[] = [];
    try {
      const checkRes = await fetchModelCheck({
        accountId: Number(accountId),
        topicId: tid,
      });
      evaluateList = checkRes.data?.data?.evaluateList ?? [];
    } catch {
      evaluateList = [];
    }
    const heading = I18N.accountInfoAiChat.modelEvaluationHeading;
    const evaluation =
      evaluateList.length > 0
        ? `## ${heading}\n\n${evaluateList.map(t => `- ${t}`).join('\n')}`
        : I18N.accountInfoAiChat.modelUpdatedNoEvaluationDetail;
    setMessages(prev => [
      ...prev,
      {
        role: 'assistant',
        uuid: uuid(),
        time: new Date().toLocaleTimeString(),
        content: evaluation,
        contentType: 'evaluation',
      },
    ]);
    setAllowBottomChat(true);
    onUpdateModel?.();
  }, [accountId, sortedQuestions, onUpdateModel]);

  const handleIntentUserSend = useCallback(
    async (
      trimmed: string,
      appendix?: ChatAppendix[],
      referContent?: string,
    ) => {
      try {
        const fileUrl =
          appendix
            ?.filter(a => a.url)
            .map(a => ({ name: a.name, url: a.url })) ?? [];
        const tid = historyTopicIdRef.current;
        const intentRes = await fetchAiChatIntentType({
          accountId: String(accountId),
          content: trimmed,
          ...(tid != null && !Number.isNaN(Number(tid))
            ? { topicId: String(tid) }
            : {}),
          ...(fileUrl.length > 0 ? { fileUrl } : {}),
        });
        const type = String(intentRes.data?.data?.type ?? '').trim();

        /** type 1：补充信息——累积正文 +「已接收」+ 继续提供信息 / 更新模型 */
        if (type === '1') {
          const chunk = intentUserChunkForAccumulate(trimmed);
          if (chunk) {
            intentType1UserTextsRef.current.push(chunk);
          }
          appendAssistantMessage(I18N.accountInfoAiChat.infoReceived);
          setMessages(prev => [
            ...prev,
            {
              role: 'assistant',
              uuid: uuid(),
              time: new Date().toLocaleTimeString(),
              content: '',
              contentType: 'action-buttons',
              actionButtons: ['continue', 'update-model'],
            },
          ]);
          setAllowBottomChat(true);
          return;
        }

        /** type 2：建模——与历史 chatFrom=intentType2 一致，直接更新模型并拉评价 */
        if (type === '2') {
          await executeModelUpdateThenCheck();
          return;
        }

        if (type === '3') {
          await sendAssistantStream(trimmed, appendix, {
            userMessageAlreadyInList: true,
            referContent,
          });
          setAllowBottomChat(true);
          return;
        }

        appendAssistantMessage(I18N.accountInfoAiChat.intentRecognizeFailed);
      } catch {
        appendAssistantMessage(I18N.accountInfoAiChat.sendFailed);
      }
    },
    [
      accountId,
      appendAssistantMessage,
      executeModelUpdateThenCheck,
      sendAssistantStream,
    ],
  );

  /** topicChat json 失败重试：与小碳 Answer.onFailed → extraFunc.onHistoryFailed → getMsg 一致 */
  const handleTopicJsonRetryFailed = useCallback(
    async (historyId: number) => {
      await extraFunc?.onHistoryFailed?.({ accountId, id: historyId });
      if (
        historyTopicId === undefined ||
        historyTopicId === null ||
        Number.isNaN(Number(historyTopicId))
      ) {
        return;
      }
      const flat = await pollTopicChatUntilSettled(String(historyTopicId));
      setMessages(prev =>
        prev.map(m => {
          if (m.historyId !== historyId) return m;
          const fresh = flat.find(
            f => f.role === m.role && f.historyId === historyId,
          );
          return fresh ?? m;
        }),
      );
    },
    [accountId, extraFunc, historyTopicId],
  );

  /** 发送消息：仅有附件不可发送；有附件时必须同时有正文（回车 / 点击发送一致） */
  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim();
    const currentReferenceContent = referenceContent.trim();

    const toAppendix = (files: UploadListFile[]): ChatAppendix[] =>
      files
        .filter(f => f.status === 'done' && f.response?.data?.url)
        .map(f => ({
          name: f.response!.data!.name || f.name,
          url: f.response!.data!.url!,
        }));

    if (isSending || questionsLoading) return;
    const tail = messagesRef.current[messagesRef.current.length - 1];
    if (tail?.role === 'assistant' && tail.loading) return;
    if (!trimmed && attachmentFiles.length === 0) return;

    const appendix = toAppendix(attachmentFiles);

    if (
      attachmentFiles.length > 0 &&
      appendix.length < attachmentFiles.length
    ) {
      Toast('info', I18N.accountInfoAiChat.waitAttachmentUpload);
      return;
    }

    if (appendix.length > 0 && !trimmed) {
      Toast('info', I18N.accountInfoAiChat.enterTextWithAttachment);
      return;
    }

    setInputValue('');
    setReferenceContent('');
    stickToBottomRef.current = true;

    mergeAppendixIntoModelUpdateFiles(modelUpdateFileUrlRef, appendix);
    setAttachmentFiles([]);

    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        uuid: uuid(),
        time: new Date().toLocaleTimeString(),
        content: trimmed,
        appendix: appendix.length ? appendix : undefined,
        referContent: currentReferenceContent || undefined,
      },
    ]);
    setIsSending(true);
    try {
      await handleIntentUserSend(
        trimmed,
        appendix.length ? appendix : undefined,
        currentReferenceContent || undefined,
      );
    } finally {
      setIsSending(false);
    }
  }, [
    inputValue,
    referenceContent,
    isSending,
    questionsLoading,
    attachmentFiles,
    handleIntentUserSend,
  ]);

  const sendQuestionGuide = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed) return;

      const tail = messagesRef.current[messagesRef.current.length - 1];
      const assistantLoading = Boolean(
        tail?.role === 'assistant' && tail.loading,
      );
      if (questionsLoading || isSending || assistantLoading) {
        pendingQuestionGuideRef.current = trimmed;
        return;
      }

      let tid = historyTopicIdRef.current;
      if (tid == null || Number.isNaN(Number(tid))) {
        const resolved = await resolveFootprintAiTopicId(accountId);
        if (resolved != null && !Number.isNaN(Number(resolved))) {
          tid = resolved;
          historyTopicIdRef.current = resolved;
          setHistoryTopicId(resolved);
        }
      }

      if (tid == null || Number.isNaN(Number(tid))) {
        Toast('error', I18N.accountInfoAiChat.topicMissingToast);
        return;
      }

      setInputValue('');
      setReferenceContent('');
      stickToBottomRef.current = true;
      setAttachmentFiles([]);
      setMessages(prev => [
        ...prev,
        {
          role: 'user',
          uuid: uuid(),
          time: new Date().toLocaleTimeString(),
          content: trimmed,
        },
      ]);
      setIsSending(true);
      try {
        await handleIntentUserSend(trimmed);
      } finally {
        setIsSending(false);
      }
    },
    [accountId, handleIntentUserSend, isSending, questionsLoading],
  );

  useEffect(() => {
    if (questionsLoading || isSending || !pendingQuestionGuideRef.current) {
      return;
    }
    const pendingQuestion = pendingQuestionGuideRef.current;
    pendingQuestionGuideRef.current = undefined;
    sendQuestionGuide(pendingQuestion).catch(() => {});
  }, [isSending, questionsLoading, sendQuestionGuide]);

  const addReferenceContent = useCallback(
    (referenceText: string) => {
      const trimmed = referenceText.trim();
      if (!trimmed) {
        return;
      }
      setReferenceContent(trimmed);
      scrollMessageListToBottom(true);
    },
    [scrollMessageListToBottom],
  );

  useImperativeHandle(
    ref,
    () => ({
      sendQuestionGuide: question => {
        sendQuestionGuide(question).catch(() => {});
      },
      addReferenceContent,
    }),
    [addReferenceContent, sendQuestionGuide],
  );

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // 输入法候选词确认也会触发 Enter，合成期间必须交由输入法处理。
    if (e.nativeEvent.isComposing || e.keyCode === 229) return;
    if (e.key !== 'Enter' || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    handleSend().catch(() => {});
  };

  /** 「提供详细信息」：触发问卷入库并刷新核算详情；topicId 与 topicChat / 意图接口一致 */
  const handleProvideDetail = useCallback(async () => {
    setProvideDetailLoading(true);
    try {
      let tid = historyTopicIdRef.current;
      if (tid == null || Number.isNaN(Number(tid))) {
        const resolved = await resolveFootprintAiTopicId(accountId);
        if (resolved != null && !Number.isNaN(Number(resolved))) {
          tid = resolved;
          setHistoryTopicId(resolved);
        }
      }

      await fetchAiModelQuestions({
        accountId: String(accountId),
        ...(tid != null && !Number.isNaN(Number(tid))
          ? { topicId: String(tid) }
          : {}),
      });
      await onAfterProvideDetail?.();

      if (tid == null || Number.isNaN(Number(tid))) {
        return;
      }

      setQuestionsLoading(true);
      stickToBottomRef.current = true;
      try {
        const chatRes = await fetchAiTopicChatMessages({
          topicId: String(tid),
        });
        const rows = Array.isArray(chatRes.data?.data) ? chatRes.data.data : [];
        applyTopicChatRows(rows);
        scrollMessageListToBottom();
      } catch {
        Toast('error', I18N.accountInfoAiChat.loadQuestionsFailed);
      } finally {
        setQuestionsLoading(false);
      }
    } catch {
      Toast('error', I18N.accountInfoAiChat.provideDetailedInformationFailed);
    } finally {
      setProvideDetailLoading(false);
    }
  }, [
    accountId,
    onAfterProvideDetail,
    applyTopicChatRows,
    scrollMessageListToBottom,
  ]);

  /** 表单卡片完成（含建模问卷逐题） */
  const handleFormCardComplete = useCallback(
    (
      messageUuid: string,
      selectedValue?: string,
      cardInputValue?: string,
      questionNum?: number,
    ) => {
      if (questionNum == null) {
        setMessages(prev =>
          prev.map(msg =>
            msg.uuid === messageUuid && msg.formCard
              ? {
                  ...msg,
                  formCard: {
                    ...msg.formCard,
                    completed: true,
                    selectedValue,
                    inputValue: cardInputValue,
                  },
                }
              : msg,
          ),
        );
        scrollMessageListToBottom();
        return;
      }

      if (questionnaireTopicModeRef.current && jsonQuestionParentRef.current) {
        (async () => {
          const parent = jsonQuestionParentRef.current;
          if (!parent?.jsonList) return;
          if (submittingQuestionRef.current === questionNum) return;

          const qDef = fullQuestionDefsRef.current.find(
            q => q.questionNum === questionNum,
          );
          const ansStr = buildAnswerForQuestion(
            qDef,
            selectedValue,
            cardInputValue,
          );
          if (!ansStr) return;

          submittingQuestionRef.current = questionNum;

          const newJsonList = (parent.jsonList ?? []).map(entry => {
            const e = entry as Record<string, unknown>;
            if (Number(e.questionNum) !== questionNum) return e;
            return {
              ...e,
              answer: ansStr,
              status: 1,
            };
          });
          const nextQuestionNum = [...newJsonList]
            .sort(
              (a, b) => Number(a.questionNum ?? 0) - Number(b.questionNum ?? 0),
            )
            .find(entry => Number(entry.status ?? 0) === 0)?.questionNum;

          try {
            await postAiChatUpdateChat(
              jsonQuestionRecordToUpdateChatBody(parent, newJsonList),
            );
          } catch {
            Toast('error', I18N.accountInfoAiChat.sendFailed);
            submittingQuestionRef.current = null;
            return;
          }

          const applyMergedFallback = () => {
            const mergedParent: AiTopicChatRecord = {
              ...parent,
              jsonList: newJsonList,
            };
            const base =
              lastTopicRowsRef.current.length > 0
                ? lastTopicRowsRef.current
                : [mergedParent];
            const rows = base.map(r =>
              r.id === mergedParent.id ? mergedParent : r,
            );
            applyTopicChatRows(rows, { preserveSessionAccumulators: true });
          };

          const tid = historyTopicIdRef.current;
          if (tid != null && !Number.isNaN(Number(tid))) {
            try {
              const chatRes = await fetchAiTopicChatMessages({
                topicId: String(tid),
              });
              const rows = Array.isArray(chatRes.data?.data)
                ? chatRes.data.data
                : [];
              applyTopicChatRows(rows, { preserveSessionAccumulators: true });
              scrollQuestionIntoView(Number(nextQuestionNum) || undefined);
            } catch {
              applyMergedFallback();
              scrollQuestionIntoView(Number(nextQuestionNum) || undefined);
            }
          } else {
            applyMergedFallback();
            scrollQuestionIntoView(Number(nextQuestionNum) || undefined);
          }
          submittingQuestionRef.current = null;
        })().catch(() => {
          submittingQuestionRef.current = null;
        });
        return;
      }

      const alreadyAdvanced =
        answeredQuestionAdvanceRef.current.has(questionNum);

      setAnswers(prev => {
        const qDefInner = sortedQuestions.find(
          q => q.questionNum === questionNum,
        );
        const ansInner = buildAnswerForQuestion(
          qDefInner,
          selectedValue,
          cardInputValue,
        );
        const next = { ...prev, [questionNum]: ansInner };
        answersRef.current = next;
        return next;
      });

      const idx = sortedQuestions.findIndex(q => q.questionNum === questionNum);

      if (!alreadyAdvanced) {
        answeredQuestionAdvanceRef.current.add(questionNum);
      }

      setMessages(prev => {
        const updated = prev.map(msg =>
          msg.uuid === messageUuid && msg.formCard
            ? {
                ...msg,
                formCard: {
                  ...msg.formCard,
                  completed: true,
                  selectedValue,
                  inputValue: cardInputValue,
                },
              }
            : msg,
        );

        if (alreadyAdvanced) {
          return updated;
        }

        if (idx === -1) return updated;
        if (idx < sortedQuestions.length - 1) {
          return [
            ...updated,
            buildAssistantQuestionMessage(sortedQuestions[idx + 1]),
          ];
        }
        return [
          ...updated,
          {
            role: 'assistant',
            uuid: uuid(),
            time: new Date().toLocaleTimeString(),
            content: I18N.accountInfoAiChat.collectionCompletePrompt,
            contentType: 'text',
          },
          {
            role: 'assistant',
            uuid: uuid(),
            time: new Date().toLocaleTimeString(),
            content: '',
            contentType: 'action-buttons',
            actionButtons: ['continue', 'update-model'],
          },
        ];
      });
      scrollQuestionIntoView(sortedQuestions[idx + 1]?.questionNum);

      if (!alreadyAdvanced && idx >= 0 && idx === sortedQuestions.length - 1) {
        setCollectionFinished(true);
        setAllowBottomChat(true);
      }
    },
    [
      sortedQuestions,
      applyTopicChatRows,
      scrollMessageListToBottom,
      scrollQuestionIntoView,
    ],
  );

  /** 继续提供信息：仅提示，用户输入后在发送流程中走意图接口 */
  const handleContinue = useCallback(() => {
    appendAssistantMessage(I18N.accountInfoAiChat.continueDescribeReply);
    setAllowBottomChat(true);
    scrollMessageListToBottom(true);
  }, [appendAssistantMessage, scrollMessageListToBottom]);

  /** 更新模型：直接更新建模 → 成功后模型检查 → 展示评价与专家入口 */
  const handleUpdateModel = useCallback(async () => {
    stickToBottomRef.current = true;
    setIsSending(true);
    try {
      await executeModelUpdateThenCheck();
    } catch {
      appendAssistantMessage(I18N.accountInfoAiChat.updateModelFailed);
    } finally {
      setIsSending(false);
    }
  }, [appendAssistantMessage, executeModelUpdateThenCheck]);

  /** 专家检查/指导：打开订阅服务弹窗 */
  const handleExpertGuide = useCallback(() => {
    openSubscriptionModal({
      productSource: ProductSource.product,
      preselectProfessionalSupportKeyword:
        I18N.accountInfoAiChat.expertServiceKeyword,
    });
  }, [openSubscriptionModal]);

  const bottomAreaLocked = collectionFinished && !allowBottomChat;

  const trimmedInput = inputValue.trim();
  const attachmentsReady =
    attachmentFiles.length === 0 ||
    attachmentFiles.every(
      f => f.status === 'done' && Boolean(f.response?.data?.url),
    );

  const hasAttachments = attachmentFiles.length > 0;

  const lastMsg = messages[messages.length - 1];
  const assistantRowLoading = Boolean(
    lastMsg?.role === 'assistant' && lastMsg.loading,
  );
  const assistantReplyInFlight =
    questionsLoading || isSending || assistantRowLoading;

  const sendEnabledClick =
    !assistantReplyInFlight &&
    !bottomAreaLocked &&
    trimmedInput.length > 0 &&
    attachmentsReady;
  const showSendingIndicator =
    questionsLoading || (isSending && !assistantRowLoading);

  const visibleMessages = messages.filter(msg => msg.uuid !== 'greeting');
  const showWelcome = visibleMessages.length === 0 && !showSendingIndicator;
  const showModelDirectProvideDetailButton = aiCheck === 0 && !showWelcome;

  const getQuestionnaireProgressText = () => {
    const defs = fullQuestionDefsRef.current;
    if (defs.length > 0) {
      const firstUnansweredIdx = defs.findIndex(q => (q.status ?? 0) === 0);
      const current =
        firstUnansweredIdx === -1 ? defs.length : firstUnansweredIdx + 1;
      return `${current}/${defs.length}`;
    }
    const questionnaireCount = visibleMessages.filter(
      msg =>
        msg.role === 'assistant' &&
        msg.dataType === 'json_question' &&
        msg.contentType === 'form-card',
    ).length;
    return `${questionnaireCount}/${questionnaireCount}`;
  };

  const renderAssistantMessage = (msg: ChatMessage, index: number) => {
    const isCollectionCompleteText =
      msg.role === 'assistant' &&
      msg.contentType === 'text' &&
      msg.content === I18N.accountInfoAiChat.collectionCompletePrompt;
    const isCollectionActions =
      msg.role === 'assistant' &&
      msg.contentType === 'action-buttons' &&
      msg.actionButtons?.includes('continue') &&
      msg.actionButtons?.includes('update-model');

    return (
      <div
        key={msg.uuid}
        data-ai-question-num={msg.questionMeta?.questionNum}
        data-ai-collection-complete={
          isCollectionCompleteText ? 'true' : undefined
        }
        data-ai-collection-actions={isCollectionActions ? 'true' : undefined}
      >
        <AIMessage
          message={msg}
          messageIndex={index}
          allMessages={messages}
          onFormCardComplete={handleFormCardComplete}
          onContinue={handleContinue}
          onUpdateModel={handleUpdateModel}
          onExpertGuide={handleExpertGuide}
          hideExpertEvaluationButton={hideExpertEvaluationUi}
          onTopicJsonRetryFailed={handleTopicJsonRetryFailed}
        />
      </div>
    );
  };

  const renderMessages = () => {
    const nodes: ReactNode[] = [];
    let index = 0;
    while (index < messages.length) {
      const msg = messages[index];
      if (msg.uuid === 'greeting') {
        index += 1;
      } else if (msg.role === 'user') {
        nodes.push(
          <UserMessage
            key={msg.uuid}
            content={msg.content}
            appendix={msg.appendix}
            referContent={msg.referContent}
          />,
        );
        index += 1;
      } else {
        const isQuestionnaireCard =
          msg.dataType === 'json_question' && msg.contentType === 'form-card';
        if (!isQuestionnaireCard) {
          nodes.push(renderAssistantMessage(msg, index));
          index += 1;
        } else {
          const group: Array<{ message: ChatMessage; messageIndex: number }> =
            [];
          let cursor = index;
          while (cursor < messages.length) {
            const current = messages[cursor];
            if (
              current.role !== 'assistant' ||
              current.dataType !== 'json_question' ||
              current.contentType !== 'form-card'
            ) {
              break;
            }
            group.push({ message: current, messageIndex: cursor });
            cursor += 1;
          }

          nodes.push(
            <div
              key={`questionnaire-${msg.uuid}`}
              className={styles.questionnairePanel}
            >
              <div className={styles.questionnaireHeader}>
                <span>{I18N.accountInfoAiChat.provideDetailedInformation}</span>
                <span className={styles.questionnaireProgress}>
                  {getQuestionnaireProgressText()}
                </span>
              </div>
              <div className={styles.questionnaireContent}>
                {group.map(item =>
                  renderAssistantMessage(item.message, item.messageIndex),
                )}
              </div>
            </div>,
          );
          index = cursor;
        }
      }
    }
    return nodes;
  };

  return (
    <div
      className={classNames(styles.chatContainer, {
        [styles.chatContainerWelcome]: showWelcome,
      })}
    >
      {!showWelcome && (
        <div className={styles.chatHeader}>
          <div className={styles.agentTitle}>
            <img src={reductionAiAvatarIcon} alt='' />
            <span>{I18N.accountInfoAiChat.aiAgentTitle}</span>
          </div>
        </div>
      )}

      {/* 消息列表区域 */}
      {showWelcome ? (
        <div className={styles.welcomeBody}>
          <div className={styles.welcomeContent}>
            <div className={styles.welcomeTitle}>
              <span className={styles.welcomeTitlePrefix}>
                {I18N.accountInfoAiChat.welcomeTitlePrefix}
              </span>
              <span className={styles.welcomeTitleGradient}>
                {I18N.accountInfoAiChat.aiAgentTitle}
              </span>
            </div>
            <div className={styles.welcomeGreeting}>
              {I18N.accountInfoAiChat.greeting}
            </div>
            {aiCheck === 0 && (
              <Button
                className={styles.provideDetailBtn}
                loading={provideDetailLoading}
                disabled={questionsLoading || provideDetailLoading}
                onClick={() => {
                  handleProvideDetail().catch(() => {});
                }}
              >
                <img src={aiStarSvg} alt='' />
                {I18N.accountInfoAiChat.provideDetailedInformation}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          ref={messageListRef}
          className={styles.messageList}
          onScroll={updateStickToBottomFromScroll}
        >
          {renderMessages()}
          {showSendingIndicator && (
            <div className={styles.sendingIndicator}>
              <Spin size='small' />
            </div>
          )}
        </div>
      )}

      {/* 底部输入区域 */}
      <div className={styles.inputArea}>
        {showModelDirectProvideDetailButton && (
          <Button
            className={styles.provideDetailBtn}
            loading={provideDetailLoading}
            disabled={questionsLoading || provideDetailLoading}
            onClick={() => {
              handleProvideDetail().catch(() => {});
            }}
          >
            <img src={aiStarSvg} alt='' />
            {I18N.accountInfoAiChat.provideDetailedInformation}
          </Button>
        )}
        <div className={styles.inputWrapper}>
          {/* 输入框区域：AI 图标 + 附件列表 + textarea */}
          <div className={styles.inputContainer}>
            <img src={aiStarSvg} alt='AI' className={styles.inputAiIcon} />

            {referenceContent && (
              <div className={styles.referenceChip} title={referenceContent}>
                <img
                  className={styles.referenceChipIcon}
                  src={referenceIcon}
                  alt=''
                />
                <span className={styles.referenceChipText}>
                  {referenceContent}
                </span>
                <button
                  type='button'
                  className={styles.referenceChipRemove}
                  onClick={() => setReferenceContent('')}
                >
                  <img src={closeGraySvg} alt='' />
                </button>
              </div>
            )}

            {attachmentFiles.length > 0 && (
              <div className={styles.fileListInner}>
                {attachmentFiles.map(f => (
                  <div key={f.uid} className={styles.fileItem}>
                    <IconAlibabaNew
                      className={styles.fileTypeIcon}
                      type={
                        fileIconMap[(f.name ?? '').split('.').pop() || ''] ||
                        fileIconMap.xls
                      }
                    />
                    <div className={styles.fileItemName} title={f.name}>
                      {f.name}
                    </div>
                    <div
                      className={styles.fileItemRemove}
                      onClick={() =>
                        setAttachmentFiles(prev =>
                          prev.filter(p => p.uid !== f.uid),
                        )
                      }
                    >
                      <img src={circleCloseSvg} alt='' />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              className={styles.textarea}
              placeholder={
                hasAttachments
                  ? I18N.accountInfoAiChat.placeholderOtherDesc
                  : I18N.accountInfoAiChat.placeholderSendMessage
              }
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={bottomAreaLocked}
            />
          </div>

          {/* 底部操作行 */}
          <div className={styles.footerRight}>
            {/* <div className={styles.leftActions}>
              <div
                className={classNames(styles.actionBtn, {
                  [styles.actionBtnActive]: paperclipHighlight,
                })}
                title={I18N.accountInfoAiChat.uploadAttachmentTitle}
                onClick={() => {
                  setPaperclipHighlight(true);
                  setFileUploadOpen(true);
                }}
              >
                <PaperClipOutlined />
              </div>
            </div> */}

            {/* 发送按钮 */}
            <div
              className={classNames(styles.send, {
                [styles.enable]: sendEnabledClick,
              })}
              onClick={
                sendEnabledClick
                  ? () => {
                      handleSend().catch(() => {});
                    }
                  : undefined
              }
            >
              <img src={upArrowSvg} alt={I18N.accountInfoAiChat.sendAlt} />
            </div>
          </div>
        </div>

        <div className={styles.tip}>
          {I18N.accountInfoAiChat.footerAiDisclaimer}
        </div>
      </div>

      {/* 文件上传弹窗（回形针） */}
      <FileUploadModal
        open={fileUploadOpen}
        modalMask
        zIndex={10020}
        title={I18N.accountInfoAiChat.uploadDataModalTitle}
        files={attachmentFiles}
        accept='.xlsx,.xls,.pdf,.jpg,.jpeg,.doc,.docx,.csv,.txt'
        maxCount={5}
        maxSize={20}
        onClose={() => {
          // setPaperclipHighlight(false);
          setFileUploadOpen(false);
        }}
        onConfirm={files => {
          setAttachmentFiles(files as UploadListFile[]);
          // setPaperclipHighlight(false);
          setFileUploadOpen(false);
        }}
      />
    </div>
  );
});

AccountInfoAIChat.displayName = 'AccountInfoAIChat';
