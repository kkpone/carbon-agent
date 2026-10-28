/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2022-08-31 21:24:01
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2022-12-08 17:26:14
 */
import { Moment } from 'moment';

/** 获取列表的接口返回 */
export interface ApiGetActiveData {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountActiveDataTable[];
    total: number;
  };
}
/** 碳账户-用户列表-表格列表默认显示数据 */
export interface CarbonAccountActiveDataTable {
  behaviorStatus: 0 | 1; // 活动状态。0 正常 1 碳币撤销,可用值:0,1
  changeValue: number; // 变动值
  companyId: number; // 组织ID
  createBy: string; // 创建者
  createTime: string; // 创建时间
  dataStatus: 0 | 1 | -1; // 数据状态 0初始化 1处理完成 -1处理失败
  id: number; // id
  periodType: 1 | 2 | 3 | 4; // 周期类型 1 日 2 周 3 月 4 年
  rate: number; // 减碳系数
  realName: string; // 用户姓名
  sceneId: string; // 场景id
  sceneName: string; // 场景名称
  sceneType: 0 | 1 | 2; // 场景类型: 0默认 1小任务 2自定义
  sceneUnit: string; // 单位
  scoreFlag: 0 | 1; // 是否产生碳币 0 否 1是
  thirdId: string; // 用户Id 第三方
  unitScore: number; // 单位活动碳币
  updateBy: string; // 更新者
  updateTime: string; // 更新时间
  userId: string; // 用户id
}

/** 活动数据列表的详情 */
export interface CarbonAccountActiveDataItemDetail {
  id: number;
  companyId: number;
  userId: number;
  sceneId: number;
  sceneName: string;
  sceneType: number;
  sceneType_name: string;
  rate: number;
  unitScore: number;
  sceneUnit: string;
  sceneUnitName: string;
  periodType: number;
  periodType_name: string;
  changeValue: string;
  behaviorTime: string;
  dataStatus: number;
  dataStatus_name: string;
  checkUrl: string[];
  behaviorStatus: number;
  behaviorStatus_name: string;
  cancelMsg: string;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  thirdId?: string;
  realName?: string;
}

/** 活动数据记录 */
export type ActivityRecordSearchParams = {
  likeRealName?: string; // 用户姓名
  likeSceneName?: string; // 场景名称
  orgIds?: string[];
  behaviorStatus?: '0' | '1';
  time?: Moment[];
  begTime?: string;
  endTime?: string;
};
export interface ActiveImportFile {
  failPath: string; // 错误的文件路径
  totalCount: number; // 总数
  errorCount: number; // 错误的条数
}
/** 撤销活动数据碳币 */
export interface CarbonAccountActiveRollback {
  id: number; // id
  reason?: string; // 撤销原因
}
