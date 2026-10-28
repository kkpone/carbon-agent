import { request } from '@/api/request';

import { AccountSetting } from './type';

export const getAccountingSetting = () =>
  request<{ data: AccountSetting }>({
    method: 'get',
    url: '/enterprise/fiscal/year/info',
  });

export const editAccountSetting = (data: Omit<AccountSetting, 'yearList'>) =>
  request({
    method: 'post',
    url: '/enterprise/fiscal/year/edit',
    data,
  });
