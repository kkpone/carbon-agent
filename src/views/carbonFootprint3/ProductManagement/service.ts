/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-01-09 11:17:02
 * @Date: 2023-01-03 14:41:44
 * @@description: 产品管理 - 接口地址
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';
import { BackTableData } from '../type';
import {
  ProductAttributeAddForm,
  ProductAttributeDetail,
  ProductAttributeEnumAdd,
  ProductAttributeEnumEdit,
  ProductAttributeEnumTableData,
  ProductAttributeEnumUpdate,
  ProductAttributeTableData,
  ProductAttributeTableParams,
  ProductAttributeUpdate,
  ProductLibraryAddData,
  ProductLibraryTableData,
  ProductLibraryTableDataDetail,
  ProductLibraryTableDataInit,
  ProductLibraryTableParams,
} from './type';

/** 产品库 - 初始化 */
export function getProductLibraryAddInit() {
  return request<AxiosResponse<ProductLibraryTableDataInit>>({
    method: 'get',
    url: `footprint3/product/init`,
  });
}

/** 产品库 - 列表数据 */
export function getProductLibraryTableData(
  params: ProductLibraryTableParams & { pageNum: number; pageSize: number },
) {
  return request<AxiosResponse<BackTableData<ProductLibraryTableData>>>({
    method: 'get',
    url: `footprint3/product/list`,
    params,
  });
}

/** 产品库 - 新增产品 */
export function postProductLibraryAddData(data: ProductLibraryAddData) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/add`,
    data,
  });
}

/** 产品库 - 删除产品 */
export function postProductLibraryDeleteData(data: { id: number | string }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/delete`,
    data,
  });
}

/** 产品库 - 编辑产品 */
export function postProductLibraryEditData(
  data: ProductLibraryTableDataDetail,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/product/edit`,
    data,
  });
}

/** 产品库 - 产品信息 */
export function getProductLibraryTableInfo(params: { id: number | string }) {
  return request<AxiosResponse<ProductLibraryTableDataDetail>>({
    method: 'get',
    url: `footprint3/product/info`,
    params,
  });
}

/** 产品属性 - 列表数据 */
export function getProductAttributeTableData(
  params: ProductAttributeTableParams & { pageNum: number; pageSize: number },
) {
  return request<AxiosResponse<BackTableData<ProductAttributeTableData>>>({
    method: 'get',
    url: `footprint3/sysExtra/list`,
    params,
  });
}

/** 产品属性 - 新增产品属性 */
export function postProductAttributeAdd(data: ProductAttributeAddForm) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtra/add`,
    data: {
      ...data,
      module: 0,
    },
  });
}

/** 产品属性 - 修改状态 */
export function postProductAttributeUpadate(data: ProductAttributeUpdate) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtra/updateStatus`,
    data,
  });
}

/** 产品属性 - 编辑产品属性 */
export function postProductAttributeEdit(
  data: ProductAttributeAddForm & { id: string },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtra/edit`,
    data: {
      ...data,
      module: 0,
    },
  });
}

/** 产品属性 - 详情 */
export function getProductAttributeDetail(params: { id: string }) {
  return request<AxiosResponse<ProductAttributeDetail>>({
    method: 'get',
    url: `footprint3/sysExtra/info`,
    params,
  });
}

/** 枚举值 - 列表数据 */
export function getProductAttributeEnumTableData(params: {
  extraId: string;
  pageNum: number;
  pageSize: number;
}) {
  return request<AxiosResponse<BackTableData<ProductAttributeEnumTableData>>>({
    method: 'get',
    url: `footprint3/sysExtraEnum/list`,
    params,
  });
}

/** 枚举值 - 新增枚举值 */
export function postProductAttributeEnumAdd(data: ProductAttributeEnumAdd) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtraEnum/add`,
    data,
  });
}
/** 枚举值 - 编辑产品属性 */
export function postProductAttributeEnumEdit(data: ProductAttributeEnumEdit) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtraEnum/edit`,
    data,
  });
}

/** 枚举值 - 修改状态 */
export function postProductAttributeEnumUpadate(
  data: ProductAttributeEnumUpdate,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/sysExtraEnum/updateStatus`,
    data,
  });
}
