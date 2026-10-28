/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2022-10-20 14:34:59
 * @LastEditors: 李星辰 xingchen@carbonstop.net
 * @LastEditTime: 2023-05-16 21:28:55
 */
import { request } from '@api/request';
import { AxiosResponse } from '@src/api/types';

import { OpreationBack } from '../../utils/type';

/**
 * 排放核算-第二步-第二步排放源详情
 */
export function apiSourceInfo(params: {
  fromType?: string;
  id?: string;
  computationId?: string;
  sessionId?: string;
  shareId?: string;
}) {
  return request<AxiosResponse<any>>({
    method: 'GET',
    url: `/enterprise/source/info/${params.id}`,
    params: {
      sessionId: params.sessionId,
      shareId: params.shareId,
    },
  });
}

export const getTempSourceInfo = (id?: string) =>
  request({
    url: `/enterprise/source/temp/info/${id}`,
  });

/**
 * 排放核算-第二步-第二步排放源详情
 */
export function apiSourceInfoByShare(params: {
  fromType?: string;
  id?: string;
  computationId?: string;
  companyId?: string;
}) {
  return request<AxiosResponse<any>>({
    method: 'GET',
    url: `/enterprise/source/infoShare`,
    params,
  });
}
/**
 * 排放核算-第二步-第二步保存
 */
export function apiSourceAdd(data: any) {
  return request<AxiosResponse<OpreationBack>>({
    method: 'POST',
    url: `/enterprise/source/add`,
    data,
  });
}

/**
 * 排放核算-第二步-第二步保存
 */
export function apiSourceSteptwoEdit(data: any) {
  return request<AxiosResponse<OpreationBack>>({
    method: 'POST',
    url: `/enterprise/source/edit`,
    data,
  });
}

export const editTempSource = data =>
  request<AxiosResponse<OpreationBack>>({
    method: 'post',
    url: '/enterprise/source/temp/edit',
    data,
  });
export const batchDeleteAttachment = data =>
  request({
    method: 'post',
    url: '/enterprise/source/supportImg/batch',
    data,
  });

export const batchDownloadAttachment = data =>
  request<{ data: { url: string } }>({
    method: 'post',
    url: '/enterprise/source/upload/supportImg/batch',
    data,
  });
/**
 * 排放核算是否展示
 */
export function apiSourcePromptStatus() {
  return request<AxiosResponse<{ showPrompt: boolean }>>({
    method: 'GET',
    url: `/enterprise/source/prompt/status`,
  });
}
/**
 * 排放核算设置是否展示
 */
export function apiSourceCloseStatus() {
  return request<AxiosResponse<{ showPrompt: boolean }>>({
    method: 'GET',
    url: `/enterprise/source/close/prompt`,
  });
}

export const checkEmissionDataConsistency = data =>
  request<{ data: boolean }>({
    method: 'POST',
    url: `/enterprise/source/dataConsistencyCheck`,
    data,
  });

export const batchUploadAttachment = data =>
  request({
    method: 'POST',
    url: `/enterprise/source/update/supportImg/batch`,
    data,
  });

export const batchAssignSubmitter = data =>
  request({
    method: 'POST',
    url: `/enterprise/source/allot-appoint-user-batch`,
    data,
  });

export const batchDeleteSource = data =>
  request({
    method: 'POST',
    url: `/enterprise/source/deleted/batch`,
    data,
  });
