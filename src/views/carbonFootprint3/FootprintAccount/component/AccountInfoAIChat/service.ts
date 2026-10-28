import I18N from '@src/lang/I18N';

import { request } from '@/api/request';
import { AI_HISTORY_STATUS } from '@/components/AICarbonFloating/constant';
import { sleep } from '@/utils';

import {
  AiModelQuestionAnswerPayload,
  AiModelQuestionItem,
  ChatMessage,
  FormCard,
} from './type';

function normalizeJsonQuestionOptionList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(item => (item == null ? '' : String(item)));
}

/** topicChat `json_question.jsonList` 单项 → 建模问卷项（缺省字段补默认值） */
export function jsonQuestionItemToAiModelQuestionItem(
  raw: Record<string, unknown>,
): AiModelQuestionItem {
  const num = Number(raw.questionNum ?? 0);
  return {
    questionNum: Number.isFinite(num) ? num : 0,
    questionTitle: String(raw.questionTitle ?? ''),
    questionDescription: String(raw.questionDescription ?? ''),
    inputBox: Number(raw.inputBox ?? 0),
    inputBoxUnit: String(raw.inputBoxUnit ?? ''),
    optionType: Number(raw.optionType ?? 0),
    optionList: normalizeJsonQuestionOptionList(raw.optionList),
    button: Number(raw.button ?? 0),
    status: raw.status != null ? Number(raw.status) : undefined,
    answer: raw.answer != null ? String(raw.answer) : undefined,
  };
}

/**
 * POST `/ai/chat/updateChat` 请求体（与后端示例对齐）
 * 仅包含 id、status、jsonList、referFiles（无附件时为 null）
 */
export function jsonQuestionRecordToUpdateChatBody(
  record: AiTopicChatRecord,
  jsonList: Record<string, unknown>[],
): Record<string, unknown> {
  const files = record.referFiles;
  const referFiles =
    files != null && Array.isArray(files) && files.length > 0 ? files : null;
  return {
    id: record.id,
    status: record.status ?? 0,
    jsonList,
    referFiles,
  };
}

/** 与 AiDrawerContent/service.ts getHistoryTopic 对齐：按核算维度拉取小碳会话列表 */
export type AiChatHistoryTopicItem = {
  id: number;
  topicTitle: string;
};

/** GET `/ai/chat/historyTopic`，入参 fromId 即核算 accountId，取列表第一条的 id 作为 topicId */
export const fetchAiChatHistoryTopic = (params: { fromId: number | string }) =>
  request<{ data: AiChatHistoryTopicItem[] }>({
    method: 'get',
    url: '/ai/chat/historyTopic',
    params,
  });

/** GET `/ai/chat/getSid`，新建会话 id（与 AiDrawerContent getSid 一致） */
export const fetchAiChatGetSid = () =>
  request<{ data: { sid?: number; topicId?: number } }>({
    method: 'get',
    url: '/ai/chat/getSid',
  });

/**
 * historyTopic 首条 id；若列表为空则 getSid（sid / topicId）。
 */
export async function resolveFootprintAiTopicId(
  fromId: number | string,
): Promise<number | undefined> {
  try {
    const ht = await fetchAiChatHistoryTopic({ fromId });
    const list = ht.data?.data;
    if (Array.isArray(list) && list.length > 0 && list[0]?.id != null) {
      return Number(list[0].id);
    }
  } catch {
    /* fallthrough */
  }
  try {
    const res = await fetchAiChatGetSid();
    const raw = res.data?.data;
    const sid = raw?.sid ?? raw?.topicId;
    return sid != null ? Number(sid) : undefined;
  } catch {
    return undefined;
  }
}

/** 与 AiDrawerContent getMessagesByTopicId 一致：GET `/ai/chat/topicChat` */
export type AiTopicChatRecord = {
  id: number;
  userContent?: string | null;
  aiContent?: string | null;
  topicId?: number;
  createTime: string;
  status?: number;
  dataType?: 'json' | 'markdown' | 'json_question' | 'json_evaluateList';
  jsonList?: Record<string, unknown>[] | null;
  evaluateList?: unknown;
  referFiles?: { name: string; url: string }[];
  referLink?: string[];
  referText?: string[];
  referContent?: string | null;
  likeStatus?: number;
  chatFrom?: string | null;
  deepThink?: number | null;
};

export const fetchAiTopicChatMessages = (params: { topicId: string }) =>
  request<{ data: AiTopicChatRecord[] }>({
    method: 'get',
    url: '/ai/chat/topicChat',
    params,
  });

/** POST `/ai/chat/updateChat`，更新 json_question 对话记录（jsonList 含小题 answer/status） */
export const postAiChatUpdateChat = (data: Record<string, unknown>) =>
  request<{ data?: { dataType?: string }; msg?: string; code?: number }>({
    method: 'post',
    url: '/ai/chat/updateChat',
    data,
  });

/** 同一会话可能存在多条 json_question，取 id 最大的一条作为当前问卷快照 */
export function pickLatestJsonQuestionRow(
  rows: AiTopicChatRecord[],
): AiTopicChatRecord | undefined {
  const candidates = rows.filter(r => r.dataType === 'json_question');
  if (candidates.length === 0) return undefined;
  return candidates.reduce((best, cur) => (cur.id > best.id ? cur : best));
}

/** topicChat 行按 createTime 升序（时间正序）；无效时间视为 0，同毫秒按 id 升序 */
export function sortTopicChatRowsByCreateTimeAsc(
  rows: AiTopicChatRecord[],
): AiTopicChatRecord[] {
  return [...rows].sort((a, b) => {
    const ta = new Date(a.createTime ?? '').getTime();
    const tb = new Date(b.createTime ?? '').getTime();
    const na = Number.isFinite(ta) ? ta : 0;
    const nb = Number.isFinite(tb) ? tb : 0;
    if (na !== nb) return na - nb;
    return a.id - b.id;
  });
}

/** chatFrom 为 intentType1，与 aiChatIntentType type=1（补充信息）一致 */
export function isTopicChatRecordChatFromIntentType1(
  chatFrom: unknown,
): boolean {
  return String(chatFrom ?? '').trim() === 'intentType1';
}

/** 按 createTime 正序抽取 intentType1 的用户正文，供 aiModelUpdate.content 与本轮 type=1 会话累积拼接 */
export function collectTopicRowsIntentType1UserTexts(
  rows: AiTopicChatRecord[],
): string[] {
  const chunks: string[] = [];
  sortTopicChatRowsByCreateTimeAsc(rows).forEach(row => {
    if (!isTopicChatRecordChatFromIntentType1(row.chatFrom)) return;
    const t = row.userContent?.trim();
    if (t) chunks.push(t);
  });
  return chunks;
}

/**
 * topicChat `dataType === 'json_evaluateList'`：将评价条目转为与实时模型检查一致的 Markdown，
 * 由 UI 以 `contentType: 'evaluation'` 展示（含专家入口等）。
 */
export function formatTopicChatJsonEvaluateListMarkdown(
  item: AiTopicChatRecord,
): string {
  const heading = I18N.accountInfoAiChat.modelEvaluationHeading;
  const bullets: string[] = [];
  const pushEvaluateStrings = (arr: unknown) => {
    if (!Array.isArray(arr)) return;
    arr.forEach(cell => {
      if (typeof cell !== 'string') return;
      const t = cell.trim();
      if (t) bullets.push(t);
    });
  };
  pushEvaluateStrings(item.evaluateList);

  const rawListUnknown = item.jsonList as unknown[] | null | undefined;
  if (bullets.length === 0 && Array.isArray(rawListUnknown)) {
    rawListUnknown.forEach(entry => {
      if (typeof entry === 'string') {
        const t = entry.trim();
        if (t) bullets.push(t);
        return;
      }
      if (entry == null || typeof entry !== 'object') return;
      const o = entry as Record<string, unknown>;
      const candidates = [
        o.evaluateContent,
        o.content,
        o.text,
        o.evaluateItem,
        o.item,
        o.title,
        o.desc,
        o.evaluate,
      ];
      const hit = candidates.find(c => typeof c === 'string' && c.trim());
      if (hit && typeof hit === 'string') bullets.push(hit.trim());
    });
  }
  if (bullets.length > 0) {
    return `## ${heading}\n\n${bullets.map(t => `- ${t}`).join('\n')}`;
  }
  const fromAi = item.aiContent?.trim() ?? '';
  if (fromAi) return fromAi;
  return I18N.accountInfoAiChat.modelUpdatedNoEvaluationDetail;
}

function normalizeQuestionOptionListForCard(
  raw: AiModelQuestionItem['optionList'],
): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(entry => (entry == null ? '' : String(entry)));
}

function mapAiQuestionToFormCard(q: AiModelQuestionItem): FormCard {
  const hasInput = q.inputBox === 1;
  const optionListSafe = normalizeQuestionOptionListForCard(q.optionList);
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
  if (q.optionType === 2) optionSelectMode = 'multi';
  else if (q.optionType === 1) optionSelectMode = 'single';

  let confirmButtonLabel: string | undefined;
  if (inputField) {
    confirmButtonLabel = I18N.accountInfoAiChat.confirmOk;
  } else if (q.optionType === 2 && showOptions) {
    confirmButtonLabel = I18N.accountInfoAiChat.confirmOk;
  }

  return {
    title: q.questionTitle ?? '',
    options,
    inputField,
    optionSelectMode,
    confirmButtonLabel,
  };
}

function splitStoredAnswerForFormCardSvc(q: AiModelQuestionItem): {
  selectedValue?: string;
  inputValue?: string;
} {
  const ans = q.answer ?? '';
  if (q.inputBox === 1) {
    let v = ans.trim();
    const u = q.inputBoxUnit?.trim() ?? '';
    if (u && v.endsWith(` ${u}`)) {
      v = v.slice(0, v.length - (u.length + 1)).trim();
    } else if (u && v.endsWith(u)) {
      v = v.slice(0, v.length - u.length).trim();
    }
    return { inputValue: v };
  }
  return { selectedValue: ans };
}

function buildAssistantQuestionMessageSvc(
  q: AiModelQuestionItem,
  createTime: string,
  recordId: number,
): ChatMessage {
  return {
    role: 'assistant',
    uuid: `jq-active-${recordId}-${q.questionNum}`,
    time: createTime,
    content: '',
    contentType: 'form-card',
    questionMeta: { questionNum: q.questionNum },
    formCard: mapAiQuestionToFormCard(q),
    historyId: recordId,
    dataType: 'json_question',
  };
}

function buildCompletedAssistantQuestionMessageSvc(
  q: AiModelQuestionItem,
  recordId: number,
  createTime: string,
): ChatMessage {
  const fcBase = mapAiQuestionToFormCard(q);
  const { selectedValue, inputValue } = splitStoredAnswerForFormCardSvc(q);
  return {
    role: 'assistant',
    uuid: `jq-done-${recordId}-${q.questionNum}`,
    time: createTime,
    content: '',
    contentType: 'form-card',
    questionMeta: { questionNum: q.questionNum },
    formCard: {
      ...fcBase,
      completed: true,
      selectedValue,
      inputValue,
    },
    historyId: recordId,
    dataType: 'json_question',
  };
}

/**
 * 按 createTime 时间正序构造会话气泡（与接口数组原始顺序无关）。
 * json_question：展示 aiContent；jsonList 中 status===0 的小题不展示答题卡片，
 * 仅最新一条 json_question（latestJq）上首个未答题展示可交互卡片。
 * json_evaluateList：模型评价历史，映射为 evaluation 气泡。
 */
export function buildTopicChatTimelineMessages(
  rows: AiTopicChatRecord[],
  latestJq?: AiTopicChatRecord,
): ChatMessage[] {
  const out: ChatMessage[] = [];
  const latestId = latestJq?.id;
  /** 本条已为 intentType1 用户气泡，后续 markdown 后需插「已接收」+ 双按钮（intentType2 无按钮，衔接 json_evaluateList） */
  let pendingIntentType1ActionBar = false;

  sortTopicChatRowsByCreateTimeAsc(rows).forEach(item => {
    const userText = item.userContent?.trim() ?? '';
    const hasAppendix = (item.referFiles?.length ?? 0) > 0;
    const referContent = item.referContent?.trim() ?? '';
    if (userText.length > 0 || hasAppendix || referContent.length > 0) {
      out.push({
        role: 'user',
        uuid: `topic-user-${item.id}`,
        time: item.createTime,
        content: userText,
        appendix: (item.referFiles ?? []).map(f => ({
          name: f.name,
          url: f.url,
        })),
        referContent: referContent || undefined,
        historyId: item.id,
      });
      pendingIntentType1ActionBar = isTopicChatRecordChatFromIntentType1(
        item.chatFrom,
      );
    }

    if (item.dataType === 'json_evaluateList') {
      pendingIntentType1ActionBar = false;
      out.push({
        role: 'assistant',
        uuid: `topic-eval-${item.id}`,
        time: item.createTime,
        content: formatTopicChatJsonEvaluateListMarkdown(item),
        contentType: 'evaluation',
        historyId: item.id,
      });
      return;
    }

    if (item.dataType === 'json_question') {
      pendingIntentType1ActionBar = false;
      if (item.aiContent?.trim()) {
        out.push({
          role: 'assistant',
          uuid: `jq-intro-${item.id}`,
          time: item.createTime,
          content: item.aiContent.trim(),
          contentType: 'text',
          historyId: item.id,
        });
      }
      const sorted = [...(item.jsonList ?? [])].sort(
        (a, b) => Number(a.questionNum) - Number(b.questionNum),
      );
      const defs = sorted.map(row =>
        jsonQuestionItemToAiModelQuestionItem(row as Record<string, unknown>),
      );
      const firstZeroIdx = defs.findIndex(q => (q.status ?? 0) === 0);

      defs.forEach((q, idx) => {
        const st = q.status ?? 0;
        if (st !== 0) {
          out.push(
            buildCompletedAssistantQuestionMessageSvc(
              q,
              item.id,
              item.createTime,
            ),
          );
        } else if (
          item.id === latestId &&
          firstZeroIdx !== -1 &&
          idx === firstZeroIdx
        ) {
          out.push(
            buildAssistantQuestionMessageSvc(q, item.createTime, item.id),
          );
        }
      });
      return;
    }

    const aiText = item.aiContent?.trim() ?? '';
    const hasJsonList = (item.jsonList?.length ?? 0) > 0;
    const showAssistant =
      item.dataType === 'markdown' ||
      item.dataType === 'json' ||
      aiText.length > 0 ||
      hasJsonList;

    if (showAssistant) {
      out.push({
        role: 'assistant',
        uuid: `topic-assistant-${item.id}`,
        time: item.createTime,
        content: item.aiContent ?? '',
        dataType: item.dataType,
        jsonList: (item.jsonList ?? null) as ChatMessage['jsonList'],
        status: item.status,
        historyId: item.id,
      });

      const showIntentType1ActionButtons =
        item.dataType === 'markdown' &&
        (pendingIntentType1ActionBar ||
          isTopicChatRecordChatFromIntentType1(item.chatFrom));

      if (showIntentType1ActionButtons) {
        pendingIntentType1ActionBar = false;
        out.push({
          role: 'assistant',
          uuid: `topic-intent-actions-${item.id}`,
          time: item.createTime,
          content: I18N.accountInfoAiChat.infoReceived,
          contentType: 'action-buttons',
          actionButtons: ['continue', 'update-model'],
          historyId: item.id,
        });
      }
    }
  });

  return out;
}

/** topicChat → ChatMessage（createTime 时间正序；含 json_question 展开规则） */
export function mapTopicChatRowsToChatMessages(
  rows: AiTopicChatRecord[],
): ChatMessage[] {
  const latest = pickLatestJsonQuestionRow(rows);
  return buildTopicChatTimelineMessages(rows, latest);
}

/** 对齐 AiDrawerContent.getMsg：json 技能未完成则每秒轮询 topicChat */
export async function pollTopicChatUntilSettled(
  topicIdStr: string,
  options?: { timeoutMs?: number },
): Promise<ChatMessage[]> {
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const deadline = Date.now() + timeoutMs;

  const pollOnce = async (): Promise<ChatMessage[]> => {
    const res = await fetchAiTopicChatMessages({ topicId: topicIdStr });
    const flat = mapTopicChatRowsToChatMessages(res.data?.data ?? []);
    const lastJsonAssistant = [...flat]
      .reverse()
      .find(m => m.role === 'assistant' && m.dataType === 'json');
    const pending = lastJsonAssistant?.status === AI_HISTORY_STATUS.PENDING;
    if (!pending || Date.now() >= deadline) {
      return flat;
    }
    await sleep(1000);
    return pollOnce();
  };

  return pollOnce();
}

/** 获取对话历史记录 */
export const getChatHistory = (params: {
  accountId: number;
  productId: number;
}) =>
  request<{ data: ChatMessage[] }>({
    method: 'get',
    url: '/footprint3/accountEmission/aiModelChatHistory',
    params,
  });

/** 发送对话消息（非流式，用于操作类按钮触发） */
export const sendChatMessage = (data: {
  accountId: number;
  productId: number;
  content: string;
  fileUrls?: Array<{ name: string; url: string }>;
}) =>
  request<{ data: { content: string; contentType?: string } }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelChat',
    data,
  });

/** GET `/footprint3/accountEmission/aiProcess`，与核算详情 `getAiProcess` 一致 */
export const fetchAccountEmissionAiProcess = (params: {
  accountId: number | string;
}) =>
  request<{ code: number; msg?: string; data: number; lang?: unknown }>({
    method: 'get',
    url: '/footprint3/accountEmission/aiProcess',
    params: { accountId: Number(params.accountId) },
  });

/** 建模信息采集问题列表（POST `/accountEmission/aiModelQuestion`） */
export const fetchAiModelQuestions = (data: {
  accountId: string;
  /** 小碳会话 topicId */
  topicId?: string | number;
}) =>
  request<{ data: AiModelQuestionItem[] }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelQuestion',
    data: {
      accountId: data.accountId,
      ...(data.topicId != null && `${data.topicId}`.length > 0
        ? { topicId: String(data.topicId) }
        : {}),
    },
  });

/** 用户补充内容的意图分类：1 补充信息 2 建模 3 对话 */
export const fetchAiChatIntentType = (data: {
  accountId: string;
  content: string;
  /** 小碳会话 topicId */
  topicId?: string | number;
  /** 回形针附件，与 aiModelUpdate.fileUrl 结构一致 */
  fileUrl?: Array<{ name: string; url: string }>;
}) =>
  request<{ data: { type: string } }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiChatIntentType',
    data: {
      accountId: data.accountId,
      content: data.content,
      ...(data.topicId != null && `${data.topicId}`.length > 0
        ? { topicId: String(data.topicId) }
        : {}),
      ...(data.fileUrl != null && data.fileUrl.length > 0
        ? { fileUrl: data.fileUrl }
        : {}),
    },
  });

/** 携带问卷答案更新模型（评价请在成功后调用模型检查接口获取） */
export const updateModel = (data: {
  accountId: number | string;
  content: string;
  questionList: AiModelQuestionAnswerPayload[];
  /** 底部回形针通用附件（非菜单工作流）发送记录，更新模型时一并提交 */
  fileUrl?: Array<{ name: string; url: string }>;
  /** 小碳会话 topicId，与 aiChatIntentType / topicChat 一致 */
  topicId?: string | number;
}) =>
  request<{ data: { evaluation?: string } }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiModelUpdate',
    data: {
      accountId: String(data.accountId),
      content: data.content,
      questionList: data.questionList,
      ...(data.topicId != null && `${data.topicId}`.length > 0
        ? { topicId: String(data.topicId) }
        : {}),
      ...(data.fileUrl != null && data.fileUrl.length > 0
        ? { fileUrl: data.fileUrl }
        : {}),
    },
  });

/** 模型检查（获取 AI 评价列表 evaluateList 等）；AI 对话内调用传入当前会话 topicId */
export const fetchModelCheck = (params: {
  accountId: number;
  topicId?: number | string;
}) =>
  request<{ data: { evaluateList?: string[] } }>({
    method: 'get',
    url: '/footprint3/account/modelCheck',
    params: {
      accountId: params.accountId,
      ...(params.topicId != null &&
      `${params.topicId}`.length > 0 &&
      !Number.isNaN(Number(params.topicId))
        ? { topicId: params.topicId }
        : {}),
    },
  });

/** 上传文件 */
export const uploadChatFile = (formData: FormData) =>
  request<{ data: { name: string; url: string } }>({
    method: 'post',
    url: '/file/file/uploadFileAuth',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
