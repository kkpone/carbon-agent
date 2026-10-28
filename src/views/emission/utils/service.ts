/**
 * @ Author: qifeng
 * @ Create Time: 2022-07-18 09:40:39
 * @ Modified by: qifeng
 * @ Modified time: 2022-11-10 17:03:01
 * @ Description:
 */

import { addFactorUsageRecord } from '@src/api/factors';
import { getShareEditFactorUsageCompanyId } from '@src/components/CarbonFootprintAccount/BuildModelMainData/shareSnapFlag';
import I18N from '@src/lang/I18N';
import store from '@src/store';
import { FactorUse } from '@src/views/utils';

/** 解析 useRecord/add 所需的 companyId：显式入参 > 共享编辑缓存 > Redux 当前组织 */
function resolveFactorUsageCompanyId(
  overrideCompanyId?: string | number,
): string | null {
  if (overrideCompanyId != null && overrideCompanyId !== '') {
    return String(overrideCompanyId);
  }

  const shareCompanyId = getShareEditFactorUsageCompanyId();
  if (shareCompanyId) {
    return shareCompanyId;
  }

  const storeCompanyId = store.getState().companyUserInfo.userInfo.companyId;
  if (!storeCompanyId) {
    // eslint-disable-next-line no-console
    console.warn('[addFactorUse] missing companyId');
    return null;
  }

  return String(storeCompanyId);
}

/**
 * @file 记录因子使用次数
 */
export const addFactorUse = (props: {
  factorSource: FactorUse;
  //	是	因子id
  factorId: string | number;
  //	是	因子名称
  factorName: string | number;
  searchId?: string;
  /** 共享编辑等无登录态场景，可显式传入核算 companyId */
  companyId?: string | number;
}) => {
  const { companyId: overrideCompanyId, ...rest } = props;
  const companyId = resolveFactorUsageCompanyId(overrideCompanyId);

  if (!companyId) {
    return;
  }

  const storeInfo = store.getState();
  // api save usage
  addFactorUsageRecord({
    companyId,
    companyName: `${
      storeInfo.companyUserInfo.userInfo.companyVoList?.find(
        o => o.companyId === storeInfo.companyUserInfo.userInfo.companyId,
      )?.companyName
    }`,
    ...rest,
    // 计数接口，不必暴露错误
    // eslint-disable-next-line
  }).catch(err => console.warn(I18N.emission.countingInterfaceDifference, err));
};
