/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-07-18 09:40:39
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-03-09 15:26:11
 */
/**
 * usage：
 *   1. 引入 initStatistic ，出入后端统计地址，默认会统计 页面性能相关参数 FCP 等 （参考reportWebVitals）
 *   2. 在需要统计的地方使用 getRequest 发送统计数据
 * warnning：
 *   - 目前只测试 post 请求的 formdata 方式
 */
import axios from 'axios';

let request: (props: any) => Promise<any>;

type BeaconDataType = FormData | null;

type ParamsDataType = Record<string, string | number>;

const defaultConfig: Required<InitStatisticProps> = {
  baseUri: window.location.origin,
  defaultRequestMethod: 'POST',
  uId: '',
};

type BeanconRequestProps = {
  url?: string;
  data?: BeaconDataType | ParamsDataType;
};

const beanconRequest = ({ url, data }: BeanconRequestProps) => {
  const { baseUri } = defaultConfig;
  let reqUrl =
    (baseUri.endsWith('/') ? baseUri.slice(0, -1) : baseUri) + (url || '');

  if (!reqUrl) Promise.reject(new Error('请输入请求路径'));
  if (!window.navigator.sendBeacon)
    Promise.reject(new Error('当前浏览器不支持 sendBeacon'));

  let search = new URLSearchParams();
  let postData: Blob | FormData | null =
    defaultConfig.defaultRequestMethod === 'POST' && data instanceof FormData
      ? data
      : null;

  // 如果是post请求，数据格式改为formData
  if (
    defaultConfig.defaultRequestMethod === 'POST' &&
    data &&
    !(data instanceof FormData)
  ) {
    const fd = new FormData();
    Object.keys(data).forEach(k => {
      const d = (
        typeof data[k] === 'string' ? data[k] : JSON.stringify(data[k])
      ) as string;
      fd.append(k, d);
    });
    postData = fd;
  }

  if (
    defaultConfig.defaultRequestMethod === 'GET' &&
    !(data instanceof FormData) &&
    data
  ) {
    const strData = {};
    Object.keys(data).forEach(k => {
      strData[k] = JSON.stringify(data[k]);
    });
    search = new URLSearchParams(strData);
    reqUrl = `${reqUrl}?${search.toString()}`;
  }

  const result = window.navigator.sendBeacon(reqUrl, postData || null);
  return new Promise(resolve => {
    resolve({ data: result });
  });
};

const requestInit = () => {
  if (request) return request;
  if ('sendBeacon' in window.navigator) {
    // eslint-disable-next-line no-return-assign
    return (request = beanconRequest);
  }
  // eslint-disable-next-line no-return-assign
  return (request = axios.request);
};

type InitStatisticProps = {
  /** 接口请求路径 */
  baseUri?: string;
  /** 默认统计接口的请求方式 */
  defaultRequestMethod?: 'GET' | 'POST';
  /**  当前窗口的 uid */
  uId?: string;
};

/**
 * 数据统计接口， URL 为请求的path，默认的地址在 initStatistic 时传入
 */
export const getStatisticsRequest = requestInit;
