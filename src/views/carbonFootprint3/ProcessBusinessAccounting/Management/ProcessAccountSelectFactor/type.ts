/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-20 14:34:46
 * @Date: 2023-03-14 11:53:05
 * @@description:
 */
import { ApiExtraParams } from '@src/components/CarbonFootprintAccount/BuildModelMainData/type';
import { PROCESS_BACCOUNT_EMISSION_MATCH_WAY } from '@src/views/carbonFootprint3/util/constant';

import { ProcessBusinessAccountingMenu } from '../../type';

export type ProcessAccountMatchWay =
  (typeof PROCESS_BACCOUNT_EMISSION_MATCH_WAY)[keyof typeof PROCESS_BACCOUNT_EMISSION_MATCH_WAY];

export type ProcessAccountSelectFactorProps = {
  processAccountId: string;
  treeNode: ProcessBusinessAccountingMenu;
  apiExtraParams?: ApiExtraParams;
  /** 因子选用评价卡片；默认展示，与排放源抽屉一致 */
  showFactorEvaluationCard?: boolean;
  isEdit: boolean;
  isOnlyDetail?: boolean;
  isProcess?: boolean;
  onUpdateClick: () => void;
  currentWidth: number;
  formValuesString?: Record<string, any>;
  /** 是否展示排放因子库的数据源范围筛选 */
  enableFactorSourceRange?: boolean;
  /** 当前核算选择的全局因子偏好方案 */
  factorPrefId?: number | string;
};
