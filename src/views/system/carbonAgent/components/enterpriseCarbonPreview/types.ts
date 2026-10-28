export type EnterpriseCarbonPreviewKind = 'enterpriseCarbonAccounting';

export type EnterpriseCarbonPreviewView = 'canvas' | 'list' | 'result';

export type EnterpriseCarbonAccountingPermissions = {
  canCreateAccounting: boolean;
  canCreateTask: boolean;
  canEditAccounting: boolean;
  canEditEmissionSource: boolean;
  canViewAccounting: boolean;
};

export type EnterpriseCarbonOrgPeriod = {
  name?: string;
  status?: number | string;
  value: number | string;
};

export type EnterpriseCarbonOrgNode = {
  companyId?: string;
  computationId?: string;
  computationPeriod?: string;
  id: string;
  name: string;
  orgId?: string;
  orgName?: string;
  orgType?: string;
  period?: string;
  periodName?: string;
  periodList?: EnterpriseCarbonOrgPeriod[];
  preOrgId?: string;
  reportId?: string;
  step?: string;
  status?: number | string;
  versionType?: string;
  year?: string;
  totalEmission?: string;
  totalEmissionRatio?: string;
  scopeOne?: string;
  scopeTwo?: string;
  scopeThree?: string;
  children?: EnterpriseCarbonOrgNode[];
};

export type EnterpriseCarbonAccountingContext = {
  companyId?: string;
  computationId?: string;
  computationPeriod?: string;
  orgId: string;
  orgName: string;
  orgType?: string;
  period?: string;
  periodName?: string;
  status?: number | string;
  preOrgId?: string;
  reportId?: string;
  step?: string;
  versionType?: string;
  year?: string;
};

export type EnterpriseCarbonAccountingPreviewTarget = {
  type: EnterpriseCarbonPreviewKind;
  versionType?: string;
  year?: string;
};
