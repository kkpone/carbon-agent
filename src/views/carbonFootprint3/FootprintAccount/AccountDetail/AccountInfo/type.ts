import { BuildModelDescribeSet } from '../../component/AccountInfoBuildModel/constant';
import { FootprintAccountStatusType } from '../../constant';
import { AccountInfoFile } from '../../type';

/** 碳足迹核算 - 提交核算 */
export enum FootprintAccountAddBasicBtns {
  // 仅保存
  SAVE = 0,
  // 保存建模
  BUILD = 1,
  // 去建模
  GOBUILD = 2,
}

/**
 * @description: form表单提交的值
 */
export interface SubAccountBasicFormData {
  unitData: string[];
  type: FootprintAccountStatusType;
  accountName: string;
  productName: string;
  unitName: string;
  unitCode: string;
  amount: number;
  dateTime: string[];
  productId?: string;
  scope: number;
  files?: AccountInfoFile[];
}

/**
 * @description: 新增、编辑核算基础信息 - 仅保存
 */
export interface AccountingAddBasicApiData {
  id?: number;
  /** 核算类型：0快速，1过程 */
  type: FootprintAccountStatusType;
  accountName: string;
  productId?: string;
  productName: string;
  startTime: string;
  endTime: string;
  amount: number;
  unitCode: string;
  unitName: string;
  modelId?: string;
  scope: number;
  scopeValue?: string;
  factorPrefId?: number;
  files?: AccountInfoFile[];
}

export enum EAiType {
  PROMPT = 1,
  EXCEL = 2,
  AI_CREATE = 3,
}

/** 用户状态枚举 */
export enum UserStatus {
  /** 正常用户 */
  NORMAL = '1',
  /** 试用用户到期 */
  TRIAL_EXPIRED = '2',
  /** 试用用户正常 */
  TRIAL_NORMAL = '3',
  /** 试用用户已建模 */
  TRIAL_MODELED = '4',
  /** 非试用用户无权限 */
  NO_PERMISSION = '5',
  /** 正常用户sku不足 */
  SKU_INSUFFICIENT = '6',
  /** 未登录态用户 */
  NOT_LOGGED_IN = '7',
  SAAS = '8',
}

/**
 * 核算详情
 */
export interface AccountingInfoData {
  id: number;
  accountStatus: number;
  inStatus: number;
  aiStatus: number;
  /** 核算明细数据Excel（按排放源分sheet） */
  excelUrl?: string;
  // 临时排放源的总值
  emissionTotalTmp?: number;
  companyId: number;
  type: FootprintAccountStatusType;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  productPic: string;
  /** 供应商名称（共享模型收数场景后端反显） */
  supplierName?: string;
  startTime: string;
  endTime: string;
  amount: number;
  unitType: string;
  unitCode: string;
  unitName: string;
  modelId: number;
  scope: number;
  scopeValue: string;
  factorPrefId?: number | string;
  purpose: string;
  factor: string;
  factorUnit: string;
  emissionTotal: number;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: null;
  updateTime: string;
  year: string;
  delFlag: number;
  files?: AccountInfoFile[];
  specification?: string;
  /** 共享标识:0无,1已共享,3共享模型,4共享模型-收数中,5共享模型-已收数 */
  shareFlag?: number;
  /** 受共享方提交按钮显隐：1、4 展示提交 */
  shareStatus?: number;
  /** 第三方关联 ID（共享模型收数场景，有值且 shareFlag=4/5 时详情只读） */
  thirdId?: string | number;
  /**
   * ai建模中使用此字段判断 1 ai建模 2 ai提取excel数据建模
   */
  aiType?: EAiType;
  /** AI 对话：0 显示「提供详细信息」，1 隐藏（其余取值默认隐藏更安全） */
  aiCheck?: number;
}

/** 切换生命周期 */
export interface AccountingUpadteScopeParams {
  id: number | string;
  scope: number | string;
  scopeValue?: string;
}

export type UrlStateProps = {
  productId: string;
  status: number;
  stepValue: number;
  accountId?: number;
  modelId?: number;
  listOrGraph: BuildModelDescribeSet;
  userKeys?: string;
  userContent?: string;
  productName?: string;
  productDesc?: string;
  accountUnitName?: string;
  amount?: string;
  useContent?: string;
  source?: 'PRODUCT_FOOTPRINT_LIST_AI';
  reportSnapCode?: string;
  authType?: string;
  scopeValue?: string;
  factorPrefId?: string;
  scope?: string;
  referId?: string;
};

/** AI模型和网站接口返回数据 */
export interface AiModelAndWebsiteResponse {
  code: number;
  msg: string;
  data: {
    accountId: number;
    /** 用户状态：1 正常用户 2 试用用户到期 3 试用用户正常 4 试用用户已建模 5 非试用用户无权限 6 正常用户sku不足 7 未登录态用户 */
    userStatus: UserStatus;
    productId: number;
    modelUrl: string;
  };
  lang: null;
}

/** AI模型和网站接口请求参数 */
export interface AiModelAndWebsiteParams {
  userKeys: string;
  userContent: string;
  productName?: string;
  productDesc?: string;
  accountUnitName?: string;
  amount?: string;
  lang?: string;
  scopeValue?: string;
  factorPrefId?: number;
  scope?: number;
  referId?: string;
}

/** AI模型第三方接口请求参数 */
export interface AiModelThirdParams {
  accountId: number;
  productId: number;
  userKeys: string;
  userContent: string;
  signKeys: string;
  lang?: string;
  scopeValue?: string;
  factorPrefId?: number;
  scope?: number;
  referId?: string;
}

export type ProcessAccountEveryList = {
  matchType: number;
  id: string;
  dataId: number;
  processId: number;
  name: string;
  type: number;
  typeName: string;
  emissionTotal: string;
  parentId: string;
  processType: null;
  status: number;
  orderNum: number;
  hasChild: number;
  matchWay: number;
  emissionList: ProcessAccountEveryList[];
  children: ProcessAccountEveryList[];
};
