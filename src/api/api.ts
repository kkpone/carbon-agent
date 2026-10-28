/*
 * @@description:
 * @Author: qifeng qifeng@carbonstop.net
 * @Date: 2023-01-16 10:24:43
 * @LastEditors: qifeng qifeng@carbonstop.net
 * @LastEditTime: 2023-05-12 16:03:40
 */
/**
 * @file 基础框架 能力接口
 * 不要将其它项目接口写在这个里面
 * 现在可能混有其它项目接口
 */
import { DataPermission } from '@src/sdks/java/management';
import { formatCityTree } from '@src/utils/dataFormat';
import { Dicts } from '@src/views/emission/Show/type';
import { parseMonitorJson } from '@src/views/system/carbonAgent/monitor/json';
import { AxiosRequestConfig } from 'axios';

import { BackendRes } from './carbon-international/types';
import { request, QBrequest } from './request';
import {
  BackendResponse,
  BroadcastDetailData,
  Citys,
  DataPermissionsPayload,
  JavaPagePayload,
  JavaPageResponse,
  JavaPageResponseRowInData,
  ListNotice,
  NoticeRedDot,
  NoticesCenter,
  ProductPermisions,
  QuideList,
  SaasNotices,
  SwitchoverCompanyData,
} from './types';

const requestMRMOTION = request;

function apiPath() {
  return '/management';
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const logout_send = () =>
  request({
    url: '/auth/token/logout',
    method: 'GET',
  });

// 获取权限管理的tree信息
// 新增权限管理的权限

// 修改权限管理的权限
// 删除权限管理的节点

// 获取组织管理的列表数据

// 获取当前表格中列表的详细信息

// 修改当前企业的权限配置信息

// 城市
export const apiCity = (level = 3) =>
  request({
    url: `management/address/addressTree?level=${level}`,
  }).then(({ data }) => {
    // @ts-ignore
    const result = data?.data as unknown as Citys[];
    return formatCityTree(result);
  });

// 创建公司,同时自动赋角色和权限
/* 创建公司,同时自动赋角色和权限 */
// 切换企业 获取权限点    // 保证dispatch完成后再调整页面，防止出现异常退出（workIndex 会检测 SET_COMPANY_USER_INFO 数据，如果没有会退出）
export const switchoverCompany = (data: {
  companyId: string;
  userId: string | number;
  productId?: string;
  purpose?: 'TEAM_MANAGEMENT';
}): BackendRes<SwitchoverCompanyData> =>
  request({
    url: `/auth/token/switchoverCompany`,
    method: 'POST',
    data,
    ...(data.purpose === 'TEAM_MANAGEMENT'
      ? {
          silentResponseError: true,
          transformResponse: [
            (value: unknown) =>
              typeof value === 'string' ? parseMonitorJson(value) : value,
          ],
        }
      : {}),
  });
export const getProductPermisions = (data: {
  companyId: string | number;
  userId: string | number;
  productId: string;
}): BackendRes<ProductPermisions> =>
  request({
    url: `${apiPath()}/permission/getProductPermisions`,
    method: 'POST',
    data,
  });

// 切换企业 获取导航
export const apiQuideList = () =>
  request<BackendResponse<QuideList[]>>({
    url: `${apiPath()}/guide/guideList`,
    method: 'get',
  });
// 产品碳足迹——再生塑料

/* java 反馈文件上传 */
export const javaFileUpload = (file: File) => {
  const fd = new FormData();
  fd.append('file', file);
  return request<BackendResponse<{ name: string; url: string }>>({
    method: 'post',
    url: `/management/system/file/uploadImg`,
    data: fd,
  });
};
/* java 反馈文件上传 */
export const javaFileUploadMore = (
  file: File,
  onUploadProgress?: (progressEvent: any) => void,
) => {
  const fd = new FormData();
  fd.append('file', file);
  return request<BackendResponse<{ name: string; url: string }>>({
    method: 'post',
    url: `/file/file/uploadImg`,
    data: fd,
    onUploadProgress,
  });
};

// 新增 目标范围
//
// 树形结构图
// 新增LCA数据

export const modelMaterialsqueryFactor = (data: {
  name: string | number;
  year: string | number;
  countries: string | number | null;
  type?: string | number;
  pageNum: string | number | null | undefined;
  productId?: string | number | null | undefined;
  companyId: string | number | null | undefined;
  pageSize: string | number | null | undefined;
  factorType?: string;
  queryKey?: string;
}) =>
  QBrequest<BackendResponse<JavaPageResponse<Record<string, any>>>>({
    url: `/modelMaterials/queryFactor`,
    method: 'POST',
    data,
  });
// 编辑
// 单位内容   /* 获取字典所有的枚举值 */
/* 获取字典分类下面的所有枚举值 */
export const listALLByDictTypeData = (params: {
  dictType: string | number | null;
  labelValue: string | number | null;
}) =>
  requestMRMOTION<BackendResponse<Dicts[]>>({
    url: `/management/system/enum/listALLByDictTypeData`,
    method: 'GET',
    params,
  });
/* 获取boss 字典枚举值 不分页 */
export const listALLByDictTypeBatch = <T extends Record<string, Dicts[]>>({
  dictTypes,
  lang,
  ...axiosConfig
}: {
  dictTypes: string;
  lang?: string;
} & AxiosRequestConfig) => {
  let urlLang =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('lang')?.trim()
      : undefined;
  urlLang = urlLang === 'en-US' ? 'en' : 'zh';
  const finalLang = lang ?? urlLang;

  return requestMRMOTION<BackendResponse<T>>({
    url: `/management/system/enum/listALLByDictTypeBatch`,
    method: 'GET',
    params: { dictTypes, lang: finalLang },
    ...axiosConfig,
  });
};

interface countResFace {
  wasteWater?: string;
  importCod?: string;
  exitCod?: string;
  methaneRecycle?: string;
  methaneAmend?: string;
  methaneHumidifying?: string;
  amType?: string;
  huType?: string;
  userId?: string;
  companyId?: string;
}
export const countResult = (data: countResFace): BackendRes<any> =>
  request({
    url: `management/toolboxWasteWater/countResult`,
    method: 'post',
    data,
  });
interface hotWaterface {
  temperature: string;
  quality: string;
  heatDivisor: string;
  userId: string;
  companyId: string;
}
export const toolboxHotWater = (data: hotWaterface): BackendRes<any> =>
  request({
    url: `management/toolboxHotWater/countResult`,
    method: 'post',
    data,
  });
interface toolboxWasteWaterPage {
  page: number;
  size: number;
  userId: string;
  companyId: string | null;
}
export const toolboxWasteWater = (
  data: toolboxWasteWaterPage,
): BackendRes<any> =>
  request({
    url: `management/toolboxWasteWater/queryByPage`,
    method: 'post',
    data,
  });
export const toolboxHotWaterpage = (
  data: toolboxWasteWaterPage,
): BackendRes<any> =>
  request({
    url: `management/toolboxHotWater/queryByPage`,
    method: 'post',
    data,
  });

/** 数据权限管理列表接口，查询权限列表 */
export const dataPermissions = (params: DataPermissionsPayload) =>
  request<JavaPageResponseRowInData<DataPermission>>({
    url: `management/dataPermission/list`,
    params,
  });

/** 修改保存数据权限管理 */
export const editDataPermission = (data: DataPermission[]) =>
  request<BackendResponse<any>>({
    url: 'management/dataPermission/editBatch',
    data,
    method: 'post',
  });

/** saas通知详情查看接口  */
export const getNotice = (id: string | number) =>
  request<BackendResponse<BroadcastDetailData>>({
    url: `/management/system/notice/query_saas?id=${id}`,
  });
/** 查询消息详情-saas详情  */
export const getMessage = (id: string | number) =>
  request<BackendResponse<BroadcastDetailData>>({
    url: `/management/system/messageUser/query_saas?id=${id}`,
  });

/* saas通知单条读取操作处理接口 */
export const noticeReaded = (id: string | number) =>
  request<BackendResponse<any>>({
    method: 'post',
    url: `management/system/notice/noticeRead`,
    data: { id },
  });
/* saas通知单条读取操作处理接口 */
export const messageReaded = (id: string | number) =>
  request<BackendResponse<any>>({
    method: 'post',
    url: `management/system/messageUser/messageRead`,
    data: { id },
  });

/** 消息中心小红点-未读消息數量查詢 */
export const queryNoticeRedDot = () =>
  request<BackendResponse<NoticeRedDot>>({
    url: `management/system/notice/queryNoticeRedDot`,
  });
/** 消息中心小红点-未读消息數量查詢 */
export const allNoticeRead = (readType: number) =>
  request({
    url: `management/system/notice/allNoticeRead`,
    method: 'post',
    data: { readType },
  });
/** saas用户通知历史列表-readStatus 0 未读 1 已读 */
export const getNotices = (params: JavaPagePayload & { readStatus: string }) =>
  request<JavaPageResponseRowInData<ListNotice>>({
    url: `/management/system/notice/list_saas`,
    params,
  });
/** saas用户消息中心弹窗通知列表查询 所有的通知 带时间轴 */
export const getNoticesWithTime = (params: JavaPagePayload) =>
  request<JavaPageResponseRowInData<NoticesCenter>>({
    url: `management/system/notice/list_saasCneter`,
    params,
  });
/** saas用户弹窗通知查询 所有的消息 带时间轴 */
export const getMessagesWithTime = (params: JavaPagePayload) =>
  request<JavaPageResponseRowInData<NoticesCenter>>({
    url: `/management/system/messageUser/list_saasCneter`,
    params,
  });
/** saas用户弹窗通知查询 所有的消息 readStatus 0 未读 1 已读  */
export const getMessages = (params: JavaPagePayload & { readStatus: string }) =>
  request<JavaPageResponseRowInData<ListNotice>>({
    url: `management/system/messageUser/list_saas`,
    params,
  });
/** saas用户弹窗通知查询 */
export const getSaasModalNotices = (params: JavaPagePayload) =>
  request<JavaPageResponseRowInData<SaasNotices>>({
    url: `/management/system/notice/listPopupNotice`,
    params,
  });
/** saas用户滚动通知查询 */
export const getRollingNotices = (params: JavaPagePayload) =>
  request<JavaPageResponseRowInData<SaasNotices>>({
    url: `management/system/notice/listRollingNotice`,
    params,
  });

/** 文件上传oss */
export const ApiIploadOSS = (data: FormData) =>
  request({
    url: `file/file/uploadOSS`,
    method: 'post',
    data,
  });
