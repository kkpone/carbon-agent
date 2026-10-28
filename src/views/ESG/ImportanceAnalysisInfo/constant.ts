import I18N from '@src/lang/I18N';

export const IMPORTANCE = {
  UNKNOWN: -1,
  IRRELEVANT: 0,
  SLIGHT: 1,
  RELATED: 2,
  MODERATE: 3,
  IMPORTANT: 4,
  CRITICAL: 5,
} as const;

export const IMPORTANCE_LABEL = (key: number) =>
  ({
    [IMPORTANCE.UNKNOWN]: I18N.esg.notUnderstand,
    [IMPORTANCE.IRRELEVANT]: I18N.esg.irrelevant,
    [IMPORTANCE.SLIGHT]: I18N.esg.slightlyRelated,
    [IMPORTANCE.RELATED]: I18N.esg.relatedButNotSignificant,
    [IMPORTANCE.MODERATE]: I18N.esg.generallyImportant,
    [IMPORTANCE.IMPORTANT]: I18N.esg.relativelyImportant,
    [IMPORTANCE.CRITICAL]: I18N.esg.veryImportant,
  }[key]);

export const IMPORTANCE_COLOR = {
  [IMPORTANCE.UNKNOWN]: {
    textColor: '#D5D7DA',
    borderColor: '#999EA4',
  },
  [IMPORTANCE.IRRELEVANT]: {
    textColor: '#04252B',
    borderColor: '#04252B',
  },
  [IMPORTANCE.SLIGHT]: {
    textColor: '#C08157',
    borderColor: '#C08157',
  },
  [IMPORTANCE.RELATED]: {
    textColor: '#9F522B',
    borderColor: '#9F522B',
  },
  [IMPORTANCE.MODERATE]: {
    textColor: '#B0444B',
    borderColor: '#B0444B',
  },
  [IMPORTANCE.IMPORTANT]: {
    textColor: '#0CBF9F',
    borderColor: '#0CBF9F',
  },
  [IMPORTANCE.CRITICAL]: {
    textColor: '#026961',
    borderColor: '#026961',
  },
};
