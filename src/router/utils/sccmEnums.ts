/**
 * @description 供应链核算管理路由
 */
/** 路由变量 */
export enum SccmRouteMaps {
  /** 供应链核算管理 */
  'sccm' = '/supplyChain',

  /** 供应链商户管理 */
  'sccmManagement' = '/supplyChain/supplierManagement',
  /** 供应链商户管理-商户详情：pageTypeInfo: 页面变量add-新增 edit-编辑 show-查看; id:查看数据的id */
  'sccmManagementInfo' = '/supplyChain/supplierManagement/:pageTypeInfo/:id',
  /** 供应链商户管理-导入 */
  'sccmManagementImport' = '/supplyChain/supplierManagement/import',

  /** 商户关联审核 */
  'sccmQuestionnaire' = '/supplyChain/associationReview',

  /** 采购产品管理 */
  'sccmProdct' = '/supplyChain/productManagement',
  /** 采购产品管理-导入 */
  'sccmProdctImport' = '/supplyChain/productManagement/import',
  /** 采购产品管理详情：pageTypeInfo: 页面变量add-新增 edit-编辑 show-查看; id:查看数据的id */
  'sccmProdctInfo' = '/supplyChain/productManagement/:pageTypeInfo/:id',
  /** 采购产品管理-采购产品管理详情-产品碳足迹详情 */
  'sccmProdctInfoCarbonFootPrintInfo' = '/supplyChain/productManagement/:pageTypeInfo/:id/:carbonFootPrintPageTypeInfo/:carbonFootPrintId',
  'sccmProdctInfoCarbonFootPrintInfoEmissionSourceInfo' = '/supplyChain/productManagement/:pageTypeInfo/:id/:carbonFootPrintPageTypeInfo/:carbonFootPrintId/emissionSource/:factorPageInfo/:factorId/:factorInfo',
  /** 采购产品管理-供应商管理 */
  'sccmProdctSupplierManagement' = '/supplyChain/productManagement/:id/supplierManagement',
  /** 采购产品管理-供应商管理详情：id: 采购产品管理id;productPageTypeInfo:页面变量add-新增 edit-编辑 show-查看;productId: 供应商id */
  'sccmProdctSupplierManagementInfo' = '/supplyChain/productManagement/:id/supplierManagement/:supplierPageTypeInfo/:supplierId',
  /** 采购产品管理-供应商管理-选择供应商：id: 采购产品管理id; */
  'sccmProdctSupplierManagementSelect' = '/supplyChain/productManagement/:id/supplierManagement/select/:orgId',
  /** 采购产品管理-供应商管理-申请产品碳足迹：id: 采购产品管理id; supplierId: 供应商管理id; */
  'sccmProdctSupplierManagementApply' = '/supplyChain/productManagement/:id/supplierManagement/apply/:supplierId',

  /** 供应商核算数据 */
  'sccmCarbonData' = '/supplyChain/supplierCarbonData',
  /** 供应商碳数据-详情 pageTypeInfo: 页面变量add-新增 edit-编辑 show-查看; id:查看数据的id */
  'sccmCarbonDataInfo' = '/supplyChain/supplierCarbonData/:pageTypeInfo/:id',

  /** 供应商数据审批 */
  'sccmApproval' = '/supplyChain/carbonDataApproval',
  /** 供应商数据审批-详情 pageTypeInfo: 页面变量add-审核 edit-审核 show-查看; id:查看数据的id */
  'sccmApprovalInfo' = '/supplyChain/carbonDataApproval/:pageTypeInfo/:id/:dataId/:dataType/:auditStatus',

  /** 供应商数据填报 */
  'sccmFill' = '/supplyChain/carbonDataFill',
  /** 供应商数据填报-详情 */
  'sccmFillInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id',

  // ---

  /** 供应商管理-供应商管理详情-企业碳核算详情 pageTypeInfo: 页面变量add-新增 edit-编辑 show-查看; id:查看数据的id; accountingPageTypeInfo: 企业碳核算页面变量add-新增 edit-编辑 show-查看; accountingId: 企业碳核算id */
  'sccmManagementInfoCarbonAccountingInfo' = '/supplyChain/supplierManagement/:pageTypeInfo/:id/carbonAccounting/:accountingPageTypeInfo/:accountingId',
  /** 供应商管理-供应商管理详情-企业碳核算详情-排放源详情 */
  'sccmManagementInfoCarbonAccountingInfoEmissionSourceInfo' = '/supplyChain/supplierManagement/:pageTypeInfo/:id/carbonAccounting/:accountingPageTypeInfo/:accountingId/emissionSource/:factorPageInfo/:factorId',
  /** 供应商管理-申请企业碳核算：id:查看数据的id */
  'sccmManagementApply' = '/supplyChain/supplierManagement/apply/:id',
  /** 供应商管理-采购产品管理 */
  'sccmManagementPurchaseProduct' = '/supplyChain/supplierManagement/:id/purchaseProduct',
  /** 供应商管理-采购产品管理详情：id: 供应商管理id;productPageTypeInfo:页面变量add-新增 edit-编辑 show-查看;productId: 采购产品id */
  'sccmManagementPurchaseProductInfo' = '/supplyChain/supplierManagement/:id/purchaseProduct/:productPageTypeInfo/:productId',
  /** 供应商管理-采购产品管理-选择采购产品：id: 供应商管理id; orgId: 供应商所属组织id */
  'sccmManagementPurchaseProductSelect' = '/supplyChain/supplierManagement/:id/purchaseProduct/select/:orgId',
  /** 供应商管理-采购产品管理-申请产品碳足迹：id: 供应商管理id; productId: 采购产品id */
  'sccmManagementPurchaseProductApply' = '/supplyChain/supplierManagement/:id/purchaseProduct/apply/:productId',

  /** 低碳问卷详情：pageTypeInfo: 页面变量add-新增 edit-编辑 show-查看; id:查看数据的id */
  'sccmQuestionnaireInfo' = '/supplyChain/questionnaire/:pageTypeInfo/:id',
  /** 低碳问卷-问卷预览 */
  'sccmQuestionnairePreview' = '/supplyChain/questionnaire/preview/:id',

  /** 供应商碳数据-详情-企业碳核算-核算过程-排放源详情 */
  'sccmCarbonDataInfoEnterpriseEmissonSourceInfo' = '/supplyChain/supplierCarbonData/:pageTypeInfo/:id/enterpriseEmissionSource/:factorPageInfo/:factorId',
  /** 供应商碳数据-详情-产品碳足迹-核算过程-排放因子详情 */
  'sccmCarbonDataInfoProductEmissonSourceInfo' = '/supplyChain/supplierCarbonData/:pageTypeInfo/:id/productEmissionSource/:factorPageInfo/:factorId/:factorInfo',

  /** 碳数据审核详情-企业碳核算-核算过程-排放源详情 */
  'sccmApprovalInfoEnterpriseEmissonSourceInfo' = '/supplyChain/carbonDataApproval/:pageTypeInfo/:id/:dataId/:dataType/:auditStatus/enterpriseEmissionSource/:factorPageInfo/:factorId',
  /** 碳数据审核详情-产品碳足迹-核算过程-排放因子详情  */
  'sccmApprovalInfoProductEmissonSourceInfo' = '/supplyChain/carbonDataApproval/:pageTypeInfo/:id/:dataId/:dataType/:auditStatus/productEmissionSource/:factorPageInfo/:factorId/:factorInfo',

  /** 碳数据填报-详情-产品碳足迹-选择核算产品 */
  'sccmFillInfoProductSelect' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/productSelect/:pageType',
  /** 碳数据填报-详情-产品碳足迹-选择核算产品-详情 */
  'sccmFillInfoProductSelectInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/productSelect/:pageType/:productionBusinessId',
  /** 碳数据填报-详情-产品碳足迹-选择核算产品-详情-排放源详情 */
  'sccmFillInfoProductSelectInfoEmissionSourceInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/productSelect/:pageType/:productionBusinessId/emissionSource/:factorPageInfo/:factorId/:factorInfo',
  /** 碳数据填报-详情-产品碳足迹-核算产品详情 */
  'sccmFillInfoProductInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/product/:pageType',
  /** 碳数据填报-详情-产品碳足迹-核算产品详情-排放因子详情  */
  'sccmFillInfoProductInfoEmissionSourceInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/product/:pageType/emissionSource/:factorPageInfo/:factorId/:factorInfo',

  /** 碳数据填报-详情-企业碳核算-选择碳排放核算 */
  'sccmFillInfoEnterpriseSelect' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/enterpriseSelect',
  /** 碳数据填报-详情-企业碳核算-选择碳排放核算-核算详情 */
  'sccmFillInfoEnterpriseSelectInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/enterpriseSelect/:pageType/:basicInfo',
  /** 碳数据填报-详情-企业碳核算-选择碳排放核算-核算详情-排放源详情 */
  'sccmFillInfoEnterpriseSelectInfoEmissonSourceInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/enterpriseSelect/:pageType/:basicInfo/emissionSource/:factorPageInfo/:factorId',

  /** 碳数据填报-详情-企业碳核算-核算记录详情 */
  'sccmFillInfoEnterpriseInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/enterprise/:pageType/:basicInfo',
  /** 碳数据填报-详情-企业碳核算-核算记录详情-排放源详情 */
  'sccmFillInfoEnterpriseInfoEmissionSourceInfo' = '/supplyChain/carbonDataFill/:pageTypeInfo/:id/enterprise/:pageType/:basicInfo/emissionSource/:factorPageInfo/:factorId',
}
