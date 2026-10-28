/** 碳足迹核算 - 产品列表的tabs */
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

export enum FootprintAccountTypeValue {
  NOT = 0,
  OVER = 1,
  ALL = 2,
}

export const FOOTPRINT_ACCOUNT_TYPE_LABEL = createI18nLabelMap({
  [FootprintAccountTypeValue.ALL]: () => I18N.carbonFootprint3.whole,
  [FootprintAccountTypeValue.OVER]: () => I18N.carbonFootprint3.calculated,
  [FootprintAccountTypeValue.NOT]: () => I18N.carbonFootprint3.notAccountedFor,
});

/** 碳足迹核算 - 产品详情中 - 核算列表快速tab */
export const FootprintAccountListTypeValue = {
  ALL: 3,
  CREATE: 0,
  MODELING: 1,
  COMPLETE: 2,
} as const;
export const FOOTPRINT_ACCOUNT_LIST_TYPE_LABEL = createI18nLabelMap({
  [FootprintAccountListTypeValue.ALL]: () => I18N.carbonFootprint3.whole,
  [FootprintAccountListTypeValue.CREATE]: () =>
    I18N.carbonFootprint3.createAccounting,
  [FootprintAccountListTypeValue.MODELING]: () =>
    I18N.carbonFootprint3.inModeling,
  [FootprintAccountListTypeValue.COMPLETE]: () =>
    I18N.carbonFootprint3.accountingCompleted,
});

/** 碳足迹核算 - 核算类型 */
export enum FootprintAccountStatusType {
  QUICK = 0,
  PROCESS = 1,
}

export const FOOTPRINT_ACCOUNT_TYPE_STATUS_LABEL = createI18nLabelMap({
  [FootprintAccountStatusType.QUICK]: () =>
    I18N.carbonFootprint3.quickAccounting,
  [FootprintAccountStatusType.PROCESS]: () =>
    I18N.carbonFootprint3.processAccounting,
});
export const FOOTPRINT_ACCOUNT_TYPE_STATUS_OPTION = createI18nLabelMap({
  [FootprintAccountStatusType.QUICK]: () =>
    I18N.carbonFootprint3.quickAccounting,
  [FootprintAccountStatusType.PROCESS]: () =>
    I18N.carbonFootprint3.processAccounting,
});

/**
 * @description 碳足迹核算生命周期
 */
export enum AccountLifeCycle {
  MATERIAL = 0,
  PRODUCT = 1,
  DISTRIBUTION = 2,
  USE = 3,
  WASTE_DISPOSAL = 4,
}

/**
 * 上一个 下一个
 */
export enum AccountProductIdNext {
  BACK = 0,
  NEXT = 1,
}

/** 核算详情 - 区分新增、编辑和详情 */
export enum FootprintAccountInfoUrlStatus {
  ADD = 0,
  EDIT = 1,
  DETAIL = 2,
  COPY = 3,
}

/** 核算详情 - 生命周期 - 半、全和自定义生命周期 */
export enum FootprintAccountLifeCycle {
  HALF = 0,
  FULL = 1,
  CUSTOM = 2,
}

/** 惰性求值，语言切换后自动生效 */
export const ACCOUNT_SELECT_LIFE_CYCLE_LABEL = createI18nLabelMap({
  [FootprintAccountLifeCycle.HALF]: () => I18N.carbonFootprint3.halfLifeCycle,
  [FootprintAccountLifeCycle.FULL]: () => I18N.carbonFootprint3.fullLifecycle,
  [FootprintAccountLifeCycle.CUSTOM]: () => I18N.carbonFootprint.customLife,
});

export const BAR_COLORS = [
  '#57D9B8',
  '#2FCCAA',
  '#0CBF9F',
  '#08A28B',
  '#048677',
  '#026961',
  '#005854',
  '#004541',
  '#004245',
  '#003734',
  '#002A23',
  '#04252B',
];
