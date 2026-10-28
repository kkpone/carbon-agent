import I18N from '@src/lang/I18N';

export const YEAR_TYPE = {
  PREV_YEAR: 0,
  CURR_YEAR: 1,
  NEXT_YEAR: 2,
};

export const YEAR_TYPE_LABEL = {
  [YEAR_TYPE.PREV_YEAR]: I18N.enterpriseCarbonAccount2.lastYear,
  [YEAR_TYPE.CURR_YEAR]: I18N.enterpriseCarbonAccount2.currentYear,
  [YEAR_TYPE.NEXT_YEAR]: I18N.enterpriseCarbonAccount2.nextYear,
};

export const MONTH_OPTION = [
  { value: 1, label: I18N.enterpriseCarbonAccount2.month12 },
  { value: 2, label: I18N.enterpriseCarbonAccount2.month11 },
  { value: 3, label: I18N.enterpriseCarbonAccount2.month10 },
  { value: 4, label: I18N.enterpriseCarbonAccount2.month9 },
  { value: 5, label: I18N.enterpriseCarbonAccount2.month8 },
  { value: 6, label: I18N.enterpriseCarbonAccount2.month7 },
  { value: 7, label: I18N.enterpriseCarbonAccount2.month6 },
  { value: 8, label: I18N.enterpriseCarbonAccount2.month5 },
  { value: 9, label: I18N.enterpriseCarbonAccount2.month4 },
  { value: 10, label: I18N.enterpriseCarbonAccount2.month3 },
  { value: 11, label: I18N.enterpriseCarbonAccount2.month2 },
  { value: 12, label: I18N.enterpriseCarbonAccount2.month },
];

export const ACCOUNT_WAY = {
  CALENDAR_YEAR: 1,
  FINANCIAL_YEAR: 2,
} as const;

export const ACCOUNT_WAYS = [
  {
    value: ACCOUNT_WAY.CALENDAR_YEAR,
    name: I18N.enterpriseCarbonAccount2.calendarYear,
    desc: I18N.enterpriseCarbonAccount2.refersToNormalNature,
  },
  {
    value: ACCOUNT_WAY.FINANCIAL_YEAR,
    name: I18N.enterpriseCarbonAccount2.fiscalYear,
    desc: I18N.enterpriseCarbonAccount2.refersToTheUseOfEnterprisesFor,
  },
];
