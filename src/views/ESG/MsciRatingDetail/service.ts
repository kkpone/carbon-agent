import { request } from '@/api/request';

export interface MsciRatingDetailParams {
  id: string;
}

export interface ReferFile {
  name: string;
  url: string;
}

export interface IssueItem {
  id: string | number;
  name: string;
  score?: string | number;
  percent?: string | number;
  [key: string]: unknown;
}

export interface IssuesInfoData {
  issuesPercent?: string | number;
  issuesScore?: string | number;
  moduleType?: number; // 1 环境 2 社会 3 治理
  issuesName?: string | null;
  manageScore?: any;
  exposureScore?: any;
  metricItemList?: any[];
  [key: string]: unknown;
}

export interface MsciRatingDetailResponse {
  id: number;
  companyId: number;
  period: string; // 年度
  businessName?: string; // 企业名称
  referFiles: ReferFile[]; // 文件列表
  industry: string; // 行业
  industrySub: string; // 子行业
  environmentalIssues: string; // 环境选择id 逗号间隔
  socialIssues: string; // 社会选择id
  governanceIssues: string; // 治理选择id
  environmentalScore: string; // 环境得分
  socialScore: string; // 社会得分
  governanceScore: string; // 治理得分
  score: string; // msci得分
  rating: string; // 评级
  environmentalIssuesList: IssueItem[];
  socialIssuesList: IssueItem[];
  governanceIssuesList: IssueItem[];
  environmentalPercent?: number;
  socialPercent?: number;
  governancePercent?: number;
  governanceReduceScore?: number;
  /**
   * 0 未开始
   * 1 成功
   * 2 进行中
   */
  environmentalStatus?: 0 | 1 | 2;
  governanceStatus?: 0 | 1 | 2;
  socialStatus?: 0 | 1 | 2;
}

export interface TopicData {
  id: string;
  name: string;
  pillar: 'environment' | 'social' | 'governance';
  score?: number;
  percent?: number;
  children?: TopicData[];
}

export interface MsciRatingDetailData {
  id: number;
  companyId: number;
  companyName: string;
  year: number;
  period: string;
  industry: string;
  industrySub: string;
  rating: string;
  wakisScore: number; // 对应 score
  environmentScore: number;
  socialScore: number;
  governanceScore: number;
  environmentPercent: number;
  socialPercent: number;
  governancePercent: number;
  topics: TopicData[];
  referFiles: ReferFile[];
  environmentalIssues: string;
  socialIssues: string;
  governanceIssues: string;
  governanceReduceScore?: string;
}

/**
 * 从接口响应中提取详情数据
 * @param res 接口响应数据
 * @returns 详情数据
 */
export const extractMsciRatingDetailResponse = (
  res: unknown,
): MsciRatingDetailResponse | null => {
  if (!res) return null;
  // 处理 AxiosResponse 结构
  type ResponseData =
    | { data?: MsciRatingDetailResponse }
    | MsciRatingDetailResponse;

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  if (resData && typeof resData === 'object') {
    if ('data' in resData && resData.data) {
      return resData.data as MsciRatingDetailResponse;
    }
    return resData as MsciRatingDetailResponse;
  }

  return null;
};

/**
 * 提取议题详情数据
 * @param res 接口响应
 * @returns 议题详情
 */
export const extractIssuesInfo = (res: unknown): IssuesInfoData | null => {
  if (!res) return null;
  type ResponseData = { data?: IssuesInfoData } | IssuesInfoData;

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  if (resData && typeof resData === 'object') {
    if ('data' in resData && resData.data) {
      return resData.data as IssuesInfoData;
    }
    return resData as IssuesInfoData;
  }
  return null;
};

/**
 * 将 API 响应数据转换为组件使用的数据格式
 * @param response API 响应数据
 * @returns 转换后的数据
 */
export const transformMsciRatingDetailData = (
  response: MsciRatingDetailResponse | null,
): MsciRatingDetailData | null => {
  if (!response) return null;

  const toNumber = (value?: string | number): number => {
    if (value === undefined || value === null) return 0;
    const num = Number(value);
    return Number.isNaN(num) ? 0 : num;
  };
  // 构建 topics 数组
  const topics: TopicData[] = [];

  // 环境议题
  (response.environmentalIssuesList || []).forEach(issue => {
    topics.push({
      id: String(issue.id),
      name: issue.name,
      pillar: 'environment',
      score: issue.score ? toNumber(issue.score) : undefined,
      percent: issue.percent ? toNumber(issue.percent) : undefined,
    });
  });

  // 社会议题
  (response.socialIssuesList || []).forEach(issue => {
    topics.push({
      id: String(issue.id),
      name: issue.name,
      pillar: 'social',
      score: issue.score ? toNumber(issue.score) : undefined,
      percent: issue.percent ? toNumber(issue.percent) : undefined,
    });
  });

  // 治理议题
  (response.governanceIssuesList || []).forEach(issue => {
    topics.push({
      id: String(issue.id),
      name: issue.name,
      pillar: 'governance',
      score: issue.score ? toNumber(issue.score) : undefined,
      percent: issue.percent ? toNumber(issue.percent) : undefined,
    });
  });

  return {
    id: response.id,
    companyId: response.companyId,
    companyName: response.businessName || '', // 使用 API 返回的 businessName
    year: Number(response.period) || new Date().getFullYear(),
    period: response.period,
    industry: response.industry,
    industrySub: response.industrySub,
    rating: response.rating,
    wakisScore: toNumber(response.score),
    environmentScore: toNumber(response.environmentalScore),
    socialScore: toNumber(response.socialScore),
    governanceScore: toNumber(response.governanceScore),
    environmentPercent: toNumber(response.environmentalPercent),
    socialPercent: toNumber(response.socialPercent),
    governancePercent: toNumber(response.governancePercent),
    topics,
    referFiles: response.referFiles || [],
    environmentalIssues: response.environmentalIssues,
    socialIssues: response.socialIssues,
    governanceIssues: response.governanceIssues,
    governanceReduceScore: response.governanceReduceScore,
    esgReportName: response.esgReportName,
    esgReportId: response.esgReportId,
  };
};

export const getMsciRatingDetail = (params: MsciRatingDetailParams) =>
  request<MsciRatingDetailResponse>({
    url: `/esg/msciReport/msciInfo`,
    method: 'GET',
    params,
  });

/**
 * 获取议题详情
 * @param issuesId 议题ID
 */
export const getIssuesInfo = (issuesId: number | string) =>
  request<IssuesInfoData>({
    url: '/esg/msciReport/issuesInfo',
    method: 'GET',
    params: { issuesId },
  });

/**
 * AI 重新打分单个议题
 * @param id 议题ID
 * @returns 提交结果
 */
export const aiMsciScoreSingle = (id: number) =>
  request({
    url: '/esg/msciReport/aiMsciScoreSingle',
    method: 'POST',
    data: { id },
  });

export interface AiMsciScoreModelParams {
  reportId: number;
  modelType: string;
}

/**
 * AI 重新打分整个支柱
 * @param params 参数对象，包含 reportId 和 modelType
 * @returns 提交结果
 */
export const aiMsciScoreModel = (params: AiMsciScoreModelParams) =>
  request({
    url: '/esg/msciReport/aiMsciScoreModel',
    method: 'POST',
    data: params,
  });

export interface EditMsciRatingParams {
  id: number;
  period: string;
  businessName: string;
}

/**
 * 编辑MSCI评级基本信息
 * @param params 编辑参数
 * @returns 提交结果
 */
export const editMsciRating = (params: EditMsciRatingParams) =>
  request({
    url: '/esg/msciReport/edit',
    method: 'POST',
    data: params,
  });
