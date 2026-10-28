/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-01-03 11:33:04
 * @LastEditors: zhangmingyao 791813037@qq.com
 * @LastEditTime: 2023-06-19 16:44:57
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-03-03 17:01:37
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-06 19:06:01
 */

export enum RouteMapsCorbonFootprint3 {
  /** '产品碳足迹3.0 - 首页' */
  'carbonFootprint3Index' = '/carbonFootprint3/index',
  /** '产品碳足迹3.0 - 数据看板' */
  'carbonFootprint3Datas' = `/carbonFootprint3/datas`,
  /** '产品碳足迹3.0 - 数据概览' */
  'carbonFootprint3DatasTotal' = `/carbonFootprint3/datas/total`,
  /** '产品碳足迹3.0 - 对比报告' */
  'carbonFootprint3DatasCompare' = `/carbonFootprint3/datas/compare`,
  /** 产品碳足迹3.0 - 对比报告列表 */
  'carbonFootprint3DatasCompareList' = `/carbonFootprint3/datas/compare/list`,
  /**  产品碳足迹3.0 - 对比报告对比详情 */
  'carbonFootprint3DatasCompareDetail' = `/carbonFootprint3/datas/compare/detail`,

  /** '产品碳足迹3.6.2 - 碳标签 - 列表页面' */
  'carbonFootprint3CarbonLabel' = '/carbonFootprint3/carbonLabel',
  /** '产品碳足迹3.6.2 - 碳标签 - 新增申请' */
  'carbonFootprint3CarbonLabelAdd' = '/carbonFootprint3/carbonLabel/add',
  /** '产品碳足迹3.6.2 - 碳标签 - 申请详情' */
  'carbonFootprint3CarbonLabelDetail' = '/carbonFootprint3/carbonLabel/detail',

  /** '产品碳足迹3.5.1 - 碳足迹核算 - 列表页面' */
  'carbonFootprint3FootprintAccount' = '/carbonFootprint3/footprintAccount',
  /** '产品碳足迹3.5.1 - 碳足迹核算 - 分享页面' */
  'carbonFootprint3FootprintAccountShare' = '/carbonFootprint3/footprintAccount/share',
  /** '产品碳足迹3.5.1 - 碳足迹核算 - 分享页面' */
  'carbonFootprint3FootprintAccountShareBossModel' = '/carbonFootprint3/footprintAccount/shareBossModel',

  /** '产品碳足迹3.5.1 - 碳足迹核算 - 分享页面 - 携带登录' */
  'carbonFootprint3FootprintAccountShareLogin' = '/carbonFootprint3/footprintAccount/shareAccountLogin',

  /** '产品碳足迹3.5.1 - 碳足迹核算 - 产品碳足迹产品详情页面' */
  'carbonFootprint3FootprintProductDetail' = '/carbonFootprint3/footprintAccount/productDetail',
  /** '产品碳足迹3.5.1 - 碳足迹核算 - 新增、编辑核算详情页面' */
  'carbonFootprint3FootprintAccountDetail' = '/carbonFootprint3/footprintAccount/accountDetail',
  /** '产品碳足迹3.5.1 - 碳足迹核算 - 新增核算 */
  'carbonFootprint3FootprintAccountAdd' = '/carbonFootprint3/footprintAccount/addAccountBasic',
  // /carbonFootprint3/quickBusinessAccounting/addBasic

  /** '产品碳足迹3.0 - 产品管理' */
  'carbonFootprint3ProductManagement' = '/carbonFootprint3/productManagement',
  /** '产品碳足迹3.0 - 产品管理 - 产品库' */
  'carbonFootprint3ProductLibrary' = '/carbonFootprint3/productManagement/productLibrary',
  /** '产品碳足迹3.0 - 产品管理 - 产品库 - 新增' */
  'carbonFootprint3ProductLibraryAdd' = '/carbonFootprint3/productManagement/productLibrary/add',
  /** '产品碳足迹3.0 - 产品管理 - 产品库 - 编辑' */
  'carbonFootprint3ProductLibraryEdit' = '/carbonFootprint3/productManagement/productLibrary/edit',
  /** '产品碳足迹3.0 - 产品管理 - 产品库 - 详情' */
  'carbonFootprint3ProductLibraryDetail' = '/carbonFootprint3/productManagement/productLibrary/detail',
  /** '产品碳足迹3.0 - 产品管理 - 产品库 - 导入文件' */
  'carbonFootprint3ProductLibraryImport' = '/carbonFootprint3/productManagement/productLibrary/import',

  /** '产品碳足迹3.0 - 产品管理 - 产品属性' */
  'carbonFootprint3ProductAttribute' = '/carbonFootprint3/productManagement/productAttribute',
  /** '产品碳足迹3.0 - 产品管理 - 产品属性 - 新增' */
  'carbonFootprint3ProductAttributeAdd' = '/carbonFootprint3/productManagement/productAttribute/add',
  /** '产品碳足迹3.0 - 产品管理 - 产品属性 - 新增枚举值' */
  'carbonFootprint3ProductAttributeAddEnum' = '/carbonFootprint3/productManagement/productAttribute/addEnum',
  /** '产品碳足迹3.0 - 产品管理 - 产品属性 - 编辑' */
  'carbonFootprint3ProductAttributeEdit' = '/carbonFootprint3/productManagement/productAttribute/edit',

  /** '产品碳足迹3.0 - 排放数据库' */
  'carbonFootprint3Discharge' = '/carbonFootprint3/dischargeRootNode',
  /** '产品碳足迹3.0 - 排放数据库 - 核算模型库' */
  'carbonFootprint3ModelLibrary' = '/carbonFootprint3/discharge/modelLibrary',
  /** '产品碳足迹3.0 - 排放数据库 - 核算模型库 - 模型管理' */
  'carbonFootprint3ModelManagement' = '/carbonFootprint3/discharge/modelLibrary/management',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库' */
  'carbonFootprint3EmissionSoureLibrary' = '/carbonFootprint3/discharge/emissionSoureLibrary',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库 - 新增排放源库' */
  'carbonFootprint3EmissionSoureLibraryAdd' = '/carbonFootprint3/discharge/emissionSoureLibrary/add',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库 - 编辑排放源库' */
  'carbonFootprint3EmissionSoureLibraryEdit' = '/carbonFootprint3/discharge/emissionSoureLibrary/edit',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库 - 详情排放源库' */
  'carbonFootprint3EmissionSoureLibraryDetail' = '/carbonFootprint3/discharge/emissionSoureLibrary/detail',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库 - 新增排放源库 - 选择因子' */
  'carbonFootprint3EmissionSoureLibraryAddSelectFactor' = '/carbonFootprint3/emissionSoureLibrary/quickManagementFactor',
  /** '产品碳足迹3.0 - 排放数据库 - 排放源库 - 编辑排放源库 - 选择因子' */
  'carbonFootprint3EmissionSoureLibraryEditSelectFactor' = '/carbonFootprint3/emissionSoureLibrary/editQuickManagementFactor',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库' */
  'carbonFootprint3ProcessLibrary' = '/carbonFootprint3/discharge/process',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增基本信息' */
  'carbonFootprint3ProcessLibraryAdd' = '/carbonFootprint3/discharge/process/add',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 过程库详情' */
  'carbonFootprint3ProcessLibraryDetails' = '/carbonFootprint3/discharge/process/details/:id',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑过程库' */
  'carbonFootprint3ProcessLibraryEdit' = '/carbonFootprint3/discharge/process/edit/:id',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑过程库 - 选择排放源' */
  'carbonFootprint3ProcessLibraryEmissionSourceSelect' = '/carbonFootprint3/discharge/process/edit/:id/emissionSourceSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增产品' */
  'carbonFootprint3ProcessLibraryProductAdd' = '/carbonFootprint3/discharge/process/product',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增产品 - 选择过程' */
  'carbonFootprint3ProcessLibraryProcessLibSelect' = '/carbonFootprint3/discharge/process/product/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增产品 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryFactorSelect' = '/carbonFootprint3/discharge/process/product/factorSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 过程详情 - 产品详情' */
  'carbonFootprint3ProcessLibraryProductInfo' = '/carbonFootprint3/discharge/process/product/:id/info',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑过程 - 产品详情' */
  'carbonFootprint3ProcessLibraryEditProductInfo' = '/carbonFootprint3/discharge/processEdit/product/:id/info',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑产品' */
  'carbonFootprint3ProcessLibraryProductEdit' = '/carbonFootprint3/discharge/process/product/:id',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑产品 - 选择过程' */
  'carbonFootprint3ProcessLibraryProcessLibSelectEdit' = '/carbonFootprint3/discharge/process/product/:id/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑产品 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryFactorSelectEdit' = '/carbonFootprint3/discharge/process/product/:id/factorSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输入' */
  'carbonFootprint3ProcessLibraryInAdd' = '/carbonFootprint3/discharge/process/in',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输入 - 选择过程' */
  'carbonFootprint3ProcessLibraryInProcessLibSelect' = '/carbonFootprint3/discharge/process/in/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输入 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryInFactorSelect' = '/carbonFootprint3/discharge/process/in/factorSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 过程详情 - 输入详情' */
  'carbonFootprint3ProcessLibraryInInfo' = '/carbonFootprint3/discharge/process/in/:id/info',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑过程 - 输入详情' */
  'carbonFootprint3ProcessLibraryEditInInfo' = '/carbonFootprint3/discharge/processEdit/in/:id/info',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输入' */
  'carbonFootprint3ProcessLibraryInEdit' = '/carbonFootprint3/discharge/process/in/:id',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输入 - 选择过程' */
  'carbonFootprint3ProcessLibraryInProcessLibSelectEdit' = '/carbonFootprint3/discharge/process/in/:id/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输入 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryInFactorSelectEdit' = '/carbonFootprint3/discharge/process/in/:id/factorSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输出' */
  'carbonFootprint3ProcessLibraryOutAdd' = '/carbonFootprint3/discharge/process/out',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输出 - 选择过程' */
  'carbonFootprint3ProcessLibraryOutProcessLibSelect' = '/carbonFootprint3/discharge/process/out/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 新增输出 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryOutFactorSelect' = '/carbonFootprint3/discharge/process/out/factorSelect',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 过程详情 - 输出详情' */
  'carbonFootprint3ProcessLibraryOutInfo' = '/carbonFootprint3/discharge/process/out/:id/info',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 过程详情 - 输出详情' */
  'carbonFootprint3ProcessLibraryEditOutInfo' = '/carbonFootprint3/discharge/processEdit/out/:id/info',

  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输出' */
  'carbonFootprint3ProcessLibraryOutEdit' = '/carbonFootprint3/discharge/process/out/:id',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输出 - 选择过程' */
  'carbonFootprint3ProcessLibraryOutProcessLibSelectEdit' = '/carbonFootprint3/discharge/process/out/:id/processLibSelect',
  /** '产品碳足迹3.0 - 排放数据库 - 过程库 - 编辑输出 - 选择排放因子' */
  'carbonFootprint3ProcessLibraryOutFactorSelectEdit' = '/carbonFootprint3/discharge/process/out/:id/factorSelect',

  /** '产品碳足迹3.0 - 碳足迹核算' */
  'carbonFootprint3BusinessAccounting' = '/carbonFootprint3/businessAccounting',
  /** '产品碳足迹3.0 - 快速核算' */
  'carbonFootprint3QuickBusinessAccounting' = '/carbonFootprint3/quickBusinessAccounting',
  /** '产品碳足迹3.0 - 快速核算 - 选择模型' */
  'carbonFootprint3QuickBusinessAccountingModel' = '/carbonFootprint3/quickBusinessAccounting/model',
  /** '产品碳足迹3.0 - 快速核算 - 新增基本信息' */
  'carbonFootprint3QuickBusinessAccountingAddBasic' = '/carbonFootprint3/quickBusinessAccounting/addBasic',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 编辑基本信息 */
  'carbonFootprint3QuickBusinessAccountingEditBasic' = '/carbonFootprint3/quickBusinessAccounting/editSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 复制基本信息 */
  'carbonFootprint3QuickBusinessAccountingCopyBasic' = '/carbonFootprint3/quickBusinessAccounting/copySource',

  /** '产品碳足迹3.0 - 快速核算 - 核算管理' */
  'carbonFootprint3QuickBusinessAccountingManagement' = '/carbonFootprint3/quickBusinessAccounting/management',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理' */
  'carbonFootprint3QuickBusinessAccountingManagementDetail' = '/carbonFootprint3/quickBusinessAccounting/managementDetail',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 新增排放源' */
  'carbonFootprint3QuickBusinessAccountingManagementAddSource' = '/carbonFootprint3/quickBusinessAccounting/management/addSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 编辑排放源' */
  'carbonFootprint3QuickBusinessAccountingManagementEditSource' = '/carbonFootprint3/quickBusinessAccounting/management/editSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 排放源详情' */
  'carbonFootprint3QuickBusinessAccountingManagementDetailSourceDetail' = '/carbonFootprint3/quickBusinessAccounting/managementDetail/detailSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 排放源详情' */
  'carbonFootprint3QuickBusinessAccountingManagementDetailSource' = '/carbonFootprint3/quickBusinessAccounting/management/detailSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 导入排放源' */
  'carbonFootprint3QuickBusinessAccountingManagementImportSource' = '/carbonFootprint3/quickBusinessAccounting/management/importSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 选择排放源' */
  'carbonFootprint3QuickBusinessAccountingManagementSelectSource' = '/carbonFootprint3/quickBusinessAccounting/management/selectSource',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 新增 - 选择因子' */
  'carbonFootprint3QuickBusinessAccountingFactorSelect' = '/carbonFootprint3/quickBusinessAccounting/management/factorSelect',
  /** '产品碳足迹3.0 - 快速核算 - 核算管理 - 编辑 - 选择因子' */
  'carbonFootprint3QuickBusinessAccountingFactorSelectEdit' = '/carbonFootprint3/quickBusinessAccounting/management/editFactorSelect',

  /** '产品碳足迹3.0 - 过程核算' */
  'carbonFootprint3ProcessBusinessAccounting' = '/carbonFootprint3/processBusinessAccounting',
  /** '产品碳足迹3.0 - 过程核算 - 选择模型' */
  'carbonFootprint3ProcessBusinessAccountingSelectModel' = '/carbonFootprint3/processBusinessAccounting/selectModel',
  /** '产品碳足迹3.0 - 过程核算 - 新增基本信息' */
  'carbonFootprint3ProcessBusinessAccountingAddBasic' = '/carbonFootprint3/processBusinessAccounting/addBasic',
  /** '产品碳足迹3.0 - 过程核算 - 核算管理 - 复制基本信息 */
  'carbonFootprint3ProcessBusinessAccountingCopyBasic' = '/carbonFootprint3/processBusinessAccounting/copySource',
  /** '产品碳足迹3.0 - 过程核算 - 新增过程' */
  'carbonFootprint3ProcessBusinessAccountingAddOrBasicDetail' = '/carbonFootprint3/processBusinessAccounting/addOrBasicDetail',
  /** '产品碳足迹3.0 - 过程核算 - 新增过程' */
  'carbonFootprint3ProcessBusinessAccountingAddOrDetail' = '/carbonFootprint3/processBusinessAccounting/addOrDetail',
  /** '产品碳足迹3.0 - 过程核算 - 核算管理 - 输出导入' */
  'carbonFootprint3ProcessBusinessAccountingManagementImportOut' = '/carbonFootprint3/processBusinessAccounting/addOrDetail/management/importOut',
  /** '产品碳足迹3.0 - 过程核算 - 核算管理 - 输入导入' */
  'carbonFootprint3ProcessBusinessAccountingManagementImportIn' = '/carbonFootprint3/processBusinessAccounting/addOrDetail/management/importIn',
  /** '产品碳足迹3.0 - 过程核算 - 构建模型' */
  'carbonFootprint3ProcessBusinessAccountBuildModel' = '/carbonFootprint3/processBusinessAccounting/buildModel',

  /** '产品碳足迹3.0 - 碳足迹报告' */
  'carbonFootprint3ProcessReport' = '/carbonFootprint3/report',
  'carbonFootprint3ProcessReportInfo' = '/carbonFootprint3/report/:pageInfoType/:id/:comparisonId',

  /** '产品碳足迹3.0 - 过程核算 - 核算管理' */
  'carbonFootprint3ProcessBusinessAccountingManagement' = '/carbonFootprint3/processBusinessAccounting/management',

  /** '产品碳足迹3.0 - 核算模型' */
  'carbonFootprint3BusinessAccountingModel' = '/carbonFootprint3/businessAccountingModel',
  /** '产品碳足迹3.0 - 核算模型 - 新增基本信息' */
  'carbonFootprint3BusinessAccountingModelAddBasic' = '/carbonFootprint3/businessAccountingModel/addBasic',
  /** '产品碳足迹3.0 - 核算模型 - 编辑基本信息' */
  'carbonFootprint3BusinessAccountingModelEditBasic' = '/carbonFootprint3/businessAccountingModel/editBasic',
  /** '产品碳足迹3.0 - 核算模型 - 复制基本信息' */
  'carbonFootprint3BusinessAccountingModelCopyBasic' = '/carbonFootprint3/businessAccountingModel/copyBasic',
  /** '产品碳足迹3.0 - 核算模型 - 查看 - 核算管理(快速核算)' */
  'carbonFootprint3BusinessAccountingModelQuickManagementDetail' = '/carbonFootprint3/businessAccountingModel/quickManagementDetail',

  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算)' */
  'carbonFootprint3BusinessAccountingModelQuickManagement' = '/carbonFootprint3/businessAccountingModel/quickManagement',
  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 新增排放源' */
  'carbonFootprint3BusinessAccountingQuickManagementAddSource' = '/carbonFootprint3/businessAccountingModel/quickManagement/addSource',
  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 新增排放源 - 选择因子' */
  'carbonFootprint3BusinessAccountingQuickManagementSelectFactor' = '/carbonFootprint3/businessAccountingModel/quickManagementFactor',

  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 选择排放源' */
  'carbonFootprint3BusinessAccountingQuickManagementSelectSource' = '/carbonFootprint3/businessAccountingModel/quickManagement/selectSource',

  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 编辑排放源' */
  'carbonFootprint3BusinessAccountingQuickManagementEditSource' = '/carbonFootprint3/businessAccountingModel/quickManagement/editSource',
  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 编辑排放源 - 选择因子' */
  'carbonFootprint3BusinessAccountingQuicEditkManagementSelectFactor' = '/carbonFootprint3/businessAccountingModel/edit/quickManagementFactor',

  /** '产品碳足迹3.0 - 核算模型 - 核算管理(快速核算) - 查看排放源' */
  'carbonFootprint3BusinessAccountingQuickManagementDetailSource' = '/carbonFootprint3/businessAccountingModel/quickManagement/detailSource',
  /** '产品碳足迹3.0 - 核算模型 - 查看核算管理(快速核算) - 查看排放源' */
  'carbonFootprint3BusinessAccountingQuickManagementDetailSourceDetail' = '/carbonFootprint3/businessAccountingModel/quickManagementDetail/detailSource',

  /** 下载管理 */
  'carbonFootprint3Download' = '/carbonFootprint3/download',

  'carbonFootprint3SupplierManageList' = '/carbonFootprint3/carbonFootprint3SupplierManageList',
  /** '产品碳足迹3.0 - 审核  */
  'carbonFootprint3SupplierManageAudit' = '/carbonFootprint3/carbonFootprint3SupplierManageAudit',
  /** '产品碳足迹3.0 - 审核-排放源详情  */
  'carbonFootprint3SupplierManageAuditEmissionDetail' = '/carbonFootprint3/carbonFootprint3DataFillSelectProductDetailAudit/:id/:stage',
  /** '产品碳足迹3.0 - 查看  */
  'carbonFootprint3SupplierManagDetail' = '/carbonFootprint3/carbonFootprint3SupplierManageDetail',
  /** '产品碳足迹3.0 - 审核-排放源详情 ' */
  'carbonFootprint3SupplierManagDetailEmissionDetail' = '/carbonFootprint3/carbonFootprint3DataFillSelectProductDetailDetail/:id/:stage',

  /** '产品碳足迹3.0 - 供应商碳数据 ' */
  'carbonFootprint3SupplierCarbonData' = '/carbonFootprint3/supplierCarbonData',
  /** '产品碳足迹3.0 - 供应商碳数据 - 审核 ' */
  'carbonFootprint3SupplierCarbonDataAudit' = '/carbonFootprint3/supplierCarbonDataAudit',
  /** 供应链碳管理-供应商碳数据-审核-企业碳核算排放详情*/
  'carbonFootprint3CarbonDataCarbonAccountAuditEmissionDetail' = '/carbonFootprint3/supplySupplierCarbonDataCarbonAccountAuditEmissionDetail',
  /** 供应链碳管理-供应商碳数据-审核-产品碳足迹排放详情*/
  'carbonFootprint3CarbonDataFootprintAuditEmissionDetail' = '/carbonFootprint3/supplySupplierCarbonDataCarbonAccountAuditEmissionDetail',
  /** '产品碳足迹3.0 - 供应商碳数据 - 详情 ' */
  'carbonFootprint3SupplierCarbonDataDetail' = '/carbonFootprint3/supplierCarbonDataDetail',
  /** 供应链碳管理-供应商碳数据-详情-企业碳核算排放详情*/
  'carbonFootprint3CarbonDataCarbonAccountDetailEmissionDetail' = '/carbonFootprint3/supplySupplierCarbonDataCarbonAccountDetailEmissionDetail',
  /** 供应链碳管理-供应商碳数据-详情-产品碳足迹排放详情*/
  'carbonFootprint3CarbonDataFootprintDetailEmissionDetail' = '/carbonFootprint3/supplySupplierCarbonDataCarbonAccountAuditEmissionDetail',
}
