import type { SwitchoverCompanyData } from '@src/api/types';
import agentLogo from '@src/assets/images/carbonAgent/icons/agent-text.svg';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import {
  FEISHU_CALLBACK,
  FEISHU_ENTRY,
  isFeishuSession,
  markFeishuReady,
  suspendFeishuSession,
  takeFeishuReady,
} from '@src/utils/feishuSession';
import { Button, Result } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';

import style from './index.module.less';

const AUTH_STATE = 'agent:feishu:oauth-state';
const AUTH_VERIFIER = 'agent:feishu:oauth-verifier';
const RETURN_PATH = 'agent:feishu:return-path';
const callback = window.location.pathname === FEISHU_CALLBACK;
const params = new URLSearchParams(window.location.search);
const authorizationCode = callback ? params.get('code') : null;
const authorizationState = callback ? params.get('state') : null;
const stopped = params.has('stopped');
// 在统计、错误上报和业务组件挂载之前移除一次性授权码。
if (callback) {
  window.history.replaceState(window.history.state, '', FEISHU_CALLBACK);
}
const enabled = isFeishuSession();
const bootReady =
  enabled &&
  !callback &&
  window.location.pathname !== FEISHU_ENTRY &&
  takeFeishuReady();
const english =
  /^\/en(?:\/|$)/.test(window.location.pathname) ||
  document.documentElement.lang === 'en';
const text = english
  ? {
      loading: 'Signing in with Feishu…',
      failed: 'Feishu sign-in was not completed',
      failedHint:
        'Please retry. If the problem persists, contact the administrator.',
      stopped: 'Please sign in again to continue',
      retry: 'Sign in with Feishu',
    }
  : {
      loading: '正在通过飞书登录…',
      failed: '飞书登录未完成',
      failedHint: '请重新登录；若仍未成功，请联系管理员检查应用配置。',
      stopped: '请重新登录后继续使用',
      retry: '通过飞书重新登录',
    };

/** 沿用项目 API 环境配置；仅本地开发代理会将地址替换成 /api，不携带旧 Token 或 Cookie。 */
async function authPost<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 45000);
  try {
    const apiBase = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
    const response = await fetch(`${apiBase}/auth/agent/feishu/${path}`, {
      method: 'POST',
      credentials: 'omit',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const result = await response.json();
    if (!response.ok || result.code !== 200 || !result.data) {
      throw new Error('FEISHU_LOGIN_FAILED');
    }
    return result.data as T;
  } finally {
    window.clearTimeout(timeout);
  }
}

/** 256 位随机原文只保存在当前标签页；发起授权提交摘要，回调兑换时再提交原文。 */
async function createBrowserBinding() {
  const encode = (bytes: Uint8Array) =>
    btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  const verifier = encode(window.crypto.getRandomValues(new Uint8Array(32)));
  const digest = await window.crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(verifier),
  );
  return { verifier, challenge: encode(new Uint8Array(digest)) };
}

function previousSession(): Partial<SwitchoverCompanyData> {
  try {
    return JSON.parse(sessionStorage.getItem(SET_COMPANY_USER_INFO) || '{}');
  } catch {
    return {};
  }
}

/** 只返回本站 Agent 页面；不接收外部 returnUrl，防止开放重定向。 */
function returnPath() {
  const saved = sessionStorage.getItem(RETURN_PATH) || '';
  return /^\/(?:en\/|zh\/|zt\/)?system\/carbonAgent(?:[?#]|$)/.test(saved)
    ? saved
    : '/system/carbonAgent';
}

async function authorize(interactive: boolean) {
  suspendFeishuSession();
  // 每次重试建立新的授权绑定，不复用失败流程的 state 或校验值。
  sessionStorage.removeItem(AUTH_STATE);
  sessionStorage.removeItem(AUTH_VERIFIER);
  const binding = await createBrowserBinding();
  const current = window.location.pathname;
  if (/^\/(?:en\/|zh\/|zt\/)?system\/carbonAgent$/.test(current)) {
    sessionStorage.setItem(
      RETURN_PATH,
      `${current}${window.location.search}${window.location.hash}`,
    );
  }
  // 恢复页面经过无语言前缀的 entry，沿用目标页语言，避免语言同步触发重复登录。
  const lang = /^\/(en|zt|zh)(?:\/|$)/.exec(returnPath())?.[1] || 'zh';
  const { authorizeUrl } = await authPost<{ authorizeUrl: string }>(
    'authorize',
    {
      clientType: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
        ? 'AGENT_FEISHU_H5'
        : 'AGENT_FEISHU_WEB',
      lang,
      interactive,
      browserChallenge: binding.challenge,
    },
  );
  const url = new URL(authorizeUrl);
  if (
    url.origin !== 'https://accounts.feishu.cn' ||
    !url.searchParams.get('state')
  ) {
    throw new Error('FEISHU_AUTHORIZE_URL_INVALID');
  }
  sessionStorage.setItem(AUTH_STATE, url.searchParams.get('state') || '');
  sessionStorage.setItem(AUTH_VERIFIER, binding.verifier);
  window.location.replace(authorizeUrl);
}

async function exchange() {
  const browserVerifier = sessionStorage.getItem(AUTH_VERIFIER) || '';
  if (
    !authorizationCode ||
    !authorizationState ||
    authorizationState !== sessionStorage.getItem(AUTH_STATE) ||
    !/^[A-Za-z0-9_-]{43}$/.test(browserVerifier)
  ) {
    throw new Error('FEISHU_CALLBACK_INVALID');
  }
  sessionStorage.removeItem(AUTH_STATE);
  sessionStorage.removeItem(AUTH_VERIFIER);
  const previous = previousSession();
  const result = await authPost<SwitchoverCompanyData>('login', {
    code: authorizationCode,
    state: authorizationState,
    browserVerifier,
    previousToken: previous.access_token || '',
  });
  if (!result.access_token) throw new Error('FEISHU_SESSION_MISSING');
  if (
    previous.userInfo?.userId &&
    previous.userInfo.userId !== result.userInfo?.userId
  ) {
    // 新身份进入空白首页，不继承上一账号地址中的会话/项目参数。
    sessionStorage.setItem(RETURN_PATH, returnPath().split(/[?#]/)[0]);
  }
  // 整份替换并重新载入应用，避免账号切换时保留前一账号的 Redux/查询缓存。
  sessionStorage.setItem(SET_COMPANY_USER_INFO, JSON.stringify(result));
  sessionStorage.removeItem('productId');
  sessionStorage.removeItem('nav');
  markFeishuReady();
  // 保留明确的飞书页面来源；普通官网链接不带此标记，不继承 WebView 的旧登录渠道。
  const destination = new URL(returnPath(), window.location.origin);
  destination.searchParams.set('agentChannel', 'feishu');
  window.location.replace(
    `${destination.pathname}${destination.search}${destination.hash}`,
  );
}

// React 重复挂载也只消费一次授权码；失败必须显式重新发起授权。
let initialFlow: Promise<void> | undefined;

/** 首次载入在业务 Provider 外核验身份；同一页面切换前后台保留已验证会话。 */
export default function FeishuLoginGate({
  children,
}: {
  children: ReactElement;
}) {
  const ready = !enabled || bootReady;
  const [failed, setFailed] = useState(stopped);

  useEffect(() => {
    if (!enabled) return undefined;
    const startWhenVisible = () => {
      if (!ready && !stopped && document.visibilityState === 'visible') {
        // 首次在后台打开时延后到可见再授权；同一已登录页面返回前台不重新开户或重载。
        // visibilitychange 只表示可见性，不能将切去消息页等普通操作当作身份变化。
        if (!initialFlow)
          initialFlow = callback ? exchange() : authorize(false);
        initialFlow.catch(() => setFailed(true));
      }
    };
    startWhenVisible();
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted && !stopped) window.location.replace(FEISHU_ENTRY);
    };
    document.addEventListener('visibilitychange', startWhenVisible);
    window.addEventListener('pageshow', restore);
    return () => {
      document.removeEventListener('visibilitychange', startWhenVisible);
      window.removeEventListener('pageshow', restore);
    };
  }, [ready]);

  if (ready) return children;
  const retry = () => {
    setFailed(false);
    authorize(true).catch(() => setFailed(true));
  };
  return (
    <main className={style.page}>
      <section className={style.content} aria-live='polite'>
        {failed ? (
          <Result
            status='warning'
            title={stopped ? text.stopped : text.failed}
            subTitle={text.failedHint}
            extra={
              <Button type='primary' onClick={retry}>
                {text.retry}
              </Button>
            }
          />
        ) : (
          <div className={style.loading} role='status'>
            {/* 与 Agent 首页共用品牌资产；身份确认前不展示上一账号的业务内容。 */}
            <img className={style.logo} src={agentLogo} alt='Carbon Agent' />
            <p className={style.status}>
              <span className={style.spinner} aria-hidden='true' />
              {text.loading}
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
