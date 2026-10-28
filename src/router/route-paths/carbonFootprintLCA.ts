/**
 * @description 产品环境足迹路由信息
 */

/** 路由变量 */
export enum LCARouteMaps {
  /** 产品环境足迹 */
  'lca' = '/carbonFootprintLCA',

  /** 产品环境足迹-产品信息管理 */
  'lcaProduction' = '/carbonFootprintLCA/production',
  /** 产品环境足迹-产品信息管理 */
  'lcaProductionManage' = '/carbonFootprintLCA/production/manage/:productId',
  /** 产品环境足迹-产品信息管理-BOM清单 */
  'lcaProductionBom' = '/carbonFootprintLCA/production/bom/:productId',
  /** 产品环境足迹-产品信息管理-BOM清单-导入清单 */
  'lcaProductionBomImport' = '/carbonFootprintLCA/production/bom/:productId/import',
  /** 产品环境足迹-产品信息管理-供应商数据-导入 */
  'lcaProductionSupplyImport' = '/carbonFootprintLCA/production/supply/:productId/import',
  /** 产品环境足迹-产品信息管理-生命周期数据-导入 */
  'lcaProductionLifeCycleImport' = '/carbonFootprintLCA/production/manage/:productId/lifeCycleImport',
  /** 产品环境足迹-产品信息管理-生命周期数据-过程信息详情 */
  'lcaProductionLifeCycleInfo' = '/carbonFootprintLCA/production/manage/:productId/lifeCycleInfo',

  /** 产品环境足迹-产品环境足迹建模 */
  'lcaModel' = '/carbonFootprintLCA/model',
  /** 产品环境足迹-产品环境足迹建模详情 */
  'lcaModelInfo' = '/carbonFootprintLCA/model/:pageTypeInfo',
  /** 产品环境足迹-产品环境足迹建模详情-导入清单 */
  'lcaModelInfoImport' = '/carbonFootprintLCA/model/import',
  /** 产品环境足迹-产品环境足迹建模详情-导入清单 */
  'lcaModelInfoImportDataSet' = '/carbonFootprintLCA/importDataSet/:modelId',

  /** 产品环境足迹-过程库 */
  'lcaProcessLibrary' = '/carbonFootprintLCA/processLibrary',
  /** 产品环境足迹-过程库详情 */
  'lcaProcessLibraryInfo' = '/carbonFootprintLCA/processLibrary/:pageTypeInfo',

  /** 产品环境足迹-环境足迹报告 */
  'lcaReport' = '/carbonFootprintLCA/report',
}
