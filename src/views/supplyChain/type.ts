import { BuildModelList } from '@src/components/CarbonFootprintAccount/BuildModelMainData/BuildModelList';
import { GetComponentProps } from '@src/utils/utilTypes';
import { ValueOf } from 'type-fest';

import { SUPPLIER_STATUS } from './constant';

export type PurchaseProduct = {
  purchaseGoodsId: number;
  name: string;
  specification: string;
  computationUnit: string;
  descr: string;
};

export type Supplier = {
  supplierId: number;
  companyName: string;
  companyNumber: string;
  contacts: string;
  email: string;
  phone: string;
  status: ValueOf<typeof SUPPLIER_STATUS>;
  statusDesc: string;
  inviteStatus: number;
  updateBy: string;
  updateTime: string;
  statusLoading?: boolean;
};

export type ProductSupplier = Supplier & { id: number };

export type SupplierProduct = Omit<PurchaseProduct, 'purchaseGoodsId'> & {
  id: number;
  unitPrice: string;
};

export type SupplierDetails = {
  supplierIdName: {
    supplyCompanyId: number;
    companyName: string;
    supplierId?: number | string;
  };
  companyNumber: string;
  contacts: string;
  phone: string;
  email: string;
  remark: string;
  inviteStatus: number;
  area?: string | string[];
};

export type CarbonData = {
  id: number;
  name: string;
  mappingTapShow: boolean;
  // 核算单位
  computeUnit: string;
  computeUnitDesc: string;
  unitCode?: string | null;
  status: number;
  reqDataType: number;
  // 数据请求类型 3产品碳足迹/4企业碳核算
  reqType: number;
  // 0-半生命周期;1-全生命周期;2-自定义生命周期
  footBorderType?: number;
  // 数据类型 1结果 2过程
  dataType: number;
  // 数据填报类型 1匹配产品 2直接填报 3模型共享
  fillType: number;
  // 数据要求描述
  descr: string;
  // 申请客户
  applyCompanyName: string;
  // 联系人
  contacts: string;
  phone: string;
  email: string;
  // 申请时间
  createTime: string;
  // 回复客户
  replyCompanyName: string;
  replyCompanyId: number;
  // 回复时间
  replyTime: string;
  year: string;
  report: string[];
  accountId: number | null;
  /** 模型共享标识：1 表示模型共享创建的填报任务 */
  modelShareFlag?: number | null;
  /** 源核算 ID，模型共享任务用于关联回调 */
  businessId?: number | null;
  snapshootAccountId?: number | string;
  snapFillId: number | string;
  result: {
    abandon?: number | string;
    distribution?: number | string;
    emission: number | string;
    employ?: number | string;
    manufacturing?: number | string;
    rawMaterial?: number | string;
    scopeOne?: number | string;
    scopeTwo?: number | string;
    scopeThree?: number | string;
    startTime?: string;
    endTime?: string;
    extraInfo?: string;
    year?: string;
  };
  isSelectAccount?: boolean;
  productName?: string;
};

export type CarbonDataSubmit = {
  id: number;
  submitType: number;
  fillType: number;
  report?: string[];
  [P: string]: any;
} & (
  | { accountId?: number | null; snapshootAccountId: string | number }
  | { snapshootAccountId: number | string | undefined }
  | {
      year?: string;
      emission: string;
      abandon?: null | number | string;
      distribution?: null | number | string;
      employ?: null | number | string;
      manufacturing?: null | number | string;
      rawMaterial?: null | number | string;
    }
);

export type AccountInfo = GetComponentProps<
  typeof BuildModelList
>['accountInfo'];

export type FootprintSnap = {
  snapCode: string;
  fileName: string;
  fileUrl: string;
  reportId: number;
  reportName: string;
  account: {
    id: number;
    snapshootAccountId: string;
    emissionTotal: string;
  };
  result: Record<string, number>;
};

export type EnterpriseSnap = {
  snapCode: string;
  result: Record<string, any>;
  companyId: number;
  reportId: number;
  orgId: number;
  period: string;
  reportFileList: {
    fileName: string;
    filePath: string;
    // 1 报告摘要 2 完整报告 3 清册报告
    versionType: number;
    // 1 中文 2 英文
    languageType: number;
  }[];
};

export type Org = {
  id: number;
  name: string;
  children: Org[];
};
