/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-13 11:47:41
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 17:46:33
 * @Date: 2023-01-10 19:41:30
 * @@description: 快速核算类型
 */

import { SerachCarbonFactorResult } from '@src/components/SearchFactor/type';
import { ValueOf } from 'type-fest';

import { ACCOUNT_DISPLAY_TYPE, ACCOUNT_STATUS } from './constant';
import { TypeExtra } from '../BusinessAccountingModel/type';
import { AddFileData, AddFileDataAndUid } from '../type';
/**
 * @description: 快速核算列表
 */
export interface QuickBusinessAccountingTableParams {
  /** 产品编码 */
  productCode?: number;
  /** 产品名称 */
  productName?: string;
  /** 查询核算状态 */
  accountStatusList?: string;
}

/**
 * @description: 快速核算列表
 */
export interface QuickBusinessAccountingTableData {
  id: number;
  companyId: number;
  type: string;
  accountName: string;
  accountStatus: ValueOf<typeof ACCOUNT_STATUS>;
  productId: number;
  productCode: string;
  productName: string;
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
  purpose: string;
  factor: string;
  factorUnit: string;
  emissionTotal: number;
  files: null;
  status: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateByName: string;
  updateTime: string;
  delFlag: number;
  productIds: null;
  /** 共享标识:0无,1已共享,3共享模型,4共享模型-收数中,5共享模型-已收数 */
  shareFlag?: number;
  /** 受共享方提交按钮显隐：1、4 展示提交 */
  shareStatus?: number;
  /** 模型来源组织 */
  sourceCompanyName?: string;
}

/**
 * @description: 基础文件信息
 */
export interface BasicFiles {
  name: string;
  url: string;
}

/**
 * @description: 新增核算基本信息
 */
export interface QuickBusinessAccountingAddBasic {
  /** 核算类型：0快速，1过程 */
  type: number;
  accountName: string;
  productId?: number;
  productCode: string;
  productName: string;
  startTime: string;
  endTime: string;
  amount: number;
  unitCode: string;
  unitName: string;
  modelId?: number;
  scope: number;
  scopeValue?: string;
  files: BasicFiles[];
}

/**
 * @description: 编辑核算基本信息
 */
export interface QuickBusinessAccountingEditBasic
  extends QuickBusinessAccountingAddBasic {
  id: string;
}

/**
 * @description: form表单提交的值
 */
export interface QuickBusinessAccountingAddBasicForm {
  accountName: string;
  amount: number;
  dateTime: string[];
  productCode: string;
  scope: number;
  unitData: string[];
}

/**
 * @description:获取核算的详情
 */
export interface QuickBusinessAccountingInfo {
  id: number;
  accountStatus: number;
  companyId: number;
  type: string;
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
  files: QuickBusinessAccountingInfoFile[];
  /** 共享标识:0无,1已共享,3共享模型,4共享模型-收数中,5共享模型-已收数 */
  shareFlag?: number;
  /** 受共享方提交按钮显隐：1、4 展示提交 */
  shareStatus?: number;
}

interface QuickBusinessAccountingInfoFile {
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
}

export interface QuickBusinessAccountingEmissionParams {
  accountId: string;
  stage: number;
  pageNum?: number;
  pageSize?: number;
}

/**
 * @description: 快速核算 - 核算管理 - 新增排放源
 */
export interface QuickBusinessAccountingSource {
  greenhouseGas?: string;
  gwpValue?: string;
  /** 排放源描述，上限200字；与因子说明独立。 */
  // 描述改为独立字段，旧备注不参与页面编辑。
  emissionSourceDescription?: string;
  accountId: string;
  stage: string;
  name: string;
  /** 类别：1原料，2能源，3运输，4加工，5使用，6水耗，7废弃处置 */
  type: number;
  typeExtraWay?: number;
  /** 单位标识 */
  unitCode?: string;
  /** 单位名称 */
  unitName?: string;
  /** 运输信息 */
  typeExtra?: TypeExtra;
  /** 换算比例 */
  rate?: number;
  /** 匹配方式 */
  matchWay?: number;
  /** 因子信息 */
  factorObj?: SerachCarbonFactorResult;
  files?: AddFileData[];
  unitCodeArr?: string[];
  accountEmissionTransportList?: any[];
}

/**
 * @description: 修改数量
 */
export interface QuickBusinessAccountingSourceUpdate {
  amount: string;
  id: string | number;
  typeExtra?: TypeExtra;
}

/**
 * @description: 快速核算 - 核算管理 - 排放源信息
 */
export interface QuickBusinessAccountingSourceInfo
  extends Omit<QuickBusinessAccountingSource, 'files'> {
  id: number;
  requestState: number;
  files?: AddFileDataAndUid[];
}

/**
 * @description: 快速核算 - 核算管理 - 新增排放源 - 表单的返回值
 */
export interface QuickBusinessAccountingSourceFormData {
  greenhouseGas?: string;
  gwpValue?: string;
  /** 排放源描述，独立于备注，上限200字。 */
  emissionSourceDescription?: string;
  name: string;
  selectName?: string;
  /** 类别：1原料，2能源，3运输，4加工，5使用，6水耗，7废弃处置 */
  type: number;
  /** 数量单位的标识 */
  unitData: number[];
  /** 数量、重量和载重比 */
  amount: string;
  matchWay: number;
  factorObj: SerachCarbonFactorResult & {
    denominatorUnit?: string[];
    numeratorUnit?: string;
  };

  /** 产品重量 */
  specificationWay2Numerator?: string;
  amount2: string;

  /** 运输 - 产品重量 - 运输里程 */
  distance?: string;

  /** 运输 - 载重比 */
  carryingCapacity?: string;
}

export type AccountDisplayType = ValueOf<typeof ACCOUNT_DISPLAY_TYPE>;
