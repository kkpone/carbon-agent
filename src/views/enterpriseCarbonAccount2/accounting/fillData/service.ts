import { request } from '@api/request';
import { FactorPatternType } from '@src/views/emission/utils/index-type';

interface SourceList {
  code: number;
  data: Data;
  msg: string;
}

interface Data {
  rootNodes: RootNode[];
  totalEmissions: number;
}

export interface RootNode {
  ghgCategory: string;
  ghgClassify: null;
  name: string;
  nodes: Node[];
  totalEmissions: number;
  count: number;
  finishCount: number;
  totalCount: number;
}

export interface SourceGroup {
  id: number;
  groupName: string;
  sourceList: SourceListElement[];
  finishCount: number;
  totalCount: number;
  emissionQuantity: string;
}

interface Node {
  ghgCategory: string;
  ghgClassify: string;
  name: string;
  sourceList: SourceListElement[];
  groupList?: SourceGroup[];
  totalEmission: number;
  count: number;
  finishCount: number;
  totalCount: number;
}

export interface SourceListElement {
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
  /**
   * 活动数据单位
   */
  activityUnit: string;
  /**
   * 是否展示同步按钮，1是 0 否
   */
  allowSync: number;
  dictSourceId: number | null;
  /**
   * 排放量
   */
  emissionQuantity: string;
  /**
   * 设施
   */
  facility: string;
  ghgCategory: string;
  /**
   * 二级分类
   */
  ghgClassify: string;
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 同比
   */
  sameDictIdEmissionYOY: null;
  saveType: null;
  /**
   * 是否供应商数据
   */
  supplierData: number;
  /**
   * 支撑材料
   */
  supportImg: string[];
  updateBy: string;
  updateTime: string;
  activityData: number;
  /** 因子丢失 */
  lostFactor: boolean;
  /** 因子匹配方式，核算引用表示产品碳来源 */
  fdType?: number | string | null;
}

export enum EVersionType {
  ghg = '1',
  iso = '2',
}

/**
 * 核算详情
 */
export async function getSourceList(params: {
  computationId: string;
  computationPeriod?: string;
  sessionId?: string;
  shareId?: string;
  versionType?: EVersionType;
}) {
  const { data } = await request<SourceList>({
    method: 'GET',
    url: `/enterprise/source/list_version2`,
    params,
  });
  return data.data;
}

/**
 * 核算详情
 */
export async function getSourceListByShare(params: {
  computationId: string;
  computationPeriod?: string;
  versionType?: EVersionType;
  companyId?: string;
  orgId?: string;
}) {
  const { data } = await request<SourceList>({
    method: 'GET',
    url: `/enterprise/source/list_version2Share`,
    params,
  });
  return data.data;
}

export interface ChooseList {
  code: number;
  data: Datum[];
  msg: string;
}

interface Datum {
  ecoinventValueVisible?: boolean;
  /**
   * 单位
   */
  activityUnit: string;
  /**
   * 对应的基础库排放源id
   */
  dictSourceId: number | null;
  /**
   * 设施
   */
  facility: string;
  /**
   * 因子数值
   */
  factorValue: string;
  /**
   * 一级分类
   */
  ghgCategory: string;
  /**
   * 二级分类
   */
  ghgClassify: string;
  /**
   * 主键id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 更新人
   */
  updateBy: string;
  /**
   * 更新时间
   */
  updateTime: string;
  activityUnitDesc: string;
  factorPattern: FactorPatternType;
}

/**
 * 修改活动数据
 */
export function getSourceChooseList(params: {
  computationId: string;
  computationPeriod?: string;
  ghgClassify: string;
  isoClassify: string;
}) {
  return request<ChooseList>({
    method: 'GET',
    url: `/enterprise/source/chose/list`,
    params,
  });
}

export interface UnselectedList {
  code: number;
  msg: string;
  queryKey: null;
  rows: Row[];
  total: number;
}

interface Row {
  /**
   * 单位
   */
  activityUnit: string;
  /**
   * 单位desc
   */
  activityUnitDesc: string;
  companyId: number;
  /**
   * 主键id
   */
  dictSourceId: number;
  /**
   * 设施
   */
  facility: string;
  /**
   * 因子数值
   */
  factorValue: null | string;
  fdType: number;
  gasList: GasList[];
  /**
   * 一级分类
   */
  ghgCategory: string;
  /**
   * 二级分类
   */
  ghgClassify: string;
  /**
   * 名称
   */
  name: string;
  updateBy: string;
  updateTime: string;
}

interface GasList {
  createBy: null;
  createTime: null | string;
  dataType: null;
  deleted: number | null;
  dictSourceFactorGasId: number | null;
  dictSourceId: number | null;
  factorId: null;
  factorSource: null;
  factorUnit: null | string;
  factorUnitM: string;
  factorValue: string;
  greenhouseGases: null | string;
  greenhouseGasesType: string;
  gwp: null | string;
  params: { [key: string]: any };
  remark: null;
  searchValue: null;
  type: string;
  updateBy: null;
  updateTime: null | string;
}

/**
 * 修改活动数据
 */
export function getSourceUnselectedList(params: {
  /**
   * 单位
   */
  activityUnit?: string;
  /**
   * 核算id
   */
  computationId: string;
  computationPeriod?: string;
  /**
   * 设施
   */
  facility?: string;
  /**
   * ghg二级分类
   */
  ghgClassify: string;
  /**
   * 名称
   */
  name?: string;
  pageNum?: number;
  pageSize?: number;
  isoClassify?: string;
}) {
  return request<UnselectedList>({
    method: 'GET',
    url: `/enterprise/source/unselected/list`,
    params,
  });
}

interface SaveList {
  computationId: number;
  computationPeriod?: string;
  deleteSourceList: DeleteSourceList[];
  dictSourceList: DictSourceList[];
}

interface DeleteSourceList {
  id: number;
}

interface DictSourceList {
  id: number;
}

export function saveSelectSource(data: SaveList) {
  return request({
    method: 'POST',
    url: `/enterprise/source/list/save`,
    data,
  });
}

export const getFeatureSet = () =>
  request<{ data: Record<string, number> }>({
    method: 'GET',
    url: `/enterprise/computation/lightPermissions`,
  });
