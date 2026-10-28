import { FetchPage } from '@src/components/TableUtil/types/util';

import { CarbonAccountUserListFindUserTable } from './detail/type';

/** 获取碳币列表的接口返回 */
export interface ApiGetUserSceneList {
  code: number;
  msg: string;
  data: {
    rows: CarbonAccountUserListFindUserTable[];
    total: number;
  };
}

export type UsersSearchParams = {
  realName?: string; // 用户姓名
  userStatus?: number; // 用户状态
  /** 手机号 */
  mobile?: string;
  /** 所属分组 */
  orgIds?: string[];
  /** 员工编号 */
  jobNumber?: string;
  page?: number;
  size?: number;
  sortKey?: string;
  sortOrderBy?: string;
};

/** 用户碳币列表接口参数*/
export interface CarbonAccountUserSceneListGetParams extends FetchPage {
  userId?: number; // 用户Id
}

/** 对应用户详情的接口 */
export interface ApiGetUserListItem {
  id: number; // 场景id
  companyId: number; // 组织id
  thirdId: string; // 三方用户id
  realName: string; // 用户姓名
  orgId: number; // 部门id
  mobile: string; // 手机号码
  avatarUrl: string; // 头像
  totalScore: number; // 累计碳币
  currScore: number; // 当前碳币
  totalReduction: number; // 累计减碳量
  userStatus: number; // 用户状态。0 正常 -1 黑名单
  createBy: number;
  updateBy: number;
  createTime: string;
  updateTime: string;
  /** 员工编号 */
  jobNumber: string;
  /** 所属分组 */
  orgName: string;
}

/** 跳转用户详情的路由携带参数 */
export interface UserListItemDetailLoaction {
  id: number; // 当前的用户ID
}

export interface UserListAddUser {
  thirdId: string; // 三方用户id
  realName: string; // 用户姓名
  mobile: string; // 手机号码
}

export interface UserListEditUser {
  id: number; // 场景id
  thirdId: string; // 三方用户id
  realName: string; // 用户姓名
  mobile: string; // 手机号码
}

export interface UserListBlackListUser {
  id: number; // 场景id
  userStatus: 0 | -1; // 用户状态
}

export interface UserListImportFile {
  path: string; // 错误的文件路径
  total: number; // 总数
  errorCount: number; // 错误的条数
}
