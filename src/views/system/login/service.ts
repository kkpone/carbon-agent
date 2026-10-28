import { parseMonitorJson } from '@src/views/system/carbonAgent/monitor/json';
import { BackendRes, SwitchoverCompanyData } from '@src/api/types';
import { encrypt } from '@src/utils';

import { UserStatus } from '@/views/carbonFootprint3/FootprintAccount/AccountDetail/AccountInfo/type';

import { request } from '../../../api/request';

// 发送
export function apiSendSMS(params: {
  number: string;
  areaCode?: string;
  lang?: string;
}): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'get',
    url: '/auth/token/sendSMS',
    params,
  });
}

// 发送邮箱验证码
export function apiSendEmailSMS(params: {
  number: string;
  lang?: string;
}): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'get',
    url: '/auth/token/sendEmail',
    params,
  });
}

// 校验验证码
export enum LoginType {
  phone = '1',
  email = '2',
}

/** 登录客户端类型 */
export enum LoginClientType {
  carbonWeb = 'CARBON_WEB',
  carbonH5 = 'CARBON_H5',
  agentWeb = 'AGENT_WEB',
  agentH5 = 'AGENT_H5',
}

type LoginClientContext = {
  browserId: string;
  clientType: LoginClientType;
};

export type LoginRequestData = {
  username: string;
  agentChannel?: string;
  agentInviteCode?: string;
  browserId?: string;
  password?: string | null;
  identify?: string | null;
  areaCode?: string | null;
  lang?: string;
  supplyTicket?: string;
  /** URL 带 code 参数时传入 */
  thirdCode?: string;
  // 1 手机号登陆 2 邮箱登录
  loginType?: LoginType;
  // 1 组织客户 2 个人客户 3 agent
  companyType?: '1' | '2' | '3';
  productSource?: '1' | '2';
  channelSource?: string;
  clientType?: LoginClientType;
};

// 登录
export function apiLogin(
  data: LoginRequestData & LoginClientContext,
): BackendRes<SwitchoverCompanyData> {
  // console.log(data);
  return request({
    method: 'post',
    url: '/auth/token/login',
    data: { requestData: encrypt(JSON.stringify(data)) },
  });
}

// agent H5 登录
export function apiAgentH5Login(
  data: LoginRequestData & LoginClientContext,
): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'post',
    url: '/auth/token/agentH5Login',
    data: { requestData: encrypt(JSON.stringify(data)) },
  });
}

// Agent Web 登录，服务端负责记录认证结果并绑定 browserId
export function apiAgentWebLogin(
  data: LoginRequestData & LoginClientContext,
): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'post',
    url: '/auth/token/agentWebLogin',
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
    data: { requestData: encrypt(JSON.stringify(data)) },
  });
}

/** 第三方 code 换 token 登录（如 URL 带 code 参数时调用） */
export function apiLoginStep(data: {
  channelSource: string;
  thirdCode: string;
  agentInviteCode?: string;
}): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'post',
    url: '/auth/token/loginStep',
    data,
  });
}

// 忘记密码
export function editUser(data: {
  username?: string;
  oldPassword?: string | null;
  newPassword?: string | null;
  identify: string | null;
  nickName?: string | null;
  id?: string | null;
  type?: string | number;
  lang?: string;
}): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'post',
    url: '/auth/token/editUser',
    data: { requestData: encrypt(JSON.stringify(data)) },
  });
}

// 登录页忘记密码
export function editUserForgot(data: {
  username?: string;
  areaCode?: string | null;
  lang?: string;
  loginType: LoginType;
  identify: string;
  newPassword: string;
}): BackendRes<SwitchoverCompanyData> {
  return request({
    method: 'post',
    url: '/auth/token/editUserForgot',
    data: { requestData: encrypt(JSON.stringify(data)) },
  });
}

// 忘记密码

// 注册

interface MobileLoginiData {
  mobile?: string;
  phonenumber?: string;
  sourceType?: string;
}

// 新增用户线索（other 官网，saas）
export function apiAddClew(data: MobileLoginiData) {
  return request({
    method: 'POST',
    url: '/management/system/clew/add/other',
    data,
  });
}

/**
 * 切换语言
 * @param params
 * @returns
 */
export function switchLanguage(params: { lang: 'en' | 'zh' | 'zt' }) {
  return request({
    method: 'get',
    url: '/management/system/language/switchLanguage',
    params,
  });
}

export function switchLanguageByTicket(params: {
  lang: 'en' | 'zh' | 'zt';
  ticket: string;
}) {
  return request({
    method: 'get',
    url: '/management/system/language/switchLanguageByTicket',
    params,
  });
}
/**
 * 获取当前系统所使用的语言
 * @returns
 */
export async function getLanguage() {
  const { data } = await request<{ data: { lang: 'en' | 'zh' | 'zt' } }>({
    method: 'get',
    url: '/management/system/language/languageQuery',
  });
  return data.data;
}

export async function getLanguageByTicket(params: { ticket: string }) {
  const { data } = await request<{ data: { lang: 'en' | 'zh' | 'zt' } }>({
    method: 'get',
    url: '/management/system/language/languageQueryByTicket',
    params,
  });
  return data.data;
}

/** 获取所有的区号 */
export async function getAreaCode(params: { lang: 'en' | 'zh' | 'zt' }) {
  const { data } = await request<{
    data: { areaContent: string; areaCode: string }[];
  }>({
    method: 'get',
    url: '/management/system/language/languageAreaCodeQuery',
    params,
  });
  return data.data;
}

export enum SwitchState {
  show = '1',
  hide = '0',
}

export const getShowLanguageSwitch = () =>
  request<{
    data: {
      multi_switch: SwitchState;
    };
  }>({
    method: 'get',
    url: '/management/system/language/multiSwitch',
  });

/**
 * 获取微信登录二维码
 */
export function apiGetWechatQRCode(
  params: LoginClientContext & {
    agentChannel?: string;
    agentInviteCode?: string;
    lang?: string;
    env_version?: string;
    productSource?: string;
    companyType?: string;
    channelSource?: string;
    /** URL 带 code 参数时传入 */
    thirdCode?: string;
  },
  signal?: AbortSignal,
): BackendRes<{
  qrCode: string;
  scene: string;
  qrUrl: string;
}> {
  return request({
    method: 'get',
    url: '/auth/api/login/qrcode',
    params,
    signal,
  });
}

/**
 * 检查微信登录状态
 */
export function apiCheckWechatLogin(params: { scene: string }): BackendRes<{
  loginStatus: string;
  token: SwitchoverCompanyData;
}> {
  return request({
    method: 'get',
    url: '/auth/token/auth/checkLogin',
    transformResponse: [
      (value: unknown) =>
        typeof value === 'string' ? parseMonitorJson(value) : value,
    ],
    params,
  });
}

/**
 * 绑定数据接口
 */
export function apiBindData(params: { accountId: number }): BackendRes<{
  accountId: number;
  /** 用户状态：1 正常用户 2 试用用户到期 3 试用用户正常 4 试用用户已建模 */
  userStatus: UserStatus;
}> {
  return request({
    method: 'post',
    url: '/footprint3/account/bindData',
    data: params,
  });
}
