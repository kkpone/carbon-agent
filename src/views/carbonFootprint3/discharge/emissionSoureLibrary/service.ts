/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-09 11:07:55
 * @Date: 2023-02-10 17:40:23
 * @@description:
 */
import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import {
  EmissionLibImportParams,
  EmissionLibImportTableList,
  EmissionSoureLibraryAddForm,
  EmissionSoureLibraryEditForm,
  EmissionSoureLibraryMenuData,
  EmissionSoureLibraryTableData,
  EmissionSoureLibraryTableParams,
  EmissionSoureListData,
} from './type';
import { EMISSION_LIBTYPE } from '../../constant';
import { BackTableData, OptionsTypesData } from '../../type';

/** 排放源库 - 列表数据 */
export function getEmissionSoureLibraryTableData(
  params: Partial<EmissionSoureLibraryTableParams> & {
    pageNum: number;
    pageSize: number;
  },
) {
  return request<AxiosResponse<BackTableData<EmissionSoureLibraryTableData>>>({
    method: 'get',
    url: `footprint3/libEmission/list`,
    params: {
      ...params,
      libType: EMISSION_LIBTYPE.ALL,
    },
  });
}

/** 排放源库 - 排放源类型 */
export function getEmissionSoureTypeDataSource() {
  return request<{ code: number; data: OptionsTypesData[] }>({
    method: 'get',
    url: `footprint3/libEmission/libEmissionTypes`,
  });
}
/** 排放源名称列表 */
export function getEmissionSoureListData() {
  return request<BackTableData<EmissionSoureListData>>({
    method: 'get',
    url: `footprint3/dict/list`,
  });
}

/** 排放源库 - 新增排放源 */
export function posEmissionSoureLibraryAdd(data: EmissionSoureLibraryAddForm) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/libEmission/add`,
    data,
  });
}

/** 排放源库 - 编辑排放源 */
export function posEmissionSoureLibraryEdit(
  data: EmissionSoureLibraryEditForm,
) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/libEmission/edit`,
    data,
  });
}

/** 排放源库 - 删除排放源 */
export function postEmissionSoureLibraryDelete(data: { id: number | string }) {
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/libEmission/delete`,
    data,
  });
}

/** 排放源库 - 列表详情 */
export function getEmissionSoureLibraryTableDataDetail(params: {
  id: string | number;
}) {
  return request<AxiosResponse<EmissionSoureLibraryTableData>>({
    method: 'get',
    url: `footprint3/libEmission/info`,
    params,
  });
}

/** 排放源库 - 菜单分类列表 */
export function getEmissionSoureLibraryMenus() {
  return request<AxiosResponse<EmissionSoureLibraryMenuData[]>>({
    method: 'get',
    url: `footprint3/libEmission/menu`,
  });
}

/** 获取排放源导入的数据 */
export function getFileEmissionLibImportApi(params: EmissionLibImportParams) {
  return request<AxiosResponse<EmissionLibImportTableList[]>>({
    method: 'get',
    url: `/footprint3/sysImportRecord/list`,
    params,
  });
}

/** 快速核算 - 导入排放源 - 确认导入 */
export function postFileImportAccountEmissionLibApi(data: {
  fileUrl: string;
  fileName?: string;
}) {
  const FD = new FormData();
  FD.append('fileUrl', data.fileUrl);
  FD.append('fileName', data.fileName || '');
  return request<{ code: number; data: number }>({
    method: 'post',
    url: `footprint3/libEmission/upload`,
    data: FD,
  });
}
