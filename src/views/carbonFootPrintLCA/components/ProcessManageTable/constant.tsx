import I18N from '@src/lang/I18N';

/** 生命周期阶段 */
export const LIFE_CYCLE_TYPE = {
  /** 原材料获取及预加工 */
  RAW_MATERIAL: 1,
  /** 生产制造 */
  PRODUCTION_MANUFACTURING: 2,
  /** 分销和储存 */
  DISTRIBUTION_STORAGE: 3,
  /** 产品使用 */
  PRODUCT_USE: 4,
  /** 寿命终止处理 */
  WASTE_DISPOSAL: 5,
} as const;

const {
  RAW_MATERIAL,
  PRODUCTION_MANUFACTURING,
  DISTRIBUTION_STORAGE,
  PRODUCT_USE,
  WASTE_DISPOSAL,
} = LIFE_CYCLE_TYPE;

/** 生命周期阶段对应的输入名称 */
export const LIFE_CYCLE_LABLE = {
  [RAW_MATERIAL]: I18N.carbonFootPrintLCA.rawMaterial,
  [PRODUCTION_MANUFACTURING]: I18N.carbonFootPrintLCA.input,
  [DISTRIBUTION_STORAGE]: I18N.carbonFootPrintLCA.distributionScenarios,
  [PRODUCT_USE]: I18N.carbonFootPrintLCA.usageScenarios,
  [WASTE_DISPOSAL]: I18N.carbonFootPrintLCA.input,
} as const;

/** 过程管理的类别  */
export const PROCESS_CATEGORY = {
  /** 输入  */
  INPUT: 1,
  /** 输出 */
  OUTPUT: 2,
  /** 产品 */
  PRODUCTION: 3,
} as const;

const { INPUT, OUTPUT, PRODUCTION } = PROCESS_CATEGORY;

/** 过程管理的类别名称 */
export const PROCESS_CATEGORY_LABEL = {
  [INPUT]: I18N.carbonFootPrintLCA.input,
  [OUTPUT]: I18N.carbonFootPrintLCA.output,
  [PRODUCTION]: I18N.carbonFootPrintLCA.researchObject2,
};

/** 其他关联抽屉标题 */
export const OTHER_CONNECT_TITLE = I18N.carbonFootPrintLCA.otherAssociations;

/** 研究对象类型 */
export const RESEARCH_OBJECT_TYPE = {
  /** - */
  EMPTY: 0,
  /** 主要研究对象 */
  MAIN_RESEARCH_OBJECT: 1,
  /** 主产品 */
  MAIN_PRODUCT: 2,
  /** 副产品 */
  BY_PRODUCT: 3,
} as const;
const { EMPTY, MAIN_RESEARCH_OBJECT, MAIN_PRODUCT, BY_PRODUCT } =
  RESEARCH_OBJECT_TYPE;

/** 研究对象类型对应的名称 */
export const RESEARCH_OBJECT_TYPE_NAME = {
  /** - */
  [EMPTY]: '-',
  /** 主要研究对象 */
  [MAIN_RESEARCH_OBJECT]: I18N.carbonFootPrintLCA.theMainResearchFocusesOn,
  /** 主产品 */
  [MAIN_PRODUCT]: I18N.carbonFootPrintLCA.mainProduct,
  /** 副产品 */
  [BY_PRODUCT]: I18N.carbonFootPrintLCA.byProduct,
};

/** 研究对象类型 */
export const RESEARCH_OBJECT_OPTION = [
  {
    value: EMPTY,
    label: '-',
  },
  {
    value: MAIN_PRODUCT,
    label: RESEARCH_OBJECT_TYPE_NAME[MAIN_PRODUCT],
  },
  {
    value: BY_PRODUCT,
    label: RESEARCH_OBJECT_TYPE_NAME[BY_PRODUCT],
  },
];
