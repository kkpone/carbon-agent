import React from 'react';
import { ValueOf } from 'type-fest';

import { COMPUTATION_STATUS, ORG_TYPE } from '../constant';

export type Employ = {
  userId?: number;
  employName?: string;
  employPhone?: string;
  employEmail: string;
};

export type Org = {
  id: number;
  name: string;
  orgType: ValueOf<typeof ORG_TYPE>;
  pid: 0;
  existComputation: 0 | 1 | null;
  children: Org[];
  key: React.Key;
  recentComputationOrgId: number;
  periodList: OrgPeriod[];
  emailList: Employ[];
  [p: string]: any;
};

export type AccountSetting = {
  cYear: string;
  timeType: number;
  gwp: string;
  orgList: SimpleOrg[];
  copy?: boolean;
  canCopy?: boolean;
  upYear?: string;
};

export type SimpleOrg = {
  orgId: number;
  orgName: string;
  orgType?: ValueOf<typeof ORG_TYPE>;
  emailList: Employ[];
};

export type OrgPeriod = {
  status: ValueOf<typeof COMPUTATION_STATUS>;
  name: string;
  value: number;
};

export type OrgAccountData = {
  totalEmission: string;
  totalEmissionRatio: string;
  totalEmissionRatioStatus: number;
  scopeOne: string;
  scopeTwo: string;
  scopeThree: string;
  title: string;
  status: ValueOf<typeof COMPUTATION_STATUS>;
  orgInfoList: {
    title: string;
    computationPeriod: number;
    orgList: OrgAccount[];
  }[];
};

export type OrgAccount = {
  id: number;
  name: string;
  orgName: string;
  orgType: ValueOf<typeof ORG_TYPE>;
  totalEmissionRatio: string;
  totalEmission: string;
  scopeOne: string;
  scopeTwo: string;
  scopeThree: string;
  principal: null;
  status: ValueOf<typeof COMPUTATION_STATUS>;
  statusDesc: string;
  computationId: number;
  computationPeriod: number;
  gwp: string;
  parents: OrgAccount[];
  children: OrgAccount[] | undefined;
  level: number;
};

export const DISCLOSURE_REPORT_STANDARD = {
  GHG: '1',
  ISO: '2',
} as const;

export const DISCLOSURE_CONFIG_TYPE = {
  SYSTEM: 'system',
  CUSTOM: 'custom',
} as const;

export const DISCLOSURE_REPORT_STATUS = {
  NO_COMPLETED_ACCOUNTING: 0,
  HAS_COMPLETED_ACCOUNTING: 1,
} as const;

export const DISCLOSURE_DETAIL_TAB = {
  REPORT_BOUNDARY: 'reportBoundary',
  MAJOR_GHG: 'majorGhg',
} as const;

export type DisclosureReportStandard = ValueOf<
  typeof DISCLOSURE_REPORT_STANDARD
>;

export type DisclosureConfigType = ValueOf<typeof DISCLOSURE_CONFIG_TYPE>;

export type DisclosureReportStatus = ValueOf<typeof DISCLOSURE_REPORT_STATUS>;

export type DisclosureDetailTab = ValueOf<typeof DISCLOSURE_DETAIL_TAB>;

export type DisclosureQuantifyStatus = string;

export type DisclosureReportListItem = {
  id: number;
  pid?: number;
  name: string;
  orgName?: string;
  orgCode?: string;
  orgType: ValueOf<typeof ORG_TYPE>;
  status: DisclosureReportStatus;
  quantFlag?: number | string | null;
  evaluateFlag?: number | string | null;
  reportBoundaryConfig: string;
  reportBoundaryConfigType: DisclosureConfigType;
  majorGhgConfig: string;
  majorGhgConfigType: DisclosureConfigType;
  children?: DisclosureReportListItem[];
};

export type DisclosureBoundaryRow = {
  id: string;
  scope: string;
  scopeRowSpan?: number;
  category: string;
  quantified: DisclosureQuantifyStatus;
  remark: string;
};

export type DisclosureGhgFactorValue = {
  value: string;
  score: number;
};

export type DisclosureMajorGhgRule = {
  majorScoreThreshold: number;
  majorEmissionLabels: {
    yes: string;
    no: string;
    important: string;
  };
};

export type DisclosureOption = {
  value: string;
  label: string;
  score?: number;
};

export type DisclosureGhgFactorField =
  | 'factorA'
  | 'factorB'
  | 'factorC'
  | 'factorD';

export type DisclosureGhgRow = {
  id: string;
  classifyCode?: string;
  ghgClassify?: string;
  isoClassify?: string;
  scope: string;
  scopeRowSpan?: number;
  category: string;
  important?: boolean;
  importantLabel?: string;
  factorA: DisclosureGhgFactorValue;
  factorB: DisclosureGhgFactorValue;
  factorC: DisclosureGhgFactorValue;
  factorD: DisclosureGhgFactorValue;
  totalScore: number;
  majorIndirectEmission: string;
  remark: string;
};

export type DisclosureReportDetailData = {
  reportBoundary: DisclosureBoundaryRow[];
  majorGhg: DisclosureGhgRow[];
  quantifyOptions: DisclosureOption[];
  factorOptions: Record<DisclosureGhgFactorField, DisclosureOption[]>;
  majorGhgRule?: DisclosureMajorGhgRule;
};
