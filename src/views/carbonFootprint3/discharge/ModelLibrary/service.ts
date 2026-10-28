import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  CreateAccountingForm,
  IndustryCategory,
  IndustryCategoryForm,
  ModelItem,
  ModelListParams,
} from './type';
import { BackTableData } from '../../type';

/** 模型库 - 模型列表 */
export function getModelList(params: Partial<ModelListParams>) {
  return request<AxiosResponse<BackTableData<ModelItem>>>({
    method: 'get',
    url: `footprint3/model/list`,
    params,
  });
}

/** 模型库 - 模型详情 */
export function getModelInfo(params: { id: number | string }) {
  return request<AxiosResponse<ModelItem>>({
    method: 'get',
    url: `footprint3/model/info`,
    params,
  });
}

/** 模型库 - 新增模型 */
export function addModel(data: Record<string, any>) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/add`,
    data,
  });
}

/** 模型库 - 编辑模型 */
export function editModel(data: Record<string, any>) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/edit`,
    data,
  });
}

/** 模型库 - 复制模型 */
export function copyModel(data: Record<string, any>) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/model/copyModel`,
    data,
  });
}

/** 模型库 - 删除模型 */
export function deleteModel(data: { id: number | string }) {
  return request<{ code: number; data: number }>({
    method: 'delete',
    url: `footprint3/model/delete/${data.id}`,
  });
}

/** 模型库 - 行业类别列表 */
export function getIndustryCategoryList() {
  return request<AxiosResponse<IndustryCategory[]>>({
    method: 'get',
    url: `footprint3/model/industryMenu`,
  });
}

/** 模型库 - 新增行业类别 */
export function addIndustryCategory(data: IndustryCategoryForm) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelIndustry/add`,
    data,
  });
}

/** 模型库 - 编辑行业类别 */
export function editIndustryCategory(
  data: IndustryCategoryForm & { id: number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/modelIndustry/edit`,
    data,
  });
}

/** 模型库 - 删除行业类别 */
export function deleteIndustryCategory(id: number) {
  return request({
    method: 'delete',
    url: `footprint3/modelIndustry/${id}`,
  });
}

/** 模型库 - 通过模型新增核算 */
export function createAccountingFromModel(
  data: CreateAccountingForm & { modelId: number },
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/accountingModel/createAccounting`,
    data,
  });
}
