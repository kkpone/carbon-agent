import type { UploadFile } from 'antd';

export enum BatchParseFileWay {
  /** 普通上传 */
  NORMAL = 0,
  /** 层级上传 */
  LEVEL = 1,
}

export type BatchFile = {
  name: string;
  size?: string;
  sizeUnit?: string;
  url: string;
  fileType?: string;
  level?: string;
};

export type BatchTaskPayload = {
  id?: number;
  productName?: string;
  userContent?: string;
  fileWay: BatchParseFileWay;
  dataFile: BatchFile[];
};

export type UploadResponseData = {
  name?: string;
  url?: string;
};

export type UploadResponse = {
  code?: number;
  msg?: string;
  data?: UploadResponseData | string;
};

export type BatchUploadFile = UploadFile<UploadResponse> & {
  /** 层级上传时对应 Tn 的 n */
  level?: number;
};

export type LevelItem = {
  level: number;
  name: string;
};
