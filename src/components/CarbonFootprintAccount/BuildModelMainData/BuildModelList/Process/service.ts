import { request } from '@src/api/request';
import { AxiosResponse } from 'axios';

import { ProcessAccounMenu } from './type';

/** 过程核算 - 列表 - 菜单初始化 */
export function getProcessProcessMenu(params: Record<string, any>) {
  return request<AxiosResponse<ProcessAccounMenu>>({
    method: 'get',
    url: `footprint3/account/menu`,
    params,
  });
}

/** 过程核算 - 子级 -  菜单初始化 */
export function postProcessNextMenu(data: ProcessAccounMenu) {
  return request<AxiosResponse<ProcessAccounMenu[]>>({
    method: 'post',
    url: `footprint3/account/nextMenu`,
    data,
  });
}
