/**
 * @description CBAM路由信息
 */

/** 路由变量 */
export enum CBAMRouteMaps {
  /** 关于CBAM工具 */
  'cbamHome' = '/cbam/introductionPage',

  /** CBAM工具 */
  'cbam' = '/cbam',

  /** CBAM工具-工厂信息 */
  'cbamFactory' = '/cbam/factory',

  /** CBAM工具-CBAM报表 */
  'cbamReport' = '/cbam/report',
  /** CBAM工具-CBAM报表-详情 */
  'cbamReportInfo' = '/cbam/report/:pageTypeInfo',

  /** CBAM工具-运营报告；Agent 第三列使用嵌入式 edit?operationId= 路径。 */
  'cbamOperationReport' = '/cbam/operationReport',
  'cbamOperationReportAdd' = '/cbam/operationReport/add',
  'cbamOperationReportEdit' = '/cbam/operationReport/edit',
  'cbamOperationReportShow' = '/cbam/operationReport/show',

  /** CBAM工具-CBAM参数配置 */
  'cbamParameter' = '/cbam/parameter',

  /** CBAM工具-CBAM前体数据 */
  'cbamPrecursorData' = '/cbam/precursorData',
  /** CBAM工具-CBAM前体数据-详情 */
  'cbamPrecursorDataInfo' = '/cbam/precursorData/:pageTypeInfo',

  /** CBAM工具-CBAM前体数据审批 */
  'cbamPrecursorDataApproval' = '/cbam/precursorApproval',
  /** CBAM工具-CBAM前体数据审批-详情 */
  'cbamPrecursorDataApprovalInfo' = '/cbam/precursorApproval/:pageTypeInfo',

  /** CBAM工具-CBAM前体数据填报 */
  'cbamPrecursorDataFill' = '/cbam/precursorFill',
  /** CBAM工具-CBAM前体数据填报-详情 */
  'cbamPrecursorDataFillInfo' = '/cbam/precursorFill/:pageTypeInfo',
}
