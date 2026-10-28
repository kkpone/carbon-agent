import { request } from '@src/api/request';

import { ProductSupplierFilterOptions } from './type';
import { ProductSupplier, PurchaseProduct, SupplierDetails } from '../type';

export const getPurchaseProductDetails = (params: {
  purchaseGoodsId: number;
}) =>
  request<{ data: PurchaseProduct }>({
    method: 'get',
    url: '/chain/goods',
    params,
  });

export const addPurchaseProduct = (
  data: Omit<PurchaseProduct, 'purchaseGoodsId'>,
) =>
  request<{ data: { purchaseGoodsId: number } }>({
    method: 'post',
    url: '/chain/goods/add',
    data,
  });

export const editPurchaseProduct = (data: PurchaseProduct) =>
  request({
    method: 'post',
    url: '/chain/goods/edit',
    data,
  });

export const getProductSupplierList = (params: {
  purchaseGoodsId: number;
  pageNum: number;
  pageSize: number;
  companyName?: string;
}) =>
  request<{ total: number; rows: ProductSupplier[] }>({
    method: 'get',
    url: '/chain/goods/supplier/list',
    params,
  });

export const getProductSupplierFilterOptions = (params: {
  purchaseGoodsId: number;
}) =>
  request<{ data: ProductSupplierFilterOptions }>({
    method: 'get',
    url: '/chain/goods/supplier/list/all',
    params,
  });

export const addProductSupplier = (
  data: SupplierDetails & { purchaseGoodsId: number },
) =>
  request({
    method: 'post',
    url: '/chain/goods/supplier/add',
    data,
  });

export const deleteProductSupplier = (params: { id: number }) =>
  request({
    method: 'get',
    url: '/chain/goods/supplier/deleted',
    params,
  });

export const selectProductSupplier = (data: {
  purchaseGoodsId: number;
  supplierIds: number[];
}) =>
  request({
    method: 'post',
    url: '/chain/goods/select/supplier/save',
    data,
  });
