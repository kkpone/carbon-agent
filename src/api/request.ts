import { parseMonitorJson } from '@src/views/system/carbonAgent/monitor/json';
import { SET_COMPANY_USER_INFO } from '@src/store/actionTypes';
import { isAgentBusinessDenial } from '@src/views/system/carbonAgent/team/errors';
/*
 * @@description:
 * @Author: 李星辰 xingchen@carbonstop.net
 * @Date: 2023-04-04 11:51:47
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-10 19:07:18
 */
/**
 * @file 全局api处理
 */
import I18N from '@src/lang/I18N';
import {
  stripLocalePrefixFromPathname,
  withCurrentLocalePrefix,
} from '@src/router/localePath';
import { RouteMaps } from '@src/router/route-paths';
import store from '@src/store';
// import { DROP_COMPANY_ID } from '@src/store/actionTypes';
import { deCrypt, logout } from '@src/utils';
import { Toast } from '@src/utils/Toast';
import axios, { AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { cloneDeep, isArray, isNil } from 'lodash-es';

import { globalModal } from './components/ComfirmModal';
import debounceRequest from './debounceRequest';
import { RequestOptions } from './types';
import { getToken } from '../utils/cookie';
import {
  handleFeishuAuthFailure,
  getLoginStorage,
  isFeishuVerified,
} from '../utils/feishuSession';
import VerifyUtils from '../utils/verifty';
import {
  dispatchShareNotEditEvent,
  dispatchShareUnauthEvent,
  isShareEditUrlSearch,
  isShareNotEditResponse,
  isShareUnauthorizedResponse,
} from '../views/carbonFootprint3/shareEditPermission';

export interface ResponseData<T = any> {
  // 退出才会有
  detail?: string;
  code: number;
  data: T;
  // 可能返回error
  status: string;
  msg: string;
  responseData?: string;
}

const AGENT_SHARE_PATH_PREFIX = RouteMaps.carbonAgentShare.replace(
  ':shareId',
  '',
);

const isReadonlySharePath = (pathname: string) =>
  [
    RouteMaps.enterpriseCarbonAccountingcarbonDischargeShare,
    RouteMaps.enterpriseCarbonAccountingAccountingShare,
  ].includes(pathname as RouteMaps) ||
  pathname.startsWith(AGENT_SHARE_PATH_PREFIX);

/** Legacy-compatible paged response used by the migrated CBAM services. */
export interface IPageList<T> {
  rows?: T[];
  records?: T[];
  list?: T[];
  total?: number;
  [key: string]: any;
}

// 添加请求拦截器
axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 当前飞书身份尚未核验时阻止遗留业务请求，不能退回匿名或沿用旧账号。
    if (!isFeishuVerified()) {
      return Promise.reject(
        new axios.Cancel('Feishu identity verification pending'),
      );
    }
    const agentRequest =
      config.url?.startsWith('/management/agent/') ||
      config.url?.startsWith('/ai/agent/');
    if (agentRequest) {
      const saved = getLoginStorage().getItem(SET_COMPANY_USER_INFO);
      if (saved && JSON.parse(saved).access_token !== getToken())
        return Promise.reject(new axios.Cancel('Workspace identity changed'));
    }
    // 获取用户token，用于校验
    if (getToken()) {
      // JWT
      const token = `${getToken()}`;
      config.headers = { ...config.headers, Authorization: token };
    }
    // 开发模式开启私有网络请求允许 chrome 开发人员说不需要前端填写这个 header
    // if (process.env.NODE_ENV === 'development') {
    //   config.headers = {
    //     ...config.headers,
    //     'Access-Control-Request-Private-Network': true,
    //   };
    // }
    return config;
  },
  (error: AxiosError) => {
    Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (res: AxiosResponse<ResponseData>) => {
    const response = { ...res };
    const agentRequest =
      res.config.url?.startsWith('/management/agent/') ||
      res.config.url?.startsWith('/ai/agent/');
    // Ignore responses from an old workspace before generic auth errors can clear the new login.
    if (
      agentRequest &&
      res.config.headers?.Authorization &&
      res.config.headers.Authorization !== getToken()
    )
      return Promise.reject(new axios.Cancel('Stale workspace response'));

    if (response.status === 200 && response.data instanceof Blob) {
      return Promise.resolve(response);
    }

    if (
      typeof response.data?.responseData === 'string' &&
      response.data.responseData.length > 0
    ) {
      let deCryptoDataString = deCrypt<string>(response.data.responseData);
      try {
        deCryptoDataString =
          agentRequest ||
          response.config.url?.includes('/auth/token/agentWebLogin') ||
          response.config.url?.includes('/auth/token/agent-sso/exchange') ||
          response.config.url?.includes('/auth/token/switchoverCompany') ||
          response.config.url?.includes('/auth/token/auth/checkLogin')
            ? (parseMonitorJson(
                deCryptoDataString,
              ) as typeof deCryptoDataString)
            : JSON.parse(deCryptoDataString);
        // eslint-disable-next-line
      } catch {}
      response.data = {
        ...response.data,
        // @ts-ignore
        ...deCryptoDataString,
      };
    }
    const responseCode = response?.data?.code || 200;
    if (
      (response.config.url?.startsWith('/management/agent/') ||
        response.config.url?.startsWith('/ai/agent/')) &&
      isAgentBusinessDenial(response.data)
    ) {
      return Promise.reject(response);
    }
    if (handleFeishuAuthFailure(responseCode)) {
      return Promise.reject(response);
    }
    const silentResponseError =
      (response.config as RequestOptions).silentResponseError === true;

    if (responseCode === 500 || responseCode === 601) {
      if (!silentResponseError) {
        VerifyUtils.Toast(500, response.data.msg || response.data.data);
      }
      return Promise.reject(response);
    }
    if (responseCode === 20001) {
      return Promise.resolve();
    }
    if (responseCode === 1003) {
      return Promise.reject();
    }
    // const jumpToAccount = () => {
    //   store.dispatch({ type: DROP_COMPANY_ID });

    //   setTimeout(() => {
    //     window.location.href = RouteMaps.account;
    //   });
    // };

    // 441 分享 token 失效 / 链接过期 / 快照不匹配，重新返回分享失效页面
    if (isShareUnauthorizedResponse(response)) {
      const locationPathname = window.location.pathname;
      const locationSearch = window.location.search;
      const searchParams = new URLSearchParams(locationSearch);
      searchParams.set('expireUrl', '1');
      const newPathWithParams = `${locationPathname}?${searchParams.toString()}`;
      history.pushState({}, '', newPathWithParams);
      dispatchShareUnauthEvent();
      return Promise.reject(response);
    }

    /**
     * 分享编辑权限失效：不能进入分享失效页，也不能清除 shareAuth。
     * 通知分享页切换只读，后续查看接口仍继续携带 snapFlag=8 + shareAuth。
     */
    if (isShareNotEditResponse(response) && isShareEditUrlSearch()) {
      dispatchShareNotEditEvent();
      Toast('warn', I18N.carbonFootprint3.shareFirstCompletionReadonly);
      return Promise.reject(response);
    }

    // 407 访问受限，组织被禁用
    if (responseCode === 407) {
      globalModal({
        content: I18N.api.youAreInThisCompany,
        code: responseCode,
        onOk: () => {},
      });
      return Promise.reject(response);
    }
    // 406 访问受限，员工被禁用
    if (responseCode === 406) {
      globalModal({
        content: I18N.api.theCurrentOrganizations,
        code: responseCode,
        onOk: () => {},
      });
      return Promise.reject(response);
    }
    // 408 访问受限，员工被删除
    if (responseCode === 408) {
      globalModal({
        content: I18N.api.youAreNoLongerTheOneWhoShould,
        code: responseCode,
        onOk: () => {},
      });
      return Promise.reject(response);
    }
    /** 其它地方登录 */
    if (responseCode === 410) {
      globalModal({
        content: I18N.api.yourAccountIsOn,
        code: responseCode,
        onOk: () => {
          logout();
        },
      });
      return Promise.reject(response);
    }

    // 403 访问受限，授权过期
    if (responseCode === 403 || responseCode === 401) {
      const routePathname = stripLocalePrefixFromPathname(location.pathname);

      if (
        isReadonlySharePath(routePathname) ||
        routePathname === RouteMaps.carbonAgentSsoCallback
      ) {
        return Promise.reject(response);
      }
      logout();
      // globalModal({
      //   title: '系统提示',
      //   content: '登录状态异常',
      //   okText: '重新登录',
      //   onOk() {
      //     logout();
      //   },
      //   code: responseCode,
      // });
      return Promise.reject(response);
    }
    if (responseCode === 201) {
      if (response?.data?.msg && !silentResponseError) {
        Toast('warn', response.data.msg);
      }
      return Promise.reject(response);
    }
    if (response?.data?.code === 605) {
      window.location.href = withCurrentLocalePrefix(RouteMaps.NoOnline);
    }

    // 退出登录 接口返回的信息比较特殊 根据返回的参数进行拦截跳转
    // if (response.data.detail) {
    //   if (response.data.detail === 'Successfully logged out.') {
    //     return Promise.resolve(response);
    //   }
    // }
    if (response?.data?.code && response?.data?.code !== 200) {
      if (response?.data?.msg && !silentResponseError) {
        Toast('warn', response.data.msg);
      }
      return Promise.reject(response);
    }

    const targetData = cloneDeep(response.data);

    const { pageNum, page, current, pageSize, size } =
      response?.config?.params || {};
    // 页码可能出现的字段情况
    const pageNumber = pageNum || page || current;
    // 每页条数可能出现的字段情况
    const pageSizeS = pageSize || size;
    // 判断params中页码是否存在
    const hasPageParams = !isNil(pageNumber) && !isNil(pageSizeS);

    /**
     * 请求成功的请况下处理data数据，主要适用于后端返回的数据结构为
     * {code: 200, data: { rows: [], total: 0 }} 或 { code: 200, data: { list: [], total: 0 }} 或
     * { code: 200, data: { records: [], total: 0}} 或 { code: 200, data: { tree: [], total: 0 }}
     * 转换成 { code: 200, data: { success: true, rows: [], total: 0 }}
     * data.data的情况不做处理，没有页码的情况也不做处理
     * 适用于 procomponents 中的 table 组件, x-render 中的 table 组件
     */

    // 返回的列表数组可能出现的情况
    const {
      rows,
      list,
      records,
      tree,
      data,
      total = 0,
    } = response?.data.data || {};

    const responseData = rows || list || records || tree;
    // 判断返回的列表是否存在且为数组
    const hasResponseListData = !isNil(responseData) && isArray(responseData);

    /** 返回的页码不为空 且 列表数据不为空（rows、list、records、tree）且 data.data为空的情况下
     * 将data.rows、data.list、data.records、data.tree 赋值给data.data
     * 并给每条数据增加一个序号 allIndex
     */
    if (hasPageParams && hasResponseListData && isNil(data)) {
      const columnsIndexNumber = (pageNumber - 1) * pageSizeS;

      const resultData =
        responseData.map((item, index) => ({
          ...item,
          allIndex: columnsIndexNumber + index + 1,
        })) || [];

      targetData.data = {
        ...targetData.data,
        list: resultData,
        data: resultData,
        rows: resultData,
        total,
        success: true,
      };
    }
    return Promise.resolve({ ...response, data: targetData });
  },
  error => {
    const url = error?.config?.url || '';
    const agentRequest =
      url.startsWith('/management/agent/') || url.startsWith('/ai/agent/');
    if (agentRequest && error?.config?.headers?.Authorization !== getToken())
      return Promise.reject(new axios.Cancel('Stale workspace response'));
    if (agentRequest && isAgentBusinessDenial(error?.response?.data))
      return Promise.reject(error);
    if (handleFeishuAuthFailure(error?.response?.status)) {
      return Promise.reject(error);
    }
    // eslint-disable-next-line no-console
    console.warn('axios error: ', error);
    return Promise.reject(error);
  },
);
// 不需要 companyId的URL
const notCompanyIdURL = [
  '/management/agent/team/',
  '/management/agent/points/orders',
  '/role/delete/',
  'department/deleteByDepartmentId',
  'company/addCompany',
  `/file/file/uploadImg`,
  `/file/file/uploadFileAuth`,
  `/auth/token/addCompany`,
  `/auth/token/agent-sso/exchange`,
  `/supply/code/gain`,
  `/category/change/sort`,
  `/enterprise/model/change/sort`,
  'management/dataPermission/editBatch',
  '/factor/queryFactorListAuthSearch',
  '/modelEmission/delete',
  '/account/summaryRateUpdate',
  '/model/summaryRateUpdate',
  'supply/goods/adds',
  '/management/job/base/user/function/edit',
  '/footprint3/chat/getWebInfoData',
  '/footprint3/accountEmission/aiModelAndAll',
  '/activity/getAiDatalist',
  '/ai/agent/internal/workspace/files/',
  '/ai/agent/messages/',
  '/ai/agent/issue-feedback',
  '/ai/agent/context-insight/dismiss',
  '/ai/agent/certificate/',
  '/ai/agent/enterprise-data/',
  '/management/agent/tracking/events',
];
const notCompanyIdURLRegExp = [
  /^\/ai\/agent\/sessions\/[^/]+\/share$/,
  /^\/management\/api\/ccdb\/v1\/factors\/[^/]+\/shares$/,
  /^\/management\/api\/ccdb\/v1\/sessions\/[^/]+\/factor-refs$/,
];
const culCompanyIdFn = (url: string) =>
  !notCompanyIdURL.some(item => url.indexOf(item) >= 0) &&
  !notCompanyIdURLRegExp.some(item => item.test(url));

export const baseURL = process.env.REACT_APP_API_URL;
export const baseUrl = process.env.REACT_APP_API_URL;

export // 统一发起请求的函数 默认为 java
function request<T>(options: RequestOptions) {
  // 角色删除接口 不需要 companyId
  if (
    options.method?.toUpperCase() === 'POST' &&
    options.url &&
    culCompanyIdFn(options.url) &&
    !options.data?.companyId
  ) {
    const dataFormat = Object.prototype.toString.call(options?.data);
    if (!dataFormat.includes('FormData')) {
      options.data = {
        ...options.data,
        companyId:
          Number(store.getState().companyUserInfo.userInfo?.companyId) || 0,
      };
    }
  }

  const { debounced, ...restOptions } = options;
  if (debounced) {
    return debounceRequest<T>({
      baseURL: process.env.REACT_APP_API_URL,
      ...restOptions,
    });
  }
  return axios.request<T>({
    baseURL: process.env.REACT_APP_API_URL,
    ...options,
  });
}
export function requestPython<T>(options: AxiosRequestConfig) {
  return axios.request<T>({
    ...options,
    baseURL: `${process.env.REACT_APP_API_URL_PYTHON}/api/v1`,
  });
}

export function QBrequest<T>(options: AxiosRequestConfig) {
  return axios.request<T>({
    ...options,
    baseURL: `${process.env.REACT_APP_API_URL}/reprocessedplastic`,
  });
}

export function QBSAASrequest<T>(options: AxiosRequestConfig) {
  return axios.request<T>({
    ...options,
    baseURL: `${process.env.REACT_APP_API_URL}/authentication`,
  });
}
