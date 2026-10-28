import { listALLByDictTypeBatch } from '@src/api/api';
import { request } from '@src/api/request';
import { getSimpleProductList } from '@src/views/carbonFootprint3/FootprintAccount/service';

import {
  BatchAccountReferReq,
  BatchAccountTmp,
  BatchReferListReq,
  BatchTaskInfo,
  ByReferVo,
  DictOption,
  ProductOption,
  ReferTreeNode,
} from './type';

export const getBatchTaskInfo = (id: number) =>
  request<{ data: BatchTaskInfo }>({
    method: 'get',
    url: '/footprint3/batchTask/info',
    params: { id },
  });

export const getReferTree = (id: number) =>
  request<{ data: ReferTreeNode[] }>({
    method: 'get',
    url: '/footprint3/batchTask/referTree',
    params: { id },
  });

export const getAccountResults = (id: number) =>
  request<{ data: BatchAccountTmp[] }>({
    method: 'get',
    url: '/footprint3/batchTask/accountResults',
    params: { id },
  });

export const getAccountTmpList = (id: number) =>
  request<{ data: BatchAccountTmp[] }>({
    method: 'get',
    url: '/footprint3/batchTask/accountTmpList',
    params: { id },
  });

export const saveBatchAccount = (data: BatchAccountTmp) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/saveAccount',
    data,
  });

export const createBatchModel = (data: BatchAccountTmp) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/createModel',
    data,
  });

export const reparseBatchFile = (id: number) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/reparseFile',
    params: { id },
  });

export const cancelBatchParse = (id: number) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchTask/cancelParse',
    params: { id },
  });

export const addBatchRefer = (data: BatchAccountReferReq) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchRefer/add',
    data,
  });

export const changeBatchReferToT1 = (data: BatchAccountReferReq) =>
  request({
    method: 'post',
    url: '/footprint3/batchRefer/changeToT1',
    data,
  });

export const deleteBatchReferTree = (data: BatchAccountReferReq) =>
  request({
    method: 'post',
    url: '/footprint3/batchRefer/deleteTree',
    data,
  });

export const moveBatchReferTree = (data: BatchAccountReferReq) =>
  request({
    method: 'post',
    url: '/footprint3/batchRefer/moveTree',
    data,
  });

export const copyBatchReferTree = (data: BatchAccountReferReq) =>
  request<{ data: number }>({
    method: 'post',
    url: '/footprint3/batchRefer/copyTree',
    data,
  });

export const getBatchReferList = (params: BatchReferListReq) =>
  request<{ data: ByReferVo[] }>({
    method: 'post',
    url: '/footprint3/batchRefer/byReferList',
    params,
  });

export const getBatchProductOptions = async (): Promise<ProductOption[]> => {
  const { data } = await getSimpleProductList();
  return data.data || [];
};

export const getBatchUnitOptions = async (): Promise<DictOption[]> => {
  const { data } = await listALLByDictTypeBatch<{ factorUnitM: DictOption[] }>({
    dictTypes: 'factorUnitM',
  });
  return data.data.factorUnitM || [];
};
