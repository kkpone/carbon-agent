import { request } from '@/api/request';
import { BuildModelVisualChangeType } from '@/components/CarbonFootprintAccount/BuildModelMainData/BuildModelVisual/constant';
import { MenuData } from '@/components/MenuList/type';

/** 模型视图 - 单条排放源（与 ModelVisual transfer* 使用字段对齐） */
export interface ModelGraphViewEmissionItem {
  id: number;
  type: number;
  typeName?: string;
  name?: string;
  amount?: number;
  unitName?: string;
  emissionTotal?: string | null;
  emissionRate?: number;
  matchWay?: number;
  /** 与核算可视化一致：是否需要展示运输排放、运输排放量 */
  needTrans?: number;
  transTotal?: string | number | null;
  unitStr?: string;
  typeExtra?: Record<string, any>;
  accountEmissionTransportList?: unknown[];
  matchObject?: {
    id?: number;
    name?: string;
    factorPattern?: string;
  } | null;
}

/** 子层生命周期节点；emissionList[n] 为某一组下的排放源列表 */
export interface ModelGraphViewLifeCycleNode {
  code: number;
  name: string;
  typeName?: string;
  total?: string | number | null;
  rate?: number;
  emissionList?: ModelGraphViewEmissionItem[][];
}

/** 模型视图接口响应体 data（对应 resp.data.data） */
export interface ModelGraphViewData {
  code: number;
  name: string;
  typeName: string;
  total?: string | number | null;
  type?: string | number | null;
  scope?: string | null;
  children?: ModelGraphViewLifeCycleNode[];
}

export interface GetModelGraphViewParams {
  id: number | string;
  groupType: BuildModelVisualChangeType;
}

/** 模型管理 - 获取模型详情 */
export function getModelDetail() {
  // TODO: 替换为真实接口
  return Promise.resolve({ data: { data: {} } });
}

/** 模型管理 - 获取可视化数据 */
export function getModelGraphView(params: GetModelGraphViewParams) {
  return request<{ data: ModelGraphViewData }>({
    url: 'footprint3/model/modelView',
    params,
  });
}

/** 模型管理 - 获取排放源菜单 */
export function getModelEmissionMenu(params) {
  return request<{ data: MenuData[] }>({
    url: 'footprint3/model/menu',
    params,
  });
}

/** 模型管理 - 获取排放源列表 */
export function getModelEmissionList(params) {
  return request<{
    data: { rows: Record<string, any>[]; total: number };
  }>({
    url: 'footprint3/modelEmission/list',
    params,
  });
}

/** 模型管理 - 删除排放源 */
export function deleteModelEmission(data) {
  return request({
    method: 'post',
    url: 'footprint3/modelEmission/delete',
    data,
  });
}
