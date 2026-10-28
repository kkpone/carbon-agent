import { ValueOf } from 'type-fest';

import {
  REPORT_ANALYZE_STATUS,
  REPORT_CLOSE_STATUS,
  REPORT_COLLECT_STATUS,
} from './constant';

export type SearchParams = {
  pageNum: number;
  pageSize: number;
  year?: string;
  industry?: number;
  type?: number;
  companyName?: string;
  scores?: string | string[];
  refreshFlag?: boolean;
};

export type Industry = {
  dictValue: number;
  dictLabel: string;
};

export type Score = {
  scores: string;
  counts: number;
  rate: number;
  comparePreYear: number | string;
  yearPercents: {
    year: string;
    percents: number | string;
  }[];
};

export type ReportOverview = {
  scorePercentsList: Score[];
  // 企业上传数量
  comReportCounts: number | string;
  // 我关注的数量
  collectCounts: number | string;
  // 最近浏览量
  browseCounts: number | string;
  // 报告数量
  reportCounts: number | string;
  companyRanking: {
    // cdp分数
    scores: string;
    // 企业名称
    companyName: string;
    // 单位营收排放强度
    unitIntensity: string;
  }[];
};

export type Report = {
  id: number;
  companyName: string;
  // 年份
  year: string;
  // 评分
  scores: string;
  // 行业
  industry: string;
  // 总营收
  revenue: string;
  // 范围一范围二排放量
  scopes: string;
  // 单位营收排放强度
  unitIntensity: string;
  scope1Emissions: string;
  scope2EmissionsLocation: string;
  // 报告收藏状态 1 收藏 0 未收藏
  collectStatus: ValueOf<typeof REPORT_COLLECT_STATUS>;
  // 报告来源 1 报告库 2 用户上传
  reportSource: 1 | 2;
};

export type ReportStatus = {
  closeStatus: ValueOf<typeof REPORT_CLOSE_STATUS>;
  uploadStatus: ValueOf<typeof REPORT_ANALYZE_STATUS>;
  uploadMessage: string;
  id: number | null;
};
