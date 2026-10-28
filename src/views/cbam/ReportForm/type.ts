/**
 * cbam报表列表搜索框
 */
export interface CbamRequest {
  cbamName?: string;
  factoryName?: string;
  orgId?: number;
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  year?: string;
  [property: string]: any;
}

/**
 * cbam报表一般信息
 */
export interface GeneralInfoProps {
  /**
   * 报告周期拼接
   */
  collectDate?: string;
  createBy?: number;
  createTime?: Date;
  delFlag?: number;
  /**
   * 报告周期结束日期
   */
  endDate?: string;
  factory?: Factory;
  /**
   * 工厂id
   */
  factoryId?: number;
  factoryName?: string;
  id?: number;
  /**
   * 所属组织
   */
  orgId?: number;
  orgName?: string;
  /**
   * 工业过程证明材料
   */
  processSupport?: string;
  /**
   * 产品数据证明材料
   */
  productSupport?: string;
  /**
   * 报表名称
   */
  reportName?: string;
  /**
   * 报告周期开始日期
   */
  startDate?: string;
  updateBy?: number;
  updateByName?: string;
  updateTime?: Date;
  verification?: Verification;
  [property: string]: any;
}

/**
 * Factory，工厂
 */
export interface Factory {
  /**
   * 授权代表姓名
   */
  authorizedRepresentative?: string;
  /**
   * 城市
   */
  city?: string;
  /**
   * 国家
   */
  country?: string;
  /**
   * 创建人
   */
  createBy?: number;
  createTime?: Date;
  /**
   * 0正常;1删除
   */
  delFlag?: number;
  /**
   * 详细地址
   */
  detailedAddress?: string;
  /**
   * 经济活动
   */
  economicActivity?: string;
  email?: string;
  factorName?: string;
  /**
   * 工厂编码
   */
  factoryCode?: string;
  /**
   * 工厂名称英文
   */
  factoryNameEn?: string;
  id?: number;
  /**
   * 纬度
   */
  latitude?: string;
  /**
   * 区位码
   */
  locationCode?: string;
  /**
   * 经度
   */
  longitude?: string;
  /**
   * 电话
   */
  mobile?: string;
  /**
   * 所属组织id
   */
  orgId?: number;
  orgName?: string;
  /**
   * 邮政编码
   */
  postalCode?: string;
  /**
   * 邮政信箱
   */
  postOfficeBox?: string;
  /**
   * 更新人
   */
  updateBy?: number;
  updateByName?: string;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * Verification，验证机构信息
 */
export interface Verification {
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 国家认证机构名称
   */
  certificationName?: string;
  /**
   * 城市
   */
  city?: string;
  /**
   * 公司名称
   */
  corporateName?: string;
  /**
   * 国家
   */
  country?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 详细地址
   */
  detailedAddress?: string;
  /**
   * 电子邮件
   */
  email?: string;
  /**
   * 传真
   */
  fax?: string;
  /**
   * 验证者授权代表姓名
   */
  fullName?: string;
  id?: number;
  /**
   * 认证成员国
   */
  memberState?: string;
  /**
   * 电话
   */
  mobile?: string;
  /**
   * 邮政编码
   */
  postalCode?: string;
  /**
   * 认证机构颁发的注册号
   */
  registrationNo?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * cbam报表-工厂直接排放-源流列表请求
 */
export interface SourceFlowRequest {
  /**
   * cbamId
   */
  cbamId?: number;
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * processMethod
   */
  processMethod?: number;
  [property: string]: any;
}

/**
 * cbam报表-工厂直接排放-源流列表返回
 */
export interface SourceFlowResp {
  /**
   * 活动数据
   */
  activityData?: number;
  /**
   * 活动数据单位
   */
  activityUnit?: string;
  /**
   * 生物质含量
   */
  biomassContent?: number;
  /**
   * 生物质含量单位
   */
  biomassContentUnit?: string;
  /**
   * 碳含量
   */
  carbon?: number;
  /**
   * 碳含量单位
   */
  carbonUnit?: string;
  cbamId?: number;
  /**
   * 碳氧化率/转换系数
   */
  conversionRate?: number;
  /**
   * 碳氧化率单位/转换系数单位 %
   */
  conversionRateUnit?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 排放系数
   */
  emissionCoefficient?: number;
  /**
   * 排放系数单位
   */
  emissionCoefficientUnit?: string;
  id?: number;
  /**
   * 低位发热量
   */
  lowHeat?: number;
  /**
   * 低位发热量单位
   */
  lowHeatUnit?: string;
  /**
   * 方法枚举:1燃烧;2工艺;3物料平衡(没有氧化率和氧化率单位)(1:燃烧; 2:工艺排放; 3:物料平衡)
   */
  processMethod?: number;
  /**
   * 源流名称
   */
  sourceName?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * cbam报表-产品和前驱体-产品类别列表请求
 */
export interface ProductCategoryRequest {
  /**
   * cbamId
   */
  cbamId?: number;
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  [property: string]: any;
}

/**
 * cbam报表-产品和前驱体-产品类别列表返回
 */
export interface ProductCategoryResp {
  cbamId?: number;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 相关前驱体
   */
  precursors?: string;
  precursorsNames?: string;
  /**
   * 产品类别id
   */
  productCategoryId?: number;
  /**
   * 生产路线,逗号分隔,取默认的生产工序id
   */
  productRoute?: string;
  productRouteNames?: string;
  /**
   * 产品类别带过来的单位
   */
  unit?: string;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的生产工序列表（生产路线）请求
 */
export interface ConfigProcessRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的生产工序列表（生产路线）返回
 */
export interface ConfigProcessResp {
  /**
   * 生产工序名称
   */
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的相关前驱体列表（相关前驱体）请求
 */
export interface ConfigPrecursorRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的相关前驱体列表（相关前驱体）返回
 */
export interface ConfigPrecursorResp {
  /**
   * 生产工序名称
   */
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的包含产品列表（包含的产品类别）请求
 */
export interface ConfigProductRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的包含产品列表（包含的产品类别）返回
 */
export interface ConfigProductResp {
  defaultName?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的CN编码列表（CN编码、CN名称）请求
 */
export interface ConfigCNRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  cnCode?: string;
  cnName?: string;
  countryValue?: string;
  countryFallback?: boolean;
  deduplicateCode?: boolean;
  [property: string]: any;
}

/**
 * 参数配置-产品分类的CN编码列表（CN编码、CN名称）返回
 */
export interface ConfigCNResp {
  /**
   * cn编码
   */
  defaultCode?: string;
  /**
   * cn名称
   */
  defaultName?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  effectiveCountryValue?: string;
  effectiveCountryCode?: string;
  effectiveCountryName?: string;
  /**
   * 外购前体类别名称，由后端按当前语言返回
   */
  name?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * cbam报表-产品和前驱体-前驱体列表请求
 */
export interface PrecursorRequest {
  /**
   * pageNum
   */
  pageNum: number;
  /**
   * pageSize
   */
  pageSize: number;
  /**
   * productCategoryId
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 * cbam报表-产品和前驱体-前驱体列表返回
 */
export interface PrecursorResp {
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 国家代码
   */
  countryCode?: string;
  /**
   * 使用默认值的原因枚举
   */
  defaultReason?: number | string;
  /**
   * 0;1
   */
  delFlag?: number;
  id?: number;
  /**
   * 非cbam产品的消耗量
   */
  nonProduct?: number;
  /**
   * 前驱体名称
   */
  preName?: string;
  /**
   * 关联的生产工序
   */
  processList?: Process[];
  /**
   * 排放数据
   */
  productAttributionList?: ProductAttribution[];
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  productCategoryName?: string;
  /**
   * 总购买量
   */
  purchaseVolume?: number;
  unit?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * cbam报表-结果汇总-表单更新
 */
export interface CbamResultsSummaryEditRequest {
  /**
   * 	默认值的理由枚举(1:精确测量导致的过高成本; 2:数据缺失; 3:其他),可用值:1,2,3
   */
  defaultReason?: number;
  /**
   * 数据质量一般信息枚举(1:主要是测量和分析; 2:主要是测量值和国家标准系数，例如排放系数; 3:主要是测量值和行业特定的标准系数，例如排放系数; 4:主要是测量值和国际标准系数，例如排放系数; 5:大多数默认值由欧盟委员会提供),可用值:1,2,3,4,5
   */
  generalInformation?: number;
  /**
   * 	质量保证信息枚举(1:第三方验证; 2:内部审计; 3:四眼原则; 4:无),可用值:1,2,3,4
   */
  qualityAssurance?: number;
  /**
   * cbamId
   */
  cbamId?: number;
  /**
   * id
   */
  id?: number;
}

/* -----------------------------------------new----------------------------------------- */

/**
 *  @description cbam报表-工业过程-自厂工序信息表列表请求
 *  @description cbam报表-产品数据-自厂工序产品数据列表请求
 */
export interface ProductProcessRequest {
  /**
   * cbamId
   */
  cbamId?: number;
}

/**
 *  @description cbam报表-工业过程-自厂工序信息表列表返回
 *  @description cbam报表-产品数据-自厂工序产品数据列表返回
 */
export interface ProductProcessResp {
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 电力计算配置数据
   */
  eleCalculatorList?: EleCalculator[];
  /**
   * 直接
   */
  directEmission?: number;
  /**
   * 前置工序,id,分号分隔
   */
  elseProduct?: string;
  /**
   * 前置工序名称
   */
  elseProductName?: string;
  /**
   * 工序配置状态(0:未填写排放数据; 1:已填写)
   */
  fillStatus?: number;
  id?: number;
  /**
   * 是否自动:0自动选择;1手动选择
   */
  includeType?: number;
  /**
   * 间接
   */
  indirectEmission?: number;
  nextName?: string;
  /**
   * 非cbam产品的消耗量
   */
  nonProduct?: number;
  /**
   * 上级工序id,逗号分隔
   */
  preId?: string;
  preName?: string;
  /**
   * 外购前体,id,分号分隔
   */
  preProcess?: string;
  preProcessNames?: string;
  /**
   * 关联的生产工序
   */
  processList?: Process[];
  /**
   * 工序名称
   */
  processName?: string;
  /**
   * 排放数据
   */
  productAttributionList?: ProductAttribution[];
  /**
   * 产品类别枚举
   */
  productCategoryId?: number;
  /**
   * 工序产物类别名称
   */
  productCategoryName?: string;
  productRoute?: string;
  productRouteNames?: string;
  /**
   * 销售比例
   */
  salesRatio?: number;
  /**
   * 对外销售量
   */
  salesVolume?: number;
  /**
   * 是否配置了源流,true有,false没有
   */
  sourceNum?: boolean;
  /**
   * 总
   */
  totalEmission?: number;
  /**
   * 总生产量
   */
  totalVolume?: number;
  unit?: string;
  unitName?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * 电力计算
 */
export interface ElCalcRequest {
  cbamId?: number;
  eleCalculatorList?: EleCalculator[];
  productProcessId?: number;
  [property: string]: any;
}

/**
 * EleDTO
 */
export interface EleDTO {
  /**
   * 电力系数
   */
  elePer?: number;
  /**
   * 电力使用
   */
  eleUse?: number;
  [property: string]: any;
}

/**
 * EleCalculator，电力计算器
 */
export interface EleCalculator {
  cbamId?: number;
  /**
   * 电力排放系数
   */
  coefficient?: number | null;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 电力使用值
   */
  eleValue?: number | null;
  id?: number;
  /**
   * 产品工序id
   */
  productProcessId?: number;
  [property: string]: any;
}

/**
 * Process，生产工序-消耗
 */
export interface Process {
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 排放量消耗量
   */
  emission?: number;
  id?: number;
  /**
   * 是否默认:0默认;1非默认
   */
  isDefault?: number;
  /**
   * 是否生产工序关联:0是;1否
   */
  isProcess?: number;
  processName?: string;
  /**
   * 主工序id
   */
  productProcessId?: number;
  /**
   * 关联的工序集合中的工序id,不是集合中的id
   */
  relationId?: number;
  [property: string]: any;
}

/**
 * ProductAttribution，工序归因排放量
 */
export interface ProductAttribution {
  /**
   * 报表
   */
  cbamId?: number;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 0无;1单一;2多个
   */
  eleChoose?: number;
  /**
   * 电力来源数据字典
   */
  eleSource?: string;
  /**
   * 元素枚举:1直接排放;2热力的输入输出;3尾气;4电力使用;5电力输出(1:直接排放; 2:热力的输入输出; 3:尾气/隐含排放; 4:电力使用; 5:电力输出/电力排放系数;
   * 10:NON)
   */
  emissionElement?: number;
  /**
   * 来源枚举(1:测量值; 2:默认值; 3:未知)
   */
  emissionSource?: number;
  id?: number;
  /**
   * 输入/使用排放系数;前驱的电力使用
   */
  inputFactor?: number;
  /**
   * 热力/尾气/电力输入;前驱的间接排放
   */
  inputPower?: number;
  /**
   * 是否存在:0无;1是;2不存在(0:无; 1:是; 2:否)
   */
  isExists?: number;
  /**
   * 是否生产工序关联:0是;1否
   */
  isProcess?: number;
  /**
   * 输出/回收排放系数;电力排放系数
   */
  outFactor?: number;
  /**
   * 热力/尾气/电力输出 直接排放量;前驱的直接排放
   */
  outPower?: number;
  /**
   * 生产工序id
   */
  productProcessId?: number;
  /**
   * 更新人
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}

/**
 *  @description cbam报表-工业过程-外购前体信息表表列表请求
 *  @description cbam报表-产品数据-自厂工序产品数据列表请求
 */
export interface OutsourcedPrecursorRequest {
  /**
   * cbamId
   */
  cbamId?: number;
}

/**
 *  @description cbam报表-工业过程-外购前体信息表列表返回
 *  @description cbam报表-产品数据-自厂工序产品数据列表返回
 */
export interface OutsourcedPrecursorResp {
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 国家代码枚举
   */
  countryCode?: string;
  countryName?: string;
  defaultProcessNames?: string;
  /**
   * 使用默认值的原因枚举
   */
  defaultReason?: number;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 前体配置状态(0:未填写排放数据; 1:已填写; 2:待发起供应商收数; 3:供应商填报中; 4:供应商数据待审批; 5:供应商数据收集完毕)
   */
  fillStatus?: number;
  id?: number;
  /**
   * 1手动;2供应商(1:手动填写; 2:供应商填写)
   */
  manual?: number;
  /**
   * 非cbam产品的消耗量
   */
  nonProduct?: number;
  otherProcessNames?: string;
  /**
   * 前驱体名称
   */
  preName?: string;
  /**
   * 关联的生产工序
   */
  processList?: Process[];
  /**
   * 排放数据
   */
  productAttributionList?: ProductAttribution[];
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  productCategoryName?: string;
  productRoute?: string;
  productRouteNames?: string;
  /**
   * 总购买量
   */
  purchaseVolume?: number;
  unit?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * SupplyInfo，供应商表
 */
export interface SupplyCollectionRequest {
  /**
   * applus审核状态。0 未审核；1 审核中；2 审核通过
   */
  applusAuditStatus?: number;
  /**
   * 申请人联系方式
   */
  applyMobile?: string;
  /**
   * 申请人
   */
  applyRealName?: string;
  /**
   * 申请状态。0 未填报；1 填报中；2 已填报；3 待审批；4 审批通过；5 审批不通过；6 已撤回；7 已关闭(0:未填报; 1:填报中; 2:已填报; 3:待审批;
   * 4:审批通过; 5:审批不通过; 6:已撤回; 7:已关闭)
   */
  applyStatus?: number;
  /**
   * 申请时间
   */
  applyTime?: Date;
  /**
   * 审核时间
   */
  auditTime?: Date;
  /**
   * 客户公司id
   */
  companyId?: number;
  /**
   * 客户公司名称
   */
  companyName?: string;
  /**
   * 来源国家转换值
   */
  countryName?: string;
  /**
   * 来源国家枚举值
   */
  countryValue?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 截止日期
   */
  deadline?: string;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 证据材料
   */
  evidenceFile?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 客户公司id
   */
  orgId?: number;
  /**
   * 前体名称
   */
  precursorName?: string;
  /**
   * 前体id
   */
  productPrecursorId?: number;
  /**
   * 备注
   */
  remark?: string;
  /**
   * 提交数据时间（获取时间）
   */
  submitTime?: Date;
  /**
   * 供应商企业id
   */
  supplyCompanyId?: number;
  /**
   * 供应商所属组织
   */
  supplyCompanyName?: string;
  /**
   * 供应商名称
   */
  supplyName?: string;
  /**
   * 供应商主键id
   */
  supplyOrgId?: number;
  /**
   * 证明材料
   */
  supportFile?: any;
  /**
   * 供应商企业唯一码
   */
  uniqueCode?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
  [property: string]: any;
}

/**
 * 工序/前体排序
 */
export interface OrderProcessRequest {
  /**
   * 表格类型 1:工序排序;2:前体排序
   */
  type: 1 | 2;
  /**
   * 排序id数组
   */
  idList: number[];
}

/**
 * 过程直接排放列表请求
 */
export interface ProcessEmissionRequest {
  /**
   * cbamId
   */
  cbamId?: number;
  /**
   * processMethod
   */
  processMethod?: number;
  /**
   * productProcessId
   */
  productProcessId?: number;
  [property: string]: any;
}

/**
 * 过程直接排放列表返回
 */
export interface ProcessEmissionResp {
  /**
   * 活动数据
   */
  activityData?: number;
  /**
   * 活动数据单位
   */
  activityUnit?: string;
  /**
   * 生物质含量/阳极效应过电压mv
   */
  biomassContent?: number;
  /**
   * 生物质含量单位
   */
  biomassContentUnit?: string;
  /**
   * 碳含量/收集无组织pfc排放的效率/生物质能源含量
   */
  carbon?: number;
  /**
   * 过电压放电系数
   */
  carbonBiological?: number;
  /**
   * 阳极效应过电压%
   */
  carbonFossil?: number;
  /**
   * 碳含量单位
   */
  carbonUnit?: string;
  cbamId?: number;
  /**
   * 转换系数/斜率排放系数/平均烟气流量
   */
  conversionRate?: number;
  /**
   * 碳氧化率单位/转换系数单位 %
   */
  conversionRateUnit?: string;
  /**
   * 0;1
   */
  delFlag?: number;
  /**
   * 排放系数/阳极效应的平均持续时间/周期内运作时长
   */
  emissionCoefficient?: number;
  /**
   * 排放系数单位
   */
  emissionCoefficientUnit?: string;
  /**
   * 排放量化石
   */
  energyFossil?: number;
  id?: number;
  /**
   * 低位发热量/阳极效应的频率/平均每小时排放浓度
   */
  lowHeat?: number;
  /**
   * 低位发热量单位
   */
  lowHeatUnit?: string;
  /**
   * 碳氧化率/六氟化二碳质量分数/化石能源含量
   */
  oxRate?: number;
  /**
   * 方法枚举:1燃烧;;2工艺;3物料平衡;4斜率法;5超压法;6;7(1:燃烧; 2:工艺排放; 3:物料平衡; 4:斜率法; 5:超压法)
   */
  processMethod?: number;
  /**
   * 工序id
   */
  productProcessId?: number;
  /**
   * 排放源名称
   */
  sourceName?: string;
  /**
   * 排放类型:1源流;2pfc;3排放源(1:源流排放; 2:PFC排放; 3:排放源排放)
   */
  sourceType?: number;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * 热点联产返回
 */
export interface HeatPowerResp {
  cbamId?: number;
  /**
   * 热电联产:电力输出
   */
  eleOut?: number;
  /**
   * 热电联产:电力生产效率
   */
  elePer?: number;
  /**
   * 热电联产:燃料输入
   */
  fuelIn?: number;
  /**
   * 热电联产:燃料输出
   */
  fuelOut?: number;
  /**
   * 热电联产:热力输出
   */
  hotOut?: number;
  /**
   * 热电联产:热力生产效率
   */
  hotPer?: number;
  id?: number;
  /**
   * 输入/使用排放系数;前驱的电力使用;热电使用电力排放系数
   */
  inputFactor?: number;
  /**
   * 输出/回收排放系数;电力排放系数;热电输出电力排放系数
   */
  outFactor?: number;
  /**
   * 热力/尾气/电力输出 直接排放量;前驱的直接排放;热电使用热力排放系数
   */
  outPower?: number;
  /**
   * 工序id
   */
  productProcessId?: number;
  /**
   * 热电联产:烟气净化排放
   */
  smokeOut?: number;
  [property: string]: any;
}

/**
 * 外售产品信息列表请求
 */
export interface SaleProductRequest {
  /**
   * cbamId
   */
  cbamId?: number;
}

/**
 * SaleProduct，外售产品信息
 */
export interface SaleProductResp {
  /**
   * 其他合金比例
   */
  alloyPer?: number;
  /**
   * 每吨铝使用废铝
   */
  alUse?: number;
  /**
   * 铵态氮占比
   */
  ammonium?: number;
  /**
   * 是否煅烧:0是;1否
   */
  calcine?: number;
  cbamId?: number;
  /**
   * 熟料
   */
  clinker?: number;
  /**
   * cn分类
   */
  cnCode?: string;
  cnName?: string;
  cper?: number;
  /**
   * 铬比例
   */
  crPer?: number;
  delFlag?: number;
  /**
   * 排放强度
   */
  emission?: number;
  /**
   * 1配置中;2已完成(1:配置中; 2:已完成)
   */
  fillStatus?: number;
  id?: number;
  /**
   * 其他材料占比
   */
  materialPer?: number;
  /**
   * 锰比例
   */
  mnPer?: number;
  /**
   * 镍比例
   */
  niPer?: number;
  /**
   * 硝酸比例
   */
  nitric?: number;
  /**
   * 氮元素
   */
  nitrogen?: number;
  /**
   * 非铝元素占比
   */
  nonAl?: number;
  /**
   * 硝酸盐占比
   */
  noPer?: number;
  /**
   * 有机占比
   */
  organic?: number;
  /**
   * 工序
   */
  processId?: number;
  processName?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 前体的主要还原剂
   */
  reducing?: number;
  /**
   * 含水溶液浓度
   */
  solution?: number;
  /**
   * 钢厂标识号
   */
  steelCode?: string;
  /**
   * 每吨使用废钢
   */
  steelScrap?: number;
  /**
   * 尿素
   */
  urea?: number;
  /**
   * 尿素占比
   */
  urPer?: number;
  /**
   * 消费前废料占比
   */
  wasteMaterial?: number;
  [property: string]: any;
}

/**
 * DefaultSale，外购商品配置
 */
export interface DefaultSale {
  /**
   * 字段名称
   */
  defaultName?: string;
  /**
   * 字段英文名
   */
  defaultNameEn?: string;
  delFlag?: number;
  id?: number;
  /**
   * 是否必填:0必填;1非必填
   */
  isRequired?: number;
  /**
   * 0展示;1不展示
   */
  isShow?: number;
  /**
   * 关联字段
   */
  link?: string;
  /**
   * 产品分类id
   */
  productCategoryId?: number;
  [property: string]: any;
}

/**
 *  碳税计算请求
 */
export interface CarbonTaxRequest {
  /**
   * cbamId
   */
  cbamId?: number;
}

/**
 *  碳税计算返回
 */
export interface CarbonTaxResp {
  cbamId?: number;
  reportSelected?: number;
  productNameSnapshot?: string;
  productName?: string;
  cnCode?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  productOutput?: number;
  seeg?: number;
  emissionValueType?: number;
  emissionSourceType?: number;
  emissionSourceSaleProductId?: number;
  emissionSourceDefaultCnId?: number;
  emissionSourceYear?: number;
  productBenchmarkId?: number;
  productBenchmarkType?: number;
  productBenchmarkValue?: number;
  productRouteCode?: string;
  productRouteIndicator?: string;
  precursorBenchmarkTotal?: number;
  cbamAdjustmentFactor?: number;
  cscfy?: number;
  sefa?: number;
  certificatePriceEur?: number;
  exchangeRate?: number;
  /**
   * 已支付碳价（币种/tCO2e）
   */
  paidCarbonPrice?: number;
  supportFile?: string;
  formulaVersion?: string;
  calculatedAt?: string;
  dataVersion?: string;
  precursorList?: CarbonTaxPrecursor[];
  /**
   * 货币类型
   */
  currencyType?: string;
  /**
   * 货币名称
   */
  currencyTypeName?: string;
  delFlag?: number;
  /**
   * 排放强度
   */
  emission?: string | number;
  /**
   * 碳税覆盖的排放占比
   */
  emissionPer?: number;
  id?: number;
  /**
   * 折抵方式
   */
  offsetMethod?: number;
  /**
   * 折抵比例
   */
  offsetPer?: number;
  /**
   * 折抵价格（币种/t）
   */
  offsetPrice?: number;
  /**
   * 需缴纳碳税（预估，币种/t）
   */
  payTax?: number;
  /**
   * 外售产品id
   */
  saleProductId?: number;
  saleProductName?: string;
  /**
   * 碳税类型
   */
  taxType?: number;
  /**
   * 碳税价格
   */
  taxValue?: number;
  [property: string]: any;
}

export interface CarbonTaxPrecursor {
  id?: number;
  saleTaxId?: number;
  sourceKind?: number;
  sourceId?: number;
  precursorNameSnapshot?: string;
  cnCode?: string;
  defaultCnId?: number;
  cnName?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  totalConsumption?: number;
  unitConsumption?: number;
  benchmarkId?: number;
  benchmarkType?: number;
  benchmarkValue?: number;
  productionRouteCode?: string;
  productionRouteIndicator?: string;
  benchmarkContribution?: number;
  orderNum?: number;
}

export interface CarbonTaxProductOption {
  saleProductId: number;
  processId?: number;
  productCategoryId?: number;
  productCategoryName?: string;
  productName?: string;
  cnCode?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  processName?: string;
  productOutput?: number;
  currentEmission?: number;
}

export interface CarbonTaxEmissionOption {
  sourceType: number;
  saleProductId?: number;
  defaultCnId?: number;
  year?: number;
  label?: string;
  reportName?: string;
  productName?: string;
  cnCode?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  emissionValue?: number;
}

export interface CarbonTaxPrecursorOption {
  sourceKind: number;
  sourceId: number;
  sourceTypeName?: string;
  precursorName?: string;
  cnCode?: string;
  defaultCnId?: number;
  cnName?: string;
  countryValue?: string;
  countryCode?: string;
  countryName?: string;
  productCategoryId?: number;
  productCategoryName?: string;
  totalConsumption?: number;
  unitConsumption?: number;
  benchmarkType?: number;
}

export interface CnBenchmarkOption {
  id: number;
  cnCode?: string;
  cnDescription?: string;
  bmgStar?: number;
  bmg?: number;
  productionRouteCode?: string;
  productionRouteIndicator?: string;
  sourceRow?: number;
}

export interface CnBenchmarkSearchRequest {
  pageNum: number;
  pageSize: number;
  productCategoryId?: number;
  cnCode?: string;
}

/**
 * 数据质量及其他
 */
export interface DataQualityResp {
  /**
   * 碳价解释
   */
  carbonPrice?: string;
  /**
   * 报表id
   */
  cbamId?: number;
  /**
   * 默认值的理由枚举(1:精确测量导致的过高成本; 2:数据缺失; 3:其他)
   */
  defaultReason?: number;
  delFlag?: number;
  /**
   * 数据质量一般信息枚举(1:主要是测量和分析; 2:主要是测量值和国家标准系数，例如排放系数; 3:主要是测量值和行业特定的标准系数，例如排放系数;
   * 4:主要是测量值和国际标准系数，例如排放系数; 5:大多数默认值由欧盟委员会提供)
   */
  generalInformation?: number;
  id?: number;
  productCategoryName?: string;
  /**
   * 质量保证信息枚举(1:第三方验证; 2:内部审计; 3:四眼原则; 4:无)
   */
  qualityAssurance?: number;
  /**
   * 其他补充
   */
  supplement?: string;
  unit?: string;
  updateBy?: number;
  updateTime?: Date;
  [property: string]: any;
}

/**
 * 旭日图
 */
export interface ResultsSummarySunburstRequest {
  /**
   * productProcessId
   */
  productProcessId?: number;
  /**
   * type
   */
  type?: number;
  [property: string]: any;
}

/**
 * 旭日图
 */
export interface SunDTO {
  child?: SunDTO[];
  /**
   * 间接排放受影响的
   */
  inputPower?: number;
  /**
   * 0直接;1间接
   */
  isDefault?: number;
  /**
   * 0工序;1前体
   */
  isProcess?: number;
  /**
   * 排放受影响的
   */
  outPower?: number;
  /**
   * 百分比
   */
  per?: number;
  processId?: number;
  processName?: string;
  unitName?: string;
  [property: string]: any;
}

/**
 * Top10 TOP10预估需净缴纳碳税产品
 */
export interface SaleTaxResultDTO {
  /**
   * 活动数据单位
   */
  activityUnit?: string;
  /**
   * 货币单位
   */
  currencyTypeName?: string;
  /**
   * 折抵价格
   */
  offsetPrice?: number;
  /**
   * 需缴纳碳税
   */
  payTax?: number;
  productName?: string;
  [property: string]: any;
}

/**
 * EdgeResultDTO
 */
export interface EdgeResultDTO {
  edges?: EdgeDTO[];
  nodes?: NodeDTO[];
  [property: string]: any;
}

/**
 * EdgeDTO
 */
export interface EdgeDTO {
  source?: string;
  target?: string;
  [property: string]: any;
}

/**
 * NodeDTO
 */
export interface NodeDTO {
  id?: string;
  isProcess?: number;
  label?: string;
  [property: string]: any;
}
