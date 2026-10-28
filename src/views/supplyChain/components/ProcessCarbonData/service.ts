import { request } from '@src/api/request';

import { AccountInfo } from '../../type';

export const editSnapshootAccount = (data: AccountInfo) =>
  request({
    method: 'post',
    url: '/footprint3/supplyAccount/self/edit',
    data,
  });
