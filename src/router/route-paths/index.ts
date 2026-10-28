/*
 * @@description: 所有的系统路由
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-07 10:51:29
 * @LastEditors: hanguoqiang 345844393@qq.com
 * @LastEditTime: 2025-08-27 15:07:36
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-03-31 15:13:27
 */
/** 产品碳足迹3.0路由 */

import { RouteMapsCorbonFootprint3 } from './corbonFootprint3';
import { PageInfoTypeName } from '../type';

/**
 * @file 路由map
 */
export enum RouteMaps {
  'NoOrder' = '/notOrder',
  'NoOnline' = '/notOnline',
  'notFound' = '/error/404',
  'notPermission' = '/error/403',
  'supplierBindTransfer' = '/supplierBindTransfer',

  /** 账户 */
  'account' = '/account',
  'broadcast' = '/broadcast',
  'broadcastDetail' = '/broadcast/show/:type/:id',
  /** 创建组织 */
  'newOrganization' = '/account/newOrganization',
  'accountSettions' = '/account/accountSettions',
  /** 登录 */
  'login' = '/system/login',
  'scanLogin' = '/system/scanLogin',
  'carbonAgent' = '/system/carbonAgent',
  'carbonAgentTeam' = '/system/carbonAgent/team',
  'carbonAgentOAuthAuthorize' = '/oauth/authorize',
  'carbonAgentDeviceAuthorize' = '/oauth/device',
  'carbonAgentSsoCallback' = '/agent/sso/callback',
  'carbonAgentProjectInvite' = '/agent/project/invite/:inviteCode',
  'carbonAgentFeishuSimulator' = '/agent/feishu/group-simulator',
  'carbonAgentShare' = '/share/agent/:shareId',
  'carbonAgentFactor' = '/factors/:factorId',
  /** 工作台 */
  'workIndex' = '/work/index',
  'workArticleDetail' = '/work/articleDetail',
  /** 低碳资讯列表*/
  'informationList' = '/work/informationList',
  /** 资讯详情*/
  'informationDetail' = '/work/informationDetail',
  /** 产品列表*/
  'productList' = '/work/productList',
  /** 产品详情*/
  'productDetail' = '/work/productDetail',
  /** 组织管理 */
  'dashborad' = '/dashborad',

  /** 首页 - 产品服务  */
  'homeProductOrder' = '/homeProductService',
  /** 首页 - 产品服务 - 服务中心  */
  'homeProductOrderServiceCenter' = '/homeProductService/orderServiceCenter',
  /** 首页 - 产品服务 - 订购记录  */
  'homeProductOrderRecord' = '/homeProductService/orderRecor',
  /** 首页 - 产品服务 - 发票管理  */
  'homeInvoiceManagement' = '/homeProductService/invoiceManagement',
  /** 首页 - 产品服务 - 发票管理 - 发票须知 */
  'homeInvoiceManagementNotice' = '/homeProductService/invoiceManagement/notice',
  /** 首页 - 产品服务 - 发票管理 - 申请发票 */
  'homeInvoiceManagementApplyForInvoice' = '/homeProductService/invoiceManagement/applyForInvoice',
  /** 首页 - 产品服务 - 开放平台 */
  'homeOpenPlatform' = '/homeProductService/openPlatform',

  /** 系统设置 */
  'dashboradSettings' = '/dashborad/settings',
  /** 数据权限管理 */
  'datasAuth' = '/dashborad/settings/datas-auth',
  'actionsLog' = '/dashborad/settings/actions-log',
  /** 组织信息 */
  'dashboradOrganization' = '/dashborad/organization',
  /** 员工管理 */
  'dashboradOrgstaff' = '/dashborad/orgstaff',
  /** 首页-绿色供应商  */
  'greenSupplier' = '/greenSupplier',
  /** '碳足迹首页' */
  'nationalHome' = '/national/home',

  /** '产品碳足迹 - 首页' */
  'carbonFootprintIndex' = '/carbonFootprint/index',

  /** '产品碳足迹 - 产品管理' */
  'carbonFootprintProductManagement' = '/carbonFootprint/productManagement',
  /** 产品碳足迹 - 产品管理-导入 */
  'carbonFootprintProductManagementImport' = '/carbonFootprint/productManagement/import',
  /** 产品碳足迹 - 产品管理-自定义属性 */
  'carbonFootprintProductManagementCustom' = '/carbonFootprint/productManagement/custom',
  /** 产品碳足迹 - 产品管理-自定义属性 */
  'carbonFootprintProductManagementAttrList' = '/carbonFootprint/productManagement/attrList/:attrId',
  /** 产品碳足迹 - 产品管理-新增 */
  'carbonFootprintProductManagementAdd' = '/carbonFootprint/productManagement/add',
  /** 产品碳足迹 - 产品管理-编辑 */
  'carbonFootprintProductManagementEdit' = '/carbonFootprint/productManagement/edit/:id',
  /** 产品碳足迹 - 产品管理-编辑 */
  'carbonFootprintProductManagementCopy' = '/carbonFootprint/productManagement/copy/:id',
  /** 产品碳足迹 - 产品管理-详情 */
  'carbonFootprintProductManagementDetail' = '/carbonFootprint/productManagement/detail/:id',
  /** '产品碳足迹 - 碳足迹核算' */
  'carbonFootprintBusinessAccount' = '/carbonFootprint/businessAccount',
  /** '产品碳足迹 - 碳足迹核算 - 新增' */
  'carbonFootprintBusinessAccountAddBasic' = '/carbonFootprint/businessAccount/add/basic',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 新增排放源' */
  'carbonFootprintBusinessAccountAddSource' = '/carbonFootprint/businessAccount/add/source',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 新增排放源' */
  'carbonFootprintBusinessAccountAddSourceImport' = '/carbonFootprint/businessAccount/add/sourceImport',
  /** '产品碳足迹 - 碳足迹核算 - 编辑 - 编辑排放源' */
  'carbonFootprintBusinessAccountEditSource' = '/carbonFootprint/businessAccount/edit/source',
  /** '产品碳足迹 - 碳足迹核算 - 查看 - 查看排放源' */
  'carbonFootprintBusinessAccountDetailSource' = '/carbonFootprint/businessAccount/detail/source',
  /** '产品碳足迹 - 碳足迹核算 - 详情' */
  'carbonFootprintBusinessAccountAddDetail' = '/carbonFootprint/businessAccount/detail/basic/:id',
  /** '产品碳足迹 - 碳足迹核算 - 详情 - 详细' */
  'carbonFootprintBusinessAccountExpandDetail' = '/carbonFootprint/businessAccount/detail/expand/:id',
  /** '产品碳足迹 - 碳足迹核算 - 编辑' */
  'carbonFootprintBusinessAccountEditBasic' = '/carbonFootprint/businessAccount/edit/basic/:id',
  /** '产品碳足迹 - 碳足迹核算 - 编辑' */
  'carbonFootprintBusinessAccountCopyBasic' = '/carbonFootprint/businessAccount/copy/basic/:id',
  /** '产品碳足迹 - 碳足迹核算 - 选择因子库' */
  'carbonFootprintBusinessAccountAddFactors' = '/carbonFootprint/businessAccount/searchFactors',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 选择核算产品' */
  'carbonFootprintBusinessAccountAddProduct' = '/carbonFootprint/businessAccount/add/emissions/searchProduct',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 选择工艺' */
  'carbonFootprintAccountTechnologyFactors' = '/carbonFootprint/businessAccount/add/technology/searchFactors',

  /** '产品碳足迹 - 碳足迹核算 - 新增 - 查看核算产品' */
  'carbonFootprintBusinessAccountAddCheckProduct' = '/carbonFootprint/businessAccount/add/checkProductDetails',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 拓展新增' */
  'carbonFootprintBusinessAccountAddExpand' = '/carbonFootprint/businessAccount/add/expand/:id',
  /** '产品碳足迹 - 碳足迹核算 - 编辑 - 查看核算产品' */
  'carbonFootprintBusinessAccountEditCheckProduct' = '/carbonFootprint/businessAccount/edit/checkProductDetails',
  /** '产品碳足迹 - 碳足迹核算 - 编辑 - 拓展编辑' */
  'carbonFootprintBusinessAccountEditExpand' = '/carbonFootprint/businessAccount/edit/expand/:id',
  /** '产品碳足迹 - 碳足迹核算 - 导入' */
  'carbonFootprintBusinessAccountImport' = '/carbonFootprint/businessAccount/import',
  /** '产品碳足迹 - 核算模型 - 首页' */
  'carbonFootprintBusinessModel' = '/carbonFootprint/businessModel',
  /** '产品碳足迹 - 核算模型 - 新增' */
  'carbonFootprintBusinessModelAdd' = '/carbonFootprint/businessModel/add',
  /** '产品碳足迹 - 核算模型 - 编辑' */
  'carbonFootprintBusinessModelEdit' = '/carbonFootprint/businessModel/edit/:id',
  /** '产品碳足迹 - 核算模型 - 复制' */
  'carbonFootprintBusinessModelCopy' = '/carbonFootprint/businessModel/copy/:id',
  /** '产品碳足迹 - 核算模型 - 新 详情' */
  'carbonFootprintBusinessModelNewDetail' = '/carbonFootprint/businessModel/newdetail/:id',
  /** '产品碳足迹 - 核算模型 - 新增' */
  'carbonFootprintBusinessModelDetail' = '/carbonFootprint/businessModel/detail/:id',
  /** '产品碳足迹 - 核算模型 - 新增 - 拓展' */
  'carbonFootprintBusinessModelAddExpand' = '/carbonFootprint/businessModel/expand/:id',

  /** '产品碳足迹 - 核算模型 - 新增 - 新增排放源' */
  'carbonFootprintBusinessModelAddSource' = '/carbonFootprint/businessModel/add/source',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 新增排放源' */
  'carbonFootprintBusinessModelAddSourceImport' = '/carbonFootprint/businessModel/add/sourceImport',
  /** '产品碳足迹 - 核算模型 - 新增 - 选择因子库' */
  'carbonFootprintBusinessModelAddFactors' = '/carbonFootprint/businessModel/add/emissions/searchFactors',
  /** '产品碳足迹 - 核算模型 - 新增 - 选择核算产品' */
  'carbonFootprintBusinessModelAddCheckProduct' = '/carbonFootprint/businessModel/add/expand/checkProductDetails',
  /** '产品碳足迹 - 碳足迹核算 - 新增 - 选择工艺' */
  'carbonFootprintModelTechnologyFactors' = '/carbonFootprint/businessModel/add/technology/searchFactors',

  /** '产品碳足迹 - 核算模型 - 编辑 - 编辑排放源' */
  'carbonFootprintBusinessModelEditSource' = '/carbonFootprint/businessModel/edit/source',
  /** '产品碳足迹 - 核算模型 - 编辑 - 查看核算产品' */
  'carbonFootprintBusinessModelEditCheckProduct' = '/carbonFootprint/businessModel/edit/expand/checkProductDetails',

  /** '产品碳足迹 - 核算模型 - 查看 - 查看排放源' */
  'carbonFootprintBusinessModelFindSource' = '/carbonFootprint/businessModel/find/source',
  /** '产品碳足迹 - 核算模型 - 查看 - 核算详情的查看 - 查看排放源' */
  'carbonFootprintBusinessModelFindDetailSource' = '/carbonFootprint/businessModel/find/detail/source',

  /** '产品碳足迹 - 核算模型 - 编辑 - 拓展' */
  'carbonFootprintBusinessModelEditExpand' = '/carbonFootprint/businessModel/expand/edit/:id',
  /** '产品碳足迹 - 工艺管理' */
  'carbonFootprintTechnology' = '/carbonFootprint/technology',
  /** '产品碳足迹 - 工艺管理 - 详情' */
  'carbonFootprintTechnologyDetail' = '/carbonFootprint/technology/detail/:id',
  /** '产品碳足迹 - 工艺管理 - 详情 - 拓展' */
  'carbonFootprintTechnologyyExpandDetail' = '/carbonFootprint/technology/detail/expand/:id',
  /** '产品碳足迹 - 工艺管理 - 新增' */
  'carbonFootprintTechnologyAdd' = '/carbonFootprint/technology/add',
  /** '产品碳足迹 - 工艺管理 - 编辑' */
  'carbonFootprintTechnologyEdit' = '/carbonFootprint/technology/edit/:id',
  /** '产品碳足迹 - 工艺管理 - 复制' */
  'carbonFootprintTechnologyCopy' = '/carbonFootprint/technology/copy/:id',
  /** '产品碳足迹 - 工艺管理 - 新增 - 拓展' */
  'carbonFootprintTechnologyExpandAdd' = '/carbonFootprint/technology/add/expand/:id',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增主料/辅料' */
  'carbonFootprintTechnologyIngredientAdd' = '/carbonFootprint/technology/add/ingredient',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 导入入料' */
  'carbonFootprintTechnologyIngredientImport' = '/carbonFootprint/technology/add/ingredient/import',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增主料/辅料 - 选择因子' */
  'carbonFootprintTechnologyIngredientAddSearchFactors' = '/carbonFootprint/technology/add/emissions/ingredient/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增主料/辅料 - 选择核算产品' */
  'carbonFootprintTechnologyIngredientAddSearchProduct' = '/carbonFootprint/technology/add/emissions/ingredient/searchProduct',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 编辑主料/辅料' */
  'carbonFootprintTechnologyIngredientEdit' = '/carbonFootprint/technology/edit/ingredient',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 编辑主料/辅料 - 选择因子' */
  'carbonFootprintTechnologyIngredientEditSearchFactors' = '/carbonFootprint/technology/edit/emissions/ingredient/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 编辑主料/辅料 - 选择核算产品' */
  'carbonFootprintTechnologyIngredientEditSearchProduct' = '/carbonFootprint/technology/edit/emissions/ingredient/searchProduct',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 查看主料/辅料' */
  'carbonFootprintTechnologyIngredientDetail' = '/carbonFootprint/technology/detail/ingredient',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增能耗' */
  'carbonFootprintTechnologyEnergyConsumptionAdd' = '/carbonFootprint/technology/add/energyConsumption',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 导入入料' */
  'carbonFootprintTechnologyEnergyConsumptionImport' = '/carbonFootprint/technology/add/energyConsumptiont/import',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 能耗 - 选择因子' */
  'carbonFootprintTechnologyEnergyConsumptionAddSearchFactors' = '/carbonFootprint/technology/add/emissions/energyConsumption/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 能耗 - 选择核算产品' */
  'carbonFootprintTechnologyEnergyConsumptionAddSearchProduct' = '/carbonFootprint/technology/add/emissions/energyConsumption/searchProduct',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 查看能耗 */
  'carbonFootprintTechnologyEnergyConsumptionDetail' = '/carbonFootprint/technology/detail/energyConsumption',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 编辑能耗' */
  'carbonFootprintTechnologyEnergyConsumptionEdit' = '/carbonFootprint/technology/edit/energyConsumption',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增能源产出' */
  'carbonFootprintTechnologyEnergyOutputAdd' = '/carbonFootprint/technology/add/energyOutput',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 导入能源产出' */
  'carbonFootprintTechnologyEnergyOutputImport' = '/carbonFootprint/technology/add/energyOutput/import',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增能源产出 - 选择因子' */
  'carbonFootprintTechnologyEnergyOutputAddSearchFactors' = '/carbonFootprint/technology/add/emissions/energyOutput/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增能源产出 - 选择核算产品' */
  'carbonFootprintTechnologyEnergyOutputAddSearchProduct' = '/carbonFootprint/technology/add/emissions/energyOutput/searchProduct',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 查看能源产出 */
  'carbonFootprintTechnologyEnergyOutputDetail' = '/carbonFootprint/technology/detail/energyOutput',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 编辑能源产出' */
  'carbonFootprintTechnologyEnergyOutputEdit' = '/carbonFootprint/technology/edit/energyOutput',

  /** 产品碳足迹 - 工艺管理 - 核算管理 - 新增产物 */
  'carbonFootprintTechnologyProductAdd' = '/carbonFootprint/technology/add/product',
  /** 产品碳足迹 - 工艺管理 - 核算管理 - 导入产物 */
  'carbonFootprintTechnologyProductImport' = '/carbonFootprint/technology/add/product/import',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增产物 - 选择因子' */
  'carbonFootprintTechnologyProductAddSearchFactors' = '/carbonFootprint/technology/add/emissions/product/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增产物 - 选择核算产品' */
  'carbonFootprintTechnologyProductAddSearchProduct' = '/carbonFootprint/technology/add/emissions/product/searchProduct',

  /** 产品碳足迹 - 工艺管理 - 核算管理 - 编辑产物 */
  'carbonFootprintTechnologyProductEdit' = '/carbonFootprint/technology/edit/product',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增产物 - 选择因子' */
  'carbonFootprintTechnologyProductEditSearchFactors' = '/carbonFootprint/technology/edit/emissions/product/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 核算管理 - 新增产物 - 选择核算产品' */
  'carbonFootprintTechnologyProductEditSearchProduct' = '/carbonFootprint/technology/edit/emissions/product/searchProduct',

  /** '产品碳足迹 - 工艺管理 - 核算管理 - 查看产物 */
  'carbonFootprintTechnologyProductDetail' = '/carbonFootprint/technology/detail/product',

  /** '产品碳足迹 - 工艺管理 - 新增 - 新增产物' */
  'carbonFootprintTechnologyExpandProductAdd' = '/carbonFootprint/technology/add/expand/product/:id',
  /** '产品碳足迹 - 工艺管理 - 新增 - 查看核算产品' */
  'carbonFootprintTechnologyExpandAddCheckProduct' = '/carbonFootprint/technology/add/product/checkProductDetails',
  /** '产品碳足迹 - 工艺管理 - 新增 - 查看核算产品' */
  'carbonFootprintTechnologyExpandAddFindCheckProduct' = '/carbonFootprint/technology/add/find/product/checkProductDetails',
  /** '产品碳足迹 - 工艺管理 - 新增 - 查询因子库' */
  'carbonFootprintTechnologyExpandAddFactors' = '/carbonFootprint/technology/add/product/emissions/searchFactors',

  /** '产品碳足迹 - 工艺管理 - 编辑 - 拓展' */
  'carbonFootprintTechnologyExpandEdit' = '/carbonFootprint/technology/edit/expand/:id',
  /** '产品碳足迹 - 工艺管理 - 编辑 - 拓展 - 新增产物' */
  'carbonFootprintTechnologyExpandAddProductEdit' = '/carbonFootprint/technology/eAdd/expand/product/:id',
  /** '产品碳足迹 - 工艺管理 - 编辑 - 选择核算产品' */
  'carbonFootprintTechnologyExpandEditCheckProduct' = '/carbonFootprint/technology/edit/product/checkProductDetails',
  /** '产品碳足迹 - 工艺管理 - 编辑 - 查看核算产品' */
  'carbonFootprintTechnologyExpandEditFindCheckProduct' = '/carbonFootprint/technology/edit/find/product/checkProductDetails',
  /** '产品碳足迹 - 工艺管理 - 编辑 - 查询因子库' */
  'carbonFootprintTechnologyExpandEditFactors' = '/carbonFootprint/technology/edit/product/emissions/searchFactors',

  /** '产品碳足迹 - 工艺管理 - 编辑' */
  'carbonFootprintTechnologyExpandProductEdit' = '/carbonFootprint/technology/expand/product/edit/:id',
  /** '产品碳足迹 - 工艺管理 - 查询因子库' */
  'carbonFootprintFactors' = '/carbonFootprint/emissions/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 查询工艺' */
  'carbonFootprintTechnologyFactors' = '/carbonFootprint/technology/searchFactors',
  /** '产品碳足迹 - 工艺管理 - 查看核算产品' */
  'carbonFootprintCheckProductDetails' = '/carbonFootprint/technology/checkProductDetails',
  /** '产品碳足迹 - 下载管理' */
  'carbonFooprinttDowndLoad' = '/carbonFootprint/downLoad',
  /** '产品碳足迹 -  报告管理' */
  'carbonFooprintReport' = '/carbonFootprint/report',
  /** 产品碳足迹 - 产品管理-新增 */
  'carbonFooprintReporttAdd' = '/carbonFootprint/report/add',
  /** 产品碳足迹 - 产品管理 - 详情 */
  'carbonFooprintReporttDetail' = '/carbonFootprint/report/detail/:id',
  /** 产品碳足迹 - 产品管理 - 编辑 */
  'carbonFooprintReportEdit' = '/carbonFootprint/report/edit/:id',
  /** 产品碳足迹 - 产品管理-自定义属性 */
  'carbonFooprintReporttCustom' = '/carbonFootprint/report/custom',
  /** 产品碳足迹 - 产品管理-自定义属性 */
  'carbonFootprintReportAttrList' = '/carbonFootprint/report/attrList/:attrId',
  /** 角色管理 */
  'dashboradRole' = '/dashborad/role',
  /** 部门管理 */
  'dashboradDepartment' = '/dashborad/department',
  'dashboradDepartmentAdd' = '/dashborad/department/add',
  'dashboradIntro' = '/dashborad/intro',
  /** 排放因子 */
  'emission' = '/emission',
  /** 查询更多排放因子 */
  'searchFactors' = '/emissions/searchFactors/:productType',
  /** 组织因子库 */
  'emissionOrganization' = '/emission/organization',
  /** 组织因子库详情 */
  'emissionOrganizationDetail' = '/emission/organization/detail',
  /** 添加组织因子库 */
  'emissionOrganizationAdd' = '/emission/organization/add',
  /** 编辑组织因子库 */
  'emissionOrganizationEdit' = '/emission/organization/edit',
  'emissionCarbonStop' = '/emission/carbonStop',
  'emissionCarbonStopDetail' = '/emission/carbonStop/detail',
  /** '产品模型' */
  'nationalProductModels' = '/national/product-model',
  /** '新建产品模型', */
  'nationalNewModel' = '/national/:model/new',
  'nationalLifeCycle' = '/national/:model/lifecycle',
  'nationalLca' = '/national/:model/lca-results',
  /** '碳足迹 新增、编辑数据' */
  'nationalEmissionDatas' = '/national/:model/action/:step/:id?',
  /** '对照模型', */
  'nationalControlModel' = '/national/control-model',
  /** '帮助中心', */
  'nationalHelp' = '/national/help',
  /**  '常见Q&A', */
  'nationalQA' = '/national/help/qa',
  /** '问题反馈', */
  'nationalFeedback' = '/national/help/feedback',
  /** 国际版 -------------- */
  /** 数据概览 */
  'internationalHome' = '/carbonInternational',
  /** 报告主体管理 */
  'internationalCarbonManagement' = '/carbonInternational/carbonManagement',
  /** 新增/编辑 报告主体 */
  'internationaloperationManagement' = '/carbonInternational/operationManagement/:id?',
  'internationaloperationManagementShow' = '/carbonInternational/operationManagement/show/:id?',
  /** 碳排放信息管理 */
  'internationalOrganizationalManagement' = '/carbonInternational/organizationalManagement',
  /** 新增碳排放信息ghg页面 */
  'internationalAddEmissionISO' = '/carbonInternational/addCarbonReport/GHG/:step/:id?',
  /** 新增碳排放信息iso页面 */
  'internationaladdCarbonReport' = '/carbonInternational/addCarbonReport/:edition/:step/:id?',
  /** GHG Protocol标准 */
  'internationalManageGHGOrISO' = '/carbonInternational/organizationalManagement/:edition',
  /** ISO 14064-1:2018标准 */
  /** 新建排放数据ghg页面 */
  'internationalAddEmissions' = '/carbonInternational/addEmissionData/:edition/:id/:editId?',
  /** /** 新建排放数据iso页面 */
  /** 碳盘查国内版路由   正式勿动 */
  /** 数据概览 */
  'carbonNationHome' = '/carbon-national/DomesticVersion',
  /** 机组信息管理 */
  'carbonNationCarbonEmissionEnformationManagement' = '/carbon-national/DomesticVersion/CarbonEmissionEnformationManagement',
  /** 碳排放信息管理 */
  'carbonNationCrewInformationManagement' = '/carbon-national/DomesticVersion/CrewInformationManagement',
  /** 数据填报 */
  'carbonNationFill' = '/carbon-national/DomesticVersion/CrewInformationManagement/index',
  /** 报送信息详情页面 */
  'carbonNationSubmitInformation' = '/carbon-national/DomesticVersion/SubmitInformation',
  /** 月报填写 */
  'carbonNationMonthlyData' = '/carbon-national/DomesticVersion/CrewInformationManagement/MonthlyData',
  /** 绿色会议 */
  /** 绿色会议-活动管理 */
  'greenMeetingActiveity' = '/greenMeeting/activity',
  'greenMeetingAddActiveity' = '/greenMeeting/activity/addActivity',
  'greenMeetingEidtActiveity' = '/greenMeeting/activity/eidtActivity',
  'greenMeetingDetailActiveity' = '/greenMeeting/activity/detailActivity',
  /** 绿色会议-碳排放管理 */
  /**  绿色会议-碳排放核算 */
  'greenMeetingAdjust' = '/greenMeeting/adjust',
  'greenMeetingAddAdjustOne' = '/greenMeeting/adjust/addAdjustOne',
  'greenMeetingAddAdjustTwo' = '/greenMeeting/adjust/addAdjustTwo',
  'greenMeetingEidtAdjustOne' = '/greenMeeting/adjust/eidtAdjustOne',
  'greenMeetingAdjustDataMange' = '/greenMeeting/adjust/dataManage',
  'greenMeetingAdjustDetail' = '/greenMeeting/adjust/adjustDetail',
  'greenMeetingAdjustData' = '/greenMeeting/adjust/addAdjustData',
  /**  绿色会议-碳核算报告 */
  'greenMeetingReport' = '/greenMeeting/report',
  'greenMeetingReportAdd' = '/greenMeeting/report/addReport',
  'greenMeetingEidtReport' = '/greenMeeting/report/eidtReport',
  'greenMeetingReportDetail' = '/greenMeeting/report/reportDetail',
  'greenMeetingProductIntor' = '/greenMeeting/productIntor',
  /** 首页-下载管理 */
  'downloadManage' = '/dashborad/downloadManage',
  /** 月报填写 */
  'consultingServe' = '/carbonemissioncalculator',
  /** 月报填写 */
  'consultingindustrial' = '/carbonemissioncalculator/industrial',
  /** 月报填写 */
  'consultingheat' = '/carbonemissioncalculator/heat',
  /** 月报填写 */
  'consultingbusiness' = '/carbonemissioncalculator/business',
  /** 建筑行业-企业碳核算 */
  'EnterpriseCarbonAccount' = '/EnterpriseCarbonAccount',
  /** 首页 */
  'EnterpriseCarbonAccountHomePage' = '/EnterpriseCarbonAccount/homePage',
  /** 建筑管理 */
  'ConstructionManagement' = '/EnterpriseCarbonAccount/ConstructionManagement',
  /** 核算列表 */
  'AccountingList' = '/EnterpriseCarbonAccount/AccountingList',
  'AccountingListAdd' = '/EnterpriseCarbonAccount/AccountingList/add/:computationId?',
  'AccountingListResult' = '/EnterpriseCarbonAccount/AccountingList/result/:computationId?',
  'AccountingListResultShow' = '/EnterpriseCarbonAccount/AccountingList/resultShow/:computationId?',
  /** 认证服务 */
  'Certification' = '/Certification',
  /** 认证服务-企业碳核查服务 */
  'CertificationEnterprise' = '/Certification/Enterprise',
  /** 认证服务-企业碳核查服务 */
  'CertificationEnterpriseIndex' = '/Certification/Enterprise/index',
  /** 认证服务-企业碳核查项目 */
  'CertificationEnterpriseProduct' = '/Certification/Enterprise/product',
  /** 认证服务-企业碳核查项目-详情 */
  'CertificationEnterpriseProductDetail' = '/Certification/Enterprise/product/detail',
  /** 认证服务-企业碳核查项目-提交材料 */
  'CertificationEnterpriseProductSubmit' = '/Certification/Enterprise/product/submissions',
  /** 认证服务-企业碳核查发起申请 */
  'CertificationEnterpriseproductApply' = '/Certification/Enterprise/product/apply',
  /** 认证服务-企业碳核查项目-提交材料 */
  'CertificationEnterpriseproductedit' = '/Certification/Enterprise/product/edit',
  /** 认证服务-企业碳核查发起申请 */
  'CertificationEnterpriseApply' = '/Certification/Enterprise/apply',
  /** 认证服务-企业碳核查发起申请-修改项目 */
  'CertificationEnterpriseEditApply' = '/Certification/Enterprise/EditApply',
  /** 认证服务-产品碳足迹查证服务 */
  'CertificationProduct' = '/Certification/Product',
  /** 认证服务-产品碳足迹查证服务 */
  'CertificationProductIndex' = '/Certification/Product/index',
  /** 认证服务-产品碳足迹查证服务-项目 */
  'CertificationProductProduct' = '/Certification/Product/product',
  /** 认证服务-产品碳足迹查证服务-项目 */
  'CertificationProductProductDetail' = '/Certification/Product/product/detail',
  /** 认证服务-产品碳足迹查证服务-提交材料 */
  'CertificationProductProductDetailSubmit' = '/Certification/Product/product/submissions',
  /** 认证服务-产品碳足迹查证服务-提交材料 */
  'CertificationProductProductDetailEdit' = '/Certification/Product/product/edit',
  /** 认证服务-产品碳足迹查证-发起申请 */
  'CertificationProductApply' = '/Certification/Product/index/apply',
  /** 认证服务-产品碳足迹查证-修改项目 */
  'CertificationProductproductEditApply' = '/Certification/Product/product/EditApply',
  /** 认证服务-企业碳核查发起申请 */
  'CertificationProductproductApply' = '/Certification/Product/product/apply',

  /** *************************** 新产品碳足迹认证服务 *****************************/
  /** 认证服务-认证项目 */
  'CarbonFootprintCertificationProject' = '/Certification/carbonFootprint/project',
  /** 认证服务-认证项目-发起认证申请/编辑/详情 */
  'CarbonFootprintCertificationProjectApplay' = '/Certification/carbonFootprint/project/apply',
  /** ***************************************************************************/

  /** 供应链管理-采购商首页 */
  'supplyChain' = '/supplyChain/purchaserIndex',
  /** 供应链管理-供应商管理首页 */
  'supplierManagement' = '/supplyChain/supplier',
  /** 供应链管理-采购货品首页 */
  'procurementOfGoods' = '/supplyChain/procurementOfGoods',
  /** 供应链管理-供应商管理首页-新增供应商 */
  'addSupplier' = '/supplyChain/supplier/addsupplier',
  /** 供应链管理-采购货品首页-货品对比 -type用来区分是 采购商 还是供应商的货品对比 */
  'addGoodsContrast' = '/supplyChain/procurementOfGoods/addGoods/:type/',
  /** 供应链管理-采购货品首页-货品详情 */
  'procurementDetail' = '/supplyChain/procurementOfGoods/goodetail/:goodId/:type/',

  // ///////////供应链管理-采购商模块路由结束////////////////////////////

  /** 供应链管理-供应商首页 */
  'supplyProviderChain' = '/supplyProviderChain/providerIndex',
  /** 供应链管理-客户管理首页 */
  'clientManagement' = '/supplyProviderChain/clientManagement',
  /** 供应链管理-客户管理首页-成为供应商 */
  'becomeSupplier' = '/supplyProviderChain/clientManagement/becomeSupplier',
  /** 供应链管理-供应货品首页 */
  'supplyOfGoods' = '/supplyProviderChain/supplyOfGoods',
  /** 供应链管理-供应货品首页-货品对比 */
  'supplyOfGoodsContrast' = '/supplyProviderChain/supplyOfGoods/contrast/:type/',
  /** 供应链管理-供应货品首页-快速填报 */
  'quickFill' = '/supplyProviderChain/supplyOfGoods/quickFill',
  /** 供应链管理-供应货品首页-编辑快速填报 */
  'editQuickFill' = '/supplyProviderChain/supplyOfGoods/quickFill/:editId/',
  /** 供应链管理-供应货品首页-关联已有模型 */
  'associatedProductModel' = '/supplyProviderChain/supplyOfGoods/associated',
  /** 供应链管理-供应货品首页-货品详情 */
  'providerProcurementDetail' = '/supplyProviderChain/supplyOfGoods/goodetail/:goodId/:type/',
  /** 供应链管理-供应货品首页-调整关联 */
  'adjustAssociation' = '/supplyProviderChain/supplyOfGoods/adjust/:supplygoodId/',
  /** 供应链管理-邀请链接页面 */
  'inviteLink' = '/supplyChain/inviteLink/',

  // ///////////供应链管理-供应商模块路由结束////////////////////////////

  // 碳账户
  'CarbonAccount' = '/CarbonAccount',
  // 碳账户-欢迎页
  'CarbonAccountWelcome' = '/CarbonAccount/index',
  // 碳账户-用户管理
  'CarbonAccountUserManagement' = '/CarbonAccount/userManagement',
  // 碳账户-用户管理-用户列表
  'CarbonAccountUserList' = '/CarbonAccount/userManagement/userList',
  // 碳账户-用户管理-用户列表-查看用户
  'CarbonAccountUserListDetail' = '/CarbonAccount/userManagement/userList/userDetail',
  // 碳账户-用户管理-用户列表-导入用户
  'CarbonAccountImportUser' = '/CarbonAccount/userManagement/userList/importUser',
  // 碳账户-用户管理-活动数据记录
  'CarbonAccountActiveDataRecording' = '/CarbonAccount/userManagement/activeDataRecording',
  // 碳账户-用户管理-活动数据记录-详情
  'CarbonAccountActiveDataRecordingDetail' = '/CarbonAccount/userManagement/activeDataRecording/detail/:id',
  // 碳账户-用户管理-积分记录
  'CarbonAccountLntergralRecord' = '/CarbonAccount/userManagement/lntergralRecord',
  // 碳账户-场景管理
  'CarbonAccountSceneManagement' = '/CarbonAccount/sceneManagement',
  /** 碳账户 - 证书管理 */
  'CertificateManagement' = '/CarbonAccount/certificate/management',
  // 碳账户-场景管理-新增
  'CarbonAccountSceneManagementAdd' = '/CarbonAccount/sceneManagement/add',
  // 碳账户-场景管理-编辑
  'CarbonAccountSceneManagementEdit' = '/CarbonAccount/sceneManagement/edit',
  // 碳账户-场景管理-查看
  'CarbonAccountSceneManagementFind' = '/CarbonAccount/sceneManagement/find',
  // 碳账户-场景管理-新增
  'CarbonAccountSceneManagementCustomAdd' = '/CarbonAccount/sceneManagement/custom/add',
  // 碳账户-场景管理-编辑
  'CarbonAccountSceneManagementCustomEdit' = '/CarbonAccount/sceneManagement/custom/edit',
  // 碳账户-场景管理-查看
  'CarbonAccountSceneManagementCustomFind' = '/CarbonAccount/sceneManagement/custom/find',
  /** 打卡限制页 */
  'CarbonAccountSceneManagementLocationLimitRecords' = '/CarbonAccount/sceneManagement/location-limit-records/:id',
  'CarbonAccountSceneManagementLocationLimit' = '/CarbonAccount/sceneManagement/location-limit-records/:id/info/:dataId?',
  'CarbonAccountSceneManagementLocationLimitShow' = '/CarbonAccount/sceneManagement/location-limit-records/:id/info/show/:dataId?',
  // 碳账户-奖励兑换
  'CarbonAccountAwardConversion' = '/CarbonAccount/awardConversion',
  // 碳账户-奖励兑换-奖品列表
  'CarbonAccountAwardConversionAwardList' = '/CarbonAccount/awardConversion/awardList',
  // 碳账户-奖励兑换-奖品列表-新增
  'CarbonAccountAwardConversionAwardListAdd' = '/CarbonAccount/awardConversion/awardList/add',
  // 碳账户-奖励兑换-奖品列表-编辑
  'CarbonAccountAwardConversionAwardListEdit' = '/CarbonAccount/awardConversion/awardList/edit',
  // 碳账户-奖励兑换-兑换记录
  'CarbonAccountAwardConversionConversionRecord' = '/CarbonAccount/awardConversion/conversionRecord',
  // 碳账户-奖励兑换-库存变更记录
  'CarbonAccountAwardConversionInventoryRecord' = '/CarbonAccount/awardConversion/inventoryRecord',
  // 碳账户-基础设置
  'CarbonAccountBaseSetting' = '/CarbonAccount/baseSetting',
  // 碳账户-基础设置-新增banner图
  'CarbonAccountBaseSettingAddBanner' = '/CarbonAccount/baseSetting/baseInfo/addBanner',
  // 碳账户-基础设置-查看banner图
  'CarbonAccountBaseSettingCheckBanner' = '/CarbonAccount/baseSetting/baseInfo/checkBanner',
  // 碳账户-基础设置-编辑banner图
  'CarbonAccountBaseSettingEditBanner' = '/CarbonAccount/baseSetting/baseInfo/editBanner',
  // 碳账户-基础设置-组织设置
  'CarbonAccountBaseSettingOrgSetting' = '/CarbonAccount/baseSetting/orgSetting',
  /** 通用设置 */
  'CarbonAccountBaseSettingCommonSetting' = '/CarbonAccount/common-setting',
  // 碳账户-基础设置-等级设置
  'CarbonAccountBaseSettingGrade' = '/CarbonAccount/baseSetting/grade',
  // 碳账户-下载管理
  'CarbonAccountDownload' = '/CarbonAccount/download',
  /** 主题设置-列表页 */
  'CarbonAccountBaseSettingTheme' = '/CarbonAccount/baseSetting/themes',
  /** 主题设置-详情页 */
  'CarbonAccountBaseSettingThemeDetail' = '/CarbonAccount/baseSetting/theme/:id?',
  /** 主题设置-编辑页 */
  'CarbonAccountBaseSettingThemeEdit' = '/CarbonAccount/baseSetting/theme/edit/:id',
  /** 横幅设置 */
  'CarbonAccountBaseSettingBanner' = '/CarbonAccount/baseSetting/banner',
  /** 邀请码设置 */
  'CarbonAccountBaseSettingInvitation' = '/CarbonAccount/baseSetting/invitation',
  'carbonAccountFeedBacks' = '/CarbonAccount/baseSetting/feedbacks',
  'carbonAccountFeedBackDetail' = '/CarbonAccount/baseSetting/feedbacks/detail',

  /** 企业碳核算2.0*/
  'enterpriseCarbonAccounting' = '/enterpriseCarbonAccounting',

  /** 产品介绍页.0*/
  'enterpriseCarbonAccountingProductIntor' = '/enterpriseCarbonAccounting/productIntor',

  /** 企业碳核算-生产运营管理 */
  'enterpriseCarbonAccountingPom' = '/enterpriseCarbonAccounting/pom',
  /** 企业碳核算-公式设置 */
  'enterpriseCarbonAccountingFormulaSetting' = '/enterpriseCarbonAccounting/formulaSetting',
  /** 企业碳核算-审批配置 */
  'enterpriseCarbonAccountingApprovalConfig' = '/enterpriseCarbonAccounting/approvalConfig',
  /** 企业碳核算-数据看板 */
  'enterpriseCarbonAccountingAnnualReport' = '/enterpriseCarbonAccounting/AnnualReport',
  /** 企业碳核算-数据看板-组织看板 */
  'enterpriseCarbonAccountingOrgReport' = '/enterpriseCarbonAccounting/orgReport',
  /** 企业碳核算-数据看板-行业对标 */
  'enterpriseCarbonAccountingIndustryBenchmarking' = '/enterpriseCarbonAccounting/industryBenchmarking',
  /** 企业碳核算-数据看板-趋势分析 */
  'enterpriseCarbonAccountingTrendAnalysis' = '/enterpriseCarbonAccounting/trendAnalysis',

  /** 企业碳核算-数据概览*/
  'enterpriseCarbonAccountingDataView' = '/enterpriseCarbonAccounting/dataView',
  /** 企业碳核算-数据质量管理-控制计划列表*/
  'enterpriseCarbonAccountingDataQualityControlPlanList' = '/enterpriseCarbonAccounting/dataControlPlanList',
  /** 企业碳核算-数据质量管理-控制计划编辑*/
  'enterpriseCarbonAccountingDataQualityControlPlanEdit' = '/enterpriseCarbonAccounting/dataQualityEdit',
  /** 企业碳核算-数据质量管理-控制计划详情*/
  'enterpriseCarbonAccountingDataQualityControlPlanDetail' = '/enterpriseCarbonAccounting/dataQualityDetail',
  /** 企业碳核算-数据质量管理-控制计划新增*/
  'enterpriseCarbonAccountingDataQualityControlPlanAdd' = '/enterpriseCarbonAccounting/dataQualityAdd',
  /** 企业碳核算-数据质量管理-控制计划拷贝*/
  'enterpriseCarbonAccountingDataQualityControlPlanCopy' = '/enterpriseCarbonAccounting/dataQualityCopy',
  /** 企业碳核算-数据质量管理-控制计划-编辑数据管理*/
  'enterpriseCarbonAccountingDataQualitydataManagePlanEdit' = '/enterpriseCarbonAccounting/dataQualityEdit/dataManagePlanEdit',
  /** 企业碳核算-数据质量管理-控制计划拷贝-数据管理详情*/
  'enterpriseCarbonAccountingDataQualityControldataManagePlanDetail' = '/enterpriseCarbonAccounting/dataQualityEdit/dataManagePlannDetail',

  /** 企业碳核算-碳排放管理-碳排放核算列表*/
  'enterpriseCarbonAccountingcarbonDischarge' = '/enterpriseCarbonAccounting/carbonDischargeList',
  /** 企业碳核算-碳排放管理-报告披露详情*/
  'enterpriseCarbonAccountingDisclosureReportEdit' = '/enterpriseCarbonAccounting/disclosureReport/edit',
  /** 企业碳核算-碳排放管理-碳排放核算列表*/
  'enterpriseCarbonAccountingcarbonDischargeShare' = '/enterpriseCarbonAccounting/share',
  /** 企业碳核算-碳排放管理-核算 */
  'enterpriseCarbonAccountingAccounting' = '/enterpriseCarbonAccounting/accounting',
  /** 企业碳核算-碳排放管理-核算 */
  'enterpriseCarbonAccountingAccountingShare' = '/enterpriseCarbonAccounting/accounting/share',
  // TODO: sungb 移除 start
  /** 企业碳核算-碳排放管理-碳排放核算新增选择模型*/
  'enterpriseCarbonAccountingcarbonDischargeSelectModel' = '/enterpriseCarbonAccounting/carbonDischargeSelectModel',
  /** 企业碳核算-碳排放管理-新增核算 编辑 复制 查看 2.22*/
  'enterpriseCarbonAccountingcarbonDischargeAccount' = `/enterpriseCarbonAccounting/carbon-discharge-account/${PageInfoTypeName}/:id?`,
  /** 企业碳核算-碳排放管理-复制  2.22*/
  'enterpriseCarbonAccountingcarbonDischargeAccountCopy' = `/enterpriseCarbonAccounting/carbon-discharge-account-copy/${PageInfoTypeName}/:id?`,
  /** 企业碳核算-碳排放管理-编辑排放源 2.22*/
  'enterpriseCarbonAccountingcarbonDischargeEmission2_22' = `/enterpriseCarbonAccounting/carbonDischargeEmissiontow/${PageInfoTypeName}/:computationId/:id/:fromType?`,
  /** 企业碳核算-碳排放管理-填写活动数据编辑排放源 2.22*/
  'enterpriseCarbonAccountingFillActiveEmission2_22' = `/enterpriseCarbonAccounting/carbonDischargeEmissiontow/${PageInfoTypeName}/:id?`,

  /** 企业碳核算-碳排放管理-碳排放核算新增基本信息*/
  'enterpriseCarbonAccountingcarbonDischargeAddBaseInfo' = '/enterpriseCarbonAccounting/carbonDischargeAddBaseInfo',
  /** 企业碳核算-碳排放管理-碳排放核算编辑基本信息*/
  'enterpriseCarbonAccountingcarbonDischargeEditBaseInfo' = '/enterpriseCarbonAccounting/carbonDischargeEditBaseInfo',
  /** 企业碳核算-碳排放管理-碳排放核算复制基本信息*/
  'enterpriseCarbonAccountingcarbonDischargeCopyBaseInfo' = '/enterpriseCarbonAccounting/carbonDischargeCopyBaseInfo',
  /** 企业碳核算-碳排放管理-碳排放核算详情*/
  'enterpriseCarbonAccountingcarbonDischargeDetail' = '/enterpriseCarbonAccounting/carbonDischargeDetail',
  /** 企业碳核算-碳排放管理-碳排放核算报表*/
  'enterpriseCarbonAccountingcarbonDischargeReport' = '/enterpriseCarbonAccounting/carbonDischargeReport',
  /** 企业碳核算-碳排放管理-碳排放核算排放源管理（分类管理）*/
  'enterpriseCarbonAccountingcarbonDischargeEmissionManage' = '/enterpriseCarbonAccounting/carbonDischargeEmissionManage',
  /** 企业碳核算-碳排放管理-碳排放核算新增排放源*/
  'enterpriseCarbonAccountingcarbonDischargeAddEmission' = '/enterpriseCarbonAccounting/carbonDischargeAddEmission',
  /** 企业碳核算-碳排放管理-碳排放核算编辑正式排放源*/
  'enterpriseCarbonAccountingcarbonDischargeEditEmission' = '/enterpriseCarbonAccounting/carbonDischargeEditEmission',
  /** 企业碳核算-碳排放管理-碳排放核算编辑草稿排放源*/
  'enterpriseCarbonAccountingcarbonDischargeDraftEmission' = '/enterpriseCarbonAccounting/carbonDischargeDraftEmission',
  /** 企业碳核算-碳排放管理-碳排放核算复制排放源*/
  'enterpriseCarbonAccountingcarbonDischargeCopyEmission' = '/enterpriseCarbonAccounting/carbonDischargeCopyEmission',
  /** 企业碳核算-碳排放管理-碳排放核算排放源详情*/
  'enterpriseCarbonAccountingcarbonDischargeEmissionDetail' = '/enterpriseCarbonAccounting/carbonDischargeEmissionDetail',

  /** 企业碳核算-碳排放管理-碳排放核算选择排放源*/
  'enterpriseCarbonAccountingcarbonDischargeSelectEmission' = '/enterpriseCarbonAccounting/carbonDischargeSelectEmission',
  /** 企业碳核算-碳排放管理-碳排放核算选择排放因子*/
  'enterpriseCarbonAccountingcarbonDischargeSelectFactor' = '/enterpriseCarbonAccounting/carbonDischargeSelectFactor',
  /** 企业碳核算-碳排放管理-碳排放核算排放因子详情*/
  'enterpriseCarbonAccountingcarbonDischargeFactorDetail' = '/enterpriseCarbonAccounting/carbonDischargeFactorDetail',
  /** 企业碳核算-碳排放管理-碳排放核算导入排放源*/
  'enterpriseCarbonAccountingcarbonDischargeImprotDischarge' = '/enterpriseCarbonAccounting/carbonDischargeImprotDischarge',
  /** 企业碳核算-碳排放管理-碳排放核算导出排放源*/
  'enterpriseCarbonAccountingcarbonDischargeExportDischarge' = '/enterpriseCarbonAccounting/carbonDischargeExportDischarge',
  /** 企业碳核算-碳排放管理-碳排放核算 选择排放源 排放源详情*/
  'enterpriseCarbonAccountSelectEmissionDetail' = '/enterpriseCarbonAccounting/carbonDischargeSelectEmissionDetail',
  // TODO: sungb 移除 end

  /** 企业碳核算-碳排放管理-核算报告列表*/
  'enterpriseCarbonAccountingcarbonDischargeAccountReportList' = '/enterpriseCarbonAccounting/carbonDischargeAccountReportList',
  /** 企业碳核算-碳排放管理-核算新增报告*/
  'enterpriseCarbonAccountingcarbonDischargeAccountReportAdd' = '/enterpriseCarbonAccounting/carbonDischargeAccountReportAdd',
  /** 企业碳核算-碳排放管理-核算编辑报告*/
  'enterpriseCarbonAccountingcarbonDischargeAccountReportEdit' = '/enterpriseCarbonAccounting/carbonDischargeAccountReportEdit',
  /** 企业碳核算-碳排放管理-核算详情报告*/
  'enterpriseCarbonAccountingcarbonDischargeAccountReportDetail' = '/enterpriseCarbonAccounting/carbonDischargeAccountReportDetail',
  /** 企业碳核算-碳排放管理-核算详情报告-选择减排场景*/
  'enterpriseCarbonAccountingcarbonDischargeAccountsSelectScene' = '/enterpriseCarbonAccounting/carbonDischargeAccountSelectScene',

  /** 企业碳核算-碳排放管理-核算模型列表 */
  'enterpriseCarbonAccountingcarbonDischargeAccountModelList' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelList',
  /** 企业碳核算-碳排放管理-核算模型-排放源管理*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelEmissionManage' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelEmissionManage',
  /** 企业碳核算-碳排放管理-核算模型列表 */
  'enterpriseCarbonAccountingModelList' = '/enterpriseCarbonAccounting/model/list',
  /** 企业碳核算-碳排放管理-核算 */
  'enterpriseCarbonAccountingModelDetail' = '/enterpriseCarbonAccounting/model/detail',
  // TODO:sungb 移除 model 模块 start
  /** 企业碳核算-碳排放管理-核算模型-新增核算 2.2*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelAddAccount2_22' = `/enterpriseCarbonAccounting/carbon-discharge-account-model/${PageInfoTypeName}/:step/:id?`,
  /** 企业碳核算-碳排放管理-核算模型详情*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelDetail' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelDetail',
  /** 企业碳核算-碳排放管理-排放源编辑新增详情*/
  'enterpriseCarbonAccountingcarbonModelEmissionModelInfo' = `/enterpriseCarbonAccounting/carbon-discharge-emission-model-info/${PageInfoTypeName}/:id?`,
  /** 企业碳核算-碳排放管理-选择排放源*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelSelectEmission' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelSelectEmission',
  /** 企业碳核算-碳排放管理-选择排放源详情*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelSelectEmissionDetail' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelSelectEmissionDetail',
  /** 企业碳核算-碳排放管理-核算模型排放详情*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelEmissionsDetail' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelEmissionDetail',
  /** 企业碳核算-碳排放管理-新增排放源 2.22*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelAddEmission2_22' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelAddEmission',
  /** 企业碳核算-碳排放管理-编辑排放源 2.22*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelEditEmission2_22' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelEditEmission',
  /** 企业碳核算-碳排放管理-导入排放源 2.22*/
  'enterpriseCarbonAccountingcarbonDischargeAccountModelImportEmission2_22' = '/enterpriseCarbonAccounting/carbonDischargeAccountModelImportEmission',
  // TODO:sungb 移除 model 模块 end
  /** 企业碳核算-碳排放管理-排放源库列表*/
  'enterpriseCarbonAccountingcarbonDischargeEmissionDicList' = '/enterpriseCarbonAccounting/carbonDischargeEmissionDicList',
  /** 企业碳核算-碳排放管理-排放源库新增 编辑 */
  'enterpriseCarbonAccountingcarbonDischargeEmissionDicInfo' = `/enterpriseCarbonAccounting/carbon-discharge-emission-dic-info/${PageInfoTypeName}/:id?/:fromType?`,
  /** 企业碳核算-碳排放管理-导入排放源库*/
  'enterpriseCarbonAccountingcarbonDischargeEmissionDicImport' = '/enterpriseCarbonAccounting/carbonDischargeEmissionDicImport',
  /** 企业碳核算-碳排放管理-排放源库选择因子*/
  'enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactor' = '/enterpriseCarbonAccounting/carbonDischargeAccountDicSelectFactor',
  /** 企业碳核算-碳排放管理-排放源库选择因子详情*/
  'enterpriseCarbonAccountingcarbonDischargeAccountDicSelectFactorDetail' = '/enterpriseCarbonAccounting/carbonDischargeAccountDicSelectFactorDetail',

  /** 企业碳核算-碳减排管理-排放基准列表*/
  'enterpriseCarbonAccountingEmissionLessEmissionStandardList' = '/enterpriseCarbonAccounting/emissionLessEmissionStandardList',
  /** 企业碳核算-碳减排管理-排放基准详情*/
  'enterpriseCarbonAccountingEmissionLessEmissionStandardDetail' = '/enterpriseCarbonAccounting/emissionLessEmissionStandardDetail',
  /** 企业碳核算-碳减排管理-编辑排放基准*/
  'enterpriseCarbonAccountingEmissionLessEmissionStandardEdit' = '/enterpriseCarbonAccounting/emissionLessEmissionStandardEdit',
  /** 企业碳核算-减排行动-减排计划 */
  'enterpriseCarbonAccountingReducingPlan' = '/enterpriseCarbonAccounting/reducingPlan',

  /** 企业碳核算-碳排放管理-减排场景列表*/
  'enterpriseCarbonAccountingEmissionLessEmissionLessSceneList' = '/enterpriseCarbonAccounting/emissionLessEmissionLessSceneList',
  /** 企业碳核算-碳排放管理-减排场景添加*/
  'enterpriseCarbonAccountingEmissionLessEmissionLessSceneAdd' = '/enterpriseCarbonAccounting/emissionLessEmissionLessSceneAdd',
  /** 企业碳核算-碳排放管理-减排场景详情*/
  'enterpriseCarbonAccountingEmissionLessEmissionLessSceneDetail' = '/enterpriseCarbonAccounting/emissionLessEmissionLessSceneDetail',
  /** 企业碳核算-碳排放管理-减排场景编辑*/
  'enterpriseCarbonAccountingEmissionLessEmissionLessSceneEdit' = '/enterpriseCarbonAccounting/emissionLessEmissionLessSceneEdit',

  /** 企业碳核算-下载管理列表*/
  'enterpriseCarbonAccountingDownloadList' = '/enterpriseCarbonAccounting/emissionLessEmissionLessDownload',
  /** 企业碳核算-供应商碳管理*/
  'enterpriseCarbonAccountingSupplierManageList' = '/enterpriseCarbonAccounting/enterpriseCarbonAccountingSupplierManageList',
  /** 企业碳核算 - 审核  */
  'enterpriseCarbonAccountingSupplierManageAudit' = '/enterpriseCarbonAccounting/enterpriseCarbonAccountingSupplierManageAudit',
  /** 企业碳核算 - 审核-排放源详情  */
  'enterpriseCarbonAccountingSupplierManageAuditEmissionDetail' = '/enterpriseCarbonAccounting/enterpriseCarbonAccountingDataFillSelectProductDetailAudit/:id/:stage',
  /** 企业碳核算 - 查看  */
  'enterpriseCarbonAccountingSupplierManagDetail' = '/enterpriseCarbonAccounting/enterpriseCarbonAccountingSupplierManageDetail',
  /** 企业碳核算 - 审核-排放源详情 ' */
  'enterpriseCarbonAccountingSupplierManagDetailEmissionDetail' = '/enterpriseCarbonAccounting/enterpriseCarbonAccountingDataFillSelectProductDetaildetail/:id/:stage',
  /** 企业碳核算 - 审核-排放源详情 ' */
  'enterpriseCarbonAccountingAiReport' = '/enterpriseCarbonAccounting/AiReport',
  /** 企业碳核算 - 审核-排放源详情 ' */
  'enterpriseCarbonAccountingCdpAiReportDetail' = '/enterpriseCarbonAccounting/CdpAiReport/detail',
  'enterpriseCarbonAccountingCdpAiReportList' = '/enterpriseCarbonAccounting/CdpAiReport/list',
  'enterpriseCarbonAccountingCdpAiReportScore' = '/enterpriseCarbonAccounting/CdpAiReport/score',
  /** 企业碳核算 - AI 报告详情' */
  'enterpriseCarbonAccountingAiReportDetail' = '/enterpriseCarbonAccounting/AiReport/Detail',
  /** 企业碳核算 - 数据填报列表' */
  'enterpriseCarbonAccountingTaskList' = '/enterpriseCarbonAccounting/taskList',
  'enterpriseCarbonAccountingNoLoginTaskList' = '/enterpriseCarbonAccounting/noLoginTaskList',
  /** 企业碳核算 - 数据审批列表' */
  'enterpriseCarbonAccountingApprovalList' = '/enterpriseCarbonAccounting/approvalList',
  /** 企业碳核算 - 未登录审批列表' */
  'enterpriseCarbonAccountingNoLoginApprovalList' = '/enterpriseCarbonAccounting/noLoginApprovalList',
  'enterpriseCarbonAccountingSetting' = '/enterpriseCarbonAccounting/setting',
  'cbam' = '/cbam',
  'cbamHome' = '/cbam/introductionPage',
  'cbamFactory' = '/cbam/factory',
  'cbamReport' = '/cbam/report',
  'cbamReportInfo' = '/cbam/report/:pageTypeInfo',
  'cbamPrecursorData' = '/cbam/precursorData',
  'cbamPrecursorDataInfo' = '/cbam/precursorData/:pageTypeInfo',
  'cbamPrecursorDataApproval' = '/cbam/precursorApproval',
  'cbamPrecursorDataApprovalInfo' = '/cbam/precursorApproval/:pageTypeInfo',
  'cbamPrecursorDataFill' = '/cbam/precursorFill',
  'cbamPrecursorDataFillInfo' = '/cbam/precursorFill/:pageTypeInfo',
  /** CCDB */
  'CCDB' = '/CCDB',
  /** CCDB Home */
  'CCDBHome' = '/CCDB/Home',
  'CCDBSearch' = '/CCDB/Search',
  'CCDBCollect' = '/CCDB/Collect',

  /** ESG */
  'ESG' = '/ESG',
  'ESGManagement' = '/ESG/management',
  'ESGIndicatorInfo' = '/ESG/indicator/:frameId/:indicatorId',
  'ESGFillManagement' = '/ESG/fillManagement',
  'ESGOrgTaskList' = '/ESG/orgTaskList',
  'ESGIndicatorFillInfo' = '/ESG/indicator/fill/:frameId/:indicatorId',
  'ESGSummary' = '/ESG/summary',
  'ESGAiGenerateDetail' = '/ESG/aiGenerateDetail',
  'ESGAiGenerateOutline' = '/ESG/aiGenerateOutline',
  'ESGAiGenerateHome' = '/ESG/aiGenerateHome',
  'ESGAiGenerateList' = '/ESG/aiGenerateList',
  'ESGMsciRatingList' = '/ESG/msciRatingList',
  'ESGMsciRatingDetail' = '/ESG/msciRatingDetail',
  'ESGImportanceAnalysis' = '/ESG/importanceAnalysis',
  'ESGImportanceAnalysisAdd' = '/ESG/importanceAnalysis/add',
  'ESGImportanceAnalysisInfo' = '/ESG/importanceAnalysis/:id',
  'ESGImportanceAnalysisFill' = '/ESG/importanceAnalysis/fill/:id',
  'ESGImportanceAnalysisResult' = '/ESG/importanceAnalysis/result/:id',
  /** 问卷服务 */
  'questionnaire' = '/questionnaire',
  'questionnaireList' = '/questionnaire/list',
  'questionnaireAdd' = '/questionnaire/add',
  'questionnaireEdit' = '/questionnaire/edit/:id',
  'questionnaireFill' = '/questionnaire/fill/:id',
  'questionnaireResult' = '/questionnaire/result/:id',
}

export const CARBON_AGENT_PROJECT_INVITE_QUERY_KEY = 'projectInviteCode';

export type RouteMapsType = RouteMapsCorbonFootprint3 | RouteMaps;

export const virtualLinkTransform = (
  virtualLink: RouteMapsType,
  replaces: string[],
  news: (string | number | undefined)[],
) => {
  let res: string = virtualLink;
  replaces.forEach((key, index) => {
    res = res.replace(key, String(news[index] ?? ''));
  });

  /** 移除链接末尾多余的 / */
  while (res.endsWith('/')) {
    res = res.slice(0, -1);
  }

  return res;
};
