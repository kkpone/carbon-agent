import I18N from '@src/lang/I18N';

export const TAB_TYPE = {
  /** 一般信息 */
  GENERAL_INFO: '1',
  /** 工业过程 */
  INDUSTRY_PROCESS: '2',
  /** 热电联产 */
  HEAT_POWER: '8',
  /** 产品数据 */
  PRODUCT_DATA: '3',
  /** 外售产品信息 */
  PRODUCT_SALE_INFO: '4',
  /** 碳税计算 */
  CARBON_TAX_CALC: '5',
  /** 数据质量及其他 */
  DATA_QUALITY_OTHER: '6',
  /** 结果汇总 */
  RESULT_SUMMARY: '7',
} as const;

const {
  GENERAL_INFO,
  INDUSTRY_PROCESS,
  HEAT_POWER,
  PRODUCT_DATA,
  PRODUCT_SALE_INFO,
  CARBON_TAX_CALC,
  DATA_QUALITY_OTHER,
  RESULT_SUMMARY,
} = TAB_TYPE;

export const TAB_OPTIONS = () => [
  {
    key: GENERAL_INFO,
    label: I18N.cbam.generalInformation,
  },
  {
    key: INDUSTRY_PROCESS,
    label: I18N.cbam.industrialProcesses,
    disabled: true,
  },
  {
    key: HEAT_POWER,
    label: I18N.cbam.combinedHeatAndPowerGeneration,
    disabled: true,
    hidden: true,
  },
  {
    key: PRODUCT_DATA,
    label: I18N.cbam.productData,
    disabled: true,
  },
  {
    key: PRODUCT_SALE_INFO,
    label: I18N.cbam.externalSalesProductLetter2,
    disabled: true,
  },
  {
    key: CARBON_TAX_CALC,
    label: I18N.cbam.carbonTaxCalculation,
    disabled: true,
  },
  {
    key: DATA_QUALITY_OTHER,
    label: I18N.cbam.dataQualityAnd2,
    disabled: true,
  },
  {
    key: RESULT_SUMMARY,
    label: I18N.cbam.resultsSummary,
    disabled: true,
  },
];

/** 工序配置状态 */
export const PROCESS_SET_STATUS = {
  /** 未填写排放数据 */
  NOT_FILL: 0,
  /** 已填写 */
  FILLED: 1,
};

/** 前体配置状态 */
export const PRECURSOR_SET_STATUS = {
  /** 未填写排放数据 */
  NOT_FILL: 0,
  /** 已填写 */
  FILLED: 1,
  /** 待发起供应商收数 */
  PENDING_COLLECTION: 2,
  /** 供应商填报中 */
  FILLING: 3,
  /** 供应商数据待审批 */
  PENDING_APPROVAL: 4,
  /** 供应商数据收集完毕 */
  COLLECTED: 5,
};

/** 供应商填写方式枚举 */
export const FILL_WAY_ENUM = {
  /** 手动填写 */
  MANUAL: 1,
  /** 未知，由供应商填写 */
  SUPPLY_FILL: 2,
} as const;

/** 供应商填写方式option */
export const FILL_WAY_OPTIONS = [
  {
    label: I18N.cbam.manuallyFillIn,
    value: FILL_WAY_ENUM.MANUAL,
  },
  {
    label: I18N.cbam.unknownBySupply,
    value: FILL_WAY_ENUM.SUPPLY_FILL,
  },
];

/** 碳税计算状态 */
export const CARBON_TAX_CALC_STATUS = {
  /** 未计算 */
  NOT_CALC: 0,
  /** 计算中 */
  CALC_ING: 1,
  /** 计算完成 */
  CALC_END: 2,
  /** 版本不一致 */
  VERSION_NOT_SAME: 3,
} as const;

/** 详情来源 */
export const INFO_SOURCE = {
  /** CBAM工具 */
  CBAM: '1',
};
