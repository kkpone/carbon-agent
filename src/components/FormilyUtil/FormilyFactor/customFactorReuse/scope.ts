import store, { type RootState } from '@src/store';

/** 只用于丢弃切换用户/企业前的响应，不作为接口归属参数。 */
export function selectSavedFactorScope(state: RootState): string {
  const { userInfo } = state.companyUserInfo;
  return `${userInfo?.companyId ?? ''}:${userInfo?.userId ?? ''}`;
}

export function getSavedFactorScope(): string {
  return selectSavedFactorScope(store.getState());
}
