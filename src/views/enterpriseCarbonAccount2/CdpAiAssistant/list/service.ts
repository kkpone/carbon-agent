import { request } from '@api/request';

interface IReport {
  year?: string; // 所属年度
  reportStatus?: string; // 报告状态  1 已完成 2 编辑中 3 ai生成中
}

export interface IReportItem {
  id: number;
  companyId: number; // 组织id
  title?: string | null; // 报告的标题
  corporateName?: string;
  /** 报告类型 1 cdp报告 2 用户上传报告生成的报告 */
  type?: string | null;
  reportId?: number | null; // 报告模板id
  remark?: string | null; // 报告备注
  orgId?: string | null; // 组织id
  industry: string; // cdp行业 字典 cdp_industry
  year: string; // 所属年度
  reportVersion: string; // 1完整 / 2简版
  otherContent: string; // 其他问卷内容
  business: string; // 业务-收入业务方向 字典 cdp_business
  reportStatus: string; // 报告状态  1 已完成 2 编辑中 3 ai生成中 4 ai生成完成
  questionsCounts: number; // 报告问题总数
  questionsCompleteCounts: number; // 报告已填写问题数
  /** 气候评分 */
  climateScore: string;
  /** 水安全评分 */
  waterScore: string;
  /** 森林评分 */
  forestsScore: string;
}

export function getReportList(params?: IReport) {
  return request<{ data: IReportItem[] }>({
    method: 'GET',
    url: `/enterprise/cdp/report/list`,
    params,
  });
}

interface IReportDetail {
  industry: string; // 行业-组织范围
  business: string; // 业务
  year: string; // 所属年度
  reportVersion: string; // 1完整 / 2简版
  otherContent: string; // 其他问卷内容
}

export interface IReportForm {
  industry: string; // 行业-组织范围
  business: string[]; // 业务
  year: string; // 所属年度
  reportVersion: string; // 1完整 / 2简版
  otherContent: string[]; // 其他问卷内容
  orgId: number; // 组织id
  question_module: string[]; // 问卷模块
}

export function createReport(data: IReportDetail) {
  return request<{ data: { id: number } }>({
    method: 'POST',
    url: `/enterprise/cdp/report/create`,
    data,
  });
}

export type ReportYearsData = { yearList?: string[] } | string[];

export function normalizeReportYears(result?: {
  data?: { data?: ReportYearsData };
}) {
  const data = result?.data?.data;
  if (Array.isArray(data)) {
    return data;
  }
  return data?.yearList || [];
}

export function getReportYears() {
  return request<{ data: ReportYearsData }>({
    method: 'GET',
    url: `/enterprise/cdpScore/yearList`,
  });
}

interface IReportQuickForm {
  reportStart: string; // 报告年开始日期
  reportEnd: string; // 报告年结束日期
  baseYearStart: string; // 基准年周期 开始日期
  baseYearEnd: string; // 基准年周期 结束日期
  currency: string; // 货币单位
  scope1Emissions: string; // 范围一排放量
  scope2EmissionsLocation: string; // 范围二，以地理位置为基准 排放量
  scope2EmissionsMarket?: string; // 范围二，基于市场（如适用）排放量
  scope3Emission: { id: string; value: string }[]; // 范围三排放数据
  totalRevenue: string;
}

interface IEnvironmentalReport extends IReportQuickForm {
  id?: number; // 报告ID
}

export function PostQuickCreate(data: IEnvironmentalReport) {
  return request({
    method: 'POST',
    url: `/enterprise/cdp/reportData/quickCreate`,
    data,
  });
}

export function GetQuickCreateInfo(params: { reportId: number }) {
  return request<{ data: IReportQuickForm }>({
    method: 'GET',
    url: `/enterprise/cdp/reportData/quickReportInfo`,
    params,
  });
}

/**
 * 文件相关信息类型
 * @property {string} fileUrl - 文件地址
 * @property {number} organizationId - 组织ID
 * @property {string} reportYear - 年份
 * @property {string} companyName - 公司名称
 * @property {string} reportTypeVersion - 报告版本（1完整版 / 2简版）
 * @property {'FS'} businessDirection - 业务方向（单选，字典cdp_business）
 */
type CdpReportInfo = {
  url: string; // 文件地址
  year: string; // 年份
  corporateName: string; // 公司名称
  reportVersion: string; // 1完整版 / 2简版
  business: string; // 业务方向 单选 字典cdp_business
};

/**
 * /cdpReportAnswer/analyzeCreateReport
 */
export function createReportFromWord(data: CdpReportInfo) {
  return request<{ data: { id: number } }>({
    method: 'POST',
    url: `/enterprise/cdpReportAnswer/analyzeCreateReport`,
    data,
  });
}
