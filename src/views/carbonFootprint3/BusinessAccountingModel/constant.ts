/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-04-04 10:14:12
 * @Date: 2023-01-11 19:20:50
 * @@description:
 */
/**
 * @description: 模型排放源的类型
 */
import I18N from '@src/lang/I18N';

const MODEL_EMISSION_TYPE = {
  /** 主料 */
  MAIN_INGREDIENT: 1,
  /** 辅料 */
  OTHER_MAIN_INGREDIENT: 2,
  /** 包装材料 */
  PACKAGING: 3,
  /** 再生材料 */
  RECYCLE: 4,
  /** 能耗 */
  ENERGY: 5,
  /** 水耗 */
  WATER: 6,
  /** 运输 */
  TRANSPORT: 7,
  /** 加工 */
  PROCESS: 8,
  /** 分销存储 */
  SAVE: 9,
  /** 使用 */
  USE: 10,
  /** 废弃处置 */
  ABANDON: 11,
} as const;

/**
 * @description: 对应排放源类型的文字
 */
export const MODEL_EMISSION_TYPE_LABEL = {
  [MODEL_EMISSION_TYPE.MAIN_INGREDIENT]: I18N.carbonFootprint.mainMaterials,
  [MODEL_EMISSION_TYPE.OTHER_MAIN_INGREDIENT]: I18N.carbonFootprint.accessories,
  [MODEL_EMISSION_TYPE.PACKAGING]: I18N.carbonFootprint3.packingMaterial,
  [MODEL_EMISSION_TYPE.RECYCLE]: I18N.carbonFootprint3.recycledMaterials,
  [MODEL_EMISSION_TYPE.ENERGY]: I18N.carbonFootprint.energyConsumption2,
  [MODEL_EMISSION_TYPE.WATER]: I18N.carbonFootprint3.waterConsumption,
  [MODEL_EMISSION_TYPE.TRANSPORT]: I18N.carbonFootprint.transport,
  [MODEL_EMISSION_TYPE.PROCESS]: I18N.carbonFootprint3.machining,
  [MODEL_EMISSION_TYPE.SAVE]: I18N.carbonFootprint3.distributionAndStorage2,
  [MODEL_EMISSION_TYPE.USE]: I18N.carbonFootprint3.apply,
  [MODEL_EMISSION_TYPE.ABANDON]: I18N.carbonFootprint.abandonedDisposal,
} as const;

/**
 * @description: 排放源的因子选择
 */
export const MODEL_EMISSION_MATCH_WAY = {
  /** 选择因子 */
  FACTOR: 1,
  /** 手动填写因子 */
  FACTOR_CREATE: 2,
  PROCESS_LIB: 3,
  SUPPLIER: 5,
  /** 引用已有核算模型 */
  MODEL_REFER: 6,
} as const;

export const MODEL_EMISSION_MATCH_WAY_ICON = {
  FACTOR_ICON: 'icon-yinzixinxi',
  SUPPLIER_ICON: 'icon-gongyingshangshoushu',
  MODEL_REFER_ICON: 'icon-icon_model',
} as const;

export const MODEL_EMISSION_MATCH_WAY_LABEL = () =>
  ({
    [MODEL_EMISSION_MATCH_WAY.FACTOR]: I18N.carbonFootprint3.factorInformation,
    [MODEL_EMISSION_MATCH_WAY.FACTOR_CREATE]: I18N.carbonFootprint3.newFactor,
    [MODEL_EMISSION_MATCH_WAY.PROCESS_LIB]:
      I18N.carbonFootprint3.processLibrary,
    [MODEL_EMISSION_MATCH_WAY.SUPPLIER]:
      I18N.carbonFootprint3.initiateCollection,
    [MODEL_EMISSION_MATCH_WAY.MODEL_REFER]:
      I18N.carbonFootprint3.accountingReference,
  } as const);

/** 0 - 已请求 1 - 等待回复 2 - 已审核完毕 */
export const MODEL_EMISSION_REQUEST_STATE = {
  NOT_SUBMIT: 0,
  WAITING: 1,
  AUDITED: 2,
} as const;

export const MODEL_EMISSION_DATA_TYPE = {
  RESULT: 1,
  PROCESS: 2,
} as const;

export const MODEL_EMISSION_DATA_TYPE_LABEL = {
  [MODEL_EMISSION_DATA_TYPE.RESULT]:
    I18N.carbonFootprint3.carbonFootprintVerification2,
  [MODEL_EMISSION_DATA_TYPE.PROCESS]:
    I18N.carbonFootprint3.carbonFootprintVerification,
} as const;

export const MODEL_EMISSION_BORDER_TYPE = {
  HALF: 0,
  WHOLE: 1,
} as const;

export const MODEL_EMISSION_BORDER_TYPE_LABEL = {
  [MODEL_EMISSION_BORDER_TYPE.HALF]: I18N.carbonFootprint3.halfLifeCycle2,
  [MODEL_EMISSION_BORDER_TYPE.WHOLE]: I18N.carbonFootprint3.fullLifecycle2,
} as const;

export const QUICK_MODEL_MENUS_CODE_NAME = [
  I18N.carbonFootprint.rawMaterialAcquisition,
  I18N.carbonFootprint.productionAndManufacturing,
  I18N.carbonFootprint3.distributionAndStorage,
  I18N.carbonFootprint.productUsage,
  I18N.carbonFootprint.abandonedDisposal,
];

export const URL_QUICK_MODEL_KEY = {
  IS_EDIT: 'isEdit',
  FORM_VALUES: 'formValues',
  MENU_ACTIVE: 'menuActive',
  DETAIL_ID: 'detailId',
  FACTOR_UNIT_M: 'factorUnitM',
} as const;
