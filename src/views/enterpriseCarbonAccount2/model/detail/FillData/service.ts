import { request } from '@api/request';
import { FactorPatternType } from '@src/views/emission/utils/index-type';

interface SourceList {
  code: number;
  data: Datum[];
  msg: string;
}

interface Datum {
  ghgCategory: string;
  ghgClassify: null;
  name: string;
  nodes: Node[];
  count: number;
}

interface Node {
  dictSourceList: NodeDictSourceList[];
  ghgCategory: string;
  ghgClassify: string;
  name: string;
  count: number;
}

interface NodeDictSourceList {
  activityUnit: string;
  activityUnitDesc: string;
  categoryId: null;
  companyId: number;
  deleted: number;
  dictSourceId: number;
  facility: string;
  factorId: number | null;
  factorName: string;
  factorPattern: null;
  factorValue: null;
  fdType: number;
  gasList: null;
  ghgCategory: string;
  ghgClassify: string;
  gwp: null;
  name: string;
  oldDictSourceId: null;
  sourceCategoryMiddleId: number;
  sourceId: string;
  updateBy: string;
  updateTime: string;
}

/**
 * 核算详情
 */
export async function getSourceList(modelId: string) {
  const { data } = await request<SourceList>({
    method: 'GET',
    url: `/enterprise/model/source/list_version2`,
    params: {
      modelId,
    },
  });
  return data.data;
}

interface ChooseList {
  code: number;
  data: ListDatum[];
  msg: string;
}

interface ListDatum {
  activityUnit: string;
  activityUnitDesc: string;
  companyId: number;
  deleted: number;
  dictSourceId: number;
  facility: string;
  factorValue: string;
  fdType: number;
  gasList: GasList[];
  ghgCategory: string;
  ghgClassify: string;
  gwp: null;
  name: string;
  sourceId: string;
  updateBy: string;
  updateTime: string;
  sourceCategoryMiddleId: number;
  factorPattern: FactorPatternType;
  ecoinventValueVisible?: boolean;
}

interface GasList {
  createBy: null;
  createTime: null;
  dataType: null;
  deleted: null;
  dictSourceFactorGasId: null;
  dictSourceId: null;
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
  updateTime: null;
}

/**
 * 修改活动数据
 */
export function getSourceChooseList(params: {
  modelId: string;
  ghgClassify: string;
}) {
  return request<ChooseList>({
    method: 'GET',
    url: `/enterprise/model/chose/list`,
    params,
  });
}
interface UnselectedList {
  code: number;
  msg: string;
  queryKey: null;
  rows: Row[];
  total: number;
}

interface Row {
  activityUnit: string;
  activityUnitDesc: string;
  companyId: number;
  deleted: number;
  dictSourceId: number;
  facility: string;
  factorId: number | null;
  factorValue: string;
  fdType: number;
  gasList: GasList[];
  ghgCategory: string;
  ghgClassify: string;
  gwp: null;
  name: string;
  sourceId: string;
  updateBy: string;
  updateTime: string;
  factorPattern: FactorPatternType;
  ecoinventValueVisible?: boolean;
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
  modelId: string;
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
}) {
  return request<UnselectedList>({
    method: 'GET',
    url: `/enterprise/model/unselected/list`,
    params,
  });
}
interface SaveList {
  addList: AddList[];
  deleteList: DeleteList[];
  modelId: number;
}

interface AddList {
  /**
   * 列表中的排放源id
   */
  dictSourceId: number;
}

interface DeleteList {
  sourceCategoryMiddleId: number;
}

export function saveSelectSource(data: SaveList) {
  return request({
    method: 'POST',
    url: `/enterprise/model/list/save`,
    data,
  });
}
