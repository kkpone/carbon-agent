import { request } from '@/api/request';

export interface MsciRatingListParams {
  businessName?: string;
  period?: number;
  rating?: string;
  pageNum?: number;
  pageSize?: number;
}

export const getMsciRatingList = (params: MsciRatingListParams) =>
  request<any>({
    url: 'esg/msciReport/list',
    params: {
      ...params,
    },
    method: 'GET',
  });

export const deleteMsciRating = (data: { id: number }) =>
  request({
    url: `/esg/msciReport/delete`,
    data,
    method: 'POST',
  });

export interface IndustryItem {
  id: number;
  industryName: string;
  orderNum: number;
  children?: SubIndustryItem[];
}

export interface SubIndustryItem {
  id: number;
  name: string;
  orderNum?: number;
}

export interface IndustrySelectOption {
  label: string;
  value: number;
}

/**
 * 从接口响应中提取行业数据
 * @param res 接口响应数据
 * @returns 行业数据数组
 */
export const extractIndustryData = (res: unknown): IndustryItem[] => {
  if (!res) return [];
  // 处理 AxiosResponse 结构，兼容多种返回格式
  type ResponseData =
    | { data?: { data?: IndustryItem[] } | IndustryItem[] }
    | IndustryItem[];

  const resData = res as ResponseData;

  // 尝试从不同层级提取数据
  if (Array.isArray(resData)) {
    return resData;
  }

  if (resData && typeof resData === 'object' && 'data' in resData) {
    const innerData = resData.data;
    if (Array.isArray(innerData)) {
      return innerData;
    }
    if (
      innerData &&
      typeof innerData === 'object' &&
      'data' in innerData &&
      Array.isArray(innerData.data)
    ) {
      return innerData.data;
    }
  }

  return [];
};

/**
 * 将行业数据转换为 Select 选项格式
 * @param industryData 行业数据
 * @returns Select 选项数组
 */
export const convertIndustryToOptions = (
  industryData: IndustryItem[],
): IndustrySelectOption[] =>
  industryData.map(item => ({
    label: item.industryName,
    value: item.id,
  }));

/**
 * 根据行业ID获取子行业选项
 * @param industryData 行业数据
 * @param industryId 行业ID
 * @returns 子行业选项数组
 */
export const getSubIndustryOptions = (
  industryData: IndustryItem[],
  industryId?: number,
): IndustrySelectOption[] => {
  if (!industryId) return [];
  const industry = industryData.find(item => item.id === industryId);
  if (!industry?.children) return [];
  return industry.children.map(item => ({
    label: item.name,
    value: item.id,
  }));
};

export const getEsgReportList = () =>
  request<{
    data: {
      id: number;
      reportName: string;
      period: string;
      orgName: string;
      createBy: string;
      createUserName: string;
    }[];
  }>({
    url: '/esg/frameReport/getEsgReportList',
  });

export const getIndustryData = () =>
  request<IndustryItem[]>({
    url: '/esg/msciReport/getIndustryData',
    method: 'GET',
  });

export interface IndustryIssueItem {
  id: string | number;
  name: string;
  percent: number;
  moduleType: number;
  [key: string]: unknown;
}

/**
 * 从接口响应中提取议题数据
 * @param res 接口响应数据
 * @returns 议题数据数组
 */
export const extractIndustryIssues = (res: unknown): IndustryIssueItem[] => {
  if (!res) return [];
  // 处理 AxiosResponse 结构，兼容多种返回格式
  type ResponseData = { data?: IndustryIssueItem[] } | IndustryIssueItem[];

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  // 尝试从不同层级提取数据
  if (Array.isArray(resData)) {
    return resData;
  }

  if (resData && typeof resData === 'object' && 'data' in resData) {
    const innerData = resData.data;
    if (Array.isArray(innerData)) {
      return innerData;
    }
  }

  return [];
};

/**
 * 根据 moduleType 将议题分类
 * @param issues 议题数据数组
 * @returns 分类后的议题对象
 */
export const classifyIssuesByModuleType = (issues: IndustryIssueItem[]) => {
  const environment: IndustryIssueItem[] = [];
  const social: IndustryIssueItem[] = [];
  const governance: IndustryIssueItem[] = [];

  issues.forEach(issue => {
    const { moduleType } = issue;
    if (moduleType === 1) {
      environment.push(issue);
    } else if (moduleType === 2) {
      social.push(issue);
    } else if (moduleType === 3) {
      governance.push(issue);
    }
  });

  return { environment, social, governance };
};

/**
 * 获取行业议题
 * @param industryId 子行业ID
 * @returns 议题数据
 */
export const getIndustryIssues = (industryId: number) =>
  request<IndustryIssueItem[]>({
    url: '/esg/msciReport/getIndustryIssues',
    params: { industryId },
    method: 'GET',
  });

export interface IssueWeightItem {
  id: number;
  name: string;
  weight: string;
}

export interface IssueWeightResponse {
  modelType: number;
  modelTypeName: string;
  totalWeight: string;
  issues: IssueWeightItem[];
}

export interface GetIssuesPercentParams {
  industryId: string | number;
  issuesIds: number[];
}

/**
 * 获取议题权重信息
 * @param params 参数对象，包含子行业ID和议题ID数组
 * @returns 权重数据
 */
export const getIssuesPercent = (params: GetIssuesPercentParams) =>
  request<IssueWeightResponse[]>({
    url: '/esg/msciReport/getIssuesPercent',
    method: 'POST',
    data: {
      industryId: String(params.industryId),
      issuesIds: params.issuesIds,
    },
  });

/**
 * 从接口响应中提取权重数据
 * @param res 接口响应数据
 * @returns 权重数据数组
 */
export const extractIssuesWeight = (res: unknown): IssueWeightResponse[] => {
  if (!res) return [];
  // 处理 AxiosResponse 结构
  type ResponseData = { data?: IssueWeightResponse[] } | IssueWeightResponse[];

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  // 尝试从不同层级提取数据
  if (Array.isArray(resData)) {
    return resData;
  }

  if (resData && typeof resData === 'object' && 'data' in resData) {
    const innerData = resData.data;
    if (Array.isArray(innerData)) {
      return innerData;
    }
  }

  return [];
};

/**
 * 根据权重数据更新议题的权重信息
 * @param issues 原始议题数据
 * @param weightData 权重数据
 * @returns 更新后的议题数据
 */
export const updateIssuesWithWeight = (
  issues: IndustryIssueItem[],
  weightData: IssueWeightResponse[],
): IndustryIssueItem[] => {
  // 创建权重映射表：issueId -> weight
  const weightMap = new Map<number, string>();
  weightData.forEach(pillar => {
    pillar.issues.forEach(issue => {
      weightMap.set(issue.id, issue.weight);
    });
  });

  // 更新议题的权重
  return issues.map(issue => {
    const issueId = Number(issue.id);
    const weight = weightMap.get(issueId);
    if (weight !== undefined) {
      return {
        ...issue,
        percent: Number.parseFloat(weight) || 0,
      };
    }
    return issue;
  });
};

export interface ReferFile {
  name: string;
  url: string;
  content: string;
}

export interface AddMsciRatingParams {
  period: string;
  businessName: string;
  industry: string;
  industrySub: string;
  environmentalIssues?: string;
  socialIssues?: string;
  governanceIssues?: string;
  referFiles: ReferFile[];
}

/**
 * 提交MSCI评级
 * @param params 评级参数
 * @returns 提交结果
 */
export const addMsciRating = (params: AddMsciRatingParams) =>
  request({
    url: '/esg/msciReport/add',
    method: 'POST',
    data: params,
  });

export interface EditMsciRatingParams extends AddMsciRatingParams {
  id: number;
}

/**
 * 编辑MSCI评级
 * @param params 评级参数（包含id）
 * @returns 提交结果
 */
export const editMsciRating = (params: EditMsciRatingParams) =>
  request({
    url: '/esg/msciReport/editAndRating',
    method: 'POST',
    data: params,
  });

/**
 * AI评分聊天接口
 * @param reportId 报告ID
 * @returns 提交结果
 */
export const aiMsciScoreChatting = (reportId: number) =>
  request({
    url: '/esg/msciReport/aiMsciScoreChatting',
    method: 'POST',
    data: { reportId },
  });

export interface AiAsBusinessInfoParams {
  referFiles: ReferFile[];
}

export interface AiAsBusinessInfoResponse {
  name: string;
  year: string;
  industry: number;
  industrySub: number;
}

/**
 * AI解析企业信息接口
 * @param params 参数对象，包含文件列表
 * @returns 企业信息
 */
export const aiAsBusinessInfo = (params: AiAsBusinessInfoParams) =>
  request<AiAsBusinessInfoResponse>({
    url: '/esg/msciReport/aiAsBusinessInfo',
    method: 'POST',
    data: params,
  });

/**
 * 从接口响应中提取AI解析的企业信息
 * @param res 接口响应数据
 * @returns 企业信息
 */
export const extractAiAsBusinessInfo = (
  res: unknown,
): AiAsBusinessInfoResponse | null => {
  if (!res) return null;
  // 处理 AxiosResponse 结构
  type ResponseData =
    | { data?: AiAsBusinessInfoResponse }
    | AiAsBusinessInfoResponse;

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  if (resData && typeof resData === 'object') {
    if ('data' in resData && resData.data) {
      return resData.data as AiAsBusinessInfoResponse;
    }
    return resData as AiAsBusinessInfoResponse;
  }

  return null;
};

export interface MsciRatingDetail {
  id: number;
  companyId: number;
  orgId: number;
  period: string;
  reportName: string | null;
  businessName: string;
  type: number;
  indicatorFiles: unknown;
  standardIds: unknown;
  referFiles: ReferFile[];
  reportUrl: string | null;
  deleted: number;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  orgName: string | null;
  industry: string;
  industrySub: string;
  environmentalIssues: string;
  socialIssues: string;
  governanceIssues: string;
  environmentalScore: string;
  socialScore: string;
  governanceScore: string;
  environmentalPercent: string | null;
  socialPercent: string | null;
  governancePercent: string | null;
  score: string;
  rating: string;
}

/**
 * 获取MSCI评级详情
 * @param id 评级ID
 * @returns 评级详情
 */
export const getMsciRatingDetail = (id: number) =>
  request<MsciRatingDetail>({
    url: '/esg/msciReport/info',
    params: { id },
    method: 'GET',
  });

/**
 * 从接口响应中提取详情数据
 * @param res 接口响应数据
 * @returns 详情数据
 */
export const extractMsciRatingDetail = (
  res: unknown,
): MsciRatingDetail | null => {
  if (!res) return null;
  // 处理 AxiosResponse 结构
  type ResponseData = { data?: MsciRatingDetail } | MsciRatingDetail;

  const resObj = res as { data?: ResponseData };
  const resData = resObj?.data as ResponseData;

  if (resData && typeof resData === 'object') {
    if ('data' in resData && resData.data) {
      return resData.data as MsciRatingDetail;
    }
    return resData as MsciRatingDetail;
  }

  return null;
};
