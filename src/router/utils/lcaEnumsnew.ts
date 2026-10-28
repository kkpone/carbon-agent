/**
 * @description 产品环境足迹路由信息
 */

/** 路由变量 */
export enum LCARouteMaps {
  /** 产品环境足迹 */
  'lca' = '/carbonFootprintLCAnew',

  /** 产品环境足迹-产品信息管理 */
  'lcaProduction' = '/carbonFootprintLCAnew/production',
  /** 产品环境足迹-产品信息管理 */
  'lcaProductionManage' = '/carbonFootprintLCAnew/production/manage/:productId',
  /** 产品环境足迹-产品信息管理-BOM清单 */
  'lcaProductionBom' = '/carbonFootprintLCAnew/production/bom/:productId',
  /** 产品环境足迹-产品信息管理-BOM清单-导入清单 */
  'lcaProductionBomImport' = '/carbonFootprintLCAnew/production/bom/:productId/import',
  /** 产品环境足迹-产品信息管理-供应商数据-导入 */
  'lcaProductionSupplyImport' = '/carbonFootprintLCAnew/production/supply/:productId/import',
  /** 产品环境足迹-产品信息管理-生命周期数据-导入 */
  'lcaProductionLifeCycleImport' = '/carbonFootprintLCAnew/production/manage/:productId/lifeCycleImport',
  /** 产品环境足迹-产品信息管理-生命周期数据-过程信息详情 */
  'lcaProductionLifeCycleInfo' = '/carbonFootprintLCAnew/production/manage/:productId/lifeCycleInfo',

  /** 产品环境足迹-产品环境足迹建模 */
  'lcaModel' = '/carbonFootprintLCAnew/model',
  /** 产品环境足迹-产品环境足迹建模详情 */
  'lcaModelInfo' = '/carbonFootprintLCAnew/model/:pageTypeInfo',
  /** 产品环境足迹-产品环境足迹建模详情-导入清单 */
  'lcaModelInfoImport' = '/carbonFootprintLCAnew/model/import',
  /** 产品环境足迹-产品环境足迹建模详情-导入清单 */
  'lcaModelInfoImportDataSet' = '/carbonFootprintLCAnew/importDataSet/:modelId',

  /** 产品环境足迹-过程库 */
  'lcaProcessLibrary' = '/carbonFootprintLCAnew/processLibrary',
  /** 产品环境足迹-过程库详情 */
  'lcaProcessLibraryInfo' = '/carbonFootprintLCAnew/processLibrary/:pageTypeInfo',

  /** 产品环境足迹-环境足迹报告 */
  'lcaReport' = '/carbonFootprintLCAnew/report',
}
