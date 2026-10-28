import { useCallback, useEffect, useRef, useState } from 'react';

import { getAgentBrowserId } from '../acquisition';
import { getAnonymousConversationRestore } from '../anonymousSessionState';
import type { AnonymousConversationRestore } from '../anonymousSessionState';
import {
  bindAnonymousAgentSession,
  cancelAnonymousAgentSession,
  fetchAnonymousAgentEligibility,
  fetchAnonymousAgentSession,
  sendAnonymousAgentChatMessage,
  uploadAnonymousAgentAttachment,
} from '../service';
import type {
  AgentAnonymousSession,
  AgentAnonymousEligibility,
  AgentChatAttachment,
  AgentFinalResponse,
  AgentLoginRequiredPayload,
  AgentMessageCard,
  AgentMessageDelta,
  AgentMessageResumeState,
  AgentToolCall,
} from '../service';

type AnonymousAgentStreamHandlers = {
  onCard?: (card: AgentMessageCard) => void;
  onDelta?: (delta: AgentMessageDelta) => void;
  onFinalResponse?: (response: AgentFinalResponse) => void;
  onLoadingEnd?: () => void;
  onLoginRequired?: (payload: AgentLoginRequiredPayload) => void;
  onResumeState?: (state: AgentMessageResumeState) => void;
  onToolCall?: (toolCall: AgentToolCall) => void;
};

type SubmitAnonymousAgentMessageParams = AnonymousAgentStreamHandlers & {
  abortCtrl: AbortController;
  lang: string;
  message: string;
  requestPayload?: Record<string, unknown>;
};

type UseAnonymousAgentExperienceOptions = {
  authenticated: boolean;
  enabled: boolean;
  lang: string;
};

const mergeAnonymousSession = (
  current: AgentAnonymousSession | null,
  patch: Partial<AgentAnonymousSession>,
): AgentAnonymousSession => ({
  ...(current || {}),
  ...patch,
});

const useAnonymousAgentExperience = ({
  authenticated,
  enabled,
  lang: eligibilityLang,
}: UseAnonymousAgentExperienceOptions) => {
  const [browserId] = useState(() => (enabled ? getAgentBrowserId() : ''));
  const [session, setSession] = useState<AgentAnonymousSession | null>(null);
  const [restoredConversation, setRestoredConversation] =
    useState<AnonymousConversationRestore>();
  const [eligibility, setEligibility] = useState<AgentAnonymousEligibility>();
  const [eligibilityChecking, setEligibilityChecking] = useState(enabled);
  const sessionRef = useRef<AgentAnonymousSession | null>(null);
  // Prevent a late initial query from overwriting a turn started by the user.
  const locallyStartedRef = useRef(false);
  // Cancellation must synchronously read IDs emitted by message_start.
  const activeMessageRef = useRef<AgentMessageResumeState | null>(null);

  const replaceSession = useCallback(
    (nextSession: AgentAnonymousSession | null) => {
      sessionRef.current = nextSession;
      setSession(nextSession);
    },
    [],
  );

  const patchSession = useCallback(
    (patch: Partial<AgentAnonymousSession>) => {
      replaceSession(mergeAnonymousSession(sessionRef.current, patch));
    },
    [replaceSession],
  );

  useEffect(() => {
    if (!enabled || authenticated || !browserId) {
      setEligibilityChecking(false);
      return undefined;
    }

    let cancelled = false;
    const abortController = new AbortController();

    locallyStartedRef.current = false;
    activeMessageRef.current = null;

    setEligibilityChecking(true);
    Promise.all([
      fetchAnonymousAgentEligibility(
        browserId,
        eligibilityLang,
        abortController.signal,
      ),
      fetchAnonymousAgentSession(browserId, abortController.signal),
    ])
      .then(([nextEligibility, nextSession]) => {
        if (cancelled || locallyStartedRef.current) {
          return;
        }

        setEligibility(
          nextEligibility || {
            allowed: false,
            loginRequired: true,
            reasonCode: 'ANONYMOUS_ELIGIBILITY_INVALID',
            state: 'LOGIN_REQUIRED',
          },
        );
        replaceSession(nextSession || null);
        setRestoredConversation(getAnonymousConversationRestore(nextSession));
      })
      .catch(() => {
        if (!cancelled) {
          setEligibility({
            allowed: false,
            loginRequired: true,
            reasonCode: 'ANONYMOUS_ELIGIBILITY_FAILED',
            state: 'LOGIN_REQUIRED',
          });
          replaceSession(null);
          setRestoredConversation(undefined);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setEligibilityChecking(false);
        }
      });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [authenticated, browserId, eligibilityLang, enabled, replaceSession]);

  const submitMessage = useCallback(
    async ({
      abortCtrl,
      lang,
      message,
      onCard,
      onDelta,
      onFinalResponse,
      onLoadingEnd,
      onLoginRequired,
      onResumeState,
      onToolCall,
      requestPayload,
    }: SubmitAnonymousAgentMessageParams) => {
      if (!eligibility?.allowed) {
        onLoginRequired?.({
          message: eligibility?.message || undefined,
          reasonCode: eligibility?.reasonCode || undefined,
        });
        return undefined;
      }
      locallyStartedRef.current = true;
      activeMessageRef.current = null;
      patchSession({ consumed: true, question: message, status: 'RUNNING' });

      try {
        const finalResponse = await sendAnonymousAgentChatMessage({
          abortCtrl,
          browserId,
          lang,
          message,
          requestPayload,
          onCard,
          onDelta,
          onFinalResponse,
          onLoadingEnd,
          onLoginRequired,
          onResumeState: state => {
            activeMessageRef.current = state;
            patchSession({
              consumed: true,
              messageId: state.messageId,
              sessionId: state.sessionId,
              status: 'RUNNING',
            });
            onResumeState?.(state);
          },
          onToolCall,
        });

        patchSession({
          answer:
            finalResponse?.reply ||
            finalResponse?.content ||
            sessionRef.current?.answer,
          consumed: true,
          messageId: finalResponse?.messageId || sessionRef.current?.messageId,
          question: message,
          sessionId: finalResponse?.sessionId || sessionRef.current?.sessionId,
          status: 'COMPLETED',
        });

        return finalResponse;
      } catch (error) {
        patchSession({
          consumed: true,
          question: message,
          status: 'COMPLETED',
        });
        throw error;
      }
    },
    [browserId, eligibility, patchSession],
  );

  const cancelCurrentMessage = useCallback(async () => {
    if (!locallyStartedRef.current) {
      return;
    }

    let activeMessage = activeMessageRef.current;

    if (!activeMessage?.sessionId || !activeMessage.messageId) {
      let currentSession = sessionRef.current;
      let sessionId = String(currentSession?.sessionId || '').trim();
      let messageId = String(currentSession?.messageId || '').trim();

      if (!sessionId || !messageId) {
        currentSession = await fetchAnonymousAgentSession(browserId);
        sessionId = String(currentSession?.sessionId || '').trim();
        messageId = String(currentSession?.messageId || '').trim();
      }

      if (!sessionId || !messageId) {
        return;
      }

      activeMessage = { lastEventId: 0, messageId, sessionId };
    }

    activeMessageRef.current = null;
    await cancelAnonymousAgentSession({
      browserId,
      messageId: activeMessage.messageId,
      sessionId: activeMessage.sessionId,
    });
  }, [browserId]);

  const bindSession = useCallback(async () => {
    await bindAnonymousAgentSession(browserId);
    return sessionRef.current?.sessionId || '';
  }, [browserId]);

  const uploadAttachment = useCallback(
    (file: File): Promise<AgentChatAttachment> =>
      uploadAnonymousAgentAttachment(browserId, file),
    [browserId],
  );

  const isLocallyStarted = useCallback(() => locallyStartedRef.current, []);

  return {
    bindSession,
    allowed: authenticated || eligibility?.allowed === true,
    cancelCurrentMessage,
    consumed:
      !authenticated &&
      (Boolean(session?.consumed) || eligibility?.loginRequired === true),
    eligibilityChecking,
    isLocallyStarted,
    loginRequired: !authenticated && eligibility?.loginRequired === true,
    restoredConversation,
    submitMessage,
    uploadAttachment,
  };
};

export default useAnonymousAgentExperience;
