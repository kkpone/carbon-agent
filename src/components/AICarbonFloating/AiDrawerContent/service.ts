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
  dataType: 'json' | 'markdown';
  status: number;
  jsonList: Record<string, any>[] | null;
  referFiles: ESGReportReferFile[];
  referLink: string[];
  referText: string[];
  referContent: string;
};

export const getChatMessages = (params: { reportId: string }) =>
  request<{ data: ESGReportData[] }>({
    method: 'get',
    url: '/esg/chat/topicChat',
    params,
  });

export const getHistoryTopic = (params?: Record<string, any>) =>
  request<{ data: { id: number; topicTitle: string }[] }>({
    method: 'get',
    url: '/ai/chat/historyTopic',
    params,
  });

export const getMessagesByTopicId = (params: { topicId: string }) =>
  request<{ data: ESGReportData[] }>({
    method: 'get',
    url: '/ai/chat/topicChat',
    params,
  });

export const getSid = () =>
  request<{ data: { sid: number } }>({
    method: 'get',
    url: '/ai/chat/getSid',
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
  referLink: string[];
  /**
   * 文本附件信息数组，每个元素为一段文本内容
   */
  referText: string[];
  appendix?: AppendixItem[];
  referContent?: string;
  detail: boolean;
  stream: boolean;
  accountId?: number;
};

/**
 * 企业碳核算工具信息类型定义
 */
export interface EnterpriseCarbonToolInfo {
  /**
   * 搜索值，用于筛选，null表示无搜索值
   */
  searchValue: string | null;

  /**
   * 创建者标识
   */
  createBy: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 更新者标识，null表示未更新
   */
  updateBy: string | null;

  /**
   * 更新时间，null表示未更新
   */
  updateTime: string | null;

  /**
   * 备注信息，null表示无备注
   */
  remark: string | null;

  /**
   * 附加参数，为空对象表示无附加参数
   */
  params: {};

  /**
   * 工具ID
   */
  toolId: number;

  /**
   * 产品ID
   */
  productId: string;

  /**
   * 产品子ID
   */
  productSubId: string;

  /**
   * 产品名称
   */
  productName: string;

  /**
   * 功能名称
   */
  functionName: string;

  /**
   * 图标URL
   */
  iconUrl: string;

  /**
   * 禁用状态下的图标URL
   */
  disableIconUrl: string;

  /**
   * 排序序号
   */
  orderNum: number;

  /**
   * 访问路径
   */
  path: string;

  /**
   * 选择标识
   */
  choseflag: number;

  /**
   * 删除标识（1表示已删除）
   */
  deleted: number;

  /**
   * 权限标识（1表示有权限）
   */
  hasPermission: number;

  /**
   * 固定标识
   */
  fixed: number;

  /**
   * 类型，null表示无类型
   */
  type: string | null;
}

export const getToolBar = (params: {
  /** 1 产品碳足迹减排推荐 2 企业碳核算减排推荐 3 企业碳核算预测 4 企业碳核算措施 5 碳中和 6 ai助手引导项 */
  type: 1 | 2 | 3 | 4 | 5 | 6;
}) =>
  request<{ data: { choseFunction: EnterpriseCarbonToolInfo[] } }>({
    method: 'get',
    url: '/management/job/base/user/toolBar',
    params,
  });

export const getQuestionGuideByMsg = (params: { topicId: number }) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/ai/chat/getQuestionGuide',
    params,
  });

export const getQuestionGuide = (params: { topicId: number }) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/enterprise/chat/getQuestionGuide',
    params,
  });

export const getFootprint3QuestionGuide = (params: { accountId: number }) =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/footprint3/chat/getQuestionGuide',
    params,
  });

export const getNormalQuestionGuide = () =>
  request<{ data: { userContent: string; id: number }[] }>({
    method: 'get',
    url: '/ai/chat/moreListWeb',
  });

export const deleteTopic = (data: { topicId: number }) =>
  request<{ data: { sid: number } }>({
    method: 'post',
    url: '/ai/chat/deleteTopic',
    data,
    params: data,
  });
