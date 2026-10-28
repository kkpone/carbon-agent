/**
 * @description: 产品碳足迹 AI 入口 - 接口
 */
import { request } from '@src/api/request';
import { md5 } from '@src/utils';

export interface AiDatalistItem {
  question: string;
  questionEn: string;
}

export interface AiDatalistResponse {
  code: number;
  msg: string;
  data: AiDatalistItem[];
  lang: string | null;
}

export interface GetWebInfoDataResult {
  accountId: number;
  productId: number;
}

export interface AccountEmissionResponse {
  code: number;
  msg: string;
  data: GetWebInfoDataResult;
  lang: string | null;
}

export interface FactorScopeOption {
  label: string;
  value: number | string;
}

type RawFactorScopeOption = Partial<FactorScopeOption> & {
  id?: number | string;
  name?: string;
};

type FactorScopesResponseBody = {
  code: number;
  data?: RawFactorScopeOption[];
  lang?: string | null;
  msg: string;
};

/** 获取 AI 快捷提示列表 */
export function getAiDatalist(lang: string) {
  return request<AiDatalistResponse>({
    url: `footprint3/chat/getAiDatalist?lang=${lang}`,
    method: 'GET',
  });
}

/** 全局因子偏好 list 为空时，兜底拉取核算侧因子偏好枚举 */
export async function getFactorScopes({ lang = 'zh' }: { lang?: string } = {}) {
  const response = await request<FactorScopesResponseBody>({
    method: 'GET',
    url: '/footprint3/account/factorScopes',
    params: { lang },
  });

  const body = response.data;
  const rows = Array.isArray(body?.data) ? body.data : [];

  return {
    code: body?.code,
    msg: body?.msg ?? '',
    lang: body?.lang ?? lang,
    data: rows.flatMap(item => {
      const value = item.value ?? item.id;
      const label = item.label || item.name || '';

      return value !== undefined && label
        ? [{ value: String(value), label: String(label) }]
        : [];
    }),
  };
}

export interface ChatAttachmentItem {
  name: string;
  url: string;
}

/** 产品碳足迹核算生命周期（与后端、官网一致） */
export enum FootprintAccountLifeCycle {
  HALF = 0,
  FULL = 1,
  CUSTOM = 2,
}

/** 官网 AI 附件上传（与 website 一致：uploadFileAuth） */
export async function uploadAiChatFile(file: File): Promise<string> {
  const key = 'web_djwh19sqsld8uy';
  const secret = 'sko2k1ls&32l9H@q1';
  const timestamp = Date.now().toString();
  const sign = md5(`${key}${secret}${timestamp}${key}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('key', key);
  formData.append('timestamp', timestamp);
  formData.append('sign', sign);

  const response = await request<{
    code: number;
    msg: string;
    data?: { url: string };
  }>({
    url: '/file/file/uploadFileAuth',
    method: 'POST',
    data: formData,
  });

  if (response.data?.code === 200 && response.data?.data?.url) {
    return response.data.data.url;
  }
  throw new Error(response.data?.msg || 'upload failed');
}

/** 产品碳足迹 - chat 解析（与官网 getWebInfoData 入参一致） */
export function postChatGetWebInfoData(params: {
  userKeys: string;
  userContent: string;
  scope: number;
  scopeValue?: string;
  factorPrefId?: number;
  factorScope?: number;
  fileList?: ChatAttachmentItem[];
  referList?: ChatAttachmentItem[];
  lang: string;
}) {
  return request<{
    code: number;
    msg: string;
    data?: {
      aiContent: string;
      userContent?: string;
      referId?: string | number | null;
    };
    lang: null;
  }>({
    url: '/footprint3/chat/getWebInfoData',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/** 产品碳足迹 - 生成核算（后续调用，返回 accountId、productId） */
export function postAiModelAndAll(params: {
  userKeys: string;
  userContent: string;
  productName: string;
  productDesc: string;
  accountUnitName: string;
  amount: string;
  scope: number;
  scopeValue?: string;
  factorPrefId?: number;
  factorScope?: number;
}) {
  return request<AccountEmissionResponse>({
    url: '/footprint3/accountEmission/aiModelAndAll',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}
