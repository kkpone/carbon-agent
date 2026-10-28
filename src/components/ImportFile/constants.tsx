/** 模版文件类型 */
export const TEMPLATE_FILE_TYPE = {
  /** LCA-模型导入（中文） */
  LCA_MODEL_ZH: 1,
  /** LCA-模型导入（英文） */
  LCA_MODEL_EN: 2,
  /** 供应链-产品导入（中文） */
  SUPPLY_PRODUCT_ZH: 3,
  /** 供应链-产品导入（英文） */
  SUPPLY_PRODUCT_EN: 4,
  /** 供应链-供应商导入（中文） */
  SUPPLY_SUPPLIER_ZH: 5,
  /** 供应链-供应商导入（英文） */
  SUPPLY_SUPPLIER_EN: 6,
  /** LCA-BOM导入（中文） */
  BOM_ZH: 7,
  /** 距离计算-导入模版（中文） */
  DISTANCE_CALC_ZH: 8,
  /** LCA-数据集批量导入-导入模版（中文） */
  DATA_SET_ZH: 9,
  /** LCA-供应商数据导入-导入模版（中文） */
  LCA_SUPPLY_ZH: 11,
  /** LCA-生命周期导入-导入模版 */
  LCA_LIFE_CYCLE: 12,
};

/** 导入记录类型-ImportType */
export const IMPORT_RECORD_TYPE = {
  /** 供应链-供应商导入记录 */
  SUPPLY_SUPPLIER: '1',
  /** 供应链=采购产品导入记录 */
  SUPPLY_PRODUCT: '2',
  /** 企业碳核算-排放数据填报导入 */
  CARBON_ACCOUNT_FILL_DATA: '3',
  /** LCA-模型导入记录 */
  LCA_MODEL: '4',
  /** LCA-BOM导入记录 */
  BOM: '5',
  /** 距离计算-计算结果 */
  DISTANCE_CALC: '6',
  /** LCA-数据集批量导入 */
  DATA_SET: '7',
  /** 产品数字护照-单个产品导入 */
  PRODUCT_PASSPORT_SINGLE: '8',
  /** LCA-供应商数据导入 */
  SUPPLIER_DATA: '9',
  /** LCA-结果解释-数据质量评价-导入评分 */
  LCA_DATA_QUALITY_RATING: '10',
  /** LCA-生命周期导入-导入记录 */
  LIFE_CYCLE_DATA: '12',
};

/** 导入状态 */
export const IMPORT_STATUS = {
  /** 导入中 */
  PENDING: 0,
  /** 导入成功 */
  IMPORTED: 1,
  /** 导入失败 */
  FAILED: -1,
};
