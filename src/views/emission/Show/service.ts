/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-05-04 16:24:21
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-04 18:55:27
 */
import apiPath from '@api/config';
import { request } from '@api/request';
import { FactorUse } from '@src/views/utils';
import { AxiosRequestConfig } from 'axios';

import { Dicts, ListALLByDictTypeBatchEnum } from './type';
import { FactorInfoForms, Factors, FormulaData } from '../utils/index-type';

// 12 数据字典分类-根据字典标识查询字典分类-批量查询
export function apiListALLByDictTypeBatch({
  dictTypes,
  ...args
}: { dictTypes: string } & AxiosRequestConfig) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: any;
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/data/listALLByDictTypeBatch`,
    params: { dictTypes },
    ...args,
  });
}
// 标签 分类列表
interface ByLabelType {
  dictType: string;
  dictLabel?: string;
  dictValue?: string;
}
export function apiQsueryListBylableh(params: ByLabelType & Page) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    rows: [];
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/enum/queryListBylable`,
    params,
  });
}
// 13 根据字典标识查询字典枚举值-批量查询 全部 不分页
export function apiMnumListALLByDictTypeBatch({
  dictTypes,
  ...args
}: {
  dictTypes: string;
} & AxiosRequestConfig) {
  return request<{
    code: number;
    // data: { data: any; enterprise_export_template: { relatedValue: string }[] };
    msg: string;
    page: number;
    pageSize: number;
    data: ListALLByDictTypeBatchEnum;
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/enum/listALLByDictTypeBatch`,
    params: { dictTypes },
    ...args,
  });
}
interface Page {
  pageSize: string | number;
  pageNum: string | number;
}
// 新增获取数值和公式类 表格相关数据
export interface ColUmsType {
  factorUnit: string | null;
  factorUnitM: string | null;
  greenhouseGasesType: string;
  greenhouseGases: string; // 温室气体
  factorValue: string; // 因子数值
  id: number;
  type: string; // 类型
  activeUnit: string | null; // 活动数据单位
  gwp?: number | null;
  factorPattern?: string;
  ecoinventValueVisible?: boolean;
  dictSourceFactorGasId?: number;
}
interface GasType {
  activeUnit?: string;
  id?: number;
  paraName?: string;
  paraType?: string;
  paraUnit?: string;
  paraValue?: string;
  type?: string;
}
interface Formul {
  activeUnit?: string;
  factorUnit?: string;
  factorUnitM?: any;
  factorValue?: string;
  greenhouseGases?: string;
  greenhouseGasesType?: string;
  id?: number;
  type?: string;
}
export function apiSourceList() {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: {
      gasData: ColUmsType[];
      formulaData: FormulaData;
    };
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/gas/listGas`,
  });
}
// 因子库–>排放因子-我的因子单据-选择因子来源-查询排放因子来源数据列表
interface ApiSourceList2Type {
  institution?: string;
  source?: string;
}
export function apiSourceList2(params: ApiSourceList2Type & Page) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    rows: [];
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/source/list`,
    params,
  });
}
export function apiMarkAdd(
  data: Partial<FactorInfoForms> & { companyId: number },
) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    rows: [];
    total: number;
  }>({
    method: 'post',
    url: `${apiPath()}/system/company/addSaas`,
    data,
  });
}

// 因子库–>排放因子-我的因子单据-获取排放因子数据记录详细信息
interface AuditResultObjType {
  '0': string;
  '1': string;
  '2': string;
}
export interface AuditInfo {
  auditList?: [];
  auditResult?: keyof AuditResultObjType;
  modifyRecords?: string;
}
// system/company/query 组织排放因子数据详情
export function apiMarkQuery(
  params: { id: string | number; factorUse: number },
  factorType?: FactorUse,
) {
  let urlStr = `${apiPath()}/system/company/querySaas`;
  if (factorType !== FactorUse.organization) {
    urlStr = `${apiPath()}/system/factor/query`;
  }
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: Factors;
    total: number;
  }>({
    method: 'get',
    url: urlStr,
    params,
  });
}

// 因子库–>排放因子-我的因子单据-获取排放因子数据记录详细信息
export function apiMarkEdit(
  data: Partial<FactorInfoForms & { id: string; factorId: string }>,
) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: {
      business: string;
      labelFactor: string;
      gasData: ColUmsType[];
      formulaData: {
        carbonFactorFormula: GasType[];
        carbonFactorGas: Formul[];
      };
    };
    total: number;
  }>({
    method: 'POST',
    url: `${apiPath()}/system/company/editSaas`,
    data,
  });
}

// 因子库–>碳迹云-组织因子库-获取碳阻迹组织因子库因子数据详细信息
// 因子库–>碳迹云-组织因子库-修改组织排放因子数据
// 因子库–>排放因子-组织排放因子-获取组织排放因子数据详细信息
// /system/enum/listALLByDictTypeData
export function apiListALLByDictTypeData(params: { dictType: string }) {
  return request<{
    code: number;
    msg: string;
    page: number;
    pageSize: number;
    data: Dicts[];
    total: number;
  }>({
    method: 'get',
    url: `${apiPath()}/system/enum/listDictTypeAndDataByType`,
    params,
  });
}
// 碳因子/根据字典标识查询字典分类字典枚举值-批量查询
