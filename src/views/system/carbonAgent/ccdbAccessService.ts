import { request } from '@api/request';
import I18N from '@src/lang/I18N';
import { getLocaleCodeFromPathname } from '@src/router/localePath';

type ApiEnvelope<T> = {
  code: number;
  data: T;
  msg?: string;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => response.data.data;

export type CcdbApiKey = {
  apiKeyMasked?: string;
  createTime?: string | null;
  dayCallUsedCcdb?: number | null;
  expireAt?: string | null;
  id: number;
  keyId: string;
  keyType?: string | null;
  lastUsedAt?: string | null;
  name: string;
  purpose?: string | null;
  rateLimitDayCcdb?: number | null;
  rateLimitQps?: number | null;
  status: number;
  totalCall?: number | null;
};

export type CcdbApiKeySecret = {
  apiKey: string;
  id: number;
  keyId: string;
  keyType?: string | null;
  name: string;
  purpose?: string | null;
};

export type CreateCcdbApiKeyPayload = {
  name: string;
  purpose: string;
};

export const fetchCcdbApiKeys = (signal?: AbortSignal) =>
  request<ApiEnvelope<CcdbApiKey[]>>({
    method: 'GET',
    params: { keyType: 'CCDB_AGENT' },
    signal,
    url: '/management/sysApiKey/list',
  }).then(unwrap);

export const createCcdbApiKey = (payload: CreateCcdbApiKeyPayload) =>
  request<ApiEnvelope<CcdbApiKeySecret>>({
    data: payload,
    method: 'POST',
    url: '/management/sysApiKey/ccdb/create',
  }).then(unwrap);

export const changeCcdbApiKeyStatus = (id: number, status: number) =>
  request<ApiEnvelope<void>>({
    method: 'POST',
    params: { id, status },
    url: '/management/sysApiKey/status',
  });

export const rotateCcdbApiKey = (id: number) =>
  request<ApiEnvelope<CcdbApiKeySecret>>({
    method: 'POST',
    params: { id },
    url: '/management/sysApiKey/rotate',
  }).then(unwrap);

export const revealCcdbApiKey = (id: number) =>
  request<ApiEnvelope<CcdbApiKeySecret>>({
    method: 'GET',
    params: { id },
    url: '/management/sysApiKey/reveal',
  }).then(unwrap);

export const revokeCcdbApiKey = (id: number) =>
  request<ApiEnvelope<void>>({
    method: 'POST',
    params: { id },
    url: '/management/sysApiKey/revoke',
  });

export type CcdbOAuthScope = {
  code: string;
  description: string;
  name: string;
};

// Protocol scope codes remain unchanged; only their display copy is localized.
const localizeAuthorizeContext = <T extends CcdbOAuthAuthorizeContext>(
  context: T,
): T => {
  const scopeCopy: Record<string, [string, string]> = {
    'ccdb.factor.search': [
      I18N.ccdb.searchFactors,
      I18N.ccdb.searchScopeDescription,
    ],
    'ccdb.factor.read': [I18N.ccdb.readFactor, I18N.ccdb.readScopeDescription],
    offline_access: [
      I18N.ccdb.stayConnected,
      I18N.ccdb.offlineScopeDescription,
    ],
  };
  const knownPrivacy = [
    '该应用无法读取你的对话记录、组织数据或 API Key。你可随时在“授权管理”中撤销访问。',
    '该应用不能读取你的对话记录、组织数据或 API Key。',
    '该应用不能读取你的对话记录、组织数据或 API Key',
  ];
  return {
    ...context,
    privacyNotice:
      !context.privacyNotice || knownPrivacy.includes(context.privacyNotice)
        ? I18N.ccdb.privacyNotice
        : context.privacyNotice,
    scopes: context.scopes.map(scope => {
      const copy = scopeCopy[scope.code];
      return copy ? { ...scope, name: copy[0], description: copy[1] } : scope;
    }),
  };
};

export const ccdbProtocolErrorMessage = (
  protocol: { error?: string; error_description?: string },
  fallback: string,
) => {
  const description = protocol.error_description;
  // Keep server detail in its own language, but do not leak hard-coded Chinese into English/TW UI.
  if (getLocaleCodeFromPathname() === 'zh') return description || fallback;
  return description && !/[\u3400-\u9fff]/.test(description)
    ? description
    : `${fallback}${protocol.error ? ` (${protocol.error})` : ''}`;
};

export type CcdbOAuthGrant = {
  authMethod?: string | null;
  channelType?: string | null;
  clientDescription?: string | null;
  clientId: string;
  clientName: string;
  grantId: string;
  grantedAt?: string | null;
  lastUsedAt?: string | null;
  logoUrl?: string | null;
  revokedAt?: string | null;
  scopes?: string[] | string | null;
  status: string;
};

export const fetchCcdbOAuthGrants = (signal?: AbortSignal) =>
  request<ApiEnvelope<CcdbOAuthGrant[]>>({
    method: 'GET',
    signal,
    url: '/management/ccdb/oauth/grants',
  }).then(unwrap);

export const revokeCcdbOAuthGrant = (grantId: string) =>
  request<ApiEnvelope<void>>({
    method: 'POST',
    url: `/management/ccdb/oauth/grants/${encodeURIComponent(grantId)}/revoke`,
  });

export type CcdbOAuthAuthorizeContext = {
  account?: string | null;
  channelType?: string | null;
  clientDescription?: string | null;
  clientId: string;
  clientName: string;
  companyId?: number | string | null;
  logoUrl?: string | null;
  privacyNotice?: string | null;
  requestId: string;
  scopes: CcdbOAuthScope[];
};

export type CcdbOAuthDecision = {
  approved: boolean;
  clientName?: string | null;
  redirectUri: string;
};

export const fetchCcdbOAuthAuthorizeContext = (
  params: Record<string, string>,
) =>
  request<CcdbOAuthAuthorizeContext>({
    method: 'GET',
    params,
    silentResponseError: true,
    url: '/auth/oauth/authorize/context',
  }).then(response => localizeAuthorizeContext(response.data));

export const decideCcdbOAuthAuthorization = (
  requestId: string,
  approved: boolean,
) =>
  request<CcdbOAuthDecision>({
    data: { approved, requestId },
    method: 'POST',
    silentResponseError: true,
    url: '/auth/oauth/authorize/decision',
  }).then(response => response.data);

export type CcdbDeviceAuthorizeContext = CcdbOAuthAuthorizeContext & {
  expiresIn?: number | null;
  userCode: string;
};

export type CcdbDeviceDecision = {
  approved: boolean;
  clientName?: string | null;
};

export const fetchCcdbDeviceAuthorizeContext = (userCode: string) =>
  request<CcdbDeviceAuthorizeContext>({
    method: 'GET',
    params: { user_code: userCode },
    silentResponseError: true,
    url: '/auth/oauth/device/context',
  }).then(response => localizeAuthorizeContext(response.data));

export const decideCcdbDeviceAuthorization = (
  userCode: string,
  approved: boolean,
) =>
  request<CcdbDeviceDecision>({
    data: { approved, userCode },
    method: 'POST',
    silentResponseError: true,
    url: '/auth/oauth/device/decision',
  }).then(response => response.data);
