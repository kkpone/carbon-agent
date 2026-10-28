import I18N from '@src/lang/I18N';

import { DATA_TYPE } from '@/views/carbonFootPrintLCAnew/components/ProcessDescribeDrawer/constant';

export const DATA_QUALITY_CLASS = {
  /** 总值 */
  TOTAL: 1,
  /** 过程 */
  PROCESS: 2,
  /** 输入输出 */
  INPUT_OUTPUT: 3,
};

/** 方法和标准类型 */
export const STANDARDS_TYPE = {
  /** 欧盟电池法 */
  EU_BATTERY_LAW: 1,
  /** 欧盟PEF */
  EU_PEF: 2,
};
/** 评级类型 */
export const RATE_TYPE = {
  /** 时间代表性 */
  TIME: 1,
  /** 地理代表性 */
  AREA: 2,
  /** 技术代表性 */
  TECH: 3,
  /** 数据准确性 */
  DATA: 4,
};
const { TIME, AREA, TECH, DATA } = RATE_TYPE;

/** 评级类型名称 */
export const RATE_TYPE_LABEL = {
  /** 时间代表性 */
  [TIME]: I18N.carbonFootPrintLCA.timeRepresentativeness4,
  /** 地理代表性 */
  [AREA]: I18N.carbonFootPrintLCA.geographicalRepresentativeness3,
  /** 技术代表性 */
  [TECH]: I18N.carbonFootPrintLCA.technicalRepresentativeness3,
  /** 数据准确性 */
  [DATA]: I18N.carbonFootPrintLCA.dataAccuracy2,
};

/** 评级对应的schemas字段名 */
export const RATE_TYPE_SCHEMAS_VALUE = {
  /** 时间代表性 */
  [TIME]: 'tir',
  /** 地理代表性 */
  [AREA]: 'ger',
  /** 技术代表性 */
  [TECH]: 'ter',
  /** 数据准确性 */
  [DATA]: 'p',
};

/** 质量评价等级 */
export const QUALITY_LEVEL = {
  /** 非常好 */
  VERY_GOOD: 1,
  /** 好 */
  GOOD: 2,
  /** 一般 */
  GENERAL: 3,
  /** 劣质 */
  INFERIOR: 4,
  /** 非常劣质 */
  VERY_INFERIOR: 5,
};
const { VERY_GOOD, GOOD, GENERAL, INFERIOR, VERY_INFERIOR } = QUALITY_LEVEL;
/** 质量评价等级名称 */
export const QUALITY_LEVEL_LABEL = {
  [VERY_GOOD]: I18N.carbonFootPrintLCA.veryGood,
  [GOOD]: I18N.carbonFootprint.good,
  [GENERAL]: I18N.carbonFootprint.commonly,
  [INFERIOR]: I18N.carbonFootPrintLCA.inferior,
  [VERY_INFERIOR]: I18N.carbonFootPrintLCA.veryPoorQuality,
};

const { REALISTIC_DATA, BACKGROUND_DATA } = DATA_TYPE;

/** 欧盟电池法数据质量评级标准 */
export const EU_BATTERY_LAW_STANDARDS = {
  [TIME]: {
    [VERY_GOOD]: I18N.carbonFootPrintLCA.forModeling2,
    [GOOD]: I18N.carbonFootPrintLCA.forModeling,
    [GENERAL]: I18N.carbonFootPrintLCA.inModelingMake3,
    [INFERIOR]: I18N.carbonFootPrintLCA.inModelingMake2,
    [VERY_INFERIOR]: I18N.carbonFootPrintLCA.inModelingMake,
  },
  [AREA]: {
    [VERY_GOOD]: I18N.carbonFootPrintLCA.modelingProcess8,
    [GOOD]: I18N.carbonFootPrintLCA.modelingProcess7,
    [GENERAL]: I18N.carbonFootPrintLCA.theProcessOfModeling,
    [INFERIOR]: I18N.carbonFootPrintLCA.modelingProcess6,
    [VERY_INFERIOR]: I18N.carbonFootPrintLCA.notListedIn,
  },
  [TECH]: {
    [VERY_GOOD]: I18N.carbonFootPrintLCA.modelingTechnologyAnd6,
    [GOOD]: I18N.carbonFootPrintLCA.modelingTechnologyPackage3,
    [GENERAL]: I18N.carbonFootPrintLCA.modelingTechnologyPackage2,
    [INFERIOR]: I18N.carbonFootPrintLCA.modelingTechnologyAnd5,
    [VERY_INFERIOR]: I18N.carbonFootPrintLCA.modelingTechnologyAnd4,
  },
};

/** 欧盟PEF数据质量评级标准：*/
export const EU_PEF_LAW_STANDARDS = {
  /** 实景数据 */
  [REALISTIC_DATA]: {
    [TIME]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.lastYear,
      [GOOD]: I18N.carbonFootPrintLCA.lastTwoYears,
      [GENERAL]: I18N.carbonFootPrintLCA.lastThreeYears,
      [INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
    },
    [AREA]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.accuratelyReflectTheConstruction2,
      [GOOD]: I18N.carbonFootPrintLCA.canRepresentConstruction,
      [GENERAL]: I18N.carbonFootPrintLCA.notApplicable,
      [INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
    },
    [TECH]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.accuratelyReflectTheConstruction,
      [GOOD]: I18N.carbonFootPrintLCA.partialReflectionOfConstruction,
      [GENERAL]: I18N.carbonFootPrintLCA.notApplicable,
      [INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
    },
    [DATA]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.measurementAndCalculation2,
      [GOOD]: I18N.carbonFootPrintLCA.measurementAndCalculation,
      [GENERAL]: I18N.carbonFootPrintLCA.measurementAndCalculationDocument,
      [INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.notApplicable,
    },
  },
  /** 背景数据 */
  [BACKGROUND_DATA]: {
    [TIME]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.productProductionWeek6,
      [GOOD]: I18N.carbonFootPrintLCA.productProductionWeek5,
      [GENERAL]: I18N.carbonFootPrintLCA.productProductionWeek4,
      [INFERIOR]: I18N.carbonFootPrintLCA.productProductionWeek3,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.productProductionWeek2,
    },
    [AREA]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.modelingTechnologyAnd3,
      [GOOD]: I18N.carbonFootPrintLCA.modelingTechnologyPackage,
      [GENERAL]: I18N.carbonFootPrintLCA.modelingTechniquesOnly,
      [INFERIOR]: I18N.carbonFootPrintLCA.modelingTechnologyAnd2,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.modelingTechnologyAnd,
    },
    [TECH]: {
      [VERY_GOOD]: I18N.carbonFootPrintLCA.modelingProcess5,
      [GOOD]: I18N.carbonFootPrintLCA.modelingProcess4,
      [GENERAL]: I18N.carbonFootPrintLCA.modelingProcess3,
      [INFERIOR]: I18N.carbonFootPrintLCA.modelingProcess2,
      [VERY_INFERIOR]: I18N.carbonFootPrintLCA.modelingProcess,
    },
  },
};

/** 默认展示的columns */
export const DEFAULT_COLUMN = [
  { qualityGrade: VERY_GOOD },
  { qualityGrade: GOOD },
  { qualityGrade: GENERAL },
  { qualityGrade: INFERIOR },
  { qualityGrade: VERY_INFERIOR },
];

// 根据数据质量等级来映射描述文本
const mapDescription = (
  rateType: number,
  qualityGrade: number,
  processDataType?: number,
) => {
  /** 有过程数据类型 则为欧盟PEF标准 否则为欧盟电池标准 */
  if (processDataType) {
    const description =
      EU_PEF_LAW_STANDARDS[processDataType]?.[rateType]?.[qualityGrade];
    return description || '-';
  }
  const description = EU_BATTERY_LAW_STANDARDS[rateType]?.[qualityGrade];
  return description || '-';
};

/** 处理标准表格展示的数据 */
export const generateDataSource = (processDataType?: number) =>
  DEFAULT_COLUMN.map(item => {
    const { qualityGrade } = item;
    return {
      key: qualityGrade,
      qualityLevel: QUALITY_LEVEL_LABEL[qualityGrade],
      qualityGrade,
      timeRepresent: mapDescription(TIME, qualityGrade, processDataType),
      areaRepresent: mapDescription(AREA, qualityGrade, processDataType),
      techRepresent: mapDescription(TECH, qualityGrade, processDataType),
      dataAccuracy: mapDescription(DATA, qualityGrade, processDataType),
    };
  });
