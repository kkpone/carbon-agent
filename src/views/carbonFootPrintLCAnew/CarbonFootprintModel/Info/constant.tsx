import I18N from '@src/lang/I18N';
/** 步骤类型 */
export const STEP_TYPE = {
  /** 目标与范围 */
  OBJECTIVES_SCOPE: 0,
  /** 清单分析 */
  INVENTORY_ANALYSIS: 1,
  /** 影响评价 */
  IMPACT_ASSESSMENT: 2,
  /** 结果解释 */
  RESULTS_INTERPRETATION: 3,
} as const;

/** 输入输出类型 */
export const IO_TYPE = {
  /** 输入 */
  INPUT: 1,
  /** 输出 */
  OUTPUT: 2,
};
const { INPUT, OUTPUT } = IO_TYPE;
/** 输入输出名称 */
export const IO_TYPE_NAME = {
  /** 输入 */
  [INPUT]: I18N.carbonFootPrintLCA.input,
  /** 输出 */
  [OUTPUT]: I18N.carbonFootPrintLCA.output,
};

/** 输入输出类型option */
export const IO_TYPE_OPTION = [
  {
    label: I18N.carbonFootPrintLCA.input,
    value: IO_TYPE.INPUT,
  },
  {
    label: I18N.carbonFootPrintLCA.output,
    value: IO_TYPE.OUTPUT,
  },
];

/** 详情来源 */
export const INFO_SOURCE = {
  /** 环境足迹模型 */
  LCA_MODEL: '1',
};

/** 生命周期阶段 */
export const LIFE_CYCLE_TYPE = {
  /** 生产阶段 */
  PRODUCTION_STAGE: 2,
  /** 产品生产阶段 */
  PRODUCT_STAGE: 2,
};

/** 输出类型 */
export const LIST_OUTPUT_TYPE = {
  /** 普通输出 */
  NORMAL: 1,
  /** 多重引用主输出 */
  MULTI_MAIN: 2,
  /** 多重引用子输出 */
  MULTI_SUB: 3,
};
