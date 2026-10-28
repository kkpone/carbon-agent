/**
 * @file 通知更新文件
 */

import {
  getRollingNotices,
  getSaasModalNotices,
  messageReaded,
  noticeReaded,
  queryNoticeRedDot,
} from '@src/api/api';
import { JavaPagePayload } from '@src/api/types';
import { BroadcastTabType } from '@src/views/system/utils/type';
import { GlobalNoticesAndMessageAction } from '.';
import store from '..';

export const getNoticesAndMessagesCount = () =>
  queryNoticeRedDot().then(({ data }) => {
    store.dispatch<GlobalNoticesAndMessageAction>({
      type: 'UPDATE_MESSAGE_COUNT',
      payload: data?.data || {
        noticeCounts: 0,
        messageCounts: 0,
        unReadCounts: 0,
      },
    });
  });

const defaultPage: JavaPagePayload = { pageNum: 1, pageSize: 100 };

export const getScrollMessage = () =>
  getRollingNotices(defaultPage).then(({ data }) => {
    store.dispatch<GlobalNoticesAndMessageAction>({
      type: 'UPDATE_SCROLL_NOTICES',
      payload: data?.data?.rows || [],
    });
  });

export const getMessageAndNoticeData = async () => {
  getNoticesAndMessagesCount();
  getScrollMessage();
  getSaasModalNotices(defaultPage).then(({ data }) => {
    store.dispatch<GlobalNoticesAndMessageAction>({
      type: 'UPDATE_MODAL_NOTICES',
      payload: data?.data?.rows || [],
    });
  });
};

/** 标记当前数据为已读 */
export const readOneMessage = async (
  id: string | number,
  type: BroadcastTabType,
) => {
  const caculateResult = (num?: number) => {
    if (!num || Number.isNaN(Number(num)) || num <= 0) {
      return 0;
    }
    return num;
  };
  const p =
    type === BroadcastTabType.message ? messageReaded(id) : noticeReaded(id);
  return p.then(({ data }) => {
    if (data.code === 200) {
      const { messageAndNotices } = store.getState();
      store.dispatch<GlobalNoticesAndMessageAction>({
        type: 'UPDATE_MESSAGE_COUNT',
        payload: {
          noticeCounts: caculateResult(
            messageAndNotices.noticeCounts -
              (type === BroadcastTabType.notice ? 1 : 0),
          ),
          messageCounts: caculateResult(
            messageAndNotices.messageCounts -
              (type === BroadcastTabType.message ? 1 : 0),
          ),
          unReadCounts: caculateResult(messageAndNotices.unReadCounts - 1),
          userId: 0,
        },
      });
    } else {
      throw new Error('删除数据失败');
    }
  });
};
