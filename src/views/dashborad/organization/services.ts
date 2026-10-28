import apiPath from '@api/config';
import { request } from '@api/request';
import { BackendRes } from '@src/api/types';

interface CompanyResponse {
  id: number;
  companyId: number;
  companyName: string;
  status: number;
  delflag: number;
  companyNum: string;
  companyInfo: null | any;
  industry: string;
  type: null | any;
  scale: string;
  area: string;
  linkmanPhone: string;
  linkmanName: string;
  linkmanEmail: string;
  postcode: string;
  detailedAddr: string;
  companyPic: null | any;
  ucType: null | any;
  principal: string;
  landline: string;
  createTime: null;
}

// 获取组织信息
export function apiQueryByCompanyId(params: {
  id: number;
}): BackendRes<CompanyResponse> {
  return request({
    method: 'GET',
    url: `${apiPath()}/company/queryByCompanyId`,
    params,
  });
}
// 编辑 公司

// 上传公司图片

export enum OrgType {
  /** 企业 */
  company = 1,
  /** 分组 */
  group = 2,
  /** 核算主体 */
  accounting = 3,
}
export interface OrgInfo {
  /** 组织主键id */
  code: number;
  /** 组织名称 */
  name: string;
  /** 父 id */
  pcode: number;
  /** 组织类型。1 企业 2 分组 3  */
  orgType: OrgType;
  children: Array<OrgInfo>;
  updateBy: number;
  updateTime: string;
  updateByName: string;
  /** 组织编码 */
  orgCode: string;
  level: number;
  key: React.Key;
  depth?: number;
  orgIndustry?: string;
  label: string;
  value: string;
  id: number;
}

/**
 * 获取组织树
 */
export function getOrgTree(params: { userId: number }) {
  return request<{ data: { tree: OrgInfo[] } }>({
    method: 'GET',
    url: `/management/companyOrg/tree`,
    params,
  });
}

/**
 * 获取组织树
 */
export function getFrameOrgTree(params: { userId: number }) {
  return request<{ data: OrgInfo[] }>({
    method: 'GET',
    url: `/esg/frame/frame/orgTree`,
    params,
  });
}

export interface User {
  employEmail: string;
  employName: string;
  employPhone: string;
  id: number;
  nickName: string;
  userId: number;
  userInfo: string;
  userName: string;
}

export async function getUserList() {
  const result = await request<{ code: number; msg: string; data: User[] }>({
    method: 'get',
    url: `/management/user/queryAllCompanyUser?userKey=`,
  });
  return result.data;
}

export const AddCompanyOrg = data =>
  request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/companyOrg/add`,
    data,
  });

interface CompanyInfo {
  id: number;
  createBy: number;
  updateBy: number;
  createTime: string;
  updateTime: string;
  companyId: number;
  orgName: string;
  orgCode: string;
  orgInfo: string;
  pid: number;
  superiorsShares: string;
  orgType: number;
  orgIndustry: string;
  orgClassify: string;
  orgArea: string;
  linkmanUserid: number;
  addrDetail: string;
  deleted: boolean;
  orgScale: string;
}
export const getCompanyOrgInfo = params =>
  request<{ code: number; msg: string; data: CompanyInfo }>({
    method: 'get',
    url: `/management/companyOrg/info`,
    params,
  });

export const editCompanyOrg = data =>
  request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/companyOrg/edit`,
    data,
  });

export const editCompanyOrgCompany = data =>
  request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/companyOrg/editCompany`,
    data,
  });

export const deleteOrg = (data: { id: number }) =>
  request<{ code: number; msg: string }>({
    method: 'post',
    url: `/management/companyOrg/delete`,
    data,
  });
