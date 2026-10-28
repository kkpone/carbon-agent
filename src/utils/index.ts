/*
 * @@description:全局utils
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-11-01 16:09:37
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-04-20 17:52:30
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { apiQuideList, logout_send, switchoverCompany } from '@src/api/api';
import {
  CategoryList,
  GuideProductList,
  PermissionSet,
  PermissionTree,
  SwitchoverCompanyData,
} from '@src/api/types';
import {
  CARBON_AGENT_PROJECT_INVITE_QUERY_KEY,
  RouteMaps,
} from '@src/router/route-paths';
import { RouteMapsCorbonFootprint3 } from '@src/router/route-paths/corbonFootprint3';
import store from '@src/store';
import { CLEAR, SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { clearSideBarRoutes } from '@src/store/module/app';
import { GRT_NAV } from '@src/store/module/nav';
import { CompanyUserInfoAction } from '@src/store/module/user';
import { Dictionary } from '@src/typings';
import { isInviteLogin } from '@src/views/becomeSupplierOrPurchasing/utils/commonActions';
import { FormProps } from 'antd';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { AxiosResponse } from 'axios';
import CryptoJS from 'crypto-js';
import { saveAs } from 'file-saver';
import { jsonrepair } from 'jsonrepair';
import { compact, isArray, omit, sortBy } from 'lodash-es';
import MobileDetect from 'mobile-detect';
import { customAlphabet } from 'nanoid';
import forge from 'node-forge';
import { ReactNode, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Dispatch } from 'redux';

import { request } from '@/api/request';
import {
  stripLocalePrefixFromPathname,
  withCurrentLocalePrefix,
} from '@/router/localePath';
import { PageTypeInfo } from '@/router/utils/enums';
import { LCARouteMaps } from '@/router/utils/lcaEnums';
import { SccmRouteMaps } from '@/router/utils/sccmEnums';
import { RouterHistory } from '@/types';
import { ProductSource } from '@/views/system/login/component/Login';

import { Toast } from './Toast';
import { clearFeishuSession, isFeishuSession } from './feishuSession';
import { COMPANY_ID } from './consts';
import I18N from '../lang/I18N';

export { ClipboardCopyError, copyToClipboard } from './clipboard';

export const AUTH_LOGOUT_EVENT = 'carbon-cloud-auth-logout';

const isCarbonAgentPage = () =>
  typeof window !== 'undefined' &&
  stripLocalePrefixFromPathname(window.location.pathname)
    .toLowerCase()
    .startsWith(RouteMaps.carbonAgent.toLowerCase());

export type Dicts = {
  dictLabel: string;
  dictValue: string;
  sourceType: string;
  dictSort: number;
  id: null;
  sourceName: null | string;
  relatedValue: null | string;
  dictType: string;
};

/** antd form 滚动到第一个错误处，参数 */
export const antFormSrcoll2FirstErrorConfig: FormProps['scrollToFirstError'] = {
  behavior: 'smooth',
  inline: 'center',
  block: 'center',
};

/** 移除对象中的 空值 '' null undefined  */
export const shakingObj = <T = Record<string, any>, Result = Required<T>>(
  obj: T,
): Result => {
  const o = {} as Result;
  // @ts-ignore
  Object.keys(obj).forEach(key => {
    if (obj[key] || typeof obj[key] === 'boolean' || obj[key] === 0)
      o[key] = obj[key];
  });
  return o;
};

/**
 * @description 详情保存时移除更新时间、创建人等只读字段
 */
export const omitInfoFn = (data: Record<string, any>) =>
  omit(data, [
    'updateByName',
    'updateTime',
    'updateBy',
    'createByName',
    'createTime',
    'createBy',
  ]);

/** 将数字输入限制在指定区间，并按要求保留小数位。 */
export const returnInputNumberLimitFormatValue = ({
  value,
  min,
  max,
  precision,
}: {
  value?: string | number;
  min: number;
  max: number;
  precision: number;
}) => {
  if (!value) return value;

  const stringValue = String(value);
  const decimalStart = stringValue.indexOf('.') + 1;
  const decimalCount = stringValue.length - decimalStart;
  const inputValue = Number(value);

  if (Number.isNaN(inputValue)) return value;

  if (decimalStart > 0 && decimalCount > precision) {
    return inputValue > max
      ? max
      : Math.round(inputValue * 10 ** precision) / 10 ** precision;
  }

  if (inputValue < min) return min;
  if (inputValue > max) return max;

  return inputValue;
};

/**
  清空object 的key
 */
export const clearObject = (obj: { [key: string]: any }) => {
  // eslint-disable-next-line no-restricted-syntax
  for (const k in obj) {
    if (obj[k] instanceof Object) {
      clearObject(obj[k]);
    } else {
      obj[k] = undefined;
    }
  }
};

export const genFormData = (obj: Dictionary<any>) => {
  const fd = new FormData();
  const keys = Object.keys(obj);
  keys.forEach(key => {
    if (obj[key]) fd.append(key, obj[key]);
  });
  return fd;
};

export const combineClassName = (...classNames: (string | undefined)[]) =>
  compact(classNames).join(' ');

/**
 * 处理数字的保留位数
 * @param num 要处理的数字
 * @param fixNum 保留的小数位数
 */
export const sliceNumberEnd = (num: string | number, fixNum?: number) =>
  (+num || 0).toFixed(fixNum ?? 2);

export const fixTableText = (str?: ReactNode, emptyShow?: ReactNode) =>
  str === 0 || str ? str : emptyShow || '-';
// @ts-ignore
export const fixTableColumnsText = <T = any>(columns: ColumnsType<T>) =>
  columns.map(column => ({
    ...column,

    render: (text: string, record: T, index: number) =>
      column?.render
        ? column.render(fixTableText(text), record, index)
        : fixTableText(text),
  }));

/**
 * 转换图片的 base64 到 blob
 */
const base64ToBlob = (data: string) => {
  const rImageType = /data:(image\/.+);base64,/;
  let mimeString = '';
  let raw;
  let uInt8Array;
  let i;

  raw = data.replace(rImageType, (header, imageType: string) => {
    mimeString = imageType;

    return '';
  });

  raw = atob(raw);
  const rawLength = raw?.length;
  uInt8Array = new Uint8Array(rawLength); // eslint-disable-line

  for (i = 0; i < rawLength; i += 1) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: mimeString });
};

// 将图片转为file
export const cutFile = (
  file: File,
  options?: { width: number; height: number },
): Promise<null | File> => {
  let sizeRate = 1;
  if (options) {
    sizeRate = options.width / options.height;
  }
  const img = document.createElement('img');
  const url = window.URL.createObjectURL(file);
  img.src = url;
  img.crossOrigin = 'anonymous';
  return new Promise(r => {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    img.onload = () => {
      if (!ctx) {
        r(null);
        return;
      }
      const { width } = img;
      cvs.width = width;
      cvs.height = width / sizeRate;
      ctx.drawImage(img, 0, 0, cvs.width, cvs.height);

      const nameArr = url.split('/');
      const name = nameArr[nameArr.length - 1]?.includes('.')
        ? nameArr[nameArr.length - 1]
        : '1.jpg';

      const base64Data = cvs.toDataURL('image/jpg', 0.9);
      const blob = base64ToBlob(base64Data);
      r(blob && new File([blob], name, { type: 'image/jpg' }));
    };
  });
};

// 脱敏手机号
// 手机号校验
export const checkSubmit = (val: string) => {
  const regTel =
    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
  return regTel.test(val);
};

export const checkPhone = checkSubmit;

// 邮箱校验
export const checkEmail = (val: string) => {
  const regTel = /^([a-zA-Z]|[0-9])(\w|-|\.)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
  return regTel.test(val);
};

const mapProductChildren = (item: GuideProductList[]) => {
  if (item.length > 0) {
    return item.map(ite => ({
      id: ite.productId,
      name: ite.productName,
      isFloat: ite.isFloat,
      web_path: '',
    }));
  }
  return item;
};
// 遍历children
export const mapChildren = (item: CategoryList[]) => {
  if (item.length > 0) {
    return item.map(ite => ({
      id: ite.id,
      name: ite.categoryName,
      isFloat: ite.isFloat,
      web_path: '',
      children: mapProductChildren(ite?.guideProductList || []),
    }));
  }
  return item;
};

export const md5 = (str: string): string => {
  const md = forge.md.md5.create();
  md.update(str);
  return md.digest().toHex();
};

const keyStr = 'carbon@stp2060ja';
const AESKey = CryptoJS.enc.Utf8.parse(keyStr);
const AESOptions = {
  mode: CryptoJS.mode.ECB,
  padding: CryptoJS.pad.Pkcs7,
};

/**
 * @description 数据加密 aes
 * 接口数据加密后 key 统一为 requestData
 */
export const encrypt = (msg: string): string => {
  const srcs = CryptoJS.enc.Utf8.parse(msg);
  const result = CryptoJS.AES.encrypt(srcs, AESKey, AESOptions);
  const base64 = CryptoJS.enc.Base64;
  return result.ciphertext.toString(base64);
};

/**
 * @description 解密
 */
export const deCrypt = <T = string>(msg: string): T => {
  const de = CryptoJS.AES.decrypt(msg, AESKey, AESOptions);

  // eslint-disable-next-line
  // @ts-ignore
  return CryptoJS.enc.Utf8.stringify(de);
};

/**
 * @description 判断推出登录
 */
export const logout = (option?: { jumpToLoginPage?: boolean }) => {
  if (isFeishuSession()) {
    // 等退出请求完成再清理当前飞书凭证；不清除官网登录信息。
    logout_send().then(clearFeishuSession, clearFeishuSession);
    return;
  }
  logout_send();
  localStorage.clear();
  sessionStorage.clear();
  store.dispatch(clearSideBarRoutes());
  store.dispatch({ type: CLEAR });
  window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT));

  const jumpToLoginPage = option?.jumpToLoginPage ?? true;

  if (isCarbonAgentPage()) {
    const inviteCode = new URLSearchParams(window.location.search).get(
      CARBON_AGENT_PROJECT_INVITE_QUERY_KEY,
    );
    const carbonAgentPath = withCurrentLocalePrefix(RouteMaps.carbonAgent);
    const inviteSearch = inviteCode
      ? `?${new URLSearchParams({
          [CARBON_AGENT_PROJECT_INVITE_QUERY_KEY]: inviteCode,
        }).toString()}`
      : '';

    window.location.replace(`${carbonAgentPath}${inviteSearch}`);
    return;
  }

  if (!jumpToLoginPage) {
    return;
  }

  /** 用来判断是否是从供应链跳转过来的 @author wangjiahui */
  isInviteLogin();

  window.location.href = withCurrentLocalePrefix(RouteMaps.login);
};

export const logoHref = 'logoHref';

export const useCheckHomeRouterChange = () => {
  const pathName = stripLocalePrefixFromPathname(window?.location?.pathname);
  useEffect(() => {
    if (pathName !== RouteMaps.login) {
      sessionStorage.setItem(
        logoHref,
        pathName === RouteMaps.account
          ? RouteMaps.account
          : RouteMaps.workIndex,
      );
    } else {
      sessionStorage.setItem(logoHref, '');
    }
  });
};

/**
 * @description 获取用户信息
 */
export const getUserInfo = (): SwitchoverCompanyData | undefined =>
  store.getState().companyUserInfo;

/**
 * @description 生成UUID
 */
export const uuid = () => {
  const s: string[] = []; // 修复：使用类型注解代替尖括号断言
  const hexDigits = '0123456789abcdef';
  for (let i = 0; i <= 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = '4'; // bits 12-15 of the time_hi_and_version field to 0010
  // eslint-disable-next-line no-bitwise
  s[19] = hexDigits.substr((Number.parseInt(s[19], 16) & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  // eslint-disable-next-line no-multi-assign
  s[8] = s[13] = s[18] = s[23] = '-';

  const uuid = s.join('');
  return uuid;
};
export const generatePerssionTree = (
  permissions: PermissionSet[],
  key = 'permissionId',
) => {
  let res: PermissionTree[] = [];
  let children: PermissionTree[] = [];
  const idMap: { [key: string]: PermissionTree } = {};
  permissions.forEach(p => {
    const newPermission = { ...p, children: [] };
    idMap[p[key]] = newPermission;
    if (p.parentId === 0) {
      res = [...res, newPermission];
    } else {
      children = [...children, newPermission];
    }
  });
  res = sortBy(res, 'orderNum');
  children.forEach(p => {
    const target = idMap[p.parentId];
    if (target) {
      target.children = sortBy([...target.children, p], 'orderNum');
    }
  });
  return res;
};
/**
 * @description column ellipsis
 */
export const addEllipsisToColumn = <T>(
  columns: ColumnType<T>[],
  dealFn?: (c: ColumnType<T>) => boolean,
): ColumnType<T>[] =>
  columns.map(c => ({ ...c, ellipsis: dealFn?.(c) ?? true }));

type RedirectFnProps = {
  addSearch?: { [k: string]: string | number };
  fallBackFn: () => void;
};
const REDIRECT_URL = 'redirectUrl';

/**
 * @description 处理重定向问题
 */
// eslint-disable-next-line consistent-return
export const redirectFn = ({ addSearch, fallBackFn }: RedirectFnProps) => {
  const search = new URLSearchParams(window.location.search);
  let redirectUrl = search.get(REDIRECT_URL);
  const redirectArr = redirectUrl?.split('?');
  const redirectSearch = redirectArr?.[1] || '';

  if (redirectArr?.length) {
    // eslint-disable-next-line prefer-destructuring
    redirectUrl = redirectArr[0];
  }
  if (!redirectUrl) return fallBackFn();
  const newSearch = new URLSearchParams(redirectSearch);
  // 添加额外的search参数
  if (addSearch) {
    Object.entries(addSearch).forEach(([k, v]) => {
      newSearch.set(k, `${v}`);
    });
  }
  // 添加现有的search

  // eslint-disable-next-line
  for (const k of search.keys()) {
    // eslint-disable-next-line no-continue
    if (k === REDIRECT_URL) continue;
    newSearch.set(k, search.get(k) || '');
  }
  redirectUrl = `${redirectUrl}?${newSearch.toString()}`;

  window.location.href = redirectUrl;
};

/**
 * @description 对象数组去重
 */
// eslint-disable-next-line consistent-return
export const removeRepeat = (arr: any, key: string) => {
  const map: Map<string, number> = new Map();
  if (isArray(arr)) {
    arr.forEach(item => {
      if (!map.has(item[key])) {
        map.set(item[key], item);
      }
    });
    return Array.from(map.values());
  }
};
/**
 * @description url参数转对象
 */
export const querystringToObject = <T = any>(): T => {
  let s = '';
  try {
    s = decodeURIComponent(window.location.search);
  } catch {
    return {} as unknown as T;
  }
  return Object.fromEntries(new URLSearchParams(s).entries()) as unknown as T;
};
/**
 * @description 向url拼接参数
 */
function updateQueryStringParameter(key: string, value: string | number) {
  const uri = window.location.href;
  if (typeof value === 'undefined') {
    return uri;
  }
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  let result = '';
  if (uri.match(re)) {
    result = uri.replace(re, `$1${key}=${value || ''}$2`);
  } else {
    result = `${uri}${separator}${key}=${value}`;
  }
  return result;
}

export function updateUrl(
  key: string | Record<string, any>,
  value?: string | number,
) {
  // CBAM was originally implemented with the Router v6 object-style URL
  // updater. Preserve the existing scalar API while supporting that contract.
  if (typeof key === 'object') {
    lcaUpdateUrl(key, true);
    return;
  }
  const newUrl = updateQueryStringParameter(key, value);
  // 向当前url添加参数，没有历史记录
  window.history.replaceState(
    {
      path: newUrl,
    },
    '',
    newUrl,
  );
}

/**
 *
 * @param obj search 参数
 * @param keepOldSearch  是否保留原有的search字段 default FALSE 不保留
 */
export function lcaUpdateUrl(
  obj?: Record<string, any>,
  keepOldSearch?: boolean,
) {
  const { search, pathname, hash } = window.location;
  let searchObj = new URLSearchParams(search);
  // 默认保留原有的search
  if (!obj || !keepOldSearch) searchObj = new URLSearchParams();
  Object.keys(obj || {}).forEach(key => {
    const value = obj?.[key] || '';
    if (typeof value === 'string' || typeof value === 'number')
      searchObj.set(key, `${value}`);
    else searchObj.set(key, JSON.stringify(value));
  });

  /* kiwi-disable-next-line */
  const searchStr = searchObj.toString() ? `?${searchObj.toString()}` : '';
  const newUrl = pathname + searchStr + hash;
  // 向当前url添加参数，没有历史记录
  window.history.replaceState(
    Object.fromEntries(searchObj.entries()),
    '',
    newUrl,
  );
}

// 根据惟一 将对象映射成数组
export const objToArr = ({ arr, keyArr }) => {
  const map = new Map();
  // eslint-disable-next-line no-restricted-syntax
  for (const item of arr) {
    if (!map.has(`${item[keyArr[0]]}-${item[keyArr[1]]}`)) {
      item.list = [
        {
          ...item,
        },
      ];
      map.set(`${item[keyArr[0]]}-${item[keyArr[1]]}`, item);
    } else {
      const arr = map.get(`${item[keyArr[0]]}-${item[keyArr[1]]}`).list;
      const newArr = Array.from(new Set([...arr, { ...item }])).sort(
        (a, b) => a.indicatorMonth - b.indicatorMonth,
      );
      item.list = newArr;
      map.set(`${item[keyArr[0]]}-${item[keyArr[1]]}`, item);
    }
  }
  const valueArr = [...map.values()];
  return [...valueArr];
};

// 获取 echerts 最大公约数

// 获取echarts  多Y轴的最大值和间隔值 lcmval 最大公约数   divisor 间隔数量

export const ceilNumber = (number: number) => {
  let bite = 0;
  if (number < 10) {
    return 10;
  }
  while (number >= 10) {
    number /= 10;
    bite += 1;
  }
  return Math.ceil(number) * 10 ** bite;
};

export const setUrlSearchParams = (key: string, value: string) => {
  const originUrlSearchParams = new URLSearchParams(location.search);
  originUrlSearchParams.delete(key);
  const originUrlSearchParamsString = originUrlSearchParams.toString();
  window.history.replaceState(
    null,
    '',
    originUrlSearchParamsString
      ? `?${originUrlSearchParamsString}&${key}=${value}`
      : `?${key}=${value}`,
  );
};

export const deleteUrlSearchParams = (key: string) => {
  const originUrlSearchParams = new URLSearchParams(location.search);
  originUrlSearchParams.delete(key);
  const originUrlSearchParamsString = originUrlSearchParams.toString();
  window.history.replaceState(
    null,
    '',
    originUrlSearchParamsString ? `?${originUrlSearchParamsString}` : '',
  );
};

/** 同 eval，使用eval 会有 eslint 报错，尽量不要用
 * @deprecated 能不使用就不要使用
 */
const evil = fn => {
  const Fn = Function;
  return new Fn(`return ${fn}`)();
};
/**
 * @description: 修改url参数
 * @param {string} key 参数名
 * @param {string} value 参数值
 * @deprecated 尽量使用 urlsearchParams 代替
 */
export const replaceParamVal = (
  key: string,
  value: string | number,
  url?: string,
) => {
  const oUrl = url || window.location.href.toString();
  const re = evil(`/(${key}=)([^&]*)/gi`);
  const nUrl = oUrl.replace(re, `${key}=${value}`);
  return nUrl;
};

export function sleep(ms: number): Promise<void> {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

/**
 * @description 选择企业，用的组织列表页面切换组织的逻辑
 * */
export const switchCompany = async (options: {
  companyId: string;
  history?: ReturnType<typeof useHistory>;
  jumpToHome?: boolean;
  userId?: string | number;
  dispatch: Dispatch<any>;
}) => {
  const {
    dispatch,
    history,
    companyId,
    userId: paramsUserId,
    jumpToHome = true,
  } = options;
  const userId = paramsUserId || getUserInfo()?.userInfo.userId;

  const switchCompanyResp = await switchoverCompany({
    companyId,
    userId: userId || '',
  });

  localStorage.setItem(COMPANY_ID, companyId);
  const userData = switchCompanyResp.data.data;
  if (userData) {
    dispatch<CompanyUserInfoAction>({
      type: SET_COMPANY_USER_INFO,
      payload: userData,
    });

    const apiGuideResp = await apiQuideList();
    dispatch({
      type: GRT_NAV,
      payload: apiGuideResp.data.data.map(item => ({
        id: item.id,
        name: item.guideName,
        isFloat: `${item.isFloat}`,
        web_path: '',
        children: mapChildren(item?.categoryList || []),
        checkid: item.id,
      })),
    });

    if (jumpToHome && history) {
      setTimeout(() => {
        history.push(RouteMaps.workIndex);
      }, 300);
    }
  }
};

export const nanoid = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  10,
);

export const jsonp: <T = any>(
  url: string,
  data: string | { [P: string]: string },
) => Promise<T> = (url, data) => {
  if (!url) {
    throw new Error('url is necessary');
  }

  const callback = `CALLBACK${Math.random().toString().substr(9, 18)}`;
  const JSONP = document.createElement('script');
  JSONP.setAttribute('type', 'text/javascript');

  const headEle = document.getElementsByTagName('head')[0];

  let ret = '';
  if (data) {
    if (typeof data === 'string') {
      ret = `&${data}`;
    } else if (typeof data === 'object') {
      Object.keys(data).forEach(key => {
        ret += `&${key}=${data[key]}`;
      });
    }
    ret += `&_time=${Date.now()}`;
  }
  JSONP.src = `${url}?callback=${callback}${ret}`;

  return new Promise(resolve => {
    window[callback] = r => {
      resolve(r);
      headEle.removeChild(JSONP);
      delete window[callback];
    };
    headEle.appendChild(JSONP);
  });
};

const returnNoIconModalStyle = {
  className: 'modal_del',
  centered: true,
  closable: true,
} as const;
const returnDelModalStyle = {
  okType: 'primary',
  // okButtonProps: {
  //   style: { background: '#ED5555', color: '#fff' },
  // },
  closable: true,
  okText: I18N.base.confirm,
  cancelText: I18N.Factors.cancel,
} as const;

export const modalText = 'modal_text' as const;

/** 弹窗底部按钮样式 */
export const modelFooterBtnStyle = {
  ...returnDelModalStyle,
  ...returnNoIconModalStyle,
  // okButtonProps: {
  //   style: {
  //     background: '#0CBF9F',
  //     color: '#fff',
  //   },
  // },
};

/** 发布年份 */
export const publishYear = (start?: number, end?: number) => {
  const startT = start ?? 1990;
  const endT = end ?? new Date().getFullYear();
  let result = [startT];
  while (result[result.length - 1] < endT) {
    result = result.concat(result[result.length - 1] + 1);
  }
  return result.reverse();
};

export { Toast };

/** 下载文件 */
export const downloadFile = (url: string, name?: string) => {
  Toast('success', '开始下载');
  saveAs(url, name);
};

/** 语言类型 */
export const LANG_TYPE = {
  /** 中文 */
  ZH: 1,
  /** 英文 */
  EN: 2,
};

const { ZH, EN } = LANG_TYPE;

/** 语言对应的字段后缀 */
const LANG_SUFFIX = {
  [ZH]: 'Zh',
  [EN]: 'En',
};

/** 接口返回来的languageSourceList类型 */
export interface ApiLanguageSourceList {
  id: number;
  langType: number;
  langType_name: string;
  sourceType: number;
  sourceType_name: string;
  sourceValue: string;
}

/** 处理多语言字段方法的参数 */
interface HandleLangFieldsProps {
  /** 原始数据 */
  rawData: { [key: string]: any };
  /** 语言 */
  langType: number | number[];
  /** 基准字段sourceType对照值 传进来是防止不同模块字段名一样*/
  sourceTypeMapping: { [key: string]: any };
  /** 接口返回来的languageSourceList */
  apiLanguageSourceList?: ApiLanguageSourceList[];
}

/**
 * @description 处理多语言字段-保存
 * @param rawData 原始数据
 * @param langType 语言
 * @param sourceTypeMapping 基准字段sourceType对照值 传进来是防止不同模块字段名一样
 * @param apiLanguageSourceList 接口返回来的languageSourceList
 * @returns 处理后的languageSourceList
 */
export const handleLangFields = ({
  rawData,
  langType,
  sourceTypeMapping,
  apiLanguageSourceList,
}: HandleLangFieldsProps) => {
  const langTypes = Array.isArray(langType) ? langType : [langType];

  const languageSourceList = langTypes?.flatMap(currentLangType => {
    /** 需要处理的语言对应的字段后缀名 */
    const langSuffix = LANG_SUFFIX?.[currentLangType] || 'En';

    /** 需要处理的语言字段名数组 */
    const langFieldsArr = Object.keys(rawData)?.filter(key =>
      key.endsWith(langSuffix),
    );

    /** 过滤需要的语言languageSourceList */
    const currentApiLanguageSourceList = apiLanguageSourceList?.filter(
      list => list.langType === currentLangType,
    );

    /** 对应的id-详情返回有id */
    const idArr = currentApiLanguageSourceList?.reduce(
      (arr: { [key: number]: number }, current) => {
        arr[current.sourceType] = current?.id;
        return arr;
      },
      {},
    );

    return langFieldsArr?.map(key => {
      /** 基准字段名 */
      const baseKey = key?.replace(langSuffix, '');
      /** sourceType值 */
      const sourceType = sourceTypeMapping?.[baseKey] as number;
      return {
        langType: currentLangType,
        sourceType,
        sourceValue: rawData?.[key],
        id: idArr?.[sourceType],
      };
    });
  });

  return languageSourceList;
};

/**
 * @description 反处理多语言字段-生成对象
 * @param languageSourceList 接口返回来的languageSourceList
 * @returns 处理后的对象
 */
export const reverseHandleLangFields = (
  languageSourceList: ApiLanguageSourceList[],
) => {
  if (Array.isArray(languageSourceList)) {
    return languageSourceList?.reduce((acc, current) => {
      const langSuffix = LANG_SUFFIX?.[current.langType] || 'En';
      const fieldName = `${current.sourceType_name}${langSuffix}`;
      acc[fieldName] = current.sourceValue;
      return acc;
    }, {} as { [key: string]: string });
  }
  return {};
};

/**
 * 表格 --- 如果返回值为空则设置文本表格显示对应传递过来的newText
 * @param val 当前返回的替换内容
 * @param newText 显示替换的文本内容
 */
const noValueBackText = (val: string | number, newText: string): string => {
  if (val || val === 0) {
    return `${val}`;
  }
  return newText || '-';
};

/**
 * 处理表格中没有render，并且没有数据的时候的展示
 * @param columns 当前的表头
 * @param text 传入为空的文案,默认是'-'
 * @returns 返回最新的表头
 */
export const changeTableColumnsNoText = <T>(
  columns: {
    children?: ColumnsType & { children?: ColumnsType[]; title: string }[];
    render?: () => JSX.Element;
  } & ColumnsType<T>,
  text: string,
) =>
  columns.map(colum => {
    if (colum.title === I18N.Factors.operation) {
      colum!.fixed = 'right';
    }
    if (!colum.render) {
      colum.render = (value: string | number) =>
        noValueBackText(value, text || '-');
    }
    colum!.ellipsis = true;
    return colum;
  });

/** 获取URL中的search字段 */
export const getSearchParams = <SearchParams = Record<string, string>>() => {
  const search = new URLSearchParams(window.location.search);
  const result = Object.fromEntries(search.entries()) as SearchParams;

  return [result, search] as const;
};

export type AssessmentMapOptions = {
  label: string | number;
  value: string | number;
  unit?: string | null;
  children?: AssessmentMapOptions[];
};
type AssessmentMap = {
  [k: string]: AssessmentMapOptions;
};
/** 处理评价方法 */
export const handleAssessmentProposalOptions = (
  assessmentProposal: Dicts[],
) => {
  const assessmentMap: AssessmentMap = {};
  assessmentProposal.forEach(val => {
    if (val.sourceType && assessmentMap[val.sourceType]) {
      assessmentMap[val.sourceType].children = assessmentMap[
        val.sourceType
      ].children?.concat?.([
        {
          label: val.dictLabel,
          value: `${val.sourceType},${val.dictValue}`,
          unit: val.relatedValue,
        },
      ]);
    } else if (val.sourceType) {
      assessmentMap[val.sourceType] = {
        label: val.sourceName || val.sourceType,
        value: val.sourceType,
        children: [
          {
            label: val.dictLabel,
            value: `${val.sourceType},${val.dictValue}`,
            unit: val.relatedValue,
          },
        ],
      };
    }
  });
  return compact(Object.values(assessmentMap)).flat();
};

/**
 * @description 转换成科学记数法
 * @param value 原始值
 * @param needHandleDecimal 不满足科学记数法是否需要走有效位数的逻辑
 * @returns 处理后的值 string
 */
export const formatScientific = (
  value?: number | string,
  needHandleDecimal = false,
) => {
  if (value === 0 || value === '0') return '0';

  if (!value) return '-';

  /** 符号 */
  const sign = Number(value) < 0 ? '-' : '';

  const absValue = Math.abs(Number(value));
  const needsScientific =
    absValue >= 100000 || (absValue < 0.0001 && absValue > 0);

  /** 需要科学记数法 */
  if (needsScientific) {
    const exponent = Math.floor(Math.log10(absValue));
    const mantissa = (absValue / 10 ** exponent).toFixed(2);
    return `${sign}${mantissa}E${exponent}`;
  }

  /** 不符合科学记数法规则时需要处理有效位数 */
  if (needHandleDecimal) {
    const [integerPart, decimalPart] = value.toString().split('.');

    /** 当整数部分大于等于1或小于等于-1时，保留两位小数 */
    if (Number(integerPart) >= 1 || Number(integerPart) <= -1) {
      return Number(value).toFixed(2);
    }

    /** 当大于-1小于0或大于0小于1时，从第一位非0小数开始保留后续共三位小数，末尾四舍五入 */
    // 处理整数部分为 0 的情况
    if (decimalPart) {
      /** 有效小数 */
      let significantDecimals = '';

      // 查找第一位非 0 小数的位置
      const nonZeroIndex = decimalPart?.search(/[^0]/);

      if (nonZeroIndex !== -1) {
        /** 从第一位非 0 小数开始截取四位位，并进行四舍五入 */
        // eslint-disable-next-line prefer-destructuring
        significantDecimals =
          (
            Math.round(
              Number(
                `0.${decimalPart?.slice(nonZeroIndex, nonZeroIndex + 4)}`,
              ) * 1000,
            ) / 1000
          )
            .toString()
            .split('.')[1] || '';

        /** 确保保留三位有效小数 不够补充0 */
        if (significantDecimals && significantDecimals?.length < 3) {
          significantDecimals = significantDecimals?.padEnd(3, '0');
        }

        /** 无效0 */
        const zeroString = decimalPart.slice(0, nonZeroIndex);

        return `${sign}0.${zeroString}${significantDecimals}`;
      }

      return value.toString();
    }
  }

  return value.toString();
};

type Options = {
  label: string | number;
  value: string | number;
  children?: Options[];
};

type FactorUnitMTransformMap = {
  [k: string]: Options;
};

/** 分母单位转换成联级数据结构 */
export const changeFactorM2cascaderOptions = (factorUnitM: Dicts[]) => {
  const factorMap: FactorUnitMTransformMap = {};
  factorUnitM.forEach(val => {
    if (val.sourceType && factorMap[val.sourceType]) {
      // @ts-ignore
      factorMap[val.sourceType].children = factorMap[
        val.sourceType
      ].children?.concat?.([
        { label: val.dictLabel, value: val.dictValue, children: [] },
      ]);
    } else if (val.sourceType) {
      factorMap[val.sourceType] = {
        label: val.sourceName || val.sourceType,
        value: val.sourceType,
        children: [
          {
            label: val.dictLabel,
            value: val.dictValue,
          },
        ],
      };
    }
  });
  return compact(Object.values(factorMap)).flat();
};

/** 年份 默认1990-今年 */
export const getYear = (start?: number, end?: number) => {
  const startT = start ?? 1990;
  const endT = end ?? new Date().getFullYear();
  let result = [startT];
  while (result[result.length - 1] < endT) {
    result = result.concat(result[result.length - 1] + 1);
  }
  return result.reverse();
};

/**
 * 根据图片后缀获取对应的icon
 * @param suffix
 * @returns
 */
export const getSuffix = (suffix: string) => {
  if (['png', 'PNG', 'jpg', 'JPG', 'JPEG', 'jpeg'].includes(suffix)) {
    return 'icon-icon-tupian';
  }
  if (['pdf', 'PDF'].includes(suffix)) {
    return 'icon-a-icon-PDF';
  }
  if (['doc', 'DOC', 'docx', 'DOCX'].includes(suffix)) {
    return 'icon-icon-Word';
  }
  if (['xlsx', 'XLSX', 'XLS', 'xls'].includes(suffix)) {
    return 'icon-icon-Excel';
  }
  if (['rar', 'RAR'].includes(suffix)) {
    return 'icon-icon-rar';
  }
  if (['zip', 'ZIP'].includes(suffix)) {
    return 'icon-icon-ZIP';
  }
  return 'icon-a-icon-PDF';
};

const { edit } = PageTypeInfo;

/** 获取导入页面的返回页面URL */
export const getImportReturnUrl = (importType: '1' | '2' | '4') => {
  const returnUrl = {
    /** 供应链商户导入-商户列表 */
    '1': SccmRouteMaps.sccmManagement,
    /** 供应链采购产品导入-采购产品列表 */
    '2': SccmRouteMaps.sccmProdct,
    /** 导入清单-清单分析编辑 */
    '4': LCARouteMaps.lcaModelInfo.replace(':pageTypeInfo', `${edit}`),
  };
  return returnUrl?.[importType] || '';
};

export const findUnitLabel = (
  unit: string[],
  unitDict: {
    value: string;
    label: string;
    children: { value: string; label: string }[];
  }[],
) => {
  for (let i = 0; i < unitDict.length; i += 1) {
    if (unit[0] === unitDict[i].value) {
      for (let j = 0; j < unitDict[i].children.length; j += 1) {
        if (unit[1] === unitDict[i].children[j].value) {
          return unitDict[i].children[j].label;
        }
      }
    }
  }
  return '';
};

export const getUnitWholePath = (
  unitVal: string,
  unitDict: {
    value: string;
    label: string;
    children: { value: string; label: string }[];
  }[],
) => {
  for (let i = 0; i < unitDict.length; i += 1) {
    for (let j = 0; j < unitDict[i].children.length; j += 1) {
      if (unitVal === unitDict[i].children[j].value) {
        return [unitDict[i], unitDict[i].children[j]];
      }
    }
  }
  return [];
};

export const downloadFileFromBlob = (
  response: AxiosResponse<Blob>,
  filename: string = '',
) => {
  const contentDisposition = response.headers['content-disposition'];

  if (contentDisposition) {
    // 匹配 filename="..."
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1]);
    } else {
      // 匹配 filename*=UTF-8''...
      const encodedMatch = contentDisposition.match(/filename\*=UTF-8''(.+)/);
      if (encodedMatch && encodedMatch[1]) {
        filename = decodeURIComponent(encodedMatch[1]);
      }
    }
  }

  saveAs(response.data, filename);
};

export const checkIsMobile = () => {
  const md = new MobileDetect(window.navigator.userAgent);

  // md.mobile() 返回手机或平板
  // md.phone() 只返回手机
  // md.tablet() 只返回平板
  return md.phone() !== null;
};

// 使用jsonrepair修复JSON解析函数
export const tryParseJSON = (content: string) => {
  try {
    // 尝试找到JSON对象
    if (content.startsWith('```json')) {
      content = content.slice(7);
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3);
    }
    // const jsonMatch = content.match(/\{[\s\S]*\}/);
    const repairedJson = jsonrepair(content);
    return JSON.parse(repairedJson);
  } catch (error) {
    return null;
  }
};

export const getTemplateFile = (params: { dictTypes: string }) =>
  request<{
    data: {
      [TempType: string]: {
        relatedValue: string;
        dictValue: string;
        dictLabel: string;
      }[];
    };
  }>({
    method: 'get',
    url: '/management/system/enum/listALLByDictTypeBatch',
    params,
  });
export const getFileIcon = (name: string) => {
  const lower = name.toLowerCase(); // 忽略大小写

  if (lower.endsWith('.pdf')) {
    return 'icon-icon-pdf';
  }

  if (lower.endsWith('png')) {
    return 'icon-icon-png';
  }

  if (
    lower.endsWith('jpg') ||
    lower.endsWith('jpng') ||
    lower.endsWith('jpeg')
  ) {
    return 'icon-icon-jpg';
  }
  if (
    lower.endsWith('.doc') ||
    lower.endsWith('.docx') ||
    lower.endsWith('.dot') ||
    lower.endsWith('.dotx')
  ) {
    return 'icon-icon-word';
  }

  if (
    lower.endsWith('.xls') ||
    lower.endsWith('.xlsx') ||
    lower.endsWith('.xlsm') ||
    lower.endsWith('.xlt') ||
    lower.endsWith('.xltx') ||
    lower.endsWith('.csv')
  ) {
    return 'icon-icon-excel2';
  }

  return '';
};

/**
 * 检查用户公司类型，如果是类型 '2' 则跳转到产品碳足迹核算页面
 * @param history - React Router 的 history 对象
 * @returns 如果跳转成功返回 true，否则返回 false
 */
export const checkCompanyTypeAndRedirect = async (
  history: RouterHistory,
): Promise<boolean> => {
  try {
    const queryResponse = await request<{
      code: number;
      msg: string;
      data: {
        companyId: number;
        companyType: string;
        companyName: string;
        userName: string;
        userId: number;
        productList: {
          productSource: string;
          openProduct: string;
        }[];
      };
      lang: null;
    }>({
      method: 'get',
      url: '/management/user/queryUserCompany',
    });

    // 如果 companyType 为 '2'，则跳转到产品碳足迹核算页面
    if (
      queryResponse.data?.code === 200 &&
      queryResponse.data?.data?.companyType === '2'
    ) {
      let jumpUrl: string =
        RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount;

      const firstOpenProduct = queryResponse.data?.data?.productList?.find(
        item => item.openProduct === '1',
      );

      switch (firstOpenProduct?.productSource) {
        case ProductSource.product:
          jumpUrl = RouteMapsCorbonFootprint3.carbonFootprint3FootprintAccount;
          break;
        case ProductSource.enterprise:
          jumpUrl = RouteMaps.enterpriseCarbonAccountingcarbonDischarge;
          break;
        default:
          break;
      }
      await sleep(2000);
      history.push(jumpUrl);
      return true;
    }
    return false;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('查询用户公司信息失败', error);
    // 接口调用失败不影响正常流程
    return false;
  }
};

export const generateUUID = async () => {
  try {
    // 加载库
    const fpPromise = FingerprintJS.load();

    // 获取结果
    const fp = await fpPromise;
    const result = await fp.get();

    const { visitorId } = result;
    return visitorId;
  } catch (err) {
    if (crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0;
      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
};
