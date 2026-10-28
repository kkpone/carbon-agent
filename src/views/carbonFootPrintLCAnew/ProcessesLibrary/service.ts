/*
 * @@description:
 */
import { IPageList, ResponseData, request } from '@src/api/request';

import { NewProcessLibrary, ProcessLibrary, Request } from './type';
/**
 * @description 过程库-列表
 */
export const getProcessLibraryList = (params: Request) =>
  request<ResponseData<IPageList<ProcessLibrary>>>({
    method: 'GET',
    url: '/lca2/processLib/page',
    params,
  });

/**
 * @description 过程库-新增
 */
export const postProcessLibraryAdd = (data: NewProcessLibrary) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/processLib/add',
    data,
  });

/**
 * @description 过程库-编辑
 */
export const postProcessLibraryEdit = (data: NewProcessLibrary) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/processLib/edit',
    data,
  });

/**
 * @description 过程库-复制
 */
export const postProcessLibraryCopy = (data: Pick<NewProcessLibrary, 'id'>) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/processLib/copy',
    data,
  });

/**
 * @description 过程库-详情-
 */
export const getNewProcessLibraryDetailApi = (params: { id: number }) =>
  request<ResponseData<NewProcessLibrary>>({
    method: 'GET',
    url: `/lca2/processLib/${params.id}`,
    params,
  });

/**
 * @description 过程库-删除
 */
export const postProcessLibraryDelete = (data: { id: number }) =>
  request<ResponseData<{ [key: string]: any }>>({
    method: 'POST',
    url: '/lca2/processLib/delete',
    data,
  });
