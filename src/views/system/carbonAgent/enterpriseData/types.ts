export type EnterpriseSection =
  | 'enterpriseFollows'
  | 'enterpriseDetail'
  | 'enterpriseCompare';

export type Company = {
  companyId: string;
  name: string;
  shortName?: string | null;
  labels?: string[] | null;
  securities?:
    | {
        marketCode?: string | null;
        code: string;
        name?: string | null;
      }[]
    | null;
  unifiedSocialCreditCode?: string | null;
  industryCategory?: string | null;
  legalRepresentative?: string | null;
  companyState?: string | null;
  foundationDate?: string | null;
  registeredCapital?: string | null;
  registeredCapitalUnit?: string | null;
  companyType?: string | null;
  registeredRegion?: string | null;
  registeredAddress?: string | null;
  businessScope?: string | null;
  businessTermStartDate?: string | null;
  businessTermEndDate?: string | null;
  companyFormerName?:
    | string
    | { formerName?: string | null }
    | (string | { formerName?: string | null })[]
    | null;
  phoneNumbers?: string[] | null;
  emailAddresses?: string[] | null;
  detailComplete?: boolean | null;
  sourceUpdatedAt?: string | null;
  basicCrawledAt?: string | null;
  basicInfoSource?: string | null;
  snapshotTypes?: string[] | null;
};

export type MetricKey = {
  indicatorCode: string;
  marketCode?: string | null;
  unit?: string | null;
  currency?: string | null;
};

export type Metric = MetricKey & {
  name: string;
  dimension?: string | null;
  categoryCode?: string | null;
  categoryName?: string | null;
  parentCode?: string | null;
  path?: string[] | null;
  statisticalPeriod: string;
  valueNumeric?: string | null;
  valueText?: string | null;
  sourceModule?: string | null;
};

export type EnterpriseReport = {
  reportId: string;
  title?: string | null;
  reportType?: string | null;
  reportYear?: number | null;
  reportPeriod?: string | null;
  disclosureDate?: string | null;
  source?: string | null;
  fileType?: string | null;
  fileStatus?: string | null;
  linkUrl?: string | null;
  linkKind?: 'file' | 'source' | null;
  linkExpiresAt?: string | null;
};

export type CarbonData = {
  company: Company;
  years: string[];
  availableYears?: string[] | null;
  metrics: Metric[];
  sources: EnterpriseReport[];
};
export type EnterprisePage<T> = {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
};
export type Entitlement = { followLimit: number; compareLimit: number };
export type EnterpriseFollow = {
  enterpriseId: string;
  companyJson: string;
  followTime?: string;
  company?: Company;
};
export type IndustryMedian = MetricKey & {
  sampleCount: number;
  value?: string | null;
};
export type Comparison = {
  companies: [CarbonData, CarbonData];
  year: string;
  sameIndustry: boolean;
  industry?: string | null;
  medians: IndustryMedian[];
};
export type Analysis = {
  emissionScale: string;
  emissionEfficiency: string;
  keyFindings: string;
};
type Result<T, K extends string> = {
  success: true;
  resultId: string;
  resultType: K;
  queriedAt?: string;
  data: T;
};
export type ComparisonResult = Result<Comparison, 'enterprise_comparison'>;
export type EnterpriseResult =
  | ComparisonResult
  | Result<CarbonData, 'enterprise_carbon_data'>
  | Result<EnterprisePage<Company>, 'enterprise_candidates'>;
export type EnterpriseConfirmation = {
  sessionId: string;
  company: Company;
  resultId: string;
};
