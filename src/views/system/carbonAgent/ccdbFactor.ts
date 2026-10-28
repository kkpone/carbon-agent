import I18N from '@src/lang/I18N';
import { getLocaleCodeFromPathname } from '@src/router/localePath';
import { request } from '@api/request';

type ApiEnvelope<T> = {
  code: number;
  data: T;
  msg?: string;
  requestId?: string;
};

const unwrap = <T>(response: { data: ApiEnvelope<T> }) => {
  if (response.data.code !== 200)
    throw new Error(response.data.msg || I18N.ccdb.factorLoadError);
  return response.data.data;
};

export class CcdbFactorBindingError extends Error {}

export const getCcdbLanguage = (): 'zh' | 'en' =>
  getLocaleCodeFromPathname() === 'en' ? 'en' : 'zh';

export const getCcdbErrorMessage = (error: unknown) => {
  const response = error as {
    data?: { msg?: string };
    response?: { data?: { msg?: string } };
  } | null;
  return (
    response?.data?.msg ||
    response?.response?.data?.msg ||
    (error instanceof Error ? error.message : I18N.ccdb.factorLoadError)
  );
};

export type CcdbGasDatum = {
  factorUnit?: string | null;
  factorUnitM?: string | null;
  factorValue?: number | string | null;
  greenhouseGasesType?: string | null;
  [key: string]: unknown;
};

export type CcdbFactorDetail = {
  area?: string | null;
  business?: string | null;
  countries?: string | null;
  cValue?: number | string | null;
  description?: string | null;
  detailUrl?: string | null;
  documentType?: string | null;
  factorId: string;
  factorPattern?: number | string | null;
  factorType?: string | null;
  factorVersion?: string | null;
  formula?: string | null;
  gasData?: CcdbGasDatum[] | null;
  id?: number | string | null;
  institution?: string | null;
  isEncryption?: number | string | null;
  name?: string | null;
  source?: string | null;
  sourceId?: number | string | null;
  sourceLevel?: string | null;
  specification?: string | null;
  unit?: string | null;
  year?: number | string | null;
};

export type CcdbFactorPreviewTarget = {
  boundSessionId?: string;
  entrySource?: 'LIBRARY' | 'CHAT';
  countries?: string;
  detail?: CcdbFactorDetail;
  detailUrl?: string;
  factorId: string;
  name?: string;
  publicAccess?: boolean;
  shareId?: string;
  sourceName?: string;
  unit?: string;
  value?: string;
  year?: string;
};

export const factorTargetFromHref = (
  href: string,
): CcdbFactorPreviewTarget | undefined => {
  try {
    const url = new URL(href, window.location.origin);
    if (!['http:', 'https:'].includes(url.protocol)) return undefined;
    if (
      url.origin !== window.location.origin &&
      url.hostname !== 'agent.carbonstop.com' &&
      url.hostname !== 'agenttest.carbonstop.com'
    )
      return undefined;
    const match = /^\/factors\/([0-9]{1,19})\/?$/.exec(url.pathname);
    if (!match) return undefined;
    return {
      factorId: match[1],
      detailUrl: url.href,
      shareId: url.searchParams.get('share') || undefined,
    };
  } catch {
    return undefined;
  }
};

export type CcdbFactorShare = {
  agentInviteCode?: string;
  factor?: CcdbFactorDetail;
  factorId: string;
  shareId: string;
  shareUrl?: string;
};

export type CcdbSessionFactorRef = {
  factorId: string;
  factorVersion?: string | null;
  sessionId: string;
  snapshotJson: string;
  sourceShareId?: string | null;
};

export const parseCcdbFactorSnapshot = (json: string): CcdbFactorDetail => {
  const snapshot: unknown = JSON.parse(json);
  if (
    !snapshot ||
    typeof snapshot !== 'object' ||
    !('factorId' in snapshot) ||
    (typeof snapshot.factorId !== 'string' &&
      typeof snapshot.factorId !== 'number')
  ) {
    throw new Error(I18N.ccdb.librarySnapshotInvalid);
  }
  return {
    ...snapshot,
    factorId: String(snapshot.factorId),
  } as CcdbFactorDetail;
};

export const sessionFactorTarget = (
  ref: CcdbSessionFactorRef,
): CcdbFactorPreviewTarget => ({
  factorId: String(ref.factorId),
  boundSessionId: String(ref.sessionId),
  detail: parseCcdbFactorSnapshot(ref.snapshotJson),
  shareId: ref.sourceShareId || undefined,
});

export const fetchCcdbSessionFactors = (
  sessionId: string,
  signal?: AbortSignal,
) =>
  request<ApiEnvelope<CcdbSessionFactorRef[]>>({
    method: 'GET',
    params: { language: getCcdbLanguage() },
    signal,
    url: `/management/api/ccdb/v1/sessions/${encodeURIComponent(
      sessionId,
    )}/factor-refs`,
  }).then(unwrap);

export const fetchCcdbSessionFactor = (
  sessionId: string,
  factorId: string,
  signal?: AbortSignal,
) =>
  request<ApiEnvelope<CcdbSessionFactorRef>>({
    method: 'GET',
    params: { language: getCcdbLanguage() },
    signal,
    url: `/management/api/ccdb/v1/sessions/${encodeURIComponent(
      sessionId,
    )}/factor-refs/${encodeURIComponent(factorId)}`,
  }).then(unwrap);

// This is ordinary reference material for the Agent, never an access credential.
export const withCcdbFactorContext = (
  payload: Record<string, unknown> | undefined,
  message: string,
  factor?: CcdbFactorPreviewTarget,
): Record<string, unknown> | undefined => {
  if (!factor?.detail) return payload;
  const content = JSON.stringify(factor.detail);
  const references = payload?.references;
  return {
    ...payload,
    lang: payload?.lang || getCcdbLanguage(),
    message: payload?.message || message,
    pageContext: {
      ...((payload?.pageContext as Record<string, unknown>) || {}),
      entry: 'ccdb_factor',
      ccdbFactor: factor.detail,
    },
    references: [
      ...(Array.isArray(references) ? references : []),
      {
        referenceId: `ccdb:${factor.factorId}`,
        type: 'card',
        title: factor.detail.name || I18N.ccdb.ccdbFactor,
        content,
      },
    ],
  };
};

export const fetchCcdbFactorDetail = (
  factorId: string,
  signal?: AbortSignal,
  entrySource?: 'LIBRARY' | 'CHAT',
) =>
  request<ApiEnvelope<CcdbFactorDetail>>({
    method: 'GET',
    params: { language: getCcdbLanguage(), entrySource },
    signal,
    url: `/management/api/ccdb/v1/factors/${encodeURIComponent(factorId)}`,
  }).then(unwrap);

export const fetchPublicCcdbFactorDetail = (
  factorId: string,
  signal?: AbortSignal,
) =>
  request<ApiEnvelope<CcdbFactorDetail>>({
    method: 'GET',
    params: { language: getCcdbLanguage() },
    signal,
    url: `/management/api/ccdb/v1/factor-landing/${encodeURIComponent(
      factorId,
    )}`,
  }).then(unwrap);

export const fetchCcdbFactorShare = (shareId: string, signal?: AbortSignal) =>
  request<ApiEnvelope<CcdbFactorShare>>({
    method: 'GET',
    params: { language: getCcdbLanguage() },
    signal,
    url: `/management/api/ccdb/v1/factor-shares/${encodeURIComponent(shareId)}`,
  }).then(unwrap);

export const createCcdbFactorShare = (factorId: string) =>
  request<ApiEnvelope<CcdbFactorShare>>({
    method: 'POST',
    params: { language: getCcdbLanguage() },
    url: `/management/api/ccdb/v1/factors/${encodeURIComponent(
      factorId,
    )}/shares`,
  }).then(unwrap);

export const bindCcdbFactorToSession = ({
  factorId,
  messageId,
  sessionId,
  sourceShareId,
}: {
  factorId: string;
  messageId?: string;
  sessionId: string;
  sourceShareId?: string;
}) =>
  request<ApiEnvelope<CcdbSessionFactorRef>>({
    params: { language: getCcdbLanguage() },
    data: {
      factorId,
      messageId,
      sourceShareId,
    },
    method: 'POST',
    url: `/management/api/ccdb/v1/sessions/${encodeURIComponent(
      sessionId,
    )}/factor-refs`,
  }).then(unwrap);

export const fetchCcdbFactorPreview = (
  target: CcdbFactorPreviewTarget,
  signal?: AbortSignal,
): Promise<CcdbFactorDetail | undefined> => {
  if (target.boundSessionId) {
    return fetchCcdbSessionFactor(
      target.boundSessionId,
      target.factorId,
      signal,
    ).then(ref => parseCcdbFactorSnapshot(ref.snapshotJson));
  }
  if (target.shareId)
    return fetchCcdbFactorShare(target.shareId, signal).then(
      response => response.factor,
    );
  if (target.publicAccess)
    return fetchPublicCcdbFactorDetail(target.factorId, signal);
  return fetchCcdbFactorDetail(target.factorId, signal, target.entrySource);
};

export const getCcdbFactorValue = (detail?: CcdbFactorDetail) => {
  if (!detail) {
    return '';
  }

  const value = detail.cValue;
  const unit = detail.unit?.trim();

  return [value === undefined || value === null ? '' : String(value), unit]
    .filter(Boolean)
    .join(' ');
};
