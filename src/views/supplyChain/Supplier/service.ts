import { request } from '@src/api/request';
import { SupplierDetails, SupplierProduct } from '@src/views/supplyChain/type';

import {
  ProductEmissionCompareProduct,
  ProductEmissionCompareResult,
  SupplierProductEmissionOverviewAccountName,
  SupplierProductEmissionOverviewDetail,
  SupplierProductFilterOptions,
  SupplierProductEmissionOverviewAccount,
  SupplierProductEmissionOverviewType,
  SupplierEnterpriseEmissionOverviewOptions,
  SupplierEnterpriseEmissionOverviewDetail,
  SupplierEnterpriseEmissionManageYearGroup,
} from './type';

type AiAdviceResponse = {
  chatResult: string;
  aiContent: string;
  topicId: number;
};

export const addSupplier = (data: SupplierDetails & { inviteFlag?: boolean }) =>
  request<{ data: number }>({
    method: 'POST',
    url: '/chain/supplier/add',
    data,
  });

export const getSupplierProductList = (params: {
  supplierId: number;
  pageNum: number;
  pageSize: number;
  name?: string;
  specification?: string;
}) =>
  request<{ total: number; rows: SupplierProduct[] }>({
    method: 'get',
    url: '/chain/supplier/purchase/goods/list',
    params,
  });

export const getSupplierProductFilterOptions = (params: {
  supplierId: number;
}) =>
  request<{ data: SupplierProductFilterOptions }>({
    method: 'get',
    url: '/chain/supplier/purchase/goods/list/all',
    params,
  });

export const addSupplierProduct = (
  data: Omit<SupplierProduct, 'id'> & { supplierId: number },
) =>
  request({
    method: 'post',
    url: '/chain/supplier/insert/goods',
    data,
  });

export const editSupplierProduct = (data: SupplierProduct) =>
  request({
    method: 'post',
    url: '/chain/supplier/edit/goods',
    data,
  });

export const getSupplierProductDetails = (params: { id: number }) =>
  request<{ data: SupplierProduct }>({
    method: 'get',
    url: '/chain/supplier/info/goods',
    params,
  });

export const selectSupplierProduct = (data: {
  purchaseGoodsIds: number[];
  supplierId: number;
}) =>
  request({
    method: 'post',
    url: '/chain/supplier/select/goods/save',
    data,
  });

export const deleteSupplierProduct = (params: { id: number }) =>
  request({
    method: 'get',
    url: '/chain/supplier/deleted/goods',
    params,
  });

export const getRecordList = (params: { supplierId: number }) =>
  request<{ data: Record<string, any>[] }>({
    url: '/chain/supplier/log/list',
    params,
  });

export const getProductEmissionCompareProducts = (params: {
  supplierId: number;
}) =>
  request<{ data: ProductEmissionCompareProduct[] }>({
    method: 'get',
    url: '/chain/data/emission/compare/products',
    params,
  });

export const getProductEmissionCompare = (params: {
  supplierId: number;
  purchaseGoodsId: number;
}) =>
  request<{ data: ProductEmissionCompareResult }>({
    method: 'get',
    url: '/chain/data/emission/compare',
    params,
  });

export const getSupplierProductEmissionOverviewAccounts = (params: {
  supplierId: number;
  pageNum: number;
  pageSize: number;
  productName?: string;
  type?: SupplierProductEmissionOverviewType;
}) =>
  request<{
    data: { rows: SupplierProductEmissionOverviewAccount[]; total: number };
  }>({
    method: 'get',
    url: '/chain/data/emission/overview/accounts',
    params,
  });

export const getSupplierProductEmissionOverviewAccountNames = (params: {
  supplierId: number;
  supplierDataId: number;
}) =>
  request<{ data: SupplierProductEmissionOverviewAccountName[] }>({
    method: 'get',
    url: '/chain/data/emission/overview/account-names',
    params,
  });

export const getSupplierProductEmissionOverviewDetail = (params: {
  supplierId: number;
  supplierDataId: number;
  stage?: number;
}) =>
  request<{ data: SupplierProductEmissionOverviewDetail }>({
    method: 'get',
    url: '/chain/data/emission/overview/detail',
    params,
  });

export const getSupplierProductEmissionOverviewAiAdvice = (params: {
  supplierId: number;
  supplierDataId: number;
}) =>
  request<{ data: AiAdviceResponse }>({
    method: 'get',
    url: '/chain/data/emission/overview/ai/advice',
    params,
  });

export const getSupplierEnterpriseEmissionOverviewOptions = (params: {
  supplierId: number;
}) =>
  request<{ data: SupplierEnterpriseEmissionOverviewOptions }>({
    method: 'get',
    url: '/chain/data/emission/enterprise/overview/options',
    params,
  });

export const getSupplierEnterpriseEmissionOverviewDetail = (params: {
  supplierId: number;
  year?: string;
  standard?: number;
  yearNum?: number;
  scopeType?: number;
  supplierDataId?: number;
  selectedSupplierDataIds?: string;
  trendMetric?: string;
  indicatorId?: string | number;
  benchmarkDataType?: string;
  benchmarkScopeType?: string;
}) =>
  request<{ data: SupplierEnterpriseEmissionOverviewDetail }>({
    method: 'get',
    url: '/chain/data/emission/enterprise/overview/detail',
    params,
  });

export const getSupplierEnterpriseEmissionOverviewAiAdvice = (params: {
  supplierId: number;
  supplierDataId: number;
}) =>
  request<{ data: AiAdviceResponse }>({
    method: 'get',
    url: '/chain/data/emission/enterprise/overview/ai/advice',
    params,
  });

export const getSupplierEnterpriseEmissionManageRecords = (params: {
  supplierId: number;
}) =>
  request<{ data: SupplierEnterpriseEmissionManageYearGroup[] }>({
    method: 'get',
    url: '/chain/data/emission/enterprise/manage/records',
    params,
  });
