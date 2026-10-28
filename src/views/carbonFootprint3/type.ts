/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-13 16:21:42
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-27 15:23:55
 */
/** 列表接口返回值 */
import { ValueOf } from 'type-fest';

import { FootprintAccountTypeValue } from './FootprintAccount/constant';
import { AccountProductDataAccountInfo } from './FootprintAccount/type';
import { QUICK_ACCOUNT_LIFE_CYCLE } from './constant';

export interface BackTableData<TableData> {
  currSize: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  rows: TableData[];
  total: number;
}

/** 常用的Options类型 */
export type OptionsTypesData = {
  label: string;
  value: number;
  children?: OptionsTypesData[];
};

export interface AddFileData {
  suffix: string;
  name: string;
  url: string;
  uid: string;
}

export interface AddFileDataExtends extends AddFileData {
  id?: string;
}

export interface AddFileDataAndUid extends Omit<AddFileData, 'suffix'> {
  uid: string;
  id?: string;
}

export type QuickAccountLifeCycleStage = ValueOf<
  typeof QUICK_ACCOUNT_LIFE_CYCLE
>;

/** 产品 - 列表请求参数 */
export type CommonProductListDataParams = {
  pageNum: number;
  pageSize: number;
  search?: string;
  status?: FootprintAccountTypeValue;
  productId?: number;
};

/** 产品 - 列表 */
export interface CommonProductListData {
  account?: AccountProductDataAccountInfo;
  id: number;
  companyId?: number;
  productCode: string;
  productName: string;
  /** 规格型号 */
  specification: string;
  /** 产品描述 */
  productDesc: string;
  /**
   * 核算状态:0未核算,1已核算,2全部
   */
  status: number;
  createBy?: string;
  createTime?: string;
  updateTime?: string;
  startTime: string;
  endTime: string;
  factor?: string;
  factorUnit?: string;
  baseType?: number;
  /**
   * 0正常,1删除
   */
  delFlag: number;
  /**
   * 单位标识
   */
  accountUnitCode: string;
  /**
   * 单位名称
   */
  accountUnitName: string;
  /**
   * 单位产品标识
   */
  perUnitCode?: string;
  /**
   * 单位产品名称
   */
  perUnitName?: string;
  /**
   * 单位产品重量
   */
  perWeight?: string;
  /**
   * 产品图片
   */
  productPic: string;
  /**
   * 工艺生产工艺图
   */
  files?: AddFileData[];
  /**
   * 工艺描述
   */
  techDesc?: string;
}
