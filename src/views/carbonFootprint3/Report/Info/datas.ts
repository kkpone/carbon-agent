/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-15 11:15:17
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-26 22:26:55
 */
import I18N from '@src/lang/I18N';

export const activityData = [
  {
    quality: I18N.carbonFootprint3.good,
    discirbe: I18N.carbonFootprint3.actualMeasuredValue,
    num: 5,
  },
  {
    quality: I18N.carbonFootprint3.preferably,
    discirbe: I18N.carbonFootprint3.calculateTheValueWithACertain,
    num: 3,
  },
  {
    quality: I18N.carbonFootprint3.commonly,
    discirbe: I18N.carbonFootprint3.theoreticalValueExperience,
    num: 2,
  },
  {
    quality: I18N.carbonFootprint3.difference,
    discirbe: I18N.carbonFootprint3.referencesAreProvidedBy,
    num: 1,
  },
];

export const radios = {
  time: I18N.carbonFootprint3.timeCorrelation,
  position: I18N.carbonFootprint3.regionalRelevance,
  tech: I18N.carbonFootprint3.technicalRelevance,
  data: I18N.carbonFootprint3.dataAccuracy,
  method: I18N.carbonFootprint3.methodology,
};

/** 排放因子数据质量评级标准 */
export const factorDatas = (type?: keyof typeof radios) => {
  if (type === 'time')
    return [
      {
        time: I18N.carbonFootprint3.lessThanYear,
        num: 5,
      },
      {
        time: I18N.carbonFootprint3.until2,
        num: 3,
      },
      {
        time: I18N.carbonFootprint3.until,
        num: 2,
      },
      {
        time: I18N.carbonFootprint3.greaterThanYearsAndNotYet,
        num: 1,
      },
    ];
  if (type === 'position')
    return [
      {
        time: I18N.carbonFootprint3.fullyInLineWithTheRequirements2,
        num: 5,
      },
      {
        time: I18N.carbonFootprint3.dataForCountry,
        num: 3,
      },

      {
        time: I18N.carbonFootprint3.theDataIsGlobal,
        num: 1,
      },
    ];
  if (type === 'tech')
    return [
      {
        time: I18N.carbonFootprint3.fullyInLineWithTheRequirements,
        num: 5,
      },
      {
        time: I18N.carbonFootprint3.industryAverage,
        num: 3,
      },

      {
        time: I18N.carbonFootprint3.surrogateData,
        num: 1,
      },
    ];
  if (type === 'data')
    return [
      {
        time: I18N.carbonFootprint3.lowVariability,
        num: 5,
      },
      {
        time: I18N.carbonFootprint3.variabilityUnmeasured2,
        num: 3,
      },

      {
        time: I18N.carbonFootprint3.variabilityUnmeasured,
        num: 2,
      },

      {
        time: I18N.carbonFootprint3.highVariability,
        num: 1,
      },
    ];
  if (type === 'method')
    return [
      {
        time: I18N.carbonFootprint3.pasSupplement,
        num: 5,
      },
      {
        time: I18N.carbonFootprint3.governmentInternationalPolitics,
        num: 3,
      },

      {
        time: I18N.carbonFootprint3.otherMachinesInTheCompany,
        num: 1,
      },
    ];
  return [];
};
