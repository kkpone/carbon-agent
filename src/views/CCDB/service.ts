import { request } from '@api/request';

type DataItem = {
  id: number;
  title: string;
  titleUrl: string;
  ccdbIcon: string;
  content: string;
  jumpUrl: null;
};

type DataInfo = {
  one: DataItem[];
  three: DataItem[];
};

type Response = {
  code: number;
  msg: string;
  data: DataInfo;
  lang: null;
};

// 获取申请选项
export function ccloudCcdbInfo() {
  return request<Response>({
    method: 'GET',
    url: `/management/system/website/ccloudCcdbInfo`,
  });
}

interface List {
  code: number;
  msg: string;
  data: string[];
  lang: null;
}

export function ccdbSearchlist() {
  return request<List>({
    method: 'POST',
    url: `/management/system/factor/ccdbSearchlist`,
  });
}

export function associateWordCcdb(data: { name: string }) {
  return request<List>({
    method: 'POST',
    url: `/management/system/factor/associateWordCcdb`,
    data,
  });
}

export interface IRecommendInfo {
  institution: null | string;
  unit: string;
  year: string | null;
  isCollectFactor: string; // 0 未收藏 1 已收藏
  name: string;
  id: string;
  cValue: string;
  /** 是否加密 */
  isEncryption: '0' | '1';
  /** 0 未开通产品 1 已开通产品  */
  productPermissions: '0' | '1';
}

interface IRecommendList {
  code: number;
  msg: string;
  data: IRecommendInfo[];
  lang: null;
}

export function ccdbRecommendData() {
  return request<IRecommendList>({
    method: 'POST',
    url: `/management/system/factor/ccdbRecommendData`,
  });
}

export function addCcdbCollect(data: { factorId: string }) {
  return request({
    method: 'POST',
    url: '/management/system/collect/addCcdbCollect',
    data,
  });
}
/**
 * 表示响应的数据结构
 */
type TQueryData = {
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页的数量
   */
  pageSize: number;
  /**
   * 分母单位
   */
  factorUnitM: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 查询标识 key
   */
  queryKey: string;
  /**
   * 发布年份
   */
  year: string;
  /**
   * 发布国家
   */
  countries: string;
  /**
   * 签名（MD5 加密，由 name + timestamp + 密钥组成）
   */
  sign: string;
  /**
   * 时间戳
   */
  timestamp: string;
  sortField: string; // 排序字段 institution 发布机构 year 年份 cValue 因子值
  sortType: 'asc' | 'desc'; // asc 正序 desc 倒序
  institution: string;
  searchId: string;
  versionId: string;
};

/**
 * 表示一行数据的类型
 */
export type Row = {
  /**
   * 因子模式
   */
  factorPattern: string;
  /**
   * 年份
   */
  year: string | null;
  /**
   * 分数
   */
  scores: number;
  /**
   * 是否收集因子
   */
  isCollectFactor: string;
  /**
   * 描述
   */
  description: string | null;
  /**
   * 国家
   */
  countries: string | null;
  /**
   * 排放因子
   */
  emission_factor: string;
  /**
   * 机构
   */
  institution: string | null;
  /**
   * 单位
   */
  unit: string;
  /**
   * C 值
   */
  cValue: string;
  /**
   * 名称
   */
  name: string;
  /**
   * ID
   */
  id: string;
  /**
   * 因子
   */
  factor: string;

  /**
   * 规格/型号
   */
  specification: string;
  /** 是否加密 */
  isEncryption: '0' | '1';
  /** 0 未开通产品 1 已开通产品  */
  productPermissions: '0' | '1';
};

/**
 * 表示机构列表中的一项
 */
type InstitutionItem = {
  /**
   * 机构名称
   */
  institution: string;
  /**
   * 数量
   */
  counts: number;
  id: number;
};

/**
 * 整体的响应类型
 */
type SearchResponse = {
  /**
   * 总数
   */
  total: number;
  /**
   * 数据行数组
   */
  rows: Row[];
  /**
   * 状态码
   */
  code: number;
  /**
   * 消息
   */
  msg: string;
  /**
   * 查询标识 key
   */
  queryKey: string;
  /**
   * 总和总数
   */
  sumTotal: number;
  /**
   * 机构列表
   */
  institutionsList: InstitutionItem[];
  searchId: string;
  versionId: string;
};

export function factorCcdbListSearch(data: Partial<TQueryData>) {
  return request<SearchResponse>({
    method: 'POST',
    url: '/management/system/factor/factorCcdbListSearch',
    data,
  });
}

/**
 * 表示该数据结构的类型
 */
type NextData = {
  /**
   * 因子 ID
   */
  factorId: string;
  /**
   * 分母单位
   */
  factorUnitM: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 发布年份
   */
  year: string;
  /**
   * 发布国家
   */
  countries: string;
  /**
   * 排序字段
   */
  sortField: 'institution' | 'year' | 'cValue';
  /**
   * 搜索方向
   */
  searchNext: 'up' | 'down';
};

/**
 * 表示气体数据的类型
 */
type GasData = {
  /**
   * 因子单位
   */
  factorUnit: string;
  /**
   * 分母单位
   */
  factorUnitM: string;
  /**
   * 温室气体类型
   */
  greenhouseGasesType: string;
  /**
   * 因子值
   */
  factorValue: string;
  /**
   * ID
   */
  id: number;
  /**
   * 类型
   */
  type: string;
  /**
   * 有效单位
   */
  activeUnit: any;
};

/**
 * 表示主要数据的类型
 */
export type DataMain = {
  /**
   * 源 ID
   */
  sourceId: number;
  /**
   * 区域
   */
  area: any;
  /**
   * 因子模式
   */
  factorPattern: string;
  /**
   * 业务
   */
  business: any;
  /**
   * 年份
   */
  year: string;
  /**
   * 文档类型
   */
  documentType: any;
  /**
   * 描述
   */
  description: string;
  /**
   * 规格
   */
  specification: string;
  /**
   * 源级别
   */
  sourceLevel: any;
  /**
   * 国家
   */
  countries: string;
  /**
   * 源
   */
  source: string;
  /**
   * 机构
   */
  institution: string;
  /**
   * 单位
   */
  unit: string;
  /**
   * C 值
   */
  cValue: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 因子类型
   */
  factorType: string;
  /**
   * 公式
   */
  formula: any;
  /**
   * ID
   */
  id: string;
  /**
   * 气体数据
   */
  gasData: GasData[];
  /** 是否加密 */
  isEncryption: '0' | '1';
  /** 0 未开通产品 1 已开通产品  */
  productPermissions: '0' | '1';
};

/**
 * 整体的响应类型
 */
type QueryCcdbNextResponse = {
  /**
   * 消息
   */
  msg: string;
  /**
   * 代码
   */
  code: number;
  /**
   * 数据
   */
  data: DataMain;
};

export function queryCcdbNext(data: Partial<NextData>) {
  return request<QueryCcdbNextResponse>({
    method: 'POST',
    url: '/management/system/factor/queryCcdbNext',
    data,
  });
}

export function queryCcdbinfo(params: { id: string; searchId?: string }) {
  return request<QueryCcdbNextResponse>({
    method: 'GET',
    url: '/management/system/factor/queryCcdbinfo',
    params,
  });
}

export enum EDelType {
  word = '1',
  all = '2',
}

export interface IDelSearch {
  searchKeywords?: string;
  delType?: EDelType; // 1 搜索词清除 2 全部搜索记录清除
}

export function ccdbSearchDel(data: IDelSearch) {
  return request<QueryCcdbNextResponse>({
    method: 'POST',
    url: '/management/system/factor/ccdbSearchDel',
    data,
  });
}

type SortType = 'asc' | 'desc';

interface ICollectList {
  pageNum: number;
  /**
   * 每页大小
   */
  pageSize: number;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序字段
   */
  sortField?: string;
  /**
   * 排序类型
   */
  sortType?: SortType;
}

export function ccdbCollectList(data: ICollectList) {
  return request<SearchResponse>({
    method: 'POST',
    url: '/management/system/factor/ccdbCollectList',
    data,
  });
}

// 表示反馈信息的类型
type FeedbackInfo = {
  // 反馈的内容
  content: string;
  // 反馈的类型，1 表示因子反馈，2 表示其它反馈，3 表示官网因子反馈
  type: 1 | 2 | 3;
  // 产品分类，字典Carbon_Footprint中的值，此处示例为"CCDB"
  productType: string;
  // 联系人姓名
  clientName: string;
  // 公司/机构名称
  orgName: string;
  // 手机号码
  mobile: string;
  // 电子邮箱地址
  email: string;
  // 建议相关的文件数组
  suggestionFiles?: {
    // 文件名称
    name: string;
    // 文件对应的URL地址
    url: string;
  }[];
};

export const postSuggestion = (data: FeedbackInfo) =>
  request<{
    data: { code: number };
  }>({
    method: 'POST',
    data,
    url: '/management/suggestion/add',
  });
