import { request } from '@/api/request';

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

export const getAiScoreData = (params: { reportId: string }) =>
  request<ApiResponse>({
    method: 'GET',
    url: `/enterprise/cdpReportAnswer/getAiScoreData`,
    params,
  });

export const postStartScore = (data: { reportId: number; query?: string }) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdpReportAnswer/aiCdpScoreChatting`,
    data,
  });

export const postScoreByModelType = (data: {
  reportId: number;
  modelType?: '1' | '2' | '3' | '4';
}) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdpReportAnswer/aiCdpScoreModel`,
    data,
  });

export const postScoreBySingle = (data: { id: number; userAnswer: string }) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdpReportAnswer/aiCdpScoreSingle`,
    data,
  });

export const postScoreBySingleByOnline = (data: {
  id: number;
  reportId: number;
}) =>
  request<ApiResponse>({
    method: 'POST',
    url: `/enterprise/cdp/reportData/aiCdpScoreSingleSe`,
    data,
  });

export const getDownloadScoreExcel = (params: { reportId: number }) =>
  request<{ data: { url: string; name: string }; code: number }>({
    method: 'get',
    url: `/enterprise/cdpReportAnswer/export/excel`,
    params,
  });
