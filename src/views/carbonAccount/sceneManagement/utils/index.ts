import I18N from '@src/lang/I18N';

export enum SceneRules {
  'score' = 'score',
  'times' = 'times',
}
export const sceneRules = {
  [SceneRules.score]: I18N.carbonAccount.carbonCoinRestrictions,
  [SceneRules.times]: I18N.carbonAccount.frequencyLimit,
};
/** //限制类型。0不限制 1限制分数 2 限制次数 3 限制分数和次数 */
export const sceneRulesValue = {
  [SceneRules.score]: 1,
  [SceneRules.times]: 2,
};

/** 场景限制  */
export const limitOptions = [
  {
    label: I18N.components.unlimited,
    value: 0,
  },
  {
    label: I18N.carbonAccount.limit,
    value: 1,
  },
];

/** 0默认，1小任务，2自定义 */
export const senceType = {
  0: I18N.carbonAccount.default,
  1: I18N.carbonAccount.smallTasks,
  2: I18N.carbonFootprint.custom,
};

/** 场景id对应的 icon
 *
 * 目前只用到图片地址 v1.3
 */
const actionsMap = [
  {
    title: I18N.carbonAccount.walk,
    iconUrl: 'https://oss-saas.carbonstop.net/carbonAccount/icon-run@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachStepCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0001',
  },
  {
    title: I18N.carbonAccount.checkIn,
    iconUrl: 'https://oss-saas.carbonstop.net/carbonAccount/icon-punchCard.png',
    disabled: false,
    btnTitle: I18N.carbonAccount.goCheckIn,
    detail: I18N.carbonAccount.eachTimeYouClockInYouCan,
    score: 3,
    secondRate: 1,
    sceneCode: 'MRCJ0002',
  },
  {
    title: I18N.carbonAccount.answer,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-questions@2x.png',
    disabled: false,
    btnTitle: I18N.carbonAccount.goAnswerTheQuestion,
    detail: I18N.carbonAccount.answerCorrectlyEveryTime,
    score: 1,
    secondRate: 3,
    sceneCode: 'MRCJ0003',
  },
  {
    title: I18N.carbonAccount.cycling,
    iconUrl: 'https://oss-saas.carbonstop.net/carbonAccount/icon-riding@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0004',
  },
  {
    title: I18N.carbonAccount.vegetarianism,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-green-food@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0005',
  },
  {
    title: I18N.carbonAccount.lunchRestScreen,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-off-screen@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0006',
  },
  {
    title: I18N.carbonAccount.duplexPrint,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-dobble-print@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0007',
  },
  {
    title: I18N.carbonAccount.highTravelCost,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-high-train@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0008',
  },
  {
    title: I18N.carbonAccount.bringYourOwnLaundryDuringBusinessTrips,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-self-washing@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0009',
  },
  {
    title: I18N.carbonAccount.takingPublicTransportation,
    iconUrl: 'https://oss-saas.carbonstop.net/carbonAccount/icon-bus@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0010',
  },
  {
    title: I18N.carbonAccount.takingTheSubway,
    iconUrl: 'https://oss-saas.carbonstop.net/carbonAccount/icon-subway@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0011',
  },
  {
    title: I18N.carbonAccount.cleanEnergyOutput,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-clean-energy-car@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0012',
  },
  {
    title: I18N.carbonAccount.takingTheShuttleBus,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-company-bus@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0013',
  },
  {
    title: I18N.carbonAccount.searchForCarbonFootprint,
    iconUrl:
      'https://oss-saas.carbonstop.net/carbonAccount/icon-search-footprint@2x.png',
    disabled: false,
    detail: I18N.carbonAccount.eachTimeYouCanObtain,
    score: 0.1,
    secondRate: 1,
    sceneCode: 'MRCJ0014',
  },
];

/**
 * 需要添加地图的场景  骑行、公交、地铁、班车、新能源车出
 */
export const addMapScenes = actionsMap.filter(t =>
  [
    I18N.carbonAccount.cycling,
    I18N.carbonAccount.takingTheSubway,
    I18N.carbonAccount.takingPublicTransportation,
    I18N.carbonAccount.cleanEnergyOutput,
    I18N.carbonAccount.takingTheShuttleBus,
  ].includes(t.title),
);
