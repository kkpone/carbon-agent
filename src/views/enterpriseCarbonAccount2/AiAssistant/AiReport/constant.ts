import I18N from '@src/lang/I18N';

export const REPORT_TYPE = {
  ALL: 1,
  RECENTLY_VIEWED: 2,
  UPLOADED: 3,
  FOLLOWING: 4,
} as const;

export const REPORT_TYPE_LABEL = {
  [REPORT_TYPE.ALL]: I18N.enterpriseCarbonAccount2.allReports,
  [REPORT_TYPE.RECENTLY_VIEWED]: I18N.enterpriseCarbonAccount2.recentBrowsing,
  [REPORT_TYPE.UPLOADED]: I18N.enterpriseCarbonAccount2.enterpriseUpload,
  [REPORT_TYPE.FOLLOWING]: I18N.enterpriseCarbonAccount2.whatIAmFollowing,
} as const;

export const RANK_LIST = [
  'A',
  'A-',
  'B',
  'B-',
  'C',
  'C-',
  'D',
  'D-',
  I18N.carbonFootprint3.other,
];

export const REPORT_COLLECT_STATUS = {
  COLLECTED: 1,
  UN_COLLECTED: 0,
};

export const REPORT_ANALYZE_STATUS = {
  FAIL: 0,
  SUCCESS: 1,
  PROCESSING: 2,
  NO_DATA: 3,
  REPEAT: 4,
} as const;

export const REPORT_ANALYZE_STATUS_DESC = {
  [REPORT_ANALYZE_STATUS.FAIL]:
    I18N.enterpriseCarbonAccount2.reportParsingError,
  [REPORT_ANALYZE_STATUS.SUCCESS]:
    I18N.enterpriseCarbonAccount2.reportParsingInto,
  [REPORT_ANALYZE_STATUS.PROCESSING]:
    I18N.enterpriseCarbonAccount2.reportParsing,
  [REPORT_ANALYZE_STATUS.NO_DATA]: '',
  [REPORT_ANALYZE_STATUS.REPEAT]:
    I18N.enterpriseCarbonAccount2.reportAlreadyExists,
} as const;

export const REPORT_CLOSE_STATUS = {
  CLOSE: 0,
  OPEN: 1,
} as const;

export const AI_TIP_STATUS = {
  OPEN: 1,
  CLOSE: 0,
} as const;
