/*
 * @Author: zhangmingyao 791813037@qq.com
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-05-12 15:33:18
 * @Date: 2023-05-12 15:27:48
 * @@description:
 */
import { DataNode } from 'antd/lib/tree';

import {
  ProcessApiProduct,
  ProcessDetailVisualization,
} from './VisualizationDrawer/type';
import { BasicFiles } from '../QuickBusinessAccounting/type';
import { ProcessLibIn } from '../discharge/process/type';
import { PROCESS_ACCOUNT_STATUS } from '../util/constant';

export type ProcessAccountStatus =
  (typeof PROCESS_ACCOUNT_STATUS)[keyof typeof PROCESS_ACCOUNT_STATUS];

/** 过程核算查询条件 */
export interface ProcessBusinessAccountingEmissionParams {
  accountId?: string;
  stage?: number;
  pageNum?: number;
  pageSize?: number;
  accountStatusList?: string;
}

/** 切换生命周期 */
export interface ProcessBusinessAccountingUpadteScopeData {
  id: string;
  scope: number;
}

/**
 * @description: 过程核算列表
 */
export interface ProcessBusinessAccountingTableData {
  id: number;
  companyId: number;
  type: string;
  accountName: string;
  productId: number;
  productCode: string;
  productName: string;
  accountStatus: number;
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
}

/**
 * @description: 新增过程核算 - 仅保存
 */
export interface ProcessBusinessAccountingAddBasicData {
  id?: number;
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
 * @description: form表单提交的值
 */
export interface ProcessBusinessAccountingAddBasicForm {
  accountName: string;
  amount: number;
  dateTime: string[];
  productCode: string;
  scope: number;
  unitData: string[];
}

/**
 * @description: 菜单初始化返回值
 */
export interface ProcessBusinessAccountingMenu extends DataNode {
  /** 匹配类型：0因子，1过程 */
  matchType: number;
  /** 核算id */
  id: string;
  /** 真实Id */
  dataId: number;
  /** 真实Id */
  processId: number;
  key: string;
  /** 菜单名称 */
  name: string;
  title: string;
  parentId: string;
  /** 过程类型：1输入，2输出 */
  processType: number | null;
  /** 排序 */
  orderNum: number;
  children?: ProcessBusinessAccountingMenu[];
}

/**
 * @description: 包含树形node节点
 */

export type PostProcessInDrawerInfoData = {
  processProducts: ProcessApiProduct[];
  processOuts: ProcessApiProduct[];
  process: ProcessDetailVisualization;
  processIn: Partial<ProcessLibIn>;
};
