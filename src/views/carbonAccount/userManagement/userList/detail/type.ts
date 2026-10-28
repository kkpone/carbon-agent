/** 碳账户-用户列表-表格列表默认显示数据 */
export interface CarbonAccountUserListFindUserTable {
  behaviorId: number; // 用户行为Id
  cers: number; // 变动后碳减排量
  changeCers: number; // 变动碳减排量
  changeScore: number; // 变动碳币
  changeTime: string; // 变动时间
  companyId: number; // 组织ID
  createBy: string; // 创建者
  createTime: string; // 创建时间
  id: number;
  orderNo: string; // 订单编号
  realName: string; // 用户姓名
  remark: string; // 备注
  sceneId: number; // 场景id
  sceneName: string; // 场景名称
  score: number; // 变动后碳币
  scoreType: 1 | 2; // 碳币类型 1 活动获取 2 兑换消耗
  updateBy: string; // 更新者
  updateTime: string; // 更新时间
  userId: number; // 用户Id
}

/** 用户信息数据 */
export interface FindUserDetail {
  label: string;
  value: string | number;
}
