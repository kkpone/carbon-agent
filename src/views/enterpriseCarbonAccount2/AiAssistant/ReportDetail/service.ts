import { request } from '@src/api/request';
import { Dicts } from '@src/hooks/useFieldUnitDictSource';
import { CancelTokenSource } from 'axios';

interface Committee {
  coverage: string; // 职责范围
  committee: string; // 相关职务或委员会--相关职位和/或委员会的名称
  responsibility: string; // 职责
  reportingLine: string; // 报告制度
  reportFrequency: string; // 报高频率--向董事会报告气候相关问题的频率
}

interface Scope3Emission {
  calculation: string; // 排放计算方法
  category: string; // 排放分类名称
  evaluationStatus: string; // 评估状态
  emissions: string; // 报告年的排放量（公吨CO2e）
}

interface Reduction {
  Scope: string; // 范围
  referenceNumber: string; // 目标参考号
  targetType: string; // 目标类型
  baseYearReduction: string; // 基准年减排百分比
  YearTarget: string; // 目标年度
  'science-based': string; // 是否是科学碳目标（SBT）
}

interface ReductionPropose {
  initiativeCategory: string; // 倡议类型
  savingsCO2e: string; // 减少排放量--估年度CO2e节省量（公吨CO2e）
  savingsMoney: string; // 减少费用--年度货币节省（按照CC0.4说明的单位货币）
  emissionsOccur: string; // 涉及范围 --减排发生的（多个）范围或范围三类别
  investmentRequired: string; // 所需投资--所需投入（按照CC0.4说明的单位货币）
  paybackPeriod: string; // 回报周期--投资回收期
  initiativeType: string; // 行动类型
}

export interface ReportData {
  id: number; // id
  companyName: string; // 企业排名列表
  name: string; // CITROSUCO-Climate Change 2022
  year: string; // 年份
  scores: string; // cdp分数
  cdpUrl: string; // 报告url
  industry: null | string; // 所属行业
  reportStartDate: string; // 报告年开始时间
  reportEndDate: string; // 报告年结束时间
  reportDateCycle: null | string; // 时间周期
  currency: string; // 货币单位
  committee: Committee[]; // 治理框架
  transitionPlan: string; // 商业战略
  scope1Emissions: string; // 范围一排放量
  scope2EmissionsLocation: string; // 范围二,以地理位置为基准 排放量
  scope2EmissionsMarket: string; // 范围二，基于市场（如适用）排放量
  scope3Emission: Scope3Emission[]; // 范围三数据
  scope3Total: string; // 范围三总排放量
  yearEmissionMarket: string; // 报告年总排放量（基于市场）
  yearEmissionLocation: string; // 报告年总排放量（基于位置）
  reduction: Reduction[]; // 减排目标
  reductionPropose: ReductionPropose[]; // 减排倡议
  energy: string; // 能耗情况
  renewable: string; // 可再生来源产生的MWh
  nonRenewable: string; // 不可再生来源产生的MWh
  renewableTotal: string; // 总计（可再生和不可再生）MWh
  revenue: string; // 年营收
  reportSource: 1 | 2; // 报告来源 1 报告库 2 用户上传
}

export const getCdpReportDetail = (data: { reportId: number }) =>
  request<{
    data: { json: any };
  }>({
    method: 'POST',
    data,
    params: {
      reportId: data.reportId,
    },
    url: '/enterprise/cdpReportData/cdpReportDetail',
  });

export const getReportAnalysis = (params: { reportId: number }) =>
  request<{
    data: ReportData;
  }>({
    method: 'GET',
    params,
    url: '/enterprise/cdpReportData/reportAnalysis',
  });

interface SuggestionFile {
  name: string;
  id?: number;
  url: string;
}

interface Suggestion {
  content: string;
  suType: string;
  reportId: number;
  suggestionFiles?: SuggestionFile[];
}

export const postSuggestion = (data: Suggestion) =>
  request<{
    data: { code: number };
  }>({
    method: 'POST',
    data,
    url: '/enterprise/suggestion/add',
  });

interface IMessage {
  id: number;
  userContent: string;
  aiContent: string;
  topicId: number;
  likeStatus: number;
  createTime: string;
}

export const getTopicChat = (params: { reportId?: string }) =>
  request<{
    data: IMessage[];
  }>({
    method: 'GET',
    params,
    url: '/enterprise/chat/topicChat',
  });

export const chatReport = (data: {
  query: string;
  topicId?: string;
  reportId: number;
  CancelToken: CancelTokenSource['token'];
}) =>
  request<{
    data: { code: number };
  }>({
    method: 'POST',
    data,
    url: '/enterprise/chat/reportChatting',
    cancelToken: data.CancelToken,
  });

export const getNewTopicId = () =>
  request<{ data: { sid: number } }>({
    method: 'GET',
    url: '/enterprise/chat/getSid',
  });

export const getMoreList = () =>
  request<{ data: { id: number; userContent: string }[] }>({
    method: 'GET',
    url: '/enterprise/chat/moreList',
  });

export const getDictList = (params: { dictTypes: string }) =>
  request<{ data: { cdp_industry: Dicts[] } }>({
    method: 'GET',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params,
  });
