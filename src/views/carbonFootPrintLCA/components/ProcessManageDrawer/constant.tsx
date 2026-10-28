import I18N from '@src/lang/I18N';

/** 产品类型 */
export const PRODUCTION_TYPE = {
  /** 主产品 */
  MAIN_PRODUCT: 1,
  /** 副产品 */
  SIDE_PRODUCT: 2,
  /** 避免产品 */
  AVOID_PRODUCT: 3,
} as const;

const { MAIN_PRODUCT, SIDE_PRODUCT, AVOID_PRODUCT } = PRODUCTION_TYPE;

/** 产品类型的枚举值 */
export const PRODUCTION_TYPE_OPTIONS = [
  {
    label: I18N.carbonFootPrintLCA.mainProduct,
    value: MAIN_PRODUCT,
  },
  {
    label: I18N.carbonFootPrintLCA.byProduct,
    value: SIDE_PRODUCT,
  },
  {
    label: I18N.carbonFootPrintLCA.avoidProducts,
    value: AVOID_PRODUCT,
  },
];

/** 输入类型 */
export const INPUT_TYPE = {
  /** 原材料 */
  RAW_MATERIAL: 1,
  /** 耗材 */
  CONSUMABLES: 2,
  /** 包装材料 */
  PACKAGING: 3,
  /** 能耗 */
  ENERGY_CONSUMPTION: 4,
  /** 水耗 */
  WATER_CONSUMPTION: 5,
  /** 运输 */
  TRANSPORT: 6,
  /** 资本货物 **/
  CAPITAL_GOODS: 7,
  /** 处置产品 */
  DISPOSAL_PRODUCTS: 8,
} as const;

const {
  RAW_MATERIAL,
  CONSUMABLES,
  PACKAGING,
  ENERGY_CONSUMPTION,
  WATER_CONSUMPTION,
  TRANSPORT,
  CAPITAL_GOODS,
  DISPOSAL_PRODUCTS,
} = INPUT_TYPE;

/** 输入类型的枚举值 */
export const INPUT_TYPE_OPTIONS = [
  {
    label: I18N.carbonFootPrintLCA.rawMaterial,
    value: RAW_MATERIAL,
  },
  {
    label: I18N.carbonFootPrintLCA.consumables,
    value: CONSUMABLES,
  },
  {
    label: I18N.carbonFootPrintLCA.packingMaterial,
    value: PACKAGING,
  },
  {
    label: I18N.carbonFootPrintLCA.energyConsumption,
    value: ENERGY_CONSUMPTION,
  },
  {
    label: I18N.carbonFootPrintLCA.waterConsumption,
    value: WATER_CONSUMPTION,
  },
  {
    label: I18N.carbonFootPrintLCA.transport,
    value: TRANSPORT,
  },
  {
    label: I18N.carbonFootPrintLCA.capitalGoods,
    value: CAPITAL_GOODS,
  },
  {
    label: I18N.carbonFootPrintLCA.disposalOfProducts,
    value: DISPOSAL_PRODUCTS,
  },
];

/** 生命周期阶段 */
export const LIFE_CYCLE_STAGES = {
  /** 原材料阶段（包括资源开采和运输） */
  RAW_MATERIAL_STAGE: 1,
  /** 包装材料阶段 */
  PACKING_MATERIAL: 2,
  /** 入厂运输阶段 */
  INBOUND_TRANSPORTATION: 3,
  /** 生产制造 */
  PRODUCTION_MANUFACTURING: 4,
  /** 废弃物阶段（包括废物处理和处置） */
  WASTE_DISPOSAL: 5,
  /** 分销阶段 */
  DISTRIBUTION_STORAGE: 6,
  /** 使用阶段 */
  PRODUCT_USE: 7,
  /** 生命终结阶段 */
  END_LIFE: 8,
} as const;

const {
  RAW_MATERIAL_STAGE,
  PACKING_MATERIAL,
  INBOUND_TRANSPORTATION,
  PRODUCTION_MANUFACTURING,
  WASTE_DISPOSAL,
  DISTRIBUTION_STORAGE,
  PRODUCT_USE,
  END_LIFE,
} = LIFE_CYCLE_STAGES;

/** 生命周期阶段的枚举 */
export const LIFE_CYCLE_OPTIONS = [
  {
    label: I18N.supplyChainCarbonManagement.rawMaterialStage,
    value: RAW_MATERIAL_STAGE,
  },
  {
    label: I18N.supplyChainCarbonManagement.packagingMaterialLevel,
    value: PACKING_MATERIAL,
  },
  {
    label: I18N.supplyChainCarbonManagement.entryTransportationStage,
    value: INBOUND_TRANSPORTATION,
  },
  {
    label: I18N.carbonFootPrintLCA.productionAndManufacturing,
    value: PRODUCTION_MANUFACTURING,
  },
  {
    label: I18N.supplyChainCarbonManagement.wasteStage,
    value: WASTE_DISPOSAL,
  },
  {
    label: I18N.supplyChainCarbonManagement.distributionStage,
    value: DISTRIBUTION_STORAGE,
  },
  {
    label: I18N.supplyChainCarbonManagement.usageStage,
    value: PRODUCT_USE,
  },
  {
    label: I18N.supplyChainCarbonManagement.endOfLifeStage,
    value: END_LIFE,
  },
];

/** 运输类型 */
export const TRANSPORT_TYPE = {
  /** 按里程 */
  MILEAGE: 1,
  /** 按能耗 */
  ENERGY: 2,
};

const { MILEAGE, ENERGY } = TRANSPORT_TYPE;

/** 运输枚举  */
export const TRANSPORT_TYPE_OPTIONS = [
  {
    label: I18N.carbonFootPrintLCA.byMileage,
    value: MILEAGE,
  },
  {
    label: I18N.carbonFootPrintLCA.accordingToEnergyConsumption,
    value: ENERGY,
  },
];

/** 输出类型 */
export const OUTPUT_TYPE = {
  /** 废气 */
  WASTE_GAS: 9,
  /** 废水 */
  WASTE_WATER: 10,
  /** 固体废弃物 */
  WASTE: 11,
  /** 可再生输出物 */
  RENEWABLE_OUTPUTS: 12,
  /** 待处理输出物 */
  PROCESSED_OUTPUTS: 13,
  /** 有价值的输出物 */
  VALUABLE_OUTPUTS: 14,
} as const;

const {
  WASTE_GAS,
  WASTE_WATER,
  WASTE,
  RENEWABLE_OUTPUTS,
  PROCESSED_OUTPUTS,
  VALUABLE_OUTPUTS,
} = OUTPUT_TYPE;

/** 输出类型的枚举值 */
export const OUTPUT_TYPE_OPTIONS = [
  {
    label: I18N.carbonFootPrintLCA.wasteGas,
    value: WASTE_GAS,
  },
  {
    label: I18N.carbonFootPrintLCA.wasteWater,
    value: WASTE_WATER,
  },
  {
    label: I18N.carbonFootPrintLCA.solidWaste,
    value: WASTE,
  },
  {
    label: I18N.carbonFootPrintLCA.renewableOutput,
    value: RENEWABLE_OUTPUTS,
  },
  {
    label: I18N.carbonFootPrintLCA.pendingOutput,
    value: PROCESSED_OUTPUTS,
  },
  {
    label: I18N.carbonFootPrintLCA.valuableLosses,
    value: VALUABLE_OUTPUTS,
  },
];

/** 节点类型 */
export const NODE_TYPE = {
  /** 阶段 */
  STAGE_NODE: 1,
  /** 过程 */
  PROCESS_NODE: 2,
  /** 输入输出 */
  IO_NODE: 3,
} as const;

/** 上下游数据选择按钮的类型 */
export const SELECT_BUTTON_TYPE = {
  /** 过程数据 */
  PROCESS_DATA: 1,
  /** 模型引用 */
  MODEL_REFERENCE: 2,
  /** 数据库数据 */
  DATABASE_DATA: 3,
  /** 引用供应商结果数据 */
  SUPPLIER_DATA: 4,
  /** 自建因子 */
  FACTOR_DATA: 5,
} as const;

const {
  PROCESS_DATA,
  MODEL_REFERENCE,
  DATABASE_DATA,
  SUPPLIER_DATA,
  FACTOR_DATA,
} = SELECT_BUTTON_TYPE;

/** 选择按钮的枚举 */
export const SELECT_BUTTON_OPTIONS = [
  {
    label: I18N.carbonFootPrintLCA.processData,
    value: PROCESS_DATA,
  },
  {
    label: I18N.carbonFootPrintLCA.modelReference,
    value: MODEL_REFERENCE,
  },
  {
    label: I18N.carbonFootPrintLCA.databaseData,
    value: DATABASE_DATA,
  },
  // {
  //   label: I18N.carbonFootPrintLCA.referencingSuppliers,
  //   value: SUPPLIER_DATA,
  // },
  {
    label: I18N.carbonFootPrintLCA.selfBuiltFactor,
    value: FACTOR_DATA,
  },
];

/** 选择按钮的枚举-有价值的输出物 */
export const SELECT_BUTTON_OPTIONS_VALUES = [
  {
    label: I18N.carbonFootPrintLCA.databaseData,
    value: DATABASE_DATA,
  },
  {
    label: I18N.carbonFootPrintLCA.referencingSuppliers,
    value: SUPPLIER_DATA,
  },
  {
    label: I18N.carbonFootPrintLCA.selfBuiltFactor,
    value: FACTOR_DATA,
  },
];

/** 选择按钮的枚举-多重引用的输出 */
export const SELECT_BUTTON_OPTIONS_REF = [
  {
    label: I18N.carbonFootPrintLCA.processData,
    value: PROCESS_DATA,
  },
  {
    label: I18N.carbonFootPrintLCA.modelReference,
    value: MODEL_REFERENCE,
  },
];

/** 质量换算系数对应的数量单位的输入值  */
export const WEIGHT_RADIO_COUNT_UNIT = {
  /** 吨 */
  T: 't',
  /** 千克 */
  KG: 'kg',
  /** 克 */
  G: 'g',
};
/** 质量换算系数默认的unitTo的值 */
export const defaultUnitTo = '2';
