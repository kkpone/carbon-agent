import I18N from '@src/lang/I18N';

import { PostMessageType } from './constant';

export enum BroadcastTabType {
  'notice',
  'message',
}

export const BroadcastTabTypeTEXTMap = () => ({
  [BroadcastTabType.notice]: I18N.system.notice,
  [BroadcastTabType.message]: I18N.system.message,
});

/* 数据权限  */
export enum DataPermissionValue {
  'OPEN_WRITE' = '公开读写',
  'OPEN_READ' = '公开只读',
  'DEPART_WRITE' = '部门公开',
  'PRIVATE' = '私有数据',
  '公开读写' = 'OPEN_WRITE',
  '公开只读' = 'OPEN_READ',
  '部门公开' = 'DEPART_WRITE',
  '私有数据' = 'PRIVATE',
}
export enum BroadcastDetailType {
  'notice' = 'notice',
  'message' = 'message',
}

export type NoticeReadAllOnPostMessage = {
  type: PostMessageType;
  readAllTab: BroadcastTabType;
};
