/*
 * @Author: 张明尧
 * @Date: 2022-10-11 09:48:17
 */
/**
 * 系统常量
 */
export const COMPANY_ID = 'COMPANY_ID';

/** 系统产品标识 */

export enum ProductIdentification {
  /** 产品前缀 */
  SAAS_PRODUCT_NAME = 'SAAS_PRODUCT',

  /** 首页产品标识 */
  SAAS_HOME = '1',

  /** 碳账户产品标识  */
  CARBON_ACCOUNT = 'CarbonAccount',

  /**  采购商产品标识 */
  PURCHASER = 'purchaser-carbon',

  /** 供应商产品标识 */
  SUPPLIER = 'supplier-carbon',

  /** 产品碳足迹标识*/
  CARBON_FOOT_GENERAL = 'Carbon_Footprint_General',

  /** 碳数据标识 */
  CARBON_DATA_MANAGE = 'Carbon_Data_Manage',

  /** 企业碳核算 */
  Enterprise_Carbon_Accounting = 'Enterprise_Carbon_Accounting',

  /** 产品碳足迹-旗舰版 */
  CarbonFootprint_Flag = 'CarbonFootprint_Flag',
  /** 供应链2.0 */
  SupplyChain2 = 'SupplyChain2',
  /** 产品碳足迹 3.0 */
  CarbonFootprint_3 = 'CarbonFootprint_3',

  /**  认证服务 */
  Certification_Intro = 'Certification_Intro',
}

/** 项目按钮 权限点 */
export enum ButtonPermissions {
  /** 碳核算通用版，数据提报 */
  internationalReportButton = 'internationalReportButton',
}
