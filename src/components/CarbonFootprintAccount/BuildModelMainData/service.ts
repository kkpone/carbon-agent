import { request } from '@src/api/request';
import { MenuData } from '@src/components/MenuList/type';
import { AxiosResponse } from 'axios';

/** 获取菜单数据 */
export function getAccountMenu(params: Record<string, any>) {
  return request<AxiosResponse<MenuData[]>>({
    method: 'get',
    url: `footprint3/account/menu`,
    params,
  });
}
