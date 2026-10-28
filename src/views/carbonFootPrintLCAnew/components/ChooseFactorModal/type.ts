export interface Request {
  /**
   * 因子名称
   */
  likeName?: string;
  /**
   * 产品名称
   */
  likeProductName?: string;
  /**
   * 页码
   */
  pageNum: number;
  /**
   * 每页条数
   */
  pageSize: number;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 状态。0 启用 1 禁用,可用值:0,1
   */
  status?: number;
  [property: string]: any;
}
/**
 * 选择因子
 */
export interface Factor {
  /**
   * 地理代表性
   */
  areaRepresent?: string;
  /**
   * 地理代表性-详细地址
   */
  areaRepresentDetail?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 标记删除。0 未删除 1 已删除
   */
  deleted?: boolean;
  /**
   * 场景描述
   */
  description?: string;
  /**
   * 二氧化碳当量数值
   */
  factorValue?: string;
  /**
   * 一级分类（简体中文）
   */
  firstClassify?: string;
  /**
   * 气体列表
   */
  gasList?: FactorGasRes[];
  /**
   * id
   */
  id?: number;
  /**
   * 发布机构(全称)-字典
   */
  institution?: string;
  /**
   * 数据类型: 1 过程数据; 2 因子(1:过程数据; 2:因子)
   */
  dataType?: number;

  /**
   * 排放因子名称
   */
  name?: string;
  /**
   * 产品信息
   */
  productInfo?: string;
  /**
   * 产品名称
   */
  productName?: string;
  /**
   * 二级分类（简体中文）
   */
  secondClassify?: string;
  /**
   * 来源文件名称
   */
  source?: string;
  /**
   * 源语言。字典值 1中文 2英语 3法语 4德语
   */
  sourceLanguage?: string;
  /**
   * 源语言名称
   */
  sourceLanguageName?: string;
  /**
   * 来源类别-字典
   */
  sourceLevel?: string;
  /**
   * 0 启用 1 禁用(0:启用; 1:禁用),可用值:0,1
   */
  status?: number;
  /**
   * 系统边界
   */
  systemBoundary?: string;
  /**
   * 技术代表性
   */
  techRepresent?: string;
  /**
   * 单位
   */
  unit?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新者名称
   */
  updateByName?: string;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 网址/文献
   */
  url?: string;
  /**
   * 发布年份
   */
  year?: string;

  [property: string]: any;
}

export interface FactorGasRes {
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建时间
   */
  createTime?: Date;
  /**
   * 排放因子ID
   */
  factorId?: number;
  /**
   * 因子单位-分母
   */
  factorUnitM?: string;
  /**
   * 因子单位-分子
   */
  factorUnitZ?: string;
  /**
   * 因子数值
   */
  factorValue?: string;
  /**
   * 温室气体-氢氟烷、全氟碳水合物需要字典
   */
  gas?: string;
  /**
   * 温室气体类型
   */
  gasType?: string;
  /**
   * id
   */
  id?: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: Date;
}
