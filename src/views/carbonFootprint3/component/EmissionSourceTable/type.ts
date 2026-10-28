/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-02 11:01:01
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-03 11:27:40
 */

import { EMISSION_SOURCE_TYPE } from './constant';

type EmissionSourceType =
  (typeof EMISSION_SOURCE_TYPE)[keyof typeof EMISSION_SOURCE_TYPE];

export type EmissionSource = {
  id: number;
  source: number;
  source_name: string;
  companyId: number;
  name: string;
  type: EmissionSourceType;
  unitCode: string;
  unitName: string;
  matchWay: number;
  rate: string;
  matchObject: {
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
  };
  typeExtraWay?: number;
  typeExtra: {
    // 运输方式
    way: number;
    // 数量、重量、百分比
    amount: number;
    // 单位标识
    unitCode: string;
    // 单位名称
    unitName: string;
    // 运输距离
    distance: number;
    // 运输固定单位
    distUnitName?: string;
  };
  amount?: number;
};

export interface EmissionSourceSetType extends Omit<EmissionSource, 'type'> {
  type?: EmissionSourceType;
  amount2?: string;
  specificationWay2Numerator?: string;
  selectName?: string;
}
