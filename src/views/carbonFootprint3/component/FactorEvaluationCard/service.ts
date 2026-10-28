import { QuickBusinessAccountingSource } from '@src/views/carbonFootprint3/QuickBusinessAccounting/type';

import { request } from '@/api/request';
import { API_EXTRA_PARAMS_SNAPFLAG } from '@src/components/CarbonFootprintAccount/BuildModelMainData/constant';

const { ACCOUNT_SHARE_EDIT } = API_EXTRA_PARAMS_SNAPFLAG;

/** 共享编辑（snapFlag=8）场景不请求因子选用评价 */
const isShareEditFactorEvaluateSkipped = () => {
  if (typeof window === 'undefined') {
    return false;
  }
  const snapFlagRaw = new URLSearchParams(window.location.search).get(
    'snapFlag',
  );
  return Number(snapFlagRaw) === ACCOUNT_SHARE_EDIT;
};

/** POST /footprint3/accountEmission/aiFactorEvaluate 返回评价条目列表 */
export const getFactorEvaluation = (
  data: Partial<QuickBusinessAccountingSource>,
) => {
  if (isShareEditFactorEvaluateSkipped()) {
    return Promise.resolve({ data: { data: [] } });
  }

  return request<{ data: string[] }>({
    method: 'post',
    url: '/footprint3/accountEmission/aiFactorEvaluate',
    data,
  });
};
