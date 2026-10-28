import { request } from '@src/api/request';

export const getBtnSettings = () =>
  request<{ data: Record<string, number> }>({
    method: 'get',
    url: '/carbonAccount/style/config/detail',
  });

export const editBtnSettings = (data: Record<string, number>) =>
  request({
    method: 'post',
    url: '/carbonAccount/style/config/edit',
    data,
  });
