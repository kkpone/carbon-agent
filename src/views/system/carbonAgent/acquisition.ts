import { getToken } from '@src/utils/cookie';

export type AgentLoginTriggerEntry =
  | 'composer_input'
  | 'send'
  | 'file_upload'
  | 'sidebar'
  | 'project_entry'
  | 'personal_settings'
  | 'menu'
  | 'other';

export type AgentAuthMethod =
  | 'phone_otp'
  | 'email_otp'
  | 'password'
  | 'wechat_qr';

type ChannelState = {
  token: string;
  capturedAt: number;
};

type AgentClientEventName =
  | 'ca_page_view'
  | 'ca_login_gate_click'
  | 'ca_auth_modal_view'
  | 'ca_auth_submit';

type AgentTrackingEvent = {
  agentChannel?: string;
  authMethod?: AgentAuthMethod;
  browserId: string;
  eventName: AgentClientEventName;
  eventUuid: string;
  occurredAt: string;
  triggerEntry?: AgentLoginTriggerEntry;
};

type QueuedAgentEvent = {
  /** 记录事件发生时的登录态，避免重试时被当前账号错误归属。 */
  authorization: string;
  event: AgentTrackingEvent;
};

const BROWSER_ID_KEY = 'carbon_agent_browser_id';
const CHANNEL_STATE_KEY = 'carbon_agent_channel';
const EVENT_QUEUE_KEY = 'carbon_agent_event_queue';
const TRACKING_PATH = '/management/agent/tracking/events';
const BROWSER_COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const CHANNEL_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const MAX_EVENT_QUEUE_SIZE = 50;

let memoryBrowserId = '';
let flushInFlight: Promise<void> | null = null;

const safeStorage = (storage: Storage, key: string) => {
  try {
    return storage.getItem(key) || '';
  } catch {
    return '';
  }
};

const setStorage = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch {
    // Safari 无痕模式等场景退化为内存标识，不阻塞 Agent 使用。
  }
};

const removeStorage = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
};

const randomId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  const suffix = Math.random().toString(36).slice(2);
  return `${Date.now().toString(36)}_${suffix}_${Math.random()
    .toString(36)
    .slice(2)}`;
};

const validId = (value: string) => /^[A-Za-z0-9_-]{8,64}$/.test(value);

const syncBrowserCookie = (browserId: string) => {
  try {
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${BROWSER_ID_KEY}=${encodeURIComponent(
      browserId,
    )}; Max-Age=${BROWSER_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  } catch {
    // Cookie 被浏览器策略禁用时继续使用 localStorage 或内存标识，不影响 Agent 主流程。
  }
};

export const getAgentBrowserId = () => {
  const stored = safeStorage(window.localStorage, BROWSER_ID_KEY);
  if (validId(stored)) {
    memoryBrowserId = stored;
    syncBrowserCookie(stored);
    return stored;
  }
  if (!validId(memoryBrowserId)) {
    memoryBrowserId = randomId();
  }
  setStorage(window.localStorage, BROWSER_ID_KEY, memoryBrowserId);
  syncBrowserCookie(memoryBrowserId);
  return memoryBrowserId;
};

const normalizeChannel = (value: string | null) => {
  const token = value?.trim() || '';
  return /^[A-Za-z0-9_-]{1,128}$/.test(token) ? token : '';
};

export const getAgentChannel = () => {
  const queryToken = normalizeChannel(
    new URLSearchParams(window.location.search).get('agentChannel'),
  );
  if (queryToken) {
    const state: ChannelState = { token: queryToken, capturedAt: Date.now() };
    setStorage(window.localStorage, CHANNEL_STATE_KEY, JSON.stringify(state));
    return queryToken;
  }
  const stored = safeStorage(window.localStorage, CHANNEL_STATE_KEY);
  try {
    const state = JSON.parse(stored) as ChannelState;
    if (
      normalizeChannel(state.token) &&
      Date.now() - Number(state.capturedAt || 0) <= CHANNEL_MAX_AGE
    ) {
      return state.token;
    }
  } catch {
    // ignore invalid historical state
  }
  removeStorage(window.localStorage, CHANNEL_STATE_KEY);
  return undefined;
};

const formatLocalDateTime = (date: Date) => {
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
};

const getTrackingUrl = () => {
  const baseUrl = (process.env.REACT_APP_API_URL || '').replace(/\/+$/, '');
  return `${baseUrl}${TRACKING_PATH}`;
};

const readEventQueue = (): QueuedAgentEvent[] => {
  const stored = safeStorage(window.sessionStorage, EVENT_QUEUE_KEY);
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as QueuedAgentEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(item => validId(item?.event?.eventUuid || ''))
      .slice(-MAX_EVENT_QUEUE_SIZE);
  } catch {
    removeStorage(window.sessionStorage, EVENT_QUEUE_KEY);
    return [];
  }
};

const writeEventQueue = (queue: QueuedAgentEvent[]) => {
  const limited = queue.slice(-MAX_EVENT_QUEUE_SIZE);
  if (!limited.length) {
    removeStorage(window.sessionStorage, EVENT_QUEUE_KEY);
    return;
  }
  setStorage(window.sessionStorage, EVENT_QUEUE_KEY, JSON.stringify(limited));
};

const enqueueEvent = (event: AgentTrackingEvent) => {
  const queue = readEventQueue().filter(
    item => item.event.eventUuid !== event.eventUuid,
  );
  queue.push({ authorization: `${getToken() || ''}`, event });
  writeEventQueue(queue);
};

const trackingHeaders = (authorization: string) => ({
  ...(authorization ? { Authorization: authorization } : {}),
  'Content-Type': 'application/json',
});

const sendEventBatch = async (batch: QueuedAgentEvent[], keepalive = false) => {
  const authorization = batch[0]?.authorization || '';
  const response = await window.fetch(getTrackingUrl(), {
    body: JSON.stringify({ events: batch.map(item => item.event) }),
    headers: trackingHeaders(authorization),
    keepalive,
    method: 'POST',
  });
  const result = (await response.json().catch(() => null)) as {
    code?: number;
  } | null;
  if (
    !response.ok ||
    (typeof result?.code === 'number' && result.code !== 200)
  ) {
    throw new Error('AGENT_TRACKING_FAILED');
  }
};

const flushEventQueue = () => {
  if (flushInFlight) return flushInFlight;

  const queue = readEventQueue();
  if (!queue.length) return Promise.resolve();

  const grouped = new Map<string, QueuedAgentEvent[]>();
  queue.forEach(item => {
    const batch = grouped.get(item.authorization) || [];
    batch.push(item);
    grouped.set(item.authorization, batch);
  });
  const batches = Array.from(grouped.values());
  const attemptedKeys = new Set(
    queue.map(item => `${item.authorization}\u0000${item.event.eventUuid}`),
  );

  flushInFlight = Promise.all(
    batches.map(batch =>
      sendEventBatch(batch)
        .then(() => true)
        .catch(() => false),
    ),
  )
    .then(results => {
      const sentKeys = new Set<string>();
      results.forEach((sent, index) => {
        if (sent) {
          batches[index].forEach(item => {
            sentKeys.add(`${item.authorization}\u0000${item.event.eventUuid}`);
          });
        }
      });
      if (sentKeys.size) {
        writeEventQueue(
          readEventQueue().filter(
            item =>
              !sentKeys.has(
                `${item.authorization}\u0000${item.event.eventUuid}`,
              ),
          ),
        );
      }
    })
    .finally(() => {
      flushInFlight = null;
      const hasUnattemptedEvent = readEventQueue().some(
        item =>
          !attemptedKeys.has(
            `${item.authorization}\u0000${item.event.eventUuid}`,
          ),
      );
      if (hasUnattemptedEvent) {
        window.setTimeout(() => {
          flushEventQueue();
        }, 0);
      }
    });

  return flushInFlight;
};

const flushEventQueueOnPageHide = () => {
  try {
    const queue = readEventQueue();
    if (!queue.length) return;

    const grouped = new Map<string, QueuedAgentEvent[]>();
    queue.forEach(item => {
      const batch = grouped.get(item.authorization) || [];
      batch.push(item);
      grouped.set(item.authorization, batch);
    });

    grouped.forEach((batch, authorization) => {
      const limited = batch.slice(0, MAX_EVENT_QUEUE_SIZE);
      const payload = JSON.stringify({
        events: limited.map(item => item.event),
      });
      if (!authorization && navigator.sendBeacon) {
        const queued = navigator.sendBeacon(
          getTrackingUrl(),
          new Blob([payload], { type: 'application/json' }),
        );
        if (queued) return;
      }
      sendEventBatch(limited, true).catch(() => undefined);
    });
  } catch {
    // 页面退出时的埋点异常必须静默降级。
  }
};

type AcquisitionWindow = typeof window & {
  carbonAgentTrackingListenersBound?: boolean;
};

const acquisitionWindow = window as AcquisitionWindow;
if (!acquisitionWindow.carbonAgentTrackingListenersBound) {
  acquisitionWindow.carbonAgentTrackingListenersBound = true;
  window.addEventListener('online', () => {
    flushEventQueue();
  });
  window.addEventListener('pagehide', flushEventQueueOnPageHide);
}
window.setTimeout(() => {
  try {
    flushEventQueue();
  } catch {
    // 历史队列恢复失败不得影响页面初始化。
  }
}, 0);

const report = (
  eventName: AgentClientEventName,
  options: {
    authMethod?: AgentAuthMethod;
    triggerEntry?: AgentLoginTriggerEntry;
  } = {},
) => {
  try {
    const event: AgentTrackingEvent = {
      agentChannel: getAgentChannel(),
      authMethod: options.authMethod,
      browserId: getAgentBrowserId(),
      eventName,
      eventUuid: randomId(),
      occurredAt: formatLocalDateTime(new Date()),
      triggerEntry: options.triggerEntry,
    };

    enqueueEvent(event);
    flushEventQueue();
  } catch {
    // 埋点失败只丢弃本次事件，不能阻断登录、注册或 Agent 业务操作。
  }
};

export const trackAgentPageView = () => {
  report('ca_page_view');
};

export const trackAgentLoginGateClick = (
  triggerEntry: AgentLoginTriggerEntry,
) => {
  report('ca_login_gate_click', { triggerEntry });
};

export const trackAgentAuthModalView = (triggerEntry: AgentLoginTriggerEntry) =>
  report('ca_auth_modal_view', { triggerEntry });

export const trackAgentAuthSubmit = (
  authMethod: AgentAuthMethod,
  triggerEntry: AgentLoginTriggerEntry,
) => report('ca_auth_submit', { authMethod, triggerEntry });

export const getAgentAcquisitionContext = () => ({
  agentChannel: getAgentChannel(),
  browserId: getAgentBrowserId(),
});
