/* eslint-disable @typescript-eslint/no-loss-of-precision */
/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-04 10:39:09
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-24 15:08:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 16:45:11
 */

import I18N from '@src/lang/I18N';

export const DYNAMICS_ROUTE_ID = ':id';

/** 过程库详情页面tab的key */
export const PROCESS_TAB_KEYS = {
  PROCESS_DESC: 'PROCESS_DESC',
  IN_OUT: 'INOUT',
} as const;

/** 过程库状态 */
export const PROCESS_LIB_STATUS = {
  INCOMPLETE: 1,
  ACTIVE: 0,
} as const;

export const PROCESS_LIB_ACCESSORY = {
  PRODUCT: 'PRODUCT',
  IN: 'IN',
  OUT: 'OUT',
} as const;

/** 过程库产品类别 */
export const PROCESS_PRODUCT_TYPE = {
  MAIN: 1,
  BY: 2,
  RECYCLED: 3,
} as const;

export const PROCESS_PRODUCT_TYPE_LABEL = {
  [PROCESS_PRODUCT_TYPE.MAIN]: I18N.carbonFootprint3.mainProducts,
  [PROCESS_PRODUCT_TYPE.BY]: I18N.carbonFootprint3.byproduct,
  [PROCESS_PRODUCT_TYPE.RECYCLED]: I18N.carbonFootprint3.reuseOfOutput,
} as const;

export const PROCESS_PRODUCT_OUTPUT_TYPE_LABEL = {
  [PROCESS_PRODUCT_TYPE.MAIN]: I18N.carbonFootprint3.mainProduct,
  [PROCESS_PRODUCT_TYPE.BY]: I18N.carbonFootprint3.byProduct,
  [PROCESS_PRODUCT_TYPE.RECYCLED]: I18N.carbonFootprint3.reusableProducts,
} as const;

export const URL_PARAMS_KEY = {
  IS_EDIT: 'isEdit',
  TAB_KEY: 'tabKey',
  PROCESS_LIB_NAME: 'processLibName',
  PROCESS_LIB_ID: 'processLibId',
  FORM_VALUES: 'formValues',
  PRODUCT_ID: 'productId',
  FROM_PAGE: 'fromPage',
  IS_CANCEL: 'isCancel',
} as const;

export const PROCESS_LIB_PAGE = {
  PRODUCT: 'PRODUCT',
  IN: 'IN',
  OUT: 'OUT',
  EMISSION: 'EMISSION',
};

export const AMOUNT = {
  MAX: 10000000000,
  MIN: 0,
} as const;

/** 匹配方式 */
export const MATCH_WAY = {
  FACTOR: 1,
  FACTOR_CREATE: 2,
  PROCESS_LIB: 3,
  PROCESS_CREATE: 4,
  SUPPLIER: 5,
} as const;

export const MATCH_WAY_LABEL = {
  [MATCH_WAY.FACTOR]: I18N.carbonFootprint.emissionFactors1,
  [MATCH_WAY.FACTOR_CREATE]: I18N.carbonFootprint3.newFactor,
  [MATCH_WAY.PROCESS_LIB]: I18N.carbonFootprint3.processLibrary,
  [MATCH_WAY.PROCESS_CREATE]: I18N.carbonFootprint3.newProcess,
  [MATCH_WAY.SUPPLIER]: I18N.carbonFootprint3.initiateCollection,
} as const;

/** 过程库输入类别 */
export const PROCESS_LIB_IN_TYPE = {
  NO_DATA: 0,
  MAIN_MATERIAL: 1,
  ACCESSORIES: 2,
  PACKAGING_MATERIAL: 3,
  RECYCLED_MATERIAL: 4,
  ENERGY_CONSUMPTION: 5,
  WATER_CONSUMPTION: 6,
  TRANSPORTATION: 7,
  PROCESS: 8,
  SAVE: 9,
  USE: 10,
  ABANDON: 11,
  SOLID_WASTE: 23,
  RECYCLED_WASTE: 24,
} as const;

/** 过程库输出类别 */
export const PROCESS_LIB_OUT_TYPE = {
  GAS_WASTE: 1,
  WATER_WASTE: 2,
  SOLID_WASTE: 3,
  RECYCLED_WASTE: 4,
} as const;

/** 计算方式 */
export const CALC_WAY = {
  PRODUCT_WEIGHT: 1,
  BEARING_RATIO: 2,
  ENERGY_CONSUMPTION: 3,
} as const;

export const RECYCLE_RATE_RANGE = {
  MIN: 0,
  MAX: 100,
} as const;

export const CORRECT_RATE_RANGE = {
  MIN: 0,
  MAX: 100,
} as const;

export const MAX_DECIMAL_PLACE = 6 as const;

/** Agent 核算排放源的消耗数量、货物重量最多保留的小数位数 */
export const AGENT_EMISSION_AMOUNT_MAX_DECIMAL_PLACE = 9 as const;

export const RECYCLE_RATE_MAX_DECIMAL_PLACE = 2 as const;

export const CORRECT_RATE_MAX_DECIMAL_PLACE = 4 as const;

export const MAX_ELLIPSIS_LENGTH = 10 as const;
