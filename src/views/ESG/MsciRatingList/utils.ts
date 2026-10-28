/**
 * MSCI 评级列表数据提取工具函数
 */

export type MsciReportItem = {
  id: number;
  businessName?: string;
  orgName?: string;
  reportName?: string;
  period?: string | number;
  industry?: string;
  industrySub?: string;
  rating?: string;
  environmentalScore?: string | number;
  socialScore?: string | number;
  governanceScore?: string | number;
  environmentalPercent?: string;
  socialPercent?: string;
  governancePercent?: string;
};

export type MsciListResponse =
  | {
      data?: {
        data?: MsciReportItem[];
        list?: MsciReportItem[];
        rows?: MsciReportItem[];
        total?: number;
      };
      list?: MsciReportItem[];
      rows?: MsciReportItem[];
      total?: number;
    }
  | MsciReportItem[];

/**
 * 从响应数据中提取列表数组
 * @param data 响应数据
 * @returns 提取的列表数组
 */
export const pickList = (data?: MsciListResponse): MsciReportItem[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return (
    data.data?.data ||
    data.data?.list ||
    data.data?.rows ||
    data.list ||
    data.rows ||
    []
  );
};

/**
 * 从响应数据中提取总数
 * @param data 响应数据
 * @returns 提取的总数
 */
export const pickTotal = (data?: MsciListResponse): number => {
  if (!data || Array.isArray(data)) return data?.length || 0;
  return (
    data.data?.total ??
    data.total ??
    data.data?.list?.length ??
    data.data?.rows?.length ??
    data.list?.length ??
    data.rows?.length ??
    0
  );
};

/**
 * 从 API 响应中提取列表和总数
 * @param res API 响应对象
 * @returns 包含列表和总数的对象
 */
export const extractMsciListData = (res: { data?: MsciListResponse }) => {
  const rawData = res.data;
  const list = pickList(rawData);
  const total = pickTotal(rawData);
  return { list, total };
};
