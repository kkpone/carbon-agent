import { request } from '@/api/request';
import { AppendixItem } from '@/components/Appendix/ShowList';

/**
 * 描述单个参考文件的类型
 * 包含文件名称和对应的URL地址
 */
type ESGReportReferFile = {
  name: string;
  url: string;
};

/**
 * 描述ESG报告相关数据的类型
 * 涵盖报告的各种属性、用户内容、AI生成内容、参考资源等信息
 */
export type ESGReportData = {
  id: number;
  /**
   * 用户输入的公司名称和要生成报告的年份等内容，格式为：
   * 用户公司名称：碳阻迹公司
   * 用户要生成的报告年份：2020
   * 用户要参考的ESG指标库数据：
   * 以下是报告对应的指标数据：
   * 指标名称：定量 - 单体单位
   * 数据项名称：百分比单位
   * 数据内容：2020年 1%
   * 指标名称：定量 - 单体单位
   * 数据项名称：单体单位
   * 数据内容：2020年 1英里
   * 指标名称：定量 - 单体单位
   * 数据项名称：复合单位
   * 数据内容：2020年 1t/km
   * 指标名称：社会指标一
   * 数据项名称：数值
   */
  userContent: string;
  /**
   * AI根据用户提供的信息和参考文件生成的对“ESG战略与管理体系”部分润色后的内容
   */
  aiContent: string;
  topicId: number;
  likeStatus: number;
  createTime: string;
  jsonList: null;
  referFiles: ESGReportReferFile[];
  referLink: { content: string }[];
  referText: { content: string }[];
  referContent: string;
};

export const getChatMessages = (params: { reportId: string }) =>
  request<{ data: ESGReportData[] }>({
    method: 'get',
    url: '/esg/chat/topicChat',
    params,
  });

export const getSid = (params: { reportId: string }) =>
  request<{ data: { sid: number } }>({
    method: 'get',
    url: '/esg/chat/getSid',
    params,
  });

export const getDataList = (params: { reportId: string }) =>
  request<{ data: { id: number; name: string; url: string; type: number }[] }>({
    method: 'get',
    url: '/esg/frameReport/dataList',
    params,
  });

/**
 * 描述单个参考文件的类型
 * 包含文件名称和对应的URL地址
 */
type ReferFile = {
  name: string;
  url: string;
};

/**
 * 描述碳阻迹相关业务请求数据的类型
 * 涵盖用户提问、会话ID、报告ID、AI处理类型、模型类型以及各类参考附件等信息
 */
export type BusinessRequest = {
  /**
   * 用户的提问内容，关于碳阻迹公司的介绍描述
   */
  query: string;
  /**
   * 会话的唯一标识符
   */
  topicId: string;
  /**
   * 报告的唯一标识符
   */
  reportId: number;
  /**
   * AI处理的类型，如润色（polish）、总结（summary）、扩充（expand）
   */
  // aiType: 'polish' | 'summary' | 'expand';
  /**
   * 模型类型，此处为字符串类型，值为"2"
   */
  // modelType: '2';
  /**
   * 文件附件信息数组，每个元素包含文件名称和URL
   */
  referFiles: ReferFile[];
  /**
   * 链接附件信息数组，每个元素为一个链接地址
   */
  referLink: {
    id?: string;
    content: string;
  }[];
  /**
   * 文本附件信息数组，每个元素为一段文本内容
   */
  referText: {
    id?: string;
    content: string;
  }[];
  appendix?: AppendixItem[];
  referContent?: string;
};
