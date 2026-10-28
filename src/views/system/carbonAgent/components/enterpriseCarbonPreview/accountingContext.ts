import { StepType } from '@/views/enterpriseCarbonAccount2/accounting/type';
import {
  COMPUTATION_STATUS,
  ORG_TYPE,
} from '@/views/enterpriseCarbonAccount2/constant';

import { getEnterpriseCarbonPeriodParamName } from './periodText';
import type {
  EnterpriseCarbonAccountingContext,
  EnterpriseCarbonOrgNode,
  EnterpriseCarbonOrgPeriod,
} from './types';

const getOptionalString = (value?: string | number | null) => {
  const text =
    value === undefined || value === null ? '' : String(value).trim();

  return text === 'undefined' || text === 'null' ? '' : text;
};

const getRecordString = (record: Record<string, unknown>, keys: string[]) =>
  keys
    .map(key => getOptionalString(record[key] as string | number | null))
    .find(Boolean) || '';

const cleanOptionalFields = <T extends Record<string, unknown>>(record: T) =>
  Object.entries(record).reduce<Partial<T>>((result, [key, value]) => {
    if (value !== undefined && value !== '') {
      Object.assign(result, { [key]: value });
    }

    return result;
  }, {}) as T;

export const normalizeEnterpriseCarbonOrgNode = (
  node: EnterpriseCarbonOrgNode & Record<string, unknown>,
): EnterpriseCarbonOrgNode => {
  const id = getOptionalString(node.id) || getRecordString(node, ['orgId']);
  const orgId = getRecordString(node, ['orgId', 'org_id']) || id;
  const name =
    getOptionalString(node.name) ||
    getRecordString(node, ['orgName', 'org_name']) ||
    orgId;
  const orgName = getRecordString(node, ['orgName', 'org_name']) || name;

  return cleanOptionalFields({
    ...node,
    children: node.children,
    companyId: getRecordString(node, ['companyId', 'company_id']),
    computationId: getRecordString(node, ['computationId', 'computation_id']),
    computationPeriod: getRecordString(node, [
      'computationPeriod',
      'computation_period',
    ]),
    id,
    name,
    orgId,
    orgName,
    orgType: getRecordString(node, ['orgType', 'org_type']),
    period: getRecordString(node, ['period']),
    periodName: getRecordString(node, ['periodName', 'period_name']),
    preOrgId: getRecordString(node, ['preOrgId', 'pre_org_id']),
    reportId: getRecordString(node, ['reportId', 'report_id']),
    scopeOne: getRecordString(node, ['scopeOne', 'scope_one']),
    scopeThree: getRecordString(node, ['scopeThree', 'scope_three']),
    scopeTwo: getRecordString(node, ['scopeTwo', 'scope_two']),
    step: getRecordString(node, ['step']),
    totalEmission: getRecordString(node, ['totalEmission', 'total_emission']),
    totalEmissionRatio: getRecordString(node, [
      'totalEmissionRatio',
      'total_emission_ratio',
    ]),
    versionType: getRecordString(node, ['versionType', 'version_type']),
    year: getRecordString(node, ['year']),
  });
};

export const normalizeEnterpriseCarbonOrgTree = (
  tree: EnterpriseCarbonOrgNode[] = [],
): EnterpriseCarbonOrgNode[] =>
  tree.map(node =>
    normalizeEnterpriseCarbonOrgNode({
      ...node,
      children: normalizeEnterpriseCarbonOrgTree(node.children),
    }),
  );

export const getActiveOrgAccountingContext = (
  activeOrg?: EnterpriseCarbonOrgNode,
  activePeriod?: EnterpriseCarbonOrgPeriod,
  accountingYear?: string,
): EnterpriseCarbonAccountingContext | undefined => {
  if (!activeOrg) {
    return undefined;
  }

  const node = normalizeEnterpriseCarbonOrgNode(activeOrg);

  if (!node.orgId || !node.orgName) {
    return undefined;
  }

  return cleanOptionalFields({
    companyId: node.companyId,
    computationId: node.computationId,
    computationPeriod:
      getOptionalString(activePeriod?.value) || node.computationPeriod,
    orgId: node.orgId,
    orgName: node.orgName,
    orgType: node.orgType,
    period: node.period || accountingYear,
    periodName: getEnterpriseCarbonPeriodParamName({
      accountingYear,
      period: activePeriod,
      periodName: node.periodName,
    }),
    preOrgId: node.preOrgId,
    reportId: node.reportId,
    step: node.step,
    status: activePeriod?.status ?? node.status,
    versionType: node.versionType,
    year: node.year,
  });
};

const getAgentStepByStatus = (
  status?: number | string,
  userOrgType?: number,
) => {
  const normalizedStatus = Number(status);

  switch (normalizedStatus) {
    case COMPUTATION_STATUS.FILLING:
      return `${StepType.fillData}`;
    case COMPUTATION_STATUS.COMPLETE:
      return `${StepType.result}`;
    case COMPUTATION_STATUS.BE_SUBMITTED:
      return userOrgType === ORG_TYPE.ENTERPRISE
        ? `${StepType.fillData}`
        : `${StepType.result}`;
    default:
      return `${StepType.baseInfo}`;
  }
};

export const buildAgentAccountingContextFromOrgNode = ({
  accountingYear,
  activePeriod,
  detailYear,
  orgNode,
  periodName,
  userOrgType,
}: {
  accountingYear: string;
  activePeriod?: EnterpriseCarbonOrgPeriod;
  detailYear?: string;
  orgNode?: EnterpriseCarbonOrgNode;
  periodName?: string;
  userOrgType?: number;
}): EnterpriseCarbonAccountingContext | undefined => {
  if (!orgNode) {
    return undefined;
  }

  const node = normalizeEnterpriseCarbonOrgNode(orgNode);

  if (!node.orgId || !node.orgName) {
    return undefined;
  }

  const isMainPart = Number(node.orgType) === ORG_TYPE.MAIN_PART;
  const computationPeriod =
    node.computationPeriod || getOptionalString(activePeriod?.value);

  return cleanOptionalFields({
    companyId: node.companyId,
    computationId: isMainPart ? node.computationId : undefined,
    computationPeriod,
    orgId: node.orgId,
    orgName: node.orgName,
    orgType: node.orgType,
    period: isMainPart ? undefined : accountingYear,
    periodName:
      periodName ||
      getEnterpriseCarbonPeriodParamName({
        accountingYear,
        period: activePeriod,
        periodName: node.periodName,
      }),
    preOrgId: node.preOrgId,
    reportId: node.reportId,
    step: isMainPart
      ? getAgentStepByStatus(node.status, userOrgType)
      : node.step,
    status: node.status,
    versionType: node.versionType,
    year: detailYear || node.year || accountingYear,
  });
};
