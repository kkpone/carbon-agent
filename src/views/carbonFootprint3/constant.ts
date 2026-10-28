import EmissionAssistant from '@src/assets/svg/carbonFootprint/graph/graph_assistant.svg';
import EmissionDiscardGas from '@src/assets/svg/carbonFootprint/graph/graph_discard_gas.svg';
import EmissionDiscardRecycled from '@src/assets/svg/carbonFootprint/graph/graph_discard_recycled.svg';
import EmissionDiscardSolid from '@src/assets/svg/carbonFootprint/graph/graph_discard_solid.svg';
import EmissionDiscardWater from '@src/assets/svg/carbonFootprint/graph/graph_discard_water.svg';
import EmissionEnergy from '@src/assets/svg/carbonFootprint/graph/graph_energy.svg';
import lifeCycleDistribution from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_distribution.svg';
import lifeCycleMaterial from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_material.svg';
import lifeCycleProduct from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_product.svg';
import lifeCycleUse from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_use.svg';
import lifeCycleWasteDisposal from '@src/assets/svg/carbonFootprint/graph/graph_lifeCycle_wasteDisposal.svg';
import EmissionMain from '@src/assets/svg/carbonFootprint/graph/graph_main.svg';
import EmissionDiscardOther from '@src/assets/svg/carbonFootprint/graph/graph_other.svg';
import EmissionPackaging from '@src/assets/svg/carbonFootprint/graph/graph_packaging.svg';
import ProcessICON from '@src/assets/svg/carbonFootprint/graph/graph_process.svg';
import EmissionRecycle from '@src/assets/svg/carbonFootprint/graph/graph_recycle.svg';
import EmissionTrans from '@src/assets/svg/carbonFootprint/graph/graph_tans.svg';
import EmissionWaterEnergy from '@src/assets/svg/carbonFootprint/graph/graph_water.svg';
import I18N from '@src/lang/I18N';
import { createI18nLabelMap } from '@src/lang/createI18nLabelMap';

/**
 * @description 快速核算生命周期
 */
export const QUICK_ACCOUNT_LIFE_CYCLE = {
  MATERIAL: 0,
  PRODUCT: 1,
  DISTRIBUTION: 2,
  USE: 3,
  WASTE_DISPOSAL: 4,
} as const;

export const QUICK_ACCOUNT_LIFE_CYCLE_LABEL = () =>
  ({
    [QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL]:
      I18N.carbonFootprint.rawMaterialAcquisition,
    [QUICK_ACCOUNT_LIFE_CYCLE.PRODUCT]:
      I18N.carbonFootprint.productionAndManufacturing,
    [QUICK_ACCOUNT_LIFE_CYCLE.DISTRIBUTION]:
      I18N.carbonFootprint3.distributionAndStorage,
    [QUICK_ACCOUNT_LIFE_CYCLE.USE]: I18N.carbonFootprint.productUsage,
    [QUICK_ACCOUNT_LIFE_CYCLE.WASTE_DISPOSAL]:
      I18N.carbonFootprint.abandonedDisposal,
  } as const);

export const PROCESS_ACCOUNT_LIFE_CYCLE_LABEL = () =>
  ({
    [QUICK_ACCOUNT_LIFE_CYCLE.PRODUCT]:
      I18N.carbonFootprint.productionAndManufacturing,
    [QUICK_ACCOUNT_LIFE_CYCLE.DISTRIBUTION]:
      I18N.carbonFootprint3.distributionAndStorage,
    [QUICK_ACCOUNT_LIFE_CYCLE.USE]: I18N.carbonFootprint.productUsage,
    [QUICK_ACCOUNT_LIFE_CYCLE.WASTE_DISPOSAL]:
      I18N.carbonFootprint.abandonedDisposal,
  } as const);

export const QUICK_ACCOUNT_LIFE_CYCLE_ICON_MAP = {
  [QUICK_ACCOUNT_LIFE_CYCLE.MATERIAL]: lifeCycleMaterial,
  [QUICK_ACCOUNT_LIFE_CYCLE.PRODUCT]: lifeCycleProduct,
  [QUICK_ACCOUNT_LIFE_CYCLE.DISTRIBUTION]: lifeCycleDistribution,
  [QUICK_ACCOUNT_LIFE_CYCLE.USE]: lifeCycleUse,
  [QUICK_ACCOUNT_LIFE_CYCLE.WASTE_DISPOSAL]: lifeCycleWasteDisposal,
} as const;

export const PROCESS_ACCOUNT_LIFE_CYCLE_ICON_MAP = {
  0: ProcessICON,
  101: lifeCycleProduct,
  102: lifeCycleDistribution,
  103: lifeCycleUse,
  104: lifeCycleWasteDisposal,
} as const;

export const PROCESS_ACCOUNT_LIFE_CYCLE_LABEL_MAP = createI18nLabelMap({
  0: () => I18N.carbonFootprint3.unitProcess,
  101: () => I18N.carbonFootprint.productionAndManufacturing,
  102: () => I18N.carbonFootprint3.distributionAndStorage,
  103: () => I18N.carbonFootprint.productUsage,
  104: () => I18N.carbonFootprint.abandonedDisposal,
});

export const ACCOUNT_RESULT_LIFE_CYCLE_ICON_MAP = {
  1: lifeCycleProduct,
  2: lifeCycleDistribution,
  3: lifeCycleUse,
  4: lifeCycleWasteDisposal,
} as const;

/**
 * @description 输入和排放源
 */
export const EMISSION_TYPE_OPTIONS = {
  MAIN: 1,
  ASSISTANT: 2,
  PACKAGING: 3,
  RECYCLE: 4,
  ENERGY: 5,
  WATER_ENERGY: 6,
  TRANS: 7,
} as const;
const EMISSION_TYPE_OPTIONS_LABEL = () =>
  ({
    [EMISSION_TYPE_OPTIONS.MAIN]: I18N.carbonFootprint.mainMaterials,
    [EMISSION_TYPE_OPTIONS.ASSISTANT]: I18N.carbonFootprint.accessories,
    [EMISSION_TYPE_OPTIONS.PACKAGING]: I18N.carbonFootprint3.packingMaterial,
    [EMISSION_TYPE_OPTIONS.RECYCLE]: I18N.carbonFootprint3.recycledMaterials,
    [EMISSION_TYPE_OPTIONS.ENERGY]: I18N.carbonFootprint.energyConsumption2,
    [EMISSION_TYPE_OPTIONS.WATER_ENERGY]:
      I18N.carbonFootprint3.waterConsumption,
    [EMISSION_TYPE_OPTIONS.TRANS]: I18N.carbonFootprint.transport,
  } as const);

/**
 * @description 输出类型
 */
const EXPORT_TYPE_OPTIONS = {
  GAS_WASTE: 21,
  WATER_WASTE: 22,
  SOLID_WASTE: 23,
  RECYCLED_WASTE: 24,
  OTHER: 41,
} as const;
const EXPORT_TYPE_OPTIONS_LABEL = () =>
  ({
    [EXPORT_TYPE_OPTIONS.GAS_WASTE]: I18N.carbonFootprint3.wasteGas,
    [EXPORT_TYPE_OPTIONS.WATER_WASTE]: I18N.carbonFootprint3.wasteWater,
    [EXPORT_TYPE_OPTIONS.SOLID_WASTE]: I18N.carbonFootprint3.solidWaste,
    [EXPORT_TYPE_OPTIONS.RECYCLED_WASTE]: I18N.carbonFootprint3.renewableWaste,
    [EXPORT_TYPE_OPTIONS.OTHER]: I18N.carbonFootprint3.other,
  } as const);

/**
 * @description 排放源的所有类型
 */
export const ALL_EMISSION = {
  ...EMISSION_TYPE_OPTIONS,
  ...EXPORT_TYPE_OPTIONS,
} as const;

export const ALL_EMISSION_LABEL = () =>
  ({
    ...EMISSION_TYPE_OPTIONS_LABEL(),
    ...EXPORT_TYPE_OPTIONS_LABEL(),
  } as const);

/** 排放源类别对应的iconImg */
export const QUICK_ACCOUNT_EMISSION_ICON_MAP = {
  [ALL_EMISSION.MAIN]: EmissionMain,
  [ALL_EMISSION.ASSISTANT]: EmissionAssistant,
  [ALL_EMISSION.PACKAGING]: EmissionPackaging,
  [ALL_EMISSION.RECYCLE]: EmissionRecycle,
  [ALL_EMISSION.ENERGY]: EmissionEnergy,
  [ALL_EMISSION.WATER_ENERGY]: EmissionWaterEnergy,
  [ALL_EMISSION.TRANS]: EmissionTrans,
  [ALL_EMISSION.GAS_WASTE]: EmissionDiscardGas,
  [ALL_EMISSION.WATER_WASTE]: EmissionDiscardWater,
  [ALL_EMISSION.SOLID_WASTE]: EmissionDiscardSolid,
  [ALL_EMISSION.RECYCLED_WASTE]: EmissionDiscardRecycled,
  [ALL_EMISSION.OTHER]: EmissionDiscardOther,
} as const;

/** 排放源类别对应的颜色 - 目前使用在数据概览的病状图 */
export const ALL_EMISSION_COLOR_MAP = {
  [ALL_EMISSION.MAIN]: '#ED5555',
  [ALL_EMISSION.ASSISTANT]: '#FA8202',
  [ALL_EMISSION.PACKAGING]: '#FFD702',
  [ALL_EMISSION.RECYCLE]: '#0CBF9F',
  [ALL_EMISSION.ENERGY]: '#00C8C5',
  [ALL_EMISSION.WATER_ENERGY]: '#00B1F8',
  [ALL_EMISSION.TRANS]: '#1287F9',
  [ALL_EMISSION.GAS_WASTE]: '#695BE7',
  [ALL_EMISSION.WATER_WASTE]: '#DEDEDE',
  [ALL_EMISSION.SOLID_WASTE]: '#F06E6E',
  [ALL_EMISSION.RECYCLED_WASTE]: '#FBA93E',
  [ALL_EMISSION.OTHER]: '#89A0AC',
} as const;

/** 排放源类别对应的iconFont */
export const QUICK_ACCOUNT_EMISSION_ICONFONT_MAP = {
  [ALL_EMISSION.MAIN]: {
    icon: 'icon-icon_zhuliao',
    color: 'rgb(53,145,251)',
  },
  [ALL_EMISSION.ASSISTANT]: {
    icon: 'icon-icon_fuliao',
    color: 'rgb(53,145,251)',
  },
  [ALL_EMISSION.PACKAGING]: {
    icon: 'icon-icon_baozhuangcailiao',
    color: '#FFD702',
  },
  [ALL_EMISSION.RECYCLE]: {
    icon: 'icon-icon_kezaishengfeiliao',
    color: '#0CBF9F',
  },
  [ALL_EMISSION.ENERGY]: {
    icon: 'icon-icon_nenghao',
    color: '#00C8C5',
  },
  [ALL_EMISSION.WATER_ENERGY]: {
    icon: 'icon-icon_shuihao',
    color: '#00B1F8',
  },
  [ALL_EMISSION.TRANS]: {
    icon: 'icon-icon_yunshu',
    color: '#1287F9',
  },
  [ALL_EMISSION.GAS_WASTE]: {
    icon: 'icon-icon_feiqi',
    color: '#695BE7',
  },
  [ALL_EMISSION.WATER_WASTE]: {
    icon: 'icon-icon_feishui',
    color: '#DEDEDE',
  },
  [ALL_EMISSION.SOLID_WASTE]: {
    icon: 'icon-icon_gutifeiqiwu',
    color: '#F06E6E',
  },
  [ALL_EMISSION.RECYCLED_WASTE]: {
    icon: 'icon-icon_kezaishengfeiliao',
    color: '#3FBA93E',
  },
  [ALL_EMISSION.OTHER]: {
    icon: 'icon-icon_qitapaifangyuan',
    color: '#89A0AC',
  },
};

/** 生命周期节点的渐变样式 */
export const LIFE_CYCLE_ROOT_INFO = {
  FILL: 'l(90) 0:#F7F8F9 1:#FFF',
};

/** 主料信息 */
const EMISSION_MAIN_INFO = {
  ICON: EmissionMain,
  FILL: 'l(90) 0:#EAF7FF 1:#FFF',
};

/** 辅料材料 */
const EMISSION_ASSISTANT_INFO = {
  ICON: EmissionAssistant,
  FILL: 'l(90) 0:#FDEEEF 1:#FFF',
};

/** 运输信息 */
const EMISSION_TRANS_INFO = {
  ICON: EmissionTrans,
  FILL: 'l(90) 0:#FEF3EC 1:#FFF',
};

/** 能耗信息 */
const EMISSION_ENERGY_INFO = {
  ICON: EmissionEnergy,
  FILL: 'l(90) 0:#F0EFFF 1:#FFF',
};

/** 包装材料 */
const EMISSION_PACKAGING_INFO = {
  ICON: EmissionPackaging,
  FILL: 'l(90) 0:#FEF3F1 1:#FFF',
};

/** 可再生材料 */
const EMISSION_RECYCLE_INFO = {
  ICON: EmissionRecycle,
  FILL: 'l(90) 0:#E7FCF4 1:#FFF',
};

/** 水耗材料 */
const EMISSION_WATER_ENERGY_INFO = {
  ICON: EmissionWaterEnergy,
  FILL: 'l(90) 0:#EBF8FD 1:#FFF',
};

/** 废弃相关 */
const EMISSION_DISCARD_INFO = {
  FILL: 'l(90) 0:#EEF1F2 1:#FFF',
};

/** 废气 */
const EMISSION_DISCARD_GAS_INFO = {
  ICON: EmissionDiscardGas,
  FILL: EMISSION_DISCARD_INFO.FILL,
};

/** 废水 */
const EMISSION_DISCARD_WATER_INFO = {
  ICON: EmissionDiscardWater,
  FILL: EMISSION_DISCARD_INFO.FILL,
};

/** 固体废弃物 */
const EMISSION_DISCARD_SOLID_INFO = {
  ICON: EmissionDiscardSolid,
  FILL: EMISSION_DISCARD_INFO.FILL,
};

/** 可再生废料 */
const EMISSION_DISCARD_RECYCLED_INFO = {
  ICON: EmissionDiscardRecycled,
  FILL: EMISSION_DISCARD_INFO.FILL,
};

/** 其他 */
const EMISSION_OTHER_RECYCLED_INFO = {
  ICON: EmissionDiscardOther,
  FILL: EMISSION_DISCARD_INFO.FILL,
};

/** 排放源类别对应的信息 */
export const QUICK_ACCOUNT_EMISSION_INFO_MAP = {
  [ALL_EMISSION.MAIN]: EMISSION_MAIN_INFO,
  [ALL_EMISSION.ASSISTANT]: EMISSION_ASSISTANT_INFO,
  [ALL_EMISSION.PACKAGING]: EMISSION_PACKAGING_INFO,
  [ALL_EMISSION.RECYCLE]: EMISSION_RECYCLE_INFO,
  [ALL_EMISSION.ENERGY]: EMISSION_ENERGY_INFO,
  [ALL_EMISSION.WATER_ENERGY]: EMISSION_WATER_ENERGY_INFO,
  [ALL_EMISSION.TRANS]: EMISSION_TRANS_INFO,
  [ALL_EMISSION.GAS_WASTE]: EMISSION_DISCARD_GAS_INFO,
  [ALL_EMISSION.WATER_WASTE]: EMISSION_DISCARD_WATER_INFO,
  [ALL_EMISSION.SOLID_WASTE]: EMISSION_DISCARD_SOLID_INFO,
  [ALL_EMISSION.RECYCLED_WASTE]: EMISSION_DISCARD_RECYCLED_INFO,
  [ALL_EMISSION.OTHER]: EMISSION_OTHER_RECYCLED_INFO,
} as const;

/** 全部排放源展示的icon 包含0 单元过程的标签 */
export const ALL_EMISSIONS_ICON_MAP = {
  0: {
    ICON: ProcessICON,
    FILL: 'l(90) 0:#F7F8F9 1:#FFF',
  },
  ...QUICK_ACCOUNT_EMISSION_INFO_MAP,
} as const;

/**
 * @description 快速核算生命周期下的所有排放源类别
 */
export const QUICK_ACCOUNT_EMISSION = {
  MAIN: 1,
  ASSISTANT: 2,
  PACKAGING: 3,
  RECYCLE: 4,
  ENERGY: 5,
  WATER_ENERGY: 6,
  TRANS: 7,
  PROCESS: 8,
  DS: 9,
  USE: 10,
  WASTE_DISPOSAL: 11,
  OTHER: 41,
} as const;

export const QUICK_ACCOUNT_EMISSION_LABEL = createI18nLabelMap({
  [QUICK_ACCOUNT_EMISSION.MAIN]: () => I18N.carbonFootprint.mainMaterials,
  [QUICK_ACCOUNT_EMISSION.ASSISTANT]: () => I18N.carbonFootprint.accessories,
  [QUICK_ACCOUNT_EMISSION.PACKAGING]: () =>
    I18N.carbonFootprint3.packingMaterial,
  [QUICK_ACCOUNT_EMISSION.RECYCLE]: () =>
    I18N.carbonFootprint3.recycledMaterials,
  [QUICK_ACCOUNT_EMISSION.ENERGY]: () =>
    I18N.carbonFootprint.energyConsumption2,
  [QUICK_ACCOUNT_EMISSION.WATER_ENERGY]: () =>
    I18N.carbonFootprint3.waterConsumption,
  [QUICK_ACCOUNT_EMISSION.TRANS]: () => I18N.carbonFootprint.transport,
  [QUICK_ACCOUNT_EMISSION.PROCESS]: () => I18N.carbonFootprint3.machining,
  [QUICK_ACCOUNT_EMISSION.DS]: () => I18N.carbonFootprint3.distributionStorage,
  [QUICK_ACCOUNT_EMISSION.USE]: () => I18N.carbonFootprint3.apply,
  [QUICK_ACCOUNT_EMISSION.WASTE_DISPOSAL]: () =>
    I18N.carbonFootprint.abandonedDisposal,
  [QUICK_ACCOUNT_EMISSION.OTHER]: () => I18N.carbonFootprint3.other,
});

/** 排放源列表的展示 - 输入 输出选择排放源时候列表展示的内容不一样 */
export const EMISSION_LIBTYPE = {
  ALL: 0,
  IN: 1,
  OUT: 2,
};

/** 导入文件弹框对应拿去模板下载的地址字典值 */
export const FOOTPRINT3_IMPORT_MODAL_FILE_KEY = {
  // 快速核算的字典值
  ACCOUNT_EMISSION: 'accountEmission',
  PROCESS_ACCOUNT_IN: 'AccountProcessIn',
  PROCESS_ACCOUNT_OUT: 'AccountProcessOut',
  // 排放源库的字典值
  LIB_EMISSION: 'libEmission',
  PRODUCT: 'product',
} as const;

export const FOOTPRINT3_TOOLTIP_DETAIL = createI18nLabelMap({
  USEAMOUNT: () => I18N.carbonFootprint3.thisOutputIsActual,
  RATE: () => I18N.carbonFootprint3.usedForCalculatingSingle,
});

/** ecoinvent因子隐藏文案 */
export const ECOINVENT_TEXT = I18N.carbonFootprint3.notDisplayedTemporarily;

/**
 * - t(t)
- kg(kg)
- g(g)
- 短吨(Short tons)
- 磅(pound)
- 盎司(ounce)
- mg(mg)
- μg(μg)
- 长吨(Long ton)
- 美吨(US tons)
- 万吨(10,000 tons)
- 千吨(kiloton)
- 兆吨(megaton)
 */
/** 导入排放源的运输相关单位 */
const TRANS_EMISSION_UNIT = {
  T: 1,
  KG: 2,
  G: 5,
  /** 短吨 */
  ShortTon: 15,
  /** 磅 */
  Pound: 16,
  /** 盎司 */
  Ounce: 17,
  /** mg */
  mg: 18,
  /** μg */
  μg: 10,
  /** 长吨 */
  LongTon: 28,
  /** 美吨 */
  USATon: 115,
  /** 万吨 118 */
  '10,000 tons': 118,
  /** 千吨 131*/
  kiloton: 131,
  /** - 兆吨(megaton) */
  megaton: 207,
};

export const TRANS_EMISSION_UNIT_LABEL = createI18nLabelMap({
  [TRANS_EMISSION_UNIT.T]: () => 't',
  [TRANS_EMISSION_UNIT.KG]: () => 'kg',
  [TRANS_EMISSION_UNIT.G]: () => 'g',
  [TRANS_EMISSION_UNIT.ShortTon]: () => I18N.carbonFootprint3.shortTon,
  [TRANS_EMISSION_UNIT.Pound]: () => I18N.carbonFootprint3.pound,
  [TRANS_EMISSION_UNIT.Ounce]: () => I18N.carbonFootprint3.ounce,
  [TRANS_EMISSION_UNIT.mg]: () => 'mg',
  [TRANS_EMISSION_UNIT.μg]: () => 'μg',
  [TRANS_EMISSION_UNIT.LongTon]: () => I18N.carbonFootprint3.longTon,
  [TRANS_EMISSION_UNIT.USATon]: () => I18N.carbonFootprint3.usTon,
  [TRANS_EMISSION_UNIT['10,000 tons']]: () =>
    I18N.carbonFootprint3.tenThousandTons,
  [TRANS_EMISSION_UNIT.kiloton]: () => I18N.carbonFootprint3.thousandTons,
  [TRANS_EMISSION_UNIT.megaton]: () => I18N.carbonFootprint3.megaTon,
});

/** 本报告类型 */
export const REPORT_TYPE = {
  REPORT: 0,
  COMPARE: 1,
  CARBON_LABEL: 2,
  REDUCTION: 3,
};

export const REPORT_TYPE_LABEL = {
  [REPORT_TYPE.REPORT]: () => I18N.carbonFootprint.carbonFootprintReport,
  [REPORT_TYPE.COMPARE]: () => I18N.carbonFootprint3.productComparisonReport,
  [REPORT_TYPE.CARBON_LABEL]: () => I18N.carbonFootprint3.nationalProductCarbon,
  [REPORT_TYPE.REDUCTION]: () =>
    I18N.carbonFootprint3.carbonReductionAccountingReport,
};

/** 计算方式 */
export const CALC_WAY = {
  PRODUCT_WEIGHT: 1,
  BEARING_RATIO: 2,
  ENERGY_CONSUMPTION: 3,
} as const;

/** 对比报告区分 */
export const COMPARISON_REPORT_TYPE = {
  TARGET: 0,
  STANDARD: 1,
};
