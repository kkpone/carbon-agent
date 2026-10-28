export interface Config {
  BASENAME?: string;

  SUCCESS_CODE: number;

  LOGIN_EXPIRE: number;

  API_URL: string;

  TOKEN_KEY: string;

  layout: 'side' | 'top';

  theme: 'light' | 'dark';

  fixedHeader: boolean;

  contentWidth: 'fluid' | 'fixed';

  colorWeak: boolean;

  title: string;

  logo?: string;
}

const AdminConfig: Config = {
  // react-router basename
  BASENAME: process.env.PUBLIC_URL || '',

  // 请求成功状态码
  SUCCESS_CODE: 200,

  // 登录过期，或者未登录
  LOGIN_EXPIRE: 400,

  // 统一请求地址
  API_URL: 'http://192.168.1.189:8001/api/v1/',

  // 本地存储token 的key
  TOKEN_KEY: 'Admin_Token_key',

  // 默认菜单栏位置
  layout: 'side',

  // 默认主题颜色
  theme: 'light',

  // 是否固定头部
  fixedHeader: true,

  // 固定宽度或者流式宽度
  contentWidth: 'fixed',

  // 是否开启色弱模式
  colorWeak: false,

  // 项目名称
  title: '碳足迹基础模块',

  // logo
};

export default AdminConfig;

export const SUPPLY_LOGIN_IDENTIFIER = 'supplyTicket';

export const SUPPLY_REGISTER_MOBILE_IDENTIFIER = 'mobile';

export const SUPPLY_TO_TASK = 'toTask';

export const TENCENT_MAP_KEY = 'NGRBZ-O7433-4DQ3B-RTAGH-4CJZ2-F6FUO';
// 接口返回的code码
export const REPONSE_CODE = {
  /** 请求成功状态码 */
  SUCCESS_CODE: 200,
  /** 请求成功，同时需要toast提示 */
  SUCCESS_TOAST: 3100,
  /** 登录过期，或者未登录 */
  LOGIN_EXPIRE: 401,
  /** 登录过期，或者未登录 */
  LOGIN_EXPIRE_ONE: 600,
  /** 默认密码，需要修改 */
  CHANGE_PWD_CODE: 20001,
};
