/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-03-20 18:23:04
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-04-07 11:47:22
 */
import { request } from '@src/api/request';
import { CancelToken } from 'axios';

import {
  CategoryData,
  ClassifyData,
  CockpitData,
  InfoData,
  QuantityData,
} from './type';
import { Org } from '../AccountingList/type';

export const getEarliestYear = () =>
  request<{
    data: { yearEarliest: number; yearLatest: number; years: number[] };
  }>({
    method: 'GET',
    url: '/enterprise/computation/getEarliestYear',
  });

export const getDataBoardOrg = (params: { cYear: number | string }) =>
  request<{ data: Org[] }>({
    method: 'get',
    url: '/enterprise/computation/task/dataBoard/orgTree',
    debounced: true,
    params,
  });

export const getDataBoardOrgAuth = (params: { cYear: number | string }) =>
  request<{ data: Org[] }>({
    method: 'get',
    url: '/enterprise/computation/task/dataBoard/orgTreeAuth',
    debounced: true,
    params,
  });

export const getDataCockpit = (params: {
  type: number;
  period: string;
  foreignId?: number;
  orgId: number;
}) =>
  request<{ data: CockpitData[] }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataCockpit',
    params,
  });

// 近几年排放量与基准年对比
export const getDataQuantityComparison = (params: {
  type: number;
  yearNum: string | number;
  orgId: number;
}) =>
  request<{ data: QuantityData[] }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataYearQuantityComparison',
    params,
  });

// 近几年排放强度与基准年对比
export const getDataIntensityComparison = (
  params: {
    type: number;
    yearNum: string | number;
    orgId: number;
    indicatorId: number;
  },
  cancelToken?: CancelToken,
) =>
  request<{ data: QuantityData[] }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataYearQuantityIntensityComparison',
    params,
    cancelToken,
  });

// 排放量明细数据
export const getDataQuantityDetail = (params: {
  type: number;
  period: string;
  orgId: number;
}) =>
  request<{
    data: {
      year: number;
      category: string;
      classify: string;
      nameCategoryData: InfoData[];
    }[];
  }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataYearQuantityDetail',
    params,
  });

// 排放量分类对比
export const getDataQuantityCateComparison = (params: {
  type: number;
  period: string;
  orgId: number;
  foreignId?: number;
}) =>
  request<{
    data: { categoryData: CategoryData[]; classifyData: ClassifyData[] };
  }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataQuantityComparison',
    params,
  });

// 获取范围一，二，三的堆叠图

// 获取分流图数据
export const getDataQuantityDiversion = (params: {
  type: number;
  period: string;
  orgId: number;
}) =>
  request<{
    data: {
      totalYearQuantity: number;
      categoryDataList: {
        emissionQuantity: string;
        category: string;
        classifyDataList: {
          emissionQuantity: string;
          category: string;
          sourceName: string;
        }[];
      }[];
    };
  }>({
    method: 'GET',
    url: '/enterprise/computation/data/dataQuantityDiversion',
    params,
  });

export const getIndicatorList = (params: { yearNum: number }) =>
  request<{
    data: { indicatorName: string; unitValue: string; indicatorId: number }[];
  }>({
    method: 'get',
    url: '/enterprise/computation/data/indicatorNameList',
    params,
  });

export const getTopEmission = (params: { period: string; orgId: number }) =>
  request<{ data: { name: string; emissionQuantity: number }[] }>({
    method: 'get',
    url: '/enterprise/computation/data/topEmission',
    params,
  });

export const getChildOrgEmissions = (params: {
  period: string;
  type: number;
  orgId?: number;
  computationId?: number;
}) =>
  request<{
    data: {
      orgName: string;
      categoryData: { category: string; emissionQuantity: number }[];
    }[];
  }>({
    method: 'get',
    url: '/enterprise/computation/data/dataQuantityOrgComparison',
    params,
  });

export interface IndustryData {
  /**
   * 企业评级行业百分比
   */
  ratingPercent: string;

  /**
   * 行业中位值
   */
  medianIndustryData: string;

  /**
   * 低于行业平均百分比
   */
  emissionCompany: string;

  /**
   * 企业评级
   */
  ratingCompany: string;

  /**
   * 高级行业平均百分比
   */
  avgIndustryPercent: string;

  /**
   * 行业最小值
   */
  minIndustryData: string;

  /**
   * 是否展示行业数据对标
   * 0 - 否
   * 1 - 是
   */
  isShowIndustryData: string;

  /**
   * 行业最大值
   */
  maxIndustryData: string;

  /**
   * 低于行业平均百分比
   */
  medianIndustryPercent: string;

  /**
   * 行业平均值
   */
  avgIndustryData: string;
}

export const getBoardIndustryData = (params: {
  period?: number;
  orgId: string;
  dataType: string; // 1 排放量 2 排放强度
  scopeType: '0' | '1'; // 1 包含范围三 0 不包含范围三
}) =>
  request<{
    data: IndustryData;
  }>({
    method: 'get',
    url: '/enterprise/industryDataBenchmarking/boardIndustryData',
    params,
  });

export const getStandardYearList = () =>
  request<{ data: string[] }>({
    method: 'get',
    url: '/enterprise/reduction/plan/years',
  });

export const getStandardYear = () =>
  request<{ data: { reductionPlan: { standardYear: string } } }>({
    method: 'get',
    url: '/enterprise/reduction/plan/info',
  });

export const saveStandardYear = (data: { standardYear: string }) =>
  request({
    method: 'post',
    url: '/enterprise/reduction/plan/save',
    data,
  });

type AiEmissionInfo = {
  aiContent: string;
  /** //是否存在ai减排信息 0 否 1 是 */
  chatResult: '0' | '1';
  topicId: number;
  id: number;
};

export const getAiEmissionInfo = (params: { orgId: number; year: number }) =>
  request<{
    data: AiEmissionInfo;
  }>({
    method: 'get',
    url: '/enterprise/computation/getAiEmissionInfo',
    params,
  });

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

export const getNewTopicId = (params: { topicId: number }) =>
  request<{ data: { topicId: number } }>({
    method: 'get',
    url: '/ai/chat/askOrgAiAssistant',
    params,
  });
