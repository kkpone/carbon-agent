/*
 * @@description:
 */
import { ColUmsType } from '@src/views/emission/Show/service';

/**
 *因子匹配方式
 * 1 因子库选择 2 手动新建 1智能匹配
 */
export enum FdType {
  'select' = 1,
  'manual' = 2,
  'autoMatch' = 1,
  'importFactor' = 3,
}

export type ManualFactorData = {
  factorPublic: string;
  factorSource: string;
  factorScore: string;
  factorUnitM: string[];
  factorName: string;
  factorUnit: string;
  factorUnitName: string;
  factorValue: string;
  factorType: string;
  name: string;
  factorSourceName: string;
  gasList: ColUmsType[];
  cValue?: string;
  unit?: string;
  year?: string;
  factorPattern?: string;
  ecoinventValueVisible?: boolean;
  factor?: string | number;
};

/** 编辑排放源 返回类型 */
export type DictSource = {
  submitType: null | number;
  supplierId: string;
  supplierName: number;
  labelname: string;
  searchValue: null;
  createBy: string;
  createTime: string;
  updateBy: string;
  updateTime: string;
  remark: null;
  params: any;
  dictSourceId: number;
  companyId: number;
  sourceId: string;
  name: string;
  facility: string;
  ghgClassify: string;
  ghgCategory: string;
  isoClassify: string;
  isoCategory: string;
  activityUnit: string;
  activityRecordWay: string;
  activityDept: string;
  activityCategory: string;
  activityScore: string;
  fdType: number;
  factorName: string | null;
  factorType: string;
  factorScore: null | string;
  factorSource: null | string;
  factorPublic: null | string;
  supportMaterials: null;
  deleted: number;
  unitConver: string;
  factorId: null;
  ghgDesc: null;
  isoDesc: null;
  categoryId: null;
  activityUnitDesc: null;
  oldDictSourceId: null;
  gasList: Partial<GasList>[];
  gwp: null;
  sourceCategoryMiddleId: null;
  factorGasList: Partial<GasList>[];
  factorUnit?: null | string;
};

interface GasList {
  searchValue: null;
  createBy: null;
  createTime: string;
  updateBy: null;
  updateTime: string;
  remark: null;
  params: any;
  dictSourceFactorGasId: number;
  dictSourceId: number;
  factorId: null;
  greenhouseGasesType: string;
  greenhouseGases: string;
  factorValue: string;
  factorUnit: null | string;
  factorUnitM: string | null;
  dataType: null;
  deleted: number;
  type: string;
  factorSource: null;
  gwp: number | null;
}
