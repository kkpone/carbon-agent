/*
 * @@description:
 * @Author: hanguoqiang guoqiang@carbonstop.net
 * @Date: 2023-02-24 10:40:34
 * @LastEditors: hanguoqiang guoqiang@carbonstop.net
 * @LastEditTime: 2023-02-24 14:18:36
 */
import { request } from '@src/api/request';

import { AccountLifeCycle, ProcessEveryList } from './type';

export const getAccountView = (params: { id: number | string }) =>
  request<{ data: AccountLifeCycle }>({
    method: 'get',
    url: '/footprint3/account/accountView',
    params,
  });

export const getProcessAccountView = (params: { id: number | string }) =>
  request<{ data: ProcessEveryList }>({
    method: 'get',
    url: '/footprint3/account/accountView',
    params,
  });
