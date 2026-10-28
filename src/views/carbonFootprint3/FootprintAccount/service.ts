import { request } from '@src/api/request';
import { SkuCount } from '@src/components/SkuCountLabel/type';
import { ProductImportTableList } from '@src/views/carbonFootprint/components/ImportFile/type';
import { AxiosResponse } from 'axios';

import {
  AccountReferListData,
  AccountReferListParams,
  ShareAccountPost,
} from './ProductDetail/AccountListCard/type';
import { ProductAccountingList } from './component/ProductSelectAccount/type';
import {
  AccountProductAddData,
  AccountProductData,
  AccountProductDataParams,
  AccountProductEditData,
  AccountProductIdNextParams,
  ModelShareAddParams,
  ModelShareRecord,
  ModelShareSupplier,
  ModelShareSupplierListParams,
  ProductAccountingListParams,
  ProductImportParams,
  ShareAccountInfoById,
  ShareSub,
  SysShareModelActionParams,
  SysShareRecord,
} from './type';
import { BackTableData } from '../type';

/** 碳足迹核算 - 分享初始化 */
export function getShareInit() {
  return request<{ data: { id: number } }>({
    method: 'get',
    url: `footprint3/sysShare/init`,
  });
}

/** 碳足迹核算 - 分享初始化调用详情 */
export function getShareInfo(params: { id: number }) {
  return request<{ data: ShareAccountInfoById }>({
    method: 'get',
    url: `footprint3/sysShare/info`,
    params,
  });
}

/** 碳足迹核算 - 分享提交查看 */
export function postShareSub(data: { id: number; password?: string }) {
  return request<{ data: ShareSub }>({
    method: 'post',
    url: `footprint3/sysShare/checkPermit`,
    data,
  });
}

/** 碳足迹核算 - 分享提交 */
export function postShareAdd(data: ShareAccountPost) {
  return request<{ code: number }>({
    method: 'post',
    url: `footprint3/sysShare/add`,
    data,
  });
}

/** 碳足迹核算 - 分享记录 */
export function getSysShareRecordList(params: { accountId: number }) {
  return request<AxiosResponse<SysShareRecord[]>>({
    method: 'get',
    url: `footprint3/sysShare/record/list`,
    params,
  });
}

/** 碳足迹核算 - 分享快照同步回当前模型（POST，query: id=分享记录 id） */
export function postSysShareSyncModel(params: SysShareModelActionParams) {
  return request<{ code: number }>({
    method: 'post',
    url: `footprint3/sysShare/syncModel`,
    params,
  });
}

/** 碳足迹核算 - 分享快照新建模型（POST，query: id=分享记录 id） */
export function postSysShareNewModel(params: SysShareModelActionParams) {
  return request<{ code: number; data?: number }>({
    method: 'post',
    url: `footprint3/sysShare/newModel`,
    params,
  });
}

/** 碳足迹核算 - 模型共享供应商候选列表 */
export function getModelShareSupplierList(
  params: ModelShareSupplierListParams,
) {
  return request<AxiosResponse<BackTableData<ModelShareSupplier>>>({
    method: 'get',
    url: `chain/supplier/list`,
    params,
  });
}

/** 碳足迹核算 - 绑定供应商：获取已绑定供应商 id 列表（shareFlag=1） */
export function getAccountShareSupplierIds(params: { accountId: number }) {
  return request<AxiosResponse<number[]>>({
    method: 'get',
    url: `footprint3/accountShare/supplierId`,
    params,
  });
}

/** 碳足迹核算 - 确认模型共享 */
export function postModelShareAdd(data: ModelShareAddParams) {
  return request<{ code: number; data: number[] }>({
    method: 'post',
    url: `footprint3/accountShare/addShare`,
    data,
  });
}

/** 碳足迹核算 - 共享记录 */
export function getModelShareRecords(params: { accountId: number }) {
  return request<AxiosResponse<ModelShareRecord[]>>({
    method: 'get',
    url: `footprint3/accountShare/records`,
    params,
  });
}

/** 碳足迹核算 - 受共享方提交模型 */
export function postModelShareSubmit(data: { accountId: number }) {
  return request<{ code: number }>({
    method: 'post',
    url: `footprint3/accountShare/submit`,
    data,
  });
}

/** 碳足迹核算 - 列表数据 */
export function getAccountProductData(params: AccountProductDataParams) {
  return request<AxiosResponse<BackTableData<AccountProductData>>>({
    method: 'get',
    url: `footprint3/product/list`,
    params,
  });
}

/** 碳足迹核算 - 功能单位列表 */
export function getAccountListData(params: ProductAccountingListParams) {
  return request<AxiosResponse<BackTableData<ProductAccountingList>>>({
    method: 'get',
    url: `footprint3/account/list`,
    params,
  });
}

/** 碳足迹核算 - 被引用的下游产品列表 */
export function getAccountReferList(params: AccountReferListParams) {
  return request<AxiosResponse<BackTableData<AccountReferListData>>>({
    method: 'get',
    url: `footprint3/account/referList`,
    params,
  });
}

/** 碳足迹核算 - 产品信息 */
export function getAccountProductInfo(params: { id: number | string }) {
  return request<AxiosResponse<AccountProductData>>({
    method: 'get',
    url: `footprint3/product/info`,
    params,
  });
}

/** 碳足迹核算 - 新增产品 */
export function postAccountProductAddData(data: AccountProductAddData) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/add`,
    data,
  });
}

/** 碳足迹核算 - 编辑产品 */
export function postAccountProductEditData(data: AccountProductEditData) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/edit`,
    data,
  });
}

/** 碳足迹核算 - 产品信息 */
export function getAccountProductIdNext(params: AccountProductIdNextParams) {
  return request<AxiosResponse<AccountProductData | null>>({
    method: 'get',
    url: `footprint3/product/next`,
    params,
  });
}

/** 碳足迹核算 - 产品初始化 - 获取产品编码等 */
export function getAccountProductAddInit() {
  return request<AxiosResponse<AccountProductData>>({
    method: 'get',
    url: `footprint3/product/init`,
  });
}

/** 获取产品导入的数据 */
export function getFileProductImportApi(params: ProductImportParams) {
  return request<AxiosResponse<ProductImportTableList[]>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

export const getSkuCount = () =>
  request<{ data: SkuCount }>({
    method: 'get',
    url: '/footprint3/product/skuInfo',
  });

export const getProductTypeList = (params: {
  status?: number;
  search?: string;
  productTypeName?: string;
}) =>
  request<{
    data: {
      id: number;
      status: number;
      typeName: string;
      typeCode: string;
      productList: AccountProductData[];
    }[];
  }>({
    method: 'get',
    url: '/footprint3/product/listByType',
    params,
  });

export const getAllProductTypeList = (params: {
  status?: number;
  search?: string;
  productTypeName?: string;
}) =>
  request<{
    data: {
      id: number;
      status: number;
      typeName: string;
      typeCode: string;
      productList: AccountProductData[];
    }[];
  }>({
    method: 'get',
    url: '/footprint3/product/productTypeList',
    params,
  });

/**
 *
 * @param params status=2&pageNum=1&pageSize=10&productTypeName=&search=1
 * @returns
 */
export const getAllProductList = (params: {
  status?: number;
  search?: string;
  productTypeName?: string;
  pageNum?: number;
  pageSize?: number;
  productType?: string;
}) =>
  request<{
    data: {
      id: number;
      status: number;
      typeName: string;
      typeCode: string;
      productList: AccountProductData[];
    }[];
  }>({
    method: 'get',
    url: '/footprint3/product/productList',
    params,
  });

export const getSimpleProductList = () =>
  request<{
    data: { id: number; productName: string; specification: string }[];
  }>({
    method: 'get',
    url: '/footprint3/product/dropList',
  });

export const checkProductTypeRepeat = (data: {
  typeName?: string;
  typeCode?: string;
  id?: number;
}) =>
  request<{ data: boolean }>({
    method: 'post',
    url: '/footprint3/productType/checkExist',
    data,
  });

export const getInitProductTypeCode = () =>
  request<{ data: { typeCode: string } }>({
    method: 'get',
    url: '/footprint3/productType/init',
  });

export const addProductType = (data: {
  typeName: string;
  typeCode: string;
  remark: string;
  productIds: number[];
}) =>
  request({
    method: 'post',
    url: '/footprint3/productType/add',
    data,
  });

export const editProductType = (data: {
  id: number;
  typeName: string;
  typeCode: string;
  remark: string;
  productIds: number[];
}) =>
  request({
    method: 'post',
    url: '/footprint3/productType/edit',
    data,
  });

export const getProductTypeInfo = (params: { id: number }) =>
  request<{
    data: {
      typeName: string;
      typeCode: string;
      remark: string;
      productIds: number[];
    };
  }>({
    method: 'get',
    url: '/footprint3/productType/info',
    params,
  });

export const deleteProductType = (data: { id: number }) =>
  request({
    method: 'post',
    url: '/footprint3/productType/delete',
    data,
  });

export const getSimpleProductTypeList = () =>
  request<{ data: { typeCode: string; typeName: string }[] }>({
    method: 'get',
    url: '/footprint3/productType/list',
  });

/** 获取用户身份信息 */
export const getUserIdentity = () =>
  request<{
    code: number;
    msg: string;
    data: {
      duration: number;
      demoDataList: Array<{
        productName: string;
        productId: number;
        accountId: number;
        jumpUrl: string;
        residueDay: number;
      }>;
      userDemo: number;
      trialExpired: number;
      productList: any[];
    };
    lang: null;
  }>({
    method: 'GET',
    url: `/management/product/getUserIdentity`,
  });
