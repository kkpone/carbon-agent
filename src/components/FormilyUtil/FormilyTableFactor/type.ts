import { FactorObjType } from './Modal/type';

export type FormilyFactorFormValue = {
  type?: number;
  name?: string;
  amount?: number;
  unitCode?: number[];
  factorObj?: FactorObjType;
  typeExtra?: TypeExtra;
  matchWay?: number;
};

/**
 * @description: 运输相关的数据
 */
interface TypeExtra {
  way: number;
  /** 运输单位标识 */
  distUnitCode?: string;
  /** 运输单位名称 */
  distUnitName?: string;
  unitCode?: string;
  unitName: string;
  /** 数量、重量、百分比 */
  amount?: string;
  /** 运输公里 */
  distance?: string;
  energyUnitCode?: number[];
  unitCodeArr?: string[];
}
