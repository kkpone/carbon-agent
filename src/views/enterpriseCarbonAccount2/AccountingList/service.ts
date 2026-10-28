import { request } from '@src/api/request';
import { SkuCount } from '@src/components/SkuCountLabel/type';
import { CancelToken } from 'axios';

import {
  AccountSetting,
  DisclosureBoundaryRow,
  DISCLOSURE_CONFIG_TYPE,
  DISCLOSURE_REPORT_STATUS,
  DisclosureGhgFactorField,
  DisclosureGhgRow,
  DisclosureOption,
  DisclosureReportDetailData,
  DisclosureReportListItem,
  DisclosureReportStandard,
  Org,
  OrgAccount,
  OrgAccountData,
  OrgPeriod,
} from './type';

export const getOrgTree = (params: { cYear: string }) =>
  request<{ data: Org[] }>({
    method: 'GET',
    url: `/enterprise/computation/task/orgTree`,
    params,
  });

export const getAccountOrgTree = (params: { cYear: string }) =>
  request<{ data: Org[] }>({
    method: 'GET',
    url: `/enterprise/computation/task/orgList`,
    params,
  });

export const updateAccount = (data: AccountSetting) =>
  request({
    method: 'post',
    url: '/enterprise/computation/task/admin/edit',
    data,
  });

export const getAccountSetting = (params: { cYear: string }) =>
  request<{ data: AccountSetting }>({
    method: 'get',
    url: '/enterprise/computation/task/info',
    params,
  });

export const getAccountingPeriodList = (params: {
  cYear: string;
  sessionId?: string;
  shareId?: string;
}) =>
  request<{ data: OrgPeriod[] }>({
    method: 'get',
    url: '/enterprise/computation/task/periodList',
    params,
  });
export const deleteAccountTask = (params: { computationId: number }) =>
  request({
    method: 'get',
    url: '/enterprise/computation/task/delete',
    params,
  });

export const saveAccountToModel = (params: Record<string, any>) =>
  request<{ code: number }>({
    method: 'GET',
    url: `/enterprise/computation/to/model`,
    params,
  });

export const getAccountSkuCount = (params: { year: string }) =>
  request<{ data: SkuCount }>({
    method: 'get',
    url: '/enterprise/computation/task/skuInfo',
    params,
  });

export const getOrgAccountData = (
  params: {
    year: string;
    orgId?: number | string;
    period?: number | string;
    sessionId?: string;
    shareId?: string;
  },
  cancelToken?: CancelToken,
) =>
  request<{ data: OrgAccountData }>({
    method: 'get',
    url: '/enterprise/computation/task/list/org/computation',
    params,
    cancelToken,
  });

export const getOrgAccountDataByShare = (
  params: {
    year: string;
    orgId?: number | string;
    period?: number | string;
    companyId?: string;
    reportId?: string;
  },
  cancelToken?: CancelToken,
) =>
  request<{ data: OrgAccountData }>({
    method: 'get',
    url: '/enterprise/computation/task/list/org/computationShare',
    params,
    cancelToken,
  });

export const getAgentOrgAccountDataByShare = (
  params: {
    year: string;
    orgId?: number | string;
    period?: number | string;
    sessionId: string;
    shareId?: string;
  },
  cancelToken?: CancelToken,
) =>
  request<{ data: OrgAccountData }>({
    method: 'get',
    url: '/enterprise/computation/task/agentComputationShare',
    params,
    cancelToken,
  });

export const getRecentBrowseYear = () =>
  request<{ data: { year: string; orgInfo: Org; period: number } }>({
    method: 'get',
    url: '/enterprise/computation/task/browse',
  });

export const computationSubmit = (
  params: Pick<OrgAccount, 'computationId' | 'computationPeriod'>,
) =>
  request({
    method: 'get',
    url: '/enterprise/computation/computationStatus/submit',
    params,
  });

export const computationRevokeSubmit = (
  params: Pick<OrgAccount, 'computationId' | 'computationPeriod'>,
) =>
  request({
    method: 'get',
    url: '/enterprise/computation/computationStatus/revocation',
    params,
  });

export const getIntensityData = params =>
  request<{
    data: { currMoney: string; currMoneyRate: string; compareValue: number };
  }>({
    url: '/enterprise/operate/v2/indicator/data',
    params,
  });

type DisclosureBackendEnumItem = {
  value: number | string;
  name: string;
};

type DisclosureConfigBackendOrg = {
  id: number;
  pid?: number;
  name?: string;
  orgName?: string;
  orgCode?: string;
  orgType: number;
  status?: number | string | null;
  quantFlag?: number | string | null;
  evaluateFlag?: number | string | null;
  children?: DisclosureConfigBackendOrg[];
};

type DisclosureEvaluateEnums = {
  quantFlag?: DisclosureBackendEnumItem[];
  intendUse?: DisclosureBackendEnumItem[];
  industryGuide?: DisclosureBackendEnumItem[];
  dataDifficulty?: DisclosureBackendEnumItem[];
  emissionImpact?: DisclosureBackendEnumItem[];
};

type DisclosureBackendCategory<T> = {
  categoryName?: string;
  categoryCode?: number | string;
  children?: T[];
};

type DisclosureBackendListParams = {
  year: string;
  orgId: number;
  standard: DisclosureReportStandard;
};

type DisclosureQuantItem = {
  id?: number | string;
  classifyName?: string;
  classifyCode?: number | string;
  quantFlag?: number | string | null;
  quantRemark?: string | null;
};

type DisclosureEvaluateItem = {
  id?: number | string;
  classifyName?: string;
  classifyCode?: number | string;
  ghgClassify?: number | string | null;
  isoClassify?: number | string | null;
  intendUse?: number | string | null;
  intendUseScore?: number | null;
  industryGuide?: number | string | null;
  industryGuideScore?: number | null;
  dataDifficulty?: number | string | null;
  dataDifficultyScore?: number | null;
  emissionImpact?: number | string | null;
  emissionImpactScore?: number | null;
  totalScore?: number | null;
  majorFlag?: number | string | null;
  majorFlagName?: string | null;
  remark?: string | null;
  majorRemark?: string | null;
  evaluateRemark?: string | null;
  [property: string]: any;
};

type SaveDisclosureQuantPayload = {
  id: number;
  quantFlag: number;
  quantRemark?: string;
};

type SaveDisclosureEvaluatePayload = {
  id: number;
  intendUse: number;
  industryGuide: number;
  dataDifficulty: number;
  emissionImpact: number;
};

const MAJOR_GHG_FACTOR_CONFIG = [
  {
    field: 'factorA',
    enumKey: 'intendUse',
    valueKey: 'intendUse',
    scoreKey: 'intendUseScore',
  },
  {
    field: 'factorB',
    enumKey: 'industryGuide',
    valueKey: 'industryGuide',
    scoreKey: 'industryGuideScore',
  },
  {
    field: 'factorC',
    enumKey: 'dataDifficulty',
    valueKey: 'dataDifficulty',
    scoreKey: 'dataDifficultyScore',
  },
  {
    field: 'factorD',
    enumKey: 'emissionImpact',
    valueKey: 'emissionImpact',
    scoreKey: 'emissionImpactScore',
  },
] as const;

const toOptionValue = (value: number | string | null | undefined) =>
  value === null || value === undefined ? '' : `${value}`;

const getDisclosureConfigType = (flag?: number | string | null) =>
  toOptionValue(flag) === '1'
    ? DISCLOSURE_CONFIG_TYPE.CUSTOM
    : DISCLOSURE_CONFIG_TYPE.SYSTEM;

const getDisclosureReportStatus = (status?: number | string | null) =>
  toOptionValue(status) ===
  `${DISCLOSURE_REPORT_STATUS.HAS_COMPLETED_ACCOUNTING}`
    ? DISCLOSURE_REPORT_STATUS.HAS_COMPLETED_ACCOUNTING
    : DISCLOSURE_REPORT_STATUS.NO_COMPLETED_ACCOUNTING;

const mapDisclosureConfigList = (
  orgList: DisclosureConfigBackendOrg[] = [],
): DisclosureReportListItem[] =>
  orgList.map(item => {
    const children = mapDisclosureConfigList(item.children || []);

    return {
      id: item.id,
      pid: item.pid,
      name: item.name || item.orgName || '',
      orgName: item.orgName,
      orgCode: item.orgCode,
      orgType: item.orgType as DisclosureReportListItem['orgType'],
      status: getDisclosureReportStatus(item.status),
      quantFlag: item.quantFlag,
      evaluateFlag: item.evaluateFlag,
      reportBoundaryConfig: getDisclosureConfigType(item.quantFlag),
      reportBoundaryConfigType: getDisclosureConfigType(item.quantFlag),
      majorGhgConfig: getDisclosureConfigType(item.evaluateFlag),
      majorGhgConfigType: getDisclosureConfigType(item.evaluateFlag),
      ...(children.length ? { children } : {}),
    };
  });

const toNumber = (value: unknown, fallback = 0) => {
  const nextValue = Number(value);

  return Number.isFinite(nextValue) ? nextValue : fallback;
};

const getDisclosureRowId = (
  group: DisclosureBackendCategory<unknown>,
  item: { id?: number | string; classifyCode?: number | string },
  index: number,
) =>
  toOptionValue(
    item.id ??
      item.classifyCode ??
      `${toOptionValue(group.categoryCode ?? group.categoryName)}-${index}`,
  );

const getMajorGhgTotalScore = (
  row: Pick<DisclosureGhgRow, 'factorA' | 'factorB' | 'factorC' | 'factorD'>,
) =>
  row.factorA.score * row.factorB.score * row.factorC.score * row.factorD.score;

const mapGroupedRows = <T, R>(
  groups: DisclosureBackendCategory<T>[],
  mapItem: (
    group: DisclosureBackendCategory<T>,
    item: T,
    scopeRowSpan: number,
    index: number,
  ) => R,
) =>
  groups.flatMap(group => {
    const children = group.children || [];

    return children.map((item, index) =>
      mapItem(group, item, index === 0 ? children.length : 0, index),
    );
  });

const mapEnumOptions = (
  options: DisclosureBackendEnumItem[] = [],
  scoreMap?: Map<string, number>,
): DisclosureOption[] =>
  options.map(item => {
    const value = toOptionValue(item.value);
    const label = item.name || value;
    const option: DisclosureOption = {
      value,
      label,
    };

    if (scoreMap?.has(value)) {
      option.score = scoreMap.get(value);
    }

    return option;
  });

const collectFactorScores = (
  groups: DisclosureBackendCategory<DisclosureEvaluateItem>[],
  valueKey: keyof DisclosureEvaluateItem,
  scoreKey: keyof DisclosureEvaluateItem,
) => {
  const scoreMap = new Map<string, number>();

  groups.forEach(group => {
    (group.children || []).forEach(item => {
      const value = toOptionValue(item[valueKey] as number | string | null);
      const score = Number(item[scoreKey]);

      if (value && Number.isFinite(score) && !scoreMap.has(value)) {
        scoreMap.set(value, score);
      }
    });
  });

  return scoreMap;
};

const mapFactorOptions = (
  enums: DisclosureEvaluateEnums,
  evaluateList: DisclosureBackendCategory<DisclosureEvaluateItem>[],
): Record<DisclosureGhgFactorField, DisclosureOption[]> =>
  MAJOR_GHG_FACTOR_CONFIG.reduce(
    (result, config) => ({
      ...result,
      [config.field]: mapEnumOptions(
        enums[config.enumKey],
        collectFactorScores(evaluateList, config.valueKey, config.scoreKey),
      ),
    }),
    {} as Record<DisclosureGhgFactorField, DisclosureOption[]>,
  );

const mapBoundaryRows = (
  groups: DisclosureBackendCategory<DisclosureQuantItem>[] = [],
): DisclosureBoundaryRow[] =>
  mapGroupedRows(groups, (group, item, scopeRowSpan, index) => ({
    id: getDisclosureRowId(group, item, index),
    scope: group.categoryName || '',
    scopeRowSpan,
    category: item.classifyName || '',
    quantified: toOptionValue(item.quantFlag),
    remark: item.quantRemark || '',
  }));

const isMajorGhgImportant = (item: DisclosureEvaluateItem) => {
  if (toOptionValue(item.majorFlag) === '1') {
    return true;
  }

  if (item.majorFlagName !== undefined && item.majorFlagName !== null) {
    return ['是', '重大'].includes(item.majorFlagName);
  }

  return false;
};

const mapMajorGhgRows = (
  groups: DisclosureBackendCategory<DisclosureEvaluateItem>[] = [],
): DisclosureGhgRow[] =>
  mapGroupedRows(groups, (group, item, scopeRowSpan, index) => {
    const row = {
      id: getDisclosureRowId(group, item, index),
      classifyCode: toOptionValue(item.classifyCode),
      ghgClassify: toOptionValue(item.ghgClassify),
      isoClassify: toOptionValue(item.isoClassify),
      scope: group.categoryName || '',
      scopeRowSpan,
      category: item.classifyName || '',
      factorA: {
        value: toOptionValue(item.intendUse),
        score: toNumber(item.intendUseScore),
      },
      factorB: {
        value: toOptionValue(item.industryGuide),
        score: toNumber(item.industryGuideScore),
      },
      factorC: {
        value: toOptionValue(item.dataDifficulty),
        score: toNumber(item.dataDifficultyScore),
      },
      factorD: {
        value: toOptionValue(item.emissionImpact),
        score: toNumber(item.emissionImpactScore),
      },
      totalScore: 0,
      majorIndirectEmission: item.majorFlagName || '',
      remark: item.remark || item.majorRemark || item.evaluateRemark || '',
    };
    const important = isMajorGhgImportant(item);

    return {
      ...row,
      totalScore: toNumber(item.totalScore, getMajorGhgTotalScore(row)),
      important,
    };
  });

const getDisclosureRequestParams = (params: DisclosureBackendListParams) => ({
  orgId: params.orgId,
  year: params.year,
  standardType: Number(params.standard),
});

export const getDisclosureReportEnums = () =>
  request<{ data: DisclosureEvaluateEnums }>({
    method: 'get',
    url: '/enterprise/evaluate/enums',
  });

export const getDisclosureQuantList = (params: DisclosureBackendListParams) =>
  request<{ data: DisclosureBackendCategory<DisclosureQuantItem>[] }>({
    method: 'get',
    url: '/enterprise/quant/list',
    params: getDisclosureRequestParams(params),
  });

export const getDisclosureEvaluateList = (
  params: DisclosureBackendListParams,
) =>
  request<{ data: DisclosureBackendCategory<DisclosureEvaluateItem>[] }>({
    method: 'get',
    url: '/enterprise/evaluate/list',
    params: getDisclosureRequestParams(params),
  });

export const getDisclosureReportBoundaryRows = async (
  params: DisclosureBackendListParams,
) => {
  const response = await getDisclosureQuantList(params);

  return mapBoundaryRows(response.data.data || []);
};

export const getDisclosureReportMajorGhgRows = async (
  params: DisclosureBackendListParams,
) => {
  const response = await getDisclosureEvaluateList(params);

  return mapMajorGhgRows(response.data.data || []);
};

export const saveDisclosureQuant = (data: SaveDisclosureQuantPayload) =>
  request({
    method: 'put',
    url: '/enterprise/quant/edit',
    data,
  });

export const saveDisclosureEvaluate = (data: SaveDisclosureEvaluatePayload) =>
  request({
    method: 'put',
    url: '/enterprise/evaluate/edit',
    data,
  });

export const getDisclosureReportList = (params: {
  orgId: string;
  year: string;
}) =>
  request<{ data: DisclosureConfigBackendOrg[] }>({
    method: 'get',
    url: '/enterprise/quant/config',
    params,
  }).then(response => ({
    ...response,
    data: {
      ...response.data,
      data: mapDisclosureConfigList(response.data.data),
    },
  }));

export const getDisclosureReportDetail = async (
  params: DisclosureBackendListParams,
) => {
  const [enumsResponse, quantResponse, evaluateResponse] = await Promise.all([
    getDisclosureReportEnums(),
    getDisclosureQuantList(params),
    getDisclosureEvaluateList(params),
  ]);
  const enums = enumsResponse.data.data || {};
  const evaluateList = evaluateResponse.data.data || [];
  const detail: DisclosureReportDetailData = {
    reportBoundary: mapBoundaryRows(quantResponse.data.data || []),
    majorGhg: mapMajorGhgRows(evaluateList),
    quantifyOptions: mapEnumOptions(enums.quantFlag),
    factorOptions: mapFactorOptions(enums, evaluateList),
  };

  return {
    data: {
      code: 200,
      data: detail,
    },
  };
};

export const getDisclosureMajorGhgReportDetail = async (
  params: DisclosureBackendListParams,
) => {
  const [enumsResponse, evaluateResponse] = await Promise.all([
    getDisclosureReportEnums(),
    getDisclosureEvaluateList(params),
  ]);
  const enums = enumsResponse.data.data || {};
  const evaluateList = evaluateResponse.data.data || [];
  const detail: Pick<DisclosureReportDetailData, 'majorGhg' | 'factorOptions'> =
    {
      majorGhg: mapMajorGhgRows(evaluateList),
      factorOptions: mapFactorOptions(enums, evaluateList),
    };

  return {
    data: {
      code: 200,
      data: detail,
    },
  };
};
