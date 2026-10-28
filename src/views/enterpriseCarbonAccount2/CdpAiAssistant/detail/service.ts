import { request } from '@api/request';

export interface IReport {
  id?: number; // ID
  companyId?: number; // 公司ID
  title?: string; // 标题
  status?: string; // 状态
  type?: string; // 类型
  reportId?: number; // 报告ID
  remark?: string; // 备注
  orgId?: string; // 组织ID
  industry?: string; // 行业
  year?: string; // 年份
  reportVersion?: string; // 报告版本
  otherContent?: string; // 其他内容
  business?: string; // 业务
  createTime?: string; // 创建时间
  updateTime?: string; // 更新时间
  createBy?: string; // 创建人
  updateBy?: string; // 更新人
  language?: string; // 语言
  reportStatus?: string; // 报告状态
  reportStart?: string; // 报告开始时间
  reportEnd?: string; // 报告结束时间
  baseYearStart?: string; // 基准年开始时间
  baseYearEnd?: string; // 基准年结束时间
  totalRevenue?: string; // 总收入
  scope1Emissions?: string; // 范围1排放
  scope2EmissionsLocation?: string; // 范围2排放（位置基准）
  scope2EmissionsMarket?: string; // 范围2排放（市场基准）
  scope3Emission?: string; // 范围3排放
  lastYearReportId?: string; // 上一年报告ID
  companyDesc?: string; // 公司描述
  currency?: string; // 货币
  questionModule?: string; // 问卷模块
}

interface IEditReport extends IReport {
  id?: number;
}

export function editReport(data: IEditReport) {
  return request({
    method: 'POST',
    url: `/enterprise/cdp/report/edit`,
    data,
  });
}

export function getReportDetail(params: { id: number }) {
  return request<{ data: IReport }>({
    method: 'GET',
    url: `/enterprise/cdp/report/query`,
    params,
  });
}

export interface ApiResponse {
  code: number;
  msg: string;
  data: {
    reportId: number;
    scoreDataList: ScoreData[];
  };
  logEn: unknown; // 根据实际需要可定义更具体类型
}

export interface ScoreData {
  ruleType: number;
  /**  //ai打分状态 0 未打分 1 打分完成 2 ai打分失败 3 打分规则不存在 */
  scoreStatus: number;
  disclosurePercent: string | null;
  cognitionPercent: string | null;
  managePercent: string | null;
  leaderPercent: string | null;
  disclosurePercent1: string | null;
  disclosurePercent2: string | null;
  cognitionPercent1: string | null;
  cognitionPercent2: string | null;
  managePercent1: string | null;
  managePercent2: string | null;
  leaderPercent1: string | null;
  scores: string;
  weightedFlag?: number;
  baseScores?: string;
  finalScores?: string;
  manageWeightedPercent?: string | null;
  leaderWeightedPercent?: string | null;
  scoreCapGrade?: string | null;
  scoreCapReason?: string | null;
  failedEssentialCount?: number;
  essentialFailList?: EssentialIssue[];
  unknownEssentialCount?: number;
  essentialUnknownList?: EssentialIssue[];
  essentialCheckResult?: string;
  questionDataList: QuestionData[];
  ruleCounts: number;
  questionCounts: number;
  disable?: boolean;
}

export interface EssentialIssue {
  criteriaId?: number;
  ecCode?: string;
  problemTitle?: string | null;
  name?: string | null;
  result?: string;
  capGrade?: string | null;
  evidence?: string | null;
  applicableTarget?: string | null;
  applicableLevels?: string | null;
  summary?: string | null;
  judgementRule?: string | null;
  failImpact?: string | null;
  relatedQuestionCodes?: string | null;
  source?: string | null;
}

export interface QuestionData {
  id: number;
  questionCode: string;
  questionTitle: string;
  disclosure: string;
  cognition: string;
  manage: string;
  leader: string;
  suggestions: string;
  highAnswer: string;
  disclosureTotal: string;
  cognitionTotal: string;
  manageTotal: string;
  leaderTotal: string;
  /**  //ai打分状态 0 未打分 1 打分完成 2 ai打分失败 3 打分规则不存在 */
  scoreType: number;
  /** 是否满分，1 是满分 */
  scoreAll: number;
}

export function getAiScoreDataOnline(params: { reportId: number }) {
  return request<ApiResponse>({
    method: 'GET',
    url: `/enterprise/cdpReportAnswer/getAiScoreDataOnline`,
    params,
  });
}

export function getReportRuleData(params: { reportId: number }) {
  return request<ApiResponse>({
    method: 'GET',
    url: `/enterprise/cdpScoreRuleData/getReportRuleData`,
    params,
  });
}

export const postScoreByModelType = (data: {
  reportId: number;
  modelType?: '1' | '2' | '3' | '4';
}) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdp/reportData/aiCdpScoreModel`,
    data,
  });

export const postScoreByQuestionCode = (data: {
  reportId: number;
  questionCode: string;
}) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdp/reportData/aiCdpScoreSingle`,
    data,
  });

interface ReportData {
  id: number;
  title: string;
  questionId: string;
  content: string;
  userId: null;
  companyId: null;
  questionCode: string;
  reportId: number;
}

interface ReportInfo {
  id: number;
  companyId: number;
  title: null;
  status: string;
  type: string;
  reportId: number;
  remark: null;
  orgId: null;
  industry: string;
  year: string;
  reportVersion: string;
  otherContent: string;
  business: string;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
  language: string;
  reportStatus: string;
  reportStart: null;
  reportEnd: null;
  baseYearStart: null;
  baseYearEnd: null;
  totalRevenue: null;
  currency: null;
  scope1Emissions: null;
  scope2EmissionsLocation: null;
  scope2EmissionsMarket: null;
  scope3Emission: null;
  lastYearReportId: null;
  companyDesc: null;
}

interface Data {
  reportData: ReportData[];
  model: any;
  reportInfo: ReportInfo;
}

export function getReportDataInfo(params: { reportId: number }) {
  return request<{ data: Data }>({
    method: 'GET',
    url: `/enterprise/cdp/reportData/info`,
    params,
  });
}

export function generateReport(data: { id?: number }) {
  return request({
    method: 'POST',
    url: `/enterprise/cdp/report/GenerateReport`,
    data,
  });
}

export function deleteReport(params: { reportId?: number }) {
  return request({
    method: 'POST',
    url: `/enterprise/cdp/report/deleteReport`,
    params,
  });
}
