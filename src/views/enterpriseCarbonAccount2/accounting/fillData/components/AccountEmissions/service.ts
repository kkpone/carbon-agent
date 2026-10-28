import { request } from '@/api/request';

export const batchDownloadEmissionAttachments = data =>
  request<{ data: { url: string } }>({
    method: 'post',
    url: '/enterprise/source/downBatchFiles',
    data,
  });

export const batchDeleteEmissionAttachments = data =>
  request({
    method: 'post',
    url: '/enterprise/source/deleteBatchFiles',
    data,
  });

export const batchDeleteEmissionSource = data =>
  request({
    method: 'post',
    url: '/enterprise/source/deleted/batch',
    data,
  });

export const batchExportEmissionSource = data =>
  request<{ data: { path: string } }>({
    method: 'post',
    url: '/enterprise/source/export/template',
    data,
  });

export const batchChangeEmissionGroup = (data: {
  actionType: string;
  sourceIds: number[];
  targetGroupId: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/emissionGroup/batchChangeGroupAction',
    data,
  });

export const addEmissionGroup = (data: {
  computationId: number;
  ghgClassify: number;
  groupName: string;
}) =>
  request({
    method: 'post',
    url: '/enterprise/emissionGroup/add',
    data,
  });

export const editEmissionGroup = (data: {
  computationId: number;
  categoryId: number;
  groupName: string;
  id: number;
}) =>
  request({
    method: 'post',
    url: '/enterprise/emissionGroup/edit',
    data,
  });

export const deleteEmissionGroup = (data: { id: number }) =>
  request({
    method: 'post',
    url: '/enterprise/emissionGroup/delete',
    data,
  });
