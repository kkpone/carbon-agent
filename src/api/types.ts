/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-29 11:14:54
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 19:07:09
 */
import { AxiosPromise, AxiosRequestConfig } from 'axios';

import { CompanyType } from '@/views/system/login/component/Login';

export type JavaPagePayload = {
  pageNum: number;
  pageSize: number;
};
export type JavaPageResponse<Rows> = {
  code: number;
  msg: string;
  rows: Rows[];
  total: number;
  queryKey?: string;
};

export type JavaPageResponseRowInData<Row> = BackendResponse<{
  rows: Row[];
  total: number;
}>;

export type RequestOptions = AxiosRequestConfig & {
  debounced?: boolean;
  silentResponseError?: boolean;
};

/**
 * @file 全局共用ts response 类型
 */
export interface BackendResponse<T> {
  code: number;
  data: T;
  msg: string;
  status?: string;
}

export type BackendRes<T> = AxiosPromise<AxiosResponse<T>>;

export type AxiosResponse<T> = {
  code: number;
  data: T;
  msg: string;
  status: string;
};

// java 图片上传返回类型
export type UploadImgResponse = BackendResponse<{ name: string; url: string }>;

export interface QuideList {
  id: number;
  guideId: number;
  guideName: string;
  isFloat: number;
  type: string;
  status: number;
  orderNum: number;
  updateBy: null | string;
  updateTime: Date;
  delFlag: number;
  page: number;
  size: number;
  sort: null | any;
  categoryList: CategoryList[];
}

export interface CategoryList {
  id: number;
  guideId: number;
  categoryId: string;
  categoryName: string;
  orderNum: number;
  delFlag: number;
  page: number;
  size: number;
  sort: null | any;
  guideProductList: GuideProductList[];
  isFloat?: number;
}

export interface GuideProductList {
  id: number;
  guideId: number;
  productId: string;
  productName: string;
  categoryId: string;
  categoryName: string;
  status: null | any;
  orderNum: number;
  delFlag: number;
  auth: string;
  page: number;
  size: number;
  sort: null | any;
  isFloat?: number;
}

// 基础版类型
export interface ProductPermisions {
  userInfo: UserInfo;
}
// 用户信息
export interface SwitchoverCompanyData {
  access_token: string;
  userInfo: UserInfo;
  expires_in: number;
  companyId?: number | null;
  productId?: string | null;
  haveCompany?: boolean;
}

export enum ECompanyType {
  'normal' = '1',
  'lite' = '2',
}
export interface UserInfo {
  token: string;
  userId: number;
  username: string;
  password: null | string;
  loginTime: number;
  expireTime: number;
  ipaddr: string;
  email?: string;
  mobile: string;
  permissionSet: PermissionSet[];
  permissions: string[];
  roles: string[];
  productMsg?: string;
  user: User;
  companyId?: number;
  companyName: null | string;
  permissionStatus: boolean;
  companyVoList: CompanyVoList[];
  productType: number;
  openProductCount: number;
  residueDay: number;
  companyProductList: {
    productId: string | number;
    productName: string;
    createTime: string;
    expireTime: string;
  }[];
  nickName?: string;
  companyType?: CompanyType;
}

export interface User {
  id?: null | string;
  userName: string;
  userId: number;
  password: string;
  email: null;
  delflag: number;
  status: number;
  salt?: any;
  nickName?: string;
  companyId: null | number | string;
  departmentId: null | number | string;
  sex: null | number | string;
  udId: null | number | string;
  updateUser: string;
  updateTime: Date;
  createTime: null | number | string;
  employName: null | number | string;
  employPhone: null | number | string;
  count: null | number | string;
  permissionSet: null | PermissionSet[];
  permissions: null | any;
  roleIds: null | number | string;
  roles: null | any;
  type: null | number | string;
  admin: boolean;
}

interface CompanyVoList {
  id: null;
  companyId: number;
  companyName: string;
  status: number;
  delflag: number;
  companyNum: string;
  companyInfo: null;
  industry: null;
  type: null;
  scale: null;
  area: null;
  linkmanPhone: null;
  linkmanName: null;
  linkmanEmail: null;
  postcode: null;
  detailedAddr: null;
  companyPic: null;
  ucType: null;
  principal: null;
  landline: null;
  createTime: null;
  userId: null;
  username: null;
  page: number;
  size: number;
  sort: null;
  ucStatus: number;
  beginTime: null;
  endTime: null;
  masterName: null;
}

export interface PermissionSet {
  id: number;
  permissionName: string;
  permissionId: number;
  delflag: number;
  perms: string;
  parentId: number;
  type: Type;
  orderNum: number;
  createTime: Date | null;
  status: string;
  path: string;
  component: any;
  query: any;
  isFrame: number;
  isCache: number;
  visible: string;
  icon: string;
  createBy: string | null;
  updateBy: string | null;
  updateTime: any;
  remark: string;
  auth: any;
  firstStage: number;
  base: number;
  apiPath: any;
}
export type PermissionTree = PermissionSet & {
  children: PermissionTree[];
};
enum Type {
  B = 'B',
  C = 'C',
  F = 'F',
  M = 'M',
  P = 'P',
}

export interface Citys {
  code: string;
  name: string;
  children?: DatumChild[];
}

interface DatumChild {
  code: string;
  name: string;
  children?: ChildChild[];
}

interface ChildChild {
  code: string;
  name: string;
}

export type DataPermissionsPayload = {
  pageNum: number;
  pageSize: number;
};

export interface Companys {
  id: number;
  companyId: number;
  companyName: string;
  status: number;
  delflag: number;
  companyNum: string;
  companyInfo: null | any;
  industry: string;
  type: string;
  scale: string;
  area: string;
  linkmanPhone: null | string;
  linkmanName: null | string;
  linkmanEmail: null | string;
  postcode: null | string;
  detailedAddr: null | string;
  companyPic: null | any;
  ucType: null | any;
  principal: null | string;
  landline: null | string;
  createTime: null | any;
  userId: null | any;
  username: null | any;
  page: number;
  size: number;
  sort: null | any;
  ucStatus: number;
  beginTime: null | any;
  endTime: null | any;
  masterName: null | any;
  counts: null | any;
  ucDelflag: number;
  productType: number;
  openProductCount: number;
  residueDay: number;
  companyProductList: {
    productId: string | number;
    productName: string;
    createTime: string;
    expireTime: string;
  }[];
}

export interface NoticeRedDot {
  unReadCounts: number;
  messageCounts: number;
  noticeCounts: number;
  userId: number;
}

export interface SaasNotices {
  publishTime: string;
  publish: string;
  showType: string;
  startTime: string;
  endTime: string;
  id: number;
  type: string;
  title: string;
  content: string;
}

export interface BroadcastDetailData {
  publishTime: string;
  publish: string;
  showType: string;
  id: number;
  type: string;
  title: string;
  content: string;
}

export type ListNotice = Omit<BroadcastDetailData, 'content' | 'showType'> & {
  readStatus: string;
  companyId: number;
};

export type NoticesCenter = {
  /** 0 未读 1 已读 */
  readStatus: string;
  publishTimeStr: string;
} & Omit<BroadcastDetailData, 'content'>;
