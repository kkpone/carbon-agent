/** 手动填写因子 - 因子对应的值 */
export type FactorObjType = {
  id?: number;
  name: string;
  factor: number | string;
  factorPattern?: string;
  ecoinventValueVisible?: boolean;
  numeratorUnit: string;
  denominatorUnit: string;
  institution: string;
  year: string;
  matchWay: number;
  rate?: number;
  noMatchFactor?: boolean;
  unitString?: string;
};

/** 手动填写因子 - 单位是数组 */
export type FactorWriteObjType = {
  name: string;
  factor: number;
  numeratorUnit: string;
  denominatorUnit: number[];
  institution: string;
  year: string;
};
