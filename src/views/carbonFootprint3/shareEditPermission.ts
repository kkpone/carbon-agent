import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';

const { ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

/** 分享凭证失效 / 链接过期 / 快照不匹配，需进入分享失效页 */
export const SHARE_UNAUTH_CODE = 441;

/**
 * 分享编辑权限已失效。
 *
 * 后端 ApiCode.NOT_EDIT：首次完成建模后不可继续编辑，查看接口仍可继续访问。
 */
export const SHARE_NOT_EDIT_CODE = 100008;

/** 全局写接口返回 NOT_EDIT 时通知分享页降级为只读 */
export const SHARE_EDIT_NOT_EDIT_EVENT = 'carbonFootprint3:share-edit-not-edit';

/** 全局接口返回 SHARE_UNAUTH 时通知分享页进入过期/失效态 */
export const SHARE_UNAUTH_EVENT = 'carbonFootprint3:share-unauth';

export const SHARE_EDIT_NOT_EDIT_MESSAGE_KEYWORDS = [
  'NOT_EDIT',
  '不可继续编辑',
  '不可编辑',
  '不能编辑',
];

type SharePermitPayload = {
  canEdit?: number | string | null;
  can_edit?: number | string | null;
  supplyAccountId?: number | string | null;
  supply_account_id?: number | string | null;
  editType?: number | string | null;
  edit_type?: number | string | null;
  editPermit?: number | string | null;
  edit_permit?: number | string | null;
};

/** 后端联调中存在 snake_case / camelCase 两种字段，统一在这里做兼容解析 */
export const getShareCanEdit = (payload?: SharePermitPayload | null) =>
  Number(payload?.canEdit ?? payload?.can_edit ?? 0);

export const hasShareCanEditField = (payload?: SharePermitPayload | null) =>
  payload?.canEdit != null || payload?.can_edit != null;

export const getShareSupplyAccountId = (payload?: SharePermitPayload | null) =>
  payload?.supplyAccountId ?? payload?.supply_account_id;

export const getShareEditType = (payload?: SharePermitPayload | null) =>
  Number(payload?.editType ?? payload?.edit_type ?? 0);

export const getShareEditPermit = (payload?: SharePermitPayload | null) => {
  const value = payload?.editPermit ?? payload?.edit_permit;
  return value == null ? undefined : Number(value);
};

export const getApiResponseCode = (response: unknown) => {
  const payload = response as {
    data?: { code?: number | string };
    code?: number | string;
  };
  return payload?.data?.code ?? payload?.code;
};

export const isShareUnauthorizedResponse = (response: unknown) =>
  Number(getApiResponseCode(response)) === SHARE_UNAUTH_CODE;

export const isShareNotEditResponse = (response: unknown) => {
  const payload = response as {
    data?: { code?: number | string; msg?: string; data?: string };
    code?: number | string;
    msg?: string;
  };
  const rawCode = getApiResponseCode(response);
  const codeText = rawCode == null ? '' : String(rawCode);
  const msgText =
    payload?.data?.msg || payload?.msg || String(payload?.data?.data || '');

  return (
    Number(rawCode) === SHARE_NOT_EDIT_CODE ||
    codeText === 'NOT_EDIT' ||
    SHARE_EDIT_NOT_EDIT_MESSAGE_KEYWORDS.some(keyword =>
      msgText.includes(keyword),
    )
  );
};

export const isShareEditUrlSearch = (search?: string) => {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(search ?? window.location.search);
  return (
    Number(params.get('snapFlag')) === ACCOUNT_SHARE_EDIT &&
    !!params.get('shareAuth')
  );
};

const dispatchShareEvent = (eventName: string) => {
  if (typeof window === 'undefined') return;
  if (typeof CustomEvent === 'function') {
    window.dispatchEvent(new CustomEvent(eventName));
    return;
  }
  const event = document.createEvent('CustomEvent');
  event.initCustomEvent(eventName, false, false, undefined);
  window.dispatchEvent(event);
};

export const dispatchShareNotEditEvent = () => {
  dispatchShareEvent(SHARE_EDIT_NOT_EDIT_EVENT);
};

export const dispatchShareUnauthEvent = () => {
  dispatchShareEvent(SHARE_UNAUTH_EVENT);
};
