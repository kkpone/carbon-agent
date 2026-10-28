/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-03 15:13:53
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-03-21 10:57:09
 */

import { FactorPatternType } from '@src/views/emission/utils/index-type';

import {
  PROCESS_PRODUCT_TYPE,
  PROCESS_LIB_STATUS,
  PROCESS_LIB_IN_TYPE,
  PROCESS_LIB_OUT_TYPE,
  MATCH_WAY,
  PROCESS_LIB_ACCESSORY,
  CALC_WAY,
} from './constant';
import { ProcessProduct } from '../../component/ProcessLibProductSelect/type';
import { AddFileData } from '../../type';

type ProcessProductType =
  (typeof PROCESS_PRODUCT_TYPE)[keyof typeof PROCESS_PRODUCT_TYPE];

type ProcessLibStatus =
  (typeof PROCESS_LIB_STATUS)[keyof typeof PROCESS_LIB_STATUS];

type ProcessLibInType =
  (typeof PROCESS_LIB_IN_TYPE)[keyof typeof PROCESS_LIB_IN_TYPE];

type ProcessLibOutType =
  (typeof PROCESS_LIB_OUT_TYPE)[keyof typeof PROCESS_LIB_OUT_TYPE];

type MatchWay = (typeof MATCH_WAY)[keyof typeof MATCH_WAY];

export type ProcessLibAccessory =
  (typeof PROCESS_LIB_ACCESSORY)[keyof typeof PROCESS_LIB_ACCESSORY];

export type CalcWay = (typeof CALC_WAY)[keyof typeof CALC_WAY];

/** 过程库基本信息 */
export type ProcessLibData = {
  id: number | string;
  name: string;
  type: number;
  boundary: string;
  accountYear: string;
  productErea: string;
  processEquipment: string;
  productScale: string;
  mainMaterial: string;
  mainEnergy: string;
  status: ProcessLibStatus;
  updateTime: string;
  updateByName: string;
};

export type Factor = {
  id: string;
  /** 因子名称 */
  name?: string;
  /** 因子数值 */
  factor?: number | string;
  /** 发布年份 */
  year: string | number;
  /** 单位 */
  unit?: string;
  /** 排放因子来源 */
  sourceLevel: string;
  /** 发布机构 */
  institution: string;
  /** 发布国家 */
  countries: string;
  /** 适用场景 */
  business: string;
  /** 因子类别 */
  factorType: number | string;
  /** */
  factorPattern?: FactorPatternType;
  /** Ecoinvent 因子值是否对当前组织可见 */
  ecoinventValueVisible?: boolean;
};

/** 过程库产品 */
export type ProcessLibProduct = {
  id: number;
  processId: number;
  name: string;
  // 类型：1主产品，2副产品，3回用产品
  type: ProcessProductType;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number | string;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  // 排放量
  emissionTotal: number;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: MatchWay;
  matchTypeId: number;
  matchId: number;
  matchName: string;
  factor: string;
  factorUnit: string;
  year: string;
  // 因子对象
  factorObj: Factor;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: MatchObject;
  files?: AddFileData[];
};

/** 过程库输入 */
export type ProcessLibIn = {
  id: number;
  processId: number;
  name: string;
  // 1主料，2辅料，3包装材料，4再生材料，5能耗，6水耗，7运输
  type: ProcessLibInType;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  matchName: string;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: MatchWay;
  matchTypeId: number;
  typeExtra: {
    name?: string;
    // 运输方式
    way: CalcWay;
    // 数量、重量、百分比
    amount: number | string;
    // 单位标识
    unitCode: string;
    // 单位名称
    unitName: string;
    // 运输距离
    distance: number | string;
    distUnitName?: string;
  };
  // 因子对象
  factorObj: Factor;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: MatchObject;
  supplierObj?: Record<string, any>;
  files?: AddFileData[];
  childeren?: ProcessInExpandData[];
  requestState?: number;
  // 是否保存倒库  0未保存 1已保存
  libState: number;
  emissionTotal: string;
};

/** 过程库输出 */
export type ProcessLibOut = {
  id: number;
  processId: number;
  name: string;
  type: ProcessLibOutType;
  // 数量
  amount: number | string;
  // 分配系数
  shareRate: number;
  // 单位标识
  unitCode: string;
  // 单位名称
  unitName: string;
  // 因子换算比例
  rate: string | number;
  matchName: string;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: MatchWay;
  matchTypeId: number;
  typeExtra: {
    // 再生回收率
    recycleRate: number | string;
    // 修正系数
    correctRate: number | string;
  };
  // 因子对象
  factorObj: Factor;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject: MatchObject;
  files?: AddFileData[];
};

type MatchObject = {
  business: string;
  countries: string;
  factor: string;
  factorType: string;
  factorUse: string;
  id: number;
  institution: string;
  name: string;
  sourceLevel: string;
  unit: string;
  year: string;
  processId: number;
  processName: string;
};

export type Dicts = {
  label: string;
  value: string;
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: number;
  sourceName: string;
  dictType: string;
  children?: Dicts[];
  relatedValue?: string;
};

export interface ProcessInExpandData {
  id: number;
  companyId: number;
  accountId: number;
  processId: number;
  stage: number;
  name: string;
  type: number;
  amount: string;
  useAmount: number;
  shareRate: number;
  unitCode: string;
  unitName: string;
  rate: null;
  emissionTotal: string;
  matchWay: number;
  matchWay_name: string;
  matchTypeId: number;
  matchId: null;
  matchName: null;
  factor: string;
  factorUnit: string;
  status: number;
  createBy: number;
  createTime: Date;
  updateBy: number;
  updateTime: Date;
  remark: string;
  delFlag: number;
  orderNum: number;
  matchObject: null;
  factorObj: null;
  files: any[];
  used: number;
}
