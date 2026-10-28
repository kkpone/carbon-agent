/**
 * @file 产品碳足迹
 */
import { BackendResponse } from '@api/types';
import { request, requestPython as http } from '@api/request';
import {
  BackendPages,
  FactorFeedback,
  SerachCarbonFactorPayload,
  SerachCarbonFactorResult,
} from './api-types';

// 因子反馈
export const addFactorFeedBack = (data: FactorFeedback) =>
  request<BackendResponse<null>>({
    url: `management/suggestion/add`,
    method: 'post',
    data,
  });

// S 创建问题反馈
// S 帮助中心QA接口
// 获取产品模型列表
// 创建产品模型

// 查看产品模型

// 删除产品模型

// 更新产品模型

// 获取生命周期对应阶段默认数据
// 获取生命周期原材料阶段

//

// 获取原材料根据里程计算列表

// 获取对照模型列表

// 文博创建产品模型需要的数据。。。。年份/规则/研究范围

// 创建原材料获取阶段

// wjh_排放因子搜索
export function SerachCarbonFactor(params: SerachCarbonFactorPayload) {
  return http<BackendPages<SerachCarbonFactorResult[]>>({
    url: `/carbon_footprint/search_carbon_emission_factor`,
    params: { page: 1, pageSize: 1, search_type: 'all', ...params },
  });
}

// S 获取碳阻迹首页下拉框数据
// S 获取碳阻迹首页统计结果数据
// S 获取Lca结果弹框数据

// S 获取数据对比数据
export function getContrast(id: string) {
  return http({
    url: `/carbon_footprint/data_comparison_product_info?product_id=${id}`,
    method: 'get',
  });
}

// 上传Excel

// 获取产品碳足迹阶段模板Excel文件
