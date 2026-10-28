/**
 * 选择CBAM数据请求参数
 */
export interface ChooseCbamRequest {
  /**
   * cbamName
   */
  cbamName?: string;
  /**
   * pageNum
   */
  pageNum?: number;
  /**
   * pageSize
   */
  pageSize?: number;
  /**
   * productName
   */
  productName?: string;
  [property: string]: any;
}

/**
 * CBAM数据返回
 */
export interface CbamProductInfo {
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
   * 是否煅烧:1是;2否(0:无; 1:是; 2:否)
   */
  calcine?: number;
  /**
   * 当前计算版本:版本0的时候刚新增的,未计算过(0:未计算; 1:计算中; 2:计算完成; 3:版本不一致)
   */
  calVersion?: number;
  cbamId?: number;
  cbamName?: string;
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
  /**
   * 货币单位关联值
   */
  currType?: string;
  defaultPer?: number;
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
   * 隐含排放总
   */
  inputAll?: number;
  /**
   * 间接排放
   */
  inputPower?: number;
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
   * 直接排放
   */
  outPower?: number;
  payTax?: number;
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
   * 前体的主要还原剂(1:煤或焦炭; 2:天然气; 3:沼气; 4:氢气)
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
   * 活动数据单位
   */
  unit?: string;
  /**
   * 活动数据单位
   */
  unitName?: string;
  /**
   * 编辑版本:版本是0的时候,未配置
   */
  updateVersion?: number;
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
