import { request } from '@src/api/request';
import I18N from '@src/lang/I18N';

import { isCarbonData, isCompany, isReport, record } from './data';
import type {
  Analysis,
  CarbonData,
  Company,
  ComparisonResult,
  EnterpriseFollow,
  EnterprisePage,
  EnterpriseReport,
  EnterpriseResult,
  Entitlement,
} from './types';

const prefix = '/ai/agent/enterprise-data';
const invalid = () => new Error(I18N.enterpriseData.invalidResponse);

export const unwrapEnterpriseResponse = <T>(
  body: unknown,
  validate: (value: unknown) => boolean,
): T => {
  const response = record(body);
  if (response.code !== 200) {
    throw new Error(
      typeof response.msg === 'string' && response.msg
        ? response.msg
        : I18N.enterpriseData.requestFailed,
    );
  }
  if (!validate(response.data)) throw invalid();
  return response.data as T;
};

const call = async <T>(
  path: string,
  method: 'GET' | 'POST',
  validate: (value: unknown) => boolean,
  data?: object,
  signal?: AbortSignal,
  timeout?: number,
): Promise<T> => {
  const response = await request<unknown>({
    url: `${prefix}${path}`,
    method,
    ...(method === 'GET' ? { params: data } : { data }),
    signal,
    timeout,
    silentResponseError: true,
  });
  return unwrapEnterpriseResponse<T>(response?.data, validate);
};

export const enterpriseError = (error: unknown) => {
  if (error instanceof Error) return error.message;
  const body = record(
    record(error).data ?? record(record(error).response).data,
  );
  return typeof body.msg === 'string' && body.msg
    ? body.msg
    : I18N.enterpriseData.requestFailed;
};

const pageOf = (check: (value: unknown) => boolean) => (value: unknown) => {
  const page = record(value);
  return (
    Array.isArray(page.records) &&
    page.records.every(check) &&
    Number.isInteger(page.total) &&
    Number(page.total) >= 0 &&
    Number.isInteger(page.pageNum) &&
    Number(page.pageNum) >= 1 &&
    Number.isInteger(page.pageSize) &&
    Number(page.pageSize) > 0
  );
};

export const isEnterpriseResult = (value: unknown) => {
  const result = record(value);
  if (
    result.success !== true ||
    typeof result.resultId !== 'string' ||
    !result.resultId
  )
    return false;
  if (result.resultType === 'enterprise_carbon_data')
    return isCarbonData(result.data);
  if (result.resultType === 'enterprise_candidates')
    return pageOf(isCompany)(result.data);
  if (result.resultType !== 'enterprise_comparison') return false;
  const data = record(result.data);
  return (
    Array.isArray(data.companies) &&
    data.companies.length >= 2 &&
    data.companies.every(isCarbonData) &&
    typeof data.year === 'string' &&
    typeof data.sameIndustry === 'boolean' &&
    Array.isArray(data.medians) &&
    data.medians.every(value => {
      const median = record(value);
      return (
        typeof median.indicatorCode === 'string' &&
        Number.isInteger(median.sampleCount) &&
        Number(median.sampleCount) >= 0 &&
        ['marketCode', 'unit', 'currency', 'value'].every(
          key => median[key] == null || typeof median[key] === 'string',
        )
      );
    })
  );
};

export const fetchEntitlement = (signal?: AbortSignal) =>
  call<Entitlement>(
    '/entitlement',
    'GET',
    value => {
      const data = record(value);
      return (
        Number.isInteger(data.followLimit) &&
        Number(data.followLimit) >= 0 &&
        Number.isInteger(data.compareLimit) &&
        Number(data.compareLimit) >= 0
      );
    },
    undefined,
    signal,
  );

export const fetchFollows = async (signal?: AbortSignal) => {
  const follows = await call<EnterpriseFollow[]>(
    '/follows',
    'GET',
    value =>
      Array.isArray(value) &&
      value.every(
        item =>
          typeof record(item).enterpriseId === 'string' &&
          typeof record(item).companyJson === 'string',
      ),
    undefined,
    signal,
  );
  return follows.map(follow => {
    let company: Company | undefined;
    try {
      const parsed: unknown = JSON.parse(follow.companyJson);
      if (isCompany(parsed))
        company = { ...parsed, companyId: follow.enterpriseId };
    } catch {
      // 保留损坏的关注记录及取消入口，不能用空列表隐藏数据问题。
    }
    return { ...follow, company };
  });
};

export const setFollow = (companyId: string, followed: boolean) =>
  call<null>(
    followed ? '/follow' : '/unfollow',
    'POST',
    value => value === null,
    { companyId },
  );
export const fetchCandidates = (
  keyword: string,
  pageNum = 1,
  signal?: AbortSignal,
) =>
  call<EnterprisePage<Company>>(
    '/candidates',
    'POST',
    pageOf(isCompany),
    { keyword, pageNum, pageSize: 20 },
    signal,
  );
export const fetchCarbonData = (
  companyId: string,
  years?: string[],
  signal?: AbortSignal,
) =>
  call<CarbonData>(
    '/data',
    'POST',
    isCarbonData,
    { companyId, ...(years ? { years } : {}) },
    signal,
  );
export const fetchReports = (
  companyId: string,
  pageNum = 1,
  signal?: AbortSignal,
) =>
  call<EnterprisePage<EnterpriseReport>>(
    '/reports',
    'GET',
    pageOf(isReport),
    { companyId, pageNum },
    signal,
  );
export const createComparison = (
  companyIds: string[],
  year: string,
  signal?: AbortSignal,
) =>
  call<ComparisonResult>(
    '/compare',
    'POST',
    value =>
      isEnterpriseResult(value) &&
      record(value).resultType === 'enterprise_comparison',
    { companyIds, years: [year] },
    signal,
  );
export const fetchResult = (resultId: string, signal?: AbortSignal) =>
  call<EnterpriseResult>(
    '/result',
    'GET',
    isEnterpriseResult,
    { resultId },
    signal,
  );
export const analyzeComparison = (resultId: string, signal?: AbortSignal) =>
  call<Analysis>(
    '/analyze',
    'POST',
    value =>
      ['emissionScale', 'emissionEfficiency', 'keyFindings'].every(key => {
        const text = record(value)[key];
        return typeof text === 'string' && Boolean(text.trim());
      }),
    { resultId },
    signal,
    180000,
  );

export const refreshReport = async (
  companyId: string,
  reportId: string,
  signal?: AbortSignal,
): Promise<EnterpriseReport | undefined> => {
  let pageNum = 1;
  let more = true;
  while (more) {
    // 报告只能按页读取；找到同一 reportId 后立即停止，避免刷新全部链接。
    // eslint-disable-next-line no-await-in-loop
    const page = await fetchReports(companyId, pageNum, signal);
    const report = page.records.find(item => item.reportId === reportId);
    if (report) return report;
    more = page.records.length > 0 && page.pageNum * page.pageSize < page.total;
    pageNum += 1;
  }
  return undefined;
};
