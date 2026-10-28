import { FetchNewPage } from '@src/components/TableUtil/types/util';

import { AccountProductIdNext, FootprintAccountTypeValue } from './constant';
import { AddFileDataAndUid } from '../type';

export type ShareSub = {
  // 3 成功 2密码错误 1 链接失效
  code: number;
  /** shareAuth token */
  data: string;
  msg: string;
  /** 当前是否可编辑:0不能,1能 */
  canEdit?: number;
  /** 当前是否可编辑:0不能,1能（后端 snake_case） */
  can_edit?: number;
  /** 可编辑快照副本 ID */
  supplyAccountId?: number;
  /** 可编辑快照副本 ID（后端 snake_case） */
  supply_account_id?: number;
};

/**
 * 分享提交参数
 */
export type ShareAccountInfoById = {
  /**
   * 核算id
   */
  accountId?: number | null;
  /**
   * 组织ID
   */
  companyId?: number | null;
  /**
   * 创建人
   */
  createBy?: number | null;
  /**
   * 创建时间
   */
  createTime?: null | string;
  /**
   * 0正常,1删除
   */
  delFlag?: number | null;
  /**
   * 有效期
   */
  expireTime?: string;
  /**
   * 有效期选项
   */
  expireValue: number | null;
  /**
   * id
   */
  id: number;
  /**
   * 密码
   */
  password?: null | string;
  /**
   * 类型：0无密码，1有密码
   */
  type: number | null;
  /**
   * 更新人
   */
  updateBy?: number | null;
  /**
   * 更新人
   */
  updateByName?: null | string;
  /**
   * 更新时间
   */
  updateTime?: null | string;
  /**
   * 分享链接
   */
  url?: null | string;
  /** 是否支持编辑及数据同步:0不支持,1支持 */
  editType?: number | null;
  /** 是否支持编辑及数据同步:0不支持,1支持（后端 snake_case） */
  edit_type?: number | null;
  /** 编辑权限:0首次完成建模后失效,1有效期内可编辑 */
  editPermit?: number | null;
  /** 编辑权限:0首次完成建模后失效,1有效期内可编辑（后端 snake_case） */
  edit_permit?: number | null;
  /** 当前是否可编辑:0不能,1能 */
  canEdit?: number | null;
  /** 当前是否可编辑:0不能,1能（后端 snake_case） */
  can_edit?: number | null;
  /** 可编辑快照副本 ID */
  supplyAccountId?: number | null;
  /** 可编辑快照副本 ID（后端 snake_case） */
  supply_account_id?: number | null;
};

/** 碳足迹核算 - 产品列表 */
export type AccountProductDataParams = {
  pageNum: number;
  pageSize: number;
  search?: string;
  status?: FootprintAccountTypeValue;
};

export type ProductAccountingListParams = {
  pageNum: number;
  pageSize: number;
  productId?: number | string;
  accountStatus?: number;
  accountName?: string;
  type?: number;
};

/** 碳足迹核算 - 产品信息 */
export interface AccountProductData {
  id: number;
  companyId: number;
  productCode: string;
  productName: string;
  specification: string;
  techDesc: string;
  productDesc: string;
  accountUnitCode: string;
  accountUnitName: string;
  unitType: string;
  perWeight: string;
  perUnitCode: string;
  perUnitName: string;
  productPic: string;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
  /** 产品下是否存在共享模型，用于展示「含共享模型」标识 */
  hasSharedModel?: boolean;
  files?: AddFileDataAndUid[];
  account?: AccountProductDataAccountInfo;
}

/** 碳足迹核算 - 产品信息 - 核算信息 */
export interface AccountProductDataAccountInfo {
  id: number;
  companyId: number;
  type: number;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  startTime: string;
  endTime: string;
  amount: number;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: number;
  scope: number;
  scopeValue: string;
  purpose: string;
  /**
   * 核算状态：0创建核算，1核算建模，2完成核算，3全部
   */
  accountStatus: number;
  accountStatusList: number[];
  factor: string;
  factorUnit: string;
  emissionTotal: number;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
  productIds?: number[];
  files: AccountInfoFile[];
  productNameLike: string;
  excludeIds: number[];
  /** 共享标识:0无,1已共享,3共享模型,4共享模型-收数中,5共享模型-已收数 */
  shareFlag?: number;
  /** 受共享方提交按钮显隐：1、4 展示提交 */
  shareStatus?: number;
  /** 模型来源组织 */
  sourceCompanyName?: string;
}

/** 核算信息 - 文件信息 */
export type AccountInfoFile = {
  id: number;
  companyId: number;
  type: string;
  name: string;
  url: string;
  size: number;
  sourceId: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  delFlag: number;
};

/** 新增产品提交 */
export type AccountProductAddData = {
  productName: string;
  productCode: string;
  accountUnitCode: string;
  accountUnitName: string;

  perWeight?: string;
  perUnitCode?: string;
  perUnitName?: string;
  productPic?: string;
  files?: AddFileDataAndUid[];
  specification?: string;
  techDesc?: string;
  productDesc?: string;
};

/** 编辑产品提交 */
export type AccountProductEditData = AccountProductAddData & {
  productId: number;
};

/** 上一个下一个参数 */
export type AccountProductIdNextParams = {
  productId?: string;
  right: AccountProductIdNext;
  status?: string;
  search?: string;
};

export type ProductImportParams = {
  type: 0;
} & FetchNewPage;

export type ModelShareSupplierListParams = {
  pageNum: number;
  pageSize: number;
  /** 源核算 ID */
  accountId?: number;
  /** 供应商名称，模糊搜索 */
  companyName?: string;
  /** 供应商编码，模糊搜索 */
  companyNumber?: string;
  /** 地区编码，与供应链供应商 area 字段一致 */
  areaCode?: string;
  /** 仅展示启用供应商 */
  status?: number;
  /** 邀请状态：3 邀请完成 */
  inviteStatus?: number;
};

export type ModelShareSupplier = {
  id: number;
  supplierId: number;
  companyName?: string;
  companyNumber?: string;
  areaDesc?: string;
  areaCode?: string;
  contacts?: string;
  /** 后端标记：当前共享类型下已绑定且只读反显 */
  selected?: boolean;
  shareSelected?: boolean;
  checked?: boolean;
  disabled?: boolean;
  disableReason?: string;
  shareDisabled?: boolean;
  shareDisableReason?: string;
  disabledReason?: string;
  /** 兼容旧字段命名 */
  supplierName?: string;
  supplierCompanyName?: string;
  supplierCompanyNum?: string;
  region?: string;
  contactName?: string;
  contact?: string;
};

export type ModelShareAddParams = {
  accountId: number;
  shareType: number;
  supplierIds: number[];
};

export type ModelShareRecord = {
  id: number;
  accountId: number;
  shareType: number;
  supplierId?: number;
  supplierCompanyName?: string;
  supplierCompanyNum?: string;
  status?: number | null;
  updateByName?: string;
  updateTime?: string;
  createTime?: string;
  supplierAccountId?: number;
  supplierDataId?: number;
};

export type SysShareRecord = {
  id: number;
  accountId: number;
  url?: string;
  shareUrl?: string;
  password?: string;
  type?: number;
  expireValue?: number;
  expireTime?: string;
  validityTime?: string;
  editType?: number;
  editPermit?: number;
  canEdit?: number;
  supplyAccountId?: number;
  /** 快照核算状态，2=完成建模后可同步/新建 */
  accountStatus?: number;
  updateByName?: string;
  updateTime?: string;
};

export type SysShareModelActionParams = {
  /** 分享记录 id（SysShare.id） */
  id: number;
};
