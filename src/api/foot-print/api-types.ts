/**
 * @file api types
 */

import { FeedBackType } from '@src/components/Factor/utils';

export type SerachCarbonFactorPayload = {
  search: string;
  year?: string;
  country?: string;
  search_type?: string;
  page?: number;
  page_size?: number;
  factorType?: number | string;
  business?: number;
  description?: number;
  queryKey?: string;
  factorUnitM?: string;
};

export interface FileResponse {
  name: string;
  url?: string;
  uid: string;
}

export type FactorFeedback = {
  companyId: string | number; //		String	是	组织ID
  content: string; //		String	是	反馈内容
  type: FeedBackType;
  /**
   * 这个字段取自 products.productId 对应 BOSS 中的产品ID
   */
  productType: string;
  suggestionFiles: SuggestionFiles[]; // Object	是	附件
  // suggestionFiles.name		String	是	附件名
  // suggestionFiles.id		Number	是	id
  // suggestionFiles.url		String	是	附件url
};

type SuggestionFiles = {
  name: string;
  id?: number;
  url: string;
};

export interface BackendPages<T> {
  count: number;
  next: any;
  previous: any;
  queryKey?: string;
  results: T;
}
export interface SerachCarbonFactorResult {
  id: string;
  country: string;
  createtime: string;
  emission_factor: null | string;
  emission_factor_name: string;
  emission_factor_name_original: string;
  emission_factor_resource: string;
  emission_factor_unit: null | string;
  extra_information: null | string;
  is_use: boolean;
  modification: string;
  remarks: null | string;
  url: null | string;
  year: string;
  description: null | string;
  business: null | string;
  factorType: string;
  isCollectFactor: string;
  factorUse: string;
  unit_value?: string;
}

/**
 * 再生塑料中的类型
 */
export interface PlasticSearchFactor {
  area: null | string;
  business: string;
  year: string;
  // 0 未收藏 1 已收藏
  isCollectFactor: string;
  description: null | string;
  updateTime: string;
  sourceLevel: string;
  countries: string;
  remake: null | string;
  url: null | string;
  emission_factor: string;
  institution: string;
  unit: string;
  createTime: string;
  cValue: string;
  name: string;
  otherName: null | string;
  // 1 自有因子 2 收藏因子 3 碳因子
  factorUse: string;
  id: string;
  facilities: null | string;
  factor: string;
}

export interface ProductList {
  id: number;
  product_name: string;
  specification: string;
  sigle_functional_unit: string;
  year: string;
  system_boundary: string[];
  product_code: number;
  baseline: number | null;
}
