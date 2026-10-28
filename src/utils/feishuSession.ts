import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';

/** 飞书凭证只存在当前 WebView/标签页，官网继续使用原 localStorage。 */
const SOURCE_KEY = 'agent:feishu:source';
const READY_KEY = 'agent:feishu:ready';
const RETRY_KEY = 'agent:feishu:retry';
export const FEISHU_ENTRY = '/agent/feishu/entry';
export const FEISHU_CALLBACK = '/agent/feishu/callback';
const pathname = window.location.pathname.replace(/^\/(zh|en|zt)(?=\/)/, '');
const isEntry = pathname === FEISHU_ENTRY;
const isCallback = pathname === FEISHU_CALLBACK;
// 浏览器类型不能代表登录入口；仅专用入口建立上下文，回调继续校验一次性授权。
const continuesFeishuSession =
  sessionStorage.getItem(SOURCE_KEY) === '1' &&
  new URLSearchParams(window.location.search).get('agentChannel') === 'feishu';
if (isEntry) {
  sessionStorage.setItem(SOURCE_KEY, '1');
} else if (!isCallback && !continuesFeishuSession) {
  // 普通链接可能复用 WebView，清理旧流程标记，但不删除或覆盖任何渠道的 Token。
  [
    SOURCE_KEY,
    READY_KEY,
    RETRY_KEY,
    'agent:feishu:oauth-state',
    'agent:feishu:oauth-verifier',
    'agent:feishu:return-path',
  ].forEach(key => sessionStorage.removeItem(key));
}

// 无上下文的回调也交给登录页报错，不能落入官网业务页面或自动发起授权。
export const isFeishuSession = () =>
  isCallback || sessionStorage.getItem(SOURCE_KEY) === '1';

/** 所有直接读写登录信息的位置都使用同一个存储选择，避免读入官网账号。 */
export const getLoginStorage = () =>
  isFeishuSession() ? sessionStorage : localStorage;

let verified = false;
export const isFeishuVerified = () => !isFeishuSession() || verified;

/** 回调完成后的内部跳转只放行一次；刷新或重新打开仍核验飞书当前身份。 */
export const takeFeishuReady = () => {
  const value = Number(sessionStorage.getItem(READY_KEY));
  sessionStorage.removeItem(READY_KEY);
  verified = value > Date.now();
  return verified;
};

export const markFeishuReady = () => {
  sessionStorage.setItem(READY_KEY, String(Date.now() + 15000));
};

export const suspendFeishuSession = () => {
  verified = false;
};

/** 失效后最多自动恢复一次；被挤出、禁用及主动退出均等待用户明确重试。 */
export const handleFeishuAuthFailure = (code: number) => {
  if (!isFeishuSession() || ![401, 403, 406, 407, 408, 410].includes(code)) {
    return false;
  }
  if (window.location.pathname.includes('/agent/feishu/')) return true;
  suspendFeishuSession();
  const lastRetry = Number(sessionStorage.getItem(RETRY_KEY));
  if (code === 401 && Date.now() - lastRetry > 60000) {
    sessionStorage.setItem(RETRY_KEY, String(Date.now()));
    window.location.replace(FEISHU_ENTRY);
  } else {
    window.location.replace(`${FEISHU_ENTRY}?stopped=1`);
  }
  return true;
};

export const clearFeishuSession = () => {
  suspendFeishuSession();
  sessionStorage.removeItem(SET_COMPANY_USER_INFO);
  sessionStorage.removeItem(READY_KEY);
  window.location.replace(`${FEISHU_ENTRY}?stopped=1`);
};
