import { FactorPatternType } from '@src/views/emission/utils/index-type';

type Factor = {
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
  /** 是否是ecoinvent因子 */
  factorPattern?: FactorPatternType;
  ecoinventValueVisible?: boolean;
};

export type ProcessProduct = {
  id: number;
  processId: number;
  processName: string;
  productName: string;
  type: number;
  accountYear: string;
  boundary: string;
  unitCode: number | string;
  unitName: string;
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

export interface AddFileData {
  suffix: string;
  name: string;
  url: string;
  uid: string;
}

export type Emission = {
  /** 排放源描述，独立于备注，上限200字。 */
  emissionSourceDescription?: string;
  accountId?: number;
  id?: number;
  stage?: number;
  name: string;
  type: number;
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
  matchName?: string;
  // 匹配方式：1因子，2因子填写，3过程，4过程填写
  matchWay: number;
  matchTypeId?: number;
  typeExtra: {
    name?: string;
    // 运输方式
    way: number;
    // 数量、重量、百分比
    amount: number | string;
    // 单位标识
    unitCode: string;
    // 单位名称
    unitName: string;
    // 运输距离
    distance: number | string;
  };
  // 因子对象
  factorObj: Factor;
  // 选择的过程库产品
  processProduct: ProcessProduct;
  matchObject?: MatchObject;
  supplierObj?: Record<string, any>;
  requestState?: number;
  files?: AddFileData[];
  processId?: number;
};
