import { request } from '@src/api/request';

// 定义了一个名为 TerumoCorporation 的接口，描述了 Terumo 公司的相关信息
interface TerumoCorporation {
  // ID
  id: number;
  // 公司名称
  companyName: string;
  // 目标
  target: string;
  // 承诺类型
  commitmentType: string;
  // 备注
  remark: null;
  // 行业
  sector: string;
  // 组织类型
  organizationType: string;
  // sbti 状态
  sbtiStatus: string;
  // 短期目标
  shortTarget: string;
  // 零目标
  zeroTarget: string;
  // 对齐目标
  alignTarget: string;
  // 完整目标语言
  fullTargetLanguage: string;
  // 行动
  action: string;
  // 目标类型
  targetType: string;
  // 范围
  scope: string;
  // 目标雄心
  targetAmbition: string;
  // 基准年减排量
  baseYearReduction: number;
  // 基准年
  baseYear: string;
  // 目标措辞
  targetWording: string;
  // 承诺截止日期
  commitmentDeadline: string;
  // 地点
  location: string;
  // 地区
  region: string;
  // isin
  isin: string;
  // lei
  lei: string;
  // 承诺原因
  reasonCommitment: string;
  // 子类型
  subType: string;
  // 年份类型
  yearType: string;
  // 发布日期
  datePublished: string;
  // 公司温度
  companyTemperature: string;
  // 目标年份
  yearTarget: string;
}

interface Initiative {
  savingsCO2e: string;
  savingsMoney: string;
  emissionsOccur: string;
  initiativeCategory: string;
  investmentRequired: string;
  comment: string;
  paybackPeriod: string;
  initiativeType: string;
}

// 定义了一个名为 `BenchMarkDetailComparison` 的接口，用于描述基准详细比较的相关信息
export interface BenchMarkDetailComparison {
  // 范围 2 排放中位数
  scope2EmissionsMedian: number;
  // 减排项目发布
  reductionProjectPublish: string;
  // 类别行业
  categoryIndustry: {
    // 类别披露率
    categoryDisclosureRate: number;
    // 类别排放中位数
    categoryEmissionsMedian: number;
    // 类别名称
    categoryName: string;
    // 类别排放平均值
    categoryEmissionsAvg: number;
  }[];
  benchMarkYearSelect: string[];
  // 公司总评级
  totalRatingCompany: string;
  // 排放总量中位数
  emissionsTotalMedian: number;
  // 范围 1 排放平均值
  scope1EmissionsAvg: number;
  // 范围 3 发布率
  scope3PublishRate: number;
  // 行业 ID
  industryId: string;
  // 范围 2 排放平均值
  scope2EmissionsAvg: number;
  // 范围 3 公司评级
  scope3RatingCompany: string;
  // 范围 2 公司评级
  scope2RatingCompany: string;
  // 范围 3 排放平均值
  scope3EmissionsAvg: number;
  // 基准名称
  benchMarkName: string;
  // 基准公司数量
  benchMarkCompanyCounts: number;
  // 排放总量平均值
  emissionsTotalAvg: number;
  // 范围 1 公司评级
  scope1RatingCompany: string;
  /** 1 行业数据 2 当前企业数据 3 对比企业数据 */
  benchMarkDataType: string;
  // 减排内容
  reductionContent: string;
  // 基准年份
  benchMarkYear: number;
  // 范围 3 排放中位数
  scope3EmissionsMedian: number;
  // 范围 1 排放中位数
  scope1EmissionsMedian: number;
  // 短期目标
  shortTarget: string;
  /** 对齐目标 */
  alignTarget: string;
  /** 净零碳目标 */
  zeroTarget: string;
  /** 目标描述 */
  fullTargetLanguage: string;
  /** 减碳目标 */
  reduction: TerumoCorporation[];
  /** 减排项目 */
  reductionPropose: Initiative[];
  /** 减排目标来源 1 cdp 2 sbti */
  reductionSource: '1' | '2';
  targetWording: string;
}

export enum EBenchMarkDataType {
  BenchMark = '1',
  Company = '2',
  company = '3',
}

// 定义了一个名为 `EmissionsComparison` 的接口，用于描述排放比较的相关信息
interface EmissionsComparison {
  // 范围 2 排放中位数
  scope2EmissionsMedian: number;
  // 范围 2 排放平均值
  scope2EmissionsAvg: string;
  // 范围 3 排放平均值
  scope3EmissionsAvg: string;
  // 基准名称
  benchMarkName: string;
  // 基准数据类型
  benchMarkDataType: string;
  // 基准年份
  benchMarkYear: number;
  // 范围 1 排放平均值
  scope1EmissionsAvg: number;
  // 范围 3 排放中位数
  scope3EmissionsMedian: number;
  // 范围 1 排放中位数
  scope1EmissionsMedian: number;
}

// 定义了一个名为 `Data` 的接口，用于描述数据的相关信息
interface Data {
  // 基准详细比较
  benchMarkDetailComparison: BenchMarkDetailComparison[];
  // 是否显示行业数据
  isShowIndustryData: string;
  // 排放比较
  emissionsComparison: EmissionsComparison[];
  industryName: string;
}

// 定义了一个名为 `RootObject` 的接口，用于描述根对象的相关信息
interface RootObject {
  // 消息
  msg: string;
  // 代码
  code: number;
  // 数据
  data: Data;
}

// import { Org } from '../AccountingList/type';

// export const getTrendAnalysisOrgData = (params: { yearNum: number }) =>
//   request<{ data: Org[] }>({
//     method: 'get',
//     url: '/enterprise/computation/task/trendAnalysis/orgTree',
//     params,
//   });

// 定义了一个名为 Industry 的接口，描述了行业的属性
interface Industry {
  // 行业 ID
  industryId: number;
  // 年份
  year?: string;
}

// 定义了一个名为 Data 的接口，描述了数据的属性
interface ParamsData {
  /** 数据类型 1 排放量 2 排放强度 */
  dataType?: string;
  // 公司年份  //当前组织选择年份
  companyYear?: string;
  /** 基准年份 对比数据选择的年份 */
  benchMarkYear?: number;
  /** 基准类型 对比数据1 行业平均值 2 行业中位值 */
  benchMarkType?: string;
  // 行业列表
  industryList?: Industry[];
}

export const GetIndustryDataOverview = (data: ParamsData) =>
  request<RootObject>({
    url: `/enterprise/industryDataBenchmarking/industryDataOverview`,
    method: 'POST',
    data,
  });

export const getIndustryDataCompanyList = (params: { industyrName: string }) =>
  request<{
    data: { industryId: number; industyrName: string; year: number }[];
  }>({
    method: 'get',
    url: '/enterprise/industryDataBenchmarking/industryDataCompanyList',
    params,
  });
