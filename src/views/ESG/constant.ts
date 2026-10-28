import I18N from '@src/lang/I18N';

export const TOPIC_COLOR = ['#3AB86E', '#F0D56C', '#6E9FDA', '#E1C8FB'];

export const TOPIC_COLOR_MAP = {
  M1: '#3AB86E',
  M2: '#F0D56C',
  M3: '#6E9FDA',
  M4: '#E1C8FB',
};
export const REFERENCE_TYPE = {
  FULL: 1,
  SOME: 2,
};

export const INDICATOR_SYSTEM_STATE = {
  UN_SUBMIT: 0,
  SUBMITTED: 1,
};

export const REFERENCE_TYPE_LABEL = {
  [REFERENCE_TYPE.FULL]: I18N.esg.fullReference,
  [REFERENCE_TYPE.SOME]: I18N.esg.partialReference,
};

export const INDICATOR_TYPE = {
  BOOLEAN: 0,
  ABSTRACT: 1,
  NUMERIC: 2,
  TEXT: 3,
  ENERGY_COMPONENT: 4,
  EMISSION_COMPONENT: 5,
  TABLE: 6,
};

export const INDICATOR_TYPE_LABEL = {
  [INDICATOR_TYPE.BOOLEAN]: I18N.esg.judging,
  [INDICATOR_TYPE.ABSTRACT]: I18N.esg.topicGroup,
  [INDICATOR_TYPE.NUMERIC]: I18N.esg.numeric,
  [INDICATOR_TYPE.TEXT]: I18N.esg.textType,
  [INDICATOR_TYPE.ENERGY_COMPONENT]: I18N.esg.energyComponents,
  [INDICATOR_TYPE.EMISSION_COMPONENT]: I18N.esg.emissionComponents,
  [INDICATOR_TYPE.TABLE]: I18N.esg.tableType,
};

export const INDICATOR_FILL_WAY = {
  MANUAL: 0,
  AC: 1,
};

export const INDICATOR_UNIT_TYPE = {
  SINGLE: 1,
  MULTIPLE: 2,
  PERCENT: 3,
};

const INDICATOR_STATISTICAL_METHOD = {
  CUMULATIVE_VALUE: 1,
  LATEST_VALUE: 2,
};

export const INDICATOR_STATISTICAL_METHOD_LABEL = {
  [INDICATOR_STATISTICAL_METHOD.CUMULATIVE_VALUE]: I18N.esg.cumulativeValue,
  [INDICATOR_STATISTICAL_METHOD.LATEST_VALUE]: I18N.esg.latestValue,
};

export const PARAM_TYPE = {
  NUMBER: 1,
  TEXT: 2,
  DATE: 3,
  SELECT: 4,
};

export const INDICATOR_DISCLOSURE = {
  ON: 1,
  OFF: 0,
};

export const INDICATOR_DISCLOSURE_LABEL = {
  [INDICATOR_DISCLOSURE.ON]: I18N.esg.disclose,
  [INDICATOR_DISCLOSURE.OFF]: I18N.esg.nonDisclosure,
};

export const ESG_TASK_STATUS = {
  NOT_STARTED: 0,
  FILLING: 1,
  COMPLETED: 2,
};

export const ESG_TASK_STATUS_LABEL = {
  [ESG_TASK_STATUS.NOT_STARTED]: I18N.components.notStartedYet,
  [ESG_TASK_STATUS.FILLING]: I18N.carbonFootprint3.fillingIn,
  [ESG_TASK_STATUS.COMPLETED]: I18N.components.completed,
};

export const INDICATOR_FILL_STATUS = {
  NOT_FILL: 0,
  COMPLETED: 1,
};

export const INDICATOR_FILL_STATUS_LABEL = {
  [INDICATOR_FILL_STATUS.NOT_FILL]: I18N.carbonFootprint3.unfilled,
  [INDICATOR_FILL_STATUS.COMPLETED]: I18N.components.completed,
};

export const SUMMARY_INDICATOR_STATUS = {
  UNCOMPLETED: 0,
  COMPLETED: 1,
};

export const SUMMARY_INDICATOR_STATUS_LABEL = {
  [SUMMARY_INDICATOR_STATUS.UNCOMPLETED]:
    I18N.enterpriseCarbonAccount2.hangInTheAir,
  [SUMMARY_INDICATOR_STATUS.COMPLETED]: I18N.components.completed,
};

export const BOOLEAN_OPTIONS = {
  YES: '1',
  NO: '0',
};

export const BOOLEAN_OPTIONS_LABEL = {
  [BOOLEAN_OPTIONS.YES]: I18N.carbonproduct.have,
  [BOOLEAN_OPTIONS.NO]: I18N.carbonFootPrintLCA.nothing,
};
