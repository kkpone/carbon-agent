/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-04-27 19:17:43
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-17 23:02:43
 */
import { ColUmsType } from '@src/views/emission/Show/service';

/**
 *因子匹配方式
 * 1 因子库选择 2 手动新建 4智能匹配
 */
export enum FdType {
  'select' = 1,
  'manual' = 2,
  'importFactor' = 3,
  'autoMatch' = 1,
  'accountReference' = 6,
}

export type ManualFactorData = {
  supplierName: number;
  factorPublic: string;
  supplierId: string;
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
  activityType?: number;
  methodObj?: {
    unit?: string[];
    paramItem?: Record<string, any>[];
    [key: string]: unknown;
  };
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
  id?: string;
  factorGasList: Partial<GasList>[];
  factorUnit?: string | null;
  factorUnitM?: string | null;
  factorValue?: string | number | null;
  groupId?: number;
  accountId?: string | number;
  supplyAccountId?: string | number;
  productName?: string;
  activityData?: string | number | null;
  referWay?: string | number;
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
