export type EnterpriseOverviewPeriod = {
  name: string;
  status: number | string;
  value: number | string;
};

export type EnterpriseOverviewOrg = {
  children?: EnterpriseOverviewOrg[];
  id: number | string;
  name: string;
  orgType: number | string;
  periodList?: EnterpriseOverviewPeriod[];
};

export type EnterpriseOverviewRow = {
  children?: EnterpriseOverviewRow[];
  id: number | string;
  name: string;
  orgName?: string;
  orgType: number | string;
  scopeOne?: string | null;
  scopeThree?: string | null;
  scopeTwo?: string | null;
  status: number | string;
  statusDesc?: string | null;
  totalEmission?: string | null;
  totalEmissionRatio?: string | null;
};

export type EnterpriseOverviewGroup = {
  computationPeriod: number | string;
  orgList: EnterpriseOverviewRow[];
  title: string;
};

export type EnterpriseOverviewData = {
  orgInfoList: EnterpriseOverviewGroup[];
  scopeOne: string;
  scopeThree: string;
  scopeTwo: string;
  status: number | string;
  title: string;
  totalEmission: string;
  totalEmissionRatio: string;
  totalEmissionRatioStatus: number | string;
};

export type EnterpriseOverviewListParams = {
  orgId: number | string;
  period: number | string;
  year: string;
};
