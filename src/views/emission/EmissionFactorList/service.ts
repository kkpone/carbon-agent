import { request } from '@/api/request';

export const getGroupList = () =>
  request<{ data: { id: string; groupName: string }[] }>({
    url: '/management/system/company/groupList',
  });

export const addGroup = data =>
  request({
    method: 'post',
    url: '/management/system/company/addGroup',
    data,
  });

export const editGroup = data =>
  request({
    method: 'post',
    url: '/management/system/company/editGroup',
    data,
  });

export const deleteGroup = data =>
  request({
    method: 'post',
    url: '/management/system/company/deleteGroup',
    data,
  });

export const getFactorList = params =>
  request<{ total: number; rows: Record<string, any>[] }>({
    url: '/management/system/company/listSaas',
    params,
  });

export const deleteFactor = params =>
  request({
    method: 'delete',
    url: '/management/system/company/remove',
    params,
  });

export const deCollectFactor = data =>
  request({
    method: 'post',
    url: '/management/system/collect/addCollect',
    data,
  });

export const editFactorGroup = data =>
  request({
    method: 'post',
    url: '/management/system/company/updateFactorGroup',
    data,
  });
