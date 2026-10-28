// 碳减排类型

import I18N from '@src/lang/I18N';

enum CARBONREDUTIONTYPE {
  OLD_CCER = 1,
  OLD_GREEN = 2,
  VCS_2019 = 3,
  VCS_2013_2016 = 4,
  IREC = 5,
  CER = 6,
  CCER = 7,
}

export const CARBONREDUTIONTYPE_LABEL = [
  {
    value: I18N.carbonNeutral.vcsWindPower2,
    label: I18N.carbonNeutral.vcsWindPower2,
  },
  {
    value: I18N.carbonNeutral.vcsWindPower,
    label: I18N.carbonNeutral.vcsWindPower,
  },
  {
    value: I18N.carbonNeutral.irecNon,
    label: I18N.carbonNeutral.irecNon,
  },
  {
    value: I18N.carbonNeutral.cerWindPower,
    label: I18N.carbonNeutral.cerWindPower,
  },
  {
    value: I18N.carbonNeutral.ccerIii,
    label: I18N.carbonNeutral.ccerIii,
  },
];

export const CARBONREDUTIONTYPE_STYLE = {
  [CARBONREDUTIONTYPE.VCS_2019]: {
    color: '#0CBF9F',
    background: '#E6FFF6',
  },
  [CARBONREDUTIONTYPE.VCS_2013_2016]: {
    color: '#3491FA',
    background: '#F0F9FF',
  },
  [CARBONREDUTIONTYPE.IREC]: {
    color: '#6C757D',
    background: '#F5F5F5',
  },
  [CARBONREDUTIONTYPE.CER]: {
    color: '#FBA93E',
    background: '#FFFBF0',
  },
  [CARBONREDUTIONTYPE.CCER]: {
    color: '#ED5555',
    background: '#FFF2F0',
  },
};
