export type SelectModelMenu = {
  code: string;
  name: string;
  codeArr: string;
};

export type SelectModelListParams = {
  pageNum: number;
  pageSize: number;
  modelName?: string;
  industry?: string;
  type?: number;
};

export interface SelectModelListData {
  /**
   * 功能单位
   */
  accountName: string;
  /**
   * 核算状态：0创建核算，1核算建模，2完成核算
   */
  accountStatus?: number;
  /**
   * 核算数量
   */
  amount: string;
  /**
   * 组织ID
   */
  companyId?: number;
  /**
   * 创建人
   */
  createBy?: number;
  /**
   * 创建时间/核算时间
   */
  createTime?: string;
  /**
   * 0正常,1删除
   */
  delFlag?: number;
  /**
   * 排放量
   */
  emissionTotal?: number;
  /**
   * 碳排放强度
   */
  factor?: string;
  /**
   * 碳排放强度
   */
  factorUnit?: string;
  /**
   * id
   */
  id: number;
  /**
   * 行业标识
   */
  industry: string;
  /**
   * 导入状态：1-导入中
   */
  inStatus?: number;
  /**
   * 模型简介
   */
  intro?: string;
  /**
   * 模型名称
   */
  modelName: string;
  /**
   * 评价范围:0-半生命周期;1-全生命周期;2-自定义.
   */
  scope: number;
  /**
   * 评价范围自定义值用,拼接
   */
  scopeValue?: string;
  /**
   * 来源:0-boss,1-组织
   * CARBONSTOP :CARBONSTOP
   * CUSTOM :CUSTOM
   */
  source?: string;
  /**
   * 状态：0禁用,1启用
   */
  state?: number;
  /**
   * 核算类型：0快速，1过程
   */
  type: number;
  /**
   * 单位标识
   */
  unitCode: string;
  /**
   * 单位名称
   */
  unitName: string;
  /**
   * 更新人
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
  /**
   * 规格型号
   */
  specification?: string;
}
