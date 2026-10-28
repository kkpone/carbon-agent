/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-05 11:33:00
 * @Date: 2023-02-10 17:40:23
 * @@description:
 */

import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';
import { ValueOf } from 'type-fest';

/**
 * @description: 排放因子 - 分子单位
 */
export const MODEL_EMISSION_FACTOR_UNIT = [
  { label: 'gCO₂e', value: 'gCO₂e' },
  { label: 'kgCO₂e', value: 'kgCO₂e' },
  { label: 'tCO₂e', value: 'tCO₂e' },
];

export const STEP_OPTION_VALUE = {
  // BASIC: 0,
  MODEL: 1,
  RESULT: 2,
};

export type StepOptionValue = ValueOf<typeof STEP_OPTION_VALUE>;

export const STEP_OPTION_LABEL = () => ({
  // [STEP_OPTION_VALUE.BASIC]: I18N.carbonFootprint.basicInformation,
  [STEP_OPTION_VALUE.MODEL]: I18N.carbonFootprint3.buildingModels,
  [STEP_OPTION_VALUE.RESULT]: I18N.carbonFootprint3.carbonFootprintResults,
});

export const STEP_OPTION = [
  { value: 0, title: I18N.carbonFootprint.basicInformation },
  { value: 1, title: I18N.carbonFootprint3.buildingModels },
  { value: 2, title: I18N.carbonFootprint3.carbonFootprintResults },
] as const;

/**
 * @description: 过程核算-新增核算-选择模型-菜单常量
 */
export const PROCESS_MODEL_MENU_KEY = {
  /** 我的模型 */
  MY_MODEL: 'item1',
  /** 推荐 */
  RECOMMEND: 'item2',
  /** 食品 */
  FOOD: 'item3',
  /** 电子产品 */
  ELECTRONICS: 'item4',
  /** 工业品 */
  INDUSTRIAL: 'item5',
  /** 快销品 */
  FASTSELL: 'item6',
} as const;
export const PROCESS_MODEL_MENU = [
  {
    label: I18N.carbonFootprint3.myModel,
    key: PROCESS_MODEL_MENU_KEY.MY_MODEL,
  },
  {
    label: I18N.carbonFootprint3.recommendation,
    key: PROCESS_MODEL_MENU_KEY.RECOMMEND,
  },
  { label: I18N.carbonFootprint3.food, key: PROCESS_MODEL_MENU_KEY.FOOD },
  {
    label: I18N.carbonFootprint3.electronicProduct,
    key: PROCESS_MODEL_MENU_KEY.ELECTRONICS,
  },
  {
    label: I18N.carbonFootprint3.industrialProducts,
    key: PROCESS_MODEL_MENU_KEY.INDUSTRIAL,
  },
  {
    label: I18N.carbonFootprint3.fastSellingProducts,
    key: PROCESS_MODEL_MENU_KEY.FASTSELL,
  },
] as { label: string; key: string }[];

export const PROCESS_BACCOUNT_EMISSION_MATCH_WAY = {
  FACTOR: 1,
  FACTOR_CREATE: 2,
  PROCESS_LIB: 3,
  PROCESS_CREATE: 4,
  SUPPLIER: 5,
} as const;

export const PROCESS_BACCOUNT_EMISSION_MATCH_WAY_LABEL = createI18nLabelMap({
  [PROCESS_BACCOUNT_EMISSION_MATCH_WAY.FACTOR]: () =>
    I18N.carbonFootprint.emissionFactors,
  [PROCESS_BACCOUNT_EMISSION_MATCH_WAY.FACTOR_CREATE]: () =>
    I18N.carbonFootprint3.newFactor,
  [PROCESS_BACCOUNT_EMISSION_MATCH_WAY.PROCESS_LIB]: () =>
    I18N.carbonFootprint3.processLibrary,
  [PROCESS_BACCOUNT_EMISSION_MATCH_WAY.PROCESS_CREATE]: () =>
    I18N.carbonFootprint3.newProcess,
});

export const PROCESS_URL_PARAMS_KEY = {
  INFO_ID: 'infoId',
  INFO_IS_EDIT: 'infoIsEdit',
  SCOPE_VALUE: 'scopeValue',
  LIST_TREE_DATA: 'listTreeData',
  LIST_OR_GRAPH: 'listOrGraph',
} as const;

export const LIST_OR_GRAPH_VAL = {
  LIST: 1,
  GRAPH: 2,
} as const;

export const PROCESS_ACCOUNT_SCOPED = {
  HALF: 0,
  FULL: 1,
} as const;

export const PROCESS_ACCOUNT_SCOPED_LABEL = createI18nLabelMap({
  [PROCESS_ACCOUNT_SCOPED.HALF]: () => I18N.carbonFootprint3.halfLifeCycle,
  [PROCESS_ACCOUNT_SCOPED.FULL]: () => I18N.carbonFootprint3.fullLifecycle,
});

export const PROCESS_ACCOUNT_STATUS = {
  CREATE: 0,
  MODEL: 1,
  FULFILL: 2,
} as const;

export const PROCESS_ACCOUNT_STATUS_TEXT = createI18nLabelMap({
  [PROCESS_ACCOUNT_STATUS.CREATE]: () => I18N.carbonFootprint3.createAccounting,
  [PROCESS_ACCOUNT_STATUS.MODEL]: () => I18N.carbonFootprint3.inModeling,
  [PROCESS_ACCOUNT_STATUS.FULFILL]: () =>
    I18N.carbonFootprint3.completeAccounting,
});

export const PROCESS_VISUALIZATION_RADIO = {
  DESCRIBE: 0,
  PRODUCT: 1,
} as const;
