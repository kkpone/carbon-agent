/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-09 16:32:44
 */
import { FetchPage } from '@src/components/TableUtil/types/util';

/** 获取列表的接口返回 */
export interface ApiGetLntegralRecordData {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountLntegralRecordTable[];
    total: number;
  };
}

/** 碳账户-碳币记录 */
export interface CarbonAccountLntegralRecordTable {
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

export interface CarbonAccountActiveDataGetParams extends FetchPage {
  // userId: number; // 用户ID
  likeRealName?: string; // 用户姓名
  sceneId?: number; // 场景id
  begTime?: string;
  endTime?: string;
  likeSceneName?: string;
  thirdId?: string;
}
