/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-02-24 18:05:29
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-27 15:40:09
 */
/** 供应商管理2.0 */
export enum RouteMapsSupplyChain2 {
  /** 供应商列表 */
  'supplyChainManagement' = '/supplyChain/management',
  /** 产品列表 */
  'supplyChainProduct' = '/supplyChain/productList',
  /** 碳数据填报列表 */
  'supplyChainCarbonDataFillList' = '/supplyChain/carbonDataFillList',
  /** 碳数据填报详情 */
  'supplyChainCarbonDataFillInfo' = '/supplyChain/carbonDataFillInfo/:id',
  /** 碳数据任务列表 */
  'supplyChainCarbonDataTaskList' = '/supplyChain/carbonDataTaskList',
  /** 碳数据任务详情 */
  'supplyChainCarbonDataTaskInfo' = '/supplyChain/carbonDataTaskInfo/:id',
  /** 客户列表 */
  'supplyChainClientList' = '/supplyChain/clientList',
  /** ----------------
   *
   *
   */

  /** 供应链碳管理-新增供应商*/
  'supplyChainSupplierAddition' = '/supplyChain/supplier',
  /** 供应链碳管理-新增供应商*/
  'supplyChainSupplierDetails' = '/supplyChain/supplier/:id',
  /** 供应链碳管理-导入供应商*/
  'supplyChainSupplierImport' = '/supplyChain/supplierImport',
  /** 供应链碳管理-新增采购产品*/
  'supplyChainPurchaseProductAddition' = '/supplyChain/purchaseProduct',
  /** 供应链碳管理-采购产品详情*/
  'supplyChainPurchaseProductDetails' = '/supplyChain/purchaseProduct/:id',
  /** 供应链碳管理-导入采购产品*/
  'supplyChainPurchaseProductImport' = '/supplyChain/purchaseProductImport',
  /** 碳数据填报 */
  'carbonDataFill' = '/supplyChain/carbonData/fill/:id',
  /** 碳数据详情 */
  'carbonDataDetails' = '/supplyChain/carbonData/details/:id',
  /** 供应商碳数据审核 */
  'supplierCarbonDataAudit' = '/supplyChain/supplierCarbonData/audit/:id',
  /** 供应商碳数据详情 */
  'supplierCarbonDataDetails' = '/supplyChain/supplierCarbonData/details/:id',

  /** 供应链碳管理-供应商管理*/
  'supplyChainSupplierManage' = '/supplyChain/supplier/Manage',

  // /** 碳数据管理 */
  // /** 供应链碳管理-碳数据管理*/
  'supplyCarbonDataManage' = '/supplyChain/carbonDataManage',
  // /** 供应链碳管理-供应商碳数据*/
  'supplySupplierCarbonData' = '/supplyChain/supplierCarbonData',

  // /** 供应链碳管理-碳数据填报*/
  'supplyCarbonDataFill' = '/supplyChain/carbonDataFill',

  /** 供应链碳管理-产品介绍页面*/
  'supplyChainIntroduce' = '/supplyChain/introduce',
}
