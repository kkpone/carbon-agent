import { Rule } from 'antd/lib/form';
import { RcFile } from 'antd/lib/upload';
import { ReactNode } from 'react';

import { AuditInfo, ColUmsType } from '../Show/service';
import { Dicts } from '../Show/type';

export interface FormJsonItemType {
  title?: string;
  name?: string | ReactNode;
  desc?: string;
  require?: Rule[];
  placeholder?: string;
  type?: string;
  class?: string;
  buttontext?: string;
  value?: string;
  disabled?: boolean;
  select_list?: {
    dictLabel: string;
    dictValue: string;
    id?: string | number;
    name?: string;
  }[];
  maxLength?: number;
  isNeedButton?: boolean;
  defaultValue?: string;
  dataSource?: [];
  modelLabel?: string;
  allowClear?: boolean;
}

export type UploadFiles = {
  uid: string;
  name: string;
  status?: 'done' | 'error' | 'success' | 'uploading' | 'removed';
  url?: string;
  originFileObj?: RcFile;
};
export type EmissionFactorMenu = {
  factorDataType?: Dicts[]; // 因子数据类型
  reportArea?: Dicts[]; // 发布地区
  sourceLanguage?: Dicts[]; // 源语音
  sourceLevel?: Dicts[]; // 来源类别
  factorUnitZ?: Dicts[]; // 分子单位
  factorUnitM?: Dicts[]; // 分母单位
  PFCseNUM?: Dicts[]; // 全氟化碳
  HFCsEnum?: Dicts[]; // 氢氟碳化物
  business?: Dicts[]; // 行业
  factorLabel?: Dicts[]; // 因子标签
  reportCountries?: Dicts[]; // 发布国家组织标签
  methaneUnitZ?: Dicts[]; // 甲烷 分子
  nitrousUnitZ?: Dicts[]; // 氧化氮 分子
  hydrofluorocarbonUnitZ?: Dicts[]; // 甲烷 分子
  perfluorocarbonUnitZ?: Dicts[]; // 全氟化碳-因子单位分子 f分子
  sulfurUnitZ?: Dicts[]; // 六氟化硫-因子单位分子
  nitrogenUnitZ?: Dicts[]; // 三氟化氮-因子单位分子
  cequivalentUnitZ?: Dicts[]; // 二氧化碳当量-因子单位分子
  firstClassify?: Dicts[]; // 一级分类
  secondClassify?: Dicts[]; // 二级分类
  placeOfPublication?: Dicts[]; // 出版地
  formulaChance?: Dicts[]; // 公式字典
  documentType?: Dicts[]; // 文献类型
  carrierTypes?: Dicts[]; // 电子文献
  formulaUnitZ?: Dicts[]; // 化石分子
  formulaUnitM?: Dicts[]; // 化石分母
  co2eFormulaUnitZ?: Dicts[]; // 化石二氧化碳当量分子
  forestryUnitZ?: Dicts[]; // 林业分子
  forestryUnitM?: Dicts[]; // 林业分母
  co2eForestryUnitZ?: Dicts[]; // 林业二氧化碳当量分子
  transportationKMZ?: Dicts[]; // 交通公里二氧化碳分子
  co2eTransportationKMZ?: Dicts[]; // 交通公里二氧化碳当量分子
  transportationKMM?: Dicts[]; // 交通公里分母
  transportationTKMZ?: Dicts[]; // 吨公里二氧化碳分子
  co2eTransportationTKMZ?: Dicts[]; // 吨公里二氧化碳当量分子
  transportationTKMM?: Dicts[]; // 吨公里二氧化碳分母
};
export interface GasDatum {
  factorUnit: null | string;
  factorUnitM: null | string;
  greenhouseGasesType: string;
  greenhouseGases: string;
  factorValue: string;
  id: number;
  type: string;
  activeUnit: null | string;
  factorPattern?: string;
}
export interface CarbonFactorFormula {
  paraUnit: string;
  paraValue: string;
  id: number;
  type: string;
  paraType: string;
  activeUnit: null | string;
  paraName: string;
  greenhouseGases?: string;
  factorUnit?: string;
}
export interface Factors {
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
  auditInfo?: AuditInfo;
  secondClassify: null | string;
  englishName: null | string;
  year: string;
  documentType: null | string;
  efirstClassify: null | string;
  publishDate: null | string;
  description: string;
  edition: null | string;
  sourceLevel: string;
  source: string;
  sourceUrl: string;
  labelFactor: string;
  institution: string;
  cValue: string;
  esecondClassify: null | string;
  factorType: string; // 1 数值类 2 公式类
  id: string;
  firstClassify: null | string;
  sourceLanguage: null | string;
  area: null | string;
  sourceLanguageName: null | string;
  business: string;
  unsureDescription: null | string;
  startEndPage: null | string;
  specification: null | string;
  mainPerson: null | string;
  sourceFileList: FactorFile[];
  countries: string;
  remake: null | string;
  url: string;
  unit: string;
  institutionShort: string;
  publish: null | string;
  name: string;
  edocumentType: null | string;
  formula: string;
  otherName: null | string;
  facilities: string;
  formulaData: FormulaData;
  gasData: ColUmsType[];
  factorUse: string;
  relationFactorList: any[];
}
type FactorFile = {
  uid: string;
  name: string;
  status?: 'done' | 'error' | 'success' | 'uploading' | 'removed';
  url?: string;
  originFileObj?: RcFile;
};

export interface FormulaData {
  fossilFormulaData: ForestryFormulaDataClass;
  forestryFormulaData: ForestryFormulaDataClass;
  transportationKMFormulaData: ForestryFormulaDataClass;
  transportationTKMFormulaData: ForestryFormulaDataClass;
}
interface ForestryFormulaDataClass {
  carbonFactorFormula: CarbonFactorFormula[];
  carbonFactorGas: GasDatum[];
}

export type FactorInfoForms = Factors & {
  carbonFactorGas?: ColUmsType[] | GasDatum[];
  carbonFactorFormula?: CarbonFactorFormula[];
  factorCompanyId?: string;
  // 不需要的字段，上传组件自动生成的
  multipartFileList?: any;
  relationFactorList?: any[];
};

export enum FactorPatternType {
  eCoinVent = '2',
  ordinaryFactor = '1',
}
