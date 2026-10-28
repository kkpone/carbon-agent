/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-03-14 10:53:19
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-05 15:52:55
 */
import { ProcessProduct } from '@src/views/carbonFootprint3/component/ProcessLibProductSelect/type';
import {
  Factor,
  ProcessLibIn,
} from '@src/views/carbonFootprint3/discharge/process/type';
import { AddFileData } from '@src/views/carbonFootprint3/type';

export type PostProcessProductsListData = {
  processProducts: ProcessApiProduct[];
  processOuts: ProcessApiProduct[];
  process: ProcessDetailVisualization;
  processIn: ProcessLibIn;
};

export type PostProcessInData = {
  processProducts: Record<string, any>[];
  process: Record<string, any>;
  processIn?: Record<string, any>;
};

export type ProcessApiProduct = {
  id: number;
  companyId: number;
  accountId: number;
  processId: number;
  stage: number;
  name: string;
  type: number;
  amount: string;
  shareRate: number | null;
  unitCode: string;
  unitName: string;
  rate: null | string;
  emissionTotal: string;
  matchWay: number;
  matchWay_name: string;
  matchTypeId: number;
  matchId: number | null;
  matchName: null | string;
  factor: string;
  factorUnit: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  remark: string;
  delFlag: number;
  orderNum: number;
  matchObject: Factor;
  factorObj: Factor;
  processProduct: ProcessProduct;
  files?: AddFileData[];
  typeExtra: {
    // 再生回收率
    recycleRate: number | string;
    // 修正系数
    correctRate: number | string;
  };
  useAmount: number;
};

export interface ProcessDetailVisualization {
  id: number;
  source: number;
  source_name: string;
  companyId: number;
  name: string;
  type: number | null;
  emissionTotal: null;
  boundary: string;
  accountYear: string;
  productErea: string;
  processEquipment: string;
  productScale: string;
  mainMaterial: string;
  mainEnergy: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null;
  updateTime: string;
  remark: string;
  delFlag: number;
}
