import { ReactNode } from 'react';

import { FootprintAccountStatusType } from '../../constant';
import {
  AccountInfoFile,
  AccountProductData,
  AccountProductDataAccountInfo,
} from '../../type';

export type ProductSelectAccountProps = {
  /** 产品信息 */
  productInfo?: AccountProductData;
};

/**
 * @description: 功能单位核算返回值
 */
export interface ProductAccountingList extends AccountProductDataAccountInfo {
  id: number;
  companyId: number;
  type: FootprintAccountStatusType;
  accountName: string;
  accountNameNode?: ReactNode;
  productId: number;
  productCode: string;
  productName: string;
  accountStatus: number;
  baseType: number;
  accountId?: number;
  specification: string;
  startTime: string;
  endTime: string;
  amount: number;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: number;
  scope: number;
  scopeValue: string;
  stageObjs: StageInfo[];
  purpose: string;
  factor: string;
  factorUnit: string;
  emissionTotal: number;
  files: AccountInfoFile[];
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
  productIds?: number[];
  /** 1 表示当前核算被下游产品引用，需要展示“引用中/下游产品列表”入口 */
  referFlag?: number;
}

type StageInfo = {
  stage: number;
  stageName: string;
  stageTotal?: number;
};
