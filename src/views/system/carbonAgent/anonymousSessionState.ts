import type {
  AgentAnonymousSession,
  AgentFinalResponse,
  AgentMessageBlock,
  AgentMessageCard,
} from './service';
import type { AgentConversation } from './constants';
import {
  normalizeFinalBlocks,
  normalizeFinalCards,
} from './agentFinalResponseState';
import { mergeAgentAnswerCards } from './answerCardState';

export type AnonymousConversationRestore = {
  answerBlocks: AgentMessageBlock[];
  answerCards: AgentMessageCard[];
  historyConversation?: AgentConversation;
  question: string;
  questionTime: string;
  response?: AgentFinalResponse;
  sessionId: string;
  status?: string;
  title: string;
};

const getTrimmedString = (value?: string | null) => value?.trim() || '';

const formatHistoryTime = (value?: string | null) =>
  getTrimmedString(value).split(/[ T]/)[0] || '';

export const createAnonymousHistoryConversation = ({
  sessionId,
  status,
  time,
  title,
}: {
  sessionId?: string;
  status?: string;
  time?: string;
  title: string;
}): AgentConversation | undefined => {
  const normalizedSessionId = getTrimmedString(sessionId);

  return normalizedSessionId
    ? {
        id: normalizedSessionId,
        projectId: null,
        sessionId: normalizedSessionId,
        status,
        time: formatHistoryTime(time),
        title,
      }
    : undefined;
};

export const getAnonymousConversationRestore = (
  session?: AgentAnonymousSession,
): AnonymousConversationRestore | undefined => {
  const question = getTrimmedString(session?.question);

  if (!question) {
    return undefined;
  }

  const answer = getTrimmedString(session?.answer);
  const messageId = session?.messageId || session?.sessionId || 'anonymous';
  const response = session?.response
    ? {
        ...session.response,
        messageId: session.response.messageId || session.messageId,
        sessionId: session.response.sessionId || session.sessionId,
      }
    : undefined;
  const title = getTrimmedString(response?.sessionTitle) || question;
  const responseBlocks = response ? normalizeFinalBlocks(response) : [];
  const responseCards = response ? normalizeFinalCards(response) : [];
  const fallbackAnswerBlocks: AgentMessageBlock[] = answer
    ? [
        {
          blockId: 'anonymous_answer',
          blockType: 'markdown',
          content: answer,
          messageId,
          orderNo: 10,
        },
      ]
    : [];

  return {
    answerBlocks: responseBlocks.length ? responseBlocks : fallbackAnswerBlocks,
    answerCards: mergeAgentAnswerCards([], responseCards),
    historyConversation: createAnonymousHistoryConversation({
      sessionId: session?.sessionId,
      status: session?.status,
      time: session?.updateTime || session?.createTime,
      title,
    }),
    question,
    questionTime: session?.createTime || session?.updateTime || '',
    response,
    sessionId: session?.sessionId || '',
    status: session?.status,
    title,
  };
};
