import { getProductPermisions } from '@src/api/api';
import store from '@src/store';

/** 获取权限 */
export const getProductPermission = async (productId?: string) => {
  const userInfo = store.getState().companyUserInfo?.userInfo;
  const companyId = userInfo?.companyId;
  const userId = userInfo?.userId;
  if (!companyId || !userId || !productId)
    return Promise.resolve([null, null] as const);
  return getProductPermisions({
    companyId,
    userId,
    productId,
  }).then(res => {
    const info = res?.data?.data?.userInfo;

    return [res, info] as const;
  });
};
