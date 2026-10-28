import { Report } from './carbonDataManage/CarbonDataFill/type';

/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-03-03 09:32:44
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 10:47:31
 */
export interface Pages {
  pageSize: number;
  pageNum: number;
}

export interface BackTableData<TableData> {
  currSize: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  rows: TableData[];
  total: number;
}

export interface OpreationBack {
  code: number;
  msg: string;
}

interface SupplierDataType {
  searchValue: null;
  accountSelfId: number;
  createBy: string;
  createTime: Date;
  updateBy: string;
  computeUnit: string;
  updateTime: Date;
  remark: null;
  params: {};
  id: number;
  companyId: number;
  accountId: number;
  companyName: string;
  supplierId: number;
  purchaseGoodsSupplierId: number;
  demand: string;
  reqType: number;
  expireTime: Date;
  dataType: number;
  footBorderType: number;
  computationType: string;
  computationScope: string;
  computationYear: string;
  descr: string;
  status: number;
  deleted: number;
  dataTypeDesc: null;
  footBorderDesc: null;
  emission: null;
  supplierCompanyId: null;
  targetCompanyId: number;
  unitDischarge: null;
  name: null;
  computationUnit: string;
  reqTypeDesc: null;
  emissionDesc: string;
  statusDesc: null;
  result: null;
  content: null;
  auditTime: null;
  auditUser: null;
  phone: null;
  submitTime: Date;
  auditList: null;
  computeCompanyName: null;
  snapshootId: string;
  modelShareFlag?: number | null;
  businessId?: number | null;
}
interface EnterpriceType {
  searchValue: null;
  createBy: string;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
  remark: null;
  params: {};
  id: number;
  supplierDataId: number;
  emission: number;
  scopeOne: number;
  scopeTwo: number;
  scopeThree: number;
  direct: null;
  energy: null;
  transportation: null;
  outsourcing: null;
  supply: null;
  rests: null;
  report: string | Report[];
  deleted: number;
  submitType: null;
  emissionDesc: null;
  dataType: number;
  reportArray: Report[];
}
interface FootprintResultType {
  abandon: number;
  businessId: number;
  computeUnit: string;
  createBy: string;
  createTime: string;
  dataCode: number;
  deleted: number;
  distribution: number;
  emission: number;
  emissionDesc: null;
  employ: number;
  factorScore: null;
  factorType: null;
  id: number;
  manufacturing: number;
  name: string;
  params: {};
  rawMaterial: number;
  remark: string;
  report: string;
  reportArray: Report[];
  searchValue: null;
  supplierDataId: number;
  updateBy: string;
  updateTime: string;
  year: string;
}

export interface DataBackType {
  supplierData: SupplierDataType;
  enterprice: EnterpriceType;
  footprintResult: FootprintResultType;
  computation: ComputationType;
  enterpriceResult: EnterpriceType;
}

interface ComputationType {
  applyCompanyName: null;
  categoryType: number;
  companyId: number;
  computationId: string;
  createBy: string;
  createTime: string;
  deleted: 1;
  gwp: string;
  id: number;
  name: string;
  params: {};
  period: string;
  quantization: string;
  remark: null;
  searchValue: null;
  supplierDataId: number;
  totalQuantity: null;
  updateBy: string;
  updateTime: string;
}

// 企业碳核算过程->排放源列表
export interface DataSourceListTableData {
  searchValue: null;
  createBy: string;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
  remark: null;
  params: {};
  id: number;
  sourceId: string;
  categoryId: number;
  computationId: number;
  name: string;
  facility: string;
  ghgCategory: string;
  ghgClassify: string;
  isoCategory: string;
  isoClassify: string;
  activityData: number;
  activityUnit: string;
  activityRecordWay: string;
  activityDept: string;
  activityCategory: string;
  activityScore: string;
  factorType: string;
  factorScore: string;
  factorSource: string;
  factorPublic: string;
  factorUnitM: string;
  status: string;
  dictionaries: number;
  emissionQuantity: number;
  supportMaterials: null;
  unitConver: string;
  deleted: number;
  factorGasList: null;
  imgList: null;
  supportImg: null;
}

// 产品碳足迹过程->排放源分类
export interface FootprintAccountMenusBackData {
  code: string;
  name: string;
}
// 产品碳足迹过程->排放源列表
interface MatchObject {
  name: string;
  unit: string;
  year: string;
  factor: string;
  institution: string;
}
export interface FootprintAccountEmissionListTableData {
  id: number;
  companyId: number;
  accountId: number;
  stage: number;
  stage_name: string;
  name: string;
  type: number;
  amount: string;
  unitCode: string;
  unitName: string;
  typeExtra: null;
  rate: string;
  emissionTotal: string;
  matchWay: number;
  matchWay_name: string;
  matchId: null;
  matchName: string;
  factor: string;
  factorUnit: string;
  institution: string;
  year: string;
  status: number;
  createBy: number;
  createTime: Date;
  updateBy: number;
  updateTime: Date;
  remark: string;
  delFlag: number;
  matchObject: MatchObject;
  factorObj: null;
  files: null;
  index: number;
  distance: null;
  typeName: null;
  factorUnitMolecule: null;
  factorUnitDenominator: null;
}

// 产品碳足迹->核算产品详情

export interface FootprintAccountInfoBackData {
  year: string;
  searchValue: null;
  createBy: null;
  createTime: Date;
  updateBy: string;
  updateTime: Date;
  remark: null;
  params: {};
  id: number;
  companyId: number;
  supplierDataId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  startTime: Date;
  endTime: Date;
  amount: number;
  unitType: string;
  unitCode: string;
  unitName: string;
  scope: number;
  accountStatus: number;
  factor: string;
  factorUnit: string;
  emissionTotal: number;
  delFlag: number;
  attachment: null;
  dataCode: null;
  files: { name: string; url: string }[];
}
