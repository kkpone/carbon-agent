/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-20 11:16:42
 * @Date: 2023-03-08 16:12:20
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-04 10:39:09
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-09 10:10:10
 */
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export const URL_QUICK_ACCOUNT_KEY = {
  IS_EDIT: 'isEdit',
  SELECT_MODEL_LIST: 'modelList',
} as const;

export const STEP_OPTION = [
  { value: 0, title: I18N.carbonFootprint.basicInformation },
  { value: 1, title: I18N.carbonFootprint3.buildingModels },
  { value: 2, title: I18N.carbonFootprint3.carbonFootprintResults },
] as const;

export const ACCOUNT_DISPLAY_TYPE = {
  TABLE: 'TABLE',
  VISUALIZATION: 'VISUALIZATION',
} as const;

export const URL_PARAMS_KEY = {
  STEP: 'step',
  DISPLAY: 'display',
} as const;

export const ACCOUNT_STATUS = {
  CREATED: 0,
  MODELING: 1,
  FINISHED: 2,
} as const;

export const ACCOUNT_STATUS_LABEL = createI18nLabelMap({
  [ACCOUNT_STATUS.CREATED]: () => I18N.carbonFootprint3.createAccounting,
  [ACCOUNT_STATUS.MODELING]: () => I18N.carbonFootprint3.inModeling,
  [ACCOUNT_STATUS.FINISHED]: () => I18N.carbonFootprint3.completeAccounting,
});

/** 计算方式 */
export const CALC_WAY = {
  PRODUCT_WEIGHT: 1,
  BEARING_RATIO: 2,
  ENERGY_CONSUMPTION: 3,
} as const;
