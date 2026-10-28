import I18N from '@src/lang/I18N';

export const REDUCING_TAB_KEY = {
  OVERVIEW: '0',
  TARGET: '1',
  FORECAST: '2',
  REDUCTION_MEASURES: '3',
};

const { OVERVIEW, TARGET, FORECAST, REDUCTION_MEASURES } = REDUCING_TAB_KEY;

export const REDUCING_TAB = {
  [OVERVIEW]: I18N.enterpriseCarbonAccount2.planOverview,
  [TARGET]: I18N.enterpriseCarbonAccount2.emissionReductionTargets,
  [FORECAST]: I18N.enterpriseCarbonAccount2.emissionPrediction2,
  [REDUCTION_MEASURES]: I18N.enterpriseCarbonAccount2.emissionReductionMeasures,
};

export const FORECAST_WAY = {
  FUTURE: 0,
  HISTORY: 1,
} as const;

export const FORECAST_WAY_LABEL = {
  [FORECAST_WAY.FUTURE]: I18N.enterpriseCarbonAccount2.basedOnFutureRegulations,
  [FORECAST_WAY.HISTORY]: I18N.enterpriseCarbonAccount2.basedOnHistoricalData2,
} as const;

export const FORECAST_WAY_DESC = {
  [FORECAST_WAY.FUTURE]:
    I18N.enterpriseCarbonAccount2.accordingToTheFilledSpecifications,
  [FORECAST_WAY.HISTORY]: I18N.enterpriseCarbonAccount2.arrangeBasedOnHistory,
} as const;

export const FORECAST_WAY_ICON = {
  [FORECAST_WAY.FUTURE]: 'icon-icon_weilaiguihuayuce_selected',
  [FORECAST_WAY.HISTORY]: 'icon-icon_lishishujuyuce_selected',
} as const;

export const HISTORY_DATA_RANGE = {
  RECENT_THREE_YEAR: 0,
  RECENT_FIVE_YEAR: 1,
  ALL: 2,
} as const;

export const HISTORY_DATA_RANGE_LABEL = {
  [HISTORY_DATA_RANGE.RECENT_THREE_YEAR]:
    I18N.enterpriseCarbonAccount2.recentYears,
  [HISTORY_DATA_RANGE.RECENT_FIVE_YEAR]:
    I18N.enterpriseCarbonAccount2.recentYears2,
  [HISTORY_DATA_RANGE.ALL]: I18N.enterpriseCarbonAccount2.allData,
} as const;

export const COMPARE_TAG = {
  GREATER: 1,
  EQUAL: 0,
  LESS: -1,
} as const;

export const YEAR_TYPE = {
  ALL: 0,
  RECENT_TEN_YEAR: 1,
} as const;

export const REDUCING_TARGET = {
  ABSOLUTE: 1,
  INTENSITY: 2,
};

export const REDUCING_TARGET_LABEL = {
  [REDUCING_TARGET.ABSOLUTE]:
    I18N.enterpriseCarbonAccount2.absoluteValueTotalRanking,
  [REDUCING_TARGET.INTENSITY]: I18N.enterpriseCarbonAccount2.strongUnitRevenue,
};

export const SCOPE_VAL = {
  ONE: '100',
  TWO: '200',
  THREE: '300',
};

export const SCOPE_BG_COLOR = {
  [SCOPE_VAL.ONE]: '#0CBF9F',
  [SCOPE_VAL.TWO]: '#3491FA',
  [SCOPE_VAL.THREE]: '#FBA93E',
};

export const TARGET_STAGE = {
  STAGE_1: 0,
  STAGE_2: 1,
  STAGE_3: 2,
  STAGE_4: 3,
  STAGE_5: 4,
};

export const TARGET_STAGE_LABEL = {
  [TARGET_STAGE.STAGE_1]: I18N.carbonFootprint.custom,
  [TARGET_STAGE.STAGE_2]: '2°C',
  [TARGET_STAGE.STAGE_3]: I18N.enterpriseCarbonAccount2.betterThanC,
  [TARGET_STAGE.STAGE_4]: '1.5°C',
  [TARGET_STAGE.STAGE_5]: I18N.enterpriseCarbonAccount2.netZero,
};
