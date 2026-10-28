import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  SelectModelListData,
  SelectModelListParams,
  SelectModelMenu,
} from './type';
/** 模型库模型 */
export function getSelectModelList(params: SelectModelListParams) {
  return request<AxiosResponse<SelectModelListData[]>>({
    method: 'get',
    url: `footprint3/model/modelsOfCompany`,
    params,
  });
}

/** 模型库模型 - 行业菜单 */
export function getSelectModelmenu() {
  return request<AxiosResponse<SelectModelMenu[]>>({
    method: 'get',
    url: `footprint3/model/industryMenu`,
  });
}

/** 模型库模型 - 行业菜单 */
export function getSelectModelInfo(params: { id: number }) {
  return request<AxiosResponse<SelectModelListData>>({
    method: 'get',
    url: `footprint3/model/info`,
    params,
  });
}
