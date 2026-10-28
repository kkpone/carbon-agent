import { request } from '@/api/request';

export const getFrameInfoByPeriod = (params: { period: number }) =>
  request<{ data: { id: number; name: string; referenceIds: string } }>({
    url: '/esg/frame/frame/infoByPeriod',
    params,
  });

// 描述参考文件的类型
type ReferFile = {
  name: string; // 附件名称
  url: string; // 附件地址
};

// 描述整体数据的类型
type OrgReportData = {
  orgId: number; // 组织实体
  period: string; // 报告年度
  indicatorType: 0 | 1; // 指标类型:0ESG，1用户上传
  indicatorFiles?: {
    name: string; // 附件名称
    url: string; // 附件地址
  };
  standardIds: string; // 参考标准ids
  referFiles: ReferFile[];
  referLink: string[];
  referText: string[];
  orgName?: string;
  userContent?: string;
};

export const postCreateReport = (data: OrgReportData) =>
  request<{ data: number }>({
    url: '/esg/frameReport/add',
    data,
    method: 'POST',
  });

// ESGReport.ts
interface IndicatorFiles {
  name: string;
  url: string;
}

export interface ReportData {
  companyId: number;
  frameId: null;
  id: number;
  indicatorFiles?: IndicatorFiles;
  indicatorType: number;
  lgUrl: null;
  orgId: number;
  orgName: string;
  outline: null;
  period: string;
  referFiles: Array<never>; // 空数组类型，若实际可能有数据需调整为具体类型
  referLink: Array<never>;
  referText: Array<never>;
  reportName: string;
  reportUrl: null;
  standardIds: string;
  /**
   * 0 大纲内容已生成
   * 1 报告内容已生成
   */
  state: 0 | 1;
  updateBy: string;
  updateTime: string; // 可优化为 Date 类型，但需处理反序列化逻辑
}

export const getReportList = (params: {
  reportName: string;
  state?: 0 | 1;
  pageSize?: number;
}) =>
  request<{ rows: ReportData[] }>({
    url: '/esg/frameReport/list',
    params: {
      pageSize: 10,
      pageNum: 1,
      ...params,
    },
    method: 'GET',
  });

export const delReport = (params: { id: number }) =>
  request<{ rows: ReportData[] }>({
    url: `/esg/frameReport/${params.id}`,
    method: 'DELETE',
  });

export const exportTempData = () =>
  request<Blob>({
    url: '/esg/frameReport/template/download',
    responseType: 'blob',
  });
