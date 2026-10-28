import { API_EXTRA_PARAMS_SNAPFLAG } from './constant';

const { ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

/** sessionStorage key：共享编辑选因子后 useRecord/add 所需的 companyId */
const SHARE_EDIT_FACTOR_USAGE_COMPANY_ID_KEY = 'shareEditFactorUsageCompanyId';

export type ShareEditApiExtraParams = {
  snapFlag?: number | string;
  shareAuth?: string;
};

/** 是否为分享链接可编辑上下文（snapFlag=8 且已鉴权） */
export function isShareLinkEditableContext(
  apiExtraParams?: ShareEditApiExtraParams,
): boolean {
  return (
    Number(apiExtraParams?.snapFlag) === ACCOUNT_SHARE_EDIT &&
    !!apiExtraParams?.shareAuth
  );
}

/**
 * 共享编辑：匹配方式全部展示，但由抽屉 schema 控制为只读，避免误隐藏发起收数/核算引用入口。
 */
export function filterShareEditMatchWayOptions<
  T extends { value: number | string },
>(options: T[]): T[] {
  // 当前逻辑仅负责“不隐藏选项”，只读交互由各抽屉 schema 控制。
  return options;
}

/**
 * 共享可编辑（snapFlag=8）场景下，因子检索/匹配接口需携带 snapFlag。
 * 优先使用入参中的 snapFlag；否则从 URL 读取（与 ShareAccountLogin useUrlState 一致）。
 */
export function withShareEditSnapFlag<T extends Record<string, unknown>>(
  data: T,
): T {
  if (data.snapFlag != null) {
    if (Number(data.snapFlag) === ACCOUNT_SHARE_EDIT) {
      return { ...data, snapFlag: ACCOUNT_SHARE_EDIT };
    }
    return data;
  }

  if (typeof window === 'undefined') {
    return data;
  }

  const snapFlagRaw = new URLSearchParams(window.location.search).get(
    'snapFlag',
  );
  if (Number(snapFlagRaw) !== ACCOUNT_SHARE_EDIT) {
    return data;
  }

  return { ...data, snapFlag: ACCOUNT_SHARE_EDIT };
}

/** 写入共享编辑因子使用记录所需的 companyId */
export function setShareEditFactorUsageCompanyId(companyId: number | string) {
  if (companyId == null || companyId === '') {
    return;
  }
  try {
    sessionStorage.setItem(
      SHARE_EDIT_FACTOR_USAGE_COMPANY_ID_KEY,
      String(companyId),
    );
  } catch (err) {
    // sessionStorage 不可用（隐私模式等），仅记录便于排查
    // eslint-disable-next-line no-console
    console.warn('[shareEdit] setShareEditFactorUsageCompanyId failed', err);
  }
}

/** 读取共享编辑因子使用记录所需的 companyId */
export function getShareEditFactorUsageCompanyId(): string | null {
  try {
    const companyId = sessionStorage.getItem(
      SHARE_EDIT_FACTOR_USAGE_COMPANY_ID_KEY,
    );
    return companyId || null;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[shareEdit] getShareEditFactorUsageCompanyId failed', err);
    return null;
  }
}

export function clearShareEditFactorUsageCompanyId() {
  try {
    sessionStorage.removeItem(SHARE_EDIT_FACTOR_USAGE_COMPANY_ID_KEY);
  } catch {
    // ignore
  }
}

/**
 * 共享编辑（snapFlag=8）加载核算详情后，同步 companyId 供选因子 useRecord/add 使用。
 */
export function syncShareEditFactorUsageCompanyId(account?: {
  companyId?: number | null;
}) {
  if (!account?.companyId) {
    return;
  }
  setShareEditFactorUsageCompanyId(account.companyId);
}
