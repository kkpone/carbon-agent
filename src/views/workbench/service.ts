/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 11:51:47
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-04-17 18:19:11
 */
import { request } from '@api/request';

export type ProductInfo = {
  createBy: string;
  createTime: string;
  disableIconUrl: string;
  functionName: string;
  hasPermission: 0 | 1;
  iconUrl: string;
  orderNum: number;
  params: {};
  path: string;
  productId: string;
  productName: string;
  productSubId: string;
  remark: null;
  searchValue: null;
  updateBy: null;
  updateTime: null;
  userFunctionId: number;
  userId: number;
  deleted: 0 | 1;
};

interface ListResType {
  code: number;
  msg: string;
  rows: [];
  total: number;
}

/**
 * @description 工作台常用功能列表
 * @param
 * @returns
 */
export function apiUserFunction() {
  return request<{
    data: { unChoseFunction: ProductInfo[]; choseFunction: ProductInfo[] };
  }>({
    method: 'get',
    url: '/management/job/base/user/function',
  });
}

/**
 * @description 工作台常用功能列表
 * @param params
 * @returns
 */
export function apiUserFunctionEdit(data) {
  return request<ListResType>({
    method: 'post',
    url: '/management/job/base/user/function/edit',
    data,
  });
}
/**
 * @description 资讯-文章列表
 * @param
 * @returns
 */
export function apiArticleList(params) {
  return request<ListResType>({
    method: 'get',
    url: '/management/job/base/article/list',
    params,
  });
}
/**
 * @description 资讯-文章详情
 * @param
 * @returns
 */
export function apiArticleInfo(params) {
  return request<ListResType>({
    method: 'get',
    url: '/management/job/base/article/info',
    params,
  });
}
/**
 * @description 资讯-产品动态
 * @param
 * @returns
 */
export function apiArticleProductList(params) {
  return request<ListResType>({
    method: 'get',
    url: '/management/job/base/list_saas',
    params,
  });
}
/**
 * @description 资讯-产品动态详情
 * @param
 * @returns
 */
export function apiArticleProductInfo(params) {
  return request<ListResType>({
    method: 'get',
    url: `management/job/base/dynamic`,
    params,
  });
}

/**
 * @description 下载附件记录
 * @param
 * @returns
 */
export function apiArticleDownload(params: any) {
  return request<any>({
    method: 'get',
    url: '/management/job/base/article/download',
    params,
  });
}
/**
 * @description 企业碳核算2.21echart图
 * @param
 * @returns
 */
export function apiCarbonPriceChart(params: { page_size: number }) {
  return request<any>({
    method: 'get',
    url: 'management/job/base/carbon/price/echar_new',
    params,
  });
}
